import * as vscode from 'vscode';
import { fileUriToScptUri } from './util.ts';

/**
 * Custom editor provider for binary AppleScript (.scpt) files
 *
 * Shows a warning card view before allowing users to edit the file.
 * When the user clicks "Edit File", it opens the file using the scpt:
 * FileSystemProvider for decompilation and editing.
 */
export class ScptEditorProvider implements vscode.CustomReadonlyEditorProvider<ScptDocument> {
	public static readonly viewType = 'applescript.binary';

	constructor(
		private readonly context: vscode.ExtensionContext,
		// private readonly osaToolsAvailable: boolean,
	) {}

	/**
	 * Called when a .scpt file is opened
	 */
	async openCustomDocument(uri: vscode.Uri): Promise<ScptDocument> {
		return new ScptDocument(uri);
	}

	/**
	 * Called to resolve the custom editor view
	 */
	async resolveCustomEditor(document: ScptDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
		// Configure webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};

		// Set the HTML content
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

		// Handle messages from the webview
		webviewPanel.webview.onDidReceiveMessage(async (message) => {
			switch (message.command) {
				case 'editFile':
					await this.openFileForEditing(document.uri, webviewPanel);
					break;

				case 'cancel':
					// Just close the webview panel
					webviewPanel.dispose();
					break;
			}
		});
	}

	/**
	 * Opens the file for editing using the scpt: FileSystemProvider
	 */
	private async openFileForEditing(uri: vscode.Uri, webviewPanel: vscode.WebviewPanel): Promise<void> {
		if (!this.context) {
			vscode.window.showErrorMessage('Binary AppleScript files require macOS with osadecompile/osacompile tools');
			return;
		}

		try {
			// Convert file: URI to scpt: URI for virtual filesystem
			const scptUri = fileUriToScptUri(uri);

			// Open in editor with AppleScript language
			const doc = await vscode.workspace.openTextDocument(scptUri);
			await vscode.languages.setTextDocumentLanguage(doc, 'applescript');
			await vscode.window.showTextDocument(doc, {
				preview: false,
				viewColumn: webviewPanel.viewColumn,
			});

			// Close the warning view
			webviewPanel.dispose();
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to open file: ${error instanceof Error ? error.message : error}`);
		}
	}

	/**
	 * Generates a random nonce for CSP
	 */
	private getNonce(): string {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}

	/**
	 * Generates the HTML content for the warning view
	 */
	private getHtmlForWebview(webview: vscode.Webview, _document: ScptDocument): string {
		const nonce = this.getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Binary AppleScript File</title>
				<style>
					body {
						font-family: var(--vscode-font-family);
						font-size: 14px;
						color: var(--vscode-foreground);
						background-color: var(--vscode-editor-background);
						margin: 0;
						padding: 0;
						overflow: hidden;
					}

					.monaco-editor-pane-placeholder {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						height: 100vh;
						width: 100%;
						padding: 20px;
					}

					.editor-placeholder-icon-container {
						margin-bottom: 16px;
					}

					.warning-icon {
						width: 48px;
						height: 48px;
						color: var(--vscode-editorWarning-foreground);
					}

					.editor-placeholder-label-container {
						width: 600px;
						max-width: 90%;
					}

					.editor-placeholder-label-container span {
						line-height: 1.5;
						color: var(--vscode-foreground);
					}

					.editor-placeholder-details {
						margin-top: 20px;
						margin-bottom: 20px;
						width: 600px;
						max-width: 90%;
						text-align: left;
					}

					.editor-placeholder-details h3 {
						font-weight: 600;
						margin-bottom: 8px;
						color: var(--vscode-foreground);
					}

					.editor-placeholder-details ul {
						list-style: none;
						padding: 0;
						margin: 0 0 16px 0;
						font-size: 12px;
						line-height: 1.6;
						color: var(--vscode-descriptionForeground);
					}

					.editor-placeholder-details li {
						padding: 2px 0;
						padding-left: 16px;
						position: relative;
					}

					.editor-placeholder-details li::before {
						content: "•";
						position: absolute;
						left: 4px;
					}

					.editor-placeholder-buttons-container {
						display: flex;
						gap: 8px;
						flex-wrap: wrap;
						justify-content: center;
					}

					.monaco-button {
						display: inline-block;
						padding: 4px 14px;
						border: none;
						border-radius: 2px;
						font-family: var(--vscode-font-family);
						cursor: pointer;
						text-decoration: none;
						outline-offset: 2px;
					}

					.monaco-text-button {
						color: var(--vscode-button-foreground);
						background-color: var(--vscode-button-background);
					}

					.monaco-text-button:hover {
						background-color: var(--vscode-button-hoverBackground);
					}

					.monaco-text-button:focus {
						outline: 1px solid var(--vscode-focusBorder);
					}

					.monaco-button-secondary {
						color: var(--vscode-button-secondaryForeground);
						background-color: var(--vscode-button-secondaryBackground);
					}

					.monaco-button-secondary:hover {
						background-color: var(--vscode-button-secondaryHoverBackground);
					}

					.monaco-button-secondary:focus {
						outline: 1px solid var(--vscode-focusBorder);
					}
				</style>
			</head>
			<body>
				<div class="monaco-editor-pane-placeholder" tabindex="0" aria-label="Binary AppleScript file. The file is not displayed because it needs to be decompiled first.">
					<div class="editor-placeholder-icon-container">
						<svg class="warning-icon" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.56 1h.88l6.54 12.26-.44.74H1.44L1 13.26 7.56 1zM8 2.28L2.28 13H13.7L8 2.28zM8.625 12v-1h-1.25v1h1.25zm-1.25-2V6h1.25v4h-1.25z"/>
						</svg>
					</div>
					<div class="editor-placeholder-label-container">
						<span>The file is not displayed in the text editor because it is binary AppleScript. It will be decompiled when you click on "Edit File".</span>
					</div>
					<div class="editor-placeholder-details">
						<h3>What happens when you edit:</h3>
						<ul>
							<li>The file will be decompiled using <code>osadecompile</code></li>
							<li>You can edit the source code in the editor</li>
							<li>On save, the code will be compiled back to binary using <code>osacompile</code></li>
						</ul>
						<h3>Things to note:</h3>
						<ul>
							<li>Decompiled code may differ slightly from the original source</li>
							<li>Comments and formatting might not be preserved</li>
							<li>Compilation errors will prevent saving</li>
						</ul>
					</div>
					<div class="editor-placeholder-buttons-container">
						<a id="editButton" class="monaco-button monaco-text-button" tabindex="0" role="button" aria-disabled="false">Edit File</a>
						<a id="cancelButton" class="monaco-button monaco-button-secondary" tabindex="0" role="button" aria-disabled="false">Cancel</a>
					</div>
				</div>

				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();

					document.getElementById('editButton').addEventListener('click', function() {
						vscode.postMessage({ command: 'editFile' });
					});

					document.getElementById('cancelButton').addEventListener('click', function() {
						vscode.postMessage({ command: 'cancel' });
					});
				</script>
			</body>
			</html>`;
	}
}

/**
 * Represents a .scpt document in the custom editor
 */
class ScptDocument implements vscode.CustomDocument {
	constructor(public readonly uri: vscode.Uri) {}

	dispose(): void {
		// No resources to clean up
	}
}
