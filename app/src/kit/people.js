// The supporting cast (docs/FIGURES.md): one parametric person in the hero's construction, seen from the
// front, bust to half-figure. Same face, line and shading as the hero; hair, tops, accessories and arms
// vary. Unit space is the hero's front-bust space: face ~270 wide, eyes at y=-10, chin at y=200, the
// skull's top ~-245; the bust ends at y=690 and a half-figure at the hips, y=1250.
import { C, at, ell, rect, svg, clamp, rng, FONT } from '../paint.js';
import { features, phoneInHands } from './hero.js';

const FACE = 'M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z';
const SKULL = 'M-138 30 C-150 -120 -100 -240 0 -242 C100 -240 150 -120 138 30 Z';
const TORSO = 'M-56 262 C-120 280 -246 298 -326 338 C-390 372 -418 440 -424 540 L-430 1250 L430 1250 L424 540 C418 440 390 372 326 338 C246 298 120 280 56 262 Z';
const DOT = { skin: 'skinDot', skin2: '#bf917a', skin3: '#a9745b', skin4: '#a8775a', skin5: '#98694d' };
const SKULL_TOP = 'M-138 30 C-150 -120 -100 -240 0 -242 C100 -240 150 -120 138 30', JAW = 'M-135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25';
// the light strands drawn over each hair colour
const STRAND = { hair: '#6b5240', hairBr: '#8d6a50', hairAu: '#c07a52', hairBl: '#e8cf98', hairGr: '#d6d1c8', hairSp: '#aaa196', '#4a3426': '#7a5a42' };

// hair: [front cap, back mass, locks]: the cap is drawn over the forehead, the back mass behind the head and
// shoulders, the locks over the shoulders (in front of the top, behind the face)
const HAIR = {
  short: ['M-142 -4 C-160 -120 -112 -250 4 -252 C118 -248 162 -120 142 -4 C138 -40 132 -72 118 -96 C92 -84 48 -84 6 -98 C-30 -84 -66 -64 -100 -62 C-120 -58 -134 -36 -142 -4 Z'],
  slick: ['M-140 -30 C-156 -160 -110 -290 30 -288 C140 -284 168 -170 142 -30 C136 -84 122 -118 96 -134 C60 -128 10 -132 -30 -142 C-70 -136 -112 -110 -140 -30 Z'],
  messy: ['M-144 -10 C-160 -90 -150 -170 -110 -214 L-120 -246 L-80 -232 L-62 -270 L-30 -246 L0 -278 L26 -246 L66 -268 L78 -230 L118 -242 L110 -208 C150 -170 162 -90 144 -10 C136 -50 126 -80 110 -96 L96 -76 L84 -104 L60 -84 L50 -112 L24 -92 L10 -118 L-14 -94 L-34 -116 L-50 -90 L-70 -112 L-88 -84 L-104 -102 C-124 -80 -136 -50 -144 -10 Z'],
  side: ['M-142 -6 C-160 -130 -104 -254 10 -254 C124 -250 162 -130 142 -6 C134 -56 122 -90 100 -110 C50 -124 -10 -108 -56 -84 C-90 -66 -120 -40 -142 -6 Z'],
  buzz: ['M-140 -20 C-152 -130 -100 -238 0 -240 C100 -238 152 -130 140 -20 C134 -70 124 -100 104 -116 C50 -124 -50 -124 -104 -116 C-124 -100 -134 -70 -140 -20 Z'],
  bun: ['M-142 0 C-158 -126 -104 -244 0 -246 C104 -244 158 -126 142 0 C132 -64 112 -110 70 -124 C30 -134 -30 -134 -70 -124 C-112 -110 -132 -64 -142 0 Z', 'M-60 -236 C-70 -300 70 -300 60 -236 Z'],
  long: ['M-146 20 C-162 -120 -108 -250 0 -252 C108 -250 162 -120 146 20 C140 -50 120 -100 70 -126 C34 -112 10 -100 0 -84 C-10 -100 -34 -112 -70 -126 C-120 -100 -140 -50 -146 20 Z', 'M-150 -40 C-176 100 -170 260 -150 360 L150 360 C170 260 176 100 150 -40 Z'],
  bald: null,
  // a chin-length bob with a side-swept fringe; it hides the ears
  bob: ['M-130 168 C-150 176 -166 172 -176 160 C-186 80 -184 -40 -170 -112 C-152 -212 -82 -260 0 -260 C82 -260 152 -212 170 -112 C184 -40 186 80 176 160 C166 172 150 176 130 168 C126 120 126 40 122 -20 C118 -56 108 -78 94 -90 C46 -80 -14 -90 -64 -112 C-94 -98 -112 -66 -120 -30 C-126 20 -126 100 -130 168 Z',
    'M-176 -40 C-196 40 -194 140 -176 200 C-120 214 120 214 176 200 C194 140 196 40 176 -40 Z'],
  // pulled back smooth, the tail over her right shoulder
  ponytail: ['M-142 -6 C-160 -130 -104 -256 4 -258 C112 -256 160 -130 142 -6 C136 -54 126 -86 108 -108 C70 -128 30 -132 -16 -128 C-60 -122 -100 -102 -122 -76 C-134 -56 -140 -32 -142 -6 Z', null,
    'M84 150 C142 160 198 232 214 322 C226 392 212 454 182 498 C176 452 166 394 150 346 C132 296 110 250 76 214 Z'],
  // long and waving, parted in the middle: the Mucha hair. The whole fall is one shape over the shoulders, behind
  // the face; the cap only fills the crown and draws its hairline
  wavy: ['M-150 40 C-160 -100 -110 -250 0 -252 C110 -250 160 -100 150 40 L134 40 C136 0 130 -40 118 -70 C98 -100 62 -116 26 -112 C14 -118 6 -124 0 -128 C-6 -124 -14 -118 -26 -112 C-62 -116 -98 -100 -118 -70 C-130 -40 -136 0 -134 40 Z', null,
    'M-120 436 C-140 446 -166 440 -176 420 C-196 430 -214 410 -210 380 C-206 350 -190 330 -200 300 C-212 266 -214 236 -200 206 C-186 176 -182 150 -192 116 C-202 80 -196 40 -184 10 C-174 -20 -172 -60 -168 -100 C-164 -180 -110 -262 0 -264 C110 -262 164 -180 168 -100 C172 -60 174 -20 184 10 C196 40 202 80 192 116 C182 150 186 176 200 206 C214 236 212 266 200 300 C190 330 206 350 210 380 C214 410 196 430 176 420 C166 440 140 446 120 436 C110 404 104 370 100 330 C96 280 104 240 96 200 C90 160 70 120 40 100 L-40 100 C-70 120 -90 160 -96 200 C-104 240 -96 280 -100 330 C-104 370 -110 404 -120 436 Z',
    'M134 40 C136 0 130 -40 118 -70 C98 -100 62 -116 26 -112 C14 -118 6 -124 0 -128 C-6 -124 -14 -118 -26 -112 C-62 -116 -98 -100 -118 -70 C-130 -40 -136 0 -134 40'],
  // the old hacker's mane: receding, parted in the middle, falling past the shoulders in waves (with o.beard 'unix')
  unix: ['M-196 150 C-216 60 -198 -20 -208 -90 C-214 -172 -150 -264 -60 -272 C-20 -278 20 -278 60 -272 C150 -264 214 -172 208 -90 C198 -20 216 60 196 150 C184 170 160 162 150 142 C140 152 134 138 132 120 C136 60 134 0 128 -50 C122 -100 100 -136 60 -156 C36 -166 14 -172 0 -188 C-14 -172 -36 -166 -60 -156 C-100 -136 -122 -100 -128 -50 C-134 0 -136 60 -132 120 C-134 138 -140 152 -150 142 C-160 162 -184 170 -196 150 Z',
    'M-130 -214 C-204 -164 -228 -60 -224 30 C-222 100 -252 150 -238 220 C-226 272 -250 320 -224 362 C-210 384 -190 392 -170 388 L170 388 C190 392 210 384 224 362 C250 320 226 272 238 220 C252 150 222 100 224 30 C228 -60 204 -164 130 -214 Z'],
};
const EARLESS = new Set(['bob', 'wavy', 'unix']);

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
  const style = o.hair ?? 'short', strand = STRAND[hc] ?? '#6b5240', dome = style === 'bald' || style === 'unix';
  const acc = new Set(o.acc ?? []), crop = o.crop ?? 690, bb = [x - 460 * s, y - 320 * s, x + 460 * s, y + (crop + 20) * s];
  ctx.save(); P.clip(T(rect(-700, -900, 1400, crop + 900)));
  if (acc.has('halo')) { P.both(ell(x, y - 70 * s, 280 * s), 'goldLt', lw); P.line(ell(x, y - 70 * s, 250 * s), lw * 0.6); P.tone(ell(x, y - 70 * s, 280 * s), 'gold', { from: [x, y - 70 * s, 0], to: [x + 280 * s, y - 70 * s, 0.6], radial: true, bbox: bb }, cell); }
  const hair = HAIR[style];
  if (hair?.[1]) {
    const hb = T(hair[1]); P.fill(hb, hc); P.tone(hb, '#000', { from: [x, y - 100 * s, 0.12], to: [x, y + 330 * s, 0.5], bbox: bb }, fc); P.line(hb, lw);
    if (style === 'unix') P.line(T('M-204 -20 C-214 60 -228 140 -224 220 C-222 290 -234 330 -222 368 M204 -20 C214 60 228 140 224 220 C222 290 234 330 222 368'), lw * 0.5, strand);
  }
  // the neck, then the top
  const neck = T('M-52 140 C-52 206 -46 260 -40 310 L40 310 C46 260 52 206 52 140 Z');
  P.fill(neck, skin); P.tone(neck, dot, { from: [x, y + 170 * s, 0.7], to: [x, y + 280 * s, 0.15], bbox: bb }, fc); P.line(neck, lw * 0.8);
  if (top === 'hoodie') P.both(T('M-158 278 C-150 214 -92 192 0 192 C92 192 150 214 158 278 C110 268 70 262 40 262 L-40 262 C-70 262 -110 268 -158 278 Z'), col, lw * 1.1);   // the hood, down, bunched behind the neck
  drawTop(P, T, x, y, s, o, { lw, cell, bb, col, top, skin, dot, fc });
  if (hair?.[2]) {   // locks over the shoulders
    const lk = T(hair[2]); P.fill(lk, hc); P.tone(lk, '#000', style === 'wavy' ? { from: [x - 60 * s, y - 240 * s, 0], to: [x + 150 * s, y - 40 * s, 0.35], bbox: bb } : { from: [x - 120 * s, y + 100 * s, 0], to: [x + 220 * s, y + 420 * s, 0.4], bbox: bb }, fc); P.line(lk, lw * (style === 'wavy' ? 1.1 : 1));
    if (style === 'wavy') P.line(T('M-150 -60 C-160 20 -176 60 -170 120 C-164 180 -186 230 -180 300 C-176 350 -190 380 -186 410 M150 -60 C160 20 176 60 170 120 C164 180 186 230 180 300 C176 350 190 380 186 410 M-124 220 C-134 280 -120 340 -146 420 M124 220 C134 280 120 340 146 420'), lw * 0.5, strand);
    else P.line(T('M98 178 C150 220 184 300 190 404 M118 198 C158 254 186 334 196 444'), lw * 0.5, strand);
  }
  // head: ears, skull, face, features, hair, hats
  const ears = o.ear ?? !EARLESS.has(style);
  if (ears) for (const sx of [-1, 1]) { const ear = T(`M${sx * 130} -8 C${sx * 150} -28 ${sx * 174} -10 ${sx * 172} 18 C${sx * 170} 46 ${sx * 158} 68 ${sx * 134} 74 Z`); P.both(ear, skin, lw); P.line(T(`M${sx * 146} 6 C${sx * 158} 12 ${sx * 160} 30 ${sx * 150} 44`), lw * 0.5); }
  if (ears && (o.earrings ?? o.fem)) for (const sx of [-1, 1]) { P.line(T(`M${sx * 146} 70 L${sx * 146} 86`), lw * 0.6); P.both(ell(x + sx * 146 * s, y + 94 * s, 9 * s), 'gold', lw * 0.6); }
  const fw = o.fw ?? (o.fem ? 0.95 : 1); P.ctx.save(); P.ctx.translate(x, y); P.ctx.scale(fw, 1); P.ctx.translate(-x, -y);
  P.fill(T(SKULL), skin);
  const face = T(FACE);
  P.fill(face, skin);
  P.tone(face, dot, { from: [x + 40 * s, y, 0], to: [x + 135 * s, y, 0.45], bbox: bb }, fc);
  if (dome) P.tone(T(SKULL), dot, { from: [x + 40 * s, y, 0], to: [x + 135 * s, y, 0.45], bbox: bb }, fc);
  if (o.flush) P.tone(face, 'red', { from: [x, y + 40 * s, 0.24 * o.flush], to: [x + 110 * s, y + 40 * s, 0], radial: true, bbox: bb }, fc);   // sunburnt
  if (o.uplit) P.tone(face, o.glow ?? 'goldLt', { from: [x, y + 200 * s, 0.6 * o.uplit], to: [x, y + 50 * s, 0], bbox: bb }, fc);
  if (dome) { P.line(T(SKULL_TOP), lw * 1.2); P.line(T(JAW), lw * 1.2); } else P.line(face, lw * 1.2);   // a dome has no hairline across the brow
  if (style === 'bald') P.line(T('M-70 -200 C-40 -214 0 -216 30 -210'), lw * 0.5, 'cream');
  if (hair) {
    const hp = T(hair[0]); P.fill(hp, hc);
    P.tone(hp, '#000', { from: [x - 60 * s, y - 240 * s, 0], to: [x + 150 * s, y - 40 * s, 0.35], bbox: bb }, fc);
    P.line(hair[3] ? T(hair[3]) : hp, lw * 1.1);   // a cap that sits inside a fall of hair draws only its hairline
    if (style === 'slick') P.line(T('M-60 -250 C-10 -270 60 -266 110 -230 M-90 -200 C-40 -230 40 -236 120 -190 M-110 -150 C-60 -180 30 -186 130 -140'), lw * 0.6, hc === 'hair' ? '#7a6150' : strand);   // combed back, shining
    else if (style === 'side') P.line(T('M-40 -250 C-30 -200 -34 -150 -50 -110 M-30 -240 C10 -230 70 -200 110 -150'), lw * 0.5);
    else if (style === 'short') P.line(T('M-90 -80 C-40 -100 0 -150 40 -220 M10 -104 C50 -130 80 -170 100 -200'), lw * 0.5);
    else if (style === 'bob') P.line(T('M-24 -252 C-90 -232 -140 -160 -156 -40 C-162 40 -160 110 -154 160 M44 -250 C110 -226 150 -150 160 -30 C164 50 162 110 156 160 M-40 -104 C-10 -150 40 -200 90 -232'), lw * 0.5, strand);
    else if (style === 'ponytail') P.line(T('M-90 -112 C-70 -170 -30 -220 20 -240 M-30 -126 C-10 -180 20 -222 60 -238 M60 -122 C80 -170 92 -210 104 -228'), lw * 0.5, strand);
    else if (style === 'wavy') P.line(T('M-10 -250 C-70 -236 -130 -170 -146 -40 M10 -250 C70 -236 130 -170 146 -40'), lw * 0.5, strand);
    else if (style === 'unix') { P.line(T('M-40 -266 C-112 -244 -172 -172 -184 -60 C-190 20 -172 80 -182 140 M40 -266 C112 -244 172 -172 184 -60 C190 20 172 80 182 140 M-14 -252 C-62 -236 -112 -194 -144 -120 M14 -252 C62 -236 112 -194 144 -120'), lw * 0.55, strand); P.line(T('M0 -192 C-2 -222 0 -250 0 -268'), lw * 0.5); }
    else if (style !== 'buzz') P.line(T('M-60 -214 C-30 -228 20 -228 60 -210'), lw * 0.5, strand);
  }
  if (o.beard && o.beard !== 'unix') {   // an elder's beard, trimmed square
    const bd = T('M-128 60 C-124 150 -90 250 -40 290 C-16 306 16 306 40 290 C90 250 124 150 128 60 C110 90 90 120 60 132 C30 120 -30 120 -60 132 C-90 120 -110 90 -128 60 Z');
    P.both(bd, o.beard, lw); P.line(T('M-40 160 C-30 200 -30 240 -20 270 M0 168 L0 286 M40 160 C30 200 30 240 20 270'), lw * 0.5);
    P.both(T('M-56 104 C-30 92 30 92 56 104 C40 118 -40 118 -56 104 Z'), o.beard, lw * 0.7);
  }
  features(P, x, y, s, T, lw, { glasses: 'none', temples: true, ...o });
  if (o.beard === 'unix') unixBeard(P, T, x, y, s, o, lw, fc, bb);
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

// the Unix beard: full, untrimmed, salt and pepper, down over the chest; the moustache hides the mouth; bushy brows
const BEARD = 'M-134 20 C-124 60 -100 84 -64 92 C-40 96 -20 92 0 92 C20 92 40 96 64 92 C100 84 124 60 134 20 C152 70 184 150 192 230 C200 300 188 372 162 420 C152 462 128 488 106 478 C102 512 80 532 56 516 C46 548 18 562 -2 540 C-22 556 -48 546 -58 514 C-80 528 -104 508 -106 474 C-128 484 -152 458 -162 416 C-188 370 -200 300 -192 230 C-184 150 -152 70 -134 20 Z';
const TASH = 'M0 86 C22 78 54 82 74 100 C92 118 96 144 88 168 C80 154 64 144 48 142 C32 140 16 144 0 136 C-16 144 -32 140 -48 142 C-64 144 -80 154 -88 168 C-96 144 -92 118 -74 100 C-54 82 -22 78 0 86 Z';
function unixBeard(P, T, x, y, s, o, lw, fc, bb) {
  const bc = o.beardColor ?? 'beardSp', bd = T(BEARD);
  P.fill(bd, bc); P.tone(bd, '#000', { from: [x - 80 * s, y + 80 * s, 0], to: [x + 200 * s, y + 520 * s, 0.42], bbox: bb }, fc);
  P.line(T('M-122 110 C-134 210 -126 320 -96 420 M-76 150 C-86 250 -76 350 -56 470 M-24 168 C-28 270 -20 380 -10 500 M32 168 C36 270 32 380 22 500 M84 150 C94 250 88 350 70 462 M128 110 C142 214 136 320 112 420'), lw * 0.55, '#cfc8be');
  P.line(T('M-100 130 C-110 230 -100 330 -80 440 M-50 160 C-56 260 -46 380 -34 500 M8 170 C8 280 6 400 2 520 M58 160 C64 260 60 380 46 488 M106 130 C116 230 112 330 94 444'), lw * 0.45, '#4f4740');
  P.line(bd, lw * 1.15);
  const mo = T(TASH); P.fill(mo, bc); P.tone(mo, '#000', { from: [x - 20 * s, y + 90 * s, 0], to: [x + 90 * s, y + 160 * s, 0.35], bbox: bb }, fc);
  P.line(T('M-8 96 C-30 104 -56 118 -72 146 M8 96 C30 104 56 118 72 146 M-30 98 C-50 110 -70 126 -80 150'), lw * 0.5, '#cfc8be'); P.line(mo, lw);
  for (const sx of [-1, 1]) {   // bushy brows, ragged along the top
    const br = o.stern ? T(`M${sx * 108} -86 L${sx * 100} -96 L${sx * 92} -88 L${sx * 80} -100 L${sx * 70} -90 L${sx * 56} -98 L${sx * 48} -84 L${sx * 34} -84 L${sx * 20} -62 C${sx * 18} -54 ${sx * 24} -48 ${sx * 32} -50 C${sx * 54} -66 ${sx * 78} -72 ${sx * 102} -70 C${sx * 112} -74 ${sx * 114} -82 ${sx * 108} -86 Z`)
      : T(`M${sx * 106} -64 L${sx * 102} -80 L${sx * 90} -78 L${sx * 80} -94 L${sx * 68} -86 L${sx * 54} -96 L${sx * 44} -84 L${sx * 30} -86 L${sx * 22} -76 C${sx * 18} -70 ${sx * 22} -64 ${sx * 28} -64 C${sx * 52} -74 ${sx * 78} -74 ${sx * 100} -58 C${sx * 110} -58 ${sx * 112} -62 ${sx * 106} -64 Z`);
    P.both(br, bc, lw * 0.8);
  }
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


/**
 * personBack(P, x, y, s, o): the same bust seen from behind, as an audience is: shoulders and collar, the neck, ears, the
 * back of the head with its hair (a whorl at the crown) in o.hair style and o.hairColor; o.phone 'left'|'right' holds a
 * phone up at that side, its screen (towards us) showing o.screen(P, w, h) if given. (x, y) the middle of the head.
 */
export function personBack(P, x, y, s, o = {}) {
  const ctx = P.ctx, X = x, Y = y + 50 * s, T = at(X, Y, s), lw = Math.max(1.3, 4 * s), fc = Math.max(2.5, 5 * s), cell = Math.max(3, 7 * s);
  const skin = o.skin ?? 'skin', dot = DOT[skin] ?? 'skinDot', hc = o.hairColor ?? 'hair', style = o.hair ?? 'short', col = o.color ?? 'navy', top = o.top ?? 'tee', strand = STRAND[hc] ?? '#6b5240';
  const bb = [X - 460 * s, Y - 320 * s, X + 460 * s, Y + 900 * s];
  // shoulders and back, the collar
  const body = T(TORSO); P.fill(body, col); P.tone(body, '#000', { from: [X - 100 * s, Y, 0], to: [X + 430 * s, Y + 600 * s, 0.45], bbox: bb }, cell); P.line(body, lw * 1.5);
  P.line(T('M0 330 L0 900'), lw * 0.5);   // the back seam
  P.line(T('M-330 520 C-338 700 -338 900 -334 1250 M330 520 C338 700 338 900 334 1250'), lw * 0.7);
  if (top === 'hoodie') { const hd = T('M-150 250 C-160 330 -110 420 0 440 C110 420 160 330 150 250 C100 270 -100 270 -150 250 Z'); P.fill(hd, col); P.tone(hd, '#000', { from: [X, Y + 250 * s, 0.1], to: [X + 150 * s, Y + 440 * s, 0.5], bbox: bb }, cell); P.line(hd, lw); P.line(T('M0 268 L0 436'), lw * 0.6); }
  else if (top === 'shirt' || top === 'vest') P.both(T('M-70 250 C-40 236 40 236 70 250 L66 286 C30 276 -30 276 -66 286 Z'), top === 'vest' ? (o.shirt ?? 'shirt') : col, lw);
  else P.line(T('M-62 262 C-30 250 30 250 62 262'), lw);
  // the neck, ears
  const neck = T('M-54 120 C-54 180 -50 230 -46 280 L46 280 C50 230 54 180 54 120 Z'); P.fill(neck, skin); P.tone(neck, dot, { from: [X, Y + 150 * s, 0.6], to: [X, Y + 270 * s, 0.1], bbox: bb }, fc); P.line(neck, lw * 0.8);
  if (style !== 'long' && style !== 'wavy' && style !== 'bob') for (const sx of [-1, 1]) { const ear = T(`M${sx * 128} -16 C${sx * 162} -34 ${sx * 178} 0 ${sx * 168} 30 C${sx * 160} 58 ${sx * 146} 74 ${sx * 126} 70 Z`); P.both(ear, skin, lw); P.tone(ear, dot, { from: [X + sx * 128 * s, Y, 0], to: [X + sx * 170 * s, Y + 40 * s, 0.4], bbox: bb }, fc); }
  // the back of the head
  const head = T('M0 -246 C96 -244 150 -150 150 -40 C150 50 110 130 56 156 L-56 156 C-110 130 -150 50 -150 -40 C-150 -150 -96 -244 0 -246 Z');
  P.fill(head, skin); P.tone(head, dot, { from: [X - 40 * s, Y - 100 * s, 0], to: [X + 150 * s, Y + 100 * s, 0.45], bbox: bb }, fc); P.line(head, lw * 1.2);
  const H = {
    short: 'M0 -256 C104 -254 162 -150 160 -40 C158 30 140 80 110 112 C80 100 40 96 0 104 C-40 96 -80 100 -110 112 C-140 80 -158 30 -160 -40 C-162 -150 -104 -254 0 -256 Z',
    buzz: 'M0 -250 C98 -248 154 -150 154 -40 C154 30 136 76 108 104 C70 96 30 92 0 98 C-30 92 -70 96 -108 104 C-136 76 -154 30 -154 -40 C-154 -150 -98 -248 0 -250 Z',
    bald: 'M-150 -40 C-152 20 -136 70 -110 104 C-70 96 -30 92 0 98 C30 92 70 96 110 104 C136 70 152 20 150 -40 C120 -30 100 -70 96 -110 C40 -96 -40 -96 -96 -110 C-100 -70 -120 -30 -150 -40 Z',
    long: 'M0 -260 C110 -258 168 -150 166 -30 C166 100 180 260 172 400 L-172 400 C-180 260 -166 100 -166 -30 C-168 -150 -110 -258 0 -260 Z',
    wavy: 'M0 -262 C112 -260 172 -150 170 -30 C168 80 196 160 180 240 C166 310 196 360 176 420 L-176 420 C-196 360 -166 310 -180 240 C-196 160 -168 80 -170 -30 C-172 -150 -112 -260 0 -262 Z',
    bob: 'M0 -262 C112 -260 176 -150 176 -20 C176 70 172 130 162 168 L-162 168 C-172 130 -176 70 -176 -20 C-176 -150 -112 -260 0 -262 Z',
  };
  const shape = H[style] ?? (style === 'bun' || style === 'ponytail' || style === 'slick' || style === 'side' || style === 'messy' ? H.short : H.short);
  const hp = T(shape);
  if (style === 'buzz') { ctx.save(); P.alpha(0.75); P.fill(hp, hc); ctx.restore(); P.tone(hp, '#000', { from: [X, Y - 250 * s, 0.1], to: [X + 150 * s, Y + 100 * s, 0.4], bbox: bb }, fc); }
  else { P.fill(hp, hc); P.tone(hp, '#000', { from: [X - 60 * s, Y - 240 * s, 0], to: [X + 160 * s, Y + 120 * s, 0.4], bbox: bb }, fc); P.line(hp, lw * 1.1); }
  // the crown's whorl and the hair falling from it
  if (style !== 'bald') {
    const wy = style === 'long' || style === 'wavy' || style === 'bob' ? -200 : -170;
    P.line(T(`M0 ${wy} C14 ${wy - 10} 16 ${wy + 12} 0 ${wy + 12} C-14 ${wy + 12} -18 ${wy - 8} -4 ${wy - 18}`), lw * 0.6, strand);
    for (let k = 0; k < 6; k++) { const a = -0.5 + k * 0.6, ex = Math.cos(a + 1.2) * 140, ey = wy + 40 + Math.abs(Math.sin(a + 1.2)) * 230; P.line(T(`M${Math.cos(a) * 14} ${wy + Math.sin(a) * 14} Q${ex * 0.5 + 20} ${wy + 20} ${ex} ${Math.min(ey, style === 'long' || style === 'wavy' ? 380 : 90)}`), lw * 0.5, strand); }
  } else P.line(T('M-60 -200 C-20 -224 30 -222 60 -196'), lw * 0.5, 'cream');
  if (style === 'bun') { const bn = T('M-56 -232 C-62 -310 62 -310 56 -232 Z'); P.both(bn, hc, lw); P.line(T('M-40 -262 C-10 -280 20 -280 42 -260'), lw * 0.5, strand); P.both(T('M-58 -236 L58 -236 L56 -222 L-56 -222 Z'), 'rose', lw * 0.7); }
  if (style === 'ponytail') { P.both(T('M-24 -150 L24 -150 L20 -128 L-20 -128 Z'), 'red', lw * 0.7); const tl = T('M-26 -130 C-50 -40 -40 80 -20 200 C-6 236 6 236 20 200 C40 80 50 -40 26 -130 Z'); P.both(tl, hc, lw); P.line(T('M-8 -110 C-18 0 -12 100 0 200 M10 -110 C18 0 14 100 6 190'), lw * 0.5, strand); }
  // a phone held up to film the stage, its screen towards us
  if (o.phone) {
    const sx = o.phone === 'left' ? -1 : 1, px = sx * 120, py = -360;
    const arm = T(`M${sx * 330} 700 C${sx * 300} 400 ${sx * 220} ${py + 260} ${px + sx * 20} ${py + 120} L${px - sx * 50} ${py + 140} C${sx * 150} ${py + 300} ${sx * 210} 420 ${sx * 220} 700 Z`);
    P.fill(arm, col); P.tone(arm, '#000', { from: [X + sx * 150 * s, Y + py * s, 0.1], to: [X + sx * 330 * s, Y + 700 * s, 0.45], bbox: bb }, cell); P.line(arm, lw * 1.2);
    const ph = T(rect(px - 62, py - 120, 124, 220, 20)); P.both(ph, 'black', lw);
    const sc = [X + (px - 52) * s, Y + (py - 108) * s, 104 * s, 196 * s];
    ctx.save(); P.clip(T(rect(px - 52, py - 108, 104, 196, 12))); P.fill(T(rect(px - 52, py - 108, 104, 196)), 'night');
    if (o.screen) { ctx.save(); ctx.translate(sc[0], sc[1]); o.screen(P, sc[2], sc[3]); ctx.restore(); }
    ctx.restore();
    const hand = T(`M${px - 64} ${py + 40} C${px - 74} ${py + 70} ${px - 60} ${py + 110} ${px - 20} ${py + 116} L${px + 30} ${py + 116} C${px + 60} ${py + 110} ${px + 70} ${py + 80} ${px + 64} ${py + 50} Z`);
    P.fill(hand, skin); P.tone(hand, dot, { from: [X + px * s, Y + (py + 40) * s, 0], to: [X + (px + 60) * s, Y + (py + 116) * s, 0.45], bbox: bb }, fc); P.line(hand, lw);
    P.line(T(`M${px - 40} ${py + 60} L${px - 40} ${py + 100} M${px - 12} ${py + 64} L${px - 12} ${py + 108} M${px + 16} ${py + 64} L${px + 16} ${py + 106}`), lw * 0.5);
  }
}
