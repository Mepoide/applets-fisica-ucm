// Harmonic chains and 1D lattices: node counting (integrated density of modes),
// transfer-matrix transmission through a segment embedded in perfect leads,
// mass sequences (random binary, Fibonacci). Units: spring constant k = 1, light mass m = 1,
// frequency in units of sqrt(k/m); the monatomic band is ω ∈ [0, 2].

export function randomMasses(N, alpha, c, rng = Math.random) {
  const m = new Float64Array(N); for (let i = 0; i < N; i++) m[i] = rng() < c ? alpha : 1; return m;
}
// Fibonacci chain by the cut-and-project formula m_n = alpha if [ (n+1)/τ ] − [ n/τ ] = 1 (τ golden ratio), else 1.
export function fibonacciMasses(N, alpha) {
  const tau = (1 + Math.sqrt(5)) / 2, m = new Float64Array(N);
  for (let n = 0; n < N; n++) m[n] = Math.floor((n + 2) / tau) - Math.floor((n + 1) / tau) === 1 ? 1 : alpha; // B (the rarer letter, fraction 1/τ²) carries the heavy mass
  return m;
}
export function fibonacciNumber(n) { let a = 1, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; }

// Equation of motion  m_n ω² U_n = 2U_n − U_{n−1} − U_{n+1}  →  U_{n+1} = (2 − m_n ω²) U_n − U_{n−1}.
// Number of sign changes of U along the chain with U_0 = 0, U_1 = 1 equals the number of modes with
// frequency below ω (Sturm sequence / node counting). Returns the integrated density of modes per atom.
export function integratedDOS(masses, omegas) {
  const N = masses.length, out = new Float64Array(omegas.length);
  for (let j = 0; j < omegas.length; j++) {
    const w2 = omegas[j] * omegas[j];
    let R = Infinity, nodes = 0; // R_n = U_{n+1}/U_n ; with U_0 = 0, R_0 = ∞ → R_1 = 2 − m_1 ω²
    for (let n = 0; n < N; n++) {
      R = Number.isFinite(R) ? 2 - masses[n] * w2 - 1 / R : 2 - masses[n] * w2;
      if (R < 0) nodes++;
      if (R === 0) R = 1e-300;
    }
    out[j] = nodes / N;
  }
  return out;
}
// Monatomic infinite chain: N(ω)/N = (2/π) arcsin(ω/2).
export function monatomicIDOS(omega) { return omega >= 2 ? 1 : omega <= 0 ? 0 : (2 / Math.PI) * Math.asin(omega / 2); }

// Transmission of a vibration of frequency ω through the segment `masses` embedded between
// semi-infinite perfect chains of mass 1: leads carry U_n = e^{iqn} + r e^{−iqn} (left), t e^{iqn} (right),
// with cos q = 1 − ω²/2. Returns |t|² (1 for a perfect segment inside the band).
export function transmission(masses, omega) {
  const w2 = omega * omega, cq = 1 - w2 / 2;
  if (cq <= -1 || cq >= 1) return 0;
  const q = Math.acos(cq);
  // real transfer matrix of the segment: (U_{N+1}, U_N)^T = M (U_1, U_0)^T
  let a = 1, b = 0, c = 0, d = 1;
  for (let n = 0; n < masses.length; n++) {
    const p = 2 - masses[n] * w2; // P = [[p, -1], [1, 0]]
    const na = p * a - c, nb = p * b - d, nc = a, nd = b;
    a = na; b = nb; c = nc; d = nd;
    if (Math.abs(a) > 1e150 || Math.abs(c) > 1e150) return 0; // deep in a localised regime: |t|² < 1e-300
  }
  const N = masses.length;
  // Unknowns r, t (complex). U_0 = 1 + r, U_1 = e^{iq} + r e^{-iq}; U_N = t e^{iqN}, U_{N+1} = t e^{iq(N+1)}.
  // Equations: a U_1 + b U_0 = U_{N+1}, c U_1 + d U_0 = U_N.
  const eiq = [Math.cos(q), Math.sin(q)], emq = [Math.cos(q), -Math.sin(q)];
  const eN = [Math.cos(q * N), Math.sin(q * N)], eN1 = [Math.cos(q * (N + 1)), Math.sin(q * (N + 1))];
  // Write as A·[r, t] = rhs with complex coefficients:
  //  (a e^{-iq} + b) r − e^{iq(N+1)} t = −(a e^{iq} + b)
  //  (c e^{-iq} + d) r − e^{iqN} t     = −(c e^{iq} + d)
  const cx = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
  const add = (x, y) => [x[0] + y[0], x[1] + y[1]], sc = (s, x) => [s * x[0], s * x[1]], neg = (x) => [-x[0], -x[1]];
  const A11 = add(sc(a, emq), [b, 0]), A12 = neg(eN1), r1 = neg(add(sc(a, eiq), [b, 0]));
  const A21 = add(sc(c, emq), [d, 0]), A22 = neg(eN), r2 = neg(add(sc(c, eiq), [d, 0]));
  const det = add(cx(A11, A22), neg(cx(A12, A21)));
  const dn = det[0] * det[0] + det[1] * det[1]; if (dn === 0) return 0;
  const tnum = add(cx(A11, r2), neg(cx(A21, r1)));
  const t = [(tnum[0] * det[0] + tnum[1] * det[1]) / dn, (tnum[1] * det[0] - tnum[0] * det[1]) / dn];
  const T = t[0] * t[0] + t[1] * t[1];
  return Number.isFinite(T) ? Math.min(1, T) : 0;
}

// Thermal conductivity of the chain relative to the perfect chain, at reduced temperature θ = T/Θ_D
// (ħω_max = k_B Θ_D with ω_max = 2): κ(θ) ∝ ∫₀² T(ω) ω² (∂n_B/∂T) dω ∝ ∫₀² T(ω) x² eˣ/(eˣ−1)² dω, x = ω/(2θ).
export function conductivity(trans, omegas, theta) {
  let num = 0, den = 0;
  for (let j = 1; j < omegas.length; j++) {
    const w = 0.5 * (omegas[j] + omegas[j - 1]), dw = omegas[j] - omegas[j - 1];
    const x = w / (2 * theta), f = x > 300 ? 0 : x * x * Math.exp(x) / (Math.exp(x) - 1) ** 2;
    const T = 0.5 * (trans[j] + trans[j - 1]);
    num += T * f * dw; den += f * dw;
  }
  return den ? num / den : 0;
}
