// Independent random walkers on a 1D lattice with Metropolis dynamics in an
// external potential V (array over L sites). Each step every walker proposes a
// jump to a neighbour (±1 with probability 1/2) and accepts it with
// min(1, exp(−ΔV/kT)); the ends are reflecting (a jump outside is rejected).
// The stationary distribution is the Boltzmann state p_i ∝ exp(−V_i/kT).
// Pure module, injectable rng. Shared by experiments 7, 8 and 9.

export function createWalkers({ N = 200, V, kT = 1, rng = Math.random, x0 = null, L = V.length } = {}) {
  const x = new Int32Array(N);
  for (let i = 0; i < N; i++) x[i] = x0 == null ? Math.floor(rng() * L) : (typeof x0 === 'function' ? x0(i) : x0);
  return { N, L, V: Float64Array.from(V), kT, rng, x, t: 0, occ: new Float64Array(L), nAcc: 0 };
}

export function setPotential(s, V) { s.V = Float64Array.from(V); }

export function stepWalkers(s) {
  const { N, L, V, kT, rng, x } = s;
  for (let i = 0; i < N; i++) {
    const xi = x[i], xj = xi + (rng() < 0.5 ? -1 : 1);
    if (xj < 0 || xj >= L) continue;
    const dV = V[xj] - V[xi];
    if (dV <= 0 || (kT > 0 && rng() < Math.exp(-dV / kT))) x[i] = xj;
  }
  s.t++;
}

// Instantaneous occupation histogram.
export function occupancy(s) {
  const h = new Int32Array(s.L);
  for (let i = 0; i < s.N; i++) h[s.x[i]]++;
  return h;
}
// Accumulate the instantaneous histogram into s.occ (time average).
export function accumulate(s) { const h = occupancy(s); for (let i = 0; i < s.L; i++) s.occ[i] += h[i]; s.nAcc++; }
export function resetAccumulator(s) { s.occ.fill(0); s.nAcc = 0; }
// Normalised accumulated occupation (probability per site).
export function meanOccupation(s) {
  const p = new Float64Array(s.L);
  const tot = s.nAcc * s.N;
  if (tot) for (let i = 0; i < s.L; i++) p[i] = s.occ[i] / tot;
  return p;
}

// Boltzmann state on the lattice; kT = 0 gives a delta at the global minimum.
export function boltzmann(V, kT) {
  const L = V.length, p = new Float64Array(L);
  let vmin = Infinity; for (let i = 0; i < L; i++) vmin = Math.min(vmin, V[i]);
  if (kT <= 0) { let imin = 0; for (let i = 0; i < L; i++) if (V[i] < V[imin]) imin = i; p[imin] = 1; return p; }
  let Z = 0; for (let i = 0; i < L; i++) { p[i] = Math.exp(-(V[i] - vmin) / kT); Z += p[i]; }
  for (let i = 0; i < L; i++) p[i] /= Z;
  return p;
}
export function partitionFunction(V, kT) {
  let Z = 0; for (let i = 0; i < V.length; i++) Z += Math.exp(-V[i] / kT);
  return Z;
}

// χ²/dof between an accumulated occupation (probabilities, nSamples total) and a target pmf.
export function chi2Reduced(p, q, nSamples) {
  let s = 0, k = 0;
  for (let i = 0; i < p.length; i++) { const e = q[i] * nSamples; if (e >= 5) { const o = p[i] * nSamples; s += (o - e) ** 2 / e; k++; } }
  return k > 1 ? s / (k - 1) : NaN;
}

// ---- potentials on x ∈ [xmin, xmax] sampled at L sites ----
export function xgrid(L, xmin = -1, xmax = 1) { return Float64Array.from({ length: L }, (_, i) => xmin + (xmax - xmin) * i / (L - 1)); }
export function parabolic(L, Vmax = 4) { return Float64Array.from(xgrid(L), (x) => Vmax * x * x); }
export function sawSym(L, Vmax = 4) { return Float64Array.from(xgrid(L), (x) => Vmax * Math.abs(x)); }
// Asymmetric sawtooth with the minimum at x = −0.5: steep side (slope tan 60°·k) on the left, gentle on the right.
export function sawAsym(L, Vmax = 4) { return Float64Array.from(xgrid(L), (x) => (x < -0.5 ? Vmax * (-0.5 - x) / 0.5 : Vmax * (x + 0.5) / 1.5)); }
// Double well V = (x² − 1)² + A x on [xmin, xmax]; A > 0 makes the right well metastable.
export function doubleWell(L, A = 0, xmin = -2, xmax = 2) { return Float64Array.from(xgrid(L, xmin, xmax), (x) => (x * x - 1) ** 2 + A * x); }
export const POTENTIALS = { parabolic, sawSym, sawAsym };
