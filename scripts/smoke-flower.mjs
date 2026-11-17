import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5179', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser, checks = 0;
server.stdout.on('data', bytes => logs += bytes); server.stderr.on('data', bytes => logs += bytes);
const ok = (value, message) => { assert.ok(value, message); checks++; };
try {
  for (let i = 0; i < 100 && !/Local/.test(logs); i++) { if (server.exitCode !== null) throw new Error(logs); await new Promise(resolve => setTimeout(resolve, 100)); }
  ok(/Local/.test(logs), 'Production preview starts');
  await mkdir('.qa', { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const video = page.locator('.hero-flower-video');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('http://127.0.0.1:5179', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await page.waitForFunction(() => { const video = document.querySelector('.hero-flower-video'); return video?.readyState >= 2 && video.currentTime > 0.15 && !video.paused; });
    ok(await video.evaluate(element => element.loop && element.muted && element.playsInline && Math.abs(element.duration - 12) < 0.1), `${width}: silent inline looping media plays`);
    ok(await page.locator('.hero-image').count() === 1, `${width}: original image and alternative text retained`);
    const before = await page.locator('.hero-copy').evaluate(element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y + scrollY, width: rect.width }; });
    await page.getByRole('button', { name: 'Pausar animación de la flor', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.hero-flower-video').paused);
    const pausedAt = await video.evaluate(element => element.currentTime);
    await page.waitForTimeout(300);
    ok(Math.abs(await video.evaluate(element => element.currentTime) - pausedAt) < 0.03, `${width}: pause freezes the current frame`);
    await page.screenshot({ path: `.qa/flower-home-${width}.png` });
    const after = await page.locator('.hero-copy').evaluate(element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y + scrollY, width: rect.width }; });
    ok(before.x === after.x && before.y === after.y && before.width === after.width, `${width}: motion leaves the hero text layout fixed`);
    ok(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${width}: no document overflow`);
    ok(await video.evaluate(element => getComputedStyle(element).objectPosition) === await page.locator('.hero-image').evaluate(element => getComputedStyle(element).objectPosition), `${width}: original framing preserved`);
    await page.getByRole('button', { name: 'Reanudar animación de la flor', exact: true }).click();
    await page.waitForFunction(previous => document.querySelector('.hero-flower-video').currentTime > previous + 0.1, pausedAt);
    ok(await video.evaluate(element => !element.paused), `${width}: resume continues playback`);
    await video.evaluate(element => { element.currentTime = element.duration - 0.15; });
    await page.waitForFunction(() => { const video = document.querySelector('.hero-flower-video'); return video.currentTime < 1 && !video.paused; });
    ok(await page.locator('.hero-flower-visual').getAttribute('class').then(value => value.includes('is-ready')), `${width}: looping keeps the same media layer visible`);
    await page.locator('#preguntas').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.hero-flower-video').paused);
    ok(await video.evaluate(element => element.paused), `${width}: offscreen media pauses`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(() => !document.querySelector('.hero-flower-video').paused);
    if (width === 1440) {
      await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
      const audit = await page.evaluate(() => axe.run(document.querySelector('.hero'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
      ok(audit.violations.length === 0, `Hero accessibility: ${audit.violations.map(value => value.id).join(', ')}`);
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await video.waitFor({ state: 'detached' });
  ok(await page.getByRole('button', { name: /animación de la flor/ }).count() === 0, 'Changing reduced motion removes video and its control');
  ok(Number(await page.locator('.hero-image').evaluate(element => getComputedStyle(element).opacity)) > 0, 'Reduced motion displays the original photograph');
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage(); const mediaRequests = [];
  reducedPage.on('request', request => { if (request.url().includes('hero-flower-breeze')) mediaRequests.push(request.url()); });
  await reducedPage.goto('http://127.0.0.1:5179', { waitUntil: 'networkidle' });
  ok(mediaRequests.length === 0 && await reducedPage.locator('.hero-flower-video').count() === 0, 'Reduced-motion visits do not download the animated media');
  const fallback = await browser.newPage();
  await fallback.route('**/videos/hero-flower-breeze.mp4', route => route.abort());
  await fallback.goto('http://127.0.0.1:5179', { waitUntil: 'networkidle' });
  await fallback.locator('.hero-flower-video').waitFor({ state: 'detached' });
  ok(await fallback.locator('.hero-image').evaluate(element => element.complete && element.naturalWidth > 0 && Number(getComputedStyle(element).opacity) > 0), 'Unavailable media falls back to the original image');
  const gif = await readFile('public/images/hero-flower-breeze.gif');
  ok(gif.subarray(0, 6).toString() === 'GIF89a' && gif.includes(Buffer.from('NETSCAPE2.0')), 'Downloadable GIF includes a repeating-animation extension');
  const proof = JSON.parse(await readFile('src/content/flower-motion-proof.json'));
  for (const [file, digest] of Object.entries(proof.sha256)) ok(createHash('sha256').update(await readFile(file)).digest('hex') === digest, `${file}: verified motion export provenance`);
  ok(proof.seamMax === 0 && proof.backgroundMeanDifference === 0 && proof.stemMeanDifference === 0, 'Rendered loop closes exactly while preserving the background and stem');
  ok(errors.length === 0, `No browser or hydration errors: ${errors.join('; ')}`);
  await writeFile('.qa/flower-test-results.json', JSON.stringify({ passed: checks, errors, proof, reducedMotionMediaRequests: mediaRequests.length, gifBytes: gif.length }, null, 2));
  console.log(`${checks} flower motion checks passed.`);
} finally { await browser?.close(); server.kill('SIGTERM'); }
