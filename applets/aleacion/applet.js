// Electrons in a disordered alloy — Solid State experiment 6.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as D from '../_schrod/delta.js';

export const meta = { slug: 'aleacion', titleKey: 'ale.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'ale.N': 'Átomos N', 'ale.lamA': 'λ_A (átomo huésped)', 'ale.lamB': 'λ_B (impureza)', 'ale.c': 'Concentración de impurezas', 'ale.real': 'Realizaciones', 'ale.mode': 'Gráfica', 'ale.mode.E': '⟨ln T⟩ frente a la energía', 'ale.mode.N': '⟨ln T⟩ frente a la longitud (E fija)', 'ale.E': 'Energía fija E',
    'ale.cap.main': 'Promedio de ln T sobre realizaciones del desorden. Frente a E: la transmisión se hunde dentro de las antiguas bandas (sombreadas: cristal puro con λ_A). Frente a N: ⟨ln T⟩ decrece linealmente, con pendiente −1/ξ (longitud de localización).',
    'ale.cap.chain': 'Un tramo de la cadena: átomos huésped (azul) e impurezas (rojo) a distancia fija L = 1.',
    'ale.readout': 'N = {N} · λ_A = {lA}, λ_B = {lB} · c = {c} · realizaciones {r} · ξ(E = {E}) ≈ {xi} sitios',
    'ale.hint': 'Con c = 0 recuperas las bandas del cristal puro. Con cualquier c > 0 y λ_B ≠ λ_A, ⟨ln T⟩ se hace cada vez más negativo al alargar la cadena: en una dimensión todos los estados están localizados (Anderson). La pendiente de ⟨ln T⟩ frente a N es −1/ξ. Se promedia ln T y no T porque T fluctúa en órdenes de magnitud entre realizaciones y su media la domina la realización más rara.',
    'ale.eq.lA': 'potencial del átomo huésped', 'ale.eq.lB': 'potencial de la impureza', 'ale.eq.c': 'concentración de impurezas', 'ale.eq.xi': 'longitud de localización ξ = −N/⟨ln T⟩', 'ale.eq.N': 'longitud de la cadena',
    'ale.ind.xi': 'ξ / N (localizado si ≪ 1)', 'ale.ind.prog': 'progreso',
  },
  en: {
    'ale.N': 'Atoms N', 'ale.lamA': 'λ_A (host atom)', 'ale.lamB': 'λ_B (impurity)', 'ale.c': 'Impurity concentration', 'ale.real': 'Realisations', 'ale.mode': 'Plot', 'ale.mode.E': '⟨ln T⟩ versus energy', 'ale.mode.N': '⟨ln T⟩ versus length (fixed E)', 'ale.E': 'Fixed energy E',
    'ale.cap.main': 'Average of ln T over disorder realisations. Versus E: transmission collapses inside the former bands (shaded: pure crystal with λ_A). Versus N: ⟨ln T⟩ decreases linearly, with slope −1/ξ (localisation length).',
    'ale.cap.chain': 'A stretch of the chain: host atoms (blue) and impurities (red) at fixed spacing L = 1.',
    'ale.readout': 'N = {N} · λ_A = {lA}, λ_B = {lB} · c = {c} · realisations {r} · ξ(E = {E}) ≈ {xi} sites',
    'ale.hint': 'With c = 0 you recover the pure-crystal bands. With any c > 0 and λ_B ≠ λ_A, ⟨ln T⟩ gets ever more negative as the chain grows: in one dimension all states are localised (Anderson). The slope of ⟨ln T⟩ versus N is −1/ξ. ln T, not T, is averaged because T fluctuates over orders of magnitude between realisations and its mean is dominated by the rarest one.',
    'ale.eq.lA': 'host-atom potential', 'ale.eq.lB': 'impurity potential', 'ale.eq.c': 'impurity concentration', 'ale.eq.xi': 'localisation length ξ = −N/⟨ln T⟩', 'ale.eq.N': 'chain length',
    'ale.ind.xi': 'ξ / N (localised if ≪ 1)', 'ale.ind.prog': 'progress',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'main', caption: 'ale.cap.main', cls: 'wide' }, { id: 'chain', caption: 'ale.cap.chain', cls: 'wide' }], hintKey: 'ale.hint' });
  let acc, cnt = 0, Xs = [], sample = null;
  const pN = numberField({ label: 'ale.N', value: 100, min: 2, max: 1000, integer: true });
  const pA = numberField({ label: 'ale.lamA', value: 2, min: -10, max: 10, step: 0.5 });
  const pB = numberField({ label: 'ale.lamB', value: 4, min: -10, max: 10, step: 0.5 });
  const pC = numberField({ label: 'ale.c', value: 0.3, min: 0, max: 1, step: 0.05 });
  const pR = numberField({ label: 'ale.real', value: 30, min: 1, max: 500, integer: true });
  const pMode = select({ label: 'ale.mode', value: 'E', options: [{ value: 'E', label: 'ale.mode.E' }, { value: 'N', label: 'ale.mode.N' }], onChange: () => loop.reset() });
  const pE = numberField({ label: 'ale.E', value: 5, min: 0.1, max: 100, step: 0.5 });
  ui.params.append(pN.el, pA.el, pB.el, pC.el, pR.el, pMode.el, pE.el);
  const main = new Plot(ui.canvas.main, { axes: true });
  const chain = new Plot(ui.canvas.chain, { xmin: 0, xmax: 60, ymin: -1, ymax: 1 });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: "-\\psi'' + \\sum_n \\lambda_n\\,\\delta(x - nL)\\,\\psi = E\\psi,\\quad \\lambda_n \\in \\{\\htmlId{lA}{\\lambda_A}, \\htmlId{lB}{\\lambda_B}\\},\\quad c = \\htmlId{c}{c}", slots: { lA: { label: 'ale.eq.lA' }, lB: { label: 'ale.eq.lB' }, c: { label: 'ale.eq.c' } } },
      { tex: '\\langle \\ln T\\rangle \\simeq -\\frac{N}{\\xi(E)},\\qquad \\xi(E) = \\htmlId{xi}{\\xi},\\quad N = \\htmlId{N}{N}', slots: { xi: { label: 'ale.eq.xi' }, N: { label: 'ale.eq.N' } } },
    ],
    indicators: [{ key: 'xi', label: 'ale.ind.xi' }, { key: 'prog', label: 'ale.ind.prog', fmt: (v) => `${Math.round(100 * v)} %` }],
  });
  const Emax = 40;
  function reset() {
    Xs = pMode.get() === 'E' ? Array.from({ length: 300 }, (_, i) => 0.1 + (Emax - 0.1) * i / 299) : Array.from({ length: 40 }, (_, i) => Math.round(pN.get() * (i + 1) / 40));
    acc = new Float64Array(Xs.length); cnt = 0; sample = null;
    eq.update({ lA: pA.get(), lB: pB.get(), c: pC.get(), N: pN.get() });
  }
  function realisation(n) { const lam = new Float64Array(n), x = new Float64Array(n); for (let i = 0; i < n; i++) { lam[i] = Math.random() < pC.get() ? pB.get() : pA.get(); x[i] = (i + 1); } return { lam, x }; }
  function step() {
    if (cnt >= pR.get()) { loop.pause(); return; }
    if (pMode.get() === 'E') { const r = realisation(pN.get()); sample = sample ?? r; for (let i = 0; i < Xs.length; i++) acc[i] += Math.log(Math.max(1e-300, D.transmission(r.lam, r.x, Xs[i]))); }
    else { const r = realisation(pN.get()); sample = sample ?? r; for (let i = 0; i < Xs.length; i++) acc[i] += Math.log(Math.max(1e-300, D.transmission(r.lam.subarray(0, Xs[i]), r.x.subarray(0, Xs[i]), pE.get()))); }
    cnt++;
  }
  function draw() {
    const mode = pMode.get(), ys = Array.from(acc, (v) => (cnt ? v / cnt : NaN));
    if (mode === 'E') {
      main.xlabel = 'E'; main.ylabel = '⟨ln T⟩'; main.setScales(0, Emax, Math.min(-1, ...ys.filter(Number.isFinite)) * 1.05 || -1, 0.5); main.clear();
      const edges = D.bandEdges(pA.get(), 1, 0.001, Emax); main.color('rgba(31,78,156,0.12)');
      for (let i = 0; i + 1 <= edges.length; i += 2) { const a = edges[i], b = edges[i + 1] ?? Emax; if (D.inBand(0.5 * (a + b), pA.get(), 1)) main.bar(a, b, 0.5, main.ymin); }
      main.color('rgba(181,40,30,0.9)'); main.lineWidth(1.5); if (cnt) main.polyline(Xs, ys); main.lineWidth(1);
    } else {
      main.xlabel = 'N'; main.ylabel = '⟨ln T⟩'; main.setScales(0, pN.get(), Math.min(-1, ...ys.filter(Number.isFinite)) * 1.05 || -1, 0.5); main.clear();
      main.color('rgba(181,40,30,0.9)'); main.lineWidth(1.5); if (cnt) main.polyline(Xs, ys); main.lineWidth(1);
      if (cnt) { // linear fit for the slope −1/ξ
        let sx = 0, sy = 0, sxx = 0, sxy = 0; for (let i = 0; i < Xs.length; i++) { sx += Xs[i]; sy += ys[i]; sxx += Xs[i] ** 2; sxy += Xs[i] * ys[i]; }
        const n = Xs.length, m = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - m * sx) / n;
        main.color('#1f4e9c'); main.lineWidth(2); main.line(0, b, pN.get(), b + m * pN.get()); main.lineWidth(1);
      }
    }
    main.end();
    chain.clear();
    if (sample) for (let i = 0; i < 60 && i < sample.lam.length; i++) { chain.color('#999'); chain.line(i + 0.5, -0.3, i + 0.5, 0.3); chain.color(sample.lam[i] === pA.get() ? '#1f4e9c' : '#b5281e'); chain.disk(i + 0.5, 0, 0.3); }
    chain.end();
    // localisation length at the fixed energy (or at E = pE from the E curve): ξ = −N/⟨ln T⟩
    let xi = NaN;
    if (cnt) { if (mode === 'N') { const last = ys[ys.length - 1]; xi = last < 0 ? -Xs[Xs.length - 1] / last : Infinity; } else { let j = 0; for (let i = 0; i < Xs.length; i++) if (Math.abs(Xs[i] - pE.get()) < Math.abs(Xs[j] - pE.get())) j = i; xi = ys[j] < 0 ? -pN.get() / ys[j] : Infinity; } }
    ui.readout.textContent = i18n.t('ale.readout', { N: pN.get(), lA: pA.get(), lB: pB.get(), c: pC.get(), r: cnt, E: pE.get(), xi: Number.isFinite(xi) ? xi.toFixed(1) : '∞' });
    eq.update({ xi });
    eq.setIndicator('xi', Number.isFinite(xi) ? xi / pN.get() : NaN, !Number.isFinite(xi) ? 'none' : xi / pN.get() < 0.3 ? 'ok' : 'warn'); eq.setIndicator('prog', cnt / pR.get(), cnt >= pR.get() ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset();
  const off = autoResize([main, chain], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
