import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import { besselJ0, besselJ1 } from '../lib/bessel.js';
import * as O from '../applets/onda-lgca/model.js';

test('Bessel J0, J1 against tabulated values', () => {
  assert.ok(Math.abs(besselJ0(0) - 1) < 1e-8);
  assert.ok(Math.abs(besselJ0(2.404825557695773)) < 1e-7, 'first zero of J0');
  assert.ok(Math.abs(besselJ1(1) - 0.4400505857) < 1e-7);
  assert.ok(Math.abs(besselJ0(10) - (-0.2459357645)) < 1e-7);
  assert.ok(Math.abs(besselJ1(10) - 0.0434727462) < 1e-7);
});

test('linear prediction reproduces the hole at t = 0 and a front moving at c_s', () => {
  const s = O.create({ nx: 120, ny: 120, f: 0.3, holeRadius: 10, rng: mulberry32(1) });
  const r = Float64Array.from({ length: 60 }, (_, i) => i + 0.5);
  const p0 = O.linearPrediction(s, r, 0);
  const n0 = 7 * s.f;
  assert.ok(Math.abs(p0[4]) < 0.15 * n0, `inside the hole ≈ 0: ${p0[4]}`);            // r = 4.5
  assert.ok(Math.abs(p0[30] - n0) < 0.1 * n0, `far outside ≈ n0: ${p0[30]}`);         // r = 30.5
  const tA = 15, tB = 30;
  const rA = O.profileMinimum(r, O.linearPrediction(s, r, tA), 6), rB = O.profileMinimum(r, O.linearPrediction(s, r, tB), 6);
  const speed = (rB - rA) / (tB - tA);
  assert.ok(Math.abs(speed - O.SOUND_SPEED) < 0.15, `front speed ${speed} vs ${O.SOUND_SPEED}`);
});

test('simulated front advances at the sound speed within 15 %', () => {
  const s = O.create({ nx: 160, ny: 160, f: 0.3, holeRadius: 10, rng: mulberry32(2) });
  const pos = [];
  for (let t = 0; t <= 60; t++) {
    if (t >= 20 && t % 10 === 0) pos.push([t, O.frontRadius(O.radialProfile(s, 1.5), 6)]);
    O.step(s);
  }
  // least-squares slope
  const n = pos.length; let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const [x, y] of pos) { sx += x; sy += y; sxx += x * x; sxy += x * y; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  assert.ok(Math.abs(slope / O.SOUND_SPEED - 1) < 0.15, `slope ${slope} (c_s ${O.SOUND_SPEED}) from ${JSON.stringify(pos)}`);
});
