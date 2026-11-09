// Dev helper: node tests/browser/shot.mjs <slug> [es|en] [theory|<ms to run>] [out.png]
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const [slug, lang = 'es', tab = 'theory', out = 'theory.png'] = process.argv.slice(2);
const root = new URL("../../", import.meta.url).pathname;
const server = spawn('python3', ['-m', 'http.server', '8124', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
await page.goto(`http://127.0.0.1:8124/applets/${slug}/index.html?lang=${lang}`, { waitUntil: 'networkidle' });
if (tab === 'theory') { await page.click('button[data-tab="theory"]'); await page.waitForTimeout(2500); }
else { await page.click('button.primary'); await page.waitForTimeout(Number(tab) || 1500); }
await page.screenshot({ path: out, fullPage: false });
await browser.close(); server.kill();
