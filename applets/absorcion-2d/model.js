// Optical absorption of a 2D system (quantum well): excitonic Lorentzians + Sommerfeld-enhanced continuum.
//   α(ε) ∝ Σ_n 4/(n−½)³ · γ / {[ε + (n−½)⁻²]² + γ²}  +  ∫₀^∞ S2D(ε') γ / [(ε' − ε)² + γ²] dε',
//   ε = (ħω − Eg)/Ry*,  S2D(ε) = 2 / (1 + e^{−2π/√ε}),  γ = Γ0 + Γph / (e^{ħω_LO/kT} − 1).
// Written with the Lorentzians normalised to area π so that both terms share the same scale.
export const RY = 2.5, EG = 810, HW_LO = 34; // meV: In0.53Ga0.47As exciton Rydberg, gap at 12 K, LO phonon
export const KB = 0.08617; // meV/K
export function sommerfeld(e) { return e <= 0 ? 0 : 2 / (1 + Math.exp(-2 * Math.PI / Math.sqrt(e))); }
export function gamma(G0, Gph, T) { return G0 + (T > 0 ? Gph / Math.expm1(HW_LO / (KB * T)) : 0); }
export function alpha(e, g, { nmax = 6, emax = 60, ncont = 1200 } = {}) {
  let a = 0;
  for (let n = 1; n <= nmax; n++) { const En = -1 / (n - 0.5) ** 2, w = 4 / (n - 0.5) ** 3; a += w * g / ((e - En) ** 2 + g * g); }
  // continuum: substitute ε' = t² to tame the 1/√ε behaviour near threshold
  const tmax = Math.sqrt(emax), dt = tmax / ncont;
  for (let i = 0; i < ncont; i++) { const t = (i + 0.5) * dt, ep = t * t; a += sommerfeld(ep) * g / ((ep - e) ** 2 + g * g) * 2 * t * dt; }
  return a;
}
export function spectrum(es, g, opts) { return es.map((e) => alpha(e, g, opts)); }
// Synthetic "measured" spectrum: the model with hidden parameters plus noise, normalised to its maximum.
export function synthetic(es, { g = 0.42, noise = 0.015, shift = 0, rng } = {}) {
  let seed = 12345; const r = rng ?? (() => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; });
  const a = es.map((e) => alpha(e - shift, g)), m = Math.max(...a);
  return a.map((v) => v / m + noise * (r() - 0.5));
}
export function rms(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2; return Math.sqrt(s / a.length); }
