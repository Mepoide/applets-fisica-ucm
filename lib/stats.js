// Small statistics helpers shared by the applets. Pure functions, no DOM.

// Histogram with half-open bins [edge_i, edge_{i+1}); the last bin includes max.
export function histogram(values, min, max, bins) {
  const h = new Uint32Array(bins);
  const w = (max - min) / bins;
  for (const v of values) {
    if (v < min || v > max || Number.isNaN(v)) continue;
    let i = Math.floor((v - min) / w);
    if (i === bins) i = bins - 1;
    h[i]++;
  }
  return h;
}

// Lanczos approximation of ln Γ(x), x > 0. Relative error ~1e-15.
const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];
export function lgamma(x) {
  if (x < 0.5) {
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  }
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

export function lnFactorial(n) {
  return lgamma(n + 1);
}

export function poissonPmf(k, lambda) {
  if (lambda === 0) return k === 0 ? 1 : 0;
  return Math.exp(k * Math.log(lambda) - lambda - lnFactorial(k));
}

export function binomialPmf(k, n, p) {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const lnC = lnFactorial(n) - lnFactorial(k) - lnFactorial(n - k);
  return Math.exp(lnC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function mean(arr) {
  let s = 0;
  for (const v of arr) s += v;
  return arr.length ? s / arr.length : 0;
}

export function variance(arr) {
  const m = mean(arr);
  let s = 0;
  for (const v of arr) s += (v - m) * (v - m);
  return arr.length ? s / arr.length : 0;
}

// Normalized autocorrelation C(τ)/C(0) of a series for τ = 0..maxLag.
export function autocorrelation(series, maxLag) {
  const n = series.length;
  const m = mean(series);
  const out = new Float64Array(maxLag + 1);
  let c0 = 0;
  for (let i = 0; i < n; i++) c0 += (series[i] - m) ** 2;
  if (c0 === 0) {
    out.fill(1);
    return out;
  }
  for (let lag = 0; lag <= maxLag; lag++) {
    let c = 0;
    for (let i = 0; i + lag < n; i++) c += (series[i] - m) * (series[i + lag] - m);
    out[lag] = c / c0;
  }
  return out;
}

// Pearson chi-square statistic between observed counts and expected counts,
// merging bins with expected < minExpected into neighbours. Returns {chi2, dof}.
export function chiSquare(observed, expected, minExpected = 5) {
  const obs = [];
  const exp = [];
  let accO = 0, accE = 0;
  for (let i = 0; i < observed.length; i++) {
    accO += observed[i];
    accE += expected[i];
    if (accE >= minExpected) {
      obs.push(accO); exp.push(accE); accO = 0; accE = 0;
    }
  }
  if (accE > 0) {
    if (exp.length) { obs[obs.length - 1] += accO; exp[exp.length - 1] += accE; }
    else { obs.push(accO); exp.push(accE); }
  }
  let chi2 = 0;
  for (let i = 0; i < obs.length; i++) chi2 += (obs[i] - exp[i]) ** 2 / exp[i];
  return { chi2, dof: Math.max(1, obs.length - 1) };
}

// Upper-tail probability of chi-square with k dof: Q(k/2, x/2) via the
// regularized incomplete gamma (series + continued fraction).
export function chiSquareSurvival(x, k) {
  if (x <= 0) return 1;
  return 1 - regularizedGammaP(k / 2, x / 2);
}

export function regularizedGammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let sum = 1 / a, term = sum;
    for (let n = 1; n < 500; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
  }
  // Lentz continued fraction for Q, then P = 1 - Q.
  let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  return 1 - q;
}
