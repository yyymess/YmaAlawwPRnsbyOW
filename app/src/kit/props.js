// Props and staging helpers shared by scenes.
import { C, at, ell, rect, svg, lyric, FONT, clamp } from '../paint.js';

/** the time of the last beat at/before the first word of the matching line: a cut that never lands late */
export function cut(f, q, nth = 0, tol = 0.03) {
  const s = f.L.get(q, nth).words[0].start;
  return f.A.timeOfBeat(Math.floor(f.A.beatAt(s + tol)));
}
/** the downbeat nearest to time t */
export function nearestBar(f, t) { return f.A.timeOfBar(Math.round(f.A.barAt(t))); }

/** A lyric lettered on a ribbon banner. Sizes itself to the line (up to maxW), centred at (cx, cy). */
export function lyricBanner(P, f, line, cx, cy, o = {}) {
  const size = o.size ?? 44, maxW = o.maxW ?? 1180;
  const textW = Math.min(maxW, line.words.reduce((s, w) => s + P.measure(w.w, { size }) + size * 0.28, 0));
  const rows = textW >= maxW - 1 ? 2 : 1, h = size * (rows === 2 ? 2.55 : 1.75), w = Math.min(maxW, textW) + size * 1.3;
  const k = o.unfurl ?? 1;
  P.save(); if (k < 1) { const c = new Path2D(); c.rect(cx - (w / 2 + h) * k, cy - h, (w + 2 * h) * k, h * 3); P.clip(c); }
  P.banner(cx - w / 2, cy - h / 2, w, h, { fill: o.fill ?? 'cream', tail: o.tail ?? 'roseLt' });
  lyric(P, line, f.t, cx, cy + size * 0.36, { size, maxW, always: true, lead: 0.5 });
  P.restore();
}

/** A robo-taxi in profile, facing left (dir = -1) or right (1); its roof sensor spins with t. */
export function robotaxi(P, x, y, s, t, dir = -1) {
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s * dir * -1, s);
  const lw = 4 / s;
  // body
  P.both(svg('M-220 -20 C-220 -70 -190 -90 -140 -96 L-90 -150 C-70 -170 60 -170 90 -150 L150 -96 C200 -92 225 -70 225 -20 L225 10 L-220 10 Z'), 'cream', lw);
  P.tone(svg('M-220 -20 L225 -20 L225 10 L-220 10 Z'), 'skinDot', { from: [0, -30, 0], to: [0, 10, 0.5], bbox: [-230, -40, 235, 20] }, 5);
  P.both(svg('M-80 -140 C-66 -152 -10 -154 -6 -140 L-6 -100 L-122 -100 Z'), 'teal', lw * 0.8);
  P.both(svg('M6 -140 C10 -154 62 -152 80 -140 L118 -100 L6 -100 Z'), 'teal', lw * 0.8);
  P.line(svg('M0 -100 L0 0 M-150 -60 L-120 -60'), lw * 0.7);
  P.both(rect(-200, -40, 40, 14, 6), 'gold', lw * 0.6);                                             // lamp
  // the roof sensor: a little turning drum, its stripes slide with t
  P.both(rect(-30, -190, 60, 30, 6), 'tealDk', lw * 0.8);
  P.both(ell(0, -196, 40, 12), 'gold', lw * 0.8);
  ctx.save(); ctx.clip(rect(-30, -190, 60, 30, 6));
  for (let i = -3; i < 4; i++) { const xx = ((i * 20 + t * 90) % 60 + 60) % 60 - 30; P.line(svg(`M${xx} -190 L${xx} -160`), lw * 0.7, 'goldLt'); }
  ctx.restore();
  // wheels with turning spokes
  for (const wx of [-130, 140]) {
    P.both(ell(wx, 10, 46), 'line', lw); P.both(ell(wx, 10, 26), 'grey', lw * 0.6);
    for (let k = 0; k < 5; k++) { const a = k * 1.2566 - t * 6; P.line(svg(`M${wx} 10 L${wx + Math.cos(a) * 24} ${10 + Math.sin(a) * 24}`), lw * 0.5); }
  }
  ctx.restore();
}

/** A token: a small rounded tag with a word-piece on it, like a petal. */
export function token(P, x, y, s, rot, text) {
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = Math.max(44, P.measure(text, { font: FONT.mono, size: 22, weight: 600 }) + 22);
  P.both(rect(-w / 2, -18, w, 36, 18), 'cream', 2.5);
  P.text(text, 0, 8, { font: FONT.mono, size: 22, weight: 600 });
  ctx.restore();
}

/** The agent: a blinking cursor with a tiny halo, the guardian angel of the phone. */
export function agent(P, x, y, s, t) {
  const on = Math.floor(t * 2.2) % 2 === 0;
  P.tone(ell(x, y, 70 * s), 'goldLt', { from: [x, y, 0.8], to: [x + 70 * s, y, 0], radial: true, bbox: [x - 70 * s, y - 70 * s, x + 70 * s, y + 70 * s] }, 5);
  P.both(ell(x, y - 46 * s, 24 * s, 7 * s), 'gold', 2.5);
  if (on) P.both(rect(x - 9 * s, y - 28 * s, 18 * s, 50 * s, 3), 'line', 2);
  else P.line(rect(x - 9 * s, y - 28 * s, 18 * s, 50 * s, 3), 2);
}

/** Poster frame: double rule and corner fans. */
export function posterFrame(P, m = 18) {
  P.line(rect(m, m, 1600 - 2 * m, 900 - 2 * m, 6), 3);
  for (const [x, y, r] of [[m, m, 0], [1600 - m, m, Math.PI / 2], [1600 - m, 900 - m, Math.PI], [m, 900 - m, -Math.PI / 2]]) P.corner(x, y, r, 0.9);
}
