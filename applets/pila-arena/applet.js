// Sandpile / Oslo model — mountable applet.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as P from './model.js';

export const meta = { slug: 'pila-arena', titleKey: 'pila.title', legacyPath: 'PILA_ARENA.JAVA', extra: true };

i18n.register({
  es: {
    'pila.columns': 'Columnas (4–200)', 'pila.hc': 'Pendiente crítica hc', 'pila.mode': 'Modelo', 'pila.fast': 'Sin animación (un grano por paso)',
    'pila.mode.fixed': 'Umbral fijo (original 2003)', 'pila.mode.oslo': 'Oslo: umbral aleatorio {hc, hc+1}',
    'pila.plot': 'Gráfica', 'pila.plot.series': 'Tamaño de avalancha frente al grano añadido', 'pila.plot.dist': 'Distribución de tamaños P(s), ejes log-log',
    'pila.cap.pile': 'Los granos entran por la columna izquierda; cuando la pendiente local alcanza el umbral, un grano pasa a la columna siguiente. Por la derecha salen del sistema. En rojo, los sitios que acaban de desestabilizarse.',
    'pila.cap.plot': 'Cada grano añadido desencadena una avalancha de s desplazamientos. Con umbral fijo todas acaban siendo iguales; en el modelo de Oslo aparece una ley de potencias.',
    'pila.readout': 'granos añadidos = {added} · en la pila = {inpile} · salidos = {out} · avalanchas = {n} · última s = {last} · pendiente media = {z}',
    'pila.hint': 'Compara los dos modelos con el mismo número de columnas. Para ver la ley de potencias en Oslo, marca "Sin animación", sube la velocidad y deja pasar unos miles de granos.',
    'pila.legend.slope': 'pendiente −1.55 (referencia)',
    'pila.eq.tau': 'exponente ajustado por regresión log-log al histograma de tamaños', 'pila.eq.z': 'pendiente media de la pila, h(0)/L',
    'pila.ind.tau': 'τ ajustado (Oslo: 1.55)', 'pila.ind.n': 'avalanchas registradas',
  },
  en: {
    'pila.columns': 'Columns (4–200)', 'pila.hc': 'Critical slope hc', 'pila.mode': 'Model', 'pila.fast': 'No animation (one grain per step)',
    'pila.mode.fixed': 'Fixed threshold (2003 original)', 'pila.mode.oslo': 'Oslo: random threshold {hc, hc+1}',
    'pila.plot': 'Plot', 'pila.plot.series': 'Avalanche size vs grain added', 'pila.plot.dist': 'Size distribution P(s), log-log axes',
    'pila.cap.pile': 'Grains enter at the left column; when the local slope reaches the threshold one grain moves to the next column. They leave the system on the right. Red marks the sites that just became unstable.',
    'pila.cap.plot': 'Each added grain triggers an avalanche of s moves. With a fixed threshold they all end up equal; the Oslo model shows a power law.',
    'pila.readout': 'grains added = {added} · in pile = {inpile} · left = {out} · avalanches = {n} · last s = {last} · mean slope = {z}',
    'pila.hint': 'Compare both models with the same number of columns. To see the Oslo power law, tick "No animation", raise the speed and let a few thousand grains fall.',
    'pila.legend.slope': 'slope −1.55 (reference)',
    'pila.eq.tau': 'exponent fitted by log-log regression to the size histogram', 'pila.eq.z': 'mean slope of the pile, h(0)/L',
    'pila.ind.tau': 'fitted τ (Oslo: 1.55)', 'pila.ind.n': 'avalanches recorded',
  },
});

// Least-squares slope of log10 P vs log10 s over the first decades (where statistics are good).
export function fitExponent(s, p) {
  const xs = [], ys = [];
  for (let i = 0; i < s.length; i++) if (p[i] > 0 && s[i] > 0) { xs.push(Math.log10(s[i])); ys.push(Math.log10(p[i])); }
  const n = xs.length; if (n < 3) return NaN;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; }
  const d = n * sxx - sx * sx; if (d === 0) return NaN;
  return -(n * sxy - sx * sy) / d;
}

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'pile', caption: 'pila.cap.pile' }, { id: 'graph', caption: 'pila.cap.plot' }], hintKey: 'pila.hint' });
  let state;
  const pCols = numberField({ label: 'pila.columns', value: 24, min: 4, max: 200, integer: true });
  const pHc = numberField({ label: 'pila.hc', value: 2, min: 1, max: 10, integer: true });
  const pMode = select({ label: 'pila.mode', value: 'fixed', options: [{ value: 'fixed', label: 'pila.mode.fixed' }, { value: 'oslo', label: 'pila.mode.oslo' }] });
  const pFast = checkbox({ label: 'pila.fast', checked: false });
  const pPlot = select({ label: 'pila.plot', value: 'series', options: [{ value: 'series', label: 'pila.plot.series' }, { value: 'dist', label: 'pila.plot.dist' }], onChange: () => draw() });
  ui.params.append(pCols.el, pHc.el, pMode.el, pFast.el, pPlot.el);

  const pile = new Plot(ui.canvas.pile, { xmin: 0, xmax: 24, ymin: 0, ymax: 24 });
  const graph = new Plot(ui.canvas.graph, { axes: true });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'B',
    equations: [
      { tex: 'P(s) \\propto s^{-\\htmlId{tau}{\\tau}},\\qquad z_c = \\htmlId{z}{\\langle h_i - h_{i+1}\\rangle}', slots: { tau: { label: 'pila.eq.tau' }, z: { label: 'pila.eq.z' } } },
      { tex: 'h_i - h_{i+1} \\ge z_i^{c} \\;\\Rightarrow\\; h_i \\to h_i - 1,\\; h_{i+1} \\to h_{i+1} + 1', slots: {} },
    ],
    indicators: [{ key: 'tau', label: 'pila.ind.tau' }, { key: 'n', label: 'pila.ind.n' }],
  });

  function reset() {
    state = P.create({ columns: pCols.get(), hc: pHc.get(), mode: pMode.get() });
    const c = state.columns;
    pile.setScales(0, c, 0, Math.max(8, c * (state.mode === 'oslo' ? state.hc + 1 : state.hc)));
  }
  function step() {
    if (pFast.get()) { P.drive(state); return; }
    if (state.current) P.relaxOnce(state); else P.addGrain(state);
  }
  function drawPile() {
    pile.clear();
    const c = state.columns;
    for (let i = 0; i < c; i++) {
      pile.color(state.lastToppled[i] ? '#b5281e' : '#d88a3a');
      pile.bar(i + 0.08, i + 0.92, state.h[i]);
      if (c <= 40) { pile.color('rgba(255,255,255,0.5)'); for (let g = 1; g < state.h[i]; g++) pile.line(i + 0.08, g, i + 0.92, g); }
    }
    pile.end();
  }
  function drawGraph() {
    const sizes = state.avalanches;
    const nz = sizes.filter((v) => v > 0);
    const dist = nz.length ? P.sizeDistribution(nz, 4) : { s: [], p: [] };
    if (pPlot.get() === 'series') {
      const n = sizes.length, win = 500, from = Math.max(0, n - win);
      const ymax = Math.max(10, ...sizes.slice(from));
      graph.xlabel = 'n'; graph.ylabel = 's'; graph.setScales(from, Math.max(from + win, n), 0, ymax * 1.1);
      graph.clear(); graph.color('#1f4e9c');
      for (let i = from; i < n; i++) graph.line(i, 0, i, sizes[i]);
      graph.end();
    } else {
      const { s, p } = dist;
      const xmax = Math.max(1, Math.log10(Math.max(2, ...nz)));
      graph.xlabel = 'log10 s'; graph.ylabel = 'log10 P(s)';
      graph.setScales(0, Math.ceil(xmax), -Math.ceil(Math.log10(Math.max(nz.length, 10))) - 1, 0.5);
      graph.clear();
      graph.color('rgba(181,40,30,0.75)');
      for (let b = 0; b < s.length; b++) graph.disk(Math.log10(s[b]), Math.log10(p[b]), 0.03);
      if (s.length > 1) {
        graph.color('#1f4e9c'); graph.lineWidth(2);
        const x0 = Math.log10(s[0]), y0 = Math.log10(p[0]);
        graph.line(x0, y0, x0 + xmax, y0 - 1.55 * xmax); graph.lineWidth(1);
        graph.color('#222'); graph.label(6, 4, i18n.t('pila.legend.slope'));
      }
      graph.end();
    }
    const tau = fitExponent(dist.s, dist.p);
    eq.update({ tau, z: state.h[0] / state.columns });
    eq.setIndicator('tau', tau, Number.isNaN(tau) ? 'none' : Math.abs(tau - 1.55) < 0.25 ? 'ok' : 'warn');
    eq.setIndicator('n', sizes.length);
  }
  function draw() {
    drawPile(); drawGraph();
    const n = state.avalanches.length;
    ui.readout.textContent = i18n.t('pila.readout', {
      added: state.added, inpile: P.grainsInPile(state), out: state.out, n, last: n ? state.avalanches[n - 1] : '–', z: (state.h[0] / state.columns).toFixed(2),
    });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 60 }).el);
  reset();
  const off = autoResize([pile, graph], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
