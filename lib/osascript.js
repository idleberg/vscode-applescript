'use strict';

const vscode = require('vscode');

const spawn = require('child_process').spawn;
const os = require('os');

const outputChannel = vscode.window.createOutputChannel("AppleScript");

function osascriptCommand (textEditor) {
  if (os.platform() !== 'darwin') {
    return vscode.window.showWarningMessage("This command is only available on macOS");
  }

  let config = vscode.workspace.getConfiguration('applescript');

  let doc = textEditor.document;

  doc.save().then(function () {
    outputChannel.clear();
    if (config.alwaysShowOutput === true) {
      outputChannel.show();
    }
    
    // Let's build
    const osaScript = spawn('osascript', [doc.fileName]);

    let stdErr = "";

    osaScript.stdout.on('data', (data) => {
      outputChannel.appendLine(data);
    });

    osaScript.stderr.on('data', (data) => {
      stdErr += "\n" + data;
      outputChannel.appendLine(data);
    });

    osaScript.on('close', (code) => {
      if (code !== 0) {
        outputChannel.show(true);
        if (config.showNotifications) vscode.window.showErrorMessage("Failed to run script (see output for details)");
        console.error(stdErr);
      }
    });
  });
}

module.exports = osascriptCommand;
