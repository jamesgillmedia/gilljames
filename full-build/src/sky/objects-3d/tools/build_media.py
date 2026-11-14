"""Copies real photos from u4-opus-m4 into objects-3d/media (read-only on u4-opus-m4).
Every output is re-encoded with Pillow, which drops EXIF/GPS/ICC metadata. Crops are plain rectangles of the source photo.
Run from the repo root:  python3 objects-3d/tools/build_media.py
"""
import os, sys, json
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
M4 = os.path.join(ROOT, 'u4-opus-m4')
OUT = os.path.join(ROOT, 'objects-3d', 'media')
R = 'u4-opus-m4/_sketch/objects/rings/'
BANNED = ['IMG_1936','IMG_1188','IMG_1189','IMG_6405','IMG_6606','IMG_6612','22179A95','IMG_5722','IMG_1187','IMG_6881']
LONG = 1200

# out name -> (source path relative to repo root, crop box as fractions (x0,y0,x1,y1) or None)
JOBS = {
 'joio-cup/surface-IMG_5841': ('u4-opus-m4/media/nov9/objects/IMG_5841.jpg', (.22,.19,.76,.52)),
 'joio-cup/surface-e2aa7ba0': ('u4-opus-m4/media/pro2/img/photo/e2aa7ba0-960.webp', (0,.10,1,.80)),
 'joio-cup/surface-IMG_5892': ('u4-opus-m4/media/nov9/objects/IMG_5892.jpg', (.27,.17,.78,.56)),
 'joio-cup/surface-IMG_5901': (R+'joio-cup/08-three-quarter-IMG_5901.jpg', (.18,.22,.80,.70)),
 'joio-cup/making-IMG_5881': (R+'joio-cup/03-side-IMG_5881.jpg', None),
 'joio-cup/making-IMG_5892': (R+'joio-cup/09-top-IMG_5892.jpg', None),
 'joio-cup/making-IMG_5901': (R+'joio-cup/08-three-quarter-IMG_5901.jpg', None),
 'joio-cup/making-IMG_0183': ('u4-opus-m4/media/nov9/objects/IMG_0183.jpg', None),
 'joio-cup/making-IMG_0346': ('u4-opus-m4/media/nov9/objects/IMG_0346.jpg', None),
 'joio-cup/making-IMG_2351': ('u4-opus-m4/media/nov9/objects/IMG_2351.jpg', None),
 'joio-cup/making-IMG_2401': ('u4-opus-m4/media/nov9/objects/IMG_2401.jpg', None),
 'joio-cup/making-IMG_3497': ('u4-opus-m4/media/nov9/objects/IMG_3497.jpg', None),
 'joio-cup/making-IMG_3506': ('u4-opus-m4/media/nov9/objects/IMG_3506.jpg', None),
 'joio-cup/making-2528243E': ('u4-opus-m4/media/nov9/objects/2528243E-E3AF-45FC-B054-21D812CCB892.jpg', None),
 'joio-cup/making-1724F546': ('u4-opus-m4/media/nov9/objects/1724F546-645A-4CD6-8DD3-DF55A3A19C36.jpg', None),
 'joio-cup/making-carve': ('u4-opus-m4/media/pro2/img/objects/carve-960.webp', None),
 'joio-cup/making-spoon': ('u4-opus-m4/media/pro2/img/objects/spoon-960.webp', None),
 'joio-cup/use-IMG_0952': (R+'joio-cup/04-three-quarter-IMG_0952.jpg', None),
 'joio-cup/use-IMG_5925': (R+'joio-cup/11-top-IMG_5925.jpg', None),
 'joio-cup/use-IMG_6136': (R+'joio-cup/05-three-quarter-IMG_6136.jpg', None),
 'joio-cup/use-IMG_6166': (R+'joio-cup/07-three-quarter-IMG_6166.jpg', None),
 'joio-cup/use-IMG_9126': (R+'joio-cup/01-side-IMG_9126.jpg', None),
 'joio-cup/use-16B39E13': (R+'joio-cup/02-side-16B39E13-2667-41A0-BDF7-EC4D14309DE1.jpg', None),
 'scoop/surface-bowl-SCOOP-03': (R+'scoop/02-in-hand-SCOOP-03.jpg', (.30,.05,.72,.44)),
 'scoop/surface-side-SCOOP-04': (R+'scoop/03-side-SCOOP-04.jpg', (.20,.30,.74,.70)),
 'scoop/surface-handle-SCOOP-03': (R+'scoop/02-in-hand-SCOOP-03.jpg', (.36,.50,.80,.86)),
}

def main():
    for name, (src, box) in JOBS.items():
        assert not any(b in src or b in name for b in BANNED), name
        im = Image.open(os.path.join(ROOT, src)).convert('RGB')
        if box:
            w, h = im.size
            im = im.crop((round(box[0]*w), round(box[1]*h), round(box[2]*w), round(box[3]*h)))
        s = LONG / max(im.size)
        if s < 1: im = im.resize((round(im.width*s), round(im.height*s)), Image.LANCZOS)
        dst = os.path.join(OUT, name + '.webp'); os.makedirs(os.path.dirname(dst), exist_ok=True)
        im.save(dst, 'WEBP', quality=82, method=6)
        print(name, im.size, os.path.getsize(dst)//1024, 'KB')
main()
