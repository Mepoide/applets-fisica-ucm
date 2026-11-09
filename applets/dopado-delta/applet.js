// δ-doped GaAs — Quantum Devices experiment 2 (Thomas–Fermi potential + finite differences).
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as DD from './model.js';

export const meta = { slug: 'dopado-delta', titleKey: 'dd.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'dd.ND': 'Densidad de donadores N_D (10¹² cm⁻²)', 'dd.N': 'Puntos de la malla N', 'dd.c': 'Semi-intervalo c (a*)',
    'dd.cap.pot': 'Potencial de Thomas–Fermi V(z) (gris) en unidades de Ry* con los niveles confinados (trazos) y sus funciones de onda. E_F = 0.',
    'dd.cap.lev': 'Energías de las subbandas frente a N_D (la curva se construye al iniciar). Punteado: profundidad del potencial V(0).',
    'dd.readout': 'N_D = {ND} ×10¹² cm⁻² · z₀ = {z0} a* · V(0) = {V0} Ry* ({V0meV} meV) · subbandas ocupadas: {n} · E = {Es} Ry* · Σ n_i = {ne} (N_D = {ND})',
    'dd.hint': 'El potencial es exactamente −a²/(a|z|+z₀)⁴: decae como |z|⁻⁴, por eso basta un intervalo finito. Al aumentar N_D el pozo se hace más profundo y estrecho y aparecen más subbandas por debajo de E_F. Comprueba la neutralidad: la suma de poblaciones de las subbandas (DOS 2D constante) debe aproximarse a N_D; Thomas–Fermi es tanto mejor cuantas más subbandas hay. Varía N y c para ver la convergencia numérica.',
    'dd.eq.ND': 'densidad de donadores en a*⁻² = 10¹² cm⁻²', 'dd.eq.z0': 'longitud (a³/πN_D)^{1/5}', 'dd.eq.E1': 'energía de la subbanda fundamental', 'dd.eq.n': 'número de subbandas bajo E_F',
    'dd.ind.neu': 'Σ n_i / N_D (neutralidad: 1)', 'dd.ind.n': 'subbandas ocupadas',
  },
  en: {
    'dd.ND': 'Donor density N_D (10¹² cm⁻²)', 'dd.N': 'Grid points N', 'dd.c': 'Half-interval c (a*)',
    'dd.cap.pot': 'Thomas–Fermi potential V(z) (grey) in units of Ry* with the confined levels (ticks) and their wave functions. E_F = 0.',
    'dd.cap.lev': 'Subband energies versus N_D (the curve builds up on start). Dotted: potential depth V(0).',
    'dd.readout': 'N_D = {ND} ×10¹² cm⁻² · z₀ = {z0} a* · V(0) = {V0} Ry* ({V0meV} meV) · occupied subbands: {n} · E = {Es} Ry* · Σ n_i = {ne} (N_D = {ND})',
    'dd.hint': 'The potential is exactly −a²/(a|z|+z₀)⁴: it decays as |z|⁻⁴, which is why a finite interval suffices. Increasing N_D makes the well deeper and narrower and more subbands appear below E_F. Check neutrality: the sum of subband populations (constant 2D DOS) should approach N_D; Thomas–Fermi improves as the number of subbands grows. Vary N and c to see the numerical convergence.',
    'dd.eq.ND': 'donor density in a*⁻² = 10¹² cm⁻²', 'dd.eq.z0': 'length (a³/πN_D)^{1/5}', 'dd.eq.E1': 'ground-subband energy', 'dd.eq.n': 'number of subbands below E_F',
    'dd.ind.neu': 'Σ n_i / N_D (neutrality: 1)', 'dd.ind.n': 'occupied subbands',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'pot', caption: 'dd.cap.pot', cls: 'wide' }, { id: 'lev', caption: 'dd.cap.lev' }], hintKey: 'dd.hint' });
  let ND = 5, sb, curve = [];
  const pND = slider({ label: 'dd.ND', value: 5, min: 0.5, max: 10, step: 0.1, format: (v) => v.toFixed(1), onChange: () => { compute(); draw(); } });
  const pN = numberField({ label: 'dd.N', value: 800, min: 100, max: 3000, integer: true, onChange: () => { compute(); draw(); } });
  const pc = numberField({ label: 'dd.c', value: 4, min: 1, max: 10, step: 0.5, onChange: () => { compute(); draw(); } });
  ui.params.append(pND.el, pN.el, pc.el);
  const pp = new Plot(ui.canvas.pot, { axes: true, xlabel: 'z (a*)', ylabel: 'E (Ry*)' });
  const pl = new Plot(ui.canvas.lev, { axes: true, xlabel: 'N_D (10¹² cm⁻²)', ylabel: 'E (Ry*)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\frac{d^2V}{dz^2} = -\\frac{8}{3\\pi}\\,[E_F - V]^{3/2} + 8\\pi \\htmlId{ND}{N_D}\\,\\delta(z)\\ \\Rightarrow\\ V(z) = -\\frac{a^2}{(a|z| + \\htmlId{z0}{z_0})^4},\\quad a = \\tfrac{2}{15\\pi}', slots: { ND: { label: 'dd.eq.ND' }, z0: { label: 'dd.eq.z0' } } },
      { tex: '-\\chi_n\'\' + V(z_n)\\chi_n = E\\chi_n\\ \\to\\ \\frac{-\\chi_{n+1} + 2\\chi_n - \\chi_{n-1}}{s^2} + V_n\\chi_n = E\\chi_n;\\qquad E_1 = \\htmlId{E1}{E_1},\\ n_{\\rm sub} = \\htmlId{n}{n}', slots: { E1: { label: 'dd.eq.E1' }, n: { label: 'dd.eq.n' } } },
    ],
    indicators: [{ key: 'neu', label: 'dd.ind.neu' }, { key: 'n', label: 'dd.ind.n' }],
  });
  function compute() {
    ND = pND.get(); sb = DD.subbands(ND, { c: pc.get(), N: pN.get() });
    const ne = DD.occupation(sb.E).reduce((a, b) => a + b, 0);
    eq.update({ ND, z0: DD.z0(ND), E1: sb.E[0], n: sb.E.length });
    eq.setIndicator('neu', ne / ND, Math.abs(ne / ND - 1) < 0.1 ? 'ok' : 'warn'); eq.setIndicator('n', sb.E.length, 'ok');
    if (!curve.some((p) => Math.abs(p.ND - ND) < 1e-6)) { curve.push({ ND, E: [...sb.E] }); curve.sort((p, q) => p.ND - q.ND); }
  }
  function reset() { curve = []; compute(); }
  function step() { const v = Math.round((pND.get() + 0.2) * 10) / 10; if (v > 10) { loop.pause(); return; } pND.set(v); compute(); }
  function draw() {
    const c = pc.get(), depth = DD.depth(ND), ymin = Math.max(depth * 1.05, -400);
    pp.setScales(-c, c, ymin, -ymin * 0.15); pp.clear();
    const zs = Array.from({ length: 500 }, (_, i) => -c + 2 * c * i / 499);
    pp.color('#999'); pp.line(-c, 0, c, 0);
    pp.color('rgba(90,90,90,0.9)'); pp.lineWidth(1.5); pp.polyline(zs, zs.map((z) => Math.max(ymin, DD.potential(z, ND)))); pp.lineWidth(1);
    const cols = ['rgba(181,40,30,0.9)', 'rgba(220,130,20,0.9)', 'rgba(31,78,156,0.9)', 'rgba(40,160,60,0.9)', 'rgba(140,60,160,0.9)', 'rgba(60,60,60,0.8)'];
    const gap = sb.E.length > 1 ? sb.E[1] - sb.E[0] : -sb.E[0]; const amp = Math.min(Math.abs(gap) * 0.6, -ymin * 0.12);
    sb.E.forEach((E, i) => { pp.color(cols[i % cols.length]); pp.line(-c, E, c, E); const pm = Math.max(...sb.psi[i].map(Math.abs)); pp.polyline(sb.zs, Array.from(sb.psi[i], (v) => E + amp * v / pm)); });
    pp.end();
    pl.setScales(0, 10.5, Math.max(DD.depth(10) * 0.5, -120), 2); pl.clear();
    pl.color('#999'); pl.line(0, 0, 10.5, 0);
    pl.ctx.setLineDash([4, 4]); pl.color('#888'); const nx = Array.from({ length: 100 }, (_, i) => 0.3 + 10.2 * i / 99); pl.polyline(nx, nx.map((n) => Math.max(pl.ymin, DD.depth(n)))); pl.ctx.setLineDash([]);
    for (let i = 0; i < 6; i++) { const pts = curve.filter((p) => p.E[i] != null); if (pts.length) { pl.color(cols[i]); pl.polyline(pts.map((p) => p.ND), pts.map((p) => p.E[i])); pts.forEach((p) => pl.disk(p.ND, p.E[i], 0.08)); } }
    pl.color('#222'); pl.line(ND, pl.ymin, ND, 2);
    pl.end();
    const ne = DD.occupation(sb.E).reduce((a, b) => a + b, 0);
    ui.readout.textContent = i18n.t('dd.readout', { ND: ND.toFixed(1), z0: DD.z0(ND).toFixed(3), V0: depth.toFixed(1), V0meV: (depth * DD.RY).toFixed(0), n: sb.E.length, Es: sb.E.map((E) => E.toFixed(2)).join(', '), ne: ne.toFixed(2) });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 4 }).el);
  reset();
  const off = autoResize([pp, pl], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
