"""Headless QA for inside/: iPhone 390x844 and desktop 1440x900, Reduce Motion on and off.
Logs console errors and any failed / 4xx request, saves screenshots to inside/_qa/shots/ (or argv[2]).
usage: python3 qa.py [base_url] [out_dir] [quick]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/inside/'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'shots')
QUICK = len(sys.argv) > 3
os.makedirs(OUT, exist_ok=True)
CHROME = '/usr/local/bin/google-chrome'

async def touch_pinch(cdp, cx, cy, d0, d1, steps=10):
    pts = lambda d: [{'x': cx - d / 2, 'y': cy, 'id': 1}, {'x': cx + d / 2, 'y': cy, 'id': 2}]
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': pts(d0)})
    for i in range(1, steps + 1):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': pts(d0 + (d1 - d0) * i / steps)})
        await asyncio.sleep(0.016)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})

async def touch_drag(cdp, x0, y0, x1, y1, steps=12):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0, 'id': 1}]})
    for i in range(1, steps + 1):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / steps, 'y': y0 + (y1 - y0) * i / steps, 'id': 1}]})
        await asyncio.sleep(0.016)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})

async def touch_tap(cdp, x, y):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y, 'id': 1}]})
    await asyncio.sleep(0.05)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})

async def state(pg):
    return await pg.evaluate("()=>{const I=window.__inside;return I?{lv:I.ST.lv,k:I.ST.k,id:I.ST.id,hash:location.hash,dist:Math.round(I.cam.dist)}:null}")

async def scr(pg, cx, cy):
    """screen position of a world point"""
    return await pg.evaluate("([x,y,z])=>{const I=window.__inside,v=new I.camera.position.constructor(x,y,z).project(I.camera);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]}", [cx, cy, 0])

async def run(p, name, vp, mobile, rm, log):
    b = await p.chromium.launch(executable_path=CHROME, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mobile else 1, has_touch=mobile, is_mobile=mobile, reduced_motion='reduce' if rm else 'no-preference')
    pg = await ctx.new_page()
    errs, bad = [], []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('requestfailed', lambda r: bad.append('failed ' + r.url + ' ' + str(r.failure)) if 'inside/' in r.url or 'u4-opus-m4' in r.url else None)
    pg.on('response', lambda r: bad.append(str(r.status) + ' ' + r.url) if r.status >= 400 else None)
    tag = f"{name}{'-rm' if rm else ''}"
    res = {'run': tag, 'steps': []}
    async def shot(n):
        await pg.screenshot(path=os.path.join(OUT, f'{tag}-{n}.png'))
    async def note(n):
        s = await state(pg); res['steps'].append([n, s]); return s
    await pg.goto(BASE)
    await pg.wait_for_timeout(4500)
    await note('far'); await shot('01-far')
    W, H = vp['width'], vp['height']
    if mobile:
        cdp = await ctx.new_cdp_session(pg)
        await touch_drag(cdp, W * .7, H * .5, W * .3, H * .45)
        await pg.wait_for_timeout(300); await shot('02-drift')
        await pg.wait_for_timeout(1200); await note('after-drift')
        await touch_pinch(cdp, W / 2, H / 2, 80, 240)
        await pg.wait_for_timeout(1500); await note('pinched'); await shot('03-pinched')
    else:
        await pg.mouse.move(W * .6, H * .5); await pg.mouse.down(); await pg.mouse.move(W * .4, H * .45, steps=12); await pg.mouse.up()
        await pg.wait_for_timeout(300); await shot('02-drift')
        await pg.wait_for_timeout(1200)
        for i in range(6):
            await pg.mouse.wheel(0, -120); await pg.wait_for_timeout(40)
        await pg.wait_for_timeout(1500); await note('wheeled'); await shot('03-pinched')
    if not QUICK:
        await pg.evaluate("()=>window.__inside.home()"); await pg.wait_for_timeout(1500)
        for k in ['film', 'objects']:
            await pg.evaluate(f"()=>window.__inside.go({{lv:1,k:'{k}'}})"); await pg.wait_for_timeout(1600)
            await note('ch-' + k); await shot('04-' + k)
        await pg.evaluate("()=>window.__inside.go({lv:2,k:'objects'})"); await pg.wait_for_timeout(2200)
        await note('board'); await shot('05-board')
        await pg.evaluate("()=>window.__inside.go({lv:3,k:'objects',id:'objects/joio-co-cup'})"); await pg.wait_for_timeout(1800)
        await note('piece'); await shot('06-piece')
        await pg.evaluate("()=>window.__inside.go({lv:4,k:'objects',id:'objects/joio-co-cup'})"); await pg.wait_for_timeout(700)
        await shot('07-entering'); await pg.wait_for_timeout(2200)
        await note('inside'); await shot('08-inside')
        if mobile:
            await touch_drag(cdp, W * .7, H * .5, W * .2, H * .5); await pg.wait_for_timeout(900); await shot('09-inside-look')
            await touch_pinch(cdp, W / 2, H / 2, 260, 60); await pg.wait_for_timeout(700)
        else:
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(700)
        await shot('10-leaving'); await pg.wait_for_timeout(1800)
        await note('back-to-piece'); await shot('11-back')
        for i in range(3):
            await pg.go_back(); await pg.wait_for_timeout(1500); await note('back%d' % i)
        await shot('12-far-again')
    res['errors'] = errs; res['bad'] = bad
    log.append(res)
    await b.close()

async def main():
    log = []
    async with async_playwright() as p:
        for rm in (False, True):
            await run(p, 'iphone', {'width': 390, 'height': 844}, True, rm, log)
            await run(p, 'desktop', {'width': 1440, 'height': 900}, False, rm, log)
    print(json.dumps(log, indent=1))
    with open(os.path.join(OUT, 'qa-log.json'), 'w') as f: json.dump(log, f, indent=1)

if __name__ == "__main__": asyncio.run(main())
