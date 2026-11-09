// Theory tab: fetches docs/<lang>/<slug>.md and renders it with marked + KaTeX
// loaded from cdnjs (fixed versions). Falls back to raw Markdown in a <pre>.
import { i18n } from './i18n.js';
import { loadScript, loadCss } from './loader.js';

const MARKED = 'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js';
const KATEX_JS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
const KATEX_AUTO = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
const KATEX_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';


// Protect $...$ and $$...$$ from the Markdown parser, restore afterwards.
function protectMath(md) {
  const slots = [];
  const put = (s) => { slots.push(s); return `\u0000${slots.length - 1}\u0000`; };
  md = md.replace(/\$\$[\s\S]+?\$\$/g, put).replace(/(^|[^\\$])\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)/g, (m, pre, body) => pre + put(`$${body}$`));
  return { md, restore: (html) => html.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)]) };
}

// Split Markdown into sections at level-1/2 headings. Keeps the intro under the title.
export function splitSections(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let cur = { title: '', body: [], level: 0 };
  for (const line of lines) {
    const m = /^(#{1,2})\s+(.*)$/.exec(line);
    if (m) {
      if (cur.title || cur.body.some((l) => l.trim())) out.push(cur);
      cur = { title: m[2].trim(), body: [], level: m[1].length };
    } else cur.body.push(line);
  }
  out.push(cur);
  return out.map((s) => ({ title: s.title, body: s.body.join('\n').trim(), level: s.level }));
}

async function loadRenderers() {
  await loadScript(MARKED);
  loadCss(KATEX_CSS);
  await loadScript(KATEX_JS);
  await loadScript(KATEX_AUTO);
}
function renderMarkdown(target, md) {
  const { md: safe, restore } = protectMath(md);
  target.innerHTML = restore(globalThis.marked.parse(safe));
  globalThis.renderMathInElement(target, {
    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
    throwOnError: false,
  });
}
async function fetchDoc(container, slug, root) {
  const url = `${root}/docs/${i18n.lang}/${slug}.md`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.statusText);
    return await r.text();
  } catch {
    container.innerHTML = `<p class="muted">${i18n.t('docs.error')} <a href="${url}">${url}</a></p>`;
    return null;
  }
}

// Theory as collapsible <details> sections (first one open) below the simulation.
export async function mountSections(container, slug, root = '../..') {
  container.innerHTML = `<p class="muted">${i18n.t('docs.loading')}</p>`;
  const md = await fetchDoc(container, slug, root);
  if (md == null) return;
  const isAuthors = (s) => /^(Cambios respecto|Changes with respect)/i.test(s.title);
  const all = splitSections(md).filter((s) => s.level !== 1 || s.body);
  const sections = [...all.filter((s) => !isAuthors(s)), ...all.filter(isAuthors)];
  container.replaceChildren();
  let ok = true;
  try { await loadRenderers(); } catch { ok = false; }
  sections.forEach((sec, i) => {
    const det = document.createElement('details'); det.className = 'sec'; if (i === 0) det.open = true;
    if (isAuthors(sec)) det.classList.add('sec-authors');
    const sum = document.createElement('summary'); sum.textContent = sec.title || i18n.t('docs.intro'); det.append(sum);
    const body = document.createElement('div'); body.className = 'theory';
    if (ok) { try { renderMarkdown(body, sec.body); } catch { ok = false; } }
    if (isAuthors(sec)) { const note = document.createElement('p'); note.className = 'authors-note'; note.textContent = i18n.t('docs.authorsNote'); body.prepend(note); }
    if (!ok) { const pre = document.createElement('pre'); pre.className = 'raw-md'; pre.textContent = sec.body; body.replaceChildren(pre); }
    det.append(body); container.append(det);
  });
}

export async function mount(container, slug, root = '../..') {
  container.innerHTML = `<p class="muted">${i18n.t('docs.loading')}</p>`;
  const md = await fetchDoc(container, slug, root);
  if (md == null) return;
  try {
    await loadRenderers();
    renderMarkdown(container, md);
  } catch {
    const pre = document.createElement('pre'); pre.className = 'raw-md'; pre.textContent = md;
    container.replaceChildren(pre);
  }
}
