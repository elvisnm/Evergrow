import test from 'node:test';
import assert from 'node:assert/strict';
import { randomId } from '../src/random-id.ts';

test('save operation ids are unique v4 UUIDs without the secure-origin randomUUID', () => {
  // The LAN origin the game is played from is not a secure context, so `crypto.randomUUID` is
  // undefined there and character creation threw. Nothing here may reach for it.
  assert.ok(!/randomUUID/.test(randomId.toString()));
  const ids = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const id = randomId();
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    ids.add(id);
  }
  assert.equal(ids.size, 1000);
});
