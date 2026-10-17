// Single source of truth for the Pavilion + Pod geometry, schedule and steps.
// Units: metres. x = east (bays), y = up, z = south (front, low eave). North = -z (assumed orientation).
// Concept, not engineered. A BC structural engineer must review.
export const DENSITY = 450;            // kg/m3, design value (brief: 431 FII to 495 WDB, air-dry)
export const BF_PER_M3 = 423.776;      // board feet per cubic metre
export const S = 2.4;                  // bay / half-span
export const EAVE = 2.70;              // underside of tie beam (front clear height)
export const TB_TOP = 3.05;            // top of 350 deep tie beam
export const HIGH = 3.90;              // top of back post = underside of rafter at back line
export const RISE = HIGH - TB_TOP;     // 0.85 over 4.8
export const TH = Math.atan2(RISE, 2 * S);  // roof pitch (~10 deg)
export const PAD_TOP = 0.15;
export const yRu = z => TB_TOP + (S - z) / (2 * S) * RISE;   // rafter underside
const C = Math.cos(TH), SN = Math.sin(TH);
export const N = [0, C, SN];          // roof normal (up-slope tilted toward north)
const cosT = C;
// pod
export const POD = { x0: -2.2, x1: 0.556, z0: -1.378, z1: 1.378, FL: 0.277, wallTop: 2.15, cleTop: 2.40, ringTop: 2.50, lidTop: 2.627, t: 0.178 };
POD.cx = (POD.x0 + POD.x1) / 2;
export const KILN = { x: 1.5, z: 1.4, body: 0.42, standH: 0.30, bodyH: 0.45, pad: 1.5, padT: 0.06, clear: 0.457 };
export function crew(kg) { return kg <= 25 ? '1 person' : kg <= 60 ? '2 people' : kg <= 90 ? '3 people' : 'hoist'; }

export const STEPS = [
  { n: 1, title: 'Pads & gravel', text: 'Lay out the 4.8 m grid with string lines. Spread 150 mm crushed gravel on fabric; level 6 post pads, 9 pod pavers and the stone kiln slab. No digging deeper than 200 mm (assumed).', crew: '2 people' },
  { n: 2, title: 'Bents on the ground', text: 'Assemble each bent flat beside its pads: back + front post, two tie-beam halves joined by the pegged scarf, king strut, two knee braces. Drive pegs.', crew: '3 people' },
  { n: 3, title: 'Raise the bents', text: 'Pivot each bent up on its pads with a gin pole or chain hoist and 4 to 6 people. Prop with temporary diagonals. Repeat for bents 2 and 3.', crew: 'hoist + 4–6' },
  { n: 4, title: 'Plates & braces', text: 'Tenon the front and back plates between bents and peg the 8 longitudinal knee braces. Check plumb and square; the frame now stands alone.', crew: '3 people' },
  { n: 5, title: 'Rafters & purlins', text: 'Set rafter halves (lapped over the king struts), then the 7 purlins. Peg purlins to rafters.', crew: '3 people' },
  { n: 6, title: 'Roof', text: 'Lift 18 roof panels (600 module) onto the purlins with a rope and ramp, screw down, lay the membrane, fix cap battens.', crew: '2 people + rope' },
  { n: 7, title: 'Pod floor', text: 'Under cover: sleepers on pavers, sill ring, four 600 floor panels.', crew: '2 people' },
  { n: 8, title: 'Pod walls & lid', text: 'Corner posts, twelve 600 wall panels (knock-down bolts), clerestory frames, top ring, five lid panels.', crew: '2 people' },
  { n: 9, title: 'Wall, kiln, power', text: 'Hang the four bi-fold leaves, place the step, set the test kiln on its stand on the stone slab, run the cord to the generator or solar cart.', crew: '2 people' },
];

const M = [];   // members
const PEGS = [];
let uid = 0;
function add(o) { o.id = `${o.mark}-${++uid}`; M.push(o); return o; }
// oriented box from axis a->b, section w (side) x h (along 'up'); sched = {len, vol}
function mem(mark, type, a, b, w, h, up, opt = {}) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  return add({ mark, type, a, b, w, h, up, mat: 'cedar', len, schedLen: opt.schedLen ?? len,
    vol: opt.vol ?? (w * h * (opt.schedLen ?? len) - (opt.deduct || 0)), ...opt });
}
// axis-aligned box helper: min/max corners, long axis auto
function abox(mark, type, x0, y0, z0, x1, y1, z1, opt = {}) {
  const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  let a, b, w, h, up;
  if (dx >= dy && dx >= dz) { a = [x0, cy, cz]; b = [x1, cy, cz]; w = dz; h = dy; up = [0, 1, 0]; }
  else if (dz >= dy) { a = [cx, cy, z0]; b = [cx, cy, z1]; w = dx; h = dy; up = [0, 1, 0]; }
  else { a = [cx, y0, cz]; b = [cx, y1, cz]; w = dx; h = dz; up = [0, 0, 1]; }
  return mem(mark, type, a, b, w, h, up, opt);
}
function peg(c, axis, len, step, bent) { PEGS.push({ c, axis, len, d: 0.025, step, bent }); }

const BX = [-S, 0, S];
// ---------- site ----------
for (const x of BX) for (const z of [-S, S])
  abox('PD', 'post pad (precast concrete or flat stone)', x - .225, 0, z - .225, x + .225, PAD_TOP, z + .225, { mat: 'stone', step: 1, group: 'site', nonCedar: true, kg: 0.45 * 0.45 * 0.15 * 2300 });
for (const x of [POD.x0 + .15, POD.cx, POD.x1 - .15]) for (const z of [-1.2, 0, 1.2])
  abox('PV', 'pod paver 300x300x50', x - .15, 0, z - .15, x + .15, .05, z + .15, { mat: 'stone', step: 1, group: 'site', nonCedar: true, kg: .3 * .3 * .05 * 2300 });
{ const h = KILN.pad / 2;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const x0 = KILN.x - h + i * .5, z0 = KILN.z - h + j * .5;
    abox('KS', 'kiln slab paver 500x500x60 (stone or concrete)', x0 + .003, 0, z0 + .003, x0 + .497, KILN.padT, z0 + .497, { mat: 'stone2', step: 1, group: 'site', nonCedar: true, kg: .5 * .5 * .06 * 2300 }); } }
// ---------- bents ----------
BX.forEach((x, bi) => {
  const bent = bi + 1, o = { step: 2, group: 'frame', bent };
  mem('P1', 'back post 200x200', [x, PAD_TOP, -S], [x, HIGH, -S], .2, .2, [0, 0, 1], { ...o, schedLen: HIGH - PAD_TOP + .05, note: 'top tenon 50 into rafter' });
  mem('P2', 'front post 200x200', [x, PAD_TOP, S], [x, EAVE, S], .2, .2, [0, 0, 1], { ...o, schedLen: EAVE - PAD_TOP + .10, note: 'top tenon 100 into tie beam' });
  // tie beam halves: scarf zone z -0.3..0.3; back half has 200 through-tenon into back post
  mem('T1', 'tie beam, back half 200x350', [x, (EAVE + TB_TOP) / 2, -S + .1], [x, (EAVE + TB_TOP) / 2, 0.3], .2, .35, [0, 1, 0], { ...o, visA: -S + .1, schedLen: 2.80, deduct: 0.2 * 0.35 * 0.6 / 2 + (0.2 * 0.35 - 0.07 * 0.25) * 0.2, note: '600 scarf + 200 through-tenon', scarf: 'back',
    parts: [[[x, (EAVE + TB_TOP) / 2, -S + .1], [x, (EAVE + TB_TOP) / 2, -0.3], .2, .35], [[x, TB_TOP - .0875, -0.3], [x, TB_TOP - .0875, 0.3], .2, .175], [[x, (EAVE + TB_TOP) / 2 + .02, -S - .13], [x, (EAVE + TB_TOP) / 2 + .02, -S + .1], .07, .25]] });
  mem('T2', 'tie beam, front half 200x350', [x, (EAVE + TB_TOP) / 2, -0.3], [x, (EAVE + TB_TOP) / 2, S + .15], .2, .35, [0, 1, 0], { ...o, schedLen: 2.85, deduct: 0.2 * 0.35 * 0.6 / 2, note: '600 scarf, mortise for post', scarf: 'front',
    parts: [[[x, (EAVE + TB_TOP) / 2, 0.3], [x, (EAVE + TB_TOP) / 2, S + .15], .2, .35], [[x, EAVE + .0875, -0.3], [x, EAVE + .0875, 0.3], .2, .175]] });
  mem('K1', 'king strut 150x150', [x, TB_TOP, 0], [x, yRu(0), 0], .15, .15, [0, 0, 1], { ...o, schedLen: yRu(0) - TB_TOP + .1 });
  // knee braces in bent plane, 700 legs
  for (const sz of [-1, 1]) {
    const pz = sz * (S - .1), bz = sz * (S - .1 - .7);
    mem('B1', 'bent knee brace 100x150', [x, EAVE - .7, pz], [x, EAVE, bz], .1, .15, [0, 1, 0], { ...o, schedLen: .99 + .12, visExt: .08 });
    peg([x, EAVE - .7 + .08, pz - sz * .06], 'x', .14, 2, bent); peg([x, EAVE - .06, bz + sz * .08], 'x', .24, 2, bent);
  }
  peg([x, EAVE + .09, S - .05], 'x', .24, 2, bent); peg([x, EAVE + .09, S + .05], 'x', .24, 2, bent);
  peg([x, EAVE + .1, -S], 'x', .24, 2, bent); peg([x, EAVE + .25, -S], 'x', .24, 2, bent);
  for (const z of [-.2, 0, .2]) peg([x, EAVE + .175, z], 'x', .24, 2, bent);
  peg([x, TB_TOP + .07, 0], 'x', .19, 2, bent);
  // rafters (halves lapped over king strut), step 5
  const r = { step: 5, group: 'frame', bent };
  for (const [z0, z1, mk, nm] of [[S + .45, 0, 'R2', 'rafter, front half 125x250'], [0, -S - .45, 'R1', 'rafter, back half 125x250']]) {
    const a = [x, yRu(z0) + .125 * C, z0 + .125 * SN], b = [x, yRu(z1) + .125 * C, z1 + .125 * SN];
    mem(mk, nm, a, b, .125, .25, N, { ...r, schedLen: (Math.abs(z1 - z0) + .15) / cosT, note: 'incl. 150 lap' });
  }
  peg([x, yRu(0) + .1, 0], 'x', .17, 5, bent); peg([x, HIGH + .12, -S], 'x', .17, 5, bent); peg([x, TB_TOP + .12, S], 'x', .17, 5, bent);
});
// plates + longitudinal braces (step 4)
for (const [x0, x1] of [[-S + .1, -.1], [.1, S - .1]]) {
  abox('L1', 'front plate 150x250', x0 - .08, TB_TOP - .25, S - .075, x1 + .08, TB_TOP, S + .075, { step: 4, group: 'frame', schedLen: 2.36, visShrink: .08 });
  abox('L2', 'back plate 150x250', x0 - .08, HIGH - .25, -S - .075, x1 + .08, HIGH, -S + .075, { step: 4, group: 'frame', schedLen: 2.36, visShrink: .08 });
}
for (const xb of BX) for (const sx of [-1, 1]) {
  if (Math.abs(xb + sx * .7) > S) continue;
  const fx = xb + sx * .1;
  mem('B2', 'longitudinal knee brace 100x150', [fx, TB_TOP - .25 - .7, S], [fx + sx * .7, TB_TOP - .25, S], .1, .15, [0, 1, 0], { step: 4, group: 'frame', schedLen: 1.11, side: 'front', visExt: .08 });
  mem('B2', 'longitudinal knee brace 100x150', [fx, HIGH - .25 - .7, -S], [fx + sx * .7, HIGH - .25, -S], .1, .15, [0, 1, 0], { step: 4, group: 'frame', schedLen: 1.11, side: 'back', visExt: .08 });
  peg([fx + sx * .07, TB_TOP - .25 - .62, S], 'z', .24, 4); peg([fx + sx * .62, TB_TOP - .3, S], 'z', .19, 4);
  peg([fx + sx * .07, HIGH - .25 - .62, -S], 'z', .24, 4); peg([fx + sx * .62, HIGH - .3, -S], 'z', .19, 4);
}
for (const xb of BX) for (const sx of [-1, 1]) {
  if (Math.abs(xb + sx * .3) > S) continue;
  peg([xb + sx * .05, TB_TOP + .01, S], 'y', .12, 4); peg([xb + sx * .05, HIGH - .12, -S], 'z', .24, 4);
}
// purlins (step 5): 100 wide x 200 deep, on rafter top, tilted with roof
export const PURLIN_Z = [2.7, 1.8, 0.9, 0, -0.9, -1.8, -2.7];
const rTop = z => yRu(z) + .25 / C;   // vertical offset approx
for (const z of PURLIN_Z) {
  const base = [0, rTop(z), z], c = [0, base[1] + .1 * C, z + .1 * SN];
  mem('U1', 'purlin 100x200', [-2.7, c[1], c[2]], [2.7, c[1], c[2]], .1, .2, N, { step: 5, group: 'frame' });
  for (const x of BX) peg([x, base[1] + .2, z], 'n', .26, 5);
}
// roof (step 6): panels 600 wide, 2 per column, on purlins
export const RP_T = 0.127;
const pTop = z => rTop(z) + .2 / C;
for (let i = 0; i < 9; i++) {
  const x0 = -2.7 + i * .6, cx = x0 + .3;
  for (const [z0, z1] of [[2.85, 0], [0, -2.85]]) {
    const off = RP_T / 2;
    const a = [cx, pTop(z0) + off * C, z0 + off * SN], b = [cx, pTop(z1) + off * C, z1 + off * SN];
    const L = Math.abs(z1 - z0) / C;
    mem('RP', 'roof panel 600 stressed-skin', a, b, .596, RP_T, N, { step: 6, group: 'roof', mat: 'panel', schedLen: L, vol: 2 * .019 * .6 * L + 3 * .038 * .089 * L, panel: true });
  }
}
{ const off = RP_T + .003; const a = [0, pTop(2.86) + off * C, 2.86 + off * SN], b = [0, pTop(-2.86) + off * C, -2.86 + off * SN];
  mem('MB', 'roof membrane (EPDM, assumed)', a, b, 5.42, .005, N, { step: 6, group: 'roof', mat: 'membrane', nonCedar: true, kg: 5.42 * 5.8 * 1.4 }); }
for (let i = 0; i <= 9; i++) {
  const x = -2.7 + i * .6, off = RP_T + .005 + .025;
  for (const [z0, z1] of [[2.85, 0], [0, -2.85]]) {
    const a = [x, pTop(z0) + off * C, z0 + off * SN], b = [x, pTop(z1) + off * C, z1 + off * SN];
    mem('BT', 'cap batten 50x50', a, b, .05, .05, N, { step: 6, group: 'roof' });
  }
}
// ---------- pod ----------
const P = POD, t = P.t, h2 = t / 2;
for (const z of [-1.2, 0, 1.2]) abox('SL', 'pod sleeper 100x100', P.x0, .05, z - .05, P.x1, .15, z + .05, { step: 7, group: 'pod' });
abox('SI', 'sill 178x127', P.x0, .15, P.z0, P.x1, P.FL, P.z0 + t, { step: 7, group: 'pod' });
abox('SI', 'sill 178x127', P.x0, .15, P.z1 - t, P.x1, P.FL, P.z1, { step: 7, group: 'pod' });
abox('SI', 'sill 178x127', P.x0, .15, P.z0 + t, P.x0 + t, P.FL, P.z1 - t, { step: 7, group: 'pod' });
abox('SI', 'sill 178x127', P.x1 - t, .15, P.z0 + t, P.x1, P.FL, P.z1 - t, { step: 7, group: 'pod' });
for (let i = 0; i < 4; i++) { const x0 = P.x0 + t + i * .6;
  abox('FP', 'floor panel 600 stressed-skin', x0 + .002, .15, P.z0 + t, x0 + .598, P.FL, P.z1 - t, { step: 7, group: 'pod', mat: 'panel', schedLen: 2.4, vol: 2 * .019 * .6 * 2.4 + 3 * .038 * .089 * 2.4, panel: true }); }
for (const x of [P.x0 + h2, P.x1 - h2]) for (const z of [P.z0 + h2, P.z1 - h2])
  abox('CP', 'pod corner post 178x178', x - h2, P.FL, z - h2, x + h2, P.cleTop, z + h2, { step: 8, group: 'pod', schedLen: P.cleTop - P.FL + .1 });
const WH = P.wallTop - P.FL;
const wallVol = 2 * .019 * .6 * WH + 3 * .038 * .14 * WH;
for (let i = 0; i < 4; i++) {
  const a = P.x0 + t + i * .6, za = P.z0 + t + i * .6;
  abox('WP', 'wall panel 600 stressed-skin', a + .002, P.FL, P.z0, a + .598, P.wallTop, P.z0 + t, { step: 8, group: 'pod', mat: 'panel', side: 'n', vol: wallVol, schedLen: WH, panel: true });
  abox('WP', 'wall panel 600 stressed-skin', a + .002, P.FL, P.z1 - t, a + .598, P.wallTop, P.z1, { step: 8, group: 'pod', mat: 'panel', side: 's', vol: wallVol, schedLen: WH, panel: true });
  abox('WP', 'wall panel 600 stressed-skin', P.x0, P.FL, za + .002, P.x0 + t, P.wallTop, za + .598, { step: 8, group: 'pod', mat: 'panel', side: 'w', vol: wallVol, schedLen: WH, panel: true });
}
// clerestory: polycarbonate band + cedar mullions on 600, all four sides
const cleVol = 2 * .1 * .038 * 2.4 + 3 * .05 * .1 * (P.cleTop - P.wallTop - .076);
const cle = (x0, z0, x1, z1, side) => {
  abox('CL', 'clerestory frame 2400x250 + twin-wall polycarbonate (assumed)', x0, P.wallTop, z0, x1, P.cleTop, z1, { step: 8, group: 'pod', mat: 'poly', side, vol: cleVol, schedLen: 2.4, polyKg: 2.4 * .25 * 1.7 });
};
cle(P.x0 + t, P.z0 + .06, P.x1 - t, P.z0 + .118, 'n'); cle(P.x0 + t, P.z1 - .118, P.x1 - t, P.z1 - .06, 's');
cle(P.x0 + .06, P.z0 + t, P.x0 + .118, P.z1 - t, 'w'); cle(P.x1 - .118, P.z0 + t, P.x1 - .06, P.z1 - t, 'e');
for (let i = 1; i < 4; i++) { const a = P.x0 + t + i * .6, za = P.z0 + t + i * .6;
  abox('MU', 'mullion 50x100', a - .025, P.wallTop, P.z0 + .039, a + .025, P.cleTop, P.z0 + .139, { step: 8, group: 'pod', inCL: true });
  abox('MU', 'mullion 50x100', a - .025, P.wallTop, P.z1 - .139, a + .025, P.cleTop, P.z1 - .039, { step: 8, group: 'pod', inCL: true });
  abox('MU', 'mullion 50x100', P.x0 + .039, P.wallTop, za - .025, P.x0 + .139, P.cleTop, za + .025, { step: 8, group: 'pod', inCL: true });
  abox('MU', 'mullion 50x100', P.x1 - .139, P.wallTop, za - .025, P.x1 - .039, P.cleTop, za + .025, { step: 8, group: 'pod', inCL: true }); }
// top ring + header over bi-fold
abox('TR', 'top ring 178x100', P.x0, P.cleTop, P.z0, P.x1, P.ringTop, P.z0 + t, { step: 8, group: 'pod' });
abox('TR', 'top ring 178x100', P.x0, P.cleTop, P.z1 - t, P.x1, P.ringTop, P.z1, { step: 8, group: 'pod' });
abox('TR', 'top ring 178x100', P.x0, P.cleTop, P.z0 + t, P.x0 + t, P.ringTop, P.z1 - t, { step: 8, group: 'pod' });
abox('TR', 'top ring 178x100', P.x1 - t, P.cleTop, P.z0 + t, P.x1, P.ringTop, P.z1 - t, { step: 8, group: 'pod' });
abox('HD', 'bi-fold head rail 178x60', P.x1 - t, P.wallTop - .06, P.z0 + t, P.x1, P.wallTop, P.z1 - t, { step: 8, group: 'pod' });
for (let i = 0; i < 5; i++) { const x0 = P.cx - 1.5 + i * .6;
  abox('LP', 'lid panel 600 stressed-skin', x0 + .002, P.ringTop, P.cx * 0 - 1.5, x0 + .598, P.lidTop, 1.5, { step: 8, group: 'pod', mat: 'panel', vol: 2 * .019 * .6 * 3 + 3 * .038 * .089 * 3, schedLen: 3.0, panel: true }); }
// bi-fold leaves (4 x 600) on the east face, fold inward to park against the N and S walls
export const BIFOLD = { x: P.x1 - h2, z0: P.z0 + t, z1: P.z1 - t, y0: P.FL, h: P.wallTop - .06 - P.FL - .01, w: .6, t: .057 };
for (let i = 0; i < 4; i++) {
  const za = BIFOLD.z0 + i * .6;
  const m = abox('BF', 'bi-fold leaf 600, 57 solid frame-and-panel', BIFOLD.x - BIFOLD.t / 2, BIFOLD.y0, za + .003, BIFOLD.x + BIFOLD.t / 2, BIFOLD.y0 + BIFOLD.h, za + .597, { step: 9, group: 'pod', mat: 'leaf', vol: .6 * BIFOLD.h * .057 * .8, schedLen: BIFOLD.h, leaf: i, panel: true });
}
abox('SP', 'step block 1200x350x140', P.x1 + .05, .0, -.6, P.x1 + .4, .14, .6, { step: 9, group: 'pod' });
// kiln (non-cedar)
abox('KN', 'kiln stand (steel, 300 high, assumed)', KILN.x - .2, KILN.padT, KILN.z - .2, KILN.x + .2, KILN.padT + KILN.standH, KILN.z + .2, { step: 9, group: 'kiln', mat: 'steel', nonCedar: true, kg: 8 });
abox('KL', '120 V test kiln (Caldera-class, ~420 sq x 450, assumed)', KILN.x - KILN.body / 2, KILN.padT + KILN.standH, KILN.z - KILN.body / 2, KILN.x + KILN.body / 2, KILN.padT + KILN.standH + KILN.bodyH, KILN.z + KILN.body / 2, { step: 9, group: 'kiln', mat: 'kiln', nonCedar: true, kg: 30 });

for (const m of M) { if (!m.nonCedar) { m.kg = m.vol * DENSITY; } m.crew = crew(m.kg || 0); }
export const MEMBERS = M;
export { PEGS };
export const PEG_VOL = PEGS.reduce((s, p) => s + Math.PI * (p.d / 2) ** 2 * p.len, 0);

// schedule rows grouped by mark
export function schedule(filter = () => true) {
  const rows = new Map();
  for (const m of M) { if (!filter(m)) continue;
    const k = m.mark + '|' + m.type + '|' + Math.round(m.schedLen * 1000);
    if (!rows.has(k)) rows.set(k, { mark: m.mark, type: m.type, qty: 0, len: m.schedLen, w: m.w, h: m.h, vol: m.vol, kg: m.kg, crew: m.crew, nonCedar: m.nonCedar, note: m.note || '', step: m.step, group: m.group });
    rows.get(k).qty++; }
  return [...rows.values()];
}

// visual boxes for a member: list of {a,b,w,h,up}
export function boxesOf(m) {
  const up = m.up;
  if (m.parts) return m.parts.map(([a, b, w, h]) => ({ a, b, w, h, up }));
  let a = m.a, b = m.b;
  const L = m.len, d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
  const e = (m.visExt || 0) - (m.visShrink || 0);
  if (e) { a = a.map((v, i) => v - d[i] * e); b = b.map((v, i) => v + d[i] * e); }
  return [{ a, b, w: m.w, h: m.h, up }];
}
// basis of an oriented box: e1 (w), e2 (h), e3 (axis)
export function basis(bx) {
  const { a, b } = bx; const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const e3 = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
  let u = bx.up, k = u[0] * e3[0] + u[1] * e3[1] + u[2] * e3[2];
  let e2 = [u[0] - k * e3[0], u[1] - k * e3[1], u[2] - k * e3[2]]; const n = Math.hypot(...e2); e2 = e2.map(v => v / n);
  const e1 = [e2[1] * e3[2] - e2[2] * e3[1], e2[2] * e3[0] - e2[0] * e3[2], e2[0] * e3[1] - e2[1] * e3[0]];
  const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return { c, e1, e2, e3, L };
}
export function corners(bx) {
  const { c, e1, e2, e3, L } = basis(bx); const out = [];
  for (const s3 of [-1, 1]) for (const s2 of [-1, 1]) for (const s1 of [-1, 1])
    out.push([0, 1, 2].map(i => c[i] + s1 * e1[i] * bx.w / 2 + s2 * e2[i] * bx.h / 2 + s3 * e3[i] * L / 2));
  return out;
}
