/* the Pro 2 sky cluster, drawn (Pack 1116 §2 and §3). Pro 2's compact view of the whole sky: five chapter glyphs round the glowing Mark.
   The glyphs are Pro 2's own (site-v3-pro2 index.html, .sky-nav: the same lines, stars and tints), read from that file when the port runs.
   One drawing, used in two places: the farthest zoom-out of the m4 sky (js/p2.js) and the framed sky in Site V3's scroll at "The Sky".
   Nothing here is a photograph. In safelight every line, star and bloom is drawn in the red the tone dial has chosen. */
(function (w) {
  'use strict';
  var G = {"film":{"t":"150,220,255","lt":"186,217,233","seg":[[10.7,9.9,61.0,7.6],[61.0,7.6,63.5,26.7],[63.5,26.7,8.2,28.1]],"pts":[[63.5,26.7,2.63,0.98],[10.7,9.9,2.56,0.96],[61.0,7.6,2.26,0.88],[8.2,28.1,2.16,0.86],[17.4,11.5,1.58,0.7],[33.8,11.6,1.51,0.69],[55.8,11.3,1.51,0.69],[38.1,25.1,1.51,0.69],[56.2,24.2,1.51,0.69],[23.0,24.3,1.48,0.68]]},"photo":{"t":"170,245,212","lt":"195,228,214","seg":[[37.4,8.6,47.9,15.9],[47.9,15.9,45.9,23.9],[45.9,23.9,35.4,27.8],[25.1,21.9,25.5,11.5],[25.5,11.5,37.4,8.6]],"pts":[[36.3,18.3,2.7,1.0],[45.9,23.9,2.53,0.96],[37.4,8.6,2.39,0.92],[25.1,21.9,2.33,0.9],[25.5,11.5,2.12,0.85],[47.9,15.9,2.05,0.83],[35.4,27.8,1.99,0.81]]},"objects":{"t":"255,236,205","lt":"233,224,210","seg":[[24.5,14.4,41.4,13.2],[41.4,13.2,42.7,28.9],[42.7,28.9,23.5,29.8],[33.8,7.4,51.0,6.5],[51.0,6.5,52.3,21.6],[24.5,14.4,33.8,7.4],[41.4,13.2,51.0,6.5],[42.7,28.9,52.3,21.6]],"pts":[[41.4,13.2,2.67,0.99],[24.5,14.4,2.33,0.9],[42.7,28.9,2.26,0.88],[51.0,6.5,2.19,0.86],[23.5,29.8,2.02,0.82],[52.3,21.6,1.94,0.8],[33.8,7.4,1.85,0.78]]},"sound":{"t":"255,182,176","lt":"233,200,197","seg":[[25.6,10.0,26.2,25.4],[32.2,7.8,32.3,26.7],[40.3,9.1,40.4,27.2],[7.7,17.8,13.1,16.1],[13.1,16.1,16.5,12.3],[16.5,12.3,22.1,15.0],[22.1,15.0,25.6,10.0],[25.6,10.0,32.2,7.8],[32.2,7.8,35.9,11.1],[35.9,11.1,40.3,9.1],[40.3,9.1,46.2,13.9],[46.2,13.9,49.9,11.3],[49.9,11.3,55.6,16.2],[55.6,16.2,60.7,15.7],[60.7,15.7,64.2,17.9]],"pts":[[32.2,7.8,2.56,0.96],[40.3,9.1,2.46,0.94],[25.6,10.0,2.36,0.91],[35.9,11.1,2.21,0.87],[49.9,11.3,2.12,0.85],[16.5,12.3,2.07,0.83],[32.3,26.7,2.05,0.83],[40.4,27.2,1.99,0.81],[46.2,13.9,1.97,0.81],[26.2,25.4,1.94,0.8],[22.1,15.0,1.9,0.79],[60.7,15.7,1.85,0.78],[13.1,16.1,1.77,0.75],[55.6,16.2,1.75,0.75],[7.7,17.8,1.59,0.71],[64.2,17.9,1.59,0.71]]},"about":{"t":"214,222,236","lt":"215,218,224","seg":[[23.8,11.6,17.4,11.6],[17.4,11.6,11.2,14.2],[11.2,14.2,8.3,20.4],[8.3,20.4,10.6,26.6],[10.6,26.6,17.0,29.3],[17.0,29.3,23.8,28.7],[41.3,30.3,41.7,21.1],[41.7,21.1,47.6,20.4],[47.6,20.4,51.2,16.6],[51.2,16.6,51.9,10.3],[63.7,7.6,65.6,9.8],[65.6,9.8,65.2,12.5]],"pts":[[51.9,10.3,2.53,0.96],[8.3,20.4,2.44,0.93],[65.6,9.8,2.36,0.91],[23.8,11.6,2.19,0.86],[34.4,15.4,2.19,0.86],[41.3,30.3,2.1,0.84],[11.2,14.2,2.02,0.82],[17.0,29.3,2.02,0.82],[23.8,28.7,1.94,0.8],[41.7,21.1,1.94,0.8],[65.2,12.5,1.94,0.8],[10.6,26.6,1.85,0.78],[27.1,11.1,1.85,0.78],[27.2,19.6,1.85,0.78],[47.6,20.4,1.85,0.78],[63.7,7.6,1.85,0.78],[17.4,11.6,1.77,0.75],[51.2,16.6,1.77,0.75]]}};
  var ANG = { about: -90, photo: -18, objects: 54, sound: 126, film: 198 }, ORDER = ['about', 'photo', 'objects', 'sound', 'film'];
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var DUST = (function () { var r = rnd(20261116), a = []; for (var i = 0; i < 260; i++) a.push([r(), r(), .35 + r() * .9, r() * 6.283, r() < .12 ? 1 : 0]); return a; })();
  /* where the five sit round the Mark: Pro 2's ring (a regular pentagon, about at the top) */
  function layout(W, H, cx, cy) {
    var R = Math.max(96, Math.min(W * .34, H * .25, 250)), gs = Math.max(1.05, Math.min(1.6, W / 330)), pos = {};
    ORDER.forEach(function (k) { var a = ANG[k] * Math.PI / 180; pos[k] = [cx + Math.cos(a) * R, cy + Math.sin(a) * R * .96]; });
    return { c: [cx, cy], R: R, gs: gs, pos: pos, order: ORDER };
  }
  /* the gathered view on a whole screen (fable-m4's farthest zoom-out, and where Site V3's frame lands when it flies in) */
  function full(W, H) { var top = Math.min(H * .46, 54 + 44 + Math.min(W * .34, H * .25, 250) + 60); return layout(W, H, W / 2, Math.max(top, Math.min(H * .5, H - 60 - 250))); }
  /* the same cluster inside a frame (Site V3, "The Sky"): compact, the ring sized to the frame */
  function frame(W, H) { var R = Math.max(84, Math.min(W * .36, H * .34)), gs = Math.max(.92, Math.min(1.25, W / 340)), cx = W / 2, cy = H * .5 + 2, pos = {};
    ORDER.forEach(function (k) { var a = ANG[k] * Math.PI / 180; pos[k] = [cx + Math.cos(a) * R, cy + Math.sin(a) * R * .96]; }); return { c: [cx, cy], R: R, gs: gs, pos: pos, order: ORDER }; }
  function glyph(g, k, x, y, s, al, red, tw) {
    var d = G[k]; if (!d || al <= .01) return; var t = red || d.t, lt = red || d.lt;
    var b = g.createRadialGradient(x, y, 0, x, y, 46 * s); b.addColorStop(0, 'rgba(' + t + ',' + (.20 * al).toFixed(3) + ')'); b.addColorStop(.55, 'rgba(' + t + ',' + (.07 * al).toFixed(3) + ')'); b.addColorStop(1, 'rgba(' + t + ',0)');
    g.fillStyle = b; g.beginPath(); g.arc(x, y, 46 * s, 0, 6.283); g.fill();
    g.save(); g.translate(x - 36 * s, y - 18 * s); g.scale(s, s); g.lineWidth = 1 / s * 1.05; g.lineCap = 'round'; g.strokeStyle = 'rgba(' + lt + ',' + (.55 * al).toFixed(3) + ')';
    g.beginPath(); for (var i = 0; i < d.seg.length; i++) { g.moveTo(d.seg[i][0], d.seg[i][1]); g.lineTo(d.seg[i][2], d.seg[i][3]); } g.stroke();
    g.shadowColor = 'rgba(' + t + ',' + (.95 * al).toFixed(3) + ')'; g.shadowBlur = 5 * s;
    for (var j = 0; j < d.pts.length; j++) { var p = d.pts[j], q = tw ? .82 + .18 * Math.sin(tw * 1.7 + j * 1.3 + x * .01) : 1; g.fillStyle = red ? 'rgba(' + red + ',' + (p[3] * al * q).toFixed(3) + ')' : 'rgba(255,255,255,' + (p[3] * al * q).toFixed(3) + ')'; g.beginPath(); g.arc(p[0], p[1], p[2] * .62, 0, 6.283); g.fill(); }
    g.restore(); g.shadowBlur = 0;
  }
  /* o: { t (seconds), red ("r,g,b" or null), c [x,y], gs, pos {k:[x,y]}, a (0..1 the cluster's presence), labels, ground (0..1), mark (0..1) } */
  function draw(g, W, H, o) {
    var red = o.red || null, a = o.a == null ? 1 : o.a, cx = o.c[0], cy = o.c[1], ink = red || '238,243,245', i;
    if (o.ground) { var bg = g.createRadialGradient(cx, cy - H * .08, 10, cx, cy, Math.max(W, H) * .8); bg.addColorStop(0, red ? 'rgba(26,5,7,' + o.ground + ')' : 'rgba(19,32,46,' + o.ground + ')'); bg.addColorStop(1, red ? 'rgba(3,1,1,' + o.ground + ')' : 'rgba(3,6,11,' + o.ground + ')'); g.fillStyle = bg; g.fillRect(0, 0, W, H); }
    for (i = 0; i < DUST.length; i++) { var s = DUST[i], tw = .6 + .4 * Math.sin((o.t || 0) * (.6 + s[2]) + s[3]); g.fillStyle = 'rgba(' + (red || '220,235,250') + ',' + ((s[4] ? .8 : .42) * tw * a).toFixed(3) + ')'; g.beginPath(); g.arc(s[0] * W, s[1] * H, s[4] ? 1.25 : s[2] * .7, 0, 6.283); g.fill(); }
    var bl = g.createRadialGradient(cx, cy, 0, cx, cy, (o.R || 160) * 1.25); bl.addColorStop(0, 'rgba(' + (red || '150,190,245') + ',' + (.30 * a).toFixed(3) + ')'); bl.addColorStop(.4, 'rgba(' + (red || '120,165,230') + ',' + (.12 * a).toFixed(3) + ')'); bl.addColorStop(1, 'rgba(' + (red || '120,165,230') + ',0)');
    g.fillStyle = bl; g.beginPath(); g.arc(cx, cy, (o.R || 160) * 1.25, 0, 6.283); g.fill();
    g.lineWidth = 1; g.strokeStyle = 'rgba(' + (red || '190,220,245') + ',' + (.22 * a).toFixed(3) + ')';
    ORDER.forEach(function (k) { var p = o.pos[k]; if (!p) return; var dx = p[0] - cx, dy = p[1] - cy, L = Math.sqrt(dx * dx + dy * dy) || 1, r0 = 34 * (o.gs || 1), r1 = L - 40 * (p[2] || o.gs || 1); if (r1 <= r0) return; g.beginPath(); g.moveTo(cx + dx / L * r0, cy + dy / L * r0); g.lineTo(cx + dx / L * r1, cy + dy / L * r1); g.stroke(); });
    ORDER.forEach(function (k) { var p = o.pos[k]; if (p) glyph(g, k, p[0], p[1], p[2] || o.gs || 1, (p[3] == null ? 1 : p[3]) * a, red, o.t); });
    if (o.labels !== false) { g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = '400 ' + Math.round(10 * Math.max(1, (o.gs || 1) * .92)) + 'px "Julius Sans One",sans-serif'; try { g.letterSpacing = '1.4px'; } catch (e) {}
      ORDER.forEach(function (k) { var p = o.pos[k]; if (!p) return; g.fillStyle = 'rgba(' + ink + ',' + (.86 * a * (p[3] == null ? 1 : p[3])).toFixed(3) + ')'; g.fillText(k.toUpperCase(), p[0] + .7, p[1] + 18 * (p[2] || o.gs || 1) + 15); }); try { g.letterSpacing = '0px'; } catch (e) {} }
    var ma = o.mark == null ? a : o.mark; if (ma > .01) { var fs = Math.round(40 * Math.max(1, (o.gs || 1) * .95)); g.font = '700 ' + fs + 'px Syl,"Noto Sans Canadian Aboriginal",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (!red) { g.fillStyle = 'rgba(10,189,240,' + (.45 * ma).toFixed(3) + ')'; g.fillText('ᑕᐣᓯ', cx + 2, cy + 2); g.fillStyle = 'rgba(254,1,1,' + (.45 * ma).toFixed(3) + ')'; g.fillText('ᑕᐣᓯ', cx - 2, cy - 2); }
      g.shadowColor = 'rgba(' + (red || '200,230,255') + ',' + (.85 * ma).toFixed(3) + ')'; g.shadowBlur = 22; g.fillStyle = red ? 'rgba(' + red + ',' + ma.toFixed(3) + ')' : 'rgba(255,255,255,' + ma.toFixed(3) + ')'; g.fillText('ᑕᐣᓯ', cx, cy); g.shadowBlur = 0; }
  }
  w.GJ_P2DRAW = { draw: draw, layout: layout, full: full, frame: frame, order: ORDER, glyphs: G };
})(window);
