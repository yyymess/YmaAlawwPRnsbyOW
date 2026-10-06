// The hero (see docs/FIGURES.md): teal hoodie with the hood up, round glasses, clean-shaven, no hair
// showing. Front bust (optionally holding a phone up) and a walking profile with real joints.
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
  const torso = T('M-368 384 C-374 470 -368 580 -356 690 L210 690 C214 600 200 500 172 430 C150 390 130 370 120 352 C40 330 -290 330 -368 384 Z');
  P.fill(torso, hood); P.tone(torso, 'hoodDot', { from: [x + 100 * s, y, 0], to: [x - 340 * s, y, 0.55], bbox: bb }, cell); P.line(torso, lw * 1.6);
  P.line(T('M128 600 C160 620 186 650 196 690'), lw * 0.7);                                                 // the pocket's edge
  ctx.save(); ctx.translate(x + 20 * s, y - 10 * s); ctx.scale(1.42 * s, 1.42 * s);
  profileHead(P, lw / (1.42 * s), cell / (1.42 * s), o);
  ctx.restore();
  const arm = T('M-190 360 C-214 460 -212 580 -200 690 L30 690 C40 580 34 460 10 372 C-40 340 -150 340 -190 360 Z');   // the near sleeve
  P.fill(arm, hood); P.tone(arm, 'hoodDot', { from: [x - 40 * s, y + 360 * s, 0], to: [x - 200 * s, y + 690 * s, 0.5], bbox: bb }, cell); P.line(arm, lw * 1.3);
  P.line(T('M-176 380 C-150 372 -40 368 4 386 M-120 480 C-90 500 -60 520 -40 560'), lw * 0.6);             // dropped seam, a fold
}

/**
 * The head in profile, facing right, in head space: the ear at (0,0), crown ~-150, eyes ~0, chin ~150.
 * The cowl rises from the rim to a soft point behind the crown, bulges a little behind the skull and lies
 * on the upper back like a bag; the face (brow, nose, lips, chin) stands out in front of the rim.
 */
function profileHead(P, lw, cell, o = {}) {
  const hood = o.hood ?? 'teal';
  const rimD = 'M102 -128 C52 -92 16 -24 14 50 C12 124 38 200 76 266';
  const hoodP = svg('M102 -128 C98 -158 60 -174 10 -178 C-16 -180 -42 -186 -64 -200 C-110 -160 -152 -100 -156 -20 C-160 70 -200 180 -272 276 C-206 300 -120 300 -60 290 C-10 284 40 274 76 266 C38 200 12 124 14 50 C16 -24 52 -92 102 -128 Z');
  P.fill(hoodP, hood); P.tone(hoodP, 'hoodDot', { from: [40, -60, 0], to: [-200, 80, 0.55], bbox: [-270, -215, 110, 310] }, cell); P.line(hoodP, lw * 1.4);
  P.line(svg('M-30 -176 C-90 -136 -124 -66 -126 30 M-64 -200 C-70 -186 -72 -174 -70 -162'), lw * 0.6);                        // a long fold, the tip's flop
  P.line(svg('M-196 206 C-156 232 -106 244 -50 248 M-230 252 C-186 268 -130 274 -80 270'), lw * 0.5);                          // bunched where it lies on the back
  const face = svg('M102 -128 C112 -96 114 -56 110 -26 C108 -14 106 -6 108 2 L144 52 C146 58 138 64 126 63 C124 72 126 80 122 86 C118 90 118 94 122 100 C124 110 116 118 114 124 C122 140 112 158 92 162 C72 168 52 168 38 164 C40 200 50 236 70 262 L76 266 C38 200 12 124 14 50 C16 -24 52 -92 102 -128 Z');
  P.fill(face, 'skin'); P.tone(face, 'skinDot', { from: [100, -126, 0.75], to: [104, -60, 0], bbox: [10, -130, 150, 270] }, cell * 0.75);
  P.tone(face, 'skinDot', { from: [70, 0, 0], to: [16, 0, 0.5], bbox: [10, -130, 150, 270] }, cell * 0.75);                   // the hood's shadow on the cheek
  P.tone(face, 'skinDot', { from: [60, 150, 0.6], to: [80, 120, 0], bbox: [10, -130, 150, 270] }, cell * 0.75);              // under the chin
  if (o.uplit) P.tone(face, 'goldLt', { from: [110, 160, 0.6 * o.uplit], to: [110, 30, 0], bbox: [10, -130, 150, 270] }, cell * 0.75);
  P.line(face, lw * 1.1);
  P.line(svg('M88 -24 C96 -28 104 -28 110 -24'), lw * 0.7);                                                                   // brow
  if (clamp(o.blink ?? 0) > 0.6) P.line(svg('M80 2 C86 6 92 6 98 2'), lw * 0.8); else P.fill(ell(90, 2, 5.5, 6.5), 'line');  // eye
  P.line(ell(98, 0, 13, 19), lw * 0.9); P.line(svg('M85 -4 L16 -8'), lw * 0.8);                                              // glasses
  const m = o.mouth ?? 'neutral';
  if (m === 'sing' || m === 'o') P.both(svg(`M122 86 C${110 - 6 * clamp(o.open ?? 0.6)} 88 ${108 - 6 * clamp(o.open ?? 0.6)} ${100 + 10 * clamp(o.open ?? 0.6)} 122 ${100 + 8 * clamp(o.open ?? 0.6)} Z`), 'tealDk', lw * 0.6);
  else P.line(svg(m === 'smile' ? 'M120 94 C114 96 110 94 106 90' : 'M120 93 L109 92'), lw * 0.7);
  P.line(svg(rimD), 24 + 2 * lw * 1.1); P.line(svg(rimD), 24, 'tealLt');                                                     // the rim, a doubled band
  const str = svg('M66 240 C76 300 70 360 82 430'); P.line(str, lw * 2.2); P.line(str, lw * 1.1, 'cream');                    // drawstring
  P.both(svg('M76 426 L88 426 L88 456 L76 456 Z'), 'grey', lw * 0.6);
}

/** both hands holding a phone up to the face: we see its back, fingers wrapped round it, sleeves to the body */
function phoneInHands(P, x, y, s, o) {
  const T = at(x, y, s), lw = Math.max(1.4, 4 * s), hood = o.hood ?? 'teal', py = o.phoneY ?? 300, hw = 64, hh = 136;
  for (const sx of [-1, 1]) {   // bent arms: forearm sleeves from the elbows up to the wrists, shaded, ribbed cuffs
    const sl = T(`M${sx * 428} 700 C${sx * 428} 640 ${sx * 410} 610 ${sx * 378} 588 L${sx * (hw + 70)} ${py + hh - 30} L${sx * (hw + 26)} ${py + hh + 40} L${sx * 300} 700 Z`);
    P.fill(sl, hood); P.tone(sl, 'hoodDot', { from: [x + sx * 150 * s, y + py * s, 0.15], to: [x + sx * 420 * s, y + 690 * s, 0.6], bbox: [x - 440 * s, y + (py + 40) * s, x + 440 * s, y + 710 * s] }, Math.max(3, 6 * s)); P.line(sl, lw * 1.3);
    P.both(T(`M${sx * (hw + 76)} ${py + hh - 40} L${sx * (hw + 22)} ${py + hh + 46} L${sx * (hw + 4)} ${py + hh + 30} L${sx * (hw + 58)} ${py + hh - 56} Z`), 'tealLt', lw);
  }
  const ph = T(`M${-hw + 18} ${py - hh} L${hw - 18} ${py - hh} Q${hw} ${py - hh} ${hw} ${py - hh + 18} L${hw} ${py + hh - 18} Q${hw} ${py + hh} ${hw - 18} ${py + hh} L${-hw + 18} ${py + hh} Q${-hw} ${py + hh} ${-hw} ${py + hh - 18} L${-hw} ${py - hh + 18} Q${-hw} ${py - hh} ${-hw + 18} ${py - hh} Z`);
  if (o.uplit) P.line(ph, 12 * s + 2, 'goldLt');
  P.both(ph, 'tealDk', lw * 1.1);
  P.tone(ph, '#0f1c1b', { from: [x - hw * s, y + (py - hh) * s, 0], to: [x + hw * s, y + (py + hh) * s, 0.5], bbox: [x - (hw + 4) * s, y + (py - hh - 4) * s, x + (hw + 4) * s, y + (py + hh + 4) * s] }, Math.max(3, 5 * s));
  P.both(T(`M${-hw + 18} ${py - hh + 12} L${-hw + 58} ${py - hh + 12} Q${-hw + 66} ${py - hh + 12} ${-hw + 66} ${py - hh + 20} L${-hw + 66} ${py - hh + 66} Q${-hw + 66} ${py - hh + 74} ${-hw + 58} ${py - hh + 74} L${-hw + 18} ${py - hh + 74} Q${-hw + 10} ${py - hh + 74} ${-hw + 10} ${py - hh + 66} L${-hw + 10} ${py - hh + 20} Q${-hw + 10} ${py - hh + 12} ${-hw + 18} ${py - hh + 12} Z`), 'teal', lw * 0.8);
  for (const [cx, cy] of [[-hw + 25, py - hh + 28], [-hw + 51, py - hh + 28], [-hw + 25, py - hh + 56]]) P.both(ell(x + cx * s, y + cy * s, 10 * s), 'black', lw * 0.5);
  for (const sx of [-1, 1]) {   // heel of each palm at the lower corners, four fingers wrapped across the back
    const palm = T(`M${sx * (hw + 34)} ${py + hh + 34} C${sx * (hw + 44)} ${py + hh - 30} ${sx * (hw + 30)} ${py + 20} ${sx * (hw + 2)} ${py + 10} C${sx * (hw - 18)} ${py + 40} ${sx * (hw - 22)} ${py + hh - 20} ${sx * (hw - 8)} ${py + hh + 40} Z`);
    P.both(palm, 'skin', lw);
    for (let k = 0; k < 4; k++) {
      const fy = py + 22 + k * 27, len = [34, 40, 38, 30][k];
      P.both(T(`M${sx * (hw + 6)} ${fy - 12} L${sx * (hw - len)} ${fy - 10} Q${sx * (hw - len - 13)} ${fy} ${sx * (hw - len)} ${fy + 10} L${sx * (hw + 6)} ${fy + 12} Z`), 'skin', lw * 0.8);
    }
    P.tone(palm, 'skinDot', { from: [x + sx * hw * s, y, 0], to: [x + sx * (hw + 44) * s, y, 0.4], bbox: [x - (hw + 50) * s, y + py * s, x + (hw + 50) * s, y + (py + hh + 50) * s] }, Math.max(2.5, 4 * s));
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
  const torso = svg('M-74 -306 C-104 -280 -116 -200 -108 -90 C-104 -40 -96 0 -88 24 L100 24 C116 -80 120 -200 98 -290 C52 -324 -40 -330 -74 -306 Z');
  P.fill(torso, hood); P.tone(torso, 'hoodDot', { from: [40, 0, 0], to: [-100, 0, 0.5], bbox: [-120, -330, 125, 30] }, 7); P.line(torso, lw * 1.4);
  P.both(rect(-88, -4, 186, 30, 8), 'tealLt', lw); for (let k = -72; k < 96; k += 14) P.line(svg(`M${k} 0 L${k} 22`), lw * 0.4);
  P.line(svg('M104 -150 L44 -150 C34 -110 34 -60 40 -6'), lw * 0.8);
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
