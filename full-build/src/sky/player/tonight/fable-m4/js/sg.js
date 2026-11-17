/* fable-m4 · the smoked-glass arrival (Pack 1116 §1, option c). Smoked glass is the default opener; Tune's "arrival" row returns to m4's crescent.
   Ported by hand from gilljames 58a8e2b, site-v3-3d/?arrival=v1:
     - js/sg/water.js is site-v3 js/water.js, unchanged (the Moonwater shader, its hole onto the stars, the still poster as its fallback);
     - the tap, the hole, the cyan flash, the melt and their timings are site-v3 js/arrival.js, profile "v1" (hole 500 ms, flash on, water drawn at 1x, 1.5 s guard);
     - the moon on the water, the dotted Mark, the touch ripples, the tilt and the side dial are site-v3-3d js/fold.js (sections 1, 2 and 9).
   What differs, because this is the m4 sky and not the scrolling page: the fall does not scroll to a chapter list, it hands over to m4's own sky
   (the same entry "touch the water" used); the dotted Mark is a button, the doorway in; the hint says only what this screen does.
   The poem is read from data.json, the one place m4 keeps it. Reduce Motion: no hole, no melt, no tilt, a plain hand-over. */
(function (w, d) {
  'use strict';
  var H = d.documentElement, RMQ = matchMedia('(prefers-reduced-motion: reduce)'), CFG = { hole: 500, guard: 1500, flash: 1, dpr: 1 };
  var root = null, bd = null, intro = null, dial = null, up = false, busy = false, READY = 0, holeEl = null, poemReady = false, waterAsked = false, T = { x: 0, y: 0, tx: 0, ty: 0 }, raf = 0;
  function rd(k, def) { try { var v = localStorage.getItem(k); return v == null ? def : v; } catch (e) { return def; } }
  function pref() { return rd('gj.arrival', 'smoke') === 'crescent' ? 'crescent' : 'smoke'; }
  function dialOn() { return rd('gj.sidedial', '1') !== '0'; }
  function rm() { return RMQ.matches; }
  function phase() { return w.__u1 ? w.__u1.phase : ''; }
  function setPref() { H.classList.toggle('sg-pref', pref() === 'smoke'); }
  setPref();
  var HERO = '../../../../v33d/site-v3/img/hero/';   // the water photograph already in the tree (site-v3): nothing is copied
  function build() {
    if (root) return;
    root = d.createElement('div'); root.id = 'sga'; root.hidden = true; root.setAttribute('aria-label', 'arrival');
    root.innerHTML = '<div class="backdrop" aria-hidden="true"><img id="poster" src="' + HERO + 'water-900.webp" srcset="' + HERO + 'water-900.webp 900w, ' + HERO + 'water-1600.webp 1600w" sizes="100vw" alt="" width="900" height="1125"><canvas id="gl"></canvas>' +
      '<div id="fold-moon"><i class="fm-disc"></i><i class="fm-path"></i></div></div>' +
      '<div class="sg-main"><div class="sg-in"><div class="intro">' +
      '<button type="button" id="sg-mark" aria-label="ᑕᐣᓯ · enter the sky"><canvas id="fold-mark" aria-hidden="true"></canvas></button>' +
      '<div class="id"><p class="name off" role="heading" aria-level="1">gill james</p><span class="sg-moon" aria-hidden="true"></span></div>' +
      '<p class="roles">Cinematographer + Artist + Spatial Designer</p><p class="sg-poem" lang="en"></p>' +
      '<p class="hint">touch the water or scroll to sink</p></div></div></div>';
    d.body.appendChild(root); bd = root.querySelector('.backdrop'); intro = root.querySelector('.intro');
    fetch('data.json').then(function (r) { return r.json(); }).then(function (j) {
      var p = root.querySelector('.sg-poem'); (j.poem || []).forEach(function (l) { var s = d.createElement('span'); s.textContent = l; p.appendChild(s); }); poemReady = true; fit();
    }).catch(function () {});
    mark(); events(); mkDial();
  }
  /* the mark as a dotted star constellation (fold.js, section 2) */
  var pts = [], cv = null, t0 = performance.now(), drawing = false;
  function mark() {
    cv = root.querySelector('#fold-mark');
    function make() {
      var wd = cv.clientWidth || 300, h = Math.round(wd / 2.2), dpr = Math.min(2, w.devicePixelRatio || 1); cv.width = wd * dpr; cv.height = h * dpr;
      var o = d.createElement('canvas'); o.width = wd; o.height = h; var g = o.getContext('2d'); g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.textAlign = 'left';
      g.font = '400 ' + Math.round(h * .78) + 'px "Noto Sans Canadian Aboriginal","Julius Sans One",Poppins,sans-serif'; g.fillText('ᑕᐣᓯ', 4, h * .52);
      var px = g.getImageData(0, 0, wd, h).data, step = Math.max(4, Math.round(wd / 64)); pts = [];
      for (var y = 0; y < h; y += step) for (var x = 0; x < wd; x += step) { var a = px[(y * wd + x) * 4 + 3]; if (a > 110) pts.push([x, y, Math.random() * 6.28, .75 + Math.random() * .55]); }
    }
    function draw(now) {
      if (!up) { drawing = false; return; }
      var g = cv.getContext('2d'), dpr = cv.width / (cv.clientWidth || 1), tt = (now - t0) / 1000, red = H.classList.contains('rm'), ink = red ? 'rgb(' + (getComputedStyle(H).getPropertyValue('--gj-red-rgb') || '255,68,87').trim() + ')' : '#e8e4dc';
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
      for (var i = 0; i < pts.length; i++) { var p = pts[i], tw = rm() ? 1 : .72 + .28 * Math.sin(tt * 1.6 + p[2]); g.globalAlpha = Math.min(1, .55 * tw * p[3] + .25);
        g.fillStyle = ink; g.beginPath(); g.arc(p[0], p[1], 1.15 * p[3], 0, 6.283); g.fill();
        if (p[3] > 1.08) { g.globalAlpha = .16 * tw; g.beginPath(); g.arc(p[0], p[1], 4, 0, 6.283); g.fill(); } }
      g.globalAlpha = 1; if (!rm()) requestAnimationFrame(draw); else setTimeout(function () { requestAnimationFrame(draw); }, 600);
    }
    mark.go = function () { make(); if (!drawing) { drawing = true; requestAnimationFrame(draw); } };
    var rz = 0; w.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (up) { make(); fit(); place(); } }, 200); });
  }
  /* a short screen: the page this came from could scroll, this one cannot, so the words are scaled to fit above the bottom edge */
  function fit() { if (!intro || !up) return; intro.classList.remove('fit'); intro.style.removeProperty('--fit'); var r = intro.getBoundingClientRect(), room = w.innerHeight - r.top - 14; if (r.height > room && room > 120) { intro.style.setProperty('--fit', (room / r.height).toFixed(4)); intro.classList.add('fit'); } }
  /* the water (site-v3 js/water.js, unchanged). arrival.js, profile v1: the shader's crescent at v2's spot and size, drawn at 1x on a phone */
  function place() { var W = w.__water; if (!W || !W.moon) return; var mob = w.innerWidth < 900; if (W.res) W.res(mob ? 1 : 1.5); W.moon(mob ? .72 : .665, mob ? .21 : .30, mob ? .058 : .072); }
  function water() { if (waterAsked) return; waterAsked = true; var s = d.createElement('script'); s.src = 'js/sg/water.js'; s.async = true; d.head.appendChild(s); d.addEventListener('water:on', place); }
  /* tilt (fold.js, section 1): pointer on desktop, gyro where the browser gives it without a prompt */
  function tick() { raf = 0; var k = .08; T.x += (T.tx - T.x) * k; T.y += (T.ty - T.y) * k; if (root) { root.style.setProperty('--tx', T.x.toFixed(4)); root.style.setProperty('--ty', T.y.toFixed(4)); } if (up && (Math.abs(T.tx - T.x) > .002 || Math.abs(T.ty - T.y) > .002)) raf = requestAnimationFrame(tick); }
  function aim(x, y) { if (!up) return; if (rm()) T.tx = T.ty = 0; else { T.tx = Math.max(-1, Math.min(1, x)); T.ty = Math.max(-1, Math.min(1, y)); } if (!raf) raf = requestAnimationFrame(tick); }
  function blocked() { return H.classList.contains('gj-map-open') || H.classList.contains('mm-open') || H.classList.contains('mk-on') || !!(w.GJ_FAMILY && w.GJ_FAMILY.isOpen && w.GJ_FAMILY.isOpen()); }
  var EX = 'a,button,input,select,textarea,label,[role=button],.sg-poem,.name,.roles,.hint';
  function events() {
    var pd = null, wheelAcc = 0, wheelT = 0, lastUp = null;
    var blockedAtDown = false; w.addEventListener('pointerdown', function () { blockedAtDown = blocked(); }, true);   // read before Tune's own outside-tap handler closes it
    root.addEventListener('pointerdown', function (e) {
      if (!e.isPrimary) return; pd = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), ex: !!(e.target.closest && e.target.closest(EX)), held: blockedAtDown };
      if (e.pointerType === 'touch' && !rm() && !pd.ex) [0, 1].forEach(function (i) { var r = d.createElement('i'); r.className = 'fold-ripple' + (i ? ' r2' : ''); r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; d.body.appendChild(r); setTimeout(function () { r.remove(); }, 1900); });
    });
    root.addEventListener('pointerup', function (e) {
      if (!pd || e.pointerId !== pd.id) return; var p = pd; pd = null; lastUp = { far: Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y), t: performance.now() }; if (!up || busy || blocked()) return;
      if (p.held) return;   // this touch began while Tune, the map or the family was open: it closes that, and nothing more
      var dx = e.clientX - p.x, dy = e.clientY - p.y, far = Math.sqrt(dx * dx + dy * dy);
      if (far < 10 && performance.now() - p.t < 700) { if (!p.ex && performance.now() >= READY) sink(e.clientX, e.clientY); return; }
      if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) && (dy < 0 || p.y > w.innerHeight * .42)) sink(e.clientX, e.clientY);   // scroll to sink: a swipe up anywhere, or a pull down that starts below the top 42% (above it, a pull down is the family's)
    });
    root.addEventListener('pointercancel', function () { pd = null; });
    root.addEventListener('wheel', function (e) { e.preventDefault(); if (!up || busy || blocked() || e.deltaY <= 0) return; var n = performance.now(); if (n - wheelT > 400) wheelAcc = 0; wheelT = n; wheelAcc += e.deltaY; if (wheelAcc > 40) { wheelAcc = 0; sink(w.innerWidth / 2, w.innerHeight * .62); } }, { passive: false });
    root.querySelector('#sg-mark').addEventListener('click', function (e) { e.preventDefault(); if (!up || busy || blocked()) return; if (lastUp && lastUp.far > 12 && performance.now() - lastUp.t < 500) return;   /* the end of a drag, not a tap */
      var r = this.getBoundingClientRect(); sink(r.left + r.width * .42, r.top + r.height / 2); });
    w.addEventListener('keydown', function (e) {
      if (!up || busy || blocked() || e.metaKey || e.ctrlKey || e.altKey) return; var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); sink(w.innerWidth / 2, w.innerHeight * .62); }
    }, true);
    w.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') aim((e.clientX / w.innerWidth - .5) * 2, (e.clientY / w.innerHeight - .5) * 2); }, { passive: true });
    d.addEventListener('mouseleave', function () { aim(0, 0); });
    w.addEventListener('deviceorientation', function (e) { if (e.gamma != null) aim(e.gamma / 28, ((e.beta || 45) - 45) / 28); }, { passive: true });
  }
  /* the side dial (fold.js, section 9): a tap opens Tune, a second tap closes it */
  function mkDial() {
    dial = d.createElement('button'); dial.type = 'button'; dial.id = 'fold-dial'; dial.hidden = true; dial.setAttribute('aria-label', 'tune: open the drawer from the side dial'); dial.setAttribute('aria-expanded', 'false');
    var h = '<svg viewBox="0 0 30 120" aria-hidden="true"><path class="fd-arc" d="M30 6 A70 70 0 0 0 30 114"/>', CX = 74.5, i;
    for (i = 0; i <= 10; i++) { var ang = Math.PI - .8 + i * .16, ox = CX + 70 * Math.cos(ang), oy = 60 + 70 * Math.sin(ang), ri = i % 5 ? 65 : 61, ix = CX + ri * Math.cos(ang), iy = 60 + ri * Math.sin(ang); h += '<line class="fd-tick" x1="' + ox.toFixed(1) + '" y1="' + oy.toFixed(1) + '" x2="' + ix.toFixed(1) + '" y2="' + iy.toFixed(1) + '"/>'; }
    h += '<circle class="fd-dot" cx="4.5" cy="60" r="2"/><text class="fd-lab" x="15" y="62.5" text-anchor="middle" transform="rotate(90 15 60)">TUNE</text></svg>';
    dial.innerHTML = h; d.body.appendChild(dial);
    var wasOpen = false; dial.addEventListener('pointerdown', function (e) { wasOpen = !!(w.GJ_MARKMENU && w.GJ_MARKMENU.open); e.stopPropagation(); }, true);
    dial.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var mm = w.GJ_MARKMENU; if (!mm) return; if (wasOpen) mm.show(false); else if (mm.tune) mm.tune(); else mm.show(true); }, true);
    new MutationObserver(function () { dial.setAttribute('aria-expanded', H.classList.contains('mm-open') ? 'true' : 'false'); }).observe(H, { attributes: true, attributeFilter: ['class'] });
  }
  function dialSync() { if (!dial) return; var on = up && dialOn(); if (on) { dial.hidden = false; dial.classList.remove('out'); } else if (!dial.hidden) { dial.classList.add('out'); setTimeout(function () { if (!(up && dialOn())) dial.hidden = true; }, 320); } }
  function show() {
    build(); if (up) return; up = true; busy = false; root.hidden = false; root.classList.remove('out', 'sunk'); intro.classList.remove('melt'); H.classList.add('sg-up');
    READY = performance.now() + CFG.guard; if (w.__water && w.__water.reset) { w.__water.reset(); if (w.__water.active) w.__water.active(true); }
    water(); (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { if (up) { mark.go(); fit(); place(); } }); mark.go(); fit(); dialSync();
  }
  function hide(now) {
    if (!root || !up) { H.classList.remove('sg-up'); return; } up = false; busy = false; H.classList.remove('sg-up'); dialSync();
    if (now) { root.hidden = true; root.classList.remove('out'); } else { root.classList.add('out', 'sunk'); setTimeout(function () { if (!up) { root.hidden = true; root.classList.remove('out'); if (holeEl) { holeEl.remove(); holeEl = null; } } }, 850); }
    if (w.__water && w.__water.active) setTimeout(function () { if (!up && w.__water) w.__water.active(false); }, now ? 0 : 900);
  }
  function enter() { if (w.GJ_ARRIVE && w.GJ_ARRIVE.enter) w.GJ_ARRIVE.enter(); }
  /* touch the water (arrival.js dive): the hole opens under the finger onto the stars, the words melt, then the fall. Here the fall is m4's own sky coming up. */
  function sink(x, y) {
    if (!up || busy) return; busy = true;
    if (rm()) { enter(); hide(true); return; }
    var W = w.__water, ok = !!(W && W.live && W.live() && W.hole(x / w.innerWidth, y / w.innerHeight));
    if (!ok) { holeEl = d.createElement('i'); holeEl.className = 'bd-hole'; holeEl.style.left = x + 'px'; holeEl.style.top = y + 'px'; bd.appendChild(holeEl); void holeEl.offsetWidth; holeEl.classList.add('open'); }
    if (CFG.flash) { var fl = d.createElement('i'); fl.className = 'bd-flash'; fl.style.left = x + 'px'; fl.style.top = y + 'px'; bd.appendChild(fl); setTimeout(function () { fl.remove(); }, 700); }
    intro.classList.add('melt'); if (dial) dial.classList.add('out');
    setTimeout(function () { enter(); hide(false); }, CFG.hole);
  }
  /* m4 tells this layer which phase it is in (sky.js setChrome), and asks before it runs its own way in */
  function sync(ph) { setPref(); if (ph === 'arrive' && pref() === 'smoke') show(); else if (up && !busy) hide(ph !== 'arrive' ? false : true); }
  w.addEventListener('gj-tog', function (e) { var k = e.detail && e.detail.k; if (k === 'gj.arrival') { setPref(); if (phase() === 'arrive') { if (pref() === 'smoke') show(); else hide(true); } } if (k === 'gj.sidedial') dialSync(); });
  w.addEventListener('storage', function (e) { if (e.key === 'gj.arrival') sync(phase()); if (e.key === 'gj.sidedial') dialSync(); });
  w.GJ_SG = { sync: sync, on: function () { return up; }, busy: function () { return busy; }, pref: pref,
    take: function () { if (!up) return false; if (!busy) sink(w.innerWidth / 2, w.innerHeight * .62); return true; },   // Esc, Back and the other ways m4 used to leave its arrival go the same way
    sink: sink, state: function () { return { up: up, busy: busy, pref: pref(), dial: !!(dial && !dial.hidden && !dial.classList.contains('out')), melt: !!(intro && intro.classList.contains('melt')), water: !!(w.__water && w.__water.live && w.__water.live()), ready: performance.now() >= READY, poem: poemReady, fit: intro ? (intro.style.getPropertyValue('--fit') || '1') : '1' }; } };
  /* the locked ghost arc (js/sg/ghostdial.js) speaks the small interface it had in 58a8e2b. m4's Tune hides its drawer while a slider is held and
     expects its dial to give the drawer back once the arc is gone (m4's dial.js does). This does the same for the arc on the arrival. */
  var gT = 0; function drawerBack() { var m = d.getElementById('markmenu'); if (m) m.classList.remove('gd-away'); }
  w.GJ_SGDIAL = { update: function (i) { clearTimeout(gT); return w.GJ_GHOST60 ? w.GJ_GHOST60.update(i) : false; },
    release: function () { if (w.GJ_GHOST60) w.GJ_GHOST60.release(); clearTimeout(gT); gT = setTimeout(drawerBack, rm() ? 1000 : 1020); },
    hide: function () { if (w.GJ_GHOST60) w.GJ_GHOST60.hide(); clearTimeout(gT); drawerBack(); }, get shown() { return !!(w.GJ_GHOST60 && w.GJ_GHOST60.shown); } };
  if (phase() === 'arrive') sync('arrive');
})(window, document);
