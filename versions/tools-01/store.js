/* The shared store. One object, the shape in 00-master/BRIEF.md ("Data model and schema"), kept on the device.
   In the native app this is the App Group; here it is localStorage, and a second tab stands in for a lite app or the watch:
   a change in one is seen by the other through the storage event. Nothing leaves the device. */
(function () {
  "use strict";
  var KEY = "gj.tools.v1";
  function defaults() {
    return {
      red: { on: false, tone: "crimson", fullSafelight: false, updatedAt: null },
      safelight: { running: false, startedAt: null, elapsedSec: 0 },
      goldenHour: { latitude: null, longitude: null, placeLabel: "Vancouver", alerts: true, lastFixAt: null },
      loops: { tags: [] },
      watch: { paired: false, reachable: false, lastSyncAt: null },
      settings: { starDensity: "sparse", reduceMotion: false }
    };
  }
  function merge(base, over) {            /* keep every known key; unknown keys from a newer build are kept too */
    var out = {}, k;
    for (k in base) out[k] = base[k];
    if (over && typeof over === "object") for (k in over) {
      out[k] = (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && over[k] && typeof over[k] === "object" && !Array.isArray(over[k])) ? merge(base[k], over[k]) : over[k];
    }
    return out;
  }
  function ls(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  var S = defaults(), subs = [];
  function read() {
    var raw = ls(KEY, null);
    if (raw === null) { S = defaults(); return; }
    try { S = merge(defaults(), JSON.parse(raw)); }
    catch (e) { put(KEY + ".unread", raw); S = defaults(); }      /* never throw a state away: an unreadable one is set aside, not wiped */
    if (S.red.tone !== "rose") S.red.tone = "crimson";
    if (!S.red.on) S.red.fullSafelight = false;                   /* Full Safelight is a step of red mode */
    if (["sparse", "spread", "sketch"].indexOf(S.settings.starDensity) < 0) S.settings.starDensity = "sparse";
  }
  function write() {
    put(KEY, JSON.stringify(S));
    /* the site's own three keys (chrome.js), kept in step so the documented names hold. gj-fs carries the id of the step, as on the site. */
    put("gj-red", S.red.on ? "1" : "0");
    put("gj.red.tone", S.red.tone);
    if (!S.red.fullSafelight) put("gj-fs", "0"); else if (ls("gj-fs", "0") === "0") put("gj-fs", String(Date.now()));
  }
  function tell(why) { for (var i = 0; i < subs.length; i++) { try { subs[i](S, why); } catch (e) { setTimeout(function () { throw e; }); } } }
  function now() { return new Date().toISOString(); }

  /* the timer: elapsedSec is the truth when it is stopped; while it runs, elapsed = now - startedAt (it is cleared on start) */
  function elapsed(at) {
    var t = S.safelight;
    if (!t.running || !t.startedAt) return Math.max(0, Math.floor(t.elapsedSec || 0));
    return Math.max(0, Math.floor(((at || Date.now()) - Date.parse(t.startedAt)) / 1000));
  }
  function startTimer() { if (S.safelight.running) return; S.safelight = { running: true, startedAt: now(), elapsedSec: 0 }; }
  function stopTimer() { if (!S.safelight.running) return; S.safelight = { running: false, startedAt: null, elapsedSec: elapsed() }; }

  var Store = {
    KEY: KEY,
    get: function () { return S; },
    on: function (fn) { subs.push(fn); },
    reload: function () { read(); tell("reload"); },
    fsOn: function () { return !!(S.red.on && S.red.fullSafelight); },
    fsId: function () { return Store.fsOn() ? ls("gj-fs", "0") : "0"; },
    /* one tap on the dot (chrome.js L163-167): out of Full Safelight to ordinary red, otherwise red mode on or off */
    setRed: function (on) { on = !!on; if (S.red.on === on && !S.red.fullSafelight) return; S.red.on = on; S.red.fullSafelight = false; S.red.updatedAt = now(); write(); tell("red"); },
    /* the second step (chrome.js fsSet): it brings red mode with it; the Safelight timer starts with it and runs until it is stopped */
    setFullSafelight: function (on) {
      on = !!on; if (Store.fsOn() === on) return;
      if (on) { S.red.on = true; S.red.fullSafelight = true; startTimer(); } else S.red.fullSafelight = false;
      S.red.updatedAt = now(); write(); tell("fs");
    },
    setTone: function (tone) { S.red.tone = tone === "rose" ? "rose" : "crimson"; S.red.updatedAt = now(); write(); tell("tone"); },
    elapsed: elapsed,
    startTimer: function () { startTimer(); write(); tell("timer"); },
    stopTimer: function () { stopTimer(); write(); tell("timer"); },
    clearTimer: function () { if (S.safelight.running) return; S.safelight = { running: false, startedAt: null, elapsedSec: 0 }; write(); tell("timer"); },
    checkpoint: function () { if (S.safelight.running) { S.safelight.elapsedSec = elapsed(); write(); } },     /* every 30 s while it runs */
    setSetting: function (k, v) { S.settings[k] = v; write(); tell("settings"); },
    setPlace: function (label) { S.goldenHour.placeLabel = String(label || "").trim().slice(0, 40) || "Vancouver"; write(); tell("place"); }
  };
  read();
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === null) { read(); tell("storage"); } });
  window.GJTools = Store;
})();
