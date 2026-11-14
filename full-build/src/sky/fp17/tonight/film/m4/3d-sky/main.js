/* u4-opus-m4/3d-sky (the six chapters in a 3d sky). site-3d's sky (three.js r160 starfield shader, nebula glows, FogExp2)
 with Option A's stability rules: still arrival, every chapter named, one gesture = one step, back + home + you-are-here.
 Film is layered: L1 r3 pyramid · L2 one film forward · L3 viewer · L4 its stills, one layer at a time.
 No service worker. No autoplay. Never links off-site to a video host. Data + media: ../data.json, ../media/. */
import * as THREE from './vendor/three.module.min.js';
const html = document.documentElement, $ = s => document.querySelector(s);
const PRIVATE = (function () { var H = {}; [1374678362,1596214955,1579437336,1623527748,1022601639,921788830,1859290985,2012832049,1545882098,4278889348,3125354911,3142132530].forEach(function (h) { H[h] = 1 }); function f(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 } return h } return { test: function (s) { return (String(s).toUpperCase().match(/IMG_\d{4}|[0-9A-F]{8}/g) || []).some(function (t) { return H[f(t)] }) } } })();
const ORDER = ['film', 'photo', 'objects', 'sound', 'about', 'space'];
const NAME = { film: 'Film', photo: 'Photo', objects: 'Objects', sound: 'Sound', about: 'About', space: 'Spaces' };
const SPF = { p: [[0.5,0.4889,0.99],[0.1111,0.5278,0.84],[0.8819,0.5111,0.9],[0.425,0.2111,0.76],[0.5889,0.2194,0.8],[0.2708,0.3,0.7],[0.7361,0.3222,0.7],[0.3028,0.7389,0.66],[0.5028,0.8167,0.72],[0.7,0.7222,0.64],[0.5,0.3667,0.5],[0.4083,0.4972,0.4],[0.5944,0.4778,0.4]], e: [[1,5],[5,3],[3,4],[4,6],[6,2],[1,7],[7,8],[9,2],[10,0]] }; /* tonight: the draft Spaces figure, _tn/spaces-glyph.svg */
const PYR = ['weird-kid', 'sleepwalker', 'celebraciones', 'legends', 'stay-gold', 'just-the-beginning']; /* r3: 1 / 2 / 3 */
/* the Film viewer's 'watch' opens m4's own full-screen film player (../js/filmplayer.js + ../js/scope.js, the 2D site's Scope
 player): every film plays natively from its own files; a film with no native file says 'stills only'. */
const FILMS = {}; (window.GJ_FILMS || []).forEach(f => { if (f && f.s) FILMS[f.s] = f });
const up = p => p ? '../' + p : '';
let R; try { R = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: false, powerPreference: 'high-performance' }) } catch (e) { html.className = 'nogl'; throw e }
R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setClearColor(0x04060c, 1);
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x04060c, .0026);
const FOV = 50, cam = new THREE.PerspectiveCamera(FOV, 1, .1, 1200); const TAN = Math.tan(FOV * Math.PI / 360);
/* ---------- ease + tweens (fixed duration, clamped: no springs, no overshoot) ---------- */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const TW = new Set(); let NOW = performance.now();
function tween(o, to, dur) { /* o: {v:{...}} values; to: target values */
  const from = {}; for (const k in to) from[k] = o.v[k];
  o.tw = { from, to, t0: NOW, dur: dur || 1000 }; TW.add(o) }
function stepTweens() { let moving = false; TW.forEach(o => { const t = Math.min(1, (NOW - o.tw.t0) / o.tw.dur), e = ease(t);
  for (const k in o.tw.to) o.v[k] = o.tw.from[k] + (o.tw.to[k] - o.tw.from[k]) * e; if (o.apply) o.apply(); if (t >= 1) TW.delete(o); else moving = true }); return moving }
const CAM = { v: { x: 0, y: 0, z: 60 }, apply() { cam.position.set(this.v.x, this.v.y, this.v.z) } };
/* ---------- the sky: site-3d starfield shader, subtle twinkle, same with Reduce Motion ---------- */
const U = { uT: { value: 0 }, uPx: { value: 1 } };
(function stars() { const n = innerWidth < 700 ? 2600 : 4200, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), ph = new Float32Array(n), sz = new Float32Array(n), col = new Float32Array(n * 3);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const z = -10 - Math.pow(rnd(), .8) * 420, r = 6 + Math.pow(rnd(), .7) * 190, a = rnd() * 6.283;
    p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = Math.sin(a) * r * .75; p[i * 3 + 2] = z; ph[i] = rnd();
    sz[i] = rnd() < .05 ? 3.2 + rnd() * 2.5 : .9 + rnd() * 1.6; const t = rnd(); col[i * 3] = .75 + .25 * t; col[i * 3 + 1] = .82 + .1 * t; col[i * 3 + 2] = 1 - .15 * t * t }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1)); g.setAttribute('aSz', new THREE.BufferAttribute(sz, 1)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aPh;attribute float aSz;attribute vec3 aCol;uniform float uT,uPx;varying float vA;varying vec3 vC;
    void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float d=max(.1,-mv.z);
      float tw=1.+.2*sin(uT*(.5+aPh*1.1)+aPh*60.)*step(.55,fract(aPh*7.));
      gl_PointSize=clamp(aSz*uPx*tw*170./d,1.2,26.);
      vA=1.6*exp(-d*.004)*smoothstep(.5,6.,d)*(.8+.2*tw);vC=aCol;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);a*=a;gl_FragColor=vec4(vC*a*vA,1.);}` });
  scene.add(new THREE.Points(g, m)) })();
function glowTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t }
const GT = glowTex();
const glow = (col, op, sc) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.set(sc, sc, 1); return s };
[[-60, 30, -200, 0x27407a, 160], [70, -20, -320, 0x4a2a6a, 200], [10, -40, -90, 0x173c4a, 120]].forEach(n => { const s = glow(n[3], .22, n[4]); s.position.set(n[0], n[1], n[2]); scene.add(s) });
/* ---------- data ---------- */
let D, CH = [], PY = [];
const cleanCards = cs => cs.filter(c => !PRIVATE.test(JSON.stringify(c.media || {}) + c.id));
function layoutPos(i) { const a = innerWidth / innerHeight, z = [0, -1.5, 1, -1, 1.5, -.5][i];
  if (a < 1) { const c = i % 2, r = Math.floor(i / 2); return [c ? 4.7 : -4.7, 8.6 - r * 8.6, z] }
  const c = i % 3, r = Math.floor(i / 3); return [(c - 1) * 9.6, r ? -4.6 : 4.6, z] }
const RAD = 3;
function buildClusters() { ORDER.forEach((k, i) => { const ch = D.chapters.find(c => c.k === k); if (!ch) return; const cards = cleanCards(ch.cards);
  const tint = new THREE.Color(...((k === 'space' ? '206,198,255' : ch.tint) || '220,230,255').split(',').map(v => +v / 255));
  const g = new THREE.Group(); scene.add(g);
  let sd = i * 97 + 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const n = Math.max(6, Math.min(14, 4 + Math.round(Math.sqrt(cards.length) * 1.6))), pts = [];
  for (let j = 0; j < n; j++) { const a = j / n * 6.283 + rnd() * .6, r = (j ? .9 : 0) + rnd() * 1.9; pts.push(new THREE.Vector3(Math.cos(a) * r * 1.2, Math.sin(a) * r * .85, (rnd() - .5) * 1.6)) }
  if (k === 'space') { pts.length = 0; SPF.p.forEach(q => pts.push(new THREE.Vector3((q[0] - .5) * 7, (.5 - q[1]) * 3.5, (q[2] - .7) * 1.2))) }
  const sp = pts.map((p, j) => { const s = glow(tint, 1, j ? .55 + rnd() * .55 : 1.5); s.position.copy(p); g.add(s); return s });
  const lp = []; if (k === 'space') SPF.e.forEach(e => lp.push(pts[e[0]], pts[e[1]])); else for (let j = 1; j < n; j++) { lp.push(pts[j], pts[j % (n - 1) + 1]); if (j % 3 === 1) lp.push(pts[0], pts[j]) }
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: tint, transparent: true, opacity: .4, depthWrite: false })); g.add(lines);
  const neb = glow(tint, .16, 10); neb.position.z = -1.5; g.add(neb);
  const lab = document.createElement('button'); lab.className = 'lab'; lab.innerHTML = `<span class="n">${NAME[k]}</span><span class="k">${cards.length} ${cards.length === 1 ? 'piece' : 'pieces'}</span>`;
  lab.setAttribute('aria-label', `${NAME[k]}, ${cards.length} pieces`); lab.addEventListener('click', e => { e.stopPropagation(); if (S.lvl === 'map') land(C) }); $('#labels').appendChild(lab);
  const C = { k, i, ch, cards, g, sp, lines, neb, lab, c: new THREE.Vector3(), o: { v: { a: 1 }, apply() { sp.forEach(s => s.material.opacity = this.v.a); lines.material.opacity = .4 * this.v.a; neb.material.opacity = .16 * Math.max(.4, this.v.a) } } };
  CH.push(C) }); placeClusters() }
function placeClusters() { CH.forEach(C => { C.c.set(...layoutPos(C.i)); C.g.position.copy(C.c) }) }
/* ---------- film pyramid (L1) and one film forward (L2) ---------- */
let ROWS; const TWD = 2, THT = TWD * 9 / 16, GAPX = .28; ROWS = THT + (innerWidth < 600 ? 1.45 : 1.05); /* room for title + role under each still */
const LOADER = new THREE.TextureLoader();
function pyrSlot(j) { const row = j === 0 ? 0 : j < 3 ? 1 : 2, idx = j === 0 ? 0 : j < 3 ? j - 1 : j - 3, cnt = row + 1;
  return [(idx - (cnt - 1) / 2) * (TWD + GAPX), (1 - row) * ROWS + .35, 1.4] }
function buildPyramid() { const F = CH.find(C => C.k === 'film'); if (!F) return;
  PYR.forEach((slug, j) => { const cd = F.cards.find(c => c.slug === slug); if (!cd) return;
    const mat = new THREE.MeshBasicMaterial({ color: 0x141c2c, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(TWD, THT), mat); m.visible = false; m.renderOrder = 3; scene.add(m);
    const lb = document.createElement('div'); lb.className = 'fl off'; lb.innerHTML = `<span class="t"></span><span class="r"></span><span class="m"></span>`;
    lb.querySelector('.t').textContent = cd.title; lb.querySelector('.r').textContent = cd.role || ''; lb.querySelector('.m').textContent = cd.meta || ''; $('#flab').appendChild(lb);
    const P = { j, cd, m, lb, loaded: false, v: { x: 0, y: 0, z: 0, s: 1, o: 0 }, apply() { m.position.set(this.v.x, this.v.y, this.v.z); m.scale.set(this.v.s, this.v.s, 1); mat.opacity = this.v.o; m.visible = this.v.o > .005 } };
    PY.push(P) }) }
function loadPyr() { PY.forEach(P => { if (P.loaded) return; P.loaded = true; LOADER.load(up(P.cd.media.big || P.cd.media.thumb), tx => { tx.colorSpace = THREE.SRGBColorSpace;
  const ia = tx.image.width / tx.image.height, ca = 16 / 9; if (ia > ca) { tx.repeat.set(ca / ia, 1); tx.offset.set((1 - ca / ia) / 2, 0) } else { tx.repeat.set(1, ia / ca); tx.offset.set(0, (1 - ia / ca) / 2) }
  P.m.material.map = tx; P.m.material.color.set(0xffffff); P.m.material.needsUpdate = true }) }) }
/* ---------- framing: fit a box into a fraction of the viewport (camera never rotates, only eases) ---------- */
function fitDist(bw, bh, fw, fh) { const a = innerWidth / innerHeight; return Math.max(bw / 2 / (TAN * a * fw), bh / 2 / (TAN * fh)) }
function mapFrame() { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; CH.forEach(C => { x0 = Math.min(x0, C.c.x - RAD); x1 = Math.max(x1, C.c.x + RAD); y0 = Math.min(y0, C.c.y - RAD - 1.6); y1 = Math.max(y1, C.c.y + RAD) });
  const d = fitDist(x1 - x0, y1 - y0, .9, .74); return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 - d * TAN * .02, z: d } }
function chapterFrame(C) { if (C.k === 'film') { const bw = 3 * TWD + 2 * GAPX + .4, bh = 2 * ROWS + THT + 1.1, d = fitDist(bw, bh, .94, .6);
    const pyMid = C.c.y + pyrSlot(0)[1] - (ROWS * 2) / 2 - .2; return { x: C.c.x, y: pyMid - d * TAN * .02, z: C.c.z + 1.4 + d } }
  const d = fitDist(RAD * 2.6, RAD * 2.4, .9, .42); return { x: C.c.x, y: C.c.y - d * TAN * .42, z: C.c.z + d } }
function camTo(f, dur) { tween(CAM, { x: f.x, y: f.y, z: f.z }, dur || 1100) }
/* ---------- state ---------- */
const S = { lvl: 'map', C: null, fi: 0, from: null, list: null, idx: 0, si: 0 };
const WHERE = $('#where b'), BACK = $('#back'), LAND = $('#land'), ROW = $('#row'), ALL = $('#all'), VW = $('#vw'), ST = $('#st'), FP = $('#fprev'), FN = $('#fnext');
function where() { const p = ['map']; if (S.C) p.push(NAME[S.C.k]); if (S.lvl === 'forward' || (S.C && S.C.k === 'film' && (S.lvl === 'viewer' || S.lvl === 'stills') && S.from === 'forward')) p.push(PY[S.fi].cd.title);
  if (S.lvl === 'all' || ((S.lvl === 'viewer' || S.lvl === 'stills') && S.from === 'all')) p.push('all ' + S.C.cards.length);
  if ((S.lvl === 'viewer' || S.lvl === 'stills') && S.from !== 'forward') p.push(tt(S.list[S.idx]));
  if (S.lvl === 'viewer' && S.from === 'forward') p.push('watch'); if (S.lvl === 'stills') p.push('stills ' + (S.si + 1) + '/' + STILLS.length);
  WHERE.textContent = p.join(' › '); BACK.hidden = S.lvl === 'map'; document.body.classList.toggle('landed', S.lvl !== 'map') }
const tt = cd => !cd ? '' : cd.title && cd.title !== 'untitled' ? cd.title : (cd.meta || 'photograph');
let hintT = 0, hint0 = true; function hint(s, ms) { const h = $('#hint'); h.textContent = s; if (hint0) { hint0 = false; h.style.transition = 'none'; h.classList.add('show'); void h.offsetWidth; h.style.transition = '' } h.classList.add('show'); clearTimeout(hintT); hintT = setTimeout(() => h.classList.remove('show'), ms || 4500) }
const HINT = { map: 'tap or pinch a chapter to go in', film: 'tap a film to bring it forward · pinch out or back to rise', forward: 'tap the film to open it · swipe or ‹ › for the next', chapter: 'tap a still to open it · pinch out or back to rise', stills: 'tap for the next still · back to rise' };
function clusterAlpha(C0) { CH.forEach(C => tween(C.o, { a: !C0 ? 1 : C === C0 ? (C.k === 'film' ? .28 : 1) : .35 }, 900)) }
function goMap(dur) { closeOverlays(); S.lvl = 'map'; S.C = null; LAND.hidden = true; pyrTargets(); clusterAlpha(null); camTo(mapFrame(), dur); where(); hint(HINT.map) }
function land(C, dur) { closeOverlays(); S.lvl = 'chapter'; S.C = C; clusterAlpha(C); camTo(chapterFrame(C), dur);
  if (C.k === 'film') { loadPyr(); ROW.innerHTML = '' } else fillRow(C);
  $('#lh').innerHTML = `${NAME[C.k]}<small>${C.cards.length} pieces</small>`; $('#seeall').textContent = `see all ${C.cards.length} ›`;
  LAND.hidden = false; pyrTargets(); where(); hint(C.k === 'film' ? HINT.film : HINT.chapter) }
function forward(j) { S.lvl = 'forward'; S.fi = Math.max(0, Math.min(PY.length - 1, j)); LAND.hidden = true; pyrTargets(); where(); hint(HINT.forward) }
/* pyramid targets per level */
function pyrTargets() { const F = CH.find(C => C.k === 'film'); const on = S.C === F && (S.lvl === 'chapter' || S.lvl === 'forward');
  const f = S.C === F ? chapterFrame(F) : null;
  PY.forEach(P => { let t;
    if (!on) t = { ...slotWorld(F, P.j), s: 1, o: 0 };
    else if (S.lvl === 'chapter') t = { ...slotWorld(F, P.j), s: 1, o: 1 };
    else { const rel = P.j - S.fi; if (!rel) { const dF = f.z - (F.c.z + 1.4) , zf = f.z - dF * .55, dd = f.z - zf, a = innerWidth / innerHeight;
        const w = Math.min(.9 * 2 * dd * TAN * a, .5 * 2 * dd * TAN * 16 / 9); t = { x: f.x, y: f.y + dd * TAN * .1, z: zf, s: w / TWD, o: 1 } }
      else { const zb = F.c.z - 1.6, db = f.z - zb; t = { x: f.x + rel * (TWD + .35), y: f.y + db * TAN * .52, z: zb, s: 1, o: Math.abs(rel) > 2 ? .14 : .38 } } }
    tween(P, t, 950) });
  FP.hidden = FN.hidden = S.lvl !== 'forward'; FP.disabled = S.fi <= 0; FN.disabled = S.fi >= PY.length - 1 }
function slotWorld(F, j) { const s = pyrSlot(j); return { x: F.c.x + s[0], y: F.c.y + s[1], z: F.c.z + s[2] } }
/* ---------- landed row (non-film): 4 on a phone, up to 6 wide ---------- */
function thumbOf(cd) { const m = cd.media || {}; return m.thumb || m.big || '' }
function tile(cd, onClick) { const b = document.createElement('button'); b.className = 'tile'; const th = thumbOf(cd);
  if (th) b.innerHTML = `<span class="im" style="background-image:url('${up(th)}')"></span><span class="tt"></span>`; else { b.classList.add('txt'); b.innerHTML = `<span class="im"></span><span class="tt"></span>`; b.querySelector('.im').textContent = cd.title }
  b.querySelector('.tt').textContent = tt(cd); b.addEventListener('click', e => { e.stopPropagation(); onClick() }); return b }
function fillRow(C) { ROW.innerHTML = ''; const n = innerWidth < 600 ? 4 : 6; C.cards.slice(0, n).forEach((cd, i) => ROW.appendChild(tile(cd, () => openV(C.cards, i, 'chapter')))) }
function seeAll() { const C = S.C; if (!C) return; S.lvl = 'all'; const g = ALL.querySelector('.grid'); g.innerHTML = ''; ALL.querySelector('h2').textContent = `${NAME[C.k]} · ${C.cards.length}`;
  C.cards.forEach((cd, i) => g.appendChild(tile(cd, () => openV(C.cards, i, 'all')))); ALL.scrollTop = 0; ALL.hidden = false; where() }
/* ---------- viewer (L3) ---------- */
function openV(list, idx, from) { S.list = list; S.idx = idx; S.from = from; S.lvl = 'viewer'; renderV(); VW.hidden = false; where() }
function renderV() { const cd = S.list[S.idx], M = VW.querySelector('.m'), m = cd.media || {}; M.innerHTML = '';
  const add = (tag, props) => { const e = document.createElement(tag); Object.assign(e, props || {}); M.appendChild(e); return e };
  if (cd.kind === 'film' || cd.kind === 'reel') {
    add('img', { src: up(m.big || m.thumb), alt: cd.title });
    const FD = FILMS[cd.slug];
    if (FD && FD.play && window.GJ_FP) add('button', { className: 'act watch', textContent: '▶ watch' }).addEventListener('click', e => { e.stopPropagation(); GJ_FP.play(cd.slug) });
    else if (cd.kind === 'film') add('div', { className: 'note', textContent: 'stills only' });
    if (cd.kind === 'film') { const n = stillsOf(cd).length; add('button', { className: 'act', textContent: `stills · ${n} ›` }).addEventListener('click', e => { e.stopPropagation(); openStills() }) } }
  else if (cd.kind === 'player') { const box = add('div', { className: 'trk' }); (D.tracks || []).forEach(t => { const r = document.createElement('div'); r.innerHTML = `<span></span>`; r.firstChild.textContent = `${t.title} · ${t.artist}`; const a = document.createElement('audio'); a.controls = true; a.preload = 'none'; a.src = up(t.file); r.appendChild(a); box.appendChild(r) }) }
  else if (cd.chapter === 'about') {
    if (cd.kind === 'bio') add('p', { textContent: (D.bio || []).join('\n\n') });
    else if (cd.kind === 'poem') add('p', { textContent: (D.poem || []).join('\n') });
    else if (cd.kind === 'contact') add('a', { className: 'act', href: 'mailto:' + (D.email || cd.title), textContent: D.email || cd.title });
    else add('p', { textContent: cd.title }) }
  else { if (m.big || m.thumb) add('img', { src: up(m.big || m.thumb), alt: tt(cd) });
    if (cd.kind === 'sound') { const t = (D.tracks || []).find(t => cd.title.endsWith(t.title) && cd.title !== t.artist);
      if (t) { const a = add('audio', { controls: true, preload: 'none', src: up(t.file) }); a.style.width = 'min(420px,90vw)' }
      if (m.url && /^https:\/\/(www\.)?gilljames\.com\//i.test(m.url)) add('a', { className: 'act', href: m.url, target: '_blank', rel: 'noopener', textContent: (cd.meta || 'open') + ' ↗' }) }
    if (cd.body) add('p', { textContent: cd.body }) }
  const cap = VW.querySelector('.cap'); cap.innerHTML = ''; const sp = (c, s) => { if (!s) return; const e = document.createElement('div'); e.className = c; e.textContent = s; cap.appendChild(e) };
  if (cd.chapter !== 'about') { sp('t', cd.title !== 'untitled' ? cd.title : ''); sp('r', cd.role); sp('mm', [cd.meta, (cd.credits || []).join(' · ')].filter(Boolean).join(' · ')) }
  VW.querySelector('.pv').disabled = S.idx <= 0; VW.querySelector('.nx').disabled = S.idx >= S.list.length - 1; VW.querySelector('.n').textContent = `${S.idx + 1} / ${S.list.length}` }
function stepV(d) { const i = S.idx + d; if (i < 0 || i >= S.list.length) return; S.idx = i; if (S.from === 'forward') { S.fi = i; pyrTargets() } renderV(); where() }
VW.querySelector('.pv').addEventListener('click', e => { e.stopPropagation(); stepV(-1) }); VW.querySelector('.nx').addEventListener('click', e => { e.stopPropagation(); stepV(1) });
VW.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); back() });
/* ---------- stills (L4): one layer at a time ---------- */
let STILLS = [];
function stillsOf(cd) { const m = cd.media || {}, a = [m.big || m.thumb, ...(m.frames || [])].filter(Boolean); return a.filter((p, i) => a.indexOf(p) === i && !PRIVATE.test(p)) }
function openStills() { const cd = S.list[S.idx]; STILLS = stillsOf(cd); if (!STILLS.length) return; S.lvl = 'stills'; S.si = 0; const st = ST.querySelector('.stack'); st.innerHTML = '';
  STILLS.forEach(p => { const i = document.createElement('img'); i.src = up(p); i.alt = cd.title; st.appendChild(i) }); VW.querySelectorAll('audio,video').forEach(a => a.pause()); ST.hidden = false; showStill(); hint(HINT.stills) }
function showStill() { ST.querySelectorAll('.stack img').forEach((im, i) => { im.className = i === S.si ? 'on' : i < S.si ? 'past' : '' });
  ST.querySelector('.sc').textContent = `still ${S.si + 1} of ${STILLS.length}` + (S.si === STILLS.length - 1 ? ' · back to rise' : ' · tap for the next'); where() }
function stepStill(d) { const i = S.si + d; if (i < 0 || i >= STILLS.length) return; S.si = i; showStill() }
/* ---------- back / home ---------- */
function closeOverlays() { VW.hidden = true; ST.hidden = true; ALL.hidden = true; VW.querySelectorAll('audio,video').forEach(a => a.pause()) }
function back() { switch (S.lvl) {
  case 'stills': ST.hidden = true; S.lvl = 'viewer'; where(); break;
  case 'viewer': VW.hidden = true; VW.querySelectorAll('audio,video').forEach(a => a.pause()); if (S.from === 'all') { S.lvl = 'all'; where() } else if (S.from === 'forward') { forward(S.fi) } else { S.lvl = 'chapter'; where() } break;
  case 'all': ALL.hidden = true; S.lvl = 'chapter'; where(); break;
  case 'forward': land(S.C, 900); break;
  case 'chapter': goMap(); break } }
$('#home').addEventListener('click', e => { e.stopPropagation(); if (S.lvl !== 'map') goMap() }); BACK.addEventListener('click', e => { e.stopPropagation(); back() });
$('#seeall').addEventListener('click', e => { e.stopPropagation(); seeAll() });
FP.addEventListener('click', e => { e.stopPropagation(); if (S.lvl === 'forward' && S.fi > 0) forward(S.fi - 1) }); FN.addEventListener('click', e => { e.stopPropagation(); if (S.lvl === 'forward' && S.fi < PY.length - 1) forward(S.fi + 1) });
/* ---------- gestures: one gesture = one step ---------- */
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(), tmp = new THREE.Vector3();
function proj(v) { tmp.copy(v).project(cam); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z] }
function nearestCluster(x, y, max) { let b = null, bd = max; CH.forEach(C => { const p = proj(C.c), d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; b = C } }); return b }
function pyrAt(x, y) { v2.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(v2, cam); const h = ray.intersectObjects(PY.filter(P => P.m.visible && P.v.o > .5).map(P => P.m))[0]; return h ? PY.find(P => P.m === h.object) : null }
function stepIn(x, y, how) { /* returns true if it took a step */
  if (S.lvl === 'map') { const C = nearestCluster(x, y, how === 'tap' ? Math.min(innerWidth, innerHeight) * .2 : Math.min(innerWidth, innerHeight) * .45); if (C) { land(C); return true } return false }
  if (S.lvl === 'chapter' && S.C.k === 'film') { let P = pyrAt(x, y); if (!P && how !== 'tap') P = PY[0]; if (P) { forward(P.j); return true } return false }
  if (S.lvl === 'chapter') { if (how === 'tap') return false; const el = document.elementFromPoint(x, y), t = el && el.closest('.tile'); if (t) { t.click(); return true } return false }
  if (S.lvl === 'forward') { const P = pyrAt(x, y); if (how === 'tap' && P && P.j !== S.fi) { forward(P.j); return true } if (how !== 'tap' || (P && P.j === S.fi)) { openV(PY.map(P => P.cd), S.fi, 'forward'); return true } return false }
  if (S.lvl === 'viewer') { if (how === 'tap') return false; const cd = S.list[S.idx]; if (cd.kind === 'film') { openStills(); return true } return false }
  if (S.lvl === 'stills') { stepStill(1); return true } return false }
const PT = new Map(); let G = null;
addEventListener('pointerdown', e => { PT.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now(), tg: e.target });
  if (PT.size === 1) G = { fired: false, pinch: null, multi: false }; else if (PT.size === 2 && G) { const a = [...PT.values()]; G.multi = true; G.pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) } }, true);
addEventListener('pointermove', e => { const p = PT.get(e.pointerId); if (!p) return; p.x = e.clientX; p.y = e.clientY;
  if (G && G.pinch && PT.size >= 2 && !G.fired) { const a = [...PT.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), r = d / G.pinch, mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
    if (r > 1.3) { G.fired = true; stepIn(mx, my, 'pinch') } else if (r < .77) { G.fired = true; back() } } }, true);
function pend(e) { const p = PT.get(e.pointerId); if (!p) return; PT.delete(e.pointerId); if (PT.size || !G) return; const g = G; G = null; if (g.fired || g.multi) return;
  const dx = p.x - p.x0, dy = p.y - p.y0, dt = performance.now() - p.t0, onUI = p.tg.closest && p.tg.closest('button,a,audio,video,#all,#vw .m p');
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 900) { const d = dx < 0 ? 1 : -1;
    if (S.lvl === 'forward') { const j = S.fi + d; if (j >= 0 && j < PY.length) forward(j) } else if (S.lvl === 'stills') stepStill(d); else if (S.lvl === 'viewer' && !onUI) stepV(d); return }
  if (Math.hypot(dx, dy) < 10 && dt < 450 && !onUI) { if (S.lvl === 'stills') { stepStill(1); return } if (p.tg === $('#c') || p.tg.closest('#flab,#labels')) stepIn(p.x, p.y, 'tap') } }
addEventListener('pointerup', pend, true); addEventListener('pointercancel', e => { PT.delete(e.pointerId); if (!PT.size) G = null }, true);
['gesturestart', 'gesturechange'].forEach(t => addEventListener(t, e => e.preventDefault(), { passive: false }));
let W = { acc: 0, t: 0, latched: false };
addEventListener('wheel', e => { if (e.target.closest && e.target.closest('#all,#vw .m') && !e.ctrlKey) return; e.preventDefault(); const now = performance.now();
  if (now - W.t > 380) { W.acc = 0; W.latched = false } W.t = now; if (W.latched) return; W.acc += e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 4 : 1);
  if (W.acc < -60) { W.latched = true; stepIn(e.clientX, e.clientY, 'wheel') } else if (W.acc > 60) { W.latched = true; back() } }, { passive: false });
addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); back() } else if (e.key === 'Home' || e.key === 'h') goMap();
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const d = e.key === 'ArrowRight' ? 1 : -1; if (S.lvl === 'forward') { const j = S.fi + d; if (j >= 0 && j < PY.length) forward(j) } else if (S.lvl === 'viewer') stepV(d); else if (S.lvl === 'stills') stepStill(d) }
  else if (e.key === 'Enter' && (S.lvl === 'forward' || S.lvl === 'stills')) stepIn(innerWidth / 2, innerHeight / 2, 'key') });
/* ---------- DOM labels follow the (still) camera ---------- */
const HALF = new THREE.Vector3();
function placeLabels() { const showMap = S.lvl === 'map';
  CH.forEach(C => { const p = proj(HALF.set(C.c.x, C.c.y - RAD * .95, C.c.z)); C.lab.style.transform = `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) translate(-50%,0)`; C.lab.classList.toggle('off', !showMap) });
  const film = S.C && S.C.k === 'film' && (S.lvl === 'chapter' || S.lvl === 'forward');
  PY.forEach(P => { const fwd = S.lvl === 'forward' && P.j === S.fi, on = film && (S.lvl === 'chapter' || fwd);
    const hh = THT * P.v.s / 2, p = proj(HALF.set(P.v.x, P.v.y - hh - .04, P.v.z)), wpx = proj(HALF.set(P.v.x + TWD * P.v.s / 2, P.v.y, P.v.z))[0] - proj(HALF.set(P.v.x - TWD * P.v.s / 2, P.v.y, P.v.z))[0];
    P.lb.style.transform = `translate(${p[0].toFixed(1)}px,${(p[1] + 4).toFixed(1)}px) translate(-50%,0)`; P.lb.style.width = Math.max(90, Math.min(fwd ? 460 : 220, wpx)) + 'px';
    P.lb.classList.toggle('off', !on || P.v.o < .6); P.lb.classList.toggle('big', fwd) }) }
/* ---------- loop ---------- */
let fc = 0, ft = performance.now(), fps = 0, frames = 0;
function frame(now) { requestAnimationFrame(frame); NOW = now; frames++; fc++; if (now - ft >= 1000) { fps = fc * 1000 / (now - ft); fc = 0; ft = now }
  U.uT.value = now / 1000; stepTweens(); cam.updateMatrixWorld(); placeLabels(); R.render(scene, cam) }
function resize() { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); U.uPx.value = R.getPixelRatio() * innerHeight / 780;
  if (!CH.length) return; placeClusters(); const f = S.C ? chapterFrame(S.C) : mapFrame(); TW.delete(CAM); Object.assign(CAM.v, f); CAM.apply();
  PY.forEach(P => TW.delete(P)); const keep = S.lvl; pyrTargets(); PY.forEach(P => { if (P.tw) { Object.assign(P.v, P.tw.to); P.apply(); TW.delete(P) } }); if (S.C && S.C.k !== 'film' && keep === 'chapter') fillRow(S.C) }
addEventListener('resize', resize);
window.__hy = { st: () => ({ lvl: S.lvl, ch: S.C && S.C.k, fi: S.fi, si: S.si, idx: S.idx, cam: [cam.position.x, cam.position.y, cam.position.z], moving: TW.size, fps, frames, where: WHERE.textContent }),
  screen: k => proj(CH.find(C => C.k === k).c), pyr: j => proj(new THREE.Vector3(PY[j].v.x, PY[j].v.y, PY[j].v.z)) };
Promise.all([fetch('../data.json').then(r => r.json()), document.fonts.load('17px Julius'), document.fonts.load('13px Poppins')]).then(([d]) => { D = d; resize(); buildClusters(); buildPyramid();
  const f = mapFrame(); Object.assign(CAM.v, f); CAM.apply(); PY.forEach(P => { Object.assign(P.v, slotWorld(CH.find(C => C.k === 'film'), P.j)); P.apply() }); where(); hint(HINT.map, 7000);
  html.classList.add('ready'); requestAnimationFrame(frame) }).catch(e => { console.error(e); html.className = 'nogl' });
