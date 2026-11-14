# proto-shell · 12 Nov 2026 (local only, nothing pushed)

A light shell that runs the real interaction logic, so every prototype tests one module under the real camera, ladder, sky,
gestures, waveform and mark. Built to `/workspace/share/proto-standards-1112/STANDARDS.md` + `tokens.json`
(copied to `core/tokens.json`, sha256 490fe023…, and read at runtime for wheel gains, double-tap window, tilt spring, durations).

    python3 -m http.server 8777 --bind 127.0.0.1 --directory /workspace/proto-shell-1112
    http://127.0.0.1:8777/            film-snap module, variant A
    ?m=blank                          the core alone
    ?m=about-calc&at=about/board      the About / bio calculator: ?v=A 2D (m4, exact) · ?v=B 3D object (modules/about-calc/NOTES.md)
    ?v=A|B|C                          proposal (pills, arrow keys, A/B/C keys; lab.js verbatim)
    ?at=film | film/board | film/work/4 | sound     start at a level (stills)
    ?mid=1                            freeze the module's mid-state (film-snap: fsn 0.5)
    #debug                            reserved for the lil-gui/Tweakpane panel (TBD, not built)

## Layout
    index.html
    core/
      tokens.json        the standard (copy)
      camera.js          4:45 blend rig: zoomAt from the touch point, log glide, gesture lock, continuous wheel (0.0016 / ctrl 0.012),
                         260 ms soft settle, fling exp(-4.5dt), tilt spring w 9, double tap m4 360 ms / 40 px
      ladder.js          m4 levels 0 FAR · 1 MID · 2 BOARD · 3 WORK; one history step per level; out = history.back (pinch-out, ‹,
                         Esc, double tap, Back agree); soft settle with snapAt 34 % (log); one level per gesture
      sky.js             m4 placeChapter + chapterAt layout, FAR fit W-28 × H-78-36, MID fitBox(36,28)·1.45, blend depth layers + dust
      ripple.js          m4 rippleAt (touch without select)
      waveform.js        Sound dock: dotted star-chart (SH.sound) + player bar; watchdog re-mounts it; __shell.check() verifies it
      mark.js            ᑕᐣᓯ (Syl 700) + the GJ_DEC / GJ_TUNE / __u1 / __depth shims tune.js needs
      vendor/tune.js     preview-film-snap tune.js, verbatim (list · contact · tune, decisions 1-4, room sliders, reset)
      vendor/lab.js      proto-lab lab.js, verbatim (A/B/C, ?v=); shell merges its replaceState so ?m= and history survive
      css/shell.css      4:31 colour + type tokens; css/markmenu.css (verbatim from preview-film-snap sky.css)
      shell.js           boot, world stops, taps, frame loop, module loader, __shell (state, check, go)
    modules/
      about-calc/           the About / bio calculator, 2D or 3D (module.js, calc.css, layers.js, media/, NOTES.md)
      film-snap/module.js   decision 1: m4 loose map ⇄ 4:31 film board with counts; decision 3: board tile → work slot
      blank/module.js       copy this to start a module
    data/   sky.json (SH/ANG/ANGP + sky item counts), film.json (38 film cards), tracks.json (6 songs)
    media/  audio (6 mp3, 7.5 MB), film thumbs (38 webp, no metadata), fonts (Julius, Poppins 300, Syl subset)
    _qa/    qa.py (real CDP pinches / wheel / taps, phone 390×844 @2 + desktop 1440×900 @1, both Reduce Motion settings),
            results.json, shots, contact sheets

## Module contract (all optional)
    Shell.register({ id, title, chapter, variants:{A,B,C}, ready:Promise,
      layout(W,H,sh), stop(st,W,H,sh) -> {x,y,s} | null | undefined, box(sh),
      draw(g,cam,t,sh,T), hide(k,sh), tap(x,y,sh) -> consumed, variant(v,sh), mid(sh),
      levelName(lv,st,sh), workId(id), state(sh), isNew:[...] })

## Module hooks the core gives every module (all optional)
    tune:[...]            slider specs {k:'gj.*', label, min, max, def, after} and toggle specs {type:'toggle', k, label, options:[[v,'label']], get(), set(v)}
    tuneTitle(st)         the tune menu's header for the module's room (about-calc: 'bio')
    back(sh)              -> true if the module consumed a step out: ‹, Esc, double tap, pinch-out, browser Back all ask first
    inAt(x,y,sh)          -> true if the module consumed a step in: pinch-in past the deepest stop, wheel-in, Enter / +
    arrow(dir,sh)         -> true if Left (-1) / Right (+1) is the module's (layer stepping); Shift+Left/Right always switches A/B/C
    SH.setVariant('B')    switch the proposal from code (the same as its pill)

## Known gaps (TBD in the standard, not invented here)
- WORK has no single m4 scale; the film-snap slot uses the blend deepS 0.82 rule. The film player itself is not wired in.
- `?decisions=1-4` parser, `#debug` panel, `?stress=1` walker: not built.
- tune.js room links `../objects/`, `../spaces/forest-garden/` point outside the shell; `list/` and `contact/` are stubs.
- Desktop board on a 1440 screen follows m4 (max 680 px wide, 3 columns), so it looks small; that is the 4:31 value.

## Theme layer (night / red)
    core/css/theme.css   every colour token, two sets: night (default, the look the shell always had) and html[data-theme=red]
    core/theme.js        GJ_THEME: the per-device choice (localStorage gj.theme, or ?theme=night|red), data-theme on <html>,
                         GJ_THEME.pal (the same tokens for canvas code, rebuilt on every change), the quiet button by the A/B/C pills
    tune menu            globals > colour mode: night | red (reset does not touch it)
Modules paint with GJ_THEME.pal (or the CSS variables), never their own hex; GJ_THEME.on(fn) says when it changed.
Red = bright red on black, thin lines, a dotted floor; the room or part being adjusted in the tune menu lights up gold for a moment.
Never themed: photographs, film frames and video; the mint "new" marker; the safelight; the Photo room (it keeps its own look, so
red steps aside while you are inside it). No transitions and no motion differences between themes, Reduce Motion included.

Red and mood are one system: the sky mood slider (hushed to lit) runs on the red palette too. Hushed red is deep, sparse and dim; lit red
glows and warms toward gold. Red never washes or brightens the page: the black stays black and only the elements give light. Stars, glows, lines, the dotted floor and the star cores all follow it. The
callout, its corner marks, the leader and the zoom-level scale are drawn from the same language as the constellations (glowing star dots,
fine dotted runs, hairline lines).
