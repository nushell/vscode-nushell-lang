/** What visualize-panel.ts embeds in the page and the webview client reads back. */
export interface VisualizePayload {
  name: string;
  type: string;
  truncated: boolean;
  value: unknown;
}
