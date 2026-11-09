// Ising model — Statistical Physics experiment 11. Metropolis Monte Carlo on an L×L torus.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { select, slider, button, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as Is from './model.js';

export const meta = { slug: 'ising', titleKey: 'ising.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'ising.L': 'Tamaño de la red', 'ising.init': 'Estado inicial', 'ising.init.random': 'Aleatorio', 'ising.init.down': 'Todos −1', 'ising.K': 'Acoplamiento K = J/k_BT', 'ising.clear': 'Borrar promedio',
    'ising.cap.spins': 'Espines +1 (amarillo) y −1 (azul) en una red L×L periódica. Cada paso es un barrido Monte Carlo (L² intentos de inversión con la regla de Metrópolis).',
    'ising.cap.mag': 'Magnetización por espín m(t) (rojo) y su promedio en valor absoluto (línea roja gruesa). Azul: magnetización espontánea exacta de Onsager para este K. Línea verde: K_c = 0.4407.',
    'ising.readout': 't = {t} barridos · K = {K} (T/T_c = {TTc}) · m = {m} · ⟨|m|⟩ = {mabs} · Onsager m₀ = {m0} · energía por espín = {E}',
    'ising.hint': 'A K < K_c (alta temperatura) los dominios son pequeños y m fluctúa en torno a cero. A K > K_c aparece un dominio mayoritario y |m| se acerca a la curva de Onsager, tanto mejor cuanto mayor es L. Cerca de K_c la relajación es lentísima (ralentización crítica) y los dominios tienen todos los tamaños: muévete despacio por el deslizador y mira cómo cambia la textura.',
    'ising.eq.K': 'acoplamiento J/k_BT', 'ising.eq.Kc': 'acoplamiento crítico ½ln(1+√2)', 'ising.eq.m0': 'magnetización espontánea de Onsager', 'ising.eq.mabs': 'promedio de |m| medido', 'ising.eq.L': 'lado de la red',
    'ising.ind.err': '|⟨|m|⟩ − m₀|', 'ising.ind.phase': 'fase (T/T_c)',
  },
  en: {
    'ising.L': 'Lattice size', 'ising.init': 'Initial state', 'ising.init.random': 'Random', 'ising.init.down': 'All −1', 'ising.K': 'Coupling K = J/k_BT', 'ising.clear': 'Clear average',
    'ising.cap.spins': 'Spins +1 (yellow) and −1 (blue) on a periodic L×L lattice. Each step is one Monte Carlo sweep (L² flip attempts with the Metropolis rule).',
    'ising.cap.mag': 'Magnetisation per spin m(t) (red) and its absolute-value average (thick red line). Blue: Onsager\'s exact spontaneous magnetisation for this K. Green line: K_c = 0.4407.',
    'ising.readout': 't = {t} sweeps · K = {K} (T/T_c = {TTc}) · m = {m} · ⟨|m|⟩ = {mabs} · Onsager m₀ = {m0} · energy per spin = {E}',
    'ising.hint': 'At K < K_c (high temperature) domains are small and m fluctuates around zero. At K > K_c a majority domain appears and |m| approaches Onsager\'s curve, the better the larger L. Near K_c relaxation is extremely slow (critical slowing down) and domains come in all sizes: move the slider slowly and watch the texture change.',
    'ising.eq.K': 'coupling J/k_BT', 'ising.eq.Kc': 'critical coupling ½ln(1+√2)', 'ising.eq.m0': 'Onsager spontaneous magnetisation', 'ising.eq.mabs': 'measured average of |m|', 'ising.eq.L': 'lattice side',
    'ising.ind.err': '|⟨|m|⟩ − m₀|', 'ising.ind.phase': 'phase (T/T_c)',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'spins', caption: 'ising.cap.spins' }, { id: 'mag', caption: 'ising.cap.mag' }], hintKey: 'ising.hint' });
  let st, off, img, mabsAcc = 0, mabsN = 0;
  const pL = select({ label: 'ising.L', value: '64', options: ['16', '32', '64', '128'].map((v) => ({ value: v, label: v })) });
  const pInit = select({ label: 'ising.init', value: 'random', options: [{ value: 'random', label: 'ising.init.random' }, { value: 'down', label: 'ising.init.down' }] });
  const pK = slider({ label: 'ising.K', value: 0.44, min: 0.2, max: 0.8, step: 0.005, format: (v) => v.toFixed(3), onChange: (v) => { Is.setK(st, v); mabsAcc = 0; mabsN = 0; theory(); draw(); } });
  const bClear = button({ label: 'ising.clear', onClick: () => { mabsAcc = 0; mabsN = 0; draw(); } });
  ui.params.append(pL.el, pInit.el, pK.el, bClear.el);
  const spins = new Plot(ui.canvas.spins, { xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
  const mag = new Plot(ui.canvas.mag, { axes: true, xlabel: 't', ylabel: 'm' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'H = -J\\sum_{\\langle ij\\rangle} s_i s_j,\\qquad K = \\frac{J}{k_BT} = \\htmlId{K}{K},\\quad K_c = \\tfrac12\\ln(1+\\sqrt2) = \\htmlId{Kc}{K_c}', slots: { K: { label: 'ising.eq.K' }, Kc: { label: 'ising.eq.Kc' } } },
      { tex: 'm_0 = \\big(1 - \\sinh^{-4} 2K\\big)^{1/8} = \\htmlId{m0}{m_0}\\ (K > K_c),\\qquad \\langle |m| \\rangle_{\\rm MC} = \\htmlId{mabs}{\\langle|m|\\rangle},\\quad L = \\htmlId{L}{L}', slots: { m0: { label: 'ising.eq.m0' }, mabs: { label: 'ising.eq.mabs' }, L: { label: 'ising.eq.L' } } },
    ],
    indicators: [{ key: 'err', label: 'ising.ind.err' }, { key: 'phase', label: 'ising.ind.phase', fmt: (v) => (v < 1 ? `${v.toFixed(2)} ferro` : `${v.toFixed(2)} para`) }],
  });
  function theory() { eq.update({ K: st.K, Kc: Is.KC, m0: Is.onsagerM(st.K), L: st.L }); eq.setIndicator('phase', Is.TC / (1 / st.K) , 'none'); }
  function reset() {
    const L = Number(pL.get());
    st = Is.create({ L, K: pK.get(), init: pInit.get() });
    off = new OffscreenCanvas(L, L); img = off.getContext('2d').createImageData(L, L);
    mabsAcc = 0; mabsN = 0; theory();
  }
  function step() { Is.sweep(st); mabsAcc += Math.abs(Is.magnetization(st)); mabsN++; }
  function draw() {
    const { L, s } = st, px = img.data;
    for (let i = 0; i < s.length; i++) { const o = i * 4; if (s[i] > 0) { px[o] = 240; px[o + 1] = 180; px[o + 2] = 40; } else { px[o] = 31; px[o + 1] = 78; px[o + 2] = 156; } px[o + 3] = 255; }
    off.getContext('2d').putImageData(img, 0, 0);
    spins.clear(); spins.ctx.imageSmoothingEnabled = false; spins.drawImage(off, 0, 0, 1, 1); spins.end();
    const h = st.history, win = 600, from = Math.max(0, st.t - win);
    mag.setScales(from, from + win, -1.05, 1.05); mag.clear();
    mag.color('#999'); mag.line(from, 0, from + win, 0);
    const m0 = Is.onsagerM(st.K);
    if (m0 > 0) { mag.color('#1f4e9c'); mag.lineWidth(2); mag.line(from, m0, from + win, m0); mag.line(from, -m0, from + win, -m0); mag.lineWidth(1); }
    const xs = [], ys = []; for (let i = Math.max(0, h.length - win); i < h.length; i++) { xs.push(h[i][0]); ys.push(h[i][1]); }
    mag.color('rgba(181,40,30,0.85)'); if (xs.length > 1) mag.polyline(xs, ys);
    if (mabsN) { const mabs = mabsAcc / mabsN; mag.color('#b5281e'); mag.lineWidth(3); mag.line(from, mabs, from + win, mabs); mag.lineWidth(1); }
    mag.end();
    const m = Is.magnetization(st), mabs = mabsN ? mabsAcc / mabsN : NaN, TTc = (1 / st.K) / Is.TC;
    ui.readout.textContent = i18n.t('ising.readout', { t: st.t, K: st.K.toFixed(3), TTc: TTc.toFixed(3), m: m.toFixed(3), mabs: Number.isNaN(mabs) ? '–' : mabs.toFixed(3), m0: m0.toFixed(3), E: Is.energyPerSpin(st).toFixed(3) });
    eq.update({ mabs });
    const err = Math.abs(mabs - m0);
    eq.setIndicator('err', mabsN > 50 ? err : NaN, mabsN <= 50 ? 'none' : err < 0.05 ? 'ok' : 'warn');
    eq.setIndicator('phase', TTc, 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 20 }).el);
  reset();
  const offR = autoResize([spins, mag], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); offR(); root.replaceChildren(); } };
}
