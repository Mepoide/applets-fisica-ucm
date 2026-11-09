// Course shell: sidebar grouped by section, hash routing, dynamic import of
// applets/<slug>/applet.js, static pages, section indexes, landing hero, theme.
// Pure helpers (parseRoute) are testable in Node; createShell needs a DOM.
import { i18n } from './i18n.js';
import { SECTIONS, PAGES, REGISTRY, bySlug, sectionById, pageById, experimentsOf, primarySection } from './registry.js';
import { mount as mountDoc } from './docs.js';

// '#/' → home · '#/presentacion' → page · '#/s/fises' → section · '#/kac' → experiment
export function parseRoute(hash, registry = REGISTRY, pages = PAGES, sections = SECTIONS) {
  const m = /^#\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/i.exec(hash ?? '');
  if (!m) return { kind: 'home', id: null, slug: null };
  const [, a, b] = m;
  if (a === 's' && b && sections.some((s) => s.id === b)) return { kind: 'section', id: b, slug: null };
  if (pages.some((p) => p.id === a)) return { kind: 'page', id: a, slug: null };
  if (registry.some((r) => r.slug === a)) return { kind: 'experiment', id: a, slug: a };
  return { kind: 'home', id: null, slug: null };
}

export function readTheme() { try { return localStorage.getItem('theme'); } catch { return null; } }
export function applyTheme(t) {
  const root = document.documentElement;
  if (t === 'light' || t === 'dark') root.dataset.theme = t; else delete root.dataset.theme;
  try { if (t) localStorage.setItem('theme', t); else localStorage.removeItem('theme'); } catch { /* ignore */ }
}
export function isDark() {
  const t = document.documentElement.dataset.theme;
  if (t) return t === 'dark';
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

const expLink = (r, secId) => `<a href="#/${r.slug}" data-slug="${r.slug}"${r.tad ? ` title="${i18n.t('course.tadNote')}"` : ''}><span class="num">${r.sections[secId]}</span><span data-i18n="${r.titleKey}">${i18n.t(r.titleKey)}</span>${r.tad ? '<span class="tad">*</span>' : ''}</a>`;

export function createShell({ root = '.' } = {}) {
  const d = document;
  const sidebar = d.getElementById('sidebar'), content = d.getElementById('content'), title = d.getElementById('exp-title');

  sidebar.innerHTML = `<a class="home" href="#/" data-i18n="course.home">${i18n.t('course.home')}</a>
    <ul class="pages">${PAGES.map((p) => `<li><a href="#/${p.id}" data-page="${p.id}" data-i18n="${p.titleKey}">${i18n.t(p.titleKey)}</a></li>`).join('')}</ul>
    ${SECTIONS.map((s) => `<details class="sec-nav" data-section="${s.id}"><summary><a href="#/s/${s.id}" data-section-link="${s.id}" data-i18n="${s.titleKey}">${i18n.t(s.titleKey)}</a><span class="count">${experimentsOf(s.id).length}</span></summary>
      <ol>${experimentsOf(s.id).map((r) => `<li>${expLink(r, s.id)}</li>`).join('') || `<li class="muted">${i18n.t('course.soon')}</li>`}</ol></details>`).join('')}
    <p class="tad-legend"><span class="tad">*</span> <span data-i18n="course.tadLegend">${i18n.t('course.tadLegend')}</span></p>`;

  let current = null; // { key, handle }
  let stopHero = null;
  let lastSection = null;
  const currentSection = (slug) => { const e = bySlug(slug); return e.sections[lastSection] != null ? lastSection : primarySection(e); };
  const markActive = (route) => {
    sidebar.querySelectorAll('a[data-slug],a[data-page],a[data-section-link]').forEach((a) => a.removeAttribute('aria-current'));
    if (route.kind === 'experiment') sidebar.querySelectorAll(`a[data-slug="${route.id}"]`).forEach((a) => a.setAttribute('aria-current', 'page'));
    if (route.kind === 'page') sidebar.querySelector(`a[data-page="${route.id}"]`)?.setAttribute('aria-current', 'page');
    if (route.kind === 'section') sidebar.querySelector(`a[data-section-link="${route.id}"]`)?.setAttribute('aria-current', 'page');
    const secId = route.kind === 'section' ? route.id : route.kind === 'experiment' ? currentSection(route.id) : null;
    if (secId) { const det = sidebar.querySelector(`details.sec-nav[data-section="${secId}"]`); if (det) det.open = true; }
  };

  function teardown() {
    if (current?.handle) { try { current.handle.destroy?.(); } catch { /* ignore */ } }
    if (stopHero) { stopHero(); stopHero = null; }
    current = null; content.replaceChildren(); d.body.classList.remove('nav-open');
  }

  async function navigate(route) {
    const key = `${route.kind}:${route.id}`;
    if (current?.key === key) return;
    teardown();
    current = { key, handle: null };
    markActive(route);
    if (route.kind === 'home') return renderHome();
    if (route.kind === 'page') return renderPage(route.id);
    if (route.kind === 'section') { lastSection = route.id; return renderSection(route.id); }
    return renderExperiment(route.id, key);
  }

  function renderHome() {
    title.textContent = ''; d.title = i18n.t('course.fullTitle');
    content.innerHTML = d.getElementById('home-template').innerHTML;
    content.querySelector('.hero-sections').innerHTML = SECTIONS.map((s) => `<a class="card sec-card" href="#/s/${s.id}"><h2>${i18n.t(s.titleKey)}</h2><p>${i18n.t(`${s.titleKey}.desc`)}</p><span class="tag">${experimentsOf(s.id).length} ${i18n.t('course.experiments')}</span></a>`).join('');
    i18n.apply(content);
    const canvas = content.querySelector('canvas.hero-canvas');
    if (canvas && typeof OffscreenCanvas !== 'undefined') stopHero = startHeroSafe(canvas);
  }
  function startHeroSafe(canvas) {
    let stop = null, cancelled = false;
    import(new URL(`${root}/lib/hero.js`, document.baseURI).href).then((m) => { if (!cancelled && canvas.isConnected) stop = m.startHero(canvas); }).catch(() => {});
    return () => { cancelled = true; stop?.(); };
  }
  function renderPage(id) {
    const p = pageById(id);
    title.textContent = i18n.t(p.titleKey); d.title = `${i18n.t(p.titleKey)} · ${i18n.t('course.fullTitle')}`;
    const host = d.createElement('article'); host.className = 'theory page'; content.append(host);
    mountDoc(host, `curso/${id}`, root);
  }
  function renderSection(id) {
    const s = sectionById(id);
    title.textContent = i18n.t(s.titleKey); d.title = `${i18n.t(s.titleKey)} · ${i18n.t('course.fullTitle')}`;
    const list = experimentsOf(id);
    content.innerHTML = `<section class="section-index"><p class="lead">${i18n.t(`${s.titleKey}.desc`)}</p>
      <div class="cards">${list.map((r) => `<a class="card" href="#/${r.slug}"><span class="num">${r.sections[id]}</span><h2>${i18n.t(r.titleKey)}${r.tad ? ' <span class="tad">*</span>' : ''}</h2></a>`).join('')}</div>
      ${list.length ? '' : `<p class="muted">${i18n.t('course.soon')}</p>`}</section>`;
  }
  async function renderExperiment(slug, key) {
    const entry = bySlug(slug), secId = currentSection(slug);
    title.innerHTML = `<span class="num">${entry.sections[secId]}</span><span>${i18n.t(entry.titleKey)}${entry.tad ? ' <span class="tad">*</span>' : ''}</span>`;
    d.title = `${i18n.t(entry.titleKey)} · ${i18n.t('course.fullTitle')}`;
    const mod = await import(new URL(`${root}/${entry.path}`, document.baseURI).href);
    if (current?.key !== key) return;
    const host = d.createElement('div'); host.className = 'applet'; content.append(host);
    current.handle = mod.mount(host, { i18n, root, inShell: true });
    i18n.apply(host);
    window.dispatchEvent(new Event('resize'));
  }

  const onHash = () => navigate(parseRoute(location.hash));
  window.addEventListener('hashchange', onHash);

  const tbtn = d.getElementById('theme-toggle');
  const syncThemeLabel = () => { tbtn.textContent = isDark() ? '☀' : '☾'; tbtn.title = i18n.t('course.theme'); };
  tbtn.addEventListener('click', () => { applyTheme(isDark() ? 'light' : 'dark'); syncThemeLabel(); });
  applyTheme(readTheme()); syncThemeLabel();
  d.getElementById('lang-toggle').addEventListener('click', () => {
    const u = new URL(location.href); u.searchParams.set('lang', i18n.lang === 'es' ? 'en' : 'es'); location.href = u.toString();
  });
  d.getElementById('nav-toggle').addEventListener('click', () => d.body.classList.toggle('nav-open'));

  onHash();
  return { navigate, get current() { return current; } };
}
