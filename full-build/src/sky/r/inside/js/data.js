/* Everything shown here comes from m4 (read-only): ../u4-opus-m4/data.json, js/nov9.js, js/frames.js, js/reelshots.js, js/joio.js.
   Constellation shapes, angles and the in-progress cluster are m4's (js/sky.js SH / ANG / ANGP / cluster). */
export const M4 = '../u4-opus-m4/';
export const ORDER = ['film', 'photo', 'objects', 'sound', 'about'];
const ANG = {about: -90, photo: -18, objects: 54, sound: 126, film: 198};
const ANGP = {about: -90, photo: -36, objects: 36, sound: 144, film: 216};
const SH = {"film":{"s":[[0.105,0.21,0.92,0],[0.89,0.13,0.74,0],[0.93,0.81,0.96,0],[0.065,0.86,0.68,0],[0.209,0.266,0.34,0],[0.33,0.252,0.44,0],[0.465,0.272,0.3,0],[0.685,0.23,0.4,0],[0.809,0.261,0.3,0],[0.201,0.781,0.4,0],[0.297,0.725,0.28,0],[0.431,0.764,0.44,0],[0.533,0.752,0.3,0],[0.679,0.775,0.38,0],[0.816,0.721,0.3,0],[0.075,0.53,0.36,0],[0.485,0.5,0.5,0],[0.98,0.44,0.22,1],[0.025,0.3,0.2,1],[0.58,0.04,0.2,1],[0.35,0.95,0.24,1]],"e":[[0,1],[1,2],[2,3],[3,15]]},"photo":{"s":[[0.505,0.51,1,0],[0.521,0.164,0.82,0],[0.686,0.425,0.62,0],[0.654,0.71,0.9,0],[0.49,0.851,0.58,0],[0.33,0.64,0.78,0],[0.336,0.268,0.66,0],[0.586,0.449,0.3,0],[0.564,0.618,0.36,0],[0.486,0.667,0.28,0],[0.433,0.551,0.38,0],[0.447,0.42,0.3,0],[0.522,0.344,0.34,0],[0.15,0.2,0.24,1],[0.84,0.86,0.2,1],[0.88,0.22,0.3,1]],"e":[[1,2],[2,3],[3,4],[5,6],[6,1],[1,7],[2,8],[3,9],[4,10],[5,11],[6,12]]},"objects":{"s":[[0.32,0.37,0.78,0],[0.585,0.33,0.98,0],[0.605,0.89,0.74,0],[0.305,0.92,0.6,0],[0.465,0.12,0.5,0],[0.735,0.09,0.7,0],[0.755,0.63,0.55,0],[0.45,0.64,0.2,0],[0.18,0.22,0.26,1],[0.89,0.4,0.22,1],[0.8,0.92,0.3,1],[0.31,0.65,0.3,0]],"e":[[0,1],[1,2],[2,3],[3,11],[11,0],[4,5],[5,6],[0,4],[1,5],[2,6]]},"sound":{"s":[[0.058,0.493,0.35,0],[0.143,0.434,0.45,0],[0.195,0.295,0.63,0],[0.186,0.645,0.45,0],[0.282,0.392,0.53,0],[0.338,0.216,0.8,0],[0.347,0.763,0.55,0],[0.441,0.135,0.92,0],[0.442,0.812,0.62,0],[0.498,0.253,0.71,0],[0.567,0.183,0.86,0],[0.57,0.827,0.58,0],[0.659,0.355,0.57,0],[0.718,0.259,0.66,0],[0.719,0.711,0.47,0],[0.807,0.434,0.44,0],[0.886,0.419,0.5,0],[0.941,0.497,0.35,0],[0.26,0.93,0.2,1],[0.61,0.06,0.24,1],[0.9,0.88,0.26,1],[0.15,0.7,0.3,1]],"e":[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]]},"about":{"s":[[0.309,0.271,0.7,0],[0.209,0.272,0.45,0],[0.113,0.366,0.6,0],[0.067,0.587,0.85,0],[0.103,0.808,0.5,0],[0.202,0.903,0.6,0],[0.31,0.882,0.55,0],[0.361,0.254,0.5,0],[0.46,0.301,0.4,0],[0.475,0.408,0.7,0],[0.422,0.569,0.42,0],[0.362,0.556,0.5,0],[0.583,0.94,0.65,0],[0.589,0.61,0.55,0],[0.681,0.587,0.5,0],[0.738,0.451,0.45,0],[0.748,0.224,0.9,0],[0.932,0.127,0.5,0],[0.963,0.206,0.8,0],[0.956,0.305,0.55,0],[0.917,0.366,0.36,0],[0.88,0.28,0.2,0],[0.45,0.92,0.22,1],[0.5,0.1,0.2,1]],"e":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,8],[8,9],[9,10],[10,11],[12,13],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20]]}};
const CLUSTER = ['objects/hand-carved-piece','objects/design-board','objects/wireframe-board','objects/materials-board','sound/to-go','sound/track/noproblem','sound/track/lostintime','sound/track/equals','sound/track/ii'];

/* Private (never) and held (wait for Gill) files, plus vidA.mp4. Anything whose path matches is dropped before it reaches the page. */
const BANNED = /IMG_1936|IMG_1188|IMG_1189|IMG_6405|IMG_6606|IMG_6612|22179A95|IMG_5722|IMG_1187|IMG_6881|vidA|63754481495__B826C373|E9A51F6C-43C3|IMG_0844|IMG_2013|IMG_3450|IMG_1136|IMG_1138|IMG_1144|IMG_1924|IMG_2943|IMG_5510|IMG_6315|IMG_6319|IMG_6320|IMG_5002|IMG_5004|IMG_9316|IMG_5910|IMG_9415|IMG_5950|IMG_6625|IMG_6626|IMG_6634|IMG_6635|IMG_9720|1C59016F-433B|63356826146__A528E774|youtu/i;
export function ok(p) { return !!p && !BANNED.test(p); }
export function src(p) { if (!ok(p)) return ''; return /^(https?:|data:|blob:)/.test(p) ? p : M4 + p; }

export function rnd(i) { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
export function tintOf(s) { return s.split(',').map(v => +v / 255); }

export const D = {chapters: {}, byId: {}, cluster: [], tracks: [], poem: [], bio: []};

export async function load() {
  const d = await fetch(M4 + 'data.json').then(r => r.json());
  D.poem = d.poem || []; D.bio = d.bio || []; D.tracks = d.tracks || [];
  let n = 0;
  d.chapters.forEach(ch => {
    const c = D.chapters[ch.k] = {k: ch.k, nm: ch.nm, tint: tintOf(ch.tint), rgb: ch.tint, items: [], sky: [], board: [], x: 0, y: 0, z: 0, r: 100};
    ch.cards.forEach(card => {
      const it = Object.assign({i: n++}, card);
      if (it.media) { it.media = Object.assign({}, it.media); ['thumb', 'big', 'clip', 'pv'].forEach(f => { if (it.media[f] && !ok(it.media[f])) it.media[f] = ''; }); it.media.frames = (it.media.frames || []).filter(ok); }
      c.items.push(it); D.byId[it.id] = it;
    });
  });
  D.tracks.forEach(t => {
    const id = 'sound/track/' + t.k;
    if (D.byId[id] || !ok(t.file)) return;
    D.byId[id] = {i: n++, id, chapter: 'sound', k: t.k, slug: t.k, title: t.title, role: t.artist, meta: t.artist, kind: 'track', track: t, media: {}, credits: [], in_progress: t.artist === 'Lost Coffee' && t.k !== 'togo', isNew: false};
  });
  D.cluster = CLUSTER.map(id => D.byId[id]).filter(Boolean);
  const inCluster = new Set(D.cluster.map(it => it.id));
  /* Sky: m4's skyItems (minus in-progress and the cluster); objects shows all of its pieces; sound's songs are its stars. */
  ORDER.forEach(k => {
    const c = D.chapters[k];
    if (k === 'objects') c.sky = c.items.slice();
    else if (k === 'sound') c.sky = D.tracks.map(t => D.byId['sound/track/' + t.k]).filter(Boolean).concat(c.items.filter(it => !inCluster.has(it.id) && !it.in_progress));
    else c.sky = c.items.filter(it => !it.in_progress && !inCluster.has(it.id));
  });
  /* Nov 9 media: boards and rooms only, never the sky layout (as in m4). */
  const nov = {};
  (window.NOV9 || []).forEach(f => {
    if (!D.chapters[f.k] || !ok(f.big) || !ok(f.thumb) || !ok(f.name)) return;
    const slug = 'nov9-' + f.name.toLowerCase();
    const it = {i: n++, id: f.k + '/' + slug, chapter: f.k, k: 'nov9', slug, title: '', role: '', meta: '', kind: f.k === 'film' ? 'still' : (f.k === 'photo' ? 'photo' : 'object'), of: f.of || '', nov9: 1,
      media: {thumb: f.thumb, big: f.big, clip: ok(f.clip) ? f.clip : '', w: f.w, h: f.h}, credits: [], isNew: false};
    D.byId[it.id] = it; (nov[f.k] = nov[f.k] || []).push(it);
  });
  ORDER.forEach(k => {
    const c = D.chapters[k];
    if (k === 'sound') c.board = D.tracks.map(t => D.byId['sound/track/' + t.k]).filter(Boolean).concat(c.items.filter(it => it.id !== 'sound/to-go'));
    else if (k === 'objects') {
      const named = [], loose = (nov.objects || []).filter(f => !f.of || !D.byId[f.of]);
      c.items.forEach(it => { named.push(it); (nov.objects || []).forEach(f => { if (f.of === it.id) named.push(f); }); });
      c.board = named.concat(loose);
    } else c.board = c.items.concat(nov[k] || []);
  });
  return D;
}

/* m4 placeChapter: items take the brightest shape stars first, then a staggered grid inside the ellipse. Depth is new: each star gets its own z. */
function placeChapter(c, port) {
  const S = SH[c.k], items = c.sky;
  let cw = c.k === 'photo' || c.k === 'objects' ? 60 : 74, chh = c.k === 'photo' || c.k === 'objects' ? 78 : 56;
  if (c.k === 'about') { cw = 120; chh = 40; }
  const nn = Math.max(items.length, 1), A = Math.max(nn * cw * chh * 1.35, 380 * 190), q = port ? .92 : .5;
  let bw = Math.sqrt(A / q); const bh = bw * q; if (c.k === 'about') bw = Math.max(bw, port ? 300 : 420);
  c.bw = bw; c.bh = bh;
  const P = S.s.map((p, i) => ({i, ox: (p[0] - .5) * bw, oy: (p[1] - .5) * bh, b: p[2], st: p[3]}));
  const order = P.filter(p => !p.st).sort((a, b) => b.b - a.b || a.i - b.i);
  const list = items.slice().sort((a, b) => (b.isNew - a.isNew) || (a.i - b.i));
  const placed = [], node = []; let ii = 0;
  const free = (x, y) => placed.every(p => !(Math.abs(p.ox - x) < cw * .92 && Math.abs(p.oy - y) < chh * .92));
  order.forEach(p => { if (ii >= list.length) return; if (free(p.ox, p.oy)) { const it = list[ii++]; it.ox = p.ox; it.oy = p.oy; it.b = p.b; placed.push(it); node[p.i] = it; } });
  const cand = [];
  for (let r = -8; r <= 8; r++) for (let qq = -8; qq <= 8; qq++) { const x = (qq + ((r & 1) ? .5 : 0)) * cw, y = r * chh; cand.push({x, y, d: (x / (bw / 2)) ** 2 + (y / (bh / 2)) ** 2}); }
  cand.sort((a, b) => a.d - b.d);
  for (let ci = 0; ii < list.length && ci < cand.length; ci++) { const p = cand[ci]; if (free(p.x, p.y)) { const it = list[ii++]; it.ox = p.x; it.oy = p.y; it.b = .35; placed.push(it); } }
  P.forEach(p => { if (!node[p.i]) node[p.i] = {ox: p.ox, oy: p.oy, b: p.b, dec: 1}; });
  c.node = node; c.dec = node.filter(nd => nd.dec);
  c.edges = S.e.map(e => [node[e[0]], node[e[1]]]).filter(e => e[0] && e[1]);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const inc = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  items.forEach(it => inc(it.ox, it.oy)); c.dec.forEach(d => inc(d.ox, d.oy));
  c.ex = {x0: x0 - 16, y0: y0 - 16, x1: x1 + 16, y1: y1 + 16};
  c.r = Math.max(x1 - x0, y1 - y0) / 2 + 20;
  const DZ = {film: -70, photo: 40, objects: -20, sound: 60, about: -40};
  c.z = DZ[c.k];
  /* m4's y grows downwards; the 3D world's y grows up. */
  items.forEach((it, j) => { it.oz = (rnd(it.i * 7.1 + 3) - .5) * Math.min(90, c.r * .5); });
  c.dec.forEach((d, j) => { d.oz = (rnd(j * 3.3 + c.z) - .5) * Math.min(90, c.r * .5); });
}

export function layout(port) {
  const C = D.chapters;
  ORDER.forEach(k => placeChapter(C[k], port));
  let rx = port ? 300 : 500, ry = port ? 460 : 380;
  const centre = {x0: -70, y0: -80, x1: 70, y1: 160};
  const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  for (let n = 0; n < 40; n++) {
    ORDER.forEach(k => { const a = (port ? ANGP : ANG)[k] * Math.PI / 180; C[k].x = Math.cos(a) * rx; C[k].y = Math.sin(a) * ry; });
    const R = ORDER.map(k => { const c = C[k]; return {x0: c.x + c.ex.x0, x1: c.x + c.ex.x1, y0: c.y + c.ex.y0, y1: c.y + c.ex.y1 + 40}; });
    let bad = R.some(r => hit(r, centre));
    for (let i = 0; i < R.length && !bad; i++) for (let j = i + 1; j < R.length; j++) if (hit(R[i], R[j])) bad = true;
    if (!bad) break; rx *= 1.05; ry *= 1.05;
  }
  ORDER.forEach(k => {
    const c = C[k];
    c.sky.forEach(it => { it.sx = c.x + it.ox; it.sy = -(c.y + it.oy); it.sz = c.z + it.oz; });
    c.dec.forEach(d => { d.sx = c.x + d.ox; d.sy = -(c.y + d.oy); d.sz = c.z + d.oz; });
    c.cx = c.x; c.cy = -c.y; c.cz = c.z;
    c.labelY = -(c.y + c.ex.y1) - 6;
  });
  const nC = Math.max(D.cluster.length, 1);
  D.cluster.forEach((it, i) => { const a = -Math.PI / 2 + i / nC * Math.PI * 2; it.qx = 280 + Math.cos(a) * 78; it.qy = -(36 + Math.sin(a) * 56); it.qz = 30; });
  let b = {x0: -80, x1: 80, y0: -200, y1: 90};
  ORDER.forEach(k => { const c = C[k]; b.x0 = Math.min(b.x0, c.x + c.ex.x0); b.x1 = Math.max(b.x1, c.x + c.ex.x1); b.y0 = Math.min(b.y0, -(c.y + c.ex.y1) - 36); b.y1 = Math.max(b.y1, -(c.y + c.ex.y0) + 20); });
  D.box = b;
  return D;
}

export function filmKey(it) {
  if (!it) return null;
  if (it.slug === 'reel-2026' || it.k === 'w0') return 'reel';
  const m = /^w(\d+)$/.exec(it.k || ''); if (!m) return null;
  return m[1].length < 2 ? '0' + m[1] : m[1];
}
