// Boson and fermion statistics — Statistical Physics experiment 10.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, slider, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as BF from './model.js';

export const meta = { slug: 'bosefermi', titleKey: 'bf.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'bf.N': 'Partículas N (1–20)', 'bf.kT': 'Temperatura kT (niveles equiespaciados, ε_i = i)',
    'bf.cap.bose': 'Bosones: ocupación de cada nivel. Puntos: configuración instantánea del Monte Carlo. Rojo: ocupación media acumulada. Azul: colectividad canónica exacta (N fijo). Gris punteado: fórmula de Bose–Einstein gran canónica.',
    'bf.cap.fermi': 'Fermiones: lo mismo con el principio de exclusión. A baja temperatura se llenan los N primeros niveles hasta el nivel de Fermi ε_F = N − 1 (línea verde).',
    'bf.readout': 't = {t} barridos · bosones en el fundamental = {g0} ({f0} %) · fermiones: ε_F = {eF} · energía media bosones {Eb}, fermiones {Ef} · fugacidad z_B = {zB}, z_F = {zF}',
    'bf.hint': 'Baja kT a 0.2: los bosones se apilan en el nivel fundamental (condensación de Bose) mientras los fermiones forman la escalera hasta ε_F. Sube kT a 10: ambas estadísticas se confunden con la de Boltzmann. Fíjate en que, con solo 10 partículas, la fórmula gran canónica (gris) exagera la ocupación bosónica del fundamental: la canónica exacta (azul) es la que reproduce el Monte Carlo.',
    'bf.eq.N': 'número de partículas', 'bf.eq.kT': 'temperatura', 'bf.eq.zB': 'fugacidad bosónica (z < 1)', 'bf.eq.zF': 'fugacidad fermiónica', 'bf.eq.eF': 'nivel de Fermi (último nivel lleno a T = 0)', 'bf.eq.g0': 'ocupación media del nivel fundamental bosónico (MC)',
    'bf.ind.bose': 'error máximo MC vs canónica (bosones)', 'bf.ind.fermi': 'error máximo MC vs canónica (fermiones)',
  },
  en: {
    'bf.N': 'Particles N (1–20)', 'bf.kT': 'Temperature kT (equally spaced levels, ε_i = i)',
    'bf.cap.bose': 'Bosons: occupation of each level. Dots: instantaneous Monte Carlo configuration. Red: accumulated mean occupation. Blue: exact canonical ensemble (fixed N). Dotted grey: grand-canonical Bose–Einstein formula.',
    'bf.cap.fermi': 'Fermions: the same with the exclusion principle. At low temperature the first N levels fill up to the Fermi level ε_F = N − 1 (green line).',
    'bf.readout': 't = {t} sweeps · bosons in the ground state = {g0} ({f0} %) · fermions: ε_F = {eF} · mean energy bosons {Eb}, fermions {Ef} · fugacity z_B = {zB}, z_F = {zF}',
    'bf.hint': 'Lower kT to 0.2: bosons pile up in the ground level (Bose condensation) while fermions form the staircase up to ε_F. Raise kT to 10: both statistics merge into Boltzmann\'s. Note that with only 10 particles the grand-canonical formula (grey) overstates the bosonic ground-state occupation: the exact canonical one (blue) is what the Monte Carlo reproduces.',
    'bf.eq.N': 'number of particles', 'bf.eq.kT': 'temperature', 'bf.eq.zB': 'bosonic fugacity (z < 1)', 'bf.eq.zF': 'fermionic fugacity', 'bf.eq.eF': 'Fermi level (last filled level at T = 0)', 'bf.eq.g0': 'mean ground-level bosonic occupation (MC)',
    'bf.ind.bose': 'max error MC vs canonical (bosons)', 'bf.ind.fermi': 'max error MC vs canonical (fermions)',
  },
});

const LEVELS = 30;

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'bose', caption: 'bf.cap.bose' }, { id: 'fermi', caption: 'bf.cap.fermi' }], hintKey: 'bf.hint' });
  let sb, sf, kT = 1;
  const pN = numberField({ label: 'bf.N', value: 10, min: 1, max: 20, integer: true });
  const pkT = slider({ label: 'bf.kT', value: 0, min: -0.7, max: 1, step: 0.02, format: (v) => (10 ** v).toFixed(2), onChange: (v) => { kT = 10 ** v; sb.kT = kT; sf.kT = kT; BF.resetHist(sb); BF.resetHist(sf); theory(); draw(); } });
  ui.params.append(pN.el, pkT.el);
  const pb = new Plot(ui.canvas.bose, { axes: true, xlabel: '⟨n⟩', ylabel: 'ε' });
  const pf = new Plot(ui.canvas.fermi, { axes: true, xlabel: '⟨n⟩', ylabel: 'ε' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'B',
    equations: [
      { tex: '\\langle n_i\\rangle_{\\rm BE} = \\frac{1}{z^{-1}e^{\\varepsilon_i/kT} - 1},\\quad \\langle n_i\\rangle_{\\rm FD} = \\frac{1}{z^{-1}e^{\\varepsilon_i/kT} + 1},\\qquad \\sum_i \\langle n_i\\rangle = \\htmlId{N}{N}', slots: { N: { label: 'bf.eq.N' } } },
      { tex: 'kT = \\htmlId{kT}{kT},\\quad z_B = \\htmlId{zB}{z_B},\\quad z_F = \\htmlId{zF}{z_F},\\quad \\varepsilon_F = N-1 = \\htmlId{eF}{\\varepsilon_F},\\quad \\langle n_0\\rangle_B^{\\rm MC} = \\htmlId{g0}{n_0}', slots: { kT: { label: 'bf.eq.kT' }, zB: { label: 'bf.eq.zB' }, zF: { label: 'bf.eq.zF' }, eF: { label: 'bf.eq.eF' }, g0: { label: 'bf.eq.g0' } } },
    ],
    indicators: [{ key: 'bose', label: 'bf.ind.bose' }, { key: 'fermi', label: 'bf.ind.fermi' }],
  });
  let th = null;
  function theory() {
    const N = sb.N;
    th = { gcB: BF.meanOccupations(N, kT, 'bose', LEVELS), gcF: BF.meanOccupations(N, kT, 'fermi', LEVELS), cB: BF.canonicalOccupations(N, kT, 'bose', LEVELS), cF: BF.canonicalOccupations(N, kT, 'fermi', LEVELS) };
    eq.update({ N, kT, zB: th.gcB.z, zF: th.gcF.z, eF: N - 1 });
  }
  function reset() { kT = 10 ** pkT.get(); sb = BF.createMC({ N: pN.get(), kT, stat: 'bose', levels: LEVELS }); sf = BF.createMC({ N: pN.get(), kT, stat: 'fermi', levels: LEVELS }); theory(); }
  function step() { BF.sweep(sb); BF.sweep(sf); }
  function drawOne(plot, s, can, gc, fermi) {
    const N = s.N, xmax = Math.max(1.2, fermi ? 1.2 : Math.min(N, Math.max(...can) * 1.15)), ymax = Math.min(LEVELS, Math.max(8, N + 2 + 4 * kT));
    plot.setScales(0, xmax, -0.5, ymax); plot.clear();
    for (let i = 0; i < ymax; i++) { plot.color('#e6e6e6'); plot.line(0, i, xmax, i); }
    if (fermi) { plot.color('rgba(40,160,60,0.7)'); plot.line(0, N - 1, xmax, N - 1); }
    const h = BF.meanHist(s);
    plot.color('rgba(181,40,30,0.55)'); for (let i = 0; i < ymax; i++) if (h[i] > 0) plot.bar(0, h[i], i + 0.35, i - 0.35);
    plot.ctx.setLineDash([3, 3]); plot.color('#888'); plot.lineWidth(1.5); plot.polyline(Array.from(gc.n.subarray(0, Math.ceil(ymax))), Array.from({ length: Math.ceil(ymax) }, (_, i) => i)); plot.ctx.setLineDash([]);
    plot.color('#1f4e9c'); plot.lineWidth(2); plot.polyline(Array.from(can.subarray(0, Math.ceil(ymax))), Array.from({ length: Math.ceil(ymax) }, (_, i) => i)); plot.lineWidth(1);
    plot.color(fermi ? '#c87814' : '#1f4e9c');
    for (let i = 0; i < ymax; i++) for (let k = 0; k < s.occ[i]; k++) plot.disk(0.1 + 0.18 * k * (xmax / 2), i, 0.012 * xmax * 4);
    plot.end();
    let err = 0; if (s.nAcc > 20) for (let i = 0; i < Math.min(LEVELS, N + 10); i++) err = Math.max(err, Math.abs(h[i] - can[i]));
    return s.nAcc > 20 ? err : NaN;
  }
  function draw() {
    const eb = drawOne(pb, sb, th.cB, th.gcB, false), ef = drawOne(pf, sf, th.cF, th.gcF, true);
    const hb = BF.meanHist(sb);
    ui.readout.textContent = i18n.t('bf.readout', { t: sb.t, g0: sb.nAcc ? hb[0].toFixed(2) : '–', f0: sb.nAcc ? (100 * hb[0] / sb.N).toFixed(0) : '–', eF: sb.N - 1, Eb: BF.energy(sb).toFixed(1), Ef: BF.energy(sf).toFixed(1), zB: th.gcB.z.toFixed(3), zF: th.gcF.z.toExponential(2) });
    eq.update({ g0: sb.nAcc ? hb[0] : NaN });
    eq.setIndicator('bose', eb, Number.isNaN(eb) ? 'none' : eb < 0.3 ? 'ok' : 'warn'); eq.setIndicator('fermi', ef, Number.isNaN(ef) ? 'none' : ef < 0.1 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 5 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 100 }).el);
  reset();
  const off = autoResize([pb, pf], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
