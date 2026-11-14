/* inside/ · a 3D sky you fly through freely; boards, pieces and a room inside each piece.
   Levels (hash): '' far sky · #k constellation · #k/board · #<id> piece · #<id>/inside room.
   Going in pushes one history entry; going out is history.back() (or replaceState at the root), and restores the camera you left. */
import * as THREE from 'three';
import {D, M4, ORDER, load, layout, src} from './data.js';
import {Board} from './board.js';
import {Room} from './room.js';

const $ = id => document.getElementById(id);
const cv = $('gl'), labelsEl = $('labels');
const MINT = new THREE.Color(85 / 255, 218 / 255, 161 / 255);
let W = innerWidth, H = innerHeight, PORT = H > W * 1.05, DPR = Math.min(2, devicePixelRatio || 1);

const renderer = new THREE.WebGLRenderer({canvas: cv, antialias: DPR < 2, alpha: true, powerPreference: 'high-performance'});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(DPR);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 1, 12000);
const TAN = () => Math.tan(camera.fov * Math.PI / 360);

/* textures: m4's star glow (radial stops .95 / .4 / .08 / 0) and a hard white core */
function canvasTex(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const GLOW = canvasTex(128, 128, (q) => { const g = q.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.18, 'rgba(255,255,255,.4)'); g.addColorStop(.55, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = g; q.fillRect(0, 0, 128, 128); });
const CORE = canvasTex(32, 32, (q) => { const g = q.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#fff'); g.addColorStop(.55, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = g; q.fillRect(0, 0, 32, 32); });
const RING = canvasTex(64, 64, (q) => { q.strokeStyle = '#fff'; q.lineWidth = 3; q.beginPath(); q.arc(32, 32, 28, 0, 7); q.stroke(); });
export const TEX = {GLOW, CORE, RING, canvasTex};

/* ---------- sky ---------- */
const sky = new THREE.Group(); scene.add(sky);
let field = null;
const stars = [];   // {sp, core, b, tint, it?, pos:Vector3, px}
const thumbs = new Map(); // id -> mesh (sky thumbnails, lazy)
let lineMats = [], clusterLine = null, spokes = null;

function mkStar(pos, b, rgb, it) {
  const col = new THREE.Color(rgb[0], rgb[1], rgb[2]);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: GLOW, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .45 + .5 * b}));
  const core = new THREE.Sprite(new THREE.SpriteMaterial({map: CORE, color: 0xffffff, transparent: true, depthWrite: false, depthTest: false}));
  sp.position.copy(pos); core.position.copy(pos); sp.renderOrder = 1; core.renderOrder = 3;
  sky.add(sp, core);
  const s = {sp, core, b, rgb, it, pos: pos.clone(), a: 1, sel: 0, ph: Math.random() * 6};
  stars.push(s); if (it) it._star = s;
  return s;
}

function buildField() {
  const n = 1500, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const near = i < 520, u = Math.random(), v = Math.random();
    if (near) { pos[i * 3] = (Math.random() - .5) * 3600; pos[i * 3 + 1] = (Math.random() - .5) * 3600; pos[i * 3 + 2] = -900 + Math.random() * 1500; }
    else { const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), r = 2600 + Math.random() * 3000; pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); pos[i * 3 + 2] = r * Math.cos(ph); }
    const b = .25 + .6 * Math.pow(Math.random(), 2); col[i * 3] = .86 * b; col[i * 3 + 1] = .9 * b; col[i * 3 + 2] = .96 * b;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  field = new THREE.Points(g, new THREE.PointsMaterial({size: 2.2, map: CORE, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false}));
  scene.add(field);
}

function buildSky() {
  while (sky.children.length) { const o = sky.children.pop(); o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); }
  stars.length = 0; thumbs.clear(); lineMats = [];
  ORDER.forEach(k => {
    const c = D.chapters[k];
    const neb = new THREE.Sprite(new THREE.SpriteMaterial({map: GLOW, color: new THREE.Color(...c.tint), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .1}));
    neb.position.set(c.cx, c.cy, c.cz - 30); neb.scale.setScalar(Math.max(c.bw, c.bh) * 1.25); sky.add(neb); c.neb = neb;
    const pts = [];
    const P = nd => new THREE.Vector3(nd.sx, nd.sy, nd.sz);
    c.edges.forEach(e => { pts.push(P(e[0]), P(e[1])); });
    const lm = new THREE.LineBasicMaterial({color: new THREE.Color(...c.tint), transparent: true, opacity: .5, depthWrite: false});
    const ls = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lm); sky.add(ls); lineMats.push([lm, k]); c.lines = ls;
    c.dec.forEach(d => mkStar(P(d), d.b || .4, c.tint, null).k = k);
    c.sky.forEach(it => { const s = mkStar(P(it), it.b || .5, it.isNew ? [MINT.r, MINT.g, MINT.b] : c.tint, it); s.k = k; it._home = P(it); });
  });
  const sp = [];
  ORDER.forEach(k => { const c = D.chapters[k]; sp.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(c.cx, c.cy, c.cz)); });
  spokes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(sp), new THREE.LineBasicMaterial({color: 0xaac8eb, transparent: true, opacity: .13, depthWrite: false}));
  sky.add(spokes);
  const cp = D.cluster.map(it => new THREE.Vector3(it.qx, it.qy, it.qz));
  clusterLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(cp), new THREE.LineBasicMaterial({color: 0xe8eef6, transparent: true, opacity: .55, depthWrite: false}));
  sky.add(clusterLine);
  D.cluster.forEach((it, i) => { const c = D.chapters[it.chapter] || D.chapters.objects; const s = mkStar(cp[i], 1.15, c.tint, null); s.k = 'progress'; s.cl = it; it._cstar = s; });
  const cg = new THREE.Sprite(new THREE.SpriteMaterial({map: GLOW, color: new THREE.Color(160 / 255, 190 / 255, 240 / 255), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9}));
  cg.scale.setScalar(120); sky.add(cg); sky.userData.centreGlow = cg;
  selRing = new THREE.Sprite(new THREE.SpriteMaterial({map: RING, color: MINT, transparent: true, depthWrite: false, depthTest: false, opacity: 0}));
  selRing.renderOrder = 5; sky.add(selRing);
}
let selRing = null;

/* sky thumbnails: film / photo as small frames, objects as round cut-outs (m4's look), loaded only near the camera */
const loader = new THREE.TextureLoader();
const texCache = new Map();
export function loadTex(url, cb) {
  if (!url) return null;
  let e = texCache.get(url);
  if (e) { if (e.tex.image) cb && cb(e.tex); else e.cbs.push(cb); return e.tex; }
  e = {cbs: cb ? [cb] : [], tex: null};
  texCache.set(url, e);
  e.tex = loader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; e.cbs.forEach(f => f && f(t)); e.cbs = []; }, undefined, () => { e.failed = 1; });
  return e.tex;
}
export function coverUV(tex, aspect) {
  const im = tex.image; if (!im || !im.width) return;
  const ia = im.width / im.height;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  if (ia > aspect) { tex.repeat.set(aspect / ia, 1); tex.offset.set((1 - aspect / ia) / 2, 0); }
  else { tex.repeat.set(1, ia / aspect); tex.offset.set(0, (1 - ia / aspect) / 2); }
  tex.needsUpdate = true;
}
function thumbFor(it) {
  let m = thumbs.get(it.id);
  if (m) return m;
  const url = src(it.media && it.media.thumb); if (!url) return null;
  const round = it.chapter === 'objects';
  const ar = it.chapter === 'film' ? 1 / 2.33 : (it.media.w && it.media.h ? it.media.h / it.media.w : 1.25);
  const geo = round ? new THREE.CircleGeometry(.5, 40) : new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide});
  m = new THREE.Mesh(geo, mat); m.renderOrder = 2;
  m.userData = {it, ar: round ? 1 : ar, ld: 0};
  loadTex(url, t => { const tt = t.clone(); coverUV(tt, round ? 1 : 1 / ar); mat.map = tt; mat.needsUpdate = true; m.userData.ld = 1; });
  sky.add(m); thumbs.set(it.id, m);
  return m;
}

/* ---------- camera ---------- */
const cam = {T: new THREE.Vector3(), yaw: 0, pitch: 0, dist: 1000, tilt: 0, tiltY: 0};
const goal = {T: new THREE.Vector3(), yaw: 0, pitch: 0, dist: 1000};
const vel = {x: 0, y: 0, z: 0, yaw: 0};
let K = 8;  // easing rate: ~400-600 ms to settle on a flight
let FAR = {T: new THREE.Vector3(), dist: 1000};
export const CAM = {cam, goal, camera};

function fitDist(w, h, top, bot) {
  const t = TAN(), useH = (H - top - bot) / H, useW = (W - 28) / W;
  return Math.max(h / (2 * t * useH), w / (2 * t * camera.aspect * useW));
}
function computeFar() {
  const b = D.box, d = fitDist(b.x1 - b.x0, b.y1 - b.y0, 78, 36);
  const ppu = H / (2 * TAN() * d), shift = ((78 - 36) / 2) / ppu;
  FAR = {T: new THREE.Vector3((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2 + shift, 0), dist: d};
}
function chapterCam(k) {
  const c = D.chapters[k], e = c.ex;
  const d = fitDist(e.x1 - e.x0, e.y1 - e.y0 + 40, 36 + 50, 28 + 40) / 1.45;
  return {T: new THREE.Vector3(c.cx, c.cy - 8, c.cz), dist: d, yaw: 0, pitch: 0};
}
function flyTo(g, k) {
  K = k || 8;
  goal.T.copy(g.T); goal.dist = g.dist;
  if (g.yaw != null) goal.yaw = g.yaw; if (g.pitch != null) goal.pitch = g.pitch;
  vel.x = vel.y = vel.z = vel.yaw = 0;
}
function snapshot() { return {T: cam.T.clone(), dist: cam.dist, yaw: cam.yaw, pitch: cam.pitch, board: Board.snapshot()}; }
export function ppuAt(depth) { return H / (2 * TAN() * Math.max(1, depth)); }
function camFwd() { return new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion); }

function stepCam(dt) {
  const k = 1 - Math.exp(-K * dt);
  if (!drag && !pinch) {
    const d = Math.exp(-3.2 * dt);
    goal.T.x += vel.x * dt; goal.T.y += vel.y * dt; goal.T.z += vel.z * dt; goal.yaw += vel.yaw * dt;
    vel.x *= d; vel.y *= d; vel.z *= d; vel.yaw *= d;
    if (Math.abs(vel.x) + Math.abs(vel.y) < 1 && K < 8) K = 8;
  }
  if (freeMode()) {
    const b = D.box, m = 600;
    goal.T.x = Math.max(b.x0 - m, Math.min(b.x1 + m, goal.T.x));
    goal.T.y = Math.max(b.y0 - m, Math.min(b.y1 + m, goal.T.y));
    goal.dist = Math.max(70, Math.min(FAR.dist * 1.9, goal.dist));
  }
  goal.pitch = Math.max(-1.15, Math.min(1.15, goal.pitch));
  cam.T.lerp(goal.T, k); cam.dist += (goal.dist - cam.dist) * k;
  cam.yaw += (goal.yaw - cam.yaw) * k; cam.pitch += (goal.pitch - cam.pitch) * k;
  /* the world turns a little under a drifting finger and springs back */
  const tk = 1 - Math.exp(-6 * dt);
  cam.tilt += ((drag ? -dragV.x * .00022 : 0) - cam.tilt) * tk; cam.tiltY += ((drag ? -dragV.y * .00018 : 0) - cam.tiltY) * tk;
  cam.tilt = Math.max(-.12, Math.min(.12, cam.tilt)); cam.tiltY = Math.max(-.1, Math.min(.1, cam.tiltY));
  const yw = cam.yaw + (Room.active() ? 0 : cam.tilt), pt = cam.pitch + (Room.active() ? 0 : cam.tiltY);
  camera.position.set(cam.T.x + cam.dist * Math.sin(yw) * Math.cos(pt), cam.T.y + cam.dist * Math.sin(pt), cam.T.z + cam.dist * Math.cos(yw) * Math.cos(pt));
  camera.up.set(0, 1, 0);
  camera.lookAt(cam.T);
  if (Room.active()) Room.place(camera, dt);
}

/* ---------- state ---------- */
export const ST = {lv: 0, k: null, id: null};
let sel = null;          // {type:'ch'|'it', k, it}
let HN = 0; const SNAP = {};
let goHome = false;
function freeMode() { return ST.lv <= 1 && !Room.active() && !Room.busy(); }
function hashFor(st) {
  if (!st || st.lv === 0) return location.pathname + location.search;
  if (st.lv === 1) return '#' + st.k;
  if (st.lv === 2) return '#' + st.k + '/board';
  if (st.lv === 3) return '#' + st.id;
  return '#' + st.id + '/inside';
}
function parse(h) {
  h = decodeURIComponent((h || '').replace(/^#\/?/, ''));
  if (!h) return {lv: 0};
  const p = h.split('/');
  if (p.length === 1 && D.chapters[p[0]]) return {lv: 1, k: p[0]};
  if (p.length === 2 && p[1] === 'board' && D.chapters[p[0]]) return {lv: 2, k: p[0]};
  const inside = p[p.length - 1] === 'inside';
  const id = (inside ? p.slice(0, -1) : p).join('/');
  const it = D.byId[id];
  if (it) return {lv: inside && Room.can(it) ? 4 : 3, k: it.chapter, id};
  if (D.chapters[p[0]]) return {lv: 1, k: p[0]};
  return {lv: 0};
}
function parentOf(st) {
  if (st.lv === 4) return {lv: 3, k: st.k, id: st.id};
  if (st.lv === 3) return {lv: 2, k: st.k};
  if (st.lv === 2) return {lv: 1, k: st.k};
  return {lv: 0};
}
function go(st) { SNAP[HN] = snapshot(); HN++; history.pushState({n: HN}, '', hashFor(st)); apply(st, null); }
export function up() {
  if (Room.busy()) return;
  if (ST.lv === 0) { flyTo(FAR); return; }
  if (HN > 0) history.back();
  else { const p = parentOf(ST); history.replaceState({n: 0}, '', hashFor(p)); apply(p, null); }
}
function home() {
  if (HN > 0) { goHome = true; history.go(-HN); }
  else { history.replaceState({n: 0}, '', hashFor({lv: 0})); apply({lv: 0}, null); }
}
addEventListener('popstate', e => {
  const n = (e.state && e.state.n) || 0;
  const st = parse(location.hash);
  const snap = (!goHome && n < HN) ? SNAP[n] : null;
  HN = n; goHome = false;
  apply(st, snap);
});
function apply(st, snap) {
  const prev = Object.assign({}, ST);
  sel = null;
  if (prev.lv === 4 && st.lv !== 4) Room.exit(st.lv >= 3 ? null : () => {});
  if (prev.lv >= 2 && st.lv < 2) Board.close();
  Object.assign(ST, {lv: st.lv, k: st.k || null, id: st.id || null});
  const it = st.id ? D.byId[st.id] : null;
  if (st.lv === 2 && prev.lv === 3 && prev.id) Board.select(D.byId[prev.id]);
  if (st.lv === 0) flyTo(snap || Object.assign({yaw: 0, pitch: 0}, FAR));
  else if (st.lv === 1) flyTo(snap || chapterCam(st.k));
  else if (st.lv === 2) { Board.open(st.k, snap && snap.board); flyTo(Board.cam(snap && snap.board)); }
  else if (st.lv === 3) {
    const b = D.chapters[st.k] && it && (it.chapter === st.k) ? st.k : (it && it.chapter);
    if (Board.key() !== b) Board.open(b, null, it);
    if (prev.lv === 4) { /* the room hands the camera back where it found it */ }
    else flyTo(Board.pieceCam(it));
  } else if (st.lv === 4) {
    if (Board.key() !== it.chapter) { Board.open(it.chapter, null, it); flyTo(Board.pieceCam(it), 40); }
    const enter = () => Room.enter(it, Board.tileOf(it), camera);
    if (prev.lv === 3) enter(); else setTimeout(() => { if (ST.lv === 4 && ST.id === it.id && !Room.active()) enter(); }, 900);
  }
  Board.setPiece(st.lv >= 3 ? it : null);
  chrome();
}

/* ---------- chrome ---------- */
function titleOf(it) { const t = it && (it.title || ''); return t && t !== 'untitled' ? t : ''; }
function chrome() {
  const root = document.documentElement;
  if (ST.lv > 0) $('shint').classList.add('off');
  root.classList.toggle('deep', ST.lv > 0);
  root.classList.toggle('board', ST.lv === 2 || ST.lv === 3);
  root.classList.toggle('inside', ST.lv === 4);
  $('back').hidden = ST.lv === 0;
  const it = ST.id && D.byId[ST.id];
  const names = ['the sky', ST.k, (ST.k || '') + ' · board', titleOf(it) || (it ? it.chapter : ''), 'inside'];
  $('where').textContent = names[ST.lv] || 'the sky';
  const wc = $('wcrumb');
  if (ST.lv === 0) { wc.hidden = true; }
  else {
    const segs = [['ᑕᐣᓯ', 0, 'sg'], [ST.k, 1], ['board', 2], [titleOf(it) || 'piece', 3], ['inside', 4]].slice(0, ST.lv + 1);
    wc.innerHTML = segs.map((s, i) => i === segs.length - 1 ? `<span class="here">${esc(s[0])}</span>` : `<button type="button" class="${s[2] || ''}" data-lv="${s[1]}">${esc(s[0])}</button><i>›</i>`).join(' ');
    wc.hidden = false;
  }
  const pc = $('piece');
  if (ST.lv === 3 && it) {
    $('ptitle').textContent = titleOf(it) || (it.nov9 ? '' : it.title || '');
    $('prole').textContent = it.role || (it.meta || '');
    const role = it.role || it.meta || '';
    $('pcred').textContent = (it.credits || []).filter(c => c !== role).slice(0, 3).join(' · ');
    $('penter').hidden = !Room.can(it);
    $('popen').href = pieceLink(it);
    pc.hidden = false;
  } else pc.hidden = true;
  $('rhint').hidden = ST.lv !== 4;
  if (ST.lv === 4) { $('rhint').textContent = !(D.byId[ST.id] && D.byId[ST.id].kind === 'track') ? 'drag to look around · tap a still to bring it close · pinch out to leave' : 'drag to look around · pinch out to leave'; $('rhint').classList.remove('off'); clearTimeout(chrome.rt); chrome.rt = setTimeout(() => $('rhint').classList.add('off'), 6000); }
}
export function pieceLink(it) {
  if (it.chapter === 'about' && it.kind === 'contact') return 'mailto:imjamesgill@gmail.com';
  return M4 + '?sky=1#' + it.id;
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c])); }

/* ---------- labels (HTML, projected) ---------- */
const pool = []; let used = 0;
const mctx = document.createElement('canvas').getContext('2d');
function cutWords(s, max, font) {
  mctx.font = font; s = String(s || '');
  if (mctx.measureText(s).width <= max) return s;
  const ws = s.split(' ');
  while (ws.length > 1) { ws.pop(); const t = ws.join(' ').replace(/[\s·—–,:&+-]+$/, ''); if (t && mctx.measureText(t + '…').width <= max) return t + '…'; }
  return ws[0];
}
function label(html, cls, x, y, ax, ay, op) {
  let el = pool[used];
  if (!el) { el = document.createElement('div'); el.className = 'l'; labelsEl.appendChild(el); pool.push(el); el._h = ''; el._c = ''; }
  used++;
  if (el._h !== html) { el.innerHTML = html; el._h = html; el._w = 0; }
  if (el._c !== cls) { el.className = 'l ' + cls; el._c = cls; el._w = 0; }
  if (!el._w) { el._w = el.offsetWidth; el._hh = el.offsetHeight; }
  const lx = Math.max(6, Math.min(W - 6 - el._w, x - el._w * ax)), ly = y - el._hh * ay;
  el.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0)`;
  el.style.opacity = op == null ? 1 : op.toFixed(3);
  el.style.display = '';
  return [lx, ly, el._w, el._hh];
}
const V = new THREE.Vector3();
function proj(x, y, z) { V.set(x, y, z).project(camera); return V.z > 1 ? null : [(V.x + 1) / 2 * W, (1 - V.y) / 2 * H]; }

function farA() { return Math.max(0, Math.min(1, 1 - (FAR.dist / Math.max(1, cam.dist) - 1.15) / 1.5)); }

function drawLabels() {
  used = 0;
  const fa = farA(), placed = [];
  const hits = r => placed.some(b => r[0] < b[0] + b[2] + 3 && b[0] < r[0] + r[2] + 3 && r[1] < b[1] + b[3] && b[1] < r[1] + r[3]);
  if (ST.lv <= 1 && !Room.active()) {
    ORDER.forEach(k => {
      const c = D.chapters[k], p = proj(c.cx, c.labelY, c.cz); if (!p) return;
      if (p[1] < 52 || p[1] > H - 8) return;
      const on = sel && sel.type === 'ch' && sel.k === k;
      placed.push(label(k.toUpperCase(), 'ch' + (on ? ' on' : ''), p[0], p[1] + 14, .5, 1, ST.lv === 1 && ST.k !== k ? .5 : 1));
    });
    const o = proj(0, 0, 0);
    if (o && fa > .04 && ST.lv === 0) placed.push(label('<span class="m">ᑕᐣᓯ</span><span class="n">gill james</span><span class="p">I am an artist<br>All my relations,</span>', 'centre', o[0], o[1] - 18, .5, 0, fa));
    if (D.cluster.length && fa > .35 && ST.lv === 0) {
      let my = -1e9, y0 = 1e9, x0 = 1e9, x1 = -1e9, mx = 0, n = 0;
      D.cluster.forEach(it => { const p = proj(it.qx, it.qy, it.qz); if (p) { my = Math.max(my, p[1]); y0 = Math.min(y0, p[1]); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); mx += p[0]; n++; } });
      if (n) {
        mx /= n;
        /* m4: when the label would sit on the centre lines, it moves beside the ring */
        const inPoem = o && mx > o[0] - 118 && mx < o[0] + 118 && my + 14 > o[1] - 36 && my + 14 < o[1] + 108;
        if (inPoem) placed.push(mx >= o[0] ? label('in progress', 'prog', x1 + 10, (y0 + my) / 2, 0, .5, .9 * fa) : label('in progress', 'prog', x0 - 10, (y0 + my) / 2, 1, .5, .9 * fa));
        else placed.push(label('in progress', 'prog', mx, my + 14, .5, 0, .9 * fa));
      }
    }
    /* constellation titles, one line each, never on another title */
    if (ST.lv === 1 || fa < .5) {
      const k = ST.lv === 1 ? ST.k : nearestChapter();
      const c = k && D.chapters[k];
      if (c) c.sky.forEach(it => {
        const t = titleOf(it); if (!t) return;
        const s = it._star; if (!s || s.px == null) return;
        const m = thumbs.get(it.id), mo = m ? m.material.opacity : 0;
        const show = it.chapter === 'objects' || it.chapter === 'sound' || it.chapter === 'about' ? s.ppu > .9 : mo > .6;
        if (!show) return;
        const p = s.scr; if (!p || p[0] < 4 || p[0] > W - 4 || p[1] < 64 || p[1] > H - 12) return;
        const w = Math.max((m ? m.userData.pxw : 30) + 16, 64), font = '300 9.5px Poppins';
        const txt = cutWords(t, w, font); mctx.font = font; const lw = mctx.measureText(txt).width;
        const lx = Math.max(8, Math.min(W - 8 - lw, p[0] - lw / 2));
        const yy = p[1] + (m ? m.userData.pxh / 2 : 8) + 3;
        const r = [lx, yy, lw, 12]; if (hits(r)) return;
        placed.push(label(esc(txt), 'it' + (it.isNew ? ' new' : ''), lx, yy, 0, 0, 1));
      });
    }
  }
  if (sel && sel.type === 'it' && sel.it && ST.lv <= 1) {
    const s = sel.it._star || sel.it._cstar; const p = s && s.scr;
    if (p) label(esc(titleOf(sel.it) || sel.it.title || ''), 'sel', Math.max(10, Math.min(W - 10, p[0])), p[1] - 18, .5, 1, 1);
  }
  Board.labels(label, proj, sel);
  Room.labels(label, proj);
  for (let i = used; i < pool.length; i++) if (pool[i].style.display !== 'none') pool[i].style.display = 'none';
}
function nearestChapter() {
  let best = null, bd = 1e9;
  ORDER.forEach(k => { const c = D.chapters[k], d = Math.hypot(c.cx - cam.T.x, c.cy - cam.T.y) / c.r; if (d < bd) { bd = d; best = k; } });
  return bd < 1.6 ? best : null;
}

/* ---------- per-frame sky ---------- */
function stepSky(t, dt) {
  const fa = farA(), inside = Room.active(), skyA = Room.skyAlpha(), boardOn = ST.lv >= 2 ? Board.bloom() : 0;
  const fwd = camFwd(), cp = camera.position;
  sky.userData.centreGlow.material.opacity = .9 * fa * skyA;
  sky.userData.centreGlow.scale.setScalar(Math.max(70, 60 / Math.max(.2, ppuAt(cam.dist))));
  spokes.material.opacity = .13 * fa * skyA * (ST.lv === 0 ? 1 : 0);
  clusterLine.material.opacity = .55 * Math.max(fa, .2) * skyA;
  lineMats.forEach(([m, k]) => { const focus = ST.lv === 0 || ST.k === k ? 1 : .28; m.opacity = (ST.lv === 1 && ST.k === k ? .3 : .55 * focus * Math.max(fa, .35)) * skyA * (Board.key() === k ? 1 - boardOn : 1); });
  ORDER.forEach(k => { const c = D.chapters[k]; c.neb.material.opacity = .1 * skyA * (ST.lv === 0 || ST.k === k ? 1 : .4); });
  stars.forEach(s => {
    const it = s.it;
    const onBoard = it && Board.has(it);
    const pos = onBoard ? Board.posOf(it) : s.pos;
    s.sp.position.copy(pos); s.core.position.copy(pos);
    V.subVectors(pos, cp); const depth = V.dot(fwd);
    if (depth < 2) { s.sp.visible = s.core.visible = false; s.px = null; s.scr = null; return; }
    const ppu = ppuAt(depth); s.ppu = ppu;
    const focus = ST.lv === 0 || ST.k === s.k || (s.k === 'progress' && ST.lv === 0) ? 1 : .28;
    const pulse = 1 + .07 * Math.sin(t / 900 + s.ph);
    const grow = Math.pow(Math.max(.4, ppu / Math.max(.05, ppuAt(FAR.dist))), .28);
    const gs = (5 + 16 * s.b) * pulse * grow * (it && it.isNew ? 1.3 : 1);
    let a = focus * skyA;
    if (onBoard) a *= 1 - Board.bloom();
    else if (!it && s.k === Board.key()) a *= 1 - .85 * Board.bloom();
    const th = it && thumbs.get(it.id);
    if (th && it.chapter !== 'objects') a *= 1 - th.material.opacity * .85;
    if (it && it.chapter === 'objects' && th && th.userData.ld) a *= 1 - th.material.opacity;
    s.sp.visible = s.core.visible = a > .01;
    s.sp.scale.setScalar(gs * 2 / ppu); s.sp.material.opacity = a * (.45 + .5 * Math.min(1, s.b));
    const cr = Math.max(1.1, 1 + Math.min(1.2, s.b) * 1.6) * 2.2;
    s.core.scale.setScalar(cr / ppu); s.core.material.opacity = a;
    s.px = gs; s.scr = proj(pos.x, pos.y, pos.z);
  });
  /* thumbnails: dots turn into pictures in the same spot as you come close */
  ORDER.forEach(k => {
    const c = D.chapters[k];
    if (k === 'about' || k === 'sound') return;
    const cd = Math.hypot(c.cx - cp.x, c.cy - cp.y, c.cz - cp.z);
    const near = ppuAt(cd) > (k === 'objects' ? .22 : .5);
    c.sky.forEach(it => {
      let m = thumbs.get(it.id);
      if (!m && !near) return;
      if (!m) { m = thumbFor(it); if (!m) return; }
      const s = it._star; const onBoard = Board.has(it);
      if (onBoard && Board.bloom() > .02) { m.visible = false; return; }
      const ppu = s && s.ppu || .01;
      let wpx, op;
      if (k === 'objects') { wpx = Math.max(22 * (ST.lv === 0 || ST.k === k ? 1 : .6), 34 * ppu); op = 1; }
      else { const base = k === 'film' ? 46 : 32; wpx = base * ppu; op = Math.max(0, Math.min(1, (wpx - base * .48) / (base * .35))); }
      const focus = ST.lv === 0 || ST.k === k ? 1 : .28;
      op *= focus * skyA * (m.userData.ld ? 1 : 0);
      m.visible = op > .01;
      if (!m.visible) return;
      m.position.copy(s.pos);
      m.quaternion.copy(camera.quaternion);
      const ww = wpx / ppu;
      m.scale.set(ww, ww * m.userData.ar, 1);
      m.userData.pxw = wpx; m.userData.pxh = wpx * m.userData.ar;
      m.material.opacity = op;
    });
  });
  if (selRing) {
    const s = sel && sel.type === 'it' && sel.it && (sel.it._star || sel.it._cstar);
    if (s && s.scr && ST.lv <= 1) {
      selRing.position.copy(s.sp.position);
      const m = thumbs.get(sel.it.id), rpx = m && m.visible ? Math.max(m.userData.pxw, m.userData.pxh) / 2 + 6 : 11;
      selRing.scale.setScalar(rpx * 2 / s.ppu); selRing.material.opacity = .9;
    } else selRing.material.opacity = 0;
  }
  field.material.opacity = .9 * Math.max(.35, skyA);
}

/* ---------- mini-map ---------- */
const mm = $('mmapc').getContext('2d');
function drawMap() {
  const w = 152, h = 200, b = D.box, s = Math.min((w - 20) / (b.x1 - b.x0), (h - 20) / (b.y1 - b.y0));
  const X = x => w / 2 + (x - (b.x0 + b.x1) / 2) * s, Y = y => h / 2 - (y - (b.y0 + b.y1) / 2) * s;
  mm.clearRect(0, 0, w, h);
  mm.strokeStyle = 'rgba(170,200,235,.35)'; mm.lineWidth = 1.5; mm.beginPath();
  ORDER.forEach(k => { const c = D.chapters[k]; mm.moveTo(X(0), Y(0)); mm.lineTo(X(c.cx), Y(c.cy)); }); mm.stroke();
  ORDER.forEach(k => { const c = D.chapters[k], on = ST.k === k || nearestChapter() === k; mm.fillStyle = on ? '#55DAA1' : `rgba(${c.rgb},.85)`; mm.beginPath(); mm.arc(X(c.cx), Y(c.cy), on ? 7 : 5, 0, 7); mm.fill(); });
  const vh = 2 * TAN() * cam.dist, vw = vh * camera.aspect;
  mm.strokeStyle = 'rgba(255,255,255,.7)'; mm.lineWidth = 1.5;
  mm.strokeRect(X(cam.T.x - vw / 2), Y(cam.T.y + vh / 2), vw * s, vh * s);
  mm.fillStyle = '#fff'; mm.beginPath(); mm.arc(X(cam.T.x), Y(cam.T.y), 3, 0, 7); mm.fill();
}

/* ---------- input ---------- */
const PT = new Map();
let drag = null, pinch = null, dragV = {x: 0, y: 0}, lastTap = null, touchedOnce = false;
function worldAtScreen(sx, sy, planeZ) {
  const ndc = new THREE.Vector3(sx / W * 2 - 1, -(sy / H) * 2 + 1, .5).unproject(camera);
  const dir = ndc.sub(camera.position).normalize();
  const n = camFwd(), p0 = cam.T.clone();
  if (planeZ != null) p0.z = planeZ;
  const t = p0.clone().sub(camera.position).dot(n) / dir.dot(n);
  return camera.position.clone().add(dir.multiplyScalar(t));
}
function zoomAt(sx, sy, f) {
  if (ST.lv >= 2) return;
  const P = worldAtScreen(sx, sy);
  const nd = Math.max(70, Math.min(FAR.dist * 1.9, goal.dist * f)), ff = nd / goal.dist;
  goal.dist = nd;
  goal.T.add(P.sub(cam.T).multiplyScalar(1 - ff));
  K = 14;
  afterFree();
}
function panBy(dx, dy) {
  const ppu = ppuAt(cam.dist);
  const r = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), u = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  goal.T.addScaledVector(r, -dx / ppu).addScaledVector(u, dy / ppu);
  K = 16;
}
/* free flight decides the level from where you are; it never pushes history, only replaces it */
function afterFree() {
  if (!freeMode()) return;
  const k = nearestChapter();
  const lv = goal.dist < FAR.dist * .58 && k ? 1 : 0;
  if (lv !== ST.lv || (lv === 1 && k !== ST.k)) {
    Object.assign(ST, {lv, k: lv ? k : null, id: null});
    history.replaceState({n: HN}, '', hashFor(ST));
    chrome();
  }
  /* pinching deep into a constellation lands on its board */
  if (ST.lv === 1 && pinch && goal.dist < chapterCam(ST.k).dist * .62) { pinch.done = 1; goal.dist = chapterCam(ST.k).dist * .62; go({lv: 2, k: ST.k}); }
}
function seen() { if (!touchedOnce) { touchedOnce = true; $('shint').classList.add('off'); } }

function pick(x, y) {
  if (ST.lv >= 2) return Board.pick(x, y, camera, W, H);
  let best = null, bd = 30;
  stars.forEach(s => {
    if (!s.scr || !s.sp.visible) return;
    if (!(s.it || s.cl)) return;
    if (ST.lv === 1 && s.k !== ST.k && s.k !== 'progress') return;
    const th = s.it && thumbs.get(s.it.id);
    let r = th && th.visible ? Math.max(th.userData.pxw, th.userData.pxh) / 2 + 6 : 22;
    const d = Math.hypot(s.scr[0] - x, s.scr[1] - y);
    if (d < Math.max(r, 22) && d < bd) { bd = d; best = s; }
  });
  if (best && (ST.lv === 1 || (best.ppu > .55) || best.cl)) return {type: 'it', it: best.it || best.cl, k: (best.it || best.cl).chapter};
  let ch = null, cd = 1e9;
  ORDER.forEach(k => {
    const c = D.chapters[k], p = proj(c.cx, c.cy, c.cz); if (!p) return;
    const rpx = c.r * ppuAt(cam.dist) * 1.05, d = Math.hypot(p[0] - x, p[1] - y);
    const lp = proj(c.cx, c.labelY, c.cz), dl = lp ? Math.hypot(lp[0] - x, lp[1] + 8 - y) : 1e9;
    if ((d < rpx || dl < 40) && Math.min(d, dl) < cd) { cd = Math.min(d, dl); ch = k; }
  });
  if (ch && ST.lv === 0) return {type: 'ch', k: ch};
  if (best) return {type: 'it', it: best.it || best.cl, k: (best.it || best.cl).chapter};
  if (ch) return {type: 'ch', k: ch};
  return null;
}
function same(a, b) { return a && b && a.type === b.type && a.k === b.k && a.it === b.it; }
function tap(x, y) {
  const tNow = performance.now();
  if (Room.active()) { Room.tap(x, y, camera, W, H); return; }
  const h = pick(x, y);
  if (!h) {
    if (lastTap && tNow - lastTap.t < 340 && Math.hypot(lastTap.x - x, lastTap.y - y) < 30 && ST.lv > 0) { lastTap = null; sel = null; up(); return; }
    lastTap = {t: tNow, x, y}; sel = null; Board.select(null); return;
  }
  lastTap = null;
  /* two taps: the first selects (highlight and title), the second opens */
  if (ST.lv === 3) { if (h.type === 'it' && h.it.id === ST.id) { if (Room.can(h.it)) go({lv: 4, k: ST.k, id: ST.id}); else location.href = pieceLink(h.it); } else if (h.type === 'it') { Board.select(h.it); sel = h; flyTo(Board.pieceCam(h.it)); history.replaceState({n: HN}, '', hashFor({lv: 3, id: h.it.id})); ST.id = h.it.id; chrome(); } return; }
  if (!same(sel, h)) { sel = h; if (ST.lv === 2) Board.select(h.it); Board.onSelect && Board.onSelect(h.it); return; }
  sel = null;
  if (h.type === 'ch') { go({lv: 1, k: h.k}); return; }
  const it = h.it;
  if (ST.lv <= 1) { go({lv: 2, k: it.chapter, focus: it.id}); Board.focus(it); return; }
  if (ST.lv === 2) {
    if (it.kind === 'track') { go({lv: 3, k: it.chapter, id: it.id}); return; }
    if (it.chapter === 'about' && it.kind !== 'poem') { location.href = it.kind === 'contact' ? 'mailto:imjamesgill@gmail.com' : pieceLink(it); return; }
    go({lv: 3, k: it.chapter, id: it.id});
  }
}

cv.addEventListener('pointerdown', e => {
  seen(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
  PT.set(e.pointerId, {x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now(), b: e.button});
  if (PT.size === 1) { drag = {id: e.pointerId, moved: 0, lx: e.clientX, ly: e.clientY, lt: performance.now(), orbit: e.button === 2 || e.shiftKey}; dragV = {x: 0, y: 0}; vel.x = vel.y = vel.z = vel.yaw = 0; Board.grab(); Room.grab(); }
  else if (PT.size === 2) {
    drag = null; const a = [...PT.values()];
    pinch = {d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), a: Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x), mx: (a[0].x + a[1].x) / 2, my: (a[0].y + a[1].y) / 2, s: 1, done: 0};
  }
});
cv.addEventListener('pointermove', e => {
  const p = PT.get(e.pointerId); if (!p) return;
  p.x = e.clientX; p.y = e.clientY;
  if (pinch && PT.size >= 2) {
    const a = [...PT.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), an = Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x);
    const mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
    const f = pinch.d / Math.max(1, d); pinch.s *= d / Math.max(1, pinch.d);
    if (!pinch.done) {
      if (Room.active()) { const r = Room.pinch(1 / f, pinch.s); if (r === 'out') { pinch.done = 1; up(); } }
      else if (ST.lv >= 2) {
        const r = Board.pinch(pinch.s, mx, my);
        if (pinch.s < .78) { pinch.done = 1; up(); }
        else if (pinch.s > 1.3) {
          pinch.done = 1;
          if (ST.lv === 3) { const it = D.byId[ST.id]; if (Room.can(it)) go({lv: 4, k: ST.k, id: ST.id}); }
          else if (ST.lv === 2) { const h = Board.pick(mx, my, camera, W, H); if (h && h.it) { if (h.it.chapter === 'about' && h.it.kind !== 'poem') {} else go({lv: 3, k: h.it.chapter, id: h.it.id}); } }
        }
      } else {
        zoomAt(mx, my, f);
        panBy(mx - pinch.mx, my - pinch.my);
        let da = an - pinch.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
        goal.yaw -= da * .9;
      }
    }
    pinch.d = d; pinch.a = an; pinch.mx = mx; pinch.my = my;
    return;
  }
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly, tn = performance.now(), dt = Math.max(1, tn - drag.lt) / 1000;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  if (drag.moved < 6) return;
  const k = dt < .08 ? .4 : 1;
  dragV.x = dragV.x * (1 - k) + dx / dt * k; dragV.y = dragV.y * (1 - k) + dy / dt * k;
  drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = tn;
  if (Room.active()) { Room.drag(dx, dy); return; }
  if (ST.lv >= 2) { Board.drag(dx, dy); return; }
  if (drag.orbit) { goal.yaw -= dx * .005; goal.pitch += dy * .004; K = 16; }
  else { panBy(dx, dy); afterFree(); }
});
function endPointer(e) {
  const p = PT.get(e.pointerId); if (!p) return;
  PT.delete(e.pointerId);
  if (pinch) { if (PT.size < 2) { pinch = null; Board.pinch(1); afterFree(); } if (PT.size === 1) { const id = [...PT.keys()][0], q = PT.get(id); drag = {id, moved: 99, lx: q.x, ly: q.y, lt: performance.now()}; dragV = {x: 0, y: 0}; } return; }
  if (!drag || drag.id !== e.pointerId) return;
  const wasTap = drag.moved < 8 && performance.now() - p.t0 < 450;
  const fresh = performance.now() - drag.lt < 90;
  if (wasTap) { drag = null; tap(e.clientX, e.clientY); return; }
  if (Room.active()) Room.release(fresh ? dragV : {x: 0, y: 0});
  else if (ST.lv >= 2) Board.release(fresh ? dragV : {x: 0, y: 0});
  else if (fresh) {
    const ppu = ppuAt(cam.dist);
    if (drag.orbit) vel.yaw = -dragV.x * .005 * .6;
    else { const r = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), u = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion); const cap = 2600; const vx = Math.max(-cap, Math.min(cap, dragV.x)), vy = Math.max(-cap, Math.min(cap, dragV.y)); vel.x = (-r.x * vx + u.x * vy) / ppu * .9; vel.y = (-r.y * vx + u.y * vy) / ppu * .9; vel.z = (-r.z * vx + u.z * vy) / ppu * .9; K = 14; }
  }
  drag = null;
  afterFree();
}
cv.addEventListener('pointerup', endPointer);
cv.addEventListener('pointercancel', endPointer);
cv.addEventListener('contextmenu', e => e.preventDefault());
let wheelAcc = 0, wheelT = 0;
cv.addEventListener('wheel', e => {
  e.preventDefault(); seen();
  const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
  if (Room.active()) { if (Room.pinch(Math.exp(-dy * .002), 1) === 'out' && dy > 0) { wheelAcc += dy; if (wheelAcc > 160) { wheelAcc = 0; up(); } } return; }
  if (ST.lv >= 2) {
    const tn = performance.now(); if (tn - wheelT > 400) wheelAcc = 0; wheelT = tn;
    if (e.ctrlKey || ST.lv === 3) { wheelAcc += dy; if (wheelAcc > 120) { wheelAcc = -1e4; up(); } else if (wheelAcc < -120) { wheelAcc = -1e4; if (ST.lv === 3) { const it = D.byId[ST.id]; if (Room.can(it)) go({lv: 4, k: ST.k, id: ST.id}); } else { const h = Board.pick(e.clientX, e.clientY, camera, W, H); if (h && h.it) go({lv: 3, k: h.it.chapter, id: h.it.id}); } } return; }
    Board.wheel(dy); return;
  }
  zoomAt(e.clientX, e.clientY, Math.exp(dy * (e.ctrlKey ? .01 : .0015)));
  if (ST.lv === 1 && goal.dist < chapterCam(ST.k).dist * .62) { goal.dist = chapterCam(ST.k).dist * .62; go({lv: 2, k: ST.k}); }
}, {passive: false});
addEventListener('keydown', e => {
  if (e.key === 'Escape') { up(); return; }
  const step = 60;
  if (freeMode()) {
    if (e.key === 'ArrowLeft') panBy(step, 0); else if (e.key === 'ArrowRight') panBy(-step, 0);
    else if (e.key === 'ArrowUp') panBy(0, step); else if (e.key === 'ArrowDown') panBy(0, -step);
    else if (e.key === '+' || e.key === '=') zoomAt(W / 2, H / 2, .8); else if (e.key === '-') zoomAt(W / 2, H / 2, 1.25);
    afterFree();
  }
});

$('back').addEventListener('click', () => up());
$('sig').addEventListener('click', e => { e.preventDefault(); home(); });
$('mmap').addEventListener('click', () => home());
$('wcrumb').addEventListener('click', e => {
  const b = e.target.closest('button[data-lv]'); if (!b) return;
  const lv = +b.dataset.lv; if (lv === 0) { home(); return; }
  const n = ST.lv - lv; if (n > 0 && HN >= n) history.go(-n); else { const st = lv === 1 ? {lv: 1, k: ST.k} : lv === 2 ? {lv: 2, k: ST.k} : {lv: 3, k: ST.k, id: ST.id}; history.replaceState({n: HN}, '', hashFor(st)); apply(st, null); }
});
document.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.ch) { if (ST.lv === 0) go({lv: 1, k: b.dataset.ch}); else { history.replaceState({n: HN}, '', hashFor({lv: 1, k: b.dataset.ch})); apply({lv: 1, k: b.dataset.ch}, null); } }
  else if (b.dataset.go && D.byId[b.dataset.go]) { const it = D.byId[b.dataset.go]; go({lv: 3, k: it.chapter, id: it.id}); }
}));
$('penter').addEventListener('click', () => { const it = D.byId[ST.id]; if (it && Room.can(it)) go({lv: 4, k: ST.k, id: ST.id}); });
$('hire').addEventListener('click', () => { const c = $('hirecard'); c.hidden = !c.hidden; $('hire').setAttribute('aria-expanded', String(!c.hidden)); });
$('hirex').addEventListener('click', () => { $('hirecard').hidden = true; $('hire').setAttribute('aria-expanded', 'false'); });

/* ---------- loop ---------- */
let last = performance.now();
function frame(t) {
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  if (ST.lv === 2 && !Room.active() && !Room.busy()) { const c = Board.cam(); goal.T.copy(c.T); goal.dist = c.dist; goal.yaw = 0; goal.pitch = 0; if (Board.moving() || drag) K = Math.max(K, 20); }
  stepCam(dt);
  Board.step(dt, t, camera);
  Room.step(dt, t, camera);
  stepSky(t, dt);
  renderer.render(scene, camera);
  drawLabels();
  if ((frame.n = (frame.n || 0) + 1) % 3 === 0) drawMap();
  requestAnimationFrame(frame);
}
function resize() {
  W = innerWidth; H = innerHeight; DPR = Math.min(2, devicePixelRatio || 1);
  const port = H > W * 1.05;
  renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
  camera.aspect = W / H; camera.updateProjectionMatrix();
  if (port !== PORT) { PORT = port; layout(PORT); buildSky(); Board.relayout(); }
  computeFar();
  Board.resize(W, H);
  if (ST.lv === 0) flyTo(FAR);
  else if (ST.lv === 1) flyTo(chapterCam(ST.k));
  else if (ST.lv === 2) flyTo(Board.cam());
  else if (ST.lv === 3) flyTo(Board.pieceCam(D.byId[ST.id]));
}
addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 120); });

async function boot() {
  await load();
  layout(PORT);
  try { await Promise.all(['300 12px Poppins', '200 12px Poppins', '13px "Julius Sans One"', '700 16px Syl'].map(f => document.fonts.load(f, f.indexOf('Syl') > 0 ? 'ᑕᐣᓯ' : 'a'))); } catch (e) {}
  buildField(); buildSky(); computeFar();
  Board.init({scene, sky, D, TEX, loadTex, coverUV, ppuAt, W, H, camera, cam, MINT, pinching: () => !!pinch, skyAlpha: () => Room.skyAlpha()});
  Room.init({scene, sky, D, TEX, loadTex, coverUV, cam, goal, MINT, W, H});
  const st = parse(location.hash);
  history.replaceState({n: 0}, '', hashFor(st.lv ? st : {lv: 0}));
  /* deep links arrive from the far sky, so the first flight shows where the piece lives */
  cam.T.copy(FAR.T); cam.dist = FAR.dist * 1.25; goal.T.copy(FAR.T); goal.dist = FAR.dist;
  apply(st, null);
  if (st.lv === 0) flyTo(FAR, 3);
  requestAnimationFrame(frame);
  requestAnimationFrame(() => $('veil').classList.add('off'));
  setTimeout(() => $('shint').classList.add('off'), 9000);
  window.__inside = {ST, D, cam, goal, camera, up, go, home, Board, Room, FAR: () => FAR, sel: () => sel && {type: sel.type, k: sel.k, id: sel.it && sel.it.id}, boardSel: () => Board.selected(), scrOf: id => { const s = stars.find(s => s.it && s.it.id === id); return s && s.scr; }};
}
boot();
