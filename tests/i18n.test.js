import { test } from 'node:test';
import assert from 'node:assert/strict';
import { i18n } from '../lib/i18n.js';

test('t() falls back to key then to Spanish', () => {
  i18n.register({ es: { hello: 'Hola {name}' }, en: {} });
  i18n.lang = 'en';
  assert.equal(i18n.t('hello', { name: 'Ana' }), 'Hola Ana');
  assert.equal(i18n.t('missing.key'), 'missing.key');
  i18n.register({ en: { hello: 'Hello {name}' } });
  assert.equal(i18n.t('hello', { name: 'Ana' }), 'Hello Ana');
});

test('detect() priority: query > stored > navigator', () => {
  assert.equal(i18n.detect({ search: '?lang=en', stored: 'es', navigatorLang: 'es' }), 'en');
  assert.equal(i18n.detect({ search: '', stored: 'en', navigatorLang: 'es' }), 'en');
  assert.equal(i18n.detect({ search: '', stored: null, navigatorLang: 'en-GB' }), 'en');
  assert.equal(i18n.detect({ search: '?lang=fr', stored: null, navigatorLang: 'de' }), 'es');
});
