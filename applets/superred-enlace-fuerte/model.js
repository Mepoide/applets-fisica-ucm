// Tight-binding superlattice: E_n C_n − C_{n+1} − C_{n−1} = E C_n (T = 1), with E_n = W(r_n − ½) − F n.
import { tridiagEigenvalues, tridiagEigenvector } from '../../lib/linalg.js';
export function siteEnergies(N, { W = 0, F = 0, rng = Math.random } = {}) { const c = (N - 1) / 2; return Float64Array.from({ length: N }, (_, n) => W * (rng() - 0.5) - F * (n - c)); }
export function spectrum(eps) { const e = new Float64Array(eps.length - 1).fill(-1); return tridiagEigenvalues(eps, e); }
export function eigenstate(eps, E) { const e = new Float64Array(eps.length - 1).fill(-1); return tridiagEigenvector(eps, e, E); }
export function participation(C) { let s2 = 0, s4 = 0; for (const c of C) { s2 += c * c; s4 += c ** 4; } return s2 * s2 / s4; }
export function centroid(C) { let s = 0, w = 0; for (let n = 0; n < C.length; n++) { s += n * C[n] * C[n]; w += C[n] * C[n]; } return s / w; }
// Periodic case: E_k = −2 cos k, k = jπ/(N+1) for the open chain.
export function periodicEnergies(N) { return Array.from({ length: N }, (_, j) => -2 * Math.cos((j + 1) * Math.PI / (N + 1))); }
// Wannier–Stark: ladder spacing F, localisation length ~ 4/F sites.
export function starkLength(F) { return F > 0 ? 4 / F : Infinity; }
