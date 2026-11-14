/* Spirit Eye of skwácháýs · se3 · rebuilt on v2 ("save 2, Spirit Eye anchor"): same whorl on the water,
 same eased glide between stops (cubic-bezier .22,1,.36,1), same layered drawings in depth, same column of light.
 New in se3: every stop has one job. TELL = a calm reading page (words verbatim from the PDF, set by parts/reading).
 SHOW = the eye in 3D. The light journey is staged as one spatial sequence the viewer drags through:
 the sun's ray reaches the sky lens -> the light runs in, down the fibre optics -> under, through the column
 -> it lands, and the garden lights up -> the plants of the garden, page by page (PDF p.21-23).
 The light front is a position of the drag (not a loop), so Reduce Motion changes nothing.
 Callout words are the PDF's own labels (p.15 MATERIALS; p.21-23 plant labels). Nothing auto-advances. */
const BASE = new URL('../', import.meta.url).href;
const IMG = n => BASE + 'media/' + n + '.webp';
/* ---------- the stops ---------- */
const PL = (f, t) => ({ f: 's3/pl-' + f, t });
export const STOPS = [
  { k: 'open', tell: 0, nm: 'spirit eye' },
  { k: 'land', tell: 1, nm: 'land acknowledgement' },
  { k: 'statement', tell: 2, nm: 'artist statement' },
  { k: 'description', tell: 3, nm: 'description' },
  { k: 'water', show: 1, nm: 'on the water' },
  { k: 'site', tell: 5, nm: 'site significance' },
  { k: 'lens', show: 1, nm: 'light in', co: [
      { at: [0, .75, 0], dx: -.34, dy: -.30, b: 'sky lens', s: 'composite glass fresnel prismatic lens & ground glass projection plate' },
      { at: [6.0, .62, 0], dx: .14, dy: .24, b: 'protecting structure & whorl housing', s: 'concrete aggregate with steel reinforcements' }] },
  { k: 'in', show: 1, nm: 'in', co: [{ at: 'front', dx: .2, dy: .05, b: 'fiber optic cables' }] },
  { k: 'under', show: 1, nm: 'under' },
  { k: 'garden', show: 1, nm: 'into the garden', co: [{ at: [-4.5, -34.8, 3.5], dx: -.12, dy: -.3, b: 'adaptive forest garden installation (underground)' }] },
  { k: 'ecosystem', tell: 10, nm: 'ecosystem interactions' },
  { k: 'trees', show: 1, nm: 'the garden · p.23', cards: [PL('red-cedar', 'red cedar - clothing, art, building, ceremony'), PL('red-alder', 'red alder- dye, tools'), PL('yew', 'yew tree- tool handles'), PL('cottonwood', 'cottonwood- medicinal, ceremonial'),
      PL('fir', 'fir tree- medicinal (bark, needles)'), PL('oregon-grape', 'oregon grape- culinary, medicina'), PL('wild-ginger', 'wild ginger- culinary, medicinal'), PL('salmon-berry', 'salmon berry- culinary, medicinal, fibre')] },
  { k: 'plants1', show: 1, nm: 'the garden · p.21', cards: [PL('indigo', 'Indigo - as a source of dye'), PL('hibiscus', 'hibiscus - culinary, medicinal, cosmetic'), PL('camas', 'common camas- medicinal,'), PL('mullein', 'mullein - medicinal'),
      PL('kinnikinnick', 'kinnikinnnick- medicinal, cullinary'), PL('sweetgrass', 'sweetgrass- ceremonial'), PL('rice', 'rice- culinary'), PL('swamp-lanterns', 'swamp lanterns- culinary, medicinal')] },
  { k: 'plants2', show: 1, nm: 'the garden · p.22', cards: [PL('cattails', 'cattails - culinary, medicinal, art'), PL('cotton', 'cotton- clothing, materials'), PL('nettle', 'stinging nettle- medicinal, culinary, rope, cloth'), PL('devils-club', 'devils club- medicinal'),
      PL('taro', 'taro- culinary'), PL('yam', 'yam- culinary'), PL('elderberry', 'elderberry-  medicinal'), PL('plantain', 'plantain- culinary, medicinal, fibre')] },
  { k: 'community', tell: 14, nm: 'community value' },
  { k: 'gallery', gal: 1, nm: 'sketches · p.26–32' }
];
const NS = STOPS.length;
/* PDF drawings placed in depth relative to a stop's camera: [file, depth, right, up, width] (v2's method) */
const PLACE = {
  water: [['s2/p12-scene3', 13, -3.2, 2.6, 6.2], ['s2/p13-view2', 21, 4.4, 3.4, 7.2], ['s2/p09-scene4', 30, -1.5, 6.2, 10]],
  lens: [['s2/p15-whorl-top', 15, -7.5, 3.6, 5.2]],
  under: [['s2/p17-side-view', 13, -5.6, 2.8, 6.2], ['s2/p15-side2', 19, 6.4, 4.2, 7, 1]],
  garden: [['s3/p20-wetland', 25, 8.5, 4.5, 10], ['s3/p19-forest', 29, -10, 6, 7, 1]]
};
/* light front along the journey: 0 = at the lens, 1 = in the garden (piecewise in stop units) */
const KF = [[0, 0], [5, 0], [6, .04], [7, .34], [8, .64], [9, 1], [NS - 1, 1], [NS, 0]];
const KR = [[0, 0], [4.6, 0], [5.9, 1], [NS - 1, 1], [NS, 0]]; /* the sun's ray reaching the lens */
const pw = (K, x) => { for (let i = 1; i < K.length; i++) if (x <= K[i][0]) { const a = K[i - 1], b = K[i], u = (x - a[0]) / Math.max(1e-6, b[0] - a[0]); return a[1] + (b[1] - a[1]) * u } return K[K.length - 1][1] };
const EASE = bez(0.22, 1, 0.36, 1), T_GLIDE = 700, T_BACK = 300, T_ENTER = 1200;
function bez(x1, y1, x2, y2) {
  const cb = (t, a, b) => 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t, dcb = (t, a, b) => 3 * a * (1 - t) * (1 - t) + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = cb(t, x1, x2) - x, s = dcb(t, x1, x2); if (Math.abs(d) < 1e-5 || !s) break; t -= d / s } return cb(Math.max(0, Math.min(1, t)), y1, y2) };
}
const mod = (a, n) => ((a % n) + n) % n;
const LENS_Y = .6, FTOP = .3, FBOT = -34.6, FLOOR = -38, MOUND_H = 3.2, MOUND_R = 17;
const moundY = r => FLOOR + MOUND_H * Math.sqrt(Math.max(0, 1 - (r / MOUND_R) ** 2));
export function mount(THREE, scene, ctx) {
  const SW = () => ctx.size ? ctx.size()[0] : innerWidth, SH = () => ctx.size ? ctx.size()[1] : innerHeight, FREE = !!ctx.free;
  if (ctx.place) Object.assign(PLACE, ctx.place);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const g = new THREE.Group(); scene.add(g);
  const LOADER = new THREE.TextureLoader();
  const tex = (f, cb) => LOADER.load(IMG(f), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (cb) cb(t) });
  /* ---------- camera path ---------- [pos, look, stop or -1, whorl-relative (pushed back on narrow screens)] */
  const PATH = [
    [V(0, 13, 7.5), V(0, .6, 0), 0, 1],
    [V(-9, 3.2, 9), V(0, 1.2, -3), 1, 1],
    [V(-2, 7.5, 14), V(0, .6, 0), 2, 1],
    [V(12, 6, -10), V(0, 1.2, 0), 3, 1],
    [V(15, 1.3, 13), V(-6, 1.5, -12), 4, 1],
    [V(-14, 2.6, 6), V(0, 1, 0), 5, 1],
    [V(7, 7.5, 9.5), V(0, .2, 0), 6, 1],
    [V(.9, 3.0, 1.5), V(0, -11, -.2), 7, 0],
    [V(10.5, -15, 11.5), V(0, -20.5, 0), 8, 0],
    [V(10, -27, 13), V(0, -33, 0), -1, 0],
    [V(15, -30.2, 17), V(0, -35.6, 0), 9, 0],
    [V(-11, -32.4, 13), V(0, -35, 0), 10, 0],
    [V(0, -32.9, -4.4), V(0, -33.4, -20), 11, 0],
    [V(4.4, -32.9, 0), V(20, -33.6, 0), 12, 0],
    [V(0, -32.9, 4.4), V(0, -33.6, 20), 13, 0],
    [V(1.4, -20, 1.8), V(0, 2, 0), -1, 0],
    [V(.5, 2.4, 2.2), V(0, 8, 9), -1, 0],
    [V(0, 11, 34), V(0, .6, 0), 14, 1],
    [V(0, 22, 48), V(0, .6, 0), 15, 1]
  ];
  let K = 1, P = [];
  function layoutPath(aspect) {
    K = Math.max(1, Math.min(1.9, 1 / (aspect * 1.25)));
    P = PATH.map(([p, l, s, rel]) => ({ p: rel ? l.clone().add(p.clone().sub(l).multiplyScalar(K)) : p.clone(), l: l.clone(), s: s }));
  }
  const SIDX = []; PATH.forEach((q, i) => { if (q[2] >= 0) SIDX[q[2]] = i });
  function pathU(s) { const i = Math.floor(s), f = s - i, a = SIDX[mod(i, NS)], b0 = SIDX[mod(i + 1, NS)], b = b0 <= a ? b0 + P.length : b0; return a + f * (b - a) }
  function cr(p0, p1, p2, p3, t, out) { const t2 = t * t, t3 = t2 * t; return out.set(
    .5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    .5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    .5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)) }
  function poseAt(s, pos, look) { const u = pathU(s), i = Math.floor(u), t = u - i, n = P.length, q = j => P[mod(j, n)];
    cr(q(i - 1).p, q(i).p, q(i + 1).p, q(i + 2).p, t, pos); cr(q(i - 1).l, q(i).l, q(i + 1).l, q(i + 2).l, t, look) }
  /* ---------- above: water, whorl, sun (v2) ---------- */
  const water = new THREE.Mesh(new THREE.RingGeometry(6.68, 70, 96, 1), new THREE.MeshBasicMaterial({ color: 0x0b1d28, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: true }));
  water.rotation.x = -Math.PI / 2; water.renderOrder = 1; g.add(water);
  const whorl = new THREE.Group(); g.add(whorl);
  const housing = new THREE.Mesh(new THREE.RingGeometry(5.35, 6.7, 96), new THREE.MeshBasicMaterial({ color: 0xa8bcc4, transparent: true, opacity: .92, side: THREE.DoubleSide, depthWrite: false }));
  housing.rotation.x = -Math.PI / 2; housing.position.y = LENS_Y + .02; housing.renderOrder = 3; whorl.add(housing);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(6.7, 6.7, .9, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0x5d6d74, transparent: true, opacity: .75, side: THREE.DoubleSide, depthWrite: false }));
  wall.position.y = .17; whorl.add(wall);
  const faceM = new THREE.MeshBasicMaterial({ color: 0x223040, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false });
  const face = new THREE.Mesh(new THREE.CircleGeometry(5.36, 96), faceM); face.rotation.x = -Math.PI / 2; face.position.y = LENS_Y; face.renderOrder = 2; whorl.add(face);
  tex('s2/p07-plan-dial', t => { faceM.map = t; faceM.color.set(0xffffff); faceM.needsUpdate = true });
  const ang = s => Math.PI / 2 - s / NS * 6.283;
  const tickPts = []; for (let i = 0; i < NS; i++) { const a = ang(i), r0 = 6.75, r1 = STOPS[i].show ? 7.7 : 7.35; tickPts.push(V(Math.cos(a) * r0, .64, -Math.sin(a) * r0), V(Math.cos(a) * r1, .64, -Math.sin(a) * r1)) }
  whorl.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPts), new THREE.LineBasicMaterial({ color: 0xe6eef2, transparent: true, opacity: .6, depthWrite: false })));
  const glowS = (c, o, sc) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctx.glowTex, color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.scale.set(sc, sc, 1); return m };
  const sun = glowS(0xffd58a, 1, 2.6); sun.renderOrder = 6; whorl.add(sun);
  const sunCore = glowS(0xffffff, 1, .8); sunCore.renderOrder = 7; whorl.add(sunCore);
  /* the sky sun and its ray down to the lens (new): the ray grows with the drag, KR */
  const skySun = glowS(0xfff0c8, 1, 9); skySun.renderOrder = 6; g.add(skySun);
  const skyCore = glowS(0xffffff, 1, 2.4); g.add(skyCore);
  const rayU = { uR: { value: 0 }, uI: { value: 1 } };
  const ray = new THREE.Mesh(new THREE.CylinderGeometry(.06, 1.1, 1, 24, 32, true).translate(0, -.5, 0), new THREE.ShaderMaterial({ uniforms: rayU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=-position.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform float uR,uI;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float f=pow(abs(dot(vN,vV)),1.4);float lit=1.-smoothstep(uR-.03,uR,vY);float head=exp(-abs(vY-uR)*40.)*step(.02,uR)*(1.-step(.995,uR));float a=uI*f*(lit*(.35+.4*vY)+head*1.6);gl_FragColor=vec4(vec3(1.,.93,.75)*a,1.);}' }));
  ray.renderOrder = 8; g.add(ray);
  const lensGlow = glowS(0xfff0cc, 0, 7); lensGlow.position.y = LENS_Y + .1; lensGlow.renderOrder = 9; g.add(lensGlow);
  /* ---------- under: the cavern, the column, the fibre optics, the beam (v2, deepened) ---------- */
  const under = new THREE.Group(); g.add(under);
  const caveM = new THREE.ShaderMaterial({ uniforms: { uL: { value: 0 } }, side: THREE.BackSide, vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform float uL;varying vec3 vP;void main(){float y=(vP.y+22.)/44.;vec3 top=vec3(.035,.04,.045),bot=vec3(.05,.045,.03);vec3 c=mix(bot,top,y);float band=.012*step(.5,fract(y*9.));c+=band;c+=uL*vec3(.10,.085,.05)*smoothstep(.55,0.,y);gl_FragColor=vec4(c,1.);}' });
  const cave = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 44, 64, 1, true), caveM); cave.position.y = -22; under.add(cave);
  const floorM = new THREE.MeshBasicMaterial({ color: 0x0b0d09 }); const floor = new THREE.Mesh(new THREE.CircleGeometry(26, 64), floorM); floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; under.add(floor);
  const ceil = new THREE.Mesh(new THREE.RingGeometry(2.7, 26, 64), new THREE.MeshBasicMaterial({ color: 0x0a1418, side: THREE.DoubleSide })); ceil.rotation.x = -Math.PI / 2; ceil.position.y = -.05; under.add(ceil);
  /* the mound (PDF p.17 side view): the garden rises toward the column */
  const moundG = new THREE.SphereGeometry(1, 64, 16, 0, 6.283, 0, Math.PI / 2); const moundM = new THREE.MeshBasicMaterial({ color: 0x2a1f15 });
  const mound = new THREE.Mesh(moundG, moundM); mound.scale.set(MOUND_R, MOUND_H, MOUND_R); mound.position.y = FLOOR; under.add(mound);
  const pathM = new THREE.MeshBasicMaterial({ color: 0x8b8a80, transparent: true, opacity: .5, depthWrite: false });
  { const pts = []; for (let j = 0; j <= 40; j++) { const r = 4.6 + j / 40 * 13, a = .6 + j / 40 * .5; pts.push(V(Math.cos(a) * r, moundY(r) + .04, Math.sin(a) * r)) }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .55, 4, false), pathM); under.add(tube) }
  const colM = new THREE.MeshBasicMaterial({ color: 0x9fb4bd, transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false });
  const column = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, -FBOT, 40, 1, true), colM); column.position.y = FBOT / 2; g.add(column);
  const hoops = []; for (let y = -3; y > FBOT; y -= 4) { const pts = []; for (let j = 0; j <= 64; j++) { const a = j / 64 * 6.283; pts.push(V(Math.cos(a) * 2.6, y, Math.sin(a) * 2.6)) } hoops.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xa8bcc4, transparent: true, opacity: .25, depthWrite: false }))) }
  hoops.forEach(h => g.add(h));
  /* fibre optics: 46 strands, each lit from the top down to the light front uF (a bright head marks where the light is) */
  const FN = 46, SEG = 48, fp = [], ft = [];
  for (let i = 0; i < FN; i++) { const a = i * 2.39996, r = .25 + Math.sqrt(i / FN) * 1.15, tw = (i % 5 - 2) * .05;
    for (let j = 0; j < SEG; j++) for (const k of [j, j + 1]) { const t = k / SEG, rr = r * (1 + .25 * t * t), aa = a + tw * t * 6; fp.push(Math.cos(aa) * rr, FTOP + (FBOT - FTOP) * t, Math.sin(aa) * rr); ft.push(t) } }
  const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); fgeo.setAttribute('aT', new THREE.Float32BufferAttribute(ft, 1));
  const FU = { uF: { value: 0 }, uB: { value: .06 } };
  const fibers = new THREE.LineSegments(fgeo, new THREE.ShaderMaterial({ uniforms: FU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float aT;varying float vT;void main(){vT=aT;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform float uF,uB;varying float vT;void main(){float lit=1.-smoothstep(uF-.004,uF+.004,vT);float head=exp(-abs(vT-uF)*55.)*step(.01,uF)*(1.-step(.999,uF));float a=uB+lit*(.42+.25*(1.-vT))+head*1.4;gl_FragColor=vec4(vec3(.85,.98,1.)*a,1.);}' }));
  fibers.renderOrder = 7; g.add(fibers);
  const head = glowS(0xfff4d8, 0, 4.2); head.renderOrder = 9; g.add(head);
  const UB = { uI: { value: 0 }, uF: { value: 0 } };
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 3.4, -FBOT + FTOP, 48, 24, true), new THREE.ShaderMaterial({ uniforms: UB, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform float uI,uF;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float d=1.-vY;float lit=1.-smoothstep(uF-.01,uF+.01,d);float f=abs(dot(vN,vV));float core=pow(f,1.6);float a=uI*lit*core*(.35+.65*d);gl_FragColor=vec4(vec3(1.,.95,.82)*a,1.);}' }));
  beam.position.y = (FTOP + FBOT) / 2; beam.renderOrder = 8; g.add(beam);
  /* the landing: a pool of light on the inner wetland at the top of the mound */
  const poolTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,248,226,1)'); gr.addColorStop(.18, 'rgba(255,236,190,.85)'); gr.addColorStop(.45, 'rgba(255,214,150,.28)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t })();
  const wet = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshBasicMaterial({ color: 0x123038 })); wet.rotation.x = -Math.PI / 2; wet.position.y = moundY(0) + .02; under.add(wet);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = moundY(0) + .06; pool.renderOrder = 9; g.add(pool);
  const ripples = []; if (0) for (const r of [1.6, 2.6, 3.6]) { const pts = []; for (let j = 0; j <= 80; j++) { const a = j / 80 * 6.283; pts.push(V(Math.cos(a) * r, moundY(0) + .08, Math.sin(a) * r)) } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xbfe8e0, transparent: true, opacity: 0, depthWrite: false })); under.add(l); ripples.push(l) }
  /* the layered garden (PDF p.17 words, as structure): large trees around the outside, an understory, the inner wetland */
  const rnd = (() => { let a = 7; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } })();
  const garden = []; const gm = new THREE.MeshBasicMaterial({ color: 0xffffff });
  function addInst(geo, list) { const m = new THREE.InstancedMesh(geo, gm.clone(), list.length), o = new THREE.Object3D(), c = new THREE.Color();
    list.forEach((q, i) => { o.position.set(q.x, q.y, q.z); o.scale.set(q.sx, q.sy, q.sx); o.rotation.y = q.ry || 0; o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.setRGB(0, 0, 0)) });
    m.userData.list = list; under.add(m); garden.push(m); return m }
  const cone = new THREE.ConeGeometry(1, 1, 7).translate(0, .5, 0), trunk = new THREE.CylinderGeometry(.12, .2, 1, 6).translate(0, .5, 0), blob = new THREE.IcosahedronGeometry(1, 0);
  const T1 = [], T2 = [], T3 = [], U1 = [], U2 = [];
  for (let i = 0; i < 46; i++) { const a = i / 46 * 6.283 + rnd() * .1, r = 19 + rnd() * 5, y = moundY(r), h = 9 + rnd() * 7, x = Math.cos(a) * r, z = Math.sin(a) * r, base = { r: r, col: [.08, .2, .12] };
    T3.push({ x, y, z, sx: 1, sy: h * .45, ...base, col: [.22, .14, .09] });
    if (i % 3 === 1) { T2.push({ x, y: y + h * .55, z, sx: 2.2 + rnd(), sy: 1.9 + rnd(), ry: rnd() * 6, ...base, col: [.18, .27, .12] }); T2.push({ x: x + .8, y: y + h * .75, z: z - .5, sx: 1.6 + rnd(), sy: 1.5, ry: rnd() * 6, ...base, col: [.16, .26, .11] }) } /* broadleaf crowns */
    else { T1.push({ x, y: y + h * .25, z, sx: 1.7 + rnd() * .8, sy: h * .8, ...base, col: [.07, .2, .13] }) } } /* conifers */
  for (let i = 0; i < 170; i++) { const a = rnd() * 6.283, r = 5.5 + rnd() * 12.5, y = moundY(r), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (i % 2) U1.push({ x, y: y - .1, z, sx: .5 + rnd() * .9, sy: .7 + rnd() * 1.5, r: r, col: [.12, .3, .14] }); else U2.push({ x, y: y + .2, z, sx: .4 + rnd() * .7, sy: .35 + rnd() * .5, ry: rnd() * 6, r: r, col: [.16, .34, .13] }) }
  addInst(trunk, T3); addInst(cone, T1); addInst(blob, T2); addInst(cone, U1); addInst(blob, U2);
  let lastGL = -1; const cc = new THREE.Color();
  function lightGarden(L) { if (Math.abs(L - lastGL) < .004) return; lastGL = L;
    garden.forEach(m => { m.userData.list.forEach((q, i) => { const k = .1 + 1.25 * L * Math.exp(-q.r / 15); m.setColorAt(i, cc.setRGB(q.col[0] * k, q.col[1] * k, q.col[2] * k)) }); m.instanceColor.needsUpdate = true });
    moundM.color.setRGB(.16 * (.25 + .9 * L), .11 * (.25 + .9 * L), .07 * (.25 + .9 * L)); caveM.uniforms.uL.value = L }
  /* motes in the column, held in place */
  const MN = 420, mp = new Float32Array(MN * 3); for (let i = 0; i < MN; i++) { const y = -Math.random() * 34, r = (1.2 + 2.1 * (-y / 34)) * Math.sqrt(Math.random()), a = Math.random() * 6.283; mp[i * 3] = Math.cos(a) * r; mp[i * 3 + 1] = y; mp[i * 3 + 2] = Math.sin(a) * r }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ map: ctx.glowTex, color: 0xfff4da, size: .12, transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending })); /* cut: motes */
  /* ---------- drawings and plant cards placed in depth, per stop ---------- */
  const planes = [], cards = [];
  const frame = (i, pos, look, fwd, right, up) => { poseAt(i, pos, look); fwd.copy(look).sub(pos).normalize(); right.crossVectors(fwd, Math.abs(fwd.y) > .97 ? V(0, 0, -1) : V(0, 1, 0)).normalize(); up.crossVectors(right, fwd).normalize() };
  const cardMat = () => new THREE.MeshBasicMaterial({ color: 0x1a2230, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  function placeAll(aspect) {
    [...planes, ...cards].forEach(m => { g.remove(m); m.geometry.dispose() }); planes.length = 0; cards.length = 0;
    const pos = V(0, 0, 0), look = V(0, 0, 0), fwd = V(0, 0, 0), right = V(0, 0, 0), up = V(0, 0, 0), sx = Math.min(1, aspect / 1.05);
    STOPS.forEach((st, i) => {
      (PLACE[st.k] || []).forEach(([f, d, x, y, w, wide]) => { if (wide && aspect < .8) return; frame(i, pos, look, fwd, right, up);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cardMat()); const yy = sx < 1 && x ? y + Math.sign(x) * w * .3 * (1 - sx) : y;
        m.position.copy(pos).addScaledVector(fwd, d).addScaledVector(right, x * sx).addScaledVector(up, yy); m.up.copy(up); m.lookAt(pos);
        m.userData = { stop: i, w: w * (sx < 1 ? .5 + .5 * sx : 1), base: m.position.clone(), fwd: fwd.clone(), d }; m.scale.set(m.userData.w, m.userData.w * .624, 1); m.renderOrder = 4; g.add(m); planes.push(m);
        tex(f, t => { m.material.map = t; m.material.color.set(0xffffff); m.material.needsUpdate = true; m.scale.y = m.userData.w * t.image.height / t.image.width }) });
      if (st.cards) { frame(i, pos, look, fwd, right, up);
        /* a layered wall of the page's plants in the garden: columns by screen shape, rows staggered in depth */
        const cols = aspect < .8 ? 2 : 4, rows = Math.ceil(st.cards.length / cols), tv = Math.tan(30 * Math.PI / 180), W = SW(), H = SH();
        const topPx = 74, botPx = 78, labPx = aspect < .8 ? 44 : 34, chPx = (H - topPx - botPx) / rows, cwPx = W * .94 / cols;
        st.cards.forEach((c, j) => { const col = j % cols, row = Math.floor(j / cols), d = 9 + (col % 2) * 1.2 + row * .8;
          const vh = 2 * d * tv, k = vh / H; /* world units per css px at this depth */
          const bw = cwPx * .86 * k, bh = Math.max(20, chPx - labPx - 8) * k;
          const xo = (col - (cols - 1) / 2) * cwPx * k, yo = (H / 2 - (topPx + chPx * row + (chPx - labPx) / 2)) * k;
          const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cardMat()); m.material.depthTest = false;
          m.position.copy(pos).addScaledVector(fwd, d).addScaledVector(right, xo).addScaledVector(up, yo); m.up.copy(up); m.lookAt(pos);
          m.userData = { stop: i, bw, bh, t: c.t, j }; m.scale.set(bw, bh, 1); m.renderOrder = 5; g.add(m); cards.push(m);
          tex(c.f, t => { const ar = t.image.width / t.image.height; let w = bw, h = bw / ar; if (h > bh) { h = bh; w = bh * ar } m.scale.set(w, h, 1); m.material.map = t; m.material.color.set(0xffffff); m.material.needsUpdate = true }) }) }
    });
  }
  /* ---------- DOM: reading pages, callouts, gallery, dial, nav ---------- */
  const TELL = ctx.tell, TELLIN = TELL.querySelector('.in'), CALL = ctx.call, LINES = ctx.lines, GAL = ctx.gal;
  let s = 0, drag = null, glide = null, settleAt = performance.now(), shown = -1, enter = null, wheelAcc = 0, wheelT = 0, coShown = -1;
  const pts = new Map();
  function stopNow() { return Math.abs(s - Math.round(s)) < 1e-4 ? mod(Math.round(s), NS) : -1 }
  function atRest() { return !drag && !glide && !enter && stopNow() >= 0 }
  function glideTo(t, dur) { const d = Math.abs(t - s); glide = { s0: s, t: t, t0: performance.now(), d: dur || Math.min(1400, T_GLIDE + 160 * Math.max(0, d - 1)) }; hidePage(); log('glide', mod(Math.round(t), NS)) }
  function hidePage() { if (shown !== -1) { if (ctx.onHide) ctx.onHide(shown); TELL.classList.remove('open'); GAL.classList.remove('open'); CALL.classList.remove('on'); shown = -1 } }
  function showPage(i) {
    if (shown === i) return; shown = i; const st = STOPS[i];
    if (st.tell != null && ctx.onTell) { ctx.onTell(i, st) }
    else if (st.tell != null) { const tp = document.getElementById('tell-' + st.tell); TELLIN.innerHTML = tp.innerHTML; TELL.dataset.k = st.tell; TELL.scrollTop = 0; TELL.classList.add('open') }
    else if (st.gal) { if (ctx.onGal) ctx.onGal(i); else GAL.classList.add('open') }
    else { buildCallouts(i); CALL.classList.add('on'); if (ctx.onShow) ctx.onShow(i, st) }
    log('page', st.k);
  }
  let CO = [];
  function buildCallouts(i) { const st = STOPS[i]; CALL.innerHTML = ''; LINES.innerHTML = ''; CO = [];
    (st.co || []).forEach(c => { const e = document.createElement('div'); e.className = 'co'; e.innerHTML = `<b></b>${c.s ? '<span></span>' : ''}`; e.querySelector('b').textContent = c.b; if (c.s) e.querySelector('span').textContent = c.s; CALL.appendChild(e);
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'), dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', 3); LINES.appendChild(ln); LINES.appendChild(dot); CO.push({ c, e, ln, dot }) });
    cards.filter(m => m.userData.stop === i).forEach(m => { const e = document.createElement('div'); e.className = 'tag'; e.textContent = m.userData.t; CALL.appendChild(e); CO.push({ card: m, e }) });
    coShown = i }
  const pv = V(0, 0, 0);
  function placeCallouts(cam) { const W = SW(), H = SH(), show = CALL.classList.contains('on');
    LINES.style.opacity = show ? 1 : 0;
    CO.forEach(o => {
      if (o.card) { const m = o.card; pv.copy(m.position).addScaledVector(m.up, -m.scale.y / 2).project(cam); const x = (pv.x + 1) / 2 * W, y = (1 - pv.y) / 2 * H; o.e.style.maxWidth = Math.max(110, W / (W / H < .8 ? 2.2 : 4.4)) + 'px'; o.e.style.transform = `translate(${(x - o.e.offsetWidth / 2).toFixed(1)}px,${(y - 2).toFixed(1)}px)`; return }
      const a = o.c.at === 'front' ? head.position : pv.set(...o.c.at); const p = a.clone().project(cam); const x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H;
      const ew = o.e.offsetWidth, eh = o.e.offsetHeight; let lx = x + o.c.dx * W, ly = y + o.c.dy * H; lx = Math.max(10, Math.min(W - ew - 10, lx - (o.c.dx < 0 ? ew : 0))); ly = Math.max(70, Math.min(H - eh - 70, ly));
      o.e.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
      const ex = Math.max(lx, Math.min(lx + ew, x)), ey = Math.max(ly, Math.min(ly + eh, y));
      o.ln.setAttribute('x1', x); o.ln.setAttribute('y1', y); o.ln.setAttribute('x2', ex); o.ln.setAttribute('y2', ey); o.dot.setAttribute('cx', x); o.dot.setAttribute('cy', y) });
  }
  function go(i, abs) { const base = glide ? Math.round(glide.t) : Math.round(s); if (abs) { const cur = mod(base, NS), d = mod(i - cur + NS / 2, NS) - NS / 2; glideTo(base + d) } else glideTo(base + i) }
  /* drags on the reading page / gallery still move with the sun sideways; vertical drags scroll them */
  [TELL, GAL].forEach(el => {
    el.addEventListener('pointerdown', e => { if (e.target.closest('button,a')) return; down(e); if (drag) drag.txt = true });
    el.addEventListener('pointermove', e => move(e)); el.addEventListener('pointerup', e => up(e, true)); el.addEventListener('pointercancel', e => { pts.delete(e.pointerId); if (drag && drag.id === e.pointerId) { const D = drag; drag = null; glideTo(D.s0, T_BACK) } }) });
  function down(e) { pts.set(e.pointerId, 1); if (pts.size > 1 || enter) return; if (glide) glide = null;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, sStart: s, s0: Math.round(s), moved: 0, horiz: null, t0: performance.now(), smp: [[performance.now(), s]] } }
  function move(e) { if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0; drag.moved = Math.max(drag.moved, Math.abs(dx), Math.abs(dy)); if (drag.moved < 8) return;
    if (drag.horiz === null) drag.horiz = Math.abs(dx) >= Math.abs(dy);
    if (drag.txt && !drag.horiz) return; /* scrolling the page */
    const W = SW(), H = SH(), d = drag.horiz ? -dx / (W * .55) : -dy / (H * .4);
    s = drag.sStart + d; hidePage(); drag.smp.push([performance.now(), s]); if (drag.smp.length > 8) drag.smp.shift() }
  function up(e) { pts.delete(e.pointerId); if (!drag || drag.id !== e.pointerId) return; const D = drag; drag = null; const now = performance.now();
    if (D.moved < 8 || (D.txt && !D.horiz)) { if (stopNow() < 0) glideTo(Math.round(s), T_BACK); return }
    const sm = D.smp.filter(q => now - q[0] < 100), v = sm.length > 1 ? (sm[sm.length - 1][1] - sm[0][1]) / Math.max(1, sm[sm.length - 1][0] - sm[0][0]) : 0, ds = s - D.s0;
    let t; if (Math.abs(v) > .0016) t = v > 0 ? Math.floor(s + 1e-6) + 1 : Math.ceil(s - 1e-6) - 1; else if (Math.abs(ds) >= .25) t = Math.abs(ds) < 1 ? D.s0 + Math.sign(ds) : Math.round(s); else t = D.s0;
    glideTo(t, t === D.s0 ? T_BACK : undefined) }
  function wheel(e) { if (enter) return; const tgt = e.target.closest && e.target.closest('#setell,#segal'); if (tgt && Math.abs(e.deltaY) > Math.abs(e.deltaX) && tgt.scrollHeight > tgt.clientHeight + 2) return;
    const now = performance.now(); if (now - wheelT > 260) wheelAcc = 0; wheelT = now; wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(wheelAcc) > 70) { go(Math.sign(wheelAcc)); wheelAcc = -1e5 * Math.sign(wheelAcc) } }
  function key(e) { if (enter) return; if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1) } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1) } else if (e.key === 'Home') go(0, true) }
  /* ---------- per frame ---------- */
  const cp = V(0, 0, 0), cl = V(0, 0, 0), rd = V(0, 0, 0), Q = new THREE.Quaternion(), Y = V(0, -1, 0);
  function update(now, cam) {
    if (glide) { const u = Math.min(1, (now - glide.t0) / glide.d); s = glide.s0 + (glide.t - glide.s0) * EASE(u); if (u >= 1) { s = glide.t; glide = null; settleAt = now; if (stopNow() >= 0) s = mod(Math.round(s), NS) } }
    if (!FREE && !drag && !glide && !enter && stopNow() < 0) glideTo(Math.round(s), T_BACK);
    const i = FREE ? (Math.abs(s - Math.round(s)) < .12 ? mod(Math.round(s), NS) : -1) : stopNow(); if (FREE) { if (i !== shown) { hidePage(); if (i >= 0) showPage(i) } } else if (i >= 0 && atRest() && now - settleAt > 220) showPage(i);
    const sm = mod(s, NS), F = Math.max(0, Math.min(1, pw(KF, sm))), R = Math.max(0, Math.min(1, pw(KR, sm)));
    /* the sun: on the whorl's rim (v2's control) and high in the sky, both moving with s */
    const a = ang(s); sun.position.set(Math.cos(a) * 7.6, .9, -Math.sin(a) * 7.6); sunCore.position.copy(sun.position);
    const sa = a + .9; skySun.position.set(Math.cos(sa) * 26, 30, -Math.sin(sa) * 26); skyCore.position.copy(skySun.position);
    rd.set(0, LENS_Y, 0).sub(skySun.position); const len = rd.length(); rd.normalize(); Q.setFromUnitVectors(Y, rd); ray.quaternion.copy(Q); ray.position.copy(skySun.position); ray.scale.set(1, len, 1);
    rayU.uR.value = R; rayU.uI.value = (cam.position.y > 0 ? 1 : .25) * Math.max(.1, Math.min(1, (cam.position.distanceTo(lensGlow.position) - 3) / 8));
    lensGlow.material.opacity = Math.min(1, R * R * 1.1) * (cam.position.y > 0 ? 1 : .5) * Math.max(.08, Math.min(1, (cam.position.distanceTo(lensGlow.position) - 2.5) / 7)); lensGlow.scale.setScalar(4 + 4 * R);
    FU.uF.value = F; UB.uF.value = F; const dxz = Math.hypot(cam.position.x, cam.position.z); UB.uI.value = (.1 + .38 * F) * Math.min(1, Math.max(.12, (dxz - 2.4) / 7));
    head.position.set(0, FTOP + (FBOT - FTOP) * F, 0); head.material.opacity = F > .01 && F < .995 ? .9 : 0;
    const L = Math.max(0, (F - .9) / .1); pool.material.opacity = .9 * L; ripples.forEach((r, k) => r.material.opacity = .25 * L * (1 - k * .25)); lightGarden(.08 + .92 * L);
    if (true) { poseAt(s, cp, cl);
      if (enter) { const u = Math.min(1, (now - enter.t0) / T_ENTER), k = EASE(u); cp.lerpVectors(enter.p, cp, k); cl.lerpVectors(enter.l, cl, k); if (u >= 1) { enter = null; settleAt = now } }
      cam.position.copy(cp); cam.up.set(0, 1, 0); if (Math.abs(cl.x - cp.x) < 1e-3 && Math.abs(cl.z - cp.z) < 1e-3) cl.z -= .01; cam.lookAt(cl); cam.updateMatrixWorld() }
    const camY = cam.position.y; under.visible = camY < .4;
    faceM.opacity = Math.max(.16, Math.min(1, (Math.hypot(cam.position.x, cam.position.y - .6, cam.position.z) - 2.2) / 7)); housing.material.opacity = .5 + .42 * faceM.opacity;
    water.material.opacity = camY < 0 ? .98 : .9; wall.visible = camY > 0;
    [...planes, ...cards].forEach(m => { const d = Math.abs(sm - m.userData.stop), dd = Math.min(d, NS - d); m.material.opacity = Math.max(0, 1 - dd / .85);
      if (ctx.fly && m.userData.base) { const sd = mod(sm - m.userData.stop + NS / 2, NS) - NS / 2, z = m.userData.d * (1 - .9 * sd); m.position.copy(m.userData.base).addScaledVector(m.userData.fwd, -sd * .9 * m.userData.d);
        m.material.opacity = Math.max(0, Math.min(1, 1 - Math.abs(sd) / 1.1, (z - 1.2) / 2.5)) }
      m.visible = m.material.opacity > .01 });
    if (coShown >= 0 && CALL.classList.contains('on')) placeCallouts(cam); else LINES.style.opacity = 0;
    
    const dl = cam.position.distanceTo(lensGlow.position); faceM.opacity *= dl < 5 ? .5 : 1;
    stateF = F; stateR = R;
    if (ctx.onFrame) ctx.onFrame(cam, sm, i);
  }
  let stateF = 0, stateR = 0;
  const LOG = []; function log(k, v) { LOG.push([Math.round(performance.now()), k, v]); if (LOG.length > 300) LOG.shift() }
  function resize(aspect) { layoutPath(aspect); placeAll(aspect); if (shown >= 0 && STOPS[shown].show) { const k = shown; shown = -1; showPage(k) } }
  return { group: g, update, STOPS, poseAt, setS(x) { glide = null; s = x }, get s() { return s }, glideTo, down, move, up, wheel, key, resize, log: LOG, NS, go,
    enterFrom(pos, look, at) { enter = { p: pos.clone(), l: look.clone(), t0: performance.now() }; if (at != null) s = at },
    st: () => ({ s: +s.toFixed(4), stop: stopNow(), k: stopNow() >= 0 ? STOPS[stopNow()].k : null, rest: atRest(), page: shown >= 0 ? STOPS[shown].k : null, F: +stateF.toFixed(3), R: +stateR.toFixed(3), glide: !!glide }),
    jump(i) { glide = null; drag = null; hidePage(); s = i; settleAt = 0 } };
}
/* ---------- no WebGL: the same stops as a plain sequence ---------- */
export function fallback(el) {
  const FIMG = { water: ['s2/p12-scene3'], lens: ['s2/p15-whorl-top'], in: ['s2/p19-close-eye'], under: ['s2/p17-side-view'], garden: ['s3/p20-wetland'] };
  el.innerHTML = STOPS.map(st => {
    if (st.tell != null) return '<section>' + document.getElementById('tell-' + st.tell).innerHTML + '</section>';
    if (st.gal) return '<section>' + [26, 27, 28, 29, 30, 31, 32].map(n => `<img src="${IMG('gallery/p' + n + '-s')}" alt="PDF page ${n}" loading="lazy">`).join('') + '</section>';
    let o = '<section>' + (FIMG[st.k] || []).map(f => `<img src="${IMG(f)}" alt="" loading="lazy">`).join('');
    (st.co || []).forEach(c => { o += `<p><b>${c.b}</b>${c.s ? '<br>' + c.s : ''}</p>` });
    (st.cards || []).forEach(c => { o += `<img src="${IMG(c.f)}" alt="" loading="lazy"><p>${c.t}</p>` });
    return o + '</section>' }).join('');
}
