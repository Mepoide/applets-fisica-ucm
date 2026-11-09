// Band structure of the Mathieu potential V(x) = V0 cos(2x) (period π, units ħ²/2m = 1, energies
// in Rydberg) by the plane-wave method: for crystal momentum k in the first Brillouin zone
// [−1, 1], the Hamiltonian in the basis e^{i(k + 2l)x}, l = −M..M, is tridiagonal with
// diagonal (k + 2l)² and off-diagonal V0/2. Eigenvalues give E_j(k).
import { tridiagEigenvalues } from '../../lib/linalg.js';

export function bands(V0, M, ks) {
  const n = 2 * M + 1, out = ks.map(() => null);
  for (let i = 0; i < ks.length; i++) {
    const d = new Float64Array(n), e = new Float64Array(n - 1).fill(V0 / 2);
    for (let l = -M; l <= M; l++) d[l + M] = (ks[i] + 2 * l) ** 2;
    out[i] = tridiagEigenvalues(d, e);
  }
  return out; // out[i][j] = E_j(k_i)
}
// Nearly-free-electron gap at the zone boundary k = 1 (lowest gap): ΔE ≈ 2|V(2)| = V0.
export function nfeGap(V0) { return Math.abs(V0); }
// Gap at k = 1 between the two lowest bands.
export function firstGap(V0, M) { const b = bands(V0, M, [1])[0]; return b[1] - b[0]; }
// Potential sampled over one period for drawing.
export function potential(V0, n = 200) { const xs = [], vs = []; for (let i = 0; i <= n; i++) { const x = -Math.PI / 2 + Math.PI * i / n; xs.push(x); vs.push(V0 * Math.cos(2 * x)); } return { xs, vs }; }
