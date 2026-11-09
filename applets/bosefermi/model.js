// N bosons and N fermions on equally spaced levels ε_i = i (i = 0,1,2,…) at temperature kT.
// Exact occupations from the grand canonical ensemble with the fugacity z fixed by Σ⟨n_i⟩ = N,
// and a canonical Monte Carlo (one particle moves to another level, Metropolis) for both statistics.
export function meanOccupations(N, kT, stat, levels = 80) {
  // solve Σ_i 1/(z^{-1} e^{ε_i/kT} ∓ 1) = N for z by bisection on ln z
  const f = (lnz) => { let s = 0; for (let i = 0; i < levels; i++) { const x = Math.exp(i / kT - lnz); s += 1 / (stat === 'bose' ? x - 1 : x + 1); } return s; };
  let lo = -50, hi = stat === 'bose' ? -1e-9 : 50; // bosons: z < 1 (ε_0 = 0)
  for (let it = 0; it < 200; it++) { const mid = (lo + hi) / 2; if (f(mid) < N) lo = mid; else hi = mid; }
  const lnz = (lo + hi) / 2, n = new Float64Array(levels);
  for (let i = 0; i < levels; i++) { const x = Math.exp(i / kT - lnz); n[i] = 1 / (stat === 'bose' ? x - 1 : x + 1); }
  return { n, z: Math.exp(lnz), mu: kT * lnz };
}
export function fermiLevel(N) { return N - 1; } // ε of the highest filled level at T = 0 (levels 0..N−1)

export function createMC({ N = 10, kT = 1, stat = 'bose', levels = 80, rng = Math.random } = {}) {
  const occ = new Int32Array(levels);
  if (stat === 'fermi') for (let i = 0; i < N; i++) occ[i] = 1; else occ[0] = N;
  return { N, kT, stat, levels, rng, occ, hist: new Float64Array(levels), nAcc: 0, t: 0, accepted: 0, tried: 0 };
}
// One Monte Carlo sweep: N attempts; pick a particle (level weighted by occupation), propose a new level
// uniformly; accept with min(1, e^{−Δε/kT}) if allowed (Pauli for fermions). Bose enhancement is
// automatic in the canonical ensemble with distinguishable moves between indistinguishable configurations:
// the proposal picks a *particle*, and detailed balance over occupation-number states requires the
// standard correction factor (n_to + 1)/n_from for bosons, which we include.
export function sweep(s) {
  const { N, kT, stat, levels, rng, occ } = s;
  for (let k = 0; k < N; k++) {
    // choose a particle: level i with probability occ[i]/N
    let r = Math.floor(rng() * N), i = 0; while (r >= occ[i]) { r -= occ[i]; i++; }
    const j = Math.floor(rng() * levels);
    s.tried++;
    if (j === i) { s.accepted++; continue; }
    if (stat === 'fermi' && occ[j] > 0) continue;
    const dE = j - i;
    // Metropolis–Hastings over occupation-number states (each configuration {n_i} is one quantum state):
    // proposal P(i→j) = (occ_i/N)(1/L), reverse P(j→i) = ((occ_j+1)/N)(1/L), so
    // accept with min(1, e^{-dE/kT} · (occ_j+1)/occ_i) for bosons; for fermions the proposal is symmetric.
    let a = Math.exp(-dE / kT);
    if (stat === 'bose') a *= (occ[j] + 1) / occ[i]; // reverse proposal picks one of occ_j+1 particles
    if (a >= 1 || rng() < a) { occ[i]--; occ[j]++; s.accepted++; }
  }
  s.t++;
  for (let i = 0; i < levels; i++) s.hist[i] += occ[i];
  s.nAcc++;
}
export function meanHist(s) { const h = new Float64Array(s.levels); if (s.nAcc) for (let i = 0; i < s.levels; i++) h[i] = s.hist[i] / s.nAcc; return h; }
export function resetHist(s) { s.hist.fill(0); s.nAcc = 0; }
export function energy(s) { let e = 0; for (let i = 0; i < s.levels; i++) e += i * s.occ[i]; return e; }
export function groundFraction(h, N) { return h[0] / N; }

// Exact *canonical* occupations for N particles on levels ε_i = i by dynamic programming over levels
// (numerically stable, unlike the alternating Borrmann–Franke recursion for fermions at low T):
//   fermions: Z^{(m)}_n = Z^{(m-1)}_n + w_m Z^{(m-1)}_{n-1};  bosons: Z^{(m)}_n = Σ_{k≥0} w_m^k Z^{(m-1)}_{n-k},
// with w_m = e^{-βε_m}; ⟨n_i⟩ = Σ_{k≥1} k w_i^k Z^{(¬i)}_{N-k} / Z_N, where Z^{(¬i)} excludes level i.
export function canonicalOccupations(N, kT, stat, levels = 80) {
  const w = Float64Array.from({ length: levels }, (_, i) => Math.exp(-i / kT));
  const build = (skip) => {
    let Z = new Float64Array(N + 1); Z[0] = 1;
    for (let m = 0; m < levels; m++) {
      if (m === skip) continue;
      const Zn = new Float64Array(N + 1);
      for (let n = 0; n <= N; n++) {
        if (stat === 'fermi') Zn[n] = Z[n] + (n > 0 ? w[m] * Z[n - 1] : 0);
        else { let acc = 0, wk = 1; for (let k = 0; k <= n; k++) { acc += wk * Z[n - k]; wk *= w[m]; } Zn[n] = acc; }
      }
      Z = Zn;
    }
    return Z;
  };
  const ZN = build(-1)[N];
  const occ = new Float64Array(levels);
  for (let i = 0; i < levels; i++) {
    const Zx = build(i); let s = 0, wk = 1;
    const kmax = stat === 'fermi' ? 1 : N;
    for (let k = 1; k <= kmax; k++) { wk *= w[i]; s += k * wk * Zx[N - k]; }
    occ[i] = s / ZN;
  }
  return occ;
}
