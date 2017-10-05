'use strict';

// Dependencies
import { spawn } from 'child_process';
import { basename, dirname, extname, join } from 'path';
import { window, workspace } from 'vscode';

const getConfig = () => {
  return workspace.getConfiguration('applescript');
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

    process.stdout.on('data', (data) => {
      outputChannel.appendLine(data.toString());
    });

    process.stderr.on('data', (data) => {
      stdErr += '\n' + data;
      outputChannel.appendLine(data.toString());
    });

    process.on('close', (code) => {
      if (code !== 0) {
        console.error(stdErr);
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
