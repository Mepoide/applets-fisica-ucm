import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as Md from '../applets/madelung/model.js';
import * as Ch from '../applets/_chain/chain.js';

test('Madelung: Evjen sums converge to 1.7476 quickly; naive sums oscillate around it', () => {
  const ev = Md.series(6, Md.evjenSum), nv = Md.series(6, Md.naiveSum);
  assert.ok(Math.abs(ev[5] - Md.EXACT) < 2e-4, `Evjen k=6: ${ev[5]}`);
  assert.ok(Math.abs(ev[1] - Md.EXACT) < 0.01, `Evjen k=2: ${ev[1]}`);
  assert.ok(Math.abs(nv[5] - Md.EXACT) > 0.03, `naive k=6 should be far: ${nv[5]}`);
  assert.ok((nv[4] - Md.EXACT) * (nv[5] - Md.EXACT) < 0, 'naive alternates sign of the error');
  assert.ok(Math.abs(Md.naiveCharge(1)) === 1 && Math.abs(Md.naiveCharge(2)) === 1, 'odd cube charge ±1');
});

test('monatomic chain: node counting reproduces (2/π) arcsin(ω/2) and the band edge at ω = 2', () => {
  const m = new Float64Array(400).fill(1);
  const ws = [0.3, 0.8, 1.2, 1.6, 1.95, 2.2];
  const idos = Ch.integratedDOS(m, ws);
  ws.forEach((w, j) => assert.ok(Math.abs(idos[j] - Ch.monatomicIDOS(w)) < 0.02, `ω=${w}: ${idos[j]} vs ${Ch.monatomicIDOS(w)}`));
  assert.equal(idos[5], 1);
});
test('random binary chain: heavy masses push weight to low ω and open a gap-like depletion', () => {
  const m = Ch.randomMasses(2000, 3, 0.5, mulberry32(1));
  const ws = Array.from({ length: 41 }, (_, i) => 0.05 * i);
  const idos = Ch.integratedDOS(m, ws), mono = ws.map(Ch.monatomicIDOS);
  assert.ok(idos[20] > mono[20] + 0.1, `at ω=1: ${idos[20]} vs monatomic ${mono[20]}`);
  assert.ok(idos[40] <= 1 && idos[40] > 0.99);
});
test('Fibonacci masses: fraction of heavy atoms → 1/τ² ≈ 0.382; chain length a Fibonacci number', () => {
  const m = Ch.fibonacciMasses(1000, 2); let h = 0; for (const v of m) if (v === 2) h++;
  assert.ok(Math.abs(h / 1000 - 0.382) < 0.01, `heavy fraction ${h / 1000}`);
  assert.equal(Ch.fibonacciNumber(10), 89);
});
test('transmission: perfect segment transmits fully inside the band; one impurity reflects; disorder localises', () => {
  const perfect = new Float64Array(50).fill(1);
  for (const w of [0.3, 1, 1.7]) assert.ok(Math.abs(Ch.transmission(perfect, w) - 1) < 1e-9, `perfect T(${w}) = ${Ch.transmission(perfect, w)}`);
  assert.equal(Ch.transmission(perfect, 2.5), 0);
  const imp = new Float64Array(50).fill(1); imp[25] = 3;
  const Ti = Ch.transmission(imp, 1.5); assert.ok(Ti < 0.9 && Ti > 0, `impurity T = ${Ti}`);
  const dis = Ch.randomMasses(400, 3, 0.5, mulberry32(2));
  assert.ok(Ch.transmission(dis, 1.5) < 0.05, `disordered T = ${Ch.transmission(dis, 1.5)}`);
  assert.ok(Ch.transmission(dis, 0.1) > 0.5, 'long wavelengths pass');
  const ws = Array.from({ length: 101 }, (_, i) => 0.02 * i);
  const kPerfect = Ch.conductivity(ws.map((w) => Ch.transmission(perfect, w)), ws, 0.3);
  const kDis = Ch.conductivity(ws.map((w) => Ch.transmission(dis, w)), ws, 0.3);
  assert.ok(kPerfect > 0.98 && kDis < 0.5, `κ perfect ${kPerfect} disordered ${kDis}`);
});
