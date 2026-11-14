# Film room · progress

Playback media for this preview is `tonight/media/film/<slug>/` (URL `/media/film/<slug>/`).

## TODO

The full-length player files need real hosting, not YouTube and not Vimeo: Weird Kid `player-1080p` (2048×1080, 144–184 MB) and One With the Devil `player-720p` (1280×720, 81–148 MB). The H.264 masters are over GitHub's 100 MB limit, so this preview stands in with the muted 720p hero loop (`loop-720.*`).

## Film room package

Featured order is One With the Devil, Weird Kid, Back to the Start, Backward Fall, BMW Legends. A board three or more columns wide gives One With the Devil a 2×2 lead tile when that lead and one more row fit in the window. A short landscape phone keeps it a single cell, so the sixth film stays on screen. Featured films open in the stills player (`js/filmplayer.js`): local stills dissolve, then role, awards, and the other featured cards. The board and any work without stills keep the muted codec ladder (AV1, then VP9, then H.264). One With the Devil does not use its AAC clip as the hero. Weird Kid stays featured second; its 6.51s 1366×720 muted loop remains the board stand-in.

## Sketch nav and motion

The About calibre layer (stars gathering into the mark, and the 09_landscape thumbnail on desktop) is deferred to the Fable 3D pass, because that pass owns the sky depth and the stills that would have to move with it.

The player is a full-size state. A slim To Go bar sits under Film at full brightness. Tapping it grows the player from the touch point once the first still is in. A downward swipe shrinks it back into the bar, whichever point the film grew from. A featured card grows the next film from the card the same way. The entrance bokeh is capped. The mark steps up one level. The drawer is the separate control beside the mark. Esc on the sky leaves for the hub. A/B/C stays hidden unless `?dev=1`. Titles and Film chrome (Hire, role lines, the now-playing pill) use `#e8e4dc`. Reduce Motion keeps the same 1.2 s dissolve. Backward Fall carries the Leo Award for Best Production (2014, producer). Back to the Start stays `Co-director · Cinematographer · Producer`.

## Spaces · drawing mat, captions, and the hint line

On a phone, a plant caption hangs under the photograph on a dark plate `rgba(4,7,11,.82)` in `#e8e4dc`. The photo keeps true colour (`keepTrue`) and draws after the additive shafts, so Red still lights plan lines and fibre ends and leaves the photographs alone.

The ecosystem card on a narrow screen ends above Back and Next, scrolls inside itself, and fades its last line.

Plan drawings sit smaller on a `#04070b` mat with a soft vignette. The dev row `gj.spaces.line` is `sheet` (the launch look) or `night line` (warm-white lines on the mat). Red keeps its own linework either way.

Gallery sheets and the drifting tiles fade in from `#04070b`. One hint line reads `the mark closes the sheet · next wraps to the start`, then leaves. The mark and crumb keep a `#04070b` text-shadow so the top bar stays readable over the garden.

`tonight/fable-m4/versions/se-a/` carries the same sheet, caption, card, and fade. The live room is `tonight/spaces/forest-garden/`.

The gallery Back control is inset past the mark. Back, Next, and the hint line sit above the To Go bar. The top scrim is darker in Red so the bar stays readable. Red lights the plan lines and the fibre tips; the fibre bodies keep their own colour. The lens glow is smaller along the shaft, and Red does not repaint the clear colour or the fog.

## About · drawer closes first, and the fold matches the mark

While the drawer is open, arrow keys, Escape, the wheel, and Back close the drawer and leave the room where it is. A tap outside is swallowed so it does not also step the room. The camera keeps the pose it had when the drawer opened.

Layer 1 words sit on a `#04070b` plate. Leaving the moon pauses the tiles, hides them, and shows the board through a clear exit, so the bright moon wall does not flash on the way out. The sky canvas fills `#04070b` before it draws.

Drawer A is the default: no scrim, a hairline off the mark, and the room stays visible. B and C are dev toggles (`?dev=1`). B is typewritten labels on one hairline, with no panel behind the room. C is the current room's labels only; a label opens its slider, and sky labels that would sit under the drawer are not drawn. Slider tracks are 55% of the row. Dev defaults off.

Constellation (A) is the public drawer in every room. A page with no query string opens A, and a public `?v=B`, `?v=C`, or `?drawer=` stays on A. B and C are archived behind `?dev=1`: the dev toggle, or `?drawer=` / `?v=` on that same load.

The mark, the name, and the chapter labels are `#e8e4dc`. The To Go bar stays at full opacity. The sky grows its player from the touch, and a swipe shrinks it back to the bar. Film grows its own from the tile once the first still is in, and a swipe returns it to the bar. Sound is already that player. Every other room keeps the bar. Reduce Motion keeps the drawer's end pose and drops the transition. Touch glow is skipped on the film board and when bloom is high, and it draws over the scene instead of adding light onto the photographs. The safelight layer is `z-index: 55`. The calibre star layer stays deferred.

## Night chrome

The sky bar mark is `#e8e4dc` with a dark shadow, so the cyan fringe is not part of the chrome. Sound's mark, crumb, and now-playing title use the same warm white. The To Go bar stays at opacity 1, including while it is shown over a room. The bar `_tn/togo.js` injects uses `#e8e4dc` as well. `proto-shell/_qa/chrome-accent.js` samples the sky, Film, Sound, Objects, Photo, About, and Spaces, on phone and desktop, and fails if a nav, mark, active label, toggle dot, or dial dot pixel is mint or teal. It does not sample the canvas or the photographs.

A pointer on the film player sheet does not also step the sky. The swipe that shrinks the player listens in the capture phase and stops there.

## Fable 3D pass

Red mode stays selectively true to colour. The environment and the menus go red on black. Photos, film frames, video, track artwork, and anything else that needs its real colour stay true. The incoming environment has to make that contrast fire, not wash it out.

The Tesla Roadster UI is a mood, not a copy. 3D wireframe, floating text with depth, and the fighter-jet cool factor grow out of his own constellation and sky work.

The About calibre layer stays deferred to that pass.

## Reel card · frame rail

Under the Demo Reel card, the current shot's own frames sit in a rail at full brightness; the selected frame is a 1px warm-white line. `tools/extract_reel_frames.py` cuts evenly spaced 96x56 webp thumbs per clip (6 to 12 frames, `media/pro2/reel/frames/`) and writes `js/reelframes.js`. While the reel is paused (a tap on the card, or the stored board pause from the header band), a horizontal drag on the rail steps the shot frame by frame and the card seeks its clip to that frame. A drag above 1200 px/s rolls into autoplay from that frame. Works in fill and fit. The rail only claims horizontal drags and never calls `preventDefault`. Pause on the card is now a real pause (the clip stops) and shares `GJ_PLAY.paused`.

The rail is directional. A drag faster than 1200 px/s (finger moving left = forward) turns it into a jog wheel: the signed velocity sets a signed playback rate (capped at 4x). Forward uses the clip's own `playbackRate`; backward steps `currentTime` down every frame, since video cannot play in reverse. While the finger is down the rate follows the velocity; holding it still drops back to frame scrubbing. Released while moving forward, the rate eases to 1x and the card is playing again; released moving backward, it eases to a stop and stays paused.

## Film player for every film, one pause, one rail

Pinching into any film card now lands on its film with the featured player (`js/filmplayer.js`) mounted. Before, `depth.js` only mounted it for the five films with a curated `stills` list; the other 32 films and the Demo Reel opened a different page. The hero is the film's loop (poster, then the AV1 / VP9 / H.264 ladder from `playback.js`; 720 for the featured films). A film with no loop file (Hike, REEL '24) opens on its still. The 16 untitled Nov 9 set stills on the board are stills, not films: they keep their single-still view.

The player is a scrolling sheet: picture and frame rail first, then the stills, then credits and awards, then the featured cards. It used to be `overflow:hidden; touch-action:none`, which put everything below the fold out of reach. A pull down from the very top (touch) or a drag down (mouse) still shrinks it into the To Go bar. Vertical pans are the browser's; the rail and the sideways swipe use the horizontal ones.

The Demo Reel opens in the same shell (grow-from-card, To Go bar, stills, featured), its card as the hero.

`js/framerail.js` is the one frame rail (scrub, shuttle, reverse by stepping `currentTime`). `tools/extract_loop_frames.py` cuts its thumbs for the film loops (`media/loopframes/`, `js/loopframes.js`); `tools/extract_reel_frames.py` does the reel shots.

One pause: `GJ_PLAY.paused` is read by the board tiles, the player (tap on the picture toggles it) and the reel card. Opening a film while paused opens it paused with the rail armed.
