/* se-a · words in the place: each reading page is pinned beside the part of the eye it describes.
   The card sits next to its anchor (a point in the 3D scene), joined by a line, and its type size follows depth within a readable range. */
(function () {
  const ANCHOR = { 0: [0, .6, 0], 1: [2.5, .1, -7.5], 2: [0, .6, 0], 3: [0, .75, 0], 5: [-6.5, 0, 2.5], 10: [-3, -34.8, 4], 14: [0, .6, 0] };
  let off = 0, offT = 0, lastT = 0;
  const tell = () => document.getElementById('setell'), lines = () => document.getElementById('selines');
  let cur = -1, ln = null, dot = null, V = null;
  window.__SEX = {
    onTell(i, st) {
      const T = tell(), tp = document.getElementById('tell-' + st.tell);
      T.querySelector('.in').innerHTML = tp.innerHTML; T.dataset.k = st.tell; T.scrollTop = 0; T.classList.add('open', 'pinned'); cur = i;
    },
    onHide() { cur = -1; if (ln) { ln.style.opacity = 0; dot.style.opacity = 0 } },
    onFrame(cam) {
      /* on a narrow screen the scene lifts into the top half while a card is pinned, so the card never hides what it names */
      const now = performance.now(), dt = Math.min(64, now - (lastT || now)); lastT = now; offT = cur >= 0 && innerWidth < 640 ? .2 : 0;
      off += (offT - off) * Math.min(1, dt / 180);
      if (Math.abs(off) > .001) { cam.setViewOffset(innerWidth, innerHeight, 0, off * innerHeight, innerWidth, innerHeight); } else if (cam.view && cam.view.enabled) { cam.clearViewOffset() }
      if (cur < 0 || !ANCHOR[cur]) return;
      if (!V) V = cam.position.clone();
      const T = tell(), W = innerWidth, H = innerHeight, a = ANCHOR[cur];
      V.set(a[0], a[1], a[2]); const dist = cam.position.distanceTo(V); V.project(cam);
      const x = (V.x + 1) / 2 * W, y = (1 - V.y) / 2 * H;
      const k = Math.max(.94, Math.min(1.12, 16 / dist)); T.style.setProperty('--k', k.toFixed(3));
      const tw = T.offsetWidth, th = T.offsetHeight, m = 14, narrow = W < 640;
      let lx, ly;
      if (narrow) { lx = (W - tw) / 2; ly = Math.max(y + 40, H - th - 70) > H - th - 70 ? H - th - 70 : Math.max(y + 40, H - th - 70) }
      else { const right = x < W * .5; lx = right ? x + 70 : x - 70 - tw; lx = Math.max(m, Math.min(W - tw - m, lx)); ly = Math.max(60, Math.min(H - th - 70, y - th / 2)) }
      T.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
      if (!ln) { const L = lines(); ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', 4); ln.setAttribute('class', 'pin'); dot.setAttribute('class', 'pin'); L.appendChild(ln); L.appendChild(dot) }
      const ex = Math.max(lx, Math.min(lx + tw, x)), ey = Math.max(ly, Math.min(ly + th, y));
      ln.setAttribute('x1', x); ln.setAttribute('y1', y); ln.setAttribute('x2', ex); ln.setAttribute('y2', ey); dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      ln.style.opacity = 1; dot.style.opacity = 1; lines().style.opacity = 1;
    }
  };
  window.__qaGo = s => window.__se && window.__se.jump(+s);
})();
