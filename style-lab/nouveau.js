// Round 5: a simplified, modern Art Nouveau (Mucha-like) look. Flat muted colour, one dark contour
// line, halos, arches and whiplash curves, lithograph grain. Ornament is made of engineering things.
export const W = 1600, H = 900;
export const C = {
  line: '#33281f', paper: '#ece2cb', gold: '#d2a74e', goldLt: '#e6c77f', sage: '#9aa784', sageDk: '#6f7d5e',
  rose: '#d39c8e', roseLt: '#e8c2b2', teal: '#365f63', tealDk: '#24413f', ivory: '#f4e6d2', skin: '#efd2bb',
  skinSh: '#d9ae95', hair: '#2b221c', cream: '#f3ead6', red: '#b5463a',
};
const ell = (x, y, rx, ry = rx) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); return p; };

export function painter(ctx) {
  const P = {
    fill(path, color) { ctx.fillStyle = C[color] ?? color; ctx.fill(path); },
    line(path, w = 4, color = 'line') { ctx.strokeStyle = C[color] ?? color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(path); },
    both(path, color, w = 4) { P.fill(path, color); P.line(path, w); },
    text(s, x, y, o) {
      ctx.font = `${o.weight ?? 400} ${o.size}px ${o.font}`; ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = 'alphabetic';
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${o.tracking ?? 0}px`;
      if (o.stroke) { ctx.strokeStyle = C[o.stroke] ?? o.stroke; ctx.lineWidth = o.strokeW ?? 6; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
      ctx.fillStyle = C[o.color ?? 'line'] ?? o.color; ctx.fillText(s, x, y);
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0px';
    },
    /** soft dot shading, kept from the earlier rounds as a quiet texture */
    dots(path, color, t0, t1, from, to, cell = 7) {
      ctx.save(); ctx.clip(path); ctx.fillStyle = C[color] ?? color;
      const [ax, ay] = from, [bx, by] = to, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
      ctx.beginPath();
      for (let y = 0; y < H; y += cell) for (let x = (y / cell) % 2 ? cell / 2 : 0; x < W; x += cell) {
        const s = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2)), t = t0 + (t1 - t0) * s;
        if (t < 0.04) continue; const r = cell * 0.62 * Math.sqrt(t); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill(); ctx.restore();
    },
    /** the halo: rings, radial rays, and a ring of glyphs (keycaps / code) */
    halo(cx, cy, R, glyphs = '{ } < / > ; # $ & * ( ) [ ] = +'.split(' ')) {
      P.both(ell(cx, cy, R), 'gold', 5);
      ctx.save(); ctx.clip(ell(cx, cy, R * 0.97));
      ctx.strokeStyle = C.goldLt; ctx.lineWidth = 3;
      for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
      ctx.restore();
      P.line(ell(cx, cy, R * 0.86), 3); P.line(ell(cx, cy, R * 0.72), 3);
      glyphs.forEach((g, i) => {
        const a = -Math.PI / 2 + (i / glyphs.length) * Math.PI * 2, x = cx + Math.cos(a) * R * 0.79, y = cy + Math.sin(a) * R * 0.79;
        const k = new Path2D(); k.roundRect(x - R * 0.055, y - R * 0.055, R * 0.11, R * 0.11, R * 0.02); P.both(k, 'cream', 2.5);
        P.text(g, x, y + R * 0.032, { font: '"Plex Mono", monospace', size: R * 0.075, weight: 600 });
      });
      P.both(ell(cx, cy, R * 0.62), 'goldLt', 3);
    },
    /** arched panel: a rectangle with a round top, double-ruled */
    arch(x, y, w, h, fill = 'sage') {
      const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w / 2); p.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); p.lineTo(x + w, y + h); p.closePath();
      P.both(p, fill, 6);
      const q = new Path2D(); const m = 14; q.moveTo(x + m, y + h - m); q.lineTo(x + m, y + w / 2); q.arc(x + w / 2, y + w / 2, w / 2 - m, Math.PI, 0); q.lineTo(x + w - m, y + h - m); q.closePath();
      P.line(q, 2.5);
      return p;
    },
    /** a whiplash vine that ends in an RJ45 plug instead of a flower */
    vine(pts, w = 5, plug = true) {
      const p = new Path2D(); p.moveTo(...pts[0]);
      for (let i = 1; i + 2 < pts.length + 1; i += 3) p.bezierCurveTo(...pts[i], ...pts[i + 1], ...pts[i + 2]);
      P.line(p, w + 3); P.line(p, w - 1, 'sageDk');
      if (plug) {
        const [x, y] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], a = Math.atan2(y - py, x - px);
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        const b = new Path2D(); b.roundRect(0, -13, 34, 26, 4); P.both(b, 'cream', 3);
        for (let i = 0; i < 4; i++) P.line(new Path2D(`M${8 + i * 6} -9 L${8 + i * 6} 9`), 1.5);
        P.both(new Path2D('M34 -5 L42 -5 L42 5 L34 5 Z'), 'cream', 2.5);
        ctx.restore();
      }
    },
    /** screentone for light and shadow: dots whose size follows a linear or radial gradient */
    tone(path, color, g, cell = 6) {
      ctx.save(); ctx.clip(path); ctx.fillStyle = C[color] ?? color;
      const [ax, ay, at] = g.from, [bx, by, bt] = g.to, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy, D = Math.sqrt(L2);
      const bb = g.bbox ?? [0, 0, W, H]; ctx.beginPath();
      for (let y = bb[1]; y < bb[3]; y += cell * 0.866) {
        const row = Math.round((y - bb[1]) / (cell * 0.866));
        for (let x = bb[0] + (row % 2 ? cell / 2 : 0); x < bb[2]; x += cell) {
          const u = g.radial ? Math.min(1, Math.hypot(x - ax, y - ay) / D) : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2));
          const t = at + (bt - at) * u; if (t < 0.04) continue;
          const r = cell * 0.55 * Math.sqrt(t); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      ctx.fill(); ctx.restore();
    },
    /** a ring of beads */
    beads(cx, cy, R, n, r, color = 'goldLt') { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; P.both(ell(cx + Math.cos(a) * R, cy + Math.sin(a) * R, r), color, 2); } },
    /** a simple five-petal blossom */
    flower(x, y, s = 1, color = 'rose') {
      for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate((i / 5) * Math.PI * 2); P.both(new Path2D(`M0 0 C${-14 * s} ${-12 * s} ${-12 * s} ${-34 * s} 0 ${-38 * s} C${12 * s} ${-34 * s} ${14 * s} ${-12 * s} 0 0 Z`), color, 2.5); ctx.restore(); }
      P.both(ell(x, y, 8 * s), 'gold', 2.5);
    },
    /** corner ornament: a fan of arcs */
    corner(x, y, rot, s = 1) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      for (const r of [70, 52, 34]) { const p = new Path2D(); p.arc(0, 0, r * s, 0, Math.PI / 2); P.line(p, 3); }
      P.both(new Path2D(`M0 0 L${78 * s} 0 A${78 * s} ${78 * s} 0 0 1 0 ${78 * s} Z`), 'goldLt', 3);
      for (const r of [60, 40]) { const p = new Path2D(); p.arc(0, 0, r * s, 0, Math.PI / 2); P.line(p, 2.5); }
      ctx.restore();
    },
    /** an almond leaf on a vine */
    leaf(x, y, a, s = 1, color = 'sageDk') {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
      const l = new Path2D('M0 0 C14 -16 44 -16 60 0 C44 16 14 16 0 0 Z'); P.both(l, color, 3 / s);
      P.line(new Path2D('M4 0 L52 0'), 1.8 / s); ctx.restore();
    },
    grain(seed = 1) {
      const img = ctx.getImageData(0, 0, W, H), d = img.data; let s = seed * 7919;
      for (let i = 0; i < d.length; i += 4) {
        s = (s * 1664525 + 1013904223) >>> 0; const n = ((s >>> 24) / 255 - 0.5) * 14;
        const blot = Math.sin((i / 4 % W) * 0.013 + Math.floor(i / 4 / W) * 0.009) * 3;   // uneven litho ink
        d[i] += n + blot; d[i + 1] += n + blot; d[i + 2] += n * 0.8 + blot;
      }
      ctx.putImageData(img, 0, 0);
    },
  };
  return P;
}
