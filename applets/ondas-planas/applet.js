// Plane waves for band-structure calculations — Solid State experiment 7.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as PW from './model.js';

export const meta = { slug: 'ondas-planas', titleKey: 'opl.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'opl.V0': 'Amplitud del potencial V₀ (Ry)', 'opl.M': 'Ondas planas: 2M + 1 (M = 1…20)', 'opl.nb': 'Bandas a mostrar',
    'opl.cap.bands': 'Estructura de bandas E(k) del potencial de Mathieu V(x) = V₀ cos 2x en la primera zona de Brillouin (k en unidades de π/L, L = π). Gris: electrón libre plegado. Rojo: bandas calculadas con 2M + 1 ondas planas.',
    'opl.cap.pot': 'El potencial en una celda unidad y, en azul, los coeficientes de Fourier que entran en la matriz: solo V(±2) = V₀/2 son no nulos.',
    'opl.readout': 'V₀ = {V0} Ry · 2M+1 = {npw} ondas planas · gap en k = ±1 entre bandas 1 y 2: {g1} (electrones casi libres: V₀ = {nfe}) · gap entre bandas 2 y 3 en k = 0: {g2}',
    'opl.hint': 'Con V₀ pequeño las bandas son las parábolas del electrón libre plegadas en la zona, y el primer gap vale exactamente V₀ (teoría de perturbaciones degenerada en el borde de zona). Sube V₀: las bandas bajas se aplanan (electrones ligados, límite de enlace fuerte). Baja M a 1 ó 2 y mira cómo las bandas altas dejan de estar convergidas: la base truncada no puede describirlas.',
    'opl.eq.V0': 'amplitud del potencial', 'opl.eq.M': 'índice máximo de onda plana (2M + 1 funciones)', 'opl.eq.g1': 'anchura del primer gap (k = ±1)', 'opl.eq.nfe': 'predicción de electrones casi libres, 2|V(2)| = V₀',
    'opl.ind.ratio': 'gap calculado / V₀', 'opl.ind.conv': 'cambio del gap al pasar a M+4',
  },
  en: {
    'opl.V0': 'Potential amplitude V₀ (Ry)', 'opl.M': 'Plane waves: 2M + 1 (M = 1…20)', 'opl.nb': 'Bands to show',
    'opl.cap.bands': 'Band structure E(k) of the Mathieu potential V(x) = V₀ cos 2x in the first Brillouin zone (k in units of π/L, L = π). Grey: folded free electron. Red: bands computed with 2M + 1 plane waves.',
    'opl.cap.pot': 'The potential in one unit cell and, in blue, the Fourier coefficients entering the matrix: only V(±2) = V₀/2 are non-zero.',
    'opl.readout': 'V₀ = {V0} Ry · 2M+1 = {npw} plane waves · gap at k = ±1 between bands 1 and 2: {g1} (nearly free electrons: V₀ = {nfe}) · gap between bands 2 and 3 at k = 0: {g2}',
    'opl.hint': 'With small V₀ the bands are the free-electron parabolas folded into the zone, and the first gap equals exactly V₀ (degenerate perturbation theory at the zone boundary). Raise V₀: the low bands flatten (bound electrons, tight-binding limit). Lower M to 1 or 2 and watch the high bands lose convergence: the truncated basis cannot describe them.',
    'opl.eq.V0': 'potential amplitude', 'opl.eq.M': 'maximum plane-wave index (2M + 1 functions)', 'opl.eq.g1': 'width of the first gap (k = ±1)', 'opl.eq.nfe': 'nearly-free-electron prediction, 2|V(2)| = V₀',
    'opl.ind.ratio': 'computed gap / V₀', 'opl.ind.conv': 'change of the gap going to M+4',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'bands', caption: 'opl.cap.bands', cls: 'tall' }, { id: 'pot', caption: 'opl.cap.pot' }], hintKey: 'opl.hint' });
  let V0 = 1, M = 6, nb = 5, ks, B = null;
  const pV = slider({ label: 'opl.V0', value: 1, min: 0, max: 20, step: 0.1, format: (v) => v.toFixed(1), onChange: (v) => { V0 = v; compute(); draw(); } });
  const pM = slider({ label: 'opl.M', value: 6, min: 1, max: 20, step: 1, onChange: (v) => { M = v; compute(); draw(); } });
  const pB = numberField({ label: 'opl.nb', value: 5, min: 1, max: 12, integer: true, onChange: (v) => { nb = v; draw(); } });
  ui.params.append(pV.el, pM.el, pB.el);
  const bands = new Plot(ui.canvas.bands, { axes: true, xlabel: 'k L/π', ylabel: 'E (Ry)' });
  const pot = new Plot(ui.canvas.pot, { axes: true, xlabel: 'x', ylabel: 'V' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: '\\big[(k+2l)^2 - E\\big]\\,b_l + \\tfrac12 \\htmlId{V0}{V_0}\\,(b_{l-1} + b_{l+1}) = 0,\\qquad |l| \\le \\htmlId{M}{M}', slots: { V0: { label: 'opl.eq.V0' }, M: { label: 'opl.eq.M' } } },
      { tex: '\\Delta E_1(k=\\pm1) = \\htmlId{g1}{\\Delta E_1} \\;\\approx\\; 2|V(2)| = \\htmlId{nfe}{V_0}', slots: { g1: { label: 'opl.eq.g1' }, nfe: { label: 'opl.eq.nfe' } } },
    ],
    indicators: [{ key: 'ratio', label: 'opl.ind.ratio' }, { key: 'conv', label: 'opl.ind.conv', fmt: (v) => (Number.isNaN(v) ? '—' : v.toExponential(1)) }],
  });
  function compute() {
    ks = Array.from({ length: 121 }, (_, i) => -1 + 2 * i / 120); B = PW.bands(V0, M, ks);
    const g1 = PW.firstGap(V0, M), g1b = PW.firstGap(V0, M + 4);
    eq.update({ V0, M, g1, nfe: PW.nfeGap(V0) });
    eq.setIndicator('ratio', V0 ? g1 / V0 : NaN, V0 && Math.abs(g1 / V0 - 1) < 0.1 ? 'ok' : 'none'); eq.setIndicator('conv', Math.abs(g1 - g1b), Math.abs(g1 - g1b) < 1e-3 ? 'ok' : 'warn');
  }
  function reset() { V0 = pV.get(); M = pM.get(); nb = pB.get(); compute(); }
  function step() { V0 = Math.min(20, V0 + 0.1); pV.set(V0); compute(); if (V0 >= 20) loop.pause(); }
  function draw() {
    const Emax = Math.max(...B.map((b) => b[Math.min(nb, b.length) - 1])) * 1.05 + 1;
    bands.setScales(-1, 1, Math.min(0, -V0 * 1.05), Emax); bands.clear();
    bands.color('#bbb'); for (let l = -3; l <= 3; l++) bands.polyline(ks, ks.map((k) => (k + 2 * l) ** 2));
    bands.color('rgba(181,40,30,0.9)'); bands.lineWidth(2);
    for (let j = 0; j < Math.min(nb, 2 * M + 1); j++) bands.polyline(ks, B.map((b) => b[j]));
    bands.lineWidth(1); bands.end();
    const { xs, vs } = PW.potential(V0);
    pot.setScales(-Math.PI / 2, Math.PI / 2, -Math.max(1, V0) * 1.1, Math.max(1, V0) * 1.1); pot.clear();
    pot.color('#999'); pot.line(-Math.PI / 2, 0, Math.PI / 2, 0);
    pot.color('#222'); pot.lineWidth(2); pot.polyline(xs, vs); pot.lineWidth(1);
    pot.color('#1f4e9c'); pot.label(6, 4, `V(±2) = ${(V0 / 2).toFixed(2)}`);
    pot.end();
    const g1 = PW.firstGap(V0, M), b0 = PW.bands(V0, M, [0])[0], g2 = b0[2] - b0[1];
    ui.readout.textContent = i18n.t('opl.readout', { V0: V0.toFixed(1), npw: 2 * M + 1, g1: g1.toFixed(3), nfe: V0.toFixed(1), g2: g2.toFixed(3) });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 5 }).el);
  reset();
  const off = autoResize([bands, pot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
