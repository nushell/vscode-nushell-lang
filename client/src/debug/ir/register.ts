import * as vscode from 'vscode';

import { onCustomEvent } from '../shared/custom-event';
import { isNuSession } from '../shared/session';
import {
  IrEventBody,
  markIrPanelEnded,
  showIrPanel,
  updateIrPanel,
} from './ir-panel';

export function register(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand('nushell-debug.showIr', showIrPanel),
    onCustomEvent<IrEventBody>('nuDapIr', (_session, body) =>
      updateIrPanel(body),
    ),
    vscode.debug.onDidTerminateDebugSession((session) => {
      if (!isNuSession(session)) {
        return;
      }

      markIrPanelEnded();
    }),
  ];
}
