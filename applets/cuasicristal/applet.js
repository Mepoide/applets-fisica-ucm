// Atomic vibrations of a quasicrystal (Fibonacci chain) — Solid State experiment 3.
import { mountDOS } from '../_chain/dosApplet.js';
export const meta = { slug: 'cuasicristal', titleKey: 'qc.title', legacyPath: '../../README.md' };
export function mount(root, opts = {}) { return mountDOS(root, { ...opts, kind: 'fib', slug: meta.slug }); }
