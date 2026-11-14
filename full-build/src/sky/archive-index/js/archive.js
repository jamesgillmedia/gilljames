/* archive index — numbered-box field of every swept film frame.
   Canvas field (pan / pinch / wheel zoom), tap a box to lift it out.
   Nothing ever advances on its own. */
(() => {
'use strict';
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const vp = document.getElementById('vp'), cv = document.getElementById('cv'), cx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const CW = 160, CH = 90, GX = 12, GY = 12, HEAD = 62, FGAP = 30, PAD = 24;
const MONO = 'ui-monospace,"SFMono-Regular","SF Mono",Menlo,Consolas,"DejaVu Sans Mono","Liberation Mono",monospace';
const RED = '229,55,44';
/* red mode: every canvas colour is remapped to a deep darkroom red (images are drawn untouched, so they stay true colour) */
const remapCache = new Map(); let rmOn = false;
function toRed(v) {
  if (!rmOn || typeof v !== 'string') return v;
  let r = remapCache.get(v); if (r) return r;
  let c = null, m;
  if ((m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/.exec(v))) c = [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]];
  else if ((m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v))) { let h = m[1]; if (h.length === 3) h = h.replace(/./g, '$&$&'); c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]; }
  if (!c) return v;
  const mx = Math.max(c[0], c[1], c[2]);
  if (mx < 40) r = v;                                   // black stays dark
  else { const l = Math.min(1, mx / 255), k = x => Math.round(x); r = 'rgba(' + k(24 + 198 * l) + ',' + k(5 + 47 * l) + ',' + k(9 + 57 * l) + ',' + c[3] + ')'; }
  remapCache.set(v, r); return r;
}
{ const P = CanvasRenderingContext2D.prototype;
  for (const k of ['fillStyle', 'strokeStyle']) { const d = Object.getOwnPropertyDescriptor(P, k); Object.defineProperty(cx, k, { get() { return d.get.call(cx); }, set(v) { d.set.call(cx, toRed(v)); }, configurable: true }); } }
addEventListener('rmchange', e => { rmOn = e.detail.rm; dirty = true; });
if (window.GJ_RM) rmOn = GJ_RM.on();
let D, F = [], films = [], mode = 'film', hi = null;  // hi = highlighted film index
let L = null;            // layout
let vw = 0, vh = 0, dpr = 1, TOP = 46;
let s = 1, ox = 0, oy = 0;
/* environmental drift: while you drag or pinch (never on scroll, never fully zoomed out) the whole panel lags a few px behind your hand,
   near layers (outlines, numerals) a touch more than far ones (images, then film headers). Site springs ease it back. Reduce Motion: none. */
const dr = { x: S(0, 9.5), y: S(0, 9.5) }; let dvx = 0, dvy = 0, dlast = 0;
const DRIFT_MAX = 5;   // screen = (world - o) * s
let dirty = true, cur = -1;  // cur = lifted frame index
// box chrome: 'boxes' (full red outlines + tags), 'dim' (~28% outlines/tags, no red fill), 'hide' (none)
const BOXK = 'archive-index-boxes', BOXV = ['boxes', 'dim', 'hide'];
let bx = 'boxes';
try { const v = localStorage.getItem(BOXK); if (BOXV.includes(v)) bx = v; } catch (e) {}

const pad4 = n => String(n).padStart(4, '0');

/* ---------- images ---------- */
const cache = new Map(); let inflight = 0; const want = [];
function img(src) {
  let e = cache.get(src);
  if (e) { if (e.ok) { cache.delete(src); cache.set(src, e); } return e.ok ? e.im : null; }
  want.push(src); return null;
}
function pump() {
  while (inflight < 14 && want.length) {
    const src = want.shift();
    if (cache.has(src)) continue;
    const im = new Image(); im.decoding = 'async';
    const e = { im, ok: false }; cache.set(src, e); inflight++;
    im.onload = () => { e.ok = true; inflight--; dirty = true; pump(); };
    im.onerror = () => { inflight--; pump(); };
    im.src = src;
  }
  // light LRU on big tier
  if (cache.size > 900) {
    let n = cache.size - 900;
    for (const [k, e] of cache) { if (n <= 0) break; if (e.ok && !k.includes('/atlas/')) { cache.delete(k); n--; } }
  }
}

/* ---------- layout ---------- */
/* Beyond: when active the whole field is laid out continuously in rank order (best match first). Selection only: no frame is ever filtered or tinted. */
let bperm = null, bgal = 0, FN = 0, searchH = 0;   // FN = the stills; film clips are appended after them and only exist inside a search gallery
const GK = 2.4;   // gallery tiles are this much larger than field tiles
const kk = g => (L && L.k ? L.k[g] : 1);
function build(cols) {
  const r = new Float32Array(F.length * 2).fill(-1e7), k = new Float32Array(F.length).fill(1); const heads = [];
  let gal = null;
  let y = PAD, W = PAD * 2 + cols * CW + (cols - 1) * GX;
  if (mode === 'film' && !bperm) {
    films.forEach((f, k) => {
      if (k) y += FGAP;
      heads.push({ k, y });
      y += HEAD;
      f.frames.forEach((x, j) => {
        const c = j % cols, rr = (j / cols) | 0;
        r[x.g * 2] = PAD + c * (CW + GX); r[x.g * 2 + 1] = y + rr * (CH + GY);
      });
      y += Math.ceil(f.frames.length / cols) * (CH + GY) - GY;
    });
  } else {
    let j0 = 0;
    if (bperm && bgal > 0) {   // a colour step: the leading frames gather into a calm gallery panel (a light table), the rest follow below it
      const K = bgal, GW = CW * GK, GH = CH * GK, inner = W - 2 * PAD, fva = apFit(), gcw = Math.floor((inner + GX) / (GW + GX)), gc = Math.max(1, Math.min(K, gcw, Math.max(3, Math.min(12, Math.round(Math.sqrt(K * (fva.w / fva.h) / 1.78))))));   // a compact table in the shape of the screen
      const rows = Math.ceil(K / gc), gwid = gc * GW + (gc - 1) * GX, gx0 = (W - gwid) / 2, gy0 = y + HEAD * .95;
      gal = { x: gx0 - 20, y, w: gwid + 40, h: HEAD * .95 + rows * (GH + GY) - GY + 24, n: K };
      for (let j = 0; j < K; j++) { const g = bperm[j], c = j % gc, rr = (j / gc) | 0; r[g * 2] = gx0 + c * (GW + GX); r[g * 2 + 1] = gy0 + rr * (GH + GY); k[g] = GK; }
      y = gal.y + gal.h + FGAP * 1.4; j0 = K;
    }
    const total = bperm ? bperm.length : FN;
    for (let j = j0; j < total; j++) {
      const g = bperm ? bperm[j] : j, jj = j - j0, c = jj % cols, rr = (jj / cols) | 0;
      r[g * 2] = PAD + c * (CW + GX); r[g * 2 + 1] = y + rr * (CH + GY);
    }
    y += Math.ceil((total - j0) / cols) * (CH + GY) - GY;
  }
  return { cols, r, k, kmax: gal ? GK : 1, gal, heads, W, H: y + PAD };
}
/* the eyepiece: a soft rounded-rectangle aperture (css px). The whole field fits inside it at the widest zoom, below the title bar and above the controls. */
function ap() {
  const cr = document.querySelector('.corner'), bot = cr ? Math.max(40, vh - cr.getBoundingClientRect().top + 8) : 56;
  const vv = window.visualViewport, vhe = vv ? Math.min(vh, vv.height + vv.offsetTop) : vh;   // with the phone keyboard up the results stay in what you can see
  const x = 10, y = TOP + 8 + searchH, w = Math.max(60, vw - x * 2), h = Math.max(60, vhe - y - bot);
  return { x, y, w, h, r: Math.max(14, Math.min(46, Math.min(w, h) * .06)) };
}
function apFit() { const a = ap(), ins = a.r * .3 + 3; return { w: a.w - 2 * ins, h: a.h - 2 * ins, cx: a.x + a.w / 2, cy: a.y + a.h / 2 }; }
function layout() {
  const fv = apFit(), a = fv.w / Math.max(1, fv.h);
  let best = null, bd = 1e9;
  for (let c = 5; c <= 90; c++) {
    const l = build(c); const d = Math.abs(Math.log((l.W / l.H) / a));
    if (d < bd) { bd = d; best = l; }
  }
  L = best;
}
function fitS() { const fv = apFit(); return Math.min(fv.w / L.W, fv.h / L.H); }
function minS() { return fitS() * 0.85; }
function maxS() { return Math.max(vw, vh) * 0.9 / CW; }
function fit(anim) { const t = fitS(), fv = apFit(); go(t, L.W / 2 - fv.cx / t, L.H / 2 - fv.cy / t, anim); }
function clamp() {
  s = Math.min(maxS(), Math.max(minS(), s));
  const ww = L.W * s, wh = L.H * s;
  // keep some of the field on screen; centre if it is smaller than the view
  const A = ap(), fv = apFit();
  const mx = ww <= fv.w + 1 ? (L.W / 2 - fv.cx / s) : null;
  const my = wh <= fv.h + 1 ? (L.H / 2 - fv.cy / s) : null;
  ox = mx !== null ? mx : Math.min(L.W - (A.x + A.w - 40) / s, Math.max(-(A.x + 40) / s, ox));
  oy = my !== null ? my : Math.min(L.H - (A.y + A.h - 40) / s, Math.max(-(A.y + 40) / s, oy));
}
let anim = null;
function go(ts, tx, ty, a) {
  if (!a || RM.matches) { s = ts; ox = tx; oy = ty; clamp(); dirty = true; return; }
  const s0 = s, x0 = ox, y0 = oy, t0 = performance.now(), dur = 420;
  anim = t => {
    let k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
    // interpolate in log-scale, keep centre path smooth
    s = s0 * Math.pow(ts / s0, k);
    const c0x = x0 + vw / 2 / s0, c0y = y0 + vh / 2 / s0, c1x = tx + vw / 2 / ts, c1y = ty + vh / 2 / ts;
    ox = c0x + (c1x - c0x) * k - vw / 2 / s; oy = c0y + (c1y - c0y) * k - vh / 2 / s;
    dirty = true;
    if (k >= 1) { anim = null; clamp(); }
  };
}
function zoomAt(f, px, py) {
  const wx = ox + px / s, wy = oy + py / s;
  s = Math.min(maxS(), Math.max(minS(), s * f));
  ox = wx - px / s; oy = wy - py / s; clamp(); dirty = true;
}
function focusOn(g, a) {   // centre a frame at a readable size
  const x = L.r[g * 2], y = L.r[g * 2 + 1];
  const ts = Math.max(s, Math.min(maxS(), Math.min(vw, vh) * 0.32 / CW));
  go(ts, x + CW / 2 - vw / 2 / ts, y + CH / 2 - (vh + TOP) / 2 / ts, a);
}

/* ---------- draw ---------- */
function resize() {
  const ctr = L ? centreFrame() : -1;
  dpr = Math.min(2.5, window.devicePixelRatio || 1);
  vw = innerWidth; vh = innerHeight;
  cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
  TOP = document.querySelector('.top').getBoundingClientRect().height;
  if (!F.length) return;
  const fitted = !L || s <= fitS() * 1.05;
  layout();
  if (fitted || ctr < 0) fit(false); else { const ts = s; go(ts, L.r[ctr * 2] + CW / 2 - vw / 2 / ts, L.r[ctr * 2 + 1] + CH / 2 - vh / 2 / ts, false); }
  if (cur >= 0) placeLift(false);
  dirty = true;
}
function centreFrame() {
  const wx = ox + vw / 2 / s, wy = oy + vh / 2 / s; let b = -1, bd = 1e18;
  for (let g = 0; g < F.length; g++) { const dx = L.r[g * 2] + CW / 2 - wx, dy = L.r[g * 2 + 1] + CH / 2 - wy, d = dx * dx + dy * dy; if (d < bd) { bd = d; b = g; } }
  return b;
}
function draw() {
  want.length = 0;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.fillStyle = '#0a0b0d'; cx.fillRect(0, 0, vw, vh);
  const lay = f => cx.setTransform(dpr, 0, 0, dpr, Math.round(dr.x.x * f * dpr), Math.round(dr.y.x * f * dpr)); lay(1);
  cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
  const bw = CW * s, bh = CH * s, dev = bw * dpr;
  const tier = dev <= 100 ? 0 : dev <= 300 ? 1 : 2;
  const km = L.kmax || 1, x0 = ox - CW * km, x1 = ox + vw / s, y0 = oy - CH * km, y1 = oy + vh / s;
  const oa = bw < 7 ? .2 : bw < 18 ? .36 : bw < 40 ? .55 : .72;
  const lw = bw < 30 ? 1 / dpr * Math.max(1, dpr * .75) : 1;
  const showNum = bw >= 58, fs = Math.max(8.5, Math.min(12.5, bw * .072));
  const vis = [];
  for (let g = 0; g < F.length; g++) {
    const wx = L.r[g * 2], wy = L.r[g * 2 + 1];
    if (wx < x0 || wx > x1 || wy < y0 || wy > y1) continue;
    vis.push(g);
  }
  if (L.gal) {   // the light table: an opaque panel with a hairline edge, a thin lit top edge and a caption, in the archive's refined style
    lay(.8);
    const G = L.gal, gx = (G.x - ox) * s, gy = (G.y - oy) * s, gw = G.w * s, gh = G.h * s;
    cx.fillStyle = '#101215'; cx.fillRect(gx, gy, gw, gh);
    cx.lineWidth = 1; cx.strokeStyle = 'rgba(255,255,255,.1)'; cx.strokeRect(snap(gx) + .5, snap(gy) + .5, snap(gw) - 1, snap(gh) - 1);
    cx.strokeStyle = 'rgba(255,255,255,.2)'; cx.beginPath(); cx.moveTo(gx + 1, snap(gy) + 1.5); cx.lineTo(gx + gw - 1, snap(gy) + 1.5); cx.stroke();
    const gts = Math.min(15, HEAD * s * .34);
    if (gts >= 6.5) {
      const si = selInfo(); cx.textBaseline = 'alphabetic';
      cx.font = `400 ${gts}px "Julius Sans One",sans-serif`; cx.fillStyle = 'rgba(238,240,242,.9)'; cx.fillText(si.title, gx + 20 * s, gy + HEAD * s * .56, Math.max(40, gw - 40 * s - 120 * s));
      cx.font = `400 ${Math.max(6, gts * .78)}px ${MONO}`; cx.fillStyle = 'rgba(150,157,162,.9)'; const ct = si.n.toLocaleString('en-US') + ' of ' + si.tot.toLocaleString('en-US'), cw_ = cx.measureText(ct).width; cx.fillText(ct, gx + gw - 20 * s - cw_, gy + HEAD * s * .56);
      cx.strokeStyle = 'rgba(255,255,255,.12)'; cx.beginPath(); cx.moveTo(gx + 20 * s, snap(gy + HEAD * s * .76) + .5); cx.lineTo(gx + gw - 20 * s, snap(gy + HEAD * s * .76) + .5); cx.stroke();
    }
    lay(1);
  }
  // atlases first (needed for tier 0 and as a fallback)
  for (const g of vis) {
    const x = F[g], f = films[x.f], kg = L.k[g], gbw = bw * kg, gbh = bh * kg, gdev = gbw * dpr, tier = gdev <= 100 ? 0 : gdev <= 300 ? 1 : 2;
    const sx = (wxS(g)), sy = (wyS(g));
    if (x.vid) {   // a film clip: its poster frame, a play mark on top; the clip plays muted in a layer over the tile on tap or hover
      let im = tier === 2 ? img(x.posterL) : null; if (!im) im = img(x.poster);
      if (im) drawContain(im, 0, 0, im.naturalWidth, im.naturalHeight, sx, sy, gbw, gbh); else { cx.fillStyle = '#141619'; cx.fillRect(sx, sy, gbw, gbh); }
      continue;
    }
    let drawn = false;
    if (tier >= 1) {
      const src = (tier === 2 ? 'media/l/' : 'media/s/') + f.slug + '/' + x.id + '.webp';
      let im = img(src);
      if (!im && tier === 2) im = img('media/s/' + f.slug + '/' + x.id + '.webp');
      if (im) { drawContain(im, 0, 0, im.naturalWidth, im.naturalHeight, sx, sy, gbw, gbh); drawn = true; }
    }
    if (!drawn) {
      const at = img(f.atlas.src);
      if (at) {
        const j = x.j, a = f.atlas;
        cx.drawImage(at, (j % a.cols) * a.cw, ((j / a.cols) | 0) * a.ch, a.cw, a.ch, sx, sy, gbw, gbh);
      } else { cx.fillStyle = '#141619'; cx.fillRect(sx, sy, gbw, gbh); }
    }
  }
  // veil for non-highlighted films
  if (hi !== null) {
    cx.fillStyle = 'rgba(10,11,13,.72)';
    for (const g of vis) if (F[g].f !== hi) cx.fillRect(wxS(g) - 1, wyS(g) - 1, bw * L.k[g] + 2, bh * L.k[g] + 2);
  }
  lay(1.3);
  // outlines (box chrome: boxes / dim / hide)
  const BA = bx === 'dim' ? .28 : 1;
  if (bx !== 'hide') {
  cx.lineWidth = lw;
  cx.strokeStyle = `rgba(${RED},${(hi !== null ? oa * .35 : oa) * BA})`;
  cx.beginPath();
  for (const g of vis) if (hi === null || F[g].f !== hi) { const sx = wxS(g), sy = wyS(g); cx.rect(snap(sx) + lw / 2, snap(sy) + lw / 2, snap(bw * L.k[g]) - lw, snap(bh * L.k[g]) - lw); }
  cx.stroke();
  if (hi !== null) {
    cx.lineWidth = Math.max(lw, bw > 40 ? 1.5 : 1); cx.strokeStyle = `rgba(${RED},${BA})`; cx.beginPath();
    for (const g of vis) if (F[g].f === hi) { const sx = wxS(g), sy = wyS(g); cx.rect(snap(sx) + .5, snap(sy) + .5, snap(bw * L.k[g]) - 1, snap(bh * L.k[g]) - 1); }
    cx.stroke();
  }
  if (hov >= 0 && cur < 0) {
    cx.lineWidth = 1.5; cx.strokeStyle = `rgba(255,255,255,${bx === 'dim' ? .45 : 1})`; cx.strokeRect(wxS(hov), wyS(hov), bw * kk(hov), bh * kk(hov));
  }
  if (cur >= 0) { cx.lineWidth = 2; cx.strokeStyle = `rgba(${RED},${BA})`; cx.strokeRect(wxS(cur) - 1, wyS(cur) - 1, bw * kk(cur) + 2, bh * kk(cur) + 2); }
  }
  // numerals: red tag in the top-left corner, like the boxed sheet
  if ((showNum || km * bw >= 58) && bx !== 'hide') {
    cx.font = `500 ${fs}px ${MONO}`; cx.textBaseline = 'middle';
    const th = Math.round(fs + 5), tw = cx.measureText('0000').width + 7;
    for (const g of vis) {
      if (!showNum && L.k[g] * bw < 58) continue;
      const dim = hi !== null && F[g].f !== hi;
      const sx = snap(wxS(g)), sy = snap(wyS(g));
      if (bx === 'dim') {   // no red fill: faint red numeral on a dark chip
        cx.fillStyle = 'rgba(10,11,13,.35)'; cx.fillRect(sx, sy, tw, th);
        cx.fillStyle = `rgba(${RED},${dim ? .14 : .3})`;
      } else {
        cx.fillStyle = dim ? 'rgba(120,36,30,.8)' : `rgb(${RED})`;
        cx.fillRect(sx, sy, tw, th);
        cx.fillStyle = dim ? 'rgba(255,255,255,.45)' : '#fff';
      }
      cx.fillText(F[g].vid ? 'clip' : pad4(F[g].n), sx + 3.5, sy + th / 2 + .5);
    }
  }
  lay(.55);
  for (const g of vis) {   // clip tiles: a play mark (hidden while the clip plays on the tile)
    if (!F[g].vid || vcur === g) continue;
    const kg = L.k[g], tw_ = bw * kg, th_ = bh * kg, mx_ = wxS(g) + tw_ / 2, my_ = wyS(g) + th_ / 2, rr = Math.max(7, Math.min(24, tw_ * .085));
    cx.fillStyle = 'rgba(10,11,13,.6)'; cx.beginPath(); cx.arc(mx_, my_, rr, 0, 7); cx.fill();
    cx.strokeStyle = 'rgba(238,240,242,.85)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(mx_, my_, rr, 0, 7); cx.stroke();
    cx.fillStyle = 'rgba(238,240,242,.92)'; cx.beginPath(); cx.moveTo(mx_ - rr * .3, my_ - rr * .42); cx.lineTo(mx_ - rr * .3, my_ + rr * .42); cx.lineTo(mx_ + rr * .5, my_); cx.closePath(); cx.fill();
  }
  // film headers (by-film order)
  if (mode === 'film' && !bperm) {
    const hs = HEAD * s;
    for (const h of L.heads) {
      const sy = (h.y - oy) * s; if (sy > vh || sy + hs < -2) continue;
      const f = films[h.k], on = hi === h.k;
      const sx = (PAD - ox) * s, ex = (L.W - PAD - ox) * s;
      const redOn = on && bx === 'boxes';
      cx.strokeStyle = redOn ? `rgba(${RED},.9)` : on ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.12)'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(sx, snap(sy + hs * .82) + .5); cx.lineTo(ex, snap(sy + hs * .82) + .5); cx.stroke();
      const ts = Math.min(15, hs * .36);
      if (ts >= 6.5) {
        cx.textBaseline = 'alphabetic';
        cx.font = `400 ${ts}px "Julius Sans One",sans-serif`;
        cx.fillStyle = on ? '#fff' : (hi !== null ? 'rgba(238,240,242,.45)' : 'rgba(238,240,242,.86)');
        const label = f.title.toLowerCase();
        const lx = Math.max(sx, 12), rx = Math.min(ex, vw - 12);
        if (rx - lx < ts * 6) continue;
        cx.fillText(label, lx, sy + hs * .66, Math.max(10, rx - lx - ts * 11));
        cx.font = `400 ${Math.max(6, ts * .78)}px ${MONO}`;
        cx.fillStyle = redOn ? `rgb(${RED})` : on ? '#fff' : 'rgba(150,157,162,.9)';
        const rng = pad4(f.frames[0].n) + '–' + pad4(f.frames[f.frames.length - 1].n);
        const w = cx.measureText(rng).width; cx.fillText(rng, rx - w, sy + hs * .66);
      }
    }
  }
  pump();
  let a = 1e9, z = -1;
  for (const g of vis) { if (F[g].vid) continue; const sx = wxS(g), sy = wyS(g); if (sx + bw > 0 && sx < vw && sy + bh > TOP && sy < vh) { a = Math.min(a, F[g].n); z = Math.max(z, F[g].n); } }
  $('lvl').textContent = z > 0 ? pad4(a) + '–' + pad4(z) : '';
  placeClip();
}
const wxS = g => (L.r[g * 2] - ox) * s, wyS = g => (L.r[g * 2 + 1] - oy) * s;
const snap = v => Math.round(v * dpr) / dpr;
function drawContain(im, sx, sy, sw, sh, dx, dy, dw, dh) {
  const r = Math.min(dw / sw, dh / sh), w = sw * r, h = sh * r;
  cx.fillStyle = '#050506'; cx.fillRect(dx, dy, dw, dh);
  cx.drawImage(im, sx, sy, sw, sh, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h);
}
/* eyepiece render: the aperture mask is always there (content only shows inside it); the hairline edge shows only while something moves.
   Zooming in past the widest level scales the frame out and fades it on the site spring, so crossing it never pops or hard-clips. */
const eye = document.getElementById('eye'), eyeMask = document.getElementById('eyeMask'), eyeLine = document.getElementById('eyeLine');
const ez = S(0, 4.6); let eyeMoveT = 0, eyeA = 0, eyeKey = '';
const eyeNudge = () => { eyeMoveT = performance.now(); };
function eyePath(x, y, w, h, r) {
  const c = r * .42;
  return `M${x + r} ${y}H${x + w - r}C${x + w - c} ${y} ${x + w} ${y + c} ${x + w} ${y + r}V${y + h - r}C${x + w} ${y + h - c} ${x + w - c} ${y + h} ${x + w - r} ${y + h}H${x + r}C${x + c} ${y + h} ${x} ${y + h - c} ${x} ${y + h - r}V${y + r}C${x} ${y + c} ${x + c} ${y} ${x + r} ${y}Z`;
}
function eyeTick(dt, now) {
  if (!L) return;
  const a = ap(), z = s / fitS(), W_ = WTS();
  ez.t = clampN((z - 1.03) / .9, 0, 1); ez.w = W_.GLIDE; sstep(ez, dt);
  const zk = clampN(ez.x, 0, 1), spring = Math.abs(ez.x - ez.t) > .002 || Math.abs(ez.v) > .002;
  if (spring || anim || glide || Math.abs(dr.x.x) + Math.abs(dr.y.x) > .05 || P.size) { if (spring || anim || glide || P.size) eyeNudge(); }
  const kmax = Math.max(vw / a.w, vh / a.h) * 1.25, e3 = zk < .5 ? 4 * zk * zk * zk : 1 - Math.pow(-2 * zk + 2, 3) / 2, k = 1 + (kmax - 1) * e3;
  const m = clampN((zk - .45) / .55, 0, 1), maskA = 1 - m * m * (3 - 2 * m);
  const moving = now - eyeMoveT < 140;
  eyeA += ((moving ? 1 : 0) - eyeA) * (1 - Math.exp(-dt * (moving ? 22 : 4.2)));   // quick in, soft out about half a second after you stop
  if (eyeA < .002 && !moving) eyeA = 0;
  const w = a.w * k, h = a.h * k, x = a.x + a.w / 2 - w / 2, y = a.y + a.h / 2 - h / 2, r = a.r * k;
  const key = [vw, vh, w.toFixed(2), x.toFixed(2), y.toFixed(2), maskA.toFixed(3), eyeA.toFixed(3)].join();
  if (key === eyeKey) return; eyeKey = key;
  eye.style.visibility = maskA < .003 ? 'hidden' : 'visible';
  const d = eyePath(x, y, w, h, r);
  eyeMask.setAttribute('d', `M-2 -2H${vw + 2}V${vh + 2}H-2Z` + d); eyeMask.style.opacity = maskA.toFixed(3);
  eyeLine.setAttribute('d', d); eyeLine.style.opacity = (eyeA * maskA).toFixed(3);
  eye.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
}
let dlt = 0;
function loop(t) {
  const ddt = Math.min(.05, Math.max(.001, (t - dlt) / 1000)); dlt = t;
  eyeTick(ddt, t);
  if (Math.abs(dr.x.x) + Math.abs(dr.y.x) + Math.abs(dr.x.t) + Math.abs(dr.y.t) + Math.abs(dr.x.v) + Math.abs(dr.y.v) > .004) { sstep(dr.x, ddt); sstep(dr.y, ddt); dirty = true; }
  if (anim) anim(t);
  if (glide) glide(t);
  if (dirty) { dirty = false; if (!(cur >= 0 && bgA >= .995)) draw(); }
  requestAnimationFrame(loop);
}

function selInfo() {   // the caption of the gallery: the search, or the Beyond step
  const Sx = window.GJ_SEARCH; if (Sx && Sx.active) return { title: Sx.caption, n: Sx.total, tot: Sx.pool };
  const lab = GJ_BEYOND.label.split(' \u00b7 '); return { title: (lab[1] || lab[0]).toLowerCase(), n: L.gal.n, tot: FN };
}
/* film clips: tiles that exist only inside a search gallery; the clip plays muted in a layer over the tile on tap or hover, one at a time */
const vclip = $('vclip'); let vcur = -1;
function addClips(list) {
  if (!FN || F.length > FN) return;
  list.forEach(r => { const k = films.findIndex(f => f.slug === r.film), g = F.length; r.g = g; F.push({ vid: true, n: 0, id: r.id, i: 0, tc: '', t: 0, w: 1920, h: 1080, f: k, j: -1, g, clip: r.src, poster: r.poster, posterL: r.poster.replace('media/s/', 'media/l/') }); });
  layout(); dirty = true;
}
function startClip(g) {
  if (vcur === g || !F[g] || !F[g].vid) return; vcur = g; const x = F[g];
  if (vclip.getAttribute('src') !== x.clip) vclip.src = x.clip;
  vclip.muted = true; try { vclip.currentTime = 0; } catch (e) {} const pr = vclip.play(); if (pr && pr.catch) pr.catch(() => {});
  placeClip(); dirty = true;
}
function stopClip() { if (vcur < 0) return; vcur = -1; vclip.pause(); vclip.style.display = 'none'; dirty = true; }
function placeClip() {
  if (vcur < 0) return; const g = vcur, k = kk(g), w = CW * s * k, h = CH * s * k, sx = wxS(g) + dr.x.x, sy = wyS(g) + dr.y.x;
  if (L.r[g * 2] < -1e5 || sx + w < 0 || sx > vw || sy + h < TOP || sy > vh) { stopClip(); return; }
  const st = vclip.style; st.left = sx.toFixed(1) + 'px'; st.top = sy.toFixed(1) + 'px'; st.width = w.toFixed(1) + 'px'; st.height = h.toFixed(1) + 'px'; st.display = 'block';
}
function frameGallery(anim) {
  const G = L.gal; if (!G) return false; const fv = apFit();
  const ts = Math.min(maxS(), Math.max(minS(), Math.min(fv.w / G.w, fv.h / G.h) * .98));
  go(ts, G.x + G.w / 2 - fv.cx / ts, G.y + G.h / 2 - fv.cy / ts, anim); return true;
}
function applyBeyond() {
  const Bd = window.GJ_BEYOND || { active: false }; if (!L) return;
  const Sx = window.GJ_SEARCH, useS = !!(Sx && Sx.active);
  const np = useS ? Sx.order() : (Bd.active ? Bd.order() : null), ng = useS ? Sx.gallery : (np ? Bd.gallery : 0);
  stopClip();
  if (!np && !bperm) return;
  if (np && bperm && ng === bgal && np.length === bperm.length && np.every((g, i) => g === bperm[i])) return;
  const ctr = cur >= 0 ? cur : centreFrame(), fitted = s <= fitS() * 1.05;
  bperm = np; bgal = ng; layout();
  if (bgal) frameGallery(false);   // the gallery simply appears, framed
  else if (!np) fit(false);        // Off returns the full field
  else if (fitted) fit(false); else go(s, L.r[ctr * 2] + CW * kk(ctr) / 2 - vw / 2 / s, L.r[ctr * 2 + 1] + CH * kk(ctr) / 2 - vh / 2 / s, false);
  dirty = true;
}

/* ---------- hit test ---------- */
function hit(px, py) {
  px -= dr.x.x; py -= dr.y.x;
  const wx = ox + px / s, wy = oy + py / s;
  for (let g = 0; g < F.length; g++) {
    const x = L.r[g * 2], y = L.r[g * 2 + 1];
    const q = L.k[g]; if (wx >= x && wx <= x + CW * q && wy >= y && wy <= y + CH * q) return g;
  }
  return -1;
}

/* ---------- input ---------- */
const P = new Map(); let pinch = null, tap = null, glide = null, hov = -1, vel = [0, 0, 0];
vp.addEventListener('pointerdown', e => {
  vp.setPointerCapture(e.pointerId); anim = null; glide = null;
  P.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (P.size === 1) tap = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
  if (P.size === 2) { const [a, b] = [...P.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; tap = null; }
});
vp.addEventListener('pointermove', e => {
  if (!P.has(e.pointerId)) {
    if (e.pointerType === 'mouse') { const h = hit(e.clientX, e.clientY); if (h !== hov) { hov = h; dirty = true; if (h >= 0 && F[h].vid) startClip(h); else if (vcur >= 0) stopClip(); } }
    return;
  }
  const p = P.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  if (P.size === 1) {
    if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 7) { tap.moved = true; vp.classList.add('drag'); }
    if (!tap || tap.moved) {
      ox -= dx / s; oy -= dy / s; clamp(); dirty = true; driftKick(dx, dy);
      const t = performance.now(); vel = [dx, dy, t];
    }
  } else if (P.size === 2 && pinch) {
    const [a, b] = [...P.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    ox -= (mx - pinch.mx) / s; oy -= (my - pinch.my) / s; driftKick(mx - pinch.mx, my - pinch.my);
    zoomAt(d / pinch.d, mx, my);
    pinch = { d, mx, my };
  }
});
function driftKick(dx, dy) {
  if (RM.matches || s <= fitS() * 1.05) { driftRest(); return; }
  const t = performance.now(), dt = Math.max(.008, (t - dlast) / 1000); dlast = t;
  dvx = dvx * .6 + (dx / dt) * .4; dvy = dvy * .6 + (dy / dt) * .4;
  dr.x.t = Math.max(-DRIFT_MAX, Math.min(DRIFT_MAX, -dvx * .012)); dr.y.t = Math.max(-DRIFT_MAX, Math.min(DRIFT_MAX, -dvy * .012)); dr.x.w = dr.y.w = 9.5; dirty = true;
}
function driftRest() { dvx = dvy = 0; dr.x.t = dr.y.t = 0; dr.x.w = dr.y.w = 8; dirty = true; }
function up(e) {
  if (!P.has(e.pointerId)) return;
  P.delete(e.pointerId); vp.classList.remove('drag'); if (!P.size) driftRest();
  if (P.size === 1) { const [a] = [...P.values()]; pinch = null; tap = null; vel = [0, 0, 0]; a && (a.x = a.x); }
  if (P.size) return;
  pinch = null;
  if (tap && !tap.moved && e.type === 'pointerup' && performance.now() - tap.t < 600) {
    const g = hit(e.clientX, e.clientY); if (g >= 0) { if (F[g].vid) { if (vcur === g) stopClip(); else startClip(g); } else openLift(g, true); }
  } else if (tap && tap.moved && !RM.matches && performance.now() - vel[2] < 60) {
    let vx = vel[0], vy = vel[1];
    glide = () => { vx *= .92; vy *= .92; ox -= vx / s; oy -= vy / s; clamp(); dirty = true; if (Math.abs(vx) + Math.abs(vy) < .3) glide = null; };
  }
  tap = null;
}
vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
vp.addEventListener('pointerleave', () => { if (hov >= 0) { hov = -1; dirty = true; } });
vp.addEventListener('wheel', e => {
  e.preventDefault(); anim = null; glide = null; eyeNudge();
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
  if (!e.ctrlKey && (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))) {
    ox += (e.deltaX || e.deltaY) * k / s; clamp(); dirty = true; return;
  }
  zoomAt(Math.exp(-e.deltaY * k * (e.ctrlKey ? .01 : .0018)), e.clientX, e.clientY);
}, { passive: false });
vp.addEventListener('dblclick', e => e.preventDefault());
['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault()));

/* ---------- the room: lifted frame under the site's camera ----------
   One object, one opaque room. The camera reuses site-3d's critically damped
   spring (sstep) and its weights, FOV 60, fable-m4's 960 ms ease-out push,
   and the moon opener's exponential lag. No orbit here (objects-3d is the only orbiting room):
   a drag only leans the plane a few px / about 1.5 degrees with damped parallax, a swipe steps. Nothing advances on its own. */
const lt = $('lt'), fig = $('ltfig'), box = $('ltbox'), lo = $('ltlo'), hiImg = $('lthi'), ltbg = $('ltbg');
const chrome = [...lt.querySelectorAll('.lt-ch')];
const outside = ['.top', '.films', '.corner', '#vp'].map(q => document.querySelector(q));
let pushed = false, closing = null;
const TAN30 = Math.tan(Math.PI / 6);                       // FOV 60 (site-3d PerspectiveCamera)
/* calm: critically damped (no overshoot) and quick, so things settle in a third of a second instead of travelling */
const WTS = () => RM.matches ? { REL: 22, FLY: 22, GLIDE: 22, SOFT: 22 } : { REL: 16, FLY: 16, GLIDE: 14, SOFT: 12 };
function S(x, w) { return { x, t: x, v: 0, w }; }
function sstep(q, dt) { const w = q.w, e = q.x - q.t, k = Math.exp(-w * dt), c = q.v + w * e; q.x = q.t + (e + c * dt) * k; q.v = (q.v - w * c * dt) * k; }
const YAW = .026, PIT = .026, ZMIN = .75, ZMAX = 2.2;   // the most the plane ever leans (about 1.5 degrees); fitScale keeps it framed
const LEAN_PX = 60, LEAN_T = 6;                          // drag px that reach the full lean, and the most the plane shifts (px)
const cam = { yaw: S(0, 9.5), pit: S(0, 9.5), tx: S(0, 9.5), ty: S(0, 9.5), zoom: S(1, 4.6) };
let uy = 0, upv = 0, lastIn = 0, interacting = false, ent = null, bgA = 0, chA = 0, rect = null, roomT = 0, wheelT = 0;
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut3 = u => 1 - Math.pow(1 - u, 3), easeIO3 = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

function fitScale(w, h, P, aw, ah) {   // scale so the worst clamped orbit corner still sits inside the room
  let worst = 1;
  for (const sy of [-1, 1]) for (const sp of [-1, 1]) {
    const yw = sy * YAW, pt = sp * PIT, cy = Math.cos(yw), sny = Math.sin(yw), cp = Math.cos(pt), snp = Math.sin(pt);
    for (const px of [-.5, .5]) for (const py of [-.5, .5]) {
      const X = px * w, Y = py * h, X1 = X * cy, Z1 = -X * sny, Y2 = Y * cp - Z1 * snp, Z2 = Y * snp + Z1 * cp, k = P / (P - Z2);
      worst = Math.max(worst, Math.abs(X1 * k) / (aw / 2), Math.abs(Y2 * k) / (ah / 2));
    }
  }
  return 1 / worst;
}
let saProbe = null;
function safeIns() {   // the device's safe-area insets in px (notch, Dynamic Island, gesture bar)
  if (!saProbe) { saProbe = document.createElement('div'); saProbe.setAttribute('aria-hidden', 'true'); saProbe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)'; document.body.appendChild(saProbe); }
  const c = getComputedStyle(saProbe); return { t: parseFloat(c.paddingTop) || 0, r: parseFloat(c.paddingRight) || 0, b: parseFloat(c.paddingBottom) || 0, l: parseFloat(c.paddingLeft) || 0 };
}
function liftTarget(g) {
  const x = F[g], ar = x.w / x.h, narrow = vw < 560, sa = safeIns();
  const mx = narrow ? Math.max(22, sa.l, sa.r) : Math.max(96, sa.l + 84, sa.r + 84);
  const mt = sa.t + (narrow ? 72 : 88), mb = narrow ? Math.max(14, sa.b + 6) + 108 : Math.max(88, sa.b + 70);   // the room's chrome and caption keep clear of the frame
  const aw = vw - mx * 2, ah = vh - mt - mb, P = (vh / 2) / TAN30;
  let w = Math.min(aw, 1280), h = w / ar; if (h > ah) { h = ah; w = h * ar; }
  const f = fitScale(w, h, P, aw, ah); w *= f; h *= f;
  return { w, h, x: (vw - w) / 2, y: mt + (ah - h) / 2, P };
}
function placeLift(animate, origin) {
  rect = liftTarget(cur);
  fig.style.width = rect.w + 'px'; fig.style.height = rect.h + 'px';
  fig.style.transform = `translate(${rect.x}px,${rect.y}px)`;
  if (animate && !RM.matches && origin) {
  } else if (animate && !RM.matches) {
    const bw = CW * s * kk(cur), bh = CH * s * kk(cur);
    ent = { t0: performance.now(), dur: 260, r: Math.min(bw / rect.w, bh / rect.h), dx: wxS(cur) + bw / 2 - vw / 2, dy: wyS(cur) + bh / 2 - vh / 2, out: false };
  }
  roomPaint(0);
}
function fillLift() {
  const x = F[cur], f = films[x.f], n = pad4(x.n);
  const lsrc = 'media/s/' + f.slug + '/' + x.id + '.webp', hsrc = 'media/l/' + f.slug + '/' + x.id + '.webp';
  lo.src = lsrc; hiImg.classList.remove('on'); hiImg.onload = () => hiImg.classList.add('on'); hiImg.src = hsrc;
  $('ltnum').textContent = n + ' / ' + pad4(FN);
  $('lttitle').textContent = f.title;
  $('lttitle').setAttribute('aria-pressed', hi === x.f ? 'true' : 'false');
  $('lttc').textContent = 'frame ' + x.i + ' of ' + f.frames.length + ' · ' + x.tc;
  fig.setAttribute('aria-label', 'Frame ' + n + ', ' + f.title + ', ' + x.tc);
  [cur - 1, cur + 1].forEach(k => { if (k >= 0 && k < FN) { const y = F[k]; new Image().src = 'media/l/' + films[y.f].slug + '/' + y.id + '.webp'; } });
}
function poseHome(w) { uy = upv = 0; cam.yaw.t = cam.pit.t = cam.tx.t = cam.ty.t = 0; cam.zoom.t = 1; cam.yaw.w = cam.pit.w = cam.tx.w = cam.ty.w = cam.zoom.w = w; lastIn = performance.now(); }
function setInert(on) { outside.forEach(el => { if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } }); }
function openLift(g, animate, fromHash, origin) {
  stopClip();
  const was = cur >= 0; cur = g; closing = null;
  const sx = wxS(g), sy = wyS(g);
  if (sx < 0 || sy < TOP || sx + CW * s > vw || sy + CH * s > vh) focusOn(g, false);
  lt.hidden = false; setInert(true);
  if (!was) { bgA = 0; chA = 0; ent = null; cam.yaw.x = cam.pit.x = 0; cam.yaw.v = cam.pit.v = 0; cam.zoom.x = 1; cam.zoom.v = 0; }
  poseHome(WTS().GLIDE);
  fillLift(); placeLift(animate && !was, origin);
  const h = hashFor(F[g].n);
  if (!fromHash) {
    if (!was && !pushed) { history.pushState({ lift: 1 }, '', h); pushed = true; }
    else history.replaceState(history.state, '', h);
  }
  dirty = true; wake(); lt.focus({ preventScroll: true });
}
function step(d) {
  if (cur < 0) return; const g = cur + d; if (g < 0 || g >= FN) return;
  openLift(g, false);
}
function closeLift(fromPop, toCentre) {
  if (cur < 0) return;
  const g = cur; cur = -1; dirty = true;
  const sx = wxS(g), sy = wyS(g);
  if (sx < 0 || sy < TOP || sx + CW * s > vw || sy + CH * s > vh) focusOn(g, false);
  if (!fromPop) { if (pushed) { pushed = false; history.back(); } else history.replaceState(null, '', location.pathname + hashFor(0)); }
  else pushed = false;
  setInert(false);
  const bw = CW * s * kk(g), bh = CH * s * kk(g);
  if (RM.matches || !rect) { lt.hidden = true; ent = null; return; }
  closing = { t0: performance.now(), dur: toCentre ? 180 : 220, keepBg: !!toCentre };   // short and plain
  ent = toCentre ? null : { r: Math.min(bw / rect.w, bh / rect.h), dx: wxS(g) + bw / 2 - vw / 2, dy: wyS(g) + bh / 2 - vh / 2, out: true };
  wake();
}

/* camera tick: springs, enter / contract, room + chrome easing */
function roomPaint(e) {
  if (!rect) return;
  const P = rect.P, z = clampN(cam.zoom.x, ZMIN * .9, ZMAX * 1.05), dz = P * (1 - 1 / z);
  let pre = '';
  if (ent) {
    const k = e;
    const sc = ent.r + (1 - ent.r) * k;
    pre = `translate3d(${ent.dx * (1 - k)}px,${ent.dy * (1 - k)}px,0) scale(${sc}) `;
  }
  box.style.transform = `${pre}translate3d(${cam.tx.x.toFixed(2)}px,${cam.ty.x.toFixed(2)}px,0) perspective(${P}px) translateZ(${dz}px) rotateX(${cam.pit.x}rad) rotateY(${cam.yaw.x}rad)`;
}
function lag(cur0, target, rate, dt) { return cur0 + (target - cur0) * (1 - Math.exp(-dt * rate)); }   // moon opener: k = 1-exp(-dt*rate)
let last = 0, raf = 0;
function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(roomTick); } }
function roomTick(t) {
  raf = 0;
  const live = cur >= 0, dt = Math.min(.05, Math.max(.001, (t - last) / 1000)); last = t;
  const rm = RM.matches;
  if (live) {
    cam.yaw.t = clampN(uy * YAW / LEAN_PX, -YAW, YAW); cam.pit.t = clampN(-upv * PIT / LEAN_PX, -PIT, PIT);   // a drag only leans the plane
    cam.tx.t = clampN(uy * LEAN_T / LEAN_PX, -LEAN_T, LEAN_T); cam.ty.t = clampN(upv * LEAN_T / LEAN_PX, -LEAN_T, LEAN_T);
    if (RM.matches) cam.yaw.t = cam.pit.t = cam.tx.t = cam.ty.t = 0;
    sstep(cam.yaw, dt); sstep(cam.pit, dt); sstep(cam.tx, dt); sstep(cam.ty, dt); sstep(cam.zoom, dt);
    bgA = lag(bgA, 1, rm ? 22 : 14, dt);
    chA = lag(chA, interacting ? .22 : 1, 14, dt);
    if (ent && !ent.out) { const u = Math.min(1, (t - ent.t0) / ent.dur); ent.e = easeOut3(u); if (u >= 1) ent = null; }
    roomPaint(ent ? ent.e : 1);
  } else if (closing) {
    const u = Math.min(1, (t - closing.t0) / closing.dur), e = 1 - easeOut3(u);
    if (!closing.keepBg) bgA = lag(bgA, 0, 14, dt); chA = lag(chA, 0, 14, dt);
    roomPaint(e);
    if (u >= 1) { closing = null; ent = null; lt.hidden = true; bgA = chA = 0; }
  }
  ltbg.style.opacity = bgA >= .995 ? 1 : bgA.toFixed(3);
  const co = chA >= .995 ? 1 : chA.toFixed(3); chrome.forEach(el => el.style.opacity = co);
  if (live || closing) raf = requestAnimationFrame(roomTick);
}
function bumpIn() { lastIn = performance.now(); }

/* gestures: a drag leans the plane a hair, a swipe steps, pinch / wheel dolly */
const LP = new Map(); let lpinch = null, ltap = null;
lt.style.touchAction = 'none';
lt.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  bumpIn(); interacting = true; outAcc = 0; document.body.classList.add('lt-touched');
  lt.setPointerCapture(e.pointerId); LP.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const W = WTS(); cam.yaw.w = cam.pit.w = cam.tx.w = cam.ty.w = W.REL; cam.zoom.w = W.REL;
  if (LP.size === 1) { ltap = { x: e.clientX, y: e.clientY, moved: false, bg: e.target === ltbg }; uy = upv = 0; }
  if (LP.size === 2) { const [a, b] = [...LP.values()]; lpinch = Math.hypot(a.x - b.x, a.y - b.y); ltap = null; }
  wake();
});
lt.addEventListener('pointermove', e => {
  const p = LP.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; bumpIn();
  if (LP.size === 1) {
    if (ltap && !ltap.moved && Math.hypot(e.clientX - ltap.x, e.clientY - ltap.y) > 6) { ltap.moved = true; lt.classList.add('drag'); }
    if (ltap && ltap.moved) { uy = clampN(uy + dx, -LEAN_PX, LEAN_PX); upv = clampN(upv + dy, -LEAN_PX, LEAN_PX); }
  } else if (LP.size === 2 && lpinch) {
    const [a, b] = [...LP.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
    const f = d / lpinch, raw = cam.zoom.t * f; lpinch = d;
    if (pushedOut(f)) { enterCst(); return; }   // pinch out past the widest stop
    cam.zoom.t = clampN(raw, ZMIN, ZMAX);
  }
  wake();
});
let outAcc = 0;   // how far past the widest stop a gesture has pushed (log scale); deliberate, so a stray pinch or wheel tail does not leave the room
function pushedOut(factor) {
  if (cam.zoom.t > ZMIN * 1.02 || factor >= 1) { if (factor >= 1) outAcc = 0; return false; }
  outAcc += -Math.log(factor); return outAcc > .3;
}
function settleZoom() {   // soft detent back to the fit, site-3d's W_SOFT, only when you let go close to it
  if (Math.abs(Math.log(cam.zoom.t)) < .1) { cam.zoom.t = 1; }
  cam.zoom.w = WTS().SOFT;
}
function lup(e) {
  if (!LP.has(e.pointerId)) return;
  LP.delete(e.pointerId); lt.classList.remove('drag');
  if (LP.size === 1) { lpinch = null; ltap = null; uy = upv = 0; return; }
  if (LP.size) return;
  const W = WTS(); lpinch = null; interacting = false; bumpIn();
  if (ltap && !ltap.moved && ltap.bg && e.type === 'pointerup') closeLift();
  else if (ltap && ltap.moved && e.type === 'pointerup') {
    const dx = e.clientX - ltap.x, dy = e.clientY - ltap.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
    else if (dy > 70 && Math.abs(dy) > Math.abs(dx) * 1.3) closeLift();
  }
  uy = upv = 0;
  cam.yaw.w = cam.pit.w = cam.tx.w = cam.ty.w = W.SOFT; settleZoom(); ltap = null; wake();
}
lt.addEventListener('pointerup', lup); lt.addEventListener('pointercancel', lup);
lt.addEventListener('wheel', e => {
  e.preventDefault(); bumpIn();
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1;
  const f = Math.exp(-(e.deltaY || 0) * k * (e.ctrlKey ? .01 : .0018)), raw = cam.zoom.t * f;
  if (pushedOut(f)) { enterCst(); return; }   // wheel / dolly out past the widest stop
  cam.zoom.w = WTS().GLIDE; cam.zoom.t = clampN(raw, ZMIN, ZMAX);
  clearTimeout(wheelT); wheelT = setTimeout(() => { outAcc = 0; settleZoom(); }, 350);   // r10 wheel: 350 ms quiet
  document.body.classList.add('lt-touched'); wake();
}, { passive: false });
lt.addEventListener('dblclick', e => { if (e.target.closest('button')) return; e.preventDefault(); poseHome(WTS().GLIDE); wake(); });

$('ltx').onclick = () => closeLift(); $('ltmark').onclick = () => closeLift();
$('ltprev').onclick = () => step(-1); $('ltnext').onclick = () => step(1);
$('lttitle').onclick = () => { setHi(hi === F[cur].f ? null : F[cur].f); $('lttitle').setAttribute('aria-pressed', hi === F[cur].f ? 'true' : 'false'); };
/* the constellation: one level wider than the widest stop of the room */
let cstSet = [];
const cst = Constellation({
  items: () => cstSet.map(g => ({ group: F[g].f })),
  label: i => pad4(F[cstSet[i]].n),
  thumb: i => { const x = F[cstSet[i]]; return 'media/s/' + films[x.f].slug + '/' + x.id + '.webp'; },
  hint: 'pinch in or tap a star to go back in \u00b7 esc to return',
  onReturn: i => { const g = cstSet[i]; openLift(g, false, true); pushed = true; },
  onLeave: () => { setInert(false); }
});
function enterCst() {
  if (cur < 0 || cst.isOpen()) return;
  cstSet = hi !== null && films[hi] ? films[hi].frames.map(x => x.g) : F.slice(0, FN).map((_, g) => g);
  const at = Math.max(0, cstSet.indexOf(cur));
  LP.clear(); interacting = false; lpinch = null; ltap = null; uy = upv = 0; lt.classList.remove('drag');
  closeLift(true, true); setInert(true);
  cst.open(at);
}
addEventListener('bd-swipe-down', () => { if (cur >= 0) closeLift(); });   // a swipe down that started on the Beyond hub: the same as anywhere else on the frame
addEventListener('popstate', () => { if (cst.isOpen()) cst.leave(); else if (cur >= 0) closeLift(true); else readHash(); });


/* ---------- modes, highlight, films list ---------- */
function setMode(m, keep) {
  if (m === mode) return;
  const ctr = cur >= 0 ? cur : centreFrame(); const fitted = s <= fitS() * 1.05;
  mode = m; layout();
  document.querySelectorAll('.modes:not(.boxsw) button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false'));
  if (fitted) fit(false); else { go(s, L.r[ctr * 2] + CW / 2 - vw / 2 / s, L.r[ctr * 2 + 1] + CH / 2 - vh / 2 / s, false); }
  if (!keep && cur < 0) history.replaceState(null, '', location.pathname + hashFor(0));
  dirty = true;
}
document.querySelectorAll('.modes:not(.boxsw) button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
function setHi(k) {
  hi = k; dirty = true;
  document.querySelectorAll('#filmlist button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.k === k || (b.dataset.k === '' && k === null))));
}
const fl = $('films'), fb = $('filmsbtn');
fb.onclick = () => { fl.hidden = !fl.hidden; fb.setAttribute('aria-expanded', String(!fl.hidden)); };
function buildList() {
  const ol = $('filmlist'); ol.innerHTML = '';
  const none = document.createElement('li'); none.className = 'none';
  none.innerHTML = '<button type="button" data-k="" aria-pressed="true"><span class="r">0001–' + pad4(FN) + '</span><span class="t">all films</span></button>';
  ol.appendChild(none);
  films.forEach((f, k) => {
    const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="r"></span><span class="t"></span>';
    b.querySelector('.r').textContent = pad4(f.frames[0].n) + '–' + pad4(f.frames[f.frames.length - 1].n);
    b.querySelector('.t').textContent = f.title;
    li.appendChild(b); ol.appendChild(li);
  });
  ol.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k === '') { setHi(null); return; }
    const k = +b.dataset.k; setHi(k);
    const f = films[k], a = f.frames[0].g, z = f.frames[f.frames.length - 1].g;
    // frame the film's own boxes (short films sit in the first columns, not across the whole width)
    let x0 = 1e9, x1 = -1e9;
    for (let g = a; g <= z; g++) { x0 = Math.min(x0, L.r[g * 2]); x1 = Math.max(x1, L.r[g * 2] + CW); }
    const y0 = L.r[a * 2 + 1] - (mode === 'film' && !bperm ? HEAD : 0), y1 = L.r[z * 2 + 1] + CH;
    const ts = Math.min(maxS() * .5, Math.max(fitS(), Math.min((vw - 40) / (x1 - x0), (vh - TOP - 40) / (y1 - y0))));
    go(ts, (x0 + x1) / 2 - vw / 2 / ts, (y0 + y1) / 2 - (vh + TOP) / 2 / ts, true);
    fl.hidden = true; fb.setAttribute('aria-expanded', 'false');
  };
}
$('fit').onclick = () => { glide = null; fit(true); };

addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (cur >= 0) closeLift(); else if (!fl.hidden) { fl.hidden = true; fb.setAttribute('aria-expanded', 'false'); } else if (hi !== null) setHi(null); return; }
  if (cur >= 0) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); step(L.cols); }
    if (e.key === 'ArrowUp') { e.preventDefault(); step(-L.cols); }
    if (e.key === '+' || e.key === '=') { cam.zoom.w = WTS().GLIDE; cam.zoom.t = clampN(cam.zoom.t * 1.25, ZMIN, ZMAX); bumpIn(); wake(); }
    if (e.key === '-' || e.key === '_') { if (cam.zoom.t <= ZMIN * 1.02) { enterCst(); return; } cam.zoom.w = WTS().GLIDE; cam.zoom.t = clampN(cam.zoom.t / 1.25, ZMIN, ZMAX); bumpIn(); wake(); }
    if (e.key === '0') { poseHome(WTS().GLIDE); wake(); }
    return;
  }
  if (e.target.closest && e.target.closest('button')) return;
  const P2 = 60;
  if (e.key === '+' || e.key === '=') zoomAt(1.4, vw / 2, vh / 2);
  else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.4, vw / 2, vh / 2);
  else if (e.key === '0') fit(true);
  else if (e.key === 'ArrowRight') { ox += P2 / s; clamp(); dirty = true; }
  else if (e.key === 'ArrowLeft') { ox -= P2 / s; clamp(); dirty = true; }
  else if (e.key === 'ArrowDown') { oy += P2 / s; clamp(); dirty = true; }
  else if (e.key === 'ArrowUp') { oy -= P2 / s; clamp(); dirty = true; }
});

/* ---------- deep links: #n=0142, #order=continuous, #film=slug ---------- */
function hashFor(n) {
  const q = [];
  if (n) q.push('n=' + pad4(n));
  if (mode === 'all') q.push('order=continuous');
  if (bx !== 'boxes') q.push('boxes=' + bx);
  return q.length ? '#' + q.join('&') : '';
}
function setBoxes(v, fromHash) {
  if (!BOXV.includes(v)) return;
  bx = v; document.body.dataset.boxes = v; dirty = true;
  try { localStorage.setItem(BOXK, v); } catch (e) {}
  document.querySelectorAll('.boxsw button').forEach(b => b.setAttribute('aria-pressed', b.dataset.boxes === v ? 'true' : 'false'));
  if (!fromHash) history.replaceState(history.state, '', location.pathname + hashFor(cur >= 0 ? F[cur].n : 0));
}
document.querySelectorAll('.boxsw button').forEach(b => b.onclick = () => setBoxes(b.dataset.boxes));
setBoxes(bx, true);
function readHash() {
  const q = new URLSearchParams(location.hash.slice(1));
  const bq = q.get('boxes'); if (bq) setBoxes(bq, true);
  const o = q.get('order'); setMode(o === 'continuous' ? 'all' : 'film', true);
  const fs = q.get('film'); if (fs) { const k = films.findIndex(f => f.slug === fs); if (k >= 0) setHi(k); }
  const n = parseInt(q.get('n'), 10);
  if (n >= 1 && n <= FN) { focusOn(n - 1, false); openLift(n - 1, false, true); }
  else if (cur >= 0) closeLift(true);
}

/* ---------- boot ---------- */
fetch('data/index.json').then(r => r.json()).then(d => {
  D = d; films = d.films;
  films.forEach((f, k) => f.frames.forEach((x, j) => { x.f = k; x.j = j; x.g = F.length; F.push(x); }));
  FN = F.length;
  $('count').textContent = d.count.toLocaleString('en-US') + ' frames · ' + films.length + ' films · 0001–' + pad4(d.count);
  buildList(); resize();
  if (window.GJ_BEYOND) { GJ_BEYOND.attach({ films, F, n: FN }); GJ_BEYOND.on((st, sel) => { if (sel) applyBeyond(); }); }
  if (window.GJ_SEARCH) { GJ_SEARCH.onData(d => { addClips(d.records.filter(r => r.kind === 'video')); applyBeyond(); }); GJ_SEARCH.on(() => applyBeyond()); }
  films.forEach(f => img(f.atlas.src)); pump();
  if (location.hash) readHash();
  requestAnimationFrame(loop);
});
addEventListener('searchlayout', e => { searchH = (e.detail && e.detail.h) || 0; if (!L) return; if (L.gal && bgal) frameGallery(false); else if (!bperm || s <= fitS() * 1.05) fit(false); dirty = true; });
if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (searchH && L) { if (L.gal && bgal) frameGallery(false); dirty = true; } });
addEventListener('resize', resize);
window.__ai = { clip: () => vcur, clips: () => F.length - FN, drift: () => [dr.x.x, dr.y.x], scale: () => [s, fitS()], perm: () => bperm && bperm.slice(0, 6), swapping: () => !!anim, gallery: () => (L && L.gal ? { n: L.gal.n, ids: bperm.slice(0, 4), k: kk(bperm[0]) } : null) };
if (document.fonts) document.fonts.ready.then(() => { dirty = true; });
})();
