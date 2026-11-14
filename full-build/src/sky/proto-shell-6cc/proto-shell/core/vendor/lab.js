/* Shared proto-lab chrome: A/B/C proposals. Reduce Motion is not a different look. */
(function (w) {
  var Lab = w.Lab || {};
  Lab.variant = "A";
  Lab.init = function (notes, opts) {
    opts = opts || {};
    var keys = Object.keys(notes);
    var start = (opts.start || "A").toUpperCase();
    try {
      var q = new URLSearchParams(location.search).get("v");
      if (q && notes[q.toUpperCase()]) start = q.toUpperCase();
      else if (location.hash && notes[location.hash.replace("#", "").toUpperCase()])
        start = location.hash.replace("#", "").toUpperCase();
    } catch (e) {}
    var bar = document.querySelector(".labbar .variants");
    var noteEl = document.getElementById("vnote");
    function apply(v, push) {
      Lab.variant = v;
      document.body.setAttribute("data-v", v);
      if (bar) {
        bar.querySelectorAll("button").forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-v") === v ? "true" : "false");
        });
      }
      if (noteEl) noteEl.textContent = notes[v] || "";
      if (push !== false) {
        try {
          history.replaceState(null, "", "?v=" + v);
        } catch (e) {}
      }
      document.dispatchEvent(new CustomEvent("lab-variant", { detail: { v: v } }));
    }
    if (bar) {
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-v]");
        if (b) apply(b.getAttribute("data-v"));
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      var i = keys.indexOf(Lab.variant);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var n = keys[(i + (e.key === "ArrowRight" ? 1 : keys.length - 1)) % keys.length];
        apply(n);
      }
      if (e.key === "a" || e.key === "A" || e.key === "b" || e.key === "B" || e.key === "c" || e.key === "C") {
        var k = e.key.toUpperCase();
        if (notes[k]) apply(k);
      }
    });
    apply(notes[start] ? start : keys[0], false);
  };
  Lab.stars = function (canvas, n, seed) {
    var ctx = canvas.getContext("2d");
    var rnd = (function (s) {
      return function () {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    })(seed || 7);
    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = canvas.clientWidth,
        h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(w, h);
    }
    function paint(w, h) {
      ctx.clearRect(0, 0, w, h);
      var r = (function (s) {
        return function () {
          s = (s * 16807) % 2147483647;
          return (s - 1) / 2147483646;
        };
      })(seed || 7);
      for (var i = 0; i < (n || 140); i++) {
        var x = r() * w,
          y = r() * h;
        var rad = r() < 0.12 ? 1.6 + r() * 1.4 : 0.5 + r() * 0.9;
        var a = 0.35 + r() * 0.55;
        ctx.beginPath();
        ctx.fillStyle = "rgba(230,236,245," + a + ")";
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        if (rad > 1.4) {
          ctx.beginPath();
          ctx.fillStyle = "rgba(230,236,245," + a * 0.18 + ")";
          ctx.arc(x, y, rad * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return { resize: resize };
  };
  w.Lab = Lab;
})(window);
