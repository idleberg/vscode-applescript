'use strict';

// Dependencies
import { platform } from 'os';
import { workspace, window } from 'vscode';

// Modules
import { getConfig, getOutName, spawnPromise } from './util';

const outputChannel = window.createOutputChannel('AppleScript');

const osacompile = (compileTarget: string, isJXA: boolean = false) => {
  const config = getConfig();

  if (platform() !== 'darwin' && config.ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    const outName = getOutName(doc.fileName, compileTarget);
    const args = ['-o', outName, doc.fileName];

    if (isJXA === true) {
      args.unshift('-l', 'JavaScript');
    }

    spawnPromise('osacompile', args, outputChannel)
    .then( () => {
      if (config.showNotifications) window.showInformationMessage(`Successfully compiled '${doc.fileName}'`);
     })
    .catch( () => {
      outputChannel.show(true);
      if (config.showNotifications) window.showErrorMessage('Failed to run compile (see output for details)');
    });
  });
};

const osascript = (isJXA: boolean = false) => {
  if (platform() !== 'darwin' && getConfig().ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;
  const args = [doc.fileName];

  if (isJXA === true) {
    args.unshift('-l', 'JavaScript');
  }

  doc.save().then( () => {
    spawnPromise('osascript', args, outputChannel)
    .catch( () => {
      outputChannel.show(true);
      if (getConfig().showNotifications) window.showErrorMessage('Failed to run script (see output for details)');
    });
  });
};

export { osacompile, osascript };
