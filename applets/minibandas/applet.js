// Minibands in a semiconductor superlattice — Quantum Devices experiment 7.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as MB from './model.js';

export const meta = { slug: 'minibandas', titleKey: 'mb.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'mb.x': 'Fracción de Al x', 'mb.dp': 'Espesor de los pozos d_p (nm)', 'mb.db': 'Espesor de las barreras d_b (nm)',
    'mb.cap.bands': 'Minibandas permitidas frente al espesor de barrera (la figura se construye al iniciar): modelo de Kronig–Penney con masas (azul) y barreras δ de igual área (rojo). Verde: nivel del pozo aislado. Línea gris: V₀.',
    'mb.cap.disp': 'Relación de dispersión E(K) en la minizona de Brillouin, 0 ≤ K ≤ π/L, para el espesor actual: Kronig–Penney (azul) y modelo δ (rojo).',
    'mb.readout': 'x = {x} · d_p = {dp} nm · d_b = {db} nm · L = {L} nm · V₀ = {V0} meV · nivel aislado {E1} meV · minibandas bajo V₀: {bands} meV · anchura de la primera {w} meV',
    'mb.hint': 'Al estrechar las barreras los niveles de pozos vecinos se acoplan por efecto túnel y cada nivel se ensancha en una minibanda centrada cerca del nivel aislado; la anchura crece exponencialmente al reducir d_b. Con barreras gruesas las minibandas colapsan en niveles. El modelo de barreras δ con la misma área reproduce bien las minibandas cuando d_b ≪ d_p y falla cuando la barrera es gruesa o la energía se acerca a V₀.',
    'mb.eq.x': 'fracción de aluminio', 'mb.eq.dp': 'espesor del pozo', 'mb.eq.db': 'espesor de la barrera', 'mb.eq.w1': 'anchura de la primera minibanda', 'mb.eq.E1': 'nivel del pozo aislado',
    'mb.ind.w': 'anchura 1ª minibanda / nivel aislado', 'mb.ind.delta': 'error del modelo δ en el centro de la 1ª minibanda',
  },
  en: {
    'mb.x': 'Al fraction x', 'mb.dp': 'Well thickness d_p (nm)', 'mb.db': 'Barrier thickness d_b (nm)',
    'mb.cap.bands': 'Allowed minibands versus barrier thickness (the figure builds up on start): Kronig–Penney with masses (blue) and δ barriers of equal area (red). Green: isolated-well level. Grey line: V₀.',
    'mb.cap.disp': 'Dispersion relation E(K) in the mini Brillouin zone, 0 ≤ K ≤ π/L, for the current thickness: Kronig–Penney (blue) and δ model (red).',
    'mb.readout': 'x = {x} · d_p = {dp} nm · d_b = {db} nm · L = {L} nm · V₀ = {V0} meV · isolated level {E1} meV · minibands below V₀: {bands} meV · width of the first {w} meV',
    'mb.hint': 'As the barriers get thinner the levels of neighbouring wells couple by tunnelling and each level broadens into a miniband centred near the isolated level; the width grows exponentially as d_b shrinks. With thick barriers the minibands collapse into levels. The δ-barrier model of equal area reproduces the minibands well when d_b ≪ d_p and fails when the barrier is thick or the energy approaches V₀.',
    'mb.eq.x': 'aluminium fraction', 'mb.eq.dp': 'well thickness', 'mb.eq.db': 'barrier thickness', 'mb.eq.w1': 'width of the first miniband', 'mb.eq.E1': 'isolated-well level',
    'mb.ind.w': 'first miniband width / isolated level', 'mb.ind.delta': 'δ-model error at the centre of the 1st miniband',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'bands', caption: 'mb.cap.bands', cls: 'wide' }, { id: 'disp', caption: 'mb.cap.disp' }], hintKey: 'mb.hint' });
  let x = 0.3, dp = 60, db = 20, kp = [], dl = [], curve = [];
  const px = slider({ label: 'mb.x', value: 0.3, min: 0.05, max: 0.45, step: 0.01, format: (v) => v.toFixed(2), onChange: () => { curve = []; compute(); draw(); } });
  const pdp = slider({ label: 'mb.dp', value: 6, min: 2, max: 15, step: 0.5, format: (v) => v.toFixed(1), onChange: () => { curve = []; compute(); draw(); } });
  const pdb = slider({ label: 'mb.db', value: 2, min: 0.5, max: 10, step: 0.25, format: (v) => v.toFixed(2), onChange: () => { compute(); draw(); } });
  ui.params.append(px.el, pdp.el, pdb.el);
  const pb = new Plot(ui.canvas.bands, { axes: true, xlabel: 'd_b (nm)', ylabel: 'E (meV)' });
  const pd = new Plot(ui.canvas.disp, { axes: true, xlabel: 'K L / π', ylabel: 'E (meV)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: '\\cos(K L) = \\cos(k d_p)\\cosh(\\kappa d_b) + \\tfrac12\\Big(\\frac{\\kappa m_A}{k m_B} - \\frac{k m_B}{\\kappa m_A}\\Big)\\sin(k d_p)\\sinh(\\kappa d_b),\\quad d_p = \\htmlId{dp}{d_p},\\ d_b = \\htmlId{db}{d_b},\\ x = \\htmlId{x}{x}', slots: { dp: { label: 'mb.eq.dp' }, db: { label: 'mb.eq.db' }, x: { label: 'mb.eq.x' } } },
      { tex: '\\delta:\\ \\cos(KL) = \\cos(kL) + \\frac{m_A V_0 d_b}{\\hbar^2 k}\\sin(kL);\\qquad E_1^{\\rm pozo} = \\htmlId{E1}{E_1},\\quad \\Delta E_1 = \\htmlId{w1}{\\Delta E_1}', slots: { E1: { label: 'mb.eq.E1' }, w1: { label: 'mb.eq.w1' } } },
    ],
    indicators: [{ key: 'w', label: 'mb.ind.w' }, { key: 'delta', label: 'mb.ind.delta' }],
  });
  function compute() {
    x = px.get(); dp = pdp.get() * 10; db = pdb.get() * 10; const { V0 } = MB.materials(x);
    kp = MB.bands((E) => MB.kpRHS(E, x, dp, db), 1e-4, V0 * 1.2); dl = MB.bands((E) => MB.deltaRHS(E, x, dp, db), 1e-4, V0 * 1.2);
    if (!curve.some((p) => Math.abs(p.db - db) < 1e-9)) { curve.push({ db, kp, dl }); curve.sort((p, q) => p.db - q.db); }
    const E1 = MB.isolatedLevel(x, dp), w1 = kp.length ? kp[0][1] - kp[0][0] : 0;
    eq.update({ dp: dp / 10, db: db / 10, x, E1: E1 * 1000, w1: w1 * 1000 });
    eq.setIndicator('w', E1 ? w1 / E1 : NaN, 'none');
    eq.setIndicator('delta', kp.length && dl.length ? ((dl[0][0] + dl[0][1]) - (kp[0][0] + kp[0][1])) / (kp[0][0] + kp[0][1]) : NaN, db < 0.2 * dp ? 'ok' : 'none');
  }
  function reset() { curve = []; compute(); }
  function step() { const v = pdb.get() + 0.25; if (v > 10) { loop.pause(); return; } pdb.set(v); compute(); }
  function draw() {
    const { V0 } = MB.materials(x), top = V0 * 1.2 * 1000;
    pb.setScales(0.5, 10, 0, top); pb.clear();
    pb.color('#999'); pb.line(0.5, V0 * 1000, 10, V0 * 1000);
    const E1 = MB.isolatedLevel(x, dp); if (E1) { pb.color('rgba(40,160,60,0.8)'); pb.line(0.5, E1 * 1000, 10, E1 * 1000); }
    const wbar = 0.25 / 2;
    curve.forEach((p) => { pb.color('rgba(31,78,156,0.6)'); p.kp.forEach(([a, b]) => pb.bar(p.db / 10 - wbar, p.db / 10 + wbar, b * 1000, a * 1000)); pb.color('rgba(181,40,30,0.5)'); p.dl.forEach(([a, b]) => pb.bar(p.db / 10 - wbar * 0.4, p.db / 10 + wbar * 0.4, b * 1000, a * 1000)); });
    pb.color('#222'); pb.line(db / 10, 0, db / 10, top);
    pb.end();
    pd.setScales(0, 1, 0, top); pd.clear();
    const drawDisp = (f, col) => { for (const [a, b] of MB.bands(f, 1e-4, V0 * 1.2)) { const Es = Array.from({ length: 120 }, (_, i) => a + (b - a) * (i + 0.5) / 120), Ks = Es.map((E) => MB.blochK(f, E)); pd.color(col); pd.lineWidth(2); pd.polyline(Ks, Es.map((E) => E * 1000)); pd.lineWidth(1); } };
    drawDisp((E) => MB.deltaRHS(E, x, dp, db), 'rgba(181,40,30,0.8)'); drawDisp((E) => MB.kpRHS(E, x, dp, db), 'rgba(31,78,156,0.9)');
    pd.color('#999'); pd.line(0, V0 * 1000, 1, V0 * 1000);
    pd.end();
    ui.readout.textContent = i18n.t('mb.readout', { x: x.toFixed(2), dp: (dp / 10).toFixed(1), db: (db / 10).toFixed(2), L: ((dp + db) / 10).toFixed(2), V0: (V0 * 1000).toFixed(0), E1: E1 ? (E1 * 1000).toFixed(1) : '–', bands: kp.filter(([a]) => a < V0).map(([a, b]) => `[${(a * 1000).toFixed(0)}, ${(b * 1000).toFixed(0)}]`).join(' '), w: kp.length ? ((kp[0][1] - kp[0][0]) * 1000).toFixed(1) : '–' });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 4 }).el);
  reset();
  const off = autoResize([pb, pd], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
