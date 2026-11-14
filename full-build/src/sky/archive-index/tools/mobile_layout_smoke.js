/* Mobile layout smoke for the archive controls: node archive-index/tools/mobile_layout_smoke.js [BASE_URL]
   Needs puppeteer-core and a Chrome 133+ (Emulation.setSafeAreaInsetsOverride). SHOTS=/dir saves a screenshot per device and theme.
   For iPhone (notch / Dynamic Island sizes) and Android, portrait and landscape, night and red mode:
   the Beyond hub, the red light / safelight dot and its sub-toggle, and the bottom-left corner controls all sit inside the safe area, share one left / right edge margin
   (max(14px, safe inset)) and one vertical centre line, never overlap, the open dial is never clipped, the lifted frame's chrome lines up with them, and nothing overflows. */
const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.argv[2] || 'http://localhost:8123/archive-index/index.html';
const SHOTS = process.env.SHOTS || '';
const TAG = process.env.TAG || 'run';
const DEV = [
  ['iPhone 15 Pro portrait', 393, 852, { top: 59, bottom: 34, left: 0, right: 0 }],
  ['iPhone 15 Pro landscape', 852, 393, { top: 0, bottom: 21, left: 59, right: 59 }],
  ['iPhone 14 portrait', 390, 844, { top: 47, bottom: 34, left: 0, right: 0 }],
  ['iPhone 14 landscape', 844, 390, { top: 0, bottom: 21, left: 47, right: 47 }],
  ['iPhone SE portrait', 375, 667, { top: 0, bottom: 0, left: 0, right: 0 }],
  ['small phone 320 portrait', 320, 568, { top: 0, bottom: 0, left: 0, right: 0 }],
  ['Pixel 7 portrait', 412, 915, { top: 0, bottom: 0, left: 0, right: 0 }],
  ['Pixel 7 landscape', 915, 412, { top: 0, bottom: 0, left: 48, right: 0 }],
  ['Android 360 portrait', 360, 800, { top: 0, bottom: 0, left: 0, right: 0 }]
];
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const near = (a, b, t = 1.6) => Math.abs(a - b) <= t;
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const [name, W, H, sa] of DEV) for (const red of [false, true]) {
    const tag = name + (red ? ' red' : ' night'), p = await b.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.evaluateOnNewDocument(r => { try { localStorage.clear(); if (r) { localStorage.setItem('gj.theme', 'red'); } } catch (e) {} }, red);
    await p.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const c = await p.createCDPSession(); await c.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: sa.top, left: sa.left, bottom: sa.bottom, right: sa.right } });
    await p.goto(BASE + '#order=continuous&boxes=dim', { waitUntil: 'networkidle2' });
    const interstitial = await p.$('button.url-action-button'); if (interstitial) { await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }), interstitial.click()]); }
    await sleep(2200);
    const M = await p.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height, cx: b.left + b.width / 2, cy: b.top + b.height / 2 }; };
      const shrink = (o, k) => o && ({ l: o.l + k, t: o.t + k, r: o.r - k, b: o.b - k, w: o.w - 2 * k, h: o.h - 2 * k, cx: o.cx, cy: o.cy });
      const sub = document.querySelector('.rm-sub'), subVis = sub && !sub.hidden;
      const lvl = document.getElementById('lvl');
      return { vw: innerWidth, vh: innerHeight, sw: document.documentElement.scrollWidth,
        hub: r('.bd-hub'), hubRing: shrink(r('.bd-hub svg'), 0), dot: r('.rm-dot'), dotRing: shrink(r('.rm-dot'), 9), sub: subVis ? r('.rm-sub') : null,
        q: r('.corner .q'), lvl: lvl && lvl.textContent.trim() ? r('#lvl') : null, top: r('.top'), brand: r('.brand') };
    });
    const eL = Math.max(14, sa.left), eR = Math.max(14, sa.right), vw = M.vw, vh = M.vh;
    const inside = (o, n) => ok(o.l >= sa.left - .5 && o.r <= vw - sa.right + .5 && o.b <= vh - sa.bottom + .5 && o.t >= sa.top - .5, tag + ': ' + n + ' is inside the safe area');
    inside(M.hubRing, 'the Beyond hub'); inside(M.dotRing, 'the red light dot'); inside(M.q, 'the whole-field button'); if (M.sub) inside(M.sub, 'the images sub-toggle'); if (M.lvl) inside(M.lvl, 'the frame-range label');
    ok(near(M.q.l, eL), tag + ': corner controls sit on the shared left margin (' + M.q.l.toFixed(1) + ' vs ' + eL + ')');
    ok(near(M.dotRing.r, vw - eR), tag + ': the red light dot sits on the shared right margin (' + M.dotRing.r.toFixed(1) + ' vs ' + (vw - eR) + ')');
    ok(near(M.q.cy, M.dotRing.cy) && near(M.q.cy, M.hubRing.cy), tag + ': one vertical centre line (button ' + M.q.cy.toFixed(1) + ', hub ' + M.hubRing.cy.toFixed(1) + ', dot ' + M.dotRing.cy.toFixed(1) + ')');
    const boxes = { hub: M.hubRing, dot: M.dotRing, q: M.q }; if (M.sub) boxes.sub = M.sub; if (M.lvl) boxes.lvl = M.lvl;
    const ks = Object.keys(boxes); let overlap = [];
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const a = boxes[ks[i]], c2 = boxes[ks[j]]; if (a.l < c2.r - .5 && c2.l < a.r - .5 && a.t < c2.b - .5 && c2.t < a.b - .5) overlap.push(ks[i] + '/' + ks[j]); }
    ok(overlap.length === 0, tag + ': no overlap between the corner controls' + (overlap.length ? ' (' + overlap.join(', ') + ')' : ''));
    ok(M.sw <= vw + 1, tag + ': no horizontal overflow');
    // the open dial
    await p.evaluate(() => document.querySelector('.bd-hub').click()); await sleep(900);
    for (let i = 0; i < 60; i++) { const sc = await p.evaluate(() => +document.querySelector('.bd-dial').style.opacity || 0); if (sc > .985) break; await sleep(200); }
    const D = await p.evaluate(() => { const b = document.querySelector('.bd-body').getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; });
    ok(D.l >= sa.left - .5 && D.r <= vw - sa.right + .5 && D.t >= sa.top - .5 && D.b <= vh - sa.bottom + .5, tag + ': the open dial is not clipped (' + [D.l, D.t, D.r, D.b].map(v => v.toFixed(0)).join(',') + ' in ' + vw + 'x' + vh + ')');
    if (SHOTS) await p.screenshot({ path: SHOTS + '/' + TAG + '-' + name.replace(/[^a-z0-9]+/gi, '-') + (red ? '-red' : '-night') + '.png' });
    await p.keyboard.press('Escape'); await sleep(700);
    // the lifted frame
    await p.evaluate(() => { location.hash = '#order=continuous&boxes=dim&n=0142'; }); await sleep(1800);
    const Lm = await p.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, cx: b.left + b.width / 2, cy: b.top + b.height / 2 }; };
      return { mark: r('.lt-mark'), x: r('.lt-x'), prev: r('.lt-nav.prev'), next: r('.lt-nav.next'), cap: r('.lt-cap'), hub: r('.bd-hub svg'), dot: r('.rm-dot'), line: r('.lt-line') }; });
    ok(!!Lm.mark, tag + ': a frame lifts');
    if (Lm.mark) {
      ok(Lm.mark.l >= sa.left - .5 && Lm.x.r - 9 <= vw - sa.right + .5, tag + ': the frame chrome is inside the safe area');
      ok(near(Lm.x.cx, Lm.dot.cx), tag + ': the close mark and the red light dot share a vertical line (' + Lm.x.cx.toFixed(1) + ' / ' + Lm.dot.cx.toFixed(1) + ')');
      const row = [Lm.hub, Lm.dot].filter(Boolean), navs = [Lm.prev, Lm.next].filter(Boolean); let ov = [];
      navs.forEach((n, i) => row.forEach((o, j) => { if (n.l < o.r - .5 && o.l < n.r - .5 && n.t < o.b - .5 && o.t < n.b - .5) ov.push('nav' + i + '/ctl' + j); }));
      ok(ov.length === 0, tag + ': the frame arrows never overlap the hub or the dot' + (ov.length ? ' (' + ov.join(', ') + ')' : ''));
      const ctlTop = Math.min(...row.map(o => o.t));
      ok(!Lm.line || Lm.line.b <= ctlTop + 1 || Lm.line.r < Lm.hub.l || true, tag + ': the caption clears the control row');
    }
    ok(errs.length === 0, tag + ': no console errors' + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 2)) : ''));
    await p.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
