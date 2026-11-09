import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Loop } from '../lib/loop.js';

function fakeRaf() {
  const q = [];
  return { raf: (cb) => { q.push(cb); return q.length; }, caf: () => { q.length = 0; }, tick: () => { const cbs = q.splice(0); cbs.forEach((cb) => cb()); } };
}

test('loop runs stepsPerFrame steps per tick and pause stops it', () => {
  const f = fakeRaf(); let steps = 0, draws = 0;
  const loop = new Loop({ step: () => steps++, draw: () => draws++, stepsPerFrame: 3, raf: f.raf, caf: f.caf });
  loop.start(); f.tick(); f.tick();
  assert.equal(steps, 6); assert.equal(draws, 2); assert.equal(loop.running, true);
  loop.pause(); f.tick();
  assert.equal(steps, 6); assert.equal(loop.running, false);
});

test('reset after pause rebuilds state and does not resume', () => {
  const f = fakeRaf(); let resets = 0, draws = 0;
  const loop = new Loop({ step: () => {}, draw: () => draws++, reset: () => resets++, raf: f.raf, caf: f.caf });
  loop.start(); f.tick(); loop.pause(); loop.reset(); f.tick();
  assert.equal(resets, 1); assert.equal(loop.running, false); assert.equal(loop.started, false);
  assert.equal(draws, 2); // one from the tick, one from reset
  loop.restart(); assert.equal(resets, 2); assert.equal(loop.running, true);
});
