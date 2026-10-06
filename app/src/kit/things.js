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
  (o.lines ?? []).forEach((l, i) => { const ly = (o.top ?? h * 0.36) + i * (o.lineH ?? 54); P.text(l, 0, ly + 2, { font: FONT.caps, weight: 700, size: o.size ?? 40, color: '#f6ecd6' }); P.text(l, 0, ly, { font: FONT.caps, weight: 700, size: o.size ?? 40, color: 'charDk' }); });
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
  for (const sx of [-1, 1]) {
    const h = svg(`M0 0 C${sx * 40} -10 ${sx * 56} -80 ${sx * 40} -150 C${sx * 30} -200 ${sx * 10} -230 0 -236 Z`);
    P.fill(h, 'skin'); P.tone(h, 'skinDot', { from: [0, -200, 0], to: [sx * 56, 0, 0.45], bbox: [-60, -240, 60, 10] }, 4); P.line(h, lw * 1.1);
    P.line(svg(`M${sx * 40} -150 C${sx * 30} -160 ${sx * 20} -168 ${sx * 6} -170`), lw * 0.5);
  }
  for (const sx of [-1, 1]) P.both(rect(sx * 46 - 34, 0, 68, 50, 10), 'tealLt', lw);
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
