/* u4-opus-m4/3d · first save: site-3d's sky (three.js r160, FogExp2, PerspectiveCamera, Points starfield, critically damped springs)
 around the Spirit Eye anchor (js/spirit-eye.js, placeholder), with m4's six chapters as named star clusters orbiting it.
 Tap a cluster: fly to it; tap again (or its link): open its m4 2D page. Photo opens the reel (js/reel.js). */
import * as SE from './spirit-eye.js';
const html = document.documentElement;
const $ = s => document.querySelector(s);
const WHERE = $('#where'), PANEL = $('#panel'), HOMEB = $('#home'), BACKB = $('#back');
const UNL = (() => { try { return sessionStorage.getItem('gj3.se') === '1' } catch (e) { return false } })();
function saveUnlock() { try { sessionStorage.setItem('gj3.se', '1') } catch (e) {} }
const LOG = []; function log(k, v) { LOG.push([Math.round(performance.now()), k, v]); if (LOG.length > 300) LOG.shift() }
const LINK = k => '../#' + k + '/board';
let PHOTOS = null; const photosP = window.GJ3_PHOTOS().then(p => (PHOTOS = p)).catch(e => { console.warn(e); return [] });
const dataP = fetch('../data.json').then(r => r.json());
function openReel(start, onClose) { photosP.then(p => { if (!p.length) return; html.classList.add('reelon'); window.GJ3_REEL.open({ photos: p, start: start || 0, onClose: () => { html.classList.remove('reelon'); if (onClose) onClose() } }); if (location.hash !== '#photo') history.replaceState(null, '', '#photo'); log('reel', 1) }) }
/* ---------- caption (DOM, shared by both modes) ---------- */
/* ---------- no WebGL: plain anchor + chapter links; the reel still works ---------- */
async function fallback() {
  html.classList.add('nogl'); SE.fallback($('#fb .se'));
  const d = await dataP, ul = $('#fb ul'); ul.innerHTML = '';
  d.chapters.forEach(c => { const li = document.createElement('li'), a = document.createElement('a'); a.textContent = c.nm;
    if (c.k === 'photo') { a.href = '#photo'; a.addEventListener('click', e => { e.preventDefault(); openReel(0, () => history.replaceState(null, '', location.pathname)) }) } else a.href = LINK(c.k);
    li.appendChild(a); ul.appendChild(li) });
  if (location.hash === '#photo') openReel(0, () => history.replaceState(null, '', location.pathname));
  log('fallback', 1);
}
let THREE = null;
if (html.classList.contains('nogl')) fallback();
else { try { THREE = await import('../vendor/three.module.min.js'); start() } catch (e) { console.warn(e); fallback() } }
function start() {
  let R; try { R = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: false, powerPreference: 'high-performance' }) } catch (e) { fallback(); return }
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setClearColor(0x04060c, 1);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x04060c, .0042);
  const cam = new THREE.PerspectiveCamera(60, 1, .1, 1200);
  let tv = .577, th = .577;
  /* critically damped springs (site-3d) */
  const S = (x, w) => ({ x: x, v: 0, t: x, w: w });
  function sstep(s, dt) { const w = s.w, e = s.x - s.t, k = Math.exp(-w * dt), c = s.v + w * e; s.x = s.t + (e + c * dt) * k; s.v = (s.v - w * c * dt) * k }
  const W_FLY = 2.6, W_OUT = 1.5, W_REL = 9;
  const T = [S(0, W_FLY), S(0, W_FLY), S(0, W_FLY)], AZ = S(0, W_REL), EL = S(0, W_REL), DIST = S(20, W_FLY);
  /* ---------- stars: a shell all around (site-3d shader) ---------- */
  const U = { uT: { value: 0 }, uPx: { value: 1 } };
  function starField(n) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), ph = new Float32Array(n), sz = new Float32Array(n), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = 45 + Math.pow(Math.random(), .6) * 380, s = Math.sqrt(1 - u * u);
      p[i * 3] = Math.cos(a) * s * r; p[i * 3 + 1] = u * r * .8; p[i * 3 + 2] = Math.sin(a) * s * r; ph[i] = Math.random();
      sz[i] = Math.random() < .05 ? 3.2 + Math.random() * 2.5 : .9 + Math.random() * 1.6; const t = Math.random();
      col[i * 3] = .75 + .25 * t; col[i * 3 + 1] = .82 + .1 * t; col[i * 3 + 2] = 1 - .15 * t * t }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
    g.setAttribute('aSz', new THREE.BufferAttribute(sz, 1)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aPh;attribute float aSz;attribute vec3 aCol;uniform float uT,uPx;varying float vA;varying vec3 vC;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float d=max(.1,-mv.z);
        float tw=1.+.5*sin(uT*(1.1+aPh*2.3)+aPh*60.)*step(.55,fract(aPh*7.));
        gl_PointSize=clamp(aSz*uPx*tw*170./d,1.2,30.);
        vA=1.7*exp(-d*.0042)*smoothstep(.5,6.,d)*(.7+.3*tw);vC=aCol;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);a*=a;gl_FragColor=vec4(vC*a*vA,1.);}` });
    return new THREE.Points(g, m) }
  const NSTAR = innerWidth < 700 ? 2600 : 4200; scene.add(starField(NSTAR));
  function glowTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t }
  const GT = glowTex();
  /* previews (gilljames/previews sky.js glow): a bright core with a soft three-stop halo; the chapter's entry star uses it */
  function pvGlow() { const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d'), g = x.createRadialGradient(96, 96, 0, 96, 96, 96);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.18, 'rgba(255,255,255,.45)'); g.addColorStop(.5, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 192, 192); return ctex(c) }
  function coreTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.55, 'rgba(255,255,255,1)'); g.addColorStop(.75, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return ctex(c) }
  [[-90, 40, -260, 0x27407a, 220], [120, -30, 160, 0x4a2a6a, 260], [10, -50, -120, 0x173c4a, 160]].forEach(n => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: n[3], transparent: true, opacity: .2, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.position.set(n[0], n[1], n[2]); s.scale.set(n[4], n[4], 1); scene.add(s) });
  function ctex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t }
  const PG = pvGlow(), CT = coreTex(), CLL = $('#cll'); let SESKY = false, OBS = [], OBF = 0;
  /* screen boxes the chapter labels must not cover: Spirit Eye title / tagline / dial / page pill, the bar buttons, the panel */
  function obstacles() { const o = []; document.querySelectorAll('#setext > *, #sedial, #seprog, #home, #back, #where, #site, #hyb, #panel').forEach(e => { if (!e.offsetWidth && !e.offsetHeight) return; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05) return; const r = e.getBoundingClientRect(); if (r.width && r.height) o.push([r.left - 6, r.top - 4, r.right + 6, r.bottom + 4]) }); return o }
  function txtTex(lines, w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    lines.forEach(l => { x.font = l.f; x.fillStyle = l.c || '#e4ebf5'; x.textAlign = 'center'; x.textBaseline = 'middle'; if (l.ls) x.letterSpacing = l.ls; x.fillText(l.s, w / 2, l.y) }); return ctex(c) }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  /* ---------- the anchor ---------- */
  const SEC = SE.mount(THREE, scene, { glowTex: GT, text: $('#setext'), dial: $('#sedial'), measure: $('#semeasure'), prog: $('#seprog'), unlocked: UNL || !!location.hash.slice(1),
    onUnlock: () => { saveUnlock(); html.classList.remove('selocked') }, pickCluster: (x, y) => pick(x, y), onLeave: C => leftSE(C) });
  if (!SEC.unlocked) html.classList.add('selocked'); else saveUnlock();
  /* ---------- six clusters on an orbit around it ---------- */
  const CL = []; let RX = 30, RY = 20, ORB = 0; const ring = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x8fb0e0, transparent: true, opacity: .12, depthWrite: false })); scene.add(ring);
  function build(d) {
    d.chapters.forEach((ch, i) => {
      const g = new THREE.Group(); scene.add(g); const tint = new THREE.Color(...ch.tint.split(',').map(v => +v / 255));
      const n = Math.min(12, Math.max(5, ch.cards.length)), rnd = mulberry(i * 97 + 5), st = [];
      for (let j = 0; j < n; j++) { const a = j / n * 6.283 + rnd() * .7, r = 1.6 + rnd() * 2.6; st.push(new THREE.Vector3(Math.cos(a) * r * 1.25, Math.sin(a) * r * .8, (rnd() - .5) * 2.4)) }
      const sms = st.map((p, j) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: tint, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.copy(p); const k = j === 0 ? 2.4 : 1.2 + rnd(); s.scale.set(k, k, 1); s.userData.k = k; g.add(s); return s });
      const lp = []; for (let j = 0; j < n; j++) { lp.push(st[j], st[(j + 1) % n]); if (j % 3 === 0) lp.push(st[j], st[(j + 2) % n]) }
      const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: tint, transparent: true, opacity: .32, depthWrite: false })); g.add(lines);
      const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: txtTex([{ s: ch.nm, f: '84px "Julius Sans One"', y: 64, ls: '14px' }], 640, 128), transparent: true, depthWrite: false })); lab.position.set(0, 5, 0); lab.scale.set(7.5, 1.5, 1); g.add(lab);
      lab.visible = false; /* the name is now a previews-style label button under the entry star (#cll) */
      /* the entry star: the cluster's first star, bigger, with the previews halo and a white core (its tap target is the label) */
      const en = sms[0]; en.material.map = PG; en.userData.k = 3.6; en.scale.set(3.6, 3.6, 1);
      const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: CT, color: new THREE.Color(1, 1, 1).lerp(tint, .25), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); core.position.copy(st[0]); core.scale.set(.62, .62, 1); g.add(core);
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sl3'; btn.dataset.k = ch.k; btn.innerHTML = '<b></b><small></small>'; btn.querySelector('b').textContent = ch.nm; btn.querySelector('small').textContent = ch.cards.length + (ch.k === 'photo' ? ' · the reel' : ''); btn.setAttribute('aria-label', ch.nm + ', ' + ch.cards.length); CLL.appendChild(btn);
      const C = { k: ch.k, nm: ch.nm, n: ch.cards.length, g: g, st: sms, lab: lab, lines: lines, en: en, core: core, btn: btn, hot: false, a0: i / d.chapters.length * 6.283 + 1.5708, scr: [0, 0, 1] }; CL.push(C);
      btn.addEventListener('click', e => { e.preventDefault(); seen(); if (!SEC.unlocked) return; if (MODE === 'se') { if (SESKY) SEC.leave(C); return } if (FLY) { skipFly(); return } if (FOC === C) openC(C); else aim(C) });
      btn.addEventListener('pointerenter', () => { C.hot = true }); btn.addEventListener('pointerleave', () => { C.hot = false });
      btn.addEventListener('focus', () => { C.hot = true }); btn.addEventListener('blur', () => { C.hot = false });
    });
    layout();
  }
  function layout() {
    const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); tv = Math.tan(cam.fov * Math.PI / 360); th = tv * cam.aspect; U.uPx.value = R.getPixelRatio() * h / 780;
    const D = HOME.d; RX = Math.max(11, Math.min(32, D * th * .68)); RY = Math.max(12, Math.min(24, D * tv * .52));
    const pts = []; for (let j = 0; j < 96; j++) { const a = j / 96 * 6.283; pts.push(new THREE.Vector3(Math.cos(a) * RX, Math.sin(a) * RY, Math.sin(a * 2) * 4)) } ring.geometry.setFromPoints(pts);
    if (FOC) aim(FOC, true); SEC.resize(w / h);
  }
  function cpos(C, out) { const a = C.a0 + ORB; return out.set(Math.cos(a) * RX, Math.sin(a) * RY, Math.sin(a * 2) * 4) }
  /* ---------- camera rig: target + orbit angles + distance ---------- */
  const HOME = { d: 70, el: .3 };
  const clusterDist = () => Math.max(7.5 / (tv * .8), 7 / (th * .9));
  let FOC = null, MODE = 'open';/* open | home | anchor | cluster | reel */
  function setT(p, w) { T[0].t = p.x; T[1].t = p.y; T[2].t = p.z; T.forEach(s => s.w = w) }
  function face(w) { AZ.t = Math.round(AZ.x / 6.283) * 6.283; AZ.w = EL.w = w }
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
  /* the fly-in from the constellation into a chapter: the same aim (target, distance, facing, triggers) as before, but driven
 by one eased 3.2 s approach instead of the springs: slow start, long glide, soft landing, the chapter's stars growing and a
 field of near stars streaming past for depth. A tap (or any key) lands at once. Same motion with Reduce Motion on. */
  const FLY_MS = 3200; let FLY = null;
  const easeFly = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function aim(C, keep) { const from = !keep && (!FOC || MODE === 'home'); FOC = C; MODE = 'cluster'; cpos(C, v3); setT(v3, W_FLY); if (!keep) { DIST.t = clusterDist(); DIST.w = W_FLY; face(W_FLY); EL.t = .08 } showPanel(C); where(C.nm); log('cluster', C.k)
    if (from) startFly(C); else if (!keep && FLY) skipFly() }
  function startFly(C) { endDust(); FLY = { C: C, t0: performance.now(), x: T.map(s => s.x), d: DIST.x, el: EL.x, az: AZ.x, e: 0 };
    /* near stars along the way: from where the camera is to where it will land, offset around the path */
    cpos(C, v3); const ce = Math.cos(EL.t), end = new THREE.Vector3(v3.x + Math.sin(AZ.t) * ce * DIST.t, v3.y + Math.sin(EL.t) * DIST.t, v3.z + Math.cos(AZ.t) * ce * DIST.t), st = cam.position.clone();
    const n = innerWidth < 700 ? 140 : 220, P = new Float32Array(n * 3), dir = end.clone().sub(st), L = dir.length() || 1, ax = dir.clone().normalize(), up = Math.abs(ax.y) > .9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), u1 = new THREE.Vector3().crossVectors(ax, up).normalize(), u2 = new THREE.Vector3().crossVectors(ax, u1).normalize(), rnd = mulberry(7 + CL.indexOf(C));
    for (let i = 0; i < n; i++) { const t = .08 + rnd() * .95, a = rnd() * 6.283, r = 1.2 + Math.pow(rnd(), .6) * Math.max(6, L * .16), p = st.clone().addScaledVector(dir, t).addScaledVector(u1, Math.cos(a) * r).addScaledVector(u2, Math.sin(a) * r); P[i * 3] = p.x; P[i * 3 + 1] = p.y; P[i * 3 + 2] = p.z }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3));
    DUST = new THREE.Points(g, new THREE.PointsMaterial({ map: PG, size: .55, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xdfe9ff, fog: false })); scene.add(DUST); log('fly', C.k) }
  let DUST = null; function endDust() { if (DUST) { scene.remove(DUST); DUST.geometry.dispose(); DUST.material.dispose(); DUST = null } }
  function skipFly() { if (FLY) FLY.t0 = performance.now() - FLY_MS }
  function stepFly(now) { const p = window.__s3hold != null ? window.__s3hold : Math.min(1, (now - FLY.t0) / FLY_MS), /* __s3hold: QA stills only */ e = easeFly(p); FLY.e = e; cpos(FLY.C, v3);
    [v3.x, v3.y, v3.z].forEach((t, i) => { T[i].x = FLY.x[i] + (t - FLY.x[i]) * e; T[i].v = 0 });
    DIST.x = FLY.d + (DIST.t - FLY.d) * e; EL.x = FLY.el + (EL.t - FLY.el) * e; AZ.x = FLY.az + (AZ.t - FLY.az) * e; DIST.v = EL.v = AZ.v = 0;
    if (DUST) DUST.material.opacity = .85 * Math.sin(Math.PI * Math.min(1, p * 1.15));
    if (p >= 1) { FLY = null; endDust() } }
  /* Spirit Eye hands the camera back: the rig starts exactly where the camera is (no jump), then glides */
  const fw = new THREE.Vector3();
  function adopt() { cam.getWorldDirection(fw); const d = Math.max(8, cam.position.length()); const tp = cam.position.clone().addScaledVector(fw, d); T.forEach((q, i) => { q.x = q.t = tp.getComponent(i); q.v = 0 });
    const o = cam.position.clone().sub(tp); DIST.x = DIST.t = o.length(); DIST.v = 0; EL.x = EL.t = Math.asin(Math.max(-1, Math.min(1, o.y / DIST.x))); AZ.x = AZ.t = Math.atan2(o.x, o.z); AZ.v = EL.v = 0 }
  function leftSE(C) { adopt(); if (C) aim(C); else goHome(); }
  function goSE(at) { FLY = null; endDust(); FOC = null; MODE = 'se'; showPanel(null); where(''); cam.getWorldDirection(fw); SEC.enterFrom(cam.position, cam.position.clone().addScaledVector(fw, 20), at); log('se', 1) }
  function goHome(w) { FLY = null; endDust(); FOC = null; MODE = 'home'; setT(v3.set(0, 0, 0), w || W_FLY); DIST.t = HOME.d; DIST.w = w || W_FLY; face(w || W_FLY); EL.t = HOME.el; showPanel(null); where('everything'); log('home', 1) }
  function where(s) { WHERE.textContent = s }
  function showPanel(C) {
    if (!C) { PANEL.hidden = true; return } PANEL.hidden = false; PANEL.querySelector('.n').textContent = C.nm; PANEL.querySelector('.m').textContent = C.n + (C.k === 'photo' ? ' · the reel' : '');
    const a = PANEL.querySelector('a'); a.textContent = C.k === 'photo' ? 'open the reel ›' : 'open ' + C.nm + ' ›'; a.href = C.k === 'photo' ? '#photo' : LINK(C.k); a.dataset.k = C.k }
  PANEL.querySelector('a').addEventListener('click', e => { if (e.currentTarget.dataset.k === 'photo') { e.preventDefault(); reel() } });
  function reel(start) { MODE = 'reel'; PANEL.hidden = true; html.classList.add('reelon'); openReel(start, () => { html.classList.remove('reelon'); history.replaceState(null, '', location.pathname); const C = CL.find(c => c.k === 'photo'); if (C) aim(C); else goHome() }) }
  function openC(C) { if (C.k === 'photo') reel(); else { log('nav', LINK(C.k)); location.href = LINK(C.k) } }
  /* ---------- input: drag = turn around the target, pinch / wheel = distance, tap = fly / open ---------- */
  const cv = $('#c'), PT = new Map(); let drag = null, pinch = null, lastIn = 0;
  function seen() { lastIn = performance.now() }
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (x) {} if (MODE === 'se') { SEC.down(e); return } PT.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now() });
    if (PT.size === 1) drag = { id: e.pointerId, moved: 0 }; else if (PT.size === 2) { drag = null; const a = [...PT.values()]; pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) } } });
  cv.addEventListener('pointermove', e => { if (MODE === 'se') { SEC.move(e); return } const p = PT.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (pinch && PT.size >= 2) { const a = [...PT.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); if (pinch.d > 0 && d > 0) zoom(pinch.d / d); pinch.d = d; return }
    if (drag && drag.id === e.pointerId) { drag.moved += Math.abs(dx) + Math.abs(dy); if (drag.moved < 6) return; seen(); const f = innerHeight / 2 / tv;
      AZ.t -= dx / f * 1.4; AZ.x = AZ.t; AZ.v = 0; EL.t = Math.max(-.7, Math.min(1.1, EL.t + dy / f * 1.2)); EL.x = EL.t; EL.v = 0 } });
  function up(e) { if (MODE === 'se') { SEC.up(e); return } const p = PT.get(e.pointerId); if (!p) return; PT.delete(e.pointerId); if (pinch) { if (PT.size < 2) pinch = null; drag = null; return }
    if (drag && drag.id === e.pointerId && drag.moved < 10 && performance.now() - p.t0 < 400) tap(e.clientX, e.clientY); drag = null }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  ['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => cv.addEventListener(t, e => e.preventDefault(), { passive: false }));
  cv.addEventListener('wheel', e => { e.preventDefault(); if (MODE === 'se') { SEC.wheel(e); return } const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1); zoom(Math.exp((e.ctrlKey ? dy * .01 : dy * .0015))) }, { passive: false });
  function zoom(k) { seen(); DIST.t = Math.max(3.5, Math.min(170, DIST.t * k)); DIST.w = 6;
    if (k > 1.001 && FOC && DIST.t > clusterDist() * 2.2) goHome(); }
  function scr(p) { v4.copy(p).project(cam); return [(v4.x + 1) / 2 * innerWidth, (1 - v4.y) / 2 * innerHeight, v4.z] }
  function pick(x, y) { let best = null, bd = 1e9; if (!SEC.unlocked) return null; CL.forEach(C => { const s = C.scr, d = Math.hypot(s[0] - x, s[1] - y), lim = Math.max(60, Math.min(160, 900 / Math.max(1, cam.position.distanceTo(C.g.position)) * 6)); if (s[2] < 1 && d < lim && d < bd) { bd = d; best = C } }); return best }
  function onAnchor(x, y) { return SEC.hit(x, y, cam) }
  function tap(x, y) { seen(); if (FLY) { skipFly(); return } const C = pick(x, y);
    if (C) { if (FOC === C) openC(C); else aim(C); return }
    if (onAnchor(x, y)) { goSE(null); return }
    if (MODE !== 'home') goHome() }
  /* Home is always there: in Spirit Eye it goes back to page 1 (or, once the chapters are open, out to the sky); elsewhere to the sky */
  HOMEB.addEventListener('click', () => { if (window.GJ3_REEL.isOpen) window.GJ3_REEL.close(); if (MODE === 'se') SEC.home(); else goHome() });
  /* Back is always one step: one page in Spirit Eye; chapter -> sky; sky -> back into Spirit Eye at its last step */
  BACKB.addEventListener('click', () => { if (window.GJ3_REEL.isOpen) { window.GJ3_REEL.close(); return } if (MODE === 'se') SEC.go(-1); else if (FOC) goHome(); else goSE(SEC.NS - 1) });
  $('#seprog .nx').addEventListener('click', () => { if (MODE === 'se') SEC.go(1) });
  addEventListener('keydown', e => { if (window.GJ3_REEL.isOpen) return; if (MODE === 'se') { SEC.key(e); return } seen(); if (FLY) { skipFly(); e.preventDefault(); return } if (e.key === 'Escape' || e.key === 'Home') goHome();
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const i = FOC ? CL.indexOf(FOC) : -1, n = CL.length; aim(CL[(i + (e.key === 'ArrowRight' ? 1 : n - 1) + (i < 0 && e.key === 'ArrowLeft' ? 1 : 0)) % n]) }
    else if (e.key === 'Enter' && FOC) openC(FOC) });
  /* ---------- loop ---------- */
  let last = performance.now(), fc = 0, ft = last, fps = 0;
  function frame(now) { requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now; fc++; if (now - ft >= 1000) { fps = fc * 1000 / (now - ft); fc = 0; ft = now }
    U.uT.value = now / 1000; ORB += dt * .0065; /* one slow orbit every ~16 min */
    if (MODE === 'se' && !SEC.active) MODE = 'home';
    if (html.classList.contains('sem') !== (MODE === 'se')) html.classList.toggle('sem', MODE === 'se');
    if (MODE === 'se') { SEC.update(now, cam); cam.updateMatrixWorld() } else {
    if (FOC) { cpos(FOC, v3); T[0].t = v3.x; T[1].t = v3.y; T[2].t = v3.z }
    if (FLY && FOC === FLY.C) stepFly(now); else { if (FLY) { FLY = null; endDust() } T.forEach(s => sstep(s, dt)); if (!drag) { sstep(AZ, dt); sstep(EL, dt) } sstep(DIST, dt) }
    const ce = Math.cos(EL.x); cam.position.set(T[0].x + Math.sin(AZ.x) * ce * DIST.x, T[1].x + Math.sin(EL.x) * DIST.x, T[2].x + Math.cos(AZ.x) * ce * DIST.x);
    cam.lookAt(T[0].x, T[1].x, T[2].x); cam.updateMatrixWorld(); SEC.update(now, cam) }
    const reelOn = MODE === 'reel' && window.GJ3_REEL.isOpen; SEC.group.visible = !reelOn; ring.visible = !reelOn && SEC.unlocked;
    SESKY = MODE === 'se' && SEC.unlocked && SEC.st().k === 'sky'; if (!(++OBF % 8)) OBS = obstacles(); const placed = [];
    CL.forEach(C => { cpos(C, C.g.position); C.g.visible = !reelOn && SEC.unlocked; C.g.quaternion.copy(cam.quaternion); C.scr = scr(C.g.position);
      const d = cam.position.distanceTo(C.g.position), on = FOC === C; C.lab.material.opacity = .6 + .4 * Math.min(1, 60 / d); C.lines.material.opacity = on ? .55 : .3;
      const grow = on ? 1 + .25 * (FLY && FLY.C === C ? FLY.e : 1) : 1, hot = C.hot && !on ? 1.3 : 1;
      C.st.forEach((s, j) => { const k = s.userData.k * grow * (j === 0 ? hot : 1); s.scale.set(k, k, 1) }); C.core.scale.set(.62 * grow * hot, .62 * grow * hot, 1); C.core.visible = C.g.visible;
      /* the label button sits under the entry star, previews style; hidden in Spirit Eye, the reel, behind the camera and off screen */
      v4.set(0, -4.6, 0).applyQuaternion(C.g.quaternion).add(C.g.position); const q = scr(v4), b = C.btn, vis = C.g.visible && (MODE !== 'se' || SESKY) && q[2] < 1 && q[0] > -40 && q[0] < innerWidth + 40 && q[1] > 40 && q[1] < innerHeight - 30 && !(on && !FLY) && !(FLY && FLY.C !== C);
      let x = 0, y = 0, ok = vis;
      if (vis) { /* no collisions: under the constellation, else above it, else beside it, else hidden (the Spirit Eye tagline, dial and bar win) */
        const bw = b.offsetWidth || 96, bh = b.offsetHeight || 46; x = Math.round(Math.max(4, Math.min(innerWidth - bw - 4, q[0] - bw / 2)));
        v4.set(0, 4.2, 0).applyQuaternion(C.g.quaternion).add(C.g.position); const qa = scr(v4);
        const cx = C.scr[0], cy = C.scr[1] - bh / 2, sx = Math.abs(q[1] - C.scr[1]) + bw / 2;
        ok = false; for (const [xx, yy] of [[x, q[1]], [x, qa[1] - bh], [cx + sx - bw / 2, cy], [cx - sx - bw / 2, cy]]) { const r = [Math.round(xx), yy, Math.round(xx) + bw, yy + bh]; if (yy < 40 || yy + bh > innerHeight - 4 || r[0] < 4 || r[2] > innerWidth - 4) continue; if (OBS.concat(placed).some(o => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1])) continue; x = r[0]; y = Math.round(yy); placed.push(r); ok = true; break } }
      if (b.hidden === ok) b.hidden = !ok; if (ok) { b.style.transform = `translate(${x}px,${y}px)`; b.style.opacity = FLY && FLY.C === C ? String(Math.max(0, 1 - FLY.e * 1.6)) : '' } });
    R.render(scene, cam) }
  addEventListener('resize', layout);
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h === 'photo') { if (!window.GJ3_REEL.isOpen) reel(0) } else { const C = CL.find(c => c.k === h); if (C) { if (window.GJ3_REEL.isOpen) window.GJ3_REEL.close(); aim(C) } } });
  Promise.all([dataP, document.fonts.load('84px "Julius Sans One"').catch(() => 0)]).then(a => {
    build(a[0]);
    const h = location.hash.slice(1), C0 = CL.find(c => c.k === h);
    if (h === 'photo') { SEC.leave(); T.forEach(s => s.x = s.t); DIST.x = DIST.t; EL.x = EL.t; reel(0) }
    else if (C0) { SEC.leave(); DIST.x = DIST.t; EL.x = EL.t; aim(C0) }
    else { MODE = 'se'; where('') } /* Spirit Eye first; the viewer drives everything from here */
    requestAnimationFrame(frame); html.classList.add('ready'); log('ready', CL.length) }).catch(e => { console.warn(e); fallback() });
  window.__s3 = { st: () => ({ fly: FLY ? +FLY.e.toFixed(3) : null, mode: MODE, se: SEC.st(), foc: FOC && FOC.k, dist: +DIST.x.toFixed(2), distT: +DIST.t.toFixed(2), el: +EL.x.toFixed(3), az: +AZ.x.toFixed(3), fps: Math.round(fps), stars: NSTAR, cl: CL.map(C => ({ k: C.k, x: Math.round(C.scr[0]), y: Math.round(C.scr[1]), z: +C.scr[2].toFixed(3) })), anchor: scr(new THREE.Vector3(0, 0, 0)).map(v => +v.toFixed(2)), reel: window.GJ3_REEL.isOpen }),
    log: LOG, home: () => goHome(), se: SEC, goSE: goSE, aim: k => aim(CL.find(c => c.k === k)) };
}
window.__s3log = LOG;
