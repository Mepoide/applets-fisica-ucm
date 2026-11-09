// Grand canonical ensemble — Statistical Physics experiment 9: the window-fluctuation applet
// with its own theory sheet (Poisson as the grand-canonical distribution of an ideal gas).
import { i18n } from '../../lib/i18n.js';
import { mountSections } from '../../lib/page.js';
import * as Fl from '../fluctuaciones/applet.js';

export const meta = { slug: 'macro', titleKey: 'macro.title', legacyPath: 'CORRELACION/CANONICAAPPLET.JAVA' };

i18n.register({
  es: { 'macro.intro': 'La región que dibujas con el ratón es el "sistema"; el resto de la caja, el foco de partículas y energía. Con una ventana pequeña (p ≪ 1) el número de partículas dentro sigue la distribución de Poisson de la colectividad macrocanónica; al agrandarla deja de cumplirse la hipótesis N ≪ N_total y la distribución exacta pasa a ser la binomial.' },
  en: { 'macro.intro': 'The region you draw with the mouse is the "system"; the rest of the box, the particle and energy reservoir. With a small window (p ≪ 1) the number of particles inside follows the Poisson distribution of the grand canonical ensemble; as it grows the hypothesis N ≪ N_total fails and the exact distribution becomes the binomial.' },
});

export function mount(root, { root: base = '../..' } = {}) {
  root.innerHTML = '<p class="hint view-intro"></p><div class="view-host"></div><div class="theory-sections"></div>';
  root.querySelector('.view-intro').textContent = i18n.t('macro.intro');
  const handle = Fl.mount(root.querySelector('.view-host'), { root: base, embedded: true });
  mountSections(root.querySelector('.theory-sections'), meta.slug, base);
  return { get loop() { return handle.loop; }, destroy() { handle.destroy(); root.replaceChildren(); } };
}
