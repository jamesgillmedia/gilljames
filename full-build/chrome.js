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
        if (a.classList.contains("rm")) { b.setAttribute("data-theme", "red"); b.setAttribute("data-gj-c", "red"); }
        else if (b.getAttribute("data-theme") === "red") { b.removeAttribute("data-theme"); b.removeAttribute("data-gj-c"); }
      } catch (e) {}
    }
  }

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
  red.addEventListener("click", function () { set("gj-red", get("gj-red", "0") === "1" ? "0" : "1"); });
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
  window.GJ.hub = HUB;
  if (s && s.src) {
    var rf = document.createElement("script");
    rf.src = new URL("js/reframe.js", s.src).href;
    document.body.appendChild(rf);
    var gr = document.createElement("script"); gr.src = new URL("graph.js", s.src).href;   /* the site as a graph: the room table and the map */
    document.body.appendChild(gr);
  }
})();
