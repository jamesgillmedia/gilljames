/* constellation · blend — local prototype (not published).
   Flat at rest: the m4 flat hub (ᑕᐣᓯ mark constellation from u4-opus-m4/_sketch/opener STROKES + the v3.2/v3.3 chapter
   figures, SH in u4-opus-m4/js/sky.js). 3D only while you move: depth layers + drag/tilt parallax and a zoom that flies
   through near/far layers (feel of gilljames/sketch-3d), springing back to flat. Zoom is continuous (site-v3 / pro3-w5 /
   previews-board idea): every star is a work; it grows into its picture and more of its facts appear the closer you get.
   Reduce Motion keeps the behaviour and shortens it: stiffer springs, less depth, no twinkle. Nothing auto-advances.

   Movement pass (Nov 14, after the f3237da QA) · the opener's feel, ported, no new gestures:
   · one finger is always a 1:1 pan. Where there is nowhere to go (the whole field at rest, or the edge of the chapter you are
     in) the pan meets rising resistance and springs back on release, on the same critically damped spring as the tilt
     (w = 9, about 0.6 s). At rest that is the look-around: the field follows the finger a little, the layers slide apart by
     depth, and everything settles flat.
   · once the zoom is into a chapter the camera belongs to that chapter (LOCK): a pan stays inside it, the crumb names it, and
     it lets go when you zoom back out. A pan can no longer slip FILM into PHOTO.
   · a zoom cannot run past the open view of the nearest tile, and when a wheel or pinch stops between tiles the camera
     lands on the nearest one, so there is no blank field.
   · one tap opens a star. A double tap pulls back only on empty sky. Esc, the mark and ‹ out go up one level at a time. */
(function(){
'use strict';
var D=window.CB, cv=document.getElementById('c'), g=cv.getContext('2d');
var WHERE=document.getElementById('where'), HINT=document.getElementById('hint');
var W=0,H=0,DPR=1,PORT=true;
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function seeded(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function now(){return performance.now()}
/* glow sprites (m4 opener style) */
function glowSprite(rgb){var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.16,'rgba('+rgb+',.42)');gr.addColorStop(.42,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,128,128);return c}
var GW=glowSprite('205,225,255'), GLOW={};
/* red mode (the safelight): everything the field draws itself goes red: stars, glows, lines, names, facts. Pictures are
   drawn exactly as before, never tinted. RED is read once a frame from html.rm, which the shared chrome sets. */
var RED=false,GWR=glowSprite('255,104,84');
var INK={hi:'#e6edf0',lo:'#c9d3d6',fact:'#55DAA1',star:'#f4f8ff',far:'#dfe8ff',bg0:'#03050b',bg1:'#061018',line:'205,225,255',card:'rgba(14,20,32,.92)',lab:'rgba(3,5,10,.6)',wave:'rgba(8,12,20,1)'},
    INKR={hi:'#ffb09e',lo:'#ff8a72',fact:'#ff6a52',star:'#ffcfc2',far:'#ff9a84',bg0:'#070203',bg1:'#0d0405',line:'255,104,84',card:'rgba(26,8,8,.92)',lab:'rgba(10,3,3,.6)',wave:'rgba(20,6,6,1)'};
function ink(k){return (RED?INKR:INK)[k]}
function tintOf(c){return RED?'255,104,84':c.tint}
function glowOf(c){return RED?GWR:GLOW[c.k]}
D.chapters.forEach(function(c){GLOW[c.k]=glowSprite(c.tint)});
/* ---------- world ---------- */
var FIG_W=220,FIG_H=110;
var MARK=[],FIELD=[],DUST=[],CH=D.chapters,WORKS=[],BOX=null;
function layoutChapters(){
  /* flat hub, no ring: a calm staggered column on a phone, a staggered band in landscape */
  /* six chapters (Spaces added Nov 12, Gill 3:08 AM), order as the tonight hub: film, photo, objects, spaces, about, sound */
  var P=PORT?{mark:[0,-300],film:[-80,-156],photo:[80,-28],objects:[-80,100],spaces:[80,228],about:[-80,356],sound:[80,484],box:[-200,-400,200,572]}
           :{mark:[-420,-30],film:[-150,-120],photo:[120,-140],objects:[-140,118],spaces:[130,100],about:[400,-110],sound:[410,128],box:[-590,-230,590,230]};
  BOX=P.box;return P}
function build(){
  var P=layoutChapters(),r=seeded(7);
  /* the ᑕᐣᓯ mark: points along the opener's STROKES (same strokes as m4 sky.js) */
  MARK=[];var ms=.55,segs=[],tot=0;
  D.strokes.forEach(function(s){for(var j=1;j<s.length;j++){var a=s[j-1],b=s[j],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a:a,b:b,l:l});tot+=l}});
  var NM=64;for(var i=0;i<NM;i++){var t=(i+.5)/NM*tot,acc=0;for(var k=0;k<segs.length;k++){var sg=segs[k];if(acc+sg.l>=t){var u=(t-acc)/sg.l;MARK.push({x:P.mark[0]+lerp(sg.a[0],sg.b[0],u)*ms,y:P.mark[1]+lerp(sg.a[1],sg.b[1],u)*ms,z:1.12,b:.45+r()*.55,ph:r()*6.28});break}acc+=sg.l}}
  MARK.cx=P.mark[0];MARK.cy=P.mark[1];MARK.sc=ms;
  /* chapters: designed figure + one star per work */
  WORKS=[];
  var DEP={film:1.10,photo:.92,objects:1.04,spaces:1.07,about:.95,sound:.88};
  CH.forEach(function(c,ci){var cen=P[c.k];c.cx=cen[0];c.cy=cen[1];c.stars=[];c.edges=c.sh.e;c.z=DEP[c.k]||1;c._ext=null;
    c.sh.s.forEach(function(s){c.stars.push({x:c.cx+(s[0]-.5)*FIG_W,y:c.cy+(s[1]-.5)*FIG_H,b:s[2],stray:!!s[3],ph:r()*6.28,z:c.z+(r()-.5)*.08})});
    var n=c.works.length,anchors=c.stars.map(function(s,i){return i}).filter(function(i){return !c.stars[i].stray}).sort(function(a,b){return c.stars[b].b-c.stars[a].b});
    var dmin=Math.sqrt(FIG_W*FIG_H/(Math.max(n,anchors.length)*2.1)),pts=[];
    c.stars.forEach(function(s){pts.push([s.x,s.y])});
    c.card=Math.min(9,dmin*.36);c.dmin=dmin;
    var rr=seeded(31+ci*17);
    c.works.forEach(function(w,i){var x,y;
      if(i<anchors.length&&i<n){var s=c.stars[anchors[i]];x=s.x;y=s.y;s.work=i;w.anchor=1}
      else{var tries=0,best=null,bd=-1;while(tries++<400){var px=c.cx+(rr()-.5)*FIG_W*1.06,py=c.cy+(rr()-.5)*FIG_H*1.2,dm=1e9;
          for(var q=0;q<pts.length;q++){var dd=Math.hypot(pts[q][0]-px,pts[q][1]-py);if(dd<dm)dm=dd}
          if(dm>bd){bd=dm;best=[px,py]}if(dm>dmin)break}x=best[0];y=best[1];pts.push(best)}
      w.x=x;w.y=y;w.c=c;w.i=i;w.ph=rr()*6.28;w.z=w.anchor?c.stars[anchors[i]].z:c.z+(rr()-.5)*.1;
      var ar=w.ar||(w.kind==='track'?2.4:w.kind==='poem'?.8:1.5);w.ar=ar;
      w.cw=ar>=1?c.card:c.card*ar;w.chh=ar>=1?c.card/ar:c.card;
      WORKS.push(w)})});
  /* depth layers: far field (z<1) and near dust (z>1): only seen as parallax when you move or zoom */
  FIELD=[];var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1];
  for(i=0;i<1100;i++)FIELD.push({x:BOX[0]-bw*.8+r()*bw*2.6,y:BOX[1]-bh*.8+r()*bh*2.6,z:.18+Math.pow(r(),1.6)*.7,b:r()<.06?.9+r()*.5:.25+r()*.5,ph:r()*6.28,tw:r()<.4});
  DUST=[];for(i=0;i<46;i++)DUST.push({x:BOX[0]-bw*.3+r()*bw*1.6,y:BOX[1]-bh*.3+r()*bh*1.6,z:1.7+r()*1.6,rad:8+r()*26,a:.04+r()*.07});
}
/* ---------- camera ---------- */
var cam={x:0,y:0,s:1},S0=1,S0F=1,SMAX=60,T={x:0,y:0,vx:0,vy:0,tx:0,ty:0},glide=null,lastIn=0,motion=0;
function fitCam(){var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1],top=56,bot=64;var side=PORT?12:Math.max(96,W*.14);S0=Math.min((W-side*2)/bw,(H-top-bot)/bh)*.96;S0F=Math.min(W/bw,(H-top-bot)/bh)*.96;if(!PORT)S0=Math.min(S0,1.05);
  var minCard=1e9;CH.forEach(function(c){minCard=Math.min(minCard,c.card)});SMAX=Math.min(W,H)*.86/minCard;
  return {x:(BOX[0]+BOX[2])/2,y:(BOX[1]+BOX[3])/2-(top-bot)/2/S0,s:S0}}
function zf(){return cam.s/S0}
/* the chapter the camera is in. It takes hold once the zoom is past about 0.6 of that chapter's fit, and lets go under half. */
var LOCK=null,SPR={vx:0,vy:0},SIDE=0;
function fitS(){return Math.min(W*.92/FIG_W,(H-120)*.9/FIG_H)}
function lockS(){return Math.max(fitS()*.62,S0*1.25)}
function unlockS(){return Math.max(fitS()*.5,S0*1.1)}
function chapterAt(wx,wy){var best=CH[0],bd=1e18;CH.forEach(function(c){var d=Math.hypot((c.cx-wx)/FIG_W,(c.cy-wy)/FIG_H);if(d<bd){bd=d;best=c}});return best}
function syncLock(wx,wy){if(LOCK){if(cam.s<unlockS())LOCK=null}else if(cam.s>=lockS())LOCK=chapterAt(wx==null?cam.x:wx,wy==null?cam.y:wy)}
function ext(c){if(c._ext)return c._ext;var e=[1e9,-1e9,1e9,-1e9];
  function add(x,y){if(x<e[0])e[0]=x;if(x>e[1])e[1]=x;if(y<e[2])e[2]=y;if(y>e[3])e[3]=y}
  c.stars.forEach(function(q){add(q.x,q.y)});c.works.forEach(function(w){add(w.x,w.y)});return c._ext=e}
function nearestWork(c,wx,wy){var best=null,bd=1e18;c.works.forEach(function(w){var d=Math.hypot(w.x-wx,w.y-wy);if(d<bd){bd=d;best=w}});return best}
/* where the camera's centre may rest. Whole field: only as far as keeps the field in frame, which at rest is nowhere at all.
   In a chapter: across its stars, a little at the fit and all the way to the last tile once you are among them. */
function panBounds(){var vw=W/cam.s,vh=H/cam.s;
  if(LOCK){var e=ext(LOCK),ew=Math.max(1,e[1]-e[0]),eh=Math.max(1,e[3]-e[2]),mx=(e[0]+e[1])/2,my=(e[2]+e[3])/2,m=Math.min(W,H)*.2/cam.s;
    var hx=ew/2*clamp(1.12-vw/ew,.1,1)+m,hy=eh/2*clamp(1.12-vh/eh,.1,1)+m;return [mx-hx,mx+hx,my-hy,my+hy]}
  var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1],fx=(BOX[0]+BOX[2])/2,fy=(BOX[1]+BOX[3])/2+4/S0;
  /* one-build: the desktop cap (S0 <= 1.05) shows the field smaller, which left almost no room to pan just inside it (a 60px drag
     moved 26px). The free travel is measured in screen pixels at Fable's own uncapped fit (S0F) at the same zoom step, so
     the drag stays 1:1 exactly as in Fable's pass while the field keeps the capped size. Phones: S0F == S0, unchanged. */
  var zs=zf()*Math.max(S0,S0F),qx=Math.max(0,(bw*1.04*zs-W)/2)/cam.s,qy=Math.max(0,(bh*1.04*zs+120-H)/2)/cam.s;return [fx-qx,fx+qx,fy-qy,fy+qy]}
/* resistance past the edge: the further the finger goes, the less the field follows. LIM is the most it will ever give. */
function LIM(){return clamp(Math.min(W,H)*.14,44,120)*(reduced()?.5:1)}
function rub(d,lim){var a=Math.abs(d);return (d<0?-1:1)*lim*(1-1/(a*.55/lim+1))}
function unrub(d,lim){var a=Math.min(Math.abs(d),lim*.985);return (d<0?-1:1)*a*lim/(.55*(lim-a))}
function overPx(){var b=panBounds();return [(cam.x-clamp(cam.x,b[0],b[1]))*cam.s,(cam.y-clamp(cam.y,b[2],b[3]))*cam.s]}
/* the finger's own position (1:1), and where the camera shows it */
function rawFromCam(){var b=panBounds(),lim=LIM(),cx=clamp(cam.x,b[0],b[1]),cy=clamp(cam.y,b[2],b[3]);
  return [cx+unrub((cam.x-cx)*cam.s,lim)/cam.s,cy+unrub((cam.y-cy)*cam.s,lim)/cam.s]}
function applyRaw(r){var b=panBounds(),lim=LIM(),cx=clamp(r[0],b[0],b[1]),cy=clamp(r[1],b[2],b[3]);
  cam.x=cx+rub((r[0]-cx)*cam.s,lim)/cam.s;cam.y=cy+rub((r[1]-cy)*cam.s,lim)/cam.s}
/* let go past an edge and the camera comes back on the tilt's spring (critically damped) */
function settlePan(dt){var b=panBounds(),w=reduced()?40:9;
  ['x','y'].forEach(function(a,i){var c=clamp(cam[a],b[i*2],b[i*2+1]),e=cam[a]-c,v=a==='x'?'vx':'vy';
    if(Math.abs(e)*cam.s<.05&&Math.abs(SPR[v])*cam.s<.5){if(e)cam[a]=c;SPR[v]=0;return}
    var k=Math.exp(-w*dt),q=SPR[v]+w*e;cam[a]=c+(e+q*dt)*k;SPR[v]=(SPR[v]-w*q*dt)*k;motion=Math.max(motion,.5)})}
/* a zoom stops at the open view of the tile it is heading for */
function zoomCap(wx,wy){if(!LOCK)return SMAX*1.15;var nw=nearestWork(LOCK,wx,wy);return Math.min(SMAX*1.15,Math.max(deepS(nw,.82),fitS()))}
/* depth projection: z=1 is the flat plane. Far layers scale less while zoomed (fly-through), and tilt offsets each layer by
   its depth. At rest (zoom 1, tilt 0) every layer lines up: flat. */
function zE(z){return 1+(z-1)*(1-sstep(1.6,5,zf()))}
function tiltK(z){var d=Math.abs(z-1);return (2.2+2.6*clamp(1-d/.3,0,1))*(reduced()?.4:1)}
function proj(x,y,z,o){var k=Math.pow(zf(),(z-1)*.38),s=cam.s*k,tk=(z-1)*tiltK(z);o=o||[0,0,0];
  o[0]=W/2+(x-cam.x)*s+T.x*tk;o[1]=H/2+(y-cam.y)*s+T.y*tk;o[2]=s;return o}
function toWorld(px,py){return [cam.x+(px-W/2)/cam.s,cam.y+(py-H/2)/cam.s]}
function zoomAt(px,py,ns){var a=toWorld(px,py),s0=cam.s,ask=ns/s0;ns=clamp(ns,S0*.7,Math.max(cam.s,zoomCap(a[0],a[1])));cam.s=ns;var b=toWorld(px,py);cam.x+=a[0]-b[0];cam.y+=a[1]-b[1];syncLock(a[0],a[1]);
  /* fly in on the cluster, land on a tile: as tiles resolve, a zoom in homes on the tile nearest to where you are heading,
     so the way down never passes through the dark between stars */
  if(LOCK&&ask>1){var w=nearestWork(LOCK,(a[0]+cam.x)/2,(a[1]+cam.y)/2),cp=cardPx(w),k=(1-1/ask)*sstep(24,110,cp);   /* asking for more at the stop still brings the tile in */
    if(k>0){var off=cp>=110?deepOff(w,cam.s):[0,0];cam.x+=(w.x+off[0]-cam.x)*k;cam.y+=(w.y+off[1]-cam.y)*k}}
  clampPan()}
/* the hard stop, well outside the soft edge: the spring does the real work */
function clampPan(){var b=panBounds(),mx=W*.45/cam.s,my=H*.45/cam.s;cam.x=clamp(cam.x,b[0]-mx,b[1]+mx);cam.y=clamp(cam.y,b[2]-my,b[3]+my)}
function glideTo(tx,ty,ts,ms){firstTouch();ts=clamp(ts,S0,SMAX);SPR.vx=SPR.vy=0;
  if(ts>=lockS())LOCK=chapterAt(tx,ty);else if(ts<unlockS())LOCK=null;   /* a glide carries the lock to where it is going */
  glide={x0:cam.x,y0:cam.y,s0:cam.s,x1:tx,y1:ty,s1:ts,t0:now(),ms:(ms||950)*(reduced()?.6:1)}}
function stepGlide(t){var G=glide,p=clamp((t-G.t0)/G.ms,0,1),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
  var s=G.s0*Math.pow(G.s1/G.s0,e),k=Math.abs(G.s1-G.s0)<1e-9?e:(s-G.s0)/(G.s1-G.s0);cam.s=s;cam.x=lerp(G.x0,G.x1,k);cam.y=lerp(G.y0,G.y1,k);
  motion=Math.max(motion,.8);if(p>=1)glide=null}
/* ---------- input ---------- */
var HOVER=matchMedia('(hover: hover) and (pointer: fine)').matches,PT=new Map(),drag=null,pinch=null,lastTap={t:0,x:0,y:0},tiltOn=false,orient={b:null,g:null,b0:null,g0:null};
function firstTouch(){HINT.classList.add('gone')}
/* gesture lock (Gill 4:29): one finger = look around / pan; two fingers = pinch, and the pinch always wins. Once a second
   finger lands the drag is dropped (its tilt released), and until every finger is up no drag can start again, so a drag
   can never start, steal or cancel a pinch. Extra fingers beyond two are ignored. */
var gLock=false;
cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);PT.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:now()});lastIn=now();firstTouch();glide=null;FL=null;
  if(PT.size===1&&!gLock&&!pinch){drag={id:e.pointerId,moved:0,vx:0,vy:0,lt:now(),raw:null,ax:0,ay:0};SPR.vx=SPR.vy=0;clearTimeout(cv._lt)}
  else if(!pinch&&PT.size>=2){drag=null;gLock=true;if(!tiltOn){T.tx=0;T.ty=0}var ids=[...PT.keys()].slice(0,2),a=ids.map(function(i){return PT.get(i)});
    pinch={ids:ids,d0:Math.max(10,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),s0:cam.s,m:[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2]}}});
var RESTTILT=(function(){try{return localStorage.getItem('gj.tilt.on')==='1'}catch(e){return false}})();
function restTiltSync(){try{RESTTILT=localStorage.getItem('gj.tilt.on')==='1'}catch(e){}if(!RESTTILT&&!PT.size&&!tiltOn){T.tx=0;T.ty=0}}
addEventListener('gj-tog',function(e){if(e.detail&&e.detail.k==='gj.tilt.on')restTiltSync()});addEventListener('storage',function(e){if(e.key==='gj.tilt.on')restTiltSync()});
cv.addEventListener('pointermove',function(e){var p=PT.get(e.pointerId);
  if(!p){if(RESTTILT&&e.pointerType==='mouse'&&HOVER&&!tiltOn){T.tx=(e.clientX-W/2)*.035;T.ty=(e.clientY-H/2)*.035}return}   /* flat at rest (Fable); one-build: the stable resting tilt returns only with Tune's 'resting tilt' on (gj.tilt.on) */
  var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;lastIn=now();
  if(pinch){if(pinch.ids.indexOf(e.pointerId)<0)return;var a=pinch.ids.map(function(i){return PT.get(i)}),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m=[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2];
    zoomAt(m[0],m[1],pinch.s0*d/pinch.d0);cam.x-=(m[0]-pinch.m[0])/cam.s;cam.y-=(m[1]-pinch.m[1])/cam.s;pinch.m=m;clampPan();motion=1;return}
  if(gLock)return;
  if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);drag.ax+=dx;drag.ay+=dy;if(drag.moved<6)return;
    dx=drag.ax;dy=drag.ay;drag.ax=drag.ay=0;   /* the few pixels spent deciding it is a drag are not lost */
    var t=now(),dt=Math.max(8,t-drag.lt);drag.lt=t;drag.vx=lerp(drag.vx,dx/dt,.4);drag.vy=lerp(drag.vy,dy/dt,.4);
    /* 1:1 from the first pixel (it used to ramp in between 1.12x and 1.8x, so a freshly opened chapter barely moved) */
    if(!drag.raw)drag.raw=rawFromCam();drag.raw[0]-=dx/cam.s;drag.raw[1]-=dy/cam.s;applyRaw(drag.raw);motion=Math.max(motion,.6);
    /* the look-around (sketch-3d's one-finger drag): layers slide apart by depth while you drag, then settle flat */
    if(depthMode()!=='flat'){T.tx=clamp(T.tx+dx*.5,-70,70);T.ty=clamp(T.ty+dy*.5,-70,70);motion=1}}});
function up(e){var p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
  if(!PT.size)gLock=false;
  if(pinch){if(pinch.ids.indexOf(e.pointerId)>=0){pinch=null;settleZoom()}drag=null;return}
  if(gLock){drag=null;return}
  if(drag&&drag.id===e.pointerId){var dur=now()-p.t0;
    if(drag.moved<10&&dur<350)tap(e.clientX,e.clientY);
    else{var ov=overPx();if(Math.abs(ov[0])<2&&Math.abs(ov[1])<2&&zf()>1.02&&now()-drag.lt<90)fling(drag.vx,drag.vy);clearTimeout(cv._lt);if(!FL)cv._lt=setTimeout(function(){land(false)},240)}   /* fling as before (but not after the finger has stopped and held); past an edge it is the spring's turn */
    drag=null;if(!tiltOn&&depthMode()!=='hold'){T.tx=0;T.ty=0}}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!tiltOn&&!PT.size){T.tx=0;T.ty=0}});
var FL=null;function fling(vx,vy){if(Math.hypot(vx,vy)<.15)return;FL={vx:vx,vy:vy,t:now()}}
function settleZoom(){if(cam.s<S0){var c=fitCam();glideTo(c.x,c.y,S0,500);return}land(true)}
/* land on tiles: once tiles are being read, a zoom comes to rest on the nearest one instead of the dark between them (strict),
   and a pan that is let go with no tile in the frame drifts to the nearest one */
function land(strict){syncLock();if(!LOCK||glide||BOARD||drag||pinch||FL)return;
  var w=nearestWork(LOCK,cam.x,cam.y),px=cardPx(w);if(px<54)return;
  var ts=Math.min(cam.s,Math.max(deepS(w,.82),fitS())),off=px>=110?deepOff(w,ts):[0,0],tx=w.x+off[0],ty=w.y+off[1];
  var dpx=Math.hypot(tx-cam.x,ty-cam.y)*cam.s,sw=w.cw*cam.s/2,sh=w.chh*cam.s/2,seen=Math.abs(w.x-cam.x)*cam.s<W/2-Math.min(sw,W*.2)&&Math.abs(w.y-cam.y)*cam.s<H/2-Math.min(sh,H*.2);
  if(strict&&px>=110?dpx>Math.min(W,H)*.16:!seen)glideTo(tx,ty,ts,520)}
cv.addEventListener('wheel',function(e){e.preventDefault();lastIn=now();firstTouch();glide=null;var k=Math.exp(-e.deltaY*(e.ctrlKey?.012:.0016));zoomAt(e.clientX,e.clientY,cam.s*k);motion=1;
  clearTimeout(cv._wt);cv._wt=setTimeout(settleZoom,260)},{passive:false});
['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
addEventListener('keydown',function(e){var k=e.key;lastIn=now();firstTouch();if(BOARD&&k!=='Escape')return;
  if(k==='+'||k==='='){glideTo(cam.x,cam.y,Math.min(cam.s*2.2,zoomCap(cam.x,cam.y)),500);clearTimeout(cv._wt);cv._wt=setTimeout(settleZoom,560)}else if(k==='-'||k==='_'){stepOut()}else if(k==='Escape'){if(BOARD)closeBoard();else outOne()}
  else if(k.indexOf('Arrow')===0){var d=80/cam.s;glideTo(cam.x+(k==='ArrowRight'?d:k==='ArrowLeft'?-d:0),cam.y+(k==='ArrowDown'?d:k==='ArrowUp'?-d:0),cam.s,300)}});
function gjGet(k,d){try{var v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}}
function depthMode(){return gjGet('gj-tog-depth','rest')}
function restTilt(){return gjGet('gj.tilt.on','0')==='1'}
/* switched off in Tune: let the layers settle flat again (the device-orientation tilt, tiltOn, is a separate control) */
addEventListener('gj-tog',function(e){if(e.detail&&e.detail.k==='gj.tilt.on'&&e.detail.v!=='1'&&!tiltOn&&depthMode()!=='hold'){T.tx=0;T.ty=0}});
function markPhotos(){return gjGet('gj-tog-markphotos','mark')==='photos'}
function namesOn(){return gjGet('gj-tog-name','0')==='1'}
var RMQ=matchMedia('(prefers-reduced-motion: reduce)');
function reduced(){return RMQ.matches}
var ENTER={
  film:'src/site3d-8d21/site-3d/index.html',
  photo:'src/sky/p1/photo-lab/index.html',
  objects:'src/sky/objects-3d/index.html',
  sound:'src/dbae/sound-sketch/index.html',
  about:'src/sky/player/tonight/fable-m4/index.html#about/bio',
  spaces:'src/sky/tonight/spaces/forest-garden/index.html'
};
function enterChapter(k){
  var href=ENTER[k];
  if(k==='film'&&(gjGet('gj-tog-flatdeep','flat')==='deep'||namesOn()))href='src/sky/r/r10/index.html';
  if(href)location.href=href}
/* tap: a work glides in until it resolves (and again for more), a chapter fits its figure, the mark goes home */
function cardPx(w){return Math.max(w.cw,w.chh)*cam.s}
function tap(x,y){var t=now(),dbl=t-lastTap.t<320&&Math.hypot(x-lastTap.x,y-lastTap.y)<30&&!lastTap.hit;lastTap={t:t,x:x,y:y,hit:false};
  var o=[0,0,0],best=null,bd=1e9;
  WORKS.forEach(function(w){proj(w.x,w.y,zE(w.z),o);var px=cardPx(w),hw=Math.max(22,w.cw*cam.s/2+6),hh=Math.max(22,w.chh*cam.s/2+6);
    if(Math.abs(o[0]-x)<=hw&&Math.abs(o[1]-y)<=hh){var d=Math.hypot(o[0]-x,o[1]-y);if(d<bd){bd=d;best=w}}});
  var z=zf();
  if(best&&(z>1.8||bd<14)&&best.c.k==='film'&&cardPx(best)<110){lastTap.hit=true;openBoard(best,true);return}   /* film: dot -> its board first */
  /* the bio star opens the about/bio room (a natural way in; no URL to type) */
  if(best&&(z>1.8||bd<14)&&(best.kind==='bio'||best.slug==='bio')){lastTap.hit=true;location.href=new URL('src/sky/player/tonight/fable-m4/index.html#about/bio',location.href).href;return}
  /* one tap opens a star: straight to its open view (it used to take three taps through .22 / .5 / .82) */
  if(best&&(z>1.8||bd<14)){lastTap.hit=true;var ts=Math.max(deepS(best,.82),deepS(best,.5),deepS(best,.22)),off=deepOff(best,ts);glideTo(best.x+off[0],best.y+off[1],ts,1000);return}
  var wp=toWorld(x,y);
  for(var c=0;c<CH.length;c++){var C=CH[c];if(Math.abs(wp[0]-C.cx)<FIG_W*.62&&Math.abs(wp[1]-C.cy)<FIG_H*.75){
      var fs=Math.min(W*.92/FIG_W,(H-120)*.9/FIG_H);
      lastTap.hit=true;if(cam.s<fs*.9){glideTo(C.cx,C.cy,fs,1000);return}
      enterChapter(C.k);return}}
  if(Math.abs(wp[0]-MARK.cx)<130&&Math.abs(wp[1]-MARK.cy)<70){lastTap.hit=true;home();return}
  if(dbl){stepOut();lastTap.t=0}}
/* a work's zoom stops: picture at f of the short side, never so big that its facts fall off the screen */
function sideMode(){return W>H*1.25}
function deepS(w,f){var m=Math.min(W,H),ts=m*f/Math.max(w.cw,w.chh);
  if(f>.4){if(sideMode()){ts=Math.min(ts*1.25,(H-190)/w.chh,(W-400)/w.cw);if(f>.7&&w.strip&&w.strip.length)ts=Math.min(ts,(H-150)/(1.25*w.chh))}else ts=Math.min(ts,(H-(f>.7?250:170))/w.chh,W*.9/w.cw)}return ts}
/* where the camera sits so the picture + its facts are centred (beside in landscape, under in portrait) */
function deepOff(w,ts){var px=Math.max(w.cw,w.chh)*ts;
  if(sideMode()&&px>140){var sw=w.cw*ts,colW=Math.max(120,Math.min(340,W-(W/2+sw/2+16)-16)),fh=px>300&&w.strip?(sw-18)/4/(w.ar||1.78)+8:0;return [(colW+16)/2/ts,fh/2/ts]}
  return [0,px>240?w.chh*.5+40/ts:px>110?w.chh*.25:0]}
function stepOut(){if(zf()<1.05){home();return}var ns=Math.max(S0,cam.s/3.2);if(ns<=S0*1.05){home();return}glideTo(cam.x,cam.y,ns,800)}
function home(){var c=fitCam();glideTo(c.x,c.y,c.s,1000)}
/* up one level: an open star -> its chapter -> the whole field (Esc, the mark, ‹ out) */
function outOne(){var fs=fitS();if(LOCK&&cam.s>fs*1.35){glideTo(LOCK.cx,LOCK.cy,fs,800);return}if(zf()>1.03||overPx().some(function(v){return Math.abs(v)>2}))home()}
/* ---------- film board: dot (names) -> board -> deeper canvas detail. One pattern for every film, all from data.js.
   Poster = the film's LEAD swept frame (site posters stay masked). Missing fields are left out; title-only films show
   only the title. Back / pinch-out / Esc / ‹ back return to the dot. Nothing auto-advances. Same with Reduce Motion. */
var BD=document.getElementById('board'),BOARD=null,pushed=false;
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function filmBySlug(sl){return WORKS.find(function(w){return w.c.k==='film'&&w.slug===sl})}
function dotView(w){var ts=clamp(Math.max(cam.s,S0*2.2),S0,52/Math.max(w.cw,w.chh));return [w.x,w.y,ts]}
function openBoard(w,push,instant){
  BOARD=w;var d=dotView(w);if(instant){glide=null;cam.x=d[0];cam.y=d[1];cam.s=d[2]}else glideTo(d[0],d[1],d[2],700);
  var h='';var ttl=w.t||'';
  if(!w.masked&&w.lead)h+='<figure class="bp"><img src="'+esc(w.lead)+'" alt="frame from '+esc(ttl)+'" decoding="async"></figure>';
  h+='<div class="bf"><h2 id="bt">'+esc(ttl)+'</h2>';
  if(!w.masked){if(w.role)h+='<p class="br">'+esc(w.role)+'</p>';if(w.year)h+='<p class="by">'+esc(w.year)+'</p>';if(w.meta)h+='<p class="bm">'+esc(w.meta)+'</p>';
    if(w.credits&&w.credits.length)h+='<ul class="bc">'+w.credits.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>'}
  h+='</div>';
  if(!w.masked&&w.strip&&w.strip.length)h+='<div class="bs n'+w.strip.length+'" style="--ar:'+(w.ar||1.78)+'">'+w.strip.map(function(src,j){return '<img src="'+esc(src)+'" alt="frame '+(j+2)+' from '+esc(ttl)+'" decoding="async">'}).join('')+'</div>';
  BD.querySelector('.bw').innerHTML=h;BD.classList.toggle('masked',!!w.masked);BD.classList.toggle('side',sideMode());
  document.getElementById('bcloser').hidden=!!w.masked;
  BD.hidden=false;BD.scrollTop=0;requestAnimationFrame(function(){BD.classList.add('on')});
  if(push&&location.hash!=='#film/'+w.slug){var hs=history.state||{};history.pushState({b:w.slug,gjv:(hs.gjv||0)+1,k:'b:'+w.slug,path:(hs.path||['field']).concat('b:'+w.slug)},'','#film/'+w.slug);pushed=true}
  WHERE.textContent='film · '+ttl;lastWhere=WHERE.textContent;BD.focus({preventScroll:true})}
function hideBoard(){if(!BOARD)return;var w=BOARD;BOARD=null;BD.classList.remove('on');setTimeout(function(){if(!BOARD)BD.hidden=true},230);lastWhere='';return w}
function closeBoard(){if(!BOARD)return null;var w=BOARD;
  if(pushed&&history.state&&history.state.b){pushed=false;NAV.quiet++;history.back()}else{history.replaceState(null,'',location.pathname+location.search)}
  hideBoard();return w}
function closer(){var w=closeBoard();if(!w)return;var ts=deepS(w,.82),off=deepOff(w,ts);glideTo(w.x+off[0],w.y+off[1],ts,1000)}
addEventListener('popstate',function(){var m=/^#film\/(.+)$/.exec(location.hash);
  if(m){var w=filmBySlug(decodeURIComponent(m[1]));if(w){pushed=true;openBoard(w,false)}}else{pushed=false;hideBoard()}});
document.getElementById('bback').addEventListener('click',closeBoard);
document.getElementById('bcloser').addEventListener('click',closer);
/* gestures on the board: two-finger spread = closer, pinch-out (fingers together) = back; trackpad pinch the same */
var BT=null;
BD.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];BT={d0:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),done:0};e.preventDefault()}},{passive:false});
BD.addEventListener('touchmove',function(e){if(BT&&e.touches.length===2){e.preventDefault();if(BT.done)return;var a=e.touches[0],b=e.touches[1],r=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/BT.d0;
  if(r>1.3){BT.done=1;closer()}else if(r<.77){BT.done=1;closeBoard()}}},{passive:false});
BD.addEventListener('touchend',function(e){if(e.touches.length<2)BT=null});
BD.addEventListener('wheel',function(e){if(!e.ctrlKey)return;e.preventDefault();if(BD._wl&&now()-BD._wl<600)return;if(Math.abs(e.deltaY)<2)return;BD._wl=now();if(e.deltaY<0)closer();else closeBoard()},{passive:false});
function bootHash(){var m=/^#film\/(.+)$/.exec(location.hash);if(!m)return;var w=filmBySlug(decodeURIComponent(m[1]));if(!w)return;
  if(history.state&&history.state.b){pushed=true;firstTouch();openBoard(w,false,true);return}   /* one-build: a reload keeps the visitor's own steps */
  /* direct link: put the field under it so Back lands on the dot */
  var h=location.hash;history.replaceState({gjv:0,k:'field',path:['field']},'',location.pathname+location.search);history.pushState({b:w.slug,gjv:1,k:'b:'+w.slug,path:['field','b:'+w.slug]},'',h);pushed=true;firstTouch();openBoard(w,false,true)}
/* the mark: Fable's one-level-up, unchanged. Only at the whole field at rest (where up-one-level does nothing) does it switch
   the safelight on and off, the same state as the red dot (amb-toggle: the Mark toggles the safelight) */
function atHome(){if(BOARD||glide||FL)return false;if(zf()>1.03)return false;try{if(overPx().some(function(v){return Math.abs(v)>2}))return false}catch(e){}return true}
document.getElementById('home').addEventListener('click',function(){if(BOARD)closeBoard();else if(atHome()&&window.GJ&&GJ.set)GJ.set('gj-red',GJ.get('gj-red','0')==='1'?'0':'1');else outOne()});
document.getElementById('out').addEventListener('click',function(){if(BOARD)closeBoard();else outOne()});
/* ---------- one-build: Browser Back (Gill, Nov 14): one step to the previous place in the visitor's own path, down to the field.
   A "place" is where the camera comes to rest: the field, the field zoomed in (z), a chapter (c:k), a star (s:i), a film board
   (b:slug). Each new place is one history entry (pushState, state carries the camera, URL #at/<place>), so Back glides to
   exactly where they were, and a reload or a return from a room lands there again. Moves UP (Esc, -, the mark, ‹ out, pinch out)
   never add a step: back to the place before -> that entry is consumed; back to the field -> all steps consumed; anywhere else
   -> the current entry is replaced. So Back and Esc/‹ never double-step. At the field Back leaves the page as normal. */
var NAV={quiet:0,up:0};
function placeKey(){if(BOARD)return 'b:'+BOARD.slug;
  if(LOCK){if(cam.s>fitS()*1.35){var w=nearestWork(LOCK,cam.x,cam.y);return 's:'+WORKS.indexOf(w)}return 'c:'+LOCK.k}
  return (zf()>1.03||overPx().some(function(v){return Math.abs(v)>2}))?'z':'field'}
function navState(k,path,n){return {gjv:n,k:k,path:path,cam:{x:+cam.x.toFixed(2),y:+cam.y.toFixed(2),s:+cam.s.toFixed(4)},vw:W,vh:H}}
function navUrl(k){return location.pathname+location.search+(k==='field'?'':'#at/'+encodeURIComponent(k))}
function navSettled(){return !glide&&!FL&&!drag&&!pinch&&!PT.size&&!BOARD&&now()-lastIn>650&&Math.abs(SPR.vx)+Math.abs(SPR.vy)<.01}
function navRecord(){if(!navSettled())return;var st=history.state;if(!st||st.gjv==null)return;if(st.tune||(window.GJ&&GJ.tune&&GJ.tune.isOpen()))return;var k=placeKey(),path=st.path||['field'],up=NAV.up>0&&now()-NAV.up<4000;
  if(k===st.k){if(k!=='field'){var c=st.cam;if(!c||Math.abs(c.x-cam.x)>.5||Math.abs(c.y-cam.y)>.5||Math.abs(c.s/cam.s-1)>.01)history.replaceState(navState(k,path,st.gjv),'',navUrl(k))}return}
  NAV.up=0;
  if(k==='field'&&st.gjv>0){NAV.quiet++;history.go(-st.gjv);return}
  if(path.length>1&&path[path.length-2]===k){NAV.quiet++;history.back();return}
  if(up||k==='field'){history.replaceState(navState(k,path.slice(0,-1).concat(k),st.gjv),'',navUrl(k));return}
  history.pushState(navState(k,path.concat(k),st.gjv+1),'',navUrl(k))}
setInterval(navRecord,200);
var _outOne=outOne,_stepOut=stepOut;outOne=function(){NAV.up=now();_outOne()};stepOut=function(){NAV.up=now();_stepOut()};
addEventListener('popstate',function(){if(window.__gjTuneClose){window.__gjTuneClose=false;return}if(window.GJ&&GJ.tune&&GJ.tune.isOpen()){GJ.tune.close({fromPop:true});return}if(NAV.quiet>0){NAV.quiet--;return}var st=history.state;
  if(st&&st.b)return;   /* the board's own handler opens it */
  if(BOARD)hideBoard();FL=null;
  if(!st||!st.k||st.k==='field'||!st.cam){var c=fitCam();glideTo(c.x,c.y,c.s,900);return}
  glideTo(st.cam.x,st.cam.y,st.cam.s,850)});
/* where a recorded place sits now: its own camera on the same screen size; after a rotate/resize, the place itself */
function navTarget(k,c,vw,vh){if(!k||k==='field')return null;
  if(c&&vw===W&&vh===H)return [c.x,c.y,c.s];
  if(/^c:/.test(k)){var ch=CH.find(function(q){return q.k===k.slice(2)});return ch?[ch.cx,ch.cy,fitS()]:null}
  if(/^s:\d+$/.test(k)){var w=WORKS[+k.slice(2)];if(w){var ts=deepS(w,.82),off=deepOff(w,ts);return [w.x+off[0],w.y+off[1],ts]}return null}
  return c?[c.x,c.y,c.s*S0/(c.s0||S0)]:null}
function navJump(t){glide=null;FL=null;cam.x=t[0];cam.y=t[1];cam.s=clamp(t[2],S0*.7,SMAX);LOCK=cam.s>=lockS()?chapterAt(cam.x,cam.y):null;SPR.vx=SPR.vy=0;firstTouch()}
/* a resize (phone toolbars, rotate) used to drop the camera back to the whole field, which would read as "Back to the field" */
function navKeep(){var st=history.state;if(BOARD||!st||st.gjv==null||st.b)return;var t=navTarget(st.k,st.cam,st.vw,st.vh);if(t)navJump(t)}
function navBoot(){var st=history.state;
  if(st&&st.gjv!=null){navKeep();return}
  var m=/^#at\/(.+)$/.exec(location.hash),k=m?decodeURIComponent(m[1]):null,t=k?navTarget(k,null):null;
  history.replaceState(navState('field',['field'],0),'',location.pathname+location.search);
  if(t){navJump(t);history.pushState(navState(k,['field',k],1),'',navUrl(k))}}
/* optional device tilt (asks the phone first; off until pressed) */
var TB=document.getElementById('tilt');
/* one-build: only where a device can tilt (touch screens) */
if(window.DeviceOrientationEvent&&window.matchMedia&&matchMedia('(pointer:coarse)').matches){TB.hidden=false;TB.addEventListener('click',function(){
  function on(){tiltOn=!tiltOn;TB.setAttribute('aria-pressed',String(tiltOn));orient.b0=orient.g0=null;if(!tiltOn){T.tx=T.ty=0}}
  if(!tiltOn&&typeof DeviceOrientationEvent.requestPermission==='function'){DeviceOrientationEvent.requestPermission().then(function(r){if(r==='granted')on()}).catch(function(){})}else on()});
  addEventListener('deviceorientation',function(e){if(!tiltOn||e.beta==null)return;if(orient.b0==null){orient.b0=e.beta;orient.g0=e.gamma}
    T.tx=clamp((e.gamma-orient.g0)*2,-70,70);T.ty=clamp((e.beta-orient.b0)*2,-70,70)})}
/* ---------- media ---------- */
var IMG={};function img(src){var m=IMG[src];if(!m){m=IMG[src]=new Image();m.decoding='async';m.src=src}return m.complete&&m.naturalWidth?m:null}
var WAVE={};function wave(w){var wk=w.t+(RED?'|r':''),c=WAVE[wk];if(c)return c;c=document.createElement('canvas');c.width=480;c.height=200;var q=c.getContext('2d'),pk=w.peaks,n=pk.length,bw=480/n;
  q.fillStyle=ink('wave');q.fillRect(0,0,480,200);q.fillStyle='rgba('+tintOf(w.c)+',.9)';
  for(var i=0;i<n;i++){var h=pk[i]*150+4;q.fillRect(i*bw+bw*.2,100-h/2,bw*.6,h)}return WAVE[wk]=c}
/* ---------- draw ---------- */
var o=[0,0,0],o2=[0,0,0],labRects=[];
function free(r){for(var i=0;i<labRects.length;i++){var t=labRects[i];if(r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}labRects.push(r);return true}
function dot(x,y,rad,a,glow,gs){if(a<.01)return;g.globalAlpha=a*.85;g.drawImage(RED?GWR:(glow||GW),x-gs/2,y-gs/2,gs,gs);g.globalAlpha=a;g.fillStyle=ink('star');g.beginPath();g.arc(x,y,rad,0,6.283);g.fill()}
function wrapLines(text,maxW,maxLines){var words=String(text).split(' '),lines=[],cur='';words.forEach(function(wd){var t=cur?cur+' '+wd:wd;if(g.measureText(t).width>maxW&&cur){lines.push(cur);cur=wd}else cur=t});if(cur)lines.push(cur);
  if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/.?$/,'…')}return lines}
function draw(t){
  var z=zf(),tw=t/1000,twsBase=reduced()?1:null;RED=document.documentElement.classList.contains('rm');
  var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,ink('bg0'));bg.addColorStop(1,ink('bg1'));g.fillStyle=bg;g.fillRect(0,0,W,H);
  /* far field */
  for(var i=0;i<FIELD.length;i++){var f=FIELD[i];proj(f.x,f.y,f.z,o);if(o[0]<-4||o[0]>W+4||o[1]<-4||o[1]>H+4)continue;
    var tws=twsBase!=null?twsBase:(f.tw?.75+.25*Math.sin(tw*(1.2+f.ph)+f.ph*9):1),rad=Math.max(.45,f.b*f.z*1.25*Math.min(2.2,Math.pow(z,.18)));
    g.globalAlpha=clamp(f.b*f.z*1.1*tws,0,1);g.fillStyle=ink('far');g.fillRect(o[0]-rad/2,o[1]-rad/2,rad,rad)}
  g.globalAlpha=1;
  /* the mark (z 1.12) */
  var markA=1-sstep(4,10,z);if(markA>.01){g.strokeStyle='rgba('+ink('line')+','+(.16*markA)+')';g.lineWidth=1;
    D.strokes.forEach(function(s){g.beginPath();s.forEach(function(q,j){proj(MARK.cx+q[0]*MARK.sc,MARK.cy+q[1]*MARK.sc,1.12,o);if(j)g.lineTo(o[0],o[1]);else g.moveTo(o[0],o[1])});g.stroke()});
    MARK.forEach(function(m){proj(m.x,m.y,m.z,o);var tws=twsBase!=null?1:.8+.2*Math.sin(tw*1.4+m.ph);dot(o[0],o[1],(.7+m.b*1.1)*Math.min(2,Math.pow(z,.3)),markA*m.b*tws,GW,10+m.b*14)});
    if(markPhotos()&&markA>.2){var shown=0;WORKS.forEach(function(w){if(w.c.k!=='objects'||!w.img||shown>5)return;shown++;
      proj(w.x*.35+MARK.cx*.65,w.y*.35+MARK.cy*.65,1.4,o);var im=img(w.img);if(!im)return;g.globalAlpha=.9*markA;g.drawImage(im,o[0]-28,o[1]-36,56,72)});g.globalAlpha=1}
    proj(MARK.cx,MARK.cy+78,1.12,o);var fs=clamp(13*Math.pow(z,.5),11,22);g.font='300 '+fs.toFixed(1)+'px Poppins, sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.globalAlpha=markA*.7*(1-sstep(1.6,3,z));g.fillStyle=ink('lo');g.fillText(D.poemLine,o[0],o[1]);g.globalAlpha=1}
  labRects=[];
  /* chapters: hairline figure + its stars */
  CH.forEach(function(c){
    var figA=1-.65*sstep(5,16,z);g.lineWidth=1;g.strokeStyle='rgba('+tintOf(c)+','+(.30*figA)+')';
    c.edges.forEach(function(e){var a=c.stars[e[0]],b=c.stars[e[1]];proj(a.x,a.y,zE(a.z),o);proj(b.x,b.y,zE(b.z),o2);g.beginPath();g.moveTo(o[0],o[1]);g.lineTo(o2[0],o2[1]);g.stroke()});
    c.stars.forEach(function(s){if(s.work!=null)return;proj(s.x,s.y,zE(s.z),o);var tws=.8+.2*Math.sin(tw*1.3+s.ph);dot(o[0],o[1],(.6+s.b*1.3)*Math.min(1.8,Math.pow(z,.25)),(s.stray?.5:.85)*s.b*tws*figA,glowOf(c),8+s.b*18)});
  });
  /* works: star → picture → facts (drawn small to large) */
  var vis=[];WORKS.forEach(function(w){proj(w.x,w.y,zE(w.z),o);var px=cardPx(w),hx=w.cw*cam.s/2+260,hy=w.chh*cam.s/2+260;
    if(o[0]<-hx||o[0]>W+hx||o[1]<-hy||o[1]>H+hy)return;vis.push([w,o[0],o[1],px])});
  vis.sort(function(a,b){return a[3]-b[3]});
  var sp=Math.min.apply(null,CH.map(function(c){return c.dmin}))*cam.s;
  vis.forEach(function(v){var w=v[0],x=v[1],y=v[2],px=v[3],c=w.c,sw=w.cw*cam.s,sh=w.chh*cam.s;
    var imA=sstep(8,30,px),dotA=1-sstep(14,34,px),tws=.82+.18*Math.sin(tw*1.25+w.ph);
    if(dotA>0){var more=w.anchor?1:.22+.78*sstep(1.15,2.6,z),b=w.anchor?.95:.7*(.6+.4*more),gs=(10+b*20)*(1+imA*1.5);dot(x,y,(.9+b*1.2)*(w.anchor?1:.55+.45*more)*Math.min(2.2,Math.pow(z,.28)),dotA*b*tws*more,glowOf(c),gs)}
    if(imA>0){var im=w.img?img(w.img):null;g.globalAlpha=imA;
      var bx=x-sw/2,by=y-sh/2;
      if(w.kind==='track'){g.drawImage(wave(w),bx,by,sw,sh)}
      else if(im){g.drawImage(im,bx,by,sw,sh)}
      else{g.fillStyle=ink('card');g.fillRect(bx,by,sw,sh);
        if(px>30){var tf=clamp(sw*.09,9,26);g.font='400 '+tf.toFixed(1)+'px "Julius Sans One", sans-serif';g.fillStyle='rgba('+tintOf(c)+',.95)';g.textAlign='center';g.textBaseline='middle';
          var lines=wrapLines(w.t||c.nm,sw*.84,3);lines.forEach(function(l,j){g.fillText(l,x,y+(j-(lines.length-1)/2)*tf*1.25)})}}
      g.strokeStyle='rgba('+tintOf(c)+','+(.35*imA)+')';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,sw-1,sh-1);g.globalAlpha=1;
      /* the poem appears inside its card once there is room (verbatim lines) */
      if(w.lines&&px>170){var pa=sstep(170,260,px),lf=clamp(sw*.045,8,17);g.globalAlpha=pa;g.font='300 '+lf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle=ink('hi');g.textAlign='center';g.textBaseline='top';
        var y0=by+sh*.2;w.lines.forEach(function(l,j){g.fillText(l,x,y0+j*lf*1.32)});g.globalAlpha=1}
      labRects.push({x:bx,y:by,w:sw,h:sh})}
    /* facts below the picture, more the closer you are */
    /* landscape: facts sit beside the picture (so nothing falls under the hint or off the bottom); portrait: under it */
    var side=sideMode()&&px>140,tx=side?x+sw/2+16:x,colW=side?Math.max(120,Math.min(340,W-tx-16)):Math.max(sw,200),al=side?'left':'center';
    var fy=side?y-sh/2:y+sh/2+8,tA=sstep(60,110,px),title=w.t;
    if(tA>0&&title&&!(w.masked||(!w.img&&w.kind!=='track'))){var tf2=clamp(px*.075,11,24);g.font='400 '+tf2.toFixed(1)+'px "Julius Sans One", sans-serif';g.textAlign=al;g.textBaseline='top';g.globalAlpha=tA;g.fillStyle=ink('hi');
      wrapLines(title,side?colW:Math.max(sw,160),side?3:2).forEach(function(l){g.fillText(l,tx,fy);fy+=tf2*1.25});g.globalAlpha=1}
    var mA=sstep(140,200,px);if(mA>0){var parts=[];if(w.role)parts.push(w.role);if(w.sub)parts.push(w.sub);if(w.meta)parts.push(w.meta);if(w.year&&String(w.meta||'').indexOf(String(w.year))<0)parts.push(w.year);
      if(parts.length){var mf=clamp(px*.04,10,15);g.font='300 '+mf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle=ink('fact');g.textAlign=al;g.textBaseline='top';g.globalAlpha=mA;
        wrapLines(parts.join(' · '),colW,side?3:2).forEach(function(l){g.fillText(l,tx,fy);fy+=mf*1.35});g.globalAlpha=1}}
    var cA=sstep(230,300,px);if(cA>0&&w.credits&&w.credits.length){var cf=clamp(px*.032,10,13);g.font='300 '+cf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle=ink('lo');g.globalAlpha=cA;g.textAlign=al;g.textBaseline='top';
      w.credits.slice(0,3).forEach(function(l){wrapLines(l,side?colW:Math.max(sw,220),2).forEach(function(q){g.fillText(q,tx,fy);fy+=cf*1.35})});g.globalAlpha=1}
    if(side)fy=y+sh/2+2;
    /* strip EXPANDS as you zoom closer: its frames reveal one after another with the zoom (no timers, no auto-advance) */
    /* reveal band runs from just past the middle tap-stop to the deepest tap-stop, so every screen size gets all frames */
    var pxMax=Math.max(w.cw,w.chh)*Math.min(SMAX,deepS(w,.82)),lo=Math.max(240,pxMax*.7),st=Math.max(12,(pxMax*.99-lo)/Math.max(1,(w.strip||[]).length));
    var sA=sstep(lo,lo+st,px);if(sA>0&&w.strip){var n=Math.max(4,w.strip.length),gap=6,fw=(sw-gap*(n-1))/n,fh=fw/(w.ar||1.78);fy+=6;
      w.strip.forEach(function(s,j){var a=sstep(lo+j*st,lo+(j+1)*st,px);if(a<=0)return;var k=.72+.28*a,ww=fw*k,hh=fh*k,fx=x-sw/2+j*(fw+gap)+(fw-ww)/2,fyy=fy+(fh-hh)/2;g.globalAlpha=a;
        var im=img(s);if(im)g.drawImage(im,fx,fyy,ww,hh);else{g.fillStyle=ink('card');g.fillRect(fx,fyy,ww,hh)}g.strokeStyle='rgba('+tintOf(c)+',.3)';g.strokeRect(fx+.5,fyy+.5,ww-1,hh-1)});g.globalAlpha=1}
    w._scr=[x,y,px]});
  /* work names at mid zoom (before the pictures take over), decluttered: only the chapter in view */
  var lk=LOCK||nearestChapter();
  if(z>1.8||namesOn()){vis.forEach(function(v){var w=v[0],px=v[3];if(w.c!==lk||!w.t)return;var na=(namesOn()?Math.max(sstep(1.8,3,z),.85):sstep(1.8,3,z))*(1-sstep(40,75,px));if(na<.02)return;
    g.font='300 12px Poppins, sans-serif';var lab=w.t.length>26?w.t.slice(0,25)+'…':w.t,tw2=g.measureText(lab).width,sh=w.chh*cam.s,r={x:v[1]+8+Math.max(0,w.cw*cam.s/2),y:v[2]-9,w:tw2+6,h:18};
    if(r.x+r.w>W-4)r.x=v[1]-8-r.w-Math.max(0,w.cw*cam.s/2);if(r.y<60||r.y>H-30)return;if(!free(r))return;
    g.globalAlpha=na;g.fillStyle=ink('lab');g.fillRect(r.x-2,r.y,r.w+2,r.h);g.fillStyle=ink('hi');g.textAlign='left';g.textBaseline='middle';g.fillText(lab,r.x+2,v[2]);g.globalAlpha=1})}
  /* chapter names + counts (the flat hub's labels), fading as their works take over */
  var cnA=1-sstep(2.2,3.6,z);if(cnA>.01)CH.forEach(function(c){proj(c.cx,c.cy+FIG_H*.5+14,zE(c.z),o);var fs=clamp(12*Math.pow(z,.35),11,18);
    g.font='400 '+fs.toFixed(1)+'px "Julius Sans One", sans-serif';g.textAlign='center';g.textBaseline='top';g.globalAlpha=cnA;g.fillStyle='rgba('+tintOf(c)+',1)';g.fillText(c.nm.toUpperCase(),o[0],o[1]);
    g.font='300 '+(fs*.82).toFixed(1)+'px Poppins, sans-serif';g.fillStyle=ink('lo');g.fillText(c.count,o[0],o[1]+fs*1.35);g.globalAlpha=1});
  /* near dust: soft out-of-focus motes, only visible when you move or zoom (depth cue) */
  var ma=motion;if(ma>.01)DUST.forEach(function(d){proj(d.x,d.y,d.z,o);var rad=d.rad*Math.pow(z,.5);if(o[0]<-rad||o[0]>W+rad||o[1]<-rad||o[1]>H+rad)return;g.globalAlpha=d.a*ma;g.drawImage(RED?GWR:GW,o[0]-rad,o[1]-rad,rad*2,rad*2)});
  g.globalAlpha=1;
  updateWhere(lk,z);
}
function nearestChapter(){var w=[cam.x,cam.y],best=CH[0],bd=1e18;CH.forEach(function(c){var d=Math.hypot(c.cx-w[0],c.cy-w[1]);if(d<bd){bd=d;best=c}});return best}
var lastWhere='';function updateWhere(c,z){if(BOARD)return;var s='field';
  if(LOCK||z>1.5){s=c.nm;var bw=null,bd=1e9;WORKS.forEach(function(w){if(w.c!==c||!w._scr)return;var d=Math.hypot(w._scr[0]-W/2,w._scr[1]-H/2);if(w._scr[2]>60&&d<bd){bd=d;bw=w}});
    if(bw&&bw.t)s=c.nm+' · '+bw.t}
  if(s!==lastWhere){WHERE.textContent=s;lastWhere=s;/* one-build: ‹ out only shows once you are in */var ob=document.getElementById('out');if(ob)ob.hidden=(s==='field')}}
/* ---------- loop ---------- */
var last=now();
function frame(t){requestAnimationFrame(frame);var dt=Math.min(.05,(t-last)/1000);last=t;
  if(glide)stepGlide(t);
  if(FL){var k=Math.exp(-dt*4.5),pb=panBounds();cam.x-=FL.vx*1000*dt/cam.s;cam.y-=FL.vy*1000*dt/cam.s;FL.vx*=k;FL.vy*=k;
    if(cam.x<pb[0]||cam.x>pb[1]){cam.x=clamp(cam.x,pb[0],pb[1]);FL.vx=0}if(cam.y<pb[2]||cam.y>pb[3]){cam.y=clamp(cam.y,pb[2],pb[3]);FL.vy=0}
    if(Math.hypot(FL.vx,FL.vy)<.02){FL=null;land(false)}motion=Math.max(motion,.6)}
  if(!glide&&!drag&&!pinch){syncLock();if(!FL&&!BOARD)settlePan(dt)}
  /* tilt spring: critically damped, settles flat in ~0.6 s after you let go */
  var wv=reduced()?40:9;['x','y'].forEach(function(a){var tg=a==='x'?T.tx:T.ty,v=a==='x'?'vx':'vy',e=T[a]-tg,kk=Math.exp(-wv*dt),c=T[v]+wv*e;T[a]=tg+(e+c*dt)*kk;T[v]=(T[v]-wv*c*dt)*kk});
  if(!drag&&!pinch&&!glide&&!FL)motion*=Math.exp(-dt*2.2);
  draw(t)}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;var p=W<H*1.05;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);g.setTransform(DPR,0,0,DPR,0,0);
  var rebuild=p!==PORT||!WORKS.length;PORT=p;if(rebuild)build();var c=fitCam();cam.x=c.x;cam.y=c.y;cam.s=c.s;LOCK=null;SPR.vx=SPR.vy=0}
addEventListener('resize',function(){resize();navKeep();if(BOARD){BD.classList.toggle('side',sideMode());var d=dotView(BOARD);cam.x=d[0];cam.y=d[1];cam.s=d[2]}});resize();if(/^#film\//.test(location.hash))bootHash();else navBoot();requestAnimationFrame(frame);
/* QA hooks */
window.__cb={st:function(){return{z:+zf().toFixed(3),cam:{x:+cam.x.toFixed(1),y:+cam.y.toFixed(1),s:+cam.s.toFixed(3)},where:lastWhere,glide:!!glide,tilt:[+T.x.toFixed(1),+T.y.toFixed(1)],gest:{pinch:!!pinch,drag:!!drag,lock:gLock,pts:PT.size},works:WORKS.length,S0:S0,SMAX:SMAX,chapter:LOCK?LOCK.k:null,over:overPx().map(function(v){return +v.toFixed(1)}),fling:!!FL,fit:+fitS().toFixed(3)}},
  out:outOne,
  work:function(ch,i){var c=CH.find(function(q){return q.k===ch});var w=c.works[i];return{x:w.x,y:w.y,scr:proj(w.x,w.y,1,[0,0,0]).slice(0,2),t:w.t}},
  board:function(){return BOARD?{slug:BOARD.slug,t:BOARD.t,hash:location.hash,strip:(BOARD.strip||[]).length}:null},open:function(sl){var w=filmBySlug(sl);openBoard(w,true);return w.t},close:closeBoard,closer:closer,
  film:function(sl){var w=filmBySlug(sl);return{i:w.i,x:w.x,y:w.y,scr:proj(w.x,w.y,zE(w.z),[0,0,0]).slice(0,2),px:cardPx(w)}},
  glideTo:glideTo,home:home,focus:function(ch,i,f){var c=CH.find(function(q){return q.k===ch}),w=c.works[i],ts=deepS(w,f),off=deepOff(w,ts);glideTo(w.x+off[0],w.y+off[1],ts,900);return w.t},chapter:function(ch){var C=CH.find(function(q){return q.k===ch});glideTo(C.cx,C.cy,Math.min(W*.92/FIG_W,(H-120)*.9/FIG_H),900)},proj:function(x,y){return proj(x,y,1,[0,0,0]).slice(0,2)}};
})();
