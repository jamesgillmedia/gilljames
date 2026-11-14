/* tonight/fable-m4 · the ghost arc (Gill's picked style).
   Drop-in replacement for js/ghostdial.js.

   A thin 110° arc (r 44) at a free screen edge, away from the thumb — the
   live, approved placement. Gold value tick (1.6 px, r−9 → r+8, 4 px glow),
   faint end ticks, a default mark, the control's name and value in tiny type.
   Line weights follow the options sheet; the arc is not moved to the thumb.

   Public surface (no other globals):
     window.GJ_DIAL
     window.GJ_GHOST   — compatibility alias so existing tune.js ghost() calls
                         keep working without a rewrite.

   API:
     update(info)  info = {name, min, max, def, value, x, y}
                   returns false if there is no safe place (the menu then stays).
                   If placed, the entire tune drawer (#markmenu or
                   [data-gjdial-drawer]) hides completely (opacity 0,
                   pointer-events none — not dimmed). Only the arc and the art
                   show. Dragging keeps working because pointer capture is set
                   on the range input at pointerdown.
     release()     the arc lingers, then fades, and is gone about a second
                   after release; then the drawer fades back in (.22s ease).
     hide()        hide the arc at once and restore the drawer.
     avoid(fn)     fn returns an array of [left,top,right,bottom] rects to clear.
     shown         whether the arc is currently visible (including the fade).

   Motion (STANDARDS.md §3; same integrator):
     value follow while dragging: critically damped spring, w = 10 (m4 scroll)
     settle after release:        w = 9, "settles in ~0.6 s" (4:45 tilt)
     fade-in:                     opacity .22s ease (CSS board fade)
     after release:               linger 280 ms, fade 720 ms, gone at ~1 s,
                                  then the drawer fades back. This linger is
                                  the approved ghost-dial timing, kept on
                                  purpose (not the sheet's 230 ms hide).
   Reduce Motion (media query, html.rm, or ?rm=1): snap to the same final
   state, no fades. One rAF loop, only while the arc is open or a value is
   settling. The waveform player is never covered and never has its opacity
   changed. */
(function (w) {
  'use strict';

  var LS = 'gj.dial';
  var NS = 'http://www.w3.org/2000/svg';
  var W_DRAG = 10;    /* STANDARDS §3 m4 scroll spring — while held */
  var W_SETTLE = 9;   /* STANDARDS §3 4:45 tilt — settle in ~0.6 s */
  var SPAN = 110;
  var RARC = 60;      /* a step up from 44 so the arc reads without crowding the edge */
  var LINGER = 280;   /* ms before the fade-out starts */
  var FADE_OUT = 720; /* ms; LINGER + FADE_OUT ≈ 1 s, then the drawer returns */
  var avoidFns = [];
  var root = null, svg = null, G = {};
  var target = null, shownV = 0, velV = 0, hasVal = false, holding = false;
  var hideT = 0, fadeT = 0, raf = 0, lastT = 0;
  var coverOn = false, pend = null, pendAt = 0;
  var PAD_ON = 4, PAD_OFF = 8, HYST = 150;
  var RMQ = null;
  try { RMQ = matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) {}

  /* Reduce Motion: the same covered / clear states, with no fade. */
  function rm() {
    var on = false;
    try { on = !!(RMQ && RMQ.matches); } catch (e) {}
    try { if (/[?&]rm=1(?:&|$)/.test(location.search)) on = true; } catch (e2) {}
    document.documentElement.classList.toggle('rm', on);
    return on;
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function u01(info, v) { return clamp((v - info.min) / ((info.max - info.min) || 1), 0, 1); }
  function el(n, a, p) {
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }

  function drawers() {
    var out = [], n, i, list;
    n = document.getElementById('markmenu');
    if (n) out.push(n);
    list = document.querySelectorAll('[data-gjdial-drawer]');
    for (i = 0; i < list.length; i++) if (out.indexOf(list[i]) < 0) out.push(list[i]);
    return out;
  }
  /* Ancestor drawers of the held slider only. A Vol strip does not fade
     because Flash, in another drawer, is the one covering content. */
  function ownerDrawers(el) {
    var out = [], n = el && el.parentElement;
    while (n && n !== document.body) {
      if ((n.hasAttribute && n.hasAttribute('data-gjdial-drawer')) || n.id === 'markmenu') out.push(n);
      n = n.parentElement;
    }
    return out;
  }
  function hideDrawer() {
    ownerDrawers(target && target.el).forEach(function (d) { d.classList.add('gd-away'); });
  }
  function showDrawer() {
    drawers().forEach(function (d) { d.classList.remove('gd-away'); });
  }

  /* The active range keeps pointer capture, so the drag survives .gd-away.
     .gd-active marks the input and its label / drawer ancestors. The drawer
     container itself is never opacity 0 — that would multiply the thumb away. */
  function markActive(r) {
    var old = document.querySelectorAll('.gd-active'), i;
    for (i = 0; i < old.length; i++) old[i].classList.remove('gd-active');
    if (!r) return;
    r.classList.add('gd-active');
    var n = r.parentElement;
    /* every ancestor stays opaque so the .18 thumb is not multiplied away;
       the label text is a sibling span, so it still drops to 0 */
    while (n && n !== document.body) {
      n.classList.add('gd-active');
      n = n.parentElement;
    }
  }
  document.addEventListener('pointerdown', function (e) {
    var r = e.target && e.target.closest && e.target.closest('input[type=range]');
    if (!r || e.pointerId == null) return;
    try { r.setPointerCapture(e.pointerId); } catch (err) {}
    markActive(r);
  }, true);
  document.addEventListener('pointerup', function () { if (!holding) markActive(null); }, true);
  document.addEventListener('pointercancel', function () { markActive(null); }, true);

  function hits(r, list) {
    return list.some(function (q) { return r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]; });
  }
  function rects() {
    var out = [], d, b;
    /* the Sound waveform player — never sit on it, never dim it */
    ['snd', 'wave'].forEach(function (id) {
      d = document.getElementById(id);
      if (d) { b = d.getBoundingClientRect(); if (b.height > 0) out.push([b.left, b.top - 6, b.right, b.bottom]); }
    });
    avoidFns.forEach(function (f) {
      try { (f() || []).forEach(function (q) { out.push(q); }); } catch (e) {}
    });
    return out;
  }

  function build() {
    if (root) return;
    root = document.createElement('div');
    root.id = 'gjdial';
    root.setAttribute('aria-hidden', 'true');
    svg = el('svg', { id: 'gjdial-ghost' }, root);
    var g = el('g', {}, svg);
    G.arc = el('path', { 'class': 'gd-arc' }, g);
    G.e0 = el('path', { 'class': 'gd-end' }, g);
    G.e1 = el('path', { 'class': 'gd-end' }, g);
    G.def = el('path', { 'class': 'gd-def' }, g);
    G.cur = el('path', { 'class': 'gd-cur' }, g);
    G.name = el('text', { 'class': 'gd-name' }, g);
    G.val = el('text', { 'class': 'gd-val' }, g);
    document.body.appendChild(root);
  }

  function pt(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function f(p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }

  /* free screen edge, away from the thumb — not around the thumb */
  function placeGhost(px, py) {
    var W = innerWidth, H = innerHeight, right = Math.max(12, px) < W / 2;
    var clear = 55; /* scaled with the arc; was 40 at r 44 */
    var cy = [H * .42, H * .30, H * .55, H * .68], avoid = rects();
    var cands = [];
    [right, !right].forEach(function (r) { cy.forEach(function (y) { cands.push({ r: r, y: y }); }); });
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i], box = c.r ? [W - RARC * .85, c.y - RARC, W, c.y + RARC] : [0, c.y - RARC, RARC * .85, c.y + RARC];
      if (!hits(box, avoid) && Math.abs((c.r ? W : 0) - px) > clear) return c;
    }
    return null;
  }

  function paint(info) {
    var c = placeGhost(info.x == null ? innerWidth / 2 : info.x, info.y == null ? innerHeight / 2 : info.y);
    if (!c) return false;
    var W = innerWidth, cx = c.r ? W - 11 + RARC * .62 : 11 - RARC * .62, cy = c.y;
    var mid = c.r ? 180 : 0, a0 = mid - SPAN / 2, a1 = mid + SPAN / 2;
    var ang = function (v) { return a0 + SPAN * u01(info, v); };
    var P = function (v, r) { return pt(cx, cy, r, ang(v)); };
    G.arc.setAttribute('d', 'M' + f(pt(cx, cy, RARC, a0)) + ' A' + RARC + ' ' + RARC + ' 0 0 1 ' + f(pt(cx, cy, RARC, a1)));
    G.e0.setAttribute('d', 'M' + f(pt(cx, cy, RARC - 6, a0)) + 'L' + f(pt(cx, cy, RARC + 6, a0)));
    G.e1.setAttribute('d', 'M' + f(pt(cx, cy, RARC - 6, a1)) + 'L' + f(pt(cx, cy, RARC + 6, a1)));
    var dv = info.def != null ? info.def : info.min;
    G.def.setAttribute('d', 'M' + f(P(dv, RARC - 4)) + 'L' + f(P(dv, RARC + 4)));
    G.cur.setAttribute('d', 'M' + f(P(info.value, RARC - 11)) + 'L' + f(P(info.value, RARC + 10)));
    var np = pt(cx, cy, RARC - 22, mid);
    G.name.textContent = String(info.name || '').toUpperCase();
    G.name.setAttribute('x', np[0].toFixed(1));
    G.name.setAttribute('y', (cy - 4).toFixed(1));
    G.name.setAttribute('text-anchor', c.r ? 'end' : 'start');
    G.val.textContent = String(Math.round(info.value));
    G.val.setAttribute('x', np[0].toFixed(1));
    G.val.setAttribute('y', (cy + 14).toFixed(1));
    G.val.setAttribute('text-anchor', c.r ? 'end' : 'start');
    return true;
  }

  function sliderBox(pad) {
    var el = target && target.el;
    if (!el || !el.getBoundingClientRect || !el.isConnected) return null;
    var b = el.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) return null;
    return [b.left - pad, b.top - pad, b.right + pad, b.bottom + pad];
  }
  function shownBox(el) {
    if (!el || !el.getBoundingClientRect) return null;
    if (el.classList && (el.classList.contains('lv-stage') || el.classList.contains('b-hit'))) return null;
    var b = el.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) return null;
    var n = el, s;
    while (n && n !== document.documentElement) {
      try { s = getComputedStyle(n); } catch (e) { return null; }
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return null;
      n = n.parentElement;
    }
    return [b.left, b.top, b.right, b.bottom];
  }
  /* Title, text, waveform, artwork, other controls, and the focused element.
     The slider's own drawer is not "content under it". */
  function contentRects(slider) {
    var owners = ownerDrawers(slider);
    function inOwner(el) { for (var k = 0; k < owners.length; k++) if (owners[k].contains(el)) return true; return false; }
    var sel = 'h1,h2,h3,p,button,a,canvas,img,input,label,.b-nm,.b-ln,.b-st,.b-sn,.b-so,.b-time,.b-no,.b-cov,.b-scr,.b-pls,.b-rail,.b-path';
    var list = document.querySelectorAll(sel), out = [], i, el, box;
    for (i = 0; i < list.length; i++) {
      el = list[i];
      if (el === slider) continue;
      if (inOwner(el)) continue;
      if (el.closest && el.closest('#gjdial,#dev,.b-hit')) continue;
      if (el.classList && el.classList.contains('b-hit')) continue;
      box = shownBox(el);
      if (box) out.push(box);
    }
    el = document.activeElement;
    if (el && el !== document.body && el !== slider && !inOwner(el) && !(el.closest && el.closest('#gjdial'))) {
      box = shownBox(el);
      if (box) out.push(box);
    }
    return out;
  }
  function overlaps(pad) {
    var box = sliderBox(pad);
    if (!box || !target || !target.el) return false;
    return hits(box, contentRects(target.el));
  }
  function applyCover(on) {
    pend = null;
    if (on) {
      var ok = paintNow();
      if (!ok) { coverOn = false; if (svg) svg.classList.remove('on', 'out'); showDrawer(); return; }
      coverOn = true;
      svg.classList.remove('out');
      svg.classList.add('on');
      hideDrawer();
    } else {
      coverOn = false;
      if (svg) svg.classList.remove('on', 'out');
      showDrawer();
    }
  }
  /* 4px to hide, 8px of clearance to come back, held for ~150ms so the edge doesn't flicker.
     Reduce Motion snaps to that same state. */
  function syncCover(now) {
    if (!holding || !target || !target.el) return;
    now = now || performance.now();
    var hit = overlaps(coverOn ? PAD_OFF : PAD_ON);
    if (hit === coverOn) { pend = null; return; }
    if (rm()) { applyCover(hit); return; }
    if (pend !== hit) { pend = hit; pendAt = now; return; }
    if (now - pendAt >= HYST) applyCover(hit);
  }

  function isVisible() {
    return !!(svg && (svg.classList.contains('on') || svg.classList.contains('out')));
  }
  function infoNow() {
    if (!target) return null;
    return {
      name: target.name, min: target.min, max: target.max, def: target.def,
      value: shownV, x: target.x, y: target.y, el: target.el
    };
  }
  function paintNow() {
    var info = infoNow();
    return info ? paint(info) : false;
  }
  function tick(now) {
    raf = 0;
    var reduced = rm();
    var dt = clamp(((now || performance.now()) - (lastT || now)) / 1000, 0.001, 0.05);
    lastT = now || performance.now();
    if (hasVal && target) {
      var wgt = holding ? W_DRAG : W_SETTLE;
      if (reduced) { shownV = target.value; velV = 0; }
      else {
        var x = shownV, v = velV, t = target.value;
        var e = x - t, k = Math.exp(-wgt * dt), c = v + wgt * e;
        shownV = t + (e + c * dt) * k;
        velV = (v - wgt * c * dt) * k;
      }
    }
    var settling = !reduced && target && (Math.abs(shownV - target.value) > 0.04 || Math.abs(velV) > 0.04);
    if (holding) syncCover(now || performance.now());
    if (isVisible()) paintNow();
    if (isVisible() || settling || holding) raf = requestAnimationFrame(tick);
  }
  function kick() {
    if (raf) return;
    lastT = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function update(info) {
    if (!root) build();
    if (!info) return false;
    var first = !hasVal;
    target = {
      name: info.name, min: info.min, max: info.max, def: info.def,
      value: info.value, x: info.x, y: info.y, el: info.el || null
    };
    if (first || rm()) { shownV = info.value; velV = 0; }
    hasVal = true;
    holding = true;
    clearTimeout(hideT); clearTimeout(fadeT);
    syncCover(performance.now());
    kick();
    return true;
  }
  function hideNow() {
    clearTimeout(hideT); clearTimeout(fadeT);
    if (svg) svg.classList.remove('on', 'out');
  }
  function release() {
    holding = false;
    pend = null;
    markActive(null);
    kick(); /* settle at w = 9 */
    if (!coverOn || !svg || !isVisible()) { coverOn = false; hideNow(); showDrawer(); return; }
    clearTimeout(hideT); clearTimeout(fadeT);
    if (rm()) { coverOn = false; hideNow(); showDrawer(); return; }
    hideT = setTimeout(function () {
      svg.classList.add('out');
      fadeT = setTimeout(function () { coverOn = false; hideNow(); showDrawer(); }, FADE_OUT);
    }, LINGER);
  }
  function relayout() { if (holding) syncCover(performance.now()); }
  function watchLayout() {
    addEventListener('scroll', function () { if (holding) syncCover(performance.now()); }, true);
    addEventListener('resize', relayout);
    if (w.ResizeObserver) {
      try {
        var ro = new ResizeObserver(function () { relayout(); });
        ro.observe(document.documentElement);
      } catch (e) {}
    }
  }
  if (document.body) watchLayout();
  else document.addEventListener('DOMContentLoaded', watchLayout);

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);

  /* the real site: never over the film board, a film page, or the calculator */
  avoidFns.push(function () {
    var u = w.__u1;
    if (!u) return null;
    var c = u.cur || {}, all = [[0, 0, innerWidth, innerHeight]];
    if (c.k === 'film' && (c.b || c.lv >= 2)) return all;
    if (c.lv >= 2) return all;
    if (u.bio && u.bio.on) return all;
    return null;
  });

  var api = {
    update: update,
    release: release,
    hide: function () { hideNow(); showDrawer(); holding = false; coverOn = false; pend = null; },
    relayout: relayout,
    avoid: function (fn) { avoidFns.push(fn); },
    get shown() { return isVisible(); },
    /* leftover from the five-style review; always 1 (ghost arc) */
    get style() { return 1; }
  };
  w.GJ_DIAL = api;
  w.GJ_GHOST = api;
})(window);
