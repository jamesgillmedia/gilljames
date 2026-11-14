/* Spirit Eye of skwácháýs · full PDF path (local branch se-full-pdf, from save 2).
 The whole Spirit Eye PDF (32 pages, Jul 11 2025) revealed one page per step, in the PDF's own order, around Gill's C+A combination:
 C: the spindle whorl is the circular control; the sun mark "moves with the sun" (p.6) one step per page, once around the whorl.
 A: the camera travels at the key sectors: into the eye (p.5), across the water (pp.10-14), down the column of light (pp.15-16),
 the held light beat (no text, held until the next drag), into the garden (pp.17-23), back up to the surface, out to the sketches,
 then the sky where the six chapters open.
 Rules: one drag / swipe / wheel gesture / key = exactly one step (never more); text only once the camera is still; nothing
 auto-advances; the camera is still on load; silent; Reduce Motion is the same (all motion is driven by the visitor).
 Every word comes from js/se-pages.js (verbatim PDF text). UI copy is limited to the progress marker and the arrival / sky hints. */
import { PAGES } from './se-pages.js';
const BASE = new URL('../', import.meta.url).href; /* 3d/ */
const IMG = n => BASE + 'media/spirit-eye/s2/' + n + '.webp';
const PIMG = (n, small) => BASE + 'media/spirit-eye/pdf/' + n + (small ? '-s' : '') + '.webp';
export const data = { title: 'spirit eye', byline: 'joshua ngenda & gill james', page: BASE + '../space/spirit-eye/' };
/* sectors: [key, camera pos, look, whorl-relative (pushed back on narrow screens)] */
const SECT = {
  arrival: [[0, 13, 7.5], [0, .6, 0], 1], land: [[-9, 3.2, 9], [0, 1.2, -3], 1], makers: [[-12, 5.5, -8], [0, 1.2, 0], 1],
  eye: [[0, 3.4, 1.2], [0, -4, -.3], 0], sun: [[12, 6, -10], [0, 1.2, 0], 1], water: [[15, 1.3, 13], [-6, 1.5, -12], 1],
  column: [[.8, -9, 1.6], [0, -24, 0], 0], light: [[5.6, -27.5, 10.5], [0, -36.6, 0], 0], garden: [[8, -35, 11], [0, -34, 0], 0],
  surface: [[-14, 4, 12], [0, 1, 0], 1], sketches: [[0, 8, 26], [0, .6, 0], 1], sky: [[0, 11, 44], [0, .6, 0], 1]
};
const SECT_OF = n => n === 1 ? 'arrival' : n === 2 ? 'land' : n <= 4 ? 'makers' : n === 5 ? 'eye' : n <= 9 ? 'sun' : n <= 14 ? 'water' : n <= 16 ? 'column' : n <= 23 ? 'garden' : n <= 25 ? 'surface' : 'sketches';
/* waypoints the camera passes between sectors (not stops): [after sector, pos, look] */
const WAY = { water: [[[.6, 3.6, 1.4], [0, -6, -.2]]], garden: [[[1.2, -20, 1.6], [0, 2, 0]], [[.5, 2.4, 2.2], [0, 8, 9]]] };
export const STEPS = [];
PAGES.forEach(pg => { STEPS.push({ k: 'page', n: pg.n, pg: pg, sec: SECT_OF(pg.n) }); if (pg.n === 16) STEPS.push({ k: 'light', sec: 'light' }) });
STEPS.push({ k: 'sky', sec: 'sky' });
const NS = STEPS.length, UNLOCK = NS - 1, LIGHT = STEPS.findIndex(x => x.k === 'light');
const SEC_START = []; STEPS.forEach((st, i) => { if (!i || STEPS[i - 1].sec !== st.sec) SEC_START.push(i) });
const EASE = bez(0.22, 1, 0.36, 1), T_GLIDE = 650, T_BACK = 300, T_ENTER = 1200;
function bez(x1, y1, x2, y2) {
  const cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t, dcb = (t, a, b) => 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s } return cb(Math.max(0, Math.min(1, t)), y1, y2) };
}
const mod = (a, n) => ((a % n) + n) % n, clampS = x => Math.max(0, Math.min(NS - 1, x));
const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
/* the text panel for one step: only PDF words (plus the two hints) */
export function stepHTML(st, small) {
  let o = '', i = 0; const d = () => ` style="transition-delay:${(Math.min(i++, 6) * .3).toFixed(2)}s"`;
  if (st.k === 'sky') return `<p class="hint"${d()}>the six chapters are open · tap one</p>`;
  const pg = st.pg; if (!pg) return '';
  if (pg.h) o += `<h2${d()}>${esc(pg.h)}</h2>`;
  if (pg.by) o += `<p class="by"${d()}>${esc(pg.by)}</p>`;
  (pg.sub || []).forEach(x => o += `<p class="sub"${d()}>${esc(x)}</p>`);
  if (pg.note) o += `<p class="note"${d()}>${esc(pg.note)}</p>`;
  (pg.p || []).forEach(x => o += `<p${d()}>${esc(x)}</p>`);
  (pg.pairs || []).forEach(x => o += `<p class="pair"${d()}><b>${esc(x[0])}</b>${x[1] ? '<br>' + esc(x[1]) : ''}</p>`);
  if (pg.list) { o += '<ul class="cv">'; pg.list.forEach(x => o += `<li${d()}>${esc(x)}</li>`); o += '</ul>' }
  if (pg.plants) o += `<ul class="plants"${d()}>` + pg.plants.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>';
  if (pg.pimg) { const im = pg.img.find(x => x[0] === pg.pimg) || [0, 4, 3]; o += `<img class="pimg"${d()} src="${PIMG(pg.pimg, small)}" width="${im[1]}" height="${im[2]}" alt="" draggable="false">` } /* size known before load, so the panel can be measured */
  if (pg.n === 1) o += `<p class="hint"${d()}>swipe or drag to move with the sun, one page at a time · the six chapters open after page 32</p>`;
  return o;
}
export function mount(THREE, scene, ctx) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const g = new THREE.Group(); scene.add(g);
  const LOADER = new THREE.TextureLoader();
  const tex = (url, cb) => LOADER.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (cb) cb(t) });
  /* ---------- camera path: one pose per step, sub-steps orbit a little around the sector's look point ---------- */
  const PATH = []; /* [pos, look, step or -1, rel] */
  const SUBD = .13;
  STEPS.forEach((st, i) => {
    const S = SECT[st.sec], first = SEC_START.filter(x => x <= i).pop(), m = (SEC_START.find(x => x > i) || NS) - first, j = i - first;
    const p = V(...S[0]), l = V(...S[1]), a = (j - (m - 1) / 2) * SUBD;
    const ox = p.x - l.x, oz = p.z - l.z; p.x = l.x + ox * Math.cos(a) - oz * Math.sin(a); p.z = l.z + ox * Math.sin(a) + oz * Math.cos(a);
    PATH.push([p, l, i, S[2]]);
    const nxt = STEPS[i + 1]; if (nxt && nxt.sec !== st.sec && WAY[st.sec]) WAY[st.sec].forEach(w => PATH.push([V(...w[0]), V(...w[1]), -1, 0]));
  });
  let K = 1, P = [];
  function layoutPath(aspect) {
    K = Math.max(1, Math.min(1.9, 1 / (aspect * 1.25)));
    P = PATH.map(([p, l, s, rel]) => ({ p: rel ? l.clone().add(p.clone().sub(l).multiplyScalar(K)) : p.clone(), l: l.clone(), s: s }));
  }
  const SIDX = []; PATH.forEach((q, i) => { if (q[2] >= 0) SIDX[q[2]] = i });
  function pathU(s) { s = clampS(s); const i = Math.min(NS - 2, Math.floor(s)), f = s - i; return SIDX[i] + f * (SIDX[i + 1] - SIDX[i]) }
  function cr(p0, p1, p2, p3, t, out) { const t2 = t * t, t3 = t2 * t; return out.set(
    .5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    .5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    .5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)) }
  function poseAt(s, pos, look) { const u = pathU(s), n = P.length, i = Math.min(n - 2, Math.floor(u)), t = u - i, q = j => P[Math.max(0, Math.min(n - 1, j))];
    cr(q(i - 1).p, q(i).p, q(i + 1).p, q(i + 2).p, t, pos); cr(q(i - 1).l, q(i).l, q(i + 1).l, q(i + 2).l, t, look) }
  const ang = s => Math.PI / 2 - s / NS * 6.283; /* the sun: once around the whorl over the whole path, clockwise seen from above */
  /* ---------- the place ---------- */
  const water = new THREE.Mesh(new THREE.RingGeometry(6.68, 70, 96, 1), new THREE.MeshBasicMaterial({ color: 0x0b1d28, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: true }));
  water.rotation.x = -Math.PI / 2; water.renderOrder = 1; g.add(water);
  for (let r = 9; r < 46; r += 5.5) { const pts = []; for (let j = 0; j <= 120; j++) { const a = j / 120 * 6.283; pts.push(V(Math.cos(a) * r, .02, Math.sin(a) * r)) }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x6fa5b8, transparent: true, opacity: .12 * (1 - r / 52), depthWrite: false }))) }
  /* the whorl: housing ring + plan drawing (PDF p.7) as the dial face, nine sector ticks, the sun mark */
  const whorl = new THREE.Group(); g.add(whorl);
  const housing = new THREE.Mesh(new THREE.RingGeometry(5.35, 6.7, 96), new THREE.MeshBasicMaterial({ color: 0xa8bcc4, transparent: true, opacity: .92, side: THREE.DoubleSide, depthWrite: false }));
  housing.rotation.x = -Math.PI / 2; housing.position.y = .62; housing.renderOrder = 3; whorl.add(housing);
  const faceM = new THREE.MeshBasicMaterial({ color: 0x223040, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false });
  const face = new THREE.Mesh(new THREE.CircleGeometry(5.36, 96), faceM); face.rotation.x = -Math.PI / 2; face.position.y = .6; face.renderOrder = 2; whorl.add(face);
  tex(IMG('p07-plan-dial'), t => { faceM.map = t; faceM.color.set(0xffffff); faceM.needsUpdate = true });
  const tickPts = []; for (let i = 0; i < NS; i++) { const a = ang(i), r0 = 6.75, r1 = i === LIGHT ? 7.9 : SEC_START.includes(i) ? 7.45 : 7.05; tickPts.push(V(Math.cos(a) * r0, .64, -Math.sin(a) * r0), V(Math.cos(a) * r1, .64, -Math.sin(a) * r1)) }
  whorl.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPts), new THREE.LineBasicMaterial({ color: 0xe6eef2, transparent: true, opacity: .7, depthWrite: false })));
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0xffd58a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sun.scale.set(2.6, 2.6, 1); sun.renderOrder = 6; whorl.add(sun);
  const sunCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sunCore.scale.set(.8, .8, 1); sunCore.renderOrder = 7; whorl.add(sunCore);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0x5fd9c0, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  halo.scale.set(26, 26, 1); halo.position.y = .2; whorl.add(halo);
  /* underground: the cave, the column, fibre optics, the beam and where it lands */
  const under = new THREE.Group(); g.add(under);
  const cave = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 44, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0x06090b, side: THREE.BackSide }));
  cave.position.y = -22; under.add(cave);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(26, 64), new THREE.MeshBasicMaterial({ color: 0x0d120e })); floor.rotation.x = -Math.PI / 2; floor.position.y = -38; under.add(floor);
  const ceil = new THREE.Mesh(new THREE.RingGeometry(2.7, 26, 64), new THREE.MeshBasicMaterial({ color: 0x080b0d, side: THREE.DoubleSide })); ceil.rotation.x = -Math.PI / 2; ceil.position.y = -.05; under.add(ceil);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 38, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fb4bd, transparent: true, opacity: .08, side: THREE.DoubleSide, depthWrite: false }));
  column.position.y = -19; g.add(column);
  const hoops = []; for (let y = -3; y > -38; y -= 5) { const pts = []; for (let j = 0; j <= 64; j++) { const a = j / 64 * 6.283; pts.push(V(Math.cos(a) * 2.6, y, Math.sin(a) * 2.6)) } hoops.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xa8bcc4, transparent: true, opacity: .22, depthWrite: false }))) }
  hoops.forEach(h => g.add(h));
  const fib = []; for (let i = 0; i < 46; i++) { const a = i * 2.39996, r = .25 + Math.sqrt(i / 46) * 1.15; fib.push(V(Math.cos(a) * r, .3, Math.sin(a) * r), V(Math.cos(a) * r * 1.25, -37.6, Math.sin(a) * r * 1.25)) }
  const fibers = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(fib), new THREE.LineBasicMaterial({ color: 0xd8fbff, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(fibers);
  const UB = { uI: { value: .4 } };
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 3.4, 37.6, 48, 24, true), new THREE.ShaderMaterial({ uniforms: UB, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform float uI;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float f=abs(dot(vN,vV));float core=pow(f,1.6);float a=uI*core*(.35+.65*vY)*(.55+.45*smoothstep(0.,.08,vY));gl_FragColor=vec4(vec3(1.,.95,.82)*a,1.);}' }));
  beam.position.y = -18.8; beam.renderOrder = 8; g.add(beam);
  const poolTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,248,226,1)'); gr.addColorStop(.18, 'rgba(255,236,190,.85)'); gr.addColorStop(.45, 'rgba(255,214,150,.28)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })();
  const pool = new THREE.Mesh(new THREE.CircleGeometry(7.5, 64), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = -37.9; pool.renderOrder = 9; g.add(pool);
  const eyeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: 0xfff0cc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  eyeGlow.position.y = -.6; eyeGlow.scale.set(5, 5, 1); g.add(eyeGlow);
  /* motes held in the light (fixed in place: still at rest) */
  const MN = 420, mp = new Float32Array(MN * 3); for (let i = 0; i < MN; i++) { const y = -Math.random() * 37.4, r = (1.2 + (3.3 - 1.2) * (-y / 37.6)) * Math.sqrt(Math.random()), a = Math.random() * 6.283; mp[i * 3] = Math.cos(a) * r; mp[i * 3 + 1] = y; mp[i * 3 + 2] = Math.sin(a) * r }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xfff4da, size: .07, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(motes);
  /* ---------- the PDF pages, placed in depth in front of each step's camera (fixed in the world: they slide with the camera) ---------- */
  const DUMMY = new THREE.PerspectiveCamera(), planes = [], MEAS = ctx.measure, FOV = 60, PD = 8;
  const small = () => innerWidth < 700;
  function placeAll(aspect) {
    planes.forEach(m => { g.remove(m); m.geometry.dispose(); m.material.dispose() }); planes.length = 0;
    const W = innerWidth, H = innerHeight, phone = W < 700, hh = PD * Math.tan(FOV * Math.PI / 360), hw = hh * aspect;
    const pos = V(0, 0, 0), look = V(0, 0, 0), fwd = V(0, 0, 0), right = V(0, 0, 0), up = V(0, 0, 0), WUP = V(0, 1, 0);
    STEPS.forEach((st, i) => {
      const imgs = st.pg ? st.pg.img.filter(x => x[0] !== st.pg.pimg) : []; if (!imgs.length) return;
      /* the free band above the text panel (measured with the same CSS) */
      MEAS.innerHTML = stepHTML(st, phone); const ph = MEAS.innerHTML ? Math.min(MEAS.scrollHeight, MEAS.clientHeight || MEAS.scrollHeight) : 0;
      const top = (phone ? 104 : 96), bot = H - Math.max(phone ? 26 : 30, ph - 34) - 10, bw = W * (phone ? .92 : (ph ? .52 : .64)), bh = Math.max(80, bot - top);
      poseAt(i, pos, look); if (Math.abs(look.x - pos.x) < 1e-3 && Math.abs(look.z - pos.z) < 1e-3) look.z -= .01;
      /* the exact basis the real camera will have at this step (same lookAt), so plates sit square to the screen */
      DUMMY.position.copy(pos); DUMMY.up.set(0, 1, 0); DUMMY.lookAt(look); const q = DUMMY.quaternion;
      fwd.set(0, 0, -1).applyQuaternion(q); right.set(1, 0, 0).applyQuaternion(q); up.set(0, 1, 0).applyQuaternion(q);
      const n = imgs.length, row = !phone && n > 1, gap = 10;
      const ar = imgs.map(x => x[1] / x[2]);
      /* fit all plates of the page into the band, side by side (desktop) or stacked (phone) */
      let sc; if (row) sc = Math.min((bw - gap * (n - 1)) / ar.reduce((a, b) => a + b, 0), bh); else sc = Math.min(...ar.map(a => bw / a)), sc = Math.min(sc, (bh - gap * (n - 1)) / n);
      let cx = W / 2 - (row ? (ar.reduce((a, b) => a + b * sc, 0) + gap * (n - 1)) / 2 : 0), cy = (top + bot) / 2 - (row ? 0 : (n * sc + gap * (n - 1)) / 2 - sc / 2);
      imgs.forEach((im, k) => {
        const w = ar[k] * sc, h = sc, px = row ? cx + w / 2 : W / 2, py = row ? cy : cy;
        const nx = (px / W) * 2 - 1, ny = 1 - (py / H) * 2;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide, fog: false }));
        m.position.copy(pos).addScaledVector(fwd, PD).addScaledVector(right, nx * hw).addScaledVector(up, ny * hh); m.quaternion.copy(q);
        m.scale.set(w / W * 2 * hw, h / H * 2 * hh, 1); m.renderOrder = 20; m.visible = false; m.userData = { stop: i, f: im[0], loaded: false }; g.add(m); planes.push(m);
        if (row) cx += w + gap; else cy += h + gap;
      });
    });
    MEAS.innerHTML = '';
  }
  const texCache = new Map();
  function ensureTex(m) { if (m.userData.loaded) return; m.userData.loaded = true; const key = m.userData.f + (small() ? '-s' : '');
    const apply = t => { m.material.map = t; m.material.needsUpdate = true };
    if (texCache.has(key)) { const c = texCache.get(key); if (c.t) apply(c.t); else c.w.push(apply); return }
    const c = { t: null, w: [apply] }; texCache.set(key, c); tex(PIMG(m.userData.f, small()), t => { c.t = t; c.w.forEach(f => f(t)) }) }
  /* ---------- state ---------- */
  let s = 0, active = true, unlocked = !!ctx.unlocked, drag = null, glide = null, settleAt = performance.now(), shown = -1, enter = null, wheelAcc = 0, wheelT = 0, wheelLock = false, reached = unlocked ? NS - 1 : 0;
  const pts = new Map(); let pinch = null;
  const TXT = ctx.text, DIAL = ctx.dial, PROG = ctx.prog;
  function stopNow() { return Math.abs(s - Math.round(s)) < 1e-4 ? clampS(Math.round(s)) : -1 }
  function atRest() { return !drag && !glide && !enter && stopNow() >= 0 }
  function glideTo(t, dur) { t = clampS(t); glide = { s0: s, t: t, t0: performance.now(), d: dur || T_GLIDE }; hideText(); log('glide', t) }
  function hideText() { if (shown !== -1) { TXT.classList.remove('on'); shown = -1 } }
  function showText(i) {
    if (shown === i) return; shown = i; const st = STEPS[i], h = stepHTML(st, small());
    TXT.dataset.k = st.k; TXT.dataset.n = st.n || ''; TXT.innerHTML = h; TXT.scrollTop = 0; TXT.classList.remove('on'); void TXT.offsetWidth; if (h) TXT.classList.add('on'); tAct(); log('text', st.n || st.k);
  }
  /* mini dial (DOM): one tick per sector + the sun; tap a tick to go back to a sector you have reached (never ahead of the path) */
  DIAL.innerHTML = '<i class="sun"></i>' + SEC_START.map(i => `<b data-i="${i}" class="${STEPS[i].k === 'light' ? 'lt' : ''}" style="--a:${(-ang(i) + Math.PI / 2).toFixed(4)}rad"></b>`).join('');
  const dSun = DIAL.querySelector('.sun');
  DIAL.addEventListener('pointerdown', e => e.stopPropagation());
  DIAL.addEventListener('click', e => { const b = e.target.closest('b[data-i]'); if (!b || enter) return; const i = +b.dataset.i; if (i > reached) return; const cur = glide ? glide.t : Math.round(s); if (i !== cur) glideTo(i, Math.min(1400, T_GLIDE + 60 * (Math.abs(i - cur) - 1))) });
  /* the text panel sits over the stage: a sideways drag on it still steps; a vertical drag scrolls it only when it overflows */
  const fits = () => TXT.scrollHeight <= TXT.clientHeight + 1;
  const tAct = () => { TXT.style.touchAction = fits() ? 'none' : 'pan-y' };
  TXT.addEventListener('pointerdown', e => { if (!active) return; e.stopPropagation(); try { TXT.setPointerCapture(e.pointerId) } catch (x) {} down(e); if (drag) drag.txt = !fits() });
  TXT.addEventListener('pointermove', e => { if (active) move(e) });
  TXT.addEventListener('pointerup', e => { if (active) up(e) });
  TXT.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; if (drag && drag.id === e.pointerId) { const D = drag; drag = null; glideTo(D.s0, T_BACK) } });
  ['touchstart', 'touchmove'].forEach(t => TXT.addEventListener(t, e => { if (fits()) e.preventDefault() }, { passive: false }));
  /* ---------- input: one gesture = one step ---------- */
  function base() { return glide ? glide.t : Math.round(s) }
  function down(e) {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { const D = drag; drag = null; const a = [...pts.values()]; pinch = { d0: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; if (D && !glide) glideTo(D.s0, T_BACK); return }
    if (pts.size > 2 || enter) return;
    const s0 = base(); glide = null;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, sStart: s, s0: s0, moved: 0, t0: performance.now(), smp: [[performance.now(), s]] };
  }
  function move(e) {
    const p = pts.get(e.pointerId); if (p) { p.x = e.clientX; p.y = e.clientY }
    if (pinch && pts.size >= 2) { const a = [...pts.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); if (pinch.d0 > 0 && d / pinch.d0 < .72 && unlocked) { pinch = null; leave() } return }
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; drag.moved = Math.max(drag.moved, Math.abs(dx), Math.abs(dy)); if (drag.moved < 6) return;
    if (drag.txt && Math.abs(dy) > Math.abs(dx)) return; /* scrolling the text */
    const W = innerWidth, H = innerHeight, d = Math.abs(dx) >= Math.abs(dy) ? -dx / (W * .6) : -dy / (H * .42);
    /* the camera follows the finger, but never further than one step from where the drag began */
    s = clampS(Math.max(drag.s0 - .92, Math.min(drag.s0 + .92, drag.sStart + d))); hideText(); drag.dir = Math.sign(d); drag.smp.push([performance.now(), s]); if (drag.smp.length > 8) drag.smp.shift();
  }
  function up(e) {
    pts.delete(e.pointerId); if (pinch) { if (pts.size < 2) pinch = null; return }
    if (!drag || drag.id !== e.pointerId) return; const D = drag; drag = null; const now = performance.now();
    if (D.moved < 8 && now - D.t0 < 380) { tap(e.clientX, e.clientY); if (stopNow() < 0 || D.s0 !== Math.round(s)) glideTo(D.s0, T_BACK); return }
    const sm = D.smp.filter(q => now - q[0] < 100), v = sm.length > 1 ? (sm[sm.length - 1][1] - sm[0][1]) / Math.max(1, sm[sm.length - 1][0] - sm[0][0]) : 0, ds = s - D.s0;
    let t = D.s0;
    if (Math.abs(ds) >= .15 || (Math.abs(v) > .0012 && Math.sign(v) === Math.sign(ds || v))) t = D.s0 + Math.sign(ds || v);
    t = clampS(t); glideTo(t, t === D.s0 ? T_BACK : T_GLIDE); log('drag', [D.s0, t]);
  }
  function tap(x, y) { if (unlocked && ctx.pickCluster) { const C = ctx.pickCluster(x, y); if (C) { leave(C); return } } log('tap', stopNow()) }
  function wheel(e) { if (enter) return; if (e.ctrlKey) { if (e.deltaY > 2 && unlocked) leave(); return }
    /* one wheel / trackpad gesture = one step: after a step, the wheel stays locked until it has been quiet for 260 ms */
    const now = performance.now(); if (now - wheelT > 260) { wheelAcc = 0; wheelLock = false } wheelT = now; if (wheelLock) return; wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(wheelAcc) > 70) { glideTo(base() + Math.sign(wheelAcc), T_GLIDE); wheelLock = true } }
  function key(e) { if (enter) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); if (!e.repeat) glideTo(base() + 1, T_GLIDE) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); if (!e.repeat) glideTo(base() - 1, T_GLIDE) }
    else if (e.key === 'Escape' && unlocked) leave(); else if (e.key === 'Home') home() }
  function leave(C) { if (!active) return; active = false; hideText(); drag = glide = null; pts.clear(); pinch = null; ctx.onLeave(C || null); log('leave', C ? C.k : 'sky') }
  function enterFrom(pos, look, at) { active = true; enter = { p: pos.clone(), l: look.clone(), t0: performance.now() }; if (at != null) s = at; hideText(); log('enter', Math.round(s)) }
  /* Home inside Spirit Eye: before the chapters are open, back to page 1 by the shortest line (not back through every page) */
  function home() { if (unlocked) { leave(); return } if (Math.round(base()) === 0 && atRest()) return; enterFrom(lastCam.p, lastCam.l, 0) }
  /* ---------- per frame ---------- */
  const cp = V(0, 0, 0), cl = V(0, 0, 0), lastCam = { p: V(0, 0, 0), l: V(0, 0, 0) };
  let lastLog = -1, progKey = '';
  function update(now, cam) {
    if (glide) { const u = Math.min(1, (now - glide.t0) / glide.d); s = glide.s0 + (glide.t - glide.s0) * EASE(u); if (u >= 1) { s = glide.t; glide = null; settleAt = now } }
    if (!drag && !glide && !enter && stopNow() < 0) glideTo(Math.round(s), T_BACK);
    const i = stopNow(), rest = i >= 0 && atRest();
    if (rest) { if (i > reached) reached = i; if (now - settleAt > 260) showText(i); if (i === UNLOCK && !unlocked) { unlocked = true; ctx.onUnlock(); log('unlock', 1) } }
    if (i !== lastLog && rest) { lastLog = i; log('at', STEPS[i].n || STEPS[i].k) }
    const a = ang(s); sun.position.set(Math.cos(a) * 7.6, .9, -Math.sin(a) * 7.6); sunCore.position.copy(sun.position);
    const near = c => Math.max(0, 1 - Math.abs(s - c) / 1.4);
    const L = Math.max(.38, near(LIGHT), .55 * near(LIGHT - 1), .6 * near(LIGHT + 1));
    const above = cam.position.y > 0 ? .55 : 1; UB.uI.value = (.32 + .5 * L) * above; pool.material.opacity = .35 + .3 * L; eyeGlow.material.opacity = .5 + .5 * L; fibers.material.opacity = .12 + .22 * L; motes.material.opacity = .25 + .65 * L;
    if (active || enter) {
      poseAt(s, cp, cl);
      if (enter) { const u = Math.min(1, (now - enter.t0) / T_ENTER), k = EASE(u); cp.lerpVectors(enter.p, cp, k); cl.lerpVectors(enter.l, cl, k); if (u >= 1) { enter = null; settleAt = now } }
      cam.position.copy(cp); cam.up.set(0, 1, 0); if (Math.abs(cl.x - cp.x) < 1e-3 && Math.abs(cl.z - cp.z) < 1e-3) cl.z -= .01; cam.lookAt(cl);
      lastCam.p.copy(cp); lastCam.l.copy(cl);
    }
    const camY = cam.position.y;
    under.visible = camY < .4; ceil.visible = camY < .4;
    faceM.opacity = Math.max(.18, Math.min(1, (Math.hypot(cam.position.x, cam.position.y - .6, cam.position.z) - 2.2) / 7)); housing.material.opacity = .5 + .42 * faceM.opacity;
    water.material.opacity = camY < 0 ? .98 : .9;
    planes.forEach(m => { const d = Math.abs(s - m.userData.stop); const o = active && !enter ? Math.max(0, 1 - d / .8) : 0; m.material.opacity = o * o * (3 - 2 * o); m.visible = m.material.opacity > .01; if (d < 2.5) ensureTex(m) });
    halo.material.opacity = .22 * (active ? 1 : .6);
    const ds = DIAL.dataset; if (ds.s !== s.toFixed(3)) { ds.s = s.toFixed(3); dSun.style.transform = `rotate(${(-a + Math.PI / 2).toFixed(4)}rad) translateY(-19px)`;
      const cur = SEC_START.filter(x => x <= Math.round(s)).pop(); DIAL.querySelectorAll('b').forEach(b => { const j = +b.dataset.i; b.classList.toggle('on', j === cur); b.classList.toggle('no', j > reached) }) }
    const st = STEPS[clampS(Math.round(glide ? glide.t : s))], pk = (st.n ? 'p. ' + st.n + ' / 32' : '') + '|' + (Math.round(glide ? glide.t : s));
    if (pk !== progKey) { progKey = pk; PROG.querySelector('.t').textContent = st.n ? 'p. ' + st.n + ' / 32' : (st.k === 'light' ? '·' : ''); PROG.dataset.step = clampS(Math.round(glide ? glide.t : s)); PROG.classList.toggle('first', !Math.round(glide ? glide.t : s)); PROG.classList.toggle('last', Math.round(glide ? glide.t : s) >= NS - 1) }
  }
  const LOG = []; function log(k, v) { LOG.push([Math.round(performance.now()), k, v]); if (LOG.length > 400) LOG.shift() }
  function resize(aspect) { layoutPath(aspect); placeAll(aspect) }
  return { group: g, get active() { return active }, get unlocked() { return unlocked }, update, down, move, up, wheel, key, enterFrom, leave, resize, home, log: LOG, NS, STEPS,
    hit(x, y, cam) { const v = V(0, .6, 0).project(cam); if (v.z > 1) return false; const sx = (v.x + 1) / 2 * innerWidth, sy = (1 - v.y) / 2 * innerHeight; const e = V(6.7, .6, 0).project(cam), r = Math.hypot((e.x + 1) / 2 * innerWidth - sx, (1 - e.y) / 2 * innerHeight - sy); return Math.hypot(x - sx, y - sy) < Math.max(40, r) },
    st: () => { const i = stopNow(); return { s: +s.toFixed(4), stop: i, n: i >= 0 ? STEPS[i].n || null : null, k: i >= 0 ? STEPS[i].k : null, rest: atRest(), text: shown, active, unlocked, reached, glide: !!glide, enter: !!enter, NS, pl: planes.filter(m => m.visible).map(m => [m.userData.f, !!(m.material.map && m.material.map.image), +m.material.opacity.toFixed(2)]) } },
    go: d => { if (!enter) glideTo(base() + d, T_GLIDE) } };
}
/* ---------- no WebGL: every page as a simple sequence ---------- */
export function fallback(el) {
  el.innerHTML = '<div class="se-seq">' + STEPS.map(st => {
    if (st.k === 'light') return '<section class="se-s light" aria-label="light"><div class="beam" aria-hidden="true"></div></section>';
    if (st.k === 'sky') return '';
    const pg = st.pg; let o = `<section class="se-s" data-n="${pg.n}"><p class="pn">p. ${pg.n} / 32</p>` + pg.img.filter(x => x[0] !== pg.pimg).map(x => `<img src="${PIMG(x[0], true)}" width="${x[1]}" height="${x[2]}" alt="" loading="lazy">`).join('');
    return o + stepHTML(st, true).replace(/ style="transition-delay:[^"]*"/g, '').replace(/<p class="hint">[^<]*<\/p>/, '') + '</section>';
  }).join('') + '</div>';
}
