import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { chromium } from 'playwright-core';

const base = 'http://127.0.0.1:5180';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5180', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser, offlineServer, passed = 0;
const errors = [], accessibility = [];
const ok = (value, message) => { assert.ok(value, message); passed++; };
server.stdout.on('data', data => logs += data);
server.stderr.on('data', data => logs += data);
const podcastUrl = 'https://www.youtube.com/watch?v=7Ort5R5x3uw&list=PLaG_NWeV7NTimxYWh-43EY51tzXed_r8X';
async function audit(page, name, selector) {
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const results = await page.evaluate(async ({ selector }) => window.axe.run(selector || document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }), { selector });
  accessibility.push({ name, violations: results.violations });
  ok(results.violations.length === 0, `${name}: ${JSON.stringify(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })))}`);
}
try {
  for (let i = 0; i < 100 && !/Local/.test(logs); i++) {
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  ok(/Local/.test(logs), 'Production server starts');
  await mkdir('.qa/brands', { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  // Verify the embed configuration without depending on third-party playback/network access.
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html lang="es"><title>Reproductor de prueba</title><body>Reproductor de prueba</body></html>' }));
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const path of ['/', '/ecosistema/', '/la-chispa/']) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
      await page.evaluate(() => document.fonts.ready);
      ok(await page.locator('h1').count() === 1 && await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${path} ${width}: unique H1 and no overflow`);
      if (path !== '/la-chispa/') {
        const cards = page.locator('.ecosystem-grid');
        await cards.scrollIntoViewIfNeeded();
        for (const img of await cards.locator('img').all()) await img.evaluate(img => img.decode());
        ok(await cards.locator('article').count() === 3, `${path} ${width}: three initiatives`);
        const palette = await cards.locator('article').evaluateAll(items => items.map(item => getComputedStyle(item).backgroundColor));
        ok(JSON.stringify(palette) === JSON.stringify(['rgb(244, 242, 236)', 'rgb(229, 87, 45)', 'rgb(7, 86, 216)']), `${path} ${width}: brand colors`);
        if (width !== 768) await audit(page, `${path} cards ${width}`, '.ecosystem-grid');
        if (path === '/') {
          await page.evaluate(() => document.activeElement?.blur());
          if (width === 390) await page.screenshot({ path: `.qa/brands/cards-${width}.png` });
          else await cards.screenshot({ path: `.qa/brands/cards-${width}.png` });
        }
      } else {
        for (const img of await page.locator('main img').all()) { if (!await img.evaluate(el => Boolean(el.closest('.chispa-guest')))) await img.scrollIntoViewIfNeeded(); await img.evaluate(img => img.decode()); }
        ok(await page.locator('main img').evaluateAll(items => items.every(img => img.complete && img.naturalWidth)), `La Chispa ${width}: all photography/logos load`);
        ok(await page.locator('.chispa-photo-button').count() === 5, `La Chispa ${width}: five photograph controls`);
        ok(await page.locator('main a[href$=".pdf"]').count() === 0, `La Chispa ${width}: no source PDF publication`);
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `.qa/brands/chispa-${width}.png` });
        await page.screenshot({ path: `.qa/brands/chispa-${width}-full.png`, fullPage: true });
        if (width !== 768) {
          await audit(page, `La Chispa ${width}`);
          const first = page.locator('.chispa-photo-button').first();
          await first.click();
          const dialog = page.getByRole('dialog');
          ok(await dialog.isVisible() && await dialog.getAttribute('aria-label') === 'Cartografía de Pieles · Fotografía 1 de 5', `Gallery ${width}: opens first photograph`);
          await page.getByRole('button', { name: 'Fotografía anterior', exact: true }).click();
          ok((await dialog.getAttribute('aria-label')).endsWith('5 de 5'), `Gallery ${width}: previous wraps`);
          await page.getByRole('button', { name: 'Fotografía siguiente', exact: true }).click();
          ok((await dialog.getAttribute('aria-label')).endsWith('1 de 5'), `Gallery ${width}: next wraps`);
          await audit(page, `Gallery ${width}`);
          await page.screenshot({ path: `.qa/brands/gallery-${width}.png` });
          await page.keyboard.press('Escape');
          ok(!await dialog.isVisible() && await first.evaluate(el => el === document.activeElement), `Gallery ${width}: Escape and focus restore`);
          await page.locator('.chispa-gallery-grid .chispa-photo-button').nth(2).click();
          ok((await dialog.getAttribute('aria-label')).endsWith('4 de 5'), `Gallery ${width}: chosen photograph opens`);
          await page.getByRole('button', { name: 'Cerrar ventana', exact: true }).click();
        }
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/la-chispa/', { waitUntil: 'networkidle' });
  await page.locator('.chispa-local-nav').getByRole('link', { name: 'El podcast', exact: true }).click();
  ok(page.url().endsWith('#podcast'), 'Podcast section navigation');
  const links = page.locator('.chispa-podcast a');
  ok((await links.evaluateAll(items => items.map(item => item.href))).every(href => href === podcastUrl), 'Podcast links use the URL supplied by the user');
  ok(await page.locator('.chispa-podcast iframe').count() === 0, 'No third-party player loads before activation');
  await page.locator('.chispa-podcast').screenshot({ path: '.qa/brands/podcast-1440.png' });
  await page.getByRole('button', { name: 'Reproducir La Chispa Podcast', exact: true }).click();
  const iframe = page.locator('.chispa-podcast iframe');
  const embed = new URL(await iframe.getAttribute('src'));
  ok(embed.hostname === 'www.youtube-nocookie.com' && embed.pathname === '/embed/7Ort5R5x3uw' && embed.searchParams.get('list') === 'PLaG_NWeV7NTimxYWh-43EY51tzXed_r8X', 'Player uses the supplied episode and playlist');
  ok(await page.getByRole('link', { name: 'Abrir directamente en YouTube' }).isVisible(), 'Direct YouTube fallback remains available');

  const offlineHtml = await readFile('.qa/Vasees-vista-previa.html');
  offlineServer = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(offlineHtml); });
  await new Promise(resolve => offlineServer.listen(0, '127.0.0.1', resolve));
  const requests = [];
  const offlinePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  offlinePage.on('pageerror', error => errors.push(error.message));
  offlinePage.on('request', req => { if (!req.isNavigationRequest() && req.url().startsWith('http')) requests.push(req.url()); });
  await offlinePage.goto(`http://127.0.0.1:${offlineServer.address().port}`, { waitUntil: 'networkidle' });
  await offlinePage.locator('.initiative.chispa a').click();
  await offlinePage.locator('.chispa-editorial').waitFor();
  await offlinePage.locator('.chispa-local-nav').getByRole('link', { name: 'La campaña', exact: true }).click();
  ok(offlinePage.url().includes('#/la-chispa?section=cartografia'), 'Offline anchors preserve the editorial page');
  await offlinePage.reload({ waitUntil: 'networkidle' });
  ok(await offlinePage.locator('.chispa-editorial').isVisible(), 'Offline editorial survives reload');
  for (const img of await offlinePage.locator('main img').all()) { if (!await img.evaluate(el => Boolean(el.closest('.chispa-guest')))) await img.scrollIntoViewIfNeeded(); await img.evaluate(img => img.decode()); }
  ok(requests.length === 0, `Offline brand assets are embedded: ${requests.join(', ')}`);
  ok(errors.length === 0, `No browser exceptions: ${errors.join('; ')}`);
  await writeFile('.qa/brands-test-results.json', JSON.stringify({ passed, accessibilityRuns: accessibility.length, accessibility, browserErrors: errors, offlineExternalRequests: requests, thirdPartyPlayback: 'Embed URL and activation verified using a stub; remote playback not asserted.' }, null, 2));
  console.log(`${passed} brand checks passed; ${accessibility.length} accessibility runs with no violations.`);
} finally {
  await browser?.close();
  offlineServer?.close();
  server.kill('SIGTERM');
}
