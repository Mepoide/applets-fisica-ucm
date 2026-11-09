// FHP lattice-gas cellular automaton on a hexagonal lattice with one rest
// particle per node (7 bits). Shared by the sound-wave and Von Kármán applets.
//
// Node state: bit 0 = rest particle, bits 1..6 = particle moving along
// direction k. The lattice is stored skewed: node (ix, iy) sits at physical
// position x = ix - iy/2, y = iy * sqrt(3)/2. With that convention the unit
// velocities are
//   c1 = ( 1,  0)      c4 = (-1,  0)
//   c2 = ( 1/2,  s)    c5 = (-1/2, -s)      s = sqrt(3)/2
//   c3 = (-1/2,  s)    c6 = ( 1/2, -s)
// and a particle with direction k at (ix,iy) moves to (ix,iy) + D[k] in index
// space, D = [(0,0),(1,0),(1,1),(0,1),(-1,0),(-1,-1),(0,-1)].
// Collision tables are the ones from the 2003 applets (two-body head-on with
// both chiralities alternating between sub-steps, three-body symmetric,
// rest + mover -> two movers at ±60°, and their particle-hole duals).

export const S3 = Math.sqrt(3) / 2;
export const CX = [0, 1, 0.5, -0.5, -1, -0.5, 0.5];
export const CY = [0, 0, S3, S3, 0, -S3, -S3];
export const DIX = [0, 1, 1, 0, -1, -1, 0];
export const DIY = [0, 0, 1, 1, 0, -1, -1];
export const OPP = [0, 4, 5, 6, 1, 2, 3];          // bounce-back
export const MIRROR_Y = [0, 1, 6, 5, 4, 3, 2];     // specular reflection on a horizontal wall
export const NSTATES = 128;

export function buildTables() {
  const dens = new Uint8Array(NSTATES), vx = new Float64Array(NSTATES), vy = new Float64Array(NSTATES);
  for (let s = 0; s < NSTATES; s++) for (let k = 0; k < 7; k++) if (s & (1 << k)) { dens[s]++; vx[s] += CX[k]; vy[s] += CY[k]; }
  const coll1 = new Uint8Array(NSTATES); for (let s = 0; s < NSTATES; s++) coll1[s] = s;
  const swap = (t, a, b) => { t[a] = b; t[b] = a; };
  // rest + mover k -> movers k-1, k+1 (momentum conserved, energy not: FHP-II style)
  swap(coll1, 3, 68); swap(coll1, 5, 10); swap(coll1, 9, 20); swap(coll1, 17, 40); swap(coll1, 33, 80); swap(coll1, 65, 34);
  // three-body symmetric
  swap(coll1, 42, 84);
  // particle-hole duals of the above
  swap(coll1, 127 - 3, 127 - 68); swap(coll1, 127 - 5, 127 - 10); swap(coll1, 127 - 9, 127 - 20);
  swap(coll1, 127 - 17, 127 - 40); swap(coll1, 127 - 33, 127 - 80); swap(coll1, 127 - 65, 127 - 34); swap(coll1, 127 - 42, 127 - 84);
  const coll2 = Uint8Array.from(coll1);
  // head-on two-body collisions: rotate by +60° (coll1) or -60° (coll2); with and without rest spectator; and duals
  const cyc = (t, a, b, c) => { t[a] = b; t[b] = c; t[c] = a; };
  cyc(coll1, 36, 18, 72); cyc(coll1, 37, 19, 73); cyc(coll1, 127 - 36, 127 - 18, 127 - 72); cyc(coll1, 127 - 37, 127 - 19, 127 - 73);
  cyc(coll2, 36, 72, 18); cyc(coll2, 37, 73, 19); cyc(coll2, 127 - 36, 127 - 72, 127 - 18); cyc(coll2, 127 - 37, 127 - 73, 127 - 19);
  return { coll1, coll2, dens, vx, vy };
}

export const TABLES = buildTables();

export function createLattice(nx, ny) { return { nx, ny, a: new Uint8Array(nx * ny), b: new Uint8Array(nx * ny), solid: null, t: 0 }; }

// Fill with density f in [0,1] per channel (7 channels per node), skipping solid nodes.
export function fillRandom(L, f, rng = Math.random) {
  const { nx, ny, a, solid } = L;
  for (let i = 0; i < nx * ny; i++) {
    if (solid && solid[i]) { a[i] = 0; continue; }
    let s = 0; for (let k = 0; k < 7; k++) if (rng() < f) s |= 1 << k;
    a[i] = s;
  }
}

// One propagation + collision sub-step from L.a into L.b, then swap.
// opts.periodicY: wrap in y (x always wraps). If false, nothing enters from
// outside and particles leaving through y boundaries are lost (the caller
// handles inflow/outflow). opts.wallRule: 'bounceback' | 'specular' for solid nodes.
export function step(L, opts = {}) {
  const { nx, ny, a: src, b: dst, solid } = L;
  const table = (L.t & 1) ? TABLES.coll2 : TABLES.coll1;
  const periodicY = opts.periodicY ?? true;
  const refl = opts.wallRule === 'specular' ? MIRROR_Y : OPP;
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      let s = src[iy * nx + ix] & 1; // rest particle stays
      for (let k = 1; k <= 6; k++) {
        // particle arriving with direction k came from node - D[k]
        let jx = ix - DIX[k], jy = iy - DIY[k];
        if (jx < 0) jx += nx; else if (jx >= nx) jx -= nx;
        if (jy < 0 || jy >= ny) { if (!periodicY) continue; jy = (jy + ny) % ny; }
        if (src[jy * nx + jx] & (1 << k)) s |= 1 << k;
      }
      const i = iy * nx + ix;
      if (solid && solid[i]) {
        // reflect every incoming mover; rest bit never set on walls
        let r = 0;
        for (let k = 1; k <= 6; k++) if (s & (1 << k)) r |= 1 << refl[k];
        dst[i] = r;
      } else {
        dst[i] = table[s];
      }
    }
  }
  L.a = dst; L.b = src; L.t++;
}

export function particleCount(L) { let n = 0; const d = TABLES.dens; for (let i = 0; i < L.nx * L.ny; i++) n += d[L.a[i]]; return n; }
export function totalMomentum(L) {
  let px = 0, py = 0; const { vx, vy } = TABLES;
  for (let i = 0; i < L.nx * L.ny; i++) { px += vx[L.a[i]]; py += vy[L.a[i]]; }
  return [px, py];
}

// Coarse-grain into boxes of `box` × `box` nodes: density per node and mean
// velocity per particle (float). Returns {bx, by, rho, ux, uy, n}.
export function coarseGrain(L, box) {
  const bx = Math.floor(L.nx / box), by = Math.floor(L.ny / box);
  const rho = new Float64Array(bx * by), ux = new Float64Array(bx * by), uy = new Float64Array(bx * by), n = new Float64Array(bx * by);
  const { dens, vx, vy } = TABLES;
  for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
    let m = 0, px = 0, py = 0, cells = 0;
    for (let yy = 0; yy < box; yy++) for (let xx = 0; xx < box; xx++) {
      const idx = (j * box + yy) * L.nx + i * box + xx;
      if (L.solid && L.solid[idx]) continue;
      const s = L.a[idx]; m += dens[s]; px += vx[s]; py += vy[s]; cells++;
    }
    const k = j * bx + i;
    n[k] = m; rho[k] = cells ? m / cells : 0;
    ux[k] = m ? px / m : 0; uy[k] = m ? py / m : 0;
  }
  return { bx, by, rho, ux, uy, n };
}

// Physical coordinates of node (ix, iy), with the x wrap folded into [0, nx).
export function physX(ix, iy, nx) { let x = ix - iy / 2; x %= nx; if (x < 0) x += nx; return x; }
export function physY(iy) { return iy * S3; }

// Set of node indices inside a physical-space disk centred at (cx, cy), radius r.
export function diskMask(L, cx, cy, r) {
  const out = [];
  for (let iy = 0; iy < L.ny; iy++) for (let ix = 0; ix < L.nx; ix++) {
    let dx = physX(ix, iy, L.nx) - cx; if (dx > L.nx / 2) dx -= L.nx; if (dx < -L.nx / 2) dx += L.nx;
    const dy = physY(iy) - cy;
    if (dx * dx + dy * dy < r * r) out.push(iy * L.nx + ix);
  }
  return out;
}

// Sound speed of the 7-state model in lattice units per step: c_s² = (6/7)(1/2).
export const SOUND_SPEED = Math.sqrt(3 / 7);
