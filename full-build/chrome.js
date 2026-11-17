/* Wayfinding for every room in the full-build preview.
   The syllabics mark returns to the field. Escape does the same when the room
   has not already claimed it. Toggles live in this drawer and are remembered. */
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
  var HUB = (s && s.getAttribute("data-hub")) || "index.html";
  var ROOMS = (s && s.getAttribute("data-rooms")) || "rooms.json";
  var hubPage = document.body.classList.contains("gj-hub");

  var FS = { onEntry: false, exiting: null, want: false, hold: 0 };   /* full safelight: see fsSet below */
  var FSL = [["rgb(176,176,176)", "multiply"], ["rgb(255,0,0)", "color"], ["rgb(255,196,60)", "multiply"]];
  var TOGS = [
    { k: "gj-tog-moon", label: "crescent moon", def: "1", kind: "bool" },
    { k: "gj-tog-density", label: "mark density", def: "sparse", kind: "choice",
      opts: [["sparse", "fewer stars"], ["spread", "spread"], ["shallow", "shallow"], ["sketch", "220 stars"]] },
    { k: "gj-tog-depth", label: "depth", def: "rest", kind: "choice",
      opts: [["rest", "flat, then 3D"], ["flat", "stay flat"], ["hold", "hold the depth"]] },
    { k: "gj-tog-reflect", label: "shelf reflections", def: "1", kind: "bool" },
    { k: "gj-tog-water", label: "opener water", def: "1", kind: "bool" },
    { k: "gj-tog-markphotos", label: "mark", def: "mark", kind: "choice",
      opts: [["mark", "mark only"], ["photos", "with object photos"]] },
    { k: "gj-tog-flatdeep", label: "mark field", def: "flat", kind: "choice",
      opts: [["flat", "nearly flat"], ["deep", "deep starfield"]] },
    { k: "gj-tog-name", label: "film names", def: "0", kind: "bool" }
  ];

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} apply(); window.dispatchEvent(new CustomEvent("gj-tog", { detail: { k: k, v: v } })); }

  function apply() {
    var redOn = get("gj-red", "0") === "1";
    var root = document.documentElement;
    root.classList.toggle("rm", redOn);
    /* full safelight is a step of red mode: when red goes off it goes with it */
    var fsId = get("gj-fs", "0");
    if (!redOn && fsId !== "0") { try { localStorage.setItem("gj-fs", "0"); } catch (e) {} fsLeft(fsId); fsId = "0"; }
    root.classList.toggle("fs", redOn && fsId !== "0");
    if (redOn && fsId !== "0") fsLayers();
    root.setAttribute("data-red-tone", get("gj.red.tone", "crimson") === "rose" ? "rose" : "crimson");   /* the red-mode colour dial reaches every room */
    root.classList.toggle("gj-noreflect", get("gj-tog-reflect", "1") !== "1");
    root.classList.toggle("gj-nowater", get("gj-tog-water", "1") !== "1");
    root.classList.toggle("gj-nomoon", get("gj-tog-moon", "1") !== "1");
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
    if (red) { red.setAttribute("aria-pressed", redOn ? "true" : "false"); red.setAttribute("aria-label", redOn && fsId !== "0" ? "full safelight. tap for red mode" : "red mode. hold for full safelight"); }
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
        if (a.classList.contains("rm")) { b.setAttribute("data-theme", "red"); b.setAttribute("data-gj-c", "red"); }
        else if (b.getAttribute("data-theme") === "red") { b.removeAttribute("data-theme"); b.removeAttribute("data-gj-c"); }
      } catch (e) {}
    }
  }

  /* ---- full safelight (Pack 1116). Red mode is unchanged; this is the optional second step: photographs and film read red too.
     In: a long-press on the dot, or the Tune row. Out: one tap on the dot, the Tune row, or Back. It is remembered like red mode (gj-fs).
     Back: going in takes one step in history on the page it was switched on (as soon as Tune or the map, if open, has closed, so their own
     step is not confused); Back from that step, or to the place it was taken from, returns to normal red mode and changes nothing else. */
  function fsOn() { return get("gj-red", "0") === "1" && get("gj-fs", "0") !== "0"; }
  function fsLayers() { if (document.getElementById("gj-fs1")) return; for (var i = 1; i <= 3; i++) { var l = document.createElement("i"); l.id = "gj-fs" + i; l.className = "gj-fsl"; l.setAttribute("aria-hidden", "true");
      /* 1 a slight dim · 2 the red light (the picture keeps its luminosity; hue and saturation are the light's) · 3 a warm pass: the brightest detail tips to orange */
      l.style.background = FSL[i - 1][0]; l.style.mixBlendMode = FSL[i - 1][1]; document.documentElement.insertBefore(l, document.getElementById("gj-back")); } }
  function fsBusy() { var c = document.documentElement.classList; return c.contains("mm-open") || c.contains("gj-map-open"); }
  function fsPush() { FS.want = false; var id = get("gj-fs", "0"); if (id === "0" || FS.onEntry) return;
    try { var st = history.state, a = {}, b = {}, k; if (st && typeof st === "object") for (k in st) { a[k] = st[k]; b[k] = st[k]; } a.gjfsFrom = id; delete a.gjfs; b.gjfs = id; delete b.gjfsFrom;
      var url = location.pathname + location.search + location.hash; history.replaceState(a, "", url); history.pushState(b, "", url); } catch (e) {} }
  function fsLeft(id) { FS.want = false; if (id && id !== "0" && FS.onEntry) { FS.exiting = id; try { history.back(); } catch (e) {} } }
  function fsSet(on) {
    var id = get("gj-fs", "0"), was = get("gj-red", "0") === "1" && id !== "0";
    if (on) { if (was) return; id = String(Date.now()); try { localStorage.setItem("gj-fs", id); } catch (e) {}
      if (get("gj-red", "0") !== "1") set("gj-red", "1"); else apply();
      if (fsBusy()) FS.want = true; else fsPush(); }
    else { if (id === "0") return; try { localStorage.setItem("gj-fs", "0"); } catch (e) {} apply(); fsLeft(id); }
    window.dispatchEvent(new CustomEvent("gj-tog", { detail: { k: "gj-fs", v: on ? "1" : "0" } }));
  }
  (function () {
    var hp = history.pushState, hr = history.replaceState;
    function note(st) { var id = get("gj-fs", "0"); FS.onEntry = !!(st && st.gjfs && id !== "0" && st.gjfs === id); }
    history.pushState = function (st) { var r = hp.apply(this, arguments); note(st); return r; };
    history.replaceState = function (st) { var r = hr.apply(this, arguments); note(st); return r; };
    note(history.state);
    window.addEventListener("pageshow", function (e) { note(history.state); if (e.persisted) apply(); });
    window.addEventListener("storage", function (e) { if (e.key === "gj-fs" || e.key === "gj-red") { note(history.state); apply(); } });
    window.addEventListener("popstate", function (e) {
      var st = e.state || {}, id = get("gj-fs", "0"), from = FS.onEntry, ex = FS.exiting; note(e.state);
      if (!st.gjfsFrom || !((id !== "0" && st.gjfsFrom === id) || st.gjfsFrom === ex)) return;
      FS.exiting = null;
      if (id !== "0" && st.gjfsFrom === id) { try { localStorage.setItem("gj-fs", "0"); } catch (er) {} apply(); window.dispatchEvent(new CustomEvent("gj-tog", { detail: { k: "gj-fs", v: "0" } })); }
      if (from || ex) e.stopImmediatePropagation();      /* this step only ever held the light: nothing else moves */
    }, true);
    try { new MutationObserver(function () { if (FS.want && !fsBusy()) setTimeout(function () { if (FS.want && !fsBusy() && fsOn()) fsPush(); }, 320); }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); } catch (e) {}
  })();

  function goHub() { location.href = HUB; }

  var back = document.createElement("a");
  back.id = "gj-back"; back.href = HUB;
  back.setAttribute("aria-label", "back to the field");
  back.innerHTML = "‹ <b lang=\"cr\">ᑕᐣᓯ</b>";
  document.documentElement.appendChild(back);
  /* a sideways swipe can swallow the click that follows it; a still pointerup on the mark still leaves */
  (function () {
    var tap = null, at = 0;
    /* graph.js: the Mark opens the map of the site (and closes it). One tap is one turn, whichever event brings it. */
    function map(e) {
      var G = window.GJ && window.GJ.graph;
      if (!G || !G.on()) return false;
      if (e) e.preventDefault();
      if (Date.now() - at > 400) { at = Date.now(); G.toggle(); }
      return true;
    }
    back.addEventListener("pointerdown", function (e) { tap = { x: e.clientX, y: e.clientY, clicked: false }; });
    back.addEventListener("click", function (e) { if (tap) tap.clicked = true; map(e); });
    back.addEventListener("pointerup", function (e) {
      if (!tap) return;
      var d = tap; tap = null;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return;
      setTimeout(function () { if (!d.clicked && !map()) location.href = back.href; }, 80);
    });
  })();

  var dial = document.createElement("button");
  dial.id = "gj-dial"; dial.type = "button"; dial.textContent = "tune";
  dial.setAttribute("aria-expanded", "false");
  dial.setAttribute("aria-controls", "gj-drawer");
  document.documentElement.appendChild(dial);

  var red = document.createElement("button");
  red.id = "gj-red"; red.type = "button";
  red.setAttribute("aria-label", "red mode");
  red.innerHTML = "<i></i>";
  red.addEventListener("click", function (e) {
    if (FS.hold && Date.now() - FS.hold < 1500) { FS.hold = 0; e.preventDefault(); return; }   /* the click that ends a long-press */
    FS.hold = 0;
    if (fsOn()) { fsSet(false); return; }                                                          /* one tap: back to normal red mode */
    set("gj-red", get("gj-red", "0") === "1" ? "0" : "1");
  });
  (function () {   /* a long-press on the dot: full safelight (and out of it again) */
    var t = 0, p0 = null;
    function clear() { clearTimeout(t); t = 0; p0 = null; red.classList.remove("gj-holding"); }
    red.addEventListener("pointerdown", function (e) { if (e.button) return; clear(); p0 = [e.clientX, e.clientY]; red.classList.add("gj-holding");
      t = setTimeout(function () { t = 0; red.classList.remove("gj-holding"); if (!p0) return; p0 = null; FS.hold = Date.now(); fsSet(!fsOn()); }, 550); });
    red.addEventListener("pointermove", function (e) { if (p0 && Math.hypot(e.clientX - p0[0], e.clientY - p0[1]) > 10) clear(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { red.addEventListener(n, clear); });
    red.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  })();
  document.documentElement.appendChild(red);

  var drawer = document.createElement("aside");
  drawer.id = "gj-drawer";
  drawer.setAttribute("aria-label", "tuning");
  drawer.innerHTML = "<h2>toggles</h2><div id=\"gj-togs\"></div><h2>rooms</h2><nav id=\"gj-rooms\"></nav><p id=\"gj-onward\"></p>";
  document.documentElement.appendChild(drawer);

  function openDrawer(on) {
    drawer.classList.toggle("on", on);
    dial.setAttribute("aria-expanded", on ? "true" : "false");
  }
  dial.addEventListener("click", function () { openDrawer(!drawer.classList.contains("on")); });

  var host = drawer.querySelector("#gj-togs");
  TOGS.forEach(function (t) {
    var row = document.createElement("label");
    row.className = "row";
    var name = document.createElement("span");
    name.textContent = t.label;
    row.appendChild(name);
    if (t.kind === "bool") {
      var b = document.createElement("button");
      b.type = "button"; b.className = "tog";
      function paint() { var on = get(t.k, t.def) === "1"; b.textContent = on ? "on" : "off"; b.setAttribute("aria-pressed", on ? "true" : "false"); }
      b.addEventListener("click", function () { set(t.k, get(t.k, t.def) === "1" ? "0" : "1"); paint(); });
      paint(); row.appendChild(b);
    } else {
      var sel = document.createElement("select");
      sel.setAttribute("aria-label", t.label);
      t.opts.forEach(function (o) {
        var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op);
      });
      sel.value = get(t.k, t.def);
      if (sel.value !== get(t.k, t.def)) sel.value = t.def;
      sel.addEventListener("change", function () { set(t.k, sel.value); });
      row.appendChild(sel);
    }
    host.appendChild(row);
  });

  (function () {   /* full safelight in the drawer (rooms without fable-m4's Tune) */
    var row = document.createElement("label"); row.className = "row"; var nm = document.createElement("span"); nm.textContent = "full safelight"; row.appendChild(nm);
    var b = document.createElement("button"); b.type = "button"; b.className = "tog"; b.id = "gj-fs-tog";
    function paint() { var on = fsOn(); b.textContent = on ? "on" : "off"; b.setAttribute("aria-pressed", on ? "true" : "false"); }
    b.addEventListener("click", function () { fsSet(!fsOn()); paint(); }); window.addEventListener("gj-tog", paint); paint(); row.appendChild(b); host.appendChild(row);
  })();

  fetch(ROOMS).then(function (r) { return r.json(); }).then(function (list) {
    var nav = drawer.querySelector("#gj-rooms");
    var here = location.pathname + location.search + location.hash;
    list.forEach(function (room) {
      if (room.hidden) return;
      var a = document.createElement("a");
      a.className = "row";
      a.href = new URL(room.href, new URL(HUB, location.href)).href;
      a.innerHTML = "<span>" + room.label + "</span><span>" + (room.badge || "") + "</span>";
      nav.appendChild(a);
      if (!hubPage && room.next && here.indexOf(room.href.split("#")[0].split("/").slice(-2).join("/")) >= 0) {
        var p = drawer.querySelector("#gj-onward");
        if (p && !p.firstChild) {
          var n = document.createElement("a");
          n.href = new URL(room.next, new URL(HUB, location.href)).href;
          n.textContent = "onward · " + (room.nextLabel || "next");
          p.appendChild(n);
        }
      }
    });
  }).catch(function () {});

  /* shared pills sit under a room's own top bar, and hide when the room already has that control */
  document.documentElement.classList.add("gj-pills");   /* a room's own bar can keep clear of the pills (Pack 1117) */
  function place() {
    var ownMark = document.querySelector("#omark, .lab-top .sig, .lab-top #back, header.top a.home, header .sig");
    var ownTune = document.querySelector("#fold-dial");
    back.hidden = !!ownMark;
    dial.hidden = !!ownTune;
    var vv = window.visualViewport;
    var y = vv ? vv.offsetTop : 0;
    var top = "calc(env(safe-area-inset-top, 0px) + " + (8 + Math.round(y)) + "px)";
    [back, dial, red].forEach(function (el) { el.style.top = top; });
    var bar = document.querySelector(".lab-top, #ohd, header.top, .wn");
    if (bar && getComputedStyle(bar).getPropertyValue("--gj-inbar").trim() === "1") bar = null;   /* this bar leaves room for the pills in its own row */
    if (bar) {
      var b = bar.getBoundingClientRect();
      if (b.height > 8 && b.bottom > 8 && b.bottom < innerHeight * 0.5) {
        var below = Math.round(b.bottom + 8 + y) + "px";
        [back, dial, red].forEach(function (el) { if (!el.hidden) el.style.top = below; });
      }
    }
  }
  place();
  addEventListener("resize", place);
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", place);
    visualViewport.addEventListener("scroll", place);
  }
  document.querySelectorAll("iframe").forEach(function (f) { f.addEventListener("load", function () { apply(); place(); }); });
  setTimeout(place, 400);

  addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (drawer.classList.contains("on")) { openDrawer(false); e.preventDefault(); return; }
    if (e.defaultPrevented || hubPage) return;
    e.preventDefault();
    goHub();
  });

  apply();
  window.GJ = window.GJ || {};
  /* the Mark brightens, once and quietly, while something is paused or being recorded (Nov 15). A room says so with GJ.hold(key, on). */
  var HOLD = {};
  function hold(k, on) { if (on) HOLD[k] = 1; else delete HOLD[k]; document.documentElement.classList.toggle("gj-hold", Object.keys(HOLD).length > 0); }
  function playHold() { hold("play", !!(window.GJ_PLAY && window.GJ_PLAY.paused)); }
  window.addEventListener("gjpause", playHold); setTimeout(playHold, 900);
  if (/[?&]rec\b/.test(location.search)) hold("rec", true);
  (function () { var au = document.getElementById("au"); if (!au || !au.addEventListener) return;      /* the sound player's song */
    au.addEventListener("pause", function () { hold("song", au.currentTime > 0 && !au.ended); }); au.addEventListener("play", function () { hold("song", false); }); })();
  window.GJ.hold = hold;
  window.GJ.get = get;
  window.GJ.set = set;
  window.GJ.fs = { on: fsOn, set: fsSet, toggle: function () { fsSet(!fsOn()); }, state: function () { return { on: fsOn(), entry: FS.onEntry, want: FS.want }; } };
  window.GJ.hub = HUB;
  if (s && s.src) {
    var rf = document.createElement("script");
    rf.src = new URL("js/reframe.js", s.src).href;
    document.body.appendChild(rf);
    var gr = document.createElement("script"); gr.src = new URL("graph.js", s.src).href;   /* the site as a graph: the room table and the map */
    document.body.appendChild(gr);
  }
})();
