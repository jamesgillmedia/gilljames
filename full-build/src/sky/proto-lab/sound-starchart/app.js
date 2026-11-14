/* Sound: official dotted star-chart (sky.js SH.sound) + player bar that actually plays.
   Songs as stars — three proposals. The waveform and the bar never go away. */
(function () {
  var TRACKS = [
    { k: "togo", title: "To Go", artist: "Lost Coffee", file: "../_shared/media/audio/to-go.mp3", dur: 80, star: 7 },
    { k: "gone", title: "Gone Are the Days of Yesterday", artist: "Mothers Moniker", file: "../_shared/media/audio/gone-are-the-days.mp3", dur: 80, star: 5 },
    { k: "noproblem", title: "No Problem", artist: "Lost Coffee", file: "../_shared/media/audio/no-problem.mp3", dur: 80, star: 2 },
    { k: "lostintime", title: "Lost in Time", artist: "Lost Coffee", file: "../_shared/media/audio/lost-in-time.mp3", dur: 90, star: 10 },
    { k: "equals", title: "=", artist: "Lost Coffee", file: "../_shared/media/audio/equals.mp3", dur: 90, star: 13 },
    { k: "ii", title: "ii", artist: "Lost Coffee", file: "../_shared/media/audio/ii.mp3", dur: 70, star: 4 }
  ];
  /* Field positions for variant A/C — around the chart, not on it. */
  var FIELD = [
    { k: "togo", u: 0.14, v: 0.18 },
    { k: "gone", u: 0.84, v: 0.20 },
    { k: "noproblem", u: 0.16, v: 0.70 },
    { k: "lostintime", u: 0.50, v: 0.14 },
    { k: "equals", u: 0.88, v: 0.50 },
    { k: "ii", u: 0.12, v: 0.36 }
  ];
  /* hanging-peak bottoms (sky.js pairs [2,3][5,6][7,8][10,11][13,14]); ii has no hang */
  var HANG = { 2: 3, 5: 6, 7: 8, 10: 11, 13: 14 };
  var notes = {
    A: "A — Six songs sit as stars around the dotted waveform. Faint lines tie each song to its peak. Tap a star or a peak to play. The player bar stays.",
    B: "B — The hanging peaks on the waveform are the songs. Tap a named peak to play. The player bar stays.",
    C: "C — Drag or pinch the song-stars in the field. The waveform and the player bar stay anchored."
  };

  var chart = document.getElementById("chart");
  var ctx = chart.getContext("2d");
  var railcv = document.getElementById("railcv");
  var rctx = railcv.getContext("2d");
  var audio = new Audio();
  audio.preload = "auto";
  var sel = 3; /* Lost in Time */
  var shape = null;
  var box = { x: 0, y: 0, w: 0, h: 0 };
  var pts = [];
  var hits = [];
  var pan = { x: 0, y: 0, s: 1 };
  var invert = false;

  var notesEl = { now: document.getElementById("now"), lab1: document.getElementById("lab1"),
    time: document.getElementById("time"), dur: document.getElementById("dur") };

  function mmss(s) {
    s = Math.max(0, Math.round(s || 0));
    return (s / 60 | 0) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
  }
  function setSel(i, play) {
    sel = i;
    var t = TRACKS[i];
    notesEl.now.innerHTML = "<b>" + t.title + "</b> " + t.artist;
    notesEl.lab1.innerHTML = "<b>" + t.title + "</b> " + t.artist;
    notesEl.dur.textContent = mmss(t.dur);
    var was = !audio.paused && !audio.ended;
    audio.src = t.file;
    if (play || was) audio.play().catch(function () {});
    paint();
    paintRail();
  }
  document.getElementById("play").addEventListener("click", function () {
    if (audio.paused) audio.play().catch(function () {});
    else audio.pause();
  });
  document.getElementById("inv").addEventListener("click", function () {
    invert = !invert;
    this.setAttribute("aria-pressed", invert ? "true" : "false");
    document.body.style.filter = invert ? "invert(1) hue-rotate(180deg)" : "";
    /* keep lab bar readable? invert whole body including bar — existing sound invert does the look. OK */
  });
  audio.addEventListener("play", function () { document.body.classList.add("is-on"); });
  audio.addEventListener("pause", function () { document.body.classList.remove("is-on"); });
  audio.addEventListener("ended", function () { document.body.classList.remove("is-on"); });
  audio.addEventListener("timeupdate", function () {
    notesEl.time.textContent = mmss(audio.currentTime);
    paint();
    paintRail();
  });

  fetch("../_shared/media/sound-shape.json").then(function (r) { return r.json(); }).then(function (s) {
    shape = s;
    resize();
    setSel(3, false);
  });

  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = chart.clientWidth, h = chart.clientHeight;
    chart.width = Math.round(w * dpr);
    chart.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var rw = railcv.parentElement.clientWidth, rh = railcv.parentElement.clientHeight;
    railcv.width = Math.round(rw * dpr);
    railcv.height = Math.round(rh * dpr);
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* waveform lives in a fixed box so it stays put in variant C */
    var top = 88 + (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safe-t")) || 0);
    var bot = 150;
    box = { x: w * 0.12, y: h * 0.28, w: w * 0.76, h: Math.min(h * 0.32, 280) };
    if (w > 900) { box = { x: w * 0.22, y: h * 0.28, w: w * 0.56, h: h * 0.36 }; }
    paint();
    paintRail();
  }
  window.addEventListener("resize", resize);

  function mapPt(p) {
    return { x: box.x + p[0] * box.w, y: box.y + p[1] * box.h };
  }
  function fieldPt(f) {
    var w = chart.clientWidth, h = chart.clientHeight;
    var x = f.u * w, y = f.v * (h - 180) + 70;
    if (Lab.variant === "C") {
      x = w / 2 + (x - w / 2) * pan.s + pan.x;
      y = h / 2 + (y - h / 2) * pan.s + pan.y;
    }
    return { x: x, y: y };
  }

  function paint() {
    if (!shape) return;
    var w = chart.clientWidth, h = chart.clientHeight;
    ctx.clearRect(0, 0, w, h);
    pts = shape.s.map(mapPt);
    var col = "rgba(230,214,200,0.7)";
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    shape.e.forEach(function (e) {
      var a = pts[e[0]], b = pts[e[1]];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    hits = [];
    /* waveform dots — official vertices. flag 1 are extra field stars in the shape */
    pts.forEach(function (p, i) {
      var flag = shape.s[i][3];
      var track = TRACKS.filter(function (t) { return t.star === i; })[0];
      var on = track && TRACKS[sel].star === i;
      var rad = on ? 6 : flag ? 1.6 : 3.2;
      var c = on ? "rgb(150,230,170)" : "rgb(236,224,210)";
      glow(p.x, p.y, rad, c, on ? 0.9 : 0.7);
      if (track) hits.push({ x: p.x, y: p.y, r: 22, i: TRACKS.indexOf(track), kind: "peak" });
    });

    /* playhead along the spine (progress) */
    if (audio.duration) {
      var t = audio.currentTime / audio.duration;
      /* spine is the non-hang edges — approximate by interpolating x across box */
      var hx = box.x + t * box.w;
      /* find nearest spine y */
      var best = pts[0], bd = 1e9;
      pts.forEach(function (p, i) {
        if (shape.s[i][3]) return;
        var d = Math.abs(p.x - hx);
        if (d < bd) { bd = d; best = p; }
      });
      glow(hx, best.y, 3.5, "rgb(255,255,255)", 0.95);
    }

    var v = Lab.variant;
    /* B: names live on the hanging bottoms. A/C: names live on the field stars only,
       so the dotted waveform stays clean. */
    if (v === "B") {
      TRACKS.forEach(function (t, i) {
        var hi = HANG.hasOwnProperty(t.star) ? HANG[t.star] : t.star;
        var p = pts[hi];
        if (!p) return;
        var on = i === sel;
        glow(p.x, p.y, on ? 6 : 3.6, on ? "rgb(150,230,170)" : "rgb(236,224,210)", on ? 0.9 : 0.7);
        ctx.font = "300 11px Poppins,sans-serif";
        var label = t.title;
        var tw = ctx.measureText(label).width;
        var lx = p.x - tw / 2;
        if (lx < 8) lx = 8;
        if (lx + tw > w - 8) lx = w - tw - 8;
        var ly = p.y + 18;
        if (on) {
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          roundRect(lx - 5, ly - 12, tw + 10, 16, 3);
          ctx.fill();
        }
        ctx.fillStyle = on ? "rgb(190,240,200)" : "rgba(230,226,218,0.9)";
        ctx.fillText(label, lx, ly);
        hits.push({ x: p.x, y: p.y, r: 24, i: i, kind: "peak" });
      });
    }

    if (v === "A" || v === "C") {
      FIELD.forEach(function (f, i) {
        var t = TRACKS[i];
        var p = fieldPt(f);
        var peak = pts[t.star];
        var on = i === sel;
        ctx.strokeStyle = on ? "rgba(170,220,180,0.35)" : "rgba(220,214,200,0.2)";
        ctx.lineWidth = 1;
        if (peak) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(peak.x, peak.y);
          ctx.stroke();
        }
        glow(p.x, p.y, on ? 7 : 4.2, on ? "rgb(160,235,180)" : "rgb(236,228,214)", on ? 1 : 0.75);
        ctx.font = "300 12px Poppins,sans-serif";
        var tw = ctx.measureText(t.title).width;
        var lx = Math.max(8, Math.min(w - tw - 8, p.x - tw / 2));
        ctx.fillStyle = on ? "rgb(190,240,200)" : "rgba(220,214,200,0.92)";
        ctx.fillText(t.title, lx, p.y + 18);
        hits.push({ x: p.x, y: p.y, r: 26, i: i, kind: "star" });
      });
    }
  }

  function glow(x, y, r, rgb, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, rgb.replace("rgb", "rgba").replace(")", ",0.35)"));
    g.addColorStop(1, rgb.replace("rgb", "rgba").replace(")", ",0)"));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgb.replace("rgb", "rgba").replace(")", "," + a + ")");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.8, r * 0.35), 0, Math.PI * 2);
    ctx.fill();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function paintRail() {
    var w = railcv.parentElement.clientWidth, h = railcv.parentElement.clientHeight;
    rctx.clearRect(0, 0, w, h);
    if (!shape) return;
    /* dotted mini waveform — same official shape, flattened to the rail */
    var xs = shape.s.filter(function (p) { return p[3] === 0; });
    rctx.strokeStyle = "rgba(230,214,200,0.55)";
    rctx.lineWidth = 1;
    rctx.beginPath();
    xs.forEach(function (p, i) {
      var x = p[0] * w, y = h * 0.2 + p[1] * h * 0.6;
      if (i === 0) rctx.moveTo(x, y); else rctx.lineTo(x, y);
    });
    rctx.stroke();
    xs.forEach(function (p) {
      var x = p[0] * w, y = h * 0.2 + p[1] * h * 0.6;
      rctx.fillStyle = "rgb(236,224,210)";
      rctx.beginPath();
      rctx.arc(x, y, 1.4, 0, Math.PI * 2);
      rctx.fill();
    });
    if (audio.duration) {
      var t = audio.currentTime / audio.duration;
      var x = t * w;
      rctx.fillStyle = "#fff";
      rctx.fillRect(x - 0.5, 2, 1, h - 4);
      rctx.beginPath();
      rctx.arc(x, h / 2, 3, 0, Math.PI * 2);
      rctx.fill();
    }
  }

  /* seek on the rail */
  (function () {
    var rail = document.getElementById("rail");
    function at(e) {
      var r = rail.getBoundingClientRect();
      var u = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      if (audio.duration) audio.currentTime = u * audio.duration;
    }
    rail.addEventListener("pointerdown", function (e) {
      at(e);
      try { rail.setPointerCapture(e.pointerId); } catch (err) {}
    });
    rail.addEventListener("pointermove", function (e) {
      if (e.buttons) at(e);
    });
  })();

  /* tap stars / peaks */
  var drag = null;
  chart.addEventListener("pointerdown", function (e) {
    var r = chart.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    var hit = null, bd = 1e9;
    hits.forEach(function (h) {
      var d = Math.hypot(h.x - x, h.y - y);
      if (d < h.r && d < bd) { bd = d; hit = h; }
    });
    if (hit) {
      setSel(hit.i, true);
      return;
    }
    if (Lab.variant === "C") {
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      try { chart.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });
  chart.addEventListener("pointermove", function (e) {
    if (!drag || drag.id !== e.pointerId) return;
    pan.x = drag.px + (e.clientX - drag.x);
    pan.y = drag.py + (e.clientY - drag.y);
    paint();
  });
  chart.addEventListener("pointerup", function () { drag = null; });
  chart.addEventListener("pointercancel", function () { drag = null; });
  chart.addEventListener("wheel", function (e) {
    if (Lab.variant !== "C") return;
    e.preventDefault();
    var s = pan.s * (e.deltaY > 0 ? 0.95 : 1.05);
    pan.s = Math.max(0.7, Math.min(2.2, s));
    paint();
  }, { passive: false });

  /* two-finger pinch for C */
  var pinch = null;
  chart.addEventListener("touchstart", function (e) {
    if (Lab.variant !== "C" || e.touches.length !== 2) return;
    var a = e.touches[0], b = e.touches[1];
    pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s: pan.s };
  });
  chart.addEventListener("touchmove", function (e) {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    var a = e.touches[0], b = e.touches[1];
    var d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    pan.s = Math.max(0.7, Math.min(2.2, pinch.s * (d / pinch.d)));
    paint();
  }, { passive: false });
  chart.addEventListener("touchend", function () { pinch = null; });

  document.addEventListener("lab-variant", function () {
    pan = { x: 0, y: 0, s: 1 };
    paint();
  });
  Lab.stars(document.getElementById("sky"), 160, 42);
  Lab.init(notes);
  setSel(3, false);
  window.__sound = { play: function (i) { setSel(i, true); } };
})();
