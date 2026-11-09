// Sound waves in a fluid — experiment 4. Two views: the FHP lattice-gas
// simulation (with the linear acoustic prediction overlaid) and the analytic
// linearized-hydrodynamics modes of a real (thermal) fluid.
import { i18n } from '../../lib/i18n.js';
import { select } from '../../lib/ui.js';
import { mountSections } from '../../lib/page.js';
import * as Onda from '../onda-lgca/applet.js';
import * as Modos from '../modos-lineales/applet.js';

export const meta = { slug: 'ondas', titleKey: 'ondas.title', legacyPath: 'PERFILDENSIDAD/EJERC23.JAVA', number: 4 };

i18n.register({
  es: {
    'ondas.view': 'Vista', 'ondas.view.fhp': 'A · Simulación: gas reticular FHP', 'ondas.view.lineal': 'B · Teoría: modos de la hidrodinámica linealizada',
    'ondas.intro.fhp': 'Un hueco de densidad en un gas reticular emite una onda sonora cilíndrica. Sobre el perfil radial medido (rojo) se dibuja la predicción de la teoría lineal (azul) con la velocidad del sonido y la atenuación del propio modelo FHP.',
    'ondas.intro.lineal': 'En un fluido real la perturbación se reparte entre dos modos sonoros (Brillouin), que viajan a ±c_s, y un modo térmico (Rayleigh) que difunde sin propagarse. El gas reticular FHP es atérmico: solo tiene los modos sonoros.',
  },
  en: {
    'ondas.view': 'View', 'ondas.view.fhp': 'A · Simulation: FHP lattice gas', 'ondas.view.lineal': 'B · Theory: linearized hydrodynamics modes',
    'ondas.intro.fhp': 'A density hole in a lattice gas emits a cylindrical sound wave. The linear-theory prediction (blue), with the sound speed and attenuation of the FHP model itself, is drawn over the measured radial profile (red).',
    'ondas.intro.lineal': 'In a real fluid the perturbation splits into two sound (Brillouin) modes travelling at ±c_s and a thermal (Rayleigh) mode that diffuses without propagating. The FHP lattice gas is athermal: it only has the sound modes.',
  },
});

export function mount(root, { root: base = '../..' } = {}) {
  root.innerHTML = '<div class="params view-select"></div><p class="hint view-intro"></p><div class="view-host"></div><div class="theory-sections"></div>';
  const host = root.querySelector('.view-host'), intro = root.querySelector('.view-intro');
  const pView = select({ label: 'ondas.view', value: 'fhp', options: ['fhp', 'lineal'].map((v) => ({ value: v, label: `ondas.view.${v}` })), onChange: (v) => show(v) });
  root.querySelector('.view-select').append(pView.el);
  let handle = null;
  function show(v) {
    handle?.destroy?.(); host.replaceChildren();
    intro.textContent = i18n.t(`ondas.intro.${v}`);
    handle = (v === 'fhp' ? Onda : Modos).mount(host, { root: base, embedded: true });
    i18n.apply(host); window.dispatchEvent(new Event('resize'));
  }
  show('fhp');
  mountSections(root.querySelector('.theory-sections'), meta.slug, base);
  return { get loop() { return handle?.loop; }, destroy() { handle?.destroy?.(); root.replaceChildren(); } };
}
