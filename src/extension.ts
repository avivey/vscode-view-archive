import * as vscode from 'vscode';
import { ArchiveViewContentProvider, getViewUri } from './content-provider';

export function activate(context: vscode.ExtensionContext) {
	function d(disposable: vscode.Disposable) {
		context.subscriptions.push(disposable);
	}

	const viewer = new ArchiveViewContentProvider();

	d(vscode.workspace.registerTextDocumentContentProvider(ArchiveViewContentProvider.scheme, viewer));

	d(vscode.commands.registerCommand('archive-viewer.view-file', async (resource: vscode.Uri) => {
		const uri = getViewUri(resource);
		const doc = await vscode.workspace.openTextDocument(uri);
		vscode.window.showTextDocument(doc);
	}));
}

export function deactivate() { }
