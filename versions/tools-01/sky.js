/* The star canvas (#cv): soft 1-2 px stars on the stage wash, the same language as the site sky.
   The field is fixed (seeded), so a relaunch shows the same sky. It stays still: no pan, no depth, no twinkle in this pass.
   Density is the site's Tune setting: sparse ("fewer stars", the default), spread, or sketch ("220 stars"). */
(function () {
  "use strict";
  var cv = document.getElementById("cv"), cx = cv.getContext("2d"), W = 0, H = 0, R = 1, stars = [];
  var COUNT = { sparse: 110, spread: 160, sketch: 220 };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  (function () { var r = rng(20261116); for (var i = 0; i < 900; i++) stars.push({ x: r(), y: r(), s: r(), a: r() }); })();

  function size() {
    R = Math.min(3, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * R); cv.height = Math.round(H * R);
  }
  function draw() {
    var h = document.documentElement, c = h.classList, st = window.GJTools.get();
    var lamp = c.contains("rm") && c.contains("fs") && c.contains("v-safelight");
    /* night: the page ink. Red mode: the tone's red. On the lit Safelight ground: the ink again, and the three layers make it light. */
    var rgb = (c.contains("rm") && !lamp) ? (getComputedStyle(h).getPropertyValue("--gj-red-rgb").trim() || "255,68,87") : "238,243,245";
    var n = Math.round((COUNT[st.settings.starDensity] || COUNT.sparse) * Math.max(.6, Math.min(4, (W * H) / (390 * 844))));
    cx.setTransform(R, 0, 0, R, 0, 0); cx.clearRect(0, 0, W, H);
    for (var i = 0; i < n && i < stars.length; i++) {
      var s = stars[i], x = s.x * W, y = s.y * H, r, a;
      if (s.s < .7) { r = .5 + s.s * .35; a = .22 + s.a * .4; }
      else if (s.s < .94) { r = .9 + (s.s - .7) * .9; a = .55 + s.a * .4; }
      else { r = 1.25; a = 1; cx.fillStyle = "rgba(" + rgb + ",.16)"; cx.beginPath(); cx.arc(x, y, 3.2, 0, 6.2832); cx.fill(); }
      cx.fillStyle = "rgba(" + rgb + "," + a.toFixed(3) + ")"; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
    }
  }
  var t = 0;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(function () { size(); draw(); }, 60); });
  size();
  window.GJSky = { draw: draw, count: function () { var st = window.GJTools.get(); return Math.round((COUNT[st.settings.starDensity] || COUNT.sparse) * Math.max(.6, Math.min(4, (W * H) / (390 * 844)))); } };
})();
