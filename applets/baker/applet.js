// Baker and Arnold transformations — Statistical Physics experiment 3.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, button, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as B from './model.js';

export const meta = { slug: 'baker', titleKey: 'baker.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'baker.map': 'Transformación', 'baker.map.baker': 'Panadero', 'baker.map.arnold': 'Gato de Arnold', 'baker.init': 'Dato inicial', 'baker.init.cat': 'Cara de gato', 'baker.init.disk': 'Círculo', 'baker.init.cloud': 'Nube aleatoria',
    'baker.n': 'Puntos (500–40000)', 'baker.t11': 't₁₁', 'baker.t12': 't₁₂', 'baker.t21': 't₂₁', 'baker.once': 'Una iteración', 'baker.undo': 'Volver al inicio',
    'baker.cap.map': 'Espacio de fases: el cuadrado unidad con condiciones periódicas. Cada punto se transforma en cada iteración; el área se conserva (det T = 1) pero las figuras se estiran, se cortan y se mezclan.',
    'baker.cap.plot': 'χ²/dof de la ocupación de una rejilla 10×10 frente a la uniforme, en función de la iteración. Tiende a 1 cuando los puntos se han repartido uniformemente (mixing); tras muchas iteraciones la precisión finita rompe la uniformidad.',
    'baker.readout': 'iteración = {k} · χ²/dof uniformidad = {chi} · fracción dentro del círculo inicial = {frac} (uniforme: {fu})',
    'baker.hint': 'Usa "Una iteración" para ver cómo el panadero corta y apila, o cómo el gato se estira a lo largo del autovector inestable. Tras 4–8 iteraciones la figura es irreconocible y la rejilla se llena uniformemente. Sigue pulsando: hacia la iteración 50 los puntos colapsan en bandas y luego en el origen, un artefacto de la aritmética de coma flotante (el gato de Arnold con coordenadas de 53 bits tiene un periodo finito).',
    'baker.eq.t11': 'elemento t₁₁ de la matriz', 'baker.eq.t12': 'elemento t₁₂', 'baker.eq.t21': 'elemento t₂₁', 'baker.eq.t22': 'elemento t₂₂ = (1 + t₁₂t₂₁)/t₁₁, fijado por det T = 1', 'baker.eq.lp': 'autovalor mayor (dirección que se estira)', 'baker.eq.lm': 'autovalor menor (dirección que se contrae)', 'baker.eq.h': 'exponente de Lyapunov / entropía de Kolmogorov–Sinai, ln λ₊',
    'baker.ind.chi': 'χ²/dof vs uniforme (≈1 si mixing)', 'baker.ind.k': 'iteraciones',
  },
  en: {
    'baker.map': 'Transformation', 'baker.map.baker': "Baker's", 'baker.map.arnold': "Arnold's cat", 'baker.init': 'Initial data', 'baker.init.cat': 'Cat face', 'baker.init.disk': 'Disk', 'baker.init.cloud': 'Random cloud',
    'baker.n': 'Points (500–40000)', 'baker.t11': 't₁₁', 'baker.t12': 't₁₂', 'baker.t21': 't₂₁', 'baker.once': 'One iteration', 'baker.undo': 'Back to start',
    'baker.cap.map': 'Phase space: the unit square with periodic boundaries. Every point is mapped at each iteration; area is preserved (det T = 1) but figures stretch, cut and mix.',
    'baker.cap.plot': 'χ²/dof of the occupation of a 10×10 grid against uniform, as a function of the iteration. It tends to 1 when points have spread uniformly (mixing); after many iterations finite precision breaks uniformity.',
    'baker.readout': 'iteration = {k} · uniformity χ²/dof = {chi} · fraction inside the initial disk = {frac} (uniform: {fu})',
    'baker.hint': 'Use "One iteration" to see how the baker cuts and stacks, or how the cat stretches along the unstable eigenvector. After 4–8 iterations the figure is unrecognisable and the grid fills uniformly. Keep pressing: around iteration 50 the points collapse into bands and then onto the origin, an artefact of floating-point arithmetic (Arnold\'s cat with 53-bit coordinates has a finite period).',
    'baker.eq.t11': 'matrix element t₁₁', 'baker.eq.t12': 'element t₁₂', 'baker.eq.t21': 'element t₂₁', 'baker.eq.t22': 'element t₂₂ = (1 + t₁₂t₂₁)/t₁₁, fixed by det T = 1', 'baker.eq.lp': 'larger eigenvalue (stretching direction)', 'baker.eq.lm': 'smaller eigenvalue (contracting direction)', 'baker.eq.h': 'Lyapunov exponent / Kolmogorov–Sinai entropy, ln λ₊',
    'baker.ind.chi': 'χ²/dof vs uniform (≈1 if mixing)', 'baker.ind.k': 'iterations',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'map', caption: 'baker.cap.map' }, { id: 'plot', caption: 'baker.cap.plot' }], hintKey: 'baker.hint' });
  let pts, k = 0, history = [], T = B.completeMatrix(1, 1, 1);
  const pMap = select({ label: 'baker.map', value: 'arnold', options: [{ value: 'baker', label: 'baker.map.baker' }, { value: 'arnold', label: 'baker.map.arnold' }], onChange: () => { syncMatrix(); loop.reset(); } });
  const pInit = select({ label: 'baker.init', value: 'cat', options: ['cat', 'disk', 'cloud'].map((v) => ({ value: v, label: `baker.init.${v}` })), onChange: () => loop.reset() });
  const pN = numberField({ label: 'baker.n', value: 8000, min: 500, max: 40000, integer: true });
  const p11 = numberField({ label: 'baker.t11', value: 1, min: 1, max: 9, integer: true, onChange: syncMatrix });
  const p12 = numberField({ label: 'baker.t12', value: 1, min: 0, max: 9, integer: true, onChange: syncMatrix });
  const p21 = numberField({ label: 'baker.t21', value: 1, min: 0, max: 9, integer: true, onChange: syncMatrix });
  const bOnce = button({ label: 'baker.once', onClick: () => { loop.pause(); if (!loop.started) { loop.reset(); loop.started = true; } iterateOnce(); draw(); } });
  const bUndo = button({ label: 'baker.undo', onClick: () => loop.reset() });
  ui.params.append(pMap.el, pInit.el, pN.el, p11.el, p12.el, p21.el, bOnce.el, bUndo.el);
  const map = new Plot(ui.canvas.map, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'k', ylabel: 'χ²/dof' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\begin{pmatrix} x\' \\\\ y\' \\end{pmatrix} = \\begin{pmatrix} \\htmlId{t11}{t_{11}} & \\htmlId{t12}{t_{12}} \\\\ \\htmlId{t21}{t_{21}} & \\htmlId{t22}{t_{22}} \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} \\bmod 1,\\qquad \\det T = 1', slots: { t11: { label: 'baker.eq.t11' }, t12: { label: 'baker.eq.t12' }, t21: { label: 'baker.eq.t21' }, t22: { label: 'baker.eq.t22' } } },
      { tex: '\\lambda_\\pm = \\htmlId{lp}{\\lambda_+},\\ \\htmlId{lm}{\\lambda_-};\\qquad h_{KS} = \\ln\\lambda_+ = \\htmlId{h}{h}', slots: { lp: { label: 'baker.eq.lp' }, lm: { label: 'baker.eq.lm' }, h: { label: 'baker.eq.h' } } },
      { tex: '\\text{Panadero: } x\' = 2x \\bmod 1,\\quad y\' = \\tfrac12\\big(y + \\lfloor 2x \\rfloor\\big),\\qquad h_{KS} = \\ln 2', slots: {} },
    ],
    indicators: [{ key: 'chi', label: 'baker.ind.chi' }, { key: 'k', label: 'baker.ind.k' }],
  });
  function syncMatrix() {
    T = pMap.get() === 'arnold' ? B.completeMatrix(p11.get(), p12.get(), p21.get()) : [[2, 0], [0, 0.5]];
    const e = pMap.get() === 'arnold' ? B.eigenvalues(T) : { lp: 2, lm: 0.5 };
    eq.update({ t11: T[0][0], t12: T[0][1], t21: T[1][0], t22: T[1][1], lp: e.lp, lm: e.lm, h: pMap.get() === 'arnold' ? B.lyapunov(T) : Math.log(2) });
    for (const p of [p11, p12, p21]) p.el.style.display = pMap.get() === 'arnold' ? '' : 'none';
  }
  const mapFn = () => (pMap.get() === 'baker' ? B.baker : (x, y) => B.arnold(x, y, T));
  function reset() {
    const n = pN.get(), init = pInit.get();
    pts = init === 'cat' ? B.cat(n) : init === 'disk' ? B.disk(n) : B.cloud(n);
    k = 0; history = [[0, B.uniformityChi2(pts)]]; syncMatrix();
  }
  function iterateOnce() { B.iterate(pts, mapFn()); k++; history.push([k, B.uniformityChi2(pts)]); if (history.length > 400) history.shift(); }
  function step() { iterateOnce(); if (k >= 80) loop.pause(); }
  function draw() {
    map.clear(); map.color('rgba(31,78,156,0.75)');
    const r = pts.x.length > 15000 ? 0.0025 : 0.004;
    for (let i = 0; i < pts.x.length; i++) map.disk(pts.x[i], pts.y[i], r);
    map.color('#222'); map.text(0.02, 0.95, `k = ${k}`, { font: '14px system-ui, sans-serif' });
    map.end();
    const kmax = Math.max(20, k + 2), ymax = Math.max(3, ...history.slice(-50).map((h) => h[1])) * 1.1;
    plot.setScales(0, kmax, 0, Math.min(ymax, 60)); plot.clear();
    plot.color('#1f4e9c'); plot.line(0, 1, kmax, 1);
    plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(2); plot.polyline(history.map((h) => h[0]), history.map((h) => Math.min(h[1], 60))); plot.lineWidth(1);
    plot.end();
    const chi = history[history.length - 1][1], frac = B.fractionInDisk(pts);
    ui.readout.textContent = i18n.t('baker.readout', { k, chi: chi.toFixed(2), frac: frac.toFixed(3), fu: (Math.PI * 0.09).toFixed(3) });
    eq.setIndicator('chi', chi, chi < 1.5 ? 'ok' : 'warn'); eq.setIndicator('k', k);
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 0.25 });
  ui.loopctl.append(loopControls(loop, { speedMin: -3, speedMax: 2, speed: 0.25 }).el);
  reset();
  const off = autoResize([map, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
