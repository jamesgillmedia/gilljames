#!/usr/bin/env python3
"""Cut Gill's paddles out of his own photographs (alpha only; pixels are copied through, never graded).
rembg (u2net) finds the paddle; a connected-component pass keeps only the paddle; where a hand holds the paddle the cut stops at the first finger
(keep_to_y, in source pixels), so the cutout is the blade and the neck above the grip with a flat end, not an invented handle.
Then cuts.json / cuts.js are rewritten with both kinds (cups from cutout_joio.py, paddles from here), each carrying the file it was cut from.

  pip install rembg onnxruntime scipy pillow ; python3 _build/cutout_paddles.py        (run _build/cutout_joio.py first: it writes the cup entries)
"""
import json, os
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_erosion
from rembg import remove, new_session

HERE = os.path.dirname(os.path.abspath(__file__)); MEDIA = os.path.join(HERE, '..', 'media'); OUT = os.path.join(MEDIA, 'cut')
# key: (source under media/, keep rows above this y or None, label). The two wall shots are held by fingers above the frame: the cutout starts where the photo does.
SRC = {
  'pd-product': ('r/joio-cup/making-IMG_0346.webp', 990,  'single paddle, product view'),
  'pd-wall-a':  ('r/joio-cup/making-IMG_3497.webp', None, 'long dark paddle against a wall'),
  'pd-wall-b':  ('r/joio-cup/making-IMG_3506.webp', None, 'long dark paddle against a wall, second shot'),
  'pd-brown':   ('r/joio-cup/making-IMG_2401.webp', 495,  'paddle blade held in a hand'),
}
def main():
    sess = new_session('u2net'); os.makedirs(OUT, exist_ok=True)
    prev = json.load(open(os.path.join(OUT, 'cuts.json'))) if os.path.exists(os.path.join(OUT, 'cuts.json')) else []
    cups = [c for c in prev if c.get('kind', 'cup') == 'cup']
    pads = []
    for k, (f, keep_y, label_txt) in SRC.items():
        im = Image.open(os.path.join(MEDIA, f)).convert('RGB'); W, H = im.size
        a = np.asarray(remove(im, session=sess))[..., 3].copy()
        if keep_y: a[keep_y:, :] = 0
        lab, n = label(a > 40)
        if n > 1:
            sizes = np.bincount(lab.ravel()); sizes[0] = 0; a[lab != sizes.argmax()] = 0
        m = (a > 40); m = binary_erosion(m, iterations=1)
        alpha = np.where(m, np.minimum(a, 255), 0).astype(np.uint8)
        ys, xs = np.where(alpha > 0); box = (max(0, xs.min() - 3), max(0, ys.min() - 3), min(W, xs.max() + 4), min(H, ys.max() + 4))
        rgba = im.copy(); rgba.putalpha(Image.fromarray(alpha)); rgba = rgba.crop(box)
        w, h = rgba.size; sc = 640 / max(w, h)
        if sc < 1: rgba = rgba.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
        rgba.save(os.path.join(OUT, k + '.webp'), quality=88, method=6)
        sw, sh = Image.open(os.path.join(MEDIA, f)).size
        pads.append({'k': k, 'kind': 'paddle', 'src': f.rsplit('.', 1)[0], 'w': rgba.size[0], 'h': rgba.size[1], 'srcW': sw, 'srcH': sh, 'label': label_txt, 'cutAtHand': bool(keep_y) or k in ('pd-wall-a', 'pd-wall-b')})
        print(pads[-1])
    allc = cups + pads
    json.dump(allc, open(os.path.join(OUT, 'cuts.json'), 'w'), indent=1)
    open(os.path.join(OUT, 'cuts.js'), 'w').write('/* cutout objects and the photograph each was cut from; written by _build/cutout_joio.py + cutout_paddles.py */\nwindow.OBJ_CUTS=' + json.dumps(allc) + ';\n')
main()
