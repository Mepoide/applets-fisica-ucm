// Quantum-well levels in the two-band (Kane) model: energy-dependent masses m_A(E) = m_A(1 + E/E_gA),
// m_B(E) = m_B(1 + E/E_gB) in the transcendental equations of experiment 1; compared with Ben Daniel–Duke.
import { HB2M0 } from '../_dc/schrod.js';
export { HB2M0 };
export const SYSTEMS = {
  'GaAs-AlAs': { mA: 0.067, mB: 0.150, EgA: 1.52, EgB: 3.02, V0: 1.12 },
  'InAs-GaSb': { mA: 0.023, mB: 0.041, EgA: 0.36, EgB: 0.67, V0: 0.82 },
};
export function masses(sys, E, twoBand) { return twoBand ? { mA: sys.mA * (1 + E / sys.EgA), mB: sys.mB * (1 + E / sys.EgB) } : { mA: sys.mA, mB: sys.mB }; }
// f(E) = 0 conditions. even: k tan(ka/2)/mA = κ/mB ; odd: −k cot(ka/2)/mA = κ/mB, written as phase functions.
export function levels(sys, a, twoBand) {
  const out = [], V0 = sys.V0;
  const phase = (E) => { const { mA, mB } = masses(sys, E, twoBand); const k = Math.sqrt(mA * E / HB2M0), kap = Math.sqrt(mB * (V0 - E) / HB2M0); return { th: k * a / 2, g: (mA / mB) * kap / k }; };
  for (let n = 0; n < 60; n++) {
    for (const parity of ['even', 'odd']) {
      const off = (parity === 'even' ? 0 : Math.PI / 2) + n * Math.PI;
      const F = (E) => { const { th, g } = phase(E); return th - Math.atan(g) - off; };
      let lo = 1e-7, hi = V0 - 1e-9; if (F(hi) < 0) { if (parity === 'odd') return out; continue; }
      if (F(lo) > 0) continue;
      for (let i = 0; i < 80; i++) { const m = 0.5 * (lo + hi); if (F(m) > 0) hi = m; else lo = m; }
      out.push({ E: 0.5 * (lo + hi), parity });
    }
  }
  return out;
}
export function compare(sys, a) {
  const one = levels(sys, a, false), two = levels(sys, a, true);
  return one.map((l, i) => ({ E1: l.E, E2: two[i]?.E ?? NaN, parity: l.parity, err: two[i] ? (l.E - two[i].E) / two[i].E : NaN }));
}
