# gill james v3.1 · the constellation one-sheet over The Dive

**v3.1 layer (js/sheet.js):** zoom all the way out and the whole site is one constellation over a true-black sky: ᑕᐣᓯ glowing at
the centre, five chapter constellations around it (film, photo, objects, sound, about). One camera: canvas for the sky (stars,
lines, ᑕᐣᓯ, travelling tiles) + a GPU-transformed DOM layer for near tiles + two compositor star-field layers for parallax.

| level | what you see | URL |
|---|---|---|
| L-1 | the whole site: ᑕᐣᓯ + five constellations, chapter names (44px buttons) | `#sky` |
| L-1 · chapter | one constellation, work names fade in (greedy declutter) | `#sky/film` |
| grid of everything | every work as a dense wall of tiles (tiny one-shot clips for films, stills for photo/objects) | `#all` |
| → L2 | pinch past a constellation: its stars travel along the lines and grow into tiles until they ARE the v3 grid (the column is lined up underneath, the sheet lets go) | `#film/l2` |

Pinch drives the camera continuously (anchored under the fingers) and snaps to a level on release. One finger pans the sheet; on
the column it scrolls natively. Tap a chapter = fly in to its grid. From a work (L3), pinch in = pull back through the frame into
the grid of everything; pinch in again = it resolves into the constellation. The Dive ends in a portal of the whole sky (tap/pinch).
`−` at a chapter's L0 = the whole sky. Reduced motion: the camera jumps, no clips. JS off: unchanged plain pages.
Tools: `_tools/atlas.py` (one unique still per work, 64 KB atlas), `_tools/clips.py` (23 tiny clips, 240px, 2.5 s, play once),
`_tools/sheet_test.py` (camera tests), `_tools/rec31.py` (slow-motion-safe recordings).

## v3 close-up layer (unchanged base)

One continuous sheet. Native scroll sinks you through the Moonwater water (the poem melts as lines rise past the top),
through five chapters, and up into the star sky. Each chapter is a constellation that zooms **in place**:

| level | what you see | URL |
|---|---|---|
| L0 | glyph + name + count (one 44 px row) | `/` |
| L1 | star chart: one star per work, with its label (one 44 px row each, labels can't collide) | `#film/l1` |
| L2 | the stars bloom into a dense grid of frames, still joined by constellation lines; muted preview loops play for frames on screen | `#film/l2` |
| L3 | the frame zooms up to full screen (Scope 2.39, ambient blur, chrome fades in): title, type · length, caption/credits `[Gill writes]` | `#film/w27` |
| ▶ | the film plays in the native Scope player from local files (media/films/NN: 720p parts < 25 MB, shots.json cut rail + strip; cut 2.39 ↔ full screen morph on rotation / ⤢). No Vimeo player anywhere; films without a local file (1, 2, 15, 31) show their still + "full film coming soon"; YouTube films still play in the frame | `#film/w27/play` |

Gestures: one finger = native scroll, always (the only blocking touch listener exists while two fingers are down).
Two-finger pinch = one level per pinch (out = in, in = out), anchored on what is under your fingers. Tap = one level into that item.
`+ / −` and `●○○○` in the dock, Back = one level out, moon = home. `list` = plain page. JS off = plain pages (`film/` … `about/`, `list/`).


Build: `python3 _tools/build.py` (reads the real data from ../gilljames-v2). Previews: `python3 _tools/previews.py` (cuts 3 s loops of each film's shots from Reel 2026).
Tests: `/workspace/.pwvenv/bin/python _tools/feel_test.py` (Chromium CDP touch + WebKit). Video: `_tools/record.py`.
