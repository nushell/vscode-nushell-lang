import * as crypto from 'crypto';
import * as fs from 'fs';

import { escapeHtml } from './escape-html';

/** A random nonce for a webview's Content-Security-Policy `script-src`. */
export function makeNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/** A muted one-line message, styled by the `.hint` rule every page carries. */
export function hint(text: string): string {
  return `<p class="hint">${escapeHtml(text)}</p>`;
}

const templates = new Map<string, string>();

/**
 * Fill a webview's `.html` template: every `{{key}}` becomes `values[key]`,
 * inserted verbatim — callers escape what needs escaping. Templates ship with
 * the extension and cannot change at runtime, so each is read once.
 */
export function renderTemplate(
  templatePath: string,
  values: Record<string, string>,
): string {
  let template = templates.get(templatePath);
  if (template === undefined) {
    template = fs.readFileSync(templatePath, 'utf8');
    templates.set(templatePath, template);
  }

  return fillTemplate(template, values);
}

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key: string) => values[key] ?? match,
  );
}
