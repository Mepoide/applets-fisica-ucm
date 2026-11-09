// Thermal conductivity of a hard-disk gas between two thermal walls (left at
// T1, right at T2). Energy exchanged with each reservoir is accumulated by the
// shared engine; κ follows from Fourier's law with the imposed gradient.
import * as D from '../_kinetic/disks.js';

export function create({ N = 60, T1 = 2, T2 = 0.5, Lx = 300, Ly = 150, radius = 4, rng = Math.random } = {}) {
  const s = D.createGas({
    N, Lx, Ly, radius, dist: 'maxwell', kT: (T1 + T2) / 2, rng,
    walls: { left: { thermal: T1 }, right: { thermal: T2 } },
  });
  s.T1 = T1; s.T2 = T2;
  s.acc = { T: null, n: null, count: 0 };
  return s;
}
export function step(s, bins = 10) {
  D.step(s);
  accumulateProfile(s, bins);
}
export function accumulateProfile(s, bins) {
  const p = D.profile(s, bins);
  if (!s.acc.T || s.acc.T.length !== bins) { s.acc.T = new Float64Array(bins); s.acc.n = new Float64Array(bins); s.acc.count = 0; }
  for (let b = 0; b < bins; b++) { s.acc.T[b] += p.n[b] ? p.T[b] * p.n[b] : 0; s.acc.n[b] += p.n[b]; }
  s.acc.count++;
}
export function resetStats(s) { s.heat.left = 0; s.heat.right = 0; s.acc = { T: null, n: null, count: 0 }; s.t0 = s.t; }

// Time-averaged slab temperature (energy-weighted) and density.
export function meanProfile(s) {
  const bins = s.acc.T?.length ?? 0;
  const T = new Float64Array(bins), rho = new Float64Array(bins);
  const area = s.Lx / bins * s.Ly;
  for (let b = 0; b < bins; b++) { T[b] = s.acc.n[b] ? s.acc.T[b] / s.acc.n[b] : NaN; rho[b] = s.acc.count ? s.acc.n[b] / s.acc.count / area : 0; }
  return { T, rho, x: Float64Array.from({ length: bins }, (_, b) => (b + 0.5) * s.Lx / bins) };
}

// Heat current: energy per unit time entering from the hot wall (and leaving at the cold one).
export function heatCurrent(s) {
  const dt = s.t - (s.t0 ?? 0);
  if (dt <= 0) return { Qin: NaN, Qout: NaN, Q: NaN };
  const Qin = s.heat.left / dt, Qout = -s.heat.right / dt;
  return { Qin, Qout, Q: 0.5 * (Qin + Qout) };
}
// κ = (Q / Ly) / ((T1 − T2) / Lx): flux per unit length (2D) over the imposed gradient.
export function conductivity(s) {
  const { Q } = heatCurrent(s);
  const grad = (s.T1 - s.T2) / s.Lx;
  return grad === 0 ? NaN : (Q / s.Ly) / grad;
}
// Mean-field estimate for a dilute 2D hard-disk gas, up to an O(1) factor:
// κ ≈ (1/2) n c v̄ λ with λ = 1/(2 n σ), σ = 2R → κ ≈ c v̄ /(4σ) with c = k_B per particle (2D: c = 1).
export function kappaKinetic(s, T = (s.T1 + s.T2) / 2) {
  const vbar = Math.sqrt(Math.PI * T / 2); // mean speed in 2D for m = 1
  return vbar / (4 * 2 * s.radius);
}
