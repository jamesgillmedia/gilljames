/* objects-3d · version C rings, an object to orbit, and a planet to be inside.
   rings -> object orbit -> planet.  The way in is C's rings (tonight/objects, window.OBJ_C): glide ring to ring, go through a hoop into a piece's room,
   deeper layers are smaller hoops further down the same axis. Inside an object's room the camera spins and orbits around that object (wide yaw, generous pitch,
   slow inertia that settles). Pinch out from the object enters the planet: a vast spherical world you are inside, where drag turns the whole world around you
   and the object (wide yaw, no hard clamp, curved horizon). Pinch in returns to the object; Back / Esc rise one step (planet -> object -> its ring).
   Pinch out from the ring view, or once more from the planet, reaches the constellation.
   The camera is the site's: critically damped springs (sstep, W_REL 9.5 / W_FLY 5.6 / W_GLIDE 4.6 / W_SOFT 3.2), FOV 60, fable-m4's 960 ms push,
   the moon opener's exponential lag.
   Reduce Motion: no idle drift, no inertia, no push, stiffer springs. Photographs are never tinted (red images are an explicit sub-toggle). */
import * as THREE from '../vendor/three.module.min.js';
import { loadGLB } from './glb.js';

const D = window.OBJ_C, RINGS = D.rings;
const $ = s => document.querySelector(s);
const html = document.documentElement;
const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
const WTS = () => RMQ.matches ? { REL: 14, FLY: 9, GLIDE: 8, SOFT: 6 } : { REL: 9.5, FLY: 5.6, GLIDE: 4.6, SOFT: 3.2 };
const mkS = (x, w) => ({ x, t: x, v: 0, w });
function sstep(q, dt) { const w = q.w, e = q.x - q.t, k = Math.exp(-w * dt), c = q.v + w * e; q.x = q.t + (e + c * dt) * k; q.v = (q.v - w * c * dt) * k }
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut3 = u => 1 - Math.pow(1 - u, 3);
const lag = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-dt * rate));
function bump(e) { const f = e < .38 ? 1 + .1 * (1 - Math.pow(1 - e / .38, 2)) : 1.1 - .1 * easeOut3((e - .38) / .62); return 1 + (f - 1) * .5 }   // fable-m4 depth.js push, scaled to a breath
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------- renderer, scene ---------- */
const ROOM = 0x050507;
const canvas = $('#c');
const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
R.setClearColor(ROOM, 1); R.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(ROOM, .045);
const FOV = 60, tanH = Math.tan(FOV * Math.PI / 360);
const cam = new THREE.PerspectiveCamera(FOV, 1, .05, 220); scene.add(cam);
const hemi = new THREE.HemisphereLight(0xffffff, 0x0b0d12, .7), key = new THREE.DirectionalLight(0xffffff, 1.3), fill = new THREE.DirectionalLight(0xbfd0e0, .3);
key.position.set(-3, 6, 5); fill.position.set(4, 1, -2); scene.add(hemi, key, fill, key.target);

const mkTex = (n, draw) => { const c = document.createElement('canvas'); c.width = c.height = n; draw(c.getContext('2d'), n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t };
const glowTex = mkTex(128, (x, n) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n) });
const softMask = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256); x.filter = 'blur(7px)'; x.fillStyle = '#fff'; x.fillRect(10, 10, 236, 236); return new THREE.CanvasTexture(c) })();
const poolTex = mkTex(256, (x, n) => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.22, 'rgba(255,255,255,.5)'); g.addColorStop(.55, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n) });
const shadowTex = mkTex(128, (x, n) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(.5, 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n) });

/* theme: night = cool light, red = deep darkroom red. Photographs (MeshBasic with their own map) are never touched. */
const NIGHT = { hoop: 0xe8e4dc, pool: 0xffd8a8, glow: 0xffd9a8, mote: 0xfff1d8, ripple: 0x8fb0bf, star: 0xbfc8d6 };
const REDC = { hoop: 0xcc4452, pool: 0xd23a4a, glow: 0xb02c3a, mote: 0xc2404c, ripple: 0x9a2a36, star: 0xb23644 };
const themed = [];   // { set(pal) }
const theme = () => (html.classList.contains('rm') ? REDC : NIGHT);

/* ---------- hoops ---------- */
function hoop(Rr, ticks, strength) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.TorusGeometry(Rr, Rr * .006, 8, 180), new THREE.MeshBasicMaterial({ color: NIGHT.hoop, transparent: true, opacity: .32 * strength, fog: true }));
  g.add(core);
  const U = { uA: { value: .12 * strength }, uC: { value: new THREE.Color(NIGHT.hoop) } };
  const band = new THREE.Mesh(new THREE.RingGeometry(Rr * .94, Rr * 1.06, 160, 1), new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float uA;uniform vec3 uC;varying vec3 vP;void main(){float r=length(vP.xy);float d=(r-${Rr.toFixed(4)})/${(Rr * .07).toFixed(4)};gl_FragColor=vec4(uC*uA*exp(-d*d),1.);}` }));
  band.renderOrder = 3; g.add(band);
  let tk = null;
  if (ticks > 0) { const pts = []; for (let i = 0; i < ticks; i++) { const a = Math.PI / 2 - i / ticks * Math.PI * 2, r0 = Rr * 1.035, r1 = Rr * 1.09; pts.push(V(Math.cos(a) * r0, Math.sin(a) * r0, 0), V(Math.cos(a) * r1, Math.sin(a) * r1, 0)) }
    tk = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: NIGHT.hoop, transparent: true, opacity: .2 * strength })); g.add(tk) }
  const b0 = { c: core.material.opacity, u: U.uA.value, t: tk ? tk.material.opacity : 0 };
  g.userData.set = a => { core.material.opacity = b0.c * a; U.uA.value = b0.u * a; if (tk) tk.material.opacity = b0.t * a; g.visible = a > .003 };
  themed.push({ set: p => { core.material.color.setHex(p.hoop); U.uC.value.setHex(p.hoop); if (tk) tk.material.color.setHex(p.hoop) } });
  return g;
}

/* ---------- the world: rings along a slow curve, each room down its own axis ---------- */
const SX = 9.5, SZ = 8.5, HR = 2.3, FLOOR = -1.25, DC = 2.7, SPC = 3.9;
const ringC = i => V(i * SX, Math.sin(i * .9) * .55, -i * SZ - Math.sin(i * 1.3) * 1.2);
const LOADER = new THREE.TextureLoader();
const M = p => 'media/' + p + '.webp', MT = p => 'media/' + p + '-480.webp';
let aspect = 1, dirty = true;
const W_ = { rings: [] };
const J = RINGS.findIndex(r => r.mesh);

function photoPlane(fr) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x15171c, transparent: true, opacity: 0, side: THREE.DoubleSide, alphaMap: fr.cut ? null : softMask, depthWrite: !fr.cut, fog: true });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.userData = { fr, ar: fr.w / fr.h, w: 1, h: 1, loaded: 0, want: 0, src: fr.img };
  return m;
}
function loadPlane(m, hi) {
  const u = m.userData, lv = hi ? 2 : 1; if (u.loaded >= lv || u.want >= lv) return; u.want = lv;
  LOADER.load(hi ? M(u.src) : MT(u.src), t => { if (u.loaded > lv) return; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; const mt = m.material; if (mt.map && mt.map !== t) mt.map.dispose(); mt.map = t; mt.color.set(0xffffff); mt.needsUpdate = true; u.loaded = lv; dirty = true });
}

RINGS.forEach((rg, i) => {
  const C = ringC(i), grp = new THREE.Group(); grp.position.copy(C); scene.add(grp);
  const nFrames = rg.layers.reduce((a, L) => a + L.frames.length, 0);
  const outer = hoop(HR, nFrames, 1); grp.add(outer);
  const fx = [];   // the room's own atmosphere: everything that goes quiet once you are alone with the object
  for (let k = 1; k <= 5; k++) { const pts = [], rr = k * 1.7; for (let j = 0; j <= 96; j++) { const a = j / 96 * 6.283; pts.push(V(Math.cos(a) * rr, FLOOR, -7 + Math.sin(a) * rr)) }
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: NIGHT.ripple, transparent: true, opacity: .1 * (1 - k / 6), depthWrite: false })); grp.add(l);
    fx.push({ m: l.material, b: l.material.opacity }); themed.push({ set: p => l.material.color.setHex(p.ripple) }) }
  const layers = []; let z = 0, seed = 7 + i * 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  rg.layers.forEach((L, li) => {
    const lay = { name: L.name, hoopZ: z, frames: [] };
    if (li > 0) { const h = hoop(HR * .78, L.frames.length, .85); h.position.z = z; grp.add(h); lay.hoop = h } else lay.hoop = outer;
    L.frames.forEach((fr, k) => {
      const fz = z - 6.5 - k * SPC, fx_ = k === 0 ? 0 : (k % 2 ? 1 : -1) * (.7 + rnd() * .3), fy = .1 + (rnd() - .5) * .2;
      const m = photoPlane(fr); m.position.set(fx_, fy, fz); grp.add(m);
      const at = { m, x: fx_, bx: fx_, y: fy, z: fz, a: 0, r: i, L: li, k, fr };
      const pool = new THREE.Mesh(new THREE.CircleGeometry(fr.cut ? 2.6 : 1.9, 48), new THREE.MeshBasicMaterial({ map: poolTex, color: NIGHT.pool, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: true }));
      pool.rotation.x = -Math.PI / 2; pool.position.set(fx_, FLOOR + .005, fz + .2); grp.add(pool); at.pool = pool; at.poolB = fr.cut ? .5 : .2;
      themed.push({ set: p => pool.material.color.setHex(p.pool) });
      if (fr.cut) { const sh = new THREE.Mesh(new THREE.CircleGeometry(.9, 32), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 })); sh.rotation.x = -Math.PI / 2; sh.scale.set(1.4, .5, 1); sh.position.set(fx_, FLOOR + .01, fz); grp.add(sh); at.sh = sh }
      lay.frames.push(at);
    });
    z = lay.frames[lay.frames.length - 1].z - 4.2;
    layers.push(lay);
  });
  const MN = 160, mp = new Float32Array(MN * 3); for (let j = 0; j < MN; j++) { mp[j * 3] = (rnd() - .5) * 7; mp[j * 3 + 1] = FLOOR + rnd() * 4.2; mp[j * 3 + 2] = 1 - rnd() * (-z + 2) }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: NIGHT.mote, size: .035, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })); grp.add(motes);
  fx.push({ m: motes.material, b: .55 }); themed.push({ set: p => motes.material.color.setHex(p.mote) });
  const back = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: NIGHT.glow, transparent: true, opacity: .1, depthWrite: false, blending: THREE.AdditiveBlending })); back.scale.set(9, 9, 1); back.position.set(0, .3, -9); grp.add(back);
  fx.push({ m: back.material, b: .1 }); themed.push({ set: p => back.material.color.setHex(p.glow) });
  W_.rings.push({ C, grp, layers, outer, end: z, fx });
});
/* the way along is also through: one faint guide hoop between each pair, and the entrance hoops */
const globalFx = [];
for (let i = 0; i < RINGS.length - 1; i++) { const a = ringC(i), b = ringC(i + 1), h = hoop(.95, 0, .3); h.position.copy(a).lerp(b, .5).add(V(0, .45, 3.8)); h.lookAt(h.position.clone().add(b.clone().sub(a).normalize())); scene.add(h); globalFx.push(h) }
const stars = (() => { const n = 500, p = new Float32Array(n * 3); let s = 99; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { p[i * 3] = -40 + r() * 120; p[i * 3 + 1] = -20 + r() * 50; p[i * 3 + 2] = -60 - r() * 60 }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: NIGHT.star, size: .22, transparent: true, opacity: .4, fog: false, depthWrite: false })); scene.add(pts); themed.push({ set: q => pts.material.color.setHex(q.star) }); return pts })();

/* ---------- the planet: a vast spherical world around you and the object ---------- */
const PR = 60;
const planetU = { uA: { value: 0 }, uBase: { value: new THREE.Color(0x050507) }, uLine: { value: new THREE.Color(0x6a7a92) }, uHaze: { value: new THREE.Color(0x12151d) } };
const planet = new THREE.Group(); scene.add(planet);
const shell = new THREE.Mesh(new THREE.SphereGeometry(PR, 96, 64), new THREE.ShaderMaterial({ uniforms: planetU, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform float uA;uniform vec3 uBase,uLine,uHaze;varying vec3 vD;
    float gl(float x,float w){float a=abs(fract(x+.5)-.5);return 1.-smoothstep(0.,w,a);}
    void main(){vec3 d=normalize(vD);float lat=asin(clamp(d.y,-1.,1.)),lon=atan(d.z,d.x);
      float f=1./6.2831853;
      float wl=fwidth(lat)*f*1.15+1e-5,wn=fwidth(lon)*f*1.15+1e-5;
      float lt=gl(lat/.2617994,wl*3.8),ln=gl(lon/.2617994,wn*3.8)*(1.-smoothstep(.55,1.45,abs(lat)));
      float hz=exp(-pow(d.y/.012,2.)),band=exp(-pow(d.y/.2,2.));
      float below=smoothstep(.0,-.5,d.y);
      vec3 c=uBase+uHaze*band*.9+uHaze*.45*below*0.;
      c+=uLine*(lt*(.16+.08*band)+ln*.13*band);
      c+=uLine*hz*.8;
      gl_FragColor=vec4(c,uA);}` }));
shell.renderOrder = -20; planet.add(shell);
(() => { const n = 900, p = new Float32Array(n * 3); let s = 4242; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * 6.2832, q = Math.sqrt(1 - u * u), rr = PR * .93; p[i * 3] = Math.cos(a) * q * rr; p[i * 3 + 1] = u * rr; p[i * 3 + 2] = Math.sin(a) * q * rr }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: NIGHT.star, size: .32, transparent: true, opacity: 0, depthWrite: false, fog: false })); pts.renderOrder = -19; planet.add(pts); planet.userData.stars = pts;
  themed.push({ set: q => pts.material.color.setHex(q.star) }) })();
function paintTheme() {
  const red = html.classList.contains('rm'), P = theme();
  themed.forEach(t => t.set(P));
  planetU.uBase.value.setHex(red ? 0x040102 : 0x050507); planetU.uLine.value.setHex(red ? 0xb02a38 : 0x6a7a92); planetU.uHaze.value.setHex(red ? 0x24080e : 0x12151d);
  R.setClearColor(red ? 0x050203 : ROOM, 1); scene.fog.color.setHex(red ? 0x050203 : ROOM);
  dirty = true;
}

/* ---------- the mesh cup (real 3D, from photographs) in the joio cup's first room ---------- */
let cup = null, cupW = 2, cupH = 1.3;
if (J >= 0) loadGLB(THREE, 'media/' + RINGS[J].mesh).then(({ geometry, map }) => {
  const mat = new THREE.MeshStandardMaterial({ map, roughness: .88, metalness: 0, side: THREE.DoubleSide });
  const bb = geometry.boundingBox, hgt = bb.max.y - bb.min.y, s = 1.3 / hgt;
  cupW = (bb.max.x - bb.min.x) * s; cupH = 1.3;
  const mesh = new THREE.Mesh(geometry, mat); mesh.scale.setScalar(s); mesh.position.y = -bb.min.y * s;
  cup = new THREE.Group(); cup.add(mesh);
  const room = W_.rings[J], f0 = room.layers[0].frames[0];
  cup.position.set(f0.bx, FLOOR, f0.z); room.grp.add(cup); cup.visible = false;
  layoutPlanes(); retarget(true); dirty = true;
}).catch(e => console.warn('cup', e));

/* ---------- layout ---------- */
function layoutPlanes() {
  const vh = 2 * DC * tanH, vw = vh * aspect, bw = vw * (aspect < 1 ? .88 : .6), bh = vh * (aspect < 1 ? .6 : .68), sx = Math.max(.45, Math.min(1.15, aspect));
  W_.rings.forEach((rm, i) => rm.layers.forEach((L, li) => L.frames.forEach((f, k) => {
    const m = f.m, u = m.userData; let h = bh, w = h * u.ar; if (w > bw) { w = bw; h = w / u.ar }
    if (u.fr.cut) { h *= 1.05; w = h * u.ar }
    u.w = w; u.h = h; m.scale.set(w, h, 1); f.x = f.bx * sx; f.cy = u.fr.cut ? FLOOR + h / 2 + .02 : f.y;
    if (i === J && li === 0 && k === 0 && cup) { m.scale.multiplyScalar(.8); u.h = h * .8; f.x = f.bx - (aspect < 1 ? 1.15 : 2.3); f.cy = FLOOR + u.h / 2 + .02; m.position.set(f.x, f.cy, f.z - 2.2) }
    else m.position.set(f.x, f.cy, f.z);
    f.pool.position.x = f.x; if (f.sh) f.sh.position.x = f.x;
    f.wp = rm.C.clone().add(V(f.x, f.cy, f.z));
  })));
}

/* ---------- state, poses, travel ---------- */
let S = { lv: 'rings', r: 0, L: 0, k: 0 };
const memK = RINGS.map(rg => rg.layers.map(() => 0));
const fitDist = (w, h, mw = 1.18, mh = 1.42) => Math.max(h * mh / (2 * tanH), w * mw / (2 * tanH * aspect));
function ringPose(i) { const C = W_.rings[i].C, d = fitDist(HR * 2, HR * 2, 1.22, 1.3) + .3; return { p: C.clone().add(V(0, .25, d)), l: C.clone().add(V(0, -.15, -8)) } }
function framePose(i, L, k) {
  const rm = W_.rings[i], f = rm.layers[L].frames[k], C = rm.C;
  if (i === J && L === 0 && k === 0 && cup) { const n = aspect < 1, d = Math.max(3.4, fitDist(Math.max(cupW * 1.35, n ? 2.2 : 3.6), cupH * 2.1, 1.12, 1.3)); return { p: C.clone().add(V(f.bx - (n ? .25 : .9), FLOOR + 1.2, f.z + d)), l: C.clone().add(V(f.bx, FLOOR + .65, f.z)) } }
  return { p: C.clone().add(V(f.x, f.cy + .05, f.z + DC)), l: C.clone().add(V(f.x, f.cy, f.z)) };
}
/* the planet: the same object, the camera drawn back a little into the vast world around it */
function planetPose(i, L, k) { const b = framePose(i, L, k), d = b.p.clone().sub(b.l); return { p: b.l.clone().add(d.multiplyScalar(1.3)), l: b.l } }
const poseOf = s => s.lv === 'rings' ? ringPose(s.r) : s.lv === 'planet' ? planetPose(s.r, s.L, s.k) : framePose(s.r, s.L, s.k);
const CP = [mkS(0, 5.6), mkS(0, 5.6), mkS(0, 5.6)], CL = [mkS(0, 9.5), mkS(0, 9.5), mkS(0, 9.5)];
let wps = [], wi = 0, busy = false, segLen = 1, roomK = 0, planetK = 0, orbW = 0, pushT0 = -1e9, camReady = false;
function aimWp(w) { const W = WTS(); CP[0].t = w.p.x; CP[1].t = w.p.y; CP[2].t = w.p.z; CL[0].t = w.l.x; CL[1].t = w.l.y; CL[2].t = w.l.z; CP.forEach(q => q.w = W.GLIDE); CL.forEach(q => q.w = W.REL) }
function jumpTo(w) { CP[0].x = w.p.x; CP[1].x = w.p.y; CP[2].x = w.p.z; CL[0].x = w.l.x; CL[1].x = w.l.y; CL[2].x = w.l.z; CP.concat(CL).forEach(q => q.v = 0); aimWp(w) }
function retarget(instant) { const w = poseOf(S); wps = [w]; wi = 0; if (instant || !camReady) { jumpTo(w); camReady = true } else aimWp(w); dirty = true }
function path(a, b) {
  const out = [];
  if (a.lv !== 'rings' && (b.lv === 'rings' || b.r !== a.r)) out.push(ringPose(a.r));
  if (b.r !== a.r && b.lv !== 'rings') out.push(ringPose(b.r));
  out.push(poseOf(b));
  return out;
}
function go(b, opt) {
  if (busy) return false;
  const a = S, w = path(a, b); S = b; wps = w; wi = 0; busy = true; aimWp(w[0]);
  segLen = Math.max(1, V(CP[0].x, CP[1].x, CP[2].x).distanceTo(w[0].p));
  if ((b.lv === 'room' && a.lv === 'rings') || (b.lv === 'planet' && a.lv === 'room')) { if (!RMQ.matches) pushT0 = performance.now() + 150 }
  if (b.lv !== 'rings') memK[b.r][b.L] = b.k;
  if (b.lv === 'rings') { ORB.raw.y = ORB.raw.p = PLN.raw.y = PLN.raw.p = 0; lastIn = performance.now() }
  say(); dirty = true; wake(); return true;
}
const lastOf = r => r.layers.length - 1;
const nRings = RINGS.length;
function deeper() {   // in: through the hoop, one layer deeper; from the planet, back to the object
  if (busy) return;
  if (S.lv === 'rings') return go({ lv: 'room', r: S.r, L: 0, k: memK[S.r][0] });
  if (S.lv === 'planet') return go({ lv: 'room', r: S.r, L: S.L, k: S.k });
  const r = RINGS[S.r]; if (S.L < r.layers.length - 1) go({ lv: 'room', r: S.r, L: S.L + 1, k: Math.min(memK[S.r][S.L + 1], r.layers[S.L + 1].frames.length - 1) });
}
function outward() {  // pinch out / wheel away: object -> planet, then (or from the rings) the constellation
  if (busy) return;
  if (S.lv === 'room') return go({ lv: 'planet', r: S.r, L: S.L, k: S.k });
  enterCst();
}
function up() {       // Back / Esc: one step up, planet -> object -> (layer by layer) -> its ring -> the constellation
  if (busy) return;
  if (S.lv === 'rings') return enterCst();
  if (S.lv === 'planet') return go({ lv: 'room', r: S.r, L: S.L, k: S.k });
  if (S.L > 0) return go({ lv: 'room', r: S.r, L: S.L - 1, k: memK[S.r][S.L - 1] });
  go({ lv: 'rings', r: S.r, L: 0, k: 0 });
}
function along(d) {
  if (busy || S.lv === 'planet') return;
  if (S.lv === 'rings') { const r = S.r + d; if (r >= 0 && r < nRings) go({ lv: 'rings', r, L: 0, k: 0 }) }
  else { const n = RINGS[S.r].layers[S.L].frames.length, k = S.k + d; if (k >= 0 && k < n) go({ lv: 'room', r: S.r, L: S.L, k }) }
}
function home() { if (busy) return; if (S.lv === 'rings' && S.r === 0) return; go({ lv: 'rings', r: 0, L: 0, k: 0 }) }

/* ---------- the two turns: the camera orbiting the object, and the world turning around you in the planet.
   Raw angles are unbounded in yaw and soft-walled in pitch; the site springs settle them. ---------- */
const DRIFT = .02, IDLE_MS = 3500, VCAP = 3;
function mkCtl(K, PIT, sgnP) { return { raw: { y: 0, p: 0 }, YS: mkS(0, 9.5), PS: mkS(0, 9.5), K, PIT, RAWP: 2.2 * PIT, sgnP } }
const ORB = mkCtl(.006, 1.0, 1), PLN = mkCtl(.008, 1.2, -1);
const ctl = () => (S.lv === 'planet' ? PLN : ORB);
let interacting = false, lastIn = performance.now(), lvel = [0, 0], lmoveT = 0, drift = 0;
const grab = () => { interacting = true; lastIn = performance.now(); lvel = [0, 0]; lmoveT = 0; const c = ctl(), W = WTS(); c.YS.w = c.PS.w = W.REL; wake() };
function drag(dx, dy) {
  const c = ctl(), t = performance.now(), dts = Math.max(.008, (t - (lmoveT || t - 16)) / 1000); lmoveT = t; lastIn = t;
  c.raw.y -= dx * c.K; c.raw.p = clamp(c.raw.p + c.sgnP * dy * c.K, -c.RAWP, c.RAWP);
  lvel = [lvel[0] * .6 + clamp(-dx * c.K / dts, -VCAP, VCAP) * .4, lvel[1] * .6 + clamp(c.sgnP * dy * c.K / dts, -VCAP, VCAP) * .4]; wake();
}
function release() {
  const c = ctl(); interacting = false; lastIn = performance.now();
  if (!RMQ.matches && performance.now() - lmoveT < 80) { c.raw.y += clamp(lvel[0] * .45, -1.1, 1.1); c.raw.p = clamp(c.raw.p + clamp(lvel[1] * .45, -.5, .5), -c.RAWP, c.RAWP) }   // slow inertia, then it settles on W_SOFT
  c.YS.w = c.PS.w = WTS().SOFT; wake();
}
function settleOrbit() { const c = ctl(); c.raw.y = Math.round(c.YS.x / (Math.PI * 2)) * Math.PI * 2; c.raw.p = 0; c.YS.w = c.PS.w = WTS().GLIDE; lastIn = performance.now(); wake() }

/* ---------- camera tick ---------- */
let raf = 0, lastT = 0, fovNow = FOV;
function wake() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick) } }
function tick(now) {
  raf = 0;
  const dt = Math.min(.05, Math.max(.001, (now - lastT) / 1000)); lastT = now;
  const rm = RMQ.matches, W = WTS();
  CP.forEach(q => sstep(q, dt)); CL.forEach(q => sstep(q, dt));
  const pos = V(CP[0].x, CP[1].x, CP[2].x), look = V(CL[0].x, CL[1].x, CL[2].x);
  if (busy) {
    const w = wps[wi];
    if (wi < wps.length - 1) { if (pos.distanceTo(w.p) < Math.max(.9, segLen * .28)) { wi++; aimWp(wps[wi]); segLen = Math.max(1, pos.distanceTo(wps[wi].p)) } }
    else if (pos.distanceTo(w.p) < Math.max(.28, segLen * .12)) busy = false;
  }
  const inRoom = S.lv !== 'rings', atObj = S.lv === 'room';
  roomK = lag(roomK, inRoom ? 1 : 0, rm ? 22 : 3.4, dt); planetK = lag(planetK, S.lv === 'planet' ? 1 : 0, rm ? 22 : 3.4, dt); orbW = lag(orbW, atObj ? 1 : 0, rm ? 22 : 3.4, dt);
  const idle = inRoom && !interacting && now - lastIn > IDLE_MS && !rm;
  const cc = ctl(); if (idle) { drift += dt; cc.raw.y += DRIFT * dt; cc.YS.w = cc.PS.w = W.SOFT }
  [ORB, PLN].forEach(c => { c.YS.t = c.raw.y; c.PS.t = c.PIT * Math.tanh(c.raw.p / c.PIT); sstep(c.YS, dt); sstep(c.PS, dt) });
  const YS = PLN.YS, PS = PLN.PS;
  if (orbW * (1 - planetK) > .0005) {   // the camera orbits the object it is looking at
    const w = orbW * (1 - planetK), off = pos.clone().sub(look), r = Math.max(.01, off.length()), a0 = Math.atan2(off.x, off.z), e0 = Math.asin(clamp(off.y / r, -1, 1));
    const az = a0 + ORB.YS.x * w, el = clamp(e0 + ORB.PS.x * w, -1.25, 1.25);
    pos.set(look.x + r * Math.cos(el) * Math.sin(az), look.y + r * Math.sin(el), look.z + r * Math.cos(el) * Math.cos(az));
  }
  const e = clamp((now - pushT0) / 960, 0, 1), bf = bump(e);
  const fov = FOV / bf; if (Math.abs(fov - fovNow) > .01) { fovNow = fov; cam.fov = fov; cam.updateProjectionMatrix() }
  cam.position.copy(pos); cam.lookAt(look);
  planet.position.copy(look); planet.rotation.set(PS.x, YS.x, 0, 'XYZ');
  const pu = planetU.uA; pu.value = planetK * planetK * (3 - 2 * planetK); planet.userData.stars.material.opacity = .85 * pu.value; shell.visible = pu.value > .004; planet.userData.stars.visible = shell.visible;
  applyWorld(pos);
  if (cup) { cup.rotation.set(PS.x * .9 * planetK, YS.x * planetK, 0, 'XYZ') }
  ensureTex(pos);
  R.render(scene, cam); dirty = false;
  const live = busy || Math.abs(roomK - (inRoom ? 1 : 0)) > .003 || Math.abs(planetK - (S.lv === 'planet' ? 1 : 0)) > .003 || Math.abs(orbW - (atObj ? 1 : 0)) > .003 || interacting || idle || e < 1 || CP.some(q => Math.abs(q.x - q.t) > 1e-3 || Math.abs(q.v) > 1e-3) || CL.some(q => Math.abs(q.x - q.t) > 1e-3 || Math.abs(q.v) > 1e-3) ||
    [ORB, PLN].some(c => Math.abs(c.YS.x - c.YS.t) > 2e-4 || Math.abs(c.PS.x - c.PS.t) > 2e-4 || Math.abs(c.YS.v) > 2e-4 || Math.abs(c.PS.v) > 2e-4);
  if (live) raf = requestAnimationFrame(tick);
  else if (inRoom && !rm && !interacting) { clearTimeout(idleT); idleT = setTimeout(wake, Math.max(60, lastIn + IDLE_MS - now + 30)) }   // the very slow idle drift starts after 3.5 s
}
let idleT = 0;
const qL = new THREE.Quaternion(), eL = new THREE.Euler();
function applyWorld(pos) {
  const inRoom = S.lv !== 'rings', ck = 1 - roomK, pk = 1 - planetK;
  W_.rings.forEach((rm, i) => {
    const focus = i === S.r, ringA = focus ? 1 : ck, atm = pk;
    rm.grp.visible = ringA > .004 || focus;
    rm.fx.forEach(o => { o.m.opacity = o.b * atm * (focus ? 1 : ck) });
    rm.layers.forEach((L, li) => {
      let hk = ringA;
      if (focus && inRoom) hk = ck + roomK * ((li === S.L || li === S.L + 1) ? .3 : 0);
      else if (focus) hk = 1;
      L.hoop.userData.set(hk);
      L.frames.forEach(f => {
        const d = pos.distanceTo(f.wp);
        let a = clamp((DC + 3.2 - d) / 2.6, 0, 1); a = a * a * (3 - 2 * a);
        if (li === 0 && f.k === 0) a = Math.max(a, .62 * ck * ringA);
        a *= focus ? 1 : ck; f.a = a;
        f.m.material.opacity = a; f.m.visible = a > .004; f.pool.material.opacity = f.poolB * a; f.pool.visible = a > .004; if (f.sh) { f.sh.material.opacity = a; f.sh.visible = a > .004 }
        if (focus && inRoom && li === S.L && f.k === S.k) {
          f.m.quaternion.copy(cam.quaternion);   // a photograph always faces you while you orbit it
          if (planetK > .004) { const yy = Math.tanh(PLN.YS.x * .25) * .45, pp = Math.tanh(PLN.PS.x * .4) * .3; qL.setFromEuler(eL.set(pp, yy, 0, 'XYZ')); f.m.quaternion.slerp(qL, planetK) }
        } else f.m.rotation.set(0, 0, 0);
      });
    });
  });
  globalFx.forEach(h => h.userData.set(ck)); stars.material.opacity = .4 * ck; stars.visible = ck > .004;
  if (cup) cup.visible = S.r === J && inRoom && S.L === 0 && ck < .98 || (S.r === J && ck > .02 && W_.rings[J].layers[0].frames[0].a > .01);
  scene.fog.density = .045 - .02 * roomK - .01 * planetK;
}
function ensureTex(pos) {
  W_.rings.forEach((rm, i) => rm.layers.forEach((L, li) => L.frames.forEach(f => {
    const u = f.m.userData;
    if (f.a > .03 || (i === S.r && S.lv === 'rings' && li === 0)) loadPlane(f.m, false);
    if (S.lv !== 'rings' && i === S.r && li === S.L && f.k === S.k && u.loaded === 1) loadPlane(f.m, true);
  })));
}

/* ---------- HUD ---------- */
const WHERE = $('#where'), CAP = $('#cap'), BACK = $('#back'), PREV = $('#prev'), NEXT = $('#next'), INB = $('#inb'), HINT = $('#hint');
function say() {
  const rg = RINGS[S.r], rooms = S.lv !== 'rings';
  const L = rooms ? rg.layers[S.L] : null, f = rooms ? L.frames[S.k] : null;
  $('.w', WHERE).textContent = rg.title + (rooms ? ' \u00b7 ' + L.name : '') + (S.lv === 'planet' ? ' \u00b7 planet' : '');
  $('.n', WHERE).textContent = rooms ? (L.frames.length > 1 ? (S.k + 1) + ' / ' + L.frames.length : '') : (S.r + 1) + ' / ' + nRings;
  $('.t', CAP).textContent = rooms ? (f.cap || '') : '';
  $('.s', CAP).textContent = rooms ? f.img.split('/').pop().slice(0, 30) : '';
  PREV.disabled = rooms ? S.k === 0 : S.r === 0; NEXT.disabled = rooms ? S.k >= L.frames.length - 1 : S.r >= nRings - 1;
  INB.hidden = rooms; PREV.hidden = NEXT.hidden = S.lv === 'planet';
  hintFor();
}
let hintK = '';
function hintFor() {
  const k = S.lv === 'rings' ? 'r' : S.lv === 'planet' ? 'p' : 'o'; if (hintK === k) return; hintK = k;
  HINT.textContent = { r: 'swipe to glide ring to ring \u00b7 tap or pinch in to go through \u00b7 pinch out for the constellation', o: 'drag to orbit the piece \u00b7 pinch in goes deeper \u00b7 pinch out enters the planet \u00b7 back rises', p: 'drag to turn the world around you \u00b7 pinch in returns to the piece \u00b7 pinch out for the constellation' }[k];
  HINT.classList.remove('gone'); clearTimeout(hintT); hintT = setTimeout(() => HINT.classList.add('gone'), 4200);
}
let hintT = 0;
BACK.addEventListener('click', () => up()); $('#home').addEventListener('click', home);
PREV.addEventListener('click', () => along(-1)); NEXT.addEventListener('click', () => along(1)); INB.addEventListener('click', deeper);

/* ---------- constellation: every frame of every ring ---------- */
const flat = []; RINGS.forEach((rg, r) => rg.layers.forEach((L, l) => L.frames.forEach((f, k) => flat.push({ r, L: l, k, f, group: r * 10 + l }))));
const cst = Constellation({
  items: () => flat.map(o => ({ group: o.group })),
  label: i => RINGS[flat[i].r].title + ' \u00b7 ' + RINGS[flat[i].r].layers[flat[i].L].name,
  thumb: i => MT(flat[i].f.img),
  hint: 'pinch in or tap a star to go back in \u00b7 esc to return',
  onReturn: i => { const o = flat[i]; pushT0 = performance.now(); S = { lv: 'rings', r: S.r, L: 0, k: 0 }; busy = false; go({ lv: 'room', r: o.r, L: o.L, k: o.k }) },
  onLeave: () => { }
});
function enterCst() { const at = Math.max(0, S.lv === 'rings' ? flat.findIndex(o => o.r === S.r) : flat.findIndex(o => o.r === S.r && o.L === S.L && o.k === S.k)); cst.open(at) }

/* ---------- input ---------- */
const deeperG = () => { if (!cst.isOpen()) deeper() }, outG = () => { if (!cst.isOpen()) outward() };
addEventListener('keydown', e => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || cst.isOpen()) return;
  const k = e.key;
  if (k === 'Enter' || k === 'ArrowDown') deeper();
  else if (k === 'ArrowUp' || k === 'Backspace' || k === 'Escape') up();
  else if (k === '-' || k === '_') outward();
  else if (k === 'ArrowRight') along(1);
  else if (k === 'ArrowLeft') along(-1);
  else if (k === 'Home') home();
  else if (k === '0') settleOrbit();
  else return;
  e.preventDefault();
});
let wAcc = 0, wLock = false, wLast = 0;
canvas.addEventListener('wheel', e => {
  e.preventDefault(); if (cst.isOpen()) return;
  const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 4 : 1), t = performance.now();
  if (t - wLast > 220) { wLock = false; wAcc = 0 } wLast = t;
  if (wLock) return; wAcc += dy; if (Math.abs(wAcc) < 30) return;
  wLock = true; const d = wAcc; wAcc = 0; if (d < 0) deeper(); else outward();
}, { passive: false });
const PT = new Map(); let G = null;
const dist = () => { const a = [...PT.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) };
const endOrbit = () => { if (G && G.orbit) { G.orbit = false; release(); html.classList.remove('orbiting') } };
canvas.addEventListener('pointerdown', e => {
  e.preventDefault(); try { canvas.setPointerCapture(e.pointerId) } catch (x) {}
  PT.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!G) G = { x0: e.clientX, y0: e.clientY, t0: performance.now(), multi: false, fired: false, d0: 0, orbit: false };
  if (PT.size >= 2) { endOrbit(); G.multi = true; if (!G.d0) G.d0 = dist() }
});
canvas.addEventListener('pointermove', e => {
  const p = PT.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (G && !G.multi && PT.size === 1 && S.lv !== 'rings') {
    if (!G.orbit && Math.hypot(e.clientX - G.x0, e.clientY - G.y0) > 6) { G.orbit = true; grab(); html.classList.add('orbiting'); drag(e.clientX - G.x0, e.clientY - G.y0) }
    else if (G.orbit) drag(dx, dy);
  }
  if (G && G.multi && PT.size >= 2 && !G.fired && G.d0 > 0) { const r = dist() / G.d0; if (r > 1.2) { G.fired = true; deeperG() } else if (r < .83) { G.fired = true; outG() } }
});
function rel(e, cancel) {
  const p = PT.get(e.pointerId); if (!p) return; PT.delete(e.pointerId);
  if (!G) return;
  if (!G.multi && !cancel && !G.orbit) {
    const dx = e.clientX - G.x0, dy = e.clientY - G.y0, dt = performance.now() - G.t0;
    if (S.lv === 'rings' && Math.abs(dx) > 50 && Math.abs(dx) > 1.3 * Math.abs(dy)) along(dx < 0 ? 1 : -1);
    else if (Math.hypot(dx, dy) < 12 && dt < 600 && S.lv !== 'planet') deeperG();
  }
  endOrbit(); if (PT.size === 0) G = null;
}
canvas.addEventListener('pointerup', e => rel(e, false)); canvas.addEventListener('pointercancel', e => rel(e, true));
['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => canvas.addEventListener(t, e => e.preventDefault(), { passive: false }));
canvas.addEventListener('contextmenu', e => e.preventDefault());

function resize() {
  const W = innerWidth, H = innerHeight; R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setSize(W, H, false); aspect = W / H; cam.aspect = aspect; cam.updateProjectionMatrix();
  layoutPlanes(); retarget(true); dirty = true; wake(); cst.resize();
}
addEventListener('resize', resize);
addEventListener('rmchange', paintTheme);

/* deep link for review: #room=<ring id>/<layer>/<frame>  or  #planet=<ring id>/<layer>/<frame> */
(function boot() {
  resize(); paintTheme();
  const m = /[#&](room|planet)=([\w-]+)\/(\d+)\/(\d+)/.exec(location.hash);
  if (m) {
    const r = RINGS.findIndex(x => x.id === m[2]);
    if (r >= 0) { const L = Math.min(+m[3], RINGS[r].layers.length - 1), k = Math.min(+m[4], RINGS[r].layers[L].frames.length - 1); S = { lv: m[1], r, L, k }; memK[r][L] = k; roomK = 1; if (m[1] === 'planet') planetK = 1; else orbW = 1; retarget(true) }
  }
  say(); wake();
})();
window.__o3 = {
  state: () => ({ ...S, busy, roomK: +roomK.toFixed(3), planetK: +planetK.toFixed(3), orbit: [+ORB.YS.x.toFixed(3), +ORB.PS.x.toFixed(3)], world: [+PLN.YS.x.toFixed(3), +PLN.PS.x.toFixed(3)], fov: +cam.fov.toFixed(2) }),
  deeper, up, outward, along, home, settle: settleOrbit, cst: () => cst.isOpen()
};
