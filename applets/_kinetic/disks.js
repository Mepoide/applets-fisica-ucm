// Hard disks in a 2D box, event-driven (Alder–Wainwright) inside each time
// step: every pair and wall collision is resolved at its exact time, so energy
// is conserved to round-off and disks never overlap. Generalises the phase-1
// Maxwell engine: per-disk radius and mass, rectangular box, thermal walls
// (stochastic reservoirs at a given kT) and a removable vertical partition.
// Pure module: no DOM, injectable rng.
import { gaussian } from '../../lib/rng.js';

export const DISTRIBUTIONS = ['angle', 'vxvy', 'vyRandomVxFixed', 'fixed', 'maxwell'];

// Wall codes used in event prediction.
const W_LEFT = 0, W_RIGHT = 1, W_BOTTOM = 2, W_TOP = 3, W_PART_L = 4, W_PART_R = 5;

/**
 * createGas({ N, L, Lx, Ly, radius, radii, mass, masses, dist, kT, dt, rng,
 *             walls: { left, right, top, bottom }  ('specular' | { thermal: kT }),
 *             partition: { x, open },  region: { xmin, xmax } for initial placement })
 */
export function createGas({
  N = 80, L = 200, Lx = L, Ly = L, radius = 4, radii = null, mass = 1, masses = null,
  dist = 'angle', kT = 1, dt = 1, rng = Math.random, walls = {}, partition = null, region = null,
} = {}) {
  const s = {
    N, L: Lx, Lx, Ly, radius, m: mass, dt, dist, rng, t: 0, ncol: 0, nwall: 0,
    x: new Float64Array(N), y: new Float64Array(N), vx: new Float64Array(N), vy: new Float64Array(N),
    r: new Float64Array(N).fill(radius), mass: new Float64Array(N).fill(mass),
    walls: { left: walls.left ?? 'specular', right: walls.right ?? 'specular', top: walls.top ?? 'specular', bottom: walls.bottom ?? 'specular' },
    heat: { left: 0, right: 0, top: 0, bottom: 0 },
    partition: partition ? { x: partition.x, open: !!partition.open } : null,
  };
  if (radii) for (let i = 0; i < N; i++) s.r[i] = radii[i] ?? radius;
  if (masses) for (let i = 0; i < N; i++) s.mass[i] = masses[i] ?? mass;
  placeDisks(s, region ?? (partition && !partition.open ? { xmin: 0, xmax: partition.x } : null));
  for (let i = 0; i < N; i++) setVelocity(s, i, dist, kT);
  s.kT0 = kineticTemperature(s);
  return s;
}

// Backwards-compatible constructor used by the Maxwell applet.
export function create(opts = {}) { return createGas(opts); }

// Random non-overlapping placement by rejection inside [xmin,xmax]×[0,Ly];
// falls back to a hexagonal grid when the packing is too dense.
export function placeDisks(s, region = null) {
  const { N, rng } = s;
  const xmin = region?.xmin ?? 0, xmax = region?.xmax ?? s.Lx;
  let placed = 0;
  outer: for (let i = 0; i < N; i++) {
    const R = s.r[i];
    for (let tries = 0; tries < 2000; tries++) {
      const px = xmin + R + rng() * (xmax - xmin - 2 * R), py = R + rng() * (s.Ly - 2 * R);
      let ok = true;
      for (let k = 0; k < i; k++) {
        const dx = s.x[k] - px, dy = s.y[k] - py, d = s.r[k] + R;
        if (dx * dx + dy * dy < d * d) { ok = false; break; }
      }
      if (ok) { s.x[i] = px; s.y[i] = py; placed++; continue outer; }
    }
    break;
  }
  if (placed < N) {
    const Rmax = Math.max(...s.r);
    const a = 2 * Rmax * 1.05, rowH = a * Math.sqrt(3) / 2;
    let i = 0;
    for (let row = 0; i < N; row++) {
      const py = Rmax + rowH * row;
      if (py > s.Ly - Rmax) throw new Error('Too many disks for the box');
      const off = (row % 2) * a / 2;
      for (let px = xmin + Rmax + off; px <= xmax - Rmax && i < N; px += a) { s.x[i] = px; s.y[i] = py; i++; }
    }
  }
}

export function setVelocity(s, i, dist, kT = 1) {
  const r = s.rng;
  if (dist === 'angle') { const th = 2 * Math.PI * r(); s.vx[i] = Math.cos(th); s.vy[i] = Math.sin(th); }
  else if (dist === 'vxvy') { const a = 2 * r() - 1, th = 2 * Math.PI * r(); s.vx[i] = a * Math.cos(th); s.vy[i] = a * Math.sin(th); }
  else if (dist === 'vyRandomVxFixed') { const a = 2 * r() - 1, th = 2 * Math.PI * r(); s.vx[i] = 1; s.vy[i] = a * Math.sin(th); }
  else if (dist === 'maxwell') { const sd = Math.sqrt(kT / s.mass[i]); s.vx[i] = sd * gaussian(r); s.vy[i] = sd * gaussian(r); }
  else { s.vx[i] = 1; s.vy[i] = 1; }
}

// kT in 2D equals the mean kinetic energy per particle (two quadratic degrees of freedom).
export function kineticTemperature(s) {
  let e = 0;
  for (let i = 0; i < s.N; i++) e += 0.5 * s.mass[i] * (s.vx[i] * s.vx[i] + s.vy[i] * s.vy[i]);
  return s.N ? e / s.N : 0;
}
export function kineticEnergy(s) { return kineticTemperature(s) * s.N; }
export function momentum(s) {
  let px = 0, py = 0;
  for (let i = 0; i < s.N; i++) { px += s.mass[i] * s.vx[i]; py += s.mass[i] * s.vy[i]; }
  return [px, py];
}
export function collisionsPerParticle(s) { return s.N ? 2 * s.ncol / s.N : 0; }

// Time until disks i and k touch, or Infinity.
export function pairCollisionTime(s, i, k) {
  const rx = s.x[k] - s.x[i], ry = s.y[k] - s.y[i];
  const vx = s.vx[k] - s.vx[i], vy = s.vy[k] - s.vy[i];
  const b = rx * vx + ry * vy;
  if (b >= 0) return Infinity;
  const v2 = vx * vx + vy * vy;
  if (v2 === 0) return Infinity;
  const sig = s.r[i] + s.r[k];
  const disc = b * b - v2 * (rx * rx + ry * ry - sig * sig);
  if (disc < 0) return Infinity;
  const t = (-b - Math.sqrt(disc)) / v2;
  return t < 0 ? 0 : t;
}

// Time until disk i hits a wall or the closed partition; returns [t, code].
export function wallCollisionTime(s, i) {
  const R = s.r[i];
  let t = Infinity, code = -1;
  const consider = (tt, c) => { tt = Math.max(0, tt); if (tt < t) { t = tt; code = c; } };
  if (s.vx[i] > 0) consider((s.Lx - R - s.x[i]) / s.vx[i], W_RIGHT); else if (s.vx[i] < 0) consider((R - s.x[i]) / s.vx[i], W_LEFT);
  if (s.vy[i] > 0) consider((s.Ly - R - s.y[i]) / s.vy[i], W_TOP); else if (s.vy[i] < 0) consider((R - s.y[i]) / s.vy[i], W_BOTTOM);
  const p = s.partition;
  if (p && !p.open) {
    if (s.x[i] < p.x && s.vx[i] > 0) consider((p.x - R - s.x[i]) / s.vx[i], W_PART_L);
    else if (s.x[i] > p.x && s.vx[i] < 0) consider((p.x + R - s.x[i]) / s.vx[i], W_PART_R);
  }
  return [t, code];
}

// Elastic collision of masses m_i, m_k along the line of centres.
export function collide(s, i, k) {
  let nx = s.x[k] - s.x[i], ny = s.y[k] - s.y[i];
  const d = Math.hypot(nx, ny);
  if (d === 0) return;
  nx /= d; ny /= d;
  const dv = (s.vx[i] - s.vx[k]) * nx + (s.vy[i] - s.vy[k]) * ny;
  if (dv <= 0) return;
  const mi = s.mass[i], mk = s.mass[k], fi = 2 * mk / (mi + mk), fk = 2 * mi / (mi + mk);
  s.vx[i] -= fi * dv * nx; s.vy[i] -= fi * dv * ny;
  s.vx[k] += fk * dv * nx; s.vy[k] += fk * dv * ny;
  s.ncol++;
}

// Wall interaction: specular reflection or thermal re-emission (flux-weighted
// Maxwellian: normal speed Rayleigh, tangential Gaussian at the wall's kT).
function hitWall(s, i, code) {
  const R = s.r[i], m = s.mass[i];
  const side = code === W_LEFT ? 'left' : code === W_RIGHT ? 'right' : code === W_BOTTOM ? 'bottom' : code === W_TOP ? 'top' : null;
  // Snap to contact to avoid drift.
  if (code === W_LEFT) s.x[i] = R; else if (code === W_RIGHT) s.x[i] = s.Lx - R;
  else if (code === W_BOTTOM) s.y[i] = R; else if (code === W_TOP) s.y[i] = s.Ly - R;
  else if (code === W_PART_L) s.x[i] = s.partition.x - R; else if (code === W_PART_R) s.x[i] = s.partition.x + R;
  const rule = side ? s.walls[side] : 'specular';
  const horizontal = code === W_LEFT || code === W_RIGHT || code === W_PART_L || code === W_PART_R;
  if (rule && typeof rule === 'object' && rule.thermal != null) {
    const kT = rule.thermal, sd = Math.sqrt(kT / m);
    const e0 = 0.5 * m * (s.vx[i] * s.vx[i] + s.vy[i] * s.vy[i]);
    const vn = sd * Math.sqrt(-2 * Math.log(1 - s.rng())); // Rayleigh (flux-weighted)
    const vt = sd * gaussian(s.rng);
    if (horizontal) { s.vx[i] = code === W_LEFT ? vn : -vn; s.vy[i] = vt; }
    else { s.vy[i] = code === W_BOTTOM ? vn : -vn; s.vx[i] = vt; }
    s.heat[side] += 0.5 * m * (s.vx[i] * s.vx[i] + s.vy[i] * s.vy[i]) - e0;
  } else if (horizontal) s.vx[i] = -s.vx[i]; else s.vy[i] = -s.vy[i];
  s.nwall++;
}

function advance(s, tau) {
  for (let i = 0; i < s.N; i++) { s.x[i] += s.vx[i] * tau; s.y[i] += s.vy[i] * tau; }
}

// Advance the system by dt resolving every event in time order.
export function step(s) {
  const N = s.N;
  const tEv = new Float64Array(N).fill(Infinity);
  const partner = new Int32Array(N).fill(-2);
  const wallCode = new Int8Array(N);
  const predict = (i) => {
    const [tw, code] = wallCollisionTime(s, i);
    tEv[i] = tw; partner[i] = -1; wallCode[i] = code;
    for (let k = 0; k < N; k++) {
      if (k === i) continue;
      const t = pairCollisionTime(s, i, k);
      if (t < tEv[i]) { tEv[i] = t; partner[i] = k; }
    }
  };
  for (let i = 0; i < N; i++) predict(i);
  let remaining = s.dt, guard = 0;
  while (guard++ < 100 * N + 100) {
    let imin = -1, tmin = remaining;
    for (let i = 0; i < N; i++) if (tEv[i] < tmin) { tmin = tEv[i]; imin = i; }
    if (imin < 0) break;
    advance(s, tmin); remaining -= tmin;
    for (let i = 0; i < N; i++) tEv[i] -= tmin;
    const k = partner[imin];
    if (k === -1) {
      hitWall(s, imin, wallCode[imin]);
      predict(imin);
      for (let j = 0; j < N; j++) if (partner[j] === imin) predict(j);
    } else {
      collide(s, imin, k);
      predict(imin); predict(k);
      for (let j = 0; j < N; j++) if (partner[j] === imin || partner[j] === k) predict(j);
    }
  }
  advance(s, remaining);
  s.t += s.dt;
}

export function openPartition(s) { if (s.partition) s.partition.open = true; }
export function closePartition(s) { if (s.partition) s.partition.open = false; }

// Particles left/right of x0 (default: the partition or the box middle).
export function countSide(s, x0 = s.partition?.x ?? s.Lx / 2) {
  let l = 0; for (let i = 0; i < s.N; i++) if (s.x[i] < x0) l++;
  return [l, s.N - l];
}

// Per-slab profile along x: mean kinetic energy per particle (= kT in 2D) and number density.
export function profile(s, bins = 10) {
  const T = new Float64Array(bins), n = new Float64Array(bins);
  for (let i = 0; i < s.N; i++) {
    const b = Math.min(bins - 1, Math.max(0, Math.floor(s.x[i] / s.Lx * bins)));
    n[b]++; T[b] += 0.5 * s.mass[i] * (s.vx[i] * s.vx[i] + s.vy[i] * s.vy[i]);
  }
  for (let b = 0; b < bins; b++) T[b] = n[b] ? T[b] / n[b] : NaN;
  const area = s.Lx / bins * s.Ly;
  return { T, n, rho: Float64Array.from(n, (v) => v / area) };
}

// Smallest centre distance between any two disks (for tests).
export function minDistance(s) {
  let dmin = Infinity;
  for (let i = 0; i < s.N; i++) for (let k = i + 1; k < s.N; k++) {
    const dx = s.x[i] - s.x[k], dy = s.y[i] - s.y[k];
    dmin = Math.min(dmin, Math.hypot(dx, dy) - (s.r[i] + s.r[k]) + 2 * s.radius);
  }
  return dmin; // equals centre distance when all radii equal s.radius
}
// Minimum gap between disk surfaces (negative = overlap).
export function minGap(s) {
  let g = Infinity;
  for (let i = 0; i < s.N; i++) for (let k = i + 1; k < s.N; k++) {
    g = Math.min(g, Math.hypot(s.x[i] - s.x[k], s.y[i] - s.y[k]) - (s.r[i] + s.r[k]));
  }
  return g;
}

export function speeds(s) {
  const v = new Float64Array(s.N);
  for (let i = 0; i < s.N; i++) v[i] = Math.hypot(s.vx[i], s.vy[i]);
  return v;
}

// 2D Maxwell speed distribution f(v) = (m v / kT) exp(-m v² / 2kT).
export function maxwell2D(v, kT, m = 1) { return (m * v / kT) * Math.exp(-m * v * v / (2 * kT)); }
export function maxwellBinCounts(N, kT, m, vmax, bins) {
  const out = new Float64Array(bins), dv = vmax / bins;
  const F = (v) => Math.exp(-m * v * v / (2 * kT));
  for (let b = 0; b < bins; b++) out[b] = N * (F(b * dv) - F((b + 1) * dv));
  return out;
}
export function vmaxFor(kT, m = 1) { return 4 * Math.sqrt(kT / m); }
