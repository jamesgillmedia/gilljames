/* objects-3d prototype: boot, HUD, input. Presentation lives in presenters.js / moves.js / transitions.js, state in nav.js.
 Gestures (one gesture = exactly one step, see nav.js):
 in : pinch in, wheel / trackpad toward, Enter, ArrowDown, tap
 up : pinch out, wheel / trackpad away, ArrowUp, Backspace, Escape, the Back button
 next / previous specimen : horizontal swipe, ArrowRight / ArrowLeft, the side buttons
 Home: the Home button, the Home key
 No auto-advance, no idle motion, no audio. Nothing reads prefers-reduced-motion: motion is the same with Reduce Motion on. */
import { SPECIMENS, stopsOf } from './data.js';
import { PRESENTERS } from './presenters.js';
import { MOVE } from './moves.js';
import { TRANSITION } from './transitions.js';
import { createNav } from './nav.js';

const html = document.documentElement, $ = s => document.querySelector(s);
const cv = $('#c'), HUD = $('#hud'), CAP = $('#cap'), WHERE = $('#where'), AXIS = $('#axis'), FB = $('#fb');
const BACK = $('#back'), PREV = $('#prev'), NEXT = $('#next');

function margins() {
  const h = HUD.getBoundingClientRect(), c = CAP.getBoundingClientRect();
  const land = innerWidth / innerHeight > 1.5 && innerHeight < 520, side = land ? 56 : 22;
  return { top: Math.ceil(h.bottom) + 6, bottom: Math.ceil(innerHeight - c.top) + 4, left: side, right: side };
}

let view = null, THREE = null;
if (!html.classList.contains('nogl')) {
  try {
    THREE = await import('../vendor/three.module.min.js');
    const { createView } = await import('./view.js');
    view = createView(THREE, cv, SPECIMENS, stopsOf, PRESENTERS, MOVE, margins);
  } catch (e) { console.warn(e); html.classList.add('nogl'); view = null }
}
if (!view) {
  view = { place() {}, show() {}, layout() {}, fade: () => Promise.resolve(), move: (sp, a, b, mid) => new Promise(r => { FB.style.opacity = 0; setTimeout(() => { mid && mid(); FB.style.opacity = 1; setTimeout(r, 200) }, 250) }) };
}

let axisN = -1;
const ui = {
  busy(b) { WHERE.classList.toggle('fade', b); CAP.classList.toggle('fade', b) },
  update(s) {
    $('.w', WHERE).textContent = s.title + ' · ' + s.name;
    $('.n', WHERE).textContent = s.cnt > 1 ? (s.i + 1) + ' / ' + s.cnt : '';
    const f = s.frame;
    $('.t', CAP).textContent = f.slot ? '' : f.cap;
    $('.s', CAP).textContent = f.crop ? 'detail' : '';
    BACK.disabled = s.stop === 0; PREV.disabled = s.spec === 0; NEXT.disabled = s.spec === s.nSpec - 1;
    if (axisN !== s.spec * 1000 + s.n) {
      axisN = s.spec * 1000 + s.n; AXIS.innerHTML = '';
      stopsOf(SPECIMENS[s.spec]).forEach((st, k, a) => { const i = document.createElement('i'); if (k && a[k - 1].layer !== st.layer) i.className = 'g'; AXIS.appendChild(i) });
    }
    [...AXIS.children].forEach((i, k) => i.classList.toggle('on', k === s.stop));
    if (html.classList.contains('nogl') && !f.slot) FB.src = f.img, FB.alt = s.title + ' · ' + s.name;
  }
};
const nav = createNav(SPECIMENS, stopsOf, view, TRANSITION, ui);

/* ---------- input ---------- */
const deeper = () => nav.deeper(), up = () => nav.up();
BACK.addEventListener('click', up); $('#home').addEventListener('click', () => nav.home());
PREV.addEventListener('click', () => nav.prevSpecimen()); NEXT.addEventListener('click', () => nav.nextSpecimen());
addEventListener('keydown', e => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (k === 'Enter' || k === 'ArrowDown') deeper();
  else if (k === 'ArrowUp' || k === 'Backspace' || k === 'Escape') up();
  else if (k === 'ArrowRight') nav.nextSpecimen();
  else if (k === 'ArrowLeft') nav.prevSpecimen();
  else if (k === 'Home') nav.home();
  else return;
  e.preventDefault();
});

/* wheel and trackpad: one burst = one step. After a step the lock stays until the next wheel event arrives after a 220 ms gap (measured when the page handles the event),
 so a trackpad's inertia tail cannot add a second step. Scroll toward = deeper (the usual zoom direction). */
let wAcc = 0, wLock = false, wLast = 0;
cv.addEventListener('wheel', e => {
  e.preventDefault();
  const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (e.ctrlKey ? 4 : 1), t = performance.now();
  if (t - wLast > 220) { wLock = false; wAcc = 0 }
  wLast = t;
  if (wLock) return;
  wAcc += dy; if (Math.abs(wAcc) < 30) return;
  wLock = true; const d = wAcc; wAcc = 0; if (d < 0) deeper(); else up();
}, { passive: false });

/* touch / mouse: two fingers = pinch (one step per pinch, fired when the spread has changed by ~20%, then locked until the fingers lift);
 one finger: a short tap goes deeper, a horizontal swipe goes to the next or previous specimen */
const PT = new Map(); let G = null;
const dist = () => { const a = [...PT.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) };
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (x) {}
  PT.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!G) G = { x0: e.clientX, y0: e.clientY, t0: performance.now(), multi: false, fired: false, d0: 0 };
  if (PT.size >= 2) { G.multi = true; if (!G.d0) G.d0 = dist() }
});
cv.addEventListener('pointermove', e => {
  const p = PT.get(e.pointerId); if (!p) return; p.x = e.clientX; p.y = e.clientY;
  if (G && G.multi && PT.size >= 2 && !G.fired && G.d0 > 0) {
    const r = dist() / G.d0;
    if (r > 1.2) { G.fired = true; deeper() } else if (r < .83) { G.fired = true; up() }
  }
});
function release(e, cancel) {
  const p = PT.get(e.pointerId); if (!p) return; PT.delete(e.pointerId);
  if (!G) return;
  if (!G.multi && !cancel) {
    const dx = e.clientX - G.x0, dy = e.clientY - G.y0, dt = performance.now() - G.t0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.3 * Math.abs(dy)) { if (dx < 0) nav.nextSpecimen(); else nav.prevSpecimen() }
    else if (Math.hypot(dx, dy) < 12 && dt < 600) deeper();
  }
  if (PT.size === 0) G = null;
}
cv.addEventListener('pointerup', e => release(e, false)); cv.addEventListener('pointercancel', e => release(e, true));
['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => cv.addEventListener(t, e => e.preventDefault(), { passive: false }));
cv.addEventListener('contextmenu', e => e.preventDefault());

addEventListener('resize', () => { view.layout() });
nav.start(); view.layout();
window.__o3 = { info: nav.info, deeper, up, next: () => nav.nextSpecimen(), prev: () => nav.prevSpecimen(), home: () => nav.home(), view: () => view.stateDebug && view.stateDebug() };
