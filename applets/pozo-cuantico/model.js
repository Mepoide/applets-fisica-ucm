// Electronic states in a GaAs/Al_xGa_{1-x}As quantum well (Ben Daniel–Duke): levels from the
// transcendental equations with mass-dependent matching, graphical solution in θ = k a/2.
import { HB2M0 } from '../_dc/schrod.js';
export { HB2M0 };

export function materials(x) { return { mA: 0.067, mB: 0.067 * (1 + 1.24 * x), V0: 0.773 * x }; }

// k² = mA E / HB2M0,  κ² = mB (V0 − E) / HB2M0;  even: tan θ = (mA/mB) κ/k ; odd: −cot θ = (mA/mB) κ/k.
export function thetaMax(x, a) { const { mA, V0 } = materials(x); return 0.5 * a * Math.sqrt(mA * V0 / HB2M0); }
export function energyOf(theta, x, a) { const { mA } = materials(x); const k = 2 * theta / a; return HB2M0 * k * k / mA; }
// Right-hand side g(θ) = (mA/mB) κ/k.
export function rhs(theta, x, a) {
  const { mA, mB, V0 } = materials(x), E = energyOf(theta, x, a); if (E >= V0 || theta <= 0) return 0;
  const k = 2 * theta / a, kappa = Math.sqrt(mB * (V0 - E) / HB2M0); return (mA / mB) * kappa / k;
}
// Phase form: even θ = atan g + nπ, odd θ = π/2 + atan g + nπ. Monotonic ⇒ bisection per branch.
export function levels(x, a) {
  const t0 = thetaMax(x, a), out = [];
  for (let n = 0; ; n++) {
    for (const parity of ['even', 'odd']) {
      const off = (parity === 'even' ? 0 : Math.PI / 2) + n * Math.PI;
      const F = (t) => t - Math.atan(rhs(t, x, a)) - off;
      if (F(t0) < 0) { if (parity === 'odd') return out.sort((p, q) => p.E - q.E); continue; }
      let lo = 1e-9, hi = t0; if (F(lo) > 0) continue;
      for (let i = 0; i < 80; i++) { const m = 0.5 * (lo + hi); if (F(m) > 0) hi = m; else lo = m; }
      const theta = 0.5 * (lo + hi); out.push({ theta, E: energyOf(theta, x, a), parity });
    }
    if (n > 50) return out;
  }
}
// Infinite-well reference E_n = HB2M0 (nπ/a)² / mA.
export function infiniteLevels(x, a, n) { const { mA } = materials(x); return Array.from({ length: n }, (_, i) => HB2M0 * ((i + 1) * Math.PI / a) ** 2 / mA); }
// Envelope function of a level on zs (Å, well centred at 0), normalised to max 1.
export function envelope(level, x, a, zs) {
  const { mB, V0 } = materials(x), k = 2 * level.theta / a, kappa = Math.sqrt(Math.max(0, mB * (V0 - level.E) / HB2M0));
  const even = level.parity === 'even', edge = even ? Math.cos(k * a / 2) : Math.sin(k * a / 2);
  return zs.map((z) => (Math.abs(z) <= a / 2 ? (even ? Math.cos(k * z) : Math.sin(k * z)) : edge * Math.sign(even ? 1 : z) * Math.exp(-kappa * (Math.abs(z) - a / 2))));
}
