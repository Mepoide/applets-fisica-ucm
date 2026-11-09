// Electronic states in quantum wells — Quantum Devices experiment 1 (Ben Daniel–Duke, graphical solution).
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as QW from './model.js';

export const meta = { slug: 'pozo-cuantico', titleKey: 'qw.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'qw.x': 'Fracción de Al x', 'qw.a': 'Espesor del pozo a (Å)',
    'qw.cap.graph': 'Solución gráfica en θ = ka/2: tan θ (pares, azul) y −cot θ (impares, azul claro) frente a la función raíz (m_A/m_B)κ/k (verde). Cada intersección (círculo) es un nivel confinado.',
    'qw.cap.env': 'Perfil del pozo (gris) con los niveles y sus funciones envolventes (pares rojo, impares naranja). Trazos punteados: niveles del pozo infinito con la misma masa, siempre por encima.',
    'qw.readout': 'x = {x} · a = {a} Å · V₀ = {V0} meV · m_A = {mA}, m_B = {mB} · niveles: {n} · E = {Es} meV',
    'qw.hint': 'La función raíz corta el eje en θ₀ = (a/2)√(m_A V₀)/ħ: cada vez que θ₀ supera un múltiplo de π/2 aparece un nivel más. Un pozo siempre tiene al menos un estado par. Compara con los niveles del pozo infinito (punteados): la penetración en la barrera baja la energía, tanto más cuanto más cerca de V₀ está el nivel. Inicia para barrer el espesor.',
    'qw.eq.x': 'fracción de aluminio en la barrera', 'qw.eq.a': 'espesor de la lámina de GaAs', 'qw.eq.V0': 'desajuste de bandas 0.773x', 'qw.eq.E1': 'energía del estado fundamental', 'qw.eq.n': 'número de estados confinados',
    'qw.ind.ratio': 'E₁ / E₁ del pozo infinito', 'qw.ind.n': 'estados confinados (⌈2θ₀/π⌉)',
  },
  en: {
    'qw.x': 'Al fraction x', 'qw.a': 'Well width a (Å)',
    'qw.cap.graph': 'Graphical solution in θ = ka/2: tan θ (even, blue) and −cot θ (odd, light blue) against the root function (m_A/m_B)κ/k (green). Each intersection (circle) is a confined level.',
    'qw.cap.env': 'Well profile (grey) with the levels and their envelope functions (even red, odd orange). Dotted: infinite-well levels with the same mass, always above.',
    'qw.readout': 'x = {x} · a = {a} Å · V₀ = {V0} meV · m_A = {mA}, m_B = {mB} · levels: {n} · E = {Es} meV',
    'qw.hint': 'The root function meets the axis at θ₀ = (a/2)√(m_A V₀)/ħ: every time θ₀ passes a multiple of π/2 a new level appears. A well always has at least one even state. Compare with the infinite-well levels (dotted): penetration into the barrier lowers the energy, the more so the closer the level is to V₀. Start to sweep the width.',
    'qw.eq.x': 'aluminium fraction in the barrier', 'qw.eq.a': 'GaAs layer thickness', 'qw.eq.V0': 'band offset 0.773x', 'qw.eq.E1': 'ground-state energy', 'qw.eq.n': 'number of confined states',
    'qw.ind.ratio': 'E₁ / infinite-well E₁', 'qw.ind.n': 'confined states (⌈2θ₀/π⌉)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'graph', caption: 'qw.cap.graph' }, { id: 'env', caption: 'qw.cap.env', cls: 'wide' }], hintKey: 'qw.hint' });
  let x = 0.3, a = 100, lv = [];
  const px = slider({ label: 'qw.x', value: 0.3, min: 0.05, max: 0.45, step: 0.01, format: (v) => v.toFixed(2), onChange: () => { compute(); draw(); } });
  const pa = slider({ label: 'qw.a', value: 100, min: 20, max: 300, step: 2, onChange: () => { compute(); draw(); } });
  ui.params.append(px.el, pa.el);
  const g = new Plot(ui.canvas.graph, { axes: true, xlabel: 'θ = ka/2', ylabel: '' });
  const en = new Plot(ui.canvas.env, { axes: true, xlabel: 'z (Å)', ylabel: 'E (meV)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: '-\\frac{\\hbar^2}{2}\\frac{d}{dz}\\Big[\\frac{1}{m(z)}\\frac{d\\chi}{dz}\\Big] + V(z)\\chi = E\\chi,\\qquad x = \\htmlId{x}{x},\\ a = \\htmlId{a}{a},\\ V_0 = \\htmlId{V0}{V_0}', slots: { x: { label: 'qw.eq.x' }, a: { label: 'qw.eq.a' }, V0: { label: 'qw.eq.V0' } } },
      { tex: '\\tan\\theta = \\frac{m_A}{m_B}\\frac{\\kappa}{k}\\ (\\text{par}),\\quad -\\cot\\theta = \\frac{m_A}{m_B}\\frac{\\kappa}{k}\\ (\\text{impar}),\\quad \\theta = \\frac{ka}{2};\\qquad E_1 = \\htmlId{E1}{E_1},\\ n = \\htmlId{n}{n}', slots: { E1: { label: 'qw.eq.E1' }, n: { label: 'qw.eq.n' } } },
    ],
    indicators: [{ key: 'ratio', label: 'qw.ind.ratio' }, { key: 'n', label: 'qw.ind.n' }],
  });
  function compute() {
    x = px.get(); a = pa.get(); lv = QW.levels(x, a);
    const { V0 } = QW.materials(x), inf = QW.infiniteLevels(x, a, 1);
    eq.update({ x, a, V0: V0 * 1000, E1: lv[0].E * 1000, n: lv.length });
    eq.setIndicator('ratio', lv[0].E / inf[0], 'ok'); eq.setIndicator('n', Math.ceil(2 * QW.thetaMax(x, a) / Math.PI), 'ok');
  }
  function reset() { compute(); }
  function step() { const v = pa.get() + 2; if (v > 300) { loop.pause(); return; } pa.set(v); compute(); }
  function draw() {
    const { mA, mB, V0 } = QW.materials(x), t0 = QW.thetaMax(x, a), tmax = Math.max(t0 * 1.1, 1.8);
    g.setScales(0, tmax, -0.5, 6); g.clear();
    g.color('#999'); g.line(0, 0, tmax, 0);
    const draw1 = (f, col) => { let xs = [], ys = []; for (let i = 1; i < 600; i++) { const t = tmax * i / 600, y = f(t); if (Math.abs(y) > 8 || (ys.length && Math.sign(y) !== Math.sign(ys[ys.length - 1]) && Math.abs(y - ys[ys.length - 1]) > 4)) { g.color(col); g.polyline(xs, ys); xs = []; ys = []; if (Math.abs(y) > 8) continue; } xs.push(t); ys.push(y); } g.color(col); g.polyline(xs, ys); };
    draw1((t) => Math.tan(t), 'rgba(31,78,156,0.9)'); draw1((t) => -1 / Math.tan(t), 'rgba(31,78,156,0.45)');
    const rx = [], ry = []; for (let i = 1; i <= 300; i++) { const t = t0 * i / 300; rx.push(t); ry.push(QW.rhs(t, x, a)); } g.color('rgba(40,160,60,0.9)'); g.lineWidth(2); g.polyline(rx, ry); g.lineWidth(1);
    for (const l of lv) { g.color(l.parity === 'even' ? '#b5281e' : '#dc8214'); g.disk(l.theta, QW.rhs(l.theta, x, a), 0.06 * tmax / 6 * 2, false); g.disk(l.theta, QW.rhs(l.theta, x, a), 0.025 * tmax / 6 * 2); }
    g.end();
    const zmax = a * 1.5, Etop = V0 * 1000 * 1.15, zs = Array.from({ length: 400 }, (_, i) => -zmax + 2 * zmax * i / 399);
    en.setScales(-zmax, zmax, 0, Etop); en.clear();
    en.color('rgba(120,120,120,0.15)'); en.bar(-zmax, -a / 2, Etop); en.bar(a / 2, zmax, Etop);
    en.color('#666'); en.line(-zmax, V0 * 1000, -a / 2, V0 * 1000); en.line(a / 2, V0 * 1000, zmax, V0 * 1000); en.line(-a / 2, 0, -a / 2, V0 * 1000); en.line(a / 2, 0, a / 2, V0 * 1000);
    const inf = QW.infiniteLevels(x, a, lv.length); en.ctx.setLineDash([4, 4]); en.color('#888'); for (const E of inf) if (E * 1000 < Etop) en.line(-a / 2, E * 1000, a / 2, E * 1000); en.ctx.setLineDash([]);
    const gap = lv.length > 1 ? Math.min(...lv.slice(1).map((l, i) => l.E - lv[i].E)) * 1000 : V0 * 500, amp = Math.min(gap * 0.45, V0 * 1000 * 0.2);
    lv.forEach((l) => { const E = l.E * 1000; en.color(l.parity === 'even' ? 'rgba(181,40,30,0.9)' : 'rgba(220,130,20,0.9)'); en.line(-zmax, E, zmax, E); const f = QW.envelope(l, x, a, zs); en.lineWidth(1.8); en.polyline(zs, f.map((v) => E + amp * v)); en.lineWidth(1); });
    en.end();
    ui.readout.textContent = i18n.t('qw.readout', { x: x.toFixed(2), a, V0: (V0 * 1000).toFixed(0), mA: mA.toFixed(3), mB: mB.toFixed(3), n: lv.length, Es: lv.map((l) => (l.E * 1000).toFixed(1)).join(', ') });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 5 }).el);
  reset();
  const off = autoResize([g, en], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
