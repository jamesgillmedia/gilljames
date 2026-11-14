/* se-c · read to move: one column holds the PDF's words in order; reading down it moves the camera through the eye.
 While a page is being read the camera holds; between pages it travels to the next stop (in, under, into the garden).
 The scene's own short labels stay pinned in the scene. Scrolling is the only driver, so Reduce Motion changes nothing. */
(function () {
  /* the 16 stops, in the order of the journey: a number = reading page (template id), 's' = a scene stop, 'g' = the end sketches */
  const ORDER = [0, 1, 2, 3, 's', 5, 's', 's', 's', 's', 10, 's', 's', 's', 14, 'g'];
  const EASE = (() => { const x1 = .22, y1 = 1, x2 = .36, y2 = 1, cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (cb(t, x1, x2) < x) lo = t; else hi = t } return cb(t, y1, y2) } })();
  const R = document.createElement('main'); R.id = 'read'; R.setAttribute('aria-label', 'Spirit Eye, the pages in order');
  ORDER.forEach((o, i) => { const sec = document.createElement('section'); sec.className = 'rs ' + (o === 's' ? 'scene' : o === 'g' ? 'sketch' : 'page'); sec.dataset.i = i;
    if (typeof o === 'number') sec.innerHTML = document.getElementById('tell-' + o).innerHTML;
    if (o === 'g') sec.appendChild(document.getElementById('segal'));
    R.appendChild(sec) });
  document.body.insertBefore(R, document.getElementById('senav'));
  const secs = Array.from(R.children);
  let SEC = null, anim = null;
  const mark = () => R.scrollTop + R.clientHeight * .28;
  /* hold through the first 60% of a section, then travel to the next stop */
  function sFromScroll() { const m = mark(); let i = 0; while (i < secs.length - 1 && secs[i + 1].offsetTop <= m) i++;
    if (i >= secs.length - 1) return secs.length - 1;
    const a = secs[i].offsetTop, b = secs[i + 1].offsetTop, u = Math.max(0, Math.min(1, (m - a) / Math.max(1, b - a)));
    const t = Math.max(0, (u - .6) / .4); return i + t * t * (3 - 2 * t) }
  const topOf = i => { const e = secs[i]; return Math.max(0, e.classList.contains('scene') ? e.offsetTop : e.offsetTop + parseFloat(getComputedStyle(e).paddingTop) - 20) };
  function scrollTo(i) { i = Math.max(0, Math.min(secs.length - 1, i)); const y0 = R.scrollTop, y1 = Math.min(topOf(i), R.scrollHeight - R.clientHeight), t0 = performance.now(), d = 650;
    anim = { y0, y1, t0, d }; }
  function curIndex() { return Math.round(Math.min(secs.length - 1, sFromScroll() + .44)) }
  function frame(now) { requestAnimationFrame(frame);
    if (anim) { const u = Math.min(1, (now - anim.t0) / anim.d); R.scrollTop = anim.y0 + (anim.y1 - anim.y0) * EASE(u); if (u >= 1) anim = null }
    if (SEC) SEC.setS(sFromScroll());
    const ci = Math.floor(sFromScroll() + 1e-3); secs.forEach((e, j) => e.classList.toggle('here', j === ci)) }
  requestAnimationFrame(frame);
  window.__SEX = {
    free: true,
    size() { const c = document.getElementById('c'); return [c.clientWidth || innerWidth, c.clientHeight || innerHeight] },
    onTell() {}, onGal() {},
    wire(S, cv) { SEC = S;
      let d = null;
      cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (x) {} anim = null; d = { id: e.pointerId, x: e.clientX, y: e.clientY, top: R.scrollTop } });
      cv.addEventListener('pointermove', e => { if (!d || d.id !== e.pointerId) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; R.scrollTop = d.top - (Math.abs(dx) > Math.abs(dy) ? dx * 1.6 : dy * 1.6) });
      const end = e => { if (d && d.id === e.pointerId) d = null }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      cv.addEventListener('wheel', e => { anim = null; R.scrollTop += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX }, { passive: true });
      addEventListener('keydown', e => { if (window.__gal && window.__gal.isOpen) return; if (e.key === 'ArrowRight' || e.key === 'PageDown' && e.target !== R) { e.preventDefault(); scrollTo(curIndex() + 1) } else if (e.key === 'ArrowLeft') { e.preventDefault(); scrollTo(curIndex() - 1) } });
      document.getElementById('next').addEventListener('click', () => scrollTo(curIndex() + 1));
      document.getElementById('prev').addEventListener('click', () => scrollTo(curIndex() - 1));
      const m = location.hash.match(/^#s(\d+)$/); if (m) R.scrollTop = topOf(+m[1]); else if (/^#p(2[6-9]|3[0-2])$/.test(location.hash)) R.scrollTop = topOf(secs.length - 1);
    }
  };
  window.__qaGo = s => { anim = null; R.scrollTop = topOf(+s) };
})();
