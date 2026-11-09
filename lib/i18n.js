// Minimal ES/EN internationalisation. Dictionaries are registered by each page;
// language is chosen from ?lang=, then localStorage, then navigator, default 'es'.
const dicts = { es: {}, en: {} };
export const i18n = {
  lang: 'es',
  register(d) {
    for (const l of Object.keys(d)) Object.assign(dicts[l] ??= {}, d[l]);
  },
  t(key, vars) {
    let s = dicts[this.lang]?.[key] ?? dicts.es[key] ?? key;
    if (vars) for (const k of Object.keys(vars)) s = s.replaceAll(`{${k}}`, String(vars[k]));
    return s;
  },
  setLang(l) {
    if (l !== 'es' && l !== 'en') return;
    this.lang = l;
    try { globalThis.localStorage?.setItem('lang', l); } catch { /* storage unavailable */ }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
      this.apply(document);
    }
  },
  // Pick initial language. Pure w.r.t. DOM so it can run in Node.
  detect({ search = '', stored = null, navigatorLang = 'es' } = {}) {
    const q = new URLSearchParams(search).get('lang');
    if (q === 'es' || q === 'en') return q;
    if (stored === 'es' || stored === 'en') return stored;
    return navigatorLang.startsWith('en') ? 'en' : 'es';
  },
  // Replace text of every element with data-i18n="key" (and title/placeholder variants).
  apply(root) {
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = this.t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = this.t(el.dataset.i18nTitle); });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = this.t(el.dataset.i18nHtml); });
  },
  init() {
    let stored = null;
    try { stored = globalThis.localStorage?.getItem('lang'); } catch { /* ignore */ }
    const l = this.detect({
      search: globalThis.location?.search ?? '',
      stored,
      navigatorLang: globalThis.navigator?.language ?? 'es',
    });
    this.setLang(l);
    return l;
  },
};

// Strings shared by every page.
i18n.register({
  es: {
    'app.title': 'Applets de Física · UCM',
    'app.subtitle': 'Simulaciones interactivas de física estadística y sistemas complejos',
    'app.home': 'Inicio',
    'ctl.start': 'Iniciar',
    'ctl.restart': 'Reiniciar',
    'ctl.pause': 'Pausa',
    'ctl.resume': 'Continuar',
    'ctl.speed': 'Velocidad',
    'ctl.stepsPerFrame': 'pasos/fotograma',
    'tab.sim': 'Simulación',
    'tab.theory': 'Teoría y notas',
    'footer.legacy': 'Código Java original (2002-2003) en la rama',
    'footer.source': 'Código de esta página',
    'docs.loading': 'Cargando documentación…',
    'docs.error': 'No se pudo cargar la documentación. Ábrela directamente:',
    'lang.switch': 'English',
  },
  en: {
    'app.title': 'Physics Applets · UCM',
    'app.subtitle': 'Interactive simulations in statistical physics and complex systems',
    'app.home': 'Home',
    'ctl.start': 'Start',
    'ctl.restart': 'Restart',
    'ctl.pause': 'Pause',
    'ctl.resume': 'Resume',
    'ctl.speed': 'Speed',
    'ctl.stepsPerFrame': 'steps/frame',
    'tab.sim': 'Simulation',
    'tab.theory': 'Theory and notes',
    'footer.legacy': 'Original Java code (2002-2003) on branch',
    'footer.source': 'Source of this page',
    'docs.loading': 'Loading documentation…',
    'docs.error': 'Could not load the documentation. Open it directly:',
    'lang.switch': 'Español',
  },
});
