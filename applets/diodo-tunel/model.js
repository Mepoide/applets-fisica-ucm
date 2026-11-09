// Resonant-tunnelling diode: double barrier GaAs/Al_xGa_{1-x}As under bias, transmission by the
// discrete transfer matrix and current by the Tsu–Esaki integral.
import { HB2M0, transmission, current } from '../_dc/schrod.js';
export { HB2M0 };
export const M = 0.067, KB = 8.617333e-5;
// Grid of the biased structure: [buffer | barrier b | well w | barrier b | buffer], linear drop Vb across L = 2b + w.
export function profile({ b = 30, w = 50, x = 0.3, Vb = 0, s = 1, buffer = 20 } = {}) {
  const V0 = 0.773 * x, L = 2 * b + w, n = Math.round((L + 2 * buffer) / s), V = new Float64Array(n), zs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const z = (i + 0.5) * s - buffer; zs[i] = z;
    const inStruct = z >= 0 && z < L, inBarrier = inStruct && (z < b || z >= b + w);
    V[i] = (inBarrier ? V0 : 0) - (z <= 0 ? 0 : z >= L ? Vb : Vb * z / L);
  }
  return { V, zs, s, L, V0, Vb };
}
export function transmissionCurve(p, Es) { return Es.map((E) => transmission(p.V, p.s, E, M, 0, -p.Vb)); }
// Resonance energies: local maxima of T(E).
export function resonances(Es, Ts) { const out = []; for (let i = 1; i + 1 < Es.length; i++) if (Ts[i] > Ts[i - 1] && Ts[i] >= Ts[i + 1] && Ts[i] > 1e-4) out.push({ E: Es[i], T: Ts[i] }); return out; }
export function iv(params, Vbs, { EF = 0.05, T = 4.2, Es } = {}) {
  const kT = KB * T, grid = Es ?? Array.from({ length: 300 }, (_, i) => 1e-4 + (EF + 12 * kT) * i / 299);
  return Vbs.map((Vb) => current(grid, transmissionCurve(profile({ ...params, Vb }), grid), EF, kT, Vb));
}
// Bound level of the isolated well (flat band) — the resonance should sit close to it at zero bias.
export function wellLevel(w, x) { const V0 = 0.773 * x, M2 = M; let lo = 1e-6, hi = Math.min(V0 - 1e-6, HB2M0 * (Math.PI / w) ** 2 / M2 * 0.999);
  const F = (E) => { const k = Math.sqrt(M2 * E / HB2M0), kap = Math.sqrt(M2 * (V0 - E) / HB2M0); return k * Math.tan(k * w / 2) - kap; };
  if (F(hi) < 0) return NaN; for (let i = 0; i < 80; i++) { const m = 0.5 * (lo + hi); if (F(m) > 0) hi = m; else lo = m; } return 0.5 * (lo + hi); }
