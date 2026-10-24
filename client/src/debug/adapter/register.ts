import * as vscode from 'vscode';

import { DEBUG_TYPE } from '../shared/debug-type';
import {
  AdapterDescriptorFactory,
  NushellResolver,
} from './descriptor-factory';

export function register(resolveNushell: NushellResolver): vscode.Disposable[] {
  return [
    vscode.debug.registerDebugAdapterDescriptorFactory(
      DEBUG_TYPE,
      new AdapterDescriptorFactory(resolveNushell),
    ),
  ];
}
