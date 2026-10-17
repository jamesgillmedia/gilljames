// gill james v1 · film page: reel controls, filter chips, in-page player
(function () {
  var reel = document.getElementById('reel');
  var toggle = document.getElementById('reel-toggle');
  var full = document.getElementById('reel-full');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setState(playing) {
    toggle.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', playing ? 'pause reel' : 'play reel');
  }
  if (reel) {
    if (reduce) { reel.removeAttribute('autoplay'); reel.pause(); setState(false); }
    reel.addEventListener('play', function () { setState(true); });
    reel.addEventListener('pause', function () { setState(false); });
    toggle.addEventListener('click', function () { if (reel.paused) { reel.play(); } else { reel.pause(); } });
    full.addEventListener('click', function () {
      var el = reel;
      if (el.requestFullscreen) { el.requestFullscreen(); }
      else if (el.webkitEnterFullscreen) { el.webkitEnterFullscreen(); } // iPhone Safari
      el.muted = true; el.play();
    });
    // only play while on screen
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (document.fullscreenElement) return;
          if (e.isIntersecting) { if (toggle.dataset.userPaused !== '1') reel.play().catch(function () {}); } else { reel.pause(); }
        });
      }, { threshold: 0.25 }).observe(reel);
      toggle.addEventListener('click', function () { toggle.dataset.userPaused = reel.paused ? '1' : '0'; });
    }
  }

  // filters
  var chips = document.querySelectorAll('.chip');
  var tiles = document.querySelectorAll('.tile');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.filter;
      chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
      tiles.forEach(function (t) { t.hidden = !(f === 'all' || t.dataset.cat === f); });
    });
  });

  // player
  var data = JSON.parse(document.getElementById('film-data').textContent);
  var dlg = document.getElementById('player');
  var media = document.getElementById('player-media');
  var lastFocus = null;
  function embed(d) {
    if (d.provider === 'vimeo') return '<iframe src="https://player.vimeo.com/video/' + d.vid + '?autoplay=1&dnt=1&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" title="' + esc(d.title) + '"></iframe>';
    if (d.provider === 'youtube') return '<iframe src="https://www.youtube-nocookie.com/embed/' + d.vid + '?autoplay=1&rel=0&playsinline=1" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" title="' + esc(d.title) + '"></iframe>';
    if (d.provider === 'local' && d.src) return '<video src="' + d.src + '" controls autoplay playsinline></video>';
    return '<div class="coming">video coming</div>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function open(pos, from) {
    var d = data[pos]; if (!d) return;
    lastFocus = from || document.activeElement;
    media.innerHTML = embed(d);
    document.getElementById('player-title').textContent = d.title;
    document.getElementById('player-credit').textContent = d.credit || '';
    document.getElementById('player-desc').textContent = d.desc || '';
    var link = document.getElementById('player-link');
    if (d.url) { link.hidden = false; link.href = d.url; link.textContent = (d.provider === 'youtube' ? 'YouTube' : 'Vimeo') + ' ↗'; } else { link.hidden = true; }
    if (reel && !reel.paused) { reel.pause(); reel.dataset.resume = '1'; }
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.getElementById('player-close').focus();
    history.replaceState(null, '', '#play=' + pos);
  }
  function close() {
    media.innerHTML = '';
    if (dlg.open) dlg.close();
    history.replaceState(null, '', location.pathname + location.search);
    if (reel && reel.dataset.resume === '1') { reel.dataset.resume = ''; reel.play().catch(function () {}); }
    if (lastFocus) lastFocus.focus();
  }
  document.getElementById('film-grid').addEventListener('click', function (e) {
    var a = e.target.closest('a[data-play]'); if (!a) return;
    e.preventDefault(); open(a.dataset.play, a);
  });
  document.getElementById('player-close').addEventListener('click', close);
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('player-inner')) close(); });
  var m = location.hash.match(/play=(\d+)/); if (m) open(m[1]);
})();
