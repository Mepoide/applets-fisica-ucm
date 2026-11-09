// Brownian motion: one heavy large disk in a bath of light hard disks
// (shared event-driven engine). Tracks the heavy disk, computes the
// mean-squared displacement and fits the diffusion coefficient.
import * as D from '../_kinetic/disks.js';

export function create({ N = 40, massRatio = 20, radiusRatio = 4, kT = 1, L = 200, radius = 3, rng = Math.random } = {}) {
  const radii = new Array(N + 1).fill(radius); radii[0] = radius * radiusRatio;
  const masses = new Array(N + 1).fill(1); masses[0] = massRatio;
  const s = D.createGas({ N: N + 1, L, radii, masses, dist: 'maxwell', kT, rng });
  // centre the big disk and re-place the bath around it
  s.x[0] = L / 2; s.y[0] = L / 2;
  for (let i = 1; i <= N; i++) {
    for (let tries = 0; tries < 5000; tries++) {
      const px = radius + rng() * (L - 2 * radius), py = radius + rng() * (L - 2 * radius);
      let ok = Math.hypot(px - s.x[0], py - s.y[0]) >= radii[0] + radius + 0.5;
      for (let k = 1; k < i && ok; k++) if (Math.hypot(px - s.x[k], py - s.y[k]) < 2 * radius + 0.1) ok = false;
      if (ok) { s.x[i] = px; s.y[i] = py; break; }
    }
  }
  s.vx[0] = 0; s.vy[0] = 0;
  s.track = [[0, L / 2, L / 2]]; // [t, x, y] unwrapped (no periodic boundaries here)
  s.kTbath = kT; s.M = massRatio;
  return s;
}
export function step(s) {
  D.step(s);
  s.track.push([s.t, s.x[0], s.y[0]]);
  if (s.track.length > 20000) s.track.splice(0, 10000);
}
export function bathTemperature(s) {
  let e = 0; for (let i = 1; i < s.N; i++) e += 0.5 * s.mass[i] * (s.vx[i] ** 2 + s.vy[i] ** 2);
  return e / (s.N - 1);
}
export function heavyKinetic(s) { return 0.5 * s.mass[0] * (s.vx[0] ** 2 + s.vy[0] ** 2); }

// Mean-squared displacement over lags up to maxLag (in steps), averaged over time origins.
export function msd(track, maxLag = 200, stride = 1) {
  const n = track.length; const lags = [], values = [];
  for (let lag = stride; lag <= Math.min(maxLag, n - 1); lag += stride) {
    let acc = 0, cnt = 0;
    for (let i = 0; i + lag < n; i += Math.max(1, Math.floor(lag / 4))) {
      const dx = track[i + lag][1] - track[i][1], dy = track[i + lag][2] - track[i][2];
      acc += dx * dx + dy * dy; cnt++;
    }
    lags.push(lag * (track[1]?.[0] - track[0]?.[0] || 1)); values.push(acc / cnt);
  }
  return { t: lags, msd: values };
}
// Fit ⟨Δr²⟩ = 4 D t (2D) on the diffusive window: displacements large enough to have left the
// ballistic regime (msd > lo, default (L/8)²) and small enough not to feel the box (msd < hi,
// default (L/3)²). Returns D, R² and the number of points used.
export function fitD({ t, msd: m }, L = 200, lo = (L / 8) ** 2, hi = (L / 3) ** 2) {
  const idx = [];
  for (let i = 0; i < t.length; i++) if (m[i] > lo && m[i] < hi) idx.push(i);
  const n = idx.length;
  if (n < 3) return { D: NaN, r2: NaN };
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  for (const i of idx) { sx += t[i]; sy += m[i]; sxx += t[i] * t[i]; sxy += t[i] * m[i]; syy += m[i] * m[i]; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const r = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  return { D: slope / 4, r2: r * r, n };
}
// Einstein–Enskog order of magnitude for the heavy disk in 2D: D = kT / ζ with the Enskog friction
// ζ = (8/3) n σ_12 sqrt(2π μ kT) (σ_12 = R + r contact distance, μ reduced mass) for hard disks; shown only as a guide.
export function enskogD(s) {
  const n = (s.N - 1) / (s.Lx * s.Ly), sig = s.r[0] + s.r[1], mu = s.mass[0] * s.mass[1] / (s.mass[0] + s.mass[1]);
  const zeta = (8 / 3) * n * sig * Math.sqrt(2 * Math.PI * mu * s.kTbath);
  return s.kTbath / zeta;
}
