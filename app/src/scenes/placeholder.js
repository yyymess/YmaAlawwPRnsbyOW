// Stand-in for a scene that isn't made yet: a plain poster with the section name and the lyric.
import { W, H, rect, lyric, FONT } from '../paint.js';

export default function placeholder(P, f) {
  P.paper();
  P.arch(300, 60, 1000, 780, 'sage');
  P.text(f.params.section?.toUpperCase() ?? '', W / 2, 260, { font: FONT.caps, weight: 700, size: 40, tracking: 8 });
  const line = f.L.at(f.t);
  if (line && line.end > f.start) lyric(P, line, f.t, W / 2, 480, { size: 52, maxW: 900 });
  P.fill(rect(300, 840, 1000 * Math.min(1, f.p), 6), 'gold');
}
