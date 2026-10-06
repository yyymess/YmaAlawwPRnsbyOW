// The supporting cast (docs/FIGURES.md): one parametric person in the hero's construction, seen from the
// front, bust to half-figure. Same face, line and shading as the hero; hair, tops, accessories and arms
// vary. Unit space is the hero's front-bust space: face ~270 wide, eyes at y=-10, chin at y=200, the
// skull's top ~-245; the bust ends at y=690 and a half-figure at the hips, y=1250.
import { C, at, ell, rect, svg, clamp, rng, FONT } from '../paint.js';
import { features, phoneInHands } from './hero.js';

const FACE = 'M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z';
const SKULL = 'M-138 30 C-150 -120 -100 -240 0 -242 C100 -240 150 -120 138 30 Z';
const TORSO = 'M-56 262 C-120 280 -246 298 -326 338 C-390 372 -418 440 -424 540 L-430 1250 L430 1250 L424 540 C418 440 390 372 326 338 C246 298 120 280 56 262 Z';
const DOT = { skin: 'skinDot', skin2: '#bf917a', skin3: '#a9745b' };

// hair: [front cap, optional back mass]; the cap is drawn over the forehead, the back behind the head
const HAIR = {
  short: ['M-142 -4 C-160 -120 -112 -250 4 -252 C118 -248 162 -120 142 -4 C138 -40 132 -72 118 -96 C92 -84 48 -84 6 -98 C-30 -84 -66 -64 -100 -62 C-120 -58 -134 -36 -142 -4 Z'],
  slick: ['M-140 -30 C-156 -160 -110 -290 30 -288 C140 -284 168 -170 142 -30 C136 -84 122 -118 96 -134 C60 -128 10 -132 -30 -142 C-70 -136 -112 -110 -140 -30 Z'],
  messy: ['M-144 -10 C-160 -90 -150 -170 -110 -214 L-120 -246 L-80 -232 L-62 -270 L-30 -246 L0 -278 L26 -246 L66 -268 L78 -230 L118 -242 L110 -208 C150 -170 162 -90 144 -10 C136 -50 126 -80 110 -96 L96 -76 L84 -104 L60 -84 L50 -112 L24 -92 L10 -118 L-14 -94 L-34 -116 L-50 -90 L-70 -112 L-88 -84 L-104 -102 C-124 -80 -136 -50 -144 -10 Z'],
  side: ['M-142 -6 C-160 -130 -104 -254 10 -254 C124 -250 162 -130 142 -6 C134 -56 122 -90 100 -110 C50 -124 -10 -108 -56 -84 C-90 -66 -120 -40 -142 -6 Z'],
  buzz: ['M-140 -20 C-152 -130 -100 -238 0 -240 C100 -238 152 -130 140 -20 C134 -70 124 -100 104 -116 C50 -124 -50 -124 -104 -116 C-124 -100 -134 -70 -140 -20 Z'],
  bun: ['M-142 0 C-158 -126 -104 -244 0 -246 C104 -244 158 -126 142 0 C132 -64 112 -110 70 -124 C30 -134 -30 -134 -70 -124 C-112 -110 -132 -64 -142 0 Z', 'M-60 -236 C-70 -300 70 -300 60 -236 Z'],
  long: ['M-146 20 C-162 -120 -108 -250 0 -252 C108 -250 162 -120 146 20 C140 -50 120 -100 70 -126 C34 -112 10 -100 0 -84 C-10 -100 -34 -112 -70 -126 C-120 -100 -140 -50 -146 20 Z', 'M-150 -40 C-176 100 -170 260 -150 360 L150 360 C170 260 176 100 150 -40 Z'],
  bald: null,
};

/**
 * person(P, x, y, s, o): a front bust/half-figure centred on the face.
 * o: skin 'skin'|'skin2'|'skin3', hair style (HAIR) + hairColor, glasses 'none'|'round'|'rect', mouth,
 *    blink, look, brow, stern, uplit, top 'tee'|'shirt'|'vest'|'hoodie'|'turtleneck'|'gown'|'hawaiian'|'robe',
 *    color (the top), shirt (under a vest), print (tee text), acc [] of 'lanyard'|'camera'|'halo'|'headphones'|
 *    'cap'|'sunhat'|'mortar'|'stole', arms 'down'|'phone'|'hold' (+ object(P) drawn in the hands' space),
 *    crop (bottom of the figure, default 690), ear (default true).
 */
export function person(P, x, y, s, o = {}) {
  if (o.still !== true) y += Math.sin((P.t ?? 0) * (1.7 + ((x * 0.37) % 0.5)) + x * 0.029) * 3.2 * s;   // breathing, out of step with the others
  const ctx = P.ctx, T = at(x, y, s), lw = Math.max(1.3, 4 * s), cell = Math.max(3, 7 * s), fc = Math.max(2.5, 5 * s);
  const skin = o.skin ?? 'skin', dot = DOT[skin] ?? 'skinDot', hc = o.hairColor ?? 'hair', top = o.top ?? 'tee', col = o.color ?? 'teal';
  const acc = new Set(o.acc ?? []), crop = o.crop ?? 690, bb = [x - 460 * s, y - 320 * s, x + 460 * s, y + (crop + 20) * s];
  ctx.save(); P.clip(T(rect(-700, -900, 1400, crop + 900)));
  if (acc.has('halo')) { P.both(ell(x, y - 70 * s, 280 * s), 'goldLt', lw); P.line(ell(x, y - 70 * s, 250 * s), lw * 0.6); P.tone(ell(x, y - 70 * s, 280 * s), 'gold', { from: [x, y - 70 * s, 0], to: [x + 280 * s, y - 70 * s, 0.6], radial: true, bbox: bb }, cell); }
  const hair = o.hair === undefined ? HAIR.short : HAIR[o.hair];
  if (hair?.[1]) { P.both(T(hair[1]), hc, lw); }
  // the neck, then the top
  const neck = T('M-52 140 C-52 206 -46 260 -40 310 L40 310 C46 260 52 206 52 140 Z');
  P.fill(neck, skin); P.tone(neck, dot, { from: [x, y + 170 * s, 0.7], to: [x, y + 280 * s, 0.15], bbox: bb }, fc); P.line(neck, lw * 0.8);
  if (top === 'hoodie') P.both(T('M-158 278 C-150 214 -92 192 0 192 C92 192 150 214 158 278 C110 268 70 262 40 262 L-40 262 C-70 262 -110 268 -158 278 Z'), col, lw * 1.1);   // the hood, down, bunched behind the neck
  drawTop(P, T, x, y, s, o, { lw, cell, bb, col, top, skin, dot, fc });
  // head: ears, skull, face, features, hair, hats
  if (o.ear !== false) for (const sx of [-1, 1]) { const ear = T(`M${sx * 130} -8 C${sx * 150} -28 ${sx * 174} -10 ${sx * 172} 18 C${sx * 170} 46 ${sx * 158} 68 ${sx * 134} 74 Z`); P.both(ear, skin, lw); P.line(T(`M${sx * 146} 6 C${sx * 158} 12 ${sx * 160} 30 ${sx * 150} 44`), lw * 0.5); }
  const fw = o.fw ?? 1; P.ctx.save(); P.ctx.translate(x, y); P.ctx.scale(fw, 1); P.ctx.translate(-x, -y);
  P.fill(T(SKULL), skin);
  const face = T(FACE);
  P.fill(face, skin);
  P.tone(face, dot, { from: [x + 40 * s, y, 0], to: [x + 135 * s, y, 0.45], bbox: bb }, fc);
  if (o.uplit) P.tone(face, o.glow ?? 'goldLt', { from: [x, y + 200 * s, 0.6 * o.uplit], to: [x, y + 50 * s, 0], bbox: bb }, fc);
  P.line(T(o.hair === 'bald' ? SKULL : FACE), lw * 1.2);
  if (o.hair === 'bald') { P.line(face, lw * 1.2); P.line(T('M-70 -200 C-40 -214 0 -216 30 -210'), lw * 0.5, 'cream'); }
  if (hair) {
    const hp = T(hair[0]); P.fill(hp, hc);
    P.tone(hp, '#000', { from: [x - 60 * s, y - 240 * s, 0], to: [x + 150 * s, y - 40 * s, 0.35], bbox: bb }, fc);
    P.line(hp, lw * 1.1);
    if (o.hair === 'slick') P.line(T('M-60 -250 C-10 -270 60 -266 110 -230 M-90 -200 C-40 -230 40 -236 120 -190 M-110 -150 C-60 -180 30 -186 130 -140'), lw * 0.6, '#7a6150');   // combed back, shining
    else if (o.hair === 'side') P.line(T('M-40 -250 C-30 -200 -34 -150 -50 -110 M-30 -240 C10 -230 70 -200 110 -150'), lw * 0.5);
    else if (o.hair === 'short') P.line(T('M-90 -80 C-40 -100 0 -150 40 -220 M10 -104 C50 -130 80 -170 100 -200'), lw * 0.5);
    else if (o.hair !== 'buzz') P.line(T('M-60 -214 C-30 -228 20 -228 60 -210'), lw * 0.5, '#6b5240');
  }
  if (o.beard) {   // an elder's beard, trimmed square
    const bd = T('M-128 60 C-124 150 -90 250 -40 290 C-16 306 16 306 40 290 C90 250 124 150 128 60 C110 90 90 120 60 132 C30 120 -30 120 -60 132 C-90 120 -110 90 -128 60 Z');
    P.both(bd, o.beard, lw); P.line(T('M-40 160 C-30 200 -30 240 -20 270 M0 168 L0 286 M40 160 C30 200 30 240 20 270'), lw * 0.5);
    P.both(T('M-56 104 C-30 92 30 92 56 104 C40 118 -40 118 -56 104 Z'), o.beard, lw * 0.7);
  }
  features(P, x, y, s, T, lw, { glasses: 'none', temples: true, ...o });
  P.ctx.restore();
  hats(P, T, x, y, s, o, acc, lw, cell, bb);
  if (acc.has('shoot')) {   // the camera held up to his eye in both hands, the lens towards us
    for (const sx of [-1, 1]) { P.both(T(`M${sx * 330} 700 C${sx * 330} 420 ${sx * 262} 200 ${sx * 186} 120 L${sx * 124} 160 C${sx * 200} 250 ${sx * 232} 440 ${sx * 228} 700 Z`), o.color ?? 'teal', lw); }
    P.both(T(rect(-150, -86, 300, 172, 22)), 'black', lw); P.both(T(rect(-130, -116, 80, 34, 8)), 'char', lw);
    P.both(ell(x + 10 * s, y - 2 * s, 66 * s), 'char', lw); P.both(ell(x + 10 * s, y - 2 * s, 46 * s), 'glass', lw * 0.8); P.line(ell(x + 10 * s, y - 2 * s, 24 * s), lw * 0.6); P.fill(ell(x - 4 * s, y - 18 * s, 10 * s), 'cream');
    for (const sx of [-1, 1]) { const hnd = T(`M${sx * 150} -60 C${sx * 196} -64 ${sx * 210} 0 ${sx * 200} 60 C${sx * 192} 110 ${sx * 160} 124 ${sx * 132} 112 L${sx * 132} -40 Z`); P.fill(hnd, o.skin ?? 'skin'); P.line(hnd, lw); P.line(T(`M${sx * 150} -20 L${sx * 196} -16 M${sx * 150} 16 L${sx * 198} 20 M${sx * 150} 52 L${sx * 192} 56`), lw * 0.5); }
  }
  // accessories on the chest, then the arms
  if (acc.has('lanyard')) {
    P.line(T('M-62 272 C-56 380 -30 470 -10 520 M62 272 C56 380 30 470 10 520'), lw * 3.4); P.line(T('M-62 272 C-56 380 -30 470 -10 520 M62 272 C56 380 30 470 10 520'), lw * 2, o.lanyardColor ?? 'red');
    P.both(T(rect(-50, 512, 100, 132, 10)), 'cream', lw); P.both(T(rect(-32, 534, 64, 56, 6)), 'glass', lw * 0.6); P.line(T('M-30 612 L30 612 M-30 626 L14 626'), lw * 0.6);
  }
  if (acc.has('camera')) {
    P.line(T('M-60 268 C-120 360 -120 470 -96 548 M60 268 C120 360 120 470 96 548'), lw * 2.2);
    P.both(T(rect(-110, 530, 220, 130, 18)), 'black', lw); P.both(T(rect(-80, 512, 70, 24, 6)), 'char', lw * 0.8);
    P.both(ell(x + 20 * s, y + 600 * s, 52 * s), 'char', lw); P.both(ell(x + 20 * s, y + 600 * s, 34 * s), 'glass', lw * 0.8); P.line(ell(x + 20 * s, y + 600 * s, 18 * s), lw * 0.6);
  }
  if (o.arms === 'phone') phoneInHands(P, x, y, s, { ...o, hood: col });
  else if (o.arms === 'hold' && o.object) holdObject(P, x, y, s, o, { lw, cell, fc, col, skin, dot });
  ctx.restore();
}

function drawTop(P, T, x, y, s, o, k) {
  const { lw, cell, bb, col, top, skin, dot, fc } = k;
  const body = T(TORSO);
  if (top === 'vest') {   // a fleece vest over a button-down: the shirt shows at the arms and collar
    P.fill(body, o.shirt ?? 'shirt'); P.tone(body, '#7d8a8c', { from: [x + 200 * s, y, 0], to: [x + 430 * s, y, 0.5], bbox: bb }, cell); P.line(body, lw * 1.6);
    for (const sx of [-1, 1]) P.line(T(`M${sx * 322} 520 C${sx * 330} 700 ${sx * 330} 900 ${sx * 326} 1250`), lw * 0.7);
    const vest = T('M-84 250 L-78 206 C-40 196 40 196 78 206 L84 250 C150 272 238 318 286 384 C302 470 300 620 298 1250 L-298 1250 C-300 620 -302 470 -286 384 C-238 318 -150 272 -84 250 Z');
    P.fill(vest, col); P.tone(vest, '#000', { from: [x + 60 * s, y, 0], to: [x + 300 * s, y, 0.4], bbox: bb }, cell); P.line(vest, lw * 1.4);
    P.both(T('M-34 214 L-26 300 L-12 288 Z'), 'shirt', lw * 0.6); P.both(T('M34 214 L26 300 L12 288 Z'), 'shirt', lw * 0.6);   // the collar points peeking
    P.line(T('M0 206 L0 1250'), lw * 0.9); P.both(T(rect(-9, 296, 18, 40, 4)), 'silver', lw * 0.6);                     // the zip and its pull
    P.line(T('M-286 384 C-250 420 -230 520 -232 600 M286 384 C250 420 230 520 232 600'), lw * 0.5);                  // armhole seams
    P.both(T(rect(140, 420, 70, 26, 4)), 'cream', lw * 0.5);                                                        // a small blank patch
    return;
  }
  const base = { tee: col, shirt: col, hoodie: col, turtleneck: col, gown: col, hawaiian: col, robe: col }[top] ?? col;
  P.fill(body, base);
  P.tone(body, '#000', { from: [x + 120 * s, y, 0], to: [x + 430 * s, y, top === 'gown' ? 0.3 : 0.42], bbox: bb }, cell);
  if (top === 'hawaiian') {   // a print of small flowers
    const r = rng(o.seed ?? 5); P.save(); P.clip(body);
    for (let i = 0; i < 60; i++) { const fx = -420 + r() * 840, fy = 280 + r() * 980; P.ctx.save(); P.ctx.translate(x + fx * s, y + fy * s); P.ctx.scale(s, s); for (let k2 = 0; k2 < 5; k2++) { P.ctx.save(); P.ctx.rotate(k2 * 1.2566 + i); P.both(svg('M0 0 C-12 -10 -10 -30 0 -34 C10 -30 12 -10 0 0 Z'), i % 3 ? 'cream' : 'goldLt', 2); P.ctx.restore(); } P.ctx.restore(); }
    P.restore();
  }
  P.line(body, lw * 1.6);
  for (const sx of [-1, 1]) P.line(T(`M${sx * 330} 520 C${sx * 338} 700 ${sx * 338} 900 ${sx * 334} 1250`), lw * 0.7);       // the arms against the body
  if (top === 'tee' || top === 'hawaiian') {
    if (top === 'tee') { P.line(T('M-66 266 C-40 318 40 318 66 266'), lw); P.line(T('M-80 262 C-48 332 48 332 80 262'), lw * 0.6); }
    for (const sx of [-1, 1]) { const arm = T(`M${sx * 330} 640 C${sx * 370} 652 ${sx * 410} 648 ${sx * 428} 636 L${sx * 432} 1250 L${sx * 334} 1250 C${sx * 336} 1000 ${sx * 336} 800 ${sx * 330} 640 Z`); P.fill(arm, skin); P.tone(arm, dot, { from: [x + sx * 330 * s, y, 0.1], to: [x + sx * 430 * s, y, 0.4], bbox: bb }, fc); P.line(arm, lw * 1.2); }
    if (o.print) { const [a, b] = o.print.split('|'); P.text(a, x, y + 400 * s, { font: FONT.caps, weight: 700, size: 70 * s, color: 'cream' }); if (b) P.text(b, x, y + 466 * s, { font: FONT.caps, weight: 700, size: 52 * s, color: 'cream' }); }
  }
  if (top === 'hawaiian') { P.both(T('M-60 262 L-130 330 L-40 360 L0 320 Z'), col, lw); P.both(T('M60 262 L130 330 L40 360 L0 320 Z'), col, lw); P.line(T('M0 320 L0 1250'), lw * 0.7); }
  if (top === 'shirt') {
    P.both(T('M-64 256 C-60 286 -38 324 -6 342 L-2 300 C-26 292 -48 278 -64 256 Z'), col, lw); P.both(T('M64 256 C60 286 38 324 6 342 L2 300 C26 292 48 278 64 256 Z'), col, lw);
    P.line(T('M0 300 L0 1250'), lw * 0.8); for (let by = 390; by < 1250; by += 130) P.both(ell(x + 14 * s, y + by * s, 7 * s), 'cream', lw * 0.5);
    P.line(T(rect(-250, 430, 110, 120, 6)), lw * 0.6);
  }
  if (top === 'hoodie') {
    P.both(T('M-58 262 C-36 300 -16 320 0 336 C16 320 36 300 58 262 L40 262 C28 286 14 300 0 310 C-14 300 -28 286 -40 262 Z'), col, lw);
    for (const sx of [-1, 1]) { const str = T(`M${sx * 28} 300 C${sx * 34} 380 ${sx * 26} 440 ${sx * 36} 500`); P.line(str, lw * 2.2); P.line(str, lw * 1.1, 'cream'); }
    P.line(T('M-214 1250 L-188 1000 L188 1000 L214 1250'), lw * 0.8);
  }
  if (top === 'turtleneck') { const tn = T('M-64 316 L-60 200 C-30 188 30 188 60 200 L64 316 C30 330 -30 330 -64 316 Z'); P.both(tn, col, lw); P.line(T('M-60 240 C-20 252 20 252 60 240 M-62 276 C-20 290 20 290 62 276'), lw * 0.5); }
  if (top === 'gown') {
    P.both(T('M-66 262 L0 420 L66 262 L40 258 L0 360 L-40 258 Z'), 'cream', lw);                                    // the collar
    for (const sx of [-1, 1]) P.both(T(`M${sx * 70} 262 C${sx * 110} 300 ${sx * 130} 400 ${sx * 118} 1250 L${sx * 46} 1250 C${sx * 56} 700 ${sx * 50} 420 ${sx * 20} 330 Z`), o.stole ?? 'gold', lw);   // the stole
    for (const sx of [-1, 1]) P.line(T(`M${sx * 200} 500 C${sx * 210} 700 ${sx * 230} 900 ${sx * 240} 1250`), lw * 0.5);
  }
  if (top === 'robe') {   // an icon's robe: a mantle over the left shoulder with a gold border
    P.both(T('M-56 262 C-120 280 -246 298 -326 338 C-390 372 -418 440 -424 540 L-430 1250 L-60 1250 C-20 900 60 600 210 300 C150 284 100 274 56 262 Z'), o.mantle ?? 'rose', lw * 1.4);
    P.line(T('M210 300 C60 600 -20 900 -60 1250'), lw * 6, 'gold'); P.line(T('M210 300 C60 600 -20 900 -60 1250'), lw * 1.2);
    P.line(T('M-60 268 C-30 300 30 300 60 268'), lw * 4, 'gold');
  }
}

function hats(P, T, x, y, s, o, acc, lw, cell, bb) {
  if (acc.has('cap')) { P.both(T('M-150 -120 C-150 -250 150 -250 150 -120 Z'), o.capColor ?? 'red', lw); P.both(T('M-150 -124 C-60 -140 60 -140 150 -124 C120 -86 -120 -86 -150 -124 Z'), o.capColor ?? 'red', lw); P.both(ell(x, y - 246 * s, 12 * s), o.capColor ?? 'red', lw * 0.6); }
  if (acc.has('sunhat')) { P.both(T('M-300 -150 C-200 -190 200 -190 300 -150 C250 -110 -250 -110 -300 -150 Z'), o.hatColor ?? 'sepia', lw); P.both(T('M-150 -160 C-150 -290 150 -290 150 -160 Z'), o.hatColor ?? 'sepia', lw); P.line(T('M-150 -172 C-50 -186 50 -186 150 -172'), lw * 4, o.bandColor ?? 'rose'); }
  if (acc.has('mortar')) { P.both(T('M-150 -160 C-150 -236 150 -236 150 -160 C60 -150 -60 -150 -150 -160 Z'), 'black', lw); P.both(T('M0 -320 L250 -250 L0 -180 L-250 -250 Z'), 'black', lw); P.both(ell(x, y - 250 * s, 12 * s), 'gold', lw * 0.6); P.line(T('M0 -250 L180 -250 L190 -150'), lw * 1.6, 'gold'); P.both(T(rect(180, -158, 22, 60, 6)), 'gold', lw * 0.6); }
  if (acc.has('headphones')) { P.line(T('M-160 -10 C-170 -260 170 -260 160 -10'), lw * 4); P.line(T('M-160 -10 C-170 -260 170 -260 160 -10'), lw * 2.2, 'char'); for (const sx of [-1, 1]) P.both(T(rect(sx * 172 - 26, -40, 52, 100, 22)), 'char', lw); }
}

/** forearms coming up from below, hands holding an object at the chest (drawn by o.object in local units) */
function holdObject(P, x, y, s, o, k) {
  const { lw, cell, col, skin, dot, fc } = k, T = at(x, y, s), hy = o.holdY ?? 640;
  for (const sx of [-1, 1]) {
    const sl = T(`M${sx * 430} 1260 C${sx * 420} 1000 ${sx * 380} ${hy + 160} ${sx * 250} ${hy + 90} L${sx * 160} ${hy + 160} C${sx * 260} ${hy + 280} ${sx * 300} 1000 ${sx * 300} 1260 Z`);
    P.fill(sl, col); P.tone(sl, '#000', { from: [x + sx * 200 * s, y + hy * s, 0.05], to: [x + sx * 430 * s, y + 1000 * s, 0.4], bbox: [x - 460 * s, y + (hy - 100) * s, x + 460 * s, y + 1300 * s] }, cell); P.line(sl, lw * 1.3);
  }
  P.ctx.save(); P.ctx.translate(x, y + hy * s); P.ctx.scale(s, s); o.object(P); P.ctx.restore();
  for (const sx of [-1, 1]) {
    const hand = T(`M${sx * 236} ${hy + 120} C${sx * 250} ${hy + 40} ${sx * 220} ${hy - 30} ${sx * 170} ${hy - 50} C${sx * 120} ${hy - 60} ${sx * 104} ${hy - 20} ${sx * 112} ${hy + 20} C${sx * 120} ${hy + 70} ${sx * 140} ${hy + 120} ${sx * 170} ${hy + 160} Z`);
    P.fill(hand, skin); P.tone(hand, dot, { from: [x + sx * 120 * s, y + hy * s, 0], to: [x + sx * 240 * s, y + (hy + 120) * s, 0.45], bbox: [x - 300 * s, y + (hy - 80) * s, x + 300 * s, y + (hy + 200) * s] }, fc); P.line(hand, lw * 1.1);
    for (let i = 0; i < 3; i++) P.line(T(`M${sx * (120 + i * 6)} ${hy - 26 + i * 34} C${sx * 150} ${hy - 30 + i * 34} ${sx * 176} ${hy - 20 + i * 34} ${sx * 196} ${hy - 6 + i * 34}`), lw * 0.5);
    P.both(T(`M${sx * 236} ${hy + 110} L${sx * 160} ${hy + 168} L${sx * 182} ${hy + 196} L${sx * 256} ${hy + 140} Z`), 'tealLt', lw);
  }
}
