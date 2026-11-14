/* Night chrome accent gate. Samples nav, mark, active labels, toggle dots and
   dial dots in the sky, Film, Sound, Objects, Photo, About and Spaces.
   Fails if a chrome pixel is mint or teal. Does not sample the WebGL canvas
   or photographs. Also writes one Night screenshot per room, phone and desktop. */
const { chromium } = require('playwright-core');
const { PNG } = require('/tmp/qa/sp2/node_modules/pngjs');
const fs = require('fs');

const BASE = 'http://127.0.0.1:8982/';
const CHROME = '/usr/local/bin/google-chrome';
const WARM = 'rgb(232, 228, 220)';
const SHOTS = '/opt/cursor/artifacts';
const fails = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function ok(name, cond, extra) {
  const line = (cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : '');
  console.log(line);
  if (!cond) fails.push(line);
}

function isMint(r, g, b, a) {
  if (a < 40) return false;
  if (Math.abs(r - 85) < 28 && Math.abs(g - 218) < 28 && Math.abs(b - 161) < 28) return true;
  if (Math.abs(r - 191) < 22 && Math.abs(g - 245) < 22 && Math.abs(b - 223) < 22) return true;
  /* Gap is a little past 30 so a still bleeding through a translucent plate (g-r ≈ 30) is not chrome. #55DAA1 and #bff5df stay well above it, and the near-hex tests above catch them on their own. */
  if (g > 160 && g > r + 36 && b > 120 && g + 8 >= b) return true;
  /* Pale blue glow that read as teal on the old dial dot (rgba(190,225,255)). Blue has to lead green, so a grey-green still does not match. */
  if (g > 180 && b > g + 15 && r < g - 20 && r > 140) return true;
  return false;
}

function scan(buf) {
  const png = PNG.sync.read(buf);
  const hits = [];
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2], a = png.data[i + 3];
    if (!isMint(r, g, b, a)) continue;
    hits.push(r + ',' + g + ',' + b);
    if (hits.length > 6) break;
  }
  return hits;
}

async function boot(vw, vh, phone) {
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });
  const ctx = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: phone ? 2 : 1,
    hasTouch: !!phone,
    isMobile: !!phone
  });
  const page = await ctx.newPage();
  return { browser, page };
}

async function cssOf(page, sel, prop, pseudo) {
  return page.evaluate(({ sel, prop, pseudo }) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el, pseudo || null);
    const box = el.getBoundingClientRect();
    return { v: cs[prop], text: (el.textContent || '').trim().slice(0, 80), w: box.width, h: box.height };
  }, { sel, prop, pseudo });
}

async function paint(page, sel, pseudo) {
  const box = await page.evaluate(({ sel, pseudo }) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const rail = el.closest('#wrail');
    if (rail) {
      const ol = rail.querySelector('ol');
      if (ol) ol.style.background = '#04070b';
      /* The film sheet sits over the rail on a phone. Hide it for the sample so a still is not read as chrome. */
      const layer = document.getElementById('layer');
      if (layer) layer.style.visibility = 'hidden';
      const cv = document.getElementById('cv');
      if (cv) cv.style.visibility = 'hidden';
    }
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    if (pseudo) {
      const cs = getComputedStyle(el, '::before');
      const w = parseFloat(cs.width) || 7, h = parseFloat(cs.height) || 7;
      return { x: Math.max(0, r.x + 4), y: Math.max(0, r.y + (r.height - h) / 2), width: Math.max(1, w + 4), height: Math.max(1, h + 4) };
    }
    return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.width, 220), height: Math.min(r.height, 48) };
  }, { sel, pseudo: pseudo || null });
  if (!box || box.width < 1 || box.height < 1) return ['missing'];
  const buf = await page.screenshot({ clip: box, type: 'png' });
  await page.evaluate(() => {
    const layer = document.getElementById('layer');
    if (layer) layer.style.visibility = '';
    const cv = document.getElementById('cv');
    if (cv) cv.style.visibility = '';
  });
  return scan(buf);
}

async function expectWarm(page, name, sel, prop, pseudo) {
  const got = await cssOf(page, sel, prop, pseudo);
  ok(name + ' computed', !!(got && got.v === WARM), got ? got.v + ' "' + got.text + '"' : 'missing ' + sel);
  const hits = await paint(page, sel, pseudo);
  ok(name + ' pixels', hits.length === 0, hits.join(' '));
}

async function shot(page, tag, room) {
  const name = room + '-' + (tag === 'phone' ? 'phone' : 'desktop') + '.png';
  await page.screenshot({ path: SHOTS + '/' + name, type: 'png' });
  console.log('SHOT ' + name);
}

async function togoOpacity(page, name) {
  const v = await page.evaluate(() => {
    const el = document.getElementById('togo');
    if (!el) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return null;
    const canvas = el.querySelector('canvas');
    const span = el.querySelector('span');
    return {
      op: cs.opacity,
      canvas: canvas ? getComputedStyle(canvas).opacity : null,
      span: span ? getComputedStyle(span).opacity : null
    };
  });
  if (!v) { console.log('SKIP ' + name + ' togo hidden'); return; }
  ok(name + ' togo opacity', v.op === '1' && v.canvas === '1' && v.span === '1', JSON.stringify(v));
}

async function sky(page, tag) {
  const t = Date.now();
  await page.goto(BASE + 'fable-m4/?sky=1&t=' + t + '#/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    const w = document.querySelector('#where');
    const sig = document.querySelector('#crumb .sig');
    return w && sig && /sky/i.test(w.textContent || '') && sig.getBoundingClientRect().width > 4;
  }, null, { timeout: 20000 });
  await sleep(700);
  await shot(page, tag, 'sky');
  await expectWarm(page, tag + ' sky mark', '#crumb .sig', 'color');
  await expectWarm(page, tag + ' sky where', '#where', 'color');
  await expectWarm(page, tag + ' sky hire', '#hire', 'color');
  await togoOpacity(page, tag + ' sky');
}

async function about(page, tag) {
  const t = Date.now();
  await page.goto(BASE + 'fable-m4/?sky=1&t=' + t + '#about', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    const w = document.querySelector('#where');
    return w && /about/i.test(w.textContent || '');
  }, null, { timeout: 20000 });
  await sleep(800);
  await shot(page, tag, 'about');
  await expectWarm(page, tag + ' about mark', '#crumb .sig', 'color');
  await expectWarm(page, tag + ' about crumb', '#wcrumb b', 'color');
  await expectWarm(page, tag + ' about hire', '#hire', 'color');
  await togoOpacity(page, tag + ' about');
}

async function sound(page, tag) {
  const t = Date.now();
  await page.goto(BASE + 'fable-m4/?sky=1&t=' + t + '#sound', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    const w = document.querySelector('#where');
    return w && /sound/i.test(w.textContent || '');
  }, null, { timeout: 20000 });
  await sleep(800);
  await shot(page, tag, 'sound');
  await expectWarm(page, tag + ' sound mark', '#crumb .sig', 'color');
  await expectWarm(page, tag + ' sound crumb', '#wcrumb b', 'color');
  const rail = await page.locator('#wrail li.here').count();
  if (rail) {
    await expectWarm(page, tag + ' sound rail label', '#wrail li.here', 'color');
    await expectWarm(page, tag + ' sound rail dot', '#wrail li.here', 'backgroundColor', '::before');
  } else console.log('SKIP ' + tag + ' sound rail (not shown at this depth)');
  await page.goto(BASE + 'fable-m4/player/?m4=1&t=' + t, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('.hud .sig') && document.querySelector('#ttl'), null, { timeout: 15000 });
  await sleep(500);
  await expectWarm(page, tag + ' sound player mark', '.hud .sig', 'color');
  await expectWarm(page, tag + ' sound now playing', '#ttl', 'color');
  const dot = await page.locator('.sc-rail .tk.on').count();
  if (dot) await expectWarm(page, tag + ' sound rail dot', '.sc-rail .tk.on', 'backgroundColor');
  else console.log('SKIP ' + tag + ' sound player dot (no track armed)');
}

async function film(page, tag) {
  const t = Date.now();
  await page.goto(BASE + 'fable-m4/?sky=1&t=' + t + '#film/board', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    const h = document.querySelector('#wrail li.here span');
    return h && /board/i.test(h.textContent || '');
  }, null, { timeout: 20000 });
  await sleep(400);
  await expectWarm(page, tag + ' film board label', '#wrail li.here', 'color');
  await expectWarm(page, tag + ' film board dot', '#wrail li.here', 'backgroundColor', '::before');
  await page.goto(BASE + 'fable-m4/?sky=1&t=' + t + '#film/one-with-the-devil', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    const h = document.querySelector('#wrail li.here span');
    return h && /devil/i.test(h.textContent || '');
  }, null, { timeout: 20000 });
  await sleep(500);
  await expectWarm(page, tag + ' film work label', '#wrail li.here', 'color');
  await expectWarm(page, tag + ' film work dot', '#wrail li.here', 'backgroundColor', '::before');
  await expectWarm(page, tag + ' film mark', '#crumb .sig', 'color');
  await expectWarm(page, tag + ' film hire', '#hire', 'color');
  const role = await page.locator('#layer .role').count();
  if (role) await expectWarm(page, tag + ' film role', '#layer .role', 'color');
  await shot(page, tag, 'film');
  await togoOpacity(page, tag + ' film');
}

async function spaces(page, tag) {
  await page.goto(BASE + 'spaces/forest-garden/?t=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('#sphead .sig') && document.querySelector('.ambx-tg i'), null, { timeout: 15000 });
  await sleep(400);
  await expectWarm(page, tag + ' spaces mark', '#sphead .sig', 'color');
  await expectWarm(page, tag + ' spaces crumb', '#sphead .crumb', 'color');
  await expectWarm(page, tag + ' spaces toggle', '.ambx-tg i', 'backgroundColor');
  await shot(page, tag, 'spaces');
  await page.click('.ambx-tg');
  await page.waitForFunction(() => {
    const b = document.querySelector('.ambx-tg');
    return b && b.getAttribute('aria-expanded') === 'true';
  }, null, { timeout: 5000 });
  await sleep(200);
  await expectWarm(page, tag + ' spaces toggle open', '.ambx-tg i', 'backgroundColor');
}

async function objects(page, tag) {
  await page.goto(BASE + 'objects/?t=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('.ambx-tg i'), null, { timeout: 15000 });
  await sleep(400);
  await expectWarm(page, tag + ' objects toggle', '.ambx.obj-ctl .ambx-tg i, .ambx-tg i', 'backgroundColor');
  await shot(page, tag, 'objects');
  await page.click('.ambx-tg');
  await sleep(250);
  await expectWarm(page, tag + ' objects toggle open', '.ambx-tg[aria-expanded="true"] i', 'backgroundColor');
}

async function photo(page, tag) {
  await page.goto(BASE + 'photo-lab/?t=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('#cam') || document.querySelector('.cb-dial .dot'), null, { timeout: 15000 });
  const has = await page.locator('.cb-dial .dot').count();
  if (!has) {
    await page.click('#cam');
    await page.waitForFunction(() => document.querySelector('.cb-dial .dot'), null, { timeout: 8000 });
  }
  await sleep(300);
  await expectWarm(page, tag + ' photo dial dot', '.cb-dial .dot', 'backgroundColor');
  await shot(page, tag, 'photo');
}

(async () => {
  const desk = await boot(1440, 900, false);
  const phone = await boot(390, 844, true);
  try {
    await sky(desk.page, 'desk');
    await sky(phone.page, 'phone');
    await film(desk.page, 'desk');
    await film(phone.page, 'phone');
    await sound(desk.page, 'desk');
    await sound(phone.page, 'phone');
    await objects(desk.page, 'desk');
    await objects(phone.page, 'phone');
    await photo(desk.page, 'desk');
    await photo(phone.page, 'phone');
    await about(desk.page, 'desk');
    await about(phone.page, 'phone');
    await spaces(desk.page, 'desk');
    await spaces(phone.page, 'phone');
  } finally {
    await desk.browser.close();
    await phone.browser.close();
  }
  console.log(fails.length ? 'GATE FAIL ' + fails.length : 'GATE PASS');
  if (fails.length) process.exit(1);
})().catch(err => {
  console.error('GATE ERROR', err && err.stack || err);
  process.exit(1);
});
