// Kac ring: N sites with a blue (+1) or red (-1) ball; M marked edges. Each
// step every ball moves one site clockwise and flips colour when it crosses a
// marked edge. Deterministic, reversible, periodic with period 2N; the
// mean-field (Stosszahlansatz) prediction decays monotonically instead.
export const INITS = ['random', '7030', 'blue', 'alternate'];

export function create({ N = 100, M = 10, init = 'random', rng = Math.random } = {}) {
  N = Math.max(2, Math.floor(N)); M = Math.max(0, Math.min(N, Math.floor(M)));
  const colors = new Int8Array(N);
  for (let i = 0; i < N; i++) {
    if (init === 'blue') colors[i] = 1;
    else if (init === 'alternate') colors[i] = i % 2 ? -1 : 1;
    else if (init === '7030') colors[i] = rng() < 0.7 ? 1 : -1;
    else colors[i] = rng() < 0.5 ? 1 : -1;
  }
  // M distinct marked edges; edge i sits between site i and site i+1.
  const marks = new Uint8Array(N);
  const idx = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  for (let k = 0; k < M; k++) marks[idx[k]] = 1;
  const s = { N, M, init, colors, initial: Int8Array.from(colors), marks, t: 0, history: [] };
  s.delta0 = delta(s);
  s.history.push(s.delta0);
  return s;
}

// Blue minus red.
export function delta(s) { let d = 0; for (let i = 0; i < s.N; i++) d += s.colors[i]; return d; }
export function counts(s) { const d = delta(s); return { blue: (s.N + d) / 2, red: (s.N - d) / 2 }; }

// One synchronous step: ball at site i moves to i+1, flipping if edge i is marked.
export function step(s) {
  const { N, colors, marks } = s;
  const next = new Int8Array(N);
  for (let i = 0; i < N; i++) next[(i + 1) % N] = marks[i] ? -colors[i] : colors[i];
  s.colors = next; s.t++;
  s.history.push(delta(s));
  if (s.history.length > 4 * N + 10) s.history.shift();
}

// Mean-field prediction: Δ(t) = (1 − 2M/N)^t Δ(0).
export function meanField(s, t) { return Math.pow(1 - 2 * s.M / s.N, t) * s.delta0; }
export function recurrenceTime(s) { return 2 * s.N; }
export function sameAsInitial(s) { for (let i = 0; i < s.N; i++) if (s.colors[i] !== s.initial[i]) return false; return true; }
