// Quantum wells in a two-band model — Quantum Devices experiment 4.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as TB2 from './model.js';

export const meta = { slug: 'dos-bandas', titleKey: 'tb2.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'tb2.sys': 'Heteroestructura', 'tb2.a': 'Espesor del pozo a (Å)',
    'tb2.cap.lev': 'Niveles confinados frente al espesor del pozo: modelo de una banda (Ben Daniel–Duke, punteado) y de dos bandas (continuo). La curva se construye al iniciar. Línea gris: V₀.',
    'tb2.cap.m': 'Masa efectiva dependiente de la energía m(E) = m(1 + E/E_g) en el pozo (rojo) y la barrera (azul) en unidades de m. Trazos: energías de los niveles de dos bandas.',
    'tb2.readout': '{sys} · a = {a} Å · V₀ = {V0} eV · E_gA = {EgA} eV · niveles (1 banda / 2 bandas, meV): {pairs} · error relativo del fundamental {err} %',
    'tb2.hint': 'La no parabolicidad aumenta la masa con la energía y baja todos los niveles; el error del modelo de una banda crece con E/E_g: es pequeño en GaAs-AlAs (gap 1.5 eV) y grande en InAs-GaSb (gap 0.36 eV), sobre todo en pozos estrechos donde los niveles son altos. Inicia para barrer el espesor.',
    'tb2.eq.a': 'espesor del pozo', 'tb2.eq.E1': 'nivel fundamental de una banda', 'tb2.eq.E2': 'nivel fundamental de dos bandas', 'tb2.eq.EgA': 'gap del semiconductor del pozo',
    'tb2.ind.err': '(E₁⁽¹⁾ − E₁⁽²⁾)/E₁⁽²⁾', 'tb2.ind.ratio': 'E₁⁽²⁾/E_gA (no parabolicidad)',
  },
  en: {
    'tb2.sys': 'Heterostructure', 'tb2.a': 'Well width a (Å)',
    'tb2.cap.lev': 'Confined levels versus well width: one-band model (Ben Daniel–Duke, dotted) and two-band model (solid). The curve builds up on start. Grey line: V₀.',
    'tb2.cap.m': 'Energy-dependent effective mass m(E) = m(1 + E/E_g) in the well (red) and the barrier (blue) in units of m. Ticks: energies of the two-band levels.',
    'tb2.readout': '{sys} · a = {a} Å · V₀ = {V0} eV · E_gA = {EgA} eV · levels (1 band / 2 bands, meV): {pairs} · ground-state relative error {err} %',
    'tb2.hint': 'Non-parabolicity increases the mass with energy and lowers every level; the one-band error grows with E/E_g: small in GaAs-AlAs (gap 1.5 eV), large in InAs-GaSb (gap 0.36 eV), especially in narrow wells where the levels are high. Start to sweep the width.',
    'tb2.eq.a': 'well width', 'tb2.eq.E1': 'one-band ground level', 'tb2.eq.E2': 'two-band ground level', 'tb2.eq.EgA': 'band gap of the well semiconductor',
    'tb2.ind.err': '(E₁⁽¹⁾ − E₁⁽²⁾)/E₁⁽²⁾', 'tb2.ind.ratio': 'E₁⁽²⁾/E_gA (non-parabolicity)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'lev', caption: 'tb2.cap.lev', cls: 'wide' }, { id: 'm', caption: 'tb2.cap.m' }], hintKey: 'tb2.hint' });
  let sysName = 'GaAs-AlAs', sys = TB2.SYSTEMS[sysName], a = 60, cmp = [], curve = [];
  const pS = select({ label: 'tb2.sys', value: sysName, options: Object.keys(TB2.SYSTEMS).map((k) => ({ value: k, label: k })), onChange: () => { curve = []; compute(); draw(); } });
  const pa = slider({ label: 'tb2.a', value: 60, min: 10, max: 200, step: 2, onChange: () => { compute(); draw(); } });
  ui.params.append(pS.el, pa.el);
  const pl = new Plot(ui.canvas.lev, { axes: true, xlabel: 'a (Å)', ylabel: 'E (eV)' });
  const pm = new Plot(ui.canvas.m, { axes: true, xlabel: 'E (eV)', ylabel: 'm(E)/m' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: 'm_A(E) = m_A\\Big(1 + \\frac{E}{\\htmlId{EgA}{E_{gA}}}\\Big),\\quad m_B(E) = m_B\\Big(1 + \\frac{E}{E_{gB}}\\Big),\\qquad a = \\htmlId{a}{a}', slots: { EgA: { label: 'tb2.eq.EgA' }, a: { label: 'tb2.eq.a' } } },
      { tex: '\\tan\\frac{k a}{2} = \\frac{m_A(E)}{m_B(E)}\\frac{\\kappa}{k};\\qquad E_1^{(1)} = \\htmlId{E1}{E_1^{(1)}},\\quad E_1^{(2)} = \\htmlId{E2}{E_1^{(2)}}', slots: { E1: { label: 'tb2.eq.E1' }, E2: { label: 'tb2.eq.E2' } } },
    ],
    indicators: [{ key: 'err', label: 'tb2.ind.err' }, { key: 'ratio', label: 'tb2.ind.ratio' }],
  });
  function compute() {
    sysName = pS.get(); sys = TB2.SYSTEMS[sysName]; a = pa.get(); cmp = TB2.compare(sys, a);
    if (!curve.some((p) => p.a === a)) { curve.push({ a, cmp }); curve.sort((p, q) => p.a - q.a); }
    eq.update({ EgA: sys.EgA, a, E1: cmp[0].E1 * 1000, E2: cmp[0].E2 * 1000 });
    eq.setIndicator('err', cmp[0].err, cmp[0].err < 0.05 ? 'ok' : 'warn'); eq.setIndicator('ratio', cmp[0].E2 / sys.EgA, 'none');
  }
  function reset() { curve = []; compute(); }
  function step() { const v = pa.get() + 2; if (v > 200) { loop.pause(); return; } pa.set(v); compute(); }
  function draw() {
    pl.setScales(10, 200, 0, sys.V0 * 1.1); pl.clear();
    pl.color('#999'); pl.line(10, sys.V0, 200, sys.V0);
    const cols = ['rgba(181,40,30,0.9)', 'rgba(220,130,20,0.9)', 'rgba(31,78,156,0.9)', 'rgba(40,160,60,0.9)', 'rgba(140,60,160,0.9)'];
    for (let i = 0; i < 5; i++) {
      const pts = curve.filter((p) => p.cmp[i]); if (!pts.length) continue;
      pl.ctx.setLineDash([4, 4]); pl.color(cols[i]); pl.polyline(pts.map((p) => p.a), pts.map((p) => p.cmp[i].E1)); pl.ctx.setLineDash([]);
      const p2 = pts.filter((p) => !Number.isNaN(p.cmp[i].E2)); pl.lineWidth(2); pl.polyline(p2.map((p) => p.a), p2.map((p) => p.cmp[i].E2)); pl.lineWidth(1);
    }
    pl.color('#222'); pl.line(a, 0, a, sys.V0 * 1.1);
    pl.end();
    pm.setScales(0, sys.V0, 0, 1 + sys.V0 / Math.min(sys.EgA, sys.EgB) * 1.1); pm.clear();
    const Es = Array.from({ length: 100 }, (_, i) => sys.V0 * i / 99);
    pm.color('rgba(181,40,30,0.9)'); pm.polyline(Es, Es.map((E) => 1 + E / sys.EgA)); pm.color('rgba(31,78,156,0.9)'); pm.polyline(Es, Es.map((E) => 1 + E / sys.EgB));
    pm.color('#555'); cmp.forEach((c) => { if (!Number.isNaN(c.E2)) pm.line(c.E2, 0, c.E2, 1 + c.E2 / sys.EgA); });
    pm.end();
    ui.readout.textContent = i18n.t('tb2.readout', { sys: sysName, a, V0: sys.V0, EgA: sys.EgA, pairs: cmp.map((c) => `${(c.E1 * 1000).toFixed(0)}/${Number.isNaN(c.E2) ? '–' : (c.E2 * 1000).toFixed(0)}`).join(', '), err: (cmp[0].err * 100).toFixed(1) });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 5 }).el);
  reset();
  const off = autoResize([pl, pm], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
