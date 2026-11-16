import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { schoolCourses } from '../src/content/school.ts';

// Export the built home as one offline file, including all fonts and images.
const root = process.cwd();
const dist = path.join(root, 'dist');
let html = await readFile(path.join(dist, 'index.html'), 'utf8');
html = html.replace(/<!--vasees-content:start-->[\s\S]*?<!--vasees-content:end-->/, '<div id="root"></div>');
const jsFile = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
const cssFile = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/)?.[1];
if (!jsFile || !cssFile) throw new Error('Run npm run build before exporting.');
let js = await readFile(path.join(dist, jsFile), 'utf8');
let css = await readFile(path.join(dist, cssFile), 'utf8');
const assets = {};
for (const name of ['hero.webp', 'hero-flower.png', 'editorial.webp', 'studio.webp', 'consulting.webp', 'vasees-logo.png', 'school-mateo-melissa.webp', 'school-care.webp', 'school-generations.webp']) {
  const key = `/images/${name}`;
  const mime = name.endsWith('.png') ? 'image/png' : 'image/webp';
  assets[key] = `data:${mime};base64,${(await readFile(path.join(dist, key))).toString('base64')}`;
  js = js.replaceAll(JSON.stringify(key), `window.__VASEES_ASSETS[${JSON.stringify(key)}]`);
}
for (const name of await readdir(path.join(dist, 'images/brands'))) {
  if (!/\.(png|webp|svg)$/.test(name)) continue;
  const key = `/images/brands/${name}`;
  const mime = name.endsWith('.svg') ? 'image/svg+xml' : name.endsWith('.png') ? 'image/png' : 'image/webp';
  assets[key] = `data:${mime};base64,${(await readFile(path.join(dist, key))).toString('base64')}`;
  js = js.replaceAll(JSON.stringify(key), `window.__VASEES_ASSETS[${JSON.stringify(key)}]`);
  css = css.replaceAll(key, assets[key]);
}
for (const name of ['bricolage-grotesque.ttf', 'atkinson-regular.ttf']) {
  const key = `/fonts/brands/${name}`;
  css = css.replaceAll(key, `data:font/ttf;base64,${(await readFile(path.join(dist, key))).toString('base64')}`);
}
for (const course of schoolCourses) {
  for (const [key, mime] of [[course.trailer, 'video/mp4'], [course.trailerCaptions, 'text/vtt']]) {
    if (!key) continue;
    assets[key] = `data:${mime};base64,${(await readFile(path.join(dist, key))).toString('base64')}`;
    js = js.replaceAll(JSON.stringify(key), `window.__VASEES_ASSETS[${JSON.stringify(key)}]`);
  }
}
{
  const key = '/videos/hero-flower-breeze.mp4';
  assets[key] = `data:video/mp4;base64,${(await readFile(path.join(dist, key))).toString('base64')}`;
  js = js.replaceAll(JSON.stringify(key), `window.__VASEES_ASSETS[${JSON.stringify(key)}]`);
}
const font = `data:font/ttf;base64,${(await readFile(path.join(dist, 'fonts/pathway-extreme.ttf'))).toString('base64')}`;
css = css.replace(/url\((?:"|')?\/fonts\/pathway-extreme\.ttf(?:"|')?\)/g, `url("${font}")`);
html = html.replace(/\s*<link[^>]+rel="preload"[^>]*>/g, '');
html = html.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/, () => `<script>window.__VASEES_OFFLINE__=true;window.__VASEES_ASSETS=${JSON.stringify(assets)};</script><script type="module">${js.replaceAll('</script', '<\\/script')}</script>`);
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/, `<style>${css}</style>`);
html = html.replace('href="/images/vasees-logo.png"', `href="${assets['/images/vasees-logo.png']}"`);
await mkdir('.qa', { recursive: true });
await writeFile('.qa/Vasees-vista-previa.html', html);
console.log('Offline preview exported to .qa/Vasees-vista-previa.html');
