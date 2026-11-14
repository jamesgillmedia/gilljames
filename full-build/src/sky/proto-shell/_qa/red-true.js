/* Red stays true on the pictures.
   Samples photographs, a film still, and track artwork in Night and in Red.
   A small shift is allowed. A wash toward red ink is a failure.
   Chrome (mark, nav label, menu) and one environment pixel (a plan line or
   fibre end, not a photograph) must read as red ink in Red: not warm white,
   not mint. Does not recolour any picture. */
const { chromium } = require('playwright-core');
const { PNG } = require('/tmp/qa/sp2/node_modules/pngjs');

const BASE = 'http://127.0.0.1:8982/';
const CHROME = '/usr/local/bin/google-chrome';
const VIEWS = [
  { name: 'desk', w: 1440, h: 900, phone: false },
  { name: 'phone', w: 390, h: 844, phone: true }
];
const TRACKS = ['sound/mothers-moniker', 'sound/lost-coffee', 'sound/lost-coffee-apple-music', 'sound/waveform'];
const TOL = 18;
const REDDER = 14;
const fails = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function ok(name, cond, extra) {
  const line = (cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : '');
  console.log(line);
  if (!cond) fails.push(line);
}

function fmt(s) {
  return 'rgb(' + [s.r, s.g, s.b].map(v => Math.round(v)).join(',') + ')';
}

function dist(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function isMint(r, g, b) {
  if (Math.abs(r - 85) < 28 && Math.abs(g - 218) < 28 && Math.abs(b - 161) < 28) return true;
  if (Math.abs(r - 191) < 22 && Math.abs(g - 245) < 22 && Math.abs(b - 223) < 22) return true;
  if (g > 160 && g > r + 36 && b > 120 && g + 8 >= b) return true;
  return false;
}

function isWarm(r, g, b) {
  return r > 185 && g > 175 && b > 160 && Math.abs(r - g) < 32 && Math.abs(g - b) < 32;
}

/* Red ink. Warm white and mint are not ink. Glyphs on a dark shadow still count. */
function isRedInk(r, g, b) {
  if (isMint(r, g, b) || isWarm(r, g, b)) return false;
  if (r < 48) return false;
  return r > g + 18 && r > b + 12 && r > g * 1.3 && g < 180 && b < 190;
}

function stats(png, x, y, w, h) {
  x = Math.max(0, x | 0); y = Math.max(0, y | 0);
  w = Math.min(w, png.width - x); h = Math.min(h, png.height - y);
  let r = 0, g = 0, b = 0, n = 0;
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const i = ((y + yy) * png.width + (x + xx)) * 4;
      r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++;
    }
  }
  if (!n) return { r: 0, g: 0, b: 0, std: 0, chroma: 0, n: 0 };
  r /= n; g /= n; b /= n;
  let v = 0;
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const i = ((y + yy) * png.width + (x + xx)) * 4;
      v += (png.data[i] - r) ** 2 + (png.data[i + 1] - g) ** 2 + (png.data[i + 2] - b) ** 2;
    }
  }
  return { r, g, b, std: Math.sqrt(v / n / 3), chroma: Math.max(r, g, b) - Math.min(r, g, b), n };
}

function centerPx(png) {
  return stats(png, (png.width / 2) | 0, (png.height / 2) | 0, 1, 1);
}

function readPng(buf) { return PNG.sync.read(buf); }

async function boot(browser, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    hasTouch: !!vp.phone,
    isMobile: !!vp.phone
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', e => console.log('PAGEERROR ' + vp.name + ' ' + String(e).split('\n')[0]));
  return { ctx, page };
}

async function shot(page, clip) {
  const buf = await page.screenshot({ clip, type: 'png' });
  return readPng(buf);
}

async function setTheme(page, theme) {
  await page.evaluate(t => { if (window.GJ_THEME) GJ_THEME.set(t); }, theme);
  await page.waitForFunction(t => document.documentElement.getAttribute('data-theme') === t, theme, { timeout: 8000 });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await sleep(280);
}

function judgeTrue(night, red) {
  const d = dist(night, red);
  const redder = (red.r - red.g) - (night.r - night.g);
  const washed = isRedInk(red.r, red.g, red.b) && !isRedInk(night.r, night.g, night.b);
  return { d, redder, washed, ok: d <= TOL && redder <= REDDER && !washed };
}

function logPair(tag, where, night, red, verdict) {
  console.log('PIXEL ' + tag + ' ' + where + ' night ' + fmt(night) + ' red ' + fmt(red)
    + ' d=' + verdict.d.toFixed(1) + ' redder=' + verdict.redder.toFixed(1)
    + (verdict.washed ? ' WASH' : ''));
}

async function gotoSky(page) {
  const t = Date.now();
  await page.goto(BASE + 'fable-m4/?sky=1&theme=night&t=' + t + '#/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.__u1 && __u1.ready && document.querySelector('#crumb .sig'), null, { timeout: 20000 });
  await sleep(400);
}

async function trackBox(page, vp) {
  for (let n = 0; n < 24; n++) {
    const hit = await page.evaluate(ids => {
      const cam = window.__depth && __depth.state && __depth.state().cam;
      const view = window.__depth && __depth.state && __depth.state().view;
      if (!cam || !view || !window.__u1) return null;
      for (let i = 0; i < ids.length; i++) {
        const it = __u1.byId(ids[i]);
        if (!it || !it._im || !it.ld || !it._im.naturalWidth) continue;
        const x = (it.sx - cam.x) * cam.s + view[0] / 2;
        const y = (it.sy - cam.y) * cam.s + view[1] / 2;
        if (x < 20 || y < 70 || x > innerWidth - 20 || y > innerHeight - 40) continue;
        return { id: ids[i], x, y };
      }
      return null;
    }, TRACKS);
    if (hit) {
      const clip = {
        x: Math.max(0, Math.round(hit.x - 6)),
        y: Math.max(0, Math.round(hit.y - 6)),
        width: 12,
        height: 12
      };
      if (clip.x + clip.width <= vp.w && clip.y + clip.height <= vp.h) return { id: hit.id, at: hit, clip };
    }
    await sleep(250);
  }
  return null;
}

async function chromeBox(page, sel) {
  const box = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return null;
    const cs = getComputedStyle(el);
    return { x: r.x, y: r.y, w: r.width, h: r.height, color: cs.color, text: (el.textContent || '').trim().slice(0, 40) };
  }, sel);
  if (!box) return null;
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  const width = Math.max(2, Math.min(220, Math.ceil(box.w)));
  const height = Math.max(2, Math.min(48, Math.ceil(box.h)));
  return { clip: { x, y, width, height }, color: box.color, text: box.text };
}

/* Lit pixels of a chrome chip are the glyph. The dark ground and the text-shadow stay out. */
function glyph(png) {
  const lit = [];
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
    if (r + g + b > 70) lit.push([r, g, b]);
  }
  const px = lit.length >= 6 ? lit : (() => {
    const all = [];
    for (let i = 0; i < png.data.length; i += 4) all.push([png.data[i], png.data[i + 1], png.data[i + 2]]);
    all.sort((a, b) => (b[0] + b[1] + b[2]) - (a[0] + a[1] + a[2]));
    return all.slice(0, Math.max(6, Math.floor(all.length * 0.06)));
  })();
  let r = 0, g = 0, b = 0;
  for (const p of px) { r += p[0]; g += p[1]; b += p[2]; }
  return { r: r / px.length, g: g / px.length, b: b / px.length, n: px.length };
}

function parseColor(c) {
  const m = String(c || '').match(/[\d.]+/g);
  if (!m || m.length < 3) return null;
  return { r: +m[0], g: +m[1], b: +m[2] };
}

async function sampleChrome(page, tag, sel, label) {
  const box = await chromeBox(page, sel);
  if (!box) { ok(tag + ' ' + label + ' present', false, 'missing ' + sel); return; }
  const png = await shot(page, box.clip);
  const g = glyph(png);
  const mid = centerPx(png);
  const computed = parseColor(box.color);
  const ink = isRedInk(g.r, g.g, g.b);
  const warm = isWarm(g.r, g.g, g.b);
  const mint = isMint(g.r, g.g, g.b);
  const compOk = computed && isRedInk(computed.r, computed.g, computed.b);
  console.log('PIXEL ' + tag + ' ' + label + ' box ' + box.clip.x + ',' + box.clip.y
    + ' ' + box.clip.width + 'x' + box.clip.height
    + ' glyph ' + fmt(g) + ' n=' + g.n + ' center ' + fmt(mid)
    + ' computed ' + (computed ? fmt(computed) : 'none')
    + ' "' + box.text + '"');
  ok(tag + ' ' + label + ' red ink', ink && !warm && !mint && compOk,
    'glyph ' + fmt(g) + (warm ? ' WARM' : '') + (mint ? ' MINT' : '') + (compOk ? '' : ' computed-not-ink'));
}

async function filmStillBox(page, vp) {
  for (let n = 0; n < 24; n++) {
    const box = await page.evaluate(() => {
      const img = document.querySelector('#layer .fp-frame img.on, #layer .fp-frame img.fp-now, #layer .heroframe img');
      if (!img || !img.naturalWidth) return null;
      const r = img.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) return null;
      const cs = getComputedStyle(img);
      if (cs.opacity === '0' || cs.visibility === 'hidden') return null;
      return { x: r.x, y: r.y, w: r.width, h: r.height, src: (img.currentSrc || img.src || '').split('/').slice(-2).join('/') };
    });
    if (box) {
      const insetX = Math.round(box.w * 0.2);
      const insetY = Math.round(box.h * 0.2);
      const clip = {
        x: Math.max(0, Math.round(box.x + insetX)),
        y: Math.max(0, Math.round(box.y + insetY)),
        width: Math.max(16, Math.min(vp.w - 2, Math.round(box.w - insetX * 2))),
        height: Math.max(16, Math.min(vp.h - 2, Math.round(box.h - insetY * 2)))
      };
      if (clip.x + clip.width > vp.w) clip.width = vp.w - clip.x;
      if (clip.y + clip.height > vp.h) clip.height = vp.h - clip.y;
      return { clip, src: box.src };
    }
    await sleep(250);
  }
  return null;
}

async function meanClip(page, clip) {
  const png = await shot(page, clip);
  const s = stats(png, 0, 0, png.width, png.height);
  const c = centerPx(png);
  return { s, c, png };
}

function photoCells(png) {
  const cell = 28, step = 46, found = [];
  for (let y = 0; y + cell < png.height; y += step) {
    for (let x = 0; x + cell < png.width; x += step) {
      const s = stats(png, x, y, cell, cell);
      const mean = (s.r + s.g + s.b) / 3;
      if (s.std < 12 || s.chroma < 14 || mean < 36 || mean > 210) continue;
      if (isRedInk(s.r, s.g, s.b) && s.chroma < 30) continue;
      found.push({ x, y, w: cell, h: cell, s });
    }
  }
  found.sort((a, b) => b.s.std - a.s.std);
  const picked = [];
  for (const c of found) {
    if (picked.some(p => Math.hypot(p.x - c.x, p.y - c.y) < 80)) continue;
    picked.push(c);
    if (picked.length === 3) break;
  }
  return picked;
}

function findEnv(png) {
  const hits = [];
  for (let y = 6; y < png.height - 6; y += 3) {
    for (let x = 6; x < png.width - 6; x += 3) {
      const i = (y * png.width + x) * 4;
      const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
      if (!isRedInk(r, g, b) || r < 130) continue;
      let red = 0, dark = 0, n = 0, sr = 0, sg = 0, sb = 0;
      for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
          const j = ((y + dy) * png.width + (x + dx)) * 4;
          const R = png.data[j], G = png.data[j + 1], B = png.data[j + 2];
          n++; sr += R; sg += G; sb += B;
          if (isRedInk(R, G, B)) red++;
          else if (R < 42 && G < 42 && B < 42) dark++;
        }
      }
      const mean = (sr + sg + sb) / n / 3;
      const std = stats(png, x - 5, y - 5, 11, 11).std;
      /* A line or a fibre end: a little red ink on a dark ground, not a filled photograph. */
      if (dark >= 36 && red >= 2 && red <= 26 && mean < 90 && std < 55) hits.push({ x, y, r, g, b, red, dark, std });
    }
  }
  hits.sort((a, b) => (b.r - b.g) - (a.r - a.g));
  return hits.slice(0, 8);
}

async function runView(browser, vp) {
  const tag = vp.name;
  const { ctx, page } = await boot(browser, vp);
  try {
    await gotoSky(page);
    await setTheme(page, 'night');
    const track = await trackBox(page, vp);
    let trackNight = null, trackRed = null;
    if (!track) ok(tag + ' track artwork found', false, 'no loaded artwork on the sky');
    else {
      trackNight = await meanClip(page, track.clip);
      console.log('PIXEL ' + tag + ' track-art ' + track.id + ' at ' + Math.round(track.at.x) + ',' + Math.round(track.at.y)
        + ' clip ' + track.clip.x + ',' + track.clip.y + ' night ' + fmt(trackNight.s) + ' center ' + fmt(trackNight.c));
      const star = isWarm(trackNight.s.r, trackNight.s.g, trackNight.s.b) || (trackNight.s.r + trackNight.s.g + trackNight.s.b) / 3 < 18;
      ok(tag + ' track artwork is a picture', !star, fmt(trackNight.s));
    }
    await setTheme(page, 'red');
    if (track) {
      trackRed = await meanClip(page, track.clip);
      const verdict = judgeTrue(trackNight.s, trackRed.s);
      logPair(tag, 'track-art center ' + (track.clip.x + 6) + ',' + (track.clip.y + 6), trackNight.c, trackRed.c, judgeTrue(trackNight.c, trackRed.c));
      logPair(tag, 'track-art mean', trackNight.s, trackRed.s, verdict);
      ok(tag + ' track artwork true', verdict.ok, 'd=' + verdict.d.toFixed(1));
    }
    const themeNow = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    ok(tag + ' red is on for chrome', themeNow === 'red', themeNow);
    await sampleChrome(page, tag, '#crumb .sig', 'mark');
    await sampleChrome(page, tag, '#where', 'nav');
    await page.evaluate(() => { if (window.GJ_MARKMENU) GJ_MARKMENU.show(true); });
    await page.waitForFunction(() => {
      const m = document.getElementById('markmenu');
      return m && !m.hidden && m.classList.contains('mm-in');
    }, null, { timeout: 5000 });
    await sleep(720);
    await sampleChrome(page, tag, '#markmenu .mm-rooms', 'menu');
    await page.evaluate(() => { if (window.GJ_MARKMENU) GJ_MARKMENU.show(false); });
    await sleep(200);

    await page.goto(BASE + 'fable-m4/?sky=1&t=' + Date.now() + '#film/one-with-the-devil', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('#layer .fp-frame img, #layer .heroframe img'), null, { timeout: 20000 });
    const still = await filmStillBox(page, vp);
    if (!still) ok(tag + ' film still found', false, 'no still');
    else {
      await setTheme(page, 'night');
      const night = await meanClip(page, still.clip);
      await setTheme(page, 'red');
      const red = await meanClip(page, still.clip);
      const verdict = judgeTrue(night.s, red.s);
      console.log('PIXEL ' + tag + ' film-still ' + still.src + ' clip ' + still.clip.x + ',' + still.clip.y
        + ' ' + still.clip.width + 'x' + still.clip.height);
      logPair(tag, 'film-still center ' + (still.clip.x + (still.clip.width / 2 | 0)) + ',' + (still.clip.y + (still.clip.height / 2 | 0)), night.c, red.c, judgeTrue(night.c, red.c));
      logPair(tag, 'film-still mean', night.s, red.s, verdict);
      ok(tag + ' film still true', verdict.ok && night.s.std > 6, 'd=' + verdict.d.toFixed(1) + ' std=' + night.s.std.toFixed(1));
    }

    await setTheme(page, 'night');
    await page.goto(BASE + 'spaces/forest-garden/?t=' + Date.now() + '#trees', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.__se && window.GJ_THEME, null, { timeout: 25000 });
    await page.evaluate(() => { if (window.__se && __se.setDay) __se.setDay(0, false); });
    await sleep(600);
    const region = {
      x: 16,
      y: Math.min(120, vp.h - 200),
      width: vp.w - 32,
      height: Math.max(120, vp.h - 230)
    };
    if (region.y + region.height > vp.h) region.height = vp.h - region.y;
    await setTheme(page, 'night');
    await sleep(700);
    const photoNight = await shot(page, region);
    const cells = photoCells(photoNight);
    console.log('PIXEL ' + tag + ' photo region ' + region.x + ',' + region.y + ' ' + region.width + 'x' + region.height + ' cells ' + cells.length);
    await setTheme(page, 'red');
    await sleep(700);
    const photoRed = await shot(page, region);
    if (cells.length < 1) ok(tag + ' photographs found', false, 'no textured colour in the garden');
    cells.forEach((cell, i) => {
      const red = stats(photoRed, cell.x, cell.y, cell.w, cell.h);
      const nightC = stats(photoNight, cell.x + (cell.w / 2 | 0), cell.y + (cell.h / 2 | 0), 1, 1);
      const redC = stats(photoRed, cell.x + (cell.w / 2 | 0), cell.y + (cell.h / 2 | 0), 1, 1);
      const verdict = judgeTrue(cell.s, red);
      const ax = region.x + cell.x + (cell.w / 2 | 0);
      const ay = region.y + cell.y + (cell.h / 2 | 0);
      logPair(tag, 'photo-' + (i + 1) + ' ' + ax + ',' + ay, nightC, redC, judgeTrue(nightC, redC));
      logPair(tag, 'photo-' + (i + 1) + ' mean', cell.s, red, verdict);
      ok(tag + ' photo-' + (i + 1) + ' true', verdict.ok, 'd=' + verdict.d.toFixed(1) + ' at ' + ax + ',' + ay);
    });

    const themeRed = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    ok(tag + ' red is on for the garden', themeRed === 'red', themeRed);
    await page.evaluate(() => { if (window.__se && __se.jump) __se.jump(6); });
    await sleep(900);
    let envClip = { x: 8, y: 96, width: vp.w - 16, height: Math.max(80, vp.h - 180) };
    if (envClip.y + envClip.height > vp.h) envClip.height = vp.h - envClip.y;
    let redEnv = await shot(page, envClip);
    let hits = findEnv(redEnv);
    if (!hits.length) {
      await page.evaluate(() => { if (window.__se && __se.jump) __se.jump(8); });
      await sleep(900);
      redEnv = await shot(page, envClip);
      hits = findEnv(redEnv);
      console.log('PIXEL ' + tag + ' env scanned under (stop 8) hits ' + hits.length);
    } else console.log('PIXEL ' + tag + ' env scanned lens (stop 6) hits ' + hits.length);
    await setTheme(page, 'night');
    await sleep(500);
    const nightEnv = await shot(page, envClip);
    const tops = await page.evaluate(pts => pts.map(p => {
      const el = document.elementFromPoint(p.x, p.y);
      return el ? (el.id ? '#' + el.id : el.tagName.toLowerCase()) : 'none';
    }), hits.map(h => ({ x: envClip.x + h.x, y: envClip.y + h.y })));
    let chosen = null;
    for (let i = 0; i < hits.length; i++) {
      const h = hits[i];
      const n = stats(nightEnv, h.x, h.y, 1, 1);
      const nb = stats(nightEnv, h.x - 5, h.y - 5, 11, 11);
      const photo = nb.std > 18 && nb.chroma > 20 && (nb.r + nb.g + nb.b) / 3 > 40;
      if (isRedInk(n.r, n.g, n.b)) continue;
      if (photo) continue;
      if (tops[i] !== '#c') continue;
      chosen = { h, n, top: tops[i] };
      break;
    }
    if (!chosen) {
      ok(tag + ' environment red ink', false, 'no plan line or fibre end read as red ink');
      const probe = stats(redEnv, (redEnv.width / 2) | 0, (redEnv.height / 2) | 0, 1, 1);
      console.log('PIXEL ' + tag + ' env miss center ' + fmt(probe));
    } else {
      const ax = envClip.x + chosen.h.x, ay = envClip.y + chosen.h.y;
      console.log('PIXEL ' + tag + ' env ' + ax + ',' + ay + ' on ' + chosen.top
        + ' night ' + fmt(chosen.n)
        + ' red rgb(' + chosen.h.r + ',' + chosen.h.g + ',' + chosen.h.b + ')'
        + ' neighbours red=' + chosen.h.red + ' dark=' + chosen.h.dark);
      const ink = isRedInk(chosen.h.r, chosen.h.g, chosen.h.b);
      const warm = isWarm(chosen.h.r, chosen.h.g, chosen.h.b);
      const mint = isMint(chosen.h.r, chosen.h.g, chosen.h.b);
      ok(tag + ' environment red ink', ink && !warm && !mint,
        'at ' + ax + ',' + ay + ' rgb(' + chosen.h.r + ',' + chosen.h.g + ',' + chosen.h.b + ')');
    }
  } finally {
    await ctx.close();
  }
}

(async () => {
  const only = process.argv[2];
  const views = VIEWS.filter(v => !only || v.name === only);
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });
  try {
    for (const vp of views) await runView(browser, vp);
  } finally {
    await browser.close();
  }
  console.log(fails.length ? 'RED TRUE FAIL ' + fails.length : 'RED TRUE PASS');
  if (fails.length) fails.forEach(f => console.log('  ' + f));
  process.exit(fails.length ? 1 : 0);
})().catch(err => {
  console.error('RED TRUE ERROR', err && err.stack || err);
  process.exit(1);
});
