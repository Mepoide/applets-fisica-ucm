// Shared loader for CDN scripts/styles: one promise per URL, resolved when the
// script has actually executed (a tag that is still loading is awaited, not
// assumed ready).
const pending = new Map();
export function loadScript(src) {
  if (pending.has(src)) return pending.get(src);
  const p = new Promise((res, rej) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { if (existing.dataset.loaded === '1') return res(); existing.addEventListener('load', () => res()); existing.addEventListener('error', rej); return; }
    const s = document.createElement('script'); s.src = src;
    s.onload = () => { s.dataset.loaded = '1'; res(); }; s.onerror = rej;
    document.head.append(s);
  });
  pending.set(src, p);
  return p;
}
export function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l);
}
