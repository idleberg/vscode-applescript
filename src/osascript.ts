'use strict';

import { workspace, window } from 'vscode';

import { spawn } from 'child_process';
import { platform } from 'os';

const outputChannel = window.createOutputChannel('AppleScript');

const osascript = () => {
  if (platform() !== 'darwin') {
    return window.showWarningMessage('This command is only available on macOS');
  }

  let config = workspace.getConfiguration('applescript');
  let doc = window.activeTextEditor.document;

  doc.save().then( () => {
    outputChannel.clear();
    if (config.alwaysShowOutput === true) {
      outputChannel.show();
    }

    // Let's build
    const osaScript = spawn('osascript', [doc.fileName]);

    let stdErr: string = '';

    osaScript.stdout.on('data', (data) => {
      outputChannel.appendLine(data.toString());
    });

    osaScript.stderr.on('data', (data) => {
      stdErr += '\n' + data;
      outputChannel.appendLine(data.toString());
    });

    osaScript.on('close', (code) => {
      if (code !== 0) {
        outputChannel.show(true);
        if (config.showNotifications) window.showErrorMessage('Failed to run script (see output for details)');
        console.error(stdErr);
      }
    });
  });
};

export { osascript };
