// Cylindrical sound wave in an FHP lattice gas: a disk-shaped hole (zero
// density) is carved in a uniform gas; the rarefaction front propagates
// outward at the lattice sound speed c_s = sqrt(3/7).
import * as H from '../_fhp/fhp.js';

export function create({ nx = 200, ny = 200, f = 0.7, holeRadius = 12, rng = Math.random } = {}) {
  const L = H.createLattice(nx, ny);
  H.fillRandom(L, f, rng);
  const cx = nx / 2, cy = (ny / 2) * H.S3;
  for (const i of H.diskMask(L, cx, cy, holeRadius)) L.a[i] = 0;
  return { L, f, holeRadius, cx, cy, nx, ny, t: 0, avgRadial: null, avgStrip: null, nAvg: 0 };
}

export function step(s) { H.step(s.L, { periodicY: true }); s.t++; }

export function meanOccupation(s) { return H.particleCount(s.L) / (s.nx * s.ny); }

// Mean occupation per node (0..7) in rings of width dr around the hole centre.
export function radialProfile(s, dr = 1, rmax = Math.min(s.nx, s.ny * H.S3) / 2) {
  const nb = Math.ceil(rmax / dr);
  const sum = new Float64Array(nb), cnt = new Float64Array(nb);
  const { dens } = H.TABLES; const { nx, ny, a } = s.L;
  for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
    let dx = H.physX(ix, iy, nx) - s.cx; if (dx > nx / 2) dx -= nx; if (dx < -nx / 2) dx += nx;
    let dy = H.physY(iy) - s.cy; const Ly = ny * H.S3; if (dy > Ly / 2) dy -= Ly; if (dy < -Ly / 2) dy += Ly;
    const r = Math.hypot(dx, dy); const b = Math.floor(r / dr);
    if (b < nb) { sum[b] += dens[a[iy * nx + ix]]; cnt[b]++; }
  }
  const r = new Float64Array(nb), rho = new Float64Array(nb);
  for (let b = 0; b < nb; b++) { r[b] = (b + 0.5) * dr; rho[b] = cnt[b] ? sum[b] / cnt[b] : NaN; }
  return { r, rho };
}

// Mean occupation per node vs physical x, in a horizontal strip of ±halfWidth rows around the centre.
export function stripProfile(s, halfWidth = 20) {
  const { nx, ny, a } = s.L; const { dens } = H.TABLES;
  const sum = new Float64Array(nx), cnt = new Float64Array(nx);
  const iy0 = Math.floor(ny / 2);
  for (let iy = iy0 - halfWidth; iy <= iy0 + halfWidth; iy++) {
    const jy = (iy + ny) % ny;
    for (let ix = 0; ix < nx; ix++) { const b = Math.floor(H.physX(ix, jy, nx)); sum[b] += dens[a[jy * nx + ix]]; cnt[b]++; }
  }
  const x = new Float64Array(nx), rho = new Float64Array(nx);
  for (let b = 0; b < nx; b++) { x[b] = b + 0.5; rho[b] = cnt[b] ? sum[b] / cnt[b] : NaN; }
  return { x, rho };
}

// Radius of the rarefaction front: position of the density minimum outside the initial hole.
export function frontRadius(profile, rmin = 1) {
  let best = -1, bestV = Infinity;
  for (let b = 0; b < profile.r.length; b++) {
    if (profile.r[b] < rmin || Number.isNaN(profile.rho[b])) continue;
    if (profile.rho[b] < bestV) { bestV = profile.rho[b]; best = b; }
  }
  return best < 0 ? NaN : profile.r[best];
}

export const SOUND_SPEED = H.SOUND_SPEED;
