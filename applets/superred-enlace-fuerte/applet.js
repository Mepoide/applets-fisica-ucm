// Tight-binding approximation to superlattices — Quantum Devices experiment 8.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { slider, numberField, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as TB from './model.js';

export const meta = { slug: 'superred-enlace-fuerte', titleKey: 'tbs.title', legacyPath: '../../README.md' };

i18n.register({
  es: {
    'tbs.N': 'Número de pozos N', 'tbs.W': 'Desorden W (unidades de T)', 'tbs.F': 'Campo F (unidades de T por periodo)', 'tbs.j': 'Autoestado j',
    'tbs.cap.state': 'Amplitudes C_n del autoestado seleccionado (azul) sobre el perfil de niveles de los pozos E_n = W(r_n − ½) − Fn (gris). Al iniciar se recorren los autoestados en orden de energía.',
    'tbs.cap.spec': 'Espectro de la superred: energías E_j frente al índice j (puntos) y banda −2cos k de la superred periódica (línea). Con campo, escalera de Wannier–Stark de paso F.',
    'tbs.readout': 'N = {N} · W = {W} · F = {F} · estado j = {j}: E = {E} · razón de participación {pr} de {N} · centroide n̄ = {c} · longitud de Stark 4T/F = {L}',
    'tbs.hint': 'Sin desorden ni campo los estados son ondas estacionarias extendidas por toda la superred, con E_j = −2cos[jπ/(N+1)]: la minibanda del Ejercicio 7 en lenguaje de enlace fuerte. Con desorden W los estados se localizan (Anderson) y la razón de participación cae por debajo de N. Con campo F el espectro es una escalera de peldaño F y cada estado queda confinado a unos 4T/F pozos (Wannier–Stark), centrado en un pozo distinto.',
    'tbs.eq.W': 'anchura del desorden diagonal', 'tbs.eq.F': 'caída de potencial por periodo', 'tbs.eq.E': 'energía del autoestado dibujado', 'tbs.eq.pr': 'razón de participación 1/Σ|C_n|⁴',
    'tbs.ind.pr': 'participación / N', 'tbs.ind.gap': 'espaciado medio de niveles / F',
  },
  en: {
    'tbs.N': 'Number of wells N', 'tbs.W': 'Disorder W (units of T)', 'tbs.F': 'Field F (units of T per period)', 'tbs.j': 'Eigenstate j',
    'tbs.cap.state': 'Amplitudes C_n of the selected eigenstate (blue) over the well-level profile E_n = W(r_n − ½) − Fn (grey). On start the eigenstates are scanned in order of energy.',
    'tbs.cap.spec': 'Superlattice spectrum: energies E_j versus index j (dots) and the −2cos k band of the periodic superlattice (line). With field, a Wannier–Stark ladder of step F.',
    'tbs.readout': 'N = {N} · W = {W} · F = {F} · state j = {j}: E = {E} · participation ratio {pr} of {N} · centroid n̄ = {c} · Stark length 4T/F = {L}',
    'tbs.hint': 'Without disorder or field the states are standing waves extended over the whole superlattice, with E_j = −2cos[jπ/(N+1)]: the miniband of Exercise 7 in tight-binding language. With disorder W the states localise (Anderson) and the participation ratio drops below N. With field F the spectrum is a ladder of step F and each state is confined to about 4T/F wells (Wannier–Stark), centred on a different well.',
    'tbs.eq.W': 'diagonal disorder width', 'tbs.eq.F': 'potential drop per period', 'tbs.eq.E': 'energy of the drawn eigenstate', 'tbs.eq.pr': 'participation ratio 1/Σ|C_n|⁴',
    'tbs.ind.pr': 'participation / N', 'tbs.ind.gap': 'mean level spacing / F',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'state', caption: 'tbs.cap.state', cls: 'wide' }, { id: 'spec', caption: 'tbs.cap.spec' }], hintKey: 'tbs.hint' });
  let eps, Es, j = 0, C;
  const pN = numberField({ label: 'tbs.N', value: 41, min: 5, max: 201, integer: true, onChange: () => { compute(true); draw(); } });
  const pW = slider({ label: 'tbs.W', value: 0, min: 0, max: 6, step: 0.1, format: (v) => v.toFixed(1), onChange: () => { compute(true); draw(); } });
  const pF = slider({ label: 'tbs.F', value: 0, min: 0, max: 1, step: 0.02, format: (v) => v.toFixed(2), onChange: () => { compute(true); draw(); } });
  const pj = slider({ label: 'tbs.j', value: 1, min: 1, max: 41, step: 1, onChange: (v) => { j = Math.min(Number(v), Es.length) - 1; compute(false); draw(); } });
  ui.params.append(pN.el, pW.el, pF.el, pj.el);
  const ps = new Plot(ui.canvas.state, { axes: true, xlabel: 'n', ylabel: 'E (T)' });
  const pq = new Plot(ui.canvas.spec, { axes: true, xlabel: 'j', ylabel: 'E (T)' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'B',
    equations: [
      { tex: 'E_n C_n - C_{n+1} - C_{n-1} = E\\,C_n,\\qquad E_n = \\htmlId{W}{W}\\,(r_n - \\tfrac12) - \\htmlId{F}{F}\\,n', slots: { W: { label: 'tbs.eq.W' }, F: { label: 'tbs.eq.F' } } },
      { tex: 'E_j = \\htmlId{E}{E},\\qquad P = \\frac{1}{\\sum_n |C_n|^4} = \\htmlId{pr}{P};\\qquad W = F = 0:\\ E_j = -2\\cos\\frac{j\\pi}{N+1}', slots: { E: { label: 'tbs.eq.E' }, pr: { label: 'tbs.eq.pr' } } },
    ],
    indicators: [{ key: 'pr', label: 'tbs.ind.pr' }, { key: 'gap', label: 'tbs.ind.gap' }],
  });
  let seed = 1; const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  function compute(rebuild) {
    if (rebuild) { seed = 1; eps = TB.siteEnergies(pN.get(), { W: pW.get(), F: pF.get(), rng }); Es = TB.spectrum(eps); pj.input.max = String(Es.length); j = Math.min(j, Es.length - 1); pj.set(j + 1); }
    C = TB.eigenstate(eps, Es[j]); const pr = TB.participation(C), N = eps.length;
    let gap = 0; for (let k = 1; k < N; k++) gap += Es[k] - Es[k - 1]; gap /= N - 1;
    eq.update({ W: pW.get(), F: pF.get(), E: Es[j], pr });
    eq.setIndicator('pr', pr / N, pr / N > 0.5 ? 'ok' : 'none'); eq.setIndicator('gap', pF.get() > 0 ? gap / pF.get() : NaN, pF.get() > 0 && Math.abs(gap / pF.get() - 1) < 0.1 ? 'ok' : 'none');
  }
  function reset() { j = 0; compute(true); }
  function step() { j = (j + 1) % Es.length; pj.set(j + 1); compute(false); if (j === Es.length - 1) loop.pause(); }
  function draw() {
    const N = eps.length, emin = Math.min(...eps) - 2.5, emax = Math.max(...eps) + 2.5;
    ps.setScales(0, N, emin, emax); ps.clear();
    ps.color('#888'); for (let n = 0; n < N; n++) ps.line(n + 0.15, eps[n], n + 0.85, eps[n]);
    ps.color('rgba(31,78,156,0.9)'); ps.line(0, Es[j], N, Es[j]);
    const amp = Math.min(2, (emax - emin) * 0.2) / Math.max(...C.map(Math.abs)); ps.lineWidth(2); ps.polyline(Array.from({ length: N }, (_, n) => n + 0.5), Array.from(C, (c) => Es[j] + amp * c)); ps.lineWidth(1);
    ps.end();
    pq.setScales(0, N + 1, Math.min(-2.2, Es[0] - 0.2), Math.max(2.2, Es[N - 1] + 0.2)); pq.clear();
    pq.color('rgba(120,120,120,0.7)'); const ref = TB.periodicEnergies(N); pq.polyline(ref.map((_, k) => k + 1), ref);
    pq.color('rgba(31,78,156,0.8)'); Es.forEach((E, k) => pq.disk(k + 1, E, Math.max(0.15, (N + 1) / 150)));
    pq.color('#b5281e'); pq.disk(j + 1, Es[j], Math.max(0.3, (N + 1) / 80));
    pq.end();
    ui.readout.textContent = i18n.t('tbs.readout', { N, W: pW.get().toFixed(1), F: pF.get().toFixed(2), j: j + 1, E: Es[j].toFixed(3), pr: TB.participation(C).toFixed(1), c: TB.centroid(C).toFixed(1), L: pF.get() > 0 ? TB.starkLength(pF.get()).toFixed(1) : '∞' });
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 1 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 10 }).el);
  reset();
  const off = autoResize([ps, pq], draw);
  if (ui.theory) mountSections(ui.theory, meta.slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
