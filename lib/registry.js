// Course registry: the four sections of the UCM course "Experimentos Interactivos en
// Sistemas Físicos Complejos" and every experiment, each listed in one or more sections
// with its number there. Titles live here (not in the applet modules) so the sidebar can
// render before any applet is loaded. `path` is relative to the repo root.
import { i18n } from './i18n.js';

export const SECTIONS = [
  { id: 'fises', titleKey: 'sec.fises', title: { es: 'Física Estadística', en: 'Statistical Physics' },
    desc: { es: 'Del teorema del límite central al modelo de Ising: colectividades, ergodicidad, estadísticas cuánticas y transiciones de fase.', en: 'From the central limit theorem to the Ising model: ensembles, ergodicity, quantum statistics and phase transitions.' } },
  { id: 'sfe', titleKey: 'sec.sfe', title: { es: 'Sistemas fuera del Equilibrio', en: 'Non-equilibrium Systems' },
    desc: { es: 'Irreversibilidad, transporte, ondas en fluidos, reacción-difusión, movimiento browniano y procesos activados.', en: 'Irreversibility, transport, waves in fluids, reaction–diffusion, Brownian motion and activated processes.' } },
  { id: 'fes', titleKey: 'sec.fes', title: { es: 'Física del Estado Sólido', en: 'Solid State Physics' },
    desc: { es: 'Redes, vibraciones, electrones en sólidos ordenados y desordenados, bandas, superficies, RMN y rayos X.', en: 'Lattices, vibrations, electrons in ordered and disordered solids, bands, surfaces, NMR and X-rays.' } },
  { id: 'dc', titleKey: 'sec.dc', title: { es: 'Dispositivos Cuánticos', en: 'Quantum Devices' },
    desc: { es: 'Pozos cuánticos, heterouniones, diodo túnel resonante, superredes y absorción óptica en semiconductores.', en: 'Quantum wells, heterojunctions, resonant tunnelling diode, superlattices and optical absorption in semiconductors.' } },
];

export const REGISTRY = [
  { slug: 'tlc', sections: { fises: 1 }, titleKey: 'tlc.title', path: 'applets/tlc/applet.js',
    title: { es: 'Teorema del límite central', en: 'Central limit theorem' } },
  { slug: 'baker', sections: { fises: 3 }, titleKey: 'baker.title', path: 'applets/baker/applet.js',
    title: { es: 'Transformaciones del panadero y de Arnold', en: 'Baker and Arnold transformations' } },
  { slug: 'cvising', sections: { fises: 5 }, titleKey: 'cvi.title', path: 'applets/cvising/applet.js',
    title: { es: 'Dimensionalidad y límite termodinámico en el modelo de Ising', en: 'Dimensionality and thermodynamic limit in the Ising model' } },
  { slug: 'diatom', sections: { fises: 6 }, titleKey: 'dia.title', path: 'applets/diatom/applet.js',
    title: { es: 'Moléculas diatómicas', en: 'Diatomic molecules' } },
  { slug: 'debye', sections: { fises: 7 }, titleKey: 'deb.title', path: 'applets/debye/applet.js',
    title: { es: 'Vibraciones en sólidos cristalinos: teoría de Debye', en: 'Vibrations in crystalline solids: Debye theory' } },
  { slug: 'macro', sections: { fises: 9 }, titleKey: 'macro.title', path: 'applets/macro/applet.js',
    title: { es: 'Colectividad macrocanónica', en: 'Grand canonical ensemble' } },
  { slug: 'bosefermi', sections: { fises: 10 }, titleKey: 'bf.title', path: 'applets/bosefermi/applet.js',
    title: { es: 'Estadísticas de bosones y fermiones', en: 'Boson and fermion statistics' } },
  { slug: 'ising', sections: { fises: 11 }, titleKey: 'ising.title', path: 'applets/ising/applet.js',
    title: { es: 'Modelo de Ising', en: 'Ising model' } },
  { slug: 'osciladores', sections: { fises: 4 }, titleKey: 'osc.title', path: 'applets/osciladores/applet.js',
    title: { es: 'Ergodicidad y entropía en un conjunto de osciladores', en: 'Ergodicity and entropy in a set of oscillators' } },
  { slug: 'kac', sections: { sfe: 1, fises: 2 }, titleKey: 'kac.title', path: 'applets/kac/applet.js',
    title: { es: 'Anillo de Kac', en: 'Kac ring' } },
  { slug: 'irreversibilidad', sections: { sfe: 2, fises: 8 }, titleKey: 'irrev.title', path: 'applets/irreversibilidad/applet.js',
    title: { es: 'Irreversibilidad y fluctuaciones en equilibrio', en: 'Irreversibility and fluctuations in equilibrium' } },
  { slug: 'conductividad', sections: { sfe: 3 }, titleKey: 'cond.title', path: 'applets/conductividad/applet.js',
    title: { es: 'Conductividad térmica', en: 'Thermal conductivity' } },
  { slug: 'ondas', sections: { sfe: 4 }, titleKey: 'ondas.title', path: 'applets/ondas/applet.js',
    title: { es: 'Ondas sonoras en un fluido', en: 'Sound waves in a fluid' } },
  { slug: 'maginu', sections: { sfe: 5 }, titleKey: 'mag.title', path: 'applets/maginu/applet.js',
    title: { es: 'Reacciones químicas: modelo de Maginu', en: 'Chemical reactions: Maginu model' } },
  { slug: 'browniano', sections: { sfe: 6 }, titleKey: 'brown.title', path: 'applets/browniano/applet.js',
    title: { es: 'Movimiento browniano', en: 'Brownian motion' } },
  { slug: 'potencial', sections: { sfe: 7 }, titleKey: 'pot.title', path: 'applets/potencial/applet.js',
    title: { es: 'Difusión en un potencial externo', en: 'Diffusion in an external potential' } },
  { slug: 'arrhenius', sections: { sfe: 8 }, titleKey: 'arr.title', path: 'applets/arrhenius/applet.js',
    title: { es: 'Procesos de activación: ley de Arrhenius', en: 'Activation processes: Arrhenius law' } },
  { slug: 'resonancia', sections: { sfe: 9 }, titleKey: 'res.title', path: 'applets/resonancia/applet.js',
    title: { es: 'Resonancia estocástica', en: 'Stochastic resonance' } },
  { slug: 'maxwell', sections: { sfe: 10 }, tad: true, titleKey: 'maxwell.title', path: 'applets/maxwell/applet.js',
    title: { es: 'Discos duros y distribución de Maxwell', en: 'Hard disks and the Maxwell distribution' } },
  { slug: 'pila-arena', sections: { sfe: 11 }, tad: true, titleKey: 'pila.title', path: 'applets/pila-arena/applet.js',
    title: { es: 'Pila de arena y criticalidad autoorganizada', en: 'Sandpile and self-organized criticality' } },
  { slug: 'von-karman', sections: { sfe: 12 }, tad: true, titleKey: 'vk.title', path: 'applets/von-karman/applet.js',
    title: { es: 'Gas reticular con obstáculo: calle de Von Kármán', en: 'Lattice gas with an obstacle: Von Kármán street' } },
];

export const FES_ENTRIES = [
  { slug: 'madelung', sections: { fes: 1 }, titleKey: 'mad.title', path: 'applets/madelung/applet.js',
    title: { es: 'Evaluación de la constante de Madelung', en: 'Evaluation of the Madelung constant' } },
  { slug: 'cadena-desordenada', sections: { fes: 2 }, titleKey: 'cad.title', path: 'applets/cadena-desordenada/applet.js',
    title: { es: 'Vibraciones atómicas de una red desordenada', en: 'Atomic vibrations of a disordered lattice' } },
  { slug: 'cuasicristal', sections: { fes: 3 }, titleKey: 'qc.title', path: 'applets/cuasicristal/applet.js',
    title: { es: 'Vibraciones atómicas de un cuasicristal', en: 'Atomic vibrations of a quasicrystal' } },
  { slug: 'conductividad-cadena', sections: { fes: 4 }, titleKey: 'ccad.title', path: 'applets/conductividad-cadena/applet.js',
    title: { es: 'Conductividad térmica de una cadena desordenada', en: 'Thermal conductivity of a disordered chain' } },
];
REGISTRY.push(...FES_ENTRIES);

// Static course pages (Markdown in docs/<lang>/curso/<id>.md).
export const PAGES = [
  { id: 'presentacion', titleKey: 'page.presentacion', title: { es: 'Presentación', en: 'Presentation' } },
  { id: 'bibliografia', titleKey: 'page.bibliografia', title: { es: 'Bibliografía', en: 'Bibliography' } },
  { id: 'enlaces', titleKey: 'page.enlaces', title: { es: 'Enlaces', en: 'Links' } },
  { id: 'creditos', titleKey: 'page.creditos', title: { es: 'Créditos', en: 'Credits' } },
];

// Titles of applets embedded in other experiments (standalone pages still need them).
const es = { 'onda.title': 'Gas reticular FHP: onda sonora y perfil de densidad', 'modos.title': 'Modos de la hidrodinámica linealizada', 'fluct.title': 'Fluctuaciones de ocupación en una ventana' };
const en = { 'onda.title': 'FHP lattice gas: sound wave and density profile', 'modos.title': 'Linearized hydrodynamics modes', 'fluct.title': 'Occupation fluctuations in a window' };
for (const r of REGISTRY) { es[r.titleKey] = r.title.es; en[r.titleKey] = r.title.en; }
for (const s of SECTIONS) { es[s.titleKey] = s.title.es; en[s.titleKey] = s.title.en; es[`${s.titleKey}.desc`] = s.desc.es; en[`${s.titleKey}.desc`] = s.desc.en; }
for (const p of PAGES) { es[p.titleKey] = p.title.es; en[p.titleKey] = p.title.en; }
i18n.register({ es, en });

export function bySlug(slug) { return REGISTRY.find((r) => r.slug === slug) ?? null; }
export function sectionById(id) { return SECTIONS.find((s) => s.id === id) ?? null; }
export function pageById(id) { return PAGES.find((p) => p.id === id) ?? null; }
// Experiments of a section, sorted by their number in that section.
export function experimentsOf(id) {
  return REGISTRY.filter((r) => r.sections[id] != null).sort((a, b) => a.sections[id] - b.sections[id]);
}
// Backwards compatibility: the "Sistemas fuera del Equilibrio" list.
export function experiments() { return experimentsOf('sfe'); }
export function extras() { return []; }
// First section (in SECTIONS order) that lists the experiment.
export function primarySection(entry) { return SECTIONS.find((s) => entry.sections[s.id] != null)?.id ?? null; }
