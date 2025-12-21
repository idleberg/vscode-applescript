import { platform } from 'node:os';
import { window } from 'vscode';
import { getConfig } from 'vscode-get-config';
import { getOutName, spawnPromise } from './util.ts';

const outputChannel = window.createOutputChannel('AppleScript');

async function osacompile(compileTarget: string): Promise<void> {
	const { ignoreOS, osacompile, showNotifications } = await getConfig('applescript');

	// might become useful in a future release
	const options = { ...osacompile };

	if (platform() !== 'darwin' && ignoreOS !== true) {
		window.showWarningMessage('This command is only available on macOS');
		return;
	}

	const doc = window.activeTextEditor?.document;

	if (!doc) {
		console.error('[idleberg.applescript] Document not found');
		return;
	}

	doc.save().then(() => {
		const outName = getOutName(doc.fileName, compileTarget);
		const args: string[] = ['-o', outName];

		if (options.executeOnly === true) {
			args.push('-x');
		}

		if (compileTarget === 'app' && options.stayOpen === true) {
			args.push('-s');
		}

		if (compileTarget === 'app' && options.startupScreen === true) {
			args.push('-u');
		}

		args.push(doc.fileName);

		spawnPromise('osacompile', doc.fileName, args, outputChannel)
			.then(() => {
				if (showNotifications) {
					window.showInformationMessage(`Successfully compiled '${doc.fileName}'`);
				}
			})
			.catch((error) => {
				console.error('[idleberg.applescript]', error instanceof Error ? error.message : error);

				outputChannel.show();

				if (showNotifications) {
					window.showErrorMessage('Failed to compile or exited with error (see output for details)');
				}
			});
	});
}

async function osascript(): Promise<void> {
	const { ignoreOS, osascript, showNotifications } = await getConfig('applescript');

	if (platform() !== 'darwin' && ignoreOS !== true) {
		window.showWarningMessage('This command is only available on macOS');
		return;
	}

	const doc = window?.activeTextEditor?.document;

	if (!doc) {
		console.error('[idleberg.applescript] Document not found');
		return;
	}

	const args: string[] = [];

	if (doc.isDirty) {
		const lines = doc.getText().split('\n');

		for (const line of lines) {
			args.push('-e', line);
		}
	} else {
		args.push(doc.fileName);
	}

	if (osascript.outputStyle.trim().length > 0 && osascript.outputStyle.trim().length <= 2) {
		args.unshift('-s', osascript.outputStyle.trim());
	}

	spawnPromise('osascript', doc.fileName, args, outputChannel).catch((error) => {
		console.error('[idleberg.applescript]', error instanceof Error ? error.message : error);
		outputChannel.show();

		if (showNotifications) {
			window.showErrorMessage('Failed to run script or exited with error (see output for details)');
		}
	});
}

/**
 * Decompiles a binary AppleScript (.scpt) file to source text
 * @param filePath Path to the .scpt file to decompile
 * @returns Promise resolving to the decompiled source code
 */
async function osadecompile(filePath: string): Promise<string> {
	const { ignoreOS } = await getConfig('applescript');

	if (platform() !== 'darwin' && ignoreOS !== true) {
		throw new Error('osadecompile is only available on macOS');
	}

	return new Promise((resolve, reject) => {
		const { spawn } = require('node:child_process');
		const process = spawn('osadecompile', [filePath]);

		let stdout = '';
		let stderr = '';

		process.stdout.on('data', (data: Buffer) => {
			stdout += data.toString();
		});

		process.stderr.on('data', (data: Buffer) => {
			stderr += data.toString();
		});

		process.on('close', (code: number) => {
			if (code !== 0) {
				const error = stderr || 'Unknown error';
				console.error('[idleberg.applescript] osadecompile failed:', error);
				reject(new Error(`Failed to decompile ${filePath}: ${error}`));
			} else {
				resolve(stdout);
			}
		});

		process.on('error', (error: Error) => {
			console.error('[idleberg.applescript] osadecompile error:', error);
			reject(error);
		});
	});
}

/**
 * Compiles AppleScript source to a binary file using stdin
 * @param sourceCode AppleScript source code
 * @param outputPath Path where the compiled .scpt should be written
 */
async function osacompileFromSource(sourceCode: string, outputPath: string): Promise<void> {
	const { ignoreOS } = await getConfig('applescript');

	if (platform() !== 'darwin' && ignoreOS !== true) {
		throw new Error('osacompile is only available on macOS');
	}

	return new Promise((resolve, reject) => {
		const { spawn } = require('node:child_process');
		const process = spawn('osacompile', ['-o', outputPath, '-']);

		let stderr = '';

		process.stderr.on('data', (data: Buffer) => {
			stderr += data.toString();
		});

		process.on('close', (code: number) => {
			if (code !== 0) {
				const error = stderr || 'Unknown error';
				console.error('[idleberg.applescript] osacompile failed:', error);
				reject(new Error(`Failed to compile to ${outputPath}: ${error}`));
			} else {
				resolve();
			}
		});

		process.on('error', (error: Error) => {
			console.error('[idleberg.applescript] osacompile error:', error);
			reject(error);
		});

		// Write source code to stdin
		process.stdin.write(sourceCode);
		process.stdin.end();
	});
}

export { osacompile, osacompileFromSource, osadecompile, osascript };
