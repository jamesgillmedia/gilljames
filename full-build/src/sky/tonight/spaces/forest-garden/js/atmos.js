/* Spaces · atmosphere + Red (spaces-1113). Shared by forest-garden and fable-m4/versions/se-a.
 - Fog that drifts and light shafts that breathe through the fibre column (Sketch Artist's calibre target, Nov 12).
 - Red (Gill's pick): photographs and renders keep TRUE colour; the plan drawings and the fibre ends glow red; lines, light
   and structure map to the same red ink as the rest of the site (crimson-rose 255,68,87); black stays black.
 - Variants (dev only, GJ_VARIANT): A = drifting fog banks + breathing shafts (default) · B = low ground mist (denser, lies
   flat over the garden and the water) · C = as A, but Red lights the plan drawings as a full red-ink wash instead of linework.
 - Reduce Motion: the clock is frozen, so fog and shafts hold still at their mean; every end state is the same.
 Nothing auto-advances; the camera still moves only with the viewer. */
export const RM = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) { return false } })();
const INK = [255 / 255, 68 / 255, 87 / 255];
/* Textures painted pixel by pixel (ImageData): the theme layer recolours canvas gradients while Red is on, and these masks must stay neutral. */
export function blobTex(THREE, w, h, blobs) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), im = x.createImageData(w, h), d = im.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (const B of blobs) { const dd = Math.hypot(i + .5 - B.x, j + .5 - B.y) / B.r; if (dd >= 1) continue;
      const S = B.s; let k = 1; while (k < S.length - 1 && dd > S[k][0]) k++; const p = S[k - 1], q = S[k], u = Math.max(0, Math.min(1, (dd - p[0]) / Math.max(1e-6, q[0] - p[0])));
      const cr = p[1] + (q[1] - p[1]) * u, cg = p[2] + (q[2] - p[2]) * u, cb = p[3] + (q[3] - p[3]) * u, ca = p[4] + (q[4] - p[4]) * u;
      r = cr * ca + r * (1 - ca); g = cg * ca + g * (1 - ca); b = cb * ca + b * (1 - ca); a = ca + a * (1 - ca) }
    const o = (j * w + i) * 4; d[o + 3] = Math.round(a * 255);
    if (a > 0) { d[o] = Math.min(255, r / a); d[o + 1] = Math.min(255, g / a); d[o + 2] = Math.min(255, b / a) } }
  x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t }
export function glowTex(THREE) { return blobTex(THREE, 128, 128, [{ x: 64, y: 64, r: 64, s: [[0, 255, 255, 255, 1], [.25, 255, 255, 255, .35], [1, 255, 255, 255, 0]] }]) }
export function poolTex(THREE) { return blobTex(THREE, 256, 256, [{ x: 128, y: 128, r: 128, s: [[0, 255, 248, 226, 1], [.18, 255, 236, 190, .85], [.45, 255, 214, 150, .28], [1, 255, 214, 150, 0]] }]) }
export function cloudTex(THREE) { const bl = []; for (let i = 0; i < 7; i++) { const r = 28 + Math.random() * 36; bl.push({ x: 40 + Math.random() * 176, y: 40 + Math.random() * 48, r, s: [[0, 255, 255, 255, .55], [1, 255, 255, 255, 0]] }) } return blobTex(THREE, 256, 128, bl) }
const PLAN = /p07-plan-dial|p15-whorl-top|p17-side-view|p15-side2/;
const NOISE = `float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}`;
export function mountAtmos(THREE, scene, root, o) {
  o = o || {}; const FTOP = .3, FBOT = -34.6, FLOOR = -38;
  const T0 = 37.0; /* the frozen clock for Reduce Motion (a mid-breath pose) */
  const AU = { uT: { value: T0 }, uRed: { value: 0 }, uInk: { value: new THREE.Vector3(...INK) } };
  const grp = new THREE.Group(); grp.userData.atmos = 1; scene.add(grp);
  /* ---- fog: soft fbm banks, camera-facing (A, C) or lying flat (B) ---- */
  const fogM = (seed, a, flat) => new THREE.ShaderMaterial({ uniforms: { ...AU, uA: { value: a }, uS: { value: seed }, uFlat: { value: flat ? 1 : 0 } }, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float uT,uA,uS,uFlat;varying vec2 vU;${NOISE}
      void main(){vec2 c=vU-.5;float m=smoothstep(.5,.12,length(c));vec2 q=vU*2.6+vec2(uS*7.3,uS*3.1);
        q+=vec2(uT*.018,uT*.007)*(uFlat>.5?1.4:1.);float n=fbm(q+vec2(fbm(q*1.7+uT*.01),0.)*.8);float a=m*smoothstep(.3,.78,n)*uA;
        vec3 col=vec3(.80,.80,.82);gl_FragColor=vec4(col*a,1.);}` });
  const banks = [];
  function addBank(x, y, z, s, a, seed, flat, where) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fogM(seed, a, flat)); m.position.set(x, y, z); m.scale.set(s, s * (flat ? 1 : .62), 1);
    if (flat) m.rotation.x = -Math.PI / 2; m.renderOrder = 6; m.userData = { flat, where, base: m.position.clone(), seed }; grp.add(m); banks.push(m); return m }
  const rnd = (() => { let a = 11; return () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646 } })();
  function buildFog(v) {
    banks.forEach(m => { grp.remove(m); m.geometry.dispose(); m.material.dispose() }); banks.length = 0;
    if (v === 'B') { /* low ground mist: flat layers over the garden floor and the water */
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + rnd() * .5, r = 3 + rnd() * 13; addBank(Math.cos(a) * r, FLOOR + 3.4 + rnd() * 2.2, Math.sin(a) * r, 16 + rnd() * 10, .16, rnd() * 10, 1, 'under') }
      for (let i = 0; i < 5; i++) { const a = rnd() * 6.283, r = 3 + rnd() * 8; addBank(Math.cos(a) * r, -10 - rnd() * 20, Math.sin(a) * r, 12 + rnd() * 6, .055, rnd() * 10, 0, 'under') }
      for (let i = 0; i < 7; i++) { const a = rnd() * 6.283, r = 10 + rnd() * 26; addBank(Math.cos(a) * r, .35 + rnd() * .5, Math.sin(a) * r, 26 + rnd() * 16, .09, rnd() * 10, 1, 'above') }
    } else { /* drifting banks around the column, from the ceiling down to the garden; a thin veil over the water */
      for (let i = 0; i < 11; i++) { const a = i / 11 * 6.283 + rnd() * .4, r = 4.5 + rnd() * 9, y = -4 - rnd() * 30; addBank(Math.cos(a) * r, y, Math.sin(a) * r, 16 + rnd() * 11, .085, rnd() * 10, 0, 'under') }
      for (let i = 0; i < 5; i++) { const a = rnd() * 6.283, r = 12 + rnd() * 24; addBank(Math.cos(a) * r, 1.4 + rnd() * 1.5, Math.sin(a) * r, 26 + rnd() * 12, .05, rnd() * 10, 0, 'above') }
    } }
  /* ---- light shafts through the fibre column: thin open cones of light that breathe ---- */
  const shaftM = (ph, w) => new THREE.ShaderMaterial({ uniforms: { ...AU, uI: { value: 0 }, uF: { value: 0 }, uP: { value: ph }, uW: { value: w } }, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vY;varying vec3 vN;varying vec3 vV;varying vec2 vU;void main(){vY=uv.y;vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader: `uniform float uT,uI,uF,uP,uW;varying float vY;varying vec3 vN;varying vec3 vV;varying vec2 vU;${NOISE}
      void main(){float d=1.-vY;float lit=1.-smoothstep(uF-.02,uF+.02,d);float f=pow(abs(dot(vN,vV)),2.2);
        float br=.62+.38*sin(uT*uW+uP);float streak=.55+.45*fbm(vec2(vU.x*9.,d*2.-uT*.03+uP));
        float a=min(.2,uI*lit*f*br*streak*(.25+.75*d)*smoothstep(0.,.06,d));vec3 col=vec3(1.,.96,.86);gl_FragColor=vec4(col*a,1.);}` });
  const shafts = [];
  [[0, 0, .25, 1.2, .0, .55], [.9, .4, .2, .95, 1.7, .41], [-.7, .8, .3, 1.1, 3.1, .47], [.4, -1.0, .18, .8, 4.4, .36], [-1.1, -.5, .22, .9, 5.6, .5], [1.4, -.3, .15, .7, 2.2, .44]].forEach(([x, z, rt, rb, ph, w]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, FTOP - FBOT, 24, 1, true), shaftM(ph, w)); m.position.set(x, (FTOP + FBOT) / 2, z); m.renderOrder = 8; grp.add(m); shafts.push(m) });
  /* ---- Red: recolour the scene's own materials (never photographs or renders) ---- */
  const lumOf = c => .2126 * c.r + .7152 * c.g + .0722 * c.b;
  const tracked = new Set(); let red = false, wash = 0;
  const isPhotoMap = m => !!(m && m.map && m.map.image && m.map.image.src);
  const isPlanMap = m => !!(m && m.map && m.map.image && m.map.image.src && PLAN.test(m.map.image.src));
  const RU = { uRedR: AU.uRed, uInkR: AU.uInk, uWash: { value: 0 }, uLine: { value: 0 } };
  let lineOn = false;
  function syncLine() { RU.uLine.value = lineOn && !red ? 1 : 0 }
  /* A plan texture has two uses. On the whorl face it is part of the sculpture: Night leaves it alone, Red inks it.
     On a placed sheet (material.userData.sheet, set by spirit-eye's placeAll) Night adds a soft vignette into the mat and,
     with the dev "night line" row, redraws it with Red's own line finder (edges and dark fills) in warm white on the mat colour.
     Red is the same on both.
     Colours here are linear (the map is sampled linear): #04070b and #e8e4dc. */
  function injectPlan(m) { if (m.userData.planInj) return; m.userData.planInj = 1;
    const img = m.map.image, tx = new THREE.Vector2(1.3 / (img.width || 1024), 1.3 / (img.height || 1024)), sheet = { value: m.userData.sheet ? 1 : 0 };
    m.onBeforeCompile = sh => { sh.uniforms.uRedR = RU.uRedR; sh.uniforms.uInkR = RU.uInkR; sh.uniforms.uWash = RU.uWash; sh.uniforms.uLine = RU.uLine; sh.uniforms.uSheet = sheet; sh.uniforms.uTx = { value: tx };
      sh.fragmentShader = 'uniform float uRedR,uWash,uLine,uSheet;uniform vec3 uInkR;uniform vec2 uTx;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
#ifdef USE_MAP
bool nl=uRedR<=0.&&uSheet>.5&&uLine>.5;vec3 MAT=vec3(.00121,.00212,.00334);
if(uRedR>0.||nl){vec3 W=vec3(.2126,.7152,.0722);float l0=dot(diffuseColor.rgb,W);
 float gx=dot(texture2D(map,vMapUv+vec2(uTx.x,0.)).rgb-texture2D(map,vMapUv-vec2(uTx.x,0.)).rgb,W);
 float gy=dot(texture2D(map,vMapUv+vec2(0.,uTx.y)).rgb-texture2D(map,vMapUv-vec2(0.,uTx.y)).rgb,W);
 float e=smoothstep(.07,.24,length(vec2(gx,gy)));float dk=(1.-smoothstep(.12,.42,l0))*.55;float k=max(e,dk);
 if(nl)diffuseColor.rgb=mix(MAT,vec3(.807,.776,.716),clamp(max(e,dk*.5)*1.05,0.,1.));
 else{vec3 lineC=uInkR*(k*1.2+l0*.07);vec3 washC=uInkR*pow(l0,1.15)*.95;
 diffuseColor.rgb=mix(diffuseColor.rgb,mix(lineC,washC,uWash),uRedR);}}
if(uRedR<=0.&&uSheet>.5){float vig=1.-smoothstep(.7,1.5,length((vMapUv-.5)*2.));diffuseColor.rgb=mix(MAT,diffuseColor.rgb,mix(.5,1.,vig));}
#endif`) };
    m.customProgramCacheKey = () => 'spaces-plan-v5'; m.needsUpdate = true }
  /* spirit-eye hands a placed drawing over the moment its texture lands, so it never shows un-inked for a frame */
  function adopt(m) { if (isPlanMap(m)) injectPlan(m) }
  function injectShader(m) { if (m.userData.redInj || !m.fragmentShader) return; m.userData.redInj = 1; const lift = m.userData.redLift || 1.25;
    m.uniforms.uRedR = AU.uRed; m.uniforms.uInkR = AU.uInk;
    const fs = m.fragmentShader, i = fs.lastIndexOf('}');
    m.fragmentShader = 'uniform float uRedR;uniform vec3 uInkR;\n' + fs.slice(0, i) + `gl_FragColor.rgb=mix(gl_FragColor.rgb,uInkR*min(1.,dot(gl_FragColor.rgb,vec3(.2126,.7152,.0722))*${lift.toFixed(2)}),uRedR);` + fs.slice(i); m.needsUpdate = true }
  function scan() { scene.traverse(obj => { if (obj.userData && obj.userData.keepTrue) return; let p = obj.parent; while (p) { if (p.userData && p.userData.atmos) return; p = p.parent }
    if (obj.isInstancedMesh) return; const ms = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
    ms.forEach(m => {
      if (m.userData && m.userData.redEnds && m.uniforms) { if (m.uniforms.uRed) m.uniforms.uRed = AU.uRed; if (m.uniforms.uInk) m.uniforms.uInk = AU.uInk }
      if (m.isShaderMaterial) return;
      if (isPlanMap(m)) { injectPlan(m); return } if (isPhotoMap(m)) return;
      if (m.userData.redEnd && m.color && !m.userData.redT) { m.userData.redT = { c0: m.color.clone(), set: null, lift: m.userData.redLift || 1.6 }; tracked.add(m) } }) }) }
  const tmp = new THREE.Color();
  function tick() { tracked.forEach(m => { const T = m.userData.redT; if (isPhotoMap(m)) { tracked.delete(m); return } /* a photo or drawing arrived: its loader set the colour */
      if (T.set && !m.color.equals(T.set)) T.c0.copy(m.color); /* someone else (day-night, water lerp) wrote a new colour */
      if (red) { const L = Math.min(1, lumOf(T.c0) * T.lift); tmp.setRGB(INK[0] * L, INK[1] * L, INK[2] * L); m.color.copy(tmp); T.set = tmp.clone() }
      else if (T.set) { m.color.copy(T.c0); T.set = null } }) }
  let scanAt = 0, variant = 'A';
  function setLine(on) { lineOn = !!on; syncLine() }
  function setRed(on) { red = !!on; AU.uRed.value = red ? 1 : 0; syncLine(); scan(); tick();
    if (!red && o.repaint) o.repaint() }
  function setVariant(v) { variant = /^[ABC]$/.test(v) ? v : 'A'; RU.uWash.value = variant === 'C' ? 1 : 0; buildFog(variant) }
  buildFog('A');
  function update(now, cam, F) {
    const t = RM ? T0 : now / 1000; AU.uT.value = t;
    const under = cam.position.y < .4;
    banks.forEach(m => { const vis = m.userData.where === 'under' ? under : !under; m.visible = vis; if (!vis) return;
      if (!m.userData.flat) m.quaternion.copy(cam.quaternion);
      const sw = RM ? 0 : Math.sin(t * .05 + m.userData.seed) * 1.2; m.position.x = m.userData.base.x + sw; m.position.z = m.userData.base.z + (RM ? 0 : Math.cos(t * .04 + m.userData.seed) * .9);
      const dc = cam.position.distanceTo(m.position); m.material.uniforms.uA.value = (m.userData.flat ? (variant === 'B' ? .3 : .2) : (m.userData.where === 'under' ? (variant === 'B' ? .12 : .32) : .14)) * Math.min(1, Math.max(0, (dc - 2.5) / 6)) * (red ? 1.1 : 1) });
    const dxz = Math.hypot(cam.position.x, cam.position.z), near = Math.min(1, Math.max(.15, (dxz - 1.2) / 6));
    shafts.forEach(m => { m.visible = F > .01; m.material.uniforms.uF.value = F; m.material.uniforms.uI.value = (.04 + .06 * F) * near });
    if (now - scanAt > 1000) { scanAt = now; scan() } tick();
  }
  return { update, setRed, setLine, adopt, setVariant, get variant() { return variant }, get red() { return red }, banks, shafts }
}
