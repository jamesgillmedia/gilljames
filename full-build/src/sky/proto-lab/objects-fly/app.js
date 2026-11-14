/* Objects rings fly-through. Official labels only. Not an orbit. */
(function () {
  var ASPECTS = ["whole piece", "surface", "making", "use"];
  var notes = {
    A: "A — Drag, scroll, or pinch to fly through the five rings toward JOIO CUP. The official labels stay.",
    B: "B — Tap through (or drag) to pass one ring at a time. The aspect that belongs to the ring you are in is the one that lights up.",
    C: "C — A closer fly. The nearest ring breaks the frame as you pass through it."
  };
  var mid = /(?:^|[?&])mid=1(?:&|$)/.test(location.search);
  var z = mid ? 0.42 : 0.15; /* 0 = far out, 1 = through the last ring */
  var cv = document.getElementById("fx");
  var ctx = cv.getContext("2d");
  var cup = document.getElementById("cup");
  var rlabel = document.getElementById("rlabel");
  var alabel = document.getElementById("alabel");
  var drag = null;

  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint();
  }
  window.addEventListener("resize", resize);

  function ringIndex() {
    return Math.min(4, Math.max(0, Math.floor(z * 5)));
  }
  function paint() {
    var w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h * 0.46;
    var v = Lab.variant;
    var dramatic = v === "C" ? 1.25 : 1;
    /* five rings receding. z moves you through them */
    for (var i = 4; i >= 0; i--) {
      var depth = (i + 1) / 5 - z; /* positive = still ahead */
      var d = depth;
      if (d < -0.35) continue;
      var scale = 1 / Math.max(0.12, 0.35 + d * 1.1) * 0.42 * dramatic;
      var rx = Math.min(w * 0.9, w * scale);
      var ry = rx * (v === "C" ? 0.78 : 0.62);
      var gold = i <= 1;
      var a = Math.max(0.15, Math.min(0.95, 0.35 + (1 - Math.abs(d)) * 0.6));
      var col = gold ? "rgba(232,160,70," + a + ")" : "rgba(170,200,210," + a + ")";
      ctx.save();
      if (d < 0.05 && v === "C") {
        /* slight motion streaks on the near ring */
        ctx.shadowColor = "rgba(232,180,100,0.4)";
        ctx.shadowBlur = 16;
      }
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = col;
      ctx.lineWidth = gold ? 8 * Math.max(0.4, 1 - Math.abs(d)) : 3;
      ctx.stroke();
      ctx.restore();
    }
    /* cup scale: closer as z increases */
    var cs = 0.72 + z * 0.55;
    cup.style.width = Math.min(42, 28 + z * 22) + "vw";
    cup.style.transform = "translate(-50%,-50%) scale(" + cs + ")";
    var ri = ringIndex();
    rlabel.textContent = "ring " + (ri + 1) + " of 5";
    /* four official aspect names; the fifth ring is the approach, no invented fifth name */
    alabel.innerHTML = ASPECTS.map(function (a, i) {
      return (i === Math.min(3, ri) ? "<em>" + a + "</em>" : a);
    }).join("  ·  ");
  }

  function setZ(n) {
    z = Math.max(0, Math.min(0.99, n));
    paint();
  }
  function through() {
    if (Lab.variant === "B") setZ((ringIndex() + 1) / 5);
    else setZ(z + 0.12);
  }
  document.getElementById("through").addEventListener("click", through);

  var stage = document.getElementById("stage");
  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".labbar, .through")) return;
    drag = { id: e.pointerId, y: e.clientY, z: z };
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener("pointermove", function (e) {
    if (!drag || drag.id !== e.pointerId) return;
    var next = drag.z + (drag.y - e.clientY) / 320;
    if (Lab.variant === "B") {
      /* snap toward ring steps while dragging, settle on release */
      setZ(next);
    } else setZ(next);
  });
  stage.addEventListener("pointerup", function () {
    if (Lab.variant === "B") setZ((ringIndex() + 0.01) / 5);
    drag = null;
  });
  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (Lab.variant === "B") {
      if (e.deltaY > 0) through();
      else setZ((ringIndex() - (z <= ringIndex() / 5 + 0.02 ? 1 : 0)) / 5);
    } else setZ(z + (e.deltaY > 0 ? 0.05 : -0.05));
  }, { passive: false });

  document.addEventListener("lab-variant", function () {
    setZ(mid ? (Lab.variant === "C" ? 0.55 : 0.42) : (Lab.variant === "C" ? 0.28 : 0.15));
  });
  Lab.stars(document.getElementById("sky"), 80, 5);
  Lab.init(notes);
  resize();
})();
