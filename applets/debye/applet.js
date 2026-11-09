// Debye theory of the specific heat of solids — Statistical Physics experiment 7.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, slider, checkbox, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as Db from './model.js';

export const meta = { slug: 'debye', titleKey: 'deb.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'deb.solid': 'Sólido', 'deb.solid.custom': 'Personalizado', 'deb.Theta': 'Θ_D (K)', 'deb.T': 'Temperatura del cursor T (K)', 'deb.einstein': 'Comparar con el modelo de Einstein (Θ_E = Θ_D)', 'deb.lowT': 'Mostrar la ley T³',
    'deb.cap.plot': 'Calor específico por átomo c/k_B frente a T/Θ_D. Negro: Debye. Gris: ley de Dulong–Petit (3). Verde: ley T³ de bajas temperaturas. Punteado: Einstein. El cursor rojo marca la temperatura del panel.',
    'deb.cap.dos': 'Densidad de modos de Debye g(ω) ∝ ω² hasta la frecuencia de corte ω_D (área = 3N modos), y los modos excitados a la temperatura del cursor (sombreado: ocupación de Bose ⟨n⟩ ponderada por g).',
    'deb.readout': 'T = {T} K · T/Θ_D = {x} · c/k_B = {c} · Dulong–Petit 3 · ley T³: {c3} · Einstein: {cE}',
    'deb.hint': 'Mueve el cursor: por debajo de Θ_D/10 la curva sigue la ley T³ (solo se excitan los fonones de longitud de onda larga, cuyo número crece como T³); por encima de Θ_D tiende a 3 (equipartición de 3N osciladores). El modelo de Einstein con una sola frecuencia cae exponencialmente a baja T, en desacuerdo con los experimentos: la diferencia es la contribución de los modos acústicos de baja frecuencia.',
    'deb.eq.T': 'temperatura del cursor', 'deb.eq.Theta': 'temperatura de Debye ħω_D/k_B', 'deb.eq.x': 'cociente T/Θ_D', 'deb.eq.c': 'calor específico por átomo', 'deb.eq.c3': 'ley T³ de bajas temperaturas',
    'deb.ind.dp': 'c / 3 (Dulong–Petit)', 'deb.ind.t3': 'c / c_{T³}',
  },
  en: {
    'deb.solid': 'Solid', 'deb.solid.custom': 'Custom', 'deb.Theta': 'Θ_D (K)', 'deb.T': 'Cursor temperature T (K)', 'deb.einstein': 'Compare with the Einstein model (Θ_E = Θ_D)', 'deb.lowT': 'Show the T³ law',
    'deb.cap.plot': 'Specific heat per atom c/k_B versus T/Θ_D. Black: Debye. Grey: Dulong–Petit law (3). Green: low-temperature T³ law. Dotted: Einstein. The red cursor marks the panel temperature.',
    'deb.cap.dos': 'Debye density of modes g(ω) ∝ ω² up to the cutoff frequency ω_D (area = 3N modes), and the modes excited at the cursor temperature (shaded: Bose occupation ⟨n⟩ weighted by g).',
    'deb.readout': 'T = {T} K · T/Θ_D = {x} · c/k_B = {c} · Dulong–Petit 3 · T³ law: {c3} · Einstein: {cE}',
    'deb.hint': 'Move the cursor: below Θ_D/10 the curve follows the T³ law (only long-wavelength phonons are excited, whose number grows as T³); above Θ_D it tends to 3 (equipartition of 3N oscillators). The Einstein model with a single frequency drops exponentially at low T, in disagreement with experiments: the difference is the contribution of the low-frequency acoustic modes.',
    'deb.eq.T': 'cursor temperature', 'deb.eq.Theta': 'Debye temperature ħω_D/k_B', 'deb.eq.x': 'ratio T/Θ_D', 'deb.eq.c': 'specific heat per atom', 'deb.eq.c3': 'low-temperature T³ law',
    'deb.ind.dp': 'c / 3 (Dulong–Petit)', 'deb.ind.t3': 'c / c_{T³}',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'plot', caption: 'deb.cap.plot', cls: 'wide' }, { id: 'dos', caption: 'deb.cap.dos' }], hintKey: 'deb.hint' });
  let Theta = 315, T = 100;
  const pSolid = select({ label: 'deb.solid', value: 'Cu', options: [...Object.keys(Db.SOLIDS).map((k) => ({ value: k, label: k })), { value: 'custom', label: 'deb.solid.custom' }], onChange: (v) => { if (v !== 'custom') pTheta.set(Db.SOLIDS[v]); sync(); draw(); } });
  const pTheta = numberField({ label: 'deb.Theta', value: 315, min: 10, max: 3000, onChange: () => { pSolid.set('custom'); sync(); draw(); } });
  const pT = slider({ label: 'deb.T', value: 100, min: 1, max: 1000, step: 1, onChange: (v) => { T = v; draw(); } });
  const pE = checkbox({ label: 'deb.einstein', checked: true, onChange: () => draw() });
  const pL = checkbox({ label: 'deb.lowT', checked: true, onChange: () => draw() });
  ui.params.append(pSolid.el, pTheta.el, pT.el, pE.el, pL.el);
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'T / Θ_D', ylabel: 'c / k_B' });
  const dos = new Plot(ui.canvas.dos, { axes: true, xlabel: 'ω / ω_D', ylabel: 'g(ω)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'A',
    equations: [
      { tex: '\\frac{c}{k_B} = 9\\Big(\\frac{\\htmlId{T}{T}}{\\htmlId{Theta}{\\Theta_D}}\\Big)^{3}\\!\\int_0^{\\Theta_D/T}\\frac{x^4 e^x}{(e^x-1)^2}\\,dx = \\htmlId{c}{c},\\qquad \\frac{T}{\\Theta_D} = \\htmlId{x}{T/\\Theta_D}', slots: { T: { label: 'deb.eq.T' }, Theta: { label: 'deb.eq.Theta' }, c: { label: 'deb.eq.c' }, x: { label: 'deb.eq.x' } } },
      { tex: 'T \\ll \\Theta_D:\\ \\frac{c}{k_B} \\to \\frac{12\\pi^4}{5}\\Big(\\frac{T}{\\Theta_D}\\Big)^3 = \\htmlId{c3}{c_{T^3}};\\qquad T \\gg \\Theta_D:\\ \\frac{c}{k_B} \\to 3', slots: { c3: { label: 'deb.eq.c3' } } },
    ],
    indicators: [{ key: 'dp', label: 'deb.ind.dp' }, { key: 't3', label: 'deb.ind.t3' }],
  });
  function sync() { Theta = pTheta.get(); pT.input.max = String(Math.round(2.5 * Theta)); eq.update({ Theta }); }
  function reset() { sync(); T = Math.max(1, Math.round(Theta * 0.02)); pT.set(T); }
  function step() { T = Math.min(2.5 * Theta, T + Theta * 0.005); pT.set(Math.round(T)); if (T >= 2.5 * Theta) loop.pause(); }
  function draw() {
    const x = T / Theta;
    plot.setScales(0, 2.5, 0, 3.3); plot.clear();
    plot.color('#999'); plot.line(0, 3, 2.5, 3);
    const xs = Array.from({ length: 300 }, (_, i) => 0.002 + 2.5 * i / 299);
    if (pL.get()) { plot.color('rgba(40,160,60,0.8)'); plot.polyline(xs, xs.map((u) => Math.min(3.3, Db.cLowT(u, 1)))); }
    if (pE.get()) { plot.ctx.setLineDash([4, 4]); plot.color('#1f4e9c'); plot.polyline(xs, xs.map((u) => Db.cEinstein(u, 1))); plot.ctx.setLineDash([]); }
    plot.color('#222'); plot.lineWidth(2); plot.polyline(xs, xs.map((u) => Db.cDebye(u, 1))); plot.lineWidth(1);
    plot.color('rgba(181,40,30,0.9)'); plot.line(x, 0, x, 3.3); plot.disk(x, Db.cDebye(T, Theta), 0.03);
    plot.end();
    dos.setScales(0, 1.05, 0, 3.3); dos.clear();
    const ws = Array.from({ length: 120 }, (_, i) => (i + 0.5) / 120);
    dos.color('rgba(31,78,156,0.25)');
    for (const w of ws) { const n = 1 / (Math.exp(Math.min(700, w / x)) - 1); dos.bar(w - 1 / 240, w + 1 / 240, 3 * w * w * Math.min(1, n)); }
    dos.color('#1f4e9c'); dos.lineWidth(2); dos.polyline([0, ...ws, 1, 1], [0, ...ws.map((w) => 3 * w * w), 3, 0]); dos.lineWidth(1);
    dos.end();
    const c = Db.cDebye(T, Theta), c3 = Db.cLowT(T, Theta), cE = Db.cEinstein(T, Theta);
    ui.readout.textContent = i18n.t('deb.readout', { T: Math.round(T), x: x.toFixed(3), c: c.toFixed(3), c3: c3 > 10 ? '≫3' : c3.toFixed(3), cE: cE.toFixed(3) });
    eq.update({ T, c, x, c3 });
    eq.setIndicator('dp', c / 3, c / 3 > 0.95 ? 'ok' : 'none');
    eq.setIndicator('t3', c / c3, Math.abs(c / c3 - 1) < 0.05 ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset(); T = 100; pT.set(100);
  const off = autoResize([plot, dos], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
