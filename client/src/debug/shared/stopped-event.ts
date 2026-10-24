import * as vscode from 'vscode';

import { isStoppedEvent } from './dap-message';
import { DEBUG_TYPE } from './debug-type';

/**
 * Subscribe to the adapter's `stopped` events. Time-travel navigation (Step
 * Back / Reverse Continue) emits `stopped` without running any code, so nothing
 * else (like the `nuDapIr` event) announces those pauses.
 */
export function onStopped(
  handle: (session: vscode.DebugSession) => void,
): vscode.Disposable {
  return vscode.debug.registerDebugAdapterTrackerFactory(DEBUG_TYPE, {
    createDebugAdapterTracker(
      session: vscode.DebugSession,
    ): vscode.DebugAdapterTracker {
      return {
        onDidSendMessage(message: unknown): void {
          if (!isStoppedEvent(message)) {
            return;
          }

          handle(session);
        },
      };
    },
  });
}
