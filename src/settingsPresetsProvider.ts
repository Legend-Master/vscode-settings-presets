import {
	TreeDataProvider,
	EventEmitter,
	workspace,
	TreeItemCollapsibleState,
	TreeItem,
} from 'vscode'

import { PRESETS_SETTINGS_NAME } from './constants'

type PresetEntry = Record<string, any>

export type Preset = {
	name: string
	preset: PresetEntry
}

export class SettingsPresetsProvider implements TreeDataProvider<Preset> {
	private _onDidChangeTreeData = new EventEmitter<void>()
	onDidChangeTreeData = this._onDidChangeTreeData.event

	refresh() {
		this._onDidChangeTreeData.fire()
	}

	getTreeItem(setting: Preset) {
		return new TreeItem(setting.name, TreeItemCollapsibleState.None)
	}

	getChildren() {
		const config = workspace.getConfiguration()
		const presets = config.get<object>(PRESETS_SETTINGS_NAME)
		const settingsPresets = []
		if (presets) {
			for (const [name, preset] of Object.entries(presets)) {
				settingsPresets.push({ name, preset })
			}
		}
		return settingsPresets
	}
}
