import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../applets/modos-lineales/model.js';

const xs = L.linspace(-80, 80, 4001);

test('weights sum to 1 and the thermal mode vanishes for gamma = 1', () => {
  const w = L.weights(5 / 3);
  assert.ok(Math.abs(w.sound + w.thermal - 1) < 1e-15);
  assert.ok(Math.abs(w.thermal - 0.4) < 1e-12);
  const f = L.fields(1.3, 2, { gamma: 1 });
  assert.equal(f.drhoT, 0);
});

test('mass is conserved and the initial profile is the Gaussian of width sigma', () => {
  for (const t of [0, 1, 5, 20]) {
    const { drho } = L.profiles(xs, t, { sigma: 2 });
    assert.ok(Math.abs(L.integrate(xs, drho) - 1) < 1e-6, `mass at t=${t}`);
  }
  const f0 = L.fields(1, 0, { sigma: 2 });
  assert.ok(Math.abs(f0.drho - Math.exp(-1 / 8) / Math.sqrt(8 * Math.PI)) < 1e-12);
});

test('initial temperature perturbation vanishes; u(x,0) is only the small diffusive term; u is antisymmetric', () => {
  const p = { gammaS: 0.1, DT: 0.1, gamma: 5 / 3, sigma: 2, cs: 1 };
  for (const x of [-3, 0, 1.7, 10]) {
    const f = L.fields(x, 0, p);
    assert.ok(Math.abs(f.dT) < 1e-12, `dT(x,0)=${f.dT}`);
    // u(x,0) = -[Γ/γ + (1-1/γ) D_T] ∂_x G_σ(x): the price of exact continuity with spreading Gaussians
    const v = p.sigma ** 2, dG = -x / v * Math.exp(-x * x / (2 * v)) / Math.sqrt(2 * Math.PI * v);
    const expected = -(p.gammaS / p.gamma + (1 - 1 / p.gamma) * p.DT) * dG;
    assert.ok(Math.abs(f.u - expected) < 1e-12, `u(x,0)=${f.u} expected ${expected}`);
  }
  // and it is small compared with the sound velocity amplitude c_s/(2γ) G(0) once the pulses separate
  const peak = L.fields(p.cs * 10, 10, p).u;
  assert.ok(Math.abs(L.fields(2, 0, p).u) < 0.3 * Math.abs(peak));
  const a = L.fields(3, 4), b = L.fields(-3, 4);
  assert.ok(Math.abs(a.u + b.u) < 1e-12 && Math.abs(a.drho - b.drho) < 1e-12);
});

test('u satisfies the continuity equation numerically', () => {
  const t = 6, dt = 1e-4, p = { cs: 1.2, gammaS: 0.3, DT: 0.7, gamma: 1.4, sigma: 1.5 };
  for (const x of [-9, -2, 0.5, 4, 7.3]) {
    const dtRho = (L.fields(x, t + dt, p).drho - L.fields(x, t - dt, p).drho) / (2 * dt);
    const h = 1e-4; const dxU = (L.fields(x + h, t, p).u - L.fields(x - h, t, p).u) / (2 * h);
    assert.ok(Math.abs(dtRho + dxU) < 1e-5, `continuity residual ${dtRho + dxU} at x=${x}`);
  }
});

test('the original (cp-cv)/cv thermal weight would not conserve the normalisation', () => {
  const cp = 2, cv = 1; // original defaults
  const original = cv / cp + (cp - cv) / cv;
  assert.ok(Math.abs(original - 1.5) < 1e-12);
  const corrected = cv / cp + (cp - cv) / cp;
  assert.ok(Math.abs(corrected - 1) < 1e-12);
});
