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

/** a horse in profile, facing right, walking; (x, y) the ground under its belly; phase the gait */
export function horse(P, x, y, s, phase = 0, o = {}) {
  const lw = begin(P, x, y, s), col = o.color ?? 'sepiaDk', dk = o.dark ?? 'charDk';
  const leg = (hx, hy, ph, front, near) => {
    const a = 0.32 * Math.sin(ph), k = front ? Math.max(0, Math.sin(ph + 1.2)) * 0.9 : Math.max(0, -Math.sin(ph + 0.4)) * 0.8;
    const kx = hx + Math.sin(a) * 120, ky = hy + Math.cos(a) * 120, b = front ? a - k : a + k, fx = kx + Math.sin(b) * 112, fy = ky + Math.cos(b) * 112;
    const p = new Path2D(); p.moveTo(hx, hy); p.lineTo(kx, ky); p.lineTo(fx, fy - 10);
    P.ctx.lineJoin = 'round'; P.ctx.lineCap = 'round'; P.line(p, 38 + 2 * lw, 'line'); P.line(p, 38, near ? col : dk);
    P.both(svg(`M${fx - 22} ${fy - 14} L${fx + 22} ${fy - 14} L${fx + 26} ${fy + 6} L${fx - 24} ${fy + 6} Z`), 'charDk', lw * 0.8);
  };
  const hy = -240;
  leg(150, hy + 20, phase + Math.PI, true, false); leg(-150, hy + 20, phase, false, false);
  // tail
  P.both(svg(`M-210 ${hy - 70} C${-290 + Math.sin(phase) * 8} ${hy - 40} -300 ${hy + 60} ${-270 + Math.sin(phase * 0.5) * 10} ${hy + 140} C-250 ${hy + 60} -240 ${hy} -200 ${hy - 40} Z`), dk, lw);
  // body, neck and head
  const body = svg(`M-220 ${hy - 60} C-230 ${hy - 120} -150 ${hy - 140} -40 ${hy - 130} C60 ${hy - 124} 140 ${hy - 150} 190 ${hy - 190} C210 ${hy - 260} 250 ${hy - 330} 300 ${hy - 350} C330 ${hy - 362} 360 ${hy - 350} 380 ${hy - 320} L440 ${hy - 250} C456 ${hy - 228} 440 ${hy - 206} 414 ${hy - 210} L340 ${hy - 250} C300 ${hy - 230} 270 ${hy - 180} 240 ${hy - 110} C220 ${hy - 40} 190 ${hy + 30} 130 ${hy + 40} C40 ${hy + 54} -100 ${hy + 50} -170 ${hy + 30} C-210 ${hy + 16} -226 ${hy - 20} -220 ${hy - 60} Z`);
  P.fill(body, col); P.tone(body, '#000', { from: [40, hy - 140, 0], to: [0, hy + 50, 0.45], bbox: [-230, hy - 360, 460, hy + 60] }, 6); P.line(body, lw * 1.3);
  P.both(svg(`M300 ${hy - 350} L304 ${hy - 392} L326 ${hy - 356} Z`), col, lw);                 // ear
  P.fill(ell(374, hy - 304, 7, 8), 'line');                                                     // eye
  P.both(svg(`M200 ${hy - 200} C220 ${hy - 280} 250 ${hy - 340} 300 ${hy - 352} C280 ${hy - 300} 260 ${hy - 240} 236 ${hy - 160} C230 ${hy - 190} 214 ${hy - 196} 200 ${hy - 200} Z`), dk, lw);   // mane
  P.line(svg(`M420 ${hy - 226} C426 ${hy - 222} 430 ${hy - 218} 434 ${hy - 214}`), lw * 0.8);
  if (o.harness) { P.line(svg(`M330 ${hy - 330} L420 ${hy - 250} M250 ${hy - 140} C200 ${hy - 120} 120 ${hy - 110} -60 ${hy - 110}`), lw * 2.2, 'red'); P.both(svg(`M180 ${hy - 190} C200 ${hy - 130} 210 ${hy - 70} 200 ${hy - 20}`), 'black', lw * 3); }
  leg(130, hy + 30, phase, true, true); leg(-170, hy + 20, phase + Math.PI, false, true);
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
