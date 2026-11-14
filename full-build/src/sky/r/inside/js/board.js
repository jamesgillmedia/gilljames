/* Chapter boards painted in the 3D sky (m4 K5/K9/K6/K7/K8, pro2 density). The board is a camera stop: its own stars fly from the
   constellation into their tiles; a thin ring of night stays around it. One board unit = one CSS pixel at the board camera. */
import * as THREE from 'three';
import {src, rnd} from './data.js';

let E = null;
const boards = {};          // k -> built board
let cur = null;             // open (or closing) board
let bloom = 0, bloomT = 0;  // 0 = constellation, 1 = board
let scroll = 0, scrollV = 0, scrollT = 0, moving = false, pz = 1, held = false;
let selIt = null, pieceIt = null;
let W = innerWidth, H = innerHeight;
const TOP = () => 92 + safeTop(), BOT = () => 128;
function safeTop() { const v = getComputedStyle(document.documentElement).getPropertyValue('--st'); return parseFloat(v) || 0; }
const NOUN = {film: 'works', photo: 'photographs', objects: 'pieces', sound: 'songs'};
const ease = u => { u = Math.max(0, Math.min(1, u)); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const mctx = document.createElement('canvas').getContext('2d');

function wrap(t, font, w, max) {
  mctx.font = font; const ws = String(t || '').split(/\s+/).filter(Boolean), out = []; let line = '';
  ws.forEach(wd => { const tt = line ? line + ' ' + wd : wd; if (mctx.measureText(tt).width <= w || !line) line = tt; else { out.push(line); line = wd; } });
  if (line) out.push(line);
  if (max && out.length > max) { const keep = out.slice(0, max); let last = keep[max - 1].split(' '); while (last.length > 1 && mctx.measureText(last.join(' ') + '…').width > w) last.pop(); keep[max - 1] = last.join(' ').replace(/[\s·—–,:&+-]+$/, '') + '…'; return keep; }
  return out;
}
/* rows: [{lines:[...], font, color, lh, ls, align}] -> plane mesh in board units */
function textMesh(rows, w, opts = {}) {
  const R = 3, pad = opts.pad || 0;
  let h = pad * 2; rows.forEach(r => { h += r.lines.length * r.lh + (r.gap || 0); });
  const c = document.createElement('canvas'); c.width = Math.ceil(w * R); c.height = Math.max(2, Math.ceil(h * R));
  const q = c.getContext('2d'); q.scale(R, R); q.textBaseline = 'top';
  let y = pad;
  rows.forEach(r => {
    y += r.gap || 0;
    q.font = r.font; q.fillStyle = r.color; q.textAlign = r.align || 'left';
    if (r.ls) q.letterSpacing = r.ls;
    r.lines.forEach(t => { q.fillText(t, r.align === 'center' ? w / 2 : 0, y + (r.lh - parseFloat(/(\d+(\.\d+)?)px/.exec(r.font)[1])) / 2); y += r.lh; });
    if (r.ls) q.letterSpacing = '0px';
  });
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, opacity: 0}));
  m.userData.h = h; m.userData.w = w; m.renderOrder = 6;
  return m;
}
function mmss(s) { s = Math.max(0, s | 0); return (s / 60 | 0) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }

function soundSegs(it) {
  if (it.id === 'sound/lost-coffee-apple-music') return ' · Apple Music';
  if (it.kind === 'player' || it.id === 'sound/waveform') return (it.title || '') + ' · ' + (it.meta || '');
  return (it.title || '') + ' · ' + (it.meta || '');
}

function build(k) {
  const c = E.D.chapters[k], items = c.board.slice();
  const g = new THREE.Group(); g.visible = false;
  const maxW = Math.min(W - 28, 680), AW = maxW + 28;
  let pad = 10, gap = 8; const head = 54;
  if (k === 'film' || k === 'objects') { pad = 8; gap = 6; }
  const cols = k === 'about' ? 1 : k === 'film' ? (AW < 520 ? 2 : 3) : (AW < 520 ? 3 : AW < 860 ? 4 : 6);
  if (k === 'photo') gap = 14;
  const tw = (maxW - pad * 2 - gap * (cols - 1)) / cols;
  const tiles = [];
  let bottom = 0;
  const capFont = '300 11px Poppins', roleFont = '300 10px Poppins';
  if (k === 'film') {
    const th = tw / 2.39, colF = []; for (let i = 0; i < cols; i++) colF.push(i % 2 ? Math.round((th + 30) * .34) : 0);
    items.forEach(it => {
      let cc = 0; for (let j = 1; j < cols; j++) if (colF[j] < colF[cc] - 1) cc = j;
      const t = it.title && it.title !== 'untitled' ? wrap(it.title, capFont, tw - 2, 2) : [];
      const role = it.role || it.meta || '';
      const chh = t.length * 13 + (role ? 13 : 0) + 6;
      tiles.push({it, x: cc * (tw + gap), y: colF[cc], w: tw, h: th, cap: t, role, rc: it.role ? 'mint' : 'dim', chh});
      colF[cc] += th + chh + gap; bottom = Math.max(bottom, colF[cc]);
    });
  } else if (k === 'photo') {
    const colH = []; for (let i = 0; i < cols; i++) colH.push(0);
    items.forEach((it, j) => {
      const m = it.media || {}, ar = (m.w && m.h) ? m.h / m.w : (it._ar || 1.25), h = tw * Math.max(.62, Math.min(1.5, ar));
      let cc = 0; for (let i = 1; i < cols; i++) if (colH[i] < colH[cc] - 1) cc = i;
      tiles.push({it, x: cc * (tw + gap), y: colH[cc], w: tw, h, rot: (rnd(it.i * 5.7 + 1) - .5) * .06, print: 1, chh: 0});
      colH[cc] += h + gap;
    });
    bottom = Math.max(...colH);
  } else if (k === 'objects') {
    const colO = []; for (let i = 0; i < cols; i++) colO.push(0);
    items.forEach(it => {
      let cc = 0; for (let i = 1; i < cols; i++) if (colO[i] < colO[cc] - 1) cc = i;
      const t = it.title ? wrap(it.title, capFont, tw - 2, 2) : [];
      const chh = t.length ? t.length * 13 + 6 : 0;
      tiles.push({it, x: cc * (tw + gap), y: colO[cc], w: tw, h: tw, cap: t, chh});
      colO[cc] += tw + chh + gap; bottom = Math.max(bottom, colO[cc]);
    });
  } else if (k === 'sound') {
    const segW = (maxW - pad * 2) / (AW < 520 ? 2 : 3), per = AW < 520 ? 2 : 3, rowS = 128; let nt = 0;
    items.forEach(it => {
      if (it.kind === 'track') { const r = Math.floor(nt / per), q = nt % per; tiles.push({it, x: q * segW, y: r * rowS, w: segW, h: rowS - 26, wave: 1, chh: 26}); nt++; return; }
      const txt = soundSegs(it), prev = tiles[tiles.length - 1];
      mctx.font = '300 11px Poppins'; const lw = mctx.measureText(txt).width + 4;
      if (it.id === 'sound/lost-coffee-apple-music' && prev && prev.text) { tiles.push({it, x: prev.x + prev.lw, y: prev.y, w: lw, lw, h: 26, text: txt, chh: 0}); return; }
      const y0 = Math.ceil(nt / per) * rowS + 12 + tiles.filter(t => t.text && t.x === 0).length * 30;
      tiles.push({it, x: 0, y: y0, w: lw, lw, h: 26, text: txt, chh: 0});
    });
    tiles.forEach(t => { bottom = Math.max(bottom, t.y + t.h + t.chh); });
  } else {
    const bio = (E.D.bio || []).join('\n\n');
    const lines = []; bio.split('\n').forEach(p => { if (!p) lines.push(''); else wrap(p, '300 13px Poppins', maxW - pad * 2 - 4).forEach(l => lines.push(l)); });
    const bioM = textMesh([{lines, font: '300 13px Poppins', color: '#eef3f5', lh: 19}], maxW - pad * 2);
    g.add(bioM); bioM.userData.bx = pad; bioM.userData.by = head; bioM.userData.static = 1;
    let y = bioM.userData.h + 18;
    items.forEach(it => { tiles.push({it, x: 0, y, w: maxW - pad * 2, h: 44, star: 1, chh: 0}); y += 46; });
    bottom = y;
  }
  const contentH = head + bottom + 18;
  const bw = maxW, bh = contentH;
  /* backing: night with the sky felt behind, a soft rim of light */
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({color: 0x050a12, transparent: true, opacity: 0, depthWrite: false}));
  back.scale.set(bw, bh, 1); back.position.set(bw / 2, -bh / 2, -1); back.renderOrder = 4; g.add(back);
  const rimC = E.TEX.canvasTex(64, 64, (q) => { q.strokeStyle = 'rgba(200,220,240,.55)'; q.lineWidth = 2; q.strokeRect(1, 1, 62, 62); });
  const rim = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: rimC, transparent: true, opacity: 0, depthWrite: false}));
  rim.scale.set(bw + 2, bh + 2, 1); rim.position.set(bw / 2, -bh / 2, -.8); rim.renderOrder = 4; g.add(rim);
  const n = k === 'sound' ? items.filter(i => i.kind === 'track').length : items.length;
  const hm = textMesh([{lines: [k.toUpperCase()], font: '400 16px "Julius Sans One"', color: '#eef3f5', lh: 22, ls: '6px', align: 'center'}].concat(NOUN[k] ? [{lines: [n + ' ' + NOUN[k]], font: '300 11px Poppins', color: '#c9d3d6', lh: 15, align: 'center'}] : []), bw);
  hm.userData.bx = 0; hm.userData.by = 10; hm.userData.static = 1; g.add(hm);
  /* tiles */
  const dots = [];
  tiles.forEach((t, i) => {
    t.i = i; t.bx = pad + t.x; t.by = head + t.y;
    const it = t.it;
    if (t.wave) {
      const pk = (it.track && it.track.peaks) || [], N = 22, base = t.by + t.h - 6, top = t.by + 18;
      t.pts = [];
      for (let j = 0; j < N; j++) {
        const v = pk.length ? pk[Math.min(pk.length - 1, Math.floor(j * pk.length / N))] : .5;
        t.pts.push([t.bx + 6 + j * (t.w - 12) / (N - 1), base - v * (base - top - 18)]);
      }
      let hi = 0; t.pts.forEach((p, j) => { if (p[1] < t.pts[hi][1]) hi = j; }); t.hi = hi;
      const dur = it.track && it.track.dur;
      const sub = (dur ? mmss(dur) : '') + (it.track && it.track.artist && it.track.artist !== 'Lost Coffee' ? ' · ' + it.track.artist : '');
      const tl = wrap(it.title, '300 11px Poppins', t.w - 10, 2);
      t.capM = textMesh([{lines: tl, font: '300 11px Poppins', color: '#eef3f5', lh: 14}, {lines: [sub], font: '300 10px Poppins', color: '#55DAA1', lh: 13}], t.w - 8);
      t.capM.userData.bx = t.bx + 4; t.capM.userData.by = t.by + t.h + 2; g.add(t.capM);
      t.pts.forEach(p => dots.push([p[0], p[1], i]));
      t.hit = new THREE.Mesh(new THREE.PlaneGeometry(t.w, t.h + t.chh), new THREE.MeshBasicMaterial({visible: false}));
      t.hit.position.set(t.bx + t.w / 2, -(t.by + (t.h + t.chh) / 2), 0); t.hit.userData.t = t; g.add(t.hit);
      t.peak = new THREE.Sprite(new THREE.SpriteMaterial({map: E.TEX.GLOW, color: new THREE.Color(1, 182 / 255, 176 / 255), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0}));
      t.peak.position.set(t.pts[hi][0], -t.pts[hi][1], 1); t.peak.scale.setScalar(26); t.peak.renderOrder = 7; g.add(t.peak);
      return;
    }
    if (t.text || t.star) {
      const rows = t.star ? [{lines: [it.title || ''], font: '300 14px Poppins', color: '#eef3f5', lh: 20}, {lines: [it.meta || ''], font: '300 11px Poppins', color: '#c9d3d6', lh: 15}]
        : [{lines: [t.text], font: '300 11px Poppins', color: '#c9d3d6', lh: 18}];
      t.capM = textMesh(rows, t.w - (t.star ? 22 : 0)); t.capM.userData.bx = t.bx + (t.star ? 22 : 0); t.capM.userData.by = t.by + (t.star ? 2 : 4); g.add(t.capM);
      if (t.star) { const s = new THREE.Sprite(new THREE.SpriteMaterial({map: E.TEX.GLOW, color: 0xbee1ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0})); s.position.set(t.bx + 8, -(t.by + 14), 1); s.scale.setScalar(22); s.renderOrder = 7; g.add(s); t.dot = s; }
      t.hit = new THREE.Mesh(new THREE.PlaneGeometry(t.w, t.h), new THREE.MeshBasicMaterial({visible: false}));
      t.hit.position.set(t.bx + t.w / 2, -(t.by + t.h / 2), 0); t.hit.userData.t = t; g.add(t.hit);
      return;
    }
    const mat = new THREE.MeshBasicMaterial({color: new THREE.Color(...c.tint).multiplyScalar(.16), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide});
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.renderOrder = 5; m.userData.t = t; t.mesh = m; t.hit = m;
    if (t.print) {
      const mm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({color: 0xeee6d6, transparent: true, opacity: 0, depthWrite: false}));
      mm.renderOrder = 5; mm.position.z = -.3; m.add(mm); t.mat = mm;
    }
    E.sky.add(m);
    if (t.cap && t.cap.length || t.role) {
      const rows = []; if (t.cap && t.cap.length) rows.push({lines: t.cap, font: capFont, color: '#eef3f5', lh: 13});
      if (t.role) rows.push({lines: [t.role], font: roleFont, color: t.rc === 'mint' ? '#55DAA1' : 'rgba(201,211,214,.8)', lh: 13});
      t.capM = textMesh(rows, t.w); t.capM.userData.bx = t.bx; t.capM.userData.by = t.by + t.h + 3; g.add(t.capM);
    }
  });
  let dotsP = null;
  if (dots.length) {
    const pos = new Float32Array(dots.length * 3), col = new Float32Array(dots.length * 3);
    dots.forEach((d, j) => { pos[j * 3] = d[0]; pos[j * 3 + 1] = -d[1]; pos[j * 3 + 2] = .5; col[j * 3] = 85 / 255; col[j * 3 + 1] = 218 / 255; col[j * 3 + 2] = 161 / 255; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    dotsP = new THREE.Points(geo, new THREE.PointsMaterial({size: 3.4, vertexColors: true, map: E.TEX.CORE, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: false}));
    dotsP.renderOrder = 7; dotsP.userData.idx = dots.map(d => d[2]); g.add(dotsP);
    const lp = []; tiles.forEach(t => { if (t.pts) for (let j = 1; j < t.pts.length; j++) lp.push(new THREE.Vector3(t.pts[j - 1][0], -t.pts[j - 1][1], .3), new THREE.Vector3(t.pts[j][0], -t.pts[j][1], .3)); });
    const ln = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({color: 0x55DAA1, transparent: true, opacity: 0, depthWrite: false}));
    ln.renderOrder = 6; g.add(ln); dotsP.userData.line = ln;
  }
  /* board placement: in front of its constellation, facing the far-sky camera */
  const origin = new THREE.Vector3(c.cx - bw / 2, c.cy + Math.min(c.bh * .5, 260), c.cz + 70);
  g.position.copy(origin);
  E.sky.add(g);
  const B = {k, g, tiles, back, rim, head: hm, origin, bw, bh, contentH, dotsP, byId: new Map(tiles.map(t => [t.it.id, t])), sig: W + 'x' + H};
  tiles.forEach(t => { t.world = new THREE.Vector3(origin.x + t.bx + t.w / 2, origin.y - (t.by + t.h / 2), origin.z); });
  return B;
}
function dispose(B) {
  B.tiles.forEach(t => { if (t.mesh) { E.sky.remove(t.mesh); t.mesh.geometry.dispose(); if (t.mesh.material.map) t.mesh.material.map.dispose(); t.mesh.material.dispose(); } });
  B.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map && o.material.map.isCanvasTexture) o.material.map.dispose(); o.material.dispose(); } });
  E.sky.remove(B.g);
}

function loadTile(t, big) {
  const it = t.it, m = t.mesh; if (!m) return;
  const url = src(big ? (it.media.big || it.media.thumb) : (it.media.thumb || it.media.big));
  if (!url || (big ? t.bigLd : t.ld)) return;
  if (big) t.bigLd = 1; else t.ld = 1;
  E.loadTex(url, tex => {
    const tt = tex.clone(); E.coverUV(tt, t.w / t.h);
    if (m.material.map && m.material.map !== tt && !big) return;
    m.material.map = tt; m.material.color.set(0xffffff); m.material.needsUpdate = true;
  });
}

const RC = new THREE.Raycaster();
const Q0 = new THREE.Quaternion(), QT = new THREE.Quaternion(), V1 = new THREE.Vector3();

let selBox = null;
export const Board = {
  init(env) {
    E = env;
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.5, .5, 0), new THREE.Vector3(.5, .5, 0), new THREE.Vector3(.5, -.5, 0), new THREE.Vector3(-.5, -.5, 0)]);
    selBox = new THREE.LineLoop(g, new THREE.LineBasicMaterial({color: 0x55DAA1, transparent: true, opacity: 0, depthWrite: false, depthTest: false}));
    selBox.renderOrder = 9; E.sky.add(selBox);
  },
  key() { return cur && bloomT > 0 ? cur.k : null; },
  open(k, snap, focus) {
    if (!E.D.chapters[k]) return;
    if (cur && cur.k !== k) { cur.g.visible = false; cur.tiles.forEach(t => { if (t.mesh) t.mesh.visible = false; }); bloom = 0; }
    let B = boards[k];
    if (B && B.sig !== W + 'x' + H) { dispose(B); B = null; }
    if (!B) { B = boards[k] = build(k); Object.keys(boards).forEach(kk => { if (kk !== k && boards[kk] && kk !== (cur && cur.k)) { dispose(boards[kk]); delete boards[kk]; } }); }
    if (cur !== B) { scroll = scrollT = 0; }
    cur = B; B.g.visible = true; bloomT = 1;
    if (snap && snap.scroll != null) scroll = scrollT = snap.scroll;
    if (focus) this.focus(focus);
  },
  close() { bloomT = 0; selIt = null; pieceIt = null; },
  snapshot() { return cur ? {scroll: scrollT, k: cur.k} : null; },
  has(it) { return !!(cur && bloom > 0 && cur.byId.has(it.id)); },
  bloom() { return bloom; },
  tileOf(it) { const t = cur && cur.byId.get(it.id); if (!t) return null; return {world: t.world.clone(), w: t.w, h: t.h, mesh: t.mesh, t}; },
  posOf(it) {
    const t = cur.byId.get(it.id), home = it._home;
    if (!home) return t.world;
    const e = ease((bloom - (t.i % 24) * .012) / .7);
    return V1.copy(home).lerp(t.cur || t.world, e);
  },
  maxScroll() { return cur ? Math.max(0, cur.contentH - (H - TOP() - BOT() + 60)) : 0; },
  cam(snap) {
    if (!cur) return {T: new THREE.Vector3(), dist: 500, yaw: 0, pitch: 0};
    const s = snap && snap.scroll != null ? snap.scroll : scroll;
    const dist = H / (2 * Math.tan(E.camera.fov * Math.PI / 360)) / pz;
    const T = new THREE.Vector3(cur.origin.x + cur.bw / 2, cur.origin.y - (H / 2 - TOP()) - s, cur.origin.z);
    return {T, dist, yaw: 0, pitch: 0};
  },
  pieceCam(it) {
    const t = cur && it && cur.byId.get(it.id);
    if (!t) return this.cam();
    const ppu = Math.min((W - 28) / t.w, (H * .5) / (t.h + (t.wave ? t.chh : 0)), 6);
    const dist = H / (2 * Math.tan(E.camera.fov * Math.PI / 360) * ppu);
    const T = t.world.clone(); T.y -= (H * .07) / ppu; T.z += 0;
    return {T, dist, yaw: 0, pitch: 0};
  },
  setPiece(it) { pieceIt = it; if (it) { const t = cur && cur.byId.get(it.id); if (t) { loadTile(t, true); const s = selIt; this.focus(it); selIt = s; } } },
  focus(it) {
    const t = cur && cur.byId.get(it.id); if (!t) return;
    selIt = it;
    const view = H - TOP() - BOT();
    scrollT = Math.max(0, Math.min(this.maxScroll(), t.by - view / 2 + t.h / 2));
    scroll = scrollT;
  },
  select(it) { selIt = it; },
  selected() { return selIt ? selIt.id : null; },
  screenOf(id, camera) { const t = cur && cur.byId.get(id); if (!t) return null; const v = (t.mesh ? t.mesh.getWorldPosition(new THREE.Vector3()) : E.sky.localToWorld(this.posOf(t.it).clone())).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; },
  pick(x, y, camera) {
    if (!cur) return null;
    RC.setFromCamera(new THREE.Vector2(x / W * 2 - 1, -(y / H) * 2 + 1), camera);
    const list = cur.tiles.map(t => t.hit).filter(Boolean);
    const h = RC.intersectObjects(list, false)[0];
    if (!h) return null;
    const t = h.object.userData.t;
    return {type: 'it', it: t.it, k: cur.k};
  },
  grab() { held = true; scrollV = 0; },
  drag(dx, dy) { if (!cur) return; moving = true; scrollT -= dy; const mx = this.maxScroll(); if (scrollT < 0) scrollT += dy * .5; if (scrollT > mx) scrollT += dy * .5; scroll = scrollT; },
  release(v) { held = false; scrollV = -(v.y || 0) * .9; },
  wheel(dy) { moving = true; scrollT = Math.max(0, Math.min(this.maxScroll(), scrollT + dy)); },
  pinch(s) { pz = Math.max(.85, Math.min(1.18, Math.pow(s, .35))); if (s === 1) pz = 1; },
  moving() { return moving; },
  step(dt, tms, camera) {
    moving = false;
    if (!held) {
      scrollT += scrollV * dt; scrollV *= Math.exp(-3.2 * dt);
      const mx = this.maxScroll();
      if (scrollT < 0) { scrollT += (0 - scrollT) * (1 - Math.exp(-10 * dt)); scrollV = 0; }
      if (scrollT > mx) { scrollT += (mx - scrollT) * (1 - Math.exp(-10 * dt)); scrollV = 0; }
      if (Math.abs(scrollV) > 2) moving = true;
      if (!E.pinching || !E.pinching()) pz += (1 - pz) * (1 - Math.exp(-8 * dt));
    }
    scroll += (scrollT - scroll) * (1 - Math.exp(-22 * dt));
    const was = bloom;
    bloom += (bloomT - bloom) * (1 - Math.exp(-5.5 * dt)); if (Math.abs(bloom - bloomT) < .002) bloom = bloomT;
    if (!cur) return;
    if (bloom === 0 && bloomT === 0 && was === 0) { cur.g.visible = false; cur.tiles.forEach(t => { if (t.mesh) t.mesh.visible = false; }); return; }
    const B = cur, e = ease(bloom), sa = E.skyAlpha ? E.skyAlpha() : 1;
    B.back.material.opacity = .62 * e * sa; B.rim.material.opacity = .16 * e * sa;
    const view0 = scroll - 200, view1 = scroll + H + 200;
    B.g.children.forEach(o => { if (o.userData && o.userData.bx != null) { o.position.set(o.userData.bx + o.userData.w / 2, -(o.userData.by + o.userData.h / 2), .4); o.material.opacity = e * sa * (pieceIt ? .25 : 1); } });
    B.head.material.opacity = e * sa;
    if (B.dotsP) { B.dotsP.material.opacity = e * sa; B.dotsP.userData.line.material.opacity = .28 * e * sa; }
    Q0.copy(camera.quaternion);
    B.tiles.forEach(t => {
      const it = t.it, near = t.by + t.h > view0 - 400 && t.by < view1 + 400;
      const dim = pieceIt && pieceIt.id !== it.id ? .22 : 1;
      if (t.peak) { const on = selIt && selIt.id === it.id || pieceIt && pieceIt.id === it.id; t.peak.material.opacity = e * sa * (on ? 1 : .55) * dim; t.peak.scale.setScalar(on ? 40 + 6 * Math.sin(tms / 300) : 26); }
      if (t.dot) t.dot.material.opacity = e * sa * dim;
      if (t.capM) t.capM.material.opacity = e * sa * (pieceIt ? (pieceIt.id === it.id && !t.wave ? 0 : .04) : 1);
      const m = t.mesh; if (!m) return;
      const isP = pieceIt && pieceIt.id === it.id;
      if ((near || isP) && bloom > .05) loadTile(t);
      const home = it._home;
      const d = (t.i % 24) * .012, u = ease((bloom - d) / .7);
      m.visible = bloom > .01 && (near || isP || bloom < .99);
      if (!m.visible) return;
      if (home) {
        m.position.copy(home).lerp(t.world, u);
        QT.identity(); m.quaternion.copy(Q0).slerp(QT, u);
        const w0 = it.chapter === 'film' ? 46 : 32, ar = t.h / t.w;
        const sw = w0 + (t.w - w0) * u;
        m.scale.set(sw, sw * ar, 1);
      } else {
        m.position.copy(t.world); m.quaternion.identity();
        const s = .7 + .3 * u; m.scale.set(t.w * s, t.h * s, 1);
      }
      if (t.rot) m.rotation.z = t.rot * u;
      if (t.mat) { t.mat.scale.set(1 + 10 / t.w, 1 + 10 / t.h, 1); t.mat.material.opacity = u * sa * dim; }
      const sel = selIt && selIt.id === it.id;
      m.material.opacity = Math.min(1, u * 1.2) * sa * dim * (m.material.map ? 1 : .8);
      if (sel && !pieceIt) m.position.z += 3;
      t.cur = m.position;
    });
    const st = selIt && !pieceIt && B.byId.get(selIt.id);
    if (st && bloom > .6) {
      const hh = st.h + (st.chh || 0), cy = st.world.y - (st.chh || 0) / 2;
      selBox.position.set(st.world.x, cy, st.world.z + 4); selBox.scale.set(st.w + 6, hh + 6, 1); selBox.rotation.z = st.rot || 0;
      selBox.material.opacity = .95 * e;
    } else selBox.material.opacity = 0;
  },
  labels(label, proj) {
    if (!cur || bloom < .6 || !selIt || pieceIt || cur.k !== 'photo') return;
    const t = cur.byId.get(selIt.id); if (!t) return;
    const p = proj(t.world.x, t.world.y + t.h / 2, t.world.z); if (!p) return;
    const title = selIt.title && selIt.title !== 'untitled' ? selIt.title : 'tap again to open';
    label(title.replace(/[&<>]/g, ''), 'sel', p[0], p[1] - 6, .5, 1, 1);
  },
  relayout() { Object.keys(boards).forEach(k => { dispose(boards[k]); delete boards[k]; }); const k = cur && cur.k; cur = null; if (k && bloomT > 0) this.open(k); },
  resize(w, h) { W = w; H = h; const k = cur && cur.k, open = bloomT > 0; if (cur && cur.sig !== W + 'x' + H) { const s = scrollT; Object.keys(boards).forEach(kk => { dispose(boards[kk]); delete boards[kk]; }); cur = null; if (k && open) { this.open(k); scroll = scrollT = Math.min(s, this.maxScroll()); } } }
};
