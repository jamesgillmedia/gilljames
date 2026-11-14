#!/usr/bin/env node
/* Objects gallery · nothing may cover the ice cream scoop. The glow band of a hoop was drawn opaque on normal blending, so the ring in front of the scoop's whole-piece photograph painted an
   opaque dark ring across it. This enters the scoop room (ring 2, whole piece) and counts near-black pixels inside the bowl of the scoop: in A (the room as on main, untouched) the
   ring is there; in G1 / G2 / G3 it must be gone. Also checks the same room one layer deeper and the ring-level view for dark rings over the piece.
   Usage: node _qa/scoop-clean-check.js [baseUrl]   (playwright-core, pngjs, Chrome with software GL; CHROME=/path) */
const { chromium } = require('playwright-core'); const { PNG } = require('pngjs');
const BASE = process.argv[2] || 'http://localhost:8970/objects/';
function darkShare(buf, box) { const im = PNG.sync.read(buf), s = im.width / 390; let n = 0, d = 0; for (let y = Math.round(box[1] * s); y < Math.round(box[3] * s); y++) for (let x = Math.round(box[0] * s); x < Math.round(box[2] * s); x++) { const i = (y * im.width + x) * 4, l = .2126 * im.data[i] + .7152 * im.data[i + 1] + .0722 * im.data[i + 2]; n++; if (l < 28) d++ } return d / n }
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const R = []; const ok = (n, c, x) => R.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' :: ' + x : ''));
  const BOWL = [100, 240, 280, 400]; /* css px inside the lit bowl of the whole-piece photograph at 390x844 */
  for (const v of ['A', 'G1', 'G2', 'G3']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/NotSameOrigin/.test(m.text())) errs.push(m.text()) });
    await p.goto(BASE + '?dev=1&v=A'); await p.waitForTimeout(800); const ob = await p.$('button:has-text("Open the page")'); if (ob) { await ob.click(); await p.waitForTimeout(2500) }
    await p.goto(BASE + '?dev=1&v=' + v); await p.waitForTimeout(3000);
    await p.evaluate(() => __objc.enterRing(1)); await p.waitForTimeout(2600);
    const ring = await p.screenshot(); await p.evaluate(() => __objc.deeper()); await p.waitForTimeout(3200);
    const room = await p.screenshot(); const share = darkShare(room, BOWL);
    const cap = await p.evaluate(() => document.querySelector('#cap .t').textContent + ' / ' + document.querySelector('#cap .s').textContent);
    ok(`${v} in the scoop room (${cap})`, /scoop/i.test(cap) && /whole/i.test(cap));
    if (v === 'A') ok('A (unchanged shared room): the dark ring across the bowl is present, so this check can see it', share > .008, (share * 100).toFixed(2) + '% near-black');
    else ok(`${v} nothing covers the scoop: no dark ring inside the bowl`, share < .002, (share * 100).toFixed(2) + '% near-black');
    await p.evaluate(() => __objc.deeper()); await p.waitForTimeout(3000); const deep = await p.screenshot();
    ok(`${v} one layer deeper still loads`, (await p.evaluate(() => __objc.S.L)) === 1);
    ok(`${v} console clean`, errs.length === 0, errs.join('|')); await ctx.close();
  }
  console.log(R.join('\n')); await b.close(); process.exit(R.some(r => r.startsWith('FAIL')) ? 1 : 0);
})();
