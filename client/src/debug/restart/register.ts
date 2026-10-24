import * as vscode from 'vscode';

import { noteSaveReason, restartIfDebuggingNuScript } from './restart-on-save';

export function register(): vscode.Disposable[] {
  return [
    vscode.workspace.onWillSaveTextDocument(noteSaveReason),
    vscode.workspace.onDidSaveTextDocument(restartIfDebuggingNuScript),
  ];
}
