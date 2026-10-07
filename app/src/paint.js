// The look (docs/TREATMENT.md "Style bible"): flat Mucha palette, one dark contour, screentone for
// light and shadow, ornament made of engineering things, lithograph grain. Everything draws in a
// 1600x900 logical frame; the engine scales to the output size.
export const W = 1600, H = 900;
export const C = {
  line: '#33281f', paper: '#ece2cb', gold: '#d2a74e', goldLt: '#e6c77f', sage: '#9aa784', sageDk: '#6f7d5e',
  rose: '#d39c8e', roseLt: '#e8c2b2', teal: '#365f63', tealDk: '#24413f', ivory: '#f4e6d2', skin: '#efd2bb',
  skinDot: '#b07e68', hoodDot: '#1a2f2e', hair: '#2b221c', cream: '#f3ead6', red: '#b5463a', redDk: '#6e2119',
  night: '#132625', sky: '#f0d9a8', hill: '#c9a865', grey: '#8d8a80',
  tealLt: '#4f8183', mint: '#a9d6cf', mintDk: '#6fa7a0', denim: '#4a5d73', denimDk: '#34445a', glass: '#bcd6d2', black: '#1e1a17',
  navy: '#3a4660', navyDk: '#283247', shirt: '#dfe6e3', char: '#4d4844', charDk: '#37332f', plum: '#6d4b5c', ochre: '#b98b3c',
  skin2: '#f4dcc9', skin3: '#e9c8ad', sepia: '#e6d3ad', sepiaDk: '#8a6a43', silver: '#cfcac0',
  skin4: '#e2bf9f', skin5: '#d6ac8b', hairBr: '#5b4030', hairAu: '#8a4a2c', hairBl: '#c9a466', hairGr: '#aaa49b', hairSp: '#5f554d', beardSp: '#8a8076',
  blossom: '#f3d2d4', blossomDk: '#dc9eaa', blossomDeep: '#c27886', bark: '#3b2b27', barkLt: '#7b655b',
};
export const FONT = { display: 'Federant, serif', caps: 'Cinzel, serif', mono: '"Plex Mono", monospace', comic: '"Comic Neue", "Comic Sans MS", cursive' };

// ---- small maths -------------------------------------------------------------------------------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const ease = {
  in: (x) => x * x, out: (x) => 1 - (1 - x) * (1 - x), inOut: (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  inCubic: (x) => x * x * x, inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outCubic: (x) => 1 - (1 - x) ** 3, inOutCubic: (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  outBack: (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2, outExpo: (x) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
};
/** piecewise keyframes: keys(t, [[t0, v0], [t1, v1, easeFn], ...]) */
export function keys(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const [a, va] = ks[i - 1], [b, vb, e] = ks[i]; return lerp(va, vb, (e ?? ease.inOut)((t - a) / (b - a))); }
  return ks[ks.length - 1][1];
}
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---- path helpers --------------------------------------------------------------------------------
export const svg = (d) => new Path2D(d);
/** draw with the palette drained of colour, k 0..1: to grey and a little washed out, like a disabled control */
export function greyed(k, draw) {
  if (k <= 0) return draw();
  const saved = { ...C };
  try {
    for (const name in saved) {
      const h = saved[name]; if (typeof h !== 'string' || h.length !== 7 || h[0] !== '#') continue;
      const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), l = 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2], wash = l + (214 - l) * 0.3;
      C[name] = '#' + v.map((c) => Math.round(c + (wash - c) * k).toString(16).padStart(2, '0')).join('');
    }
    draw();
  } finally { Object.assign(C, saved); }
}
export const ell = (x, y, rx, ry = rx) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); return p; };
export const rect = (x, y, w, h, r = 0) => { const p = new Path2D(); r ? p.roundRect(x, y, w, h, r) : p.rect(x, y, w, h); return p; };
/** a transform for SVG-path snippets drawn in a local unit space */
export const at = (x, y, s = 1, rot = 0) => (d) => { const q = new Path2D(); q.addPath(typeof d === 'string' ? svg(d) : d, new DOMMatrix().translate(x, y).rotate(rot).scale(s)); return q; };
export function archPath(x, y, w, h) { const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w / 2); p.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); p.lineTo(x + w, y + h); p.closePath(); return p; }

// ---- grain (pre-rendered, swapped at 12 fps so the print "boils" a little) ----------------------
let GRAIN = null;
function makeGrain() {
  GRAIN = [0, 1, 2, 3].map((k) => {
    const c = document.createElement('canvas'); c.width = 800; c.height = 450; const g = c.getContext('2d');
    const img = g.createImageData(800, 450), d = img.data, r = rng(97 + k * 31);
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() - 0.5) * 70; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    g.putImageData(img, 0, 0); return c;
  });
}

export function painter(ctx) {
  const P = {
    ctx,
    save() { ctx.save(); }, restore() { ctx.restore(); },
    translate(x, y) { ctx.translate(x, y); }, scale(s) { ctx.scale(s, s); }, rotate(a) { ctx.rotate(a); },
    /** zoom about (cx, cy) */
    zoom(s, cx = W / 2, cy = H / 2) { ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); },
    alpha(a) { ctx.globalAlpha = a; },
    clip(path) { ctx.clip(path); },
    fill(path, color) { ctx.fillStyle = C[color] ?? color; ctx.fill(path); },
    line(path, w = 4, color = 'line') { ctx.strokeStyle = C[color] ?? color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(path); },
    both(path, color, w = 4) { P.fill(path, color); P.line(path, w); },
    text(s, x, y, o = {}) {
      ctx.font = `${o.style ?? ''} ${o.weight ?? 400} ${o.size ?? 40}px ${o.font ?? FONT.display}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = o.baseline ?? 'alphabetic';
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${o.tracking ?? 0}px`;
      if (o.stroke) { ctx.strokeStyle = C[o.stroke] ?? o.stroke; ctx.lineWidth = o.strokeW ?? 6; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
      if (o.color !== 'none') { ctx.fillStyle = C[o.color ?? 'line'] ?? o.color; ctx.fillText(s, x, y); }
      const w = ctx.measureText(s).width; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'; return w;
    },
    measure(s, o = {}) { ctx.font = `${o.style ?? ''} ${o.weight ?? 400} ${o.size ?? 40}px ${o.font ?? FONT.display}`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${o.tracking ?? 0}px`; const w = ctx.measureText(s).width; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px'; return w; },

    /** screentone for light and shadow: hex-grid dots whose size follows a linear or radial gradient */
    tone(path, color, g, cell = 6) {
      ctx.save(); ctx.clip(path); ctx.fillStyle = C[color] ?? color;
      const [ax, ay, at0] = g.from, [bx, by, bt] = g.to, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, D = Math.sqrt(L2);
      const bb = g.bbox ?? [0, 0, W, H], rowH = cell * 0.866; ctx.beginPath();
      for (let y = Math.floor(bb[1] / rowH) * rowH; y < bb[3] + rowH; y += rowH) {
        const row = Math.round(y / rowH);
        for (let x = Math.floor(bb[0] / cell) * cell + (row % 2 ? cell / 2 : 0); x < bb[2] + cell; x += cell) {
          const u = g.radial ? Math.min(1, Math.hypot(x - ax, y - ay) / D) : clamp(((x - ax) * dx + (y - ay) * dy) / L2);
          const t = at0 + (bt - at0) * u; if (t < 0.04) continue;
          const r = cell * 0.55 * Math.sqrt(Math.min(1, t)); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      ctx.fill(); ctx.restore();
    },
    /** halo: rings, rays and a ring of keycaps; spin in radians */
    halo(cx, cy, R, glyphs = '{ } < / > ; # $ & * ( ) [ ] = +'.split(' '), spin = 0, glow = 0) {
      if (glow > 0) P.tone(ell(cx, cy, R * 1.5), 'goldLt', { from: [cx, cy, 0.9 * glow], to: [cx + R * 1.5, cy, 0], radial: true, bbox: [cx - R * 1.5, cy - R * 1.5, cx + R * 1.5, cy + R * 1.5] }, 7);
      P.both(ell(cx, cy, R), 'gold', Math.max(2, R / 66));
      ctx.save(); ctx.clip(ell(cx, cy, R * 0.97)); ctx.strokeStyle = C.goldLt; ctx.lineWidth = Math.max(1.2, R / 110);
      ctx.beginPath(); for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2 + spin * 0.5; ctx.moveTo(cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); } ctx.stroke(); ctx.restore();
      P.line(ell(cx, cy, R * 0.86), Math.max(1.5, R / 110)); P.line(ell(cx, cy, R * 0.72), Math.max(1.5, R / 110));
      glyphs.forEach((g, i) => {
        const a = -Math.PI / 2 + (i / glyphs.length) * Math.PI * 2 + spin, x = cx + Math.cos(a) * R * 0.79, y = cy + Math.sin(a) * R * 0.79;
        P.both(rect(x - R * 0.055, y - R * 0.055, R * 0.11, R * 0.11, R * 0.02), 'cream', Math.max(1, R / 130));
        if (g) P.text(g, x, y + R * 0.032, { font: FONT.mono, size: R * 0.075, weight: 600 });
      });
      P.both(ell(cx, cy, R * 0.62), 'goldLt', Math.max(1.5, R / 110));
    },
    beads(cx, cy, R, n, r, color = 'goldLt', pulse = 0) { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; P.both(ell(cx + Math.cos(a) * R, cy + Math.sin(a) * R, r * (1 + 0.35 * pulse)), color, Math.max(1, r / 4)); } },
    /** arched panel, double-ruled; returns its path */
    arch(x, y, w, h, fill = 'sage', lw = 6) {
      const p = archPath(x, y, w, h); P.both(p, fill, lw);
      const m = Math.max(8, w * 0.05); P.line(archPath(x + m, y + m, w - 2 * m, h - 2 * m), Math.max(1.5, lw * 0.4));
      return p;
    },
    /** a whiplash vine (bezier chain), optionally ending in an RJ45 plug; draw = 0..1 how much is drawn */
    vine(pts, w = 5, plug = true, draw = 1) {
      const p = new Path2D(); p.moveTo(...pts[0]);
      for (let i = 1; i + 2 < pts.length + 1; i += 3) p.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]);
      if (draw < 1) { ctx.save(); ctx.setLineDash([4000 * draw, 4000]); }
      P.line(p, w + 3); P.line(p, w - 1, 'sageDk');
      if (draw < 1) { ctx.restore(); return; }
      if (plug) {   // a USB-C plug in plain side view, big enough to read: strain relief, white overmold,
                    // and the narrower silver shell with its rounded tip
        const [x, y] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], k = ((w + 3) / 8) * 1.3, silver = '#cfcac0';
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(y - py, x - px)); ctx.scale(k, k);
        P.both(svg('M-2 -4.5 L13 -8 L13 8 L-2 4.5 Z'), 'cream', 2.5 / k);
        P.both(rect(11, -14, 38, 28, 8), 'cream', 2.5 / k);
        P.line(svg('M17 -9 L17 9'), 1.4 / k, 'grey');
        P.both(rect(48, -9.5, 20, 19, [2, 6, 6, 2]), silver, 2.2 / k);
        P.line(svg('M51 -5 L63 -5'), 1.6 / k, '#f6f1e6');
        ctx.restore();
      }
    },
    leaf(x, y, a, s = 1, color = 'sageDk') { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); P.both(svg('M0 0 C14 -16 44 -16 60 0 C44 16 14 16 0 0 Z'), color, 3 / s); P.line(svg('M4 0 L52 0'), 1.8 / s); ctx.restore(); },
    flower(x, y, s = 1, color = 'rose', rot = 0) {
      for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate((i / 5) * Math.PI * 2 + rot); P.both(svg(`M0 0 C${-14 * s} ${-12 * s} ${-12 * s} ${-34 * s} 0 ${-38 * s} C${12 * s} ${-34 * s} ${14 * s} ${-12 * s} 0 0 Z`), color, 2.5); ctx.restore(); }
      P.both(ell(x, y, 8 * s), 'gold', 2.5);
    },
    corner(x, y, rot, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      P.both(svg(`M0 0 L${78 * s} 0 A${78 * s} ${78 * s} 0 0 1 0 ${78 * s} Z`), 'goldLt', 3);
      for (const r of [60, 40]) { const p = new Path2D(); p.arc(0, 0, r * s, 0, Math.PI / 2); P.line(p, 2.5); }
      ctx.restore();
    },
    /** ribbon banner with forked tails */
    banner(x, y, w, h, o = {}) {
      for (const sx of [-1, 1]) {
        const ex = x + (sx < 0 ? 0 : w), d = sx * h * 0.7;
        P.both(svg(`M${ex} ${y + h * 0.14} L${ex + d} ${y + h * 0.14} L${ex + d - sx * h * 0.26} ${y + h * 0.64} L${ex + d} ${y + h * 1.14} L${ex} ${y + h * 1.14} Z`), o.tail ?? 'roseLt', 4);
      }
      P.both(rect(x, y, w, h, 10), o.fill ?? 'cream', 5);
      P.line(rect(x + 10, y + 10, w - 20, h - 20, 6), 2);
    },
    /** paper background */
    paper(color = 'paper') { P.fill(rect(0, 0, W, H), color); },
    grain(t, amount = 0.16) {
      if (!GRAIN) makeGrain();
      const k = Math.floor(t * 12) % 4;
      ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = amount * 2.2; ctx.drawImage(GRAIN[k], 0, 0, W, H); ctx.restore();
    },
  };
  return P;
}

/**
 * Karaoke lettering: each word inks in (dim -> full) across its sung time. Lays the line out centred
 * at (x, y) (or left-aligned), wrapping to a second line past maxW. Returns the laid-out boxes.
 */
export function lyric(P, line, t, x, y, o = {}) {
  const size = o.size ?? 48, font = o.font ?? FONT.display, gap = size * 0.28, maxW = o.maxW ?? 1300, lh = size * 1.18;
  const words = line.words.map((w) => ({ w, s: w.w, wd: P.measure(w.w, { size, font, weight: o.weight }) }));
  let rows = [[]]; let rw = 0;
  for (const it of words) { if (rw + it.wd > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(it); rw += it.wd + gap; }
  if (rows.length === 2) {   // balance two rows: break where the longer row is shortest
    const ws = words.map((it) => it.wd + gap); let best = 1, bestW = Infinity;
    const total = ws.reduce((u, v) => u + v, 0);
    for (let k = 1; k < words.length; k++) { const a = ws.slice(0, k).reduce((u, v) => u + v, 0), b = total - a, punct = /[,;:—.!?]$/.test(words[k - 1].s.trim()), score = Math.max(a, b) - (punct ? total * 0.12 : 0); if (score < bestW && a <= maxW + gap && b <= maxW + gap) { bestW = score; best = k; } }
    rows = [words.slice(0, best), words.slice(best)];
  }
  const pre = o.lead ?? 0.4, visible = t >= line.start - pre;
  if (!visible && !o.always) return rows;
  const ctx = P.ctx;
  rows.forEach((row, ri) => {
    const total = row.reduce((s, it) => s + it.wd, 0) + gap * (row.length - 1);
    let cx = o.align === 'left' ? x : x - total / 2; const cy = y + (ri - (rows.length - 1) / 2) * lh * (o.align === 'left' ? 0 : 1) + (o.align === 'left' ? ri * lh : 0);
    for (const it of row) {
      const p = Math.max(0, Math.min(1, (t - it.w.start) / Math.max(0.06, it.w.end - it.w.start)));
      const intro = clamp((t - (line.start - pre)) / pre);
      P.save(); P.alpha(0.22 + 0.13 * intro);
      P.text(it.s, cx, cy, { size, font, align: 'left', color: o.dim ?? 'line', weight: o.weight }); P.restore();
      if (p > 0) {
        P.save(); ctx.beginPath(); ctx.rect(cx - 4, cy - size * 1.1, (it.wd + 8) * Math.min(1, p * 1.15), size * 1.6); ctx.clip();
        P.text(it.s, cx, cy, { size, font, align: 'left', color: o.color ?? 'line', weight: o.weight, stroke: o.stroke, strokeW: o.strokeW });
        P.restore();
      }
      it.x = cx; it.y = cy; cx += it.wd + gap;
    }
  });
  return rows;
}
