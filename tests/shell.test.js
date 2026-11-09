import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../lib/shell.js';
import { REGISTRY, bySlug } from '../lib/registry.js';
import { splitSections } from '../lib/docs.js';

test('parseRoute maps hashes to registered slugs', () => {
  assert.deepEqual(parseRoute('#/maxwell', REGISTRY), { slug: 'maxwell' });
  assert.deepEqual(parseRoute('', REGISTRY), { slug: null });
  assert.deepEqual(parseRoute('#', REGISTRY), { slug: null });
  assert.deepEqual(parseRoute('#/foo', REGISTRY), { slug: null });
  assert.deepEqual(parseRoute('#/maxwell?x=1', REGISTRY), { slug: 'maxwell' });
});

test('registry entries are complete and unique', () => {
  const slugs = REGISTRY.map((r) => r.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const r of REGISTRY) {
    assert.ok(r.slug && r.titleKey && r.path, JSON.stringify(r));
    assert.ok(typeof r.number === 'number' || r.extra === true);
  }
  assert.equal(bySlug('maxwell').path, 'applets/maxwell/applet.js');
});

test('splitSections splits Markdown by level-2 headings keeping the intro', () => {
  const md = '# Title\n\nintro text\n\n## A\na body\n\n## B\nb body $x^2$\n';
  assert.deepEqual(splitSections(md), [
    { title: 'Title', body: 'intro text', level: 1 },
    { title: 'A', body: 'a body', level: 2 },
    { title: 'B', body: 'b body $x^2$', level: 2 },
  ]);
  assert.deepEqual(splitSections('no headings'), [{ title: '', body: 'no headings', level: 0 }]);
});
