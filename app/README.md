# The renderer

Plain ES modules, Canvas2D, no build step. Every frame is a pure function of song time `t`, so the preview and the export are the same picture.

```sh
node app/render.mjs serve                       # preview: http://localhost:5173/app/?t=0
node app/render.mjs stills --t 3.5,25,61        # PNGs in out/stills
node app/render.mjs sheet --from 0 --to 21.6 --n 12 --out out/intro.jpg
node app/render.mjs video                       # out/engineers-paradise.mp4, 1920x1080, 30 fps, with the song
node app/render.mjs video --from 21.6 --to 57.7 --only verse1 --preset veryfast --out out/verse1.mp4
```

Needs Node, Chromium (Playwright's, or set `CHROMIUM`) and ffmpeg. `--workers N` renders with N headless pages (default 3); about 15 frames/s on 4 cores for simple scenes.

Preview keys: space play/pause · ←/→ ±1 s (shift ±5 s) · `,`/`.` ±1 frame · `[`/`]` previous/next scene · `h` hide the HUD. `?t=57` starts at a time, `?only=verse1,chorus1` loads only those scenes.

## Layout

- `src/data.js`: `Audio` (beat grid, bars, sections, envelopes, onset pulses) and `Lyrics` (lines and words, `get(text, nth)`, word progress), from `data/*.json`.
- `src/paint.js`: the look: palette `C`, fonts, maths (`ease`, `keys`, `prog`, `rng`), path helpers, the painter (fill/line, `tone` screentone, `halo`, `beads`, `arch`, `vine`, `leaf`, `flower`, `corner`, `banner`, `grain`) and `lyric()` karaoke lettering.
- `src/timeline.js`: which scene plays when (sections from `data/audio.json`).
- `src/engine.js`: builds the frame info (`t`, local time `lt`, progress `p`, `beat`, `bar`, phases, `kick`/`snare` pulses, levels) and calls the scene.
- `src/scenes/*.js`: one module per section; each default-exports `(P, f) => void`, drawing in a 1600×900 frame.
- `src/kit/*.js`: characters and props shared between scenes.

## Rules for scenes

- Deterministic: use `f.t` and seeded `rng()`, never `Math.random()` or wall-clock time.
- Find lyric lines by text (`f.L.get('soda now')`), never hard-code times; cut on downbeats (`f.A.timeOfBar(k)`).
- Lyrics are part of the picture (banner, plaque, sign), lettered with `lyric()`.
