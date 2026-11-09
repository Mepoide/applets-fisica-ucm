// Ideal gas of N point-like particles (drawn as disks) in a box with specular
// walls, Maxwellian velocities at temperature kT. The observable is the number
// of particles inside a rectangular window: its time series, histogram and
// autocorrelation. Particles do not interact, as in the 2003 applet.
import { gaussian } from '../../lib/rng.js';
import { poissonPmf, binomialPmf, autocorrelation as acf } from '../../lib/stats.js';

export function create({ N = 50, kT = 100, w = 200, h = 200, radius = 4, rng = Math.random } = {}) {
  const s = { N, kT, w, h, radius, rng, t: 0,
    x: new Float64Array(N), y: new Float64Array(N), vx: new Float64Array(N), vy: new Float64Array(N),
    window: { x: w * 0.3, y: h * 0.3, w: w * 0.4, h: h * 0.4 }, series: [] };
  for (let i = 0; i < N; i++) {
    s.x[i] = radius + rng() * (w - 2 * radius);
    s.y[i] = radius + rng() * (h - 2 * radius);
    const sd = Math.sqrt(kT);
    s.vx[i] = sd * gaussian(rng); s.vy[i] = sd * gaussian(rng);
  }
  return s;
}

export function step(s, dt = 0.1) {
  const R = s.radius;
  for (let i = 0; i < s.N; i++) {
    s.x[i] += s.vx[i] * dt; s.y[i] += s.vy[i] * dt;
    if (s.x[i] < R) { s.x[i] = 2 * R - s.x[i]; s.vx[i] = -s.vx[i]; }
    if (s.x[i] > s.w - R) { s.x[i] = 2 * (s.w - R) - s.x[i]; s.vx[i] = -s.vx[i]; }
    if (s.y[i] < R) { s.y[i] = 2 * R - s.y[i]; s.vy[i] = -s.vy[i]; }
    if (s.y[i] > s.h - R) { s.y[i] = 2 * (s.h - R) - s.y[i]; s.vy[i] = -s.vy[i]; }
  }
  s.t += dt;
}

export function countInWindow(s, win = s.window) {
  let n = 0;
  const x1 = win.x + win.w, y1 = win.y + win.h;
  for (let i = 0; i < s.N; i++) if (s.x[i] >= win.x && s.x[i] < x1 && s.y[i] >= win.y && s.y[i] < y1) n++;
  return n;
}

// Advance and record the count. Returns the count.
export function sample(s, dt) {
  step(s, dt);
  const n = countInWindow(s);
  s.series.push(n);
  return n;
}

// Fraction of the accessible area covered by the window (centres live in [R, L-R]).
export function windowFraction(s, win = s.window) {
  const ax = s.w - 2 * s.radius, ay = s.h - 2 * s.radius;
  const x0 = Math.max(win.x, s.radius), x1 = Math.min(win.x + win.w, s.w - s.radius);
  const y0 = Math.max(win.y, s.radius), y1 = Math.min(win.y + win.h, s.h - s.radius);
  const a = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
  return Math.min(1, Math.max(0, a / (ax * ay)));
}

export function occupationStats(series) {
  const n = series.length;
  if (!n) return { mean: 0, variance: 0, histogram: new Uint32Array(1), max: 0 };
  let m = 0, max = 0;
  for (const v of series) { m += v; if (v > max) max = v; }
  m /= n;
  let v2 = 0; for (const v of series) v2 += (v - m) ** 2;
  const histogram = new Uint32Array(max + 1);
  for (const v of series) histogram[v]++;
  return { mean: m, variance: v2 / n, histogram, max };
}

// Expected probabilities for k = 0..N under both ensembles.
export function expectedPmf(N, p) {
  const poisson = new Float64Array(N + 1), binomial = new Float64Array(N + 1);
  const lambda = N * p;
  for (let k = 0; k <= N; k++) { poisson[k] = poissonPmf(k, lambda); binomial[k] = binomialPmf(k, N, p); }
  return { poisson, binomial, lambda, varianceBinomial: N * p * (1 - p), variancePoisson: lambda };
}

export function autocorrelation(series, maxLag) { return acf(series, Math.min(maxLag, Math.max(0, series.length - 1))); }

// Correlation time estimate: window side / thermal speed, in the same time units as dt.
export function correlationTimeEstimate(s) {
  const vth = Math.sqrt(s.kT); // 1D rms velocity for m = 1
  return Math.min(s.window.w, s.window.h) / vth;
}
