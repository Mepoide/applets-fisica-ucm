// Brownian motion — experiment 6. A heavy disk in a hard-disk bath; microscope view and MSD.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as B from './model.js';

export const meta = { slug: 'browniano', titleKey: 'brown.title', legacyPath: '../../README.md', number: 6 };

i18n.register({
  es: {
    'brown.N': 'Moléculas del baño (5–150)', 'brown.M': 'Masa del grano / masa molecular', 'brown.R': 'Radio del grano / radio molecular', 'brown.kT': 'Temperatura del baño kT', 'brown.plot': 'Gráfica', 'brown.plot.scope': 'Microscopio: traza del grano (×{z})', 'brown.plot.msd': 'Desplazamiento cuadrático medio ⟨Δr²⟩(t)',
    'brown.cap.box': 'Vista atómica: el grano (azul grande) recibe choques de las moléculas del baño (puntos). Las fluctuaciones del número de impactos por lado son la causa del movimiento errático.',
    'brown.cap.plot': 'Microscopio: lo que vería Brown, el grano y su traza ampliados, sin las moléculas. MSD: rojo, medido; azul, ajuste ⟨Δr²⟩ = 4Dt en la zona difusiva; gris, el orden de magnitud de Einstein–Enskog.',
    'brown.readout': 't = {t} · choques totales = {ncol} · ½M⟨V²⟩ / kT = {eq} · D ajustado = {D} (R² = {r2}) · D Enskog ≈ {De}',
    'brown.hint': 'Con pocas moléculas y un grano ligero el movimiento es casi balístico entre choques; sube la masa y el número de moléculas para verlo volverse difusivo. La energía cinética media del grano tiende a kT (equipartición en 2D), sea cual sea su masa: pesa 20 veces más pero se mueve √20 veces más despacio. La caja confina al grano: el MSD satura a tiempos largos, por eso el ajuste usa la zona intermedia.',
    'brown.eq.D': 'coeficiente de difusión ajustado', 'brown.eq.K': 'energía cinética media del grano (ventana móvil)', 'brown.eq.kT': 'temperatura del baño', 'brown.eq.M': 'masa del grano',
    'brown.ind.eq': '½M⟨V²⟩ / kT (equipartición: 1)', 'brown.ind.r2': 'R² del ajuste difusivo',
  },
  en: {
    'brown.N': 'Bath molecules (5–150)', 'brown.M': 'Grain mass / molecular mass', 'brown.R': 'Grain radius / molecular radius', 'brown.kT': 'Bath temperature kT', 'brown.plot': 'Plot', 'brown.plot.scope': 'Microscope: grain trace (×{z})', 'brown.plot.msd': 'Mean-squared displacement ⟨Δr²⟩(t)',
    'brown.cap.box': 'Atomic view: the grain (large blue disk) is hit by the bath molecules (dots). Fluctuations in the number of impacts per side cause the erratic motion.',
    'brown.cap.plot': 'Microscope: what Brown would see, the grain and its trace magnified, without the molecules. MSD: red, measured; blue, fit ⟨Δr²⟩ = 4Dt in the diffusive window; grey, the Einstein–Enskog order of magnitude.',
    'brown.readout': 't = {t} · total collisions = {ncol} · ½M⟨V²⟩ / kT = {eq} · fitted D = {D} (R² = {r2}) · Enskog D ≈ {De}',
    'brown.hint': 'With few molecules and a light grain the motion is almost ballistic between hits; raise the mass and the number of molecules to see it become diffusive. The mean kinetic energy of the grain tends to kT (2D equipartition) whatever its mass: it weighs 20 times more but moves √20 times slower. The box confines the grain: the MSD saturates at long times, so the fit uses the intermediate window.',
    'brown.eq.D': 'fitted diffusion coefficient', 'brown.eq.K': 'mean kinetic energy of the grain (moving window)', 'brown.eq.kT': 'bath temperature', 'brown.eq.M': 'grain mass',
    'brown.ind.eq': '½M⟨V²⟩ / kT (equipartition: 1)', 'brown.ind.r2': 'R² of the diffusive fit',
  },
});

const L = 200, ZOOM = 3;

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'box', caption: 'brown.cap.box' }, { id: 'plot', caption: 'brown.cap.plot' }], hintKey: 'brown.hint' });
  let state, kAvg = 0, kN = 0;
  const pN = numberField({ label: 'brown.N', value: 40, min: 5, max: 150, integer: true });
  const pM = numberField({ label: 'brown.M', value: 20, min: 1, max: 200 });
  const pR = numberField({ label: 'brown.R', value: 4, min: 1, max: 8, step: 0.5 });
  const pkT = numberField({ label: 'brown.kT', value: 1, min: 0.05, max: 20, step: 0.1 });
  const pPlot = select({ label: 'brown.plot', value: 'scope', options: [{ value: 'scope', label: 'brown.plot.scope' }, { value: 'msd', label: 'brown.plot.msd' }], onChange: () => draw() });
  ui.params.append(pN.el, pM.el, pR.el, pkT.el, pPlot.el);
  pPlot.input.options[0].textContent = i18n.t('brown.plot.scope', { z: ZOOM });

  const box = new Plot(ui.canvas.box, { xmin: 0, xmax: L, ymin: 0, ymax: L });
  const plot = new Plot(ui.canvas.plot, { axes: true });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\langle \\Delta r^2 \\rangle = 4\\,\\htmlId{D}{D}\\,t', slots: { D: { label: 'brown.eq.D' } } },
      { tex: '\\tfrac12\\,\\htmlId{M}{M}\\cdot\\langle V^2\\rangle = \\htmlId{K}{K} \\;\\approx\\; kT = \\htmlId{kT}{kT}', slots: { M: { label: 'brown.eq.M' }, K: { label: 'brown.eq.K' }, kT: { label: 'brown.eq.kT' } } },
    ],
    indicators: [{ key: 'eq', label: 'brown.ind.eq' }, { key: 'r2', label: 'brown.ind.r2' }],
  });

  function reset() {
    state = B.create({ N: pN.get(), massRatio: pM.get(), radiusRatio: pR.get(), kT: pkT.get(), L, radius: 3 });
    kAvg = 0; kN = 0;
    eq.update({ M: state.M, kT: state.kTbath });
  }
  function step() {
    B.step(state);
    const K = B.heavyKinetic(state); kN = Math.min(kN + 1, 2000); kAvg += (K - kAvg) / kN;
  }
  function drawBox() {
    box.clear();
    box.color('rgba(120,120,120,0.8)');
    for (let i = 1; i < state.N; i++) box.disk(state.x[i], state.y[i], state.r[i]);
    box.color('#1f4e9c'); box.disk(state.x[0], state.y[0], state.r[0]);
    box.end();
  }
  function drawPlot() {
    if (pPlot.get() === 'scope') {
      const cx = state.x[0], cy = state.y[0], half = L / (2 * ZOOM);
      plot.axes = false; plot.margin = { l: 0, r: 0, t: 0, b: 0 };
      plot.setScales(cx - half, cx + half, cy - half, cy + half); plot.clear();
      const tr = state.track, from = Math.max(0, tr.length - 3000);
      plot.color('rgba(181,40,30,0.7)'); plot.lineWidth(1.5);
      const xs = [], ys = []; for (let i = from; i < tr.length; i++) { xs.push(tr[i][1]); ys.push(tr[i][2]); }
      if (xs.length > 1) plot.polyline(xs, ys); plot.lineWidth(1);
      plot.color('#1f4e9c'); plot.disk(cx, cy, state.r[0]);
      plot.color('#222'); plot.label(6, 4, `×${ZOOM}`);
      plot.end();
    } else {
      plot.axes = true; plot.margin = { l: 48, r: 10, t: 10, b: 32 }; plot.xlabel = 't'; plot.ylabel = '⟨Δr²⟩';
      const m = B.msd(state.track, 1500, 25);
      const fit = B.fitD(m, L);
      const ymax = Math.max(1, ...m.msd) * 1.1, tmax = m.t[m.t.length - 1] || 1;
      plot.setScales(0, tmax, 0, ymax); plot.clear();
      plot.color('#ddd'); plot.line(0, (L / 8) ** 2, tmax, (L / 8) ** 2); plot.line(0, (L / 3) ** 2, tmax, (L / 3) ** 2);
      const De = B.enskogD(state); plot.color('#aaa'); plot.line(0, 0, tmax, 4 * De * tmax);
      if (Number.isFinite(fit.D)) { plot.color('#1f4e9c'); plot.lineWidth(2); plot.line(0, 0, tmax, 4 * fit.D * tmax); plot.lineWidth(1); }
      plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(2); if (m.t.length > 1) plot.polyline(m.t, m.msd); plot.lineWidth(1);
      plot.end();
    }
  }
  function draw() {
    drawBox(); drawPlot();
    const m = state.track.length > 200 ? B.msd(state.track, 1500, 25) : null;
    const fit = m ? B.fitD(m, L) : { D: NaN, r2: NaN };
    const ratio = kN > 50 ? kAvg / state.kTbath : NaN;
    ui.readout.textContent = i18n.t('brown.readout', { t: state.t.toFixed(0), ncol: state.ncol, eq: Number.isNaN(ratio) ? '–' : ratio.toFixed(2), D: Number.isNaN(fit.D) ? '–' : fit.D.toFixed(3), r2: Number.isNaN(fit.r2) ? '–' : fit.r2.toFixed(2), De: B.enskogD(state).toFixed(3) });
    eq.update({ D: fit.D, K: kN > 50 ? kAvg : NaN });
    eq.setIndicator('eq', ratio, Number.isNaN(ratio) ? 'none' : Math.abs(ratio - 1) < 0.25 ? 'ok' : 'warn');
    eq.setIndicator('r2', fit.r2, Number.isNaN(fit.r2) ? 'none' : fit.r2 > 0.9 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 20 }).el);
  reset();
  const off = autoResize([box, plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
