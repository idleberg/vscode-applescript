'use strict';

const vscode = require('vscode');

const spawn = require('child_process').spawn;
const os = require('os');
const path = require('path');

const outputChannel = vscode.window.createOutputChannel("AppleScript");

function osacompileCommand (textEditor, compileTarget) {
  if (os.platform() !== 'darwin') {
    return vscode.window.showWarningMessage("This command is only available on macOS");
  }

  let config = vscode.workspace.getConfiguration('applescript');

  let doc = textEditor.document;

  doc.save().then(function () {
    let dirName = path.dirname(doc.fileName);
    let baseName = path.basename(doc.fileName, path.extname(doc.fileName));
    let outName = path.join(dirName, baseName + compileTarget);

    outputChannel.clear();
    if (config.alwaysShowOutput === true) {
      outputChannel.show();
    }

    // Let's build
    const osaCompile = spawn('osacompile', ['-o', outName, doc.fileName]);

    let stdErr = "";

    osaCompile.stdout.on('data', (data) => {
      outputChannel.appendLine(data);
    });

    osaCompile.stderr.on('data', (data) => {
      stdErr += "\n" + data;
      outputChannel.appendLine(data);
    });

    osaCompile.on('close', (code) => {
      if (code === 0) {
        if (config.showNotifications) vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"");
      } else {
        outputChannel.show(true);
        if (config.showNotifications) vscode.window.showErrorMessage("Failed to run compile (see output for details)");
        console.error(stdErr);
      }
    });
  });
}

module.exports = osacompileCommand;
