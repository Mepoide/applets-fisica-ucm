import { test } from 'node:test';
import assert from 'node:assert/strict';
import { histogram, lgamma, poissonPmf, binomialPmf, mean, variance, autocorrelation, chiSquare, chiSquareSurvival } from '../lib/stats.js';

test('lgamma matches factorials', () => {
  assert.ok(Math.abs(lgamma(5) - Math.log(24)) < 1e-12);
  assert.ok(Math.abs(lgamma(1) - 0) < 1e-12);
  assert.ok(Math.abs(lgamma(0.5) - 0.5 * Math.log(Math.PI)) < 1e-12);
});

test('poisson and binomial pmf normalize to 1', () => {
  let s = 0; for (let k = 0; k < 60; k++) s += poissonPmf(k, 3); assert.ok(Math.abs(s - 1) < 1e-12);
  s = 0; for (let k = 0; k <= 10; k++) s += binomialPmf(k, 10, 0.3); assert.ok(Math.abs(s - 1) < 1e-12);
  assert.equal(binomialPmf(10, 10, 1), 1);
  assert.equal(binomialPmf(0, 10, 0), 1);
  assert.equal(poissonPmf(0, 0), 1);
});

test('histogram bins are half-open, last bin closed', () => {
  const h = histogram([0, 0.5, 1, 1.5, 2, 2.5, 3], 0, 3, 3);
  assert.deepEqual([...h], [2, 2, 3]);
  assert.deepEqual([...histogram([NaN, -1, 4], 0, 3, 3)], [0, 0, 0]);
});

test('mean / variance', () => {
  assert.equal(mean([1, 2, 3, 4]), 2.5);
  assert.equal(variance([1, 2, 3, 4]), 1.25);
  assert.equal(mean([]), 0);
});

test('autocorrelation of constant is 1, of alternating series is ±1', () => {
  assert.deepEqual([...autocorrelation([3, 3, 3, 3], 2)], [1, 1, 1]);
  const alt = autocorrelation([1, -1, 1, -1, 1, -1, 1, -1], 2);
  assert.equal(alt[0], 1);
  assert.ok(alt[1] < -0.8 && alt[2] > 0.7);
});

test('chi-square survival function', () => {
  // chi2 = 3.841 with 1 dof -> p = 0.05
  assert.ok(Math.abs(chiSquareSurvival(3.841459, 1) - 0.05) < 1e-4);
  assert.ok(Math.abs(chiSquareSurvival(18.307, 10) - 0.05) < 1e-3);
  const { chi2, dof } = chiSquare([10, 10, 10], [10, 10, 10]);
  assert.equal(chi2, 0); assert.equal(dof, 2);
});
