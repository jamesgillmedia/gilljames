/* se-b · plates in depth: the PDF's own pages hang in the scene as layered plates; moving to the next stop carries you through them.
   The words sit on one calm panel beside the scene (bottom on a phone, right on wider screens), never over a picture.
   Labels the PDF draws on a picture become numbers in the scene and a numbered list on the panel. */
(function () {
  const P = n => 'pages/p' + String(n).padStart(2, '0');
  /* [file, depth, right, up, width] relative to the stop's camera */
  const place = {
    open: [[P(1), 12, 0, 1.2, 8.5]],
    land: [[P(2), 11, 0, .4, 7.5]],
    statement: [[P(5), 11, -1.2, .4, 7], [P(7), 19, 4.5, 2.2, 8, 1]],
    description: [[P(6), 11, 0, .4, 7.5], [P(8), 20, -5, 2.5, 8, 1]],
    water: [[P(9), 10, -1.5, .3, 6.5], [P(12), 17, 3.6, 1.8, 7.5], [P(13), 25, -2.5, 3.4, 9, 1]],
    site: [[P(10), 11, 0, .4, 7.5], [P(11), 19, 4.6, 2.4, 8, 1]],
    lens: [[P(14), 15, -7, 3.2, 5.6]],
    in: [[P(16), 12, -4.2, 1.8, 5.2, 1]],
    under: [[P(15), 11, -1.8, .6, 6.5], [P(17), 18, 4.2, 2, 7, 1]],
    garden: [[P(19), 22, 7.5, 3.6, 9], [P(20), 27, -9, 5, 8, 1]],
    ecosystem: [[P(18), 11, 0, .4, 7.5]],
    community: [[P(25), 12, 0, .6, 7.5]]
  };
  const panel = () => document.getElementById('setell'), inner = () => panel().querySelector('.in');
  const esc = t => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML };
  function fill(html) { const I = inner(); I.classList.remove('on'); I.innerHTML = html; panel().scrollTop = 0; requestAnimationFrame(() => I.classList.add('on')) }
  window.__SEX = {
    place, fly: true,
    size() { const c = document.getElementById('c'); return [c.clientWidth || innerWidth, c.clientHeight || innerHeight] },
    onTell(i, st) { fill(document.getElementById('tell-' + st.tell).innerHTML) },
    onShow(i, st) {
      const items = [...(st.co || []).map(c => '<li><b>' + esc(c.b) + '</b>' + (c.s ? '<span>' + esc(c.s) + '</span>' : '') + '</li>'), ...(st.cards || []).map(c => '<li><b>' + esc(c.t) + '</b></li>')];
      fill(items.length ? '<ol class="labels">' + items.join('') + '</ol>' : '');
    },
    onHide() { inner().classList.remove('on') }
  };
  window.__qaGo = s => window.__se && window.__se.jump(+s);
})();
