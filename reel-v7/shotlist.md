# gill james ᑕᐣᓯ · reel v7, "constellation"

73.2 s · 1080p 23.976 fps · built like gilljames.com: one continuous zoomable constellation. The picture uses only Gill's existing work. No AI imagery, no cedar, no Kodafy.
Music: Lost Coffee, "Lost in Time" (Gill's band; draft audio re-edited to 73 s), with a sound-design layer taken from Gill's own films, plus water ambience.

## Structure (follows the approved Open / Dive / Overload / Heroes / Close)

| time | section | what happens | sync |
|---|---|---|---|
| 0:00–0:06.5 | **1 Open** | First-cut opening (Gill's pick): bright Moonwater shader water with the crescent moon and the mint tilted GILL JAMES, then a continuous tilt up as the reflected stars rise into the constellation: ᑕᐣᓯ at the centre and five chapter stars (film · photo · objects · sound · about). Lines draw in, then labels. VO: "It's within me. It's in me." (19 Crimes x Malamen) | first hard hit at 6.52 |
| 0:06.5–0:12.5 | **2 Dive in** | Fly into FILM. Its sub-stars grow into frames, and each cut travels along a constellation line (the line lights up) into the next frame: Arc'teryx window light → Braun flare → John Frieda hair → Stay Gold flare | arrivals on 9.10 / 11.12 / 12.05 |
| 0:12.5–0:25.8 | **3 Overload** | The Stay Gold frame blooms into a 27×23 wall of 621 tiles, every one a different moment: 321 unique clips playing forward once, 170 of Gill's photographs, 130 held film frames. The tiles fly into the constellation's shape, then scatter as a 24×16 photo-and-clip wall arrives from depth; On the 20.07 hit the **BMW X7 Legends** tile zooms up to full frame (fog grille → front), with the narration "What are legends made of?", then pulls back out through the frame. Then an accelerating strobe of flash frames (stills and Tier-1 heroes), then a 15×9 wall where the BMW tile morphs from 16:9 to 2.39 and zooms up to full frame | 12.53, 16.52, 18.61, 20.07, 22.83 → 25.77 |
| 0:25.8–0:45 | **4 Heroes** | Full-frame hero footage hangs on a seven-star chain. Each pull-back goes out through the frame to the stars and dives into the next one: BMW Drift low → BMW headlights / AXE GM ropes → slam / AXE Stay Gold face (new 1080p source) / John Frieda gold → splash / Braun red ring / Braun chandelier / Arc'teryx coat. VO: BMW Drift "There are those moments where you are just one with a car." AXE GM "Push! Push! Push! Get up! Routine is everything." | 25.77, 28.36, 31.31, 31.79, 34.66, 35.78, 36.32, 37.87, 39.33, 42.07 |
| 0:45–0:58.6 | **3b Overload (ᑕᐣᓯ mosaic)** | A 48×27 mosaic of 1,296 tiles in which the bright tiles spell ᑕᐣᓯ. Then a dive into one tile → Tier 2 at full frame: Verona's Obsession candles → Allan Rayman fire → Hey Ocean tub → Weird Kid horse. The horse frame shrinks into a river of 8 rows of moving tiles, then a Tier-2 flash overload. VO: 19 Crimes "Create the way you want it, the way you feel, without hesitation." | 45.04, 47.61, 49.63, 50.56, 51.05, 55.03 |
| 0:58.6–1:04.3 | **Infinite zoom + recap** | A recursive wall zoom: each wall's centre tile contains the next wall, through three levels. Then a Tier-1 recap at 0.49 s per shot (BMW smoke, AXE box, John Frieda, Braun dance, Arc'teryx silhouette, BMW helmet), with a one-frame bloom on each hit. VO: "You need to feel that freedom." | 58.58, 61.34, 64.28 |
| 1:04.3–1:13.2 | **5 Close** | Pull out through the last frame into ᑕᐣᓯ and the whole constellation, with 34 tiny clips (all unique, playing forward) hanging on its stars. The water and moon return under the sky, and the stars condense into the tilted mint GILL JAMES with ᑕᐣᓯ above it. Contact: imjamesgill@gmail.com · gilljames.com. VO: BMW Drift "That's what I know. That's what I love to do." | 64.28 → fade 72.3 |

## Techniques
- **Single world camera.** Everything lives in one 2D world: the constellation, walls and hero frames. The camera keyframes (centre and zoom) are interpolated in log-zoom, and zooms run about a fixed point, so the target stays pinned while scale changes by up to 40×. Those are the zoom-throughs and the tile → full-frame match cuts.
- **Motion blur.** Sub-frame accumulation of 2–5 samples across a 180° shutter whenever the camera moves fast. It is never applied across a hard cut.
- **Stills behave like footage.** Every still in a tile gets a slow push and drift, the same grade, the same grain and lateral chromatic aberration as the clips. **Constellation tiles** (film stars, wall A, close cluster): 663 placements with zero repeats. Each clip is a unique 40-frame moment that plays forward once from a staggered start, slowed to 0.42–0.7×, then holds its last frame. Stills appear only where they make sense: Gill's photography and strong held film frames. The other walls (B, C, mosaic, river) still use the first-cut clip loops.
- **Heroes.** These are real decoded 2.39 frames (1920×804) from the 1080p sources, kept inside a single source shot. Each hero window is checked against the source edit lists, so none of them cross a source edit. A window is shifted or slowed to fit if needed.
- **Moonwater (pass-4 realism, now toggled OFF; first-cut look restored by Gill's choice).** A perspective ocean made of 16 dispersive waves (ω = √(gk), distance anti-aliased). It reflects the actual rendered sky through a mirror camera displaced by the wave slopes, with Fresnel, moon glitter (sharp sparkles plus a broad path), horizon haze, and the site's own water photo as a drifting surface texture. The tilt is one continuous camera move with no dissolves.
- **Night sky (pass-4, toggled OFF).** About 7,000 stars with power-law magnitudes and colour temperatures, in three parallax depths, splatted sub-pixel. Photographic PSF: a soft core plus bloom on the bright stars. A faint milky band, true blacks and horizon airglow. Constellation stars get soft cores and two-scale halos.
- **Imagery field (pass-4, toggled OFF to keep the first cut's sparse constellations; the HUD typography is also off).** Three parallax depth layers holding 920 of Gill's frames (far layers small and dim). A moving thumbnail sits on each of the 41 stars, with 2×2 clusters on the chapter stars. Three frames travel along every constellation line. Nodes flash their footage on the music hits, and nodes bloom as the camera passes close. The lines and star cores are drawn on top, so the constellation shape still reads.
- **ᑕᐣᓯ.** It is the central star (with cyan/red edges like the site), a 1,296-tile photomosaic glyph, and the end card.
- **Finish.** Lateral chromatic aberration (cyan/red fringes, as on the site) plus luma-weighted grain on every frame.

## Database used
- New sources: BMW X7 Legendary (director's cut 1080p), AXE Stay Gold, BBBS Bigger Together, Tweed, Canadian Ironworkers, Flybits, Special Olympics, BONSAI Retail Revolution, all folded into the tile pools; Legends and Stay Gold also get heroes.
- Clip scenes from the films, and all 170 usable stills (photography, joio.co objects, spatial/studio pieces).
- Full-frame hero moments from 17 projects, incl. BMW X7 Legends and AXE Stay Gold.

## Sound
**Track audition** (6 tracks by Gill's bands, analysed for hit count and strength over a 73 s window):

| track | band | hits / 73 s | median hit strength | verdict |
|---|---|---|---|---|
| **Lost in Time** | Lost Coffee | **83** | **7.5×** | chosen: the hardest, most regular hits. Fixes v6's "no hard hits" |
| = | Lost Coffee | 35 | 5.9× | great break → drop structure, but softer hits |
| to go | Lost Coffee | (v5/v6 track) | — | already used; gentle |
| No Problem | Lost Coffee | — | — | front-loaded, fades out mid-track |
| ii | Lost Coffee | — | — | 70 s, flat dynamics |
| Gone Are the Days of Yesterday | Mothers Moniker | 5 | 6.9× | lovely long crescendo, almost no transients |

Edit: Lost in Time 173.5–180.06 s (quiet intro) + 61.93–121.36 s + 181.0–189.5 s (outro), crossfaded. All cuts are placed on detected hits.

**Voice lines (mix pass 5 = Gill's preferred pass-1 mix, re-fitted to render 8).** Pass 1's music edit, water and voice lines are unchanged in placement. The only addition is the Legends narration over the Legends focus. Music is ducked under the voice lines (−4.5 dB gently under Legends):

| reel | film (source time) | line |
|---|---|---|
| 0:04.05–0:06.28 | 19 Crimes x Malamen (1.22–3.45) | "It's within me. It's in me." |
| 0:20.30–0:22.27 | BMW X7 Legends (2.28–4.25) | "What are legends made of?" (the tile zooms up at 20.07 and back out at 22.83) |
| 0:25.90–0:29.90 | BMW Drift (19.80–23.80) | "There are those moments where you are just one with a car." |
| 0:31.27–0:33.59 | AXE Golden Moment (6.80–9.12) | "Push! Push! Push! Get up! Routine is everything." |
| 0:51.15–0:54.98 | 19 Crimes x Malamen (32.35–36.18) | "Create the way you want it, the way you feel, without hesitation." |
| 0:58.66–0:59.90 | 19 Crimes x Malamen (36.62–37.86) | "You need to feel that freedom." |
| 1:06.55–1:08.84 | BMW Drift (55.33–57.62) | "That's what I know. That's what I love to do." |

**Re-fit to the current edit.** The cuts sit on the same Lost in Time hits: every hard cut is within one frame of a music onset, including 20.07 and 22.83 for Legends and 34.66 for Stay Gold. Under pass 1 there is now a quiet texture layer, about 16 dB below the mix and ducked 7 dB under the voices, generated from the render-8 camera and cut list. It has whooshes on camera moves and zoom-throughs, soft impacts on the hard cuts, risers under the wall builds, star chimes, and each hero film's own sound (including the Legends bed under the Legends focus).

A/B: pass 1 `/workspace/v7_audio_sample_pass1.m4a`, pass 3 `/workspace/v7_audio_sample.m4a`, pass 4 `/workspace/v7_audio_sample_pass4.m4a`, **pass 5 (final)** `/workspace/v7_audio_sample_pass5.m4a`.

**Ambience.** Procedural calm water (low swell, lapping, droplets, soft air noise). It is full level over the water open (0–5 s), dips to a bed, and returns for the close (64–73 s). Under the music: shimmer/chimes as stars appear and lines connect, whooshes driven by camera speed and zoom, a granular riser under each wall build, soft impacts on hard cuts, and diegetic bleed from each hero's own film (BMW engine/tyres, Legends, AXE gym, John Frieda, Braun, Arc'teryx fire crackle, room tone). Final mix: about −14.5 LUFS integrated, true peak −1 dBTP.

**Not available.** Coca-Cola: the Vimeo download is login-gated (yt-dlp: unauthorized), so there is no jingle. The Legends narration now comes from the director's-cut source.
