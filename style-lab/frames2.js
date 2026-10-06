// Round 2: one material (tone.js), five homages to big-tech launch-video idioms.
import { W, H } from './tone.js';

const ell = (x, y, rx, ry, r = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h, r = 0) => { const p = new Path2D(); r ? p.roundRect(x, y, w, h, r) : p.rect(x, y, w, h); return p; };
const svg = (d) => new Path2D(d);
const SANS = 'Inter, sans-serif', SERIF = 'Fraunces, serif', ROUND = 'Nunito, sans-serif', MONO = '"Plex Mono", monospace';
const SKIN = ['coral', 0.28];               // light, warm, non-specific skin: sparse coral dots on paper

// The hero: hood up, round glasses, short dark beard, hoodie drawstrings. s = scale.
function hero(p, x, y, s, o = {}) {
  const T = (d) => { const m = new DOMMatrix().translate(x, y).scale(s); const q = new Path2D(); q.addPath(svg(d), m); return q; };
  const bb = [x - 420 * s, y - 420 * s, x + 420 * s, y + 600 * s];
  const hood = o.hood ?? 'black', ht = o.hoodTone ?? 1;
  if (o.knock) p.fill(T('M-330 560 C-300 360 -230 300 -200 280 C-270 40 -200 -250 0 -265 C200 -250 270 40 200 280 C230 300 300 360 330 560 Z'), 'paper');
  p.fill(T('M-330 560 C-300 360 -180 280 0 275 C180 280 300 360 330 560 Z'), hood, ht, { bbox: bb });
  p.fill(T('M-230 260 C-270 40 -200 -250 0 -265 C200 -250 270 40 230 260 C150 320 -150 320 -230 260 Z'), hood, ht, { bbox: bb });
  // the hood's dark opening, then the face set into it
  const open = T('M0 -215 C-115 -212 -170 -110 -170 20 C-170 160 -100 245 0 250 C100 245 170 160 170 20 C170 -110 115 -212 0 -215 Z');
  p.fill(open, 'paper'); p.fill(open, 'black', 0.8, { bbox: bb, cell: 6 });
  const face = T('M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z');
  p.fill(face, 'paper');
  if (o.skin !== false) p.fill(face, SKIN[0], SKIN[1], { bbox: bb });
  p.fill(face, 'black', { from: [x + 30 * s, y, 0], to: [x + 135 * s, y, o.shadow ?? 0.5] }, { bbox: bb, cell: 6 });
  if (o.uplight) p.fill(face, o.uplight, { from: [x, y + 200 * s, 0.6], to: [x, y - 40 * s, 0] }, { bbox: bb, cell: 6 });
  // short beard along the jaw, moustache, mouth
  p.fill(T('M-128 60 C-120 160 -65 205 0 208 C65 205 120 160 128 60 C112 118 72 150 0 152 C-72 150 -112 118 -128 60 Z'), 'black', 0.62, { bbox: bb, cell: 5 });
  p.fill(T('M-46 106 C-22 92 22 92 46 106 C26 114 -26 114 -46 106 Z'), 'black', 0.8, { bbox: bb, cell: 5 });
  p.fill(ell(x, y + 132 * s, (o.sing ? 18 : 26) * s, (o.sing ? 20 : 8) * s), o.mouth ?? 'black');
  // glasses + eyes
  p.line(T('M-112 -12 C-112 -58 -22 -58 -22 -12 C-22 32 -112 32 -112 -12 Z'), 'black', 7 * s + 1.5);
  p.line(T('M22 -12 C22 -58 112 -58 112 -12 C112 32 22 32 22 -12 Z'), 'black', 7 * s + 1.5);
  p.line(T('M-22 -16 L22 -16'), 'black', 6 * s + 1.5);
  if (o.lenses) { p.fill(T('M-100 -32 L-34 -38 L-38 -2 L-102 4 Z'), o.lenses, 0.8, { bbox: bb }); p.fill(T('M34 -38 L100 -44 L98 -8 L32 -2 Z'), o.lenses, 0.8, { bbox: bb }); }
  else { p.fill(ell(x - 67 * s, y - 12 * s, 8 * s + 1, 8 * s + 1), 'black'); p.fill(ell(x + 67 * s, y - 12 * s, 8 * s + 1, 8 * s + 1), 'black'); }
  // hoodie drawstrings
  for (const sx of [-1, 1]) {
    p.fill(T(`M${sx * 46} 270 L${sx * 54} 270 L${sx * 66} 430 L${sx * 58} 430 Z`), 'paper');
    p.fill(T(`M${sx * 56} 428 L${sx * 70} 428 L${sx * 70} 470 L${sx * 56} 470 Z`), 'gray', 1);
  }
}

// A Memphis-style corporate figure: tiny head, long limbs, huge trousers.
function memphis(p, x, y, s, shirt, pants, pose = 0) {
  const T = (d) => { const m = new DOMMatrix().translate(x, y).scale(s); const q = new Path2D(); q.addPath(svg(d), m); return q; };
  const bb = [x - 200 * s, y - 400 * s, x + 200 * s, y + 400 * s];
  p.fill(T(`M-60 40 C-90 160 -120 260 ${-150 - pose * 30} 330 L-80 340 C-50 260 -20 180 0 120 C20 180 50 260 ${60 + pose * 20} 340 L130 330 C100 250 80 150 60 40 Z`), pants, 1, { bbox: bb });
  p.fill(T('M-70 -170 C-90 -60 -80 0 -60 50 L60 50 C80 0 90 -60 70 -170 C30 -190 -30 -190 -70 -170 Z'), shirt, 1, { bbox: bb });
  p.line(T(`M60 -150 C140 -140 ${200 + pose * 20} -230 ${240 + pose * 10} -300`), SKIN[0], 26 * s);
  p.line(T(`M-60 -150 C0 -120 ${120} -200 ${200} -270`), SKIN[0], 26 * s);
  p.fill(ell(x, y - 215 * s, 34 * s, 40 * s), SKIN[0], 0.55, { bbox: bb, cell: 5 });
  p.fill(T('M-36 -232 C-30 -270 30 -270 36 -232 C20 -246 -20 -246 -36 -232 Z'), 'black', 1);   // dark hair
}

// ---------------------------------------------------------------------------------------------
// 1. "Think diff." — the 1997 black-and-white portrait campaign: one face, white page, tiny rainbow mark
function thinkDiff(p) {
  hero(p, 560, 380, 1.15, { skin: false, shadow: 0.75 });
  const g = svg('M1268 772 l-30 22 l30 22 M1362 772 l30 22 l-30 22 M1330 762 l-30 70');
  ['green', 'yellow', 'orange', 'red', 'purple', 'blue'].forEach((ink, i) => p.line(g, ink, 16 - i * 2.2));
  p.text('Think diff.', 1420, 812, { font: SANS, weight: 300, size: 46, tracking: -0.5 });
  p.text('I believed in open standards, I could recite the RFCs,', 1000, 860, { font: SANS, weight: 400, size: 24, ink: 'gray' });
}

// 2. Corporate Memphis — the friendly flat-illustration era of big-tech marketing
function corporate(p) {
  p.fill(svg('M80 520 C40 300 260 160 480 220 C700 280 640 520 470 620 C300 720 120 700 80 520 Z'), 'yellow', 0.45, { cell: 9 });
  p.fill(svg('M1100 140 C1300 60 1520 180 1500 360 C1480 540 1240 560 1130 450 C1020 340 960 200 1100 140 Z'), 'pink', 0.35, { cell: 9 });
  p.fill(svg('M900 700 C1000 640 1200 660 1260 760 C1300 840 1100 880 960 860 C840 840 800 760 900 700 Z'), 'teal', 0.3, { pattern: 'lines', cell: 9, angle: -30 });
  // the flywheel
  const ring = svg('M800 230 A250 250 0 1 1 560 480 L600 480 A210 210 0 1 0 800 270 Z');
  p.fill(ring, 'blue', 1);
  p.fill(svg('M800 200 L860 250 L800 300 Z'), 'blue', 1);
  ['SHIP', 'GROW', 'REORG', 'ALIGN'].forEach((w, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 2 + 0.6, r = 300;
    p.text(w, 800 + Math.cos(a) * r, 480 + Math.sin(a) * r, { font: ROUND, weight: 800, size: 30, align: 'center', ink: 'black' });
  });
  memphis(p, 470, 560, 0.95, 'yellow', 'purple', 0);
  memphis(p, 1130, 600, 0.9, 'pink', 'blue', 1);
  memphis(p, 1290, 560, 0.8, 'teal', 'purple', 0.5);
  p.text('Move fast and align things.', 96, 130, { font: ROUND, weight: 900, size: 64, ink: 'purple' });
  p.text('He had more shares than the founders and a flywheel slide to show,', 96, 846, { font: ROUND, weight: 600, size: 26, ink: 'black' });
}

// 3. The product reveal — an object floating in a soft studio void, one line of thin type
function reveal(p) {
  p.fill(rect(0, 0, W, H), 'black', { from: [800, 470, 0.0], to: [1500, 470, 0.16], radial: true }, { cell: 7 });
  p.fill(ell(800, 760, 180, 26), 'black', { from: [800, 760, 0.75], to: [990, 760, 0.0], radial: true }, { cell: 6 });
  // the can, tilted a little
  const m = new DOMMatrix().translate(800, 500).rotate(-8);
  const T = (d) => { const q = new Path2D(); q.addPath(svg(d), m); return q; };
  const body = T('M-110 -170 L110 -170 L110 170 C110 195 -110 195 -110 170 Z');
  p.fill(body, 'paper');
  p.fill(body, 'red', 1);
  p.fill(T('M-110 -170 L110 -170 L110 170 C110 195 -110 195 -110 170 Z'), 'black', { from: [880, 500, 0.0], to: [930, 500, 0.5] }, { cell: 6 });
  p.fill(T('M-70 -170 L-40 -170 L-40 180 L-70 178 Z'), 'paper');
  p.fill(ell(800 - 24, 500 - 168, 112, 24, -8 * Math.PI / 180), 'gray', 0.6, { cell: 5 });
  p.text('SODA', 790, 520, { font: SANS, weight: 800, size: 60, align: 'center', ink: 'paper', knockout: true });
  // price tag on a string
  p.line(svg('M905 335 C960 330 990 360 1000 400'), 'black', 2.5);
  p.fill(rect(965, 400, 120, 64, 10), 'paper'); p.line(rect(965, 400, 120, 64, 10), 'black', 3);
  p.text('50¢', 1025, 446, { font: SANS, weight: 600, size: 36, align: 'center' });
  p.text('Soda.', 800, 150, { font: SANS, weight: 600, size: 72, align: 'center', tracking: -1.5 });
  p.text('Now with pricing.', 800, 212, { font: SANS, weight: 300, size: 44, align: 'center', ink: 'gray', tracking: -0.5 });
  p.fill(rect(480, 826, 640, 50, 25), 'paper');
  p.text('Then one Monday at the fridge there’s a sign in Comic Sans:', 800, 860, { font: SANS, weight: 400, size: 24, align: 'center', ink: 'black' });
}

// 4. The AI launch — warm paper, a soft gradient orb, a serif headline, one button
function aiLaunch(p) {
  p.fill(ell(1180, 470, 420, 420), 'orange', { from: [1180, 470, 0.95], to: [1600, 470, 0.0], radial: true }, { cell: 8 });
  p.fill(ell(1250, 400, 330, 330), 'pink', { from: [1250, 400, 0.6], to: [1580, 400, 0.0], radial: true }, { cell: 8 });
  p.text('Introducing', 96, 250, { font: SERIF, weight: 300, size: 70, tracking: -1 });
  p.text('Accept All', 96, 350, { font: SERIF, weight: 500, size: 110, tracking: -2.5 });
  p.text('Twenty years of experience. One button.', 100, 420, { font: MONO, weight: 400, size: 26, ink: 'gray' });
  // a dialog with the button
  p.fill(rect(100, 500, 620, 210, 22), 'paper', 1); p.line(rect(100, 500, 620, 210, 22), 'black', 3);
  p.text('+3,148 −2,907  across 41 files', 136, 560, { font: MONO, size: 24 });
  p.fill(rect(136, 600, 250, 72, 36), 'black', 1);
  p.text('Accept all', 261, 647, { font: SANS, weight: 600, size: 28, align: 'center', ink: 'paper', knockout: true });
  p.line(rect(410, 600, 170, 72, 36), 'gray', 2.5);
  p.text('Review', 495, 647, { font: SANS, weight: 500, size: 26, align: 'center', ink: 'gray' });
  p.fill(svg('M330 640 l0 54 l14 -14 l12 26 l10 -5 l-12 -25 l20 -2 Z'), 'black');
  p.text('now I tab, tab, tab, accept all, and I never even look.', 96, 846, { font: SERIF, style: 'italic', weight: 400, size: 30 });
}

// 5. The choir at night (character test in the dark)
function choir(p) {
  p.fill(rect(0, 0, W, H), 'black', 1);
  const rows = [{ y: 250, s: 0.27, n: 9 }, { y: 470, s: 0.34, n: 7 }, { y: 700, s: 0.42, n: 6 }];
  for (const r of rows) for (let i = 0; i < r.n; i++) {
    const x = (W / r.n) * (i + 0.5) + (r.n === 7 ? 30 : 0);
    hero(p, x, r.y, r.s, { knock: true, hood: 'blue', hoodTone: 0.75, shadow: 0.3, sing: true, uplight: 'yellow' });
    const cy = r.y + 330 * r.s;
    p.fill(ell(x, cy - 40 * r.s, 70 * r.s, 90 * r.s), 'paper');
    p.fill(ell(x, cy - 40 * r.s, 70 * r.s, 90 * r.s), 'yellow', { from: [x, cy - 40 * r.s, 0.95], to: [x + 70 * r.s, cy - 40 * r.s, 0.0], radial: true }, { cell: 4 });
    p.fill(rect(x - 14 * r.s, cy - 80 * r.s, 28 * r.s, 70 * r.s), 'orange', 1);           // the cursor, blinking like a flame
    p.fill(rect(x - 24 * r.s, cy - 8 * r.s, 48 * r.s, 140 * r.s), 'gray', 1);             // and the phone it sits on
  }
  p.fill(rect(0, 815, W, 85), 'black', 1);
  p.text('in the engineer’s paradise', 800, 870, { font: SERIF, style: 'italic', weight: 400, size: 46, align: 'center', ink: 'paper', knockout: true });
}

export const FRAMES2 = { thinkDiff, corporate, reveal, aiLaunch, choir };
