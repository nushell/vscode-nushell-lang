// Reading the values in the visualizer's JSON payload: what kind each one is,
// how it shows in a table cell, and how two cells order. DOM-free, so the node
// test suite covers it; the webview bundle imports it too.

/** How the adapter encodes a nu binary in the JSON payload: hex digits plus the original byte count. */
export interface BinaryMarker {
  $nuBinary: string;
  length: number;
}

/** A nu record as it arrives in the payload. */
export type NuRecord = { [field: string]: unknown };

/** Longest cell text for a nested value before it is cut off with an ellipsis. */
const MAX_CELL_JSON = 120;

export function isBinary(value: unknown): value is BinaryMarker {
  if (!isPlainObject(value)) {
    return false;
  }

  return typeof (value as { $nuBinary?: unknown }).$nuBinary === 'string';
}

export function isRecord(value: unknown): value is NuRecord {
  return isPlainObject(value) && !isBinary(value);
}

function isPlainObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNothing(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/** One cell's text: scalars verbatim, nested values as truncated JSON. */
export function cellText(value: unknown): string {
  if (isNothing(value)) {
    return 'null';
  }

  if (isBinary(value)) {
    return `<binary ${value.length} bytes>`;
  }

  if (typeof value === 'object') {
    return truncate(JSON.stringify(value));
  }

  return String(value);
}

function truncate(json: string): string {
  if (json.length <= MAX_CELL_JSON) {
    return json;
  }

  return `${json.slice(0, MAX_CELL_JSON - 3)}…`;
}

/** Column order: nothing sorts last, numbers (and numeric strings) numerically, everything else as text. */
export function compareCells(a: unknown, b: unknown): number {
  if (isNothing(a) || isNothing(b)) {
    return compareNothing(a, b);
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  const aNumber = asNumber(a);
  const bNumber = asNumber(b);
  if (aNumber !== undefined && bNumber !== undefined) {
    return aNumber - bNumber;
  }

  return cellText(a).localeCompare(cellText(b));
}

/** At least one side is nothing: nothing sorts after everything, two nothings are equal. */
function compareNothing(a: unknown, b: unknown): number {
  if (isNothing(a) && isNothing(b)) {
    return 0;
  }

  if (isNothing(a)) {
    return 1;
  }

  return -1;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'object') {
    return undefined;
  }

  const text = String(value).trim();
  if (text === '') {
    return undefined;
  }

  const number = Number(text);
  if (Number.isNaN(number)) {
    return undefined;
  }

  return number;
}
