// One-dimensional sandpile driven at the left wall. Grains are added at column 0;
// site i topples (one grain moves to i+1) when the local slope h[i]-h[i+1] reaches
// its threshold. Beyond the last column the height is 0, so grains leave there.
//   mode 'fixed': threshold hc at every site (the 2003 applet).
//   mode 'oslo' : threshold drawn from {hc, hc+1} after each toppling (Oslo rice-pile
//                 model, Christensen et al. 1996), which is critical in 1D.

export function create({ columns = 24, hc = 2, mode = 'fixed', rng = Math.random } = {}) {
  const s = { columns, hc, mode, rng, h: new Int32Array(columns), thr: new Int32Array(columns),
    added: 0, out: 0, avalanches: [], durations: [], current: null, lastToppled: new Uint8Array(columns) };
  for (let i = 0; i < columns; i++) s.thr[i] = drawThreshold(s);
  return s;
}

function drawThreshold(s) { return s.mode === 'oslo' ? s.hc + (s.rng() < 0.5 ? 0 : 1) : s.hc; }

export function slope(s, i) { return s.h[i] - (i + 1 < s.columns ? s.h[i + 1] : 0); }
export function isStable(s) {
  for (let i = 0; i < s.columns; i++) if (slope(s, i) >= s.thr[i]) return false;
  return true;
}

// Drop one grain on column 0 and open an avalanche record.
export function addGrain(s) {
  s.h[0]++; s.added++;
  s.current = { size: 0, duration: 0 };
}

// One relaxation sweep (left to right): every unstable site topples once.
// Returns the number of topplings; 0 means the pile is stable.
export function relaxOnce(s) {
  let n = 0;
  s.lastToppled.fill(0);
  for (let i = 0; i < s.columns; i++) {
    if (slope(s, i) >= s.thr[i]) {
      s.h[i]--;
      if (i + 1 < s.columns) s.h[i + 1]++; else s.out++;
      s.thr[i] = drawThreshold(s);
      s.lastToppled[i] = 1;
      n++;
    }
  }
  if (s.current) {
    if (n > 0) { s.current.size += n; s.current.duration++; }
    else { s.avalanches.push(s.current.size); s.durations.push(s.current.duration); s.current = null; }
  }
  return n;
}

// Add a grain and relax completely; returns the avalanche size.
export function drive(s) {
  addGrain(s);
  let guard = 0;
  while (relaxOnce(s) > 0 && guard++ < 1e7) { /* relax */ }
  return s.avalanches[s.avalanches.length - 1];
}

export function grainsInPile(s) { let t = 0; for (let i = 0; i < s.columns; i++) t += s.h[i]; return t; }

// Logarithmically binned size distribution: returns {s, p} with p = P(size in bin)/bin width.
export function sizeDistribution(sizes, binsPerDecade = 4) {
  if (!sizes.length) return { s: [], p: [] };
  const max = Math.max(...sizes);
  const edges = [1];
  while (edges[edges.length - 1] <= max) edges.push(edges[edges.length - 1] * 10 ** (1 / binsPerDecade));
  const counts = new Float64Array(edges.length - 1);
  for (const v of sizes) {
    if (v < 1) continue;
    const b = Math.min(edges.length - 2, Math.floor(Math.log10(v) * binsPerDecade));
    counts[b]++;
  }
  const out = { s: [], p: [] };
  for (let b = 0; b < counts.length; b++) {
    if (counts[b] === 0) continue;
    const lo = Math.ceil(edges[b] - 1e-9), hi = Math.ceil(edges[b + 1] - 1e-9); // integer sizes in [lo, hi)
    const width = Math.max(1, hi - lo);
    out.s.push(Math.sqrt(edges[b] * edges[b + 1]));
    out.p.push(counts[b] / sizes.length / width);
  }
  return out;
}
