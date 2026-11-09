// FHP lattice gas: sound wave from a density hole — mountable applet.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as H from '../_fhp/fhp.js';
import * as O from './model.js';

export const meta = { slug: 'onda-lgca', titleKey: 'onda.title', legacyPath: 'PERFILDENSIDAD/PERFILDENS4.JAVA', extra: true };

i18n.register({
  es: {
    'onda.f': 'Densidad por canal f (0–1)', 'onda.radius': 'Radio del hueco', 'onda.size': 'Red (nodos por lado)',
    'onda.profile': 'Perfil', 'onda.profile.radial': 'Radial ⟨n⟩(r) desde el centro', 'onda.profile.strip': 'Franja horizontal ⟨n⟩(x)',
    'onda.avg': 'Promediar el perfil en el tiempo',
    'onda.smooth': 'Suavizado', 'onda.smooth.1': 'ninguno (nodo a nodo)', 'onda.smooth.2': 'cajas 2×2', 'onda.smooth.4': 'cajas 4×4',
    'onda.cap.lattice': 'Red hexagonal de {n}×{n} nodos; el gris indica la ocupación de cada nodo (0 a 7 partículas). El círculo rojo es el hueco inicial; el azul, la posición esperada del frente, r₀ + c_s t.',
    'onda.cap.profile': 'Ocupación media por nodo. La onda de rarefacción (mínimo) se aleja del centro a la velocidad del sonido de la red, c_s = √(3/7) ≈ 0.655 nodos/paso.',
    'onda.readout': 't = {t} · ⟨n⟩ = {rho} · frente medido r_min = {rmin} · esperado r₀ + c_s t = {rexp}',
    'onda.hint': 'La red es periódica: pasado t ≈ L/(2c_s) la onda da la vuelta e interfiere consigo misma. Reinicia para repetir. La velocidad del sonido no depende de la densidad; compruébalo cambiando f.',
    'onda.eq.cs': 'velocidad del sonido de la red FHP con partícula en reposo', 'onda.eq.rf': 'posición teórica del frente', 'onda.eq.rmin': 'posición medida del mínimo del perfil radial',
    'onda.ind.err': 'error relativo del frente', 'onda.ind.rho': '⟨n⟩ (conservación: 7f)',
  },
  en: {
    'onda.f': 'Density per channel f (0–1)', 'onda.radius': 'Hole radius', 'onda.size': 'Lattice (nodes per side)',
    'onda.profile': 'Profile', 'onda.profile.radial': 'Radial ⟨n⟩(r) from the centre', 'onda.profile.strip': 'Horizontal strip ⟨n⟩(x)',
    'onda.avg': 'Time-average the profile',
    'onda.smooth': 'Smoothing', 'onda.smooth.1': 'none (node by node)', 'onda.smooth.2': '2×2 boxes', 'onda.smooth.4': '4×4 boxes',
    'onda.cap.lattice': 'Hexagonal lattice of {n}×{n} nodes; grey level is the occupation of each node (0 to 7 particles). Red circle: initial hole; blue: expected front position r₀ + c_s t.',
    'onda.cap.profile': 'Mean occupation per node. The rarefaction wave (minimum) moves away from the centre at the lattice sound speed c_s = √(3/7) ≈ 0.655 nodes/step.',
    'onda.readout': 't = {t} · ⟨n⟩ = {rho} · measured front r_min = {rmin} · expected r₀ + c_s t = {rexp}',
    'onda.hint': 'The lattice is periodic: after t ≈ L/(2c_s) the wave wraps around and interferes with itself. Restart to repeat. The sound speed does not depend on density; check it by changing f.',
    'onda.eq.cs': 'sound speed of the FHP lattice with a rest particle', 'onda.eq.rf': 'theoretical front position', 'onda.eq.rmin': 'measured position of the radial-profile minimum',
    'onda.ind.err': 'relative front error', 'onda.ind.rho': '⟨n⟩ (conservation: 7f)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'lattice', caption: 'onda.cap.lattice' }, { id: 'profile', caption: 'onda.cap.profile' }], hintKey: 'onda.hint' });
  let state, img, off, accR = null, accS = null, nAcc = 0;
  const pF = numberField({ label: 'onda.f', value: 0.5, min: 0.02, max: 0.98, step: 0.05 });
  const pR = numberField({ label: 'onda.radius', value: 12, min: 2, max: 60, integer: true });
  const pSize = numberField({ label: 'onda.size', value: 200, min: 60, max: 400, integer: true });
  const pProf = select({ label: 'onda.profile', value: 'radial', options: [{ value: 'radial', label: 'onda.profile.radial' }, { value: 'strip', label: 'onda.profile.strip' }], onChange: () => { nAcc = 0; draw(); } });
  const pSmooth = select({ label: 'onda.smooth', value: '2', options: [{ value: '1', label: 'onda.smooth.1' }, { value: '2', label: 'onda.smooth.2' }, { value: '4', label: 'onda.smooth.4' }], onChange: () => draw() });
  const pAvg = checkbox({ label: 'onda.avg', checked: false, onChange: () => { nAcc = 0; draw(); } });
  ui.params.append(pSize.el, pF.el, pR.el, pSmooth.el, pProf.el, pAvg.el);

  const latticeCanvas = ui.canvas.lattice;
  const lat = new Plot(latticeCanvas, { xmin: 0, xmax: 200, ymin: 0, ymax: 200 * H.S3 });
  const prof = new Plot(ui.canvas.profile, { axes: true, xlabel: 'r', ylabel: '⟨n⟩' });
  latticeCanvas.style.aspectRatio = String(1 / H.S3);
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'c_s = \\sqrt{\\tfrac{3}{7}} = \\htmlId{cs}{c_s}\\ \\text{nodos/paso}', slots: { cs: { label: 'onda.eq.cs' } } },
      { tex: 'r_f(t) = r_0 + c_s t = \\htmlId{rf}{r_f},\\qquad r_{\\min}^{\\rm med} = \\htmlId{rmin}{r_{\\min}}', slots: { rf: { label: 'onda.eq.rf' }, rmin: { label: 'onda.eq.rmin' } } },
    ],
    indicators: [{ key: 'err', label: 'onda.ind.err', fmt: (v) => (Number.isNaN(v) ? '—' : `${(100 * v).toFixed(1)} %`) }, { key: 'rho', label: 'onda.ind.rho' }],
  });

  function reset() {
    const n = pSize.get();
    state = O.create({ nx: n, ny: n, f: pF.get(), holeRadius: pR.get() });
    lat.setScales(0, n, 0, n * H.S3);
    off = new OffscreenCanvas(n, n); img = off.getContext('2d').createImageData(n, n);
    accR = null; accS = null; nAcc = 0;
    const cap = root.querySelector('[data-i18n="onda.cap.lattice"]'); if (cap) cap.textContent = i18n.t('onda.cap.lattice', { n });
    eq.update({ cs: O.SOUND_SPEED });
  }
  function step() { O.step(state); }

  function renderLattice() {
    const { nx, ny, a } = state.L; const d = H.TABLES.dens; const px = img.data;
    const b = Number(pSmooth.get());
    px.fill(255);
    if (b === 1) {
      for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
        const x = Math.floor(H.physX(ix, iy, nx));
        const g = 255 - Math.round(255 * Math.min(6, d[a[iy * nx + ix]]) / 6);
        const k = ((ny - 1 - iy) * nx + x) * 4; px[k] = g; px[k + 1] = g; px[k + 2] = g;
      }
    } else {
      const bx = Math.ceil(nx / b), by = Math.ceil(ny / b);
      const sum = new Float64Array(bx * by), cnt = new Float64Array(bx * by);
      for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
        const x = Math.floor(H.physX(ix, iy, nx) / b), y = Math.floor(iy / b);
        sum[y * bx + x] += d[a[iy * nx + ix]]; cnt[y * bx + x]++;
      }
      const m = 7 * state.f;
      for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
        const x = Math.floor(H.physX(ix, iy, nx)); const kb = Math.floor(iy / b) * bx + Math.floor(x / b);
        const v = cnt[kb] ? sum[kb] / cnt[kb] : m;
        const g = Math.max(0, Math.min(255, Math.round(128 - 128 * (v - m) / Math.max(0.5, m * 0.6))));
        const k = ((ny - 1 - iy) * nx + x) * 4; px[k] = g; px[k + 1] = g; px[k + 2] = g;
      }
    }
    off.getContext('2d').putImageData(img, 0, 0);
    lat.clear();
    lat.ctx.imageSmoothingEnabled = false;
    lat.drawImage(off, 0, 0, nx, ny * H.S3);
    lat.color('#b5281e'); lat.lineWidth(1.5); lat.disk(state.cx, state.cy, state.holeRadius, false);
    lat.color('#1f4e9c'); lat.disk(state.cx, state.cy, state.holeRadius + O.SOUND_SPEED * state.t, false); lat.lineWidth(1);
    lat.end();
  }
  function renderProfile() {
    const radial = pProf.get() === 'radial';
    const p = radial ? O.radialProfile(state, 1) : O.stripProfile(state, 20);
    const xs = radial ? p.r : p.x; let ys = p.rho;
    if (pAvg.get()) {
      const acc = radial ? (accR ??= new Float64Array(ys.length)) : (accS ??= new Float64Array(ys.length));
      if (acc.length !== ys.length) { nAcc = 0; }
      for (let i = 0; i < ys.length; i++) acc[i] = nAcc ? acc[i] + (Number.isNaN(ys[i]) ? 0 : ys[i]) : (ys[i] || 0);
      nAcc++;
      ys = Float64Array.from(acc, (v) => v / nAcc);
    }
    prof.xlabel = radial ? 'r' : 'x';
    prof.setScales(0, xs[xs.length - 1], 0, 7);
    prof.clear();
    prof.color('#999'); prof.line(0, 7 * state.f, xs[xs.length - 1], 7 * state.f);
    const rf = state.holeRadius + O.SOUND_SPEED * state.t;
    if (radial) { prof.color('rgba(31,78,156,0.6)'); prof.line(rf, 0, rf, 7); }
    else { const c = state.cx; prof.color('rgba(31,78,156,0.6)'); for (const sgn of [-1, 1]) { const x = c + sgn * rf; prof.line(x, 0, x, 7); } }
    prof.color('#b5281e'); prof.lineWidth(1.5);
    const vx = [], vy = []; for (let i = 0; i < xs.length; i++) if (!Number.isNaN(ys[i])) { vx.push(xs[i]); vy.push(ys[i]); }
    if (vx.length > 1) prof.polyline(vx, vy); prof.lineWidth(1);
    prof.end();
    const rmin = O.frontRadius(O.radialProfile(state, 1.5), 4);
    const rho = O.meanOccupation(state);
    ui.readout.textContent = i18n.t('onda.readout', {
      t: state.t, rho: rho.toFixed(3), rmin: Number.isNaN(rmin) ? '–' : rmin.toFixed(1), rexp: rf.toFixed(1),
    });
    eq.update({ rf, rmin });
    const err = Number.isNaN(rmin) || rf < 1 ? NaN : Math.abs(rmin - rf) / rf;
    eq.setIndicator('err', err, Number.isNaN(err) ? 'none' : err < 0.1 ? 'ok' : 'warn');
    eq.setIndicator('rho', rho, Math.abs(rho - 7 * state.f) < 0.02 ? 'ok' : 'warn');
  }
  function draw() { renderLattice(); renderProfile(); }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 0.5 });
  ui.loopctl.append(loopControls(loop, { speedMin: -3, speedMax: 10 }).el);
  reset();
  const offR = autoResize([lat, prof], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); offR(); root.replaceChildren(); } };
}
