import { bundledThemes, getHighlighter } from 'shikiji'
import { getConfig } from 'vscode-get-config';
import { spawn } from 'node:child_process';
import * as vscode from 'vscode';

const style = [
	'font-family: var(--vscode-editor-font-family)',
	'font-size: var(--vscode-editor-font-size)',
	'font-weight: var(--vscode-editor-font-weight)'
].join(';');

export type ScptFile = vscode.CustomDocument & {
	readonly preview: string;
};

export class ScptFileEditorProvider implements vscode.CustomEditorProvider {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor() { }

	async openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): Promise<ScptFile> {
		const preview = await previewFile(uri, token);

		return {
			uri,
			preview,
			dispose: () => undefined
		};
	}

	async resolveCustomEditor(document: ScptFile, webviewPanel: vscode.WebviewPanel): Promise<void> {
		const { preview } = document;
		await renderFile(webviewPanel, preview);
	}
}

async function renderFile(webviewPanel: vscode.WebviewPanel, preview: string): void {
	const { scpt } = await getConfig('applescript');

	if (scpt.theme === '(none)') {
		webviewPanel.webview.html = `<pre style="${style}"><code>${preview}</code></pre>`;
		return;
	}

	const highlighter = await getHighlighter({
		themes: Object.keys(bundledThemes),
		langs: [
			'applescript'
		]
	});

	const highlighted = highlighter.codeToHtml(preview, {
		lang: 'applescript',
		theme: scpt.theme
	});

	const shikiStyle = `
	.shiki {
		padding: 1em;
		${scpt.overrideThemeBackground ? 'background-color: transparent !important' : ''}
	}

	.shiki code {
		${style}
	}
`.split('\n').join('');

	webviewPanel.webview.html = `<style>${shikiStyle}</style>${highlighted}`;
}

function previewFile(uri: vscode.Uri, token?: vscode.CancellationToken): Promise<string> {
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

export default async function (): Promise<void> {
	const { enableDecompiler } = await getConfig('applescript');

	if (!enableDecompiler) {
		return;
	}

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
