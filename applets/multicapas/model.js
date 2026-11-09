// Normal-incidence reflectivity of a multilayer of N layers with complex refractive indices
// n_k = 1 − δ_k + iβ_k and thicknesses d_k by Rouard's recursive method:
//   r_k = (n_{k−1} − n_k)/(n_{k−1} + n_k)  (Fresnel at the interface k−1|k, n_0 = n_{N+1} = 1),
//   f_N = (r_N + r_{N+1} e^{2iμ_N})/(1 + r_N r_{N+1} e^{2iμ_N}),  μ_k = 2π n_k d_k/λ,
//   f_{k−1} = (r_{k−1} + f_k e^{2iμ_{k−1}})/(1 + r_{k−1} f_k e^{2iμ_{k−1}}),  R = |f_1|².
// Wavelength and thicknesses in the same units (Å).
const C = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
  exp: (a) => { const e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; },
  abs2: (a) => a[0] * a[0] + a[1] * a[1],
};
// layers: array of { n: [re, im], d } from top (k = 1) to bottom (k = N); substrate index nSub (default vacuum).
export function reflectivity(layers, lambda, nSub = [1, 0]) {
  const N = layers.length, idx = (k) => (k === 0 ? [1, 0] : k === N + 1 ? nSub : layers[k - 1].n);
  const fresnel = (k) => C.div(C.sub(idx(k - 1), idx(k)), C.add(idx(k - 1), idx(k)));
  let f = fresnel(N + 1); // reflection at the bottom interface (layer N | substrate)
  for (let k = N; k >= 1; k--) {
    const mu = C.mul([2 * Math.PI * layers[k - 1].d / lambda, 0], idx(k));
    const ph = C.exp([-2 * mu[1], 2 * mu[0]]); // e^{2iμ}
    const rk = fresnel(k);
    f = C.div(C.add(rk, C.mul(f, ph)), C.add([1, 0], C.mul(rk, C.mul(f, ph))));
  }
  return C.abs2(f);
}
// Periodic multilayer: N pairs of (δ1, β1, d1) / (δ2, β2, d2).
export function periodicStack(pairs, a, b) { const out = []; for (let i = 0; i < pairs; i++) { out.push({ n: [1 - a.delta, a.beta], d: a.d }); out.push({ n: [1 - b.delta, b.beta], d: b.d }); } return out; }
// First-order Bragg wavelength at normal incidence: λ_B = 2 (n1 d1 + n2 d2) (optical period).
export function braggWavelength(a, b) { return 2 * ((1 - a.delta) * a.d + (1 - b.delta) * b.d); }
export function spectrum(layers, lambdas, nSub) { return lambdas.map((l) => reflectivity(layers, l, nSub)); }
