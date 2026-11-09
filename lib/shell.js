// Course shell: persistent sidebar, hash routing (#/slug), dynamic import of
// applets/<slug>/applet.js, theme toggle. Pure helpers (parseRoute) are
// testable in Node; createShell needs a DOM.
import { i18n } from './i18n.js';
import { bySlug, experiments, extras } from './registry.js';

export function parseRoute(hash, registry) {
  const m = /^#\/([a-z0-9-]+)/i.exec(hash ?? '');
  if (!m) return { slug: null };
  const slug = m[1];
  return registry.some((r) => r.slug === slug) ? { slug } : { slug: null };
}

export function readTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}
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

export function createShell({ root = '.', registry } = {}) {
  const d = document;
  const sidebar = d.getElementById('sidebar');
  const content = d.getElementById('content');
  const title = d.getElementById('exp-title');
  const reg = registry ?? { bySlug, experiments, extras };

  // Sidebar lists.
  const list = (items) => items.map((r) =>
    `<li><a href="#/${r.slug}" data-slug="${r.slug}"${r.tad ? ` title="${i18n.t('course.tadNote')}"` : ''}>${r.number != null ? `<span class="num">${r.number}</span>` : ''}<span data-i18n="${r.titleKey}">${i18n.t(r.titleKey)}</span>${r.tad ? '<span class="tad">*</span>' : ''}</a></li>`).join('');
  sidebar.innerHTML = `<a class="home" href="#/" data-i18n="course.home">${i18n.t('course.home')}</a>
    <h2 data-i18n="course.section">${i18n.t('course.section')}</h2><ol>${list(reg.experiments())}</ol>
    ${reg.extras().length ? `<h2 data-i18n="course.extras">${i18n.t('course.extras')}</h2><ul>${list(reg.extras())}</ul>` : ''}
    ${reg.experiments().some((r) => r.tad) ? `<p class="tad-legend"><span class="tad">*</span> <span data-i18n="course.tadLegend">${i18n.t('course.tadLegend')}</span></p>` : ''}`;

  let current = null; // { slug, handle }
  const markActive = (slug) => {
    sidebar.querySelectorAll('a[data-slug]').forEach((a) => {
      if (a.dataset.slug === slug) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  };

  async function navigate(slug) {
    if (current?.slug === slug) return;
    if (current?.handle) { try { current.handle.destroy?.(); } catch { /* ignore */ } }
    current = { slug, handle: null };
    content.replaceChildren();
    markActive(slug);
    d.body.classList.remove('nav-open');
    if (!slug) {
      title.textContent = i18n.t('course.title');
      content.innerHTML = d.getElementById('home-template').innerHTML;
      i18n.apply(content);
      d.title = i18n.t('course.title');
      return;
    }
    const entry = reg.bySlug(slug);
    title.innerHTML = `${entry.number != null ? `<span class="num">${entry.number}</span>` : ''}<span>${i18n.t(entry.titleKey)}${entry.tad ? ' <span class="tad">*</span>' : ''}</span>`;
    d.title = `${i18n.t(entry.titleKey)} · ${i18n.t('course.title')}`;
    const mod = await import(new URL(`${root}/${entry.path}`, document.baseURI).href);
    if (current.slug !== slug) return; // navigated away while loading
    const host = d.createElement('div'); host.className = 'applet'; content.append(host);
    current.handle = mod.mount(host, { i18n, root, inShell: true });
    i18n.apply(host);
    window.dispatchEvent(new Event('resize'));
  }

  const onHash = () => navigate(parseRoute(location.hash, reg.experiments().concat(reg.extras())).slug);
  window.addEventListener('hashchange', onHash);

  // Theme toggle.
  const tbtn = d.getElementById('theme-toggle');
  const syncThemeLabel = () => { tbtn.textContent = isDark() ? '☀' : '☾'; tbtn.title = i18n.t('course.theme'); };
  tbtn.addEventListener('click', () => { applyTheme(isDark() ? 'light' : 'dark'); syncThemeLabel(); });
  applyTheme(readTheme()); syncThemeLabel();

  // Language.
  d.getElementById('lang-toggle').addEventListener('click', () => {
    const u = new URL(location.href); u.searchParams.set('lang', i18n.lang === 'es' ? 'en' : 'es'); location.href = u.toString();
  });
  // Mobile nav.
  d.getElementById('nav-toggle').addEventListener('click', () => d.body.classList.toggle('nav-open'));

  onHash();
  return { navigate, get current() { return current; } };
}
