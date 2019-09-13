'use strict';

// Dependencies
import * as lineColumn from 'line-column';
import { spawn } from 'child_process';
import { basename, dirname, extname, join } from 'path';
import { window, workspace } from 'vscode';

const getConfig = () => {
  return workspace.getConfiguration('applescript');
};

const getLineCol = (lineString: string) => {
  if (!getConfig().convertErrorRange) return false;

  const re = /^(?<filePath>[^:]+):(?<rangeFrom>\d+):((?<rangeTo>\d+):)?(?<message>.*)$/u;
  const result = re.exec(lineString);

  if (!result.groups.rangeFrom) return false;

  const editorText = window.activeTextEditor.document.getText();
  const fileName = window.activeTextEditor.document.fileName;
  const lineCol = lineColumn(editorText, {origin: 1}).fromIndex(result.groups.rangeFrom);

  return `${fileName}:${lineCol.line}:${lineCol.col}:${result.groups.message}`;
};

const getOutName = (fileName, extension = 'scpt') => {
  let dirName  = dirname(fileName);
  let baseName = basename(fileName, extname(fileName));
  let outName  = join(dirName, `${baseName}.${extension}`);

  return outName;
};

const spawnPromise = (cmd: any, args: Array<string>, outputChannel) => {
  return new Promise((resolve, reject) => {
    outputChannel.clear();
    if (getConfig().alwaysShowOutput === true) {
      outputChannel.show();
    }

    const process = spawn(cmd, args);

    let stdErr: string = '';

    process.stdout.on('data', line => {
      const lineString: string = line.toString().trim();

      if (lineString.length) {
        const lineCol = getLineCol(lineString);
        console.info(lineCol);
        const appendLine = (lineCol) ? lineCol : lineString;

        outputChannel.appendLine(appendLine);
      }
    });

    process.stderr.on('data', line => {
      const lineString: string = line.toString().trim();

      stdErr += '\n' + lineString;

      if (lineString.length) {
        const lineCol = getLineCol(lineString);
        console.info(lineCol);
        const appendLine = (lineCol) ? lineCol : lineString;

        outputChannel.appendLine(appendLine);
      }
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.error(`Exit code ${code}:\n${stdErr}`);
        return reject();
      }

      return resolve();
    });
  });
};

export {
  getConfig,
  getOutName,
  spawnPromise
};
