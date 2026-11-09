// 2D Ising model (J = 1, periodic L×L) by Metropolis single-spin flips, and the exact Onsager
// results: T_c = 2/ln(1+√2) and spontaneous magnetisation m = (1 − sinh^{-4} 2K)^{1/8} for K > K_c.
export const TC = 2 / Math.log(1 + Math.SQRT2), KC = 1 / TC;

export function create({ L = 64, K = 0.5, init = 'random', rng = Math.random } = {}) {
  const s = new Int8Array(L * L);
  for (let i = 0; i < s.length; i++) s[i] = init === 'down' ? -1 : init === 'up' ? 1 : rng() < 0.5 ? 1 : -1;
  const st = { L, K, s, rng, t: 0, history: [] };
  st.history.push([0, magnetization(st)]);
  return st;
}
export function setK(st, K) { st.K = K; }
// One Monte Carlo sweep (L² random single-spin Metropolis attempts) with precomputed acceptance table.
export function sweep(st) {
  const { L, K, s, rng } = st, n = L * L;
  const w = [0, 0, 0, 0, 0, 0, 0, 0, 0]; for (let h = -4; h <= 4; h++) w[h + 4] = Math.exp(-2 * K * h);
  for (let k = 0; k < n; k++) {
    const i = Math.floor(rng() * n), x = i % L, y = (i - x) / L;
    const h = s[(y === 0 ? L - 1 : y - 1) * L + x] + s[(y === L - 1 ? 0 : y + 1) * L + x] + s[y * L + (x === 0 ? L - 1 : x - 1)] + s[y * L + (x === L - 1 ? 0 : x + 1)];
    const d = s[i] * h; // ΔE/2J
    if (d <= 0 || rng() < w[d + 4]) s[i] = -s[i];
  }
  st.t++;
  st.history.push([st.t, magnetization(st)]);
  if (st.history.length > 5000) st.history.splice(0, 2500);
}
export function magnetization(st) { let m = 0; for (const v of st.s) m += v; return m / st.s.length; }
export function energyPerSpin(st) {
  const { L, s } = st; let e = 0;
  for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) e -= s[y * L + x] * (s[y * L + (x + 1) % L] + s[((y + 1) % L) * L + x]);
  return e / (L * L);
}
// Onsager spontaneous magnetisation (per spin, absolute value) for K > K_c; 0 above T_c.
export function onsagerM(K) { if (K <= KC) return 0; const sh = Math.sinh(2 * K); return Math.pow(1 - 1 / sh ** 4, 1 / 8); }
export function tcOf(K) { return 1 / K; }
