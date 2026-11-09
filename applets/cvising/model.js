// Exact specific heat of the Ising model (J = 1, k_B = 1, zero field) on an
// Nx × Ny periodic lattice by transfer matrix: Z = Tr T^Ny, with T applied to
// vectors in O(Nx·2^Nx) (horizontal bonds diagonal, vertical bonds as a product
// of single-spin 2×2 operators). c = β² ∂²ln Z/∂β² / N by finite differences on
// a temperature grid. Also the exact 1D chain and Onsager's 2D results.

export const TC2D = 2 / Math.log(1 + Math.SQRT2); // 2.269185...

// Symmetric transfer matrix of the Nx×Ny torus, T_sym = H^{1/2} V H^{1/2}, with H the diagonal
// in-row Boltzmann weights and V[s,s'] = exp(K (Nx − 2·popcount(s xor s'))) the inter-row coupling.
export function transferMatrix(Nx, beta) {
  const dim = 1 << Nx, hw = new Float64Array(dim);
  for (let s = 0; s < dim; s++) {
    let e = 0;
    if (Nx > 1) for (let i = 0; i < Nx; i++) { const a = (s >> i) & 1, b = (s >> ((i + 1) % Nx)) & 1; e += a === b ? 1 : -1; }
    hw[s] = Math.exp(beta * e / 2); // square root of the row weight
  }
  const pop = new Int32Array(dim); for (let s = 1; s < dim; s++) pop[s] = pop[s >> 1] + (s & 1);
  const M = new Float64Array(dim * dim);
  for (let s = 0; s < dim; s++) for (let t = 0; t < dim; t++) M[s * dim + t] = hw[s] * Math.exp(beta * (Nx - 2 * pop[s ^ t])) * hw[t];
  return { M, dim };
}
// Eigenvalues of a dense symmetric matrix by cyclic Jacobi rotations.
export function symmetricEigenvalues(M, n, tol = 1e-12) {
  const A = Float64Array.from(M);
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i * n + j] ** 2;
    if (off < tol) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      const apq = A[p * n + q]; if (Math.abs(apq) < 1e-300) continue;
      const theta = (A[q * n + q] - A[p * n + p]) / (2 * apq);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = A[k * n + p], akq = A[k * n + q]; A[k * n + p] = c * akp - s * akq; A[k * n + q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = A[p * n + k], aqk = A[q * n + k]; A[p * n + k] = c * apk - s * aqk; A[q * n + k] = s * apk + c * aqk; }
    }
  }
  const ev = new Float64Array(n); for (let i = 0; i < n; i++) ev[i] = A[i * n + i];
  return ev;
}
// ln Z = ln Σ_i λ_i^Ny (Nx ≤ 8 is practical; Nx ≤ 6 is instantaneous).
export function lnZ(Nx, Ny, beta) {
  const { M, dim } = transferMatrix(Nx, beta);
  const ev = symmetricEigenvalues(M, dim);
  let m = 0; for (const l of ev) m = Math.max(m, Math.abs(l));
  let sum = 0; for (const l of ev) sum += Math.sign(l) ** Ny * Math.pow(Math.abs(l) / m, Ny);
  return Ny * Math.log(m) + Math.log(sum);
}
// Specific heat per spin c = β² ∂²ln Z/∂β² / N by a 3-point stencil in β at every temperature.
export function specificHeatCurve(Nx, Ny, Ts, rel = 2e-3) {
  const N = Nx * Ny, n = Ts.length, c = new Float64Array(n), U = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const b = 1 / Ts[i], d = rel * b;
    const f0 = lnZ(Nx, Ny, b), fp = lnZ(Nx, Ny, b + d), fm = lnZ(Nx, Ny, b - d);
    U[i] = -(fp - fm) / (2 * d) / N;
    c[i] = b * b * (fp - 2 * f0 + fm) / (d * d) / N;
  }
  return { T: Ts, c, U };
}
export function peak(curve) { let i = 0; for (let k = 1; k < curve.c.length; k++) if (curve.c[k] > curve.c[i]) i = k; return { T: curve.T[i], c: curve.c[i] }; }

// Exact infinite 1D chain: c = (β J)² / cosh²(β J).
export function c1D(T) { const K = 1 / T; return K * K / Math.cosh(K) ** 2; }

// Complete elliptic integrals by the arithmetic–geometric mean (parameter k = modulus).
export function ellipticKE(k) {
  let a = 1, b = Math.sqrt(1 - k * k), c = k, sum = 0, pow = 0.5;
  for (let i = 0; i < 40 && Math.abs(c) > 1e-16; i++) {
    sum += pow * c * c; pow *= 2;
    const an = (a + b) / 2, bn = Math.sqrt(a * b); c = (a - b) / 2; a = an; b = bn;
  }
  const K = Math.PI / (2 * a);
  return { K, E: K * (1 - sum / 2 * 2) };
}
// Onsager's specific heat for the infinite square lattice (J = 1).
export function c2D(T) {
  const K = 1 / T, s2 = Math.sinh(2 * K), c2 = Math.cosh(2 * K);
  const kappa = 2 * s2 / (c2 * c2), kp = 2 * Math.tanh(2 * K) ** 2 - 1;
  const { K: K1, E: E1 } = ellipticKE(Math.min(kappa, 1 - 1e-15));
  const coth = c2 / s2;
  return (2 / Math.PI) * (K * coth) ** 2 * (2 * K1 - 2 * E1 - (1 - kp) * (Math.PI / 2 + kp * K1));
}
