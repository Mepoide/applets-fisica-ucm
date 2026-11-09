// Electronic states at a doped heterojunction — Quantum Devices experiment 6 (triangular well).
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as HJ from './model.js';

export const meta = { slug: 'heterounion', titleKey: 'hj.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'hj.n': 'Densidad del gas 2D n₂D (10¹¹ cm⁻²)', 'hj.x': 'Fracción de Al x (GaAs-AlGaAs)', 'hj.b': 'Parámetro variacional b',
    'hj.cap.uni': 'Problema universal (barrera infinita, Si-SiO₂): pozo triangular u (gris), función exacta (verde, ε₁ = 2.338) y función de prueba gaussiana u·e^{−b²u²/2} (azul). Mueve b: la energía variacional E(b) (recuadro) es mínima en b = 0.722 con ε = 2.3448.',
    'hj.cap.gaas': 'Heterounión GaAs-Al_xGa_{1−x}As: barrera finita V₀ = 0.773x a la izquierda, pendiente K = 1.37 n₂D meV/nm a la derecha. Función exacta (verde) y niveles; punteado: valor con barrera infinita 2.338(ħ²K²/2m)^{1/3}.',
    'hj.readout': 'n₂D = {n} ×10¹¹ cm⁻² · K = {K} meV/nm · escala (ħ²K²/2m)^{1/3} = {Esc} meV · E₁ exacta = {E1} meV · barrera infinita {Einf} meV · variacional {Evar} meV · penetración en la barrera {pen} %',
    'hj.hint': 'Con barrera infinita el problema es universal: una sola solución (ε₁ = 2.338, el primer cero de Airy) sirve para cualquier K con solo reescalar. La función gaussiana de prueba da 2.3448, un 0.3 % por encima, como exige el principio variacional. En GaAs-AlGaAs la barrera (≈ 0.23 eV para x = 0.3) es solo unas veces la energía del nivel: la función penetra en el AlGaAs y el nivel baja varios meV. Inicia para barrer n₂D.',
    'hj.eq.K': 'pendiente del potencial eF = e²n₂D/ε₀ε_r', 'hj.eq.b': 'parámetro variacional', 'hj.eq.Eb': 'energía variacional E(b)', 'hj.eq.E1': 'nivel fundamental exacto (barrera finita)',
    'hj.ind.var': 'E(b) / 2.3381 (≥ 1)', 'hj.ind.fin': 'E₁ finita / E₁ infinita',
  },
  en: {
    'hj.n': '2D gas density n₂D (10¹¹ cm⁻²)', 'hj.x': 'Al fraction x (GaAs-AlGaAs)', 'hj.b': 'Variational parameter b',
    'hj.cap.uni': 'Universal problem (infinite barrier, Si-SiO₂): triangular well u (grey), exact function (green, ε₁ = 2.338) and Gaussian trial function u·e^{−b²u²/2} (blue). Move b: the variational energy E(b) (inset) is minimal at b = 0.722 with ε = 2.3448.',
    'hj.cap.gaas': 'GaAs-Al_xGa_{1−x}As heterojunction: finite barrier V₀ = 0.773x on the left, slope K = 1.37 n₂D meV/nm on the right. Exact function (green) and levels; dotted: infinite-barrier value 2.338(ħ²K²/2m)^{1/3}.',
    'hj.readout': 'n₂D = {n} ×10¹¹ cm⁻² · K = {K} meV/nm · scale (ħ²K²/2m)^{1/3} = {Esc} meV · exact E₁ = {E1} meV · infinite barrier {Einf} meV · variational {Evar} meV · barrier penetration {pen} %',
    'hj.hint': 'With an infinite barrier the problem is universal: one solution (ε₁ = 2.338, the first Airy zero) serves any K after rescaling. The Gaussian trial function gives 2.3448, 0.3 % above, as the variational principle demands. In GaAs-AlGaAs the barrier (≈ 0.23 eV for x = 0.3) is only a few times the level energy: the function penetrates the AlGaAs and the level drops several meV. Start to sweep n₂D.',
    'hj.eq.K': 'potential slope eF = e²n₂D/ε₀ε_r', 'hj.eq.b': 'variational parameter', 'hj.eq.Eb': 'variational energy E(b)', 'hj.eq.E1': 'exact ground level (finite barrier)',
    'hj.ind.var': 'E(b) / 2.3381 (≥ 1)', 'hj.ind.fin': 'finite E₁ / infinite E₁',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'uni', caption: 'hj.cap.uni' }, { id: 'gaas', caption: 'hj.cap.gaas', cls: 'wide' }], hintKey: 'hj.hint' });
  const uni = HJ.universal(); let g;
  const pn = slider({ label: 'hj.n', value: 5, min: 1, max: 20, step: 0.5, format: (v) => v.toFixed(1), onChange: () => { compute(); draw(); } });
  const px = slider({ label: 'hj.x', value: 0.3, min: 0.1, max: 0.45, step: 0.01, format: (v) => v.toFixed(2), onChange: () => { compute(); draw(); } });
  const pb = slider({ label: 'hj.b', value: 0.72, min: 0.3, max: 1.4, step: 0.01, format: (v) => v.toFixed(2), onChange: () => { eq.update({ b: pb.get(), Eb: HJ.variationalEnergy(pb.get()) }); eq.setIndicator('var', HJ.variationalEnergy(pb.get()) / HJ.AIRY1, Math.abs(pb.get() - HJ.B_VAR) < 0.02 ? 'ok' : 'none'); draw(); } });
  ui.params.append(pn.el, px.el, pb.el);
  const pu = new Plot(ui.canvas.uni, { axes: true, xlabel: 'u', ylabel: 'ε' });
  const pg = new Plot(ui.canvas.gaas, { axes: true, xlabel: 'z (Å)', ylabel: 'E (meV)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: '-\\chi\'\' + u\\chi = \\varepsilon\\chi,\\ \\chi(0) = 0:\\quad \\varepsilon_1 = 2.3381;\\qquad \\chi_b = N u\\,e^{-b^2u^2/2},\\ E(b) = \\tfrac32 b^2 + \\frac{2}{\\sqrt\\pi\\,b},\\quad b = \\htmlId{b}{b},\\ E(b) = \\htmlId{Eb}{E}', slots: { b: { label: 'hj.eq.b' }, Eb: { label: 'hj.eq.Eb' } } },
      { tex: 'V(z) = \\htmlId{K}{K}\\,z\\ (z>0),\\ V_0\\ (z<0);\\qquad E_1^{\\infty} = 2.338\\Big(\\frac{\\hbar^2K^2}{2m^*}\\Big)^{1/3},\\quad E_1 = \\htmlId{E1}{E_1}', slots: { K: { label: 'hj.eq.K' }, E1: { label: 'hj.eq.E1' } } },
    ],
    indicators: [{ key: 'var', label: 'hj.ind.var' }, { key: 'fin', label: 'hj.ind.fin' }],
  });
  function compute() {
    g = HJ.gaas(pn.get(), px.get());
    eq.update({ b: pb.get(), Eb: HJ.variationalEnergy(pb.get()), K: g.K * 1e4, E1: g.E[0] * 1000 });
    eq.setIndicator('var', HJ.variationalEnergy(pb.get()) / HJ.AIRY1, Math.abs(pb.get() - HJ.B_VAR) < 0.02 ? 'ok' : 'none'); eq.setIndicator('fin', g.E[0] / g.Einf, 'none');
  }
  function reset() { compute(); }
  function step() { const v = Math.round((pn.get() + 0.5) * 2) / 2; if (v > 20) { loop.pause(); return; } pn.set(v); compute(); }
  function draw() {
    pu.setScales(0, 8, 0, 8); pu.clear();
    pu.color('#666'); pu.line(0, 0, 8, 8); pu.color('rgba(120,120,120,0.15)'); pu.bar(0, 8, 8, 0, false);
    const b = pb.get(), us = uni.us.filter((_, i) => i % 2 === 0), ex = uni.chi[0].filter((_, i) => i % 2 === 0), exm = Math.max(...ex);
    pu.color('rgba(40,160,60,0.9)'); pu.line(0, uni.eps[0], 8, uni.eps[0]); pu.lineWidth(2); pu.polyline(us, ex.map((c) => uni.eps[0] + 2.5 * c / exm)); pu.lineWidth(1);
    const trm = Math.max(...us.map((u) => HJ.trial(u, b))); pu.color('rgba(31,78,156,0.9)'); pu.polyline(us, us.map((u) => HJ.variationalEnergy(b) + 2.5 * HJ.trial(u, b) / trm));
    // inset E(b)
    const bx = (bb) => 4.5 + 3.3 * (bb - 0.3) / 1.1, by = (E) => 4.8 + 2.8 * (E - 2.3) / 1.2;
    pu.color('#aaa'); pu.rect(4.5, 4.8, 3.3, 2.8); const bs = Array.from({ length: 60 }, (_, i) => 0.3 + 1.1 * i / 59); pu.color('rgba(31,78,156,0.8)'); pu.polyline(bs.map(bx), bs.map((bb) => by(Math.min(3.5, HJ.variationalEnergy(bb))))); pu.color('rgba(40,160,60,0.8)'); pu.line(bx(0.3), by(HJ.AIRY1), bx(1.4), by(HJ.AIRY1)); pu.color('#b5281e'); pu.disk(bx(b), by(Math.min(3.5, HJ.variationalEnergy(b))), 0.1); pu.color('#444'); pu.text(4.6, 7.4, 'E(b)', { font: '12px system-ui' });
    pu.end();
    const zmin = g.zs[0], zmax = Math.min(g.zs[g.zs.length - 1], 8 * g.Lsc), top = Math.max(g.V0 * 1000 * 1.1, 4 * g.Esc * 1000);
    pg.setScales(zmin, zmax, 0, top); pg.clear();
    pg.color('rgba(120,120,120,0.15)'); pg.bar(zmin, 0, top); pg.color('#666'); pg.polyline(g.zs, g.V.map((v) => Math.min(top, v * 1000)));
    pg.ctx.setLineDash([4, 4]); pg.color('#888'); pg.line(0, g.Einf * 1000, zmax, g.Einf * 1000); pg.ctx.setLineDash([]);
    const cols = ['rgba(40,160,60,0.9)', 'rgba(220,130,20,0.9)', 'rgba(31,78,156,0.9)'];
    g.E.forEach((E, i) => { pg.color(cols[i]); pg.line(zmin, E * 1000, zmax, E * 1000); const pm = Math.max(...g.psi[i].map(Math.abs)); pg.lineWidth(i === 0 ? 2 : 1); pg.polyline(g.zs, Array.from(g.psi[i], (c) => E * 1000 + g.Esc * 1000 * 0.9 * c / pm)); pg.lineWidth(1); });
    pg.end();
    let pen = 0, tot = 0; g.psi[0].forEach((c, i) => { tot += c * c; if (g.zs[i] < 0) pen += c * c; });
    ui.readout.textContent = i18n.t('hj.readout', { n: pn.get().toFixed(1), K: (g.K * 1e4).toFixed(2), Esc: (g.Esc * 1000).toFixed(1), E1: (g.E[0] * 1000).toFixed(1), Einf: (g.Einf * 1000).toFixed(1), Evar: (g.Evar * 1000).toFixed(1), pen: (100 * pen / tot).toFixed(1) });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 4 }).el);
  reset();
  const off = autoResize([pu, pg], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
