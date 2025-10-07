import { promises as fs } from 'node:fs';
import { basename, resolve } from 'node:path';
import { window, workspace } from 'vscode';
import { getConfig } from 'vscode-get-config';
import { fileExists, getOutName } from './util.ts';

async function createBuildTask(isJXA = false): Promise<void> {
	if (typeof workspace.workspaceFolders === 'undefined' || workspace.workspaceFolders.length < 1) {
		window.showErrorMessage(
			'Task support is only available when working on a workspace folder. It is not available when editing single files.',
		);
		return;
	}

	const { alwaysOpenBuildTask, defaultBuildTask, osacompile, osascript } = await getConfig('applescript');

	const doc = window.activeTextEditor?.document;

	if (!doc) {
		console.error('[idleberg.applescript] Document not found');
		return;
	}
	const fileName: string = basename(doc.fileName);

	const args: string[] = [];
	const runArgs: string[] = [];
	const appArgs: string[] = [];

	if (isJXA === true) {
		args.push('-l', 'JavaScript');
	}

	if (osacompile.executeOnly === true) {
		args.push('-x');
	}

	if (osacompile.stayOpen === true) {
		appArgs.push('-s');
	}

	if (osacompile.startupScreen === true) {
		appArgs.push('-u');
	}

	if (osascript.outputStyle.trim().length > 0 && osascript.outputStyle.trim().length <= 2) {
		runArgs.push('-s', osascript.outputStyle.trim());
	}

	const taskFile = {
		version: '2.0.0',
		tasks: [
			{
				label: 'Run Script',
				type: 'shell',
				command: 'osascript',
				args: [...args, ...runArgs, fileName],
			},
			{
				label: 'Compile Script',
				type: 'shell',
				command: 'osacompile',
				args: [...args, '-o', basename(getOutName(doc.fileName)), fileName],
				group: defaultBuildTask === 'script' ? 'build' : 'none',
			},
			{
				label: 'Compile Script Bundle',
				type: 'shell',
				command: 'osacompile',
				args: [...args, '-o', basename(getOutName(doc.fileName, 'scptd')), fileName],
				group: defaultBuildTask === 'bundle' ? 'build' : 'none',
			},
			{
				label: 'Compile Application',
				type: 'shell',
				command: 'osacompile',
				args: [...args, '-o', basename(getOutName(doc.fileName, 'app')), fileName],
				group: defaultBuildTask === 'app' ? 'build' : 'none',
			},
		],
	};

	if (!workspace.workspaceFolders[0]?.uri.fsPath) {
		window.showErrorMessage('Did not find workspace folder.');
		return;
	}

	const jsonString = JSON.stringify(taskFile, null, 2);
	const dotFolder = resolve(workspace.workspaceFolders[0].uri.fsPath, '.vscode');
	const buildFile = resolve(dotFolder, 'tasks.json');

	try {
		await fs.mkdir(dotFolder);
	} catch {
		console.warn('[idleberg.applescript] This workspace already contains a .vscode folder.');
	}

	if (await fileExists(buildFile)) {
		window.showErrorMessage(
			'This workspace already has a task file. If you want to override it, delete it manually and try again.',
		);
		return;
	}

	try {
		await fs.writeFile(buildFile, jsonString);

		if (alwaysOpenBuildTask) {
			const taskFile = await workspace.openTextDocument(buildFile);
			window.showTextDocument(taskFile);
		}
	} catch (error) {
		console.error('[idleberg.applescript]', error instanceof Error ? error.message : error);
	}
}

export { createBuildTask };
