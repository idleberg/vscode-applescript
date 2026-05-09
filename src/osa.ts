import { platform } from 'node:os';
import { window } from 'vscode';
import { getConfig } from 'vscode-get-config';
import { outputChannel } from './channel.ts';
import { getOutName, spawnPromise } from './util.ts';

const IS_DARWIN = platform() === 'darwin';

export async function osacompile(compileTarget: string): Promise<void> {
	const { ignoreOS, osacompile, showNotifications } = await getConfig('applescript');

	// might become useful in a future release
	const options = { ...osacompile };

	if (!IS_DARWIN && ignoreOS !== true) {
		window.showWarningMessage('This command is only available on macOS');
		return;
	}

	const doc = window.activeTextEditor?.document;

	if (!doc) {
		console.error('[idleberg.applescript] Document not found');
		return;
	}

	await doc.save();

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

	try {
		await spawnPromise('osacompile', doc.fileName, args, outputChannel);
		if (showNotifications) {
			window.showInformationMessage(`Successfully compiled '${doc.fileName}'`);
		}
	} catch (error) {
		console.error('[idleberg.applescript]', error instanceof Error ? error.message : error);

		outputChannel.show();

		if (showNotifications) {
			window.showErrorMessage('Failed to compile or exited with error (see output for details)');
		}
	}
}

export async function osascript(): Promise<void> {
	const { ignoreOS, osascript, showNotifications } = await getConfig('applescript');

	if (!IS_DARWIN && ignoreOS !== true) {
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

	const outputStyle = osascript.outputStyle.trim();

	if (outputStyle.length > 0 && outputStyle.length <= 2) {
		args.unshift('-s', outputStyle);
	}

	try {
		await spawnPromise('osascript', doc.fileName, args, outputChannel);
	} catch (error) {
		console.error('[idleberg.applescript]', error instanceof Error ? error.message : error);
		outputChannel.show();

		if (showNotifications) {
			window.showErrorMessage('Failed to run script or exited with error (see output for details)');
		}
	}
}

/**
 * Decompiles a binary AppleScript (.scpt) file to source text
 * @param filePath Path to the .scpt file to decompile
 * @returns Promise resolving to the decompiled source code
 */
export async function osadecompile(filePath: string): Promise<string> {
	const { ignoreOS } = await getConfig('applescript');

	if (!IS_DARWIN && ignoreOS !== true) {
		throw new Error('osadecompile is only available on macOS');
	}

	try {
		const { stdout } = await spawnPromise('osadecompile', filePath, [filePath], outputChannel);
		return stdout;
	} catch (error) {
		throw new Error(`Failed to decompile ${filePath}: ${error instanceof Error ? error.message : error}`);
	}
}

/**
 * Compiles AppleScript source to a binary file using stdin
 * @param sourceCode AppleScript source code
 * @param outputPath Path where the compiled .scpt should be written
 */
export async function osacompileFromSource(sourceCode: string, outputPath: string): Promise<string> {
	const { ignoreOS } = await getConfig('applescript');

	if (!IS_DARWIN && ignoreOS !== true) {
		throw new Error('osacompile is only available on macOS');
	}

	const args = ['-o', outputPath, '-'];

	try {
		const { stdout } = await spawnPromise('osacompile', outputPath, args, outputChannel, sourceCode);
		return stdout;
	} catch (error) {
		throw new Error(`Failed to compile to ${outputPath}: ${error instanceof Error ? error.message : error}`);
	}
}
