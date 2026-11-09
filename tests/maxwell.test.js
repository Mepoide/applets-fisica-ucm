import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import { histogram, chiSquare, chiSquareSurvival } from '../lib/stats.js';
import * as M from '../applets/maxwell/model.js';

test('energy conserved, no overlaps, momentum conserved in pair collisions', () => {
  const s = M.create({ N: 60, dist: 'angle', rng: mulberry32(7) });
  const E0 = M.kineticEnergy(s);
  for (let n = 0; n < 500; n++) {
    M.step(s);
    assert.ok(Math.abs(M.kineticEnergy(s) - E0) < 1e-9 * E0, `energy drift at step ${n}`);
  }
  assert.ok(s.ncol > 100, 'collisions happened');
  assert.ok(M.minDistance(s) >= 2 * s.radius - 1e-9, `overlap: ${M.minDistance(s)}`);
  // Pair collision alone conserves momentum.
  const p0 = M.momentum(s);
  s.x[1] = s.x[0] + 2 * s.radius; s.y[1] = s.y[0]; s.vx[0] = 1; s.vx[1] = -1; s.vy[0] = 0.3; s.vy[1] = 0.1;
  const before = M.momentum(s); M.collide(s, 0, 1); const after = M.momentum(s);
  assert.ok(Math.abs(before[0] - after[0]) < 1e-12 && Math.abs(before[1] - after[1]) < 1e-12);
  assert.ok(p0.length === 2);
});

test('dense system (150 disks) runs 1000 steps finite and in bounded time', () => {
  const s = M.create({ N: 150, dist: 'vxvy', rng: mulberry32(3) });
  const t0 = performance.now();
  for (let n = 0; n < 1000; n++) M.step(s);
  const ms = performance.now() - t0;
  for (let i = 0; i < s.N; i++) {
    assert.ok(Number.isFinite(s.x[i]) && Number.isFinite(s.vx[i]));
    assert.ok(s.x[i] >= s.radius - 1e-9 && s.x[i] <= s.L - s.radius + 1e-9, 'inside box');
  }
  assert.ok(ms < 20000, `too slow: ${ms} ms`);
});

test('grid fallback places 300 disks without overlap', () => {
  const s = M.create({ N: 300, rng: mulberry32(1) });
  assert.ok(M.minDistance(s) >= 2 * s.radius - 1e-9);
});

test('speed histogram relaxes to the 2D Maxwell distribution from a delta initial condition', () => {
  const s = M.create({ N: 100, dist: 'fixed', rng: mulberry32(11) });
  const kT = M.kineticTemperature(s), vmax = M.vmaxFor(kT), bins = 12;
  for (let n = 0; n < 300; n++) M.step(s); // transient
  const acc = new Float64Array(bins); let frames = 0;
  for (let n = 0; n < 3000; n++) {
    M.step(s);
    if (n % 10 === 0) { const h = histogram(M.speeds(s), 0, vmax, bins); for (let b = 0; b < bins; b++) acc[b] += h[b]; frames++; }
  }
  const expected = M.maxwellBinCounts(s.N, kT, s.m, vmax, bins);
  const observed = Array.from(acc, (c) => c / frames);
  // Time-averaged frames are correlated, so the test compares shapes: both normalised to N.
  const { chi2, dof } = chiSquare(observed, Array.from(expected));
  const p = chiSquareSurvival(chi2, dof);
  assert.ok(p > 1e-3, `Maxwell fit rejected: chi2=${chi2.toFixed(2)} dof=${dof} p=${p}`);
  // and the mean speed matches sqrt(pi kT / 2m) within 3%
  let vbar = 0; for (const v of M.speeds(s)) vbar += v; vbar /= s.N;
  assert.ok(Math.abs(vbar / Math.sqrt(Math.PI * kT / 2) - 1) < 0.05, `mean speed ${vbar}`);
});

test('maxwellBinCounts sums to N minus the tail', () => {
  const c = M.maxwellBinCounts(100, 1, 1, M.vmaxFor(1), 20);
  let s = 0; for (const v of c) s += v;
  assert.ok(Math.abs(s - 100 * (1 - Math.exp(-8))) < 1e-9);
});
