import { basename, join } from 'node:path';
import { getConfig } from 'vscode-get-config';
import { getOutName } from './util';
import { mkdir, writeFile } from 'node:fs';
import { window, workspace } from 'vscode';

async function createBuildTask(isJXA = false): Promise<void> {
  if (!workspace.workspaceFolders?.length) {
    window.showErrorMessage('Task support is only available when working on a workspace folder. It is not available when editing single files.');
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
    'version': '2.0.0',
    'tasks': [
      {
        'label': 'Run Script',
        'type': 'shell',
        'command': 'osascript',
        'args': [...args, ...runArgs, fileName],
      },
      {
        'label': 'Compile Script',
        'type': 'shell',
        'command': 'osacompile',
        'args': [...args, '-o', basename(getOutName(doc.fileName)), fileName],
        'group': (defaultBuildTask === 'script') ? 'build' : 'none'
      },
      {
        'label': 'Compile Script Bundle',
        'type': 'shell',
        'command': 'osacompile',
        'args': [...args, '-o', basename(getOutName(doc.fileName, 'scptd')), fileName],
        'group': (defaultBuildTask === 'bundle') ? 'build' : 'none'
      },
      {
        'label': 'Compile Application',
        'type': 'shell',
        'command': 'osacompile',
        'args': [...args, '-o', basename(getOutName(doc.fileName, 'app')), fileName],
        'group': (defaultBuildTask === 'app') ? 'build' : 'none'
      }
    ]
  };

  const jsonString = JSON.stringify(taskFile, null, 2);
  const dotFolder = join(workspace.workspaceFolders?.[0], '/.vscode');
  const buildFile = join(dotFolder, 'tasks.json');

  mkdir(dotFolder, () => {
    // ignore errors for now
    writeFile(buildFile, jsonString, (error: Error) => {
      if (error) {
        window.showErrorMessage(error.toString());
      }
      if (alwaysOpenBuildTask === false)
        return;

      // Open tasks.json
      workspace.openTextDocument(buildFile).then((doc) => {
        window.showTextDocument(doc);
      });
    });
  });
}

export { createBuildTask };
