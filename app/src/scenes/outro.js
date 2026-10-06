// Outro — The Choir (docs/TREATMENT.md). A chapel of arches; a men's choir of engineers, each holding his
// phone up to his face, lit from below. Cables join the phones; he reads its code, cleaner than his; it even
// wrote the tests; the old reviewer finds no nit and caps his red pen; the arches multiply into a nave. On
// "Accept all." every phone turns round to show the same button and he presses his. Then the Valley at dusk:
// he walks off down the lane and the title comes back.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric } from '../paint.js';
import { heroFront, heroWalk } from '../kit/hero.js';
import { person } from '../kit/people.js';
import { lyricBanner, agentAngel, robotaxi, tree, cypress, campus, posterFrame, beatCut } from '../kit/props.js';
import { redPen, scroll, begin, end, star } from '../kit/things.js';

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
function chapel(P, f, t, depth = 1) {
  P.fill(rect(0, 0, W, H), 'night');
  // arches receding: depth > 1 multiplies them into a nave
  const n = Math.round(3 + (depth - 1) * 6);
  for (let i = 0; i < n; i++) {   // outermost first, so the inner arches show through, receding
    const s = Math.pow(0.8, i), w = 1500 * s, h = 980 * s, x = 800 - w / 2, y = 470 - h * 0.55;
    const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w * 0.35); p.ellipse(800, y + w * 0.35, w / 2, w * 0.35, 0, Math.PI, 2 * Math.PI); p.lineTo(x + w, y + h); p.closePath();
    P.fill(p, i % 2 ? 'tealDk' : 'night'); P.line(p, Math.max(2, 16 * s)); P.line(p, Math.max(1.5, 10 * s), 'gold');
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
  const hairs = ['short', 'messy', 'side', 'buzz', 'short', 'slick', 'side', 'bald', 'messy'];
  const phones = [];
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const x = 800 + (i - (r.n - 1) / 2) * r.dx, k = ri * 9 + i;
      if (ri === 2 && Math.abs(x - 800) < 60) continue;   // the hero's place
      const sway = Math.sin(t * 1.5 + k) * 4;
      person(P, x + sway, r.y, r.s, { hair: hairs[k % 9], top: tops[(k + ri) % 9], color: cols[(k * 3 + ri) % 9], arms: 'phone', uplit: 0.75, look: [0, 0.6], mouth: f.vocal > 0.18 && (k % 3) ? 'sing' : 'neutral', open: f.vocal, crop: 700, blink: blinkAt(t, k), glasses: ['none', 'round', 'rect'][k % 3], skin: ['skin', 'skin2', 'skin3'][k % 3], screen: o.screen, press: false });
      phones.push([x + sway, r.y + 290 * r.s, r.s]);
    }
  });
  return phones;
}

function choirWide(P, f, t, lt, L) {
  chapel(P, f, t);
  const phones = choir(P, f, t);
  // glue between the agents' lines: cables join the phones, lighting up from "Glue"
  const g0 = L[0].words[0].start;
  const order = phones.slice().sort((a, b) => a[0] - b[0] + (a[1] - b[1]) * 0.01);
  for (let i = 0; i < order.length - 1; i++) {
    const u = clamp((t - g0 - i * 0.12) / 0.4); if (u <= 0) continue;
    const [x1, y1] = order[i], [x2, y2] = order[i + 1], mx = (x1 + x2) / 2, my = Math.max(y1, y2) + 70;
    const p = new Path2D(); p.moveTo(x1, y1 + 30); p.quadraticCurveTo(mx, my, lerp(x1, x2, u), lerp(y1 + 30, y2 + 30, u));
    P.line(p, 7); P.line(p, 4, u >= 1 ? 'goldLt' : 'cream');
  }
  heroFront(P, 800, 470, 0.42, { hold: 'phone', uplit: 0.8, look: [0, 0.6], mouth: sing(f), open: f.vocal, blink: blinkAt(t) });
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
  heroFront(P, 800, 320, 0.78, { hold: 'phone', uplit: 0.9, look: [t > cl ? (Math.sin(t * 2) > 0 ? -0.8 : 0.8) : 0, 0.6], brow: t > cl ? 1 : 0, mouth: t > cl + 1 ? 'frown' : sing(f), open: f.vocal, blink: blinkAt(t) });
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
  chapel(P, f, t);
  const u = ease.outCubic(clamp(lt / 1.6));
  const names = ['parses empty input', 'handles leap years', 'rejects bad tokens', 'survives the race', 'is idempotent', 'round-trips UTF-8', 'times out politely', 'never divides by zero', 'retries twice', 'keeps its promise'];
  scroll(P, 1120, 120, 420, 600, { unroll: u, title: 'TESTS', titleSize: 30, align: 'left', size: 22, lineH: 46, lines: names.map((n, i) => (lt > 0.5 + i * 0.22 ? `✓ ${n}` : '')), ink: 'sageDk' });
  heroFront(P, 520, 330, 0.7, { hold: 'phone', uplit: 0.9, look: [0.6, 0.4], mouth: sing(f), open: f.vocal, blink: blinkAt(t) });
  if (u > 0.9) { P.ctx.save(); P.alpha(clamp((lt - 2.6) / 0.4)); P.both(rect(980, 690, 280, 60, 30), 'sage', 4); P.text('10 passed', 1120, 732, { font: FONT.mono, size: 30, weight: 700, color: 'cream' }); P.ctx.restore(); }
}

// ---- not a single nit to find: the old reviewer searches and caps his pen ---------------------------------------------
function reviewer(P, f, t, lt, L) {
  chapel(P, f, t);
  const fd = L[3].words.find((w) => w.w.startsWith('find')).start;
  P.both(ell(800, 260, 300), 'gold', 4); P.tone(ell(800, 260, 300), 'goldLt', { from: [800, 260, 0.7], to: [1100, 260, 0], radial: true, bbox: [500, -40, 1100, 560] }, 7);
  person(P, 800, 300, 0.62, { hair: 'bald', top: 'robe', color: 'navy', mantle: 'red', stern: t < fd + 0.4, mouth: t > fd + 0.4 ? 'flat' : 'frown', glasses: 'rect', beard: 'grey', fw: 1.06, crop: 900, look: [Math.sin(lt * 2.4) * 0.8, 0.5], blink: blinkAt(t) });
  // the magnifying glass sweeps over the code, finding nothing
  const mx = 640 + Math.sin(lt * 2.4) * 220, my = 600 + Math.cos(lt * 1.7) * 20;
  P.both(rect(380, 560, 840, 200, 8), 'ivory', 4);
  for (let i = 0; i < 5; i++) P.line(svg(`M420 ${598 + i * 32} l${[600, 520, 700, 460, 640][i]} 0`), 8, ['teal', 'sage', 'gold', 'rose', 'teal'][i]);
  P.ctx.save(); P.ctx.translate(mx, my); P.both(ell(0, 0, 80), 'glass', 6); P.ctx.save(); P.alpha(0.4); P.fill(ell(-20, -20, 30, 18), 'cream'); P.ctx.restore(); P.line(svg('M56 56 L130 130'), 22); P.line(svg('M56 56 L130 130'), 14, 'ochre'); P.ctx.restore();
  // the red pen, its cap going back on after "find"
  const cap = 1 - ease.outCubic(clamp((t - fd - 0.3) / 0.5));
  redPen(P, 1230, 380, 0.62, 0.1, 60 * cap);
  if (t > fd + 0.3) { P.ctx.save(); P.alpha(clamp((t - fd - 0.3) / 0.4)); P.text('LGTM', 1230, 140, { font: FONT.caps, weight: 700, size: 40, color: 'red', tracking: 4 }); P.ctx.restore(); }
}

// ---- the nave: the arches multiply ------------------------------------------------------------------------------------
function nave(P, f, t, lt, L) {
  const d = 1 + ease.inOutCubic(clamp(lt / 3.2));
  chapel(P, f, t, d);
  const z = 1 / (1 + (d - 1) * 0.9);
  P.ctx.save(); P.ctx.translate(800, 470); P.ctx.scale(z, z); P.ctx.translate(-800, -470);
  choir(P, f, t);
  heroFront(P, 800, 470, 0.42, { hold: 'phone', uplit: 0.8, look: [0, 0.6], mouth: sing(f), open: f.vocal, blink: blinkAt(t) });
  P.ctx.restore();
}

// ---- Accept all.: every phone turns round to show the same button; he presses his ---------------------------------------
function cardStunt(P, f, t, lt, L, dur) {
  chapel(P, f, t, 1.4);
  const ac = L[5].words[0].start, turned = t > ac - 0.05, press = t > L[5].words[1].start;
  const zz = 1 + 0.65 * ease.outCubic(clamp((t - ac + 0.15) / 0.5));
  P.ctx.save(); P.ctx.translate(800, 640); P.ctx.scale(zz, zz); P.ctx.translate(-800, -640);
  choir(P, f, t, { screen: turned });
  heroFront(P, 800, 470, 0.42, { hold: 'phone', uplit: 0.8, look: [0, 0.6], mouth: 'neutral', blink: blinkAt(t), screen: turned, press });
  P.ctx.restore();
  if (press) { const k = clamp((t - L[5].words[1].start) / 0.5); P.ctx.save(); P.alpha((1 - k) * 0.8); P.fill(rect(0, 0, W, H), 'cream'); P.ctx.restore(); }
  // then the arch closes in on the light
  const cl = clamp((lt - (dur - 1.0)) / 0.9);
  if (cl > 0) { P.ctx.save(); P.alpha(ease.inOutCubic(cl)); P.fill(rect(0, 0, W, H), 'night'); P.ctx.restore(); }
}

// ---- the Valley at dusk: he walks away down the lane; the title returns --------------------------------------------------
function valleyEnd(P, f, t, lt) {
  const ctx = P.ctx, dur = f.end - (t - lt);
  P.fill(rect(0, 0, W, H), 'rose');
  P.tone(rect(0, 0, W, 520), 'plum', { from: [800, 0, 0.6], to: [800, 520, 0], bbox: [0, 0, W, 520] }, 8);
  const r = rng(3); for (let i = 0; i < 14; i++) star(P, r() * W, 30 + r() * 240, 5, t * 2 + i);
  P.halo(1120, 520, 230, ['', '', '', '', '', '', '', '', '', '', '', ''], t * 0.03, 0.35);
  P.both(svg('M-100 560 C200 470 420 500 640 520 C900 545 1100 470 1700 520 L1700 900 L-100 900 Z'), 'ochre', 4);
  campus(P, 380, 532, 0.5);
  // the robo-taxi glides along the far ridge road the other way, rated five stars
  const rx = lerp(1750, -250, clamp((lt - 0.8) / 5.0));
  if (rx > -240 && rx < 1740) { robotaxi(P, rx, 556, 0.36, t, -1); ctx.save(); ctx.translate(rx, 430); P.both(rect(-80, -22, 160, 44, 10), 'cream', 3); P.text('★★★★★', 0, 10, { size: 26, color: 'gold' }); P.line(svg('M0 22 L0 34'), 2); ctx.restore(); }
  P.both(svg('M-100 640 C300 590 600 620 900 630 C1200 640 1400 600 1700 620 L1700 900 L-100 900 Z'), 'sageDk', 4);
  P.tone(svg('M-100 640 C300 590 600 620 900 630 C1200 640 1400 600 1700 620 L1700 900 L-100 900 Z'), 'hoodDot', { from: [800, 620, 0.1], to: [800, 900, 0.5], bbox: [0, 580, W, H] }, 7);
  tree(P, 150, 650, 0.9, 2); cypress(P, 250, 655, 0.8); cypress(P, 1290, 640, 0.7); tree(P, 1420, 645, 0.8, 5);
  P.both(rect(-20, 700, W + 40, 70), 'sepia', 4);
  // he walks off towards the sun, smaller as he goes
  const w = clamp(lt / (dur - 2)), hs = lerp(0.42, 0.16, w);
  heroWalk(P, lerp(520, 1080, w), lerp(760, 690, w), hs, lt * 6, { hood: 'teal' });
  // the fence
  for (let x = -40; x < W + 160; x += 160) P.both(rect(x - 11, 770, 22, 130, 6), 'cream', 3);
  P.both(rect(-20, 800, W + 40, 14, 4), 'cream', 3); P.both(rect(-20, 846, W + 40, 14, 4), 'cream', 3);
  posterFrame(P);
  // the title, unfurling; the credit
  const un = ease.outCubic(clamp((lt - 1.2) / 2.0));
  if (un > 0) { ctx.save(); ctx.translate(800, 110); const bw = 900 * un; P.banner(-bw / 2, -56, bw, 112, { tail: 'goldLt' }); P.clip(rect(-bw / 2 + 14, -70, Math.max(0, bw - 28), 140)); P.text('ENGINEER’S PARADISE', 0, 24, { size: 68, tracking: 2 }); ctx.restore(); }
  if (lt > 3.6) { ctx.save(); P.alpha(clamp((lt - 3.6) / 1.0)); const cr = 'after “Gangsta’s Paradise” (Coolio), by way of “Amish Paradise” (“Weird Al” Yankovic)', cw = P.measure(cr, { size: 26, style: 'italic' }) + 50; P.both(rect(800 - cw / 2, 186, cw, 46, 8), 'cream', 3); P.text(cr, 800, 218, { size: 26, style: 'italic' }); ctx.restore(); }
  // fade to black at the very end
  const fo = clamp((t - (f.end - 2.2)) / 2.0);
  if (fo > 0) { ctx.save(); P.alpha(fo); P.fill(rect(0, 0, W, H), 'black'); ctx.restore(); }
}
