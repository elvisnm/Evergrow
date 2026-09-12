import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serviceDropZone } from '../src/commerce.ts';

test('a dragged cell has exactly one drop target, matching what its click already means', () => {
  // The chest trades both ways; nothing else does.
  assert.equal(serviceDropZone('stash', 'shop', 'bag'), 'storage');
  assert.equal(serviceDropZone('stash', 'shop', 'stash'), 'inventory');
  // Selling is offered on the dedicated Sell tab alone -- the shop tab has no drop zone.
  assert.equal(serviceDropZone('blacksmith', 'sell', 'bag'), 'sales');
  assert.equal(serviceDropZone('blacksmith', 'shop', 'bag'), null);
  assert.equal(serviceDropZone('blacksmith', 'improve', 'bag'), null);
  // Buying and buying back both land in the bag, each from its own tab.
  assert.equal(serviceDropZone('jeweler', 'shop', 'stock'), 'inventory');
  assert.equal(serviceDropZone('gambler', 'shop', 'stock'), null);
  assert.equal(serviceDropZone('blacksmith', 'buyback', 'buyback'), 'inventory');
  assert.equal(serviceDropZone('blacksmith', 'sell', 'buyback'), null);
  // Equipment is improved in place, never dragged.
  assert.equal(serviceDropZone('blacksmith', 'improve', 'equipped'), null);
});
