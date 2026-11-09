import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as BF from '../applets/bosefermi/model.js';
import * as Is from '../applets/ising/model.js';

test('canonical and grand-canonical occupations agree for fermions at N = 10 but differ for bosons', () => {
  const gc = BF.meanOccupations(10, 1.5, 'bose').n, c = BF.canonicalOccupations(10, 1.5, 'bose');
  assert.ok(Math.abs(gc[0] - c[0]) > 0.1, `bose ground: GC ${gc[0]} vs canonical ${c[0]}`);
  const gf = BF.meanOccupations(10, 1.5, 'fermi').n, cf = BF.canonicalOccupations(10, 1.5, 'fermi');
  let d = 0; for (let i = 0; i < 20; i++) d = Math.max(d, Math.abs(gf[i] - cf[i])); assert.ok(d < 0.15, `fermi GC vs canonical ${d}`);
});
test('Bose/Fermi exact occupations: normalised, Pauli bound, Bose ground-state pile-up at low T', () => {
  for (const stat of ['bose', 'fermi']) {
    const { n } = BF.meanOccupations(10, 2, stat);
    let s = 0; for (const v of n) s += v; assert.ok(Math.abs(s - 10) < 1e-6, `${stat} total ${s}`);
    if (stat === 'fermi') for (const v of n) assert.ok(v <= 1 + 1e-12);
  }
  const low = BF.meanOccupations(10, 0.2, 'bose').n; assert.ok(low[0] > 8, `Bose ground ${low[0]}`);
  const f = BF.meanOccupations(10, 0.2, 'fermi').n; assert.ok(f[9] > 0.5 && f[10] < 0.5 && f[0] > 0.99, 'Fermi step at ε_F = N−1');
});
test('Monte Carlo occupations converge to the exact ones for both statistics (N = 10, kT = 1.5)', () => {
  for (const stat of ['bose', 'fermi']) {
    const s = BF.createMC({ N: 10, kT: 1.5, stat, rng: mulberry32(stat === 'bose' ? 1 : 2) });
    for (let t = 0; t < 2000; t++) BF.sweep(s);
    BF.resetHist(s);
    for (let t = 0; t < 40000; t++) BF.sweep(s);
    const h = BF.meanHist(s), n = BF.canonicalOccupations(10, 1.5, stat);
    let tot = 0; for (const v of n) tot += v; assert.ok(Math.abs(tot - 10) < 1e-2, `${stat} canonical total ${tot}`);
    let maxErr = 0; for (let i = 0; i < 15; i++) maxErr = Math.max(maxErr, Math.abs(h[i] - n[i]));
    assert.ok(maxErr < 0.12, `${stat}: max |MC − canonical| = ${maxErr} (MC ${Array.from(h.slice(0, 6)).map((v) => v.toFixed(2))}, exact ${Array.from(n.slice(0, 6)).map((v) => v.toFixed(2))})`);
  }
});

test('Ising 2D: magnetisation ≈ Onsager at K = 0.6, ≈ 0 at K = 0.3; Onsager m(K_c) = 0, m(∞) = 1', () => {
  assert.equal(Is.onsagerM(Is.KC), 0); assert.ok(Is.onsagerM(5) > 0.9999);
  const a = Is.create({ L: 32, K: 0.6, init: 'up', rng: mulberry32(3) });
  for (let t = 0; t < 300; t++) Is.sweep(a);
  let m = 0; for (let t = 0; t < 300; t++) { Is.sweep(a); m += Math.abs(Is.magnetization(a)); } m /= 300;
  assert.ok(Math.abs(m - Is.onsagerM(0.6)) < 0.02, `m ${m} vs Onsager ${Is.onsagerM(0.6)}`);
  const b = Is.create({ L: 32, K: 0.3, init: 'random', rng: mulberry32(4) });
  for (let t = 0; t < 300; t++) Is.sweep(b);
  let m2 = 0; for (let t = 0; t < 300; t++) { Is.sweep(b); m2 += Math.abs(Is.magnetization(b)); } m2 /= 300;
  assert.ok(m2 < 0.15, `|m| at K=0.3: ${m2}`);
  assert.ok(Math.abs(Is.energyPerSpin(a) + 2) < 0.3, 'low-T energy near −2J');
});
