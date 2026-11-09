// Shared applet body for the chain integrated-density-of-modes experiments (2: random binary,
// 3: Fibonacci quasicrystal). `kind` selects the mass sequence and the extra control.
import { i18n } from '../../lib/i18n.js';
import { Plot } from '../../lib/plot.js';
import { Loop } from '../../lib/loop.js';
import { numberField, select, loopControls } from '../../lib/ui.js';
import { autoResize, appletSkeleton, mountSections } from '../../lib/page.js';
import { liveEquation } from '../../lib/liveeq.js';
import * as Ch from './chain.js';

i18n.register({
  es: {
    'chain.alpha': 'Cociente de masas α = M/m', 'chain.c': 'Fracción de masas pesadas C', 'chain.N': 'Átomos N', 'chain.gen': 'Generación de Fibonacci n (F_n átomos)',
    'chain.cap.chain': 'Primeros átomos de la cadena: masa ligera m (pequeño) y pesada M = αm (grande). Los muelles son todos iguales (k = 1).',
    'chain.cap.plot': 'Densidad acumulada de modos por átomo N(ω)/N frente a ω (unidades √(k/m)), obtenida contando nodos. Gris: cadena monoatómica, (2/π) arcsin(ω/2). Las mesetas son intervalos de frecuencia prohibidos (gaps).',
    'chain.readout': 'N = {N} átomos · α = {alpha} · fracción pesada = {c} · ω_max monoatómica = 2 · ω_max de la cadena ≈ {wmax} · gaps detectados ≈ {gaps}',
    'chain.hint.random': 'Con α = 1 la curva cae sobre la monoatómica. Sube α: las masas pesadas bajan las frecuencias, aparece una banda de modos localizados por encima de la banda de la cadena pesada y escalones (gaps) que dependen de C. Compara varias semillas: la curva apenas cambia aunque la cadena sea distinta (autopromedio).',
    'chain.hint.fib': 'La cadena de Fibonacci no es periódica ni aleatoria. Su espectro es un conjunto de Cantor: cada gap principal se subdivide en gaps más pequeños al aumentar la generación, en una jerarquía autosemejante. Aumenta n y α y mira cómo las mesetas se multiplican.',
    'chain.eq.alpha': 'cociente de masas', 'chain.eq.omega': 'frecuencia (unidades √(k/m))', 'chain.eq.N': 'número de átomos', 'chain.eq.w0': 'borde de banda monoatómica',
    'chain.ind.gaps': 'gaps (mesetas) en la curva', 'chain.ind.frac': 'fracción de masas pesadas medida',
  },
  en: {
    'chain.alpha': 'Mass ratio α = M/m', 'chain.c': 'Fraction of heavy masses C', 'chain.N': 'Atoms N', 'chain.gen': 'Fibonacci generation n (F_n atoms)',
    'chain.cap.chain': 'First atoms of the chain: light mass m (small) and heavy M = αm (large). All springs are equal (k = 1).',
    'chain.cap.plot': 'Integrated density of modes per atom N(ω)/N versus ω (units √(k/m)), from node counting. Grey: monatomic chain, (2/π) arcsin(ω/2). Plateaus are forbidden frequency intervals (gaps).',
    'chain.readout': 'N = {N} atoms · α = {alpha} · heavy fraction = {c} · monatomic ω_max = 2 · chain ω_max ≈ {wmax} · gaps detected ≈ {gaps}',
    'chain.hint.random': 'With α = 1 the curve falls on the monatomic one. Raise α: heavy masses lower the frequencies, a band of localised modes appears above the heavy-chain band and steps (gaps) depending on C show up. Compare several seeds: the curve hardly changes although the chain does (self-averaging).',
    'chain.hint.fib': 'The Fibonacci chain is neither periodic nor random. Its spectrum is a Cantor set: every main gap splits into smaller gaps as the generation grows, in a self-similar hierarchy. Increase n and α and watch the plateaus multiply.',
    'chain.eq.alpha': 'mass ratio', 'chain.eq.omega': 'frequency (units √(k/m))', 'chain.eq.N': 'number of atoms', 'chain.eq.w0': 'monatomic band edge',
    'chain.ind.gaps': 'gaps (plateaus) in the curve', 'chain.ind.frac': 'measured heavy-mass fraction',
  },
});

export function mountDOS(root, { root: base = '../..', kind, slug } = {}) {
  const ui = appletSkeleton(root, { canvases: [{ id: 'chain', caption: 'chain.cap.chain', cls: 'wide' }, { id: 'plot', caption: 'chain.cap.plot' }], hintKey: kind === 'fib' ? 'chain.hint.fib' : 'chain.hint.random' });
  let masses, ws, idos, computed = 0;
  const pA = numberField({ label: 'chain.alpha', value: 2, min: 1, max: 10, step: 0.1 });
  const pC = numberField({ label: 'chain.c', value: 0.5, min: 0, max: 1, step: 0.05 });
  const pN = numberField({ label: 'chain.N', value: 2000, min: 50, max: 20000, integer: true });
  const pGen = select({ label: 'chain.gen', value: '14', options: Array.from({ length: 10 }, (_, i) => ({ value: String(i + 8), label: `${i + 8} (F = ${Ch.fibonacciNumber(i + 8)})` })) });
  ui.params.append(pA.el); if (kind === 'fib') ui.params.append(pGen.el); else ui.params.append(pC.el, pN.el);
  const chain = new Plot(ui.canvas.chain, { xmin: 0, xmax: 40, ymin: -1, ymax: 1 });
  const plot = new Plot(ui.canvas.plot, { axes: true, xlabel: 'ω', ylabel: 'N(ω)/N' });
  const eq = liveEquation(ui.panel, {
    title: 'eq.title', kind: 'C',
    equations: [
      { tex: 'm_n\\,\\omega^2 U_n = k\\,(2U_n - U_{n-1} - U_{n+1}),\\qquad \\frac{M}{m} = \\htmlId{alpha}{\\alpha},\\quad N = \\htmlId{N}{N}', slots: { alpha: { label: 'chain.eq.alpha' }, N: { label: 'chain.eq.N' } } },
      { tex: 'R_n = \\frac{U_{n+1}}{U_n} = 2 - \\frac{m_n\\omega^2}{k} - \\frac{1}{R_{n-1}},\\qquad \\frac{N(\\omega)}{N} = \\frac{\\#\\{R_n<0\\}}{N};\\quad \\omega_{\\max}^{\\rm mono} = 2\\sqrt{k/m}', slots: {} },
    ],
    indicators: [{ key: 'gaps', label: 'chain.ind.gaps' }, { key: 'frac', label: 'chain.ind.frac' }],
  });
  function reset() {
    const alpha = pA.get();
    masses = kind === 'fib' ? Ch.fibonacciMasses(Ch.fibonacciNumber(Number(pGen.get())), alpha) : Ch.randomMasses(pN.get(), alpha, pC.get());
    ws = Array.from({ length: 241 }, (_, i) => 2.2 * i / 240); idos = new Float64Array(ws.length).fill(NaN); computed = 0;
    let h = 0; for (const v of masses) if (v !== 1) h++;
    eq.update({ alpha, N: masses.length }); eq.setIndicator('frac', h / masses.length);
  }
  function step() { if (computed >= ws.length) { loop.pause(); return; } const chunk = 12; const sub = ws.slice(computed, computed + chunk); const r = Ch.integratedDOS(masses, sub); for (let i = 0; i < r.length; i++) idos[computed + i] = r[i]; computed += r.length; }
  function draw() {
    chain.clear();
    for (let i = 0; i < 40 && i < masses.length; i++) { chain.color('#999'); if (i) chain.line(i - 1 + 0.5, 0, i + 0.5, 0); chain.color(masses[i] === 1 ? '#1f4e9c' : '#b5281e'); chain.disk(i + 0.5, 0, masses[i] === 1 ? 0.18 : 0.18 * Math.min(2, Math.sqrt(masses[i]))); }
    chain.end();
    plot.setScales(0, 2.2, 0, 1.02); plot.clear();
    plot.color('#999'); plot.lineWidth(1.5); plot.polyline(ws, ws.map(Ch.monatomicIDOS));
    const xs = [], ys = []; for (let i = 0; i < computed; i++) { xs.push(ws[i]); ys.push(idos[i]); }
    plot.color('rgba(181,40,30,0.9)'); plot.lineWidth(2); if (xs.length > 1) plot.polyline(xs, ys); plot.lineWidth(1);
    plot.end();
    let gaps = 0, wmax = NaN;
    for (let i = 1; i < computed; i++) { if (idos[i] === idos[i - 1] && idos[i] > 0.02 && idos[i] < 0.98 && (i === 1 || idos[i - 1] !== idos[i - 2])) gaps++; if (Number.isNaN(wmax) && idos[i] >= 1) wmax = ws[i]; }
    ui.readout.textContent = i18n.t('chain.readout', { N: masses.length, alpha: pA.get(), c: eq.el.querySelector ? (masses.filter((v) => v !== 1).length / masses.length).toFixed(3) : '', wmax: Number.isNaN(wmax) ? '–' : wmax.toFixed(2), gaps });
    eq.setIndicator('gaps', gaps, computed === ws.length ? 'ok' : 'none');
  }
  const loop = new Loop({ step, draw, reset, stepsPerFrame: 2 });
  ui.loopctl.append(loopControls(loop, { speedMin: 1, speedMax: 20 }).el);
  reset();
  const off = autoResize([chain, plot], draw);
  if (ui.theory) mountSections(ui.theory, slug, base);
  return { loop, destroy() { loop.pause(); off(); root.replaceChildren(); } };
}
