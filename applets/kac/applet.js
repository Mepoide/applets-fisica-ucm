// Kac ring — mountable applet. Experiment 1 of "Sistemas fuera del Equilibrio".
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as K from './model.js';

export const meta = { slug: 'kac', titleKey: 'kac.title', legacyPath: '../../README.md', number: 1 };

i18n.register({
  es: {
    'kac.N': 'Bolas N (2–1000)', 'kac.M': 'Marcas M (0–N)', 'kac.init': 'Colores iniciales', 'kac.fast': 'Rápido (10 pasos por fotograma)',
    'kac.init.random': 'Aleatorios 50/50', 'kac.init.7030': 'Aleatorios 70 % azules', 'kac.init.blue': 'Todos azules', 'kac.init.alternate': 'Alternados',
    'kac.cap.ring': 'Anillo exterior: configuración inicial. Anillo interior: estado actual. Las marcas verdes son las aristas en las que una bola cambia de color al cruzarlas.',
    'kac.cap.plot': 'Rojo: Δ(t) = azules − rojas en la simulación. Azul: predicción de campo medio (hipótesis de caos molecular). La línea vertical marca el tiempo de recurrencia T = 2N.',
    'kac.readout': 't = {t} · azules = {blue} · rojas = {red} · Δ = {delta} · campo medio = {mf} · recurrencia en T = 2N = {T}',
    'kac.hint': 'Con "Todos azules" la predicción (1 − 2M/N)^t es exacta durante el primer paso y razonable mientras las bolas que llegan a cada marca no han sido correlacionadas por ella. Deja correr hasta t = 2N: la configuración inicial reaparece exactamente, cosa que el campo medio nunca predice. Con M = N/2 el campo medio da Δ = 0 desde t = 1.',
    'kac.eq.M': 'número de marcas', 'kac.eq.N': 'número de bolas', 'kac.eq.t': 'paso actual', 'kac.eq.d0': 'Δ inicial', 'kac.eq.mf': 'predicción de campo medio', 'kac.eq.d': 'Δ medido',
    'kac.ind.err': '|Δ − Δ_cm|', 'kac.ind.T': 'pasos hasta la recurrencia',
  },
  en: {
    'kac.N': 'Balls N (2–1000)', 'kac.M': 'Marks M (0–N)', 'kac.init': 'Initial colours', 'kac.fast': 'Fast (10 steps per frame)',
    'kac.init.random': 'Random 50/50', 'kac.init.7030': 'Random, 70 % blue', 'kac.init.blue': 'All blue', 'kac.init.alternate': 'Alternating',
    'kac.cap.ring': 'Outer ring: initial configuration. Inner ring: current state. Green marks are the edges where a ball changes colour when crossing them.',
    'kac.cap.plot': 'Red: Δ(t) = blue − red in the simulation. Blue: mean-field prediction (molecular chaos hypothesis). The vertical line marks the recurrence time T = 2N.',
    'kac.readout': 't = {t} · blue = {blue} · red = {red} · Δ = {delta} · mean field = {mf} · recurrence at T = 2N = {T}',
    'kac.hint': 'With "All blue" the prediction (1 − 2M/N)^t is exact for the first step and reasonable until the balls reaching each mark have been correlated by it. Let it run to t = 2N: the initial configuration reappears exactly, which mean field never predicts. With M = N/2 mean field gives Δ = 0 from t = 1.',
    'kac.eq.M': 'number of marks', 'kac.eq.N': 'number of balls', 'kac.eq.t': 'current step', 'kac.eq.d0': 'initial Δ', 'kac.eq.mf': 'mean-field prediction', 'kac.eq.d': 'measured Δ',
    'kac.ind.err': '|Δ − Δ_mf|', 'kac.ind.T': 'steps to recurrence',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'ring', caption: 'kac.cap.ring' }, { id: 'plot', caption: 'kac.cap.plot' }], hintKey: 'kac.hint' });
  let state;
  const pN = numberField({ label: 'kac.N', value: 100, min: 2, max: 1000, integer: true });
  const pM = numberField({ label: 'kac.M', value: 10, min: 0, max: 1000, integer: true });
  const pInit = select({ label: 'kac.init', value: 'blue', options: K.INITS.map((v) => ({ value: v, label: `kac.init.${v}` })) });
  const pFast = checkbox({ label: 'kac.fast', checked: false, onChange: (v) => { loop.stepsPerFrame = v ? 10 : 1; } });
  ui.params.append(pN.el, pM.el, pInit.el, pFast.el);

  const ring = new Plot(ui.canvas.ring, { xmin: -1.15, xmax: 1.15, ymin: -1.15, ymax: 1.15 });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 't', ylabel: 'Δ' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\Delta(t) = \\Big(1 - \\frac{2\\,\\htmlId{M}{M}}{\\htmlId{N}{N}}\\Big)^{\\htmlId{t}{t}}\\,\\htmlId{d0}{\\Delta(0)} = \\htmlId{mf}{\\Delta_{\\rm cm}}', slots: { M: { label: 'kac.eq.M' }, N: { label: 'kac.eq.N' }, t: { label: 'kac.eq.t' }, d0: { label: 'kac.eq.d0' }, mf: { label: 'kac.eq.mf' } } },
      { tex: '\\Delta_{\\rm sim}(t) = N_A - N_R = \\htmlId{d}{\\Delta},\\qquad T_{\\rm rec} = 2N = \\htmlId{T}{2N}', slots: { d: { label: 'kac.eq.d' }, T: {} } },
    ],
    indicators: [{ key: 'err', label: 'kac.ind.err' }, { key: 'T', label: 'kac.ind.T' }],
  });

  function reset() {
    const N = pN.get(); const M = Math.min(N, pM.get()); pM.set(M);
    state = K.create({ N, M, init: pInit.get() });
    plot.setScales(0, 2 * N + 2, -N * 1.05, N * 1.05);
    eq.update({ M, N, d0: state.delta0, T: 2 * N });
  }
  function step() { if (state.t < 4 * state.N) K.step(state); else loop.pause(); }

  function drawRing() {
    ring.clear();
    const N = state.N, dth = 2 * Math.PI / N;
    const r = Math.min(0.5, 2.2 / Math.sqrt(N)) * (N > 300 ? 0.6 : 1);
    const ballR = Math.min(0.06, Math.PI / N * 0.8);
    for (let i = 0; i < N; i++) {
      const th = Math.PI / 2 - i * dth;
      // outer: initial; inner: current
      ring.color(state.initial[i] > 0 ? '#1f4e9c' : '#b5281e'); ring.disk(Math.cos(th), Math.sin(th), ballR);
      ring.color(state.colors[i] > 0 ? '#1f4e9c' : '#b5281e'); ring.disk(0.78 * Math.cos(th), 0.78 * Math.sin(th), ballR);
      if (state.marks[i]) { // edge between i and i+1
        const te = th - dth / 2;
        ring.color('#28a03c'); ring.lineWidth(Math.max(1, 180 / N)); ring.line(0.68 * Math.cos(te), 0.68 * Math.sin(te), 1.1 * Math.cos(te), 1.1 * Math.sin(te)); ring.lineWidth(1);
      }
    }
    void r;
    ring.color('#222'); ring.text(0, -0.05, `t = ${state.t}`, { align: 'center', font: '14px system-ui, sans-serif' });
    ring.end();
  }
  function drawPlot() {
    const N = state.N, T = 2 * N;
    const tmax = Math.max(T + 2, state.t + 2);
    plot.setScales(0, tmax, -N * 1.05, N * 1.05);
    plot.clear();
    plot.color('#999'); plot.line(0, 0, tmax, 0);
    plot.color('rgba(40,160,60,0.7)'); plot.line(T, -N, T, N);
    // mean field
    const xs = [], ys = [];
    for (let t = 0; t <= tmax; t += Math.max(1, Math.floor(tmax / 400))) { xs.push(t); ys.push(K.meanField(state, t)); }
    plot.color('#1f4e9c'); plot.lineWidth(2); plot.polyline(xs, ys);
    // simulation
    const h = state.history, from = state.t - h.length + 1;
    const sx = [], sy = []; for (let i = 0; i < h.length; i++) { sx.push(from + i); sy.push(h[i]); }
    plot.color('rgba(181,40,30,0.85)'); if (sx.length > 1) plot.polyline(sx, sy); plot.lineWidth(1);
    plot.end();
  }
  function draw() {
    drawRing(); drawPlot();
    const c = K.counts(state), d = K.delta(state), mf = K.meanField(state, state.t);
    ui.readout.textContent = i18n.t('kac.readout', { t: state.t, blue: c.blue, red: c.red, delta: d, mf: mf.toFixed(1), T: 2 * state.N });
    eq.update({ t: state.t, mf, d });
    const err = Math.abs(d - mf);
    eq.setIndicator('err', err, err <= 3 * Math.sqrt(state.N) ? 'ok' : 'warn');
    const left = 2 * state.N - (state.t % (2 * state.N));
    eq.setIndicator('T', left === 2 * state.N && state.t > 0 ? 0 : left, state.t > 0 && state.t % (2 * state.N) === 0 ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: -2, speedMax: 20 }).el);
  reset();
  const off = autoResize([ring, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
