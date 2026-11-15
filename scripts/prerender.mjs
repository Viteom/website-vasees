import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const template = await readFile('dist/index.html', 'utf8');
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
try {
  const { App } = await vite.ssrLoadModule('/src/main.tsx');
  const { pageMeta } = await vite.ssrLoadModule('/src/content/pages.ts');
  for (const [route, meta] of Object.entries(pageMeta)) {
    let html = template.replace('<div id="root"></div>', () => `<!--vasees-content:start--><div id="root">${renderToString(React.createElement(App, { initialPath: route }))}</div><!--vasees-content:end-->`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`);
    html = html.replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${escape(meta.description)}$2`);
    html = html.replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, `$1${escape(meta.title)}$2`);
    html = html.replace(/(<meta property="og:description" content=")[^"]*("\s*\/?>)/, `$1${escape(meta.description)}$2`);
    // Each direct URL is a real static document; no host-specific rewrite is required.
    const folder = route === '/' ? 'dist' : path.join('dist', route.slice(1));
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, 'index.html'), html);
  }
  const notFound = renderToString(React.createElement(App, { initialPath: '/404' }));
  await writeFile('dist/404.html', template.replace('<div id="root"></div>', () => `<div id="root">${notFound}</div>`).replace(/<title>[^<]*<\/title>/, '<title>Página no encontrada | Vasees</title>'));
  console.log(`Pre-rendered ${Object.keys(pageMeta).length} public pages and a 404 document.`);
} finally {
  await vite.close();
}
