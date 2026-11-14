/* objects-3d prototype: boot, HUD, input. Presentation lives in presenters.js / moves.js / transitions.js, state in nav.js, camera in view.js.
   Gestures:
     orbit        : drag with the mouse or one finger (gentle, soft walls, slow inertia, very slow idle drift)
     in / up      : pinch in / out, wheel or trackpad toward / away (the dolly: exactly one stop per gesture), Enter / ArrowDown, ArrowUp, tap
     back         : the Back button, Backspace, Escape (up one layer; at the first stop it first settles the orbit, then leaves the page the way it came)
     next / previous specimen : ArrowRight / ArrowLeft, the side chevrons
     Home: the Home button, the Home key;  0 settles the orbit
   Reduce Motion: no idle drift, no inertia, no push, short eases and stiffer springs. No audio, no auto-advance. */
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
  view = { place() {}, show() {}, layout() {}, grab() {}, drag() {}, release() {}, poseHome() {}, displaced: () => false, fade: () => Promise.resolve(), move: (sp, a, b, mid) => new Promise(r => { FB.style.opacity = 0; setTimeout(() => { mid && mid(); FB.style.opacity = 1; setTimeout(r, 200) }, 250) }) };
}

let axisN = -1;
const ui = {
  busy(b) { WHERE.classList.toggle('fade', b); CAP.classList.toggle('fade', b) },
  update(s) {
    $('.w', WHERE).textContent = s.title + ' · ' + s.name;
    $('.n', WHERE).textContent = s.cnt > 1 ? (s.i + 1) + ' / ' + s.cnt : '';
    const f = s.frame;
    $('.t', CAP).textContent = f.slot ? '' : f.cap;
    $('.s', CAP).textContent = f.slot ? 'placeholder · not live' : f.stem + (f.crop ? ' · detail crop' : '');
    BACK.disabled = s.stop === 0 && history.length <= 1; PREV.disabled = s.spec === 0; NEXT.disabled = s.spec === s.nSpec - 1;
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
const deeper = () => nav.deeper(), up = () => nav.up(), back = () => {
  if (nav.info().stop === 0) {   // first stop: settle the orbit, then step out of the page (never a trap)
    if (view.displaced()) view.poseHome(4.6); else if (history.length > 1) history.back();
    return;
  }
  nav.up();
};
BACK.addEventListener('click', back); $('#home').addEventListener('click', () => nav.home());
PREV.addEventListener('click', () => nav.prevSpecimen()); NEXT.addEventListener('click', () => nav.nextSpecimen());
addEventListener('keydown', e => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;
  if (k === 'Enter' || k === 'ArrowDown') deeper();
  else if (k === 'ArrowUp') up();
  else if (k === 'Backspace' || k === 'Escape') back();
  else if (k === 'ArrowRight') nav.nextSpecimen();
  else if (k === 'ArrowLeft') nav.prevSpecimen();
  else if (k === 'Home') nav.home();
  else if (k === '0') view.poseHome(4.6);
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

/* touch / mouse: one finger or the mouse orbits the object; a short tap goes deeper;
   two fingers = pinch (one step per pinch, fired when the spread has changed by ~20%, then locked until the fingers lift) */
const PT = new Map(); let G = null;
const dist = () => { const a = [...PT.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) };
const endOrbit = () => { if (G && G.orbit) { G.orbit = false; view.release(); html.classList.remove('orbiting') } };
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); try { cv.setPointerCapture(e.pointerId) } catch (x) {}
  PT.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!G) G = { x0: e.clientX, y0: e.clientY, t0: performance.now(), multi: false, fired: false, d0: 0, orbit: false };
  if (PT.size >= 2) { endOrbit(); G.multi = true; if (!G.d0) G.d0 = dist() }
});
cv.addEventListener('pointermove', e => {
  const p = PT.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (G && !G.multi && PT.size === 1) {
    if (!G.orbit && Math.hypot(e.clientX - G.x0, e.clientY - G.y0) > 6) { G.orbit = true; view.grab(); html.classList.add('orbiting'); view.drag(e.clientX - G.x0, e.clientY - G.y0) }
    else if (G.orbit) view.drag(dx, dy);
  }
  if (G && G.multi && PT.size >= 2 && !G.fired && G.d0 > 0) {
    const r = dist() / G.d0;
    if (r > 1.2) { G.fired = true; deeper() } else if (r < .83) { G.fired = true; up() }
  }
});
function release(e, cancel) {
  const p = PT.get(e.pointerId); if (!p) return; PT.delete(e.pointerId);
  if (!G) return;
  if (!G.multi && !cancel && !G.orbit) {
    const dx = e.clientX - G.x0, dy = e.clientY - G.y0, dt = performance.now() - G.t0;
    if (Math.hypot(dx, dy) < 12 && dt < 600) deeper();
  }
  endOrbit();
  if (PT.size === 0) G = null;
}
cv.addEventListener('pointerup', e => release(e, false)); cv.addEventListener('pointercancel', e => release(e, true));
['touchstart', 'touchmove', 'gesturestart', 'gesturechange'].forEach(t => cv.addEventListener(t, e => e.preventDefault(), { passive: false }));
cv.addEventListener('contextmenu', e => e.preventDefault());

addEventListener('resize', () => { view.layout() });
nav.start(); view.layout();
window.__o3 = { info: nav.info, deeper, up, next: () => nav.nextSpecimen(), prev: () => nav.prevSpecimen(), home: () => nav.home(), view: () => view.stateDebug && view.stateDebug() };
