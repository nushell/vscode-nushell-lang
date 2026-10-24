import * as vscode from 'vscode';

import { onStopped } from '../shared/stopped-event';
import { refreshPinnedVariable } from './pinned-variable';
import { visualizeVariable } from './visualize-command';

export function register(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand(
      'nushell-debug.visualizeVariable',
      visualizeVariable,
    ),
    onStopped((session) => void refreshPinnedVariable(session)),
  ];
}
