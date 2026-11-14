#!/usr/bin/env python3
"""Rebuild full-build/_captures/index.html from LOG.md, rooms.json, and the milestone folders.

Newest milestone first. Pictures are linked as shot: no filters, no tint.
"""
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
LOG = HERE / "LOG.md"
ROOMS = ROOT / "rooms.json"
OUT = HERE / "index.html"

LINE = re.compile(r"^- (\S+) — `([0-9a-f]+)` — (.+)$")
CLIP_EXT = {".webm", ".mp4"}


def esc(s):
    return html.escape(s, quote=True)


def file_url(name):
    return quote(name, safe="/")


def live_url(path):
    return "../" + quote(path, safe="/?#&=")


def load_rooms():
    rooms = json.loads(ROOMS.read_text())
    by = {}
    for room in rooms:
        key = room["href"].split("#", 1)[0]
        by.setdefault(key, []).append(room)
    return by


def load_log():
    rows = []
    for line in LOG.read_text().splitlines():
        m = LINE.match(line.strip())
        if m:
            rows.append({"folder": m.group(1), "commit": m.group(2), "note": m.group(3).strip()})
    rows.reverse()
    return rows


def rooms_for(by, path):
    return by.get(path.split("#", 1)[0], [])


def label_for(by, path):
    hits = rooms_for(by, path)
    if not hits:
        tail = path.split("?")[0].strip("/").split("/")
        name = tail[-2] if tail and tail[-1] == "index.html" and len(tail) > 1 else (tail[-1] if tail else path)
        return name.replace("-", " "), ""
    names = []
    ids = []
    for room in hits:
        if room["label"] not in names:
            names.append(room["label"])
        if room["id"] not in ids:
            ids.append(room["id"])
    return ", ".join(names), " · ".join(ids)


def shots_for(folder, report):
    order = []
    found = {}
    for row in report:
        if row.get("exception") or not row.get("shot"):
            continue
        path = row.get("path") or ""
        slot = found.setdefault(path, {})
        if path not in order:
            order.append(path)
        slot[row.get("device")] = row["shot"]
    rooms = []
    base = HERE / folder
    for path in order:
        slot = found[path]
        rooms.append({
            "path": path,
            "desktop": slot.get("desktop") if slot.get("desktop") and (base / slot["desktop"]).is_file() else "",
            "phone": slot.get("phone") if slot.get("phone") and (base / slot["phone"]).is_file() else "",
        })
    return rooms


def clips_for(folder):
    base = HERE / folder
    groups = {}
    for path in sorted(base.iterdir()):
        if path.suffix.lower() not in CLIP_EXT or not path.is_file():
            continue
        device, _, rest = path.name.partition("-")
        if device not in ("desktop", "phone") or not rest:
            continue
        groups.setdefault(rest, {})[device] = path.name
    clips = []
    for name in sorted(groups):
        clips.append({"name": Path(name).stem.replace("-", " "), "desktop": groups[name].get("desktop", ""), "phone": groups[name].get("phone", "")})
    return clips


def figure(folder, filename, path, caption):
    src = file_url(f"{folder}/{filename}")
    href = live_url(path)
    return (
        f'<a class="shot" href="{esc(href)}">'
        f'<img src="{esc(src)}" alt="{esc(caption)}">'
        f'<span>{esc(caption)}</span></a>'
    )


def video(folder, filename, caption):
    src = file_url(f"{folder}/{filename}")
    return (
        f'<figure class="clip"><video src="{esc(src)}" muted loop playsinline autoplay></video>'
        f'<figcaption>{esc(caption)}</figcaption></figure>'
    )


def render():
    by = load_rooms()
    parts = ["""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Full-build review</title>
<link rel="icon" href="../src/b33/site-v3-pro2/img/favicon-32.png">
<style>
  :root { color-scheme: dark; }
  body { margin: 0; background: #121418; color: #e7e4dc; font: 16px/1.45 Georgia, "Iowan Old Style", serif; }
  a { color: inherit; }
  header, main { width: min(1180px, calc(100% - 28px)); margin: 0 auto; }
  header { padding: 28px 0 8px; }
  h1 { font-weight: normal; font-size: 28px; letter-spacing: 0.01em; margin: 0 0 6px; }
  .lead { margin: 0; color: #b7b3a8; }
  nav { display: flex; flex-wrap: wrap; gap: 8px 14px; padding: 18px 0 6px; }
  nav a { color: #d9d4c8; text-decoration: none; border-bottom: 1px solid #3a3d44; }
  section { padding: 28px 0 8px; border-top: 1px solid #2a2d33; }
  h2 { font-weight: normal; font-size: 22px; margin: 0; }
  .meta { margin: 6px 0 0; color: #b7b3a8; }
  code { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: 0.92em; color: #efece4; }
  .note { max-width: 70ch; }
  .room { margin: 22px 0 8px; }
  .room h3 { font-weight: normal; font-size: 16px; margin: 0 0 8px; }
  .room h3 b { font-weight: normal; color: #9ec0b0; }
  .pair, .clips { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(160px, 0.55fr); gap: 14px; align-items: start; }
  .shot { display: block; text-decoration: none; }
  .shot span, .clip figcaption { display: block; margin-top: 6px; color: #9a968c; font: 12px/1.3 ui-sans-serif, system-ui, sans-serif; letter-spacing: 0.04em; text-transform: lowercase; }
  img, video { width: 100%; height: auto; display: block; background: #000; }
  video { background: #000; }
  .clip { margin: 0; }
  .clips { margin: 8px 0 18px; }
  @media (max-width: 760px) {
    .pair, .clips { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<header>
  <h1>Full-build review</h1>
  <p class="lead">Newest milestone first. Pictures and clips are as shot.</p>
  <nav>
"""]
    milestones = []
    for row in load_log():
        folder = HERE / row["folder"]
        report_path = folder / "report.json"
        if not report_path.is_file():
            continue
        report = json.loads(report_path.read_text())
        milestones.append({**row, "rooms": shots_for(row["folder"], report), "clips": clips_for(row["folder"])})

    for m in milestones:
        parts.append(f'<a href="#{esc(m["folder"])}">{esc(m["folder"])}</a>\n')
    parts.append("</nav>\n</header>\n<main>\n")

    for m in milestones:
        parts.append(f'<section id="{esc(m["folder"])}">\n')
        title = m["folder"].split("-", 1)[-1].replace("-", " ")
        parts.append(f'<h2>{esc(title)}</h2>\n')
        parts.append(f'<p class="meta"><code>{esc(m["commit"])}</code></p>\n')
        parts.append(f'<p class="note">{esc(m["note"])}</p>\n')
        if m["clips"]:
            parts.append('<div class="clips">\n')
            for clip in m["clips"]:
                if clip["desktop"]:
                    parts.append(video(m["folder"], clip["desktop"], f'desktop · {clip["name"]}') + "\n")
                else:
                    parts.append("<div></div>\n")
                if clip["phone"]:
                    parts.append(video(m["folder"], clip["phone"], f'phone · {clip["name"]}') + "\n")
            parts.append("</div>\n")
        for room in m["rooms"]:
            name, ids = label_for(by, room["path"])
            ident = f"{name} · {ids}" if ids else name
            parts.append('<article class="room">\n')
            parts.append(f'<h3>{esc(name)}' + (f' · <b>{esc(ids)}</b>' if ids else "") + "</h3>\n")
            parts.append('<div class="pair">\n')
            if room["desktop"]:
                parts.append(figure(m["folder"], room["desktop"], room["path"], f'desktop · {ident}') + "\n")
            else:
                parts.append("<div></div>\n")
            if room["phone"]:
                parts.append(figure(m["folder"], room["phone"], room["path"], f'phone · {ident}') + "\n")
            parts.append("</div>\n</article>\n")
        parts.append("</section>\n")

    parts.append("</main>\n</body>\n</html>\n")
    OUT.write_text("".join(parts))
    print(f"wrote {OUT} ({len(milestones)} milestones)")


if __name__ == "__main__":
    render()
