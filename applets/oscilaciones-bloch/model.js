// Tight-binding electron on a 1D lattice under a uniform electric field (ħ = 1, lattice spacing 1):
//   i dψ_n/dt = (ε_n + F n) ψ_n − T (ψ_{n+1} + ψ_{n−1}),  ψ_n(0) = δ_{n,n0}.
// Exact evolution by diagonalising the (tridiagonal, symmetric) Hamiltonian:
// ψ(t) = Σ_j c_j e^{−iE_j t} v_j. Without field the packet spreads ballistically, σ(t) = √2 T t;
// with field the spectrum is the Wannier–Stark ladder E_j = F j and the packet oscillates with the
// Bloch period T_B = 2π/F and amplitude 4T/F (dynamic localisation).
import { symmetricEigen } from '../../lib/linalg.js';

export function create({ N = 121, T = 1, F = 0.1, W = 0, rng = Math.random } = {}) {
  const H = new Float64Array(N * N), n0 = Math.floor(N / 2);
  for (let n = 0; n < N; n++) H[n * N + n] = F * (n - n0) + W * (rng() - 0.5);
  for (let n = 0; n + 1 < N; n++) { H[n * N + n + 1] = -T; H[(n + 1) * N + n] = -T; }
  const { values, vectors } = symmetricEigen(H, N);
  const c = new Float64Array(N); for (let j = 0; j < N; j++) c[j] = vectors[j * N + n0]; // ⟨j|n0⟩
  return { N, T, F, n0, E: values, V: vectors, c, t: 0, prob: null, history: [] };
}
// |ψ_n(t)|² on the lattice.
export function probability(s, t) {
  const { N, E, V, c } = s, re = new Float64Array(N), im = new Float64Array(N);
  for (let j = 0; j < N; j++) { const ph = -E[j] * t, cr = c[j] * Math.cos(ph), ci = c[j] * Math.sin(ph); for (let n = 0; n < N; n++) { re[n] += cr * V[j * N + n]; im[n] += ci * V[j * N + n]; } }
  const p = new Float64Array(N); for (let n = 0; n < N; n++) p[n] = re[n] * re[n] + im[n] * im[n];
  return p;
}
export function moments(p, n0) { let m = 0, m2 = 0; for (let n = 0; n < p.length; n++) { m += p[n] * (n - n0); m2 += p[n] * (n - n0) ** 2; } return { centroid: m, rms: Math.sqrt(Math.max(0, m2 - m * m)), radius: Math.sqrt(m2) }; }
export function advance(s, dt) { s.t += dt; s.prob = probability(s, s.t); const mo = moments(s.prob, s.n0); s.history.push([s.t, mo.centroid, mo.radius]); if (s.history.length > 4000) s.history.splice(0, 2000); return mo; }
export const freeRadius = (T, t) => Math.SQRT2 * T * t;
export const blochPeriod = (F) => (F > 0 ? 2 * Math.PI / F : Infinity);
export const blochAmplitude = (T, F) => (F > 0 ? 4 * T / F : Infinity);
