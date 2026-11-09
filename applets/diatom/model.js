// Specific heat of an ideal gas of diatomic molecules (per molecule, units of k_B):
// translation 3/2, rotation from the exact level sum Σ(2J+1)e^{−J(J+1)Θr/T}, vibration
// from the harmonic oscillator with characteristic temperature Θv.
export function cvVib(T, Tv) {
  if (T <= 0) return 0;
  const x = Tv / T; if (x > 700) return 0;
  const e = Math.exp(x); return x * x * e / ((e - 1) ** 2);
}
// Rotational: c = Var(ε)/T² with ε_J = J(J+1)Θr, degeneracy 2J+1. Sum until terms are negligible.
export function cvRot(T, Tr) {
  if (T <= 0) return 0;
  let Z = 0, E = 0, E2 = 0;
  const jmax = Math.max(20, Math.ceil(8 * Math.sqrt(T / Tr)) + 10);
  for (let J = 0; J <= jmax; J++) {
    const eps = J * (J + 1) * Tr, w = (2 * J + 1) * Math.exp(-eps / T);
    Z += w; E += w * eps; E2 += w * eps * eps;
  }
  E /= Z; E2 /= Z;
  return (E2 - E * E) / (T * T);
}
export function cv(T, Tr, Tv) { return 1.5 + cvRot(T, Tr) + cvVib(T, Tv); }
export function zRot(T, Tr) {
  let Z = 0; const jmax = Math.max(20, Math.ceil(8 * Math.sqrt(T / Tr)) + 10);
  for (let J = 0; J <= jmax; J++) Z += (2 * J + 1) * Math.exp(-J * (J + 1) * Tr / T);
  return Z;
}
export function zVib(T, Tv) { const x = Tv / T; return x > 700 ? 0 : Math.exp(-x / 2) / (1 - Math.exp(-x)); }
// Characteristic temperatures (K) from Lee, Sears & Turcotte (1963).
export const MOLECULES = {
  H2: { Tr: 85, Tv: 6200 }, N2: { Tr: 2.9, Tv: 3340 }, CO: { Tr: 2.8, Tv: 3070 }, NO: { Tr: 2.4, Tv: 2690 },
  O2: { Tr: 2.1, Tv: 2230 }, Cl2: { Tr: 0.35, Tv: 810 }, Br2: { Tr: 0.12, Tv: 470 }, K2: { Tr: 0.081, Tv: 140 },
};
