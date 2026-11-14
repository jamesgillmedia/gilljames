/* se3 standalone: v2's sky (starfield shader, FogExp2, PerspectiveCamera) around the Spirit Eye only. No chapter clusters, no orbit. */
import * as SE from './spirit-eye.js?v=se-gf4';
import * as ATMOS from './atmos.js?v=se-gf4';
const html = document.documentElement, $ = s => document.querySelector(s);
/* ---------- end gallery (parts/gallery/gallery.js behaviour: tap opens large; Back, Esc, browser Back return to the grid) ---------- */
(function gallery() {
  const cells = Array.from(document.querySelectorAll('#segal .cell')), viewer = $('#viewer'), full = $('#full'), lab = $('#lab'), back = $('#gback');
  let openI = -1, pushed = false;
  function open(i, push) { if (i < 0 || i >= cells.length) return; openI = i; const p = cells[i].dataset.page;
    /* the sheet waits dark on its mat and fades in once this page is decoded (never the page before it) */
    const src = cells[i].dataset.full, shown = () => { if (full.getAttribute('src') === src) full.classList.add('in') };
    full.classList.remove('in'); full.src = src; full.alt = 'PDF page ' + p; if (full.decode) full.decode().then(shown, shown); else full.onload = shown;
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
const DN_KEY = 'gj.se.daynight';
function clampDN(v) { v = +v; return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0 }
function loadDN() { try { const s = localStorage.getItem(DN_KEY); if (s != null && s !== '') return clampDN(+s) } catch (e) {} return 0 }
let dayN = loadDN();
function dayWord(v) { return v < .28 ? 'night' : v < .7 ? 'dusk' : 'day' }
function syncDN(v) {
  dayN = clampDN(v);
  const pct = String(Math.round(dayN * 100));
  const a = $('#dn'), b = $('#dn-dbg'), w = $('#dn-val');
  if (a && a.value !== pct) a.value = pct;
  if (b && b.value !== pct) b.value = pct;
  if (w) w.textContent = dayWord(dayN);
}
function saveDN() { try { localStorage.setItem(DN_KEY, String(Math.round(dayN * 100) / 100)) } catch (e) {} }
if (/(?:^|[?&])debug=1(?:&|$)/.test(location.search)) html.classList.add('debug');
let THREE = null;
if (html.classList.contains('nogl')) fallback();
else { try { THREE = await import('../vendor/three.module.min.js'); start() } catch (e) { console.warn(e); fallback() } }
function start() {
  let R; try { R = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: true, powerPreference: 'high-performance' }) } catch (e) { fallback(); return }
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setClearColor(0x04060c, 1);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x04060c); scene.fog = new THREE.FogExp2(0x04060c, .0042);
  const cam = new THREE.PerspectiveCamera(60, 1, .1, 1200);
  const U = { uT: { value: 0 }, uPx: { value: 1 }, uDay: { value: dayN }, uStar: { value: 1 } };
  const AMB = window.__seAmb = window.__seAmb || { glow: 1, star: 1, haze: 1 };
  const fogNight = new THREE.Color(0x04060c), fogDusk = new THREE.Color(0x2a2438), fogDay = new THREE.Color(0x79b4d8);
  const fogC = new THREE.Color();
  function starField(n) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), ph = new Float32Array(n), sz = new Float32Array(n), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.283, r = 45 + Math.pow(Math.random(), .6) * 380, s = Math.sqrt(1 - u * u);
      p[i * 3] = Math.cos(a) * s * r; p[i * 3 + 1] = Math.abs(u) * r * .8 + 6; p[i * 3 + 2] = Math.sin(a) * s * r; ph[i] = Math.random();
      sz[i] = Math.random() < .05 ? 3.2 + Math.random() * 2.5 : .9 + Math.random() * 1.6; const t = Math.random();
      col[i * 3] = .75 + .25 * t; col[i * 3 + 1] = .82 + .1 * t; col[i * 3 + 2] = 1 - .15 * t * t }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1)); g.setAttribute('aSz', new THREE.BufferAttribute(sz, 1)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aPh;attribute float aSz;attribute vec3 aCol;uniform float uT,uPx,uDay,uStar;varying float vA;varying vec3 vC;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float d=max(.1,-mv.z);float tw=1.+.5*sin(uT*(1.1+aPh*2.3)+aPh*60.)*step(.55,fract(aPh*7.));
        gl_PointSize=clamp(aSz*uPx*tw*170./d,1.2,30.);vA=uStar*1.7*exp(-d*.0042)*smoothstep(.5,6.,d)*(.7+.3*tw)*(1.-smoothstep(.05,.42,uDay));vC=aCol;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);a*=a;gl_FragColor=vec4(vC*a*vA,1.);}` });
    return new THREE.Points(g, m) }
  const stars = starField(innerWidth < 700 ? 2600 : 4200); scene.add(stars);
  function glowTex() { return ATMOS.glowTex(THREE) }
  const GT = glowTex();
  const nebulas = [];
  [[-90, 40, -260, 0x152030, 220], [120, 30, 160, 0x181420, 260], [10, 50, -120, 0x101820, 160]].forEach(n => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: n[3], transparent: true, opacity: .035, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.position.set(n[0], n[1], n[2]); s.scale.set(n[4], n[4], 1); scene.add(s); nebulas.push(s) });
  const skyU = { uDay: { value: dayN } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(520, 32, 20), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float uDay;varying vec3 vP;void main(){
      float y=clamp(normalize(vP).y*.5+.5,0.,1.);
      vec3 nH=vec3(.016,.024,.047), nT=vec3(.012,.016,.035);
      vec3 kH=vec3(.55,.28,.22), kT=vec3(.18,.14,.28);
      vec3 dH=vec3(.67,.82,.92), dT=vec3(.35,.62,.88);
      vec3 night=mix(nH,nT,pow(y,.7)), dusk=mix(kH,kT,pow(y,.85)), dayc=mix(dH,dT,pow(y,1.05));
      vec3 col=mix(night,dusk,smoothstep(.08,.48,uDay));
      col=mix(col,dayc,smoothstep(.42,.95,uDay));
      gl_FragColor=vec4(col,1.);}` }));
  sky.renderOrder = -2; scene.add(sky);
  function cloudTex() { return ATMOS.cloudTex(THREE) }
  const CT = cloudTex();
  const clouds = [];
  const nCloud = innerWidth < 700 ? 6 : 8;
  for (let i = 0; i < nCloud; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: CT, color: 0xf2f4f8, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    const a = i / nCloud * 6.283 + .4, r = 70 + (i % 3) * 28, y = 22 + (i % 4) * 8;
    s.position.set(Math.cos(a) * r, y, Math.sin(a) * r); s.scale.set(48 + (i % 3) * 18, 22 + (i % 3) * 8, 1); scene.add(s); clouds.push(s);
  }
  function paintSky(day) {
    U.uDay.value = day; skyU.uDay.value = day;
    const u = day;
    if (u < .45) fogC.copy(fogNight).lerp(fogDusk, u / .45); else fogC.copy(fogDusk).lerp(fogDay, (u - .45) / .55);
    R.setClearColor(fogC, 1); scene.fog.color.copy(fogC);
    nebulas.forEach(s => { s.material.opacity = .035 * (1 - Math.min(1, day / .45)) });
    const cA = Math.max(0, Math.sin(Math.min(1, day) * Math.PI)) * (day < .95 ? .42 : .12);
    clouds.forEach((s, i) => { s.material.opacity = cA * (.55 + .45 * ((i % 3) / 2)); s.visible = cA > .02 });
    stars.visible = day < .5;
    /* at night the sky dome stays off, so the scene matches today's look exactly */
    sky.visible = day > .02;
  }
  let ATM = null;
  const SEC = SE.mount(THREE, scene, { onPlan: m => { if (ATM) ATM.adopt(m) }, glowTex: GT, poolTex: () => ATMOS.poolTex(THREE), tell: $('#setell'), call: $('#secall'), lines: $('#selines'), gal: $('#segal'), dial: $('#sedial'), pg: $('#sepg'), dayNight: () => dayN, ...(window.__SEX || {}) });
  if (window.__SEX && window.__SEX.mounted) window.__SEX.mounted(SEC, cam, R);
  /* spaces-1113: fog + breathing shafts through the fibre column, and Red (plan drawings and fibre ends glow; photos keep true colour) */
  ATM = ATMOS.mountAtmos(THREE, scene, SEC.group, { renderer: R, repaint: () => { if (typeof paintSky === 'function') paintSky(dayN); else { R.setClearColor(0x04060c, 1); scene.fog.color.set(0x04060c) } } });
  { const T = window.GJ_THEME, VV = window.GJ_VARIANT; ATM.setVariant(VV ? VV.v : 'A'); if (VV) VV.on(v => ATM.setVariant(v));
    ATM.setRed(!!(T && T.eff === 'red')); if (T) T.on(() => ATM.setRed(T.eff === 'red'));
    ATM.setLine(html.classList.contains('se-line')) } /* the dev "night line" row (room.js) may have been chosen before the scene was up */
  function layout() { const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); U.uPx.value = R.getPixelRatio() * h / 780; SEC.resize(w / h) }
  const cv = $('#c');
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (x) {} SEC.down(e) });
  cv.addEventListener('pointermove', e => SEC.move(e)); cv.addEventListener('pointerup', e => SEC.up(e)); cv.addEventListener('pointercancel', e => SEC.up(e));
  ['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => cv.addEventListener(t, e => e.preventDefault(), { passive: false }));
  addEventListener('wheel', e => { if (window.__gal.isOpen) return; SEC.wheel(e) }, { passive: true });
  addEventListener('keydown', e => SEC.key(e));
  $('#next').addEventListener('click', () => SEC.go(1)); $('#prev').addEventListener('click', () => SEC.go(-1));
  addEventListener('resize', layout); layout();
  function applyDay(v, save) { syncDN(v); paintSky(dayN); if (save !== false) saveDN() }
  function bindDN(el) {
    if (!el) return;
    const stop = e => { e.stopPropagation(); e.stopImmediatePropagation() };
    ['pointerdown', 'pointerup', 'pointermove', 'click', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'wheel'].forEach(ev => el.addEventListener(ev, stop));
    el.addEventListener('input', () => applyDay((+el.value) / 100, false));
    el.addEventListener('change', () => applyDay((+el.value) / 100, true));
  }
  bindDN($('#dn')); bindDN($('#dn-dbg'));
  /* the debug strip itself must not count as a tap-to-dismiss */
  ['#daynight', '#sedbg'].forEach(sel => { const el = $(sel); if (el) ['pointerdown', 'pointerup', 'click'].forEach(ev => el.addEventListener(ev, e => e.stopPropagation())) });
  applyDay(dayN, false);
  const stopKey = (new URLSearchParams(location.search)).get('stop');
  const named = (location.hash.match(/^#([a-z][a-z0-9-]*)$/i) || [])[1];
  const key = stopKey || named;
  const byKey = key ? SEC.STOPS.findIndex(st => st.k === key) : -1;
  const m = location.hash.match(/^#s(\d+)$/);
  if (m) SEC.jump(Math.min(SEC.NS - 1, +m[1]));
  else if (byKey >= 0) SEC.jump(byKey);
  else if (/^#p(2[6-9]|3[0-2])$/.test(location.hash)) SEC.jump(SEC.NS - 1);
  let last = performance.now();
  /* ambience: glow scales every additive light (sun, halo, light front, pool, motes) at draw time only; stars and haze are their own */
  let glowMats = null;
  function collectGlow() { glowMats = []; scene.traverse(o => { const m = o.material; if (!m || m === stars.material || m.isShaderMaterial) return; (Array.isArray(m) ? m : [m]).forEach(x => { if (x.blending === THREE.AdditiveBlending && glowMats.indexOf(x) < 0) glowMats.push(x) }) }) }
  function frame(now) { requestAnimationFrame(frame); U.uT.value = now / 1000; SEC.update(now, cam); ATM.update(now, cam, SEC.st().F);
    U.uStar.value = AMB.star; scene.fog.density = .0042 * AMB.haze;
    if (!glowMats || (now | 0) % 60 === 0) collectGlow();
    const k = AMB.glow, keep = k !== 1 ? glowMats.map(m => m.opacity) : null; if (keep) glowMats.forEach(m => { m.opacity *= k });
    R.render(scene, cam); if (keep) glowMats.forEach((m, j) => { m.opacity = keep[j] }) }
  document.fonts.ready.then(() => { requestAnimationFrame(frame); html.classList.add('ready') });
  window.__se = { atmos: ATM, st: SEC.st, go: SEC.go, jump: SEC.jump, log: SEC.log, SEC, setDay(v, save) { applyDay(v, save !== false) }, get day() { return dayN } };
}
