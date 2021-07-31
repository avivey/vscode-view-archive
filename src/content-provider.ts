import * as vscode from 'vscode';
import * as execa from 'execa';

export class ArchiveViewContentProvider
    implements vscode.TextDocumentContentProvider {

    static readonly scheme = 'archive-viewer';

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    dispose() {
        this._onDidChange.dispose();
    }

    get onDidChange() {
        return this._onDidChange.event;
    }

    // TODO support cancel, long operations
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

        const content = await exec('lesspipe', filename);
        if (content) {
            return content;
        }

        const filetype = await getFileType(filename);

        return getContent(filetype, filename);

        // TODO support long operations?
    }

}

async function exec(...command: string[]): Promise<string> {
    const head = command.shift();
    if (!head) {
        return "errror - no command provided";
    }
    const { stdout } = await execa(head, command);
    return stdout;

}

async function getFileType(filename: string): Promise<string> {
    return exec('file', '-b', '--mime-type', filename);
}

async function getContent(mimetype: string, filename: string): Promise<string> {

    if (mimetype === 'application/zip') {
        return exec('unzip', '-l', filename);
    }

    return "this file is a " + mimetype;
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
