// Nuclear magnetic resonance — Solid State experiment 9. Bloch equations, FID and resonance.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as R from './model.js';

export const meta = { slug: 'rmn', titleKey: 'rmn.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'rmn.alpha': 'α = ω₀T₂ (campo estático)', 'rmn.w1': 'ω₁T₂ (campo rotatorio B₁)', 'rmn.wrel': 'ω/ω₀ (frecuencia del campo rotatorio)', 'rmn.T1': 'T₁/T₂', 'rmn.init': 'Estado inicial', 'rmn.init.x': 'm = (1, 0, m_z eq) tras un pulso π/2', 'rmn.init.z': 'm = (0, 0, 1) en equilibrio',
    'rmn.cap.3d': 'Trayectoria de la punta del vector m en el plano xy (proyección) con la componente m_z en color. Sin B₁: precesión de Larmor a ω₀ amortiguada en T₂ (decaimiento de inducción libre).',
    'rmn.cap.t': 'Componentes m_x(t), m_y(t) (rojo, naranja), |m_⊥| (negro) y m_z (azul). Punteado: solución analítica e^{−t} para el decaimiento libre. A la derecha, línea de absorción Lorentziana de anchura 1/T₂ y marca de la frecuencia de B₁.',
    'rmn.readout': 't/T₂ = {t} · m = ({mx}, {my}, {mz}) · |m_⊥| = {mp} (e^{−t} = {fid}) · ω₀T₂ = {a} · ωT₂ = {w}',
    'rmn.hint': 'Sin campo rotatorio (ω₁ = 0) la imanación transversal precesa y decae: es la señal de inducción libre que mide un espectrómetro, cuya transformada de Fourier es la línea Lorentziana. Activa B₁ con ω = ω₀ partiendo del equilibrio: m_z baja mientras m_⊥ crece (nutación), el espín absorbe energía del campo. Desintoniza ω/ω₀ a 1.2: la absorción casi desaparece. T₁ fija cuánto tarda m_z en volver al equilibrio.',
    'rmn.eq.a': 'frecuencia de Larmor en unidades de 1/T₂', 'rmn.eq.w1': 'frecuencia de Rabi ω₁ = γB₁ en unidades de 1/T₂', 'rmn.eq.w': 'frecuencia del campo rotatorio', 'rmn.eq.T1': 'tiempo de relajación longitudinal', 'rmn.eq.mp': 'módulo de la imanación transversal',
    'rmn.ind.fid': '|m_⊥| / e^{−t} (decaimiento libre: 1)', 'rmn.ind.det': 'desintonía (ω − ω₀)T₂',
  },
  en: {
    'rmn.alpha': 'α = ω₀T₂ (static field)', 'rmn.w1': 'ω₁T₂ (rotating field B₁)', 'rmn.wrel': 'ω/ω₀ (rotating-field frequency)', 'rmn.T1': 'T₁/T₂', 'rmn.init': 'Initial state', 'rmn.init.x': 'm = (1, 0, m_z eq) after a π/2 pulse', 'rmn.init.z': 'm = (0, 0, 1) in equilibrium',
    'rmn.cap.3d': 'Trajectory of the tip of m in the xy plane (projection) with m_z as colour. Without B₁: Larmor precession at ω₀ damped in T₂ (free induction decay).',
    'rmn.cap.t': 'Components m_x(t), m_y(t) (red, orange), |m_⊥| (black) and m_z (blue). Dotted: analytic e^{−t} of the free decay. Right: Lorentzian absorption line of width 1/T₂ and a mark at the B₁ frequency.',
    'rmn.readout': 't/T₂ = {t} · m = ({mx}, {my}, {mz}) · |m_⊥| = {mp} (e^{−t} = {fid}) · ω₀T₂ = {a} · ωT₂ = {w}',
    'rmn.hint': 'Without a rotating field (ω₁ = 0) the transverse magnetisation precesses and decays: this is the free induction signal a spectrometer measures, whose Fourier transform is the Lorentzian line. Switch B₁ on with ω = ω₀ starting from equilibrium: m_z drops while m_⊥ grows (nutation), the spins absorb energy from the field. Detune ω/ω₀ to 1.2: absorption almost vanishes. T₁ sets how long m_z takes to return to equilibrium.',
    'rmn.eq.a': 'Larmor frequency in units of 1/T₂', 'rmn.eq.w1': 'Rabi frequency ω₁ = γB₁ in units of 1/T₂', 'rmn.eq.w': 'rotating-field frequency', 'rmn.eq.T1': 'longitudinal relaxation time', 'rmn.eq.mp': 'transverse magnetisation modulus',
    'rmn.ind.fid': '|m_⊥| / e^{−t} (free decay: 1)', 'rmn.ind.det': 'detuning (ω − ω₀)T₂',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'xy', caption: 'rmn.cap.3d' }, { id: 't', caption: 'rmn.cap.t', cls: 'wide' }], hintKey: 'rmn.hint' });
  let s;
  const pA = slider({ label: 'rmn.alpha', value: 10, min: 1, max: 40, step: 1 });
  const pW1 = slider({ label: 'rmn.w1', value: 0, min: 0, max: 10, step: 0.5, format: (v) => v.toFixed(1) });
  const pWr = slider({ label: 'rmn.wrel', value: 1, min: 0.5, max: 1.5, step: 0.01, format: (v) => v.toFixed(2) });
  const pT1 = numberField({ label: 'rmn.T1', value: 3, min: 0.5, max: 100, step: 0.5 });
  const pI = select({ label: 'rmn.init', value: 'x', options: [{ value: 'x', label: 'rmn.init.x' }, { value: 'z', label: 'rmn.init.z' }] });
  ui.params.append(pA.el, pW1.el, pWr.el, pT1.el, pI.el);
  const xy = new Plot(ui.canvas.xy, { xmin: -1.1, xmax: 1.1, ymin: -1.1, ymax: 1.1 });
  const pt = new Plot(ui.canvas.t, { axes: true, xlabel: 't / T₂', ylabel: 'm' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\dot{\\mathbf m} = \\gamma\\,\\mathbf m\\times\\mathbf B - \\frac{m_x\\hat x + m_y\\hat y}{T_2} - \\frac{(m_z - 1)\\hat z}{T_1},\\qquad \\omega_0T_2 = \\htmlId{a}{\\alpha},\\ \\omega_1T_2 = \\htmlId{w1}{\\omega_1},\\ \\frac{T_1}{T_2} = \\htmlId{T1}{T_1}', slots: { a: { label: 'rmn.eq.a' }, w1: { label: 'rmn.eq.w1' }, T1: { label: 'rmn.eq.T1' } } },
      { tex: '|m_\\perp|_{\\rm FID} = e^{-t/T_2},\\qquad |m_\\perp| = \\htmlId{mp}{m_\\perp};\\qquad \\chi\'\'(\\omega) \\propto \\frac{1/T_2}{(\\omega-\\omega_0)^2 + 1/T_2^2},\\quad \\omega T_2 = \\htmlId{w}{\\omega}', slots: { mp: { label: 'rmn.eq.mp' }, w: { label: 'rmn.eq.w' } } },
    ],
    indicators: [{ key: 'fid', label: 'rmn.ind.fid' }, { key: 'det', label: 'rmn.ind.det' }],
  });
  function reset() {
    const mz = pI.get() === 'z' ? 1 : 1; s = R.create({ alpha: pA.get(), omega1: pW1.get(), omegaRel: pWr.get(), T1: pT1.get(), m0: pI.get() === 'z' ? [0, 0, 1] : [1, 0, mz] });
    eq.update({ a: s.alpha, w1: s.omega1, T1: s.T1, w: s.omega });
    eq.setIndicator('det', s.omega - s.alpha, Math.abs(s.omega - s.alpha) < 1 ? 'ok' : 'none');
  }
  function step() { R.step(s, 0.005); if (s.t > 6) loop.pause(); }
  function draw() {
    xy.clear(); xy.color('#ddd'); xy.disk(0, 0, 1, false); xy.line(-1.1, 0, 1.1, 0); xy.line(0, -1.1, 0, 1.1);
    const tr = s.trail;
    for (let i = Math.max(1, tr.length - 3000); i < tr.length; i++) { const mz = tr[i][3]; xy.color(`rgba(${Math.round(180 * (1 - mz))},${Math.round(60 + 60 * mz)},${Math.round(180 * mz)},0.8)`); xy.line(tr[i - 1][1], tr[i - 1][2], tr[i][1], tr[i][2]); }
    xy.color('#b5281e'); xy.disk(s.m[0], s.m[1], 0.03); xy.end();
    const tmax = Math.max(2, s.t * 1.05);
    pt.setScales(0, tmax, -1.1, 1.1); pt.clear();
    pt.color('#999'); pt.line(0, 0, tmax, 0);
    const xs = tr.map((r) => r[0]), stride = Math.max(1, Math.floor(tr.length / 1500));
    const pick = (k) => tr.filter((_, i) => i % stride === 0).map((r) => r[k]), tt = tr.filter((_, i) => i % stride === 0).map((r) => r[0]);
    pt.color('rgba(181,40,30,0.85)'); pt.polyline(tt, pick(1)); pt.color('rgba(220,130,20,0.85)'); pt.polyline(tt, pick(2));
    pt.color('#1f4e9c'); pt.lineWidth(1.5); pt.polyline(tt, pick(3)); pt.color('#222'); pt.polyline(tt, tr.filter((_, i) => i % stride === 0).map((r) => Math.hypot(r[1], r[2]))); pt.lineWidth(1);
    pt.ctx.setLineDash([4, 4]); pt.color('#666'); const fx = [], fy = []; for (let i = 0; i <= 100; i++) { const t = tmax * i / 100; fx.push(t); fy.push(Math.exp(-t)); } pt.polyline(fx, fy); pt.ctx.setLineDash([]);
    // absorption line inset at the right 25%
    const W0 = tmax * 0.72, W1 = tmax * 0.98, ws = Array.from({ length: 80 }, (_, i) => s.alpha * (0.5 + i / 79)), ab = R.absorption(s.alpha, ws);
    pt.color('rgba(31,78,156,0.9)'); pt.polyline(ws.map((w) => W0 + (W1 - W0) * (w - ws[0]) / (ws[ws.length - 1] - ws[0])), ab.map((a) => -1.05 + 0.5 * a));
    pt.color('rgba(40,160,60,0.8)'); const wx = W0 + (W1 - W0) * (s.omega - ws[0]) / (ws[ws.length - 1] - ws[0]); if (wx > W0 && wx < W1) pt.line(wx, -1.05, wx, -0.5);
    pt.end();
    const mp = R.transverse(s.m), fid = Math.exp(-s.t);
    ui.readout.textContent = i18n.t('rmn.readout', { t: s.t.toFixed(2), mx: s.m[0].toFixed(3), my: s.m[1].toFixed(3), mz: s.m[2].toFixed(3), mp: mp.toFixed(3), fid: fid.toFixed(3), a: s.alpha, w: s.omega.toFixed(1) });
    eq.update({ mp });
    eq.setIndicator('fid', mp / fid, s.omega1 === 0 && Math.abs(mp / fid - 1) < 0.02 ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 4 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 20 }).el);
  reset();
  const off = autoResize([xy, pt], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
