import * as vscode from 'vscode';

import { DEBUG_TYPE } from './debug-type';

export function isNuSession(session: vscode.DebugSession): boolean {
  return session.type === DEBUG_TYPE;
}

/** The active debug session, when it is one of ours. */
export function activeNuSession(): vscode.DebugSession | undefined {
  const session = vscode.debug.activeDebugSession;
  if (!session) {
    return undefined;
  }

  if (!isNuSession(session)) {
    return undefined;
  }

  return session;
}
