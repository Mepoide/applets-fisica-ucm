import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as H from '../applets/_fhp/fhp.js';

test('collision tables conserve mass and momentum for all 128 states and are bijections', () => {
  const { coll1, coll2, dens, vx, vy } = H.TABLES;
  for (const t of [coll1, coll2]) {
    const seen = new Set();
    for (let s = 0; s < 128; s++) {
      const o = t[s];
      assert.equal(dens[o], dens[s], `mass ${s} -> ${o}`);
      assert.ok(Math.abs(vx[o] - vx[s]) < 1e-12 && Math.abs(vy[o] - vy[s]) < 1e-12, `momentum ${s} -> ${o}`);
      seen.add(o);
    }
    assert.equal(seen.size, 128, 'table is a permutation');
  }
  // the two tables differ only in the chirality of head-on collisions
  let diff = 0; for (let s = 0; s < 128; s++) if (coll1[s] !== coll2[s]) diff++;
  assert.equal(diff, 12);
});

test('streaming on a periodic lattice conserves particles and momentum', () => {
  const L = H.createLattice(40, 30);
  H.fillRandom(L, 0.3, mulberry32(3));
  const n0 = H.particleCount(L), [px0, py0] = H.totalMomentum(L);
  for (let t = 0; t < 100; t++) H.step(L, { periodicY: true });
  assert.equal(H.particleCount(L), n0);
  const [px, py] = H.totalMomentum(L);
  assert.ok(Math.abs(px - px0) < 1e-9 && Math.abs(py - py0) < 1e-9);
});

test('a lone particle moving along x returns after nx steps; diagonal one moves (+1,+1) per step', () => {
  const L = H.createLattice(20, 10);
  L.a[5 * 20 + 3] = 1 << 1;
  for (let t = 0; t < 20; t++) H.step(L);
  assert.equal(L.a[5 * 20 + 3], 1 << 1);
  const M = H.createLattice(20, 10);
  M.a[2 * 20 + 3] = 1 << 2;
  H.step(M);
  assert.equal(M.a[3 * 20 + 4], 1 << 2);
  assert.equal(H.particleCount(M), 1);
});

test('solid nodes reflect: bounce-back reverses, specular mirrors y; mass conserved with walls', () => {
  for (const rule of ['bounceback', 'specular']) {
    const L = H.createLattice(30, 30);
    L.solid = new Uint8Array(30 * 30);
    for (let ix = 5; ix < 25; ix++) L.solid[15 * 30 + ix] = 1; // horizontal plate
    for (let ix = 0; ix < 30; ix++) { L.solid[ix] = 1; L.solid[29 * 30 + ix] = 1; } // closed top/bottom
    H.fillRandom(L, 0.4, mulberry32(1));
    const n0 = H.particleCount(L);
    for (let t = 0; t < 200; t++) H.step(L, { periodicY: false, wallRule: rule });
    assert.equal(H.particleCount(L), n0, `${rule} lost mass`);
  }
  // single particle going up (dir 2) hitting a plate: bounce-back gives dir 5, specular gives dir 6
  const L = H.createLattice(10, 10); L.solid = new Uint8Array(100); L.solid[5 * 10 + 5] = 1;
  L.a[4 * 10 + 4] = 1 << 2; H.step(L, { wallRule: 'bounceback' }); assert.equal(L.a[5 * 10 + 5], 1 << 5);
  const M = H.createLattice(10, 10); M.solid = new Uint8Array(100); M.solid[5 * 10 + 5] = 1;
  M.a[4 * 10 + 4] = 1 << 2; H.step(M, { wallRule: 'specular' }); assert.equal(M.a[5 * 10 + 5], 1 << 6);
});

test('coarse-grained velocity of a uniform beam is correct in both components', () => {
  const L = H.createLattice(24, 24);
  for (let i = 0; i < 24 * 24; i++) L.a[i] = (1 << 2); // everything moving along c2 = (1/2, s)
  const g = H.coarseGrain(L, 12);
  for (let k = 0; k < g.ux.length; k++) {
    assert.ok(Math.abs(g.ux[k] - 0.5) < 1e-12 && Math.abs(g.uy[k] - H.S3) < 1e-12);
    assert.equal(g.rho[k], 1);
  }
});

test('open y boundaries lose particles that leave, and nothing enters', () => {
  const L = H.createLattice(10, 10);
  L.a[9 * 10 + 2] = 1 << 3; // moving up from the top row
  H.step(L, { periodicY: false });
  assert.equal(H.particleCount(L), 0);
});
