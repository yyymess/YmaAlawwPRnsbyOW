// Round 3: manga ink (manga.js). Same five beats, drawn with pen, screentone and focus lines.
import { W, H } from './manga.js';

const ell = (x, y, rx, ry, r = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h, r = 0) => { const p = new Path2D(); r ? p.roundRect(x, y, w, h, r) : p.rect(x, y, w, h); return p; };
const svg = (d) => new Path2D(d);
const at = (x, y, s, rot = 0) => (d) => { const q = new Path2D(); q.addPath(svg(d), new DOMMatrix().translate(x, y).rotate(rot).scale(s)); return q; };
const SANS = 'Inter, sans-serif', GROT = 'Archivo, sans-serif', MONO = '"Plex Mono", monospace';

// lyric as a manga narration box
function caption(p, s, x, y, o = {}) {
  const size = o.size ?? 30, pad = 18;
  const c = document.createElement('canvas').getContext('2d'); c.font = `600 ${size}px Archivo`; const w = c.measureText(s).width;
  const x0 = o.align === 'center' ? x - w / 2 - pad : x - pad;
  p.fill(rect(x0, y - size - 4, w + 2 * pad, size + 26), 'white');
  p.pen(rect(x0, y - size - 4, w + 2 * pad, size + 26), 3, { weight: false });
  p.text(s, o.align === 'center' ? x : x, y + 4, { font: GROT, weight: 600, size, align: o.align ?? 'left' });
}

// The hero, clean-shaven: grey hoodie (tone), hood up, round glasses, drawstrings.
function hero(p, x, y, s, o = {}) {
  const T = at(x, y, s), bb = [x - 420 * s, y - 420 * s, x + 420 * s, y + 600 * s];
  const body = T('M-330 560 C-300 360 -180 280 0 275 C180 280 300 360 330 560 Z');
  const hood = T('M-230 260 C-270 40 -200 -250 0 -265 C200 -250 270 40 230 260 C150 320 -150 320 -230 260 Z');
  const ht = o.hoodTone ?? { from: [x - 200 * s, y, 0.25], to: [x + 260 * s, y, 0.7] };
  p.fill(body, ht, { bbox: bb, cell: o.cell ?? 7 }); p.pen(body, 5 * s + 2.5);
  p.fill(hood, ht, { bbox: bb, cell: o.cell ?? 7 }); p.pen(hood, 5 * s + 2.5);
  const open = T('M0 -215 C-115 -212 -170 -110 -170 20 C-170 160 -100 245 0 250 C100 245 170 160 170 20 C170 -110 115 -212 0 -215 Z');
  p.fill(open, 'solid');
  const face = T('M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z');
  p.fill(face, 'white');
  if (!o.uplight) p.fill(face, { from: [x + 40 * s, y, 0], to: [x + 135 * s, y, o.shadow ?? 0.45] }, { bbox: bb, cell: o.cell ? o.cell - 1 : 6, knockout: false });
  if (o.uplight) p.fill(face, { from: [x, y - 150 * s, 0.6], to: [x, y + 60 * s, 0] }, { bbox: bb, cell: 5, knockout: false });   // lit from below: shadow at the top
  p.pen(face, 3.5 * s + 1.5);
  p.pen(T('M4 40 C-6 62 -10 74 6 80'), 3 * s + 1, { weight: false });                     // nose
  if (o.sing) { p.fill(ell(x, y + 122 * s, 20 * s, 24 * s), 'solid'); }
  else p.pen(T('M-26 122 C-8 128 10 128 28 120'), 4 * s + 1, { weight: false });            // mouth
  for (const sx of [-1, 1]) { p.pen(T(`M${sx * 112} -12 C${sx * 112} -58 ${sx * 22} -58 ${sx * 22} -12 C${sx * 22} 32 ${sx * 112} 32 ${sx * 112} -12 Z`), 7 * s + 1.5); }
  p.pen(T('M-22 -16 L22 -16'), 6 * s + 1.5, { weight: false });
  if (o.lenses) { p.scratch(T('M-96 -34 L-70 4 M-80 -40 L-54 -2 M40 -38 L66 0 M56 -42 L82 -4'), 4 * s + 1); }
  else { p.fill(ell(x - 67 * s, y - 12 * s, 8 * s + 1.2, 9 * s + 1.2), 'solid'); p.fill(ell(x + 67 * s, y - 12 * s, 8 * s + 1.2, 9 * s + 1.2), 'solid'); }
  for (const sx of [-1, 1]) { p.pen(T(`M${sx * 50} 272 L${sx * 62} 430`), 6 * s + 1, { white: true }); p.pen(T(`M${sx * 50} 272 L${sx * 62} 430`), 1.5, { weight: false }); p.fill(T(`M${sx * 56} 428 L${sx * 70} 428 L${sx * 70} 472 L${sx * 56} 472 Z`), 'solid'); }
}

// 1. "Think diff." — the black-and-white portrait campaign; the rainbow is six screentones
function thinkDiff(p) {
  hero(p, 560, 380, 1.15, { lenses: true, shadow: 0.55 });
  const tones = [0.08, 0.2, 0.35, 0.5, 0.68, 0.85];
  tones.forEach((t, i) => p.fill(rect(1250, 754 + i * 14, 140, 14), t, { cell: 4 }));
  p.pen(rect(1250, 754, 140, 84), 2, { weight: false });
  p.pen(svg('M1290 774 l-26 22 l26 22 M1350 774 l26 22 l-26 22 M1332 766 l-24 62'), 9, { white: true });
  p.text('Think diff.', 1420, 812, { font: SANS, weight: 300, size: 46, tracking: -0.5 });
  caption(p, 'I believed in open standards, I could recite the RFCs,', 1000, 870, { size: 24 });
}

// 2. The flat-corporate-illustration era, inked: tiny heads, long limbs, a flywheel nobody can stop
function figure(p, x, y, s, shirtTone, pantsTone, pose = 0) {
  const T = at(x, y, s), bb = [x - 220 * s, y - 420 * s, x + 260 * s, y + 380 * s];
  const pants = T(`M-60 40 C-90 160 -120 260 ${-150 - pose * 30} 330 L-80 340 C-50 260 -20 180 0 120 C20 180 50 260 ${60 + pose * 20} 340 L130 330 C100 250 80 150 60 40 Z`);
  const shirt = T('M-70 -170 C-90 -60 -80 0 -60 50 L60 50 C80 0 90 -60 70 -170 C30 -190 -30 -190 -70 -170 Z');
  p.fill(pants, pantsTone, { bbox: bb, layer: pantsTone === 'solid' ? 'ink' : 'spot' }); p.pen(pants, 4);
  p.fill(shirt, shirtTone, { bbox: bb, cell: 6 }); p.pen(shirt, 4);
  for (const d of [`M60 -150 C140 -140 ${200 + pose * 20} -230 ${240 + pose * 10} -300`, 'M-60 -150 C0 -120 120 -200 200 -270']) { p.pen(T(d), 30 * s); p.pen(T(d), 22 * s, { white: true }); }
  const head = ell(x, y - 215 * s, 34 * s, 40 * s); p.fill(head, 'white'); p.pen(head, 3.5);
  p.fill(T('M-36 -232 C-30 -272 30 -272 36 -232 C20 -246 -20 -246 -36 -232 Z'), 'solid');
}
function corporate(p) {
  p.fill(svg('M80 520 C40 300 260 160 480 220 C700 280 640 520 470 620 C300 720 120 700 80 520 Z'), { from: [300, 250, 0.35], to: [400, 650, 0.05] }, { cell: 8, layer: 'spot' });
  p.fill(svg('M1100 140 C1300 60 1520 180 1500 360 C1480 540 1240 560 1130 450 C1020 340 960 200 1100 140 Z'), { lines: 0.22, angle: 30 }, { cell: 9 });
  const ring = svg('M800 230 A250 250 0 1 1 560 480 L610 480 A200 200 0 1 0 800 280 Z');
  p.fill(ring, 'solid'); p.fill(svg('M800 195 L870 255 L800 315 Z'), 'solid');
  ['SHIP', 'GROW', 'REORG', 'ALIGN'].forEach((w, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 2 + 0.75;
    p.text(w, 800 + Math.cos(a) * 225, 492 + Math.sin(a) * 225, { font: GROT, weight: 800, size: 26, align: 'center', white: true });
  });
  figure(p, 470, 560, 0.95, 0.15, 0.55, 0);
  figure(p, 1130, 600, 0.9, { lines: 0.3, angle: 90 }, 'solid', 1);
  figure(p, 1290, 560, 0.8, 0.4, 0.55, 0.5);
  p.text('MOVE FAST AND ALIGN THINGS.', 96, 130, { font: GROT, weight: 900, size: 70, fontStretch: 'condensed', tracking: -1 });
  caption(p, 'He had more shares than the founders and a flywheel slide to show,', 96, 860, { size: 26 });
}

// 3. The product reveal, as a manga reveal: the object in a burst of focus lines
function reveal(p) {
  p.focus(800, 500, 300, 260, 11);
  const T = at(800, 500, 1, -8);
  const body = T('M-110 -170 L110 -170 L110 170 C110 195 -110 195 -110 170 Z');
  p.fill(body, 'white'); p.fill(body, 'solid', { layer: 'spot' });
  p.fill(T('M30 -170 L110 -170 L110 175 C100 186 60 190 30 192 Z'), { from: [830, 500, 0.0], to: [910, 500, 0.6] }, { cell: 5, knockout: false });
  p.pen(body, 5);
  const lid = ell(800 - 24, 500 - 168, 112, 24, -8 * Math.PI / 180); p.fill(lid, 0.3, { cell: 5 }); p.pen(lid, 4);
  p.scratch(T('M-70 -150 L-70 160 M-52 -150 L-52 150'), 6);
  p.text('SODA', 790, 520, { font: GROT, weight: 900, size: 64, align: 'center', white: true });
  p.pen(svg('M905 335 C960 330 990 360 1000 400'), 2.5, { weight: false });
  p.fill(rect(965, 400, 120, 64, 10), 'white'); p.pen(rect(965, 400, 120, 64, 10), 3);
  p.text('50¢', 1025, 446, { font: SANS, weight: 600, size: 36, align: 'center' });
  p.fill(rect(560, 70, 480, 170), 'white');
  p.text('Soda.', 800, 150, { font: SANS, weight: 600, size: 72, align: 'center', tracking: -1.5 });
  p.text('Now with pricing.', 800, 212, { font: SANS, weight: 300, size: 44, align: 'center', tracking: -0.5 });
  caption(p, 'Then one Monday at the fridge there’s a sign in Comic Sans:', 800, 860, { size: 26, align: 'center' });
}

// 4. "Accept all" — a finger, a button, impact
function acceptAll(p) {
  p.focus(560, 560, 230, 200, 7);
  const btn = rect(330, 500, 460, 120, 60);
  p.fill(btn, 'white'); p.fill(btn, 'solid', { layer: 'spot' }); p.pen(btn, 6);
  p.text('Accept all', 560, 580, { font: SANS, weight: 700, size: 52, align: 'center' });
  // the finger, from the top right
  const F = at(560, 560, 1, -38);
  const finger = F('M-40 -40 C-40 -80 40 -80 40 -40 L52 -560 L-52 -560 Z');
  p.fill(finger, 'white'); p.fill(finger, { from: [600, 300, 0.0], to: [640, 300, 0.4] }, { cell: 6, knockout: false }); p.pen(finger, 5);
  p.pen(F('M-24 -60 C-24 -100 24 -100 24 -60 L26 -40 C10 -30 -10 -30 -26 -40 Z'), 3, { weight: false });   // nail
  p.pen(F('M-40 -190 C-14 -180 14 -180 40 -190 M-44 -330 C-14 -318 14 -318 44 -330'), 3, { weight: false }); // knuckles
  p.text('KLIK!', 1150, 470, { font: GROT, weight: 900, size: 170, align: 'center', outline: 22 });
  p.text('KLIK!', 1150, 470, { font: GROT, weight: 900, size: 170, align: 'center', white: true });
  p.fill(rect(60, 60, 560, 110), 'white');
  p.text('INTRODUCING', 96, 110, { font: GROT, weight: 500, size: 30, tracking: 6 });
  p.text('ACCEPT ALL', 96, 160, { font: GROT, weight: 900, size: 54, fontStretch: 'condensed' });
  p.fill(rect(1010, 690, 470, 44), 'white'); p.text('+3,148 −2,907 across 41 files', 1030, 721, { font: MONO, size: 26 });
  caption(p, 'now I tab, tab, tab, accept all, and I never even look.', 96, 860, { size: 28 });
}

// 5. The choir at night
function choir(p) {
  p.fill(rect(0, 0, W, H), 'solid');
  const rows = [{ y: 250, s: 0.27, n: 9 }, { y: 470, s: 0.34, n: 7 }, { y: 700, s: 0.42, n: 6 }];
  for (const r of rows) for (let i = 0; i < r.n; i++) {
    const x = (W / r.n) * (i + 0.5) + (r.n === 7 ? 30 : 0);
    p.fill(at(x, r.y, r.s)('M-340 570 C-310 360 -240 300 -210 280 C-280 40 -205 -260 0 -275 C205 -260 280 40 210 280 C240 300 310 360 340 570 Z'), 'white');
    hero(p, x, r.y, r.s, { hoodTone: 0.7, shadow: 0.35, sing: true, uplight: true, cell: 5 });
    const cy = r.y + 330 * r.s;
    p.fill(ell(x, cy - 40 * r.s, 80 * r.s, 100 * r.s), { from: [x, cy - 40 * r.s, 0.95], to: [x + 80 * r.s, cy - 40 * r.s, 0.0], radial: true }, { cell: 4, layer: 'spot' });
    p.fill(rect(x - 14 * r.s, cy - 80 * r.s, 28 * r.s, 70 * r.s), 'solid');            // the cursor, a black bar in the light
    p.fill(rect(x - 24 * r.s, cy - 8 * r.s, 48 * r.s, 140 * r.s), 'solid');
  }
  p.fill(rect(0, 815, W, 85), 'solid');
  p.text('in the engineer’s paradise', 800, 872, { font: GROT, weight: 700, size: 44, align: 'center', white: true, tracking: 1 });
}

export const FRAMES3 = { thinkDiff: ['none', thinkDiff], corporate: ['purple', corporate], reveal: ['red', reveal], acceptAll: ['acid', acceptAll], choir: ['yellow', choir] };
