import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../lib/shell.js';
import { REGISTRY, SECTIONS, PAGES, bySlug, experimentsOf } from '../lib/registry.js';
import { splitSections } from '../lib/docs.js';

test('parseRoute maps hashes to home, pages, sections and experiments', () => {
  assert.deepEqual(parseRoute('#/maxwell'), { kind: 'experiment', id: 'maxwell', slug: 'maxwell' });
  assert.deepEqual(parseRoute(''), { kind: 'home', id: null, slug: null });
  assert.deepEqual(parseRoute('#/'), { kind: 'home', id: null, slug: null });
  assert.deepEqual(parseRoute('#/foo'), { kind: 'home', id: null, slug: null });
  assert.deepEqual(parseRoute('#/maxwell?x=1').slug, 'maxwell');
  assert.deepEqual(parseRoute('#/bibliografia'), { kind: 'page', id: 'bibliografia', slug: null });
  assert.deepEqual(parseRoute('#/s/fises'), { kind: 'section', id: 'fises', slug: null });
  assert.deepEqual(parseRoute('#/s/nope'), { kind: 'home', id: null, slug: null });
});

test('registry entries are complete and unique', () => {
  const slugs = REGISTRY.map((r) => r.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const r of REGISTRY) {
    assert.ok(r.slug && r.titleKey && r.path && r.title.es && r.title.en, JSON.stringify(r));
    assert.ok(Object.keys(r.sections).length >= 1 && Object.keys(r.sections).every((id) => SECTIONS.some((s) => s.id === id)));
  }
  assert.equal(bySlug('maxwell').path, 'applets/maxwell/applet.js');
  // numbers unique within each section
  for (const s of SECTIONS) {
    const nums = experimentsOf(s.id).map((r) => r.sections[s.id]);
    assert.equal(new Set(nums).size, nums.length, `duplicate numbers in ${s.id}`);
  }
  assert.ok(PAGES.length === 4 && experimentsOf('sfe').length === 12);
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
