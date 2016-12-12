'use strict';

const vscode = require('vscode');

const os = require('os');
const osascriptCommand = require('./osascript');
const osacompileCommand = require('./osacompile');

module.exports = {
  activate (context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.applescript.run', (editor) => {
        return osascriptCommand(editor);
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.applescript.compile', (editor) => {
        return osacompileCommand(editor, ".scpt");
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.applescript.compileBundle', (editor) => {
        return osacompileCommand(editor, ".scptd");
      })
    );
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.applescript.compileApp', (editor) => {
        return osacompileCommand(editor, ".app");
      })
    );
  },
  deactivate () { }
};
