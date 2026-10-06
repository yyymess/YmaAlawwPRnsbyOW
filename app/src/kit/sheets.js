// Review sheets for characters and props (app/kit.html?sheet=...).
import { heroFront, heroSide, heroBack, heroWalk, phone } from './hero.js';
import { robotaxi, agent } from './props.js';
import { rect } from '../paint.js';

export function hero(P) {
  // turnaround: front, side, back, front with the phone; then the walk cycle
  heroFront(P, 230, 200, 0.36, {});
  heroSide(P, 610, 200, 0.36, {});
  heroBack(P, 990, 200, 0.36, {});
  heroFront(P, 1370, 200, 0.36, { hold: 'phone', uplit: 0.6, look: [0, 0.6], mouth: 'smile' });
  for (let i = 0; i < 8; i++) heroWalk(P, 110 + i * 190, 880, 0.4, (i / 8) * Math.PI * 2);
}

import { tree, cypress, campus, agentAngel } from './props.js';
export function props(P) {
  robotaxi(P, 300, 330, 0.75, 0.3);
  campus(P, 860, 330, 0.85);
  tree(P, 1280, 330, 0.85, 1); tree(P, 1480, 330, 0.7, 4); cypress(P, 1560, 330, 0.7);
  agentAngel(P, 300, 640, 1, 0.5);
  P.vine([[600, 840], [560, 760], [700, 700], [640, 560]], 5);
  P.vine([[760, 840], [800, 760], [700, 690], [780, 560]], 5);
  heroFront(P, 1150, 600, 0.42, { hold: 'phone', uplit: 0.6, look: [0, 0.6] });
}

// close-ups for checking the side view and the grip
export function closeup(P) {
  heroSide(P, 330, 330, 0.8, {});
  heroFront(P, 1130, 330, 0.8, { hold: 'phone', uplit: 0.6, look: [0, 0.6], mouth: 'smile' });
}
