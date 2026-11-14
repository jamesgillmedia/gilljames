# about-calc · the About / bio calculator, 2D or 3D (proto-shell module)

    python3 -m http.server 8811 --bind 127.0.0.1 --directory /workspace/proto-shell-1112
    http://127.0.0.1:8811/?m=about-calc&at=about/board&v=A    2D, the m4 flat calculator as it is
    http://127.0.0.1:8811/?m=about-calc&at=about/board&v=B    3D object
    (or open the sky with ?m=about-calc and pinch into About → board)

## Source (port, not a rewrite)
gill-sky main 0d07fea, tonight/fable-m4/:
- js/sky.js 1948-2138: calcCrop, layoutCalc, paintGrain and the drawGlitch pixel body are byte-identical (checked by diff).
  paintBio, syncBio, enterMoon, bioDeeper, startMoonExit and bioBack are the same logic with the shell's ladder in place of m4 `cur`.
- js/layers.js: copied verbatim to ./layers.js (Gill's seven layers). No text was written for this module.
- css/sky.css 280-307: verbatim in calc.css, with #layers renamed #acalc.
- media/about/calculator.mp4 and moon-grid.mp4: byte-identical copies in ./media (md5 checked).

## Behaviour
- About BOARD (lv 2) = m4 about/bio. A tap goes one layer deeper (1 to 7, then the moon grid). ‹, Esc and double tap step back one
  layer, and from layer 1 run the m4 moon exit, then go out to About MID. Pinch-out leaves directly.
- A (2D): the m4 full-screen calculator: glitch canvas, grain, seven layers of words, rail, moon grid.
- B (3D): CSS 3D, preserve-3d planes, no library. It has a back, four sides, a bevel rim, the face, a recessed display well and four boxes.
  The sides show the face's own edge pixels stretched across the depth and are shaded by the light angle. The face is the same glitch
  canvas, cropped to the calculator band (video y 13-79%, no black bar, no camera pills). The display well is cut where the photo's
  green digits sit (measured: y 0.44-0.53 from 1 s on). Its floor shows the same glitched pixels set back, with layer 1
  ("I am Gill / I am James / I am an artist") on it. The four boxes hold real DOM text at depth offsets 2/3.5/5/6.5 px × depth/22:
  box 1 = layer 2 (the poem), box 2 = layer 3, box 3 = layers 4/5, box 4 = layers 6/7. Stepping deeper opens the matching box:
  it lifts 22 px, fills the face and scrolls.
- Drag = tilt on the 4:45 critically damped spring, w from tokens (9). It rests at a fixed three-quarter pose (0.42 × / −0.70 × tilt amount).
  A touch rings a ripple on the object. A tap, a second finger (pinch) and the wheel are passed to the shell camera.
- No prefers-reduced-motion branch: Reduce Motion gives identical states, poses and frame rates (results.json).
- Mint is not used. The 3D text is the cap #e8e4dc. The active toggle is #e8e4dc (the core mm-seg style).

## Tune
`M.tune` = four slider specs (gj.acalc.tilt 16, depth 22, light 330, gspeed 100). The core context-aware tune.js renders them
under "about · board here". The 2D / 3D toggle is injected into that section by this module, because core rowFromSpec has no
toggle spec. It drives the lab pills, so ?v= stays in sync. Glitch speed scales the glitch clock in both A and B. At 100 the
behaviour is m4.

## Core hooks (built into the core; the module's workarounds are gone)
1. Tune menu toggle spec: `{type:'toggle', k, label, options:[['A','2D · flat'],['B','3D · object']], get(), set(v)}`. The 2D / 3D toggle is the first row of 'bio here'.
2. `M.back()`: ‹, Esc, double tap, pinch-out and browser Back all ask it first (ladder.out, the pinch-out settle, popstate). A consumed Back puts the history step back.
3. `M.inAt()`: a pinch-in past the deepest stop (ratio 1.18, as m4's depth pinch), a wheel-in and Enter / + step a layer; the camera glides back to its stop.
4. `M.arrow(dir)`: Left / Right step layers while the calculator is up. Shift + Left / Right (and the A / B keys and pills) still switch A / B.
5. `M.tuneTitle(st)`: the tune header reads 'bio'.
6. README lists ?m=about-calc.
Red mode: the core theme maps this module's CSS (text, panels, rail) to red; the calculator's photo face, its sides, the display wall and the moon grid keep their real colour.

## Polish done
- Layer 1's words sit to the left of the photo's green digits (measured at 0.497 of the clip width) and are sized to fit there.
- The edge is cut: the face, bevel and back are chamfered octagons and four corner planes close the body behind the cuts.
- The closed boxes' 7.5 px text is left as texture on purpose until a box opens.

## Weight
module.js 26 KB, calc.css 10 KB, layers.js 5 KB: 41 KB raw, 14.6 KB gzip, no library. Media is 1.07 MB, the same two clips m4 ships.

## Frame rate (Chrome, emulation)
| | phone 390×844 @2 | phone, CPU 4× slower | desktop 1440×900 |
|---|---|---|---|
| A 2D idle | 60 | 27-30 | 37-41 |
| B 3D idle | 60 | 46-51 | 60 |
| B 3D while dragging | 60 | n/a | 60 |
Desktop A is the m4 code as is (full-width glitch pass + backdrop blur at 1440).

## Rough
- The well is fixed. The clip's first second each loop (19.5 s) is the wide shot, so the digits aren't in the well then.
- Layer 1 words overlap the photo's own green digits on the left/middle of the display.
- The four closed boxes use 7.5 px text (9 px desktop). It reads as texture until a box opens.
- The bevel is a lit rim gradient, not a geometric chamfer. The corners are square-edged where the sides meet.
- The 2D grain overlay is not on the 3D face.
- The 2D text #f4f7ef (m4 verbatim) is brighter than the #e8e4dc cap. The rail's on dot #e7f6c8 is also m4.
- Untested on a real device (Safari or S24). A video that a hidden element plays and a canvas draws is fine in Chrome, but iOS Low Power Mode may block autoplay.

## QA
_qa/qa.py (google-chrome for H.264; CDP touches on phone): A and B × phone and desktop × Reduce Motion off and on. Shots are in _qa/shots,
the contact sheets are _qa/00-about-calc-{phone,desktop}-sheet.jpg, and the clip is _qa/about-calc-3d-phone-drag.mp4 (11.5 s, 390×844).
_qa/pinch.py: a pinch-out over the 3D object leaves to About MID.
