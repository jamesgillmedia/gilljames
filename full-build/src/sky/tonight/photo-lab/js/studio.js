/* Photo lab · clips toggle, patience hint, debug strip, free-scroll photo strip (Darkroom wall).
 Same motion with Reduce Motion on, except: the patience hint shows and hides at once,
 and clips show a poster with a play mark instead of auto-playing. */
(function(){
'use strict';
var $ = function(id){ return document.getElementById(id); };

LAB.reduced = function(){
  return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
};

/* ---------- photos in the current grid.
 Slots 60–67 are already the eight clips (kind:"clip"); the switch only filters on kind, and never adds files.
 Until Gill picks the default (off = 59 stills, or today's 67), CLIPS_DEFAULT keeps all 67 in view. */
var CLIPS_DEFAULT = true;
var CLIP_KEY = 'gj-photo-lab-clips';
var VIDEO_KEY = 'gj-photo-lab-video';
var STILLS_KEY = 'gj-photo-lab-stills';
var clipsOn = CLIPS_DEFAULT;
var videoOn = false;
var stillsOn = false;
try {
  var _cs = localStorage.getItem(CLIP_KEY);
  if (_cs === '1') clipsOn = true;
  else if (_cs === '0') clipsOn = false;
  if (localStorage.getItem(VIDEO_KEY) === '1') videoOn = true;
  if (localStorage.getItem(STILLS_KEY) === '1') stillsOn = true;
} catch(e){}
if (videoOn && stillsOn) videoOn = false; /* stills and video are separate views */
function stillsList(){ return (window.LAB_STILLS || []).slice(); }
function listPhotos(){
  if (stillsOn) return stillsList();
  var P = LAB.photos || [];
  if (videoOn) return P.filter(function(p){ return p.kind === 'clip'; });
  if (clipsOn) return P.slice();
  return P.filter(function(p){ return p.kind !== 'clip'; });
}
function syncSetButtons(){
  document.body.classList.toggle('clips-on', clipsOn);
  document.body.classList.toggle('video-on', videoOn);
  document.body.classList.toggle('stills-on', stillsOn);
  function press(sel, on){
    document.querySelectorAll(sel).forEach(function(b){
      b.classList.toggle('on', !!on);
      b.setAttribute('aria-pressed', !!on);
    });
  }
  press('[data-dbg=clips], #clips', clipsOn);
  press('[data-dbg=video], #video', videoOn);
  press('[data-dbg=stills], #stills', stillsOn);
  var clipBtns = document.querySelectorAll('#clips, [data-dbg=clips]');
  clipBtns.forEach(function(b){
    var off = videoOn || stillsOn;
    b.setAttribute('aria-disabled', off);
    if (off) b.setAttribute('title', 'clips weaves into the photo set');
    else b.removeAttribute('title');
  });
}
function notifyList(which, fromUser, msg){
  syncSetButtons();
  document.dispatchEvent(new CustomEvent('lab:list', { detail: which }));
  if (which === 'clips') document.dispatchEvent(new CustomEvent('lab:clips', { detail: clipsOn }));
  if (fromUser && msg) LAB.hint(msg, 2400);
}
LAB.clips = {
  DEFAULT: CLIPS_DEFAULT,
  on: function(){ return clipsOn; },
  list: listPhotos,
  set: function(on, fromUser){
    on = !!on;
    var prev = clipsOn;
    clipsOn = on;
    try { localStorage.setItem(CLIP_KEY, on ? '1' : '0'); } catch(e){}
    if (prev !== on) notifyList('clips', fromUser, on ? 'clips on — mixed into the same grid' : 'clips off');
    else syncSetButtons();
  }
};
LAB.videoView = {
  on: function(){ return videoOn; },
  set: function(on, fromUser){
    on = !!on;
    var prev = videoOn;
    videoOn = on;
    if (videoOn) stillsOn = false;
    try {
      localStorage.setItem(VIDEO_KEY, videoOn ? '1' : '0');
      localStorage.setItem(STILLS_KEY, stillsOn ? '1' : '0');
    } catch(e){}
    if (prev !== videoOn || (on && prev)) notifyList('video', fromUser, videoOn ? 'video — the eight clips' : 'photo view');
    else syncSetButtons();
  }
};
LAB.stills = {
  on: function(){ return stillsOn; },
  list: stillsList,
  set: function(on, fromUser){
    on = !!on;
    var prev = stillsOn;
    stillsOn = on;
    if (stillsOn) videoOn = false;
    try {
      localStorage.setItem(VIDEO_KEY, videoOn ? '1' : '0');
      localStorage.setItem(STILLS_KEY, stillsOn ? '1' : '0');
    } catch(e){}
    var n = stillsList().length;
    if (prev !== stillsOn) notifyList('stills', fromUser, stillsOn ? ('film stills — ' + n + ' frames') : 'photographs');
    else syncSetButtons();
  }
};

/* ---------- patience: the opening hint returns after the same dead-end, PATIENCE times ---------- */
var PATIENCE = 3;
(function(){
  var m = String(location.search||'').match(/[?&]patience=(\d+)/);
  if (m){ var n = +m[1]; if (n >= 1 && n <= 20) PATIENCE = n; }
})();
var deadType = '', deadN = 0, busy = 0, playing = 0, opening = {};
var hintHide;
var _hint = LAB.hint;
LAB.hint = function(t, ms, opt){
  opt = opt || {};
  var h = LAB.$('.lab-hint');
  if (!h){ h = LAB.el('div', 'lab-hint gone'); document.body.appendChild(h); }
  h.textContent = t;
  var instant = opt.instant || LAB.reduced();
  h.classList.toggle('instant', !!instant);
  void h.offsetWidth;
  h.classList.remove('gone');
  clearTimeout(hintHide);
  hintHide = setTimeout(function(){ h.classList.add('gone'); }, ms || 4200);
};
LAB.patience = {
  value: function(){ return PATIENCE; },
  set: function(n){
    n = +n; if (!isFinite(n)) return;
    PATIENCE = Math.max(1, Math.min(20, Math.round(n)));
    document.querySelectorAll('[data-dbg-patience]').forEach(function(el){
      if (el.tagName === 'INPUT' && document.activeElement !== el) el.value = String(PATIENCE);
    });
    document.querySelectorAll('[data-dbg-patience-n]').forEach(function(el){ el.textContent = String(PATIENCE); });
  },
  opening: function(room, text){ if (text) opening[room] = text; return opening[room]; },
  busy: function(on){ busy = on ? busy + 1 : Math.max(0, busy - 1); },
  playing: function(on){ playing = on ? playing + 1 : Math.max(0, playing - 1); },
  dead: function(type){
    if (busy || playing) return;
    if (!type) return;
    if (type === deadType) deadN++; else { deadType = type; deadN = 1; }
    if (deadN < PATIENCE) return;
    deadN = 0;
    var room = (LAB.rooms && LAB.rooms.current) || 'horizon';
    var t = opening[room] || opening.horizon;
    if (t) LAB.hint(t, 5600, { instant: LAB.reduced() });
  },
  success: function(){
    deadType = ''; deadN = 0;
    var h = LAB.$('.lab-hint');
    if (h && !h.classList.contains('gone')){
      if (LAB.reduced()) h.classList.add('instant');
      h.classList.add('gone');
    }
  }
};

/* ---------- photo strip (Darkroom wall): free native scroll, the same as the original day view ( .dsc):
 vertical, natural momentum, no snap, no wheel handler. ---------- */
LAB.mountStrip = function(el, opts){
  opts = opts || {};
  var idx = 0, zoom = 1, zx = 0, zy = 0, wcool = 0, edge = 0, touchD = 0;
  function list(){ return (opts.list && opts.list()) || []; }
  function laidX(){ return false; }
  function layout(){
    el.classList.toggle('x', laidX());
    go(idx, true, false);
  }
  function pageAt(i){ return el.children[i]; }
  function mediaOf(page){ return page && page.querySelector('img, video'); }
  function applyZoom(){
    var im = mediaOf(pageAt(idx));
    if (!im) return;
    im.style.transition = zoom === 1 ? 'transform .4s cubic-bezier(.22,.61,.36,1)' : 'none';
    im.style.transform = 'translate(' + zx + 'px,' + zy + 'px) scale(' + zoom + ')';
    el.classList.toggle('zoomed', zoom > 1);
  }
  function lock(on){
    el.style.overflow = on ? 'hidden' : '';
    el.classList.toggle('zoomed', !!on);
  }
  function go(i, instant, fromUser){
    var L = list();
    if (i < 0){ if (fromUser) LAB.patience.dead('photo-start'); return false; }
    if (i >= L.length){ if (fromUser) LAB.patience.dead('photo-end'); return false; }
    if (zoom > 1){ zoom = 1; zx = zy = 0; lock(false); applyZoom(); }
    idx = i;
    var p = pageAt(i);
    if (!p) return false;
    function scrollNow(){
      var beh = instant ? 'auto' : 'smooth';
      if (laidX()) el.scrollTo({ left: p.offsetLeft, behavior: beh });
      else el.scrollTo({ top: p.offsetTop, behavior: beh });
    }
    scrollNow();
    if (i > 0 && (laidX() ? p.offsetLeft : p.offsetTop) === 0){
      requestAnimationFrame(function(){ requestAnimationFrame(scrollNow); });
    }
    if (opts.onChange) opts.onChange(i, L[i]);
    armVisible();
    return true;
  }
  function armVisible(){
    var L = list();
    for (var i = 0; i < el.children.length; i++){
      var v = el.children[i].querySelector('video');
      if (!v) continue;
      if (i === idx && !LAB.reduced()) LAB.arm(v);
      else if (i !== idx) LAB.rest(v);
    }
    if (opts.onArm) opts.onArm(idx, L[idx]);
  }
  function syncFromScroll(){
    var L = list(); if (!L.length) return;
    var x = laidX(), mark = x ? el.scrollLeft : el.scrollTop, best = 0, bd = 1e9;
    for (var i = 0; i < el.children.length; i++){
      var p = el.children[i], d = Math.abs((x ? p.offsetLeft : p.offsetTop) - mark);
      if (d < bd){ bd = d; best = i; }
    }
    if (x) edge = el.scrollLeft <= 1 ? -1 : (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 ? 1 : 0);
    else edge = el.scrollTop <= 1 ? -1 : (el.scrollTop >= el.scrollHeight - el.clientHeight - 1 ? 1 : 0);
    if (best !== idx){
      idx = best;
      LAB.patience.success();
      if (opts.onChange) opts.onChange(idx, L[idx]);
      armVisible();
    }
  }
  var st = 0;
  el.addEventListener('scroll', function(){
    syncFromScroll();
    clearTimeout(st);
    st = setTimeout(syncFromScroll, 80);
  }, { passive: true });
  el.addEventListener('scrollend', syncFromScroll);

  el.addEventListener('wheel', function(e){
    if (zoom > 1){ e.preventDefault(); return; }
  }, { passive: false });

  el.addEventListener('touchstart', function(e){
    if (e.touches.length !== 1) return;
    touchD = 0;
  }, { passive: true });
  el.addEventListener('touchmove', function(e){
    if (e.touches.length !== 1 || zoom > 1) return;
    /* only note direction at the edge; scrolling itself stays native */
  }, { passive: true });
  el.addEventListener('touchend', function(){
    /* a flick past the first or last photo is a dead-end */
    if (zoom > 1) return;
  }, { passive: true });

  /* pinch-zoom the standing photograph; at rest, spreading still leaves the view */
  LAB.pinch(el, {
    start: function(){ LAB.patience.busy(true); },
    in: function(){
      LAB.patience.busy(false);
      if (opts.onIn){ opts.onIn(); return; }
      if (zoom <= 1){ zoom = 2.2; zx = zy = 0; lock(true); applyZoom(); }
      else { zoom = Math.min(3.2, zoom + 0.6); applyZoom(); }
    },
    out: function(){
      LAB.patience.busy(false);
      if (zoom > 1){ zoom = 1; zx = zy = 0; lock(false); applyZoom(); }
      else if (opts.onOut) opts.onOut();
    }
  });

  var pan = null;
  el.addEventListener('pointerdown', function(e){
    if (zoom <= 1) return;
    pan = { x: e.clientX, y: e.clientY, zx: zx, zy: zy, id: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch(err){}
  });
  el.addEventListener('pointermove', function(e){
    if (!pan || e.pointerId !== pan.id) return;
    zx = pan.zx + (e.clientX - pan.x);
    zy = pan.zy + (e.clientY - pan.y);
    applyZoom();
  });
  function endPan(){ pan = null; }
  el.addEventListener('pointerup', endPan);
  el.addEventListener('pointercancel', endPan);

  function fill(){
    var L = list();
    if (el._park) {
      /* videos parked by caller */
    }
    el.innerHTML = '';
    L.forEach(function(p, i){
      var pg = LAB.el('article', 'page');
      pg.dataset.i = i;
      pg.setAttribute('aria-label', 'photograph ' + LAB.num(p));
      if (opts.page) opts.page(pg, p, i);
      else defaultPage(pg, p);
      el.appendChild(pg);
    });
    layout();
    armVisible();
  }
  function defaultPage(pg, p){
    var reduced = LAB.reduced();
    if (LAB.isClip(p) && !reduced){
      var v = LAB.video(p, null, { lazy: true, preload: 'none', poster: LAB.img(p), label: 'frame ' + LAB.num(p) });
      pg.appendChild(v);
    } else {
      var im = new Image();
      im.alt = 'photograph ' + LAB.num(p);
      im.decoding = 'async';
      im.src = LAB.img(p);
      pg.appendChild(im);
      if (LAB.isClip(p) && reduced){
        var b = LAB.el('button', 'play-aff');
        b.type = 'button';
        b.setAttribute('aria-label', 'play');
        b.textContent = '▶';
        b.addEventListener('click', function(e){
          e.stopPropagation();
          var v = LAB.video(p, LAB.clip(p), { auto: true, preload: 'metadata', poster: LAB.img(p), label: 'frame ' + LAB.num(p) });
          im.replaceWith(v);
          b.remove();
          LAB.arm(v);
        });
        pg.appendChild(b);
      }
    }
    var cap = LAB.el('div', 'pcred');
    var title = p.title ? String(p.title).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
    cap.innerHTML = (title ? title + ' · ' : '') + 'frame <b>' + LAB.num(p) + '</b> of ' + list().length;
    pg.appendChild(cap);
  }
  function key(dir){
    if (go(idx + dir, false, true)) LAB.patience.success();
  }
  addEventListener('resize', function(){ if (el.isConnected) layout(); });
  return {
    fill: fill, go: go, layout: layout, key: key,
    index: function(){ return idx; },
    current: function(){ return list()[idx]; },
    resetZoom: function(){ zoom = 1; zx = zy = 0; lock(false); applyZoom(); }
  };
};

/* ---------- debug strip (?debug=1 only) ---------- */
LAB.debugOn = /(?:^|[?&])debug=1(?:&|$)/.test(location.search || '');
function buildDebug(){
  if (!LAB.debugOn) return;
  document.documentElement.classList.add('debug');
  document.body.classList.add('debug');
  var bar = LAB.el('div', 'dbg');
  bar.id = 'dbg';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'debug');
  bar.innerHTML =
    '<span class="dbg-tag ju">debug</span>' +
    '<button type="button" class="dbg-sw" data-dbg="safe" aria-pressed="false">safelight</button>' +
    '<label class="dbg-amb" for="dbg-amb"><span class="dbg-k">room light</span>' +
    '<input type="range" id="dbg-amb" min="28" max="130" value="100" step="1" aria-label="room light"></label>' +
    '<button type="button" class="dbg-sw" data-dbg="clips" aria-pressed="false">clips</button>' +
    '<button type="button" class="dbg-sw" data-dbg="video" aria-pressed="false">video</button>' +
    '<button type="button" class="dbg-sw" data-dbg="stills" aria-pressed="false">stills</button>' +
    '<label class="dbg-pat"><span class="dbg-k">patience</span>' +
    '<input type="range" data-dbg-patience min="1" max="8" step="1" aria-label="patience threshold">' +
    '<span class="dbg-n" data-dbg-patience-n></span></label>' +
    '<button type="button" class="dbg-sw" data-dbg="sort" id="dbg-sort">by light</button>';
  document.body.appendChild(bar);
  function syncSafe(){
    var on = LAB.safelight && LAB.safelight.on();
    bar.querySelector('[data-dbg=safe]').classList.toggle('on', !!on);
    bar.querySelector('[data-dbg=safe]').setAttribute('aria-pressed', !!on);
  }
  bar.querySelector('[data-dbg=safe]').addEventListener('click', function(){
    if (LAB.safelight) LAB.safelight.set(!LAB.safelight.on());
    syncSafe();
  });
  var amb = bar.querySelector('#dbg-amb');
  function syncAmb(){
    if (LAB.ambient && document.activeElement !== amb) amb.value = String(Math.round(LAB.ambient.get() * 100));
  }
  amb.addEventListener('input', function(){ if (LAB.ambient) LAB.ambient.set((+amb.value) / 100, true); });
  var sl = document.getElementById('amb');
  if (sl) sl.addEventListener('input', syncAmb);
  bar.querySelector('[data-dbg=clips]').addEventListener('click', function(){
    if (LAB.videoView.on() || LAB.stills.on()) return;
    LAB.clips.set(!LAB.clips.on(), true);
  });
  bar.querySelector('[data-dbg=video]').addEventListener('click', function(){
    LAB.videoView.set(!LAB.videoView.on(), true);
  });
  bar.querySelector('[data-dbg=stills]').addEventListener('click', function(){
    LAB.stills.set(!LAB.stills.on(), true);
  });
  var pat = bar.querySelector('[data-dbg-patience]');
  pat.value = String(PATIENCE);
  bar.querySelector('[data-dbg-patience-n]').textContent = String(PATIENCE);
  pat.addEventListener('input', function(){ LAB.patience.set(pat.value); });
  var sortB = document.getElementById('sort');
  var dbgSort = bar.querySelector('[data-dbg=sort]');
  function syncSort(){
    if (sortB) dbgSort.textContent = sortB.textContent;
  }
  dbgSort.addEventListener('click', function(){ if (sortB) sortB.click(); setTimeout(syncSort, 0); });
  if (sortB) sortB.addEventListener('click', function(){ setTimeout(syncSort, 0); });
  LAB.clips.set(clipsOn);
  LAB.patience.set(PATIENCE);
  setTimeout(function(){ syncSafe(); syncAmb(); syncSort(); }, 0);
  document.addEventListener('lab:layer', function(){ syncSafe(); syncSort(); });
}

document.addEventListener('DOMContentLoaded', function(){});
/* init once other lab controls exist: this script is after lab.js, buttons may already be in the DOM */
(function init(){
  var b = $('clips');
  if (b) b.addEventListener('click', function(){
    if (LAB.videoView.on() || LAB.stills.on()) return;
    LAB.clips.set(!LAB.clips.on(), true);
  });
  var v = $('video');
  if (v) v.addEventListener('click', function(){ LAB.videoView.set(!LAB.videoView.on(), true); });
  var s = $('stills');
  if (s) s.addEventListener('click', function(){ LAB.stills.set(!LAB.stills.on(), true); });
  LAB.clips.set(clipsOn);
  if (stillsOn) LAB.stills.set(true);
  else if (videoOn) LAB.videoView.set(true);
  else syncSetButtons();
  buildDebug();
  function sizeDebug(){
    var bar = document.getElementById('dbg');
    if (!bar) return;
    document.documentElement.style.setProperty('--dbg-h', bar.offsetHeight + 'px');
  }
  sizeDebug();
  addEventListener('resize', sizeDebug);
  if (window.ResizeObserver && document.getElementById('dbg')) new ResizeObserver(sizeDebug).observe(document.getElementById('dbg'));
})();
})();
