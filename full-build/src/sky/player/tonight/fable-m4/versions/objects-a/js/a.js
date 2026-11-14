/* Objects · version A · "the case". Specimen framing with Spirit Eye v2 space (u4-opus-m4/3d/js/spirit-eye.js):
 - each specimen stands in its own glass case on a lit plinth; the five cases stand one after another down a dark hall (real depth, not a board)
 - the camera travels on curved paths between poses and settles with Spirit Eye's ease cubic-bezier(.22,1,.36,1)
 - a drag at the case level scrubs the camera along the hall between cases; letting go glides to the nearest case (Spirit Eye's drag + snap)
 - each deeper layer is a set of photo planes placed at different distances behind the case; deeper layers sit lower, so going deeper
 is a descent down the case's column of light (Spirit Eye's descent); planes fade by their distance along the path, other layers never show through
 - the Objects board stands at the mouth of the hall: you arrive through it and leave back out through it
 One gesture = one step: pinch in / wheel toward / Enter / "in ›" = deeper; pinch out / wheel away / Back / Esc = up one layer; up from a case = the sheet.
 Nothing auto-advances, no idle motion, silent. Nothing reads prefers-reduced-motion: the same motion either way. */
import { SPECIMENS, BOARD } from './shared/objects-data.js';
import { entry, keep, boardUrl, cardUrl, cardsOf, boardCard } from './shared/board.js';

const $ = s => document.querySelector(s), html = document.documentElement;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---------- layers for this version (real frames only; empty layers skipped) ---------- */
const NAMES = { whole: 'whole piece', surface: 'surface', making: 'making', use: 'use', ring: 'angles' };
function layersOf(sp) {
  const L = [];
  for (const k of ['whole', 'surface', 'making', 'use']) { const f = sp.layers[k] || []; if (f.length) L.push({ k, name: NAMES[k], frames: f }) }
  if (sp.id !== 'joio-cup') { const whole = L[0].frames[0].img, r = sp.ring.filter(v => v.img !== whole); if (r.length) L.push({ k: 'ring', name: NAMES.ring, frames: r }) }
  return L;
}
const SP = SPECIMENS.map((sp, i) => ({ ...sp, i, L: layersOf(sp) }));

/* ---------- state ---------- */
const st = { s: 0, l: 0, j: 0, sheet: false, page: false };
const E0 = entry(); st.s = E0.index;
if (E0.layer) { const li = SP[st.s].L.findIndex(L => L.k === E0.layer); if (li > 0) { st.l = li; st.j = Math.min(E0.i, SP[st.s].L[li].frames.length - 1) } }
const UI = { up: $('#up'), prev: $('#prev'), next: $('#next'), inb: $('#inb'), rail: $('#rail'), lab: $('#label'), sheet: $('#sheet'), page: $('#page') };

function syncUI() {
  const sp = SP[st.s], L = sp.L[st.l], f = L.frames[st.j];
  $('#label .t').textContent = sp.title + ' · ' + L.name;
  $('#label .n').textContent = L.frames.length > 1 ? (st.j + 1) + ' / ' + L.frames.length + (f.angle ? ' · ' + f.angle : '') : (f.angle && st.l ? f.angle : '');
  $('#label .c').textContent = st.l === 0 && sp.mesh ? '' : (f.cap || '');
  UI.prev.disabled = st.s === 0 || st.l > 0; UI.next.disabled = st.s === SP.length - 1 || st.l > 0;
  const last = st.l === sp.L.length - 1 && st.j === L.frames.length - 1; UI.inb.disabled = last;
  UI.rail.innerHTML = '<li class="h">LAYERS</li>' + sp.L.map((x, k) => `<li class="${k === st.l ? 'on' : ''}"><i></i>${esc(x.name)}</li>`).join('');
  keep(sp.id, st.l ? L.k : null, st.l ? st.j : 0);
}

/* ---------- sheet (the proof grid: every specimen, every layer, plus its board cards) ---------- */
function buildSheet() {
  const o = [];
  SP.forEach(sp => {
    o.push(`<h2>${esc(sp.title)} <small>${sp.L.map(L => esc(L.name)).join(' · ')}</small></h2><div class="row">`);
    sp.L.forEach((L, li) => L.frames.forEach((f, j) => {
      const on = sp.i === st.s && li === st.l && j === st.j ? ' class="on"' : '';
      o.push(`<button type="button"${on} data-s="${sp.i}" data-l="${li}" data-j="${j}" aria-label="${esc(sp.title + ' · ' + L.name + ' ' + (j + 1))}"><img src="${esc(f.th || f.img)}" alt="" loading="lazy">${j === 0 ? `<span class="k">${esc(L.name)}</span>` : ''}</button>`);
    }));
    o.push('</div>');
    const cards = cardsOf(sp.id);
    if (cards.length) o.push('<div class="bd">ON THE OBJECTS BOARD</div><div class="row">' + cards.map(c => `<a href="${esc(cardUrl(c.slug))}" aria-label="${esc(c.title)}"><img src="${esc(c.th)}" alt="" loading="lazy"></a>`).join('') + '</div>');
  });
  o.push(`<div class="out"><a href="${esc(boardUrl())}" data-out="1">objects board ›</a><a href="../../">home ›</a></div>`);
  UI.sheet.querySelector('.in').innerHTML = o.join('');
}
function openSheet() { if (st.page) closePage(); st.sheet = true; buildSheet(); UI.sheet.hidden = false; const on = UI.sheet.querySelector('.on'); if (on) on.scrollIntoView({ block: 'center' }) }
function closeSheet() { st.sheet = false; UI.sheet.hidden = true }
UI.sheet.addEventListener('click', e => {
  const b = e.target.closest('button[data-s]'); if (!b) return;
  closeSheet(); go(+b.dataset.s, +b.dataset.l, +b.dataset.j);
});

/* ---------- detail page ---------- */
function openPage() {
  const sp = SP[st.s], L = sp.L[st.l], f = L.frames[st.j]; st.page = true;
  const im = UI.page.querySelector('img'); im.src = f.img; im.alt = sp.title + ' · ' + L.name;
  UI.page.querySelector('figcaption').innerHTML = `<b>${esc(sp.title)} · ${esc(L.name)}${L.frames.length > 1 ? ' · ' + (st.j + 1) + ' / ' + L.frames.length : ''}</b>${f.cap ? `<span>${esc(f.cap)}</span>` : ''}`;
  const cards = cardsOf(sp.id), links = cards.map(c => `<a href="${esc(cardUrl(c.slug))}">${esc(c.title)} ›</a>`);
  if (!cards.length) links.push(`<a href="${esc(boardUrl())}">objects board ›</a>`);
  UI.page.querySelector('nav').innerHTML = links.join('');
  UI.page.hidden = false;
}
function closePage() { st.page = false; UI.page.hidden = true }
UI.page.querySelector('.x').addEventListener('click', closePage);

/* ---------- no WebGL: the sheet is the room ---------- */
let V = null;
if (!html.classList.contains('nogl')) {
  try { const THREE = await import('../vendor/three.module.min.js'); V = await makeView(THREE) } catch (e) { console.warn(e); html.classList.add('nogl'); V = null }
}
if (!V) { syncUI(); openSheet(); UI.sheet.querySelector('.out').insertAdjacentHTML('afterbegin', '') }

/* ---------- navigation ---------- */
let busy = false;
function go(s, l, j, opt = {}) {
  s = Math.max(0, Math.min(SP.length - 1, s)); const sp = SP[s]; l = Math.max(0, Math.min(sp.L.length - 1, l)); j = Math.max(0, Math.min(sp.L[l].frames.length - 1, j));
  const from = { s: st.s, l: st.l, j: st.j }; st.s = s; st.l = l; st.j = j; syncUI();
  if (V) V.glideTo(from, { s, l, j }, opt);
}
const deeper = () => { if (st.sheet) { closeSheet(); return } if (st.page) return; const L = SP[st.s].L; if (st.j < L[st.l].frames.length - 1) go(st.s, st.l, st.j + 1); else if (st.l < L.length - 1) go(st.s, st.l + 1, 0) };
const up = () => { if (st.page) { closePage(); return } if (st.sheet) { leaveToBoard(); return } if (st.l > 0) go(st.s, st.l - 1, st.l - 1 === 0 ? 0 : (SP[st.s].L[st.l - 1].frames.length - 1)); else openSheet() };
const nextSpec = d => { if (st.sheet || st.page) return; if (st.l > 0) { const L = SP[st.s].L[st.l]; go(st.s, st.l, st.j + d); return } go(st.s + d, 0, 0) };
function leaveToBoard() { closeSheet(); closePage(); if (V) V.leave(() => { location.href = boardUrl() }); else location.href = boardUrl() }

UI.up.addEventListener('click', up); UI.inb.addEventListener('click', deeper); $('#sheetb').addEventListener('click', () => st.sheet ? closeSheet() : openSheet());
UI.prev.addEventListener('click', () => nextSpec(-1)); UI.next.addEventListener('click', () => nextSpec(1));
$('#board').addEventListener('click', e => { e.preventDefault(); leaveToBoard() });
UI.sheet.addEventListener('click', e => { const a = e.target.closest('a[data-out]'); if (a) { e.preventDefault(); leaveToBoard() } });
addEventListener('keydown', e => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return; const k = e.key;
  if (k === 'Enter' || k === 'ArrowDown') deeper(); else if (k === 'ArrowUp' || k === 'Escape' || k === 'Backspace') up();
  else if (k === 'ArrowRight') nextSpec(1); else if (k === 'ArrowLeft') nextSpec(-1); else return; e.preventDefault();
});
/* sheet / page: pinch out or in on the overlay */
[UI.sheet, UI.page].forEach(el => { const P = new Map(); let d0 = 0, done = false;
  el.addEventListener('touchstart', e => { if (e.touches.length === 2) { d0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); done = false } }, { passive: true });
  el.addEventListener('touchmove', e => { if (e.touches.length === 2 && d0 && !done) { e.preventDefault(); const r = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) / d0; if (r > 1.25) { done = true; el === UI.sheet ? closeSheet() : null } else if (r < .8) { done = true; up() } } }, { passive: false });
});

if (V) {
  syncUI(); V.arrive();
  const cv = $('#c');
  let wAcc = 0, wLock = false, wLast = 0;
  cv.addEventListener('wheel', e => { e.preventDefault(); const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 4 : 1), t = performance.now();
    if (t - wLast > 220) { wLock = false; wAcc = 0 } wLast = t; if (wLock) return; wAcc += dy; if (Math.abs(wAcc) < 30) return; wLock = true; const d = wAcc; wAcc = 0; d < 0 ? deeper() : up() }, { passive: false });
  const PT = new Map(); let G = null;
  const dist = () => { const a = [...PT.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (x) {}
    PT.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!G) G = { x0: e.clientX, y0: e.clientY, t0: performance.now(), multi: false, fired: false, d0: 0, scrub: false, smp: [] };
    if (PT.size >= 2) { G.multi = true; if (G.scrub) { V.scrubEnd(0); G.scrub = false } if (!G.d0) G.d0 = dist() } });
  cv.addEventListener('pointermove', e => { const p = PT.get(e.pointerId); if (!p || !G) return; p.x = e.clientX; p.y = e.clientY;
    if (G.multi) { if (PT.size >= 2 && !G.fired && G.d0 > 0) { const r = dist() / G.d0; if (r > 1.2) { G.fired = true; deeper() } else if (r < .83) { G.fired = true; up() } } return }
    const dx = e.clientX - G.x0, dy = e.clientY - G.y0;
    if (!G.scrub && st.l === 0 && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { G.scrub = true; V.scrubStart() }
    if (G.scrub) { V.scrub(-dx / (innerWidth * .55)); G.smp.push([performance.now(), dx]); if (G.smp.length > 6) G.smp.shift() } });
  function release(e, cancel) { if (!PT.has(e.pointerId)) return; PT.delete(e.pointerId); if (!G) return;
    if (G.scrub) { const s = G.smp, v = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / Math.max(1, s[s.length - 1][0] - s[0][0]) : 0; const d = V.scrubEnd(-v); G.scrub = false; if (d !== st.s) { const from = { s: st.s, l: 0, j: 0 }; st.s = d; st.l = 0; st.j = 0; syncUI() } }
    else if (!G.multi && !cancel) { const dx = e.clientX - G.x0, dy = e.clientY - G.y0, dt = performance.now() - G.t0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > 1.3 * Math.abs(dy)) nextSpec(dx < 0 ? 1 : -1);
      else if (Math.hypot(dx, dy) < 12 && dt < 600) { const h = V.hit(e.clientX, e.clientY); if (h === 'focus') st.l === 0 ? deeper() : openPage(); else if (h && h.s != null) go(h.s, h.l, h.j) } }
    if (PT.size === 0) G = null }
  cv.addEventListener('pointerup', e => release(e, false)); cv.addEventListener('pointercancel', e => release(e, true));
  ['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => cv.addEventListener(t, e => e.preventDefault(), { passive: false }));
  cv.addEventListener('contextmenu', e => e.preventDefault());
}
window.__oa = { st, deeper, up, next: () => nextSpec(1), prev: () => nextSpec(-1), sheet: openSheet, page: openPage, go, view: () => V && V.debug() };

/* =====================================================================================================
 the view
 ===================================================================================================== */
async function makeView(THREE) {
  const { loadCup } = await import('./shared/cup.js');
  const Vc = (x, y, z) => new THREE.Vector3(x, y, z);
  const cv = $('#c'), R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060508); scene.fog = new THREE.Fog(0x060508, 9, 34);
  const cam = new THREE.PerspectiveCamera(38, 1, .05, 120);
  const TL = new THREE.TextureLoader();
  const texCache = new Map();
  const tex = url => { if (!texCache.has(url)) { const t = TL.load(url, () => need = true); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; texCache.set(url, t) } return texCache.get(url) };
  let need = true;
  /* soft radial sprite (light pools, contact shadows, haze) */
  const radial = (inner, outer) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t };
  const POOL = radial('rgba(255,226,180,0.55)', 'rgba(255,226,180,0)'), SHADOW = radial('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)'), GLOW = radial('rgba(255,236,205,0.22)', 'rgba(255,236,205,0)');

  /* ---------- the hall ---------- */
  const aspect = () => innerWidth / innerHeight;
  const WZ = 17, D = 15, caseX = i => (i % 2 ? 1.5 : -1.5);
  const C = SP.map(sp => Vc(caseX(sp.i), 0, -sp.i * D));
  scene.add(new THREE.HemisphereLight(0x8090b0, 0x0a0808, .35));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 140), new THREE.MeshStandardMaterial({ color: 0x0d0b0f, roughness: .92, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1.02, -50); scene.add(floor);
  /* faint floor lines leading down the hall (Spirit Eye's water rings, laid straight) */
  { const pts = []; for (let k = -6; k <= 6; k++) { pts.push(Vc(k * 1.4, -1.0, WZ + 8), Vc(k * 1.4 * .6, -1.0, -SP.length * D - 6)) }
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8c7a62, transparent: true, opacity: .07 }))) }
  /* motes: fixed points of dust in the light (positions, not a loop) */
  { const n = 900, a = new Float32Array(n * 3); for (let k = 0; k < n; k++) { a[k * 3] = (Math.random() - .5) * 14; a[k * 3 + 1] = Math.random() * 5 - 1; a[k * 3 + 2] = WZ + 4 - Math.random() * (SP.length * D + 26) }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffe9c8, size: .025, transparent: true, opacity: .35, depthWrite: false }))) }

  const W = 2.4, H = 2.1, DP = 1.8; /* case inside size */
  const glassM = new THREE.MeshBasicMaterial({ color: 0xbfd4e6, transparent: true, opacity: .045, depthWrite: false, side: THREE.DoubleSide });
  const edgeM = new THREE.LineBasicMaterial({ color: 0xd8dfe8, transparent: true, opacity: .5 });
  const plinthM = new THREE.MeshStandardMaterial({ color: 0x17141a, roughness: .85 });
  const planes = []; /* every photo plane: {mesh, s, l, j} */
  const focusOf = []; /* per specimen, the whole-piece target */
  let cup = null;
  SP.forEach(sp => {
    const g = new THREE.Group(); g.position.copy(C[sp.i]); scene.add(g); sp.g = g;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + .3, 1.0, DP + .3), plinthM); plinth.position.y = -.5; g.add(plinth);
    const box = new THREE.BoxGeometry(W, H, DP); box.translate(0, H / 2, 0);
    const glass = new THREE.Mesh(box, glassM); glass.renderOrder = 5; g.add(glass);
    const ed = new THREE.LineSegments(new THREE.EdgesGeometry(box), edgeM); g.add(ed);
    /* the case light: a warm pool on the case floor, a contact shadow, a soft glow behind, and a spot from above */
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), new THREE.MeshBasicMaterial({ map: POOL, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = .004; g.add(pool);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshBasicMaterial({ map: GLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.position.set(0, 1.1, -DP / 2 - .05); g.add(glow);
    const spot = new THREE.SpotLight(0xffe3bd, 26, 9, .42, .7, 2); spot.position.set(.25, H + 2.2, .9); spot.target.position.set(0, .3, 0); g.add(spot, spot.target);
    /* the column of light below the case: the way down to the deeper layers */
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.55, .9, 24, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe0b0, transparent: true, opacity: .03, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    beam.position.set(0, -13, -3.2); g.add(beam);
    /* whole piece */
    const f0 = sp.L[0].frames[0];
    if (sp.mesh) { focusOf[sp.i] = { y: .55, w: 1.5, h: 1.25 } }
    else {
      const h = f0.cut ? 1.45 : 1.55, w = h * f0.w / f0.h, m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(f0.img), transparent: true, alphaTest: f0.cut ? .02 : 0, color: 0xf2eee8, depthWrite: true, side: THREE.DoubleSide }));
      const lift = f0.cut && f0.sit === false ? .2 : 0; m.position.set(0, h / 2 + .04 + lift, -.15); g.add(m); planes.push({ mesh: m, s: sp.i, l: 0, j: 0, whole: true });
      if (!f0.cut) { const back = new THREE.Mesh(new THREE.PlaneGeometry(w + .06, h + .06), new THREE.MeshBasicMaterial({ color: 0x000000 })); back.position.set(0, h / 2 + .04, -.17); g.add(back) }
      focusOf[sp.i] = { y: h / 2 + .04 + lift, w: Math.max(w, 1.4) + .2, h: h + .25 };
    }
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .7), new THREE.MeshBasicMaterial({ map: SHADOW, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.set(0, .006, -.05); g.add(sh);
    /* deeper layers: photo planes at staggered distances behind the case, each layer a level lower */
    sp.L.forEach((L, li) => { if (!li) return; L.frames.forEach((f, j) => {
      const h = 1.5, w = h * f.w / f.h, m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: null, transparent: true, opacity: 0, color: 0xefebe4, depthWrite: false }));
      m.userData.url = f.img; m.userData.size = [w, h];
      m.position.copy(layerPos(li, j)); m.visible = false; g.add(m); planes.push({ mesh: m, s: sp.i, l: li, j });
    }) });
  });
  function layerPos(li, j) { return Vc((j % 2 ? .75 : -.75) * Math.min(1, aspect() * .9), 1.0 - li * 6.0, -3.2 - j * 2.7) }
  /* the mesh cup, in the joio case */
  const JI = SP.findIndex(s => s.mesh);
  if (JI >= 0) {
    try { cup = await loadCup(THREE, new URL('../cup/joio-cup.glb', import.meta.url)); const k = 1.35 / .08; cup.scale.setScalar(k); cup.position.set(0, .0, -.05); cup.rotation.y = .6; SP[JI].g.add(cup);
      const key = new THREE.DirectionalLight(0xfff1dc, 1.6); key.position.set(-1.2, 2.2, 3); key.target = cup; SP[JI].g.add(key); const fill = new THREE.PointLight(0xc9d6ff, 1.4, 5, 2); fill.position.set(1.4, .9, 1.4); SP[JI].g.add(fill) }
    catch (e) { console.warn('cup', e) }
  }
  /* the board at the mouth of the hall: all 14 Objects board cards on one wall */
  const wall = new THREE.Group(); wall.position.set(0, .9, WZ); scene.add(wall);
  { const cols = 7, cw = .78, chh = 1.0, gap = .1; BOARD.forEach((b, k) => { if (!b.th) return; const r = Math.floor(k / cols), c = k % cols;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(cw, chh), new THREE.MeshBasicMaterial({ map: tex(b.th), transparent: true, opacity: .9, depthWrite: false }));
      m.position.set((c - (cols - 1) / 2) * (cw + gap), (r ? -1 : 1) * (chh + gap) / 2, 0); m.userData.slug = b.slug; wall.add(m) }) }

  /* ---------- poses ---------- */
  const fitDist = (w, h) => { const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), land = aspect() > 1.5 && innerHeight < 520; const hh = h * (land ? 1.3 : 1.42), ww = w * 1.18; return Math.max(hh / (2 * t), ww / (2 * t * aspect())) };
  function pose(s, l, j) {
    const c = C[s];
    if (l === 0) { const look = Vc(c.x, H * .46, c.z), d = fitDist(aspect() < .8 ? W * .92 : W + .5, H + .35) + DP / 2; return { p: Vc(c.x + .3, H * .46 + .5, c.z + d), l: look } }
    const P = layerPos(l, j).add(c), sz = planes.find(q => q.s === s && q.l === l && q.j === j).mesh.userData.size, d = fitDist(sz[0], sz[1]);
    return { p: Vc(P.x * .6 + c.x * .4, P.y + .12, P.z + d), l: Vc(P.x, P.y, P.z) };
  }
  const gate = () => ({ p: Vc(0, 1.0, WZ + 6.5), l: Vc(0, .9, WZ) });
  /* ---------- glide (Spirit Eye ease, curved path through a waypoint) ---------- */
  const bez = (x1, y1, x2, y2) => { const cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t, dcb = (t, a, b) => 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s } return cb(Math.max(0, Math.min(1, t)), y1, y2) } };
  const EASE = bez(.22, 1, .36, 1);
  let G = null, curP = gate(), at = { s: st.s, l: st.l, j: st.j }, scrubS = null, scrub0 = 0;
  const qb = (a, m, b, t) => a.clone().multiplyScalar((1 - t) * (1 - t)).add(m.clone().multiplyScalar(2 * t * (1 - t))).add(b.clone().multiplyScalar(t * t));
  function glidePoses(A, B, dur, mid, done) { G = { A, B, t0: performance.now(), d: dur, mid, done } }
  function midFor(A, B, kind) {
    const m = A.p.clone().lerp(B.p, .5);
    if (kind === 'spec') m.y += 1.1; /* rise a little between cases, through the dark */
    if (kind === 'down') { m.z += 1.2 } /* ease back as the camera sinks down the column */
    if (kind === 'frame') { m.z += .6 }
    return { p: m, l: A.l.clone().lerp(B.l, .5) };
  }
  function glideTo(from, to, opt) {
    const A = { p: cam.position.clone(), l: curLook.clone() }, B = pose(to.s, to.l, to.j);
    const kind = from.s !== to.s ? 'spec' : from.l !== to.l ? 'down' : 'frame';
    const dist = A.p.distanceTo(B.p), dur = kind === 'spec' ? Math.min(1500, 700 + dist * 40) : kind === 'down' ? 1100 : 650;
    glidePoses(A, B, dur, midFor(A, B, kind)); at = { ...to }; loadNear(); need = true;
  }
  function arrive() { const B = pose(at.s, at.l, at.j); cam.position.copy(gate().p); curLook.copy(gate().l); loadNear(); glidePoses({ p: gate().p, l: gate().l }, B, 1700, { p: Vc(B.p.x * .5, 1.2, WZ - 1), l: Vc(B.l.x * .5, 1.0, 2) }) }
  function leave(cb) { const A = { p: cam.position.clone(), l: curLook.clone() }, B = gate(); glidePoses(A, B, 1200, { p: Vc(A.p.x * .5, 1.3, (A.p.z + B.p.z) / 2), l: Vc(0, 1, (A.l.z + WZ) / 2) }, cb) }
  /* scrub along the hall between cases (case level only) */
  function scrubStart() { scrubS = at.s; scrub0 = at.s; G = null }
  function scrub(ds) { scrubS = Math.max(-.25, Math.min(SP.length - .75, scrub0 + ds)); need = true }
  function scrubEnd(v) { if (scrubS == null) return at.s; let t = Math.abs(v) > .25 ? (v > 0 ? Math.floor(scrubS + 1e-6) + 1 : Math.ceil(scrubS - 1e-6) - 1) : Math.round(scrubS);
    if (Math.abs(scrubS - scrub0) < .25) t = scrub0; t = Math.max(0, Math.min(SP.length - 1, t)); scrubS = null;
    const A = { p: cam.position.clone(), l: curLook.clone() }, B = pose(t, 0, 0); glidePoses(A, B, 520, { p: A.p.clone().lerp(B.p, .5), l: A.l.clone().lerp(B.l, .5) }); at = { s: t, l: 0, j: 0 }; loadNear(); return t }
  function scrubPose(x) { const i = Math.max(0, Math.min(SP.length - 2, Math.floor(x))), f = x - i, A = pose(i, 0, 0), B = pose(i + 1, 0, 0), m = midFor(A, B, 'spec'), t = f;
    return { p: qb(A.p, m.p, B.p, t), l: qb(A.l, m.l, B.l, t) } }
  /* textures for the planes near where you are */
  function loadNear() { planes.forEach(q => { if (q.whole) return; const near = Math.abs(q.s - at.s) <= 0 && Math.abs(q.l - at.l) <= 1; if (near && !q.mesh.material.map) { q.mesh.material.map = tex(q.mesh.userData.url); q.mesh.material.needsUpdate = true } }) }
  /* ---------- per frame ---------- */
  const curLook = gate().l.clone();
  function layout() { R.setSize(innerWidth, innerHeight, false); cam.aspect = aspect(); cam.updateProjectionMatrix();
    planes.forEach(q => { if (!q.whole) q.mesh.position.copy(layerPos(q.l, q.j)) }); if (!G && scrubS == null) { const B = pose(at.s, at.l, at.j); cam.position.copy(B.p); curLook.copy(B.l) } need = true }
  addEventListener('resize', layout); layout(); cam.position.copy(gate().p);
  let lastF = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (G) { const u = Math.min(1, (now - G.t0) / G.d), k = EASE(u); cam.position.copy(qb(G.A.p, G.mid.p, G.B.p, k)); curLook.copy(qb(G.A.l, G.mid.l, G.B.l, k)); need = true; html.classList.toggle('busy', u < .7);
      if (u >= 1) { const d = G.done; G = null; html.classList.remove('busy'); d && d() } }
    else if (scrubS != null) { const P = scrubPose(Math.max(0, Math.min(SP.length - 1, scrubS))); cam.position.copy(P.p); curLook.copy(P.l) }
    if (!need && !G && scrubS == null) { lastF = now; return } need = false;
    cam.lookAt(curLook);
    /* the cup turns with the camera's place along the hall (a position, not a loop) */
    if (cup) cup.rotation.y = .6 + (cam.position.x - C[JI].x) * .35 + (cam.position.z - C[JI].z) * .03;
    /* planes: only the current specimen's current layer (and, during a glide, the next one) show; nearer frames brighter, farther ones dim into the dark */
    const cy = cam.position.y;
    const dt = Math.min(.1, (now - lastF) / 1000); lastF = now; let moving = false;
    planes.forEach(q => { if (q.whole) return; const m = q.mesh;
      let t = 0;
      if (q.s === at.s && q.l === at.l) { const k = q.j - at.j; t = k === 0 ? 1 : k > 0 ? Math.max(0, .5 - .14 * (k - 1)) : 0 }
      if (G && q.s === at.s && q.l === G.fromL && q.l !== at.l && q.j === G.fromJ) t = .0;
      const o = m.material.opacity + (t - m.material.opacity) * (1 - Math.exp(-dt / .16));
      m.material.opacity = Math.abs(o - t) < .004 ? t : o; if (m.material.opacity !== t) moving = true;
      m.renderOrder = 10 - q.j; m.visible = m.material.opacity > .01 });
    if (moving) need = true;
    wall.children.forEach(m => { const d = cam.position.z - WZ; m.material.opacity = d > 0 ? Math.min(.92, d / 3) : 0; m.visible = d > .05 });
    floor.visible = cy > -1.0;
    R.render(scene, cam);
  }
  const tmp = new THREE.Vector3();
  requestAnimationFrame(frame);
  /* hits: the case (or its photo) = 'focus' at the case level; the current photo plane = 'focus'; another visible plane = go there */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hit(x, y) {
    ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
    if (at.l === 0) { const g = SP[at.s].g, b = new THREE.Box3(Vc(-W / 2, 0, -DP / 2).add(g.position), Vc(W / 2, H, DP / 2).add(g.position)); if (ray.ray.intersectsBox(b)) return 'focus';
      for (const sp of SP) { if (sp.i === at.s) continue; const bb = new THREE.Box3(Vc(-W / 2, 0, -DP / 2).add(sp.g.position), Vc(W / 2, H, DP / 2).add(sp.g.position)); if (ray.ray.intersectsBox(bb)) return { s: sp.i, l: 0, j: 0 } } return null }
    const vis = planes.filter(q => !q.whole && q.mesh.visible && q.mesh.material.opacity > .2).map(q => q.mesh), h = ray.intersectObjects(vis, false)[0];
    if (!h) return null; const q = planes.find(q => q.mesh === h.object); if (q.l === at.l && q.j === at.j) return 'focus'; return { s: q.s, l: q.l, j: q.j };
  }
  return { glideTo, arrive, leave, scrubStart, scrub, scrubEnd, hit, layout, debug: () => ({ at, cam: cam.position.toArray().map(v => +v.toFixed(2)), glide: !!G, cup: !!cup, tex: texCache.size }) };
}
