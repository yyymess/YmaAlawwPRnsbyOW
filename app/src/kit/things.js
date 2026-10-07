// Props for the scenes, in the same line, flat colour and screentone as everything else. Each takes
// (P, x, y, s, ...) and draws in its own local units around (x, y).
import { C, at, ell, rect, svg, clamp, rng, FONT, lerp, ease } from '../paint.js';

/** enter a local space; returns the outline width in local units */
export function begin(P, x, y, s = 1, rot = 0) { const c = P.ctx; c.save(); c.translate(x, y); if (rot) c.rotate(rot); c.scale(s, s); return Math.max(1.3, 4 * s) / s; }
export function end(P) { P.ctx.restore(); }

/** a beige CRT monitor on its foot, (x, y) at the foot's bottom centre; o.lines: [text] in phosphor; o.on 0..1 */
export function crt(P, x, y, s, o = {}) {
  const lw = begin(P, x, y, s), on = o.on ?? 1;
  P.both(svg('M-64 0 L-50 -26 L50 -26 L64 0 Z'), 'sepia', lw);
  const body = svg('M-160 -26 L-160 -262 C-160 -278 -150 -286 -134 -286 L134 -286 C150 -286 160 -278 160 -262 L160 -26 Z');
  P.fill(body, 'cream'); P.tone(body, 'sepiaDk', { from: [60, -150, 0], to: [160, -26, 0.45], bbox: [-160, -286, 160, -26] }, 5); P.line(body, lw * 1.2);
  const scr = svg('M-128 -254 C-80 -262 80 -262 128 -254 C134 -190 134 -120 128 -70 C80 -62 -80 -62 -128 -70 C-134 -120 -134 -190 -128 -254 Z');
  P.fill(scr, '#10231c');
  if (on > 0) {
    P.tone(scr, 'mint', { from: [0, -160, 0.55 * on], to: [150, -160, 0], radial: true, bbox: [-130, -262, 130, -62] }, 4);
    P.ctx.save(); P.clip(scr); P.alpha(on);
    (o.lines ?? []).forEach((l, i) => P.text(l, -110, -222 + i * 22, { font: FONT.mono, size: 17, weight: 600, align: 'left', color: '#a6e8bf' }));
    if (o.cursor !== false && Math.floor((o.t ?? 0) * 2.4) % 2 === 0) P.fill(rect(-110 + (o.cursorX ?? 0), -222 + ((o.lines ?? []).length) * 22 - 14, 10, 16), '#a6e8bf');
    P.restore();
  } else if (o.dot) P.fill(ell(0, -160, 3 + 120 * o.dot, 2 + 4 * o.dot), '#a6e8bf');
  P.line(scr, lw);
  P.line(svg('M-128 -254 C-80 -262 80 -262 128 -254 C134 -190 134 -120 128 -70'), lw * 0.4, 'cream');
  for (let i = 0; i < 5; i++) P.line(svg(`M${70 + i * 12} -46 L${70 + i * 12} -36`), lw * 0.6);
  P.both(ell(-120, -42, 6), on > 0 ? 'mint' : 'grey', lw * 0.5);
  end(P);
}

/** a keyboard slab seen from the front-side, (x, y) its front centre */
export function keyboard(P, x, y, s) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-150 0 L-136 -30 L136 -30 L150 0 Z'), 'cream', lw);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 12; k++) P.line(svg(`M${-128 + k * 22 + r * 4} ${-24 + r * 8} l14 0`), lw * 1.2, 'sepiaDk');
  end(P);
}

/** a dial-up modem: a dark box with a row of LEDs that chatter when o.active */
export function modem(P, x, y, s, t, o = {}) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-80 0 L-70 -40 L70 -40 L80 0 Z'), 'charDk', lw);
  P.both(rect(-80, -6, 160, 10, 3), 'char', lw * 0.8);
  P.text('56K', 50, -2, { font: FONT.caps, weight: 700, size: 13, color: 'goldLt' });
  const labels = ['HS', 'AA', 'CD', 'OH', 'RD', 'SD', 'TR', 'MR'];
  labels.forEach((l, i) => {
    const lit = o.active ? Math.sin(t * (9 + i * 3.1) + i * 1.7) > 0.1 - (i === 3 ? 1 : 0) : i === 6 || i === 7;
    P.both(ell(-56 + i * 16, -22, 4.2), lit ? (i === 4 || i === 5 ? 'red' : 'goldLt') : 'char', lw * 0.4);
  });
  end(P);
}

/** a thick standards document: blue-grey boards, gold title; glow 0..1 sends out rays */
export function specBook(P, x, y, s, rot = 0, o = {}) {
  const lw = begin(P, x, y, s, rot), g = o.glow ?? 0;
  if (g > 0) {
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + (o.t ?? 0) * 0.3; P.ctx.save(); P.alpha(g * 0.85); P.fill(svg(`M0 0 L${Math.cos(a - 0.08) * 260} ${Math.sin(a - 0.08) * 260} L${Math.cos(a + 0.08) * 260} ${Math.sin(a + 0.08) * 260} Z`), 'goldLt'); P.restore(); }
    P.tone(ell(0, 0, 200), 'goldLt', { from: [0, 0, 0.8 * g], to: [200, 0, 0], radial: true, bbox: [-200, -200, 200, 200] }, 5);
  }
  P.both(svg('M-96 -120 L96 -120 L106 -110 L106 128 L-86 128 L-96 118 Z'), 'cream', lw);                     // the page block
  for (let k = 0; k < 6; k++) P.line(svg(`M-80 ${122 - k * 2} L100 ${122 - k * 2}`), lw * 0.3, 'sepiaDk');
  const cover = svg('M-104 -128 L92 -128 L92 112 L-104 112 Z');
  P.fill(cover, o.color ?? 'navy'); P.tone(cover, '#000', { from: [-104, -128, 0], to: [92, 112, 0.4], bbox: [-104, -128, 92, 112] }, 5); P.line(cover, lw * 1.2);
  P.line(rect(-90, -114, 168, 212, 4), lw * 0.6, 'gold');
  P.text(o.title ?? 'ISO/IEC', -6, -64, { font: FONT.caps, weight: 700, size: 22, color: 'gold' });
  P.text(o.sub ?? '14496', -6, -36, { font: FONT.caps, weight: 700, size: 26, color: 'gold' });
  P.line(svg('M-60 -18 L48 -18'), lw * 0.5, 'gold');
  P.text(o.foot ?? 'CODING OF AUDIO-VISUAL OBJECTS', -6, 0, { font: FONT.caps, size: 9, color: 'goldLt' });
  P.both(rect(-104, -128, 14, 240, 2), o.color ?? 'navy', lw * 0.8);
  if (o.tab) { P.both(svg('M40 -128 L40 -160 L62 -160 L62 -128 Z'), 'red', lw * 0.7); }
  end(P);
}

/**
 * a scroll: parchment between two rolls; (x, y) its top centre; w, h its full size; o.unroll 0..1 opens
 * it downwards; o.title, o.lines (strings) lettered in Cinzel / Federant; o.horizontal unrolls sideways.
 */
export function scroll(P, x, y, w, h, o = {}) {
  const lw = begin(P, x, y, 1), u = clamp(o.unroll ?? 1), hh = Math.max(4, h * u);
  const sheet = svg(`M${-w / 2} 0 L${w / 2} 0 L${w / 2} ${hh} C${w / 4} ${hh - 8} ${-w / 4} ${hh + 8} ${-w / 2} ${hh} Z`);
  P.fill(sheet, o.color ?? 'ivory'); P.tone(sheet, 'sepiaDk', { from: [-w / 2, 0, 0.25], to: [w / 2, 0, 0], bbox: [-w / 2, 0, w / 2, hh] }, 5); P.line(sheet, lw * 1.1);
  P.ctx.save(); P.clip(sheet);
  if (o.title) P.text(o.title, 0, 46, { font: FONT.caps, weight: 700, size: o.titleSize ?? 26 });
  (o.lines ?? []).forEach((l, i) => { const ly = (o.title ? 84 : 40) + i * (o.lineH ?? 30); if (typeof l === 'number') P.line(svg(`M${-w / 2 + 30} ${ly} L${-w / 2 + 30 + (w - 60) * l} ${ly}`), lw * 0.8, 'sepiaDk'); else P.text(l, o.align === 'left' ? -w / 2 + 30 : 0, ly, { font: o.font ?? FONT.display, size: o.size ?? 22, align: o.align ?? 'center', color: o.ink ?? 'line' }); });
  P.restore();
  for (const ry of [0, hh]) { P.both(rect(-w / 2 - 14, ry - 12, w + 28, 24, 12), o.roll ?? 'sepia', lw); P.both(ell(-w / 2 - 14, ry, 9, 14), 'sepiaDk', lw * 0.8); P.both(ell(w / 2 + 14, ry, 9, 14), 'sepiaDk', lw * 0.8); }
  end(P);
}

/** a closed laptop, (x, y) its centre, with a couple of stickers */
export function laptop(P, x, y, s, rot = 0) {
  const lw = begin(P, x, y, s, rot);
  P.both(rect(-110, -76, 220, 152, 12), 'silver', lw);
  P.tone(rect(-110, -76, 220, 152, 12), 'grey', { from: [-110, -76, 0], to: [110, 76, 0.4], bbox: [-110, -76, 110, 76] }, 5);
  P.line(rect(-110, -76, 220, 152, 12), lw);
  P.both(ell(-40, -20, 22), 'red', lw * 0.6); P.both(rect(20, 4, 56, 30, 8), 'goldLt', lw * 0.6); P.text('λ', 48, 27, { size: 24, weight: 700 });
  end(P);
}

/** a lectern with a sloped top, (x, y) on the floor */
export function lectern(P, x, y, s) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-70 0 L70 0 L50 -30 L-50 -30 Z'), 'sepiaDk', lw);
  P.both(rect(-24, -330, 48, 300, 6), 'ochre', lw); P.line(svg('M0 -320 L0 -40'), lw * 0.5);
  P.both(svg('M-130 -360 L130 -400 L136 -370 L-124 -330 Z'), 'ochre', lw); P.both(svg('M-124 -330 L136 -370 L136 -356 L-124 -316 Z'), 'sepiaDk', lw * 0.8);
  end(P);
}

/** a quill pen; (x, y) the nib, pointing down-left at rot */
export function quill(P, x, y, s, rot = 0) {
  const lw = begin(P, x, y, s, rot);
  P.both(svg('M0 0 C20 -40 70 -150 150 -230 C120 -150 70 -60 10 -2 Z'), 'cream', lw);
  P.line(svg('M2 -2 C40 -70 90 -160 150 -230'), lw * 0.6);
  for (let i = 1; i < 7; i++) P.line(svg(`M${20 + i * 18} ${-30 - i * 28} l${18} ${6}`), lw * 0.4);
  P.line(svg('M0 0 L-6 10'), lw * 1.2);
  end(P);
}

/**
 * The bug as a dragon: a beetle the size of a horse, its shell split down the middle and printed with
 * circuit traces, bat wings, mandibles; o.dead: on its back, legs up, wearing a small halo (blameless).
 */
export function bugDragon(P, x, y, s, t, o = {}) {
  const lw = begin(P, x, y, s), dead = o.dead ?? 0;
  if (dead > 0.5) { P.ctx.save(); P.ctx.translate(0, -240); P.ctx.scale(1, -1); }   // on its back, legs in the air
  const breathe = Math.sin(t * 2.4) * 6, rear = o.rear ?? 0;
  P.ctx.rotate(-rear * 0.35);
  // wings behind
  for (const k of [0, 1]) {
    if (dead > 0.5) continue;
    P.ctx.save(); P.ctx.translate(-40 + k * 50, -170); P.ctx.rotate(-1.9 + Math.sin(t * 3 + k) * 0.14 + k * 0.35); P.ctx.scale(1.35, 1.35);
    const wing = svg('M0 0 C40 -120 140 -210 260 -220 C230 -170 236 -120 270 -84 C210 -100 180 -60 186 -10 C130 -40 80 -20 60 20 Z');
    P.fill(wing, k ? 'plum' : 'rose'); P.tone(wing, '#000', { from: [0, 0, 0.4], to: [260, -220, 0], bbox: [0, -230, 280, 30] }, 6); P.line(wing, lw);
    P.line(svg('M10 0 C80 -80 160 -160 258 -218 M30 4 C100 -40 180 -90 270 -86 M50 12 C110 -10 160 -20 186 -12'), lw * 0.5);
    P.ctx.restore();
  }
  // legs
  for (let i = 0; i < 3; i++) {
    const lx = -110 + i * 100, sw = Math.sin(t * 6 + i * 2) * (dead > 0.5 ? 0.4 : 0.1);
    P.line(svg(`M${lx} -40 L${lx - 30 + sw * 40} 40 L${lx - 70 + sw * 60} 70`), lw * 3.4); P.line(svg(`M${lx} -40 L${lx - 30 + sw * 40} 40 L${lx - 70 + sw * 60} 70`), lw * 1.6, 'charDk');
  }
  // the shell
  const shell = svg(`M-220 -60 C-230 -170 -120 -${230 + breathe} 30 -${230 + breathe} C170 -${230 + breathe} 230 -160 220 -60 C200 -10 120 10 0 10 C-120 10 -200 -10 -220 -60 Z`);
  P.fill(shell, o.color ?? 'ochre'); P.tone(shell, '#000', { from: [-40, -200, 0], to: [200, 0, 0.5], bbox: [-230, -240, 230, 20] }, 6); P.line(shell, lw * 1.4);
  P.line(svg(`M20 -${228 + breathe} C10 -150 0 -80 0 8`), lw);
  P.ctx.save(); P.clip(shell);
  for (const [a, b, c2] of [[-160, -120, -90], [-120, -60, -150], [60, -150, -110], [120, -90, -60], [40, -60, -30]]) { P.line(svg(`M${a} ${b} L${a + 40} ${b} L${a + 60} ${c2}`), lw * 0.7, 'goldLt'); P.both(ell(a + 60, c2, 6), 'goldLt', lw * 0.4); }
  P.restore();
  if (o.mark) P.text(o.mark, -90, -110, { size: 90, weight: 700, color: 'cream', stroke: 'line', strokeW: 6 });
  // the head with mandibles and antennae
  P.both(svg('M200 -120 C260 -150 320 -120 330 -70 C336 -30 300 -6 250 -10 C220 -14 200 -40 196 -70 Z'), o.color ?? 'ochre', lw * 1.2);
  P.both(svg('M320 -60 C370 -60 390 -30 370 -6 C360 -30 340 -40 318 -40 Z M310 -30 C350 -10 360 20 336 34 C334 10 320 -4 300 -12 Z'), 'charDk', lw);
  if (dead > 0.5) P.line(svg('M276 -102 L296 -82 M296 -102 L276 -82'), lw * 1.2);   // x x
  else { P.both(ell(286, -92, 14, 16), 'cream', lw * 0.8); P.fill(ell(292, -92, 7, 9), 'red'); }
  P.line(svg(`M270 -140 C280 -220 330 -250 ${380 + Math.sin(t * 4) * 8} -250 M290 -136 C320 -200 380 -210 ${420 + Math.sin(t * 4 + 1) * 8} -190`), lw * 1.4);
  if (dead > 0.5) { P.ctx.restore(); if (o.halo) { const b = Math.sin(t * 3) * 6; P.both(ell(40, -380 + b, 110, 26), 'gold', lw); P.line(ell(40, -380 + b, 86, 16), lw * 0.5); } }
  end(P);
}

/** an org-chart box as a cloud: a dotted rounded box, empty title line, maybe a question mark */
export function orgCloud(P, x, y, w, h, o = {}) {
  const lw = begin(P, x, y, 1);
  P.fill(rect(-w / 2, -h / 2, w, h, h / 2.4), o.fill ?? 'ivory');
  P.ctx.save(); P.ctx.setLineDash([2, 12]); P.line(rect(-w / 2, -h / 2, w, h, h / 2.4), 5); P.ctx.restore();
  if (o.q) P.text('?', 0, h * 0.18, { size: h * 0.6, color: 'sepiaDk' });
  else { P.ctx.save(); P.ctx.setLineDash([2, 10]); P.line(svg(`M${-w * 0.3} 0 L${w * 0.3} 0`), 4, 'sepiaDk'); P.ctx.restore(); }
  end(P);
}

/** a red pen as a sceptre, (x, y) its centre, vertical by default */
export function redPen(P, x, y, s, rot = 0, capOff = 0) {
  const lw = begin(P, x, y, s, rot);
  P.both(svg('M-20 -200 L20 -200 L20 150 L0 210 L-20 150 Z'), 'red', lw * 1.2);
  P.tone(svg('M-20 -200 L20 -200 L20 150 L0 210 L-20 150 Z'), 'redDk', { from: [-20, 0, 0], to: [20, 0, 0.6], bbox: [-20, -200, 20, 210] }, 5);
  P.line(svg('M-20 -200 L20 -200 L20 150 L0 210 L-20 150 Z'), lw * 1.2);
  P.both(svg('M-8 182 L8 182 L0 214 Z'), 'redDk', lw * 0.8);
  P.both(rect(-24, -240 - capOff, 48, 90, 10), 'redDk', lw); P.both(rect(16, -230 - capOff, 12, 70, 4), 'silver', lw * 0.6);
  P.line(svg('M-20 60 L20 60 M-20 76 L20 76'), lw * 0.6, 'cream');
  end(P);
}

/** a wax seal with lettering (LGTM): o.color, o.stamp 0..1 squashes it as it is pressed */
export function seal(P, x, y, s, text = 'LGTM', o = {}) {
  const lw = begin(P, x, y, s);
  const blob = svg('M0 -70 C30 -72 46 -60 58 -40 C76 -30 74 0 66 18 C70 44 50 64 24 66 C6 80 -20 76 -38 62 C-62 60 -74 36 -68 14 C-80 -8 -70 -36 -50 -46 C-40 -66 -20 -72 0 -70 Z');
  P.fill(blob, o.color ?? 'red'); P.tone(blob, 'redDk', { from: [-40, -40, 0], to: [50, 50, 0.6], bbox: [-80, -80, 80, 80] }, 5); P.line(blob, lw);
  P.line(ell(0, 0, 46), lw * 0.7, 'redDk'); P.line(ell(0, 0, 40), lw * 0.4, 'goldLt');
  P.text(text, 0, 9, { font: FONT.caps, weight: 700, size: 26, color: 'goldLt' });
  end(P);
}

/** a stone tablet with a two-lobed top and carved lettering; (x, y) its top centre */
export function tablet(P, x, y, w, h, o = {}) {
  const lw = begin(P, x, y, 1);
  const shape = svg(`M${-w / 2} ${h} L${-w / 2} ${w * 0.22} C${-w / 2} ${-w * 0.02} ${-w * 0.04} ${-w * 0.02} 0 ${w * 0.14} C${w * 0.04} ${-w * 0.02} ${w / 2} ${-w * 0.02} ${w / 2} ${w * 0.22} L${w / 2} ${h} Z`);
  P.fill(shape, o.color ?? 'sepia'); P.tone(shape, 'sepiaDk', { from: [-w / 2, 0, 0], to: [w / 2, h, 0.5], bbox: [-w / 2, -w * 0.05, w / 2, h] }, 6); P.line(shape, lw * 1.4);
  P.line(svg(`M0 ${w * 0.14} L0 ${h}`), lw * 0.8);
  P.ctx.save(); P.clip(shape);
  const carve = (l, x0, ly) => { P.text(l, x0, ly + 2, { font: FONT.caps, weight: 700, size: o.size ?? 40, color: '#f6ecd6' }); P.text(l, x0, ly, { font: FONT.caps, weight: 700, size: o.size ?? 40, color: 'charDk' }); };
  (o.lines ?? []).forEach((l, i) => carve(l, 0, (o.top ?? h * 0.36) + i * (o.lineH ?? 54)));
  (o.left ?? []).forEach((l, i) => carve(l, -w / 4, (o.top ?? h * 0.36) + i * (o.lineH ?? 54)));
  (o.right ?? []).forEach((l, i) => carve(l, w / 4, (o.top ?? h * 0.36) + i * (o.lineH ?? 54)));
  P.restore();
  if (o.cracks) P.line(svg(`M${w * 0.3} ${h * 0.2} L${w * 0.22} ${h * 0.34} L${w * 0.3} ${h * 0.42} L${w * 0.2} ${h * 0.56}`), lw * 0.7);
  end(P);
}

/** a money sack with a dollar sign */
export function moneybag(P, x, y, s, rot = 0) {
  const lw = begin(P, x, y, s, rot);
  const bag = svg('M-30 -120 C-20 -100 -10 -96 0 -96 C10 -96 20 -100 30 -120 C40 -140 60 -150 50 -160 C30 -150 -30 -150 -50 -160 C-60 -150 -40 -140 -30 -120 Z M-36 -96 C-120 -60 -130 40 -90 70 C-50 96 50 96 90 70 C130 40 120 -60 36 -96 Z');
  P.fill(bag, 'sepia'); P.tone(bag, 'sepiaDk', { from: [-60, -80, 0], to: [100, 80, 0.5], bbox: [-130, -160, 130, 96] }, 5); P.line(bag, lw * 1.2);
  P.line(svg('M-40 -98 C-10 -88 10 -88 40 -98'), lw * 2.4, 'ochre');
  P.text('$', 0, 40, { size: 110, weight: 700, color: 'gold', stroke: 'line', strokeW: 5 });
  end(P);
}

/** a globe with meridians and soft continents; spin moves the continents */
export function globe(P, x, y, r, spin = 0, o = {}) {
  const lw = begin(P, x, y, 1), c = ell(0, 0, r);
  P.fill(c, o.sea ?? 'mint'); P.ctx.save(); P.clip(c);
  const land = [[-0.5, -0.3, 0.42, 0.3], [0.2, 0.1, 0.36, 0.42], [0.65, -0.4, 0.3, 0.22], [-0.2, 0.55, 0.3, 0.18]];
  for (const [lx, ly, rx, ry] of land) { const px = ((lx + spin + 1.5) % 2) - 1; P.fill(ell(px * r * 1.2, ly * r, rx * r, ry * r), o.land ?? 'sage'); }
  P.tone(c, 'hoodDot', { from: [-r * 0.4, -r * 0.4, 0], to: [r, r, 0.5], bbox: [-r, -r, r, r] }, Math.max(4, r / 22));
  for (const k of [-0.6, 0, 0.6]) P.line(svg(`M${-r} ${k * r} C${-r * 0.4} ${k * r + 10} ${r * 0.4} ${k * r + 10} ${r} ${k * r}`), lw * 0.4);
  for (const k of [-0.5, 0.5]) P.line(ell(0, 0, Math.abs(k) * r, r), lw * 0.4);
  P.restore(); P.line(c, lw * 1.2);
  end(P);
}

/** a thought bubble: a cloud and three trailing puffs towards (tx, ty) */
export function thought(P, x, y, w, h, tx, ty, o = {}) {
  const lw = begin(P, x, y, 1), a = o.a ?? 1;
  P.ctx.save(); P.alpha(a);
  for (let i = 0; i < 3; i++) { const u = (i + 1) / 4, r = 10 + i * 6; P.both(ell(lerp(tx - x, 0, u), lerp(ty - y, h * 0.4, u), r, r * 0.85), 'ivory', lw); }
  const cl = new Path2D(); const n = 9;
  for (let i = 0; i <= n; i++) { const t = (i / n) * Math.PI * 2, px = Math.cos(t) * w / 2, py = Math.sin(t) * h / 2; if (!i) cl.moveTo(px, py); else { const tm = ((i - 0.5) / n) * Math.PI * 2; cl.quadraticCurveTo(Math.cos(tm) * w * 0.62, Math.sin(tm) * h * 0.62, px, py); } }
  P.both(cl, 'ivory', lw * 1.1);
  P.restore();
  end(P);
}

/** commit dots joined along a polyline; n how many are drawn; hashes optional */
export function commits(P, pts, n, o = {}) {
  const k = Math.min(pts.length, Math.floor(n)), lw = o.lw ?? 4;
  if (k > 1) { const p = new Path2D(); pts.slice(0, k).forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); P.line(p, lw * 2.6); P.line(p, lw * 1.2, o.color ?? 'gold'); }
  pts.slice(0, k).forEach((q, i) => { const pop = i === k - 1 ? 1 + 0.6 * (1 - (n - Math.floor(n))) : 1; P.both(ell(q[0], q[1], (o.r ?? 11) * pop), o.dot ?? 'cream', lw); });
}

/** two hands pressed together in prayer, fingertips up; (x, y) the wrists' centre */
export function prayHands(P, x, y, s, rot = 0) {
  const lw = begin(P, x, y, s, rot);
  for (const sx of [1, -1]) {   // each hand: a pointed silhouette, fingers laid along it, the heel of the palm at the wrist
    P.ctx.save(); P.ctx.scale(sx, 1);
    const h = svg('M0 -246 C22 -230 46 -196 56 -146 C66 -96 64 -44 52 0 L0 0 Z');
    P.line(h, lw * 2.2); P.fill(h, 'skin');
    P.tone(h, 'skinDot', { from: [10, -120, 0], to: [64, -60, 0.5], bbox: [0, -250, 70, 4] }, 4);
    P.line(svg('M4 -232 C24 -206 38 -176 46 -136 M8 -206 C26 -182 36 -158 42 -124 M12 -176 C26 -158 32 -140 36 -116'), lw * 0.5);   // the fingers' edges
    P.line(svg('M52 -40 C40 -30 30 -24 20 -22'), lw * 0.45);   // a crease at the heel
    P.ctx.restore();
  }
  P.line(svg('M0 -246 L0 -60'), lw * 0.7);
  for (const sx of [1, -1]) {   // the thumbs, crossed in front, the left over the right
    P.ctx.save(); P.ctx.scale(sx, 1);
    const th = svg('M-2 -24 C-6 -64 0 -100 16 -116 C28 -126 40 -118 38 -102 C36 -80 30 -52 26 -26 Z');
    P.both(th, 'skin', lw * 1.1); P.line(svg('M14 -102 C22 -98 28 -98 32 -104'), lw * 0.45);
    P.ctx.restore();
  }
  for (const sx of [-1, 1]) { P.both(rect(sx * 30 - 34, -4, 68, 54, 10), 'tealLt', lw); for (let k = -24; k <= 24; k += 8) P.line(svg(`M${sx * 30 + k} 0 L${sx * 30 + k} 46`), lw * 0.35); }
  end(P);
}

/** a crescent moon and a few stars */
export function moon(P, x, y, r, t = 0) {
  const lw = begin(P, x, y, 1);
  const m = new Path2D(); m.arc(0, 0, r, -Math.PI * 0.62, Math.PI * 0.62, true); m.arc(r * 0.42, -r * 0.08, r * 0.86, Math.PI * 0.66, -Math.PI * 0.66, false); m.closePath();
  P.both(m, 'goldLt', lw);
  end(P);
}
export function star(P, x, y, r, tw = 0) {
  const k = 1 + 0.25 * Math.sin(tw);
  P.both(svg(`M${x} ${y - r * k} L${x + r * 0.28} ${y - r * 0.28} L${x + r * k} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r * k} L${x - r * 0.28} ${y + r * 0.28} L${x - r * k} ${y} L${x - r * 0.28} ${y - r * 0.28} Z`), 'goldLt', 2);
}

/** a brass oil lamp with a living flame; (x, y) the base centre */
export function oilLamp(P, x, y, s, t, o = {}) {
  const lw = begin(P, x, y, s), fl = o.flame ?? 1;
  if (fl > 0) {
    P.tone(ell(60, -150, 170), 'goldLt', { from: [60, -150, 0.85 * fl], to: [230, -150, 0], radial: true, bbox: [-110, -320, 230, 20] }, 5);
    const w = Math.sin(t * 11) * 6 + Math.sin(t * 7.3) * 4;
    P.both(svg(`M60 -110 C30 -130 34 -170 ${60 + w} ${-230 - 20 * fl} C86 -170 90 -130 60 -110 Z`), 'gold', lw);
    P.both(svg(`M60 -116 C48 -128 50 -150 ${60 + w * 0.6} -176 C70 -150 72 -128 60 -116 Z`), 'cream', lw * 0.6);
  }
  P.both(svg('M-60 0 L60 0 L44 -20 L-44 -20 Z'), 'ochre', lw);
  const body = svg('M-110 -60 C-110 -100 -40 -110 0 -110 C30 -110 60 -104 90 -96 L120 -110 L130 -100 C110 -86 90 -70 70 -60 C40 -30 -60 -24 -110 -60 Z');
  P.fill(body, 'gold'); P.tone(body, 'ochre', { from: [-60, -100, 0], to: [60, -30, 0.6], bbox: [-120, -120, 140, -20] }, 5); P.line(body, lw * 1.2);
  P.line(svg('M-110 -70 C-150 -80 -160 -40 -126 -40'), lw * 2.4); P.line(svg('M-110 -70 C-150 -80 -160 -40 -126 -40'), lw * 1.2, 'gold');
  P.both(ell(-10, -114, 26, 8), 'ochre', lw); P.both(ell(-10, -124, 8), 'gold', lw * 0.8);
  P.both(svg('M-20 -24 L20 -24 L10 -60 L-10 -60 Z'), 'ochre', lw);
  end(P);
}

/** a wall clock; h: hours as a float (12-hour), the hands move with it */
export function clock(P, x, y, r, h) {
  const lw = begin(P, x, y, 1);
  P.both(ell(0, 0, r), 'ivory', lw * 1.4); P.line(ell(0, 0, r * 0.86), lw * 0.5);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; P.line(svg(`M${Math.sin(a) * r * 0.74} ${-Math.cos(a) * r * 0.74} L${Math.sin(a) * r * 0.84} ${-Math.cos(a) * r * 0.84}`), lw * (i % 3 ? 0.6 : 1.2)); }
  const ha = (h / 12) * Math.PI * 2, ma = (h % 1) * Math.PI * 2;
  P.line(svg(`M0 0 L${Math.sin(ha) * r * 0.5} ${-Math.cos(ha) * r * 0.5}`), lw * 1.8); P.line(svg(`M0 0 L${Math.sin(ma) * r * 0.74} ${-Math.cos(ma) * r * 0.74}`), lw * 1.1);
  P.both(ell(0, 0, r * 0.07), 'gold', lw * 0.5);
  end(P);
}

/** a paper coffee cup */
export function cup(P, x, y, s, rot = 0) {
  const lw = begin(P, x, y, s, rot);
  P.both(svg('M-30 0 L-38 -90 L38 -90 L30 0 Z'), 'cream', lw); P.both(svg('M-36 -66 L36 -66 L34 -40 L-34 -40 Z'), 'sepiaDk', lw * 0.8);
  P.both(rect(-42, -102, 84, 14, 5), 'ivory', lw);
  end(P);
}

/** a light bulb: glass, filament, screw base; glow 0..1; o.crown */
export function bulb(P, x, y, s, glow = 0.5, o = {}) {
  const lw = begin(P, x, y, s);
  if (glow > 0.05) {
    P.tone(ell(0, -130, 230), 'goldLt', { from: [0, -130, 0.9 * glow], to: [230, -130, 0], radial: true, bbox: [-230, -360, 230, 100] }, 6);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + (o.spin ?? 0); P.line(svg(`M${Math.cos(a) * 120} ${-130 + Math.sin(a) * 120} L${Math.cos(a) * (120 + 80 * glow)} ${-130 + Math.sin(a) * (120 + 80 * glow)}`), lw * 1.6, 'gold'); }
  }
  const g = svg('M-40 0 C-40 -40 -96 -70 -96 -140 C-96 -200 -50 -236 0 -236 C50 -236 96 -200 96 -140 C96 -70 40 -40 40 0 Z');
  P.fill(g, glow > 0.3 ? 'cream' : 'glass'); P.tone(g, glow > 0.3 ? 'goldLt' : 'mintDk', { from: [0, -130, glow > 0.3 ? 0.6 : 0.1], to: [90, -60, glow > 0.3 ? 0 : 0.5], bbox: [-100, -240, 100, 0] }, 5); P.line(g, lw * 1.3);
  P.line(svg('M-20 -10 L-24 -110 L-12 -126 L0 -110 L12 -126 L24 -110 L20 -10'), lw * 0.9, glow > 0.3 ? 'ochre' : 'line');
  P.line(svg('M-60 -170 C-50 -200 -30 -214 -10 -218'), lw * 0.8, 'cream');
  for (let i = 0; i < 4; i++) P.both(rect(-42 + i * 2, i * 16, 84 - i * 4, 16, 5), 'silver', lw * 0.8);
  P.both(svg('M-20 64 L20 64 L10 78 L-10 78 Z'), 'charDk', lw * 0.8);
  if (o.crown) { P.ctx.save(); P.ctx.translate(0, -262); P.ctx.scale(o.crown, o.crown); P.both(svg('M-50 0 L-60 -60 L-30 -30 L0 -74 L30 -30 L60 -60 L50 0 Z'), 'gold', lw); for (const cx of [-60, 0, 60]) P.both(ell(cx, cx ? -60 : -74, 7), 'red', lw * 0.6); P.ctx.restore(); }
  end(P);
}

/** a sailing ship in profile, (x, y) the waterline at mid-ship; o.sail text */
export function ship(P, x, y, s, t, o = {}) {
  const lw = begin(P, x, y, s, Math.sin(t * 1.4) * 0.03);
  const hull = svg('M-260 -60 L250 -60 C240 -10 200 30 150 40 L-200 40 C-240 20 -256 -20 -260 -60 Z');
  P.fill(hull, 'redDk'); P.tone(hull, '#000', { from: [0, -60, 0], to: [0, 40, 0.5], bbox: [-260, -60, 250, 40] }, 6); P.line(hull, lw * 1.3);
  P.line(svg('M-256 -40 L246 -40'), lw * 2, 'gold'); for (let i = 0; i < 7; i++) P.both(ell(-170 + i * 56, -16, 9), 'goldLt', lw * 0.6);
  P.both(svg('M180 -60 L250 -60 L300 -96 L230 -96 Z'), 'redDk', lw);
  for (const [mx, mh] of [[-120, 360], [60, 420]]) {
    P.line(svg(`M${mx} -60 L${mx} ${-60 - mh}`), lw * 3); P.line(svg(`M${mx} -60 L${mx} ${-60 - mh}`), lw * 1.4, 'sepiaDk');
    const sl = svg(`M${mx - 110} ${-60 - mh + 40} C${mx - 60} ${-60 - mh + 60} ${mx + 60} ${-60 - mh + 60} ${mx + 110} ${-60 - mh + 40} C${mx + 130} ${-60 - mh * 0.5} ${mx + 120} ${-110} ${mx + 100} -90 L${mx - 100} -90 C${mx - 120} -110 ${mx - 130} ${-60 - mh * 0.5} ${mx - 110} ${-60 - mh + 40} Z`);
    P.fill(sl, 'ivory'); P.tone(sl, 'sepiaDk', { from: [mx - 110, 0, 0.3], to: [mx + 110, 0, 0], bbox: [mx - 130, -60 - mh, mx + 130, -80] }, 6); P.line(sl, lw * 1.1);
    P.both(svg(`M${mx} ${-60 - mh} L${mx + 50} ${-60 - mh + 14} L${mx} ${-60 - mh + 28} Z`), 'gold', lw * 0.8);
  }
  if (o.sail) P.text(o.sail, 60, -290, { font: FONT.caps, weight: 700, size: 64, color: 'red' });
  end(P);
}

/** a firework burst: k 0..1 its age */
export function firework(P, x, y, r, k, color = 'goldLt', n = 14) {
  if (k <= 0 || k >= 1) return;
  const lw = begin(P, x, y, 1), rr = r * ease.outCubic(k);
  P.ctx.save(); P.alpha(1 - k * k);
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; P.line(svg(`M${Math.cos(a) * rr * 0.55} ${Math.sin(a) * rr * 0.55 + k * 20} L${Math.cos(a) * rr} ${Math.sin(a) * rr + k * 30}`), 5, color); P.both(ell(Math.cos(a) * rr, Math.sin(a) * rr + k * 30, 5), color, 1.5); }
  P.restore(); end(P);
}

/** a soda can, (x, y) its base centre */
export function sodaCan(P, x, y, s, rot = 0, o = {}) {
  const lw = begin(P, x, y, s, rot);
  const can = svg('M-50 0 C-56 -6 -56 -14 -52 -20 L-52 -180 C-56 -186 -56 -194 -48 -200 L48 -200 C56 -194 56 -186 52 -180 L52 -20 C56 -14 56 -6 50 0 Z');
  P.fill(can, o.color ?? 'red'); P.tone(can, 'redDk', { from: [-20, 0, 0], to: [52, 0, 0.7], bbox: [-56, -200, 56, 0] }, 5); P.line(can, lw * 1.2);
  P.line(svg('M-36 -180 L-36 -24'), lw * 2.4, 'cream');
  P.both(ell(0, -200, 48, 8), 'silver', lw); P.both(ell(10, -201, 14, 4), 'grey', lw * 0.5);
  P.ctx.save(); P.ctx.translate(4, -100); P.ctx.rotate(-Math.PI / 2); P.text(o.label ?? 'SODA', 0, 12, { font: FONT.caps, weight: 700, size: 34, color: 'cream' }); P.ctx.restore();
  end(P);
}

/** a price tag on a string */
export function priceTag(P, x, y, s, text, rot = 0) {
  const lw = begin(P, x, y, s, rot);
  P.line(svg('M0 0 C-10 30 -20 50 -10 70'), lw * 0.8);
  const tag = svg('M-60 70 L40 70 L70 100 L40 130 L-60 130 Z');
  P.both(tag, 'ivory', lw); P.both(ell(48, 100, 6), 'paper', lw * 0.5);
  P.text(text, -10, 114, { font: FONT.display, size: 40, color: 'red' });
  end(P);
}

/** a throne: gold, high-backed, with a cushion; (x, y) the floor centre */
export function throne(P, x, y, s) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-200 0 L-180 -260 L-210 -620 C-210 -700 -120 -760 0 -770 C120 -760 210 -700 210 -620 L180 -260 L200 0 Z'), 'gold', lw * 1.4);
  P.tone(svg('M-200 0 L-180 -260 L-210 -620 C-210 -700 -120 -760 0 -770 C120 -760 210 -700 210 -620 L180 -260 L200 0 Z'), 'ochre', { from: [0, -700, 0], to: [200, 0, 0.6], bbox: [-210, -770, 210, 0] }, 7);
  P.line(svg('M-150 -300 L-160 -600 C-160 -660 -90 -704 0 -712 C90 -704 160 -660 150 -600 L150 -300 Z'), lw);
  P.both(svg('M-150 -300 L-160 -600 C-160 -660 -90 -704 0 -712 C90 -704 160 -660 150 -600 L150 -300 Z'), 'red', lw);
  P.both(rect(-230, -300, 460, 60, 14), 'gold', lw * 1.2); P.both(rect(-200, -250, 400, 40, 10), 'red', lw);
  for (const sx of [-1, 1]) P.both(ell(sx * 214, -640, 26), 'gold', lw);
  end(P);
}

/**
 * a horse in profile, facing right; (x, y) the ground under its belly; phase drives a walk (0 stands).
 * Built like a horse: a barrel with chest and hindquarters, an arched neck with a mane, a wedge of a head;
 * front legs bend at the knee, hind legs at the backward hock. o.color, o.dark (mane, far legs), o.harness.
 */
export function horse(P, x, y, s, phase = 0, o = {}) {
  const lw = begin(P, x, y, s * 1.2), ctx = P.ctx, col = o.color ?? 'sepiaDk', dk = o.dark ?? 'charDk', walk = o.walk ?? (phase !== 0);
  // a leg tapers: each segment is its own stroke, thinner towards the hoof; outlines first so the joints stay clean
  const limb = (pts, ws, color) => { ctx.lineJoin = 'round'; ctx.lineCap = 'round'; const seg = (i) => svg(`M${pts[i][0]} ${pts[i][1]} L${pts[i + 1][0]} ${pts[i + 1][1]}`); for (let i = 0; i < pts.length - 1; i++) P.line(seg(i), ws[i] + 2 * lw, 'line'); for (let i = 0; i < pts.length - 1; i++) P.line(seg(i), ws[i], color); };
  const pt = (o0, a, l) => [o0[0] + Math.sin(a) * l, o0[1] + Math.cos(a) * l];
  const hoof = (f, color) => P.both(svg(`M${f[0] - 15} ${f[1] - 16} L${f[0] + 13} ${f[1] - 16} L${f[0] + 19} ${f[1] + 2} L${f[0] - 15} ${f[1] + 2} Z`), 'charDk', lw * 0.8);
  // a front leg from the elbow: upper arm, knee, cannon, fetlock, pastern; it folds at the knee as it lifts
  const front = (sh, ph, color) => {
    const sw = walk ? 0.28 * Math.sin(ph) : 0, lift = walk ? Math.max(0, Math.sin(ph + 1.4)) : 0;
    const kn = pt(sh, sw, 108), fe = pt(kn, sw - 0.9 * lift, 84), ho = pt(fe, sw - 0.5 * lift + 0.18, 30);
    limb([sh, kn, fe, ho], [36, 22, 18], color); hoof([ho[0] + 4, ho[1] + 4]);
  };
  // a hind leg from the stifle: gaskin back and down to the hock, cannon down, fetlock, pastern
  const hind = (st, ph, color) => {
    const sw = walk ? 0.25 * Math.sin(ph) : 0, lift = walk ? Math.max(0, Math.sin(ph + 1.4)) : 0;
    const hk = pt(st, sw - 0.42 + 0.2 * lift, 108), fe = pt(hk, sw + 0.08 - 0.6 * lift, 90), ho = pt(fe, sw + 0.25 - 0.3 * lift, 30);
    limb([st, hk, fe, ho], [40, 22, 18], color); hoof([ho[0] + 4, ho[1] + 4]);
  };
  const HY = -20;   // the whole horse sits on its hooves at y = 0
  ctx.translate(0, HY);
  // far legs first, in the darker colour
  front([128, -212], phase + Math.PI, dk); hind([-150, -206], phase, dk);
  // the tail
  const tw = walk ? Math.sin(phase * 0.5) * 10 : 0;
  P.both(svg(`M-206 -302 C-250 -300 -262 -250 ${-258 + tw} -190 C${-256 + tw} -140 ${-246 + tw} -100 ${-232 + tw} -78 C-224 -120 -222 -170 -226 -220 C-228 -250 -222 -280 -200 -290 Z`), dk, lw);
  P.line(svg(`M-236 -270 C${-246 + tw} -220 ${-246 + tw} -160 ${-236 + tw} -110`), lw * 0.5, col);
  // the body, neck and head as one silhouette
  const body = svg('M-210 -300 C-200 -334 -150 -338 -100 -322 C-40 -306 40 -318 110 -336 C160 -360 200 -420 244 -462 C252 -470 262 -472 270 -466 C298 -446 334 -404 368 -366 C382 -352 374 -332 352 -332 C334 -332 316 -342 300 -358 C284 -372 266 -378 250 -370 C226 -338 208 -300 196 -262 C190 -232 170 -206 138 -196 L-128 -192 C-170 -194 -206 -232 -214 -268 Z');
  P.fill(body, col);
  P.tone(body, '#000', { from: [40, -330, 0], to: [10, -190, 0.42], bbox: [-220, -480, 380, -186] }, 6);
  P.line(body, lw * 1.3);
  // the mane along the crest, the forelock, an ear
  P.both(svg('M108 -336 C150 -364 196 -424 242 -466 C248 -452 240 -436 228 -424 C214 -404 196 -380 172 -352 C154 -334 132 -324 112 -320 Z'), dk, lw);
  P.both(svg('M262 -470 L262 -500 L280 -470 Z'), col, lw);
  P.both(svg('M266 -462 C280 -456 286 -444 282 -432 C276 -440 270 -448 262 -452 Z'), dk, lw * 0.7);
  // eye, nostril, mouth; muscle lines at shoulder, belly and hip
  P.fill(ell(300, -420, 6.5, 7.5), 'line'); P.line(svg('M292 -432 C298 -436 306 -436 310 -430'), lw * 0.5);
  P.line(svg('M356 -356 C360 -350 360 -344 356 -340'), lw * 0.7); P.line(svg('M346 -336 C340 -340 334 -342 326 -342'), lw * 0.6);
  P.line(svg('M150 -300 C140 -268 136 -240 140 -214 M-120 -300 C-104 -270 -100 -240 -110 -206 M30 -200 C20 -210 -20 -212 -40 -204'), lw * 0.5);
  if (o.harness) {
    P.both(svg('M176 -364 C196 -330 206 -290 200 -256 L176 -258 C182 -290 176 -326 158 -352 Z'), 'charDk', lw);   // the collar
    P.line(svg('M110 -330 C60 -322 -20 -316 -80 -322 M300 -428 L352 -370 M276 -446 L330 -398'), lw * 2.4, 'red');
    P.line(svg('M190 -290 C120 -270 40 -262 -40 -262'), lw * 2.2, 'red');
  }
  // near legs over the body
  front([150, -206], phase, col); hind([-138, -200], phase + Math.PI, col);
  end(P);
}

/** an Amish buggy: a grey box on two tall spoked wheels; (x, y) the ground under its axle */
export function buggy(P, x, y, s, t = 0) {
  const lw = begin(P, x, y, s);
  P.both(svg('M-200 -360 C-200 -420 200 -420 200 -360 L200 -120 L-200 -120 Z'), 'char', lw * 1.3);
  P.tone(svg('M-200 -360 C-200 -420 200 -420 200 -360 L200 -120 L-200 -120 Z'), '#000', { from: [0, -400, 0], to: [200, -120, 0.4], bbox: [-200, -420, 200, -120] }, 6);
  P.both(rect(-160, -330, 120, 120, 8), 'black', lw); P.both(svg('M-200 -150 L-240 -110 L240 -110 L200 -150 Z'), 'charDk', lw);
  P.both(svg('M120 -90 L120 -60'), 'line', lw);
  P.both(rect(130, -330, 50, 40, 6), 'red', lw * 0.6); P.both(svg('M150 -300 L160 -318 L170 -300 Z'), 'gold', lw * 0.5);
  for (const wx of [-110, 110]) { P.both(ell(wx, -50, 70), 'ivory', lw); P.line(ell(wx, -50, 60), lw * 0.5); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI + t * 2; P.line(svg(`M${wx + Math.cos(a) * 60} ${-50 + Math.sin(a) * 60} L${wx - Math.cos(a) * 60} ${-50 - Math.sin(a) * 60}`), lw * 0.6); } P.both(ell(wx, -50, 10), 'char', lw * 0.6); }
  P.line(svg('M200 -150 L420 -170'), lw * 2);
  end(P);
}

/** a scroll of code pouring out, its lines as bars of colour (no real code) */
export function codeScroll(P, x, y, w, h, t, o = {}) {
  const lw = begin(P, x, y, 1), r = rng(o.seed ?? 3);
  const sheet = svg(`M${-w / 2} 0 L${w / 2} 0 L${w / 2} ${h} L${-w / 2} ${h} Z`);
  P.fill(sheet, 'ivory'); P.line(sheet, lw);
  P.ctx.save(); P.clip(sheet);
  const off = (t * (o.speed ?? 60)) % 30;
  for (let i = -1; i < h / 30 + 1; i++) { const ind = Math.floor(r() * 4) * 20, len = 40 + r() * (w - 120 - ind); P.line(svg(`M${-w / 2 + 24 + ind} ${i * 30 + off + 18} l${len} 0`), 6, ['teal', 'rose', 'gold', 'sageDk'][i & 3]); }
  P.restore();
  P.both(rect(-w / 2 - 14, -12, w + 28, 24, 12), 'sepia', lw);
  end(P);
}

/**
 * a finger along a quadratic curve from its base b through c to its tip e, tapering w0 -> w1, with a round
 * tip; returns { p, L, R, tipDir } (L and R its edges, for the lines between fingers)
 */
export function curvedFinger(b, c, e, w0, w1) {
  const N = 14, Lp = [], Rp = [];
  let tx = 0, ty = 0;
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    const px = u * u * b[0] + 2 * u * t * c[0] + t * t * e[0], py = u * u * b[1] + 2 * u * t * c[1] + t * t * e[1];
    tx = 2 * u * (c[0] - b[0]) + 2 * t * (e[0] - c[0]); ty = 2 * u * (c[1] - b[1]) + 2 * t * (e[1] - c[1]);
    const l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l, w = (w0 + (w1 - w0) * t) / 2;
    Lp.push([px + nx * w, py + ny * w]); Rp.push([px - nx * w, py - ny * w]);
  }
  const p = new Path2D(); p.moveTo(...Lp[0]); for (const q of Lp.slice(1)) p.lineTo(...q);
  const a = Math.atan2(Lp[N][1] - e[1], Lp[N][0] - e[0]); p.arc(e[0], e[1], w1 / 2, a, a - Math.PI, true);
  for (const q of Rp.slice().reverse()) p.lineTo(...q);
  p.closePath();
  const l = Math.hypot(tx, ty) || 1;
  return { p, L: Lp, R: Rp, tipDir: [tx / l, ty / l], e };
}

/**
 * A hand drawn as one silhouette (outlines under the fill), with fingers, nails and knuckle creases.
 * fingers: [{b, c, e, w0, w1}] from the little finger to the index (and the thumb last), dorsum: path d.
 */
export function drawHand(P, x, y, s, rot, dorsum, fingers, o = {}) {
  const lw = begin(P, x, y, s, rot);
  const shapes = [svg(dorsum), ...fingers.map((F) => curvedFinger(F.b, F.c, F.e, F.w0, F.w1))];
  const paths = [shapes[0], ...shapes.slice(1).map((F) => F.p)];
  for (const q of paths) P.line(q, lw * 2.4);
  for (const q of paths) P.fill(q, o.skin ?? 'skin');
  const all = new Path2D(); for (const q of paths) all.addPath(q);
  if (o.tone) P.tone(all, 'skinDot', o.tone, Math.max(2.5, 4 * s) / s);
  shapes.slice(1).forEach((F, i) => {
    if (i < fingers.length - 1 && !fingers[i].thumb) { const q = new Path2D(); F.R.slice(4).forEach((pt, k) => (k ? q.lineTo(...pt) : q.moveTo(...pt))); P.line(q, lw * 0.55); }
    const d = F.tipDir, nb = [F.e[0] - d[0] * 12, F.e[1] - d[1] * 12], w = fingers[i].w1;
    if (o.nails !== false) { const nl = new Path2D(); nl.ellipse(nb[0], nb[1], w * 0.36, w * 0.3, Math.atan2(d[1], d[0]), 0, Math.PI * 2); P.fill(nl, '#f7e0d0'); P.line(nl, lw * 0.4); }
    const mid = F.L.length >> 1, ml = F.L[mid], mr = F.R[mid];
    P.line(svg(`M${ml[0] * 0.8 + mr[0] * 0.2} ${ml[1] * 0.8 + mr[1] * 0.2} L${ml[0] * 0.2 + mr[0] * 0.8} ${ml[1] * 0.2 + mr[1] * 0.8}`), lw * 0.4);
  });
  if (o.knuckles) for (const [kx, ky] of o.knuckles) P.line(svg(`M${kx - 9} ${ky} q9 -7 18 0`), lw * 0.5);
  end(P);
}

/** a flame: a teardrop with a wavering tip and a bright core; (x, y) its base centre */
export function flame(P, x, y, h, w, t, seed = 0, colors = ['red', 'gold']) {
  const sw = Math.sin(t * 7 + seed * 1.7) * w * 0.22, sw2 = Math.sin(t * 9.3 + seed) * w * 0.12, hh = h * (0.9 + 0.12 * Math.sin(t * 8 + seed * 2.3));
  const outer = svg(`M${x - w / 2} ${y} C${x - w * 0.62} ${y - hh * 0.35} ${x - w * 0.18} ${y - hh * 0.62} ${x + sw} ${y - hh} C${x + w * 0.3 + sw2} ${y - hh * 0.6} ${x + w * 0.62} ${y - hh * 0.36} ${x + w / 2} ${y} Z`);
  P.both(outer, colors[0], 3);
  const ih = hh * 0.62, iw = w * 0.5;
  P.fill(svg(`M${x - iw / 2} ${y} C${x - iw * 0.6} ${y - ih * 0.35} ${x - iw * 0.1} ${y - ih * 0.6} ${x + sw * 0.6} ${y - ih} C${x + iw * 0.3} ${y - ih * 0.6} ${x + iw * 0.6} ${y - ih * 0.35} ${x + iw / 2} ${y} Z`), colors[1]);
}

/** a hard-disk platter worn as a halo, as St IGNUcius wears his: polished, finely tracked, a clamp at the hub, a gilt edge */
export function platter(P, x, y, r) {
  const ctx = P.ctx, d = ell(x, y, r), bb = [x - r, y - r, x + r, y + r];
  P.fill(d, 'silver'); P.tone(d, '#8c877e', { from: [x - r * 0.7, y - r * 0.7, 0.4], to: [x + r * 0.7, y + r * 0.7, 0], bbox: bb }, 7);
  ctx.save(); P.clip(d);
  for (const a of [-2.55, 0.59]) { const p = new Path2D(); p.moveTo(x, y); p.arc(x, y, r, a, a + 0.46); p.closePath(); P.alpha(0.75); P.fill(p, 'cream'); }   // the light it catches
  P.alpha(1);
  for (let k = 0.36; k < 0.96; k += 0.045) P.line(ell(x, y, r * k), Math.max(0.8, r / 280), '#a29d94');                                   // the tracks
  ctx.restore();
  P.both(ell(x, y, r * 0.3), 'silver', Math.max(1.5, r / 110)); P.line(ell(x, y, r * 0.2), Math.max(1, r / 200)); P.fill(ell(x, y, r * 0.07), 'line');
  P.line(d, r * 0.05 + 4); P.line(d, r * 0.05, 'gold'); P.line(ell(x, y, r * 0.975), Math.max(1, r / 260), 'goldLt');
}


/**
 * A cardboard moving box, open, seen a little from above and to the right: front and side faces, the dark opening, four
 * flaps folded out (the front one tipped forward, the back one standing behind), the cut edges showing the board's
 * thickness, a hand hole, torn packing tape, a marker scrawl. (x, y) the middle of its foot. o.inside(P) draws what is in
 * it (in the box's units: the opening's front edge at y = -170, its back edge at y = -200, shifted 50 right), between the
 * inside and the front; o.over(P) what hangs over its front; o.label the scrawl.
 */
export function cardboardBox(P, x, y, s, o = {}) {
  const lw = begin(P, x, y, s), W = 160, H = 170, DX = 50, DY = -30;
  const FL = [-W, -H], FR = [W, -H], BL = [-W + DX, -H + DY], BR = [W + DX, -H + DY];
  const quad = (a, b, c, d) => svg(`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} L${d[0]} ${d[1]} Z`);
  const cut = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * 4, ny = dx / l * 4; P.line(svg(`M${a[0] + nx} ${a[1] + ny} L${b[0] + nx} ${b[1] + ny}`), lw * 0.45); };   // the board's thickness along a cut edge
  const flap = (a, b, c, d, color, toneTo) => { const f = quad(a, b, c, d); P.fill(f, color); P.tone(f, 'kraftDk', { from: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0], to: toneTo, bbox: [Math.min(a[0], b[0], c[0], d[0]), Math.min(a[1], b[1], c[1], d[1]), Math.max(a[0], b[0], c[0], d[0]), Math.max(a[1], b[1], c[1], d[1])] }, 5); P.line(f, lw); cut(c, d); };
  // the back flap standing behind, the left flap folded out
  const bk = [[BR[0] - 16, BR[1] - 70], [BL[0] - 16, BL[1] - 70]];
  flap(BL, BR, bk[0], bk[1], 'kraftLt', [BR[0], BR[1] - 70, 0.3]);
  const lf = [[BL[0] - 78, BL[1] - 36], [FL[0] - 78, FL[1] - 30]];
  flap(FL, BL, lf[0], lf[1], 'kraftLt', [FL[0] - 78, FL[1], 0.35]);
  // the opening: the inside of the back and left walls in shadow
  const op = quad(FL, FR, BR, BL);
  P.fill(op, 'kraftIn'); P.tone(op, '#000', { from: [0, BL[1], 0.15], to: [0, FL[1], 0.55], bbox: [FL[0], BL[1], BR[0], FL[1]] }, 5);
  P.line(svg(`M${BL[0]} ${BL[1]} L${BL[0]} ${BL[1] + 34}`), lw * 0.5);   // the inside corner
  if (o.inside) { P.ctx.save(); o.inside(P); P.ctx.restore(); }
  // the front face and the side face
  const fr = quad([-W, 0], [W, 0], FR, FL), sd = quad([W, 0], [W + DX, DY], BR, FR);
  P.fill(fr, 'kraft'); P.tone(fr, 'kraftDk', { from: [0, -H, 0], to: [W, 0, 0.45], bbox: [-W, -H, W, 0] }, 6); P.line(fr, lw * 1.2);
  P.fill(sd, 'kraftDk'); P.tone(sd, '#000', { from: [W, -H, 0.15], to: [W + DX, 0, 0.45], bbox: [W, -H + DY, W + DX, 0] }, 6); P.line(sd, lw * 1.2);
  { const c = P.ctx; c.save(); c.transform(1, DY / DX, 0, 1, W + DX / 2, -H * 0.66 + DY / 2); P.both(rect(-15, -9, 30, 18, 9), 'kraftIn', lw * 0.8);   // the hand hole
    for (const ax of [-9, 9]) P.line(svg(`M${ax} 66 L${ax} 40 M${ax - 6} 48 L${ax} 40 L${ax + 6} 48`), lw * 0.7, 'charDk');   // THIS SIDE UP
    P.line(svg('M-14 74 L14 74'), lw * 0.7, 'charDk'); c.restore(); }
  // the front flap tipped forward, the right flap folded out
  const ff = [[W + 12, -H + 46], [-W - 12, -H + 46]];
  flap(FL, FR, ff[0], ff[1], 'kraftLt', [0, -H + 46, 0.4]);
  const rf = [[BR[0] + 70, BR[1] - 30], [FR[0] + 70, FR[1] - 24]];
  flap(FR, BR, rf[0], rf[1], 'kraftLt', [FR[0] + 70, FR[1], 0.3]);
  // the packing tape, torn when it was opened, hanging from the front flap
  const tp = svg('M6 -128 L44 -128 L44 -96 L40 -90 L35 -97 L29 -88 L24 -96 L18 -89 L12 -97 L6 -91 Z');
  P.ctx.save(); P.alpha(0.85); P.fill(tp, 'goldLt'); P.restore(); P.line(tp, lw * 0.6); P.line(svg('M10 -122 L40 -122'), lw * 0.4, 'cream');
  if (o.label) { P.ctx.save(); P.ctx.translate(70, -46); P.ctx.rotate(-0.07); P.text(o.label, 0, 0, { font: FONT.comic, weight: 700, size: 40, color: 'charDk' }); P.line(svg('M-74 10 C-30 14 30 12 76 6'), lw * 0.7, 'charDk'); P.ctx.restore(); }
  if (o.over) { P.ctx.save(); o.over(P); P.ctx.restore(); }
  end(P);
}

/** a ceramic mug, (x, y) the middle of its foot: a glazed body with a highlight, a thick handle, the rim's ellipse; o.text
 *  [big, small] printed on it, o.pens colours of pens standing in it */
export function mug(P, x, y, s, o = {}) {
  const lw = begin(P, x, y, s), R = 34, H = 86, ry = 9, body = o.color ?? 'ivory';
  // the handle, behind the body where it joins
  const hd = svg(`M${R - 6} ${-H + 18} C${R + 34} ${-H + 12} ${R + 36} ${-24} ${R - 4} -22`);
  P.line(hd, 22); P.line(hd, 22 - 2 * lw, body); P.line(svg(`M${R + 10} ${-H + 30} C${R + 18} ${-H + 40} ${R + 16} -42 ${R + 8} -34`), lw * 0.5);
  // the body, a little narrower at the foot, its bottom rounded
  const b = svg(`M${-R} ${-H} L${-R + 3} -12 Q${-R + 4} 0 ${-R + 16} 0 L${R - 16} 0 Q${R - 4} 0 ${R - 3} -12 L${R} ${-H} Z`);
  P.fill(b, body); P.tone(b, 'sepiaDk', { from: [R * 0.15, 0, 0], to: [R, 0, 0.5], bbox: [-R, -H - ry, R, 0] }, 4);
  P.line(svg(`M${-R * 0.58} ${-H + 10} L${-R * 0.5} -12`), lw * 1.6, 'cream');   // the glaze catching the light
  P.line(b, lw);
  // the rim: the dark inside, pens standing in it, the front lip over them
  P.fill(ell(0, -H, R - 3, ry - 2), 'charDk');
  (o.pens ?? []).forEach((c, i) => { const a = -0.28 + i * 0.3, px = -10 + i * 12; P.ctx.save(); P.ctx.translate(px, -H + 2); P.ctx.rotate(a); P.both(rect(-4.5, -62, 9, 62, 3), c, lw * 0.7); P.both(rect(-5, -70, 10, 14, 4), c === 'cream' ? 'red' : 'charDk', lw * 0.6); P.line(svg('M3 -66 L3 -42'), lw * 0.6, 'silver'); P.ctx.restore(); });
  const lip = new Path2D(); lip.ellipse(0, -H, R, ry, 0, 0, Math.PI); lip.ellipse(0, -H, R - 4, ry - 3, 0, Math.PI, 0, true); lip.closePath();
  P.fill(lip, body); P.line(ell(0, -H, R, ry), lw); P.line(svg(`M${-R + 4} ${-H} A${R - 4} ${ry - 3} 0 0 0 ${R - 4} ${-H}`), lw * 0.5);
  if (o.text) { P.text(o.text[0], -2, -H * 0.52, { font: FONT.caps, weight: 700, size: 26, color: 'red' }); if (o.text[1]) P.text(o.text[1], -2, -H * 0.52 + 22, { font: FONT.caps, weight: 700, size: 17, color: 'charDk' }); }
  end(P);
}

/** a snake plant in a terracotta pot, (x, y) the middle of the pot's foot: sword leaves banded darker, with light margins */
export function snakePlant(P, x, y, s, t = 0) {
  const lw = begin(P, x, y, s), r = rng(13);
  const leaves = [[-34, 190, -0.34], [-14, 278, -0.12], [6, 236, 0.02], [22, 300, 0.12], [40, 210, 0.3], [-28, 150, -0.6]];
  for (const [bx, len, a0] of leaves) {
    const a = a0 + Math.sin(t * 1.3 + bx) * 0.012, by = -96, tx = bx + Math.sin(a) * len, ty = by - Math.cos(a) * len, w = 15 + len * 0.03, nx = Math.cos(a), ny = Math.sin(a), bend = 0.1 * len * Math.sign(a0 || 0.1);
    const lf = svg(`M${bx - nx * w} ${by - ny * w} C${bx - nx * w + Math.sin(a) * len * 0.5 + bend} ${by - ny * w - Math.cos(a) * len * 0.5} ${tx - nx * 6} ${ty + 30} ${tx} ${ty} C${tx + nx * 6} ${ty + 30} ${bx + nx * w + Math.sin(a) * len * 0.5 + bend} ${by + ny * w - Math.cos(a) * len * 0.5} ${bx + nx * w} ${by + ny * w} Z`);
    P.fill(lf, 'leaf');
    P.ctx.save(); P.clip(lf);
    for (let k = 0; k < 7; k++) { const u = 0.12 + k * 0.12 + r() * 0.04, cx = bx + Math.sin(a) * len * u, cy = by - Math.cos(a) * len * u, hw = w * (1 - u * 0.8); P.line(svg(`M${cx - nx * hw} ${cy - ny * hw + 4} C${cx - nx * hw * 0.3} ${cy - ny * hw * 0.3 - 5} ${cx + nx * hw * 0.3} ${cy + ny * hw * 0.3 + 5} ${cx + nx * hw} ${cy + ny * hw - 4}`), lw * 1.1, 'leafDk'); }
    P.tone(lf, 'leafDk', { from: [bx, by, 0], to: [bx + nx * w * 2, by, 0.5], bbox: [bx - w * 2, ty - 10, bx + w * 2 + Math.abs(Math.sin(a)) * len, by] }, 4);
    P.line(lf, lw * 3.4, 'goldLt');   // the yellow margin, inside the edge
    P.ctx.restore();
    P.line(lf, lw);
  }
  // the pot: rim band, tapered body, soil
  const pot = svg('M-50 -86 L50 -86 L40 0 L-40 0 Z');
  P.fill(pot, 'terracotta'); P.tone(pot, 'redDk', { from: [6, -86, 0], to: [50, 0, 0.5], bbox: [-50, -86, 50, 0] }, 5); P.line(pot, lw);
  const rim = rect(-58, -108, 116, 26, 6); P.fill(rim, 'terracotta'); P.tone(rim, 'redDk', { from: [10, -108, 0], to: [58, -82, 0.45], bbox: [-58, -108, 58, -82] }, 5); P.line(rim, lw);
  P.line(svg('M-46 -96 L-30 -96'), lw * 1.2, '#dd9a78');
  end(P);
}
