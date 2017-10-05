'use strict';

// Dependencies
import { platform } from 'os';
import { workspace, window } from 'vscode';

// Modules
import { getConfig, getOutName, spawnPromise } from './util';

const outputChannel = window.createOutputChannel('AppleScript');

const osacompile = (compileTarget: string) => {
  const config = getConfig();

  if (platform() !== 'darwin' && config.ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    const outName = getOutName(doc.fileName, compileTarget);

    spawnPromise('osacompile', ['-o', outName, doc.fileName], outputChannel)
    .then( () => {
      if (config.showNotifications) window.showInformationMessage(`Successfully compiled '${doc.fileName}'`);
     })
    .catch( () => {
      outputChannel.show(true);
      if (config.showNotifications) window.showErrorMessage('Failed to run compile (see output for details)');
    });
  });
};

const osascript = () => {
  if (platform() !== 'darwin' && getConfig().ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    spawnPromise('osascript', [doc.fileName], outputChannel)
    .catch( () => {
      outputChannel.show(true);
      if (getConfig().showNotifications) window.showErrorMessage('Failed to run script (see output for details)');
    });
  });
};

export { osacompile, osascript };
