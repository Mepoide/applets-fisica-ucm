import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import { tridiagEigenvalues } from '../lib/linalg.js';
import * as D from '../applets/_schrod/delta.js';
import * as PW from '../applets/ondas-planas/model.js';
import * as SS from '../applets/estados-superficiales/model.js';

test('single δ barrier: T = 1/(1 + λ²/4E) exactly; no δ: T = 1', () => {
  for (const E of [0.5, 2, 9]) {
    const T = D.transmission([2], [0.3], E);
    assert.ok(Math.abs(T - 1 / (1 + 4 / (4 * E))) < 1e-12, `E=${E}: ${T}`);
  }
  assert.ok(Math.abs(D.transmission([], [], 1) - 1) < 1e-12);
});
test('periodic δ chain: full transmission resonances inside Kronig–Penney bands, exponential suppression in gaps', () => {
  const N = 40, L = 1, lam = new Float64Array(N).fill(3), x = Float64Array.from({ length: N }, (_, i) => i * L);
  const edges = D.bandEdges(3, 1, 0.01, 60);
  assert.ok(edges.length >= 4, `edges ${edges}`);
  // first band [edges[0], edges[1]], first gap (edges[1], edges[2])
  const Eband = 0.5 * (edges[0] + edges[1]), Egap = 0.5 * (edges[1] + edges[2]);
  assert.ok(D.inBand(Eband, 3, 1) && !D.inBand(Egap, 3, 1));
  let Tmax = 0; for (let E = edges[0] + 0.01; E < edges[1]; E += 0.002) Tmax = Math.max(Tmax, D.transmission(lam, x, E));
  assert.ok(Tmax > 0.99, `band Tmax ${Tmax}`);
  assert.ok(D.transmission(lam, x, Egap) < 1e-4, `gap T ${D.transmission(lam, x, Egap)}`);
});
test('disordered δ chain: ⟨ln T⟩ decreases linearly with length (Anderson localisation)', () => {
  const rng = mulberry32(3), L = 1, E = 4;
  const lnT = (N) => { let s = 0; for (let r = 0; r < 20; r++) { const lam = Float64Array.from({ length: N }, () => (rng() < 0.5 ? 1 : 3)); const x = Float64Array.from({ length: N }, (_, i) => i * L); s += Math.log(Math.max(1e-300, D.transmission(lam, x, E))); } return s / 20; };
  const a = lnT(50), b = lnT(100), c = lnT(200);
  assert.ok(a > b && b > c, `ln T: ${a} ${b} ${c}`);
  assert.ok((c - a) / 150 < -0.005, `decay rate ${(c - a) / 150} per site`); // ⟨ln T⟩ ≈ −N/ξ
});

test('tridiagonal eigenvalues: 2×2 and a known 3×3', () => {
  const ev = tridiagEigenvalues([2, 2], [1]); assert.ok(Math.abs(ev[0] - 1) < 1e-9 && Math.abs(ev[1] - 3) < 1e-9);
  const e3 = tridiagEigenvalues([2, 2, 2], [1, 1]); // eigenvalues 2 − √2, 2, 2 + √2
  assert.ok(Math.abs(e3[0] - (2 - Math.SQRT2)) < 1e-9 && Math.abs(e3[1] - 2) < 1e-9 && Math.abs(e3[2] - (2 + Math.SQRT2)) < 1e-9);
});
test('Mathieu bands: free electron for V0 = 0, gap at the zone boundary ≈ V0 for small V0, converged in M', () => {
  const b0 = PW.bands(0, 6, [0.3])[0]; assert.ok(Math.abs(b0[0] - 0.09) < 1e-9 && Math.abs(b0[1] - (0.3 - 2) ** 2) < 1e-9);
  const g = PW.firstGap(0.4, 8); assert.ok(Math.abs(g - 0.4) < 0.03, `gap ${g} vs V0 0.4`);
  const g5 = PW.firstGap(2, 5), g12 = PW.firstGap(2, 12); assert.ok(Math.abs(g5 - g12) < 1e-6, 'converged');
});

test('surface states: eigenvalues appear in Kronig–Penney gaps and are localised at the surface', () => {
  const P = -3, a = 1, N = 30, V0 = 12; // attractive atomic wells: a Tamm state appears in the gap
  const edges = SS.bandEdges(P, a, -10, V0);
  const evs = SS.eigenvalues(P, a, N, V0, -10, V0 - 0.05);
  assert.ok(evs.length > N, `expected bulk states, got ${evs.length}`);
  const gapStates = evs.filter((E) => !SS.inBand(E, P, a));
  assert.ok(gapStates.length >= 1, `no gap state; edges ${edges.map((e) => e.toFixed(2))}`);
  const wf = SS.waveFunction(gapStates[0], P, a, N, V0, -N * a, 2 * a, 2000);
  assert.ok(SS.surfaceWeight(wf, a) > 0.3, `surface weight ${SS.surfaceWeight(wf, a)}`);
  const bulk = evs.find((E) => SS.inBand(E, P, a));
  assert.ok(SS.surfaceWeight(SS.waveFunction(bulk, P, a, N, V0, -N * a, 2 * a, 2000), a) < 0.3, 'bulk state is extended');
});
