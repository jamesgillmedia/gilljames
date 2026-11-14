/* Moon-water ripple. Touch is felt. Nothing opens. */
(function () {
  var notes = {
    A: "A — Touch anywhere on the water. Concentric ripples spread and fade. Nothing opens.",
    B: "B — Ripples, and the mark's reflection shimmers with each touch. Still nothing opens.",
    C: "C — A heavier, felt displacement under the finger, with multi-touch. Still nothing opens."
  };
  var stage = document.getElementById("stage");
  var cv = document.getElementById("fx");
  var ctx = cv.getContext("2d");
  var mark = document.getElementById("mark");
  var ripples = [];
  var pointers = {};
  var mid = /(?:^|[?&])mid=1(?:&|$)/.test(location.search);

  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(stage.clientWidth * dpr);
    cv.height = Math.round(stage.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function spawn(x, y, heavy) {
    var v = Lab.variant;
    var n = v === "C" || heavy ? 7 : 5;
    ripples.push({ x: x, y: y, t: 0, n: n, heavy: !!heavy || v === "C", shimmer: v === "B" });
    if (v === "B") pulseMark();
  }
  var pulseT = 0;
  function pulseMark() {
    mark.style.filter = "drop-shadow(0 0 18px rgba(220,235,255,.8)) brightness(1.15)";
    clearTimeout(pulseT);
    pulseT = setTimeout(function () {
      mark.style.filter = "drop-shadow(0 0 12px rgba(200,220,240,.35))";
    }, 500);
  }
  function frame(ts) {
    var w = stage.clientWidth, h = stage.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var next = [];
    for (var i = 0; i < ripples.length; i++) {
      var r = ripples[i];
      if (!mid) r.t += 0.016;
      var life = r.heavy ? 2.2 : 1.6;
      if (r.t > life) continue;
      next.push(r);
      var squash = 0.38;
      for (var k = 0; k < r.n; k++) {
        var delay = k * 0.09;
        var u = Math.max(0, r.t - delay);
        if (u <= 0) continue;
        var rad = (r.heavy ? 220 : 140) * Math.min(1, u / 1.1) + k * (r.heavy ? 22 : 16);
        var a = (1 - u / (life - delay)) * (r.heavy ? 0.55 : 0.38);
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad, rad * squash, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(210,222,232," + a + ")";
        ctx.lineWidth = r.heavy ? 2.2 : 1.4;
        ctx.stroke();
      }
      if (r.heavy) {
        var g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 80);
        g.addColorStop(0, "rgba(200,220,235," + (0.12 * (1 - r.t / life)) + ")");
        g.addColorStop(1, "rgba(200,220,235,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 90, 90 * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      /* contact point */
      ctx.beginPath();
      ctx.fillStyle = "rgba(230,236,242," + (0.5 * (1 - r.t / life)) + ")";
      ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ripples = next;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function pt(e) {
    var r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".labbar")) return;
    e.preventDefault();
    var p = pt(e);
    pointers[e.pointerId] = p;
    spawn(p.x, p.y);
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener("pointermove", function (e) {
    if (!pointers[e.pointerId]) return;
    var p = pt(e);
    var last = pointers[e.pointerId];
    if (Math.hypot(p.x - last.x, p.y - last.y) > 28) {
      spawn(p.x, p.y, Lab.variant === "C");
      pointers[e.pointerId] = p;
    }
  });
  function end(e) { delete pointers[e.pointerId]; }
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  /* no click handler that navigates — the stage absorbs all touches */

  Lab.init(notes);

  function seed() {
    var w = stage.clientWidth, h = stage.clientHeight;
    var v = Lab.variant;
    ripples = [
      { x: w * 0.36, y: h * 0.54, t: 0.58, n: v === "C" ? 7 : 5, heavy: v === "C", shimmer: v === "B" },
      { x: w * 0.64, y: h * 0.66, t: 0.30, n: v === "C" ? 7 : 5, heavy: v === "C", shimmer: v === "B" },
      { x: w * 0.50, y: h * 0.40, t: 0.14, n: v === "C" ? 7 : 5, heavy: false, shimmer: v === "B" }
    ];
    if (v === "B") pulseMark();
  }
  if (mid) seed();
})();
