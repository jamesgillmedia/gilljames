/* Site V3 as the outer layer (Pack 1116 §3). In the scroll, at "The Sky", the framed sky is Pro 2's compact cluster (js/p2draw.js, the same
   drawing fable-m4 gathers into at its farthest zoom-out). A tap or a pinch on it flies in: the frame opens to the whole screen and the full
   fable-m4 sky takes over. That is one step: Back returns to this scroll, at The Sky. Nothing else on the page changes; the page's own older
   sheet sky still serves the deeper states it always did ("see all" from a chapter or a work), it is only no longer what this frame opens. */
(function (w, d) {
  'use strict';
  var P = w.GJ_P2DRAW, portal = d.querySelector('.portal'); if (!P || !portal) return;
  var M4 = '../../sky/player/tonight/fable-m4/index.html?sky=1&from=v3', RMQ = matchMedia('(prefers-reduced-motion: reduce)'), H = d.documentElement;
  var old = portal.querySelector('canvas'), cv = d.createElement('canvas'); cv.className = 'p2f'; cv.setAttribute('aria-hidden', 'true'); if (old) old.replaceWith(cv); else portal.insertBefore(cv, portal.firstChild);
  var g = cv.getContext('2d'), vis = false, raf = 0, t0 = performance.now(), fly = null, leaving = false;
  function red() { return H.classList.contains('rm') ? (H.getAttribute('data-red-tone') === 'rose' ? '255,176,184' : '255,68,87') : null; }
  function raw(f) { return w.GJ_V3RED ? w.GJ_V3RED.raw(f) : f(); }   // this drawing chooses its own red; it is not mapped twice
  function paint() { var r = cv.getBoundingClientRect(); if (!r.width) return; var dp = Math.min(2, w.devicePixelRatio || 1), W = r.width, HH = r.height;
    if (cv.width !== Math.round(W * dp) || cv.height !== Math.round(HH * dp)) { cv.width = Math.round(W * dp); cv.height = Math.round(HH * dp); }
    var L = P.frame(W, HH); raw(function () { g.setTransform(dp, 0, 0, dp, 0, 0); g.clearRect(0, 0, W, HH); P.draw(g, W, HH, { t: RMQ.matches ? 0 : (performance.now() - t0) / 1000, red: red(), c: L.c, R: L.R, gs: L.gs, pos: L.pos, a: 1, ground: 1, mark: 1, labels: true }); }); }
  function loop() { raf = 0; if (!vis || fly) return; paint(); if (!RMQ.matches) raf = requestAnimationFrame(loop); }
  function kick() { if (!raf && vis && !fly) raf = requestAnimationFrame(loop); }
  if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }, { rootMargin: '200px 0px' }).observe(portal); else { vis = true; kick(); }
  w.addEventListener('resize', function () { if (vis) paint(); }); if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { if (vis) paint(); });
  new MutationObserver(function () { if (vis) { paint(); kick(); } }).observe(H, { attributes: true, attributeFilter: ['class', 'data-red-tone'] });

  /* ---- fly in: the frame opens to the whole screen, then the full sky (fable-m4) is the next page ---- */
  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function flyIn(rect) {
    if (fly || leaving) return; var r = rect || (portal.getBoundingClientRect().width ? cv.getBoundingClientRect() : null), W = w.innerWidth, HH = w.innerHeight;
    if (!r || r.bottom < 0 || r.top > HH) r = { left: W * .5 - 150, top: HH * .5 - 150, width: 300, height: 300, right: W * .5 + 150, bottom: HH * .5 + 150 };
    try { sessionStorage.setItem('gj.v3.sky', String(Math.round(w.scrollY))); } catch (e) {}
    var el = d.createElement('div'); el.id = 'v3fly'; el.setAttribute('aria-hidden', 'true'); var c = d.createElement('canvas'); el.appendChild(c); d.body.appendChild(el);
    var dp = Math.min(2, w.devicePixelRatio || 1); c.width = Math.round(W * dp); c.height = Math.round(HH * dp); var gg = c.getContext('2d');
    var A = P.frame(r.width, r.height), B = P.full(W, HH), dur = RMQ.matches ? 1 : 620, s0 = performance.now(); fly = el;
    function at(x) { var e = ease(x), pos = {}; P.order.forEach(function (k) { var a = [r.left + A.pos[k][0], r.top + A.pos[k][1]], b = B.pos[k]; pos[k] = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, A.gs + (B.gs - A.gs) * e, 1]; });
      var c0 = [r.left + A.c[0], r.top + A.c[1]]; return { c: [c0[0] + (B.c[0] - c0[0]) * e, c0[1] + (B.c[1] - c0[1]) * e], R: A.R + (B.R - A.R) * e, gs: A.gs + (B.gs - A.gs) * e, pos: pos, e: e }; }
    function step(now) { var x = Math.min(1, (now - s0) / dur), L = at(x), e = L.e;
      el.style.clipPath = 'inset(' + (r.top * (1 - e)).toFixed(1) + 'px ' + ((W - r.right) * (1 - e)).toFixed(1) + 'px ' + ((HH - r.bottom) * (1 - e)).toFixed(1) + 'px ' + (r.left * (1 - e)).toFixed(1) + 'px round ' + (18 * (1 - e)).toFixed(1) + 'px)';
      raw(function () { gg.setTransform(dp, 0, 0, dp, 0, 0); gg.clearRect(0, 0, W, HH); P.draw(gg, W, HH, { t: RMQ.matches ? 0 : (now - t0) / 1000, red: red(), c: L.c, R: L.R, gs: L.gs, pos: L.pos, a: 1, ground: 1, mark: 1, labels: true }); });
      if (x < 1) requestAnimationFrame(step); else { leaving = true; w.location.assign(M4); } }
    requestAnimationFrame(step);
  }
  function settle() { leaving = false; if (fly) { try { fly.remove(); } catch (e) {} fly = null; } kick(); }
  /* Back from the sky: this page again, at The Sky (the browser restores the scroll; if it did not, the frame is brought into view) */
  w.addEventListener('pageshow', function (e) { settle(); var y = null; try { y = sessionStorage.getItem('gj.v3.sky'); sessionStorage.removeItem('gj.v3.sky'); } catch (er) {}
    if (y == null) return; var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {}; if (!e.persisted && nav.type !== 'back_forward') return;
    setTimeout(function () { var r = portal.getBoundingClientRect(); if (r.bottom < 40 || r.top > w.innerHeight - 40) w.scrollTo(0, +y || 0); vis = true; kick(); }, e.persisted ? 0 : 350); });
  /* the tap (before the page's own handler, which opened its older sheet sky from this frame) */
  d.addEventListener('click', function (e) { var t = e.target && e.target.closest && e.target.closest('.portal'); if (!t) return; e.preventDefault(); e.stopImmediatePropagation(); flyIn(cv.getBoundingClientRect()); }, true);
  /* the pinch on the frame, and "−" / a pinch out past the top level: the page asks its sheet for "the whole sky"; that is this sky now */
  function hook() { var S = w.__sheet; if (!S || S._outer) return !!S; var open = S.open; S.open = function (o) { o = o || {}; if (!o.mode) { flyIn(o.rect || null); return; } return open.call(S, o); }; S._outer = 1; return true; }
  if (!hook()) { var n = 0, iv = setInterval(function () { if (hook() || ++n > 80) clearInterval(iv); }, 100); }
  w.GJ_V3OUTER = { fly: function () { flyIn(cv.getBoundingClientRect()); }, state: function () { var r = cv.getBoundingClientRect(), L = P.frame(r.width, r.height); return { flying: !!fly, leaving: leaving, rect: [r.left, r.top, r.width, r.height], c: L.c, R: L.R, gs: L.gs, pos: L.pos, red: !!red() }; } };
})(window, document);
