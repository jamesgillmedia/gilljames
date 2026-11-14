"""Local alpha cutouts of the whole-piece shots. Run from the repo root: python3 objects-3d/tools/cutout.py
rembg (u2net) separates subject+hand from the wall; the hand is then removed with a hand-placed silhouette polygon of the piece
(landmarks read off the photo) intersected with the rembg mask, plus a skin-colour clean-up of a thin band along the edge.
Output: webp with alpha, EXIF/ICC dropped (Pillow re-encode), cropped tight with a small margin.
Only reads u4-opus-m4; writes objects-3d/media/**/cut-*.webp"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
from skimage import color
from scipy.interpolate import splprep, splev
from rembg import remove, new_session
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'objects-3d', 'media')

def smooth_poly(pts, n=400):
    p = np.array(pts + [pts[0]], float)
    tck, _ = splprep([p[:, 0], p[:, 1]], s=len(pts) * 6, per=True)
    x, y = splev(np.linspace(0, 1, n), tck); return list(zip(x, y))

def skin_mask(rgb):
    hsv = color.rgb2hsv(rgb / 255.); h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
    return (((h < 46) | (h > 340)) & (s > .2) & (v > .36))

def wall_mask(rgb):
    hsv = color.rgb2hsv(rgb / 255.); s, v = hsv[..., 1], hsv[..., 2]
    return (v > .6) & (s < .2)

def cut(src, poly, name, session, margin=24, band=34, scale=1.0, fade_bottom=None, rim_clip=0, skin_from=0, smooth=True):
    im = Image.open(os.path.join(ROOT, src)).convert('RGB')
    W, H = im.size
    rgb = np.array(im)
    fg = np.array(remove(im, session=session))[..., 3] > 100
    pm = Image.new('L', (W, H), 0); ImageDraw.Draw(pm).polygon(smooth_poly(poly) if smooth else poly, fill=255)
    pmask = np.array(pm) > 127
    m = pmask & ndi.binary_dilation(fg, iterations=2)
    edgeband = pmask & ~ndi.binary_erosion(pmask, iterations=band)
    sk = ndi.binary_dilation(skin_mask(rgb), iterations=1); sk[:skin_from] = False
    m &= ~(edgeband & sk)
    if rim_clip:
        first = np.where(m.any(0), m.argmax(0), H); rows = np.arange(H)[:, None]
        m &= ~((rows < (first[None, :] + rim_clip)) & ndi.binary_dilation(wall_mask(rgb), iterations=3))
    m = ndi.binary_opening(m, iterations=4); m = ndi.binary_closing(m, iterations=8); m = ndi.binary_fill_holes(m)
    lab, n = ndi.label(m); sizes = ndi.sum(m, lab, range(1, n + 1)); m = lab == (1 + int(np.argmax(sizes)))
    m = ndi.binary_erosion(m, iterations=3)
    a = ndi.gaussian_filter(m.astype(float), 2.4)
    a = np.clip((a - .35) / .5, 0, 1)
    if fade_bottom:
        y0, y1 = fade_bottom; yy = np.arange(H)[:, None]; a = a * np.clip(1 - (yy - y0) / float(y1 - y0), 0, 1)
    ys, xs = np.where(a > .02); x0, x1, y0_, y1_ = max(0, xs.min() - margin), min(W, xs.max() + margin), max(0, ys.min() - margin), min(H, ys.max() + margin)
    out = np.dstack([rgb, (a * 255).astype(np.uint8)])[y0_:y1_, x0:x1]
    # un-premultiply fringe: colour of transparent pixels does not matter, but bleed inner colour outward so the edge is not skin or wall coloured
    o = Image.fromarray(out, 'RGBA')
    long = max(o.size)
    if long > 1100: o = o.resize((round(o.width * 1100 / long), round(o.height * 1100 / long)), Image.LANCZOS)
    dst = os.path.join(OUT, name + '.webp'); os.makedirs(os.path.dirname(dst), exist_ok=True)
    o.save(dst, 'WEBP', quality=88, method=6, exact=True)
    print(name, o.size, os.path.getsize(dst) // 1024, 'KB')
    return o

def main():
    s = new_session('u2net')
    cut('u4-opus-m4/media/nov9/objects/IMG_5841.jpg',
        [(404, 460), (560, 428), (760, 406), (900, 408), (1030, 420), (1096, 446), (1098, 500), (1088, 590), (1076, 640), (1055, 740), (1030, 830), (1000, 880), (950, 950), (870, 1000), (770, 1022), (660, 1015), (580, 980), (520, 920), (480, 860), (440, 740), (410, 630), (395, 530)],
        'joio-cup/cut-IMG_5841', s, rim_clip=70)
def scoop(s):
    k = 960 / 819.
    P = [(270,60),(430,60),(580,60),(585,300),(560,430),(520,490),(497,520),(497,640),(407,640),(407,520),(350,490),(290,380),(262,250)]
    cut('u4-opus-m4/_sketch/objects/rings/scoop/02-in-hand-SCOOP-03.jpg', [(x * k, y * k) for x, y in P], 'scoop/cut-SCOOP-03', s, band=26, smooth=False, skin_from=int(440 * k), fade_bottom=(int(560 * k), int(650 * k)))

if __name__ == '__main__':
    main()
    scoop(new_session('u2net'))
