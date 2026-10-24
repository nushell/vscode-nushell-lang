// Formatting a string value for the visualizer: JSON and XML are detected,
// pretty-printed and syntax-highlighted; anything else is shown verbatim.
// DOM-free (produces markup as text), so the node test suite covers it.

import { escapeHtml } from '../shared/escape-html';

/** A string ready for display: the one-line note above it and the safe markup of the listing. */
export interface FormattedText {
  note: string;
  html: string;
}

export function formatText(text: string): FormattedText {
  const trimmed = text.trim();
  const json = parseJson(trimmed);
  if (json !== undefined) {
    return {
      note: `detected JSON — formatted (${text.length} chars)`,
      html: highlightJson(JSON.stringify(json, null, 2)),
    };
  }

  if (looksLikeXml(trimmed)) {
    return {
      note: `detected XML — formatted (${text.length} chars)`,
      html: highlightXml(formatXml(trimmed)),
    };
  }

  return { note: `${text.length} chars`, html: escapeHtml(text) };
}

/** The parsed value when the text is a JSON object or array, otherwise undefined. */
function parseJson(text: string): unknown {
  if (!text.startsWith('{') && !text.startsWith('[')) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined; // not JSON after all
  }
}

function looksLikeXml(text: string): boolean {
  return /^<[!?]?[A-Za-z_]/.test(text) && text.includes('>');
}

/** Keys blue, strings orange, numbers green, keywords purple (see the .k/.s/.n/.b rules). */
export function highlightJson(pretty: string): string {
  const tokenPattern =
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g;
  return escapeHtml(pretty).replace(
    tokenPattern,
    (token, string?: string, colon?: string, keyword?: string) => {
      if (string && colon) {
        return `<span class="k">${string}</span>${colon}`;
      }

      if (string) {
        return `<span class="s">${string}</span>`;
      }

      if (keyword) {
        return `<span class="b">${keyword}</span>`;
      }

      return `<span class="n">${token}</span>`;
    },
  );
}

/** One tag per line, indented by nesting depth. */
export function formatXml(xml: string): string {
  const lines = xml.replace(/>\s*</g, '>\n<').split('\n');
  let depth = 0;
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (/^<\//.test(line)) {
      depth = Math.max(0, depth - 1);
    }

    out.push('  '.repeat(depth) + line);
    if (opensElement(line)) {
      depth++;
    }
  }

  return out.join('\n');
}

/** `<tag …>` alone on its line: not a closing, self-closing, declaration or comment tag, and no inline `</…>`. */
function opensElement(line: string): boolean {
  return (
    /^<[^!?/][^>]*>$/.test(line) && !/\/>$/.test(line) && !/<\//.test(line)
  );
}

/** Tags blue, attribute names yellow, attribute values orange. Escapes the text first. */
function highlightXml(formatted: string): string {
  const tagPattern = /(&lt;\/?)([\w:.-]+)((?:[^&]|&(?!gt;))*?)(\/?&gt;)/g;
  const attributePattern = /([\w:.-]+)(=)("[^"]*"|'[^']*')/g;
  return escapeHtml(formatted).replace(
    tagPattern,
    (_tag, open: string, name: string, attributes: string, close: string) => {
      const highlighted = attributes.replace(
        attributePattern,
        '<span class="a">$1</span>$2<span class="s">$3</span>',
      );
      return `${open}<span class="t">${name}</span>${highlighted}${close}`;
    },
  );
}
