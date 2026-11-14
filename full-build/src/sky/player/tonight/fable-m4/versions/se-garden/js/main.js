/* se3 standalone: v2's sky (starfield shader, FogExp2, PerspectiveCamera) around the Spirit Eye only. No chapter clusters, no orbit. */
import * as SE from './spirit-eye.js';
const html = document.documentElement, $ = s => document.querySelector(s);
/* ---------- end gallery (parts/gallery/gallery.js behaviour: tap opens large; Back, Esc, browser Back return to the grid) ---------- */
(function gallery() {
  const cells = Array.from(document.querySelectorAll('#segal .cell')), viewer = $('#viewer'), full = $('#full'), lab = $('#lab'), back = $('#gback');
  let openI = -1, pushed = false;
  function open(i, push) { if (i < 0 || i >= cells.length) return; openI = i; const p = cells[i].dataset.page; full.src = cells[i].dataset.full; full.alt = 'PDF page ' + p; 
    viewer.classList.add('on'); viewer.setAttribute('aria-hidden', 'false'); html.classList.add('galbig'); back.focus({ preventScroll: true }); if (push) { history.pushState({ seGallery: p }, '', '#p' + p); pushed = true } }
  function close(fromPop) { viewer.classList.remove('on'); viewer.setAttribute('aria-hidden', 'true'); html.classList.remove('galbig'); openI = -1;
    if (!fromPop && pushed) { pushed = false; history.back(); return } if (!fromPop && location.hash) history.replaceState(null, '', location.pathname + location.search); pushed = false }
  cells.forEach((c, i) => c.addEventListener('click', () => open(i, true)));
  back.addEventListener('click', () => close(false));
  addEventListener('keydown', e => { if (openI < 0) return; e.stopImmediatePropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(false) }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = Math.max(0, Math.min(cells.length - 1, openI + (e.key === 'ArrowRight' ? 1 : -1))); if (n !== openI) { history.replaceState({ seGallery: cells[n].dataset.page }, '', '#p' + cells[n].dataset.page); open(n, false); pushed = true } } }, true);
  addEventListener('popstate', e => { const p = e.state && e.state.seGallery; if (p) { pushed = true; open(cells.findIndex(c => c.dataset.page === String(p)), false) } else { pushed = false; if (openI >= 0) close(true) } });
  const m0 = location.hash.match(/^#p(\d+)$/); if (m0) { const i = cells.findIndex(c => c.dataset.page === m0[1]); if (i >= 0) { history.replaceState({ seGallery: m0[1] }, '', location.hash); pushed = true; open(i, false) } }
  window.__gal = { open: i => open(i, true), get isOpen() { return openI >= 0 } };
})();
function fallback() { html.classList.add('nogl'); SE.fallback($('#fb')) }
let THREE = null;
if (html.classList.contains('nogl')) fallback();
else { try { THREE = await import('../vendor/three.module.min.js'); start() } catch (e) { console.warn(e); fallback() } }
function start() {
  let R; try { R = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: true, powerPreference: 'high-performance' }) } catch (e) { fallback(); return }
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setClearColor(0x04060c, 1);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x04060c, .0042);
  const cam = new THREE.PerspectiveCamera(60, 1, .1, 1200);
  const U = { uT: { value: 0 }, uPx: { value: 1 } };
  function starField(n) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), ph = new Float32Array(n), sz = new Float32Array(n), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = 45 + Math.pow(Math.random(), .6) * 380, s = Math.sqrt(1 - u * u);
      p[i * 3] = Math.cos(a) * s * r; p[i * 3 + 1] = Math.abs(u) * r * .8 + 6; p[i * 3 + 2] = Math.sin(a) * s * r; ph[i] = Math.random();
      sz[i] = Math.random() < .05 ? 3.2 + Math.random() * 2.5 : .9 + Math.random() * 1.6; const t = Math.random();
      col[i * 3] = .75 + .25 * t; col[i * 3 + 1] = .82 + .1 * t; col[i * 3 + 2] = 1 - .15 * t * t }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1)); g.setAttribute('aSz', new THREE.BufferAttribute(sz, 1)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aPh;attribute float aSz;attribute vec3 aCol;uniform float uT,uPx;varying float vA;varying vec3 vC;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float d=max(.1,-mv.z);float tw=1.+.5*sin(uT*(1.1+aPh*2.3)+aPh*60.)*step(.55,fract(aPh*7.));
        gl_PointSize=clamp(aSz*uPx*tw*170./d,1.2,30.);vA=1.7*exp(-d*.0042)*smoothstep(.5,6.,d)*(.7+.3*tw);vC=aCol;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);a*=a;gl_FragColor=vec4(vC*a*vA,1.);}` });
    return new THREE.Points(g, m) }
  const stars = starField(innerWidth < 700 ? 2600 : 4200); scene.add(stars);
  function glowTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t }
  const GT = glowTex();
  [[-90, 40, -260, 0x27407a, 220], [120, 30, 160, 0x4a2a6a, 260], [10, 50, -120, 0x173c4a, 160]].forEach(n => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: n[3], transparent: true, opacity: .2, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.position.set(n[0], n[1], n[2]); s.scale.set(n[4], n[4], 1); scene.add(s) });
  const SEC = SE.mount(THREE, scene, { glowTex: GT, tell: $('#setell'), call: $('#secall'), lines: $('#selines'), gal: $('#segal'), dial: $('#sedial'), pg: $('#sepg'), ...(window.__SEX || {}) });
  if (window.__SEX && window.__SEX.mounted) window.__SEX.mounted(SEC, cam, R);
  function layout() { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); U.uPx.value = R.getPixelRatio() * h / 780; SEC.resize(w / h) }
  const cv = $('#c');
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (x) {} SEC.down(e) });
  cv.addEventListener('pointermove', e => SEC.move(e)); cv.addEventListener('pointerup', e => SEC.up(e)); cv.addEventListener('pointercancel', e => SEC.up(e));
  ['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => cv.addEventListener(t, e => e.preventDefault(), { passive: false }));
  addEventListener('wheel', e => { if (window.__gal.isOpen) return; SEC.wheel(e) }, { passive: true });
  addEventListener('keydown', e => SEC.key(e));
  $('#next').addEventListener('click', () => SEC.go(1)); $('#prev').addEventListener('click', () => SEC.go(-1));
  addEventListener('resize', layout); layout();
  const stopKey = (new URLSearchParams(location.search)).get('stop');
  const named = (location.hash.match(/^#([a-z][a-z0-9-]*)$/i) || [])[1];
  const key = stopKey || named;
  const byKey = key ? SEC.STOPS.findIndex(st => st.k === key) : -1;
  const m = location.hash.match(/^#s(\d+)$/);
  if (m) SEC.jump(Math.min(SEC.NS - 1, +m[1]));
  else if (byKey >= 0) SEC.jump(byKey);
  else if (/^#p(2[6-9]|3[0-2])$/.test(location.hash)) SEC.jump(SEC.NS - 1);
  let last = performance.now();
  function frame(now) { requestAnimationFrame(frame); U.uT.value = now / 1000; SEC.update(now, cam); R.render(scene, cam) }
  document.fonts.ready.then(() => { requestAnimationFrame(frame); html.classList.add('ready') });
  window.__se = { st: SEC.st, go: SEC.go, jump: SEC.jump, log: SEC.log, SEC };
}
