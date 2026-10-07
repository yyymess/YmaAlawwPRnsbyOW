// Review sheets for characters and props (app/kit.html?sheet=...).
import { heroFront, heroSide, heroBack, heroWalk, phone } from './hero.js';
import { robotaxi, agent } from './props.js';
import { rect, svg } from '../paint.js';

export function hero(P) {
  // turnaround: front, side, back, front with the phone; then the walk cycle
  heroFront(P, 230, 200, 0.36, {});
  heroSide(P, 610, 200, 0.36, {});
  heroBack(P, 990, 200, 0.36, {});
  heroFront(P, 1370, 200, 0.36, { hold: 'phone', uplit: 0.6, look: [0, 0.6], mouth: 'smile' });
  for (let i = 0; i < 8; i++) heroWalk(P, 110 + i * 190, 880, 0.4, (i / 8) * Math.PI * 2);
}

import { tree, cypress, campus, megacampus, agentAngel } from './props.js';
export function props(P) {
  robotaxi(P, 300, 330, 0.75, 0.3);
  campus(P, 860, 330, 0.85);
  tree(P, 1280, 330, 0.85, 1); tree(P, 1480, 330, 0.7, 4); cypress(P, 1560, 330, 0.7);
  agentAngel(P, 300, 640, 1, 0.5);
  P.vine([[600, 840], [560, 760], [700, 700], [640, 560]], 5);
  P.vine([[760, 840], [800, 760], [700, 690], [780, 560]], 5);
  heroFront(P, 1150, 600, 0.42, { hold: 'phone', uplit: 0.6, look: [0, 0.6] });
}

// the campus at dawn and what it grew into by dusk (its glass lit below)
export function campuses(P) {
  campus(P, 330, 420, 0.9);
  megacampus(P, 700, 380, 0.5, { n: 7 });
  megacampus(P, 700, 760, 0.5, { n: 7, glow: 1 });
}

// close-ups for checking the side view and the grip
export function closeup(P) {
  heroSide(P, 330, 330, 0.8, {});
  heroFront(P, 1130, 330, 0.8, { hold: 'phone', uplit: 0.6, look: [0, 0.6], mouth: 'smile' });
}

import { person } from './people.js';
import { platter } from './things.js';
// the supporting cast
export function cast(P) {
  person(P, 200, 230, 0.34, { hair: 'slick', top: 'vest', color: 'char', mouth: 'smirk', acc: ['lanyard'] });
  platter(P, 520, 200, 165);
  person(P, 520, 230, 0.34, { hair: 'unix', hairColor: 'hairSp', beard: 'unix', top: 'robe', color: 'navy', mantle: 'red', stern: true, glasses: 'rect', fw: 1.06 });
  person(P, 840, 230, 0.34, { hair: 'messy', top: 'hoodie', color: 'plum', mouth: 'smile', glasses: 'rect', fw: 0.94, hairColor: 'hairBr' });
  person(P, 1160, 230, 0.34, { hair: 'side', top: 'tee', color: 'navy', print: 'I ♥|ENGINEERS', acc: ['camera', 'sunhat'], hairColor: 'hairBl', flush: 1 });
  person(P, 1460, 230, 0.34, { hair: 'wavy', top: 'gown', color: 'black', acc: ['mortar'], skin: 'skin2', hairColor: 'hairAu', fem: true, mouth: 'smile' });
  person(P, 200, 640, 0.34, { hair: 'bob', top: 'shirt', color: 'shirt', glasses: 'round', acc: ['halo'], skin: 'skin4', fem: true, mouth: 'smile' });
  person(P, 520, 640, 0.34, { hair: 'buzz', top: 'turtleneck', color: 'black', mouth: 'neutral', skin: 'skin5' });
  person(P, 840, 640, 0.34, { hair: 'ponytail', top: 'hoodie', color: 'navy', arms: 'phone', uplit: 0.6, look: [0, 0.6], fem: true, hairColor: 'hairBr' });
  person(P, 1160, 640, 0.34, { hair: 'bun', top: 'hawaiian', color: 'rose', skin: 'skin2', acc: ['camera'], mouth: 'o', seed: 3, fem: true, hairColor: 'hairAu' });
  person(P, 1460, 640, 0.34, { hair: 'side', top: 'tee', color: 'ochre', acc: ['headphones', 'lanyard'], lanyardColor: 'teal', mouth: 'grin', skin: 'skin3' });
}

// faces: the reviewer close, and a grid of heads in every hair style, hair colour and skin
export function faces(P) {
  platter(P, 330, 300, 300);
  person(P, 330, 340, 0.62, { hair: 'unix', hairColor: 'hairSp', beard: 'unix', top: 'robe', color: 'navy', mantle: 'red', stern: true, glasses: 'rect', fw: 1.06, crop: 900, still: true });
  const heads = [
    { hair: 'bob', skin: 'skin4', fem: true, mouth: 'smile' }, { hair: 'ponytail', hairColor: 'hairBr', fem: true, glasses: 'round' },
    { hair: 'wavy', hairColor: 'hairBl', skin: 'skin2', fem: true, mouth: 'sing', open: 0.5 }, { hair: 'wavy', hairColor: 'hairAu', skin: 'skin3', fem: true },
    { hair: 'bob', hairColor: 'hairBl', skin: 'skin2', fem: true, glasses: 'rect', mouth: 'smirk' }, { hair: 'short', hairColor: 'hairBr', skin: 'skin5' },
    { hair: 'messy', hairColor: 'hairAu' }, { hair: 'side', hairColor: 'hairBl', skin: 'skin2', flush: 1, mouth: 'o' },
    { hair: 'ponytail', skin: 'skin5', fem: true, mouth: 'smile' }, { hair: 'slick', hairColor: 'hairGr', glasses: 'rect' },
  ];
  heads.forEach((h, i) => person(P, 760 + (i % 5) * 190, 230 + Math.floor(i / 5) * 420, 0.3, { top: ['tee', 'shirt', 'hoodie', 'turtleneck', 'vest'][i % 5], color: ['navy', 'roseLt', 'plum', 'char', 'sage'][i % 5], still: true, ...h }));
}

import { heroPose } from './hero.js';
// poses: sitting typing, sitting reading, lunging with a lance, writing at a lectern
export function poses(P) {
  heroPose(P, 220, 820, 0.62, { seat: 250, lean: 0.18, legs: { near: { a: 1.5, b: 0.05 }, far: { a: 1.42, b: -0.1 } }, arms: { near: { a: 0.55, e: 1.5 }, far: { a: 0.45, e: 1.45 } }, uplit: 0.5 });
  heroPose(P, 640, 820, 0.62, { seat: 250, lean: -0.08, legs: { near: { a: 1.25, b: 0.05 }, far: { a: 1.15, b: -0.05 } }, arms: { near: { a: 0.35, e: 1.2 }, far: { a: 0.25, e: 1.1 } }, lookUp: -0.3, mouth: 'smile' });
  heroPose(P, 1030, 820, 0.62, { lean: 0.28, hipY: -430, legs: { near: { a: 0.75, b: 0.05 }, far: { a: -0.55, b: -0.55 } }, arms: { near: { a: 1.25, e: 1.55 }, far: { a: 0.9, e: 1.5 } }, hands: { near: 'fist', far: 'fist' },
    hold: (P, which, w, ang) => { if (which === 'far') P.line(svg(`M${w[0] - 260} ${w[1] + 70} L${w[0] + 420} ${w[1] - 80}`), 9); } });
  heroPose(P, 1420, 820, 0.62, { lean: 0.12, legs: { near: { a: 0.05, b: 0.05 }, far: { a: -0.08, b: -0.08 } }, arms: { near: { a: 0.75, e: 1.35 }, far: { a: 0.45, e: 1.2 } }, look: [0, 0.6], hands: { near: 'fist' } });
}

// ---- halo proposals (for review): the hero's second halo, four ways, across his story -------------------------------
import { C, ell, FONT } from '../paint.js';
const GREYED = { gold: '#a29e95', goldLt: '#c9c5bc', cream: '#e0dcd3', ochre: '#8f8b83' };
const recolor = (map, fn) => { const saved = {}; for (const k in map) { saved[k] = C[k]; C[k] = map[k]; } try { fn(); } finally { Object.assign(C, saved); } };
const CODE = '{ } < / > ; # $ & * ( ) [ ] = +'.split(' ');
// the nimbus behind the head, as P.halo draws it, but each keycap optional (keep(i)), with its own glyph size
function nimbus(P, x, y, R, o = {}) {
  const ctx = P.ctx, glyphs = o.glyphs ?? CODE, keep = o.keep ?? (() => true);
  recolor(o.grey ? GREYED : {}, () => {
    P.tone(ell(x, y, R * 1.35), 'goldLt', { from: [x, y, o.grey ? 0.15 : 0.45], to: [x + R * 1.35, y, 0], radial: true, bbox: [x - R * 1.4, y - R * 1.4, x + R * 1.4, y + R * 1.4] }, 4);
    P.both(ell(x, y, R), 'gold', Math.max(2, R / 50));
    ctx.save(); ctx.clip(ell(x, y, R * 0.97)); ctx.strokeStyle = C.goldLt; ctx.lineWidth = Math.max(1, R / 110); ctx.beginPath();
    for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; ctx.moveTo(x + Math.cos(a) * R * 0.55, y + Math.sin(a) * R * 0.55); ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); } ctx.stroke(); ctx.restore();
    P.line(ell(x, y, R * 0.86), Math.max(1.2, R / 100)); P.line(ell(x, y, R * 0.72), Math.max(1.2, R / 100));
    glyphs.forEach((g, i) => {
      if (!keep(i)) return;
      const a = -Math.PI / 2 + (i / glyphs.length) * Math.PI * 2, kx = x + Math.cos(a) * R * 0.79, ky = y + Math.sin(a) * R * 0.79;
      P.both(rect(kx - R * 0.06, ky - R * 0.06, R * 0.12, R * 0.12, R * 0.02), 'cream', Math.max(1, R / 120));
      P.text(g, kx, ky + R * 0.03, { font: FONT.mono, size: R * (o.size ?? 0.075), weight: 700 });
    });
  });
}
// a keycap tumbling down from a nimbus
function fallingKey(P, x, y, R, g, rot) { P.ctx.save(); P.ctx.translate(x, y); P.ctx.rotate(rot); P.both(rect(-R * 0.06, -R * 0.06, R * 0.12, R * 0.12, R * 0.02), '#e0dcd3', Math.max(1, R / 120)); P.text(g, 0, R * 0.03, { font: FONT.mono, size: R * 0.075, weight: 700 }); P.ctx.restore(); }
// a ring lying flat above the head, seen a little from below; o.keys: keycaps round its rim; o.dot: a status dot on its front
function flatRing(P, x, y, R, o = {}) {
  const ctx = P.ctx, k = 0.26, lw = Math.max(1.5, R / 40);
  recolor(o.grey ? GREYED : {}, () => {
    if (!o.grey) P.tone(ell(x, y, R * 1.3, R * 0.6), 'goldLt', { from: [x, y, 0.5], to: [x + R * 1.3, y, 0], radial: true, bbox: [x - R * 1.3, y - R * 0.6, x + R * 1.3, y + R * 0.6] }, 4);
    const band = new Path2D(); band.ellipse(x, y, R, R * k, 0, 0, Math.PI * 2); band.ellipse(x, y, R * 0.78, R * k * 0.72, 0, 0, Math.PI * 2);
    ctx.fillStyle = C[o.color ?? 'gold']; ctx.fill(band, 'evenodd'); P.line(band, lw);
    P.line(ell(x, y, R * 0.89, R * k * 0.86), lw * 0.4, 'goldLt');
    if (o.keys) {
      const n = o.keys.length, at = o.keys.map((g, i) => [g, (i / n) * Math.PI * 2]).sort((p, q) => Math.sin(p[1]) - Math.sin(q[1]));
      for (const [g, a] of at) { if (!g) continue; const kx = x + Math.cos(a) * R * 0.89, ky = y + Math.sin(a) * R * k * 0.86, w = R * 0.13, h = w * 0.62; ctx.save(); P.both(rect(kx - w / 2, ky - h * 0.75, w, h, w * 0.18), Math.sin(a) < 0 ? 'goldLt' : 'cream', Math.max(1, R / 110)); P.text(g, kx, ky - h * 0.75 + h * 0.78, { font: FONT.mono, size: h * 0.82, weight: 700 }); ctx.restore(); }
    }
  });
  if (o.dot) { P.both(ell(x + R * 0.52, y + R * k * 0.82, R * 0.1), o.dot, lw * 0.8); P.line(ell(x + R * 0.52, y + R * k * 0.82, R * 0.1 + lw), lw * 0.7, 'cream'); }
}
// a cheap costume halo of gold tinsel on a coil spring, sprung from the top of the head (x, y); droop 0..1 bends it over
function swagHalo(P, x, y, R, o = {}) {
  const ctx = P.ctx, droop = o.droop ?? 0, lw = Math.max(1.5, R / 40), L = R * 0.62, bend = droop * 1.9;
  recolor(o.grey ? GREYED : {}, () => {
    const sp = new Path2D(); let px = x, py = y; sp.moveTo(px, py);
    for (let i = 1; i <= 48; i++) { const u = i / 48, th = bend * u * u, cx = x + Math.sin(th) * L * u, cy = y - Math.cos(th) * L * u, coil = Math.sin(u * Math.PI * 14) * R * 0.07; sp.lineTo(cx + Math.cos(th) * coil, cy + Math.sin(th) * coil); px = cx; py = cy; }
    P.line(sp, lw * 1.7); P.line(sp, lw * 0.8, 'silver');
    ctx.save(); ctx.translate(px, py); ctx.rotate(bend * 0.85);
    const rx = R * 0.56, ry = rx * 0.3;
    const fr = new Path2D(); for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, j = i % 3 === 0 ? 1.28 : i % 3 === 1 ? 1.16 : 1.22; fr.moveTo(Math.cos(a) * rx * 0.86, Math.sin(a) * ry * 0.7 - ry); fr.lineTo(Math.cos(a) * rx * j, Math.sin(a) * ry * (j + 0.35) - ry); }
    P.line(fr, lw * 0.9, 'goldLt');
    const ring = new Path2D(); ring.ellipse(0, -ry, rx, ry, 0, 0, Math.PI * 2); P.line(ring, lw * 3.6); P.line(ring, lw * 2.3, 'gold');
    ctx.restore();
  });
}
// a nimbus with a green band round its lower left, lettered #OPENTOWORK (the badge of the profile picture after a layoff)
function openToWork(P, x, y, R) {
  nimbus(P, x, y, R, { glyphs: CODE.map(() => '') });
  const ctx = P.ctx, a0 = Math.PI * 0.98, a1 = Math.PI * 1.72, rIn = R * 0.74, rOut = R * 1.08;   // round the upper left, clear of his shoulders
  const band = new Path2D(); band.arc(x, y, rOut, a0, a1); band.arc(x, y, rIn, a1, a0, true); band.closePath();
  P.fill(band, '#3f7d4e'); P.line(band, Math.max(1.5, R / 50));
  const text = '#OPENTOWORK', rm = (rIn + rOut) / 2 - R * 0.04, step = (a1 - a0 - 0.16) / (text.length - 1);
  for (let i = 0; i < text.length; i++) { const a = a0 + 0.08 + i * step; ctx.save(); ctx.translate(x + Math.cos(a) * rm, y + Math.sin(a) * rm); ctx.rotate(a + Math.PI / 2); P.text(text[i], 0, R * 0.055, { font: FONT.caps, size: R * 0.16, weight: 700, color: 'cream' }); ctx.restore(); }
}
function lanyard(P, x, y, s, red) {
  const d = `M${x - 60 * s} ${y + 268 * s} C${x - 54 * s} ${y + 380 * s} ${x - 24 * s} ${y + 470 * s} ${x - 8 * s} ${y + 520 * s} M${x + 60 * s} ${y + 268 * s} C${x + 54 * s} ${y + 380 * s} ${x + 24 * s} ${y + 470 * s} ${x + 8 * s} ${y + 520 * s}`;
  P.line(svg(d), Math.max(3, 14 * s)); P.line(svg(d), Math.max(2, 8 * s), 'red');
  P.both(rect(x - 50 * s, y + 512 * s, 100 * s, 130 * s, 10 * s), 'cream', 2); P.both(rect(x - 30 * s, y + 534 * s, 60 * s, 50 * s, 6 * s), 'glass', 1.5); P.both(ell(x + 30 * s, y + 610 * s, 9 * s), red ? 'red' : 'sage', 1.5);
}
const COLS = ['PARADISE', 'MONDAY: HE JOINS', 'FRIDAY: BADGE RED', 'AFTER'];
const PROPOSALS = {
  A: ['ONE HALO ONLY', ['the nimbus of his craft', 'he keeps it at work', 'it greys; keycaps fall', 'reissued: every key TAB']],
  B: ['THE NIMBUS, WORN ABOVE', ['the nimbus of his craft', 'it tilts up into a ring', 'greys, slips, keys fall', 'a plain ring, no keys']],
  C: ['THE SWAG HALO', ['the nimbus of his craft', 'onboarding swag, on a spring', 'the spring droops', 'everyone gets one']],
  D: ['THE STATUS RING', ['the nimbus of his craft', 'a ring with a green dot', 'the dot greys: deactivated', 'laid off: #OPENTOWORK']],
};
function proposal(P, k, top) {
  const S = 0.33, [name, caps] = PROPOSALS[k];
  P.line(svg(`M20 ${top} L1580 ${top}`), 1.5, 'sepiaDk');
  P.text(k, 100, top + 190, { font: FONT.caps, size: 96, weight: 700, color: 'redDk' });
  name.split(', ').forEach((ln, i) => P.text(ln, 100, top + 236 + i * 22, { font: FONT.caps, size: 16, weight: 700 }));
  for (let c = 0; c < 4; c++) {
    const cx = 390 + c * 340, cy = top + 222, ctx = P.ctx, R = 330 * S, head = [cx, cy - 4 * S], above = [cx, cy - 392 * S];
    ctx.save(); P.clip(rect(cx - 165, top + 3, 330, 409));
    const face = { still: true, mouth: c === 0 ? 'smile' : c === 2 ? 'frown' : c === 3 && k === 'D' ? 'flat' : 'smile', look: c === 2 ? [0.8, 0.3] : [0, 0], brow: c === 2 ? 1 : 0, blink: c === 3 && k !== 'D' ? 1 : 0 };
    if (c === 0) nimbus(P, ...head, R);
    if (k === 'A' && c === 1) nimbus(P, ...head, R);
    if (k === 'A' && c === 2) nimbus(P, ...head, R, { grey: true, keep: (i) => i % 3 !== 1 });
    if (k === 'A' && c === 3) nimbus(P, ...head, R, { glyphs: CODE.map(() => 'TAB'), size: 0.045 });
    if (k === 'D' && c === 3) openToWork(P, ...head, R);
    if (k === 'C' && c === 3) for (const dx of [-118, 118]) { person(P, cx + dx, cy + 40, 0.24, { hair: dx < 0 ? 'bob' : 'messy', fem: dx < 0, skin: dx < 0 ? 'skin4' : 'skin', hairColor: dx < 0 ? 'hair' : 'hairBr', top: 'tee', color: dx < 0 ? 'plum' : 'navy', mouth: 'smile', blink: 1, still: true }); swagHalo(P, cx + dx, cy + 40 - 250 * 0.24, 330 * 0.24); }
    heroFront(P, cx, cy, S, face);
    if (c === 1 || c === 2) lanyard(P, cx, cy, S, c === 2);
    if (k === 'A' && c === 2) [[cx - 78, cy + 30, '<', 0.6], [cx + 84, cy + 74, '#', -0.4], [cx - 52, cy + 118, '=', 1.2], [cx + 40, cy + 150, ')', 0.3]].forEach(([fx, fy, g, rot]) => fallingKey(P, fx, fy, R, g, rot));
    if (k === 'B' && c === 1) flatRing(P, ...above, R * 0.95, { keys: CODE.slice(0, 12) });
    if (k === 'B' && c === 2) { ctx.save(); ctx.translate(above[0] + 10, above[1] + 18); ctx.rotate(0.12); flatRing(P, 0, 0, R * 0.95, { keys: CODE.slice(0, 12).map((g, i) => (i % 3 ? g : '')), grey: true }); ctx.restore(); fallingKey(P, cx + 92, cy + 20, R, ';', 0.5); fallingKey(P, cx - 96, cy + 96, R, '{', -0.7); }
    if (k === 'B' && c === 3) flatRing(P, ...above, R * 0.95, { color: 'silver' });
    if (k === 'C' && c === 1) swagHalo(P, cx, cy - 290 * S, R);
    if (k === 'C' && c === 2) swagHalo(P, cx, cy - 290 * S, R, { droop: 1, grey: true });
    if (k === 'C' && c === 3) swagHalo(P, cx, cy - 290 * S, R);
    if (k === 'D' && c === 1) flatRing(P, ...above, R * 0.9, { dot: '#4caf50' });
    if (k === 'D' && c === 2) flatRing(P, ...above, R * 0.9, { dot: 'grey', grey: true });
    ctx.restore();
    const cw = P.measure(caps[c], { size: 21, style: 'italic' }) + 26; P.both(rect(cx - cw / 2, top + 368, cw, 34, 8), 'ivory', 2); P.text(caps[c], cx, top + 392, { size: 21, style: 'italic' });
  }
}
function halosSheet(P, keys) {
  P.fill(rect(0, 0, 1600, 900), 'paper');
  COLS.forEach((c, i) => P.text(c, 390 + i * 340, 46, { font: FONT.caps, size: 24, weight: 700 }));
  keys.forEach((k, r) => proposal(P, k, 66 + r * 416));
}
export function halosAB(P) { halosSheet(P, ['A', 'B']); }
export function halosCD(P) { halosSheet(P, ['C', 'D']); }
