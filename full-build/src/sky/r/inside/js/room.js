/* Inside: the room behind a piece. The camera flies from the piece stop straight through the piece into a small room of its own:
   its stills and clips float on a slow ring around you, objects get a stand-in form (or a GLB from models/models.json), and the songs
   hang overhead as stars (first tap selects, second plays). Leaving flies the same line back to the exact camera you left. */
import * as THREE from 'three';
import {M4, src, ok, rnd, filmKey} from './data.js';

let E = null;
let mode = 'off';          // off | enter | in | exit
let u = 0, t0 = 0, dur = 1, onDone = null;
let G = null, C = new THREE.Vector3(), N = new THREE.Vector3(0, 0, 1), R = 260, it = null;
let yaw = 0, pitch = 0, yawV = 0, pitchV = 0, fovT = 60, held = false;
let planes = [], songs = [], vids = [], ring = null, portal = null, standin = null, dome = null, lights = [];
let selP = null, focusP = null, selS = null, AU = null, playingK = null, songRoom = null;
let MODELS = null;
const tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpM = new THREE.Matrix4();
const ease = x => { x = Math.max(0, Math.min(1, x)); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const mmss = s => { s = Math.max(0, s | 0); return (s / 60 | 0) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); };

fetch('models/models.json').then(r => r.ok ? r.json() : {}).then(j => { MODELS = j && j.models || {}; }).catch(() => { MODELS = {}; });

/* What a room holds, from m4's data only. */
function contents(p) {
  const D = E.D, out = [];
  const img = (u, ar, big) => { if (ok(u)) out.push({type: 'img', url: src(u), ar: ar || 0, big}); };
  const tb = n => (n.media.thumb || n.media.big);
  const vid = (u, poster, ar) => { if (ok(u)) out.push({type: 'vid', url: src(u), poster: poster ? src(poster) : '', ar: ar || 0}); };
  const pick = (arr, n) => { if (arr.length <= n) return arr; const o = []; for (let i = 0; i < n; i++) o.push(arr[Math.floor(i * arr.length / n)]); return o; };
  let q = p;
  if (p.nov9 && p.of && D.byId[p.of]) q = D.byId[p.of];
  if (q.chapter === 'film') {
    if (q.kind === 'reel') {
      const R = (window.GJ_REEL || []).filter(s => ok(s.f));
      pick(R, 16).forEach(s => img('media/pro2/reel/' + s.f + '.webp', s.h / s.w));
      pick(R, 3).forEach((s, i) => { if (i) vid('media/pro2/reel/' + s.f + '.mp4', 'media/pro2/reel/' + s.f + '.webp', s.h / s.w); });
    } else {
      img(q.media.big || q.media.thumb, 1 / 2.39, 1);
      const key = filmKey(q), F = window.GJ_FRAMES && key && window.GJ_FRAMES[key];
      if (F && F.f && F.f.length) pick(F.f, 13).forEach(f => img('media/pro2/frames/' + f[0], 1 / (F.ar || 1.778)));
      else (q.media.frames || []).slice(0, 13).forEach(f => img(f, 9 / 16));
      vid(q.media.pv || q.media.clip, q.media.big || q.media.thumb, 9 / 16);
    }
  } else if (q.chapter === 'photo') {
    img(p.media.big || p.media.thumb, p.media.w ? p.media.h / p.media.w : 0, 1);
    const all = D.chapters.photo.board, i = all.indexOf(p);
    for (let j = 1; out.length < 11 && j < all.length; j++) { const n = all[(i + j) % all.length]; img(tb(n), n.media.w ? n.media.h / n.media.w : 0); }
  } else if (q.chapter === 'objects') {
    if (q.kind === 'joio') {
      const J = window.GJ_JOIO || [];
      pick(J.filter(x => x.k === 'p'), 10).forEach(x => img('media/pro2/joio/' + x.f, x.h / x.w));
      pick(J.filter(x => x.k === 'v'), 5).forEach(x => vid('media/pro2/joio/' + x.v, 'media/pro2/joio/' + x.f, x.h / x.w));
    } else {
      img(p.media.big || p.media.thumb, p.media.w ? p.media.h / p.media.w : 0, 1);
      if (p !== q) img(tb(q), 0);
      D.chapters.objects.board.forEach(n => { if (n.nov9 && n.of === q.id && n !== p) { if (n.media.clip) vid(n.media.clip, tb(n), n.media.h / n.media.w); else img(tb(n), n.media.w ? n.media.h / n.media.w : 0); } });
    }
  } else if (q.chapter === 'about' && q.kind === 'poem') {
    (D.poem || []).forEach(l => out.push({type: 'text', text: l}));
  }
  return {list: out.slice(0, 18), q};
}
function songsFor(q) {
  const D = E.D;
  if (q.kind === 'track') return {own: q.track, list: []};
  if (q.chapter === 'sound' && q.kind === 'sound') { const a = q.title.indexOf('Mothers') >= 0 ? 'Mothers Moniker' : q.title.indexOf('Lost Coffee') >= 0 ? 'Lost Coffee' : ''; return {own: null, list: D.tracks.filter(t => !a || t.artist === a)}; }
  return {own: null, list: D.tracks.slice()};
}
function standinKind(q) {
  if (q.chapter !== 'objects' || q.kind === 'joio') return null;
  const s = (q.slug || '') + ' ' + (q.title || '');
  if (/board/.test(s)) return 'slab';
  if (/spoon/.test(s)) return 'spoon';
  if (/cup|latte|planter|rim/.test(s)) return 'cup';
  return 'plinth';
}

function texMat(url, cb) {
  const m = new THREE.MeshBasicMaterial({color: 0x10161f, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide});
  if (url) E.loadTex(url, t => { m.map = t; m.color.set(0xffffff); m.needsUpdate = true; cb && cb(t); });
  return m;
}
function textPlane(text, w) {
  const R2 = 3, fs = 15, c = document.createElement('canvas'), q0 = c.getContext('2d');
  q0.font = `200 ${fs}px Poppins`; const tw = Math.min(w, q0.measureText(text).width + 8);
  c.width = Math.ceil(tw * R2); c.height = Math.ceil(26 * R2);
  const q = c.getContext('2d'); q.scale(R2, R2); q.font = `200 ${fs}px Poppins`; q.fillStyle = '#eef3f5'; q.textBaseline = 'middle'; q.shadowColor = 'rgba(4,7,11,.9)'; q.shadowBlur = 6; q.fillText(text, 4, 13);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(tw, 26), new THREE.MeshBasicMaterial({map: tex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide}));
  return m;
}
function domeMat(tint) {
  return new THREE.ShaderMaterial({transparent: true, depthWrite: false, side: THREE.BackSide,
    uniforms: {top: {value: new THREE.Color(0x04070b)}, mid: {value: new THREE.Color(tint[0], tint[1], tint[2]).multiplyScalar(.07).add(new THREE.Color(0x070d18))}, op: {value: 0}},
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform float op; varying vec3 vp; void main(){ float h = abs(vp.y); vec3 c = mix(mid, top, smoothstep(0.0, 0.75, h)); gl_FragColor = vec4(c, op); }'});
}
function buildStandin(kind, q, s) {
  const g = new THREE.Group();
  const cream = new THREE.MeshStandardMaterial({color: 0xe6ddcc, roughness: .82, metalness: 0, transparent: true, opacity: 0});
  if (kind === 'cup') {
    const pts = [[0, 0], [.36, 0], [.42, .04], [.47, .3], [.5, .62], [.52, .78], [.49, .8], [.46, .63], [.43, .32], [.36, .1], [0, .1]].map(p => new THREE.Vector2(p[0] * s, p[1] * s));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), cream); m.position.y = -.4 * s; g.add(m);
  } else if (kind === 'spoon') {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(.18 * s, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), cream); bowl.scale.set(1, .45, 1.4); g.add(bowl);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(.025 * s, .04 * s, .9 * s, 16), cream); h.rotation.x = Math.PI / 2; h.position.z = .62 * s; g.add(h);
    g.rotation.y = .6;
  } else if (kind === 'slab') {
    const mat = [cream, cream, cream, cream, null, cream];
    const face = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: .9, transparent: true, opacity: 0});
    const url = src(q.media.big || q.media.thumb); if (url) E.loadTex(url, t => { face.map = t; face.needsUpdate = true; });
    mat[4] = face;
    const m = new THREE.Mesh(new THREE.BoxGeometry(.9 * s, .62 * s, .035 * s), mat); g.add(m);
  } else {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.3 * s, .34 * s, .5 * s, 48), cream); m.position.y = -.25 * s; g.add(m);
  }
  g.userData.mats = [];
  g.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(mm => g.userData.mats.push(mm)); });
  return g;
}
/* GLB swap point: models/models.json {"models": {"objects/joio-co-cup": "joio-co-cup.glb"}} replaces the stand-in with inside/models/<file>. */
function swapGLB(q, holder, s) {
  const f = MODELS && MODELS[q.id]; if (!f) return;
  import('three/addons/loaders/GLTFLoader.js').then(({GLTFLoader}) => new GLTFLoader().load('models/' + f, gl => {
    if (!holder.parent) return;
    const obj = gl.scene, box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
    const k = s / Math.max(size.x, size.y, size.z, 1e-6);
    obj.position.sub(mid).multiplyScalar(k); obj.scale.setScalar(k);
    const mats = []; obj.traverse(o => { if (o.material) { o.material.transparent = true; mats.push(o.material); } });
    while (holder.children.length) holder.remove(holder.children[0]);
    holder.add(obj); holder.userData.mats = mats;
  }));
}

function playSong(t) {
  if (!t || !ok(t.file)) return;
  if (!AU) { AU = new Audio(); AU.preload = 'none'; }
  const url = src(t.file);
  if (playingK === t.k && !AU.paused) { AU.pause(); return; }
  if (playingK !== t.k) { AU.src = url; playingK = t.k; }
  let v = 1; try { const s = parseFloat(localStorage.getItem('gj.vol')); if (isFinite(s)) v = Math.max(0, Math.min(1, s)); } catch (e) {}
  AU.volume = v;
  const pr = AU.play(); if (pr && pr.catch) pr.catch(() => {});
}
function stopSong() { if (AU) { AU.pause(); } }

function build(p, tile, camera) {
  G = new THREE.Group(); G.visible = true; G.userData.born = performance.now();
  const {list, q} = contents(p);
  const tint = (E.D.chapters[q.chapter] || E.D.chapters.objects).tint;
  /* the room scales with the screen so a still reads at the same size on a phone and a desktop */
  const aspect = camera.aspect, fov = 60, tn = Math.tan(fov * Math.PI / 360);
  R = 260;
  const viewW = 2 * R * tn * aspect, sw = Math.max(70, Math.min(viewW * .62, R * .7));
  dome = new THREE.Mesh(new THREE.SphereGeometry(R * 3.2, 32, 16), domeMat(tint)); dome.renderOrder = -1; G.add(dome);
  const hor = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length: 96}, (_, i) => new THREE.Vector3(Math.cos(i / 96 * Math.PI * 2) * R * 1.5, -R * .42, Math.sin(i / 96 * Math.PI * 2) * R * 1.5))), new THREE.LineBasicMaterial({color: 0xeef3f5, transparent: true, opacity: 0, depthWrite: false}));
  G.add(hor); G.userData.hor = hor;
  const dn = 260, dp = new Float32Array(dn * 3);
  for (let i = 0; i < dn; i++) { const r = R * (.5 + rnd(i * 3.1) * 1.4), a = rnd(i * 7.7) * Math.PI * 2, y = (rnd(i * 1.3) - .5) * R * 1.4; dp[i * 3] = Math.cos(a) * r; dp[i * 3 + 1] = y; dp[i * 3 + 2] = Math.sin(a) * r; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({size: 1.8, map: E.TEX.CORE, color: 0xdfe9ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false}));
  G.add(dust); G.userData.dust = dust;
  /* stills and clips on a slow ring that faces you; the piece itself straight ahead */
  planes = []; vids = [];
  const n = list.length;
  /* slots one still-width apart, outward from the piece, then a row above and a row below; never overlapping */
  const gap = 2 * Math.atan(sw * .5 / R) * 1.12, cap = Math.max(2, Math.floor(Math.PI * 2 / gap)), ELS = [0, .64, -.64];
  list.forEach((m, i) => {
    let a, el, r;
    if (i === 0) { a = 0; el = 0; r = R * .92; }
    else {
      const j = i - 1, row = Math.min(2, Math.floor(j < cap - 1 ? 0 : (j - (cap - 1)) / cap + 1)), jj = row ? (j - (cap - 1)) % cap : j;
      const k = row ? Math.floor(jj / 2) + .5 : Math.floor(jj / 2) + 1;
      a = (jj % 2 ? -1 : 1) * k * gap; el = ELS[row] + (rnd(i * 9.2) - .5) * .06; r = R * (.95 + rnd(i * 2.2) * .1);
    }
    let mesh;
    if (m.type === 'text') {
      /* one line at a time as you turn; ~17 px on screen */
      r = R * .9; a = i * (Math.PI * 2 / n) * .94; el = .16 - (i / Math.max(1, n - 1)) * .32;
      mesh = textPlane(m.text, 900);
      const ppu = innerHeight / (2 * tn * r); mesh.userData.k = 17 / 15 / ppu; mesh.scale.setScalar(mesh.userData.k);
    } else {
      const ar = m.ar || 1;
      const b = i === 0 ? sw * 1.15 : sw * (.7 + rnd(i) * .25), w = b / Math.max(1, ar), h = w * ar;
      /* objects-fix: a cached texture runs this callback synchronously, before mesh exists; keep the ratio and apply it once mesh is assigned */
      let r2p = null;
      const fitAr = r2 => { if (mesh) mesh.scale.y = r2 / (mesh.userData.ar || 1); else r2p = r2; };
      const mat = texMat(m.type === 'vid' ? m.poster : m.url, t => { if (!m.ar && t.image) fitAr(t.image.height / t.image.width); });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); mesh.userData.ar = ar;
      if (r2p !== null) fitAr(r2p);
      if (m.type === 'vid') vids.push({mesh, m, v: null, live: 0});
    }
    mesh.renderOrder = 2;
    mesh.userData.home = {a, el, r, ph: rnd(i * 5.5) * 6}; mesh.userData.m = m;
    G.add(mesh); planes.push(mesh);
  });
  /* a stand-in form for objects, with a GLB swap point */
  standin = null;
  const sk = standinKind(q);
  if (sk) {
    const s = Math.min(R * .2, 2 * R * .6 * tn * aspect * .36);
    standin = buildStandin(sk, q, s); standin.position.set(0, -R * .31, -R * .6); standin.userData.y0 = -R * .31; G.add(standin);
    swapGLB(q, standin, s * 1.1);
    const hl = new THREE.HemisphereLight(0xdfe9ff, 0x1a1410, 1.1), dl = new THREE.DirectionalLight(0xfff4e6, 1.6); dl.position.set(R, R * 1.4, R * .6);
    G.add(hl, dl); lights = [hl, dl];
    if (planes[0]) planes[0].userData.home.r = R * 1.05;
  }
  /* songs */
  songs = []; ring = null; songRoom = null;
  const S = songsFor(q);
  if (S.own) {
    songRoom = S.own;
    const pk = S.own.peaks || [], M = 240, pos = new Float32Array(M * 3), col = new Float32Array(M * 3);
    for (let j = 0; j < M; j++) {
      const fj = j * (pk.length - 1) / M, j0 = Math.floor(fj), v = pk.length ? pk[j0] + (pk[Math.min(pk.length - 1, j0 + 1)] - pk[j0]) * (fj - j0) : .5;
      const a = -Math.PI / 2 + j / M * Math.PI * 2, rr = R * .8;
      pos[j * 3] = Math.cos(a) * rr; pos[j * 3 + 1] = -R * .08 + v * R * .34; pos[j * 3 + 2] = Math.sin(a) * rr;
      col[j * 3] = .9; col[j * 3 + 1] = .94; col[j * 3 + 2] = .96;
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    ring = new THREE.Points(geo, new THREE.PointsMaterial({size: 4, map: E.TEX.CORE, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: false}));
    ring.userData.M = M; G.add(ring);
    const lp = []; for (let j = 0; j < M; j++) { const k2 = (j + 1) % M; lp.push(new THREE.Vector3(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]), new THREE.Vector3(pos[k2 * 3], pos[k2 * 3 + 1], pos[k2 * 3 + 2])); }
    const line = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({color: 0x55DAA1, transparent: true, opacity: 0, depthWrite: false}));
    G.add(line); ring.userData.line = line;
    const head = new THREE.Sprite(new THREE.SpriteMaterial({map: E.TEX.GLOW, color: new THREE.Color(85 / 255, 218 / 255, 161 / 255), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0}));
    head.scale.setScalar(R * .16); G.add(head); ring.userData.head = head;
    const star = mkSong(S.own, 0, -R * .02, -R * .8, true); star.userData.own = 1;
  } else {
    const L = S.list, nn = L.length;
    L.forEach((t, j) => { const a = -Math.PI / 2 + (j - (nn - 1) / 2) * .34, el = .62 + (j % 2) * .06; mkSong(t, Math.cos(a) * R * .9 * Math.cos(el), Math.sin(el) * R * .9, Math.sin(a) * R * .9 * Math.cos(el)); });
  }
  /* the portal: a copy of the piece right where it hangs on the board; the camera flies through it */
  portal = null;
  if (tile && tile.mesh && tile.mesh.material.map) {
    portal = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: tile.mesh.material.map, transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide}));
    portal.scale.set(tile.w, tile.h, 1); portal.renderOrder = 8; E.scene.add(portal);
  }
  return q;
}
function mkSong(t, x, y, z, big) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: E.TEX.GLOW, color: new THREE.Color(1, 182 / 255, 176 / 255), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0}));
  s.position.set(x, y, z); s.scale.setScalar(R * (big ? .2 : .13)); s.userData = {t, ph: Math.random() * 6, base: R * (big ? .2 : .13)};
  const core = new THREE.Sprite(new THREE.SpriteMaterial({map: E.TEX.CORE, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0}));
  core.scale.setScalar(R * .022); s.add(core); s.userData.core = core; core.scale.divideScalar(s.scale.x);
  G.add(s); songs.push(s);
  return s;
}
function disposeRoom() {
  if (!G) return;
  vids.forEach(v => { if (v.v) { v.v.pause(); v.v.removeAttribute('src'); v.v.load(); } if (v.tex) v.tex.dispose(); });
  G.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m && m.map && m.map.isCanvasTexture) m.map.dispose(); m && m.dispose(); }); });
  E.scene.remove(G); G = null; planes = []; songs = []; vids = []; ring = null; standin = null; lights = [];
  if (portal) { E.scene.remove(portal); portal.geometry.dispose(); portal.material.dispose(); portal = null; }
  selP = focusP = selS = null;
}

const RC = new THREE.Raycaster();
let fromPos = new THREE.Vector3(), roomQ = new THREE.Quaternion(), baseQ = new THREE.Quaternion();
let curFov = 50;

export const Room = {
  init(env) { E = env; },
  can(p) {
    if (!p) return false;
    if (p.chapter === 'film') return true;
    if (p.chapter === 'photo') return true;
    if (p.chapter === 'objects') return true;
    if (p.chapter === 'sound') return p.kind === 'track' || p.kind === 'sound';
    if (p.chapter === 'about') return p.kind === 'poem';
    return false;
  },
  active() { return mode !== 'off'; },
  busy() { return mode === 'enter' || mode === 'exit'; },
  skyAlpha() { return 1 - .95 * ease(u); },
  enter(p, tile, camera) {
    if (G) disposeRoom();
    it = p;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    N.copy(fwd).negate();
    const at = tile ? tile.world.clone() : camera.position.clone().addScaledVector(fwd, 300);
    build(p, tile, camera);
    if (portal) { portal.position.copy(at).addScaledVector(N, 2); portal.quaternion.copy(camera.quaternion); }
    C.copy(at).addScaledVector(N, -R * 1.05);
    G.position.copy(C);
    E.scene.add(G);
    /* the room's front faces the way you came in */
    baseQ.copy(camera.quaternion);
    G.quaternion.copy(baseQ);
    yaw = 0; pitch = 0; yawV = pitchV = 0; fovT = 60;
    mode = 'enter'; t0 = performance.now(); dur = 1150; u = 0; onDone = null;
    if (songRoom) playSong(songRoom);
  },
  exit(cb) {
    if (mode === 'off') return;
    mode = 'exit'; t0 = performance.now(); dur = 900; onDone = cb || null;
    vids.forEach(v => v.v && v.v.pause());
    stopSong();
    focusP = null; selP = null; selS = null;
  },
  /* The app has already posed the camera for the sky (orbit); blend that with the room's own view by u. */
  place(camera, dt) {
    if (mode === 'off') return;
    const tn = performance.now();
    if (mode === 'enter') { u = Math.min(1, (tn - t0) / dur); if (u >= 1) { mode = 'in'; } }
    else if (mode === 'exit') { u = 1 - Math.min(1, (tn - t0) / dur); if (u <= 0) { u = 0; mode = 'off'; disposeRoom(); camera.fov = 50; camera.updateProjectionMatrix(); const f = onDone; onDone = null; f && f(); return; } }
    if (!held) { yaw += yawV * dt; pitch += pitchV * dt; const d = Math.exp(-3 * dt); yawV *= d; pitchV *= d; }
    pitch = Math.max(-1.1, Math.min(1.1, pitch));
    const e = ease(u);
    fromPos.copy(camera.position);
    const sq = camera.quaternion.clone();
    /* look: yaw / pitch about the room's own axes */
    tmpQ.setFromEuler(new THREE.Euler(pitch * e, yaw * e, 0, 'YXZ'));
    roomQ.copy(baseQ).multiply(tmpQ);
    camera.position.lerpVectors(fromPos, C, e);
    camera.quaternion.copy(sq).slerp(roomQ, Math.min(1, e * 1.4));
    curFov += (fovT - curFov) * (1 - Math.exp(-8 * dt));
    camera.fov = 50 + (curFov - 50) * e; camera.updateProjectionMatrix();
    if (portal) {
      const dd = tmpV.subVectors(portal.position, camera.position).dot(N);
      portal.material.opacity = dd > 0 ? Math.max(0, 1 - dd / 60) * (mode === 'exit' ? e : 1) : Math.min(1, 1 - e * .2);
      portal.visible = portal.material.opacity > .01;
    }
  },
  step(dt, tms, camera) {
    if (!G) return;
    const e = ease(u), inA = Math.max(0, Math.min(1, (u - .38) / .45));
    dome.material.uniforms.op.value = .9 * ease(inA);
    G.userData.hor.material.opacity = .14 * inA; G.userData.dust.material.opacity = .7 * inA;
    G.userData.dust.rotation.y = tms * .00002;
    const spin = (tms - G.userData.born) * .000018;
    const camL = G.worldToLocal(camera.position.clone());
    planes.forEach((m, i) => {
      const h = m.userData.home;
      if (focusP === m) {
        const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const tgt = G.worldToLocal(camera.position.clone().addScaledVector(fw, R * .55));
        m.position.lerp(tgt, 1 - Math.exp(-7 * dt));
      } else {
        const a = h.a + spin, y = Math.sin(h.el) * h.r + Math.sin(tms / 1700 + h.ph) * R * .02;
        const tgt = tmpV.set(Math.sin(a) * Math.cos(h.el) * h.r, y, -Math.cos(a) * Math.cos(h.el) * h.r);
        if (m.userData.placed) m.position.lerp(tgt, 1 - Math.exp(-5 * dt)); else { m.position.copy(tgt); m.userData.placed = 1; }
      }
      tmpM.lookAt(m.position, camL, new THREE.Vector3(0, 1, 0)); m.quaternion.setFromRotationMatrix(tmpM); m.rotateY(Math.PI);
      const sel = selP === m;
      m.material.opacity = inA * (m.material.map ? 1 : .6) * (focusP && focusP !== m ? .35 : 1);
      if (m.userData.m && m.userData.m.type === 'text') { m.material.opacity = inA * .95; m.scale.setScalar(m.userData.k); }
      else m.scale.setScalar(sel && !focusP ? 1.06 : 1);
    });
    /* clips: lazy, muted, at most three playing, poster until the first frame */
    if (mode === 'in') {
      const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      let live = 0;
      vids.forEach(v => {
        const wp = v.mesh.getWorldPosition(new THREE.Vector3()), dir = wp.sub(camera.position).normalize(), vis = dir.dot(fw) > .35;
        if (vis && live < 3) {
          live++;
          if (!v.v) {
            const el = document.createElement('video'); el.muted = true; el.loop = true; el.playsInline = true; el.setAttribute('playsinline', ''); el.preload = 'auto'; el.src = v.m.url;
            v.v = el; v.tex = new THREE.VideoTexture(el); v.tex.colorSpace = THREE.SRGBColorSpace;
            el.addEventListener('playing', () => { v.mesh.material.map = v.tex; v.mesh.material.color.set(0xffffff); v.mesh.material.needsUpdate = true; v.live = 1; });
          }
          if (v.v.paused) { const pr = v.v.play(); if (pr && pr.catch) pr.catch(() => {}); }
        } else if (v.v && !v.v.paused) v.v.pause();
      });
    }
    if (standin) {
      standin.rotation.y += dt * .25;
      standin.position.y = standin.userData.y0 + Math.sin(tms / 1500) * R * .015;
      (standin.userData.mats || []).forEach(m => { m.opacity = inA; m.transparent = inA < .999; });
      lights.forEach(l => { l.intensity = (l.isHemisphereLight ? 1.1 : 1.6) * inA; });
    }
    songs.forEach(s => {
      const on = selS === s || (playingK === s.userData.t.k && AU && !AU.paused);
      const pulse = 1 + .08 * Math.sin(tms / 700 + s.userData.ph);
      s.material.opacity = inA * (on ? 1 : .7); s.scale.setScalar(s.userData.base * pulse * (on ? 1.35 : 1));
      s.material.color.setRGB(on ? 85 / 255 : 1, on ? 218 / 255 : 182 / 255, on ? 161 / 255 : 176 / 255);
      s.userData.core.material.opacity = inA;
    });
    if (ring) {
      ring.material.opacity = inA; ring.userData.line.material.opacity = .25 * inA;
      const M = ring.userData.M, pr = AU && songRoom && playingK === songRoom.k && AU.duration ? AU.currentTime / AU.duration : 0;
      const col = ring.geometry.attributes.color, pos = ring.geometry.attributes.position, hi = Math.floor(pr * M);
      for (let j = 0; j < M; j++) { const played = j <= hi && pr > 0; col.setXYZ(j, played ? 85 / 255 : .9, played ? 218 / 255 : .94, played ? 161 / 255 : .96); }
      col.needsUpdate = true;
      const head = ring.userData.head; head.position.set(pos.getX(Math.min(M - 1, hi)), pos.getY(Math.min(M - 1, hi)), pos.getZ(Math.min(M - 1, hi)));
      head.material.opacity = pr > 0 ? inA * (.7 + .3 * Math.sin(tms / 200)) : 0;
    }
  },
  labels(label, proj) {
    if (!G || u < .6) return;
    const show = (s, cls, dy) => { const p = s.getWorldPosition(new THREE.Vector3()), q = proj(p.x, p.y, p.z); if (q) label(s.userData.t.title.replace(/[&<>]/g, ''), cls, q[0], q[1] + dy, .5, dy < 0 ? 1 : 0, 1); };
    if (selS) show(selS, 'sel', -16);
    if (songRoom && ring) {
      const own = songs.find(s => s.userData.own);
      if (own) {
        const p = own.getWorldPosition(new THREE.Vector3()), q = proj(p.x, p.y, p.z);
        if (q) { const pl = AU && playingK === songRoom.k; label(`${songRoom.title.replace(/[&<>]/g, '')}<br><span style="color:#c9d3d6;font-size:11px">${songRoom.artist} · ${pl ? mmss(AU.currentTime) + ' / ' : ''}${mmss(songRoom.dur)}</span>`, 'sel', q[0], q[1] + 22, .5, 0, 1); }
      }
    }
  },
  tap(x, y, camera, W, H) {
    if (mode !== 'in') return;
    /* songs first: nearest star on screen */
    let best = null, bd = 34;
    songs.forEach(s => { const p = s.getWorldPosition(new THREE.Vector3()).project(camera); if (p.z > 1) return; const sx = (p.x + 1) / 2 * W, sy = (1 - p.y) / 2 * H, d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = s; } });
    if (best) {
      if (selS === best || best.userData.own) { playSong(best.userData.t); selS = best; }
      else selS = best;
      return;
    }
    RC.setFromCamera(new THREE.Vector2(x / W * 2 - 1, -(y / H) * 2 + 1), camera);
    const h = RC.intersectObjects(planes.filter(m => m.userData.m.type !== 'text'), false)[0];
    if (!h) { selP = null; focusP = null; selS = null; return; }
    const m = h.object;
    if (focusP === m) { focusP = null; selP = null; return; }
    if (selP === m) { focusP = m; return; }
    selP = m; focusP = null;
  },
  grab() { held = true; yawV = pitchV = 0; },
  drag(dx, dy) { yaw += dx * .0042 * (fovT / 60); pitch += dy * .0036 * (fovT / 60); },
  release(v) { held = false; yawV = (v.x || 0) * .0042 * .5; pitchV = (v.y || 0) * .0036 * .5; },
  pinch(f, s) {
    if (mode !== 'in') return null;
    fovT = Math.max(34, Math.min(74, fovT / f));
    if (s < .72 || (s === 1 && fovT >= 74 && f < 1)) return 'out';
    return null;
  }
};
