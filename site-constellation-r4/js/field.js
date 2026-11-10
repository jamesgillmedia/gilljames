/* r4 sky. One camera: far field, mid titles, close film, then the tile's own frames.
   Back and pinch-out step out one level and land on the same spot. */
(function () {
  "use strict";
  var D = window.GJ_FIELD;
  if (!D || !D.films || !D.films.length) return;
  var field = document.getElementById("sky");
  var worldsHost = document.getElementById("worlds");
  var reelHost = document.getElementById("reelstrip");
  if (!field || !worldsHost) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);
  var qa = params.get("qa") === "1";
  var REF_W = 390, REF_H = 780;
  var PF = [0.62, 1, 1.34];
  var DS = [0.74, 1, 1.24];
  var NAMED = {
    "weird-kid": 1, "brew-bar-coffee-teaser": 1, "just-the-beginning": 1,
    "back-to-the-start": 1, "legends": 1, "sleepwalker": 1, "stay-gold": 1, "drift": 1
  };
  var HERO = {
    "weird-kid": [0.52, 0.36, 112],
    "brew-bar-coffee-teaser": [0.13, 0.36, 74],
    "sleepwalker": [0.13, 0.42, 60],
    "celebraciones": [0.33, 0.37, 50],
    "legends": [0.83, 0.49, 94],
    "stay-gold": [0.24, 0.53, 56],
    "just-the-beginning": [0.50, 0.57, 80],
    "back-to-the-start": [0.68, 0.66, 70],
    "drift": [0.87, 0.58, 50],
    "reel-2026": [0.09, 0.60, 44],
    "golden-moment-directors-cut": [0.75, 0.33, 48]
  };
  var SPOT = {
    "carving-0": [0.16, 0.82, 76],
    "carving-1": [0.33, 0.91, 46],
    "space-0": [0.80, 0.80, 58],
    "space-1": [0.91, 0.88, 42],
    "space-2": [0.64, 0.93, 50],
    "joio-0": [0.22, 0.78, 52],
    "joio-1": [0.44, 0.86, 48],
    "joio-2": [0.07, 0.90, 50],
    "joio-3": [0.55, 0.79, 44],
    "joio-4": [0.74, 0.94, 42],
    "joio-5": [0.48, 0.95, 38],
    "joio-6": [0.28, 0.74, 44],
    "joio-7": [0.60, 0.89, 46],
    "photo-0": [0.07, 0.23, 74],
    "photo-1": [0.93, 0.20, 62],
    "photo-2": [0.11, 0.48, 48],
    "photo-3": [0.90, 0.36, 50],
    "photo-6": [0.06, 0.64, 42],
    "sound-wave": [0.40, 0.75, 58],
    "sound-to-go": [0.86, 0.66, 50],
    "sound-lost-coffee": [0.18, 0.69, 36],
    "sound-gone-are-the-days-of-yesterday": [0.52, 0.70, 48],
    "clip-0": [0.70, 0.20, 40],
    "clip-1": [0.32, 0.27, 36],
    "clip-3": [0.84, 0.28, 34]
  };
  var GROUPS = {
    carving: { title: "Carving", href: "practice/carving/" },
    joio: { title: "joio.co", href: "practice/joio/" },
    space: { title: "Space", href: "practice/space/" },
    sound: { title: "Sound", href: "practice/sound/" },
    photo: { title: "", href: "", line: "photograph by Gill James" }
  };

  var seed = 20261110;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var films = D.films;
  var byId = {};
  films.forEach(function (f) { byId[f.id] = f; });
  var tiles = [];
  var occupied = [];
  var worlds = [];
  var svgs = [];
  var view = { w: 390, h: 780 };
  var base = 1;
  var cam = { s: 1, x: 0, y: 0 };
  var mode = "far";
  var heroId = films[0].id;
  var layerOn = false;
  var layerKey = "";
  var layerHasFrames = false;
  var focusKind = "";
  var focusId = "";
  var focusGroup = "";
  var focusAnchor = null;
  var savedCam = null;
  var lastMapCam = { s: 1, x: 0, y: 0 };
  var gestureCam = null;
  var tweenRAF = 0;
  var autoLayer = true;
  var driftOn = !reduce && !qa;
  var armT = -1e9;
  var layerRoot = null;
  var held = [];

  var kicker = document.getElementById("films-kicker");
  var pager = document.getElementById("sky-pager");
  var card = document.getElementById("layer-card");
  var titleEl = document.getElementById("layer-title");
  var lineEl = document.getElementById("layer-line");
  var openEl = document.getElementById("layer-open");
  var back = document.querySelector(".sky-back");
  var heroCap = document.createElement("div");
  heroCap.className = "hero-cap";
  heroCap.hidden = true;
  heroCap.innerHTML = '<span class="t"></span><span class="line"></span>';
  var ticks = document.querySelectorAll(".rail a.tick");

  function overlap(x, y, w, h) {
    var n = 0;
    var gap = 18;
    for (var i = 0; i < occupied.length; i++) {
      var p = occupied[i];
      if (Math.abs(x - p.x) < (w + p.w) / 2 + gap && Math.abs(y - p.y) < (h + p.h) / 2 + gap) n++;
    }
    return n;
  }
  function blocked(x, y, w, h) {
    var top = y - h / 2, bot = y + h / 2, left = x - w / 2, right = x + w / 2;
    if (top < 108) return true;
    if (right > 64 && left < 326 && bot > 100 && top < 236) return true;
    if (left > 268 && top < 150) return true;
    return false;
  }
  function take(x, y, w, h) { occupied.push({ x: x, y: y, w: w, h: h }); }
  function findSpot(w, h, y0, y1) {
    var best = null, score = 1e9;
    for (var i = 0; i < 180; i++) {
      var x = 16 + rnd() * (REF_W - 32);
      var y = y0 * REF_H + rnd() * ((y1 - y0) * REF_H);
      if (blocked(x, y, w, h)) continue;
      var s = overlap(x, y, w, h);
      if (s < score) { score = s; best = { x: x, y: y }; }
      if (s === 0) return best;
    }
    if (best && score === 0) return best;
    for (var j = 0; j < 80; j++) {
      var x2 = 16 + rnd() * (REF_W - 32);
      var y2 = 250 + rnd() * (REF_H - 270);
      if (blocked(x2, y2, w, h)) continue;
      if (overlap(x2, y2, w, h) === 0) return { x: x2, y: y2 };
    }
    return best || { x: 20 + rnd() * (REF_W - 40), y: (y0 + y1) / 2 * REF_H };
  }
  function around(origin, minD, maxD, w, h, skyOnly) {
    var yMin = skyOnly ? 248 : 560;
    var yMax = skyOnly ? 500 : REF_H - 18;
    for (var i = 0; i < 42; i++) {
      var ang = rnd() * Math.PI * 2;
      var dist = minD + rnd() * (maxD - minD);
      var x = origin.x + Math.cos(ang) * dist;
      var y = origin.y + Math.sin(ang) * dist * 0.86;
      if (x < 12 || x > REF_W - 12 || y < yMin || y > yMax) continue;
      if (blocked(x, y, w, h) || overlap(x, y, w, h) > 0) continue;
      return { x: x, y: y };
    }
    return findSpot(w, h, skyOnly ? 0.24 : 0.72, skyOnly ? 0.64 : 0.96);
  }
  function box(w, ar) {
    var a = clamp(ar || 1.78, 0.62, 2.15);
    return { w: w, h: w / a };
  }

  function addTile(spec) {
    var b = box(spec.w, spec.ar);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile" + (spec.prim ? " prim" : "") + (spec.named ? " named" : "") + (spec.xclose ? " xclose" : "") + (spec.blue ? " blue" : "");
    btn.dataset.kind = spec.kind;
    btn.dataset.id = spec.id || "";
    btn.dataset.i = String(tiles.length);
    if (spec.label) btn.setAttribute("aria-label", spec.label);
    btn.style.left = spec.x + "px";
    btn.style.top = spec.y + "px";
    btn.style.width = b.w + "px";
    btn.style.height = b.h + "px";
    var img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.decoding = "async";
    if (!spec.xclose) img.src = spec.src;
    btn.appendChild(img);
    var cap = null;
    if (spec.named) {
      cap = document.createElement("span");
      cap.className = "cap";
      var t = document.createElement("span");
      t.className = "t";
      t.textContent = spec.title || "";
      cap.appendChild(t);
      if (spec.line) {
        var ln = document.createElement("span");
        ln.className = "line";
        ln.textContent = spec.line;
        cap.appendChild(ln);
      }
      btn.appendChild(cap);
    }
    worlds[spec.d].appendChild(btn);
    var rec = {
      el: btn, img: img, cap: cap, x: spec.x, y: spec.y, w: b.w, h: b.h, d: spec.d,
      id: spec.id || "", kind: spec.kind, group: spec.group || "", prim: !!spec.prim,
      xclose: !!spec.xclose, blue: !!spec.blue, named: !!spec.named,
      src: spec.src, lg: spec.lg || "", title: spec.title || "", alt: spec.alt || "", ar: spec.ar || 1.78
    };
    tiles.push(rec);
    if (!spec.xclose) take(spec.x, spec.y, b.w, b.h);
    return rec;
  }

  function place() {
    films.forEach(function (film) {
      var hero = HERO[film.id];
      var w = hero ? hero[2] : 22 + rnd() * 8;
      var pos = hero ? { x: hero[0] * REF_W, y: hero[1] * REF_H } : findSpot(w, w / 1.78, 0.22, 0.64);
      var prim = addTile({
        kind: "film", id: film.id, prim: true, named: !!NAMED[film.id], d: 1,
        x: pos.x, y: pos.y, w: w, ar: film.ar, src: film.poster, lg: film.posterLg,
        title: film.title, line: film.line, label: film.line ? film.title + ", " + film.line : film.title
      });
      film._x = prim.x; film._y = prim.y;
      var nearN = 0;
      film.frames.forEach(function (fr) {
        var fw = fr.show ? 14 + rnd() * 6 : 13 + rnd() * 7;
        var skyOnly = !!fr.show || rnd() > 0.22;
        var sized = box(fw, fr.ar);
        var p = around(prim, fr.show ? 64 : 52, fr.show ? 150 : (nearN < 2 ? 120 : 230), sized.w, sized.h, skyOnly);
        if (!fr.show) nearN++;
        addTile({
          kind: "film", id: film.id, d: fr.show ? 2 : (nearN % 2 ? 0 : 2), xclose: !!fr.show,
          x: p.x, y: p.y, w: fw, ar: fr.ar, src: fr.src, label: film.title
        });
      });
    });
    if (D.blue && D.blue.src) {
      addTile({
        kind: "blue", id: D.blue.film || "", blue: true, d: 1,
        x: 0.50 * REF_W, y: 0.43 * REF_H, w: 108, ar: D.blue.ar, src: D.blue.src,
        label: byId[D.blue.film] ? byId[D.blue.film].title : ""
      });
    }
    var photoN = 0;
    D.practice.forEach(function (item) {
      var spot = SPOT[item.id];
      var w = spot ? spot[2] * 0.86 : (item.group === "photo" ? 28 + rnd() * 12 : 32 + rnd() * 10);
      var pos;
      if (spot) pos = { x: spot[0] * REF_W, y: spot[1] * REF_H };
      else if (item.group === "photo") {
        photoN++;
        pos = findSpot(w, w / (item.ar || 0.8), photoN % 2 ? 0.18 : 0.72, photoN % 2 ? 0.62 : 0.96);
      } else pos = findSpot(w, w / (item.ar || 1), 0.7, 0.96);
      var label = item.title || item.alt || item.group;
      addTile({
        kind: "practice", id: item.id, group: item.group, d: 1,
        x: pos.x, y: pos.y, w: w, ar: item.ar, src: item.src,
        title: item.title || "", alt: item.alt || "", label: label
      });
    });
  }

  function drawLines() {
    function pathFor(list) {
      var d = "";
      list.forEach(function (t) {
        var near = [];
        list.forEach(function (o) {
          if (o === t) return;
          var dx = t.x - o.x, dy = t.y - o.y;
          near.push({ o: o, dist: dx * dx + dy * dy });
        });
        near.sort(function (a, b) { return a.dist - b.dist; });
        near.slice(0, 2).forEach(function (n) {
          if (n.dist > 210 * 210) return;
          if (t.x + t.y > n.o.x + n.o.y) return;
          d += "M" + t.x.toFixed(1) + " " + t.y.toFixed(1) + "L" + n.o.x.toFixed(1) + " " + n.o.y.toFixed(1);
        });
      });
      return d;
    }
    [0, 1, 2].forEach(function (d) {
      var list = tiles.filter(function (t) { return t.d === d && !t.xclose; });
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathFor(d === 1 ? list.filter(function (t) { return t.prim || t.blue; }) : list.filter(function (_, i) { return i % 5 === 0; })));
      svgs[d].appendChild(path);
      var dots = d === 1 ? list.filter(function (t) { return t.prim || t.blue; }) : list.filter(function (_, i) { return i % 3 === 0; });
      dots.forEach(function (t) {
        var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", t.x.toFixed(1));
        c.setAttribute("cy", t.y.toFixed(1));
        c.setAttribute("r", d === 1 ? "2.1" : "1.4");
        svgs[d].appendChild(c);
      });
    });
    for (var i = 0; i < 18; i++) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", (20 + rnd() * 350).toFixed(1));
      c.setAttribute("cy", (90 + rnd() * 560).toFixed(1));
      c.setAttribute("r", "1.15");
      svgs[i % 2 ? 2 : 0].appendChild(c);
    }
  }

  function buildReel() {
    if (!reelHost || !D.reel) return;
    var track = document.createElement("div");
    track.className = "track";
    function add(list) {
      list.forEach(function (fr) {
        var img = document.createElement("img");
        img.src = fr.src;
        img.alt = "";
        img.draggable = false;
        img.decoding = "async";
        track.appendChild(img);
      });
    }
    add(D.reel);
    add(D.reel);
    reelHost.appendChild(track);
  }

  function measure() {
    view.w = field.clientWidth || window.innerWidth;
    view.h = field.clientHeight || window.innerHeight;
  }
  function apply() {
    base = Math.max(view.w / REF_W, view.h / REF_H) || 1;
    for (var d = 0; d < 3; d++) {
      var s = base * cam.s * DS[d];
      var x = -REF_W / 2 - cam.x * PF[d];
      var y = -REF_H / 2 - cam.y * PF[d];
      worlds[d].style.transform = "translate(" + (view.w / 2) + "px," + (view.h / 2) + "px) scale(" + s + ") translate(" + x + "px," + y + "px)";
    }
    scaleCaps();
  }
  function scaleCaps() {
    var S = base * cam.s || 1;
    var inv = (mode === "close" ? 1.22 : 1) / S;
    tiles.forEach(function (t) {
      if (!t.cap) return;
      t.cap.style.transform = "translateX(-50%) scale(" + inv + ")";
    });
    if (layerRoot) {
      var caps = layerRoot.querySelectorAll(".cap");
      var invL = 1 / S;
      for (var i = 0; i < caps.length; i++) caps[i].style.transform = "translateX(-50%) scale(" + invL + ")";
    }
  }
  function camFor(x, y, s, fracY) {
    var S = (base || 1) * s;
    return {
      s: s,
      x: x - REF_W / 2,
      y: y - REF_H / 2 - (view.h * fracY - view.h / 2) / S
    };
  }
  function clampCam() {
    var lim = layerOn ? 240 : 160;
    cam.x = clamp(cam.x, -lim, lim);
    cam.y = clamp(cam.y, -lim, lim);
  }
  function levelOf(s) {
    if (layerOn && s >= 4.25) return "layer";
    if (s >= 2.28) return "close";
    if (s >= 1.36) return "mid";
    return "far";
  }

  function arm() {
    var now = performance.now();
    if (now - armT < 90) return;
    armT = now;
    var deep = mode === "close" || mode === "layer";
    var m = 280;
    tiles.forEach(function (t) {
      if (t.img.getAttribute("src")) return;
      if (t.xclose && !deep) return;
      var r = t.el.getBoundingClientRect();
      if (r.bottom > -m && r.top < view.h + m && r.right > -m && r.left < view.w + m) t.img.src = t.src;
    });
  }
  function upgrade() {
    var S = base * cam.s;
    tiles.forEach(function (t) {
      if (!t.lg || !t.img.getAttribute("src")) return;
      var want = t.w * S > 200 ? t.lg : t.src;
      if (t.img.getAttribute("src") !== want) t.img.src = want;
    });
  }

  function paintRail() {
    if (!ticks[0] || !ticks[1]) return;
    var work = mode !== "far";
    ticks[0].classList.toggle("on", !work);
    ticks[1].classList.toggle("on", work);
    if (work) {
      ticks[1].setAttribute("aria-current", "page");
      ticks[0].removeAttribute("aria-current");
    } else {
      ticks[0].setAttribute("aria-current", "page");
      ticks[1].removeAttribute("aria-current");
    }
  }
  function markHero(id) {
    heroId = id || heroId;
    tiles.forEach(function (t) {
      t.el.classList.toggle("is-hero", !!(t.prim && t.id === heroId));
    });
  }
  function paintPager() {
    if (!pager) return;
    if (mode !== "close") { pager.hidden = true; return; }
    var i = films.findIndex(function (f) { return f.id === heroId; });
    if (i < 0) i = 0;
    pager.hidden = false;
    pager.innerHTML = "";
    var prev = films[i - 1], next = films[i + 1], cur = films[i];
    var left = document.createElement("button");
    left.type = "button";
    left.className = "prev";
    if (prev) {
      left.textContent = "‹ " + prev.title;
      left.addEventListener("click", function () { go("close", prev.id); });
    } else {
      left.textContent = "‹ " + cur.title;
      left.addEventListener("click", function () { go("mid"); });
    }
    pager.appendChild(left);
    if (next) {
      var right = document.createElement("button");
      right.type = "button";
      right.className = "next";
      right.textContent = next.title + " ›";
      right.addEventListener("click", function () { go("close", next.id); });
      pager.appendChild(right);
    }
  }
  function paintCard() {
    if (!card) return;
    var show = layerOn && cam.s >= 4.2;
    card.hidden = !show;
    if (!show) return;
    var title = "", line = "", href = "", label = "";
    if (focusKind === "practice") {
      var g = GROUPS[focusGroup] || { title: "", href: "" };
      title = g.title || "";
      line = g.line || "";
      href = g.href || "";
      label = g.title || "";
    } else {
      var f = byId[focusId];
      if (!f) return;
      title = f.title;
      line = f.line || "";
      href = f.href;
      label = "▶ play film";
    }
    titleEl.textContent = title;
    titleEl.hidden = !title;
    lineEl.textContent = line;
    lineEl.hidden = !line;
    if (href) {
      openEl.hidden = false;
      openEl.setAttribute("href", href);
      openEl.textContent = label;
    } else openEl.hidden = true;
  }
  function fadeLayer() {
    if (!layerOn) return;
    var k = clamp((cam.s - 3.55) / (5.7 - 3.55), 0, 1);
    if (layerRoot) layerRoot.style.opacity = String(k);
    tiles.forEach(function (t) {
      var keepPoster = t.prim && t.id === focusId && focusKind === "film" && !layerHasFrames;
      t.el.style.opacity = keepPoster ? "1" : String(1 - k);
    });
  }
  function syncChrome() {
    var next = levelOf(cam.s);
    var changed = next !== mode;
    mode = next;
    field.dataset.lv = mode;
    document.documentElement.dataset.sky = mode;
    if (!layerOn && cam.s < 4.2) lastMapCam = { s: cam.s, x: cam.x, y: cam.y };
    if (kicker) kicker.hidden = mode !== "close";
    if (back) back.hidden = mode === "far";
    paintRail();
    if (changed) paintPager();
    paintCard();
    placeHeroCap();
    fadeLayer();
    if (changed && (mode === "close" || mode === "layer")) armNow();
  }
  function placeHeroCap() {
    if (mode !== "close") { heroCap.hidden = true; return; }
    var hero = null;
    for (var i = 0; i < tiles.length; i++) if (tiles[i].prim && tiles[i].id === heroId) hero = tiles[i];
    var film = hero && byId[hero.id];
    if (!film) { heroCap.hidden = true; return; }
    var r = hero.el.getBoundingClientRect();
    var fr = field.getBoundingClientRect();
    var left = Math.max(10, Math.min(r.left, view.w - 180));
    var width = Math.min(Math.max(r.width, 160), view.w - left - 58);
    heroCap.hidden = false;
    heroCap.querySelector(".t").textContent = film.title;
    var line = heroCap.querySelector(".line");
    line.textContent = film.line || "";
    line.hidden = !film.line;
    heroCap.style.left = left + "px";
    heroCap.style.width = width + "px";
    heroCap.style.top = Math.max(120, r.bottom - fr.top + 10) + "px";
    veilCaption();
  }
  function veilCaption() {
    tiles.forEach(function (t) {
      if (!t._veil) return;
      t.el.style.opacity = "";
      t._veil = false;
    });
    if (mode !== "close" || heroCap.hidden) return;
    var cap = heroCap.getBoundingClientRect();
    var top = cap.top - 8, bot = cap.bottom + 14, left = cap.left - 10, right = cap.right + 10;
    tiles.forEach(function (t) {
      if (t.prim && t.id === heroId) return;
      var r = t.el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (r.bottom > top && r.top < bot && r.right > left && r.left < right) {
        t.el.style.opacity = "0";
        t._veil = true;
      }
    });
  }
  function armNow() { armT = -1e9; arm(); }

  function finishExit() {
    layerOn = false;
    layerKey = "";
    layerHasFrames = false;
    focusKind = "";
    focusId = "";
    focusGroup = "";
    if (layerRoot) {
      layerRoot.replaceChildren();
      layerRoot.style.opacity = "0";
    }
    tiles.forEach(function (t) { t.el.style.opacity = ""; });
    if (card) card.hidden = true;
  }

  function layoutGrid(frames, anchor) {
    var n = frames.length;
    if (!n) return;
    var cols = n >= 8 ? 3 : Math.max(1, Math.min(n, 3));
    var S = (base || 1) * 6.35;
    var cell = ((view.w - 24) / cols - 8) / S;
    var gap = 8 / S;
    var hs = frames.map(function (f) { return cell / clamp(f.ar || 1.78, 0.7, 2.05); });
    var rows = Math.ceil(n / cols);
    var rowH = [];
    for (var r = 0; r < rows; r++) {
      var m = 0;
      for (var c = 0; c < cols; c++) {
        var i = r * cols + c;
        if (i < n && hs[i] > m) m = hs[i];
      }
      rowH.push(m);
    }
    var totalH = 0;
    rowH.forEach(function (h) { totalH += h; });
    totalH += gap * (rows - 1);
    var totalW = cols * cell + gap * (cols - 1);
    var y = anchor.y - totalH / 2;
    var x0 = anchor.x - totalW / 2;
    frames.forEach(function (f, i) {
      var r = Math.floor(i / cols), c = i % cols;
      var yy = y;
      for (var k = 0; k < r; k++) yy += rowH[k] + gap;
      var el = document.createElement("div");
      el.className = "cell";
      var h = hs[i];
      el.style.width = cell + "px";
      el.style.height = h + "px";
      el.style.left = (x0 + c * (cell + gap)) + "px";
      el.style.top = (yy + (rowH[r] - h) / 2) + "px";
      var img = document.createElement("img");
      img.alt = f.alt || "";
      img.decoding = "async";
      img.draggable = false;
      img.src = f.lg || f.src;
      el.appendChild(img);
      if (f.title) {
        var cap = document.createElement("span");
        cap.className = "cap";
        cap.textContent = f.title;
        el.appendChild(cap);
      }
      layerRoot.appendChild(el);
    });
  }

  function mountLayer(spec, snapshot) {
    var key = spec.kind === "practice" ? "practice:" + spec.group : "film:" + spec.id;
    if (layerOn && layerKey === key) return;
    if (!layerOn) savedCam = snapshot || { s: cam.s, x: cam.x, y: cam.y };
    layerOn = true;
    layerKey = key;
    layerRoot.replaceChildren();
    var frames = [];
    if (spec.kind === "practice") {
      focusKind = "practice";
      focusGroup = spec.group;
      focusId = "";
      var items = tiles.filter(function (t) {
        if (t.kind !== "practice" || t.group !== spec.group) return false;
        if (spec.group === "joio" && t.id.indexOf("joio-") !== 0) return false;
        return true;
      });
      focusAnchor = { x: spec.x, y: spec.y };
      frames = items.map(function (t) { return { src: t.src, ar: t.ar, title: t.title, alt: t.alt || t.title }; });
      layerHasFrames = frames.length > 0;
    } else {
      focusKind = "film";
      focusId = spec.id;
      focusGroup = "";
      var film = byId[spec.id];
      var prim = null;
      tiles.forEach(function (t) { if (t.prim && t.id === spec.id) prim = t; });
      focusAnchor = prim ? { x: prim.x, y: prim.y } : { x: spec.x, y: spec.y };
      var extra = (window.GJ_LAYERS && window.GJ_LAYERS[spec.id]) || [];
      layerHasFrames = extra.length > 0;
      if (layerHasFrames) {
        if (film) frames.push({ src: film.poster, lg: film.posterLg, ar: film.ar, alt: film.title });
        extra.forEach(function (fr) { frames.push({ src: fr.src, ar: fr.ar, alt: film ? film.title : "" }); });
      }
      heroId = spec.id;
      markHero(spec.id);
    }
    layoutGrid(frames, focusAnchor);
    paintCard();
  }

  function primaryOf(id) {
    for (var i = 0; i < tiles.length; i++) if (tiles[i].prim && tiles[i].id === id) return tiles[i];
    return null;
  }
  function nearestHero(sx, sy) {
    if (sx == null) { sx = view.w / 2; sy = view.h * 0.38; }
    var best = null, bd = 1e15;
    tiles.forEach(function (t) {
      if (!t.prim) return;
      var r = t.el.getBoundingClientRect();
      var dx = r.left + r.width / 2 - sx, dy = r.top + r.height / 2 - sy;
      var d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = t; }
    });
    return best;
  }

  function tween(to, instant, done) {
    if (tweenRAF) cancelAnimationFrame(tweenRAF);
    var from = { s: cam.s, x: cam.x, y: cam.y };
    autoLayer = false;
    if (instant || reduce) {
      cam.s = to.s; cam.x = to.x; cam.y = to.y;
      apply(); syncChrome(); armNow(); upgrade();
      autoLayer = true;
      if (done) done();
      return;
    }
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min(1, (now - t0) / 700);
      var e = 1 - Math.pow(1 - p, 3);
      cam.s = from.s + (to.s - from.s) * e;
      cam.x = from.x + (to.x - from.x) * e;
      cam.y = from.y + (to.y - from.y) * e;
      apply(); syncChrome();
      if (p < 1) tweenRAF = requestAnimationFrame(frame);
      else {
        tweenRAF = 0;
        autoLayer = true;
        armNow(); upgrade();
        if (done) done();
      }
    }
    tweenRAF = requestAnimationFrame(frame);
  }

  function writeUrl(level, id, replace) {
    var u = location.pathname;
    if (level && level !== "far") {
      u += "?sky=" + encodeURIComponent(level);
      if (id) u += "&film=" + encodeURIComponent(id);
    }
    var st = { gjsky: 1, sky: level, film: id || "", cam: { s: cam.s, x: cam.x, y: cam.y }, saved: savedCam };
    var same = history.state && history.state.gjsky && history.state.sky === level && (history.state.film || "") === (id || "");
    if (replace) history.replaceState(st, "", u);
    else if (!same) history.pushState(st, "", u);
  }
  function urlId() {
    if (mode === "layer") return focusKind === "practice" ? focusGroup : focusId;
    if (mode === "close") return heroId;
    return "";
  }

  function go(level, id, instant, tile, fromHist) {
    driftOn = false;
    if (window.scrollY > 2) window.scrollTo(0, 0);
    var leave = level !== "layer" && layerOn;
    var target;
    if (level === "layer") {
      var spec = tile || { kind: "film", id: id, x: 0, y: 0 };
      if (!spec.x && spec.kind !== "practice") {
        var p = primaryOf(spec.id);
        if (p) { spec.x = p.x; spec.y = p.y; }
      }
      mountLayer(spec);
      var a = focusAnchor || { x: REF_W / 2, y: REF_H / 2 };
      target = camFor(a.x, a.y, 6.35, focusKind === "practice" ? 0.52 : 0.54);
    } else if (level === "close") {
      var filmId = id || heroId;
      var prim = primaryOf(filmId) || primaryOf(films[0].id);
      markHero(prim.id);
      target = camFor(prim.x, prim.y, 3.22, 0.30);
    } else if (level === "mid") {
      var bias = id ? primaryOf(id) : null;
      target = { s: 1.78, x: 8, y: -84 };
      if (bias) {
        var c = camFor(bias.x, bias.y, 1.78, 0.42);
        target = { s: 1.78, x: target.x * 0.7 + c.x * 0.3, y: target.y * 0.7 + c.y * 0.3 };
      }
    } else {
      level = "far";
      target = { s: 1, x: 0, y: 0 };
    }
    tween(target, !!instant, function () {
      if (leave) finishExit();
      syncChrome();
      if (mode === "close") paintPager();
      if (!fromHist) writeUrl(mode, urlId(), !!instant && !history.state);
      markReady();
    });
  }

  function stepOut() {
    driftOn = false;
    if (layerOn) {
      var backCam = savedCam || lastMapCam || { s: 3.1, x: cam.x, y: cam.y };
      if (focusKind === "film" && focusId) markHero(focusId);
      var dest = { s: backCam.s, x: backCam.x, y: backCam.y };
      tween(dest, false, function () {
        finishExit();
        syncChrome();
        if (mode === "close") paintPager();
        writeUrl(mode, urlId(), false);
        markReady();
      });
      return;
    }
    if (cam.s >= 2.28) go("mid");
    else if (cam.s >= 1.36) go("far");
  }

  function zoomAt(sx, sy, factor) {
    factor = clamp(factor, 0.82, 1.22);
    var S = base * cam.s;
    var wx = (sx - view.w / 2) / S + REF_W / 2 + cam.x;
    var wy = (sy - view.h / 2) / S + REF_H / 2 + cam.y;
    cam.s = clamp(cam.s * factor, 0.9, 8.2);
    var S2 = base * cam.s;
    cam.x = wx - (sx - view.w / 2) / S2 - REF_W / 2;
    cam.y = wy - (sy - view.h / 2) / S2 - REF_H / 2;
    clampCam();
    if (autoLayer && !layerOn && cam.s > 5.05) {
      var hit = document.elementFromPoint(sx, sy);
      var btn = hit && hit.closest ? hit.closest(".tile") : null;
      var rec = btn ? tiles[+btn.dataset.i] : nearestHero(sx, sy);
      if (rec) {
        if (rec.kind === "practice") mountLayer(rec, gestureCam || lastMapCam);
        else if (rec.id && byId[rec.id]) mountLayer({ kind: "film", id: rec.id, x: rec.x, y: rec.y }, gestureCam || lastMapCam);
      }
    }
    apply();
    syncChrome();
    arm();
  }

  function settle() {
    if (tweenRAF) return;
    if (layerOn && cam.s < 4.45) {
      var backCam = savedCam || lastMapCam;
      tween(backCam, false, function () {
        finishExit();
        syncChrome();
        paintPager();
        writeUrl(mode, urlId(), false);
        markReady();
      });
      return;
    }
    writeUrl(mode, urlId(), false);
  }

  function onTile(rec) {
    if (!rec || mode === "layer") return;
    if (mode === "far") {
      if (rec.kind === "film" || rec.blue) go("mid", rec.id);
      else go("mid");
      return;
    }
    if (rec.kind === "practice") {
      go("layer", rec.group, false, rec);
      return;
    }
    var id = rec.id && byId[rec.id] ? rec.id : heroId;
    if (mode === "mid") go("close", id);
    else go("layer", id, false, rec.kind === "film" || rec.blue ? { kind: "film", id: id, x: rec.x, y: rec.y } : null);
  }

  function markReady() {
    document.documentElement.dataset.skyReady = "";
    armNow();
    upgrade();
    var imgs = [];
    field.querySelectorAll("img").forEach(function (im) {
      if (!im.getAttribute("src")) return;
      var r = im.getBoundingClientRect();
      if (r.width && r.bottom > -30 && r.top < view.h + 30 && r.right > -30 && r.left < view.w + 30) imgs.push(im);
    });
    var wait = imgs.filter(function (im) { return !im.complete; });
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      fonts.then(function () {
        document.documentElement.dataset.sky = mode;
        document.documentElement.dataset.skyReady = "1";
      });
    }
    if (!wait.length) { finish(); return; }
    var left = wait.length;
    function one() { if (--left <= 0) finish(); }
    wait.forEach(function (im) {
      im.addEventListener("load", one, { once: true });
      im.addEventListener("error", one, { once: true });
    });
    setTimeout(finish, 4500);
  }

  function boot() {
    document.documentElement.classList.add("has-field");
    field.hidden = false;
    measure();
    for (var d = 0; d < 3; d++) {
      var w = document.createElement("div");
      w.className = "world " + ["back", "mid", "front"][d];
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "sky-lines");
      svg.setAttribute("viewBox", "0 0 " + REF_W + " " + REF_H);
      svg.setAttribute("aria-hidden", "true");
      w.appendChild(svg);
      worldsHost.appendChild(w);
      worlds.push(w);
      svgs.push(svg);
    }
    layerRoot = document.createElement("div");
    layerRoot.className = "layer-root";
    worlds[1].appendChild(layerRoot);
    place();
    drawLines();
    buildReel();
    var mark = document.querySelector("main .mark");
    if (mark) field.appendChild(mark);
    document.querySelectorAll(".cluster img, .minis img").forEach(function (img) {
      var src = img.getAttribute("src");
      if (!src) return;
      held.push([img, src]);
      img.removeAttribute("src");
    });
    field.setAttribute("aria-label", "Films");
    field.appendChild(heroCap);
    apply();
    var start = params.get("sky") || (location.hash === "#films" ? "mid" : "far");
    var startFilm = params.get("film") || "";
    if (location.hash === "#films") scrollTo(0, 0);
    if (start === "layer" && startFilm) {
      if (GROUPS[startFilm]) {
        var sample = null;
        tiles.forEach(function (t) {
          if (!sample && t.kind === "practice" && t.group === startFilm && (startFilm !== "joio" || t.id.indexOf("joio-") === 0)) sample = t;
        });
        if (sample) go("layer", startFilm, true, sample);
        else go("mid", null, true);
      } else go("layer", startFilm, true);
    } else if (start === "close") go("close", startFilm || films[0].id, true);
    else if (start === "mid") go("mid", startFilm, true);
    else go("far", null, true);

    field.addEventListener("click", function (e) {
      if (document.documentElement.dataset.drag === "1") {
        document.documentElement.dataset.drag = "";
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      var btn = e.target.closest(".tile");
      if (!btn || !field.contains(btn)) return;
      e.preventDefault();
      e.stopPropagation();
      onTile(tiles[+btn.dataset.i]);
    });
    if (back) back.addEventListener("click", function (e) { e.preventDefault(); stepOut(); });
    if (ticks[0]) ticks[0].addEventListener("click", function (e) { e.preventDefault(); go("far"); });
    if (ticks[1]) ticks[1].addEventListener("click", function (e) {
      e.preventDefault();
      if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
      go("mid");
    });

    var drag = null;
    field.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a, .sky-pager")) return;
      if (e.pointerType === "touch" && mode === "far") return;
      driftOn = false;
      if (!gestureCam) gestureCam = { s: cam.s, x: cam.x, y: cam.y };
      var btn = e.target.closest ? e.target.closest(".tile") : null;
      drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false, id: e.pointerId, tile: btn };
      try { field.setPointerCapture(e.pointerId); } catch (err) {}
    });
    field.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (dx * dx + dy * dy > 36) drag.moved = true;
      if (!drag.moved || mode === "far") return;
      var S = base * cam.s || 1;
      cam.x = drag.cx - dx / S;
      cam.y = drag.cy - dy / S;
      clampCam();
      apply();
      syncChrome();
      arm();
    });
    field.addEventListener("pointerup", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var tile = drag.tile;
      var moved = drag.moved;
      drag = null;
      gestureCam = null;
      if (moved) {
        document.documentElement.dataset.drag = "1";
        settle();
        return;
      }
      if (tile && field.contains(tile)) onTile(tiles[+tile.dataset.i]);
      settle();
    });
    field.addEventListener("pointercancel", function () { drag = null; gestureCam = null; });

    field.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) {
        driftOn = false;
        if (!gestureCam) gestureCam = { s: cam.s, x: cam.x, y: cam.y };
        field._pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        e.preventDefault();
      }
    }, { passive: false });
    field.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2 && field._pinch) {
        e.preventDefault();
        var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        var cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        zoomAt(cx, cy, dist / field._pinch);
        field._pinch = dist;
        document.documentElement.dataset.drag = "1";
      }
    }, { passive: false });
    field.addEventListener("touchend", function () { field._pinch = 0; });

    var wheelT = 0;
    field.addEventListener("wheel", function (e) {
      if (mode === "far" && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      driftOn = false;
      if (!gestureCam) gestureCam = { s: cam.s, x: cam.x, y: cam.y };
      var factor = Math.exp(-e.deltaY * (e.ctrlKey || e.metaKey ? 0.008 : 0.0015));
      zoomAt(e.clientX, e.clientY, factor);
      clearTimeout(wheelT);
      wheelT = setTimeout(function () { gestureCam = null; settle(); }, 200);
    }, { passive: false });

    document.addEventListener("keydown", function (e) {
      if (e.target && e.target.closest && e.target.closest("input, textarea")) return;
      if (e.key === "Escape") { e.preventDefault(); stepOut(); }
      else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        if (mode === "far") go("mid");
        else if (mode === "mid") go("close", nearestHero() ? nearestHero().id : heroId);
        else if (mode === "close") go("layer", heroId);
      } else if (e.key === "-" || e.key === "_") { e.preventDefault(); stepOut(); }
    });

    window.addEventListener("popstate", function (ev) {
      var st = ev.state && ev.state.gjsky ? ev.state : null;
      if (!st) { go("far", null, true, null, true); return; }
      savedCam = st.saved || null;
      if (st.sky === "layer" && st.film && GROUPS[st.film]) {
        var sample = null;
        tiles.forEach(function (t) {
          if (!sample && t.kind === "practice" && t.group === st.film) sample = t;
        });
        if (sample) go("layer", st.film, true, sample, true);
        else go("mid", null, true, null, true);
      } else go(st.sky || "far", st.film || "", true, null, true);
    });

    window.addEventListener("resize", function () { measure(); apply(); });

    document.addEventListener("click", function (e) {
      if (document.documentElement.dataset.drag === "1") {
        e.preventDefault();
        e.stopPropagation();
        document.documentElement.dataset.drag = "";
      }
    }, true);

    if (driftOn) {
      var t0 = performance.now();
      (function loop(now) {
        if (driftOn && mode === "far" && !tweenRAF) {
          cam.x = Math.sin((now - t0) / 4200) * 8;
          cam.y = Math.cos((now - t0) / 5600) * 5;
          apply();
        }
        if (driftOn) requestAnimationFrame(loop);
      })(t0);
    }
  }

  var farN = 0, closeN = 0, practiceN = 0;
  try {
    boot();
    tiles.forEach(function (t) {
      if (t.kind === "film" && !t.blue) {
        closeN++;
        if (!t.xclose) farN++;
      } else if (t.kind === "practice") practiceN++;
    });
  } catch (err) {
    console.error(err);
    document.documentElement.classList.remove("has-field");
    if (field) field.hidden = true;
    held.forEach(function (pair) { pair[0].setAttribute("src", pair[1]); });
  }

  window.GJ_SKY = {
    counts: function () {
      var layers = window.GJ_LAYERS || {};
      var wk = layers["weird-kid"] ? layers["weird-kid"].length : 0;
      return {
        farFilm: farN,
        closeFilm: closeN,
        practice: practiceN,
        reel: D.reel ? D.reel.length : 0,
        layers: 3,
        layerFrames: window.GJ_LAYER_META ? window.GJ_LAYER_META.frames : 0,
        weirdKidFrames: wk,
        level: mode
      };
    }
  };
})();
