import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as P from '../applets/pila-arena/model.js';

test('grains are conserved: added = in pile + out', () => {
  for (const mode of ['fixed', 'oslo']) {
    const s = P.create({ columns: 16, hc: 2, mode, rng: mulberry32(5) });
    for (let n = 0; n < 500; n++) P.drive(s);
    assert.equal(s.added, P.grainsInPile(s) + s.out);
    assert.ok(P.isStable(s));
  }
});

test('fixed threshold is trivial: after the transient every avalanche has the same size', () => {
  const s = P.create({ columns: 12, hc: 3, mode: 'fixed' });
  for (let n = 0; n < 400; n++) P.drive(s);
  const tail = s.avalanches.slice(-100);
  assert.ok(tail.every((v) => v === tail[0]), `sizes vary: ${new Set(tail).size} distinct`);
  assert.equal(tail[0], 12); // the grain walks across every column and leaves
  // stationary profile is a staircase of slope hc-1
  for (let i = 0; i < s.columns; i++) assert.equal(P.slope(s, i), s.hc - 1);
});

test('Oslo model gives a broad avalanche distribution (>= 2 decades)', () => {
  const s = P.create({ columns: 64, hc: 2, mode: 'oslo', rng: mulberry32(9) });
  for (let n = 0; n < 5000; n++) P.drive(s); // transient
  s.avalanches.length = 0;
  for (let n = 0; n < 20000; n++) P.drive(s);
  const nonzero = s.avalanches.filter((v) => v > 0);
  const max = Math.max(...nonzero), min = Math.min(...nonzero);
  assert.ok(max / min >= 100, `range ${min}..${max}`);
  const { s: x, p } = P.sizeDistribution(nonzero);
  assert.ok(x.length >= 6);
  // decreasing on average: first bin density much larger than last
  assert.ok(p[0] > 10 * p[p.length - 1]);
  // and the stationary mean slope is between hc-1 and hc (zc ∈ {1,2} for hc=2 -> <z> ≈ 1.7 in the literature)
  const z = (s.h[0]) / s.columns;
  assert.ok(z > 1.3 && z < 2.0, `mean slope ${z}`);
});

test('sizeDistribution normalises to ~1 over integer sizes', () => {
  const sizes = []; for (let i = 1; i <= 1000; i++) sizes.push(i);
  const { p, s } = P.sizeDistribution(sizes, 4);
  // sum p * width ≈ 1 ; approximate check using consecutive geometric mean spacing
  let tot = 0;
  for (let b = 0; b < p.length; b++) {
    const lo = b === 0 ? 1 : s[b] / 10 ** (1 / 8), hi = s[b] * 10 ** (1 / 8);
    tot += p[b] * Math.max(1, Math.ceil(hi) - Math.ceil(lo));
  }
  assert.ok(Math.abs(tot - 1) < 0.1, `total ${tot}`);
});
