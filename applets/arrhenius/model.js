// Activation processes: Metropolis walkers in a tilted double well
// V(x) = (x² − 1)² + A x, all starting in the metastable (right, A > 0) well.
// Escape rate from the discrete Boltzmann estimate of the course (eq. 2) and
// from the continuous Arrhenius–Kramers formula (eq. 4–6).
import * as W from '../_walkers/metropolis.js';

export const L = 161, XMIN = -2, XMAX = 2;
export const DX = (XMAX - XMIN) / (L - 1);

export function potential(A, n = L) { return W.doubleWell(n, A, XMIN, XMAX); }
export function dxFor(n = L) { return (XMAX - XMIN) / (n - 1); }
export function xOf(i, n = L) { return XMIN + i * dxFor(n); }

// Indices of the barrier top and of the two minima.
export function landmarks(V) {
  const n = V.length, c = Math.floor(n / 2), w = Math.max(2, Math.floor(n / 8));
  let iMax = c; for (let i = c - w; i <= c + w; i++) if (V[i] > V[iMax]) iMax = i;
  let iL = 0; for (let i = 0; i < iMax; i++) if (V[i] < V[iL]) iL = i;
  let iR = iMax; for (let i = iMax; i < n; i++) if (V[i] < V[iR]) iR = i;
  return { iMax, iL, iR };
}

export function create({ N = 500, kT = 0.15, A = 0.5, rng = Math.random } = {}) {
  const V = potential(A);
  const lm = landmarks(V);
  const meta = A >= 0 ? lm.iR : lm.iL; // metastable well: the higher one
  const s = W.createWalkers({ N, V, kT, rng, x0: meta });
  Object.assign(s, { A, lm, metaSide: A >= 0 ? 'right' : 'left', history: [[0, N]] });
  return s;
}
export function nMeta(s) {
  let n = 0;
  if (s.metaSide === 'right') { for (let i = 0; i < s.N; i++) if (s.x[i] > s.lm.iMax) n++; }
  else { for (let i = 0; i < s.N; i++) if (s.x[i] < s.lm.iMax) n++; }
  return n;
}
export function step(s) { W.stepWalkers(s); s.history.push([s.t, nMeta(s)]); if (s.history.length > 50000) s.history.splice(0, 25000); }

// Course eq. (2): k = e^{−V(x_max)/kT} / (2Δt Σ_{x in well} e^{−V(x)/kT}), Δt = 1 step. It counts every
// walker that reaches the barrier top and steps outward as escaped; on a fine lattice most of them
// diffuse back, so this overestimates the rate (see rateKramers).
export function rateCourse(V, kT, lm, side = 'right', dt = 1) {
  let Z = 0;
  if (side === 'right') for (let i = lm.iMax; i < V.length; i++) Z += Math.exp(-(V[i] - V[lm.iMax]) / kT);
  else for (let i = 0; i <= lm.iMax; i++) Z += Math.exp(-(V[i] - V[lm.iMax]) / kT);
  return 1 / (2 * dt * Z);
}
export const rateDiscrete = rateCourse;
// Flux-over-population (mean first-passage) rate for diffusion on the lattice, exact for 1D Smoluchowski
// dynamics: k = D / [ Σ_{well} e^{−V_i/kT} Δx · Σ_{barrier} e^{+V_j/kT} Δx ], with D = Δx²/2 (free Metropolis walker).
// Sums run over the metastable well (minimum to barrier) and over the barrier region between the two minima.
export function rateKramers(V, kT, lm, side = 'right', dx = DX) {
  const D = dx * dx / 2;
  const iM = side === 'right' ? lm.iR : lm.iL, iO = side === 'right' ? lm.iL : lm.iR;
  const Vmax = V[lm.iMax];
  let well = 0; const [a, b] = iM < lm.iMax ? [0, lm.iMax] : [lm.iMax, V.length - 1];
  for (let i = a; i <= b; i++) well += Math.exp(-(V[i] - Vmax) / kT) * dx;
  let bar = 0; const [c, d] = iM < iO ? [iM, iO] : [iO, iM];
  for (let j = c; j <= d; j++) bar += Math.exp((V[j] - Vmax) / kT) * dx;
  const d2 = (i) => (V[i + 1] - 2 * V[i] + V[i - 1]) / (dx * dx);
  const wMeta = Math.sqrt(Math.max(1e-12, d2(iM))), wMax = Math.sqrt(Math.max(1e-12, -d2(lm.iMax)));
  const dE = Vmax - V[iM];
  // Harmonic (Arrhenius) approximation of the same integrals: k_A = (ω_meta ω_max / 2π γ) e^{−ΔE/kT}, γ = kT/D.
  const kArr = (wMeta * wMax / (2 * Math.PI * (kT / D))) * Math.exp(-dE / kT);
  return { k: D / (well * bar), kArr, dE, wMeta, wMax, D };
}
// Least-squares fit of ln N_meta(t) = ln N0 − k t over the samples with N > 0 and N > N0 e^{-3}.
export function fitRate(history) {
  const N0 = history[0]?.[1] ?? 0;
  let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const [t, Nm] of history) {
    if (Nm <= 0 || Nm < N0 * Math.exp(-3)) continue;
    const y = Math.log(Nm); n++; sx += t; sy += y; sxx += t * t; sxy += t * y;
  }
  if (n < 3) return NaN;
  const d = n * sxx - sx * sx;
  return d > 0 ? -(n * sxy - sx * sy) / d : NaN;
}
