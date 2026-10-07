// Preview (with the song) and the export API used by render.mjs.
//   ?t=57      start at a time        ?only=intro,verse1   load only these timeline entries
//   ?export=1  no UI; window.__ep drives rendering        ?scale=0.5  render smaller, ?scale=2  3840x2160 (4K)
//   keys: space play/pause · ←/→ ±1 s (shift ±5 s) · ,/. ±1 frame · [/] previous/next entry · h hide UI
import { loadData } from './data.js';
import { Engine } from './engine.js';

const q = new URLSearchParams(location.search);
const canvas = document.getElementById('c'), hud = document.getElementById('hud'), audio = document.getElementById('a');
const exporting = q.has('export');
if (exporting) document.body.classList.add('export');
const sc = +(q.get('scale') ?? 1);
canvas.width = Math.round(1920 * sc); canvas.height = Math.round(1080 * sc);

try {
  await Promise.all(['40px Federant', '700 40px Cinzel', '600 20px "Plex Mono"', '700 40px "Comic Neue"', '400 20px Inter', '800 20px Archivo'].map((f) => document.fonts.load(f)));
  const data = await loadData('../data');
  const engine = new Engine(canvas, data, { only: q.get('only')?.split(',') });
  await engine.init();
  const duration = data.audio.duration;

  window.__ep = {
    ready: true, duration, width: canvas.width, height: canvas.height, errors: engine.errors,
    timeline: engine.timeline.map(({ id, start, end }) => ({ id, start, end })),
    frame(t) { engine.render(t); return engine.errors.length; },
    png() { return canvas.toDataURL('image/png'); },
    jpg(qual = 0.95) { return canvas.toDataURL('image/jpeg', qual); },
  };

  if (!exporting) {
    let t = +(q.get('t') ?? 0), playing = false, last = performance.now();
    const fmt = (x) => `${Math.floor(x / 60)}:${(x % 60).toFixed(2).padStart(5, '0')}`;
    const seek = (x) => { t = Math.max(0, Math.min(duration - 0.01, x)); audio.currentTime = t; };
    seek(t);
    window.addEventListener('keydown', (ev) => {
      const k = ev.key, big = ev.shiftKey ? 5 : 1;
      if (k === ' ') { playing = !playing; if (playing) { audio.currentTime = t; audio.play(); } else audio.pause(); ev.preventDefault(); }
      else if (k === 'ArrowRight') seek(t + big); else if (k === 'ArrowLeft') seek(t - big);
      else if (k === '.') seek(t + 1 / 30); else if (k === ',') seek(t - 1 / 30);
      else if (k === ']' || k === '[') {
        const tl = engine.timeline, i = tl.findIndex((e) => t >= e.start && t < e.end);
        const j = Math.max(0, Math.min(tl.length - 1, i + (k === ']' ? 1 : -1))); seek(tl[j].start + 0.001);
      } else if (k === 'h') document.body.classList.toggle('clean');
    });
    const loop = () => {
      const now = performance.now();
      if (playing) t = audio.currentTime;
      engine.render(t);
      const e = engine.entryAt(t), A = data.audio;
      hud.textContent = `${fmt(t)}  bar ${A.barAt(t).toFixed(2)}  beat ${A.beatAt(t).toFixed(2)}  ${e?.id ?? '—'}  ${(1000 / (now - last)).toFixed(0)} fps${engine.errors.length ? '  ERRORS: ' + engine.errors.length : ''}`;
      last = now; requestAnimationFrame(loop);
    };
    loop();
  }
} catch (e) {
  window.__ep = { error: String(e?.stack ?? e) };
  hud.textContent = String(e);
  console.error(e);
}
