import * as vscode from 'vscode';

import { activeNuSession } from '../shared/session';

/**
 * Documents being saved by the user (Ctrl+S), as opposed to auto-save or
 * focus changes. Only `onWillSaveTextDocument` reports why a save happens,
 * so it is recorded here and checked once the save is done.
 */
const manualSaves = new Set<string>();

export function noteSaveReason(event: vscode.TextDocumentWillSaveEvent): void {
  const key = event.document.uri.toString();
  if (event.reason === vscode.TextDocumentSaveReason.Manual) {
    manualSaves.add(key);
  } else {
    manualSaves.delete(key);
  }
}

/**
 * Hot restart: manually saving the debugged script during an active nushell
 * debug session restarts the session, so the adapter re-reads it from disk.
 * Auto-saves and other files are ignored — each restart re-runs the script's
 * side effects.
 */
export function restartIfDebuggingNuScript(doc: vscode.TextDocument): void {
  const wasManual = manualSaves.delete(doc.uri.toString());
  if (!wasManual) {
    return;
  }

  if (!isRestartOnSaveEnabled()) {
    return;
  }

  const session = activeNuSession();
  if (!session) {
    return;
  }

  if (!isSessionProgram(session, doc)) {
    return;
  }

  void vscode.commands.executeCommand('workbench.action.debug.restart');
}

function isSessionProgram(
  session: vscode.DebugSession,
  doc: vscode.TextDocument,
): boolean {
  const program: unknown = session.configuration.program;
  if (typeof program !== 'string') {
    return false;
  }

  // Uri.file normalizes the path the same way the document's uri is (e.g. the
  // drive letter case on Windows).
  return vscode.Uri.file(program).fsPath === doc.uri.fsPath;
}

function isRestartOnSaveEnabled(): boolean {
  return vscode.workspace
    .getConfiguration('nushellDebugger')
    .get<boolean>('restartOnSave', false);
}
