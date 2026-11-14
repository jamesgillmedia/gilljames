/* Objects · version B: real cup photography in the specimen case.
 One room. Each piece is a case in the dark; its real photographs hang one behind another (Spirit Eye save 2 depth:
 planes at different distances, the camera travels a Catmull-Rom path through them, glide ease cubic-bezier(.22,1,.36,1)).
 Places (each is a history entry, so phone Back / pinch out / ‹ / Esc rise one place):
 objects board (m4) ⇄ proof sheet (every photograph, numbered) ⇄ the case (one photograph at a time) ⇄ its page
 In the case: pinch in / wheel / ↓ / Enter go one photograph deeper (whole piece → surface → making → use, or → angles);
 pinch out / ↑ rise one; swipe sideways / ← → glide to the next case. Tap the lit photograph for its page.
 The joio cup case also holds the mesh cup (photo-measured lathe from the photographs) on a plinth, turning slowly.
 Motion is the same with Reduce Motion on: nothing here reads prefers-reduced-motion. Nothing auto-advances. */
import * as THREE from '../vendor/three.module.min.js';
import { loadCup } from './shared/cup.js';
import { entry, boardUrl, cardUrl, cardsOf, homeUrl } from './shared/board.js';

const SPECS = window.OBJ_B, $ = id => document.getElementById(id);
const NOGL = document.documentElement.classList.contains('nogl');
/* flat stops: every photograph of every piece, in case order */
const STOPS = [];
SPECS.forEach((s, si) => { let k = 0; s.start = STOPS.length;
  s.layers.forEach(([name, frames]) => frames.forEach((f, i) => STOPS.push({ si, s, layer: name, li: i, ln: frames.length, k: k++, f, g: STOPS.length })));
  s.n = k; s.end = STOPS.length - 1 });
const img = f => 'media/img/' + f.id + '.webp', th = f => 'media/th/' + f.id + '.webp';
const pad = n => (n < 10 ? '0' : '') + n;

/* ---------- ease (Spirit Eye save 2) ---------- */
function bez(x1, y1, x2, y2) {
  const cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t, dcb = (t, a, b) => 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s } return cb(Math.max(0, Math.min(1, t)), y1, y2) };
}
const EASE = bez(0.22, 1, 0.36, 1);

/* ---------- hint ---------- */
let hintT = 0;
function hint(t, ms) { let h = document.querySelector('.hint'); if (!h) { h = document.createElement('div'); h.className = 'hint gone'; document.body.appendChild(h) }
  h.textContent = t; void h.offsetWidth; h.classList.remove('gone'); clearTimeout(hintT); hintT = setTimeout(() => h.classList.add('gone'), ms || 4200) }

/* ---------- places: history stack ---------- */
const stack = [];
const place = {
  push(name, leave) { stack.push({ name, leave }); try { history.pushState({ ob: stack.length }, '', location.hash) } catch (e) {} },
  top: () => stack.length ? stack[stack.length - 1].name : 'proof',
  back() { if (stack.length) history.back(); else leave(boardUrl()) }
};
addEventListener('popstate', e => { const d = (e.state && e.state.ob) || 0; while (stack.length > d) { const s = stack.pop(); try { s.leave && s.leave() } catch (x) { console.warn(x) } } sync() });
function leave(href) { $('veil').classList.remove('off'); setTimeout(() => { location.href = href }, 800) }
addEventListener('pageshow', () => $('veil').classList.add('off'));
function keepHash() { const st = STOPS[cur]; const h = '#' + st.s.id + '/' + st.layer.replace(' ', '-') + (st.li ? '/' + st.li : '');
  if (location.hash !== h) try { history.replaceState(history.state, '', h) } catch (e) {} }

/* ---------- one level per pinch gesture (touch) or trackpad pinch (ctrl+wheel) ---------- */
let gcool = 0;
function fire(fn, x, y) { const n = Date.now(); if (n < gcool || !fn) return false; gcool = n + 850; fn(x, y); return true }
function pinch(el, o) {
  let d0 = 0, done = false, cx = 0, cy = 0;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  el.addEventListener('touchstart', e => { if (e.touches.length === 2) { d0 = dist(e.touches); done = false; cx = (e.touches[0].clientX + e.touches[1].clientX) / 2; cy = (e.touches[0].clientY + e.touches[1].clientY) / 2; if (e.cancelable) e.preventDefault(); o.start && o.start() } }, { passive: false });
  el.addEventListener('touchmove', e => { if (e.touches.length !== 2 || !d0) return; if (e.cancelable) e.preventDefault(); if (done) return; const r = dist(e.touches) / d0;
    if (r > 1.28) { done = true; fire(o.in, cx, cy) } else if (r < 0.78) { done = true; fire(o.out, cx, cy) } }, { passive: false });
  el.addEventListener('touchend', e => { if (e.touches.length < 2) d0 = 0 }, { passive: true });
  let acc = 0, cool = 0;
  el.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); const now = Date.now(); if (now < cool) return; acc += e.deltaY;
    if (acc < -40) { acc = 0; cool = now + 700; fire(o.in, e.clientX, e.clientY) } else if (acc > 40) { acc = 0; cool = now + 700; fire(o.out, e.clientX, e.clientY) } }, { passive: false });
}
['gesturestart', 'gesturechange', 'gestureend'].forEach(n => document.addEventListener(n, e => e.preventDefault(), { passive: false }));

/* =========================================================================================
 the room (three.js)
 ========================================================================================= */
let cur = 0;               /* stop index the camera is at / heading to */
let gpos = 0, anim = null, xf = null; /* xf: a glide between cases */ /* camera position along the stops (float) */
let renderer, scene, camera, cupMesh = null, cupGroup = null, planes = [], dirty = true;
const PH = 2.4;            /* photograph height in world units (landscape frames: width-capped) */
const DK = 3.4;            /* depth between photographs of one piece */
const ROWX = 7.5;          /* the cases stand in a row across the dark; each piece goes back into the dark from its case */
/* sideways offsets of each photograph from its case axis: the next ones peek out from behind the lit one */
const OX = [0, 1.15, -1.25, .85, -.95, 1.3, -1.1, .7, -.8, 1.2, -1.3, .9, -.7, 1.1, -1.2, .8, -.9, 1.25, -1.05, .75, -.85, 1.15, -1.2, .9];
const OY = [0, .18, -.12, .22, -.08, .14, -.2, .1, -.16, .2, -.1, .16, -.14, .12, -.18, .08, -.12, .2, -.1, .14, -.16, .1, -.08, .12];

function caseOrigin(si) { return new THREE.Vector3(si * ROWX, 0, 0) }
function stopPlane(st) { const o = caseOrigin(st.si); return new THREE.Vector3(o.x + OX[st.k % OX.length], o.y + OY[st.k % OY.length], o.z - st.k * DK) }
function frameSize(f) { let h = PH, w = h * f.w / f.h; const maxW = PH * 1.25; if (w > maxW) { w = maxW; h = w * f.h / f.w } return { w, h } }
/* camera distance so the lit photograph fills ~70% of the height (portrait) or the width cap (narrow phones) */
function camDist(f) { const { w, h } = frameSize(f), t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), a = camera.aspect;
  const land = a > 1, fh = land && innerHeight < 500 ? .62 : land ? .6 : .5, fw = land ? .5 : .7;
  return Math.max(h / (fh * 2 * t), w / (fw * 2 * t * a)) }
let P = []; /* per stop: {p: camera pos, l: look target} */
function layoutPath() { P = STOPS.map(st => { const c = stopPlane(st), d = camDist(st.f); const lift = st.k === 0 && st.s.model ? .0 : 0;
  const o = caseOrigin(st.si); return { p: new THREE.Vector3(o.x + (c.x - o.x) * .82, c.y + .05 + lift, c.z + d), l: new THREE.Vector3(c.x, c.y + lift, c.z) } }) }
function cr(p0, p1, p2, p3, t, out) { const t2 = t * t, t3 = t2 * t; return out.set(
  .5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
  .5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  .5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)) }
const _p = new THREE.Vector3(), _l = new THREE.Vector3(), par = { x: 0, y: 0, tx: 0, ty: 0 };
function poseAt(g) { const n = P.length, i = Math.max(0, Math.min(n - 1, Math.floor(g))), t = Math.max(0, Math.min(1, g - i)), s = STOPS[i].s,
    q = j => P[Math.max(s.start, Math.min(s.end, j))];
  cr(q(i - 1).p, q(i).p, q(i + 1).p, q(i + 2).p, t, _p); cr(q(i - 1).l, q(i).l, q(i + 1).l, q(i + 2).l, t, _l) }
/* between cases: an eased glide from where we stand to the next case, pulling back a little through the dark on the way */
const _a = new THREE.Vector3(), _al = new THREE.Vector3(), _b = new THREE.Vector3(), _bl = new THREE.Vector3();
function place3d() {
  if (xf) { poseAt(xf.a); _a.copy(_p); _al.copy(_l); poseAt(xf.b); _b.copy(_p); _bl.copy(_l); const e = EASE(xf.k), bump = Math.sin(Math.PI * Math.min(1, xf.k * 1.15)) * 2.2;
    _p.lerpVectors(_a, _b, e); _p.z += bump; _p.y += bump * .18; _l.lerpVectors(_al, _bl, e) } else poseAt(gpos);
  camera.position.copy(_p).add(new THREE.Vector3(par.x * .12, par.y * .08, 0)); camera.lookAt(_l) }

/* textures */
const LOADER = new THREE.TextureLoader();
function tex(url, cb) { LOADER.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; cb(t) }, undefined, () => {}) }
function radialTex(inner, outer) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t }

function buildRoom() {
  renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x050506); scene.fog = new THREE.Fog(0x050506, 6, 26);
  camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, .05, 120);
  scene.add(new THREE.AmbientLight(0xfff4e6, .55));
  const key = new THREE.DirectionalLight(0xffe2bd, 2.2); key.position.set(-2, 4, 3); scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(0x9fb7c8, .8); rim.position.set(3, 2, -2); scene.add(rim);
  const pool = radialTex('rgba(233,215,184,.42)', 'rgba(233,215,184,0)'), shade = radialTex('rgba(0,0,0,.55)', 'rgba(0,0,0,0)');
  /* the floor of the room: a long dark ground the cases stand on, so depth reads */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 220), new THREE.MeshBasicMaterial({ color: 0x0a0a0b }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(15, -2.05, -90); scene.add(floor);
  /* dust in the dark: still specks through the whole room, so moving between prints reads as moving through space */
  { const n = 900, pos = new Float32Array(n * 3); let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) { pos[i * 3] = -6 + rnd() * (ROWX * SPECS.length + 8); pos[i * 3 + 1] = -2 + rnd() * 6; pos[i * 3 + 2] = 6 - rnd() * 90 }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(gg, new THREE.PointsMaterial({ color: 0xe9d7b8, size: .028, transparent: true, opacity: .5, depthWrite: false }))) }
  STOPS.forEach(st => {
    const grp = new THREE.Group(), c = stopPlane(st), { w, h } = frameSize(st.f); grp.position.copy(c);
    /* the mount: a museum card a little larger than the print, a fine warm edge, the photograph itself */
    const mountM = new THREE.MeshBasicMaterial({ color: 0x141416, transparent: true, depthWrite: false });
    const mount = new THREE.Mesh(new THREE.PlaneGeometry(w + .22, h + .22), mountM); mount.position.z = -.02; grp.add(mount);
    const edgeM = new THREE.LineBasicMaterial({ color: 0xe9d7b8, transparent: true, opacity: .0, depthWrite: false });
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w + .1, h + .1)), edgeM); edge.position.z = -.01; grp.add(edge);
    const photoM = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, depthWrite: false });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(w, h), photoM); grp.add(photo);
    /* light falling on the ground under the print, and its soft shadow */
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.2, 2.4), new THREE.MeshBasicMaterial({ map: pool, transparent: true, depthWrite: false, opacity: 0 }));
    lp.rotation.x = -Math.PI / 2; lp.position.set(0, -2.04 - c.y, .6); grp.add(lp);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.1, .9), new THREE.MeshBasicMaterial({ map: shade, transparent: true, depthWrite: false, opacity: 0 }));
    sh.rotation.x = -Math.PI / 2; sh.position.set(0, -2.03 - c.y, .15); grp.add(sh);
    /* the whole-piece print stands in a glass case */
    let caseL = null;
    if (st.k === 0) { const bw = w + .7, bd = .9;
      const box = new THREE.BoxGeometry(bw, 2.05 + c.y + h / 2 + .35, bd); caseL = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0xcfd8d6, transparent: true, opacity: 0, depthWrite: false }));
      caseL.position.set(0, (-(2.05 + c.y) + h / 2 + .35) / 2, .05); grp.add(caseL) }
    photo.userData.stop = st.g; mount.userData.stop = st.g;
    scene.add(grp);
    const pl = { st, grp, photo, photoM, mountM, edgeM, lp, sh, caseL, level: 0, w, h };
    tex(th(st.f), t => { if (pl.level < 1) { photoM.map = t; photoM.needsUpdate = true; pl.level = 1; dirty = true } });
    planes.push(pl);
  });
  /* the mesh cup in the joio case: on a small plinth in front of the print, lower right */
  const js = SPECS.find(s => s.model);
  if (js) { const st = STOPS[js.start], c = stopPlane(st), { w, h } = frameSize(st.f);
    cupGroup = new THREE.Group(); scene.add(cupGroup);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(.62, .9, .62), new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: .95 }));
    plinth.position.y = .45; cupGroup.add(plinth);
    const plTop = new THREE.Mesh(new THREE.PlaneGeometry(.62, .62), new THREE.MeshBasicMaterial({ map: pool, transparent: true, depthWrite: false, opacity: .5 }));
    plTop.rotation.x = -Math.PI / 2; plTop.position.y = .902; cupGroup.add(plTop);
    const spot = new THREE.SpotLight(0xffe6c4, 14, 6, .5, .7, 1.6); spot.position.set(-.6, 2.6, 1.2); spot.target = plinth; cupGroup.add(spot);
    loadCup(THREE, new URL('../cup/joio-cup.glb', import.meta.url)).then(m => { const s = 8.6; m.scale.set(s, s, s); m.position.y = .903; m.userData.cup = true;
      cupMesh = m; cupGroup.add(m); dirty = true }).catch(e => console.warn('cup', e));
    cupGroup.userData.stop = st.g; }
  layoutPath();
  addEventListener('resize', resize); resize();
}
function resize() { if (!renderer) return; renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < .7 ? 40 : 34; camera.updateProjectionMatrix(); layoutPath(); placeCup(); place3d(); dirty = true }
/* the plinth stands just right of the whole-piece print, pulled in on narrow screens so it stays in the frame */
function placeCup() { if (!cupGroup) return; const st = STOPS[cupGroup.userData.stop], c = stopPlane(st), { w } = frameSize(st.f), z = c.z + .95, D = P[st.g].p.z - z;
  const half = D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect; cupGroup.position.set(Math.min(c.x + w / 2 + .1, P[st.g].p.x + half - .5), -2.05, z) }

/* how lit each print is, by its distance along this piece's axis from the camera; other cases only show their whole piece, faintly */
const tint = new THREE.Color(), _ca = new THREE.Color(), _cb = new THREE.Color();
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) };
function alphaFor(pl, g) { const gi = Math.round(g), st = STOPS[gi], d = Math.abs(pl.st.g - g);
  if (pl.st.si !== st.si) { const ds = Math.abs(pl.st.si - st.si); return pl.st.k === 0 && ds === 1 && st.k === 0 ? .3 * Math.max(0, 1 - Math.abs(g - gi) * 2) : 0 }
  let a = d < 1 ? 1 - .5 * d : Math.max(0, .5 - .09 * (d - 1)); if (pl.st.g < g - .3) a *= Math.max(0, 1 - (g - pl.st.g - .3) * 2.5); return a }
function shade() {
  const here = STOPS[Math.round(xf ? (xf.k < .5 ? xf.a : xf.b) : gpos)];
  for (const pl of planes) { let a, d;
    if (xf) { const A = alphaFor(pl, xf.a), B = alphaFor(pl, xf.b); a = Math.max(A * (1 - smooth(xf.k * 2.2)), B * smooth(xf.k * 1.6 - .35)); d = Math.min(Math.abs(pl.st.g - xf.a) + 3 * xf.k, Math.abs(pl.st.g - xf.b) + 3 * (1 - xf.k)) }
    else { a = alphaFor(pl, gpos); d = Math.abs(pl.st.g - gpos); if (pl.st.si !== here.si) d = 1.4 }
    const lit = d < 1 ? 1 - .58 * d : Math.max(.2, .42 - .05 * (d - 1));
    pl.photoM.color.setScalar(pl.level ? lit : .12); pl.photoM.opacity = a; pl.mountM.opacity = a * .95;
    pl.edgeM.opacity = Math.max(0, 1 - d * 1.4) * .55 * a; pl.lp.material.opacity = Math.max(0, 1 - d) * .9 * a; pl.sh.material.opacity = a * .7;
    if (pl.caseL) pl.caseL.material.opacity = a * Math.max(.25, 1 - d * .4) * .14;
    pl.grp.visible = a > .01;
    if (d < 2.6 && a > .05 && pl.level < 2 && !pl.loading) { pl.loading = true; tex(img(pl.st.f), t => { const old = pl.photoM.map; pl.photoM.map = t; pl.photoM.needsUpdate = true; pl.level = 2; if (old) old.dispose(); dirty = true }) } }
  /* the dark ground takes a deep tone from the lit photograph (like the photo lab's sky); worked out in sRGB so it stays dark */
  const g = xf ? (xf.k < .5 ? xf.a : xf.b) : gpos, i0 = Math.max(0, Math.floor(g)), i1 = Math.min(STOPS.length - 1, i0 + 1), t = g - i0;
  _ca.set(STOPS[i0].f.avg).convertLinearToSRGB(); _cb.set(STOPS[i1].f.avg).convertLinearToSRGB(); _ca.lerp(_cb, t);
  tint.setRGB(.012 + _ca.r * .045, .012 + _ca.g * .045, .014 + _ca.b * .045, THREE.SRGBColorSpace); scene.background.copy(tint); scene.fog.color.copy(tint);
  if (cupGroup) { const cg = cupGroup.userData.stop; cupGroup.visible = here.si === STOPS[cg].si && g < cg + .75 }
}
let last = performance.now();
function frame(now) { requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (anim) { const k = Math.min(1, (now - anim.t0) / anim.dur); gpos = anim.a + (anim.b - anim.a) * EASE(k); if (k >= 1) { anim = null; settled() } dirty = true }
  if (xf) { xf.k = Math.min(1, (now - xf.t0) / xf.dur); if (xf.k >= 1) { gpos = xf.b; xf = null; settled() } dirty = true }
  par.x += (par.tx - par.x) * .05; par.y += (par.ty - par.y) * .05; if (Math.abs(par.tx - par.x) > .001) dirty = true;
  if (cupMesh && cupGroup.visible) { cupMesh.rotation.y += dt * .28; dirty = true } /* the cup turns slowly on its plinth, same with Reduce Motion */
  if (!dirty || !renderer) return; dirty = false; place3d(); shade(); renderer.render(scene, camera) }

/* ---------- moving ---------- */
function go(g, opts = {}) { g = Math.max(0, Math.min(STOPS.length - 1, g)); const from = gpos, far = STOPS[g].si !== STOPS[Math.round(xf ? xf.b : from)].si;
  cur = g; $('label').classList.add('hide');
  if (NOGL || opts.now) { gpos = g; anim = null; xf = null; dirty = true; settled(); return }
  if (xf) { gpos = xf.b; xf = null }
  if (far) { anim = null; xf = { a: Math.round(gpos), b: g, t0: performance.now(), dur: 1900, k: 0 }; sync(); return }
  const dist = Math.abs(g - gpos), dur = Math.min(1400, 900 + 120 * (dist - 1));
  anim = { a: gpos, b: g, t0: performance.now(), dur }; sync() }
function settled() { syncLabel(); $('label').classList.remove('hide'); keepHash(); sync() }
function deeper() { const st = STOPS[cur]; if (cur < st.s.end) go(cur + 1); else hint('the last photograph of this piece · pinch out to rise · swipe for the next piece', 3200) }
function rise() { const st = STOPS[cur]; if (cur > st.s.start) go(cur - 1); else place.back() }
function nextPiece(d) { const si = STOPS[cur].si + d; if (si < 0 || si >= SPECS.length) return; go(SPECS[si].start) }

/* ---------- labels ---------- */
function syncLabel() { const st = STOPS[cur];
  $('lt').textContent = st.s.title + ' · ' + st.layer; $('lc').textContent = st.f.cap || '';
  $('ln').textContent = (st.ln > 1 ? (st.li + 1) + ' of ' + st.ln + ' · ' : '') + 'photograph ' + pad(st.k + 1) + ' of ' + st.s.n;
  const L = $('layers'); let html = '', lastL = '';
  STOPS.filter(x => x.si === st.si).forEach(x => { if (x.layer !== lastL) { html += '<b class="' + (x.layer === st.layer ? 'on' : '') + '">' + x.layer + '</b>'; lastL = x.layer }
    html += '<i class="' + (x.g === cur ? 'on' : '') + '"></i>' }); L.innerHTML = html;
  $('prev').disabled = st.si === 0; $('next').disabled = st.si === SPECS.length - 1 }
function sync() { const top = place.top(), st = STOPS[cur];
  $('where').textContent = top === 'proof' ? 'proof sheet' : top === 'detail' ? st.s.title + ' · its page' : st.s.title + ' · ' + st.layer;
  $('proofBtn').classList.toggle('on', top === 'proof'); $('proofBtn').setAttribute('aria-pressed', top === 'proof');
  document.querySelectorAll('.cell').forEach(c => c.classList.toggle('cur', +c.dataset.g === cur)) }

/* =========================================================================================
 proof sheet (the overview): every photograph, numbered, grouped by piece, in the order of the case
 ========================================================================================= */
function buildProof() { const g = $('pgrid'); g.innerHTML = '';
  SPECS.forEach(s => { const sec = document.createElement('section'); sec.className = 'pset';
    sec.innerHTML = '<h2>' + s.title + '<span>' + s.n + ' photographs</span></h2>'; const grid = document.createElement('div'); grid.className = 'pgrid';
    STOPS.filter(x => x.s === s).forEach(x => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cell'; b.dataset.g = x.g;
      b.setAttribute('aria-label', s.title + ', ' + x.layer + ', photograph ' + (x.k + 1));
      b.innerHTML = '<span class="win"><img alt="" decoding="async" loading="lazy" src="' + th(x.f) + '" width="' + x.f.w + '" height="' + x.f.h + '"></span><span class="no">' + pad(x.k + 1) + '</span>' + (x.li === 0 ? '<span class="ly">' + x.layer + '</span>' : '');
      grid.appendChild(b) });
    sec.appendChild(grid); g.appendChild(sec) });
  cols() }
function cols() { $('pgrid').style.setProperty('--cols', innerWidth < 560 ? 3 : innerWidth < 1000 ? 6 : 8); document.querySelectorAll('.pgrid').forEach(x => x.style.setProperty('--cols', innerWidth < 560 ? 3 : innerWidth < 1000 ? 6 : 8)) }
addEventListener('resize', cols);
function showProof(on) { const p = $('proof');
  if (on) { p.hidden = false; void p.offsetWidth; p.classList.add('open'); sync();
    requestAnimationFrame(() => { const c = document.querySelector('.cell[data-g="' + cur + '"]'); if (c) c.scrollIntoView({ block: 'center' }) }) }
  else { p.classList.remove('open'); setTimeout(() => { if (!p.classList.contains('open')) p.hidden = true }, 950) } }
function enterCase(g) { if (g != null) { const far = Math.abs(g - gpos) > 0; if (place.top() === 'proof') go(g, { now: true }); else if (far) go(g) }
  if (place.top() !== 'proof') return;
  showProof(false); place.push('case', () => showProof(true)); sync(); $('label').classList.remove('hide'); if (NOGL) openDetail() }
$('pgrid').addEventListener('click', e => { const b = e.target.closest('.cell'); if (!b) return; enterCase(+b.dataset.g) });
$('proofBtn').addEventListener('click', () => { const t = place.top(); if (t === 'proof') enterCase(cur); else if (t === 'detail') { history.go(-2) } else place.back() });
pinch($('proof'), { in: () => enterCase(cur), out: () => leave(boardUrl()) });

/* =========================================================================================
 a photograph's page
 ========================================================================================= */
function fillDetail() { const st = STOPS[cur], s = st.s;
  $('dhero').innerHTML = '<img alt="' + s.title + ', ' + st.layer + (st.f.cap ? ': ' + st.f.cap.replace(/"/g, '&quot;') : '') + '" src="' + img(st.f) + '" width="' + st.f.w + '" height="' + st.f.h + '">';
  $('dmeta').innerHTML = '<div class="t ju">' + s.title + ' · ' + st.layer + '</div>' + (st.f.cap ? '<p class="c">' + st.f.cap + '</p>' : '') +
    '<div class="n">photograph ' + pad(st.k + 1) + ' of ' + s.n + (st.f.angle ? ' · ' + st.f.angle : '') + '</div>';
  $('dmore').innerHTML = '<h3>every photograph of this piece</h3><div class="strip">' + STOPS.filter(x => x.s === s).map(x =>
    '<button type="button" data-g="' + x.g + '" class="' + (x.g === cur ? 'cur' : '') + '" aria-label="photograph ' + (x.k + 1) + '"><img alt="" loading="lazy" src="' + th(x.f) + '"></button>').join('') + '</div>';
  const cards = cardsOf(s.id);
  $('donboard').innerHTML = cards.length ? '<h3>on the objects board</h3><div class="strip">' + cards.map(c => '<a href="' + cardUrl(c.slug) + '" data-leave="1"><img alt="" loading="lazy" src="' + c.th + '"><span>' + c.title + '</span></a>').join('') + '</div>'
    : '<h3>on the objects board</h3><div class="strip"><a href="' + boardUrl() + '" data-leave="1"><span>objects board ›</span></a></div>' }
function openDetail() { if (place.top() === 'detail') { fillDetail(); $('dsc').scrollTo({ top: 0, behavior: 'smooth' }); return }
  if (place.top() === 'proof') enterCase(cur);
  fillDetail(); $('dsc').scrollTop = 0; const d = $('detail'); d.hidden = false; void d.offsetWidth; d.classList.add('open');
  place.push('detail', () => { d.classList.remove('open'); setTimeout(() => { if (!d.classList.contains('open')) d.hidden = true }, 950) }); sync();
  hint('scroll for every photograph of this piece · pinch out or ‹ to go back to the case', 3600) }
$('dmore').addEventListener('click', e => { const b = e.target.closest('button[data-g]'); if (!b) return; const g = +b.dataset.g; go(g, { now: true }); fillDetail(); $('dsc').scrollTo({ top: 0, behavior: 'smooth' }) });
$('donboard').addEventListener('click', e => { const a = e.target.closest('a[data-leave]'); if (!a) return; e.preventDefault(); leave(a.getAttribute('href')) });
$('dend').addEventListener('click', () => place.back());
pinch($('detail'), { in: () => {}, out: () => place.back() });

/* =========================================================================================
 input in the case
 ========================================================================================= */
const canvas = $('c'), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(x, y) { if (!renderer) return null; ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const objs = planes.filter(p => p.grp.visible && p.photoM.opacity > .05).map(p => p.photo); if (cupMesh && cupGroup.visible) objs.unshift(cupMesh);
  const hit = ray.intersectObjects(objs, false)[0]; if (!hit) return null; return hit.object.userData.cup ? { cup: true } : { g: hit.object.userData.stop } }
let dr = null;
canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !e.isPrimary) { dr = null; return } dr = { x: e.clientX, y: e.clientY, t: Date.now(), m: false, g0: gpos, scrub: false }; canvas.setPointerCapture(e.pointerId) });
canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { par.tx = e.clientX / innerWidth * 2 - 1; par.ty = -(e.clientY / innerHeight * 2 - 1) }
  if (!dr) return; const dx = e.clientX - dr.x, dy = e.clientY - dr.y; if (Math.hypot(dx, dy) > 8) dr.m = true;
  /* vertical drag scrubs through this piece's photographs (up = deeper), snapping on release */
  if (dr.m && Math.abs(dy) > Math.abs(dx) * 1.2) { const st = STOPS[cur], s = st.s; dr.scrub = true; anim = null;
    gpos = Math.max(s.start, Math.min(s.end, dr.g0 - dy / (innerHeight * .22))); dirty = true; $('label').classList.add('hide') } });
canvas.addEventListener('pointerup', e => { if (!dr) return; const dx = e.clientX - dr.x, dy = e.clientY - dr.y, d = dr; dr = null;
  if (d.scrub) { const g = Math.round(gpos); cur = -1; go(g); return }
  if (d.m) { if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) nextPiece(dx < 0 ? 1 : -1); return }
  const h = pick(e.clientX, e.clientY); if (!h) return;
  if (h.cup) { if (cur !== STOPS.find(x => x.s.model).g) go(STOPS.find(x => x.s.model).g); else openDetail(); return }
  if (h.g === cur && !anim && !xf) openDetail(); else go(h.g) });
canvas.addEventListener('pointercancel', () => { if (dr && dr.scrub) go(Math.round(gpos)); dr = null });
let wacc = 0, wcool = 0;
canvas.addEventListener('wheel', e => { if (e.ctrlKey) return; e.preventDefault(); const now = Date.now(); if (now < wcool) return;
  const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY); wacc += horiz ? e.deltaX : e.deltaY;
  if (Math.abs(wacc) > 60) { const s = Math.sign(wacc); wacc = 0; wcool = now + 650; if (horiz) nextPiece(s); else if (s > 0) deeper(); else { const st = STOPS[cur]; if (cur > st.s.start) go(cur - 1) } } }, { passive: false });
pinch(canvas, { in: () => deeper(), out: () => rise() });
$('prev').addEventListener('click', () => nextPiece(-1)); $('next').addEventListener('click', () => nextPiece(1));
$('back').addEventListener('click', () => { if (place.top() === 'case') rise(); else place.back() });
document.addEventListener('keydown', e => { const t = place.top(), k = e.key;
  if (t === 'detail') { if (k === 'Escape' || k === '-' || k === 'Backspace') { place.back(); e.preventDefault() } return }
  if (t === 'proof') { if (k === 'Enter' || k === '+' || k === '=') { enterCase(cur); e.preventDefault() } else if (k === 'Escape') leave(boardUrl()); return }
  if (k === 'ArrowDown' || k === 'Enter' || k === '+' || k === '=') { deeper(); e.preventDefault() }
  else if (k === 'ArrowUp' || k === '-' || k === 'Escape') { rise(); e.preventDefault() }
  else if (k === 'ArrowRight') { nextPiece(1); e.preventDefault() } else if (k === 'ArrowLeft') { nextPiece(-1); e.preventDefault() }
  else if (k === ' ') { openDetail(); e.preventDefault() } });

/* =========================================================================================
 start: arrive on one piece (the board's ring if we came from one), the proof sheet one place up
 ========================================================================================= */
buildProof();
const E = entry(); let start = SPECS[0].start;
{ const s = SPECS.find(x => x.id === E.ring) || SPECS[0]; start = s.start;
  if (E.layer) { const want = E.layer.replace('-', ' '), hit = STOPS.find(x => x.s === s && x.layer === want && x.li === (E.i || 0)); if (hit) start = hit.g } }
cur = start; gpos = start;
try { history.replaceState({ ob: 0 }, '', location.hash) } catch (e) {}
if (!NOGL) { buildRoom(); requestAnimationFrame(frame) }
if (NOGL) { showProof(true) } else { place.push('case', () => showProof(true)); settled() }
$('veil').classList.add('off');
window.OBJB = { go, deeper, rise, nextPiece, openDetail, top: place.top, cur: () => cur, stops: STOPS.length, enterCase, back: () => place.back(), anim: () => !!(anim || xf) };
hint(NOGL ? 'every photograph of every piece · tap one for its page' : 'pinch in or scroll to go deeper into the piece · swipe for the next case · tap the photograph for its page', 5200);
