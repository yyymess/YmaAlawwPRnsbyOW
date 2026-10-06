// The hero (see docs/FIGURES.md): teal hoodie with the hood up, round glasses, clean-shaven, a fringe
// showing under the hood. Front, side and back busts (the front can hold a phone up) and a walking profile.
import { C, at, ell, rect, svg, clamp } from '../paint.js';

// Front bust unit space: face ~270 wide, eyes at y=-10, chin at y=200, top of the skull ~-225; the bust
// reaches y=690. The proportions follow hoodie reference sheets: the hood hugs the skull with a little
// slack, its edge sits on the forehead and over the cheeks, and the shoulders are ~2.3 hoods wide.
const FRONT = {
  // body and hood are one silhouette: the hood rises to a soft point at the crown seam, falls nearly
  // straight past the jaw and spreads onto dropped shoulders
  sil: 'M0 -284 C-26 -258 -146 -216 -176 -122 C-196 -60 -198 40 -192 120 C-188 172 -188 214 -198 252 C-236 292 -300 314 -356 348 C-404 380 -422 462 -426 562 L-428 690 L428 690 L426 562 C422 462 404 380 356 348 C300 314 236 292 198 252 C188 214 188 172 192 120 C198 40 196 -60 176 -122 C146 -216 26 -258 0 -284 Z',
  // the doubled rim (a gently pointed arch) and the dark hollow inside it, down to a V at the collarbone
  rim: 'M0 -162 C-44 -146 -150 -108 -158 -16 C-166 70 -152 156 -118 212 C-88 258 -46 292 0 320 C46 292 88 258 118 212 C152 156 166 70 158 -16 C150 -108 44 -146 0 -162 Z',
  hollow: 'M0 -130 C-36 -116 -122 -82 -130 -10 C-138 64 -126 140 -96 194 C-70 238 -36 268 0 292 C36 268 70 238 96 194 C126 140 138 64 130 -10 C122 -82 36 -116 0 -130 Z',
  face: 'M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z',
  neck: 'M-52 140 C-52 206 -44 250 -24 300 L24 300 C44 250 52 206 52 140 Z',
};

/**
 * Front bust centred on the face (see FRONT for the unit space).
 * o: mouth 'neutral'|'smile'|'sing'|'o'|'frown', open 0..1, blink 0..1, look [dx,dy], brow -1..1,
 *    uplit 0..1 (screen light from below), hold 'phone' (+ phoneY), hood colour, cheek.
 */
export function heroFront(P, x, y, s, o = {}) {
  const ctx = P.ctx, T = at(x, y, s), lw = Math.max(1.4, 4 * s), lo = lw * 1.6, bb = [x - 440 * s, y - 280 * s, x + 440 * s, y + 700 * s];
  const cell = Math.max(3, 7 * s), fc = Math.max(2.5, 5 * s), hood = o.hood ?? 'teal';
  const sil = T(FRONT.sil);
  P.fill(sil, hood);
  P.tone(sil, 'hoodDot', { from: [x + 40 * s, y, 0], to: [x + 420 * s, y, 0.6], bbox: bb }, cell);
  P.line(sil, lo);
  P.line(T('M0 -284 C2 -244 2 -196 0 -156 M134 -192 C160 -124 170 0 166 120'), lw * 0.7);                   // crown seam, a long fold
  P.line(T('M-198 252 C-184 284 -164 302 -134 316 M198 252 C184 284 164 302 134 316'), lw * 0.8);            // the hood's base folds onto the chest
  P.line(T('M-222 286 C-252 300 -290 318 -322 336 M222 286 C252 300 290 318 322 336'), lw * 0.6);            // ... and lies on the shoulders
  P.line(T('M-346 364 C-370 430 -380 500 -384 590 M346 364 C370 430 380 500 384 590'), lw * 0.7);            // dropped shoulder seams
  P.line(T('M-140 340 C-160 400 -168 460 -164 530 M140 340 C160 400 168 460 164 530'), lw * 0.6);            // long loose folds
  P.line(T('M-214 690 L-188 600 L188 600 L214 690'), lw * 0.8);                                             // kangaroo pocket
  // the opening: the face sits in the hollow, its forehead and the edges of its cheeks under the rim
  const hollow = T(FRONT.hollow);
  P.both(T(FRONT.rim), 'tealLt', lw * 1.2);
  P.fill(hollow, 'tealDk');
  ctx.save(); P.clip(hollow);
  const neck = T(FRONT.neck);
  P.fill(neck, 'skin'); P.tone(neck, 'skinDot', { from: [x, y + 190 * s, 0.75], to: [x, y + 300 * s, 0.25], bbox: bb }, fc); P.line(neck, lw * 0.8);
  const face = T(FRONT.face);
  P.fill(face, 'skin');
  P.tone(face, 'skinDot', { from: [x, y - 124 * s, 0.8], to: [x, y - 50 * s, 0], bbox: bb }, fc);            // the hood's shadow on the brow
  if (o.uplit) P.tone(face, 'goldLt', { from: [x, y + 200 * s, 0.6 * o.uplit], to: [x, y + 50 * s, 0], bbox: bb }, fc);
  P.tone(face, 'skinDot', { from: [x + 40 * s, y, 0], to: [x + 135 * s, y, 0.45], bbox: bb }, fc);
  P.line(face, lw * 1.2);
  if (o.hair !== false) {   // a fringe from under the rim, stopping above the brows
    P.both(T('M-150 -160 L150 -160 L150 -60 C138 -74 120 -84 108 -88 L100 -72 C92 -88 80 -98 64 -104 L56 -84 C46 -98 30 -108 12 -110 L4 -90 C-8 -104 -24 -112 -44 -112 L-52 -92 C-64 -104 -80 -110 -98 -106 L-106 -86 C-114 -94 -128 -98 -150 -96 Z'), 'hair', lw);
    P.line(T('M-70 -124 C-62 -114 -56 -106 -54 -98 M28 -126 C38 -116 44 -108 46 -98'), lw * 0.5, '#6b5240');
  }
  features(P, x, y, s, T, lw, o);
  ctx.restore();
  P.line(hollow, lw * 1.1);
  P.both(T('M-118 212 C-88 258 -46 292 0 320 L30 302 C-4 282 -50 248 -96 194 Z'), 'tealLt', lw);         // left over right
  // drawstrings out of the eyelets either side of the V, hanging down the chest
  for (const sx of [-1, 1]) {
    P.both(ell(x + sx * 30 * s, y + 290 * s, 6 * s + 1), 'cream', lw * 0.6);
    const str = T(`M${sx * 30} 292 C${sx * 36} 360 ${sx * 28} 420 ${sx * 40} 482`);
    P.line(str, lw * 2.2); P.line(str, lw * 1.1, 'cream');
    P.both(T(`M${sx * 40 - 7} 478 L${sx * 40 + 7} 478 L${sx * 40 + 6} 512 L${sx * 40 - 6} 512 Z`), 'grey', lw * 0.6);
  }
  if (o.hold === 'phone') phoneInHands(P, x, y, s, o);
}

function features(P, x, y, s, T, lw, o) {
  const browUp = (o.brow ?? 0) * 10;
  P.line(T(`M-88 ${-62 - browUp} C-70 ${-72 - browUp} -48 ${-72 - browUp} -30 ${-64 - browUp} M30 ${-64 - browUp} C48 ${-72 - browUp} 70 ${-72 - browUp} 88 ${-62 - browUp}`), lw * 0.7);
  const [lx, ly] = o.look ?? [0, 0], blink = clamp(o.blink ?? 0);
  for (const sx of [-1, 1]) {
    const ex = x + (sx * 67 + lx * 14) * s, ey = y + (-10 + ly * 10) * s;
    if (blink > 0.6) P.line(svg(`M${ex - 12 * s} ${ey} C${ex - 4 * s} ${ey + 5 * s} ${ex + 4 * s} ${ey + 5 * s} ${ex + 12 * s} ${ey}`), lw * 0.9);
    else P.fill(ell(ex, ey, 9 * s + 1, (9 * s + 1) * (1 - blink)), 'line');
  }
  for (const sx of [-1, 1]) {
    P.line(T(`M${sx * 112} -12 C${sx * 112} -56 ${sx * 22} -56 ${sx * 22} -12 C${sx * 22} 30 ${sx * 112} 30 ${sx * 112} -12 Z`), lw * 1.05);
    if (o.uplit) P.line(T(`M${sx * 96 - 6} -38 L${sx * 80 - 6} -16 M${sx * 84 - 6} -40 L${sx * 70 - 6} -22`), lw * 0.6, 'cream');   // the screen, caught in the lenses
  }
  P.line(T('M-22 -16 L22 -16'), lw);
  P.line(T('M6 30 C-4 62 -8 74 8 80'), lw * 0.6);
  const m = o.mouth ?? 'neutral';
  if (m === 'sing' || m === 'o') { const op = m === 'o' ? 1 : clamp(o.open ?? 0.6); P.both(ell(x, y + 122 * s, (16 + 6 * op) * s, (6 + 18 * op) * s), 'tealDk', lw * 0.7); }
  else if (m === 'smile') P.line(T('M-34 116 C-14 140 14 140 34 116'), lw * 0.9);
  else if (m === 'frown') P.line(T('M-28 132 C-10 118 10 118 28 132'), lw * 0.9);
  else P.line(T('M-26 122 C-8 130 10 130 28 120'), lw * 0.8);
  if (!o.uplit && o.cheek !== false) P.fill(ell(x - 85 * s, y + 70 * s, 22 * s, 12 * s), 'roseLt');
}

/** Back bust, same unit space as the front: the hood lies on the upper back in a U, centre seam down it. */
export function heroBack(P, x, y, s, o = {}) {
  const T = at(x, y, s), lw = Math.max(1.4, 4 * s), bb = [x - 440 * s, y - 280 * s, x + 440 * s, y + 700 * s], cell = Math.max(3, 7 * s), hood = o.hood ?? 'teal';
  const sil = T(FRONT.sil);
  P.fill(sil, hood);
  P.tone(sil, 'hoodDot', { from: [x - 40 * s, y, 0], to: [x - 420 * s, y, 0.6], bbox: bb }, cell);
  const bag = T('M0 -284 C-26 -258 -146 -216 -176 -122 C-196 -60 -198 40 -192 120 C-188 172 -188 214 -198 252 C-170 304 -90 340 0 348 C90 340 170 304 198 252 C188 214 188 172 192 120 C198 40 196 -60 176 -122 C146 -216 26 -258 0 -284 Z');
  P.tone(T('M-198 252 C-170 304 -90 340 0 348 C90 340 170 304 198 252 L230 300 C190 360 100 392 0 398 C-100 392 -190 360 -230 300 Z'), 'hoodDot', { from: [x, y + 350 * s, 0.6], to: [x, y + 400 * s, 0], bbox: bb }, cell);   // its shadow on the back
  P.line(sil, lw * 1.6);
  P.line(bag, lw * 1.1);
  P.line(T('M0 -284 C4 -150 2 100 0 348'), lw * 0.8);                                                      // centre seam
  P.line(T('M-120 -190 C-150 -120 -160 0 -150 120 M120 -190 C150 -120 160 0 150 120'), lw * 0.6);           // the hood's sides, slack
  P.line(T('M-150 220 C-120 270 -70 300 -20 316 M150 220 C120 270 70 300 20 316 M-90 170 C-70 230 -40 270 -6 290'), lw * 0.55);   // folds bunched where it lies
  P.line(T('M-346 364 C-370 430 -380 500 -384 590 M346 364 C370 430 380 500 384 590'), lw * 0.7);
  P.line(T('M-200 440 C-150 470 -90 480 -40 476 M210 520 C160 540 110 546 70 540'), lw * 0.5);
}

/** Side bust facing right, same unit space as the front (eyes at y=-10, bust to y=690). */
export function heroSide(P, x, y, s, o = {}) {
  const ctx = P.ctx, T = at(x, y, s), lw = Math.max(1.4, 4 * s), bb = [x - 440 * s, y - 280 * s, x + 440 * s, y + 700 * s], cell = Math.max(3, 7 * s), hood = o.hood ?? 'teal';
  const torso = T('M-140 338 C-200 342 -256 360 -284 382 C-292 414 -296 470 -292 540 C-290 600 -288 650 -286 690 L190 690 C194 600 184 500 160 430 C146 396 132 372 124 356 C60 336 -60 334 -140 338 Z');
  P.fill(torso, hood); P.tone(torso, 'hoodDot', { from: [x + 40 * s, y, 0], to: [x - 290 * s, y, 0.42], bbox: bb }, cell); P.line(torso, lw * 1.6);
  P.line(T('M128 600 C160 620 186 650 196 690'), lw * 0.7);                                                 // the pocket's edge
  ctx.save(); ctx.translate(x + 20 * s, y - 10 * s); ctx.scale(1.42 * s, 1.42 * s);
  profileHead(P, lw / (1.42 * s), cell / (1.42 * s), o);
  ctx.restore();
  const arm = T('M-188 430 C-192 384 -150 346 -92 344 C-40 342 -6 368 2 412 C14 482 20 590 14 690 L-184 690 C-196 590 -196 494 -188 430 Z');   // the near sleeve
  P.fill(arm, hood); P.tone(arm, 'hoodDot', { from: [x - 60 * s, y + 360 * s, 0], to: [x - 200 * s, y + 690 * s, 0.4], bbox: bb }, cell); P.line(arm, lw * 1.3);
  P.line(T('M-186 462 C-130 446 -50 446 8 464 M-110 520 C-84 540 -62 560 -46 596'), lw * 0.6);             // dropped seam, a fold
}

/**
 * The head in profile, facing right, in head space: the ear at (0,0), crown ~-150, eyes ~0, chin ~150.
 * Seen from the side a worn hood is boxy: a nearly flat top running back to a corner (our soft point), a
 * back that falls close to the skull, a clear dip at the nape, and then its base pulled taut down the
 * back. Worn deep, its rim projects a little in front of the forehead; a fringe hangs out from under it.
 */
function profileHead(P, lw, cell, o = {}) {
  const hood = o.hood ?? 'teal';
  const rimD = 'M114 -136 C74 -102 28 -40 20 30 C14 100 36 190 76 266';
  const hoodP = svg('M114 -136 C110 -160 80 -178 30 -180 C-30 -182 -88 -184 -128 -192 C-148 -166 -156 -120 -156 -60 C-156 0 -152 46 -140 82 C-126 120 -106 150 -102 176 C-110 222 -160 254 -214 276 C-160 294 -100 296 -50 290 C-10 284 40 274 76 266 C36 190 14 100 20 30 C28 -40 74 -102 114 -136 Z');
  P.fill(hoodP, hood); P.tone(hoodP, 'hoodDot', { from: [-40, -40, 0], to: [-200, 120, 0.42], bbox: [-215, -200, 120, 300] }, cell); P.line(hoodP, lw * 1.4);
  P.line(svg('M-122 -184 C-112 -100 -96 0 -64 120'), lw * 0.6);                                                                // the taut pull from the corner
  P.line(svg('M-126 222 C-100 238 -76 246 -46 248 M-170 256 C-136 268 -100 274 -70 270'), lw * 0.5);                           // bunched where it lies on the back
  const face = svg('M114 -136 C114 -100 114 -56 110 -26 C108 -14 106 -6 108 2 L144 52 C146 58 138 64 126 63 C124 72 126 80 122 86 C118 90 118 94 122 100 C124 110 116 118 114 124 C122 140 112 158 92 162 C72 168 52 168 38 164 C40 200 50 236 70 262 L76 266 C36 190 14 100 20 30 C28 -40 74 -102 114 -136 Z');
  const fb = [16, -140, 150, 270];
  P.fill(face, 'skin'); P.tone(face, 'skinDot', { from: [104, -120, 0.75], to: [104, -50, 0], bbox: fb }, cell * 0.75);
  P.tone(face, 'skinDot', { from: [74, 0, 0], to: [24, 0, 0.5], bbox: fb }, cell * 0.75);                                     // the hood's shadow on the cheek
  P.tone(face, 'skinDot', { from: [60, 150, 0.6], to: [80, 120, 0], bbox: fb }, cell * 0.75);                                  // under the chin
  if (o.uplit) P.tone(face, 'goldLt', { from: [110, 160, 0.6 * o.uplit], to: [110, 30, 0], bbox: fb }, cell * 0.75);
  P.line(face, lw * 1.1);
  // hair: a fringe falling forward from under the rim, a lock by the cheek
  if (o.hair !== false) {
    P.save(); P.clip(svg('M114 -136 L200 -136 L200 300 L76 266 C36 190 14 100 20 30 C28 -40 74 -102 114 -136 Z'));   // in front of the rim
    P.both(svg('M118 -144 C126 -118 128 -94 120 -68 L112 -78 L106 -60 L98 -82 L90 -68 L86 -98 C80 -116 70 -132 56 -146 Z'), 'hair', lw * 0.9);
    P.line(svg('M108 -128 C114 -112 116 -98 113 -86'), lw * 0.5, '#6b5240');
    P.both(svg('M40 -56 C36 -26 36 2 40 26 L48 10 L52 22 C54 -4 52 -30 48 -58 Z'), 'hair', lw * 0.8);
    P.restore();
  }
  P.line(svg('M88 -24 C96 -28 104 -28 110 -24'), lw * 0.7);                                                                   // brow
  if (clamp(o.blink ?? 0) > 0.6) P.line(svg('M80 2 C86 6 92 6 98 2'), lw * 0.8); else P.fill(ell(90, 2, 5.5, 6.5), 'line');  // eye
  P.line(ell(98, 0, 13, 19), lw * 0.9); P.line(svg('M85 -4 L22 -8'), lw * 0.8);                                             // glasses
  const m = o.mouth ?? 'neutral';
  if (m === 'sing' || m === 'o') P.both(svg(`M122 86 C${110 - 6 * clamp(o.open ?? 0.6)} 88 ${108 - 6 * clamp(o.open ?? 0.6)} ${100 + 10 * clamp(o.open ?? 0.6)} 122 ${100 + 8 * clamp(o.open ?? 0.6)} Z`), 'tealDk', lw * 0.6);
  else P.line(svg(m === 'smile' ? 'M120 94 C114 96 110 94 106 90' : 'M120 93 L109 92'), lw * 0.7);
  P.line(svg(rimD), 24 + 2 * lw * 1.1); P.line(svg(rimD), 24, 'tealLt');                                                     // the rim, a doubled band
  const str = svg('M66 240 C76 300 70 360 82 430'); P.line(str, lw * 2.2); P.line(str, lw * 1.1, 'cream');                    // drawstring
  P.both(svg('M76 426 L88 426 L88 456 L76 456 Z'), 'grey', lw * 0.6);
}

/**
 * Both hands holding a phone up to read, as people really do: we see the phone's back (camera bump
 * outward). The palms are on its back with the thumbs round the front on the screen, so we see the backs
 * of both hands over its lower half, each hand's fingers lying across it on a slant: the two hands cross,
 * his left over his right. The wrists bend in from forearms that rise almost straight from below.
 * Phone-local units: the phone is 128 x 272 centred on (0, 0); a hand is about as wide as the phone.
 */
const GRIP = [
  { w: [-110, 120], d: [0.86, -0.5] },    // his right hand (viewer's left), underneath: its fingers the upper band
  { w: [110, 186], d: [-0.86, -0.5] },    // his left hand, over it: the lower band
];
const FINGERS = [118, 128, 118, 96];      // index .. little, from the knuckle
function phoneInHands(P, x, y, s, o) {
  const lw = Math.max(1.4, 4 * s), hood = o.hood ?? 'teal', py = o.phoneY ?? 290, hw = 64, hh = 136;
  const Q = at(x, y + py * s, s), cell = Math.max(3, 6 * s), fc = Math.max(2.5, 4 * s);
  const pt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`, add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const G = GRIP.map((g) => {
    const side = Math.sign(g.w[0]), d = g.d, f = [side * 0.26, 0.97];   // f: the forearm, from the wrist down and out
    const u = side < 0 ? [d[1], -d[0]] : [-d[1], d[0]];                 // across the knuckles, towards the index
    const p = side < 0 ? [-f[1], f[0]] : [f[1], -f[0]];                 // across the wrist, towards the thumb side
    return { ...g, side, d, u, f, p, K: add(g.w, d, 100) };
  });
  // forearms in their sleeves, from below the bust's edge up to the wrists
  P.save(); P.clip(at(x, y, s)(rect(-440, -300, 880, 990)));
  for (const g of G) {
    const a = add(g.w, g.f, 12), b = add(g.w, g.f, Math.max(60, (700 - py - g.w[1]) / g.f[1] + 20));
    const sl = Q(`M${pt(add(a, g.p, 50))} L${pt(add(b, g.p, 68))} L${pt(add(b, g.p, -68))} L${pt(add(a, g.p, -50))} Z`);
    P.fill(sl, hood);
    P.tone(sl, 'hoodDot', { from: [x + a[0] * s, y + (py + a[1]) * s, 0.1], to: [x + b[0] * s, y + (py + b[1]) * s, 0.5], bbox: [x - 440 * s, y + (py + a[1] - 60) * s, x + 440 * s, y + (py + b[1] + 10) * s] }, cell);
    P.line(sl, lw * 1.3);
  }
  P.restore();
  // the phone
  const ph = Q(`M${-hw + 18} ${-hh} L${hw - 18} ${-hh} Q${hw} ${-hh} ${hw} ${-hh + 18} L${hw} ${hh - 18} Q${hw} ${hh} ${hw - 18} ${hh} L${-hw + 18} ${hh} Q${-hw} ${hh} ${-hw} ${hh - 18} L${-hw} ${-hh + 18} Q${-hw} ${-hh} ${-hw + 18} ${-hh} Z`);
  if (o.uplit) P.line(ph, 12 * s + 2, 'goldLt');
  P.both(ph, 'tealDk', lw * 1.1);
  P.tone(ph, '#0f1c1b', { from: [x - hw * s, y + (py - hh) * s, 0], to: [x + hw * s, y + (py + hh) * s, 0.5], bbox: [x - (hw + 4) * s, y + (py - hh - 4) * s, x + (hw + 4) * s, y + (py + hh + 4) * s] }, Math.max(3, 5 * s));
  P.both(Q(`M${-hw + 18} ${-hh + 12} L${-hw + 58} ${-hh + 12} Q${-hw + 66} ${-hh + 12} ${-hw + 66} ${-hh + 20} L${-hw + 66} ${-hh + 66} Q${-hw + 66} ${-hh + 74} ${-hw + 58} ${-hh + 74} L${-hw + 18} ${-hh + 74} Q${-hw + 10} ${-hh + 74} ${-hw + 10} ${-hh + 66} L${-hw + 10} ${-hh + 20} Q${-hw + 10} ${-hh + 12} ${-hw + 18} ${-hh + 12} Z`), 'teal', lw * 0.8);
  for (const [cx, cy] of [[-hw + 25, -hh + 28], [-hw + 51, -hh + 28], [-hw + 25, -hh + 56]]) P.both(ell(x + cx * s, y + (py + cy) * s, 10 * s), 'black', lw * 0.5);
  // each hand, the underneath one first: it leaves the cuff along the forearm and bends at the wrist
  // towards the phone; the back of the hand, then the fingers over its knuckle edge, then the cuff
  for (const g of G) {
    const up = [-g.f[0], -g.f[1]];
    const back = Q(`M${pt(add(g.w, g.p, 40))} C${pt(add(add(g.w, g.p, 40), up, 44))} ${pt(add(add(g.K, g.u, 58), g.d, -40))} ${pt(add(g.K, g.u, 58))} L${pt(add(g.K, g.u, -58))} C${pt(add(add(g.K, g.u, -58), g.d, -44))} ${pt(add(add(g.w, g.p, -40), up, 40))} ${pt(add(g.w, g.p, -40))} Z`);
    P.both(back, 'skin', lw);
    P.tone(back, 'skinDot', { from: [x + g.K[0] * s, y + (py + g.K[1]) * s, 0], to: [x + g.w[0] * s, y + (py + g.w[1]) * s, 0.5], bbox: [x - 220 * s, y + (py - 60) * s, x + 220 * s, y + (py + 280) * s] }, fc);
    P.line(Q(`M${pt(add(add(g.K, g.d, -50), g.u, 30))} C${pt(add(add(g.K, g.d, -30), g.u, 20))} ${pt(add(add(g.K, g.d, -26), g.u, 0))} ${pt(add(add(g.K, g.d, -40), g.u, -20))}`), lw * 0.45);   // a tendon
    for (let i = 3; i >= 0; i--) {
      const fd = [g.d[0] * Math.cos((i - 1.5) * 0.05 * g.side) - g.d[1] * Math.sin((i - 1.5) * 0.05 * g.side), g.d[0] * Math.sin((i - 1.5) * 0.05 * g.side) + g.d[1] * Math.cos((i - 1.5) * 0.05 * g.side)];   // a slight fan
      const b = add(g.K, g.u, (1.5 - i) * 29);
      const len = Math.min(FINGERS[i], (72 + g.side * b[0]) / Math.abs(fd[0]));   // a fingertip may just reach the far edge
      const tip = add(b, fd, len), fpath = Q(`M${pt(add(b, fd, -16))} L${pt(tip)}`);
      P.line(fpath, 29 * s + 2 * lw * 0.9); P.line(fpath, 29 * s, 'skin');
      P.line(Q(`M${pt(add(add(b, fd, -6), g.u, 10))} Q${pt(add(b, fd, 2))} ${pt(add(add(b, fd, -6), g.u, -10))}`), lw * 0.5);   // knuckle
      for (const k of [0.45, 0.72]) { const c = add(b, fd, len * k); P.line(Q(`M${pt(add(c, g.u, 8))} Q${pt(add(c, fd, 3))} ${pt(add(c, g.u, -8))}`), lw * 0.45); }   // joints
      const nail = new Path2D(), nc = add(tip, fd, -11); nail.ellipse(nc[0], nc[1], 9, 7, Math.atan2(fd[1], fd[0]), 0, Math.PI * 2);
      P.both(Q(nail), 'roseLt', lw * 0.5);
    }
    const c0 = add(g.w, g.f, -6), c1 = add(g.w, g.f, 30);
    P.both(Q(`M${pt(add(c0, g.p, 52))} L${pt(add(c1, g.p, 54))} L${pt(add(c1, g.p, -54))} L${pt(add(c0, g.p, -52))} Z`), 'tealLt', lw);
    for (let k = -36; k <= 36; k += 12) P.line(Q(`M${pt(add(add(c0, g.p, k), g.f, 4))} L${pt(add(add(c1, g.p, k), g.f, -4))}`), lw * 0.4);
  }
}

/**
 * Walking profile, facing right, feet on (x, y). About 6.5 heads (~1000 units to the hood's point; the head,
 * crown to chin, is 150).
 * phase: walk cycle (radians, 2π per two steps). o: hood colour, carry 'duffel'|'laptop', lookUp.
 */
export function heroWalk(P, x, y, s, phase = 0, o = {}) {
  const ctx = P.ctx, lw = Math.max(1.5, 4 * s) / s, hood = o.hood ?? 'teal';
  const L1 = 240, L2 = 232, FOOT = 26;
  const leg = (ph) => {
    const a = 0.45 * Math.sin(ph), knee = 0.06 + 1.0 * Math.pow(Math.max(0, Math.cos(ph)), 1.4);
    const b = a - knee, foot = Math.cos(ph) > 0 ? clamp(b * 0.5, -0.5, 0.3) : 0;
    return { a, b, foot, drop: L1 * Math.cos(a) + L2 * Math.cos(b) };
  };
  const near = leg(phase), far = leg(phase + Math.PI);
  const hipY = -(Math.max(near.drop, far.drop) + FOOT);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // a limb is one bent stroke (round joins make soft knees and elbows), outlined
  const limb = (pts, w, color) => {
    const p = new Path2D(); pts.forEach(([px, py], i) => (i ? p.lineTo(px, py) : p.moveTo(px, py)));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    P.line(p, w + 2 * lw, 'line'); P.line(p, w, color);
  };
  const drawLeg = (g, color, shoe) => {
    const kx = Math.sin(g.a) * L1, ky = hipY + Math.cos(g.a) * L1, ax = kx + Math.sin(g.b) * L2, ay = ky + Math.cos(g.b) * L2;
    limb([[0, hipY - 20], [kx, ky], [ax - Math.sin(g.b) * 26, ay - Math.cos(g.b) * 26]], 70, color);
    P.line(new Path2D(`M${kx - 10} ${ky - 6} C${kx} ${ky + 4} ${kx + 12} ${ky + 2} ${kx + 18} ${ky - 8}`), lw * 0.6);   // a crease at the knee
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(-g.foot);
    P.both(svg('M-36 -14 C-36 -30 30 -32 66 -12 C86 -2 86 16 70 20 L-36 20 Z'), shoe, lw); P.line(svg('M-34 12 L78 12'), lw * 0.6);
    ctx.restore();
  };
  const sh = [8, hipY - 290];
  const arm = (ph, color, cuff) => {
    const a = -0.38 * Math.sin(ph), el = 0.3 + 0.25 * Math.max(0, -Math.sin(ph));
    const ex = sh[0] + Math.sin(a) * 196, ey = sh[1] + Math.cos(a) * 196, wx = ex + Math.sin(a + el) * 176, wy = ey + Math.cos(a + el) * 176;
    limb([[sh[0], sh[1] + 20], [ex, ey], [wx - Math.sin(a + el) * 10, wy - Math.cos(a + el) * 10]], 70, color);
    P.line(new Path2D(`M${ex - 14} ${ey - 30} C${ex - 4} ${ey - 10} ${ex + 6} ${ey + 10} ${ex + 22} ${ey + 22}`), lw * 0.5);   // a loose fold at the elbow
    ctx.save(); ctx.translate(wx, wy); ctx.rotate(-(a + el));
    P.both(rect(-26, -18, 52, 26, 8), cuff, lw); for (let k = -16; k <= 16; k += 8) P.line(svg(`M${k} -14 L${k} 4`), lw * 0.4);
    P.both(svg('M-24 6 C-28 36 -24 66 -8 82 C4 92 22 88 26 70 C30 50 26 24 22 6 Z'), 'skin', lw);
    P.line(svg('M22 26 C34 30 38 44 28 54'), lw * 0.8);
    ctx.restore();
  };
  arm(phase + Math.PI, 'tealDk', 'tealDk');
  drawLeg(far, 'denimDk', 'grey');
  // torso: hoodie with ribbed hem and a kangaroo pocket
  ctx.save(); ctx.translate(0, hipY);
  const torso = svg('M-16 -320 C-34 -300 -56 -278 -73 -260 C-84 -230 -92 -190 -90 -120 C-86 -60 -80 -10 -76 24 L86 24 C98 -80 102 -200 88 -290 C60 -318 10 -330 -16 -320 Z');
  P.fill(torso, hood); P.tone(torso, 'hoodDot', { from: [0, 0, 0], to: [-90, 0, 0.3], bbox: [-100, -335, 110, 30] }, 7); P.line(torso, lw * 1.4);
  P.both(rect(-80, -4, 170, 30, 8), 'tealLt', lw); for (let k = -66; k < 84; k += 14) P.line(svg(`M${k} 0 L${k} 22`), lw * 0.4);
  P.line(svg('M96 -150 L40 -150 C30 -110 30 -60 36 -6'), lw * 0.8);
  ctx.restore();
  if (o.carry === 'duffel') { P.both(rect(-190, hipY - 210, 170, 120, 40), 'rose', lw * 1.2); P.line(svg(`M-150 ${hipY - 210} C-120 ${hipY - 300} -40 ${hipY - 320} ${sh[0]} ${sh[1] + 10}`), lw * 2.2); }
  drawLeg(near, 'denim', 'cream');
  // the head, crown to chin 150 units: drawn in head space at half scale
  ctx.save(); ctx.translate(sh[0] + 26, sh[1] - 108); ctx.rotate(-(o.lookUp ?? 0) * 0.2); ctx.scale(0.5, 0.5);
  profileHead(P, lw * 2, 12, o);
  ctx.restore();
  arm(phase, hood, 'tealLt');
  ctx.restore();
}

/** A loose phone seen from the back (camera bump outward), centred at (x, y). 120x256 units at s=1. */
export function phone(P, x, y, s = 1, rot = 0, glow = 0) {
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (glow > 0) P.line(rect(-60, -128, 120, 256, 20), 14, 'goldLt');
  P.both(rect(-60, -128, 120, 256, 20), 'tealDk', 3);
  P.tone(rect(-60, -128, 120, 256, 20), '#0f1c1b', { from: [-60, -128, 0], to: [60, 128, 0.5], bbox: [-66, -134, 66, 134] }, 5);
  P.both(rect(-50, -116, 56, 60, 10), 'teal', 2.5);
  for (const [cx, cy] of [[-35, -101], [-9, -101], [-35, -73]]) P.both(ell(cx, cy, 9), 'black', 1.5);
  ctx.restore();
}
