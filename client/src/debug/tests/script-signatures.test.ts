import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { test } from 'node:test';

import {
  definitionsFromAst,
  readDefinitions,
} from '../launch/script-signatures';

// `ast --json --minify $in | get block` of fixtures/ast-defs.nu, from nu
// 0.116. Regenerate it with that command when the AST format changes.
const FIXTURES = path.join(__dirname, '../../../src/debug/tests/fixtures');
const block: unknown = JSON.parse(
  readFileSync(path.join(FIXTURES, 'ast-defs.json'), 'utf8'),
);

/** A real `nu` to parse with; tests that need one are skipped without it. */
const NU = ['/opt/homebrew/bin/nu', 'nu'].find((candidate) => {
  try {
    execFileSync(candidate, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
});

function scriptFile(source: string): { dir: string; file: string } {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'nu-defs-'));
  const file = path.join(dir, 'script.nu');
  writeFileSync(file, source);
  return { dir, file };
}

test('definitionsFromAst lists the top-level defs, in order', () => {
  assert.deepEqual(
    definitionsFromAst(block).map((def) => def.name),
    ['my cmd', 'greet', 'opt', 'attributed', 'typed', 'multi', 'main'],
  );
});

test('definitionsFromAst takes what nushell parsed as required', () => {
  const required = Object.fromEntries(
    definitionsFromAst(block).map((def) => [def.name, def.hasRequired]),
  );
  assert.deepEqual(required, {
    'my cmd': true, // [a]
    greet: true, // [x: list<int> = [1 2], name # who, to greet]
    opt: false, // (y?: int, --v(-v))
    attributed: true, // @example ... def attributed [x: int]
    typed: true, // [x: int]: nothing -> int
    multi: true, // [name: string]: nothing -> nothing
    main: true, // [--verbose name: string, ...rest]
  });
});

test('definitionsFromAst gives the usage line, as `help` shows it', () => {
  const usages = Object.fromEntries(
    definitionsFromAst(block).map((def) => [def.name, def.usage]),
  );
  assert.deepEqual(usages, {
    'my cmd': 'my cmd <a>',
    greet: 'greet <name> (x)', // x has a default, so it is optional
    opt: 'opt {flags} (y)',
    attributed: 'attributed <x>',
    typed: 'typed <x>', // no `: nothing -> int` tail
    multi: 'multi <name>', // one line, no comment
    main: 'main {flags} <name> ...rest',
  });
});

test('definitionsFromAst skips what it does not recognize', () => {
  for (const input of [null, 42, {}, { pipelines: 'x' }, { pipelines: [{}] }]) {
    assert.deepEqual(definitionsFromAst(input), [], JSON.stringify(input));
  }

  // A `def` call without a Signature argument (the AST's keys are snake_case).
  const noSignature: unknown =
    JSON.parse(`{"pipelines": [{"elements": [{"expr": {"expr": {"Call": {
    "head": {"span_source": "def"},
    "arguments": [{"Positional": {"expr": {"String": "f"}}}]
  }}}}]}]}`);
  assert.deepEqual(definitionsFromAst(noSignature), []);
});

test(
  'readDefinitions survives a nu that exits before reading the script',
  { skip: process.platform === 'win32' },
  async () => {
    const { dir, file } = scriptFile('# padding\n'.repeat(512 * 1024)); // ~5 MB
    const uncaught: unknown[] = [];
    const onUncaught = (error: unknown) => uncaught.push(error);
    process.on('uncaughtException', onUncaught);
    try {
      assert.equal(await readDefinitions('/usr/bin/true', file), undefined);
      await new Promise((resolve) => setTimeout(resolve, 100));
      assert.deepEqual(uncaught, []);
    } finally {
      process.off('uncaughtException', onUncaught);
      rmSync(dir, { recursive: true, force: true });
    }
  },
);

// Found by parsing ~1,800 real scripts: `ast --json` also prints the compiled
// IR, which grows much faster than the script. Around 1,100 top-level defs
// pass the output limit and the launch skips the prompts without a word
// (nu_scripts' completions/mvn.nu).
test(
  'readDefinitions still finds main in a script with 1500 top-level defs',
  { skip: NU === undefined ? 'nu is not available' : false },
  async () => {
    let source = 'def main [x: string] {}\n';
    for (let i = 0; i < 1500; i++) {
      source += `def "cmd ${i}" [a: int, b?: string, --flag(-f)] {\n  print $a\n}\n`;
    }
    const { dir, file } = scriptFile(source);
    try {
      const defs = await readDefinitions(NU as string, file);
      assert.ok(defs !== undefined, 'readDefinitions gave up on the script');
      assert.equal(defs.find((def) => def.name === 'main')?.hasRequired, true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
