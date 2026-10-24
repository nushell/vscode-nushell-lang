import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatText, formatXml, highlightJson } from '../visualize/text-format';

test('formatText pretty-prints and highlights JSON', () => {
  const { note, html } = formatText('{"a":1,"b":"x","c":true}');
  assert.equal(note, 'detected JSON — formatted (24 chars)');
  assert.equal(html.includes('<span class="k">"a"</span>:'), true);
  assert.equal(html.includes('<span class="n">1</span>'), true);
  assert.equal(html.includes('<span class="s">"x"</span>'), true);
  assert.equal(html.includes('<span class="b">true</span>'), true);
});

test('highlightJson escapes markup inside strings before highlighting', () => {
  assert.equal(highlightJson('"<b>"'), '<span class="s">"&lt;b&gt;"</span>');
});

test('formatText indents and highlights XML', () => {
  const { note, html } = formatText('<root><item id="1">t</item></root>');
  assert.equal(note, 'detected XML — formatted (34 chars)');
  assert.equal(html.includes('<span class="t">item</span>'), true);
  assert.equal(
    html.includes('<span class="a">id</span>=<span class="s">"1"</span>'),
    true,
  );
});

test('formatXml puts one tag per line, indented by depth', () => {
  assert.equal(
    formatXml('<root><item id="1">t</item><empty/></root>'),
    '<root>\n  <item id="1">t</item>\n  <empty/>\n</root>',
  );
});

test('formatText shows anything else verbatim, escaped', () => {
  assert.deepEqual(formatText('a <b>'), {
    note: '5 chars',
    html: 'a &lt;b&gt;',
  });
  assert.equal(formatText('{nope').note, '5 chars');
});
