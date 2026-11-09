// Electron scattering in a linear lattice — Solid State experiment 5.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as D from '../_schrod/delta.js';

export const meta = { slug: 'dispersion-red', titleKey: 'disp.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'disp.N': 'Número de átomos N (1–200)', 'disp.lam': 'Intensidad λ de cada potencial δ', 'disp.L': 'Distancia entre átomos L', 'disp.Emax': 'Energía máxima',
    'disp.cap.T': 'Coeficiente de transmisión T(E) de un electrón a través de la cadena finita de N potenciales δ. Sombreado azul: bandas permitidas de la cadena infinita (Kronig–Penney). Dentro de cada banda hay N − 1 resonancias con T = 1.',
    'disp.cap.kp': 'Relación de dispersión de la cadena infinita: cos(kL) = cos(qL) + (λ/2q) sin(qL). Donde la curva sale de [−1, 1] no hay momento cristalino real: gap. Abajo, E(k) en la primera zona de Brillouin.',
    'disp.readout': 'N = {N} · λ = {lam} · L = {L} · bandas en [0, E_max]: {nb} · bordes: {edges}',
    'disp.hint': 'Con N = 1 ves la transmisión de una sola barrera, T = 1/(1 + λ²/4E). Al añadir átomos aparecen oscilaciones y, con N ≳ 10, se dibujan las bandas: T ≈ 1 dentro y T ≈ 0 fuera, con transiciones cada vez más abruptas. Los gaps están donde |cos(qL) + (λ/2q) sin(qL)| > 1, en torno a qL = nπ (condición de Bragg).',
    'disp.eq.N': 'número de potenciales δ', 'disp.eq.lam': 'intensidad del potencial (unidades ħ²/2m = 1)', 'disp.eq.L': 'periodo de la red', 'disp.eq.nb': 'número de bandas por debajo de E_max',
    'disp.ind.res': 'resonancias con T > 0.99 (esperadas N − 1 por banda)', 'disp.ind.gapT': 'T máxima en el primer gap',
  },
  en: {
    'disp.N': 'Number of atoms N (1–200)', 'disp.lam': 'Strength λ of each δ potential', 'disp.L': 'Atomic spacing L', 'disp.Emax': 'Maximum energy',
    'disp.cap.T': 'Transmission coefficient T(E) of an electron through the finite chain of N δ potentials. Blue shading: allowed bands of the infinite chain (Kronig–Penney). Inside each band there are N − 1 resonances with T = 1.',
    'disp.cap.kp': 'Dispersion relation of the infinite chain: cos(kL) = cos(qL) + (λ/2q) sin(qL). Where the curve leaves [−1, 1] there is no real crystal momentum: gap. Below, E(k) in the first Brillouin zone.',
    'disp.readout': 'N = {N} · λ = {lam} · L = {L} · bands in [0, E_max]: {nb} · edges: {edges}',
    'disp.hint': 'With N = 1 you see the transmission of a single barrier, T = 1/(1 + λ²/4E). Adding atoms produces oscillations and, with N ≳ 10, the bands draw themselves: T ≈ 1 inside and T ≈ 0 outside, with ever sharper transitions. Gaps lie where |cos(qL) + (λ/2q) sin(qL)| > 1, around qL = nπ (Bragg condition).',
    'disp.eq.N': 'number of δ potentials', 'disp.eq.lam': 'potential strength (units ħ²/2m = 1)', 'disp.eq.L': 'lattice period', 'disp.eq.nb': 'number of bands below E_max',
    'disp.ind.res': 'resonances with T > 0.99 (expected N − 1 per band)', 'disp.ind.gapT': 'maximum T in the first gap',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'T', caption: 'disp.cap.T', cls: 'wide' }, { id: 'kp', caption: 'disp.cap.kp' }], hintKey: 'disp.hint' });
  let N = 1, lam = 3, L = 1, Emax = 60, Es, Ts, k = 0, edges = [];
  const pN = numberField({ label: 'disp.N', value: 1, min: 1, max: 200, integer: true });
  const pLam = numberField({ label: 'disp.lam', value: 3, min: -10, max: 20, step: 0.5 });
  const pL = numberField({ label: 'disp.L', value: 1, min: 0.2, max: 3, step: 0.1 });
  const pE = numberField({ label: 'disp.Emax', value: 60, min: 5, max: 400 });
  ui.params.append(pN.el, pLam.el, pL.el, pE.el);
  const pT = new Plot(ui.canvas.T, { axes: true, xlabel: 'E', ylabel: 'T(E)' });
  const pK = new Plot(ui.canvas.kp, { axes: true, xlabel: 'k L / π', ylabel: 'E' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'B',
    equations: [
      { tex: "-\\psi'' + \\htmlId{lam}{\\lambda}\\sum_{n=1}^{\\htmlId{N}{N}}\\delta(x - nL)\\,\\psi = E\\psi,\\qquad L = \\htmlId{L}{L}", slots: { lam: { label: 'disp.eq.lam' }, N: { label: 'disp.eq.N' }, L: { label: 'disp.eq.L' } } },
      { tex: '\\cos kL = \\cos qL + \\frac{\\lambda}{2q}\\sin qL,\\quad q = \\sqrt{E};\\qquad N_{\\rm bandas} = \\htmlId{nb}{n_b}', slots: { nb: { label: 'disp.eq.nb' } } },
    ],
    indicators: [{ key: 'res', label: 'disp.ind.res' }, { key: 'gapT', label: 'disp.ind.gapT', fmt: (v) => (Number.isNaN(v) ? '—' : v.toExponential(1)) }],
  });
  function reset() {
    N = pN.get(); lam = pLam.get(); L = pL.get(); Emax = pE.get();
    Es = Array.from({ length: 1200 }, (_, i) => 0.02 + (Emax - 0.02) * i / 1199); Ts = new Float64Array(Es.length).fill(NaN); k = 0;
    edges = D.bandEdges(lam, L, lam < 0 ? -lam * lam / 4 - 1 : 0.001, Emax);
    eq.update({ lam, N, L, nb: Math.ceil(edges.length / 2) });
  }
  function step() { if (k >= Es.length) { loop.pause(); return; } const x = Float64Array.from({ length: N }, (_, i) => (i + 1) * L), lv = new Float64Array(N).fill(lam); for (let j = 0; j < 60 && k < Es.length; j++, k++) Ts[k] = D.transmission(lv, x, Es[k]); }
  function draw() {
    pT.setScales(0, Emax, 0, 1.05); pT.clear();
    pT.color('rgba(31,78,156,0.12)');
    for (let i = 0; i + 1 < edges.length + 1; i += 2) { const a = edges[i] ?? 0, b = edges[i + 1] ?? Emax; if (D.inBand(0.5 * (Math.max(0, a) + Math.min(Emax, b)), lam, L)) pT.bar(Math.max(0, a), Math.min(Emax, b), 1.05); }
    const xs = [], ys = []; for (let i = 0; i < k; i++) { xs.push(Es[i]); ys.push(Ts[i]); }
    pT.color('rgba(181,40,30,0.9)'); pT.lineWidth(1.5); if (xs.length > 1) pT.polyline(xs, ys); pT.lineWidth(1);
    pT.end();
    pK.setScales(0, 1, 0, Emax); pK.clear();
    const kk = [], ee = [];
    for (let i = 0; i < 1200; i++) { const E = Emax * i / 1199, kb = D.blochK(E, lam, L); if (!Number.isNaN(kb)) { kk.push(kb); ee.push(E); } }
    pK.color('#1f4e9c'); for (let i = 0; i < kk.length; i++) pK.disk(kk[i], ee[i], 0.004);
    pK.color('#999'); pK.ctx.setLineDash([3, 3]); for (let i = 0; i < 600; i++) { } pK.ctx.setLineDash([]);
    pK.end();
    let res = 0; for (let i = 1; i < k - 1; i++) if (Ts[i] > 0.99 && Ts[i] >= Ts[i - 1] && Ts[i] >= Ts[i + 1]) res++;
    let gapT = NaN; if (edges.length >= 3 && edges[1] > 0) { gapT = 0; for (let i = 0; i < k; i++) if (Es[i] > edges[1] && Es[i] < edges[2]) gapT = Math.max(gapT, Ts[i]); }
    ui.readout.textContent = i18n.t('disp.readout', { N, lam, L, nb: Math.ceil(edges.length / 2), edges: edges.map((e) => e.toFixed(2)).join(', ') });
    eq.setIndicator('res', res, k === Es.length ? 'ok' : 'none'); eq.setIndicator('gapT', gapT, Number.isNaN(gapT) ? 'none' : gapT < 1e-2 ? 'ok' : 'warn');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset();
  const off = autoResize([pT, pK], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
