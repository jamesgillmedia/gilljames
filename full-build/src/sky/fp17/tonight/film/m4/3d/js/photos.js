/* The Photo reel's list: m4's Photo chapter (data.json) + Gill's Nov 9 photos (js/nov9.js), in m4's own board order.
 Paths are rewritten relative to 3d/. Series = where each photo comes from in m4's data (names are labels, not titles). */
window.GJ3_PHOTOS = function () {
  var SERIES = { main: 'photographs', nov9: 'Nov 9' };
  var PRIVATE = (function () { var H = {}; [1374678362,1596214955,1579437336,1623527748,1022601639,921788830,1859290985,2012832049,1545882098,4278889348,3125354911,3142132530].forEach(function (h) { H[h] = 1 }); function f(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 } return h } return { test: function (s) { return (String(s).toUpperCase().match(/IMG_\d{4}|[0-9A-F]{8}/g) || []).some(function (t) { return H[f(t)] }) } } })();
  var up = function (p) { return p ? '../' + p : '' };
  return fetch('../data.json').then(function (r) { return r.json() }).then(function (d) {
    var out = [];
    var ch = (d.chapters || []).filter(function (c) { return c.k === 'photo' })[0];
    (ch ? ch.cards : []).forEach(function (c) {
      var m = c.media || {};
      out.push({ id: c.id, series: SERIES.main, title: c.title && c.title !== 'untitled' ? c.title : '',
        thumb: up(m.thumb), big: up(m.big || m.thumb), w: m.w || 4, h: m.h || 5, page: '../photo/' + c.slug + '/' });
    });
    (window.NOV9 || []).forEach(function (f) {
      if (f.k !== 'photo') return;
      var slug = 'nov9-' + f.name.toLowerCase();
      out.push({ id: 'photo/' + slug, series: SERIES.nov9, title: '', thumb: up(f.thumb), big: up(f.big), w: f.w, h: f.h, page: '../photo/' + slug + '/' });
    });
    return out.filter(function (p) { return !PRIVATE.test(p.big + p.thumb + p.id) });
  });
};
