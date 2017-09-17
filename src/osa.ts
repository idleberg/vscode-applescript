'use strict';

import { workspace, window } from 'vscode';

import { spawn } from 'child_process';
import { platform } from 'os';
import { basename, dirname, extname, join } from 'path';

const outputChannel = window.createOutputChannel('AppleScript');

const osacompile = (compileTarget: string) => {
  if (platform() !== 'darwin' && getConfig().ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    let dirName = dirname(doc.fileName);
    let baseName = basename(doc.fileName, extname(doc.fileName));
    let outName = join(dirName, baseName + compileTarget);

    spawnPromise('osacompile', ['-o', outName, doc.fileName])
    .then( () => {
      if (getConfig().showNotifications) window.showInformationMessage(`Successfully compiled '${doc.fileName}'`);
     })
    .catch( () => {
      outputChannel.show(true);
      if (getConfig().showNotifications) window.showErrorMessage('Failed to run compile (see output for details)');
    });
  });
};

const osascript = () => {
  if (platform() !== 'darwin' && getConfig().ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    spawnPromise('osascript', [doc.fileName])
    .catch( () => {
      outputChannel.show(true);
      if (getConfig().showNotifications) window.showErrorMessage('Failed to run script (see output for details)');
    });
  });
};

const getConfig = () => {
  return workspace.getConfiguration('applescript');
};

const spawnPromise = (cmd: any, args: Array<string>) => {
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

export { osacompile, osascript };
