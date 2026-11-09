// Browser smoke test: serves the repo, opens every applet in both languages,
// presses Start, waits, checks for console errors and that the canvas changed,
// and saves a screenshot per applet. Usage: node tests/browser/smoke.mjs [slug ...]
// Set BASE_URL (e.g. https://mepoide.github.io/applets-fisica-ucm) to test a deployed
// site instead of a local server; screenshots are then skipped.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const PORT = 8123;
const BASE = (process.env.BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, '');
const root = new URL('../../', import.meta.url).pathname;
const slugs = process.argv.slice(2).length ? process.argv.slice(2)
  : readdirSync(`${root}applets`).filter((d) => !d.startsWith('_') && existsSync(`${root}applets/${d}/index.html`));

const server = process.env.BASE_URL ? null
  : spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));

const exe = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => existsSync(p));
const browser = await chromium.launch({ executablePath: exe, headless: true });
let failures = 0;
const canvasHash = (page) => page.evaluate(() => [...document.querySelectorAll('canvas')].map((c) => c.toDataURL().length + ':' + c.toDataURL().slice(-64)).join('|'));

for (const slug of slugs) {
  for (const lang of ['es', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    const url = `${BASE}/applets/${slug}/index.html?lang=${lang}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const before = await canvasHash(page);
      await page.click('button.primary');
      await page.waitForTimeout(1200);
      const after = await canvasHash(page);
      const title = await page.title();
      const changed = createHash('md5').update(before).digest('hex') !== createHash('md5').update(after).digest('hex');
      // Theory tab must render without errors too.
      await page.click('button[data-tab="theory"]');
      await page.waitForTimeout(1500);
      const theoryText = await page.$eval('#theory .theory', (el) => el.textContent.trim().slice(0, 60));
      const ok = errors.length === 0 && changed && theoryText.length > 0;
      if (!ok) failures++;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${slug} [${lang}] title="${title}" canvasChanged=${changed} errors=${errors.length} theory="${theoryText.replace(/\s+/g, ' ')}"`);
      for (const e of errors) console.log(`      ${e}`);
      if (lang === 'es' && !process.env.BASE_URL) {
        await page.click('button[data-tab="sim"]');
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${root}docs/screenshots/${slug}.png`, fullPage: true });
      }
    } catch (e) {
      failures++; console.log(`FAIL ${slug} [${lang}] ${e.message}`);
    }
    await page.close();
  }
}
// Landing page
{
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  const n = await page.$$eval('a.card', (a) => a.length);
  console.log(`${errors.length === 0 && n === 6 ? 'OK  ' : 'FAIL'} index cards=${n} errors=${errors.length}`);
  if (!(errors.length === 0 && n === 6)) failures++;
  await page.screenshot({ path: `${root}docs/screenshots/index.png`, fullPage: true });
  await page.close();
}
await browser.close();
server?.kill();
process.exit(failures ? 1 : 0);
