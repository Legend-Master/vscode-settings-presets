import {
	window,
	workspace,
	commands,
	ExtensionContext,
	ConfigurationTarget,
} from 'vscode'

import { SettingsPresetsProvider, Settings } from './SettingsPresetsProvider'
import { PRESETS_SETTINGS_NAME, VIEW_ID } from './constants'

export function activate(context: ExtensionContext) {
	let config = workspace.getConfiguration()
	let presets = { ...config.get<any>(PRESETS_SETTINGS_NAME) }

	const presetsProvider = new SettingsPresetsProvider()
	const presetsTree = window.createTreeView(VIEW_ID, { treeDataProvider: presetsProvider })
	if (!workspace.workspaceFolders?.length) {
		presetsTree.message = 'You need to open a folder or workspace first to add and apply presets'
	}

	workspace.onDidChangeConfiguration((e) => {
		config = workspace.getConfiguration()
		if (e.affectsConfiguration(PRESETS_SETTINGS_NAME)) {
			presetsProvider.refresh()
			presets = { ...config.get<any>(PRESETS_SETTINGS_NAME) }
		}
	})

	async function choosePreset(): Promise<string | undefined> {
		const keys = Object.keys(presets)
		if (keys.length === 0) {
			window.showErrorMessage('You have not yet saved a preset')
			return
		}
		const choice = await window.showQuickPick(keys)
		if (choice !== undefined) {
			return choice
		}
	}

	context.subscriptions.push(
		presetsTree,

		commands.registerCommand('settingsPresets.addPreset', async function addPreset() {
			const presetName = await window.showInputBox({
				placeHolder: 'Preset name',
				ignoreFocusOut: true,
				validateInput: value => /[\S]+/.test(value) ? null : 'Preset name can\'t be empty/space only'
			})
			if (!presetName) {
				return
			}
			if (presetName in presets) {
				const rename = "Rename"
				const cancel = 'Cancel'
				const choice = await window.showWarningMessage(
					`Preset: ${presetName} already exists, do you want to replace it?`,
					"Override",
					rename,
					cancel
				)
				switch (choice) {
					case rename:
						addPreset()
					case cancel:
					case undefined:
						return
				}
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

		commands.registerCommand('settingsPresets.applyPreset', async (settingsItem?: Settings) => {
			const presetName = settingsItem?.label || await choosePreset()
			if (presetName === undefined) {
				return
			}

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

		commands.registerCommand('settingsPresets.deletePreset', async (settingsItem: Settings) => {
			const presetName = settingsItem?.label || await choosePreset()
			if (presetName === undefined) {
				return
			}

			const yes = 'Delete'
			const choice = await window.showWarningMessage(
				'',
				{
					modal: true,
					detail: `Are you sure you want to delete ${presetName}?`
				},
				yes,
			)
			if (choice === yes) {
				delete presets[presetName]
				config.update(PRESETS_SETTINGS_NAME, presets, ConfigurationTarget.Global)
			}
		})
	)
}

export function deactivate() {}
