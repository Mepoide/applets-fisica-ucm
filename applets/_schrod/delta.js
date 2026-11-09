// One-dimensional Schrödinger equation with δ-function potentials, in units ħ²/2m = 1:
//   −ψ'' + Σ_n λ_n δ(x − x_n) ψ = E ψ,   E = q² > 0 in the free regions.
// Transfer-matrix transmission through a finite chain between free leads, Kronig–Penney bands
// of the infinite periodic chain, and node-counting / shooting helpers for bound states.

// Complex helpers (arrays [re, im]).
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cexp = (th) => [Math.cos(th), Math.sin(th)];

// Transmission |t|² of an electron of energy E = q² through δ potentials of strengths lam[n]
// at positions x[n] (sorted). Plane-wave amplitudes propagate with 2×2 complex matrices.
export function transmission(lam, x, E) {
  if (E <= 0) return 0;
  const q = Math.sqrt(E);
  // state (a, b): ψ = a e^{iqx} + b e^{−iqx}. Across δ at x_n: ψ continuous, ψ'(x+) − ψ'(x−) = λ ψ(x).
  //  a' = a + (λ/2iq) ψ e^{−iqx_n} ,  b' = b − (λ/2iq) ψ e^{+iqx_n}, with ψ = a e^{iqx} + b e^{−iqx}.
  let a = [1, 0], b = [0, 0];
  // Propagate from the right to the left so that the final state corresponds to pure outgoing wave on the right:
  // easier: start on the right with (t, 0) = (1, 0) and go leftwards; then incoming amplitude is a_left, T = 1/|a_left|².
  for (let n = lam.length - 1; n >= 0; n--) {
    const xn = x[n], L = lam[n];
    const psi = cadd(cmul(a, cexp(q * xn)), cmul(b, cexp(-q * xn)));
    const f = [0, -L / (2 * q)]; // λ/(2iq) = −iλ/(2q)
    // going leftwards: a_left = a − f ψ e^{−iqx}, b_left = b + f ψ e^{iqx}
    const da = cmul(f, cmul(psi, cexp(-q * xn))), db = cmul(f, cmul(psi, cexp(q * xn)));
    a = [a[0] - da[0], a[1] - da[1]]; b = [b[0] + db[0], b[1] + db[1]];
    if (!Number.isFinite(a[0]) || Math.abs(a[0]) > 1e150) return 0;
  }
  const A2 = a[0] * a[0] + a[1] * a[1];
  return A2 > 0 ? Math.min(1, 1 / A2) : 0;
}

// Kronig–Penney: cos(kL) = cos(qL) + (λ/2q) sin(qL). Returns the right-hand side; |rhs| ≤ 1 inside a band.
export function kpFunction(E, lam, L) {
  if (E > 0) { const q = Math.sqrt(E); return Math.cos(q * L) + lam / (2 * q) * Math.sin(q * L); }
  if (E === 0) return 1 + lam * L / 2;
  const k = Math.sqrt(-E); return Math.cosh(k * L) + lam / (2 * k) * Math.sinh(k * L);
}
export function inBand(E, lam, L) { return Math.abs(kpFunction(E, lam, L)) <= 1; }
// Band edges in [Emin, Emax] by scanning sign changes of |f| − 1.
export function bandEdges(lam, L, Emin, Emax, n = 4000) {
  const edges = []; let prev = Math.abs(kpFunction(Emin, lam, L)) - 1;
  for (let i = 1; i <= n; i++) {
    const E = Emin + (Emax - Emin) * i / n, g = Math.abs(kpFunction(E, lam, L)) - 1;
    if (prev * g < 0) { let a = Emin + (Emax - Emin) * (i - 1) / n, b = E; for (let it = 0; it < 50; it++) { const m = 0.5 * (a + b); if ((Math.abs(kpFunction(a, lam, L)) - 1) * (Math.abs(kpFunction(m, lam, L)) - 1) <= 0) b = m; else a = m; } edges.push(0.5 * (a + b)); }
    prev = g;
  }
  return edges;
}
// Bloch wavenumber k(E) in units of π/L inside a band (NaN in gaps).
export function blochK(E, lam, L) { const f = kpFunction(E, lam, L); return Math.abs(f) <= 1 ? Math.acos(f) / Math.PI : NaN; }

// Shooting through a finite δ chain (positions x ascending) from the left with (ψ, ψ') given,
// up to x = xEnd; returns [ψ, ψ'] at xEnd and the number of nodes. Works for E of any sign.
export function shoot(lam, x, E, psi0, dpsi0, xStart, xEnd) {
  let psi = psi0, dpsi = dpsi0, pos = xStart, nodes = 0;
  const step = (dx) => {
    if (dx <= 0) return;
    if (E > 0) { const q = Math.sqrt(E), c = Math.cos(q * dx), s = Math.sin(q * dx); const p2 = psi * c + dpsi / q * s; const d2 = -psi * q * s + dpsi * c; if (psi * p2 < 0) nodes++; psi = p2; dpsi = d2; }
    else { const k = Math.sqrt(-E), c = Math.cosh(k * dx), s = Math.sinh(k * dx); const p2 = psi * c + dpsi / k * s; const d2 = psi * k * s + dpsi * c; if (psi * p2 < 0) nodes++; psi = p2; dpsi = d2; }
    // rescale to avoid overflow (only the ratio matters for matching)
    const m = Math.max(Math.abs(psi), Math.abs(dpsi)); if (m > 1e100) { psi /= m; dpsi /= m; }
  };
  for (let n = 0; n < lam.length; n++) { if (x[n] < xStart) continue; if (x[n] > xEnd) break; step(x[n] - pos); pos = x[n]; dpsi += lam[n] * psi; }
  step(xEnd - pos);
  return { psi, dpsi, nodes };
}
