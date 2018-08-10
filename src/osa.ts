'use strict';

// Dependencies
import { platform } from 'os';
import { workspace, window } from 'vscode';

// Modules
import { getConfig, getOutName, spawnPromise } from './util';

const outputChannel = window.createOutputChannel('AppleScript');

const osacompile = (compileTarget: string, options: CommandFlags = { isJXA: false }) => {
  const config = getConfig();

  // might become useful in a future release
  options = {...options, ...config.osacompile};

  if (platform() !== 'darwin' && config.ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    const outName = getOutName(doc.fileName, compileTarget);
    const args = ['-o', outName, doc.fileName];

    if (options.executeOnly === true) {
      args.unshift('-x');
    }

    if (compileTarget === 'app' && options.stayOpen === true) {
      args.unshift('-s');
    }

    if (compileTarget === 'app' && options.startupScreen === true) {
      args.unshift('-u');
    }

    if (options.isJXA === true) {
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

const osascript = (options: CommandFlags = { isJXA: false }) => {
  const config = getConfig();

  if (platform() !== 'darwin' && config.ignoreOS !== true) {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let doc = window.activeTextEditor.document;
  const args = [];

  if (doc.isDirty) {
    const lines = doc.getText().split('\n');

    lines.forEach(function(line) {
      args.push('-e', line);
    });
  } else {
    args.push(doc.fileName);
  }

  if (config.osascript.outputStyle.trim().length > 0 && config.osascript.outputStyle.trim().length <= 4) {
    args.unshift('-s', config.osascript.outputStyle.trim());
  }

  if (options.isJXA === true) {
    args.unshift('-l', 'JavaScript');
  }

  spawnPromise('osascript', args, outputChannel)
  .catch( () => {
    outputChannel.show(true);
    if (config.showNotifications) window.showErrorMessage('Failed to run script (see output for details)');
  });
};

export { osacompile, osascript };
