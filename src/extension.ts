import {
	window,
	workspace,
	commands,
	ExtensionContext,
	ConfigurationTarget,
	WorkspaceConfiguration,
} from "vscode";

import { settingsPresetsProvider, Settings } from './settingsPresetsProvider'
import { PRESETS_SETTINGS_NAME, VIEW_ID } from "./constants";

export function activate(context: ExtensionContext) {
	if (!(workspace.workspaceFolders && workspace.workspaceFolders.length > 0)) {
		return
	}

	let config = workspace.getConfiguration()
	let presets = {...config.get<any>(PRESETS_SETTINGS_NAME)}

	const windowProvider = new settingsPresetsProvider()
	workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration(PRESETS_SETTINGS_NAME)) {
			windowProvider.refresh()
			config = workspace.getConfiguration()
			presets = {...config.get<any>(PRESETS_SETTINGS_NAME)}
		}
	})
	context.subscriptions.push(window.registerTreeDataProvider(VIEW_ID, windowProvider))

	context.subscriptions.push(
		commands.registerCommand('settingsPresets.applyPreset', async (settingsItem: Settings) => {
			function updateSettings(configs: WorkspaceConfiguration, settings: any, field: string = '') {
				for (const configName in settings) {
					let newField = field + (field !== '' ? '.' : '') + configName
					const setting = settings[configName]
					if (typeof setting === 'object') {
						updateSettings(configs, setting, newField)
					}
					config.update(newField, setting, ConfigurationTarget.Workspace)
				}
			}
			updateSettings(workspace.getConfiguration(), presets[settingsItem.label])

			const openSettings = 'Open Settings File'
			const choice = await window.showInformationMessage('Preset: ' + settingsItem.label + ' applied', openSettings)
			if (choice === openSettings) {
				commands.executeCommand('workbench.action.openWorkspaceSettingsFile')
			}
		})
	)
	context.subscriptions.push(
		commands.registerCommand('settingsPresets.addPreset', async () => {
			const presetName = await window.showInputBox({
				placeHolder: 'Preset name'
			})
			if (typeof presetName === 'string' && presetName.length !== 0) {
				const settingsToSave: any = {}
				for (const key in config) {
					if (key === 'settingsPresets') {
						continue
					}
					const settings = config.inspect(key)
					if (settings && settings.workspaceValue) {
						settingsToSave[key] = settings.workspaceValue
					}
				}
				presets[presetName] = settingsToSave
				config.update(PRESETS_SETTINGS_NAME, presets, ConfigurationTarget.Global)
			}
		})
	)
	context.subscriptions.push(
		commands.registerCommand('settingsPresets.delectPreset', (settingsItem: Settings) => {
			delete presets[settingsItem.label]
			config.update(PRESETS_SETTINGS_NAME, presets, ConfigurationTarget.Global)
		})
	)
}

export function deactivate() {}
