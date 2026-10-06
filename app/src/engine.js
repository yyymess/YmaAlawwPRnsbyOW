// The engine: every frame is a pure function of song time t. A timeline maps time to scenes; each
// scene draws in the 1600x900 logical frame through the painter; the engine scales to the output
// size and lays the grain over the top.
import { painter, W, H } from './paint.js';
import { makeTimeline } from './timeline.js';

export class Engine {
  constructor(canvas, data, opts = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { willReadFrequently: false });
    this.audio = data.audio; this.lyrics = data.lyrics;
    this.scale = canvas.width / W;
    this.P = painter(this.ctx);
    this.timeline = makeTimeline(this.lyrics, this.audio).filter((e) => !opts.only || opts.only.includes(e.id));
    this.errors = [];
  }
  async init() { for (const e of this.timeline) { const m = await e.load(); e.scene = m.default; } }
  entryAt(t) { return this.timeline.find((e) => t >= e.start && t < e.end) ?? null; }
  render(t) {
    const { ctx, P, audio: A } = this, e = this.entryAt(t);
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (e) {
      const f = {
        t, lt: t - e.start, p: (t - e.start) / (e.end - e.start), start: e.start, end: e.end, params: e.params ?? {},
        beat: A.beatAt(t), bar: A.barAt(t), A, L: this.lyrics,
        kick: A.hit('kick', t), snare: A.hit('snare', t), vocal: A.level('vocal', t), rms: A.level('rms', t),
      };
      f.beatPhase = f.beat - Math.floor(f.beat); f.barPhase = f.bar - Math.floor(f.bar);
      try { ctx.save(); e.scene(P, f); ctx.restore(); }
      catch (err) { ctx.restore(); const msg = `${e.id}: ${err.stack ?? err}`; if (!this.errors.includes(msg)) { this.errors.push(msg); console.error(msg); } }
    }
    P.grain(t);
  }
}
