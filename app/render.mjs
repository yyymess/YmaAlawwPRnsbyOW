#!/usr/bin/env node
// Offline renderer: drives app/index.html?export=1 in headless Chromium.
//   node app/render.mjs stills --t 3.5,25,61 [--only intro] [--out out/stills]
//   node app/render.mjs sheet  --from 0 --to 21.6 --n 12 [--cols 4] [--only intro] [--out out/sheet.jpg]
//   node app/render.mjs video  [--from 0] [--to <end>] [--fps 30] [--crf 16] [--only ids] [--workers 3] [--out out/engineers-paradise.mp4]
//   node app/render.mjs serve  [--port 5173]          (preview: http://localhost:5173/app/?t=0)
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
import http from 'node:http';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const argv = process.argv.slice(2), mode = argv[0] ?? 'stills';
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.m4a': 'audio/mp4', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

function serve(port = 0) {
  const server = http.createServer(async (req, res) => {
    try {
      let f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if ((await stat(f)).isDirectory()) f = path.join(f, 'index.html');
      const body = await readFile(f);
      res.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); res.end(body);
    } catch { res.writeHead(404); res.end(); }
  }).listen(+port);
  return server;
}

async function open(server) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const logs = []; page.on('console', (m) => m.type() === 'error' && logs.push(m.text())); page.on('pageerror', (e) => logs.push(e.message));
  const only = opt('only');
  await page.goto(`http://localhost:${server.address().port}/app/index.html?export=1${only ? '&only=' + only : ''}`);
  await page.waitForFunction(() => window.__ep?.ready || window.__ep?.error, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__ep.error); if (err) throw new Error(err + '\n' + logs.join('\n'));
  return { browser, page, logs };
}
const shot = async (page, t, fmt = 'png') => {
  const url = await page.evaluate(([t, fmt]) => { window.__ep.frame(t); return fmt === 'png' ? window.__ep.png() : window.__ep.jpg(0.95); }, [t, fmt]);
  return Buffer.from(url.split(',')[1], 'base64');
};
const errors = async (page) => page.evaluate(() => window.__ep.errors);

const server = serve(mode === 'serve' ? opt('port', 5173) : 0);
if (mode === 'serve') { console.log(`preview: http://localhost:${server.address().port}/app/?t=0`); }
else {
  const { browser, page, logs } = await open(server);
  const duration = await page.evaluate(() => window.__ep.duration);
  try {
    if (mode === 'stills') {
      const out = path.resolve(ROOT, opt('out', 'out/stills')); await mkdir(out, { recursive: true });
      for (const t of opt('t', '1').split(',').map(Number)) { const f = path.join(out, `t${t.toFixed(2).padStart(7, '0')}.png`); await writeFile(f, await shot(page, t)); console.log(f); }
    } else if (mode === 'sheet') {
      const from = +opt('from', 0), to = +opt('to', duration), n = +opt('n', 12), cols = +opt('cols', 4);
      const times = Array.from({ length: n }, (_, i) => from + ((to - from) * (i + 0.5)) / n);
      const out = path.resolve(ROOT, opt('out', 'out/sheet.jpg')); await mkdir(path.dirname(out), { recursive: true });
      const url = await page.evaluate(async ({ times, cols }) => {
        const cw = 480, ch = 270, pad = 4, lab = 18, rows = Math.ceil(times.length / cols), cv = document.createElement('canvas');
        cv.width = cols * (cw + pad) + pad; cv.height = rows * (ch + lab + pad) + pad; const c = cv.getContext('2d');
        c.fillStyle = '#222'; c.fillRect(0, 0, cv.width, cv.height);
        for (const [i, t] of times.entries()) {
          window.__ep.frame(t); const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + lab + pad);
          c.drawImage(document.getElementById('c'), x, y + lab, cw, ch); c.fillStyle = '#ddd'; c.font = '13px monospace'; c.fillText(`${t.toFixed(2)}s`, x + 2, y + 13);
        }
        return cv.toDataURL('image/jpeg', 0.9);
      }, { times, cols });
      await writeFile(out, Buffer.from(url.split(',')[1], 'base64')); console.log(out);
    } else if (mode === 'video') {
      const fps = +opt('fps', 30), from = +opt('from', 0), to = +opt('to', duration), crf = opt('crf', '16');
      const out = path.resolve(ROOT, opt('out', 'out/engineers-paradise.mp4')); await mkdir(path.dirname(out), { recursive: true });
      const n = Math.round((to - from) * fps), workers = Math.max(1, +opt('workers', 3));
      const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
        ...(argv.includes('--noaudio') ? [] : ['-ss', String(from), '-t', String(to - from), '-i', path.join(ROOT, 'audio/engineers-paradise.m4a')]),
        '-map', '0:v', ...(argv.includes('--noaudio') ? [] : ['-map', '1:a', '-c:a', 'aac', '-b:a', '256k']),
        '-c:v', 'libx264', '-preset', opt('preset', 'slow'), '-crf', crf, '-pix_fmt', 'yuv420p',
        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
      const closed = new Promise((r) => ff.on('close', r));
      // extra pages render ahead; frames are written in order
      const pages = [page], extra = []; for (let i = 1; i < workers; i++) { const o = await open(server); pages.push(o.page); extra.push(o.browser); }
      const t0 = Date.now(); let next = 0;
      const pending = new Map();
      const work = async (pg) => { for (;;) { const i = next++; if (i >= n) return; const buf = await shot(pg, from + (i + 0.5) / fps, opt('fmt', 'png')); pending.set(i, buf); } };
      const writer = (async () => {
        for (let i = 0; i < n; i++) {
          while (!pending.has(i)) await new Promise((r) => setTimeout(r, 5));
          const b = pending.get(i); pending.delete(i);
          if (!ff.stdin.write(b)) await new Promise((r) => ff.stdin.once('drain', r));
          if (i % fps === 0) { const el = (Date.now() - t0) / 1000; process.stdout.write(`\r${i}/${n} frames  ${(i / el || 0).toFixed(1)} fps  eta ${((n - i) / (i / el || 1) / 60).toFixed(1)} min   `); }
        }
        ff.stdin.end();
      })();
      await Promise.all([...pages.map(work), writer]);
      await closed;
      await Promise.all(extra.map((b) => b.close()));
      console.log(`\n${out}  (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
    }
    const errs = await errors(page); if (errs.length) console.error('SCENE ERRORS:\n' + errs.join('\n'));
    if (logs.length) console.error('BROWSER:\n' + [...new Set(logs)].slice(0, 20).join('\n'));
  } finally { await browser.close(); server.closeAllConnections?.(); server.close(); }
}
