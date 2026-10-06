// Intro — The Valley (docs/TREATMENT.md). Three shots cut on beats before each line:
//  A. the lane at dawn: the hero walks, a robo-taxi glides by, the title banner unfurls
//  B. "I fear no outage…": the hero under his halo, phone up, the agent hovering like an angel
//  C. "with its tokens and its context…": tokens drift past like blossoms; he closes his eyes, comforted
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp } from '../paint.js';
import { heroFront, heroWalk, phone } from '../kit/hero.js';
import { cut, lyricBanner, robotaxi, token, agentAngel, posterFrame, tree, cypress, campus } from '../kit/props.js';

export default function intro(P, f) {
  const c1 = cut(f, 'I fear no outage'), c2 = cut(f, 'with its tokens');
  if (f.t < c1) valley(P, f, c1);
  else if (f.t < c2) angel(P, f, c1, c2);
  else blossoms(P, f, c2);
}

// ---- A. the lane --------------------------------------------------------------------------------
function landscape(P, f, cam) {
  const t = f.t;
  P.fill(rect(0, 0, W, H), 'sky');
  P.tone(rect(0, 0, W, 520), 'gold', { from: [800, 0, 0.45], to: [800, 520, 0.0] }, 8);
  // the sun as a great halo behind the hills
  const sx = 1120 - cam * 0.15, sy = 470;
  P.halo(sx, sy, 250, ['', '', '', '', '', '', '', '', '', '', '', ''], t * 0.05, 0.5);
  P.beads(sx, sy, 285, 36, 6, 'goldLt', f.kick);
  // far hills, the campus on the far ridge, near hills
  P.both(svg(`M-100 560 C200 470 420 500 640 520 C900 545 1100 470 1700 520 L1700 900 L-100 900 Z`), 'hill', 4);
  campus(P, 380 - cam * 0.3, 532, 0.5);
  P.both(svg(`M-100 640 C300 590 600 620 900 630 C1200 640 1400 600 1700 620 L1700 900 L-100 900 Z`), 'sage', 4);
  P.tone(svg(`M-100 640 C300 590 600 620 900 630 C1200 640 1400 600 1700 620 L1700 900 L-100 900 Z`), 'hoodDot', { from: [800, 620, 0], to: [800, 900, 0.35], bbox: [0, 580, W, H] }, 7);
  tree(P, 150 - cam * 0.55, 650, 0.9, 2); cypress(P, 250 - cam * 0.55, 655, 0.8); cypress(P, 1290 - cam * 0.55, 640, 0.7);
  tree(P, 1420 - cam * 0.55, 645, 0.8, 5); tree(P, 990 - cam * 0.55, 640, 0.55, 8);
  for (let gx = -40; gx < W + 80; gx += 70) { const x = gx - ((cam * 0.55) % 70); P.line(svg(`M${x} 690 l6 -16 M${x + 8} 690 l2 -20 M${x + 16} 690 l-4 -14`), 2, 'sageDk'); }
  // the lane
  P.both(rect(-20, 700, W + 40, 70), 'cream', 4);
  P.tone(rect(-20, 700, W + 40, 70), 'skinDot', { from: [0, 700, 0.0], to: [0, 770, 0.35], bbox: [0, 700, W, 770] }, 6);
}
function fence(P, cam) {
  const off = ((-cam * 1.0) % 160 + 160) % 160;
  P.both(rect(-20, 800, W + 40, 14, 4), 'cream', 3); P.both(rect(-20, 846, W + 40, 14, 4), 'cream', 3);
  for (let x = off - 160; x < W + 160; x += 160) P.both(rect(x - 11, 770, 22, 130, 6), 'cream', 3);
}
function valley(P, f, end) {
  const t = f.t, cam = keys(t, [[0, 0], [end, 260, ease.inOut]]);
  const zoom = keys(t, [[0, 1.06], [end, 1.0, ease.out]]);
  P.save(); P.zoom(zoom, 800, 600);
  landscape(P, f, cam);
  // the robo-taxi glides right-to-left on the lane as he sings "robo-taxis"
  const rt = f.L.get('robo-taxis').words.find((w) => w.w.startsWith('robo')).start;
  const rx = keys(t, [[rt - 2.2, 1900], [rt + 1.8, -500, ease.inOut]]);
  if (rx > -480 && rx < 1880) robotaxi(P, rx, 728, 0.9, t, -1);
  // the hero walks in from the left
  const hx = keys(t, [[0.4, -160], [end, 760]]), phase = (hx / 150) * Math.PI;
  heroWalk(P, hx - cam * 0.2, 760, 0.46, phase, { carry: null });
  fence(P, cam);
  P.restore();
  posterFrame(P);
  // the title unfurls on the first bars, then the lyric
  const unfurl = ease.outCubic(prog(t, 0.6, 3.0));
  P.save(); P.ctx.translate(800, 96);
  if (unfurl > 0) { const w = 760 * unfurl; P.banner(-w / 2, -50, w, 100, { tail: 'roseLt' }); P.save(); P.clip(rect(-w / 2 + 14, -60, Math.max(0, w - 28), 120)); P.text('ENGINEER’S PARADISE', 0, 22, { size: 60, tracking: 2 }); P.restore(); }
  P.restore();
  lyricBanner(P, f, f.L.get('As I walk through'), 800, 822, { size: 40, unfurl: ease.outCubic(prog(t, 2.9, 3.5)) });
}

// ---- B. the angel --------------------------------------------------------------------------------
function chapel(P, f, archFill = 'rose') {
  P.paper();
  P.both(rect(40, 40, 330, 820, 14), 'sage', 5); P.both(rect(1230, 40, 330, 820, 14), 'sage', 5);
  P.tone(rect(40, 40, 330, 820), 'hoodDot', { from: [205, 40, 0.0], to: [205, 860, 0.28] }, 7);
  P.tone(rect(1230, 40, 330, 820), 'hoodDot', { from: [1395, 40, 0.0], to: [1395, 860, 0.28] }, 7);
  const grow = (x) => clamp((f.lt - x) / 1.6);
  P.vine([[205, 840], [90, 690], [330, 600], [210, 470], [90, 350], [330, 300], [236, 168]], 5, true, grow(0));   // the plug's tip keeps clear of the top
  P.vine([[1395, 840], [1510, 690], [1270, 600], [1390, 470], [1510, 350], [1270, 300], [1364, 168]], 5, true, grow(0));
  for (const [x, y, a, k] of [[118, 640, 2.6, 0.2], [270, 560, -0.4, 0.4], [120, 400, 2.9, 0.7], [268, 300, -0.2, 1.0]]) if (grow(0) > k) { P.leaf(x, y, a, 1.1); P.leaf(W - x, y, Math.PI - a, 1.1); }
  const arch = P.arch(410, 40, 780, 820, archFill);
  P.tone(arch, '#a8665a', { from: [800, 40, 0.0], to: [800, 860, 0.35] }, 7);
  P.both(svg('M760 40 L800 8 L840 40 Z'), 'gold', 4);
  return arch;
}
// the hero sits lower than the arch's centre so the point of his hood aims at the agent above it
const HX = 800, HY = 430, HS = 0.8, AY = 100;
function angel(P, f, start, end) {
  const t = f.t, lt = t - start, push = keys(t, [[start, 1.0], [end, 1.07]]);
  P.save(); P.zoom(push, 800, 420);
  chapel(P, f, 'rose');
  P.beads(HX, 450, 350, 44, 9, 'goldLt', f.kick);
  P.halo(HX, 450, 320, undefined, f.beat * 0.02, 0.2);
  // he lifts the phone, its light comes up on his face
  const lift = ease.outCubic(prog(lt, 0.2, 1.1));
  const lit = lift * 0.6;
  heroFront(P, HX, HY, HS, { uplit: lit, hold: 'phone', phoneY: lerp(540, 290, lift), mouth: singing(f) ? 'sing' : 'neutral', open: f.vocal, look: [0, 0.6 * lit], blink: blink(t) });
  // the agent appears on "agent's", high above him like an angel
  const ag = f.L.get('I fear no outage').words.find((w) => w.w.startsWith('agent')).start;
  const a = ease.outBack(prog(t, ag - 0.3, ag + 0.5));
  if (a > 0) { P.save(); P.ctx.globalAlpha = clamp(a); agentAngel(P, HX, lerp(40, AY, clamp(a)) + Math.sin(t * 1.6) * 5, 0.62 * a, t); P.restore(); }
  P.restore();
  lyricBanner(P, f, f.L.get('I fear no outage'), 800, 812, { size: 40 });
}

// ---- C. the blossoms --------------------------------------------------------------------------------
const PIECES = ['the', 'ing', ' Valley', '##ed', 'tok', 'ens', ' and', 'ctx', '<s>', ' me', '▁you', 'know', '’s', ' home', '0.98', 'calm', ' ok', ' :)'];
function blossoms(P, f, start) {
  const t = f.t, lt = t - start;
  P.save(); P.zoom(keys(t, [[start, 1.07], [start + 1.2, 1.0, ease.outCubic]]), 800, 420);
  chapel(P, f, 'sage');
  P.beads(HX, 450, 350, 44, 9, 'goldLt', f.kick);
  const glow = keys(t, [[start, 0.2], [f.end - 1.5, 0.9]]);
  P.halo(HX, 450, 320, undefined, f.beat * 0.02, glow);
  const comfort = f.L.get('it comforts me').words.find((w) => w.w.startsWith('comforts')).start;
  const calm = prog(t, comfort - 0.3, comfort + 0.5);
  heroFront(P, HX, HY, HS, { uplit: 0.5, hold: 'phone', phoneY: 290, mouth: calm > 0.5 && !singing(f) ? 'smile' : singing(f) ? 'sing' : 'neutral', open: f.vocal, blink: calm > 0.5 ? 1 : blink(t) });
  agentAngel(P, HX, AY + Math.sin(t * 1.6) * 5, 0.62, t);
  // tokens drift down from the upper left like petals, starting on "tokens"
  const tk = f.L.get('with its tokens').words.find((w) => w.w.startsWith('tokens')).start;
  const r = rng(11);
  for (let i = 0; i < 16; i++) {
    // two streams, one down each side of the arch, so the face stays clear
    const side = i % 2 ? 1 : -1, born = tk - 0.4 + r() * 5.5, life = 4.5 + r() * 2, u = (t - born) / life, txt = PIECES[i % PIECES.length], spin = r() * 6, sz = 0.95 + r() * 0.45;
    const lane = 270 + r() * 230;
    if (u < 0 || u > 1) continue;
    const x = 800 + side * (lane + Math.sin(u * 6 + i) * 60), y = -60 + u * 980;
    token(P, x, y, sz, Math.sin(u * 4 + spin) * 0.6, txt);
  }
  P.restore();
  lyricBanner(P, f, f.L.get('with its tokens'), 800, 812, { size: 40 });
}

// ---- small performance helpers -----------------------------------------------------------------------
function singing(f) { return f.vocal > 0.18; }
function blink(t) { const k = (t * 0.37) % 1; return k > 0.97 ? 1 - Math.abs(k - 0.985) / 0.015 : 0; }
