// Irreversibility and equilibrium fluctuations: free expansion of a hard-disk
// gas (shared engine) and the Ehrenfest "random model" (pick a particle at
// random and move it to the other half). Pure module.
import * as D from '../_kinetic/disks.js';
import { binomialPmf } from '../../lib/stats.js';

export const HISTORY_MAX = 20000;

export function createGas({ N = 20, kT = 1, L = 200, radius = 4, rng = Math.random } = {}) {
  const s = D.createGas({ N, L, radius, dist: 'maxwell', kT, rng, partition: { x: L / 2, open: false } });
  s.history = [difference(s)];
  s.kind = 'gas';
  return s;
}
export function stepGas(s) {
  if (!s.partition.open) D.openPartition(s);
  D.step(s);
  push(s, difference(s));
}

export function createEhrenfest({ N = 20, rng = Math.random } = {}) {
  const s = { kind: 'ehrenfest', N, left: N, t: 0, rng, history: [N] };
  return s;
}
export function stepEhrenfest(s) {
  // choose a particle uniformly: with probability left/N it is on the left
  if (s.rng() < s.left / s.N) s.left--; else s.left++;
  s.t++;
  push(s, 2 * s.left - s.N);
}

export function difference(s) {
  if (s.kind === 'ehrenfest') return 2 * s.left - s.N;
  const [l, r] = D.countSide(s);
  return l - r;
}
function push(s, d) { s.history.push(d); if (s.history.length > HISTORY_MAX) s.history.splice(0, HISTORY_MAX / 2); }

// Equilibrium distribution of Δ = n_left − n_right for N independent particles, p = 1/2.
// Returns { delta: Int32Array(N+1), p: Float64Array(N+1) } with delta[k] = 2k − N.
export function binomialDiff(N) {
  const delta = new Int32Array(N + 1), p = new Float64Array(N + 1);
  for (let k = 0; k <= N; k++) { delta[k] = 2 * k - N; p[k] = binomialPmf(k, N, 0.5); }
  return { delta, p };
}
export const sigmaDelta = (N) => Math.sqrt(N);
export const probAllOneSide = (N) => Math.pow(2, 1 - N);

// Histogram of a Δ series on the binomial support (ignores the initial transient `skip`).
export function histogramDiff(history, N, skip = 0) {
  const h = new Float64Array(N + 1); let n = 0;
  for (let i = skip; i < history.length; i++) { const k = (history[i] + N) / 2; if (k >= 0 && k <= N) { h[k]++; n++; } }
  if (n) for (let k = 0; k <= N; k++) h[k] /= n;
  return { h, n };
}
export function seriesStats(history, skip = 0) {
  let n = 0, m = 0, m2 = 0, big = 0;
  for (let i = skip; i < history.length; i++) { const d = history[i]; n++; m += d; m2 += d * d; }
  if (!n) return { n: 0, mean: NaN, sd: NaN, fracBeyond3: NaN };
  m /= n; const v = m2 / n - m * m;
  return { n, mean: m, sd: Math.sqrt(Math.max(0, v)), fracBeyond3: big / n };
}
// Fraction of samples with |Δ| > 3 sqrt(N) and fraction with |Δ| == N (all on one side).
export function tailFractions(history, N, skip = 0) {
  let n = 0, b3 = 0, all = 0;
  for (let i = skip; i < history.length; i++) { n++; const a = Math.abs(history[i]); if (a > 3 * Math.sqrt(N)) b3++; if (a === N) all++; }
  return n ? { beyond3: b3 / n, allOneSide: all / n } : { beyond3: NaN, allOneSide: NaN };
}
