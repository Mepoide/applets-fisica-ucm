// Dimensionality and thermodynamic limit in the Ising model — Statistical Physics experiment 5.
// Exact specific heat of Nx×Ny tori by transfer matrix, computed progressively.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as I from './model.js';

export const meta = { slug: 'cvising', titleKey: 'cvi.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'cvi.Nx': 'Nx (1–7)', 'cvi.Ny': 'Ny (1–64)', 'cvi.keep': 'Conservar curvas anteriores',
    'cvi.cap.plot': 'Calor específico por espín c(T) (J = k_B = 1). Rojo: red Nx×Ny exacta (se calcula punto a punto al iniciar). Gris: cadena 1D infinita. Azul: red 2D infinita (Onsager), que diverge en T_c. Línea vertical: T_c.',
    'cvi.cap.lattice': 'La red Nx×Ny con condiciones periódicas en ambas direcciones (un toro). Nx = 1 es una cadena; cuanto más parecidos y grandes Nx y Ny, más cerca del límite termodinámico bidimensional.',
    'cvi.readout': 'red {Nx}×{Ny} ({N} espines) · puntos calculados {k}/{n} · máximo de c en T = {Tp} (c = {cp}) · T_c = {Tc}',
    'cvi.hint': 'Prueba Nx = 1 con Ny grande: la curva cae sobre la cadena 1D, analítica y sin transición. Pasa a 2×32, 3×32, 4×16, 6×6: el máximo crece y se acerca a T_c, pero sigue siendo finito y suave: con un número finito de términos la función de partición es analítica. Solo el límite termodinámico produce la divergencia de Onsager.',
    'cvi.eq.Nx': 'anchura de la red (filas de la matriz de transferencia)', 'cvi.eq.Ny': 'longitud de la red', 'cvi.eq.N': 'número de espines', 'cvi.eq.Tc': 'temperatura crítica de Onsager, 2/ln(1+√2)', 'cvi.eq.Tp': 'temperatura del máximo de c calculado', 'cvi.eq.cp': 'valor del máximo',
    'cvi.ind.dT': '|T_max − T_c| / T_c', 'cvi.ind.prog': 'progreso del cálculo',
  },
  en: {
    'cvi.Nx': 'Nx (1–7)', 'cvi.Ny': 'Ny (1–64)', 'cvi.keep': 'Keep previous curves',
    'cvi.cap.plot': 'Specific heat per spin c(T) (J = k_B = 1). Red: exact Nx×Ny lattice (computed point by point on start). Grey: infinite 1D chain. Blue: infinite 2D lattice (Onsager), divergent at T_c. Vertical line: T_c.',
    'cvi.cap.lattice': 'The Nx×Ny lattice with periodic boundaries in both directions (a torus). Nx = 1 is a chain; the larger and more similar Nx and Ny, the closer to the two-dimensional thermodynamic limit.',
    'cvi.readout': 'lattice {Nx}×{Ny} ({N} spins) · points computed {k}/{n} · maximum of c at T = {Tp} (c = {cp}) · T_c = {Tc}',
    'cvi.hint': 'Try Nx = 1 with large Ny: the curve falls on the 1D chain, analytic, no transition. Go to 2×32, 3×32, 4×16, 6×6: the maximum grows and approaches T_c, but it stays finite and smooth: with a finite number of terms the partition function is analytic. Only the thermodynamic limit produces Onsager\'s divergence.',
    'cvi.eq.Nx': 'lattice width (rows of the transfer matrix)', 'cvi.eq.Ny': 'lattice length', 'cvi.eq.N': 'number of spins', 'cvi.eq.Tc': 'Onsager critical temperature, 2/ln(1+√2)', 'cvi.eq.Tp': 'temperature of the computed maximum of c', 'cvi.eq.cp': 'value of the maximum',
    'cvi.ind.dT': '|T_max − T_c| / T_c', 'cvi.ind.prog': 'computation progress',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'plot', caption: 'cvi.cap.plot', cls: 'wide' }, { id: 'lat', caption: 'cvi.cap.lattice' }], hintKey: 'cvi.hint' });
  let Nx = 4, Ny = 4, Ts = [], cs = [], k = 0, kept = [];
  const pNx = numberField({ label: 'cvi.Nx', value: 4, min: 1, max: 7, integer: true });
  const pNy = numberField({ label: 'cvi.Ny', value: 4, min: 1, max: 64, integer: true });
  const pKeep = { get: () => keepBox.checked }; const keepBox = document.createElement('input'); keepBox.type = 'checkbox';
  const keepLabel = document.createElement('label'); keepLabel.className = 'ctl'; const sp = document.createElement('span'); sp.dataset.i18n = 'cvi.keep'; sp.textContent = i18n.t('cvi.keep'); keepLabel.append(sp, keepBox);
  ui.params.append(pNx.el, pNy.el, keepLabel);
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'T', ylabel: 'c' });
  const lat = new Plot(ui.canvas.lat, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: 'Z = \\mathrm{Tr}\\,\\mathbf T^{\\htmlId{Ny}{N_y}},\\quad \\mathbf T \\in \\mathbb R^{2^{N_x}\\times 2^{N_x}},\\quad N = \\htmlId{N}{N_xN_y}', slots: { Ny: { label: 'cvi.eq.Ny' }, N: { label: 'cvi.eq.N' } } },
      { tex: 'c = \\frac{\\beta^2}{N}\\,\\frac{\\partial^2 \\ln Z}{\\partial\\beta^2},\\qquad c_{\\max} = \\htmlId{cp}{c} \\text{ en } T = \\htmlId{Tp}{T_{\\max}}', slots: { cp: { label: 'cvi.eq.cp' }, Tp: { label: 'cvi.eq.Tp' } } },
      { tex: 'T_c = \\frac{2J}{k_B\\ln(1+\\sqrt2)} = \\htmlId{Tc}{T_c}', slots: { Tc: { label: 'cvi.eq.Tc' } } },
    ],
    indicators: [{ key: 'dT', label: 'cvi.ind.dT' }, { key: 'prog', label: 'cvi.ind.prog', fmt: (v) => `${Math.round(100 * v)} %` }],
  });
  function reset() {
    if (pKeep.get() && cs.length && k > 0) kept.push({ Nx, Ny, Ts: Ts.slice(0, k), cs: cs.slice(0, k) }); else if (!pKeep.get()) kept = [];
    Nx = pNx.get(); Ny = pNy.get();
    const n = Nx >= 7 ? 50 : Nx >= 6 ? 80 : 120;
    Ts = Array.from({ length: n }, (_, i) => 0.5 + (5 - 0.5) * i / (n - 1)); cs = []; k = 0;
    eq.update({ Ny, N: Nx * Ny, Tc: I.TC2D, cp: NaN, Tp: NaN });
  }
  function step() {
    if (k >= Ts.length) { loop.pause(); return; }
    cs.push(I.specificHeatCurve(Nx, Ny, [Ts[k]]).c[0]); k++;
  }
  function drawLattice() {
    lat.clear();
    const cell = 1 / Math.max(Nx, Ny, 8), ox = (1 - Nx * cell) / 2, oy = (1 - Ny * cell) / 2;
    for (let j = 0; j < Ny; j++) for (let i = 0; i < Nx; i++) {
      lat.color(((i + j) % 2) ? '#1f4e9c' : '#e0a040'); lat.rect(ox + i * cell + cell * 0.08, oy + j * cell + cell * 0.08, cell * 0.84, cell * 0.84, true);
    }
    lat.color('#222'); lat.text(0.5, 0.03, `${Nx} × ${Ny}`, { align: 'center', font: '14px system-ui, sans-serif' });
    lat.end();
  }
  function drawPlot() {
    const ymax = Math.max(1.2, ...cs, ...kept.flatMap((q) => q.cs)) * 1.1;
    plot.setScales(0.5, 5, 0, Math.min(ymax, 4)); plot.clear();
    plot.color('rgba(40,160,60,0.6)'); plot.line(I.TC2D, 0, I.TC2D, 4);
    const grid = Array.from({ length: 300 }, (_, i) => 0.5 + 4.5 * i / 299);
    plot.color('#999'); plot.lineWidth(1.5); plot.polyline(grid, grid.map(I.c1D));
    plot.color('#1f4e9c'); plot.lineWidth(2); plot.polyline(grid, grid.map((T) => Math.min(4, I.c2D(T)))); plot.lineWidth(1);
    for (const q of kept) { plot.color('rgba(181,40,30,0.35)'); plot.polyline(q.Ts, q.cs); plot.label(6, 4 + 18 * kept.indexOf(q), `${q.Nx}×${q.Ny}`); }
    plot.color('rgba(181,40,30,0.9)'); plot.lineWidth(2); if (k > 1) plot.polyline(Ts.slice(0, k), cs); plot.lineWidth(1);
    for (let i = 0; i < k; i++) plot.disk(Ts[i], cs[i], 0.02);
    plot.end();
  }
  function draw() {
    drawLattice(); drawPlot();
    let ip = -1; for (let i = 0; i < k; i++) if (ip < 0 || cs[i] > cs[ip]) ip = i;
    const Tp = ip >= 0 ? Ts[ip] : NaN, cp = ip >= 0 ? cs[ip] : NaN;
    ui.readout.textContent = i18n.t('cvi.readout', { Nx, Ny, N: Nx * Ny, k, n: Ts.length, Tp: Number.isNaN(Tp) ? '–' : Tp.toFixed(2), cp: Number.isNaN(cp) ? '–' : cp.toFixed(3), Tc: I.TC2D.toFixed(3) });
    eq.update({ cp, Tp });
    const dT = Math.abs(Tp - I.TC2D) / I.TC2D;
    eq.setIndicator('dT', k === Ts.length ? dT : NaN, k < Ts.length ? 'none' : dT < 0.05 ? 'ok' : 'warn');
    eq.setIndicator('prog', k / Ts.length, k === Ts.length ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset();
  const off = autoResize([plot, lat], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
