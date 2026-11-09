// Gaussian superlattice in the tight-binding approximation: a chain whose odd sites (barriers) have
// energies E_n = E0 exp(−p²/2S²) (p = barrier index from the central one) and even sites (wells) 0,
// connected to semi-infinite leads with ε = 0 and T = 1 (E = −2 cos k). Transmission by the transfer matrix.
export function siteEnergies(Nb, E0, S) {
  const n = 2 * Nb + 1, eps = new Float64Array(n);
  const centre = Nb % 2 === 1 ? Nb : Nb - 1; // odd index closest to the middle of the chain
  for (let i = 1; i < n; i += 2) { const p = (i - centre) / 2; eps[i] = E0 * Math.exp(-(p * p) / (2 * S * S)); }
  return eps;
}
// Recurse leftwards from a pure outgoing wave on the right: C_{j−1} = (ε_j − E) C_j − C_{j+1}.
export function transmission(eps, E) {
  if (Math.abs(E) >= 2) return 0;
  const k = Math.acos(-E / 2), n = eps.length;
  let ar = Math.cos(k), ai = Math.sin(k), br = 1, bi = 0; // (a, b) = (C_{j+1}, C_j) with j = n−1 → C_n = e^{ik}, C_{n−1} = 1
  for (let j = n - 1; j >= 0; j--) {
    const f = eps[j] - E; const cr = f * br - ar, ci = f * bi - ai; // C_{j−1}
    ar = br; ai = bi; br = cr; bi = ci;
    if (Math.abs(br) > 1e150) return 0;
  }
  // (a, b) = (C_0, C_{−1}); C_j = A e^{ikj} + B e^{−ikj} for j ≤ 0 ⇒ A = (C_0 e^{ik} − C_{−1}) / (2 i sin k)
  const c = Math.cos(k), s = Math.sin(k);
  const nr = ar * c - ai * s - br, ni = ar * s + ai * c - bi;
  const A2 = (nr * nr + ni * ni) / (4 * s * s);
  return Math.min(1, 1 / A2);
}
export function spectrum(eps, Es) { return Es.map((E) => transmission(eps, E)); }
export function uniform(Nb, E0) { return siteEnergies(Nb, E0, 1e9); }
// Barrier profile (for drawing): energies of the odd sites.
export function barriers(eps) { const out = []; for (let i = 1; i < eps.length; i += 2) out.push(eps[i]); return out; }
