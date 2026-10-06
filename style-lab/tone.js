// The shared material: a print. Every frame is a few spot inks on paper. Each ink is its own layer,
// filled solid, with a halftone/screentone of dots or lines, or a halftone gradient; the layers are
// multiplied onto the paper slightly out of register, then paper grain. Homages change composition,
// type and ink choice, never the material.
export const W = 1600, H = 900;

export const INK = {
  black: '#1f1c1b', blue: '#0078bf', pink: '#ff48b0', yellow: '#ffe800', red: '#ff665e',
  teal: '#00838a', purple: '#765ba7', orange: '#ff6c2f', green: '#00a95c', gray: '#88898a', coral: '#ff8e7a',
};
const ANGLE = { black: 45, blue: 15, pink: 75, yellow: 0, red: 75, teal: 15, purple: 15, orange: 75, green: 15, gray: 45, coral: 75 };
const REG = { black: [0, 0], blue: [2.5, -1.5], pink: [-2, 2], yellow: [1.5, 2.5], red: [-2.5, 1], teal: [2, 1.5],
  purple: [-1.5, -2], orange: [2, -2], green: [-2, -1.5], gray: [1, 1], coral: [-1.5, 2] };

const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export function makePrint(paper = '#f3eee4', opt = {}) {
  const regK = opt.reg ?? 1, grainAmt = opt.grain ?? 16, speckle = opt.speckle ?? 0;
  const layers = {};
  const layer = (ink) => (layers[ink] ??= mk().getContext('2d'));
  const every = (fn) => Object.values(layers).forEach(fn);

  // dots for tone t (0..1) of `ink` inside the current clip; t may vary along a gradient
  function dots(g, ink, tf, bbox, cell = 8) {
    const a = (ANGLE[ink] * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const [x0, y0, x1, y1] = bbox, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + cell;
    g.fillStyle = INK[ink]; g.beginPath();
    for (let v = -R; v < R; v += cell) for (let u = -R; u < R; u += cell) {
      const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
      if (x < x0 - cell || x > x1 + cell || y < y0 - cell || y > y1 + cell) continue;
      const t = Math.max(0, Math.min(1, tf(x, y)));
      if (t < 0.02) continue;
      const r = cell * 0.72 * Math.sqrt(t);
      g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2);
    }
    g.fill();
  }
  function lines(g, ink, t, bbox, cell = 7, ang = 45) {
    const a = (ang * Math.PI) / 180, [x0, y0, x1, y1] = bbox, R = Math.hypot(x1 - x0, y1 - y0);
    g.save(); g.translate((x0 + x1) / 2, (y0 + y1) / 2); g.rotate(a);
    g.strokeStyle = INK[ink]; g.lineWidth = Math.max(0.6, cell * t); g.beginPath();
    for (let y = -R; y < R; y += cell) { g.moveTo(-R, y); g.lineTo(R, y); }
    g.stroke(); g.restore();
  }

  const P = {
    /** tone: 1 solid; (0,1) dots; {from:[x,y,t], to:[x,y,t]} a halftone gradient; pattern 'lines' for line tone */
    fill(path, ink, tone = 1, o = {}) {
      if (ink === 'paper') { every((g) => { g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(path); g.restore(); }); return; }
      const g = layer(ink), bb = o.bbox ?? [0, 0, W, H];
      if (o.knockout) every((h) => { h.save(); h.globalCompositeOperation = 'destination-out'; h.fill(path); h.restore(); });
      g.save(); g.clip(path);
      if (tone === 1) { g.fillStyle = INK[ink]; g.fillRect(0, 0, W, H); }
      else if (typeof tone === 'number') o.pattern === 'lines' ? lines(g, ink, tone, bb, o.cell ?? 7, o.angle ?? 45) : dots(g, ink, () => tone, bb, o.cell ?? 8);
      else {
        const [ax, ay, at] = tone.from, [bx, by, bt] = tone.to, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
        const radial = tone.radial;
        dots(g, ink, (x, y) => {
          const s = radial ? Math.min(1, Math.hypot(x - ax, y - ay) / Math.hypot(dx, dy)) : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2));
          return at + (bt - at) * s;
        }, bb, o.cell ?? 8);
      }
      g.restore();
    },
    line(path, ink, w = 4) {
      const g = layer(ink); g.strokeStyle = INK[ink]; g.lineCap = 'round'; g.lineJoin = 'round';
      g.lineWidth = w; g.stroke(path);
      g.globalAlpha = 0.5; g.lineWidth = w * 0.7; g.translate(0.8, -0.6); g.stroke(path); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    },
    text(s, x, y, o) {
      const g = layer(o.ink ?? 'black');
      g.font = `${o.style ?? ''} ${o.weight ?? 400} ${o.size}px ${o.font}`; g.textAlign = o.align ?? 'left'; g.textBaseline = 'alphabetic';
      if (g.letterSpacing !== undefined) g.letterSpacing = `${o.tracking ?? 0}px`;
      if (o.knockout) every((h) => { h.save(); h.font = g.font; h.textAlign = g.textAlign; if (h.letterSpacing !== undefined) h.letterSpacing = g.letterSpacing; h.globalCompositeOperation = 'destination-out'; h.fillText(s, x, y); h.restore(); });
      if (o.ink !== 'paper') { g.fillStyle = INK[o.ink ?? 'black']; g.fillText(s, x, y); }
      return g.measureText(s).width;
    },
    compose(ctx, seed = 1) {
      ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'multiply';
      for (const [ink, g] of Object.entries(layers)) {
        const [dx, dy] = REG[ink] ?? [0, 0];
        if (speckle) {   // riso: ink drops out in tiny specks and thins toward one edge of the drum
          const id = g.getImageData(0, 0, W, H), a = id.data; let r = ink.length * 7919;
          for (let i = 3; i < a.length; i += 4) { if (!a[i]) continue; r = (r * 1664525 + 1013904223) >>> 0; if ((r >>> 24) < speckle) a[i] = 0; else a[i] *= 0.86 + 0.14 * ((i / 4) % W) / W; }
          g.putImageData(id, 0, 0);
        }
        ctx.drawImage(g.canvas, dx * regK, dy * regK);
      }
      ctx.globalCompositeOperation = 'source-over';
      // paper grain and uneven ink
      const img = ctx.getImageData(0, 0, W, H), d = img.data; let s = seed * 9973;
      for (let i = 0; i < d.length; i += 4) {
        s = (s * 1664525 + 1013904223) >>> 0; const n = ((s >>> 24) / 255 - 0.5) * grainAmt;
        d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9;
      }
      ctx.putImageData(img, 0, 0);
    },
  };
  return P;
}
