import test from 'node:test';
import assert from 'node:assert/strict';
import { SharedSaveClient } from '../src/shared-save-client.ts';
import { CharacterSession } from '../src/character-session.ts';
import { Simulation } from '../src/simulation.ts';
import type { SaveClient } from '../src/save-client.ts';

const world = { seed: 7319, generationVersion: 4, blocked: () => false, move: (x: number, y: number, dx: number, dy: number) => ({ x: x + dx, y: y + dy }), getPOIs: () => [] };

/** Stands in for scripts/shared-saves.ts: one store, compare-and-swap on its version. */
function devServer() {
  let store = { version: 0, values: {} as Record<string, string> };
  const reply = (status: number, body: unknown) => ({ ok: status < 400, status, json: async () => body }) as unknown as Response;
  const fetch = async (_url: string | URL | Request, init?: RequestInit) => {
    if (init?.method !== 'POST') return reply(200, store);
    const body = JSON.parse(String(init.body));
    if (body.version !== store.version) return reply(409, store);
    store = { version: store.version + 1, values: body.values };
    return reply(200, { version: store.version });
  };
  return { fetch, get values() { return store.values; } };
}

function client(server: ReturnType<typeof devServer>) {
  globalThis.fetch = server.fetch as typeof globalThis.fetch;
  return new SharedSaveClient({} as SaveClient);
}

test('two browsers on the dev server share one character and cannot lose each other\'s save', async () => {
  const server = devServer(), a = client(server), b = client(server), sim = new Simulation(world, { spawn: false });
  const one = new CharacterSession(a, 4), two = new CharacterSession(b, 4);
  assert(await one.create(0, 'Rowan', 7319, sim.captureCheckpoint(), 'shared-character', 1));

  // The second browser never created anything, yet the character is already there.
  const seen = await b.list();
  assert.equal(seen[0].state, 'saved'); assert.equal(seen[0].record?.name, 'Rowan');
  assert(await two.load(0));

  const results = await Promise.all([one.save(sim.captureCheckpoint(), 2), two.save(sim.captureCheckpoint(), 3)]);
  assert.equal(results.filter(Boolean).length, 1, 'exactly one browser owns the expected token');

  const saved = await a.read(0);
  assert(await a.remove(0, saved.token));
  assert.equal((await b.read(0)).state, 'empty');
  assert.equal(await one.save(sim.captureCheckpoint(), 4), false);
  assert.equal(await two.save(sim.captureCheckpoint(), 4), false);
});

test('a lost compare-and-swap race retries instead of overwriting the winner', async () => {
  const server = devServer(), sim = new Simulation(world, { spawn: false });
  const a = client(server);
  assert(await new CharacterSession(a, 4).create(0, 'Rowan', 7319, sim.captureCheckpoint(), 'shared-character', 1));
  assert(await new CharacterSession(a, 4).create(1, 'Wren', 7319, sim.captureCheckpoint(), 'other-character', 1));

  // A stale token is refused; a fresh one still wins even though slot 1 moved underneath it.
  assert.equal((await a.write(0, (await a.read(0)).record!, 'nonsense')).ok, false);
  const slot = await a.read(0);
  assert.equal((await a.write(0, slot.record!, slot.token)).ok, true);
  assert.equal((await a.read(1)).record?.name, 'Wren');
  assert.equal((await a.chronicle()).characters['shared-character'].name, 'Rowan');
});

test('the shared store keeps characters as strings under their slot keys', async () => {
  const server = devServer(), a = client(server), sim = new Simulation(world, { spawn: false });
  assert(await new CharacterSession(a, 4).create(3, 'Rowan', 7319, sim.captureCheckpoint(), 'shared-character', 1));
  assert.equal(server.values['revision:3'], '1');
  assert.equal(typeof server.values['evergrow:character:1:3'], 'string');
  for (const value of Object.values(server.values)) assert.equal(typeof value, 'string');
});
