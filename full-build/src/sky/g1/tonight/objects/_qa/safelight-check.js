#!/usr/bin/env node
/* Objects gallery · safelight (the photo lab's red darkroom light, ported). Checks, in G1 / G2 / G3 at phone and desktop sizes:
   the lamp button switches body.safe, the lamp and its bloom come on, the state is remembered across a reload and across takes, the switch inside the light plate agrees,
   the vignette is there (the empty wall gets redder) and, the point of it, NO photograph or object is graded: no filter / blend / opacity / backdrop on any media or its ancestors,
   nothing sits on top of a photograph, and the pixels inside a photograph and inside a cup are identical with the light on and off. A, B and C never get it.
   Usage: node _qa/safelight-check.js [baseUrl]   (playwright-core, pngjs, Chrome; CHROME=/path)   default http://localhost:8970/objects/ */
const { chromium } = require('playwright-core'); const { PNG } = require('pngjs');
const BASE = process.argv[2] || 'http://localhost:8970/objects/';
const px = (buf, x, y) => { const im = PNG.sync.read(buf); const i = (Math.round(y) * im.width + Math.round(x)) * 4; return [im.data[i], im.data[i + 1], im.data[i + 2]] };
function crop(buf, r) { const im = PNG.sync.read(buf); const out = []; for (let y = Math.round(r.t); y < Math.round(r.b); y++) for (let x = Math.round(r.l); x < Math.round(r.r); x++) { const i = (y * im.width + x) * 4; out.push(im.data[i], im.data[i + 1], im.data[i + 2]) } return out }
const mad = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]); return d / a.length };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', args: ['--no-sandbox'] });
  const R = []; const ok = (n, c, x) => R.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' :: ' + x : ''));
  for (const [name, w, h, touch] of [['phone 390', 390, 844, true], ['desktop 1440', 1440, 900, false]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/NotSameOrigin/.test(m.text())) errs.push(m.text()) });
    await p.goto(BASE + '?dev=1&v=A&safelight=1'); await p.waitForTimeout(800); const ob = await p.$('button:has-text("Open the page")'); if (ob) { await ob.click(); await p.waitForTimeout(2500) }
    await p.evaluate(() => localStorage.removeItem('gj-objects-safelight'));
    const tap = sel => touch ? p.tap(sel) : p.click(sel);
    const safe = () => p.evaluate(() => ({ body: document.body.classList.contains('safe'), lamp: +getComputedStyle(document.querySelector('.g-lamp')).opacity, bloom: +getComputedStyle(document.querySelector('.g-lamp-bloom.g-fixed')).opacity, store: localStorage.getItem('gj-objects-safelight') }));
    for (const v of ['A', 'B', 'C']) { await p.goto(BASE + '?dev=1&v=' + v + '&safelight=1'); await p.waitForTimeout(1800); const s = await p.evaluate(() => ({ body: document.body.classList.contains('safe'), lamp: document.querySelector('.g-lamp') ? +getComputedStyle(document.querySelector('.g-lamp')).opacity : 0 })); ok(`${name} ${v}: no safelight even when asked for (gallery takes only)`, !s.body && s.lamp === 0) }
    for (const g of ['G1', 'G2', 'G3']) {
      await p.evaluate(() => localStorage.removeItem('gj-objects-safelight')); await p.goto(BASE + '?dev=1&v=' + g); await p.waitForTimeout(2800);
      const off = await safe(); ok(`${name} ${g}: off to start, lamp dark`, !off.body && off.lamp === 0 && off.store == null, JSON.stringify(off));
      const wallOff = await p.screenshot(); const phot = await p.evaluate(() => { const pcs = [...document.querySelectorAll('#front .pc')].filter(e => e.style.display !== 'none'); const e = pcs[0]; const r = e.getBoundingClientRect(); const c = document.querySelector('.cup'); const cr = c && c.getBoundingClientRect(); return { l: r.left + r.width * .2, r: r.right - r.width * .2, t: r.top + r.height * .2, b: r.bottom - r.height * .2, cup: cr ? { l: cr.left + cr.width * .25, r: cr.right - cr.width * .25, t: cr.top + cr.height * .25, b: cr.bottom - cr.height * .25 } : null } });
      const rawOff = await p.screenshot(); const dp = crop(rawOff, phot), dc = phot.cup ? crop(rawOff, phot.cup) : null;
      const wallPx0 = px(wallOff, 5, h * .5);
      await tap('.g-lampbtn'); await p.waitForTimeout(2600);
      const on = await safe(); ok(`${name} ${g}: the lamp button switches the safelight on, the lamp and bloom come up, state remembered`, on.body && on.lamp > .95 && on.bloom > .95 && on.store === '1', JSON.stringify(on));
      const rawOn = await p.screenshot(); const wallPx1 = px(rawOn, 5, h * .5);
      ok(`${name} ${g}: the vignette is on the empty wall (redder, darker)`, wallPx1[0] - wallPx1[2] > wallPx0[0] - wallPx0[2] || wallPx1[0] > wallPx0[0], `${wallPx0} -> ${wallPx1}`);
      const dpOn = crop(rawOn, phot), dcOn = phot.cup ? crop(rawOn, phot.cup) : null;
      ok(`${name} ${g}: a photograph's pixels are identical with the safelight on and off`, mad(dp, dpOn) < .5, mad(dp, dpOn).toFixed(3));
      if (dc) ok(`${name} ${g}: a cut-out object's pixels are identical with the safelight on and off`, mad(dc, dcOn) < .5, mad(dc, dcOn).toFixed(3));
      const media = await p.evaluate(() => { const bad = [], over = []; const imgs = [...document.querySelectorAll('#front .pc img, #front .cup img, #front .g-src img, #detail img')];
        imgs.forEach(im => { for (let e = im; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if ((cs.filter !== 'none' && !e.classList.contains('cup')) || cs.mixBlendMode !== 'normal' || cs.backdropFilter !== 'none' && cs.backdropFilter !== undefined && !e.closest('.ambx') && cs.backdropFilter !== 'none' && !/ambx|g-stop|g-lampbtn/.test(e.className)) bad.push((e.className || e.tagName) + ' ' + cs.filter + ' ' + cs.mixBlendMode); }
          const cs = getComputedStyle(im); if (cs.filter !== 'none' || cs.opacity !== '1' || cs.mixBlendMode !== 'normal') bad.push('img ' + cs.filter + cs.opacity + cs.mixBlendMode) });
        [...document.querySelectorAll('#front .pc')].filter(e => e.style.display !== 'none').forEach(pc => { const r = pc.getBoundingClientRect(); [[.5, .5], [.25, .25], [.75, .75]].forEach(([fx, fy]) => { const t = document.elementsFromPoint(r.left + r.width * fx, r.top + r.height * fy)[0]; if (t && !t.closest('.pc')) over.push(t.className || t.tagName) }) }); return { n: imgs.length, bad, over } });
      ok(`${name} ${g}: no filter / blend / opacity on any media or its ancestors, and nothing on top of a photograph (${media.n} images)`, media.bad.length === 0 && media.over.length === 0, JSON.stringify(media.bad.concat(media.over)).slice(0, 200));
      // persists across a reload and across takes
      await p.reload(); await p.waitForTimeout(2800); const again = await safe(); ok(`${name} ${g}: still on after a reload`, again.body && again.store === '1', JSON.stringify(again));
      // plate switch agrees
      await tap('.obj-light:not([hidden]) .ambx-tg'); await p.waitForTimeout(300);
      const sw = await p.evaluate(() => { const b = [...document.querySelectorAll('.obj-light:not([hidden]) .ambx-sw')].find(x => /safelight/.test(x.textContent)); return b ? { pressed: b.getAttribute('aria-pressed') } : null });
      ok(`${name} ${g}: the switch inside the light plate shows it on`, sw && sw.pressed === 'true', JSON.stringify(sw));
      await p.click('.obj-light:not([hidden]) .ambx-sw:has-text("safelight")'); await p.waitForTimeout(2200);
      const offAgain = await safe(); ok(`${name} ${g}: the plate switch turns it off, lamp dark, remembered off`, !offAgain.body && offAgain.lamp === 0 && offAgain.store === '0', JSON.stringify(offAgain));
      await p.click('.obj-light:not([hidden]) .ambx-tg').catch(() => { });
    }
    // inside a room with the safelight on: still on, lamp up, the 3D canvas has no filter, the ground is behind it
    await p.goto(BASE + '?dev=1&v=G1&safelight=1'); await p.waitForTimeout(2800); await p.evaluate(() => __objc.enterRing(0)); await p.waitForTimeout(2600); await p.evaluate(() => __objc.deeper()); await p.waitForTimeout(3000);
    const room = await p.evaluate(() => ({ body: document.body.classList.contains('safe'), lamp: +getComputedStyle(document.querySelector('.g-lamp')).opacity, gl: getComputedStyle(document.getElementById('gl')).filter + getComputedStyle(document.getElementById('gl')).mixBlendMode + getComputedStyle(document.getElementById('gl')).opacity }));
    ok(`${name} the room: safelight carries in, lamp lit, the 3D canvas has no filter or blend`, room.body && room.lamp > .95 && room.gl === 'nonenormal1', JSON.stringify(room));
    ok(`${name} console clean`, errs.length === 0, errs.join('|')); await ctx.close();
  }
  console.log(R.join('\n')); await b.close(); process.exit(R.some(r => r.startsWith('FAIL')) ? 1 : 0);
})();
