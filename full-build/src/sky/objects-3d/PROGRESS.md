# objects-3d · progress

LOCAL-ONLY prototype of the Objects chapter in 3D. Branch `objects-3d-proto`. Never merged to main, never deployed, no PR.
Only `objects-3d/` is written; every other folder is read-only.

## preview-objects-orbit (Nov 14): camera logic, orbit, the room (PROTOTYPE ONLY, not merged, not wired into any nav)
Gill asked for the same camera logic and a gentle orbit here, "most opaque and refined", "just you and it, alone in a room". This overrides the Nov 11 "no orbit / no room" note for this preview only.
- Camera: site-3d `sstep` springs and weights (`W_REL 9.5`, `W_FLY 5.6`, `W_GLIDE 4.6`, `W_SOFT 3.2`; Reduce Motion 14 / 9 / 8 / 6), FOV 60, fable-m4's 960 ms push (peak scaled to a breath), moon-opener exponential lag. Stop-to-stop moves now ride the `W_GLIDE` spring instead of a fixed tween.
- Orbit: drag or one finger orbits the object (yaw +-0.62 rad, pitch +-0.36 rad, soft walls, slow inertia settling on `W_SOFT`), very slow idle drift after 3.5 s (off under Reduce Motion), frames are shrunk so the clamped orbit never leaves the room. Pinch / wheel / tap stay the one-stop dolly. `0` settles the orbit.
- Room: solid opaque `#050507`, no stars, no washes; the warm light behind the cutout is quieter; hairline type; chrome recedes while you hold the object. Photos are never tinted or dimmed.
- Changed on purpose: horizontal swipe no longer changes specimen (drag is the orbit now); use the side chevrons or ArrowLeft / ArrowRight. Back at the first stop settles the orbit, then leaves via browser history if there is any.

## preview-objects-orbit, version C rings + planet (Nov 14)
`index.html` now opens version C of the live tonight objects room: `js/c-media.js` is tonight/objects `js/media.js` (window.OBJ_C, rings and board) and `media/{r,cup,board}` plus `js/glb.js` are copied intact (the joio cup GLB is byte-identical).
No ice cream scoop mesh exists in the repo on any ref (only `joio-cup.glb`), so the scoop ring is its photographs; nothing was invented.
Flow: rings -> object orbit -> planet.
- Rings stay as C has them: glide ring to ring (swipe, arrows, chevrons), through a hoop (tap, pinch in, Enter), deeper layers are smaller hoops down the same axis.
- Inside an object the camera spins and orbits around that object (drag; wide yaw, +-1.0 rad pitch, slow inertia, site springs 9.5 / 5.6 / 4.6 / 3.2, FOV 60, 960 ms push). Photographs face you while you orbit; the mesh cup is orbited for real.
- Pinch out (or wheel away) from an object enters the planet: a vast spherical world you are inside, drag turns the whole world around you and the object (unbounded yaw, +-1.2 rad pitch, curved horizon). Pinch in, Back or Esc return to the object. Back / Esc then rise layer by layer and out through the ring.
- Pinch out from the ring view, or once more from the planet, reaches the constellation (tap a star or pinch in to return). Red mode dot (images true colour by default); Reduce Motion: no idle drift, no inertia, no push.
The earlier specimen viewer is `specimen.html`.

## Open it
```
sh objects-3d/serve.sh        # then http://localhost:8765/objects-3d/
```
(ES modules need http, so `file://` will not run it. A GitHub raw/jsDelivr link serves the HTML as text/plain, so there is no hosted preview.)

## Direction history (latest wins)
1. Nov 11, first brief: floating objects, orbit of process shots around a hero, Spirit Eye camera flights.
2. 4:31 PM: orbit rejected. Straight move deeper along one axis, per-layer presentation swappable. (Nothing of the orbit was built.)
3. 4:32 PM (current): **SPECIMEN**. One clean shot on a dark ground, like a museum case. No orbit, no stage, no room, no plinth.
   Details are separate layers cropped from real photos, one detail per gesture. One gesture to the next specimen is a simple dissolve,
   structured so it can become a camera glide. The "concept doc" mentioned in the 4:32 message was not attached to the run, so this
   build follows the text of the message only.

## Visual fixes (Gill approved Nov 11, 5:35 PM)
1. **Cutouts** (`tools/cutout.py`): rembg (u2net, local) plus a hand-placed silhouette polygon and a skin-colour clean-up along the edge, so no wall and no hand remain. Webp with alpha, EXIF dropped. Done for the whole-piece shots: cup IMG_5841 (`media/joio-cup/cut-IMG_5841.webp`) and scoop SCOOP-03 (`media/scoop/cut-SCOOP-03.webp`; the handle is held by fingers, so it stops just below the collar and fades out). The cup's right edge where the thumb overlapped is a clean cut along the cup; the rim's white glints near the top were clipped.
2. **Light**: warm pool of light behind and under the piece, plus a soft contact shadow (cup sits on it; the scoop floats above a fainter, lower one). `cutout` in `js/presenters.js`.
3. **Ground**: deep aubergine-to-ink vignette in CSS, three faint colour washes from Spirit Eye's sky (blue, purple, teal) also in CSS, and a thin static scatter of stars in three.js that the dolly moves only slightly. Nothing moves by itself.
4. **Surface, making, use**: photos now have soft feathered rounded edges (alpha-mask frames, `soft()` in `js/presenters.js`), surface crops slightly larger. The shop slot stays an empty outline.
Kept as asked: 13 making stops with the paddle photos, the drink shots under use. IMG_1342 and the private stems are not used. Before screenshots and video: `_qa/before/`; side-by-side: `_qa/compare-*.jpg`.

## How it works
- One axis per specimen: every photo is one **stop**; the layers are runs of stops: whole piece, surface, making, use, shop. A layer with no real photos is skipped.
- Moving one stop = a straight camera dolly along z (`js/moves.js`), frames cross-fade so only one frame is ever visible at a stop. Nothing from another layer shows at rest.
- Label (top left) is always `<specimen> · <layer>` plus `n / total` inside a layer; caption (bottom) is the repo's own caption + the file stem. Home is always on screen; Back is on screen from the second stop.
- One gesture = exactly one stop. While a move runs, further gestures are ignored (no queue, no overshoot, easing never leaves 0..1).
- Gestures: in = pinch in, wheel/trackpad toward, Enter, ArrowDown, tap. Up = pinch out, wheel away, ArrowUp, Backspace, Escape, Back button.
  Next / previous specimen = horizontal swipe, ArrowRight / ArrowLeft, the side chevrons. Home = Home button or Home key.
- No auto-advance, no idle motion (the scene renders only while something moves), no audio, no YouTube. `prefers-reduced-motion` is never read.
- Swap points (each in its own file, nothing else needs to change):
  - `js/presenters.js`: how each layer looks (`PRESENTERS` map, one entry per layer)
  - `js/moves.js`: how the camera travels between stops of one specimen
  - `js/transitions.js`: how one specimen gives way to the next (dissolve now; every specimen already sits at its own x, so a glide is a camera x tween)
  - `js/data.js`: the only file that names photos, titles and captions

## What each layer shows (all data from the repo, see header of `js/data.js`)
**joio cup** (25 stops)
- whole piece (1): IMG_5841, the approved hero (`_sketch/objects/rings/joio-cup/06-three-quarter-IMG_5841`), as a cutout in the light
- surface (4 details, crops): IMG_5841 glaze, e2aa7ba0 (close on the speckled wall), IMG_5892 interior, IMG_5901 interior and rim
- making (13): the file-counter order of the real shots: paddle close grain IMG_0183, single paddle IMG_0346, IMG_2351, IMG_2401, long dark paddle IMG_3497, IMG_3506, the empty-cup burst IMG_5881 / IMG_5892 / IMG_5901, then shots with no counter: 2528243E, 1724F546, hand-carved piece (carve), carved spoon (spoon)
- use (6): cup with a drink, in order: IMG_0952, IMG_5925, IMG_6136, IMG_6166, IMG_9126, 16B39E13
- shop (1): empty slot, labelled `joio cup · shop`, no price, no button, no link
**ice cream scoop** (5 stops)
- whole piece: SCOOP-03 (front view of bowl and handle join), as a cutout; surface (3 crops): bowl interior and side of the bowl (SCOOP-03, SCOOP-04), charred ridged handle (SCOOP-03); making: skipped; use: skipped; shop: empty slot

## Skipped / flagged because the repo has no real data
- Making and use for the scoop: no process or in-use scoop photo exists. The context still (scoop on paddles, "for scale") and the in-hand three-quarter (0456C57F) are not process or use, so they are not shown as such. 0456C57F and the context still are unused.
- Other rings sets (ashy-bowls, dark-glazed, unfired-clay): not added. The manifest says each is several different pieces, not one piece.
- Cup underside/foot, handle, clean context shot: none exist.
- IMG_1342 (ring #10, overhead interior) was not used for the cup: its cup looks different from the others (the contact sheet marks it with a "?"), so it is left out until Gill confirms.
- IMG_5841 / 5881 / 5892 / 5901: only these burst frames are in the repo. 5843, 5882, 5884, 5893, 5902 are not (the contact sheet's extra stills were not found anywhere in the repo).
- Capture timestamps do not exist (EXIF is already stripped upstream), so "real order" = the camera's own IMG_ counter, files without one after.
- Scoop surface crops come from 960 px sources, so they are soft when full-screen.
- Browser Back (history) is not wired to one layer up; the on-screen Back, Escape and pinch-out are.

## Calls for Gill
- Paddle and carved-wood photos are in the cup's **making** layer because the brief says to; the repo does not say the paddles were used to make this cup.
- The latte / drink shots are in **use** (they show the cup in use). The brief listed IMG_6136, 6166, 9126, 16B39E13 as process shots; moving them to making is a one-line change in `data.js`.
- Making layer has 13 stops; one gesture each is long. Say if some should go.

## Log
| step | what | commit |
|---|---|---|
| 0 | branch, folder, this file, real media (re-encoded, EXIF/GPS stripped), media build script | db4a854 |
| 1 | specimen viewer: dark ground, one photo per stop, dolly between stops, dissolve between specimens, HUD, gestures, QA script | 506f9c7 |
| 2 | QA: screenshots of every layer at 390x844, 844x390, 1440x900, 57 checks pass, screen recording, this file | 522b148 |
| 3 | visual fixes: cutouts, warm light and contact shadow, deep ground with haze and stars, soft-edged frames; wheel lock fix; QA re-run (57 checks pass), before/after screenshots | see git log |

## QA (`_qa/`)
- `qa.py` drives real input (CDP touch pinch/swipe/tap, mouse wheel, ctrl+wheel, keyboard) at 390x844 touch, 844x390 touch, 1440x900, each also with Reduce Motion emulated. 57 checks pass (`qa-log.txt`): layer order, 25 and 5 stops, exactly one stop per gesture, rapid repeat = one step, up lands on what you came from, specimen swipe, Home, no console errors, Reduce Motion gives identical steps.
- Screenshots (after the visual fixes): `_qa/phone-390x844/`, `_qa/landscape-844x390/`, `_qa/desktop-1440x900/` (first stop of every layer, plus second and last of surface and making). The same set from before the fixes is in `_qa/before/<viewport>/`; `_qa/compare-<viewport>.jpg` puts them side by side (top before, bottom after).
- Recording: `_qa/objects-3d-walk-phone-390x844.mp4` (before the fixes: `_qa/before/objects-3d-walk-phone-390x844.mp4`) (software GL in headless Chrome, so the frame rate is low; not a phone-hardware check). Because that environment can stall frames for 100-200 ms, the wheel/trackpad lock is measured at the page, and the haze washes are CSS so they cost no fill rate.
