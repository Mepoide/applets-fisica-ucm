// Hard disks and the Maxwell distribution — mountable applet.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { histogram } from '../../lib/stats.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as M from './model.js';

export const meta = { slug: 'maxwell', titleKey: 'maxwell.title', legacyPath: 'HDA_MAXWELL_FINAL.JAVA', extra: true };

i18n.register({
  es: {
    'maxwell.title': 'Discos duros y distribución de Maxwell',
    'maxwell.N': 'Partículas (1–300)', 'maxwell.dist': 'Distribución inicial', 'maxwell.radius': 'Radio',
    'maxwell.avg': 'Promediar histograma en el tiempo',
    'maxwell.dist.angle': 'Módulo 1, ángulo aleatorio', 'maxwell.dist.vxvy': 'Módulo aleatorio en [0,1], ángulo aleatorio',
    'maxwell.dist.vyRandomVxFixed': 'vx = 1, vy aleatoria', 'maxwell.dist.fixed': 'Todas con vx = vy = 1',
    'maxwell.cap.box': 'Caja con N discos duros. Las colisiones son elásticas y se resuelven en el instante exacto.',
    'maxwell.cap.hist': 'Histograma del módulo de la velocidad (rojo) y distribución de Maxwell 2D con la misma energía (azul).',
    'maxwell.readout': 't = {t} · kT = {kT} · colisiones por partícula = {cpp} · colisiones con paredes = {nw}',
    'maxwell.hint': 'Prueba la distribución "Todas con vx = vy = 1": al principio no hay colisiones entre discos (misma velocidad) y es el choque con las paredes el que rompe la simetría. Activa el promedio temporal para ver la convergencia a Maxwell.',
    'maxwell.legend.hist': 'N(v) instantáneo', 'maxwell.legend.avg': 'N(v) promediado', 'maxwell.legend.maxwell': 'Maxwell 2D',
    'maxwell.eq.kT': 'temperatura cinética medida, kT = ⟨½mv²⟩', 'maxwell.eq.N': 'número de discos',
    'maxwell.ind.cpp': 'colisiones por partícula',
  },
  en: {
    'maxwell.title': 'Hard disks and the Maxwell distribution',
    'maxwell.N': 'Particles (1–300)', 'maxwell.dist': 'Initial distribution', 'maxwell.radius': 'Radius',
    'maxwell.avg': 'Time-average the histogram',
    'maxwell.dist.angle': 'Speed 1, random angle', 'maxwell.dist.vxvy': 'Random speed in [0,1], random angle',
    'maxwell.dist.vyRandomVxFixed': 'vx = 1, random vy', 'maxwell.dist.fixed': 'All with vx = vy = 1',
    'maxwell.cap.box': 'Box with N hard disks. Collisions are elastic and resolved at their exact time.',
    'maxwell.cap.hist': 'Speed histogram (red) and the 2D Maxwell distribution with the same energy (blue).',
    'maxwell.readout': 't = {t} · kT = {kT} · collisions per particle = {cpp} · wall collisions = {nw}',
    'maxwell.hint': 'Try "All with vx = vy = 1": at first there are no disk–disk collisions (identical velocities) and the walls are what break the symmetry. Turn on time averaging to see the convergence to Maxwell.',
    'maxwell.legend.hist': 'instantaneous N(v)', 'maxwell.legend.avg': 'time-averaged N(v)', 'maxwell.legend.maxwell': '2D Maxwell',
    'maxwell.eq.kT': 'measured kinetic temperature, kT = ⟨½mv²⟩', 'maxwell.eq.N': 'number of disks',
    'maxwell.ind.cpp': 'collisions per particle',
  },
});

const BINS = 20;

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, {
    canvases: [{ id: 'box', caption: 'maxwell.cap.box' }, { id: 'hist', caption: 'maxwell.cap.hist' }],
    hintKey: 'maxwell.hint',
  });
  let state, kT, vmax, acc = new Float64Array(BINS), frames = 0;

  const pN = numberField({ label: 'maxwell.N', value: 80, min: 1, max: 300, integer: true });
  const pDist = select({ label: 'maxwell.dist', value: 'angle', options: M.DISTRIBUTIONS.map((d) => ({ value: d, label: `maxwell.dist.${d}` })) });
  const pR = numberField({ label: 'maxwell.radius', value: 4, min: 1, max: 10, step: 0.5 });
  const pAvg = checkbox({ label: 'maxwell.avg', checked: false, onChange: () => { acc.fill(0); frames = 0; draw(); } });
  ui.params.append(pN.el, pDist.el, pR.el, pAvg.el);

  const box = new Plot(ui.canvas.box, { xmin: 0, xmax: 200, ymin: 0, ymax: 200 });
  const hist = new Plot(ui.canvas.hist, { axes: true, xlabel: 'v', ylabel: 'N(v)' });

  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'f(v)\\,dv = \\frac{m v}{\\htmlId{kT}{kT}}\\,e^{-m v^2/(2\\cdot\\htmlId{kT2}{kT})}\\,dv', slots: { kT: { label: 'maxwell.eq.kT' }, kT2: { label: 'maxwell.eq.kT' } } },
      { tex: '\\htmlId{kT3}{kT} = \\big\\langle \\tfrac12 m v^2 \\big\\rangle,\\qquad N = \\htmlId{N}{N}', slots: { kT3: { label: 'maxwell.eq.kT' }, N: { label: 'maxwell.eq.N' } } },
    ],
    indicators: [{ key: 'chi2', label: 'ind.chi2' }, { key: 'cpp', label: 'maxwell.ind.cpp' }],
  });

  function reset() {
    state = M.create({ N: pN.get(), radius: pR.get(), dist: pDist.get(), L: 200 });
    kT = M.kineticTemperature(state); vmax = M.vmaxFor(kT);
    acc = new Float64Array(BINS); frames = 0;
    hist.setScales(0, vmax, 0, Math.max(5, Math.ceil(state.N * 0.22 / 5) * 5));
    eq.update({ kT, kT2: kT, kT3: kT, N: state.N });
  }
  function step() {
    M.step(state);
    if (pAvg.get()) { const h = histogram(M.speeds(state), 0, vmax, BINS); for (let b = 0; b < BINS; b++) acc[b] += h[b]; frames++; }
  }
  function chi2(obs, exp) {
    let s = 0, k = 0;
    for (let b = 0; b < obs.length; b++) if (exp[b] >= 5) { s += (obs[b] - exp[b]) ** 2 / exp[b]; k++; }
    return k > 1 ? s / (k - 1) : NaN;
  }
  function draw() {
    box.clear();
    box.color('#1f4e9c');
    for (let i = 0; i < state.N; i++) box.disk(state.x[i], state.y[i], state.radius);
    box.end();

    hist.clear();
    const dv = vmax / BINS;
    const h = histogram(M.speeds(state), 0, vmax, BINS);
    const shown = pAvg.get() && frames ? Array.from(acc, (a) => a / frames) : Array.from(h);
    hist.color('rgba(181,40,30,0.75)');
    for (let b = 0; b < BINS; b++) hist.bar(b * dv, (b + 1) * dv, shown[b]);
    const expected = M.maxwellBinCounts(state.N, kT, state.m, vmax, BINS);
    hist.color('#1f4e9c'); hist.lineWidth(2);
    const xs = [], ys = [];
    for (let b = 0; b <= 80; b++) { const v = vmax * b / 80; xs.push(v); ys.push(state.N * dv * M.maxwell2D(v, kT, state.m)); }
    hist.polyline(xs, ys); hist.lineWidth(1);
    hist.color('#222');
    hist.label(6, 4, (pAvg.get() ? i18n.t('maxwell.legend.avg') : i18n.t('maxwell.legend.hist')) + ' / ' + i18n.t('maxwell.legend.maxwell'));
    hist.end();
    const c2 = chi2(shown, expected);
    eq.setIndicator('chi2', c2, Number.isNaN(c2) ? 'none' : c2 < 2 ? 'ok' : 'warn');
    eq.setIndicator('cpp', M.collisionsPerParticle(state));
    ui.readout.textContent = i18n.t('maxwell.readout', {
      t: state.t.toFixed(0), kT: kT.toFixed(3), cpp: M.collisionsPerParticle(state).toFixed(2), nw: state.nwall,
    });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset();
  const offResize = autoResize([box, hist], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); offResize(); root.replaceChildren(); } };
}
