import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, loopControls } from '../../lib/ui.js';
import { setupPage, autoResize } from '../../lib/page.js';
import * as P from './model.js';

i18n.register({
  es: {
    'pila.title': 'Pila de arena y criticalidad autoorganizada',
    'pila.columns': 'Columnas (4–200)', 'pila.hc': 'Pendiente crítica hc', 'pila.mode': 'Modelo', 'pila.fast': 'Sin animación (un grano por paso)',
    'pila.mode.fixed': 'Umbral fijo (original 2003)', 'pila.mode.oslo': 'Oslo: umbral aleatorio {hc, hc+1}',
    'pila.plot': 'Gráfica', 'pila.plot.series': 'Tamaño de avalancha frente al grano añadido', 'pila.plot.dist': 'Distribución de tamaños P(s), ejes log-log',
    'pila.cap.pile': 'Los granos entran por la columna izquierda; cuando la pendiente local alcanza el umbral, un grano pasa a la columna siguiente. Por la derecha salen del sistema. En rojo, los sitios que acaban de desestabilizarse.',
    'pila.cap.plot': 'Cada grano añadido desencadena una avalancha de s desplazamientos. Con umbral fijo todas acaban siendo iguales; en el modelo de Oslo aparece una ley de potencias.',
    'pila.readout': 'granos añadidos = {added} · en la pila = {inpile} · salidos = {out} · avalanchas = {n} · última s = {last} · pendiente media = {z}',
    'pila.hint': 'Compara los dos modelos con el mismo número de columnas. Para ver la ley de potencias en Oslo, marca "Sin animación", sube la velocidad y deja pasar unos miles de granos.',
    'pila.legend.slope': 'pendiente −1.55 (referencia)',
  },
  en: {
    'pila.title': 'Sandpile and self-organized criticality',
    'pila.columns': 'Columns (4–200)', 'pila.hc': 'Critical slope hc', 'pila.mode': 'Model', 'pila.fast': 'No animation (one grain per step)',
    'pila.mode.fixed': 'Fixed threshold (2003 original)', 'pila.mode.oslo': 'Oslo: random threshold {hc, hc+1}',
    'pila.plot': 'Plot', 'pila.plot.series': 'Avalanche size vs grain added', 'pila.plot.dist': 'Size distribution P(s), log-log axes',
    'pila.cap.pile': 'Grains enter at the left column; when the local slope reaches the threshold one grain moves to the next column. They leave the system on the right. Red marks the sites that just became unstable.',
    'pila.cap.plot': 'Each added grain triggers an avalanche of s moves. With a fixed threshold they all end up equal; the Oslo model shows a power law.',
    'pila.readout': 'grains added = {added} · in pile = {inpile} · left = {out} · avalanches = {n} · last s = {last} · mean slope = {z}',
    'pila.hint': 'Compare both models with the same number of columns. To see the Oslo power law, tick "No animation", raise the speed and let a few thousand grains fall.',
    'pila.legend.slope': 'slope −1.55 (reference)',
  },
});
setupPage({ slug: 'pila-arena', titleKey: 'pila.title', legacyPath: 'PILA_ARENA.JAVA' });

let state;
const pCols = numberField({ label: 'pila.columns', value: 24, min: 4, max: 200, integer: true });
const pHc = numberField({ label: 'pila.hc', value: 2, min: 1, max: 10, integer: true });
const pMode = select({ label: 'pila.mode', value: 'fixed', options: [{ value: 'fixed', label: 'pila.mode.fixed' }, { value: 'oslo', label: 'pila.mode.oslo' }] });
const pFast = checkbox({ label: 'pila.fast', checked: false });
const pPlot = select({ label: 'pila.plot', value: 'series', options: [{ value: 'series', label: 'pila.plot.series' }, { value: 'dist', label: 'pila.plot.dist' }], onChange: () => draw() });
document.getElementById('params').append(pCols.el, pHc.el, pMode.el, pFast.el, pPlot.el);

const pile = new Plot(document.getElementById('pile'), { xmin: 0, xmax: 24, ymin: 0, ymax: 24 });
const graph = new Plot(document.getElementById('graph'), { axes: true });

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
  if (pPlot.get() === 'series') {
    const n = sizes.length, win = 500, from = Math.max(0, n - win);
    const ymax = Math.max(10, ...sizes.slice(from));
    graph.xlabel = 'n'; graph.ylabel = 's'; graph.setScales(from, Math.max(from + win, n), 0, ymax * 1.1);
    graph.clear(); graph.color('#1f4e9c');
    for (let i = from; i < n; i++) graph.line(i, 0, i, sizes[i]);
    graph.end();
  } else {
    const nz = sizes.filter((v) => v > 0);
    const { s, p } = P.sizeDistribution(nz, 4);
    const xmax = Math.max(1, Math.log10(Math.max(2, ...nz)));
    graph.xlabel = 'log10 s'; graph.ylabel = 'log10 P(s)';
    graph.setScales(0, Math.ceil(xmax), -Math.ceil(Math.log10(Math.max(nz.length, 10))) - 1, 0.5);
    graph.clear();
    graph.color('#1f4e9c');
    for (let b = 0; b < s.length; b++) graph.disk(Math.log10(s[b]), Math.log10(p[b]), 0.03);
    if (s.length > 1) {
      graph.color('rgba(181,40,30,0.8)');
      const x0 = Math.log10(s[0]), y0 = Math.log10(p[0]);
      graph.line(x0, y0, x0 + xmax, y0 - 1.55 * xmax);
      graph.color('#222'); graph.label(6, 4, i18n.t('pila.legend.slope'));
    }
    graph.end();
  }
}
function draw() {
  drawPile(); drawGraph();
  const n = state.avalanches.length;
  document.getElementById('readout').textContent = i18n.t('pila.readout', {
    added: state.added, inpile: P.grainsInPile(state), out: state.out, n, last: n ? state.avalanches[n - 1] : '–', z: (state.h[0] / state.columns).toFixed(2),
  });
}
const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
document.getElementById('loopctl').append(loopControls(loop, { speedMin: 1, speedMax: 60 }).el);
reset();
autoResize([pile, graph], draw);
