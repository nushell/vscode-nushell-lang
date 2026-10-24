import * as vscode from 'vscode';

import { splitArgs } from './split-args';

/** Ask for the entry point's arguments. Returns the parsed args, or undefined when cancelled. */
export async function promptArgs(
  signatureLabel: string,
): Promise<string[] | undefined> {
  const entered = await vscode.window.showInputBox({
    title: 'Nushell Debug: arguments',
    prompt: `Requires arguments: ${signatureLabel}`,
    placeHolder: 'e.g. alice 3 (quote values with spaces: "hello world")',
    ignoreFocusOut: true,
  });

  if (entered === undefined) {
    return undefined; // cancelled
  }

  return splitArgs(entered);
}
