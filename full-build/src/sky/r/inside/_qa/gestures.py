"""Real-gesture walk at 390x844 (CDP touch): two-tap rule at every level, pinch in through sky > constellation > board > piece > inside,
then pinch out / ‹ / Back one level at a time. Run with and without Reduce Motion. usage: python3 gestures.py [base] [out]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
from qa import touch_pinch, touch_tap, touch_drag

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/inside/'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'shots')
os.makedirs(OUT, exist_ok=True)

async def walk(p, rm):
    b = await p.chromium.launch(executable_path='/usr/local/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True, reduced_motion='reduce' if rm else 'no-preference',
                              record_video_dir=OUT if not rm else None, record_video_size={'width': 390, 'height': 844})
    pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg)
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('response', lambda r: errs.append(str(r.status) + ' ' + r.url) if r.status >= 400 else None)
    log = []
    tag = 'walk' + ('-rm' if rm else '')
    async def st(n):
        s = await pg.evaluate("()=>{const I=window.__inside;return {lv:I.ST.lv,k:I.ST.k,id:I.ST.id,hash:location.hash,sel:I.sel(),bsel:I.boardSel(),room:I.Room.active()}}")
        log.append([n, s]); return s
    async def shot(n): await pg.screenshot(path=os.path.join(OUT, f'{tag}-{n}.png'))
    await pg.goto(BASE); await pg.wait_for_timeout(4000)
    await shot('a-far')
    # drift between constellations, one finger, with inertia
    await touch_drag(cdp, 300, 600, 120, 420, 10); await pg.wait_for_timeout(250); await shot('b-drift'); await pg.wait_for_timeout(1200)
    await pg.evaluate("()=>window.__inside.home()"); await pg.wait_for_timeout(1600)
    # two-tap a chapter: first selects, second flies in
    xy = await pg.evaluate("()=>{const I=window.__inside,c=I.D.chapters.film,v=new I.camera.position.constructor(c.cx,c.cy,c.cz).project(I.camera);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]}")
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(500); s = await st('tap1-film'); await shot('c-film-selected')
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(1800); s = await st('tap2-film')
    await shot('d-film')
    # two-tap a star in the constellation: opens the board on that piece
    pid, xy = await pg.evaluate("()=>{const I=window.__inside;let b=null,bd=1e9;I.D.chapters.film.sky.forEach(i=>{const p=I.scrOf(i.id);if(!p)return;const d=Math.hypot(p[0]-innerWidth/2,p[1]-innerHeight/2);if(d<bd){bd=d;b=[i.id,p]}});return b}")
    log.append(['star', pid])
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(500); await st('tap1-star'); await shot('e-star-selected')
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(2400); await st('tap2-star'); await shot('f-board')
    # two-tap a tile: first selects (outline + title), second opens the piece
    xy = await pg.evaluate("id=>window.__inside.Board.screenOf(id,window.__inside.camera)", pid)
    if not xy: print(log); raise SystemExit('no tile')
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(500); await st('tap1-tile'); await shot('g-tile-selected')
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(1800); await st('tap2-tile'); await shot('h-piece')
    # pinch in on the piece: inside
    await touch_pinch(cdp, 195, 380, 80, 260); await pg.wait_for_timeout(600); await shot('i-entering'); await pg.wait_for_timeout(1800)
    await st('pinch-in-inside'); await shot('j-inside')
    await touch_drag(cdp, 320, 420, 80, 400, 12); await pg.wait_for_timeout(1000); await shot('k-inside-look')
    # pinch out: back to the piece, exactly where you were
    await touch_pinch(cdp, 195, 420, 280, 70); await pg.wait_for_timeout(500); await shot('l-leaving'); await pg.wait_for_timeout(1500)
    await st('pinch-out-piece'); await shot('m-piece-again')
    await touch_pinch(cdp, 195, 420, 280, 70); await pg.wait_for_timeout(1500); await st('pinch-out-board')
    await pg.tap('#back'); await pg.wait_for_timeout(1500); await st('back-btn-constellation')
    await pg.go_back(); await pg.wait_for_timeout(1800); await st('browser-back-far'); await shot('n-far-again')
    # sound: two-tap a song on the board, then tap the piece to go inside (it plays)
    await pg.evaluate("()=>window.__inside.go({lv:2,k:'sound'})"); await pg.wait_for_timeout(2200)
    xy = await pg.evaluate("()=>window.__inside.Board.screenOf('sound/track/noproblem',window.__inside.camera)")
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(400); await st('song-tap1'); await shot('o-song-selected')
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(1600); await st('song-tap2')
    xy = await pg.evaluate("()=>window.__inside.Board.screenOf('sound/track/noproblem',window.__inside.camera)")
    await touch_tap(cdp, *xy); await pg.wait_for_timeout(2600); await st('song-inside'); await shot('p-song-room')
    playing = await pg.evaluate("()=>{const a=[...document.querySelectorAll('audio')];return 'n/a'}")
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(1500); await st('esc-out')
    # mark flies to the far sky in one move
    await pg.tap('#sig'); await pg.wait_for_timeout(1800); await st('mark-far')
    await ctx.close(); await b.close()
    return {'run': tag, 'log': log, 'errors': errs}

async def main():
    res = []
    async with async_playwright() as p:
        for rm in (False, True): res.append(await walk(p, rm))
    for r in res:
        print(r['run'], 'errors:', r['errors'])
        for n, s in r['log']: print(n, s) if isinstance(s, str) else print('  %-24s lv=%s %-38s sel=%s bsel=%s room=%s' % (n, s['lv'], s['hash'], s['sel'], s['bsel'], s['room']))
    with open(os.path.join(OUT, 'gestures-log.json'), 'w') as f: json.dump(res, f, indent=1)

asyncio.run(main())
