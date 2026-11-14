#!/usr/bin/env python3
"""Swap reel items that are title cards / supers / logo cards (eye-checked on reel/strip.webp) for the next
unused shot of the same film. Usage: swap_supers.py r008 r053 ..."""
import json,sys,os,subprocess
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
items=json.load(open('reel/items.json'))
idx=json.load(open('/workspace/stills-zoom/data/index.json'));films={f['slug']:f for f in idx['films']}
used={x['fid'] for x in items}
bad=json.load(open('tools/swapped.json')) if os.path.exists('tools/swapped.json') else []
for rid in sys.argv[1:]:
    it=next(x for x in items if x['id']==rid); f=films[it['slug']]; fr=f['frames']
    bad.append(it['fid'])
    order=sorted(range(len(fr)),key=lambda k:abs(fr[k]['t']-it['t']))
    for k in order:
        x=fr[k]; end=fr[k+1]['t'] if k+1<len(fr) else f['duration']; L=end-x['t']-0.08
        if x['id'] in used or x['id'] in bad or L<0.6: continue
        it.update(t=round(x['t']+0.04,3),len=round(min(L,6.0),2),fid=x['id']); used.add(x['id']); break
    for p in ('reel/clips/%s.mp4'%rid,'reel/posters/%s.webp'%rid):
        if os.path.exists(p): os.remove(p)
    print(rid,'->',it['fid'])
json.dump(bad,open('tools/swapped.json','w'))
json.dump(items,open('reel/items.json','w'),indent=0)
