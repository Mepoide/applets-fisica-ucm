import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as R from '../applets/resonancia/model.js';

test('the global minimum follows the sign of −cos ωt', () => {
  const omega = 2 * Math.PI / 1000;
  assert.ok(R.minimumPosition(0.3, omega, 0) < 0, 'at t = 0 the tilt A x lowers the left well');
  assert.ok(R.minimumPosition(0.3, omega, 500) > 0);
});

test('response of a perfect cosine has amplitude 1 and snr 1; white noise is small', () => {
  const omega = 2 * Math.PI / 200;
  const perfect = Array.from({ length: 4000 }, (_, i) => Math.cos(omega * i));
  const r = R.response(perfect, omega);
  assert.ok(Math.abs(r.amp - 1) < 1e-6 && Math.abs(r.snr - 1) < 1e-6, JSON.stringify(r));
  const lagged = Array.from({ length: 4000 }, (_, i) => 0.5 * Math.cos(omega * i - 1));
  assert.ok(Math.abs(R.response(lagged, omega).amp - 0.5) < 1e-6 && Math.abs(R.response(lagged, omega).phase - 1) < 1e-6);
  const rng = mulberry32(2);
  const noise = Array.from({ length: 4000 }, () => rng() - 0.5);
  assert.ok(R.snr(noise, omega) < 0.1);
});

test('kramersTime decreases with kT and resonantTemperature inverts it', () => {
  assert.ok(R.kramersTime(0.1) > R.kramersTime(0.2));
  const T = 6000, kT = R.resonantTemperature(T);
  assert.ok(Math.abs(R.kramersTime(kT) / (T / 2) - 1) < 0.05, `τ(kT*) = ${R.kramersTime(kT)} vs T/2 = ${T / 2}`);
});

test('response amplitude is maximal near the resonant temperature (sweep with fixed seed)', () => {
  const period = 6000, A = 0.3;
  const kTr = R.resonantTemperature(period);
  const kTs = [kTr / 4, kTr, kTr * 4];
  const res = R.sweep({ kTs, A, period, N: 20, periods: 12, rng: mulberry32(4) });
  assert.ok(res[1].amp > res[0].amp && res[1].amp > res[2].amp, JSON.stringify(res));
});
