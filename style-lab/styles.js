// Five candidate looks. Each renders a scene (scenes.js) into a 1600x900 canvas.
import { W, H } from './scenes.js';

const PAL = {
  bg: '#0d0b10', glow: '#ffb347', hood: '#2a2f3a', hoodIn: '#141720', skin: '#e9b48a', skinDark: '#8a5a44',
  beard: '#5a3b2a', mouth: '#3a1a14', rim: '#111111', screen: '#9ff3ff', ink: '#0a0a0a', paper: '#f4ead5',
  sky: '#f7c9a0', sun: '#fff1c1', hill: '#7fa37a', grass: '#a7c46f', building: '#cfe3ea', window: '#7fb6cc',
  accent: '#ff6a3d', road: '#6e6a64', fence: '#fbfaf5', trunk: '#5b4031', tree: '#3f6f3f', car: '#f2f2ee',
};
const FONT = { lyric: '600 44px "DejaVu Sans", sans-serif', lyricCenter: '600 52px "DejaVu Sans", sans-serif', title: '900 110px "DejaVu Sans", sans-serif' };

// a flat painter: roles -> palette colours
function flatPainter(ctx, pal = PAL, opts = {}) {
  const texts = [];
  return {
    texts,
    light(x, y, r, role, a = 1) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r), c = hex(pal[role]);
      g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    },
    fill(path, role, a = 1) { ctx.globalAlpha = a; ctx.fillStyle = pal[role] ?? '#f0f'; ctx.fill(path); ctx.globalAlpha = 1; },
    stroke(path, role, w) { ctx.strokeStyle = pal[role] ?? '#f0f'; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(path); },
    text(s, x, y, kind) {
      if (opts.noText) { texts.push([s, kind]); return; }
      ctx.font = FONT[kind]; ctx.textAlign = kind === 'lyricCenter' ? 'center' : 'left';
      ctx.fillStyle = kind === 'title' ? pal.ink : '#fff8e8';
      if (kind !== 'title') { ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 12; }
      ctx.fillText(s, x, y); ctx.shadowBlur = 0;
    },
  };
}

function grain(ctx, amt = 18, seed = 7) {
  const img = ctx.getImageData(0, 0, W, H), d = img.data;
  let s = seed;
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const n = ((s >>> 24) / 255 - 0.5) * amt;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}
function vignette(ctx, k = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 1.0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
const off = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// 1. FLAT CUT-PAPER: bold flat shapes, paper grain, a soft vignette
function flat(ctx, scene) {
  scene(flatPainter(ctx));
  vignette(ctx, 0.35); grain(ctx, 14);
}

// 2. LINOCUT: cream paper, black ink, one orange; tone becomes carved hatching
const TONE = { bg: 0.92, glow: 0.15, hood: 0.8, hoodIn: 0.95, skin: 0.12, skinDark: 0.55, beard: 0.7, mouth: 1, rim: 1, screen: 0,
  ink: 1, paper: 0, sky: 0.05, sun: 0, hill: 0.45, grass: 0.25, building: 0.15, window: 0.6, road: 0.6, fence: 0, trunk: 0.9, tree: 0.75, car: 0.05 };
const LINO_ACCENT = new Set(['accent', 'glow']);
function linocut(ctx, scene) {
  const INK = '#15110e', PAPER = '#efe4cc', ORANGE = '#e8622c';
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  let k = 0;
  const p = {
    light(x, y, r, role, a = 1) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, role === 'sun' ? `rgba(255,248,230,${a})` : `rgba(232,98,44,${a})`); g.addColorStop(1, 'rgba(232,98,44,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    },
    fill(path, role, a = 1) {
      k++;
      if (LINO_ACCENT.has(role)) { ctx.globalAlpha = role === 'glow' ? 0.5 : 1; ctx.fillStyle = ORANGE; ctx.fill(path); ctx.globalAlpha = 1; return; }
      const t = TONE[role] ?? 0.5;
      ctx.save(); ctx.clip(path);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      if (t >= 0.97) { ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H); }
      else if (t > 0.03) {
        // carved lines: spacing fixed, width grows with tone; angle varies by shape
        const ang = [0.6, -0.5, 1.2, 0.2][k % 4], sp = 9, w = Math.max(0.8, sp * t);
        ctx.translate(W / 2, H / 2); ctx.rotate(ang); ctx.strokeStyle = INK; ctx.lineWidth = w;
        ctx.beginPath(); for (let y = -1200; y < 1200; y += sp) { ctx.moveTo(-1200, y + Math.sin(y * 0.05) * 2); ctx.lineTo(1200, y); } ctx.stroke();
      }
      ctx.restore();
      if (role !== 'bg' && role !== 'sky') { ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(path); }
    },
    stroke(path, role, w) { ctx.strokeStyle = role === 'accent' || role === 'screen' ? ORANGE : (TONE[role] ?? 1) < 0.3 ? PAPER : INK; ctx.lineWidth = w + 2; ctx.lineCap = 'round'; ctx.stroke(path); },
    text(s, x, y, kind) {
      ctx.font = kind === 'title' ? '900 92px "DejaVu Serif", serif' : `700 ${kind === 'lyricCenter' ? 50 : 42}px "DejaVu Serif", serif`;
      ctx.textAlign = kind === 'lyricCenter' ? 'center' : 'left';
      const m = ctx.measureText(s).width, x0 = kind === 'lyricCenter' ? x - m / 2 : x;
      ctx.fillStyle = PAPER; ctx.fillRect(x0 - 18, y - (kind === 'title' ? 100 : 46), m + 36, kind === 'title' ? 128 : 64);
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(x0 - 18, y - (kind === 'title' ? 100 : 46), m + 36, kind === 'title' ? 128 : 64);
      ctx.fillStyle = INK; ctx.fillText(s, x, y);
    },
  };
  scene(p);
  grain(ctx, 22, 3);
}

// 3. PIXEL: rendered at 320x180, quantised to a 16-colour palette with ordered dithering
const PIX = ['#0b0a12', '#1f1d2e', '#3b3355', '#5d5a7a', '#8a8fb0', '#c6ccdc', '#f4f1e8', '#3a2418', '#7a4a2e', '#c98a5a',
  '#f3c49a', '#ff7a3c', '#ffd25e', '#5f8f45', '#a8d06a', '#7fe8f0'].map(hex);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function pixel(ctx, scene) {
  const w = 240, h = 135, c = off(w, h), g = c.getContext('2d');
  g.scale(w / W, h / H); const fp = flatPainter(g, PAL, { noText: true }); scene(fp); g.setTransform(1, 0, 0, 1, 0, 0);
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, bias = (BAYER[(y % 4) * 4 + (x % 4)] / 16 - 0.5) * 22;
    let best = 0, bd = 1e9;
    PIX.forEach(([r, gg, b], j) => { const dd = (d[i] + bias - r) ** 2 + (d[i + 1] + bias - gg) ** 2 + (d[i + 2] + bias - b) ** 2; if (dd < bd) { bd = dd; best = j; } });
    [d[i], d[i + 1], d[i + 2]] = PIX[best];
  }
  g.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(c, 0, 0, W, H);
  // pixel text box, RPG-style
  ctx.fillStyle = '#0b0a12'; ctx.fillRect(40, 740, W - 80, 130);
  ctx.strokeStyle = '#f4f1e8'; ctx.lineWidth = 10; ctx.strokeRect(50, 750, W - 100, 110);
  ctx.font = 'bold 40px "DejaVu Sans Mono", monospace'; ctx.fillStyle = '#f4f1e8'; ctx.textAlign = 'left';
  const [txt] = fp.texts[0] ?? ['']; ctx.fillText((txt.length > 46 ? txt.slice(0, 44) + '…' : txt) + ' ▼', 90, 822);
}

// 4. ASCII TERMINAL: the shot drawn with characters on a green-phosphor CRT
function ascii(ctx, scene) {
  const cols = 128, rows = 45, cw = W / cols, ch = H / rows;
  const c = off(cols, rows), g = c.getContext('2d');
  g.scale(cols / W, rows / H); const fp = flatPainter(g, PAL, { noText: true }); scene(fp); g.setTransform(1, 0, 0, 1, 0, 0);
  const d = g.getImageData(0, 0, cols, rows).data, RAMP = ' .`:-=+*cxq#%@';
  const Ls = []; for (let i = 0; i < d.length; i += 4) Ls.push(lum(d[i], d[i + 1], d[i + 2])); const sorted = [...Ls].sort((a, b) => a - b);
  const lo = sorted[Math.floor(sorted.length * 0.05)], hi = sorted[Math.floor(sorted.length * 0.995)];
  ctx.fillStyle = '#020a04'; ctx.fillRect(0, 0, W, H);
  ctx.font = `${Math.round(ch * 1.05)}px "DejaVu Sans Mono", monospace`; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  for (let y = 0; y < rows - 4; y++) for (let x = 0; x < cols; x++) {
    const i = (y * cols + x) * 4, L = Math.min(1, Math.max(0, (lum(d[i], d[i + 1], d[i + 2]) - lo) / (hi - lo + 1e-6))) ** 0.8;
    const chr = RAMP[Math.min(RAMP.length - 1, Math.floor(L * RAMP.length))];
    if (chr === ' ') continue;
    ctx.fillStyle = `rgba(${110 + 140 * L},255,${140 + 100 * L},${0.55 + 0.45 * L})`;
    ctx.fillText(chr, x * cw, y * ch);
  }
  ctx.fillStyle = '#7dff9a'; ctx.font = `bold ${Math.round(ch * 1.2)}px "DejaVu Sans Mono", monospace`;
  ctx.fillText(`engineer@paradise:~$ ./sing   # ${(fp.texts[0] ?? [''])[0]}█`, 20, H - ch * 2.6);
  // scanlines + phosphor glow
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
  vignette(ctx, 0.6);
}

// 5. QUILT: the shot pieced from half-square triangles of patterned fabric, with stitching
const FABRIC = ['#1b1a24', '#2f3447', '#4a2f2a', '#7a3b2e', '#b2553a', '#d9934f', '#e9c27d', '#f2e6c9',
  '#6e7f5a', '#9db06b', '#3d5f6b', '#8fb7c2'].map(hex);
function quilt(ctx, scene) {
  const S = 30, cols = Math.ceil(W / S), rows = Math.ceil(H / S), c = off(W / 5, H / 5), g = c.getContext('2d');
  g.scale(0.2, 0.2); const fp = flatPainter(g, PAL, { noText: true }); scene(fp); g.setTransform(1, 0, 0, 1, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data, cw = c.width;
  const sample = (x, y) => { const i = (Math.min(c.height - 1, Math.floor(y / 5)) * cw + Math.min(cw - 1, Math.floor(x / 5))) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const nearest = (col) => { let b = 0, bd = 1e9; FABRIC.forEach((f, j) => { const dd = f.reduce((s, v, k) => s + (v - col[k]) ** 2, 0); if (dd < bd) { bd = dd; b = j; } }); return b; };
  ctx.fillStyle = '#f2e6c9'; ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const x = q * S, y = r * S;
    // pick the diagonal that separates the cell's colours best
    const A = [sample(x + S * 0.2, y + S * 0.2), sample(x + S * 0.8, y + S * 0.8)], B = [sample(x + S * 0.8, y + S * 0.2), sample(x + S * 0.2, y + S * 0.8)];
    const diff = (u, v) => u.reduce((s, val, k) => s + Math.abs(val - v[k]), 0);
    const useB = diff(...A) < diff(...B);
    const tris = useB ? [[[x, y], [x + S, y], [x, y + S]], [[x + S, y], [x + S, y + S], [x, y + S]]] : [[[x, y], [x + S, y], [x + S, y + S]], [[x, y], [x + S, y + S], [x, y + S]]];
    tris.forEach((t) => {
      const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3, fi = nearest(sample(cx, cy)), [fr, fg, fb] = FABRIC[fi];
      const path = new Path2D(); t.forEach(([px, py], i) => (i ? path.lineTo(px, py) : path.moveTo(px, py))); path.closePath();
      ctx.fillStyle = `rgb(${fr},${fg},${fb})`; ctx.fill(path);
      // fabric print: dots or pinstripes depending on the fabric
      ctx.save(); ctx.clip(path); ctx.fillStyle = ctx.strokeStyle = lum(fr, fg, fb) > 140 ? 'rgba(60,40,30,.18)' : 'rgba(255,240,210,.14)';
      if (fi % 3 === 0) for (let yy = y + 4; yy < y + S; yy += 9) for (let xx = x + 4 + (yy % 2) * 4; xx < x + S; xx += 9) ctx.fillRect(xx, yy, 2, 2);
      else if (fi % 3 === 1) { ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = -S; k < S; k += 7) { ctx.moveTo(x + k, y); ctx.lineTo(x + k + S, y + S); } ctx.stroke(); }
      ctx.restore();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(250,240,220,.55)'; ctx.lineWidth = 1.4; ctx.stroke(path); ctx.setLineDash([]);
    });
  }
  // an embroidered label patch
  const [txt] = fp.texts[0] ?? [''];
  ctx.font = 'italic 700 40px "DejaVu Serif", serif'; const tw = ctx.measureText(txt).width;
  ctx.fillStyle = '#f2e6c9'; ctx.fillRect(80, 770, tw + 80, 90);
  ctx.setLineDash([8, 6]); ctx.strokeStyle = '#7a3b2e'; ctx.lineWidth = 3; ctx.strokeRect(92, 782, tw + 56, 66); ctx.setLineDash([]);
  ctx.fillStyle = '#4a2f2a'; ctx.textAlign = 'left'; ctx.fillText(txt, 120, 828);
}

export const STYLES = { flat, linocut, pixel, ascii, quilt };
export const STYLE_NAMES = { flat: 'Flat cut-paper', linocut: 'Linocut print', pixel: '16-bit pixel', ascii: 'ASCII terminal', quilt: 'Amish quilt' };
