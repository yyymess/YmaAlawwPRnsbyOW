// Verse 2 — The Poster Campaign (docs/TREATMENT.md). The devotional posters give way to advertising:
// on a wall, a new poster is pasted over the last one for each couplet, slapped on with a brush of paste.
// Each is an ad idiom redrawn as a Mucha poster; its slogan band carries the lyric.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric } from '../paint.js';
import { heroFront, heroPose, heroWalk } from '../kit/hero.js';
import { person } from '../kit/people.js';
import { sodaCan, tablet, scroll, begin, end, priceTag } from '../kit/things.js';
import { heart } from './verse1.js';

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
  fill(P, w, h, 'mint', 'mintDk', 0.4);
  for (let i = 0; i < 9; i++) P.line(svg(`M${i * 150 - 40} 0 L${i * 150 + 60} ${h}`), 2, 'mintDk');
  // the fridge: a glass door, shelves of red cans
  P.both(rect(120, 30, 420, 560, 22), 'cream', 5);
  P.both(rect(150, 60, 360, 470, 12), 'glass', 4);
  ctx.save(); P.clip(rect(150, 60, 360, 470, 12));
  for (let r = 0; r < 3; r++) { P.line(svg(`M150 ${200 + r * 150} L510 ${200 + r * 150}`), 4); for (let k = 0; k < 5; k++) sodaCan(P, 190 + k * 68, 196 + r * 150, 0.5); }
  P.line(svg('M180 80 L260 520'), 6, 'cream'); ctx.restore();
  P.both(rect(520, 200, 18, 160, 8), 'silver', 3);
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

// ---- 2. THE FLYWHEEL: long-limbed workers turn it like a barn raising; the Manager rides it with his shares ---------
function flywheel(P, f, L, t, w, h) {
  const ctx = P.ctx;
  fill(P, w, h, 'goldLt', 'gold', 0.3);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; ctx.save(); P.alpha(0.25); P.fill(svg(`M610 300 L${610 + Math.cos(a - 0.08) * 900} ${300 + Math.sin(a - 0.08) * 900} L${610 + Math.cos(a + 0.08) * 900} ${300 + Math.sin(a + 0.08) * 900} Z`), 'cream'); ctx.restore(); }
  P.fill(rect(-10, 470, w + 20, 80), 'sage'); P.line(svg(`M0 470 L${w} 470`), 3);
  // the wheel, turning
  const spin = t * 0.5, cx = 610, cy = 270, R = 200;
  P.both(ell(cx, cy, R + 26), 'ochre', 5); P.both(ell(cx, cy, R), 'cream', 4);
  const words = ['SHIP', 'GROW', 'REORG', 'ALIGN'];
  for (let i = 0; i < 8; i++) { const a = spin + (i / 8) * Math.PI * 2; P.line(svg(`M${cx} ${cy} L${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R}`), 5); }
  for (let i = 0; i < 4; i++) { const a = spin + ((i + 0.5) / 4) * Math.PI * 2; ctx.save(); ctx.translate(cx + Math.cos(a) * R * 0.66, cy + Math.sin(a) * R * 0.66); ctx.rotate(a + Math.PI / 2); P.text(words[i], 0, 10, { font: FONT.caps, weight: 700, size: 30 }); ctx.restore(); }
  for (let i = 0; i < 16; i++) { const a = spin + (i / 16) * Math.PI * 2; P.both(ell(cx + Math.cos(a) * (R + 13), cy + Math.sin(a) * (R + 13), 6), 'gold', 2); }
  P.both(ell(cx, cy, 34), 'gold', 4); P.both(svg(`M${cx - 26} 470 L${cx} ${cy + 20} L${cx + 26} 470 Z`), 'sepiaDk', 4);
  // the workers, long-limbed and small-headed, in colours no person comes in
  const crew = [[300, 'teal', 'rose', 1], [430, 'plum', 'gold', 1], [800, 'rose', 'teal', -1], [930, 'gold', 'plum', -1]];
  crew.forEach(([x, skin, cloth, dir], i) => memphis(P, x, 470, 0.8, t + i * 0.3, skin, cloth, dir));
  // the Manager rides the top with his shares
  const sh = wd(L, 0, 'shares');
  person(P, cx, 30, 0.22, { hair: 'slick', top: 'vest', color: 'char', mouth: 'smirk', acc: ['lanyard'], crop: 700, blink: blinkAt(t) });
  if (t > sh - 0.2) { const u = ease.outBack(clamp((t - sh + 0.2) / 0.4)); for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(cx + 90, 120); ctx.rotate(-0.5 + i * 0.28 * u); P.both(rect(0, -30, 120, 64, 4), 'cream', 3); P.text('SHARES', 60, 10, { font: FONT.caps, weight: 700, size: 18, color: 'sageDk' }); ctx.restore(); } }
  // the mission, now with a footnote
  const ms = wd(L, 1, 'mission'), mu = ease.outCubic(clamp((t - ms + 0.3) / 0.5));
  if (mu > 0) {
    ctx.save(); ctx.translate(0, (1 - mu) * 300);
    tablet(P, 1080, 70, 220, 200, { lines: ['CHANGE', 'THE WORLD'], size: 24, top: 110, lineH: 34 });
    const fn = wd(L, 1, 'footnote');
    if (t > fn) { P.text('*', 1180, 160, { size: 48, weight: 700, color: 'red' }); P.text('*subject to quarterly results', 1080, 300, { size: 16, style: 'italic', color: 'charDk' }); }
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
    for (let i = 0; i < 12; i++) { const u = clamp((t - uw - i * 0.12) / 2.2); if (u <= 0) continue; const x = 200 + ((i * 97) % 820), y = 420 - u * 300; ctx.save(); P.alpha(1 - u * 0.7); P.both(ell(x, y - 18, 9), 'cream', 2); P.both(svg(`M${x - 12} ${y + 12} C${x - 12} ${y - 6} ${x + 12} ${y - 6} ${x + 12} ${y + 12} Z`), 'cream', 2); ctx.restore(); }
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
  const gr = wd(L, 0, 'gray'), g = clamp((t - gr) / 0.4);
  P.both(rect(470, 380, 260, 120, 12), 'cream', 4);
  const bc = g < 1 ? (g > 0.5 ? 'grey' : 'navy') : 'grey';
  P.both(rect(510, 410, 180, 60, 30), bc, 4); P.text('Submit', 600, 450, { size: 30, color: 'cream' });
  // three syncs: calendar invites; nine sign-offs: nine stamps, one per beat; May
  const sy = wd(L, 1, 'three');
  for (let i = 0; i < 3; i++) { const u = ease.outBack(clamp((t - sy - i * 0.12) / 0.3)); if (u > 0) { ctx.save(); ctx.translate(120 + i * 40, 420 + i * 18); ctx.scale(u, u); P.both(rect(-70, -40, 140, 80, 6), 'ivory', 3); P.fill(rect(-70, -40, 140, 20, 6), 'navy'); P.text('SYNC', 0, 22, { font: FONT.caps, weight: 700, size: 22 }); ctx.restore(); } }
  const nn = wd(L, 1, 'nine'), beatT = f.A.P / 2;
  for (let i = 0; i < 9; i++) { const ts = nn + i * beatT * 0.55, u = clamp((t - ts) / 0.12); if (u <= 0) continue; const a = (i / 9) * Math.PI * 2, sx = 600 + Math.cos(a) * 250, sy2 = 440 + Math.sin(a) * 90; ctx.save(); ctx.translate(sx, sy2); ctx.rotate(-0.2 + (i % 3) * 0.15); ctx.scale(1 + (1 - u) * 0.6, 1 + (1 - u) * 0.6); P.ctx.save(); P.alpha(0.85); P.line(rect(-62, -20, 124, 40, 6), 4, 'red'); P.text('APPROVED', 0, 9, { font: FONT.caps, weight: 700, size: 20, color: 'red' }); P.ctx.restore(); ctx.restore(); }
  const my = wd(L, 1, 'may'), mu = ease.outBack(clamp((t - my + 0.15) / 0.35));
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

// ---- 7. FRIDAY: an email; he drives in like before; the badge reader blinks red; the halo goes grey -----------------
function friday(P, f, L, t, w, h) {
  const ctx = P.ctx, br = L[1].words[0].start - 0.25;
  if (t < br) {
    // the email arrives, he walks to the office door
    fill(P, w, h, 'sky', 'goldLt', 0.3);
    P.both(svg(`M-10 380 L${w + 10} 380 L${w + 10} ${h + 10} L-10 ${h + 10} Z`), 'sage', 3);
    P.both(rect(780, 60, 380, 330, 6), 'glass', 4); P.line(svg('M970 60 L970 390'), 4); P.tone(rect(780, 60, 380, 330), 'mintDk', { from: [780, 60, 0], to: [1160, 390, 0.5], bbox: [780, 60, 1160, 390] }, 6);
    const em = wd(L, 0, 'email'), eu = ease.outBack(clamp((t - em + 0.2) / 0.4));
    if (eu > 0 && t < em + 2.2) { ctx.save(); ctx.translate(300, 140); ctx.scale(eu, eu); P.both(rect(-150, -80, 300, 170, 8), 'ivory', 4); P.line(svg('M-150 -80 L0 20 L150 -80'), 4); P.both(rect(-130, 40, 260, 34, 6), 'cream', 2); P.text('Subject: Org update', 0, 64, { size: 20 }); ctx.restore(); }
    const walk = t - (L[0].words[0].start - 0.3);
    ctx.save(); heroWalk(P, lerp(120, 640, clamp(walk / 2.6)), 400, 0.36, walk * 6, {}); ctx.restore();
    P.both(ell(lerp(130, 650, clamp(walk / 2.6)) + 20, 400 - 380 + Math.sin(t * 3) * 3, 40, 10), 'gold', 3);
  } else {
    // the close-up: badge to the reader, red, the halo going grey
    fill(P, w, h, 'cream', 'sepia', 0.3);
    P.both(rect(780, -10, 200, h + 20), 'sepia', 4); P.line(svg(`M800 -10 L800 ${h + 10}`), 2);
    const rd = wd(L, 1, 'red'), red = t > rd - 0.1;
    P.both(rect(840, 160, 110, 180, 16), 'char', 4); P.both(ell(895, 210, 18), red && Math.floor(t * 5) % 2 === 0 ? 'red' : (red ? 'redDk' : 'sage'), 3); P.line(rect(860, 250, 70, 60, 8), 2, 'grey');
    if (red) P.tone(ell(895, 210, 120), 'red', { from: [895, 210, 0.7], to: [1015, 210, 0], radial: true, bbox: [775, 90, 1015, 330] }, 5);
    const gn = wd(L, 1, 'guess'), grey = clamp((t - gn) / 0.6);
    heroFront(P, 430, 230, 0.55, { mouth: t > gn ? 'frown' : 'neutral', look: [0.8, 0], blink: blinkAt(t), brow: t > gn ? 1 : 0 });
    // the badge on its lanyard, held to the reader
    P.line(svg('M400 420 C560 400 700 330 820 290'), 6, 'teal');
    P.both(rect(790, 240, 90, 120, 8), 'cream', 4); P.both(rect(806, 256, 58, 50, 4), 'glass', 2); P.line(svg('M806 324 L864 324 M806 340 L846 340'), 3);
    // the halo, from gold to grey, sinking a little
    const hc = grey > 0.5 ? 'grey' : 'gold';
    P.both(ell(430, 30 + grey * 20, 150, 34), hc, 5); P.line(ell(430, 30 + grey * 20, 120, 24), 2, grey > 0.5 ? 'silver' : 'goldLt');
  }
}
