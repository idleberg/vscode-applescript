import { type ExtensionContext, commands } from 'vscode';
import { osacompile, osascript } from './osa.ts';
import { pick } from './processes.ts';
import { createBuildTask } from './task.ts';

async function activate(context: ExtensionContext): Promise<void> {
	context.subscriptions.push(
		/**
		 * AppleScript
		 */
		commands.registerTextEditorCommand('extension.applescript.run', async () => {
			return await osascript();
		}),

		commands.registerTextEditorCommand('extension.applescript.compile', async () => {
			return await osacompile('scpt');
		}),

		commands.registerTextEditorCommand('extension.applescript.compileBundle', async () => {
			return await osacompile('scptd');
		}),

		commands.registerTextEditorCommand('extension.applescript.compileApp', async () => {
			return await osacompile('app');
		}),

		commands.registerTextEditorCommand('extension.applescript.createBuildTask', async () => {
			return await createBuildTask();
		}),

		commands.registerCommand('extension.applescript.openSettings', async () => {
			commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.applescript');
		}),

		commands.registerTextEditorCommand('extension.applescript.terminateProcess', async () => {
			await pick();
		}),

		/**
		 * JXA
		 */
		commands.registerTextEditorCommand('extension.jxa.run', async () => {
			return await osascript({ isJXA: true });
		}),

		commands.registerTextEditorCommand('extension.jxa.compile', async () => {
			return await osacompile('scpt', { isJXA: true });
		}),

		commands.registerTextEditorCommand('extension.jxa.compileBundle', async () => {
			return await osacompile('scptd', { isJXA: true });
		}),

		commands.registerTextEditorCommand('extension.jxa.compileApp', async () => {
			return await osacompile('app', { isJXA: true });
		}),

		commands.registerTextEditorCommand('extension.jxa.createBuildTask', async () => {
			return await createBuildTask(true);
		}),

		commands.registerCommand('extension.jxa.openSettings', () => {
			commands.executeCommand('workbench.action.openSettings', '@ext:idleberg.applescript');
		}),

		commands.registerTextEditorCommand('extension.jxa.terminateProcess', async () => {
			await pick();
		}),
	);
}

export { activate };
