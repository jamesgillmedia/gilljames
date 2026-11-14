#!/usr/bin/env python3
"""One labeled contact sheet per milestone (dpsheet.sheet) and a frame sheet per motion clip."""
import json
import subprocess
from pathlib import Path

from dpsheet import sheet

HERE = Path(__file__).resolve().parent
ROOMS = json.loads((HERE.parent / "rooms.json").read_text())
BY = {}
for room in ROOMS:
    BY.setdefault(room["href"].split("#", 1)[0], []).append(room)

KIND = {
    "HERO": "HERO", "LOCKED": "HERO",
    "LIKED": "LIKED",
    "SELECTED": "VISUAL",
    "MAYBE": "MAYBE", "OPEN": "MAYBE",
    "IN PLAY": "CONSIDERED", "SLOT": "CONSIDERED",
    "TO INTEGRATE": "PROPOSED",
}
RANK = {"HERO": 6, "LIKED": 5, "VISUAL": 4, "PROPOSED": 3, "MAYBE": 2, "CONSIDERED": 1, "": 0}
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def hits(path):
    return BY.get(path.split("#", 1)[0], [])


def pick(path):
    found = hits(path)
    if not found:
        tail = path.split("?")[0].strip("/").split("/")
        name = tail[-2] if tail and tail[-1] == "index.html" and len(tail) > 1 else (tail[-1] if tail else path)
        return name.replace("-", " "), "", ""
    best = max(found, key=lambda r: RANK[KIND.get(r.get("badge", ""), "")])
    ids = []
    for room in found:
        if room["id"] not in ids:
            ids.append(room["id"])
    return best["label"], KIND.get(best.get("badge", ""), ""), " · ".join(ids)


def milestone_sheet(folder: Path):
    report = json.loads((folder / "report.json").read_text())
    stage = folder / "_dpsheet"
    stage.mkdir(exist_ok=True)
    order, shots = [], {}
    for row in report:
        if not row.get("shot"):
            continue
        shots.setdefault(row["path"], {})[row["device"]] = folder / row["shot"]
        if row["path"] not in order:
            order.append(row["path"])
    keys, LB = [], {}
    used = set()
    for path in order:
        pair = shots[path]
        desk, phone = pair.get("desktop"), pair.get("phone")
        if not desk or not phone or not desk.is_file() or not phone.is_file():
            continue
        label, kind, note = pick(path)
        key = (note.split(" · ")[0] if note else label).replace(" ", "")
        key = "".join(ch if ch.isalnum() or ch in "-_" else "-" for ch in key) or "room"
        base = key
        n = 2
        while key in used:
            key = f"{base}-{n}"
            n += 1
        used.add(key)
        (stage / f"{key}-d.png").unlink(missing_ok=True)
        (stage / f"{key}-p.png").unlink(missing_ok=True)
        (stage / f"{key}-d.png").symlink_to(desk.resolve())
        (stage / f"{key}-p.png").symlink_to(phone.resolve())
        keys.append(key)
        LB[key] = (label, kind, note)
    if not keys:
        print("skip", folder.name)
        return
    title = folder.name.replace("-", " ")
    out = str(folder / "sheet.jpg")
    sheet(str(stage), keys, LB, out, title, (232, 228, 220))
    print("sheet", folder.name, len(keys))


def frame_sheet(clip: Path):
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(clip)],
        capture_output=True, text=True, check=True,
    )
    dur = float(probe.stdout.strip() or "1")
    frames = max(1, int(dur / 0.5) + 1)
    rows = max(1, (frames + 3) // 4)
    out = clip.with_name(clip.stem + "-frames.jpg")
    vf = (
        "fps=2,"
        f"drawtext=fontfile={FONT}:text='%{{pts\\:hms}}':fontsize=22:fontcolor=white:"
        "box=1:boxcolor=black@0.55:boxborderw=6:x=10:y=10,"
        f"scale=360:-2,tile=4x{rows}"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(clip), "-vf", vf, "-update", "1", "-frames:v", "1", str(out)],
        check=True, capture_output=True,
    )
    print("frames", out.name, out.stat().st_size)


def main():
    for folder in sorted(p for p in HERE.iterdir() if p.is_dir() and (p / "report.json").is_file()):
        milestone_sheet(folder)
        for clip in sorted(folder.glob("*.webm")) + sorted(folder.glob("*.mp4")):
            frame_sheet(clip)


if __name__ == "__main__":
    main()
