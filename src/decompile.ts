import * as vscode from 'vscode';
import { spawn } from 'node:child_process';

const style = [
	'font-family: var(--vscode-editor-font-family)',
	'font-size: var(--vscode-editor-font-size)',
	'font-weight: var(--vscode-editor-font-weight)'
].join(';');

export type ScptFile = vscode.CustomDocument & {
	readonly preview: string;
};

export class ScptFileEditorProvider implements vscode.CustomReadonlyEditorProvider {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor() { }

	async openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Promise<ScptFile> {
		const preview = await previewLockfile(uri, token);

		return {
			uri,
			preview,
			dispose: () => undefined
		};
	}

	async resolveCustomEditor(document: ScptFile, webviewPanel: vscode.WebviewPanel): Promise<void> {
		const { preview } = document;
		renderLockfile(webviewPanel, preview);
	}
}

function renderLockfile(webviewPanel: vscode.WebviewPanel, preview: string): void {
	webviewPanel.webview.html = `<pre><code style="${style}">${preview}</code></pre>`;
}

function previewLockfile(uri: vscode.Uri, token?: vscode.CancellationToken): Promise<string> {
	return new Promise((resolve, reject) => {
		const process = spawn('osadecompile', [uri.fsPath], {
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		token.onCancellationRequested(() => {
			process.kill();
		});

		let stdout = '';
		process.stdout.on('data', (data: Buffer) => {
			stdout += data.toString();
		});

		let stderr = '';
		process.stderr.on('data', (data: Buffer) => {
			stderr += data.toString();
		});

		process.on('error', error => {
			reject(error);
		});

		process.on('exit', code => {
			if (code === 0) {
				resolve(stdout);
			} else {
				reject(new Error(`osacompile exited with code: ${code}\n${stderr}`));
			}
		});
	});
}

export default function (): void {
	const viewType = 'applescript.binary';
	const provider = new ScptFileEditorProvider();

	vscode.window.registerCustomEditorProvider(viewType, provider, {
		supportsMultipleEditorsPerDocument: true,
		webviewOptions: {
			enableFindWidget: true,
			retainContextWhenHidden: true
		}
	});
}
