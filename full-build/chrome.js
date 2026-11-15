/* Wayfinding for every room in the full-build preview.
   The syllabics mark returns to the field. Escape does the same when the room
   has not already claimed it. Toggles live in Tune and are remembered.

   Tune (Nov 14) is not a sliding panel any more. It is a small 3D object that unfolds out of the Mark and folds back
   into it (chrome.css has the motion). The + beside the Mark opens it, in every room. Same ids and keys as before:
   #gj-back, #gj-dial, #gj-red, #gj-drawer (.on while open), #gj-togs, #gj-rooms, #gj-onward, GJ.get / GJ.set / GJ.hub,
   and a "gj-tog" event on every change. New: GJ.tune.open() / close() / toggle() / isOpen(). */
(function () {
  if (window.__gjChrome) return;
  window.__gjChrome = 1;
  var s = document.currentScript;
  if (s && s.src && document.head && !document.querySelector('link[rel="icon"]')) {
    var icon = document.createElement("link");
    icon.rel = "icon";
    icon.href = new URL("src/b33/site-v3-pro2/img/favicon-32.png", s.src).href;
    document.head.appendChild(icon);
  }
  if (s && s.src && document.head && !document.querySelector('link[rel="manifest"]')) {
    var man = document.createElement("link");
    man.rel = "manifest";
    man.href = new URL("manifest.webmanifest", s.src).href;
    document.head.appendChild(man);
  }
  if (document.head && !document.querySelector('meta[name="theme-color"]')) {
    var tc = document.createElement("meta");
    tc.name = "theme-color";
    tc.content = "#03050b";
    document.head.appendChild(tc);
  }
  if (s && s.src && document.head && !document.querySelector('link[rel="apple-touch-icon"]')) {
    var ap = document.createElement("link");
    ap.rel = "apple-touch-icon";
    ap.href = new URL("icons/mark-192.png", s.src).href;
    document.head.appendChild(ap);
  }
  var HUB = (s && s.getAttribute("data-hub")) || "index.html";
  var ROOMS = (s && s.getAttribute("data-rooms")) || "rooms.json";
  var hubPage = document.body.classList.contains("gj-hub");
  var root = document.documentElement;
  var RMQ = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  /* Where two liked versions differ there is a toggle. Remembered per visitor; the default is the liked version.
     kind: bool ("1" / "0"), choice, or range. A room can add its own rows by setting window.GJ_TUNE_ROWS before this file. */
  var TOGS = [
    { k: "gj-tog-moon", label: "crescent moon", def: "1", kind: "bool" },
    { k: "gj-tog-density", label: "mark density", def: "sparse", kind: "choice",
      opts: [["sparse", "fewer stars"], ["spread", "spread"], ["shallow", "shallow"], ["sketch", "220 stars"]] },
    { k: "gj-tog-depth", label: "depth", def: "rest", kind: "choice",
      opts: [["rest", "flat, then 3D"], ["flat", "stay flat"], ["hold", "hold the depth"]] },
    { k: "gj.tilt.on", label: "Resting tilt", def: "0", kind: "bool" },
    { k: "gj-tog-reflect", label: "shelf reflections", def: "1", kind: "bool" },
    { k: "gj-tog-water", label: "opener water", def: "1", kind: "bool" },
    { k: "gj.amb.on", label: "ambience", def: "1", kind: "bool" },
    { k: "gj-tog-markphotos", label: "mark", def: "mark", kind: "choice",
      opts: [["mark", "mark only"], ["photos", "with object photos"]] },
    { k: "gj-tog-flatdeep", label: "mark field", def: "flat", kind: "choice",
      opts: [["flat", "nearly flat"], ["deep", "deep starfield"]] },
    { k: "gj-tog-name", label: "film names", def: "0", kind: "bool" },
    /* the bio's own switch (About): the calculator, the glitch and the flicker hold still on one frame */
    { k: "gj.noflash", label: "stop flashing", def: "0", kind: "bool",
      when: function () { return !!window.GJ_BIOCTL || /(^|[\/#])(about|bio)([\/#?]|$)/i.test(location.pathname + location.hash); } }
  ];
  /* The camera. These are the camera logic dial's own choices (modules/camera-dial, localStorage "gj.cam"): Tune and the dial
     read and write the same values, so there is one camera language. */
  var CAM_KEY = "gj.cam";
  var CAM = [
    { c: "drift", label: "drift", def: "off", opts: [["off", "off"], ["slow", "slow"]] },
    { c: "depth", label: "landing", def: "mid", opts: [["far", "far"], ["mid", "mid"], ["close", "close"]] },
    { c: "release", label: "release", def: "settle", opts: [["stay", "stay"], ["settle", "settle"], ["snap", "snap"]] }
  ];
  (window.GJ_TUNE_ROWS || []).forEach(function (r) { if (r && r.k && r.label) TOGS.push(r); });

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function set(k, v) {
    put(k, v);
    /* the safelight is one light: the red-mode dot and the Photo lab's darkroom share it */
    if (k === "gj-red") put("gj-photo-lab-safelight", v === "1" ? "1" : "0");
    apply(); paint();
    if (k === "gj.amb.on") pushAmb(v);
    window.dispatchEvent(new CustomEvent("gj-tog", { detail: { k: k, v: v } }));
  }
  function camGet() { var o = {}; try { o = JSON.parse(localStorage.getItem(CAM_KEY) || "{}") || {}; } catch (e) {} return o; }
  function camVal(c) { var d = window.GJ_CAMDIAL, r = CAM.filter(function (q) { return q.c === c; })[0], v;
    try { v = d && d.get ? d.get()[c] : camGet()[c]; } catch (e) { v = camGet()[c]; }
    return r.opts.some(function (o) { return o[0] === v; }) ? v : r.def; }
  function camSet(c, v) {
    var d = window.GJ_CAMDIAL;
    if (d && d.set) { try { d.set(c, v); } catch (e) {} }
    else { var o = camGet(); o[c] = v; put(CAM_KEY, JSON.stringify(o)); try { window.dispatchEvent(new CustomEvent("gj:camera", { detail: { values: o, params: null } })); } catch (e) {} }
    /* release and depth are the same idea in two places: stay = hold the depth, settle = flat, then 3D */
    if (c === "release") { var dm = get("gj-tog-depth", "rest"); if (v === "stay" && dm !== "hold") set("gj-tog-depth", "hold"); else if (v !== "stay" && dm === "hold") set("gj-tog-depth", "rest"); }
    paint();
  }

  function pushAmb(v) {
    if (v == null) v = get("gj.amb.on", "1");
    var wins = [window];
    document.querySelectorAll("iframe").forEach(function (f) {
      try { if (f.contentWindow) wins.push(f.contentWindow); } catch (e) {}
    });
    wins.forEach(function (w) {
      try { if (w.AMBX && w.AMBX.setOn) w.AMBX.setOn(v === "1"); } catch (e) {}
      try { w.dispatchEvent(new w.StorageEvent("storage", { key: "gj.amb.on", newValue: v })); } catch (e) {}
    });
  }
  function apply() {
    var redOn = get("gj-red", "0") === "1";
    root.classList.toggle("rm", redOn);
    root.classList.toggle("gj-noreflect", get("gj-tog-reflect", "1") !== "1");
    root.classList.toggle("gj-nowater", get("gj-tog-water", "1") !== "1");
    root.classList.toggle("gj-nomoon", get("gj-tog-moon", "1") !== "1");
    root.classList.toggle("gj-noamb", get("gj.amb.on", "1") === "0");
    root.classList.toggle("gj-noflash", get("gj.noflash", "0") === "1");
    /* red mode uses the room's own red theme (data-gj-c / data-theme). It never filters a photograph or a video. */
    if (redOn) {
      if (!root.hasAttribute("data-gj-theme-prev")) {
        root.setAttribute("data-gj-theme-prev", root.getAttribute("data-theme") || "");
        root.setAttribute("data-gj-c-prev", root.getAttribute("data-gj-c") || "");
      }
      root.setAttribute("data-theme", "red");
      root.setAttribute("data-gj-c", "red");
    } else if (root.hasAttribute("data-gj-theme-prev")) {
      var pt = root.getAttribute("data-gj-theme-prev"), pc = root.getAttribute("data-gj-c-prev");
      if (pt) root.setAttribute("data-theme", pt); else root.removeAttribute("data-theme");
      if (pc) root.setAttribute("data-gj-c", pc); else root.removeAttribute("data-gj-c");
      root.removeAttribute("data-gj-theme-prev");
      root.removeAttribute("data-gj-c-prev");
    }
    var red = document.querySelector("#gj-red");
    if (red) red.setAttribute("aria-pressed", redOn ? "true" : "false");
    syncFrames();
  }
  function syncFrames() {
    var frames = document.querySelectorAll("iframe");
    for (var i = 0; i < frames.length; i++) {
      try {
        var doc = frames[i].contentDocument;
        if (!doc) continue;
        var a = document.documentElement, b = doc.documentElement;
        b.classList.toggle("rm", a.classList.contains("rm"));
        b.classList.toggle("gj-nomoon", a.classList.contains("gj-nomoon"));
        b.classList.toggle("gj-nowater", a.classList.contains("gj-nowater"));
        b.classList.toggle("gj-noamb", a.classList.contains("gj-noamb"));
        if (a.classList.contains("rm")) { b.setAttribute("data-theme", "red"); b.setAttribute("data-gj-c", "red"); }
        else if (b.getAttribute("data-theme") === "red") { b.removeAttribute("data-theme"); b.removeAttribute("data-gj-c"); }
      } catch (e) {}
    }
  }

  function goHub() { location.href = HUB; }
  function goHref(a) { if (!a) return; a.addEventListener("click", function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; e.preventDefault(); location.href = a.href; }); }

  var back = document.createElement("a");
  back.id = "gj-back"; back.href = HUB;
  back.setAttribute("aria-label", "back to the field");
  back.innerHTML = "‹ <b lang=\"cr\">ᑕᐣᓯ</b>";
  document.documentElement.appendChild(back);
  /* a sideways swipe can swallow the click that follows it; a still pointerup on the mark still leaves */
  (function () {
    var tap = null;
    back.addEventListener("pointerdown", function (e) { tap = { x: e.clientX, y: e.clientY, clicked: false }; });
    back.addEventListener("click", function () { if (tap) tap.clicked = true; });
    back.addEventListener("pointerup", function (e) {
      if (!tap) return;
      var d = tap; tap = null;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return;
      setTimeout(function () { if (!d.clicked) location.href = back.href; }, 80);
    });
  })();

  /* Tune's handle: the + beside the Mark */
  var dial = document.createElement("button");
  dial.id = "gj-dial"; dial.type = "button";
  dial.innerHTML = "<span aria-hidden=\"true\">+</span><b class=\"vh\">tune</b>";
  dial.setAttribute("aria-label", "tune");
  dial.setAttribute("title", "tune");
  dial.setAttribute("aria-expanded", "false");
  dial.setAttribute("aria-controls", "gj-drawer");
  document.documentElement.appendChild(dial);
  /* first view: a compact "tune" chip beside the +, dismissed on the first open */
  var hint = document.createElement("div");
  hint.id = "gj-tune-hint"; hint.setAttribute("role", "note"); hint.setAttribute("aria-hidden", "true");
  hint.textContent = "tune";
  document.documentElement.appendChild(hint);
  function hideHint() { hint.classList.remove("on"); if (get("gj.tune.seen", "0") !== "1") put("gj.tune.seen", "1"); }
  if (get("gj.tune.seen", "0") !== "1") hint.classList.add("on");

  var red = document.createElement("button");
  red.id = "gj-red"; red.type = "button";
  red.setAttribute("aria-label", "red mode");
  red.innerHTML = "<i></i>";
  red.addEventListener("click", function () { set("gj-red", get("gj-red", "0") === "1" ? "0" : "1"); });
  document.documentElement.appendChild(red);

  /* the safelight's lamp edge (a 10px warm band at the screen edges; it never sits over a picture's middle) */
  var safe = document.createElement("div");
  safe.id = "gj-safe"; safe.setAttribute("aria-hidden", "true");
  document.documentElement.appendChild(safe);

  var drawer = document.createElement("aside");
  drawer.id = "gj-drawer";
  drawer.setAttribute("aria-label", "tuning");
  drawer.innerHTML = "<div class=\"gj-3d\"><div class=\"gj-plate\">" +
    "<h2 class=\"gj-pl gj-head\">tune <button type=\"button\" id=\"gj-tune-close\" aria-label=\"close tune\">×</button></h2>" +
    "<div id=\"gj-togs\" class=\"gj-plate\"></div>" +
    "<h2 class=\"gj-pl\">camera</h2><div id=\"gj-cam\" class=\"gj-plate\"></div>" +
    "<h2 class=\"gj-pl\"><button type=\"button\" id=\"gj-rooms-btn\" aria-expanded=\"false\" aria-controls=\"gj-rooms\">rooms <em></em></button></h2>" +
    "<nav id=\"gj-rooms\" class=\"gj-plate\" hidden></nav><p id=\"gj-onward\" class=\"gj-pl\"></p>" +
    "<p id=\"gj-pins\" class=\"gj-pl\"><a id=\"gj-pin-bio\">bio</a><a id=\"gj-pin-beyond\">beyond</a></p>" +
    "<div id=\"gj-beyond\" class=\"row gj-pl\"><span>beyond</span><span class=\"seg\" role=\"radiogroup\" aria-label=\"beyond\">" +
    "<button type=\"button\" role=\"radio\" data-v=\"off\">off</button>" +
    "<button type=\"button\" role=\"radio\" data-v=\"red\">red</button>" +
    "<button type=\"button\" role=\"radio\" data-v=\"colour\">colour</button>" +
    "<button type=\"button\" role=\"radio\" data-v=\"light\">light</button></span></div>" +
    "</div></div>";
  document.documentElement.appendChild(drawer);
  var obj = drawer.querySelector(".gj-3d");

  /* ---------- rows ---------- */
  var painters = [];
  function paint() { painters.forEach(function (f) { try { f(); } catch (e) {} }); }
  function rowEl(labelText) {
    var row = document.createElement("div");
    row.className = "row gj-pl";
    var name = document.createElement("span");
    name.textContent = labelText;
    row.appendChild(name);
    return row;
  }
  function boolRow(t) {
    var row = rowEl(t.label), b = document.createElement("button");
    b.type = "button"; b.className = "tog"; b.setAttribute("aria-label", t.label);
    b.setAttribute("data-k", t.k);
    painters.push(function () { var on = get(t.k, t.def) === "1"; b.textContent = on ? "on" : "off"; b.setAttribute("aria-pressed", on ? "true" : "false"); });
    b.addEventListener("click", function () {
      var v = get(t.k, t.def) === "1" ? "0" : "1";
      if (t.k === "gj.noflash" && window.GJ_BIOCTL && GJ_BIOCTL.setNoflash) { try { GJ_BIOCTL.setNoflash(v === "1"); } catch (e) {} }
      set(t.k, v);
    });
    row.appendChild(b);
    return row;
  }
  function segRow(label, opts, read, write, key) {
    var row = rowEl(label), seg = document.createElement("span"), btns = [];
    seg.className = "seg"; seg.setAttribute("role", "radiogroup"); seg.setAttribute("aria-label", label);
    if (key) seg.setAttribute("data-k", key);
    opts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("data-v", o[0]); b.textContent = o[1];
      b.addEventListener("click", function () { write(o[0]); });
      seg.appendChild(b); btns.push(b);
    });
    painters.push(function () { var v = read(); btns.forEach(function (b) { b.setAttribute("aria-checked", b.getAttribute("data-v") === v ? "true" : "false"); }); });
    if (opts.map(function (o) { return o[1]; }).join("").length > 18) row.classList.add("stack");
    row.appendChild(seg);
    return row;
  }
  function rangeRow(t) {
    var row = rowEl(t.label), r = document.createElement("input"), out = document.createElement("output");
    r.type = "range"; r.min = t.min; r.max = t.max; r.step = t.step || 1; r.setAttribute("aria-label", t.label); r.setAttribute("data-k", t.k);
    painters.push(function () { var v = get(t.k, String(t.def)); r.value = v; out.textContent = v; });
    r.addEventListener("input", function () { out.textContent = r.value; put(t.k, r.value); window.dispatchEvent(new CustomEvent("gj-tog", { detail: { k: t.k, v: r.value } })); });
    row.appendChild(r); row.appendChild(out);
    return row;
  }
  var host = drawer.querySelector("#gj-togs");
  TOGS.forEach(function (t) {
    if (t.when && !t.when()) return;
    var row = t.kind === "bool" ? boolRow(t) : t.kind === "range" ? rangeRow(t)
      : segRow(t.label, t.opts, function () { var v = get(t.k, t.def); return t.opts.some(function (o) { return o[0] === v; }) ? v : t.def; }, function (v) {
          set(t.k, v);
          /* depth and the camera's release are one idea: hold the depth = stay */
          if (t.k === "gj-tog-depth") { var rel = camVal("release"); if (v === "hold" && rel !== "stay") camSet("release", "stay"); else if (v !== "hold" && rel === "stay") camSet("release", "settle"); }
        }, t.k);
    host.appendChild(row);
  });
  var camHost = drawer.querySelector("#gj-cam");
  CAM.forEach(function (c) { camHost.appendChild(segRow(c.label, c.opts, function () { return camVal(c.c); }, function (v) { camSet(c.c, v); }, "gj.cam:" + c.c)); });
  /* the camera logic dial itself, where a room has it: it slides out like the other dials, and Tune folds as it does */
  (function () {
    var row = rowEl("camera dial"), b = document.createElement("button");
    b.type = "button"; b.className = "tog"; b.textContent = "open"; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { var d = window.GJ_CAMDIAL; if (!d || !d.open) return; show(false); setTimeout(function () { try { d.open(); } catch (e) {} }, 60); });
    row.appendChild(b); camHost.appendChild(row);
    painters.push(function () { row.hidden = !(window.GJ_CAMDIAL && GJ_CAMDIAL.open && document.getElementById("cam-dial")); row.style.display = row.hidden ? "none" : ""; });
  })();
  /* the dial turned: Tune shows the same values, and "stay" / "settle" keep the depth toggle in step */
  addEventListener("gj:camera", function (e) {
    var v = e.detail && e.detail.values;
    if (v && v.release) { var dm = get("gj-tog-depth", "rest"); if (v.release === "stay" && dm !== "hold") set("gj-tog-depth", "hold"); else if (v.release !== "stay" && dm === "hold") set("gj-tog-depth", "rest"); }
    paint();
  });
  addEventListener("storage", function (e) { if (!e.key || e.key.indexOf("gj") === 0) { apply(); paint(); } });

  /* beyond (red · colour · light): compact Tune row + a pin, so it is reachable from every room, not only film and the archive */
  (function () {
    var bio = "src/sky/player/tonight/fable-m4/index.html#about/bio";
    var arch = "src/sky/archive-index/index.html";
    var pinBio = drawer.querySelector("#gj-pin-bio"), pinBy = drawer.querySelector("#gj-pin-beyond");
    pinBio.href = new URL(bio, new URL(HUB, location.href)).href;
    goHref(pinBio); goHref(pinBy);
    function beyondState() {
      var st = { mode: "off", red: .7, colour: 0, light: .5, depth: 1, drift: 1, ease: 1, orbit: 0 };
      try { var cur = JSON.parse(localStorage.getItem("gj.beyond") || "null"); if (cur) for (var k in cur) if (cur[k] != null) st[k] = cur[k]; } catch (e) {}
      return st;
    }
    function beyondMode() { var m = beyondState().mode; return m === "red" || m === "colour" || m === "light" ? m : "off"; }
    function beyondHref(mode) {
      var m = mode || beyondMode();
      return new URL(arch + (m !== "off" ? "?beyond=" + encodeURIComponent(m) : ""), new URL(HUB, location.href)).href;
    }
    function beyondPaint() {
      var m = beyondMode();
      pinBy.href = beyondHref(m);
      drawer.querySelectorAll("#gj-beyond [data-v]").forEach(function (b) {
        b.setAttribute("aria-checked", b.getAttribute("data-v") === m ? "true" : "false");
      });
    }
    drawer.querySelectorAll("#gj-beyond [data-v]").forEach(function (b) {
      b.addEventListener("click", function () {
        var st = beyondState(); st.mode = b.getAttribute("data-v");
        try { localStorage.setItem("gj.beyond", JSON.stringify(st)); } catch (e) {}
        beyondPaint();
      });
    });
    painters.push(beyondPaint);
    beyondPaint();
  })();

  /* rooms: folded away until asked for, so Tune stays small */
  var roomsBtn = drawer.querySelector("#gj-rooms-btn"), roomsNav = drawer.querySelector("#gj-rooms");
  roomsBtn.addEventListener("click", function () {
    var on = roomsNav.hidden; roomsNav.hidden = !on; roomsBtn.setAttribute("aria-expanded", on ? "true" : "false"); planes();
  });
  fetch(ROOMS).then(function (r) { return r.json(); }).then(function (list) {
    var here = location.pathname + location.search + location.hash, n = 0;
    list.forEach(function (room) {
      if (room.hidden) return;
      var a = document.createElement("a");
      a.className = "row gj-pl";
      a.href = new URL(room.href, new URL(HUB, location.href)).href;
      a.innerHTML = "<span></span><span></span>";
      a.firstChild.textContent = room.label; a.lastChild.textContent = room.badge || "";
      roomsNav.appendChild(a); n++;
      if (!hubPage && room.next) {
        /* match this room's path (and hash, if the entry has one) — a short tail like about/index.html used to collide */
        var ru = new URL(a.href);
        function normP(p) { p = (p || "").replace(/\/index\.html$/, "").replace(/\/+$/, ""); return p; }
        var samePath = normP(ru.pathname) === normP(location.pathname);
        var sameHash = !ru.hash || location.hash === ru.hash || location.hash.indexOf(ru.hash + "/") === 0;
        if (samePath && sameHash) {
          var p = drawer.querySelector("#gj-onward");
          if (p && !p.firstChild) {
            var nx = document.createElement("a");
            nx.href = new URL(room.next, new URL(HUB, location.href)).href;
            nx.textContent = "onward · " + (room.nextLabel || "next");
            goHref(nx);
            p.appendChild(nx);
          }
        }
      }
    });
    roomsBtn.querySelector("em").textContent = String(n);
    planes();
  }).catch(function () {});

  /* ---------- the unfold ---------- */
  var open = false, foldT = 0, HOLD = false, ACT = null, FOLD_MS = RMQ.matches ? 180 : 280;
  function markEl() {
    var own = document.querySelector("#omark, .lab-top .sig, .lab-top #back, header.top a.home, header .sig, [data-gj-mark]");
    if (own && own.getBoundingClientRect().width) return own;
    return back.hidden || !back.getBoundingClientRect().width ? null : back;
  }
  /* each row is a plane. The first three stand proud of the rest, as in the m4 drawer; later ones sit a little behind.
     --d staggers the unfold and stops counting at nine so a long list does not straggle. */
  function planes() {
    var list = [].slice.call(drawer.querySelectorAll(".gj-pl")), i = 0;
    list.forEach(function (el) {
      if (el.offsetParent === null && el.closest("[hidden]")) return;
      el.style.setProperty("--d", String(Math.min(i, 9)));
      el.style.setProperty("--z", (el.tagName === "H2" ? 14 : Math.max(0, 3 - i) * 7 - 6) + "px");
      i++;
    });
  }
  /* Tune sits under the Mark and unfolds from the Mark's own centre */
  function origin() {
    var m = markEl(), r = m ? m.getBoundingClientRect() : { left: 8, top: 8, width: 44, height: 32, bottom: 40 };
    var top = Math.max(0, Math.round(r.bottom + 4)), w = drawer.offsetWidth || 292;
    var left = Math.max(0, Math.min(Math.round(r.left) - 2, innerWidth - w));
    drawer.style.left = left + "px"; drawer.style.top = "0px"; drawer.style.paddingTop = (top + 10) + "px";
    drawer.style.maxHeight = "100vh"; drawer.style.maxHeight = "100dvh";
    drawer.style.setProperty("--ox", (r.left + r.width / 2 - left - 18).toFixed(0) + "px");
    drawer.style.setProperty("--oy", (r.top + r.height / 2 - top - 10 + drawer.scrollTop).toFixed(0) + "px");
  }
  function lean(x, y) {
    if (!open || HOLD || RMQ.matches) return;
    drawer.style.setProperty("--px", Math.max(-1, Math.min(1, (x / innerWidth - .5) * 2)).toFixed(3));
    drawer.style.setProperty("--py", Math.max(-1, Math.min(1, (y / innerHeight - .5) * 2)).toFixed(3));
  }
  function fromPopWhy(why) { return why === "pop" || (why && why.fromPop); }
  function stashTune(on, fromPop) {
    try {
      if (on) {
        var st = history.state || {};
        if (!st.tune) history.pushState(Object.assign({}, st, { tune: 1 }), "", location.href);
      } else if (!fromPop && history.state && history.state.tune) {
        window.__gjTuneClose = true;
        history.back();
      }
    } catch (e) {}
  }
  function show(on, why) {
    on = !!on;
    var fromPop = fromPopWhy(why);
    if (on === open) return;
    /* opening Tune must never change the camera or the zoom */
    open = on; clearTimeout(foldT);
    dial.setAttribute("aria-expanded", on ? "true" : "false");
    root.classList.toggle("gj-tune", on);
    /* the camera logic dial watches html.mm-open and folds itself away: one dial out at a time */
    root.classList.toggle("mm-open", on);
    if (on) {
      paint(); planes(); origin();
      drawer.classList.remove("folding"); void drawer.offsetWidth;
      drawer.classList.add("on");
      hideHint();
      if (!fromPop) stashTune(true, false);
    } else {
      HOLD = false; drawer.classList.remove("peek");
      drawer.classList.add("folding"); drawer.classList.remove("on");
      foldT = setTimeout(function () { if (!open) drawer.classList.remove("folding"); }, FOLD_MS);
      if (!fromPop) stashTune(false, false);
      if (why !== "outside") {
        try { dial.focus({ preventScroll: true }); } catch (e) { try { dial.focus(); } catch (e2) {} }
      }
    }
  }
  function openDrawer(on) { show(on); }
  var closeBtn = drawer.querySelector("#gj-tune-close");
  if (closeBtn) closeBtn.addEventListener("click", function (e) { e.stopPropagation(); show(false, "close"); });
  dial.addEventListener("click", function (e) { e.stopPropagation(); show(!open); });
  /* a tap anywhere else folds Tune and is not swallowed: the thing you tapped still gets its tap */
  document.addEventListener("pointerdown", function (e) {
    if (!open) return;
    var t = e.target;
    if (t && t.closest && (t.closest("#gj-dial") || t.closest("#gj-drawer .gj-pl") || t.closest("#gj-tune-hint"))) return;
    show(false, "outside");
  }, true);
  /* Browser Back: closing Tune is one step. Capture runs before blend.js, so Back does not also undo a pan. */
  addEventListener("popstate", function () {
    if (open) { show(false, "pop"); window.__gjTuneClose = true; }
  }, true);
  /* swipe down to dismiss on touch, only from the top of the drawer so it does not fight a scroll */
  (function () {
    var sw = null;
    drawer.addEventListener("pointerdown", function (e) {
      if (!open || e.pointerType === "mouse") return;
      if (e.target && e.target.closest && e.target.closest("input, button, a, select, .seg")) return;
      if (drawer.scrollTop > 2) return;
      sw = { y: e.clientY, x: e.clientX, id: e.pointerId };
    });
    drawer.addEventListener("pointermove", function (e) {
      if (!sw || e.pointerId !== sw.id) return;
      var dy = e.clientY - sw.y, dx = e.clientX - sw.x;
      if (dy > 60 && dy > Math.abs(dx) * 1.2) { sw = null; show(false, "swipe"); }
    }, { passive: true });
    function end(e) { if (sw && (!e || e.pointerId === sw.id)) sw = null; }
    drawer.addEventListener("pointerup", end);
    drawer.addEventListener("pointercancel", end);
  })();
  addEventListener("pointermove", function (e) { lean(e.clientX, e.clientY); }, { passive: true });
  /* while a slider is held, Tune steps aside so the room shows through: only that slider's hairline and thumb stay, faint */
  drawer.addEventListener("pointerdown", function (e) {
    var r = e.target.closest && e.target.closest("input[type=range]"); if (!r) return;
    HOLD = true; ACT = r.closest(".gj-pl"); if (ACT) ACT.classList.add("act"); drawer.classList.add("peek");
  }, true);
  function letGo() { if (!HOLD) return; HOLD = false; drawer.classList.remove("peek"); if (ACT) { ACT.classList.remove("act"); ACT = null; } }
  addEventListener("pointerup", letGo, true); addEventListener("pointercancel", letGo, true);

  /* the camera dial asks Tune to fold through GJ_MARKMENU. A room with its own tune.js defines that itself. */
  if (!window.GJ_MARKMENU) {
    window.GJ_MARKMENU = { show: function (on) { show(on); } };
    try { Object.defineProperty(window.GJ_MARKMENU, "open", { get: function () { return open; } }); } catch (e) {}
  }

  /* the Mark, pressed at rest on the field, switches the safelight (the room's red light) on and off */
  if (hubPage) {
    var hubMark = document.querySelector("#bar .sig, #home");
    if (hubMark) hubMark.addEventListener("click", function () {
      var cb = window.__cb, st = null;
      try { st = cb && cb.st ? cb.st() : null; } catch (e) {}
      if (!st || st.glide || st.z > 1.03 || (cb.board && cb.board())) return;
      set("gj-red", get("gj-red", "0") === "1" ? "0" : "1");
    });
  }

  /* shared controls sit under a room's own top bar, and hide when the room already has that control */
  function place() {
    var ownMark = document.querySelector("#omark, .lab-top .sig, .lab-top #back, header.top a.home, header .sig");
    var ownTune = document.querySelector("#fold-dial");
    back.hidden = !!ownMark;
    dial.hidden = !!ownTune;
    var vv = window.visualViewport;
    var y = vv ? vv.offsetTop : 0;
    var top = "";
    [back, dial, red].forEach(function (el) { el.style.top = top; });
    if (y) { top = "calc(var(--gj-top) + " + Math.round(y) + "px)"; [back, dial, red].forEach(function (el) { el.style.top = top; }); }
    var bar = document.querySelector(".lab-top, #ohd, header.top, .wn");
    if (bar) {
      var b = bar.getBoundingClientRect();
      if (b.height > 8 && b.bottom > 8 && b.bottom < innerHeight * 0.5) {
        var below = Math.round(b.bottom + 6 + y) + "px";
        [back, dial, red].forEach(function (el) { if (!el.hidden) el.style.top = below; });
      }
    }
    /* the + sits immediately beside the Mark, wherever the Mark is */
    var m = hubPage ? document.querySelector("#bar .sig, #home") : (ownMark && ownMark.getBoundingClientRect().width ? ownMark : back);
    if (m && !dial.hidden) {
      var r = m.getBoundingClientRect();
      if (r.width) {
        dial.style.left = Math.round(Math.min(r.right + 1, innerWidth - dial.offsetWidth - 4)) + "px";
        if (hubPage || (ownMark && m === ownMark)) dial.style.top = Math.round(r.top + r.height / 2 - dial.offsetHeight / 2) + "px";
      }
    }
    if (hint) {
      hint.hidden = !!dial.hidden;
      var dh = dial.getBoundingClientRect();
      if (dh.width) { hint.style.left = Math.round(dh.left) + "px"; hint.style.top = Math.round(dh.bottom + 4) + "px"; }
    }
    if (open) origin();
  }
  place();
  addEventListener("resize", place);
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", place);
    visualViewport.addEventListener("scroll", place);
  }
  document.querySelectorAll("iframe").forEach(function (f) { f.addEventListener("load", function () { apply(); place(); pushAmb(); }); });
  setTimeout(place, 400);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place).catch(function () {});

  /* Esc folds Tune first, and that Esc goes no further: the room (or the field's own "up one level") does not also act on it */
  addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !open) return;
    show(false); e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }, true);
  addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.defaultPrevented || hubPage) return;
    e.preventDefault();
    goHub();
  });

  apply(); paint(); planes(); pushAmb();
  window.GJ = window.GJ || {};
  window.GJ.get = get;
  window.GJ.set = set;
  window.GJ.hub = HUB;
  window.GJ.tune = { open: function () { show(true); }, close: function (why) { show(false, why); }, toggle: function () { show(!open); }, isOpen: function () { return open; } };
  if (s && s.src) {
    var rf = document.createElement("script");
    rf.src = new URL("js/reframe.js", s.src).href;
    document.body.appendChild(rf);
  }
  /* installable offline: register quietly, no install prompt, relative to this file so the preview subfolder stays valid */
  if (s && s.src && navigator.serviceWorker) {
    try { navigator.serviceWorker.register(new URL("sw.js", s.src).href, { scope: new URL(".", s.src).href }); } catch (e) {}
  }
})();
