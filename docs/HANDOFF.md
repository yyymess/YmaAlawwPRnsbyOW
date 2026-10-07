# Engineer's Paradise: a briefing for picking this up

Written on 2026-10-07 at the end of the first long working session, so a new session can carry on. It records what the project is, how it is built and run, how the work with the user has gone, and what has been decided and why. It is a snapshot, not a rulebook: the living references are `docs/TREATMENT.md` (story and style bible), `docs/FIGURES.md` (how people, hands and trees are drawn), `docs/TIMECODES.md` (where each shot is) and `app/README.md` (the renderer). Where this note and the code disagree, the code wins.

## The project

A parody music video, **"Engineer's Paradise"**: "Gangsta's Paradise" by way of Weird Al's "Amish Paradise". It is about the engineer's paradise of the 2000s and its two deaths: the business model ate the culture, then the model ate the engineer. The song is the user's own Suno track, `audio/engineers-paradise.m4a` (4:38.6).

- **Tone**: straight-faced and devotional (halos, arches, banners, gold), the jokes carried by words and objects (a soda can held like a chalice, the flywheel as a Wheel of Fortune, a bug in a jar "signed and dated"). Lighter and sarcastic rather than bitter. No real logos, product UIs or people.
- **Look**: a simplified, modern Mucha / Art Nouveau poster: flat colour, a dark contour line, screentone dots only for light and shadow, gold ornament, a paper grain over everything. Big-tech promo idioms (keynote stage, corporate-Memphis figures, poster campaigns) are homaged inside that one texture.
- **The hero**: a teal hoodie with the hood up and a soft point at the crown (a monk's cowl), round glasses, clean-shaven, a little dark fringe allowed under the rim, light skin between East Asian and white. His construction is in `docs/FIGURES.md` (hood hugs the skull, shoulders about 2.3 hood widths, about 6.5 heads; a boxy side view with a dip at the nape; the crossed two-hand phone grip).
- Background reading behind the jokes is in `research/`, the lyric drafts and Suno prompts in `lyrics/`, the compositions borrowed from the Amish video in `docs/amish-shotlist.md`. `style-lab/` holds the early style experiments; nothing in the app uses it.

## The song and its timing

- 80.024 BPM, beat period 0.74978 s, first beat at 0.689 s. `data/audio.json` (beat grid, sections, envelopes, onsets) and `data/lyrics.json` (81 lines, 680 words with start and end times) were made once by `analysis/` (Python with uv: demucs, librosa, whisper alignment). Only rerun it if the audio changes.
- Sections: intro 0–21.7, verse 1 –57.7, chorus 1 –81.7, verse 2 –123.7, chorus 2 –147.6, verse 3 –189.6, chorus 3 –213.6, bridge –237.6, outro –278.6.
- A section whose vocal starts with a pickup cuts on the beat before its first word, never before the previous line has ended (`beatCut`/`cut` in `app/src/kit/props.js`, `app/src/timeline.js`). Scenes find lyric lines by text (`f.L.get('soda now')`) and never hard-code times, so the picture stays locked to the song.

## How it is built

`app/` is plain ES modules drawing with Canvas2D, no build step. Every frame is a pure function of song time `t` in a 1600×900 logical frame, scaled to the canvas (1920×1080, or 3840×2160 with `?scale=2`). The same page is the preview (`app/index.html`, with the song) and the export (`app/render.mjs` drives it in headless Chromium and pipes frames to ffmpeg).

- `src/paint.js`: palette `C` (including `skin`..`skin5`, the hair colours, `blossom`, `bark`, `kraft`), easing and maths, the painter (`fill`, `line`, `both`, `tone` for screentone, `halo`, `beads`, `banner`, `vine`, `grain`), `greyed(k, draw)` (drain the palette to grey), and `lyric()` karaoke lettering.
- `src/engine.js`, `src/timeline.js`, `src/main.js`, `src/data.js`: the frame loop, which scene plays when, the page and the export API (`window.__ep`), and the song data.
- `src/scenes/`: one module per section. The intro (the Valley at dawn, the chapel, tokens as blossoms); verse 1 as a frieze of six framed chapters (Calling, Creed, Pilgrimage, Dragon, Elders, Covenant); the choruses as a triptych with three variants (Paradise, Paradise Revised, Introducing Accept All); verse 2 as a wall of seven pasted-up posters (MONDAY … FRIDAY); verse 3 on a proscenium stage whose curtains close between couplets; the bridge as plates in "The Almanac of Progress"; the outro in a chapel with a choir of phones, then the Valley at sunset.
- `src/kit/`: shared drawing. `hero.js` (`heroFront`, `heroSide`, `heroBack`, `heroWalk`, `heroPose`, `phoneInHands`, `features`), `people.js` (`person` for the supporting cast, `personBack` for audiences, the Unix beard), `things.js` (props: `ship`, `buggy`, `horse`, `car`, `mug`, `cardboardBox`, `snakePlant`, `platter`, `drawHand`, `curvedFinger`, `cup`, `flame` …), `props.js` (`robotaxi`, `agentAngel`, `campus`, `megacampus`, `tree`, `cypress`, `cherryTree`, `petal`, `posterFrame`, `lyricBanner`), `sheets.js` (review sheets).
- Arms and hands: `fist`, `palm`, `sleeveArm`, and for arms on a front bust `armPlan` / `upperArm` / `foreArm` / `armFist` (all in `src/scenes/verse1.js`): the upper arm is drawn behind the body so it only shows where it leaves the body's side.
- The engine resets the context every frame, and a scene that throws is caught (its `save`s popped) and reported in `engine.errors`; a module that fails to load turns into a placeholder and is reported too.

## Running it

```sh
npm run preview                                    # http://localhost:5173/app/?t=0  (space, ←/→, [ ], h)
node app/render.mjs check --from 160 --to 170 --step 0.1      # draw every step, exit 2 on scene errors
node app/render.mjs stills --t 71.4,119.6 --out out/stills    # PNG stills (add --scale 2 for 4K stills)
node app/render.mjs sheet --from 189 --to 214 --n 12 --cols 4 --out out/sheet.jpg   # a contact sheet
node app/render.mjs video --from 264 --to 278.6 --size 720 --crf 23 --preset veryfast --fmt jpg --out out/clip.mp4
node app/render.mjs kit --sheet cast,faces,cherry              # review sheets: hero, props, closeup, cast, faces, poses, campuses, cherry
npm run render       # the whole song, 1080p        npm run render:4k   # 3840x2160 (all vector, so truly sharp)
```

- `--fmt jpg` pipes JPEG frames: about 14 fps on four cores at 1080p against about 3 for PNG, with no visible difference after the x264 encode. The whole song is 8358 frames: roughly 10–15 minutes at 1080p here; 4K costs three to four times as much. The pages only render a few frames ahead of ffmpeg, so memory stays flat.
- A quick syntax check of every module: `for f in app/src/scenes/*.js app/src/kit/*.js app/src/*.js; do node --input-type=module --check < $f >/dev/null 2>&1 || echo "SYNTAX ERROR: $f"; done`.
- Files sent in the Claude app are limited to 30 MiB. A whole-song 540p that fits: render `video --fmt jpg --size 540 --crf 16`, then a two-pass x264 at about 750 kb/s with 112 kb/s AAC (`-preset slow -tune animation -b:v 750k -maxrate 1500k -bufsize 3000k`), about 29 MiB.
- `out/` is git-ignored: renders, stills and sheets live there and do not travel with the repo.

## How the work has gone

- The user writes in Chinese and reads replies in Chinese; they like short, concrete answers.
- After the first full build they review the video and send notes on particular moments, often with a timestamp, a few at a time. Each change has been shown with stills or a short clip of just the affected shots (they asked for this: "每次改动后不用重新渲染整个视频"). The whole video is rendered only when they ask, usually as a 540p to watch.
- Before/after pairs and contact-sheet montages have worked well. When a change is a matter of taste, a few proposals drawn side by side (as kit sheets) with a recommendation has worked better than describing them.
- Every change has been checked before showing it: the syntax check, `check` over the affected range, then looking at the stills (cropping in for detail) and, where motion matters, a clip. Then it was committed with a message saying what changed and why, and pushed. No pull requests so far.
- What the user holds the work to, in their words where possible:
  - production quality, nothing rough ("不能有各种粗糙的细节"); stiff or oversized hands were the first thing they noticed;
  - some creativity and surprise, but one stable style;
  - real-world scenes need enough detail to carry them, abstract or iconic ones may stay simple;
  - symbolism only where it reads at once: they removed the agent's halo ("那个造型本身已经很symbolic了") and the hero's second halo for being too hidden;
  - proportion and joins are checked by eye: hands about three quarters of the face height, arms growing out of the body's side, no two contours just touching, text that reads (the P0 pennant is set in the mono face so its zero is not an O).

## Decisions so far

- **Supporting cast** (`people.js`): varied the way a real office is, without a token figure: skin from fair to light brown (`skin`..`skin5`), hair black, brown, blond, auburn or grey, roughly one woman in three (`fem: true`: lashes, a touch of lip colour, earrings; hair `bob`, `ponytail`, `wavy`, `bun`). The Manager stays the slick-haired man in the vest.
- **The code reviewer** (verse 1 V, outro): the Unix greybeard after Stallman: long receding hair, a full salt-and-pepper beard over the mouth, ragged brows; his halo is a hard-disk platter, as St IGNUcius wears it (`platter`).
- **Gags**: the launch ship's sail says BETA (the public-beta years; the panel is dated MMIV); the dragon's pennant says P0 (not the Facebook-ish SEV 1); the stall's bug jars are "priceless".
- **The agent** (`agentAngel`): a geometric mark with Mucha wings and a glow, no halo.
- **Halos**: the hero's nimbus behind his head (his craft: keycaps and code glyphs) stays, as does the sun-as-halo of the Valley. The ring over his head is gone everywhere. On FRIDAY, when the badge reader blinks red, he greys out like a disabled control, the grey spreading from the badge in his hand (`greyed`); he is still grey beside the red light in chorus 2's last panel.
- **The ending** (`valleyEnd` in `outro.js`): it opens on the intro's composition (the same great sun half behind the far ridge) and the sun sets from there; the land and sky are lit by the hour (gold, rose, plum, night), moon and stars come out. He walks at one steady cadence (feet locked to the ground, never in place), up the path and over the crest just before the sun goes. The playful glass campus of the dawn has become an austere low megastructure along the ridge (`megacampus`: tent-like canopies in solar scales with a rise towards a double-height atrium, after the big new HQs), its glass lit cold at night. The robo-taxi drives over the path's crossing, not under it.
- **Trees**: drawn by the rules in `docs/FIGURES.md` (from Hiroshige, Mucha and screen-printed posters): one tapering silhouette, area-preserving forks, outline under fill, blossom or foliage in a few masses with detail only at the edges. `cherryTree` is the worked example (spring, verse 3).
- **The detail pass** (the user asked that every real-world scene carry enough detail): the three-masted ship in a harbour with a lighthouse and the christening champagne; the robo-taxi; the Amish buggy, hay bale, EV charger, TOKENS fuel gauge, paper coffee cups; FRIDAY's office front (lot, car, plaza, glass wall, BLDG 42, bike rack); MONDAY's micro-kitchen and drinks fridge; the FIZZ vending machine; the keynote audience from behind; the ghost town; the Golden Gate; the tests' tree; the market stall; the glue works and schoolroom; the layoff box (plant, duck, #1 DEV mug, dead badge) under the cherry tree.

## Ideas raised but not done

- A "This account has been deactivated" toast on FRIDAY (offered; the grey-out was liked as it is).
- An #OPENTOWORK band round the hero's nimbus in the layoff scene (one of four halo proposals, not chosen).
- The Valley's older trees (`tree`, `cypress`) predate the tree rules and could be redrawn by them.
- The paper grain is a small tile scaled up; at 4K it is soft (fine as texture, but it could be generated at the output size).
- The final master: no current 1080p or 4K master exists after the latest changes; the plan is to render 4K on the user's own machine (`npm run render:4k`).

## Things that bit us

- Killing processes with `pkill -f <pattern>` matched the shell running it; kill by PID. A wait loop `until ! pgrep -f "render.mjs video"` matches itself and never ends.
- A `//` comment pasted into the middle of a one-line statement silently turned a whole scene into the placeholder; the syntax check plus `check` mode catch it.
- The video pipe once queued frames without bound and was killed at 12 GB; it is bounded now.
- Canvas text: the Cinzel zero reads as an O; use the mono face for codes and numbers that must read.
- On Windows, `render.mjs` once resolved the project root wrong (fixed with `fileURLToPath`).
