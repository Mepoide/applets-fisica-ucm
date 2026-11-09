// Debye model: specific heat per atom in units of k_B,
//   c(T) = 9 (T/Θ)³ ∫₀^{Θ/T} x⁴ eˣ/(eˣ−1)² dx,   → 3 (Dulong–Petit) for T ≫ Θ, (12π⁴/5)(T/Θ)³ for T ≪ Θ.
export function debyeIntegrand(x) { if (x < 1e-6) return x * x; if (x > 700) return 0; const e = Math.exp(x); return x ** 4 * e / ((e - 1) ** 2); }
// Composite Simpson on [0, xmax] with n (even) intervals.
export function simpson(f, a, b, n = 400) {
  if (n % 2) n++;
  const h = (b - a) / n; let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}
export function cDebye(T, Theta) {
  if (T <= 0) return 0;
  const xm = Theta / T;
  if (xm > 60) return 12 * Math.PI ** 4 / 5 * (T / Theta) ** 3; // integral → 4π⁴/15
  return 9 * (T / Theta) ** 3 * simpson(debyeIntegrand, 0, xm, Math.max(200, Math.ceil(xm * 40)));
}
export const cLowT = (T, Theta) => 12 * Math.PI ** 4 / 5 * (T / Theta) ** 3;
export const DULONG_PETIT = 3;
// Einstein model with the same characteristic temperature (for comparison).
export function cEinstein(T, Theta) { const x = Theta / T; if (x > 700) return 0; const e = Math.exp(x); return 3 * x * x * e / ((e - 1) ** 2); }
export const SOLIDS = { K: 100, Cu: 315, Al: 394, Fe: 420, B: 1250, 'C (diamante)': 1860, LiF: 730, NaCl: 321 };
