// Diffusion in an external potential — experiment 7. Metropolis walkers relax to the Boltzmann state.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, slider, button, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as W from '../_walkers/metropolis.js';

export const meta = { slug: 'potencial', titleKey: 'pot.title', legacyPath: '../../README.md', number: 7 };

i18n.register({
  es: {
    'pot.N': 'Partículas (1–2000)', 'pot.kT': 'Temperatura kT', 'pot.V': 'Potencial', 'pot.V.parabolic': 'Parabólico', 'pot.V.sawSym': 'Diente de sierra simétrico', 'pot.V.sawAsym': 'Diente de sierra asimétrico', 'pot.reset': 'Borrar histograma',
    'pot.cap.box': 'Partículas brownianas independientes (puntos) sobre el potencial V(x) (línea negra). La barra naranja mide kT en la misma escala de energía: las partículas rara vez suben más que eso.',
    'pot.cap.plot': 'Rojo: histograma de posiciones promediado sobre los últimos ~500 pasos (media móvil exponencial). Azul: estado de Boltzmann p_i = e^{−V_i/kT}/Z.',
    'pot.readout': 't = {t} · muestras efectivas = {n} · kT = {kT} · Z = {Z} · χ²/dof = {chi2}',
    'pot.hint': 'Baja kT hacia 0: todas las partículas acaban en el mínimo (si el potencial es asimétrico, por la pendiente que sea). Súbela mucho: el potencial deja de notarse y el histograma se aplana. El tiempo de relajación crece al bajar kT; usa "Borrar histograma" después de cambiar la temperatura.',
    'pot.eq.kT': 'temperatura (energía térmica)', 'pot.eq.Z': 'función de partición Σ e^{−V_i/kT}', 'pot.eq.Vmax': 'altura del potencial en los bordes',
    'pot.ind.chi2': 'χ²/dof histograma vs Boltzmann', 'pot.ind.n': 'muestras efectivas',
  },
  en: {
    'pot.N': 'Particles (1–2000)', 'pot.kT': 'Temperature kT', 'pot.V': 'Potential', 'pot.V.parabolic': 'Parabolic', 'pot.V.sawSym': 'Symmetric sawtooth', 'pot.V.sawAsym': 'Asymmetric sawtooth', 'pot.reset': 'Clear histogram',
    'pot.cap.box': 'Independent Brownian particles (dots) on the potential V(x) (black line). The orange bar measures kT on the same energy scale: particles rarely climb higher than that.',
    'pot.cap.plot': 'Red: position histogram averaged over the last ~500 steps (exponential moving average). Blue: Boltzmann state p_i = e^{−V_i/kT}/Z.',
    'pot.readout': 't = {t} · effective samples = {n} · kT = {kT} · Z = {Z} · χ²/dof = {chi2}',
    'pot.hint': 'Lower kT towards 0: every particle ends in the minimum (for an asymmetric potential, down whichever slope). Raise it a lot: the potential stops mattering and the histogram flattens. The relaxation time grows as kT decreases; use "Clear histogram" after changing the temperature.',
    'pot.eq.kT': 'temperature (thermal energy)', 'pot.eq.Z': 'partition function Σ e^{−V_i/kT}', 'pot.eq.Vmax': 'potential height at the edges',
    'pot.ind.chi2': 'χ²/dof histogram vs Boltzmann', 'pot.ind.n': 'effective samples',
  },
});

const L = 81, VMAX = 4;

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'box', caption: 'pot.cap.box' }, { id: 'plot', caption: 'pot.cap.plot' }], hintKey: 'pot.hint' });
  let state, V, kT = 1;
  const pN = numberField({ label: 'pot.N', value: 300, min: 1, max: 2000, integer: true });
  const pV = select({ label: 'pot.V', value: 'parabolic', options: Object.keys(W.POTENTIALS).map((v) => ({ value: v, label: `pot.V.${v}` })), onChange: () => { setV(); W.resetAccumulator(state); draw(); } });
  const pkT = slider({ label: 'pot.kT', value: 0, min: -2, max: 1.2, step: 0.05, format: (v) => (10 ** v).toFixed(2), onChange: (v) => { kT = 10 ** v; state.kT = kT; W.resetAccumulator(state); eq.update({ kT, Z: W.partitionFunction(V, kT) }); draw(); } });
  const bClear = button({ label: 'pot.reset', onClick: () => { W.resetAccumulator(state); draw(); } });
  ui.params.append(pN.el, pV.el, pkT.el, bClear.el);

  const xs = W.xgrid(L);
  const box = new Plot(ui.canvas.box, { axes: true, xlabel: 'x', ylabel: 'V' });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'x', ylabel: 'p(x)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'p_i = \\frac{e^{-V_i/\\htmlId{kT}{kT}}}{Z},\\qquad Z = \\sum_j e^{-V_j/kT} = \\htmlId{Z}{Z}', slots: { kT: { label: 'pot.eq.kT' }, Z: { label: 'pot.eq.Z' } } },
      { tex: 'P(i\\to i\\pm1) = \\tfrac12\\min\\big(1,\\,e^{-[V(i\\pm1)-V(i)]/kT}\\big),\\qquad V_{\\max} = \\htmlId{Vmax}{V_{\\max}}', slots: { Vmax: { label: 'pot.eq.Vmax' } } },
    ],
    indicators: [{ key: 'chi2', label: 'pot.ind.chi2' }, { key: 'n', label: 'pot.ind.n' }],
  });

  function setV() { V = W.POTENTIALS[pV.get()](L, VMAX); if (state) W.setPotential(state, V); eq.update({ kT, Z: W.partitionFunction(V, kT), Vmax: VMAX }); }
  function reset() { setV(); kT = 10 ** pkT.get(); state = W.createWalkers({ N: pN.get(), V, kT }); }
  const TAU = 500;
  function step() { W.stepWalkers(state); W.accumulateEma(state, TAU); }
  function drawBox() {
    box.setScales(-1, 1, -0.3, VMAX * 1.1); box.clear();
    // kT bar
    box.color('rgba(220,130,20,0.9)'); box.lineWidth(4); box.line(0.9, 0, 0.9, Math.min(VMAX * 1.1, kT)); box.lineWidth(1);
    box.color('#222'); box.lineWidth(2); box.polyline(Array.from(xs), Array.from(V)); box.lineWidth(1);
    const h = W.occupancy(state);
    box.color('rgba(31,78,156,0.8)');
    for (let i = 0; i < L; i++) for (let k = 0; k < h[i]; k++) { if (k > 40) break; box.disk(xs[i], V[i] + 0.06 + 0.07 * k, 0.012); }
    box.end();
  }
  function drawPlot() {
    const p = state.pEma ?? new Float64Array(L), q = W.boltzmann(V, kT);
    const pmax = Math.max(...q, ...p) * 1.15 || 1;
    plot.setScales(-1, 1, 0, pmax); plot.clear();
    const dx = 2 / (L - 1);
    plot.color('rgba(181,40,30,0.7)');
    if (state.nEma) for (let i = 0; i < L; i++) plot.bar(xs[i] - dx / 2, xs[i] + dx / 2, p[i]);
    plot.color('#1f4e9c'); plot.lineWidth(2); plot.polyline(Array.from(xs), Array.from(q)); plot.lineWidth(1);
    plot.end();
    const n = Math.round((state.nEma ?? 0) * state.N); // effective samples in the moving average
    const c2 = (state.nEma ?? 0) > 20 ? W.chi2Reduced(p, q, n) : NaN;
    ui.readout.textContent = i18n.t('pot.readout', { t: state.t, n, kT: kT.toFixed(2), Z: W.partitionFunction(V, kT).toExponential(2), chi2: Number.isNaN(c2) ? '–' : c2.toFixed(2) });
    eq.setIndicator('chi2', c2, Number.isNaN(c2) ? 'none' : c2 < 3 ? 'ok' : 'warn');
    eq.setIndicator('n', n);
  }
  function draw() { drawBox(); drawPlot(); }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 10 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 100 }).el);
  reset();
  const off = autoResize([box, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
