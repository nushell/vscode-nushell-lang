import assert from 'node:assert/strict';
import { test } from 'node:test';

import { escapeAttribute, escapeHtml } from '../shared/escape-html';

test('escapeHtml neutralises markup', () => {
  assert.equal(escapeHtml(`<a & "b">`), `&lt;a &amp; "b"&gt;`);
});

test('escapeAttribute also neutralises both quote characters', () => {
  assert.equal(escapeAttribute(`a"b'c<d>`), 'a&quot;b&#39;c&lt;d&gt;');
});
