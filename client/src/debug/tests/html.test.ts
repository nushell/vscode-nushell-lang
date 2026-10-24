import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fillTemplate, hint, makeNonce } from '../shared/html';

test('fillTemplate substitutes every placeholder verbatim', () => {
  assert.equal(
    fillTemplate('<h2>{{name}}</h2>{{name}}: {{type}}', {
      name: '$files',
      type: 'table',
    }),
    '<h2>$files</h2>$files: table',
  );
});

test('fillTemplate leaves an unknown placeholder in place', () => {
  assert.equal(
    fillTemplate('{{known}} {{unknown}}', { known: 'x' }),
    'x {{unknown}}',
  );
});

test('fillTemplate never expands placeholders that arrive inside a value', () => {
  assert.equal(
    fillTemplate('{{data}}', { data: '{"text":"{{name}}"}', name: 'leak' }),
    '{"text":"{{name}}"}',
  );
});

test('hint escapes its text', () => {
  assert.equal(hint('a <b>'), '<p class="hint">a &lt;b&gt;</p>');
});

test('makeNonce is 128 random bits, base64-encoded as CSP expects', () => {
  const nonce = makeNonce();
  assert.match(nonce, /^[A-Za-z0-9+/]{22}==$/);
  assert.notEqual(makeNonce(), nonce);
});
