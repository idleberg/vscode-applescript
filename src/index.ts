import { commands, type ExtensionContext, languages, type Uri, window, workspace } from 'vscode';
import { ScptEditorProvider } from './editor.ts';
import { ScptFileSystemProvider } from './filesystem.ts';
import { osacompile, osascript } from './osa.ts';
import { appleScriptSymbolProvider } from './outline.ts';
import { pick } from './processes.ts';
import { createBuildTask } from './task.ts';
import { fileUriToScptUri } from './util.ts';

/**
 * Activate the VS Code extension.
 *
 * This registers editor/command handlers for AppleScript workflows
 * (run, compile, build task creation, termination) and hooks the document
 * symbol providers for the `applescript` and languages.
 */
async function activate(context: ExtensionContext): Promise<void> {
	// Register virtual filesystem provider for binary .scpt files
	const scptFs = new ScptFileSystemProvider();
	context.subscriptions.push(
		workspace.registerFileSystemProvider('scpt', scptFs, {
			isCaseSensitive: true,
			isReadonly: false,
		}),
	);

	// Register custom editor for binary .scpt files (shows warning card)
	const scptEditorProvider = new ScptEditorProvider(context);
	context.subscriptions.push(
		window.registerCustomEditorProvider(ScptEditorProvider.viewType, scptEditorProvider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
			supportsMultipleEditorsPerDocument: false,
		}),
	);

	context.subscriptions.push(
		/**
		 * Binary .scpt file support
		 */
		commands.registerCommand('extension.applescript.openBinaryFile', async (uri?: Uri) => {
			// Resolve the target URI
			const targetUri =
				uri ??
				(await (async () => {
					const selected = await window.showOpenDialog({
						canSelectFiles: true,
						canSelectFolders: false,
						canSelectMany: false,
						filters: { 'AppleScript Binary': ['scpt', 'scptd'] },
						title: 'Open Binary AppleScript File',
					});
					return selected?.[0];
				})());

			if (!targetUri) {
				return;
			}

			// Convert file: URI to scpt: URI for virtual filesystem
			const scptUri = fileUriToScptUri(targetUri);

			// Open in editor with AppleScript language
			const doc = await workspace.openTextDocument(scptUri);
			await languages.setTextDocumentLanguage(doc, 'applescript');
			await window.showTextDocument(doc, { preview: false });
		}),
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

		languages.registerDocumentSymbolProvider({ language: 'applescript' }, appleScriptSymbolProvider),
	);
}

export { activate };
