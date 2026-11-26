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
  const heroActions = await page.locator('.hero-copy a, .hero-copy button').evaluateAll(items => items.map(item => item.getAttribute('href')));
  ok(heroActions.length === 1 && heroActions[0] === '/#soluciones', 'Hero has a single action to the solutions');
  ok((await page.locator('.hero .client-module, .hero .hero-research, .section-index').count()) === 0, 'Hero has no logos, Observatorio card or decorative numbering');
  ok(await page.locator('.image-note').evaluateAll(notes => notes.every(note => getComputedStyle(note).display === 'none')), '"Imagen conceptual" badges are hidden');
  ok(await page.locator('.hero + .organizations h2').innerText() === 'Organizaciones con las que hemos trabajado', 'Organizations sit right below the hero');
  ok((await page.locator('#diagnostico').count()) === 0, 'The starting-point questionnaire is gone');
  const order = await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id || section.className.split(' ')[0]));
  ok(JSON.stringify(order) === JSON.stringify(['inicio', 'organizations', 'nosotros', 'soluciones', 'ecosistema', 'school-teaser', 'insights', 'experience', 'contacto', 'closing']), `Home follows the brief order: ${order.join(', ')}`);
  ok((await page.locator('.closing').innerText()).replace(/\s+/g, ' ').trim() === 'Más vida. Más futuro.', 'Brand signature closes the home');
  const cardTops = await page.locator('.solution-card').evaluateAll(cards => cards.map(card => Math.round(card.getBoundingClientRect().top)));
  ok(cardTops.length === 3 && new Set(cardTops).size === 1, 'Desktop shows the three solutions side by side');
  for (const [name, anchor] of [['Studio', 'marca'], ['Consulting', 'cultura'], ['Tech', 'tech']]) {
    await page.getByRole('link', { name: `Conocer ${name}` }).click();
    await page.locator('.page-hero-solutions').waitFor();
    ok(page.url().endsWith(`/soluciones#${anchor}`) && (await page.locator('h1').count()) === 1, `${name} card opens its /soluciones section`);
    await page.getByRole('link', { name: 'Vasees, inicio' }).click();
    await page.locator('.hero').waitFor();
  }
  await page.goto(`${base}/soluciones`, { waitUntil: 'networkidle' });
  ok((await page.locator('.anchor-nav a').count()) === 3, 'Solutions page has its anchor navigation');
  await page.getByRole('link', { name: 'Quiero lanzar o fortalecer mi marca' }).click();
  await page.locator('#contacto').waitFor();
  ok(page.url().endsWith('/?interes=studio#contacto') && await page.locator('input[name=interest][value=studio]').isChecked(), 'Solution CTA preselects the interest in the single form');
  await page.goto(`${base}/?interes=tech#contacto`, { waitUntil: 'networkidle' });
  ok(await page.locator('input[name=interest][value=tech]:checked').waitFor({ timeout: 10000 }).then(() => true, () => false), `Direct link preselects the interest (${page.url()})`);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.getByRole('button', { name: 'Suscríbete a nuestro newsletter' }).click();
  ok((await page.locator('#dialog-title').innerText()) === 'El Futuro tiene Canas', 'Newsletter CTA opens its detail');
  ok((await page.locator('dialog').innerText()).includes('no registra correos'), 'Newsletter state is honest');
  ok((await page.getByRole('link', { name: 'Escribir a Vasees' }).getAttribute('href')).startsWith('mailto:info@vasees.co'), 'Newsletter has an email fallback');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0), 'No personal data persisted in browser storage');
  await page.getByRole('button', { name: 'Abrir mi correo para escribir a Vasees' }).click();
  ok(await page.locator('.form-errors').isVisible() && (await page.locator('.form-errors li').count()) === 3, 'Empty form lists its three missing fields');
  ok(await page.locator('.form-errors').evaluate(el => el === document.activeElement), 'Error summary receives focus');
  await page.getByLabel('Aún no lo tengo claro; quiero contarles mi reto').check();
  ok((await page.locator('label[for=contact-challenge]').innerText()).includes('recomendado'), 'Challenge is recommended when the visitor is exploring');
  await page.getByLabel('Nombre', { exact: true }).fill('Prueba de QA');
  await page.getByLabel('Correo', { exact: true }).fill('correo-invalido');
  await page.getByRole('button', { name: 'Abrir mi correo para escribir a Vasees' }).click();
  ok((await page.locator('#contact-email-error').innerText()).includes('formato'), 'Invalid email is explained');
  await page.getByLabel('Correo', { exact: true }).fill('prueba@example.com');
  await page.getByLabel('Organización (opcional)').fill('Organización de prueba');
  ok((await page.locator('input[type=tel]').count()) === 0, 'The form does not ask for a phone number');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Page.enable');
  const navigations = [];
  cdp.on('Page.frameRequestedNavigation', event => navigations.push(event.url));
  await page.getByRole('button', { name: 'Abrir mi correo para escribir a Vasees' }).click();
  await page.waitForTimeout(300);
  ok(navigations.some(url => url.startsWith('mailto:info@vasees.co') && decodeURIComponent(url).includes('Prueba de QA') && decodeURIComponent(url).includes('Aún no lo tengo claro')), 'Contact prepares the email with the chosen interest, without claiming delivery');
  const legalLinks = await page.locator('footer nav[aria-label="Información legal"] a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  ok(JSON.stringify(legalLinks) === JSON.stringify(['/privacidad', '/terminos', '/cookies', '/terminos-escuela']), 'Footer links every legal page');
  for (const path of legalLinks) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    ok((await page.locator('h1').count()) === 1 && (await page.locator('.legal-status').innerText()).includes('Pendiente de revisión jurídica'), `${path} is marked as pending legal review`);
  }
  for (const [old, target] of [['/studio', '/soluciones#marca'], ['/consulting', '/soluciones#cultura'], ['/tech', '/soluciones#tech']]) {
    await page.goto(base + old, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    await page.locator('.page-hero-solutions').waitFor({ timeout: 4000 }).catch(() => {});
    ok(page.url().endsWith(target) && await page.locator('.page-hero-solutions').isVisible(), `${old} moves to ${target} (now ${page.url()})`);
  }
  ok(await page.evaluate(() => [...document.querySelectorAll('a')].every(link => link.getAttribute('href') !== '#' && !link.getAttribute('href')?.startsWith('javascript:'))), 'No empty or script links');
  for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    for (const id of ['soluciones', 'ecosistema', 'insights', 'contacto']) {
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
      ok((await page.locator('.mobile-menu a').count()) === 6, 'Mobile menu lists the five sections and Hablemos');
      await page.locator('.mobile-menu').getByRole('link', { name: 'Observatorio' }).click();
      ok(await page.getByRole('button', { name: 'Abrir menú' }).isVisible() && page.url().endsWith('/observatorio'), 'Mobile menu navigates and closes');
    }
  }
  ok(errors.length === 0, `No browser errors: ${errors.join('; ')}`);
  console.log(`${checks} browser checks passed. Screenshots: .qa/`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
