import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import { chiSquare, chiSquareSurvival } from '../lib/stats.js';
import * as I from '../applets/irreversibilidad/model.js';

test('Ehrenfest model: stationary mean N/2 and variance N/4; histogram is binomial', () => {
  const N = 50, s = I.createEhrenfest({ N, rng: mulberry32(11) });
  for (let t = 0; t < 2000; t++) I.stepEhrenfest(s); // transient
  s.history = [];
  const T = 100000;
  for (let t = 0; t < T; t++) I.stepEhrenfest(s);
  const st = I.seriesStats(s.history);
  // Δ = 2 left − N: mean 0, variance N (independent samples would give sd/√T ≈ 0.02; the chain is correlated, allow 1.0)
  assert.ok(Math.abs(st.mean) < 1.0, `mean Δ ${st.mean}`);
  assert.ok(Math.abs(st.sd * st.sd / N - 1) < 0.3, `var Δ / N = ${st.sd * st.sd / N}`);
  const { h } = I.histogramDiff(s.history, N);
  const { p } = I.binomialDiff(N);
  // thin the correlated series: compare shapes with a χ² on counts of every 10th sample
  const thin = s.history.filter((_, i) => i % 11 === 0); // odd stride: Δ changes by ±2, an even stride would sample one parity only
  const { h: ht, n } = I.histogramDiff(thin, N);
  const obs = [], exp = [];
  for (let k = 0; k <= N; k++) if (p[k] * n >= 5) { obs.push(ht[k] * n); exp.push(p[k] * n); }
  const { chi2, dof } = chiSquare(obs, exp);
  const pv = chiSquareSurvival(chi2, dof);
  assert.ok(pv > 0.01, `binomial rejected: chi2=${chi2.toFixed(1)} dof=${dof} p=${pv}`);
  assert.ok(h[N / 2] > h[0], 'mode at Δ = 0');
});

test('hard-disk gas starts entirely on the left and spreads once the partition opens', () => {
  const s = I.createGas({ N: 30, kT: 1, rng: mulberry32(3) });
  assert.equal(I.difference(s), 30);
  for (let t = 0; t < 400; t++) I.stepGas(s);
  const [l, r] = [(30 + I.difference(s)) / 2, (30 - I.difference(s)) / 2];
  assert.ok(r > 5, `right side ${r}`);
  assert.equal(l + r, 30);
});

test('binomialDiff is normalised, symmetric, with σ_Δ = √N and P(all one side) = 2^(1−N)', () => {
  const N = 20, { delta, p } = I.binomialDiff(N);
  let sum = 0, m2 = 0;
  for (let k = 0; k <= N; k++) { sum += p[k]; m2 += p[k] * delta[k] * delta[k]; }
  assert.ok(Math.abs(sum - 1) < 1e-12);
  assert.ok(Math.abs(Math.sqrt(m2) - I.sigmaDelta(N)) < 1e-9);
  assert.ok(Math.abs(p[0] + p[N] - I.probAllOneSide(N)) < 1e-15);
  assert.equal(p[3], p[N - 3]);
});
