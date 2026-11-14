/* Beyond, for the archive index (port of tonight/fable-m4 js/beyond.js, preview-beyond). Selection only: no filter, tint, brightness or contrast is ever applied to a frame.
   The archive has no metadata file, so the index is measured here from the film atlases (display-encoded pixels, Rec.709 luminance, saturation-weighted hue,
   chroma, warmth). Modes: off / red (the darkest warm frames) / colour (a hue family) / light (a light level); turning within a mode sweeps it.
   Active, the field is laid out continuously in rank order (best match first) and the swap travels on the site spring.
   Only the big Beyond dial is ported (outer ring: the step, inner ring: the sweep). No depth, drift, easing or orbit dials in the archive.
   Steps: off / red (the darkest warm frames) / the hue families orange, amber, green, teal, blue, violet / mono (neutral frames) / light. A hue family or mono
   gathers its best frames into a calm gallery panel at the head of the field; the rest keep their rank order below it. */
(function (w) {
  'use strict';
  var KEY = 'gj.beyond.archive', MODES = ['off', 'red', 'orange', 'amber', 'green', 'teal', 'blue', 'violet', 'mono', 'light'];
  /* hue families: centre and half-width in degrees (the per-frame dominant hue index), and the colour the dial ring carries at that step */
  var FAM = { orange: { c: 28, w: 26, col: [255, 138, 52] }, amber: { c: 52, w: 24, col: [250, 196, 70] }, green: { c: 115, w: 55, col: [92, 196, 110] }, teal: { c: 186, w: 28, col: [60, 190, 190] }, blue: { c: 228, w: 38, col: [80, 140, 255] }, violet: { c: 290, w: 55, col: [160, 110, 240] } };
  var STEPCOL = { off: [232, 228, 220], red: [238, 54, 70], orange: FAM.orange.col, amber: FAM.amber.col, green: FAM.green.col, teal: FAM.teal.col, blue: FAM.blue.col, violet: FAM.violet.col, mono: [168, 170, 176], light: [250, 250, 246] };
  var HUES = [[345, 'rose'], [15, 'red'], [45, 'amber'], [70, 'gold'], [165, 'green'], [200, 'teal'], [255, 'blue'], [300, 'violet']];
  var DEF = { mode: 'off', red: .7, orange: .5, amber: .5, green: .5, teal: .5, blue: .5, violet: .5, mono: .5, light: .5 };
  var W_GLIDE = 14;   // calm: quick and critically damped
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, u) { return a + (b - a) * u; }
  var RMQ = matchMedia('(prefers-reduced-motion: reduce)');

  var ST = {}; (function () {
    var k; for (k in DEF) ST[k] = DEF[k];
    var raw = null; try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (raw) for (k in DEF) { if (k === 'mode') { if (typeof raw.mode === 'string') ST.mode = raw.mode; } else if (raw[k] != null && isFinite(+raw[k])) ST[k] = +raw[k]; }
    var q = new URLSearchParams(location.search), b = q.get('beyond');
    if (b && MODES.indexOf(b) >= 0) { ST.mode = b; var bv = parseFloat(q.get('bv')); if (isFinite(bv) && b !== 'off') ST[b] = clamp(bv, 0, 1); }
    if (MODES.indexOf(ST.mode) < 0) ST.mode = 'off';
    MODES.forEach(function (n) { if (n !== 'off') ST[n] = clamp(+ST[n], 0, 1); });
  })();
  var subs = [], rev = 0;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }
  function emit(sel) { subs.forEach(function (f) { try { f(ST, sel); } catch (e) {} }); }

  /* ---------- the index, measured from the atlases ---------- */
  var M = [], ready = false, F = null, films = null, loading = false, NN = 0;   // NN: the stills (film clips are appended after them and are not measured here)
  function pct(sorted, v) { var lo = 0, hi = sorted.length; while (lo < hi) { var m = (lo + hi) >> 1; if (sorted[m] < v) lo = m + 1; else hi = m; } return sorted.length > 1 ? lo / (sorted.length - 1) : 0; }
  function measure(im, a, j, g, cv, cx) {
    var cw = a.cw, ch = a.ch, sx = (j % a.cols) * cw, sy = ((j / a.cols) | 0) * ch, W = 12, H = 7;
    cx.drawImage(im, sx, sy, cw, ch, 0, 0, W, H);
    var d = cx.getImageData(0, 0, W, H).data, n = W * H, i, r = 0, gg = 0, b = 0, lum = 0, chroma = 0, hist = new Float32Array(36);
    for (i = 0; i < n; i++) {
      var R = d[i * 4], G = d[i * 4 + 1], B = d[i * 4 + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      r += R; gg += G; b += B; lum += (.2126 * R + .7152 * G + .0722 * B) / 255; chroma += (mx - mn) / 255;
      if (mx > 0 && mx !== mn) { var h, dd = mx - mn; if (mx === R) h = ((G - B) / dd + 6) % 6; else if (mx === G) h = (B - R) / dd + 2; else h = (R - G) / dd + 4; h *= 60; hist[Math.min(35, (h / 10) | 0)] += (dd / mx) * (mx / 255); }
    }
    var bi = 0; for (i = 1; i < 36; i++) if (hist[i] > hist[bi]) bi = i;
    r /= n; b /= n;
    M[g] = { lum: lum / n, hue: bi * 10 + 5, chroma: chroma / n, warm: (r + b) ? (r - b) / (r + b) : 0 };
  }
  function attach(o) {
    if (loading) return; loading = true; films = o.films; F = o.F; NN = o.n || F.length;
    var cv = document.createElement('canvas'); cv.width = 12; cv.height = 7; var cx = cv.getContext('2d', { willReadFrequently: true }); cx.imageSmoothingQuality = 'high';
    var k = 0;
    (function next() {
      if (k >= films.length) { finish(); return; }
      var f = films[k++], im = new Image(); im.decoding = 'async'; im.crossOrigin = 'anonymous';   // pixels are read back: a CDN that redirects large files must allow it
      im.onload = function () { try { f.frames.forEach(function (x) { measure(im, f.atlas, x.j, x.g, cv, cx); }); } catch (e) {} setTimeout(next, 0); };
      im.onerror = function () { setTimeout(next, 0); };
      im.src = f.atlas.src;
    })();
  }
  var LP = [], WP = [];
  function finish() {
    var l = [], wv = [], g; for (g = 0; g < NN; g++) if (M[g]) { l.push(M[g].lum); wv.push(M[g].warm); }
    l.sort(function (a, b) { return a - b; }); wv.sort(function (a, b) { return a - b; });
    for (g = 0; g < NN; g++) if (M[g]) { M[g].lp = pct(l, M[g].lum); M[g].wp = pct(wv, M[g].warm); }
    var n = 0; for (g = 0; g < NN; g++) if (M[g]) n++;
    if (n < NN * .5) { try { console.warn('beyond: could not measure the atlases (' + n + '/' + NN + ')'); } catch (e) {} return; }   // nothing to select from: Beyond stays inactive
    ready = true; rev++; emit('index');
  }
  function angDist(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
  function hueName(deg) { var best = HUES[0][1], bd = 1e9; HUES.forEach(function (h) { var d = angDist(deg, h[0]); if (d < bd) { bd = d; best = h[1]; } }); return best; }
  function hueDeg(v) { return v * 340; }
  function hueSwing(f) { return (ST[ST.mode] - .5) * f.w * 1.2; }
  function label() {
    var v = ST[ST.mode];
    if (ST.mode === 'off') return 'off';
    if (ST.mode === 'red') return 'red \u00b7 ' + Math.round(v * 100);
    if (ST.mode === 'light') return 'light \u00b7 ' + Math.round(v * 100);
    if (ST.mode === 'mono') return 'colour \u00b7 mono';
    return 'colour \u00b7 ' + ST.mode;
  }
  function score(m) {
    if (!m || m.lp == null) return 0;
    var s, f = FAM[ST.mode];
    if (ST.mode === 'red') {
      var tl = lerp(.5, .02, ST.red), dk = 1 - Math.min(1, Math.abs(m.lp - tl) / .5);
      var rb = clamp(1 - angDist(m.hue, 12) / 55, 0, 1) * clamp(m.chroma / .08, 0, 1);
      var wm = clamp((m.warm + .04) / .4, 0, 1) * (.55 + .45 * rb);
      s = .58 * dk + .42 * wm;
    } else if (f) {
      var gate = clamp(m.chroma / .1, 0, 1), match = clamp(1 - angDist(m.hue, f.c + hueSwing(f)) / f.w, 0, 1);
      s = match * (.2 + .8 * gate) + .03 * gate;
    } else if (ST.mode === 'mono') {
      s = (1 - clamp(m.chroma / .07, 0, 1)) * (1 - clamp(Math.abs(m.lp - ST.mono) * 1.5, 0, 1) * .6);
    } else if (ST.mode === 'light') s = clamp(1 - Math.abs(m.lp - ST.light) * 1.7, 0, 1);
    else s = 0;
    if (m.lum < .035 || m.lum > .93) s *= .35;
    return s;
  }
  function active() { return ST.mode !== 'off' && ready; }
  /* every frame, best match first (stable); null when Beyond is off */
  var galN = 0;
  /* every frame, best match first (stable); null when Beyond is off. A colour step also fixes how many lead as the gallery. */
  function order() {
    galN = 0;
    if (!active()) return null;
    var rows = new Array(NN), g;
    for (g = 0; g < NN; g++) rows[g] = { g: g, s: score(M[g]) };
    rows.sort(function (a, b) { return b.s - a.s || a.g - b.g; });
    if (FAM[ST.mode] || ST.mode === 'mono') { var n = 0; while (n < rows.length && rows[n].s >= .5) n++; galN = clamp(n, Math.min(12, NN), Math.min(48, NN)); }
    return rows.map(function (r) { return r.g; });
  }
  function set(patch) {
    var k, v, sel = false, any = false;
    for (k in patch) {
      v = patch[k];
      if (k === 'mode') { if (MODES.indexOf(v) < 0 || v === ST.mode) continue; ST.mode = v; sel = true; any = true; continue; }
      if (MODES.indexOf(k) > 0) v = clamp(+v, 0, 1);
      else continue;
      if (ST[k] === v) continue; ST[k] = v; any = true; if (k === ST.mode) sel = true;
    }
    if (any) { save(); emit(sel); }
  }
  w.GJ_BEYOND = {
    get state() { return ST; }, get rev() { return rev; }, get active() { return active(); }, get ready() { return ready; }, get label() { return label(); },
    MODES: MODES, FAM: FAM, STEPCOL: STEPCOL, get gallery() { return galN; }, set: set, on: function (f) { subs.push(f); }, attach: attach, order: order, meta: function (g) { return M[g]; },
    cam: function () { return { w: W_GLIDE, instant: RMQ.matches }; }
  };
})(window);
