// Nuclear magnetic resonance: Bloch equations for the reduced magnetisation m = M/M0 in a static
// field B0 ẑ (Larmor ω0 = γB0) with relaxation times T1 (longitudinal) and T2 (transverse), and an
// optional rotating field B1 of frequency ω in the xy plane. Time in units of T2; α = ω0 T2.
//   dm_x/dt = ω0 m_y + ω1 sin(ωt) m_z − m_x/T2
//   dm_y/dt = −ω0 m_x + ω1 cos(ωt) m_z − m_y/T2
//   dm_z/dt = −ω1 [sin(ωt) m_x + cos(ωt) m_y] − (m_z − 1)/T1
// (B1 = B1 (cos ωt, −sin ωt, 0) co-rotating with the Larmor precession, ω1 = γB1). RK4.
export function create({ alpha = 10, omega1 = 0, omegaRel = 1, T1 = 3, m0 = [1, 0, 0] } = {}) {
  return { alpha, omega1, omega: omegaRel * alpha, T1, m: Float64Array.from(m0), t: 0, trail: [[0, m0[0], m0[1], m0[2]]] };
}
export function rhs(s, t, m) {
  const { alpha: w0, omega1: w1, omega: w, T1 } = s;
  const c = Math.cos(w * t), sn = Math.sin(w * t);
  return [w0 * m[1] + w1 * sn * m[2] - m[0], -w0 * m[0] + w1 * c * m[2] - m[1], -w1 * (sn * m[0] + c * m[1]) - (m[2] - 1) / T1];
}
export function step(s, dt = 0.005) {
  const f = (t, m) => rhs(s, t, m), m = s.m, t = s.t;
  const k1 = f(t, m), m2 = m.map((v, i) => v + dt / 2 * k1[i]);
  const k2 = f(t + dt / 2, m2), m3 = m.map((v, i) => v + dt / 2 * k2[i]);
  const k3 = f(t + dt / 2, m3), m4 = m.map((v, i) => v + dt * k3[i]);
  const k4 = f(t + dt, m4);
  for (let i = 0; i < 3; i++) s.m[i] += dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  s.t += dt;
  s.trail.push([s.t, s.m[0], s.m[1], s.m[2]]);
  if (s.trail.length > 20000) s.trail.splice(0, 10000);
}
// Free induction decay (no B1, m_z at equilibrium): m_x = e^{−t} cos(αt), m_y = −e^{−t} sin(αt), |m_⊥| = e^{−t}.
export function fid(alpha, t) { return { mx: Math.exp(-t) * Math.cos(alpha * t), my: -Math.exp(-t) * Math.sin(alpha * t), mod: Math.exp(-t) }; }
// Steady-state absorption (power absorbed from B1) vs drive frequency: Lorentzian of half-width 1/T2 around ω0
// (weak B1): χ''(ω) ∝ (1/T2) / ((ω − ω0)² + 1/T2²), normalised to its maximum.
export function absorption(alpha, omegas, T2 = 1) { return omegas.map((w) => (1 / T2 ** 2) / ((w - alpha) ** 2 + 1 / T2 ** 2)); }
export function transverse(m) { return Math.hypot(m[0], m[1]); }
