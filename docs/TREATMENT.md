# Engineer's Paradise — treatment & style bible

## The idea in one paragraph

A parody of "Gangsta's Paradise" by way of "Amish Paradise", about the engineer's paradise of the 2000s and its two deaths: the business model ate it, then the model ate the engineer. The video is a **series of Art Nouveau posters** (a simplified, modern Mucha) about a **saint of engineering**: a hooded engineer under a halo of keycaps. The tone is the Weird Al one: everything is played straight and holy, and the jokes are in the words and the objects. The posters are also how the video **pays homage to big-tech launch films and ads** (the black-and-white portrait campaign, the flat-corporate-illustration era, the product reveal, the chat-UI launch): Mucha drew advertising posters, so every ad idiom is redrawn as a Mucha poster with the same line, palette and grain. Amish Paradise is a source of shots (the buggy on the lane, the quilt stall, the tourists, the barn raising, the candle choir), not a template.

## Tone

- Straight-faced and devotional. Halos, arches, banners, gold. The singer is proud of every absurd line.
- Funny through objects: a soda can held like a chalice, a flywheel as the Wheel of Fortune, a tombstone per killed product, a rubber duck with a halo, a bug in a jar "signed and dated".
- Never mean to individuals; no real logos, no real product UIs, no real people. Company idioms are referenced through composition and type only.
- The hero is fixed: light skin between East Asian and white, dark hair, clean-shaven. The supporting cast varies the way a real office does, without making a point of it: skin from fair to light tan and light brown, hair black, brown, blond, auburn or grey, and roughly one woman in three (long or bobbed hair, a ponytail, earrings, a touch of colour on the lip). All in the same drawing, line and shading as everyone else.

## Style bible

- **Line**: one dark brown contour (`#33281f`), heavier on outer silhouettes, lighter inside (features, folds).
- **Colour**: flat, muted Mucha palette: gold `#d2a74e` / light gold, sage `#9aa784` / dark sage, dusty rose `#d39c8e` / light rose, teal `#365f63` / dark teal, cream and paper `#ece2cb`, one red `#b5463a` for alarms and soda.
- **Screentone** only for light and shadow: the shadow side of faces and hoods, screen light on faces, dark chapels, can shading. Dots, hexagonal grid, size follows a gradient.
- **Grain**: a quiet lithograph grain and uneven ink over everything.
- **Ornament** is made of engineering things: halos of keycaps and code glyphs, vines that are charging cables ending in USB-C plugs (plain side view, big enough to read at a glance: white overmold, the narrower silver shell; keep the old margin to the panel's top), beads, five-petal blossoms, corner fans, whiplash flourishes, ribbon banners with forked tails, arches with keystones.
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
A frieze of six arched chapters on a long wall; the camera glides one chapter per couplet, landing with the first word. Each couplet is lettered on the chapter's plaque under a small title tab.
1. *I · The Calling*: a teenager's room at night: a beige CRT (`cc hello.c`, `hello, world`, `ATDT`, `CONNECT 56000`), a chattering modem, FRI circled on the calendar, a rubber duck on the shelf; he leans back with the spec (ISO/IEC 14496) glowing on his lap.
2. *II · The Creed*: the saint portrait: RFC scrolls unfurl like ribbons (791, 2616; then 1149 with its pigeon, and 9559); the halo's keycaps turn over to Haskell; on "please" he prays.
3. *III · The Pilgrimage*: walking west into the sun past a red bridge, a duffel bag; a packing list ticks off "a laptop, a duffel bag, a dream"; a thought cloud with the world and a heart; one commit dot per step.
4. *IV · The Dragon*: St George and the Bug (a beetle with bat wings and a question mark); SEV 1 pennant, flames; then the postmortem at a lectern (Who to blame: nobody) while the bug lies on its back under a little halo.
5. *V · The Elders*: the org chart as clouds of empty dotted boxes ("psst… an org chart?"); the reviewer rises as a Byzantine icon: the Unix greybeard (long hair, a full salt-and-pepper beard over the mouth, bushy brows), and his halo is a hard-disk platter, as St IGNUcius wears his; a red pen for a sceptre, the LGTM seal held back; the hero's PR #1 gets its first red nit.
6. *VI · The Covenant*: the hero waves the money off, FREE on a ribbon; the mission tablet (CHANGE THE WORLD); five believers under small halos nod on "So did we".

### Choruses — one triptych altarpiece, three times
Header plaques over the wings: PARADISE · MMIV, PARADISE · REVISED, INTRODUCING · ACCEPT ALL. Every line is lettered on the same ribbon banner; the refrain flashes gold. Panels flip like cards to their next couplet.
- **1 Paradise**: the wings swing open; the midnight oil (lamp, clock, cups, moon); an A/B duel of light bulbs, B crowned; a v1.0 ship launched with fireworks and a champagne bottle; the world under a halo getting a diff (+1,024, −512…).
- **2 Paradise, Revised**: a revenue arrow for a halo; the fridge become a vending machine at 50¢; the Manager enthroned between two clones in vests; the badge reader's red light, the panels going dark one by one, the wings closing on Α and Ω.
- **3 Introducing Accept All**: a launch stage with spotlights; the agent writes a scroll and he signs; the calendar burns to April while he sits it out with coffee amid flames, an invoice for four billion tokens (PAID); the robo-taxi passes the horse and buggy at END OF LINE; "You're absolutely right!" with "Great question!" and "Certainly!" in the wings.

### Verse 2 — The Poster Campaign (1:21–2:03)
Seven ad posters pasted over each other on a wall, one per couplet (dropped and slapped on with a stroke of paste), each with its slogan band carrying the lyric: MONDAY (the fridge, the Comic Sans sign, the Manager and THE PLAN); THE FLYWHEEL (flat-corporate-illustration workers turning SHIP · GROW · REORG · ALIGN, the Manager riding it with his shares, the mission tablet footnoted *subject to quarterly results*); THE DOC (the code crossed out; DROVE CROSS-FUNCTIONAL ALIGNMENT illuminated; stock raining); THE GRAVEYARD (rows of R.I.P. stones with product glyphs and L6 medals; the users floating up into a cloud); THE ORG CHART (a tree of boxes, a Submit button gone grey under nine APPROVED stamps, three syncs, MAY 31); CODE YELLOW (the beacon, search results whose "Ad" label shrinks to nothing, confetti); FRIDAY (the email, the walk to the door; the badge reader blinks red and the halo goes grey).

### Verse 3 — The Horseless Carriage (2:27–3:09)
A theatre: a Mucha proscenium (velvet curtains, gold fringe, footlights) whose curtains close and open between couplets like a keynote changing slides; the lyric on the apron's plaque. The keynote (code dissolving into English, the braces falling off the screen); the Emacs hand with its little finger hooked on Control, then TAB TAB TAB and Accept all in a reliquary; a ghost town (HOTEL · STACK · OVERFLOW · SALOON) with a tumbleweed across an empty roped queue, then the rubber duck under a spotlight answering in a chat bubble with typing dots: "Ah, that typo is load-bearing."; test files falling like leaves under a green build badge, "I did my best! ✨"; grads under a ladder missing its rungs, then nine agents in a stained-glass tmux herded with a crook; laid off in spring (the duck in the layoff box), the HAND-TYPED CODE stall with jam, cream and bug jars, NO TOKENS; a signed bug jar and tourists' flashes (I ♥ ENGINEERS).

### Bridge — Glue (3:33–3:57)
A sepia almanac page (THE ALMANAC OF PROGRESS) in the isotype manner: 1915, twenty-six horse figures; 1960, three, the rest walking off as motor cars take their places; an empty retraining schoolroom (Lesson 1: Driving — CANCELLED) and one puzzled horse in a dunce cap; the glue works with the horses filing in; a GLUE CODE bottle with the hero's face in the cartouche.

### Outro — The Choir (3:57–4:38)
A chapel choir of engineers holding their phones up, lit from below; cables join the phones on "Glue between the agents' lines"; its code beside his (ITS vs MINE); the tests scroll (10 passed); the old reviewer searches with a magnifying glass, finds nothing and caps his red pen (LGTM); the arches multiply into a nave; on "Accept all." every phone turns round to show the same button and he presses his. Then the Valley at dusk: the robo-taxi (★★★★★) passes, he walks off towards the sun, the title returns with a credit line, fade to black.

### Between sections
The new section opens through a growing gold-rimmed arch over the old one (0.6 s), cut in on the vocal's pickup beat.

## Amish Paradise, used as inspiration
the opening lane (intro), the quilt stand (verse 3), the tourists with cameras (verse 3), the barn raising (the flywheel, verse 2), the candle choir (outro, with phones instead of candles), the dark close-ups (the saint portrait).

## Technical conventions
See `app/README.md`. 1920×1080 (layout in 1600×900 logical units), 30 fps, deterministic, Canvas2D; scenes are anchored to lyric lines and cut on downbeats.
