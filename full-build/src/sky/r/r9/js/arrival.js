/* First-visit arrival only. The settled home is the r3 sky.
   The ᑕᐣᓯ mark is drawn as stars, then it fades into the real mark.
   The poem is a line during that arrival, and again if you scroll up at the top.
   A touch on the water leaves a ripple. Nothing is added to the six-star map. */
(function () {
  if (!document.body.classList.contains("is-home")) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);
  var force = params.get("intro");
  var seen = false;
  try { seen = localStorage.getItem("gj-r6-seen") === "1"; } catch (e) {}
  if (force === "0") seen = true;
  if (force === "1") seen = false;

  var LINES = [
    "I am Gill",
    "I am James",
    "I am an artist",
    "a Cree voice rising",
    "weaving sound into the unseen",
    "Indigenous kin, my culture’s pulse",
    "visual arts",
    "Fine art and music",
    "are rivers I swim, a daily drift",
    "a lifelong hum",
    "Artistry a starfield I chase",
    "All my relations,",
    "in all my creations",
    "their breath in every chord I make and everything",
    "I create."
  ];
  var STROKES = [
    [[-58.5, -96], [-156.5, -95], [-203.5, -61], [-213.5, 1], [-203.5, 63], [-156.5, 97], [-58.5, 97]],
    [[-26.5, -97], [25.5, -94], [44.5, -51], [25.5, -8], [-26.5, -5]],
    [[99.5, 105], [99.5, 20], [149.5, 15], [191.5, -11], [211.5, -55], [214.5, -105]]
  ];

  function ripple(event) {
    var water = document.querySelector(".water");
    if (!water) return;
    if (document.querySelector(".mark-arrive, .reelx.on, .poem-arrive")) return;
    if (event.target.closest("a, button, input, textarea")) return;
    var box = water.getBoundingClientRect();
    if (event.clientY < box.top || event.clientY > box.bottom) return;
    if (event.clientX < box.left || event.clientX > box.right) return;
    var dot = document.createElement("i");
    dot.className = "poke";
    dot.style.left = event.clientX + "px";
    dot.style.top = event.clientY + "px";
    document.body.appendChild(dot);
    setTimeout(function () { dot.remove(); }, 1000);
  }
  document.addEventListener("pointerdown", ripple);

  var poemEl = null;
  function showPoem() {
    if (poemEl) return;
    poemEl = document.createElement("div");
    poemEl.className = "poem-arrive";
    poemEl.setAttribute("role", "dialog");
    poemEl.setAttribute("aria-label", "Poem");
    LINES.forEach(function (line) {
      var span = document.createElement("span");
      span.textContent = line;
      poemEl.appendChild(span);
    });
    var sig = document.createElement("b");
    sig.textContent = "ᑕᐣᓯ";
    poemEl.appendChild(sig);
    document.body.appendChild(poemEl);
    requestAnimationFrame(function () { poemEl.classList.add("on"); });
  }
  function hidePoem() {
    if (!poemEl) return;
    var node = poemEl;
    poemEl = null;
    node.classList.remove("on");
    setTimeout(function () { node.remove(); }, 400);
  }
  window.addEventListener("wheel", function (event) {
    if (document.body.classList.contains("depth-open") || document.documentElement.classList.contains("reel-on")) return;
    if (poemEl && event.deltaY > 0) hidePoem();
    else if (!poemEl && window.scrollY < 2 && event.deltaY < -8) showPoem();
  }, { passive: true });
  var touchY = null;
  window.addEventListener("touchstart", function (event) {
    touchY = event.touches[0] ? event.touches[0].clientY : null;
  }, { passive: true });
  window.addEventListener("touchend", function (event) {
    if (touchY == null || !event.changedTouches[0]) return;
    var dy = event.changedTouches[0].clientY - touchY;
    touchY = null;
    if (document.documentElement.classList.contains("reel-on")) return;
    if (poemEl && dy < -30) hidePoem();
    else if (!poemEl && window.scrollY < 2 && dy > 48) showPoem();
  }, { passive: true });
  document.addEventListener("click", function (event) {
    if (poemEl && event.target.closest(".poem-arrive")) hidePoem();
  });

  if (seen || reduce) return;

  var veil = document.createElement("div");
  veil.className = "mark-arrive";
  veil.setAttribute("role", "dialog");
  veil.setAttribute("aria-label", "Gill James");
  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  var line = document.createElement("p");
  line.textContent = LINES[0];
  veil.appendChild(canvas);
  veil.appendChild(line);
  document.body.appendChild(veil);

  var ctx = canvas.getContext("2d");
  var stars = [];
  STROKES.forEach(function (stroke) {
    stroke.forEach(function (point, index) {
      stars.push({ x: point[0], y: point[1], node: true });
      if (index) {
        var prev = stroke[index - 1];
        stars.push({
          x: (prev[0] + point[0]) / 2,
          y: (prev[1] + point[1]) / 2,
          node: false
        });
      }
    });
  });

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  var start = performance.now();
  var raf = 0;
  function frame(now) {
    var t = Math.min(1, (now - start) / 2400);
    var grow = t < 0.72 ? t / 0.72 : 1;
    var fade = t < 0.62 ? 1 : 1 - (t - 0.62) / 0.38;
    var scale = 1.15 + grow * 1.35;
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(7,8,12," + (0.94 * fade).toFixed(3) + ")";
    ctx.fillRect(0, 0, w, h);
    var cx = w / 2;
    var cy = h * 0.34;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = Math.max(0, fade);
    ctx.strokeStyle = "rgba(214,208,198,0.35)";
    ctx.lineWidth = 0.6;
    STROKES.forEach(function (stroke) {
      ctx.beginPath();
      stroke.forEach(function (point, index) {
        if (index) ctx.lineTo(point[0], point[1]);
        else ctx.moveTo(point[0], point[1]);
      });
      ctx.stroke();
    });
    stars.forEach(function (star) {
      ctx.beginPath();
      ctx.fillStyle = star.node ? "#f4efe6" : "rgba(214,208,198,0.7)";
      ctx.arc(star.x, star.y, star.node ? 2.2 : 1.1, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    line.style.opacity = String(t < 0.45 ? t / 0.2 : Math.max(0, 1 - (t - 0.45) / 0.3));
    if (t < 1) raf = requestAnimationFrame(frame);
    else finish();
  }
  function finish() {
    cancelAnimationFrame(raf);
    veil.remove();
    try { localStorage.setItem("gj-r6-seen", "1"); } catch (e) {}
  }
  window.addEventListener("pagehide", function () {
    if (veil.parentNode) veil.remove();
  });
  veil.addEventListener("click", finish);
  raf = requestAnimationFrame(frame);
  setTimeout(finish, 2800);
})();
