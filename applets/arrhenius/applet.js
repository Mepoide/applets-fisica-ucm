// Activation processes: Arrhenius law — experiment 8.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as W from '../_walkers/metropolis.js';
import * as A from './model.js';

export const meta = { slug: 'arrhenius', titleKey: 'arr.title', legacyPath: '../../README.md', number: 8 };

i18n.register({
  es: {
    'arr.N': 'Partículas (1–5000)', 'arr.kT': 'Temperatura kT', 'arr.A': 'Asimetría A (inclinación A·x)',
    'arr.cap.box': 'Doble pozo V(x) = (x² − 1)² + A·x. Todas las partículas empiezan en el pozo metaestable (el más alto, a la derecha si A > 0) y escapan por activación térmica sobre la barrera ΔE.',
    'arr.cap.plot': 'Rojo: número de partículas en el pozo metaestable, N_meta(t). Azul: N₀e^{−kt} con la tasa de Kramers en la red. Punteado azul: la estimación del curso (ec. 2), que sobreestima k en una red fina. Gris: aproximación armónica (Arrhenius).',
    'arr.readout': 't = {t} · N_meta = {n} · ΔE = {dE} · k_Kramers = {kK} · k_Arrhenius = {kA} · k_curso = {kC} · k ajustada = {kf}',
    'arr.hint': 'A kT ≪ ΔE la ley es exponencial y la tasa sigue a Arrhenius: baja kT y mira cómo k se desploma con e^{−ΔE/kT}. A kT comparable a ΔE las partículas también vuelven al pozo y N_meta no tiende a cero sino al valor de equilibrio. Con A = 0 los dos pozos son iguales y la mitad se queda en cada uno.',
    'arr.eq.kT': 'temperatura', 'arr.eq.dE': 'altura de la barrera desde el pozo metaestable', 'arr.eq.wm': 'frecuencia del pozo √V″(x_meta)', 'arr.eq.wM': 'curvatura de la barrera √|V″(x_max)|', 'arr.eq.kA': 'tasa de Arrhenius (armónica)', 'arr.eq.kK': 'tasa de Kramers exacta en la red', 'arr.eq.kf': 'tasa ajustada a la simulación', 'arr.eq.D': 'coeficiente de difusión del caminante, Δx²/2',
    'arr.ind.fit': 'k ajustada / k_Kramers', 'arr.ind.ratio': 'kT / ΔE (Arrhenius válido si ≪ 1)',
  },
  en: {
    'arr.N': 'Particles (1–5000)', 'arr.kT': 'Temperature kT', 'arr.A': 'Asymmetry A (tilt A·x)',
    'arr.cap.box': 'Double well V(x) = (x² − 1)² + A·x. Every particle starts in the metastable well (the higher one, on the right if A > 0) and escapes by thermal activation over the barrier ΔE.',
    'arr.cap.plot': 'Red: number of particles in the metastable well, N_meta(t). Blue: N₀e^{−kt} with the lattice Kramers rate. Dotted blue: the course estimate (eq. 2), which overestimates k on a fine lattice. Grey: harmonic (Arrhenius) approximation.',
    'arr.readout': 't = {t} · N_meta = {n} · ΔE = {dE} · k_Kramers = {kK} · k_Arrhenius = {kA} · k_course = {kC} · fitted k = {kf}',
    'arr.hint': 'At kT ≪ ΔE the law is exponential and the rate follows Arrhenius: lower kT and watch k collapse as e^{−ΔE/kT}. At kT comparable to ΔE particles also return to the well and N_meta tends to the equilibrium value instead of zero. With A = 0 both wells are equal and half stay in each.',
    'arr.eq.kT': 'temperature', 'arr.eq.dE': 'barrier height from the metastable well', 'arr.eq.wm': 'well frequency √V″(x_meta)', 'arr.eq.wM': 'barrier curvature √|V″(x_max)|', 'arr.eq.kA': 'Arrhenius (harmonic) rate', 'arr.eq.kK': 'exact lattice Kramers rate', 'arr.eq.kf': 'rate fitted to the simulation', 'arr.eq.D': 'walker diffusion coefficient, Δx²/2',
    'arr.ind.fit': 'fitted k / k_Kramers', 'arr.ind.ratio': 'kT / ΔE (Arrhenius valid if ≪ 1)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'box', caption: 'arr.cap.box' }, { id: 'plot', caption: 'arr.cap.plot' }], hintKey: 'arr.hint' });
  let state, rates;
  const pN = numberField({ label: 'arr.N', value: 1000, min: 1, max: 5000, integer: true });
  const pkT = slider({ label: 'arr.kT', value: Math.log10(0.2), min: -1.3, max: 0.3, step: 0.02, format: (v) => (10 ** v).toFixed(3) });
  const pA = slider({ label: 'arr.A', value: 0.5, min: 0, max: 1.2, step: 0.05, format: (v) => v.toFixed(2) });
  ui.params.append(pN.el, pkT.el, pA.el);

  const xs = W.xgrid(A.L, A.XMIN, A.XMAX);
  const box = new Plot(ui.canvas.box, { axes: true, xlabel: 'x', ylabel: 'V' });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 't', ylabel: 'N_meta' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'N_{\\rm meta}(t) = N_0\\,e^{-k t},\\qquad k_{\\rm fit} = \\htmlId{kf}{k}', slots: { kf: { label: 'arr.eq.kf' } } },
      { tex: 'k_{\\rm Arr} = \\frac{\\htmlId{wm}{\\omega_{\\rm m}}\\cdot\\htmlId{wM}{\\omega_{\\rm M}}}{2\\pi\\,\\gamma}\\,e^{-\\htmlId{dE}{\\Delta E}/\\htmlId{kT}{kT}} = \\htmlId{kA}{k_{\\rm Arr}}', slots: { wm: { label: 'arr.eq.wm' }, wM: { label: 'arr.eq.wM' }, dE: { label: 'arr.eq.dE' }, kT: { label: 'arr.eq.kT' }, kA: { label: 'arr.eq.kA' } } },
      { tex: '\\gamma = \\frac{kT}{\\htmlId{D}{D}},\\qquad k_{\\rm Kramers} = \\frac{D}{\\int_{\\rm pozo} e^{-V/kT}dx\\int_{\\rm barr.} e^{V/kT}dx} = \\htmlId{kK}{k_{\\rm K}}', slots: { D: { label: 'arr.eq.D' }, kK: { label: 'arr.eq.kK' } } },
    ],
    indicators: [{ key: 'fit', label: 'arr.ind.fit' }, { key: 'ratio', label: 'arr.ind.ratio' }],
  });

  function reset() {
    const kT = 10 ** pkT.get();
    state = A.create({ N: pN.get(), kT, A: pA.get() });
    const kk = A.rateKramers(state.V, kT, state.lm, state.metaSide);
    rates = { kK: kk.k, kA: kk.kArr, kC: A.rateCourse(state.V, kT, state.lm, state.metaSide), dE: kk.dE, wm: kk.wMeta, wM: kk.wMax, D: kk.D, kT };
    eq.update({ wm: rates.wm, wM: rates.wM, dE: rates.dE, kT, kA: rates.kA, kK: rates.kK, D: rates.D });
  }
  function step() { A.step(state); }
  function drawBox() {
    const V = state.V, vmax = Math.max(...V) * 1.05;
    box.setScales(A.XMIN, A.XMAX, Math.min(0, ...V) - 0.1, vmax); box.clear();
    box.color('#222'); box.lineWidth(2); box.polyline(Array.from(xs), Array.from(V)); box.lineWidth(1);
    box.color('rgba(220,130,20,0.9)'); box.lineWidth(4); box.line(1.85, 0, 1.85, Math.min(vmax, rates.kT)); box.lineWidth(1);
    const h = W.occupancy(state);
    box.color('rgba(31,78,156,0.8)');
    for (let i = 0; i < A.L; i++) for (let k = 0; k < h[i]; k++) { if (k > 60) break; box.disk(xs[i], V[i] + 0.04 + 0.05 * k, 0.018); }
    box.end();
  }
  function drawPlot() {
    const h = state.history, N0 = state.N, t = state.t;
    const tmax = Math.max(50, Math.max(3 / rates.kK, t * 1.05));
    plot.setScales(0, tmax, 0, N0 * 1.05); plot.clear();
    const curve = (k, color, dash, w) => { plot.color(color); plot.lineWidth(w); plot.ctx.setLineDash(dash); const xs = [], ys = []; for (let i = 0; i <= 200; i++) { const tt = tmax * i / 200; xs.push(tt); ys.push(N0 * Math.exp(-k * tt)); } plot.polyline(xs, ys); plot.ctx.setLineDash([]); plot.lineWidth(1); };
    curve(rates.kC, 'rgba(31,78,156,0.6)', [4, 4], 1);
    curve(rates.kA, '#888', [], 1);
    curve(rates.kK, '#1f4e9c', [], 2);
    plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(1.5);
    const stride = Math.max(1, Math.floor(h.length / 600)), xs2 = [], ys2 = [];
    for (let i = 0; i < h.length; i += stride) { xs2.push(h[i][0]); ys2.push(h[i][1]); }
    if (xs2.length > 1) plot.polyline(xs2, ys2); plot.lineWidth(1);
    plot.end();
  }
  function draw() {
    drawBox(); drawPlot();
    const kf = state.t > 50 ? A.fitRate(state.history.filter((_, i) => i % 10 === 0)) : NaN;
    ui.readout.textContent = i18n.t('arr.readout', { t: state.t, n: A.nMeta(state), dE: rates.dE.toFixed(3), kK: rates.kK.toExponential(2), kA: rates.kA.toExponential(2), kC: rates.kC.toExponential(2), kf: Number.isNaN(kf) ? '–' : kf.toExponential(2) });
    eq.update({ kf });
    const r = kf / rates.kK;
    eq.setIndicator('fit', r, Number.isNaN(r) ? 'none' : Math.abs(r - 1) < 0.3 ? 'ok' : 'warn');
    eq.setIndicator('ratio', rates.kT / rates.dE, rates.kT / rates.dE < 0.35 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 20 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 200 }).el);
  reset();
  const off = autoResize([box, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
