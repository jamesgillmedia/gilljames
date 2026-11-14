/* Spaces walkthrough. Official titles only. Path through the sky into one space. */
(function () {
  var SPACES = [
    { title: "Spirit Eye of skwácháys", sub: "se-a · words in the place" },
    { title: "Spirit Eye of skwácháys", sub: "se-b · pages in depth" },
    { title: "Spirit Eye of skwácháys", sub: "se-c · read to move" },
    { title: "Spirit Eye · the forest garden", sub: "fibre optics · day–night" }
  ];
  var notes = {
    A: "A — A path of stars leads into one space: Spirit Eye · the forest garden, with the disc and a text panel. The other three spaces are named stars along the path.",
    B: "B — Drag or scroll to walk the path. The garden comes forward as you go. The other spaces are stops along the way.",
    C: "C — You are already in the garden. The path and the other spaces sit behind you in the sky."
  };
  var garden = document.getElementById("garden");
  garden.style.backgroundImage = "url(../_shared/media/garden-p29.webp)";
  var cv = document.getElementById("world");
  var ctx = cv.getContext("2d");
  var prog = 0.35; /* 0 = still in the sky, 1 = inside the garden */
  var drag = null;

  function target() {
    var v = Lab.variant;
    if (v === "A") return 0.55;
    if (v === "C") return 1;
    return prog;
  }

  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint();
  }
  window.addEventListener("resize", resize);

  function pathPts(w, h) {
    return [
      { x: w * 0.14, y: h * 0.18 },
      { x: w * 0.28, y: h * 0.30 },
      { x: w * (w < 700 ? 0.34 : 0.40), y: h * 0.42 },
      { x: w * 0.48, y: h * 0.55 },
      { x: w * 0.52, y: h * 0.66 }
    ];
  }
  /* first three spaces sit on early path points */
  function paint() {
    var w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var t = target();
    garden.style.opacity = String(0.25 + t * 0.7);
    garden.style.transform = "scale(" + (0.92 + t * 0.1) + ")";
    var path = pathPts(w, h);
    ctx.strokeStyle = "rgba(200,190,230," + (0.55 - t * 0.15) + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    path.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
    ctx.stroke();
    path.forEach(function (p, i) {
      var r = 2.2 + i * 0.4;
      ctx.beginPath();
      ctx.fillStyle = "rgba(210,200,235,0.85)";
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    /* named stars: the first three spaces along the path */
    var named = [
      { i: 0, offx: 14, offy: -18 },
      { i: 1, offx: 16, offy: -20 },
      { i: 2, offx: -14, offy: -22 }
    ];
    named.forEach(function (n, k) {
      var p = path[n.i];
      var sp = SPACES[k];
      ctx.beginPath();
      ctx.fillStyle = "rgb(200,190,235)";
      ctx.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "300 12px Poppins,sans-serif";
      var tw = ctx.measureText(sp.title).width;
      var lx = p.x + n.offx;
      if (n.offx < 0) lx = p.x - tw - 10;
      if (lx < 8) lx = Math.min(w - tw - 8, p.x + 14);
      if (lx + tw > w - 8) lx = Math.max(8, w - tw - 8);
      ctx.fillStyle = "rgba(210,204,230,0.9)";
      ctx.fillText(sp.title, lx, p.y + n.offy);
      ctx.fillStyle = "rgba(170,166,196,0.85)";
      ctx.font = "300 10px Poppins,sans-serif";
      ctx.fillText(sp.sub, lx, p.y + n.offy + 14);
    });
    /* walker mark on the path */
    var u = t;
    var seg = u * (path.length - 1);
    var i = Math.min(path.length - 2, Math.floor(seg));
    var f = seg - i;
    var x = path[i].x + (path[i + 1].x - path[i].x) * f;
    var y = path[i].y + (path[i + 1].y - path[i].y) * f;
    ctx.beginPath();
    ctx.fillStyle = "rgb(230,226,245)";
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  var stage = document.getElementById("stage");
  stage.addEventListener("pointerdown", function (e) {
    if (Lab.variant !== "B") return;
    if (e.target.closest(".labbar")) return;
    drag = { id: e.pointerId, y: e.clientY, p: prog };
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener("pointermove", function (e) {
    if (!drag || drag.id !== e.pointerId) return;
    prog = Math.max(0, Math.min(1, drag.p + (drag.y - e.clientY) / 280));
    paint();
  });
  stage.addEventListener("pointerup", function () { drag = null; });
  stage.addEventListener("wheel", function (e) {
    if (Lab.variant !== "B") return;
    e.preventDefault();
    prog = Math.max(0, Math.min(1, prog + (e.deltaY > 0 ? 0.06 : -0.06)));
    paint();
  }, { passive: false });

  document.addEventListener("lab-variant", function () {
    if (Lab.variant === "A") prog = 0.55;
    if (Lab.variant === "C") prog = 1;
    if (Lab.variant === "B") prog = 0.25;
    paint();
  });
  Lab.stars(document.getElementById("sky"), 110, 19);
  Lab.init(notes);
  resize();
})();
