import { getConfig } from 'vscode-get-config';
import { kill } from 'node:process';
import { window } from 'vscode';

const activeProcesses = new Map<number, ActiveProcess>();

export let lastDeleted = 0;

export function add(pid: number, file: string, command: string) {
  activeProcesses.set(pid, {
    created: Date.now(),
    file,
    process: command
  });

  console.log('activeProcesses.add()', Object.fromEntries(activeProcesses));
}

export function remove(pid: number) {
  activeProcesses.delete(pid);
  lastDeleted = pid;

  console.log('activeProcesses.remove()', Object.fromEntries(activeProcesses));
}

export function get(pid: number) {
  const value = activeProcesses.get(pid);
  console.log('activeProcesses.get()', value);

  return value;
}

export async function pick() {
    const processList = Object.entries(Object.fromEntries(activeProcesses)).map(([key, value]) => ({
      label: value.file,
      detail: `${key} ${value.process} ${new Date(value.created).toISOString()}`
    })).reverse();

    if (!processList.length) {
      return;
    }

    const { allowMultiTermination } = await getConfig('applescript');

    const pick = await window.showQuickPick(processList, {
      canPickMany: allowMultiTermination,
      matchOnDescription: true
    });

    if (pick) {
      const picks = Array.isArray(pick)
        ? pick
        : [ pick ];

      picks.map(item => {
        const pid = item.detail.split(' ')[0];

        kill(pid);
      })
    }
}
