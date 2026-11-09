import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as D from '../applets/_kinetic/disks.js';

test('specular box conserves energy and never overlaps (mixed radii)', () => {
  const radii = Array.from({ length: 30 }, (_, i) => (i === 0 ? 10 : 4));
  const s = D.createGas({ N: 30, radii, rng: mulberry32(5) });
  const E0 = D.kineticEnergy(s);
  for (let n = 0; n < 200; n++) {
    D.step(s);
    assert.ok(Math.abs(D.kineticEnergy(s) - E0) < 1e-9 * E0, `energy drift at ${n}`);
    assert.ok(D.minGap(s) > -1e-9, `overlap ${D.minGap(s)} at ${n}`);
  }
  assert.ok(s.ncol > 20, `collisions ${s.ncol}`);
});

test('collision of masses 1 and 20 conserves momentum and energy', () => {
  const s = D.createGas({ N: 2, masses: [1, 20], radii: [4, 8], rng: mulberry32(2) });
  s.x[0] = 50; s.y[0] = 50; s.x[1] = 62; s.y[1] = 50; s.vx[0] = 2; s.vy[0] = 0.5; s.vx[1] = -0.1; s.vy[1] = 0.2;
  const p0 = D.momentum(s), E0 = D.kineticEnergy(s);
  D.collide(s, 0, 1);
  const p1 = D.momentum(s), E1 = D.kineticEnergy(s);
  assert.ok(Math.abs(p0[0] - p1[0]) < 1e-12 && Math.abs(p0[1] - p1[1]) < 1e-12);
  assert.ok(Math.abs(E0 - E1) < 1e-12);
  assert.ok(s.vx[0] < 0, 'light disk bounces back off the heavy one');
});

test('thermal wall at kT=2 heats a gas prepared at kT=1; bookkeeping matches energy gain', () => {
  const s = D.createGas({ N: 40, dist: 'maxwell', kT: 1, rng: mulberry32(9), walls: { left: { thermal: 2 }, right: { thermal: 2 } } });
  const E0 = D.kineticEnergy(s);
  const series = [];
  for (let n = 0; n < 400; n++) { D.step(s); if (n % 40 === 39) series.push(D.kineticTemperature(s)); }
  assert.ok(series[series.length - 1] > 1.5, `final kT ${series[series.length - 1]}`);
  assert.ok(series[series.length - 1] > series[0], 'temperature rises');
  assert.ok(Math.abs((s.heat.left + s.heat.right) - (D.kineticEnergy(s) - E0)) < 1e-6 * E0, 'heat bookkeeping');
});

test('closed partition keeps every disk on the left; opening it lets them cross', () => {
  const s = D.createGas({ N: 40, rng: mulberry32(4), partition: { x: 100, open: false } });
  for (let n = 0; n < 100; n++) { D.step(s); assert.deepEqual(D.countSide(s), [40, 0]); }
  D.openPartition(s);
  for (let n = 0; n < 300; n++) D.step(s);
  const [l, r] = D.countSide(s);
  assert.ok(r > 5 && l + r === 40, `after opening: ${l}/${r}`);
});

test('profile bins sum to N and slab temperature is finite where occupied', () => {
  const s = D.createGas({ N: 50, dist: 'maxwell', kT: 1.5, rng: mulberry32(1) });
  const p = D.profile(s, 5);
  let n = 0; for (const v of p.n) n += v;
  assert.equal(n, 50);
  for (let b = 0; b < 5; b++) if (p.n[b]) assert.ok(Number.isFinite(p.T[b]));
});
