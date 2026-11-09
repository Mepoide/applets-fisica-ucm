// Quantum-confined Stark effect in an infinite well: −χ'' − v u χ = ε χ on u ∈ [−1/2, 1/2], v = eFa/E0,
// ε = E/E0, E0 = ħ²/(2 m* a²). Finite differences; perturbation theory to second order; oscillator strength.
import { tridiagEigenvalues, tridiagEigenvector } from '../../lib/linalg.js';
import { HB2M0 } from '../_dc/schrod.js';
export const M = 0.067;
export function E0(a) { return HB2M0 / (M * a * a); } // eV for a in Å
export function vOf(F, a) { return F * 1e-8 * a / E0(a); } // F in V/cm → eFa in eV (a in Å: 1e-8 cm/Å)
export function solve(v, { N = 400, nmax = 2 } = {}) {
  const s = 1 / (N + 1), n = N, us = Array.from({ length: n }, (_, i) => -0.5 + s * (i + 1));
  const d = new Float64Array(n), e = new Float64Array(n - 1).fill(-1 / (s * s));
  for (let i = 0; i < n; i++) d[i] = 2 / (s * s) - v * us[i];
  const ev = tridiagEigenvalues(d, e), eps = [], chi = [];
  for (let k = 0; k < nmax; k++) { eps.push(ev[k]); chi.push(tridiagEigenvector(d, e, ev[k]).map((x) => x / Math.sqrt(s))); }
  return { us, s, eps, chi };
}
// Second-order perturbation theory: ε1 = π² − c v², c = (15 − π²)/(48 π⁴) ≈ 1.097e-3 (the course sheet rounds it to 1/(100π²)).
export const C2 = (15 - Math.PI ** 2) / (48 * Math.PI ** 4);
export function perturbative(v) { return Math.PI ** 2 - C2 * v * v; }
export function coursePerturbative(v) { return Math.PI ** 2 - (v / (10 * Math.PI)) ** 2; }
// f12 = (ε2 − ε1) |u12|², u12 = ∫ χ1 u χ2 du (= 0.9607 at zero field).
export function oscillatorStrength(sol) { let u12 = 0; for (let i = 0; i < sol.us.length; i++) u12 += sol.chi[0][i] * sol.us[i] * sol.chi[1][i] * sol.s; return (sol.eps[1] - sol.eps[0]) * u12 * u12; }
export const F12_0 = 3 * Math.PI ** 2 * (16 / (9 * Math.PI ** 2)) ** 2;
