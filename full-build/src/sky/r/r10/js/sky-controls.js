/* R10c · the "sky" panel: live controls on the R10 constellation. Ported from m4 js/debug.js's tune section (D1: constellation
   spread 2e98fa4, star spread 7a36a9e, line opacity + width a985970, star size + glow), which only ever lived behind ?debug=1.
   Values act on R10's js/world.js through window.GJ_SKY and stay for this tab (sessionStorage). Defaults = the sky as designed. */
const SPECS = [
  ['spread', 'constellation spread', .7, 1.8, .01], ['sspread', 'star spread', .7, 1.8, .01], ['lineA', 'line opacity', .2, 1.8, .01],
  ['lineW', 'line width', .5, 3.5, .05], ['starS', 'star size', .5, 2.4, .01], ['starG', 'star glow', .4, 2.4, .01]];
export function mount() { const root = document.getElementById('skyp'), btn = document.getElementById('skyb'), T = window.GJ_SKY;
  root.innerHTML = '<p class="kick">sky</p>'; let rl = 0;
  SPECS.forEach(([k, nm, mn, mx, st]) => { const lab = document.createElement('label'), v = document.createElement('span'), inp = document.createElement('input');
    inp.type = 'range'; inp.min = mn; inp.max = mx; inp.step = st; inp.value = T[k]; inp.dataset.k = k; inp.setAttribute('aria-label', nm); v.textContent = (+T[k]).toFixed(2) + '×';
    lab.append(nm + ' ', v, inp); root.appendChild(lab);
    inp.addEventListener('input', () => { T[k] = +inp.value; v.textContent = (+inp.value).toFixed(2) + '×'; save();
      if (k === 'spread' || k === 'sspread') { cancelAnimationFrame(rl); rl = requestAnimationFrame(() => window.__world && __world.relayout()) } else window.__world && __world.req() }) });
  const rs = document.createElement('button'); rs.type = 'button'; rs.className = 'rs'; rs.textContent = 'reset'; root.appendChild(rs);
  rs.onclick = () => { SPECS.forEach(([k]) => T[k] = 1); root.querySelectorAll('input').forEach(i => { i.value = 1; i.previousSibling.textContent = '1.00×' }); save(); __world.relayout() };
  btn.addEventListener('click', () => { root.hidden = !root.hidden; btn.setAttribute('aria-expanded', String(!root.hidden)) });
  function save() { try { const o = {}; SPECS.forEach(([k]) => o[k] = T[k]); sessionStorage.setItem('gj-r10-sky', JSON.stringify(o)) } catch (e) {} } }
