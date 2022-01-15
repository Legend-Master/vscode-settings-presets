import * as vscode from 'vscode'
import { PRESETS_SETTINGS_NAME } from "./constants";

export class settingsPresetsProvider implements vscode.TreeDataProvider<Settings> {

	// onDidChangeTreeData?: vscode.Event<void | Settings | null | undefined> | undefined
	private _onDidChangeTreeData = new vscode.EventEmitter<Settings | void>()
	get onDidChangeTreeData(): vscode.Event<Settings | void> {
        return this._onDidChangeTreeData.event;
    }

	refresh(): void {
		this._onDidChangeTreeData.fire()
	}

	getTreeItem(element: Settings): vscode.TreeItem {
		return element
	}

	getChildren(): Promise<Settings[]> {
		const settingsPresets: Settings[] = []
		const config = vscode.workspace.getConfiguration()
		const presets = config.get<any>(PRESETS_SETTINGS_NAME)
		if (presets) {
			for (const presetName in presets) {
				settingsPresets.push(
					new Settings(
						presetName,
						vscode.TreeItemCollapsibleState.None,
						presets[presetName]
					)
				)
			}
		}
		return Promise.resolve(settingsPresets)
	}
}

export class Settings extends vscode.TreeItem {
	constructor(
		public label: string,
		public collapsibleState?: vscode.TreeItemCollapsibleState,
		public settings?: any,
	) {
		super(label, collapsibleState)
	}
}
