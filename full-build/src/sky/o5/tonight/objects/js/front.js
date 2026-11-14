/* Objects · the front stage (Nov 13, 2026 pass, built toward Sketch's calibre frames).
   The first thing you see in Objects: the hero piece as a lit disc in front of a tunnel of still rings going back into the
   dark, the other pieces at different depths around it. Your finger (or the mouse) pushes the pieces a little away from it,
   up to 14 px, and they settle back when you let go. The rings never move and nothing orbits (variant A, the default).
   Tap a piece to open it: a piece that leads into a ring goes through that ring, the others open their page.
   Scroll down for the rings and the board. Pinch in still goes through the first ring.
   Dev-only variants (../_tn/variants.js): A drift · B specimen case (one real photograph at a time in a lit case, the rest
   further back in the dark, from fable-m4/versions/objects-b) · C slow orbit, the comparison sketch Gill asked for only.
   Photographs are never graded or tinted. Nothing reads prefers-reduced-motion, so the output is the same with it on. */
(function () {
  'use strict';
  var D = window.OBJ_C, BOARD = D.board;
  var $ = function (id) { return document.getElementById(id) };
  var boardEl = $('board'), cards = $('cards');
  var ORDER = ['crescent-rim-of-a-cup', 'joio-co-cup-from-above', 'latte-in-a-joio-co-cup', 'hand-carved-piece', 'planter-cup-with-moss',
    'carved-spoon', 'stone-paper-cup', 'glazed-joio-co-cup-in-hand'];
  var P = ORDER.map(function (s) { var i = BOARD.findIndex(function (b) { return b.slug === s }); return i < 0 ? null : { b: BOARD[i], bi: i } }).filter(Boolean);
  /* fractions: [cx, cy, diameter (x unit)], label shown */
  var LAY = {
    port: [[.5, .27, .68, 1], [.22, .585, .34, 1], [.78, .565, .34, 1], [.53, .77, .24, 0], [.86, .79, .19, 0], [.15, .80, .18, 0], [.30, .895, .14, 0], [.72, .90, .13, 0]],
    land: [[.30, .47, .56, 1], [.615, .33, .27, 1], [.785, .47, .23, 1], [.64, .67, .19, 1], [.885, .70, .15, 0], [.53, .85, .12, 0], [.90, .22, .13, 0], [.76, .87, .10, 0]]
  };
  var DEPTH = [.55, 1, 1, 1.1, 1.2, 1.25, 1.3, 1.35];

  /* ---------- DOM ---------- */
  var front = document.createElement('section'); front.id = 'front'; front.setAttribute('aria-label', 'objects: still rings in the dark, the pieces in front of them');
  front.innerHTML = '<canvas id="tun" aria-hidden="true"></canvas><div class="fx"></div><button type="button" class="fdown" id="fdown">the rings and the board ↓</button>';
  boardEl.insertBefore(front, boardEl.firstChild);
  var tun = front.querySelector('#tun'), fx = front.querySelector('.fx');
  var els = P.map(function (p, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pc' + (i === 0 ? ' hero' : '');
    b.setAttribute('aria-label', p.b.title);
    b.innerHTML = '<span class="disc"><img alt="" decoding="async" src="media/' + p.b.img + (i === 0 ? '' : '-480') + '.webp"></span><span class="pl"></span>';
    b.querySelector('.pl').textContent = p.b.title;
    b.addEventListener('click', function (e) { if (moved) { e.preventDefault(); return } openPiece(i) });
    fx.appendChild(b); return { el: b, x: 0, y: 0, ox: 0, oy: 0, tx: 0, ty: 0, d: 0, s: 1 };
  });
  var cap = document.createElement('div'); cap.className = 'fcap'; fx.appendChild(cap);
  $('fdown').onclick = function () { var r = $('rings'); var t = r ? r.closest('section') : null; if (t) boardEl.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' }) };

  /* header: the ᑕᐣᓯ mark (its FAR is this front stage; tapped there it goes back to the star in the sky), crumb, count */
  var hd = document.createElement('header'); hd.id = 'ohd';
  hd.innerHTML = '<button type="button" class="sig" id="omark" lang="cr" aria-label="ᑕᐣᓯ: back to the front of Objects, then out to the sky">ᑕᐣᓯ</button>' +
    '<span class="ocr">objects</span><span class="osp"></span><span class="ovar" id="ovar"></span><span class="ocount">' + BOARD.length + ' pieces</span>';
  document.body.appendChild(hd);

  function openPiece(i) { var bi = P[i].bi, c = cards && cards.children[bi]; if (c) c.click() }

  /* ---------- variants: the A/B/C switch lives in the tune drawer, not the top bar ---------- */
  document.documentElement.setAttribute('data-tn-room', 'objects');
  var V = 'A';
  var tv = window.TNV && TNV.mount({ room: 'objects', def: 'A',
    list: [{ k: 'A', name: 'drift' }, { k: 'B', name: 'specimen case' }, { k: 'C', name: 'slow orbit · compare only' }],
    onChange: function (v) { V = v; layout(true) } });
  if (tv) V = tv.v;
  if (window.GJ_MARKMENU) GJ_MARKMENU.variant('objects', {
    k: 'tn.v.objects', label: 'layout', dev: 1, def: 'A',
    seg: [['A', 'A · drift'], ['B', 'B · specimen case'], ['C', 'C · slow orbit']],
    get: function () { return tv ? tv.v : V },
    apply: function (v) { if (tv) tv.set(v); else { V = v; layout(true) } }
  });

  /* Variant A only: discs and their captions stay 8px apart, and fully inside the stage. */
  function pieceBox(e, bx, by) {
    var x = bx - e.w / 2, y = by - e.h / 2, r = bx + e.w / 2, b = by + e.h / 2;
    if (e.el.classList.contains('lab')) {
      var lab = e.el.querySelector('.pl');
      if (lab && lab.offsetWidth > 2 && lab.offsetHeight > 2) {
        var lw = lab.offsetWidth, lh = lab.offsetHeight, lx = bx - lw / 2, ly = by + e.h / 2 + 12;
        if (lx < x) x = lx;
        if (lx + lw > r) r = lx + lw;
        if (ly + lh > b) b = ly + lh;
      }
    }
    return { x: x, y: y, r: r, b: b };
  }
  function pieceGap(A, B) {
    var ox = Math.min(A.r, B.r) - Math.max(A.x, B.x), oy = Math.min(A.b, B.b) - Math.max(A.y, B.y);
    var sx = Math.max(0, Math.max(A.x - B.r, B.x - A.r)), sy = Math.max(0, Math.max(A.y - B.b, B.y - A.b));
    var g = (sx > 0 && sy > 0) ? Math.hypot(sx, sy) : Math.max(sx, sy);
    return { hit: ox > 0.5 && oy > 0.5, ox: ox, oy: oy, g: g };
  }
  function piecesClear() {
    var i, j;
    for (i = 0; i < els.length; i++) {
      if (els[i].el.style.display === 'none') continue;
      var A = pieceBox(els[i], els[i].bx, els[i].by);
      if (A.x < 2 || A.y < 2 || A.r > W - 2 || A.b > H - 2) return false;
      for (j = i + 1; j < els.length; j++) {
        if (els[j].el.style.display === 'none') continue;
        var g = pieceGap(A, pieceBox(els[j], els[j].bx, els[j].by));
        if (g.hit || g.g < 9.5) return false;
      }
    }
    return true;
  }
  function keepPieceGap() {
    if (V !== 'A' || !(W > 0) || !(H > 0)) return;
    var saved = els.map(function (e) { return { bx: e.bx, by: e.by, w: e.w, h: e.h }; });
    var GAP = 10, pad = 2, scale = 1, attempt, pass, i, j;
    function placeScale() {
      els.forEach(function (e, n) {
        e.w = saved[n].w * scale; e.h = saved[n].h * scale; e.bx = saved[n].bx; e.by = saved[n].by;
        var pl = e.el.querySelector('.pl');
        if (pl) pl.style.maxWidth = Math.min(220, Math.max(88, e.w * 0.92)) + 'px';
        e.el.style.width = e.w + 'px'; e.el.style.height = e.h + 'px';
        e.el.style.marginLeft = (-e.w / 2) + 'px'; e.el.style.marginTop = (-e.h / 2) + 'px';
      });
    }
    function fits(e, bx, by) { var b = pieceBox(e, bx, by); return b.x >= pad && b.y >= pad && b.r <= W - pad && b.b <= H - pad }
    function pushOf(A, B) {
      var g = pieceGap(A, B); if (!g.hit && g.g >= GAP) return null;
      var acx = (A.x + A.r) / 2, acy = (A.y + A.b) / 2, bcx = (B.x + B.r) / 2, bcy = (B.y + B.b) / 2, dx = 0, dy = 0, need;
      if (g.hit) {
        if (g.ox <= g.oy) dx = (bcx >= acx ? 1 : -1) * (g.ox + GAP);
        else dy = (bcy >= acy ? 1 : -1) * (g.oy + GAP);
      } else {
        var sx = Math.max(0, Math.max(A.x - B.r, B.x - A.r)), sy = Math.max(0, Math.max(A.y - B.b, B.y - A.b));
        if (sx > 0 && sy > 0) { var len = Math.hypot(bcx - acx, bcy - acy) || 1; need = GAP - g.g; dx = (bcx - acx) / len * need; dy = (bcy - acy) / len * need }
        else if (sy === 0 || (sx > 0 && sx <= sy)) { dx = (bcx >= acx ? 1 : -1) * (GAP - sx) }
        else { dy = (bcy >= acy ? 1 : -1) * (GAP - sy) }
      }
      return { dx: dx, dy: dy };
    }
    for (attempt = 0; attempt < 8; attempt++) {
      placeScale();
      for (pass = 0; pass < 36; pass++) {
        var moved = false;
        for (i = 0; i < els.length; i++) {
          if (els[i].el.style.display === 'none') continue;
          for (j = i + 1; j < els.length; j++) {
            if (els[j].el.style.display === 'none') continue;
            var push = pushOf(pieceBox(els[i], els[i].bx, els[i].by), pieceBox(els[j], els[j].bx, els[j].by));
            if (!push) continue;
            var mi = els[i], mj = els[j];
            if (fits(mj, mj.bx + push.dx, mj.by + push.dy)) { mj.bx += push.dx; mj.by += push.dy; moved = true }
            else if (i !== 0 && fits(mi, mi.bx - push.dx, mi.by - push.dy)) { mi.bx -= push.dx; mi.by -= push.dy; moved = true }
            else {
              var hx = push.dx / 2, hy = push.dy / 2;
              if (fits(mj, mj.bx + hx, mj.by + hy) && (i === 0 || fits(mi, mi.bx - hx, mi.by - hy))) {
                mj.bx += hx; mj.by += hy; if (i !== 0) { mi.bx -= hx; mi.by -= hy } moved = true;
              }
            }
          }
        }
        if (!moved) break;
      }
      if (piecesClear()) return;
      scale *= 0.88;
    }
  }

  /* ---------- layout ---------- */
  var W = 0, H = 0, land = false, cur = 0;
  function fitImg(i, w, h) { var im = els[i].el.querySelector('img'); im.style.width = '100%'; im.style.height = '100%' }
  function layout(instant) {
    var r = front.getBoundingClientRect(); W = r.width; H = r.height; land = W > H * 1.05 || W >= 720;
    front.className = 'v' + V + (land ? ' land' : ' port');
    var L = land ? LAY.land : LAY.port, u = land ? Math.min(H, W * .62) : Math.min(W, H * .62);
    els.forEach(function (e, i) {
      var l = L[i], d = l[2] * u, x = l[0] * W, y = l[1] * H, w = d, h = d, sc = 1, z = 10 - i, show = true, lab = l[3];
      if (V === 'B') {
        var fh = land ? H * .62 : H * .46, fw = fh * .8; if (fw > W * (land ? .5 : .64)) { fw = W * (land ? .5 : .64); fh = fw / .8 }
        var k = i - cur;
        if (k === 0) { h = fh; w = fw; x = W * .5; y = land ? H * .44 : H * .40; z = 20; lab = 1 }
        else { /* the rest stand further back, alternating left and right of the case in front, smaller with distance */
          var order = [], j; for (j = 1; j < els.length; j++) { if (cur + j < els.length) order.push(cur + j); if (cur - j >= 0) order.push(cur - j) }
          var n = order.indexOf(i), a = Math.floor(n / 2) + 1, sd = n % 2 ? -1 : 1, s2 = Math.pow(.78, a);
          h = fh * .46 * s2; w = h * .8; x = W * .5 + sd * (fw * .5 + w * .5 + (land ? W * .02 : 6) + (a - 1) * (land ? W * .07 : W * .035) * s2 * 2.2);
          y = (land ? H * .40 : H * .37) - a * H * .02; z = 19 - a; lab = 0; show = a <= 4 && x - w / 2 > -w * .35 && x + w / 2 < W + w * .35 }
      } else if (V === 'C') {
        if (i === 0) { d = (land ? .46 : .54) * u; w = h = d; x = W * .5; y = H * (land ? .48 : .42) }
        else { w = h = l[2] * u * .9 }
        lab = i === 0 ? 1 : 0;
      }
      e.bx = x; e.by = y; e.w = w; e.h = h; e.z = z;
      var el = e.el; el.style.width = w + 'px'; el.style.height = h + 'px'; el.style.marginLeft = (-w / 2) + 'px'; el.style.marginTop = (-h / 2) + 'px';
      el.style.zIndex = z; el.style.display = show ? '' : 'none'; el.classList.toggle('lab', !!lab);
      el.classList.toggle('cur', V === 'B' && i === cur);
    });
    if (V === 'A') keepPieceGap();
    cap.textContent = V === 'B' ? (cur + 1) + ' / ' + els.length : '';
    cap.style.top = (V === 'B' ? (els[cur].by + els[cur].h / 2 + 38) : -999) + 'px';
    drawTunnel(); tick(true);
  }

  /* the tunnel: still rings around the hero going back into the dark, a faint shaft of light, a few far motes. Drawn once. */
  function drawTunnel() {
    var dpr = Math.min(2, devicePixelRatio || 1); tun.width = Math.round(W * dpr); tun.height = Math.round(H * dpr);
    var g = tun.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    var h0 = els[0], cx = h0.bx, cy = h0.by, R0 = h0.w / 2;
    if (V === 'B') { cx = W * .5; cy = (land ? H * .40 : H * .36); R0 = Math.min(W, H) * .2 }
    /* shaft */
    var sg = g.createLinearGradient(cx - R0 * 1.2, 0, cx + R0 * 1.2, 0);
    sg.addColorStop(0, 'rgba(200,210,225,0)'); sg.addColorStop(.5, 'rgba(200,210,225,.045)'); sg.addColorStop(1, 'rgba(200,210,225,0)');
    g.fillStyle = sg; g.beginPath(); g.moveTo(cx - R0 * .5, 0); g.lineTo(cx + R0 * .5, 0); g.lineTo(cx + R0 * 1.3, cy + R0 * .6); g.lineTo(cx - R0 * 1.3, cy + R0 * .6); g.closePath(); g.fill();
    /* soft spill behind the piece */
    var rg = g.createRadialGradient(cx, cy, R0 * .6, cx, cy, R0 * 2.4); rg.addColorStop(0, 'rgba(225,228,236,.07)'); rg.addColorStop(1, 'rgba(225,228,236,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    if (V === 'B') { /* a dark hall: a floor line and faint case plinth lines going back */
      var fy = (land ? H * .44 : H * .40) + (land ? H * .31 : H * .25);
      var fl = g.createLinearGradient(0, 0, W, 0); fl.addColorStop(0, 'rgba(232,228,220,0)'); fl.addColorStop(.5, 'rgba(232,228,220,.16)'); fl.addColorStop(1, 'rgba(232,228,220,0)');
      g.strokeStyle = fl; g.lineWidth = 1; g.beginPath(); g.moveTo(0, fy); g.lineTo(W, fy); g.stroke();
      for (var j = 1; j < 7; j++) { var yy = fy - j * j * 2.2 - j * 6; g.strokeStyle = 'rgba(232,228,220,' + (.07 / j).toFixed(3) + ')'; g.beginPath(); g.moveTo(W * .05, yy); g.lineTo(W * .95, yy); g.stroke() }
    } else { /* still rings, one behind another, each a little wider and drifting up-left into the fog */
      for (var i = 0; i < 16; i++) { var rr = R0 * (1.07 + i * .135), a = .1 * Math.pow(.8, i), ox = -i * R0 * .022, oy = -i * R0 * .018;
        g.strokeStyle = 'rgba(232,228,220,' + a.toFixed(3) + ')'; g.lineWidth = i === 0 ? 1.2 : 1; g.beginPath(); g.arc(cx + ox, cy + oy, rr, 0, Math.PI * 2); g.stroke() }
    }
    /* far motes (fixed seed, so every load is the same) */
    var s = 7; function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647 }
    for (var m = 0; m < 70; m++) { var mx = rnd() * W, my = rnd() * H, ma = .08 + rnd() * .22, mr = .4 + rnd() * .8; g.fillStyle = 'rgba(232,228,220,' + ma.toFixed(2) + ')'; g.beginPath(); g.arc(mx, my, mr, 0, 6.283); g.fill() }
  }

  /* ---------- motion ---------- */
  var ptr = null, raf = 0, t0 = performance.now(), moved = false;
  function tick(force) { if (!raf || force) { cancelAnimationFrame(raf); raf = requestAnimationFrame(step) } }
  function step(now) {
    raf = 0; var live = false;
    var M = Math.max(W, H), ang = (now - t0) / 1000 * (Math.PI * 2 / 90);
    els.forEach(function (e, i) {
      var tx = 0, ty = 0, x = e.bx, y = e.by, sc = 1;
      if (V === 'C' && i > 0) { /* comparison only: the pieces go slowly round the hero (90 s a turn) */
        var a0 = (i - 1) / (els.length - 1) * Math.PI * 2 + ang, rx = W * (land ? .34 : .40), ry = H * (land ? .34 : .30), hy = H * (land ? .48 : .42);
        x = W * .5 + Math.cos(a0) * rx; y = hy + Math.sin(a0) * ry; sc = .78 + .22 * (Math.sin(a0) + 1) / 2; e.el.style.zIndex = Math.round(sc * 30); live = true }
      if (V !== 'B' && ptr) { var vx = x - ptr.x, vy = y - ptr.y, dd = Math.hypot(vx, vy) || 1, k = 14 * DEPTH[i] * Math.exp(-dd / (M * .55)); tx = vx / dd * k; ty = vy / dd * k }
      e.ox += (tx - e.ox) * .12; e.oy += (ty - e.oy) * .12; if (Math.abs(tx - e.ox) > .05 || Math.abs(ty - e.oy) > .05) live = true;
      e.el.style.transform = 'translate3d(' + (x + e.ox).toFixed(2) + 'px,' + (y + e.oy).toFixed(2) + 'px,0) scale(' + sc.toFixed(3) + ')';
    });
    if (live) raf = requestAnimationFrame(step);
  }
  function at(e) { var r = front.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  var down = null;
  front.addEventListener('pointerdown', function (e) { ptr = at(e); down = { x: e.clientX, y: e.clientY, t: Date.now() }; moved = false; tick() });
  front.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || down) { ptr = at(e); if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) moved = true; tick() } });
  function lift(e) { if (down && V === 'B' && moved) { var dx = e.clientX - down.x; if (Math.abs(dx) > 40) { cur = Math.max(0, Math.min(els.length - 1, cur + (dx < 0 ? 1 : -1))); layout() } }
    down = null; if (e.pointerType !== 'mouse') ptr = null; tick(); setTimeout(function () { moved = false }, 0) }
  front.addEventListener('pointerup', lift); front.addEventListener('pointercancel', lift);
  front.addEventListener('pointerleave', function () { ptr = null; tick() });
  /* B: a tap on a case further back brings it forward; a tap on the one in front opens it */
  fx.addEventListener('click', function (e) { if (V !== 'B') return; var b = e.target.closest('.pc'); if (!b) return; var i = els.findIndex(function (x) { return x.el === b }); if (i !== cur) { e.preventDefault(); e.stopImmediatePropagation(); cur = i; layout() } }, true);
  addEventListener('keydown', function (e) { if (V !== 'B' || !document.body.classList.contains('at-board') || boardEl.scrollTop > 40) return;
    if (e.key === 'ArrowRight' && cur < els.length - 1) { cur++; layout(); e.stopImmediatePropagation() } else if (e.key === 'ArrowLeft' && cur > 0) { cur--; layout(); e.stopImmediatePropagation() } }, true);
  addEventListener('resize', function () { layout(true) });

  /* ---------- the mark: one tap to this room's FAR (the front stage); tapped there, back to the star in the sky ---------- */
  function toSky() { if (window.TN_HANDOFF) TN_HANDOFF.out(); if (history.length > 1) { history.back(); return } location.href = new URL('../fable-m4/', location.href).pathname + '#/' }
  function atFront() { return document.body.classList.contains('at-board') && !document.body.classList.contains('at-detail') && boardEl.scrollTop < 40 }
  function toFront() { var o = window.__objc; if (document.body.classList.contains('at-detail')) { history.back(); return }
    if (o && o.S && o.S.lv !== 'board') { o.toBoard(); setTimeout(function () { boardEl.scrollTo({ top: 0 }) }, 700); return } boardEl.scrollTo({ top: 0, behavior: 'smooth' }) }
  $('omark').addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (window.GJ_MARKMENU && GJ_MARKMENU.open) { GJ_MARKMENU.show(false); return }
    if (atFront()) toSky(); else toFront();
  }, true);
  /* Esc at the front, with nothing open: out to the star you came from (one level out). Inside, Esc still rises one layer. */
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && atFront() && !e.defaultPrevented) { var o = window.__objc; if (o && o.S && o.S.lv === 'board') { e.stopImmediatePropagation(); e.preventDefault(); toSky() } } }, true);
  window.__front = { get v() { return V }, set: function (v) { tv ? tv.set(v) : (V = v, layout()) }, get cur() { return cur }, layout: layout, toSky: toSky, atFront: atFront,
    pieces: function () { return els.map(function (e, i) { var r = e.el.getBoundingClientRect(); return { t: P[i].b.title, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } }) } };
  requestAnimationFrame(function () { layout(true) });
})();
