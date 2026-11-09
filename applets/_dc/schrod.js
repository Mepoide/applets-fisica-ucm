// One-dimensional effective-mass (Ben Daniel–Duke) Schrödinger equation on a uniform grid.
//   −(ħ²/2) d/dz [ (1/m(z)) dχ/dz ] + V(z) χ = E χ
// Energies in eV, lengths in Å, masses in units of the free-electron mass: ħ²/2m₀ = 3.80998 eV·Å².
import { tridiagEigenvalues, tridiagEigenvector } from '../../lib/linalg.js';

export const HB2M0 = 3.80998; // ħ²/(2 m₀) in eV·Å²

// Tridiagonal Hamiltonian for grid values V[i] and masses m[i] (number or array), step s. Hard walls
// outside the grid. Mass at the half points is the harmonic mean of neighbours (flux continuity).
export function hamiltonian(V, s, m = 1) {
  const n = V.length, d = new Float64Array(n), e = new Float64Array(n - 1);
  const mass = (i) => (typeof m === 'number' ? m : m[Math.min(n - 1, Math.max(0, i))]);
  const half = (i) => 2 / (1 / mass(i) + 1 / mass(i + 1)); // between i and i+1
  for (let i = 0; i < n; i++) {
    const mp = HB2M0 / (half(i) * s * s), mm = HB2M0 / (half(i - 1) * s * s);
    d[i] = V[i] + mp + mm;
    if (i < n - 1) e[i] = -mp;
  }
  return { d, e };
}

// Lowest bound states below Emax: { E: [...], psi: [Float64Array...] } with ∫|χ|² dz = 1.
export function boundStates(V, s, m = 1, { nmax = 6, Emax = Infinity } = {}) {
  const { d, e } = hamiltonian(V, s, m);
  const all = tridiagEigenvalues(d, e);
  const E = [], psi = [];
  for (let k = 0; k < all.length && E.length < nmax && all[k] < Emax; k++) {
    E.push(all[k]);
    const v = tridiagEigenvector(d, e, all[k]);
    const norm = Math.sqrt(s); psi.push(v.map((x) => x / norm));
  }
  return { E, psi };
}

// Transmission through a grid potential V (uniform mass m, step s) between semi-infinite leads at
// potentials VL (left) and VR (right) using the discrete Schrödinger equation and plane-wave matching.
export function transmission(V, s, E, m = 0.067, VL = 0, VR = 0) {
  const t2 = HB2M0 / (m * s * s); // hopping energy ħ²/(2 m s²)
  const cosR = 1 - (E - VR) / (2 * t2), cosL = 1 - (E - VL) / (2 * t2);
  if (E <= VR || E <= VL || Math.abs(cosR) >= 1 || Math.abs(cosL) >= 1) return 0;
  const kR = Math.acos(cosR), kL = Math.acos(cosL);
  const n = V.length;
  // Start in the right lead with χ_n = 1, χ_{n+1} = e^{i kR} and recurse leftwards:
  //   χ_j = [2 + (V_{j+1} − E)/t2] χ_{j+1} − χ_{j+2}
  let ar = 1, ai = 0, br = Math.cos(kR), bi = Math.sin(kR); // (a, b) = (χ_{j+1}, χ_{j+2}) with j+1 = n
  for (let j = n - 1; j >= -1; j--) {
    const Vj1 = j + 1 >= n ? VR : V[j + 1];
    const f = 2 + (Vj1 - E) / t2;
    const cr = f * ar - br, ci = f * ai - bi;
    br = ar; bi = ai; ar = cr; ai = ci;
    if (!Number.isFinite(ar) || Math.abs(ar) > 1e150) return 0;
  }
  // now (a, b) = (χ_{-1}, χ_0), both in the left lead where χ_j = A e^{i kL j} + B e^{−i kL j}.
  // χ_{-1} = A e^{-i kL} + B e^{i kL}, χ_0 = A + B  →  A = (χ_0 e^{i kL} − χ_{-1}) / (e^{i kL} − e^{-i kL}) = (χ_0 e^{i kL} − χ_{-1}) / (2 i sin kL)
  const c = Math.cos(kL), sn = Math.sin(kL);
  const nr = br * c - bi * sn - ar, ni = br * sn + bi * c - ai;
  const A2 = (nr * nr + ni * ni) / (4 * sn * sn);
  const T = (Math.sin(kR) / Math.sin(kL)) / A2;
  return Math.min(1, Math.max(0, T));
}

// Tunnelling current at bias Vb (eV) for transmission T(E) sampled on a grid Es (trapezoid rule):
// I ∝ ∫ T(E) ln[(1 + e^{(EF−E)/kT}) / (1 + e^{(EF−E−Vb)/kT})] dE
export function current(Es, Ts, EF, kT, Vb) {
  const lg = (x) => (x > 40 ? x : Math.log1p(Math.exp(x)));
  let I = 0;
  for (let i = 0; i + 1 < Es.length; i++) {
    const f = (j) => Ts[j] * (lg((EF - Es[j]) / kT) - lg((EF - Es[j] - Vb) / kT));
    I += 0.5 * (f(i) + f(i + 1)) * (Es[i + 1] - Es[i]);
  }
  return I;
}
