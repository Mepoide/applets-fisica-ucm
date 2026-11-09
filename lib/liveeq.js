// Live equation panel: a KaTeX formula whose symbols are replaced by the current
// numeric values of the simulation. Slots are marked in the TeX source with
// \htmlId{name}{symbol}; update(values) writes into those nodes without
// re-rendering. Without KaTeX (offline) the panel degrades to plain text.
import { i18n } from './i18n.js';

const KATEX_JS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
const KATEX_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';

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

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { if (globalThis.katex) res(); else document.querySelector(`script[src="${src}"]`).addEventListener('load', res); return; }
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s);
  });
}
function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l);
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
 * liveEquation(container, { title, equations: [{ tex, slots: { name: { fmt?, label? } } }], indicators: [{ key, label, fmt }] })
 * Returns { update(values), setIndicator(key, value, status), el }.
 * `values` maps slot/indicator names to numbers. `status` ∈ 'ok' | 'warn' | 'none'.
 */
export function liveEquation(container, { title, equations, indicators = [] }) {
  const d = document;
  const el = d.createElement('div'); el.className = 'liveeq';
  if (title) { const h = d.createElement('h3'); h.textContent = i18n.t(title); h.dataset.i18n = title; el.append(h); }
  const eqEls = equations.map((eq) => {
    const row = d.createElement('div'); row.className = 'eq';
    row.dataset.tex = eq.tex;
    row.textContent = fallbackText(eq.tex, {});
    el.append(row);
    return { row, eq };
  });
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
