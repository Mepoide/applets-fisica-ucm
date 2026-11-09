import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as A from '../applets/arrhenius/model.js';

test('landmarks: barrier near x ≈ A/4, minima near ±1; metastable well is the right one for A > 0', () => {
  const V = A.potential(0.5), lm = A.landmarks(V);
  assert.ok(Math.abs(A.xOf(lm.iMax) - 0.125) < 0.1, `x_max ${A.xOf(lm.iMax)}`);
  assert.ok(Math.abs(A.xOf(lm.iL) + 1) < 0.15 && Math.abs(A.xOf(lm.iR) - 1) < 0.15);
  assert.ok(V[lm.iR] > V[lm.iL]);
});

test('escape rates grow with kT; the lattice Kramers rate fits the measured decay within 30 %', () => {
  const V = A.potential(0.5), lm = A.landmarks(V);
  const kT = 0.2;
  const kk = A.rateKramers(V, kT, lm), kk2 = A.rateKramers(V, 0.4, lm);
  assert.ok(kk2.k > kk.k && A.rateCourse(V, 0.4, lm) > A.rateCourse(V, kT, lm));
  assert.ok(kk.dE > 0.3 && kk.dE < 1.5, `ΔE ${kk.dE}`);
  assert.ok(A.rateCourse(V, kT, lm) > kk.k, 'the course estimate overestimates the rate on a fine lattice');
  const s = A.create({ N: 1000, kT, A: 0.5, rng: mulberry32(5) });
  const steps = Math.round(1.5 / kk.k);
  for (let t = 0; t < steps; t++) A.step(s);
  const kfit = A.fitRate(s.history.filter((_, i) => i % 20 === 0));
  assert.ok(Math.abs(kfit / kk.k - 1) < 0.3, `k_fit ${kfit} vs k_Kramers ${kk.k} (harmonic ${kk.kArr}, course ${A.rateCourse(V, kT, lm)})`);
});

test('symmetric well (A = 0): after equilibration the right well holds about half of the walkers', () => {
  const s = A.create({ N: 1000, kT: 0.4, A: 0, rng: mulberry32(9) });
  for (let t = 0; t < 30000; t++) A.step(s);
  const frac = A.nMeta(s) / s.N;
  assert.ok(frac > 0.4 && frac < 0.6, `fraction ${frac}`);
});
