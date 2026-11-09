// Surface states of a semi-infinite δ-chain: V(z) = P Σ_{n≥1} δ(z + n a) for z < 0 and V = V0
// (vacuum) for z > 0, units ħ²/2m = 1. Inside the crystal the Kronig–Penney relation
// cos(ka) = cos(qa) + (P/2q) sin(qa), q = √E, defines bands; in a gap k = nπ/a + iμ and a
// solution decaying into the crystal exists. Matching to the vacuum decay κ = √(V0 − E) selects
// discrete surface-state energies in the gaps. Here they are found numerically for a long but
// finite crystal (N cells, hard wall at the far end) by shooting; bulk states fill the bands.
import * as D from '../_schrod/delta.js';

export function surfaceSetup(P, a, N) {
  const lam = new Float64Array(N).fill(P), x = new Float64Array(N);
  for (let n = 0; n < N; n++) x[n] = -(N - n) * a; // from the far wall towards the surface at z = 0
  return { lam, x, wall: -(N + 1) * a };
}
// Mismatch function f(E) = ψ'(0)/ψ(0) + κ for the solution starting at the hard wall; zeros are eigenstates.
export function mismatch(E, P, a, N, V0) {
  const { lam, x, wall } = surfaceSetup(P, a, N);
  const r = D.shoot(lam, x, E, 0, 1, wall, 0);
  const kappa = Math.sqrt(Math.max(0, V0 - E));
  return { f: r.dpsi + kappa * r.psi, psi: r.psi, dpsi: r.dpsi, nodes: r.nodes };
}
// Eigenvalues in (Emin, Emax) by scanning sign changes of f(E) (normalised by |ψ|+|ψ'| for stability).
export function eigenvalues(P, a, N, V0, Emin, Emax, n = 3000) {
  const g = (E) => { const m = mismatch(E, P, a, N, V0); return m.f / (Math.abs(m.psi) + Math.abs(m.dpsi) + 1e-300); };
  const out = []; let prev = g(Emin), Ep = Emin;
  for (let i = 1; i <= n; i++) {
    const E = Emin + (Emax - Emin) * i / n, cur = g(E);
    if (prev * cur < 0 && Math.abs(cur - prev) < 50) { let lo = Ep, hi = E; for (let it = 0; it < 60; it++) { const m = 0.5 * (lo + hi); if (g(lo) * g(m) <= 0) hi = m; else lo = m; } out.push(0.5 * (lo + hi)); }
    prev = cur; Ep = E;
  }
  return out;
}
// Band structure of the bulk crystal (edges) in [Emin, Emax].
export const bandEdges = (P, a, Emin, Emax) => D.bandEdges(P, a, Emin, Emax);
export const inBand = (E, P, a) => D.inBand(E, P, a);
// Wave function on a grid for drawing, normalised to max |ψ| = 1.
export function waveFunction(E, P, a, N, V0, zmin, zmax, n = 600) {
  const { lam, x, wall } = surfaceSetup(P, a, N);
  const zs = [], ps = [];
  let pmax = 0;
  for (let i = 0; i <= n; i++) {
    const z = zmin + (zmax - zmin) * i / n;
    let psi;
    if (z <= 0) psi = D.shoot(lam, x, E, 0, 1, wall, z).psi;
    else { const r = D.shoot(lam, x, E, 0, 1, wall, 0); psi = r.psi * Math.exp(-Math.sqrt(Math.max(0, V0 - E)) * z); }
    zs.push(z); ps.push(psi); pmax = Math.max(pmax, Math.abs(psi));
  }
  return { zs, ps: ps.map((p) => p / (pmax || 1)) };
}
// Fraction of |ψ|² within one lattice constant of the surface (localisation measure).
export function surfaceWeight(wf, a) { let num = 0, den = 0; for (let i = 0; i < wf.zs.length; i++) { const w = wf.ps[i] ** 2; den += w; if (wf.zs[i] > -2 * a && wf.zs[i] < 2 * a) num += w; } return den ? num / den : 0; }
