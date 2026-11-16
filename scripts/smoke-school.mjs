import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5177', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser, checks = 0;
server.stdout.on('data', data => logs += data.toString());
server.stderr.on('data', data => logs += data.toString());
const ok = (value, message) => { assert.ok(value, message); checks++; };
const base = 'http://127.0.0.1:5177';
try {
  for (let i = 0; i < 100 && !logs.includes('Local:'); i++) {
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  ok(logs.includes('Local:'), 'Production preview starts');
  const source = await (await fetch(`${base}/escuela/`)).text();
  ok(source.includes('school-landing-hero') && source.includes('school-mateo-melissa.webp') && source.includes('Cuidar sin dejar de vivir'), 'Static school HTML includes hero, presenters and catalog');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await mkdir('.qa', { recursive: true });
  await page.goto(base, { waitUntil: 'networkidle' });
  ok(await page.locator('.nav-links').getByRole('link', { name: 'Insights', exact: true }).count() === 0, 'Insights removed from desktop navigation');
  ok(await page.locator('#insights').count() === 1, 'Insights remains on the home');
  await page.locator('.nav-links').getByRole('link', { name: 'Escuela', exact: true }).click();
  await page.locator('.school-landing-hero').waitFor();
  ok(page.url().endsWith('/escuela'), 'School navigation opens the public route');
  ok(await page.locator('h1').count() === 1 && (await page.title()).includes('Escuela'), 'School has one heading and its own metadata');
  ok(await page.locator('.school-hero-art img').evaluate(image => image.complete && image.naturalWidth > 1000), 'Presenter asset loads');
  ok((await page.locator('.school-presenter-caption').innerText()).includes('Mateo') && (await page.locator('.school-presenter-caption').innerText()).includes('Melissa'), 'Both presenters are named');
  ok(await page.locator('.school-catalog-grid article').count() === 6, 'Six demo courses exist');
  await page.getByRole('button', { name: 'Cursos siguientes', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.school-featured-row').scrollLeft > 100);
  ok(await page.getByRole('button', { name: 'Cursos anteriores', exact: true }).isEnabled(), 'Carousel advances and enables backward navigation');
  for (const [category, expected] of [['Cuidado', 2], ['Generaciones', 2], ['Proyecto de vida', 1], ['Tecnología', 1]]) {
    await page.locator('.school-categories').getByRole('button', { name: category, exact: true }).click();
    ok(await page.locator('.school-catalog-grid article').count() === expected, `Category ${category} returns ${expected} courses`);
  }
  await page.locator('.school-categories').getByRole('button', { name: 'Todos', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar cursos' }).fill('tecnologia');
  ok(await page.locator('.school-catalog-grid article').count() === 1, 'Search ignores accents');
  await page.getByRole('searchbox', { name: 'Buscar cursos' }).fill('ningun curso con esta frase');
  ok(await page.locator('.school-empty').isVisible(), 'Empty search has an explicit state');
  await page.getByRole('button', { name: 'Ver todos los cursos', exact: true }).click();
  ok(await page.locator('.school-catalog-grid article').count() === 6, 'Reset restores all courses');
  const course = page.locator('.school-catalog-grid h3 button').first();
  await course.click();
  await page.locator('.school-course-dialog').waitFor({ state: 'visible' });
  ok((await page.locator('#school-course-title').innerText()) === 'Cuidar sin dejar de vivir', 'Course opens with the correct title');
  ok(await page.locator('.school-lesson-layout aside>button').count() === 3, 'Course has three actual demo lessons');
  for (let index = 0; index < 3; index++) {
    await page.getByRole('button', { name: 'Marcar como leída', exact: true }).click();
    if (index < 2) await page.getByRole('button', { name: 'Siguiente lección', exact: true }).click();
  }
  ok(await page.getByRole('status').filter({ hasText: 'Completaste este recorrido de muestra.' }).isVisible(), 'Lesson completion works');
  ok((await page.locator('.school-lesson-count').innerText()).includes('3 de 3'), 'Read count reflects completed lessons');
  await page.screenshot({ path: '.qa/school-course-desktop.png' });
  for (let i = 0; i < 14; i++) await page.keyboard.press('Tab');
  ok(await page.locator('.school-course-dialog').evaluate(dialog => dialog.contains(document.activeElement)), 'Keyboard focus stays in the dialog');
  await page.keyboard.press('Escape');
  ok(!await page.locator('.school-course-dialog').isVisible(), 'Escape closes the course');
  ok(await course.evaluate(button => document.activeElement === button), 'Focus returns to the selected course');
  await course.click();
  ok((await page.locator('.school-lesson-count').innerText()).includes('0 de 3'), 'Demo progress resets when reopening');
  await page.keyboard.press('Escape');
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(`${base}/escuela/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    for (const image of await page.locator('main img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(img => img.decode()); }
    await page.evaluate(() => { document.querySelector('.school-featured-row').scrollLeft = 0; scrollTo(0, 0); });
    await page.waitForTimeout(100);
    ok(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), `${width}: no horizontal overflow`);
    ok(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), `${width}: all images loaded`);
    await page.screenshot({ path: `.qa/school-final-${width}.png` });
    await page.screenshot({ path: `.qa/school-final-${width}-full.png`, fullPage: true });
    if (width === 390) {
      await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      ok(await page.locator('.mobile-menu').getByRole('link', { name: 'Insights', exact: true }).count() === 0, 'Insights removed from mobile navigation');
      await page.locator('.mobile-menu').getByRole('link', { name: 'Escuela', exact: true }).click();
      ok(await page.getByRole('button', { name: 'Abrir menú', exact: true }).isVisible(), 'Mobile school navigation closes its menu');
      await page.locator('.school-catalog-grid h3 button').first().click();
      await page.screenshot({ path: '.qa/school-final-mobile-dialog.png' });
      await page.keyboard.press('Escape');
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  ok(await page.locator('.school-course-image img').first().evaluate(img => getComputedStyle(img).transitionDuration === '0s'), 'Reduced motion disables thumbnail transitions');
  ok(errors.length === 0, `No browser or hydration errors: ${errors.join('; ')}`);
  await writeFile('.qa/school-test-results.json', JSON.stringify({ passed: checks, errors, viewports: [1440, 768, 390], courses: 6, lessonsPerCourse: 3 }, null, 2));
  console.log(`${checks} school checks passed.`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
