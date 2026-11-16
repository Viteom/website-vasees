import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { chromium } from 'playwright-core';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5176', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', count = 0, browser, offlineServer;
server.stdout.on('data', data => logs += data.toString());
server.stderr.on('data', data => logs += data.toString());
const ok = (condition, message) => { assert.ok(condition, message); count++; };
const routes = ['/studio', '/consulting', '/tech', '/ecosistema', '/observatorio', '/observatorio/vivir-mas', '/escuela', '/ecosistema/kanna', '/la-chispa'];
try {
  for (let i = 0; i < 100 && !logs.includes('Local:'); i++) {
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  ok(logs.includes('Local:'), 'Production preview starts');
  await mkdir('.qa', { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const titles = new Set();
  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:5176${route}/`);
    const source = await response.text();
    ok(response.ok && source.includes('<h1') && source.includes('vasees-content:start'), `${route}: direct HTML contains rendered content`);
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(`http://127.0.0.1:5176${route}/`, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
      ok(await page.locator('h1').count() === 1, `${route} at ${width}: one heading after hydration`);
      ok(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${route} at ${width}: no horizontal overflow`);
      for (const image of await page.locator('main img').all()) {
        if (!await image.evaluate(el => Boolean(el.closest('.chispa-guest')))) await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
      }
      ok(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth)), `${route} at ${width}: images loaded`);
      await page.evaluate(() => scrollTo(0, 0));
      const slug = route.slice(1).replaceAll('/', '-');
      await page.screenshot({ path: `.qa/inner-${slug}-${width}.png` });
      if (width !== 768) await page.screenshot({ path: `.qa/inner-${slug}-${width}-full.png`, fullPage: true });
      if (width === 1440) titles.add(await page.title());
    }
  }
  ok(titles.size === routes.length, 'Each public page has unique metadata');
  await page.goto('http://127.0.0.1:5176/ecosistema/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Cuidado', exact: true }).click();
  ok(await page.locator('.connection-grid article').count() === 2, 'Connection filter returns care organizations');
  await page.goto('http://127.0.0.1:5176/consulting/', { waitUntil: 'networkidle' });
  await page.locator('.consulting-topics summary').nth(2).click();
  ok(await page.locator('.consulting-topics details').nth(2).getAttribute('open') !== null, 'Consulting topic expands');
  await page.goto('http://127.0.0.1:5176/escuela/', { waitUntil: 'networkidle' });
  ok(await page.locator('.school-landing-hero').isVisible(), 'School landing remains public before login');
  await page.goto('http://127.0.0.1:5176/tech/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Conocer Kánna', exact: true }).click();
  ok(page.url().endsWith('/ecosistema/kanna'), 'Tech links to its initiative');
  await page.goBack();
  await page.locator('.tech-hero').waitFor();
  ok(page.url().includes('/tech'), 'Browser back restores the previous page');
  await page.getByRole('link', { name: 'Diseña tu futuro' }).click();
  await page.locator('#contacto').waitFor();
  ok(page.url().includes('/#contacto') && await page.locator('#contacto form').isVisible(), 'Internal page CTA reaches home contact');
  await page.keyboard.press('Tab');

  // Check the single-file handoff separately: no server routes or asset requests.
  const offlineHtml = await readFile('.qa/Vasees-vista-previa.html');
  offlineServer = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(offlineHtml); });
  await new Promise(resolve => offlineServer.listen(0, '127.0.0.1', resolve));
  const offlineUrl = `http://127.0.0.1:${offlineServer.address().port}`;
  const extraRequests = [];
  const offlinePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  offlinePage.on('pageerror', error => errors.push(error.message));
  offlinePage.on('request', req => { if (!req.isNavigationRequest() && req.url().startsWith('http')) extraRequests.push(req.url()); });
  await offlinePage.goto(offlineUrl, { waitUntil: 'networkidle' });
  await offlinePage.locator('.hero-research').click();
  await offlinePage.locator('.research-article').waitFor();
  await offlinePage.locator('.article-reading aside').getByRole('link', { name: 'Fuentes y contexto' }).click();
  ok(await offlinePage.locator('.research-article').isVisible() && offlinePage.url().includes('section=fuentes'), 'Offline article anchors preserve the page');
  await offlinePage.reload({ waitUntil: 'networkidle' });
  ok(await offlinePage.locator('.research-article').isVisible(), 'Offline article survives reload');
  await offlinePage.getByRole('link', { name: 'Vasees, inicio' }).click();
  await offlinePage.locator('.hero').waitFor();
  ok(offlinePage.url().includes('#inicio'), 'Offline navigation returns home');
  ok(extraRequests.length === 0, 'Offline preview requests no external assets');
  ok(errors.length === 0, `No hydration or browser errors: ${errors.join('; ')}`);
  await writeFile('.qa/pages-test-results.json', JSON.stringify({ passed: count, routes, viewportWidths: [1440, 768, 390], browserErrors: errors, offlineExternalRequests: extraRequests.length }, null, 2));
  console.log(`${count} checks passed across 9 internal pages, 3 viewports and the offline preview.`);
} finally {
  await browser?.close();
  offlineServer?.close();
  server.kill('SIGTERM');
}
