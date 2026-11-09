// Gaussian superlattices — Quantum Devices experiment 9 (tight binding, transfer matrix).
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as GS from './model.js';

export const meta = { slug: 'superred-gaussiana', titleKey: 'gsl.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'gsl.Nb': 'Número de barreras N_b', 'gsl.E0': 'Altura de la barrera central E₀ (unidades de T)', 'gsl.S': 'Anchura de la gaussiana S (periodos)',
    'gsl.cap.T': 'Coeficiente de transmisión T(E) en la banda de los contactos [−2T, 2T]: superred gaussiana (rojo) y superred uniforme con todas las barreras iguales a E₀ (azul). Al iniciar S disminuye desde un valor grande.',
    'gsl.cap.prof': 'Perfil de las barreras E_n = E₀ exp(−n²/2S²) (rojo) frente al uniforme (azul). Abajo, la red unidimensional equivalente: nodos pares (pozos) con energía 0 y nodos impares (barreras).',
    'gsl.readout': 'N_b = {Nb} · E₀ = {E0} T · S = {S} ({ratio} de la longitud) · T máxima = {Tmax} · anchura de la ventana T > ½: gaussiana {wg}, uniforme {wu} · mínimos en la ventana: {dg} / {du}',
    'gsl.hint': 'La superred uniforme transmite por una minibanda llena de resonancias (una por pozo) con mínimos profundos entre ellas: en una curva I–V eso da una razón pico-valle pobre. Al modular las barreras con una gaussiana de anchura S ≈ L/4 la minibanda se convierte en una ventana de transmisión lisa, casi sin oscilaciones. Con S ≫ L se recupera el caso uniforme; con S muy pequeña solo queda una barrera eficaz.',
    'gsl.eq.E0': 'altura de la barrera central', 'gsl.eq.S': 'anchura de la modulación gaussiana', 'gsl.eq.Nb': 'número de barreras', 'gsl.eq.Tmax': 'transmisión máxima',
    'gsl.ind.flat': 'mínimos T < 0.9 en la ventana: gaussiana', 'gsl.ind.flatu': 'mínimos T < 0.9 en la ventana: uniforme', 'gsl.ind.width': 'anchura T > ½: gauss / uniforme',
  },
  en: {
    'gsl.Nb': 'Number of barriers N_b', 'gsl.E0': 'Central barrier height E₀ (units of T)', 'gsl.S': 'Gaussian width S (periods)',
    'gsl.cap.T': 'Transmission coefficient T(E) within the lead band [−2T, 2T]: Gaussian superlattice (red) and uniform superlattice with all barriers equal to E₀ (blue). On start S decreases from a large value.',
    'gsl.cap.prof': 'Barrier profile E_n = E₀ exp(−n²/2S²) (red) versus the uniform one (blue). Below, the equivalent one-dimensional lattice: even nodes (wells) with energy 0 and odd nodes (barriers).',
    'gsl.readout': 'N_b = {Nb} · E₀ = {E0} T · S = {S} ({ratio} of the length) · max T = {Tmax} · width of the T > ½ window: Gaussian {wg}, uniform {wu} · minima inside the window: {dg} / {du}',
    'gsl.hint': 'The uniform superlattice transmits through a miniband full of resonances (one per well) with deep minima between them: in an I–V curve that gives a poor peak-to-valley ratio. Modulating the barriers with a Gaussian of width S ≈ L/4 turns the miniband into a smooth transmission window with almost no oscillations. With S ≫ L the uniform case is recovered; with very small S only one effective barrier remains.',
    'gsl.eq.E0': 'central barrier height', 'gsl.eq.S': 'width of the Gaussian modulation', 'gsl.eq.Nb': 'number of barriers', 'gsl.eq.Tmax': 'maximum transmission',
    'gsl.ind.flat': 'minima T < 0.9 in the window: Gaussian', 'gsl.ind.flatu': 'minima T < 0.9 in the window: uniform', 'gsl.ind.width': 'T > ½ width: Gauss / uniform',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'T', caption: 'gsl.cap.T', cls: 'wide' }, { id: 'prof', caption: 'gsl.cap.prof' }], hintKey: 'gsl.hint' });
  const Es = Array.from({ length: 1200 }, (_, i) => -1.995 + 3.99 * i / 1199); let eg, eu, Tg, Tu;
  const pNb = numberField({ label: 'gsl.Nb', value: 11, min: 2, max: 60, integer: true, onChange: () => { compute(); draw(); } });
  const pE0 = slider({ label: 'gsl.E0', value: 1.5, min: 0.2, max: 4, step: 0.1, format: (v) => v.toFixed(1), onChange: () => { compute(); draw(); } });
  const pS = slider({ label: 'gsl.S', value: 2.75, min: 0.5, max: 30, step: 0.25, format: (v) => v.toFixed(2), onChange: () => { compute(); draw(); } });
  ui.params.append(pNb.el, pE0.el, pS.el);
  const pT = new Plot(ui.canvas.T, { axes: true, xlabel: 'E (T)', ylabel: 'T(E)' });
  const pp = new Plot(ui.canvas.prof, { axes: true, xlabel: 'n', ylabel: 'E_n (T)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'E_n = \\htmlId{E0}{E_0}\\,\\exp\\Big(-\\frac{n^2}{2\\htmlId{S}{S}^2}\\Big)\\ (n\\ \\text{impar}),\\quad E_n = 0\\ (n\\ \\text{par});\\qquad N_b = \\htmlId{Nb}{N_b}', slots: { E0: { label: 'gsl.eq.E0' }, S: { label: 'gsl.eq.S' }, Nb: { label: 'gsl.eq.Nb' } } },
      { tex: '\\begin{pmatrix} C_{n+1} \\\\ C_n \\end{pmatrix} = \\begin{pmatrix} E_n - E & -1 \\\\ 1 & 0 \\end{pmatrix}\\begin{pmatrix} C_n \\\\ C_{n-1} \\end{pmatrix},\\qquad E = -2T\\cos k,\\qquad T_{\\max} = \\htmlId{Tmax}{T_{\\max}}', slots: { Tmax: { label: 'gsl.eq.Tmax' } } },
    ],
    indicators: [{ key: 'flat', label: 'gsl.ind.flat' }, { key: 'flatu', label: 'gsl.ind.flatu' }, { key: 'width', label: 'gsl.ind.width' }],
  });
  const stats = (T) => { let w = 0, d = 0; for (let i = 0; i < T.length; i++) if (T[i] > 0.5) w += Es[1] - Es[0]; for (let i = 1; i + 1 < T.length; i++) if (T[i] < T[i - 1] && T[i] < T[i + 1] && T[i] < 0.9 && (T[i - 1] > 0.5 || T[i + 1] > 0.5)) d++; return { w, d, max: Math.max(...T) }; };
  function compute() {
    eg = GS.siteEnergies(pNb.get(), pE0.get(), pS.get()); eu = GS.uniform(pNb.get(), pE0.get()); Tg = GS.spectrum(eg, Es); Tu = GS.spectrum(eu, Es);
    const sg = stats(Tg), su = stats(Tu);
    eq.update({ E0: pE0.get(), S: pS.get(), Nb: pNb.get(), Tmax: sg.max });
    eq.setIndicator('flat', sg.d, sg.d < su.d ? 'ok' : 'none'); eq.setIndicator('flatu', su.d, 'none'); eq.setIndicator('width', su.w > 0 ? sg.w / su.w : NaN, 'none');
  }
  function reset() { compute(); }
  function step() { const v = pS.get() - 0.25; if (v < 0.5) { loop.pause(); return; } pS.set(v); compute(); }
  function draw() {
    pT.setScales(-2, 2, 0, 1.05); pT.clear();
    pT.color('rgba(31,78,156,0.7)'); pT.polyline(Es, Tu); pT.color('rgba(181,40,30,0.9)'); pT.lineWidth(2); pT.polyline(Es, Tg); pT.lineWidth(1);
    pT.end();
    const n = eg.length, bg = GS.barriers(eg); pp.setScales(0, n, -0.3, pE0.get() * 1.15); pp.clear();
    pp.color('#999'); pp.line(0, 0, n, 0);
    for (let i = 0; i < n; i++) { pp.color(i % 2 ? 'rgba(181,40,30,0.9)' : 'rgba(60,60,60,0.6)'); pp.disk(i + 0.5, -0.15, 0.3 * Math.min(1, 20 / n)); }
    pp.color('rgba(31,78,156,0.7)'); for (let i = 1; i < n; i += 2) pp.bar(i + 0.2, i + 0.8, pE0.get(), 0, false);
    pp.color('rgba(181,40,30,0.8)'); for (let i = 1; i < n; i += 2) pp.bar(i + 0.25, i + 0.75, eg[i]);
    pp.end();
    const sg = stats(Tg), su = stats(Tu), L = 2 * pNb.get();
    ui.readout.textContent = i18n.t('gsl.readout', { Nb: pNb.get(), E0: pE0.get().toFixed(1), S: pS.get().toFixed(2), ratio: (pS.get() / L).toFixed(2), Tmax: sg.max.toFixed(3), wg: sg.w.toFixed(2), wu: su.w.toFixed(2), dg: sg.d, du: su.d });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 5 }).el);
  reset(); pS.set(30); compute();
  const off = autoResize([pT, pp], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
