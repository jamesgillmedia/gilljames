/* The three.js side: one scene, one dark ground, one camera that only ever looks straight down -z.
 Each specimen is a group at its own x; its stops are laid along -z. The camera sits F in front of the stop it is on. */
export function createView(THREE, canvas, SPECS, stopsOf, PRESENTERS, MOVE, getMargins) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  R.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const FOV = 38, F = 10, SPEC_X = 300;
  const cam = new THREE.PerspectiveCamera(FOV, 1, .1, 200); scene.add(cam);
  const tanH = Math.tan(FOV * Math.PI / 360);
  /* a faint static scatter of stars behind everything (the soft colour washes of Spirit Eye's sky are in objects3d.css, which costs no fill rate).
 It follows the camera sideways and almost fully in depth, so the dolly moves it only a little. Nothing in it moves by itself. */
  const haze = new THREE.Group(); haze.renderOrder = -10; scene.add(haze);
  (function stars() {
    let a = 20241111; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
    const dot = (function () { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c) })();
    [[560, .34, .7], [34, .7, .9]].forEach(L => {
      const n = L[0], pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const d = 70 + rnd() * 100, hh = d * tanH; pos[i * 3] = (rnd() - .5) * 2 * hh * 1.8; pos[i * 3 + 1] = (rnd() - .5) * 2 * hh; pos[i * 3 + 2] = -d;
        const b = .35 + rnd() * .65, t = rnd(); col[i * 3] = b * (.8 + .2 * t); col[i * 3 + 1] = b * (.86 + .1 * t); col[i * 3 + 2] = b * (1 - .15 * t * t) }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const p = new THREE.Points(g, new THREE.PointsMaterial({ size: L[1], map: dot, vertexColors: true, transparent: true, opacity: L[2], depthWrite: false, sizeAttenuation: true }));
      p.renderOrder = -9; haze.add(p) });
  })();
  let dirty = true, W = 1, H = 1, kpx = 1, box = { w: 1, h: 1 }, shiftY = 0;
  const S = SPECS.map((spec, si) => {
    const g = new THREE.Group(); g.position.x = si * SPEC_X; scene.add(g);
    const stops = stopsOf(spec);
    const frames = stops.map((st, k) => {
      const env = { dirty: () => { dirty = true }, relayout: () => layout() };
      const P = PRESENTERS[st.layer](THREE, st.frame, env);
      P.group.position.z = -k * MOVE.SP; g.add(P.group); P.setAlpha(0);
      return { st, P, x: 0, y: 0, w: 1, h: 1 };
    });
    return { g, stops, frames, alpha: 0, s: 0 };
  });
  let cur = 0;
  function layout() {
    const m = getMargins(); W = innerWidth; H = innerHeight;
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
    kpx = 2 * F * tanH / H;
    const aw = Math.max(40, W - m.left - m.right), ah = Math.max(40, H - m.top - m.bottom);
    box = { w: aw * kpx, h: ah * kpx };
    shiftY = ((m.bottom - m.top) / 2) * kpx;
    S.forEach(sp => sp.frames.forEach((fr, k) => {
      const sz = fr.P.layout(box); fr.w = sz.w; fr.h = sz.h;
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
    cam.position.set(cur * SPEC_X + a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - shiftY, F - s * MOVE.SP);
    haze.position.set(cam.position.x, cam.position.y, cam.position.z * .92);
    S.forEach((q, si) => {
      q.g.visible = q.alpha > .002;
      if (!q.g.visible) return;
      q.frames.forEach((fr, k) => fr.P.setAlpha(q.alpha * (si === cur ? MOVE.alpha(Math.abs(q.s - k)) : 0)));
    });
  }
  const tweens = new Set();
  function tween(ms, fn, ease) {
    return new Promise(res => { const t0 = performance.now(), tw = { };
      tw.step = now => { const t = Math.min(1, (now - t0) / ms); fn(ease ? ease(t) : t, t); if (t >= 1) { tweens.delete(tw); res() } };
      tweens.add(tw); dirty = true });
  }
  function loop(now) {
    requestAnimationFrame(loop);
    tweens.forEach(tw => tw.step(now));
    if (tweens.size || dirty) { apply(); R.render(scene, cam); dirty = false }
  }
  requestAnimationFrame(loop);
  return {
    ready: () => Promise.resolve(),
    layout,
    specX: si => si * SPEC_X,
    current: () => cur,
    /* put the camera on a stop with no motion; the specimen becomes the current one (alpha untouched) */
    place(si, stop) { cur = si; S[si].s = stop; apply(); dirty = true },
    show(si, a) { S[si].alpha = a; apply(); dirty = true },
    fade(si, to, ms) { const q = S[si], a0 = q.alpha; return tween(ms, t => { q.alpha = a0 + (to - a0) * t; apply() }, t => t * t * (3 - 2 * t)) },
    /* one stop along the axis, a straight dolly. onMid fires once when it is halfway. */
    move(si, from, to, onMid) {
      const q = S[si]; let mid = false; q.s = from;
      return tween(MOVE.duration, (e, t) => { q.s = from + (to - from) * Math.min(1, Math.max(0, e)); if (!mid && t >= .5) { mid = true; if (onMid) onMid() } }, MOVE.ease).then(() => { q.s = to; apply() });
    },
    stateDebug: () => ({ cur, s: S[cur].s, alpha: S.map(q => +q.alpha.toFixed(2)), frames: S[cur].frames.map(f => +f.P.group.visible) })
  };
}
