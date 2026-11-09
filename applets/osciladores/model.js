// N independent oscillators θ_i(t) = θ_i(0) + ω_i t on the unit circle. The
// circle is split in M sectors; the macrostate is the occupation fraction f_k
// and its entropy S = −Σ f_k ln f_k (max ln M). Incommensurable frequencies →
// ergodic → S grows to ln M; equispaced (commensurable) → periodic recurrence.
export const FREQS = ['random', 'nearEqual', 'equispaced'];
export const PHASES = ['zero', 'random'];

export function create({ N = 200, M = 12, freqs = 'random', phases = 'zero', omega0 = 1, rng = Math.random } = {}) {
  const omega = new Float64Array(N), theta0 = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    if (freqs === 'random') omega[i] = omega0 * (0.5 + rng());
    else if (freqs === 'nearEqual') omega[i] = omega0 * (1 + 0.02 * (rng() - 0.5));
    else omega[i] = omega0 * (i + 1) / N; // equispaced: ω_i = ω0 i/N, all multiples of ω0/N
    theta0[i] = phases === 'random' ? 2 * Math.PI * rng() : 0;
  }
  const s = { N, M, freqs, phases, omega0, omega, theta0, theta: Float64Array.from(theta0), t: 0, history: [] };
  s.history.push([0, entropy(s)]);
  return s;
}
export function step(s, dt = 0.05) {
  s.t += dt;
  for (let i = 0; i < s.N; i++) { let th = s.theta0[i] + s.omega[i] * s.t; th %= 2 * Math.PI; if (th < 0) th += 2 * Math.PI; s.theta[i] = th; }
  s.history.push([s.t, entropy(s)]);
  if (s.history.length > 20000) s.history.splice(0, 10000);
}
export function occupation(s) {
  const f = new Float64Array(s.M);
  for (let i = 0; i < s.N; i++) f[Math.min(s.M - 1, Math.floor(s.theta[i] / (2 * Math.PI) * s.M))]++;
  for (let k = 0; k < s.M; k++) f[k] /= s.N;
  return f;
}
export function entropy(s) {
  let S = 0; for (const f of occupation(s)) if (f > 0) S -= f * Math.log(f);
  return S;
}
export const maxEntropy = (M) => Math.log(M);
// Recurrence time of the equispaced set: all ω_i are multiples of ω0/N → T = 2πN/ω0.
export function recurrenceTime(s) { return s.freqs === 'equispaced' ? 2 * Math.PI * s.N / s.omega0 : Infinity; }
// Expected equilibrium entropy of N balls in M boxes (finite-N correction ≈ (M−1)/(2N)).
export function expectedEntropy(N, M) { return Math.log(M) - (M - 1) / (2 * N); }
