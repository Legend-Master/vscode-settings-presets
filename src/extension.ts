import {
	window,
	workspace,
	commands,
	ExtensionContext,
	ConfigurationTarget,
} from 'vscode'

import { settingsPresetsProvider, Settings } from './settingsPresetsProvider'
import { PRESETS_SETTINGS_NAME, VIEW_ID } from './constants'

export function activate(context: ExtensionContext) {
	if (!workspace.workspaceFolders?.length) {
		return
	}

	let config = workspace.getConfiguration()
	let presets = { ...config.get<any>(PRESETS_SETTINGS_NAME) }

	const windowProvider = new settingsPresetsProvider()
	workspace.onDidChangeConfiguration((e) => {
		config = workspace.getConfiguration()
		if (e.affectsConfiguration(PRESETS_SETTINGS_NAME)) {
			windowProvider.refresh()
			presets = { ...config.get<any>(PRESETS_SETTINGS_NAME) }
		}
	})

	context.subscriptions.push(
		window.registerTreeDataProvider(VIEW_ID, windowProvider),

		commands.registerCommand('settingsPresets.addPreset', async function addPreset() {
			const presetName = await window.showInputBox({
				placeHolder: 'Preset name',
				ignoreFocusOut: true,
				validateInput: value => value ? null : 'Preset name required'
			})
			if (!presetName) {
				return
			}
			if (presetName in presets) {
				const rename = "Rename"
				const choice = await window.showWarningMessage(
					`Preset: ${presetName} already exists, do you want to replace it?`,
					rename,
					"Cancel"
				)
				if (choice === rename) {
					addPreset()
				}
				return
			}
			const settingsToSave: any = {}
			for (const key in config) {
				if (key === 'settingsPresets') {
					continue
				}
				const settings = config.inspect(key)
				const workspaceValue: any = settings?.workspaceValue
				if (workspaceValue === undefined) {
					continue
				}
				// launch and tasks are empty objects if not set
				if ((key === 'launch' || key === 'tasks') && Object.keys(workspaceValue).length === 0) {
					continue
				}
				settingsToSave[key] = workspaceValue
			}
			if (Object.keys(settingsToSave).length === 0) {
				window.showErrorMessage('No workspace setting available')
			} else {
				presets[presetName] = settingsToSave
				config.update(PRESETS_SETTINGS_NAME, presets, ConfigurationTarget.Global)
			}
		}),

		commands.registerCommand('settingsPresets.applyPreset', async (settingsItem: Settings) => {
			const presetName = settingsItem.label

			function updateSettings(settings: object, field: string[] = []) {
				for (const [configName, setting] of Object.entries(settings)) {
					const newField = [...field, configName]
					if (typeof setting === 'object') {
						updateSettings(setting, newField)
					}
					config.update(newField.join('.'), setting, ConfigurationTarget.Workspace)
				}
			}
			updateSettings(presets[presetName])

			const openSettings = 'Open Settings File'
			const choice = await window.showInformationMessage(`Preset: ${presetName} applied`, openSettings)
			if (choice === openSettings) {
				commands.executeCommand('workbench.action.openWorkspaceSettingsFile')
			}
		}),

		commands.registerCommand('settingsPresets.deletePreset', (settingsItem: Settings) => {
			delete presets[settingsItem.label]
			config.update(PRESETS_SETTINGS_NAME, presets, ConfigurationTarget.Global)
		})
	)
}

export function deactivate() {}
