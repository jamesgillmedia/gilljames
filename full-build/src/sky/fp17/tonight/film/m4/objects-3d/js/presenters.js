/* Per-layer presentation. SWAP POINT: each layer key maps to one presenter. Replace an entry (or add a new presenter)
 to change how a layer looks without touching nav, view, moves or transitions.

 A presenter is (THREE, frame, env) -> { group, setAlpha(a), layout(box) -> {w, h}, dispose }
 frame : one entry from data.js (img, stem, cap, crop, focus, slot)
 env : { dirty } call when something visual changed (a texture arrived)
 box : { w, h } in world units: the room the frame may fill at the stop.
 layout returns the world size it actually used (the view uses it for the drift of the dolly). */

const EDGE = 0x8e98aa;

function unitSquare(THREE, color, opacity) {
  const pts = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(p => new THREE.Vector3(p[0], p[1], .001));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), m);
}

/* one clean photograph on the dark ground, with a hairline edge */
export function photo(THREE, frame, env) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x14161b, transparent: true, depthWrite: false, opacity: 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); group.add(mesh);
  const edge = unitSquare(THREE, EDGE, .0); group.add(edge);
  let aspect = 3 / 4, alpha = 0, tex = null;
  new THREE.TextureLoader().load(frame.img, t => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; tex = t; mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true;
    aspect = t.image.width / t.image.height; if (env.relayout) env.relayout(); env.dirty();
  });
  return {
    group,
    setAlpha(a) { alpha = a; mat.opacity = a; edge.material.opacity = a * .35; group.visible = a > .002 },
    layout(box) {
      let w = box.w, h = w / aspect; if (h > box.h) { h = box.h; w = h * aspect }
      mesh.scale.set(w, h, 1); edge.scale.set(w, h, 1); return { w, h };
    },
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
    setAlpha(a) { mat.opacity = a; edge.material.opacity = a * .5; group.visible = a > .002 },
    layout(box) { let h = box.h, w = h * .75; if (w > box.w) { w = box.w; h = w / .75 } mesh.scale.set(w, h, 1); edge.scale.set(w, h, 1); return { w, h } },
    dispose() { mesh.geometry.dispose(); mat.dispose() }
  };
}

export const PRESENTERS = { whole: photo, surface: photo, making: photo, use: photo, shop: emptySlot };
