# Sound sketch: direction

A standalone sound-reactive sky at `u4-opus-m4/_sketch/sound/`. Nothing outside `_sketch/` is edited; m4 media and `data.json` are read by relative path.

## What it is

The dark m4 sky (stars, m4's glow, the mark) with one real Lost Coffee song playing through it. The sky does not decorate the music; it is driven by what the analyser hears. It does not play until someone taps.

## Audio

- Song: a real Lost Coffee track from m4's own list (`../../data.json` `tracks`, files under `../../media/pro2/audio/`). Default "Lost in Time". Other Lost Coffee tracks selectable inside the debug panel (`?song=`). No other artists, no invented titles.
- Graph like m4 `sky.js` (around line 1098): `<audio>` element, `createMediaElementSource`, one `AnalyserNode` (fftSize 512, `FD` frequency bytes, `TD` time-domain bytes) to the destination.
- `waves.json` / the `peaks` array in `data.json` (96 buckets per song) give the song's own waveform, used for the constellation shape.
- No autoplay. The audio context is created and resumed only inside the tap.

## Mapping (all deterministic, no Math.random at runtime; seeded layout only)

| Signal | Drives |
|---|---|
| Low-band spectral flux (bins 0-15, about 0-1.5 kHz, lowest bins weighted) against its own adaptive average, local peak, 0.2 s refractory (the bass level itself also shows in the readout) | beat and pulse: kick onsets fire the pulse; the shared `GJDBG.setBeat` is fed a real beat count so the sync slider and the flash sliders follow the music instead of the test BPM |
| Mids and highs (600 Hz to 9 kHz in six log-spaced slices; the songs carry little above 9 kHz) | star clusters: six seeded clusters, one slice each; the cluster swells and brightens with its own slice |
| Highs (2.5-9 kHz) | the sparkle layer: fine star twinkle and the smallest stars |
| RMS from the time-domain data | breathes the ambient fog (size/alpha of the fog washes) |
| Waveform peaks (`peaks`, played-position window) | shape of the constellation lines: the lines connect the cluster centres and bow by the local peak value around the playhead |
| Onset intervals | BPM estimate (smoothed histogram of inter-onset intervals, 1-3 onsets apart, folded into 60-180), shown in the debug panel; the beat clock follows media time and locks to on-phase onsets |

Pulse timing comes only from the music's onsets. The Flash sliders (star flash, ambient flash) set intensity only, never timing. The sync slider offsets by position in the sky, exactly as in the other sketches.

## Interaction

- One tap on the sky plays or pauses (a small quiet play mark shows state).
- Two-finger pinch (or wheel on desktop) zooms the constellation; one finger drag pans it a little. Neither starts or stops audio.
- No auto-anything. Debug panel (`?debug=1` or the corner tab) holds the shared look group (brightness, contrast, grain, invert, star flash, ambient flash), flash beat group (sync), `vol` and `flash` sliders, song selector, and the readouts (BPM estimate, bass/mid/high/RMS levels, fps).

## Reduce Motion

Motion is identical with Reduce Motion on. Nothing in the sketch reads `prefers-reduced-motion`. Tested by emulating it and comparing readouts for the same time position.

## Steps (each pushed with a PROGRESS row)

1. This file.
2. Skeleton: sky, glow, mark, tap to play/pause, analyser graph, readouts.
3. Onset detector, beat feed, BPM estimate.
4. Band-to-cluster stars, RMS fog, peaks-shaped constellation lines, pinch zoom.
5. Debug wiring (look group, vol, flash, sync) and tests at 390x844 touch and landscape, Reduce Motion emulated.

## Limits to state up front

- No real phone to check fps or iOS audio-session behaviour.
- Analysis in tests uses headless Chrome, which can play the audio without a speaker; onset results are deterministic for a given file only when the analyser frames line up, so tests compare ranges, not exact values.
