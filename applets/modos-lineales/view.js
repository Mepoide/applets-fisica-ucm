import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, checkbox, loopControls } from '../../lib/ui.js';
import { setupPage, autoResize } from '../../lib/page.js';
import * as M from './model.js';

i18n.register({
  es: {
    'modos.title': 'Modos de la hidrodinámica linealizada',
    'modos.cs': 'Velocidad del sonido c_s', 'modos.gammaS': 'Atenuación del sonido Γ', 'modos.DT': 'Difusividad térmica D_T = κ/ρc_p', 'modos.gamma': 'γ = c_p/c_v', 'modos.sigma': 'Anchura inicial σ', 'modos.time': 'Tiempo t',
    'modos.show.rho': 'δρ(x)', 'modos.show.u': 'u(x)', 'modos.show.T': 'δT(x)', 'modos.components': 'Mostrar modos sonoro y térmico por separado',
    'modos.cap.rho': 'Perturbación de densidad: dos pulsos sonoros (Brillouin) que viajan a ±c_s con peso 1/γ y se ensanchan con Γ, más un pulso térmico (Rayleigh) de peso 1 − 1/γ que difunde con D_T. Punteado: modos por separado.',
    'modos.cap.u': 'Velocidad del fluido, obtenida de la ecuación de continuidad. Antisimétrica: el fluido se aleja del centro con los pulsos sonoros.',
    'modos.cap.T': 'Perturbación de temperatura (gas ideal): el sonido es adiabático, δT = (γ−1)(T/ρ)δρ_s; el modo térmico es isobaro, δT = −(T/ρ)δρ_T. En t = 0 ambas se cancelan.',
    'modos.readout': 't = {t} · pesos: sonido 1/γ = {ws} (cada pulso {wh}), térmico 1 − 1/γ = {wt} · ∫δρ dx = {mass}',
    'modos.hint': 'Pon γ = 1: desaparece el modo térmico (gas sin diferencia entre c_p y c_v). Sube Γ para ver cómo se amortigua el sonido y D_T para acelerar la difusión del pico central. La solución es analítica: puedes arrastrar el tiempo adelante y atrás.',
  },
  en: {
    'modos.title': 'Linearized hydrodynamics modes',
    'modos.cs': 'Sound speed c_s', 'modos.gammaS': 'Sound attenuation Γ', 'modos.DT': 'Thermal diffusivity D_T = κ/ρc_p', 'modos.gamma': 'γ = c_p/c_v', 'modos.sigma': 'Initial width σ', 'modos.time': 'Time t',
    'modos.show.rho': 'δρ(x)', 'modos.show.u': 'u(x)', 'modos.show.T': 'δT(x)', 'modos.components': 'Show sound and thermal modes separately',
    'modos.cap.rho': 'Density perturbation: two sound (Brillouin) pulses travelling at ±c_s with weight 1/γ and broadening with Γ, plus a thermal (Rayleigh) pulse of weight 1 − 1/γ diffusing with D_T. Dotted: separate modes.',
    'modos.cap.u': 'Fluid velocity, from the continuity equation. Antisymmetric: the fluid moves away from the centre with the sound pulses.',
    'modos.cap.T': 'Temperature perturbation (ideal gas): sound is adiabatic, δT = (γ−1)(T/ρ)δρ_s; the thermal mode is isobaric, δT = −(T/ρ)δρ_T. At t = 0 they cancel.',
    'modos.readout': 't = {t} · weights: sound 1/γ = {ws} (each pulse {wh}), thermal 1 − 1/γ = {wt} · ∫δρ dx = {mass}',
    'modos.hint': 'Set γ = 1: the thermal mode disappears (no difference between c_p and c_v). Raise Γ to damp the sound and D_T to speed up the diffusion of the central peak. The solution is analytic: you can drag time back and forth.',
  },
});
setupPage({ slug: 'modos-lineales', titleKey: 'modos.title', legacyPath: 'SOLSLINEALES/LINEAL.JAVA' });

const XMAX = 60, NX = 601, TMAX = 50;
const xs = M.linspace(-XMAX, XMAX, NX);
let t = 0;
const pCs = numberField({ label: 'modos.cs', value: 1, min: 0.1, max: 5, step: 0.1, onChange: draw });
const pG = numberField({ label: 'modos.gammaS', value: 0.1, min: 0, max: 5, step: 0.05, onChange: draw });
const pDT = numberField({ label: 'modos.DT', value: 0.1, min: 0, max: 5, step: 0.05, onChange: draw });
const pGam = numberField({ label: 'modos.gamma', value: 1.667, min: 1, max: 3, step: 0.01, onChange: draw });
const pSig = numberField({ label: 'modos.sigma', value: 2, min: 0.5, max: 10, step: 0.5, onChange: draw });
const pT = slider({ label: 'modos.time', value: 0, min: 0, max: TMAX, step: 0.1, format: (v) => v.toFixed(1), onChange: (v) => { t = v; draw(); } });
const pComp = checkbox({ label: 'modos.components', checked: true, onChange: draw });
document.getElementById('params').append(pCs.el, pG.el, pDT.el, pGam.el, pSig.el, pT.el, pComp.el);

const shown = { rho: true, u: true, T: true };
const toggles = document.getElementById('toggles');
for (const k of ['rho', 'u', 'T']) {
  const b = document.createElement('button'); b.type = 'button'; b.dataset.i18n = `modos.show.${k}`; b.textContent = i18n.t(`modos.show.${k}`);
  b.setAttribute('aria-pressed', 'true');
  b.addEventListener('click', () => { shown[k] = !shown[k]; b.setAttribute('aria-pressed', String(shown[k])); document.getElementById(`fig-${k}`).hidden = !shown[k]; window.dispatchEvent(new Event('resize')); });
  toggles.append(b);
}
toggles.classList.add('toggles');

const plots = {
  rho: new Plot(document.getElementById('rho'), { axes: true, xlabel: 'x', ylabel: 'δρ' }),
  u: new Plot(document.getElementById('u'), { axes: true, xlabel: 'x', ylabel: 'u' }),
  T: new Plot(document.getElementById('T'), { axes: true, xlabel: 'x', ylabel: 'δT' }),
};
function params() { return { cs: pCs.get(), gammaS: pG.get(), DT: pDT.get(), gamma: pGam.get(), sigma: pSig.get() }; }
function reset() { t = 0; pT.set(0); }
function step() { t = Math.min(TMAX, t + 0.1); pT.set(t); if (t >= TMAX) loop.pause(); }
function curve(plot, ys, color, width = 2, dash = []) {
  plot.color(color); plot.lineWidth(width); plot.ctx.setLineDash(dash); plot.polyline(xs, ys); plot.ctx.setLineDash([]); plot.lineWidth(1);
}
function draw() {
  const p = params();
  const pr = M.profiles(xs, t, p);
  const g0 = 1 / Math.sqrt(2 * Math.PI * p.sigma * p.sigma); // initial peak
  const comps = { S: new Float64Array(NX), Tm: new Float64Array(NX) };
  for (let i = 0; i < NX; i++) { const f = M.fields(xs[i], t, p); comps.S[i] = f.drhoS; comps.Tm[i] = f.drhoT; }
  if (shown.rho) {
    const pl = plots.rho; pl.setScales(-XMAX, XMAX, -0.1 * g0, 1.1 * g0); pl.clear();
    pl.color('#999'); pl.line(-XMAX, 0, XMAX, 0);
    if (pComp.get()) { curve(pl, comps.S, 'rgba(31,78,156,0.8)', 1, [4, 4]); curve(pl, comps.Tm, 'rgba(200,120,20,0.9)', 1, [4, 4]); }
    curve(pl, pr.drho, '#b5281e'); pl.end();
  }
  if (shown.u) {
    const pl = plots.u; const um = Math.max(1e-6, p.cs * g0 / (2 * p.gamma) * 1.3); pl.setScales(-XMAX, XMAX, -um, um); pl.clear();
    pl.color('#999'); pl.line(-XMAX, 0, XMAX, 0); curve(pl, pr.u, '#1f4e9c'); pl.end();
  }
  if (shown.T) {
    const pl = plots.T; const tm = Math.max(1e-6, g0 * Math.max(p.gamma - 1, 1 - 1 / p.gamma) * 0.7); pl.setScales(-XMAX, XMAX, -tm, tm); pl.clear();
    pl.color('#999'); pl.line(-XMAX, 0, XMAX, 0); curve(pl, pr.dT, '#c87814'); pl.end();
  }
  const w = M.weights(p.gamma);
  document.getElementById('readout').textContent = i18n.t('modos.readout', { t: t.toFixed(1), ws: w.sound.toFixed(3), wh: (w.sound / 2).toFixed(3), wt: w.thermal.toFixed(3), mass: M.integrate(xs, pr.drho).toFixed(4) });
}
const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
document.getElementById('loopctl').append(loopControls(loop, { speedMin: -2, speedMax: 5 }).el);
reset();
autoResize(Object.values(plots), draw);
