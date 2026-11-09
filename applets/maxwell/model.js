// Hard disks in a 2D box with elastic collisions. Event-driven integration
// inside each fixed time step `dt` (Alder–Wainwright): every pair and wall
// collision is resolved at its exact time, so energy is conserved to round-off
// and disks never overlap. Pure module: no DOM, injectable rng.

export const DISTRIBUTIONS = ['angle', 'vxvy', 'vyRandomVxFixed', 'fixed'];

export function create({ N = 80, L = 200, radius = 4, dist = 'angle', m = 1, dt = 1, rng = Math.random } = {}) {
  const s = { N, L, radius, m, dt, dist, rng, t: 0, ncol: 0, nwall: 0,
    x: new Float64Array(N), y: new Float64Array(N), vx: new Float64Array(N), vy: new Float64Array(N) };
  placeDisks(s);
  for (let i = 0; i < N; i++) setVelocity(s, i, dist);
  s.kT0 = kineticTemperature(s);
  return s;
}

// Random non-overlapping placement by rejection; falls back to a hexagonal
// grid when the packing is too dense for rejection sampling to finish.
export function placeDisks(s) {
  const { N, L, radius: R, rng } = s;
  const lo = R, hi = L - R, d2 = 4 * R * R;
  let placed = 0;
  outer: for (let i = 0; i < N; i++) {
    for (let tries = 0; tries < 2000; tries++) {
      const px = lo + rng() * (hi - lo), py = lo + rng() * (hi - lo);
      let ok = true;
      for (let k = 0; k < i; k++) {
        const dx = s.x[k] - px, dy = s.y[k] - py;
        if (dx * dx + dy * dy < d2) { ok = false; break; }
      }
      if (ok) { s.x[i] = px; s.y[i] = py; placed++; continue outer; }
    }
    break;
  }
  if (placed < N) {
    // Hexagonal grid with spacing 2R·1.05, filled row by row.
    const a = 2 * R * 1.05, rowH = a * Math.sqrt(3) / 2;
    let i = 0;
    for (let row = 0; i < N; row++) {
      const py = lo + rowH * row;
      if (py > hi) throw new Error('Too many disks for the box');
      const off = (row % 2) * a / 2;
      for (let px = lo + off; px <= hi && i < N; px += a) { s.x[i] = px; s.y[i] = py; i++; }
    }
  }
}

export function setVelocity(s, i, dist) {
  const r = s.rng;
  if (dist === 'angle') { const th = 2 * Math.PI * r(); s.vx[i] = Math.cos(th); s.vy[i] = Math.sin(th); }
  else if (dist === 'vxvy') { const a = 2 * r() - 1, th = 2 * Math.PI * r(); s.vx[i] = a * Math.cos(th); s.vy[i] = a * Math.sin(th); }
  else if (dist === 'vyRandomVxFixed') { const a = 2 * r() - 1, th = 2 * Math.PI * r(); s.vx[i] = 1; s.vy[i] = a * Math.sin(th); }
  else { s.vx[i] = 1; s.vy[i] = 1; }
}

// kT in 2D equals the mean kinetic energy per particle (two quadratic degrees of freedom).
export function kineticTemperature(s) {
  let e = 0;
  for (let i = 0; i < s.N; i++) e += s.vx[i] * s.vx[i] + s.vy[i] * s.vy[i];
  return 0.5 * s.m * e / s.N;
}
export function kineticEnergy(s) { return kineticTemperature(s) * s.N; }
export function momentum(s) {
  let px = 0, py = 0;
  for (let i = 0; i < s.N; i++) { px += s.vx[i]; py += s.vy[i]; }
  return [s.m * px, s.m * py];
}
export function collisionsPerParticle(s) { return s.N ? 2 * s.ncol / s.N : 0; }

// Time until disks i and k touch, or Infinity.
export function pairCollisionTime(s, i, k) {
  const rx = s.x[k] - s.x[i], ry = s.y[k] - s.y[i];
  const vx = s.vx[k] - s.vx[i], vy = s.vy[k] - s.vy[i];
  const b = rx * vx + ry * vy;
  if (b >= 0) return Infinity; // separating
  const v2 = vx * vx + vy * vy;
  if (v2 === 0) return Infinity;
  const r2 = rx * rx + ry * ry, sigma2 = 4 * s.radius * s.radius;
  const disc = b * b - v2 * (r2 - sigma2);
  if (disc < 0) return Infinity;
  const t = (-b - Math.sqrt(disc)) / v2;
  return t < 0 ? 0 : t; // already overlapping and approaching: collide now
}

// Time until disk i hits a wall; returns [t, axis] with axis 0 = x, 1 = y.
export function wallCollisionTime(s, i) {
  const R = s.radius, L = s.L;
  let tx = Infinity, ty = Infinity;
  if (s.vx[i] > 0) tx = (L - R - s.x[i]) / s.vx[i]; else if (s.vx[i] < 0) tx = (R - s.x[i]) / s.vx[i];
  if (s.vy[i] > 0) ty = (L - R - s.y[i]) / s.vy[i]; else if (s.vy[i] < 0) ty = (R - s.y[i]) / s.vy[i];
  tx = Math.max(0, tx); ty = Math.max(0, ty);
  return tx < ty ? [tx, 0] : [ty, 1];
}

// Elastic collision of equal masses: exchange the normal velocity components.
export function collide(s, i, k) {
  let nx = s.x[k] - s.x[i], ny = s.y[k] - s.y[i];
  const d = Math.hypot(nx, ny);
  if (d === 0) return;
  nx /= d; ny /= d;
  const dv = (s.vx[i] - s.vx[k]) * nx + (s.vy[i] - s.vy[k]) * ny;
  if (dv <= 0) return; // not approaching along the normal
  s.vx[i] -= dv * nx; s.vy[i] -= dv * ny;
  s.vx[k] += dv * nx; s.vy[k] += dv * ny;
  s.ncol++;
}

function advance(s, tau) {
  for (let i = 0; i < s.N; i++) { s.x[i] += s.vx[i] * tau; s.y[i] += s.vy[i] * tau; }
}

// Advance the system by dt resolving every event in time order.
// Each event costs O(N) to refresh the two partners' predictions.
export function step(s) {
  const N = s.N;
  // Per-particle next event: time, partner (>=0) or -1 for wall (axis stored in wallAxis).
  const tEv = new Float64Array(N).fill(Infinity);
  const partner = new Int32Array(N).fill(-2);
  const wallAxis = new Int8Array(N);
  const predict = (i) => {
    const [tw, ax] = wallCollisionTime(s, i);
    tEv[i] = tw; partner[i] = -1; wallAxis[i] = ax;
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
      if (wallAxis[imin] === 0) { s.vx[imin] = -s.vx[imin]; s.x[imin] = s.vx[imin] > 0 ? s.radius : s.L - s.radius; }
      else { s.vy[imin] = -s.vy[imin]; s.y[imin] = s.vy[imin] > 0 ? s.radius : s.L - s.radius; }
      s.nwall++;
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

// Smallest centre distance between any two disks (for tests).
export function minDistance(s) {
  let d2min = Infinity;
  for (let i = 0; i < s.N; i++) for (let k = i + 1; k < s.N; k++) {
    const dx = s.x[i] - s.x[k], dy = s.y[i] - s.y[k];
    d2min = Math.min(d2min, dx * dx + dy * dy);
  }
  return Math.sqrt(d2min);
}

export function speeds(s) {
  const v = new Float64Array(s.N);
  for (let i = 0; i < s.N; i++) v[i] = Math.hypot(s.vx[i], s.vy[i]);
  return v;
}

// 2D Maxwell speed distribution f(v) = (m v / kT) exp(-m v² / 2kT).
export function maxwell2D(v, kT, m = 1) { return (m * v / kT) * Math.exp(-m * v * v / (2 * kT)); }

// Expected counts per bin for N particles: N [F(v1) - F(v2)], F(v) = exp(-m v²/2kT).
export function maxwellBinCounts(N, kT, m, vmax, bins) {
  const out = new Float64Array(bins), dv = vmax / bins;
  const F = (v) => Math.exp(-m * v * v / (2 * kT));
  for (let b = 0; b < bins; b++) out[b] = N * (F(b * dv) - F((b + 1) * dv));
  return out;
}

// Histogram axis limit: P(v > 4 sqrt(kT/m)) = e^-8 ≈ 3e-4.
export function vmaxFor(kT, m = 1) { return 4 * Math.sqrt(kT / m); }
