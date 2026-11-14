/* Face focal points for studio shots. Non-destructive: cover/draw and object-position
 use a per-file x,y (0–1). Session overrides (debug faces section) never write to the site. */
(function () {
  function base(u) {
    u = String(u || '');
    var q = u.split('?')[0], h = q.split('#')[0];
    return h.slice(h.lastIndexOf('/') + 1);
  }
  var DEFAULTS = {
  };
  var KEY = 'gj-m4-faces';
  var over = {};
  try {
    var raw = sessionStorage.getItem(KEY);
    if (raw) over = JSON.parse(raw) || {};
  } catch (e) { over = {}; }
  function persist() {
    try { sessionStorage.setItem(KEY, JSON.stringify(over)); } catch (e) {}
  }
  function of(src) {
    var k = base(src);
    if (!k) return null;
    var o = over[k] || DEFAULTS[k];
    if (!o) return null;
    return { x: +o.x, y: +o.y, file: k };
  }
  function set(src, x, y) {
    var k = base(src);
    if (!k) return null;
    x = Math.max(0, Math.min(1, +x));
    y = Math.max(0, Math.min(1, +y));
    over[k] = { x: x, y: y };
    persist();
    return { x: x, y: y, file: k };
  }
  function reset() {
    over = {};
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }
  function values() {
    var out = {}, k;
    for (k in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) out[k] = { x: DEFAULTS[k].x, y: DEFAULTS[k].y };
    for (k in over) if (Object.prototype.hasOwnProperty.call(over, k)) out[k] = { x: +over[k].x, y: +over[k].y };
    return out;
  }
  function coverDest(iw, ih, x, y, w, h, fx, fy) {
    var s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    var dx = x + w / 2 - fx * dw, dy = y + h / 2 - fy * dh;
    dx = Math.min(x, Math.max(x + w - dw, dx));
    dy = Math.min(y, Math.max(y + h - dh, dy));
    return { dx: dx, dy: dy, dw: dw, dh: dh, s: s };
  }
  function objectPosition(iw, ih, bw, bh, fx, fy) {
    if (!iw || !ih || !bw || !bh) return (fx * 100).toFixed(2) + '% ' + (fy * 100).toFixed(2) + '%';
    var d = coverDest(iw, ih, 0, 0, bw, bh, fx, fy);
    var px = (bw - d.dw) ? (d.dx / (bw - d.dw)) * 100 : 50;
    var py = (bh - d.dh) ? (d.dy / (bh - d.dh)) * 100 : 50;
    return px.toFixed(2) + '% ' + py.toFixed(2) + '%';
  }
  function srcOf(el) {
    if (!el) return '';
    return el.currentSrc || el.getAttribute('src') || el.getAttribute('poster') || '';
  }
  function applyTo(img) {
    if (!img || !img.getAttribute) return;
    var src = srcOf(img);
    var f = of(src);
    if (!f) return;
    function pos() {
      if (img._gjFaceDrag) return;
      var bw = img.clientWidth, bh = img.clientHeight;
      var iw = img.naturalWidth || img.videoWidth, ih = img.naturalHeight || img.videoHeight;
      img.style.objectPosition = objectPosition(iw, ih, bw, bh, f.x, f.y);
      img.style.transformOrigin = (f.x * 100).toFixed(2) + '% ' + (f.y * 100).toFixed(2) + '%';
    }
    f = of(src);
    if (img.complete === false || ((img.tagName === 'IMG') && !img.naturalWidth)) img.addEventListener('load', function () { f = of(srcOf(img)); pos(); });
    else if (img.tagName === 'VIDEO' && !img.videoWidth) img.addEventListener('loadedmetadata', function () { f = of(srcOf(img)); pos(); });
    else pos();
  }
  function apply(root) {
    var el = root || document;
    var nodes = el.querySelectorAll ? el.querySelectorAll('img,video') : [];
    for (var i = 0; i < nodes.length; i++) applyTo(nodes[i]);
  }
  var marks = [];
  var show = false;
  function beginFrame() { marks = []; }
  function toScreen(x, y) {
    var sc = 1, og = { x: 0, y: 0 };
    try {
      if (window.GJ_DEPTH) {
        sc = GJ_DEPTH.viewScale() || 1;
        og = GJ_DEPTH.origin() || og;
      }
    } catch (e) {}
    if (sc !== 1) return { x: og.x + (x - og.x) * sc, y: og.y + (y - og.y) * sc };
    return { x: x, y: y };
  }
  function record(src, boxX, boxY, dx, dy, dw, dh, fx, fy) {
    if (!show) return;
    var p = toScreen(dx + fx * dw, dy + fy * dh);
    marks.push({
      src: src, file: base(src),
      dx: dx, dy: dy, dw: dw, dh: dh, fx: fx, fy: fy,
      mx: p.x, my: p.y, kind: 'canvas'
    });
  }
  function watch() {
    function go() { apply(document); }
    window.addEventListener('resize', go);
    var layer = document.getElementById('layer');
    if (layer && window.MutationObserver) {
      new MutationObserver(function () { go(); }).observe(layer, { childList: true, subtree: true });
    }
    go();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();

  window.GJ_FACES = {
    of: of, set: set, reset: reset, values: values,
    defaults: function () { return DEFAULTS; },
    base: base, coverDest: coverDest, objectPosition: objectPosition,
    srcOf: srcOf, applyTo: applyTo, apply: apply,
    beginFrame: beginFrame, record: record, toScreen: toScreen,
    marks: function () { return marks; },
    showing: function () { return show; },
    setShow: function (v) { show = !!v; if (!show) beginFrame(); }
  };
})();
