/* Site V3 · red mode (Pack 1116 §3). Site V3 had no red of its own: with the dot lit, only the three pills changed.
   This is fable-m4's mapping (js/theme.js: same luminance curve, same ink, black stays black), applied to this page:
   every colour in the page's own stylesheets gets a twin under html.rm, and every colour the page's canvases set is mapped while red is on.
   Never mapped: photographs, stills, film frames and video (an image is not a colour; drawImage is untouched), and the shared pills
   (chrome.css is already red, and its lit dot is the one mint thing). Night: this file changes nothing. Nothing here animates. */
(function (w, d) {
  'use strict';
  var root = d.documentElement, TONES = { crimson: [255, 68, 87], rose: [255, 176, 184] }, RED = TONES.crimson, on = false, built = '', el = null, CACHE = {}, RAW = false;
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function tone() { var t = root.getAttribute('data-red-tone') || ls('gj.red.tone'); return t === 'rose' ? 'rose' : 'crimson'; }
  function mapRGB(r, g, b) { var Y = (.2126 * r + .7152 * g + .0722 * b) / 255, k;
    if (Y >= .5) k = .84 + .16 * (Y - .5) / .5; else if (Y >= .12) { var u = (Y - .12) / .38; k = .1 + .74 * u * u * (3 - 2 * u); } else k = .1 * Math.pow(Y / .12, 2);
    return [RED[0] * k, RED[1] * k, RED[2] * k]; }
  function hex2(h) { h = h.replace('#', ''); if (h.length <= 4) h = h.replace(/./g, '$&$&'); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16), h.length === 8 ? parseInt(h.substr(6, 2), 16) / 255 : 1]; }
  function fmt(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (+a.toFixed(3)) + ')'; }
  var NAMED = { white: [255, 255, 255], black: [0, 0, 0] };
  function mapOne(tok) { var m;
    if (tok.charAt(0) === '#') { var c = hex2(tok); return isNaN(c[0]) ? tok : fmt(mapRGB(c[0], c[1], c[2]), c[3]); }
    m = /^rgba?\(([^)]*)\)$/i.exec(tok);
    if (m) { var p = m[1].split(/[\s,\/]+/).filter(Boolean), v = p.slice(0, 3).map(function (x) { return x.slice(-1) === '%' ? parseFloat(x) * 2.55 : parseFloat(x); }); if (v.length < 3 || v.some(isNaN)) return tok;
      var a = p.length > 3 ? (p[3].slice(-1) === '%' ? parseFloat(p[3]) / 100 : parseFloat(p[3])) : 1; if (isNaN(a)) return tok; return fmt(mapRGB(v[0], v[1], v[2]), a); }
    var n = NAMED[tok.toLowerCase()]; return n ? fmt(mapRGB(n[0], n[1], n[2]), 1) : tok; }
  var RE = /url\([^)]*\)|#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;
  function mapStr(s) { var hit = CACHE[s]; if (hit !== undefined) return hit; var out = s.replace(RE, function (t) { return t.charAt(0) === 'u' ? t : mapOne(t); }); if (Object.keys(CACHE).length < 4000) CACHE[s] = out; return out; }
  function liftText(v) { return v.replace(/rgba\(([^,]+),([^,]+),([^,]+),\s*([\d.]+)\)/g, function (m, r, g, b, a) { return +a < .9 ? 'rgba(' + r + ',' + g + ',' + b + ',.9)' : m; }); }
  function hasColor(v) { RE.lastIndex = 0; return RE.test(v); }
  /* canvases: colour setters map while red is on (lines, stars, labels, glows). Images drawn into a canvas are left exactly as they are. */
  (function () {
    function wrap(proto, prop) { var ds = Object.getOwnPropertyDescriptor(proto, prop); if (!ds || !ds.set) return;
      Object.defineProperty(proto, prop, { get: ds.get, set: function (v) { ds.set.call(this, (on && !RAW && typeof v === 'string') ? mapStr(v) : v); }, configurable: true, enumerable: ds.enumerable }); }
    if (w.CanvasRenderingContext2D) ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (p) { wrap(CanvasRenderingContext2D.prototype, p); });
    if (w.CanvasGradient) { var a = CanvasGradient.prototype.addColorStop; CanvasGradient.prototype.addColorStop = function (o, c) { return a.call(this, o, (on && !RAW && typeof c === 'string') ? mapStr(c) : c); }; }
  })();
  function splitSel(s) { var out = [], dp = 0, cur = ''; for (var i = 0; i < s.length; i++) { var ch = s[i]; if (ch === '(' || ch === '[') dp++; else if (ch === ')' || ch === ']') dp--; if (ch === ',' && !dp) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; }
  function twin(sel) { return splitSel(sel).map(function (s) { s = s.trim(); if (/#gj-|^html\.rm/.test(s)) return null; if (/^(:root|html)(?![\w-])/.test(s)) return s.replace(/^(:root|html)/, 'html.rm'); return 'html.rm ' + s; }).filter(Boolean).join(','); }
  function walk(rules, out) { for (var i = 0; i < rules.length; i++) { var r = rules[i];
    if (r.type === 1) { var st = r.style, dd = ''; for (var j = 0; j < st.length; j++) { var p = st[j], v = st.getPropertyValue(p); if (v && hasColor(v)) { var nv = mapStr(v); if (p === 'color') nv = liftText(nv); if (nv !== v) dd += p + ':' + nv + (st.getPropertyPriority(p) ? ' !important' : '') + ';'; } }
      if (dd) { var s = twin(r.selectorText); if (s) out.push(s + '{' + dd + '}'); } }
    else if (r.type === 4 || r.type === 12) { var inner = []; walk(r.cssRules, inner); if (inner.length) out.push((r.type === 4 ? '@media ' + r.conditionText : '@supports ' + r.conditionText) + '{' + inner.join('') + '}'); } } }
  function build() { var out = [];
    for (var i = 0; i < d.styleSheets.length; i++) { var ss = d.styleSheets[i], n = ss.ownerNode; if (!n || n.id === 'v3-red' || n.id === 'v3-red-fixed' || /chrome\.css/.test(n.href || '')) continue; var rules; try { rules = ss.cssRules; } catch (e) { continue; } if (rules) walk(rules, out); }
    if (!el) { el = d.createElement('style'); el.id = 'v3-red'; d.head.appendChild(el); } el.textContent = out.join('\n'); built = tone(); }
  function sync() { var want = root.classList.contains('rm') || (!w.GJ && ls('gj-red') === '1'), t = tone(); RED = TONES[t]; if (built && built !== t) { CACHE = {}; built = ''; }
    var ch = want !== on; on = want; if (on && !built && d.readyState !== 'loading') build();
    if (ch || on) { try { w.dispatchEvent(new CustomEvent('v3-red', { detail: { on: on } })); } catch (e) {} } }
  on = ls('gj-red') === '1'; RED = TONES[tone()];
  try { new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class', 'data-red-tone'] }); } catch (e) {}
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', sync); else sync();
  w.addEventListener('load', function () { if (on) { built = ''; sync(); } });
  w.GJ_V3RED = { get on() { return on; }, ink: function () { return RED.join(','); }, map: function (s) { return on ? mapStr(s) : s; }, raw: function (f) { RAW = true; try { return f(); } finally { RAW = false; } } };
})(window, document);
