// Thermal conductivity — experiment 3. Hard disks between a hot and a cold wall.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, button, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as C from './model.js';

export const meta = { slug: 'conductividad', titleKey: 'cond.title', legacyPath: 'HARDDISKSAPPLET_BASE.JAVA', number: 3 };

i18n.register({
  es: {
    'cond.N': 'Partículas (1–100)', 'cond.T1': 'Foco caliente T₁ (izquierda)', 'cond.T2': 'Foco frío T₂ (derecha)', 'cond.plot': 'Gráfica', 'cond.plot.T': 'Perfil de temperatura T(x)', 'cond.plot.rho': 'Perfil de densidad ρ(x) y presión ρT', 'cond.reset': 'Reiniciar estadística',
    'cond.cap.box': 'Los discos chocan elásticamente entre sí. La pared izquierda (roja) reemite cada disco con velocidad maxwelliana a T₁; la derecha (azul), a T₂. Arriba y abajo, paredes especulares.',
    'cond.cap.plot': 'Rojo: perfil medido (promedio temporal por franjas). Azul: recta entre T₁ y T₂ (régimen de Fourier con κ constante). En el perfil de densidad, la línea gris es ρT, que debe ser uniforme (presión constante).',
    'cond.readout': 't = {t} · energía del foco caliente {Ein} · al foco frío {Eout} · corriente Q = {Q} · κ = Q/(L_y ΔT/L_x) = {kappa} · κ·T̄^(−1/2) = {kred}',
    'cond.hint': 'Espera a que las corrientes de entrada y salida se igualen (estado estacionario) antes de leer κ, y usa "Reiniciar estadística". Con ΔT grande verás que la densidad es mayor en el lado frío: las partículas lentas se acumulan allí, de modo que la presión ρT es la misma en todo el canal. Cambia T₁ y T₂ manteniendo su media para comprobar κ ∝ √T.',
    'cond.eq.Q': 'corriente de calor medida (energía por unidad de tiempo)', 'cond.eq.Ly': 'altura del canal', 'cond.eq.dT': 'T₁ − T₂', 'cond.eq.Lx': 'longitud del canal', 'cond.eq.k': 'conductividad medida', 'cond.eq.kred': 'κ dividido por √T̄: debe ser independiente de T',
    'cond.ind.balance': 'Q entrada / Q salida (estacionario: 1)', 'cond.ind.press': 'variación de ρT a lo largo del canal',
  },
  en: {
    'cond.N': 'Particles (1–100)', 'cond.T1': 'Hot reservoir T₁ (left)', 'cond.T2': 'Cold reservoir T₂ (right)', 'cond.plot': 'Plot', 'cond.plot.T': 'Temperature profile T(x)', 'cond.plot.rho': 'Density profile ρ(x) and pressure ρT', 'cond.reset': 'Reset statistics',
    'cond.cap.box': 'Disks collide elastically. The left wall (red) re-emits each disk with a Maxwellian velocity at T₁; the right one (blue) at T₂. Top and bottom are specular walls.',
    'cond.cap.plot': 'Red: measured profile (time average per slab). Blue: straight line between T₁ and T₂ (Fourier regime with constant κ). In the density plot, the grey line is ρT, which should be uniform (constant pressure).',
    'cond.readout': 't = {t} · energy from the hot wall {Ein} · to the cold wall {Eout} · current Q = {Q} · κ = Q/(L_y ΔT/L_x) = {kappa} · κ·T̄^(−1/2) = {kred}',
    'cond.hint': 'Wait until the incoming and outgoing currents match (steady state) before reading κ, and use "Reset statistics". With a large ΔT the density is higher on the cold side: slow particles pile up there so that the pressure ρT is the same along the channel. Change T₁ and T₂ keeping their mean to check κ ∝ √T.',
    'cond.eq.Q': 'measured heat current (energy per unit time)', 'cond.eq.Ly': 'channel height', 'cond.eq.dT': 'T₁ − T₂', 'cond.eq.Lx': 'channel length', 'cond.eq.k': 'measured conductivity', 'cond.eq.kred': 'κ divided by √T̄: should not depend on T',
    'cond.ind.balance': 'Q in / Q out (steady state: 1)', 'cond.ind.press': 'variation of ρT along the channel',
  },
});

const BINS = 10;

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'box', caption: 'cond.cap.box', cls: 'wide' }, { id: 'plot', caption: 'cond.cap.plot' }], hintKey: 'cond.hint' });
  let state;
  const pN = numberField({ label: 'cond.N', value: 60, min: 1, max: 100, integer: true });
  const pT1 = numberField({ label: 'cond.T1', value: 2, min: 0.05, max: 20, step: 0.1 });
  const pT2 = numberField({ label: 'cond.T2', value: 0.5, min: 0.05, max: 20, step: 0.1 });
  const pPlot = select({ label: 'cond.plot', value: 'T', options: [{ value: 'T', label: 'cond.plot.T' }, { value: 'rho', label: 'cond.plot.rho' }], onChange: () => draw() });
  const bReset = button({ label: 'cond.reset', onClick: () => { C.resetStats(state); draw(); } });
  ui.params.append(pN.el, pT1.el, pT2.el, pPlot.el, bReset.el);

  const Lx = 300, Ly = 150;
  const box = new Plot(ui.canvas.box, { xmin: 0, xmax: Lx, ymin: 0, ymax: Ly });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'x', ylabel: 'T' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'Q = -\\kappa\\,\\frac{\\partial T}{\\partial x}\\;\\Rightarrow\\;\\kappa = \\frac{\\htmlId{Q}{Q}/\\htmlId{Ly}{L_y}}{\\htmlId{dT}{\\Delta T}/\\htmlId{Lx}{L_x}} = \\htmlId{k}{\\kappa}', slots: { Q: { label: 'cond.eq.Q' }, Ly: { label: 'cond.eq.Ly' }, dT: { label: 'cond.eq.dT' }, Lx: { label: 'cond.eq.Lx' }, k: { label: 'cond.eq.k' } } },
      { tex: '\\kappa_{\\rm cin} \\simeq \\tfrac{1}{3\\sqrt2}\\,\\frac{c\\,\\bar v}{\\sigma} \\propto \\sqrt{T}\\qquad \\frac{\\kappa}{\\sqrt{\\bar T}} = \\htmlId{kred}{\\kappa/\\sqrt{T}}', slots: { kred: { label: 'cond.eq.kred' } } },
    ],
    indicators: [{ key: 'balance', label: 'cond.ind.balance' }, { key: 'press', label: 'cond.ind.press', fmt: (v) => (Number.isNaN(v) ? '—' : `${(100 * v).toFixed(0)} %`) }],
  });

  function reset() {
    state = C.create({ N: pN.get(), T1: pT1.get(), T2: pT2.get(), Lx, Ly });
    eq.update({ Ly, Lx, dT: state.T1 - state.T2 });
  }
  function step() { C.step(state, BINS); }
  function drawBox() {
    box.clear();
    box.color('rgba(181,40,30,0.9)'); box.lineWidth(4); box.line(0, 0, 0, Ly);
    box.color('rgba(31,78,156,0.9)'); box.line(Lx, 0, Lx, Ly); box.lineWidth(1);
    for (let i = 0; i < state.N; i++) {
      const e = 0.5 * (state.vx[i] ** 2 + state.vy[i] ** 2), tt = Math.max(0, Math.min(1, (e - state.T2) / Math.max(1e-6, state.T1 - state.T2)));
      box.color(`rgb(${Math.round(60 + 160 * tt)},${Math.round(80 * (1 - tt) + 40)},${Math.round(200 * (1 - tt) + 30)})`);
      box.disk(state.x[i], state.y[i], state.r[i]);
    }
    box.end();
  }
  function drawPlot() {
    const p = C.meanProfile(state);
    if (!p.T.length) { plot.clear(); plot.end(); return; }
    if (pPlot.get() === 'T') {
      const tmax = Math.max(state.T1, state.T2) * 1.25;
      plot.ylabel = 'T'; plot.setScales(0, Lx, 0, tmax); plot.clear();
      plot.color('#1f4e9c'); plot.lineWidth(2); plot.line(0, state.T1, Lx, state.T2); plot.lineWidth(1);
      plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(2);
      const xs = [], ys = []; for (let b = 0; b < p.T.length; b++) if (!Number.isNaN(p.T[b])) { xs.push(p.x[b]); ys.push(p.T[b]); }
      if (xs.length > 1) plot.polyline(xs, ys); plot.lineWidth(1);
      for (let b = 0; b < xs.length; b++) plot.disk(xs[b], ys[b], 2.5);
      plot.end();
    } else {
      const rho0 = state.N / (Lx * Ly);
      plot.ylabel = 'ρ / ρ̄,  ρT / ρ̄T̄'; plot.setScales(0, Lx, 0, 2.5); plot.clear();
      const Tm = 0.5 * (state.T1 + state.T2);
      plot.color('#999'); plot.line(0, 1, Lx, 1);
      const xs = [], yr = [], yp = [];
      for (let b = 0; b < p.T.length; b++) { xs.push(p.x[b]); yr.push(p.rho[b] / rho0); yp.push(Number.isNaN(p.T[b]) ? NaN : p.rho[b] * p.T[b] / (rho0 * Tm)); }
      plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(2); plot.polyline(xs, yr);
      plot.color('#555'); plot.polyline(xs, yp.map((v) => (Number.isNaN(v) ? 0 : v))); plot.lineWidth(1);
      plot.color('#222'); plot.label(6, 4, 'ρ/ρ̄ (rojo) · ρT/ρ̄T̄ (gris)');
      plot.end();
    }
  }
  function draw() {
    drawBox(); drawPlot();
    const hc = C.heatCurrent(state), kappa = C.conductivity(state), Tm = 0.5 * (state.T1 + state.T2);
    const kred = kappa / Math.sqrt(Tm);
    ui.readout.textContent = i18n.t('cond.readout', {
      t: state.t.toFixed(0), Ein: state.heat.left.toFixed(1), Eout: (-state.heat.right).toFixed(1), Q: Number.isNaN(hc.Q) ? '–' : hc.Q.toFixed(3),
      kappa: Number.isNaN(kappa) ? '–' : kappa.toFixed(3), kred: Number.isNaN(kred) ? '–' : kred.toFixed(3),
    });
    eq.update({ Q: hc.Q, k: kappa, kred });
    const bal = hc.Qout > 0 ? hc.Qin / hc.Qout : NaN;
    eq.setIndicator('balance', bal, Number.isNaN(bal) ? 'none' : Math.abs(bal - 1) < 0.15 ? 'ok' : 'warn');
    const p = C.meanProfile(state);
    let pmax = -Infinity, pmin = Infinity;
    for (let b = 0; b < p.T.length; b++) if (!Number.isNaN(p.T[b]) && p.rho[b] > 0) { const v = p.T[b] * p.rho[b]; pmax = Math.max(pmax, v); pmin = Math.min(pmin, v); }
    const pv = pmax > 0 ? (pmax - pmin) / pmax : NaN;
    eq.setIndicator('press', pv, Number.isNaN(pv) ? 'none' : pv < 0.3 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 20 }).el);
  reset();
  const off = autoResize([box, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
