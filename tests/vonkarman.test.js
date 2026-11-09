import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as V from '../applets/von-karman/model.js';
import * as H from '../applets/_fhp/fhp.js';

test('inflow channel probabilities give the requested mean velocity', () => {
  for (const u of [0, 0.1, 0.25, 0.4]) {
    const p = V.channelProbabilities(0.25, u);
    assert.ok(Math.abs(V.meanVelocityOf(p) - u) < 1e-12, `u=${u} got ${V.meanVelocityOf(p)}`);
    for (const v of p) assert.ok(v >= 0 && v <= 1);
  }
});

test('with the inflow zone disabled the plate conserves mass for both wall rules', () => {
  for (const rule of ['bounceback', 'specular']) {
    const s = V.create({ nx: 60, ny: 80, f: 0.3, u: 0.2, plateLen: 20, wallRule: rule, inflowRows: 0, rng: mulberry32(3) });
    const n0 = V.particleCount(s);
    for (let t = 0; t < 300; t++) V.step(s);
    assert.equal(V.particleCount(s), n0, `${rule}`);
  }
});

test('the driven channel without plate reaches the inflow velocity downstream within 20%', () => {
  const s = V.create({ nx: 60, ny: 120, f: 0.25, u: 0.2, plateLen: 0, rng: mulberry32(7) });
  for (let t = 0; t < 400; t++) V.step(s);
  let acc = 0, n = 0;
  for (let t = 0; t < 200; t++) { V.step(s); acc += V.meanAlongVelocity(s, 20, 60); n++; }
  const u = acc / n;
  assert.ok(Math.abs(u / 0.2 - 1) < 0.2, `mean velocity ${u}`);
});

test('velocity field of the free stream points along the stream; a uniform beam has zero vorticity', () => {
  const s = V.create({ nx: 64, ny: 64, f: 0.25, u: 0.2, plateLen: 0, rng: mulberry32(1) });
  for (let t = 0; t < 50; t++) V.step(s);
  const F = V.velocityField(s, 16);
  let along = 0; for (const v of F.along) along += v; along /= F.along.length;
  assert.ok(along > 0.1, `along ${along}`);
  const beam = { L: H.createLattice(32, 32) }; beam.L.a.fill(1 << 5 | 1 << 6);
  const G = H.coarseGrain(beam.L, 8);
  const Fb = { bx: G.bx, by: G.by, along: Float64Array.from(G.uy, (v) => -v), cross: G.ux };
  for (const w of V.vorticity(Fb)) assert.ok(Math.abs(w) < 1e-15);
});

test('Galilean factor vanishes at f = 1/2 and viscosity is positive and finite for f in (0.1, 0.5)', () => {
  assert.ok(Math.abs(V.galileanFactor(0.5)) < 1e-15);
  for (const f of [0.1, 0.2, 0.3, 0.4, 0.5]) { const nu = V.viscosityFHP3(f); assert.ok(nu > 0 && Number.isFinite(nu), `nu(${f})=${nu}`); }
});
