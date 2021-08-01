import * as vscode from 'vscode';
import { viewFile } from './viewer';

export class ArchiveViewContentProvider
    implements vscode.TextDocumentContentProvider {

    static readonly scheme = 'archive-viewer';

    // TODO support cancel
    async provideTextDocumentContent(uri: vscode.Uri, cancelToken: vscode.CancellationToken): Promise<string> {
        var fileUri: vscode.Uri;
        try {
            fileUri = extractOriginalUri(uri);
        } catch {
            return "Error...";
        }

        if (fileUri.scheme !== 'file') {
            return 'Can only view local files (with scheme "file://".\n' +
                `input was "${fileUri}".`;
        }

        const filename = fileUri.path;

        return viewFile(filename);
    }

}

export function getViewUri(uri: vscode.Uri): vscode.Uri {
    const fileUri = uri.toString();
    return vscode.Uri.from({
        scheme: ArchiveViewContentProvider.scheme,
        path: fileUri,
    });
}

function extractOriginalUri(uri: vscode.Uri): vscode.Uri {
    switch (uri.scheme) {
        case 'file':
            return uri;
        case ArchiveViewContentProvider.scheme:
            return vscode.Uri.parse(uri.path, true);
    }

    throw new Error("unexpected scheme");
}
