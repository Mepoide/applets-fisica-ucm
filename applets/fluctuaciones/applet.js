// Occupation fluctuations in a window of an ideal gas — mountable applet.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, button, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as F from './model.js';

export const meta = { slug: 'fluctuaciones', titleKey: 'fluct.title', legacyPath: 'CORRELACION/AUTOCOR.JAVA', extra: true };

i18n.register({
  es: {
    'fluct.N': 'Partículas (1–500)', 'fluct.kT': 'Temperatura kT', 'fluct.fast': 'Rápido (dt = 1 en vez de 0.1)',
    'fluct.plot': 'Gráfica', 'fluct.plot.series': 'N(t) en la ventana', 'fluct.plot.hist': 'Histograma de N frente a Poisson y binomial', 'fluct.plot.acf': 'Autocorrelación C(τ)',
    'fluct.clear': 'Borrar estadística',
    'fluct.cap.box': 'Gas ideal: las partículas no interaccionan y rebotan en las paredes. Arrastra con el ratón para dibujar la ventana verde de recuento.',
    'fluct.cap.plot': 'Rojo: datos de la simulación. Azul: Poisson con λ = Np (gran canónico). Negro: binomial(N, p), la respuesta exacta con N fijo.',
    'fluct.readout': 't = {t} · muestras = {n} · p = área ventana / área caja = {p} · ⟨N⟩ = {mean} (Np = {np}) · Var = {var} (binomial {vb}, Poisson {vp}) · τ ≈ {tau}',
    'fluct.hint': 'Haz la ventana pequeña (p ≪ 1): Poisson y binomial coinciden. Hazla grande (p ≈ 0.5): la varianza real es Np(1−p), menor que la de Poisson, porque el número total de partículas está fijado. La autocorrelación decae en el tiempo que tarda una partícula en cruzar la ventana, L/√kT.',
    'fluct.ax.t': 't (muestras)', 'fluct.ax.tau': 'τ (muestras)', 'fluct.samples': 'muestras',
    'fluct.legend.hist': 'rojo: medido · azul: Poisson · negro: binomial', 'fluct.legend.acf': 'C(τ) = ⟨δN(0)δN(τ)⟩/⟨δN²⟩ · gris: e^{-1}',
    'fluct.eq.N': 'partículas en la caja', 'fluct.eq.p': 'fracción de área de la ventana', 'fluct.eq.mean': '⟨n⟩ medido', 'fluct.eq.var': 'varianza medida',
    'fluct.ind.varratio': 'Var medida / Np(1−p)', 'fluct.ind.tau': 'τ_c medido (muestras)',
  },
  en: {
    'fluct.N': 'Particles (1–500)', 'fluct.kT': 'Temperature kT', 'fluct.fast': 'Fast (dt = 1 instead of 0.1)',
    'fluct.plot': 'Plot', 'fluct.plot.series': 'N(t) in the window', 'fluct.plot.hist': 'Histogram of N vs Poisson and binomial', 'fluct.plot.acf': 'Autocorrelation C(τ)',
    'fluct.clear': 'Clear statistics',
    'fluct.cap.box': 'Ideal gas: particles do not interact and bounce off the walls. Drag with the mouse to draw the green counting window.',
    'fluct.cap.plot': 'Red: simulation data. Blue: Poisson with λ = Np (grand canonical). Black: binomial(N, p), the exact answer for fixed N.',
    'fluct.readout': 't = {t} · samples = {n} · p = window area / box area = {p} · ⟨N⟩ = {mean} (Np = {np}) · Var = {var} (binomial {vb}, Poisson {vp}) · τ ≈ {tau}',
    'fluct.hint': 'Make the window small (p ≪ 1): Poisson and binomial agree. Make it large (p ≈ 0.5): the actual variance is Np(1−p), smaller than Poisson, because the total number of particles is fixed. The autocorrelation decays over the time a particle needs to cross the window, L/√kT.',
    'fluct.ax.t': 't (samples)', 'fluct.ax.tau': 'τ (samples)', 'fluct.samples': 'samples',
    'fluct.legend.hist': 'red: measured · blue: Poisson · black: binomial', 'fluct.legend.acf': 'C(τ) = ⟨δN(0)δN(τ)⟩/⟨δN²⟩ · grey: e^{-1}',
    'fluct.eq.N': 'particles in the box', 'fluct.eq.p': 'window area fraction', 'fluct.eq.mean': 'measured ⟨n⟩', 'fluct.eq.var': 'measured variance',
    'fluct.ind.varratio': 'measured Var / Np(1−p)', 'fluct.ind.tau': 'measured τ_c (samples)',
  },
});

const W = 200, H = 200;

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'box', caption: 'fluct.cap.box' }, { id: 'graph', caption: 'fluct.cap.plot' }], hintKey: 'fluct.hint' });
  let state;
  const pN = numberField({ label: 'fluct.N', value: 50, min: 1, max: 500, integer: true });
  const pkT = numberField({ label: 'fluct.kT', value: 100, min: 0.01, max: 10000 });
  const pFast = checkbox({ label: 'fluct.fast', checked: false });
  const pPlot = select({ label: 'fluct.plot', value: 'series', options: [{ value: 'series', label: 'fluct.plot.series' }, { value: 'hist', label: 'fluct.plot.hist' }, { value: 'acf', label: 'fluct.plot.acf' }], onChange: () => draw() });
  const bClear = button({ label: 'fluct.clear', onClick: () => { state.series = []; draw(); } });
  ui.params.append(pN.el, pkT.el, pFast.el, pPlot.el, bClear.el);

  const box = new Plot(ui.canvas.box, { xmin: 0, xmax: W, ymin: 0, ymax: H });
  const graph = new Plot(ui.canvas.graph, { axes: true });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'P(n) = \\binom{\\htmlId{N}{N}}{n}\\,\\htmlId{p}{p}^{\\,n}(1-\\htmlId{p2}{p})^{\\htmlId{N2}{N}-n}', slots: { N: { label: 'fluct.eq.N' }, N2: { label: 'fluct.eq.N' }, p: { label: 'fluct.eq.p' }, p2: { label: 'fluct.eq.p' } } },
      { tex: '\\langle n\\rangle = Np = \\htmlId{np}{Np},\\qquad \\sigma^2 = Np(1-p) = \\htmlId{vb}{\\sigma^2}\\;\\big(\\text{Poisson: } \\htmlId{vp}{Np}\\big)', slots: { np: {}, vb: {}, vp: {} } },
      { tex: '\\langle n\\rangle_{\\rm med} = \\htmlId{mean}{\\langle n\\rangle},\\qquad \\sigma^2_{\\rm med} = \\htmlId{var}{\\sigma^2}', slots: { mean: { label: 'fluct.eq.mean' }, var: { label: 'fluct.eq.var' } } },
    ],
    indicators: [{ key: 'ratio', label: 'fluct.ind.varratio' }, { key: 'tau', label: 'fluct.ind.tau' }],
  });

  function reset() {
    const win = state?.window;
    state = F.create({ N: pN.get(), kT: pkT.get(), w: W, h: H });
    if (win) state.window = win;
  }
  function step() { F.sample(state, pFast.get() ? 1 : 0.1); if (state.series.length > 200000) state.series.splice(0, 100000); }

  function drawBox() {
    box.clear();
    box.color('#1f4e9c');
    for (let i = 0; i < state.N; i++) box.disk(state.x[i], state.y[i], state.radius);
    const w = state.window;
    box.color('rgba(40,160,60,0.25)'); box.rect(w.x, w.y, w.w, w.h, true);
    box.color('#28a03c'); box.lineWidth(2); box.rect(w.x, w.y, w.w, w.h, false); box.lineWidth(1);
    box.end();
  }
  function drawGraph() {
    const S = state.series, n = S.length, mode = pPlot.get();
    const p = F.windowFraction(state), e = F.expectedPmf(state.N, p);
    if (mode === 'series') {
      const win = 600, from = Math.max(0, n - win);
      graph.xlabel = i18n.t('fluct.ax.t'); graph.ylabel = 'N';
      graph.setScales(from, from + win, 0, Math.max(5, Math.ceil(Math.min(state.N, e.lambda + 5 * Math.sqrt(e.lambda + 1)) * 1.1)));
      graph.clear(); graph.color('#b5281e');
      const xs = [], ys = [];
      for (let i = from; i < n; i++) { xs.push(i); ys.push(S[i]); }
      if (xs.length > 1) graph.polyline(xs, ys);
      graph.color('rgba(31,78,156,0.6)'); graph.line(from, e.lambda, from + win, e.lambda);
      graph.end();
    } else if (mode === 'hist') {
      const st = F.occupationStats(S);
      const kmax = Math.min(state.N, Math.max(st.max + 2, Math.ceil(e.lambda + 4 * Math.sqrt(e.lambda + 1))));
      let pmax = 0; for (let k = 0; k <= kmax; k++) pmax = Math.max(pmax, e.poisson[k], e.binomial[k], n ? st.histogram[k] / n || 0 : 0);
      graph.xlabel = 'N'; graph.ylabel = 'P(N)'; graph.setScales(0, kmax + 1, 0, pmax * 1.15);
      graph.clear();
      graph.color('rgba(181,40,30,0.7)');
      if (n) for (let k = 0; k <= Math.min(kmax, st.max); k++) graph.bar(k + 0.1, k + 0.9, st.histogram[k] / n);
      const xs = [], yp = [], yb = [];
      for (let k = 0; k <= kmax; k++) { xs.push(k + 0.5); yp.push(e.poisson[k]); yb.push(e.binomial[k]); }
      graph.color('#1f4e9c'); graph.lineWidth(2); graph.polyline(xs, yp);
      graph.color('#222'); graph.polyline(xs, yb); graph.lineWidth(1);
      graph.label(6, 4, i18n.t('fluct.legend.hist'));
      graph.end();
    } else {
      const maxLag = 300;
      const ac = F.autocorrelation(S, maxLag);
      graph.xlabel = i18n.t('fluct.ax.tau'); graph.ylabel = 'C(τ)'; graph.setScales(0, maxLag, -0.3, 1.05);
      graph.clear();
      graph.color('#999'); graph.line(0, 0, maxLag, 0); graph.line(0, Math.exp(-1), maxLag, Math.exp(-1));
      graph.color('#b5281e'); graph.lineWidth(2);
      const xs = [], ys = []; for (let l = 0; l < ac.length; l++) { xs.push(l); ys.push(ac[l]); }
      if (xs.length > 1) graph.polyline(xs, ys); graph.lineWidth(1);
      graph.color('#222'); graph.label(6, 4, i18n.t('fluct.legend.acf'));
      graph.end();
    }
    const st = F.occupationStats(S);
    const dt = pFast.get() ? 1 : 0.1;
    const tauc = F.correlationTimeEstimate(state);
    ui.readout.textContent = i18n.t('fluct.readout', {
      t: state.t.toFixed(1), n, p: p.toFixed(3), mean: st.mean.toFixed(2), np: e.lambda.toFixed(2), var: st.variance.toFixed(2),
      vb: e.varianceBinomial.toFixed(2), vp: e.variancePoisson.toFixed(2), tau: `${tauc.toFixed(1)} (${(tauc / dt).toFixed(0)} ${i18n.t('fluct.samples')})`,
    });
    eq.update({ N: state.N, N2: state.N, p, p2: p, np: e.lambda, vb: e.varianceBinomial, vp: e.variancePoisson, mean: n ? st.mean : NaN, var: n ? st.variance : NaN });
    const ratio = n > 50 && e.varianceBinomial > 0 ? st.variance / e.varianceBinomial : NaN;
    eq.setIndicator('ratio', ratio, Number.isNaN(ratio) ? 'none' : Math.abs(ratio - 1) < 0.2 ? 'ok' : 'warn');
    eq.setIndicator('tau', tauc / dt);
  }
  function draw() { drawBox(); drawGraph(); }

  let drag = null;
  const canvas = box.canvas;
  canvas.addEventListener('pointerdown', (ev) => { canvas.setPointerCapture(ev.pointerId); drag = box.eventToWorld(ev); });
  canvas.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const [x, y] = box.eventToWorld(ev);
    const x0 = Math.max(0, Math.min(drag[0], x)), x1 = Math.min(W, Math.max(drag[0], x));
    const y0 = Math.max(0, Math.min(drag[1], y)), y1 = Math.min(H, Math.max(drag[1], y));
    state.window = { x: x0, y: y0, w: Math.max(2, x1 - x0), h: Math.max(2, y1 - y0) };
    state.series = [];
    if (!loop.running) draw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });

  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 50 }).el);
  reset();
  const off = autoResize([box, graph], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
