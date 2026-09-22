import * as vscode from 'vscode';
import * as path from 'path';

export let doc: vscode.TextDocument;
export let editor: vscode.TextEditor;

const EXTENSION_ID = 'TheNuProjectContributors.vscode-nushell-lang';

/**
 * Activates the extension and opens the given document.
 */
export async function activate(docUri: vscode.Uri) {
  const ext = vscode.extensions.getExtension(EXTENSION_ID);
  if (!ext) {
    throw new Error(`Extension ${EXTENSION_ID} not found`);
  }
  await ext.activate();
  doc = await vscode.workspace.openTextDocument(docUri);
  editor = await vscode.window.showTextDocument(doc);
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Polls `check` until it returns a truthy value or the timeout elapses.
 */
export async function waitFor<T>(
  check: () => Promise<T | undefined> | T | undefined,
  timeoutMs = 20000,
  intervalMs = 250,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: T | undefined;
  while (Date.now() < deadline) {
    last = await check();
    if (last) {
      return last;
    }
    await sleep(intervalMs);
  }
  throw new Error(`Timed out after ${timeoutMs}ms; last value: ${last}`);
}

export const getDocPath = (p: string) => {
  return path.resolve(__dirname, '../../testFixture', p);
};
export const getDocUri = (p: string) => {
  return vscode.Uri.file(getDocPath(p));
};

export async function setTestContent(content: string): Promise<boolean> {
  const all = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length),
  );
  return editor.edit((eb) => eb.replace(all, content));
}
