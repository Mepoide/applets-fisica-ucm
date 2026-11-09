// Common page chrome for every applet: header with language toggle, tabs
// (simulation / theory), footer linking the original Java source.
import { i18n } from './i18n.js';
import { mount as mountDocs } from './docs.js';

const LEGACY = 'https://github.com/Mepoide/applets-fisica-ucm/tree/legacy-java/legacy/BUENOS';

export function setupPage({ slug, titleKey, legacyPath, root = '..' }) {
  i18n.init();
  const d = document;
  d.title = `${i18n.t(titleKey)} · ${i18n.t('app.title')}`;

  const header = d.querySelector('header.site');
  header.innerHTML = `<h1><a href="${root}/index.html" style="color:inherit;text-decoration:none">${i18n.t('app.title')}</a></h1>
    <span class="muted" data-i18n="${titleKey}">${i18n.t(titleKey)}</span><span class="spacer"></span>
    <button class="lang" type="button" data-i18n="lang.switch">${i18n.t('lang.switch')}</button>`;
  header.querySelector('button.lang').addEventListener('click', () => {
    const next = i18n.lang === 'es' ? 'en' : 'es';
    const u = new URL(location.href); u.searchParams.set('lang', next); location.href = u.toString();
  });

  const tabs = d.querySelector('.tabs');
  const panels = [...d.querySelectorAll('.tab-panel')];
  const theoryPanel = d.querySelector('#theory');
  let theoryLoaded = false;
  tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    tabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    panels.forEach((p) => { p.hidden = p.id !== b.dataset.tab; });
    if (b.dataset.tab === 'theory' && !theoryLoaded) { theoryLoaded = true; mountDocs(theoryPanel.querySelector('.theory'), slug, root); }
    window.dispatchEvent(new Event('resize'));
  }));

  const footer = d.querySelector('footer.site');
  if (footer) footer.innerHTML = `${i18n.t('footer.legacy')} <a href="${LEGACY}/${legacyPath}"><code>legacy-java</code></a> · <a href="https://github.com/Mepoide/applets-fisica-ucm/tree/main/applets/${slug}">${i18n.t('footer.source')}</a>`;
  i18n.apply(d);
  return { lang: i18n.lang };
}

// Resize all plots when the layout changes.
export function autoResize(plots, draw) {
  let pending = false;
  const onResize = () => {
    if (pending) return; pending = true;
    requestAnimationFrame(() => { pending = false; plots.forEach((p) => p.resize()); draw(); });
  };
  window.addEventListener('resize', onResize);
  onResize();
}
