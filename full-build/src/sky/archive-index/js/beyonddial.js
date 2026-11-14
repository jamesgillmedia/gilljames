/* Beyond dial for the archive index (port of tonight/fable-m4 js/beyonddial.js, preview-beyond), the big dial only.
   One hub sits beside the red-mode ring. One tap opens the Beyond dial (outer ring = ten snapped detents: off, red, the hue families orange / amber / green / teal / blue / violet, mono, light; inner ring = the sweep within the step);
   a second tap on the hub, a tap outside, Esc or the back gesture closes it. Nothing hides by itself. No depth, drift, easing or orbit dials and no sub-menu.
   The expand, snap-to-detent and contract all run on the site spring (GJ_BEYOND.cam(), W_GLIDE); finger tracking is the moon opener's exponential lag
   (14 mouse, 22 touch). No CSS transition moves anything. Held: the rest of the dial goes at once, the active track stays at 18%.
   Colour is only ever on the dial: the outer ring carries the actual hue at each detent (neutral, red, orange, amber, green, teal, blue, violet, grey, white); the active arc,
   thumb, label, hub dot and the inner sweep take the colour at the current position (red mode: the ring stays on a dim-to-bright red ramp; the selection still works on frames).
   Images are never touched. */
(function (w) {
  'use strict';
  var B = w.GJ_BEYOND; if (!B) return;
  var doc = document, root = doc.documentElement;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  var NS = 'http://www.w3.org/2000/svg', A0 = -135, A1 = 135;
  function ang(t) { return A0 + (A1 - A0) * t; }
  function pt(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; }
  function arc(cx, cy, r, t0, t1) { var p0 = pt(cx, cy, r, ang(t0)), p1 = pt(cx, cy, r, ang(t1)), large = (ang(t1) - ang(t0)) > 180 ? 1 : 0; return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2); }
  function line(cx, cy, r0, r1, deg) { var a = pt(cx, cy, r0, deg), b = pt(cx, cy, r1, deg); return 'M' + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + 'L' + b[0].toFixed(2) + ' ' + b[1].toFixed(2); }
  function el(n, a, txt) { var e = doc.createElementNS(NS, n), k; for (k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  function P(g, cls, d) { var h = el('path', { 'class': 'bd-halo', d: d }); g.appendChild(h); var m = el('path', { 'class': cls, d: d }); g.appendChild(m); return m; }

  /* ---------- colour: dial UI only ---------- */
  var UI = [232, 228, 220], RED = [238, 54, 70], RED_DIM = [128, 30, 42], RED_BRIGHT = [255, 74, 92];
  var isRed = function () { return root.classList.contains('rm'); };
  function mixv(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rgb(v, a) { return 'rgba(' + Math.round(v[0]) + ',' + Math.round(v[1]) + ',' + Math.round(v[2]) + ',' + (a == null ? 1 : a) + ')'; }
  var NM = B.MODES.length, N1 = NM - 1, DARK = [18, 18, 22];
  function stepV(i) { return B.STEPCOL[B.MODES[i]]; }
  /* the ring: the hue at every detent, blended between them (red mode: a dim-to-bright red ramp instead) */
  function ringV(t) {
    t = clamp(t, 0, 1); if (isRed()) return mixv(RED_DIM, RED_BRIGHT, t);
    var f = t * N1, i = Math.min(N1 - 1, Math.floor(f)); return mixv(stepV(i), stepV(i + 1), f - i);
  }
  function innerV(tOut, tIn) { var b = ringV(tOut); return mixv(mixv(b, DARK, .5), b, .45 + .55 * clamp(tIn, 0, 1)); }
  function inkV() { return isRed() ? [214, 70, 84] : UI; }

  /* ---------- layout ---------- */
  var BIG = 160, HUB = 44;
  var TAP_PX = 8, NOM = { x: -72, y: -120 }, LAY = { beyond: { x: NOM.x, y: NOM.y, z: 28 } };
  var ORDER = ['beyond'];
  var wrap, hub, cluster, D = {}, lvl = 0, holdS = { x: 0, v: 0, t: 0, w: 14 }, hubSw = null, noClickUntil = 0, openA = { x: 0, v: 0, t: 0, w: 14 }, raf = 0, last = 0, held = null, pushes = 0, ignorePop = 0;

  function modeT() { return B.MODES.indexOf(B.state.mode) / N1; }
  function sweepT() { var S = B.state; return S.mode === 'off' ? 0 : S[S.mode]; }

  function buildBig() {
    var d = { k: 'beyond', w: BIG, h: BIG, cx: 80, cy: 80, disp: { out: modeT(), inn: sweepT() }, ring: 'out', tgt: { out: modeT(), inn: sweepT() }, segs: [] };
    var s = el('svg', { viewBox: '0 0 ' + BIG + ' ' + BIG, width: BIG, height: BIG, 'class': 'bd-svg', tabindex: '0', role: 'slider', 'aria-label': 'Beyond selection', 'aria-valuemin': '0', 'aria-valuemax': String(N1) });
    s.appendChild(el('circle', { 'class': 'bd-hit', cx: 80, cy: 80, r: 72 }));
    var go = el('g', { 'class': 'ring-out' }), gl = el('g', { 'class': 'labs' }), gi = el('g', { 'class': 'ring-in' }), gc = el('g', { 'class': 'ctr' });
    var N = 72, i;
    for (i = 0; i < N; i++) { var seg = el('path', { 'class': 'bd-seg', d: arc(80, 80, 62, i / N, (i + 1) / N + .004) }); go.appendChild(seg); d.segs.push(seg); }
    d.act = el('path', { 'class': 'bd-act', d: '' }); go.appendChild(d.act);
    d.ticks = []; d.labsEl = [];
    B.MODES.forEach(function (m, i) {
      var t = i / N1, tk = P(go, 'bd-tick', line(80, 80, 56, 68, ang(t))); d.ticks.push(tk);
      var p = pt(80, 80, 76, ang(t)); var tx = el('text', { 'class': 'bd-lab', 'data-i': i, x: p[0].toFixed(1), y: (p[1] + 2.6).toFixed(1), 'text-anchor': 'middle' }, m); gl.appendChild(tx); d.labsEl.push(tx);
    });
    d.thOut = el('circle', { 'class': 'bd-th', r: '4.2' }); go.appendChild(d.thOut); d.pulse = { x: 0, v: 0, t: 0, w: 9.5 }; d.lastIdx = -1;
    P(gi, 'bd-trk', arc(80, 80, 44, 0, 1));
    for (i = 0; i <= 20; i++) { var t = i / 20; P(gi, 'bd-min' + (i % 5 ? '' : ' bd-maj'), line(80, 80, i % 5 ? 40 : 38, 46, ang(t))); }
    d.fill = el('path', { 'class': 'bd-fill', d: '' }); gi.appendChild(d.fill);
    d.thIn = el('circle', { 'class': 'bd-th', r: '3.6' }); gi.appendChild(d.thIn);
    d.c1 = el('text', { 'class': 'bd-c1', x: 80, y: 78, 'text-anchor': 'middle' }, '');
    d.c2 = el('text', { 'class': 'bd-c2', x: 80, y: 92, 'text-anchor': 'middle' }, '');
    gc.appendChild(d.c1); gc.appendChild(d.c2);
    s.appendChild(go); s.appendChild(gl); s.appendChild(gi); s.appendChild(gc);
    d.svg = s; d.gOut = go; d.gIn = gi; d.labs = gl; d.bodyR = 90;
    return d;
  }
  function mount() {
    if (wrap) return;
    wrap = doc.createElement('div'); wrap.id = 'bdial'; wrap.setAttribute('data-lvl', '0');
    hub = doc.createElement('button'); hub.type = 'button'; hub.className = 'bd-hub'; hub.setAttribute('aria-label', 'Beyond: selection and camera dials'); hub.setAttribute('aria-expanded', 'false');
    var hs = el('svg', { viewBox: '0 0 26 26', width: 26, height: 26, 'aria-hidden': 'true' });
    hs.appendChild(el('circle', { 'class': 'bd-hr', cx: 13, cy: 13, r: 12 }));
    hub._ticks = B.MODES.map(function (m, i) { var p = el('path', { 'class': 'bd-ht', d: line(13, 13, 9.6, 12, ang(i / N1)) }); hs.appendChild(p); return p; });
    hub._dot = el('circle', { 'class': 'bd-hd', r: '2.1' }); hs.appendChild(hub._dot);
    hub.appendChild(hs);
    cluster = doc.createElement('div'); cluster.className = 'bd-cluster';
    D.beyond = buildBig();
    ORDER.forEach(function (k) {
      var d = D[k], h = doc.createElement('div'); h.className = 'bd-dial'; h.setAttribute('data-k', k);
      h.style.width = d.w + 'px'; h.style.height = d.h + 'px'; h.style.left = (HUB / 2 + LAY[k].x - d.cx) + 'px'; h.style.top = (HUB / 2 + LAY[k].y - d.cy) + 'px';
      var mist = doc.createElement('i'); mist.className = 'bd-mist'; mist.setAttribute('aria-hidden', 'true');
      var body = doc.createElement('i'); body.className = 'bd-body'; body.setAttribute('aria-hidden', 'true');
      [mist, body].forEach(function (m, n) { var r = d.bodyR + (n ? 0 : 20); m.style.width = m.style.height = (2 * r) + 'px'; m.style.left = (d.cx - r) + 'px'; m.style.top = (d.cy - r) + 'px'; });
      h.appendChild(mist); h.appendChild(body); h.appendChild(d.svg); d.box = h; d.bodyEl = body; d.mistEl = mist; cluster.appendChild(h);
      bindDial(d);
    });
    wrap.appendChild(cluster); wrap.appendChild(hub);
    var host = doc.querySelector('.rm-ui');
    if (host) host.insertBefore(wrap, host.firstChild); else { wrap.className = 'bd-solo'; doc.body.appendChild(wrap); }
    hub.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (performance.now() < noClickUntil) return; cycle(); });
    /* a swipe down that starts on the hub goes through (the hub does not swallow it); a tap still opens the dial */
    hub.addEventListener('pointerdown', function (e) { if (e.button > 0) return; hubSw = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false }; try { hub.setPointerCapture(e.pointerId); } catch (x) {} });
    hub.addEventListener('pointermove', function (e) { if (hubSw && hubSw.id === e.pointerId && Math.hypot(e.clientX - hubSw.x, e.clientY - hubSw.y) > TAP_PX) hubSw.moved = true; });
    /* tap and swipe never both fire: under TAP_PX of movement it is a tap and toggles right here on pointerup (open when closed, close when open: it does not wait for a click);
       beyond it, a downward swipe goes to the page and anything else does nothing. Either way the click that follows is swallowed. A keyboard activation still arrives as a click. */
    hub.addEventListener('pointerup', function (e) {
      var sw = hubSw; if (!sw || sw.id !== e.pointerId) return; hubSw = null; noClickUntil = performance.now() + 450;
      if (!sw.moved) cycle(); else if (isSwipeDown(sw, e)) onSwipeDown();
    });
    hub.addEventListener('pointercancel', function () { hubSw = null; });
    doc.addEventListener('pointerdown', function (e) { if (lvl && !held && !wrap.contains(e.target)) { e.preventDefault(); e.stopPropagation(); closeOne(); } }, true);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lvl) { e.preventDefault(); e.stopImmediatePropagation(); closeOne(); } }, true);
    B.on(function () { paintAll(); kick(); });
    w.addEventListener('rmchange', function () { paintAll(); requestAnimationFrame(placeDial); });
    w.addEventListener('resize', function () { placeDial(); }); w.addEventListener('orientationchange', function () { setTimeout(placeDial, 250); });
    paintAll(); placeDial(); layout();
  }

  /* ---------- swipe down: the same rule as everywhere else in the archive (70px, mostly vertical) ---------- */
  function isSwipeDown(sw, e) { var dx = e.clientX - sw.x, dy = e.clientY - sw.y; return dy >= 70 && dy > 1.3 * Math.abs(dx) && performance.now() - sw.t < 1200; }
  function onSwipeDown() { if (lvl) closeOne(); else w.dispatchEvent(new CustomEvent('bd-swipe-down')); }   // an open dial closes first (one level at a time); otherwise the page handles it

  /* ---------- placement: the dial opens up and to the left of the hub, but is never clipped: it is kept inside the safe area (notch, Dynamic Island, gesture bar) ---------- */
  var probe = null;
  function safeInsets() {
    if (!probe) { probe = doc.createElement('div'); probe.setAttribute('aria-hidden', 'true'); probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)'; doc.body.appendChild(probe); }
    var c = getComputedStyle(probe); return { t: parseFloat(c.paddingTop) || 0, r: parseFloat(c.paddingRight) || 0, b: parseFloat(c.paddingBottom) || 0, l: parseFloat(c.paddingLeft) || 0 };
  }
  function placeDial() {
    var d = D.beyond; if (!d || !wrap) return;
    var r = wrap.getBoundingClientRect(); if (!r.width) return;
    var hx = r.left + r.width / 2, hy = r.top + r.height / 2, sa = safeInsets(), R = d.bodyR + 6, vw = innerWidth, vh = innerHeight;
    var lo = sa.l + R, hi = vw - sa.r - R, cx = hi < lo ? (lo + hi) / 2 : clamp(hx + NOM.x, lo, hi);
    var to = sa.t + R, bo = vh - sa.b - R, cy = bo < to ? (to + bo) / 2 : clamp(hy + NOM.y, to, bo);
    LAY.beyond.x = cx - hx; LAY.beyond.y = cy - hy;
    d.box.style.left = (HUB / 2 + LAY.beyond.x - d.cx) + 'px'; d.box.style.top = (HUB / 2 + LAY.beyond.y - d.cy) + 'px';
  }

  /* ---------- open / close ---------- */
  function setLvl(n) { if (n) placeDial(); lvl = n; openA.t = n ? 1 : 0; var c = B.cam(); if (c.instant) { openA.x = openA.t; openA.v = 0; } wrap.setAttribute('data-lvl', String(n)); hub.setAttribute('aria-expanded', n ? 'true' : 'false'); kick(); paintAll(); layout(); }
  function cycle() { if (lvl) closeOne(); else { history.pushState({ bd: 1 }, '', location.href); pushes = 1; setLvl(1); } }
  function closeOne() {
    if (!lvl) return;
    if (pushes > 0) { pushes = 0; ignorePop++; history.back(); }
    setLvl(0);
  }

  /* ---------- motion: the site spring ---------- */
  function stepSpring(s, dt, c) {
    if (c.instant) { s.x = s.t; s.v = 0; return; }
    s.w = c.w || 4.6; var k = Math.exp(-s.w * dt), e = s.x - s.t, cc = s.v + s.w * e; s.x = s.t + (e + cc * dt) * k; s.v = (s.v - s.w * cc * dt) * k;
  }
  function moving() {
    if (Math.abs(openA.x - openA.t) > .0015 || Math.abs(openA.v) > .01 || Math.abs(holdS.x - holdS.t) > .004 || Math.abs(holdS.v) > .02) return true;
    var k, d, r; for (k in D) { d = D[k]; for (r in d.disp) if (Math.abs(d.disp[r] - d.tgt[r]) > .0008) return true; }
    return false;
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function loop(now) {
    raf = 0; var dt = Math.min(.05, (now - last) / 1000); last = now; var c = B.cam();
    stepSpring(openA, dt, c); holdS.t = held ? 1 : 0; stepSpring(holdS, dt, c);
    var k, d, r;
    for (k in D) {
      d = D[k];
      for (r in d.disp) {
        if (d.drag && d.ring === r) { var kk = 1 - Math.exp(-dt * (d.rate || 14)); d.disp[r] += (d.tgt[r] - d.disp[r]) * kk; }
        else { var sp = d['_s' + r] || (d['_s' + r] = { x: d.disp[r], v: 0, t: d.tgt[r], w: 14 }); sp.x = d.disp[r]; sp.t = d.tgt[r]; stepSpring(sp, dt, c); d.disp[r] = sp.x; }
      }
    }
    paintAll(); layout();
    if (moving() || held) raf = requestAnimationFrame(loop);
  }
  /* the expand / contract is a dolly along Z out of the hub */
  function layout() {
    var i;
    for (i = 0; i < ORDER.length; i++) {
      var k = ORDER[i], d = D[k], e = clamp(openA.x, 0, 1);
      /* calm: the dial simply fades in and out where it sits (no flight out of the hub, no scale, no squeeze); held, ring and labels ease to .5 and the solid body to .8 so it stays visible */
      var hk = clamp(holdS.x, 0, 1);
      d.box.style.transform = 'perspective(240px) translate3d(0,0,' + LAY[k].z + 'px) rotateY(-12deg)';
      d.box.style.visibility = e > .012 ? '' : 'hidden'; d.box.style.opacity = e.toFixed(3);
      d.svg.style.opacity = (1 - .5 * hk).toFixed(3); d.bodyEl.style.opacity = d.mistEl.style.opacity = (1 - .2 * hk).toFixed(3);
    }
    cluster.classList.toggle('bd-vis', openA.x > .002);
  }

  /* ---------- painting ---------- */
  function setC(e, attr, v, a) { e.setAttribute(attr, rgb(v, a)); }
  function paintBig(d) {
    var S = B.state, tOut = clamp(d.disp.out, 0, 1), tIn = clamp(d.disp.inn, 0, 1);
    var po = pt(80, 80, 62, ang(tOut)), pi = pt(80, 80, 44, ang(tIn));
    d.thOut.setAttribute('cx', po[0].toFixed(2)); d.thOut.setAttribute('cy', po[1].toFixed(2));
    d.thIn.setAttribute('cx', pi[0].toFixed(2)); d.thIn.setAttribute('cy', pi[1].toFixed(2));
    var cOut = ringV(tOut), cIn = innerV(tOut, tIn), N = d.segs.length, i, mi0 = B.MODES.indexOf(S.mode);
    d.lastIdx = mi0;
    for (i = 0; i < N; i++) setC(d.segs[i], 'stroke', ringV((i + .5) / N), .5);                                      // the ring carries the real hue at each detent
    d.act.setAttribute('d', tOut > .004 ? arc(80, 80, 62, 0, tOut) : ''); setC(d.act, 'stroke', cOut, .95);          // active arc: the colour at the current position
    setC(d.thOut, 'fill', cOut); d.ticks.forEach(function (tk, n) { setC(tk, 'stroke', ringV(n / N1), .95); });
    d.fill.setAttribute('d', S.mode === 'off' ? '' : arc(80, 80, 44, 0, Math.max(.002, tIn))); setC(d.fill, 'stroke', cIn, .95);   // inner sweep shifts toward red
    setC(d.thIn, 'fill', cIn);
    var mi = B.MODES.indexOf(S.mode), n;
    for (n = 0; n < d.labsEl.length; n++) { d.labsEl[n].setAttribute('class', 'bd-lab' + (n === mi ? ' on' : '')); setC(d.labsEl[n], 'fill', n === mi ? cOut : ringV(n / N1), n === mi ? 1 : .6); }
    d.gIn.setAttribute('class', 'ring-in' + (S.mode === 'off' ? ' dead' : ''));
    var lb = B.label.split(' \u00b7 ');
    if (S.mode === 'off') { d.c1.textContent = 'beyond'; d.c2.textContent = 'off'; } else { d.c1.textContent = lb[0]; d.c2.textContent = lb[1] || ''; }
    setC(d.c1, 'fill', mixv(inkV(), cOut, .55)); setC(d.c2, 'fill', cOut);                                           // the label takes the colour too
    d.svg.setAttribute('aria-valuenow', String(mi)); d.svg.setAttribute('aria-valuetext', B.label);
  }
  function paintAll() {
    if (!wrap) return;
    var S = B.state;
    if (!dHeld('beyond', ['out'])) D.beyond.tgt.out = modeT();
    if (!dHeld('beyond', ['inn'])) D.beyond.tgt.inn = sweepT();
    paintBig(D.beyond);
    var mt = modeT(), hp = pt(13, 13, 12, ang(mt)); hub._dot.setAttribute('cx', hp[0].toFixed(2)); hub._dot.setAttribute('cy', hp[1].toFixed(2));
    var c = ringV(mt); setC(hub._dot, 'fill', c); hub._ticks.forEach(function (tk, n) { setC(tk, 'stroke', ringV(n / N1), .6); });
    wrap.setAttribute('data-mode', S.mode);
  }
  function dHeld(k, rings) { return held && held.k === k && rings.indexOf(held.ringKey) >= 0; }

  /* ---------- interaction ---------- */
  function bindDial(d) {
    var s = d.svg;
    s.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      e.preventDefault(); e.stopPropagation();
      var r = s.getBoundingClientRect(), sc = r.width / d.w, cx = r.left + d.cx * sc, cy = r.top + d.cy * sc, rad = Math.hypot(e.clientX - cx, e.clientY - cy) / sc;
      var ringKey = 'main', th = Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180 / Math.PI, onArc = Math.abs(th) <= A1 + 12;
      if (d.k === 'beyond') {
        if (rad >= 53 && onArc) ringKey = 'out';
        else if (rad >= 24 && rad < 53 && onArc && B.state.mode !== 'off') ringKey = 'inn';
        else {
          /* the centre, the gap at the bottom and the dead inner ring are not ring drags: a swipe down that starts here goes through, a tap on the centre steps off <-> the last mode */
          var sw = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false, centre: rad < 24 };
          try { s.setPointerCapture(e.pointerId); } catch (x) {}
          var mv = function (ev) { if (ev.pointerId === sw.id && Math.hypot(ev.clientX - sw.x, ev.clientY - sw.y) > 10) sw.moved = true; };
          var fin = function (ev) {
            if (ev.pointerId !== sw.id) return; s.removeEventListener('pointermove', mv); s.removeEventListener('pointerup', fin); s.removeEventListener('pointercancel', fin);
            if (ev.type === 'pointercancel') return;
            if (isSwipeDown(sw, ev)) onSwipeDown();
            else if (sw.centre && !sw.moved) { B.set({ mode: B.state.mode === 'off' ? (d.lastMode || 'red') : 'off' }); if (B.state.mode !== 'off') d.lastMode = B.state.mode; snapRing(d, 'out'); kick(); }
          };
          s.addEventListener('pointermove', mv); s.addEventListener('pointerup', fin); s.addEventListener('pointercancel', fin);
          return;
        }
      }
      held = { k: d.k, ringKey: ringKey, id: e.pointerId };
      d.ring = ringKey; d.drag = true; d.rate = e.pointerType === 'mouse' ? 14 : 22; d.cx0 = cx; d.cy0 = cy; d.sc = sc;
      try { s.setPointerCapture(e.pointerId); } catch (x) {}
      wrap.classList.add('bd-hold'); d.box.classList.add('bd-activ'); d.box.setAttribute('data-ring', ringKey);
      move(d, e); kick();
    });
    s.addEventListener('pointermove', function (e) { if (held && held.k === d.k && held.id === e.pointerId) move(d, e); });
    var up = function (e) { if (held && held.k === d.k && held.id === e.pointerId) release(d, e); };
    s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
    s.addEventListener('keydown', function (e) { key(d, e); });
  }
  function angleT(d, e) {
    var dx = e.clientX - d.cx0, dy = e.clientY - d.cy0, th = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (th > A1) th = th > (180 + A1) / 2 ? A0 : A1; else if (th < A0) th = th < -(180 + A1) / 2 ? A1 : A0;   // the gap at the bottom clamps to the nearer end
    return clamp((th - A0) / (A1 - A0), 0, 1);
  }
  function move(d, e) {
    var t = angleT(d, e), k = d.k, rk = held.ringKey; d.tgt[rk] = t;
    if (k === 'beyond') { if (rk === 'out') { var ni = Math.round(t * N1); d.tgt.out = lerp(t, ni / N1, .6); B.set({ mode: B.MODES[ni] }); } else sweep(d, t, false); }   // the thumb is pulled toward the nearest detent: a satisfying snap
    paintAll(); kick();
  }
  /* a sweep re-ranks the whole field, so it applies at most every 110 ms and only for a real change; the last value always lands on release */
  function sweep(d, t, force) {
    var now = performance.now(), m = B.state.mode; clearTimeout(d.swT);
    if (force || (now - (d.swAt || 0) > 110 && Math.abs(t - (d.swV == null ? -1 : d.swV)) > .02)) { d.swAt = now; d.swV = t; var o = {}; o[m] = t; B.set(o); return; }
    d.swT = setTimeout(function () { d.swAt = performance.now(); d.swV = t; var o = {}; o[m] = t; B.set(o); }, 120);
  }
  function snapRing(d, rk) { if (rk === 'out') d.tgt.out = modeT(); }
  function release(d, e) {
    var rk = held.ringKey; try { d.svg.releasePointerCapture(e.pointerId); } catch (x) {}
    d.drag = false; snapRing(d, rk);
    if (d.k === 'beyond' && rk === 'inn') { clearTimeout(d.swT); sweep(d, d.tgt.inn, true); }
    if (d.k === 'beyond' && B.state.mode !== 'off') d.lastMode = B.state.mode;
    held = null; wrap.classList.remove('bd-hold'); d.box.classList.remove('bd-activ'); d.box.removeAttribute('data-ring');
    paintAll(); kick();
  }
  function key(d, e) {
    var k = d.k, S = B.state, dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!dir) return; e.preventDefault(); e.stopPropagation();
    if (k === 'beyond') { if (e.shiftKey && S.mode !== 'off') { var o = {}; o[S.mode] = clamp(S[S.mode] + dir * .05, 0, 1); B.set(o); } else B.set({ mode: B.MODES[clamp(B.MODES.indexOf(S.mode) + dir, 0, N1)] }); }
    kick();
  }

  /* registered when the script runs, before archive.js adds its own popstate handler, so back closes the dial before it closes a lifted frame */
  w.addEventListener('popstate', function (e) {
    if (ignorePop > 0) { ignorePop--; e.stopImmediatePropagation(); return; }
    if (pushes > 0 && lvl > 0) { pushes--; setLvl(lvl - 1); e.stopImmediatePropagation(); }   // the back gesture closes one level
  });
  function boot() { if (!doc.body || !doc.querySelector('.rm-ui')) { doc.addEventListener('DOMContentLoaded', function () { setTimeout(mount, 0); }); return; } mount(); }
  w.GJ_BEYOND_DIAL = { get level() { return lvl; }, cycle: cycle, closeOne: closeOne, get el() { return wrap; } };
  boot();
})(window);
