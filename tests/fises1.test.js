import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import { chiSquareSurvival } from '../lib/stats.js';
import * as T from '../applets/tlc/model.js';
import * as B from '../applets/baker/model.js';
import * as O from '../applets/osciladores/model.js';

test('CLT: sums of 12 dice are Gaussian (χ² p > 0.01), mean and variance match', () => {
  const s = T.create({ N: 12, dist: 'dice', rng: mulberry32(1) });
  T.draw(s, 20000);
  const st = T.stats(s);
  assert.ok(Math.abs(st.mean - s.mu) < 0.1, `mean ${st.mean} vs ${s.mu}`);
  assert.ok(Math.abs(st.variance / (s.sd * s.sd) - 1) < 0.05, `variance ratio ${st.variance / (s.sd * s.sd)}`);
  const c = T.chi2(s); let k = 0; for (let b = 0; b < s.nb; b++) if (s.n * T.gaussian(s.lo + (b + 0.5), s.mu, s.sd) >= 5) k++;
  assert.ok(chiSquareSurvival(c * (k - 1), k - 1) > 0.001, `chi2/dof ${c}`);
});
test('CLT: N = 1 uniform is flat (not Gaussian) and Bernoulli sums are binomial-shaped', () => {
  const s = T.create({ N: 1, dist: 'uniform', rng: mulberry32(2) });
  T.draw(s, 5000);
  const d = T.density(s);
  const mid = d.p[Math.floor(s.nb / 2)], edge = d.p[1];
  assert.ok(Math.abs(mid - edge) / mid < 0.5, 'flat density');
  const b = T.create({ N: 4, dist: 'bernoulli', rng: mulberry32(3) }); T.draw(b, 4000);
  assert.ok(b.counts[2] > b.counts[0] && b.counts[2] > b.counts[4]);
});

test('baker and Arnold maps preserve area (uniform cloud stays uniform) and mix a disk', () => {
  const rng = mulberry32(4);
  const pts = B.cloud(20000, rng);
  for (let i = 0; i < 5; i++) B.iterate(pts, B.baker);
  assert.ok(B.uniformityChi2(pts) < 1.6, `baker χ²/dof ${B.uniformityChi2(pts)}`);
  const T = B.completeMatrix(1, 1, 1); // Arnold's cat: [[1,1],[1,2]]
  assert.equal(B.det(T), 1); assert.deepEqual(T, [[1, 1], [1, 2]]);
  const e = B.eigenvalues(T); assert.ok(Math.abs(e.lp - (3 + Math.sqrt(5)) / 2) < 1e-12);
  const dsk = B.disk(20000, rng);
  assert.ok(B.fractionInDisk(dsk) > 0.99);
  for (let i = 0; i < 12; i++) B.iterate(dsk, (x, y) => B.arnold(x, y, T));
  assert.ok(Math.abs(B.fractionInDisk(dsk) - Math.PI * 0.09) < 0.03, `fraction in disk ${B.fractionInDisk(dsk)} vs πr² = ${Math.PI * 0.09}`);
  assert.ok(B.uniformityChi2(dsk) < 2.0, `cat χ²/dof ${B.uniformityChi2(dsk)}`);
});
test('baker map is exactly area preserving on a grid of points and periodic for dyadic rationals', () => {
  const [x, y] = B.baker(0.25, 0.5); assert.ok(Math.abs(x - 0.5) < 1e-15 && Math.abs(y - 0.25) < 1e-15);
  const [x2, y2] = B.baker(0.75, 0.5); assert.ok(Math.abs(x2 - 0.5) < 1e-15 && Math.abs(y2 - 0.75) < 1e-15);
});

test('oscillators: random frequencies drive the entropy to ln M; equispaced ones recur at T = 2πN/ω0', () => {
  const s = O.create({ N: 400, M: 12, freqs: 'random', phases: 'zero', rng: mulberry32(5) });
  assert.equal(O.entropy(s), 0);
  for (let t = 0; t < 2000; t++) O.step(s, 0.05);
  const tail = s.history.slice(-400).map((h) => h[1]);
  const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
  assert.ok(Math.abs(mean - O.expectedEntropy(400, 12)) < 0.03, `S ${mean} vs ${O.expectedEntropy(400, 12)} (ln M ${Math.log(12)})`);
  const e = O.create({ N: 40, M: 8, freqs: 'equispaced', phases: 'zero', omega0: 1, rng: mulberry32(6) });
  const Trec = O.recurrenceTime(e); assert.ok(Math.abs(Trec - 2 * Math.PI * 40) < 1e-9);
  const dt = Trec / 400;
  let grew = false;
  for (let k = 0; k < 400; k++) { O.step(e, dt); if (O.entropy(e) > 1) grew = true; }
  assert.ok(grew && O.entropy(e) < 0.05, `entropy after recurrence ${O.entropy(e)}`);
});
