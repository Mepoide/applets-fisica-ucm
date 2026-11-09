import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as C from '../applets/conductividad/model.js';

test('equal reservoir temperatures: net heat current is small compared with a driven gas', () => {
  const eq = C.create({ N: 60, T1: 1, T2: 1, rng: mulberry32(2) });
  const dr = C.create({ N: 60, T1: 2, T2: 0.5, rng: mulberry32(2) });
  for (let t = 0; t < 300; t++) { C.step(eq); C.step(dr); }
  C.resetStats(eq); C.resetStats(dr);
  for (let t = 0; t < 2000; t++) { C.step(eq); C.step(dr); }
  const qe = Math.abs(C.heatCurrent(eq).Q), qd = C.heatCurrent(dr).Q;
  assert.ok(qd > 0, `driven current ${qd}`);
  assert.ok(qe / qd < 0.2, `equilibrium/driven = ${qe / qd}`);
});

test('hot left wall: energy flows in on the left and out on the right; T(x) decreases; pressure ρT roughly uniform', () => {
  const s = C.create({ N: 60, T1: 2, T2: 0.5, rng: mulberry32(5) });
  for (let t = 0; t < 400; t++) C.step(s, 5);
  C.resetStats(s);
  for (let t = 0; t < 3000; t++) C.step(s, 5);
  const { Qin, Qout } = C.heatCurrent(s);
  assert.ok(Qin > 0 && Qout > 0, `Qin ${Qin} Qout ${Qout}`);
  assert.ok(Math.abs(Qin - Qout) / Qin < 0.5, 'in and out currents of the same order (steady state)');
  const p = C.meanProfile(s);
  assert.ok(p.T[0] > p.T[4], `T profile ${Array.from(p.T).map((v) => v.toFixed(2))}`);
  const press = Array.from(p.T, (T, b) => T * p.rho[b]);
  const pmax = Math.max(...press), pmin = Math.min(...press);
  assert.ok((pmax - pmin) / pmax < 0.45, `pressure variation ${((pmax - pmin) / pmax).toFixed(2)}`);
  assert.ok(Number.isFinite(C.conductivity(s)) && C.conductivity(s) > 0);
});
