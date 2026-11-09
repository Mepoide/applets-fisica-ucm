// Electronic surface states — Solid State experiment 8.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as SS from './model.js';

export const meta = { slug: 'estados-superficiales', titleKey: 'sup.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'sup.P': 'Intensidad P de los potenciales atómicos (P < 0: pozos)', 'sup.a': 'Parámetro de red a', 'sup.V0': 'Altura del vacío V₀', 'sup.N': 'Celdas del cristal N', 'sup.state': 'Estado a dibujar',
    'sup.cap.spec': 'Espectro del cristal semi-infinito terminado en z = 0. Sombreado: bandas del cristal infinito (Kronig–Penney). Trazos: niveles calculados; los que caen en un gap (rojo) son estados superficiales. Verde: V₀.',
    'sup.cap.wf': 'Función de onda del estado seleccionado: los estados de banda son extendidos por todo el cristal; el estado superficial decae exponencialmente hacia el interior y hacia el vacío.',
    'sup.readout': 'P = {P} · a = {a} · V₀ = {V0} · N = {N} · niveles en [E_min, V₀]: {n} · estados en gaps: {ng} · estado dibujado E = {E} ({kind}) · peso cerca de la superficie {w}',
    'sup.hint': 'Con P < 0 (átomos como pozos atractivos) hay un estado en el gap entre la primera y la segunda banda para una amplia gama de V₀: es el estado de Tamm, ligado a la ruptura de la periodicidad. Con P > 0 el modelo no admite estado superficial con esta terminación. Cambia V₀: el nivel se mueve dentro del gap y desaparece si sale de él. Aumenta N: los niveles de las bandas se densifican, el superficial no cambia.',
    'sup.eq.P': 'intensidad del potencial atómico', 'sup.eq.a': 'parámetro de red', 'sup.eq.V0': 'altura del escalón de vacío', 'sup.eq.Es': 'energía del estado superficial (primer gap)', 'sup.eq.kappa': 'constante de decaimiento en el vacío √(V₀ − E)',
    'sup.ind.ng': 'estados en gaps', 'sup.ind.w': 'peso de |ψ|² en ±2a de la superficie',
  },
  en: {
    'sup.P': 'Strength P of the atomic potentials (P < 0: wells)', 'sup.a': 'Lattice parameter a', 'sup.V0': 'Vacuum height V₀', 'sup.N': 'Crystal cells N', 'sup.state': 'State to draw',
    'sup.cap.spec': 'Spectrum of the semi-infinite crystal terminated at z = 0. Shading: bands of the infinite crystal (Kronig–Penney). Ticks: computed levels; those falling in a gap (red) are surface states. Green: V₀.',
    'sup.cap.wf': 'Wave function of the selected state: band states extend over the whole crystal; the surface state decays exponentially both into the bulk and into the vacuum.',
    'sup.readout': 'P = {P} · a = {a} · V₀ = {V0} · N = {N} · levels in [E_min, V₀]: {n} · gap states: {ng} · drawn state E = {E} ({kind}) · weight near the surface {w}',
    'sup.hint': 'With P < 0 (atoms as attractive wells) there is a state in the gap between the first and second bands for a wide range of V₀: the Tamm state, bound to the breaking of periodicity. With P > 0 the model has no surface state for this termination. Change V₀: the level moves inside the gap and disappears if it leaves it. Increase N: band levels get denser, the surface one does not change.',
    'sup.eq.P': 'atomic potential strength', 'sup.eq.a': 'lattice parameter', 'sup.eq.V0': 'vacuum step height', 'sup.eq.Es': 'surface-state energy (first gap)', 'sup.eq.kappa': 'vacuum decay constant √(V₀ − E)',
    'sup.ind.ng': 'gap states', 'sup.ind.w': 'weight of |ψ|² within ±2a of the surface',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'spec', caption: 'sup.cap.spec' }, { id: 'wf', caption: 'sup.cap.wf', cls: 'wide' }], hintKey: 'sup.hint' });
  let P = -3, a = 1, V0 = 12, N = 30, evs = [], gapIdx = [], sel = 0, Emin = -10;
  const pP = numberField({ label: 'sup.P', value: -3, min: -10, max: 10, step: 0.5 });
  const pa = numberField({ label: 'sup.a', value: 1, min: 0.5, max: 2, step: 0.1 });
  const pV = numberField({ label: 'sup.V0', value: 12, min: 1, max: 60, step: 0.5 });
  const pN = numberField({ label: 'sup.N', value: 30, min: 5, max: 80, integer: true });
  const pS = select({ label: 'sup.state', value: '0', options: [{ value: '0', label: '0' }], onChange: (v) => { sel = Number(v); draw(); } });
  ui.params.append(pP.el, pa.el, pV.el, pN.el, pS.el);
  const spec = new Plot(ui.canvas.spec, { axes: true, xlabel: '', ylabel: 'E' });
  const wf = new Plot(ui.canvas.wf, { axes: true, xlabel: 'z / a', ylabel: 'ψ' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'V(z) = \\htmlId{P}{P}\\sum_{n\\ge1}\\delta(z + n\\htmlId{a}{a})\\ (z<0),\\qquad V(z) = \\htmlId{V0}{V_0}\\ (z>0)', slots: { P: { label: 'sup.eq.P' }, a: { label: 'sup.eq.a' }, V0: { label: 'sup.eq.V0' } } },
      { tex: '\\cos ka = \\cos qa + \\frac{P}{2q}\\sin qa;\\quad \\text{gap: } k = \\frac{n\\pi}{a} + i\\mu;\\qquad E_s = \\htmlId{Es}{E_s},\\ \\kappa = \\htmlId{kappa}{\\kappa}', slots: { Es: { label: 'sup.eq.Es' }, kappa: { label: 'sup.eq.kappa' } } },
    ],
    indicators: [{ key: 'ng', label: 'sup.ind.ng' }, { key: 'w', label: 'sup.ind.w' }],
  });
  function compute() {
    P = pP.get(); a = pa.get(); V0 = pV.get(); N = pN.get();
    Emin = P < 0 ? -P * P / 4 - 2 : -1;
    evs = SS.eigenvalues(P, a, N, V0, Emin, V0 - 0.02);
    gapIdx = evs.map((E, i) => (SS.inBand(E, P, a) ? -1 : i)).filter((i) => i >= 0);
    pS.input.replaceChildren(...evs.map((E, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = `${i + 1}: E = ${E.toFixed(3)}${gapIdx.includes(i) ? ' ★' : ''}`; return o; }));
    sel = gapIdx.length ? gapIdx[0] : Math.floor(evs.length / 2); pS.set(String(sel));
    const Es = gapIdx.length ? evs[gapIdx[0]] : NaN;
    eq.update({ P, a, V0, Es, kappa: Number.isNaN(Es) ? NaN : Math.sqrt(V0 - Es) });
    eq.setIndicator('ng', gapIdx.length, gapIdx.length ? 'ok' : 'warn');
  }
  function reset() { compute(); }
  // Start sweeps the vacuum height so the surface level can be seen moving inside the gap.
  function step() { const v = Math.min(60, pV.get() + 0.5); pV.set(v); compute(); if (v >= 60) loop.pause(); }
  function draw() {
    spec.setScales(0, 1, Emin, V0 * 1.05); spec.clear();
    const edges = SS.bandEdges(P, a, Emin, V0 * 1.05);
    spec.color('rgba(31,78,156,0.15)');
    const pts = [Emin, ...edges, V0 * 1.05];
    for (let i = 0; i + 1 < pts.length; i++) if (SS.inBand(0.5 * (pts[i] + pts[i + 1]), P, a)) spec.bar(0.1, 0.9, pts[i + 1], pts[i]);
    spec.color('rgba(40,160,60,0.8)'); spec.line(0, V0, 1, V0);
    evs.forEach((E, i) => { spec.color(gapIdx.includes(i) ? 'rgba(181,40,30,0.95)' : 'rgba(31,78,156,0.6)'); spec.lineWidth(gapIdx.includes(i) ? 2.5 : 1); spec.line(0.15, E, 0.85, E); });
    spec.lineWidth(1);
    if (evs[sel] != null) { spec.color('#222'); spec.disk(0.92, evs[sel], 0.015); }
    spec.end();
    const E = evs[sel];
    if (E != null) {
      const w = SS.waveFunction(E, P, a, N, V0, -N * a, 3 * a, 900);
      wf.setScales(-N, 3, -1.1, 1.1); wf.clear();
      wf.color('rgba(40,160,60,0.15)'); wf.bar(0, 3, 1.1, -1.1);
      wf.color('#999'); wf.line(-N, 0, 3, 0); for (let n = 1; n <= N; n++) wf.line(-n, -0.08, -n, 0.08);
      wf.color(gapIdx.includes(sel) ? 'rgba(181,40,30,0.95)' : '#1f4e9c'); wf.lineWidth(1.5); wf.polyline(w.zs.map((z) => z / a), w.ps); wf.lineWidth(1);
      wf.end();
      const weight = SS.surfaceWeight(w, a);
      ui.readout.textContent = i18n.t('sup.readout', { P, a, V0, N, n: evs.length, ng: gapIdx.length, E: E.toFixed(3), kind: gapIdx.includes(sel) ? '★' : 'banda', w: weight.toFixed(2) });
      eq.setIndicator('w', weight, weight > 0.3 ? 'ok' : 'none');
    }
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 2 }).el);
  reset();
  const off = autoResize([spec, wf], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
