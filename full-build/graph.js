/* graph.js · the site as a graph, on the m4 rebuild (Gill's brief, Nov 15).
   ONE file: the room table, the links, the map and its styles. chrome.js loads it (two lines) and hands it the Mark.

   - ‹ ᑕᐣᓯ opens the map: the whole site as one small sky, drawn the way the m4 sky is drawn. The room stays visible through it.
     The Mark in the middle is the m4 sky. The crescent is the moon opener. Lit stars are joined to where you are.
   - One tap on a star goes there. Under the sky sit the modes that work in this place; one tap switches one.
   - Browser Back: the open map is one history step, so Back closes the map first and then steps one place back, as before.
     A star replaces that step with the room, so the path stays one entry per place.
   - This is the one room table. A door of the m4 sky that points at a sister folder this build does not have is sent to that
     room's address here (ROOMS, "aka"). Nothing is probed.
   - Tune › navigation › tree: the Mark goes to the field as it did and the map never opens. The room table still serves the doors. */
(function () {
  "use strict";
  if (window.__gjGraph || !window.GJ || !GJ.get) return;
  window.__gjGraph = 1;
  var SRC = document.currentScript && document.currentScript.src; if (!SRC) return;
  var ROOT = new URL(".", SRC), html = document.documentElement, M4 = "src/sky/player/tonight/fable-m4/";

  /* ---------- the one room table: [id, name, address, x, y, depth, options]
     x, y: where the star sits (0..1), laid out like the m4 sky: about above, film left, photo right, sound and objects below.
     depth: how near it floats (parallax). aka: old door addresses, from the build root, that mean this room. ---------- */
  var ROOMS = [
    ["sky",         "the sky",       M4 + "index.html",                                    .500, .500, 1.5, { mark: 1 }],
    ["hub",         "the field",     "index.html",                                         .500, .655, 1.1],
    ["arrival",     "arrival",       "src/v33d/site-v3-3d/index.html?arrival=v1",          .470, .060, .6],
    ["opener",      "moon opener",   "opener/index.html",                                  .830, .085, .5, { moon: 1 }],
    ["site-v3",     "site v3",       "src/b33/site-v3/index.html",                         .150, .075, .45],
    ["about",       "about",         "src/v33d/site-v3-3d-bio/index.html#about",           .380, .205, .8],
    ["bio",         "bio",           M4 + "index.html#about/bio",                          .550, .290, 1.0],
    ["about-moon",  "about by moon", "src/c4e6/site-constellation/about/index.html",       .700, .190, .7],
    ["film-board",  "film board",    "src/site3d-8d21/site-3d/index.html",                 .210, .385, 1.0],
    ["mark",        "mark player",   M4 + "index.html#mark",                               .330, .560, 1.1],
    ["named-stars", "named stars",   "src/sky/r/r10/index.html",                           .110, .265, .7],
    ["cinema",      "cinema",        "cinema/index.html",                                  .700, .560, .9],
    ["photo-lab",   "photo lab",     "src/sky/p1/photo-lab/index.html",                    .790, .385, 1.0, { aka: ["src/sky/player/tonight/photo-lab/"] }],
    ["archive",     "archive",       "src/sky/archive-index/index.html",                   .890, .275, .7],
    ["reel",        "horizon reel",  "reel/index.html",                                    .885, .500, .7],
    ["sound",       "song stars",    "src/dbae/sound-sketch/index.html",                   .205, .700, 1.0],
    ["night-sound", "night sound",   "src/sky/fit/tonight/sound/index.html",               .120, .825, .7],
    ["objects",     "objects",       "src/sky/objects-3d/index.html",                      .790, .705, 1.0, { aka: ["src/sky/player/tonight/objects/"] }],
    ["shelf",       "shelf",         "objects-room/index.html",                            .895, .820, .7],
    ["joio",        "joio",          M4 + "objects/joio/index.html",                       .690, .855, .7],
    ["spaces",      "forest garden", "src/sky/tonight/spaces/forest-garden/index.html",    .420, .860, .9, { aka: ["src/sky/player/tonight/spaces/forest-garden/"] }]
  ];
  /* links: [a, b, why]. A link works both ways. */
  var LINKS = [
    ["sky", "arrival", "the way in"], ["sky", "opener", "the moon"], ["sky", "hub", "the whole field"],
    ["sky", "film-board", "film"], ["sky", "photo-lab", "photo"], ["sky", "objects", "objects"], ["sky", "sound", "sound"],
    ["sky", "spaces", "spaces"], ["sky", "bio", "about"], ["sky", "cinema", "one film"],
    ["sky", "site-v3", "the sky, inside the scroll"], ["sky", "mark", "the films, drawn"], ["mark", "film-board", "film"],
    ["hub", "arrival", "the way in"], ["hub", "named-stars", "film, by name"], ["hub", "archive", "everything, listed"],
    ["arrival", "about", "same glass"], ["arrival", "site-v3", "the scroll"],
    ["film-board", "named-stars", "with names"],
    ["reel", "cinema", "onward"], ["reel", "photo-lab", "same photographs"], ["archive", "photo-lab", "the darkroom"],
    ["objects", "shelf", "on the shelf"], ["shelf", "joio", "one object"], ["sound", "night-sound", "at night"],
    ["about", "bio", "the long version"], ["about", "about-moon", "by moonlight"], ["about-moon", "opener", "the same moon"]
  ];
  /* modes and tools: [name, where ("*" or room ids), storage key | "act", default] */
  var MODES = [
    ["tune",          "*",                  "act"],
    ["safelight",     "*",                  "gj-red", "0"],
    ["ambience",      ["spaces", "opener"], "gj.amb.on", "1"],
    ["crescent moon", ["opener"],           "gj-tog-moon", "1"],
    ["water",         ["opener"],           "gj-tog-water", "1"],
    ["reflections",   ["shelf"],            "gj-tog-reflect", "1"],
    ["film names",    ["hub"],              "gj-tog-name", "0"],
    ["camera dial",   ["arrival", "about"], "act"]
  ];
  /* the films the m4 sky has a player page for (fable-m4/film/<slug>/). A film board asks here; nothing is probed. */
  var FILMS = "back-to-the-start backward-fall brew-bar-coffee-teaser buddy-time-grandpas-story canoe celebraciones cinematography-demo-reel-2025 cover-with-love-isabelle demo-reel drift eat-well explorers fire flower-crown golden-moment-directors-cut hike journeys-x-todd just-the-beginning legends lets-grow-good-together ltl-dstryr mandie modern-man no-place-like-home obedience-gets-you-nowhere one-with-the-devil phantoms-and-friends reel-2026 reel-24 repeat-feat-jessie-reyez s18 sleepwalker stay-gold summer-is-here sun-kissed the-smell-needs-to-go veronas-obsession weird-kid".split(" ");
  /* a room whose entry lands on a routed page: [room, test on path?query#hash from the build root] */
  var LANDS = [["mark", /^src\/sky\/player\/tonight\/fable-m4\/[^#]*#mark$/], ["bio", /^src\/sky\/player\/tonight\/fable-m4\/[^#]*#about\/bio/], ["opener", /^src\/sky\/opener\/tonight\//]];

  function byId(id) { for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i][0] === id) return ROOMS[i]; return null; }
  function urlOf(id) { var r = byId(id); return r ? new URL(r[2], ROOT).href : null; }
  function pathOf(u) { return new URL(u, ROOT).pathname.replace(/index\.html$/, ""); }
  function joined(a, b) { for (var i = 0; i < LINKS.length; i++) { var l = LINKS[i]; if ((l[0] === a && l[1] === b) || (l[0] === b && l[1] === a)) return l; } return null; }
  function filmUrl(slug) { return FILMS.indexOf(slug) < 0 ? null : new URL(M4 + "film/" + encodeURIComponent(slug) + "/", ROOT).href; }
  function graphOn() { return GJ.get("gj.nav", "graph") !== "tree"; }

  /* ---------- where am I? ---------- */
  function where() {
    if (document.body && document.body.classList.contains("gj-hub")) return "hub";
    if (window.GJ_MARKPLAYER && GJ_MARKPLAYER.isOpen()) return "mark";
    var here = location.pathname.replace(/index\.html$/, ""), at = here.slice(ROOT.pathname.length) + location.search + location.hash, id = null, best = 0;
    LANDS.forEach(function (l) { if (l[1].test(at)) id = l[0]; });
    if (!id) ROOMS.forEach(function (r) {
      if (r[0] === "hub") return;
      var p = pathOf(r[2]);
      if (here.indexOf(p) === 0 && p.length > best) { best = p.length; id = r[0]; }
    });
    return id;
  }
  var HERE = where();

  /* ---------- the doors: an old address of a room goes to the room (no probing; works in tree mode too) ---------- */
  var AKA = {};
  ROOMS.forEach(function (r) { ((r[6] && r[6].aka) || []).forEach(function (p) { AKA[new URL(p, ROOT).pathname] = r[0]; }); });
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target && e.target.closest && e.target.closest("a[href]"); if (!a || a.closest("#gj-map")) return;
    var to; try { to = new URL(a.href, location.href); } catch (err) { return; }
    var id = AKA[to.pathname.replace(/index\.html$/, "")];
    if (id) { e.preventDefault(); e.stopPropagation(); location.href = urlOf(id); }
  }, true);

  /* ---------- the path so far (this tab). Browser Back walks it backwards; the map draws it dotted. ---------- */
  function trail() { try { return JSON.parse(sessionStorage.getItem("gj.trail") || "[]"); } catch (e) { return []; } }
  function step(back) {
    if (!HERE) return;
    var t = trail(), i = t.lastIndexOf(HERE);
    if (back && i >= 0) t.length = i + 1; else if (t[t.length - 1] !== HERE) t.push(HERE);
    try { sessionStorage.setItem("gj.trail", JSON.stringify(t.slice(-12))); } catch (e) {}
  }
  var nav0 = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};
  step(nav0.type === "back_forward");

  /* ---------- ink: cool #e6edf0 at night; in safelight the red the tone dial has chosen (gj.red.tone). No mint, no warm white. ---------- */
  function red() { return html.classList.contains("rm"); }
  function ink() {
    if (!red()) return [230, 237, 240];
    var t = null; try { t = localStorage.getItem("gj.red.tone"); } catch (e) {}
    return t === "rose" ? [255, 176, 184] : [255, 68, 87];
  }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  /* ---------- styles: m4's own type (Julius Sans One for names, Poppins for the small words), its × and its switch buttons ---------- */
  var FONTS = new URL(M4 + "media/pro2/fonts/", ROOT).href;
  var css = document.createElement("style");
  css.textContent = [
    "@font-face{font-family:'Julius Sans One';font-display:swap;src:url(" + FONTS + "julius-sans-one.woff2) format('woff2')}",
    "@font-face{font-family:Poppins;font-weight:300;font-display:swap;src:url(" + FONTS + "poppins-300.woff2) format('woff2')}",
    "@font-face{font-family:Syl;font-weight:700;font-display:block;src:url(" + FONTS + "noto-canadian-aboriginal-subset.woff2) format('woff2');unicode-range:U+1400-167F}",
    /* the veil is the night itself: the room shows through it. In safelight it is plain black, so nothing under it is ever tinted. */
    "#gj-map{position:fixed;inset:0;z-index:2147482990;margin:0;box-sizing:border-box;outline:0;opacity:0;transition:opacity .34s ease;touch-action:none;overscroll-behavior:contain;",
    " -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;--gm:230,237,240;",
    " background:radial-gradient(120% 86% at 50% 46%,rgba(8,13,22,.80),rgba(4,7,11,.93));-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);",
    " color:rgb(var(--gm));font:300 12px/1.2 Poppins,system-ui,sans-serif;letter-spacing:.03em}",
    "#gj-map[hidden]{display:none}#gj-map.on{opacity:1}",
    "html.rm #gj-map{--gm:255,68,87;background:radial-gradient(120% 86% at 50% 46%,rgba(0,0,0,.84),rgba(0,0,0,.94))}",
    "html.rm[data-red-tone=rose] #gj-map,html.rm.gm-rose #gj-map{--gm:255,176,184}",
    "#gj-map canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}",
    "#gj-map .gm-sky{position:absolute;left:50%;top:calc(var(--gm-top,60px) + 46px);bottom:128px;width:min(calc(100% - 20px),900px);transform:translateX(-50%)}",
    "#gj-map .gm-t{position:absolute;left:14px;top:var(--gm-top,60px);margin:0;height:44px;display:flex;align-items:center;gap:.7em;max-width:calc(100% - 80px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
    " font:400 10px/1 'Julius Sans One',Poppins,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(var(--gm),.55);text-shadow:0 0 6px #04070b,0 0 14px #04070b}",
    "#gj-map .gm-t b{font-weight:400;color:rgb(var(--gm))}",
    /* the × is m4's × (the hire card's, the one Tune now has): 44px target, 18px glyph */
    "#gj-map .gm-x{position:absolute;right:8px;top:var(--gm-top,60px);width:44px;height:44px;margin:0;padding:0;border:0;background:none;cursor:pointer;",
    " font:300 18px/1 Poppins,sans-serif;letter-spacing:0;color:rgba(var(--gm),.62);-webkit-appearance:none;appearance:none;touch-action:manipulation}",
    "@media (hover:hover){#gj-map .gm-x:hover{color:rgb(var(--gm))}}",
    /* a star: the name in the sky's own lettering; the reason for the link under it in the small voice */
    "#gj-map a.gm-n{position:absolute;min-width:44px;min-height:44px;margin:0;padding:0;border:0;background:none;box-shadow:none;opacity:1;filter:none;display:flex;flex-direction:column;align-items:center;text-decoration:none;outline:0;cursor:pointer;touch-action:manipulation;",
    " font:400 9.5px/1.3 'Julius Sans One',Poppins,sans-serif;letter-spacing:.17em;text-transform:uppercase;white-space:nowrap;color:rgba(var(--gm),.46);text-shadow:0 0 5px #04070b,0 0 12px #04070b,0 0 20px #04070b;will-change:transform}",
    "#gj-map a.gm-n i{display:block;flex:none;width:32px;height:32px}",
    "#gj-map a.gm-n b{display:block;flex:none;height:32px;font:700 21px/32px Syl,'Noto Sans Canadian Aboriginal',sans-serif;letter-spacing:0;color:rgb(var(--gm));text-shadow:0 0 10px rgba(var(--gm),.75),0 0 26px rgba(var(--gm),.45)}",
    "#gj-map a.gm-n span{margin-top:-6px}#gj-map a.gm-n b+span{margin-top:18px}",
    "#gj-map a.gm-n small{display:none;margin-top:1px;font:300 9px/1.3 Poppins,sans-serif;letter-spacing:.04em;text-transform:none;color:rgba(var(--gm),.58)}",
    "#gj-map a.gm-n.on{color:rgba(var(--gm),.96)}#gj-map a.gm-n.on small,#gj-map a.gm-n.here small{display:block}",
    "#gj-map a.gm-n.here{color:rgb(var(--gm))}#gj-map a.gm-n.here small{color:rgba(var(--gm),.8)}",
    "#gj-map a.gm-n:focus-visible span{outline:1px solid currentColor;outline-offset:4px;border-radius:2px}",
    "@media (hover:hover){#gj-map a.gm-n:hover{color:rgb(var(--gm))}}",
    "@media (min-width:900px){#gj-map a.gm-n{font-size:10.5px}#gj-map a.gm-n small{font-size:10px}}",
    /* the switches: m4 Tune's own row (a small heading, then the round-ended buttons), with 44px targets like the red mode colour row */
    "#gj-map .gm-m{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);margin:0;padding:0 10px;display:flex;flex-direction:column;align-items:center;gap:2px}",
    "#gj-map .gm-m h3{margin:0;font:400 10px/1.4 'Julius Sans One',Poppins,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(var(--gm),.55);text-shadow:0 0 6px #04070b}",
    "#gj-map .gm-m div{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 6px}",
    "#gj-map .gm-c{box-sizing:border-box;min-width:44px;min-height:44px;margin:0;padding:0 12px;border:1px solid rgba(var(--gm),.22);border-radius:999px;background:rgba(4,7,11,.35);box-shadow:none;text-shadow:none;width:auto;",
    " font:300 10px/1 Poppins,sans-serif;letter-spacing:.03em;text-transform:none;color:rgba(var(--gm),.72);cursor:pointer;-webkit-appearance:none;appearance:none;touch-action:manipulation}",
    "#gj-map .gm-c[aria-pressed=true]{color:#04070b;background:rgb(var(--gm));border-color:transparent}",
    "#gj-map .gm-c:focus-visible,#gj-map .gm-x:focus-visible{outline:1px solid rgb(var(--gm));outline-offset:2px}",
    "html.rm #gj-map .gm-c{background:rgba(0,0,0,.4)}html.rm #gj-map .gm-c[aria-pressed=true]{color:#000;background:rgb(var(--gm))}",
    "html.gj-map-open #gj-back,html.gj-map-open #gj-red{z-index:2147483002}",
    "@media (max-height:620px){#gj-map .gm-sky{bottom:104px}#gj-map .gm-m h3{display:none}}",
    "@media (prefers-reduced-motion:reduce){#gj-map{transition:none}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- the map ---------- */
  var map = null, cv, g, sky, title, chips, stars = {}, open = false, lastFocus = null, hover = null, raf = 0, t0 = 0, after = null;
  var ptr = { x: 0, y: 0, tx: 0, ty: 0, has: false }, DUST = [], SPR = {}, sprKey = "";
  var still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function rnd(seed) { var s = seed; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function build() {
    map = el("div"); map.id = "gj-map"; map.hidden = true; map.tabIndex = -1;
    map.setAttribute("role", "dialog"); map.setAttribute("aria-modal", "true"); map.setAttribute("aria-label", "map of the site");
    cv = el("canvas"); cv.setAttribute("aria-hidden", "true"); g = cv.getContext("2d");
    sky = el("div", "gm-sky"); title = el("p", "gm-t"); chips = el("div", "gm-m");
    var x = el("button", "gm-x", "×"); x.type = "button"; x.setAttribute("aria-label", "close the map");
    x.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    ROOMS.forEach(function (r) {
      var a = el("a", "gm-n"), o = r[6] || {};
      a.href = urlOf(r[0]);
      if (o.mark) { var m = el("b", "", "ᑕᐣᓯ"); m.lang = "cr"; a.appendChild(m); } else a.appendChild(el("i"));
      a.appendChild(el("span", "", r[1])); a.appendChild(el("small"));
      a.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); go(r[0]); });
      a.addEventListener("mouseenter", function () { hover = r[0]; }); a.addEventListener("mouseleave", function () { hover = null; });
      a.addEventListener("focus", function () { hover = r[0]; }); a.addEventListener("blur", function () { hover = null; });
      stars[r[0]] = a; sky.appendChild(a);
    });
    map.appendChild(cv); map.appendChild(sky); map.appendChild(title); map.appendChild(x); map.appendChild(chips);
    /* the map is its own layer: nothing under it hears the pointer, the wheel or a touch */
    ["pointerdown", "pointerup", "mousedown", "mouseup", "wheel", "touchstart", "touchmove", "touchend", "dblclick", "contextmenu"].forEach(function (t) {
      map.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true });
    });
    map.addEventListener("pointermove", function (e) { e.stopPropagation(); if (e.pointerType === "touch") return; ptr.has = true; ptr.tx = e.clientX / innerWidth - .5; ptr.ty = e.clientY / innerHeight - .5; }, { passive: true });
    map.addEventListener("click", function (e) { e.stopPropagation(); if (e.target === map || e.target === sky || e.target === cv) close(); });
    var r = rnd(7); for (var i = 0; i < 150; i++) DUST.push([r(), r(), .35 + r() * .9, r() * 6.283, .1 + r() * .25]);
    html.appendChild(map);
  }

  /* glow sprites, in the ink of the moment (rebuilt when the mode or the tone changes) */
  function sprites() {
    var c = ink(), key = c.join(",") + "|" + (window.devicePixelRatio || 1);
    if (key === sprKey) return; sprKey = key;
    function disc(size, stops) { var s = document.createElement("canvas"); s.width = s.height = size; var q = s.getContext("2d"), gr = q.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      stops.forEach(function (st) { gr.addColorStop(st[0], rgba(c, st[1])); }); q.fillStyle = gr; q.fillRect(0, 0, size, size); return s; }
    SPR.glow = disc(128, [[0, 1], [.06, .95], [.14, .42], [.34, .12], [.62, .035], [1, 0]]);
    SPR.bloom = disc(256, [[0, .34], [.25, .16], [.55, .05], [1, 0]]);
    /* the crescent: the opener's moon, with its halo */
    var m = document.createElement("canvas"); m.width = m.height = 128; var q = m.getContext("2d");
    q.shadowColor = rgba(c, .9); q.shadowBlur = 16; q.fillStyle = rgba(c, 1); q.beginPath(); q.arc(64, 64, 24, 0, 6.2832); q.fill();
    q.shadowBlur = 0; q.globalCompositeOperation = "destination-out"; q.beginPath(); q.arc(76, 57, 23, 0, 6.2832); q.fill();
    SPR.moon = m;
  }

  function size() {
    var top = 8; ["gj-back", "gj-dial", "gj-red"].forEach(function (id) { var e = document.getElementById(id), r = e && e.getBoundingClientRect(); if (r && r.width && r.bottom < innerHeight * .5) top = Math.max(top, r.bottom); });
    map.style.setProperty("--gm-top", Math.round(top + 6) + "px");
    var d = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d); g.setTransform(d, 0, 0, d, 0, 0);
  }
  function paintDom() {
    ROOMS.forEach(function (r) {
      var a = stars[r[0]], l = HERE && joined(HERE, r[0]), me = r[0] === HERE;
      a.classList.toggle("here", me); a.classList.toggle("on", !me && !!l);
      if (me) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      a.lastChild.textContent = me ? "you are here" : l ? l[2] : "";
    });
    var r = HERE && byId(HERE); title.textContent = ""; title.appendChild(document.createTextNode(r ? "you are at" : "the map")); if (r) title.appendChild(el("b", "", r[1]));
    html.classList.toggle("gm-rose", (function () { try { return localStorage.getItem("gj.red.tone") === "rose"; } catch (e) { return false; } })());
    paintChips();
  }
  function modeHere(m) {
    if (m[0] === "camera dial") return !!(window.GJ_CAMDIAL && GJ_CAMDIAL.open);
    return m[1] === "*" || (HERE && m[1].indexOf(HERE) >= 0);
  }
  function paintChips() {
    chips.textContent = ""; chips.appendChild(el("h3", "", "here")); var row = el("div"); chips.appendChild(row);
    MODES.filter(modeHere).forEach(function (m) {
      var b = el("button", "gm-c", m[0]); b.type = "button";
      if (m[2] === "act") b.addEventListener("click", function (e) {
        e.stopPropagation();
        close(function () { if (m[0] === "tune") { var d = document.querySelector("#fold-dial") || document.getElementById("gj-dial"); if (d) d.click(); } else if (window.GJ_CAMDIAL) GJ_CAMDIAL.open(); });
      });
      else {
        b.setAttribute("aria-pressed", String(GJ.get(m[2], m[3]) === "1"));
        b.addEventListener("click", function (e) { e.stopPropagation(); GJ.set(m[2], GJ.get(m[2], m[3]) === "1" ? "0" : "1"); paintChips(); });
      }
      row.appendChild(b);
    });
  }

  /* one frame: dust, lines, glows, the moon; then the names follow their stars */
  function frame(now) {
    raf = 0; if (!open) return;
    var W = innerWidth, H = innerHeight, box = sky.getBoundingClientRect(), c = ink(), t = (now - t0) / 1000, grow = still ? 1 : Math.min(1, t / .55);
    grow = 1 - Math.pow(1 - grow, 3);
    sprites();
    if (!still) { if (!ptr.has) { ptr.tx = Math.sin(t / 5.2) * .22; ptr.ty = Math.cos(t / 6.7) * .16; } ptr.x += (ptr.tx - ptr.x) * .06; ptr.y += (ptr.ty - ptr.y) * .06; }
    g.clearRect(0, 0, W, H);
    /* far dust */
    for (var i = 0; i < DUST.length; i++) { var d = DUST[i], tw = still ? .8 : .62 + .38 * Math.sin(t * (.5 + d[4] * 3) + d[3]);
      g.fillStyle = rgba(c, (.10 + d[4] * .5) * tw * grow); g.beginPath(); g.arc(d[0] * W - ptr.x * 10 * d[4], d[1] * H - ptr.y * 10 * d[4], d[2] * .7, 0, 6.2832); g.fill(); }
    var P = {};
    ROOMS.forEach(function (r) { var cx = box.left + box.width / 2, cy = box.top + box.height / 2, x = box.left + r[3] * box.width, y = box.top + r[4] * box.height;
      x = cx + (x - cx) * grow - ptr.x * 22 * r[5]; y = cy + (y - cy) * grow - ptr.y * 18 * r[5]; P[r[0]] = [x, y]; });
    /* lines: lit ones solid, the rest dotted, the way the sky draws its near and far links */
    g.lineCap = "round";
    LINKS.forEach(function (l) { var a = P[l[0]], b = P[l[1]], on = l[0] === HERE || l[1] === HERE, hv = hover && (l[0] === hover || l[1] === hover);
      g.setLineDash(on || hv ? [] : [1, 5]); g.lineWidth = on || hv ? 1 : .8; g.strokeStyle = rgba(c, (hv ? .78 : on ? .46 : .17) * grow);
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ga = l[0] === "sky" ? 34 : 7, gb = l[1] === "sky" ? 34 : 7; if (len < ga + gb + 4) return;
      g.beginPath(); g.moveTo(a[0] + dx / len * ga, a[1] + dy / len * ga); g.lineTo(b[0] - dx / len * gb, b[1] - dy / len * gb); g.stroke(); });
    /* the way back */
    var tr = trail().map(function (id) { return P[id]; }).filter(Boolean);
    if (tr.length > 1) { g.setLineDash([2, 7]); g.lineWidth = 1.5; g.strokeStyle = rgba(c, .95 * grow); g.beginPath(); tr.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.stroke(); }
    g.setLineDash([]);
    /* stars */
    g.globalCompositeOperation = "lighter";
    ROOMS.forEach(function (r) { var p = P[r[0]], o = r[6] || {}, me = r[0] === HERE, on = me || (HERE && joined(HERE, r[0])), hv = hover === r[0];
      var tw = still ? 1 : .86 + .14 * Math.sin(t * 1.3 + r[3] * 40), k = (o.mark ? 46 : me ? 30 : on ? 22 : 11) * (hv ? 1.35 : 1) * (.6 + .4 * r[5] / 1.5);
      if (o.mark || me) { var bl = o.mark ? 150 : 96; g.globalAlpha = .9 * grow; g.drawImage(SPR.bloom, p[0] - bl / 2, p[1] - bl / 2, bl, bl); }
      if (o.moon) { g.globalAlpha = (on || hv ? 1 : .62) * grow; var ms = 46 * (hv ? 1.15 : 1); g.drawImage(SPR.moon, p[0] - ms / 2, p[1] - ms / 2, ms, ms); }
      else if (!o.mark) { g.globalAlpha = (on || hv ? 1 : .6) * tw * grow; g.drawImage(SPR.glow, p[0] - k, p[1] - k, k * 2, k * 2); }
      if (me) { g.globalAlpha = (still ? .7 : .45 + .3 * Math.sin(t * 1.9)) * grow; g.strokeStyle = rgba(c, 1); g.lineWidth = 1; g.beginPath(); g.arc(p[0], p[1], o.mark ? 31 : 13 + (still ? 0 : Math.sin(t * 1.9) * 1.5), 0, 6.2832); g.stroke(); }
      g.globalAlpha = 1;
      var a = stars[r[0]]; a.style.transform = "translate(" + (p[0] - box.left).toFixed(1) + "px," + (p[1] - box.top).toFixed(1) + "px) translate(-50%,-16px)"; a.style.opacity = grow < 1 ? String(grow) : "";
    });
    g.globalCompositeOperation = "source-over";
    if (!still || grow < 1) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && open) raf = requestAnimationFrame(frame); }

  /* ---------- open and close. The open map is one history step: Back closes it. ---------- */
  function mapState() { var s = history.state, o = {}; if (s && typeof s === "object") for (var k in s) o[k] = s[k]; o.gjmap = 1; return o; }
  function show(on, quiet) {
    if (on === open) return;
    if (on && !map) build();
    open = on; html.classList.toggle("gj-map-open", on);
    var mark = document.getElementById("gj-back"); if (mark) mark.setAttribute("aria-expanded", String(on));
    if (on) {
      lastFocus = document.activeElement; map.hidden = false; size();
      var h = where(), tr = trail(); if (h !== HERE || tr[tr.length - 1] !== h) { HERE = h; step(tr[tr.length - 2] === h); }   /* a move made inside a room */
      paintDom();
      if (!quiet) { try { history.pushState(mapState(), ""); } catch (e) {} }
      ptr.has = false; ptr.x = ptr.y = 0; t0 = performance.now(); void map.offsetWidth; map.classList.add("on"); kick();
      try { map.focus({ preventScroll: true }); } catch (e) {}
    } else {
      map.classList.remove("on"); hover = null;
      setTimeout(function () { if (!open && map) map.hidden = true; }, 360);
      try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
    }
  }
  function openMap() { if (!graphOn() || open) return; show(true); }
  /* close from the ×, Esc, a tap on the sky or the Mark: step back off the map's history entry; popstate does the closing */
  function close(then) {
    if (!open) { if (then) then(); return; }
    after = then || null;
    if (history.state && history.state.gjmap) { try { history.back(); return; } catch (e) {} }
    show(false); if (after) { var f = after; after = null; f(); }
  }
  /* capture, so it runs before the room's own popstate: a Back that only closes the map is not a place change for the room */
  addEventListener("popstate", function (e) {
    var onMap = !!(e.state && e.state.gjmap);
    if (open && !onMap) { e.stopImmediatePropagation(); show(false); if (after) { var f = after; after = null; setTimeout(f, 0); } return; }
    if (!open && onMap && graphOn()) { e.stopImmediatePropagation(); show(true, true); }
  }, true);

  /* one tap on a star. The room takes the map's place in history, so the path stays one entry per place. */
  function go(id) {
    if (id === HERE) { close(HERE === "hub" && window.__cb && __cb.home ? function () { __cb.home(); } : null); return; }   /* at the field, its own star is home: the whole field */
    var to = new URL(urlOf(id)), bare = function (p) { return p.replace(/index\.html$/, ""); }, same = bare(to.pathname) === bare(location.pathname);
    if (same && window.__u1 && __u1.open) {       /* a place inside the m4 sky, from inside the m4 sky: the sky's own step */
      var m = /^#([a-z]+\/.+)$/.exec(to.hash);
      close(function () { if (to.hash === "#mark" && window.GJ_MARKPLAYER) GJ_MARKPLAYER.open(); else { if (window.GJ_MARKPLAYER && GJ_MARKPLAYER.isOpen()) GJ_MARKPLAYER.close(); if (m) __u1.open(m[1]); else if (window.__depth) __depth.goTo("sky"); } HERE = where(); step(false); });
      return;
    }
    show(false); location.replace(to.href);
  }

  /* keys while the map is open: Esc closes the map and nothing else; Tab stays inside; the room hears nothing */
  addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); close(); return; }
    if (e.key === "Tab") {
      var f = [].slice.call(map.querySelectorAll("a,button")), i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
    e.stopImmediatePropagation();
  }, true);
  addEventListener("click", function (e) {
    if (!open || !e.target || !e.target.closest) return;
    var d = e.target.closest("#gj-dial, #fold-dial"); if (!d) return;
    e.preventDefault(); e.stopImmediatePropagation(); close(function () { d.click(); });
  }, true);
  addEventListener("resize", function () { if (open) { size(); kick(); } });
  addEventListener("pageshow", function (e) { if (e.persisted) { HERE = where(); step(true); if (open && !(history.state && history.state.gjmap)) show(false); } });
  addEventListener("hashchange", function () { var h = where(), t = trail(); if (h !== HERE) { HERE = h; step(t[t.length - 2] === h); } if (open && !(history.state && history.state.gjmap)) show(false); });
  addEventListener("gj-tog", function (e) { var k = e.detail && e.detail.k; if (k === "gj.nav") { if (!graphOn() && open) close(); } else if (open) { paintDom(); kick(); } });
  addEventListener("storage", function (e) { if (open && (e.key === "gj.red.tone" || e.key === "gj-red")) { paintDom(); kick(); } });

  /* the hub has its own Mark (top left). At the whole field it has nowhere further out to go, so there it opens the map. */
  var home = document.body && document.body.classList.contains("gj-hub") && document.getElementById("home");
  if (home) home.addEventListener("click", function (e) {
    if (!graphOn() || !window.__cb) return;
    var s = __cb.st(); if (s.chapter || (__cb.board && __cb.board()) || Math.abs(s.cam.s / s.S0 - 1) > .03 || Math.abs(s.cam.x) + Math.abs(s.cam.y) > 4) return;
    e.stopImmediatePropagation(); e.preventDefault(); openMap();
  }, true);

  /* the Mark says what it does now */
  function nameMark() { var m = document.getElementById("gj-back"); if (!m) return; m.setAttribute("aria-label", graphOn() ? "map of the site" : "back to the field"); if (graphOn()) m.setAttribute("aria-haspopup", "dialog"); else m.removeAttribute("aria-haspopup"); }
  nameMark(); addEventListener("gj-tog", function (e) { if (e.detail && e.detail.k === "gj.nav") nameMark(); });

  /* a reload, or Forward, onto the map's own entry */
  if (history.state && history.state.gjmap) { if (graphOn()) show(true, true); else { try { history.back(); } catch (e) {} } }

  window.GJ.graph = { on: graphOn, open: openMap, close: function () { close(); }, toggle: function () { if (open) close(); else openMap(); }, isOpen: function () { return open; },
    here: function () { return HERE = where(); }, url: urlOf, film: filmUrl, rooms: ROOMS, links: LINKS, modes: MODES, trail: trail };
  try { dispatchEvent(new CustomEvent("gj-graph")); } catch (e) {}
})();
