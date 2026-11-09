// δ-doped GaAs:Si — Thomas–Fermi potential (exact for a sheet of donors) and confined subbands by
// finite differences. Units: effective Bohr radius a* = 100 Å and effective Rydberg Ry* = 5.8 meV; E_F = 0.
import { tridiagEigenvalues, tridiagEigenvector } from '../../lib/linalg.js';
export const A = 2 / (15 * Math.PI);
export const RY = 5.8, BOHR = 100; // meV, Å
// N_D in units of 10¹² cm⁻² = a*⁻².
export function z0(ND) { return Math.pow(A ** 3 / (Math.PI * ND), 0.2); }
export function potential(z, ND) { const c = z0(ND); return -(A * A) / Math.pow(A * Math.abs(z) + c, 4); }
export function depth(ND) { return -(A * A) / z0(ND) ** 4; }
// Levels (Ry*) and wave functions on [−c, c] with N intervals: −χ'' + V χ = E χ (ħ²/2m* = 1).
export function subbands(ND, { c = 4, N = 1000, nmax = 6 } = {}) {
  const s = 2 * c / N, n = N - 1, zs = Array.from({ length: n }, (_, i) => -c + s * (i + 1));
  const d = new Float64Array(n), e = new Float64Array(n - 1).fill(-1 / (s * s));
  for (let i = 0; i < n; i++) d[i] = potential(zs[i], ND) + 2 / (s * s);
  const ev = tridiagEigenvalues(d, e), E = [], psi = [];
  for (let k = 0; k < ev.length && E.length < nmax && ev[k] < 0; k++) { E.push(ev[k]); psi.push(tridiagEigenvector(d, e, ev[k]).map((v) => v / Math.sqrt(s))); }
  return { zs, E, psi, s };
}
// Number of electrons per subband (2D DOS, per a*²): n_i = (E_F − E_i)/(2π) in Ry* units... the total
// must equal N_D (charge neutrality) — a check of the Thomas–Fermi self-consistency.
export function occupation(E) { return E.map((Ei) => Math.max(0, -Ei) / (2 * Math.PI)); }
