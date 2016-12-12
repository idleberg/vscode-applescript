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

  let doc = textEditor.document;

  doc.save();

  let dirName = path.dirname(doc.fileName)
  let baseName = path.basename(doc.fileName, path.extname(doc.fileName))
  let outName = path.join(dirName, baseName + compileTarget)

  outputChannel.clear();
  if (config.alwaysShowOutput === true) {
    outputChannel.show();
  }
  
  // Let's build
  const osacompile = spawn('osacompile', ['-o', outName, doc.fileName]);

  let stdErr = "";

  osacompile.stdout.on('data', (data) => {
    outputChannel.appendLine(data);
  });

  osacompile.stderr.on('data', (data) => {
    stdErr += "\n" + data;
    outputChannel.appendLine(data);
  });

  osacompile.on('close', (code) => {
    console.log(code)
    console.log(stdErr)
    if (code === 0) {
      vscode.window.showInformationMessage("Successfully compiled \"" + doc.fileName + "\"");
    } else {
      outputChannel.show(true);
      vscode.window.showErrorMessage("Compilation failed, see output for details");
      console.error(stdErr);
    }
  });
}

module.exports = osacompileCommand;
