import assert from 'node:assert/strict';
import { test } from 'node:test';

import { byteCountNote, decodeHex, hexDump } from '../visualize/hex-dump';

test('decodeHex turns hex digits into bytes', () => {
  assert.deepEqual(Array.from(decodeHex('00ff10')), [0, 255, 16]);
});

test('byteCountNote mentions the total only when the value was cut off', () => {
  assert.equal(byteCountNote(4, 4), '4 byte(s)');
  assert.equal(byteCountNote(4, 10), '4 byte(s) (showing first 4 of 10)');
});

test('hexDump lists offset, grouped hex and escaped ASCII', () => {
  const line = hexDump(decodeHex('413c'), 1);
  assert.equal(
    line.startsWith(
      '<span class="off">00000000</span>  <span class="g">41</span> <span class="g">3c</span>',
    ),
    true,
  );
  assert.equal(line.includes('<span class="asc">A&lt;</span>'), true);
  assert.equal(line.endsWith('\n'), true);
});

test('hexDump gives complete 2–8 byte groups an integer tooltip, but not a cut-off tail group', () => {
  const dump = hexDump(decodeHex('010203'), 2);
  assert.equal(dump.includes(' title="u16 LE: 513 · BE: 258"'), true);
  assert.equal(dump.split('title=').length - 1, 1);
});

test('hexDump pads a short line with blank groups so the ASCII column stays aligned', () => {
  // 1 byte shown, 15 blank two-character groups, single spaces between groups, two before the ASCII column.
  const padding = ' '.repeat(1 + 15 * 2 + 14 + 2);
  assert.equal(
    hexDump(decodeHex('41'), 1).includes(
      `</span>${padding}<span class="asc">A</span>`,
    ),
    true,
  );
});
