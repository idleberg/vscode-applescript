'use strict';

// Dependencies
import { commands, ExtensionContext } from 'vscode';

// Modules
import { createBuildTask } from './task';
import { osacompile, osascript } from './osa';

async function activate(context: ExtensionContext): Promise<void> {
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.run', async () => {
      return await osascript();
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.compile', async () => {
      return await osacompile('scpt');
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.compileBundle', async () => {
      return await osacompile('scptd');
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.compileApp', async () => {
      return await osacompile('app');
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.applescript.createBuildTask', async () => {
      return await createBuildTask();
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.run', async () => {
      return await osascript({ isJXA: true });
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.compile', async () => {
      return await osacompile('scpt', { isJXA: true });
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.compileBundle', async () => {
      return await osacompile('scptd', { isJXA: true });
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.compileApp', async () => {
      return await osacompile('app', { isJXA: true });
    })
  );
  context.subscriptions.push(
    commands.registerTextEditorCommand('extension.jxa.createBuildTask', async () => {
      return await createBuildTask(true);
    })
  );
}

export { activate };
