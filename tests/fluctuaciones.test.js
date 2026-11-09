import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as F from '../applets/fluctuaciones/model.js';

test('window covering the whole box: count is always N, binomial variance 0, no NaN', () => {
  const s = F.create({ N: 40, rng: mulberry32(2) });
  s.window = { x: 0, y: 0, w: s.w, h: s.h };
  for (let n = 0; n < 200; n++) assert.equal(F.sample(s, 0.5), 40);
  const p = F.windowFraction(s);
  assert.equal(p, 1);
  const e = F.expectedPmf(40, p);
  assert.equal(e.varianceBinomial, 0);
  assert.equal(e.binomial[40], 1);
  assert.ok([...e.poisson].every(Number.isFinite));
  const st = F.occupationStats(s.series);
  assert.equal(st.variance, 0);
  const ac = F.autocorrelation(s.series, 10);
  assert.ok([...ac].every((v) => v === 1));
});

test('mean occupation matches N p and variance is closer to binomial than to Poisson', () => {
  const s = F.create({ N: 100, kT: 100, rng: mulberry32(4) });
  s.window = { x: 20, y: 20, w: 120, h: 120 };
  const p = F.windowFraction(s);
  for (let n = 0; n < 20000; n++) F.sample(s, 0.5);
  const st = F.occupationStats(s.series);
  const sigma = Math.sqrt(100 * p * (1 - p));
  // effective number of independent samples is much smaller than 20000 (correlation time ~ 12 / 10 = 1.2 time units = 2.4 samples)
  assert.ok(Math.abs(st.mean - 100 * p) < 4 * sigma / Math.sqrt(20000 / 10), `mean ${st.mean} vs ${100 * p}`);
  const e = F.expectedPmf(100, p);
  assert.ok(Math.abs(st.variance - e.varianceBinomial) < Math.abs(st.variance - e.variancePoisson), `var ${st.variance} bin ${e.varianceBinomial} poi ${e.variancePoisson}`);
});

test('autocorrelation decays and the correlation time scale is window/vth', () => {
  const s = F.create({ N: 100, kT: 100, rng: mulberry32(8) });
  s.window = { x: 60, y: 60, w: 40, h: 40 };
  const dt = 0.1;
  for (let n = 0; n < 40000; n++) F.sample(s, dt);
  const ac = F.autocorrelation(s.series, 400);
  assert.equal(ac[0], 1);
  const tauEst = F.correlationTimeEstimate(s); // 40 / 10 = 4 time units = 40 samples
  const lagE = ac.findIndex((v) => v < Math.exp(-1));
  assert.ok(lagE > 0.3 * tauEst / dt && lagE < 3 * tauEst / dt, `1/e lag ${lagE} vs estimate ${tauEst / dt}`);
});

test('kinetic temperature of the initial Maxwellian is kT (2D, m=1)', () => {
  const s = F.create({ N: 5000, kT: 50, rng: mulberry32(1) });
  let e = 0; for (let i = 0; i < s.N; i++) e += 0.5 * (s.vx[i] ** 2 + s.vy[i] ** 2);
  assert.ok(Math.abs(e / s.N / 50 - 1) < 0.05);
});
