// Chemical reactions: Maginu model — experiment 5. Stochastic reaction–diffusion automaton
// against the macroscopic limit cycle.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as M from './model.js';

export const meta = { slug: 'maginu', titleKey: 'mag.title', legacyPath: '../../README.md', number: 5 };

i18n.register({
  es: {
    'mag.s': 'Escala s (barridos de difusión por reacción, 1–20)', 'mag.size': 'Red (celdas por lado)', 'mag.nmax': 'Partículas máximas por celda', 'mag.show': 'Mostrar', 'mag.show.1': 'Especie 1', 'mag.show.2': 'Especie 2', 'mag.show.diff': 'Diferencia c₁ − c₂', 'mag.tone': 'Contraste',
    'mag.cap.map': 'Concentración local de la especie elegida (oscuro: baja, claro: alta). Con s grande toda la red oscila a la vez; con s pequeño solo hay parches locales incoherentes.',
    'mag.cap.phase': 'Plano (c₁, c₂). Azul: ciclo límite de las ecuaciones macroscópicas homogéneas. Rojo: trayectoria de la concentración media de la red.',
    'mag.readout': 't = {t} · ⟨c₁⟩ = {c1} · ⟨c₂⟩ = {c2} · periodo del ciclo macroscópico = {T} · amplitud de ⟨c₁⟩ en el último ciclo = {amp}',
    'mag.hint': 'Con el estado inicial aleatorio y s pequeño las celdas nunca se sincronizan. Pon s = 1: la reacción local gana a la difusión, las celdas oscilan desfasadas y la media apenas se mueve del centro del ciclo (la curva roja se encoge). Sube s a 15–20: la difusión sincroniza la red y la media recorre el ciclo azul. Las fluctuaciones son las de un número finito de partículas por celda: con menos partículas, más ruido.',
    'mag.eq.s': 'barridos de difusión por paso de reacción', 'mag.eq.k': 'parámetro k del modelo', 'mag.eq.c': 'parámetro c (escala de tiempo de c₂)', 'mag.eq.T': 'periodo del ciclo límite macroscópico',
    'mag.ind.amp': 'amplitud de ⟨c₁⟩ / amplitud del ciclo', 'mag.ind.n': 'partículas por celda (nivel de ruido)',
  },
  en: {
    'mag.s': 'Scale s (diffusion sweeps per reaction, 1–20)', 'mag.size': 'Lattice (cells per side)', 'mag.nmax': 'Max particles per cell', 'mag.show': 'Show', 'mag.show.1': 'Species 1', 'mag.show.2': 'Species 2', 'mag.show.diff': 'Difference c₁ − c₂', 'mag.tone': 'Contrast',
    'mag.cap.map': 'Local concentration of the chosen species (dark: low, light: high). With large s the whole lattice oscillates together; with small s only incoherent local patches remain.',
    'mag.cap.phase': 'Plane (c₁, c₂). Blue: limit cycle of the homogeneous macroscopic equations. Red: trajectory of the lattice-mean concentration.',
    'mag.readout': 't = {t} · ⟨c₁⟩ = {c1} · ⟨c₂⟩ = {c2} · macroscopic cycle period = {T} · amplitude of ⟨c₁⟩ over the last cycle = {amp}',
    'mag.hint': 'With the random initial state and small s the cells never synchronise. Set s = 1: local reaction beats diffusion, cells oscillate out of phase and the mean barely leaves the centre of the cycle (the red curve shrinks). Raise s to 15–20: diffusion synchronises the lattice and the mean travels along the blue cycle. Fluctuations are those of a finite number of particles per cell: fewer particles, more noise.',
    'mag.eq.s': 'diffusion sweeps per reaction step', 'mag.eq.k': 'model parameter k', 'mag.eq.c': 'parameter c (time scale of c₂)', 'mag.eq.T': 'period of the macroscopic limit cycle',
    'mag.ind.amp': 'amplitude of ⟨c₁⟩ / cycle amplitude', 'mag.ind.n': 'particles per cell (noise level)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'map', caption: 'mag.cap.map' }, { id: 'phase', caption: 'mag.cap.phase' }], hintKey: 'mag.hint' });
  let state, cycle, period, cycAmp;
  const pS = slider({ label: 'mag.s', value: 12, min: 1, max: 20, step: 1, onChange: (v) => { state.s = v; eq.update({ s: v }); } });
  const pSize = numberField({ label: 'mag.size', value: 60, min: 20, max: 120, integer: true });
  const pNmax = select({ label: 'mag.nmax', value: '32', options: ['8', '16', '32', '64', '128'].map((v) => ({ value: v, label: v })) });
  const pInit = select({ label: 'mag.init', value: 'uniform', options: [{ value: 'uniform', label: 'mag.init.uniform' }, { value: 'random', label: 'mag.init.random' }] });
  const pShow = select({ label: 'mag.show', value: '1', options: [{ value: '1', label: 'mag.show.1' }, { value: '2', label: 'mag.show.2' }, { value: 'diff', label: 'mag.show.diff' }], onChange: () => draw() });
  const pTone = slider({ label: 'mag.tone', value: 1, min: 0.3, max: 3, step: 0.1, format: (v) => v.toFixed(1), onChange: () => draw() });
  ui.params.append(pSize.el, pNmax.el, pS.el, pInit.el, pShow.el, pTone.el);

  const map = new Plot(ui.canvas.map, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
  const phase = new Plot(ui.canvas.phase, { axes: true, xlabel: 'c₁', ylabel: 'c₂' });
  let off, img;
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: '\\partial_t c_1 = c_1 - \\tfrac13 c_1^3 - c_2 + D\\nabla^2 c_1', slots: {} },
      { tex: '\\partial_t c_2 = \\frac{c_1 - \\htmlId{k}{k}\\,c_2}{\\htmlId{c}{c}} + D\\nabla^2 c_2,\\qquad D \\propto \\htmlId{s}{s}', slots: { k: { label: 'mag.eq.k' }, c: { label: 'mag.eq.c' }, s: { label: 'mag.eq.s' } } },
      { tex: 'T_{\\rm ciclo} = \\htmlId{T}{T}', slots: { T: { label: 'mag.eq.T' } } },
    ],
    indicators: [{ key: 'amp', label: 'mag.ind.amp' }, { key: 'n', label: 'mag.ind.n' }],
  });

  function reset() {
    const n = pSize.get(), nmax = Number(pNmax.get());
    state = M.createCA({ nx: n, ny: n, s: pS.get(), nmax, dt: 0.1, init: pInit.get() });
    cycle = M.limitCycle({ skip: 300, keep: 60 }); period = M.cyclePeriod(cycle);
    cycAmp = Math.max(...cycle.c1) - Math.min(...cycle.c1);
    off = new OffscreenCanvas(n, n); img = off.getContext('2d').createImageData(n, n);
    eq.update({ k: M.PARAMS.k, c: M.PARAMS.c, s: state.s, T: period });
    eq.setIndicator('n', nmax);
  }
  function step() { M.stepCA(state); }
  function drawMap() {
    const { nx, ny, nmax, n1, n2 } = state, px = img.data, mode = pShow.get(), tone = pTone.get();
    for (let i = 0; i < nx * ny; i++) {
      let v;
      if (mode === '1') v = n1[i] / nmax; else if (mode === '2') v = n2[i] / nmax; else v = 0.5 + (n1[i] - n2[i]) / nmax / 2;
      v = 0.5 + (v - 0.5) * tone; const g = Math.max(0, Math.min(255, Math.round(255 * v)));
      const o = i * 4; px[o] = mode === '2' ? Math.round(g * 0.85) : g; px[o + 1] = mode === 'diff' ? Math.round(g * 0.9) : g; px[o + 2] = mode === '1' ? Math.round(255 - (255 - g) * 0.85) : g; px[o + 3] = 255;
    }
    off.getContext('2d').putImageData(img, 0, 0);
    map.clear(); map.ctx.imageSmoothingEnabled = false; map.drawImage(off, 0, 0, 1, 1); map.end();
  }
  function drawPhase() {
    phase.setScales(-2.4, 2.4, -1.6, 1.6); phase.clear();
    phase.color('#999'); phase.line(-2.4, 0, 2.4, 0); phase.line(0, -1.6, 0, 1.6);
    phase.color('#1f4e9c'); phase.lineWidth(2); phase.polyline(Array.from(cycle.c1), Array.from(cycle.c2)); phase.lineWidth(1);
    const tr = state.trail, from = Math.max(0, tr.length - Math.round(3 * period / state.dt));
    const xs = [], ys = []; for (let i = from; i < tr.length; i++) { xs.push(tr[i][0]); ys.push(tr[i][1]); }
    phase.color('rgba(181,40,30,0.85)'); phase.lineWidth(1.5); if (xs.length > 1) phase.polyline(xs, ys); phase.lineWidth(1);
    if (xs.length) { phase.color('#b5281e'); phase.disk(xs[xs.length - 1], ys[ys.length - 1], 0.05); }
    phase.end();
    const last = tr.slice(Math.max(0, tr.length - Math.round(period / state.dt))).map((v) => v[0]);
    const amp = last.length > 5 ? Math.max(...last) - Math.min(...last) : NaN;
    const [c1, c2] = M.meanConc(state);
    ui.readout.textContent = i18n.t('mag.readout', { t: state.t.toFixed(1), c1: c1.toFixed(3), c2: c2.toFixed(3), T: period.toFixed(1), amp: Number.isNaN(amp) ? '–' : amp.toFixed(2) });
    const ratio = amp / cycAmp;
    eq.setIndicator('amp', ratio, Number.isNaN(ratio) ? 'none' : ratio > 0.7 ? 'ok' : 'warn');
  }
  function draw() { drawMap(); drawPhase(); }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: -2, speedMax: 8 }).el);
  reset();
  const offR = autoResize([map, phase], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); offR(); root.replaceChildren(); } };
}
