import assert from 'node:assert/strict';
import { test } from 'node:test';

import { splitArgs } from '../launch/split-args';

test('splitArgs splits on whitespace', () => {
  assert.deepEqual(splitArgs('alice 3 --verbose'), ['alice', '3', '--verbose']);
});

test('splitArgs keeps quoted values together and drops the quotes', () => {
  assert.deepEqual(splitArgs(`"hello world" 'x y' z`), [
    'hello world',
    'x y',
    'z',
  ]);
});

test('splitArgs of an empty line is empty', () => {
  assert.deepEqual(splitArgs(''), []);
  assert.deepEqual(splitArgs('   '), []);
});

test('splitArgs groups a quoted value attached to a flag', () => {
  assert.deepEqual(splitArgs('--name="hello world" x'), [
    '--name=hello world',
    'x',
  ]);
  assert.deepEqual(splitArgs(`--msg='it is' --n=3`), ['--msg=it is', '--n=3']);
});

test('splitArgs keeps the other quote kind literally inside quotes', () => {
  assert.deepEqual(splitArgs(`"it's" 'say "hi"'`), [`it's`, 'say "hi"']);
});

test('splitArgs keeps an empty quoted argument', () => {
  assert.deepEqual(splitArgs(`a "" b`), ['a', '', 'b']);
});

test('splitArgs runs an unclosed quote to the end of the line', () => {
  assert.deepEqual(splitArgs('a "b c'), ['a', 'b c']);
});

// Found by parsing ~1,800 real scripts and the arguments their mains take:
// `"say \"hi\""` is how both a POSIX shell and nushell's own double quotes
// write an embedded quote. Backslashes before anything else stay as typed, so
// Windows paths keep working.
test('splitArgs reads \\" inside double quotes as a literal quote', () => {
  assert.deepEqual(splitArgs('"say \\"hi\\""'), ['say "hi"']);
  assert.deepEqual(splitArgs('"C:\\Program Files\\x"'), [
    'C:\\Program Files\\x',
  ]);
});
