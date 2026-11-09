// FHP lattice-gas flow past a flat plate perpendicular to the stream.
// The stream runs along -y (top to bottom in lattice coordinates, as in the
// 2003 applet); the view rotates it to flow left -> right. The lattice is
// periodic in both directions; an inflow zone of a few rows is re-sampled
// every step from the equilibrium distribution at density f and velocity u,
// which drives the flow and also acts as the downstream medium for the
// outlet (no vacuum suction). The plate is a row of solid nodes handled with
// bounce-back (no-slip) or specular (slip) reflection in every sub-step.
import * as H from '../_fhp/fhp.js';

export function create({ nx = 160, ny = 400, f = 0.25, u = 0.2, plateLen = 40, plateFrac = 0.7, wallRule = 'bounceback', inflowRows = 3, rng = Math.random } = {}) {
  const L = H.createLattice(nx, ny);
  L.solid = new Uint8Array(nx * ny);
  const plateY = Math.round(ny * plateFrac);
  const x0 = Math.round((nx - plateLen) / 2);
  for (let ix = x0; ix < x0 + plateLen; ix++) L.solid[plateY * nx + ix] = 1;
  const s = { L, nx, ny, f, u, plateLen, plateY, plateX0: x0, wallRule, inflowRows, rng, t: 0 };
  // start from the inflow equilibrium everywhere
  for (let iy = 0; iy < ny; iy++) sampleRow(s, iy);
  return s;
}

// Channel occupation probabilities for equilibrium at density f and velocity (0, -u):
// f_k = f (1 + a c_k·(-ŷ)), with mean velocity per particle u = 3a/7 (6 movers + rest).
export function channelProbabilities(f, u) {
  const a = Math.min(1, Math.max(-1, (7 / 3) * u));
  const p = new Float64Array(7);
  for (let k = 0; k < 7; k++) p[k] = Math.min(1, Math.max(0, f * (1 + a * (-H.CY[k]) / H.S3 * H.S3))); // c_k·(-ŷ) = -CY[k]
  return p;
}
export function meanVelocityOf(p) {
  let m = 0, vy = 0; for (let k = 0; k < 7; k++) { m += p[k]; vy += p[k] * H.CY[k]; }
  return m ? -vy / m : 0; // speed along -y
}

function sampleRow(s, iy) {
  const p = channelProbabilities(s.f, s.u); const { nx, a, solid } = s.L;
  for (let ix = 0; ix < nx; ix++) {
    const i = iy * nx + ix; if (solid[i]) continue;
    let st = 0; for (let k = 0; k < 7; k++) if (s.rng() < p[k]) st |= 1 << k;
    a[i] = st;
  }
}

export function step(s) {
  H.step(s.L, { periodicY: true, wallRule: s.wallRule });
  for (let r = 0; r < s.inflowRows; r++) sampleRow(s, s.ny - 1 - r);
  s.t++;
}

export function particleCount(s) { return H.particleCount(s.L); }

// Coarse-grained field in boxes of `box` nodes; velocities as (along-stream, cross-stream)
// = (-uy, ux) so that the view can draw the flow left -> right.
export function velocityField(s, box = 8) {
  const g = H.coarseGrain(s.L, box);
  const n = g.bx * g.by;
  const along = new Float64Array(n), cross = new Float64Array(n);
  for (let k = 0; k < n; k++) { along[k] = -g.uy[k]; cross[k] = g.ux[k]; }
  return { bx: g.bx, by: g.by, rho: g.rho, along, cross, box };
}

// Vorticity ω = ∂(cross)/∂(along-axis) − ∂(along)/∂(cross-axis) by centred differences on the box grid.
export function vorticity(F) {
  const { bx, by, along, cross } = F;
  const w = new Float64Array(bx * by);
  for (let j = 1; j < by - 1; j++) for (let i = 1; i < bx - 1; i++) {
    const k = j * bx + i;
    // along-axis index is j (stream goes from high j to low j => s = -j); cross axis is i
    const dCross_ds = -(cross[(j + 1) * bx + i] - cross[(j - 1) * bx + i]) / 2;
    const dAlong_dc = (along[j * bx + i + 1] - along[j * bx + i - 1]) / 2;
    w[k] = dCross_ds - dAlong_dc;
  }
  return w;
}

// Mean along-stream velocity in a band of rows (for tests / readout).
export function meanAlongVelocity(s, iy0, iy1) {
  const { nx, a, solid } = s.L; const { dens, vy } = H.TABLES;
  let m = 0, p = 0;
  for (let iy = iy0; iy < iy1; iy++) for (let ix = 0; ix < nx; ix++) { const i = iy * nx + ix; if (solid[i]) continue; m += dens[a[i]]; p += vy[a[i]]; }
  return m ? -p / m : 0;
}

// Reference transport coefficients of 7-bit FHP models (Frisch et al. 1987), d = f.
export const galileanFactor = H.galileanFactor;
export const viscosityFHP3 = H.viscosityFHP3;
export function reynolds(s) { const nu = viscosityFHP3(s.f); return nu > 0 ? galileanFactor(s.f) * s.u * s.plateLen / nu : NaN; }
