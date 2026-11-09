import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as I from '../applets/cvising/model.js';
import * as Dm from '../applets/diatom/model.js';
import * as Db from '../applets/debye/model.js';

test('Ising transfer matrix: Nx = 1 reproduces the exact ring Z = λ₊^N + λ₋^N and tends to the infinite chain at T ≥ 1', () => {
  const Ts = Array.from({ length: 21 }, (_, i) => 0.6 + i * 0.2);
  const cur = I.specificHeatCurve(1, 60, Ts);
  for (let i = 0; i < Ts.length; i++) {
    const K = 1 / Ts[i], N = 60, f = (b) => Math.log(Math.pow(2 * Math.cosh(b), N) + Math.pow(2 * Math.sinh(b), N));
    const d = 1e-3 * K, cRing = K * K * (f(K + d) - 2 * f(K) + f(K - d)) / (d * d) / N;
    assert.ok(Math.abs(cur.c[i] - cRing) < 2e-3, `T=${Ts[i]} c=${cur.c[i]} ring=${cRing}`);
    if (Ts[i] >= 1) assert.ok(Math.abs(cur.c[i] - I.c1D(Ts[i])) < 0.01, `T=${Ts[i]} c=${cur.c[i]} chain=${I.c1D(Ts[i])}`);
  }
});
test('Ising: ln Z of a 2×2 torus matches the brute-force sum, and the peak moves towards T_c with size', () => {
  // 2×2 periodic: each spin has 2 distinct neighbours counted once per bond → 4 bonds with double counting in torus of size 2: our model uses bonds (i,i+1 mod 2) twice → 8 bond terms. Compare with brute force using the same convention.
  const beta = 0.7; let Z = 0;
  for (let s = 0; s < 16; s++) {
    const sp = [1, 2, 4, 8].map((b) => ((s & b) ? 1 : -1)); // s0 s1 (row 0), s2 s3 (row 1)
    let e = 0;
    for (const [a, b] of [[0, 1], [1, 0], [2, 3], [3, 2]]) e += sp[a] * sp[b]; // horizontal, periodic with Nx = 2 (both directions)
    for (const [a, b] of [[0, 2], [1, 3], [2, 0], [3, 1]]) e += sp[a] * sp[b]; // vertical, periodic Ny = 2
    Z += Math.exp(beta * e);
  }
  assert.ok(Math.abs(I.lnZ(2, 2, beta) - Math.log(Z)) < 1e-9, `lnZ ${I.lnZ(2, 2, beta)} vs ${Math.log(Z)}`);
  const Ts = Array.from({ length: 60 }, (_, i) => 1.5 + i * 0.03);
  const p4 = I.peak(I.specificHeatCurve(4, 4, Ts)), p6 = I.peak(I.specificHeatCurve(6, 6, Ts));
  assert.ok(Math.abs(p6.T - I.TC2D) < Math.abs(p4.T - I.TC2D) + 0.02, `peaks ${p4.T} ${p6.T} Tc ${I.TC2D}`);
  assert.ok(p6.c > p4.c, 'peak grows with size');
});
test('Onsager specific heat: diverges near T_c, small far away; elliptic integrals K(0)=E(0)=π/2', () => {
  const { K, E } = I.ellipticKE(0);
  assert.ok(Math.abs(K - Math.PI / 2) < 1e-12 && Math.abs(E - Math.PI / 2) < 1e-12);
  assert.ok(I.c2D(I.TC2D * 1.001) > 3, `c near Tc ${I.c2D(I.TC2D * 1.001)}`);
  assert.ok(I.c2D(5) < 0.3 && I.c2D(1) < 0.5);
  for (const T of [1.6, 3.5]) { const c6 = I.specificHeatCurve(6, 32, [T]).c[0]; assert.ok(Math.abs(c6 - I.c2D(T)) < 0.03, `T=${T}: 6×32 ${c6} vs Onsager ${I.c2D(T)}`); }
});

test('diatomic specific heat limits: 3/2, 5/2, 7/2 (units of k_B)', () => {
  const Tr = 2.9, Tv = 3340;
  assert.ok(Math.abs(Dm.cv(0.05, Tr, Tv) - 1.5) < 1e-3);
  assert.ok(Math.abs(Dm.cv(300, Tr, Tv) - 2.5) < 0.01, `room T ${Dm.cv(300, Tr, Tv)}`);
  assert.ok(Math.abs(Dm.cv(1e5, Tr, Tv) - 3.5) < 0.01);
  // rotational maximum slightly above 1 near T ≈ 0.8 Θr
  let m = 0, Tm = 0; for (let T = 0.2; T < 5; T += 0.02) { const c = Dm.cvRot(T, 1); if (c > m) { m = c; Tm = T; } }
  assert.ok(m > 1.05 && m < 1.15 && Tm > 0.6 && Tm < 1.0, `rot max ${m} at ${Tm}`);
});

test('Debye: Dulong–Petit at high T, T³ law at low T, c(Θ) ≈ 2.86', () => {
  assert.ok(Math.abs(Db.cDebye(50 * 300, 300) - 3) < 1e-3);
  const lo = Db.cDebye(0.02 * 300, 300);
  assert.ok(Math.abs(lo / Db.cLowT(0.02 * 300, 300) - 1) < 0.01, `low T ratio ${lo / Db.cLowT(6, 300)}`);
  assert.ok(Math.abs(Db.cDebye(300, 300) - 2.856) < 0.01, `c(Θ) = ${Db.cDebye(300, 300)}`);
});
