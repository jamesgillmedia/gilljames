/* Studio board favicon follows the site's colour mode (Night default · Red).
   Red is read from the same places the site's theme layer uses: ?theme=night|red (and it is remembered), localStorage "gj.theme",
   and html[data-theme="red"]. Night leaves the icon links exactly as authored in the page.
   Browsers cache a favicon by <link> and many ignore a changed href on a link that already exists, so every change removes the
   icon links and inserts fresh ones with a cache-busting query. It runs once at load from the saved state, and again on a
   storage event (another tab changed the mode), a data-theme change on <html>, pageshow (back/forward cache) and tab focus.
   GJ_FAVICON.set('red'|'night'), .refresh(), .mode, .RED are exposed for the board's own controls and for tests. */
(function (w, d) {
  'use strict';
  var KEY = 'gj.theme', root = d.documentElement;
  var BASE = (d.currentScript && d.currentScript.src ? d.currentScript.src : location.href).replace(/[?#].*$/, '').replace(/[^\/]*$/, '');
  var RED = { icon: BASE + 'icons/favicon-red-32.png', touch: BASE + 'icons/apple-touch-icon-red.png' };
  var SEL = 'link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]';
  var authored = null, shown = null, seq = 0;

  function lsGet() { try { return localStorage.getItem(KEY) } catch (e) { return null } }
  function lsSet(v) { try { localStorage.setItem(KEY, v) } catch (e) {} }

  var q = /(?:^|[?&])theme=(night|red)(?:&|$)/.exec(location.search);
  if (q) lsSet(q[1]);

  function wanted() {
    if (root.getAttribute('data-theme') === 'red') return 'red';
    if (root.getAttribute('data-theme') === 'night') return 'night';
    return lsGet() === 'red' ? 'red' : 'night';
  }

  function keepAuthored() {
    if (authored) return;
    authored = [].map.call(d.querySelectorAll(SEL), function (l) {
      var c = d.createElement('link');
      [].forEach.call(l.attributes, function (a) { c.setAttribute(a.name, a.value) });
      return c;
    });
  }

  function bust(url) { return /^data:/i.test(url) ? url : url + (url.indexOf('?') < 0 ? '?' : '&') + 'fav=' + Date.now().toString(36) + (++seq) }

  function make(rel, href, extra) {
    var l = d.createElement('link');
    l.rel = rel; l.href = bust(href);
    if (extra) for (var k in extra) l.setAttribute(k, extra[k]);
    return l;
  }

  function swap(links) {
    var head = d.head || root;
    [].forEach.call(d.querySelectorAll(SEL), function (l) { l.parentNode && l.parentNode.removeChild(l) });
    links.forEach(function (l) { head.appendChild(l) });
  }

  function apply(force) {
    var m = wanted();
    if (m === shown && !force) return;
    keepAuthored();
    shown = m;
    if (m === 'red') {
      swap([make('icon', RED.icon, { type: 'image/png', sizes: '32x32' }), make('apple-touch-icon', RED.touch, { sizes: '180x180' })]);
    } else {
      swap(authored.map(function (a) {
        var c = a.cloneNode(false), h = a.getAttribute('href');
        c.setAttribute('href', bust(h));
        return c;
      }));
    }
    w.dispatchEvent(new CustomEvent('gj-favicon', { detail: m }));
  }

  w.GJ_FAVICON = {
    RED: RED,
    get mode() { return shown },
    refresh: function () { apply(true) },
    set: function (v) { v = v === 'red' ? 'red' : 'night'; if (w.GJ_THEME) w.GJ_THEME.set(v); else { lsSet(v); root.setAttribute('data-theme', v) } apply() }
  };

  apply(true);

  w.addEventListener('storage', function (e) {
    if (e.key !== KEY && e.key !== null) return;
    if (root.hasAttribute('data-theme')) root.setAttribute('data-theme', lsGet() === 'red' ? 'red' : 'night');
    apply();
  });
  w.addEventListener('pageshow', function () { apply(true) });
  d.addEventListener('visibilitychange', function () { if (!d.hidden) apply() });
  if (w.MutationObserver) new MutationObserver(function () { apply() }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})(window, document);
