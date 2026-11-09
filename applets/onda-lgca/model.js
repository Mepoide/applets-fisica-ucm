// Cylindrical sound wave in an FHP lattice gas: a disk-shaped hole (zero
// density) is carved in a uniform gas; the rarefaction front propagates
// outward at the lattice sound speed c_s = sqrt(3/7).
import * as H from '../_fhp/fhp.js';
import { besselJ0, besselJ1 } from '../../lib/bessel.js';

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

export const transportFHP = H.transportFHP;

// Linear (acoustic) prediction for the cylindrical hole. The initial perturbation
// δn(r,0) = −n0 for r < R has Hankel transform F(k) = −n0·2πR J1(kR)/k; each mode
// oscillates as cos(c_s k t) and damps as exp(−Γ k² t), so
//   δn(r,t) = −n0 R ∫₀^∞ J1(kR) J0(kr) cos(c_s k t) e^{−Γ k² t} dk.
// Returns the predicted occupation n0 + δn on the radii `r` (n0 = 7f). Linear theory
// of an O(1) perturbation: shape and front position are meaningful, amplitude only roughly.
export function linearPrediction(s, r, t, { Gamma = transportFHP(s.f).Gamma, cs = SOUND_SPEED, nk = 600 } = {}) {
  const R = s.holeRadius, n0 = 7 * s.f;
  const kmax = 40 / R, dk = kmax / nk;
  const G = Math.max(Gamma, 0.02); // small floor smooths the truncation ripple at t = 0
  const out = new Float64Array(r.length);
  const w = new Float64Array(nk + 1);
  for (let j = 0; j <= nk; j++) { const k = j * dk; w[j] = (j === 0 || j === nk ? 0.5 : 1) * dk * besselJ1(k * R) * Math.cos(cs * k * t) * Math.exp(-G * k * k * t); }
  for (let i = 0; i < r.length; i++) {
    let acc = 0;
    for (let j = 1; j <= nk; j++) acc += w[j] * besselJ0(j * dk * r[i]);
    out[i] = n0 - n0 * R * acc;
  }
  return out;
}

// Position of the minimum of a predicted/measured profile beyond rmin.
export function profileMinimum(r, rho, rmin = 1) {
  let best = -1, bv = Infinity;
  for (let i = 0; i < r.length; i++) if (r[i] >= rmin && !Number.isNaN(rho[i]) && rho[i] < bv) { bv = rho[i]; best = i; }
  return best < 0 ? NaN : r[best];
}
