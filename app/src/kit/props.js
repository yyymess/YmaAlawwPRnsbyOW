// Props and staging helpers shared by scenes.
import { C, at, ell, rect, svg, lyric, FONT, clamp } from '../paint.js';

/** the time of the last beat at/before the first word of the matching line: a cut that never lands late */
export function cut(f, q, nth = 0, tol = 0.03) {
  const s = f.L.get(q, nth).words[0].start;
  return f.A.timeOfBeat(Math.floor(f.A.beatAt(s + tol)));
}
/** a cut for a line: on the last beat before its first word, but never before the previous line has ended */
export function beatCut(f, line) {
  const i = f.L.lines.indexOf(line), prev = i > 0 ? f.L.lines[i - 1] : null;
  const b = f.A.timeOfBeat(Math.floor(f.A.beatAt(line.words[0].start + 0.03)));
  return Math.min(line.words[0].start - 0.05, Math.max(b, prev ? prev.end : 0));
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

/**
 * A robo-taxi pod (bidirectional, no bonnet, like the boxy carriage pods): sensor towers on the top
 * corners, a big glazed middle, wheels at the very ends with X-pattern covers. Centred on (x, y) = ground.
 */
export function robotaxi(P, x, y, s, t, dir = -1) {
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const lw = Math.max(1.5, 4 * s) / s, roll = -dir * t * 5.5;
  const body = svg('M-236 -56 C-240 -170 -226 -232 -170 -240 L170 -240 C226 -232 240 -170 236 -56 L236 -30 C236 -12 224 -6 210 -6 L-210 -6 C-224 -6 -236 -12 -236 -30 Z');
  P.fill(body, 'mint'); P.tone(body, 'mintDk', { from: [0, -150, 0], to: [0, -6, 0.55], bbox: [-240, -245, 240, 0] }, 5); P.line(body, lw * 1.4);
  // glazing: the two middle door panes, the end windows
  for (const [gx, gw] of [[-94, 92], [2, 92]]) { P.both(rect(gx, -214, gw, 196, 14), 'black', lw); P.line(svg(`M${gx + 14} -200 L${gx + 40} -150`), lw * 0.8, 'glass'); }
  P.line(svg('M0 -214 L0 -18'), lw);
  for (const sx of [-1, 1]) {
    P.both(svg(`M${sx * 112} -206 L${sx * 196} -206 C${sx * 214} -206 ${sx * 220} -190 ${sx * 220} -170 L${sx * 220} -118 L${sx * 112} -118 Z`), 'black', lw);
    P.both(rect(sx * 232 - 7, -200, 14, 150, 6), 'black', lw * 0.8);                                     // side sensor bar
    P.both(rect(sx * 168 - 14, -270, 28, 32, 5), 'black', lw * 0.8);                                     // corner sensor tower
    P.both(rect(sx * 168 - 24, -292, 48, 22, 8), 'tealDk', lw * 0.8);
    ctx.save(); ctx.beginPath(); ctx.rect(sx * 168 - 24, -292, 48, 22); ctx.clip();
    for (let i = 0; i < 4; i++) { const xx = ((i * 14 + t * 60) % 48 + 48) % 48 - 24; P.line(svg(`M${sx * 168 + xx} -292 L${sx * 168 + xx} -270`), lw * 0.6, 'goldLt'); }
    ctx.restore();
    P.both(rect(sx * 222 - 4, -92, 8, 18, 3), 'gold', lw * 0.6);                                          // light
  }
  P.ctx.save(); P.ctx.setLineDash([]); P.line(ell(0, -300, 210, 20), lw * 2.6, 'line'); P.line(ell(0, -300, 210, 20), lw * 1.4, 'gold'); P.ctx.restore();   // its sensors' halo
  // wheels at the ends, with X covers
  for (const wx of [-170, 170]) {
    P.both(svg(`M${wx - 80} -6 C${wx - 80} -70 ${wx + 80} -70 ${wx + 80} -6 Z`), 'mintDk', lw);          // arch
    P.both(ell(wx, -2, 62), 'black', lw); P.both(ell(wx, -2, 40), 'line', lw * 0.6);
    for (let k = 0; k < 4; k++) {
      const a = roll + k * Math.PI / 2 + Math.PI / 4;
      ctx.save(); ctx.translate(wx + Math.cos(a) * 22, -2 + Math.sin(a) * 22); ctx.rotate(a); P.both(rect(-11, -9, 22, 18, 7), 'cream', lw * 0.5); ctx.restore();
    }
  }
  ctx.restore();
}

/** A Mucha tree: a trunk that forks, a canopy of scalloped lobes with leaf curls, shade in screentone. */
export function tree(P, x, y, s, seed = 1) {
  const ctx = P.ctx, r = rng0(seed); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const lw = Math.max(1.3, 3.5 * s) / s;
  P.both(svg('M-14 0 C-12 -60 -16 -110 -40 -150 L-26 -158 C-6 -126 2 -108 4 -96 C12 -122 26 -146 52 -166 L62 -154 C34 -128 18 -96 16 -60 C14 -30 16 -10 18 0 Z'), 'hair', lw);
  const lobes = [[-70, -200, 70], [0, -250, 84], [72, -196, 68], [-34, -150, 58], [44, -146, 56], [8, -180, 66]];
  for (const [cx, cy, rr] of lobes) {
    const p = scallop(cx, cy, rr, 9 + Math.floor(r() * 3), r() * 6);
    P.fill(p, r() > 0.5 ? 'sageDk' : 'sage');
    P.tone(p, 'hoodDot', { from: [cx - rr * 0.4, cy - rr * 0.4, 0], to: [cx + rr, cy + rr, 0.5], bbox: [cx - rr * 1.2, cy - rr * 1.2, cx + rr * 1.2, cy + rr * 1.2] }, 5);
    P.line(p, lw);
    for (let k = 0; k < 3; k++) { const a = r() * Math.PI * 2, d = rr * (0.25 + r() * 0.4), lx = cx + Math.cos(a) * d, ly = cy + Math.sin(a) * d; P.line(svg(`M${lx - 10} ${ly + 4} C${lx - 6} ${ly - 8} ${lx + 6} ${ly - 8} ${lx + 10} ${ly + 2}`), lw * 0.6); }
  }
  ctx.restore();
}
/** A cypress: a tall flame of foliage in stacked scallops. */
export function cypress(P, x, y, s) {
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const lw = Math.max(1.3, 3.5 * s) / s;
  P.both(rect(-6, -20, 12, 22), 'hair', lw);
  const f = svg('M0 -380 C26 -300 52 -170 46 -80 C42 -36 26 -14 0 -12 C-26 -14 -42 -36 -46 -80 C-52 -170 -26 -300 0 -380 Z');
  P.fill(f, 'sageDk'); P.tone(f, 'hoodDot', { from: [-20, -200, 0], to: [46, -100, 0.55], bbox: [-50, -385, 50, 0] }, 5); P.line(f, lw);
  for (let yy = -330; yy < -30; yy += 34) { const w = Math.min(40, 14 + (yy + 380) * 0.11); P.line(svg(`M${-w * 0.8} ${yy + 10} C${-w * 0.3} ${yy - 4} ${w * 0.3} ${yy - 4} ${w * 0.8} ${yy + 10}`), lw * 0.6); }
  ctx.restore();
}
function scallop(cx, cy, r, n, rot) {
  const p = new Path2D();
  for (let i = 0; i <= n; i++) {
    const a = rot + (i / n) * Math.PI * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (!i) { p.moveTo(x, y); continue; }
    const am = rot + ((i - 0.5) / n) * Math.PI * 2; p.quadraticCurveTo(cx + Math.cos(am) * r * 1.22, cy + Math.sin(am) * r * 1.22, x, y);
  }
  p.closePath(); return p;
}
function rng0(seed) { let v = seed * 9301 + 49297; return () => ((v = (v * 9301 + 49297) % 233280) / 233280); }

/** The campus on the ridge: a glass office with a roof garden, a red spiral slide, bikes and a flag. Ground at (x, y). */
export function campus(P, x, y, s) {
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const lw = Math.max(1.3, 3.5 * s) / s;
  // the building: two glazed floors
  P.both(rect(-200, -170, 400, 170, 6), 'glass', lw * 1.2);
  P.tone(rect(-200, -170, 400, 170), 'mintDk', { from: [-200, -170, 0.0], to: [200, 0, 0.5], bbox: [-200, -170, 200, 0] }, 5);
  for (let gx = -170; gx < 200; gx += 34) P.line(svg(`M${gx} -170 L${gx} 0`), lw * 0.6);
  P.line(svg('M-200 -86 L200 -86'), lw);
  P.both(rect(-216, -184, 432, 16, 4), 'cream', lw);                                                   // roof slab
  for (const tx of [-150, -90, 120]) { P.both(ell(tx, -204, 20, 18), 'sage', lw * 0.8); P.line(svg(`M${tx} -186 L${tx} -194`), lw * 0.6); }   // roof garden
  P.both(rect(-30, -60, 60, 60, 3), 'tealDk', lw);                                                     // door
  // the spiral slide off the right end, roof to lawn
  const sp = new Path2D(); sp.moveTo(200, -176);
  for (let k = 0; k <= 48; k++) { const u = k / 48, a = u * Math.PI * 4.2, rr = 54; sp.lineTo(268 + Math.cos(a) * rr, -170 + u * 150 + Math.sin(a) * 16); }
  sp.lineTo(352, -2);
  P.line(sp, lw * 7); P.line(sp, lw * 4.8, 'red');
  P.line(svg('M268 -186 L268 0'), lw * 2);
  // a flag and the bikes
  P.line(svg('M-236 0 L-236 -250'), lw * 1.2);
  P.both(svg('M-236 -250 L-170 -236 L-236 -220 Z'), 'gold', lw * 0.8);
  [['red', -120], ['gold', -60], ['teal', 40], ['red', 100]].forEach(([c, bx]) => {
    P.line(ell(bx - 16, -12, 12), lw); P.line(ell(bx + 16, -12, 12), lw);
    P.line(svg(`M${bx - 16} -12 L${bx - 2} -34 L${bx + 16} -12 M${bx - 2} -34 L${bx + 10} -34 M${bx - 6} -40 L${bx + 2} -40`), lw * 1.6, c);
  });
  ctx.restore();
}

/**
 * The agent, as an AI angel: an abstract geometric mark (eight rounded rays round a ring, in the idiom
 * of AI product icons, not any one of them), a halo above, two Mucha wings, a glow.
 */
export function agentAngel(P, x, y, s, t, o = {}) {
  const ctx = P.ctx, lw = Math.max(1.5, 4 * s);
  P.tone(ell(x, y, 170 * s), 'goldLt', { from: [x, y, 0.85], to: [x + 170 * s, y, 0], radial: true, bbox: [x - 170 * s, y - 170 * s, x + 170 * s, y + 170 * s] }, Math.max(3, 6 * s));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const flap = Math.sin(t * 2.2) * 0.12;
  for (const sx of [-1, 1]) {      // wings: four feathers each
    ctx.save(); ctx.scale(sx, 1); ctx.rotate(flap);
    for (let k = 0; k < 4; k++) { ctx.save(); ctx.rotate(-0.55 + k * 0.32); P.both(svg(`M40 0 C80 -18 ${150 - k * 14} -26 ${190 - k * 22} -10 C${150 - k * 14} 8 80 14 40 0 Z`), k % 2 ? 'cream' : 'goldLt', lw / s); ctx.restore(); }
    ctx.restore();
  }
  P.both(ell(0, -118, 54, 14), 'gold', lw / s);                                                  // halo
  ctx.save(); ctx.rotate(t * 0.4);
  for (let k = 0; k < 8; k++) { ctx.save(); ctx.rotate((k / 8) * Math.PI * 2); P.both(rect(-11, -88, 22, 58, 11), k % 2 ? 'gold' : 'goldLt', lw / s); ctx.restore(); }
  ctx.restore();
  P.both(ell(0, 0, 30), 'cream', lw / s); P.both(ell(0, 0, 14), 'gold', lw / s);
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
