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

  let doc = window.activeTextEditor.document;

  const args = [];
  let runArgs = [basename(doc.fileName)];
  let scriptArgs = ['-o', basename(getOutName(doc.fileName)), basename(doc.fileName)];
  let bundleArgs = ['-o', basename(getOutName(doc.fileName, 'scptd')), basename(doc.fileName)];
  let appArgs = ['-o', basename(getOutName(doc.fileName, 'app')), basename(doc.fileName)];

  if (config.osacompile.executeOnly === true) {
    args.unshift('-x');
  }

  if (config.osacompile.stayOpen === true) {
    appArgs.unshift('-s');
  }

  if (config.osacompile.startupScreen === true) {
    appArgs.unshift('-u');
  }

  if (isJXA === true) {
    args.push('-l', 'JavaScript');
  }

  if (config.osascript.outputStyle.trim().length > 0 && config.osascript.outputStyle.trim().length <= 2) {
    runArgs.unshift('-s', config.osascript.outputStyle.trim());
  }

  runArgs = args.concat(runArgs);
  scriptArgs = args.concat(scriptArgs);
  bundleArgs = args.concat(bundleArgs);
  appArgs = args.concat(appArgs);

  const { version } = require('../package.json');

  let taskFile = {
    'version': '2.0.0',
    'tasks': [
      {
        'label': 'Run Script',
        'type': 'shell',
        'command': 'osascript',
        'args': runArgs,
      },
      {
        'label': 'Compile Script',
        'type': 'shell',
        'command': 'osacompile',
        'args': scriptArgs,
        'group': (config.defaultBuildTask === 'script') ? 'build' : 'none'
      },
      {
        'label': 'Compile Script Bundle',
        'type': 'shell',
        'command': 'osacompile',
        'args': bundleArgs,
        'group': (config.defaultBuildTask === 'bundle') ? 'build' : 'none'
      },
      {
        'label': 'Compile Application',
        'type': 'shell',
        'command': 'osacompile',
        'args': appArgs,
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
