import * as vscode from 'vscode';

import { DEBUG_TYPE } from '../shared/debug-type';
import { DapTraceFactory } from './dap-trace';

export function register(): vscode.Disposable[] {
  const channel = vscode.window.createOutputChannel('Nushell Debug');
  return [
    channel,
    vscode.debug.registerDebugAdapterTrackerFactory(
      DEBUG_TYPE,
      new DapTraceFactory(channel),
    ),
  ];
}
