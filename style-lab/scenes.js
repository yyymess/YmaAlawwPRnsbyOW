// Three test shots from the Amish Paradise shot list, as resolution-independent vector scenes.
// A scene draws with *roles* (bg, skin, hood, glow, ...) through a painter `p`; each style decides
// what a role looks like. Coordinates are in a 1600x900 frame.
export const W = 1600, H = 900;

const ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const rect = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const poly = (pts) => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; };
const svg = (d) => new Path2D(d);

// ---- shot 1: the hero close-up (Amish 0:12 / 2:42): a dark room, a face lit by one source ---------
function closeup(p) {
  p.fill(rect(0, 0, W, H), 'bg');
  p.light(240, 900, 900, 'glow', 0.6);                                  // monitor light spilling up
  // shoulders + hood (hood up, like the brim of the hat)
  p.fill(svg('M380 900 C420 700 560 610 800 600 C1040 610 1180 700 1220 900 Z'), 'hood');
  p.fill(svg('M560 640 C520 420 600 200 800 180 C1000 200 1080 420 1040 640 C980 700 620 700 560 640 Z'), 'hood');
  p.fill(svg('M600 620 C580 440 640 260 800 250 C960 260 1020 440 1000 620 Z'), 'hoodIn');
  // face: lit half / shadow half
  p.fill(ell(800, 450, 165, 205), 'skinDark');
  p.fill(svg('M800 245 C700 250 635 340 635 450 C635 560 700 650 800 655 C760 560 750 340 800 245 Z'), 'skin');
  // beard
  p.fill(svg('M650 470 C660 610 720 690 800 700 C880 690 940 610 950 470 C900 540 860 560 800 560 C740 560 700 540 650 470 Z'), 'beard');
  p.fill(svg('M740 590 C770 610 830 610 860 590 C840 625 760 625 740 590 Z'), 'mouth');
  // glasses with the screen reflected in them
  p.stroke(ell(730, 420, 62, 54), 'rim', 10);
  p.stroke(ell(880, 420, 62, 54), 'rim', 10);
  p.stroke(svg('M792 418 L818 418'), 'rim', 8);
  p.fill(poly([[690, 400], [760, 392], [752, 432], [686, 440]]), 'screen', 0.9);
  p.fill(poly([[842, 398], [912, 390], [906, 430], [838, 438]]), 'screen', 0.9);
  // the monitor itself, bottom-left foreground
  p.fill(poly([[0, 760], [330, 700], [360, 900], [0, 900]]), 'ink');
  p.stroke(svg('M0 760 L330 700 L360 900'), 'screen', 6);
  p.text('As I walk through the Valley where the robo-taxis roam,', 96, 840, 'lyric');
}

// ---- shot 2: the candle choir (Amish 3:09): rows of men, each holding a blinking cursor ---------
function choir(p) {
  p.fill(rect(0, 0, W, H), 'bg');
  const rows = [{ y: 330, s: 0.62, n: 9 }, { y: 520, s: 0.8, n: 7 }, { y: 740, s: 1.0, n: 6 }];
  for (const r of rows) {
    const gap = W / r.n;
    for (let i = 0; i < r.n; i++) {
      const x = gap * (i + 0.5) + (r.n % 2 ? 0 : gap * 0.25) * ((i % 2) ? 1 : -1) * 0.3;
      const s = r.s;
      p.fill(ell(x, r.y + 120 * s, 120 * s, 120 * s), 'hood');               // shoulders
      p.fill(ell(x, r.y - 20 * s, 70 * s, 82 * s), 'hood');                   // hood
      p.fill(ell(x, r.y - 6 * s, 50 * s, 62 * s), 'skinDark');               // face
      p.fill(ell(x, r.y + 18 * s, 46 * s, 40 * s), 'skin');                  // lit from below
      p.fill(ell(x, r.y + 30 * s, 16 * s, 12 * s), 'mouth');                 // singing "ooh"
      p.light(x, r.y + 90 * s, 130 * s, 'glow', 0.5);
      p.fill(rect(x - 8 * s, r.y + 70 * s, 16 * s, 34 * s), 'screen');       // the cursor-candle
      p.fill(rect(x - 14 * s, r.y + 104 * s, 28 * s, 60 * s), 'paper');      // its holder
    }
  }
  p.text('in the engineer’s paradise', W / 2, 860, 'lyricCenter');
}

// ---- shot 3: the opening (Amish 0:00): a buggy on a country lane -> a robo-taxi on a campus lane ----
function opening(p) {
  p.fill(rect(0, 0, W, H), 'sky');
  p.light(1180, 300, 520, 'sun', 0.6); p.fill(ell(1180, 300, 120, 120), 'sun');
  p.fill(svg('M0 470 C300 400 520 430 800 420 C1100 410 1300 380 1600 430 L1600 900 L0 900 Z'), 'hill');
  p.fill(svg('M0 520 C400 480 900 500 1600 490 L1600 900 L0 900 Z'), 'grass');
  // glass campus building on the left, ridiculous slide included
  p.fill(rect(80, 300, 420, 230), 'building');
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) p.fill(rect(100 + i * 66, 320 + j * 66, 52, 50), 'window');
  p.stroke(svg('M480 330 C600 360 600 480 700 520'), 'accent', 14);
  // the lane
  p.fill(svg('M640 900 C700 700 780 560 820 500 L860 500 C880 560 1000 700 1160 900 Z'), 'road');
  // white fences along it
  for (const side of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, y = 505 + 395 * t * t, x = 840 + side * (40 + 420 * t * t);
      pts.push([x, y, 10 + 60 * t * t]);
    }
    for (const [x, y, h] of pts) p.fill(rect(x - h * 0.08, y - h, h * 0.16, h), 'fence');
    for (const f of [0.35, 0.75]) p.stroke(svg('M' + pts.map(([x, y, h]) => `${x} ${y - h * f}`).join(' L')), 'fence', 6);
  }
  // trees
  for (const [x, y, s] of [[300, 600, 1], [1350, 560, 0.8], [1500, 640, 1.1], [180, 700, 1.2]]) {
    p.fill(rect(x - 10 * s, y, 20 * s, 120 * s), 'trunk');
    p.fill(ell(x, y - 30 * s, 90 * s, 110 * s), 'tree');
  }
  // the robo-taxi, with its spinning sensor where the horse would be
  p.fill(svg('M700 780 C705 735 735 700 790 690 L900 690 C960 700 990 735 995 780 L995 815 L700 815 Z'), 'car');
  p.fill(svg('M745 735 C760 710 780 702 800 700 L895 700 C920 704 940 718 950 735 Z'), 'window');
  p.fill(rect(820, 662, 56, 28), 'ink');
  p.fill(ell(848, 660, 34, 14), 'accent');
  p.fill(ell(750, 818, 34, 34), 'ink'); p.fill(ell(945, 818, 34, 34), 'ink');
  p.text('ENGINEER’S PARADISE', 96, 140, 'title');
}

export const SCENES = { closeup, choir, opening };
