import { commands, type ExtensionContext, languages, type Uri, window, workspace } from 'vscode';
import { osacompile, osascript } from './osa.ts';
import { appleScriptSymbolProvider } from './outline.ts';
import { jxaSymbolProvider } from './outline-jxa.ts';
import { pick } from './processes.ts';
import { ScptEditorProvider } from './scpt-editor.ts';
import { ScptFileSystemProvider } from './scpt-filesystem.ts';
import { fileUriToScptUri, validateOsaTools } from './scpt-util.ts';
import { createBuildTask } from './task.ts';

/**
 * Activate the VS Code extension.
 *
 * This registers editor/command handlers for AppleScript and JXA workflows
 * (run, compile, build task creation, termination) and hooks the document
 * symbol providers for the `applescript` and `jxa` languages.
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

	// Validate osa tools are available (macOS only)
	const osaToolsAvailable = await validateOsaTools();

	// Register custom editor for binary .scpt files (shows warning card)
	const scptEditorProvider = new ScptEditorProvider(osaToolsAvailable);
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
			if (!osaToolsAvailable) {
				window.showErrorMessage('Binary AppleScript files require macOS with osadecompile/osacompile tools');
				return;
			}

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

		languages.registerDocumentSymbolProvider({ language: 'applescript' }, appleScriptSymbolProvider),
		languages.registerDocumentSymbolProvider({ language: 'jxa' }, jxaSymbolProvider),
	);
}

export { activate };
