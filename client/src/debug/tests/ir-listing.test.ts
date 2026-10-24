import assert from 'node:assert/strict';
import { test } from 'node:test';

import { irLine, isInstructionAt } from '../ir/ir-listing';

test('isInstructionAt matches the numbered line with the current index', () => {
  assert.equal(isInstructionAt('  12: load-literal %0, int(1)', 12), true);
  assert.equal(isInstructionAt('  12: load-literal %0, int(1)', 3), false);
  assert.equal(isInstructionAt('# 3 registers, 12 instructions', 3), false);
});

test('irLine marks only the current instruction and escapes markup', () => {
  assert.equal(
    irLine('   3: call decl 5, %0 <x>', 3),
    `<span class="current" id="cur">   3: call decl 5, %0 &lt;x&gt;\n</span>`,
  );
  assert.equal(irLine('   4: return %0', 3), '<span>   4: return %0\n</span>');
});
