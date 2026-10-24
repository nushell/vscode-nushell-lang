import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isStoppedEvent } from '../shared/dap-message';

test('isStoppedEvent recognises a stopped event', () => {
  assert.equal(
    isStoppedEvent({
      seq: 7,
      type: 'event',
      event: 'stopped',
      body: { reason: 'step' },
    }),
    true,
  );
});

test('isStoppedEvent rejects other events, responses, and junk', () => {
  assert.equal(isStoppedEvent({ type: 'event', event: 'output' }), false);
  assert.equal(isStoppedEvent({ type: 'response', command: 'stopped' }), false);
  assert.equal(isStoppedEvent(null), false);
  assert.equal(isStoppedEvent('stopped'), false);
});
