'use strict';

import { window, workspace, WorkspaceConfiguration } from 'vscode';

import { mkdir, writeFile } from 'fs';
import { getConfig, getOutName } from './util';
import { basename, join } from 'path';

const createBuildTask = (isJXA = false) => {
  if (typeof workspace.rootPath === 'undefined' || workspace.rootPath === null) {
    return window.showErrorMessage('Task support is only available when working on a workspace folder. It is not available when editing single files.');
  }

  let config: WorkspaceConfiguration = getConfig();
  let command = 'osacompile';

  const doc = window.activeTextEditor.document;
  const fileName: string = basename(doc.fileName);

  const args = [];
  const runArgs = [];
  const scriptArgs = [];
  const bundleArgs = [];
  const appArgs = [];

  if (isJXA === true) {
    args.push('-l', 'JavaScript');
  }

  if (config.osacompile.executeOnly === true) {
    args.push('-x');
  }

  if (config.osacompile.stayOpen === true) {
    appArgs.push('-s');
  }

  if (config.osacompile.startupScreen === true) {
    appArgs.push('-u');
  }

  if (config.osascript.outputStyle.trim().length > 0 && config.osascript.outputStyle.trim().length <= 2) {
    runArgs.push('-s', config.osascript.outputStyle.trim());
  }

  let taskFile = {
    'version': '2.0.0',
    'tasks': [
      {
        'label': 'Run Script',
        'type': 'shell',
        'command': 'osascript',
        'args': [ ...args, ...runArgs, fileName ],
      },
      {
        'label': 'Compile Script',
        'type': 'shell',
        'command': 'osacompile',
        'args': [ ...args, '-o', basename(getOutName(doc.fileName)), fileName ],
        'group': (config.defaultBuildTask === 'script') ? 'build' : 'none'
      },
      {
        'label': 'Compile Script Bundle',
        'type': 'shell',
        'command': 'osacompile',
        'args': [ ...args, '-o', basename(getOutName(doc.fileName, 'scptd')), fileName ],
        'group': (config.defaultBuildTask === 'bundle') ? 'build' : 'none'
      },
      {
        'label': 'Compile Application',
        'type': 'shell',
        'command': 'osacompile',
        'args': [ ...args, '-o', basename(getOutName(doc.fileName, 'app')), fileName ],
        'group': (config.defaultBuildTask === 'app') ? 'build' : 'none'
      }
    ]
  };

  let jsonString = JSON.stringify(taskFile, null, 2);
  let dotFolder = join(workspace.rootPath, '/.vscode');
  let buildFile = join(dotFolder, 'tasks.json');

  mkdir(dotFolder, (error) => {
    // ignore errors for now
    writeFile(buildFile, jsonString, (error) => {
      if (error) {
        window.showErrorMessage(error.toString());
      }
      if (config.alwaysOpenBuildTask === false) return;

      // Open tasks.json
      workspace.openTextDocument(buildFile).then( (doc) => {
          window.showTextDocument(doc);
      });
    });
  });
};

export { createBuildTask };
