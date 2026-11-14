# Fresh sites v2 — fixes (Fri 13 Nov 2026, America/Cambridge_Bay, UTC-7)

Defaults: **Lost Coffee = B · Channel Strips**, **Artist = C · Trail Line** (no `?v` needed). The other directions stay reachable from the DIR toggle only. The localStorage key was bumped, so a browser that remembered an older pick still opens on the new default.

## 1. Artist C — overlapping images (top priority)

**Gate:** `_tools/collide.py`. On the trailhead and on every stop, it measures the boxes you can actually see (`getBoundingClientRect`, clipped by scroll containers and the viewport). It fails on any intersection over 0 px between two images, or between text/UI and an image. It checks:
- the trail as a whole
- the screen at each of the 5 signs, including the fixed wordmark row, profile, player and DIR toggle
- every stop, once per distinct view shape, at top / middle / bottom scroll

It runs at 8 viewports with Reduce Motion on. "Before" is the published 10:51 package (what Gill saw); "after" is this build.

| Viewport | Before: collisions | Before: where | After: collisions | After: where |
|---|---|---|---|---|
| phone 390×844 @2x | 175 | film, objects, photo, spaces, trail at stop 1, trail at stop 2, trail at stop 3, trail at stop 4, trail at stop 5 | 0 | none |
| phone 375×667 @2x | 237 | film, objects, photo, spaces, trail at stop 1, trail at stop 2, trail at stop 3, trail at stop 4, trail at stop 5 | 0 | none |
| phone landscape 844×390 @2x | 227 | film, objects, photo, spaces, trail at stop 1, trail at stop 2, trail at stop 3, trail at stop 4, trailhead (whole trail) | 0 | none |
| iPad 820×1180 @2x | 112 | film, objects, photo, spaces, trail at stop 1, trail at stop 2, trail at stop 3, trail at stop 4, trail at stop 5 | 0 | none |
| desktop 1440×900 | 76 | film, objects, photo, spaces, trail at stop 1, trail at stop 2, trail at stop 3, trail at stop 4, trailhead (whole trail) | 0 | none |
| desktop 1280×720 | 111 | film, objects, photo, spaces, trail at stop 1, trail at stop 2, trail at stop 3, trail at stop 4, trailhead (whole trail) | 0 | none |
| wide 1920×1080 | 74 | film, objects, photo, spaces, trail at stop 1, trail at stop 3, trail at stop 4, trailhead (whole trail) | 0 | none |
| car / wide-short 1280×480 | 271 | film, objects, photo, spaces, trail at stop 1, trail at stop 3, trail at stop 4, trailhead (whole trail) | 0 | none |

**What was wrong**
- Desktop, wide, car and phone-landscape trail: the two secondary pictures of Spaces, Objects and Photo were stacked half on top of each other, and the Film and Photo signs sat on their lead image.
- Phone and iPad trail: work scrolled under the fixed wordmark row, the trail profile, the player and the DIR toggle.
- Stops: the hero ran under "‹ trail", the stop label and the wordmark. Views ran under the fixed "next stop" button, the player and the DIR toggle.
- Flicking views quickly could leave two hero pictures on screen at once (seen at 375×667, Spaces).

**Fix**
- The trail layout is rebuilt as measure-then-resolve. Each stop is placed (sign, lead, caption, secondary pictures), measured, and any item that touches an earlier one slides along the walk with a margin. A stop that would reach the previous stop pushes the rest of the trail on.
- The work stays inside a cross-axis band that clears the fixed UI. The bands are measured live, so any viewport works, including car screens.
- After web fonts load, the layout runs again.
- Stop pages sit between the measured top and bottom bands. "‹ trail" and the stop label scroll with the page, the hero leaves room under them, and "next stop ›" is in the page flow (no longer fixed).
- Every previous hero image fades out, however fast views are flicked.

**Screenshots of the worst case** (car 1280×480, trail at stop 3): `qa/collide/before-car1280x480-trail-stop3.png` → `qa/collide/after-car1280x480-trail-stop3.png`. Phone 390 trail at stop 1: `qa/collide/before-phone390-trail-stop1.png` → `qa/collide/after-phone390-trail-stop1.png`. The full results are in `qa/collide/collide-before.json` and `collide-after.json`.

## 2. Sketch recheck items

- **N1 page zoom (all builds):**
  - `touch-action: pan-x pan-y` on html/body.
  - `none` on the pinch surfaces: LC A `#app`, LC B `#app` (home + solo), LC C board + veil, artist A view.
  - `pan-y` where something scrolls: LC C ticket, artist C walk/page, artist B.
  - The viewport meta was left alone, since it isn't needed. A two-finger spread keeps `visualViewport.scale = 1` on LC B home and solo, artist C trail and stop, and artist B. The control run proves the probe works: with touch-action removed, the same spread zooms the page 5×.
- **LC B swipes:** after a spread, swipe left/right still changes track.
- **N2 R.home (shared core, both sites):** after the `history.go(-d)` popstate, the router replaces to `#/` if the route isn't home, so a deep-link entry lands home. Tested on LC A/B/C and artist A/B/C.
- **N3 LC A:** the spread reads `tch.x` before resetting it, so it opens the track under the fingers (left → Lost in Time, right → ii).
- **N4 artist B:** a lifted print carries a live copy of the band wordmark in the same spot, so tapping it goes home.
- **N5 LC A desktop:** wheel-back works anywhere except over the dials.
- **M1 LC B:** every cover and plate is preloaded and decoded, the swap no longer fades from empty (the title slides in), and the solo fades in at once rather than after a 0.3 s delay. Measured stage brightness never drops below 60% of the desk through an open or a swap.
- **P1 targets:** every phone tap target is ≥44 px:
  - LC: ‹ desk, tear off ×, play buttons, ‹/› sides, links, dials, DIR, wordmarks.
  - Artist: next stop / back to the trailhead, ‹ trail, map, wordmark, B bands, DIR.
- **Clips:** encoded as yuv420p (TV range), no longer yuvj420p.
- **Images:** every image used by both sites was viewed. Doubtful images were removed (2 removed). No EXIF/XMP remains in any of the 157 images.

## 3. Not changed (awaiting Gill)
- The gold #e8c48a played-waveform accent, the ii plate and the lost-in-time-2 image.
- Deeper artist C development (trail content and structure) is on hold until Gill picks from the Sketch option board.
- Backward Fall caption-style wording (P2).
