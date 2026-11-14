/* R10c · everything that opens inside R10's sky. R10 (js/world.js, the site-v3-pro3 w7 engine) stays the backbone: one sky, one
   camera, FAR -> MID -> CLOSE -> LAYER, press once to select and again to open, the iris. This module is the LAYER: world.js hands
   every opened star to window.__one (open/close/back), and each layer is a place. Ported from the unified build (one/js/app.js),
   which carried the m4-integrate pieces (film player e329688, To Go video card 5cd37f6, recut cards + objects-3d 64c6cfb).
   Content: m4/data.json, js/filmdata.js, js/brief.js (the Spirit Eye PDF, verbatim), js/specimens.js. No YouTube. */
import { STOPS, contents, PDF } from './brief.js';
import { SPECIMENS, LAYERS } from './specimens.js';
import { HISTORY } from './history.js';
import * as SKY from './sky-controls.js';
import * as DOCK from './dock.js';
const M4 = 'm4/'; /* r10's own copy of the m4 files it uses (tools/vendor_m4.py) */
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const UP = p => !p ? '' : /^(https?:|\.\.?\/|\/|data:|m4\/)/.test(p) ? p : M4 + p;
function h(tag, cls, kids, attrs) { const e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (const k in attrs) { if (k === 'text') e.textContent = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else if (attrs[k] != null) e.setAttribute(k, attrs[k]) }
  (kids || []).forEach(k => k != null && e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k)); return e }
const t = (tag, cls, text, attrs) => h(tag, cls, null, Object.assign({ text }, attrs || {}));
function vid(src, poster, opt) { const v = document.createElement('video'); v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = 'metadata'; v.loop = false;
  ['muted', 'playsinline', 'webkit-playsinline', 'disablepictureinpicture'].forEach(a => v.setAttribute(a, '')); if (poster) v.poster = poster;
  (Array.isArray(src) ? src : [src]).forEach(s => { const o = document.createElement('source'); o.src = s; o.type = /\.webm$/.test(s) ? 'video/webm' : 'video/mp4'; v.appendChild(o) });
  v.addEventListener('playing', () => v.classList.add('on')); v.addEventListener('ended', () => { opt && opt.ended && opt.ended() }); return v }
const play = v => { const q = v.play(); if (q && q.catch) q.catch(() => {}) };
const W = window.__world, ROOT = document.documentElement;
/* ---------- data ---------- */
const D = await fetch(M4 + 'data.json').then(r => r.json());
const CH = {}, BY = {}; D.chapters.forEach(c => { CH[c.k] = c; c.cards.forEach(x => BY[x.id] = x) });
const FILMS = (window.GJ_FILMS || []), FBY = {}; FILMS.forEach(f => FBY[f.s] = f);
const PRIVATE = /IMG_1936|IMG_1188|IMG_1189|IMG_6405|IMG_6606|IMG_6612|22179A95|IMG_5722|IMG_1187|IMG_6881|IMG_1342/i;
/* where each data.json id sits in R10's sky (the hidden #data lists that world.js reads) */
const AT = {}; $$('#data .it').forEach(el => { AT[el.dataset.id] = { k: el.closest('.ch').id, w: el.dataset.k, el } });
const PHOTOS = $$('#photo .it').map(el => ({ id: el.dataset.id, w: el.dataset.k, big: UP(el.dataset.big), thumb: UP(($('img', el) || {}).dataset ? $('img', el).dataset.src : '') })).filter(p => !PRIVATE.test(p.id + p.big + p.thumb));
const REEL = 'film/reel-2026', REEL_POSTER = 'media/reel-v7-poster.webp'; /* frame at 1.5 s of reel-v7-720.mp4: moon water, the crescent moon, GILL JAMES */
const DEMO_STILLS = Array.from({ length: 45 }, (_, i) => M4 + 'media/pro2/reel/a/' + String(i).padStart(3, '0') + '.webp');
/* the six featured cards (m4's opening title-card strip). Weird Kid + Repeat: the recut 1c cards;
   To Go: the VIDEO card (the muted 8 s 638x360 preview), shown framed at its own size */
const FEAT = [['film/weird-kid', M4 + 'media/v3/media/pv/22-card.mp4', M4 + 'media/v3/media/pv/22-card.webp'], ['sound/to-go', M4 + 'media/v3/media/pv/to-go.mp4', M4 + 'media/v3/media/pv/to-go.webp', 'framed'],
  ['film/one-with-the-devil'], ['objects/hand-carved-piece'], ['film/sleepwalker'], ['film/repeat-feat-jessie-reyez', M4 + 'media/v3/media/pv/16-card.mp4', M4 + 'media/v3/media/pv/16-card.webp']]
  .filter(f => BY[f[0]] && AT[f[0]]).map(f => { const it = BY[f[0]], m = it.media || {}; return { id: f[0], it, clip: UP(f[1] || m.pv || m.clip || ''), still: UP(f[2] || m.big || m.thumb), framed: !!f[3] } });
const CREDIT = (STOPS[0].page.by || '');
/* ---------- the ring: every chapter, the reel and Spirit Eye, one tap from anywhere ---------- */
const RING = [['brief', 'spirit eye'], ['reel', 'reel'], ...D.chapters.map(c => [c.k, c.nm])];
const ringEl = $('#ring');
RING.forEach(([k, nm]) => ringEl.appendChild(t('button', k === 'reel' ? 'reel' : '', nm, { type: 'button', 'data-k': k, onclick: () => ringGo(k) })));
/* a shortcut (ring, entry star, featured card) is ONE history entry: Back returns exactly to where the tap happened */
function jumpTo(T) { const s = history.state || {}; try { history.pushState({ gj3: 1, lv: T.lv, k: T.k || null, w: T.w || null, anc: (s.anc || 0) + 1 }, '', location.pathname + (T.lv ? W.hashOf(T) : location.search)) } catch (e) {} W.goTo(T) }
function goHome() { const s = W.state(); if (s.lv === 0) return; jumpTo({ lv: 0 }) }
function ringGo(k) { if (k === 'brief') return briefOpen(lastBrief); if (BRF.on) briefLeave();
  const s = W.state();
  if (k === 'reel') return s.lv === 3 && s.w === 'reel' ? 0 : jumpTo({ lv: 3, k: 'film', w: 'reel' });
  if (k === 'about') return s.lv === 3 && s.k === 'about' && s.w === 'bio' ? 0 : jumpTo({ lv: 3, k: 'about', w: 'bio' });
  if (s.lv === 1 && s.k === k) return; jumpTo({ lv: 1, k }) }
function ringSync() { const s = W.state(); let k = BRF.on ? 'brief' : s.lv ? s.k : '';
  if (!BRF.on && s.k === 'film' && s.w === 'reel' && s.lv === 3) k = 'reel'; $$('button', ringEl).forEach(b => b.classList.toggle('on', b.dataset.k === k)) }
/* ---------- FAR: the ways in (previews-style labelled entry stars) and the featured strip ---------- */
const ENT = $('.entries'), entEls = {};
function entMake(k, b, sub, on) { const e = h('button', 'sl' + (k === 'spirit-eye' ? ' se' : ''), [h('i', 'dot'), h('span', '', [t('b', '', b), sub ? t('small', '', sub) : null])], { type: 'button', 'data-k': k, onclick: on }); ENT.appendChild(e); entEls[k] = e; return e }
const NIN = k => $$('#' + k + ' .it').length;
D.chapters.forEach(c => entMake(c.k, c.nm, c.k === 'photo' ? NIN('photo') + ' photographs' : c.k === 'about' ? 'bio' : c.k === 'film' ? (NIN('film') - 1) + ' films + reel' : NIN(c.k) + ' works', () => ringGo(c.k)));
entMake('spirit-eye', 'Spirit Eye', CREDIT, () => briefOpen(0));
const FT = h('div', 'feat', [t('p', 'lab', 'featured')]), strip = h('div', 'fstrip'); FT.appendChild(strip); $('#world').appendChild(FT);
const fv = [];
FEAT.forEach((f, i) => { const it = f.it, b = h('button', 'fcard' + (f.framed ? ' framed' : ''), null, { type: 'button', 'data-id': f.id, 'aria-label': it.title, onclick: () => openId(f.id) });
  b.appendChild(h('img', '', null, { src: f.still, alt: '', loading: 'lazy' })); let v = null; if (f.clip) { v = vid(f.clip, f.still, { ended: () => fnext(i) }); b.appendChild(v) } fv.push(v);
  b.appendChild(t('span', 'k', String(i + 1).padStart(2, '0') + ' / ' + String(FEAT.length).padStart(2, '0')));
  b.appendChild(h('span', 'ft', [t('b', '', it.title), it.role ? t('i', '', it.role) : null])); strip.appendChild(b) });
let fon = -1, ftm = 0;
function fplay(i) { if (fon === i) return; fv.forEach((v, k) => { if (v && k !== i) { v.pause(); v.classList.remove('on') } }); fon = i; clearTimeout(ftm); const v = fv[i];
  if (v) { try { v.currentTime = 0 } catch (e) {} play(v) } else ftm = setTimeout(() => fnext(i), 4000) }
function fnext(i) { if (!ROOT.classList.contains('far')) return; const n = i + 1; if (n >= FEAT.length) return; strip.scrollTo({ left: strip.children[n].offsetLeft - 16, behavior: 'smooth' }) }
var fio; function openId(id) { const a = AT[id]; if (!a) return; if (BRF.on) briefLeave(); jumpTo({ lv: 3, k: a.k, w: a.w }) }
/* entry stars follow R10's camera at FAR (they sit just under each constellation, previews .sl style); hidden during the fly-in */
let lastKey = '';
function entTick() { requestAnimationFrame(entTick); const s = W.state(), far = s.lv === 0 && !BRF.on, mk = W.mk(), show = far && (!mk || mk.p > .82);
  ROOT.classList.toggle('far', far && !mk); ENT.classList.toggle('on', show);
  if (show) { const key = s.cam.x.toFixed(1) + s.cam.y.toFixed(1) + s.cam.s.toFixed(3) + innerWidth + innerHeight + (mk ? mk.p.toFixed(2) : '') + JSON.stringify(window.__hubR || 0); if (key !== lastKey) { lastKey = key; placeEntries() } }
  ringSync() }
/* entry labels: under each constellation (previews .sl), kept on screen; Spirit Eye takes the first free spot round the centre
   mark (below, above, left, right) so it never sits on the name/tagline, a chapter star or another label (the landscape fix) */
const ov = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
function placeEntries() { const W0 = innerWidth, H0 = innerHeight, top = (ROOT.classList.contains('far') && FT.offsetParent && getComputedStyle(FT).display !== 'none') ? FT.getBoundingClientRect().top : H0 - 60, used = [];
  const box = (e, x, y) => { const sp = e.lastChild, w = sp.offsetWidth || 120, h = sp.offsetHeight || 36; return { x: x - w / 2, y: y - 9, w, h: h + 21 } };
  const put = (e, x, y) => { const sp = e.lastChild, w = sp.offsetWidth || 120, h = sp.offsetHeight || 36; x = Math.max(w / 2 + 4, Math.min(W0 - w / 2 - 4, x)); y = Math.max(64, Math.min(top - h - 16, y));
    e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; const r = box(e, x, y); used.push(r); return r };
  const stars = [];
  D.chapters.forEach(c => { const p = W.chapterLabel(c.k), q = W.pos(c.k); if (!p) return; stars.push({ x: q[0] - 34, y: q[1] - 34, w: 68, h: 68 }); put(entEls[c.k], p[0], p[1] + 4) });
  const hub = window.__hubR, e = entEls['spirit-eye']; if (!hub) return; const cx = hub.x + hub.w / 2, sw = (e.lastChild.offsetWidth || 180), sh = (e.lastChild.offsetHeight || 40) + 21;
  const lands = W0 > H0 * 1.4, lx = Math.min(hub.x - 30, W0 * .16), rx = Math.max(hub.x + hub.w + 30, W0 * .84);
  const cand = (lands ? [[Math.max(sw / 2 + 8, lx - sw / 2 + 40), hub.y + hub.h / 2 - 10], [Math.min(W0 - sw / 2 - 8, rx + sw / 2 - 40), hub.y + hub.h / 2 - 10]] : []).concat([[cx, hub.y + hub.h + 14], [cx, hub.y - sh - 4], [hub.x - sw / 2 - 16, hub.y + hub.h / 2 - 8], [hub.x + hub.w + sw / 2 + 16, hub.y + hub.h / 2 - 8], [cx, hub.y + hub.h + 60]]);
  let best = null, bo = 1e12; for (const [x, y] of cand) { const r = box(e, x, y); if (r.x < 4 || r.x + r.w > W0 - 4 || r.y < 64 || r.y + r.h > top - 4) continue; const o = used.concat(stars, [hub]).reduce((a, q) => a + ov(r, q), 0); if (o < bo) { bo = o; best = [x, y] } if (!o) break }
  if (!best) best = cand[0]; e.style.transform = 'translate(' + best[0].toFixed(1) + 'px,' + best[1].toFixed(1) + 'px)'; e.dataset.ov = Math.round(bo) }
/* ---------- the LAYER: world.js opens a star here (window.__one) ---------- */
const LAY = $('#layer'); let L = null;
function stateHere(extra) { const s = history.state || {}; return Object.assign({ gj3: 1, lv: 3, k: L.k, w: L.w, anc: s.anc || 0 }, extra || {}) }
const ONE = window.__one = {
  open(it, o) { if (L) dropAll(); const id = it.el.dataset.id; L = { it, id, k: it.k, w: it.w, hash: W.hashOf({ lv: 3, k: it.k, w: it.w }), views: [] };
    LAY.hidden = false; LAY.textContent = ''; LAY.dataset.id = id; ROOT.classList.add('layer-on');
    const sub = (location.hash.indexOf(L.hash + '/') === 0 ? location.hash.slice(L.hash.length + 1) : '') || (o && o.play ? 'play' : '');
    push('', null); window.__iris && __iris(LAY, o, true);
    if (sub) { try { history.replaceState(stateHere(), '', location.pathname + L.hash) } catch (e) {} sub_(sub) } },
  close(o) { if (!L) return; const l = L; L = null; ROOT.classList.remove('layer-on'); l.views.forEach(v => v.cleanup && v.cleanup());
    const fin = () => { if (!L) { LAY.hidden = true; LAY.textContent = ''; LAY.style.visibility = '' } };
    if (window.__iris && !(o && o.instant)) __iris(LAY, o, false, fin); else fin() },
  isOn() { return !!L }, state() { return L ? { id: L.id, views: L.views.map(v => v.name) } : null },
  play() { if (L && L.it.k === 'film' && top().name !== 'play') sub_('play') }, unfull() { return false }, fsGuard() { return !!document.fullscreenElement },
  back() { if (BRF.on) { briefBack(); return true } if (L && L.views.length > 1) { if (history.state && history.state.sub) history.back(); else { pop(); try { history.replaceState(stateHere(), '', location.pathname + L.hash) } catch (e) {} } return true } return false },
  /* QA hooks */
  brief: () => ({ on: BRF.on, i: BRF.i, n: STOPS.length }), openId: id => openId(id), feat: () => FEAT.map(f => [f.id, f.clip]), photos: () => PHOTOS.length };
function top() { return L.views[L.views.length - 1] }
function sub_(name, replace) { if (!L) return; if (replace) { try { history.replaceState(stateHere({ sub: name }), '', location.pathname + L.hash + '/' + name) } catch (e) {} pop() }
  else { const s = history.state || {}; try { history.pushState(stateHere({ sub: name, anc: (s.anc || 0) + 1 }), '', location.pathname + L.hash + '/' + name) } catch (e) {} } push(name) }
function push(name) { L.views.forEach(v => { v.el.hidden = true; v.onhide && v.onhide() }); const v = { name, el: h('section', 'place' + (name ? ' sub' : '')), cleanup: null, onshow: null }; LAY.appendChild(v.el); L.views.push(v); build(v); }
function pop() { const v = L.views.pop(); v.cleanup && v.cleanup(); v.el.remove(); const p = top(); p.el.hidden = false; p.onshow && p.onshow() }
function dropAll() { L.views.forEach(v => v.cleanup && v.cleanup()); L.views = []; LAY.textContent = '' }
addEventListener('popstate', () => { const hs = location.hash;
  if (window.__oneOwns(hs)) { briefFromHash(hs); return } if (BRF.on) briefClose(false);
  if (BRF.home) { BRF.home = false; setTimeout(goHome, 0); return }
  if (!L) return; if (hs.indexOf(L.hash) !== 0 && hs !== L.hash) return; const rest = hs.slice(L.hash.length).replace(/^\//, '');
  const at = L.views.findIndex(v => v.name === rest); if (at >= 0) { while (L.views.length > at + 1) pop() } else if (rest) push(rest) });
/* ---------- builders ---------- */
function build(v) { const id = L.id, p = id.split('/'), n = v.name;
  if (n === 'play') return buildPlayer(v, L.it.el.dataset.slug === 'reel' ? 'reel-2026' : p[1]);
  if (n.startsWith('still/')) return buildStill(v, p[1], +n.split('/')[1] - 1);
  if (n === 'builds') return buildHistory(v);
  if (id === REEL) return buildPlayer(v, 'reel-2026', true);
  if (p[0] === 'about') return id === 'about/poem' ? buildPoem(v) : buildAbout(v);
  if (p[0] === 'photo') return buildPhotoOne(v, L.w);
  if (p[0] === 'specimen') return buildSpecimen(v, p[1]);
  if (id === 'sound/waveform') return buildSound(v);
  return buildWork(v, BY[id]) }
function sheet(v, cls) { v.el.classList.add(cls || 'plain'); const sh = h('div', 'sheet'), inn = h('div', 'in'); sh.appendChild(inn); v.el.appendChild(sh);
  /* a visible "scroll ↓" cue whenever the place is taller than the screen (landscape phones above all); it goes once you reach the end */
  const cue = h('button', 'more', null, { type: 'button', 'aria-label': 'scroll down', onclick: () => sh.scrollBy({ top: sh.clientHeight * .8, behavior: 'smooth' }) }); cue.textContent = 'scroll ↓'; v.el.appendChild(cue);
  const chk = () => { const on = sh.scrollHeight - sh.clientHeight - sh.scrollTop > 24; if (cue.classList.contains('on') !== on) cue.classList.toggle('on', on) };
  let sc = 0; sh.addEventListener('scroll', () => { sc = sh.scrollTop; chk() }, { passive: true }); v.onshow = () => requestAnimationFrame(() => { sh.scrollTop = sc; chk() });
  if (window.ResizeObserver) new ResizeObserver(chk).observe(inn); addEventListener('resize', chk); setTimeout(chk, 600); return inn }
function tile(it, to) { const m = it.media || {}, b = h('button', 'tile', null, { type: 'button', 'data-id': it.id, onclick: () => to ? to() : openId(it.id) });
  const im = h('div', 'im'), src = UP(m.thumb || m.big); if (src) im.appendChild(h('img', '', null, { src, alt: '', loading: 'lazy' })); b.appendChild(im);
  const title = it.title && it.title !== 'untitled' ? it.title : ''; b.appendChild(h('span', 'tx', [title ? t('b', '', title) : null, (it.meta || it.role) ? t('i', '', [it.role, it.meta].filter(Boolean).join(' · ')) : null])); return b }
/* one work: hero (its clip plays once, muted, to its end), title, role, credits, body, the film's stills, play or the honest stills-only state */
function buildWork(v, it) { const inn = sheet(v, 'work'), m = it.media || {}, p = it.id.split('/'), f = FBY[p[1]], fe = FEAT.find(x => x.id === it.id);
  const still = fe ? fe.still : UP(m.big || m.thumb), clip = fe && fe.clip ? fe.clip : UP(m.pv || m.clip), framed = fe && fe.framed;
  const hero = h('div', 'hero' + (m.h > m.w ? ' portrait' : '') + (framed ? ' framed' : '')); if (still) hero.appendChild(h('img', '', null, { src: still, alt: '' }));
  let cv = null; if (clip) { cv = vid(clip, still); hero.appendChild(cv) } inn.appendChild(hero);
  const tx = h('div', 'txt panel'); inn.appendChild(tx);
  tx.appendChild(t('p', 'kick', (CH[p[0]] || {}).nm || p[0])); tx.appendChild(t('h2', 'ttl', it.title && it.title !== 'untitled' ? it.title : ''));
  if (it.role) tx.appendChild(t('p', 'role', it.role)); if (it.meta) tx.appendChild(t('p', 'meta', it.meta));
  const acts = h('div', 'acts'); let stillsOnly = false;
  if (p[0] === 'film') { if (f && f.play && !f.vfail) acts.appendChild(h('button', 'btn', ['▶ watch'], { type: 'button', 'data-a': 'play', onclick: () => sub_('play') })); else stillsOnly = true }
  if (it.id === 'sound/to-go') { const tr = D.tracks.find(x => x.k === 'togo'); const mv = vid([M4 + 'media/pro2/img/sound/momo-480.webm', M4 + 'media/pro2/img/sound/momo-480.mp4'], M4 + 'media/pro2/img/sound/momo-480.jpg'); mv.setAttribute('aria-label', 'momo');
    tx.appendChild(h('div', 'momo', [mv, t('span', 'meta', 'momo')])); setTimeout(() => play(mv), 200); if (tr) acts.appendChild(DOCK.button(tr, '▶ play the song')) }
  if (m.url && /^https:\/\/(open\.spotify\.com|music\.apple\.com|vimeo\.com)\//.test(m.url)) acts.appendChild(h('a', 'btn q', [(it.meta || 'listen') + ' ↗'], { href: m.url, target: '_blank', rel: 'noopener' }));
  if (stillsOnly) acts.prepend(t('span', 'so', 'stills only'));
  if (acts.children.length) tx.appendChild(acts);
  if (it.credits && it.credits.length) tx.appendChild(h('ul', 'credits', it.credits.map(c => t('li', '', c))));
  if (it.body) tx.appendChild(t('div', 'body', it.body));
  const stills = stillsOf(p[1]);
  if (stills.length && p[0] === 'film') { inn.appendChild(t('p', 'sub', 'stills · ' + stills.length)); const g = h('div', 'stills'); stills.forEach((src, i) => g.appendChild(h('button', '', [h('img', '', null, { src, alt: '', loading: 'lazy' })], { type: 'button', 'aria-label': 'still ' + (i + 1), onclick: () => sub_('still/' + (i + 1)) }))); inn.appendChild(g) }
  if (p[0] !== 'film' && m.frames && m.frames.length) { const g = h('div', 'stills'); m.frames.forEach(src => g.appendChild(h('div', 'fr', [h('img', '', null, { src: UP(src), alt: '', loading: 'lazy' })]))); inn.appendChild(g) }
  if (it.related && it.related.length) { inn.appendChild(t('p', 'sub', 'related')); const g = h('div', 'grid'); it.related.forEach(id => BY[id] && AT[id] && g.appendChild(tile(BY[id]))); inn.appendChild(g) }
  if (cv) setTimeout(() => play(cv), 380);
  v.cleanup = () => { if (cv) cv.pause() }; v.onhide = () => { if (cv) cv.pause() } }
function stillsOf(slug) { const f = FBY[slug], it = BY['film/' + slug]; if (slug === 'demo-reel') return DEMO_STILLS; return f ? f.stills.map(UP) : ((it && it.media.frames) || []).map(UP) }
function buildStill(v, slug, i) { const Ls = stillsOf(slug); v.el.classList.add('stillv'); const box = h('div', 'view'); v.el.appendChild(box); i = Math.max(0, Math.min(Ls.length - 1, i));
  box.appendChild(h('img', '', null, { src: Ls[i], alt: '' })); box.appendChild(t('p', 'cap', (i + 1) + ' / ' + Ls.length));
  const step = d => { const n = i + d; if (n < 0 || n >= Ls.length) return; sub_('still/' + (n + 1), true) };
  if (i > 0) box.appendChild(h('button', 'nv p', ['‹'], { type: 'button', 'aria-label': 'previous still', onclick: () => step(-1) }));
  if (i < Ls.length - 1) box.appendChild(h('button', 'nv n', ['›'], { type: 'button', 'aria-label': 'next still', onclick: () => step(1) })); swipe(box, step) }
/* the film player: pro2's work view (site-v3-pro2 #film/w0/play, m4 js/filmplayer.js). Reel 2026 plays reel-v7 natively, sound on a
   tap, to its natural end, poster = its opening; the rest play through Vimeo on a tap, with the poster + stills if the embed fails */
function buildPlayer(v, slug, isBase) { const f = FBY[slug]; if (!f || !f.play) return buildWork(v, BY['film/' + slug]);
  const el = h('div', 'player'); v.el.appendChild(el); v.el.dataset.film = slug;
  el.appendChild(h('div', 'ph', [h('div', '', [t('h2', '', f.t), t('p', 'meta', [f.role, f.meta].filter(Boolean).join(' · '))])]));
  const stage = h('div', 'stage'), frame = h('div', 'frame'); stage.appendChild(frame); el.appendChild(stage); frame.style.aspectRatio = String(f.play.ar || 16 / 9);
  const poster = slug === 'reel-2026' ? REEL_POSTER : UP(f.play.poster || f.poster);
  frame.appendChild(h('img', '', null, { src: poster, alt: '' }));
  const cap = t('p', 'cap', ''); el.appendChild(cap);
  const pb = h('button', 'btn', ['▶ play'], { type: 'button', 'data-a': 'play' });
  const PL = FILMS.filter(x => x.play && AT[x.id]), idx = PL.indexOf(f), prev = PL[idx - 1], next = PL[idx + 1];
  const nb = (x, cls, arrow) => x ? h('button', 'nb ' + cls, cls === 'p' ? [t('span', '', arrow), t('i', '', x.short || x.t)] : [t('i', '', x.short || x.t), t('span', '', arrow)], { type: 'button', 'aria-label': (cls === 'p' ? 'previous film: ' : 'next film: ') + x.t, onclick: () => openId(x.id) }) : h('span', 'nb');
  el.appendChild(h('div', 'ctl', [nb(prev, 'p', '‹'), pb, nb(next, 'n', '›')]));
  const shots = f.play.shots, sstrip = h('div', 'strip'); let V = null, IF = null, fbT = 0;
  (shots || f.stills.map(x => ({ th: x }))).forEach((sh, i) => sstrip.appendChild(h('button', '', [h('img', '', null, { src: UP(sh.th), alt: '', loading: 'lazy' })], { type: 'button', 'aria-label': sh.title || 'still ' + (i + 1), onclick: () => { if (shots) { start(true); V.currentTime = sh.t; cap.textContent = sh.title } } })));
  el.appendChild(sstrip);
  if (!shots) sstrip.classList.add('ro');
  function start(seekOnly) { DOCK.pause();
    if (f.play.type === 'native') { if (!V) { V = document.createElement('video'); V.className = 'fp-film'; V.playsInline = true; V.setAttribute('playsinline', ''); V.controls = true; V.preload = 'auto'; V.poster = poster; V.src = UP(f.play.src); V.loop = false; frame.appendChild(V);
        V.addEventListener('play', () => pb.textContent = '❚❚ pause'); V.addEventListener('pause', () => pb.textContent = V.ended ? '▶ play again' : '▶ play');
        V.addEventListener('timeupdate', () => { if (!shots) return; let k = 0; for (let j = shots.length - 1; j >= 0; j--) if (V.currentTime >= shots[j].t - .02) { k = j; break } [...sstrip.children].forEach((b, j) => b.classList.toggle('on', j === k)); cap.textContent = shots[k].title }) }
      V.muted = false; if (seekOnly && !V.paused) return; if (V.paused) { if (V.ended) V.currentTime = 0; play(V) } else V.pause() }
    else if (!IF) { let ok = false; IF = h('iframe', '', null, { title: f.t, allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: '', src: 'https://player.vimeo.com/video/' + f.play.id + '?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1&color=55DAA1' });
      const onMsg = e => { if (/vimeo\.com$/.test(new URL(e.origin).hostname)) ok = true }; addEventListener('message', onMsg); frame.appendChild(IF); pb.hidden = true;
      /* the stills fallback: if the embed never answers, the poster and the stills come back, with the film's own Vimeo page */
      fbT = setTimeout(() => { removeEventListener('message', onMsg); if (ok || !IF) return; IF.remove(); IF = null; f.vfail = 1; pb.hidden = true; cap.textContent = 'stills only'; sstrip.classList.add('fb');
        el.appendChild(h('a', 'btn q fbk', ['vimeo ↗'], { href: 'https://vimeo.com/' + f.play.id, target: '_blank', rel: 'noopener' })) }, 9000) } }
  pb.addEventListener('click', () => start());
  const stop = () => { clearTimeout(fbT); if (V) V.pause(); if (IF) { IF.remove(); IF = null; pb.hidden = false } };
  v.cleanup = () => { stop(); if (V) { V.removeAttribute('src'); V.load() } }; v.onhide = stop }
/* Photo: one photograph (R10's star), prev/next walk the sky's photo row; tap for closer */
function buildPhotoOne(v, w) { let i = Math.max(0, PHOTOS.findIndex(p => p.w === w)); v.el.classList.add('stillv'); const box = h('div', 'view'); v.el.appendChild(box);
  const img = h('img', '', null, { src: PHOTOS[i].big, alt: '' }), cap = t('p', 'cap', ''); box.append(img, cap); let closer = false;
  const show = () => { img.src = PHOTOS[i].big; cap.textContent = (i + 1) + ' / ' + PHOTOS.length + (closer ? ' · closer' : ''); box.classList.toggle('closer', closer); pv.hidden = i === 0; nx.hidden = i === PHOTOS.length - 1 };
  const step = d => { const n = i + d; if (n < 0 || n >= PHOTOS.length) return; i = n; closer = false; W.lateralTo('photo', PHOTOS[i].w); if (L) { L.w = PHOTOS[i].w; L.hash = W.hashOf({ lv: 3, k: 'photo', w: L.w }) } show() };
  const pv = h('button', 'nv p', ['‹'], { type: 'button', 'aria-label': 'previous photograph', onclick: () => step(-1) }), nx = h('button', 'nv n', ['›'], { type: 'button', 'aria-label': 'next photograph', onclick: () => step(1) });
  img.addEventListener('click', () => { closer = !closer; show() }); box.append(pv, nx); swipe(box, d => !closer && step(d)); show() }
/* Objects specimen (objects-3d-proto fe49cf3 data + look, regrouped honestly: the paddles, the spoon and the carving are their own group) */
function buildSpecimen(v, id) { const sp = SPECIMENS.find(x => x.id === id) || SPECIMENS[0], inn = sheet(v, 'spec'); v.el.classList.add('specv');
  inn.appendChild(h('div', 'chead', [t('h2', '', sp.title)])); const tabs = h('div', 'tabs'), fr = h('div', 'fr'); inn.appendChild(tabs); inn.appendChild(fr);
  /* the shop layer stays hidden until it is real; a caption is the repo's description or nothing, never a file name */
  const Ls = LAYERS.filter(Lr => Lr.k !== 'shop' && (sp.layers[Lr.k] || []).some(f => f.img)), capOk = c => c && !/^(IMG_|[0-9A-F]{8}\b|SCOOP-)|\.(jpe?g|png|webp)$/i.test(c);
  /* objects-3d fe49cf3 look: whole pieces as cutouts in a warm pool of light with a contact shadow; every other frame soft-edged */
  const set = k => { [...tabs.children].forEach(b => b.classList.toggle('on', b.dataset.k === k)); fr.textContent = ''; fr.dataset.k = k;
    sp.layers[k].filter(f => f.img).forEach(f => fr.appendChild(h('figure', f.cut ? 'cut' + (f.sit === false ? ' float' : '') : 'soft', [h('div', 'ph', [h('img', '', null, { src: f.img, alt: capOk(f.cap) ? f.cap : '', loading: 'lazy' })]), capOk(f.cap) ? t('figcaption', '', f.cap) : null]))) };
  Ls.forEach(Lr => tabs.appendChild(h('button', '', [Lr.name + ' · ' + sp.layers[Lr.k].filter(f => f.img).length], { type: 'button', 'data-k': Lr.k, onclick: () => set(Lr.k) })));
  if (Ls.length) set(Ls[0].k) }
/* Sound: the tracks (data.json), played in the dock */
function buildSound(v) { const it = BY['sound/waveform'], inn = sheet(v, 'work'); const tx = h('div', 'txt panel solo'); inn.appendChild(tx);
  tx.appendChild(t('p', 'kick', 'sound')); tx.appendChild(t('h2', 'ttl', it.title)); if (it.meta) tx.appendChild(t('p', 'meta', it.meta));
  const g = h('div', 'tracks'); D.tracks.forEach(tr => { const b = DOCK.button(tr); b.className = 'trk'; b.textContent = ''; b.append(t('b', '', '▶ ' + tr.title), t('i', '', tr.artist)); g.appendChild(b) }); tx.appendChild(g) }
/* About lands on the bio, on the moon (moon-water.webp: the opening frame of Reel 2026 v7, the crescent moon over the water) */
function buildAbout(v) { v.el.classList.add('aboutv'); const moon = h('div', 'moon'); v.el.appendChild(moon); const inn = sheet(v); const bio = BY['about/bio'];
  const box = h('article', 'bio panel'); box.appendChild(t('p', 'kick', 'bio')); bio.body.split(/\n\n+/).forEach(par => box.appendChild(t('p', '', par)));
  const links = h('div', 'links'), c = BY['about/contact'], j = BY['about/joio'], pm = BY['about/poem'];
  links.appendChild(h('a', 'em', [c.title], { href: 'mailto:' + c.title }));
  links.appendChild(h('a', '', [j.title + ' ↗'], { href: 'https://www.joioco.com', target: '_blank', rel: 'noopener' }));
  links.appendChild(h('button', '', [pm.title], { type: 'button', onclick: () => openId('about/poem') }));
  links.appendChild(h('button', '', ['earlier builds'], { type: 'button', onclick: () => sub_('builds') }));
  box.appendChild(links); inn.appendChild(box) }
function buildPoem(v) { v.el.classList.add('aboutv'); v.el.appendChild(h('div', 'moon')); const inn = sheet(v), it = BY['about/poem'];
  const box = h('article', 'bio panel poem'); box.appendChild(t('p', 'kick', it.title)); (it.body || D.poem || '').split('\n').forEach(l => box.appendChild(t('p', '', l))); inn.appendChild(box) }
function buildHistory(v) { v.el.classList.add('aboutv'); v.el.appendChild(h('div', 'moon')); const inn = sheet(v); const box = h('article', 'bio panel hist');
  box.appendChild(t('p', 'kick', 'earlier builds'));
  HISTORY.forEach(g => { box.appendChild(t('h3', '', g.g)); box.appendChild(h('ul', '', g.items.map(([lab, url]) => h('li', '', [h('a', '', [lab, t('i', '', ' ↗')], { href: url, target: '_blank', rel: 'noopener' })])))) });
  inn.appendChild(box) }
/* ---------- Spirit Eye: the brief, its own place over the sky (#spirit-eye/N) ---------- */
const BUDGET = { rows: [['Materials', '100,000'], ['Fabrication', '180,000'], ['Design Development', '80,000'], ['Community Engagement', '200,000'], ['Administration', '50,000'], ['Engineering', '300,000'], ['Site Preparation and installation', '100,000'], ['Public Artists', '200,000'], ['Project Manager', '100,000'], ['Infrastructure', '5.5 million'], ['Contingency', '100,000']], foot: '1.3 million public art + 5.5 million infrastructure' };
/* the reading panel is fitted (se-brief 29ae7fe fit()): the type steps down until the page fits; if it still cannot, the panel
   scrolls and says so (a visible scrollbar, a fade and "scroll ↓") */
function fitPanel() { const p = BRF.tellp; if (!p || p.hidden) return; const H0 = innerHeight, W0 = innerWidth; let fs = H0 < 500 ? 17 : W0 < 700 ? 18 : 20;
  p.classList.remove('scrolls', 'cols'); const over = () => p.scrollHeight > p.clientHeight + 1; p.style.fontSize = fs + 'px';
  if (over() && W0 > H0 * 1.4 && p.querySelector('p:not(.kick):not(.subh), li, .budget')) p.classList.add('cols');
  while (over() && fs > 14) { fs -= .5; p.style.fontSize = fs + 'px' }
  p.classList.toggle('scrolls', over()); p.dataset.fs = fs }
addEventListener('resize', () => BRF.on && requestAnimationFrame(fitPanel));
const BRF = { on: false, i: -1, el: $('#brief'), world: null, mounting: null }; let lastBrief = 0;
function briefBuild() { if (BRF.built) return; BRF.built = true; const el = BRF.el;
  const cv = h('canvas', 'se-cv'), veil = h('div', '', null, { id: 'se-veil' });
  const bar = h('div', 'bbar', [h('button', 'home', ['ᑕᐣᓯ'], { type: 'button', 'aria-label': 'the whole sky', onclick: () => briefClose(true, true) }), h('button', 'bk', ['‹'], { type: 'button', 'aria-label': 'back one page', onclick: briefBack }), h('p', 'where', null)]);
  const tellp = h('div', 'tellp panel'), showc = h('div', 'showc'), dom = h('div', 'dom-plate'), pager = h('div', 'pager'), pn = t('span', 'pn', '');
  pager.append(h('button', '', ['‹'], { type: 'button', 'aria-label': 'previous page', onclick: () => briefStep(-1) }), pn, h('button', '', ['›'], { type: 'button', 'aria-label': 'next page', 'data-a': 'next', onclick: () => briefStep(1) }), h('button', 'cts', ['contents'], { type: 'button', onclick: briefToc }));
  const pdfv = h('div', 'pdfv', null, { hidden: '' });
  el.append(cv, veil, dom, tellp, showc, pager, pdfv, bar); Object.assign(BRF, { cv, tellp, showc, dom, pn, bar, pdfv });
  swipe(el, d => { if (!pdfv.hidden) return; briefStep(d) });
  let acc = 0, lock = 0; el.addEventListener('wheel', e => { if (!pdfv.hidden) return; const sc = e.target.closest('.tellp'); if (sc && sc.scrollHeight > sc.clientHeight + 4 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { const atEnd = e.deltaY > 0 ? sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2 : sc.scrollTop <= 0; if (!atEnd) return }
    e.preventDefault(); const now = performance.now(); if (now < lock) return; acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (Math.abs(acc) > 60) { briefStep(acc > 0 ? 1 : -1); acc = 0; lock = now + 650 } }, { passive: false });
  BRF.mounting = import('./se-world.js').then(async m => { await m.mount(cv, []); BRF.world = m.world.ok ? m.world : null; if (BRF.world && BRF.on) { const i = BRF.i; BRF.i = -1; briefShow(i) } }).catch(() => { ROOT.classList.add('nogl') }) }
function briefOpen(i) { if (L && W.state().lv === 3) {} briefBuild(); const was = BRF.on; BRF.on = true; BRF.el.hidden = false; ROOT.classList.add('brief-on');
  if (BRF.world) BRF.world.paused = false; DOCK; const hs = '#spirit-eye/' + (i + 1);
  try { if (was) history.replaceState({ se: 1 }, '', location.pathname + hs); else history.pushState({ se: 1 }, '', location.pathname + hs) } catch (e) {}
  BRF.i = -1; briefShow(i); ringSync() }
function briefClose(viaUser, home) { if (!BRF.on) return; BRF.on = false; BRF.el.hidden = true; ROOT.classList.remove('brief-on'); if (BRF.world) BRF.world.paused = true; BRF.pdfv.hidden = true;
  let wentBack = false; if (viaUser && history.state && history.state.se) { wentBack = true; if (home) BRF.home = true; history.back() }
  if (home && !wentBack) goHome(); ringSync() }
/* leaving Spirit Eye for a chapter: its history entry becomes the sky's current place, so the next move pushes cleanly */
function briefLeave() { briefClose(false); const s = W.state(); try { history.replaceState({ gj3: 1, lv: s.lv, k: s.k, w: s.w, anc: 0 }, '', s.lv ? location.pathname + W.hashOf(s) : location.pathname + location.search) } catch (e) {} }
function briefBack() { if (!BRF.pdfv.hidden) { BRF.pdfv.hidden = true; return } if (BRF.i > 0) briefStep(-1); else briefClose(true) }
function briefFromHash(hs) { const n = +(hs.split('/')[1] || 1); briefBuild(); if (!BRF.on) { BRF.on = true; BRF.el.hidden = false; ROOT.classList.add('brief-on'); if (BRF.world) BRF.world.paused = false } BRF.i = -1; briefShow(n - 1); ringSync() }
function briefStep(d) { const n = BRF.i + d; if (n < 0 || n >= STOPS.length) return; try { history.replaceState({ se: 1 }, '', location.pathname + '#spirit-eye/' + (n + 1)) } catch (e) {} briefShow(n) }
function label(st) { return st.kind === 'gallery' ? 'pp. 26–32' : st.kind === 'endsec' ? 'pp. 24–25' : 'p. ' + st.n }
function briefShow(i) { i = Math.max(0, Math.min(STOPS.length - 1, i)); if (BRF.i === i) return; BRF.i = i; lastBrief = i; const st = STOPS[i], { tellp, showc, dom, pn } = BRF, wd = BRF.world;
  tellp.textContent = ''; showc.textContent = ''; dom.textContent = ''; tellp.hidden = false; tellp.scrollTop = 0; BRF.pdfv.hidden = true;
  pn.textContent = label(st) + ' · ' + (i + 1) + ' / ' + STOPS.length; const pg = st.page;
  const where = $('.where', BRF.bar); where.textContent = ''; where.append('spirit eye', ' · ', t('b', '', st.sec && st.sec !== 'spirit eye' ? st.sec : label(st)));
  BRF.el.dataset.kind = st.kind;
  if (st.kind === 'title') { tellp.appendChild(t('h1', '', pg.h)); tellp.appendChild(t('p', 'subh', pg.by));
    tellp.appendChild(h('div', 'howto', [h('p', '', [t('b', '', 'swipe, scroll or tap ›'), ' to turn one page.']), h('p', '', [t('b', '', 'the chapters below'), ' are open at any time: tap one to go there.']), h('p', '', [t('b', '', '‹'), ' goes back one step, ', t('b', '', 'ᑕᐣᓯ'), ' shows the whole sky, ', t('b', '', 'contents'), ' jumps to a section.'])]));
    tellp.appendChild(h('div', 'acts', [h('button', 'btn', ['begin ›'], { type: 'button', onclick: () => briefStep(1) })]));
    if (wd) { wd.anchor(); wd.dim(.15) } }
  else if (st.kind === 'tell') { tellp.appendChild(t('p', 'kick', label(st))); if (pg.h) tellp.appendChild(t('h1', '', pg.h)); (pg.sub || []).forEach(x => tellp.appendChild(t('p', 'subh', x)));
    (pg.p || []).forEach((par, k) => tellp.appendChild(t('p', k === 0 && par.length < 200 ? 'lead' : '', par)));
    if (pg.pairs) tellp.appendChild(h('dl', '', pg.pairs.flatMap(pr => [t('dt', '', pr[0]), pr[1] ? t('dd', '', pr[1]) : null])));
    if (pg.plants) tellp.appendChild(h('ul', '', pg.plants.map(x => t('li', '', x))));
    if (pg.note && pg.n !== 25) tellp.appendChild(t('p', 'note', pg.note));
    if (pg.list) tellp.appendChild(h('ul', 'cv', pg.list.map(x => t('li', '', x)))); /* the PDF's own dash, once (no CSS bullet) */
    /* p.24: the budget table is an image in the PDF; these rows are its exact words (checked against p24t.webp; table from se-brief 29ae7fe) */
    if (pg.n === 24) tellp.appendChild(h('div', 'budget', BUDGET.rows.map(r => h('div', 'r', [t('span', '', r[0]), t('span', '', r[1])], { role: 'row' })).concat([h('div', 'r f', [t('span', '', BUDGET.foot)], { role: 'row' })]), { role: 'table' }));
    else if (pg.pimg) tellp.appendChild(h('img', 'pimg', null, { src: PDF + pg.pimg + '.webp', alt: 'p. ' + pg.n }));
    if (wd) { const nx = STOPS.slice(i + 1).find(x => x.kind === 'show'); if (nx) wd.preload(nx.img[0], PDF + nx.img[0] + '.webp', nx.img[1], nx.img[2], STOPS.indexOf(nx), STOPS.length); wd.anchor(); wd.dim(.62) } }
  else if (st.kind === 'show') { tellp.hidden = true; const [f, w, hh] = st.img;
    showc.appendChild(t('span', '', (pg.h ? pg.h + ' · ' : '') + 'p. ' + st.n)); showc.appendChild(h('button', '', ['open the page'], { type: 'button', onclick: () => pdfOpen(f) }));
    dom.appendChild(h('img', '', null, { src: PDF + f + '.webp', alt: 'p. ' + st.n }));
    if (wd) { wd.plate(f, PDF + f + '.webp', w, hh, i, STOPS.length); wd.dim(0); const nx = STOPS[i + 1]; if (nx && nx.kind === 'show') wd.preload(nx.img[0], PDF + nx.img[0] + '.webp', nx.img[1], nx.img[2], i + 1, STOPS.length) } }
  else if (st.kind === 'endsec') { tellp.appendChild(t('p', 'kick', 'pp. 24–25')); tellp.appendChild(t('h1', '', STOPS[i + 1].page.h)); tellp.appendChild(t('h1', '', STOPS[i + 3].page.h));
    if (wd) { wd.anchor(); wd.dim(.5) } }
  else if (st.kind === 'gallery') { tellp.appendChild(t('p', 'kick', 'pp. 26–32')); const g = h('div', 'gal');
    st.pages.forEach(p => g.appendChild(h('button', '', [h('img', '', null, { src: PDF + p.img[0][0] + '-s.webp', alt: 'p. ' + p.n, loading: 'lazy' }), t('span', '', 'p. ' + p.n)], { type: 'button', 'data-p': p.n, onclick: () => pdfOpen(p.img[0][0]) }))); tellp.appendChild(g);
    if (wd) { wd.anchor(); wd.dim(.6) } }
  else if (st.kind === 'close') { tellp.appendChild(t('h1', '', pg.h)); tellp.appendChild(t('p', 'subh', pg.by)); const ul = h('ul', 'toc');
    contents().forEach(c => ul.appendChild(h('li', '', [h('button', '', [c.sec, t('i', '', c.sec === 'pp. 26–32' ? '' : 'p. ' + c.n)], { type: 'button', onclick: () => { briefStep(c.i - BRF.i) } })])));
    tellp.appendChild(ul); tellp.appendChild(h('div', 'acts', [h('button', 'btn', ['the whole sky ›'], { type: 'button', onclick: () => briefClose(true, true) })]));
    if (wd) { wd.home(); wd.dim(.35) } }
  if (!tellp.hidden) { tellp.appendChild(t('p', 'more', 'scroll ↓')); requestAnimationFrame(fitPanel); if (document.fonts) document.fonts.ready.then(() => BRF.i === i && fitPanel()) } }
function briefToc() { const { tellp, showc, dom } = BRF; tellp.hidden = false; showc.textContent = ''; dom.textContent = ''; tellp.textContent = ''; tellp.appendChild(t('h1', '', STOPS[0].page.h)); tellp.appendChild(t('p', 'subh', CREDIT)); const ul = h('ul', 'toc');
  contents().forEach(c => ul.appendChild(h('li', '', [h('button', '', [c.sec, t('i', '', c.sec === 'pp. 26–32' ? '' : 'p. ' + c.n)], { type: 'button', onclick: () => { const k = c.i; BRF.i = -1; try { history.replaceState({ se: 1 }, '', location.pathname + '#spirit-eye/' + (k + 1)) } catch (e) {} briefShow(k) } })]))); tellp.appendChild(ul); BRF.i = -2; if (BRF.world) BRF.world.dim(.62) }
function pdfOpen(f) { const v = BRF.pdfv; v.textContent = ''; v.hidden = false;
  const ALL = []; STOPS.forEach(x => { if (x.img) ALL.push([x.img[0], x.n]); if (x.pages) x.pages.forEach(p => ALL.push([p.img[0][0], p.n])) });
  const uniq = ALL.filter((x, i) => ALL.findIndex(y => y[0] === x[0]) === i); let k = Math.max(0, uniq.findIndex(x => x[0] === f));
  const gal = uniq.filter(x => x[1] >= 26), inGal = uniq[k][1] >= 26, Ls = inGal ? gal : [uniq[k]], j = Ls.findIndex(x => x[0] === uniq[k][0]);
  v.appendChild(h('img', '', null, { src: PDF + uniq[k][0] + '.webp', alt: 'p. ' + uniq[k][1] })); v.appendChild(t('p', 'cap', 'p. ' + uniq[k][1] + (inGal ? ' · ' + (j + 1) + ' / ' + Ls.length : '')));
  v.appendChild(h('button', 'x', ['✕'], { type: 'button', 'aria-label': 'close the page', onclick: () => v.hidden = true }));
  if (inGal) { const step = d => { const n = j + d; if (n >= 0 && n < Ls.length) pdfOpen(Ls[n][0]) };
    if (j > 0) v.appendChild(h('button', 'nv p', ['‹'], { type: 'button', onclick: () => step(-1), 'aria-label': 'previous page' })); if (j < Ls.length - 1) v.appendChild(h('button', 'nv n', ['›'], { type: 'button', onclick: () => step(1), 'aria-label': 'next page' })); if (!v._sw) { v._sw = 1; swipe(v, d => v._step && v._step(d)) } v._step = step } else v._step = null }
/* a horizontal swipe = one step (pointer events, so mouse drags count too) */
function swipe(el, step) { let x0 = null, y0 = 0, t0 = 0;
  el.addEventListener('pointerdown', e => { if (e.target.closest('button,a,input,.strip,.fstrip,canvas.se-cv~*:not(.tellp)')) {} if (e.target.closest('button,a,input,.strip,.fstrip')) return; x0 = e.clientX; y0 = e.clientY; t0 = performance.now() });
  el.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3 && performance.now() - t0 < 900) step(dx < 0 ? 1 : -1) });
  el.addEventListener('pointercancel', () => x0 = null) }
addEventListener('keydown', e => { if (!BRF.on) return; if (e.target.closest && e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); briefStep(1) } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); briefStep(-1) } else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); briefBack() } }, true);
/* ---------- start ---------- */
fio = new IntersectionObserver(es => es.forEach(e => { if (e.intersectionRatio > .6 && ROOT.classList.contains('far')) fplay([...strip.children].indexOf(e.target)) }), { root: strip, threshold: [.6] });
[...strip.children].forEach(c => fio.observe(c));
DOCK.mount(D.tracks, UP); SKY.mount();
entTick();
if (window.__oneOwns(window.__oneBootHash || '')) { history.pushState({ se: 1 }, '', location.pathname + window.__oneBootHash); briefFromHash(window.__oneBootHash) }
ROOT.classList.add('ready');
