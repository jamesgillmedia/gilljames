#!/usr/bin/env python3
"""Build the Horizon reel strip: 201 motion clips cut from the 35 swept films at the
scene-detected still timestamps in stills-zoom/data/index.json (read only).
Each clip's length is that shot's own length (to the next detected cut), clamped 0.6-6 s.
Titles come from LAB_STILLS / film-preview (stills.js). Writes only inside horizon-reel-v2/reel/."""
import json, os, subprocess, sys, math
from concurrent.futures import ThreadPoolExecutor
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'reel'); TOTAL=201
ORDER=['reel-2026','cinematography-demo-reel-2025','one-with-the-devil','celebraciones','stay-gold','legends','drift','golden-moment-directors-cut','cover-with-love-isabelle','no-place-like-home','the-smell-needs-to-go','brew-bar-coffee-teaser','explorers','sun-kissed','sleepwalker','repeat-feat-jessie-reyez','flower-crown','backward-fall','s18','back-to-the-start','lets-grow-good-together','weird-kid','veronas-obsession','obedience-gets-you-nowhere','fire','modern-man','phantoms-and-friends','summer-is-here','eat-well','buddy-time-grandpas-story','canoe','mandie','just-the-beginning','ltl-dstryr','journeys-x-todd']
idx=json.load(open('/workspace/stills-zoom/data/index.json'))
films={f['slug']:f for f in idx['films']}
s=open(os.path.join(ROOT,'js/stills.js')).read(); LS=json.loads(s[s.index('['):s.rindex(']')+1])
titles={}
for x in LS: titles.setdefault(x['slug'],x['title'])
# candidates
cand={}
for slug in ORDER:
    f=films[slug]; fr=f['frames']; c=[]
    for i,x in enumerate(fr):
        end=fr[i+1]['t'] if i+1<len(fr) else f['duration']
        L=end-x['t']-0.08
        if L<0.6: continue
        if 'vidA' in (f.get('sourceVideo') or '') and x['t']>=9: continue
        c.append(dict(t=x['t']+0.04,len=min(L,6.0),fid=x['id']))
    cand[slug]=c
# quota: 3 each, rest proportional to sqrt(count)
q={s:min(3,len(cand[s])) for s in ORDER}
rest=TOTAL-sum(q.values()); w={s:math.sqrt(len(cand[s])) for s in ORDER}
while rest>0:
    s_=max(ORDER,key=lambda s:(w[s]/(q[s]+1) if q[s]<len(cand[s]) else -1))
    q[s_]+=1; rest-=1
items=[]
for slug in ORDER:
    c=cand[slug]; n=q[slug]
    pick=[c[min(len(c)-1,int((k+0.5)*len(c)/n))] for k in range(n)]
    for k,x in enumerate(pick):
        items.append(dict(slug=slug,title=titles.get(slug,films[slug]['title']),t=round(x['t'],3),len=round(x['len'],2),fid=x['fid'],src=films[slug]['sourceVideo'],sw=films[slug]['srcW'],sh=films[slug]['srcH']))
assert len(items)==TOTAL,len(items)
for i,it in enumerate(items): it['id']='r%03d'%(i+1)
if os.path.exists(os.path.join(OUT,'items.json')): items=json.load(open(os.path.join(OUT,'items.json')))  # keep swaps
CROPS=json.load(open(os.path.join(ROOT,'tools/crops.json'))) if os.path.exists(os.path.join(ROOT,'tools/crops.json')) else {}
def enc(it):
    clip=os.path.join(OUT,'clips',it['id']+'.mp4'); post=os.path.join(OUT,'posters',it['id']+'.webp')
    if not os.path.exists(clip):
        vf="scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))',fps=30"
        cr=it.get('crop') or CROPS.get(it['slug'],{}).get('crop')  # per-item crop where a film mixes framings
        if cr: vf+=',crop=%d:%d:%d:%d'%tuple(cr)  # baked-in letterbox / pillarbox off (tools/cropdetect.py)
        r=subprocess.run(['ffmpeg','-v','error','-y','-ss',str(it['t']),'-i',it['src'],'-t',str(it['len']),'-an','-sn','-vf',vf,'-c:v','libx264','-preset','veryfast','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart',clip+'.tmp.mp4'],capture_output=True,text=True)
        if r.returncode: print('FAIL',it['id'],r.stderr[-300:]); return
        os.rename(clip+'.tmp.mp4',clip)
    if not os.path.exists(post):
        subprocess.run(['ffmpeg','-v','error','-y','-i',clip,'-frames:v','1','-vf','scale=960:-2','-q:v','78',post])
    pr=subprocess.run(['ffprobe','-v','error','-select_streams','v','-show_entries','stream=width,height:format=duration','-of','json',clip],capture_output=True,text=True)
    j=json.loads(pr.stdout); it['w']=j['streams'][0]['width']; it['h']=j['streams'][0]['height']; it['dur']=round(float(j['format']['duration']),2)
    print('ok',it['id'],it['slug'],it['dur'],flush=True)
with ThreadPoolExecutor(7) as ex: list(ex.map(enc,items))
json.dump(items,open(os.path.join(OUT,'items.json'),'w'),indent=0)
print('done',len(items))
