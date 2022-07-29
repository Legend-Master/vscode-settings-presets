import {
	TreeDataProvider,
	EventEmitter,
	workspace,
	TreeItemCollapsibleState,
	TreeItem,
} from 'vscode'

import { PRESETS_SETTINGS_NAME } from './constants'

export class SettingsPresetsProvider implements TreeDataProvider<Settings> {

	private _onDidChangeTreeData = new EventEmitter<void>()
	onDidChangeTreeData = this._onDidChangeTreeData.event

	refresh(): void {
		this._onDidChangeTreeData.fire()
	}

	getTreeItem(element: Settings): Settings {
		return element
	}

	getChildren(): Settings[] {
		const settingsPresets = new Array<Settings>()
		const config = workspace.getConfiguration()
		const presets = config.get<object>(PRESETS_SETTINGS_NAME)
		if (presets) {
			for (const [presetName, preset] of Object.entries(presets)) {
				settingsPresets.push(new Settings(presetName, TreeItemCollapsibleState.None, preset))
			}
		}
		return settingsPresets
	}
}

export class Settings extends TreeItem {
	constructor(
		public label: string,
		public collapsibleState?: TreeItemCollapsibleState,
		public settings?: any,
	) {
		super(label, collapsibleState)
	}
}
