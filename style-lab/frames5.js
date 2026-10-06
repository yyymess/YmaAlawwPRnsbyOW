// Round 5: three test frames in the simplified Art Nouveau look (nouveau.js).
import { W, H, C } from './nouveau.js';

const svg = (d) => new Path2D(d);
const at = (x, y, s) => (d) => { const q = new Path2D(); q.addPath(svg(d), new DOMMatrix().translate(x, y).scale(s)); return q; };
const ell = (x, y, rx, ry = rx) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h, r = 0) => { const p = new Path2D(); r ? p.roundRect(x, y, w, h, r) : p.rect(x, y, w, h); return p; };
const DISPLAY = 'Federant, serif', CAPS = 'Cinzel, serif';

// The hero, nouveau: hood up, round glasses, clean-shaven, a little dark hair, drawstrings that curl like ribbons.
function hero(p, x, y, s, o = {}) {
  const T = at(x, y, s), lw = Math.max(2, 5 * s);
  p.both(T('M-330 560 C-300 360 -180 280 0 275 C180 280 300 360 330 560 Z'), o.hood ?? 'teal', lw);
  p.both(T('M-230 260 C-270 40 -200 -250 0 -265 C200 -250 270 40 230 260 C150 320 -150 320 -230 260 Z'), o.hood ?? 'teal', lw);
  p.line(T('M-150 -200 C-100 -235 100 -235 150 -200'), lw * 0.6);                          // a fold in the hood
  p.both(T('M0 -215 C-115 -212 -170 -110 -170 20 C-170 160 -100 245 0 250 C100 245 170 160 170 20 C170 -110 115 -212 0 -215 Z'), 'tealDk', lw);
  const face = T('M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z');
  p.fill(face, 'skin');
  p.fill(T('M60 -140 C120 -100 140 0 132 60 C120 140 70 190 10 199 C80 150 100 40 60 -140 Z'), 'skinSh');     // shadow side
  p.line(face, lw);
  p.fill(T('M-110 -105 C-80 -150 60 -170 110 -110 C70 -128 20 -118 -10 -96 C-40 -116 -80 -118 -110 -105 Z'), 'hair');   // fringe
  p.line(T('M-88 -62 C-70 -72 -48 -72 -30 -64 M30 -64 C48 -72 70 -72 88 -62'), lw * 0.7);                   // brows
  for (const sx of [-1, 1]) p.line(T(`M${sx * 112} -12 C${sx * 112} -56 ${sx * 22} -56 ${sx * 22} -12 C${sx * 22} 30 ${sx * 112} 30 ${sx * 112} -12 Z`), lw * 1.1);
  p.line(T('M-22 -16 L22 -16'), lw);
  p.fill(ell(x - 67 * s, y - 10 * s, 9 * s + 1), 'line'); p.fill(ell(x + 67 * s, y - 10 * s, 9 * s + 1), 'line');
  p.line(T('M6 30 C-4 62 -8 74 8 80'), lw * 0.7);
  if (o.sing) p.both(ell(x, y + 122 * s, 18 * s, 22 * s), 'tealDk', lw * 0.7); else p.line(T('M-26 122 C-8 130 10 130 28 120'), lw * 0.8);
  p.fill(ell(x - 85 * s, y + 70 * s, 22 * s, 12 * s), 'roseLt');                              // a little colour in the cheek
  // drawstrings, curling like Mucha's ribbons
  const curl = (sx) => T(`M${sx * 50} 272 C${sx * 70} 340 ${sx * 30} 380 ${sx * 70} 430 C${sx * 110} 480 ${sx * 160} 440 ${sx * 140} 400 C${sx * 125} 375 ${sx * 95} 395 ${sx * 112} 418`);
  for (const sx of [-1, 1]) { p.line(curl(sx), lw * 2.4); p.line(curl(sx), lw * 1.3, 'cream'); }
}

// 1. The portrait poster: a saint of open source under a keycap halo
function portrait(p) {
  p.fill(rect(0, 0, W, H), 'paper');
  // side panels with whiplash cables
  p.both(rect(40, 40, 330, 820, 12), 'sage', 5); p.both(rect(1230, 40, 330, 820, 12), 'sage', 5);
  p.vine([[205, 840], [80, 700], [330, 600], [200, 470], [80, 350], [320, 260], [210, 120]]);
  p.vine([[1395, 840], [1520, 700], [1270, 600], [1400, 470], [1520, 350], [1280, 260], [1390, 120]]);
  p.vine([[205, 840], [300, 760], [150, 680], [260, 560]], 4);
  p.vine([[1395, 840], [1300, 760], [1450, 680], [1340, 560]], 4);
  for (const [x, y, a] of [[118, 640, 2.6], [268, 560, -0.4], [118, 400, 2.9], [268, 300, -0.2], [150, 190, 2.4], [250, 720, -0.7]]) { p.leaf(x, y, a, 1.1); p.leaf(W - x, y, Math.PI - a, 1.1); }
  p.arch(410, 40, 780, 820, 'rose');
  p.halo(800, 400, 330);
  hero(p, 800, 430, 0.92);
  // the plaque
  p.both(rect(440, 735, 720, 110, 16), 'cream', 5);
  p.text('ENGINEER’S PARADISE', 800, 798, { font: DISPLAY, size: 58, tracking: 2 });
  p.text('MAKE THE WORLD A BETTER PLACE · ONE COMMIT AT A TIME', 800, 830, { font: CAPS, weight: 600, size: 17, tracking: 2.5 });
  p.grain(3);
}

// 2. The commercial poster (Mucha drew plenty): SODA, now fifty cents
function sodaAd(p) {
  p.fill(rect(0, 0, W, H), 'paper');
  // bubble mosaic border
  for (let x = 30; x < W; x += 34) for (const y of [24, 876]) p.both(ell(x, y, 11), 'goldLt', 2.5);
  p.both(rect(60, 60, 1480, 750, 10), 'teal', 6);
  p.both(rect(80, 80, 1440, 710, 8), 'sage', 3);
  p.halo(560, 400, 300, '° ° ° ° ° ° ° ° ° ° ° °'.split(' '));
  hero(p, 560, 420, 0.66);
  // the can, held up like a chalice
  p.both(at(560, 420, 0.66)('M180 560 C240 460 250 330 190 250 L250 236 C320 330 320 470 260 560 Z'), 'teal', 4);   // the arm
  const can = rect(668, 430, 104, 180, 12); p.both(can, 'red', 5);
  p.both(ell(720, 432, 52, 14), 'gold', 4);
  p.fill(rect(680, 448, 16, 146, 6), 'roseLt');
  p.text('SODA', 722, 540, { font: DISPLAY, size: 30, color: 'cream' });
  p.both(ell(680, 540, 30, 36), 'skin', 4);                                                                       // the hand
  // the lettering panel
  p.both(rect(940, 140, 520, 300, 18), 'cream', 5);
  p.text('SODA', 1200, 330, { font: DISPLAY, size: 190, color: 'red', stroke: 'line', strokeW: 8 });
  p.text('· REFRESHINGLY PRICED ·', 1200, 400, { font: CAPS, weight: 700, size: 26, tracking: 4 });
  p.both(rect(940, 480, 520, 250, 18), 'goldLt', 5);
  p.text('NOW', 1200, 560, { font: CAPS, weight: 700, size: 40, tracking: 8 });
  p.text('50¢', 1200, 680, { font: DISPLAY, size: 120, color: 'teal', stroke: 'line', strokeW: 6 });
  p.vine([[940, 760], [1020, 790], [1110, 735], [1200, 765], [1290, 795], [1380, 740], [1460, 770]], 4, false);
  p.text('Then one Monday at the fridge there’s a sign in Comic Sans:', 800, 852, { font: CAPS, weight: 700, size: 22, tracking: 1 });
  p.grain(5);
}

// 3. The choir as a frieze of arched windows
function choir(p) {
  p.fill(rect(0, 0, W, H), 'tealDk');
  for (let i = 0; i < 5; i++) {
    const x = 70 + i * 296, w = 260;
    const a = p.arch(x, 60, w, 640, i % 2 ? 'sage' : 'rose');
    const cx = x + w / 2;
    p.halo(cx, 290, 110, ['<', '/', '>', '{', '}', ';']);
    hero(p, cx, 330, 0.36, { sing: true });
    // cursor-candle with a glow
    const g = p; g.fill(ell(cx, 520, 46), 'goldLt'); g.both(rect(cx - 9, 480, 18, 46, 3), 'gold', 3); g.both(rect(cx - 16, 528, 32, 70, 6), 'cream', 3);
  }
  p.both(rect(60, 730, 1480, 120, 14), 'cream', 5);
  p.text('in the engineer’s paradise', 800, 810, { font: DISPLAY, size: 64, tracking: 1 });
  p.vine([[70, 790], [100, 740], [20, 700], [60, 660]], 4, false);
  p.vine([[1530, 790], [1500, 740], [1580, 700], [1540, 660]], 4, false);
  p.grain(7);
}

export const FRAMES5 = { portrait, sodaAd, choir };
