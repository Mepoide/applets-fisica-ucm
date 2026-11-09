// Thermal conductivity of a disordered chain — Solid State experiment 4.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as Ch from '../_chain/chain.js';

export const meta = { slug: 'conductividad-cadena', titleKey: 'ccad.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'ccad.alpha': 'Cociente de masas α', 'ccad.c': 'Fracción de impurezas C', 'ccad.N': 'Longitud de la cadena N', 'ccad.real': 'Realizaciones a promediar',
    'ccad.cap.T': 'Coeficiente de transmisión T(ω) de un fonón a través del segmento desordenado entre dos cadenas perfectas (promedio de ln T sobre realizaciones, convertido a T). Gris: segmento sin desorden (T = 1 en la banda).',
    'ccad.cap.k': 'Conductividad térmica relativa a la cadena perfecta, κ/κ₀, frente a T/Θ_D. Se calcula integrando T(ω) con el peso ω² ∂n_B/∂T de cada modo.',
    'ccad.readout': 'N = {N} · α = {alpha} · C = {c} · ⟨T⟩ en la banda = {Tm} · κ/κ₀ a T = Θ_D/4: {k025} · a T = Θ_D: {k1}',
    'ccad.hint': 'En una dimensión cualquier desorden localiza todos los modos salvo los de longitud de onda muy larga: T(ω) decae exponencialmente con N para cada ω > 0 (localización de Anderson). Por eso κ/κ₀ cae al alargar la cadena; a baja temperatura solo pesan los modos de ω pequeña, que sí transmiten, y la caída es menor. Comprueba la tendencia moviendo N y T.',
    'ccad.eq.T': 'coeficiente de transmisión promedio en la banda', 'ccad.eq.theta': 'temperatura reducida T/Θ_D', 'ccad.eq.k': 'conductividad relativa a la cadena perfecta', 'ccad.eq.N': 'longitud del segmento desordenado',
    'ccad.ind.k': 'κ/κ₀ a T = Θ_D', 'ccad.ind.prog': 'progreso',
  },
  en: {
    'ccad.alpha': 'Mass ratio α', 'ccad.c': 'Impurity fraction C', 'ccad.N': 'Chain length N', 'ccad.real': 'Realisations to average',
    'ccad.cap.T': 'Transmission coefficient T(ω) of a phonon through the disordered segment between two perfect chains (average of ln T over realisations, converted to T). Grey: segment without disorder (T = 1 in the band).',
    'ccad.cap.k': 'Thermal conductivity relative to the perfect chain, κ/κ₀, versus T/Θ_D. Computed by integrating T(ω) with the weight ω² ∂n_B/∂T of each mode.',
    'ccad.readout': 'N = {N} · α = {alpha} · C = {c} · ⟨T⟩ in the band = {Tm} · κ/κ₀ at T = Θ_D/4: {k025} · at T = Θ_D: {k1}',
    'ccad.hint': 'In one dimension any disorder localises all modes except those of very long wavelength: T(ω) decays exponentially with N for every ω > 0 (Anderson localisation). Hence κ/κ₀ drops as the chain grows; at low temperature only the small-ω modes, which do transmit, carry weight. Check the trend by moving N and T.',
    'ccad.eq.T': 'band-averaged transmission coefficient', 'ccad.eq.theta': 'reduced temperature T/Θ_D', 'ccad.eq.k': 'conductivity relative to the perfect chain', 'ccad.eq.N': 'length of the disordered segment',
    'ccad.ind.k': 'κ/κ₀ at T = Θ_D', 'ccad.ind.prog': 'progress',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'T', caption: 'ccad.cap.T' }, { id: 'k', caption: 'ccad.cap.k' }], hintKey: 'ccad.hint' });
  const ws = Array.from({ length: 161 }, (_, i) => 2 * i / 160), thetas = Array.from({ length: 60 }, (_, i) => 0.02 + 1.98 * i / 59);
  let lnT, done = 0, nReal = 1;
  const pA = numberField({ label: 'ccad.alpha', value: 2, min: 1, max: 10, step: 0.1 });
  const pC = numberField({ label: 'ccad.c', value: 0.3, min: 0, max: 1, step: 0.05 });
  const pN = numberField({ label: 'ccad.N', value: 100, min: 2, max: 2000, integer: true });
  const pR = numberField({ label: 'ccad.real', value: 20, min: 1, max: 200, integer: true });
  ui.params.append(pA.el, pC.el, pN.el, pR.el);
  const pT = new Plot(ui.canvas.T, { axes: true, xlabel: 'ω', ylabel: 'T(ω)' });
  const pK = new Plot(ui.canvas.k, { axes: true, xlabel: 'T / Θ_D', ylabel: 'κ / κ₀' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\begin{pmatrix} U_{N+1} \\\\ U_N\\end{pmatrix} = \\prod_{n=1}^{\\htmlId{N}{N}} \\begin{pmatrix} 2 - m_n\\omega^2 & -1 \\\\ 1 & 0 \\end{pmatrix}\\begin{pmatrix} U_1 \\\\ U_0\\end{pmatrix},\\qquad \\langle T\\rangle_{\\rm banda} = \\htmlId{T}{T}', slots: { N: { label: 'ccad.eq.N' }, T: { label: 'ccad.eq.T' } } },
      { tex: '\\frac{\\kappa}{\\kappa_0} = \\frac{\\int_0^{\\omega_D} T(\\omega)\\,\\omega^2\\,\\partial_T n_B\\,d\\omega}{\\int_0^{\\omega_D} \\omega^2\\,\\partial_T n_B\\,d\\omega},\\qquad \\frac{\\kappa}{\\kappa_0}\\Big|_{T=\\Theta_D} = \\htmlId{k}{\\kappa/\\kappa_0}', slots: { k: { label: 'ccad.eq.k' } } },
    ],
    indicators: [{ key: 'k', label: 'ccad.ind.k' }, { key: 'prog', label: 'ccad.ind.prog', fmt: (v) => `${Math.round(100 * v)} %` }],
  });
  function reset() { lnT = new Float64Array(ws.length); done = 0; nReal = pR.get(); eq.update({ N: pN.get() }); }
  function step() {
    if (done >= nReal) { loop.pause(); return; }
    const m = Ch.randomMasses(pN.get(), pA.get(), pC.get());
    for (let j = 0; j < ws.length; j++) lnT[j] += Math.log(Math.max(1e-300, Ch.transmission(m, ws[j])));
    done++;
  }
  function trans() { return Array.from(lnT, (v) => (done ? Math.exp(v / done) : 0)); }
  function draw() {
    const T = trans();
    pT.setScales(0, 2, 0, 1.05); pT.clear();
    pT.color('#999'); pT.polyline([0, 2, 2], [1, 1, 0]);
    pT.color('rgba(181,40,30,0.9)'); pT.lineWidth(2); if (done) pT.polyline(ws, T); pT.lineWidth(1);
    pT.end();
    const ks = done ? thetas.map((th) => Ch.conductivity(T, ws, th)) : [];
    pK.setScales(0, 2, 0, 1.05); pK.clear();
    pK.color('#999'); pK.line(0, 1, 2, 1);
    pK.color('#1f4e9c'); pK.lineWidth(2); if (done) pK.polyline(thetas, ks); pK.lineWidth(1);
    pK.end();
    let Tm = 0, cnt = 0; for (let j = 1; j < ws.length - 1; j++) { Tm += T[j]; cnt++; } Tm = cnt ? Tm / cnt : 0;
    const k1 = done ? Ch.conductivity(T, ws, 1) : NaN, k025 = done ? Ch.conductivity(T, ws, 0.25) : NaN;
    ui.readout.textContent = i18n.t('ccad.readout', { N: pN.get(), alpha: pA.get(), c: pC.get(), Tm: done ? Tm.toFixed(3) : '–', k025: Number.isNaN(k025) ? '–' : k025.toFixed(3), k1: Number.isNaN(k1) ? '–' : k1.toFixed(3) });
    eq.update({ T: done ? Tm : NaN, k: k1 });
    eq.setIndicator('k', k1, Number.isNaN(k1) ? 'none' : 'ok'); eq.setIndicator('prog', done / nReal, done === nReal ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset();
  const off = autoResize([pT, pK], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
