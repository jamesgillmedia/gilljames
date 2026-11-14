#!/usr/bin/env python3
"""Per-film baked-in letterbox: union of cropdetect boxes over that film's reel clips (so dark shots never over-crop)."""
import json,subprocess,re,os,collections
from concurrent.futures import ThreadPoolExecutor
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
items=json.load(open('reel/items.json'))
def det(it):
    lim=48 if it['slug']=='reel-2026' else 24
    r=subprocess.run(['ffmpeg','-v','info','-i','reel/clips/%s.mp4'%it['id'],'-vf','cropdetect=limit=%d:round=2:reset=0'%lim,'-f','null','-'],capture_output=True,text=True)
    m=re.findall(r'crop=(\d+):(\d+):(\d+):(\d+)',r.stderr)
    return it['id'],(tuple(map(int,m[-1])) if m else None)
with ThreadPoolExecutor(8) as ex: res=dict(ex.map(det,items))
by=collections.defaultdict(list)
for it in items:
    c=res[it['id']]
    if c: by[it['slug']].append((c,it['w'],it['h']))
out={}
for slug,L in by.items():
    W,H=L[0][1],L[0][2]
    x0=min(c[2] for c,_,_ in L);y0=min(c[3] for c,_,_ in L);x1=max(c[2]+c[0] for c,_,_ in L);y1=max(c[3]+c[1] for c,_,_ in L)
    out[slug]=dict(w=W,h=H,x=x0,y=y0,cw=x1-x0,ch=y1-y0,trimY=round(1-(y1-y0)/H,3),trimX=round(1-(x1-x0)/W,3))
    print(slug,out[slug])
json.dump(out,open('tools/crops.json','w'),indent=1)
