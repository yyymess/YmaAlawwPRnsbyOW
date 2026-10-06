// The hero (see docs/FIGURES.md): teal hoodie with the hood up, round glasses, clean-shaven, no hair
// showing. Front bust (optionally holding a phone up) and a walking profile with real joints.
import { C, at, ell, rect, svg, clamp } from '../paint.js';

/**
 * Front bust in a unit space centred on the face (face ~270 wide, -150..200 tall; the bust reaches y=620).
 * o: mouth 'neutral'|'smile'|'sing'|'o'|'frown', open 0..1, blink 0..1, look [dx,dy], brow -1..1,
 *    uplit 0..1 (screen light from below), hold 'phone', hood colour, cheek.
 */
export function heroFront(P, x, y, s, o = {}) {
  const T = at(x, y, s), lw = Math.max(1.4, 4 * s), lo = lw * 1.6, bb = [x - 380 * s, y - 300 * s, x + 380 * s, y + 640 * s];
  const cell = Math.max(3, 7 * s), fc = Math.max(2.5, 5 * s), hood = o.hood ?? 'teal';
  // hood and body are one silhouette: a monk's cowl rising to a soft point (the tip flops a little),
  // its sides draping onto the shoulders with some bunched volume, then the dropped shoulders
  const sil = T('M10 -408 C-56 -372 -164 -302 -198 -178 C-232 -70 -232 80 -214 170 C-206 214 -196 250 -184 286 C-200 330 -240 362 -282 400 C-324 440 -338 530 -340 660 L340 660 C338 530 324 440 282 400 C240 362 200 330 184 286 C196 250 206 214 214 170 C232 80 236 -70 202 -178 C170 -292 72 -362 10 -408 Z');
  P.fill(sil, hood);
  P.tone(sil, 'hoodDot', { from: [x + 20 * s, y, 0], to: [x + 330 * s, y, 0.6], bbox: bb }, cell);
  P.tone(sil, 'hoodDot', { from: [x, y - 400 * s, 0.4], to: [x, y - 250 * s, 0], bbox: bb }, cell);
  P.line(sil, lo);
  P.line(T('M10 -408 C6 -362 2 -318 0 -284 M10 -408 C26 -392 34 -374 36 -350'), lw * 0.7);                  // crown seam, the tip's flop
  P.line(T('M148 -262 C196 -170 216 -20 204 150 M-136 -268 C-178 -200 -202 -110 -204 -20'), lw * 0.7);     // long loose folds
  P.line(T('M-184 286 C-170 320 -150 340 -128 352 M184 286 C170 320 150 340 128 352'), lw * 0.8);            // the hood bunched on the shoulders
  P.line(T('M-176 304 C-188 330 -206 350 -230 366 M176 304 C188 330 206 350 230 366'), lw * 0.6);
  P.line(T('M-236 372 C-260 420 -270 480 -274 570 M236 372 C260 420 270 480 274 570'), lw * 0.7);            // dropped shoulder seams
  P.line(T('M-150 372 C-124 420 -108 470 -104 520 M150 372 C124 420 108 470 104 520'), lw * 0.6);            // chest folds
  P.line(T('M-176 660 L-150 568 L150 568 L176 660'), lw * 0.8);                                             // kangaroo pocket
  // the opening: a doubled rim shaped like a pointed arch round the face, running down into a V at
  // the sternum, left over right
  P.both(T('M0 -284 C-52 -252 -168 -172 -176 0 C-180 110 -150 190 -100 250 C-70 286 -36 312 0 336 C36 312 70 286 100 250 C150 190 180 110 176 0 C168 -172 52 -252 0 -284 Z'), 'tealLt', lw * 1.2);
  P.both(T('M0 -252 C-44 -224 -146 -152 -152 0 C-154 100 -128 172 -84 228 C-56 262 -28 288 0 306 C28 288 56 262 84 228 C128 172 154 100 152 0 C146 -152 44 -224 0 -252 Z'), 'tealDk', lw);
  const neck = T('M-50 150 C-48 220 -40 262 -18 300 L18 300 C40 262 48 220 50 150 Z');
  P.fill(neck, 'skin'); P.tone(neck, 'skinDot', { from: [x, y + 190 * s, 0.75], to: [x, y + 300 * s, 0.25], bbox: bb }, fc); P.line(neck, lw * 0.8);
  P.both(T('M-100 250 C-70 286 -36 312 0 336 L26 318 C-8 296 -48 266 -82 230 Z'), 'tealLt', lw);           // the overlap
  // the face, its forehead lost in the hood's shadow
  const face = T('M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z');
  P.fill(face, 'skin');
  P.tone(face, 'skinDot', { from: [x, y - 150 * s, 0.75], to: [x, y - 70 * s, 0], bbox: bb }, fc);
  if (o.uplit) P.tone(face, 'goldLt', { from: [x, y + 200 * s, 0.6 * o.uplit], to: [x, y + 50 * s, 0], bbox: bb }, fc);
  P.tone(face, 'skinDot', { from: [x + 40 * s, y, 0], to: [x + 135 * s, y, 0.45], bbox: bb }, fc);
  P.line(face, lw * 1.2);
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
  // drawstrings out of the eyelets either side of the V, hanging long down the chest
  for (const sx of [-1, 1]) {
    P.both(ell(x + sx * 40 * s, y + 300 * s, 6 * s + 1), 'cream', lw * 0.6);
    const str = T(`M${sx * 40} 302 C${sx * 46} 370 ${sx * 38} 440 ${sx * 50} 520`);
    P.line(str, lw * 2.2); P.line(str, lw * 1.1, 'cream');
    P.both(T(`M${sx * 50 - 7} 516 L${sx * 50 + 7} 516 L${sx * 50 + 6} 552 L${sx * 50 - 6} 552 Z`), 'grey', lw * 0.6);
  }
  if (o.hold === 'phone') phoneInHands(P, x, y, s, o);
}

/** both hands holding a phone up to the face: we see its back, fingers wrapped round it, sleeves to the body */
function phoneInHands(P, x, y, s, o) {
  const T = at(x, y, s), lw = Math.max(1.4, 4 * s), hood = o.hood ?? 'teal', py = o.phoneY ?? 360, hw = 64, hh = 136;
  for (const sx of [-1, 1]) {   // bent arms: forearm sleeves from the elbows up to the wrists, shaded, ribbed cuffs
    const sl = T(`M${sx * 304} 680 C${sx * 304} 620 ${sx * 290} 600 ${sx * 262} 580 L${sx * (hw + 70)} ${py + hh - 30} L${sx * (hw + 26)} ${py + hh + 40} L${sx * 214} 680 Z`);
    P.fill(sl, hood); P.tone(sl, 'hoodDot', { from: [x + sx * 150 * s, y + py * s, 0.15], to: [x + sx * 300 * s, y + 660 * s, 0.6], bbox: [x - 320 * s, y + (py + 40) * s, x + 320 * s, y + 700 * s] }, Math.max(3, 6 * s)); P.line(sl, lw * 1.3);
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
 * Walking profile, facing right, feet on (x, y). About 7 heads (~1000 units) tall.
 * phase: walk cycle (radians, 2π per two steps). o: hood colour, carry 'duffel'|'laptop', lookUp.
 */
export function heroWalk(P, x, y, s, phase = 0, o = {}) {
  const ctx = P.ctx, lw = Math.max(1.5, 4 * s) / s, hood = o.hood ?? 'teal';
  const L1 = 228, L2 = 220, FOOT = 26;
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
  const sh = [8, hipY - 300];
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
  const torso = svg('M-84 -318 C-104 -210 -96 -90 -78 24 L92 24 C106 -80 110 -210 94 -318 C46 -346 -44 -346 -84 -318 Z');
  P.fill(torso, hood); P.tone(torso, 'hoodDot', { from: [40, 0, 0], to: [-90, 0, 0.5], bbox: [-110, -350, 115, 30] }, 7); P.line(torso, lw * 1.4);
  P.both(rect(-80, -4, 172, 30, 8), 'tealLt', lw); for (let k = -64; k < 90; k += 14) P.line(svg(`M${k} 0 L${k} 22`), lw * 0.4);
  P.line(svg('M96 -150 L40 -150 C30 -110 30 -60 36 -6'), lw * 0.8);
  ctx.restore();
  if (o.carry === 'duffel') { P.both(rect(-190, hipY - 210, 170, 120, 40), 'rose', lw * 1.2); P.line(svg(`M-150 ${hipY - 210} C-120 ${hipY - 300} -40 ${hipY - 320} ${sh[0]} ${sh[1] + 10}`), lw * 2.2); }
  drawLeg(near, 'denim', 'cream');
  // head in profile under the hood
  ctx.save(); ctx.translate(sh[0] + 34, sh[1] - 112); ctx.rotate(-(o.lookUp ?? 0) * 0.2);
  // the cowl rises from the rim to a soft point up and behind the head, then falls behind the skull
  // and bunches on the back of the neck
  const hoodP = svg('M64 -100 C58 -150 20 -196 -40 -228 C-52 -236 -66 -244 -84 -246 C-80 -232 -82 -220 -88 -206 C-130 -150 -150 -60 -140 10 C-134 60 -118 96 -96 124 L42 116 C20 82 0 40 8 -10 C14 -50 34 -80 64 -100 Z');
  P.fill(hoodP, hood); P.tone(hoodP, 'hoodDot', { from: [0, -60, 0], to: [-120, 60, 0.55], bbox: [-150, -250, 70, 130] }, 6); P.line(hoodP, lw * 1.4);
  P.line(svg('M-40 -228 C-74 -180 -96 -100 -96 -10 M-84 -246 C-70 -226 -62 -210 -60 -196'), lw * 0.6);   // the crown seam, the tip's flop
  P.line(svg('M-120 -40 C-106 20 -96 60 -76 100 M-136 40 C-120 80 -110 100 -96 124'), lw * 0.5);      // folds bunched at the neck
  const faceP = svg('M58 -98 C78 -80 90 -60 90 -38 L112 -4 L94 8 C98 18 98 26 94 32 C98 42 94 56 86 64 C76 84 56 94 40 104 C20 80 2 40 8 -10 C14 -50 34 -80 58 -98 Z');
  P.fill(faceP, 'skin'); P.tone(faceP, 'skinDot', { from: [56, -100, 0.7], to: [70, -50, 0], bbox: [0, -110, 115, 110] }, 5); P.line(faceP, lw * 1.1);
  P.line(svg('M58 -98 C34 -80 14 -50 8 -10 C0 40 20 80 42 116'), lw * 4.5, 'tealLt');            // the rim
  P.line(svg('M60 -104 C36 -86 15 -56 9 -12 C1 40 20 82 46 122 M50 -90 C28 -74 12 -46 6 -8 C-2 40 16 78 36 110'), lw * 0.8);
  P.fill(ell(72, -30, 5, 6), 'line'); P.line(ell(76, -30, 13, 16), lw * 0.9); P.line(svg('M63 -32 L16 -30'), lw * 0.8);   // eye, glasses
  P.line(svg('M90 26 L80 28'), lw * 0.7);
  const str = svg('M38 112 C46 150 40 190 50 240'); P.line(str, lw * 2.2); P.line(str, lw * 1.1, 'cream');
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
