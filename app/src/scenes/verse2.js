// Verse 2 — The Poster Campaign (docs/TREATMENT.md). The devotional posters give way to advertising:
// on a wall, a new poster is pasted over the last one for each couplet, slapped on with a brush of paste.
// Each is an ad idiom redrawn as a Mucha poster; its slogan band carries the lyric.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric, greyed } from '../paint.js';
import { heroFront, heroPose, heroWalk } from '../kit/hero.js';
import { person } from '../kit/people.js';
import { sodaCan, tablet, scroll, begin, end, priceTag, car } from '../kit/things.js';
import { heart, fist, sleeveArm, armPlan, upperArm, foreArm } from './verse1.js';

const POSTERS = [
  { title: 'MONDAY', lines: ['one Monday at the fridge', '"Soda now fifty cents"'], draw: fridge, paper: 'ivory', rot: -0.012 },
  { title: 'THE FLYWHEEL', lines: ['more shares than the founders', 'mission on the wall'], draw: flywheel, paper: 'cream', rot: 0.01 },
  { title: 'THE DOC', lines: ["code don't really matter", 'cross-functional alignment'], draw: theDoc, paper: 'ivory', rot: -0.008 },
  { title: 'THE GRAVEYARD', lines: ['a graveyard full of products', 'bought someone a level'], draw: graveyard, paper: 'cream', rot: 0.014 },
  { title: 'THE ORG CHART', lines: ['the org chart got real', 'three syncs, nine sign-offs'], draw: orgChart, paper: 'ivory', rot: -0.01 },
  { title: 'CODE YELLOW', lines: ['Code yellow on the revenue', "till you couldn't tell"], draw: codeYellow, paper: 'cream', rot: 0.008 },
  { title: 'FRIDAY', lines: ['Got an email Friday morning', 'badge reader blinked red'], draw: friday, paper: 'ivory', rot: -0.006 },
];
const PX = 150, PY = 22, PWD = 1300, PHT = 840, ART = 560, BAND = 132;   // poster box; the art area's and the slogan band's heights

export default function verse2(P, f) {
  const t = f.t, ctx = P.ctx;
  const ps = POSTERS.map((p) => ({ ...p, L: p.lines.map((q) => f.L.get(q)) }));
  const T = ps.map((p) => p.L[0].words[0].start - 0.42);   // when each poster is slapped on
  let cur = 0; for (let k = 1; k < ps.length; k++) if (t >= T[k]) cur = k;
  const since = t - T[cur], bump = since > 0.38 && since < 0.6 ? Math.sin((since - 0.38) / 0.22 * Math.PI) * 0.006 : 0;
  const zv = 1 + 0.035 * ease.out(clamp(since / 6)) + bump;
  ctx.save(); ctx.translate(800, 450); ctx.scale(zv, zv); ctx.translate(-800, -450);
  wallBg(P, f);
  // older posters as torn layers peeking out, then the previous one, then the current one landing
  for (let k = Math.max(0, cur - 4); k < cur - 1; k++) torn(P, k, ps[k]);
  if (cur > 0) poster(P, f, ps[cur - 1], cur - 1, 1, t);
  const land = clamp((t - T[cur]) / 0.42);
  poster(P, f, ps[cur], cur, cur === 0 && t < T[0] ? 1 : land, t);
  // the paste brush sweeps across as it lands
  const br = clamp((t - T[cur] - 0.3) / 0.5);
  if (br > 0 && br < 1) { ctx.save(); P.alpha(0.3 * (1 - br)); P.fill(svg(`M${100 + br * 1400} 60 L${180 + br * 1400} 60 L${120 + br * 1400} 860 L${40 + br * 1400} 860 Z`), 'cream'); ctx.restore(); }
  ctx.restore();
}

function wallBg(P, f) {
  P.fill(rect(0, 0, W, H), 'sepia');
  P.tone(rect(0, 0, W, H), 'sepiaDk', { from: [800, 450, 0.05], to: [0, 0, 0.4], radial: true, bbox: [0, 0, W, H] }, 8);
  for (let y = 30; y < 900; y += 60) P.line(svg(`M0 ${y} L1600 ${y}`), 1.2, 'sepiaDk');
  for (let y = 0; y < 900; y += 60) for (let x = (y / 60) % 2 ? 0 : 60; x < 1600; x += 120) P.line(svg(`M${x} ${y + 30} L${x} ${y + 90}`), 1.2, 'sepiaDk');
}
function torn(P, k, p) {
  const r = rng(k + 11), dx = (r() - 0.5) * 60, dy = (r() - 0.5) * 40, rot = (r() - 0.5) * 0.05;
  P.ctx.save(); P.ctx.translate(800 + dx, 450 + dy); P.ctx.rotate(rot);
  P.both(rect(-PWD / 2 - 10, -PHT / 2 - 6, PWD + 20, PHT + 12, 4), k % 2 ? 'cream' : 'ivory', 3);
  P.text(p.title, 0, -PHT / 2 + 54, { font: FONT.caps, weight: 700, size: 40, tracking: 8, color: 'sepiaDk' });
  P.ctx.restore();
}

/** a poster: paper, Mucha border, a title cartouche, the art, the slogan band with the lyric */
function poster(P, f, p, k, land, t) {
  const ctx = P.ctx, drop = 1 - ease.outCubic(land), slap = land >= 1 ? 0 : Math.sin(land * Math.PI) * 0.02;
  ctx.save(); ctx.translate(800, 450 - drop * 950); ctx.rotate(p.rot + drop * 0.08); ctx.scale(1 + slap, 1 + slap); ctx.translate(-800, -450);
  P.ctx.save(); P.alpha(0.35); P.fill(rect(PX + 14, PY + 18, PWD, PHT, 6), 'charDk'); P.ctx.restore();   // its shadow on the wall
  P.both(rect(PX, PY, PWD, PHT, 6), p.paper, 4);
  P.line(rect(PX + 16, PY + 16, PWD - 32, PHT - 32, 4), 3); P.line(rect(PX + 26, PY + 26, PWD - 52, PHT - 52, 4), 1.5);
  for (const [cx, cy, r] of [[PX + 16, PY + 16, 0], [PX + PWD - 16, PY + 16, Math.PI / 2], [PX + PWD - 16, PY + PHT - 16, Math.PI], [PX + 16, PY + PHT - 16, -Math.PI / 2]]) P.corner(cx, cy, r, 0.7);
  // the art
  const art = rect(PX + 40, PY + 92, PWD - 80, ART, 4);
  ctx.save(); P.clip(art); ctx.translate(PX + 40, PY + 92);
  p.draw(P, f, p.L, t, PWD - 80, ART);
  ctx.restore();
  P.line(art, 3);
  // the title cartouche
  const tw = P.measure(p.title, { font: FONT.caps, size: 40, weight: 700, tracking: 10 }) + 90;
  P.both(svg(`M${800 - tw / 2} ${PY + 30} L${800 + tw / 2} ${PY + 30} L${800 + tw / 2 + 24} ${PY + 58} L${800 + tw / 2} ${PY + 86} L${800 - tw / 2} ${PY + 86} L${800 - tw / 2 - 24} ${PY + 58} Z`), 'gold', 3);
  P.text(p.title, 800, PY + 73, { font: FONT.caps, weight: 700, size: 40, tracking: 10 });
  // the slogan band: the current line of this poster's couplet
  const [a, b] = p.L, line = t >= b.start - 0.4 ? b : a;
  const by = PY + 92 + ART + 10;
  P.fill(rect(PX + 40, by, PWD - 80, BAND, 4), 'goldLt'); P.line(rect(PX + 40, by, PWD - 80, BAND, 4), 2); P.line(rect(PX + 48, by + 8, PWD - 96, BAND - 16, 3), 1.2);
  lyric(P, line, t, 800, by + BAND / 2 + 15, { size: 42, maxW: 1120, always: true, lead: 0.5 });
  ctx.restore();
}

const wd = (L, i, q) => L[i].words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(q)).start;
const blinkAt = (t) => { const k = (t * 0.41) % 1; return k > 0.965 ? 1 - Math.abs(k - 0.982) / 0.017 : 0; };
const fill = (P, w, h, c, tone, a = 0.4) => { P.fill(rect(-10, -10, w + 20, h + 20), c); if (tone) P.tone(rect(-10, -10, w + 20, h + 20), tone, { from: [w / 2, 0, 0], to: [w / 2, h, a], bbox: [0, 0, w, h] }, 7); };

// ---- 1. MONDAY: the fridge with its Comic Sans sign; a fella with a plan ------------------------------------------
function fridge(P, f, L, t, w, h) {
  const ctx = P.ctx;
  // the office micro-kitchen: a tiled backsplash, open shelving with jars of snacks, a counter with an espresso machine,
  // a stack of cups and a bowl of fruit; the drinks fridge on the left
  fill(P, w, h, 'mint', 'mintDk', 0.25);
  const bs = rect(-10, 250, w + 20, 200); P.fill(bs, 'cream');
  for (let y = 250; y < 450; y += 34) { P.line(svg(`M-10 ${y} L${w + 10} ${y}`), 1.5, 'silver'); for (let x = ((y / 34) % 2) * 34 - 10; x < w + 10; x += 68) P.line(svg(`M${x} ${y} L${x} ${y + 34}`), 1.5, 'silver'); }
  P.line(svg(`M-10 250 L${w + 10} 250`), 3);
  P.both(rect(560, 150, 680, 14, 3), 'ochre', 3); for (const bx of [600, 1200]) P.both(svg(`M${bx} 164 L${bx} 190 L${bx + 18} 164 Z`), 'sepiaDk', 2);
  [['gold', 640], ['rose', 720], ['sage', 800], ['ochre', 1100], ['plum', 1170]].forEach(([c, x]) => { P.both(rect(x - 26, 80, 52, 70, 8), 'glass', 2.5); P.fill(rect(x - 22, 104, 44, 42, 4), c); P.both(rect(x - 28, 72, 56, 12, 3), 'charDk', 2); });
  const ct = rect(-10, 450, w + 20, 140); P.fill(ct, 'sepia'); P.tone(ct, 'sepiaDk', { from: [0, 460, 0], to: [0, 590, 0.5], bbox: [540, 450, w, 590] }, 6); P.line(ct, 3); P.both(rect(-10, 440, w + 20, 16, 3), 'silver', 3);
  for (let dx = 610; dx < w; dx += 170) { P.line(svg(`M${dx} 470 L${dx} 590`), 2); P.both(rect(dx + 60, 484, 40, 8, 3), 'silver', 2); }
  ctx.save(); ctx.translate(1100, 440);   // the espresso machine
  P.both(rect(-80, -150, 160, 150, 10), 'silver', 3); P.both(rect(-70, -140, 140, 40, 6), 'charDk', 2); P.fill(ell(-40, -120, 5), 'red'); P.fill(ell(-20, -120, 5), 'mint');
  P.both(rect(-40, -96, 80, 14, 4), 'charDk', 2); P.line(svg('M-20 -82 L-20 -60 M20 -82 L20 -60'), 4); P.both(svg('M-12 -2 L-16 -34 L16 -34 L12 -2 Z'), 'cream', 2); P.line(svg('M70 -120 L96 -126'), 5);
  ctx.restore();
  ctx.save(); ctx.translate(1230, 440); for (let k = 0; k < 5; k++) P.both(svg(`M-22 ${-k * 12} L-26 ${-k * 12 - 14} L26 ${-k * 12 - 14} L22 ${-k * 12} Z`), 'cream', 2); ctx.restore();
  ctx.save(); ctx.translate(940, 440); P.both(svg('M-60 0 C-60 -30 60 -30 60 0 Z'), 'ochre', 3); for (const [fx, fy, fc] of [[-30, -28, 'red'], [0, -36, 'gold'], [28, -28, 'sage'], [-12, -46, 'red']]) { P.both(ell(fx, fy, 18), fc, 2); } P.line(svg('M0 -54 l4 -10'), 2.5); ctx.restore();
  // the drinks fridge: a steel cabinet with a lit header and its badge, a glass door with a gasket, wire shelves with
  // price-tag rails, cans in rows, a cold glow, the handle, the kick grille
  P.both(rect(120, 20, 420, 580, 18), 'silver', 5); P.tone(rect(120, 20, 420, 580), 'grey', { from: [420, 20, 0], to: [540, 600, 0.5], bbox: [120, 20, 540, 600] }, 6);
  P.both(rect(140, 32, 380, 34, 6), 'navy', 3); P.text('COLD DRINKS', 330, 57, { font: FONT.caps, weight: 700, size: 22, color: 'cream', tracking: 4 });
  P.both(rect(146, 74, 368, 466, 12), 'charDk', 4); P.both(rect(154, 82, 352, 450, 8), 'glass', 2);
  ctx.save(); P.clip(rect(154, 82, 352, 450, 8));
  P.tone(rect(154, 82, 352, 450), 'cream', { from: [330, 82, 0.5], to: [330, 300, 0], bbox: [154, 82, 506, 532] }, 5);
  for (let r = 0; r < 3; r++) {
    const sy = 200 + r * 150;
    for (let k = 0; k < 5; k++) sodaCan(P, 190 + k * 68, sy - 4, 0.5);
    P.line(svg(`M154 ${sy} L506 ${sy}`), 4); P.line(svg(`M154 ${sy + 6} L506 ${sy + 6}`), 2, 'silver');
    for (let k = 0; k < 5; k++) { P.both(rect(172 + k * 68, sy + 8, 36, 14, 2), 'cream', 1.5); P.line(svg(`M${178 + k * 68} ${sy + 15} l22 0`), 1.2, 'red'); }
  }
  P.line(svg('M180 90 L260 520'), 6, 'cream'); P.line(svg('M210 90 L280 400'), 2.5, 'cream'); ctx.restore();
  P.both(rect(520, 190, 16, 190, 8), 'silver', 3); P.line(svg('M524 200 L524 370'), 1.5, 'cream');
  P.both(rect(150, 548, 360, 40, 6), 'charDk', 3); for (let k = 0; k < 14; k++) P.line(svg(`M${166 + k * 25} 556 L${166 + k * 25} 580`), 2.5, 'grey');
  // the sign, hand-lettered in Comic Sans, taped to the glass
  const sg = wd(L, 0, 'sign'), su = ease.outBack(clamp((t - sg + 0.2) / 0.4));
  if (su > 0) {
    ctx.save(); ctx.translate(330, 230); ctx.rotate(-0.06); ctx.scale(su, su);
    P.both(rect(-150, -70, 300, 140, 4), 'ivory', 3);
    for (const [tx, ty] of [[-150, -70], [150, -70]]) { ctx.save(); ctx.translate(tx, ty); ctx.rotate(0.6); P.fill(rect(-26, -10, 52, 20), '#e9e2c6'); ctx.restore(); }
    const sd = wd(L, 1, 'soda');
    P.text(t > sd - 0.3 ? 'Soda now' : 'Soda', 0, -14, { font: FONT.comic, size: 38, weight: 700, color: 'navy' });
    if (t > wd(L, 1, 'fifty') - 0.1) P.text('50¢ !!', 0, 38, { font: FONT.comic, size: 44, weight: 700, color: 'red' });
    ctx.restore();
  }
  // the hero at the fridge, reaching for a soda; he reads the sign, then turns to the fella with a plan
  const fl = wd(L, 1, 'fella'), mu = ease.outCubic(clamp((t - fl + 0.4) / 0.6)), sg2 = wd(L, 0, 'sign');
  heroFront(P, 650, 330, 0.42, { look: t > fl ? [0.9, 0] : [-0.9, -0.2], mouth: t > wd(L, 1, 'fifty') ? 'o' : f.vocal > 0.18 ? 'sing' : 'neutral', open: f.vocal, brow: t > sg2 ? 1 : 0, blink: blinkAt(t) });
  if (mu > 0) {
    ctx.save(); ctx.translate((1 - mu) * 500, 0);
    P.both(rect(840, 40, 360, 250, 8), 'ivory', 4); P.text('THE PLAN', 1020, 86, { font: FONT.caps, weight: 700, size: 30, tracking: 6 });
    [0.3, 0.45, 0.4, 0.7, 0.9].forEach((v, i) => P.both(rect(870 + i * 62, 270 - 150 * v, 42, 150 * v, 3), i === 4 ? 'gold' : 'sage', 3));
    P.line(svg('M860 260 L1180 110'), 6, 'red');
    person(P, 1030, 400, 0.4, { hair: 'slick', top: 'vest', color: 'char', mouth: 'smirk', acc: ['lanyard'], crop: 900, look: [-0.6, 0], blink: blinkAt(t) });
    ctx.restore();
  }
}

// ---- 2. THE FLYWHEEL: long-limbed workers turn it like a barn raising; the Manager rides it in a gilded box with his shares ---------
function flywheel(P, f, L, t, w, h) {
  const ctx = P.ctx, cx = 610, cy = 300, R = 170, spin = t * 0.5;
  fill(P, w, h, 'goldLt', 'gold', 0.3);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; ctx.save(); P.alpha(0.25); P.fill(svg(`M${cx} ${cy} L${cx + Math.cos(a - 0.08) * 900} ${cy + Math.sin(a - 0.08) * 900} L${cx + Math.cos(a + 0.08) * 900} ${cy + Math.sin(a + 0.08) * 900} Z`), 'cream'); ctx.restore(); }
  P.fill(rect(-10, 490, w + 20, 80), 'sage'); P.line(svg(`M0 490 L${w} 490`), 3);
  // the stand and the wheel, turning; its four virtues on plaques that turn with it but stay upright
  P.both(svg(`M${cx - 44} 490 L${cx - 12} ${cy} L${cx + 12} ${cy} L${cx + 44} 490 Z`), 'sepiaDk', 4);
  P.both(ell(cx, cy, R + 26), 'ochre', 5); P.both(ell(cx, cy, R), 'cream', 4);
  for (let i = 0; i < 8; i++) { const a = spin + (i / 8) * Math.PI * 2; P.line(svg(`M${cx} ${cy} L${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R}`), 5); }
  for (let i = 0; i < 16; i++) { const a = spin + (i / 16) * Math.PI * 2; P.both(ell(cx + Math.cos(a) * (R + 13), cy + Math.sin(a) * (R + 13), 6), 'gold', 2); }
  ['SHIP', 'GROW', 'REORG', 'ALIGN'].forEach((v, i) => { const a = spin + ((i + 0.5) / 4) * Math.PI * 2, px = cx + Math.cos(a) * R * 0.6, py = cy + Math.sin(a) * R * 0.6, pw = P.measure(v, { font: FONT.caps, size: 24, weight: 700 }) + 26; P.both(rect(px - pw / 2, py - 20, pw, 40, 8), 'ivory', 3); P.text(v, px, py + 9, { font: FONT.caps, weight: 700, size: 24 }); });
  P.both(ell(cx, cy, 30), 'gold', 4);
  // the workers push on the rim, each pair in a chain, in colours no person comes in
  const crew = [[186, 'plum', 'gold', 1], [306, 'teal', 'rose', 1], [914, 'rose', 'teal', -1], [1034, 'gold', 'plum', -1]];
  crew.forEach(([x, skin, cloth, dir], i) => memphis(P, x, 490, 0.72, t + i * 0.3, skin, cloth, dir));
  // the Manager rides on top in a gilded box, his shares fanned like a winning hand
  const sh = wd(L, 0, 'shares'), fan = ease.outBack(clamp((t - sh + 0.2) / 0.4));
  person(P, cx, 50, 0.155, { hair: 'slick', top: 'vest', color: 'char', mouth: 'smirk', acc: ['lanyard'], crop: 700, blink: blinkAt(t), look: [0.5, 0] });
  if (fan > 0) for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(cx + 92, 86); ctx.rotate(0.55 + i * 0.3 * fan); P.both(rect(-22, -78, 44, 64, 4), 'ivory', 2.5); P.line(rect(-17, -73, 34, 54, 3), 1.2, 'sageDk'); P.text('%', 0, -36, { font: FONT.caps, weight: 700, size: 24, color: 'sageDk' }); ctx.restore(); }
  if (fan > 0) fist(P, cx + 92, 86, 0.3, 'char', false, { rot: -0.4, len: 30, cuff: 'shirt' });
  P.both(svg(`M${cx - 96} 92 L${cx + 96} 92 L${cx + 84} 128 C${cx + 60} 140 ${cx - 60} 140 ${cx - 84} 128 Z`), 'gold', 4);
  P.tone(svg(`M${cx - 96} 92 L${cx + 96} 92 L${cx + 84} 128 C${cx + 60} 140 ${cx - 60} 140 ${cx - 84} 128 Z`), 'ochre', { from: [cx, 92, 0], to: [cx + 90, 140, 0.6], bbox: [cx - 100, 90, cx + 100, 142] }, 5);
  P.line(svg(`M${cx - 90} 104 L${cx + 90} 104`), 2); P.both(ell(cx, 118, 9), 'red', 2);
  // the mission on its tablet, then its footnote on a ribbon
  const ms = wd(L, 1, 'mission'), mu = ease.outCubic(clamp((t - ms + 0.3) / 0.5));
  if (mu > 0) {
    ctx.save(); ctx.translate(0, (1 - mu) * -260);
    tablet(P, 1100, 14, 190, 170, { lines: ['CHANGE', 'THE WORLD'], size: 22, top: 92, lineH: 32 });
    const fn = wd(L, 1, 'got') - 0.1;
    if (t > fn) {
      const k = ease.outBack(clamp((t - fn) / 0.35));
      P.text('*', 1186, 112, { size: 48, weight: 700, color: 'red' });
      const ft = '*subject to quarterly results', tw = P.measure(ft, { size: 24, style: 'italic' }) + 36;
      ctx.save(); ctx.translate(1040, 222); ctx.scale(k, k); P.banner(-tw / 2, -24, tw, 48, { tail: 'roseLt' }); P.text(ft, 0, 8, { size: 24, style: 'italic', color: 'redDk' }); ctx.restore();
    }
    ctx.restore();
  }
}
/** a figure in the flat corporate-illustration manner: tiny head, long bending limbs, big hands and feet */
function memphis(P, x, y, s, t, skin, cloth, dir) {
  const lw = begin(P, x, y, s); P.ctx.scale(dir, 1);
  const push = Math.sin(t * 3) * 0.1;
  const body = svg(`M-30 -260 C-70 -220 -60 -140 -40 -110 L50 -110 C70 -160 60 -230 20 -270 Z`);
  // legs: a stride, big feet
  P.line(svg(`M0 -110 C-30 -60 -80 -30 -120 0`), 34, 'line'); P.line(svg(`M0 -110 C-30 -60 -80 -30 -120 0`), 26, 'navy');
  P.line(svg(`M20 -110 C40 -60 50 -30 60 0`), 34, 'line'); P.line(svg(`M20 -110 C40 -60 50 -30 60 0`), 26, 'navy');
  P.both(svg('M-150 0 C-150 -18 -110 -22 -90 -8 L-90 6 L-150 6 Z'), 'charDk', 3); P.both(svg('M40 0 C40 -18 80 -22 100 -8 L100 6 L40 6 Z'), 'charDk', 3);
  P.both(body, cloth, 3);
  // arms reaching forward to push the wheel
  const ax = 150 + push * 60;
  P.line(svg(`M20 -240 C70 -250 110 -260 ${ax} -250`), 30, 'line'); P.line(svg(`M20 -240 C70 -250 110 -260 ${ax} -250`), 22, skin);
  P.both(ell(ax + 14, -252, 30, 24), skin, 3);
  P.both(ell(0, -300, 26, 30), skin, 3);
  P.both(svg('M-26 -310 C-30 -340 20 -346 28 -316 C10 -324 -10 -322 -26 -310 Z'), 'charDk', 2.5);
  end(P);
}

// ---- 3. THE DOC: the promo packet as an illuminated manuscript; stock certificates rain down ------------------------
function theDoc(P, f, L, t, w, h) {
  const ctx = P.ctx;
  fill(P, w, h, 'rose', 'redDk', 0.4);
  // the code, crossed out and pushed aside
  const cd = wd(L, 0, 'code');
  ctx.save(); ctx.translate(60, 60); ctx.rotate(-0.08);
  P.both(rect(0, 0, 300, 380, 6), 'night', 4);
  for (let i = 0; i < 12; i++) P.line(svg(`M24 ${30 + i * 28} l${60 + ((i * 37) % 160)} 0`), 6, ['mint', 'goldLt', 'roseLt'][i % 3]);
  if (t > cd) { const u = clamp((t - cd) / 0.4); P.line(svg(`M-10 -10 L${-10 + 320 * u} ${-10 + 400 * u}`), 12, 'red'); P.line(svg(`M310 -10 L${310 - 320 * u} ${-10 + 400 * u}`), 12, 'red'); }
  ctx.restore();
  // the manuscript
  ctx.save(); ctx.translate(430, 20);
  P.both(rect(0, 0, 640, 480, 6), 'ivory', 4); P.line(rect(16, 16, 608, 448, 4), 2, 'gold');
  // the illuminated initial D, gold on blue with a vine
  P.both(rect(40, 40, 150, 150, 6), 'navy', 3); P.line(rect(48, 48, 134, 134, 4), 2, 'gold');
  P.text('D', 115, 160, { font: FONT.display, size: 140, color: 'gold', stroke: 'line', strokeW: 4 });
  P.vine([[40, 200], [20, 300], [60, 380], [40, 460]], 4, false);
  const dv = wd(L, 1, 'drove'), al = wd(L, 1, 'alignment');
  const words = ['rove', 'cross-', 'functional', 'alignment'];
  words.forEach((s2, i) => { const t0 = dv + (i === 0 ? 0 : (al - dv) * (i / 3)), u = clamp((t - t0) / 0.35); if (u > 0) { ctx.save(); P.alpha(u); P.text(s2.toUpperCase(), i === 0 ? 205 : 220, i === 0 ? 150 : 150 + i * 70, { font: FONT.caps, weight: 700, size: i === 0 ? 64 : 56, color: 'gold', stroke: 'line', strokeW: 3, align: 'left' }); ctx.restore(); } });
  const st = wd(L, 0, 'story'), su = clamp((t - st) / 0.8);
  if (su > 0) { P.text('THE STORY OF MY IMPACT', 410, 96, { font: FONT.caps, weight: 700, size: 26, color: 'red' }); for (let i = 0; i < 5; i++) { const w = [380, 340, 390, 300, 360][i] * clamp(su * 5 - i); if (w > 0) P.line(svg(`M220 ${400 + i * 16} l${w * 0.95} 0`), 3, 'sepiaDk'); } }
  ctx.restore();
  // the stock, handed down from above
  const sk = wd(L, 1, 'stock') - 0.6;
  if (t > sk) for (let i = 0; i < 14; i++) { const u = (t - sk) * 0.55 - i * 0.07; if (u < 0) continue; const x = 80 + ((i * 271) % 1100), y = -80 + ((u * 700) % 760); ctx.save(); ctx.translate(x + Math.sin(u * 6 + i) * 30, y); ctx.rotate(Math.sin(u * 4 + i) * 0.5); P.both(rect(-70, -40, 140, 80, 4), 'cream', 3); P.line(rect(-62, -32, 124, 64, 3), 1.5, 'sage'); P.text('STOCK', 0, 0, { font: FONT.caps, weight: 700, size: 22, color: 'sageDk' }); P.both(ell(40, 20, 12), 'gold', 2); ctx.restore(); }
}

// ---- 4. THE GRAVEYARD: tombstones to the horizon, each with a level badge; the users float off to God knows where ---
const ICONS = ['bubble', 'waves', 'lens', 'wave', 'cam', 'plus', 'pin', 'note', 'book', 'bird'];
function graveyard(P, f, L, t, w, h) {
  const ctx = P.ctx;
  fill(P, w, h, 'sky', 'gold', 0.3);
  P.both(svg(`M-10 250 C200 230 500 240 700 236 C900 232 1100 244 ${w + 10} 240 L${w + 10} ${h + 10} L-10 ${h + 10} Z`), 'sage', 3);
  P.tone(rect(-10, 240, w + 20, h), 'hoodDot', { from: [610, 240, 0], to: [610, h, 0.3], bbox: [0, 240, w, h] }, 7);
  const t0 = L[0].words[0].start - 0.4, lv = wd(L, 1, 'level');
  // rows of stones, small far away, big near; the near rows rise from the ground as the camera arrives
  const rows = [[260, 0.28, 18], [300, 0.38, 13], [360, 0.55, 9], [450, 0.8, 6]];
  rows.forEach(([ry, sc, n], ri) => {
    for (let i = 0; i < n; i++) {
      const x = (w / n) * (i + 0.5) + (ri % 2 ? 30 : -20), up = ease.outCubic(clamp((t - t0 - (ri * 0.15 + i * 0.03)) / 0.5));
      if (up <= 0) continue;
      tomb(P, x, ry + (1 - up) * 40 * sc, sc, ICONS[(i * 3 + ri * 7) % ICONS.length], ri >= 2 && t > lv + i * 0.05 && (i + ri) % 2 === 0);
    }
  });
  // where the users went: little figures drifting up into a bright cloud
  const uw = wd(L, 1, 'users') - 0.3;
  if (t > uw) {
    ctx.save(); P.alpha(0.6); P.fill(svg('M440 120 C470 60 560 50 610 90 C660 40 760 60 770 120 C820 130 820 180 770 190 L460 190 C410 180 410 130 440 120 Z'), 'cream'); ctx.restore();
    for (let i = 0; i < 10; i++) { const u = clamp((t - uw - i * 0.14) / 2.4); if (u <= 0) continue; const x = 200 + ((i * 113) % 820) + Math.sin(u * 5 + i) * 14, y = 430 - ease.out(u) * 280; ctx.save(); P.alpha(1 - Math.max(0, u - 0.75) * 3); P.both(ell(x, y - 30, 15), 'ivory', 3); P.both(svg(`M${x - 22} ${y + 22} C${x - 22} ${y - 10} ${x + 22} ${y - 10} ${x + 22} ${y + 22} Z`), 'ivory', 3); P.line(svg(`M${x - 22} ${y + 4} L${x - 34} ${y - 12} M${x + 22} ${y + 4} L${x + 34} ${y - 12}`), 3); ctx.restore(); }
  }
}
function tomb(P, x, y, s, icon, badge) {
  const lw = begin(P, x, y, s);
  const st = svg('M-70 0 L-70 -150 C-70 -210 70 -210 70 -150 L70 0 Z');
  P.fill(st, 'silver'); P.tone(st, 'grey', { from: [-70, -200, 0], to: [70, 0, 0.6], bbox: [-70, -210, 70, 0] }, 5); P.line(st, lw * 1.2);
  P.both(rect(-84, -10, 168, 16, 4), 'grey', lw);
  P.text('R.I.P.', 0, -40, { font: FONT.caps, weight: 700, size: 22, color: 'charDk' });
  iconGlyph(P, 0, -118, icon, lw);
  if (badge) { P.line(svg('M30 -60 L46 -24 M62 -60 L46 -24'), lw * 3, 'red'); P.both(ell(46, -14, 22), 'gold', lw); P.text('L6', 46, -6, { font: FONT.caps, weight: 700, size: 20 }); }
  end(P);
}
function iconGlyph(P, x, y, icon, lw) {
  const c = 'charDk';
  if (icon === 'bubble') P.line(svg(`M${x - 26} ${y - 16} L${x + 26} ${y - 16} L${x + 26} ${y + 12} L${x} ${y + 12} L${x - 12} ${y + 24} L${x - 12} ${y + 12} L${x - 26} ${y + 12} Z`), lw * 1.4, c);
  else if (icon === 'waves') { for (const r of [12, 24, 36]) { const p = new Path2D(); p.arc(x - 20, y + 20, r, -Math.PI / 2, 0); P.line(p, lw * 1.4, c); } P.fill(ell(x - 20, y + 20, 5), c); }
  else if (icon === 'lens') { P.line(ell(x - 14, y, 12), lw * 1.4, c); P.line(ell(x + 14, y, 12), lw * 1.4, c); P.line(svg(`M${x - 2} ${y} L${x + 2} ${y}`), lw * 1.4, c); }
  else if (icon === 'wave') P.line(svg(`M${x - 30} ${y} q10 -16 20 0 q10 16 20 0 q10 -16 20 0`), lw * 1.6, c);
  else if (icon === 'cam') { P.line(rect(x - 26, y - 16, 52, 34, 6), lw * 1.4, c); P.line(ell(x, y + 1, 10), lw * 1.4, c); }
  else if (icon === 'plus') { P.line(svg(`M${x} ${y - 22} L${x} ${y + 22} M${x - 22} ${y} L${x + 22} ${y}`), lw * 2, c); }
  else if (icon === 'pin') { P.line(svg(`M${x} ${y + 24} C${x - 24} ${y} ${x - 20} ${y - 24} ${x} ${y - 24} C${x + 20} ${y - 24} ${x + 24} ${y} ${x} ${y + 24} Z`), lw * 1.4, c); }
  else if (icon === 'note') { P.line(svg(`M${x - 8} ${y + 14} L${x - 8} ${y - 20} L${x + 18} ${y - 26} L${x + 18} ${y + 8}`), lw * 1.6, c); P.fill(ell(x - 14, y + 14, 8, 6), c); P.fill(ell(x + 12, y + 8, 8, 6), c); }
  else if (icon === 'book') P.line(svg(`M${x - 26} ${y - 18} L${x} ${y - 10} L${x + 26} ${y - 18} L${x + 26} ${y + 18} L${x} ${y + 26} L${x - 26} ${y + 18} Z M${x} ${y - 10} L${x} ${y + 26}`), lw * 1.4, c);
  else P.line(svg(`M${x - 24} ${y + 4} C${x - 10} ${y - 20} ${x + 10} ${y - 20} ${x + 24} ${y - 4} C${x + 10} ${y} ${x - 6} ${y + 14} ${x - 24} ${y + 4} Z`), lw * 1.4, c);
}

// ---- 5. THE ORG CHART: a tree of life fruiting boxes; one button, blue to gray, under nine stamps -------------------
function orgChart(P, f, L, t, w, h) {
  const ctx = P.ctx;
  fill(P, w, h, 'ivory', 'sepia', 0.3);
  // the tree: a trunk, branches, boxes for fruit
  P.both(svg('M560 400 C576 330 584 220 588 90 L612 90 C616 220 624 330 640 400 C660 420 690 424 720 430 L480 430 C510 424 540 420 560 400 Z'), 'sepiaDk', 4);
  P.line(svg('M592 380 C596 300 598 200 600 110'), 2, 'ochre');
  const tiers = [[['CEO'], 70], [['SVP', 'SVP'], 150], [['VP', 'VP', 'VP', 'VP'], 230], [['DIR', 'DIR', 'DIR', 'DIR', 'DIR', 'DIR'], 310]];
  const t0 = L[0].words[0].start - 0.3;
  let prev = [[600, 40]];
  tiers.forEach(([names, y], ti) => {
    const n = names.length, cur = names.map((_, i) => [600 + (i - (n - 1) / 2) * (1100 / Math.max(2, n)) * (ti === 0 ? 0 : 1), y]);
    const u = ease.outCubic(clamp((t - t0 - ti * 0.25) / 0.5)); if (u <= 0) return;
    cur.forEach(([x, yy], i) => { const pp = prev[Math.floor(i * prev.length / n)]; P.line(svg(`M${pp[0]} ${pp[1] + 22} C${pp[0]} ${(pp[1] + yy) / 2} ${x} ${(pp[1] + yy) / 2} ${x} ${yy - 22}`), 4, 'sageDk'); });
    cur.forEach(([x, yy], i) => { ctx.save(); ctx.translate(x, yy); ctx.scale(u, u); P.both(rect(-60, -24, 120, 48, 10), ti === 0 ? 'gold' : 'cream', 3); P.text(names[i], 0, 10, { font: FONT.caps, weight: 700, size: 22 }); P.leaf(-60, 20, 2.6, 0.5); P.leaf(60, 20, 0.5, 0.5); ctx.restore(); });
    prev = cur;
  });
  // the button, in its frame; it goes from blue to gray on "gray"
  const gr = wd(L, 1, 'review') + 0.05, g = clamp((t - gr) / 0.3);   // grey only once the launch review signs off
  P.both(rect(470, 380, 260, 120, 12), 'cream', 4);
  const bc = g < 1 ? (g > 0.5 ? 'grey' : 'navy') : 'grey';
  P.both(rect(510, 410, 180, 60, 30), bc, 4); P.text('Submit', 600, 450, { size: 30, color: 'cream' });
  // three syncs: calendar invites; nine sign-offs: nine stamps, one per beat; May
  const sy = wd(L, 1, 'three');
  for (let i = 0; i < 3; i++) { const u = ease.outBack(clamp((t - sy - i * 0.12) / 0.3)); if (u > 0) { ctx.save(); ctx.translate(90 + i * 30, 412 + i * 16); ctx.scale(u, u); P.both(rect(-70, -40, 140, 80, 6), 'ivory', 3); P.fill(rect(-70, -40, 140, 20, 6), 'navy'); P.text('SYNC', 0, 22, { font: FONT.caps, weight: 700, size: 22 }); ctx.restore(); } }
  const nn = wd(L, 1, 'nine'), beatT = f.A.P / 2;
  const spots = [[350, 392], [850, 392], [600, 360], [350, 452], [850, 452], [300, 512], [500, 516], [700, 516], [900, 512]];
  // a volley of nine stamps, bang-bang-bang, ringed round the button
  for (let i = 0; i < 9; i++) { const ts = nn + i * 0.09, u = clamp((t - ts) / 0.1); if (u <= 0) continue; const [sx, sy2] = spots[i]; ctx.save(); ctx.translate(sx, sy2); ctx.rotate(-0.16 + (i % 3) * 0.12); ctx.scale(1 + (1 - u) * 0.6, 1 + (1 - u) * 0.6); P.ctx.save(); P.alpha(0.88); P.line(rect(-93, -30, 186, 60, 8), 5, 'red'); P.line(rect(-86, -23, 172, 46, 5), 1.5, 'red'); P.text('APPROVED', 0, 11, { font: FONT.caps, weight: 700, size: 30, color: 'red' }); P.ctx.restore(); ctx.restore(); }
  const my = wd(L, 1, 'launch'), mu = ease.outBack(clamp((t - my) / 0.35));
  if (mu > 0) { ctx.save(); ctx.translate(1080, 430); ctx.scale(mu, mu); P.both(rect(-90, -80, 180, 170, 8), 'ivory', 4); P.fill(rect(-90, -80, 180, 44, 8), 'red'); P.line(rect(-90, -80, 180, 170, 8), 4); P.text('MAY', 0, -46, { font: FONT.caps, weight: 700, size: 30, color: 'cream' }); P.text('31', 0, 50, { font: FONT.caps, weight: 700, size: 70 }); ctx.restore(); }
}

// ---- 6. CODE YELLOW: the beacon spins; the little "Ad" shrinks until you can't tell; best quarter ever -------------
function codeYellow(P, f, L, t, w, h) {
  const ctx = P.ctx;
  fill(P, w, h, 'goldLt', 'gold', 0.5);
  const cy0 = wd(L, 0, 'code');
  // the beacon: a yellow halo turning, its beam sweeping
  const a = t * 4;
  ctx.save(); P.alpha(0.35); P.fill(svg(`M160 120 L${160 + Math.cos(a - 0.3) * 900} ${120 + Math.sin(a - 0.3) * 900} L${160 + Math.cos(a + 0.3) * 900} ${120 + Math.sin(a + 0.3) * 900} Z`), 'cream'); ctx.restore();
  P.both(ell(160, 120, 70), 'gold', 5); P.both(ell(160, 120, 46), 'cream', 3); P.both(rect(110, 170, 100, 40, 6), 'charDk', 4);
  P.text('CODE', 160, 270, { font: FONT.caps, weight: 700, size: 34 }); P.text('YELLOW', 160, 306, { font: FONT.caps, weight: 700, size: 34 });
  // the results, the first an ad whose label shrinks to nothing
  const sk = wd(L, 0, 'shrank'), u = ease.inOutCubic(clamp((t - sk) / 2.4));
  ctx.save(); ctx.translate(330, 30);
  P.both(rect(0, 0, 840, 480, 12), 'ivory', 4);
  P.both(rect(24, 20, 792, 56, 28), 'cream', 3); P.text('the best soda near me', 60, 58, { size: 30, align: 'left', color: 'charDk' }); P.line(ell(770, 48, 13), 3); P.line(svg('M779 57 L792 70'), 4);
  // the first result: an ad; its label shrinks to a dot and the ad melts into the results
  const s2 = lerp(1, 0.06, u), ad = lerp(1, 0, u);
  if (u < 0.2) { P.ctx.save(); P.alpha(1 - u * 5); P.fill(rect(24, 94, 792, 84, 10), 'goldLt'); P.ctx.restore(); }
  ctx.save(); ctx.translate(70, 128); ctx.scale(s2, s2); P.both(rect(-40, -26, 84, 52, 10), ad > 0.4 ? 'sage' : 'grey', 3); P.text('Ad', 2, 13, { font: FONT.caps, weight: 700, size: 34, color: 'cream' }); ctx.restore();
  P.text('FIZZ™ — The Best Soda, now 50¢', lerp(130, 40, u), 140, { size: 34, align: 'left', color: 'navy' });
  P.line(svg(`M${lerp(130, 40, u)} 166 l480 0`), 6, 'silver');
  for (let i = 1; i < 4; i++) {
    const y = 128 + i * 94;
    P.text(['Soda — Wikipedia', 'Why is soda 50¢ now?', 'Soda prices, explained'][i - 1], 40, y + 12, { size: 30, align: 'left', color: 'navy' });
    P.line(svg(`M40 ${y + 38} l${560 - i * 60} 0 M40 ${y + 58} l${420 + i * 40} 0`), 6, 'silver');
  }
  ctx.restore();
  // best quarter we ever had: an arrow up and confetti
  const bq = wd(L, 1, 'best');
  if (t > bq) {
    const v = ease.outCubic(clamp((t - bq) / 0.7));
    P.both(rect(40, 350, 240, 170, 8), 'ivory', 3); P.text('Q3', 76, 384, { font: FONT.caps, weight: 700, size: 22 });
    [0.3, 0.45, 0.6, 1.0].forEach((h, i) => P.both(rect(70 + i * 50, 500 - 110 * h * v, 34, 110 * h * v, 3), i === 3 ? 'gold' : 'sage', 2.5));
    const ah = new Path2D(); ah.moveTo(70, 470); ah.lineTo(70 + 190 * v, 470 - 100 * v); P.line(ah, 12); P.line(ah, 6, 'red');
    P.ctx.save(); P.ctx.translate(70 + 190 * v, 470 - 100 * v); P.ctx.rotate(-0.48); P.both(svg('M-4 -16 L24 0 L-4 16 Z'), 'red', 3); P.ctx.restore();
    for (let i = 0; i < 26; i++) { const k = ((t - bq) * 0.6 + i * 0.04) % 1; P.fill(rect(60 + ((i * 113) % 1100), -20 + k * 560, 14, 8), ['red', 'teal', 'gold', 'rose'][i % 4]); }
  }
}

// ---- 7. FRIDAY: an email; he drives in like before; the badge reader blinks red; he greys out, like a disabled button -
/**
 * Outside the office on a Friday morning: the lot where he parked, a lawn, the plaza, and on the right the building's
 * ground floor, a wall of glass in a grid of mullions with the sky and trees in it, the doors and their badge reader, a
 * planter, a lamp, the low sign: BLDG 42. (w, h) the poster's art box; he walks on y = 400.
 */
function officeFront(P, w, h, t) {
  const ctx = P.ctx;
  fill(P, w, h, 'sky', 'goldLt', 0.3);
  // far trees along the back of the lot
  for (let i = 0; i < 9; i++) { const tx = -20 + i * 98 + (i % 2) * 20, ty = 300 + (i % 3) * 6, tr = 46 + (i % 3) * 10; const c = svg(`M${tx - tr} ${ty} C${tx - tr} ${ty - tr * 1.6} ${tx + tr} ${ty - tr * 1.6} ${tx + tr} ${ty} Z`); P.fill(c, i % 2 ? 'sage' : 'sageDk'); P.tone(c, 'hoodDot', { from: [tx, ty - tr, 0], to: [tx + tr, ty, 0.4], bbox: [tx - tr, ty - tr * 1.3, tx + tr, ty] }, 5); P.line(c, 2.5); }
  // the parking lot, his car in its bay
  P.both(rect(-10, 300, w + 20, 62), 'grey', 3); P.tone(rect(-10, 300, w + 20, 62), 'charDk', { from: [0, 300, 0.1], to: [0, 362, 0.4], bbox: [0, 300, w, 362] }, 5);
  for (let i = 0; i < 9; i++) P.line(svg(`M${30 + i * 96} 304 L${12 + i * 96} 358`), 2.5, 'cream');
  car(P, 250, 352, 0.62, { color: 'denim' });
  // the lawn and its kerb, then the plaza in big pavers
  P.both(rect(-10, 360, w + 20, 26), 'sage', 3); for (let gx = 10; gx < w; gx += 60) P.line(svg(`M${gx} 384 l4 -12 M${gx + 6} 384 l1 -15 M${gx + 12} 384 l-3 -10`), 2, 'sageDk');
  const plaza = rect(-10, 386, w + 20, h - 376); P.fill(plaza, 'cream'); P.tone(plaza, 'skinDot', { from: [0, 386, 0], to: [0, h, 0.3], bbox: [0, 386, w, h] }, 6);
  P.line(svg(`M-10 386 L${w + 10} 386`), 3.5); P.line(svg(`M-10 392 L${w + 10} 392`), 1.5);
  for (const y of [412, 446, 494]) P.line(svg(`M-10 ${y} L${w + 10} ${y}`), 1.5, 'sepia');
  for (let i = -6; i < 20; i++) { const x0 = 600 + (i - 6) * 70; P.line(svg(`M${x0 + (x0 - 600) * 0.06} 392 L${x0 + (x0 - 600) * 0.62} ${h}`), 1.5, 'sepia'); }
  // a lamp and a planter on the plaza, behind his path
  P.line(svg('M560 390 L560 110'), 9); P.line(svg('M560 390 L560 110'), 5, 'char'); P.both(svg('M540 112 L600 104 L602 116 L542 122 Z'), 'charDk', 3); P.fill(svg('M548 120 L598 114 L598 118 L548 124 Z'), 'goldLt');
  P.both(rect(612, 330, 140, 62, 4), 'silver', 3); P.tone(rect(612, 330, 140, 62), 'grey', { from: [700, 330, 0], to: [752, 392, 0.5], bbox: [612, 330, 752, 392] }, 5); P.line(svg('M612 342 L752 342'), 2);
  for (let k = 0; k < 9; k++) { const gx = 626 + k * 14, a = -1.7 + (k - 4) * 0.12; P.line(svg(`M${gx} 332 Q${gx + Math.cos(a) * 30} ${332 + Math.sin(a) * 50} ${gx + Math.cos(a) * 46 + Math.sin(t * 1.5 + k) * 3} ${332 + Math.sin(a) * 80}`), 3, k % 2 ? 'sageDk' : 'sage'); }
  // the building: a wall of glass in a grid, spandrels at the floor line, the sky and the trees reflected in it
  const bx = 780, wall = rect(bx, -20, w - bx + 20, 412);
  P.fill(wall, 'glass'); P.tone(wall, 'mintDk', { from: [bx, -20, 0], to: [w, 392, 0.45], bbox: [bx, -20, w, 392] }, 6);
  ctx.save(); P.clip(wall);
  for (let i = 0; i < 6; i++) { const rx = bx + 30 + i * 90, ry = 360; const c = svg(`M${rx - 50} ${ry} C${rx - 50} ${ry - 90} ${rx + 50} ${ry - 90} ${rx + 50} ${ry} Z`); ctx.save(); P.alpha(0.35); P.fill(c, 'sageDk'); ctx.restore(); }
  ctx.save(); P.alpha(0.45); for (const gx of [bx + 60, bx + 250, bx + 330]) P.fill(svg(`M${gx} -20 L${gx + 60} -20 L${gx - 120} 392 L${gx - 180} 392 Z`), 'cream'); ctx.restore();
  ctx.restore();
  P.fill(rect(bx, 112, w - bx + 20, 22), 'char'); P.tone(rect(bx, 112, w - bx + 20, 22), '#000', { from: [0, 112, 0.2], to: [0, 134, 0.5], bbox: [bx, 112, w, 134] }, 4);
  for (let mx = bx; mx <= w + 10; mx += 74) P.line(svg(`M${mx} -20 L${mx} 392`), 4, 'char');
  P.line(svg(`M${bx} 112 L${w + 10} 112 M${bx} 134 L${w + 10} 134 M${bx} 262 L${w + 10} 262`), 3, 'char');
  P.line(wall, 4);
  // the doors: a deeper frame, two leaves with long pull bars, a mat, the reader on its post (green, for now)
  const dx = bx + 74 * 1, dw = 148;
  P.both(rect(dx - 8, 140, dw + 16, 252), 'charDk', 3); P.fill(rect(dx, 148, dw, 244), 'glass'); P.tone(rect(dx, 148, dw, 244), 'tealDk', { from: [dx, 148, 0.2], to: [dx + dw, 392, 0.6], bbox: [dx, 148, dx + dw, 392] }, 5);
  P.line(svg(`M${dx + dw / 2} 148 L${dx + dw / 2} 392`), 4, 'char'); P.line(rect(dx, 148, dw, 244), 3, 'char');
  for (const hx of [dx + dw / 2 - 16, dx + dw / 2 + 12]) P.both(rect(hx, 230, 5, 90, 2), 'silver', 2);
  P.both(rect(dx - 10, 388, dw + 20, 10, 3), 'charDk', 2);
  P.line(svg(`M${dx + dw + 34} 392 L${dx + dw + 34} 300`), 6); P.both(rect(dx + dw + 22, 268, 24, 36, 5), 'char', 2.5); P.fill(ell(dx + dw + 34, 280, 4), 'sage');
  // the sign: a low slab of concrete with the logo and the building's number
  const sx = 1080; P.both(rect(sx, 286, 130, 104, 4), 'silver', 3); P.tone(rect(sx, 286, 130, 104), 'grey', { from: [sx + 60, 286, 0], to: [sx + 130, 390, 0.45], bbox: [sx, 286, sx + 130, 390] }, 5);
  for (const [cx2, c2] of [[sx + 34, 'rose'], [sx + 50, 'gold'], [sx + 66, 'teal']]) { ctx.save(); P.alpha(0.9); P.fill(ell(cx2, 318, 14), c2); ctx.restore(); }
  P.text('BLDG 42', sx + 65, 366, { font: FONT.caps, weight: 700, size: 22, color: 'charDk' });
  // the building's morning shadow across the plaza, and in the foreground a bike rack with someone's bike
  P.tone(svg(`M${bx} 392 L${w + 10} 392 L${w + 10} ${h + 10} L${bx - 260} ${h + 10} Z`), 'skinDot', { from: [bx, 392, 0.35], to: [bx - 200, h, 0.25], bbox: [bx - 270, 392, w, h] }, 5);
  for (let k = 0; k < 4; k++) { const rx = 70 + k * 74; P.line(svg(`M${rx} 548 L${rx} 486 C${rx} 462 ${rx + 40} 462 ${rx + 40} 486 L${rx + 40} 548`), 9); P.line(svg(`M${rx} 548 L${rx} 486 C${rx} 462 ${rx + 40} 462 ${rx + 40} 486 L${rx + 40} 548`), 5, 'silver'); }
  bike(P, 200, 548, 0.9);
}
/** a commuter bicycle in profile, facing right, (x, y) the ground under its middle */
function bike(P, x, y, s) {
  const lw = begin(P, x, y, s), r = 52, A = [-86, -r], B = [86, -r], S = [-26, -r - 4], H = [62, -122], T = [-36, -116];
  for (const [cx, cy] of [A, B]) { P.line(ell(cx, cy, r), lw * 2.6); P.line(ell(cx, cy, r), lw * 1.4, 'charDk'); P.line(ell(cx, cy, r - 7), lw * 0.4); for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; P.line(svg(`M${cx} ${cy} L${cx + Math.cos(a) * (r - 6)} ${cy + Math.sin(a) * (r - 6)}`), lw * 0.3); } P.both(ell(cx, cy, 5), 'silver', lw * 0.4); }
  const frame = `M${A[0]} ${A[1]} L${S[0]} ${S[1]} L${T[0]} ${T[1]} L${H[0] - 8} ${H[1] + 14} L${S[0]} ${S[1]} M${A[0]} ${A[1]} L${T[0]} ${T[1]} M${H[0] - 8} ${H[1] + 14} L${B[0]} ${B[1]}`;
  P.line(svg(frame), lw * 3.4); P.line(svg(frame), lw * 2, 'red');
  P.line(svg(`M${T[0]} ${T[1]} L${T[0] - 6} ${T[1] - 16}`), lw * 1.6); P.both(svg(`M${T[0] - 26} ${T[1] - 20} L${T[0] + 14} ${T[1] - 22} C${T[0] + 14} ${T[1] - 14} ${T[0] - 18} ${T[1] - 10} ${T[0] - 26} ${T[1] - 20} Z`), 'charDk', lw * 0.6);
  P.line(svg(`M${H[0] - 8} ${H[1] + 14} L${H[0]} ${H[1]} C${H[0] + 10} ${H[1] - 8} ${H[0] + 26} ${H[1] - 6} ${H[0] + 30} ${H[1] + 4}`), lw * 1.6);
  P.both(ell(S[0], S[1], 12), 'silver', lw * 0.5); P.line(svg(`M${S[0]} ${S[1]} L${S[0] + 10} ${S[1] + 14}`), lw);   // crank and pedal
  P.line(svg(`M${A[0]} ${A[1]} L${S[0]} ${S[1] + 2}`), lw * 0.4, 'grey');   // the chain
  end(P);
}
function friday(P, f, L, t, w, h) {
  const ctx = P.ctx, br = L[1].words[0].start - 0.25;
  if (t < br) {
    // the email arrives, he walks to the office door
    officeFront(P, w, h, t);
    const em = wd(L, 0, 'email'), eu = ease.outBack(clamp((t - em + 0.2) / 0.4));
    if (eu > 0 && t < em + 2.2) { ctx.save(); ctx.translate(205, 150); ctx.scale(eu * 0.9, eu * 0.9); P.both(rect(-150, -80, 300, 170, 8), 'ivory', 4); P.line(svg('M-150 -80 L0 20 L150 -80'), 4); P.both(rect(-130, 40, 260, 34, 6), 'cream', 2); P.text('Subject: Org update', 0, 64, { size: 20 }); ctx.restore(); }
    const walk = t - (L[0].words[0].start - 0.3);
    const hx = lerp(430, 700, clamp(walk / 2.6));
    P.tone(ell(hx, 404, 70, 8), '#000', { from: [hx, 404, 0.4], to: [hx + 70, 404, 0], radial: true, bbox: [hx - 70, 396, hx + 70, 412] }, 4);
    ctx.save(); heroWalk(P, hx, 400, 0.36, walk * 6, {}); ctx.restore();
  } else {
    // the close-up: badge to the reader; it blinks red, and he is greyed out like a disabled control, the grey spreading
    // from the badge in his hand up his arm and over him; only the reader's red light keeps its colour
    fill(P, w, h, 'cream', 'sepia', 0.3);
    P.both(rect(780, -10, 200, h + 20), 'sepia', 4); P.line(svg(`M800 -10 L800 ${h + 10}`), 2);
    const rd = wd(L, 1, 'red'), red = t > rd - 0.1;
    P.both(rect(840, 160, 110, 180, 16), 'char', 4); P.both(ell(895, 210, 18), red && Math.floor(t * 5) % 2 === 0 ? 'red' : (red ? 'redDk' : 'sage'), 3); P.line(rect(860, 250, 70, 60, 8), 2, 'grey');
    if (red) P.tone(ell(895, 210, 120), 'red', { from: [895, 210, 0.7], to: [1015, 210, 0], radial: true, bbox: [775, 90, 1015, 330] }, 5);
    const gn = wd(L, 1, 'guess'), wipe = ease.inOutSine(clamp((t - gn + 0.15) / 1.2));
    const arm = armPlan({ x: 430, y: 230, s: 0.55 }, 1, [834, 394]);   // his left arm: elbow at his side, forearm up to the reader
    const him = () => {
      upperArm(P, arm, 'teal', { tone: 'hoodDot' });
      heroFront(P, 430, 230, 0.55, { mouth: t > gn ? 'frown' : 'neutral', look: [0.8, 0], blink: blinkAt(t), brow: t > gn ? 1 : 0 });
      // the badge on its lanyard, held to the reader
      P.line(svg('M448 392 C520 540 700 540 796 352'), 7); P.line(svg('M448 392 C520 540 700 540 796 352'), 4, 'teal');
      P.both(rect(790, 240, 90, 120, 8), 'cream', 4); P.both(rect(806, 256, 58, 50, 4), 'glass', 2); P.line(svg('M806 324 L864 324 M806 340 L846 340'), 3);
      foreArm(P, arm, 'teal', { tone: 'hoodDot', cuff: 'tealLt' });
    };
    him();
    if (wipe > 0) { ctx.save(); P.clip(ell(835, 300, 40 + 900 * wipe)); greyed(1, him); ctx.restore(); }
  }
}
