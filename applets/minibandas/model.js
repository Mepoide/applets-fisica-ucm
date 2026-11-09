// Minibands of a GaAs/Al_xGa_{1-x}As superlattice (Kronig–Penney with Ben Daniel–Duke masses):
//   cos(KL) = cos(k d_p) cosh(κ d_b) + ½ (ξ − 1/ξ) sin(k d_p) sinh(κ d_b),  ξ = κ m_A / (k m_B),
// for 0 < E < V0; above the barrier κ → i k_B. Compared with the δ-barrier (Kronig–Penney) limit of equal area.
import { HB2M0 } from '../_dc/schrod.js';
export { HB2M0 };
export function materials(x) { return { mA: 0.067, mB: 0.067 * (1 + 1.24 * x), V0: 0.773 * x }; }
export function kpRHS(E, x, dp, db) {
  const { mA, mB, V0 } = materials(x); if (E <= 0) return Infinity;
  const k = Math.sqrt(mA * E / HB2M0);
  if (E < V0) { const kap = Math.sqrt(mB * (V0 - E) / HB2M0), xi = kap * mA / (k * mB); return Math.cos(k * dp) * Math.cosh(kap * db) + 0.5 * (xi - 1 / xi) * Math.sin(k * dp) * Math.sinh(kap * db); }
  const kb = Math.sqrt(mB * (E - V0) / HB2M0), xi = kb * mA / (k * mB);
  return Math.cos(k * dp) * Math.cos(kb * db) - 0.5 * (xi + 1 / xi) * Math.sin(k * dp) * Math.sin(kb * db);
}
// δ-barrier model with the same area V0·db and the same period L: cos(KL) = cos(kL) + (mA V0 db / (HB2M0 k)) sin(kL) / 2 ... in
// ħ²/2m units: −(HB2M0/mA) ψ'' + Σ V0 db δ(z − nL) ψ = Eψ  ⇒  cos KL = cos kL + (mA V0 db / (2 HB2M0 k)) sin kL.
export function deltaRHS(E, x, dp, db) { const { mA, V0 } = materials(x), L = dp + db; if (E <= 0) return Infinity; const k = Math.sqrt(mA * E / HB2M0); return Math.cos(k * L) + (mA * V0 * db / (2 * HB2M0 * k)) * Math.sin(k * L); }
export function inBand(rhs) { return Math.abs(rhs) <= 1; }
// Band edges on [Emin, Emax] by scanning for |rhs| = 1 crossings (returns array of [lo, hi] allowed intervals).
export function bands(f, Emin, Emax, n = 6000) {
  const out = []; let open = null;
  for (let i = 0; i <= n; i++) { const E = Emin + (Emax - Emin) * i / n, ok = Math.abs(f(E)) <= 1; if (ok && open == null) open = E; if (!ok && open != null) { out.push([open, E]); open = null; } }
  if (open != null) out.push([open, Emax]);
  return out;
}
// Dispersion K(E)·L/π in [0, 1] for allowed energies.
export function blochK(f, E) { const r = f(E); return Math.abs(r) <= 1 ? Math.acos(r) / Math.PI : NaN; }
// Bound level of the isolated well (even ground state) — the first miniband straddles it.
export function isolatedLevel(x, dp) { const { mA, mB, V0 } = materials(x); const F = (E) => { const k = Math.sqrt(mA * E / HB2M0), kap = Math.sqrt(mB * (V0 - E) / HB2M0); return k * dp / 2 - Math.atan((mA / mB) * kap / k); };
  let lo = 1e-7, hi = V0 - 1e-9; if (F(hi) < 0) return NaN; for (let i = 0; i < 80; i++) { const m = 0.5 * (lo + hi); if (F(m) > 0) hi = m; else lo = m; } return 0.5 * (lo + hi); }
