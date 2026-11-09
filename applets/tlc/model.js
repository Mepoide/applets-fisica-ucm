// Central limit theorem: sums S = Σ_{i=1}^N x_i of N i.i.d. variables (die 1–6,
// uniform [0,1], Bernoulli 0/1) accumulate in a histogram compared with the
// Gaussian of mean Nμ and variance Nσ². Pure module, injectable rng.
export const DISTS = {
  dice: { mean: 3.5, variance: 35 / 12, discrete: true, sample: (r) => 1 + Math.floor(r() * 6) },
  uniform: { mean: 0.5, variance: 1 / 12, discrete: false, sample: (r) => r() },
  bernoulli: { mean: 0.5, variance: 0.25, discrete: true, sample: (r) => (r() < 0.5 ? 0 : 1) },
};

export function create({ N = 10, dist = 'dice', bins = 60, rng = Math.random } = {}) {
  const d = DISTS[dist];
  const mu = N * d.mean, sd = Math.sqrt(N * d.variance);
  // Support: discrete sums take integer values; continuous sums are binned on [μ−5σ, μ+5σ].
  let lo, hi, nb, width;
  if (d.discrete) {
    const minV = N * (dist === 'dice' ? 1 : 0), maxV = N * (dist === 'dice' ? 6 : 1);
    lo = minV - 0.5; hi = maxV + 0.5; nb = maxV - minV + 1; width = 1;
  } else { lo = Math.max(0, mu - 5 * sd); hi = Math.min(N, mu + 5 * sd); nb = bins; width = (hi - lo) / nb; }
  return { N, dist, d, mu, sd, lo, hi, nb, width, counts: new Float64Array(nb), n: 0, rng, last: NaN };
}
export function sampleSum(s) { let S = 0; for (let i = 0; i < s.N; i++) S += s.d.sample(s.rng); return S; }
export function draw(s, k = 1) {
  for (let j = 0; j < k; j++) {
    const S = sampleSum(s); s.last = S;
    const b = Math.floor((S - s.lo) / s.width);
    if (b >= 0 && b < s.nb) { s.counts[b]++; s.n++; }
  }
}
export function reset(s) { s.counts.fill(0); s.n = 0; }
// Normalised histogram (probability density) and the CLT Gaussian density on bin centres.
export function density(s) {
  const x = new Float64Array(s.nb), p = new Float64Array(s.nb), g = new Float64Array(s.nb);
  for (let b = 0; b < s.nb; b++) {
    x[b] = s.lo + (b + 0.5) * s.width;
    p[b] = s.n ? s.counts[b] / (s.n * s.width) : 0;
    g[b] = gaussian(x[b], s.mu, s.sd);
  }
  return { x, p, g };
}
export function gaussian(x, mu, sd) { return Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)); }
// Sample mean and variance of the accumulated sums.
export function stats(s) {
  let m = 0, m2 = 0;
  for (let b = 0; b < s.nb; b++) { const x = s.lo + (b + 0.5) * s.width; m += s.counts[b] * x; m2 += s.counts[b] * x * x; }
  if (!s.n) return { mean: NaN, variance: NaN };
  m /= s.n; return { mean: m, variance: m2 / s.n - m * m };
}
// χ²/dof of counts vs Gaussian expectation (bins with expected ≥ 5).
export function chi2(s) {
  let c = 0, k = 0;
  for (let b = 0; b < s.nb; b++) {
    const x = s.lo + (b + 0.5) * s.width, e = s.n * gaussian(x, s.mu, s.sd) * s.width;
    if (e >= 5) { c += (s.counts[b] - e) ** 2 / e; k++; }
  }
  return k > 1 ? c / (k - 1) : NaN;
}
