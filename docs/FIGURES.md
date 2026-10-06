# Figures in this style

How people are built in the flat Art Nouveau + screentone look. The rules come from the intro and character reviews (hoodie read as a helmet, hood far too big, bloated side view, hands too small, an unnatural phone grip, straight-legged walk).

## Proportions
- Adults are about **6.5–7 heads** tall (stylised, not heroic). Head = crown to chin. The walking hero is ~1000 units to the hood's point with a 150-unit head.
- **Hands are big**: a hand from wrist to fingertip is about **0.75 of the face height**; two hands holding a phone cover most of its lower half.
- A phone is about **0.6 of the face height** (it covers the chin and neck when held up to read).
- Shoulders are about **2 heads** wide on a man; a hoodie widens them with dropped seams.

## The hoodie (hood up)
Measured against hoodie reference sheets (front, side, back, turning). A hood is soft cloth that **hugs the skull**, not a shell or a big bag:
- **Size**: the hood is only a little bigger than the head: about 25 units of slack over the crown (head ~425 crown to chin in bust units), a little more at the back. **Shoulders are about 2.3 hoods wide**; if the hood looks as wide as the shoulders, it is far too big.
- **The point**: a soft point at the crown seam (our "religious" touch, like a monk's cowl), modest, about 60 units above the skull; the tip flops a little.
- **The opening**: the rim sits **on the forehead** (brows still visible) and **over the edges of the cheeks**, so the face nearly fills it. The dark inside shows only as a thin sliver at the sides and below the jaw, round the neck. A gentle pointed arch at the top.
- The hood's sides fall nearly straight past the jaw, then its base spreads onto the shoulders; the pullover's crossover V sits at the collarbone, with the neck showing in it.
- **Hair** may show when it looks natural: a short fringe hanging from under the rim, stopping above the brows, and a thin lock by the cheek in profile. Never above or outside the rim.
- **Drawstrings** come out of eyelets either side of the V and hang to mid-chest; aglets at the ends.
- **Side view** (the commonest mistake is a bloated side): a worn hood is **boxy** in profile, a nearly flat top running back to a corner (the soft point lives here), a back that falls close to the skull, then a **clear dip at the nape** before its base runs down the slope of the shoulders, pulled taut. Worn deep, the rim projects a little in front of the forehead and runs back past the cheekbone, under the jaw, to the chest; the face (brow, nose, lips, chin and the cheek) stands in front of it. The torso is about one head deep, the shoulder under the sleeve is rounded, and the tone stays on the back third only.
- **Back view**: a centre seam from the point down; the hood's lower edge makes a soft U across the upper back, with a little shadow under it and folds bunched where it lies.
- Body: dropped shoulder seams, a **kangaroo pocket**, **ribbed cuffs and hem**; sleeves are wider than the arm inside and gather into narrower cuffs. Big, loose folds: a few long lines, not many short ones.

## Joints and gesture
- Limbs are two segments with visible joints: thigh/shin with a **knee**, upper arm/forearm with an **elbow**. Never a straight capsule.
- Walk cycle per leg: the thigh swings ±0.42 rad; the **knee bends most in the swing** (the leg passing forward) and is nearly straight on contact; the foot stays flat in stance and peels off at the toe. Arms swing opposite to the legs with a slightly bent elbow. The body bobs twice per stride (lowest on contact).
- Hands are mitten shapes with a thumb, oriented along the forearm; when holding things, fingers wrap the object and overlap its edges.
- **Holding a phone up to read, with both hands** (seen from the back of the phone): the palms are on the phone's back and the thumbs reach round to the screen, so we see the backs of both hands over its lower half. Each hand leaves its cuff along the forearm, bends in at the wrist, and lays its fingers across the back at about 30°, so the two hands **cross**: one hand's fingers form the upper band, the other's lie over them lower down. A hand is about as wide as the phone; the fingers reach the far edge. Forearms rise almost straight from below.

## Hands, in practice
- Draw a hand as **one silhouette**: the back of the hand plus tapered, slightly curved fingers (`curvedFinger`, `drawHand` in `app/src/kit/things.js`), outlines under the fills so only the outer edge shows; thin lines part the fingers, a crease marks each middle joint, nails only on the back of the hand.
- A hand is always **attached**: a sleeve or forearm runs from the wrist out of frame or to the body. A floating cuff reads as a prop.
- Shade a hand like the face (screentone away from the light); a hand on top casts a soft tone shadow on the one below.
- Holding things: fingers wrap over the object's edge; a fist round a pen shows three finger creases and the thumb across the front (`fist`).

## The supporting cast
- One parametric bust (`person` in `app/src/kit/people.js`) in the hero's construction; only hair, clothes, skin and props vary.
- Variety comes quietly, as in a real office: skins `skin`..`skin5` (fair to light brown), hair `hair`/`hairBr`/`hairBl`/`hairAu`/`hairGr`, and about one woman in three. Never a single "token" figure set apart from the rest.
- Women (`fem: true`): a slightly narrower face, a lash flicked out at each eye's corner, a touch of rose on the lower lip, gold drop earrings when the ears show. Hair `bob`, `ponytail` (the tail over her right shoulder), `wavy` (the long Mucha fall, one shape over the shoulders behind the face) or `bun`.
- The code reviewer is the Unix greybeard: `hair: 'unix'` (receding, parted, long to the shoulders) with `beard: 'unix'` (full, salt and pepper, a walrus moustache over the mouth, ragged bushy brows), and a hard-disk platter for a halo (`platter`).

## Animals
- The horse (`horse`): a barrel with chest and hindquarters, an arched neck with a mane along the crest, a wedge of a head with an ear and a forelock; front legs bend at the knee, hind legs at the backward hock; legs taper towards dark hooves.

## Line, colour, tone
- Heavier contour on the outer silhouette, lighter for folds and features. A fold is one long curved line, not many.
- Clothes: one flat colour, one lighter shade for edges (rim, cuffs), screentone for the shadow side.
- Skin: flat light tone, screentone on the side away from the light; a touch of rose on the cheek in daylight. The hero's tone is fixed; the supporting cast uses `skin`..`skin5` (fair to light brown), each with its own dot colour.
