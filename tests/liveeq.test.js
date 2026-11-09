import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatValue, fallbackText, slotTex } from '../lib/liveeq.js';

test('formatValue: 3 significant digits, exponent for large/small, dash for NaN', () => {
  assert.equal(formatValue(0.123456), '0.123');
  assert.equal(formatValue(12345), '1.23e4');
  assert.equal(formatValue(NaN), '—');
  assert.equal(formatValue(0), '0');
  assert.equal(formatValue(7), '7');
  assert.equal(formatValue(-2.5), '-2.50');
  assert.equal(formatValue(0.000123), '1.23e-4');
  assert.equal(formatValue(42, { digits: 4 }), '42');
});

test('fallbackText substitutes slot names by their formatted values', () => {
  const tex = '\\Delta(t) = \\left(1-\\tfrac{2\\htmlId{M}{M}}{\\htmlId{N}{N}}\\right)^{t}\\Delta(0)';
  const txt = fallbackText(tex, { M: 3, N: 10 });
  assert.match(txt, /1-2·3\/10|1-\\tfrac\{2 3\}\{10\}|3/);
  assert.ok(!txt.includes('\\htmlId'));
  assert.ok(txt.includes('3') && txt.includes('10'));
});

test('slotTex wraps a symbol as an htmlId slot', () => {
  assert.equal(slotTex('kT', 'kT'), '\\htmlId{kT}{kT}');
  assert.equal(slotTex('nu', '\\nu'), '\\htmlId{nu}{\\nu}');
});
