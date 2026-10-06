// Round 6: round 5's Art Nouveau, a little more Mucha (blossoms, beads, corner fans, flourishes, line
// weight), screentone only for light and shadow, and a choir holding up phones instead of candles.
import { W, H, C } from './nouveau.js';

const svg = (d) => new Path2D(d);
const at = (x, y, s) => (d) => { const q = new Path2D(); q.addPath(svg(d), new DOMMatrix().translate(x, y).scale(s)); return q; };
const ell = (x, y, rx, ry = rx) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h, r = 0) => { const p = new Path2D(); r ? p.roundRect(x, y, w, h, r) : p.rect(x, y, w, h); return p; };
const DISPLAY = 'Federant, serif', CAPS = 'Cinzel, serif';
const SKIN_DOT = '#b07e68', HOOD_DOT = '#1a2f2e';

// The hero: heavier outer contour, thinner inner lines, shadows in screentone.
// o.uplit: lit from below by a phone screen.
function hero(p, x, y, s, o = {}) {
  const T = at(x, y, s), lw = Math.max(1.6, 4 * s), lo = lw * 1.6, bb = [x - 360 * s, y - 300 * s, x + 360 * s, y + 580 * s];
  const body = T('M-330 560 C-300 360 -180 280 0 275 C180 280 300 360 330 560 Z');
  const hood = T('M-230 260 C-270 40 -200 -250 0 -265 C200 -250 270 40 230 260 C150 320 -150 320 -230 260 Z');
  p.fill(body, 'teal'); p.tone(body, HOOD_DOT, { from: [x - 120 * s, y, 0], to: [x + 330 * s, y, 0.55], bbox: bb }, Math.max(4, 7 * s)); p.line(body, lo);
  p.fill(hood, 'teal'); p.tone(hood, HOOD_DOT, { from: [x + 40 * s, y, 0], to: [x + 240 * s, y, 0.6], bbox: bb }, Math.max(4, 7 * s)); p.line(hood, lo);
  p.line(T('M-150 -200 C-100 -235 100 -235 150 -200 M150 -150 C190 -60 200 60 180 200'), lw * 0.7);   // folds
  p.both(T('M0 -215 C-115 -212 -170 -110 -170 20 C-170 160 -100 245 0 250 C100 245 170 160 170 20 C170 -110 115 -212 0 -215 Z'), 'tealDk', lw);
  const face = T('M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z');
  p.fill(face, 'skin');
  if (o.uplit) {
    p.tone(face, SKIN_DOT, { from: [x, y - 150 * s, 0.55], to: [x, y + 60 * s, 0], bbox: bb }, Math.max(3, 5 * s));
    p.tone(face, 'goldLt', { from: [x, y + 200 * s, 0.7], to: [x, y + 40 * s, 0], bbox: bb }, Math.max(3, 5 * s));
  } else p.tone(face, SKIN_DOT, { from: [x + 30 * s, y, 0], to: [x + 135 * s, y, 0.5], bbox: bb }, Math.max(3, 5 * s));
  p.line(face, lw * 1.2);
  p.fill(T('M-110 -105 C-80 -150 60 -170 110 -110 C70 -128 20 -118 -10 -96 C-40 -116 -80 -118 -110 -105 Z'), 'hair');
  p.line(T('M-88 -62 C-70 -72 -48 -72 -30 -64 M30 -64 C48 -72 70 -72 88 -62'), lw * 0.7);
  for (const sx of [-1, 1]) p.line(T(`M${sx * 112} -12 C${sx * 112} -56 ${sx * 22} -56 ${sx * 22} -12 C${sx * 22} 30 ${sx * 112} 30 ${sx * 112} -12 Z`), lw * 1.05);
  p.line(T('M-22 -16 L22 -16'), lw);
  p.fill(ell(x - 67 * s, y - 10 * s, 9 * s + 1), 'line'); p.fill(ell(x + 67 * s, y - 10 * s, 9 * s + 1), 'line');
  if (o.uplit) for (const sx of [-1, 1]) p.line(T(`M${sx * 100} 22 L${sx * 34} 16`), lw * 0.9, 'goldLt');     // the screen reflected in the lenses
  p.line(T('M6 30 C-4 62 -8 74 8 80'), lw * 0.6);
  if (o.sing) p.both(ell(x, y + 122 * s, 18 * s, 22 * s), 'tealDk', lw * 0.7); else p.line(T('M-26 122 C-8 130 10 130 28 120'), lw * 0.8);
  if (!o.uplit) p.fill(ell(x - 85 * s, y + 70 * s, 22 * s, 12 * s), 'roseLt');
  const curl = (sx) => T(`M${sx * 50} 272 C${sx * 70} 340 ${sx * 30} 380 ${sx * 70} 430 C${sx * 110} 480 ${sx * 160} 440 ${sx * 140} 400 C${sx * 125} 375 ${sx * 95} 395 ${sx * 112} 418`);
  if (!o.noStrings) for (const sx of [-1, 1]) { p.line(curl(sx), lw * 2.4); p.line(curl(sx), lw * 1.3, 'cream'); }
}

// a ribbon banner with forked tails
function banner(p, x, y, w, h, text, o = {}) {
  for (const sx of [-1, 1]) {
    const ex = x + (sx < 0 ? 0 : w), d = sx * 70;
    p.both(svg(`M${ex} ${y + 14} L${ex + d} ${y + 14} L${ex + d - sx * 26} ${y + h / 2 + 14} L${ex + d} ${y + h + 14} L${ex} ${y + h + 14} Z`), o.tail ?? 'roseLt', 4);
  }
  p.both(rect(x, y, w, h, 10), o.fill ?? 'cream', 5);
  p.line(rect(x + 10, y + 10, w - 20, h - 20, 6), 2);
  p.text(text, x + w / 2, y + h / 2 + (o.size ?? 56) * 0.36, { font: DISPLAY, size: o.size ?? 56, tracking: 2 });
}

// 1. The portrait poster
function portrait(p) {
  p.fill(rect(0, 0, W, H), 'paper');
  p.line(rect(18, 18, W - 36, H - 36, 6), 3);
  for (const [x, y, r] of [[18, 18, 0], [W - 18, 18, Math.PI / 2], [W - 18, H - 18, Math.PI], [18, H - 18, -Math.PI / 2]]) p.corner(x, y, r, 0.9);
  p.both(rect(60, 60, 310, 780, 14), 'sage', 5); p.both(rect(1230, 60, 310, 780, 14), 'sage', 5);
  p.tone(rect(60, 60, 310, 780), HOOD_DOT, { from: [215, 60, 0.0], to: [215, 840, 0.28] }, 7);
  p.tone(rect(1230, 60, 310, 780), HOOD_DOT, { from: [1385, 60, 0.0], to: [1385, 840, 0.28] }, 7);
  p.vine([[215, 820], [90, 690], [330, 600], [210, 470], [90, 350], [320, 260], [215, 130]]);
  p.vine([[1385, 820], [1510, 690], [1270, 600], [1390, 470], [1510, 350], [1280, 260], [1385, 130]]);
  for (const [x, y, a] of [[128, 640, 2.6], [270, 560, -0.4], [120, 400, 2.9], [268, 300, -0.2], [250, 720, -0.7]]) { p.leaf(x, y, a, 1.1); p.leaf(W - x, y, Math.PI - a, 1.1); }
  for (const [x, y, s] of [[300, 470, 0.9], [110, 230, 0.8], [140, 770, 0.7]]) { p.flower(x, y, s); p.flower(W - x, y, s, 'goldLt'); }
  const arch = p.arch(410, 40, 780, 820, 'rose');
  p.tone(arch, '#a8665a', { from: [800, 40, 0.0], to: [800, 860, 0.35] }, 7);
  p.beads(800, 400, 360, 44, 9);
  p.halo(800, 400, 330);
  // flourishes sweeping out from under the halo
  for (const sx of [-1, 1]) { const q = svg(`M${800 + sx * 200} 650 C${800 + sx * 330} 640 ${800 + sx * 330} 520 ${800 + sx * 250} 520 C${800 + sx * 190} 520 ${800 + sx * 200} 590 ${800 + sx * 250} 580`); p.line(q, 9); p.line(q, 4, 'gold'); }
  hero(p, 800, 430, 0.92);
  p.both(svg('M760 40 L800 8 L840 40 Z'), 'gold', 4);                                                      // keystone
  banner(p, 470, 735, 660, 104, 'ENGINEER’S PARADISE', { size: 54 });
  p.both(rect(520, 848, 560, 34, 6), 'cream', 3);
  p.text('MAKE THE WORLD A BETTER PLACE · ONE COMMIT AT A TIME', 800, 871, { font: CAPS, weight: 700, size: 17, tracking: 2.5 });
  p.grain(3);
}

// 2. The choir, holding up phones like a concert
function choir(p) {
  p.fill(rect(0, 0, W, H), 'tealDk');
  p.tone(rect(0, 0, W, H), '#132625', { from: [800, 0, 0.5], to: [800, 900, 0.0] }, 8);
  for (let i = 0; i < 5; i++) {
    const x = 70 + i * 296, w = 260, cx = x + w / 2;
    const a = p.arch(x, 60, w, 640, i % 2 ? 'sage' : 'rose');
    p.tone(a, '#24413f', { from: [cx, 60, 0.45], to: [cx, 700, 0.1] }, 6);                  // a dark chapel
    p.tone(a, 'goldLt', { from: [cx, 470, 0.9], to: [cx + 150, 470, 0], radial: true }, 6);  // the screen's light
    p.beads(cx, 270, 104, 22, 4.5);
    p.halo(cx, 270, 92, ['<', '/', '>', '{', '}', ';']);
    hero(p, cx, 320, 0.36, { sing: true, uplit: true, noStrings: true });
    // two hands holding a phone up, screen toward us
    p.both(ell(cx - 36, 488, 15, 18), 'skin', 2.5); p.both(ell(cx + 36, 488, 15, 18), 'skin', 2.5);
    p.both(rect(cx - 30, 430, 60, 104, 10), 'line', 2.5);
    p.fill(rect(cx - 24, 438, 48, 88, 6), 'cream');
    p.tone(rect(cx - 24, 438, 48, 88, 6), 'gold', { from: [cx, 438, 0.0], to: [cx, 526, 0.5] }, 4);
    p.fill(rect(cx - 7, 470, 14, 26, 2), 'line');                                             // a cursor on the screen
  }
  banner(p, 330, 748, 940, 100, 'in the engineer’s paradise', { size: 60, tail: 'sage' });
  p.grain(7);
}

// 3. The soda poster with the same ornament language
function sodaAd(p) {
  p.fill(rect(0, 0, W, H), 'paper');
  for (let x = 30; x < W; x += 34) for (const y of [24, 876]) p.both(ell(x, y, 11), 'goldLt', 2.5);
  p.both(rect(60, 60, 1480, 750, 10), 'teal', 6);
  p.both(rect(80, 80, 1440, 710, 8), 'sage', 3);
  p.tone(rect(80, 80, 1440, 710), HOOD_DOT, { from: [560, 400, 0.0], to: [1200, 400, 0.3], radial: true }, 7);
  for (const [x, y, r] of [[80, 80, 0], [1520, 80, Math.PI / 2], [1520, 790, Math.PI], [80, 790, -Math.PI / 2]]) p.corner(x, y, r, 0.8);
  p.beads(560, 400, 325, 40, 8);
  p.halo(560, 400, 300, '° ° ° ° ° ° ° ° ° ° ° °'.split(' '));
  hero(p, 560, 420, 0.66);
  p.both(at(560, 420, 0.66)('M180 560 C240 460 250 330 190 250 L250 236 C320 330 320 470 260 560 Z'), 'teal', 4);
  const can = rect(668, 430, 104, 180, 12); p.both(can, 'red', 5);
  p.tone(can, '#6e2119', { from: [700, 500, 0], to: [772, 500, 0.6] }, 5);
  p.both(ell(720, 432, 52, 14), 'gold', 4);
  p.fill(rect(680, 448, 16, 146, 6), 'roseLt');
  p.text('SODA', 722, 540, { font: DISPLAY, size: 30, color: 'cream' });
  p.both(ell(680, 540, 30, 36), 'skin', 4);
  p.both(rect(940, 140, 520, 300, 18), 'cream', 5);
  p.text('SODA', 1200, 330, { font: DISPLAY, size: 190, color: 'red', stroke: 'line', strokeW: 8 });
  p.text('· REFRESHINGLY PRICED ·', 1200, 400, { font: CAPS, weight: 700, size: 26, tracking: 4 });
  p.both(rect(940, 480, 520, 250, 18), 'goldLt', 5);
  p.text('NOW', 1200, 560, { font: CAPS, weight: 700, size: 40, tracking: 8 });
  p.text('50¢', 1200, 680, { font: DISPLAY, size: 120, color: 'teal', stroke: 'line', strokeW: 6 });
  for (const [x, y, s] of [[960, 760, 0.6], [1440, 760, 0.6]]) p.flower(x, y, s);
  p.text('Then one Monday at the fridge there’s a sign in Comic Sans:', 800, 852, { font: CAPS, weight: 700, size: 22, tracking: 1 });
  p.grain(5);
}

export const FRAMES6 = { portrait, choir, sodaAd };
