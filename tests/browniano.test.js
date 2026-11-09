import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as B from '../applets/browniano/model.js';

test('heavy disk reaches equipartition with the bath (within 20 % after averaging)', () => {
  const s = B.create({ N: 40, massRatio: 20, radiusRatio: 4, kT: 1, rng: mulberry32(2) });
  for (let t = 0; t < 2000; t++) B.step(s);
  let acc = 0, n = 0;
  for (let t = 0; t < 20000; t++) { B.step(s); if (t % 20 === 0) { acc += B.heavyKinetic(s); n++; } }
  const ratio = (acc / n) / B.bathTemperature(s);
  assert.ok(Math.abs(ratio - 1) < 0.2, `⟨½MV²⟩/kT = ${ratio}`);
});

test('mean-squared displacement is diffusive at long times (R² > 0.9, D > 0)', () => {
  const s = B.create({ N: 40, massRatio: 20, radiusRatio: 4, kT: 1, rng: mulberry32(4) });
  for (let t = 0; t < 15000; t++) B.step(s);
  const m = B.msd(s.track, 1500, 25);
  const fit = B.fitD(m, 200);
  assert.ok(fit.D > 0 && fit.r2 > 0.9, `D=${fit.D} R²=${fit.r2}`);
  assert.ok(m.msd[m.msd.length - 1] > m.msd[0]);
  assert.ok(Number.isFinite(B.enskogD(s)) && B.enskogD(s) > 0);
});
