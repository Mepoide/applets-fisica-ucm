// Ergodicity and entropy in a set of oscillators — Statistical Physics experiment 4.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as O from './model.js';

export const meta = { slug: 'osciladores', titleKey: 'osc.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'osc.N': 'Osciladores N (2–2000)', 'osc.M': 'Sectores M (2–64)', 'osc.freqs': 'Frecuencias', 'osc.freqs.random': 'Aleatorias (inconmensurables)', 'osc.freqs.nearEqual': 'Casi iguales', 'osc.freqs.equispaced': 'Equiespaciadas (conmensurables)', 'osc.phases': 'Fases iniciales', 'osc.phases.zero': 'Todas iguales (S = 0)', 'osc.phases.random': 'Aleatorias (S ≈ máxima)',
    'osc.cap.ring': 'Cada oscilador es un punto en la circunferencia con fase θᵢ = θᵢ(0) + ωᵢt. Los sectores definen el macroestado; su ocupación se muestra como barras radiales.',
    'osc.cap.plot': 'Entropía del macroestado S/ln M frente al tiempo. Azul: valor de equilibrio esperado para N partículas en M sectores. Línea verde: tiempo de recurrencia T = 2πN/ω₀ cuando las frecuencias son conmensurables.',
    'osc.readout': 't = {t} · S/ln M = {s} · equilibrio esperado {seq} · recurrencia {T}',
    'osc.hint': 'Frecuencias aleatorias y fases iguales: la entropía sube desde 0 hasta su máximo y ya no baja, salvo fluctuaciones que decrecen con N. Frecuencias equiespaciadas: sube igual, pero en t = 2πN/ω₀ todas las fases vuelven a coincidir y S vuelve a cero: el sistema es periódico, no ergódico. Partiendo de fases aleatorias nunca verás bajar la entropía: la "flecha del tiempo" viene de empezar en un estado ordenado.',
    'osc.eq.S': 'entropía del macroestado (ocupaciones fₖ de los M sectores)', 'osc.eq.M': 'número de sectores', 'osc.eq.Smax': 'entropía máxima ln M', 'osc.eq.Seq': 'valor de equilibrio con N finito, ln M − (M−1)/2N', 'osc.eq.T': 'tiempo de recurrencia (frecuencias equiespaciadas)',
    'osc.ind.ratio': 'S / S_eq', 'osc.ind.T': 'tiempo hasta la recurrencia',
  },
  en: {
    'osc.N': 'Oscillators N (2–2000)', 'osc.M': 'Sectors M (2–64)', 'osc.freqs': 'Frequencies', 'osc.freqs.random': 'Random (incommensurable)', 'osc.freqs.nearEqual': 'Nearly equal', 'osc.freqs.equispaced': 'Equispaced (commensurable)', 'osc.phases': 'Initial phases', 'osc.phases.zero': 'All equal (S = 0)', 'osc.phases.random': 'Random (S ≈ maximal)',
    'osc.cap.ring': 'Every oscillator is a point on the circle with phase θᵢ = θᵢ(0) + ωᵢt. The sectors define the macrostate; their occupation is shown as radial bars.',
    'osc.cap.plot': 'Macrostate entropy S/ln M versus time. Blue: expected equilibrium value for N particles in M sectors. Green line: recurrence time T = 2πN/ω₀ when the frequencies are commensurable.',
    'osc.readout': 't = {t} · S/ln M = {s} · expected equilibrium {seq} · recurrence {T}',
    'osc.hint': 'Random frequencies and equal phases: the entropy rises from 0 to its maximum and never comes down, apart from fluctuations that shrink with N. Equispaced frequencies: it rises the same way, but at t = 2πN/ω₀ all phases coincide again and S returns to zero: the system is periodic, not ergodic. Starting from random phases you will never see the entropy drop: the "arrow of time" comes from starting in an ordered state.',
    'osc.eq.S': 'macrostate entropy (occupations fₖ of the M sectors)', 'osc.eq.M': 'number of sectors', 'osc.eq.Smax': 'maximum entropy ln M', 'osc.eq.Seq': 'finite-N equilibrium value, ln M − (M−1)/2N', 'osc.eq.T': 'recurrence time (equispaced frequencies)',
    'osc.ind.ratio': 'S / S_eq', 'osc.ind.T': 'time to recurrence',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'ring', caption: 'osc.cap.ring' }, { id: 'plot', caption: 'osc.cap.plot' }], hintKey: 'osc.hint' });
  let state;
  const pN = numberField({ label: 'osc.N', value: 300, min: 2, max: 2000, integer: true });
  const pM = numberField({ label: 'osc.M', value: 12, min: 2, max: 64, integer: true });
  const pF = select({ label: 'osc.freqs', value: 'random', options: O.FREQS.map((v) => ({ value: v, label: `osc.freqs.${v}` })) });
  const pP = select({ label: 'osc.phases', value: 'zero', options: O.PHASES.map((v) => ({ value: v, label: `osc.phases.${v}` })) });
  ui.params.append(pN.el, pM.el, pF.el, pP.el);
  const ring = new Plot(ui.canvas.ring, { xmin: -1.2, xmax: 1.2, ymin: -1.2, ymax: 1.2 });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 't', ylabel: 'S / ln M' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'S = -\\sum_{k=1}^{\\htmlId{M}{M}} f_k \\ln f_k = \\htmlId{S}{S},\\qquad S_{\\max} = \\ln M = \\htmlId{Smax}{\\ln M}', slots: { M: { label: 'osc.eq.M' }, S: { label: 'osc.eq.S' }, Smax: { label: 'osc.eq.Smax' } } },
      { tex: 'S_{\\rm eq} \\simeq \\ln M - \\frac{M-1}{2N} = \\htmlId{Seq}{S_{\\rm eq}},\\qquad T_{\\rm rec} = \\frac{2\\pi N}{\\omega_0} = \\htmlId{T}{T}', slots: { Seq: { label: 'osc.eq.Seq' }, T: { label: 'osc.eq.T' } } },
    ],
    indicators: [{ key: 'ratio', label: 'osc.ind.ratio' }, { key: 'T', label: 'osc.ind.T' }],
  });
  function reset() {
    state = O.create({ N: pN.get(), M: pM.get(), freqs: pF.get(), phases: pP.get() });
    eq.update({ M: state.M, Smax: Math.log(state.M), Seq: O.expectedEntropy(state.N, state.M), T: O.recurrenceTime(state) });
  }
  function step() { O.step(state, 0.05); }
  function draw() {
    ring.clear();
    const f = O.occupation(state), M = state.M;
    ring.color('#ddd'); ring.disk(0, 0, 1, false);
    for (let k = 0; k < M; k++) {
      const a0 = 2 * Math.PI * k / M, a1 = 2 * Math.PI * (k + 1) / M, h = 1 + 0.6 * f[k] * M / 2;
      ring.color('rgba(31,78,156,0.18)');
      ring.ctx.beginPath(); const [cx, cy] = ring.toPixel(0, 0); const pr = ring.toPixel(h, 0)[0] - cx;
      ring.ctx.moveTo(cx, cy); ring.ctx.arc(cx, cy, pr, -a1, -a0); ring.ctx.closePath(); ring.ctx.fill();
      ring.color('#bbb'); ring.line(0, 0, 1.15 * Math.cos(a0), 1.15 * Math.sin(a0));
    }
    ring.color('#1f4e9c');
    for (let i = 0; i < state.N; i++) ring.disk(Math.cos(state.theta[i]), Math.sin(state.theta[i]), state.N > 500 ? 0.012 : 0.02);
    ring.end();
    const h = state.history, T = O.recurrenceTime(state), lnM = Math.log(M);
    const tmax = Math.max(50, Number.isFinite(T) ? T * 1.1 : 0, state.t * 1.05);
    plot.setScales(0, tmax, 0, 1.1); plot.clear();
    plot.color('#1f4e9c'); plot.line(0, O.expectedEntropy(state.N, M) / lnM, tmax, O.expectedEntropy(state.N, M) / lnM);
    if (Number.isFinite(T)) { plot.color('rgba(40,160,60,0.8)'); plot.line(T, 0, T, 1.1); }
    const stride = Math.max(1, Math.floor(h.length / 800)), xs = [], ys = [];
    for (let i = 0; i < h.length; i += stride) { xs.push(h[i][0]); ys.push(h[i][1] / lnM); }
    plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(1.5); if (xs.length > 1) plot.polyline(xs, ys); plot.lineWidth(1);
    plot.end();
    const S = h[h.length - 1][1], seq = O.expectedEntropy(state.N, M);
    ui.readout.textContent = i18n.t('osc.readout', { t: state.t.toFixed(1), s: (S / lnM).toFixed(3), seq: (seq / lnM).toFixed(3), T: Number.isFinite(T) ? `T = ${T.toFixed(1)}` : '∞' });
    eq.update({ S });
    eq.setIndicator('ratio', S / seq, Math.abs(S / seq - 1) < 0.05 ? 'ok' : 'warn');
    eq.setIndicator('T', Number.isFinite(T) ? Math.max(0, T - (state.t % T)) : Infinity);
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 40 }).el);
  reset();
  const off = autoResize([ring, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
