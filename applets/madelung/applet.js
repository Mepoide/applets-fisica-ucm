// Madelung constant — Solid State experiment 1.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as Md from './model.js';

export const meta = { slug: 'madelung', titleKey: 'mad.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'mad.kmax': 'Cubos a sumar k_max (1–14)',
    'mad.cap.cube': 'El cubo de lado 2k alrededor del ion de referencia (centro). Los iones de las caras, aristas y vértices están compartidos con los cubos vecinos: Evjen los cuenta con peso 1/2, 1/4 y 1/8 para que cada cubo sea neutro.',
    'mad.cap.plot': 'Sumas parciales de la serie frente a k. Rojo: suma directa sobre el cubo (oscila, el cubo tiene carga neta ±e). Azul: método de Evjen (converge en pocos cubos). Línea: valor exacto α = 1.747565.',
    'mad.readout': 'k = {k} · suma directa = {naive} (carga del cubo {q}) · Evjen = {evjen} · exacto {exact} · error Evjen {err}',
    'mad.hint': 'La serie de Madelung es condicionalmente convergente: su valor depende de cómo se agrupen los términos. Sumar cubos enteros deja una carga neta ±e en la superficie que produce un error ∝ 1/k; los cubos neutros de Evjen cancelan ese término y el error cae varios órdenes de magnitud por cubo.',
    'mad.eq.k': 'número de cubos sumados', 'mad.eq.naive': 'suma directa sobre el cubo', 'mad.eq.evjen': 'suma de Evjen', 'mad.eq.exact': 'valor exacto para la estructura NaCl',
    'mad.ind.errN': 'error relativo suma directa', 'mad.ind.errE': 'error relativo Evjen',
  },
  en: {
    'mad.kmax': 'Cubes to add k_max (1–14)',
    'mad.cap.cube': 'The cube of side 2k around the reference ion (centre). Ions on faces, edges and corners are shared with neighbouring cubes: Evjen counts them with weights 1/2, 1/4 and 1/8 so that every cube is neutral.',
    'mad.cap.plot': 'Partial sums of the series versus k. Red: direct sum over the cube (oscillates; the cube has net charge ±e). Blue: Evjen\'s method (converges in a few cubes). Line: exact value α = 1.747565.',
    'mad.readout': 'k = {k} · direct sum = {naive} (cube charge {q}) · Evjen = {evjen} · exact {exact} · Evjen error {err}',
    'mad.hint': 'The Madelung series is conditionally convergent: its value depends on how the terms are grouped. Adding whole cubes leaves a net surface charge ±e that produces an error ∝ 1/k; Evjen\'s neutral cubes cancel that term and the error drops several orders of magnitude per cube.',
    'mad.eq.k': 'number of cubes added', 'mad.eq.naive': 'direct sum over the cube', 'mad.eq.evjen': 'Evjen sum', 'mad.eq.exact': 'exact value for the NaCl structure',
    'mad.ind.errN': 'relative error, direct sum', 'mad.ind.errE': 'relative error, Evjen',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'cube', caption: 'mad.cap.cube' }, { id: 'plot', caption: 'mad.cap.plot', cls: 'wide' }], hintKey: 'mad.hint' });
  let k = 0, kmax = 8, naive = [], evjen = [];
  const pK = numberField({ label: 'mad.kmax', value: 8, min: 1, max: 14, integer: true });
  ui.params.append(pK.el);
  const cube = new Plot(ui.canvas.cube, { xmin: -1.1, xmax: 1.1, ymin: -1.1, ymax: 1.1 });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'k', ylabel: 'α_k' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: "\\alpha = \\sum_{l,m,n}{}' \\frac{(-1)^{l+m+n+1}}{\\sqrt{l^2+m^2+n^2}},\\qquad k = \\htmlId{k}{k}", slots: { k: { label: 'mad.eq.k' } } },
      { tex: '\\alpha_k^{\\rm cubo} = \\htmlId{naive}{\\alpha_k},\\qquad \\alpha_k^{\\rm Evjen} = \\htmlId{evjen}{\\alpha_k^{E}},\\qquad \\alpha = \\htmlId{exact}{\\alpha}', slots: { naive: { label: 'mad.eq.naive' }, evjen: { label: 'mad.eq.evjen' }, exact: { label: 'mad.eq.exact' } } },
    ],
    indicators: [{ key: 'errN', label: 'mad.ind.errN', fmt: (v) => (Number.isNaN(v) ? '—' : v.toExponential(2)) }, { key: 'errE', label: 'mad.ind.errE', fmt: (v) => (Number.isNaN(v) ? '—' : v.toExponential(2)) }],
  });
  function reset() { kmax = pK.get(); k = 0; naive = []; evjen = []; eq.update({ k: 0, exact: Md.EXACT, naive: NaN, evjen: NaN }); }
  function step() { if (k >= kmax) { loop.pause(); return; } k++; naive.push(Md.naiveSum(k)); evjen.push(Md.evjenSum(k)); }
  function drawCube() {
    cube.clear();
    const kk = Math.max(1, k), n = 2 * kk + 1, cell = 2 / n;
    // front face of the cube as a checkerboard; edge/corner ions marked with their Evjen weight
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const l = i - kk, m = j - kk, x = -1 + i * cell, y = -1 + j * cell;
      const onEdge = (Math.abs(l) === kk ? 1 : 0) + (Math.abs(m) === kk ? 1 : 0) + 1; // +1: the face itself
      const positive = (l + m + kk) % 2 === 0;
      cube.color(positive ? `rgba(31,78,156,${1 / 2 ** (onEdge - 1)})` : `rgba(181,40,30,${1 / 2 ** (onEdge - 1)})`);
      cube.disk(x + cell / 2, y + cell / 2, cell * 0.36);
    }
    cube.color('#222'); cube.lineWidth(1.5); cube.rect(-1, -1, 2, 2, false); cube.lineWidth(1);
    cube.text(0, 1.02, `k = ${kk}`, { align: 'center', baseline: 'bottom', font: '14px system-ui, sans-serif' });
    cube.end();
  }
  function drawPlot() {
    plot.setScales(0.5, kmax + 0.5, 1.4, 2.0); plot.clear();
    plot.color('#999'); plot.line(0.5, Md.EXACT, kmax + 0.5, Md.EXACT);
    const ks = naive.map((_, i) => i + 1);
    plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(1.5); if (ks.length > 1) plot.polyline(ks, naive.map((v) => Math.max(1.4, Math.min(2, v)))); for (let i = 0; i < ks.length; i++) plot.disk(ks[i], Math.max(1.4, Math.min(2, naive[i])), 0.08);
    plot.color('#1f4e9c'); plot.lineWidth(2); if (ks.length > 1) plot.polyline(ks, evjen); for (let i = 0; i < ks.length; i++) plot.disk(ks[i], evjen[i], 0.08); plot.lineWidth(1);
    plot.end();
  }
  function draw() {
    drawCube(); drawPlot();
    const nv = naive[k - 1], ev = evjen[k - 1];
    ui.readout.textContent = i18n.t('mad.readout', { k, naive: k ? nv.toFixed(5) : '–', q: k ? Md.naiveCharge(k) : '–', evjen: k ? ev.toFixed(6) : '–', exact: Md.EXACT.toFixed(6), err: k ? Math.abs(ev - Md.EXACT).toExponential(2) : '–' });
    eq.update({ k, naive: nv, evjen: ev });
    eq.setIndicator('errN', k ? Math.abs(nv - Md.EXACT) / Md.EXACT : NaN, 'warn'); eq.setIndicator('errE', k ? Math.abs(ev - Md.EXACT) / Md.EXACT : NaN, k && Math.abs(ev - Md.EXACT) < 1e-3 ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 0.5 });
  ui.loopctl.append(loopControls(loop, { speedMin: -2, speedMax: 4 }).el);
  reset();
  const off = autoResize([cube, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
