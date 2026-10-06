# Engineer's Paradise — treatment & style bible

## The idea in one paragraph

A parody of "Gangsta's Paradise" by way of "Amish Paradise", about the engineer's paradise of the 2000s and its two deaths: the business model ate it, then the model ate the engineer. The video is a **series of Art Nouveau posters** (a simplified, modern Mucha) about a **saint of engineering**: a hooded engineer under a halo of keycaps. The tone is the Weird Al one: everything is played straight and holy, and the jokes are in the words and the objects. The posters are also how the video **pays homage to big-tech launch films and ads** (the black-and-white portrait campaign, the flat-corporate-illustration era, the product reveal, the chat-UI launch): Mucha drew advertising posters, so every ad idiom is redrawn as a Mucha poster with the same line, palette and grain. Amish Paradise is a source of shots (the buggy on the lane, the quilt stall, the tourists, the barn raising, the candle choir), not a template.

## Tone

- Straight-faced and devotional. Halos, arches, banners, gold. The singer is proud of every absurd line.
- Funny through objects: a soda can held like a chalice, a flywheel as the Wheel of Fortune, a tombstone per killed product, a rubber duck with a halo, a bug in a jar "signed and dated".
- Never mean to individuals; no real logos, no real product UIs, no real people. Company idioms are referenced through composition and type only.
- Characters are de-racialised: light skin tones between East Asian and white; dark brown/black hair when visible. The hero is clean-shaven. The choir is all men (the Valley stereotype is part of the joke).

## Style bible

- **Line**: one dark brown contour (`#33281f`), heavier on outer silhouettes, lighter inside (features, folds).
- **Colour**: flat, muted Mucha palette: gold `#d2a74e` / light gold, sage `#9aa784` / dark sage, dusty rose `#d39c8e` / light rose, teal `#365f63` / dark teal, cream and paper `#ece2cb`, one red `#b5463a` for alarms and soda.
- **Screentone** only for light and shadow: the shadow side of faces and hoods, screen light on faces, dark chapels, can shading. Dots, hexagonal grid, size follows a gradient.
- **Grain**: a quiet lithograph grain and uneven ink over everything.
- **Ornament** is made of engineering things: halos of keycaps and code glyphs, vines that are network cables ending in RJ45 plugs, beads, five-petal blossoms, corner fans, whiplash flourishes, ribbon banners with forked tails, arches with keystones.
- **Type**: Federant (Art Nouveau display) for titles and lyrics; Cinzel (classical caps) for small lettering; IBM Plex Mono only inside code and UI objects. Comic Sans appears exactly once: on the fridge sign.
- **Hero**: teal hoodie, hood up, round glasses, a little dark fringe, drawstrings that curl like Mucha ribbons.

## Karaoke rules

- Every line is readable and synced per word (`data/lyrics.json`): a word inks in at its start (outline → filled) and is complete by its end; the line may appear dim up to ~0.4 s early.
- Lyrics live **inside** the poster: on the banner, a plaque, a scroll, a sign, a tombstone. Never as floating subtitles.
- Choruses repeat the banner motif: "in the engineer's paradise" is always lettered on the same ribbon banner.

## Motion

- Every frame is a pure function of song time. Cuts land on downbeats (80.02 BPM, 3.0 s bars).
- Motion is restrained and graphic: slow pushes into a poster, lateral trucks along a frieze, panels sliding in like pages, halos turning a few degrees per beat, flourishes drawing themselves, gold glints on hits.
- Hits: kicks pulse the halo beads, snares flick ornaments; chorus downbeats get a gold flash on the banner.

## Plates

Times are from `data/audio.json` / `data/lyrics.json` (bars are 3.0 s; bar 0 is the first downbeat).

| section | time | plate |
|---|---|---|
| intro | 0:00–0:21 | **The Valley** |
| verse 1 | 0:21–0:57 | **The Book of the Engineer** (a frieze, one panel per couplet) |
| chorus 1 | 0:57–1:21 | **Paradise** (a triptych) |
| verse 2 | 1:21–2:03 | **The Poster Campaign** (big-tech ad homages as Mucha posters) |
| chorus 2 | 2:03–2:27 | **Paradise, Revised** (the same triptych, corrupted) |
| verse 3 | 2:27–3:09 | **The Horseless Carriage** (the AI era) |
| chorus 3 | 3:09–3:33 | **Introducing Accept All** |
| bridge | 3:33–3:57 | **Glue** |
| outro | 3:57–4:38 | **The Choir** |

### Intro — The Valley (0:00–0:21)
Amish's opening shot, rebuilt: a Mucha landscape poster of a fenced lane through golden hills at dawn. "As I walk through the Valley where the robo-taxis roam": the hero walks the lane in profile; a robo-taxi glides past, its roof sensor spinning like a small halo. "I fear no outage, 'cause my agent's on call from home": he lifts his phone (back to us, camera bump), a tiny halo-bearing cursor answers. "with its tokens and its context, it comforts me": tokens drift past like blossoms. On the last bar the arch frame closes in and the banner letters **ENGINEER'S PARADISE**.

### Verse 1 — The Book of the Engineer (0:21–0:57)
A long frieze of arched panels; the camera trucks along it one panel per couplet, moving on the downbeat.
1. *Seventeen with a compiler… MPEG spec…*: a teenager at a CRT with a dial-up modem; the spec on his lap glows (its cover reads ISO/IEC 14496, a pinned page RFC 9559; easter eggs only).
2. *open standards… RFCs… Haskell*: the saint portrait (round 6): keycap halo, RFC scrolls unrolling; a λ in the halo.
3. *Came out west… one commit at a time*: walking west with a duffel and a laptop toward a sunrise; his footsteps are commit dots on a git graph.
4. *Every bug was a riddle… blameless postmortem*: St. George and the Bug: the hero spears a beetle-dragon; then writes the postmortem on a lectern scroll.
5. *Nobody had a title… code reviewer with no humor*: an org chart of empty dotted boxes drifting like clouds; a towering reviewer with a red pen for a sceptre; the LGTM seal stays in his hand.
6. *Didn't do it for the money… The mission said so. So did we.*: the mission carved on a stone tablet; a row of engineers under small halos nods along.

### Chorus 1 — Paradise (0:57–1:21)
A triptych that fills in panel by panel, two bars per sung line: the midnight oil lamp; two ideas as light bulbs in a duel; a ship launched into the world; the world itself. Every "in the engineer's paradise" is lettered on the ribbon banner under the centre arch; the halo above it turns a few degrees per beat.

### Verse 2 — The Poster Campaign (1:21–2:03)
The posters stop being devotional and start selling. Each couplet is an advertising poster in the same Mucha language, each an homage to a big-tech ad idiom.
1. *Then one Monday at the fridge… "Soda now fifty cents"… a fella with a plan*: the fridge, its hand-written sign in Comic Sans; the SODA poster (round 6). The Manager enters: slick hair, a slide clicker for a sceptre.
2. *more shares than the founders and a flywheel slide… footnote*: the flat-corporate-illustration homage as a Mucha frieze: long-limbed workers turning a giant flywheel (SHIP · GROW · REORG · ALIGN) like the Wheel of Fortune; the verse-1 tablet gets an asterisk and a tiny footnote.
3. *the story in the doc… cross-functional alignment*: the promo packet as an illuminated manuscript, "drove cross-functional alignment" in gold capitals; stock certificates drift down.
4. *a graveyard full of products… God knows*: rows of ornamented tombstones receding to the horizon, each with a level badge (L5→L6).
5. *the org chart got real… launch review in May*: the org chart is now a Mucha tree of life, all boxes; one button turns from blue to gray after nine stamps come down one by one, one per beat.
6. *Code yellow… shrank the little "Ad"*: a yellow alarm halo; the green "Ad" label shrinks to a dot and the ad melts into the list of results.
7. *Got an email Friday morning… badge reader blinked red*: the hero at the door; the reader blinks red; his halo goes out, gold to grey. Hard cut on the downbeat.

### Chorus 2 — Paradise, Revised (2:03–2:27)
The chorus-1 triptych, corrupted: the halo is replaced by a gold up-and-to-the-right chart arrow; the soda is priced; the Manager sits enthroned in the centre arch ("adult supervision"); on "badge turned red — goodnight" the panels go dark one by one.

### Verse 3 — The Horseless Carriage (2:27–3:09)
The AI era; the homage is the AI launch film and the chat product.
1. *the model learned to code… English*: a keynote stage under an arch; code on the giant screen dissolves into plain English letters.
2. *Twenty years of Emacs chords… accept all*: close-up of a hand, the pinky bent like a hook over C-x C-s keycaps; then TAB, TAB, TAB, and the Accept all button revealed like a relic.
3. *Stack Overflow's a ghost town… rubber duck… load-bearing*: a deserted street, a tumbleweed rolling across an empty queue; on the desk a rubber duck under a halo, its speech banner: "load-bearing".
4. *deleted all the tests… green forever*: test files fall like autumn leaves; the build badge glows green as a halo.
5. *New grads… nine agents in tmux*: a ladder with missing rungs, graduation caps at its foot; the hero wrangles nine panes arranged like stained-glass windows.
6. *laid off… farmers' market… signed and dated by the man*: Amish's QUILTS stand becomes a Mucha market poster: **HAND-TYPED CODE · small batch · organic**; jams, clotted cream, and jars with a bug in each, labelled and signed; tourists with cameras.

### Chorus 3 — Introducing Accept All (3:09–3:33)
A launch-poster homage. "Agent writes it, I just sign": the hero signs with a quill. "tokens burned by April": calendar pages curl and burn. "Horse and buggy, end of line": the intro's robo-taxi passes a horse at the end of the lane. "You're absolutely right!": a giant glowing speech banner under a halo. The ribbon banner still says "in the engineer's paradise".

### Bridge — Glue (3:33–3:57)
Drums drop out. A sepia almanac page: the horse population, 26 million in 1915 to 3 million in 1960, drawn as a column of horses that thins out year by year. The horses file into a factory; out comes a bottle labelled **GLUE CODE** with the hero's face in the cartouche.

### Outro — The Choir (3:57–4:38)
A chapel of arches; a men's choir of engineers, each holding his phone up to his face (backs and camera bumps to us), lit from below by the screens. "Glue between the agents' lines": cables join the phones. "Read its code — it's cleaner than mine", "Even wrote the tests this time", "not a single nit to find": the camera pulls back and the arches multiply into an endless nave. On "Accept all." every screen turns to the same button; the hero presses his; the arch closes into the title.

## Amish Paradise, used as inspiration
the opening lane (intro), the quilt stand (verse 3), the tourists with cameras (verse 3), the barn raising (the flywheel, verse 2), the candle choir (outro, with phones instead of candles), the dark close-ups (the saint portrait).

## Technical conventions
See `app/README.md`. 1920×1080 (layout in 1600×900 logical units), 30 fps, deterministic, Canvas2D; scenes are anchored to lyric lines and cut on downbeats.
