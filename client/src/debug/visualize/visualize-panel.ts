import * as vscode from 'vscode';

import { assetDir, assetPath } from '../shared/assets';
import { escapeHtml } from '../shared/escape-html';
import { hint, makeNonce, renderTemplate } from '../shared/html';
import { VisualizeResponse } from './visualize-request';
import { VisualizePayload } from './webview-payload';

// The singleton webview rendering one variable as structured, interactive data:
// - list of records (a nu table) -> sortable/filterable grid
// - record -> sortable/filterable field/value table
// - list -> sortable/filterable indexed table
// - binary -> aligned hex view with 1/2/4/8/16/32/64-byte grouping and
//   LE/BE integer tooltips on groups
// - string -> JSON/XML auto-detection with formatting + syntax highlighting
// - anything else -> pretty-printed
//
// The page is visualize-panel.html; all rendering happens client-side in
// visualize-panel.webview.js (esbuild's bundle of webview/), from the JSON
// payload embedded in the page. Both are copied to out/debug/, and the
// CSP allows only that nonce'd script.

/** Prefixed to the title while the shown value is out of date. */
const STALE_MARK = '⏸ ';

let panel: vscode.WebviewPanel | undefined;

export function isVisualizePanelOpen(): boolean {
  return panel !== undefined;
}

/** Keep the current content but mark it as out of date. */
export function markVisualizePanelStale(): void {
  if (!panel) {
    return;
  }

  if (panel.title.startsWith(STALE_MARK)) {
    return;
  }

  panel.title = `${STALE_MARK}${panel.title}`;
}

/** Open (or bring back) the panel and render a value in it. */
export function openVisualizePanel(
  name: string,
  body: VisualizeResponse,
): void {
  const target = ensurePanel();
  paint(target, name, body);
  target.reveal(vscode.ViewColumn.Beside, true);
}

/** Repaint an already open panel in place, without stealing the user's layout. */
export function updateVisualizePanel(
  name: string,
  body: VisualizeResponse,
): void {
  if (!panel) {
    return;
  }

  paint(panel, name, body);
}

function ensurePanel(): vscode.WebviewPanel {
  if (panel) {
    return panel;
  }

  const created = vscode.window.createWebviewPanel(
    'nuDapVisualize',
    'Nushell Visualizer',
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: true, localResourceRoots: [vscode.Uri.file(assetDir())] },
  );
  created.onDidDispose(() => {
    panel = undefined;
  });

  panel = created;
  return created;
}

function paint(
  target: vscode.WebviewPanel,
  name: string,
  body: VisualizeResponse,
): void {
  target.title = `$${name}`;
  target.webview.html = html(target.webview, name, body);
}

function html(
  webview: vscode.Webview,
  name: string,
  body: VisualizeResponse,
): string {
  const payload: VisualizePayload = {
    name,
    type: body.type,
    truncated: body.truncated,
    value: body.value,
  };
  const script = webview.asWebviewUri(
    vscode.Uri.file(assetPath('visualize-panel.webview.js')),
  );
  return renderTemplate(assetPath('visualize-panel.html'), {
    nonce: makeNonce(),
    cspSource: webview.cspSource,
    script: script.toString(),
    name: escapeHtml(name),
    type: escapeHtml(body.type),
    truncated: truncatedHint(body.truncated),
    data: embedJson(payload),
  });
}

function truncatedHint(truncated: boolean): string {
  if (!truncated) {
    return '';
  }

  return hint('⚠ output truncated (value exceeds visualizer bounds)');
}

/** `<`-escaped so the payload can never close its <script> element. */
function embedJson(payload: VisualizePayload): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}
