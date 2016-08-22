'use strict';

const exec = require('child_process').exec;
const os = require('os');
const vscode = require('vscode');

function osascriptCommand (textEditor) {

  if (os.platform() === 'darwin') {
    return vscode.window.showWarningMessage("This command is only available on macOS");
  }

  let doc = textEditor.document;

  doc.save()

  exec("osascript " + doc.fileName, function(error, stdout, stderr) {
    if (error !== null) {
      return vscode.window.showErrorMessage(stderr);
    }
  });
}

module.exports = osascriptCommand;
