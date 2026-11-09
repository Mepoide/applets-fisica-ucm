// Stochastic resonance: Metropolis walkers in a double well V(x,t) = (x² − 1)² + A x cos(ωt).
// The response x(t) is compared with the signal; the signal-to-noise ratio
// |⟨x cos ωt⟩| / σ_x peaks when the Kramers hopping time matches half the period.
import * as W from '../_walkers/metropolis.js';
import * as Arr from '../arrhenius/model.js';

// Coarser lattice than experiment 8 (Δx = 0.1): the free-diffusion time across the wells, ~(2Δ)²/2D, is
// then ~800 steps and a drive period of a few thousand steps is enough to reach the resonance.
export const L = 41, XMIN = Arr.XMIN, XMAX = Arr.XMAX, DX = Arr.dxFor(L);
const xs = W.xgrid(L, XMIN, XMAX);

export function potentialAt(A, omega, t) {
  const a = A * Math.cos(omega * t);
  return Float64Array.from(xs, (x) => (x * x - 1) ** 2 + a * x);
}
export function minimumPosition(A, omega, t) {
  const V = potentialAt(A, omega, t);
  let im = 0; for (let i = 1; i < L; i++) if (V[i] < V[im]) im = i;
  return xs[im];
}

export function create({ N = 1, kT = 0.15, A = 0.3, period = 2000, rng = Math.random } = {}) {
  const omega = 2 * Math.PI / period;
  const s = W.createWalkers({ N, V: potentialAt(A, omega, 0), kT, rng, x0: Math.round((L - 1) / 4) });
  Object.assign(s, { A, omega, period, xs, series: [], maxSeries: 40 * period });
  return s;
}
export function meanX(s) { let m = 0; for (let i = 0; i < s.N; i++) m += xs[s.x[i]]; return m / s.N; }
export function step(s) {
  W.setPotential(s, potentialAt(s.A, s.omega, s.t));
  W.stepWalkers(s);
  s.series.push(meanX(s));
  if (s.series.length > s.maxSeries) s.series.splice(0, s.series.length - s.maxSeries);
}

// Response at the driving frequency: first Fourier coefficient of x(t) (unit steps from t0).
// amp = 2|⟨x e^{−iωt}⟩| is the amplitude of the ω component (a perfect x = cos ωt gives 1);
// snr = amp² / (2 σ_x²) is its share of the variance (1 for a perfect cosine, ≈0 for noise).
export function response(series, omega, t0 = 0) {
  const n = series.length; if (n < 10) return { amp: NaN, phase: NaN, snr: NaN };
  let m = 0; for (const v of series) m += v; m /= n;
  let c = 0, sn = 0, v2 = 0;
  for (let i = 0; i < n; i++) { const d = series[i] - m, ph = omega * (t0 + i); c += d * Math.cos(ph); sn += d * Math.sin(ph); v2 += d * d; }
  c /= n; sn /= n; const var_ = v2 / n;
  const amp = 2 * Math.hypot(c, sn);
  return { amp, phase: Math.atan2(sn, c), snr: var_ > 0 ? amp * amp / (2 * var_) : 0 };
}
export function snr(series, omega, t0 = 0) { return response(series, omega, t0).snr; }

// Kramers hopping time of the unperturbed well, in walker steps (lattice flux-over-population rate).
export function kramersTime(kT) {
  const V = Arr.potential(0, L), lm = Arr.landmarks(V);
  return 1 / Arr.rateKramers(V, kT, lm, 'right', DX).k;
}
// Temperature at which the hopping time equals half the period (bisection on log kT).
export function resonantTemperature(period) {
  let lo = Math.log(0.02), hi = Math.log(20);
  for (let it = 0; it < 60; it++) { const mid = 0.5 * (lo + hi); if (kramersTime(Math.exp(mid)) > period / 2) lo = mid; else hi = mid; }
  return Math.exp(0.5 * (lo + hi));
}

// Sweep: run `periods` periods at each kT with N walkers and return the SNR.
export function sweep({ kTs, A, period, N = 20, periods = 20, rng = Math.random }) {
  return kTs.map((kT) => {
    const s = create({ N, kT, A, period, rng });
    const T = Math.round(periods * period);
    for (let t = 0; t < T; t++) step(s);
    const skip = Math.min(s.series.length - 1, period * 2);
    const r = response(s.series.slice(skip), s.omega, s.t - s.series.length + skip);
    return { kT, amp: r.amp, snr: r.snr };
  });
}
