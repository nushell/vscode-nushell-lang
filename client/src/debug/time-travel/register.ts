import * as vscode from 'vscode';

import { DEBUG_TYPE } from '../shared/debug-type';
import { TimeTravelDefaults } from './time-travel-defaults';

export function register(): vscode.Disposable[] {
  return [
    vscode.debug.registerDebugConfigurationProvider(
      DEBUG_TYPE,
      new TimeTravelDefaults(),
    ),
  ];
}
