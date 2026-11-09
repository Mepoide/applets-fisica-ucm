// Maginu reaction–diffusion model (two species):
//   ∂t c1 = c1 − c1³/3 − c2 + D ∇²c1
//   ∂t c2 = (c1 − k c2)/c + D ∇²c2
// Macroscopic ODE (RK4) for the homogeneous system, and a stochastic cellular
// automaton: integer particle numbers per cell, diffusion by random exchange
// with a neighbour, reaction by Poisson-distributed increments (τ-leaping).
// The scale parameter s sets the diffusion/reaction ratio: larger s, more
// diffusion per reaction (homogeneous limit); small s, local incoherent patches.

export const PARAMS = { k: 0.9, c: 2.0 };
export const CMAX = 3; // concentration range represented by nmax particles: c = CMAX·(n/nmax) − CMAX/2 ... see below

// Concentrations are signed (the limit cycle lives around 0): c_i = (n_i − nmax/2)·(2 CMAX/nmax).
export function toConc(n, nmax) { return (n - nmax / 2) * (2 * CMAX / nmax); }
export function toCount(cv, nmax) { return cv / (2 * CMAX / nmax) + nmax / 2; }

export function rhs(c1, c2, p = PARAMS) {
  return [c1 - c1 * c1 * c1 / 3 - c2, (c1 - p.k * c2) / p.c];
}
export function odeStep(c1, c2, dt, p = PARAMS) {
  const f = (a, b) => rhs(a, b, p);
  const k1 = f(c1, c2), k2 = f(c1 + 0.5 * dt * k1[0], c2 + 0.5 * dt * k1[1]);
  const k3 = f(c1 + 0.5 * dt * k2[0], c2 + 0.5 * dt * k2[1]), k4 = f(c1 + dt * k3[0], c2 + dt * k3[1]);
  return [c1 + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), c2 + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
}
// Integrate from (c1, c2) and return the trajectory of the last `keep` time units after `skip`.
export function limitCycle({ c1 = 0.5, c2 = 0.1, dt = 0.02, skip = 200, keep = 60, p = PARAMS } = {}) {
  let a = c1, b = c2;
  const n1 = Math.round(skip / dt), n2 = Math.round(keep / dt);
  for (let i = 0; i < n1; i++) [a, b] = odeStep(a, b, dt, p);
  const x = new Float64Array(n2), y = new Float64Array(n2);
  for (let i = 0; i < n2; i++) { x[i] = a; y[i] = b; [a, b] = odeStep(a, b, dt, p); }
  return { c1: x, c2: y };
}
// Period of the limit cycle from successive upward zero crossings of c1.
export function cyclePeriod(cycle, dt = 0.02) {
  const t = [];
  for (let i = 1; i < cycle.c1.length; i++) if (cycle.c1[i - 1] < 0 && cycle.c1[i] >= 0) t.push(i * dt);
  if (t.length < 2) return NaN;
  return (t[t.length - 1] - t[0]) / (t.length - 1);
}

// ---- cellular automaton ----
// Poisson sample (Knuth for small means, normal approximation for large).
export function poisson(lambda, rng) {
  if (lambda <= 0) return 0;
  if (lambda > 30) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * gaussianOf(rng)));
  const L = Math.exp(-lambda); let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}
function gaussianOf(rng) { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

export function createCA({ nx = 60, ny = 60, s = 10, nmax = 32, dt = 0.1, p = PARAMS, rng = Math.random, init = 'random' } = {}) {
  const n1 = new Uint16Array(nx * ny), n2 = new Uint16Array(nx * ny);
  const mid = nmax / 2;
  for (let i = 0; i < nx * ny; i++) {
    if (init === 'random') { n1[i] = Math.round(mid + (rng() - 0.5) * nmax * 0.6); n2[i] = Math.round(mid + (rng() - 0.5) * nmax * 0.6); }
    else { n1[i] = Math.round(toCount(0.5, nmax)); n2[i] = Math.round(toCount(0.1, nmax)); }
  }
  const st = { nx, ny, s, nmax, dt, p, rng, n1, n2, t: 0, trail: [] };
  st.trail.push(meanConc(st));
  return st;
}

// One update: diffusion (s exchange sweeps) then reaction (τ-leaping with dt).
export function stepCA(st) {
  const { nx, ny, nmax, dt, p, rng } = st;
  for (let sweep = 0; sweep < st.s; sweep++) diffuse(st);
  const n1 = st.n1, n2 = st.n2;
  const scale = nmax / (2 * CMAX); // particles per unit concentration
  for (let i = 0; i < nx * ny; i++) {
    const c1 = toConc(n1[i], nmax), c2 = toConc(n2[i], nmax);
    const [f1, f2] = rhs(c1, c2, p);
    // signed increments: Poisson for the magnitude of expected change
    const d1 = f1 * dt * scale, d2 = f2 * dt * scale;
    const i1 = Math.sign(d1) * poisson(Math.abs(d1), rng), i2 = Math.sign(d2) * poisson(Math.abs(d2), rng);
    n1[i] = Math.max(0, Math.min(nmax, n1[i] + i1));
    n2[i] = Math.max(0, Math.min(nmax, n2[i] + i2));
  }
  st.t += dt;
  st.trail.push(meanConc(st));
  if (st.trail.length > 3000) st.trail.splice(0, 1500);
}

// Diffusion sweep: every cell exchanges a random fraction of its excess over the mean with a random neighbour
// (periodic boundaries). Conserves the total number of particles of each species exactly.
export function diffuse(st) {
  const { nx, ny, rng } = st;
  for (const n of [st.n1, st.n2]) {
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const i = y * nx + x;
      const dir = Math.floor(rng() * 4);
      const j = dir === 0 ? y * nx + (x + 1) % nx : dir === 1 ? y * nx + (x + nx - 1) % nx : dir === 2 ? ((y + 1) % ny) * nx + x : ((y + ny - 1) % ny) * nx + x;
      const diff = n[i] - n[j];
      if (diff === 0) continue;
      const move = Math.round(diff / 2 * rng()); // transfer up to half the difference
      n[i] -= move; n[j] += move;
    }
  }
}
export function totals(st) { let a = 0, b = 0; for (let i = 0; i < st.n1.length; i++) { a += st.n1[i]; b += st.n2[i]; } return [a, b]; }
export function meanConc(st) {
  const [a, b] = totals(st); const n = st.n1.length;
  return [toConc(a / n, st.nmax), toConc(b / n, st.nmax)];
}
// Pearson correlation between two series.
export function correlation(a, b) {
  const n = Math.min(a.length, b.length); let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { const da = a[i] - ma, db = b[i] - mb; sab += da * db; saa += da * da; sbb += db * db; }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
}
