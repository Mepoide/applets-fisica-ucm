// Resonant tunnelling diode — Quantum Devices experiment 3.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as RT from './model.js';

export const meta = { slug: 'diodo-tunel', titleKey: 'rtd.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'rtd.b': 'Espesor de las barreras b (Å)', 'rtd.w': 'Espesor del pozo w (Å)', 'rtd.x': 'Fracción de Al x', 'rtd.V': 'Voltaje aplicado V (mV)', 'rtd.EF': 'Energía de Fermi E_F (meV)', 'rtd.T': 'Temperatura (K)',
    'rtd.cap.T': 'Izquierda: perfil de potencial polarizado (gris) y coeficiente de transmisión T(E) en escala logarítmica (rojo, eje superior), con el nivel del pozo aislado (verde) y E_F (azul). La resonancia baja con el voltaje.',
    'rtd.cap.IV': 'Característica I–V (Tsu–Esaki, unidades arbitrarias), construida al iniciar. Máximo cuando la resonancia cruza la ventana [E_F − V, E_F]; después, resistencia diferencial negativa.',
    'rtd.readout': 'b = {b} Å · w = {w} Å · V₀ = {V0} meV · V = {V} mV · resonancia E_r = {Er} meV (T = {Tr}) · nivel aislado {E0} meV · I(V) = {I}',
    'rtd.hint': 'A voltaje cero la resonancia coincide con el nivel del pozo aislado y T alcanza 1 aunque cada barrera sola transmita ~10⁻³. Al polarizar, el nivel baja aproximadamente V/2 (cae en el centro de la estructura); la corriente crece hasta que E_r pasa por debajo del fondo de la banda del emisor y se desploma: resistencia diferencial negativa. Barreras más gruesas estrechan la resonancia y reducen la corriente; T mayor difumina el pico.',
    'rtd.eq.V': 'voltaje aplicado', 'rtd.eq.EF': 'energía de Fermi del emisor', 'rtd.eq.Er': 'energía de la resonancia (máximo de T)', 'rtd.eq.I': 'corriente (unidades arbitrarias)',
    'rtd.ind.Tr': 'T en la resonancia', 'rtd.ind.shift': '(E₀ − E_r) / V (≈ ½)',
  },
  en: {
    'rtd.b': 'Barrier thickness b (Å)', 'rtd.w': 'Well thickness w (Å)', 'rtd.x': 'Al fraction x', 'rtd.V': 'Applied voltage V (mV)', 'rtd.EF': 'Fermi energy E_F (meV)', 'rtd.T': 'Temperature (K)',
    'rtd.cap.T': 'Left: biased potential profile (grey) and transmission coefficient T(E) on a log scale (red, top axis), with the isolated-well level (green) and E_F (blue). The resonance moves down with voltage.',
    'rtd.cap.IV': 'I–V characteristic (Tsu–Esaki, arbitrary units), built on start. Maximum when the resonance crosses the window [E_F − V, E_F]; then negative differential resistance.',
    'rtd.readout': 'b = {b} Å · w = {w} Å · V₀ = {V0} meV · V = {V} mV · resonance E_r = {Er} meV (T = {Tr}) · isolated level {E0} meV · I(V) = {I}',
    'rtd.hint': 'At zero bias the resonance coincides with the isolated-well level and T reaches 1 although each barrier alone transmits ~10⁻³. Under bias the level drops by about V/2 (it sits at the centre of the structure); the current grows until E_r falls below the emitter band bottom and collapses: negative differential resistance. Thicker barriers narrow the resonance and reduce the current; higher T smears the peak.',
    'rtd.eq.V': 'applied voltage', 'rtd.eq.EF': 'emitter Fermi energy', 'rtd.eq.Er': 'resonance energy (maximum of T)', 'rtd.eq.I': 'current (arbitrary units)',
    'rtd.ind.Tr': 'T at resonance', 'rtd.ind.shift': '(E₀ − E_r) / V (≈ ½)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'T', caption: 'rtd.cap.T' }, { id: 'IV', caption: 'rtd.cap.IV', cls: 'wide' }], hintKey: 'rtd.hint' });
  let prof, Es, Ts, res, iv = [], Imax = 1e-12;
  const pb = numberField({ label: 'rtd.b', value: 30, min: 10, max: 80, step: 5, onChange: () => { iv = []; compute(); draw(); } });
  const pw = numberField({ label: 'rtd.w', value: 50, min: 20, max: 120, step: 5, onChange: () => { iv = []; compute(); draw(); } });
  const px = slider({ label: 'rtd.x', value: 0.3, min: 0.1, max: 0.45, step: 0.01, format: (v) => v.toFixed(2), onChange: () => { iv = []; compute(); draw(); } });
  const pV = slider({ label: 'rtd.V', value: 0, min: 0, max: 400, step: 5, onChange: () => { compute(); draw(); } });
  const pEF = numberField({ label: 'rtd.EF', value: 50, min: 5, max: 200, step: 5, onChange: () => { iv = []; compute(); draw(); } });
  const pT = numberField({ label: 'rtd.T', value: 4.2, min: 1, max: 300, step: 1, onChange: () => { iv = []; compute(); draw(); } });
  ui.params.append(pb.el, pw.el, px.el, pV.el, pEF.el, pT.el);
  const pTp = new Plot(ui.canvas.T, { axes: true, xlabel: 'z (Å)', ylabel: 'E (meV)' });
  const pIV = new Plot(ui.canvas.IV, { axes: true, xlabel: 'V (mV)', ylabel: 'I (u.a.)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\chi_{n+1} + \\chi_{n-1} = \\Big[2 - \\frac{2m^*s^2}{\\hbar^2}\\Big(V_n - \\htmlId{V}{V}\\frac{z_n}{L} - E\\Big)\\Big]\\chi_n\\ \\Rightarrow\\ T(E, V);\\qquad E_r = \\htmlId{Er}{E_r}', slots: { V: { label: 'rtd.eq.V' }, Er: { label: 'rtd.eq.Er' } } },
      { tex: 'I \\propto \\int_0^\\infty T(E,V)\\,\\ln\\frac{1 + e^{(E_F - E)/k_BT}}{1 + e^{(E_F - E - eV)/k_BT}}\\,dE,\\qquad E_F = \\htmlId{EF}{E_F},\\quad I = \\htmlId{I}{I}', slots: { EF: { label: 'rtd.eq.EF' }, I: { label: 'rtd.eq.I' } } },
    ],
    indicators: [{ key: 'Tr', label: 'rtd.ind.Tr' }, { key: 'shift', label: 'rtd.ind.shift' }],
  });
  const params = () => ({ b: pb.get(), w: pw.get(), x: px.get() });
  function compute() {
    const Vb = pV.get() / 1000; prof = RT.profile({ ...params(), Vb });
    Es = Array.from({ length: 600 }, (_, i) => 1e-4 + (prof.V0 * 1.3) * i / 599); Ts = RT.transmissionCurve(prof, Es); res = RT.resonances(Es, Ts);
    const I = RT.iv(params(), [Vb], { EF: pEF.get() / 1000, T: pT.get() })[0];
    if (!iv.some((p) => Math.abs(p.V - Vb) < 1e-9)) { iv.push({ V: Vb, I }); iv.sort((p, q) => p.V - q.V); }
    Imax = Math.max(1e-12, ...iv.map((p) => p.I));
    const E0 = RT.wellLevel(pw.get(), px.get()), Er = res[0]?.E ?? NaN;
    eq.update({ V: pV.get(), Er: Er * 1000, EF: pEF.get(), I: I / Imax });
    eq.setIndicator('Tr', res[0]?.T ?? 0, (res[0]?.T ?? 0) > 0.5 ? 'ok' : 'none'); eq.setIndicator('shift', Vb > 0 ? (E0 - Er) / Vb : NaN, 'none');
  }
  function reset() { iv = []; compute(); }
  function step() { const v = pV.get() + 5; if (v > 400) { loop.pause(); return; } pV.set(v); compute(); }
  function draw() {
    const Vb = pV.get() / 1000, L = prof.L, zmin = prof.zs[0], zmax = prof.zs[prof.zs.length - 1], Etop = prof.V0 * 1.3 * 1000, Ebot = -Vb * 1000 - 20;
    pTp.setScales(zmin, zmax, Ebot, Etop); pTp.clear();
    pTp.color('rgba(120,120,120,0.2)'); pTp.polyline(Array.from(prof.zs), Array.from(prof.V, (v) => v * 1000)); pTp.color('#666'); pTp.lineWidth(1.5); pTp.polyline(Array.from(prof.zs), Array.from(prof.V, (v) => v * 1000)); pTp.lineWidth(1);
    // T(E) on log10 scale mapped to the z axis: log T from −8 → zmin+... to 0 → zmax
    const tx = (T) => zmin + (zmax - zmin) * (Math.max(-8, Math.log10(Math.max(T, 1e-12))) + 8) / 8;
    pTp.color('#bbb'); for (let d = -8; d <= 0; d += 2) { pTp.line(tx(10 ** d), Ebot, tx(10 ** d), Etop); pTp.text(tx(10 ** d), Etop - 10, `10${d ? '⁻' + String(-d).replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]) : '⁰'}`, { align: 'center', font: '11px system-ui' }); }
    pTp.color('rgba(181,40,30,0.9)'); pTp.lineWidth(1.8); pTp.polyline(Ts.map(tx), Es.map((E) => E * 1000)); pTp.lineWidth(1);
    const E0 = RT.wellLevel(pw.get(), px.get()); pTp.color('rgba(40,160,60,0.8)'); pTp.line(zmin, E0 * 1000 - Vb * 500, zmax, E0 * 1000 - Vb * 500);
    pTp.color('rgba(31,78,156,0.8)'); pTp.line(zmin, pEF.get(), 0, pEF.get()); pTp.line(L, pEF.get() - Vb * 1000, zmax, pEF.get() - Vb * 1000);
    pTp.end();
    pIV.setScales(0, 400, 0, 1.1); pIV.clear();
    if (iv.length > 1) { pIV.color('rgba(181,40,30,0.9)'); pIV.lineWidth(2); pIV.polyline(iv.map((p) => p.V * 1000), iv.map((p) => p.I / Imax)); pIV.lineWidth(1); }
    iv.forEach((p) => { pIV.color('rgba(181,40,30,0.7)'); pIV.disk(p.V * 1000, p.I / Imax, 3); });
    pIV.color('#222'); pIV.line(pV.get(), 0, pV.get(), 1.1);
    pIV.end();
    const cur = iv.find((p) => Math.abs(p.V - Vb) < 1e-9);
    ui.readout.textContent = i18n.t('rtd.readout', { b: pb.get(), w: pw.get(), V0: (prof.V0 * 1000).toFixed(0), V: pV.get(), Er: res[0] ? (res[0].E * 1000).toFixed(1) : '–', Tr: res[0] ? res[0].T.toFixed(3) : '–', E0: (E0 * 1000).toFixed(1), I: cur ? (cur.I / Imax).toFixed(3) : '–' });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 4 }).el);
  reset();
  const off = autoResize([pTp, pIV], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
