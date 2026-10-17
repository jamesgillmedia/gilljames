// usage: node shoot.cjs out.png "query" width height [waitms]
const { chromium } = require('/workspace/.rnt-tools/pw/node_modules/playwright');
(async () => {
  const jobs = JSON.parse(process.argv[2]);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const j of jobs) {
    const ctx = await browser.newContext({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: j.dpr || 1 });
    const page = await ctx.newPage();
    const errs = []; page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    const t0 = Date.now();
    await page.goto('http://localhost:8766/pavilion-pod/model/' + j.q, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready, null, { timeout: 60000 }).catch(e => errs.push('notready'));
    const tReady = Date.now() - t0;
    if (j.click) for (const c of j.click) { await page.click(c); await page.waitForTimeout(j.clickWait || 300); }
    await page.waitForTimeout(j.wait || 1500);
    await page.screenshot({ path: j.out });
    console.log(j.out, 'ready ms', tReady, errs.slice(0, 5).join(' | '));
    await ctx.close();
  }
  await browser.close();
})();
