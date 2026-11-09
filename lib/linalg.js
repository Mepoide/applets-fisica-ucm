// Small dense linear algebra helpers.
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

// Eigenvalues of a real symmetric tridiagonal matrix (diagonal d, off-diagonal e) by bisection on the
// Sturm count; returns all n eigenvalues sorted ascending. Robust and fast for n ≤ a few hundred.
export function tridiagEigenvalues(d, e) {
  const n = d.length;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) { const r = (i > 0 ? Math.abs(e[i - 1]) : 0) + (i < n - 1 ? Math.abs(e[i]) : 0); lo = Math.min(lo, d[i] - r); hi = Math.max(hi, d[i] + r); }
  const count = (x) => { let c = 0, q = 1; for (let i = 0; i < n; i++) { q = d[i] - x - (i > 0 ? e[i - 1] * e[i - 1] / (q === 0 ? 1e-300 : q) : 0); if (q < 0) c++; } return c; };
  const out = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let a = lo, b = hi;
    for (let it = 0; it < 100 && b - a > 1e-12 * Math.max(1, Math.abs(a) + Math.abs(b)); it++) { const m = 0.5 * (a + b); if (count(m) > k) b = m; else a = m; }
    out[k] = 0.5 * (a + b);
  }
  return out;
}

// Eigen-decomposition of a dense symmetric matrix (cyclic Jacobi): returns { values, vectors } with
// vectors[k*n + i] = component i of eigenvector k, sorted by ascending eigenvalue.
export function symmetricEigen(M, n, tol = 1e-20) {
  const A = Float64Array.from(M), V = new Float64Array(n * n); for (let i = 0; i < n; i++) V[i * n + i] = 1;
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
      for (let k = 0; k < n; k++) { const vkp = V[k * n + p], vkq = V[k * n + q]; V[k * n + p] = c * vkp - s * vkq; V[k * n + q] = s * vkp + c * vkq; }
    }
  }
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => A[a * n + a] - A[b * n + b]);
  const values = new Float64Array(n), vectors = new Float64Array(n * n);
  idx.forEach((j, k) => { values[k] = A[j * n + j]; for (let i = 0; i < n; i++) vectors[k * n + i] = V[i * n + j]; });
  return { values, vectors };
}

// Eigenvector of a symmetric tridiagonal matrix for a known eigenvalue λ by inverse iteration
// (two Thomas-algorithm solves with the shifted matrix). Returned normalised to Σ v² = 1.
export function tridiagEigenvector(d, e, lambda) {
  const n = d.length, shift = lambda + 1e-10 * Math.max(1, Math.abs(lambda));
  let v = new Float64Array(n); for (let i = 0; i < n; i++) v[i] = 1 + 0.3 * Math.sin(7.1 * i + 0.5);
  const c = new Float64Array(n), w = new Float64Array(n);
  for (let it = 0; it < 3; it++) {
    // solve (A − shift) w = v
    let b0 = d[0] - shift; if (Math.abs(b0) < 1e-300) b0 = 1e-300;
    c[0] = (n > 1 ? e[0] : 0) / b0; w[0] = v[0] / b0;
    for (let i = 1; i < n; i++) {
      let den = d[i] - shift - e[i - 1] * c[i - 1]; if (Math.abs(den) < 1e-300) den = 1e-300;
      c[i] = (i < n - 1 ? e[i] : 0) / den; w[i] = (v[i] - e[i - 1] * w[i - 1]) / den;
    }
    for (let i = n - 2; i >= 0; i--) w[i] -= c[i] * w[i + 1];
    let norm = 0; for (let i = 0; i < n; i++) norm += w[i] * w[i]; norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < n; i++) v[i] = w[i] / norm;
  }
  let imax = 0; for (let i = 1; i < n; i++) if (Math.abs(v[i]) > Math.abs(v[imax])) imax = i;
  if (v[imax] < 0) for (let i = 0; i < n; i++) v[i] = -v[i];
  return v;
}
