import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as K from '../applets/kac/model.js';

test('Kac ring is periodic with period 2N (configuration and Δ)', () => {
  const s = K.create({ N: 60, M: 17, init: 'random', rng: mulberry32(3) });
  const d0 = K.delta(s);
  for (let t = 0; t < 2 * s.N; t++) K.step(s);
  assert.equal(K.delta(s), d0);
  assert.ok(K.sameAsInitial(s));
  assert.equal(K.recurrenceTime(s), 120);
});

test('all blue with M = N/2: Δ(1) = 0 exactly, as mean field predicts', () => {
  const s = K.create({ N: 100, M: 50, init: 'blue', rng: mulberry32(1) });
  assert.equal(K.delta(s), 100);
  K.step(s);
  assert.equal(K.delta(s), 0);
  assert.equal(K.meanField(s, 1), 0);
});

test('mean field is accurate at short times for a large ring', () => {
  const s = K.create({ N: 1000, M: 100, init: 'blue', rng: mulberry32(7) });
  for (let t = 1; t <= 5; t++) {
    K.step(s);
    assert.ok(Math.abs(K.delta(s) - K.meanField(s, t)) < 3 * Math.sqrt(s.N), `t=${t}: ${K.delta(s)} vs ${K.meanField(s, t)}`);
  }
});

test('edge cases: M = 0 never changes, M = N flips every ball each step', () => {
  const a = K.create({ N: 20, M: 0, init: 'alternate', rng: mulberry32(2) });
  const d = K.delta(a); K.step(a); assert.equal(K.delta(a), d);
  const b = K.create({ N: 20, M: 20, init: 'blue', rng: mulberry32(2) });
  K.step(b); assert.equal(K.delta(b), -20); K.step(b); assert.equal(K.delta(b), 20);
});
