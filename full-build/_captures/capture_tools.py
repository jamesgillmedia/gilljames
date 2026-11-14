#!/usr/bin/env python3
"""Photograph the review tools on the running preview, then render their sheets."""
import asyncio
import math
import shutil
import sys
from pathlib import Path

from playwright.async_api import async_playwright

from make_tool_sheets import FRAMES, render

BASE = "http://127.0.0.1:8877/full-build/"
CHROME = shutil.which("google-chrome") or shutil.which("chromium")
ARGS = ["--use-gl=swiftshader", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
        "--autoplay-policy=no-user-gesture-required", "--no-sandbox", "--disable-dev-shm-usage"]
IPHONE = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
          "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
ARCHIVE = "src/sky/archive-index/index.html"
LAB = "src/sky/tonight/photo-lab/index.html"
NV3 = "src/v33d/site-v3-3d/index.html"
STILLS = "src/sky/tonight/stills/index.html?reframe"
REEL = "reel/index.html"
HUB = "index.html"
MOON = "src/sky/opener/tonight/openers/moon/index.html"


async def shot(page, name):
    FRAMES.mkdir(parents=True, exist_ok=True)
    dest = FRAMES / name
    try:
        await asyncio.wait_for(page.screenshot(path=str(dest)), 25)
        print("shot", name, dest.stat().st_size)
    except Exception as ex:
        print("FAIL", name, ex)


async def go(page, path, wait=1800):
    await asyncio.wait_for(page.goto(BASE + path, wait_until="domcontentloaded"), 40)
    await page.wait_for_timeout(wait)


async def drag(page, x0, y0, x1, y1, steps=18):
    await page.mouse.move(x0, y0)
    await page.mouse.down()
    await page.mouse.move(x1, y1, steps=steps)
    await page.mouse.up()


async def red(page, tag):
    await go(page, ARCHIVE, 2200)
    await shot(page, f"red-{tag}-off.png")
    await page.click("#gj-red")
    await page.wait_for_timeout(500)
    await shot(page, f"red-{tag}-on.png")
    await page.click("#gj-red")


async def safelight(page, tag):
    await go(page, LAB, 800)
    await page.evaluate("() => localStorage.removeItem('gj-photo-lab-safelight')")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1800)
    await shot(page, f"safe-{tag}-off.png")
    await page.evaluate("() => document.getElementById('safe').click()")
    await page.wait_for_timeout(700)
    await shot(page, f"safe-{tag}-on.png")
    await page.evaluate("() => localStorage.setItem('gj-photo-lab-safelight','0')")


async def light(page, tag):
    await go(page, LAB, 600)
    await page.evaluate("() => localStorage.setItem('gj-photo-lab-safelight','0')")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1800)
    await page.wait_for_function(
        "() => window.LAB && LAB.horizon && LAB.horizon.list && LAB.horizon.list().length > 2",
        timeout=12000)
    n = await page.evaluate("() => LAB.horizon.list().length")
    mid = n // 2
    await page.evaluate("(i) => LAB.horizon.go(i, true)", mid)
    await page.wait_for_timeout(400)
    await shot(page, f"light-{tag}-mid.png")
    await page.evaluate("() => LAB.horizon.go(0, true)")
    await page.wait_for_timeout(400)
    await shot(page, f"light-{tag}-dark.png")
    hy = await page.evaluate("() => LAB.horizon.hy()")
    await drag(page, 200, hy, 900 if tag == "desk" else 340, hy)
    await page.evaluate("(i) => LAB.horizon.go(i, true)", n - 1)
    await page.wait_for_timeout(400)
    await shot(page, f"light-{tag}-light.png")


async def nv3(page, tag):
    await go(page, NV3, 2400)
    await page.wait_for_selector(".zb[data-z='1']", timeout=10000)
    await shot(page, f"nv3-{tag}-rest.png")
    for _ in range(2):
        await page.click(".zb[data-z='1']")
        await page.wait_for_timeout(700)
    await shot(page, f"nv3-{tag}-zoom.png")
    await page.click("#fold-dial")
    await page.wait_for_timeout(700)
    await shot(page, f"nv3-{tag}-dial.png")


async def reframe(page, tag):
    seen = {"js": False}

    def on_req(req):
        if req.url.endswith("/js/reframe.js"):
            seen["js"] = True

    page.on("request", on_req)
    await go(page, STILLS, 2200)
    await page.wait_for_selector("[data-reframe-ui]", timeout=8000)
    print("reframe.js requested", seen["js"])
    await shot(page, f"reframe-{tag}-open.png")
    box = await page.evaluate("""() => {
      const imgs = [...document.querySelectorAll('img,video')].filter(m => {
        const r = m.getBoundingClientRect();
        return r.width > 40 && r.height > 40;
      });
      imgs.sort((a,b) => {
        const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
        return (B.width*B.height) - (A.width*A.height);
      });
      const m = imgs[0];
      if (!m) return null;
      const r = m.getBoundingClientRect();
      return {x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height};
    }""")
    if not box:
        print("no reframe target", tag)
        return
    await page.mouse.click(box["x"], box["y"])
    await page.wait_for_timeout(300)
    await shot(page, f"reframe-{tag}-selected.png")
    await drag(page, box["x"], box["y"], box["x"] - box["w"] * 0.25, box["y"] + box["h"] * 0.15)
    await page.mouse.move(box["x"], box["y"])
    await page.mouse.wheel(0, -400)
    await page.wait_for_timeout(200)
    await shot(page, f"reframe-{tag}-moved.png")
    await page.evaluate("() => { try { sessionStorage.removeItem('reframe:on'); } catch (e) {} }")


async def open_reel(page):
    await go(page, REEL, 800)
    await page.evaluate("""() => {
      ['gj-photo-lab-stills','gj-horizon-reel2-mode','gj-horizon-reel2-pos'].forEach(k => localStorage.removeItem(k));
    }""")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1800)
    await page.click("#stills")
    await page.wait_for_selector("#reel.on", timeout=10000)
    await page.mouse.move(720, 400)
    await page.wait_for_timeout(600)


async def jog(page):
    ang = await page.evaluate("""() => new Promise((resolve) => {
      const tr = document.querySelector('#reel .transport');
      const jog = tr && tr.querySelector('.jog');
      if (!jog) { resolve(''); return; }
      const r = tr.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const rad = Math.min(r.width, r.height) * 0.38;
      let i = 0; const steps = 28;
      function ev(type, x, y) {
        jog.dispatchEvent(new PointerEvent(type, {bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId:7, pointerType:'mouse', buttons: type==='pointerup'?0:1, isPrimary:true}));
      }
      const a0 = -Math.PI / 2;
      ev('pointerdown', cx + rad * Math.cos(a0), cy + rad * Math.sin(a0));
      const t = setInterval(() => {
        i++;
        const a = a0 + i * (Math.PI * 1.8 / steps);
        ev('pointermove', cx + rad * Math.cos(a), cy + rad * Math.sin(a));
        if (i >= steps) { clearInterval(t); ev('pointerup', cx, cy); resolve(getComputedStyle(jog).getPropertyValue('--jog')); }
      }, 25);
    })""")
    print("jog", ang)
    await page.wait_for_timeout(200)


async def scrub(page, x0, x1):
    box = await page.locator("#reel .hr-slot").bounding_box()
    y = box["y"] + box["height"] / 2
    await drag(page, x0, y, x1, y)
    await page.wait_for_timeout(250)


async def horizon(page, tag):
    wide = tag == "desk"
    await open_reel(page)
    await shot(page, f"hz-{tag}-play.png")
    await shot(page, f"hz-{tag}-scrub0.png")
    await shot(page, f"hz-{tag}-full.png")
    await page.click("#reel [data-tx='toggle']")
    await page.wait_for_timeout(300)
    await shot(page, f"hz-{tag}-pause.png")
    await jog(page)
    await shot(page, f"hz-{tag}-jog.png")
    for mode in ("true", "crop", "sheet"):
        await page.evaluate("(m) => document.querySelector('#reel [data-mode=\"' + m + '\"]').click()", mode)
        await page.wait_for_timeout(500)
        await shot(page, f"hz-{tag}-{mode}.png")
    await page.evaluate("() => document.querySelector('#reel [data-mode=\"full\"]').click()")
    await page.keyboard.press("Escape")
    await page.wait_for_timeout(400)
    await page.mouse.move(400, 300)
    await scrub(page, 980 if wide else 300, 180 if wide else 40)
    await shot(page, f"hz-{tag}-scrub1.png")
    opened = await page.evaluate("""() => {
      if (window.LAB && LAB.zoomIndex) { LAB.zoomIndex.open(); return true; }
      return false;
    }""")
    if not opened:
        await page.keyboard.press("z")
    await page.wait_for_timeout(1400)
    await shot(page, f"hz-{tag}-index.png")
    await page.evaluate("() => { if (window.LAB && LAB.zoomIndex) LAB.zoomIndex.close(); }")
    await page.wait_for_timeout(600)
    await shot(page, f"hz-{tag}-back.png")


async def toggles(page, phone=False):
    await go(page, HUB, 2000)
    await page.click("#gj-dial")
    await page.wait_for_timeout(400)
    await shot(page, "tog-phone-drawer.png" if phone else "tog-desk-drawer.png")
    if phone:
        return
    await page.evaluate("() => { const d = document.getElementById('gj-drawer'); if (d) d.classList.remove('on'); }")
    await page.wait_for_timeout(200)
    await shot(page, "tog-desk-flat.png")
    await page.mouse.move(720, 450)
    await page.mouse.down()
    await page.mouse.move(1180, 160, steps=16)
    await page.wait_for_timeout(500)
    tilt = await page.evaluate("() => (window.__cb && __cb.st) ? __cb.st() : null")
    print("tilt", tilt)
    await shot(page, "tog-desk-depth.png")
    await page.mouse.up()
    await go(page, MOON, 2000)
    await shot(page, "tog-desk-moon.png")
    await page.evaluate("localStorage.setItem('gj-tog-moon','0')")
    await go(page, "opener/index.html", 2200)
    await shot(page, "tog-desk-nomoon.png")
    await page.evaluate("localStorage.setItem('gj-tog-moon','1')")
    await go(page, LAB, 1800)
    await shot(page, "tog-desk-reflect.png")
    await page.evaluate("localStorage.setItem('gj-tog-reflect','0')")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)
    await shot(page, "tog-desk-noreflect.png")
    await page.evaluate("localStorage.setItem('gj-tog-reflect','1')")
    await go(page, MOON, 1800)
    await shot(page, "tog-desk-water.png")
    await page.evaluate("localStorage.setItem('gj-tog-water','0')")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)
    await shot(page, "tog-desk-nowater.png")
    await page.evaluate("localStorage.removeItem('gj-tog-water')")


async def run_device(browser, tag, opts):
    ctx = await browser.new_context(**opts)
    page = await ctx.new_page()
    page.set_default_timeout(20000)
    steps = [
        ("red", lambda: red(page, tag)),
        ("safelight", lambda: safelight(page, tag)),
        ("light", lambda: light(page, tag)),
        ("nv3", lambda: nv3(page, tag)),
        ("reframe", lambda: reframe(page, tag)),
        ("horizon", lambda: horizon(page, tag)),
        ("toggles", lambda: toggles(page, phone=(tag == "phone"))),
    ]
    for name, fn in steps:
        try:
            print("==", tag, name)
            await fn()
        except Exception as ex:
            print("FAIL", tag, name, type(ex).__name__, ex)
    await ctx.close()


async def finish():
    """Scrub rail, pinch index, and a jog that actually moves. Views are already shot."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, args=ARGS, headless=True)
        for tag, opts in (
            ("desk", dict(viewport={"width": 1440, "height": 900})),
            ("phone", dict(viewport={"width": 390, "height": 844}, user_agent=IPHONE,
                           is_mobile=True, has_touch=True, device_scale_factor=2)),
        ):
            ctx = await browser.new_context(**opts)
            page = await ctx.new_page()
            page.set_default_timeout(20000)
            try:
                print("== finish", tag)
                await open_reel(page)
                await jog(page)
                await shot(page, f"hz-{tag}-jog.png")
                wide = tag == "desk"
                await scrub(page, 980 if wide else 300, 160 if wide else 30)
                await shot(page, f"hz-{tag}-scrub1.png")
                await page.evaluate("() => LAB.zoomIndex.open()")
                await page.wait_for_timeout(1500)
                await shot(page, f"hz-{tag}-index.png")
                await page.evaluate("() => LAB.zoomIndex.close()")
                await page.wait_for_timeout(700)
                await shot(page, f"hz-{tag}-back.png")
            except Exception as ex:
                print("FAIL", tag, type(ex).__name__, ex)
            await ctx.close()
        await browser.close()
    render()


async def repair():
    """Reshoot the frames whose first pass was blocked or still in the previous tool's state."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, args=ARGS, headless=True)
        desk = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await desk.new_page()
        page.set_default_timeout(20000)
        for name, fn in (
            ("light", lambda: light(page, "desk")),
            ("horizon", lambda: horizon(page, "desk")),
            ("toggles", lambda: toggles(page, phone=False)),
        ):
            try:
                print("== repair desk", name)
                await fn()
            except Exception as ex:
                print("FAIL", name, type(ex).__name__, ex)
        await desk.close()
        phone = await browser.new_context(
            viewport={"width": 390, "height": 844}, user_agent=IPHONE,
            is_mobile=True, has_touch=True, device_scale_factor=2)
        page = await phone.new_page()
        page.set_default_timeout(20000)
        for name, fn in (
            ("safelight", lambda: safelight(page, "phone")),
            ("light", lambda: light(page, "phone")),
            ("horizon", lambda: horizon(page, "phone")),
        ):
            try:
                print("== repair phone", name)
                await fn()
            except Exception as ex:
                print("FAIL", name, type(ex).__name__, ex)
        await phone.close()
        await browser.close()
    render()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, args=ARGS, headless=True)
        await run_device(browser, "desk", dict(viewport={"width": 1440, "height": 900}))
        await run_device(browser, "phone", dict(
            viewport={"width": 390, "height": 844}, user_agent=IPHONE,
            is_mobile=True, has_touch=True, device_scale_factor=2))
        await browser.close()
    render()


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    asyncio.run({"repair": repair, "finish": finish}.get(cmd, main)())
