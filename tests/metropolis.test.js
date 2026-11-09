import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import { chiSquareSurvival } from '../lib/stats.js';
import * as W from '../applets/_walkers/metropolis.js';

const L = 61;

test('boltzmann is normalised and kT = 0 is a delta at the minimum', () => {
  const V = W.parabolic(L);
  const p = W.boltzmann(V, 1);
  let s = 0; for (const v of p) s += v;
  assert.ok(Math.abs(s - 1) < 1e-12);
  const p0 = W.boltzmann(V, 0);
  assert.equal(p0[(L - 1) / 2], 1);
});

test('kT = 0: every walker ends at the global minimum of the parabola', () => {
  const s = W.createWalkers({ N: 100, V: W.parabolic(L), kT: 0, rng: mulberry32(1) });
  for (let t = 0; t < 5000; t++) W.stepWalkers(s);
  for (let i = 0; i < s.N; i++) assert.equal(s.x[i], (L - 1) / 2);
});

for (const name of ['parabolic', 'sawSym', 'sawAsym']) {
  test(`stationary occupation matches Boltzmann for ${name} (χ², p > 0.01)`, () => {
    const V = W.POTENTIALS[name](L);
    const s = W.createWalkers({ N: 400, V, kT: 1, rng: mulberry32(7) });
    for (let t = 0; t < 2000; t++) W.stepWalkers(s); // transient
    for (let t = 0; t < 20000; t++) { W.stepWalkers(s); if (t % 50 === 0) W.accumulate(s); }
    const p = W.meanOccupation(s), q = W.boltzmann(V, 1);
    const n = s.nAcc * s.N;
    const chi2r = W.chi2Reduced(p, q, n);
    // count dof as sites with expected >= 5
    let k = 0; for (let i = 0; i < L; i++) if (q[i] * n >= 5) k++;
    const pv = chiSquareSurvival(chi2r * (k - 1), k - 1);
    assert.ok(pv > 0.01, `${name}: chi2/dof=${chi2r.toFixed(2)} dof=${k - 1} p=${pv}`);
  });
}

test('very high kT: occupation is uniform', () => {
  const V = W.sawAsym(L);
  const s = W.createWalkers({ N: 400, V, kT: 1e6, rng: mulberry32(3) });
  for (let t = 0; t < 3000; t++) W.stepWalkers(s);
  for (let t = 0; t < 40000; t++) { W.stepWalkers(s); if (t % 200 === 0) W.accumulate(s); }
  const p = W.meanOccupation(s), q = new Float64Array(L).fill(1 / L);
  const n = s.nAcc * s.N;
  // samples 200 steps apart are still correlated (walkers diffuse ~14 sites), so accept χ²/dof < 2.5
  const chi2r = W.chi2Reduced(p, q, n);
  assert.ok(chi2r < 2.5, `uniform rejected chi2/dof=${chi2r}`);
});
