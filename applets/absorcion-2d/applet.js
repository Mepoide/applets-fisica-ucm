// Optical absorption in two-dimensional systems — Quantum Devices experiment 10.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as AB from './model.js';

export const meta = { slug: 'absorcion-2d', titleKey: 'a2d.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'a2d.G0': 'Anchura inhomogénea Γ₀ (Ry*)', 'a2d.Gph': 'Acoplamiento a fonones Γ_fonón (Ry*)', 'a2d.T': 'Temperatura (K)', 'a2d.shift': 'Desplazamiento del gap ΔE_g (meV)',
    'a2d.cap.spec': 'Espectro "medido" (puntos grises, generado con parámetros ocultos más ruido) y modelo α(ħω) (rojo) normalizados al máximo. Azul: contribución excitónica; verde: continuo con factor de Sommerfeld. El error cuadrático medio aparece en el panel.',
    'a2d.cap.err': 'Error cuadrático medio del ajuste frente a γ (se construye al iniciar barriendo Γ₀). El mínimo marca la anchura de línea del espectro.',
    'a2d.readout': 'γ = {g} Ry* = {gmeV} meV · Γ₀ = {G0} · Γ_fonón/(e^{ħω/kT} − 1) = {Gph} (T = {T} K) · ΔE_g = {shift} meV · error rms = {err} · pico 1s en ħω − E_g = −4 Ry* = {E1s} meV',
    'a2d.hint': 'El excitón 2D tiene energía de ligadura 4 Ry* (cuatro veces la 3D) y el continuo arranca en ħω = E_g con factor de Sommerfeld 2, por eso no hay escalón limpio: el pico 1s domina y el borde queda realzado. Ajusta Γ₀ hasta minimizar el error (inicia para barrer γ): la anchura resultante es la del desorden a baja temperatura; sube T para ver cómo los fonones LO (34 meV) ensanchan la línea y borran la estructura excitónica.',
    'a2d.eq.g': 'anchura de línea total', 'a2d.eq.T': 'temperatura', 'a2d.eq.err': 'error rms entre modelo y datos', 'a2d.eq.shift': 'corrección del gap',
    'a2d.ind.err': 'error rms', 'a2d.ind.best': 'γ / mejor γ barrido',
  },
  en: {
    'a2d.G0': 'Inhomogeneous width Γ₀ (Ry*)', 'a2d.Gph': 'Phonon coupling Γ_phonon (Ry*)', 'a2d.T': 'Temperature (K)', 'a2d.shift': 'Gap shift ΔE_g (meV)',
    'a2d.cap.spec': '"Measured" spectrum (grey dots, generated with hidden parameters plus noise) and model α(ħω) (red) normalised to the maximum. Blue: excitonic contribution; green: continuum with Sommerfeld factor. The rms error is shown in the panel.',
    'a2d.cap.err': 'Rms error of the fit versus γ (built on start by sweeping Γ₀). The minimum marks the linewidth of the spectrum.',
    'a2d.readout': 'γ = {g} Ry* = {gmeV} meV · Γ₀ = {G0} · Γ_phonon/(e^{ħω/kT} − 1) = {Gph} (T = {T} K) · ΔE_g = {shift} meV · rms error = {err} · 1s peak at ħω − E_g = −4 Ry* = {E1s} meV',
    'a2d.hint': 'The 2D exciton has binding energy 4 Ry* (four times the 3D value) and the continuum starts at ħω = E_g with Sommerfeld factor 2, so there is no clean step: the 1s peak dominates and the edge is enhanced. Adjust Γ₀ to minimise the error (start to sweep γ): the resulting width is the disorder width at low temperature; raise T to see how LO phonons (34 meV) broaden the line and wash out the excitonic structure.',
    'a2d.eq.g': 'total linewidth', 'a2d.eq.T': 'temperature', 'a2d.eq.err': 'rms error between model and data', 'a2d.eq.shift': 'gap correction',
    'a2d.ind.err': 'rms error', 'a2d.ind.best': 'γ / best swept γ',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'spec', caption: 'a2d.cap.spec', cls: 'wide' }, { id: 'err', caption: 'a2d.cap.err' }], hintKey: 'a2d.hint' });
  const es = Array.from({ length: 240 }, (_, i) => -8 + 16 * i / 239), target = AB.synthetic(es, { g: 0.42, noise: 0.02 });
  let g, model, exc, cont, err, curve = [];
  const pG0 = slider({ label: 'a2d.G0', value: 0.8, min: 0.1, max: 2, step: 0.02, format: (v) => v.toFixed(2), onChange: () => { compute(); draw(); } });
  const pGph = numberField({ label: 'a2d.Gph', value: 5, min: 0, max: 50, step: 1, onChange: () => { curve = []; compute(); draw(); } });
  const pT = numberField({ label: 'a2d.T', value: 12, min: 1, max: 300, step: 1, onChange: () => { curve = []; compute(); draw(); } });
  const psh = slider({ label: 'a2d.shift', value: 0, min: -5, max: 5, step: 0.25, format: (v) => v.toFixed(2), onChange: () => { curve = []; compute(); draw(); } });
  ui.params.append(pG0.el, pGph.el, pT.el, psh.el);
  const ps = new Plot(ui.canvas.spec, { axes: true, xlabel: 'ħω − E_g (meV)', ylabel: 'α (norm.)' });
  const pe = new Plot(ui.canvas.err, { axes: true, xlabel: 'γ (Ry*)', ylabel: 'error rms' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\alpha(\\hbar\\omega) \\sim \\sum_{n=1}^{\\infty}\\frac{4}{(n-\\frac12)^3}\\,\\frac{\\gamma}{[\\varepsilon + (n-\\frac12)^{-2}]^2 + \\gamma^2} + \\int_0^\\infty \\frac{S_{2D}(\\varepsilon\')\\,\\gamma}{(\\varepsilon\' - \\varepsilon)^2 + \\gamma^2}\\,d\\varepsilon\',\\quad \\varepsilon = \\frac{\\hbar\\omega - E_g}{Ry^*}', slots: {} },
      { tex: 'S_{2D}(\\varepsilon) = \\frac{2}{1 + e^{-2\\pi/\\sqrt\\varepsilon}},\\qquad \\gamma = \\Gamma_0 + \\frac{\\Gamma_{\\rm fon}}{e^{\\hbar\\omega_{LO}/k_BT} - 1} = \\htmlId{g}{\\gamma},\\quad T = \\htmlId{T}{T},\\quad \\Delta E_g = \\htmlId{shift}{\\Delta E_g},\\quad \\text{rms} = \\htmlId{err}{\\sigma}', slots: { g: { label: 'a2d.eq.g' }, T: { label: 'a2d.eq.T' }, shift: { label: 'a2d.eq.shift' }, err: { label: 'a2d.eq.err' } } },
    ],
    indicators: [{ key: 'err', label: 'a2d.ind.err' }, { key: 'best', label: 'a2d.ind.best' }],
  });
  const norm = (v) => { const m = Math.max(...v); return v.map((x) => x / m); };
  function compute() {
    g = AB.gamma(pG0.get(), pGph.get(), pT.get()); const sh = psh.get() / AB.RY;
    const raw = es.map((e) => AB.alpha(e - sh, g)), m = Math.max(...raw); model = raw.map((v) => v / m);
    exc = es.map((e) => AB.alpha(e - sh, g, { emax: 1e-9, ncont: 1 }) / m); cont = model.map((v, i) => v - exc[i]);
    err = AB.rms(model, target);
    if (!curve.some((p) => Math.abs(p.g - g) < 1e-9)) { curve.push({ g, err }); curve.sort((p, q) => p.g - q.g); }
    const best = curve.reduce((a, b) => (b.err < a.err ? b : a));
    eq.update({ g, T: pT.get(), shift: psh.get(), err });
    eq.setIndicator('err', err, err < 0.02 ? 'ok' : 'none'); eq.setIndicator('best', g / best.g, 'none');
  }
  function reset() { curve = []; compute(); }
  function step() { const v = Math.round((pG0.get() + 0.02) * 100) / 100; if (v > 2) { loop.pause(); return; } pG0.set(v); compute(); }
  function draw() {
    const x = es.map((e) => e * AB.RY);
    ps.setScales(x[0], x[x.length - 1], 0, 1.15); ps.clear();
    ps.color('rgba(40,160,60,0.8)'); ps.polyline(x, cont); ps.color('rgba(31,78,156,0.8)'); ps.polyline(x, exc);
    ps.color('rgba(120,120,120,0.8)'); target.forEach((t, i) => ps.disk(x[i], t, 0.12));
    ps.color('rgba(181,40,30,0.9)'); ps.lineWidth(2); ps.polyline(x, model); ps.lineWidth(1);
    ps.color('#999'); ps.line(0, 0, 0, 1.15);
    ps.end();
    const emax = Math.max(0.1, ...curve.map((p) => p.err)) * 1.1;
    pe.setScales(0, 2.2, 0, emax); pe.clear();
    if (curve.length > 1) { pe.color('rgba(181,40,30,0.9)'); pe.lineWidth(2); pe.polyline(curve.map((p) => p.g), curve.map((p) => p.err)); pe.lineWidth(1); }
    pe.color('#222'); pe.line(g, 0, g, emax);
    pe.end();
    ui.readout.textContent = i18n.t('a2d.readout', { g: g.toFixed(3), gmeV: (g * AB.RY).toFixed(2), G0: pG0.get().toFixed(2), Gph: (g - pG0.get()).toFixed(3), T: pT.get(), shift: psh.get().toFixed(2), err: err.toFixed(4), E1s: (-4 * AB.RY + psh.get()).toFixed(1) });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 5 }).el);
  reset(); pG0.set(0.1); compute();
  const off = autoResize([ps, pe], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
