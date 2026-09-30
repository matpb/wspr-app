import { createRequire } from 'module';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
const require = createRequire('/home/mat/Documents/cortexmind.net/package.json');
const { chromium } = require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pages = JSON.parse(readFileSync(resolve(root, 'tools/og/pages.json'), 'utf8'));
const only = process.argv[2];
const todo = only ? pages.filter(p => p.slug === only) : pages;
if (!todo.length) { console.error('unknown slug: ' + only); process.exit(1); }
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const p of todo) {
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:8811/tools/og/template.html?slug=${p.slug}`);
  await page.waitForFunction('window.__ready === true');
  await page.evaluate(() => document.fonts.ready);
  const out = resolve(root, p.out);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out });
  await page.close();
  console.log('wrote ' + p.out);
}
await browser.close();
