#!/usr/bin/env python3
"""Cut the from-above cup shots out of Gill's own photographs (alpha mask only, pixels are never graded or recoloured).

For each photo a hand-placed ellipse marks roughly where the cup's outer rim is. A dynamic-programming pass then follows the
real rim in the photograph (largest colour change between just inside and just outside the rim, within +/-10 % of the
ellipse) so the silhouette keeps the cup's own uneven edge. The photo is copied through unchanged with that alpha.
Nothing is painted or invented. Output: media/cut/<name>.webp (RGBA) + media/cut/cuts.json (aspect and a few facts for the room).

  python3 _build/cutout_joio.py [--debug]     (needs numpy, scipy, pillow)
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import map_coordinates, gaussian_filter, gaussian_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, '..', 'media')
OUT = os.path.join(MEDIA, 'cut')
DEBUG = '--debug' in sys.argv

# name: (source under media/, cx, cy, rx, ry, rotation deg, search band, label)
SRC = {
  'top':     ('board/cup-top.webp',                        457, 584, 322, 308,  -8, .09, 'joio.co cup from above'),
  'ash':     ('r/ashy-bowls/09-top-IMG_4675.webp',         553, 488, 247, 249,   0, .09, 'ashy process bowl from above'),
  'clay':    ('r/unfired-clay/05-top-IMG_1488.webp',       519, 657, 174, 171,   0, .10, 'unfired clay cup from above'),
  'ash2':    ('r/ashy-bowls/08-three-quarter-IMG_4670.webp', 441, 497, 251, 249,   0, .09, 'ashy process bowl, second shot'),
  'stone':   ('r/ashy-bowls/03-top-IMG_4404.webp',         484, 704, 430, 355, -10, .08, 'wide grey bowl from above'),
  'cream':   ('r/joio-cup/making-IMG_5892.webp',           462, 432, 219, 227,  12, .05, 'cream-glazed joio.co cup from above'),
}

def rot(a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a)); return np.array([[c, -s], [s, c]])

def contour(img, cx, cy, rx, ry, ang, band, N=720, K=61):
    lab = np.asarray(img.convert('RGB'), dtype=np.float32)
    sm = np.stack([gaussian_filter(lab[..., i], 1.6) for i in range(3)], -1)
    R = rot(ang); ss = np.linspace(1 - band, 1 + band, K); ts = np.linspace(0, 2 * math.pi, N, endpoint=False)
    cost = np.zeros((N, K), np.float32)
    def samp(px, py):
        return np.stack([map_coordinates(sm[..., i], [py, px], order=1, mode='nearest') for i in range(3)], -1)
    for j, t in enumerate(ts):
        d = R @ np.array([rx * math.cos(t), ry * math.sin(t)])
        nrm = d / (np.linalg.norm(d) + 1e-9)
        px = cx + d[0] * ss; py = cy + d[1] * ss
        ins = np.zeros((K, 3)); out = np.zeros((K, 3))
        for o in (3, 5, 7):
            ins += samp(px - nrm[0] * o, py - nrm[1] * o); out += samp(px + nrm[0] * o, py + nrm[1] * o)
        cost[j] = -np.linalg.norm(ins - out, axis=1) / 3
    cost = gaussian_filter1d(cost, 1.2, axis=0, mode='wrap')
    cost += 5000.0 * (ss[None, :] - 1) ** 2
    lap = 2; C = np.tile(cost, (lap + 1, 1)); n = C.shape[0]
    D = np.zeros_like(C); B = np.zeros(C.shape, np.int16); D[0] = C[0]
    for i in range(1, n):
        prev = np.stack([np.roll(D[i - 1], 1), D[i - 1], np.roll(D[i - 1], -1)], 0); prev[0, 0] = prev[0, 1] + 1e3; prev[2, -1] = prev[2, 1] + 1e3
        pen = np.array([[.6], [0], [.6]]); prev = prev + pen
        a = prev.argmin(0); D[i] = C[i] + prev[a, np.arange(K)]; B[i] = a - 1
    k = int(D[-1].argmin()); path = [0] * n
    for i in range(n - 1, -1, -1):
        path[i] = k; k += int(B[i, k]) if i > 0 else 0; k = max(0, min(K - 1, k))
    path = np.array(path[N:2 * N]); rr = gaussian_filter1d(ss[path].astype(np.float64), 2.0, mode='wrap')
    pts = np.array([cx, cy]) + (R @ (np.stack([rx * np.cos(ts) * rr, ry * np.sin(ts) * rr], 0))).T
    return pts

def make(name, cfg):
    f, cx, cy, rx, ry, ang, band, label = cfg
    img = Image.open(os.path.join(MEDIA, f)).convert('RGB'); W, H = img.size
    pts = contour(img, cx, cy, rx, ry, ang, band)
    S = 3; m = Image.new('L', (W * S, H * S), 0)
    ImageDraw.Draw(m).polygon([(x * S, y * S) for x, y in pts], fill=255)
    m = m.filter(ImageFilter.MinFilter(int(1.6 * S) | 1)).resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(.6))
    x0, y0 = pts.min(0) - 3; x1, y1 = pts.max(0) + 3
    box = (int(max(0, x0)), int(max(0, y0)), int(min(W, x1)), int(min(H, y1)))
    rgba = img.copy(); rgba.putalpha(m); rgba = rgba.crop(box)
    w, h = rgba.size; sc = 640 / max(w, h)
    if sc < 1: rgba = rgba.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    rgba.save(os.path.join(OUT, name + '.webp'), quality=88, method=6)
    if DEBUG:
        d = img.copy(); dd = ImageDraw.Draw(d); dd.line([tuple(p) for p in pts] + [tuple(pts[0])], fill=(0, 255, 120), width=3)
        e = rot(ang); t = np.linspace(0, 2 * math.pi, 200); ep = (e @ np.stack([rx * np.cos(t), ry * np.sin(t)], 0)).T + [cx, cy]
        dd.line([tuple(p) for p in ep], fill=(255, 60, 60), width=1)
        d.save(f'/tmp/cut_{name}.png')
    sw, sh = img.size
    return {'k': name, 'kind': 'cup', 'src': f.rsplit('.', 1)[0], 'w': rgba.size[0], 'h': rgba.size[1], 'srcW': sw, 'srcH': sh, 'label': label}

if __name__ == '__main__':
    out = [make(n, c) for n, c in SRC.items()]
    json.dump(out, open(os.path.join(OUT, 'cuts.json'), 'w'), indent=1)
    open(os.path.join(OUT, 'cuts.js'), 'w').write('/* cutout objects and the photograph each was cut from; written by _build/cutout_joio.py + cutout_paddles.py */\nwindow.OBJ_CUTS=' + json.dumps(out) + ';\n')
    for o in out: print(o)
