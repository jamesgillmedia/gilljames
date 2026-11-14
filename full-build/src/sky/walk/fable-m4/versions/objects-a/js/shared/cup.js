/* Mesh cup loader (no GLTFLoader needed). Parses shared cup/joio-cup.glb: one primitive, uint16 indices, POSITION + TEXCOORD_0, JPEG base colour.
   Source: /workspace/mesh2/lathe/joio_lathe_from_photos.glb (photo-measured lathe from IMG_5882/5850 profile + texture; back half mirrored,
   underside not photographed). Units are metres: rim ~8 cm wide, ~5.7 cm tall, base at y=0.
   Usage: const mesh = await loadCup(THREE, new URL('../cup/joio-cup.glb', import.meta.url)); scene.add(mesh); */
export async function loadCup(THREE, url, opts = {}) {
  const buf = await (await fetch(url)).arrayBuffer(), dv = new DataView(buf);
  if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('not a glb');
  const jl = dv.getUint32(12, true), J = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl)));
  const bin = 20 + jl + 8, V = i => { const v = J.bufferViews[i]; return [bin + (v.byteOffset || 0), v.byteLength] };
  const A = J.accessors, P = J.meshes[0].primitives[0];
  const arr = (a, T, n) => { const [o, l] = V(a.bufferView); return new T(buf.slice(o, o + l), 0, a.count * n) };
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arr(A[P.attributes.POSITION], Float32Array, 3), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(arr(A[P.attributes.TEXCOORD_0], Float32Array, 2), 2));
  g.setIndex(new THREE.BufferAttribute(arr(A[P.indices], A[P.indices].componentType === 5123 ? Uint16Array : Uint32Array, 1), 1));
  g.computeVertexNormals();
  const [io, il] = V(J.images[0].bufferView);
  const bmp = await createImageBitmap(new Blob([new Uint8Array(buf, io, il)], { type: J.images[0].mimeType }));
  const tex = new THREE.Texture(bmp); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
  const mat = opts.material || new THREE.MeshStandardMaterial({ map: tex, roughness: .82, metalness: 0 });
  if (opts.material && !mat.map) { mat.map = tex; mat.needsUpdate = true }
  const m = new THREE.Mesh(g, mat); m.name = 'joio cup'; m.castShadow = m.receiveShadow = !!opts.shadows;
  return m;
}
