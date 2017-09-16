'use strict';

import { workspace, window } from 'vscode';

import { spawn } from 'child_process';
import { platform } from 'os';
import { basename, dirname, extname, join } from 'path';

const outputChannel = window.createOutputChannel('AppleScript');

const osacompile = (compileTarget: string) => {
  if (platform() !== 'darwin') {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let config = workspace.getConfiguration('applescript');
  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    let dirName = dirname(doc.fileName);
    let baseName = basename(doc.fileName, extname(doc.fileName));
    let outName = join(dirName, baseName + compileTarget);

    outputChannel.clear();
    if (config.alwaysShowOutput === true) {
      outputChannel.show();
    }

    // Let's build
    const osaCompile = spawn('osacompile', ['-o', outName, doc.fileName]);

    let stdErr: string = '';

    osaCompile.stdout.on('data', (data) => {
      outputChannel.appendLine(data.toString());
    });

    osaCompile.stderr.on('data', (data) => {
      stdErr += '\n' + data;
      outputChannel.appendLine(data.toString());
    });

    osaCompile.on('close', (code) => {
      if (code === 0) {
        if (config.showNotifications) window.showInformationMessage(`Successfully compiled '${doc.fileName}'`);
      } else {
        outputChannel.show(true);
        if (config.showNotifications) window.showErrorMessage('Failed to run compile (see output for details)');
        console.error(stdErr);
      }
    });
  });
};

module.exports = osacompile;
