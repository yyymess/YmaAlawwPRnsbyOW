// Verse 1 — The Book of the Engineer (docs/TREATMENT.md). A frieze of six arched chapters on a long
// wall; the camera trucks one chapter per couplet, arriving on the first word. Each chapter is a small
// Mucha panel with its own animation; the couplet is lettered on the chapter's plaque.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric } from '../paint.js';
import { heroFront, heroWalk, heroPose } from '../kit/hero.js';
import { person } from '../kit/people.js';
import { crt, keyboard, modem, specBook, scroll, lectern, quill, bugDragon, orgCloud, redPen, seal, tablet, moneybag, globe, thought, commits, prayHands, moon, star, begin, end, flame } from '../kit/things.js';

const PW = 1080, PH = 640, TOP = 46, SP = 1300, RISE = 200, INSET = 100;   // panels; content is drawn in an 880x650 space inset by INSET
const CHAPTERS = [
  { n: 'I', title: 'THE CALLING', lines: ['Seventeen with a compiler', 'read the MPEG spec'], draw: calling },
  { n: 'II', title: 'THE CREED', lines: ['I believed in open standards', 'rewrite your app in Haskell'], draw: creed },
  { n: 'III', title: 'THE PILGRIMAGE', lines: ['Came out west', 'make the world a better place'], draw: pilgrimage },
  { n: 'IV', title: 'THE DRAGON', lines: ['Every bug was a riddle', 'blameless postmortem'], draw: dragon },
  { n: 'V', title: 'THE ELDERS', lines: ['Nobody had a title', 'the scariest man'], draw: elders },
  { n: 'VI', title: 'THE COVENANT', lines: ["Didn't do it for the money", 'we were gonna change the world'], draw: covenant },
];

/** the arched panel: straight sides and an elliptical top of the given rise */
function archE(x, y, w, h, rise) {
  const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + rise); p.ellipse(x + w / 2, y + rise, w / 2, rise, 0, Math.PI, 2 * Math.PI); p.lineTo(x + w, y + h); p.closePath(); return p;
}

export default function verse1(P, f) {
  const t = f.t, ctx = P.ctx;
  // resolve each chapter's lines and the times the camera arrives
  const ch = CHAPTERS.map((c) => ({ ...c, L: c.lines.map((q) => f.L.get(q)) }));
  const arrive = ch.map((c) => c.L[0].words[0].start);
  // the camera: hold on a chapter, glide to the next over the beat before its first word
  let cam = 0;
  // the glide starts as the previous line ends (never under its last word) and lands just after the first word
  const glide = (k) => { const a = Math.max(ch[k - 1].L[1].end - 0.3, arrive[k] - 0.95); return [a, Math.max(a + 0.6, arrive[k] + 0.15)]; };
  for (let k = 1; k < ch.length; k++) { const [a, b] = glide(k); if (t >= b) cam = k; else if (t > a) { cam = k - 1 + ease.inOutCubic((t - a) / (b - a)); break; } else break; }
  // a breath of push-in while a chapter holds
  const k0 = Math.round(cam), hold = t - (k0 === 0 ? f.start : glide(k0)[1]);
  const z = 1 + 0.025 * clamp(hold / 6) * (Math.abs(cam - k0) < 0.01 ? 1 : 0);
  P.paper();
  ctx.save(); ctx.translate(800, 450); ctx.scale(z, z); ctx.translate(-cam * SP, -450);
  wall(P, f, cam);
  for (let k = 0; k < ch.length; k++) {
    if (Math.abs(k - cam) * SP > 800 / z + PW / 2 + 60) continue;
    const cx = k * SP, x0 = cx - PW / 2;
    // the panel, clipped to its arch
    const arch = archE(x0, TOP, PW, PH, RISE);
    ctx.save(); P.clip(arch); ctx.translate(x0 + INSET, TOP);
    ch[k].draw(P, f, ch[k].L, t);
    ctx.restore();
    frame(P, x0, TOP, ch[k], f, k === k0 ? 1 : 0);
    plaque(P, f, cx, 778, ch[k], t);
  }
  ctx.restore();
}

// ---- the wall: a dark frieze band, pilasters between chapters, a plinth with the commit line ----------------
function wall(P, f, cam) {
  const ctx = P.ctx, x0 = (cam - 1) * SP - 1000, x1 = (cam + 1) * SP + 1000;
  P.fill(rect(x0, 0, x1 - x0, 900), 'paper');
  P.fill(rect(x0, 0, x1 - x0, 30), 'sage'); P.line(svg(`M${x0} 30 L${x1} 30`), 3); P.line(svg(`M${x0} 38 L${x1} 38`), 1.5);
  for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) P.both(ell(x, 15, 5), 'goldLt', 1.5);
  P.fill(rect(x0, 868, x1 - x0, 40), 'sage'); P.line(svg(`M${x0} 868 L${x1} 868`), 3);
  for (let k = Math.floor(cam) - 1; k <= Math.ceil(cam) + 1; k++) {
    const px = k * SP + SP / 2;
    if (k < -1 || k > 5) continue;
    // a pilaster with a gold capital and a vine of cable with a small flower
    P.both(rect(px - 34, 70, 68, 790, 4), 'ivory', 3); P.line(rect(px - 22, 120, 44, 690), 1.5);
    P.both(rect(px - 48, 56, 96, 26, 6), 'gold', 3); P.both(rect(px - 48, 836, 96, 26, 6), 'gold', 3);
    P.flower(px, 92, 0.42, 'rose', f.beat * 0.05); P.vine([[px, 820], [px - 60, 700], [px + 60, 560], [px, 450]], 4, false);
  }
}

// ---- the arch frame: gold band, keystone with the chapter's numeral ----------------------------------
function frame(P, x0, y0, c, f, live) {
  const arch = archE(x0, y0, PW, PH, RISE);
  P.line(arch, 22); P.line(arch, 15, 'gold'); P.line(archE(x0 + 13, y0 + 13, PW - 26, PH - 13, RISE - 13), 2.5);
  const kx = x0 + PW / 2, ky = y0 - 4, g = live ? f.kick : 0;
  P.both(svg(`M${kx - 44} ${ky - 18} L${kx + 44} ${ky - 18} L${kx + 30} ${ky + 44} L${kx - 30} ${ky + 44} Z`), 'goldLt', 4);
  P.text(c.n, kx, ky + 26, { font: FONT.caps, weight: 700, size: 30 });
  if (g > 0.05) { P.ctx.save(); P.alpha(g * 0.6); P.line(arch, 6, 'cream'); P.ctx.restore(); }
}

// ---- the plaque under the chapter: its title and the couplet's line, lettered as it is sung ------------
function plaque(P, f, cx, cy, c, t) {
  const [a, b] = c.L, line = t >= b.start - 0.4 ? b : a;
  const size = 38, maxW = 1060;
  const textW = Math.min(maxW, line.words.reduce((s, w) => s + P.measure(w.w, { size }) + size * 0.28, 0));
  const rows = textW >= maxW - 1 ? 2 : 1, w = Math.max(600, Math.min(maxW, textW) + 90), h = rows === 2 ? 122 : 80;
  const y = cy - h / 2 + 8;
  const shape = svg(`M${cx - w / 2 + 16} ${y} L${cx + w / 2 - 16} ${y} Q${cx + w / 2} ${y} ${cx + w / 2} ${y + 16} L${cx + w / 2} ${y + h - 16} Q${cx + w / 2} ${y + h} ${cx + w / 2 - 16} ${y + h} L${cx - w / 2 + 16} ${y + h} Q${cx - w / 2} ${y + h} ${cx - w / 2} ${y + h - 16} L${cx - w / 2} ${y + 16} Q${cx - w / 2} ${y} ${cx - w / 2 + 16} ${y} Z`);
  P.both(shape, 'cream', 4); P.line(rect(cx - w / 2 + 9, y + 9, w - 18, h - 18, 8), 1.5);
  for (const sx of [-1, 1]) P.both(ell(cx + sx * (w / 2 - 22), y + h / 2, 7), 'gold', 2);
  // the chapter's title on a small tab above
  const tw = P.measure(`${c.n} · ${c.title}`, { font: FONT.caps, size: 20, weight: 700, tracking: 3 }) + 44;
  P.both(rect(cx - tw / 2, y - 26, tw, 34, 8), 'goldLt', 3);
  P.text(`${c.n} · ${c.title}`, cx, y - 2, { font: FONT.caps, size: 20, weight: 700, tracking: 3 });
  lyric(P, line, t, cx, y + h / 2 + size * 0.36, { size, maxW, always: true, lead: 0.5 });
}

// ---- helpers ---------------------------------------------------------------------------------------
const W0 = (L, i, q) => L[i].words.find((w) => w.w.toLowerCase().startsWith(q.toLowerCase()));
const at0 = (L, i, q) => W0(L, i, q).start;
function typed(s, t0, t, cps = 22) { const n = Math.floor((t - t0) * cps); return t < t0 ? '' : s.slice(0, Math.max(0, n)); }
function blinkAt(t) { const k = (t * 0.41) % 1; return k > 0.965 ? 1 - Math.abs(k - 0.982) / 0.017 : 0; }
function bg(P, color, tone, from, to) { const r0 = rect(-INSET - 10, -10, PW + 20, 670); P.fill(r0, color); if (tone) P.tone(r0, tone, { from, to, bbox: [-INSET, 0, PW - INSET, 650] }, 7); }

// ---- I · THE CALLING: a teenager's room at night, a CRT, a modem, the spec --------------------------------
function calling(P, f, L, t) {
  const ctx = P.ctx;
  bg(P, 'tealDk', 'hoodDot', [PW, PH, 0.6], [200, 100, 0.1]);
  // the window: night, a crescent moon, stars
  const win = archE(70, 120, 220, 250, 110);
  P.fill(win, 'night');
  const r = rng(4); for (let i = 0; i < 9; i++) star(P, 90 + r() * 180, 150 + r() * 200, 5 + r() * 4, t * 3 + i);
  moon(P, 200, 200, 36);
  P.line(win, 12); P.line(win, 8, 'sepia'); P.line(svg('M180 120 L180 370 M70 250 L290 250'), 10); P.line(svg('M180 120 L180 370 M70 250 L290 250'), 6, 'sepia');
  // a shelf with books and a small yellow duck
  P.both(rect(330, 120, 300, 14, 3), 'sepiaDk', 3);
  [['rose', 22, 80], ['navy', 18, 92], ['gold', 26, 70], ['sage', 20, 86], ['plum', 24, 78]].reduce((x, [c, w, h]) => { P.both(rect(x, 120 - h, w, h, 3), c, 2.5); return x + w + 4; }, 346);
  duck(P, 560, 120, 0.5);
  // the calendar: FRI gets circled on "Friday"
  const fri = at0(L, 1, 'friday');
  P.both(rect(700, 70, 110, 120, 6), 'ivory', 3); P.fill(rect(700, 70, 110, 30, 6), 'red'); P.line(rect(700, 70, 110, 120, 6), 3);
  P.text('FRI', 755, 150, { font: FONT.caps, weight: 700, size: 34 });
  if (t > fri) { const u = clamp((t - fri) / 0.35); const c = new Path2D(); c.ellipse(755, 138, 46, 30, -0.1, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2.1); P.line(c, 4, 'red'); }
  // the desk
  P.both(rect(330, 470, 600, 22, 4), 'ochre', 3);
  P.both(rect(350, 492, 560, 200, 0), 'sepiaDk', 3);
  P.tone(rect(350, 492, 560, 200), '#000', { from: [600, 492, 0.5], to: [600, 650, 0.2], bbox: [350, 492, 880, 650] }, 6);
  P.both(rect(380, 520, 180, 60, 6), 'ochre', 3); P.both(ell(470, 550, 8), 'gold', 2);
  // the modem and its phone cable to the wall, a squiggle of handshake noise travelling along it
  const dial = at0(L, 0, 'dial-up');
  modem(P, 430, 470, 0.85, t, { active: t > dial });
  P.line(svg('M370 462 C340 470 330 520 340 600 C346 640 300 650 300 650'), 4);
  if (t > dial && t < dial + 3) for (let i = 0; i < 3; i++) { const u = ((t - dial) * 0.9 + i * 0.33) % 1; const sx = 430 + u * 140, sy = 430 - u * 60; P.ctx.save(); P.alpha(1 - u); P.line(svg(`M${sx} ${sy} q8 -10 16 0 q8 10 16 0 q8 -10 16 0`), 3, 'goldLt'); P.ctx.restore(); }
  // the CRT: the compiler, then the dial-up, then the spec
  const t0 = L[0].words[0].start, line4 = L[1].words[0].start;
  const scr = [];
  scr.push(typed('$ cc hello.c', t0 + 0.1, t));
  if (t > t0 + 0.9) scr.push(typed('$ ./a.out', t0 + 0.9, t));
  if (t > t0 + 1.5) scr.push('hello, world');
  if (t > dial) scr.push(typed('ATDT 555-0199', dial, t, 26));
  if (t > at0(L, 0, 'line')) scr.push('CONNECT 56000');
  if (t > line4 + 0.3) { scr.splice(0, scr.length, '$ open spec/', typed('14496-2.pdf', line4 + 0.4, t), t > line4 + 1.2 ? '  532 pages' : ''); }
  crt(P, 690, 470, 0.95, { lines: scr.slice(-7), on: clamp((t - (f.start + 0.05)) / 0.4), t });
  keyboard(P, 640, 488, 0.8);
  // the boy: typing, then leaning back with the spec glowing on his lap
  const rd = ease.inOutCubic(clamp((t - (line4 - 0.15)) / 0.6));
  const glow = clamp((t - line4) / 0.8) * (0.7 + 0.3 * Math.sin(t * 3));
  const fine = at0(L, 1, 'honestly');
  heroPose(P, 280, 650, 0.6, {
    seat: 250, lean: lerp(0.2, -0.12, rd),
    legs: { near: { a: 1.5, b: lerp(0.05, -0.15, rd) }, far: { a: 1.42, b: -0.1 } },
    arms: { near: { a: lerp(0.55, 0.3, rd), e: lerp(1.5, 1.05, rd) }, far: { a: lerp(0.45, 0.2, rd), e: lerp(1.45, 0.95, rd) } },
    uplit: 0.55, glow: rd > 0.5 ? 'goldLt' : 'mint', lookUp: lerp(0, -0.35, rd), mouth: t > fine ? 'smile' : f.vocal > 0.18 ? 'sing' : 'neutral', open: f.vocal, blink: blinkAt(t),
    hold: (P2, which, w) => { if (which === 'far' && rd > 0.02) { P2.ctx.save(); P2.alpha(clamp(rd * 3)); specBook(P2, w[0] + 30, w[1] - 70, 0.62, -0.45, { glow, t }); P2.ctx.restore(); } },
  });
}

/** a small rubber duck sitting at (x, y) */
export function duck(P, x, y, s, o = {}) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-60 0 C-70 -40 -40 -70 0 -64 C30 -60 50 -50 64 -30 C70 -10 60 0 40 0 Z'), 'gold', lw);
  P.both(ell(16, -86, 36, 34), 'gold', lw);
  P.both(svg(`M44 -90 C70 -96 84 -86 80 -76 C70 ${-72 + (o.talk ?? 0) * 14} 56 -74 44 -76 Z`), 'ochre', lw);
  if (o.talk) P.both(svg('M46 -78 C60 -70 72 -66 78 -72 C70 -62 56 -62 46 -70 Z'), 'ochre', lw * 0.8);
  P.fill(ell(26, -96, 6, 7), 'line');
  P.line(svg('M-30 -30 C-10 -20 10 -20 30 -30'), lw * 0.6);
  end(P);
}

// ---- II · THE CREED: the saint of open standards, RFC scrolls for ribbons, a halo that turns to Haskell -----
const CODE = '{ } < / > ; # $ & * ( ) [ ] = +'.split(' ');
const HASKELL = ['λ', '>>=', '::', '->', '=>', '<$>', '<*>', '∀', '⊥', '>>', '.', '$', 'λ', 'do', '<-', '∘'];
function creed(P, f, L, t) {
  const ctx = P.ctx;
  bg(P, 'rose', 'redDk', [440, 330, 0], [880, 650, 0.35]);
  // a Mucha mosaic ring behind
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2 + t * 0.02; P.both(ell(440 + Math.cos(a) * 330, 300 + Math.sin(a) * 300, 16), i % 2 ? 'sage' : 'goldLt', 2.5); }
  // the halo; its keycaps turn over to Haskell one by one from "Haskell"
  const hk = at0(L, 1, 'haskell');
  const glyphs = CODE.map((g, i) => (t > hk + i * 0.06 ? HASKELL[i] : g));
  P.halo(440, 290, 245, glyphs, f.beat * 0.025, 0.25 + 0.2 * f.kick);
  // RFC scrolls unfurl like ribbons on "open standards"; more appear on "RFCs"
  const os = at0(L, 0, 'open'), rf = at0(L, 0, 'rfcs');
  const u1 = ease.outCubic(clamp((t - os) / 0.8)), u2 = ease.outCubic(clamp((t - rf) / 0.6));
  scroll(P, 120, 80, 150, 330, { unroll: u1, title: 'RFC 791', lines: [0.8, 0.6, 0.9, 0.5, 0.7, 0.8, 0.4], titleSize: 22, lineH: 30 });
  scroll(P, 760, 80, 150, 330, { unroll: u1, title: 'RFC 2616', lines: [0.7, 0.9, 0.6, 0.8, 0.5, 0.9, 0.6], titleSize: 22, lineH: 30 });
  if (u2 > 0) { scroll(P, 130, 450, 130, 150, { unroll: u2, title: 'RFC 1149', lines: [0.6, 0.8], titleSize: 18, lineH: 26 }); pigeon(P, 130, 590 - 30 * (1 - u2), 0.5 * u2, t); scroll(P, 750, 450, 130, 150, { unroll: u2, title: 'RFC 9559', lines: [0.7, 0.5], titleSize: 18, lineH: 26 }); }
  const please = at0(L, 1, 'please');
  heroFront(P, 440, 330, 0.6, { mouth: f.vocal > 0.18 ? 'sing' : 'smile', open: f.vocal, look: t > please - 0.3 ? [0, -0.8] : [0, 0], brow: t > please - 0.3 ? 1 : 0, blink: blinkAt(t) });
  const ph = ease.outBack(clamp((t - (please - 0.35)) / 0.5));
  if (ph > 0) prayHands(P, 440, 690 - 110 * ph, 0.55);
}
function pigeon(P, x, y, s, t) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-50 0 C-40 -40 10 -50 40 -30 C60 -20 70 -10 80 -14 C76 0 60 10 40 12 C10 20 -30 16 -50 0 Z'), 'grey', lw);
  P.both(ell(52, -32, 18), 'grey', lw); P.fill(ell(58, -36, 3), 'line'); P.both(svg('M68 -32 L82 -28 L68 -24 Z'), 'ochre', lw * 0.8);
  P.both(svg(`M-10 -20 C-20 ${-60 - Math.sin(t * 10) * 20} 20 -70 30 -30 Z`), 'silver', lw);
  P.both(rect(-14, 4, 28, 16, 3), 'cream', lw * 0.6);
  end(P);
}

// ---- III · THE PILGRIMAGE: walking west into the sunset, a packing list, a dream, one commit per step ---------
function pilgrimage(P, f, L, t) {
  const ctx = P.ctx, t0 = L[0].words[0].start, walk = t - (t0 - 1.0);
  const scrollX = walk * 70;
  // sky and sun in the west
  bg(P, 'goldLt', 'rose', [440, 0, 0.0], [440, 430, 0.6]);
  P.halo(150, 430, 150, ['', '', '', '', '', '', '', ''], t * 0.05, 0.45);
  // the bay with a bridge, far hills
  P.both(svg('M-10 420 C120 380 240 400 360 410 C500 420 640 380 900 400 L900 520 L-10 520 Z'), 'plum', 3);
  P.fill(rect(-10, 440, PW + 20, 80), 'mint'); P.tone(rect(-10, 440, PW + 20, 80), 'mintDk', { from: [0, 440, 0.4], to: [0, 520, 0], bbox: [0, 440, PW, 520] }, 6);
  const bx = 300 + scrollX * 0.15;
  ctx.save(); ctx.translate(bx, 0);
  P.line(svg('M-160 452 L240 452'), 5, 'red'); P.both(rect(-110, 330, 16, 124, 2), 'red', 2.5); P.both(rect(150, 330, 16, 124, 2), 'red', 2.5);
  P.line(svg('M-220 452 C-160 380 -130 335 -102 332 C-40 400 100 400 158 332 C190 340 220 390 290 452'), 2.5, 'redDk');
  ctx.restore();
  // the near ground and the road
  P.both(svg('M-10 520 C200 500 500 530 900 505 L900 660 L-10 660 Z'), 'sage', 3);
  P.fill(rect(-10, 560, PW + 20, 58), 'cream'); P.line(svg('M-10 560 L900 560 M-10 618 L900 618'), 3);
  for (let i = -2; i < 14; i++) { const xx = ((i * 90 + scrollX) % 1260 + 1260) % 1260 - 180; P.line(svg(`M${xx} 589 l40 0`), 4, 'sepia'); }
  // the commit line along the road behind him: one commit per beat
  const hx = 380, beatN = Math.max(0, f.A.beatAt(t) - f.A.beatAt(t0 - 1.0));
  const pts = []; for (let i = 0; i < Math.floor(beatN) + 1; i++) { const age = beatN - i; pts.push([hx + 40 + age * 52, 600 + (i % 4 === 2 ? -22 : 0)]); }
  commits(P, pts, pts.length + (beatN % 1), { r: 9, lw: 3 });
  const hashes = ['a1f9c3e', '7d02b4a', 'e5c1d90', '3b8f2aa', 'c40e7f1', '96ad5b3', 'f00dfee', '1e2d3c4'];
  pts.slice(-3).forEach((q, i) => { if (q[0] < PW - 40) P.text(hashes[(pts.length - 3 + i + 8) % 8], q[0], q[1] + 34, { font: FONT.mono, size: 15, weight: 600, color: 'sepiaDk' }); });
  // the pilgrim, walking west (to the left), duffel and laptop
  ctx.save(); ctx.translate(hx, 0); ctx.scale(-1, 1);
  heroWalk(P, 0, 600, 0.5, walk * 5.6, { carry: 'duffel', mouth: f.vocal > 0.18 ? 'sing' : 'neutral', open: f.vocal });
  ctx.restore();
  // the packing list
  const items = [['a laptop', at0(L, 0, 'laptop')], ['a duffel bag', at0(L, 0, 'duffel')], ['a dream', at0(L, 0, 'dream')]];
  const pk = clamp((t - (t0 - 0.2)) / 0.5);
  if (pk > 0) {
    scroll(P, 700, 120, 230, 190, { unroll: ease.outCubic(pk), title: 'TO PACK', titleSize: 20 });
    items.forEach(([s, at1], i) => { if (t > at1) { const u = ease.outBack(clamp((t - at1) / 0.3)); P.text(s, 640, 210 + i * 36, { size: 24, align: 'left' }); P.ctx.save(); P.ctx.translate(618, 202 + i * 36); P.ctx.scale(u, u); P.line(svg('M-10 0 L-2 8 L12 -10'), 4, 'red'); P.ctx.restore(); } });
  }
  // the dream: a thought cloud with the world in it, and a heart on "better place"
  const dr = at0(L, 0, 'dream'), bp = at0(L, 1, 'better');
  const da = ease.outBack(clamp((t - dr) / 0.45));
  if (da > 0) {
    thought(P, 190, 150, 230 * da, 170 * da, hx - 30, 150, {});
    globe(P, 190, 152, 58 * da, t * 0.08);
    const hb = ease.outBack(clamp((t - bp) / 0.4));
    if (hb > 0) heart(P, 240, 110, 0.5 * hb * (1 + 0.1 * f.kick));
  }
}
export function heart(P, x, y, s) {
  const lw = begin(P, x, y, s);
  P.both(svg('M0 30 C-40 0 -60 -20 -50 -44 C-40 -64 -10 -62 0 -40 C10 -62 40 -64 50 -44 C60 -20 40 0 0 30 Z'), 'red', lw);
  P.line(svg('M-30 -40 C-26 -48 -20 -50 -14 -48'), lw * 0.6, 'cream');
  end(P);
}

// ---- IV · THE DRAGON: St George and the Bug; then the blameless postmortem at a lectern ---------------------
function dragon(P, f, L, t) {
  const ctx = P.ctx, pm = L[1].words[0].start - 0.12;
  if (t < pm) {
    // the war: a red sky, smoke, the riddling bug rearing, the knight lunging with a lance
    bg(P, 'ochre', 'red', [440, 650, 0.7], [440, 0, 0.1]);
    const r = rng(9); for (let i = 0; i < 6; i++) { const sx = -60 + r() * 1000, sy = 70 + r() * 230, rr = 70 + r() * 50; cloud(P, sx + Math.sin(t * 0.7 + i) * 14, sy, rr, i % 2 ? 'grey' : 'silver', i); }
    const war = at0(L, 0, 'war'), out = at0(L, 0, 'outage');
    if (t > out) { const u = clamp((t - out) / 0.5); for (let i = 0; i < 11; i++) flame(P, -60 + i * 100, 656, (110 + 50 * ((i * 5) % 3)) * u, 90, t, i, i % 2 ? ['gold', 'cream'] : ['red', 'gold']); }
    if (t > war - 0.2) { const u = ease.outBack(clamp((t - war + 0.2) / 0.4)); P.line(svg('M790 60 L790 330'), 6); P.both(svg(`M790 70 L${790 - 150 * u} ${90 + Math.sin(t * 6) * 6} L790 130 Z`), 'red', 3); if (u > 0.6) P.text('SEV 1', 742, 110, { font: FONT.caps, weight: 700, size: 22, color: 'cream' }); }
    const lunge = ease.outCubic(clamp((t - (L[0].words[0].start - 0.2)) / 0.7));
    bugDragon(P, 640, 560, 0.62, t, { mark: '?', rear: 0.3 + 0.2 * Math.sin(t * 2), color: 'ochre' });
    const rid = at0(L, 0, 'riddle');
    if (t > rid) for (let i = 0; i < 4; i++) { const u = ((t - rid) * 0.5 + i * 0.25) % 1; P.ctx.save(); P.alpha(1 - u); P.text('?', 540 + i * 70, 300 - u * 160, { size: 40 + i * 6, weight: 700, color: 'cream', stroke: 'line', strokeW: 5 }); P.ctx.restore(); }
    heroPose(P, lerp(120, 230, lunge), 650, 0.5, {
      lean: 0.3, hipY: -430, legs: { near: { a: 0.75, b: 0.05 }, far: { a: -0.55, b: -0.55 } },
      arms: { near: { a: 1.25, e: 1.6 }, far: { a: 0.95, e: 1.55 } }, hands: { near: 'fist', far: 'fist' }, mouth: 'o', open: 0.8,
      hold: (P2, which, w) => { if (which === 'far') { P2.line(svg(`M${w[0] - 300} ${w[1] + 60} L${w[0] + 640} ${w[1] - 110}`), 14); P2.line(svg(`M${w[0] - 300} ${w[1] + 60} L${w[0] + 640} ${w[1] - 110}`), 8, 'sepia'); P2.both(svg(`M${w[0] + 640} ${w[1] - 110} l-40 -22 l70 6 l-58 40 Z`), 'silver', 4); } },
    });
  } else {
    // the postmortem: a calm morning; the bug on its back with a little halo; the scroll gets written
    bg(P, 'goldLt', 'sage', [440, 650, 0.5], [440, 200, 0]);
    P.both(svg('M-10 520 C200 500 500 530 900 505 L900 660 L-10 660 Z'), 'sage', 3);
    const bl = at0(L, 1, 'blameless');
    bugDragon(P, 640, 560, 0.55, t * 0.3, { dead: 1, halo: t > bl + 0.3, color: 'ochre' });
    lectern(P, 340, 630, 0.9);
    const lt = t - pm, u = ease.outCubic(clamp(lt / 0.8));
    scroll(P, 360, 286, 230, 280, { unroll: u, title: 'POSTMORTEM', titleSize: 22, align: 'left', size: 19, lineH: 34,
      lines: [typed('What happened', pm + 0.4, t, 18), typed('Why', pm + 1.2, t, 18), typed('What we learned', pm + 1.6, t, 18), typed('Who to blame:', pm + 2.4, t, 18), typed('  (nobody)', pm + 3.0, t, 18)] });
    heroPose(P, 120, 650, 0.5, { lean: 0.1, legs: { near: { a: 0.05, b: 0.05 }, far: { a: -0.08, b: -0.08 } }, arms: { near: { a: 0.85, e: 1.55 + 0.08 * Math.sin(t * 9) }, far: { a: 0.5, e: 1.25 } }, look: [0, 0.6], hands: { near: 'fist' }, mouth: f.vocal > 0.18 ? 'sing' : 'neutral', open: f.vocal,
      hold: (P2, which, w) => { if (which === 'near') quill(P2, w[0] + 30, w[1] + 4, 0.5, 0.2); } });
  }
}

// ---- V · THE ELDERS: the org chart as clouds of empty dotted boxes; the reviewer rises like an icon ----------
function elders(P, f, L, t) {
  const ctx = P.ctx, rv = L[1].words[0].start - 0.15;
  bg(P, 'ivory', 'sage', [440, 0, 0.0], [440, 650, 0.5]);
  const rise = ease.inOutCubic(clamp((t - rv) / 1.1));
  // the clouds of org chart: dotted boxes with no titles, drifting
  const boxes = [[440, 80, 190, 76, true], [170, 150, 170, 70], [700, 150, 170, 70, true], [60, 270, 150, 64], [300, 270, 150, 64, true], [580, 270, 150, 64], [820, 270, 150, 64]];
  ctx.save(); ctx.translate(0, rise * 760); P.alpha(1 - rise * 0.6);
  P.ctx.save(); P.ctx.setLineDash([3, 14]); P.line(svg('M400 100 L230 140 M480 100 L650 140 M150 185 L80 240 M200 185 L300 240 M680 185 L590 240 M730 185 L820 240'), 3, 'sepiaDk'); P.ctx.restore();
  boxes.forEach(([bx, by, bw, bh, q], i) => orgCloud(P, bx + Math.sin(t * 0.5 + i) * 12, by + Math.cos(t * 0.4 + i * 2) * 6, bw, bh, { q }));
  // the rumor: two engineers below, one whispering behind his hand
  const rum = at0(L, 0, 'rumor'), ttl = at0(L, 0, 'title');
  person(P, 350, 500, 0.32, { hair: 'messy', top: 'hoodie', color: 'plum', glasses: 'rect', look: [0.9, 0], mouth: t > ttl ? 'o' : 'neutral', open: 0.4, crop: 700, blink: blinkAt(t + 1) });
  person(P, 560, 500, 0.32, { hair: 'side', top: 'tee', color: 'navy', look: [-0.6, 0], brow: t > rum ? 1 : 0, mouth: t > rum ? 'o' : 'neutral', open: 0.7, crop: 700, blink: blinkAt(t + 2) });
  if (t > ttl) { ctx.save(); ctx.translate(404, 520); P.both(svg('M-6 30 C-12 0 -6 -26 10 -34 C22 -38 30 -30 30 -18 C30 0 26 20 20 34 Z'), 'skin', 3); P.line(svg('M2 -14 C10 -10 18 -10 24 -14 M0 0 C10 4 18 4 26 0'), 1.5); ctx.restore(); }   // a hand cupped to whisper
  if (t > rum - 0.2) { const u = ease.outBack(clamp((t - rum + 0.2) / 0.4)); ctx.save(); ctx.translate(455, 370); ctx.scale(u, u); P.both(svg('M-170 -40 L170 -40 L170 30 L-20 30 L-60 64 L-50 30 L-170 30 Z'), 'cream', 3); P.text('psst… we have an org chart?', 0, 2, { size: 24, style: 'italic' }); ctx.restore(); }
  ctx.restore();
  // the reviewer: an icon, rising; the red pen his sceptre, the LGTM seal held back
  if (rise > 0) {
    ctx.save(); ctx.translate(0, (1 - rise) * 700);
    P.both(ell(440, 210, 300, 300), 'gold', 4);
    P.tone(ell(440, 210, 300, 300), 'goldLt', { from: [440, 210, 0.7], to: [740, 210, 0], radial: true, bbox: [140, -90, 740, 510] }, 7);
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; P.line(svg(`M${440 + Math.cos(a) * 250} ${210 + Math.sin(a) * 250} L${440 + Math.cos(a) * 290} ${210 + Math.sin(a) * 290}`), 3, 'ochre'); }
    person(P, 440, 250, 0.62, { hair: 'bald', top: 'robe', color: 'navy', mantle: 'red', stern: true, mouth: 'flat', glasses: 'rect', beard: 'grey', fw: 1.06, crop: 900, blink: blinkAt(t + 3) });
    redPen(P, 700, 380, 0.75, 0.05);
    seal(P, 200, 520, 0.9, 'LGTM', {});
    ctx.restore();
    // the small hero below, holding up his change for review; it gets its first red nit
    const nit = at0(L, 1, 'humor');
    ctx.save(); ctx.translate(0, (1 - rise) * 300);
    scroll(P, 640, 520, 120, 110, { unroll: 1, title: 'PR #1', titleSize: 16, lines: [0.7, 0.5], lineH: 22 });
    if (t > nit) { const u = clamp((t - nit) / 0.3); P.line(svg(`M590 590 L${590 + 100 * u} ${570}`), 5, 'red'); P.text('nit:', 600, 620, { size: 18, color: 'red', style: 'italic', align: 'left' }); }
    ctx.restore();
  }
}

// ---- VI · THE COVENANT: the money waved off, FREE; the mission on a tablet; the row of believers nods ------------
function covenant(P, f, L, t) {
  const ctx = P.ctx, mi = L[1].words[0].start - 0.15;
  bg(P, 'sage', 'sageDk', [440, 0, 0], [440, 650, 0.5]);
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22; P.ctx.save(); P.alpha(0.25); P.fill(svg(`M440 300 L${440 + Math.cos(a - 0.06) * 900} ${300 + Math.sin(a - 0.06) * 900} L${440 + Math.cos(a + 0.06) * 900} ${300 + Math.sin(a + 0.06) * 900} Z`), 'goldLt'); P.restore(); }
  const mo = at0(L, 0, 'money'), fr = at0(L, 0, 'free');
  if (t < mi) {
    // the money, waved off: the sack slides away and tips over; FREE unfurls on a ribbon
    const away = ease.inCubic(clamp((t - mo) / 0.9));
    moneybag(P, 440 + away * 520, 330 + away * 60, 1.0, away * 1.2);
    if (t > mo) for (let i = 0; i < 6; i++) { const u = clamp((t - mo - i * 0.12) / 0.9); if (u > 0 && u < 1) P.both(ell(470 + away * 500 + i * 14, 330 + u * 300, 16, 6), 'gold', 2.5); }
    const fu = ease.outCubic(clamp((t - fr) / 0.5));
    if (fu > 0) { const w = 520 * fu; P.banner(440 - w / 2, 470, w, 90, { tail: 'roseLt' }); if (fu > 0.9) P.text('FREE', 440, 534, { font: FONT.caps, weight: 700, size: 54, tracking: 8 }); }
    heroFront(P, 120, 420, 0.42, { mouth: t > mo ? 'smile' : 'neutral', look: [0.7, 0], blink: blinkAt(t) });
    const pu = ease.outBack(clamp((t - (mo - 0.25)) / 0.35));
    if (pu > 0) palm(P, 300, 470 - 70 * pu, 0.62 * pu, 0.25);
  } else {
    // the tablet of the mission; the believers below, each under a small halo, nod on "So did we"
    const u = ease.outCubic(clamp((t - mi) / 0.6));
    tablet(P, 440, 40 + (1 - u) * -300, 400, 300, { lines: ['THE MISSION', 'CHANGE', 'THE WORLD'], size: 36, top: 140, lineH: 56 });
    const sw = at0(L, 1, 'so', 0);
    const nod = (k) => { const s0 = L[1].words.find((w, i) => i > 8 && w.w.toLowerCase().startsWith('so'))?.start ?? 56.5; return Math.sin(clamp((t - s0 - k * 0.04) / 0.45) * Math.PI) * 26; };
    const cast = [{ hair: 'short', top: 'tee', color: 'navy' }, { hair: 'messy', top: 'hoodie', color: 'plum', glasses: 'rect' }, { hair: 'side', top: 'shirt', color: 'shirt' }, { hair: 'buzz', top: 'tee', color: 'ochre', glasses: 'round' }, { hair: 'long', top: 'tee', color: 'rose', skin: 'skin2' }];
    cast.forEach((c, i) => person(P, 120 + i * 160, 470 + nod(i) + (i % 2) * 12, 0.26, { ...c, acc: ['halo'], mouth: 'smile', crop: 900, blink: blinkAt(t + i) }));
  }
}

/** a scalloped cloud of smoke or weather, flat-bottomed */
export function cloud(P, x, y, r, color = 'silver', seed = 1) {
  const lw = begin(P, x, y, 1), rr = rng(seed + 3), p = new Path2D(), n = 7;
  p.moveTo(-r * 1.4, 0);
  for (let i = 0; i < n; i++) { const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI, k = 0.75 + rr() * 0.5; const ex = Math.cos(a1) * r * 1.4, ey = Math.sin(a1) * r * 0.8; const mx = Math.cos((a0 + a1) / 2) * r * 1.4 * (1 + 0.35 * k), my = Math.sin((a0 + a1) / 2) * r * 0.8 * (1 + 0.5 * k); p.quadraticCurveTo(mx, my, ex, ey); }
  p.closePath();
  P.fill(p, color); P.tone(p, '#000', { from: [0, -r * 0.8, 0], to: [0, 0, 0.3], bbox: [-r * 1.6, -r * 1.4, r * 1.6, 4] }, 6); P.line(p, lw * 1.1);
  P.line(svg(`M${-r * 0.7} ${-r * 0.3} C${-r * 0.4} ${-r * 0.55} ${-r * 0.1} ${-r * 0.5} 0 ${-r * 0.3}`), lw * 0.6);
  end(P);
}
/** an open hand, palm out, fingers up: "no thanks" */
export function palm(P, x, y, s, rot = 0) {
  const lw = begin(P, x, y, s, rot);
  const h = svg('M-50 60 C-58 20 -60 -10 -56 -40 L-56 -120 C-56 -134 -36 -134 -36 -120 L-34 -60 L-30 -150 C-30 -166 -8 -166 -8 -150 L-6 -64 L-2 -160 C-2 -176 20 -176 20 -160 L20 -62 L26 -140 C26 -154 46 -154 46 -140 L44 -40 C60 -60 76 -64 86 -50 C70 -20 60 10 50 60 Z');
  P.fill(h, 'skin'); P.tone(h, 'skinDot', { from: [-20, -100, 0], to: [60, 60, 0.45], bbox: [-60, -180, 90, 70] }, 4); P.line(h, lw * 1.2);
  P.line(svg('M-30 -10 C-10 0 10 0 30 -14'), lw * 0.5);
  P.both(rect(-56, 56, 112, 44, 10), 'tealLt', lw);
  end(P);
}
