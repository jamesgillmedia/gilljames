#!/usr/bin/env node
/* Objects gallery · the joio cup in the spinning view. Enters the joio cup's room the way a visitor does (tap the photograph, then through the hoop) and checks, in A
   (the room as on main) and in G1 / G2 / G3: the cup turns with a finger and keeps a little of the turn; in the gallery takes it also keeps turning on its own after a
   hand has been off it for 3.5 s, tap-to-stop holds that, A stays still when idle (unchanged), and the gallery's rail / light pill / follow never sit over the room.
   Usage: node _qa/cup-orbit-check.js [baseUrl]   (playwright-core, pngjs, Chrome with software GL; CHROME=/path)  default http://localhost:8970/objects/ */
const { chromium } = require('playwright-core'); const { PNG } = require('pngjs');
const BASE = process.argv[2] || 'http://localhost:8970/objects/';
const diff = (a, b) => { const A = PNG.sync.read(a), B = PNG.sync.read(b); let d = 0; for (let i = 0; i < A.data.length; i += 4) d += Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]); return d / (A.width * A.height) };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const R = []; const ok = (n, c, x) => R.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' :: ' + x : '')); let bad = 0;
  for (const v of ['A', 'G1', 'G2', 'G3']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/NotSameOrigin/.test(m.text())) errs.push(m.text()) });
    await p.goto(BASE + '?dev=1&v=A'); await p.waitForTimeout(800); const ob = await p.$('button:has-text("Open the page")'); if (ob) { await ob.click(); await p.waitForTimeout(2500) }
    await p.goto(BASE + '?dev=1&v=' + v); await p.waitForTimeout(3000);
    const S = () => p.evaluate(() => __objc.S.lv);
    for (let t = 0; t < 2 && (await S()) === 'board'; t++) { const i = await p.evaluate(() => __front.pieces().findIndex(x => /cup from above/.test(x.t))); const pcs = await p.$$('#front .pc'); await pcs[i].click({ force: true }); await p.waitForTimeout(1500) }
    await p.waitForTimeout(2500); ok(`${v} tapping the cup photograph leads into the joio cup ring`, (await S()) === 'ring');
    for (let i = 0; i < 3 && (await S()) !== 'room'; i++) { await p.evaluate(() => __objc.deeper()); await p.waitForTimeout(2600) }
    ok(`${v} through the hoop into the room`, (await S()) === 'room');
    const pk = (await p.evaluate(() => __objc.projectPickables().filter(x => x.kind === 'cup')))[0]; ok(`${v} the 3D cup is in the room and on screen`, !!(pk && pk.on));
    const snap = () => p.screenshot({ clip: { x: 40, y: 200, width: 310, height: 440 } });
    const a = await snap(); await p.waitForTimeout(3000); const b1 = await snap(), idle = diff(a, b1);
    if (v === 'A') ok('A idle: the cup holds still (as on main)', idle < 1, idle.toFixed(1)); else ok(`${v} idle: the cup keeps turning on its own`, idle > 5, idle.toFixed(1));
    if (v !== 'A') {
      await p.tap('.g-stop'); await p.waitForTimeout(300); const s0 = await snap(); await p.waitForTimeout(3000); const s1 = await snap();
      ok(`${v} tap to stop holds the cup`, diff(s0, s1) < 1 && (await p.textContent('.g-stop')) === 'tap to play', diff(s0, s1).toFixed(1));
      await p.tap('.g-stop'); await p.waitForTimeout(300);
      const leak = await p.evaluate(() => { const r = document.querySelector('.g-rail').getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { rail: !!(e && e.closest('.g-rail')), light: [...document.querySelectorAll('.ambx.obj-light')].some(x => !x.hidden), follow: getComputedStyle(document.querySelector('#ohd .ofollow')).display !== 'none', pill: !document.querySelector('.g-stop').hidden } });
      ok(`${v} in the room: rail takes no touches, light pill and follow hidden, tap-to-stop available`, !leak.rail && !leak.light && !leak.follow && leak.pill, JSON.stringify(leak));
    }
    const cdp = await ctx.newCDPSession(p), pt = (x, y) => [{ x, y, id: 1 }]; const c0 = await snap();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(pk.x - 60, pk.y) });
    for (let i = 1; i <= 14; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(pk.x - 60 + i * 9, pk.y) }); await new Promise(r => setTimeout(r, 16)) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(250); const c1 = await snap(); await p.waitForTimeout(1500); const c2 = await snap();
    ok(`${v} a finger drag turns the cup and it eases out after release`, diff(c0, c1) > 5 && diff(c1, c2) > 3, `${diff(c0, c1).toFixed(1)} then ${diff(c1, c2).toFixed(1)}`);
    ok(`${v} console clean`, errs.length === 0, errs.join('|')); await ctx.close();
  }
  console.log(R.join('\n')); await b.close(); process.exit(R.some(r => r.startsWith('FAIL')) ? 1 : 0);
})();
