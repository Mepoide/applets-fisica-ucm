import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as O from '../applets/onda-lgca/model.js';

test('hole is empty, gas outside has the requested density, particles conserved', () => {
  const s = O.create({ nx: 120, ny: 120, f: 0.5, holeRadius: 10, rng: mulberry32(2) });
  const p0 = O.radialProfile(s, 2);
  assert.equal(p0.rho[0], 0); assert.equal(p0.rho[1], 0);
  assert.ok(Math.abs(p0.rho[20] - 3.5) < 0.4, `outside density ${p0.rho[20]}`);
  const n0 = O.meanOccupation(s);
  for (let t = 0; t < 50; t++) O.step(s);
  assert.equal(O.meanOccupation(s), n0);
});

test('rarefaction front travels at the lattice sound speed sqrt(3/7) within 15%', () => {
  const s = O.create({ nx: 240, ny: 240, f: 0.5, holeRadius: 12, rng: mulberry32(5) });
  const ts = [], rs = [];
  for (let t = 1; t <= 90; t++) {
    O.step(s);
    if (t >= 30 && t % 10 === 0) { ts.push(t); rs.push(O.frontRadius(O.radialProfile(s, 1.5), 4)); }
  }
  // least-squares slope
  const n = ts.length, mt = ts.reduce((a, b) => a + b) / n, mr = rs.reduce((a, b) => a + b) / n;
  let num = 0, den = 0; for (let i = 0; i < n; i++) { num += (ts[i] - mt) * (rs[i] - mr); den += (ts[i] - mt) ** 2; }
  const slope = num / den;
  assert.ok(Math.abs(slope / O.SOUND_SPEED - 1) < 0.15, `front speed ${slope.toFixed(3)} vs c_s ${O.SOUND_SPEED.toFixed(3)} (r: ${rs.map((v) => v.toFixed(1)).join(',')})`);
});

test('strip profile shows the hole at the centre', () => {
  const s = O.create({ nx: 100, ny: 100, f: 0.6, holeRadius: 10, rng: mulberry32(1) });
  const p = O.stripProfile(s, 3);
  const centre = p.rho[50], edge = p.rho[5];
  assert.ok(centre < 1 && edge > 3, `centre ${centre} edge ${edge}`);
});
