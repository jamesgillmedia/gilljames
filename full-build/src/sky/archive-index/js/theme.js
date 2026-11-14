/* Red mode: a one-tap dot, always on screen (the ring-and-dot recipe of the site's #themeBtn).
   Red = deep darkroom red UI and room chrome on black. A sub-toggle decides whether images and video are red too:
   it defaults to true colour, so photographs are never tinted unless you ask. Remembered per device (localStorage gj.theme / gj.rm.img),
   ?rm=1 or ?rm=0 (also ?theme=red / night) sets it. */
(function () {
  'use strict';
  var html = document.documentElement, K = 'gj.theme', KI = 'gj.rm.img', rm = false, tc = true;
  try { rm = localStorage.getItem(K) === 'red'; tc = localStorage.getItem(KI) !== 'red'; } catch (e) {}
  var q = new URLSearchParams(location.search), u = q.get('rm'), th = q.get('theme');
  if (u === '1' || th === 'red') { rm = true; save(); } else if (u === '0' || th === 'night') { rm = false; save(); }
  function save() { try { localStorage.setItem(K, rm ? 'red' : 'night'); localStorage.setItem(KI, tc ? 'true' : 'red'); } catch (e) {} }
  var meta = document.querySelector('meta[name=theme-color]'), metaWas = meta && meta.content;
  function apply() {
    html.classList.toggle('rm', rm); html.classList.toggle('rm-img', rm && !tc);
    if (meta) meta.content = rm ? '#050203' : metaWas;
    if (ring) { ring.setAttribute('aria-pressed', String(rm)); sub.hidden = !rm; sub.setAttribute('aria-pressed', String(tc)); sub.textContent = tc ? 'images \u00b7 true colour' : 'images \u00b7 red'; }
    window.dispatchEvent(new CustomEvent('rmchange', { detail: { rm: rm, tc: tc } }));
  }
  var ring, sub;
  function ui() {
    var d = document.createElement('div'); d.className = 'rm-ui';
    sub = document.createElement('button'); sub.type = 'button'; sub.className = 'rm-sub'; sub.setAttribute('aria-label', 'Images and video: keep true colour or turn red');
    ring = document.createElement('button'); ring.type = 'button'; ring.className = 'rm-dot'; ring.setAttribute('aria-label', 'Red mode'); ring.innerHTML = '<i></i>';
    d.appendChild(sub); d.appendChild(ring); document.body.appendChild(d);
    ring.onclick = function () { rm = !rm; save(); apply(); };
    sub.onclick = function () { tc = !tc; save(); apply(); };
    apply();
  }
  window.GJ_RM = { on: function () { return rm; }, trueColour: function () { return tc; } };
  html.classList.toggle('rm', rm); html.classList.toggle('rm-img', rm && !tc);
  if (document.body) ui(); else document.addEventListener('DOMContentLoaded', ui);
})();
