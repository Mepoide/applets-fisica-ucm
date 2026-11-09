// Quantum-confined Stark effect — Quantum Devices experiment 5.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as ST from './model.js';

export const meta = { slug: 'stark', titleKey: 'stk.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'stk.a': 'Anchura del pozo a (Å)', 'stk.F': 'Campo eléctrico F (kV/cm)', 'stk.N': 'Puntos de la malla N',
    'stk.cap.wf': 'Pozo inclinado por el campo (gris) con los dos primeros niveles y sus funciones envolventes: el fundamental (rojo) se desplaza hacia el lado de menor energía potencial, el primer excitado (naranja) hacia el contrario.',
    'stk.cap.E': 'Energía del estado fundamental frente al campo: cálculo numérico (azul, se construye al iniciar) y teoría de perturbaciones de segundo orden (rojo). Abajo, en verde, la fuerza de oscilador f₁₂ (0.96 a campo nulo).',
    'stk.readout': 'a = {a} Å · E₀ = {E0} meV · F = {F} kV/cm · v = eFa/E₀ = {v} · E₁ = {E1} meV (perturbativo {Ep}) · E₂ − E₁ = {dE} meV · f₁₂ = {f}',
    'stk.hint': 'El desplazamiento Stark es cuadrático en el campo y crece como a⁴: en un pozo de 100 Å y 100 kV/cm es de unos meV, en uno de 200 Å, dieciséis veces más. La perturbación falla cuando v = eFa/E₀ se acerca a la separación de niveles 3π² ≈ 30: entonces la función de onda se aplasta contra una pared. La fuerza de oscilador f₁₂ cae con el campo porque la ruptura de la paridad abre otras transiciones.',
    'stk.eq.v': 'campo reducido eFa/E₀', 'stk.eq.E0': 'energía de confinamiento ħ²/2m*a²', 'stk.eq.e1': 'ε₁ = E₁/E₀ numérico', 'stk.eq.f': 'fuerza de oscilador 1→2',
    'stk.ind.pert': 'ε₁ numérico / perturbativo', 'stk.ind.f': 'f₁₂ / 0.9607',
  },
  en: {
    'stk.a': 'Well width a (Å)', 'stk.F': 'Electric field F (kV/cm)', 'stk.N': 'Grid points N',
    'stk.cap.wf': 'Well tilted by the field (grey) with the two lowest levels and their envelope functions: the ground state (red) shifts towards the low-potential side, the first excited (orange) the other way.',
    'stk.cap.E': 'Ground-state energy versus field: numerical calculation (blue, built on start) and second-order perturbation theory (red). Below, in green, the oscillator strength f₁₂ (0.96 at zero field).',
    'stk.readout': 'a = {a} Å · E₀ = {E0} meV · F = {F} kV/cm · v = eFa/E₀ = {v} · E₁ = {E1} meV (perturbative {Ep}) · E₂ − E₁ = {dE} meV · f₁₂ = {f}',
    'stk.hint': 'The Stark shift is quadratic in the field and grows as a⁴: in a 100 Å well at 100 kV/cm it is a few meV, in a 200 Å well sixteen times more. Perturbation theory fails when v = eFa/E₀ approaches the level spacing 3π² ≈ 30: the wave function is then squeezed against a wall. The oscillator strength f₁₂ decreases with field because parity breaking opens other transitions.',
    'stk.eq.v': 'reduced field eFa/E₀', 'stk.eq.E0': 'confinement energy ħ²/2m*a²', 'stk.eq.e1': 'numerical ε₁ = E₁/E₀', 'stk.eq.f': 'oscillator strength 1→2',
    'stk.ind.pert': 'numerical / perturbative ε₁', 'stk.ind.f': 'f₁₂ / 0.9607',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'wf', caption: 'stk.cap.wf' }, { id: 'E', caption: 'stk.cap.E', cls: 'wide' }], hintKey: 'stk.hint' });
  let a = 150, F = 0, sol, curve = [];
  const pa = numberField({ label: 'stk.a', value: 150, min: 50, max: 300, step: 10, onChange: () => { curve = []; compute(); draw(); } });
  const pF = slider({ label: 'stk.F', value: 0, min: 0, max: 200, step: 2, onChange: () => { compute(); draw(); } });
  const pN = numberField({ label: 'stk.N', value: 300, min: 50, max: 1500, integer: true, onChange: () => { curve = []; compute(); draw(); } });
  ui.params.append(pa.el, pF.el, pN.el);
  const pw = new Plot(ui.canvas.wf, { axes: true, xlabel: 'z (Å)', ylabel: 'E (meV)' });
  const pE = new Plot(ui.canvas.E, { axes: true, xlabel: 'F (kV/cm)', ylabel: 'E₁ (meV)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: '-\\chi\'\'(u) - \\htmlId{v}{v}\\,u\\,\\chi = \\varepsilon\\chi,\\quad u = \\tfrac{z}{a}\\in[-\\tfrac12,\\tfrac12],\\quad v = \\frac{eFa}{E_0},\\quad E_0 = \\frac{\\hbar^2}{2m^*a^2} = \\htmlId{E0}{E_0}', slots: { v: { label: 'stk.eq.v' }, E0: { label: 'stk.eq.E0' } } },
      { tex: '\\varepsilon_1 \\simeq \\pi^2 - \\frac{15 - \\pi^2}{48\\pi^4}\\,v^2,\\qquad \\varepsilon_1 = \\htmlId{e1}{\\varepsilon_1};\\qquad f_{12} = (\\varepsilon_2 - \\varepsilon_1)\\Big|\\int\\chi_1 u\\,\\chi_2\\,du\\Big|^2 = \\htmlId{f}{f_{12}}', slots: { e1: { label: 'stk.eq.e1' }, f: { label: 'stk.eq.f' } } },
    ],
    indicators: [{ key: 'pert', label: 'stk.ind.pert' }, { key: 'f', label: 'stk.ind.f' }],
  });
  function compute() {
    a = pa.get(); F = pF.get(); const v = ST.vOf(F * 1000, a); sol = ST.solve(v, { N: pN.get() });
    const f = ST.oscillatorStrength(sol);
    if (!curve.some((p) => p.F === F)) { curve.push({ F, e1: sol.eps[0], f }); curve.sort((p, q) => p.F - q.F); }
    eq.update({ v, E0: ST.E0(a) * 1000, e1: sol.eps[0], f });
    eq.setIndicator('pert', sol.eps[0] / ST.perturbative(v), Math.abs(sol.eps[0] / ST.perturbative(v) - 1) < 0.01 ? 'ok' : 'warn'); eq.setIndicator('f', f / ST.F12_0, 'none');
  }
  function reset() { curve = []; compute(); }
  function step() { const v = pF.get() + 2; if (v > 200) { loop.pause(); return; } pF.set(v); compute(); }
  function draw() {
    const E0 = ST.E0(a) * 1000, v = ST.vOf(F * 1000, a), top = Math.max(5 * Math.PI ** 2 * E0, (v / 2 + 4 * Math.PI ** 2) * E0 * 1.05), bot = -v / 2 * E0 * 1.1 - 0.05 * top;
    pw.setScales(-a / 2 * 1.15, a / 2 * 1.15, bot, top); pw.clear();
    pw.color('rgba(120,120,120,0.15)'); pw.bar(-a / 2 * 1.15, -a / 2, top, bot); pw.bar(a / 2, a / 2 * 1.15, top, bot);
    pw.color('#666'); pw.line(-a / 2, -v * -0.5 * E0, a / 2, -v * 0.5 * E0); pw.line(-a / 2, bot, -a / 2, top); pw.line(a / 2, bot, a / 2, top);
    const zs = sol.us.map((u) => u * a), cols = ['rgba(181,40,30,0.9)', 'rgba(220,130,20,0.9)'];
    sol.eps.forEach((e, i) => { const E = e * E0; pw.color(cols[i]); pw.line(-a / 2, E, a / 2, E); const pm = Math.max(...sol.chi[i].map(Math.abs)); pw.lineWidth(1.8); pw.polyline(zs, Array.from(sol.chi[i], (c) => E + (sol.eps[1] - sol.eps[0]) * E0 * 0.45 * c / pm)); pw.lineWidth(1); });
    pw.end();
    const vmax = ST.vOf(200e3, a), emin = Math.min(ST.perturbative(vmax), ...curve.map((p) => p.e1)) * E0;
    pE.setScales(0, 200, Math.min(emin * 1.05, 0), Math.PI ** 2 * E0 * 1.08); pE.clear();
    pE.color('#999'); pE.line(0, 0, 200, 0);
    const Fs = Array.from({ length: 100 }, (_, i) => 200 * i / 99); pE.color('rgba(181,40,30,0.9)'); pE.polyline(Fs, Fs.map((f) => ST.perturbative(ST.vOf(f * 1000, a)) * E0));
    if (curve.length > 1) { pE.color('rgba(31,78,156,0.9)'); pE.lineWidth(2); pE.polyline(curve.map((p) => p.F), curve.map((p) => p.e1 * E0)); pE.lineWidth(1); }
    // oscillator strength on a secondary scale at the bottom 25%
    const fy = (f) => pE.ymin + (pE.ymax - pE.ymin) * 0.25 * f; pE.color('rgba(40,160,60,0.8)'); if (curve.length > 1) pE.polyline(curve.map((p) => p.F), curve.map((p) => fy(p.f))); pE.ctx.setLineDash([3, 3]); pE.line(0, fy(ST.F12_0), 200, fy(ST.F12_0)); pE.ctx.setLineDash([]);
    pE.color('#222'); pE.line(F, pE.ymin, F, pE.ymax);
    pE.end();
    const f = ST.oscillatorStrength(sol);
    ui.readout.textContent = i18n.t('stk.readout', { a, E0: E0.toFixed(2), F, v: v.toFixed(1), E1: (sol.eps[0] * E0).toFixed(2), Ep: (ST.perturbative(v) * E0).toFixed(2), dE: ((sol.eps[1] - sol.eps[0]) * E0).toFixed(1), f: f.toFixed(3) });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 5 }).el);
  reset();
  const off = autoResize([pw, pE], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
