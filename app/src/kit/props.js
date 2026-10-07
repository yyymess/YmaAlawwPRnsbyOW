// Props and staging helpers shared by scenes.
import { C, at, ell, rect, svg, lyric, FONT, clamp, lerp } from '../paint.js';

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
/**
 * A cherry tree in full blossom, drawn by the rules in docs/FIGURES.md (Trees). (x, y) the foot of its trunk, s its scale,
 * t the time (for the sway and the falling petals). Its space: the trunk forks at ~210 units up; one long low limb arches
 * out ~470 units to the left, the crown rises to ~480 and spreads ~240 to the right. o.part: 'tree' (default) draws the
 * tree with the petals on the ground; 'petals' draws only the petals in the air, to be laid over whatever stands in front.
 */
const SAKURA = 'M0 0 C-0.42 -0.18 -0.56 -0.72 -0.3 -1 L0 -0.84 L0.3 -1 C0.56 -0.72 0.42 -0.18 0 0 Z';   // a petal, notched at the tip
function cubicAt(c, u) { const v = 1 - u; return [0, 1].map((k) => v * v * v * c[0][k] + 3 * v * v * u * c[1][k] + 3 * v * u * u * c[2][k] + u * u * u * c[3][k]); }
function cherrySkeleton(seed) {
  const r = rng0(seed), limbs = [], tips = [], masses = [];
  const add = (c, w0, w1, depth, root = limbs.length) => { limbs.push({ c, w0, w1, depth, root }); return limbs[limbs.length - 1]; };
  const dirAt = (c, u) => { const p = cubicAt(c, Math.max(0, u - 0.01)), q = cubicAt(c, Math.min(1, u + 0.01)), d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; };
  // the trunk, leaning and turning in an S, and three limbs from its fork (at the fork 52² ≈ 32² + 30² + 27²)
  add([[0, 0], [22, -80], [-40, -150], [-16, -222]], 60, 52, 0);
  const main = [
    add([[-16, -222], [-96, -330], [-290, -372], [-480, -300]], 32, 6, 1),   // the long limb, rising and then reaching out low to the left
    add([[-16, -222], [-60, -300], [20, -410], [-30, -500]], 30, 6, 1),      // up through the middle, with a kink
    add([[-16, -222], [70, -270], [130, -360], [262, -412]], 27, 6, 1),      // out to the right, lifting at the end
  ];
  // side branches, alternating sides, leaving the limb at a slant; each takes a share of the width
  for (const L of main) {
    const len = Math.hypot(L.c[3][0] - L.c[0][0], L.c[3][1] - L.c[0][1]);
    for (let i = 0; i < 3; i++) {
      const u = 0.34 + i * 0.2 + r() * 0.05, p = cubicAt(L.c, u), [dx, dy] = dirAt(L.c, u), side = i % 2 ? 1 : -1;
      let a = Math.atan2(dy, dx) + side * (0.62 + r() * 0.3); if (Math.sin(a) > 0.25) a = Math.atan2(dy, dx) - side * (0.62 + r() * 0.3);   // never straight down
      const bl = len * (0.36 - i * 0.07) * (0.85 + r() * 0.3), w = lerp(L.w0, L.w1, u) * 0.6, e = [p[0] + Math.cos(a) * bl, p[1] + Math.sin(a) * bl - bl * 0.12];
      const B = add([p, [p[0] + Math.cos(a) * bl * 0.45, p[1] + Math.sin(a) * bl * 0.45], [e[0] - Math.cos(a + side * 0.5) * bl * 0.3, e[1] - Math.sin(a + side * 0.5) * bl * 0.3], e], w, 3, 2, L.root);
      tips.push({ p: e, a, k: 2, B });
    }
    tips.push({ p: L.c[3], a: Math.atan2(...dirAt(L.c, 1).reverse()), k: 1, L });
  }
  // twigs off every side branch, so the blossom has somewhere to gather
  for (const tp of tips.slice()) {
    if (!tp.B) continue;
    for (let k = 0; k < 2; k++) {
      const v = 0.5 + k * 0.3, q = cubicAt(tp.B.c, v), side = k ? -1 : 1, ta = tp.a + side * (0.5 + r() * 0.5) - 0.15, tl = 40 + r() * 34, te = [q[0] + Math.cos(ta) * tl, q[1] + Math.sin(ta) * tl];
      add([q, [q[0] + Math.cos(ta) * tl * 0.45, q[1] + Math.sin(ta) * tl * 0.45], [te[0] - Math.cos(ta) * tl * 0.3, te[1] - Math.sin(ta) * tl * 0.3 - 4], te], 3.4, 1.4, 3, tp.B.root);
      tips.push({ p: te, a: ta, k: 3 });
    }
  }
  // the blossom: a cloud (a puff) riding on each branch, flattened towards the horizontal like the tiers of a cherry in a
  // print; on each limb one midway (behind the wood) and one at its end (in front); on each side branch one at its end
  const puffs = [], lenOf = (L) => Math.hypot(L.c[3][0] - L.c[0][0], L.c[3][1] - L.c[0][1]);
  const flat = (a) => { let k = a; if (k > Math.PI / 2) k -= Math.PI; if (k < -Math.PI / 2) k += Math.PI; return k * 0.35; };
  const puffOn = (L, u, size, back) => { const p = cubicAt(L.c, u), [dx, dy] = dirAt(L.c, Math.min(0.99, u)), rx = size * (0.9 + r() * 0.25), ry = rx * (0.5 + r() * 0.12), rot = flat(Math.atan2(dy, dx)); puffs.push({ cx: p[0] + Math.sin(rot) * ry * 0.35, cy: p[1] - Math.cos(rot) * ry * 0.55, rx, ry, rot, back, seed: Math.floor(r() * 1e4) }); };
  for (const L of main) { const len = lenOf(L); puffOn(L, 0.6, len * 0.3, true); puffOn(L, 1, len * 0.3, false); }
  limbs.filter((L) => L.depth === 2).forEach((L, i) => puffOn(L, 1, lenOf(L) * 0.62 + 20, i % 3 === 1));
  const inPuff = (x, y, q, k = 1) => { const c = Math.cos(-q.rot), sn = Math.sin(-q.rot), dx = x - q.cx, dy = y - q.cy, ex = dx * c - dy * sn, ey = dx * sn + dy * c; return (ex / (q.rx * k)) ** 2 + (ey / (q.ry * k)) ** 2 < 1; };
  // flowers: on the upper rims of the front clouds where nothing covers them, and sprigs on the twigs that poke out
  const flowers = [], front = puffs.filter((q) => !q.back), covered = (x, y, not) => front.some((q) => q !== not && inPuff(x, y, q, 1.02));
  for (const q of front) for (let k = 0; k < 9; k++) {
    const a = -Math.PI * (0.08 + (k / 8) * 0.84), x = q.cx + Math.cos(a) * q.rx * Math.cos(q.rot) - Math.sin(a) * q.ry * Math.sin(q.rot), y = q.cy + Math.cos(a) * q.rx * Math.sin(q.rot) + Math.sin(a) * q.ry * Math.cos(q.rot);
    if (!covered(x, y, q) && r() < 0.3) flowers.push({ x, y, sz: 11 + r() * 4, rot: r() * 6 });
  }
  for (const L of limbs) {
    if (L.depth !== 3) continue;
    const e = L.c[3], d = cubicAt(L.c, 0.9), ang = Math.atan2(e[1] - d[1], e[0] - d[0]) - 0.25, len = 30 + r() * 26, tip = [e[0] + Math.cos(ang) * len, e[1] + Math.sin(ang) * len - 8];
    if (puffs.some((q) => inPuff(tip[0], tip[1], q, 1.05))) continue;
    flowers.push({ sprig: [e, [e[0] + Math.cos(ang) * len * 0.5, e[1] + Math.sin(ang) * len * 0.5 - 6], tip], x: tip[0], y: tip[1], sz: 10 + r() * 3, rot: r() * 6 });
  }
  return { limbs, puffs, flowers };
}
const CHERRY = new Map();
function sakura(P, x, y, sz, rot, o = {}) {   // a flower of five notched petals, a dark eye, stamens
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate((i / 5) * Math.PI * 2); ctx.scale(sz, sz); P.fill(svg(SAKURA), o.fill ?? 'blossom'); ctx.lineWidth = (o.lw ?? 1.6) / sz; ctx.strokeStyle = C.line; ctx.stroke(svg(SAKURA)); ctx.restore(); }
  P.fill(ell(0, 0, sz * 0.24), 'blossomDeep');
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.6; P.line(svg(`M${Math.cos(a) * sz * 0.2} ${Math.sin(a) * sz * 0.2} L${Math.cos(a) * sz * 0.42} ${Math.sin(a) * sz * 0.42}`), Math.max(0.8, sz * 0.05), 'redDk'); }
  ctx.restore();
}
/** a single cherry petal lying or falling, (x, y) its base, sz its length */
export function petal(P, x, y, sz, rot = 0, color = 'blossom') { const c = P.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(sz, sz); P.fill(svg(SAKURA), color); c.lineWidth = 1.4 / sz; c.strokeStyle = C.line; c.stroke(svg(SAKURA)); c.restore(); }
export function cherryTree(P, x, y, s, t, o = {}) {
  const ctx = P.ctx, seed = o.seed ?? 7; if (!CHERRY.has(seed)) CHERRY.set(seed, cherrySkeleton(seed));
  const { limbs, puffs, flowers } = CHERRY.get(seed), lw = Math.max(1.3, 3.5 * s) / s;
  if (o.part === 'petals') {   // petals in the air: each falls from the crown, drifting left on the breeze and tumbling
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const r = rng0(seed + 5);
    for (let i = 0; i < (o.count ?? 34); i++) {
      const x0 = -520 + r() * 800, y0 = -460 + r() * 220, sp = 70 + r() * 50, ph = r(), span = -y0 + 30, u = ((t * sp) / span + ph) % 1;
      const px = x0 - u * span * (0.55 + r() * 0.3) + Math.sin(u * 9 + i) * 26, py = y0 + u * span, spin = t * (2 + r() * 2) + i, sz = 15 + r() * 6;
      ctx.save(); ctx.translate(px, py); ctx.rotate(spin); ctx.scale(Math.cos(t * 3.1 + i) * 0.85 + 0.15 * Math.sign(Math.cos(t * 3.1 + i) || 1), 1); ctx.scale(sz, sz);
      P.fill(svg(SAKURA), i % 3 ? 'blossom' : 'cream'); ctx.lineWidth = 1.4 / sz; ctx.strokeStyle = C.line; ctx.stroke(svg(SAKURA)); ctx.restore();
    }
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // its shadow on the grass, and the petals that have fallen into it
  P.tone(ell(-110, 8, 420, 34), o.shade ?? 'sageDk', { from: [-110, 8, 0.6], to: [310, 8, 0], radial: true, bbox: [-530, -26, 310, 42] }, 6);
  { const r = rng0(seed + 9); for (let i = 0; i < 40; i++) { const gx = -520 + r() * 760, gy = -6 + r() * 30; ctx.save(); ctx.translate(gx, gy); ctx.scale(1, 0.45); ctx.rotate(r() * 6.3); ctx.scale(12, 12); P.fill(svg(SAKURA), i % 4 ? 'blossom' : 'cream'); ctx.lineWidth = 1.2 / 12; ctx.strokeStyle = C.line; ctx.stroke(svg(SAKURA)); ctx.restore(); } }
  // it sways a little from the foot
  ctx.rotate(Math.sin(t * 1.1) * 0.006 + Math.sin(t * 2.3) * 0.002);
  const flare = svg('M-62 4 C-44 -6 -36 -24 -30 -52 L30 -52 C34 -24 44 -6 66 4 Z');   // the root flare at its foot
  // a cloud of blossom: an ellipse whose edge is a run of small bumps of varying size (the heads of the flowers), flat
  // pink, toned towards its lower right, outlined
  const puff = (q) => {
    const r = rng0(q.seed), bob = Math.sin(t * 1.6 + q.cx * 0.013) * 1.8, per = Math.PI * (3 * (q.rx + q.ry) - Math.sqrt((3 * q.rx + q.ry) * (q.rx + 3 * q.ry))), n = Math.max(9, Math.round(per / 34));
    const pt = (a, k) => { const ex = Math.cos(a) * q.rx * k, ey = Math.sin(a) * q.ry * k; return [q.cx + ex * Math.cos(q.rot) - ey * Math.sin(q.rot), q.cy + bob + ex * Math.sin(q.rot) + ey * Math.cos(q.rot)]; };
    const ks = Array.from({ length: n }, () => 0.94 + r() * 0.1), path = new Path2D();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, p = pt(a, ks[i % n]);
      if (!i) { path.moveTo(...p); continue; }
      const am = ((i - 0.5) / n) * Math.PI * 2, c = pt(am, (ks[i % n] + ks[i - 1]) / 2 + 0.16 + r() * 0.06); path.quadraticCurveTo(c[0], c[1], p[0], p[1]);
    }
    const bb = [q.cx - q.rx * 1.2, q.cy - q.ry * 1.5, q.cx + q.rx * 1.2, q.cy + q.ry * 1.5];
    P.fill(path, q.back ? 'blossomDk' : 'blossom');
    P.tone(path, q.back ? 'blossomDeep' : 'blossomDk', { from: [q.cx - q.rx * 0.1, q.cy - q.ry * 0.2, q.back ? 0.1 : 0], to: [q.cx + q.rx * 0.9, q.cy + q.ry * 1.1, q.back ? 0.62 : 0.55], bbox: bb }, 5);
    P.line(path, lw);
  };
  const layer = (front) => puffs.filter((q) => q.back !== front).sort((a, b) => a.cy - b.cy).forEach(puff);
  // the blossom behind the wood
  layer(false);
  // the limbs: one silhouette, outline under fill, tapering by the curve
  const seg = (L, i, n) => { const a = cubicAt(L.c, i / n), b = cubicAt(L.c, (i + 1) / n); return [a, b, lerp(L.w0, L.w1, (i + 0.5) / n)]; };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const pass of [0, 1]) {
    if (pass) P.fill(flare, 'bark'); else P.line(flare, 2 * lw);
    for (const L of limbs) { const n = L.depth < 2 ? 18 : 10; for (let i = 0; i < n; i++) { const [a, b, w] = seg(L, i, n); P.line(svg(`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`), pass ? w : w + 2 * lw, pass ? 'bark' : 'line'); } }
  }
  // the bark: a light edge along the lit (left) side of the trunk and limbs; on the trunk the cherry's short horizontal
  // lenticels, irregular, kept to the shaded half
  { const r = rng0(seed + 21);
    for (const L of limbs) {
      if (L.depth > 1) continue;
      const edge = new Path2D(), n = 18;
      for (let i = 0; i <= n; i++) { const u = (i / n) * (L.depth ? 0.8 : 0.97) + (L.depth ? 0.04 : 0.02), p = cubicAt(L.c, u), q = cubicAt(L.c, Math.min(1, u + 0.01)), w = lerp(L.w0, L.w1, u), dx = q[0] - p[0], dy = q[1] - p[1], dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, sd = nx < 0 ? 1 : -1; const ex = p[0] + nx * sd * w * 0.32, ey = p[1] + ny * sd * w * 0.32; i ? edge.lineTo(ex, ey) : edge.moveTo(ex, ey); }
      P.line(edge, lw * 0.75, 'barkLt');
    }
    const T = limbs[0];
    for (let i = 0; i < 6; i++) { const u = 0.1 + i * 0.14 + r() * 0.05, p = cubicAt(T.c, u), w = lerp(T.w0, T.w1, u), cx = p[0] + w * (0.06 + r() * 0.14), half = w * (0.1 + r() * 0.1); P.line(svg(`M${cx - half} ${p[1]} L${cx + half} ${p[1] - 1}`), lw * 0.6, 'barkLt'); }
  }
  // the blossom in front of it, and flowers on the rim of the crown
  layer(true);
  for (const fl of flowers) {
    const dy = Math.sin(t * 1.6 + fl.x * 0.013) * 1.6;
    if (fl.sprig) { const [a, m, b] = fl.sprig; P.line(svg(`M${a[0]} ${a[1] + dy} Q${m[0]} ${m[1] + dy} ${b[0]} ${b[1] + dy}`), lw * 0.75, 'bark'); }
    sakura(P, fl.x, fl.y + dy, fl.sz, fl.rot);
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

// its canopies, left to right: [width, rise of the peak over its eave, lift of the eave]. They swell towards a
// double-height pair two thirds along (the atrium, its glass taller under a raised eave), then settle before the prow.
const CANOPIES = [[200, 46, 0], [206, 50, 0], [212, 54, 0], [216, 58, 0], [226, 66, 0], [252, 84, 22], [232, 72, 22], [186, 54, 0]];
/**
 * The campus as it is now: a megastructure lying low along the ridge, after the new headquarters of the last few years.
 * A row of tent-like canopies clad in silver solar scales, each with a glazed clerestory under its peak, over one long
 * ribbon of dark glass on a concrete plinth; a sharp prow at the end, a column under it, a nameless slab of a sign.
 * Austere where the old campus was whimsical: no slide, no bikes, no roof garden. (x, y) is the left end of its base;
 * o.n how many of its canopies; o.glow 0..1 the light in its glass at night (in raw colours, so a scene's palette dimming leaves it be).
 */
export function megacampus(P, x, y, s, o = {}) {
  const ctx = P.ctx, EAVE = -92, GB = -16, lw = Math.max(1.3, 3.5 * s) / s, g = o.glow ?? 0;
  let a = 0; const cs = CANOPIES.slice(0, o.n ?? CANOPIES.length).map(([w, rise, lift]) => { const c = { a, w, m: a + w / 2, e: EAVE - lift, pk: EAVE - lift - rise, fb: EAVE - lift + 10 }; a += w; return c; });
  const b = a, last = cs[cs.length - 1], tip = b + 80, top = Math.min(...cs.map((c) => c.pk)), fbTop = Math.min(...cs.map((c) => c.fb));
  const fbAt = (gx) => (cs.find((c) => gx < c.a + c.w) ?? last).fb;   // the roof's underside, the top of the glass, at gx
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // the roof: broad tents, gently hollowed, stepping up over the double-height pair; its underside steps with it
  const roof = new Path2D(); roof.moveTo(-40, cs[0].fb); roof.lineTo(-40, cs[0].e); roof.lineTo(0, cs[0].e);
  cs.forEach((c, i) => {
    const k = (c.e - c.pk) / 60;
    roof.quadraticCurveTo(c.a + c.w * 0.3, c.e - 24 * k, c.m, c.pk); roof.quadraticCurveTo(c.a + c.w * 0.7, c.e - 24 * k, c.a + c.w, c.e);
    if (cs[i + 1] && cs[i + 1].e !== c.e) roof.lineTo(c.a + c.w, cs[i + 1].e);
  });
  roof.lineTo(tip, last.e + 4); roof.lineTo(tip - 22, last.fb);
  for (let i = cs.length - 1; i >= 0; i--) { roof.lineTo(cs[i].a + cs[i].w, cs[i].fb); roof.lineTo(cs[i].a, cs[i].fb); }
  roof.lineTo(-40, cs[0].fb); roof.closePath();
  const clere = new Path2D(), cy = (c, gx) => c.pk + 12 + ((gx - c.m - 3) / (c.w * 0.27 - 3)) * (c.e - c.pk - 11);
  cs.forEach((c) => { clere.moveTo(c.m + 3, c.pk + 12); clere.lineTo(c.m + 3, c.e + 1); clere.lineTo(c.m + c.w * 0.27, c.e + 1); clere.closePath(); });
  const glass = new Path2D(); glass.moveTo(0, GB); glass.lineTo(0, cs[0].fb);
  cs.forEach((c, i) => { glass.lineTo(c.a + c.w, c.fb); if (cs[i + 1]) glass.lineTo(c.a + c.w, cs[i + 1].fb); });
  glass.lineTo(b + 40, last.fb); glass.lineTo(b + 40, GB); glass.closePath();
  const panes = new Path2D(); for (let gx = 0; gx < b + 40; gx += 26) { const f = fbAt(gx + 13); panes.rect(gx + 2.5, f + 3, 21, GB - f - 6); }
  const gbb = [0, fbTop, b + 40, GB];
  // the plinth and the glass ribbon, shadowed under the deep eave
  P.both(rect(-40, GB, tip + 60, -GB), '#bdb8ae', lw);
  P.fill(glass, 'navyDk'); P.tone(glass, 'denim', { from: [0, GB, 0.5], to: [600, fbTop, 0], bbox: gbb }, 5);
  for (let gx = 0; gx <= b + 40; gx += 26) P.line(svg(`M${gx} ${fbAt(Math.min(gx, b + 39))} L${gx} ${GB}`), lw * 0.5, 'char');
  ctx.save(); P.clip(glass); for (const c of cs) P.tone(rect(c.a, c.fb, c.w + (c === last ? 40 : 0), 26), '#000', { from: [0, c.fb, 0.55], to: [0, c.fb + 26, 0], bbox: [c.a, c.fb, c.a + c.w + 40, c.fb + 26] }, 5); ctx.restore();
  P.line(glass, lw);
  if (g > 0) { ctx.save(); P.alpha(g); P.fill(panes, '#e3f0ec'); ctx.restore(); }   // the light inside, cold and even: never switched off
  // the canopies: silver scales, the clerestories, the fascia's edge
  P.fill(roof, 'silver');
  ctx.save(); P.clip(roof);
  const sc = new Path2D(); for (let ry = top + 6, row = 0; ry < -72; ry += 8, row++) for (let rx = -40 + (row % 2) * 7; rx < tip; rx += 14) { sc.moveTo(rx - 7, ry); sc.arc(rx, ry, 7, Math.PI, 0, true); }
  P.line(sc, lw * 0.32, '#a9a49a');
  P.tone(roof, 'grey', { from: [0, top, 0], to: [0, -82, 0.35], bbox: [-40, top, tip, -72] }, 5);
  P.fill(clere, 'navyDk'); P.tone(clere, 'denim', { from: [0, top, 0.4], to: [0, EAVE, 0], bbox: [-40, top, tip, EAVE] }, 4);
  if (g > 0) { ctx.save(); P.alpha(g * 0.85); P.fill(clere, '#cfe4e0'); ctx.restore(); }
  for (const c of cs) for (const f of [0.34, 0.67]) { const gx = c.m + 3 + f * (c.w * 0.27 - 3); P.line(svg(`M${gx} ${cy(c, gx)} L${gx} ${c.e}`), lw * 0.4, 'char'); }
  ctx.restore();
  P.line(roof, lw * 1.2);
  const fl = new Path2D(); fl.moveTo(-40, cs[0].e + 2); for (const c of cs) { fl.lineTo(c.a, c.e + 2); fl.lineTo(c.a + c.w, c.e + 2); } fl.lineTo(tip, last.e + 5); P.line(fl, lw * 0.5);
  // the prow's column, light poles along the plinth, the slab of a sign
  P.line(svg(`M${tip - 28} ${last.fb} L${tip - 28} ${GB}`), lw * 1.6, 'char');
  for (let px = 120; px < b; px += 320) { P.line(svg(`M${px} ${GB} L${px} ${GB - 46}`), lw * 0.7); P.line(svg(`M${px - 8} ${GB - 46} L${px + 8} ${GB - 46}`), lw * 1.2); }
  P.both(rect(b - 120, -64, 24, 64), 'charDk', lw); P.line(svg(`M${b - 116} -40 L${b - 100} -40`), lw * 0.6, 'silver');
  ctx.restore();
}

/**
 * The agent, as an AI angel: an abstract geometric mark (eight rounded rays round a ring, in the idiom
 * of AI product icons, not any one of them), two Mucha wings, a glow. No halo: the mark is symbol enough.
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
