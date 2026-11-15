import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const port = 5174;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
let checks = 0;
let browser;
const ok = (value, message) => { assert.ok(value, message); checks++; };
server.stdout.on('data', data => { logs += data.toString(); });
server.stderr.on('data', data => { logs += data.toString(); });

try {
  for (let i = 0; i < 100 && !logs.includes('ready in'); i++) {
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  ok(logs.includes('ready in'), 'Vite started on its own test port');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  await mkdir('.qa', { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text() + ' @ ' + message.location().url); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  ok((await page.locator('h1').count()) === 1 && (await page.title()).includes('Vasees'), 'Unique heading and document title');
  await page.getByRole('button', { name: 'Pausar movimiento de nombres' }).click();
  ok(await page.getByRole('button', { name: 'Reanudar movimiento de nombres' }).isVisible(), 'Client strip pauses');
  await page.locator('.hero-research').click();
  await page.locator('.research-article').waitFor();
  ok(page.url().includes('/observatorio/vivir-mas'), 'Research opens its public article');
  ok((await page.locator('.article-body section[id^=lectura-]').count()) === 3, 'Full editorial has all three territories');
  ok((await page.locator('.article-sources .text-link').getAttribute('href')).includes('who.int'), 'Article links its source');
  await page.getByRole('link', {name:'Vasees, inicio'}).click();
  await page.locator('.hero').waitFor();
  for (const [index, name] of ['Studio', 'Consulting', 'Tech'].entries()) {
    const card = page.locator('.service-card').nth(index);
    await card.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 120));
    await card.getByRole('link', { name: `Conoce ${name}` }).click();
    await page.locator('.inner-page').waitFor();
    ok(page.url().endsWith('/'+name.toLowerCase()) && (await page.locator('h1').count()) === 1, `${name} public page is accessible`);
    await page.getByRole('link', {name:'Vasees, inicio'}).click();
    await page.locator('.hero').waitFor();
  }
  await page.getByRole('tab', { name: 'Cómo trabajamos' }).click();
  ok(await page.getByRole('button', { name: '¿Cómo empieza un proyecto?' }).getAttribute('aria-expanded') === 'true', 'FAQ category changes');
  await page.getByRole('button', { name: '¿Cómo empieza un proyecto?' }).click();
  ok(await page.getByRole('button', { name: '¿Cómo empieza un proyecto?' }).getAttribute('aria-expanded') === 'false', 'FAQ collapses');
  await page.getByRole('button', { name: 'Abre la conversación' }).click();
  ok(await page.getByRole('button', { name: 'Continuar', exact: true }).isDisabled(), 'Diagnostic requires an answer');
  await page.getByLabel('En nuestros equipos y su cultura', { exact: true }).check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Cómo compartir experiencia y colaborar entre generaciones', { exact: true }).check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Tenemos un reto y queremos explorarlo', { exact: true }).check();
  await page.getByRole('button', { name: 'Ver mi punto de partida' }).click();
  ok((await page.locator('dialog').innerText()).includes('Vasees Consulting'), 'Diagnostic produces a relevant conversation starter');
  const diagnosticLink = await page.getByRole('link', { name: 'Lleva tu pregunta a Vasees' }).getAttribute('href');
  ok(decodeURIComponent(diagnosticLink).includes('En nuestros equipos y su cultura'), 'Diagnostic mail includes chosen answers');
  await page.screenshot({ path: '.qa/diagnostic.png' });
  await page.keyboard.press('Escape');
  await page.locator('.newsletter-card').click();
  ok((await page.locator('#dialog-title').innerText()) === 'El Futuro tiene Canas', 'Newsletter detail opens');
  ok((await page.getByRole('link', { name: 'Conversemos por correo' }).getAttribute('href')).startsWith('mailto:info@vasees.co'), 'Newsletter has honest email fallback');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0), 'No personal data persisted in browser storage');
  await page.getByLabel('Tu nombre', { exact: true }).fill('Prueba de QA');
  await page.getByLabel('Tu correo', { exact: true }).fill('prueba@example.com');
  await page.getByLabel('Organización', { exact: true }).fill('Organización de prueba');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Page.enable');
  const navigations = [];
  cdp.on('Page.frameRequestedNavigation', event => navigations.push(event.url));
  await page.getByRole('button', { name: 'Preparar correo', exact: true }).click();
  await page.waitForTimeout(300);
  ok(navigations.some(url => url.startsWith('mailto:info@vasees.co') && decodeURIComponent(url).includes('Prueba de QA')), 'Contact prepares the entered email without claiming delivery');
  for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    for (const id of ['soluciones', 'observatorio', 'insights', 'contacto']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
    }
    ok(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${name}: no horizontal overflow`);
    ok(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), `${name}: all images loaded`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `.qa/${name}-hero.png` });
    await page.screenshot({ path: `.qa/${name}-full.png`, fullPage: true });
    if (width === 390) {
      await page.getByRole('button', { name: 'Abrir menú' }).click();
      await page.locator('.mobile-menu').getByRole('link', { name: 'Observatorio' }).click();
      ok(await page.getByRole('button', { name: 'Abrir menú' }).isVisible() && page.url().endsWith('/observatorio'), 'Mobile menu navigates and closes');
    }
  }
  await page.getByRole('link', {name:'Vasees, inicio'}).click();
  await page.locator('.hero').waitFor();
  await page.setViewportSize({width:1440,height:1000});
  const sectionY = await page.locator('#manifiesto').evaluate(el => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => window.scrollTo(0,y-300), sectionY);
  await page.waitForTimeout(100);
  const earlyBlur = await page.locator('[data-reveal]').last().evaluate(el=>getComputedStyle(el).filter);
  await page.evaluate(y => window.scrollTo(0,y+600), sectionY);
  await page.waitForTimeout(100);
  const lateBlur = await page.locator('[data-reveal]').last().evaluate(el=>getComputedStyle(el).filter);
  ok(earlyBlur !== lateBlur && lateBlur === 'blur(0px)', 'Scrolling reveals the blurred manifesto');
  await page.screenshot({path:'.qa/manifesto-revealed.png'});
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#manifiesto').scrollIntoViewIfNeeded();
  ok(await page.locator('[data-reveal]').evaluateAll(words => words.every(word => getComputedStyle(word).filter === 'none' && getComputedStyle(word).opacity === '1')), 'Reduced motion keeps manifesto clear');
  ok(await page.locator('.client-track').evaluate(el => getComputedStyle(el).animationName === 'none'), 'Reduced motion stops the client strip');
  ok(errors.length === 0, `No browser errors: ${errors.join('; ')}`);
  console.log(`${checks} browser checks passed. Screenshots: .qa/`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
