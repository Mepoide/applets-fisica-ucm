// Frenkel excitons in a molecular aggregate of N two-level molecules with site energies ε_n and
// nearest-neighbour transfer −J. Eigenstates |j⟩ = Σ a_jn |n⟩ have oscillator strengths
// d_j² = (Σ_n a_jn)² d0² (all molecular dipoles parallel). Absorption spectrum
// A(E) = Σ_j d_j² L_Γ(E − E_j) with a Lorentzian of half-width Γ. Periodic chain: E_k = ε − 2J cos k,
// only k = 0 absorbs (d² = N d0²). Diagonal disorder (ε_n = ε + W u_n, u uniform in [−½, ½]) spreads the
// oscillator strength over the lower band edge. Energies in units of J.
import { symmetricEigen } from '../../lib/linalg.js';

export function hamiltonian(N, eps, W, periodic, rng = Math.random) {
  const H = new Float64Array(N * N);
  for (let n = 0; n < N; n++) H[n * N + n] = eps + W * (rng() - 0.5);
  for (let n = 0; n + 1 < N; n++) { H[n * N + n + 1] = -1; H[(n + 1) * N + n] = -1; }
  if (periodic && N > 2) { H[N - 1] = -1; H[(N - 1) * N] = -1; }
  return H;
}
export function excitons(N, { eps = 0, W = 0, periodic = true, rng = Math.random } = {}) {
  const H = hamiltonian(N, eps, W, periodic, rng);
  const { values, vectors } = symmetricEigen(H, N);
  const strength = new Float64Array(N);
  for (let j = 0; j < N; j++) { let s = 0; for (let n = 0; n < N; n++) s += vectors[j * N + n]; strength[j] = s * s; }
  return { E: values, f: strength, vectors, N };
}
export function spectrum(ex, Es, gamma) {
  const A = new Float64Array(Es.length);
  for (let i = 0; i < Es.length; i++) { let a = 0; for (let j = 0; j < ex.N; j++) a += ex.f[j] * (gamma / Math.PI) / ((Es[i] - ex.E[j]) ** 2 + gamma * gamma); A[i] = a; }
  return A;
}
// Exact periodic band: E_k = ε − 2 cos(2πk/N).
export function periodicEnergies(N, eps = 0) { return Array.from({ length: N }, (_, k) => eps - 2 * Math.cos(2 * Math.PI * k / N)).sort((a, b) => a - b); }
// Sum rule: Σ_j f_j = N (each molecule contributes d0² = 1).
export function totalStrength(ex) { let s = 0; for (const v of ex.f) s += v; return s; }
// Participation ratio of the brightest state (1 = localised on one molecule, N = fully delocalised).
export function brightState(ex) { let j = 0; for (let k = 1; k < ex.N; k++) if (ex.f[k] > ex.f[j]) j = k; let s4 = 0; for (let n = 0; n < ex.N; n++) s4 += ex.vectors[j * ex.N + n] ** 4; return { j, E: ex.E[j], f: ex.f[j], participation: 1 / s4 }; }
