// The choruses (docs/TREATMENT.md): one triptych altarpiece, three times.
//  1 Paradise: the wings swing open; the midnight oil, the best idea, the ship, the world.
//  2 Paradise, Revised: the halo is a revenue arrow; soda behind a coin slot; the Manager enthroned;
//    the panels go dark one by one and the wings close.
//  3 Introducing Accept All: a launch poster; the agent writes and he signs; the calendar burns; the
//    robo-taxi passes the horse and buggy at the end of the line; "You're absolutely right!".
// Every line is lettered on the same ribbon banner; the refrain flashes gold.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric } from '../paint.js';
import { heroFront, heroPose } from '../kit/hero.js';
import { person } from '../kit/people.js';
import { lyricBanner, agentAngel, robotaxi, token } from '../kit/props.js';
import { oilLamp, clock, cup, bulb, ship, firework, sodaCan, priceTag, throne, horse, buggy, codeScroll, globe, quill, star, moon, begin, end, scroll, flame } from '../kit/things.js';
import { cloud, heart, palm, duck, fist, sleeveArm } from './verse1.js';

const CEN = { x: 480, y: 30, w: 640, h: 640, rise: 250 };
const WING = [{ x: 70, y: 110, w: 390, h: 540, rise: 160 }, { x: 1140, y: 110, w: 390, h: 540, rise: 160 }];
const HEAD = { 1: ['PARADISE', 'MMIV'], 2: ['PARADISE', 'REVISED'], 3: ['INTRODUCING', 'ACCEPT ALL'] };

function archE(x, y, w, h, rise) {
  const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + rise); p.ellipse(x + w / 2, y + rise, w / 2, rise, 0, Math.PI, 2 * Math.PI); p.lineTo(x + w, y + h); p.closePath(); return p;
}
const blinkAt = (t) => { const k = (t * 0.41) % 1; return k > 0.965 ? 1 - Math.abs(k - 0.982) / 0.017 : 0; };
const sing = (f) => (f.vocal > 0.18 ? 'sing' : 'smile');

export default function chorus(P, f) {
  const n = f.params.n ?? 1, t = f.t, ctx = P.ctx;
  // the four couplets: a sung line and its refrain
  const first = { 1: 'Burned the midnight', 2: 'Revenue up', 3: 'Agent writes it' }[n];
  const i0 = f.L.lines.indexOf(f.L.get(first));
  const lines = f.L.lines.slice(i0, i0 + 8);
  const cs = [0, 1, 2, 3].map((c) => lines[2 * c].start - 0.3);
  let c = 0; for (let k = 1; k < 4; k++) if (t >= cs[k] - 0.2) c = k;
  const V = VARIANTS[n];
  // the room: a sunburst behind the altarpiece (a stage spotlight for the launch); a slow push across the chorus
  const zc = 1 + 0.045 * ease.inOutSine(clamp(f.p));
  ctx.save(); ctx.translate(800, 400); ctx.scale(zc, zc); ctx.translate(-800, -400);
  backdrop(P, f, n);
  headers(P, f, n);
  // wings: open at the start of chorus 1; closed at the end of chorus 2
  const open = n === 1 ? ease.inOutCubic(clamp((t - f.start) / 0.75)) : n === 2 ? 1 - ease.inOutCubic(clamp((t - lines[7].start) / 0.9)) : 1;
  // each panel flips like a card to its next couplet, staggered left, centre, right
  const panel = (j, box, draw) => {
    const sw = j * 0.09, k = c > 0 ? clamp((t - (cs[c] - 0.45 + sw)) / 0.5) : 1;
    const cc = k < 0.5 && c > 0 ? c - 1 : c, sx = c > 0 && k < 1 ? Math.abs(Math.cos(Math.PI * k)) : 1;
    const arch = archE(box.x, box.y, box.w, box.h, box.rise);
    ctx.save(); ctx.translate(box.x + box.w / 2, 0); ctx.scale(Math.max(0.02, sx), 1); ctx.translate(-(box.x + box.w / 2), 0);
    ctx.save(); P.clip(arch); ctx.translate(box.x, box.y);
    draw(P, f, cc, t - (cc > 0 ? cs[cc] : f.start), lines, box);
    ctx.restore();
    frame(P, box, j === 1 ? f.kick : 0);
    ctx.restore();
  };
  panel(1, CEN, V.centre);
  WING.forEach((box, j) => wing(P, f, box, j, open, () => panel(j === 0 ? 0 : 2, box, j === 0 ? V.left : V.right)));
  // the dark: at the end of chorus 2 the lights go out panel by panel, then a sign is hung on the closed wings
  if (n === 2) {
    darkness(P, f, lines);
    const hs = ease.outBack(clamp((t - lines[7].start - 1.0) / 0.5));
    if (hs > 0) { const sw = Math.sin((t - lines[7].start) * 3) * 0.06 * (1 - clamp((t - lines[7].start - 1.0) / 2.5)); ctx.save(); ctx.translate(800, 120 - (1 - hs) * 200); ctx.rotate(sw); P.line(svg('M-90 0 L0 -70 L90 0'), 4); P.both(ell(0, -72, 8), 'gold', 3); P.both(rect(-170, 0, 340, 140, 10), 'ivory', 5); P.line(rect(-160, 10, 320, 120, 6), 1.5); P.text('CLOSED', 0, 68, { font: FONT.caps, weight: 700, size: 52, tracking: 6, color: 'red' }); P.text('FOR REORG', 0, 112, { font: FONT.caps, weight: 700, size: 28, tracking: 6 }); ctx.restore(); }
  }
  // the ribbon banner: every line, the refrain in gold
  const line = f.L.at(t) && f.L.at(t).start >= lines[0].start - 0.5 ? f.L.at(t) : lines[0];
  const refrain = /paradise/i.test(line.text);
  if (refrain) { const g = clamp(1 - (t - line.start) / 1.2); if (g > 0) { ctx.save(); P.alpha(g * 0.7); P.tone(ell(800, 780, 620, 120), 'goldLt', { from: [800, 780, 1], to: [1420, 780, 0], radial: true, bbox: [180, 660, 1420, 900] }, 7); ctx.restore(); } }
  ctx.restore();
  lyricBanner(P, f, line, 800, 782, { size: 46, tail: refrain ? 'goldLt' : 'roseLt' });
}

function backdrop(P, f, n) {
  const t = f.t;
  if (n === 3) {   // the launch: a dark stage with spotlights from below
    P.fill(rect(0, 0, W, H), 'night');
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.2 + Math.sin(t * 0.6 + i) * 0.04; P.ctx.save(); P.alpha(0.16); P.fill(svg(`M800 960 L${800 + Math.cos(a - 0.05) * 1400} ${960 + Math.sin(a - 0.05) * 1400} L${800 + Math.cos(a + 0.05) * 1400} ${960 + Math.sin(a + 0.05) * 1400} Z`), 'goldLt'); P.ctx.restore(); }
    P.tone(rect(0, 0, W, H), 'mintDk', { from: [800, 900, 0.3], to: [800, 0, 0], bbox: [0, 0, W, H] }, 8);
    return;
  }
  P.paper(n === 2 ? 'sepia' : 'paper');
  for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2 + t * 0.01; P.ctx.save(); P.alpha(n === 2 ? 0.18 : 0.3); P.fill(svg(`M800 350 L${800 + Math.cos(a - 0.03) * 1300} ${350 + Math.sin(a - 0.03) * 1300} L${800 + Math.cos(a + 0.03) * 1300} ${350 + Math.sin(a + 0.03) * 1300} Z`), n === 2 ? 'grey' : 'goldLt'); P.ctx.restore(); }
  P.fill(rect(0, 690, W, 210), n === 2 ? 'char' : 'sage'); P.line(svg('M0 690 L1600 690'), 4);
  P.tone(rect(0, 690, W, 210), '#000', { from: [800, 690, 0], to: [800, 900, 0.35], bbox: [0, 690, W, 900] }, 7);
}

function headers(P, f, n) {
  const [a, b] = HEAD[n];
  WING.forEach((box, j) => {
    const cx = box.x + box.w / 2, y = 30, w = P.measure(j ? b : a, { font: FONT.caps, size: 30, weight: 700, tracking: 6 }) + 70;
    P.both(rect(cx - w / 2, y, w, 56, 10), n === 3 ? 'black' : 'cream', 4); P.line(rect(cx - w / 2 + 8, y + 8, w - 16, 40, 6), 1.5, n === 3 ? 'gold' : 'line');
    P.text(j ? b : a, cx, y + 39, { font: FONT.caps, size: 30, weight: 700, tracking: 6, color: n === 3 ? 'goldLt' : 'line' });
  });
}

function frame(P, box, glint) {
  const arch = archE(box.x, box.y, box.w, box.h, box.rise);
  P.line(arch, 22); P.line(arch, 15, 'gold'); P.line(archE(box.x + 13, box.y + 13, box.w - 26, box.h - 13, box.rise - 13), 2.5);
  if (glint > 0.05) { P.ctx.save(); P.alpha(glint * 0.5); P.line(arch, 6, 'cream'); P.ctx.restore(); }
}

/** a wing: hinged on the centre panel; closed it lies over the centre showing its painted back */
function wing(P, f, box, j, open, drawOpen) {
  const ctx = P.ctx, hinge = j === 0 ? CEN.x : CEN.x + CEN.w;
  const k = open, sx = Math.cos(Math.PI * (1 - k));   // -1 closed over the centre .. +1 open
  if (k >= 0.999) { drawOpen(); return; }
  ctx.save(); ctx.translate(hinge, 0); ctx.scale(sx, 1); ctx.translate(-hinge, 0);
  // the wing's geometry is mirrored about the hinge: open it sits beside the centre, closed over it
  const dx = j === 0 ? hinge - (box.x + box.w) : hinge - box.x, bx = box.x + dx;
  if (sx > 0) { ctx.translate(dx, 0); drawOpen(); }
  else {
    const arch = archE(bx, box.y, box.w, box.h, box.rise);
    P.fill(arch, 'tealDk'); P.tone(arch, 'hoodDot', { from: [bx, box.y, 0], to: [bx + box.w, box.y + box.h, 0.5], bbox: [bx, box.y, bx + box.w, box.y + box.h] }, 7);
    ctx.save(); P.clip(arch); const r = rng(j + 2); for (let i = 0; i < 14; i++) star(P, bx + 30 + r() * (box.w - 60), box.y + 80 + r() * (box.h - 120), 8, i); ctx.restore();
    P.both(ell(bx + box.w / 2, box.y + box.h / 2, 70), 'gold', 4); P.text(j ? 'Ω' : 'Α', bx + box.w / 2, box.y + box.h / 2 + 22, { size: 64, weight: 700 });
    P.line(arch, 22); P.line(arch, 15, 'gold');
  }
  ctx.restore();
}

function darkness(P, f, lines) {
  const t = f.t, l = lines[6], w = (q) => l.words.find((x) => x.w.toLowerCase().startsWith(q)).start;
  const offs = [[WING[0], w('badge')], [WING[1], w('turned')], [CEN, w('goodnight')]];
  for (const [box, t0] of offs) {
    const k = ease.inOutCubic(clamp((t - t0) / 0.5)); if (k <= 0) continue;
    P.ctx.save(); P.alpha(0.88 * k); P.fill(archE(box.x, box.y, box.w, box.h, box.rise), 'night'); P.ctx.restore();
  }
  // the badge reader's light in the dark centre, red, then out
  const gn = w('goodnight'), red = clamp((t - w('red')) / 0.2) * (1 - clamp((t - gn - 0.8) / 0.4));
  if (red > 0) { const cx = 1030, cy = 380; P.tone(ell(cx, cy, 160), 'red', { from: [cx, cy, 0.9 * red], to: [cx + 160, cy, 0], radial: true, bbox: [cx - 160, cy - 160, cx + 160, cy + 160] }, 6); P.both(rect(cx - 50, cy - 80, 100, 160, 14), 'char', 4); P.both(ell(cx, cy - 30, 16), red > 0.5 && Math.floor(t * 4) % 2 ? 'red' : 'redDk', 3); P.line(rect(cx - 30, cy + 10, 60, 40, 6), 2); }
}

// ---- the panel contents: (P, f, couplet, local time, lines, box) in the panel's own units ----------------------
const word = (lines, li, q) => lines[li].words.find((x) => x.w.toLowerCase().replace(/[^a-z']/g, '').startsWith(q)).start;
function fillBg(P, box, color, tone, a = 0.5) { const r0 = rect(-10, -10, box.w + 20, box.h + 20); P.fill(r0, color); if (tone) P.tone(r0, tone, { from: [box.w / 2, 0, 0], to: [box.w / 2, box.h, a], bbox: [0, 0, box.w, box.h] }, 7); }

const VARIANTS = {
  1: {
    centre(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) {   // the midnight oil
        fillBg(P, box, 'night', 'tealDk', 0.6);
        const r = rng(7); for (let i = 0; i < 16; i++) star(P, r() * box.w, 40 + r() * 260, 5 + r() * 4, t * 2 + i);
        P.halo(320, 250, 210, undefined, f.beat * 0.025, 0.3 + 0.2 * f.kick);
        heroFront(P, 320, 330, 0.5, { uplit: 0.8, mouth: sing(f), open: f.vocal, look: [0, 0.5], blink: blinkAt(t) });
        oilLamp(P, 470, 640, 0.85, t, {});
      } else if (c === 1) {   // the best idea wins: an A/B duel on a whiteboard
        fillBg(P, box, 'ivory', 'sepia', 0.3);
        for (let gx = 40; gx < box.w; gx += 60) P.line(svg(`M${gx} 0 L${gx} ${box.h}`), 1, '#e3dcc6'); for (let gy = 40; gy < box.h; gy += 60) P.line(svg(`M0 ${gy} L${box.w} ${gy}`), 1, '#e3dcc6');
        const wn = word(lines, 2, 'wins'), win = ease.outBack(clamp((t - wn) / 0.5));
        const spark = Math.sin(t * 20) > 0.3 && t < wn ? 1 : 0;
        if (spark) P.line(svg('M300 300 L330 270 L310 260 L350 220'), 6, 'gold');
        bulb(P, 170, 500, 0.95, lerp(0.6, 0.15, win), {});
        bulb(P, 470, 500, 0.95 + 0.15 * win, lerp(0.6, 1, win), { crown: win, spin: t * 0.3 });
        P.text('A', 170, 610, { font: FONT.caps, weight: 700, size: 44 }); P.text('B', 470, 610, { font: FONT.caps, weight: 700, size: 44 });
      } else if (c === 2) {   // ship it to the world tonight
        fillBg(P, box, 'night', 'navy', 0.5);
        moon(P, 520, 120, 40);
        const sh = word(lines, 4, 'ship'), u = ease.inOutCubic(clamp((t - sh) / 1.6));
        for (let i = 0; i < 6; i++) firework(P, 120 + ((i * 197) % 420), 120 + ((i * 89) % 160), 90, ((t - sh - i * 0.37) % 2.2) / 1.2, i % 2 ? 'goldLt' : 'roseLt');
        P.fill(rect(-10, 470, box.w + 20, 200), 'navyDk');
        ship(P, lerp(150, 330, u), 520 + lerp(-40, 0, u), 0.62, t, { sail: 'v1.0' });
        for (let i = 0; i < 6; i++) P.line(svg(`M${-40 + i * 130 + Math.sin(t * 2 + i) * 20} ${540 + (i % 2) * 40} q30 -14 60 0 q30 14 60 0`), 4, 'mint');
      } else {   // change the world: the globe lifted up under a halo
        fillBg(P, box, 'goldLt', 'gold', 0.4);
        P.halo(320, 300, 250, undefined, f.beat * 0.03, 0.4 + 0.2 * f.kick);
        globe(P, 320, 300, 170, t * 0.06);
        // the world gets a diff: changes pop up on it like review tags
        const ch = word(lines, 6, 'change');
        [['+ 1,024', 'sage', 270, 230], ['− 512', 'rose', 380, 270], ['+ 64', 'sage', 300, 380], ['+ 2,048', 'sage', 380, 340], ['− 7', 'rose', 240, 310]].forEach(([s2, c2, dx, dy], i) => { const u = ease.outBack(clamp((t - ch - i * 0.18) / 0.35)); if (u > 0) { P.ctx.save(); P.ctx.translate(dx, dy); P.ctx.scale(u, u); const w2 = P.measure(s2, { font: FONT.mono, size: 22, weight: 700 }) + 24; P.both(rect(-w2 / 2, -19, w2, 38, 19), c2, 3); P.text(s2, 0, 8, { font: FONT.mono, size: 22, weight: 700, color: 'cream' }); P.ctx.restore(); } });
        const lg = ease.outBack(clamp((t - lines[7].start) / 0.3)); if (lg > 0) { const sq = 1 + 2 * (1 - clamp((t - lines[7].start) / 0.15)); P.ctx.save(); P.ctx.translate(420, 420); P.ctx.rotate(-0.25); P.ctx.scale(sq, sq); P.alpha(0.9); P.line(ell(0, 0, 74, 46), 6, 'red'); P.line(ell(0, 0, 64, 38), 2, 'red'); P.text('LGTM', 0, 12, { font: FONT.caps, weight: 700, size: 34, color: 'red' }); P.ctx.restore(); }
        P.both(svg('M200 600 L440 600 L470 650 L170 650 Z'), 'gold', 4); P.line(svg('M220 616 L420 616'), 2);
        if (t > word(lines, 6, 'mind')) heart(P, 470, 150, 0.55 * ease.outBack(clamp((t - word(lines, 6, 'mind')) / 0.4)));
      }
    },
    left(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) { fillBg(P, box, 'tealDk', 'hoodDot', 0.5); P.both(rect(40, 500, 310, 24, 4), 'ochre', 4); for (const bx of [70, 320]) P.both(svg(`M${bx - 10} 524 L${bx + 10} 524 L${bx} 560 Z`), 'ochre', 3); const n = Math.min(6, Math.floor(lt / 0.75) + 1); for (let i = 0; i < n; i++) cup(P, 195 + (i % 2 ? 18 : -14), 500 - i * 74, 0.9, (i % 2 ? 0.08 : -0.06)); }
      else if (c === 1) { fillBg(P, box, 'teal', 'tealDk', 0.4); pennant(P, 195, 230, 'A', 'teal', 150 * ease.inOutCubic(clamp((t - lines[3].start) / 1.4))); bars(P, 95, 500, [0.5, 0.42, 0.38], 'cream'); }
      else if (c === 2) { fillBg(P, box, 'night', 'navy', 0.5); for (let i = 0; i < 3; i++) firework(P, 120 + i * 90, 180 + i * 90, 80, ((t - i * 0.6) % 1.8) / 1.2, i % 2 ? 'roseLt' : 'goldLt'); champagne(P, 200, 520, 0.9, lt); }
      else { fillBg(P, box, 'sage', 'sageDk', 0.4); person(P, 195, 300, 0.42, { hair: 'side', top: 'tee', color: 'navy', acc: ['halo'], mouth: 'smile', look: [0.6, -0.3], crop: 900, blink: blinkAt(t) }); }
    },
    right(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) { fillBg(P, box, 'night', 'tealDk', 0.5); moon(P, lerp(90, 300, clamp(lt / 6)), lerp(160, 120, clamp(lt / 6)), 46); const r = rng(5); for (let i = 0; i < 8; i++) star(P, 30 + r() * 330, 200 + r() * 120, 6, t * 3 + i); clock(P, 195, 420, 74, lerp(0, 4, clamp(lt / 5.5))); }
      else if (c === 1) { fillBg(P, box, 'rose', 'redDk', 0.4); pennant(P, 195, 230, 'B', 'rose'); bars(P, 95, 500, [0.5, 0.72, 0.9], 'cream'); }
      else if (c === 2) { fillBg(P, box, 'night', 'navy', 0.5); for (let i = 0; i < 3; i++) firework(P, 280 - i * 90, 160 + i * 100, 80, ((t - 0.3 - i * 0.5) % 1.8) / 1.2, i % 2 ? 'goldLt' : 'mint'); }
      else { fillBg(P, box, 'sage', 'sageDk', 0.4); person(P, 195, 300, 0.42, { hair: 'messy', top: 'hoodie', color: 'plum', glasses: 'rect', acc: ['halo'], mouth: 'smile', look: [-0.6, -0.3], crop: 900, blink: blinkAt(t + 2) }); }
    },
  },
  2: {
    centre(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) {   // revenue: the halo is now an arrow up and to the right
        fillBg(P, box, 'cream', 'sepia', 0.4);
        const u = ease.outCubic(clamp(lt / 1.6));
        [0.25, 0.35, 0.3, 0.5, 0.62, 0.8].forEach((h, i) => { const bh = 380 * h * u; P.both(rect(90 + i * 80, 580 - bh, 56, bh, 4), i === 5 ? 'gold' : 'sage', 3); });
        const pts = [[80, 540], [230, 480], [350, 470], [470, 200]], k = u * 3, ar = new Path2D(); ar.moveTo(...pts[0]);
        let tip = pts[0], dir = 0; for (let i = 1; i <= 3; i++) { const a = pts[i - 1], b = pts[i], v = clamp(k - (i - 1)); if (v <= 0) break; tip = [lerp(a[0], b[0], v), lerp(a[1], b[1], v)]; dir = Math.atan2(b[1] - a[1], b[0] - a[0]); ar.lineTo(...tip); }
        P.line(ar, 32); P.line(ar, 20, 'gold');
        P.ctx.save(); P.ctx.translate(...tip); P.ctx.rotate(dir); P.both(svg('M-6 -34 L48 0 L-6 34 Z'), 'gold', 5); P.ctx.restore();
        P.text('$', 140, 160, { size: 90, weight: 700, color: 'gold', stroke: 'line', strokeW: 6 });
      } else if (c === 1) {   // soda's fifty cents: the fridge became a vending machine
        fillBg(P, box, 'char', 'charDk', 0.5);
        P.both(rect(120, 110, 400, 470, 18), 'red', 5); P.both(rect(150, 140, 230, 400, 10), 'night', 4);
        for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) sodaCan(P, 190 + k * 75, 240 + i * 130, 0.42);
        P.both(rect(400, 160, 96, 120, 8), 'cream', 3); P.text('50¢', 448, 238, { font: FONT.display, size: 46, color: 'red' });
        P.both(rect(430, 320, 40, 80, 6), 'silver', 3); P.line(svg('M450 335 L450 385'), 6);
        const ct = word(lines, 2, 'cents'); if (t > ct) { const u = clamp((t - ct) / 0.6); P.both(ell(450, lerp(250, 340, u), 18, 6 + 12 * (1 - u)), 'gold', 3); }
      } else if (c === 2) {   // adult supervision: the Manager enthroned
        fillBg(P, box, 'rose', 'redDk', 0.4);
        throne(P, 320, 690, 0.78);
        person(P, 320, 230, 0.5, { hair: 'slick', top: 'vest', color: 'char', mouth: 'smirk', acc: ['lanyard'], crop: 960, blink: blinkAt(t) });
        clicker(P, 480, 330, 0.8, t);
      } else {   // badge turned red: the lights go out (see darkness())
        fillBg(P, box, 'cream', 'sepia', 0.4);
        heroFront(P, 280, 330, 0.5, { mouth: 'frown', look: [0.8, 0.2], blink: blinkAt(t) });
        P.both(ell(280, 120, 120, 26), 'grey', 4);
        P.both(rect(500, -10, 150, 700), 'sepia', 4); P.line(svg('M520 -10 L520 690'), 2);
      }
    },
    left(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) { fillBg(P, box, 'sage', 'sageDk', 0.4); coins(P, 195, 520, Math.min(8, Math.floor(lt / 0.5) + 1)); }
      else if (c === 1) { fillBg(P, box, 'char', 'charDk', 0.4); heroFront(P, 180, 210, 0.38, { mouth: 'frown', look: [0.3, 0.9], brow: 1, blink: blinkAt(t) }); palm(P, 250, 560, 0.95, -0.2, { sleeve: 300 }); for (const [cx, cy, v] of [[236, 446, '10¢'], [276, 470, '5¢']]) { P.both(ell(cx, cy, 26), 'gold', 3); P.line(ell(cx, cy, 20), 1.2, 'ochre'); P.text(v, cx, cy + 7, { font: FONT.caps, weight: 700, size: 17 }); } }
      else if (c === 2) { fillBg(P, box, 'rose', 'redDk', 0.4); person(P, 195, 290, 0.38, { hair: 'slick', top: 'vest', color: 'navy', mouth: 'smirk', acc: ['lanyard'], crop: 900, blink: blinkAt(t + 1), look: [0.5, 0] }); }
      else {   // his desk, cleared: an empty chair, a box with the plant and the duck
        fillBg(P, box, 'cream', 'sepia', 0.4);
        P.both(rect(40, 420, 310, 22, 4), 'ochre', 4); P.line(svg('M60 442 L60 560 M330 442 L330 560'), 8, 'sepiaDk');
        P.both(svg('M120 560 L130 470 L220 470 L230 560 Z'), 'charDk', 4); P.both(rect(126, 360, 98, 116, 14), 'char', 4);
        P.both(svg('M220 420 L228 330 L342 330 L350 420 Z'), 'ochre', 4); for (let k = 0; k < 3; k++) P.leaf(256 + k * 10, 324, -1.7 + k * 0.4, 0.7); duck(P, 316, 334, 0.32);
      }
    },
    right(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) { fillBg(P, box, 'sage', 'sageDk', 0.4); coins(P, 195, 520, Math.min(10, Math.floor(lt / 0.4) + 1)); }
      else if (c === 1) { fillBg(P, box, 'char', 'charDk', 0.4); priceTag(P, 195, 160, 1.4, '50¢', 0.1); }
      else if (c === 2) { fillBg(P, box, 'rose', 'redDk', 0.4); person(P, 195, 290, 0.38, { hair: 'side', top: 'vest', color: 'char', shirt: 'roseLt', mouth: 'smirk', acc: ['lanyard'], crop: 900, blink: blinkAt(t + 2), look: [-0.5, 0] }); }
      else {   // the way out
        fillBg(P, box, 'cream', 'sepia', 0.4);
        P.both(rect(90, 200, 210, 380, 6), 'sepiaDk', 5); P.both(rect(110, 220, 170, 360, 4), 'ochre', 3); P.both(ell(256, 400, 10), 'gold', 3);
        P.both(rect(120, 120, 150, 56, 8), 'sage', 4); P.text('EXIT', 195, 162, { font: FONT.caps, weight: 700, size: 34, color: 'cream' });
      }
    },
  },
  3: {
    centre(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) {   // the agent writes it; he signs
        fillBg(P, box, 'night', 'navy', 0.3);
        codeScroll(P, 320, 170, 300, 400, t, { speed: 90 });
        agentAngel(P, 320, 120 + Math.sin(t * 1.6) * 5, 0.55, t);
        const sg = word(lines, 0, 'sign');
        heroFront(P, 540, 470, 0.36, { mouth: sing(f), open: f.vocal, look: [-0.6, 0.4], blink: blinkAt(t), uplit: 0.4 });
        // a yellow SIGN HERE tab at the foot of the scroll; his hand signs with a quill, its feather angled away
        P.both(svg('M470 520 L560 520 L560 572 L470 572 L446 546 Z'), 'gold', 3); P.text('SIGN', 510, 542, { font: FONT.caps, weight: 700, size: 16 }); P.text('HERE', 510, 563, { font: FONT.caps, weight: 700, size: 16 });
        const u = clamp((t - sg + 0.4) / 0.9), nx = 200 + 216 * u, ny = 545 - 14 * u + (u > 0 && u < 1 ? Math.sin(u * 30) * 4 : 0);
        if (t > sg - 0.4) { const sgp = new Path2D(); sgp.moveTo(200, 545); for (let i = 0; i <= 24 * u; i++) sgp.lineTo(200 + i * 9, 545 + Math.sin(i * 1.3) * 10 - i * 0.6); P.line(sgp, 4, 'navy'); }
        quill(P, nx, ny, 0.55, -0.9); sleeveArm(P, [nx - 4, ny - 26], [430, 640], 0.42, 'teal', 1, { cuff: 'tealLt' });
      } else if (c === 1) {   // tokens burned by April
        fillBg(P, box, 'night', 'redDk', 0.4);
        const months = ['JAN', 'FEB', 'MAR', 'APR'], tk = word(lines, 2, 'tokens'), tApr = tk + 3 * 0.45;
        // "fine": behind the calendar he sits it out with his coffee while the room burns; April's page burns away to show him
        const fu = ease.outCubic(clamp((t - tApr + 0.2) / 0.4));
        if (fu > 0) {
          P.ctx.save(); P.alpha(fu);
          for (let k = 0; k < 9; k++) { const fx = -20 + k * 85, side = Math.abs(fx - 320) > 140 ? 1 : 0.35; flame(P, fx, 664, (280 + 60 * (k % 3)) * side, 120, t, k, k % 2 ? ['gold', 'cream'] : ['red', 'gold']); }
          P.ctx.restore();
          heroFront(P, 320, 330, 0.42, { mouth: 'smile', blink: t > word(lines, 2, 'fine') ? 1 : blinkAt(t), uplit: 0.6 });
          cup(P, 404, 616, 0.8, 0.05); P.line(svg(`M400 526 C${390 + Math.sin(t * 3) * 8} 496 ${410 + Math.sin(t * 3 + 1) * 8} 476 400 446`), 3, 'cream');
          fist(P, 436, 580, 0.42, 'teal', true, { rot: 0.5, len: 300, cuff: 'tealLt' });   // his hand round the cup
        }
        for (const i of [3, 2, 1, 0]) calPage(P, 320, 330, months[i], clamp((t - (tk + i * 0.45)) / 0.8), t, i);
        for (let i = 0; i < 10; i++) { const u = ((t * 0.5 + i * 0.1) % 1); P.ctx.save(); P.alpha(1 - u); token(P, 100 + (i * 53) % 440, 600 - u * 500, 0.8, Math.sin(i + t), ['tok', 'en', '##s', 'ctx', '▁the'][i % 5]); P.ctx.restore(); }
      } else if (c === 2) {   // horse and buggy, end of line: the robo-taxi passes them
        fillBg(P, box, 'sky', 'gold', 0.4);
        P.both(svg('M-10 430 C150 400 400 420 660 410 L660 660 L-10 660 Z'), 'sage', 3);
        P.fill(rect(-10, 520, box.w + 20, 70), 'cream'); P.line(svg('M-10 520 L660 520 M-10 590 L660 590'), 3);
        endOfLine(P, 560, 520, 0.8);
        horse(P, 250, 560, 0.42, 0, { harness: true }); buggy(P, 90, 560, 0.42, 0);
        const rt = word(lines, 4, 'horse'), rx = lerp(-300, 900, clamp((t - rt) / 2.6));
        robotaxi(P, rx, 588, 0.42, t, 1);
      } else {   // "You're absolutely right!"
        fillBg(P, box, 'night', 'navy', 0.3);
        for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2 + t * 0.2; P.line(svg(`M${320 + Math.cos(a) * 120} ${180 + Math.sin(a) * 120} L${320 + Math.cos(a) * 420} ${180 + Math.sin(a) * 420}`), 6, 'goldLt'); }
        agentAngel(P, 320, 180 + Math.sin(t * 1.6) * 5, 0.75, t);
        const u = ease.outBack(clamp((t - word(lines, 6, 'you')) / 0.5));
        if (u > 0) { P.ctx.save(); P.ctx.translate(320, 470); P.ctx.scale(u, u); P.both(svg('M-280 -70 L280 -70 L280 70 L40 70 L0 120 L-10 70 L-280 70 Z'), 'cream', 6); P.text('You’re absolutely', 0, -10, { size: 48 }); P.text('right!', 0, 48, { size: 54, color: 'red' }); P.ctx.restore(); }
        cascade(P, f, lines, [['Spot on!', 130, 330], ['Brilliant!', 510, 330], ['So true!', 150, 590], ['Exactly!', 490, 590]], 0);
      }
    },
    left(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) {   // the agent's pull requests pile up, one per beat
        fillBg(P, box, 'night', 'navy', 0.3);
        const n = Math.min(9, Math.floor((t - f.start) / f.A.P) + 1);
        for (let i = 0; i < n; i++) { const pop = i === n - 1 ? ease.outBack(clamp(((t - f.start) % f.A.P) / 0.25)) : 1, yy = 500 - i * 46, xx = 195 + Math.sin(i * 2.3) * 14; P.ctx.save(); P.ctx.translate(xx, yy - (1 - pop) * 60); P.ctx.rotate(Math.sin(i * 1.7) * 0.05); P.both(rect(-120, -20, 240, 42, 6), 'ivory', 3); P.text(`PR #${4810 + i}`, -100, 9, { font: FONT.mono, size: 18, weight: 700, align: 'left' }); P.text('+1,203 −0', 106, 9, { font: FONT.mono, size: 16, weight: 700, align: 'right', color: 'sageDk' }); P.ctx.restore(); }
      }
      else if (c === 1) { fillBg(P, box, 'night', 'redDk', 0.4); gauge(P, 195, 360, 1 - clamp(lt / 2.2)); }
      else if (c === 2) { fillBg(P, box, 'sky', 'gold', 0.4); P.both(svg('M-10 430 C150 400 300 420 400 410 L400 560 L-10 560 Z'), 'sage', 3); hay(P, 195, 520, 1); }
      else { fillBg(P, box, 'night', 'navy', 0.3); agentAngel(P, 195, 200, 0.42, t + 1); speech(P, 195, 430, 'Great question!'); cascade(P, f, lines, [['Great catch!', 195, 320]], 1); }
    },
    right(P, f, c, lt, lines, box) {
      const t = f.t;
      if (c === 0) {   // and he approves them: a stamp lands on every beat
        fillBg(P, box, 'night', 'navy', 0.3); P.both(rect(50, 110, 290, 400, 6), 'ivory', 4);
        const n = Math.min(10, Math.floor((t - f.start) / f.A.P) + 1), r = rng(17);
        for (let i = 0; i < n; i++) { const sx = 110 + r() * 170, sy = 160 + r() * 300, rot = (r() - 0.5) * 0.6, k = i === n - 1 ? clamp(((t - f.start) % f.A.P) / 0.12) : 1, sc = 1 + (1 - k) * 0.8; P.ctx.save(); P.ctx.translate(sx, sy); P.ctx.rotate(rot); P.ctx.scale(sc, sc); P.alpha(0.85 * k); P.line(rect(-62, -20, 124, 40, 6), 4, 'red'); P.text('APPROVED', 0, 8, { font: FONT.caps, weight: 700, size: 19, color: 'red' }); P.ctx.restore(); }
      }
      else if (c === 1) { fillBg(P, box, 'night', 'redDk', 0.4); scroll(P, 195, 120, 260, 360, { unroll: ease.outCubic(clamp(lt / 0.8)), title: 'INVOICE', titleSize: 26, lines: ['tokens', '4,000,000,000', '', 'due: April', 'PAID IN FULL'], size: 26, lineH: 44 }); }
      else if (c === 2) {
        fillBg(P, box, 'sky', 'gold', 0.4); P.both(svg('M-10 430 C150 400 300 420 400 410 L400 560 L-10 560 Z'), 'sage', 3); charger(P, 300, 496, 0.9);
        const arr = word(lines, 4, 'horse') + 2.2, u = ease.outCubic(clamp((t - arr) / 1.0));
        if (u > 0) { robotaxi(P, lerp(-200, 120, u), 496, 0.36, t * (1 - u), 1); if (u >= 1) { const cab = svg('M255 384 C232 392 214 424 208 452'); P.line(cab, 8); P.line(cab, 5, 'char'); P.both(rect(200, 446, 16, 16, 3), 'black', 2); const g = 0.5 + 0.5 * Math.sin(t * 6); P.ctx.save(); P.alpha(g); bolt(P, 120, 372, 1.1); P.ctx.restore(); } }
      }
      else { fillBg(P, box, 'night', 'navy', 0.3); agentAngel(P, 195, 200, 0.42, t + 2); speech(P, 195, 430, 'Certainly!'); cascade(P, f, lines, [['Love this!', 195, 320]], 3); }
    },
  },
};

// ---- small things for the panels -------------------------------------------------------------------------
function pennant(P, x, y, letter, color, drop = 0) {
  P.line(svg(`M${x - 120} ${y - 120} L${x - 120} ${y + 200}`), 6); P.both(ell(x - 120, y - 124, 9), 'gold', 3);
  const droop = drop / 150;
  P.both(svg(`M${x - 120} ${y - 110 + drop} L${x + 140 - 60 * droop} ${y - 60 + drop + 40 * droop} L${x - 120} ${y - 10 + drop} Z`), color === 'teal' ? 'cream' : 'ivory', 4);
  P.text(letter, x - 60, y - 44 + drop + 6 * droop, { font: FONT.caps, weight: 700, size: 56 });
}
function bars(P, x, y, hs, color) { hs.forEach((h, i) => P.both(rect(x + i * 70, y - 300 * h, 50, 300 * h, 4), color, 3)); P.line(svg(`M${x - 20} ${y} L${x + 220} ${y}`), 4); }
function champagne(P, x, y, s, lt) {
  const lw = begin(P, x, y, s, -0.6 + Math.min(1, lt / 0.8) * 0.9);
  P.both(svg('M-30 0 L-30 -160 C-30 -200 -14 -210 -14 -240 L14 -240 C14 -210 30 -200 30 -160 L30 0 Z'), 'sageDk', lw); P.both(rect(-16, -270, 32, 34, 4), 'gold', lw); P.both(rect(-30, -120, 60, 60, 4), 'cream', lw);
  end(P);
  if (lt > 0.8 && lt < 2.5) for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 4) * 0.25, u = (lt - 0.8) / 1.7; P.both(ell(x + 120 + Math.cos(a) * 160 * u, y - 260 + Math.sin(a) * 160 * u + 200 * u * u, 8), 'goldLt', 2); }
}
function coins(P, x, y, n) { for (let i = 0; i < n; i++) { P.both(ell(x + (i % 2 ? 6 : -6), y - i * 22, 70, 18), 'gold', 3); P.line(svg(`M${x - 50 + (i % 2 ? 6 : -6)} ${y - i * 22} L${x + 50 + (i % 2 ? 6 : -6)} ${y - i * 22}`), 1.5, 'ochre'); } }
function clicker(P, x, y, s, t) {
  const lw = begin(P, x, y, s, -0.2);
  P.both(rect(-22, -60, 44, 160, 16), 'black', lw); P.both(ell(0, -20, 12), 'red', lw * 0.6); P.both(rect(-12, 20, 24, 30, 6), 'char', lw * 0.6);
  if (Math.floor(t * 1.4) % 2) { P.ctx.save(); P.alpha(0.6); P.line(svg('M0 -60 L60 -160'), 6, 'red'); P.ctx.restore(); }
  end(P);
}
function calPage(P, x, y, m, u, t, i) {
  if (u >= 1) return;
  const lw = begin(P, x - i * 8, y + i * 8, 1, 0);   // JAN on top; the later months peek out below and to the left
  const yb = 160 - 340 * u;   // the burn line rises up the page
  P.ctx.save(); P.clip(rect(-170, -200, 340, yb + 200));
  P.both(rect(-150, -160, 300, 320, 10), 'ivory', lw); P.fill(rect(-150, -160, 300, 70, 10), 'red'); P.line(rect(-150, -160, 300, 320, 10), lw);
  P.text(m, 0, -108, { font: FONT.caps, weight: 700, size: 40, color: 'cream' });
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) P.line(rect(-126 + k * 42, -70 + r * 52, 34, 40, 3), lw * 0.4);
  P.restore();
  if (u > 0) { P.line(svg(`M-150 ${yb} L150 ${yb}`), lw * 2.4, 'charDk'); for (let k = 0; k < 6; k++) flame(P, -125 + k * 50, yb + 6, 60 + 30 * (((k + i) * 7) % 3) / 2, 52, t, k + i * 3, k % 2 ? ['gold', 'cream'] : ['red', 'gold']); }
  end(P);
}
function gauge(P, x, y, v) {
  const lw = begin(P, x, y, 1);
  const arc = new Path2D(); arc.arc(0, 0, 130, Math.PI, 2 * Math.PI); P.line(arc, 26); P.line(arc, 18, 'cream');
  const a = Math.PI + v * Math.PI; P.line(svg(`M0 0 L${Math.cos(a) * 110} ${Math.sin(a) * 110}`), 8, 'red'); P.both(ell(0, 0, 14), 'char', 3);
  P.text('E', -120, 40, { font: FONT.caps, weight: 700, size: 34, color: 'cream' }); P.text('F', 120, 40, { font: FONT.caps, weight: 700, size: 34, color: 'cream' });
  P.text('TOKENS', 0, 90, { font: FONT.caps, weight: 700, size: 28, color: 'goldLt' });
  end(P);
}
function endOfLine(P, x, y, s) {
  const lw = begin(P, x, y, s);
  P.line(svg('M-60 0 L-60 -200 M60 0 L60 -200'), lw * 3);
  P.both(rect(-110, -260, 220, 90, 8), 'ivory', lw); P.text('END OF', 0, -222, { font: FONT.caps, weight: 700, size: 30 }); P.text('LINE', 0, -186, { font: FONT.caps, weight: 700, size: 30 });
  P.both(rect(-140, -60, 280, 40, 6), 'red', lw); for (let i = 0; i < 5; i++) P.fill(rect(-130 + i * 56, -60, 28, 40), 'cream'); P.line(rect(-140, -60, 280, 40, 6), lw);
  end(P);
}
function hay(P, x, y, s) { const lw = begin(P, x, y, s); P.both(rect(-110, -120, 220, 120, 16), 'ochre', lw); for (let i = 0; i < 7; i++) P.line(svg(`M${-100 + i * 32} -110 l10 100`), lw * 0.5, 'sepiaDk'); P.line(svg('M-110 -60 L110 -60'), lw * 1.4, 'red'); end(P); }
function charger(P, x, y, s) {
  const lw = begin(P, x, y, s);
  P.both(rect(-50, -260, 100, 260, 14), 'mint', lw); P.both(rect(-34, -230, 68, 80, 8), 'black', lw); bolt(P, 0, -190, 1.3);
  P.line(svg('M50 -120 C110 -110 120 -40 90 0'), lw * 2.4); P.line(svg('M50 -120 C110 -110 120 -40 90 0'), lw * 1.2, 'char');
  end(P);
}
/** compliments popping one per beat during the last refrain */
function cascade(P, f, lines, items, k0) {
  const t0 = lines[7].start;
  items.forEach(([s, x, y], i) => { const u = ease.outBack(clamp((f.t - t0 - (k0 + i * 2) * f.A.P * 0.5) / 0.3)); if (u > 0) { P.ctx.save(); P.ctx.translate(x, y); P.ctx.scale(u * 0.8, u * 0.8); P.ctx.rotate((i % 2 ? -1 : 1) * 0.06); speech(P, 0, 0, s); P.ctx.restore(); } });
}
function speech(P, x, y, text) {
  const w = P.measure(text, { size: 34 }) + 50;
  P.both(svg(`M${x - w / 2} ${y - 36} L${x + w / 2} ${y - 36} L${x + w / 2} ${y + 36} L${x + 20} ${y + 36} L${x} ${y + 70} L${x - 10} ${y + 36} L${x - w / 2} ${y + 36} Z`), 'cream', 4);
  P.text(text, x, y + 12, { size: 34 });
}

/** a lightning bolt, drawn flat in gold */
function bolt(P, x, y, s) { const lw = begin(P, x, y, s); P.both(svg('M6 -26 L-14 4 L-1 4 L-8 26 L14 -6 L1 -6 Z'), 'gold', lw * 0.7); end(P); }
