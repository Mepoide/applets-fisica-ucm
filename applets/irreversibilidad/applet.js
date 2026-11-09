// Irreversibility and equilibrium fluctuations — experiment 2. Three views:
// A) free expansion of a hard-disk gas, B) Ehrenfest random model,
// C) occupation fluctuations in a window (the phase-1 applet, embedded).
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation, formatValue } from '../../lib/liveeq.js';
import * as I from './model.js';
import * as Fl from '../fluctuaciones/applet.js';

export const meta = { slug: 'irreversibilidad', titleKey: 'irrev.title', legacyPath: 'HARDDISKSAPPLET_BASE.JAVA', number: 2 };

i18n.register({
  es: {
    'irrev.view': 'Vista', 'irrev.view.gas': 'A · Expansión libre de discos duros', 'irrev.view.ehrenfest': 'B · Modelo aleatorio (Ehrenfest)', 'irrev.view.window': 'C · Fluctuaciones en una ventana',
    'irrev.N': 'Partículas N', 'irrev.kT': 'Temperatura kT', 'irrev.plot': 'Gráfica', 'irrev.plot.series': 'Δ(t) = n_izq − n_dcha', 'irrev.plot.hist': 'Histograma de Δ frente a la binomial',
    'irrev.cap.box': 'Las N partículas empiezan en la mitad izquierda. Al iniciar se retira el tabique (línea discontinua) y el gas se expande. En B no hay dinámica: cada paso se elige una partícula al azar y se cambia de lado.',
    'irrev.cap.plot': 'Rojo: Δ(t). Bandas azules: ±σ y ±3σ con σ_Δ = √N (68 % y 99.7 % del tiempo en equilibrio). En el histograma, barras: medido; azul: binomial exacta.',
    'irrev.readout': 't = {t} · izquierda = {l} · derecha = {r} · Δ = {d} · ⟨Δ⟩ = {mean} · σ_Δ medida = {sd} (teoría √N = {sN}) · |Δ| > 3σ el {f3} % del tiempo · todas a un lado el {fall} %',
    'irrev.hint': 'Con N = 6 verás a menudo las seis partículas en el mismo lado: la "expansión" se invierte sola. Con N = 20 ocurre el 0.0002 % de los pasos; con N = 100 nunca lo verás. La irreversibilidad es cuestión del número de partículas, no de la dinámica. La vista B reproduce las mismas fluctuaciones sin ninguna mecánica.',
    'irrev.eq.N': 'número de partículas', 'irrev.eq.sigma': 'desviación típica de Δ en equilibrio', 'irrev.eq.pall': 'probabilidad de encontrar todas a un lado', 'irrev.eq.sd': 'σ_Δ medida',
    'irrev.ind.ratio': 'σ_Δ medida / √N', 'irrev.ind.all': 'fracción con todas a un lado (teoría 2^{1−N})',
  },
  en: {
    'irrev.view': 'View', 'irrev.view.gas': 'A · Free expansion of hard disks', 'irrev.view.ehrenfest': 'B · Random model (Ehrenfest)', 'irrev.view.window': 'C · Fluctuations in a window',
    'irrev.N': 'Particles N', 'irrev.kT': 'Temperature kT', 'irrev.plot': 'Plot', 'irrev.plot.series': 'Δ(t) = n_left − n_right', 'irrev.plot.hist': 'Histogram of Δ vs the binomial',
    'irrev.cap.box': 'The N particles start in the left half. On start the partition (dashed) is removed and the gas expands. In B there is no dynamics: each step picks a particle at random and moves it to the other side.',
    'irrev.cap.plot': 'Red: Δ(t). Blue bands: ±σ and ±3σ with σ_Δ = √N (68 % and 99.7 % of the time in equilibrium). In the histogram, bars: measured; blue: exact binomial.',
    'irrev.readout': 't = {t} · left = {l} · right = {r} · Δ = {d} · ⟨Δ⟩ = {mean} · measured σ_Δ = {sd} (theory √N = {sN}) · |Δ| > 3σ {f3} % of the time · all on one side {fall} %',
    'irrev.hint': 'With N = 6 you will often see all six particles on the same side: the "expansion" reverses by itself. With N = 20 it happens 0.0002 % of the steps; with N = 100 you will never see it. Irreversibility is a matter of particle number, not of dynamics. View B reproduces the same fluctuations with no mechanics at all.',
    'irrev.eq.N': 'number of particles', 'irrev.eq.sigma': 'standard deviation of Δ in equilibrium', 'irrev.eq.pall': 'probability of finding all on one side', 'irrev.eq.sd': 'measured σ_Δ',
    'irrev.ind.ratio': 'measured σ_Δ / √N', 'irrev.ind.all': 'fraction with all on one side (theory 2^{1−N})',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  root.innerHTML = '<div class="params view-select"></div><div class="view-host"></div><div class="theory-sections"></div>';
  const host = root.querySelector('.view-host');
  const pView = select({ label: 'irrev.view', value: 'gas', options: ['gas', 'ehrenfest', 'window'].map((v) => ({ value: v, label: `irrev.view.${v}` })), onChange: (v) => show(v) });
  root.querySelector('.view-select').append(pView.el);
  let handle = null;
  function show(v) {
    handle?.destroy?.(); host.replaceChildren();
    handle = v === 'window' ? Fl.mount(host, { root: base, embedded: true }) : mountAB(host, v);
    i18n.apply(host); window.dispatchEvent(new Event('resize'));
  }
  show('gas');
  mountSections(root.querySelector('.theory-sections'), meta.slug, base);
  return { get loop() { return handle?.loop; }, destroy() { handle?.destroy?.(); root.replaceChildren(); } };
}

function mountAB(root, kind) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'box', caption: 'irrev.cap.box' }, { id: 'plot', caption: 'irrev.cap.plot' }], hintKey: 'irrev.hint', theory: false });
  let state;
  const pN = numberField({ label: 'irrev.N', value: 20, min: 1, max: kind === 'gas' ? 100 : 1000, integer: true });
  const pkT = numberField({ label: 'irrev.kT', value: 1, min: 0.01, max: 100 });
  const pPlot = select({ label: 'irrev.plot', value: 'series', options: [{ value: 'series', label: 'irrev.plot.series' }, { value: 'hist', label: 'irrev.plot.hist' }], onChange: () => draw() });
  ui.params.append(pN.el); if (kind === 'gas') ui.params.append(pkT.el); ui.params.append(pPlot.el);

  const L = 200;
  const box = new Plot(ui.canvas.box, { xmin: 0, xmax: L, ymin: 0, ymax: L });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 't', ylabel: 'Δ' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title',
    equations: [
      { tex: 'P(n_{\\rm izq}=n) = \\binom{\\htmlId{N}{N}}{n}\\,2^{-N},\\qquad \\Delta = n_{\\rm izq} - n_{\\rm dcha}', slots: { N: { label: 'irrev.eq.N' } } },
      { tex: '\\sigma_\\Delta = \\sqrt{N} = \\htmlId{sigma}{\\sigma_\\Delta},\\qquad \\sigma_\\Delta^{\\rm med} = \\htmlId{sd}{\\sigma}', slots: { sigma: { label: 'irrev.eq.sigma' }, sd: { label: 'irrev.eq.sd' } } },
      { tex: 'P(|\\Delta| = N) = 2^{\\,1-N} = \\htmlId{pall}{P}', slots: { pall: { label: 'irrev.eq.pall', fmt: (v) => (v < 1e-4 ? v.toExponential(1) : formatValue(v)) } } },
    ],
    indicators: [{ key: 'ratio', label: 'irrev.ind.ratio' }, { key: 'all', label: 'irrev.ind.all', fmt: (v) => (Number.isNaN(v) ? '—' : v === 0 ? '0' : v.toExponential(1)) }],
  });

  const SKIP = () => (kind === 'gas' ? 100 : 5 * state.N); // transient to drop from statistics
  function reset() {
    state = kind === 'gas' ? I.createGas({ N: pN.get(), kT: pkT.get(), L }) : I.createEhrenfest({ N: pN.get() });
    eq.update({ N: state.N, sigma: Math.sqrt(state.N), pall: I.probAllOneSide(state.N) });
  }
  function step() { if (kind === 'gas') I.stepGas(state); else I.stepEhrenfest(state); }
  function drawBox() {
    box.clear();
    box.color('#999'); box.ctx.setLineDash([6, 6]); box.line(L / 2, 0, L / 2, L); box.ctx.setLineDash([]);
    if (kind === 'gas') {
      if (!state.partition.open) { box.color('#444'); box.lineWidth(3); box.line(L / 2, 0, L / 2, L); box.lineWidth(1); }
      box.color('#1f4e9c');
      for (let i = 0; i < state.N; i++) box.disk(state.x[i], state.y[i], state.r[i]);
    } else {
      // Ehrenfest: draw `left` disks on the left grid and the rest on the right.
      const N = state.N, cols = Math.ceil(Math.sqrt(N)), cell = (L / 2 - 10) / cols, r = Math.min(4, cell * 0.4);
      box.color('#1f4e9c');
      for (let i = 0; i < state.left; i++) box.disk(5 + cell * (i % cols + 0.5), 5 + cell * (Math.floor(i / cols) + 0.5), r);
      box.color('#b5281e');
      for (let i = 0; i < N - state.left; i++) box.disk(L / 2 + 5 + cell * (i % cols + 0.5), 5 + cell * (Math.floor(i / cols) + 0.5), r);
    }
    box.end();
  }
  function drawPlot() {
    const N = state.N, h = state.history, sN = Math.sqrt(N);
    if (pPlot.get() === 'series') {
      const win = kind === 'gas' ? 600 : Math.max(600, 20 * N), from = Math.max(0, h.length - win);
      plot.xlabel = 't'; plot.ylabel = 'Δ';
      plot.setScales(from, from + win, -N * 1.05, N * 1.05);
      plot.clear();
      plot.color('rgba(31,78,156,0.12)'); plot.bar(from, from + win, 3 * sN, -3 * sN);
      plot.color('rgba(31,78,156,0.25)'); plot.bar(from, from + win, sN, -sN);
      plot.color('#999'); plot.line(from, 0, from + win, 0);
      plot.color('rgba(181,40,30,0.85)'); plot.lineWidth(1.5);
      const xs = [], ys = []; for (let i = from; i < h.length; i++) { xs.push(i); ys.push(h[i]); }
      if (xs.length > 1) plot.polyline(xs, ys); plot.lineWidth(1);
      plot.end();
    } else {
      const { delta, p } = I.binomialDiff(N);
      const { h: hist } = I.histogramDiff(h, N, Math.min(SKIP(), h.length - 1));
      let pmax = 0; for (let k = 0; k <= N; k++) pmax = Math.max(pmax, p[k], hist[k]);
      plot.xlabel = 'Δ'; plot.ylabel = 'P(Δ)';
      plot.setScales(-N - 1, N + 1, 0, pmax * 1.15);
      plot.clear();
      plot.color('rgba(181,40,30,0.7)');
      for (let k = 0; k <= N; k++) if (hist[k] > 0) plot.bar(delta[k] - 0.8, delta[k] + 0.8, hist[k]);
      plot.color('#1f4e9c'); plot.lineWidth(2);
      const xs = [], ys = []; for (let k = 0; k <= N; k++) { xs.push(delta[k]); ys.push(p[k]); }
      plot.polyline(xs, ys); plot.lineWidth(1);
      plot.end();
    }
  }
  function draw() {
    drawBox(); drawPlot();
    const d = I.difference(state), N = state.N, skip = Math.min(SKIP(), Math.max(0, state.history.length - 1));
    const st = I.seriesStats(state.history, skip), tails = I.tailFractions(state.history, N, skip);
    ui.readout.textContent = i18n.t('irrev.readout', {
      t: kind === 'gas' ? state.t.toFixed(0) : state.t, l: (N + d) / 2, r: (N - d) / 2, d, mean: st.n ? st.mean.toFixed(2) : '–', sd: st.n ? st.sd.toFixed(2) : '–', sN: Math.sqrt(N).toFixed(2),
      f3: st.n ? (100 * tails.beyond3).toFixed(2) : '–', fall: st.n ? (100 * tails.allOneSide).toFixed(3) : '–',
    });
    eq.update({ sd: st.n > 20 ? st.sd : NaN });
    const ratio = st.n > 20 ? st.sd / Math.sqrt(N) : NaN;
    eq.setIndicator('ratio', ratio, Number.isNaN(ratio) ? 'none' : Math.abs(ratio - 1) < 0.2 ? 'ok' : 'warn');
    eq.setIndicator('all', st.n > 20 ? tails.allOneSide : NaN);
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: kind === 'gas' ? 1 : 4 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: kind === 'gas' ? 10 : 200 }).el);
  reset();
  const off = autoResize([box, plot], draw);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
