// Optical absorption in molecular aggregates — Solid State experiment 10.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, checkbox, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as A from './model.js';

export const meta = { slug: 'agregados', titleKey: 'agr.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'agr.N': 'Moléculas N (2–80)', 'agr.gamma': 'Semianchura Γ de las líneas (unidades de J)', 'agr.W': 'Desorden diagonal W (unidades de J)', 'agr.periodic': 'Cadena periódica (anillo)',
    'agr.cap.spec': 'Espectro de absorción A(E) del agregado (rojo), suma de Lorentzianas centradas en las energías excitónicas con peso d_j². Barras azules: fuerza de oscilador de cada autoestado. Banda excitónica: de ε − 2J a ε + 2J.',
    'agr.cap.states': 'Autoestados |a_jn|² sobre la cadena para el estado brillante (rojo) y los dos siguientes (gris). En el agregado ordenado el brillante es el k = 0, completamente deslocalizado.',
    'agr.readout': 'N = {N} · Γ = {g} · W = {W} · estado brillante: E = {Eb}, f = {fb} de {N} (Σf = {sum}) · razón de participación {pr}',
    'agr.hint': 'Sin desorden toda la fuerza de oscilador está en un único estado (k = 0) en el borde inferior de la banda: la absorción se estrecha respecto a la molécula aislada (superradiancia del agregado J). Añade desorden W: la fuerza se reparte entre varios estados cerca del borde, la línea se ensancha y el estado brillante se localiza en un segmento de N* moléculas (razón de participación). Compara Γ pequeña y grande.',
    'agr.eq.N': 'número de moléculas', 'agr.eq.gamma': 'semianchura Lorentziana', 'agr.eq.Eb': 'energía del estado brillante', 'agr.eq.fb': 'fuerza de oscilador del estado brillante (máximo N)', 'agr.eq.W': 'anchura del desorden diagonal',
    'agr.ind.sum': 'Σ_j f_j / N (regla de suma: 1)', 'agr.ind.pr': 'razón de participación / N',
  },
  en: {
    'agr.N': 'Molecules N (2–80)', 'agr.gamma': 'Line half-width Γ (units of J)', 'agr.W': 'Diagonal disorder W (units of J)', 'agr.periodic': 'Periodic chain (ring)',
    'agr.cap.spec': 'Absorption spectrum A(E) of the aggregate (red), a sum of Lorentzians centred at the exciton energies with weights d_j². Blue bars: oscillator strength of each eigenstate. Exciton band: from ε − 2J to ε + 2J.',
    'agr.cap.states': 'Eigenstates |a_jn|² along the chain for the bright state (red) and the next two (grey). In the ordered aggregate the bright state is k = 0, fully delocalised.',
    'agr.readout': 'N = {N} · Γ = {g} · W = {W} · bright state: E = {Eb}, f = {fb} of {N} (Σf = {sum}) · participation ratio {pr}',
    'agr.hint': 'Without disorder all the oscillator strength sits in a single state (k = 0) at the lower band edge: absorption narrows relative to the isolated molecule (J-aggregate superradiance). Add disorder W: the strength spreads over several states near the edge, the line broadens and the bright state localises on a segment of N* molecules (participation ratio). Compare small and large Γ.',
    'agr.eq.N': 'number of molecules', 'agr.eq.gamma': 'Lorentzian half-width', 'agr.eq.Eb': 'bright-state energy', 'agr.eq.fb': 'bright-state oscillator strength (maximum N)', 'agr.eq.W': 'diagonal disorder width',
    'agr.ind.sum': 'Σ_j f_j / N (sum rule: 1)', 'agr.ind.pr': 'participation ratio / N',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'spec', caption: 'agr.cap.spec', cls: 'wide' }, { id: 'states', caption: 'agr.cap.states' }], hintKey: 'agr.hint' });
  let ex, Es;
  const pN = numberField({ label: 'agr.N', value: 20, min: 2, max: 80, integer: true });
  const pG = slider({ label: 'agr.gamma', value: 0.1, min: 0.02, max: 1, step: 0.02, format: (v) => v.toFixed(2), onChange: () => draw() });
  const pW = slider({ label: 'agr.W', value: 0, min: 0, max: 4, step: 0.1, format: (v) => v.toFixed(1), onChange: () => { compute(); draw(); } });
  const pP = checkbox({ label: 'agr.periodic', checked: true, onChange: () => { compute(); draw(); } });
  ui.params.append(pN.el, pG.el, pW.el, pP.el);
  const spec = new Plot(ui.canvas.spec, { axes: true, xlabel: 'E − ε (J)', ylabel: 'A(E)' });
  const st = new Plot(ui.canvas.states, { axes: true, xlabel: 'n', ylabel: '|a_jn|²' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'H = \\sum_n \\varepsilon_n |n\\rangle\\langle n| - J\\sum_n \\big(|n\\rangle\\langle n{+}1| + \\text{h.c.}\\big),\\qquad N = \\htmlId{N}{N},\\ W = \\htmlId{W}{W}', slots: { N: { label: 'agr.eq.N' }, W: { label: 'agr.eq.W' } } },
      { tex: 'A(E) = \\sum_j d_j^2\\,\\frac{\\htmlId{gamma}{\\Gamma}/\\pi}{(E - E_j)^2 + \\Gamma^2},\\quad d_j^2 = \\Big(\\sum_n a_{jn}\\Big)^2;\\qquad E_{\\rm b} = \\htmlId{Eb}{E_b},\\ d_{\\rm b}^2 = \\htmlId{fb}{f_b}', slots: { gamma: { label: 'agr.eq.gamma' }, Eb: { label: 'agr.eq.Eb' }, fb: { label: 'agr.eq.fb' } } },
    ],
    indicators: [{ key: 'sum', label: 'agr.ind.sum' }, { key: 'pr', label: 'agr.ind.pr' }],
  });
  function compute() { ex = A.excitons(pN.get(), { W: pW.get(), periodic: pP.get() }); Es = Array.from({ length: 400 }, (_, i) => -3.5 + 7 * i / 399); const b = A.brightState(ex); eq.update({ N: ex.N, W: pW.get(), Eb: b.E, fb: b.f }); eq.setIndicator('sum', A.totalStrength(ex) / ex.N, 'ok'); eq.setIndicator('pr', b.participation / ex.N, 'none'); }
  function reset() { compute(); }
  function step() { const w = Math.min(4, pW.get() + 0.1); pW.set(w); compute(); if (w >= 4) loop.pause(); }
  function draw() {
    const g = pG.get(); eq.update({ gamma: g });
    const Aspec = A.spectrum(ex, Es, g), amax = Math.max(...Aspec, 1e-9);
    spec.setScales(-3.5, 3.5, 0, Math.max(amax * 1.1, 1)); spec.clear();
    spec.color('rgba(31,78,156,0.12)'); spec.bar(-2, 2, spec.ymax);
    spec.color('rgba(31,78,156,0.8)'); for (let j = 0; j < ex.N; j++) spec.bar(ex.E[j] - 0.02, ex.E[j] + 0.02, ex.f[j] / ex.N * spec.ymax * 0.9);
    spec.color('rgba(181,40,30,0.9)'); spec.lineWidth(2); spec.polyline(Es, Array.from(Aspec)); spec.lineWidth(1);
    spec.end();
    const b = A.brightState(ex), order = Array.from({ length: ex.N }, (_, j) => j).sort((x, y) => ex.f[y] - ex.f[x]);
    st.setScales(0, ex.N, 0, Math.max(0.1, Math.max(...Array.from({ length: ex.N }, (_, n) => ex.vectors[b.j * ex.N + n] ** 2)) * 1.2)); st.clear();
    for (const [k, j] of [[2, order[2]], [1, order[1]]]) { if (j == null) continue; st.color(`rgba(120,120,120,${k === 1 ? 0.7 : 0.4})`); st.polyline(Array.from({ length: ex.N }, (_, n) => n + 0.5), Array.from({ length: ex.N }, (_, n) => ex.vectors[j * ex.N + n] ** 2)); }
    st.color('rgba(181,40,30,0.9)'); st.lineWidth(2); st.polyline(Array.from({ length: ex.N }, (_, n) => n + 0.5), Array.from({ length: ex.N }, (_, n) => ex.vectors[b.j * ex.N + n] ** 2)); st.lineWidth(1);
    st.end();
    ui.readout.textContent = i18n.t('agr.readout', { N: ex.N, g: g.toFixed(2), W: pW.get().toFixed(1), Eb: b.E.toFixed(3), fb: b.f.toFixed(2), sum: A.totalStrength(ex).toFixed(2), pr: b.participation.toFixed(1) });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 5 }).el);
  reset();
  const off = autoResize([spec, st], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
