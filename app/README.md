# The renderer

Plain ES modules, Canvas2D, no build step. Every frame is a pure function of song time `t`, so the preview and the export are the same picture.

```sh
node app/render.mjs serve                       # preview: http://localhost:5173/app/?t=0
node app/render.mjs stills --t 3.5,25,61        # PNGs in out/stills
node app/render.mjs sheet --from 0 --to 21.6 --n 12 --out out/intro.jpg
node app/render.mjs video                       # out/engineers-paradise.mp4, 1920x1080, 30 fps, with the song
node app/render.mjs video --from 21.6 --to 57.7 --only verse1 --preset veryfast --out out/verse1.mp4
node app/render.mjs video --from 150 --to 158 --size 720 --crf 23 --preset veryfast --out out/clip.mp4   # a quick 720p clip of one shot
node app/render.mjs check --from 160 --to 170 --step 0.1   # draw every step, exit 2 on scene errors
node app/render.mjs kit --sheet cast,faces                 # character and prop review sheets (src/kit/sheets.js) as out/kit-*.png
```

Needs Node, Chromium (Playwright's, or set `CHROMIUM`) and ffmpeg. `--workers N` renders with N headless pages (default 3); about 15 frames/s on 4 cores for simple scenes.

### On your own machine (and in 4K)

Everything else is in the repo: the fonts (`app/fonts`, OFL), the song (`audio/`), and the beat grid and word timings (`data/`, made once by `analysis/`; not needed to render).

```sh
# Windows (PowerShell):  winget install Git.Git OpenJS.NodeJS.LTS Gyan.FFmpeg   (then open a new terminal)
# macOS:                 brew install git node ffmpeg
git clone https://github.com/yyymess/YmaAlawwPRnsbyOW.git && cd YmaAlawwPRnsbyOW
npm install                           # Playwright
npx playwright install chromium       # its Chromium (or point $CHROMIUM at a Chrome/Chromium binary)
npm run preview                       # http://localhost:5173/app/?t=0
npm run render                        # out/engineers-paradise.mp4, 1920x1080
npm run render:4k                     # out/engineers-paradise-4k.mp4, 3840x2160
```

Any Node 18+ and an ffmpeg with libx264 and AAC will do. Claude Code itself is not needed to render.

`--scale 2` draws every frame at 3840x2160. It is all vector (lines, fills, screentone dots sized in frame units), so 4K is genuinely sharper, not upscaled; only the paper grain is a texture. It takes roughly three to four times as long as 1080p; set `--workers` to about the number of performance cores. `--scale 2 --size 1440` gives a supersampled 1440p.

`--fmt jpg` pipes JPEG frames (quality 0.95) instead of PNG: about four times faster (encoding a PNG of all that screentone in the page is the bottleneck), and after the x264 encode the difference is invisible; the npm scripts use it. Leave it off for a lossless frame pipe. The pages render at most a few frames ahead of ffmpeg, so memory stays flat however long the song or big the frames.

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
