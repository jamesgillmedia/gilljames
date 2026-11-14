# Beyond (prototype · `preview-beyond`)

Gill's brief: a "Beyond" option beside the red mode ring. When it is on, the galleries and the film board choose darker clips and different stills. Brightness is balanced by **selection only**: no colour, hue, tint, brightness or contrast filter is applied to any frame. True colour always.

Off is the default and is the site as written: the same order, the same stills, the same code paths. Red mode (`#themeBtn`, `js/theme.js`) is untouched.

## What it does

| Choice | Picks | Turning within it sweeps |
| --- | --- | --- |
| red | the darkest, warm / red-leaning assets | how deep the dark goes |
| colour | assets whose dominant hue is in one family | the hue family: rose, red, amber, gold, green, teal, blue, violet |
| light | assets nearest a light level | dark to bright |

Where it applies: the Film board (order and the still picked for each film, from that film's whole pool: poster, frames, clip sample frames), the Photo board (order), a film page's stills strip (which stills, in what order), and the stills board of a work.

## Metadata index

`tools/beyond_index.py` (offline; Python 3, Pillow, numpy, ffmpeg) writes `beyond-index.json`:

- `lum` mean luminance (Rec.709 on the display-encoded pixels), `hue` dominant hue (histogram weighted by saturation x value), `chroma` mean max-min, `warm` (R-B)/(R+B) of the mean colour.
- Every gallery still and every clip poster in `data.json`, Gill's Nov 9 stills, `media/pro2/frames/*`, and four sample frames per clip.
- Clip sample frames are plain decodes of the clip at 12 / 38 / 62 / 88 % (`media/beyond/samples/`). No filter. They are real frames and are used as alternate stills for that film's tile. The Reel 2026 clip is a montage wall, so it is skipped.

Re-run it after media changes: `python3 tonight/fable-m4/tools/beyond_index.py` (`--force` re-extracts the sample frames).

## One system with the camera (`docs/11-camera-logic`)

`js/beyond.js` moves every swap on `sky.js`'s own critically damped spring (`GJ_CAM.sstep`, exported by `sky.js`; `W_GLIDE` 4.8, plus site-3d's `W_SOFT` 3.2 and `W_FLY` 5.6) or the moon opener's exponential lag (`k = 1 - exp(-dt * rate)`, rate 3.4). The dial cluster moves on the same springs.

- An incoming frame starts **behind** the outgoing one at perspective scale `f/(f+z)` (f from the site-3d 60 degree FOV) and rises to 1; the outgoing frame passes the lens and drifts off its tile. Both stay opaque for the whole move. Nothing dissolves, nothing dims.
- **depth** = the sound dive's `ZLV` stops (.62 / 1 / 1.55 / 2.4) times 120 px. **drift** scales the spring weight (slower drift = longer glide). **easing** picks `W_SOFT` / `W_GLIDE` / `W_FLY` / the exponential lag. **orbit** adds a short yaw arc (0.3 rad) to the arrival; dolly (default) is a pure push along Z.
- Darker selections sink deeper (z x 1.35 at full dark) and drift slower (x .7 at full dark), so depth, drift and selection read as one system.
- Reduce Motion: the selection still changes, instantly, with no travel (the same policy as `sky.js`), and the dial cluster opens at its end pose.
- The Film board's video overlay (`playback.js`) waits while a swap travels and returns on the same stills, so the move is seen on the board's own pictures.

## The dial cluster (`js/beyonddial.js`, `css/beyond.css`; rules from `docs/10-dials`)

A hub sits beside the red-mode ring (bottom-left). Pressing it expands: Beyond (outer ring = four detents, inner ring = the sweep), depth, drift, easing, orbit / dolly.

- Boxless, with Z-depth (`perspective(240px)`, `translateZ` 18 px idle / 28 px expanded, stacked halos).
- Expand, snap-to-detent and contract all run on the selected spring; finger tracking is the exponential lag (14 mouse, 22 touch). There are no CSS transitions on the dial.
- While a dial is held, the rest of the cluster goes at once (no fade) and the active track stays at about 18%.
- The one fade is the hub's opacity, and only when it would sit over content (the open film page, the board window).
- The hub only shows on the Film and Photo boards and film pages.

## Try it

`?beyond=red|colour|light&bv=0..1` selects a choice from the URL; `&bdepth=0..3&bease=0..3&borbit=0|1&bdrift=.25..2` set the camera dials. State is kept on the device (`localStorage gj.beyond`).

`python3 tonight/fable-m4/tools/beyond_smoke.py [BASE_URL]` is the smoke check (needs Playwright and Chrome): console errors, each choice changes the selection on phone and desktop, the dial's detents and hold, no filter anywhere, Reduce Motion.

## Known limits

- The film page of a film that is not featured keeps its list order for the open page; Beyond reorders it the next time it opens (the featured pages swap live).
- On a page whose content sits under the hub (a phone film page), the hub fades out by rule; use the board.
- Images are picked, never edited: a pick can be nearly black or nearly white when that is what the choice asks for (frames under 3.5% or over 93% luminance are down-weighted).
