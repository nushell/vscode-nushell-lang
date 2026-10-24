import * as vscode from 'vscode';

import { assetPath } from '../shared/assets';
import { hint, makeNonce, renderTemplate } from '../shared/html';
import { irLine } from './ir-listing';

/** Body of the adapter's `nuDapIr` event, sent on every stop. */
export interface IrEventBody {
  text: string;
  instructionIndex: number;
  instructionCount: number; // unused here; part of the wire shape
}

// The singleton webview showing the IR of the block the debugger is paused in,
// with the current instruction highlighted. Updates on every stop; shows the
// most recent stop's IR if opened later. The page is ir-panel.html, copied to
// out/debug/.

let panel: vscode.WebviewPanel | undefined;
let latest: IrEventBody | undefined;
let ended = false;

export function showIrPanel(): void {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside, true);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'nuDapIr',
    'Nushell IR',
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: true },
  );

  panel.onDidDispose(() => {
    panel = undefined;
  });

  render();
}

export function updateIrPanel(body: IrEventBody): void {
  latest = body;
  ended = false;
  render();
}

export function markIrPanelEnded(): void {
  ended = true;
  render();
}

function render(): void {
  if (!panel) {
    return;
  }

  panel.webview.html = renderTemplate(assetPath('ir-panel.html'), {
    nonce: makeNonce(),
    status: status(),
    listing: listing(),
  });
}

function status(): string {
  if (!ended) {
    return '';
  }

  return hint('Debug session ended — showing the last stop.');
}

function listing(): string {
  const shown = latest;
  if (!shown) {
    return hint(
      'Waiting for the debugger to stop… (the IR of the current block is sent on every breakpoint/step)',
    );
  }

  const lines = shown.text
    .split('\n')
    .map((line) => irLine(line, shown.instructionIndex));
  return `<pre>${lines.join('')}</pre>`;
}
