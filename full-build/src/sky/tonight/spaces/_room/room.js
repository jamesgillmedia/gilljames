/* Spaces · room chrome (spaces-1113), shared by spaces/forest-garden and fable-m4/versions/se-a.
 - The ᑕᐣᓯ mark + "spaces" crumb (top left). _tn/back.js wires the mark: at the room's top level it goes back to the star you
   came from in the sky; inside the gallery viewer it first closes the viewer. Esc and the browser's Back do the same.
 - The light-journey strip (light in · in · under · into the garden): the current stop is underlined; a tap glides there.
 - The tune menu (top right): Night | Red, and the dev-only A B C variant switch.
 GJ_VARIANT: v ('A'|'B'|'C'), set(v), on(fn). Stored in localStorage gj.v.spaces; ?v=A|B|C wins and is stored.
 Switching is instant and keeps the camera where it is. SHOW_VARIANTS=false hides the switch and its label for launch (A stays).
 Nothing here moves on its own; Reduce Motion changes nothing. */
(function (w) {
  'use strict';
  /* the A/B/C pill stays off. The mark's tune drawer (dev rows) is the switch. Launch is A unless ?dev=1. */
  var SHOW_VARIANTS = false;
  var KEY = 'gj.v.spaces', NOTE = { A: 'fog banks · breathing shafts', B: 'low ground mist', C: 'red plans as ink wash' };
  function lsGet(k) { try { return localStorage.getItem(k) } catch (e) { return null } }
  function lsSet(k, v) { try { localStorage.setItem(k, v) } catch (e) {} }
  function devOn() {
    var d = /(?:^|[?&])dev=([01])(?:&|$)/.exec(location.search);
    if (d) { lsSet('gj.dev', d[1]); return d[1] === '1' }
    return lsGet('gj.dev') === '1'
  }
  var q = /(?:^|[?&])v=([abcABC])(?:&|$)/.exec(location.search), v = 'A';
  if (devOn()) { var raw = (q ? q[1] : lsGet(KEY) || 'A').toUpperCase(); if (/^[ABC]$/.test(raw)) v = raw }
  else if (q) { try { var u0 = new URL(location.href); u0.searchParams.delete('v'); history.replaceState(history.state, '', u0.pathname + (u0.search || '') + u0.hash) } catch (e) {} }
  var hooks = [];
  w.GJ_VARIANT = { get v() { return v }, list: ['A', 'B', 'C'], note: NOTE, shown: SHOW_VARIANTS,
    set: function (n) { n = String(n || 'A').toUpperCase(); if (!/^[ABC]$/.test(n) || n === v) return; v = n; lsSet(KEY, v);
      try { var u = new URL(location.href); if (u.searchParams.has('v')) { u.searchParams.set('v', v); history.replaceState(history.state, '', u.pathname + u.search + u.hash) } } catch (e) {}
      hooks.forEach(function (f) { try { f(v) } catch (e) {} }); paint() },
    on: function (f) { hooks.push(f) } };
  var JOURNEY = [['lens', 'light in'], ['in', 'in'], ['under', 'under'], ['garden', 'into the garden']];
  var head, strip, menu, tuneBtn, vtag, open = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
  function build() {
    head = document.createElement('header'); head.id = 'sphead';
    head.innerHTML = '<button type="button" class="sig" lang="cr" aria-label="back to the sky">ᑕᐣᓯ</button><span class="crumb">spaces</span>' +
      '<span class="vtag" aria-hidden="true"></span>' +
      '<nav class="strip" aria-label="the light journey">' + JOURNEY.map(function (j, i) { return (i ? '<i aria-hidden="true">·</i>' : '') + '<button type="button" data-k="' + j[0] + '">' + esc(j[1]) + '</button>' }).join('') + '</nav>';
    document.body.appendChild(head); strip = head.querySelector('.strip'); vtag = head.querySelector('.vtag');
    document.documentElement.setAttribute('data-tn-room', 'spaces');
    var sig = head.querySelector('.sig'); sig.setAttribute('data-tn-mark', '');
    var tw = document.createElement('div'); tw.id = 'sptune';
    tw.innerHTML = '<button type="button" class="tg" aria-expanded="false" aria-controls="sptune-p">tune</button>' +
      '<div class="p" id="sptune-p" role="group" aria-label="tune" hidden>' +
      '<div class="row"><span>colour</span><div class="seg" role="radiogroup" aria-label="colour mode"><button type="button" role="radio" data-th="night">night</button><button type="button" role="radio" data-th="red">red</button></div></div>' +
      (SHOW_VARIANTS ? '<div class="row dev"><span>variant <em>dev</em></span><div class="seg" role="radiogroup" aria-label="variant (development)"><button type="button" role="radio" data-v="A">A</button><button type="button" role="radio" data-v="B">B</button><button type="button" role="radio" data-v="C">C</button></div></div><p class="vnote"></p>' : '') +
      '</div>';
    document.body.appendChild(tw); tuneBtn = tw.querySelector('.tg'); menu = tw.querySelector('.p');
    var stop = function (e) { e.stopPropagation() };
    [head, tw].forEach(function (el) { ['pointerdown', 'pointerup', 'touchstart', 'mousedown', 'wheel'].forEach(function (t) { el.addEventListener(t, stop, { passive: true }) }) });
    tuneBtn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!open) });
    menu.addEventListener('click', function (e) { e.stopPropagation(); var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.th && w.GJ_THEME) w.GJ_THEME.set(b.dataset.th); if (b.dataset.v) w.GJ_VARIANT.set(b.dataset.v); paint() });
    document.addEventListener('pointerdown', function (e) { if (open && !e.target.closest('#sptune')) setOpen(false) }, true);
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { e.preventDefault(); e.stopImmediatePropagation(); setOpen(false); tuneBtn.focus() } }, true);
    /* inside the gallery the mark closes the viewer (one level up). Otherwise the tap leaves, the same as every other room. The + beside the mark opens the drawer. */
    sig.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('#marktune,.mm-tune-btn')) return;
      if (w.__gal && w.__gal.isOpen) { var b = document.getElementById('gback'); if (b) { b.click(); e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); return } }
      if (w.GJ_MARKMENU && w.GJ_MARKMENU.open) { w.GJ_MARKMENU.show(false); e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); return }
    }, true);
    bindMenu();
    strip.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || !w.__se) return; var S = w.__se.SEC, i = S.STOPS.findIndex(function (s) { return s.k === b.dataset.k }); if (i >= 0) S.go(i, true) });
    if (w.GJ_THEME) w.GJ_THEME.on(paint);
    paint(); setInterval(follow, 200); applyLine(lineMode()); fadeSheets(); setTimeout(hint, 900) }
  /* the gallery sheets wait dark on their mats and fade in once decoded (the opened sheet does the same in each room's main.js) */
  function fadeSheets() {
    [].forEach.call(document.querySelectorAll('#segal .cell img'), function (img) {
      function show() { img.classList.add('in') }
      if (img.decode) img.decode().then(show, show);
      else if (img.complete) show(); else { img.addEventListener('load', show, { once: true }); img.addEventListener('error', show, { once: true }) }
    });
  }
  function setOpen(o) { open = o; menu.hidden = !o; tuneBtn.setAttribute('aria-expanded', String(o)); document.documentElement.classList.toggle('sptune-open', o) }
  var lastK = null;
  function follow() { if (!w.__se) return; var st = w.__se.st(), k = st.k; if (k === lastK) return; lastK = k;
    [].forEach.call(strip.querySelectorAll('button'), function (b) { var on = b.dataset.k === k; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current') }) }
  function paint() { if (!menu) return; var th = w.GJ_THEME ? w.GJ_THEME.pref : 'night';
    [].forEach.call(menu.querySelectorAll('[data-th]'), function (b) { b.setAttribute('aria-checked', String(b.dataset.th === th)) });
    [].forEach.call(menu.querySelectorAll('[data-v]'), function (b) { b.setAttribute('aria-checked', String(b.dataset.v === v)) });
    var n = menu.querySelector('.vnote'); if (n) n.textContent = v + ' · ' + NOTE[v];
    vtag.textContent = SHOW_VARIANTS ? v : ''; vtag.hidden = !SHOW_VARIANTS }
  /* dev row "drawings": sheet (the true drawings, the default and the only look at launch) | night line (light lines on the dark ground).
     Stored in localStorage gj.spaces.line and read only while dev is on; Red keeps its own linework either way.
     The class drives the gallery sheets (se.css); the placed plans follow through atmos.setLine, which main.js also reads from the class when the scene comes up. */
  var LINE = 'gj.spaces.line';
  function lineMode() { return devOn() && lsGet(LINE) === 'line' ? 'line' : 'sheet' }
  function applyLine(n, store) {
    n = devOn() && n === 'line' ? 'line' : 'sheet';
    if (store && devOn()) lsSet(LINE, n);
    document.documentElement.classList.toggle('se-line', n === 'line');
    var a = w.__se && w.__se.atmos; if (a && a.setLine) a.setLine(n === 'line');
  }
  /* one quiet line above Back and Next: it fades in once after the room opens and leaves after a few seconds or at the first touch, key or wheel */
  function hint() {
    if (document.getElementById('sphint')) return;
    var h = document.createElement('p'); h.id = 'sphint';
    h.textContent = 'the mark closes the sheet · next wraps to the start';
    document.body.appendChild(h);
    requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('on') }) });
    var gone = false, evs = ['pointerdown', 'wheel', 'keydown'];
    function bye() { if (gone) return; gone = true; h.classList.remove('on'); evs.forEach(function (ev) { removeEventListener(ev, bye, true) }) }
    setTimeout(bye, 4600);
    evs.forEach(function (ev) { addEventListener(ev, bye, true) });
  }
  function bindMenu() {
    if (!w.GJ_MARKMENU || bindMenu.done) return !!bindMenu.done;
    bindMenu.done = true;
    w.GJ_MARKMENU.variant('spaces', {
      k: 'gj.v.spaces', label: 'layout', dev: 1, def: 'A',
      seg: [['A', 'A · fog banks'], ['B', 'B · low ground mist'], ['C', 'C · red ink wash']],
      get: function () { return w.GJ_VARIANT.v },
      apply: function (n) { w.GJ_VARIANT.set(n) }
    });
    w.GJ_MARKMENU.variant('spaces', {
      k: LINE, label: 'drawings', dev: 1, def: 'sheet',
      seg: [['sheet', 'sheet'], ['line', 'night line']],
      get: lineMode,
      apply: function (n) { applyLine(n, true) }
    });
    return true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  var tries = 0; (function waitMenu() { if (bindMenu() || ++tries > 40) return; setTimeout(waitMenu, 50) })();
})(window);
