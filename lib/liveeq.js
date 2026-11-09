// Live equation panel: a KaTeX formula whose symbols are replaced by the current
// numeric values of the simulation. Slots are marked in the TeX source with
// \htmlId{name}{symbol}; update(values) writes into those nodes without
// re-rendering. Without KaTeX (offline) the panel degrades to plain text.
import { i18n } from './i18n.js';
import { loadScript, loadCss } from './loader.js';

const KATEX_JS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
const KATEX_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';

// Symbol wrapped by \htmlId{name}{...} in a TeX string (balanced braces), or null.
export function symbolOf(tex, name) {
  const key = `\\htmlId{${name}}{`; const i = tex.indexOf(key); if (i < 0) return null;
  let depth = 1, j = i + key.length;
  while (j < tex.length && depth > 0) { if (tex[j] === '{') depth++; else if (tex[j] === '}') depth--; j++; }
  return tex.slice(i + key.length, j - 1);
}
export function slotTex(name, symbol) { return `\\htmlId{${name}}{${symbol}}`; }

// Three significant digits by default; exponent notation outside [1e-3, 1e4).
export function formatValue(v, { digits = 3 } = {}) {
  if (v == null || Number.isNaN(v)) return '—';
  if (v === Infinity) return '∞';
  if (v === -Infinity) return '−∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (Number.isInteger(v) && a < 1e4) return String(v);
  if (a >= 1e4 || a < 1e-3) {
    const e = Math.floor(Math.log10(a));
    const m = v / 10 ** e;
    const ms = Number(m.toPrecision(digits));
    return `${ms}e${e}`;
  }
  return v.toPrecision(digits).replace(/(\.\d*?)0+$/, (m, g) => (g === '.' ? '' : m)).replace(/\.$/, '');
}

// Plain-text rendering used when KaTeX is unavailable: strip \htmlId markers,
// substitute slot symbols by values and remove the most common TeX noise.
export function fallbackText(tex, values = {}, fmt = formatValue) {
  let s = tex.replace(/\\htmlId\{([^}]*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, (m, name, sym) =>
    (name in values ? fmt(values[name]) : sym));
  s = s.replace(/\\(left|right|tfrac|frac|dfrac|mathrm|text|,|;|!)/g, (m, w) => (w === 'frac' || w === 'tfrac' || w === 'dfrac' ? '' : ' '));
  s = s.replace(/\\([A-Za-z]+)/g, '$1').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return s;
}

let katexPromise = null;
export function ensureKatex() {
  if (globalThis.katex) return Promise.resolve(globalThis.katex);
  if (!katexPromise) {
    loadCss(KATEX_CSS);
    katexPromise = loadScript(KATEX_JS).then(() => globalThis.katex).catch(() => null);
  }
  return katexPromise;
}

/**
 * liveEquation(container, { title, kind: 'A'|'B'|'C', equations: [{ tex, slots: { name: { fmt?, label? } } }], indicators: [{ key, label, fmt }] })
 * Returns { update(values), setIndicator(key, value, status), el }.
 * `values` maps slot/indicator names to numbers. `status` ∈ 'ok' | 'warn' | 'none'.
 */
export const KINDS = ['A', 'B', 'C']; // A: model equation (readout) · B: theory vs measurement · C: two methods compared
export function liveEquation(container, { title, kind, equations, indicators = [] }) {
  const d = document;
  const el = d.createElement('div'); el.className = 'liveeq';
  if (title) {
    const h = d.createElement('h3'); const t = d.createElement('span'); t.textContent = i18n.t(title); t.dataset.i18n = title; h.append(t);
    if (kind && KINDS.includes(kind)) {
      const k = d.createElement('span'); k.className = `eq-kind kind-${kind.toLowerCase()}`; k.dataset.i18n = `eq.kind.${kind}`; k.textContent = i18n.t(`eq.kind.${kind}`);
      k.title = i18n.t(`eq.kind.${kind}.long`); k.dataset.i18nTitle = `eq.kind.${kind}.long`; h.append(k);
    }
    el.append(h);
  }
  const eqEls = equations.map((eq) => {
    const row = d.createElement('div'); row.className = 'eq';
    row.dataset.tex = eq.tex;
    row.textContent = fallbackText(eq.tex, {});
    el.append(row);
    return { row, eq };
  });
  // Definitions of the magnitudes: one row per slot with a label (symbol rendered by KaTeX).
  const defs = [];
  const seen = new Set();
  for (const eq of equations) for (const [name, sl] of Object.entries(eq.slots ?? {})) {
    if (!sl?.label || seen.has(sl.label)) continue; seen.add(sl.label);
    const sym = symbolOf(eq.tex, name); if (sym == null) continue;
    defs.push({ sym, label: sl.label });
  }
  let defsEl = null;
  if (defs.length) {
    defsEl = d.createElement('dl'); defsEl.className = 'eq-defs';
    for (const df of defs) {
      const dt = d.createElement('dt'); dt.dataset.tex = df.sym; dt.textContent = fallbackText(df.sym);
      const dd = d.createElement('dd'); dd.dataset.i18n = df.label; dd.textContent = i18n.t(df.label);
      defsEl.append(dt, dd);
    }
    el.append(defsEl);
  }
  let indEl = null;
  const indMap = new Map();
  if (indicators.length) {
    indEl = d.createElement('dl'); indEl.className = 'indicators';
    for (const ind of indicators) {
      const dt = d.createElement('dt'); dt.textContent = i18n.t(ind.label); dt.dataset.i18n = ind.label;
      const dd = d.createElement('dd'); dd.textContent = '—';
      indEl.append(dt, dd); indMap.set(ind.key, { dd, ind });
    }
    el.append(indEl);
  }
  container.append(el);

  let rendered = false; let last = {};
  const slotFmt = (eq, name) => eq.slots?.[name]?.fmt ?? formatValue;
  const applyValues = (values) => {
    for (const { row, eq } of eqEls) {
      if (rendered) {
        for (const name of Object.keys(eq.slots ?? {})) {
          if (!(name in values)) continue;
          const node = row.querySelector(`#${CSS.escape(name)}`);
          if (node) node.textContent = slotFmt(eq, name)(values[name]);
        }
      } else {
        row.textContent = fallbackText(eq.tex, values, formatValue);
      }
    }
  };
  ensureKatex().then((katex) => {
    if (!katex) return;
    for (const { row, eq } of eqEls) {
      try {
        katex.render(eq.tex, row, { displayMode: true, trust: true, throwOnError: false, strict: 'ignore' });
      } catch { /* keep fallback text */ }
      // Slot nodes: give them a class to style and keep the symbol as tooltip.
      for (const name of Object.keys(eq.slots ?? {})) {
        const node = row.querySelector(`#${CSS.escape(name)}`);
        if (node) { node.classList.add('slot'); node.title = eq.slots[name].label ? i18n.t(eq.slots[name].label) : name; }
      }
    }
    if (defsEl) for (const dt of defsEl.querySelectorAll('dt')) { try { katex.render(dt.dataset.tex, dt, { throwOnError: false, strict: 'ignore' }); } catch { /* keep text */ } }
    rendered = true;
    applyValues(last);
  });

  return {
    el,
    update(values) { last = { ...last, ...values }; applyValues(values); },
    setIndicator(key, value, status = 'none') {
      const e = indMap.get(key); if (!e) return;
      e.dd.textContent = (e.ind.fmt ?? formatValue)(value);
      e.dd.className = status;
    },
  };
}
