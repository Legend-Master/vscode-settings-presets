import * as vscode from 'vscode';

export class settingsPresetsProvider implements vscode.TreeDataProvider<Settings> {
    public static viewId = '';

    constructor(workspaceRoot: string | undefined) {

    }
    onDidChangeTreeData?: vscode.Event<void | Settings | null | undefined> | undefined;
    getTreeItem(element: Settings): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }
    getChildren(element?: Settings): vscode.ProviderResult<Settings[]> {
        throw new Error('Method not implemented.');
    }
}

export class Settings implements vscode.TreeItem {
    constructor(resourceUri: vscode.Uri, collapsibleState?: vscode.TreeItemCollapsibleState) {

    }
}
