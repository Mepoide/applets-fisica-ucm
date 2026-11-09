// Browser smoke test. Serves the repo (or uses BASE_URL for a deployed site),
// opens every applet standalone page in both languages and every course route
// in the shell, presses Start, checks for console errors, that the canvas
// changed, that the live-equation panel and the theory rendered. Saves one
// screenshot per applet and of the course. Usage: node tests/browser/smoke.mjs [slug ...]
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const PORT = 8123;
const BASE = (process.env.BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, '');
const root = new URL('../../', import.meta.url).pathname;
const slugs = process.argv.slice(2).length ? process.argv.slice(2)
  : readdirSync(`${root}applets`).filter((d) => !d.startsWith('_') && existsSync(`${root}applets/${d}/index.html`));
const { REGISTRY, SECTIONS, PAGES } = await import(`${root}lib/registry.js`);

const server = process.env.BASE_URL ? null
  : spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));

const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => existsSync(p));
const browser = await chromium.launch({ executablePath: exe, headless: true });
let failures = 0;
const canvasHash = (page) => page.evaluate(() => [...document.querySelectorAll('canvas')].map((c) => c.toDataURL().length + ':' + c.toDataURL().slice(-64)).join('|'));
const md5 = (s) => createHash('md5').update(s).digest('hex');

// Run the standard checks on a page where an applet is visible.
async function exercise(page, label, errors, { screenshot } = {}) {
  await page.waitForSelector('button.primary', { timeout: 15000 });
  await page.waitForTimeout(300);
  const before = await canvasHash(page);
  await page.click('button.primary');
  await page.waitForTimeout(1200);
  const after = await canvasHash(page);
  const changed = md5(before) !== md5(after);
  let theoryText = '';
  const hasSections = await page.$('.theory-sections');
  if (hasSections) {
    await page.waitForSelector('.theory-sections details.sec', { timeout: 15000 }).catch(() => {});
    theoryText = await page.$eval('.theory-sections', (el) => el.textContent.trim().slice(0, 60)).catch(() => '');
  } else {
    await page.click('button[data-tab="theory"]');
    await page.waitForTimeout(1500);
    theoryText = await page.$eval('#theory .theory', (el) => el.textContent.trim().slice(0, 60)).catch(() => '');
  }
  const hasEq = (await page.$('.liveeq')) != null;
  const eqRendered = hasEq ? (await page.$('.liveeq .katex')) != null : true;
  const ok = errors.length === 0 && changed && theoryText.length > 0 && eqRendered;
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label} canvasChanged=${changed} errors=${errors.length} liveeq=${hasEq ? (eqRendered ? 'katex' : 'fallback') : 'none'} theory="${theoryText.replace(/\s+/g, ' ')}"`);
  for (const e of errors) console.log(`      ${e}`);
  if (screenshot && !process.env.BASE_URL) {
    if (!hasSections) { await page.click('button[data-tab="sim"]'); await page.waitForTimeout(300); }
    await page.screenshot({ path: screenshot, fullPage: true });
  }
}

// Standalone pages.
for (const slug of slugs) {
  for (const lang of ['es', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    try {
      await page.goto(`${BASE}/applets/${slug}/index.html?lang=${lang}`, { waitUntil: 'networkidle' });
      const title = await page.title();
      await exercise(page, `${slug} [${lang}] title="${title}"`, errors, { screenshot: lang === 'es' ? `${root}docs/screenshots/${slug}.png` : null });
    } catch (e) { failures++; console.log(`FAIL ${slug} [${lang}] ${e.message}`); }
    await page.close();
  }
}

// Course shell: home, then every registered route in one page (tests destroy/mount).
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  const links = await page.$$eval('#sidebar a[data-slug]', (a) => new Set(a.map((x) => x.dataset.slug)).size);
  await page.waitForTimeout(600);
  const hero = (await page.$('.hero canvas')) != null;
  const homeOk = errors.length === 0 && links === REGISTRY.length && (await page.$('.home')) != null && hero;
  console.log(`${homeOk ? 'OK  ' : 'FAIL'} course home links=${links}/${REGISTRY.length} hero=${hero} errors=${errors.length}`);
  if (!homeOk) failures++;
  for (const p of PAGES) {
    errors.length = 0;
    await page.evaluate((h) => { location.hash = h; }, `#/${p.id}`);
    await page.waitForSelector('article.page h1, article.page h2', { timeout: 20000 }).catch(() => {});
    const txt = await page.$eval('article.page', (el) => el.textContent.trim().length).catch(() => 0);
    const ok = errors.length === 0 && txt > 200;
    console.log(`${ok ? 'OK  ' : 'FAIL'} course page #/${p.id} chars=${txt} errors=${errors.length}`); if (!ok) failures++;
  }
  for (const s of SECTIONS) {
    errors.length = 0;
    await page.evaluate((h) => { location.hash = h; }, `#/s/${s.id}`);
    await page.waitForSelector('.section-index', { timeout: 10000 }).catch(() => {});
    const n = await page.$$eval('.section-index a.card', (a) => a.length).catch(() => -1);
    const ok = errors.length === 0 && n >= 0;
    console.log(`${ok ? 'OK  ' : 'FAIL'} course section #/s/${s.id} cards=${n} errors=${errors.length}`); if (!ok) failures++;
  }
  const routes = REGISTRY.filter((r) => !slugs.length || process.argv.length <= 2 || slugs.includes(r.slug));
  for (const r of routes) {
    errors.length = 0;
    try {
      await page.evaluate((h) => { location.hash = h; }, `#/${r.slug}`);
      await page.waitForSelector(`#sidebar a[data-slug="${r.slug}"][aria-current="page"]`, { timeout: 10000 });
      await exercise(page, `course #/${r.slug}`, errors, { screenshot: r.slug === routes[0].slug ? `${root}docs/screenshots/course.png` : null });
      if (r.slug === routes[0].slug && !process.env.BASE_URL) { await page.evaluate(() => { location.hash = '#/'; }); await page.waitForSelector('.hero canvas'); await page.waitForTimeout(900); await page.screenshot({ path: `${root}docs/screenshots/home.png`, fullPage: true }); }
    } catch (e) { failures++; console.log(`FAIL course #/${r.slug} ${e.message}`); }
  }
  // Mobile layout: sidebar hidden until toggled.
  await page.setViewportSize({ width: 420, height: 800 });
  await page.waitForTimeout(300);
  const hidden = await page.$eval('#sidebar', (el) => getComputedStyle(el).display === 'none');
  await page.click('#nav-toggle');
  const shown = await page.$eval('#sidebar', (el) => getComputedStyle(el).display !== 'none');
  console.log(`${hidden && shown ? 'OK  ' : 'FAIL'} mobile nav hidden=${hidden} toggled=${shown}`);
  if (!(hidden && shown)) failures++;
  await page.close();
}
await browser.close();
server?.kill();
process.exit(failures ? 1 : 0);
