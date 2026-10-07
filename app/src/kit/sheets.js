// Review sheets for characters and props (app/kit.html?sheet=...).
import { heroFront, heroSide, heroBack, heroWalk, phone } from './hero.js';
import { robotaxi, agent } from './props.js';
import { rect, svg } from '../paint.js';

export function hero(P) {
  // turnaround: front, side, back, front with the phone; then the walk cycle
  heroFront(P, 230, 200, 0.36, {});
  heroSide(P, 610, 200, 0.36, {});
  heroBack(P, 990, 200, 0.36, {});
  heroFront(P, 1370, 200, 0.36, { hold: 'phone', uplit: 0.6, look: [0, 0.6], mouth: 'smile' });
  for (let i = 0; i < 8; i++) heroWalk(P, 110 + i * 190, 880, 0.4, (i / 8) * Math.PI * 2);
}

import { tree, cypress, campus, megacampus, agentAngel } from './props.js';
export function props(P) {
  robotaxi(P, 300, 330, 0.75, 0.3);
  campus(P, 860, 330, 0.85);
  tree(P, 1280, 330, 0.85, 1); tree(P, 1480, 330, 0.7, 4); cypress(P, 1560, 330, 0.7);
  agentAngel(P, 300, 640, 1, 0.5);
  P.vine([[600, 840], [560, 760], [700, 700], [640, 560]], 5);
  P.vine([[760, 840], [800, 760], [700, 690], [780, 560]], 5);
  heroFront(P, 1150, 600, 0.42, { hold: 'phone', uplit: 0.6, look: [0, 0.6] });
}

// the campus at dawn and what it grew into by dusk (its glass lit below)
export function campuses(P) {
  campus(P, 330, 420, 0.9);
  megacampus(P, 700, 380, 0.5, { n: 7 });
  megacampus(P, 700, 760, 0.5, { n: 7, glow: 1 });
}

// close-ups for checking the side view and the grip
export function closeup(P) {
  heroSide(P, 330, 330, 0.8, {});
  heroFront(P, 1130, 330, 0.8, { hold: 'phone', uplit: 0.6, look: [0, 0.6], mouth: 'smile' });
}

import { person } from './people.js';
import { platter } from './things.js';
// the supporting cast
export function cast(P) {
  person(P, 200, 230, 0.34, { hair: 'slick', top: 'vest', color: 'char', mouth: 'smirk', acc: ['lanyard'] });
  platter(P, 520, 200, 165);
  person(P, 520, 230, 0.34, { hair: 'unix', hairColor: 'hairSp', beard: 'unix', top: 'robe', color: 'navy', mantle: 'red', stern: true, glasses: 'rect', fw: 1.06 });
  person(P, 840, 230, 0.34, { hair: 'messy', top: 'hoodie', color: 'plum', mouth: 'smile', glasses: 'rect', fw: 0.94, hairColor: 'hairBr' });
  person(P, 1160, 230, 0.34, { hair: 'side', top: 'tee', color: 'navy', print: 'I ♥|ENGINEERS', acc: ['camera', 'sunhat'], hairColor: 'hairBl', flush: 1 });
  person(P, 1460, 230, 0.34, { hair: 'wavy', top: 'gown', color: 'black', acc: ['mortar'], skin: 'skin2', hairColor: 'hairAu', fem: true, mouth: 'smile' });
  person(P, 200, 640, 0.34, { hair: 'bob', top: 'shirt', color: 'shirt', glasses: 'round', acc: ['halo'], skin: 'skin4', fem: true, mouth: 'smile' });
  person(P, 520, 640, 0.34, { hair: 'buzz', top: 'turtleneck', color: 'black', mouth: 'neutral', skin: 'skin5' });
  person(P, 840, 640, 0.34, { hair: 'ponytail', top: 'hoodie', color: 'navy', arms: 'phone', uplit: 0.6, look: [0, 0.6], fem: true, hairColor: 'hairBr' });
  person(P, 1160, 640, 0.34, { hair: 'bun', top: 'hawaiian', color: 'rose', skin: 'skin2', acc: ['camera'], mouth: 'o', seed: 3, fem: true, hairColor: 'hairAu' });
  person(P, 1460, 640, 0.34, { hair: 'side', top: 'tee', color: 'ochre', acc: ['headphones', 'lanyard'], lanyardColor: 'teal', mouth: 'grin', skin: 'skin3' });
}

// faces: the reviewer close, and a grid of heads in every hair style, hair colour and skin
export function faces(P) {
  platter(P, 330, 300, 300);
  person(P, 330, 340, 0.62, { hair: 'unix', hairColor: 'hairSp', beard: 'unix', top: 'robe', color: 'navy', mantle: 'red', stern: true, glasses: 'rect', fw: 1.06, crop: 900, still: true });
  const heads = [
    { hair: 'bob', skin: 'skin4', fem: true, mouth: 'smile' }, { hair: 'ponytail', hairColor: 'hairBr', fem: true, glasses: 'round' },
    { hair: 'wavy', hairColor: 'hairBl', skin: 'skin2', fem: true, mouth: 'sing', open: 0.5 }, { hair: 'wavy', hairColor: 'hairAu', skin: 'skin3', fem: true },
    { hair: 'bob', hairColor: 'hairBl', skin: 'skin2', fem: true, glasses: 'rect', mouth: 'smirk' }, { hair: 'short', hairColor: 'hairBr', skin: 'skin5' },
    { hair: 'messy', hairColor: 'hairAu' }, { hair: 'side', hairColor: 'hairBl', skin: 'skin2', flush: 1, mouth: 'o' },
    { hair: 'ponytail', skin: 'skin5', fem: true, mouth: 'smile' }, { hair: 'slick', hairColor: 'hairGr', glasses: 'rect' },
  ];
  heads.forEach((h, i) => person(P, 760 + (i % 5) * 190, 230 + Math.floor(i / 5) * 420, 0.3, { top: ['tee', 'shirt', 'hoodie', 'turtleneck', 'vest'][i % 5], color: ['navy', 'roseLt', 'plum', 'char', 'sage'][i % 5], still: true, ...h }));
}

import { heroPose } from './hero.js';
// poses: sitting typing, sitting reading, lunging with a lance, writing at a lectern
export function poses(P) {
  heroPose(P, 220, 820, 0.62, { seat: 250, lean: 0.18, legs: { near: { a: 1.5, b: 0.05 }, far: { a: 1.42, b: -0.1 } }, arms: { near: { a: 0.55, e: 1.5 }, far: { a: 0.45, e: 1.45 } }, uplit: 0.5 });
  heroPose(P, 640, 820, 0.62, { seat: 250, lean: -0.08, legs: { near: { a: 1.25, b: 0.05 }, far: { a: 1.15, b: -0.05 } }, arms: { near: { a: 0.35, e: 1.2 }, far: { a: 0.25, e: 1.1 } }, lookUp: -0.3, mouth: 'smile' });
  heroPose(P, 1030, 820, 0.62, { lean: 0.28, hipY: -430, legs: { near: { a: 0.75, b: 0.05 }, far: { a: -0.55, b: -0.55 } }, arms: { near: { a: 1.25, e: 1.55 }, far: { a: 0.9, e: 1.5 } }, hands: { near: 'fist', far: 'fist' },
    hold: (P, which, w, ang) => { if (which === 'far') P.line(svg(`M${w[0] - 260} ${w[1] + 70} L${w[0] + 420} ${w[1] - 80}`), 9); } });
  heroPose(P, 1420, 820, 0.62, { lean: 0.12, legs: { near: { a: 0.05, b: 0.05 }, far: { a: -0.08, b: -0.08 } }, arms: { near: { a: 0.75, e: 1.35 }, far: { a: 0.45, e: 1.2 } }, look: [0, 0.6], hands: { near: 'fist' } });
}
