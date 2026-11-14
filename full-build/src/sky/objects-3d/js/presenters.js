/* Per-layer presentation. SWAP POINT: each layer key maps to one presenter. Replace an entry (or add a new presenter)
   to change how a layer looks without touching nav, view, moves or transitions.

   A presenter is  (THREE, frame, env) -> { group, setAlpha(a), layout(box) -> {w, h}, dispose() }
     frame : one entry from data.js (img, stem, cap, crop, focus, slot, cut, sit)
     env   : { dirty(), relayout() } call dirty() when something visual changed, relayout() when a texture's size arrived
     box   : { w, h } in world units: the room the frame may fill at the stop.
     layout returns the world size it actually used (the view uses it for the drift of the dolly).

   Looks now:
     whole   : cutout   - the piece alone (alpha cutout), a warm pool of light behind and under it, a soft contact shadow
     surface : soft(...) - the material crop, large, with a soft feathered edge (no hard rectangle)
     making / use : soft(...) - the photo with a soft feathered edge
     shop    : emptySlot
   photo() is the earlier hard-edged frame, kept for comparison. */

const EDGE = 0x8e98aa;
const cache = new WeakMap();

export function radial(THREE) {
  if (cache.has(THREE)) return cache.get(THREE);
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  [[0, 1], [.2, .72], [.45, .32], [.72, .08], [1, 0]].forEach(s => g.addColorStop(s[0], 'rgba(255,255,255,' + s[1] + ')'));
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; cache.set(THREE, t); return t;
}

function blob(THREE, color, opacity, z) {
  const m = new THREE.MeshBasicMaterial({ map: radial(THREE), color, transparent: true, depthWrite: false, opacity: 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); mesh.position.z = z; mesh.userData.base = opacity; return mesh;
}

function unitSquare(THREE, color, opacity) {
  const pts = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(p => new THREE.Vector3(p[0], p[1], .001));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), m);
}

function loadTex(THREE, url, done) {
  new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; done(t) });
}

/* the piece alone: alpha cutout + warm light pool + contact shadow */
export function cutout(THREE, frame, env) {
  const group = new THREE.Group();
  const pool = blob(THREE, 0xffa857, .6, -.3), glow = blob(THREE, 0xffc78f, .22, -.55), shadow = blob(THREE, 0x000000, .85, -.06), shadow2 = blob(THREE, 0x000000, .5, -.1);   // layers sit at slightly different depths so the orbit reads as parallax; the room is solid, so the light stays quiet
  const mat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0, alphaTest: .002 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); mesh.visible = false;
  group.add(glow, pool, shadow2, shadow, mesh);
  const sit = frame.sit !== false;
  let aspect = .8, tex = null;
  loadTex(THREE, frame.img, t => { tex = t; mat.map = t; mat.needsUpdate = true; mesh.visible = true; aspect = t.image.width / t.image.height; env.relayout(); env.dirty() });
  const parts = [pool, glow, shadow, shadow2];
  return {
    group,
    setAlpha(a) { mat.opacity = a; parts.forEach(p => p.material.opacity = p.userData.base * a); group.visible = a > .002 },
    layout(box) {
      let w = box.w * .94, h = w / aspect; const hmax = box.h * .66; if (h > hmax) { h = hmax; w = h * aspect }
      mesh.scale.set(w, h, 1);
      const oy = h * .02;
      glow.scale.set(w * 2.5, w * 2.1, 1); glow.position.set(0, oy + h * .08, -.55);
      pool.scale.set(w * 1.9, w * .72, 1); pool.position.set(0, -h / 2 + (sit ? w * .02 : -w * .12), -.3);
      if (sit) { shadow.scale.set(w * .85, w * .11, 1); shadow.position.set(0, -h / 2 + w * .028, -.06); shadow2.scale.set(w * 1.5, w * .26, 1); shadow2.position.set(0, -h / 2 + w * .01, -.1) }
      else { shadow.scale.set(w * .7, w * .1, 1); shadow.position.set(0, -h / 2 - w * .14, -.06); shadow.userData.base = .55; shadow2.scale.set(w * 1.2, w * .22, 1); shadow2.position.set(0, -h / 2 - w * .16, -.1) }
      return { w, h };
    },
    dispose() { mesh.geometry.dispose(); mat.dispose(); if (tex) tex.dispose() }
  };
}

/* a photograph with a soft, feathered, rounded edge instead of a hard rectangle */
export const soft = (opt) => function softPhoto(THREE, frame, env) {
  const fill = (opt && opt.fill) || 1, feather = (opt && opt.feather) || .12;
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x14161b, transparent: true, depthWrite: false, opacity: 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); group.add(mesh);
  let aspect = 3 / 4, tex = null, mask = null;
  function makeMask() {
    const cw = aspect >= 1 ? 256 : Math.round(256 * aspect), ch = aspect >= 1 ? Math.round(256 / aspect) : 256;
    const c = document.createElement('canvas'); c.width = cw; c.height = ch; const x = c.getContext('2d'), id = x.createImageData(cw, ch);
    const m = Math.min(cw, ch), r = feather * m * .9, fw = feather * m, hx = cw / 2 - r, hy = ch / 2 - r;
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const qx = Math.abs(i + .5 - cw / 2) - hx, qy = Math.abs(j + .5 - ch / 2) - hy;
      const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
      let a = Math.min(1, Math.max(0, -sd / fw)); a = a * a * (3 - 2 * a); const v = Math.round(a * 255), k = (j * cw + i) * 4;
      id.data[k] = id.data[k + 1] = id.data[k + 2] = v; id.data[k + 3] = 255;
    }
    x.putImageData(id, 0, 0); mask = new THREE.CanvasTexture(c); mask.minFilter = THREE.LinearFilter; mask.generateMipmaps = false; return mask;
  }
  loadTex(THREE, frame.img, t => {
    tex = t; aspect = t.image.width / t.image.height; mat.map = t; mat.alphaMap = makeMask(); mat.color.set(0xffffff); mat.needsUpdate = true; env.relayout(); env.dirty();
  });
  return {
    group,
    setAlpha(a) { mat.opacity = a; group.visible = a > .002 },
    layout(box) {
      const bw = box.w * fill, bh = box.h * fill;
      let w = bw, h = w / aspect; if (h > bh) { h = bh; w = h * aspect }
      mesh.scale.set(w, h, 1); return { w, h };
    },
    dispose() { mesh.geometry.dispose(); mat.dispose(); if (tex) tex.dispose(); if (mask) mask.dispose() }
  };
};

/* the earlier hard-edged frame */
export function photo(THREE, frame, env) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x14161b, transparent: true, depthWrite: false, opacity: 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); group.add(mesh);
  const edge = unitSquare(THREE, EDGE, 0); group.add(edge);
  let aspect = 3 / 4, tex = null;
  loadTex(THREE, frame.img, t => { tex = t; mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true; aspect = t.image.width / t.image.height; env.relayout(); env.dirty() });
  return {
    group,
    setAlpha(a) { mat.opacity = a; edge.material.opacity = a * .35; group.visible = a > .002 },
    layout(box) { let w = box.w, h = w / aspect; if (h > box.h) { h = box.h; w = h * aspect } mesh.scale.set(w, h, 1); edge.scale.set(w, h, 1); return { w, h } },
    dispose() { mesh.geometry.dispose(); mat.dispose(); if (tex) tex.dispose() }
  };
}

/* the shop slot: an empty frame. No price, no button, no link. */
export function emptySlot(THREE, frame, env) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x0d0f13, transparent: true, depthWrite: false, opacity: 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); group.add(mesh);
  const edge = unitSquare(THREE, EDGE, 0); group.add(edge);
  return {
    group,
    setAlpha(a) { mat.opacity = a * .6; edge.material.opacity = a * .4; group.visible = a > .002 },
    layout(box) { let h = box.h, w = h * .75; if (w > box.w) { w = box.w; h = w / .75 } mesh.scale.set(w, h, 1); edge.scale.set(w, h, 1); return { w, h } },
    dispose() { mesh.geometry.dispose(); mat.dispose() }
  };
}

export const PRESENTERS = {
  whole: cutout,
  surface: soft({ fill: 1.04, feather: .15 }),
  making: soft({ fill: .97, feather: .13 }),
  use: soft({ fill: .97, feather: .13 }),
  shop: emptySlot
};
