/* Constellation: the widest level of a room. Every item of the room's set is a star; groups are clusters.
   Modelled on photo-lab/js/constellation.js (c8fd66b): the site's critically damped spring (sstep, glide weight 4.8, look weight 9.5),
   the level opens as a zoom out from the item you were on, and a tap on a star or a pinch in goes back in.
   Night: cool white stars. Red mode (html.rm): stars and lines glow deep darkroom red, nearer stars brighter and larger, the black stays dark.
   Host contract:  var C = Constellation({ items(), onReturn(index, x, y), label(index) , thumb(index) , hint })
                   C.open(selectedIndex)   C.leave()  (back out without choosing)   C.isOpen()                              */
(function () {
  'use strict';
  var W_GLIDE = 4.8, W_LOOK = 9.5, ZIN = 5.5;
  function S(x, w) { return { x: x, v: 0, t: x, w: w }; }
  function sstep(s, dt) { var w = s.w, e = s.x - s.t, k = Math.exp(-w * dt), c = s.v + w * e; s.x = s.t + (e + c * dt) * k; s.v = (s.v - w * c * dt) * k; }
  function aim(s, t, instant) { s.t = t; s.w = instant ? 40 : W_GLIDE; if (instant) { s.x = t; s.v = 0; } }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function rnd(i) { var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  var glows = {};
  function glow(rgb) {
    var k = rgb.join(','); if (glows[k]) return glows[k];
    var c = document.createElement('canvas'); c.width = c.height = 128; var q = c.getContext('2d'), gr = q.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(' + k + ',.95)'); gr.addColorStop(.18, 'rgba(' + k + ',.4)'); gr.addColorStop(.55, 'rgba(' + k + ',.08)'); gr.addColorStop(1, 'rgba(' + k + ',0)');
    q.fillStyle = gr; q.fillRect(0, 0, 128, 128); return (glows[k] = c);
  }
  var isRed = function () { return document.documentElement.classList.contains('rm'); };

  window.Constellation = function (opt) {
    var el = document.createElement('section'); el.className = 'cstl'; el.hidden = true; el.tabIndex = -1; el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Constellation: every item in this room as a star. Tap a star, or pinch in, to go back to an item.');
    var cv = document.createElement('canvas'); el.appendChild(cv);
    var back = document.createElement('button'); back.type = 'button'; back.className = 'cs-back'; back.innerHTML = '&#8249;&nbsp; return'; el.appendChild(back);
    var hint = document.createElement('p'); hint.className = 'cs-hint'; hint.textContent = opt.hint || 'pinch in or tap a star to go back in \u00b7 esc to return'; el.appendChild(hint);
    var count = document.createElement('p'); count.className = 'cs-count'; el.appendChild(count);
    document.body.appendChild(el);
    var g = cv.getContext('2d'), W = 0, H = 0, DPR = 1;
    var stars = [], edges = [], field = [], fitS = 1, maxR = 1, sel = 0, shown = false, raf = 0, lastT = 0, lastDraw = 0, closing = false, op = 0, hideT = 0, heavy = false;
    var cxS = S(0, W_GLIDE), cyS = S(0, W_GLIDE), csS = S(1, W_GLIDE), lxS = S(0, W_LOOK), lyS = S(0, W_LOOK);
    var drag = null, ptrs = {}, pinch = null, wheelLock = 0, wheelAcc = 0, wheelLast = 0, fired = false, thumb = null, thumbFor = -1;

    function layout() {
      var items = opt.items(), groups = [], gi = {};
      items.forEach(function (it, i) { var k = it.group == null ? 0 : it.group; if (gi[k] == null) { gi[k] = groups.length; groups.push({ k: k, idx: [], r: 0, x: 0, y: 0 }); } groups[gi[k]].idx.push(i); });
      var UNIT = 15;
      groups.forEach(function (gr) { gr.r = Math.max(26, Math.sqrt(gr.idx.length) * UNIT * .62); });
      var placed = [], order = groups.slice().sort(function (a, b) { return b.idx.length - a.idx.length; });
      order.forEach(function (gr, n) {
        if (!placed.length) { gr.x = 0; gr.y = 0; placed.push(gr); return; }
        for (var t = 0; t < 4000; t++) {
          var a = t * 2.39996 + n, r = 8 * Math.sqrt(t + 1) * 4, x = Math.cos(a) * r, y = Math.sin(a) * r * .86, ok = true;
          for (var j = 0; j < placed.length; j++) { var p = placed[j]; if (Math.hypot(p.x - x, p.y - y) < p.r + gr.r + 26) { ok = false; break; } }
          if (ok) { gr.x = x; gr.y = y; placed.push(gr); return; }
        }
        gr.x = n * 90; gr.y = 0; placed.push(gr);
      });
      stars = new Array(items.length);
      groups.forEach(function (gr) {
        var n = gr.idx.length;
        gr.idx.forEach(function (i, m) {
          var a = m * 2.39996 + (rnd(i + 1) - .5) * .5, r = n === 1 ? 0 : gr.r * Math.sqrt((m + .5) / n) * (1 + (rnd(i + 7) - .5) * .18);
          var d = rnd(i * 3 + 5);
          stars[i] = { i: i, gk: gr.k, x: gr.x + Math.cos(a) * r, y: gr.y + Math.sin(a) * r * .92, d: d, b: clamp(.3 + d * .7, .3, 1), ph: rnd(i + 40) * 6.28, sx: 0, sy: 0, tone: rnd(i + 90) };
        });
      });
      maxR = 60; stars.forEach(function (s) { maxR = Math.max(maxR, Math.hypot(s.x, s.y) + 12); });
      edges = [];
      groups.forEach(function (gr) {
        var ids = gr.idx;
        for (var k = 1; k < ids.length; k++) {
          var A = stars[ids[k]], best = -1, bd = 1e9, second = -1, sd = 1e9;
          for (var j = 0; j < k; j++) { var B = stars[ids[j]], d2 = (A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y);
            if (d2 < bd) { second = best; sd = bd; best = j; bd = d2; } else if (d2 < sd) { second = j; sd = d2; } }
          edges.push([ids[k], ids[best]]); if (k % 4 === 0 && second >= 0 && sd < bd * 3.4) edges.push([ids[k], ids[second]]);
        }
      });
      var cent = groups.map(function (gr) { return stars[gr.idx[0]]; });
      for (var c = 1; c < cent.length; c++) { var best2 = -1, b2 = 1e18; for (var j2 = 0; j2 < c; j2++) { var dd = Math.pow(cent[c].x - cent[j2].x, 2) + Math.pow(cent[c].y - cent[j2].y, 2); if (dd < b2) { b2 = dd; best2 = j2; } } edges.push([cent[c].i, cent[best2].i]); }
      field = [];
      for (var q = 0; q < 2; q++) { var pts = []; for (var n2 = 0; n2 < (q ? 46 : 80); n2++) pts.push({ x: rnd(n2 * 3 + q * 101 + 1), y: rnd(n2 * 3 + q * 101 + 2), r: q ? .7 : 1.05, b: rnd(n2 * 3 + q * 101 + 3) }); field.push({ f: q ? .4 : 1, a: q ? .5 : .85, pts: pts }); }
      heavy = stars.length > 500;
    }
    function fit() {
      W = innerWidth; H = innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
      fitS = Math.min((W - 36) * .5, (H - 150) * .5) / maxR;
    }
    function cam() { return { x: cxS.x + lxS.x / csS.x, y: cyS.x + lyS.x / csS.x, s: Math.max(.02, csS.x) }; }
    function sp(x, y, c) { return [(x - c.x) * c.s + W / 2, (y - c.y) * c.s + H / 2 + 8]; }

    function draw(t) {
      var red = isRed(), c = cam();
      g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
      field.forEach(function (L) {
        g.globalAlpha = L.a;
        g.fillStyle = red ? 'rgba(200,60,74,.55)' : 'rgba(220,230,245,.6)';
        L.pts.forEach(function (p) {
          var x = ((p.x * W - c.x * c.s * L.f * .15) % W + W) % W, y = ((p.y * H - c.y * c.s * L.f * .15) % H + H) % H;
          g.globalAlpha = L.a * (.25 + p.b * .6) * (red ? .7 : 1); g.beginPath(); g.arc(x, y, p.r, 0, 7); g.fill();
        });
      });
      g.globalAlpha = 1;
      var n = stars.length, i, s, q;
      for (i = 0; i < n; i++) { s = stars[i]; q = sp(s.x, s.y, c); s.sx = q[0]; s.sy = q[1]; }
      g.lineWidth = 1; g.strokeStyle = red ? 'rgba(190,40,56,.30)' : 'rgba(170,200,240,.30)'; g.beginPath();
      for (i = 0; i < edges.length; i++) { var a = stars[edges[i][0]], b = stars[edges[i][1]]; g.moveTo(a.sx, a.sy); g.lineTo(b.sx, b.sy); }
      g.stroke();
      var Z = c.s / fitS, gz = clamp(Math.pow(Z, .35), 1, 2.4), scale = heavy ? .62 : 1;
      for (i = 0; i < n; i++) {
        s = stars[i]; if (s.sx < -60 || s.sx > W + 60 || s.sy < -60 || s.sy > H + 60) continue;
        var on = s.i === sel, pulse = heavy && !on ? 1 : 1 + .07 * Math.sin(t / 900 + s.ph);
        var tint, core, depth = red ? (.55 + .9 * s.d) : 1;
        if (red) { tint = [Math.round(lerp(96, 255, s.d)), Math.round(lerp(14, 62, s.d)), Math.round(lerp(24, 80, s.d))]; core = 'rgb(' + Math.round(lerp(170, 255, s.d)) + ',' + Math.round(lerp(52, 150, s.d)) + ',' + Math.round(lerp(60, 156, s.d)) + ')'; }
        else { tint = s.tone < .3 ? [205, 225, 255] : s.tone < .7 ? [225, 232, 250] : [250, 236, 222]; core = '#fff'; }
        var gs = (5 + 16 * s.b) * pulse * gz * (on ? 1.5 : 1) * scale * (red ? .7 + .6 * s.d : 1);
        g.globalAlpha = (.45 + .5 * s.b) * (red ? .45 + .55 * s.d : 1); g.drawImage(glow(tint), s.sx - gs, s.sy - gs, gs * 2, gs * 2);
        g.globalAlpha = red ? .55 + .45 * s.d : 1; g.fillStyle = core; g.beginPath(); g.arc(s.sx, s.sy, Math.max(1, (1 + s.b * 1.6) * scale * (red ? .75 + .4 * s.d : 1)), 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      var cs = stars[sel];
      if (cs) {
        var ring = red ? 'rgba(255,92,106,.9)' : 'rgba(238,243,245,.85)';
        g.strokeStyle = ring; g.lineWidth = 1; g.beginPath(); g.arc(cs.sx, cs.sy, 12, 0, 7); g.stroke();
        var im = thumbImg(sel), tw = 64, th = 36;
        if (im && im.complete && im.naturalWidth) {
          var ar = im.naturalWidth / im.naturalHeight; th = 40; tw = th * ar; if (tw > 72) { tw = 72; th = tw / ar; }
          var tx = clamp(cs.sx - tw / 2, 8, W - tw - 8), ty = cs.sy + 20; if (ty + th + 14 > H - 8) ty = cs.sy - 20 - th - 12;
          g.drawImage(im, tx, ty, tw, th);
          g.strokeStyle = red ? 'rgba(190,40,56,.6)' : 'rgba(255,255,255,.25)'; g.strokeRect(tx + .5, ty + .5, tw - 1, th - 1);
          g.font = '300 9.5px Poppins,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = red ? 'rgba(255,120,130,.85)' : 'rgba(238,243,245,.8)';
          g.fillText(opt.label ? opt.label(sel) : '', clamp(cs.sx, 60, W - 60), ty + th + 5);
        }
      }
    }
    function thumbImg(i) {
      if (thumbFor !== i) { thumbFor = i; thumb = null; var u = opt.thumb && opt.thumb(i); if (u) { thumb = new Image(); thumb.decoding = 'async'; thumb.src = u; } }
      return thumb;
    }
    function frame(n) {
      raf = 0; if (!shown) return;
      var dt = Math.min(.05, Math.max(.001, (n - lastT) / 1000)); lastT = n;
      if (!drag) { sstep(lxS, dt); sstep(lyS, dt); }
      sstep(cxS, dt); sstep(cyS, dt); sstep(csS, dt);
      op = op + ((closing ? 0 : 1) - op) * (1 - Math.exp(-dt * (closing ? 5 : 14)));
      el.style.opacity = op > .995 ? 1 : op.toFixed(3);
      var live = Math.abs(csS.x - csS.t) > .0004 * csS.t || Math.abs(csS.v) > .002 || Math.abs(cxS.x - cxS.t) > .01 || Math.abs(lxS.x - lxS.t) > .01 || !!drag || Math.abs(op - (closing ? 0 : 1)) > .003;
      if (live || !heavy || n - lastDraw > 120) { draw(n); lastDraw = n; }
      if (closing && op < .01) { shown = false; closing = false; el.hidden = true; el.style.opacity = 0; return; }
      raf = requestAnimationFrame(frame);
    }
    function run() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); } }
    function pick(x, y, max) { var best = -1, bd = max * max; for (var i = 0; i < stars.length; i++) { var s = stars[i], d = (s.sx - x) * (s.sx - x) + (s.sy - y) * (s.sy - y); if (d < bd) { bd = d; best = i; } } return best; }
    function nearestCentre() { var best = sel, bd = 1e18; stars.forEach(function (s) { var d = (s.sx - W / 2) * (s.sx - W / 2) + (s.sy - H / 2) * (s.sy - H / 2); if (d < bd) { bd = d; best = s.i; } }); return best; }

    var api = {
      open: function (selected) {
        if (shown && !closing) return;
        layout(); fit(); clearTimeout(hideT); closing = false; fired = false; sel = clamp(selected | 0, 0, stars.length - 1);
        var st = stars[sel];
        aim(cxS, st.x, true); aim(cyS, st.y, true); aim(csS, fitS * ZIN, true); aim(lxS, 0, true); aim(lyS, 0, true);
        count.textContent = stars.length.toLocaleString('en-US') + (stars.length === 1 ? ' item' : ' items');
        shown = true; el.hidden = false; op = 0; el.style.opacity = 0; thumbFor = -1; draw(performance.now());
        aim(cxS, 0); aim(cyS, 0); aim(csS, fitS); run();
        el.focus({ preventScroll: true });
      },
      returnTo: function (i) {
        if (!shown || closing) return; closing = true; var st = stars[i]; sel = i;
        aim(cxS, st.x); aim(cyS, st.y); aim(csS, fitS * ZIN); run();
        opt.onReturn(i, st.sx, st.sy);
      },
      leave: function () { if (!shown || closing) return; closing = true; run(); if (opt.onLeave) opt.onLeave(); },
      isOpen: function () { return shown && !closing; },
      resize: function () { if (!shown) return; fit(); aim(csS, fitS, true); aim(cxS, 0, true); aim(cyS, 0, true); },
      selected: function () { return sel; }
    };

    el.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(ptrs).length > 1) { drag = null; var P = Object.keys(ptrs).map(function (k) { return ptrs[k]; }); pinch = Math.hypot(P[0].x - P[1].x, P[0].y - P[1].y); return; }
      drag = { x: e.clientX, y: e.clientY, m: false }; try { el.setPointerCapture(e.pointerId); } catch (x) {}
    });
    el.addEventListener('pointermove', function (e) {
      if (ptrs[e.pointerId]) { ptrs[e.pointerId].x = e.clientX; ptrs[e.pointerId].y = e.clientY; }
      var ks = Object.keys(ptrs);
      if (ks.length > 1 && pinch && !fired) { var P = ks.map(function (k) { return ptrs[k]; }), d = Math.hypot(P[0].x - P[1].x, P[0].y - P[1].y);
        if (d / pinch > 1.2) { fired = true; api.returnTo(nearestCentre()); } return; }
      if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 8) drag.m = true;
      if (drag.m) { aim(lxS, clamp(-dx * .5, -70, 70), true); aim(lyS, clamp(-dy * .5, -70, 70), true); lxS.w = lyS.w = W_LOOK; }
    });
    function up(e) {
      delete ptrs[e.pointerId]; if (!Object.keys(ptrs).length) { pinch = null; fired = false; }
      if (!drag) return; var d = drag; drag = null; aim(lxS, 0); aim(lyS, 0); lxS.w = lyS.w = W_LOOK;
      if (!d.m && e.type === 'pointerup') { var i = pick(e.clientX, e.clientY, 34); if (i >= 0) api.returnTo(i); }
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', function (e) {
      e.preventDefault(); var t = performance.now(); if (t - wheelLast > 220) { wheelLock = 0; wheelAcc = 0; } wheelLast = t; if (wheelLock) return;
      wheelAcc += -e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 4 : 1); if (wheelAcc > 60) { wheelLock = 1; api.returnTo(nearestCentre()); }
    }, { passive: false });
    back.addEventListener('click', function () { api.returnTo(sel); });
    document.addEventListener('keydown', function (e) {
      if (!api.isOpen()) return; var k = e.key;
      if (k === '+' || k === '=' || k === 'Enter' || k === 'Escape') { api.returnTo(sel); e.preventDefault(); e.stopImmediatePropagation(); }
      else if (k === 'ArrowRight' || k === 'ArrowLeft') { sel = clamp(sel + (k === 'ArrowRight' ? 1 : -1), 0, stars.length - 1); e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    addEventListener('resize', api.resize);
    return api;
  };
})();
