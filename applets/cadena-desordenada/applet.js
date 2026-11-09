// Atomic vibrations of a disordered lattice — Solid State experiment 2.
import { mountDOS } from '../_chain/dosApplet.js';
export const meta = { slug: 'cadena-desordenada', titleKey: 'cad.title', legacyPath: '../../README.md' };
export function mount(root, opts = {}) { return mountDOS(root, { ...opts, kind: 'random', slug: meta.slug }); }
