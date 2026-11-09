// Stochastic resonance — experiment 9.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, button, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import { mulberry32 } from '../../lib/rng.js';
import * as R from './model.js';

export const meta = { slug: 'resonancia', titleKey: 'res.title', legacyPath: '../../README.md', number: 9 };

i18n.register({
  es: {
    'res.N': 'Partículas (1–50)', 'res.kT': 'Temperatura kT', 'res.A': 'Amplitud de la señal A', 'res.T': 'Periodo T (pasos)', 'res.sweep': 'Barrer kT', 'res.plot': 'Gráfica', 'res.plot.series': 'x(t) y mínimo del potencial', 'res.plot.sweep': 'Respuesta frente a kT (barrido)',
    'res.cap.box': 'Doble pozo inclinado periódicamente, V(x,t) = (x² − 1)² + A·x·cos(ωt). La señal sola no basta para pasar de un pozo al otro: hacen falta las fluctuaciones térmicas.',
    'res.cap.plot': 'Rojo: posición (media) de las partículas. Azul: posición del mínimo global del potencial, que salta de −1 a +1 con la señal. En el barrido: amplitud de la respuesta a la frecuencia ω frente a kT; la línea vertical marca la temperatura para la que τ_K = T/2.',
    'res.readout': 't = {t} · periodos = {per} · τ_Kramers(kT) = {tau} pasos · T/2 = {T2} · amplitud de respuesta = {amp} · fracción de varianza a ω = {snr}',
    'res.hint': 'Con kT baja la partícula se queda en su pozo (sigue la señal solo dentro de él, con poca amplitud). Con kT alta salta sin ton ni son. Entre medias hay una temperatura para la que el tiempo de salto τ_K coincide con medio periodo y los saltos se sincronizan con la señal: la respuesta es máxima. "Barrer kT" lo mide automáticamente.',
    'res.eq.tau': 'tiempo medio de salto entre pozos (Kramers, red)', 'res.eq.T': 'periodo de la señal', 'res.eq.amp': 'amplitud de la componente de x(t) a la frecuencia ω', 'res.eq.kT': 'temperatura', 'res.eq.kTr': 'temperatura de resonancia (τ_K = T/2)',
    'res.ind.sync': 'τ_K / (T/2) (resonancia ≈ 1)', 'res.ind.amp': 'amplitud de respuesta (saltos completos: ≈ 2)',
  },
  en: {
    'res.N': 'Particles (1–50)', 'res.kT': 'Temperature kT', 'res.A': 'Signal amplitude A', 'res.T': 'Period T (steps)', 'res.sweep': 'Sweep kT', 'res.plot': 'Plot', 'res.plot.series': 'x(t) and potential minimum', 'res.plot.sweep': 'Response vs kT (sweep)',
    'res.cap.box': 'Periodically tilted double well, V(x,t) = (x² − 1)² + A·x·cos(ωt). The signal alone cannot move the particle to the other well: thermal fluctuations are needed.',
    'res.cap.plot': 'Red: (mean) particle position. Blue: position of the global minimum of the potential, jumping between −1 and +1 with the signal. In the sweep: response amplitude at frequency ω vs kT; the vertical line marks the temperature where τ_K = T/2.',
    'res.readout': 't = {t} · periods = {per} · τ_Kramers(kT) = {tau} steps · T/2 = {T2} · response amplitude = {amp} · variance fraction at ω = {snr}',
    'res.hint': 'At low kT the particle stays in its well (it follows the signal only inside it, with small amplitude). At high kT it hops randomly. In between there is a temperature where the hopping time τ_K matches half a period and the hops synchronise with the signal: the response is maximal. "Sweep kT" measures it automatically.',
    'res.eq.tau': 'mean hopping time between wells (lattice Kramers)', 'res.eq.T': 'signal period', 'res.eq.amp': 'amplitude of the ω component of x(t)', 'res.eq.kT': 'temperature', 'res.eq.kTr': 'resonant temperature (τ_K = T/2)',
    'res.ind.sync': 'τ_K / (T/2) (resonance ≈ 1)', 'res.ind.amp': 'response amplitude (full hops: ≈ 2)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'box', caption: 'res.cap.box' }, { id: 'plot', caption: 'res.cap.plot', cls: 'wide' }], hintKey: 'res.hint' });
  let state, sweepData = null, showSweep = false;
  const pN = numberField({ label: 'res.N', value: 5, min: 1, max: 50, integer: true });
  const pkT = slider({ label: 'res.kT', value: Math.log10(0.26), min: -1, max: 0.7, step: 0.02, format: (v) => (10 ** v).toFixed(3), onChange: (v) => { state.kT = 10 ** v; updateTheory(); } });
  const pA = slider({ label: 'res.A', value: 0.3, min: 0, max: 0.6, step: 0.05, format: (v) => v.toFixed(2), onChange: (v) => { state.A = v; } });
  const pT = slider({ label: 'res.T', value: Math.log10(6000), min: 2.7, max: 4.5, step: 0.05, format: (v) => Math.round(10 ** v).toString() });
  const bSweep = button({ label: 'res.sweep', onClick: runSweep });
  ui.params.append(pN.el, pkT.el, pA.el, pT.el, bSweep.el);

  const box = new Plot(ui.canvas.box, { axes: true, xlabel: 'x', ylabel: 'V' });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 't', ylabel: 'x' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'V(x,t) = (x^2-1)^2 + A\\,x\\cos\\omega t,\\qquad T = \\frac{2\\pi}{\\omega} = \\htmlId{T}{T}', slots: { T: { label: 'res.eq.T' } } },
      { tex: '\\tau_K(\\htmlId{kT}{kT}) = \\htmlId{tau}{\\tau_K}\\;\\stackrel{?}{=}\\;\\frac{T}{2}\\quad\\Rightarrow\\quad kT_{\\rm res} = \\htmlId{kTr}{kT_{\\rm res}}', slots: { kT: { label: 'res.eq.kT' }, tau: { label: 'res.eq.tau' }, kTr: { label: 'res.eq.kTr' } } },
      { tex: 'A_\\omega = 2\\,\\big|\\langle x(t)\\,e^{-i\\omega t}\\rangle\\big| = \\htmlId{amp}{A_\\omega}', slots: { amp: { label: 'res.eq.amp' } } },
    ],
    indicators: [{ key: 'sync', label: 'res.ind.sync' }, { key: 'amp', label: 'res.ind.amp' }],
  });

  function period() { return Math.round(10 ** pT.get()); }
  function updateTheory() {
    const tau = R.kramersTime(state.kT), T = state.period;
    eq.update({ T, kT: state.kT, tau, kTr: R.resonantTemperature(T) });
    const r = tau / (T / 2);
    eq.setIndicator('sync', r, r > 0.5 && r < 2 ? 'ok' : 'warn');
  }
  function reset() {
    state = R.create({ N: pN.get(), kT: 10 ** pkT.get(), A: pA.get(), period: period() });
    showSweep = false; updateTheory();
  }
  function step() { R.step(state); }
  function runSweep() {
    loop.pause();
    const T = period(), kTs = [];
    for (let e = -0.9; e <= 0.65; e += 0.11) kTs.push(10 ** e);
    sweepData = { T, A: pA.get(), kTr: R.resonantTemperature(T), points: R.sweep({ kTs, A: pA.get(), period: T, N: 20, periods: 8, rng: mulberry32(11) }) };
    showSweep = true; draw();
  }
  function drawBox() {
    const V = R.potentialAt(state.A, state.omega, state.t);
    box.setScales(R.XMIN, R.XMAX, -0.8, 1.6); box.clear();
    box.color('#222'); box.lineWidth(2); box.polyline(Array.from(state.xs), Array.from(V)); box.lineWidth(1);
    box.color('rgba(220,130,20,0.9)'); box.lineWidth(4); box.line(1.85, -0.8, 1.85, -0.8 + Math.min(2.4, state.kT)); box.lineWidth(1);
    box.color('rgba(31,78,156,0.85)');
    for (let i = 0; i < state.N; i++) box.disk(state.xs[state.x[i]], V[state.x[i]] + 0.06, 0.05);
    box.end();
  }
  function drawPlot() {
    if (showSweep && sweepData) {
      const pts = sweepData.points;
      plot.xlabel = 'log10 kT'; plot.ylabel = 'A_ω';
      plot.setScales(-1, 0.7, 0, Math.max(0.5, ...pts.map((p) => p.amp)) * 1.15); plot.clear();
      plot.color('rgba(40,160,60,0.7)'); plot.line(Math.log10(sweepData.kTr), 0, Math.log10(sweepData.kTr), 10);
      plot.color('#1f4e9c'); plot.lineWidth(2); plot.polyline(pts.map((p) => Math.log10(p.kT)), pts.map((p) => p.amp)); plot.lineWidth(1);
      plot.color('rgba(181,40,30,0.85)'); for (const p of pts) plot.disk(Math.log10(p.kT), p.amp, 0.02);
      plot.end();
      return;
    }
    const T = state.period, win = 4 * T, s = state.series, n = s.length, t = state.t;
    const from = Math.max(0, t - win);
    plot.xlabel = 't'; plot.ylabel = 'x';
    plot.setScales(from, from + win, -2, 2); plot.clear();
    plot.color('#999'); plot.line(from, 0, from + win, 0);
    // minimum position (theory) over the window
    const xs = [], ys = [];
    for (let i = 0; i <= 400; i++) { const tt = from + win * i / 400; xs.push(tt); ys.push(R.minimumPosition(state.A, state.omega, tt)); }
    plot.color('#1f4e9c'); plot.lineWidth(2); plot.polyline(xs, ys); plot.lineWidth(1);
    const stride = Math.max(1, Math.floor(n / 800)), sx = [], sy = [];
    for (let i = 0; i < n; i += stride) { const tt = t - n + i; if (tt >= from) { sx.push(tt); sy.push(s[i]); } }
    plot.color('rgba(181,40,30,0.85)'); if (sx.length > 1) plot.polyline(sx, sy);
    plot.end();
  }
  function draw() {
    drawBox(); drawPlot();
    const T = state.period, n = state.series.length;
    const skip = Math.min(n - 1, Math.max(0, n - 10 * T));
    const r = n > T ? R.response(state.series.slice(skip), state.omega, state.t - n + skip) : { amp: NaN, snr: NaN };
    const tau = R.kramersTime(state.kT);
    ui.readout.textContent = i18n.t('res.readout', { t: state.t, per: (state.t / T).toFixed(1), tau: tau.toExponential(2), T2: T / 2, amp: Number.isNaN(r.amp) ? '–' : r.amp.toFixed(2), snr: Number.isNaN(r.snr) ? '–' : r.snr.toFixed(2) });
    eq.update({ amp: r.amp });
    eq.setIndicator('amp', r.amp, Number.isNaN(r.amp) ? 'none' : r.amp > 1 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 50 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 400 }).el);
  reset();
  const off = autoResize([box, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
