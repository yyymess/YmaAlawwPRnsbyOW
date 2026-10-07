// Verse 3 — The Horseless Carriage (docs/TREATMENT.md). The AI era, staged: a Mucha proscenium whose
// curtains close and open between couplets like a keynote changing slides. The lyric is on the plaque of
// the stage's apron. The keynote; the Emacs hook and TAB TAB TAB; the ghost town and the talking duck; the
// tests falling like leaves; the ladder and the nine agents; laid off to a stall at the farmers' market.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric } from '../paint.js';
import { heroFront, heroPose, heroWalk } from '../kit/hero.js';
import { person } from '../kit/people.js';
import { agentAngel, token, cherryTree, petal } from '../kit/props.js';
import { begin, end, quill, scroll, star, globe, drawHand, cardboardBox, mug, snakePlant } from '../kit/things.js';
import { duck, heart, cloud } from './verse1.js';

const SCENES = [
  { lines: ['model learned to code', 'hottest language now'], draw: keynote },
  { lines: ['Twenty years of Emacs', 'tab, tab, tab'], draw: emacs },
  { lines: ["Stack Overflow's a ghost", 'rubber duck talks back'], draw: ghostTown },
  { lines: ['Asked it nicely', 'build is green forever'], draw: tests },
  { lines: ["New grads can't get hired", 'nine agents in tmux'], draw: ladder },
  { lines: ['Got laid off in the spring', 'a stall at the farmers'], draw: spring },
  { lines: ['Small-batch, organic', 'every bug is hand-crafted'], draw: market },
];
const OX = 120, OY = 70, OW = 1360, OH = 620;   // the proscenium's opening

export default function verse3(P, f) {
  const t = f.t, ctx = P.ctx;
  const sc = SCENES.map((s) => ({ ...s, L: s.lines.map((q) => f.L.get(q)) }));
  const T = sc.map((s) => s.L[0].words[0].start);
  let k = 0; for (let i = 1; i < sc.length; i++) if (t >= T[i] - 0.12) k = i;
  // the curtains close before each new couplet and open on its first word
  let shut = 0;
  for (let i = 1; i < sc.length; i++) { const a = Math.max(sc[i - 1].L[1].end - 0.05, T[i] - 0.6), m = T[i] - 0.12, b = T[i] + 0.4; if (t > a && t < b) shut = t < m ? ease.inOutCubic((t - a) / (m - a)) : 1 - ease.inOutCubic((t - m) / (b - m)); }
  if (t < f.start + 0.6) shut = Math.max(shut, 1 - ease.inOutCubic(clamp((t - f.start) / 0.6)));
  P.fill(rect(0, 0, W, H), 'night');
  // the scene on stage
  const zs = 1 + 0.05 * ease.out(clamp((t - (T[k] - 0.12)) / 6.5));
  ctx.save(); P.clip(rect(OX, OY, OW, OH)); ctx.translate(OX + OW / 2, OY + OH * 0.55); ctx.scale(zs, zs); ctx.translate(-OW / 2, -OH * 0.55);
  sc[k].draw(P, f, sc[k].L, t, OW, OH);
  ctx.restore();
  stage(P, f, shut);
  // the plaque on the apron
  const [a, b] = sc[k].L, line = t >= b.start - 0.4 ? b : a;
  const by = 790;
  P.both(svg(`M220 ${by - 62} L1380 ${by - 62} L1420 ${by} L1380 ${by + 62} L220 ${by + 62} L180 ${by} Z`), 'gold', 4);
  P.both(svg(`M236 ${by - 50} L1364 ${by - 50} L1396 ${by} L1364 ${by + 50} L236 ${by + 50} L204 ${by} Z`), 'cream', 2);
  lyric(P, line, t, 800, by + 15, { size: 40, maxW: 1100, always: true, lead: 0.5 });
}

function stage(P, f, shut) {
  const ctx = P.ctx, t = f.t;
  // the floor of the stage and its footlights
  P.both(rect(OX - 20, OY + OH - 8, OW + 40, 40, 4), 'ochre', 4);
  for (let i = 0; i < 9; i++) { const x = OX + 80 + i * 150; P.tone(ell(x, OY + OH + 4, 60, 30), 'goldLt', { from: [x, OY + OH, 0.8], to: [x + 60, OY + OH, 0], radial: true, bbox: [x - 60, OY + OH - 30, x + 60, OY + OH + 30] }, 5); P.both(svg(`M${x - 20} ${OY + OH + 12} C${x - 20} ${OY + OH - 8} ${x + 20} ${OY + OH - 8} ${x + 20} ${OY + OH + 12} Z`), 'gold', 3); }
  // the curtains: drawn to the sides, or closed over the stage between couplets
  for (const sd of [-1, 1]) {
    const edge = sd < 0 ? lerp(OX + 60, 800, shut) : lerp(OX + OW - 60, 800, shut), outer = sd < 0 ? -20 : W + 20;
    const p = new Path2D(); p.moveTo(outer, 0); p.lineTo(edge, 0);
    for (let y = 0; y <= 720; y += 40) p.lineTo(edge + sd * (Math.sin(y * 0.02 + t) * 6 - (1 - shut) * y * 0.06), y);
    p.lineTo(outer, 720); p.closePath();
    P.fill(p, 'redDk'); P.tone(p, '#000', { from: [edge, 0, 0], to: [outer, 0, 0.5], bbox: [Math.min(edge, outer), 0, Math.max(edge, outer), 720] }, 7); P.line(p, 4);
    for (let i = 1; i < 6; i++) { const x = lerp(outer, edge, i / 6); P.line(svg(`M${x} 30 C${x + sd * 10} 300 ${x - sd * 10} 500 ${x + sd * 6} 720`), 2, 'red'); }
    P.both(svg(`M${edge - sd * 40} 420 C${edge - sd * 20} 440 ${edge - sd * 10} 470 ${edge - sd * 30} 500`), 'gold', 4);
  }
  // the valance with gold fringe, and the gold arch of the proscenium
  P.both(svg('M0 0 L1600 0 L1600 70 C1400 110 1200 80 1000 100 C900 110 700 110 600 100 C400 80 200 110 0 70 Z'), 'redDk', 4);
  for (let x = 20; x < 1600; x += 34) P.line(svg(`M${x} ${86 + Math.sin(x) * 10} l0 26`), 5, 'gold');
  P.line(svg('M0 70 C200 110 400 80 600 100 C700 110 900 110 1000 100 C1200 80 1400 110 1600 70'), 6, 'gold');
  P.both(ell(800, 40, 70, 34), 'gold', 4); P.text('A·I', 800, 54, { font: FONT.caps, weight: 700, size: 34 });
}

const wd = (L, i, q) => L[i].words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9'-]/g, '').startsWith(q)).start;
const blinkAt = (t) => { const k = (t * 0.41) % 1; return k > 0.965 ? 1 - Math.abs(k - 0.982) / 0.017 : 0; };
const sing = (f) => (f.vocal > 0.18 ? 'sing' : 'neutral');
function backdrop(P, w, h, top, bottom) { P.fill(rect(-10, -10, w + 20, h + 20), top); P.tone(rect(-10, -10, w + 20, h + 20), bottom, { from: [w / 2, 0, 0], to: [w / 2, h, 0.55], bbox: [0, 0, w, h] }, 8); }

// ---- 1. the keynote: the model codes on the big screen; the code turns into English; the braces fall ------------
function keynote(P, f, L, t, w, h) {
  const ctx = P.ctx;
  backdrop(P, w, h, 'night', 'navy');
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.25; ctx.save(); P.alpha(0.12); P.fill(svg(`M680 700 L${680 + Math.cos(a - 0.06) * 900} ${700 + Math.sin(a - 0.06) * 900} L${680 + Math.cos(a + 0.06) * 900} ${700 + Math.sin(a + 0.06) * 900} Z`), 'cream'); ctx.restore(); }
  // the screen
  P.both(rect(300, 40, 760, 430, 10), 'black', 5);
  const scr = rect(318, 58, 724, 394, 4); P.fill(scr, 'night');
  ctx.save(); P.clip(scr);
  const en = wd(L, 1, 'english'), ho = wd(L, 1, 'hottest') - 0.2;
  const code = ['fn main() {', '  let x = parse(argv)?;', '  for i in 0..n {', '    acc += f(i);', '  }', '  emit(acc);', '}'];
  const eng = ['make me an app', 'that does the thing', 'but faster', 'and make it pop', 'thanks!', '', ''];
  code.forEach((c, i) => {
    const u = clamp((t - ho - i * 0.18) / 0.5), s2 = u < 0.5 ? c : eng[i];
    ctx.save(); P.alpha(u < 0.5 ? 1 - u * 2 : (u - 0.5) * 2);
    P.text(s2, 360, 120 + i * 46, { font: u < 0.5 ? FONT.mono : FONT.display, size: u < 0.5 ? 28 : 38, weight: 600, align: 'left', color: u < 0.5 ? 'mint' : 'cream' });
    ctx.restore();
  });
  agentAngel(P, 940, 150 + Math.sin(t * 1.6) * 6, 0.45, t);
  ctx.restore();
  // as each line turns into English its punctuation drops off the screen and piles up below it: guess which language we lose
  const rr = rng(21); let gi = 0;
  code.forEach((c, i) => { for (let k = 0; k < c.length; k++) { if (!'{}();?=+'.includes(c[k])) continue; const x0 = 360 + P.measure(c.slice(0, k), { font: FONT.mono, size: 28, weight: 600 }) + 8, y0 = 120 + i * 46 - 10, t0 = ho + i * 0.18 + 0.22 + (gi % 3) * 0.04, dx = (rr() - 0.5) * 140, rest = 492 + (gi % 3) * 8, spinr = (rr() - 0.5) * 5; gi++; const u = clamp((t - t0) / 0.75); if (u <= 0) continue; const x = x0 + dx * u, y = y0 + (rest - y0) * ease.in(u); ctx.save(); ctx.translate(x, y); ctx.rotate(spinr * u); P.both(rect(-19, -19, 38, 38, 7), 'cream', 3); P.text(c[k], 0, 9, { font: FONT.mono, size: 26, weight: 700 }); ctx.restore(); } });
  // the presenter, in a black tee with a headset, at stage left
  person(P, 230, 300, 0.36, { hair: 'buzz', top: 'tee', color: 'black', mouth: f.t < en ? 'smile' : 'grin', crop: 1250, look: [0.6, 0], blink: blinkAt(t), glasses: 'rect' });
  P.line(svg('M180 290 C170 330 190 360 220 352'), 3);
  // the audience, backs of heads, phones up
  const crowd = [['hair'], ['hairBr', 'long'], ['hairBl'], ['charDk'], ['teal'], ['hairAu', 'long'], ['hairGr'], ['hair'], ['hair', 'tail']];
  for (let i = 0; i < 9; i++) {
    const x = 70 + i * 150, y = 560 + (i % 2) * 20, [hc, cut] = crowd[i];
    P.both(ell(x, y, 54, 60), hc, 4); P.both(rect(x - 90, y + 40, 180, 80, 30), ['navy', 'plum', 'char', 'teal'][i % 4], 4);
    if (cut === 'long') P.both(svg(`M${x - 54} ${y} C${x - 54} ${y - 80} ${x + 54} ${y - 80} ${x + 54} ${y} L${x + 48} ${y + 92} C${x + 20} ${y + 102} ${x - 20} ${y + 102} ${x - 48} ${y + 92} Z`), hc, 4);   // long hair down her back
    if (cut === 'tail') P.both(svg(`M${x - 12} ${y + 30} C${x - 18} ${y + 60} ${x - 10} ${y + 90} ${x} ${y + 104} C${x + 10} ${y + 90} ${x + 18} ${y + 60} ${x + 12} ${y + 30} Z`), hc, 3);
    if (i % 3 === 1) { P.both(rect(x + 30, y - 70, 40, 74, 6), 'black', 3); P.fill(rect(x + 34, y - 66, 32, 66, 4), 'mint'); } }
}

// ---- 2. Emacs: the pinky hooked on Control; then TAB, TAB, TAB, and Accept all, revealed like a relic --------------
function emacs(P, f, L, t, w, h) {
  const ctx = P.ctx, l2 = L[1].words[0].start - 0.1;
  backdrop(P, w, h, 'tealDk', 'night');
  const taps = L[1].words.filter((x) => x.w.toLowerCase().startsWith('tab')).map((x) => x.start);
  const acc = wd(L, 1, 'accept'), lk = wd(L, 1, 'never');
  if (t < acc - 0.15) {
    // the keyboard, seen from above at an angle; chords lighting up
    ctx.save(); ctx.translate(680, 330); ctx.rotate(-0.06);
    P.both(rect(-560, -200, 1120, 400, 26), 'cream', 5); P.tone(rect(-560, -200, 1120, 400, 26), 'sepia', { from: [0, -200, 0], to: [0, 200, 0.4], bbox: [-560, -200, 560, 200] }, 6);
    const rows = [['Esc', '1', '2', '3', '4', '5', '6', '7', '8', '9'], ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O'], ['Ctrl', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'], ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>'], ['Fn', 'Meta', 'Alt', 'Space']];
    const chord = ((Math.floor((t - L[0].words[0].start) * 2.7) % 3) + 3) % 3;
    const lit = t < l2 ? [['Ctrl', 'X', 'S'], ['Ctrl', 'X', 'F'], ['Meta', 'X']][chord] : ['Tab'];
    rows.forEach((row, ri) => {
      let x = -520 + ri * 18;
      row.forEach((k) => {
        const kw = k === 'Space' ? 440 : k.length > 2 ? 130 : 84, down = lit.includes(k) && (t < l2 || taps.some((tp) => t > tp && t < tp + 0.22));
        const glow = lit.includes(k) && t >= l2;
        P.both(rect(x, -180 + ri * 74 + (down ? 4 : 0), kw, 64, 10), glow ? 'goldLt' : (down ? 'gold' : 'ivory'), 3);
        const wide = k.length > 2 && k !== 'Space';
        P.text(k, wide ? x + 14 : x + kw / 2, -138 + ri * 74 + (down ? 4 : 0), { font: FONT.mono, size: k.length > 2 ? 22 : 26, weight: 700, align: wide ? 'left' : 'center' });
        x += kw + 12;
      });
    });
    // the hand: the pinky bent like a hook on Control
    hand(P, t, t < l2 ? 'hook' : 'tab', taps);
    ctx.restore();
    if (t < l2) ['C-x C-s', 'C-x C-f', 'M-x'].forEach((c, i) => { if (i === chord) { P.both(rect(980, 40, 300, 70, 12), 'night', 3); P.text(c, 1130, 88, { font: FONT.mono, size: 36, weight: 700, color: 'mint' }); } });
    else taps.forEach((tp, i) => { if (t > tp) { const u = ease.outBack(clamp((t - tp) / 0.25)); ctx.save(); ctx.translate(560 + i * 120, 84); ctx.scale(u, u); P.both(rect(-50, -32, 100, 64, 12), 'gold', 3); P.text('TAB', 0, 12, { font: FONT.mono, size: 30, weight: 700 }); ctx.restore(); } });
  } else {
    // Accept all, in a reliquary with rays; he presses it with his eyes shut
    const u = ease.outCubic(clamp((t - acc + 0.15) / 0.5));
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2 + t * 0.2; P.line(svg(`M${680 + Math.cos(a) * 160} ${280 + Math.sin(a) * 160} L${680 + Math.cos(a) * (160 + 300 * u)} ${280 + Math.sin(a) * (160 + 300 * u)}`), 8, 'gold'); }
    P.both(svg('M560 600 L800 600 L740 520 L620 520 Z'), 'gold', 5); P.both(rect(660, 420, 40, 110, 6), 'gold', 4);
    P.both(ell(680, 280, 170), 'goldLt', 5); P.line(ell(680, 280, 150), 2);
    ctx.save(); ctx.translate(680, 280); ctx.scale(u, u);
    const press = t > lk ? 4 : 0;
    P.both(rect(-130, -46 + press, 260, 92, 46), 'teal', 5); P.text('Accept all', 0, 14 + press, { size: 44, color: 'cream' });
    ctx.restore();
    heroFront(P, 260, 300, 0.45, { blink: t > lk - 0.3 ? 1 : 0, mouth: 'smile' });
    person(P, 1100, 300, 0.45, { hair: 'ponytail', hairColor: 'hairBr', fem: true, top: 'hoodie', color: 'plum', glasses: 'rect', blink: t > lk - 0.3 ? 1 : 0, mouth: 'smile', crop: 1250 });
  }
}
/**
 * his left hand on the keys, from above, in the keyboard's own units: index on F, middle on D, ring on S, and the
 * little finger hooked onto the top edge of Ctrl (or stretched up to Tab), the thumb on the space bar; the forearm
 * runs off the bottom of the keyboard in its sleeve
 */
function hand(P, t, mode, taps) {
  const tap = taps.some((tp) => t > tp && t < tp + 0.22) ? 6 : 0;
  const lw = begin(P, 0, 0, 1);
  const sl = svg('M-300 640 L40 640 L22 436 L-262 436 Z');
  P.fill(sl, 'teal'); P.tone(sl, 'hoodDot', { from: [-260, 440, 0.1], to: [20, 640, 0.5], bbox: [-300, 436, 40, 640] }, 6); P.line(sl, lw);
  P.both(svg('M-268 404 L28 404 L24 448 L-264 448 Z'), 'tealLt', lw); for (let k = -250; k <= 10; k += 14) P.line(svg(`M${k} 410 L${k} 442`), lw * 0.35);
  end(P);
  // a hand the size of the keys: each finger about a key wide, the fingers touching at the knuckles
  const little = mode === 'hook' ? { b: [-288, 128], c: [-404, 96], e: [-372, -16], w0: 64, w1: 54 } : { b: [-288, 128], c: [-376, 30], e: [-390, -58 + tap], w0: 64, w1: 54 };
  const fingers = [little,
    { b: [-206, 140], c: [-206, 70], e: [-204, 2], w0: 72, w1: 60 },
    { b: [-124, 146], c: [-116, 72], e: [-108, 0], w0: 76, w1: 62 },
    { b: [-42, 140], c: [-24, 70], e: [-12, 6], w0: 72, w1: 60 },
    { b: [8, 300], c: [44, 252], e: [42, 168], w0: 80, w1: 66, thumb: true }];
  drawHand(P, 0, 0, 1, 0, 'M-326 128 C-346 228 -318 330 -252 412 L12 412 C52 352 64 250 26 132 C-60 150 -200 152 -326 128 Z', fingers,
    { tone: { from: [-150, 40, 0], to: [-150, 412, 0.5], bbox: [-440, -80, 100, 420] }, knuckles: [[-284, 126], [-204, 138], [-122, 144], [-40, 138]] });
}

// ---- 3. the ghost town and the empty queue; the rubber duck talks back -----------------------------------------
function ghostTown(P, f, L, t, w, h) {
  const ctx = P.ctx, l2 = L[1].words[0].start - 0.1;
  if (t < l2) {
    backdrop(P, w, h, 'goldLt', 'ochre');
    // false-front buildings on a dusty street
    const fronts = [[100, 'sepiaDk', 'HOTEL'], [370, 'ochre', 'STACK'], [640, 'sepiaDk', 'OVERFLOW'], [910, 'ochre', 'SALOON']];
    fronts.forEach(([x, c, s2], i) => { P.both(svg(`M${x} 460 L${x} 120 L${x + 40} 120 L${x + 40} 90 L${x + 220} 90 L${x + 220} 120 L${x + 250} 120 L${x + 250} 460 Z`), c, 4); P.both(rect(x + 20, 140, 210, 50, 4), 'ivory', 3); P.text(s2, x + 125, 178, { font: FONT.caps, weight: 700, size: 30 }); P.both(rect(x + 50, 240, 60, 90, 3), 'night', 3); P.both(rect(x + 140, 240, 60, 90, 3), 'night', 3); P.line(svg(`M${x + 50} 240 L${x + 110} 330 M${x + 140} 330 L${x + 200} 240`), 2, 'sepia'); P.both(rect(x + 90, 360, 70, 100, 3), 'charDk', 3); });
    P.fill(rect(-10, 460, w + 20, 200), 'sepia'); P.tone(rect(-10, 460, w + 20, 200), 'sepiaDk', { from: [0, 460, 0], to: [0, 640, 0.5], bbox: [0, 460, w, 640] }, 6);
    // the queue: stanchions and a rope, nobody in it; a sign: 0 answers
    for (let i = 0; i < 5; i++) { const x = 300 + i * 190; P.both(rect(x - 8, 450, 16, 120, 4), 'gold', 3); P.both(ell(x, 448, 14), 'gold', 3); P.both(ell(x, 572, 34, 10), 'gold', 3); if (i < 4) P.line(svg(`M${x} 460 C${x + 60} 510 ${x + 130} 510 ${x + 190} 460`), 10, 'redDk'); }
    P.both(rect(1060, 470, 180, 110, 6), 'ivory', 3); P.text('QUEUE', 1150, 510, { font: FONT.caps, weight: 700, size: 28 }); P.text('0 answers', 1150, 556, { size: 26, color: 'red' });
    // the tumbleweed rolls across the queue
    const tw = wd(L, 0, 'tumbleweed') - 0.4, u = clamp((t - tw) / 2.4);
    if (u > 0) { const x = lerp(-150, w + 150, u), y = 500 - Math.abs(Math.sin(u * 12)) * 60; ctx.save(); ctx.translate(x, y); ctx.rotate(u * 16); P.ctx.save(); P.alpha(0.5); P.fill(ell(0, 0, 84), 'ochre'); P.ctx.restore(); for (let i = 0; i < 14; i++) { const a = i * 0.45; P.line(svg(`M${Math.cos(a) * 20} ${Math.sin(a) * 20} C${Math.cos(a) * 60} ${Math.sin(a) * 60} ${Math.cos(a + 1) * 90} ${Math.sin(a + 1) * 90} ${Math.cos(a + 2) * 74} ${Math.sin(a + 2) * 74}`), 6, 'sepiaDk'); } P.line(ell(0, 0, 84), 4, 'sepiaDk'); ctx.restore(); }
  } else {
    // the duck under a spotlight, its words in a chat bubble with typing dots first
    backdrop(P, w, h, 'night', 'tealDk');
    ctx.save(); P.alpha(0.3); P.fill(svg('M640 -10 L480 560 L800 560 Z'), 'goldLt'); ctx.restore();
    P.both(rect(530, 604, 220, 18, 4), 'sepiaDk', 4); P.both(rect(566, 548, 148, 58, 4), 'ochre', 4); for (const fx of [594, 622, 650, 678]) P.line(svg(`M${fx} 554 L${fx} 600`), 2, 'sepiaDk'); P.both(rect(500, 520, 280, 32, 6), 'ochre', 4);
    const dk = wd(L, 1, 'talks'), lb = wd(L, 1, 'load-bearing');
    P.both(ell(640, 300, 90, 20), 'gold', 4); P.line(ell(640, 300, 70, 12), 1.5);
    duck(P, 620, 520, 1.6, { talk: t > dk && t < lb + 0.8 ? (Math.sin(t * 22) > 0 ? 1 : 0) : 0 });
    heroFront(P, 200, 300, 0.42, { mouth: t > lb ? 'o' : 'neutral', look: [0.8, 0.3], blink: blinkAt(t), brow: t > lb ? 1 : 0 });
    if (t > dk) {
      const typing = t < lb - 0.25;
      ctx.save(); ctx.translate(980, 200);
      P.both(svg('M-200 -70 L200 -70 C220 -70 230 -60 230 -40 L230 40 C230 60 220 70 200 70 L-140 70 L-180 110 L-170 70 L-200 70 C-220 70 -230 60 -230 40 L-230 -40 C-230 -60 -220 -70 -200 -70 Z'), 'cream', 4);
      if (typing) for (let i = 0; i < 3; i++) P.both(ell(-40 + i * 40, 0 - Math.max(0, Math.sin(t * 9 - i)) * 10, 12), 'grey', 2);
      else { P.text('Ah, that typo is', 0, -10, { size: 34 }); P.text('load-bearing.', 0, 36, { size: 40, color: 'red' }); }
      ctx.restore();
    }
  }
}

// ---- 4. the tests fall like leaves; the build glows green forever; it did its best -----------------------------
function tests(P, f, L, t, w, h) {
  const ctx = P.ctx;
  backdrop(P, w, h, 'sky', 'gold');
  P.fill(rect(-10, 520, w + 20, 140), 'sage');
  // the tree of tests
  P.both(svg('M640 540 C650 440 630 360 600 300 L620 290 C650 340 660 320 670 280 L690 284 C690 330 680 420 700 540 Z'), 'sepiaDk', 4);
  const dl = wd(L, 0, 'deleted'), r = rng(8), names = ['test_login', 'test_cart', 'test_auth', 'test_edge', 'test_null', 'test_utf8', 'test_leap', 'test_race', 'test_retry', 'test_zero', 'test_tz', 'test_y2k'];
  for (let i = 0; i < 12; i++) {
    const a = r() * Math.PI * 2, d = 60 + r() * 150, x0 = 660 + Math.cos(a) * d * 1.6, y0 = 200 + Math.sin(a) * d * 0.8, fall = clamp((t - dl - i * 0.12) / 2.6);
    const x = x0 + Math.sin(fall * 9 + i) * 60 * fall, y = y0 + ease.in(fall) * (500 - y0);
    ctx.save(); ctx.translate(x, y); ctx.rotate(fall * (i % 2 ? 3 : -3) + (r() - 0.5) * 0.4);
    P.both(svg('M-60 -36 L40 -36 L60 -16 L60 36 L-60 36 Z'), fall > 0.02 ? ['gold', 'ochre', 'rose'][i % 3] : 'sage', 3); P.line(svg('M40 -36 L40 -16 L60 -16'), 2);
    P.text(names[i] + '.py', 0, 8, { font: FONT.mono, size: 14, weight: 600 });
    ctx.restore();
  }
  // the build badge, green as a halo
  const gr = wd(L, 1, 'green'), g = ease.outBack(clamp((t - gr + 0.2) / 0.5));
  if (g > 0) { ctx.save(); ctx.translate(660, 80); ctx.scale(g, g); P.tone(ell(0, 0, 260, 90), 'mint', { from: [0, 0, 0.8], to: [260, 0, 0], radial: true, bbox: [-260, -90, 260, 90] }, 6); P.both(rect(-180, -40, 360, 80, 40), 'char', 4); P.both(rect(0, -40, 180, 80, [0, 40, 40, 0]), 'sage', 4); P.text('build', -90, 14, { font: FONT.mono, size: 34, weight: 700, color: 'cream' }); P.text('passing', 90, 14, { font: FONT.mono, size: 34, weight: 700, color: 'cream' }); ctx.restore(); }
  // the agent says it did its best
  const bs = wd(L, 1, 'says') - 0.2;
  agentAngel(P, 1120, 220 + Math.sin(t * 1.6) * 6, 0.5, t);
  if (t > bs) { const u = ease.outBack(clamp((t - bs) / 0.35)); ctx.save(); ctx.translate(1060, 420); ctx.scale(u, u); P.both(svg('M-190 -50 L190 -50 L190 50 L20 50 L60 90 L-20 50 L-190 50 Z'), 'cream', 4); P.text('I did my best!', -18, 14, { size: 36 }); P.both(svg('M150 -6 L156 8 L170 14 L156 20 L150 34 L144 20 L130 14 L144 8 Z'), 'gold', 2); ctx.restore(); }
  heroFront(P, 220, 330, 0.42, { mouth: t > bs ? 'flat' : sing(f), open: f.vocal, look: [0.7, -0.2], blink: blinkAt(t) });
}

// ---- 5. the ladder missing its rungs, the grads below; the nine agents in their stained-glass panes -------------
function ladder(P, f, L, t, w, h) {
  const ctx = P.ctx, l2 = L[1].words[0].start - 0.1;
  if (t < l2) {
    backdrop(P, w, h, 'sky', 'goldLt');
    cloud(P, 680, 110, 110, 'cream', 2); P.both(rect(620, 40, 120, 70, 6), 'ivory', 3); P.text('JOBS', 680, 88, { font: FONT.caps, weight: 700, size: 34 });
    P.line(svg('M600 640 L640 110 M760 640 L720 110'), 16); P.line(svg('M600 640 L640 110 M760 640 L720 110'), 10, 'ochre');
    for (const y of [140, 190, 240]) P.line(svg(`M${600 + (640 - y) * 0.0755 + 6} ${y} L${760 - (640 - y) * 0.0755 - 6} ${y}`), 10, 'ochre');
    for (const y of [300, 380, 460, 540]) { P.ctx.save(); P.ctx.setLineDash([6, 10]); P.line(svg(`M${600 + (640 - y) * 0.0755 + 6} ${y} L${760 - (640 - y) * 0.0755 - 6} ${y}`), 3, 'sepiaDk'); P.ctx.restore(); }
    const grads = [[300, 'skin', 'wavy', 'hairAu', true], [470, 'skin5', 'short', 'hair'], [900, 'skin2', 'bun', 'hairBl', true], [1070, 'skin', 'messy', 'hairBr']];
    const toss = wd(L, 0, 'hired'), u = clamp((t - toss) / 1.3);
    grads.forEach(([x, sk, hr, hc, fem], i) => person(P, x, 420 + (i % 2) * 20, 0.34, { hair: hr, hairColor: hc, fem, top: 'gown', color: 'black', acc: i === 3 && t > toss ? [] : ['mortar'], skin: sk, mouth: 'frown', look: i === 3 && t > toss ? [0.6, -1] : [x < 680 ? 0.5 : -0.5, -0.8], crop: 900, blink: blinkAt(t + i) }));
    if (u > 0 && u < 1) { ctx.save(); ctx.translate(1070 + u * 260, 332 - Math.sin(u * Math.PI) * 250 + u * 70); ctx.rotate(u * 2.4); ctx.scale(0.34, 0.34); mortarboard(P, t); ctx.restore(); }
  } else {
    // a stained-glass window of nine panes, an agent in each; he herds them with a crook
    backdrop(P, w, h, 'night', 'plum');
    ctx.save(); ctx.translate(780, 300);
    P.both(svg('M-330 330 L-330 -150 C-330 -330 330 -330 330 -150 L330 330 Z'), 'charDk', 8);
    const r = rng(4);
    for (let i = 0; i < 9; i++) {
      const cx = -210 + (i % 3) * 210, cy = -110 + Math.floor(i / 3) * 150;
      const pane = rect(cx - 96, cy - 66, 192, 132, 6);
      P.fill(pane, ['teal', 'rose', 'gold', 'sage', 'plum', 'navy', 'ochre', 'tealLt', 'redDk'][i]);
      P.tone(pane, '#000', { from: [cx, cy - 66, 0], to: [cx, cy + 66, 0.4], bbox: [cx - 96, cy - 66, cx + 96, cy + 66] }, 5);
      agentAngel(P, cx, cy - 6, 0.2, t + i * 0.7);
      const prog2 = (t * (0.2 + r() * 0.3) + r()) % 1; P.both(rect(cx - 70, cy + 40, 140, 14, 7), 'night', 2); P.fill(rect(cx - 68, cy + 42, 136 * prog2, 10, 5), 'mint');
      P.line(pane, 6);
    }
    P.line(svg('M-330 -150 C-330 -330 330 -330 330 -150'), 8);
    ctx.restore();
    heroPose(P, 230, 640, 0.5, { lean: 0.05, legs: { near: { a: 0.3, b: -0.1, foot: 0.08 }, far: { a: -0.08, b: -0.08 } }, arms: { near: { a: 0.9 + 0.06 * Math.sin(t * 2), e: 1.9 }, far: { a: -0.64, e: 1.27 } }, hands: { near: 'fist', far: 'pocket' }, look: [0, -0.4], lookUp: 0.3, mouth: sing(f), open: f.vocal,
      hold: (P2, which, wr) => { if (which === 'near') { const d = `M${wr[0] - 30} -4 L${wr[0] + 20} ${wr[1] - 300} C${wr[0] + 30} ${wr[1] - 380} ${wr[0] + 120} ${wr[1] - 380} ${wr[0] + 110} ${wr[1] - 320}`; P2.line(svg(d), 16); P2.line(svg(d), 9, 'ochre'); } } });
  }
}

// ---- 6. laid off in spring, a box of his things; the stall at the farmers' market --------------------------------
function spring(P, f, L, t, w, h) {
  const ctx = P.ctx, l2 = L[1].words[0].start - 0.1;
  if (t < l2) {
    backdrop(P, w, h, 'sky', 'roseLt');
    // a spring sky: two flat clouds; far hills, pale with distance
    for (const [cx, cy, cs] of [[260, 120, 1], [700, 70, 0.7]]) { const cl = svg(`M${cx - 120 * cs} ${cy + 20 * cs} C${cx - 130 * cs} ${cy - 10 * cs} ${cx - 90 * cs} ${cy - 30 * cs} ${cx - 60 * cs} ${cy - 18 * cs} C${cx - 50 * cs} ${cy - 50 * cs} ${cx + 10 * cs} ${cy - 56 * cs} ${cx + 30 * cs} ${cy - 26 * cs} C${cx + 60 * cs} ${cy - 44 * cs} ${cx + 110 * cs} ${cy - 24 * cs} ${cx + 110 * cs} ${cy + 4 * cs} C${cx + 140 * cs} ${cy + 6 * cs} ${cx + 140 * cs} ${cy + 22 * cs} ${cx + 120 * cs} ${cy + 26 * cs} Z`); P.fill(cl, 'cream'); P.tone(cl, 'roseLt', { from: [cx, cy - 40 * cs, 0], to: [cx, cy + 26 * cs, 0.55], bbox: [cx - 140 * cs, cy - 60 * cs, cx + 140 * cs, cy + 30 * cs] }, 5); P.line(cl, 2.5); }
    const far = svg(`M-10 470 C120 430 260 440 380 462 C520 486 640 446 800 450 C960 454 1100 470 1240 452 C1320 444 1380 450 ${w + 10} 446 L${w + 10} 520 L-10 520 Z`);
    P.fill(far, '#c5c9a4'); P.tone(far, 'sage', { from: [w / 2, 440, 0], to: [w / 2, 520, 0.5], bbox: [0, 430, w, 520] }, 6); P.line(far, 2.5);
    // a rolling lawn
    const lawn = svg(`M-10 506 C260 488 620 500 940 490 C1140 484 1260 494 ${w + 10} 488 L${w + 10} ${h + 10} L-10 ${h + 10} Z`);
    P.fill(lawn, 'sage'); P.tone(lawn, 'sageDk', { from: [w / 2, 490, 0], to: [w / 2, h, 0.42], bbox: [0, 480, w, h] }, 7); P.line(lawn, 3);
    for (const [gx, gy] of [[90, 566], [380, 548], [700, 604], [960, 560], [1290, 592], [880, 520]]) P.line(svg(`M${gx} ${gy} l6 -16 M${gx + 8} ${gy} l2 -20 M${gx + 16} ${gy} l-4 -14`), 2.5, 'sageDk');
    cherryTree(P, 1165, 532, 0.9, t);   // a cherry in full blossom, shedding its petals
    // the box of his things on the grass: a snake plant, the duck, the #1 DEV mug with his pens; his badge hung over the edge
    P.tone(ell(705, 530, 250, 20), 'sageDk', { from: [705, 530, 0.6], to: [955, 530, 0], radial: true, bbox: [455, 510, 955, 550] }, 5);
    cardboardBox(P, 675, 530, 0.92, {
      label: 'LAYOFF',
      inside: (P) => { snakePlant(P, -86, -136, 0.58, t); duck(P, 6, -172, 0.6); mug(P, 108, -160, 0.8, { text: ['#1', 'DEV'], pens: ['navy', 'cream', 'red'] }); },
      over: (P) => {
        P.line(svg('M-98 -186 C-104 -150 -92 -112 -72 -94 M-42 -186 C-46 -150 -56 -116 -64 -98'), 9); P.line(svg('M-98 -186 C-104 -150 -92 -112 -72 -94 M-42 -186 C-46 -150 -56 -116 -64 -98'), 5, 'teal');
        P.ctx.save(); P.ctx.translate(-68, -92); P.ctx.rotate(0.06);
        P.both(rect(-6, -6, 12, 12, 2), 'silver', 2); P.both(rect(-30, 4, 60, 76, 7), 'cream', 3); P.both(rect(-20, 14, 40, 32, 3), 'glass', 2);
        P.both(ell(0, 26, 7, 8), 'skin', 1.5); P.both(svg('M-12 46 C-12 36 12 36 12 46 Z'), 'teal', 1.5); P.line(svg('M-20 56 L20 56 M-20 66 L8 66'), 2.5);
        P.ctx.restore();
        [[-150, -150, 0.4], [126, -136, -1.1], [214, -206, 0.8], [-180, -206, 2.2]].forEach(([px, py, a]) => petal(P, px, py, 13, a));
      },
    });
    heroFront(P, 300, 290, 0.42, { mouth: sing(f), open: f.vocal, look: [0.5, 0.2], blink: blinkAt(t), apron: t > wd(L, 0, 'craftsman') });
    cherryTree(P, 1165, 532, 0.9, t, { part: 'petals' });   // the petals blow across him
  } else {
    marketStall(P, f, t, w, h, L, false);
  }
}
function marketStall(P, f, t, w, h, L, close) {
  const ctx = P.ctx;
  backdrop(P, w, h, 'sky', 'goldLt');
  P.fill(rect(-10, 520, w + 20, 140), 'sepia');
  // the awning, striped
  for (let i = 0; i < 12; i++) P.both(svg(`M${160 + i * 90} 90 L${250 + i * 90} 90 L${250 + i * 90} 170 C${235 + i * 90} 190 ${175 + i * 90} 190 ${160 + i * 90} 170 Z`), i % 2 ? 'cream' : 'red', 3);
  P.line(svg('M180 170 L180 540 M1200 170 L1200 540'), 12); P.line(svg('M180 170 L180 540 M1200 170 L1200 540'), 6, 'ochre');
  P.both(rect(380, 58, 620, 64, 10), 'ivory', 4); P.text('HAND-TYPED CODE', 690, 104, { font: FONT.caps, weight: 700, size: 40, tracking: 4 });
  heroFront(P, 700, 216, 0.36, { mouth: sing(f), open: f.vocal, blink: blinkAt(t), apron: true });
  // the counter with jam, clotted cream, and jars with a bug in each
  P.both(rect(160, 420, 1060, 120, 6), 'ochre', 4); P.both(rect(160, 400, 1060, 30, 6), 'sepiaDk', 4);
  for (let i = 0; i < 3; i++) jar(P, 240 + i * 70, 400, 0.7, 'rose', 'JAM');
  for (let i = 0; i < 3; i++) jar(P, 1010 + i * 76, 400, 0.72, 'cream', 'CREAM');
  for (let i = 0; i < 4; i++) bugJar(P, 576 + i * 82, 400, 0.7, i, t);
  P.line(svg('M1100 170 L1060 196 M1100 170 L1140 196'), 3); P.both(rect(1010, 196, 180, 110, 8), 'charDk', 4);
  ['small batch', 'organic', 'artisanal'].forEach((s2, i) => P.text(s2, 1100, 228 + i * 30, { size: 25, color: 'cream' }));
}
function jar(P, x, y, s, fillc, label) { const lw = begin(P, x, y, s); P.both(svg('M-36 0 L-40 -90 C-40 -110 40 -110 40 -90 L36 0 Z'), fillc, lw); P.both(rect(-40, -126, 80, 22, 6), 'red', lw); P.both(rect(-30, -70, 60, 34, 4), 'ivory', lw * 0.6); P.text(label, 0, -46, { font: FONT.caps, size: 15, weight: 700 }); end(P); }
function bugJar(P, x, y, s, i, t) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-40 0 L-44 -110 C-44 -130 44 -130 44 -110 L40 0 Z'), 'glass', lw); P.both(rect(-44, -146, 88, 24, 6), 'gold', lw);
  const bx = Math.sin(t * 2 + i) * 6;
  P.both(ell(bx, -60, 16, 11), 'charDk', lw * 0.6); for (let k = -1; k <= 1; k++) P.line(svg(`M${bx + k * 8} -54 l${k * 4 - 6} 12 M${bx + k * 8} -54 l${k * 4 + 6} 12`), lw * 0.5);
  P.both(rect(-34, -34, 68, 28, 4), 'ivory', lw * 0.6); P.text(`No.${[7, 42, 404, 1337][i]}`, 0, -14, { font: FONT.caps, size: 14, weight: 700 });
  end(P);
}

// ---- 7. small-batch: the bug jar close up, signed and dated; tourists photograph the man who types by hand -------
function market(P, f, L, t, w, h) {
  const ctx = P.ctx, l2 = L[1].words[0].start - 0.1;
  if (t < l2) {
    marketStall(P, f, t, w, h, L, true);
    // the tourists arrive at the stall
    const og = wd(L, 0, 'organic'), tu = ease.outCubic(clamp((t - og + 0.3) / 0.8));
    if (tu > 0) { person(P, lerp(-200, 290, tu), 470, 0.34, { hair: 'side', hairColor: 'hairBl', flush: 1, top: 'tee', color: 'navy', print: 'I ♥|ENGINEERS', acc: tu >= 1 ? ['shoot', 'sunhat'] : ['sunhat'], mouth: 'o', crop: 700, look: [0.7, -0.2], blink: blinkAt(t) }); person(P, lerp(w + 200, w - 290, tu), 480, 0.34, { hair: 'bun', hairColor: 'hairAu', fem: true, top: 'hawaiian', color: 'rose', skin: 'skin2', acc: ['camera'], mouth: 'grin', seed: 3, crop: 700, look: [-0.7, -0.2], blink: blinkAt(t + 1) }); }
    const nt = wd(L, 0, 'not') - 0.1, u = ease.outBack(clamp((t - nt) / 0.4));
    if (u > 0) { ctx.save(); ctx.translate(462, 400); ctx.scale(0.7 * u, 0.7 * u); P.both(svg('M-60 0 L-60 -140 C-60 -150 60 -150 60 -140 L60 0 Z'), 'silver', 4); P.both(rect(-60, -110, 120, 70, 4), 'ivory', 3); P.text('NO', 0, -82, { font: FONT.caps, weight: 700, size: 22 }); P.text('TOKENS', 0, -54, { font: FONT.caps, weight: 700, size: 20 }); ctx.restore(); }
  } else {
    // the jar close up; he signs and dates its label; the tourists' flashes
    backdrop(P, w, h, 'goldLt', 'ochre');
    const sg = wd(L, 1, 'signed');
    ctx.save(); ctx.translate(680, 600); ctx.scale(2.0, 2.0);
    P.both(svg('M-60 0 L-64 -170 C-64 -196 64 -196 64 -170 L60 0 Z'), 'glass', 2.4); P.both(rect(-64, -214, 128, 34, 8), 'gold', 2.4);
    const bx = Math.sin(t * 2) * 8;
    P.both(ell(bx, -110, 26, 17), 'charDk', 1.6); P.both(ell(bx + 26, -112, 10, 9), 'charDk', 1.4); P.fill(ell(bx + 30, -114, 2.5), 'red');
    for (let k = -1; k <= 1; k++) P.line(svg(`M${bx + k * 12} -100 l${k * 6 - 10} 18 M${bx + k * 12} -100 l${k * 6 + 10} 18`), 1.4);
    P.both(rect(-50, -60, 100, 54, 4), 'ivory', 1.4);
    P.text('BUG No. 42', 0, -40, { font: FONT.caps, size: 12, weight: 700 }); P.text('hand-crafted', 0, -26, { size: 11, style: 'italic' });
    if (t > sg) { const u = clamp((t - sg) / 0.8), pp = new Path2D(); pp.moveTo(-34, -12); for (let i = 0; i <= 20 * u; i++) pp.lineTo(-34 + i * 2.6, -12 + Math.sin(i * 1.5) * 2.5); P.line(pp, 1.2, 'navy'); if (u > 0.9) P.text('2026', 30, -8, { size: 9, color: 'navy' }); }
    ctx.restore();
    // tourists with cameras at the sides, flashing
    person(P, 170, 250, 0.36, { hair: 'side', hairColor: 'hairBl', flush: 1, top: 'tee', color: 'navy', print: 'I ♥|ENGINEERS', acc: ['shoot', 'sunhat'], mouth: 'o', crop: 900, look: [0.6, 0] });
    person(P, 1200, 260, 0.36, { hair: 'bun', hairColor: 'hairAu', fem: true, top: 'hawaiian', color: 'rose', skin: 'skin2', acc: ['camera'], mouth: 'grin', seed: 3, crop: 900, look: [-0.6, 0] });
    for (const [fx, fy, ph] of [[174, 249, 0], [1227, 476, 0.45]]) { const k = ((t * 1.1 + ph) % 1); if (k < 0.12) { ctx.save(); P.alpha(1 - k / 0.12); P.tone(ell(fx, fy, 200), 'cream', { from: [fx, fy, 1], to: [fx + 200, fy, 0], radial: true, bbox: [fx - 200, fy - 200, fx + 200, fy + 200] }, 5); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; P.line(svg(`M${fx + Math.cos(a) * 40} ${fy + Math.sin(a) * 40} L${fx + Math.cos(a) * 110} ${fy + Math.sin(a) * 110}`), 5, 'cream'); } ctx.restore(); } }
  }
}

/** a mortarboard in its own units (board ~500 wide), the tassel swinging */
function mortarboard(P, t) {
  P.both(svg('M-150 0 C-150 78 150 78 150 0 Z'), 'black', 10); P.both(svg('M0 -70 L250 0 L0 70 L-250 0 Z'), 'black', 10);
  P.line(svg('M0 -70 L250 0 L0 70 L-250 0 Z'), 4, 'charDk'); P.both(ell(0, 0, 14), 'gold', 6);
  const sw = Math.sin(t * 9) * 30; P.line(svg(`M0 0 L180 6 L${190 + sw} 110`), 10, 'gold'); P.both(rect(176 + sw, 106, 30, 60, 8), 'gold', 6);
}
