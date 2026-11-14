/* Objects · stills gallery takes on variant B (preview only, dev switch G1 / G2 / G3).
   G1 lit case      B's case on a shelf, the rail of cut-out objects standing on the shelf. A light picker: warm key, soft top, gallery spot, window.
   G2 light table   the stills laid out like a contact sheet on a lightbox, cups from above lying on the table. Four light presets.
   G3 shop wall     the stills hung on a wall under three adjustable spots; under every piece an empty shop slot (no invented prices or titles).

   The rail (all three takes) is the horizontal track of Gill's cut-out objects: joio cups from above and paddles, each cut from one of his own photographs
   (media/cut/cuts.js says which). Tap an object and the photograph it was cut from opens beside it in the rail, with "cut from" and the room it belongs to;
   tap the photograph's piece in the gallery and its object is revealed. The rail is a native scroller: touch swipe with iOS momentum, trackpad, and the
   vertical mouse wheel mapped to horizontal; it never traps the page (at either end the wheel goes on to the page) and has no scrollbar.

   Light is only ever the room and the case: the wall, the table, the frame, the shelf and the cast shadows. It is drawn behind the photographs;
   nothing is laid over a photograph, no filter, no blend mode, no tint. The cups are cutouts (alpha only, _build/cutout_joio.py); their pixels are the photographs' own.
   Everything here is dark-room material: if the colour mode (Red) is ever loaded into this room its twin rules cover the chrome; photographs stay true colour.
   Motion is the same with Reduce Motion on: nothing here reads prefers-reduced-motion.

   Host contract (js/front.js): OBJ_GAL.plan(V, host) -> boxes for G2 / G3; OBJ_GAL.chrome(V, host) after every layout; OBJ_GAL.off() when another variant is chosen. */
(function () {
  'use strict';
  var OBJS = window.OBJ_CUTS || [], CUT = {}, BYK = {};
  OBJS.forEach(function (o) { CUT[o.k] = [o.w, o.h]; BYK[o.k] = o });
  /* the rail alternates cups and paddles; anything not listed follows in file order */
  var ORDER = ['top', 'pd-product', 'cream', 'ash', 'pd-wall-a', 'clay', 'stone', 'pd-brown', 'ash2', 'pd-wall-b'];
  OBJS = ORDER.map(function (k) { return BYK[k] }).filter(Boolean).concat(OBJS.filter(function (o) { return ORDER.indexOf(o.k) < 0 }));
  var RING = {};
  (window.OBJ_C && OBJ_C.rings || []).forEach(function (g) { RING[g.id] = g.title });
  var sel = null, railLeft = 0, lastCur = -1;
  var gal = null, fg = null, ui = {}, curV = null, savedPl = null, fdownHTML = null, hostRef = null, scrollBound = false;

  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
  function qs(k) { var m = location.search.match(new RegExp('[?&]' + k + '=([^&#]*)')); return m ? decodeURIComponent(m[1]) : null }
  function rd(k) { try { return localStorage.getItem(k) } catch (e) { return null } }
  function wr(k, v) { try { localStorage.setItem(k, v) } catch (e) { } }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n }

  /* a real cup: the cutout photograph, always upright, in a wrapper that carries only the shadow (the image itself is untouched) */
  function cup(k, w, seed, tag, cls) {
    var d = CUT[k], h = w * d[1] / d[0];
    var n = el(tag || 'span', 'cup' + (cls ? ' ' + cls : ''));
    n.style.width = w.toFixed(1) + 'px'; n.style.height = h.toFixed(1) + 'px';
        n.innerHTML = '<img alt="" decoding="async" draggable="false" src="media/cut/' + k + '.webp">';
    n.dataset.k = k; return n;
  }
  function place(n, cx, cy) { n.style.left = (cx - parseFloat(n.style.width) / 2).toFixed(1) + 'px'; n.style.top = (cy - parseFloat(n.style.height) / 2).toFixed(1) + 'px'; return n }

  /* ---------------- lighting state, kept on this device; ?l=key,spot (G1) · ?l=warm (G2) · ?l=s1,s3 (G3) · ?lv=60 sets a level / spread ---------------- */
  var DEF = { G1: { key: 1, top: 0, spot: 1, win: 0, lv: 100 }, G2: { p: 'day' }, G3: { s1: 1, s2: 1, s3: 1, spr: 50 } };
  var ST = {};
  function loadState(V) {
    var s = JSON.parse(JSON.stringify(DEF[V])), raw = rd('gj.objgal.' + V);
    if (raw) { try { var o = JSON.parse(raw); for (var k in s) if (o[k] != null) s[k] = o[k] } catch (e) { } }
    var l = qs('l'), lv = qs('lv');
    if (l != null) {
      var toks = l.split(',').filter(Boolean);
      if (V === 'G1') ['key', 'top', 'spot', 'win'].forEach(function (k) { s[k] = toks.indexOf(k) >= 0 ? 1 : 0 });
      if (V === 'G2') { var p = toks[0]; if (['day', 'warm', 'dim', 'off'].indexOf(p) >= 0) s.p = p }
      if (V === 'G3') ['s1', 's2', 's3'].forEach(function (k) { s[k] = toks.indexOf(k) >= 0 ? 1 : 0 });
    }
    if (lv != null && isFinite(+lv)) { if (V === 'G1') s.lv = +lv; if (V === 'G3') s.spr = +lv }
    return s;
  }
  function save(V) { wr('gj.objgal.' + V, JSON.stringify(ST[V])) }

  function applyLight(V, host) {
    var f = host.front, s = ST[V];
    if (V === 'G1') {
      var m = s.lv / 100;
      f.style.setProperty('--k', s.key ? m : 0); f.style.setProperty('--t', s.top ? m : 0);
      f.style.setProperty('--s', s.spot ? m : 0); f.style.setProperty('--w', s.win ? m : 0);
      f.style.setProperty('--lit', Math.max(s.key ? m : 0, s.top ? m : 0, s.spot ? m : 0, s.win ? m : 0));
    } else if (V === 'G2') {
      f.setAttribute('data-p', s.p);
    } else if (V === 'G3') {
      ['s1', 's2', 's3'].forEach(function (k) { f.style.setProperty('--' + k, s[k] ? 1 : 0) });
      f.style.setProperty('--spr', (s.spr / 100).toFixed(2));
    }
  }

  /* ---------------- safelight: the photo lab's red darkroom light, ported for the gallery takes ----------------
     Ported from gill-sky branch contact-sheet, photo-lab (tip c3c5dbb5, the lamp version 6224d11b): a soft red vignette on the stage, the room and the page grounds,
     a small emissive lamp in the bottom-right corner that switches on with it (core first, then the bloom, a slow breath), and the chrome's lines going darkroom red.
     It is the room's light, not Red mode and not a grade: it sits behind every photograph and every cutout (stage wall, page ground, behind the 3D canvas), nothing is laid over
     media, and no filter, blend mode or opacity is put on a photograph or an object. One toggle, remembered on this device (gj-objects-safelight), also ?safelight=1|0.
     It exists only while a gallery take is showing; A, B and C never get it. */
  var SAFE_KEY = 'gj-objects-safelight', safeOn = false, safeInit = false, lampEl = null, bloomEl = null, lampBtns = [];
  function loadSafe() {
    if (safeInit) return; safeInit = true; var q = qs('safelight');
    safeOn = q != null ? q === '1' : rd(SAFE_KEY) === '1';
  }
  function paintSafe() {
    var on = safeOn && !!curV; document.body.classList.toggle('safe', on);
    lampBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(safeOn)); b.classList.toggle('on', safeOn) });
    Object.keys(ui).forEach(function (k) { ui[k].refresh() });
  }
  function setSafe(on, announce) {
    safeOn = !!on; wr(SAFE_KEY, safeOn ? '1' : '0'); paintSafe();
    if (announce) { var h = document.getElementById('hint'); if (h) { h.textContent = safeOn ? 'safelight on \u2014 the room, not the photograph' : 'safelight off'; h.classList.remove('gone'); clearTimeout(setSafe.t); setSafe.t = setTimeout(function () { h.classList.add('gone') }, 2800) } }
  }
  function ensureLamp() {
    if (lampEl) return;
    lampEl = el('i', 'g-lamp'); lampEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(lampEl);
    bloomEl = el('i', 'g-lamp-bloom g-fixed'); bloomEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(bloomEl);
  }

  /* the light picker is the room's own AMBX plate (glass pill, LED switches, thin sliders), one per take, bottom left */
  function makePicker(V, host) {
    if (ui[V] || !window.AMBX) return;
    var s = ST[V], C;
    function sw(k, label, aria) { return { type: 'sw', k: k, label: label, aria: aria, get: function () { return !!s[k] }, toggle: function () { s[k] = s[k] ? 0 : 1; save(V); applyLight(V, host) } } }
    function pre(k, label) { return { type: 'sw', k: k, label: label, aria: 'light the table: ' + label, get: function () { return s.p === k }, toggle: function () { s.p = k; save(V); applyLight(V, host) } } }
    var defs = {
      G1: { title: 'light', aria: 'gallery light: warm key, soft top light, gallery spot, window', sliders: [
        sw('key', 'warm key', 'warm key light from the upper left'), sw('top', 'soft top', 'soft light from above'), sw('spot', 'spot', 'dim gallery spot on the case'), sw('win', 'window', 'off-camera window light'),
        { k: 'lv', label: 'level', min: 0, max: 100, def: 100, aria: 'how strong the room light is', read: function () { return s.lv }, write: function (v) { s.lv = v; save(V) }, apply: function (v) { s.lv = v; applyLight(V, host) } }] },
      G2: { title: 'table', aria: 'light table: day, warm, dim or off', sliders: [pre('day', 'day'), pre('warm', 'warm'), pre('dim', 'dim'), pre('off', 'off')] },
      G3: { title: 'spots', aria: 'wall spots: three spots and how wide they open', sliders: [
        sw('s1', 'left', 'left spot'), sw('s2', 'middle', 'middle spot'), sw('s3', 'right', 'right spot'),
        { k: 'spr', label: 'spread', min: 0, max: 100, def: 50, aria: 'how wide the spots open', read: function () { return s.spr }, write: function (v) { s.spr = v; save(V) }, apply: function (v) { s.spr = v; applyLight(V, host) } }] }
    }[V];
    defs.sliders = defs.sliders.concat([{ type: 'sec', label: 'darkroom' }, { type: 'sw', k: 'safe', label: 'safelight', aria: 'safelight: the photo lab\'s red darkroom light, with its lamp', get: function () { return safeOn }, toggle: function () { setSafe(!safeOn, true) } }]);
    C = AMBX.create({ room: 'objects-gal-' + V.toLowerCase(), title: defs.title, cls: 'sk-glass obj-light', aria: defs.aria, sliders: defs.sliders, where: function () { return V === 'G1' ? 'light on the room and the case' : V === 'G2' ? 'light on the table' : 'light on the wall' },
      onReset: function () { var d = DEF[V]; for (var k in d) s[k] = d[k]; save(V); applyLight(V, host); C.refresh() } });
    ui[V] = C; C.el.classList.add('g-ui'); C.el.hidden = true;
    var lb = el('button', 'g-lampbtn'); lb.type = 'button'; lb.setAttribute('aria-label', 'safelight'); lb.title = 'safelight'; lb.innerHTML = '<i aria-hidden="true"></i>';
    lb.setAttribute('aria-pressed', String(safeOn)); lb.classList.toggle('on', safeOn);
    lb.addEventListener('click', function (e) { e.stopPropagation(); setSafe(!safeOn, true) });
    C.el.insertBefore(lb, C.el.querySelector('.ambx-p')); lampBtns.push(lb);
  }
  function syncUI(V, host) {
    var atFront = host.board.classList.contains('on') && host.board.scrollTop <= 40;
    Object.keys(ui).forEach(function (k) { ui[k].el.hidden = k !== V || !atFront; if ((k !== V || !atFront) && ui[k].isOpen()) ui[k].open(false) });
    if (ui[V]) ui[V].refresh();
    if (stopBtn) stopBtn.hidden = !/^G/.test(V || '') || (host.board.classList.contains('on') && host.board.scrollTop > 40);
    if (railEl) railEl.style.pointerEvents = atFront ? '' : 'none';
  }

  /* ---------------- tap to stop / tap to play (gallery only) ----------------
     One quiet hint-style pill, top centre, on touch screens and narrow windows. It stops whatever moves in the gallery stage: CSS animations are paused (and resume where they were), transitions snap to their end
     and are held off, scripted animations are paused, any video or audio inside the stage is paused, and OBJ_GAL.stopped is
     true so anything that auto-advances can honour it (onStop(fn) is called on every change). Tap again resumes. It lives only in G1 / G2 / G3. */
  var stopped = false, stopBtn = null, frozen = [], mediaPaused = [], stopFns = [];
  function paintStop() {
    if (!stopBtn) return;
    stopBtn.textContent = stopped ? 'tap to play' : 'tap to stop'; stopBtn.setAttribute('aria-pressed', String(stopped));
    stopBtn.setAttribute('aria-label', stopped ? 'the gallery is stopped: tap to play' : 'tap to stop everything moving in the gallery');
  }
  function setStopped(on, host) {
    on = !!on; if (on === stopped || !host) return; stopped = on; var f = host.front;
    if (on) {
      try { f.getAnimations({ subtree: true }).forEach(function (a) { var css = (window.CSSAnimation && a instanceof CSSAnimation) || (window.CSSTransition && a instanceof CSSTransition); if (!css && a.playState === 'running') { a.pause(); frozen.push(a) } }) } catch (e) { }
      [].forEach.call(f.querySelectorAll('video,audio'), function (m) { if (!m.paused) { m.pause(); mediaPaused.push(m) } });
      f.classList.add('g-stopped');
    } else {
      f.classList.remove('g-stopped');
      frozen.forEach(function (a) { try { a.play() } catch (e) { } }); frozen = [];
      mediaPaused.forEach(function (m) { try { var pr = m.play(); if (pr && pr.catch) pr.catch(function () { }) } catch (e) { } }); mediaPaused = [];
    }
    if (on && railEl) { try { railEl.scrollTo({ left: railEl.scrollLeft, behavior: 'auto' }) } catch (e) { } }
    document.body.classList.toggle('g-held', on);
    paintStop(); stopFns.forEach(function (fn) { try { fn(stopped) } catch (e) { } });
  }
  function ensureStop(host) {
    if (stopBtn) return;
    stopBtn = el('button', 'g-stop'); stopBtn.type = 'button'; stopBtn.hidden = true; paintStop();
    stopBtn.addEventListener('click', function (e) { e.stopPropagation(); setStopped(!stopped, hostRef || host) });
    ['pointerdown', 'pointerup', 'touchstart', 'wheel'].forEach(function (t) { stopBtn.addEventListener(t, function (e) { e.stopPropagation() }, { passive: true }) });
    document.body.appendChild(stopBtn);
  }
  /* the header's follow link (joio on Instagram). Only drawn while a gallery take is showing. */
  function ensureFollow() {
    var hd = document.getElementById('ohd'); if (!hd) return null;
    if (!hd.querySelector('.ofollow')) {
      var a = el('a', 'ofollow', 'follow'); a.href = 'https://www.instagram.com/co.joio/'; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', 'follow joio on Instagram (opens in a new tab)');
      var cnt = hd.querySelector('.ocount'); hd.insertBefore(a, cnt || null);
    }
    return hd;
  }

  /* ---------------- plans: where every still goes ----------------
     Gill's layout rule: photos never overlap, never touch each other (GUTTER apart, always) and never touch or clip into the screen edges
     (EDGE from the viewport and from the safe-area insets). Everything below is laid out from those two numbers. */
  var GUTTER = 12, EDGE = 12;
  function railH(H) { return H < 500 ? 60 : 96 }
  function safe() {
    var q = qs('safe');
    if (q) { var a = q.split(',').map(Number); if (a.length === 4 && a.every(isFinite)) return { t: a[0], r: a[1], b: a[2], l: a[3] } }
    var p = el('div'); p.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(p); var c = getComputedStyle(p), r = { t: parseFloat(c.paddingTop) || 0, r: parseFloat(c.paddingRight) || 0, b: parseFloat(c.paddingBottom) || 0, l: parseFloat(c.paddingLeft) || 0 }; p.remove(); return r;
  }
  function plan(V, host) {
    var W = host.W, H = host.H, land = host.land, n = host.els.length, out = [], i, sf = safe(), short = H < 500;
    var L = sf.l + EDGE, R = W - sf.r - EDGE, TOPR = (short ? 80 : 92) + sf.t, BOTR = (short ? 50 : 58) + sf.b, RH = railH(H), BOTRR = BOTR + RH + GUTTER;
    host._safe = sf; host._rail = { l: L, r: R, top: H - BOTR - RH, h: RH };
    if (V === 'G1') {
      var cur = host.cur, pad = land ? 16 : 12, zone = 50;
      var fh = Math.min(land ? .62 * H : .46 * H, H - TOPR - pad - zone - BOTRR - 6);
      var fw = Math.min(fh * .8, (R - L) * (land ? .5 : .52)); fh = fw / .8;
      var extra = Math.max(0, H - TOPR - pad - zone - BOTRR - 6 - fh);
      var ct = TOPR + pad + extra * .35, cx = (L + R) / 2, cy = ct + fh / 2;
      host._g1 = { cx: cx, ct: ct, fh: fh, fw: fw, pad: pad };
      for (i = 0; i < n; i++) out.push({ x: cx, y: cy, w: fw, h: fh, z: 0, lab: 0, show: false });
      out[cur] = { x: cx, y: cy, w: fw, h: fh, z: 20, lab: 1, show: true };
      [1, -1].forEach(function (sd) {
        var edge = cx + sd * (fw / 2 + pad + GUTTER);
        for (var k = 1; ; k++) {
          var idx = cur + sd * k; if (idx < 0 || idx >= n) break;
          var hh = fh * .46 * Math.pow(.8, k), ww = hh * .8, room = sd > 0 ? R - edge : edge - L;
          if (room < 36) break; if (ww > room) { ww = room; hh = ww / .8 }
          out[idx] = { x: edge + sd * ww / 2, y: cy - k * 4, w: ww, h: hh, z: 19 - k, lab: 0, show: true };
          edge += sd * (ww + GUTTER);
        }
      });
      return out;
    }
    if (V === 'G2') {
      var cols = land ? 5 : 3, rows = land ? 2 : 3, pxl = Math.max(12, sf.l + EDGE), pxr = Math.max(12, sf.r + EDGE), pd = land ? (short ? 12 : 26) : 14, hd = short ? 18 : 24, lab = 18, gap = GUTTER;
      var pw = W - pxl - pxr, ph = H - TOPR - BOTRR, aw = pw - 2 * pd, ah = ph - 2 * pd - hd;
      var ih = (ah - rows * lab - (rows - 1) * gap) / rows, iw = Math.min((aw - (cols - 1) * gap) / cols, ih * .8); ih = iw / .8;
      var gx = Math.min((aw - cols * iw) / Math.max(1, cols - 1), iw * .55), gy = Math.min((ah - rows * (ih + lab)) / Math.max(1, rows - 1), 26);
      var tw = cols * iw + (cols - 1) * gx, th = rows * (ih + lab) + (rows - 1) * gy;
      var x0 = pxl + pw / 2 - tw / 2, y0 = TOPR + pd + hd + Math.max(0, (ah - th) / 2);
      host._g2 = { panel: { x: pxl, y: TOPR, w: pw, h: ph }, cols: cols, rows: rows, iw: iw, ih: ih, gx: gx, gy: gy, lab: lab, x0: x0, y0: y0, pad: pd, hd: hd };
      for (i = 0; i < n; i++) {
        var c = i % cols, r = Math.floor(i / cols);
        out.push({ x: x0 + c * (iw + gx) + iw / 2, y: y0 + r * (ih + lab + gy) + ih / 2, w: iw, h: ih, z: 10, lab: 1, show: true });
      }
      return out;
    }
    /* G3: salon hang in rows. Each row's cells share one width; a piece is a little smaller than its cell by a fixed, varied share,
       so the hang is not a grid but nothing ever touches. Under every piece: a thread and the shop slot (34px). */
    var rowsCfg = land ? [4, 4] : [3, 2, 3], tp = (land ? TOPR + (short ? 14 : 0) : 108 + sf.t), wy = tp + 12, wh = H - wy - BOTRR, SLOT = 34;
    var maxc = Math.max.apply(null, rowsCfg), cw = (R - L - (maxc - 1) * GUTTER) / maxc, rh = wh / rowsCfg.length;
    var share = [1, .9, .96, .86, .93, 1, .88, .95], idx = 0;
    rowsCfg.forEach(function (cnt, r) {
      var hmax = rh - SLOT - GUTTER, rowW = cnt * cw + (cnt - 1) * GUTTER, rx = (L + R) / 2 - rowW / 2;
      for (var c = 0; c < cnt; c++, idx++) {
        var w = Math.min(cw * share[idx % share.length], hmax * .8 * share[(idx + 3) % share.length]), h = w / .8, slack = rh - (h + SLOT);
        var jit = (hash(idx + 20) - .5) * 2 * Math.max(0, slack / 2 - GUTTER / 2) * .7;
        out.push({ x: rx + c * (cw + GUTTER) + cw / 2, y: wy + r * rh + slack / 2 + jit + h / 2, w: w, h: h, z: 10, lab: 0, show: true });
      }
    });
    host._g3 = { top: tp, bottom: wy + wh };
    return out;
  }

  /* ---------------- chrome: the room, the case, the cups, the slots ---------------- */
  function ensure(host) {
    if (gal) return;
    gal = el('div', 'gal'); gal.setAttribute('aria-hidden', 'true'); host.front.insertBefore(gal, host.fx);
    fg = el('div', 'gal-fg'); host.front.insertBefore(fg, host.fx.nextSibling);
    ['pointerdown', 'pointermove', 'pointerup'].forEach(function (t) { fg.addEventListener(t, function (e) { e.stopPropagation() }) });
    /* a photograph that has an object cut from it: the first tap reveals the object in the rail, the next tap opens the piece as before (G1 does this with its case) */
    host.fx.addEventListener('click', function (e) {
      if (curV !== 'G2' && curV !== 'G3') return;
      var b = e.target.closest('.pc'); if (!b) return;
      var i = host.els.findIndex(function (x) { return x.el === b }), o = i >= 0 ? pairOfPiece(host, i) : null;
      if (o && sel !== o.k) { e.preventDefault(); e.stopImmediatePropagation(); selectPair(host, o.k, true) }
    }, true);
  }
  function setLabels(host, mode) {
    host.els.forEach(function (e, i) {
      var pl = e.el.querySelector('.pl'); if (!pl) return;
      if (!pl.dataset.t) pl.dataset.t = pl.textContent;
      pl.textContent = mode === 'num' ? ('0' + (i + 1)).slice(-2) : pl.dataset.t;
    });
  }
  function joio(host, i) { return host.P[i].b.meta === 'joio.co' }

  function chrome(V, host) {
    ensure(host); hostRef = host; loadSafe(); ensureLamp(); ensureStop(host); var hdr = ensureFollow(); if (hdr) hdr.setAttribute('data-g', '1');
    var entering = curV !== V;
    if (entering) { curV = V; if (!ST[V]) ST[V] = loadState(V); makePicker(V, host) }
    paintSafe();
    gal.innerHTML = ''; fg.innerHTML = '';
    if (V === 'G1' && host.cur !== lastCur) { lastCur = host.cur; var po = pairOfPiece(host, lastCur); if (po) sel = po.k; else if (sel && pieceOfPair(host, BYK[sel]) >= 0) sel = null }
    if (!chrome.seeded) { chrome.seeded = true; var q = qs('pair'); if (q && BYK[q]) sel = q }
    var W = host.W, H = host.H, land = host.land, els = host.els;
    gal.className = 'gal ' + V.toLowerCase(); fg.className = 'gal-fg ' + V.toLowerCase();
    host.front.style.setProperty('--g-sb', (host._safe ? host._safe.b : 0) + 'px'); host.front.style.setProperty('--g-sr', (host._safe ? host._safe.r : 0) + 'px'); document.documentElement.style.setProperty('--g-st', (host._safe ? host._safe.t : 0) + 'px');
    setLabels(host, V === 'G2' ? 'num' : 'title');
    gal.appendChild(el('div', 'g-wall')); gal.appendChild(el('i', 'g-lamp-bloom'));
    if (V === 'G1') chromeG1(host, W, H, land, els);
    else if (V === 'G2') chromeG2(host, W, H, land, els);
    else chromeG3(host, W, H, land, els);
    buildRail(host); syncPairs(host);
    if (entering) {
      ['--k', '--t', '--s', '--w', '--lit', '--s1', '--s2', '--s3'].forEach(function (p) { host.front.style.setProperty(p, 0) });
      host.front.classList.remove('g-enter'); if (!stopped) { void host.front.offsetWidth; host.front.classList.add('g-enter') }
      setTimeout(function () { host.front.classList.remove('g-enter') }, 1300);
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (curV === V) applyLight(V, host) }) });
    } else applyLight(V, host);
    syncUI(V, host);
    if (!scrollBound) { scrollBound = true; host.board.addEventListener('scroll', function () { if (curV && hostRef) syncUI(curV, hostRef) }, { passive: true }); new MutationObserver(function () { if (curV && hostRef) syncUI(curV, hostRef) }).observe(host.board, { attributes: true, attributeFilter: ['class'] }) }
    var fd = host.fdown; if (fdownHTML == null) fdownHTML = fd.innerHTML;
    fd.classList.remove('g-door'); fd.innerHTML = fdownHTML;
  }

  function lights(V) {
    var h = '';
    if (V === 'G1') h = '<div class="l l-key"></div><div class="l l-top"></div><div class="l l-win"><i></i></div><div class="l l-spot"><i></i><b></b></div>';
    gal.insertAdjacentHTML('beforeend', h);
  }

  /* ---- G1 ---- */
  function chromeG1(host, W, H, land, els) {
    lights('G1');
    var g = host._g1, c = els[host.cur], pad = g.pad, rl = host._rail;
    var cs = el('div', 'g-case'); cs.style.left = (c.bx - c.w / 2 - pad) + 'px'; cs.style.top = (c.by - c.h / 2 - pad) + 'px'; cs.style.width = (c.w + 2 * pad) + 'px'; cs.style.height = (c.h + 2 * pad) + 'px';
    gal.appendChild(cs);
    var sh = el('div', 'g-shelf'); sh.style.top = (rl.top + rl.h) + 'px'; sh.style.left = Math.max(0, rl.l - 10) + 'px'; sh.style.width = Math.min(W, rl.r - rl.l + 20) + 'px'; gal.appendChild(sh);
    gal.appendChild(Object.assign(el('div', 'g-pool'), { style: 'left:' + (c.bx - c.w * .8) + 'px;top:' + (c.by + c.h / 2 + pad - 22) + 'px;width:' + (c.w * 1.6) + 'px' }));
  }

  /* ---------------- the rail of objects, and the pairs ---------------- */
  function pairOfPiece(host, i) { var img = host.P[i].b.img; for (var k in BYK) if (BYK[k].src === img) return BYK[k]; return null }
  function pieceOfPair(host, o) { for (var i = 0; i < host.P.length; i++) if (host.P[i].b.img === o.src) return i; return -1 }
  function srcTitle(host, o) { var i = pieceOfPair(host, o); if (i >= 0) return host.P[i].b.title; var m = /^r\/([^/]+)\//.exec(o.src); return (m && RING[m[1]]) || '' }
  function selectPair(host, k, force) {
    var i0 = pieceOfPair(host, BYK[k]);
    if (curV === 'G1' && i0 >= 0 && i0 !== host.cur) { sel = k; host.cur = i0; return }
    sel = (!force && sel === k) ? null : k; host.relayout();
  }
  function syncPairs(host) {
    host.els.forEach(function (e) { e.el.classList.remove('pair-src') });
    var o = BYK[sel], i = o ? pieceOfPair(host, o) : -1;
    if (i >= 0 && host.els[i].el.style.display !== 'none') host.els[i].el.classList.add('pair-src');
  }
  var railEl = null;
  function buildRail(host) {
    var g = host._rail, S = g.h - 16;
    var rail = el('div', 'g-rail'); rail.setAttribute('data-rail', ''); rail.setAttribute('role', 'group'); rail.tabIndex = 0;
    rail.setAttribute('aria-label', 'the objects, cups and paddles, each cut from one of the photographs: scrolls sideways; tap one to see its photograph');
    rail.style.left = g.l + 'px'; rail.style.width = (g.r - g.l) + 'px'; rail.style.top = g.top + 'px'; rail.style.height = g.h + 'px';
    OBJS.forEach(function (o, i) {
      var pd = o.kind === 'paddle', on = sel === o.k;
      var maxd = pd ? S * (.86 + .14 * hash(i + 2)) : S * (.72 + .28 * hash(i + 5));
      var w = pd ? maxd * o.w / o.h : Math.min(maxd, S * o.w / o.h);
      var item = el('div', 'g-item' + (on ? ' on' : '')), b = el('button', 'g-obj'); b.type = 'button';
      b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', (pd ? 'paddle: ' : 'cup: ') + o.label + (on ? ' (its photograph is showing: tap to close)' : ': tap to see the photograph it was cut from'));
      b.style.width = Math.max(44, w) + 'px'; b.style.height = S + 'px';
      var c = cup(o.k, w, 10 + i, 'span'); c.style.position = 'relative'; b.appendChild(c);
      b.addEventListener('click', function (e) { e.stopPropagation(); selectPair(host, o.k) });
      item.appendChild(b);
      if (on) {
        var sw = S * o.srcW / o.srcH, ph = el('button', 'g-src'); ph.type = 'button'; ph.setAttribute('data-photo', ''); ph.style.width = sw + 'px'; ph.style.height = S + 'px';
        ph.setAttribute('aria-label', 'the photograph this ' + (pd ? 'paddle' : 'cup') + ' was cut from: ' + srcTitle(host, o) + '. Tap to close');
        ph.innerHTML = '<img alt="" decoding="async" draggable="false" src="media/' + o.src + '-480.webp">';
        ph.addEventListener('click', function (e) { e.stopPropagation(); selectPair(host, o.k) });
        var cap = el('span', 'g-cap', 'cut from<b></b>' + (o.cutAtHand ? '<i>cut where the hand starts</i>' : '')); cap.querySelector('b').textContent = srcTitle(host, o);
        item.appendChild(ph); item.appendChild(cap);
      }
      rail.appendChild(item);
    });
    fg.appendChild(rail); railEl = rail; rail.scrollLeft = railLeft;
    rail.addEventListener('scroll', function () { railLeft = rail.scrollLeft }, { passive: true });
    rail.addEventListener('wheel', function (e) {
      if (e.ctrlKey || rail.scrollWidth <= rail.clientWidth + 1) return;
      var dx = e.deltaX, dy = e.deltaY, u = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rail.clientWidth : 1; dx *= u; dy *= u;
      if (Math.abs(dy) <= Math.abs(dx)) return;
      var max = rail.scrollWidth - rail.clientWidth;
      if ((rail.scrollLeft <= 0 && dy < 0) || (rail.scrollLeft >= max - 1 && dy > 0)) return;
      e.preventDefault(); rail.scrollLeft = Math.max(0, Math.min(max, rail.scrollLeft + dy));
    }, { passive: false });
    var it = rail.querySelector('.g-item.on');
    if (it) {
      var l = it.offsetLeft, w2 = it.offsetWidth, vw = rail.clientWidth;
      if (l < rail.scrollLeft || l + w2 > rail.scrollLeft + vw) rail.scrollTo({ left: Math.max(0, Math.min(l, rail.scrollWidth - vw)), behavior: stopped ? 'auto' : 'smooth' });
    }
  }

  /* ---- G2 ---- */
  function chromeG2(host, W, H, land, els) {
    var g = host._g2, p = g.panel;
    var t = el('div', 'g-table'); t.style.left = p.x + 'px'; t.style.top = p.y + 'px'; t.style.width = p.w + 'px'; t.style.height = p.h + 'px';
    t.innerHTML = '<div class="g-bloom"></div><div class="g-surf"></div><div class="g-hd"><b>objects</b><span>' + els.length + ' stills · contact sheet</span></div>';
    gal.appendChild(t);
    var slots = g.cols * g.rows, order = ['clay', 'stone', 'ash2'];
    for (var s = els.length; s < slots; s++) {
      var c = s % g.cols, r = Math.floor(s / g.cols), cx = g.x0 + c * (g.iw + g.gx) + g.iw / 2, cy = g.y0 + r * (g.ih + g.lab + g.gy) + g.ih / 2;
      var k = order[(s - els.length) % order.length], wd = g.iw * (k === 'clay' ? .8 : k === 'stone' ? 1.0 : .92);
      var b = el('button', 'g-cupbtn'); b.type = 'button'; place(b, cx, cy); b.style.width = g.iw + 'px'; b.style.height = g.iw + 'px'; b.style.left = (cx - g.iw / 2) + 'px'; b.style.top = (cy - g.iw / 2) + 'px';
      var cp = cup(k, wd, 80 + s, 'span'); cp.style.position = 'absolute'; cp.style.left = ((g.iw - wd) / 2) + 'px'; cp.style.top = ((g.iw - wd * CUT[k][1] / CUT[k][0]) / 2) + 'px';
      b.appendChild(cp); b.setAttribute('aria-label', 'cup: tap to see the photograph it was cut from'); (function (kk) { b.addEventListener('click', function (e) { e.stopPropagation(); selectPair(host, kk, true) }) })(k); fg.appendChild(b);
    }
  }

  /* ---- G3 ---- */
  function chromeG3(host, W, H, land, els) {
    var g = host._g3, rail = el('div', 'g-prail'); rail.style.top = (g.top - 8) + 'px'; gal.appendChild(rail);
    var skirt = el('div', 'g-skirt'); skirt.style.top = (g.bottom + 6) + 'px'; gal.appendChild(skirt);
    var sx = [W * .2, W * .5, W * .8];
    for (var s = 0; s < 3; s++) {
      var beam = el('div', 'g-beam b' + (s + 1)); beam.style.left = sx[s] + 'px'; beam.style.top = (g.top - 6) + 'px'; beam.style.height = (g.bottom - g.top + 40) + 'px'; beam.style.setProperty('--bw', (W * (land ? .24 : .34)) + 'px');
      beam.innerHTML = '<i></i>'; gal.appendChild(beam);
      var head = el('button', 'g-head h' + (s + 1)); head.type = 'button'; head.setAttribute('aria-label', 'spot ' + (s + 1)); head.style.left = sx[s] + 'px'; head.style.top = (g.top - 14) + 'px';
      head.innerHTML = '<i></i>'; (function (k) { head.addEventListener('click', function (e) { e.stopPropagation(); var st = ST.G3, key = 's' + k; st[key] = st[key] ? 0 : 1; save('G3'); applyLight('G3', host); if (ui.G3) ui.G3.refresh() }) })(s + 1);
      fg.appendChild(head);
    }
    els.forEach(function (e, i) {
      var spot = e.bx < W / 3 ? 1 : e.bx < W * 2 / 3 ? 2 : 3;
      e.el.setAttribute('data-spot', spot); e.el.style.setProperty('--ps', 'var(--s' + spot + ')');
      var fr = el('div', 'g-fr'); fr.style.left = (e.bx - e.w / 2 - 4) + 'px'; fr.style.top = (e.by - e.h / 2 - 4) + 'px'; fr.style.width = (e.w + 8) + 'px'; fr.style.height = (e.h + 8) + 'px'; fr.style.setProperty('--ps', 'var(--s' + spot + ')');
      gal.appendChild(fr);
      var sy = e.by + e.h / 2 + 11, lk = joio(host, i);
      var sl = el(lk ? 'a' : 'span', 'g-slot' + (lk ? ' on' : ''));
      if (lk) { sl.href = 'https://www.joioco.com'; sl.target = '_blank'; sl.rel = 'noopener'; sl.setAttribute('aria-label', 'joio.co ceramics shop (opens the shop)') } else sl.setAttribute('aria-hidden', 'true');
      sl.style.left = (e.bx - 21) + 'px'; sl.style.top = (sy + 3) + 'px';
      var po = pairOfPiece(host, i);
      if (po) { var cw = 15 * (.85 + hash(i + 9) * .4), cp = cup(po.k, cw, 120 + i, 'i'); cp.style.position = 'relative'; sl.appendChild(cp) }
      fg.appendChild(sl);
      var th = el('div', 'g-thread'); th.style.left = e.bx + 'px'; th.style.top = (e.by + e.h / 2 + 3) + 'px'; th.style.height = '8px'; gal.appendChild(th);
    });
  }

  function off() {
    if (!gal) return;
    gal.innerHTML = ''; fg.innerHTML = ''; gal.className = 'gal'; curV = null;
    Object.keys(ui).forEach(function (k) { ui[k].el.hidden = true; if (ui[k].isOpen()) ui[k].open(false) });
    if (stopBtn) stopBtn.hidden = true;
    paintSafe();
    var hd0 = document.getElementById('ohd'); if (hd0) hd0.removeAttribute('data-g');
    if (hostRef) {
      setStopped(false, hostRef);
      setLabels(hostRef, 'title'); hostRef.fdown.classList.remove('g-door'); if (fdownHTML != null) hostRef.fdown.innerHTML = fdownHTML; railEl = null; lastCur = -1; hostRef.els.forEach(function (e) { e.el.classList.remove('pair-src') });
      ['--k', '--t', '--s', '--w', '--lit', '--s1', '--s2', '--s3', '--spr'].forEach(function (p) { hostRef.front.style.removeProperty(p) }); hostRef.front.removeAttribute('data-p');
      hostRef.els.forEach(function (e) { e.el.removeAttribute('data-spot'); e.el.style.removeProperty('--ps') });
    }
  }

  window.OBJ_GAL = { plan: plan, chrome: chrome, off: off, cuts: CUT, pairs: function () { return OBJS.map(function (o) { return { object: o.k, kind: o.kind, photo: o.src } }) }, get selected() { return sel }, get stopped() { return stopped }, get orbit() { return !!curV && !stopped }, get active() { return !!curV }, get safelight() { return safeOn && !!curV }, setSafelight: function (on) { setSafe(on, false) }, setStopped: function (on) { setStopped(on, hostRef) }, onStop: function (fn) { stopFns.push(fn) } };
})();
