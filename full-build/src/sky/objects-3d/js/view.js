/* The three.js side: one scene, one solid dark room. Each specimen is a group at its own x; its stops are laid along -z.
   The camera sits F in front of the stop it is on and ORBITS the object it is looking at (gently, softly clamped),
   on the site's own camera logic: site-3d's critically damped spring (sstep) and weights, FOV 60, fable-m4's 960 ms push,
   the moon opener's exponential lag. See ../archive-index/js/archive.js for the same rig on the archive index. */
const WTS = rm => rm ? { REL: 14, FLY: 9, GLIDE: 8, SOFT: 6 } : { REL: 9.5, FLY: 5.6, GLIDE: 4.6, SOFT: 3.2 };
const mkS = (x, w) => ({ x, t: x, v: 0, w });
function sstep(q, dt) { const w = q.w, e = q.x - q.t, k = Math.exp(-w * dt), c = q.v + w * e; q.x = q.t + (e + c * dt) * k; q.v = (q.v - w * c * dt) * k }
const YAW = .62, PIT = .36, RAWK = 2.2, KRAD = .0045;
const IDLE_MS = 3500, DRIFT_Y = .2, DRIFT_P = .045, DRIFT_WY = .06, DRIFT_WP = .043;   // site-3d idle yaw .012 rad/s peak, 3.5 s after the last input
const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut3 = u => 1 - Math.pow(1 - u, 3);
function bump(e) { const f = e < .38 ? 1 + .1 * (1 - Math.pow(1 - e / .38, 2)) : 1.1 - .1 * easeOut3((e - .38) / .62); return 1 + (f - 1) * .5 }   // fable-m4 depth.js push, scaled to a breath
function fitScale(w, h, P, aw, ah) {   // largest scale at which a w x h plane stays inside aw x ah at every clamped orbit corner
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
export function createView(THREE, canvas, SPECS, stopsOf, PRESENTERS, MOVE, getMargins) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  R.setClearColor(0x050507, 1);   // the room: one solid, opaque colour, nothing behind the canvas
  const scene = new THREE.Scene();
  const FOV = 60, F = 10, SPEC_X = 300;
  const cam = new THREE.PerspectiveCamera(FOV, 1, .1, 200); scene.add(cam);
  const tanH = Math.tan(FOV * Math.PI / 360);
  const RMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const C = { yaw: mkS(0, 9.5), pit: mkS(0, 9.5) };
  let uy = 0, upv = 0, drift = 0, lastIn = performance.now(), interacting = false, lvel = [0, 0], lmoveT = 0, pushT0 = -1e9, springsLive = false;
  let dirty = true, W = 1, H = 1, kpx = 1, box = { w: 1, h: 1 }, viewOff = 0;
  const S = SPECS.map((spec, si) => {
    const g = new THREE.Group(); g.position.x = si * SPEC_X; scene.add(g);
    const stops = stopsOf(spec);
    const frames = stops.map((st, k) => {
      const env = { dirty: () => { dirty = true }, relayout: () => layout() };
      const P = PRESENTERS[st.layer](THREE, st.frame, env);
      P.group.position.z = -k * MOVE.SP; g.add(P.group); P.setAlpha(0);
      return { st, P, x: 0, y: 0, w: 1, h: 1 };
    });
    return { g, stops, frames, alpha: 0, s: 0, sp: mkS(0, 4.6) };
  });
  let cur = 0;
  function layout() {
    const m = getMargins(); W = innerWidth; H = innerHeight;
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
    kpx = 2 * F * tanH / H;
    const aw = Math.max(40, W - m.left - m.right), ah = Math.max(40, H - m.top - m.bottom);
    box = { w: aw * kpx, h: ah * kpx };
    viewOff = (m.bottom - m.top) / 2;
    cam.setViewOffset(W, H, 0, viewOff, W, H);
    S.forEach(sp => sp.frames.forEach((fr, k) => {
      let sz = fr.P.layout(box);
      const fk = fitScale(sz.w, sz.h, F, box.w, box.h);   // the clamped orbit must keep this frame inside the room
      if (fk < .999) sz = fr.P.layout({ w: box.w * fk, h: box.h * fk });
      fr.w = sz.w; fr.h = sz.h;
      if (k === 0) { fr.x = 0; fr.y = 0 } else {
        const p = sp.frames[k - 1], fo = fr.st.frame.focus;
        fr.x = p.x + (fo ? (fo[0] - .5) * p.w * .5 : 0); fr.y = p.y + (fo ? -(fo[1] - .5) * p.h * .5 : 0);
      }
      fr.P.group.position.x = fr.x; fr.P.group.position.y = fr.y;
    }));
    apply(); dirty = true;
  }
  function apply() {
    const sp = S[cur], N = sp.frames.length, s = sp.s, k0 = Math.max(0, Math.min(N - 1, Math.floor(s))), k1 = Math.min(N - 1, k0 + 1), t = s - k0;
    const a = sp.frames[k0], b = sp.frames[k1];
    const tx = cur * SPEC_X + a.x + (b.x - a.x) * t, ty = a.y + (b.y - a.y) * t, tz = -s * MOVE.SP;
    const yaw = C.yaw.x, pit = C.pit.x, Rr = F / bump(clampN((performance.now() - pushT0) / 960, 0, 1));
    cam.position.set(tx + Rr * Math.sin(yaw) * Math.cos(pit), ty + Rr * Math.sin(pit), tz + Rr * Math.cos(yaw) * Math.cos(pit));
    cam.lookAt(tx, ty, tz);
    S.forEach((q, si) => {
      q.g.visible = q.alpha > .002;
      if (!q.g.visible) return;
      q.frames.forEach((fr, k) => fr.P.setAlpha(q.alpha * (si === cur ? MOVE.alpha(Math.abs(q.s - k)) : 0)));
    });
  }
  const tweens = new Set();
  function tween(ms, fn, ease) {
    ms = RMQ.matches ? ms * .5 : ms;
    return new Promise(res => { const t0 = performance.now(), tw = { };
      tw.step = now => { const t = Math.min(1, (now - t0) / ms); fn(ease ? ease(t) : t, t); if (t >= 1) { tweens.delete(tw); res() } };
      tweens.add(tw); dirty = true });
  }
  let lastT = performance.now();
  const moves = new Set();
  function stepSprings(now) {
    const dt = Math.min(.05, Math.max(.001, (now - lastT) / 1000)); lastT = now;
    const rm = RMQ.matches, W_ = WTS(rm);
    let live = false;
    const idle = cur >= 0 && !interacting && now - lastIn > IDLE_MS;
    let dy = 0, dp = 0;
    if (idle && !rm) { drift += dt; dy = DRIFT_Y * Math.sin(DRIFT_WY * drift); dp = DRIFT_P * Math.sin(DRIFT_WP * drift); live = true; C.yaw.w = C.pit.w = W_.SOFT }
    C.yaw.t = YAW * Math.tanh((uy + dy) / YAW); C.pit.t = PIT * Math.tanh((upv + dp) / PIT);
    for (const q of [C.yaw, C.pit]) { sstep(q, dt); if (Math.abs(q.x - q.t) > 2e-5 || Math.abs(q.v) > 2e-5) live = true }
    C.yaw.x = clampN(C.yaw.x, -YAW, YAW); C.pit.x = clampN(C.pit.x, -PIT, PIT);
    const q = S[cur].sp; q.w = W_.GLIDE;
    if (moves.size || Math.abs(q.x - q.t) > 1e-4 || Math.abs(q.v) > 1e-4) { sstep(q, dt); S[cur].s = q.x; moves.forEach(m => m(q)); live = true }
    if (now - pushT0 < 960) live = true;
    springsLive = live;
  }
  function loop(now) {
    requestAnimationFrame(loop);
    tweens.forEach(tw => tw.step(now));
    stepSprings(now);
    if (tweens.size || dirty || springsLive) { apply(); R.render(scene, cam); dirty = false }
  }
  requestAnimationFrame(loop);
  return {
    ready: () => Promise.resolve(),
    layout,
    specX: si => si * SPEC_X,
    current: () => cur,
    /* put the camera on a stop with no motion; the specimen becomes the current one (alpha untouched) */
    place(si, stop) { cur = si; S[si].s = stop; S[si].sp.x = S[si].sp.t = stop; S[si].sp.v = 0; moves.clear(); uy = upv = drift = 0; C.yaw.x = C.pit.x = C.yaw.t = C.pit.t = 0; C.yaw.v = C.pit.v = 0; lastIn = performance.now(); apply(); dirty = true },
    show(si, a) { S[si].alpha = a; apply(); dirty = true },
    fade(si, to, ms) { const q = S[si], a0 = q.alpha; return tween(ms, t => { q.alpha = a0 + (to - a0) * t; apply() }, t => t * t * (3 - 2 * t)) },
    /* one stop along the axis: the site-3d glide spring (W_GLIDE) pulls the camera to the next stop, the 960 ms push breathes on top.
       onMid fires once at halfway; the promise resolves when 3% is left, the spring keeps settling after that. */
    move(si, from, to, onMid) {
      const q = S[si]; let mid = false; const sp = q.sp;
      sp.t = to; sp.w = WTS(RMQ.matches).GLIDE;
      poseHome(WTS(RMQ.matches).GLIDE);
      if (!RMQ.matches) pushT0 = performance.now();
      dirty = true;
      return new Promise(res => moves.add(function m(q2) {
        if (!mid && Math.abs(q2.x - from) >= .5 * Math.abs(to - from)) { mid = true; if (onMid) onMid() }
        if (Math.abs(q2.x - to) < .03 * Math.max(1, Math.abs(to - from))) { moves.delete(m); res() }
      }));
    },
    /* orbit: drag drives the target while held (W_REL), release lets it settle on W_SOFT with a slow inertia */
    grab() { absorb(); interacting = true; lastIn = performance.now(); lvel = [0, 0]; lmoveT = 0; C.yaw.w = C.pit.w = WTS(RMQ.matches).REL; dirty = true },
    drag(dx, dy) {
      const t = performance.now(), dts = Math.max(.008, (t - (lmoveT || t - 16)) / 1000); lmoveT = t; lastIn = t;
      uy = clampN(uy - dx * KRAD, -RAWK * YAW, RAWK * YAW); upv = clampN(upv + dy * KRAD, -RAWK * PIT, RAWK * PIT);
      lvel = [lvel[0] * .6 + (-dx * KRAD / dts) * .4, lvel[1] * .6 + (dy * KRAD / dts) * .4];
    },
    release() {
      interacting = false; lastIn = performance.now(); const W_ = WTS(RMQ.matches);
      if (!RMQ.matches && performance.now() - lmoveT < 80) { uy = clampN(uy + lvel[0] * .3, -RAWK * YAW, RAWK * YAW); upv = clampN(upv + lvel[1] * .3, -RAWK * PIT, RAWK * PIT) }   // slow inertia that settles
      C.yaw.w = C.pit.w = W_.SOFT; dirty = true;
    },
    poseHome,
    displaced: () => Math.abs(C.yaw.x) + Math.abs(C.pit.x) + Math.abs(uy) + Math.abs(upv) > .02,
    stateDebug: () => ({ cur, s: S[cur].s, yaw: C.yaw.x, pit: C.pit.x, alpha: S.map(q => +q.alpha.toFixed(2)), frames: S[cur].frames.map(f => +f.P.group.visible) })
  };
  function poseHome(w) { uy = upv = 0; drift = 0; C.yaw.w = C.pit.w = w; lastIn = performance.now(); dirty = true }
  function absorb() { if (drift > 0 && !RMQ.matches) { uy = clampN(uy + DRIFT_Y * Math.sin(DRIFT_WY * drift), -RAWK * YAW, RAWK * YAW); upv = clampN(upv + DRIFT_P * Math.sin(DRIFT_WP * drift), -RAWK * PIT, RAWK * PIT) } drift = 0 }
}
