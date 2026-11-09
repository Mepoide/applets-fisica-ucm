// Electrons at a doped heterojunction: triangular well. Universal problem −χ'' + u χ = ε χ, χ(0) = 0:
// exact ε1 = 2.33811 (first Airy zero), Gaussian trial function χ = N u e^{−b²u²/2} gives 2.3448.
// GaAs/Al_xGa_{1-x}As with a finite barrier solved by finite differences with Ben Daniel–Duke masses.
import { boundStates, HB2M0 } from '../_dc/schrod.js';
export { HB2M0 };
export const AIRY1 = 2.33810741, C_VAR = 2.3448, B_VAR = Math.cbrt(2 / (3 * Math.sqrt(Math.PI)));
export function variationalEnergy(b) { return 1.5 * b * b + 2 / (Math.sqrt(Math.PI) * b); }
export function trial(u, b = B_VAR) { const N = Math.sqrt(4 * b ** 3 / Math.sqrt(Math.PI)); return N * u * Math.exp(-b * b * u * u / 2); }
// Universal exact solution on a grid (hard wall at u = 0, open end far away).
export function universal({ umax = 12, N = 1200 } = {}) {
  const s = umax / N, us = Array.from({ length: N - 1 }, (_, i) => s * (i + 1)), V = us.map((u) => u);
  const bs = boundStates(V, s, HB2M0, { nmax: 3 }); // m = HB2M0 so that HB2M0/m = 1 → −χ″ + uχ = εχ
  return { us, eps: bs.E, chi: bs.psi };
}
// GaAs/AlGaAs: K = 1.37 n2D meV/nm (n2D in 10¹¹ cm⁻²) = 1.37e-4 n2D eV/Å; barrier V0 = 0.773x for z < 0 with mass mB.
export function gaas(n2D, x, { zb = 150, zmax = 600, N = 1500 } = {}) {
  const K = 1.37e-4 * n2D, V0 = 0.773 * x, mA = 0.067, mB = 0.067 * (1 + 1.24 * x);
  const s = (zb + zmax) / N, zs = Array.from({ length: N - 1 }, (_, i) => -zb + s * (i + 1));
  const V = zs.map((z) => (z < 0 ? V0 : K * z)), m = zs.map((z) => (z < 0 ? mB : mA));
  const bs = boundStates(V, s, m, { nmax: 3, Emax: V0 });
  const Esc = Math.cbrt(HB2M0 * K * K / mA), Lsc = Math.cbrt(HB2M0 / (mA * K)); // energy and length scales
  return { zs, V, E: bs.E, psi: bs.psi, K, V0, Esc, Lsc, Einf: AIRY1 * Esc, Evar: C_VAR * Esc };
}
