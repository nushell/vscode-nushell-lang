import * as vscode from 'vscode';

import { isNuSession } from './session';

/** Subscribe to one of the adapter's custom DAP events (`nuDapIr`, `nuDapUi`, …) from a nushell session. */
export function onCustomEvent<Body>(
  name: string,
  handle: (session: vscode.DebugSession, body: Body) => void,
): vscode.Disposable {
  return vscode.debug.onDidReceiveDebugSessionCustomEvent((event) => {
    if (!isNuSession(event.session)) {
      return;
    }

    if (event.event !== name) {
      return;
    }

    handle(event.session, event.body as Body);
  });
}
