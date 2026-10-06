// Material, round 3: manga ink. White paper, black pen lines with thick/thin weight, mechanical
// screentone (45° dot screens, gradation tone, line tone), scratched-out highlights, focus and speed
// lines. At most one spot colour per frame, mostly as tone. Homages change composition and type only.
export const W = 1600, H = 900;
export const SPOT = { none: null, red: '#e8332a', blue: '#1f5bd6', acid: '#c6e400', purple: '#7a4fc2', green: '#00a36c', yellow: '#ffd400' };
const PAPER = '#fbfaf6', INKC = '#151515';
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

export function makeManga(spot = null) {
  const ink = mk().getContext('2d'), sp = mk().getContext('2d');
  const L = (which) => (which === 'spot' ? sp : ink);
  const col = (which) => (which === 'spot' ? spot : INKC);

  function screen(g, color, tf, bb, cell, angle = 45) {
    const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const [x0, y0, x1, y1] = bb, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + cell;
    g.fillStyle = color; g.beginPath();
    for (let v = -R; v < R; v += cell) for (let u = -R; u < R; u += cell) {
      const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
      if (x < x0 - cell || x > x1 + cell || y < y0 - cell || y > y1 + cell) continue;
      const t = Math.max(0, Math.min(1, tf(x, y))); if (t < 0.03) continue;
      const r = cell * 0.7 * Math.sqrt(t); g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2);
    }
    g.fill();
  }
  const knock = (path) => [ink, sp].forEach((g) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(path); g.restore(); });

  return {
    /** tone: 'solid' | 'white' | number (flat screen) | {from:[x,y,t],to:[x,y,t],radial?} | {lines:t, angle} ; o.layer 'ink'|'spot' */
    fill(path, tone, o = {}) {
      if (tone === 'white') { knock(path); return; }
      if (o.knockout !== false && tone !== 'solid') knock(path);
      const g = L(o.layer), c = col(o.layer), bb = o.bbox ?? [0, 0, W, H], cell = o.cell ?? 7;
      g.save(); g.clip(path);
      if (tone === 'solid') { g.fillStyle = c; g.fillRect(0, 0, W, H); }
      else if (typeof tone === 'number') screen(g, c, () => tone, bb, cell);
      else if (tone.lines !== undefined) {
        g.translate((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2); g.rotate(((tone.angle ?? 0) * Math.PI) / 180);
        g.strokeStyle = c; g.lineWidth = Math.max(0.7, (o.cell ?? 6) * tone.lines); g.beginPath();
        for (let y = -1400; y < 1400; y += o.cell ?? 6) { g.moveTo(-1400, y); g.lineTo(1400, y); } g.stroke();
      } else {
        const [ax, ay, at] = tone.from, [bx, by, bt] = tone.to, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy, D = Math.hypot(dx, dy);
        screen(g, c, (x, y) => at + (bt - at) * (tone.radial ? Math.min(1, Math.hypot(x - ax, y - ay) / D) : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2))), bb, cell);
      }
      g.restore();
    },
    /** a pen line: a thin stroke plus a heavier pass nudged to the shadow side (thick/thin) */
    pen(path, w = 4, o = {}) {
      const g = L(o.layer); g.strokeStyle = o.white ? PAPER : col(o.layer); g.lineCap = 'round'; g.lineJoin = 'round';
      if (o.white) { g.save(); g.globalCompositeOperation = 'destination-out'; }
      g.lineWidth = w; g.stroke(path);
      if (!o.white && o.weight !== false) { g.save(); g.translate(w * 0.35, w * 0.45); g.lineWidth = w * 0.8; g.stroke(path); g.restore(); }
      if (o.white) g.restore();
    },
    /** white scratch highlights cut into tone */
    scratch(path, w = 3) { [ink, sp].forEach((g) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.lineWidth = w; g.lineCap = 'round'; g.stroke(path); g.restore(); }); },
    /** 集中線: focus lines radiating from (cx,cy), leaving a clear centre of radius r0 */
    focus(cx, cy, r0, n = 220, seed = 3, o = {}) {
      const g = L(o.layer); g.fillStyle = col(o.layer); let s = seed;
      const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, w = 0.004 + rnd() * 0.012, r1 = r0 * (0.9 + rnd() * 0.5), R = 2000;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.lineTo(cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R); g.lineTo(cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R); g.fill();
      }
    },
    /** horizontal speed lines in a band */
    speed(y0, y1, n = 60, seed = 5, o = {}) {
      const g = L(o.layer); g.strokeStyle = col(o.layer); g.lineCap = 'round'; let s = seed;
      const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      for (let i = 0; i < n; i++) { const y = y0 + rnd() * (y1 - y0), x = rnd() * W, l = 200 + rnd() * 700; g.lineWidth = 1 + rnd() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
    },
    text(s, x, y, o) {
      const g = L(o.layer); g.font = `${o.style ?? ''} ${o.weight ?? 400} ${o.stretch ? o.stretch + ' ' : ''}${o.size}px ${o.font}`;
      g.textAlign = o.align ?? 'left'; if (g.letterSpacing !== undefined) g.letterSpacing = `${o.tracking ?? 0}px`;
      if (o.fontStretch && g.fontStretch !== undefined) g.fontStretch = o.fontStretch;
      if (o.white) { [ink, sp].forEach((h) => { h.save(); h.font = g.font; h.textAlign = g.textAlign; if (h.letterSpacing !== undefined) h.letterSpacing = g.letterSpacing; if (o.fontStretch && h.fontStretch !== undefined) h.fontStretch = o.fontStretch; h.globalCompositeOperation = 'destination-out'; h.fillText(s, x, y); h.restore(); }); return; }
      if (o.outline) { g.lineWidth = o.outline; g.strokeStyle = col(o.layer); g.lineJoin = 'round'; g.strokeText(s, x, y); }
      else { g.fillStyle = col(o.layer); g.fillText(s, x, y); }
    },
    compose(ctx, seed = 1) {
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'multiply';
      if (spot) ctx.drawImage(sp.canvas, 0.8, -0.6);
      ctx.drawImage(ink.canvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const img = ctx.getImageData(0, 0, W, H), d = img.data; let s = seed * 7919;
      for (let i = 0; i < d.length; i += 4) { s = (s * 1664525 + 1013904223) >>> 0; const n = ((s >>> 24) / 255 - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      ctx.putImageData(img, 0, 0);
    },
  };
}
