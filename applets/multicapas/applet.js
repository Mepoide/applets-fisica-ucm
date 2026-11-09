// X-ray reflection in metallic multilayers — Solid State experiment 12 (Rouard's method).
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as X from './model.js';

export const meta = { slug: 'multicapas', titleKey: 'mul.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'mul.pairs': 'Pares de capas N (1–200)', 'mul.d1': 'Espesor capa impar d₁ (Å)', 'mul.d2': 'Espesor capa par d₂ (Å)', 'mul.del1': 'δ₁ (×10⁻³, capa impar)', 'mul.del2': 'δ₂ (×10⁻³, capa par)', 'mul.beta': 'β (absorción, ×10⁻⁴, ambas)',
    'mul.cap.R': 'Reflectividad en incidencia normal R(λ) de la multicapa (rojo). Línea verde: longitud de onda de Bragg de primer orden λ_B = 2(n₁d₁ + n₂d₂). Los picos secundarios son interferencias de las N capas (franjas de Kiessig).',
    'mul.cap.stack': 'Esquema de la multicapa: capas alternas de índice n = 1 − δ + iβ, de espesores d₁ y d₂, sobre vacío. Los rayos X ven todos los materiales con n ligeramente menor que 1.',
    'mul.readout': 'N = {N} pares · d₁ = {d1} Å, d₂ = {d2} Å · λ_B = {lb} Å · R máxima = {Rmax} en λ = {lmax} Å · anchura del pico ≈ {w} Å',
    'mul.hint': 'El pico de Bragg aparece en λ_B = 2(n₁d₁ + n₂d₂): cambia los espesores y verás cómo se desplaza. Con pocas capas el pico es ancho y bajo; al aumentar N crece hasta saturar en R ≈ 1 y se estrecha como 1/N, hasta que la absorción β limita cuántas capas "ve" el haz. Si δ₁ = δ₂ no hay contraste y no hay reflexión.',
    'mul.eq.N': 'número de pares de capas', 'mul.eq.lb': 'longitud de onda de Bragg', 'mul.eq.Rmax': 'reflectividad máxima', 'mul.eq.mu': 'fase óptica μ_k = 2πn_kd_k/λ',
    'mul.ind.Rmax': 'R máxima', 'mul.ind.pos': 'λ del máximo / λ_B',
  },
  en: {
    'mul.pairs': 'Layer pairs N (1–200)', 'mul.d1': 'Odd-layer thickness d₁ (Å)', 'mul.d2': 'Even-layer thickness d₂ (Å)', 'mul.del1': 'δ₁ (×10⁻³, odd layer)', 'mul.del2': 'δ₂ (×10⁻³, even layer)', 'mul.beta': 'β (absorption, ×10⁻⁴, both)',
    'mul.cap.R': 'Normal-incidence reflectivity R(λ) of the multilayer (red). Green line: first-order Bragg wavelength λ_B = 2(n₁d₁ + n₂d₂). Secondary peaks are interferences of the N layers (Kiessig fringes).',
    'mul.cap.stack': 'Sketch of the multilayer: alternating layers of index n = 1 − δ + iβ, thicknesses d₁ and d₂, on vacuum. X-rays see every material with n slightly below 1.',
    'mul.readout': 'N = {N} pairs · d₁ = {d1} Å, d₂ = {d2} Å · λ_B = {lb} Å · max R = {Rmax} at λ = {lmax} Å · peak width ≈ {w} Å',
    'mul.hint': 'The Bragg peak appears at λ_B = 2(n₁d₁ + n₂d₂): change the thicknesses and watch it move. With few layers the peak is broad and low; increasing N it grows until it saturates at R ≈ 1 and narrows as 1/N, until absorption β limits how many layers the beam "sees". If δ₁ = δ₂ there is no contrast and no reflection.',
    'mul.eq.N': 'number of layer pairs', 'mul.eq.lb': 'Bragg wavelength', 'mul.eq.Rmax': 'maximum reflectivity', 'mul.eq.mu': 'optical phase μ_k = 2πn_kd_k/λ',
    'mul.ind.Rmax': 'max R', 'mul.ind.pos': 'λ of the maximum / λ_B',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'R', caption: 'mul.cap.R', cls: 'wide' }, { id: 'stack', caption: 'mul.cap.stack' }], hintKey: 'mul.hint' });
  let N = 20, growing = false;
  const pN = numberField({ label: 'mul.pairs', value: 20, min: 1, max: 200, integer: true });
  const pd1 = numberField({ label: 'mul.d1', value: 15, min: 2, max: 200, step: 1 });
  const pd2 = numberField({ label: 'mul.d2', value: 15, min: 2, max: 200, step: 1 });
  const pD1 = numberField({ label: 'mul.del1', value: 30, min: 0, max: 100, step: 1 });
  const pD2 = numberField({ label: 'mul.del2', value: 5, min: 0, max: 100, step: 1 });
  const pB = numberField({ label: 'mul.beta', value: 2, min: 0, max: 50, step: 1 });
  ui.params.append(pN.el, pd1.el, pd2.el, pD1.el, pD2.el, pB.el);
  const pR = new Plot(ui.canvas.R, { axes: true, xlabel: 'λ (Å)', ylabel: 'R' });
  const pS = new Plot(ui.canvas.stack, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'A',
    equations: [
      { tex: 'f_{k-1} = \\frac{r_{k-1} + f_k\\,e^{2i\\mu_k}}{1 + r_{k-1} f_k\\,e^{2i\\mu_k}},\\quad r_k = \\frac{n_{k-1} - n_k}{n_{k-1} + n_k},\\quad \\mu_k = \\frac{2\\pi n_k d_k}{\\lambda};\\qquad R = |f_1|^2', slots: {} },
      { tex: '\\lambda_B = 2(n_1 d_1 + n_2 d_2) = \\htmlId{lb}{\\lambda_B},\\qquad N = \\htmlId{N}{N},\\qquad R_{\\max} = \\htmlId{Rmax}{R_{\\max}}', slots: { lb: { label: 'mul.eq.lb' }, N: { label: 'mul.eq.N' }, Rmax: { label: 'mul.eq.Rmax' } } },
    ],
    indicators: [{ key: 'Rmax', label: 'mul.ind.Rmax' }, { key: 'pos', label: 'mul.ind.pos' }],
  });
  const layersOf = (n) => X.periodicStack(n, { delta: pD1.get() * 1e-3, beta: pB.get() * 1e-4, d: pd1.get() }, { delta: pD2.get() * 1e-3, beta: pB.get() * 1e-4, d: pd2.get() });
  function reset() { growing = false; N = pN.get(); eq.update({ N }); }
  let tick = 0;
  function step() {
    if (!growing) { growing = true; N = 1; tick = 0; return; }
    if (N >= pN.get()) { growing = false; loop.pause(); return; }
    if (++tick % 8 === 0) N = Math.min(pN.get(), N + Math.max(1, Math.round(pN.get() / 60)));
  }
  function draw() {
    const a = { delta: pD1.get() * 1e-3, beta: pB.get() * 1e-4, d: pd1.get() }, b = { delta: pD2.get() * 1e-3, beta: pB.get() * 1e-4, d: pd2.get() };
    const lb = X.braggWavelength(a, b), ls = Array.from({ length: 500 }, (_, i) => lb * (0.7 + 0.6 * i / 499));
    const R = X.spectrum(layersOf(N), ls);
    let imax = 0; for (let i = 1; i < R.length; i++) if (R[i] > R[imax]) imax = i;
    let lo = imax, hi = imax; while (lo > 0 && R[lo] > R[imax] / 2) lo--; while (hi < R.length - 1 && R[hi] > R[imax] / 2) hi++;
    pR.setScales(ls[0], ls[ls.length - 1], 0, 1.05); pR.clear();
    pR.color('rgba(40,160,60,0.8)'); pR.line(lb, 0, lb, 1.05);
    pR.color('rgba(181,40,30,0.9)'); pR.lineWidth(2); pR.polyline(ls, R); pR.lineWidth(1);
    pR.end();
    pS.clear(); const nShow = Math.min(2 * N, 24), hgt = 0.8 / nShow;
    for (let k = 0; k < nShow; k++) { pS.color(k % 2 === 0 ? 'rgba(31,78,156,0.8)' : 'rgba(31,78,156,0.3)'); pS.rect(0.2, 0.9 - (k + 1) * hgt, 0.6, hgt * 0.92, true); }
    pS.color('#222'); pS.text(0.5, 0.95, `${N} × (d₁ + d₂)`, { align: 'center' }); if (2 * N > nShow) pS.text(0.5, 0.04, '⋮', { align: 'center' });
    pS.end();
    ui.readout.textContent = i18n.t('mul.readout', { N, d1: pd1.get(), d2: pd2.get(), lb: lb.toFixed(1), Rmax: R[imax].toFixed(3), lmax: ls[imax].toFixed(1), w: (ls[hi] - ls[lo]).toFixed(1) });
    eq.update({ lb, N, Rmax: R[imax] });
    eq.setIndicator('Rmax', R[imax], R[imax] > 0.9 ? 'ok' : 'none'); eq.setIndicator('pos', ls[imax] / lb, Math.abs(ls[imax] / lb - 1) < 0.02 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset();
  const off = autoResize([pR, pS], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
