# Horizon film room · reel v2 (local build)

Local only. Nothing was pushed and git was not touched. Built in `/workspace/horizon-reel-v2/` as a copy of
`/workspace/horizon-reel/`. `horizon-reel`, `photo-lab-two-rooms`, `amb/`, `stills-zoom` and the lens room were only read.

**Served at:** http://127.0.0.1:8897/ (`python3 /workspace/horizon-reel-v2/tools/serve.py 8897`, with Range support for video)
**Open it:** Horizon → **films** button in the header (this used to say "stills").

## What it is

Amy Currell's reel (amycurrell.com), rebuilt in our own code and adapted for Gill's Horizon room:

- **The film fills the screen.** Whatever frame sits under the centre line is the picture, as a hard cut. Every item is **moving video**: muted, looping, `playsinline`.
- **Along the bottom is the analog touch bar.** It's a machined rail with a milled slot. A strip of tiny frames sits in the slot (sprocket edges, a dark gap between films), and a sheet of **glass** lies over it with a top-edge highlight, a soft angled reflection and no fingerprints. An amber **centre line** marks the playhead, and it turns cream when paused. An engraved lip on the rail shows the film title, the transport state (play / pause / stop / ff 2×) and the counter `017 / 201`.
- **Drag across the glass to scrub.** The strip moves 1:1 under your finger and frames flip as fast as you move. While you drag, only the posters show; the clip loads ~140 ms after you settle. Tapping the glass left or right of the line jumps to that frame. Dragging sideways on the picture, or scrolling with a wheel or trackpad, also scrubs.
- **Drift.** This strip only, as Gill approved at 2:34 AM. The strip glides on its own, and each frame takes **its own clip's length** to cross the line. Speed = 1 / dwell, where dwell is the clip length with a 1.5 s minimum. Short clips (0.6–1.5 s) loop once or twice and hand off quickly. Long ones (up to 6 s) hold. The strip loops forever, so after 201 it comes back to 001.
  Drift **stops** while you drag or scroll and while you're paused or stopped. It **eases back in** over 1.2 s when you let go or press play. It isn't affected by Reduce Motion.
- **Transport.** **Tap the picture** to play or pause, which pauses both the drift and the clip. The **dial** is the lens room v4.1 jog dial, restyled here (it's read-only there):
  - centre key: play / pause, with a red tally ring while rolling
  - ■ stop (top): stops and rewinds the clip
  - ▸▸ ff (bottom): 2× → 4× → 8× → 2×. Drift and clip speed both multiply
  - ⏮ / ⏭ (left and right): previous or next clip
  - **turn the knurled ring:** one 30° detent = one clip, clockwise for next
- **Pinch-in** on the picture (or ctrl / trackpad pinch, **Z** or **+**) opens the **stills-zoom index on that film**. **Pinch-out** at the index home (or its *out* button, Esc or −) now comes **back to the reel** instead of Horizon. **Pinch-out on the reel** goes back to Horizon.
- **Contact sheet:** the quiet **contact sheet** button (top right) and view **4** both open this film's clips as a proof sheet, with clip number and length. Tapping one returns to it in the reel.
- **Keyboard:** Space play/pause · ← → (and ↑ ↓) step · Z / + index · S sheet · 1–5 views · Esc back.

## Viewing modes (keys 1–5 and the engraved VIEW key bank; remembered in `localStorage` `gj-horizon-reel2-mode`; never switch on their own)

These replace the old fill / fit toggle.

| key | name | what it does |
| --- | --- | --- |
| 1 | **full** | Edge to edge, cropped to fill the screen (the default). On a wide screen, the three portrait films (Brew Bar, Fire, Canoe) stand at full height instead of being cropped in, which is Amy's rule. |
| 2 | **true** | The clip's own aspect ratio, letterboxed or pillarboxed above the rail. No crop. |
| 3 | **2.39** | One consistent **2.39:1** frame, centred above the rail, with each clip filling it. I chose 2.39 because it's the scope ratio most of these films were shot in (One With the Devil, Legends, Drift, Mandie, Repeat…), so most of them aren't cropped at all. |
| 4 | **sheet** | This film's contact sheet (see above). Tap a clip to return, which goes back to the last picture view. |
| 5 | **desk** | Real browser full screen (Fullscreen API, hides the browser chrome) with the full look. On phones it falls back to view 1 with a one-line note. Leaving the reel exits full screen. The browser only allows full screen after a key press or click, so if 5 is remembered it shows as full until you press 5 again. |

## Controls fade; the rail stays (Gill, 2:35 AM)

Everything except the bottom rail fades out **2.8 s** after the last interaction: the dial, the VIEW bank, ‹ back, contact sheet and the hint line. While the reel is open, the lab header and menus are hidden as before.
- Any pointer move, touch, key or focus brings them back. The first tap on a faded control only reveals it, so you can't press something you can't see. A tap on the picture still plays or pauses.
- Keyboard focus reveals them, and a focused control keeps them up. Controls are faded with opacity only, so screen readers still reach every button. Each one has an aria-label.
- With Reduce Motion, hiding and showing is instant instead of a fade.
- This is scoped to the film reel. The Horizon photograph line keeps its header so you can still reach the films button and the rooms.

## The side-drop view is gone (Gill, 2:35 AM)

The old Horizon **"stills" / side-drop view** was the films-standing-on-the-line layout from `horizon-reel`. With stills switched on, the Horizon line swapped its 67 photographs for **35 standing films**, one still each, sorted by light or colour, with a films contact sheet on pinch-out. You tapped a standing film to drop into its own stills reel.
That view is **removed as a selectable view.** The header button is now **films**, and it opens the full-screen reel straight away. The stored "stills on" flag is ignored, so the line always shows the photographs. The film view defaults to **full** (view 1).

## Media: 201 motion clips, all 35 films

- `tools/build_reel.py` cuts **201 clips** from the 35 films' local source files. It uses the scene-detected still timestamps in `stills-zoom/data/index.json` (read only), and each clip runs from that shot's start to the next detected cut (0.6–6 s, median 1.6 s, 351 s in total). They're H.264, ≤1280 px, 30 fps, muted, faststart, and come to **31 MB** in `reel/clips/`. There are posters in `reel/posters/` and a strip atlas in `reel/strip.webp` (16×13, 72×46 cells), and the data is in `js/reelitems.js`.
- **Why not the site's 201-shot set:** those are Reel 2026 and Demo Reel 2025 cuts only, so most films would be missing. This set has the same density, and every film is represented.
- Allocation is at least 3 per film, with the rest in proportion to √(frames in the film). They play in film-preview order, and each film runs chronologically except where a shot was swapped.
  Reel 2026 5 · Demo Reel 2025 10 · One With the Devil 15 · Celebraciones 3 · Stay Gold 3 · Legends 3 · Drift 5 · Golden Moment 3 · Cover With Love 3 · No Place Like Home 3 · The Smell Needs To Go 3 · Brew Bar 3 · Explorers 3 · Sun Kissed 3 · Sleepwalker 7 · Repeat 7 · Flower Crown 3 · Backward Fall 13 · S18 4 · Back to the Start 8 · Lets Grow Good Together 9 · Weird Kid 10 · Verona's Obsession 12 · Obedience 4 · Fire 3 · Modern Man 5 · Phantoms & Friends 8 · Summer Is Here 3 · Eat Well 4 · Buddy Time 3 · Canoe 3 · Mandie 10 · Just The Beginning 5 · Ltl Dstryr 10 · Journeys x Todd 5.
- **REEL '24** and **Wild Leaf · Hike** are **omitted**: they have no video and no frames locally.
- I eye-checked the atlas and swapped title and super cards (Bigger Together, Freshly Ground, There's a Brew, 100 Calories, Intermission, end logos) for the nearest real shot in the same film. Swaps are logged in `tools/swapped.json`.
- **Baked-in letterbox / pillarbox was cropped off** (`tools/cropdetect.py` → `tools/crops.json`, plus per-item crops for Demo Reel 2025, Just The Beginning and Journeys). That way **full** really is edge to edge, and **true** shows each film's real ratio. Reel 2026's navy constellation bars were cropped to its 2.39 picture.
- Titles are the existing film-preview / `LAB_STILLS` titles. Nothing was invented.
- **Child safeguard:** every clip and poster is footage from the 35 swept films, which Gill approved on Nov 12, 2026 at 1:43 AM (`/workspace/film-stills-full/APPROVAL-2026-11-12.md`). No posters or other images were added, so there was nothing new to child-check.
- No private photos, no Kaia, no YouTube or Vimeo, and no vidA.mp4 (none of the sources is vidA).

## Unchanged

The Darkroom and all **67** photographs, the Horizon photo line, sort, safelight, ambience, clips and video are unchanged, and the debug bar stays hidden. The word "hybrid" isn't used and there are no orbit layouts.

## Files changed vs horizon-reel

- `js/reel.js`: rewritten
- `css/reel.css`: rewritten (film sheet / index styles kept)
- `js/reelitems.js`: new
- `js/studio.js`: the films button opens the reel; the side-drop view is gone
- `index.html`: the films button, and the scripts
- `reel/`: new
- `tools/build_reel.py`, `tools/swap_supers.py`, `tools/cropdetect.py`, `tools/make_atlas.py`: new

## QA (this folder)

The run is headless Chromium, at phone 390×844 (touch), landscape 844×390 (touch), desktop 1440×900, plus phone with Reduce Motion. The results are in `qa.json`, and every view had **0 console errors and 0 HTTP 4xx/5xx**.
- Screens per view: `-idle-hidden` (controls faded, rail only), `-reel-playing`, `-scrubbing`, `-paused`, `-dial-ff`, `-dial-paused`, `-mode1-full`, `-mode2-true`, `-mode3-crop`, `-mode4-sheet`, `-mode5-desk`, `-contact-sheet`, `-pinch-index`, `-back-from-index`.
- Checked:
  - Drift moved about 2.3 items in 4 s untouched, with the video playing.
  - Controls were idle after 4 s and revealed by moving the pointer.
  - The glass scrub changed clips.
  - Tapping paused both the drift and the video.
  - ff went 2× and then 4× (video playbackRate 4).
  - next / prev and the jog ring stepped clips.
  - stop and play worked.
  - Modes 1–5 worked, and real full screen was true on desktop. The phone fell back.
  - A sheet tap returned to the reel at that clip.
  - Pinch-in opened the index on the current film, and pinch-out came back to the reel.
  - Tab revealed the hidden controls.
  - Space, the arrows and Z worked, and Esc went back to Horizon.
  - There were 67 photos before and after.
- Walkthroughs:
  - `walkthrough-phone.mp4` (390×844, 71 s, 2.0 MB): untouched drift with the controls fading, then reveal, glass scrub, tap to pause and play, ff 2× and 4×, the jog ring, next and prev, views 2 → 3 → 4 (tap back) → 5 (phone fallback) → 1, the contact sheet button, and pinch-in to the index and out again.
  - `walkthrough-desktop.mp4` (1440×900, 79 s, 5.8 MB): the same steps, with real full screen on 5.
