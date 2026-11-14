/* One camera on the r3 sky. Levels: far, mid (Work), close, layer.
   Ported from site-v3-pro3/w7/js/world.js: camFar, camMid, camClose,
   camLayer, fly, goTo. fzEnd snaps to the nearest stop by calling fly(target). */
(function () {
  var stage = document.querySelector(".cam-stage.work");
  var layer = document.querySelector(".cam-stage.layer");
  if (!stage || !layer || !document.body.classList.contains("is-home")) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FRAMES = "https://jamesgillmedia.github.io/gilljames/site-v3-pro2/frames/";
  var lv = 0;
  var star = null;
  var flying = null;
  var pinch = null;
  var wheelU = 0;
  var wheelTimer = 0;
  var held = null;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function anim() { return !reduce; }

  function camFar() { return { lv: 0, s: 1, ox: 50, oy: 40 }; }
  function camMid() { return { lv: 1, s: 1, ox: 86, oy: 22 }; }
  function camClose(node) {
    var r = node ? node.getBoundingClientRect() : null;
    var box = stage.getBoundingClientRect();
    var s = 1.55;
    var ox = 50;
    var oy = 30;
    var tx = 0;
    var ty = 0;
    if (r && box.width) {
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      ox = ((cx - box.left) / box.width) * 100;
      oy = ((cy - box.top) / box.height) * 100;
      if (r.width * s > box.width - 20) s = Math.max(1.12, (box.width - 20) / r.width);
      var half = r.width * s / 2;
      var wantX = clamp(cx, box.left + 10 + half, box.right - 10 - half);
      var wantY = clamp(cy, 150, 460);
      tx = wantX - cx;
      ty = wantY - cy;
    }
    return { lv: 2, s: s, ox: ox, oy: oy, tx: tx, ty: ty, node: node };
  }
  function camLayer(node) {
    var r = node ? node.getBoundingClientRect() : null;
    return {
      lv: 3,
      s: 1,
      ox: r ? (r.left + r.width / 2) : window.innerWidth / 2,
      oy: r ? (r.top + r.height / 2) : window.innerHeight * 0.4,
      node: node
    };
  }
  function camFor(level, node) {
    if (level <= 0) return camFar();
    if (level === 1) return camMid();
    if (level === 2) return camClose(node || star);
    return camLayer(node || star);
  }

  function applyWork(cam) {
    stage.style.transformOrigin = cam.ox + "% " + cam.oy + "%";
    var tx = cam.tx || 0;
    var ty = cam.ty || 0;
    stage.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + cam.s + ")";
  }
  function applyLayer(cam, u) {
    var s = 0.18 + 0.82 * u;
    layer.style.transformOrigin = cam.ox + "px " + cam.oy + "px";
    layer.style.transform = "scale(" + s + ")";
  }
  function clearMotion() {
    stage.style.transform = "";
    stage.style.transformOrigin = "";
    layer.style.transform = "";
    layer.style.transformOrigin = "";
  }

  function paint(level) {
    document.body.classList.toggle("cam-on", level > 0);
    document.body.classList.toggle("cam-mid", level === 1);
    document.body.classList.toggle("cam-close", level === 2);
    document.body.classList.toggle("cam-layer", level === 3);
    document.querySelectorAll(".rail .tick").forEach(function (tick) {
      var work = tick.getAttribute("aria-label") === "Work";
      var on = work ? level > 0 : level === 0;
      tick.classList.toggle("on", on);
      if (on) tick.setAttribute("aria-current", "page");
      else tick.removeAttribute("aria-current");
    });
  }

  function frameKey(node) {
    var img = node && node.querySelector("img");
    var src = img ? img.getAttribute("src") || "" : "";
    var m = src.match(/films\/(\d+)/);
    return m ? m[1] : "";
  }

  function openLayer(node) {
    var key = frameKey(node);
    if (!key && /reel-2026/.test(node.getAttribute("href") || "")) key = "reel";
    var pack = (window.GJ_FRAMES && window.GJ_FRAMES[key]) || null;
    var shots = pack && pack.f ? pack.f : [];
    var title = (node.querySelector(".t") || {}).textContent || "";
    var roleEl = node.querySelector(".role") || node.querySelector(".sub");
    var head = layer.querySelector(".depth-head");
    head.querySelector(".depth-title").textContent = title.trim();
    head.querySelector(".depth-role").textContent = roleEl ? roleEl.textContent.trim() : "";
    var field = layer.querySelector(".depth-field");
    field.innerHTML = "";
    var list = shots.length ? shots.slice(0, 22) : [];
    if (!list.length) {
      var img = node.querySelector("img");
      if (img) list = [[img.getAttribute("src"), 0]];
    }
    var ar = pack && pack.ar ? pack.ar : 1.78;
    list.forEach(function (shot) {
      var fig = document.createElement("figure");
      fig.dataset.ar = String(ar);
      var im = document.createElement("img");
      var file = shot[0];
      im.src = file.indexOf("http") === 0 ? file : FRAMES + file;
      im.alt = "";
      fig.appendChild(im);
      field.appendChild(fig);
    });
    layer.scrollTop = 0;
  }

  function placeLoose(box) {
    var figs = box.querySelectorAll("figure");
    var width = box.clientWidth || 280;
    var bottom = 24;
    Array.prototype.forEach.call(figs, function (fig, index) {
      var wide = Math.round(width * (0.42 + ((index * 3) % 5) * 0.08));
      if (wide > width) wide = width;
      var tall = Math.round(wide / (parseFloat(fig.dataset.ar) || 1.78));
      fig.style.height = tall + "px";
      var span = Math.max(0, width - wide);
      var x = Math.round(span * (0.5 + 0.5 * Math.sin(index * 1.9 + 0.4)));
      var y = Math.round(12 + index * (tall * 0.55 + 18));
      var depth = Math.max(0.5, 1 - (index % 6) * 0.07);
      fig.style.left = x + "px";
      fig.style.top = y + "px";
      fig.style.width = wide + "px";
      var im = fig.querySelector("img");
      if (im) im.style.filter = "brightness(" + depth.toFixed(2) + ")";
      fig.style.zIndex = String(2 + (index % 5));
      bottom = Math.max(bottom, y + tall);
    });
    box.style.height = (bottom + 48) + "px";
  }

  function fly(target, opts) {
    opts = opts || {};
    if (flying) cancelAnimationFrame(flying);
    var from = lv;
    var to = target.lv;
    var node = target.node || star;
    if (to === 3 && node) openLayer(node);
    var dur = opts.instant || !anim() ? 0 : (opts.dur || 520);
    var t0 = performance.now();
    var startCam = (from === 2 && held) ? held : { s: from <= 0 ? 0.42 : 1, ox: target.ox, oy: target.oy, tx: 0, ty: 0 };
    if (to === 1 || to === 2) applyWork(startCam);
    if (to === 3) applyLayer(target, 0);
    if (to > 0) paint(to);
    else document.body.classList.add("cam-on");
    if (to === 3) placeLoose(layer.querySelector(".depth-field"));
    function frame(now) {
      var u = dur === 0 ? 1 : clamp((now - t0) / dur, 0, 1);
      var e = ease(u);
      if (to === 0) {
        applyWork({ s: 1 + (0.62 - 1) * e, ox: held ? held.ox : 86, oy: held ? held.oy : 22 });
        if (from === 3) applyLayer(target, 1 - e);
      } else if (to === 3) {
        applyLayer(target, e);
      } else {
        applyWork({
          s: startCam.s + (target.s - startCam.s) * e,
          ox: startCam.ox + (target.ox - startCam.ox) * e,
          oy: startCam.oy + (target.oy - startCam.oy) * e,
          tx: (startCam.tx || 0) + ((target.tx || 0) - (startCam.tx || 0)) * e,
          ty: (startCam.ty || 0) + ((target.ty || 0) - (startCam.ty || 0)) * e
        });
      }
      if (u < 1) flying = requestAnimationFrame(frame);
      else {
        flying = null;
        lv = to;
        if (node) star = node;
        if (to === 2) held = target;
        paint(lv);
        if (lv === 0 || lv === 1) clearMotion();
        if (lv === 2) applyWork(target);
        if (lv === 3) { layer.style.transform = ""; layer.style.transformOrigin = ""; }
        if (opts.done) opts.done();
      }
    }
    flying = requestAnimationFrame(frame);
  }

  function goTo(level, node) {
    if (node) star = node;
    if (node && level === 2 && stage.contains(node)) {
      var r = node.getBoundingClientRect();
      var view = stage.getBoundingClientRect();
      if (r.top < view.top + 90 || r.bottom > view.bottom - 24) {
        stage.scrollTop += r.top - (view.top + view.height * 0.36);
      }
    }
    fly(camFor(level, node), { instant: !anim() });
  }

  function fzEnd(u) {
    var targetU = clamp(Math.round(u), 0, 2);
    var target = camFor(targetU, star);
    fly(target, { dur: 280, instant: !anim() });
  }

  function onTick(tick) {
    var label = tick.getAttribute("aria-label");
    if (label === "Work") goTo(1);
    else if (label === "Index") goTo(0);
    else return false;
    return true;
  }

  document.addEventListener("click", function (e) {
    var tick = e.target.closest && e.target.closest(".rail a.tick");
    if (tick && onTick(tick)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    var chip = e.target.closest && e.target.closest(".cam-stage .chips a");
    var node = e.target.closest && e.target.closest(".cam-stage.work a.node");
    if (chip) {
      var id = chip.getAttribute("data-star");
      node = id ? stage.querySelector('a.node[href="' + id + '"]') : null;
    }
    if (node || chip) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!node) return;
      if (lv < 2 || star !== node) goTo(2, node);
      else goTo(3, node);
      return;
    }
    var homeFilm = e.target.closest && e.target.closest("main a.node, main a.star-card");
    if (homeFilm && /film\//.test(homeFilm.getAttribute("href") || "")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      goTo(3, homeFilm);
    }
  }, true);

  function dist(t) {
    var dx = t[0].clientX - t[1].clientX;
    var dy = t[0].clientY - t[1].clientY;
    return Math.hypot(dx, dy);
  }
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 2 || lv > 2) return;
    pinch = { d: dist(e.touches), u: lv };
  }, { passive: true });
  document.addEventListener("touchend", function () {
    if (!pinch) return;
    var u = pinch.u;
    pinch = null;
    fzEnd(u);
  });
  document.addEventListener("touchmove", function (e) {
    if (!pinch || e.touches.length < 2) return;
    var ratio = dist(e.touches) / pinch.d;
    pinch.u = clamp(lv + Math.log(ratio) / Math.log(1.55), 0, 2.4);
  }, { passive: true });

  document.addEventListener("wheel", function (e) {
    if (!e.ctrlKey || lv > 2) return;
    if (Math.abs(e.deltaY) < 8) return;
    wheelU = clamp((wheelU || lv) + (e.deltaY > 0 ? -0.35 : 0.35), 0, 2);
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () {
      fzEnd(wheelU);
      wheelU = 0;
    }, 140);
  }, { passive: true });

  window.addEventListener("resize", function () {
    if (lv === 3) placeLoose(layer.querySelector(".depth-field"));
  });
})();
