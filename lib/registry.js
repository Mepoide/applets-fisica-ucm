// Course registry: the nine experiments of "Sistemas fuera del Equilibrio" in
// the order of the original UCM course, plus the extra material from the TAD.
// Titles live here (not in the applet modules) so the sidebar can render
// before any applet is loaded. `path` is relative to the repo root.
import { i18n } from './i18n.js';

export const REGISTRY = [
  { slug: 'kac', number: 1, titleKey: 'kac.title', path: 'applets/kac/applet.js',
    title: { es: 'Anillo de Kac', en: 'Kac ring' } },
  { slug: 'irreversibilidad', number: 2, titleKey: 'irrev.title', path: 'applets/irreversibilidad/applet.js',
    title: { es: 'Irreversibilidad y fluctuaciones en equilibrio', en: 'Irreversibility and fluctuations in equilibrium' } },
  { slug: 'conductividad', number: 3, titleKey: 'cond.title', path: 'applets/conductividad/applet.js',
    title: { es: 'Conductividad térmica', en: 'Thermal conductivity' } },
  { slug: 'ondas', number: 4, titleKey: 'ondas.title', path: 'applets/ondas/applet.js',
    title: { es: 'Ondas sonoras en un fluido', en: 'Sound waves in a fluid' } },
  { slug: 'maginu', number: 5, titleKey: 'mag.title', path: 'applets/maginu/applet.js',
    title: { es: 'Reacciones químicas: modelo de Maginu', en: 'Chemical reactions: Maginu model' } },
  { slug: 'browniano', number: 6, titleKey: 'brown.title', path: 'applets/browniano/applet.js',
    title: { es: 'Movimiento browniano', en: 'Brownian motion' } },
  { slug: 'potencial', number: 7, titleKey: 'pot.title', path: 'applets/potencial/applet.js',
    title: { es: 'Difusión en un potencial externo', en: 'Diffusion in an external potential' } },
  { slug: 'arrhenius', number: 8, titleKey: 'arr.title', path: 'applets/arrhenius/applet.js',
    title: { es: 'Procesos de activación: ley de Arrhenius', en: 'Activation processes: Arrhenius law' } },
  { slug: 'resonancia', number: 9, titleKey: 'res.title', path: 'applets/resonancia/applet.js',
    title: { es: 'Resonancia estocástica', en: 'Stochastic resonance' } },
  { slug: 'maxwell', extra: true, titleKey: 'maxwell.title', path: 'applets/maxwell/applet.js',
    title: { es: 'Discos duros y distribución de Maxwell', en: 'Hard disks and the Maxwell distribution' } },
  { slug: 'pila-arena', extra: true, titleKey: 'pila.title', path: 'applets/pila-arena/applet.js',
    title: { es: 'Pila de arena y criticalidad autoorganizada', en: 'Sandpile and self-organized criticality' } },
  { slug: 'von-karman', extra: true, titleKey: 'vk.title', path: 'applets/von-karman/applet.js',
    title: { es: 'Gas reticular con obstáculo: calle de Von Kármán', en: 'Lattice gas with an obstacle: Von Kármán street' } },
];

const es = { 'onda.title': 'Gas reticular FHP: onda sonora y perfil de densidad', 'modos.title': 'Modos de la hidrodinámica linealizada' };
const en = { 'onda.title': 'FHP lattice gas: sound wave and density profile', 'modos.title': 'Linearized hydrodynamics modes' };
for (const r of REGISTRY) { es[r.titleKey] = r.title.es; en[r.titleKey] = r.title.en; }
i18n.register({ es, en });

export function bySlug(slug) { return REGISTRY.find((r) => r.slug === slug) ?? null; }
export function experiments() { return REGISTRY.filter((r) => !r.extra).sort((a, b) => a.number - b.number); }
export function extras() { return REGISTRY.filter((r) => r.extra); }
