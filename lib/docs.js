// Theory tab: fetches docs/<lang>/<slug>.md and renders it with marked + KaTeX
// loaded from cdnjs (fixed versions). Falls back to raw Markdown in a <pre>.
import { i18n } from './i18n.js';

const MARKED = 'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js';
const KATEX_JS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
const KATEX_AUTO = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
const KATEX_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s);
  });
}
function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l);
}

// Protect $...$ and $$...$$ from the Markdown parser, restore afterwards.
function protectMath(md) {
  const slots = [];
  const put = (s) => { slots.push(s); return `\u0000${slots.length - 1}\u0000`; };
  md = md.replace(/\$\$[\s\S]+?\$\$/g, put).replace(/(^|[^\\$])\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)/g, (m, pre, body) => pre + put(`$${body}$`));
  return { md, restore: (html) => html.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)]) };
}

export async function mount(container, slug, root = '../..') {
  container.innerHTML = `<p class="muted">${i18n.t('docs.loading')}</p>`;
  const url = `${root}/docs/${i18n.lang}/${slug}.md`;
  let md;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.statusText);
    md = await r.text();
  } catch {
    container.innerHTML = `<p class="muted">${i18n.t('docs.error')} <a href="${url}">${url}</a></p>`;
    return;
  }
  try {
    await loadScript(MARKED);
    loadCss(KATEX_CSS);
    await loadScript(KATEX_JS);
    await loadScript(KATEX_AUTO);
    const { md: safe, restore } = protectMath(md);
    container.innerHTML = restore(globalThis.marked.parse(safe));
    globalThis.renderMathInElement(container, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false,
    });
  } catch {
    const pre = document.createElement('pre'); pre.className = 'raw-md'; pre.textContent = md;
    container.replaceChildren(pre);
  }
}
