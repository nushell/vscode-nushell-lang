import * as vscode from 'vscode';

import { DEBUG_TYPE } from '../shared/debug-type';
import { LaunchConfigurationProvider } from './configuration-provider';

export function register(): vscode.Disposable[] {
  return [
    vscode.debug.registerDebugConfigurationProvider(
      DEBUG_TYPE,
      new LaunchConfigurationProvider(),
    ),
  ];
}
