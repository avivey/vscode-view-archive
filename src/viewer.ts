import * as execa from 'execa';

// TODO check programs exist, cache this
// maybe replace `file` and `unzip` with javascript libs.

// TODO support cancel, long operations
export async function viewFile(filename: string): Promise<string> {
    const content = await exec('lesspipe', filename);
    if (content) {
        return content;
    }

    const filetype = await getFileType(filename);

    return getContent(filetype, filename);

}

async function exec(...command: string[]): Promise<string> {
    const head = command.shift();
    if (!head) {
        return "error - no command provided";
    }
    try {
        const { stdout } = await execa(head, command);
        return stdout;
    } catch {
        return 'ERROR INVOKING ' + head;
    }

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
