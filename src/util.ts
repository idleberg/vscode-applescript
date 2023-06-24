// Dependencies
import { basename, dirname, extname, join } from 'node:path';
import { getConfig } from 'vscode-get-config';
import { spawn } from 'node:child_process';
import { window } from 'vscode';
import lineColumn from 'line-column';

async function getLineCol(lineString: string): Promise<string | boolean> {
  if (!await getConfig('applescript.convertErrorRange'))
    return false;

  const re = /^(?<filePath>[^:]+):(?<rangeFrom>\d+):((?<rangeTo>\d+):)?(?<message>.*)$/u;
  const result = re.exec(lineString);

  if (!result?.groups?.rangeFrom)
    return false;

    const doc = window.activeTextEditor?.document;

    if (!doc) {
      console.error('[idleberg.applescript] Document not found');
      return false;
    }

  const editorText = doc.getText();

  if (!editorText) {
    console.error('[idleberg.applescript]')
  }
  const fileName = doc.fileName;
  const lineCol = lineColumn(editorText, { origin: 1 }).fromIndex(result.groups.rangeFrom);

  // is range end specified?
  lineCol.col = (result.groups.rangeTo) ? lineCol.col : 1;

  return `${fileName}:${lineCol.line}:${lineCol.col}:${result.groups.message}`;
}

function getOutName(fileName: string, extension = 'scpt'): string {
  const dirName = dirname(fileName);
  const baseName = basename(fileName, extname(fileName));
  const outName = join(dirName, `${baseName}.${extension}`);

  return outName;
}

// eslint-disable-next-line
async function spawnPromise(cmd: any, args: Array<string>, outputChannel: any): Promise<void> {
  const { alwaysShowOutput } = await getConfig('applescript');

  return new Promise((resolve, reject) => {
    outputChannel.clear();

    if (alwaysShowOutput) {
      outputChannel.show();
    }

    const process = spawn(cmd, args);

    process.stdout.on('data', async (line: string) => {
      const lineString: string = line.toString().trim();

      if (lineString.length) {
        const lineCol = await getLineCol(lineString);
        const appendLine = (lineCol) ? lineCol : lineString;

        outputChannel.appendLine(appendLine);
      }
    });

    process.stderr.on('data', async (line: string) => {
      const lineString: string = line.toString().trim();

      if (lineString.length) {
        const lineCol = await getLineCol(lineString);
        const appendLine = (lineCol) ? lineCol : lineString;

        outputChannel.appendLine(appendLine);
      }
    });

    process.on('close', (code: number) => {
      return (code === 0) ? resolve() : reject();
    });
  });
}

export {
  getOutName,
  spawnPromise
};
