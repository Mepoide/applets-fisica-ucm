// Madelung constant of the NaCl structure by direct summation over cubes of side 2k (reference
// ion at the origin): naive partial sums and Evjen's neutral-cube sums (face 1/2, edge 1/4, corner 1/8).
export const EXACT = 1.7475645946;

function term(l, m, n) { return ((l + m + n) % 2 === 0 ? -1 : 1) / Math.sqrt(l * l + m * m + n * n); }

// Partial sum over the cube |l|,|m|,|n| ≤ k (all ions fully counted).
export function naiveSum(k) {
  let s = 0;
  for (let l = -k; l <= k; l++) for (let m = -k; m <= k; m++) for (let n = -k; n <= k; n++) { if (!l && !m && !n) continue; s += term(l, m, n); }
  return s;
}
// Evjen: ions on the cube surface weighted by the fraction of the ion inside the cube.
export function evjenSum(k) {
  let s = 0;
  for (let l = -k; l <= k; l++) for (let m = -k; m <= k; m++) for (let n = -k; n <= k; n++) {
    if (!l && !m && !n) continue;
    const onFace = (Math.abs(l) === k ? 1 : 0) + (Math.abs(m) === k ? 1 : 0) + (Math.abs(n) === k ? 1 : 0);
    s += term(l, m, n) / 2 ** onFace;
  }
  return s;
}
export function series(kmax, fn) { const out = []; for (let k = 1; k <= kmax; k++) out.push(fn(k)); return out; }
// Net charge enclosed by the naive cube (in units of e): alternates ±1, the reason the naive sum oscillates.
export function naiveCharge(k) { let q = 0; for (let l = -k; l <= k; l++) for (let m = -k; m <= k; m++) for (let n = -k; n <= k; n++) q += (l + m + n) % 2 === 0 ? 1 : -1; return q; }
