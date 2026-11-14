/* Objects · version C · ring movement.
 The rings are the way in. Five rings stand one behind another in the dark, each a little further and to the side of the last.
 Along: swipe / ‹ › / arrow keys glide from ring to ring. Through: tap a ring, pinch in, Enter or scroll in carries the camera
 through its hoop into that piece's room; each deeper layer (surface, making, use…) is a smaller ring further down the same axis,
 and pinch in passes through the next one. Pinch out, ‹ Back, Esc or phone back rise exactly one layer, back out through the ring
 you came in by, and from the first ring back up to the board, landing on the card or ring you left from.
 Spatial language borrowed from Spirit Eye save 2 : one camera on a Catmull-Rom path, drawings/photos as planes at
 different distances, cubic-bezier(.22,1,.36,1) glides, text only at rest, light hoops, static motes, fog. Nothing auto-advances.
 Motion is the same with Reduce Motion on: nothing here reads prefers-reduced-motion. Silent. */
import * as THREE from '../vendor/three.module.min.js';
import { loadGLB } from './glb.js';

const D = window.OBJ_C, RINGS = D.rings, BOARD = D.board;
const $ = id => document.getElementById(id);
const M = p => 'media/' + p + '.webp', MT = p => 'media/' + p + '-480.webp';
/* the m4 Objects board: '../#objects/board' when this folder sits at fable-m4/objects-3d/ (SHARED-NOTES wiring), else the local fable-m4 copy */
const IN_SITE = /\/objects-3d\//.test(location.pathname);
const M4 = IN_SITE ? '../#objects/board' : '../../#objects/board';
const FROM = (location.search.match(/[?&]from=([\w-]+)/) || [])[1] || null, FROM_M4 = !!FROM;

/* ---------- easing + paths (from Spirit Eye save 2) ---------- */
function bez(x1, y1, x2, y2) {
  const cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t, dcb = (t, a, b) => 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s } return cb(Math.max(0, Math.min(1, t)), y1, y2) };
}
const EASE = bez(0.22, 1, 0.36, 1), EASE_IO = bez(0.45, 0, 0.25, 1);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function crPoint(pts, u, out) { /* uniform Catmull-Rom through pts, u in 0..1 */
  const n = pts.length - 1; if (n <= 0) return out.copy(pts[0]);
  const f = Math.min(n - 1e-6, Math.max(0, u * n)), i = Math.floor(f), t = f - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)], t2 = t * t, t3 = t2 * t;
  const c = k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
  return out.set(c('x'), c('y'), c('z'));
}

/* ---------- renderer, scene ---------- */
const canvas = $('gl');
const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
R.setClearColor(0x000000, 0); R.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x07080b, .045);
const FOV = 42, tanH = Math.tan(FOV * Math.PI / 360);
const cam = new THREE.PerspectiveCamera(FOV, 1, .05, 160);
scene.add(new THREE.HemisphereLight(0xfff1de, 0x0b0d12, .55));
const key = new THREE.DirectionalLight(0xffe2bf, 1.6); key.position.set(-3, 6, 5); scene.add(key); scene.add(key.target);
const fill = new THREE.DirectionalLight(0x9fb6c8, .35); fill.position.set(4, 1, -2); scene.add(fill);

const glow = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })();
const softMask = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); x.filter = 'blur(7px)'; x.fillStyle = '#fff'; x.fillRect(10, 10, 236, 236);
  return new THREE.CanvasTexture(c) })();
const poolTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,240,214,.95)'); gr.addColorStop(.22, 'rgba(255,222,176,.5)'); gr.addColorStop(.55, 'rgba(255,206,150,.12)'); gr.addColorStop(1, 'rgba(255,206,150,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })();
const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(.5, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c) })();

/* a light hoop: thin bright core + soft glow band + one tick per frame inside it */
const HOOP_V = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
function hoop(Rr, ticks, warm, strength) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.TorusGeometry(Rr, Rr * .012, 8, 180), new THREE.MeshBasicMaterial({ color: warm ? 0xffe6c6 : 0xcfdde6, transparent: true, opacity: .9 * strength, fog: true }));
  g.add(core);
  const U = { uA: { value: .5 * strength }, uC: { value: new THREE.Color(warm ? 0xffc98a : 0x9fc4d6) } };
  const band = new THREE.Mesh(new THREE.RingGeometry(Rr * .86, Rr * 1.14, 160, 1), new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float uA;uniform vec3 uC;varying vec3 vP;void main(){float r=length(vP.xy);float d=(r-${Rr.toFixed(4)})/${(Rr * .07).toFixed(4)};gl_FragColor=vec4(uC*uA*exp(-d*d),1.);}` }));
  band.renderOrder = 3; g.add(band);
  let tk = null;
  if (ticks > 0) { const pts = []; for (let i = 0; i < ticks; i++) { const a = Math.PI / 2 - i / ticks * Math.PI * 2, r0 = Rr * 1.035, r1 = Rr * 1.09; pts.push(V(Math.cos(a) * r0, Math.sin(a) * r0, 0), V(Math.cos(a) * r1, Math.sin(a) * r1, 0)) }
    tk = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf6e7d0, transparent: true, opacity: .55 * strength })); g.add(tk) }
  g.userData = { core, band, U, tk, base: strength };
  return g;
}

/* ---------- the world: rings along a slow curve, each room down its own axis ---------- */
const SX = 9.5, SZ = 8.5, HR = 2.3, FLOOR = -1.25; /* ring spacing, hoop radius, photo height */
const ringC = i => V(i * SX, Math.sin(i * .9) * .55, -i * SZ - Math.sin(i * 1.3) * 1.2);
const LOADER = new THREE.TextureLoader();
const pickables = []; /* meshes a tap can hit */
const W_ = { rings: [] };
function photoPlane(fr) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x15171c, transparent: true, opacity: 0, side: THREE.DoubleSide, alphaMap: fr.cut ? null : softMask, depthWrite: !fr.cut, fog: true });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.userData = { fr, ar: fr.w / fr.h, w: 1, h: 1, loaded: 0, want: 0, src: fr.img };
  return m;
}
/* every photo is sized for the screen it is seen on: it fills a fixed share of the view from DC away, so the camera can always
 stand between the frame before and this one (frames are SPC apart), like Spirit Eye placing its drawings relative to each stop */
const DC = 3.15, SPC = 3.9;
function layoutPlanes() {
  const vh = 2 * DC * tanH, vw = vh * aspect, bw = vw * (aspect < 1 ? .9 : .62), bh = vh * (aspect < 1 ? .62 : .7), sx = Math.max(.45, Math.min(1.15, aspect));
  W_.rings.forEach((rm, i) => rm.layers.forEach((L, li) => L.frames.forEach((f, k) => { const m = f.m, u = m.userData;
    let h = bh, w = h * u.ar; if (w > bw) { w = bw; h = w / u.ar }
    if (u.fr.cut) { h *= 1.05; w = h * u.ar }
    u.w = w; u.h = h; m.scale.set(w, h, 1); f.x = f.bx * sx;
    if (i === J && li === 0 && k === 0) { m.scale.multiplyScalar(.8); u.h = h * .8; m.position.set(f.bx - (aspect < 1 ? 1.15 : 2.3), FLOOR + u.h / 2 + .02, f.z - 2.2); return }
    m.position.set(f.x, u.fr.cut ? FLOOR + h / 2 + .02 : f.y, f.z); f.cy = m.position.y;
    if (f.pool) f.pool.position.x = f.x; if (f.sh) f.sh.position.x = f.x })));
}
function loadPlane(m, hi) {
  const u = m.userData, lv = hi ? 2 : 1; if (u.loaded >= lv || u.want >= lv) return; u.want = lv;
  LOADER.load(hi ? M(u.src) : MT(u.src), t => { if (u.loaded > lv) return; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; const mt = m.material; if (mt.map && mt.map !== t) mt.map.dispose(); mt.map = t; mt.color.set(0xffffff); mt.needsUpdate = true; u.loaded = lv; dirty = true });
}
RINGS.forEach((rg, i) => {
  const C = ringC(i), grp = new THREE.Group(); grp.position.copy(C); scene.add(grp);
  const nFrames = rg.layers.reduce((a, L) => a + L.frames.length, 0);
  const outer = hoop(HR, nFrames, true, 1); grp.add(outer);
  /* a tap target filling the hoop */
  const disc = new THREE.Mesh(new THREE.CircleGeometry(HR, 48), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  disc.userData = { kind: 'ring', r: i }; grp.add(disc); pickables.push(disc);
  /* the room: floor ripples + motes, then each layer down -z */
  const floorY = FLOOR;
  for (let k = 1; k <= 5; k++) { const pts = []; const rr = k * 1.7; for (let j = 0; j <= 96; j++) { const a = j / 96 * 6.283; pts.push(V(Math.cos(a) * rr, floorY, -7 + Math.sin(a) * rr)) }
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8fb0bf, transparent: true, opacity: .1 * (1 - k / 6), depthWrite: false }))) }
  const layers = []; let z = 0, seed = 7 + i * 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  rg.layers.forEach((L, li) => {
    const lay = { name: L.name, hoopZ: z, frames: [] };
    if (li > 0) { const h = hoop(HR * .78, L.frames.length, li % 2 === 0, .85); h.position.z = z; grp.add(h); lay.hoop = h }
    else lay.hoop = outer;
    L.frames.forEach((fr, k) => {
      const fz = z - 6.5 - k * SPC, fx = k === 0 ? 0 : (k % 2 ? 1 : -1) * (.7 + rnd() * .3), fy = .1 + (rnd() - .5) * .2;
      const m = photoPlane(fr); m.position.set(fx, fy, fz); m.userData.kind = 'frame'; m.userData.r = i; m.userData.L = li; m.userData.k = k; grp.add(m); pickables.push(m);
      const at = { m, x: fx, bx: fx, y: fy, z: fz };
      /* a warm pool under each piece, a contact shadow under cut-outs */
      const pool = new THREE.Mesh(new THREE.CircleGeometry(fr.cut ? 2.6 : 1.9, 48), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: fr.cut ? .55 : .22, fog: true }));
      pool.rotation.x = -Math.PI / 2; pool.position.set(fx, floorY + .005, fz + .2); grp.add(pool); at.pool = pool;
      if (fr.cut) { const sh = new THREE.Mesh(new THREE.CircleGeometry(.9, 32), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.scale.set(1.4, .5, 1); sh.position.set(fx, floorY + .01, fz); grp.add(sh); at.sh = sh }
      lay.frames.push(at);
    });
    z = lay.frames[lay.frames.length - 1].z - 4.2;
    layers.push(lay);
  });
  /* static motes held in the room's air (they never drift) */
  const MN = 160, mp = new Float32Array(MN * 3); for (let j = 0; j < MN; j++) { mp[j * 3] = (rnd() - .5) * 7; mp[j * 3 + 1] = floorY + rnd() * 4.2; mp[j * 3 + 2] = 1 - rnd() * (-z + 2) }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  grp.add(new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xfff1d8, size: .035, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })));
  const back = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffd9a8, transparent: true, opacity: .16, depthWrite: false, blending: THREE.AdditiveBlending })); back.scale.set(9, 9, 1); back.position.set(0, .3, -9); grp.add(back);
  W_.rings.push({ C, grp, layers, outer, end: z });
});
/* faint guide hoops between rings: the way along is also through */
/* one guide hoop between each pair, exactly where the along-glide passes, turned to face the way of travel */
for (let i = 0; i < RINGS.length - 1; i++) { const a = ringC(i), b = ringC(i + 1), h = hoop(.95, 0, false, .3);
  h.position.copy(a).lerp(b, .5).add(V(0, .45, 3.8)); h.lookAt(h.position.clone().add(b.clone().sub(a).normalize())); scene.add(h) }
/* the entrance from the board: hoops leading to the first ring */
const ENT = k => ringC(0).add(V(-.5 * k, .35 * k, 17 + 5 * k));
for (let k = 1; k <= 3; k++) { const h = hoop(HR * (1 + k * .22), 0, k % 2 === 0, .32 - k * .05); h.position.copy(ENT(k)); scene.add(h) }
/* far stars */
(() => { const n = 600, p = new Float32Array(n * 3); let s = 99; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { p[i * 3] = -40 + r() * 120; p[i * 3 + 1] = -20 + r() * 50; p[i * 3 + 2] = -60 - r() * 60 }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfc8d6, size: .22, transparent: true, opacity: .5, fog: false, depthWrite: false }))) })();

/* ---------- the mesh cup (real 3D, from photographs) in the joio cup's first room ---------- */
let cup = null, cupSpin = 0, cupVel = 0;
const J = RINGS.findIndex(r => r.mesh);
if (J >= 0) loadGLB(THREE, 'media/' + RINGS[J].mesh).then(({ geometry, map }) => {
  const mat = new THREE.MeshStandardMaterial({ map, roughness: .88, metalness: 0, side: THREE.DoubleSide });
  const bb = geometry.boundingBox, hgt = bb.max.y - bb.min.y, s = 1.3 / hgt;
  const mesh = new THREE.Mesh(geometry, mat); mesh.scale.setScalar(s); mesh.position.y = -bb.min.y * s;
  cup = new THREE.Group(); cup.add(mesh);
  const room = W_.rings[J], f0 = room.layers[0].frames[0];
  cup.position.set(f0.bx, FLOOR, f0.z); room.grp.add(cup);
  /* the cut-out photograph stays (layoutPlanes): it steps back and aside, the true picture of the cup */
  layoutPlanes(); curP = poseOf(S); if (!tr) { cam.position.copy(curP.p); cam.lookAt(curP.l) }
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 1.7, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  hit.position.y = .85; hit.userData = { kind: 'cup' }; cup.add(hit); pickables.push(hit);
  dirty = true;
}).catch(e => console.warn('cup', e));

/* ---------- poses ---------- */
let aspect = 1;
const fitDist = (w, h, mw = 1.18, mh = 1.42) => Math.max(h * mh / (2 * tanH), w * mw / (2 * tanH * aspect));
function ringPose(i) { const C = W_.rings[i].C, d = fitDist(HR * 2, HR * 2, 1.22, 1.3) + .4; return { p: C.clone().add(V(0, .25, d)), l: C.clone().add(V(0, -.15, -8)) } }
function framePose(i, L, k) {
  const rm = W_.rings[i], f = rm.layers[L].frames[k], C = rm.C, u = f.m.userData;
  if (i === J && L === 0 && k === 0 && cup) { const n = aspect < 1, d = Math.min(5.4, fitDist(n ? 1.9 : 5.4, 2.3)); return { p: C.clone().add(V(f.bx - (n ? .25 : .9), FLOOR + 1.25, f.z + d)), l: C.clone().add(V(f.bx - (n ? .3 : 1), FLOOR + .55, f.z - 3)) } }
  const y = f.cy != null ? f.cy : f.y;
  return { p: C.clone().add(V(f.x, y + .05, f.z + DC)), l: C.clone().add(V(f.x, y, f.z - 4)) };
}
function boardPose() { const C = ringC(0); return { p: C.clone().add(V(-2, 1.6, 36)), l: C.clone().add(V(1, -.5, -6)) } }

/* ---------- state + travel ---------- */
let S = { lv: 'board', r: 0, L: 0, k: 0 }, fromCard = null;
const memK = RINGS.map(rg => rg.layers.map(() => 0));
let tr = null, dirty = true, curP = boardPose();
cam.position.copy(curP.p); cam.lookAt(curP.l);
const tmpP = V(0, 0, 0), tmpL = V(0, 0, 0);
function poseOf(s) { return s.lv === 'board' ? boardPose() : s.lv === 'ring' ? ringPose(s.r) : framePose(s.r, s.L, s.k) }
function hoopPoint(i, L, ahead) { const rm = W_.rings[i]; return rm.C.clone().add(V(0, 0, rm.layers[L].hoopZ + ahead)) }
/* builds the camera path between two states, always passing through the hoops in between */
function pathBetween(a, b) {
  const A = poseOf(a), B = poseOf(b), P = [A.p.clone()], Lk = [A.l.clone()];
  const add = (p, l) => { P.push(p); Lk.push(l) };
  const fwd = (p, n) => p.clone().add(V(0, 0, -n));
  if (a.lv === 'board' && b.lv === 'ring') { const C = ringC(b.r); for (let k = 3; k >= 1; k--) add(ENT(k), ringC(0).add(V(0, 0, -8)).lerp(C.clone().add(V(0, 0, -8)), (3 - k) / 3)) }
  else if (a.lv === 'ring' && b.lv === 'board') { const C = ringC(a.r); for (let k = 1; k <= 3; k++) add(ENT(k), ringC(0).add(V(0, 0, -8)).lerp(C.clone().add(V(0, 0, -8)), (3 - k) / 3)) }
  else if (a.lv === 'ring' && b.lv === 'ring') { const ca = ringC(a.r), cb = ringC(b.r), mid = ca.clone().lerp(cb, .5).add(V(0, .45, 3.2 + .6 * Math.abs(b.r - a.r))); add(mid, ca.clone().lerp(cb, .7).add(V(0, 0, -6))) }
  else if (a.lv === 'ring' && b.lv === 'room') { const h = hoopPoint(a.r, 0, 0); add(h.clone().add(V(0, .12, 1.2)), fwd(h, 8)); add(h.clone().add(V(0, .08, -1.4)), fwd(h, 9)) }
  else if (a.lv === 'room' && b.lv === 'ring') { const h = hoopPoint(a.r, 0, 0); add(h.clone().add(V(0, .08, -1.4)), fwd(h, 9)); add(h.clone().add(V(0, .12, 1.2)), fwd(h, 8)) }
  else if (a.lv === 'room' && b.lv === 'room' && a.r === b.r) {
    const over = (L) => { if (a.r === J && L === 0 && cup) { const f0 = W_.rings[J].layers[0].frames[0]; return W_.rings[J].C.clone().add(V(f0.bx, FLOOR + 2.3, f0.z)) } return null };
    if (b.L > a.L && over(a.L)) add(over(a.L), hoopPoint(a.r, a.L + 1, -6));
    if (b.L > a.L) for (let L = a.L + 1; L <= b.L; L++) { const h = hoopPoint(a.r, L, 0); add(h.clone().add(V(0, .1, 1)), fwd(h, 8)); add(h.clone().add(V(0, .06, -1)), fwd(h, 9)) }
    else if (b.L < a.L) { for (let L = a.L; L > b.L; L--) { const h = hoopPoint(a.r, L, 0); add(h.clone().add(V(0, .06, -1)), fwd(h, 9)); add(h.clone().add(V(0, .1, 1)), fwd(h, 8)) } if (over(b.L)) add(over(b.L), hoopPoint(a.r, b.L + 1, -6)) }
    else { const m = A.p.clone().lerp(B.p, .5).add(V(0, .1, .9)); add(m, A.l.clone().lerp(B.l, .5)) }
  }
  else if (a.lv === 'room' && b.lv === 'room') { /* next piece: back out through this ring, along, in through the next */
    const ha = hoopPoint(a.r, 0, 0), hb = hoopPoint(b.r, 0, 0), ca = ringC(a.r), cb = ringC(b.r);
    add(ha.clone().add(V(0, .1, -1.2)), fwd(ha, 9)); add(ha.clone().add(V(0, .2, 1.6)), fwd(ha, 7));
    add(ca.clone().lerp(cb, .5).add(V(0, .45, 4.2)), ca.clone().lerp(cb, .75).add(V(0, 0, -6)));
    add(hb.clone().add(V(0, .2, 1.6)), fwd(hb, 7)); add(hb.clone().add(V(0, .1, -1.2)), fwd(hb, 9));
  }
  P.push(B.p.clone()); Lk.push(B.l.clone());
  let len = 0; for (let i = 1; i < P.length; i++) len += P[i].distanceTo(P[i - 1]);
  return { P, Lk, T: Math.min(2600, Math.max(900, 700 + len * 70)) };
}
function travel(a, b) { const pth = pathBetween(a, b); tr = { ...pth, t0: performance.now() }; capFade(); dirty = true }

/* ---------- UI ---------- */
const cap = $('cap'), capT = cap.querySelector('.t'), capS = cap.querySelector('.s'), capN = cap.querySelector('.n');
let capTimer = 0;
function capFade() { cap.classList.add('fade'); clearTimeout(capTimer) }
function capShow() {
  const rg = RINGS[S.r];
  if (S.lv === 'ring') { capT.textContent = rg.title; capS.textContent = 'ring ' + (S.r + 1) + ' of ' + RINGS.length; capN.textContent = rg.layers.map(L => L.name).join('  ·  ') }
  else if (S.lv === 'room') { const L = rg.layers[S.L], fr = L.frames[S.k]; capT.textContent = rg.title; capS.textContent = L.name + (L.frames.length > 1 ? '  ·  ' + (S.k + 1) + ' / ' + L.frames.length : '');
    capN.textContent = (S.r === J && S.L === 0 && S.k === 0 && cup) ? '3D from photographs · the back and the underside were not photographed' : '' }
  capTimer = setTimeout(() => cap.classList.remove('fade'), 60);
  const bd = S.lv === 'board'; document.body.classList.toggle('at-board', bd);
  $('prev').disabled = !canAlong(-1); $('next').disabled = !canAlong(1); $('inb').disabled = !canDeeper();
  $('inb').textContent = S.lv === 'ring' ? 'through ›' : 'deeper ›';
}
let hintT = 0; function hint(t, ms) { const h = $('hint'); h.textContent = t; h.classList.remove('gone'); clearTimeout(hintT); hintT = setTimeout(() => h.classList.add('gone'), ms || 3200) }

/* ---------- moves: deeper / rise / along (one per gesture) ---------- */
function nextOf(s, d) {
  if (s.lv === 'ring') { const r = s.r + d; return r >= 0 && r < RINGS.length ? { lv: 'ring', r, L: 0, k: 0 } : null }
  if (s.lv === 'room') { const L = RINGS[s.r].layers[s.L], k = s.k + d;
    if (k >= 0 && k < L.frames.length) return { lv: 'room', r: s.r, L: s.L, k };
    if (s.L === 0) { const r = s.r + d; if (r >= 0 && r < RINGS.length) return { lv: 'room', r, L: 0, k: d > 0 ? 0 : RINGS[r].layers[0].frames.length - 1 } } }
  return null;
}
const canAlong = d => !!nextOf(S, d);
function canDeeper() { if (S.lv === 'board' || S.lv === 'ring') return true; if (S.lv === 'room') return S.L < RINGS[S.r].layers.length - 1; return false }
function setState(n, how) { const o = S; S = n; if (n.lv === 'room') memK[n.r][n.L] = n.k; if (how !== 'none') travel(o, n); writeHash(how === 'push'); ensureTex(); capShow() }
function deeper() {
  if (tr) return;
  if (S.lv === 'board') return enterRing(fromCard && fromCard.r != null ? fromCard.r : 0);
  if (S.lv === 'ring') { push(); return setState({ lv: 'room', r: S.r, L: 0, k: memK[S.r][0] }, 'push') }
  if (S.lv === 'room') { if (!canDeeper()) { hint('this is the deepest layer'); return } push(); return setState({ lv: 'room', r: S.r, L: S.L + 1, k: memK[S.r][S.L + 1] }, 'push') }
}
function along(d) { if (tr || detOpen) return; const n = nextOf(S, d); if (!n) { hint(d > 0 ? 'the last one' : 'the first one', 1600); return } setState(n, 'replace') }
/* history: every deeper place is an entry, so phone back = rise */
const stack = [];
function push() { stack.push({ ...S }) }
let detOpen = false;
function rise() { if (tr) return; if (detOpen) { closeDetail(); return } if (!stack.length) { if (S.lv !== 'board') { stack.length = 0; riseTo(S.lv === 'ring' ? { lv: 'board', r: S.r, L: 0, k: 0 } : S.lv === 'room' && S.L > 0 ? { ...S, L: S.L - 1, k: memK[S.r][S.L - 1] } : { lv: 'ring', r: S.r, L: 0, k: 0 }) } else if (FROM_M4) leave(M4); return } history.back() }
function riseTo(n) { setState(n, 'replace') }
addEventListener('popstate', e => {
  if (detOpen) { closeDetail(true); return }
  const d = e.state && e.state.d != null ? e.state.d : 0; let n = null;
  while (stack.length > d) n = stack.pop();
  if (!n) return; tr = null;
  if (n.lv === 'room') n.k = memK[n.r][n.L];
  if (n.lv === 'board' && FROM_M4 && stack.length === 0) { leave(M4); return } /* came in from the board: back out to it */
  if (n.lv === 'board') { setState(n, 'pop'); setTimeout(() => showBoard(true), 650); return }
  setState(n, 'pop');
});
function writeHash(pushIt) {
  const h = S.lv === 'board' ? '#board' : S.lv === 'ring' ? '#ring/' + RINGS[S.r].id : '#ring/' + RINGS[S.r].id + '/' + S.L + '/' + S.k;
  if (pushIt) history.pushState({ d: stack.length }, '', h); else history.replaceState({ d: stack.length }, '', h);
}
/* ---------- board ---------- */
const boardEl = $('board');
function showBoard(on) { boardEl.classList.toggle('on', on); boardEl.setAttribute('aria-hidden', String(!on)) }
function enterRing(r, cardSel) {
  if (tr) return; fromCard = cardSel || { r, el: null }; push();
  showBoard(false); setState({ lv: 'ring', r, L: 0, k: 0 }, 'push');
  if (!sessionStorage.getItem('objc-h')) { sessionStorage.setItem('objc-h', 1); setTimeout(() => hint('swipe along the rings · pinch in or tap to go through', 4200), 1500) }
}
function toBoard() { /* Home: rise all the way, through every ring on the way out */
  if (S.lv === 'board' || tr) return; const n = stack.length; if (n > 0) history.go(-n) }
(function buildBoard() {
  const total = RINGS.reduce((a, r) => a + r.layers.reduce((b, L) => b + L.frames.length, 0), 0);
  $('bcount').textContent = BOARD.length + ' pieces · ' + RINGS.length + ' rings · ' + total + ' frames';
  const rr = $('rings');
  RINGS.forEach((rg, i) => { const n = rg.layers.reduce((b, L) => b + L.frames.length, 0), hero = rg.layers[0].frames[0];
    const b = document.createElement('button'); b.className = 'rg'; b.type = 'button'; b.dataset.r = i;
    b.innerHTML = '<div class="hoop"><img alt="" loading="lazy" src="' + MT(hero.img) + '"></div><div class="rt"></div><div class="rn"></div>';
    b.querySelector('.rt').textContent = rg.title; b.querySelector('.rn').textContent = n + (rg.mesh ? ' frames + 3D' : ' frames');
    b.setAttribute('aria-label', rg.title + ', ring ' + (i + 1)); b.onclick = () => { mark(b); enterRing(i, { r: i, el: b }) }; rr.appendChild(b) });
  const cg = $('cards');
  BOARD.forEach(c => { const r = RINGS.findIndex(rg => rg.board.includes(c.id));
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cd';
    b.innerHTML = '<div class="im"><img alt="" loading="lazy" src="' + MT(c.img) + '">' + (r >= 0 ? '<span class="ring" title="leads into a ring"></span>' : '') + '</div><div class="ct"></div><div class="cm"></div>';
    b.querySelector('.ct').textContent = c.title; b.querySelector('.cm').textContent = c.meta;
    b.onclick = () => { mark(b); if (r >= 0) enterRing(r, { r, el: b }); else openDetail({ img: c.img, t: c.title, s: c.meta, c: '' }) };
    cg.appendChild(b) });
  function mark(b) { boardEl.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel') }
  /* pinch in on the board goes through the first ring (or the one last left) */
  let pts = new Map(), d0 = 0, done = false;
  boardEl.addEventListener('touchstart', e => { if (e.touches.length === 2) { d0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); done = false } }, { passive: true });
  boardEl.addEventListener('touchmove', e => { if (e.touches.length === 2 && d0 && !done) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (d / d0 > 1.3) { done = true; deeper() } } }, { passive: true });
  boardEl.addEventListener('wheel', e => { if (e.ctrlKey && e.deltaY < -2) { e.preventDefault(); deeper() } }, { passive: false });
})();
/* ---------- detail page (tap the frame in front) ---------- */
const det = $('detail');
function openDetail(o, fromRoom) {
  det.querySelector('.dt').textContent = o.t; det.querySelector('.ds').textContent = o.s; det.querySelector('.dc').textContent = o.c || '';
  $('dimg').src = M(o.img); $('dimg').alt = o.c || o.t; det.hidden = false; void det.offsetWidth; det.classList.add('on');
  detOpen = true; history.pushState({ d: stack.length, det: 1 }, '', location.hash + '/d'); document.body.classList.add('at-detail');
}
function closeDetail(popped) { if (!detOpen) return; detOpen = false; det.classList.remove('on'); setTimeout(() => { det.hidden = true; $('dimg').removeAttribute('src') }, 700); document.body.classList.remove('at-detail'); if (!popped) history.back() }
det.addEventListener('click', () => closeDetail());
function openFrame(r, L, k) { const rg = RINGS[r], Ly = rg.layers[L], fr = Ly.frames[k];
  openDetail({ img: fr.img, t: rg.title, s: Ly.name + (Ly.frames.length > 1 ? '  ·  ' + (k + 1) + ' / ' + Ly.frames.length : '') + (fr.angle ? '  ·  ' + fr.angle : ''), c: fr.cap }, true) }

/* ---------- textures: near rooms get their pictures ---------- */
function ensureTex() {
  W_.rings.forEach((rm, i) => { const near = Math.abs(i - S.r) <= 1, inside = S.lv === 'room' && i === S.r;
    rm.layers.forEach((L, li) => L.frames.forEach((f, k) => { if (near && (li === 0 || inside || k < 2)) loadPlane(f.m, inside && Math.abs(li - S.L) <= 1) })) });
}

/* ---------- input ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function hitAt(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam); const h = ray.intersectObjects(pickables, false); return h.length ? h[0].object : null }
const ptr = new Map(); let g0 = null, pinch = null, spinning = false;
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptr.size === 1) { const h = hitAt(e.clientX, e.clientY); spinning = !!(h && h.userData.kind === 'cup' && S.lv === 'room'); g0 = { x: e.clientX, y: e.clientY, t: performance.now(), lx: e.clientX, h }; canvas.classList.add('grab') }
  if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), done: false }; g0 = null; spinning = false } });
canvas.addEventListener('pointermove', e => { if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptr.size === 2 && !pinch.done) { const [a, b] = [...ptr.values()], r = Math.hypot(a.x - b.x, a.y - b.y) / pinch.d; if (r > 1.28) { pinch.done = true; deeper() } else if (r < .78) { pinch.done = true; rise() } }
  if (spinning && g0) { const dx = e.clientX - g0.lx; g0.lx = e.clientX; cupSpin += dx * .011; cupVel = dx * .011; dirty = true } });
function up(e) { if (!ptr.has(e.pointerId)) return; ptr.delete(e.pointerId); canvas.classList.remove('grab');
  if (ptr.size === 0) { if (g0 && !pinch) { const dx = e.clientX - g0.x, dy = e.clientY - g0.y, dt = performance.now() - g0.t;
      if (spinning) { /* the cup keeps a little of the turn, then settles: eased, never on its own */ }
      else if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) along(dx < 0 ? 1 : -1);
      else if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.2) { if (dy < 0) deeper(); else rise() }
      else if (Math.hypot(dx, dy) < 10 && dt < 450) tap(g0.h) }
    g0 = null; pinch = null; spinning = false } }
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
function tap(h) {
  if (tr || !h) return; const u = h.userData;
  if (u.kind === 'ring') { if (S.lv === 'ring' && u.r === S.r) deeper(); else if (S.lv === 'ring') setState({ lv: 'ring', r: u.r, L: 0, k: 0 }, 'replace') }
  else if (u.kind === 'frame' && S.lv === 'room' && u.r === S.r) { if (u.L === S.L && u.k === S.k) openFrame(u.r, u.L, u.k); else if (u.L === S.L) setState({ ...S, k: u.k }, 'replace'); else if (u.L === S.L + 1) deeper() }
  else if (u.kind === 'frame' && S.lv === 'ring' && u.r === S.r) deeper();
}
let wAcc = 0, wLock = 0;
addEventListener('wheel', e => { if (S.lv === 'board' && !e.ctrlKey) return; if (e.target.closest && e.target.closest('#board')) return; e.preventDefault();
  const now = performance.now(); if (now < wLock) return; wAcc += e.deltaY * (e.ctrlKey ? 4 : 1);
  if (Math.abs(e.deltaX) > 40 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) { wLock = now + 900; wAcc = 0; along(e.deltaX > 0 ? 1 : -1); return }
  if (wAcc < -60) { wLock = now + 900; wAcc = 0; deeper() } else if (wAcc > 60) { wLock = now + 900; wAcc = 0; rise() } }, { passive: false });
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') along(1); else if (e.key === 'ArrowLeft') along(-1);
  else if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === '+' || e.key === '=') { if (S.lv === 'room' && document.activeElement === document.body && e.key === 'Enter' && !canDeeper()) openFrame(S.r, S.L, S.k); else deeper() }
  else if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === '-' || e.key === 'Backspace') rise();
  else if (e.key === 'Home') toBoard();
});
$('back').onclick = () => rise(); $('home').onclick = () => toBoard(); $('prev').onclick = () => along(-1); $('next').onclick = () => along(1); $('inb').onclick = () => deeper();
function leave(href) { $('veil').classList.remove('off'); setTimeout(() => { location.href = href }, 900) }
$('m4').onclick = e => { e.preventDefault(); leave(M4) };
if (FROM_M4) $('m4').textContent = '‹ board';
addEventListener('pageshow', () => $('veil').classList.add('off'));

/* ---------- frame loop: render only while something moves ---------- */
function resize() { const w = innerWidth, h = innerHeight; aspect = w / h; R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setSize(w, h, false); cam.aspect = aspect; cam.updateProjectionMatrix(); layoutPlanes();
  if (!tr) { curP = poseOf(S); cam.position.copy(curP.p); cam.lookAt(curP.l) } dirty = true }
addEventListener('resize', resize);
const lookNow = V(0, 0, 0);
function frame(now) {
  requestAnimationFrame(frame);
  if (tr) { let u = (now - tr.t0) / tr.T; if (u >= 1) u = 1; const e = tr.P.length > 3 ? EASE_IO(u) : EASE(u); crPoint(tr.P, e, tmpP); crPoint(tr.Lk, e, tmpL); cam.position.copy(tmpP); cam.lookAt(tmpL); lookNow.copy(tmpL);
    if (u >= 1) { tr = null; curP = poseOf(S); capShow() } dirty = true }
  if (cup && Math.abs(cupVel) > 1e-4 && !spinning) { cupVel *= .9; cupSpin += cupVel; dirty = true }
  if (cup) cup.rotation.y = cupSpin - .5;
  if (!dirty) return; dirty = false;
  /* hoops nearer the camera glow a little more; the current layer's hoop is brightest */
  W_.rings.forEach((rm, i) => rm.layers.forEach((L, li) => { const hp = L.hoop, d = cam.position.distanceTo(rm.C.clone().add(V(0, 0, L.hoopZ))), on = i === S.r && (S.lv === 'ring' ? li === 0 : S.lv === 'room' ? li === S.L + 1 || li === S.L : false);
    hp.userData.U.uA.value = hp.userData.base * (on ? .9 : .45) * Math.max(.15, 1 - d / 46);
    L.frames.forEach(f => { const m = f.m, dd = cam.position.distanceTo(m.getWorldPosition(tmpP)); m.material.opacity = m.material.map ? Math.max(0, Math.min(1, (40 - dd) / 14, (dd - .7) / 1.5)) : 0 }) }));
  R.render(scene, cam);
}
/* ---------- start: deep link (#ring/<id>[/L/k]) or the board ---------- */
resize();
(function start() {
  /* entries: #ring/<id>[/L/k] (this page), #<ring id> or ?from=<board slug | board> (the shared m4 wiring) */
  let m = location.hash.match(/^#ring\/([\w-]+)(?:\/(\d+)\/(\d+))?/);
  const bare = location.hash.match(/^#([\w-]+)$/);
  if (!m && bare && RINGS.some(x => x.id === bare[1])) m = [0, bare[1]];
  if (!m && FROM && FROM !== 'board') { const c = BOARD.find(b => b.slug === FROM), rg = c && RINGS.find(x => x.board.includes(c.id)); if (rg) m = [0, rg.id] }
  if (!m && FROM === 'board') m = [0, RINGS[0].id];
  history.replaceState({ d: 0 }, '', '#board');
  if (m) { const r = Math.max(0, RINGS.findIndex(x => x.id === m[1])); showBoard(false); stack.push({ lv: 'board', r, L: 0, k: 0 }); history.pushState({ d: 1 }, '', '#ring/' + RINGS[r].id);
    S = { lv: 'ring', r, L: 0, k: 0 };
    if (m[2] != null) { const L = Math.min(+m[2], RINGS[r].layers.length - 1), k = Math.min(+m[3], RINGS[r].layers[L].frames.length - 1); for (let l = 0; l <= L; l++) { stack.push({ ...S }); S = { lv: 'room', r, L: l, k: l === L ? k : 0 }; memK[r][l] = S.k; writeHash(true) } }
    curP = poseOf(S); cam.position.copy(curP.p); cam.lookAt(curP.l); fromCard = { r } }
  else { showBoard(true) }
  ensureTex(); capShow(); requestAnimationFrame(frame); requestAnimationFrame(() => $('veil').classList.add('off'));
})();
window.__objc = { get S() { return S }, get moving() { return !!tr }, deeper, rise, along, enterRing, toBoard };
