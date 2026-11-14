#!/usr/bin/env python3
"""Labeled before/after contact sheets for site tools.

tool_sheet() is the renderer from the handoff. Paths point at this preview's
captures under full-build/_captures/tools/frames/.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
OUT = HERE / "tools"
FRAMES = OUT / "frames"
OUT.mkdir(parents=True, exist_ok=True)
F = "/usr/share/fonts/truetype/dejavu/"
FONT_B = ImageFont.truetype(F + "DejaVuSans-Bold.ttf", 28)
FONT_S = ImageFont.truetype(F + "DejaVuSans.ttf", 16)
FONT_C = ImageFont.truetype(F + "DejaVuSans-Bold.ttf", 15)
FONT_CAP = ImageFont.truetype(F + "DejaVuSans.ttf", 14)

BG = (12, 14, 18)
INK = (232, 228, 220)
MUTED = (168, 164, 152)
GOLD = (200, 164, 80)
RULE = (40, 42, 48)
CELL_BG = (8, 8, 12)

def load(path):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(path)
    return Image.open(p).convert("RGB")

def fit(im, box_w, box_h):
    canvas = Image.new("RGB", (box_w, box_h), CELL_BG)
    iw, ih = im.size
    scale = min(box_w / iw, box_h / ih)
    nw, nh = max(1, int(iw * scale)), max(1, int(ih * scale))
    put = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(put, ((box_w - nw) // 2, (box_h - nh) // 2))
    return canvas

def tool_sheet(name, title, subtitle, cells, cols=2, cell=(860, 540), gap=16):
    """cells: list of (path, caption). Missing paths are skipped and reported."""
    ready = []
    missing = []
    for path, cap in cells:
        p = Path(path)
        if p.exists():
            ready.append((p, cap))
        else:
            missing.append(str(path))
    if not ready:
        print(f"SKIP {name}: no frames ({missing})")
        return None, missing
    n = len(ready)
    cols = min(cols, n)
    rows = (n + cols - 1) // cols
    cw, ch = cell
    cap_h = 44
    top = 92
    side = 24
    W = side * 2 + cols * cw + (cols - 1) * gap
    H = top + rows * (ch + cap_h + gap) + 20
    o = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(o)
    d.text((side, 18), title, fill=INK, font=FONT_B)
    # wrap subtitle
    maxw = W - side * 2
    words = subtitle.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if d.textlength(trial, font=FONT_S) > maxw and cur:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    y = 54
    for ln in lines[:3]:
        d.text((side, y), ln, fill=MUTED, font=FONT_S)
        y += 16
    for i, (p, cap) in enumerate(ready):
        r, c = divmod(i, cols)
        x = side + c * (cw + gap)
        y = top + r * (ch + cap_h + gap)
        o.paste(fit(load(p), cw, ch), (x, y))
        d.rectangle([x, y, x + cw - 1, y + ch - 1], outline=RULE, width=1)
        d.text((x + 2, y + ch + 8), cap, fill=GOLD, font=FONT_C)
    out = OUT / name
    o.save(out, quality=88, optimize=True)
    print(f"wrote {out.name}  {o.size[0]}x{o.size[1]}  {n} frames" + (f"  missing {len(missing)}" if missing else ""))
    return out, missing


def frame(name):
    return FRAMES / name


def render():
    F = frame
    tool_sheet("red-mode.jpg", "Red mode",
               "One tap on the red dot. The room chrome goes darkroom red. Photographs stay their own colour.",
               [(F("red-desk-off.png"), "desktop · off"),
                (F("red-desk-on.png"), "desktop · on"),
                (F("red-phone-off.png"), "phone · off"),
                (F("red-phone-on.png"), "phone · on")])
    tool_sheet("safelight.jpg", "Safelight",
               "The lab safelight. It colours the room light only.",
               [(F("safe-desk-off.png"), "desktop · off"),
                (F("safe-desk-on.png"), "desktop · on"),
                (F("safe-phone-off.png"), "phone · off"),
                (F("safe-phone-on.png"), "phone · on")])
    tool_sheet("nv3-dial-zoom.jpg", "NV3 dial and zoom",
               "The side dial opens the drawer. Plus and minus step the zoom.",
               [(F("nv3-desk-rest.png"), "desktop · rest"),
                (F("nv3-desk-zoom.png"), "desktop · zoomed in"),
                (F("nv3-desk-dial.png"), "desktop · dial open"),
                (F("nv3-phone-rest.png"), "phone · rest"),
                (F("nv3-phone-zoom.png"), "phone · zoomed in"),
                (F("nv3-phone-dial.png"), "phone · dial open")], cols=3)
    tool_sheet("light-scale.jpg", "Light scale",
               "The horizon line, darkest to brightest, dragged across the photographs' own light.",
               [(F("light-desk-dark.png"), "desktop · darker"),
                (F("light-desk-mid.png"), "desktop · mid"),
                (F("light-desk-light.png"), "desktop · lighter"),
                (F("light-phone-dark.png"), "phone · darker"),
                (F("light-phone-mid.png"), "phone · mid"),
                (F("light-phone-light.png"), "phone · lighter")], cols=3)
    tool_sheet("reframe.jpg", "Reframe",
               "Hidden until ?reframe. Tap a picture, drag to pan, zoom, cover or contain. Saved in this browser.",
               [(F("reframe-desk-open.png"), "desktop · open"),
                (F("reframe-desk-selected.png"), "desktop · selected"),
                (F("reframe-desk-moved.png"), "desktop · panned and zoomed"),
                (F("reframe-phone-open.png"), "phone · open"),
                (F("reframe-phone-selected.png"), "phone · selected"),
                (F("reframe-phone-moved.png"), "phone · panned")], cols=3)
    tool_sheet("horizon-dial.jpg", "Horizon dial",
               "Play, pause, and the jog on the film reel.",
               [(F("hz-desk-play.png"), "desktop · playing"),
                (F("hz-desk-pause.png"), "desktop · paused"),
                (F("hz-desk-jog.png"), "desktop · jog"),
                (F("hz-phone-play.png"), "phone · playing"),
                (F("hz-phone-pause.png"), "phone · paused"),
                (F("hz-phone-jog.png"), "phone · jog")], cols=3)
    tool_sheet("horizon-views.jpg", "Horizon view buttons",
               "Full, true, 2.39, and the contact sheet.",
               [(F("hz-desk-full.png"), "full"),
                (F("hz-desk-true.png"), "true"),
                (F("hz-desk-crop.png"), "2.39"),
                (F("hz-desk-sheet.png"), "sheet"),
                (F("hz-phone-full.png"), "phone · full"),
                (F("hz-phone-sheet.png"), "phone · sheet")])
    tool_sheet("horizon-scrub.jpg", "Horizon scrub rail",
               "Drag the glass rail to move along the strip.",
               [(F("hz-desk-scrub0.png"), "desktop · start"),
                (F("hz-desk-scrub1.png"), "desktop · dragged"),
                (F("hz-phone-scrub0.png"), "phone · start"),
                (F("hz-phone-scrub1.png"), "phone · dragged")])
    tool_sheet("horizon-pinch.jpg", "Horizon pinch index",
               "Z or pinch-in opens the stills index on this film. Back returns to the reel.",
               [(F("hz-desk-index.png"), "desktop · index"),
                (F("hz-desk-back.png"), "desktop · back on the reel"),
                (F("hz-phone-index.png"), "phone · index"),
                (F("hz-phone-back.png"), "phone · back on the reel")])
    tool_sheet("toggles.jpg", "Toggles",
               "The tune drawer. Depth while the field is held, the moon, shelf reflections, opener water.",
               [(F("tog-desk-drawer.png"), "desktop · drawer"),
                (F("tog-phone-drawer.png"), "phone · drawer"),
                (F("tog-desk-flat.png"), "depth · at rest"),
                (F("tog-desk-depth.png"), "depth · held"),
                (F("tog-desk-moon.png"), "moon route on"),
                (F("tog-desk-nomoon.png"), "moon off, fewer stars"),
                (F("tog-desk-reflect.png"), "reflections on"),
                (F("tog-desk-noreflect.png"), "reflections off"),
                (F("tog-desk-water.png"), "water on"),
                (F("tog-desk-nowater.png"), "water off")])


if __name__ == "__main__":
    render()
