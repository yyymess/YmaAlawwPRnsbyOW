// The hero: teal hoodie, hood up, round glasses, clean-shaven, a little dark fringe, drawstrings that
// curl like Mucha ribbons. Front bust and a walking profile. Unit space; s scales.
import { C, at, ell, rect, svg, clamp } from '../paint.js';

/**
 * Front bust, centred on the face (face is ~270 units wide, the bust ~660 wide, 560 below the face centre).
 * o: mouth 'neutral'|'smile'|'sing'|'o'|'frown', open 0..1 (for 'sing'), blink 0..1, look [dx, dy] in -1..1,
 *    uplit (lit from below by a screen), hood colour, noStrings, cheek.
 */
export function heroFront(P, x, y, s, o = {}) {
  const T = at(x, y, s), lw = Math.max(1.4, 4 * s), lo = lw * 1.6, bb = [x - 360 * s, y - 300 * s, x + 360 * s, y + 580 * s], cell = Math.max(3, 7 * s);
  const hoodC = o.hood ?? 'teal';
  const body = T('M-330 560 C-300 360 -180 280 0 275 C180 280 300 360 330 560 Z');
  const hood = T('M-230 260 C-270 40 -200 -250 0 -265 C200 -250 270 40 230 260 C150 320 -150 320 -230 260 Z');
  P.fill(body, hoodC); P.tone(body, 'hoodDot', { from: [x - 120 * s, y, 0], to: [x + 330 * s, y, 0.55], bbox: bb }, cell); P.line(body, lo);
  P.fill(hood, hoodC); P.tone(hood, 'hoodDot', { from: [x + 40 * s, y, 0], to: [x + 240 * s, y, 0.6], bbox: bb }, cell); P.line(hood, lo);
  P.line(T('M-150 -200 C-100 -235 100 -235 150 -200 M150 -150 C190 -60 200 60 180 200'), lw * 0.7);
  P.both(T('M0 -215 C-115 -212 -170 -110 -170 20 C-170 160 -100 245 0 250 C100 245 170 160 170 20 C170 -110 115 -212 0 -215 Z'), 'tealDk', lw);
  const face = T('M0 -150 C-95 -148 -135 -70 -135 25 C-135 125 -80 195 0 200 C80 195 135 125 135 25 C135 -70 95 -148 0 -150 Z');
  P.fill(face, 'skin');
  const fc = Math.max(2.5, 5 * s);
  if (o.uplit) {
    P.tone(face, 'skinDot', { from: [x, y - 150 * s, 0.55 * o.uplit], to: [x, y + 60 * s, 0], bbox: bb }, fc);
    P.tone(face, 'goldLt', { from: [x, y + 200 * s, 0.7 * o.uplit], to: [x, y + 40 * s, 0], bbox: bb }, fc);
  } else P.tone(face, 'skinDot', { from: [x + 30 * s, y, 0], to: [x + 135 * s, y, 0.5], bbox: bb }, fc);
  P.line(face, lw * 1.2);
  P.fill(T('M-110 -105 C-80 -150 60 -170 110 -110 C70 -128 20 -118 -10 -96 C-40 -116 -80 -118 -110 -105 Z'), 'hair');
  const browUp = (o.brow ?? 0) * 10;
  P.line(T(`M-88 ${-62 - browUp} C-70 ${-72 - browUp} -48 ${-72 - browUp} -30 ${-64 - browUp} M30 ${-64 - browUp} C48 ${-72 - browUp} 70 ${-72 - browUp} 88 ${-62 - browUp}`), lw * 0.7);
  for (const sx of [-1, 1]) P.line(T(`M${sx * 112} -12 C${sx * 112} -56 ${sx * 22} -56 ${sx * 22} -12 C${sx * 22} 30 ${sx * 112} 30 ${sx * 112} -12 Z`), lw * 1.05);
  P.line(T('M-22 -16 L22 -16'), lw);
  const [lx, ly] = o.look ?? [0, 0], blink = clamp(o.blink ?? 0);
  for (const sx of [-1, 1]) {
    const ex = x + (sx * 67 + lx * 14) * s, ey = y + (-10 + ly * 10) * s;
    if (blink > 0.6) P.line(svg(`M${ex - 12 * s} ${ey} C${ex - 4 * s} ${ey + 5 * s} ${ex + 4 * s} ${ey + 5 * s} ${ex + 12 * s} ${ey}`), lw * 0.9);
    else P.fill(ell(ex, ey, 9 * s + 1, (9 * s + 1) * (1 - blink)), 'line');
  }
  if (o.uplit) for (const sx of [-1, 1]) P.line(T(`M${sx * 100} 22 L${sx * 34} 16`), lw * 0.9, 'goldLt');
  P.line(T('M6 30 C-4 62 -8 74 8 80'), lw * 0.6);
  const m = o.mouth ?? 'neutral';
  if (m === 'sing' || m === 'o') { const op = m === 'o' ? 1 : clamp(o.open ?? 0.6); P.both(ell(x, y + 122 * s, (16 + 6 * op) * s, (6 + 18 * op) * s), 'tealDk', lw * 0.7); }
  else if (m === 'smile') P.line(T('M-34 116 C-14 140 14 140 34 116'), lw * 0.9);
  else if (m === 'frown') P.line(T('M-28 132 C-10 118 10 118 28 132'), lw * 0.9);
  else P.line(T('M-26 122 C-8 130 10 130 28 120'), lw * 0.8);
  if (!o.uplit && o.cheek !== false) P.fill(ell(x - 85 * s, y + 70 * s, 22 * s, 12 * s), 'roseLt');
  if (!o.noStrings) {
    const curl = (sx) => T(`M${sx * 50} 272 C${sx * 70} 340 ${sx * 30} 380 ${sx * 70} 430 C${sx * 110} 480 ${sx * 160} 440 ${sx * 140} 400 C${sx * 125} 375 ${sx * 95} 395 ${sx * 112} 418`);
    for (const sx of [-1, 1]) { P.line(curl(sx), lw * 2.4); P.line(curl(sx), lw * 1.3, 'cream'); }
  }
}

/**
 * Walking profile, facing right, standing on (x, y) (feet on the ground line). Full height ~980 units.
 * phase: walk cycle in radians (one stride per π). o: carry 'phone'|'duffel'|null, hood colour, look up.
 */
export function heroWalk(P, x, y, s, phase = 0, o = {}) {
  const ctx = P.ctx, lw = Math.max(1.4, 4 * s), hoodC = o.hood ?? 'teal';
  const sw = Math.sin(phase), bob = Math.abs(Math.cos(phase)) * 10;
  ctx.save(); ctx.translate(x, y - bob * s); ctx.scale(s, s);
  const limb = (px, py, ang, len, w, color) => {
    ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
    P.both(rect(-w / 2, -w / 2, w, len + w / 2, w / 2), color, lw / s * 1.1); ctx.restore();
    return [px - Math.sin(ang) * len, py + Math.cos(ang) * len];
  };
  const shoe = (fx, fy, ang, color) => { ctx.save(); ctx.translate(fx, fy); ctx.rotate(ang * 0.4); P.both(rect(-26, -14, 92, 34, 14), color, lw / s); P.line(svg('M-20 14 L60 14'), lw / s * 0.6); ctx.restore(); };
  // far leg and arm (darker), then the body, then the near ones
  const legA = 0.42 * sw, armA = -0.5 * sw;
  const [fx1, fy1] = limb(0, -420, -legA, 400, 66, '#3b4a5c'); shoe(fx1, fy1, -legA, 'grey');
  limb(14, -690, -armA, 270, 48, 'tealDk');
  P.both(svg('M-75 -735 C-95 -610 -85 -480 -62 -395 L72 -395 C92 -500 98 -625 84 -735 C40 -760 -40 -760 -75 -735 Z'), hoodC, lw / s * 1.4);
  P.line(svg('M-60 -470 L70 -470'), lw / s * 0.7);                                                    // pocket seam
  if (o.carry === 'duffel') { P.both(rect(-150, -560, 140, 110, 30), 'rose', lw / s * 1.2); P.line(svg('M-120 -560 C-110 -640 -60 -680 -10 -690'), lw / s * 1.4); }
  const [fx2, fy2] = limb(0, -420, legA, 400, 66, '#4a5d73'); shoe(fx2, fy2, legA, 'cream');
  // head: face in profile under the hood
  const hx = 40, hy = -830, up = (o.lookUp ?? 0) * 0.25;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(-up);
  P.both(ell(14, 6, 72, 84), 'skin', lw / s);
  P.tone(ell(14, 6, 72, 84), 'skinDot', { from: [-50, 0, 0.5], to: [40, 0, 0], bbox: [-80, -90, 90, 100] }, 6);
  P.both(svg('M80 -6 L98 22 L80 28 Z'), 'skin', lw / s * 0.8);                                          // nose
  P.line(svg('M58 52 L78 50'), lw / s * 0.8);                                                           // mouth
  P.both(svg('M-60 70 C-110 30 -110 -80 -40 -110 C10 -130 70 -110 88 -60 C60 -86 20 -92 -10 -70 C-30 -40 -20 20 0 60 C-10 80 -40 90 -60 70 Z'), hoodC, lw / s * 1.4);   // hood
  P.fill(svg('M84 -60 C60 -82 20 -84 -6 -66 C10 -60 50 -58 84 -48 Z'), 'hair');
  P.line(ell(58, -8, 22, 22), lw / s * 1.1); P.line(svg('M36 -8 L4 -10'), lw / s * 0.9);                 // glasses
  P.fill(ell(62, -6, 5, 5), 'line');
  ctx.restore();
  const [hx2, hy2] = limb(14, -690, armA, 270, 48, hoodC);
  if (o.carry === 'phone') { phone(P, hx2 + 24, hy2 - 30, 0.9, -0.2); }
  P.both(ell(hx2, hy2, 24, 24), 'skin', lw / s);
  ctx.restore();
}

/** A phone seen from the back (camera bump outward), centred at (x, y); rot in radians. */
export function phone(P, x, y, s = 1, rot = 0, glow = 0) {
  const ctx = P.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (glow > 0) P.fill(rect(-36, -58, 72, 116, 16), 'goldLt');
  P.both(rect(-30, -52, 60, 104, 10), 'tealDk', 2.5);
  P.tone(rect(-30, -52, 60, 104, 10), '#0f1c1b', { from: [-30, -52, 0], to: [30, 52, 0.5], bbox: [-40, -60, 40, 60] }, 4);
  P.both(rect(-22, -44, 26, 30, 7), 'teal', 2);
  for (const [cx, cy] of [[-15, -36], [-4, -36], [-15, -23]]) P.both(ell(cx, cy, 4.5), 'line', 1.5);
  ctx.restore();
}
