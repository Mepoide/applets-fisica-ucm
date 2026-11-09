import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../applets/_dc/schrod.js';
import * as QW from '../applets/pozo-cuantico/model.js';
import * as DD from '../applets/dopado-delta/model.js';
import * as RT from '../applets/diodo-tunel/model.js';
import * as TB2 from '../applets/dos-bandas/model.js';
import * as ST from '../applets/stark/model.js';
import * as HJ from '../applets/heterounion/model.js';
import * as MB from '../applets/minibandas/model.js';
import * as TB from '../applets/superred-enlace-fuerte/model.js';
import * as GS from '../applets/superred-gaussiana/model.js';
import * as AB from '../applets/absorcion-2d/model.js';

test('schrod: single barrier transmission matches the analytic formula; infinite well levels', () => {
  const V = Array.from({ length: 200 }, (_, i) => (i >= 85 && i < 115 ? 0.25 : 0)), E = 0.1, m = 0.067;
  const ka = Math.sqrt(m * (0.25 - E) / S.HB2M0), Tan = 1 / (1 + 0.25 ** 2 * Math.sinh(ka * 30) ** 2 / (4 * E * (0.25 - E)));
  assert.ok(Math.abs(S.transmission(V, 1, E, m) - Tan) < 2e-3);
  const n = 400, s = 100 / (n + 1), bs = S.boundStates(new Float64Array(n), s, m, { nmax: 2 });
  assert.ok(Math.abs(bs.E[0] / (S.HB2M0 * Math.PI ** 2 / (m * 1e4)) - 1) < 1e-4);
  assert.ok(Math.abs(bs.psi[0].reduce((a, x) => a + x * x, 0) * s - 1) < 1e-9);
});

test('pozo cuántico: levels lie below the infinite-well ones and match the finite-difference solution', () => {
  const x = 0.3, a = 100, lv = QW.levels(x, a), { mA, mB, V0 } = QW.materials(x);
  assert.ok(lv.length >= 2 && lv[0].parity === 'even' && lv[1].parity === 'odd');
  const inf = QW.infiniteLevels(x, a, lv.length); lv.forEach((l, i) => assert.ok(l.E < inf[i] && l.E < V0));
  const n = 1200, s = 400 / (n + 1), zs = Array.from({ length: n }, (_, i) => -200 + s * (i + 1));
  const bs = S.boundStates(zs.map((z) => (Math.abs(z) <= a / 2 ? 0 : V0)), s, zs.map((z) => (Math.abs(z) <= a / 2 ? mA : mB)), { nmax: 6, Emax: V0 });
  lv.forEach((l, i) => { if (V0 - l.E > 5e-3) assert.ok(Math.abs(l.E - bs.E[i]) < 1e-3, `${l.E} vs ${bs.E[i]}`); });
  // a thin well keeps exactly one bound state
  assert.equal(QW.levels(0.3, 20).length, 1);
});

test('dopado delta: Thomas–Fermi potential satisfies its equation and the sheet condition; subbands get deeper with N_D', () => {
  const ND = 5, h = 1e-3, z = 0.7, V = (zz) => DD.potential(zz, ND);
  const Vpp = (V(z + h) - 2 * V(z) + V(z - h)) / (h * h);
  assert.ok(Math.abs(Vpp / (-(8 / (3 * Math.PI)) * Math.pow(-V(z), 1.5)) - 1) < 1e-4);
  const jump = 2 * (V(h) - V(0)) / h; assert.ok(Math.abs(jump / (8 * Math.PI * ND) - 1) < 1e-2);
  const s1 = DD.subbands(2), s5 = DD.subbands(8);
  assert.ok(s1.E.length >= 2 && s5.E[0] < s1.E[0]);
  assert.ok(s5.E.every((E, i) => i === 0 || E > s5.E[i - 1]));
});

test('diodo túnel: resonance at zero bias near the isolated-well level; I–V shows a peak and a valley', () => {
  const p = { b: 30, w: 50, x: 0.3 };
  const Es = Array.from({ length: 1500 }, (_, i) => 1e-4 + 0.3 * i / 1499), Ts = RT.transmissionCurve(RT.profile(p), Es), res = RT.resonances(Es, Ts);
  assert.ok(res.length >= 1 && res[0].T > 0.9, `T_res=${res[0]?.T}`);
  assert.ok(Math.abs(res[0].E - RT.wellLevel(50, 0.3)) < 0.01);
  const Vbs = Array.from({ length: 25 }, (_, i) => 0.3 * i / 24), I = RT.iv(p, Vbs, { EF: 0.05, T: 4.2 });
  const imax = I.indexOf(Math.max(...I)); assert.ok(imax > 0 && imax < I.length - 1 && I[I.length - 1] < 0.5 * I[imax]);
});

test('dos bandas: non-parabolicity lowers every level; Ben Daniel–Duke error grows for the narrow-gap pair', () => {
  const cA = TB2.compare(TB2.SYSTEMS['GaAs-AlAs'], 60), cB = TB2.compare(TB2.SYSTEMS['InAs-GaSb'], 60);
  for (const c of [...cA, ...cB]) if (!Number.isNaN(c.E2)) assert.ok(c.E2 < c.E1 && c.err > 0);
  assert.ok(cB[0].err > cA[0].err);
});

test('stark: numeric ground state agrees with second-order perturbation theory; f12 = 0.9607 at zero field', () => {
  const s0 = ST.solve(0); assert.ok(Math.abs(s0.eps[0] - Math.PI ** 2) < 1e-3 && Math.abs(ST.oscillatorStrength(s0) - ST.F12_0) < 2e-3);
  for (const v of [5, 15, 30]) { const s = ST.solve(v); assert.ok(Math.abs(s.eps[0] - ST.perturbative(v)) < 0.02 * Math.abs(Math.PI ** 2 - ST.perturbative(v)) + 2e-3, `v=${v}: ${s.eps[0]} vs ${ST.perturbative(v)}`); }
  assert.ok(ST.oscillatorStrength(ST.solve(40)) < ST.F12_0);
});

test('heterounión: universal triangular well gives the Airy zero; the Gaussian trial function gives 2.3448; finite barrier lowers the level', () => {
  const u = HJ.universal(); assert.ok(Math.abs(u.eps[0] - HJ.AIRY1) < 2e-3, String(u.eps[0]));
  assert.ok(Math.abs(HJ.variationalEnergy(HJ.B_VAR) - HJ.C_VAR) < 1e-4);
  const g = HJ.gaas(5, 0.3); assert.ok(g.E.length >= 1 && g.E[0] < g.Einf && g.E[0] > 0.5 * g.Einf);
  const g2 = HJ.gaas(5, 0.45); assert.ok(g2.E[0] > g.E[0]); // higher barrier → closer to the infinite-barrier value
});

test('minibandas: the Kronig–Penney function reproduces the one-period transfer matrix; first miniband straddles the isolated level; δ model agrees for thin barriers', () => {
  const x = 0.3, dp = 60, db = 30, { mA, mB, V0 } = MB.materials(x);
  // one-period transfer matrix with ψ'/m matching, built independently
  const trace = (E) => { const k = Math.sqrt(mA * E / S.HB2M0), q = Math.sqrt(mB * (V0 - E) / S.HB2M0);
    // propagate (ψ, ψ'/m) across well then barrier
    const Pw = [[Math.cos(k * dp), mA * Math.sin(k * dp) / k], [-k * Math.sin(k * dp) / mA, Math.cos(k * dp)]];
    const Pb = [[Math.cosh(q * db), mB * Math.sinh(q * db) / q], [q * Math.sinh(q * db) / mB, Math.cosh(q * db)]];
    return 0.5 * (Pb[0][0] * Pw[0][0] + Pb[0][1] * Pw[1][0] + Pb[1][0] * Pw[0][1] + Pb[1][1] * Pw[1][1]); };
  for (const E of [0.02, 0.08, 0.15]) assert.ok(Math.abs(trace(E) - MB.kpRHS(E, x, dp, db)) < 1e-9);
  const b = MB.bands((E) => MB.kpRHS(E, x, dp, db), 1e-4, V0), E1 = MB.isolatedLevel(x, dp);
  assert.ok(b.length >= 1 && b[0][0] < E1 && E1 < b[0][1]);
  const thin = MB.bands((E) => MB.kpRHS(E, 0.3, 100, 4), 1e-4, 0.2), dl = MB.bands((E) => MB.deltaRHS(E, 0.3, 100, 4), 1e-4, 0.2);
  assert.ok(Math.abs(thin[0][0] - dl[0][0]) < 0.004 && Math.abs(thin[0][1] - dl[0][1]) < 0.004);
});

test('superred enlace fuerte: ordered chain gives −2cos k; disorder and field localise the states', () => {
  const N = 41, sp = TB.spectrum(TB.siteEnergies(N)), ref = TB.periodicEnergies(N);
  sp.forEach((E, j) => assert.ok(Math.abs(E - ref[j]) < 1e-8));
  const C = TB.eigenstate(TB.siteEnergies(N), sp[20]); assert.ok(TB.participation(C) > 0.45 * N);
  let seed = 7; const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const epsW = TB.siteEnergies(N, { W: 4, rng }), spW = TB.spectrum(epsW); assert.ok(TB.participation(TB.eigenstate(epsW, spW[20])) < 0.4 * N);
  const epsF = TB.siteEnergies(N, { F: 0.5 }), spF = TB.spectrum(epsF);
  for (let j = 10; j < 30; j++) assert.ok(Math.abs(spF[j + 1] - spF[j] - 0.5) < 1e-3); // Wannier–Stark ladder
  assert.ok(TB.participation(TB.eigenstate(epsF, spF[20])) < 1.5 * TB.starkLength(0.5) + 2);
});

test('superred gaussiana: empty chain transmits fully; uniform superlattice shows a miniband; Gaussian profile smooths it', () => {
  assert.ok(Math.abs(GS.transmission(new Float64Array(11), 0.3) - 1) < 1e-12);
  const Es = Array.from({ length: 800 }, (_, i) => -1.95 + 3.9 * i / 799);
  const Tu = GS.spectrum(GS.uniform(9, 1.5), Es), Tg = GS.spectrum(GS.siteEnergies(9, 1.5, 9 / 4), Es);
  for (const T of [...Tu, ...Tg]) assert.ok(T >= 0 && T <= 1);
  // the uniform lattice has many resonances (oscillations) in its miniband; the Gaussian one far fewer dips
  const dips = (T) => { let n = 0; for (let i = 1; i + 1 < T.length; i++) if (T[i] < T[i - 1] && T[i] < T[i + 1] && T[i] < 0.9) n++; return n; };
  assert.ok(dips(Tu) > dips(Tg), `${dips(Tu)} vs ${dips(Tg)}`);
  assert.ok(Math.max(...Tu) > 0.99 && Math.max(...Tg) > 0.9);
});

test('absorción 2D: exciton peak at ε = −4, Sommerfeld factor tends to 2 at threshold and 1 far above; synthetic fit is recovered', () => {
  assert.ok(Math.abs(AB.sommerfeld(1e-6) - 2) < 1e-6 && Math.abs(AB.sommerfeld(1e4) - 1) < 0.07);
  const es = Array.from({ length: 300 }, (_, i) => -6 + 12 * i / 299), g = 0.3, a = AB.spectrum(es, g);
  const imax = a.indexOf(Math.max(...a)); assert.ok(Math.abs(es[imax] + 4) < 0.1);
  const target = AB.synthetic(es, { g: 0.42, noise: 0 }), norm = (v) => { const m = Math.max(...v); return v.map((x) => x / m); };
  const err = (gg) => AB.rms(norm(AB.spectrum(es, gg)), target);
  assert.ok(err(0.42) < err(0.3) && err(0.42) < err(0.6) && err(0.42) < 1e-6);
});
