'use strict';

// Dependencies
import { commands } from 'vscode';

// Modules
import { osacompile, osascript } from './osa';

const activate = (context) => {
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.run', () => {
      return osascript();
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.compile', () => {
      return osacompile('scpt');
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.compileBundle', () => {
      return osacompile('scptd');
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.compileApp', () => {
      return osacompile('app');
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.run', () => {
      return osascript(true);
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.compile', () => {
      return osacompile('scpt', true);
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.compileBundle', () => {
      return osacompile('scptd', true);
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.compileApp', () => {
      return osacompile('app', true);
    })
  );
};

export { activate };
