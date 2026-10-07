// Outro — The Choir (docs/TREATMENT.md). A chapel of arches; a men's choir of engineers, each holding his
// phone up to his face, lit from below. Cables join the phones; he reads its code, cleaner than his; it even
// wrote the tests; the old reviewer finds no nit and caps his red pen; the arches multiply into a nave. On
// "Accept all." every phone turns round to show the same button and he presses his. Then the Valley at sunset:
// he walks up the path and over the ridge as the sun goes down behind it, and the title comes back.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric } from '../paint.js';
import { heroFront, heroWalk } from '../kit/hero.js';
import { person } from '../kit/people.js';
import { lyricBanner, agentAngel, robotaxi, tree, cypress, campus, posterFrame, beatCut } from '../kit/props.js';
import { redPen, scroll, begin, end, star, moon, platter } from '../kit/things.js';
import { fist, sleeveArm } from './verse1.js';

const blinkAt = (t, k = 0) => { const v = (t * 0.41 + k * 0.13) % 1; return v > 0.965 ? 1 - Math.abs(v - 0.982) / 0.017 : 0; };
const sing = (f) => (f.vocal > 0.18 ? 'sing' : 'neutral');

export default function outro(P, f) {
  const t = f.t, ctx = P.ctx;
  const L = ['Glue between', 'cleaner than mine', 'Even wrote the tests', 'not a single nit', 'paradise…', 'Accept all.'].map((q) => f.L.get(q));
  const cuts = [f.start, beatCut(f, L[1]), beatCut(f, L[2]), beatCut(f, L[3]), beatCut(f, L[4]), beatCut(f, L[5]), f.A.timeOfBeat(Math.ceil(f.A.beatAt(L[5].end + 2.4)))];
  let k = 0; for (let i = 1; i < cuts.length; i++) if (t >= cuts[i]) k = i;
  const lt = t - cuts[k];
  const zo = k < 4 ? 1 + 0.04 * ease.out(clamp(lt / 6)) : 1;
  ctx.save(); ctx.translate(800, 450); ctx.scale(zo, zo); ctx.translate(-800, -450);
  if (k === 0) choirWide(P, f, t, lt, L);
  else if (k === 1) readsCode(P, f, t, lt, L);
  else if (k === 2) testsScroll(P, f, t, lt, L);
  else if (k === 3) reviewer(P, f, t, lt, L);
  else if (k === 4) nave(P, f, t, lt, L);
  else if (k === 5) cardStunt(P, f, t, lt, L, cuts[6] - cuts[5]);
  else { ctx.restore(); valleyEnd(P, f, t, lt); return; }
  ctx.restore();
  // the ribbon banner, as in the choruses
  const line = f.L.at(t) && f.L.at(t).start >= L[0].start - 0.5 ? f.L.at(t) : L[0];
  if (k < 6 && !(k === 5 && lt > cuts[6] - cuts[5] - 1.0)) { const refrain = /paradise/i.test(line.text); lyricBanner(P, f, line, 800, 806, { size: 46, tail: refrain ? 'goldLt' : 'roseLt' }); }
}

// ---- the chapel and the choir ------------------------------------------------------------------------------------
function chapel(P, f, t, depth = 1, withFloor = true) {
  P.fill(rect(0, 0, W, H), 'night');
  // arches receding: depth > 1 multiplies them into a nave
  const n = Math.round(3 + (depth - 1) * 6);
  for (let i = 0; i < n; i++) {   // outermost first, so the inner arches show through, receding
    const s = Math.pow(0.8, i), w = 1500 * s, h = 980 * s, x = 800 - w / 2, y = 470 - h * 0.55;
    const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w * 0.35); p.ellipse(800, y + w * 0.35, w / 2, w * 0.35, 0, Math.PI, 2 * Math.PI); p.lineTo(x + w, y + h);
    const fp = new Path2D(p); fp.closePath();
    P.fill(fp, i % 2 ? 'tealDk' : 'night'); P.line(p, Math.max(2, 16 * s)); P.line(p, Math.max(1.5, 10 * s), 'gold');
  }
  // the floor: a tiled aisle in perspective; the arches' feet stand on its edges
  const floor = svg('M800 470 L31 922 L1569 922 Z');
  if (withFloor) {
  P.fill(floor, 'charDk');
  P.ctx.save(); P.clip(floor);
  for (let k = -10; k <= 10; k++) P.line(svg(`M800 470 L${800 + k * 150} 922`), 1.5, 'sepiaDk');
  for (let k = 1; k < 9; k++) { const yy = 470 + 452 * Math.pow(k / 8, 1.6); P.line(svg(`M0 ${yy} L1600 ${yy}`), 1.5, 'sepiaDk'); }
  P.fill(svg('M800 470 L690 922 L910 922 Z'), 'redDk'); P.line(svg('M800 470 L690 922 M800 470 L910 922'), 2, 'gold');
  P.ctx.restore();
  P.line(svg('M800 470 L31 922 M800 470 L1569 922'), 3);
  }
  // candles turned to screens: a warm glow from below
  P.tone(rect(0, 0, W, H), 'goldLt', { from: [800, 760, 0.55], to: [800, 200, 0], bbox: [0, 0, W, H] }, 8);
}
function choir(P, f, t, o = {}) {
  const rows = [
    { y: 300, s: 0.2, n: 9, dx: 150 }, { y: 400, s: 0.26, n: 7, dx: 190 }, { y: 520, s: 0.32, n: 6, dx: 230 },
  ];
  const tops = ['hoodie', 'tee', 'shirt', 'hoodie', 'tee', 'vest', 'hoodie', 'turtleneck', 'tee'];
  const cols = ['navy', 'plum', 'shirt', 'teal', 'ochre', 'char', 'rose', 'black', 'sage'];
  // who sings, row by row (k = row * 9 + seat): [hair, colour, skin, a woman]
  const cast = [
    ['short', 'hair', 'skin'], ['wavy', 'hairBr', 'skin2', true], ['messy', 'hairBl', 'skin'], ['buzz', 'hair', 'skin5'], ['bob', 'hair', 'skin4', true], ['side', 'hairBr', 'skin3'], ['slick', 'hairGr', 'skin'], ['ponytail', 'hairAu', 'skin2', true], ['short', 'hair', 'skin3'],
    ['side', 'hairBl', 'skin2'], ['bun', 'hair', 'skin3', true], ['buzz', 'hairBr', 'skin4'], null, ['messy', 'hair', 'skin'], ['side', 'hairAu', 'skin'], ['bald', 'hair', 'skin3'], null, null,
    ['short', 'hairBr', 'skin'], ['ponytail', 'hair', 'skin4', true], ['side', 'hair', 'skin5'], ['bob', 'hairAu', 'skin2', true], ['messy', 'hairBr', 'skin3'], ['short', 'hairBl', 'skin2'],
  ];
  const phones = [];
  rows.forEach((r, ri) => {
    const row = [];
    for (let i = 0; i < r.n; i++) {
      const x = 800 + (i - (r.n - 1) / 2) * r.dx, k = ri * 9 + i;
      if (ri >= 1 && Math.abs(x - 800) < 60) continue;   // the hero's place (and the seat behind his hood)
      const sway = Math.sin(t * 1.5 + k) * 4;
      const [hair, hairColor, skin, fem] = cast[k];
      person(P, x + sway, r.y, r.s, { hair, hairColor, skin, fem, top: tops[(k + ri) % 9], color: cols[(k * 3 + ri) % 9], arms: 'phone', uplit: 0.75, look: [0, 0.6], mouth: f.vocal > 0.18 && (k % 3) ? 'sing' : 'neutral', open: f.vocal, crop: 700, blink: blinkAt(t, k), glasses: ['none', 'round', 'rect'][k % 3], screen: o.screen, press: false });
      row.push([x + sway, r.y + 290 * r.s, r.s]);
    }
    if (ri === 2 && o.hero) { o.hero(); if (o.heroPhone) { row.push(o.heroPhone); row.sort((a, b) => a[0] - b[0]); } }
    // glue between the agents' lines: a garland of cable along the row, phone to phone, lighting up in turn;
    // the next row stands in front of it
    if (o.cables) for (let i = 0; i < row.length - 1; i++) {
      const u = clamp(o.cables(ri * 8 + i)); if (u <= 0) continue;
      const [x1, y1, s1] = row[i], [x2, y2] = row[i + 1], sag = 110 * s1 / 0.26;
      const p = new Path2D(); p.moveTo(x1, y1 + 40 * s1); p.quadraticCurveTo((x1 + x2) / 2, y1 + sag, lerp(x1, x2, u), lerp(y1, y2, u) + 40 * s1 + (u < 1 ? Math.sin(u * Math.PI) * sag * 0.5 : 0));
      P.line(p, 7); P.line(p, 4, u >= 1 ? 'goldLt' : 'cream');
    }
    stall(P, r, ri === 2);
    phones.push(...row);
  });
  return phones;
}

/** the carved front of a choir stall along a row: dark wood, cusped arcading, a gold rail */
function stall(P, r, front) {
  const k = r.s / 0.26, y0 = r.y + 560 * r.s, x0 = 40, x1 = 1560, ph = front ? 980 - y0 : 230 * k;
  const panel = rect(x0, y0, x1 - x0, ph);
  P.fill(panel, 'sepiaDk'); P.tone(panel, '#000', { from: [800, y0, 0.1], to: [800, y0 + 160 * k, 0.45], bbox: [x0, y0, x1, y0 + ph] }, Math.max(4, 7 * k));
  const aw = 60 * k, gap = 16 * k, top = y0 + 26 * k, ah = 96 * k;
  for (let x = x0 + 14 * k; x + aw < x1; x += aw + gap) {
    const a = new Path2D(); a.moveTo(x, top + ah); a.lineTo(x, top + aw * 0.6); a.quadraticCurveTo(x, top, x + aw / 2, top - aw * 0.08); a.quadraticCurveTo(x + aw, top, x + aw, top + aw * 0.6); a.lineTo(x + aw, top + ah);
    P.line(a, Math.max(1.5, 3 * k), 'ochre'); P.both(ell(x + aw / 2, top + aw * 0.42, aw * 0.12), 'ochre', Math.max(1, 1.5 * k));
  }
  P.line(svg(`M${x0} ${y0} L${x1} ${y0}`), 16 * k + 5); P.line(svg(`M${x0} ${y0} L${x1} ${y0}`), 12 * k, 'gold');
}
function choirWide(P, f, t, lt, L) {
  chapel(P, f, t);
  const g0 = L[0].words[0].start;
  choir(P, f, t, { cables: (i) => (t - g0 - (i % 8) * 0.14 - Math.floor(i / 8) * 0.3) / 0.4, heroPhone: [800, 470 + 290 * 0.42, 0.42],
    hero: () => heroFront(P, 800, 470, 0.42, { hold: 'phone', uplit: 0.8, look: [0, 0.6], mouth: sing(f), open: f.vocal, blink: blinkAt(t) }) });
}

// ---- he reads its code: cleaner than his ---------------------------------------------------------------------------
function readsCode(P, f, t, lt, L) {
  chapel(P, f, t);
  P.fill(rect(0, 0, W, H), 'night'); P.tone(rect(0, 0, W, H), 'goldLt', { from: [800, 700, 0.5], to: [800, 100, 0], bbox: [0, 0, W, H] }, 8);
  const cl = L[1].words.find((w) => w.w.startsWith('cleaner')).start;
  // two cards float up: its code, neat; his, a tangle
  const u = ease.outCubic(clamp(lt / 0.6)), v = ease.outCubic(clamp((t - cl + 0.2) / 0.6));
  card(P, 330, 330 - 30 * u, u, 'ITS', (P2) => { for (let i = 0; i < 8; i++) P2.line(svg(`M-120 ${-110 + i * 30} l${[200, 160, 220, 120, 180, 210, 140, 190][i]} 0`), 8, ['teal', 'sage', 'gold', 'rose'][i % 4]); });
  card(P, 1270, 330 - 30 * v, v, 'MINE', (P2) => { const r = rng(4); for (let i = 0; i < 8; i++) { const p = new Path2D(); p.moveTo(-120 + r() * 40, -110 + i * 30); for (let k = 0; k < 5; k++) p.lineTo(-100 + k * 50 + r() * 30, -110 + i * 30 + (r() - 0.5) * 20); P2.line(p, 6, ['rose', 'grey', 'ochre'][i % 3]); } P2.text('// TODO', 0, 140, { font: FONT.mono, size: 24, weight: 700, color: 'red' }); });
  heroFront(P, 800, 344, 0.82, { hold: 'phone', uplit: 0.9, look: [t > cl ? (Math.sin(t * 2) > 0 ? -0.8 : 0.8) : 0, 0.6], brow: t > cl ? 1 : 0, mouth: t > cl + 1 ? 'frown' : sing(f), open: f.vocal, blink: blinkAt(t) });
}
function card(P, x, y, a, title, draw) {
  if (a <= 0) return;
  const ctx = P.ctx; ctx.save(); P.alpha(a); ctx.translate(x, y);
  P.both(rect(-170, -170, 340, 360, 14), 'ivory', 4); P.line(rect(-160, -160, 320, 340, 10), 1.5);
  P.text(title, 0, -126, { font: FONT.caps, weight: 700, size: 30, tracking: 6 });
  draw(P); ctx.restore();
}

// ---- even wrote the tests this time ---------------------------------------------------------------------------------
function testsScroll(P, f, t, lt, L) {
  chapel(P, f, t, 1, false);
  const u = ease.outCubic(clamp(lt / 1.6));
  const names = ['parses empty input', 'handles leap years', 'rejects bad tokens', 'survives the race', 'is idempotent', 'round-trips UTF-8', 'times out politely', 'never divides by zero', 'retries twice', 'keeps its promise', 'asserts true is true'];
  const shown = (i) => lt > 0.5 + i * 0.22 + (i === 10 ? 0.6 : 0);
  scroll(P, 1120, 110, 420, 620, { unroll: u, title: 'TESTS', titleSize: 30, align: 'left', size: 22, lineH: 46, lines: names.map((n, i) => (shown(i) ? n : '')), ink: 'sageDk' });
  names.forEach((n, i) => { if (shown(i) && 194 + i * 46 < 110 + 620 * u) P.line(svg(`M920 ${186 + i * 46} l6 8 l12 -16`), 4, 'sageDk'); });
  heroFront(P, 520, 380, 0.78, { hold: 'phone', uplit: 0.9, look: [0.6, 0.4], mouth: sing(f), open: f.vocal, blink: blinkAt(t) });
  if (u > 0.9) { P.ctx.save(); P.alpha(clamp((lt - 3.2) / 0.4)); P.both(rect(980, 690, 280, 60, 30), 'sage', 4); P.text('11 passed', 1120, 732, { font: FONT.mono, size: 30, weight: 700, color: 'cream' }); P.ctx.restore(); }
}

// ---- not a single nit to find: the old reviewer searches and caps his pen ---------------------------------------------
function reviewer(P, f, t, lt, L) {
  chapel(P, f, t, 1, false);
  const fd = L[3].words.find((w) => w.w.startsWith('find')).start;
  platter(P, 800, 260, 300);
  person(P, 800, 300, 0.62, { hair: 'unix', hairColor: 'hairSp', beard: 'unix', top: 'robe', color: 'navy', mantle: 'red', stern: t < fd + 0.4, mouth: t > fd + 0.4 ? 'flat' : 'frown', glasses: 'rect', fw: 1.06, crop: 900, look: [Math.sin(lt * 2.4) * 0.8, 0.5], blink: blinkAt(t) });
  // the magnifying glass sweeps over the code, finding nothing
  const mx = 640 + Math.sin(lt * 2.4) * 220, my = 600 + Math.cos(lt * 1.7) * 20;
  P.both(rect(380, 560, 840, 200, 8), 'ivory', 4);
  for (let i = 0; i < 5; i++) P.line(svg(`M420 ${598 + i * 32} l${[600, 520, 700, 460, 640][i]} 0`), 8, ['teal', 'sage', 'gold', 'rose', 'teal'][i]);
  P.ctx.save(); P.ctx.translate(mx, my); P.both(ell(0, 0, 80), 'glass', 6); P.ctx.save(); P.alpha(0.4); P.fill(ell(-20, -20, 30, 18), 'cream'); P.ctx.restore(); P.line(svg('M56 56 L130 130'), 22); P.line(svg('M56 56 L130 130'), 14, 'ochre'); P.ctx.restore();
  // his hands: the right holds the magnifier by its handle, the left his red pen (his arms reach from his shoulders)
  sleeveArm(P, [mx + 118, my + 118], [690, 520], 0.62, 'navy', -1);
  redPen(P, 1230, 380, 0.62, 0.1, 0);
  sleeveArm(P, [1232, 470], [930, 520], 0.62, 'navy', 1, { flip: true });
  // not a nit: LGTM stamped on the code
  const st = clamp((t - fd - 0.2) / 0.18);
  if (st > 0) { const sq = 1 + 1.6 * (1 - st); P.ctx.save(); P.ctx.translate(1060, 668); P.ctx.rotate(-0.2); P.ctx.scale(sq, sq); P.alpha(0.92 * st); P.line(ell(0, 0, 96, 58), 7, 'red'); P.line(ell(0, 0, 84, 48), 2.5, 'red'); P.text('LGTM', 0, 15, { font: FONT.caps, weight: 700, size: 44, color: 'red' }); P.ctx.restore(); }
}

// ---- the nave: the arches multiply ------------------------------------------------------------------------------------
function nave(P, f, t, lt, L) {
  const d = 1 + ease.inOutCubic(clamp(lt / 3.2));
  chapel(P, f, t, d);
  const z = 1 / (1 + (d - 1) * 0.9);
  P.ctx.save(); P.ctx.translate(800, 470); P.ctx.scale(z, z); P.ctx.translate(-800, -470);
  choir(P, f, t, { hero: () => heroFront(P, 800, 470, 0.42, { hold: 'phone', uplit: 0.8, look: [0, 0.6], mouth: sing(f), open: f.vocal, blink: blinkAt(t) }) });
  P.ctx.restore();
}

// ---- Accept all.: every phone turns round to show the same button; he presses his ---------------------------------------
function cardStunt(P, f, t, lt, L, dur) {
  chapel(P, f, t, 1.4);
  const ac = L[5].words[0].start, turned = t > ac - 0.05, press = t > L[5].words[1].start;
  const zz = 1 + 0.65 * ease.outCubic(clamp((t - ac + 0.15) / 0.5));
  P.ctx.save(); P.ctx.translate(800, 640); P.ctx.scale(zz, zz); P.ctx.translate(-800, -640);
  choir(P, f, t, { screen: turned, hero: () => heroFront(P, 800, 470, 0.42, { hold: 'phone', uplit: 0.8, look: [0, 0.6], mouth: 'neutral', blink: blinkAt(t), screen: turned, press, pressK: clamp((t - L[5].words[1].start) / 0.6) }) });
  P.ctx.restore();
  if (press) { const k = clamp((t - L[5].words[1].start) / 0.5); P.ctx.save(); P.alpha((1 - k) * 0.8); P.fill(rect(0, 0, W, H), 'cream'); P.ctx.restore(); }
  // then the arch closes in on the light
  const cl = clamp((lt - (dur - 1.0)) / 0.9);
  if (cl > 0) { P.ctx.save(); P.alpha(ease.inOutCubic(cl)); P.fill(rect(0, 0, W, H), 'night'); P.ctx.restore(); }
}

// ---- the Valley at dusk: he walks up the path and over the ridge, into the setting sun --------------------------------
// The hour is one parameter of time: the sun sinks behind the far ridge, the sky goes from gold to plum to night, and
// the land is printed in the light of the moment: every palette colour multiplied by it (lit), so it warms, then darkens,
// as one flat poster would. Sky and sun keep their own colours. He walks at one steady pace, his feet keeping step with
// the ground, smaller as he climbs, and goes over the crest just as the sun does.
const rgb = (c) => { const h = (C[c] ?? c).slice(1); return [0, 2, 4].map((i) => parseInt(h.length === 3 ? h[i / 2] + h[i / 2] : h.slice(i, i + 2), 16) / 255); };
const hex = (v) => '#' + v.map((x) => Math.round(clamp(x) * 255).toString(16).padStart(2, '0')).join('');
const hour = (ks, t) => {   // keyframes [[t, value]] of colours, [r, g, b] or numbers, eased between
  let i = 1; while (i < ks.length - 1 && t > ks[i][0]) i++;
  const [t0, a] = ks[i - 1], [t1, b] = ks[i], k = ease.inOutSine(clamp((t - t0) / (t1 - t0)));
  if (typeof a === 'string') { const p = rgb(a), q = rgb(b); return hex(p.map((v, j) => lerp(v, q[j], k))); }
  return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], k)) : lerp(a, b, k);
};
function lit(L, draw) {   // draw with the whole palette lit by L = [r, g, b]
  const saved = { ...C };
  try { for (const k in saved) C[k] = hex(rgb(saved[k]).map((v, i) => v * L[i])); draw(); } finally { Object.assign(C, saved); }
}
const LAND = [[0, [1.0, 0.97, 0.9]], [3, [1.0, 0.86, 0.68]], [6.5, [0.9, 0.62, 0.5]], [9.2, [0.54, 0.4, 0.45]], [11.5, [0.3, 0.26, 0.37]]];
const SUN = [[0, [1, 1, 1]], [4, [1, 0.88, 0.72]], [7, [1, 0.68, 0.5]], [9.3, [0.95, 0.5, 0.38]]];
const SKY = [[0, '#f0d9a8'], [4, '#efc39a'], [7, '#d98f7f'], [9.2, '#7f5266'], [11.5, '#2b293d']];
const TOP = [[0, '#d2a74e'], [4, '#d9895f'], [7, '#a85a6a'], [9.2, '#3a2a48'], [11.5, '#15141f']];   // the tone from the top of the sky: the intro's gold, then dusk
const GLOW = [[0, '#e6c77f'], [4, '#f0a860'], [7, '#e8743f'], [9.2, '#c24a36'], [11.5, '#5e2a36']];
const RIDGE = 'M-100 560 C200 470 420 500 640 520 C900 545 1100 470 1700 520';   // the far hill's crest; the sun sets behind it
const ABOVE_RIDGE = 'M-100 -20 L1700 -20 L1700 520 C1100 470 900 545 640 520 C420 500 200 470 -100 560 Z';
const SUN_X = 1120, SUN_R = 250, sunY = (lt) => 470 + 31 * lt;   // it starts where the intro's dawn had it, half behind the ridge; gone by ~9.3 s
// his path: along the lane, up the hill and over the crest under the sun (x always increasing, so he never turns round);
// each sample keeps its scale (smaller as he climbs away) and the distance walked to reach it in the figure's own units
const WALK = (() => {
  const cub = (a, b, c, d, u) => { const v = 1 - u; return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d; };
  const pts = [];
  for (let i = 0; i <= 240; i++) { const u = i / 240, y = cub(760, 764, 590, 507.5, u); pts.push([cub(430, 780, 900, 1100, u), y, 0.46 * (y - 473.9) / 286.1]); }   // on the lane at the intro's size
  const crest = pts.length - 1, sc = pts[crest][2];
  for (let i = 1; i <= 60; i++) { const v = i / 60; pts.push([1100 + 44 * v, 507.5 + 70 * v * (0.6 + 0.4 * v), sc * (1 - 0.3 * v)]); }   // down the far side, out of sight
  pts[0].push(0);
  for (let i = 1; i < pts.length; i++) { const [x0, y0, s0] = pts[i - 1], [x1, y1, s1] = pts[i]; pts[i].push(pts[i - 1][3] + Math.hypot(x1 - x0, y1 - y0) / ((s0 + s1) / 2)); }
  return { pts, crest };
})();
const STRIDE = 820, CREST_AT = 7.0;   // heroWalk's planted foot covers 820 units per cycle; he reaches the crest at 7 s
const CADENCE = WALK.pts[WALK.crest][3] / (STRIDE * CREST_AT);   // walk cycles per second, steady from the first frame
function walkAt(lt) {   // [x, y, scale, past the crest] after lt seconds of walking
  const d = STRIDE * CADENCE * lt, Q = WALK.pts; let lo = 0, hi = Q.length - 1;
  if (d >= Q[hi][3]) return [Q[hi][0], Q[hi][1], Q[hi][2], true];
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (Q[m][3] <= d) lo = m; else hi = m; }
  const k = (d - Q[lo][3]) / (Q[hi][3] - Q[lo][3]);
  return [lerp(Q[lo][0], Q[hi][0], k), lerp(Q[lo][1], Q[hi][1], k), lerp(Q[lo][2], Q[hi][2], k), lo >= WALK.crest];
}

function valleyEnd(P, f, t, lt) {
  const ctx = P.ctx, L = hour(LAND, lt), sy = sunY(lt);
  // the sky: the intro's sky at first (its gold tone from the top), then that tone turning to dusk and night as it
  // thickens, and a glow on the horizon round the sinking sun
  P.fill(rect(0, 0, W, H), hour(SKY, lt));
  P.tone(rect(0, 0, W, 520), hour(TOP, lt), { from: [800, 0, hour([[0, 0.45], [4, 0.45], [7, 0.5], [9.2, 0.62], [11.5, 0.85]], lt)], to: [800, 520, 0], bbox: [0, 0, W, 520] }, 8);
  const gw = hour([[0, 0], [3, 0.55], [6.5, 0.8], [9.2, 0.5], [11.5, 0.2]], lt);
  if (gw > 0.04) P.tone(rect(0, 0, W, 600), hour(GLOW, lt), { from: [SUN_X, 520, gw], to: [SUN_X + 1000, 520, 0], radial: true, bbox: [0, 0, W, 600] }, 8);
  const night = clamp((lt - 7.6) / 2.2);   // the stars and a new moon come out once the sun is down
  if (night > 0) { ctx.save(); P.alpha(night); const r = rng(3); for (let i = 0; i < 16; i++) star(P, r() * W, 30 + r() * 300, 5, t * 2 + i); moon(P, 250, 150, 34); ctx.restore(); }
  // the sun, the great halo of the intro's dawn, reddening as it sinks behind the far ridge
  const sunFade = clamp((9.4 - lt) / 1.0);
  if (sunFade > 0) lit(hour(SUN, lt), () => { P.halo(SUN_X, sy, SUN_R, ['', '', '', '', '', '', '', '', '', '', '', ''], t * 0.05, 0.5 * sunFade); ctx.save(); P.alpha(sunFade); P.beads(SUN_X, sy, SUN_R + 35, 36, 6, 'goldLt', f.kick); ctx.restore(); });
  // the land in the light of the hour
  const [px, py, hs, over] = walkAt(lt);
  lit(L, () => {
    P.both(svg(`${RIDGE} L1700 900 L-100 900 Z`), 'hill', 4);   // the intro's hills, lane and trees, in the evening light
    campus(P, 380, 532, 0.5);
    // his path, drawn in two stretches so the layers fall right: the far one climbs the far hill to the crest and goes
    // under the road (the road runs on across it, the robo-taxi drives over it); the near one comes up from the lane
    // over the brow of the near hill. Each band narrows as it climbs away.
    const pts = WALK.pts, into = pts.findIndex((q) => q[1] < 740);
    const band = (outlineClip, fillClip) => {
      ctx.save(); P.clip(outlineClip); for (let i = into; i < WALK.crest; i += 6) { const a = pts[i], b = pts[Math.min(WALK.crest, i + 7)]; P.line(svg(`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`), 200 * a[2] + 5); } ctx.restore();
      ctx.save(); P.clip(fillClip); for (let i = into; i < WALK.crest; i += 6) { const a = pts[i], b = pts[Math.min(WALK.crest, i + 7)]; P.line(svg(`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`), 200 * a[2], 'cream'); } ctx.restore();
    };
    band(rect(-50, -50, W + 100, 750), rect(-50, -50, W + 100, 750));   // (the near hill hides its lower part)
    // the road along the ridge, and the robo-taxi gliding along it the other way, five stars on its door
    P.fill(rect(-20, 566, W + 40, 16), 'sepia'); P.line(svg('M-20 566 L1620 566 M-20 582 L1620 582'), 2.5);
    const rx = lerp(1750, -250, clamp((lt - 0.3) / 3.6));
    if (rx > -240 && rx < 1740) { robotaxi(P, rx, 578, 0.3, t, -1); P.both(rect(rx - 44, 578 - 0.3 * 150, 88, 22, 6), 'cream', 2); P.text('★★★★★', rx, 578 - 0.3 * 150 + 16, { size: 15, color: 'gold' }); }
    const NEAR = 'M-100 640 C300 590 600 620 900 630 C1200 640 1400 600 1700 620', near = svg(`${NEAR} L1700 900 L-100 900 Z`);
    P.both(near, 'sage', 4); P.tone(near, 'hoodDot', { from: [800, 620, 0], to: [800, 900, 0.35], bbox: [0, 580, W, H] }, 7);
    tree(P, 150, 650, 0.9, 2); cypress(P, 250, 655, 0.8); cypress(P, 1290, 640, 0.7); tree(P, 1420, 645, 0.8, 5);
    for (let x = -40; x < W + 80; x += 70) P.line(svg(`M${x} 690 l6 -16 M${x + 8} 690 l2 -20 M${x + 16} 690 l-4 -14`), 2, 'sageDk');
    P.both(rect(-20, 700, W + 40, 70), 'cream', 4); P.tone(rect(-20, 700, W + 40, 70), 'skinDot', { from: [0, 700, 0.0], to: [0, 770, 0.35], bbox: [0, 700, W, 770] }, 6);
    // the near stretch, on the near hill only, cut square at the lane's edge with its fill just covering the edge line
    band(svg(`${NEAR} L1700 702 L-100 702 Z`), svg(`${NEAR} L1700 705 L-100 705 Z`));
  });
  // he walks at a steady pace, backlit into a silhouette as he nears the sun; past the crest only what is above it shows
  lit(L.map((v) => v * lerp(1, 0.35, clamp((lt - 2.5) / 4.5))), () => {
    ctx.save(); if (over) ctx.clip(svg(ABOVE_RIDGE));
    heroWalk(P, px, py, hs, Math.PI * 2 * CADENCE * lt, { hood: 'teal' });
    ctx.restore();
  });
  // the campus works on into the night: its windows light up one by one
  if (lt > 8.2) { const r = rng(11); ctx.save(); ctx.translate(380, 532); ctx.scale(0.5, 0.5); for (let fl = 0; fl < 2; fl++) for (let k = 0; k < 12; k++) { const on = clamp((lt - 8.2 - r() * 2.2) / 0.25), dark = r() < 0.25; if (on <= 0 || dark || (fl === 1 && (k === 5 || k === 6))) continue; ctx.save(); P.alpha(on); P.fill(rect(-200 + k * 34 + (k ? 4 : 3), -166 + fl * 84, k ? 26 : 25, 76), 'goldLt'); ctx.restore(); } ctx.restore(); }
  // the fence, nearest and darkest
  lit(L.map((v) => v * 0.82), () => {
    for (let x = -40; x < W + 160; x += 160) P.both(rect(x - 11, 770, 22, 130, 6), 'cream', 3);
    P.both(rect(-20, 800, W + 40, 14, 4), 'cream', 3); P.both(rect(-20, 846, W + 40, 14, 4), 'cream', 3);
  });
  posterFrame(P);
  // the title, unfurling; the credit
  const un = ease.outCubic(clamp((lt - 1.2) / 2.0));
  if (un > 0) { ctx.save(); ctx.translate(800, 110); const bw = 900 * un; P.banner(-bw / 2, -56, bw, 112, { tail: 'goldLt' }); P.clip(rect(-bw / 2 + 14, -70, Math.max(0, bw - 28), 140)); P.text('ENGINEER’S PARADISE', 0, 24, { size: 68, tracking: 2 }); ctx.restore(); }
  if (lt > 3.6) { ctx.save(); P.alpha(clamp((lt - 3.6) / 1.0)); const cr = 'after “Gangsta’s Paradise” (Coolio), by way of “Amish Paradise” (“Weird Al” Yankovic)', cw = P.measure(cr, { size: 26, style: 'italic' }) + 50; P.both(rect(800 - cw / 2, 186, cw, 46, 8), 'cream', 3); P.text(cr, 800, 218, { size: 26, style: 'italic' }); ctx.restore(); }
  if (lt > 6.4) { ctx.save(); P.alpha(clamp((lt - 6.4) / 1.0)); const nt = 'No tests were deleted in the making of this video.', nw = P.measure(nt, { size: 24, style: 'italic' }) + 46; P.both(rect(800 - nw / 2, 244, nw, 42, 8), 'ivory', 3); P.text(nt, 800, 273, { size: 24, style: 'italic' }); ctx.restore(); }
  // fade to black at the very end
  const fo = clamp((t - (f.end - 2.2)) / 2.0);
  if (fo > 0) { ctx.save(); P.alpha(fo); P.fill(rect(0, 0, W, H), 'black'); ctx.restore(); }
}
