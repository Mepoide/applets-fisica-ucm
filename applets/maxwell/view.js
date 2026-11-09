import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, checkbox, loopControls } from '../../lib/ui.js';
import { setupPage, autoResize } from '../../lib/page.js';
import { histogram } from '../../lib/stats.js';
import * as M from './model.js';

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
  },
});
setupPage({ slug: 'maxwell', titleKey: 'maxwell.title', legacyPath: 'HDA_MAXWELL_FINAL.JAVA' });

const BINS = 20;
let state, kT, vmax, acc = new Float64Array(BINS), frames = 0;

const pN = numberField({ label: 'maxwell.N', value: 80, min: 1, max: 300, integer: true });
const pDist = select({ label: 'maxwell.dist', value: 'angle', options: M.DISTRIBUTIONS.map((d) => ({ value: d, label: `maxwell.dist.${d}` })) });
const pR = numberField({ label: 'maxwell.radius', value: 4, min: 1, max: 10, step: 0.5 });
const pAvg = checkbox({ label: 'maxwell.avg', checked: false, onChange: () => { acc.fill(0); frames = 0; draw(); } });
document.getElementById('params').append(pN.el, pDist.el, pR.el, pAvg.el);

const box = new Plot(document.getElementById('box'), { xmin: 0, xmax: 200, ymin: 0, ymax: 200 });
const hist = new Plot(document.getElementById('hist'), { axes: true, xlabel: 'v', ylabel: 'N(v)' });

function reset() {
  state = M.create({ N: pN.get(), radius: pR.get(), dist: pDist.get(), L: 200 });
  kT = M.kineticTemperature(state); vmax = M.vmaxFor(kT);
  acc = new Float64Array(BINS); frames = 0;
  hist.setScales(0, vmax, 0, Math.max(5, Math.ceil(state.N * 0.22 / 5) * 5));
}
function step() {
  M.step(state);
  if (pAvg.get()) { const h = histogram(M.speeds(state), 0, vmax, BINS); for (let b = 0; b < BINS; b++) acc[b] += h[b]; frames++; }
}
function draw() {
  box.clear();
  box.color('#1f4e9c');
  for (let i = 0; i < state.N; i++) box.disk(state.x[i], state.y[i], state.radius);
  box.end();

  hist.clear();
  const dv = vmax / BINS;
  const h = histogram(M.speeds(state), 0, vmax, BINS);
  hist.color('rgba(181,40,30,0.75)');
  for (let b = 0; b < BINS; b++) hist.bar(b * dv, (b + 1) * dv, pAvg.get() && frames ? acc[b] / frames : h[b]);
  const expected = M.maxwellBinCounts(state.N, kT, state.m, vmax, BINS);
  hist.color('#1f4e9c'); hist.lineWidth(2);
  const xs = [], ys = [];
  for (let b = 0; b <= 80; b++) { const v = vmax * b / 80; xs.push(v); ys.push(state.N * dv * M.maxwell2D(v, kT, state.m)); }
  hist.polyline(xs, ys); hist.lineWidth(1);
  hist.color('#222');
  hist.label(6, 4, (pAvg.get() ? i18n.t('maxwell.legend.avg') : i18n.t('maxwell.legend.hist')) + ' / ' + i18n.t('maxwell.legend.maxwell'));
  hist.end();
  void expected;
  document.getElementById('readout').textContent = i18n.t('maxwell.readout', {
    t: state.t.toFixed(0), kT: kT.toFixed(3), cpp: M.collisionsPerParticle(state).toFixed(2), nw: state.nwall,
  });
}
const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
document.getElementById('loopctl').append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
reset();
autoResize([box, hist], draw);
