// Renders every style x scene of index.html to out/<style>-<scene>.png
//   node render.mjs            (needs Chromium; serves this folder on a free port)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
const { chromium } = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright');
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer(async (req, res) => {
  try {
    const f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const body = await readFile(f.endsWith('/') ? f + 'index.html' : f);
    res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto(`http://localhost:${port}/index.html`);
await page.waitForFunction(() => window.__done, null, { timeout: 120000 });
await mkdir(path.join(dir, 'out'), { recursive: true });
const ids = await page.$$eval('canvas', (cs) => cs.map((c) => c.id));
for (const id of ids) {
  const data = await page.$eval(`#${id}`, (c) => c.toDataURL('image/png'));
  await writeFile(path.join(dir, 'out', `${id}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
console.log('rendered', ids.length);
await browser.close(); server.close();
