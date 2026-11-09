import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import { symmetricEigen } from '../lib/linalg.js';
import * as R from '../applets/rmn/model.js';
import * as A from '../applets/agregados/model.js';
import * as B from '../applets/oscilaciones-bloch/model.js';
import * as X from '../applets/multicapas/model.js';

test('Bloch equations: free induction decay matches the analytic solution; resonant B1 tips the magnetisation', () => {
  const s = R.create({ alpha: 10, omega1: 0, T1: 3, m0: [1, 0, 1] });
  for (let i = 0; i < 400; i++) R.step(s, 0.005); // t = 2
  const f = R.fid(10, s.t);
  assert.ok(Math.abs(s.m[0] - f.mx) < 1e-6 && Math.abs(s.m[1] - f.my) < 1e-6, `FID ${s.m[0]} ${f.mx}`);
  const r = R.create({ alpha: 20, omega1: 2, omegaRel: 1, T1: 1e6, m0: [0, 0, 1] });
  // in the rotating frame m precesses about B1 at ω1: m_z ≈ cos(ω1 t) e^{...}; check it drops well below 1 (and T2 damping)
  for (let i = 0; i < 160; i++) R.step(r, 0.005); // t = 0.8 → ω1 t = 1.6 rad
  assert.ok(r.m[2] < 0.3, `resonant tipping m_z = ${r.m[2]}`);
  const off = R.create({ alpha: 20, omega1: 2, omegaRel: 1.5, T1: 1e6, m0: [0, 0, 1] });
  for (let i = 0; i < 160; i++) R.step(off, 0.005);
  assert.ok(off.m[2] > r.m[2], 'off-resonance tips less');
  const abs = R.absorption(10, [8, 10, 12]); assert.ok(abs[1] === 1 && Math.abs(abs[0] - 0.2) < 1e-12);
});

test('symmetricEigen: eigenvectors reproduce A v = λ v for a random symmetric matrix', () => {
  const rng = mulberry32(1), n = 6, M = new Float64Array(n * n);
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) { const v = rng() - 0.5; M[i * n + j] = v; M[j * n + i] = v; }
  const { values, vectors } = symmetricEigen(M, n);
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < n; j++) s += M[i * n + j] * vectors[k * n + j]; assert.ok(Math.abs(s - values[k] * vectors[k * n + i]) < 1e-9); }
  for (let k = 1; k < n; k++) assert.ok(values[k] >= values[k - 1]);
});
test('Frenkel excitons: periodic band −2cos k, all oscillator strength in k = 0, sum rule Σf = N; disorder spreads it', () => {
  const ex = A.excitons(12, { periodic: true });
  const exact = A.periodicEnergies(12);
  for (let j = 0; j < 12; j++) assert.ok(Math.abs(ex.E[j] - exact[j]) < 1e-8, `E_${j}`);
  assert.ok(Math.abs(A.totalStrength(ex) - 12) < 1e-8);
  const b = A.brightState(ex); assert.ok(Math.abs(b.f - 12) < 1e-6 && Math.abs(b.E + 2) < 1e-8 && Math.abs(b.participation - 12) < 1e-6);
  const dis = A.excitons(40, { periodic: true, W: 3, rng: mulberry32(2) });
  assert.ok(Math.abs(A.totalStrength(dis) - 40) < 1e-6);
  assert.ok(A.brightState(dis).f < 30, `disordered bright f = ${A.brightState(dis).f}`);
  const sp = A.spectrum(ex, [-2, 0, 2], 0.2); assert.ok(sp[0] > 10 * sp[1]);
});
test('Bloch oscillations: free packet spreads as √2 T t; with field the centroid oscillates with period 2π/F and stays bounded', () => {
  const free = B.create({ N: 161, T: 1, F: 0 });
  let p = B.probability(free, 0); assert.ok(Math.abs(p[free.n0] - 1) < 1e-9);
  const m = B.moments(B.probability(free, 10), free.n0);
  assert.ok(Math.abs(m.radius - B.freeRadius(1, 10)) < 0.2, `radius ${m.radius} vs ${B.freeRadius(1, 10)}`);
  const F = 0.25, s = B.create({ N: 161, T: 1, F });
  const TB = B.blochPeriod(F); let maxC = 0, minC = 0;
  for (let t = 0; t <= TB; t += TB / 40) { const mo = B.moments(B.probability(s, t), s.n0); maxC = Math.max(maxC, mo.centroid); minC = Math.min(minC, mo.centroid); }
  const back = B.moments(B.probability(s, TB), s.n0);
  assert.ok(Math.abs(back.centroid) < 0.05 && back.radius < 0.2, `after one Bloch period: centroid ${back.centroid} radius ${back.radius}`);
  assert.ok(maxC - minC > 0.5 * B.blochAmplitude(1, F) * 0.5, `amplitude ${maxC - minC} vs 4T/F = ${B.blochAmplitude(1, F)}`);
});
test('X-ray multilayer: single interface Fresnel, quarter-wave stack Bragg peak at λ_B, R ≤ 1', () => {
  // one thick layer of index 0.9 on vacuum: R at the top interface only matters when thickness ≫ coherence → use thin-film formula check at a simple case
  const a = { delta: 0.1, beta: 0, d: 10 }, b = { delta: 0.0, beta: 0, d: 10 };
  const stack = X.periodicStack(40, a, b), lb = X.braggWavelength(a, b);
  const ls = Array.from({ length: 201 }, (_, i) => lb * (0.8 + 0.4 * i / 200));
  const R = X.spectrum(stack, ls);
  let imax = 0; for (let i = 1; i < R.length; i++) if (R[i] > R[imax]) imax = i;
  assert.ok(Math.abs(ls[imax] / lb - 1) < 0.03, `peak at ${ls[imax]} vs λ_B ${lb}`);
  assert.ok(R[imax] > 0.9 && R.every((r) => r <= 1 + 1e-9 && r >= 0), `peak R ${R[imax]}`);
  const single = X.reflectivity([{ n: [0.8, 0], d: 1e6 }], 1.000001, [0.8, 0]); // semi-infinite medium: R = ((1−0.8)/(1+0.8))²
  assert.ok(Math.abs(single - (0.2 / 1.8) ** 2) < 1e-6, `Fresnel ${single}`);
});
