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
    'docs.intro': 'Introducción',
    'course.title': 'Sistemas fuera del Equilibrio',
    'course.home': 'Portada',
    'course.section': 'Experimentos',
    'course.extras': 'Material adicional',
    'course.theme': 'Cambiar tema claro/oscuro',
    'course.lead': 'Nueve experimentos interactivos sobre irreversibilidad, fluctuaciones, transporte y movimiento browniano, con la simulación y la ecuación que la gobierna en la misma pantalla.',
    'course.intro': 'Versión actual del bloque <em>Sistemas fuera del Equilibrio</em> del curso <em>Experimentos Interactivos en Sistemas Físicos Complejos</em> (UCM, 2002), reescrita en JavaScript para navegadores modernos. En cada experimento, los valores medidos en la simulación sustituyen a los símbolos de la ecuación en tiempo real y la predicción teórica se dibuja sobre los datos. Elige un experimento en la barra lateral.',
    'course.credits': 'Contenidos originales del curso: Ricardo Brito (UCM), con J. M. R. Parrondo. Applets Java originales (2002-2003): Mario Castro y Mario Encinar. Reescritura, auditoría física y textos: Mario Encinar, 2026.',
    'course.original': 'Curso original (UCM)',
    'eq.title': 'Ecuación viva',
    'eq.theory': 'teoría', 'eq.measured': 'medido',
    'ind.chi2': 'χ²/dof medida vs teoría',
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
    'docs.intro': 'Introduction',
    'course.title': 'Non-equilibrium Systems',
    'course.home': 'Home',
    'course.section': 'Experiments',
    'course.extras': 'Additional material',
    'course.theme': 'Toggle light/dark theme',
    'course.lead': 'Nine interactive experiments on irreversibility, fluctuations, transport and Brownian motion, with the simulation and its governing equation on the same screen.',
    'course.intro': 'Current version of the <em>Non-equilibrium Systems</em> block of the course <em>Interactive Experiments in Complex Physical Systems</em> (UCM, 2002), rewritten in JavaScript for modern browsers. In every experiment the values measured in the simulation replace the symbols of the equation in real time, and the theoretical prediction is drawn over the data. Pick an experiment in the sidebar.',
    'course.credits': 'Original course contents: Ricardo Brito (UCM), with J. M. R. Parrondo. Original Java applets (2002-2003): Mario Castro and Mario Encinar. Rewrite, physics audit and texts: Mario Encinar, 2026.',
    'course.original': 'Original course (UCM)',
    'eq.title': 'Live equation',
    'eq.theory': 'theory', 'eq.measured': 'measured',
    'ind.chi2': 'χ²/dof data vs theory',
  },
});
