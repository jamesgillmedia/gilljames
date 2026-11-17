/* fable-m4 · the Pro 2 sky as the farthest zoom-out (Pack 1116 §2). At the top of the sky a pinch out (or a wheel out, or "−") gathers the five
   constellations into Pro 2's compact cluster round the glowing Mark; a pinch in, a tap, a wheel in, "+" or Back opens it again into the full sky.
   It is the same sky: each glyph starts where its constellation stands on screen and travels to its place on Pro 2's ring while the sky under it
   lets go. One step in history, so Back returns to the sky. Nothing is a photograph here, so nothing is tinted; in safelight it is all red.
   Drawing: js/p2draw.js (shared with Site V3's framed sky). Reduce Motion: the two views swap with no travel. */
(function (w, d) {
  'use strict';
  var H = d.documentElement, RMQ = matchMedia('(prefers-reduced-motion: reduce)'), DUR = 760;
  var root = null, cv = null, g = null, cap = null, open = false, k = 0, kt = 0, t0 = 0, raf = 0, W = 0, HH = 0, dpr = 1, from = null, L = null, anim = null, btns = {}, quiet = false;
  function rm() { return RMQ.matches; }
  function u1() { return w.__u1 || null; }
  function atTop() { var u = u1(); if (!u || u.phase !== 'sky' || !u.cur || u.cur.lv !== 0) return false; try { if (u.bio && u.bio.on) return false; } catch (e) {} return !(H.classList.contains('gj-map-open') || H.classList.contains('mm-open') || H.classList.contains('mk-on') || H.classList.contains('sg-up') || (w.GJ_FAMILY && w.GJ_FAMILY.isOpen && w.GJ_FAMILY.isOpen())); }
  function red() { return H.classList.contains('rm') ? (H.getAttribute('data-red-tone') === 'rose' ? '255,176,184' : '255,68,87') : null; }
  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function build() {
    if (root) return; root = d.createElement('div'); root.id = 'p2'; root.hidden = true; root.setAttribute('role', 'group'); root.setAttribute('aria-label', 'the whole sky, gathered');
    root.innerHTML = '<canvas aria-hidden="true"></canvas><button type="button" class="p2-mark" aria-label="ᑕᐣᓯ · fly in to the whole sky"></button><p class="p2-cap">the whole sky · tap or pinch to fly in</p>';
    d.body.appendChild(root); cv = root.querySelector('canvas'); g = cv.getContext('2d'); cap = root.querySelector('.p2-cap');
    w.GJ_P2DRAW.order.forEach(function (c) { var b = d.createElement('button'); b.type = 'button'; b.className = 'p2-g'; b.dataset.k = c; b.setAttribute('aria-label', c + ' · fly in'); root.appendChild(b); btns[c] = b; });
    var PT = {}, pd = 0, tap = null;
    root.addEventListener('pointerdown', function (e) { PT[e.pointerId] = [e.clientX, e.clientY]; var ids = Object.keys(PT); if (ids.length === 2) { pd = Math.hypot(PT[ids[0]][0] - PT[ids[1]][0], PT[ids[0]][1] - PT[ids[1]][1]) || 1; tap = null; } else tap = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; });
    root.addEventListener('pointermove', function (e) { if (!PT[e.pointerId]) return; PT[e.pointerId] = [e.clientX, e.clientY]; var ids = Object.keys(PT); if (ids.length < 2 || !pd) return; var r = Math.hypot(PT[ids[0]][0] - PT[ids[1]][0], PT[ids[0]][1] - PT[ids[1]][1]) / pd; if (r > 1.18) { pd = 0; fly(); } else if (r < .8 && k > .9) { pd = 0; outer(); } });
    function up(e) { var was = tap; delete PT[e.pointerId]; if (Object.keys(PT).length < 2) pd = 0; if (was && was.id === e.pointerId && e.type === 'pointerup' && Math.abs(e.clientX - was.x) + Math.abs(e.clientY - was.y) < 12 && performance.now() - was.t < 600 && open && k > .9) { tap = null; fly(); } }
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
    var oAcc = 0, oT = 0;
    root.addEventListener('wheel', function (e) { e.preventDefault(); if (!open) return; if (e.deltaY < -8) { fly(); return; } var n = performance.now(); if (n - oT > 450) oAcc = 0; oT = n; oAcc += e.deltaY; if (oAcc > 90 && k > .9) { oAcc = 0; outer(); } }, { passive: false });
    ['click', 'dblclick', 'contextmenu', 'touchstart', 'touchmove', 'touchend'].forEach(function (n) { root.addEventListener(n, function (e) { e.stopPropagation(); }, { passive: true }); });
    w.addEventListener('resize', function () { if (open) { size(); place(); paint(); } });
    new MutationObserver(function () { if (open) paint(); }).observe(H, { attributes: true, attributeFilter: ['class', 'data-red-tone'] });
  }
  function size() { dpr = Math.min(2, w.devicePixelRatio || 1); W = w.innerWidth; HH = w.innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(HH * dpr); }
  /* where the sky's own constellations and Mark stand right now, and where Pro 2's ring puts them */
  function measure() {
    var u = u1(), m = null; try { m = u.map; } catch (e) {} from = {}; var cx = W / 2, cy = HH * .5, xs = [], ys = [];
    if (m && m.ch) m.ch.forEach(function (c) { from[c.k] = [c.x, c.y]; if (c.k !== 'about') { xs.push(c.x); ys.push(c.y); } });
    if (xs.length) { cx = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length; cy = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length; }
    if (w.GJ_SKYFX && w.GJ_SKYFX.markAt) { try { var q = w.GJ_SKYFX.markAt(); if (q && isFinite(q[0])) { cx = q[0]; cy = q[1]; } } catch (e) {} }
    from._c = [cx, cy]; L = w.GJ_P2DRAW.full(W, HH);
  }
  function place() { if (!L) return; w.GJ_P2DRAW.order.forEach(function (c) { var p = L.pos[c], b = btns[c], s = 72 * L.gs, h = Math.max(44, 36 * L.gs + 26); b.style.left = (p[0] - s / 2) + 'px'; b.style.top = (p[1] - 18 * L.gs - 4) + 'px'; b.style.width = s + 'px'; b.style.height = h + 'px'; });
    var mk = root.querySelector('.p2-mark'), ms = Math.max(64, 60 * L.gs); mk.style.left = (L.c[0] - ms / 2) + 'px'; mk.style.top = (L.c[1] - ms / 2) + 'px'; mk.style.width = mk.style.height = ms + 'px';
    cap.style.top = Math.min(HH - 54, L.c[1] + L.R + 36 * L.gs + 34) + 'px'; }
  function paint() {
    if (!g) return; var e = ease(k), pos = {}, c0 = from._c, c = [c0[0] + (L.c[0] - c0[0]) * e, c0[1] + (L.c[1] - c0[1]) * e];
    w.GJ_P2DRAW.order.forEach(function (n) { var a = from[n] || L.pos[n], b = L.pos[n]; pos[n] = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, L.gs * (2.3 - 1.3 * e), Math.max(0, Math.min(1, (k - .12) / .5))]; });
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, HH);
    w.GJ_P2DRAW.draw(g, W, HH, { t: (performance.now() - t0) / 1000, red: red(), c: c, R: L.R, gs: L.gs, pos: pos, a: Math.max(0, Math.min(1, k / .7)), ground: Math.max(0, Math.min(1, (k - .15) / .6)), mark: Math.max(0, Math.min(1, (k - .3) / .5)), labels: true });
    cap.style.opacity = Math.max(0, (k - .7) / .3).toFixed(3);
  }
  function step(now) { raf = 0; if (anim) { var x = Math.min(1, (now - anim.t) / anim.d); k = anim.a + (anim.b - anim.a) * x; if (x >= 1) { var done = anim.done; anim = null; if (done) done(); } }
    H.style.setProperty('--p2k', ease(k).toFixed(4)); paint(); if (anim || (open && !rm())) raf = requestAnimationFrame(step); }
  function go(to, done) { anim = { a: k, b: to, t: performance.now(), d: rm() ? 1 : Math.max(1, DUR * Math.abs(to - k)), done: done }; if (!raf) raf = requestAnimationFrame(step); }
  function show(instant) {
    build(); if (open) return; open = true; size(); measure(); place(); t0 = performance.now(); root.hidden = false; H.classList.add('p2-on'); if (instant) k = 1; go(1, function () { H.classList.add('p2-in'); });
  }
  function hide(instant) {
    if (!open) return; open = false; H.classList.remove('p2-in'); if (instant) k = 0;
    go(0, function () { if (!open) { root.hidden = true; H.classList.remove('p2-on'); H.style.removeProperty('--p2k'); } });
  }
  function st() { var s = history.state || {}, o = { gjp2: 1 }; if (s.u1) { o.u1 = 1; o.cur = s.cur; o.n = s.n; } return o; }
  /* out: gather. One step in history. */
  function gather() { if (open) return true; if (!w.GJ_P2DRAW || !atTop()) return false; show(false); try { history.pushState(st(), '', location.pathname + location.search + location.hash); } catch (e) {} return true; }
  /* in: fly back into the full sky (the same as Back) */
  function fly() { if (!open) return; if (history.state && history.state.gjp2) { try { history.back(); return; } catch (e) {} } hide(false); }
  w.addEventListener('popstate', function (e) { var on = !!(e.state && e.state.gjp2);
    if (open && !on) { e.stopImmediatePropagation(); hide(false); return; }
    if (!open && on) { e.stopImmediatePropagation(); if (w.GJ_P2DRAW && u1() && u1().phase === 'sky') show(false); } }, true);
  w.addEventListener('keydown', function (e) { var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (H.classList.contains('mm-open') || H.classList.contains('gj-map-open') || H.classList.contains('mk-on') || (w.GJ_FAMILY && w.GJ_FAMILY.isOpen && w.GJ_FAMILY.isOpen())) return;   // Tune, the map and the others answer their own keys first
    if (open && (e.key === '-' || e.key === '_')) { e.preventDefault(); e.stopImmediatePropagation(); outer(); return; }
    if (open) { if (e.key === 'Escape' || e.key === '+' || e.key === '=' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); fly(); } return; }
    if ((e.key === '-' || e.key === '_') && atTop()) { e.preventDefault(); gather(); } }, true);
  var wAcc = 0, wT = 0;
  w.addEventListener('wheel', function (e) { if (open || !atTop() || e.deltaY <= 0 || (e.target && e.target.closest && e.target.closest('#markmenu,#gj-map,#fam,#mkp,#sga'))) return; var n = performance.now(); if (n - wT > 450) wAcc = 0; wT = n; wAcc += (e.ctrlKey ? 4 : 1) * e.deltaY; if (wAcc > 90) { wAcc = 0; gather(); } }, { passive: true });
  /* Site V3 is the outer layer (§3). Its framed sky flies in to this page (…?sky=1&from=v3): the gathered view is already on screen there,
     so this page opens on it and lets it open into the full sky. No step is added: Back from the full sky is Site V3's scroll, at The Sky.
     From the gathered view, one more out is that scroll again, but only when it really is the page two steps back (never out of the site). */
  var V3 = /[?&]from=v3(?:&|$)/.test(location.search), v3t = 0;
  function outer() { var n = 0, hs = history.state; try { n = +sessionStorage.getItem('gj.v3.out') || 0; } catch (e) {} if (!open || !n || !hs || !hs.gjp2 || hs.n !== 0 || history.length !== n + 1) return false; try { history.go(-2); } catch (e) { return false; } return true; }
  function fromV3(n) { if (!w.GJ_P2DRAW || !d.body) return; var u = u1();
    if (!open && n === 0) { show(true); quiet = true; }
    if (u && u.ready && u.phase === 'sky') { if (history.length > 1) { try { sessionStorage.setItem('gj.v3.out', String(history.length)); } catch (e) {} }
      try { history.replaceState(history.state, '', location.pathname + location.search.replace(/([?&])from=v3(&|$)/, function (m, a, b) { return b ? a : ''; }) + location.hash); } catch (e) {}
      clearTimeout(v3t); v3t = setTimeout(function () { quiet = false; if (open && !(history.state && history.state.gjp2)) { measure(); hide(false); } }, rm() ? 60 : 420); return; }
    if (n < 80) setTimeout(function () { fromV3(n + 1); }, 120); else { quiet = false; hide(true); } }
  if (V3) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { fromV3(0); }); else fromV3(0); }
  /* a reload on the gathered view comes back to it */
  function boot(n) { if (history.state && history.state.gjp2) { if (u1() && u1().ready && u1().phase === 'sky' && w.GJ_P2DRAW) show(true); else if (n < 60) setTimeout(function () { boot(n + 1); }, 150); } }
  if (d.readyState === 'complete') boot(0); else w.addEventListener('load', function () { boot(0); });
  w.GJ_P2 = { gather: gather, fly: fly, isOpen: function () { return open; }, outer: function () { return outer(); }, state: function () { return { open: open, v3: V3, k: +k.toFixed(3), moving: !!anim, c: L ? L.c : null, R: L ? L.R : 0, pos: L ? L.pos : null, from: from }; } };
})(window, document);
