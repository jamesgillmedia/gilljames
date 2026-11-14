/* A tiny reader for the one GLB this page uses (indexed triangles, POSITION + TEXCOORD_0, one embedded JPEG base colour). */
export async function loadGLB(THREE, url) {
  const buf = await (await fetch(url)).arrayBuffer(), dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('not a glb');
  const jl = dv.getUint32(12, true), J = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
  const bin = 20 + jl + 8;
  const view = (i) => { const v = J.bufferViews[i]; return { off: bin + (v.byteOffset || 0), len: v.byteLength } };
  const acc = (i) => { const a = J.accessors[i], v = view(a.bufferView), n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type] * a.count, o = v.off + (a.byteOffset || 0);
    const T = { 5126: Float32Array, 5123: Uint16Array, 5125: Uint32Array }[a.componentType]; return new T(buf.slice(o, o + n * T.BYTES_PER_ELEMENT)) };
  const pr = J.meshes[0].primitives[0], g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(acc(pr.attributes.POSITION), 3));
  if (pr.attributes.TEXCOORD_0 != null) g.setAttribute('uv', new THREE.BufferAttribute(acc(pr.attributes.TEXCOORD_0), 2));
  g.setIndex(new THREE.BufferAttribute(acc(pr.indices), 1)); g.computeVertexNormals(); g.computeBoundingBox();
  let map = null;
  const img = J.images && J.images[0];
  if (img && img.bufferView != null) {
    const v = view(img.bufferView), blob = new Blob([new Uint8Array(buf, v.off, v.len)], { type: img.mimeType || 'image/jpeg' });
    const bmp = await createImageBitmap(blob, { imageOrientation: 'none' });
    map = new THREE.Texture(bmp); map.flipY = false; map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; map.needsUpdate = true;
  }
  return { geometry: g, map };
}
