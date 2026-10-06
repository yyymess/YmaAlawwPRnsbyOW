// Bridge — Glue (docs/TREATMENT.md). The drums drop out; a sepia almanac page in the isotype manner:
// 1915, twenty-six horses (a million each); 1960, three, the rest walking off as motor cars take their
// places. A schoolroom for retraining, empty but for one puzzled horse. The glue works; the horses file in.
// Out comes a bottle labelled GLUE CODE with the hero's face in its cartouche.
import { W, H, C, rect, ell, svg, at, ease, keys, prog, clamp, rng, lerp, FONT, lyric } from '../paint.js';
import { heroFront } from '../kit/hero.js';
import { horse, begin, end } from '../kit/things.js';
import { cloud } from './verse1.js';
import { beatCut } from '../kit/props.js';

const INK = 'sepiaDk';

export default function bridge(P, f) {
  const t = f.t, ctx = P.ctx;
  const Ls = [f.L.get('Nineteen-fifteen'), f.L.get('Nineteen-sixty'), f.L.get('Nobody retrained'), f.L.get('boiled'), f.L.get('glue code too')];
  const cutB = beatCut(f, Ls[2]), cutC = beatCut(f, Ls[3]), cutD = beatCut(f, Ls[4]);
  page(P, f);
  const sub = t < cutB ? f.start : t < cutC ? cutB : t < cutD ? cutC : cutD, zb = 1 + 0.04 * ease.out(clamp((t - sub) / 6));
  P.fill(rect(110, 160, 1380, 552), 'sepia'); P.tone(rect(110, 160, 1380, 552), INK, { from: [800, 160, 0.06], to: [800, 712, 0.16], bbox: [110, 160, 1490, 712] }, 5);
  ctx.save(); P.clip(rect(110, 160, 1380, 552)); ctx.translate(800, 436); ctx.scale(zb, zb); ctx.translate(-800, -436);
  if (t < cutB) isotype(P, f, Ls, t);
  else if (t < cutC) schoolroom(P, f, Ls, t, t - cutB);
  else if (t < cutD) glueWorks(P, f, Ls, t, t - cutC);
  else bottle(P, f, Ls, t, t - cutD);
  ctx.restore();
  // the plate's caption: the line being sung, printed
  const line = f.L.at(t) && f.L.at(t).start >= Ls[0].start - 0.5 ? f.L.at(t) : Ls[0];
  P.line(rect(110, 160, 1380, 552), 3, INK); P.line(rect(118, 168, 1364, 536), 1.2, INK);
  P.line(svg('M160 742 L1440 742'), 2, INK); P.line(svg('M160 750 L1440 750'), 1, INK);
  lyric(P, line, t, 800, 812, { size: 44, maxW: 1240, always: true, lead: 0.5, color: 'charDk', dim: INK });
}

function page(P, f) {
  P.fill(rect(0, 0, W, H), 'sepia');
  P.tone(rect(0, 0, W, H), INK, { from: [800, 450, 0.14], to: [0, 0, 0.5], radial: true, bbox: [0, 0, W, H] }, 6);
  P.fill(rect(84, 54, 1432, 102), 'sepia'); P.fill(rect(84, 726, 1432, 132), 'sepia');   // clean paper behind the heading and the caption
  P.line(rect(60, 30, 1480, 840, 2), 4, INK); P.line(rect(72, 42, 1456, 816, 2), 1.5, INK);
  P.text('THE ALMANAC OF PROGRESS', 800, 96, { font: FONT.caps, weight: 700, size: 44, tracking: 10, color: INK });
  P.line(svg('M300 118 L1300 118'), 1.5, INK);
  P.text('Being a True Account of the Horse Population, with Engravings', 800, 144, { size: 26, style: 'italic', color: 'charDk' });
  for (const x of [130, 1470]) P.flower(x, 96, 0.5, 'sepia', 0);
}

/** an isotype horse: one solid silhouette, a million horses */
function horseIcon(P, x, y, s, a = 1) {
  P.ctx.save(); P.ctx.translate(x, y); P.ctx.scale(s, s); P.alpha(a);
  P.fill(svg('M-42 -44 C-54 -42 -60 -30 -58 -16 L-52 -16 C-52 -26 -48 -34 -42 -38 L-40 -24 L-40 0 L-32 0 L-30 -20 L-24 -20 L-22 0 L-14 0 L-14 -22 L16 -22 L18 0 L26 0 L26 -22 L30 -22 L34 0 L42 0 L36 -28 C40 -36 44 -44 48 -50 L58 -44 C62 -42 64 -46 62 -50 L54 -64 L52 -72 L48 -66 C42 -66 34 -60 30 -52 C24 -46 10 -44 -10 -44 Z'), INK);
  P.ctx.restore();
}
function carIcon(P, x, y, s, a = 1) {
  P.ctx.save(); P.ctx.translate(x, y); P.ctx.scale(s, s); P.alpha(a);
  P.fill(svg('M-58 -10 L-56 -24 L-30 -28 L-18 -44 L24 -44 L38 -28 L58 -24 L60 -10 Z'), 'charDk');
  P.fill(ell(-34, -8, 11), 'charDk'); P.fill(ell(36, -8, 11), 'charDk'); P.fill(ell(-34, -8, 5), 'sepia'); P.fill(ell(36, -8, 5), 'sepia');
  P.fill(svg('M-12 -40 L2 -40 L2 -30 L-20 -30 Z M8 -40 L20 -40 L30 -30 L8 -30 Z'), 'sepia');
  P.ctx.restore();
}

// ---- 1915 and 1960 in horses -----------------------------------------------------------------------------------
function isotype(P, f, Ls, t) {
  const ctx = P.ctx, y1 = 330, y2 = 560;
  P.text('1915', 210, y1 - 20, { font: FONT.caps, weight: 700, size: 60, color: INK });
  P.text('1960', 210, y2 - 20, { font: FONT.caps, weight: 700, size: 60, color: INK });
  P.line(svg(`M300 ${y1 + 30} L1440 ${y1 + 30} M300 ${y2 + 30} L1440 ${y2 + 30}`), 1.5, INK);
  // 1915: twenty-six horses pop in, one per eighth of the long first word, then the rest as it's sung
  const a0 = Ls[0].words[0].start, a1 = Ls[0].words.find((w) => w.w.startsWith('horses')).start;
  for (let i = 0; i < 26; i++) {
    const ti = a0 + (i / 26) * (a1 - a0 + 0.3), u = ease.outBack(clamp((t - ti) / 0.25));
    if (u > 0) horseIcon(P, 340 + (i % 13) * 84, y1 - 60 + Math.floor(i / 13) * 76 + 50, 0.78 * u);
  }
  if (t > a1) P.text('26,000,000', 1350, y1 - 90, { font: FONT.caps, weight: 700, size: 30, color: INK, align: 'right' });
  // 1960: three remain; the others walk off the page and cars take their places
  const b0 = Ls[1].words[0].start, b1 = Ls[1].words.find((w) => w.w.startsWith('three')).start;
  if (t > b0 - 0.2) {
    for (let i = 0; i < 26; i++) {
      const stay = i < 3, walk = clamp((t - b1 - (i % 13) * 0.04) / 1.4);
      const x = 340 + (i % 13) * 84 + (stay ? 0 : ease.in(walk) * 1200), y = y2 - 10 + Math.floor(i / 13) * 76;
      if (!stay && walk > 0.3) carIcon(P, 340 + (i % 13) * 84, y, 0.72, clamp((walk - 0.3) / 0.4));
      if (!stay && walk >= 1) continue;
      horseIcon(P, x, y, 0.78, stay ? 1 : 1 - walk * 0.5);
    }
    if (t > b1) P.text('3,000,000', 1350, y2 - 90, { font: FONT.caps, weight: 700, size: 30, color: INK, align: 'right' });
  }
  P.both(rect(980, 640, 460, 50, 6), 'ivory', 2); horseIcon(P, 1020, 676, 0.42); P.text('= one million horses', 1420, 674, { size: 26, style: 'italic', color: 'charDk', align: 'right' });
}

// ---- nobody retrained the horses: an empty schoolroom, one horse, no clue ---------------------------------------
function schoolroom(P, f, Ls, t, lt) {
  const ctx = P.ctx;
  // the chalkboard
  P.both(rect(380, 190, 840, 300, 10), 'ochre', 4); P.both(rect(400, 210, 800, 260, 6), 'charDk', 3);
  P.text('RETRAINING', 800, 280, { font: FONT.caps, weight: 700, size: 48, color: 'cream', tracking: 8 });
  P.text('Lesson 1: Driving', 800, 350, { size: 40, color: 'cream' });
  const cl = Ls[2].words.find((w) => w.w.startsWith('clue')).start;
  if (t > Ls[2].words.find((w) => w.w.startsWith('nobody') && w.start > Ls[2].start + 1)?.start - 0.1) { const u = clamp((t - (cl - 0.6)) / 0.5); P.line(svg(`M480 330 L${480 + 640 * u} ${330 + 30 * u}`), 6, 'red'); P.text('CANCELLED', 800, 430, { font: FONT.caps, weight: 700, size: 34, color: 'red', tracking: 6 }); }
  // empty desks
  for (let i = 0; i < 4; i++) { const x = 360 + i * 260, y = 640; P.both(rect(x - 80, y - 90, 160, 20, 4), 'ochre', 3); P.line(svg(`M${x - 70} ${y - 70} L${x - 70} ${y} M${x + 70} ${y - 70} L${x + 70} ${y}`), 6, INK); }
  // the horse, in a dunce cap, puzzled
  horse(P, 1140, 690, 0.48, Math.sin(lt * 1.2) * 0.2, { color: 'ochre', dark: INK });
  ctx.save(); ctx.translate(1140 + 300 * 0.48, 690 - 440 * 0.48); ctx.rotate(-0.25); P.both(svg('M-36 0 L0 -110 L36 0 Z'), 'ivory', 3); P.text('D', 0, -20, { font: FONT.caps, weight: 700, size: 26 }); ctx.restore();
  if (t > cl - 0.4) { const u = ease.outBack(clamp((t - cl + 0.4) / 0.4)); ctx.save(); ctx.translate(1380, 290); ctx.scale(u, u); P.text('?', 0, 0, { size: 120, weight: 700, color: INK }); ctx.restore(); }
}

// ---- they boiled 'em down to glue: the glue works, and the horses filing in -----------------------------------------
function glueWorks(P, f, Ls, t, lt) {
  const ctx = P.ctx;
  // the works: brick, stacks, smoke
  for (let i = 0; i < 3; i++) { const x = 820 + i * 150; P.both(rect(x, 250, 60, 210), INK, 3); for (let k = 0; k < 3; k++) { const u = ((lt * 0.4 + k * 0.33 + i * 0.1) % 1); ctx.save(); P.alpha(0.7 * (1 - u)); cloud(P, x + 30 + u * 50, 236 - u * 50, 24 + u * 20, 'ivory', k + i); ctx.restore(); } }
  P.both(svg('M700 640 L700 380 L800 300 L900 380 L1000 300 L1100 380 L1200 300 L1300 380 L1300 640 Z'), 'ochre', 4);
  P.tone(svg('M700 640 L700 380 L800 300 L900 380 L1000 300 L1100 380 L1200 300 L1300 380 L1300 640 Z'), INK, { from: [700, 380, 0.1], to: [1300, 640, 0.5], bbox: [700, 300, 1300, 640] }, 6);
  P.both(rect(780, 420, 440, 80, 6), 'ivory', 3); P.text('GLUE WORKS', 1000, 476, { font: FONT.caps, weight: 700, size: 46, tracking: 6, color: INK });
  P.both(svg('M840 640 L840 540 C840 510 920 510 920 540 L920 640 Z'), 'charDk', 3);
  // the horses, a line of them walking in through the door
  ctx.save(); P.clip(rect(0, 0, 846, 900));   // they go in at the door
  for (let i = 0; i < 4; i++) { const x = -160 + ((lt * 80 + i * 250) % 1000); horse(P, x, 652, 0.26, lt * 6 + i * 1.3, { color: 'ochre', dark: INK }); }
  ctx.restore();
}

// ---- and now I'm the glue code too: the bottle with his face in the cartouche --------------------------------------
function bottle(P, f, Ls, t, lt) {
  const ctx = P.ctx, u = ease.outBack(clamp(lt / 0.7)), too = Ls[4].words.find((w) => w.w.startsWith('too')).start;
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2 + t * 0.1; P.line(svg(`M${800 + Math.cos(a) * 220} ${430 + Math.sin(a) * 220} L${800 + Math.cos(a) * 520} ${430 + Math.sin(a) * 520}`), 4, 'ochre'); }
  ctx.save(); ctx.translate(800, 700); ctx.scale(u, u);
  // a squat glue bottle with an orange cap, a label with a portrait cartouche
  P.both(svg('M-170 0 C-190 -10 -190 -40 -180 -60 L-180 -330 C-180 -360 -150 -380 -110 -390 L110 -390 C150 -380 180 -360 180 -330 L180 -60 C190 -40 190 -10 170 0 Z'), 'ivory', 5);
  P.tone(svg('M-170 0 C-190 -10 -190 -40 -180 -60 L-180 -330 C-180 -360 -150 -380 -110 -390 L110 -390 C150 -380 180 -360 180 -330 L180 -60 C190 -40 190 -10 170 0 Z'), INK, { from: [-180, -200, 0], to: [180, -200, 0.4], bbox: [-190, -390, 190, 0] }, 6);
  P.both(rect(-50, -470, 100, 84, 12), 'ochre', 4); P.both(svg('M-20 -470 L0 -520 L20 -470 Z'), 'ochre', 4);
  P.both(rect(-160, -330, 320, 260, 10), 'cream', 4); P.line(rect(-150, -320, 300, 240, 8), 1.5, INK);
  P.both(ell(0, -240, 80, 70), 'goldLt', 4);
  ctx.save(); P.clip(ell(0, -240, 76, 66)); heroFront(P, 0, -230, 0.22, { mouth: 'smile', blink: t > too ? ((t - too) % 1.2 < 0.25 ? 1 : 0) : 0, look: [0, 0.1] }); ctx.restore();
  P.line(ell(0, -240, 80, 70), 4);
  P.text('GLUE CODE', 0, -122, { font: FONT.caps, weight: 700, size: 40, tracking: 4, color: INK });
  P.text('non-toxic · always holds', 0, -92, { size: 18, style: 'italic', color: INK });
  ctx.restore();
}
