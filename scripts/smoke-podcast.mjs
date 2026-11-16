import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const base = 'http://127.0.0.1:5181';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5181', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser, passed = 0;
const errors = [], accessibility = [];
const names = ['Natalia Hurtado', 'Laura Polanía', 'Nancy Botero', 'Jessie Bonder', 'Marce Conecta', 'Juan Pablo Triana', 'Laura Espinosa', 'Alexandra Lándazuri'];
const ok = (value, message) => { assert.ok(value, message); passed++; };
server.stdout.on('data', data => logs += data);
server.stderr.on('data', data => logs += data);
async function motion(page, expected) {
  await page.waitForFunction(expected => document.querySelector('.chispa-guests')?.getAttribute('data-motion') === expected, expected);
}
async function transforms(page) { return page.locator('.chispa-guest').evaluateAll(items => items.map(el => el.style.transform)); }
async function audit(page, name) {
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const results = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
  accessibility.push({ name, violations: results.violations });
  ok(results.violations.length === 0, `${name}: ${JSON.stringify(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })))}`);
}
try {
  for (let i = 0; i < 100 && !logs.includes('Local:'); i++) {
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  ok(logs.includes('Local:'), 'Production server starts');
  await mkdir('.qa/chispa-guests', { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html lang="es"><title>Reproductor de prueba</title><body>Reproductor de prueba</body></html>' }));
  await page.goto(base + '/la-chispa/', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.evaluate(() => document.fonts.ready);
  for (const image of await page.locator('.chispa-guest img').all()) await image.evaluate(img => img.decode());
  ok(JSON.stringify(await page.locator('.chispa-guest figcaption').allTextContents()) === JSON.stringify(names), 'Eight supplied names in order, without duplicates');
  ok(await page.locator('.chispa-guest img').evaluateAll(items => items.every(img => img.complete && img.naturalWidth)), 'All eight original guest images load');
  ok(await page.locator('.chispa-podcast iframe').count() === 0, 'No external player before a listening action');
  await motion(page, 'running');
  const before = await transforms(page);
  await page.waitForTimeout(400);
  ok(JSON.stringify(before) !== JSON.stringify(await transforms(page)), 'Cards move automatically');
  await page.locator('.chispa-guests-stage').hover({ position: { x: 700, y: 150 } });
  await motion(page, 'paused');
  const hover = await transforms(page);
  await page.waitForTimeout(250);
  ok(JSON.stringify(hover) === JSON.stringify(await transforms(page)), 'Hover holds the arc still');
  await page.mouse.move(0, 0);
  await motion(page, 'running');
  await page.getByRole('button', { name: 'Pausar movimiento de invitados', exact: true }).click();
  await page.mouse.move(0, 0);
  await motion(page, 'paused');
  const paused = await transforms(page);
  await page.waitForTimeout(250);
  ok(JSON.stringify(paused) === JSON.stringify(await transforms(page)), 'Explicit pause holds the cards after pointer leaves');
  await page.getByRole('button', { name: 'Reanudar movimiento de invitados', exact: true }).click();
  await page.mouse.move(0, 0);
  await motion(page, 'running');
  ok(true, 'Resume works while its button retains focus');
  await page.getByRole('button', { name: 'Ver invitado siguiente', exact: true }).click();
  await motion(page, 'paused');
  ok((await page.locator('.chispa-guests [role="status"]').textContent()).includes('Laura Polanía'), 'Manual next moves to Laura and pauses autoplay');
  for (let index = 1; index < names.length; index++) {
    const guest = page.locator('.chispa-guest').nth(index);
    const center = await guest.evaluate(el => { const box = el.getBoundingClientRect(); return box.x + box.width / 2; });
    ok(Math.abs(center - 720) < 1, `${names[index]}: manual card is centered`);
    await guest.locator('figure').screenshot({ path: `.qa/chispa-guests/guest-${index + 1}.png` });
    await page.getByRole('button', { name: 'Ver invitado siguiente', exact: true }).click();
  }
  ok((await page.locator('.chispa-guests [role="status"]').textContent()).includes('Natalia Hurtado'), 'Manual navigation loops to Natalia');
  await page.locator('.chispa-guest').first().locator('figure').screenshot({ path: '.qa/chispa-guests/guest-1.png' });
  await page.getByRole('button', { name: 'Ver invitado anterior', exact: true }).click();
  ok((await page.locator('.chispa-guests [role="status"]').textContent()).includes('Alexandra Lándazuri'), 'Previous wraps to Alexandra');
  await page.getByRole('button', { name: 'Ver invitado siguiente', exact: true }).click();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.evaluate(() => document.activeElement?.blur());
    ok(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${width}: no horizontal overflow`);
    ok(await page.getByRole('button', { name: 'Escuchar el podcast', exact: true }).isVisible(), `${width}: main listening action visible`);
    await page.screenshot({ path: `.qa/chispa-guests/hero-${width}.png` });
    if (width !== 320) {
      // Keep the entire 3D layer inside the viewport for an element capture;
      // Chromium otherwise leaves compositor layers blank beyond the fold.
      const viewport = page.viewportSize();
      if (width === 390) await page.setViewportSize({ width, height: 1100 });
      await page.locator('.chispa-podcast-hero').screenshot({ path: `.qa/chispa-guests/hero-${width}-full.png` });
      await page.setViewportSize(viewport);
    }
    if (width === 1440 || width === 390) await audit(page, `Podcast hero ${width}`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole('button', { name: 'Reanudar movimiento de invitados', exact: true }).click();
  await page.mouse.move(0, 0);
  await motion(page, 'running');
  await page.locator('#revista').scrollIntoViewIfNeeded();
  await motion(page, 'paused');
  ok(true, 'Animation suspends offscreen');
  await page.evaluate(() => scrollTo(0, 0));
  await motion(page, 'running');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await motion(page, 'paused');
  ok(true, 'Visibility handler suspends a hidden document');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await motion(page, 'running');
  await page.getByRole('button', { name: 'Ver invitado anterior', exact: true }).focus();
  await motion(page, 'paused');
  ok(true, 'Keyboard focus pauses automatic motion');
  await page.getByRole('button', { name: 'Escuchar el podcast', exact: true }).click();
  await page.locator('.chispa-podcast iframe').waitFor();
  const embed = new URL(await page.locator('.chispa-podcast iframe').getAttribute('src'));
  ok(embed.pathname === '/embed/7Ort5R5x3uw' && embed.searchParams.get('list') === 'PLaG_NWeV7NTimxYWh-43EY51tzXed_r8X', 'Hero action starts the supplied podcast player');
  await page.waitForFunction(() => { const r = document.getElementById('podcast').getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; });
  ok(await page.locator('#podcast').evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }), 'Hero action brings the player into view');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  await motion(page, 'paused');
  const reduced = await transforms(page);
  await page.waitForTimeout(300);
  ok(JSON.stringify(reduced) === JSON.stringify(await transforms(page)), 'Reduced motion remains static');
  ok(await page.locator('.chispa-guests-pause').count() === 0, 'Reduced-motion UI omits the unnecessary autoplay control');
  await page.getByRole('button', { name: 'Ver invitado siguiente', exact: true }).click();
  ok((await page.locator('.chispa-guests [role="status"]').textContent()).includes('Laura Polanía'), 'Reduced motion retains manual navigation');

  // Advance a complete 72-second cycle with browser virtual time, checking that
  // the hidden wrap never jumps a visible portrait across the center.
  const loop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await loop.clock.install();
  await loop.goto(base + '/la-chispa/', { waitUntil: 'networkidle' });
  await loop.clock.runFor(100);
  await motion(loop, 'running');
  await loop.evaluate(() => {
    window.__guestWraps = [];
    let previous;
    function sample() {
      const current = [...document.querySelectorAll('.chispa-guest')].map(el => ({ x: Number(el.style.transform.match(/translate3d\(([-\d.]+)/)?.[1] ?? 0), opacity: Number(el.style.opacity) }));
      if (previous) current.forEach((item, index) => { if (Math.abs(item.x - previous[index].x) > 1000) window.__guestWraps.push({ before: previous[index].opacity, after: item.opacity }); });
      previous = current;
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  const start = await transforms(loop);
  await loop.clock.runFor(72000);
  const end = await transforms(loop);
  const x = transform => Number(transform.match(/translate3d\(([-\d.]+)/)[1]);
  ok(start.every((transform, index) => Math.abs(x(transform) - x(end[index])) < 3), 'A full cycle returns every card to the same position');
  const wraps = await loop.evaluate(() => window.__guestWraps);
  ok(wraps.length >= 7 && wraps.every(item => item.before < .025 && item.after < .025), 'Every wrap occurs while the card is invisible');
  ok(errors.length === 0, `No browser errors: ${errors.join('; ')}`);
  await writeFile('.qa/podcast-test-results.json', JSON.stringify({ passed, accessibility, browserErrors: errors, loopWraps: wraps, thirdPartyPlayback: 'Activation and embed configuration checked with a simulated response; remote playback not asserted.' }, null, 2));
  console.log(`${passed} podcast checks passed; ${accessibility.length} accessibility runs with no violations.`);
} finally { await browser?.close(); server.kill('SIGTERM'); }
