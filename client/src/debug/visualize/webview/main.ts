// Webview client for the Nushell Visualizer panel. Bundled by esbuild into
// visualize-panel.webview.js; the payload arrives in the page's
// <script type="application/json" id="nu-data"> element (see visualize-panel.ts).

import { isBinary, isRecord } from '../cell-values';
import { VisualizePayload } from '../webview-payload';
import { renderBinary } from './hex-view';
import { renderList, renderRecord, renderTable } from './table-view';
import { renderString } from './text-view';

const payload = JSON.parse(
  document.getElementById('nu-data')!.textContent!,
) as VisualizePayload;
document.getElementById('root')!.appendChild(render(payload.value));

function render(value: unknown): HTMLElement {
  if (isBinary(value)) {
    return renderBinary(value);
  }

  if (typeof value === 'string') {
    return renderString(value);
  }

  if (Array.isArray(value)) {
    return renderItems(value);
  }

  if (isRecord(value)) {
    return renderRecord(value);
  }

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(value, null, 2);
  return pre;
}

/** A non-empty list of records is a nu table; any other list is shown item by item. */
function renderItems(items: unknown[]): HTMLElement {
  if (items.length > 0 && items.every(isRecord)) {
    return renderTable(items);
  }

  return renderList(items);
}
