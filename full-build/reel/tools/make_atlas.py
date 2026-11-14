#!/usr/bin/env python3
"""reel/strip.webp atlas (16 cols, 72x46 cells) + js/reelitems.js from reel/items.json."""
import json,os
from PIL import Image
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
it=json.load(open('reel/items.json'));C=16;W,H=72,46;rows=(len(it)+C-1)//C
A=Image.new('RGB',(C*W,rows*H))
for k,x in enumerate(it):
    im=Image.open('reel/posters/%s.webp'%x['id']).convert('RGB')
    s=max(W/im.width,H/im.height);im=im.resize((max(W,round(im.width*s)),max(H,round(im.height*s))),Image.LANCZOS)
    l=(im.width-W)//2;t=(im.height-H)//2;A.paste(im.crop((l,t,l+W,t+H)),((k%C)*W,(k//C)*H));x['ax']=k%C;x['ay']=k//C
A.save('reel/strip.webp',quality=80)
out=[dict(id=x['id'],slug=x['slug'],title=x['title'],t=x['t'],dur=x['dur'],w=x['w'],h=x['h'],clip='reel/clips/%s.mp4'%x['id'],poster='reel/posters/%s.webp'%x['id'],ax=x['ax'],ay=x['ay']) for x in it]
open('js/reelitems.js','w').write("/* Horizon reel strip: %d motion clips cut from the 35 swept films (approved film frames, Nov 12 2026)\n   at the stills-zoom shot timestamps; dur = that shot's own length. Titles from LAB_STILLS / film-preview.\n   Built by tools/build_reel.py + tools/make_atlas.py */\nwindow.REEL_ITEMS=%s;\nwindow.REEL_ATLAS={src:'reel/strip.webp',cols:%d,w:%d,h:%d};\n"%(len(out),json.dumps(out,separators=(',',':')),C,W,H))
print(len(out))
