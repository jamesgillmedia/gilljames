# _sketch plan

Scope: this builder owns only `u4-opus-m4/_sketch/` (`opener/` and `objects/`). Nothing outside it is edited. m4's code and media are read, and copied or referenced by relative path. Work goes straight to main with `git pull --rebase` before each push. `PROGRESS.md` here gets a row per push with the SHA.

Standing rules, all from the briefs: no private images, no invented text or facts, never link to YouTube, motion identical with Reduce Motion on (no reduced-motion branch anywhere), tested at a 390x844 touch viewport and in landscape.

## What I read

- `_sketch/objects/index.html` at 1f65e97. A gallery layer over a CSS-3D "world" of planes, a pinch-depth transition between the two, Option 1/2, tilt, mouse fallback, and a debug panel with look controls.
- m4 `PROGRESS.md` and `_spec/`.
- m4 `js/sky.js`:
  - star glow sprites: `buildGlow` and `star()`;
  - the mark: `STROKES`, `markPair`, `drawMark`, where the mark's points become the constellation nodes;
  - arrival layers: `water`, `moon`, `path`, `horizon`, `dust`, `poem`;
  - the opening pinch: `OP`, `opMove`, `opLayers`, where each layer follows the pinch at a different rate;
  - `rippleAt()`.
- m4 `js/depth.js`: the near-lens bokeh sprite and `drawFx`.
- m4 `css/sky.css`: `.water` (photo `media/v2/img/hero/water-1600.webp`), `.rip` ripples.
- `data.json`: the verbatim poem lines and the five chapters with their tints and card counts.

Honest finding: m4's arrival has the water photo, touch ripples, dust motes and the bokeh sprite. It has no falling snow. The sketch adds snow in the same style (seeded, copied-in canvas drawing), and I'll say so in the report.

## Opener goals (`_sketch/opener/index.html`, standalone, not integrated into m4)

1. Dark sky, stars, m4's glow sprite, then the ᑕᐣᓯ mark drawn from m4's `STROKES`. Nothing starts by itself.
2. A pinch in (or wheel / drag on desktop) scatters the mark's stars to seeded random positions, a more severe look, then they form one verbatim line from m4's poem, then they settle into a constellation. The constellation is five clusters in m4's chapter tints, sized by the real card counts. Pinching back out reverses it. The same seed gives the same result every time.
3. The living snow-on-dark-water layer rides on the scatter: the water photo, falling snow, near-lens bokeh and ripples. While pinching it is gentler and travels with the zoom. A tap or drag gets its own, stronger reaction: ripples, snow swirl and bokeh answering the finger.
4. A tap skips ahead, a pinch drives it freely, and there's no auto-start.
5. The debug panel also has scatter strength, snow-water on/off and seed.

## Objects goals (`_sketch/objects/index.html`)

1. Two objects, `#cup` and `#scoop`. The scoop uses four images: the two nov9 object photos, `388e4910-960.webp` and `0f25314d-960.webp`. Orbit layers are the in-hand, frontal and side shots; the on-the-paddles photo is the context card.
2. Each object has two layers. The gallery is on top, styled like the m4 object gallery. Under it is the 3D constellation: photos and process shots as planes in depth. One finger orbits, two fingers resize, and a phone tilt gives gentle parallax. Touch wins while a finger is down, there's smoothing, and the mouse is the desktop fallback. Tilt sits behind a small quiet "tilt" button in the top bar (confirmed by Gill). Only a deliberate tap on that button calls `DeviceOrientationEvent.requestPermission` (iOS) and turns tilt on; a second tap turns it off. There is no automatic prompt on the first touch, during an orbit, or anywhere else. The on/off state is kept for the session (`sessionStorage`); on reload a remembered "on" just listens again without asking, so on iOS, where the grant is not kept, the button stays off until tapped.
3. Pinch in or tap goes from the gallery into the constellation. Pinch out, ‹ or Back returns to the same gallery spot.
4. Option 1 (default) is gallery-first. Option 2 lands in the slowly spinning constellation first, and pinch out goes to the gallery. The choice lives in `?opt=` and is changed only inside the debug panel.
5. Review of 1f65e97 against the brief. To fix or finish:
   - icon size is in px (8–32) but should be 50–200% with a px readout;
   - the "title size" slider becomes "text size";
   - a visible small corner tab is needed to turn debug on (today it's a hidden triple-tap);
   - grain steps at about 24fps, and it should run every frame at 60fps;
   - check the debug panel against the style spec (frosted 20–30%, rest fades to 15% while dragging, centre detent, double-tap reset, dock position);
   - confirm that the scoop planes, the context card, Back and history behave at 390x844 and in landscape.

## Debug panel (both sketches, the only place options live)

- A tiny corner tab, or `?debug=1`. It's tucked away, pops open in about 250ms with ease-out, and slides away after about 3s idle or on an outside tap. It never blocks the sketch while closed.
- Readouts: phase, layer, option, pinch depth, scale, fps, and the rest from the 939 brief (touches, gesture, dpr, viewport, Reduce Motion).
- Option 1/2 toggle (objects). Scatter strength, snow-water on/off and seed (opener).
- Sliders with 0.1 steps and a typed 2-decimal box: icon size 50–200% (`?icon=`), text size, Brightness and Contrast -100..+100 with a centre detent and double-tap reset (`?br=`, `?ct=`, applied to the rendered view only), and Grain 0–100 (`?gr=`, a 60fps overlay on the view only, never over the panel).
- Arrow keys nudge one step, shift+arrow ten. A fine-grain dial eases in beside a grabbed slider and fades out about 1s after release.
- Style: thin, translucent, sky-coloured, a hairline track and a soft-glow thumb. The panel is frosted at 20–30%, and the rest fades to about 15% while a slider is dragged. It docks bottom-right in landscape and is a short bottom sheet in portrait, clear of the centre and the top bar.
- A link to `../../_versions/` (the build viewer, `u4-opus-m4/_versions/`) inside the panel only.

## Order

1. PLAN.md (this file), pushed first.
2. Objects review fixes, then the opener built on a copy of the same debug module.
3. Test at 390x844 touch and landscape, with `prefers-reduced-motion` emulated (compare against the normal run).
4. A PROGRESS row and SHA per push.

## Later additions

- Tilt button rule above (replaces the earlier "permission on first tap").
- Objects coverage survey: `objects/OBJECT-COVERAGE.md` (work in progress). Only objects with real multi-angle photos get a 3D (2.5D) layer; the rest stay gallery-only.
- Flash group in both debug panels (star flash, ambient flash, test beat BPM). Both default to 0.
- Objects 3D: five-object angle-ordered ring (cup, scoop, dark, unfired, ashy), select switcher; tap in the gallery orients to that view.
- Sound sketch queued after objects: `sound/DIRECTION.md` first, then build.
