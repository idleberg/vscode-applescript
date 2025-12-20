import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type * as vscode from 'vscode';
import { osacompileFromSource, osadecompile } from './osa.ts';

const execFileAsync = promisify(execFile);

/**
 * Decompiles a binary AppleScript (.scpt) file to source text
 * @param filePath Absolute path to the .scpt file
 * @returns Decompiled AppleScript source code
 */
export async function decompileScpt(filePath: string): Promise<string> {
	return await osadecompile(filePath);
}

/**
 * Compiles AppleScript source code to a binary .scpt file
 * @param sourceCode AppleScript source code
 * @param outputPath Absolute path where the .scpt file should be written
 */
export async function compileScpt(sourceCode: string, outputPath: string): Promise<void> {
	return await osacompileFromSource(sourceCode, outputPath);
}

/**
 * Validates that we're running on macOS and have access to osa tools
 * @returns true if osa tools are available
 */
export async function validateOsaTools(): Promise<boolean> {
	if (process.platform !== 'darwin') {
		return false;
	}

	try {
		await execFileAsync('which', ['osadecompile']);
		await execFileAsync('which', ['osacompile']);
		return true;
	} catch {
		return false;
	}
}

/**
 * Converts a file: URI to a scpt: URI for the virtual filesystem
 */
export function fileUriToScptUri(uri: vscode.Uri): vscode.Uri {
	return uri.with({ scheme: 'scpt' });
}

/**
 * Converts a scpt: URI back to a file: URI
 */
export function scptUriToFileUri(uri: vscode.Uri): vscode.Uri {
	return uri.with({ scheme: 'file' });
}
