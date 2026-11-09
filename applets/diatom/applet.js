// Diatomic molecules — Statistical Physics experiment 6. Specific heat vs temperature with a moving cursor.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as D from './model.js';

export const meta = { slug: 'diatom', titleKey: 'dia.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'dia.mol': 'Molécula', 'dia.mol.custom': 'Personalizada', 'dia.Tr': 'Θ_rot (K)', 'dia.Tv': 'Θ_vib (K)', 'dia.T': 'Temperatura del cursor log₁₀(T/K)',
    'dia.cap.plot': 'Calor específico por molécula c_v/k_B frente a log₁₀ T. Negro: total. Punteados: traslación (3/2), rotación y vibración. Líneas verticales: Θ_rot y Θ_vib. El cursor rojo marca la temperatura del panel.',
    'dia.cap.levels': 'Niveles de energía poblados a la temperatura del cursor: rotacionales (izquierda, degeneración 2J+1) y vibracionales (derecha). La altura de cada barra es la probabilidad de ocupación.',
    'dia.readout': 'T = {T} K · c_v/k_B = {cv} = 3/2 + {cr} (rot) + {cvib} (vib) · Θ_rot = {Tr} K · Θ_vib = {Tv} K',
    'dia.hint': 'Para el H₂ las dos temperaturas están tan separadas (85 K y 6200 K) que se ven tres mesetas: 3/2 por debajo de Θ_rot, 5/2 entre ambas y 7/2 muy por encima de Θ_vib. La rotación tiene un máximo ligeramente superior a 1 cerca de 0.8 Θ_rot, un efecto genuinamente cuántico de la degeneración 2J+1. Para moléculas pesadas Θ_rot es inferior a 1 K y la rotación está siempre "descongelada".',
    'dia.eq.T': 'temperatura del cursor', 'dia.eq.Tr': 'temperatura característica de rotación ħ²/2Ik_B', 'dia.eq.Tv': 'temperatura característica de vibración ħω/k_B', 'dia.eq.cr': 'contribución rotacional', 'dia.eq.cvib': 'contribución vibracional', 'dia.eq.cv': 'calor específico total por molécula',
    'dia.ind.plateau': 'meseta más cercana (3/2, 5/2 ó 7/2)', 'dia.ind.ratio': 'Θ_vib / Θ_rot',
  },
  en: {
    'dia.mol': 'Molecule', 'dia.mol.custom': 'Custom', 'dia.Tr': 'Θ_rot (K)', 'dia.Tv': 'Θ_vib (K)', 'dia.T': 'Cursor temperature log₁₀(T/K)',
    'dia.cap.plot': 'Specific heat per molecule c_v/k_B versus log₁₀ T. Black: total. Dotted: translation (3/2), rotation and vibration. Vertical lines: Θ_rot and Θ_vib. The red cursor marks the panel temperature.',
    'dia.cap.levels': 'Energy levels populated at the cursor temperature: rotational (left, degeneracy 2J+1) and vibrational (right). The height of each bar is the occupation probability.',
    'dia.readout': 'T = {T} K · c_v/k_B = {cv} = 3/2 + {cr} (rot) + {cvib} (vib) · Θ_rot = {Tr} K · Θ_vib = {Tv} K',
    'dia.hint': 'For H₂ the two temperatures are so far apart (85 K and 6200 K) that three plateaus show: 3/2 below Θ_rot, 5/2 between them and 7/2 well above Θ_vib. Rotation has a maximum slightly above 1 near 0.8 Θ_rot, a genuinely quantum effect of the 2J+1 degeneracy. For heavy molecules Θ_rot is below 1 K and rotation is always "unfrozen".',
    'dia.eq.T': 'cursor temperature', 'dia.eq.Tr': 'rotational characteristic temperature ħ²/2Ik_B', 'dia.eq.Tv': 'vibrational characteristic temperature ħω/k_B', 'dia.eq.cr': 'rotational contribution', 'dia.eq.cvib': 'vibrational contribution', 'dia.eq.cv': 'total specific heat per molecule',
    'dia.ind.plateau': 'nearest plateau (3/2, 5/2 or 7/2)', 'dia.ind.ratio': 'Θ_vib / Θ_rot',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'plot', caption: 'dia.cap.plot', cls: 'wide' }, { id: 'lev', caption: 'dia.cap.levels' }], hintKey: 'dia.hint' });
  let Tr = 85, Tv = 6200, logT = 2;
  const pMol = select({ label: 'dia.mol', value: 'H2', options: [...Object.keys(D.MOLECULES).map((m) => ({ value: m, label: m })), { value: 'custom', label: 'dia.mol.custom' }], onChange: (v) => { if (v !== 'custom') { pTr.set(D.MOLECULES[v].Tr); pTv.set(D.MOLECULES[v].Tv); } sync(); draw(); } });
  const pTr = numberField({ label: 'dia.Tr', value: 85, min: 0.01, max: 1000, onChange: () => { pMol.set('custom'); sync(); draw(); } });
  const pTv = numberField({ label: 'dia.Tv', value: 6200, min: 1, max: 20000, onChange: () => { pMol.set('custom'); sync(); draw(); } });
  const pT = slider({ label: 'dia.T', value: 2, min: -1.5, max: 4.5, step: 0.01, format: (v) => (10 ** v).toPrecision(3), onChange: (v) => { logT = v; draw(); } });
  ui.params.append(pMol.el, pTr.el, pTv.el, pT.el);
  for (const o of pMol.input.options) if (o.value !== 'custom') o.textContent = o.value.replace(/(\d)/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'log₁₀ T (K)', ylabel: 'c_v / k_B' });
  const lev = new Plot(ui.canvas.lev, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'A',
    equations: [
      { tex: '\\frac{c_v}{k_B} = \\tfrac32 + c_{\\rm rot}\\!\\Big(\\tfrac{T}{\\htmlId{Tr}{\\Theta_r}}\\Big) + c_{\\rm vib}\\!\\Big(\\tfrac{T}{\\htmlId{Tv}{\\Theta_v}}\\Big) = \\htmlId{cv}{c_v}\\quad (T = \\htmlId{T}{T})', slots: { Tr: { label: 'dia.eq.Tr' }, Tv: { label: 'dia.eq.Tv' }, cv: { label: 'dia.eq.cv' }, T: { label: 'dia.eq.T' } } },
      { tex: 'c_{\\rm vib} = \\frac{x^2 e^{x}}{(e^{x}-1)^2} = \\htmlId{cvib}{c_{\\rm vib}},\\ x = \\Theta_v/T;\\qquad c_{\\rm rot} = \\frac{\\langle\\varepsilon^2\\rangle - \\langle\\varepsilon\\rangle^2}{k_B^2T^2} = \\htmlId{cr}{c_{\\rm rot}},\\ \\varepsilon_J = J(J+1)k_B\\Theta_r', slots: { cvib: { label: 'dia.eq.cvib' }, cr: { label: 'dia.eq.cr' } } },
    ],
    indicators: [{ key: 'plateau', label: 'dia.ind.plateau' }, { key: 'ratio', label: 'dia.ind.ratio' }],
  });
  function sync() { Tr = pTr.get(); Tv = pTv.get(); eq.update({ Tr, Tv }); eq.setIndicator('ratio', Tv / Tr); }
  function reset() { logT = -1.5; pT.set(logT); sync(); }
  function step() { logT = Math.min(4.5, logT + 0.01); pT.set(logT); if (logT >= 4.5) loop.pause(); }
  function draw() {
    const T = 10 ** logT;
    plot.setScales(-1.5, 4.5, 0, 4); plot.clear();
    const xs = Array.from({ length: 400 }, (_, i) => -1.5 + 6 * i / 399);
    plot.color('#ccc'); for (const y of [1.5, 2.5, 3.5]) plot.line(-1.5, y, 4.5, y);
    plot.color('rgba(40,160,60,0.7)'); plot.line(Math.log10(Tr), 0, Math.log10(Tr), 4); plot.line(Math.log10(Tv), 0, Math.log10(Tv), 4);
    plot.ctx.setLineDash([4, 4]);
    plot.color('#1f4e9c'); plot.polyline(xs, xs.map((x) => D.cvRot(10 ** x, Tr)));
    plot.color('#c87814'); plot.polyline(xs, xs.map((x) => D.cvVib(10 ** x, Tv)));
    plot.ctx.setLineDash([]);
    plot.color('#222'); plot.lineWidth(2); plot.polyline(xs, xs.map((x) => D.cv(10 ** x, Tr, Tv))); plot.lineWidth(1);
    plot.color('rgba(181,40,30,0.9)'); plot.line(logT, 0, logT, 4); plot.disk(logT, D.cv(T, Tr, Tv), 0.06);
    plot.end();
    // level populations
    lev.clear();
    const Zr = D.zRot(T, Tr);
    lev.color('#222'); lev.text(0.22, 0.95, 'J', { align: 'center' }); lev.text(0.72, 0.95, 'n', { align: 'center' });
    for (let J = 0; J < 12; J++) { const p = (2 * J + 1) * Math.exp(-J * (J + 1) * Tr / T) / Zr; const y = 0.08 + J * 0.07; lev.color('rgba(31,78,156,0.8)'); lev.bar(0.08, 0.08 + 0.3 * p, y + 0.03, y); lev.color('#999'); lev.line(0.06, y, 0.4, y); }
    const x0 = Tv / T, Zv = x0 > 700 ? 1 : 1 / (1 - Math.exp(-x0));
    for (let n = 0; n < 12; n++) { const p = (x0 > 700 ? (n === 0 ? 1 : 0) : Math.exp(-n * x0)) / Zv; const y = 0.08 + n * 0.07; lev.color('rgba(200,120,20,0.85)'); lev.bar(0.58, 0.58 + 0.3 * p, y + 0.03, y); lev.color('#999'); lev.line(0.56, y, 0.9, y); }
    lev.end();
    const cr = D.cvRot(T, Tr), cvb = D.cvVib(T, Tv), cv = 1.5 + cr + cvb;
    ui.readout.textContent = i18n.t('dia.readout', { T: T.toPrecision(3), cv: cv.toFixed(3), cr: cr.toFixed(3), cvib: cvb.toFixed(3), Tr, Tv });
    eq.update({ T, cv, cr, cvib: cvb });
    const plateau = [1.5, 2.5, 3.5].reduce((a, b) => (Math.abs(b - cv) < Math.abs(a - cv) ? b : a));
    eq.setIndicator('plateau', plateau, Math.abs(plateau - cv) < 0.05 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset(); logT = 2; pT.set(2);
  const off = autoResize([plot, lev], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
