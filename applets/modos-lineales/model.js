// Linearized hydrodynamics in one dimension: analytic evolution of an initial
// isothermal density perturbation δρ(x,0) = G_σ(x), u = 0, δT = 0 in a fluid
// at rest (ρ = 1, T = 1). The perturbation splits into two propagating sound
// (Brillouin) modes and one diffusing thermal (Rayleigh) mode with the
// Landau–Placzek weights 1/γ (sound, half each way) and 1 − 1/γ (thermal).
//
//   δρ(x,t) = (1/2γ)[G_s(x−c_s t) + G_s(x+c_s t)] + (1−1/γ) G_T(x)
//   G_s: Gaussian of variance σ² + 2Γ t  (Γ = sound attenuation coefficient)
//   G_T: Gaussian of variance σ² + 2D_T t (D_T = κ/(ρ c_p) thermal diffusivity)
//   u   = −(1/ρ) ∫_{−∞}^{x} ∂_t δρ dx'   (continuity, exact for this ansatz)
//   δT  = (T/ρ)[(γ−1) δρ_s − δρ_T]        (ideal gas: adiabatic sound, isobaric heat mode)
// With these weights δT(x,0) = 0 identically, which is what fixes 1/γ and 1−1/γ.

export const DEFAULTS = { cs: 1, gammaS: 0.1, DT: 0.1, gamma: 5 / 3, sigma: 2, rho: 1, T: 1 };

function gauss(x, v) { return Math.exp(-x * x / (2 * v)) / Math.sqrt(2 * Math.PI * v); }
function dgauss(x, v) { return -x / v * gauss(x, v); } // ∂_x G

export function weights(gamma) { return { sound: 1 / gamma, thermal: 1 - 1 / gamma }; }

// Returns {drho, drhoS, drhoT, u, dT} at (x, t).
export function fields(x, t, p = DEFAULTS) {
  const { cs, gammaS, DT, gamma, sigma, rho, T } = { ...DEFAULTS, ...p };
  const vs = sigma * sigma + 2 * gammaS * t, vT = sigma * sigma + 2 * DT * t;
  const w = weights(gamma);
  const Gm = gauss(x - cs * t, vs), Gp = gauss(x + cs * t, vs), GT = gauss(x, vT);
  const dGm = dgauss(x - cs * t, vs), dGp = dgauss(x + cs * t, vs), dGT = dgauss(x, vT);
  const drhoS = (w.sound / 2) * (Gm + Gp);
  const drhoT = w.thermal * GT;
  // ∂_t G_s(x∓ct, v(t)) = ∓c ∂_x G + Γ ∂_x² G ; antiderivative in x: ∓c G + Γ ∂_x G
  const u = -(1 / rho) * ((w.sound / 2) * (-cs * Gm + cs * Gp + gammaS * (dGm + dGp)) + w.thermal * DT * dGT);
  const dT = (T / rho) * ((gamma - 1) * drhoS - drhoT);
  return { drho: drhoS + drhoT, drhoS, drhoT, u, dT };
}

// Sample the three fields on a grid.
export function profiles(xs, t, p) {
  const n = xs.length, drho = new Float64Array(n), u = new Float64Array(n), dT = new Float64Array(n);
  for (let i = 0; i < n; i++) { const f = fields(xs[i], t, p); drho[i] = f.drho; u[i] = f.u; dT[i] = f.dT; }
  return { drho, u, dT };
}

export function linspace(a, b, n) { const out = new Float64Array(n); for (let i = 0; i < n; i++) out[i] = a + (b - a) * i / (n - 1); return out; }

// Trapezoidal integral of y over x.
export function integrate(xs, ys) { let s = 0; for (let i = 1; i < xs.length; i++) s += 0.5 * (ys[i] + ys[i - 1]) * (xs[i] - xs[i - 1]); return s; }
