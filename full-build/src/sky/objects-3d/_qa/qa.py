"""QA for objects-3d. Serves nothing: start `python3 -m http.server 8765` in the repo root first.
Real input only (CDP touch for pinch/swipe, mouse wheel, keyboard); nothing calls the nav functions.
Writes screenshots to _qa/<viewport>/ and prints a pass/fail table. Run: python3 objects-3d/_qa/qa.py [--video]"""
import sys, os, json, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
URL = 'http://localhost:8765/objects-3d/index.html'
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox']
VIEWPORTS = {'phone-390x844': (390, 844, True), 'landscape-844x390': (844, 390, True), 'desktop-1440x900': (1440, 900, False)}
if os.environ.get('ONLY'): VIEWPORTS = {k: v for k, v in VIEWPORTS.items() if k.startswith(os.environ['ONLY'])}
RESULTS = []
def check(name, ok, detail=''):
    RESULTS.append((name, bool(ok), detail)); print(('PASS ' if ok else 'FAIL ') + name, detail)

class Run:
    def __init__(s, pg, cdp, W, H):
        s.pg, s.cdp, s.W, s.H = pg, cdp, W, H
    def info(s): return s.pg.evaluate('__o3.info()')
    def idle(s, t=6000):
        s.pg.wait_for_function('!__o3.info().busy', timeout=t); s.pg.wait_for_timeout(450)
    def touch(s, typ, pts):
        s.cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': [{'x': x, 'y': y, 'id': i + 1} for i, (x, y) in enumerate(pts)]})
    def pinch(s, out=False, steps=14, gap0=70, gap1=190):
        cx, cy = s.W / 2, s.H / 2
        a, b = (gap1, gap0) if out else (gap0, gap1)
        s.touch('touchStart', [(cx - a / 2, cy), (cx + a / 2, cy)])
        for i in range(1, steps + 1):
            g = a + (b - a) * i / steps; s.touch('touchMove', [(cx - g / 2, cy), (cx + g / 2, cy)]); s.pg.wait_for_timeout(16)
        s.touch('touchEnd', [])
    def swipe(s, dx):
        cx, cy = s.W / 2, s.H / 2
        s.touch('touchStart', [(cx, cy)])
        for i in range(1, 9): s.touch('touchMove', [(cx + dx * i / 8, cy)]); s.pg.wait_for_timeout(16)
        s.touch('touchEnd', [])
    def tap(s):
        s.touch('touchStart', [(s.W / 2, s.H / 2)]); s.pg.wait_for_timeout(40); s.touch('touchEnd', [])
    def wheel(s, dy, n=12):
        s.pg.mouse.move(s.W / 2, s.H / 2)
        for i in range(n): s.pg.mouse.wheel(0, dy); s.pg.wait_for_timeout(16)
    def shot(s, folder, name):
        os.makedirs(os.path.join(HERE, folder), exist_ok=True); s.pg.screenshot(path=os.path.join(HERE, folder, name + '.png'))

def walk_all(r, folder, tag):
    """Visits every stop of both specimens by the keyboard, one Enter each, screenshots each layer's first stop and a few extras."""
    seen = set(); order = []
    def snap():
        i = r.info(); key = (i['spec'], i['layer'], i['i'])
        order.append((i['title'], i['name'], i['i'] + 1, i['cnt']))
        first = i['i'] == 0
        if first or (i['layer'] in ('surface', 'making') and i['i'] in (1, i['cnt'] - 1)):
            r.shot(folder, '%d-%s-%s-%d' % (i['spec'] + 1, i['title'].replace(' ', '-'), i['layer'], i['i'] + 1))
    snap()
    while True:
        i0 = r.info()
        if i0['stop'] == i0['n'] - 1: break
        r.pg.keyboard.press('Enter'); r.idle(); i1 = r.info()
        if i1['stop'] != i0['stop'] + 1: check(tag + ' Enter is exactly one step', False, str((i0['stop'], i1['stop']))); return order
        snap()
    return order

def main():
    video = '--video' in sys.argv or '--video-only' in sys.argv
    if '--video-only' in sys.argv: VIEWPORTS.clear()
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/local/bin/google-chrome', args=ARGS)
        for vname, (W, H, touch) in VIEWPORTS.items():
            for rm in (False, True):
                tag = vname + (' RM' if rm else '')
                ctx = b.new_context(viewport={'width': W, 'height': H}, has_touch=touch, device_scale_factor=2 if touch else 1,
                                    reduced_motion='reduce' if rm else 'no-preference')
                pg = ctx.new_page(); logs = []
                pg.on('console', lambda m: logs.append(m.text) if m.type in ('error', 'warning') else None)
                pg.on('pageerror', lambda e: logs.append('ERR ' + str(e) + ' ' + str(getattr(e, 'stack', ''))[:400]))
                pg.on('response', lambda r: logs.append('HTTP %d %s' % (r.status, r.url)) if r.status >= 400 else None)
                cdp = ctx.new_cdp_session(pg); r = Run(pg, cdp, W, H)
                pg.goto(URL); pg.wait_for_function('window.__o3'); pg.wait_for_timeout(2200); r.idle()
                if not rm:
                    r.shot(vname, '00-first-load')
                    order = walk_all(r, vname, tag)
                    cup = [o for o in order if o[0] == 'joio cup']
                    check(tag + ' cup layers in order', [o[1] for o in cup if o[2] == 1] == ['whole piece', 'surface', 'making', 'use', 'shop'], str([o[1] for o in cup if o[2] == 1]))
                    check(tag + ' cup stop count', len(cup) == 25, str(len(cup)))
                    # back up one at a time, landing on what we came from
                    ok = True
                    for k in range(r.info()['n'] - 1, 0, -1):
                        before = r.info()['stop']; pg.keyboard.press('Escape'); r.idle()
                        if r.info()['stop'] != before - 1: ok = False
                    check(tag + ' Escape up one stop at a time to whole piece', ok and r.info()['stop'] == 0)
                    # Reset checks
                    pg.keyboard.press('Escape'); r.idle(); check(tag + ' up at the top does nothing', r.info()['stop'] == 0)
                    # wheel burst = one step
                    r.wheel(-60); r.idle(); s1 = r.info()['stop']; pg.wait_for_timeout(500)
                    check(tag + ' wheel burst toward = exactly one layer in', s1 == 1, 'stop %d' % s1)
                    r.wheel(60); r.idle(); s2 = r.info()['stop']; pg.wait_for_timeout(500)
                    check(tag + ' wheel burst away = exactly one layer up', s2 == 0, 'stop %d' % s2)
                    # ctrl+wheel (trackpad pinch on desktop)
                    pg.keyboard.down('Control'); r.wheel(-12, 20); pg.keyboard.up('Control'); r.idle(); pg.wait_for_timeout(400)
                    check(tag + ' ctrl+wheel pinch = one step', r.info()['stop'] == 1, str(r.info()['stop']))
                    pg.keyboard.press('Escape'); r.idle()
                    # rapid Enter x4: only the first counts while the move runs
                    for _ in range(4): pg.keyboard.press('Enter'); pg.wait_for_timeout(30)
                    r.idle(); check(tag + ' rapid Enter x4 = one step', r.info()['stop'] == 1, str(r.info()['stop']))
                    pg.keyboard.press('ArrowDown'); r.idle(); pg.keyboard.press('ArrowUp'); r.idle()
                    check(tag + ' ArrowDown / ArrowUp', r.info()['stop'] == 1)
                    pg.keyboard.press('Escape'); r.idle()
                    if touch:
                        r.pinch(); r.idle(); check(tag + ' pinch in = one layer', r.info()['stop'] == 1, str(r.info()['stop']))
                        r.pinch(); r.idle(); check(tag + ' second pinch in = next stop', r.info()['stop'] == 2)
                        r.pinch(out=True); r.idle(); check(tag + ' pinch out = one up', r.info()['stop'] == 1)
                        r.pinch(out=True); r.idle(); check(tag + ' pinch out again = whole piece', r.info()['stop'] == 0)
                        r.tap(); r.idle(); check(tag + ' tap = one layer in', r.info()['stop'] == 1)
                        pg.click('#back'); r.idle(); check(tag + ' Back = one up', r.info()['stop'] == 0)
                    # specimen: swipe or keys
                    if touch:
                        r.swipe(-160); r.idle(); pg.wait_for_timeout(500)
                    else:
                        pg.keyboard.press('ArrowRight'); r.idle(); pg.wait_for_timeout(500)
                    i = r.info(); check(tag + ' one gesture = next specimen (scoop, whole piece)', i['spec'] == 1 and i['stop'] == 0, i['title'])
                    order = walk_all(r, vname, tag)
                    sc = [o for o in order if o[0] == 'ice cream scoop']
                    check(tag + ' scoop layers (making and use skipped)', [o[1] for o in sc if o[2] == 1] == ['whole piece', 'surface', 'shop'], str([o[1] for o in sc if o[2] == 1]))
                    r.shot(vname, '9-shop-slot-scoop')
                    pg.click('#home'); r.idle(8000); pg.wait_for_timeout(300)
                    i = r.info(); check(tag + ' Home = cup whole piece', i['spec'] == 0 and i['stop'] == 0)
                    r.shot(vname, '99-home')
                else:
                    seq = []
                    for _ in range(3): pg.keyboard.press('Enter'); r.idle(); seq.append(r.info()['stop'])
                    pg.keyboard.press('ArrowRight'); r.idle(); seq.append(r.info()['spec'])
                    check(tag + ' reduce-motion run gives the same steps', seq == [1, 2, 3, 1], str(seq))
                bad = [l for l in logs if 'favicon' not in l]
                check(tag + ' no console errors / 4xx', not bad, str(bad[:3]))
                ctx.close()
        if video:
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, device_scale_factor=1, record_video_dir=os.path.join(HERE, '_vid'), record_video_size={'width': 390, 'height': 844})
            pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg); r = Run(pg, cdp, 390, 844)
            pg.goto(URL); pg.wait_for_function('window.__o3'); pg.wait_for_timeout(1800)
            for _ in range(2): r.pinch(); r.idle(); pg.wait_for_timeout(900)
            for _ in range(4): r.pinch(); r.idle(); pg.wait_for_timeout(500)
            pg.wait_for_timeout(500)
            for _ in range(6): r.pinch(out=True); r.idle(); pg.wait_for_timeout(350)
            for _ in range(6): r.pinch(); r.idle(); pg.wait_for_timeout(350)
            for _ in range(6): r.pinch(out=True); r.idle(); pg.wait_for_timeout(250)
            r.swipe(-170); r.idle(); pg.wait_for_timeout(900)
            for _ in range(3): r.pinch(); r.idle(); pg.wait_for_timeout(800)
            pg.keyboard.press('Enter'); r.idle(); pg.wait_for_timeout(1200)
            pg.click('#home'); r.idle(8000); pg.wait_for_timeout(1200)
            ctx.close()
        b.close()
    fails = [r for r in RESULTS if not r[1]]
    print('\n%d checks, %d failed' % (len(RESULTS), len(fails)))
    json.dump(RESULTS, open(os.path.join(HERE, 'qa-results.json'), 'w'), indent=1)
    sys.exit(1 if fails else 0)
main()
