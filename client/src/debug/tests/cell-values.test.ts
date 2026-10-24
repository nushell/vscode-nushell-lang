import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cellText, compareCells, isBinary, isRecord } from '../visualize/cell-values';

test("isBinary and isRecord tell the adapter's binary marker apart from a record", () => {
  const binary = { $nuBinary: '00ff', length: 2 };
  assert.equal(isBinary(binary), true);
  assert.equal(isRecord(binary), false);
  assert.equal(isRecord({ name: 'x' }), true);
  assert.equal(isRecord([1, 2]), false);
  assert.equal(isRecord(null), false);
});

test('cellText shows scalars verbatim, nothing as null, binaries by size', () => {
  assert.equal(cellText('hi'), 'hi');
  assert.equal(cellText(3), '3');
  assert.equal(cellText(null), 'null');
  assert.equal(cellText(undefined), 'null');
  assert.equal(cellText({ $nuBinary: '00ff', length: 2 }), '<binary 2 bytes>');
});

test('cellText renders a nested value as JSON, cut off at 120 characters', () => {
  assert.equal(cellText({ a: [1, 2] }), '{"a":[1,2]}');
  const long = cellText({ text: 'x'.repeat(200) });
  assert.equal(long.length, 118);
  assert.equal(long.endsWith('…'), true);
});

test('compareCells sorts nothing last and everything else numerically or as text', () => {
  assert.equal(compareCells(null, 1) > 0, true);
  assert.equal(compareCells(1, undefined) < 0, true);
  assert.equal(compareCells(null, undefined), 0);
  assert.equal(compareCells(2, 10) < 0, true);
  assert.equal(compareCells('2', '10') < 0, true);
  assert.equal(compareCells('b', 'a') > 0, true);
});
