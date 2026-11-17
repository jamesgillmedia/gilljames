/* tools: the Master shell (sky home, watch pairing, Tune) and the Safelight room. Phone prototype, concept only.
   The dot's behaviour is the site's, line for line where it can be (chrome.js L86-175): one tap is red mode, a 550 ms hold is
   Full Safelight, one tap comes back to ordinary red, and Back from the step taken when it went on does the same. */
(function () {
  "use strict";
  var T = window.GJTools, Sky = window.GJSky, H = document.documentElement;
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, text) { var e = document.createElement(tag), k; for (k in attrs || {}) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }

  /* ?demo=paired shows what the pairing screen and the foot read once a watch is paired, to compare with the pack's screens.
     It is a picture of that state: nothing is stored and no watch is reached. A web page cannot pair one. */
  var DEMO_PAIRED = /[?&]demo=paired(&|$)/.test(location.search);

  /* rooms, at the brief's places (fractions of the screen). Only Safelight is built in this pass. */
  var ROOMS = [
    ["safelight", "Safelight", .22, .34, true],
    ["golden-hour", "Golden Hour", .78, .32, false],
    ["loupe", "Loupe", .18, .52, false],
    ["archive", "Archive", .82, .52, false],
    ["credit-map", "Credit Map", .28, .70, false],
    ["loop-notes", "Loop Notes", .66, .68, false],
    ["sky-player", "Sky Player", .50, .84, false]
  ], CENTRE = [.5, .539], VIEWS = ["sky", "watch", "safelight"];

  /* ---------- the three Full Safelight layers (chrome.js L19): a slight dim, the red light, a warm pass ---------- */
  var FSL = [["rgb(176,176,176)", "multiply"], ["rgb(255,0,0)", "color"], ["rgb(255,196,60)", "multiply"]];
  (function () { for (var i = 1; i <= 3; i++) { var l = el("i", { id: "gj-fs" + i, "class": "gj-fsl", "aria-hidden": "true" }); l.style.background = FSL[i - 1][0]; l.style.mixBlendMode = FSL[i - 1][1]; document.body.insertBefore(l, $("sl")); } })();

  /* ---------- sky home ---------- */
  (function () {
    var nav = $("rooms"), svg = document.querySelector(".lines"), NS = "http://www.w3.org/2000/svg";
    ROOMS.forEach(function (r) {
      var ln = document.createElementNS(NS, "line"); ln.setAttribute("x1", r[2] * 100); ln.setAttribute("y1", r[3] * 100); ln.setAttribute("x2", CENTRE[0] * 100); ln.setAttribute("y2", CENTRE[1] * 100); svg.appendChild(ln);
      var b = el("button", { type: "button", "class": "node" + (r[4] ? "" : " later"), "data-room": r[0], "aria-label": r[4] ? r[1] : r[1] + ", coming in a later pass" });
      b.style.left = (r[2] * 100) + "%"; b.style.top = (r[3] * 100) + "%";
      b.appendChild(el("i")); b.appendChild(el("span", null, r[1]));
      b.addEventListener("click", function () { if (r[4]) go(r[0]); else later(r[1]); });
      nav.appendChild(b);
    });
  })();
  var capT = 0;
  function later(name) {      /* a room that is not built: it says so, quietly. No fake interior. */
    var c = $("cap"); c.textContent = name + " · coming in a later pass"; c.classList.add("on");
    clearTimeout(capT); capT = setTimeout(function () { c.classList.remove("on"); }, 2600);
    say(name + ". Coming in a later pass.");
  }
  $("foot").addEventListener("click", function () { go("watch"); });

  /* ---------- places and Back ---------- */
  function route() { var h = location.hash.replace(/^#\/?/, ""); return (h === "watch" || h === "safelight") ? h : "sky"; }
  function state() { var st = history.state; return (st && st.gj) ? st : null; }
  function here() { return location.pathname + location.search + location.hash; }
  function copy(st, add, drop) { var o = {}, k; for (k in st) o[k] = st[k]; for (k in add) o[k] = add[k]; (drop || []).forEach(function (d) { delete o[d]; }); return o; }
  if (!state()) { try { history.replaceState({ gj: 1, d: 0 }, "", here()); } catch (e) {} }
  function go(r) {
    if (route() === r) return;
    var d = (state() || { d: 0 }).d || 0;
    history.pushState({ gj: 1, d: d + 1 }, "", "#/" + (r === "sky" ? "" : r));
    drawer(false); render(); focusView();
  }
  function back() {            /* the way back leaves the room. It never switches the light: a Full Safelight step under it is stepped over. */
    var st = state() || { d: 0 };
    if (st.d > 0) { history.go((st.fs && st.fs === T.fsId()) ? -2 : -1); return; }
    history.replaceState({ gj: 1, d: 0 }, "", "#/"); render(); focusView();
  }
  $("gj-back").addEventListener("click", back);
  function focusView() { var v = $("v-" + route()); if (v) { v.setAttribute("tabindex", "-1"); try { v.focus({ preventScroll: true }); } catch (e) {} } }

  /* ---------- Full Safelight and history (chrome.js fsPush / fsLeft / popstate) ---------- */
  var FS = { hold: 0, exiting: false }, lastFs = T.fsId();
  function fsPush() {
    var id = T.fsId(), st = state() || { gj: 1, d: 0 };
    if (id === "0" || st.fs === id) return;
    try { history.replaceState(copy(st, { fsFrom: id }, ["fs"]), "", here()); history.pushState(copy(st, { fs: id }, ["fsFrom"]), "", here()); } catch (e) {}
  }
  function fsSet(on) { if (T.fsOn() !== !!on) T.setFullSafelight(on); }
  window.addEventListener("popstate", function (e) {
    var st = e.state || {}, id = T.fsId();
    if (FS.exiting) { FS.exiting = false; render(); return; }      /* our own step back out of Full Safelight: nothing else moves, Tune stays as it is */
    drawer(false);
    if (st.fsFrom && id !== "0" && st.fsFrom === id) { T.setFullSafelight(false); return; }      /* Back from that step: ordinary red, nothing else moves */
    render();
  });
  window.addEventListener("hashchange", function () { if (!state()) { try { history.replaceState({ gj: 1, d: 0 }, "", here()); } catch (e) {} } render(); });

  /* ---------- the dot (chrome.js L160-175) ---------- */
  var red = $("gj-red");
  red.addEventListener("click", function (e) {
    if (FS.hold && Date.now() - FS.hold < 1500) { FS.hold = 0; e.preventDefault(); return; }       /* the click that ends a long-press */
    FS.hold = 0;
    if (T.fsOn()) { fsSet(false); return; }                                                         /* one tap: back to ordinary red */
    T.setRed(!T.get().red.on);
  });
  (function () {                 /* a long-press on the dot: Full Safelight (and out of it again) */
    var t = 0, p0 = null;
    function clear() { clearTimeout(t); t = 0; p0 = null; red.classList.remove("gj-holding"); }
    red.addEventListener("pointerdown", function (e) {
      if (e.button) return; clear(); p0 = [e.clientX, e.clientY]; red.classList.add("gj-holding");
      t = setTimeout(function () { t = 0; red.classList.remove("gj-holding"); if (!p0) return; p0 = null; FS.hold = Date.now(); fsSet(!T.fsOn()); }, 550);
    });
    /* a press that slides more than 10 px is neither: no Full Safelight, and the click that may follow it is not a tap either */
    red.addEventListener("pointermove", function (e) { if (p0 && Math.hypot(e.clientX - p0[0], e.clientY - p0[1]) > 10) { clear(); FS.hold = Date.now(); } });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { red.addEventListener(n, clear); });
    red.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  })();

  /* ---------- Tune ---------- */
  var dial = $("gj-dial"), dr = $("gj-drawer");
  function drawer(on) {
    var was = dr.classList.contains("on"); if (was === !!on) return;
    dr.classList.toggle("on", !!on); H.classList.toggle("tune", !!on); dr.setAttribute("aria-hidden", on ? "false" : "true"); dial.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) { paintDrawer(); setTimeout(function () { try { $("t-red").focus({ preventScroll: true }); } catch (e) {} }, 30); }
    else if (dr.contains(document.activeElement)) { try { dial.focus({ preventScroll: true }); } catch (e) {} }
  }
  dial.addEventListener("click", function () { drawer(!dr.classList.contains("on")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") drawer(false); });
  document.addEventListener("pointerdown", function (e) { if (dr.classList.contains("on") && !dr.contains(e.target) && e.target !== dial && !dial.contains(e.target) && e.target !== red && !red.contains(e.target)) drawer(false); });
  var STARS = [["sparse", "fewer stars"], ["spread", "spread"], ["sketch", "220 stars"]];
  $("t-red").addEventListener("click", function () { T.setRed(!T.get().red.on); });
  $("t-fs").addEventListener("click", function () { fsSet(!T.fsOn()); });
  $("t-tone").addEventListener("click", function () { T.setTone(T.get().red.tone === "rose" ? "crimson" : "rose"); });
  $("t-timer").addEventListener("click", function () { if (T.get().safelight.running) T.stopTimer(); else T.startTimer(); });
  $("t-reset").addEventListener("click", function () { T.clearTimer(); });
  $("t-stars").addEventListener("click", function () { var k = T.get().settings.starDensity, i = 0; STARS.forEach(function (s, j) { if (s[0] === k) i = j; }); T.setSetting("starDensity", STARS[(i + 1) % STARS.length][0]); });
  $("t-motion").addEventListener("click", function () { T.setSetting("reduceMotion", !T.get().settings.reduceMotion); });
  $("t-place").addEventListener("change", function () { T.setPlace(this.value); });
  $("t-place").addEventListener("keydown", function (e) { if (e.key === "Enter") this.blur(); });
  $("t-watch").addEventListener("click", function (e) { e.preventDefault(); go("watch"); });
  function onoff(b, on) { b.textContent = on ? "on" : "off"; b.setAttribute("aria-pressed", on ? "true" : "false"); }
  function paintDrawer() {
    var s = T.get(), sec = T.elapsed();
    onoff($("t-red"), s.red.on); onoff($("t-fs"), T.fsOn());
    $("t-tone").textContent = s.red.tone;
    $("t-time").textContent = clock(sec);
    $("t-timer").textContent = s.safelight.running ? "stop" : "start";
    $("t-reset-row").hidden = s.safelight.running || sec === 0;
    STARS.forEach(function (x) { if (x[0] === s.settings.starDensity) $("t-stars").textContent = x[1]; });
    onoff($("t-motion"), !!s.settings.reduceMotion);
    if (document.activeElement !== $("t-place")) $("t-place").value = s.goldenHour.placeLabel || "";
    $("t-watch-v").textContent = watchWord(s);
  }

  /* ---------- words ---------- */
  function paired(s) { return DEMO_PAIRED || !!s.watch.paired; }
  function watchWord(s) { return !paired(s) ? "Not paired" : (DEMO_PAIRED || s.watch.reachable) ? "Paired" : "Offline"; }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function clock(sec) { sec = Math.min(sec, 359999); return two(Math.floor(sec / 3600)) + ":" + two(Math.floor(sec / 60) % 60) + ":" + two(sec % 60); }      /* shown to 99:59:59; it keeps counting */
  function spoken(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, x = sec % 60, p = [];
    if (h) p.push(h + (h === 1 ? " hour" : " hours")); if (m) p.push(m + (m === 1 ? " minute" : " minutes")); if (x || !p.length) p.push(x + (x === 1 ? " second" : " seconds"));
    return p.join(" ");
  }
  var sayT = 0;
  function say(t) { var n = $("say"); n.textContent = ""; clearTimeout(sayT); sayT = setTimeout(function () { n.textContent = t; }, 40); }

  /* ---------- the Safelight face ---------- */
  function arc(r, a0, a1) {
    function p(a) { a = a * Math.PI / 180; return (r * Math.cos(a)).toFixed(2) + " " + (r * Math.sin(a)).toFixed(2); }
    return "M" + p(a0) + " A" + r + " " + r + " 0 0 1 " + p(a1);
  }
  document.querySelector("#arcs .a1").setAttribute("d", arc(111, -31, 49));     /* two quiet arcs: a clock gesture, not a control */
  document.querySelector("#arcs .a2").setAttribute("d", arc(132, 158, 214));
  var shown = -1;
  function paintTimer(force) {
    var s = T.get(), sec = T.elapsed(), on = s.safelight.running || sec > 0, tm = $("timer");
    if (tm.hidden === on) { tm.hidden = !on; force = true; }
    if (!on && tm.firstChild) tm.textContent = "";
    if (!force && sec === shown) return;
    shown = sec;
    if (on) {
      var txt = clock(sec), html = "", i;
      for (i = 0; i < txt.length; i++) html += txt[i] === ":" ? '<span class="c">:</span>' : "<span>" + txt[i] + "</span>";
      tm.innerHTML = html; tm.setAttribute("aria-label", "timer, " + spoken(sec) + (s.safelight.running ? "" : ", stopped"));
    }
    if (dr.classList.contains("on")) { $("t-time").textContent = clock(sec); $("t-reset-row").hidden = s.safelight.running || sec === 0; }
  }
  var lastCk = -1;
  setInterval(function () {
    var s = T.get(); if (!s.safelight.running) return;
    paintTimer(false);
    var sec = T.elapsed(); if (sec > 0 && sec % 30 === 0 && sec !== lastCk) { lastCk = sec; T.checkpoint(); }
  }, 250);

  /* ---------- paint ---------- */
  function render() {
    var s = T.get(), r = route(), fs = T.fsOn(), c = H.classList;
    c.toggle("rm", !!s.red.on); c.toggle("fs", fs); c.toggle("rmo", !!s.settings.reduceMotion);
    if (s.red.tone === "rose") H.setAttribute("data-red-tone", "rose"); else H.removeAttribute("data-red-tone");
    VIEWS.forEach(function (v) { c.toggle("v-" + v, v === r); });
    document.title = r === "sky" ? "tools" : r + " · tools";
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute("content", s.red.on ? "#060304" : "#04070b");
    /* the dot says what it is, not only by colour */
    red.setAttribute("aria-pressed", s.red.on ? "true" : "false");
    red.setAttribute("aria-label", fs ? "Full Safelight on, double tap to return to red" : s.red.on ? "Red mode, on" : "Red mode, off");
    /* sky foot */
    var w = watchWord(s), foot = $("foot");
    foot.textContent = "Watch · " + w; foot.setAttribute("aria-label", "watch pairing, " + w.toLowerCase());
    /* pairing */
    var p = paired(s), rows = [["Apple Watch", p ? w : "Not paired"], ["Red mode · Safelight", "Shared"], ["Safelight timer", "Syncs"], ["Golden Hour · location, alerts", "Syncs"], ["Loop Notes · tags", "Syncs"], ["Loupe remote", "Optional"], ["Offline", "Last known state"]], ul = $("wrows");
    ul.textContent = "";
    rows.forEach(function (x, i) { var li = el("li"); li.appendChild(el("span", null, x[0])); li.appendChild(el("b", null, (p || i === 0) ? x[1] : "—")); ul.appendChild(li); });
    $("wopen").parentNode.hidden = p;
    if (p) $("werr").hidden = true;
    /* the Safelight face */
    $("slname").textContent = fs ? "full safelight" : "safelight";
    $("sl").setAttribute("aria-hidden", r === "safelight" ? "false" : "true");
    paintTimer(true);
    if (dr.classList.contains("on")) paintDrawer();
    Sky.draw();
  }
  $("wopen").addEventListener("click", function () {      /* system pairing cannot be faked, least of all from a web page */
    var e = $("werr"); e.textContent = "The Watch app opens from the native build. This prototype is phone only."; e.hidden = false; say(e.textContent);
  });

  var was = { red: T.get().red.on, fs: T.fsOn(), run: T.get().safelight.running };
  T.on(function (s, why) {
    var id = T.fsId(), st = state() || {};
    if (lastFs !== "0" && id === "0") { if (st.fs && st.fs === lastFs) { FS.exiting = true; try { history.back(); } catch (e) { FS.exiting = false; } } }      /* out of Full Safelight: give its step back */
    else if (lastFs === "0" && id !== "0" && why !== "storage" && why !== "reload") fsPush();                                                              /* into it, here: take one step */
    lastFs = id;
    render();
    var fs = T.fsOn();
    if (fs !== was.fs) say(fs ? "Full Safelight on" : s.red.on ? "Full Safelight off. Red mode on" : "Red mode off");
    else if (s.red.on !== was.red) say(s.red.on ? "Red mode on" : "Red mode off");
    else if (s.safelight.running !== was.run && why === "timer") say(s.safelight.running ? "Timer started" : "Timer stopped at " + spoken(T.elapsed()));
    was = { red: s.red.on, fs: fs, run: s.safelight.running };
  });

  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  window.GJApp = { go: go, back: back, route: route, render: render, clock: clock, reducedMotion: function () { return !!T.get().settings.reduceMotion || !!(mq && mq.matches); } };

  render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { Sky.draw(); });
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) { window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); }); }
})();
