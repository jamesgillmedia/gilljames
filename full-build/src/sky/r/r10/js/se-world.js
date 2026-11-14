/* R10c · the Spirit Eye 3D (the brief's world). Ported from the unified build's one/js/world.js: ONE three.js scene that frames the whole site.
   Spirit Eye (the whorl from PDF p.7, lit from above) is the anchor at the centre; the six chapters orbit it as labelled star
   clusters; the brief's "show" stops are PDF plates placed in the space around the whorl. The DOM layers sit on top of this;
   the world never navigates anywhere, it only moves the camera calmly and dims while you read.
   Star shader, fog and the spring rig are from 3d/js/main.js (site-3d). Motion is identical with Reduce Motion on. */
let THREE = null;
const S = (x, w) => ({ x, v: 0, t: x, w });
function sstep(s, dt) { const w = s.w, e = s.x - s.t, k = Math.exp(-w * dt), c = s.v + w * e; s.x = s.t + (e + c * dt) * k; s.v = (s.v - w * c * dt) * k }
const W = 2.2; /* one calm spring for every move */
export const world = { ok: false, onPick: null, clusters: [] };
const SE = 'm4/3d/media/spirit-eye/';
export async function mount(canvas, chapters) {
  try { const c = document.createElement('canvas'); if (!(c.getContext('webgl2') || c.getContext('webgl')) || /[?&]nogl\b/.test(location.search)) throw 0;
    THREE = await import('../m4/3d/vendor/three.module.min.js') } catch (e) { document.documentElement.classList.add('nogl'); return world }
  let R; try { R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }) } catch (e) { document.documentElement.classList.add('nogl'); return world }
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setClearColor(0x04060c, 1);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x04060c, .006);
  const cam = new THREE.PerspectiveCamera(55, 1, .1, 1500);
  const P = [S(0, W), S(14, W), S(62, W)], L = [S(0, W), S(0, W), S(0, W)];
  const U = { uT: { value: 0 }, uPx: { value: 1 } };
  /* stars */
  { const n = innerWidth < 700 ? 2600 : 4200, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), ph = new Float32Array(n), sz = new Float32Array(n);
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = 60 + Math.pow(Math.random(), .6) * 420, s = Math.sqrt(1 - u * u);
      p[i * 3] = Math.cos(a) * s * r; p[i * 3 + 1] = u * r * .8; p[i * 3 + 2] = Math.sin(a) * s * r; ph[i] = Math.random(); sz[i] = Math.random() < .05 ? 3 + Math.random() * 2.4 : .9 + Math.random() * 1.5 }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1)); g.setAttribute('aSz', new THREE.BufferAttribute(sz, 1));
    scene.add(new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aPh;attribute float aSz;uniform float uT,uPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float d=max(.1,-mv.z);
        float tw=1.+.45*sin(uT*(1.1+aPh*2.3)+aPh*60.)*step(.55,fract(aPh*7.));gl_PointSize=clamp(aSz*uPx*tw*170./d,1.2,26.);vA=1.6*exp(-d*.004)*smoothstep(.5,6.,d)*(.7+.3*tw);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying float vA;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);a*=a;gl_FragColor=vec4(vec3(.86,.9,1.)*a*vA,1.);}` }))) }
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; { const x = gc.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, '#fff'); g.addColorStop(.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128) }
  const GT = new THREE.CanvasTexture(gc);
  const glow = (col, k, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.set(k, k, 1); return s };
  [[-110, 50, -280, 0x27407a, 260], [140, -40, 180, 0x4a2a6a, 280], [10, -60, -140, 0x173c4a, 180]].forEach(n => { const s = glow(n[3], n[4], .2); s.position.set(n[0], n[1], n[2]); scene.add(s) });
  const TL = new THREE.TextureLoader();
  const tex = (url, cb) => TL.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; cb && cb(t) });
  /* the anchor: the whorl (PDF p.7 plan) as a disc lying on dark water, light falling through it */
  const anchor = new THREE.Group(); scene.add(anchor);
  const discM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { map: { value: null }, uT: U.uT, uO: { value: 1 } },
    vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform sampler2D map;uniform float uT,uO;varying vec2 vU;void main(){float r=length(vU-.5);if(r>.5)discard;vec4 c=texture2D(map,vU);float e=smoothstep(.5,.44,r);float l=.75+.25*sin(uT*.4);gl_FragColor=vec4(c.rgb*(.75+.35*l),e*uO);}' });
  tex(SE + 's2/p07-plan-dial.webp', t => { discM.uniforms.map.value = t; discM.needsUpdate = true });
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), discM); disc.rotation.x = -Math.PI / 2.35; anchor.add(disc);
  const sun = glow(0xfff1c8, 22, .35); sun.position.set(0, 9, 0); anchor.add(sun);
  const beamM = new THREE.MeshBasicMaterial({ color: 0xffeec0, transparent: true, opacity: .07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.6, 6.5, 26, 40, 1, true), beamM); beam.position.y = -4; anchor.add(beam);
  /* chapters: labelled clusters on a ring */
  const RING = 30, CL = [];
  function label(s, w) { const c = document.createElement('canvas'); c.width = 640; c.height = 128; const x = c.getContext('2d'); x.font = '76px "Julius Sans One", sans-serif'; x.letterSpacing = '12px'; x.fillStyle = '#e8eef6'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 320, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); sp.scale.set(w, w / 5, 1); return sp }
  chapters.forEach((ch, i) => { const g = new THREE.Group(), tint = new THREE.Color(...ch.tint.split(',').map(v => +v / 255)), a = i / chapters.length * 6.283 - Math.PI / 2;
    g.position.set(Math.cos(a) * RING, Math.sin(a * 2) * 3 + 2, Math.sin(a) * RING * .8); scene.add(g);
    let seed = i * 97 + 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 };
    const n = Math.min(12, Math.max(5, ch.cards.length)), pts = [];
    for (let j = 0; j < n; j++) { const b = j / n * 6.283 + rnd() * .7, r = 1.4 + rnd() * 2.4; const p = new THREE.Vector3(Math.cos(b) * r * 1.2, Math.sin(b) * r * .8, (rnd() - .5) * 2); pts.push(p); const s = glow(tint, j ? 1.1 + rnd() : 2.4, 1); s.position.copy(p); g.add(s) }
    const lp = []; for (let j = 0; j < n; j++) lp.push(pts[j], pts[(j + 1) % n]);
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: tint, transparent: true, opacity: .35, depthWrite: false })));
    const lab = label(ch.nm, 7); lab.position.y = 4.6; g.add(lab); CL.push({ k: ch.k, g, scr: [0, 0, 2] }) });
  world.clusters = CL;
  /* brief plates: PDF images placed in the space around the whorl, one per "show" stop (scale, depth, placement) */
  const plates = new Map();
  function platePos(i, n) { const a = -Math.PI / 2 + (i / Math.max(1, n)) * 6.283 * 1.15, r = 15 + (i % 3) * 2.2; return new THREE.Vector3(Math.cos(a) * r, -1 + Math.sin(i * 1.7) * 2.5, Math.sin(a) * r) }
  function plate(key, url, w, h, i, n) { if (plates.has(key)) return plates.get(key);
    const m = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false });
    const ar = w / h, H = ar > 1.3 ? 9 / ar * 1.0 : 9, Wd = H * ar; const mesh = new THREE.Mesh(new THREE.PlaneGeometry(Wd > 16 ? 16 : Wd, Wd > 16 ? 16 / ar : H), m);
    mesh.position.copy(platePos(i, n)); mesh.lookAt(0, mesh.position.y, 0); mesh.rotateY(Math.PI); scene.add(mesh);
    const o = { mesh, m, tgt: 0, loaded: false }; plates.set(key, o); tex(url, t => { m.map = t; m.needsUpdate = true; o.loaded = true }); return o }
  /* camera targets */
  const vp = new THREE.Vector3(), vl = new THREE.Vector3();
  function set(p, l) { P[0].t = p.x; P[1].t = p.y; P[2].t = p.z; L[0].t = l.x; L[1].t = l.y; L[2].t = l.z }
  let curPlate = null, DIM = 0, dimT = 0;
  world.home = () => { showPlate(null); const far = innerWidth / innerHeight < .8 ? 96 : 66; set(vp.set(0, 22, far), vl.set(0, 0, 0)) };
  world.anchor = () => { showPlate(null); set(vp.set(0, 15, 26), vl.set(0, -1, 0)) };
  world.chapter = k => { showPlate(null); const C = CL.find(c => c.k === k); if (!C) return world.home(); const p = C.g.position, d = innerWidth / innerHeight < .8 ? 26 : 16; vp.copy(p).multiplyScalar(1 + d / RING); vp.y += 3; set(vp, p) };
  world.plate = (key, url, w, h, i, n) => { const o = plate(key, url, w, h, i, n); showPlate(o); const nrm = new THREE.Vector3(0, 0, 1).applyQuaternion(o.mesh.quaternion), g = o.mesh.geometry.parameters;
    const asp = innerWidth / innerHeight, fit = Math.max(g.height / 2 / Math.tan(27.5 * Math.PI / 180), g.width / 2 / Math.tan(27.5 * Math.PI / 180) / asp) * 1.12;
    set(vp.copy(o.mesh.position).addScaledVector(nrm, fit), o.mesh.position) };
  world.preload = (key, url, w, h, i, n) => plate(key, url, w, h, i, n);
  /* the moon: the reel v7 opening frame (moon water, the crescent moon), hung high in the sky; About arrives here */
  const moon = plate('moon', 'media/moon-water.webp', 1280, 626, 0, 1); moon.mesh.geometry.dispose(); moon.mesh.geometry = new THREE.PlaneGeometry(40, 40 * 626 / 1280);
  moon.mesh.position.set(0, 70, -60); moon.mesh.lookAt(0, 70, 0);
  world.moon = () => { showPlate(moon); const asp = innerWidth / innerHeight, d = Math.max(19.6 / Math.tan(27.5 * Math.PI / 180), 20 / Math.tan(27.5 * Math.PI / 180) / asp) * (asp < 1 ? .55 : .95); set(vp.set(0, 70, -60 + d), vl.set(0, 70, -60)) };
  function showPlate(o) { curPlate = o; plates.forEach(p => p.tgt = p === o ? 1 : 0) }
  world.dim = v => { dimT = v };
  world.pick = (x, y) => { let best = null, bd = 1e9; CL.forEach(C => { const d = Math.hypot(C.scr[0] - x, C.scr[1] - y); if (C.scr[2] < 1 && d < 70 && d < bd) { bd = d; best = C } }); return best && best.k };
  world.st = () => ({ cam: P.map(s => +s.x.toFixed(1)), plate: !!curPlate, dim: +DIM.toFixed(2), cl: CL.map(C => [C.k, Math.round(C.scr[0]), Math.round(C.scr[1])]) });
  function layout() { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); U.uPx.value = R.getPixelRatio() * h / 780 }
  addEventListener('resize', layout); layout();
  const v4 = new THREE.Vector3(); let last = performance.now();
  const veil = document.getElementById('se-veil');
  function frame(now) { requestAnimationFrame(frame); if (world.paused) { last = now; return } const dt = Math.min(.05, (now - last) / 1000); last = now; U.uT.value = now / 1000;
    P.forEach(s => sstep(s, dt)); L.forEach(s => sstep(s, dt)); DIM += (dimT - DIM) * Math.min(1, dt * 4);
    if (veil) veil.style.opacity = DIM.toFixed(3);
    cam.position.set(P[0].x, P[1].x, P[2].x); cam.lookAt(L[0].x, L[1].x, L[2].x);
    anchor.rotation.y += dt * .02; disc.rotation.z += dt * .01;
    plates.forEach(p => { p.m.opacity += ((p.loaded ? p.tgt : 0) * 1 - p.m.opacity) * Math.min(1, dt * 3); p.mesh.visible = p.m.opacity > .01 || p.tgt > 0 });
    const plateOn = curPlate ? curPlate.m.opacity : 0; discM.uniforms.uO.value = 1 - plateOn * .6;
    CL.forEach(C => { C.g.quaternion.copy(cam.quaternion); v4.copy(C.g.position).project(cam); C.scr = [(v4.x + 1) / 2 * innerWidth, (1 - v4.y) / 2 * innerHeight, v4.z]; C.g.visible = plateOn < .5 });
    R.render(scene, cam) }
  requestAnimationFrame(frame); world.ok = true; world.home(); return world;
}
