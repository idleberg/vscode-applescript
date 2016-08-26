'use strict';

const exec = require('child_process').exec;
const os = require('os');
const path = require('path');
const vscode = require('vscode');

function osacompileCommand (textEditor, compileTarget) {

  if (os.platform() !== 'darwin') {
    return vscode.window.showWarningMessage("This command is only available on macOS");
  }

  let doc = textEditor.document;

  doc.save()

  let dirName = path.dirname(doc.fileName)
  let baseName = path.basename(doc.fileName, path.extname(doc.fileName))
  let outName = path.join(dirName, baseName + compileTarget)

  exec("osacompile -o " + outName + " " + doc.fileName, function(error, stdout, stderr) {
    if (error !== null) {
      return vscode.window.showErrorMessage(stderr);
    }
  });
}

module.exports = osacompileCommand;
