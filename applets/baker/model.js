// Area-preserving maps of the unit square: the baker's transformation and
// Arnold's cat map (toral automorphism with an integer matrix of determinant 1).
// Point clouds (cat face, disk, random) are iterated; uniformity is measured
// by a χ² over a grid of boxes. Pure module, injectable rng.

export function baker(x, y) {
  const fx = 2 * x, k = Math.floor(fx);
  return [fx - k, (y + k) / 2];
}
export function arnold(x, y, T) {
  const [[a, b], [c, d]] = T;
  let u = a * x + b * y, v = c * x + d * y;
  u -= Math.floor(u); v -= Math.floor(v);
  return [u, v];
}
export function det(T) { return T[0][0] * T[1][1] - T[0][1] * T[1][0]; }
// Fourth element from det = 1 (may be non-integer; the map is then not a toral automorphism).
export function completeMatrix(a, b, c) { return [[a, b], [c, a === 0 ? NaN : (1 + b * c) / a]]; }
export function eigenvalues(T) {
  const tr = T[0][0] + T[1][1], dt = det(T), disc = tr * tr / 4 - dt;
  if (disc < 0) return { real: false, lp: NaN, lm: NaN, tr };
  const r = Math.sqrt(disc); return { real: true, lp: tr / 2 + r, lm: tr / 2 - r, tr };
}
export function lyapunov(T) { const e = eigenvalues(T); return e.real ? Math.log(Math.max(Math.abs(e.lp), Math.abs(e.lm))) : 0; }

// Point sets in the unit square.
export function cloud(n, rng = Math.random) { const x = new Float64Array(n), y = new Float64Array(n); for (let i = 0; i < n; i++) { x[i] = rng(); y[i] = rng(); } return { x, y }; }
export function disk(n, rng = Math.random, cx = 0.5, cy = 0.5, r = 0.3) {
  const x = new Float64Array(n), y = new Float64Array(n);
  for (let i = 0; i < n; i++) { const rr = r * Math.sqrt(rng()), th = 2 * Math.PI * rng(); x[i] = cx + rr * Math.cos(th); y[i] = cy + rr * Math.sin(th); }
  return { x, y };
}
// A cat face: head disk, two triangular ears, two eyes (holes), a mouth.
export function cat(n, rng = Math.random) {
  const x = [], y = [];
  const inHead = (px, py) => Math.hypot(px - 0.5, py - 0.45) < 0.3;
  const inEar = (px, py, sx) => { const bx = 0.5 + sx * 0.2, by = 0.68; return py > by - 0.02 && py < by + 0.22 && Math.abs(px - bx) < 0.09 * (1 - (py - by) / 0.22); };
  const inEye = (px, py) => Math.hypot(px - 0.4, py - 0.52) < 0.045 || Math.hypot(px - 0.6, py - 0.52) < 0.045;
  const inMouth = (px, py) => Math.abs(py - (0.3 - 0.25 * (px - 0.5) ** 2 * 4)) < 0.012 && Math.abs(px - 0.5) < 0.12;
  while (x.length < n) {
    const px = rng(), py = rng();
    if ((inHead(px, py) || inEar(px, py, -1) || inEar(px, py, 1)) && !inEye(px, py) && !inMouth(px, py)) { x.push(px); y.push(py); }
  }
  return { x: Float64Array.from(x), y: Float64Array.from(y) };
}
export function iterate(pts, map) {
  const { x, y } = pts;
  for (let i = 0; i < x.length; i++) { const [u, v] = map(x[i], y[i]); x[i] = u; y[i] = v; }
}
// χ²/dof of the point counts in a g×g grid against uniform occupation.
export function uniformityChi2(pts, g = 10) {
  const cnt = new Float64Array(g * g), n = pts.x.length;
  for (let i = 0; i < n; i++) { const bx = Math.min(g - 1, Math.floor(pts.x[i] * g)), by = Math.min(g - 1, Math.floor(pts.y[i] * g)); cnt[by * g + bx]++; }
  const e = n / (g * g); let c = 0; for (const v of cnt) c += (v - e) ** 2 / e;
  return c / (g * g - 1);
}
// Fraction of points inside the initial support (for the disk: measure of mixing).
export function fractionInDisk(pts, cx = 0.5, cy = 0.5, r = 0.3) { let k = 0; for (let i = 0; i < pts.x.length; i++) if (Math.hypot(pts.x[i] - cx, pts.y[i] - cy) < r) k++; return k / pts.x.length; }
