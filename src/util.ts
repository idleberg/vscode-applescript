import { spawn } from 'node:child_process';
// Dependencies
import { basename, dirname, extname, join } from 'node:path';
import lineColumn from 'line-column';
import { type OutputChannel, window } from 'vscode';
// @ts-expect-error TODO Fix package
import { getConfig } from 'vscode-get-config';
import * as activeProcesses from './processes.ts';

async function getLineCol(lineString: string): Promise<string | boolean> {
	if (!(await getConfig('applescript.convertErrorRange'))) {
		return false;
	}

	const re = /^(?<filePath>[^:]+):(?<rangeFrom>\d+):((?<rangeTo>\d+):)?(?<message>.*)$/u;
	const result = re.exec(lineString);

	if (!result?.groups?.rangeFrom) {
		return false;
	}

	const doc = window.activeTextEditor?.document;

	if (!doc) {
		console.error('[idleberg.applescript] Document not found');
		return false;
	}

	const editorText = doc.getText();

	if (!editorText?.length) {
		console.error('[idleberg.applescript] Empty document');
		return false;
	}

	const lineCol = lineColumn(editorText, { origin: 1 }).fromIndex(Number.parseInt(result.groups.rangeFrom, 10));

	if (!lineCol) {
		return false;
	}

	// is range end specified?
	lineCol.col = lineCol?.col && result.groups.rangeTo ? lineCol.col : 1;

	return `${doc.fileName}:${lineCol.line}:${lineCol.col}:${result.groups.message}`;
}

export function getOutName(fileName: string, extension = 'scpt'): string {
	const dirName = dirname(fileName);
	const baseName = basename(fileName, extname(fileName));
	const outName = join(dirName, `${baseName}.${extension}`);

	return outName;
}

export async function spawnPromise(
	cmd: string,
	fileName: string,
	args: Array<string>,
	outputChannel: OutputChannel,
): Promise<void> {
	const { alwaysShowOutput } = await getConfig('applescript');

	return new Promise((resolve, reject) => {
		outputChannel.clear();

		if (alwaysShowOutput) {
			outputChannel.show();
		}

		const childProcess = spawn(cmd, args);

		if (childProcess?.pid) {
			activeProcesses.add(childProcess.pid, fileName, cmd);
		}

		childProcess.stdout.on('data', async (line: string) => {
			const lineString: string = line.toString().trim();

			if (lineString.length) {
				const lineCol = await getLineCol(lineString);
				const appendLine = lineCol ? lineCol : lineString;

				if (typeof appendLine === 'string') {
					outputChannel.appendLine(appendLine);
				}
			}
		});

		childProcess.stderr.on('data', async (line: string) => {
			const lineString: string = line.toString().trim();

			if (lineString.length) {
				const lineCol = await getLineCol(lineString);
				const appendLine = lineCol ? lineCol : lineString;

				if (typeof appendLine === 'string') {
					outputChannel.appendLine(appendLine);
				}
			}
		});

		childProcess.on('close', (code: number) => {
			if (childProcess?.pid) {
				activeProcesses.remove(childProcess.pid);
			}

			return code === 0 || activeProcesses.lastKilledProcessId === childProcess.pid ? resolve() : reject();
		});
	});
}
