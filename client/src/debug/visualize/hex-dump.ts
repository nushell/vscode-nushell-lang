// The hex listing of a binary value: offset · grouped hex bytes · ASCII, as
// markup text. DOM-free, so the node test suite covers it.

import { escapeHtml } from '../shared/escape-html';

/** Bytes per line: 16, or one group when a group is wider than that. */
const BYTES_PER_LINE = 16;

export function decodeHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

export function byteCountNote(shown: number, total: number): string {
  if (total > shown) {
    return `${shown} byte(s) (showing first ${shown} of ${total})`;
  }

  return `${shown} byte(s)`;
}

export function hexDump(bytes: Uint8Array, groupSize: number): string {
  const perLine = Math.max(BYTES_PER_LINE, groupSize);
  const lines: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += perLine) {
    const end = Math.min(offset + perLine, bytes.length);
    lines.push(
      `${offsetHtml(offset)}  ${groupsHtml(bytes, offset, end, perLine, groupSize)}  ${asciiHtml(bytes, offset, end)}\n`,
    );
  }

  return lines.join('');
}

function offsetHtml(offset: number): string {
  return `<span class="off">${offset.toString(16).padStart(8, '0')}</span>`;
}

/** Every group on the line; the last line is padded with blanks so the ASCII column stays aligned. */
function groupsHtml(
  bytes: Uint8Array,
  offset: number,
  end: number,
  perLine: number,
  groupSize: number,
): string {
  const cells: string[] = [];
  for (let start = offset; start < offset + perLine; start += groupSize) {
    if (start >= end) {
      cells.push(' '.repeat(groupSize * 2));
      continue;
    }

    const groupEnd = Math.min(start + groupSize, end);
    const hex = Array.from(bytes.subarray(start, groupEnd), (byte) =>
      byte.toString(16).padStart(2, '0'),
    )
      .join('')
      .padEnd(groupSize * 2, ' ');
    cells.push(
      `<span class="g"${groupTooltip(bytes, start, groupEnd, groupSize)}>${hex}</span>`,
    );
  }

  return cells.join(' ');
}

/** For a complete group of 2–8 bytes: its value as an unsigned integer, both endiannesses. A cut-off tail group gets none. */
function groupTooltip(
  bytes: Uint8Array,
  start: number,
  end: number,
  groupSize: number,
): string {
  const size = end - start;
  if (size !== groupSize) {
    return '';
  }

  if (size < 2 || size > 8) {
    return '';
  }

  let littleEndian = 0n;
  let bigEndian = 0n;
  for (let i = 0; i < size; i++) {
    bigEndian = (bigEndian << 8n) | BigInt(bytes[start + i]);
    littleEndian |= BigInt(bytes[start + i]) << BigInt(8 * i);
  }

  return ` title="u${size * 8} LE: ${littleEndian} · BE: ${bigEndian}"`;
}

function asciiHtml(bytes: Uint8Array, offset: number, end: number): string {
  let text = '';
  for (let i = offset; i < end; i++) {
    text += asciiChar(bytes[i]);
  }

  return `<span class="asc">${text}</span>`;
}

function asciiChar(byte: number): string {
  if (byte < 32 || byte >= 127) {
    return '·';
  }

  return escapeHtml(String.fromCharCode(byte));
}
