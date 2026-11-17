/* archive index · search (Pack 1116 §5). The field in the top bar and the GJ_SEARCH module archive.js already listens for.
   What archive.js expects (its hooks, unchanged): GJ_SEARCH.active / caption / total / pool / gallery / order(); onData(cb) with the tag file;
   on(cb) on every change; a "searchlayout" event carrying the height reserved above the gallery; film clips that exist only inside results.
   The words come from data/light-tags.json: a film's title, year and credit, and the draft light, colour and motion tags of each frame.
   Frames the tag file excludes are never results. Nothing here touches a pixel of a frame. */
(function (w, d) {
  'use strict';
  var recs = [], data = null, dataCbs = [], subs = [], q = '', toks = [], hits = [], pool = 0, GAL = 240, input, box, clearB, countE, t0 = 0;
  function norm(s) { return String(s == null ? '' : s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['‘’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function words(r) {
    var t = r.tags || {}, a = [r.title, r.film, r.year, r.credit].concat(t.light || [], t.colour || [], t.motion || []);
    if (t.layers && t.layers.has) a.push('layers', t.layers.note);
    a.push(r.kind === 'video' ? 'clip clips film clip video moving' : 'still stills frame');
    return norm(a.join(' ')).split(' ');
  }
  /* every word of the search must begin a word of the frame: "cand" finds candlelight, "bmw blue" finds blue frames of the BMW films */
  function match(r) { for (var i = 0; i < toks.length; i++) { var k = toks[i], ok = false; for (var j = 0; j < r._w.length; j++) if (r._w[j].lastIndexOf(k, 0) === 0) { ok = true; break; } if (!ok) return false; } return true; }
  function run() {
    toks = norm(q).split(' ').filter(Boolean); hits = [];
    if (toks.length && recs.length) for (var i = 0; i < recs.length; i++) if (recs[i].g != null && match(recs[i])) hits.push(recs[i]);
    hits.sort(function (a, b) { return (a.kind === 'video' ? 0 : 1) - (b.kind === 'video' ? 0 : 1) || a.g - b.g; });   // a film's clip leads, then frames in field order
    paint(); layoutEvt(); for (var s = 0; s < subs.length; s++) try { subs[s](api); } catch (e) {}
  }
  function order() {
    if (!api.active) return null;
    var seen = {}, out = [], i; for (i = 0; i < hits.length; i++) { out.push(hits[i].g); seen[hits[i].g] = 1; }
    for (i = 0; i < recs.length; i++) { var r = recs[i]; if (r.kind !== 'video' && r.g != null && !seen[r.g]) out.push(r.g); }   // the rest of the field follows below the results; clips that did not match stay away
    return out;
  }
  var api = {
    get active() { return toks.length > 0 && hits.length > 0; }, get caption() { return q.trim().toLowerCase(); }, get total() { return hits.length; }, get pool() { return pool; },
    get gallery() { return Math.min(hits.length, GAL); }, get query() { return q; }, get ready() { return !!data; },
    order: order, onData: function (f) { dataCbs.push(f); if (data) { f(data); run(); } }, on: function (f) { subs.push(f); },
    ids: function () { return hits.map(function (r) { return r.id; }); },
    set: function (v) { v = String(v || ''); if (input && input.value !== v) input.value = v; if (v === q) return; q = v; run(); }, clear: function () { api.set(''); }
  };
  w.GJ_SEARCH = api;
  function paint() {
    if (!box) return; var on = toks.length > 0;
    box.classList.toggle('on', on); box.classList.toggle('none', on && !!data && !hits.length);
    var top = d.querySelector('.top'); if (top) top.classList.toggle('sq-wide', on || d.activeElement === input);   // on a phone the field borrows the title's room while it is in use
    clearB.hidden = !on; countE.textContent = on && data ? hits.length.toLocaleString('en-US') : '';
    countE.setAttribute('aria-label', on && data ? hits.length + (hits.length === 1 ? ' result' : ' results') : '');
  }
  /* the field lives inside the top bar, so it needs no room of its own. What the results need is to clear the site's pills (the Mark, tune, the red dot),
     which float just under the bar: on a narrow screen a results table spans the full width and its first row would sit under them. */
  var lastH = -1;
  function layoutEvt() {
    var h = 0; if (api.active && w.innerWidth < 1000) { var pill = d.getElementById('gj-back'), top = d.querySelector('.top'); if (pill && top) h = Math.max(0, Math.round(pill.getBoundingClientRect().bottom - top.getBoundingClientRect().bottom + 2)); }
    if (h === lastH) return; lastH = h; try { w.dispatchEvent(new CustomEvent('searchlayout', { detail: { h: h } })); } catch (e) {}
  }
  function ui() {
    box = d.getElementById('search'); if (!box) return; input = d.getElementById('sq'); clearB = d.getElementById('sqx'); countE = d.getElementById('sqn');
    input.addEventListener('input', function () { clearTimeout(t0); var v = input.value; t0 = setTimeout(function () { q = v; run(); }, 140); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') return; e.stopPropagation();          // typing must not drive the field, and Escape here must not leave the room
      if (e.key === 'Escape') { e.preventDefault(); if (input.value) { clearTimeout(t0); api.set(''); } else input.blur(); }
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(t0); q = input.value; run(); input.blur(); }
    });
    ['keyup', 'keypress', 'pointerdown', 'touchstart', 'wheel'].forEach(function (n) { box.addEventListener(n, function (e) { e.stopPropagation(); }, { passive: true }); });
    box.addEventListener('submit', function (e) { e.preventDefault(); });
    input.addEventListener('focus', paint); input.addEventListener('blur', function () { setTimeout(paint, 0); });
    clearB.addEventListener('click', function () { clearTimeout(t0); api.set(''); input.focus(); });
    paint(); layoutEvt(); w.addEventListener('resize', layoutEvt);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ui); else ui();
  fetch('data/light-tags.json').then(function (r) { return r.json(); }).then(function (j) {
    /* the tag file was drafted beside another build: its clip paths point at "../u3/". In this tree the same clips live in the m4 sky. */
    j.records.forEach(function (r) { if (r.kind === 'video' && r.src.indexOf('../u3/') === 0) r.src = '../player/tonight/fable-m4/' + r.src.slice(6); r._w = words(r); });
    recs = j.records; pool = recs.length; data = j;
    for (var i = 0; i < dataCbs.length; i++) try { dataCbs[i](j); } catch (e) {}
    run();
  }).catch(function () { if (box) box.hidden = true; });
})(window, document);
