// FHP lattice gas past a plate: Von Kármán street — mountable applet.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as H from '../_fhp/fhp.js';
import * as V from './model.js';

export const meta = { slug: 'von-karman', titleKey: 'vk.title', legacyPath: 'VK_SG/VKFINAL.JAVA', extra: true };

i18n.register({
  es: {
    'vk.nx': 'Anchura del canal (nodos)', 'vk.ny': 'Longitud (nodos)', 'vk.f': 'Densidad por canal f', 'vk.u': 'Velocidad de entrada u', 'vk.plate': 'Longitud de la placa', 'vk.wall': 'Pared',
    'vk.wall.bounceback': 'rebote (no deslizamiento)', 'vk.wall.specular': 'especular (deslizamiento)',
    'vk.box': 'Caja de promediado (nodos)', 'vk.color': 'Color', 'vk.color.density': 'densidad', 'vk.color.speed': 'módulo de la velocidad', 'vk.color.vorticity': 'vorticidad',
    'vk.arrows': 'Flechas de velocidad', 'vk.relative': 'Restar la velocidad de entrada', 'vk.smooth': 'Promedio temporal del campo',
    'vk.cap': 'El flujo entra por la izquierda y sale por la derecha (canal periódico con zona de entrada que impone densidad y velocidad). La placa azul es perpendicular al flujo. El campo se promedia en cajas; la vorticidad (rojo/azul) hace visible la estela.',
    'vk.readout': 't = {t} · ⟨u⟩ aguas arriba = {uup} · g(f) = {g} · ν(f) ≈ {nu} · Re = g·u·L/ν ≈ {re} · Mach u/c_s = {mach}',
    'vk.hint': 'Con f = 0.5 el factor galileano g(f) se anula: no hay advección no lineal y no puede formarse la calle de vórtices (el original usaba f = 0.5). Usa f ≈ 0.2–0.3, u ≈ 0.2–0.3 y espera unos miles de pasos; la vorticidad promediada en el tiempo es la mejor forma de ver la estela.',
    'vk.eq.g': 'factor galileano g(f) = (7/12)(1−2f)/(1−f)', 'vk.eq.u': 'velocidad media medida aguas arriba', 'vk.eq.L': 'longitud de la placa', 'vk.eq.nu': 'viscosidad cinemática FHP-III', 'vk.eq.re': 'número de Reynolds efectivo', 'vk.eq.ma': 'número de Mach u/c_s',
    'vk.ind.re': 'Re (calle de vórtices: ≳ 50)', 'vk.ind.ma': 'Mach (incompresible: < 0.3)',
  },
  en: {
    'vk.nx': 'Channel width (nodes)', 'vk.ny': 'Length (nodes)', 'vk.f': 'Density per channel f', 'vk.u': 'Inflow velocity u', 'vk.plate': 'Plate length', 'vk.wall': 'Wall',
    'vk.wall.bounceback': 'bounce-back (no slip)', 'vk.wall.specular': 'specular (slip)',
    'vk.box': 'Averaging box (nodes)', 'vk.color': 'Colour', 'vk.color.density': 'density', 'vk.color.speed': 'speed', 'vk.color.vorticity': 'vorticity',
    'vk.arrows': 'Velocity arrows', 'vk.relative': 'Subtract inflow velocity', 'vk.smooth': 'Time-average the field',
    'vk.cap': 'Flow enters on the left and leaves on the right (periodic channel with an inflow zone imposing density and velocity). The blue plate is perpendicular to the flow. The field is box-averaged; vorticity (red/blue) makes the wake visible.',
    'vk.readout': 't = {t} · ⟨u⟩ upstream = {uup} · g(f) = {g} · ν(f) ≈ {nu} · Re = g·u·L/ν ≈ {re} · Mach u/c_s = {mach}',
    'vk.hint': 'At f = 0.5 the Galilean factor g(f) vanishes: there is no nonlinear advection and no vortex street can form (the original used f = 0.5). Use f ≈ 0.2–0.3, u ≈ 0.2–0.3 and wait a few thousand steps; time-averaged vorticity is the best way to see the wake.',
    'vk.eq.g': 'Galilean factor g(f) = (7/12)(1−2f)/(1−f)', 'vk.eq.u': 'measured mean upstream velocity', 'vk.eq.L': 'plate length', 'vk.eq.nu': 'FHP-III kinematic viscosity', 'vk.eq.re': 'effective Reynolds number', 'vk.eq.ma': 'Mach number u/c_s',
    'vk.ind.re': 'Re (vortex street: ≳ 50)', 'vk.ind.ma': 'Mach (incompressible: < 0.3)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'flow', caption: 'vk.cap' }], hintKey: 'vk.hint' });
  root.querySelector('.canvases').classList.add('single');
  let state, F = null, avg = null;
  const pNx = numberField({ label: 'vk.nx', value: 160, min: 40, max: 400, integer: true });
  const pNy = numberField({ label: 'vk.ny', value: 400, min: 100, max: 800, integer: true });
  const pF = numberField({ label: 'vk.f', value: 0.25, min: 0.05, max: 0.6, step: 0.05 });
  const pU = numberField({ label: 'vk.u', value: 0.25, min: 0, max: 0.42, step: 0.05 });
  const pPlate = numberField({ label: 'vk.plate', value: 40, min: 0, max: 200, integer: true });
  const pWall = select({ label: 'vk.wall', value: 'bounceback', options: [{ value: 'bounceback', label: 'vk.wall.bounceback' }, { value: 'specular', label: 'vk.wall.specular' }] });
  ui.params.append(pNx.el, pNy.el, pF.el, pU.el, pPlate.el, pWall.el);
  const display = document.createElement('div'); display.className = 'params'; ui.params.after(display);
  const pBox = select({ label: 'vk.box', value: '8', options: ['4', '8', '16'].map((v) => ({ value: v, label: v })), onChange: () => { avg = null; draw(); } });
  const pColor = select({ label: 'vk.color', value: 'vorticity', options: ['density', 'speed', 'vorticity'].map((v) => ({ value: v, label: `vk.color.${v}` })), onChange: () => draw() });
  const pArrows = checkbox({ label: 'vk.arrows', checked: true, onChange: () => draw() });
  const pRel = checkbox({ label: 'vk.relative', checked: false, onChange: () => draw() });
  const pSmooth = checkbox({ label: 'vk.smooth', checked: true, onChange: () => { avg = null; draw(); } });
  display.append(pBox.el, pColor.el, pArrows.el, pRel.el, pSmooth.el);

  const canvas = ui.canvas.flow;
  const plot = new Plot(canvas, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
  let off, img;
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\mathrm{Re} = \\frac{\\htmlId{g}{g(f)}\\,\\htmlId{u}{u}\\,\\htmlId{L}{L}}{\\htmlId{nu}{\\nu(f)}} = \\htmlId{re}{\\mathrm{Re}}', slots: { g: { label: 'vk.eq.g' }, u: { label: 'vk.eq.u' }, L: { label: 'vk.eq.L' }, nu: { label: 'vk.eq.nu' }, re: { label: 'vk.eq.re' } } },
      { tex: 'g(f) = \\frac{7}{12}\\,\\frac{1-2f}{1-f},\\qquad \\mathrm{Ma} = \\frac{u}{c_s} = \\htmlId{ma}{\\mathrm{Ma}}', slots: { ma: { label: 'vk.eq.ma' } } },
    ],
    indicators: [{ key: 're', label: 'vk.ind.re' }, { key: 'ma', label: 'vk.ind.ma' }],
  });

  function reset() {
    state = V.create({ nx: pNx.get(), ny: pNy.get(), f: pF.get(), u: pU.get(), plateLen: pPlate.get(), wallRule: pWall.get() });
    plot.setScales(0, state.ny * H.S3, 0, state.nx);
    canvas.style.aspectRatio = String(state.ny * H.S3 / state.nx);
    avg = null; F = null;
  }
  function step() { V.step(state); }

  function field() {
    const box = Number(pBox.get());
    const f = V.velocityField(state, box);
    if (!pSmooth.get()) return f;
    if (!avg || avg.bx !== f.bx || avg.by !== f.by) { avg = { bx: f.bx, by: f.by, box, rho: Float64Array.from(f.rho), along: Float64Array.from(f.along), cross: Float64Array.from(f.cross) }; return avg; }
    const a = 0.05;
    for (let k = 0; k < f.rho.length; k++) { avg.rho[k] += a * (f.rho[k] - avg.rho[k]); avg.along[k] += a * (f.along[k] - avg.along[k]); avg.cross[k] += a * (f.cross[k] - avg.cross[k]); }
    return avg;
  }
  function colour(v, lo, hi, diverging) {
    if (diverging) {
      const t = Math.max(-1, Math.min(1, v / hi));
      return t >= 0 ? [255, Math.round(255 * (1 - t)), Math.round(255 * (1 - t))] : [Math.round(255 * (1 + t)), Math.round(255 * (1 + t)), 255];
    }
    const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
    const g = Math.round(255 * (1 - 0.85 * t)); return [g, g, g];
  }
  function draw() {
    F = field();
    const { bx, by, box } = F; const nx = state.nx, ny = state.ny;
    const mode = pColor.get();
    const vort = mode === 'vorticity' ? V.vorticity(F) : null;
    if (!off || off.width !== by || off.height !== bx) { off = new OffscreenCanvas(by, bx); img = off.getContext('2d').createImageData(by, bx); }
    const px = img.data;
    const rhoMean = 7 * state.f, uRef = Math.max(0.05, state.u);
    for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
      const k = j * bx + i; let c;
      if (mode === 'density') c = colour(F.rho[k], rhoMean * 0.7, rhoMean * 1.3, false);
      else if (mode === 'speed') c = colour(Math.hypot(F.along[k] - (pRel.get() ? state.u : 0), F.cross[k]), 0, uRef * 1.5, false);
      else c = colour(vort[k], 0, uRef / box, true);
      const col = by - 1 - j, row = bx - 1 - i;
      const o = (row * by + col) * 4; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255;
    }
    off.getContext('2d').putImageData(img, 0, 0);
    plot.clear();
    plot.ctx.imageSmoothingEnabled = true;
    plot.drawImage(off, 0, 0, ny * H.S3, nx);
    plot.color('#1f4e9c'); plot.lineWidth(3);
    const sx = (ny - 1 - state.plateY) * H.S3;
    plot.line(sx, H.physX(state.plateX0, state.plateY, nx), sx, H.physX(state.plateX0, state.plateY, nx) + state.plateLen);
    plot.lineWidth(1);
    if (pArrows.get()) {
      plot.color('rgba(0,0,0,0.75)');
      const scale = box * 0.9 / uRef;
      for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
        const k = j * bx + i;
        const cx = (ny - 1 - (j + 0.5) * box) * H.S3, cy = (i + 0.5) * box;
        const ua = F.along[k] - (pRel.get() ? state.u : 0), uc = F.cross[k];
        const L = Math.hypot(ua, uc) * scale; if (L < 0.5) continue;
        const ex = cx + ua * scale, ey = cy + uc * scale;
        plot.line(cx, cy, ex, ey);
        plot.disk(ex, ey, Math.min(1.2, box / 8), true);
      }
    }
    plot.end();
    const uup = V.meanAlongVelocity(state, Math.round(ny * 0.85), Math.round(ny * 0.95));
    const g = V.galileanFactor(state.f), nu = V.viscosityFHP3(state.f), re = V.reynolds(state), ma = state.u / H.SOUND_SPEED;
    ui.readout.textContent = i18n.t('vk.readout', { t: state.t, uup: uup.toFixed(3), g: g.toFixed(3), nu: nu.toFixed(3), re: re.toFixed(0), mach: ma.toFixed(2) });
    eq.update({ g, u: uup, L: state.plateLen, nu, re, ma });
    eq.setIndicator('re', re, re >= 50 ? 'ok' : 'warn');
    eq.setIndicator('ma', ma, ma < 0.3 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 4 });
  ui.loopctl.append(loopControls(loop, { speedMin: -2, speedMax: 16 }).el);
  reset();
  const offR = autoResize([plot], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); offR(); root.replaceChildren(); } };
}
