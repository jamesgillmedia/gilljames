/* Studio board colour mode: Night (default) · Red. The same model as gill-sky's tonight/fable-m4/js/theme.js.
   State: localStorage "gj.theme" = night|red (also ?theme=night|red), html[data-theme="red"|"night"], <meta name="theme-color"> #000 in Red.
   Night is the board as written: nothing here touches a colour.
   Red recolours by MAPPING, not by patching elements: every colour in every stylesheet, and every colour the canvas code sets,
   becomes the same light on a red ink (same luminance, same alpha), so the whole board inherits it and no white is left.
   Black stays black; only elements give light. Photographs, posters, film frames and video are never touched (images are not colours).
   Runs from the end of <head> so the stylesheets are in and Red is on before first paint.
   GJ_THEME: pref, set('night'|'red'), toggle(), map(str), on(fn). A 'gj-theme' event fires on window after every change.
   The dot (bottom left, one tap) toggles. Other tabs and pages on the same origin follow through the storage event. */
(function (w, d) {
  'use strict';
  var KEY = 'gj.theme', root = d.documentElement, RED = [255, 68, 87];
  var RAW = false, pref = 'night', eff = 'night', hooks = [], built = false, sheet = null, btn = null, tc = null;

  function lsGet() { try { return localStorage.getItem(KEY) } catch (e) { return null } }
  function lsSet(v) { try { localStorage.setItem(KEY, v) } catch (e) {} }
  (function () {
    var q = /(?:^|[?&])theme=(night|red)(?:&|$)/.exec(location.search), v = q ? q[1] : lsGet();
    if (q) lsSet(q[1]);
    pref = v === 'red' ? 'red' : 'night'; eff = pref;
  })();

  /* Night's dark ground maps to true black, mid tones stay moderate (lines, panels), and anything light enough to be text (Y >= .5)
     is lifted to 84-100% of the ink, which keeps small type readable (red ink at 84% is 4.5:1 on black). */
  function mapRGB(r, g, b) {
    var Y = (.2126 * r + .7152 * g + .0722 * b) / 255, k;
    if (Y >= .5) k = .84 + .16 * (Y - .5) / .5;
    else if (Y >= .12) { var u = (Y - .12) / .38; k = .1 + .74 * u * u * (3 - 2 * u) }
    else k = .1 * Math.pow(Y / .12, 2);
    return [RED[0] * k, RED[1] * k, RED[2] * k];
  }
  function hex2(h) {
    h = h.replace('#', ''); if (h.length <= 4) h = h.replace(/./g, '$&$&');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16), h.length === 8 ? parseInt(h.substr(6, 2), 16) / 255 : 1];
  }
  function fmt(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (+a.toFixed(3)) + ')' }
  var NAMED = { white: [255, 255, 255], black: [0, 0, 0] }, CACHE = {}, PRE = {};
  function mapOne(tok) {
    var m;
    if (tok.charAt(0) === '#') { var c = hex2(tok), o = mapRGB(c[0], c[1], c[2]); return fmt(o, c[3]) }
    m = /^rgba?\(([^)]*)\)$/i.exec(tok);
    if (m) {
      var p = m[1].split(/[\s,\/]+/).filter(Boolean), v = p.slice(0, 3).map(function (x) { return x.slice(-1) === '%' ? parseFloat(x) * 2.55 : parseFloat(x) });
      if (v.some(isNaN)) return tok;
      var a = p.length > 3 ? (p[3].slice(-1) === '%' ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1;
      return fmt(mapRGB(v[0], v[1], v[2]), a);
    }
    var n = NAMED[tok.toLowerCase()];
    return n ? fmt(mapRGB(n[0], n[1], n[2]), 1) : tok;
  }
  var RE = /url\([^)]*\)|#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;
  function mapStr(s) {
    var hit = CACHE[s]; if (hit !== undefined) return hit;
    var out, i = s.lastIndexOf(',');
    /* canvas hot path: rgba(r,g,b,alpha) with a changing alpha maps the rgb part once */
    if (s.charCodeAt(0) === 114 && s.charCodeAt(3) === 97 && s.charCodeAt(s.length - 1) === 41 && i > 0 && s.indexOf(')') === s.length - 1) {
      var pre = s.slice(0, i), pm = PRE[pre];
      if (pm === undefined) {
        var m = /^rgba\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)$/.exec(pre);
        if (m) { var mm = mapRGB(+m[1], +m[2], +m[3]); pm = 'rgba(' + Math.round(mm[0]) + ',' + Math.round(mm[1]) + ',' + Math.round(mm[2]) } else pm = null;
        PRE[pre] = pm;
      }
      if (pm !== null) return pm + s.slice(i);
    }
    out = s.replace(RE, function (t) { return t.charAt(0) === 'u' ? t : mapOne(t) });
    if (Object.keys(CACHE).length < 4000) CACHE[s] = out;
    return out;
  }
  function liftText(v) { return v.replace(/rgba\(([^,]+),([^,]+),([^,]+),\s*([\d.]+)\)/g, function (m, r, g, b, a) { return +a < .9 ? 'rgba(' + r + ',' + g + ',' + b + ',.9)' : m }) }
  function hasColor(v) { RE.lastIndex = 0; return RE.test(v) }

  /* canvas: colour setters map while Red is on; Night passes everything straight through */
  (function () {
    if (!w.CanvasRenderingContext2D) return;
    function wrap(proto, prop) {
      var dd = Object.getOwnPropertyDescriptor(proto, prop); if (!dd || !dd.set) return;
      Object.defineProperty(proto, prop, { get: dd.get, set: function (v) { dd.set.call(this, (eff === 'red' && !RAW && typeof v === 'string') ? mapStr(v) : v) }, configurable: true, enumerable: dd.enumerable });
    }
    ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (p) { wrap(CanvasRenderingContext2D.prototype, p) });
    var ft = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function () {
      if (eff === 'red') {
        var fs = this.fillStyle, m = typeof fs === 'string' && /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(fs);
        if (m && +m[4] < .9) { RAW = true; this.fillStyle = 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',.9)'; RAW = false; var r = ft.apply(this, arguments); RAW = true; this.fillStyle = fs; RAW = false; return r }
      }
      return ft.apply(this, arguments);
    };
    if (w.CanvasGradient) { var a = CanvasGradient.prototype.addColorStop; CanvasGradient.prototype.addColorStop = function (o, c) { return a.call(this, o, (eff === 'red' && typeof c === 'string') ? mapStr(c) : c) } }
  })();

  /* stylesheets: for every rule that has a colour, a Red twin under html[data-theme=red]; built when Red is first needed */
  function splitSel(s) {
    var out = [], dp = 0, cur = '';
    for (var i = 0; i < s.length; i++) { var ch = s[i]; if (ch === '(' || ch === '[') dp++; else if (ch === ')' || ch === ']') dp--; if (ch === ',' && !dp) { out.push(cur); cur = '' } else cur += ch }
    out.push(cur); return out;
  }
  function twin(sel) {
    return splitSel(sel).map(function (s) {
      s = s.trim(); if (/^html\[data-theme=["']?red["']?\]/.test(s)) return null;
      if (/^(:root|html)(?![\w-])/.test(s)) return s.replace(/^(:root|html)/, 'html[data-theme=red]');
      return 'html[data-theme=red] ' + s;
    }).filter(Boolean).join(',');
  }
  /* a rule's declarations as authored: shorthands that contain var() cannot be read back through their longhands */
  function decls(text) {
    var out = [], dp = 0, cur = '', q = '';
    function push() { var i = cur.indexOf(':'); if (i > 0) out.push([cur.slice(0, i).trim(), cur.slice(i + 1).trim()]); cur = '' }
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === q) q = ''; cur += ch; continue }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue }
      if (ch === '(') dp++; else if (ch === ')') dp--;
      if (ch === ';' && !dp) push(); else cur += ch;
    }
    push(); return out;
  }
  function walk(rules, out) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.type === 1) {
        var dcl = '';
        decls(r.style.cssText).forEach(function (dc) {
          var p = dc[0], v = dc[1], imp = /\s*!important\s*$/i.test(v); if (imp) v = v.replace(/\s*!important\s*$/i, '');
          if (v && hasColor(v)) { var nv = mapStr(v); if (p === 'color') nv = liftText(nv); if (nv !== v) dcl += p + ':' + nv + (imp ? ' !important' : '') + ';' }
        });
        if (dcl) { var s = twin(r.selectorText); if (s) out.push(s + '{' + dcl + '}') }
      } else if (r.type === 4 || r.type === 12) {
        var inner = []; walk(r.cssRules, inner);
        if (inner.length) out.push((r.type === 4 ? '@media ' + r.conditionText : '@supports ' + r.conditionText) + '{' + inner.join('') + '}');
      }
    }
  }
  function build() {
    var out = [];
    for (var i = 0; i < d.styleSheets.length; i++) {
      var ss = d.styleSheets[i]; if (ss.ownerNode && ss.ownerNode.id === 'theme-red') continue;
      var rules; try { rules = ss.cssRules } catch (e) { continue }
      if (rules) walk(rules, out);
    }
    if (!sheet) { sheet = d.createElement('style'); sheet.id = 'theme-red'; (d.head || root).appendChild(sheet) }
    sheet.textContent = out.join('\n'); built = true;
  }

  function label() {
    if (!btn) return;
    var to = pref === 'red' ? 'night' : 'red';
    btn.setAttribute('aria-label', 'colour mode: ' + pref + '. switch to ' + to);
    btn.setAttribute('aria-pressed', pref === 'red' ? 'true' : 'false');
    btn.title = pref + ' · switch to ' + to;
  }
  function apply(force) {
    if (pref === eff && !force && root.getAttribute('data-theme') === eff) return;
    eff = pref;
    if (eff === 'red' && !built) build();
    root.setAttribute('data-theme', eff);
    var m = d.querySelector('meta[name=theme-color]');
    if (m) { if (tc === null) tc = m.getAttribute('content'); m.setAttribute('content', eff === 'red' ? '#000' : tc) }
    label();
    hooks.forEach(function (f) { f('theme', eff) });
    w.dispatchEvent(new CustomEvent('gj-theme', { detail: eff }));
  }

  var T = {
    get pref() { return pref }, get eff() { return eff },
    map: function (s) { return eff === 'red' ? mapStr(s) : s },
    set: function (v) { v = v === 'red' ? 'red' : 'night'; if (v === pref) return; pref = v; lsSet(v); apply(true) },
    toggle: function () { T.set(pref === 'red' ? 'night' : 'red') },
    on: function (f) { hooks.push(f) }
  };
  w.GJ_THEME = T;

  function mount() {
    if (btn || w.top !== w.self) return;
    btn = d.createElement('button'); btn.type = 'button'; btn.id = 'themeBtn'; btn.innerHTML = '<i></i>';
    btn.addEventListener('click', function (e) { e.stopPropagation(); T.toggle() });
    btn.addEventListener('pointerdown', function (e) { e.stopPropagation() });
    d.body.appendChild(btn); label();
  }

  root.setAttribute('data-theme', eff);
  var m0 = d.querySelector('meta[name=theme-color]');
  if (m0) { tc = m0.getAttribute('content'); if (eff === 'red') m0.setAttribute('content', '#000') }
  if (eff === 'red') build();

  function ready() { mount(); if (eff === 'red') build(); w.addEventListener('load', function () { if (eff === 'red') build() }) }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ready); else ready();

  w.addEventListener('storage', function (e) {
    if (e.key !== KEY && e.key !== null) return;
    var v = lsGet() === 'red' ? 'red' : 'night';
    if (v !== pref) { pref = v; apply(true) }
  });
  w.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    var v = lsGet() === 'red' ? 'red' : 'night';
    if (v !== pref) { pref = v; apply(true) }
  });
})(window, document);
