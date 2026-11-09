import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber } from '../lib/ui.js';

test('parseNumber falls back to default on garbage and clamps to range', () => {
  const o = { def: 80, min: 1, max: 300, integer: true };
  assert.equal(parseNumber('abc', o), 80);
  assert.equal(parseNumber('', o), 80);
  assert.equal(parseNumber('1e9', o), 300);
  assert.equal(parseNumber('-5', o), 1);
  assert.equal(parseNumber('12.7', o), 13);
  assert.equal(parseNumber('0,5', { def: 0.7, min: 0, max: 1 }), 0.5);
});
