import { spawn, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';

const temporary = await mkdtemp('/tmp/vasees-flower-');
const port = 5182;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', `${port}`, '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', browser;
server.stdout.on('data', bytes => logs += bytes); server.stderr.on('data', bytes => logs += bytes);
const encode = args => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Flower media encoding failed.');
};
try {
  for (let i = 0; i < 100 && !logs.includes('Local:'); i++) { if (server.exitCode !== null) throw new Error(logs); await new Promise(resolve => setTimeout(resolve, 100)); }
  if (!logs.includes('Local:')) throw new Error('Local flower renderer did not start.');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1296, height: 864 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
  const proof = await page.evaluate(async () => {
    const { createFlowerWindRenderer, FLOWER_LOOP_SECONDS } = await import('/src/flower-wind.ts');
    const image = new Image(); image.src = '/images/hero-flower.png'; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = 1296; canvas.height = 864;
    document.body.replaceChildren(canvas); Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '1296px', height: '864px' });
    const renderer = createFlowerWindRenderer(canvas, image);
    window.flowerRenderer = renderer; window.flowerCanvas = canvas;
    renderer.draw(0); const start = renderer.readPixels();
    renderer.draw(FLOWER_LOOP_SECONDS); const end = renderer.readPixels();
    renderer.draw(FLOWER_LOOP_SECONDS / 4); const middle = renderer.readPixels();
    let seamMax = 0, seamTotal = 0, movingPixels = 0;
    for (let i = 0; i < start.length; i += 4) {
      let delta = 0;
      for (let c = 0; c < 3; c++) { const seam = Math.abs(start[i + c] - end[i + c]); seamMax = Math.max(seamMax, seam); seamTotal += seam; delta += Math.abs(start[i + c] - middle[i + c]); }
      if (delta > 3) movingPixels++;
    }
    function regionDifference(x0, y0, x1, y1) {
      let total = 0, count = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * canvas.width + x) * 4; for (let c = 0; c < 3; c++) { total += Math.abs(start[i + c] - middle[i + c]); count++; } }
      return total / count;
    }
    return { duration: FLOWER_LOOP_SECONDS, seamMax, seamMean: seamTotal / (canvas.width * canvas.height * 3), movingPixels, backgroundMeanDifference: regionDifference(30, 600, 300, 800), stemMeanDifference: regionDifference(780, 20, 820, 160) };
  });
  if (proof.seamMax > 0 || proof.movingPixels < 1000 || proof.backgroundMeanDifference > 0.01) throw new Error(`Flower motion validation failed: ${JSON.stringify(proof)}`);
  const fps = 24, frames = proof.duration * fps;
  for (let frame = 0; frame < frames; frame++) {
    const data = await page.evaluate(seconds => { window.flowerRenderer.draw(seconds); return window.flowerCanvas.toDataURL('image/png').split(',')[1]; }, frame / fps);
    await writeFile(path.join(temporary, `frame-${String(frame).padStart(4, '0')}.png`), Buffer.from(data, 'base64'));
    if (frame % 72 === 0) console.log(`Rendered ${frame}/${frames} frames`);
  }
  await mkdir('public/videos', { recursive: true }); await mkdir('.qa', { recursive: true });
  const input = ['-framerate', `${fps}`, '-i', path.join(temporary, 'frame-%04d.png')];
  encode([...input, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', 'public/videos/hero-flower-breeze.mp4']);
  encode(['-i', 'public/videos/hero-flower-breeze.mp4', '-filter_complex', 'fps=12,scale=720:480:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:reserve_transparent=0[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle', '-loop', '0', '-y', 'public/images/hero-flower-breeze.gif']);
  proof.sha256 = {};
  for (const file of ['public/images/hero-flower.png', 'src/flower-wind.ts', 'public/videos/hero-flower-breeze.mp4', 'public/images/hero-flower-breeze.gif']) proof.sha256[file] = createHash('sha256').update(await readFile(file)).digest('hex');
  await writeFile('src/content/flower-motion-proof.json', JSON.stringify(proof, null, 2) + '\n');
  await writeFile('.qa/flower-loop-proof.json', JSON.stringify(proof, null, 2));
  console.log(JSON.stringify(proof));
} finally { await browser?.close(); server.kill('SIGTERM'); await rm(temporary, { recursive: true, force: true }); }
