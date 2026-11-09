// Time evolution of electrons under electric fields — Solid State experiment 11.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as B from './model.js';

export const meta = { slug: 'oscilaciones-bloch', titleKey: 'blo.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'blo.F': 'Campo eléctrico F (unidades de T/a)', 'blo.N': 'Átomos N', 'blo.W': 'Desorden diagonal W',
    'blo.cap.psi': 'Probabilidad |ψ_n(t)|² sobre la red (rojo). El electrón parte localizado en el átomo central. Gris: la "escalera" de energías de sitio F·n que inclina el campo.',
    'blo.cap.r': 'Radio cuadrático medio del paquete frente al tiempo. Azul punteado: expansión balística sin campo, √2 T t. Verde: periodo de Bloch T_B = 2π/F. Con campo el paquete respira sin expandirse (localización dinámica).',
    'blo.readout': 't = {t} · F = {F} · radio r(t) = {r} (libre: {rf}) · T_B = {TB} · extensión de Wannier–Stark 4T/F = {L} · t/T_B = {per}',
    'blo.hint': 'Con F = 0 el paquete se expande sin límite, linealmente en t (no como √t: es un movimiento coherente, no difusión). Con F > 0 el momento cristalino crece como k = Ft; al llegar al borde de zona el electrón se refleja por Bragg y vuelve: oscilaciones de Bloch de periodo 2π/F. El paquete queda confinado a 4T/F sitios, igual que las autofunciones de Wannier–Stark. Añade desorden W: a campo cero el paquete deja de crecer (localización de Anderson).',
    'blo.eq.F': 'campo eléctrico (energía por sitio)', 'blo.eq.T': 'integral de salto entre vecinos', 'blo.eq.r': 'radio cuadrático medio medido', 'blo.eq.TB': 'periodo de Bloch', 'blo.eq.L': 'extensión de las funciones de Wannier–Stark',
    'blo.ind.ratio': 'r(t) / √2Tt (balístico: 1)', 'blo.ind.rec': 'fracción del periodo de Bloch',
  },
  en: {
    'blo.F': 'Electric field F (units of T/a)', 'blo.N': 'Atoms N', 'blo.W': 'Diagonal disorder W',
    'blo.cap.psi': 'Probability |ψ_n(t)|² on the lattice (red). The electron starts localised on the central atom. Grey: the "ladder" of site energies F·n tilted by the field.',
    'blo.cap.r': 'Root-mean-square radius of the packet versus time. Dotted blue: ballistic spreading without field, √2 T t. Green: Bloch period T_B = 2π/F. With field the packet breathes without spreading (dynamic localisation).',
    'blo.readout': 't = {t} · F = {F} · radius r(t) = {r} (free: {rf}) · T_B = {TB} · Wannier–Stark extent 4T/F = {L} · t/T_B = {per}',
    'blo.hint': 'With F = 0 the packet spreads without bound, linearly in t (not as √t: this is coherent motion, not diffusion). With F > 0 the crystal momentum grows as k = Ft; on reaching the zone edge the electron is Bragg-reflected and comes back: Bloch oscillations of period 2π/F. The packet stays confined to 4T/F sites, like the Wannier–Stark eigenfunctions. Add disorder W: at zero field the packet stops growing (Anderson localisation).',
    'blo.eq.F': 'electric field (energy per site)', 'blo.eq.T': 'nearest-neighbour hopping integral', 'blo.eq.r': 'measured rms radius', 'blo.eq.TB': 'Bloch period', 'blo.eq.L': 'extent of the Wannier–Stark functions',
    'blo.ind.ratio': 'r(t) / √2Tt (ballistic: 1)', 'blo.ind.rec': 'fraction of the Bloch period',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'psi', caption: 'blo.cap.psi', cls: 'wide' }, { id: 'r', caption: 'blo.cap.r' }], hintKey: 'blo.hint' });
  let s;
  const pF = slider({ label: 'blo.F', value: 0.2, min: 0, max: 1, step: 0.01, format: (v) => v.toFixed(2) });
  const pN = numberField({ label: 'blo.N', value: 121, min: 21, max: 241, integer: true });
  const pW = slider({ label: 'blo.W', value: 0, min: 0, max: 3, step: 0.1, format: (v) => v.toFixed(1) });
  ui.params.append(pF.el, pN.el, pW.el);
  const ppsi = new Plot(ui.canvas.psi, { axes: true, xlabel: 'n', ylabel: '|ψ_n|²' });
  const pr = new Plot(ui.canvas.r, { axes: true, xlabel: 't', ylabel: 'r(t)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'B',
    equations: [
      { tex: 'i\\,\\dot\\psi_n = (\\varepsilon_n + \\htmlId{F}{F}\\,n)\\,\\psi_n - \\htmlId{T}{T}\\,(\\psi_{n+1} + \\psi_{n-1}),\\qquad r(t) = \\sqrt{\\textstyle\\sum_n (n-n_0)^2 |\\psi_n|^2} = \\htmlId{r}{r}', slots: { F: { label: 'blo.eq.F' }, T: { label: 'blo.eq.T' }, r: { label: 'blo.eq.r' } } },
      { tex: 'F = 0:\\ r = \\sqrt2\\,T t;\\qquad F > 0:\\ T_B = \\frac{2\\pi}{F} = \\htmlId{TB}{T_B},\\quad L_{WS} = \\frac{4T}{F} = \\htmlId{L}{L}', slots: { TB: { label: 'blo.eq.TB' }, L: { label: 'blo.eq.L' } } },
    ],
    indicators: [{ key: 'ratio', label: 'blo.ind.ratio' }, { key: 'rec', label: 'blo.ind.rec' }],
  });
  function reset() { s = B.create({ N: pN.get() | 1, T: 1, F: pF.get(), W: pW.get() }); s.prob = B.probability(s, 0); eq.update({ F: s.F, T: 1, TB: B.blochPeriod(s.F), L: B.blochAmplitude(1, s.F) }); }
  function step() { B.advance(s, 0.05); if (s.t > 400) loop.pause(); }
  function draw() {
    const N = s.N, p = s.prob, pmax = Math.max(0.05, ...p);
    ppsi.setScales(0, N, 0, pmax * 1.1); ppsi.clear();
    ppsi.color('#ccc'); const ladder = Array.from({ length: N }, (_, n) => n), lad = ladder.map((n) => pmax * 1.1 * (0.5 + 0.4 * (n - s.n0) / N * Math.sign(s.F) * (s.F > 0 ? 1 : 0))); ppsi.polyline(ladder, lad);
    ppsi.color('rgba(181,40,30,0.85)'); for (let n = 0; n < N; n++) if (p[n] > 1e-4) ppsi.bar(n, n + 1, p[n]);
    ppsi.end();
    const h = s.history, tmax = Math.max(20, s.t * 1.05), rmax = Math.max(10, ...h.map((v) => v[2])) * 1.1;
    pr.setScales(0, tmax, 0, Math.min(rmax, N)); pr.clear();
    pr.ctx.setLineDash([4, 4]); pr.color('#1f4e9c'); pr.line(0, 0, tmax, Math.min(N, B.freeRadius(1, tmax))); pr.ctx.setLineDash([]);
    if (s.F > 0) { pr.color('rgba(40,160,60,0.7)'); for (let k = 1; k * B.blochPeriod(s.F) < tmax; k++) pr.line(k * B.blochPeriod(s.F), 0, k * B.blochPeriod(s.F), N); }
    pr.color('rgba(181,40,30,0.9)'); pr.lineWidth(2); if (h.length > 1) pr.polyline(h.map((v) => v[0]), h.map((v) => v[2])); pr.lineWidth(1);
    pr.end();
    const r = h.length ? h[h.length - 1][2] : 0, rf = B.freeRadius(1, s.t), TB = B.blochPeriod(s.F);
    ui.readout.textContent = i18n.t('blo.readout', { t: s.t.toFixed(1), F: s.F.toFixed(2), r: r.toFixed(2), rf: rf.toFixed(2), TB: Number.isFinite(TB) ? TB.toFixed(1) : '∞', L: Number.isFinite(TB) ? B.blochAmplitude(1, s.F).toFixed(1) : '∞', per: Number.isFinite(TB) ? (s.t / TB).toFixed(2) : '–' });
    eq.update({ r });
    eq.setIndicator('ratio', s.t > 0 ? r / rf : NaN, s.t > 0 && Math.abs(r / rf - 1) < 0.1 ? 'ok' : 'none'); eq.setIndicator('rec', Number.isFinite(TB) ? (s.t / TB) % 1 : NaN, 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 20 }).el);
  reset();
  const off = autoResize([ppsi, pr], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
