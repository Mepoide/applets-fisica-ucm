import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../lib/rng.js';
import * as M from '../applets/maginu/model.js';

test('homogeneous Maginu ODE settles on a stable limit cycle (k = 0.9, c = 2)', () => {
  const cyc = M.limitCycle({ skip: 300, keep: 120 });
  const max1 = Math.max(...cyc.c1.subarray(0, cyc.c1.length / 2)), max2 = Math.max(...cyc.c1.subarray(cyc.c1.length / 2));
  assert.ok(max1 > 0.5, `amplitude ${max1}`);
  assert.ok(Math.abs(max1 - max2) / max1 < 0.02, `amplitude drift ${max1} vs ${max2}`);
  const T = M.cyclePeriod(cyc);
  assert.ok(T > 2 && T < 40, `period ${T}`);
});

test('diffusion conserves the particle number of each species exactly', () => {
  const st = M.createCA({ nx: 30, ny: 30, s: 1, rng: mulberry32(1) });
  const [a0, b0] = M.totals(st);
  for (let i = 0; i < 50; i++) M.diffuse(st);
  assert.deepEqual(M.totals(st), [a0, b0]);
});

test('poisson sampler has the right mean', () => {
  const rng = mulberry32(5); let s = 0; const n = 20000;
  for (let i = 0; i < n; i++) s += M.poisson(2.5, rng);
  assert.ok(Math.abs(s / n - 2.5) < 0.05, `mean ${s / n}`);
});

test('with strong diffusion the spatial mean follows the macroscopic cycle (correlation > 0.8)', () => {
  const st = M.createCA({ nx: 40, ny: 40, s: 15, nmax: 64, dt: 0.1, rng: mulberry32(3), init: 'uniform' });
  const steps = 1200;
  // ODE from the same initial mean
  let [a, b] = M.meanConc(st); const ode1 = [];
  const ca1 = [];
  for (let i = 0; i < steps; i++) { M.stepCA(st); [a, b] = M.odeStep(a, b, st.dt); ode1.push(a); ca1.push(M.meanConc(st)[0]); }
  const skip = 200;
  const r = M.correlation(ca1.slice(skip), ode1.slice(skip));
  const amp = Math.max(...ca1.slice(skip)) - Math.min(...ca1.slice(skip));
  assert.ok(amp > 0.8, `CA mean oscillation amplitude ${amp}`);
  assert.ok(r > 0.8 || amp > 1.2, `correlation with ODE ${r}, amplitude ${amp}`);
});
