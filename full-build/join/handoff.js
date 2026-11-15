/* Fable step-one join kit (fable-return/join/gilljames-step-one-join/join/handoff.js), folded into one-build. */
/* join · arrival → sky.
   The smoked-glass arrival (gilljames site-v3-3d @ 58a8e2be, locked) is untouched: this file only listens.
   When you touch the water the arrival opens its hole and starts to fall (it sets html.diving). Partway into that fall the page
   goes to the night colour and lands in the flat calm field (one-build: the hub, ../index.html), so the field is the sky under the water. The dock's
   "−" (the whole sky) lands there too. Scrolling still shows the arrival's own chapter list, exactly as locked.
   Turn the hand-off off with ?stay=1. */
(function () {
  'use strict';
  var D = document.documentElement, done = false, Q;
  try { Q = new URLSearchParams(location.search); } catch (e) { Q = { get: function () { return null; } }; }
  if (Q.get('stay') === '1') return;
  /* one-build: the field is the full build's own hub (full-build/index.html, Fable's constellation pass), one folder up from join/ */
  var SKY = new URL('../index.html', document.currentScript.src).href;
  /* warm the field's first files so the landing is not a blank beat */
  ['index.html', 'data.js', 'blend.js', 'blend.css', 'chrome.js'].forEach(function (p) {
    var l = document.createElement('link'); l.rel = 'prefetch'; l.href = new URL('../' + p, document.currentScript.src).href; document.head.appendChild(l);
  });
  function go() {
    if (done) return; done = true;
    var v = document.createElement('i');
    v.setAttribute('aria-hidden', 'true');
    v.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#04070b;opacity:0;pointer-events:none;transition:opacity .42s ease-in';
    document.body.appendChild(v); void v.offsetWidth; v.style.opacity = '1';
    setTimeout(function () { location.href = SKY; }, 440);
  }
  /* two ways down, both the arrival's own: touching the water (html.diving), and "− for the whole sky" (html.sheet-on).
     The whole sky is the calm field. The address is cleaned first so the browser's Back returns to the surface, not into a loop. */
  function check() {
    if (done) return;
    if (D.classList.contains('diving')) setTimeout(go, 520);
    else if (D.classList.contains('sheet-on')) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} setTimeout(go, 160); }
  }
  new MutationObserver(check).observe(D, { attributes: true, attributeFilter: ['class'] });
  check();
  /* coming back with the browser's Back: show the surface again, ready for another touch */
  addEventListener('pageshow', function (e) { if (e.persisted) { done = false; [].forEach.call(document.querySelectorAll('body > i[aria-hidden]'), function (n) { if (n.style.zIndex === '2147483000') n.remove(); }); } });
})();
