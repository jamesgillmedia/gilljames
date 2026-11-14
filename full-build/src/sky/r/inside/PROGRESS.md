# inside/ · progress

Read this first if you are picking the work up in a fresh run.

Live: https://jamesgillmedia.github.io/gill-sky/inside/ (GitHub Pages from `main`, ~1-2 min after a push).

## Rules (from Gill, via the brief; RULEBOOK.md + DESIGN-SPEC.md win)
- Work ONLY in `inside/`. Never edit `u4-opus-m4/` (another builder is in it), the repo root, `_sketch/`, `night-listening/` or any other folder.
- m4 is read at runtime, read-only: `../u4-opus-m4/data.json`, `js/nov9.js`, `js/frames.js`, `js/reelshots.js`, `js/joio.js`, its media and fonts. Nothing is copied.
- Commit + push to `main` after every small step; `git pull --rebase` first; never force-push. Update this file each step.
- Same palette / type / top bar / star glow as m4. No `prefers-reduced-motion` branch anywhere (motion identical with Reduce Motion).
- Never link to YouTube. Banned / held files are filtered in `js/data.js` (`BANNED`), plus vidA.mp4.
- No invented titles or facts: only m4's data. Two-tap rule: first tap selects (mint ring + title), second tap opens.

## Architecture
- `index.html`: m4's top bar markup (mark, chips, Reel / List / Contact, ‹), crumb, piece caption, mini-map. Three.js 0.160 from jsDelivr via importmap.
- `js/data.js`: loads m4 data, ban filter, m4's constellation shapes/angles (SH / ANG / ANGP) and placeChapter, plus a z depth per star.
- `js/app.js`: renderer, starfield, constellations, projected HTML labels, free camera (drag = drift, pinch / wheel = zoom at the touch point, twist = turn, shift/right-drag = orbit, inertia, eased flights), levels + history, two-tap picking, mini-map.
- `js/board.js`: chapter boards in the sky (stars fly into a dense grid).
- `js/room.js`: Inside rooms (camera passes through the piece into its room).
- `models/models.json`: GLB swap point for Inside (empty until the mesh-from-photos experiment delivers).
- `_qa/qa.py`: Playwright run, iPhone 390x844 + desktop 1440x900, Reduce Motion on/off, console errors + 4xx log, screenshots (to the gitignored `_qa/shots/`).
- `_qa/gestures.py`: real touch walk at 390x844 (CDP touch, no programmatic navigation): two taps at each level, pinch into Inside and out, ‹, browser Back, the mark; Reduce Motion on/off; records a clip.
- Kept artifacts: `_qa/iphone/*.jpg` (the gesture walk), `_qa/desktop/*.jpg`, `_qa/iphone-walk.mp4` (49 s, far sky to a room and back, then a song room).

## Levels and gestures
| level | hash | in | out |
|---|---|---|---|
| far sky | (none) | tap a chapter twice, or pinch/scroll toward it | - |
| constellation | `#film` | free flight sets it (replaceState) | pinch/scroll out, ‹, Esc, Back |
| board | `#film/board` | pinch deep into a constellation, or tap a star twice | pinch out, ‹, Esc, Back, double-tap sky |
| piece | `#film/<slug>` | tap a tile twice / pinch on it | same, one level |
| inside | `#film/<slug>/inside` | pinch in on the piece, tap it, or "go inside" | pinch out, ‹, Esc, Back: camera returns exactly where it was |
ᑕᐣᓯ mark and the mini-map fly to the far sky in one move.

## Log
| step | commit | what | next |
|---|---|---|---|
| 1 | `65960ee` | Milestone 1: free-floating 3D sky from m4 data (five chapters, in-progress ring, ᑕᐣᓯ centre, m4 glow/labels/top bar/mini-map), drift / pinch / scroll / twist / inertia, constellation level from free flight, QA script | boards |
| 2 | `3b33978`, `4735f9e` | Boards (`js/board.js`): m4 boardSpec layouts in the sky (film 2.39 staggered 2-up + title/role, photo masonry prints with tilt + cream mats, objects tiles + captions incl. Nov 9 after their object, sound dotted waveform labelled by song + m:ss, about verbatim bio + star rows). Stars fly from the constellation into their tiles; backing .62 so the sky is felt; drag scrolls with inertia; pinch out = up. Piece stop: tile fills the screen, neighbours dim, title/role/credits + 'open the piece' (m4 page) | Inside rooms |
| 3 | `d282ce2` | Inside rooms (`js/room.js`): from the piece the camera flies through a copy of its tile into a room behind it. Stills and clips on a ring facing you (clips lazy, max 3 playing, posters first), the piece straight ahead, the songs as stars (two-tap: select shows the title, second plays; a song's own room is its dotted waveform ring with a moving playhead). Stand-in forms for objects (lathe cup, spoon, slab, plinth) with a GLB swap through `models/models.json`. Pinch out / ‹ / Back returns the camera exactly to the piece | QA by real gestures |
| 4 | `9fab9da` | Real-gesture QA found and fixed: after a tap, the free-flight level check (current camera mid-flight) undid the level the tap had just set. Rooms: stills now placed in non-overlapping slots (rows above/below when full) and the whole ring turns together, so nothing drifts over the piece; portrait stills capped; smaller stand-in on desktop; smooth interpolated song ring; ring stills use 480 px thumbnails. Board: no floating title over a tile that already shows its caption; room hint fits song rooms | report |
| 5 | (this) | QA artifacts committed. Final runs: qa.py 4/4 runs and gestures.py 2/2 runs, zero console errors, zero 4xx | Gill's calls below |

## Stubbed / open
- Stand-in forms only; `models/models.json` is empty until real GLBs exist (drop `inside/models/<slug>.glb` and list it there).
- No service worker / offline cache yet (manifest only).
- No song is mapped to an object room in m4's data, so non-sound rooms show all songs as stars overhead rather than one chosen song.
- Not tested on a physical iPhone (headless Chrome with software GL only).

## Needs Gill's call
- Which song (if any) belongs in each object / film room.
- Whether photo pieces should have an Inside room (they currently do: the photo plus its neighbours).
- The stand-in shapes (cup / spoon / slab / plinth) and whether to show any form before real models exist.
- Held items stay out until Gill clears them.

