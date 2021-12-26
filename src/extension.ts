import * as vscode from 'vscode';

import { settingsPresetsProvider } from './settingsPresetsProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const windowProvider = new settingsPresetsProvider();
	let disposable = vscode.window.registerTreeDataProvider(windowProvider.viewId, windowProvider);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
