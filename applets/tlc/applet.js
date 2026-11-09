// Central limit theorem — Statistical Physics experiment 1.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as T from './model.js';

export const meta = { slug: 'tlc', titleKey: 'tlc.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'tlc.N': 'Variables sumadas N (1–200)', 'tlc.dist': 'Distribución de cada variable', 'tlc.dist.dice': 'Dado: 1…6', 'tlc.dist.uniform': 'Uniforme en [0,1]', 'tlc.dist.bernoulli': '0 ó 1',
    'tlc.cap.last': 'Última suma generada: los N valores individuales (puntos) y su suma S (barra). Cada paso genera nuevas sumas.',
    'tlc.cap.hist': 'Rojo: histograma normalizado de S. Azul: gaussiana del teorema del límite central, media Nμ y varianza Nσ².',
    'tlc.readout': 'sumas = {n} · ⟨S⟩ = {mean} (Nμ = {mu}) · Var S = {var} (Nσ² = {var0}) · χ²/dof = {chi2}',
    'tlc.hint': 'Con N = 1 ves la distribución original (plana para el dado y la uniforme, dos barras para 0/1). Con N = 2 aparece el triángulo; con N ≳ 6 ya casi no se distingue de la gaussiana, sea cual sea la variable de partida. La anchura relativa σ_S/⟨S⟩ decrece como 1/√N.',
    'tlc.eq.N': 'número de variables sumadas', 'tlc.eq.mu': 'media de cada variable', 'tlc.eq.s2': 'varianza de cada variable', 'tlc.eq.mS': 'media de la suma, Nμ', 'tlc.eq.sS': 'desviación típica de la suma, σ√N', 'tlc.eq.rel': 'anchura relativa σ_S/⟨S⟩',
    'tlc.ind.chi2': 'χ²/dof histograma vs gaussiana', 'tlc.ind.n': 'sumas acumuladas',
  },
  en: {
    'tlc.N': 'Variables added N (1–200)', 'tlc.dist': 'Distribution of each variable', 'tlc.dist.dice': 'Die: 1…6', 'tlc.dist.uniform': 'Uniform on [0,1]', 'tlc.dist.bernoulli': '0 or 1',
    'tlc.cap.last': 'Last generated sum: the N individual values (dots) and their sum S (bar). Each step generates new sums.',
    'tlc.cap.hist': 'Red: normalised histogram of S. Blue: central-limit Gaussian, mean Nμ and variance Nσ².',
    'tlc.readout': 'sums = {n} · ⟨S⟩ = {mean} (Nμ = {mu}) · Var S = {var} (Nσ² = {var0}) · χ²/dof = {chi2}',
    'tlc.hint': 'With N = 1 you see the original distribution (flat for the die and the uniform, two bars for 0/1). With N = 2 the triangle appears; with N ≳ 6 it is hard to tell from the Gaussian, whatever the starting variable. The relative width σ_S/⟨S⟩ decreases as 1/√N.',
    'tlc.eq.N': 'number of variables added', 'tlc.eq.mu': 'mean of each variable', 'tlc.eq.s2': 'variance of each variable', 'tlc.eq.mS': 'mean of the sum, Nμ', 'tlc.eq.sS': 'standard deviation of the sum, σ√N', 'tlc.eq.rel': 'relative width σ_S/⟨S⟩',
    'tlc.ind.chi2': 'χ²/dof histogram vs Gaussian', 'tlc.ind.n': 'accumulated sums',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'last', caption: 'tlc.cap.last' }, { id: 'hist', caption: 'tlc.cap.hist' }], hintKey: 'tlc.hint' });
  let state, lastVals = [];
  const pN = numberField({ label: 'tlc.N', value: 10, min: 1, max: 200, integer: true });
  const pD = select({ label: 'tlc.dist', value: 'dice', options: Object.keys(T.DISTS).map((v) => ({ value: v, label: `tlc.dist.${v}` })) });
  ui.params.append(pN.el, pD.el);
  const last = new Plot(ui.canvas.last, { axes: true, xlabel: 'i', ylabel: 'x_i' });
  const hist = new Plot(ui.canvas.hist, { axes: true, xlabel: 'S', ylabel: 'P(S)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'S = \\sum_{i=1}^{\\htmlId{N}{N}} x_i,\\qquad \\langle x\\rangle = \\htmlId{mu}{\\mu},\\quad \\mathrm{Var}\\,x = \\htmlId{s2}{\\sigma^2}', slots: { N: { label: 'tlc.eq.N' }, mu: { label: 'tlc.eq.mu' }, s2: { label: 'tlc.eq.s2' } } },
      { tex: 'P(S) \\to \\frac{1}{\\sqrt{2\\pi N\\sigma^2}}\\,e^{-(S-N\\mu)^2/2N\\sigma^2},\\qquad N\\mu = \\htmlId{mS}{N\\mu},\\quad \\sigma\\sqrt N = \\htmlId{sS}{\\sigma_S},\\quad \\frac{\\sigma_S}{N\\mu} = \\htmlId{rel}{\\sigma_S/N\\mu}', slots: { mS: { label: 'tlc.eq.mS' }, sS: { label: 'tlc.eq.sS' }, rel: { label: 'tlc.eq.rel' } } },
    ],
    indicators: [{ key: 'chi2', label: 'tlc.ind.chi2' }, { key: 'n', label: 'tlc.ind.n' }],
  });
  function reset() {
    state = T.create({ N: pN.get(), dist: pD.get() }); lastVals = [];
    eq.update({ N: state.N, mu: state.d.mean, s2: state.d.variance, mS: state.mu, sS: state.sd, rel: state.mu ? state.sd / state.mu : NaN });
  }
  function step() {
    lastVals = []; for (let i = 0; i < state.N; i++) lastVals.push(state.d.sample(state.rng));
    const S = lastVals.reduce((a, b) => a + b, 0); state.last = S;
    const b = Math.floor((S - state.lo) / state.width); if (b >= 0 && b < state.nb) { state.counts[b]++; state.n++; }
  }
  function draw() {
    const xmax = state.dist === 'dice' ? 6.5 : 1.1;
    last.setScales(0, state.N + 1, 0, xmax); last.clear();
    last.color('rgba(31,78,156,0.8)'); for (let i = 0; i < lastVals.length; i++) last.disk(i + 1, lastVals[i], Math.max(0.05, 0.01 * (state.N + 1)));
    last.color('#999'); last.line(0, state.d.mean, state.N + 1, state.d.mean);
    last.color('#222'); last.label(6, 4, `S = ${Number.isNaN(state.last) ? '–' : state.last.toFixed(state.d.discrete ? 0 : 2)}`);
    last.end();
    const d = T.density(state);
    const pmax = Math.max(...d.g, ...d.p) * 1.15 || 1;
    hist.setScales(state.lo, state.hi, 0, pmax); hist.clear();
    hist.color('rgba(181,40,30,0.7)'); for (let b = 0; b < state.nb; b++) if (d.p[b] > 0) hist.bar(state.lo + b * state.width, state.lo + (b + 1) * state.width, d.p[b]);
    hist.color('#1f4e9c'); hist.lineWidth(2); hist.polyline(Array.from(d.x), Array.from(d.g)); hist.lineWidth(1);
    hist.end();
    const st = T.stats(state), c2 = state.n > 200 ? T.chi2(state) : NaN;
    ui.readout.textContent = i18n.t('tlc.readout', { n: state.n, mean: Number.isNaN(st.mean) ? '–' : st.mean.toFixed(3), mu: state.mu.toFixed(3), var: Number.isNaN(st.variance) ? '–' : st.variance.toFixed(3), var0: (state.sd ** 2).toFixed(3), chi2: Number.isNaN(c2) ? '–' : c2.toFixed(2) });
    eq.setIndicator('chi2', c2, Number.isNaN(c2) ? 'none' : c2 < 2 ? 'ok' : 'warn'); eq.setIndicator('n', state.n);
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 5 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 200 }).el);
  reset();
  const off = autoResize([last, hist], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
