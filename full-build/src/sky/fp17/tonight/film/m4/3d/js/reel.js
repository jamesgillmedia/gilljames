/* Photo reel (3d/): one photo at a time, real shape, flush edge to edge, sky in the leftover space.
 Swipe only (no auto-advance). Glide cubic-bezier(0.22,1,0.36,1): 450 ms, 300 ms after a flick, 250 ms ease-back, <=700 ms long jumps.
 Counter + series (+ title only where a real one exists) and a pro2-style frame rail fade together 2 s after things settle (600 ms).
 Tap 1 pauses + shows the title, tap 2 opens the photo's m4 page. Pinch in -> contact sheet. Loops. Same with Reduce Motion. DOM only (works without WebGL). */
window.GJ3_REEL = (function () {
  'use strict';
  var EASE = bez(0.22, 1, 0.36, 1), T_GLIDE = 450, T_FLICK = 300, T_BACK = 250, T_LONG = 700, UI_HOLD = 2000;
  var root, stage, ui, cntN, cntS, ttl, rail, stars, curStar, thumbs, ticks, grid, gridIn, closeB;
  var P = [], N = 0, fw = [], fh = [], pre = [], L = 1, W = 0, H = 0;
  var c = 0, cur = 0, anim = null, onClose = null, isOpen = false, paused = false, uiTimer = 0;
  var pool = new Map(), bigOK = new Set(), xs = [], seriesStart = [], RPAD = 18, GAPU = 2.2;
  var drag = null, pinch = null, scrub = null, pts = new Map(), wheelX = 0, wheelT = 0;
  function $(t, cls, par) { var e = document.createElement(t); if (cls) e.className = cls; if (par) par.appendChild(e); return e }
  /* cubic-bezier solver (x -> y) */
  function bez(x1, y1, x2, y2) {
    function cb(t, a, b) { return 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t }
    function dcb(t, a, b) { return 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t }
    return function (x) { if (x <= 0) return 0; if (x >= 1) return 1; var t = x;
      for (var i = 0; i < 8; i++) { var d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s }
      t = Math.max(0, Math.min(1, t)); return cb(t, y1, y2) };
  }
  function mod(a, n) { return ((a % n) + n) % n }
  /* ---- strip geometry: photo k (unbounded) has centre X(k); the screen centre sits at strip coordinate c ---- */
  function layout() {
    W = innerWidth; H = innerHeight; pre = []; var s = 0;
    for (var i = 0; i < N; i++) { var a = P[i].w / P[i].h, w = Math.min(W, H * a); fw[i] = w; fh[i] = w / a; pre[i] = s; s += w }
    L = s || 1; railLayout();
  }
  function X(k) { var q = Math.floor(k / N), r = k - q * N; return q * L + pre[r] + fw[r] / 2 }
  function fAt(cc) { /* fractional index: piecewise linear between photo centres */
    var q = Math.floor(cc / L), k = q * N, guess = cc - q * L, r = 0;
    while (r < N - 1 && pre[r] + fw[r] / 2 <= guess) r++;
    k = q * N + r; while (X(k) > cc) k--; while (X(k + 1) <= cc) k++;
    return k + (cc - X(k)) / (X(k + 1) - X(k));
  }
  function cAt(f) { var k = Math.floor(f); return X(k) + (f - k) * (X(k + 1) - X(k)) }
  /* ---- DOM ---- */
  function build() {
    root = $('div', 'rl'); root.id = 'reel'; root.hidden = true; root.setAttribute('aria-label', 'photo reel');
    stage = $('div', 'rl-stage', root);
    ui = $('div', 'rl-ui', root);
    closeB = $('button', 'rl-x', ui); closeB.setAttribute('aria-label', 'back to the sky'); closeB.textContent = '×';
    var cnt = $('div', 'rl-cnt', ui); cntN = $('b', '', cnt); cntS = $('span', 'rl-ser', cnt); ttl = $('span', 'rl-ttl', cnt);
    var bot = $('div', 'rl-bot', ui); thumbs = $('div', 'rl-thumbs', bot);
    rail = $('div', 'rl-rail', bot); rail.setAttribute('role', 'slider'); rail.setAttribute('aria-label', 'frames: tap to jump, drag to scrub'); rail.tabIndex = 0;
    $('i', 'rl-line', rail); ticks = $('div', 'rl-ticks', rail); stars = $('div', 'rl-stars', rail); curStar = $('i', 'rl-cur', rail);
    grid = $('div', 'rl-grid', root); grid.hidden = true; var gx = $('button', 'rl-gx', grid); gx.textContent = '×'; gx.setAttribute('aria-label', 'close contact sheet'); gridIn = $('div', 'rl-gin', grid);
    document.body.appendChild(root);
    closeB.addEventListener('click', function (e) { e.stopPropagation(); close() });
    gx.addEventListener('click', function (e) { e.stopPropagation(); gridClose() });
    stage.addEventListener('pointerdown', sDown); addEventListener('pointermove', sMove); addEventListener('pointerup', sUp); addEventListener('pointercancel', sUp);
    rail.addEventListener('pointerdown', rDown); thumbs.addEventListener('pointerdown', function (e) { e.stopPropagation(); poke() });
    thumbs.addEventListener('click', function (e) { var t = e.target.closest('[data-i]'); if (t) jump(+t.dataset.i) });
    root.addEventListener('pointerdown', poke, true);
    root.addEventListener('wheel', wheel, { passive: false });
    ['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(function (t) { stage.addEventListener(t, function (e) { e.preventDefault() }, { passive: false }); rail.addEventListener(t, function (e) { e.preventDefault() }, { passive: false }) });
    grid.addEventListener('touchstart', gTouch, { passive: true }); grid.addEventListener('touchmove', gTouch, { passive: true });
    gridIn.addEventListener('click', function (e) { var t = e.target.closest('[data-i]'); if (!t) return; var i = +t.dataset.i; setTo(cur + (i - mod(cur, N))); gridClose() });
    addEventListener('keydown', key); addEventListener('resize', function () { if (!isOpen) return; var f = fAt(c); layout(); c = cAt(f); render() });
  }
  function railLayout() {
    if (!rail) return; xs = []; seriesStart = []; var gaps = 0;
    for (var i = 0; i < N; i++) if (i && P[i].series !== P[i - 1].series) gaps++;
    var span = Math.max(1, N - 1 + gaps * GAPU), rw = W - 2 * RPAD, g = 0;
    for (i = 0; i < N; i++) { if (i && P[i].series !== P[i - 1].series) { g++; seriesStart.push(i) } else if (!i) seriesStart.push(0); xs[i] = RPAD + (i + g * GAPU) / span * rw }
    stars.innerHTML = ''; ticks.innerHTML = '';
    for (i = 0; i < N; i++) { var s = $('i', 'tk', stars); s.style.left = xs[i] + 'px'; s.dataset.i = i }
    seriesStart.forEach(function (i) {
      var lb = $('span', 'rl-sname', ticks); lb.textContent = P[i].series; lb.style.left = xs[i] + 'px';
      if (i) { var t = $('i', 'rl-tick', ticks); t.style.left = (xs[i - 1] + xs[i]) / 2 + 'px' }
    });
  }
  function railX(f) { var k = Math.floor(f), fr = f - k, a = mod(k, N), b = mod(k + 1, N); if (b === 0) return fr < .5 ? xs[a] : xs[0]; return xs[a] + fr * (xs[b] - xs[a]) }
  function railF(x) { /* rail x -> fractional index within 0..N-1 */
    if (x <= xs[0]) return 0; if (x >= xs[N - 1]) return N - 1;
    for (var i = 0; i < N - 1; i++) if (x < xs[i + 1]) return i + (x - xs[i]) / (xs[i + 1] - xs[i]);
    return N - 1;
  }
  /* ---- render ---- */
  function el(k) {
    var e = pool.get(k); if (e) return e; var i = mod(k, N), p = P[i];
    e = document.createElement('img'); e.className = 'rl-ph'; e.alt = p.title || ''; e.draggable = false; e.decoding = 'async';
    e.src = bigOK.has(i) ? p.big : p.thumb; e.dataset.i = i; stage.appendChild(e); pool.set(k, e); return e;
  }
  function wantBig(i) { if (bigOK.has(i)) return; var p = P[i], im = new Image(); im.onload = function () { bigOK.add(i); pool.forEach(function (e) { if (+e.dataset.i === i) e.src = p.big }) }; im.src = p.big; bigOK.add(-1 - i) }
  function render() {
    var f = fAt(c), k0 = Math.floor(f), near = Math.round(f), keep = new Set();
    for (var k = k0 - 2; k <= k0 + 3; k++) {
      var i = mod(k, N), e = el(k), dx = W / 2 + (X(k) - c) - fw[i] / 2;
      e.style.width = fw[i] + 'px'; e.style.height = fh[i] + 'px';
      e.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + ((H - fh[i]) / 2).toFixed(2) + 'px,0)';
      e.classList.toggle('nb', k !== near); keep.add(k);
      if (Math.abs(k - f) < 1.6 && !bigOK.has(i) && !bigOK.has(-1 - i)) wantBig(i);
    }
    pool.forEach(function (e, k) { if (!keep.has(k)) { e.remove(); pool.delete(k) } });
    var ni = mod(near, N), p = P[ni];
    cntN.textContent = (ni + 1) + ' / ' + N; cntS.textContent = p.series; ttl.textContent = p.title || ''; ttl.hidden = !p.title;
    var rx = railX(f); curStar.style.transform = 'translateX(' + rx.toFixed(2) + 'px)';
    var on = stars.querySelector('.tk.on'); if (!on || +on.dataset.i !== ni) { if (on) on.classList.remove('on'); var s = stars.children[ni]; if (s) s.classList.add('on') }
    renderThumbs(f, rx);
    root.dataset.i = ni;
  }
  var TW = 30, TH = 22, TG = 4, thumbPool = new Map();
  function renderThumbs(f, rx) {
    var near = Math.round(f), keep = new Set(), base = Math.max(TW * 5, Math.min(W - TW * 5, rx));
    for (var k = near - 5; k <= near + 5; k++) {
      var i = mod(k, N), t = thumbPool.get(k);
      if (!t) { t = $('img', 'th', thumbs); t.src = P[i].thumb; t.alt = ''; t.draggable = false; t.dataset.i = i; thumbPool.set(k, t) }
      t.style.transform = 'translateX(' + (base + (k - f) * (TW + TG) - TW / 2).toFixed(2) + 'px)';
      t.classList.toggle('on', k === near); t.style.opacity = Math.max(0, 1 - Math.abs(k - f) / 5.5).toFixed(3); keep.add(k);
    }
    thumbPool.forEach(function (t, k) { if (!keep.has(k)) { t.remove(); thumbPool.delete(k) } });
  }
  /* ---- motion ---- */
  function glideTo(target, dur) {
    stopAnim(); var c0 = c, t0 = performance.now(); root.classList.add('live');
    if (Math.abs(target - c0) < .5) { c = target; settle(); return }
    anim = { id: 0, target: target, dur: dur, c0: c0 };
    var step = function (now) { var u = Math.min(1, (now - t0) / dur); c = c0 + (target - c0) * EASE(u); render(); if (u < 1) anim.id = requestAnimationFrame(step); else { anim = null; settle() } };
    anim.id = requestAnimationFrame(step); log('glide', dur);
  }
  function stopAnim() { if (anim) { cancelAnimationFrame(anim.id); anim = null } }
  function settle() {
    var f = fAt(c); cur = Math.round(f); c = X(cur);
    if (cur < 0 || cur >= N) { var sh = Math.floor(cur / N); cur -= sh * N; c = X(cur); var pa = Array.from(pool), ta = Array.from(thumbPool); pool.clear(); thumbPool.clear(); pa.forEach(function (q) { pool.set(q[0] - sh * N, q[1]) }); ta.forEach(function (q) { thumbPool.set(q[0] - sh * N, q[1]) }) }
    render(); root.classList.remove('live'); holdUI(); log('settle', mod(cur, N));
  }
  function go(d, dur) { var base = anim ? Math.round(fAt(anim.target)) : cur; paused = false; root.classList.remove('paused'); glideTo(X(base + d), dur || T_GLIDE) }
  function jump(i) { var base = anim ? Math.round(fAt(anim.target)) : cur, k = base - mod(base, N) + i, n = Math.abs(k - base); paused = false; root.classList.remove('paused'); poke(); glideTo(X(k), n <= 1 ? T_GLIDE : Math.min(T_LONG, T_GLIDE + 40 * (n - 1))) }
  function setTo(k) { stopAnim(); c = X(k); settle() }
  /* ---- the fading layer ---- */
  function poke() { root.classList.add('ui'); clearTimeout(uiTimer); if (!drag && !scrub && !anim) holdUI() }
  function holdUI() { clearTimeout(uiTimer); root.classList.add('ui'); uiTimer = setTimeout(function () { if (!paused && !drag && !scrub && !anim) root.classList.remove('ui') }, UI_HOLD) }
  /* ---- stage gestures ---- */
  function sDown(e) {
    if (!isOpen) return; e.preventDefault();
    if (scrub) { cancelScrub(); return } /* a second finger anywhere cancels a rail scrub */
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { stage.setPointerCapture(e.pointerId) } catch (x) {}
    if (pts.size === 2) { /* second finger: drop the drag, start a pinch */
      if (drag && drag.moved) glideTo(X(drag.k), T_BACK); drag = null;
      var a = Array.from(pts.values()); pinch = { d0: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; return }
    if (pts.size > 2) return;
    var grabbed = !!anim; stopAnim(); var k = grabbed ? Math.round(fAt(c)) : cur;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, c0: c, k: k, t0: performance.now(), moved: 0, s: [[performance.now(), e.clientX]], grabbed: grabbed };
    root.classList.add('ui'); clearTimeout(uiTimer);
  }
  function sMove(e) {
    var p = pts.get(e.pointerId); if (p) { p.x = e.clientX; p.y = e.clientY }
    if (scrub && e.pointerId === scrub.id) return rMove(e);
    if (pinch && pts.size >= 2) { var a = Array.from(pts.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); if (pinch.d0 > 0 && d / pinch.d0 < .78) { pinch = null; gridOpen() } return }
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0; drag.moved = Math.max(drag.moved, Math.abs(dx), Math.abs(e.clientY - drag.y0));
    if (drag.moved < 4 && !drag.grabbed) return;
    if (!drag.live) { drag.live = true; root.classList.add('live'); paused = false; root.classList.remove('paused') }
    c = Math.max(X(drag.k - 1), Math.min(X(drag.k + 1), drag.c0 - dx)); /* 1:1 with the finger, at most one photo */
    drag.s.push([performance.now(), e.clientX]); if (drag.s.length > 8) drag.s.shift(); render();
  }
  function sUp(e) {
    if (scrub && e.pointerId === scrub.id) return rUp(e);
    pts.delete(e.pointerId); if (pinch) { if (pts.size < 2) pinch = null; return }
    if (!drag || e.pointerId !== drag.id) return; var d = drag; drag = null;
    var now = performance.now(), dx = e.clientX - d.x0;
    if (d.moved < 8 && now - d.t0 < 350) { if (d.grabbed) { glideTo(X(d.k), T_BACK); return } tap(e); return }
    var s = d.s.filter(function (q) { return now - q[0] < 90 }), v = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / Math.max(1, s[s.length - 1][0] - s[0][0]) : 0;
    var flick = Math.abs(v) > .45 && Math.abs(dx) > 14, far = Math.abs(dx) > W * .25, dir = flick ? (v < 0 ? 1 : -1) : (dx < 0 ? 1 : -1);
    if (flick || far) { glideTo(X(d.k + dir), flick ? T_FLICK : T_GLIDE); log('swipe', dir) } else { glideTo(X(d.k), T_BACK); log('back', 0) }
  }
  function tap(e) {
    var i = mod(cur, N), w = fw[i], h = fh[i], onPhoto = Math.abs(e.clientX - W / 2) <= w / 2 && Math.abs(e.clientY - H / 2) <= h / 2;
    if (!paused) { paused = true; root.classList.add('paused', 'ui'); clearTimeout(uiTimer); log('pause', i); return }
    if (onPhoto) { log('open', P[i].page); location.href = P[i].page; return }
    paused = false; root.classList.remove('paused'); holdUI();
  }
  /* ---- rail: tap to jump, drag to scrub (main photo follows), second finger cancels ---- */
  function rDown(e) {
    e.preventDefault(); e.stopPropagation(); poke(); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (scrub) { cancelScrub(); return } /* second finger cancels the scrub */
    try { rail.setPointerCapture(e.pointerId) } catch (x) {}
    stopAnim(); var base = cur - mod(cur, N);
    scrub = { id: e.pointerId, x0: e.clientX, k0: cur, base: base, moved: 0, t0: performance.now() }; rail.classList.add('drag'); clearTimeout(uiTimer);
  }
  function cancelScrub() { var back = scrub.k0; scrub = null; rail.classList.remove('drag'); glideTo(X(back), T_BACK); log('scrubcancel', mod(back, N)) }
  function rMove(e) {
    if (!scrub) return; scrub.moved = Math.max(scrub.moved, Math.abs(e.clientX - scrub.x0)); if (scrub.moved < 5) return;
    paused = false; root.classList.remove('paused'); root.classList.add('live');
    var r = rail.getBoundingClientRect(); c = cAt(scrub.base + railF(e.clientX - r.left)); render();
  }
  function rUp(e) {
    pts.delete(e.pointerId); if (!scrub) return; var s = scrub; scrub = null; rail.classList.remove('drag');
    var r = rail.getBoundingClientRect(), f = railF(e.clientX - r.left);
    if (s.moved < 5) { jump(Math.round(f)); return }
    glideTo(X(Math.round(fAt(c))), T_BACK); log('scrub', Math.round(f));
  }
  /* ---- desktop ---- */
  function wheel(e) {
    if (!isOpen) return; if (e.target.closest('.rl-grid')) { if (e.ctrlKey && e.deltaY < -2) { e.preventDefault(); gridClose() } return }
    e.preventDefault(); poke();
    if (e.ctrlKey) { if (e.deltaY > 2) gridOpen(); return }
    var now = performance.now(); if (now - wheelT > 220) wheelX = 0; wheelT = now; wheelX += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
    if (Math.abs(wheelX) > 60) { go(wheelX > 0 ? 1 : -1); wheelX = -1e4 * Math.sign(wheelX) }
  }
  function key(e) {
    if (!isOpen) return; poke();
    if (!grid.hidden) { if (e.key === 'Escape' || e.key === 'g') gridClose(); return }
    if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Escape') close(); else if (e.key === 'g') gridOpen();
    else if (e.key === 'Enter') { location.href = P[mod(cur, N)].page }
  }
  /* ---- contact sheet ---- */
  function gridBuild() {
    gridIn.innerHTML = ''; var prev = null;
    P.forEach(function (p, i) {
      if (p.series !== prev) { var h = $('h3', 'rl-gh', gridIn); h.textContent = p.series; prev = p.series }
      var b = $('button', 'rl-cell', gridIn); b.dataset.i = i; b.setAttribute('aria-label', (i + 1) + ' / ' + N + (p.title ? ' · ' + p.title : ''));
      var im = $('img', '', b); im.src = p.thumb; im.alt = ''; im.loading = 'lazy'; im.draggable = false;
    });
  }
  function gridOpen() { if (!grid.hidden) return; stopAnim(); if (drag) drag = null; c = X(cur); render(); grid.hidden = false; var ni = mod(cur, N);
    Array.prototype.forEach.call(gridIn.querySelectorAll('.rl-cell'), function (b) { b.classList.toggle('on', +b.dataset.i === ni) });
    var on = gridIn.querySelector('.rl-cell.on'); if (on) on.scrollIntoView({ block: 'center' }); root.classList.add('gridon'); log('grid', 1) }
  function gridClose() { if (grid.hidden) return; grid.hidden = true; root.classList.remove('gridon'); holdUI(); log('grid', 0) }
  var g0 = 0; function gTouch(e) { if (e.touches.length !== 2) { g0 = 0; return } var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (e.type === 'touchstart' || !g0) { g0 = d; return } if (d / g0 > 1.3) { g0 = 0; gridClose() } }
  /* ---- open / close ---- */
  var LOG = []; function log(k, v) { LOG.push([Math.round(performance.now()), k, v]); if (LOG.length > 200) LOG.shift() }
  function open(opts) {
    if (!root) build();
    if (opts.photos && opts.photos !== P) { P = opts.photos; N = P.length; pool.forEach(function (e) { e.remove() }); pool.clear(); thumbPool.forEach(function (t) { t.remove() }); thumbPool.clear(); bigOK.clear(); layout(); gridBuild() }
    onClose = opts.onClose || null; cur = Math.max(0, Math.min(N - 1, opts.start || 0)); c = X(cur); isOpen = true; paused = false;
    root.hidden = false; root.classList.remove('paused'); render(); holdUI(); log('open', cur);
  }
  function close() { if (!isOpen) return; isOpen = false; stopAnim(); gridClose(); root.hidden = true; log('close', 0); if (onClose) onClose() }
  return { open: open, close: close, get isOpen() { return isOpen },
    st: function () { return { open: isOpen, i: N ? mod(cur, N) : 0, n: N, c: c, f: N ? fAt(c) : 0, anim: !!anim, ui: root && root.classList.contains('ui'), paused: paused, grid: grid && !grid.hidden, series: N ? P[mod(cur, N)].series : '', railX: curStar && curStar.style.transform } },
    log: LOG, _go: go, _jump: jump };
})();
