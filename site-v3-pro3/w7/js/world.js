/* site-v3-pro3 · world.js (w7) — ONE sky, ONE camera.
   The whole site is one canvas world: FAR (every chapter around ᑕᐣᓯ) → MID (one chapter's constellation) → CLOSE (its stars grow into
   thumbnails in place) → LAYER (a work, the reel, the player or a page opens out of its star like an iris, and closes back into it).
   Every level change is one camera move (≈520 ms) anchored on the star you pressed. Press once = select (its name), press again = open.
   One way back: ‹, browser Back, pinch-out, Esc — each goes out exactly one level (zooming out is history.back(), never a new entry).
   The breadcrumb (real names, tappable) and the depth rail + mini-map all read one source of truth: `cur`. */
(function(){
'use strict';
var D=document.documentElement,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RMQ=matchMedia('(prefers-reduced-motion: reduce)');function anim(){return !RMQ.matches}
function SLOW(){return window.__slow||1}
var ORDER=['film','photo','objects','sound','about'],ANG={about:-90,photo:-18,objects:54,sound:126,film:198};
var SH={"film":{"t":"150,220,255","s":[[0.105,0.21,0.92,0],[0.89,0.13,0.74,0],[0.93,0.81,0.96,0],[0.065,0.86,0.68,0],[0.209,0.266,0.34,0],[0.33,0.252,0.44,0],[0.465,0.272,0.3,0],[0.685,0.23,0.4,0],[0.809,0.261,0.3,0],[0.201,0.781,0.4,0],[0.297,0.725,0.28,0],[0.431,0.764,0.44,0],[0.533,0.752,0.3,0],[0.679,0.775,0.38,0],[0.816,0.721,0.3,0],[0.075,0.53,0.36,0],[0.485,0.5,0.5,0],[0.98,0.44,0.22,1],[0.025,0.3,0.2,1],[0.58,0.04,0.2,1],[0.35,0.95,0.24,1]],"e":[[0,1],[1,2],[2,3],[3,15]]},"photo":{"t":"170,245,212","s":[[0.505,0.51,1.0,0],[0.521,0.164,0.82,0],[0.686,0.425,0.62,0],[0.654,0.71,0.9,0],[0.49,0.851,0.58,0],[0.33,0.64,0.78,0],[0.336,0.268,0.66,0],[0.586,0.449,0.3,0],[0.564,0.618,0.36,0],[0.486,0.667,0.28,0],[0.433,0.551,0.38,0],[0.447,0.42,0.3,0],[0.522,0.344,0.34,0],[0.15,0.2,0.24,1],[0.84,0.86,0.2,1],[0.88,0.22,0.3,1]],"e":[[1,2],[2,3],[3,4],[5,6],[6,1],[1,7],[2,8],[3,9],[4,10],[5,11],[6,12]]},"objects":{"t":"255,236,205","s":[[0.32,0.37,0.78,0],[0.585,0.33,0.98,0],[0.605,0.89,0.74,0],[0.305,0.92,0.6,0],[0.465,0.12,0.5,0],[0.735,0.09,0.7,0],[0.755,0.63,0.55,0],[0.45,0.64,0.2,0],[0.18,0.22,0.26,1],[0.89,0.4,0.22,1],[0.8,0.92,0.3,1],[0.31,0.65,0.3,0]],"e":[[0,1],[1,2],[2,3],[3,11],[11,0],[4,5],[5,6],[0,4],[1,5],[2,6]]},"sound":{"t":"255,182,176","s":[[0.058,0.493,0.35,0],[0.143,0.434,0.45,0],[0.195,0.295,0.63,0],[0.186,0.645,0.45,0],[0.282,0.392,0.53,0],[0.338,0.216,0.8,0],[0.347,0.763,0.55,0],[0.441,0.135,0.92,0],[0.442,0.812,0.62,0],[0.498,0.253,0.71,0],[0.567,0.183,0.86,0],[0.57,0.827,0.58,0],[0.659,0.355,0.57,0],[0.718,0.259,0.66,0],[0.719,0.711,0.47,0],[0.807,0.434,0.44,0],[0.886,0.419,0.5,0],[0.941,0.497,0.35,0],[0.26,0.93,0.2,1],[0.61,0.06,0.24,1],[0.9,0.88,0.26,1],[0.15,0.7,0.3,1]],"e":[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]]},"about":{"t":"214,222,236","s":[[0.309,0.271,0.7,0],[0.209,0.272,0.45,0],[0.113,0.366,0.6,0],[0.067,0.587,0.85,0],[0.103,0.808,0.5,0],[0.202,0.903,0.6,0],[0.31,0.882,0.55,0],[0.361,0.254,0.5,0],[0.46,0.301,0.4,0],[0.475,0.408,0.7,0],[0.422,0.569,0.42,0],[0.362,0.556,0.5,0],[0.583,0.94,0.65,0],[0.589,0.61,0.55,0],[0.681,0.587,0.5,0],[0.738,0.451,0.45,0],[0.748,0.224,0.9,0],[0.932,0.127,0.5,0],[0.963,0.206,0.8,0],[0.956,0.305,0.55,0],[0.917,0.366,0.36,0],[0.88,0.28,0.2,0],[0.45,0.92,0.22,1],[0.5,0.1,0.2,1]],"e":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,8],[8,9],[9,10],[10,11],[12,13],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20]]}};
var CLOSEN={film:'works',photo:'photographs',objects:'works',sound:'music',about:'pages'};
var MINT='85,218,161';
function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function ease(u){u=clamp(u,0,1);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function easeOut(u){u=clamp(u,0,1);return 1-Math.pow(1-u,3)}
function now(){return performance.now()}
function slug(s){return String(s||'').toLowerCase().replace(/&/g,' and ').replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'x'}
function pad(n){n=String(n);while(n.length<3)n='0'+n;return n}

/* ---------------------------------------------------------------- data (the hidden chapter lists are the one source of content) */
var CH={},ITEMS=[];
ORDER.forEach(function(k,ci){var sec=document.getElementById(k);if(!sec)return;
  var c=CH[k]={k:k,ci:ci,tint:SH[k].t,items:[],by:{},count:(($('.head .ct',sec)||{}).textContent||'').trim(),sq:sec.classList.contains('g-sq')||k==='photo'||k==='objects'};
  c.lt=c.tint.split(',').map(function(v){return Math.round(v*.45+215*.55)}).join(',');
  var used={};
  $$('.it',sec).forEach(function(el,i){var j={};try{j=JSON.parse(el.dataset.j||'{}')}catch(e){}
    var a=$('.tile',el),im=$('.vis img',el),w=el.dataset.k;
    var it={k:k,i:i,w:w,el:el,j:j,lab:(($('.cap b',el)||{}).textContent||'').trim(),meta:(($('.cap small',el)||{}).textContent||'').trim(),
      thumb:im?im.dataset.src||im.getAttribute('src')||'':'',big:el.dataset.big||'',pv:el.dataset.pv||'',sc:el.dataset.sc||'',href:a?a.getAttribute('href')||'':'',
      isNew:w==='reel'||(k==='objects'&&el.dataset.joio==='1')||(k==='sound'&&w==='wave'),kind:'work',img:null,ld:0};
    if(k==='film'&&w==='reel')it.kind='reel';
    else if(k==='sound'&&w==='wave')it.kind='player';
    else if(k==='about'){it.kind=w==='bio'||w==='poem'?w:'link'}
    var sl;if(k==='film')sl=w==='reel'?'reel':slug(it.lab);else if(k==='objects'&&el.dataset.joio==='1')sl='joio';else if(k==='sound')sl=w==='wave'?'wave':slug(it.lab);else sl=w;
    while(used[sl])sl+='-2';used[sl]=1;it.slug=sl;
    if(k==='photo'||k==='objects'){var ar=j.w&&j.h?j.w/j.h:.8;ar=clamp(ar,.56,1.78);var tw=46,th=tw/ar;if(th>56){th=56;tw=th*ar}it.tw=tw;it.th=th}
    else if(k==='about'){it.tw=100;it.th=26}else{it.tw=52;it.th=29.25}it.tw0=it.tw;it.th0=it.th;
    c.items.push(it);c.by[w]=it;c.by[sl]=it;ITEMS.push(it)});
  c.cell=k==='about'?[122,52]:c.sq?[60,78]:[74,56];
  /* counts come from the data, never a hand-typed number (objects: 13 cups + the joio feed = 14) */
  var n=c.items.length;c.count=k==='film'?(n-1)+' films · demo reel':k==='photo'?n+' photographs':k==='objects'?n+' works':k==='sound'?(n-1)+' works · 1 player':'bio · contact · poem'});
var playerMeta=$('#sound [data-k=wave] .cap small');if(playerMeta){var nt=Object.keys(window.TRACKS||{}).length;playerMeta.textContent='player · '+nt+' tracks';if(CH.sound.by.wave)CH.sound.by.wave.meta=playerMeta.textContent}
var HEADC=$$('#data .ch .head .ct');HEADC.forEach(function(e){var k=e.closest('.ch').dataset.k;if(CH[k])e.textContent=CH[k].count});

/* ---------------------------------------------------------------- the world: chapter shapes, then where each chapter sits */
var host=$('#world'),cv=$('canvas.wc',host),g=cv.getContext('2d'),W=0,H=0,DPR=1,PORT=false,TOPM=64,BOTM=44;
function placeChapter(c){var S=SH[c.k],q=PORT?1:.5,cw=c.cell[0],chh=c.cell[1],n=c.items.length,A=Math.max(n*cw*chh*1.4,380*190);
  var bw=Math.sqrt(A/q),bh=bw*q;if(c.k==='about'){bw=Math.max(bw,PORT?300:420)}c.bw=bw;c.bh=bh;
  var P=S.s.map(function(p,i){return{i:i,ox:(p[0]-.5)*bw,oy:(p[1]-.5)*bh,b:p[2],st:p[3]}});
  var order=P.filter(function(p){return !p.st}).sort(function(a,b){return b.b-a.b||a.i-b.i});
  var items=c.items.slice().sort(function(a,b){return(b.isNew-a.isNew)||(a.i-b.i)});
  var placed=[];function ok(x,y){for(var i=0;i<placed.length;i++){var p=placed[i];if(Math.abs(p.ox-x)<cw&&Math.abs(p.oy-y)<chh)return false}return true}
  var ii=0;c.node=[];c.dec=[];
  order.forEach(function(p){if(ii>=items.length)return;if(ok(p.ox,p.oy)){var it=items[ii++];it.ox=p.ox;it.oy=p.oy;it.b=p.b;it.sh=1;placed.push(it);c.node[p.i]=it}});
  var cand=[],nx=Math.ceil(bw*1.2/cw)+2,ny=Math.ceil(bh*1.2/chh)+2;
  for(var r=-ny;r<=ny;r++)for(var qq=-nx;qq<=nx;qq++){var x=(qq+((r&1)?.5:0))*cw,y=r*chh;cand.push({x:x,y:y,d:Math.pow(x/(bw/2),2)+Math.pow(y/(bh/2),2)})}
  cand.sort(function(a,b){return a.d-b.d});
  for(var ci=0;ii<items.length&&ci<cand.length;ci++){var p=cand[ci],x2=p.x+(rnd(ci*3+c.ci*101)-.5)*cw*.16,y2=p.y+(rnd(ci*7+c.ci*31)-.5)*chh*.16;
    if(ok(x2,y2)){var it2=items[ii++];it2.ox=x2;it2.oy=y2;it2.b=.3+.3*rnd(ci+c.ci*7);it2.sh=0;placed.push(it2)}}
  P.forEach(function(p){if(c.node[p.i])return;var near=placed.some(function(q){return Math.abs(q.ox-p.ox)<cw*.6&&Math.abs(q.oy-p.oy)<chh*.6});var d={ox:p.ox,oy:p.oy,b:p.b,st:p.st,near:near,dec:1};c.node[p.i]=d;c.dec.push(d)});
  c.sky=[];S.e.forEach(function(e){var a=c.node[e[0]],b=c.node[e[1]];if(a&&b)c.sky.push([a,b])});
  var tree=items.filter(function(i){return i.sh}),rest=items.filter(function(i){return !i.sh});if(!tree.length&&rest.length)tree.push(rest.shift());c.arm=[];
  while(rest.length){var bd=1e18,best=null,bj=-1;for(var a=0;a<rest.length;a++)for(var b=0;b<tree.length;b++){var dd=Math.pow(rest[a].ox-tree[b].ox,2)+Math.pow(rest[a].oy-tree[b].oy,2);if(dd<bd){bd=dd;best=[rest[a],tree[b]];bj=a}}
    c.arm.push(best);tree.push(best[0]);rest.splice(bj,1)}
  var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;c.items.forEach(function(it){x0=Math.min(x0,it.ox-it.tw0/2);x1=Math.max(x1,it.ox+it.tw0/2);y0=Math.min(y0,it.oy-it.th0/2);y1=Math.max(y1,it.oy+it.th0/2+14)});
  c.dec.forEach(function(d){x0=Math.min(x0,d.ox);x1=Math.max(x1,d.ox);y0=Math.min(y0,d.oy);y1=Math.max(y1,d.oy)});
  c.ex={x0:x0-8,y0:y0-8,x1:x1+8,y1:y1+8}}
var RX=500,RY=500,BOUND=null,CEN={w:0,h:0};
var ANGP={about:-90,photo:-36,objects:36,sound:144,film:216};function chapterAt(k,rx,ry){var a=(PORT?ANGP:ANG)[k]*Math.PI/180;return{x:Math.cos(a)*rx,y:Math.sin(a)*ry}}
function layout(){PORT=H>W*1.1;ORDER.forEach(function(k){if(CH[k])placeChapter(CH[k])});
  var avW=W-24,avH=H-TOPM-BOTM,A=avH/avW;RX=PORT?360:520;RY=PORT?520:420;
  function boxes(rx,ry,s){var L=[];ORDER.forEach(function(k){var c=CH[k];if(!c)return;var p=chapterAt(k,rx,ry);var lw=Math.max(58,(c.count||'').length*3.1)/s;L.push({k:k,x0:p.x+c.ex.x0,x1:p.x+c.ex.x1,y0:p.y+c.ex.y0,y1:p.y+c.ex.y1+8/s,cx:p.x,cy:p.y});L.push({k:k,lab:1,x0:p.x-lw,x1:p.x+lw,y0:p.y+c.ex.y1,y1:p.y+c.ex.y1+46/s,cx:p.x,cy:p.y+c.ex.y1+23/s})});
    L.push({k:'@',x0:-(W<600?78:150)/s,x1:(W<600?78:150)/s,y0:-34/s,y1:(W<600?70:56)/s,cx:0,cy:0});return L}
  var useL=false;function bb(L){var b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9};L.forEach(function(r){b.y0=Math.min(b.y0,r.y0);b.y1=Math.max(b.y1,r.y1);if(r.lab)return;b.x0=Math.min(b.x0,r.x0);b.x1=Math.max(b.x1,r.x1)});return b}
  /* solve in screen terms: for a trial far scale s, spread the chapters just enough that nothing (labels included) overlaps,
     then see whether that sky fits the screen at s. The largest s that fits wins; spare room then goes to the long axis. */
  var R0x=PORT?300:460,R0y=PORT?420:340,L,b;
  function hit(L,s){var m=18/s,gx=false,gy=false,h=false;for(var i=0;i<L.length;i++)for(var j=i+1;j<L.length;j++){var p=L[i],q=L[j];if(p.k===q.k)continue;
      if(p.x0-m<q.x1&&q.x0-m<p.x1&&p.y0-m<q.y1&&q.y0-m<p.y1){h=true;var ox=Math.min(p.x1,q.x1)-Math.max(p.x0,q.x0),oy=Math.min(p.y1,q.y1)-Math.max(p.y0,q.y0);
        if(Math.abs(p.cx-q.cx)*oy>Math.abs(p.cy-q.cy)*ox&&Math.abs(p.cx-q.cx)>1)gx=true;else gy=true}}return h?{x:gx,y:gy}:null}
  function fitS(rx,ry,s){var b=bb(boxes(rx,ry,s));return Math.min(avW/(b.x1-b.x0),avH/(b.y1-b.y0))}
  function solve(s){var rx=R0x,ry=R0y;for(var n=0;n<260;n++){var Lb=boxes(rx,ry,s),h=hit(Lb,s);if(!h)break;if(h.x){var bw=bb(Lb);if((bw.x1-bw.x0)*s*1.025>avW){h.x=false;h.y=true}}if(h.x)rx*=1.025;if(h.y)ry*=1.025}return{rx:rx,ry:ry,f:fitS(rx,ry,s)}}
  var lo=.02,hi=1.2,best=solve(lo);best.s=Math.min(lo,best.f);
  for(var n=0;n<22;n++){var mid=(lo+hi)/2,r=solve(mid);if(r.f>=mid){lo=mid;best=r;best.s=mid}else hi=mid}
  RX=best.rx;RY=best.ry;var s=best.s;
  for(var n2=0;n2<120;n2++){b=bb(boxes(RX,RY,s));var ratio=(b.y1-b.y0)/(b.x1-b.x0),nx=RX,ny=RY;if(ratio<A*.94)ny*=1.02;else if(ratio>A*1.08)nx*=1.02;else break;
    if(fitS(nx,ny,s)<s*.999||hit(boxes(nx,ny,s),s))break;RX=nx;RY=ny}
  s=fitS(RX,RY,s);var it=n2;
  ORDER.forEach(function(k){var c=CH[k];if(!c)return;var p=chapterAt(k,RX,RY);c.x=p.x;c.y=p.y;c.items.forEach(function(it){it.sx=it.x=c.x+it.ox;it.sy=it.y=c.y+it.oy});c.dec.forEach(function(d){d.x=c.x+d.ox;d.y=c.y+d.oy})});
  BOUND=bb(boxes(RX,RY,s));FAR_S=s;boards();syncPos()}
/* CLOSE = the v3 board: each chapter's works as a dense grid of tiles (3 columns on a phone, 4 / 6 wider; 16:9 film + sound, square photo + objects),
   caption under each tile. Laid out in world units at the close scale, so on arrival it fills the screen exactly like the v3 board. */
function boards(){var s=sClose(),cols=W<700?3:W<1000?4:6,side=W<700?12:W<1000?24:48,gap=8;
  ORDER.forEach(function(k){var c=CH[k];if(!c)return;var ab=k==='about',cl=ab?(W<700?2:3):cols,tw=(W-2*side-(cl-1)*gap)/cl,th=ab?44:c.sq?tw:tw*9/16,cap=ab?0:38,pitch=th+4+cap+12,
    n=c.items.length,rows=Math.ceil(n/cl),bw=cl*tw+(cl-1)*gap,bh=rows*pitch-12,e=c.ex;
    var x0=c.x-bw/2/s,y0=c.y+Math.max(e.y0,(e.y0+e.y1)/2-bh/2/s);c.cap=cap/s;
    c.items.forEach(function(it,i){var r=Math.floor(i/cl),q=i%cl;it.tw=tw/s;it.th=th/s;it.gx=x0+(q*(tw+gap)+tw/2)/s;it.gy=y0+(r*pitch+th/2)/s});
    c.bex={x0:x0-side/s,x1:x0+(bw+side)/s,y0:y0-10/s,y1:y0+(bh+10)/s}})}
/* where a work stands right now: its star, flowing into its board tile as the chapter blooms */
function syncPos(){ORDER.forEach(function(k){var c=CH[k];if(!c)return;var bl=BK===k?B:0,pm=ease(clamp(bl*1.12,0,1));c.items.forEach(function(it){it.x=lerp(it.sx,it.gx,pm);it.y=lerp(it.sy,it.gy,pm)})})}
var FAR_S=.25;

/* ---------------------------------------------------------------- camera */
var cam={x:0,y:0,s:.25},B=0,BK=null,tw=null,dirty=true,raf=0;
function sp(x,y,c){c=c||cam;return[(x-c.x)*c.s+W/2,(y-c.y)*c.s+H/2]}
function wp(x,y,c){c=c||cam;return[(x-W/2)/c.s+c.x,(y-H/2)/c.s+c.y]}
function fit(x0,y0,x1,y1,top,bot,side,smax){var s=Math.min((W-2*side)/(x1-x0),(H-top-bot)/(y1-y0));if(smax)s=Math.min(s,smax);var cy=(top+H-bot)/2;return{x:(x0+x1)/2,y:(y0+y1)/2-(cy-H/2)/s,s:s}}
function camFar(){var b=BOUND;return fit(b.x0,b.y0,b.x1,b.y1,TOPM,BOTM,12)}
function sClose(){return clamp(W*.3,104,168)/52}
function camMid(k){var c=CH[k],e=c.ex;return fit(c.x+e.x0,c.y+e.y0,c.x+e.x1,c.y+e.y1+30/Math.max(.3,FAR_S*2),TOPM+8,BOTM+40,W<500?18:60,sClose()*.5)}
function camClose(k,w){var c=CH[k],e=c.bex,s=sClose(),it=w&&c.by[w]||c.items[0];var x=it.gx,y=it.gy;
  var hw=(W/2)/s,hh0=(H/2)/s,x0=e.x0,x1=e.x1,y0=e.y0-TOPM/s,y1=e.y1+BOTM/s;
  if(x1-x0<=2*hw)x=(x0+x1)/2;else x=clamp(x,x0+hw,x1-hw);
  if(y1-y0<=2*hh0)y=(y0+y1)/2;else y=clamp(y,y0+hh0,y1-hh0);
  return{x:x,y:y,s:s}}
function camLayer(k,w){var c0=camClose(k,w),it=CH[k].by[w],p=sp(it.gx,it.gy,c0),s=c0.s*1.7;return{x:it.gx-(p[0]-W/2)/s,y:it.gy-(p[1]-H/2)/s,s:s}}
function camFor(T){return T.lv===0?camFar():T.lv===1?camMid(T.k):T.lv===2?camClose(T.k,T.w):camLayer(T.k,T.w)}
function fly(to,o){o=o||{};var B1=o.B1==null?B:o.B1;if(o.BK1)BK=o.BK1;
  if(!anim()||o.instant){cam={x:to.x,y:to.y,s:to.s};B=B1;tw=null;syncPos();req();if(o.done)o.done();return}
  var c0={x:cam.x,y:cam.y,s:cam.s},a=null;if(o.anchor){a={x:o.anchor.x,y:o.anchor.y,p0:sp(o.anchor.x,o.anchor.y,c0),p1:sp(o.anchor.x,o.anchor.y,to)}}
  if(tw&&tw.done){var d0=tw.done;tw.done=null;try{d0()}catch(e){}}
  tw={c0:c0,c1:to,a:a,B0:B,B1:B1,t0:now(),dur:(o.dur||520)*SLOW(),done:o.done||null};req()}
function stepTween(t){var u=clamp((t-tw.t0)/tw.dur,0,1),e=ease(u),s=tw.c0.s*Math.pow(tw.c1.s/tw.c0.s,e);
  if(tw.a){var px=lerp(tw.a.p0[0],tw.a.p1[0],e),py=lerp(tw.a.p0[1],tw.a.p1[1],e);cam.x=tw.a.x-(px-W/2)/s;cam.y=tw.a.y-(py-H/2)/s}
  else{var k=Math.abs(tw.c1.s-tw.c0.s)<1e-6?e:(s-tw.c0.s)/(tw.c1.s-tw.c0.s);cam.x=lerp(tw.c0.x,tw.c1.x,k);cam.y=lerp(tw.c0.y,tw.c1.y,k)}
  cam.s=s;var eb=tw.B1>tw.B0?ease(clamp((u-.18)/.82,0,1)):ease(clamp(u/.72,0,1));B=lerp(tw.B0,tw.B1,eb);
  if(u>=1){cam={x:tw.c1.x,y:tw.c1.y,s:tw.c1.s};B=tw.B1;var d=tw.done;tw=null;if(d)d()}}

/* ---------------------------------------------------------------- sprites */
function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c}
function glow(rgb,sz){var c=mk(sz,sz),q=c.getContext('2d'),gr=q.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.45)');gr.addColorStop(.5,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');q.fillStyle=gr;q.fillRect(0,0,sz,sz);return c}
var GLOW=glow('205,225,255',128),GLOWC=glow('160,190,240',256),GLOWM=glow(MINT,128);ORDER.forEach(function(k){if(CH[k])CH[k].glow=glow(CH[k].tint,128)});
/* the far star field: two tiled layers on the compositor (parallax), never redrawn */
var SF=[[900,.12,.9],[260,.35,1.6]].map(function(L,li){var T=512,c=mk(T,T),q=c.getContext('2d');
  for(var i=0;i<L[0];i++){var m=Math.pow(rnd(li*9000+i),2.6),b=.05+.9*m,t=rnd(li*7000+i*3);q.fillStyle='rgba('+Math.round(205+50*t)+','+Math.round(220+15*t)+','+Math.round(255-60*t)+','+b.toFixed(3)+')';
    q.beginPath();q.arc(rnd(li*5000+i*7)*T,rnd(li*3000+i*11)*T,.4+m*L[2],0,7);q.fill()}
  var d=document.createElement('i');d.className='wsf';d.setAttribute('aria-hidden','true');d.style.backgroundImage='url('+c.toDataURL('image/png')+')';host.insertBefore(d,cv);return{el:d,d:L[1]}});
function field(){SF.forEach(function(L){var sc=clamp(Math.pow(cam.s/.3,L.d)*.9,.8,1.6),T=512*sc,ox=-cam.x*cam.s*L.d+W/2,oy=-cam.y*cam.s*L.d+H/2,tx=((ox%T)+T)%T-T,ty=((oy%T)+T)%T-T;
  L.el.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) scale('+sc.toFixed(4)+')'})}
/* thumbnails: a chapter's pictures load when you first come near it */
var wanted={};function want(k){if(!k||wanted[k]||!CH[k])return;wanted[k]=1;CH[k].items.forEach(function(it){if(!it.thumb)return;var im=new Image();im.decoding='async';im.onload=function(){it.ld=now();req()};im.src=it.thumb;it.img=im})}

/* ---------------------------------------------------------------- state: the one source of truth */
var cur={lv:0,k:null,w:null},sel=null,openL=null,MK=null; /* sel = {k} at FAR or {k,w} below; openL = the open layer; MK = the mark intro */
var focusA={};ORDER.forEach(function(k){focusA[k]=1});
function itemOf(k,w){return CH[k]&&w?CH[k].by[w]||null:null}

/* ---------------------------------------------------------------- drawing */
var labRects=[];function free(r){for(var i=0;i<labRects.length;i++){var q=labRects[i];if(r.x<q.x+q.w&&q.x<r.x+r.w&&r.y<q.y+q.h&&q.y<r.y+r.h)return false}labRects.push(r);return true}
function onS(p,m){return p[0]>-m&&p[0]<W+m&&p[1]>-m&&p[1]<H+m}
function starR(b,SFk){return Math.max(1.1,(.6+1.9*b)*SFk)}
function draw(){var t=now();syncPos();g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);field();labRects=[];
  var lv=FZ?FZ.vl:cur.lv,fs=FAR_S,z=cam.s/fs,SFk=clamp(Math.sqrt(z)*.85,.7,1.7),mk=MK&&MK.on?MK:null,mp=mk?mk.p:1;
  var farA=clamp(1-(z-1.15)/1.4,0,1); /* how "far" the view reads: spokes, chapter labels, centre */
  /* focus: the chapter you are in stays bright, the others dim while you are inside one */
  ORDER.forEach(function(k){var ck=FZ?FZ.k:cur.k,tgt=lv===0&&!(FZ&&FZ.u>.35)?1:k===ck?1:FZ?lerp(1,.28,clamp(FZ.u/.8,0,1)):.28;focusA[k]=lerp(focusA[k],tgt,tw||FZ?.18:1)});
  g.lineCap='round';g.lineWidth=1;
  /* spokes from ᑕᐣᓯ */
  var lineIn=mk?clamp((mp-.62)/.38,0,1):1;
  if(farA>.01){g.strokeStyle='rgba(170,205,240,'+(.16*farA*lineIn).toFixed(3)+')';g.beginPath();ORDER.forEach(function(k){var c=CH[k];if(!c)return;var a=sp(0,0),b=sp(c.x,c.y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
  ORDER.forEach(function(k){var c=CH[k];if(!c)return;var fa=focusA[k]*(BK&&BK!==k?1-B:1),bl=(BK===k?B:0),cp=sp(c.x,c.y),R=Math.max(c.bw,c.bh)*.75*cam.s;
    if(cp[0]<-R-200||cp[0]>W+R+200||cp[1]<-R-200||cp[1]>H+R+200)return;
    /* nebula */
    var nr=Math.max(c.bw,c.bh)*.62*cam.s;if(nr>4){var gr=g.createRadialGradient(cp[0],cp[1],0,cp[0],cp[1],nr);gr.addColorStop(0,'rgba('+c.tint+','+(.075*fa*lineIn).toFixed(3)+')');gr.addColorStop(1,'rgba('+c.tint+',0)');g.fillStyle=gr;g.fillRect(cp[0]-nr,cp[1]-nr,2*nr,2*nr)}
    /* the figure + the arms that reach every work */
    var isSel=sel&&sel.k===k&&!sel.w&&lv===0,la=(isSel?.85:.5)*fa*clamp(1-bl/.6,0,1)*lineIn;
    if(la>.01){g.strokeStyle='rgba('+c.lt+','+la.toFixed(3)+')';g.beginPath();c.sky.forEach(function(L){var a=sp(L[0].x,L[0].y),b=sp(L[1].x,L[1].y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
    var aa=(lv===0?.16:.3)*fa*clamp(1-bl/.6,0,1)*lineIn*(isSel?1.6:1);
    if(aa>.01){g.strokeStyle='rgba('+c.lt+','+aa.toFixed(3)+')';g.beginPath();c.arm.forEach(function(L){var a=sp(L[0].x,L[0].y),b=sp(L[1].x,L[1].y);g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])});g.stroke()}
    /* shape stars that carry no work: they fade as the works bloom */
    var da=fa*(1-bl);if(da>.02&&!mk)c.dec.forEach(function(d){var q=sp(d.x,d.y);if(!onS(q,30))return;var gs=(6+30*d.b*d.b)*SFk;g.globalAlpha=da*(.35+.65*d.b)*(d.st?.75:1)*(d.near?.5:1);g.drawImage(c.glow,q[0]-gs/2,q[1]-gs/2,gs,gs);g.globalAlpha=da*(.45+.55*d.b)*(d.st?.8:1);g.fillStyle='#fff';g.beginPath();g.arc(q[0],q[1],starR(d.b,SFk)*.85,0,7);g.fill()});
    g.globalAlpha=1;
    /* works: a star that grows into its thumbnail where it stands */
    c.items.forEach(function(it){var q=sp(it.x,it.y);if(!onS(q,160))return;drawItem(it,q,bl,fa,SFk,t)});
  });
  /* the mark intro draws its own flying stars on top */
  if(mk)drawMark(mk);
  /* ᑕᐣᓯ at the centre + the name under it */
  var cA=farA*(mk?clamp((mp-.45)/.55,0,1):1);
  if(cA>.01){var o=sp(0,0),gf=Math.round(clamp(30*Math.sqrt(z),24,64)),gs=gf*5.2;g.globalAlpha=cA*.9;g.drawImage(GLOWC,o[0]-gs/2,o[1]-gs/2,gs,gs);
    g.font='700 '+gf+'px Syl, sans-serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=cA;
    g.fillStyle='rgba(10,189,240,.55)';g.fillText('ᑕᐣᓯ',o[0]-1.2,o[1]);g.fillStyle='rgba(254,1,1,.45)';g.fillText('ᑕᐣᓯ',o[0]+1.2,o[1]);g.fillStyle='#fff';g.fillText('ᑕᐣᓯ',o[0],o[1]);
    g.font='400 11px "Julius Sans One", Poppins, sans-serif';g.fillStyle='rgba(230,237,240,.92)';spaced('GILL JAMES',o[0],o[1]+gf*.62+12,2.6);
    g.font='300 9.5px Poppins, sans-serif';g.fillStyle='rgba(201,211,214,.8)';if(W<600){g.fillText('Cinematographer + Artist',o[0],o[1]+gf*.62+27);g.fillText('+ Spatial Designer',o[0],o[1]+gf*.62+40)}else g.fillText('Cinematographer + Artist + Spatial Designer',o[0],o[1]+gf*.62+28);
    labRects.push({x:o[0]-100,y:o[1]-gf*.6,w:200,h:gf*1.2+40});g.globalAlpha=1}
  /* chapter names under each constellation (far), the one you are in (mid) */
  ORDER.forEach(function(k){var c=CH[k];if(!c)return;var fa=focusA[k],a=(lv===0?1:lv===1&&k===cur.k?.9:0)*(1-(BK===k?B:0))*(mk?clamp((mp-.7)/.3,0,1):1);
    if(tw&&lv===0)a=Math.max(a,0);if(a<.02)return;var p=sp(c.x,c.y+c.ex.y1);var y=p[1]+16;if(y>H-8||y<0)return;g.font='300 10px Poppins, sans-serif';var lw2=Math.max(g.measureText(c.count).width,k.length*13)/2+6;p[0]=clamp(p[0],lw2,W-lw2);
    var isSel=sel&&sel.k===k&&!sel.w;g.globalAlpha=a*fa;g.textAlign='center';g.textBaseline='alphabetic';
    g.font='400 '+(lv===0?13:14)+'px "Julius Sans One", Poppins, sans-serif';g.fillStyle=isSel?'rgb('+MINT+')':'#eef3f5';spaced(k.toUpperCase(),p[0],y,3);
    g.font='300 10px Poppins, sans-serif';g.fillStyle='rgba(201,211,214,.85)';g.fillText(c.count,p[0],y+15);labRects.push({x:p[0]-70,y:y-14,w:140,h:34});g.globalAlpha=1});
  /* work names: mid = the chapter's names where they fit; close = under each thumbnail */
  var nk=FZ?FZ.k:cur.k;if((FZ?FZ.u>.35:lv>=1)&&nk&&!mk)names(CH[nk]);
  hits();pick();mini()}
function spaced(s,x,y,ls){if('letterSpacing' in g){g.letterSpacing=ls+'px';g.fillText(s,x+ls/2,y);g.letterSpacing='0px';return}var w=0,ws=[];for(var i=0;i<s.length;i++){ws.push(g.measureText(s[i]).width);w+=ws[i]+(i?ls:0)}
  var a=g.textAlign;g.textAlign='left';var cx=x-w/2;for(var j=0;j<s.length;j++){g.fillText(s[j],cx,y);cx+=ws[j]+ls}g.textAlign=a}
function rr(x,y,w,h,r){g.beginPath();if(g.roundRect){g.roundRect(x,y,w,h,r);return}g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function drawItem(it,q,bl,fa,SFk,t){var c=CH[it.k],isS=sel&&sel.k===it.k&&sel.w===it.w,mint=it.isNew,hide=openL&&openL.it===it&&openL.full;
  if(hide)return;var la=openL&&cur.lv===3&&BK===it.k?.35:1; /* behind an open layer the other works sit back */
  var sw=it.tw*cam.s,sh=it.th*cam.s,ux=lerp(0,1,bl);
  /* star part (fades as it blooms) */
  if(bl<.999){var a=fa*(1-ux)*(it.sh?1:.82),b=it.sh?it.b:it.b,gs=(6+30*b*b)*SFk*(isS?1.5:1);
    g.globalAlpha=a*(.4+.6*b);g.drawImage(mint?GLOWM:c.glow,q[0]-gs/2,q[1]-gs/2,gs,gs);g.globalAlpha=a;g.fillStyle=mint?'rgb('+MINT+')':'#fff';g.beginPath();g.arc(q[0],q[1],starR(b,SFk)*(isS?1.25:1),0,7);g.fill();
    if(isS&&cur.lv<2){g.globalAlpha=1;g.strokeStyle='rgba('+MINT+',.9)';g.lineWidth=1.2;g.beginPath();g.arc(q[0],q[1],10,0,7);g.stroke();g.lineWidth=1}}
  if(bl>.001){var w=lerp(4,sw,ux),h=lerp(4,sh,ux),x=q[0]-w/2,y=q[1]-h/2,al=fa*clamp(ux*1.4,0,1)*la;
    if(it.k==='about'){g.globalAlpha=al;rr(x,y,w,h,Math.min(h/2,12));g.fillStyle='rgba(12,20,34,.86)';g.fill();g.strokeStyle=isS?'rgba('+MINT+',.95)':'rgba(200,225,255,.35)';g.stroke();
      if(ux>.5){var fz=clamp(7.4*cam.s,9,19);g.font='300 '+fz.toFixed(1)+'px Poppins, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=isS?'rgb('+MINT+')':'#e6edf0';g.globalAlpha=al*clamp((ux-.5)*2,0,1);
        g.fillText(it.kind==='link'&&it.w==='contact'?'contact':it.lab,q[0],q[1]+.5)}g.globalAlpha=1;return}
    if(ux>.3){var gl=tileGlow(it);g.globalAlpha=al*clamp((ux-.3)/.5,0,1);g.drawImage(gl.cv,x-gl.p*w/gl.w,y-gl.p*h/gl.h,w*(1+2*gl.p/gl.w),h*(1+2*gl.p/gl.h))}
    g.globalAlpha=al;
    var ready=it.img&&it.ld&&it.img.naturalWidth;
    if(ready){var fi=clamp((t-it.ld)/260,0,1);if(fi<1)dirty=true;g.fillStyle='rgba(20,30,46,.9)';g.fillRect(x,y,w,h);g.globalAlpha=al*fi;coverDraw(it.img,x,y,w,h);g.globalAlpha=al}
    else{g.fillStyle='rgba('+c.tint+',.10)';g.fillRect(x,y,w,h)}
    if(isS&&ux>.5){g.strokeStyle='rgba('+MINT+',.95)';g.lineWidth=2;g.strokeRect(x-3,y-3,w+6,h+6)}else{g.strokeStyle=isS?'rgba('+MINT+',.95)':mint?'rgba('+MINT+',.55)':'rgba(200,225,255,.2)';g.lineWidth=isS?1.6:1;g.strokeRect(x+.5,y+.5,w-1,h-1)}g.lineWidth=1;g.globalAlpha=1}}
/* the v3 board caption: title (two lines at most) + the small dim meta, left-aligned under the tile */
function capDraw(it,q,bl){var w=it.tw*cam.s,h=it.th*cam.s,x=q[0]-w/2,y=q[1]+h/2+5;if(y>H||y+30<0||x>W||x+w<0)return;var k=w.toFixed(0);
  g.font='300 11px Poppins, sans-serif';if(it._ck!==k){it._ck=k;var words=it.lab.split(' '),L=[''],i=0;words.forEach(function(wd){var t=L[i]?L[i]+' '+wd:wd;if(g.measureText(t).width<=w||!L[i])L[i]=t;else{if(i===1){L[1]+='…';i=2;return}if(i<2){i++;L[i]=wd}}});
    L=L.slice(0,2).map(function(l){while(l&&g.measureText(l).width>w)l=l.slice(0,-2)+'…';return l});var m=it.meta;g.font='300 9.5px Poppins, sans-serif';while(m&&g.measureText(m).width>w)m=m.slice(0,-2)+'…';it._cl=L;it._cm=m;g.font='300 11px Poppins, sans-serif'}
  var a=clamp((bl-.5)*2,0,1)*(openL?.3:1);g.globalAlpha=a;g.textAlign='left';g.textBaseline='top';g.fillStyle=it.isNew?'rgb('+MINT+')':'rgba(230,237,240,.92)';
  it._cl.forEach(function(l,i){g.fillText(l,x,y+i*14.3)});g.font='300 9.5px Poppins, sans-serif';g.fillStyle='rgba(169,182,190,.85)';g.fillText(it._cm||'',x,y+it._cl.length*14.3+1);g.globalAlpha=1;g.textBaseline='middle'}
/* v3's soft tile glow (box-shadow 0 0 12px rgba(150,200,255,.25)), pre-blurred once per tile size and stretched while blooming */
var GLC={};function tileGlow(it){var w=Math.round(it.tw*sClose()),h=Math.round(it.th*sClose()),k=w+'x'+h;if(GLC[k])return GLC[k];var p=18,c=document.createElement('canvas'),d=Math.min(2,DPR||1);
  c.width=(w+2*p)*d;c.height=(h+2*p)*d;var x=c.getContext('2d');x.scale(d,d);x.shadowColor='rgba(150,200,255,.25)';x.shadowBlur=12;x.shadowOffsetX=0;x.fillStyle='rgba(150,200,255,1)';
  x.fillRect(p,p,w,h);x.shadowColor='transparent';x.globalCompositeOperation='destination-out';x.fillRect(p,p,w,h);return GLC[k]={cv:c,p:p,w:w,h:h}}
function coverDraw(im,x,y,w,h){var iw=im.naturalWidth,ih=im.naturalHeight,r=w/h,ir=iw/ih,sx=0,sy=0,sw=iw,sh=ih;if(ir>r){sw=ih*r;sx=(iw-sw)/2}else{sh=iw/r;sy=(ih-sh)/2}g.drawImage(im,sx,sy,sw,sh,x,y,w,h)}
function names(c){var lv=cur.lv,bl=BK===c.k?B:0,mA=FZ?clamp((FZ.u-.35)/.45,0,1):lv>=1?1:0;if(mA<.02)return;g.textBaseline='middle';
  var list=c.items.slice().sort(function(a,b){var sa=sel&&sel.w===a.w?-1:0,sb=sel&&sel.w===b.w?-1:0;return sa-sb||(b.isNew-a.isNew)||(b.b-a.b)});
  list.forEach(function(it){if(openL&&openL.it===it)return;var q=sp(it.x,it.y);if(q[0]<-40||q[0]>W+40||q[1]<TOPM-10||q[1]>H-8)return;var isS=sel&&sel.w===it.w&&sel.k===it.k;if(isS&&!(bl>.5&&it.k!=='about'))return; /* the selected one wears the pill (on the board: a chip inside the tile, caption stays) */
    if(it.k==='about'&&bl>.5)return;
    if(bl>.5){capDraw(it,q,bl);return}var lab=it.lab.length>26?it.lab.slice(0,25)+'…':it.lab;g.font='300 '+(bl>.5?11:11.5)+'px Poppins, sans-serif';var tw2=g.measureText(lab).width,r;
    if(bl>.5){var hh=it.th*cam.s;r={x:q[0]-tw2/2-3,y:q[1]+hh/2+3,w:tw2+6,h:16};if(r.x<2||r.x+r.w>W-2)return;if(!free(r))return;g.textAlign='center';g.globalAlpha=clamp((bl-.5)*2,0,1)*(openL?.3:1);g.fillStyle=it.isNew?'rgb('+MINT+')':'rgba(230,237,240,.9)';g.fillText(lab,q[0],r.y+8)}
    else{r={x:q[0]+8,y:q[1]-9,w:tw2+6,h:18};if(r.x+r.w>W-4)r.x=q[0]-8-r.w;if(!free(r)){var r2={x:r.x>q[0]?q[0]-8-r.w:q[0]+8,y:r.y,w:r.w,h:r.h};if(r2.x<4||r2.x+r2.w>W-4||!free(r2))return;r=r2}
      g.textAlign='left';g.globalAlpha=(1-bl*2)*.95*mA;g.fillStyle='rgba(3,5,10,.55)';g.fillRect(r.x-2,r.y,r.w+2,r.h);g.fillStyle=it.isNew?'rgb('+MINT+')':'#e6edf0';g.fillText(lab,r.x+2,q[1])}
    g.globalAlpha=1})}

/* ---------------------------------------------------------------- the mark intro: ᑕᐣᓯ drawn in stars, and the same stars fly to their places */
var STROKES=[[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97]],[[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5]],[[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]]];
function markPts(n){var segs=[],tot=0;STROKES.forEach(function(st,si){for(var i=1;i<st.length;i++){var a=st[i-1],b=st[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a:a,b:b,l:l,t0:tot,si:si});tot+=l}});
  var pts=[];for(var i=0;i<n;i++){var d=(i+.5)/n*tot,s=segs[0];for(var j=0;j<segs.length;j++){if(d>=segs[j].t0&&d<segs[j].t0+segs[j].l){s=segs[j];break}}var u=(d-s.t0)/s.l;
    pts.push({x:lerp(s.a[0],s.b[0],u)+(rnd(i*13)-.5)*5,y:lerp(s.a[1],s.b[1],u)+(rnd(i*17)-.5)*5,d:d/tot,node:u<.08||u>.92})}return pts}
function startMark(){var stars=[];ORDER.forEach(function(k){var c=CH[k];if(!c)return;c.items.forEach(function(it){stars.push({o:it,k:k,b:it.b,mint:it.isNew,c:c})});c.dec.forEach(function(d){stars.push({o:d,k:k,b:d.b,c:c,dec:1})})});
  var mp=markPts(stars.length),ms=Math.min(W*.84/472,H*.30/252),mcx=W/2,mcy=H*.44;
  /* contiguous runs of the stroke go to one chapter each, in the order the chapters sit around the centre */
  var runs=[],ix=0;ORDER.forEach(function(k){var st=stars.filter(function(s){return s.k===k});runs.push({k:k,st:st,mp:mp.slice(ix,ix+st.length)});ix+=st.length});
  var fc=camFar();runs.forEach(function(r){var T=r.st.map(function(s){return{s:s,p:sp(s.o.x,s.o.y,fc)}}),M=r.mp.map(function(p){return{x:mcx+p.x*ms,y:mcy+p.y*ms,d:p.d,node:p.node}});
    function nb(L,f){var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;L.forEach(function(q){var v=f(q);x0=Math.min(x0,v[0]);x1=Math.max(x1,v[0]);y0=Math.min(y0,v[1]);y1=Math.max(y1,v[1])});return function(q){var v=f(q);return[(v[0]-x0)/Math.max(1,x1-x0),(v[1]-y0)/Math.max(1,y1-y0)]}}
    var nt=nb(T,function(q){return q.p}),nm=nb(M,function(q){return[q.x,q.y]}),free2=T.slice();
    M.forEach(function(m,i){var a=nm(m),bi=0,bd=1e9;free2.forEach(function(q,j){var b=nt(q),d=Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2);if(d<bd){bd=d;bi=j}});var q=free2.splice(bi,1)[0];q.s.m={x:m.x,y:m.y,d:m.d,node:m.node,del:i/Math.max(1,M.length)}})});
  MK={on:true,t0:now(),p:0,stars:stars,ms:ms,cx:mcx,cy:mcy,hold:350,fl:950};D.classList.add('mk-on');req()}
function markTick(t){var m=MK,el=(t-m.t0)/SLOW();if(m.skip){el=Math.max(el,m.skipFrom+(t-m.skipT)/SLOW()*((m.hold+m.fl)-m.skipFrom)/220)}m.el=el;m.p=clamp((el-m.hold)/m.fl,0,1);
  if(el>=m.hold+m.fl+60){MK.on=false;MK=null;D.classList.remove('mk-on');landed();return}}
function drawMark(m){var fc=camFar(),el=m.el||0,SFk=.9;
  /* the strokes, faint, while it is still a mark */
  var sa=clamp(1-m.p*2.4,0,1);if(sa>.01){g.strokeStyle='rgba(200,225,255,'+(.22*sa).toFixed(3)+')';g.lineWidth=1;STROKES.forEach(function(st){g.beginPath();st.forEach(function(p,i){var x=m.cx+p[0]*m.ms,y=m.cy+p[1]*m.ms;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()});
    g.globalAlpha=sa;g.textAlign='center';g.textBaseline='alphabetic';g.font='400 15px "Julius Sans One", Poppins, sans-serif';g.fillStyle='#eef3f5';spaced('GILL JAMES',W/2,m.cy+130*m.ms+34,4);
    g.font='300 11px Poppins, sans-serif';g.fillStyle='rgba(201,211,214,.9)';g.fillText('Cinematographer + Artist + Spatial Designer',W/2,m.cy+130*m.ms+56);
    g.fillStyle='rgb('+MINT+')';g.font='300 10.5px Poppins, sans-serif';g.fillText('new · demo reel · joio in motion · sound for sync',W/2,m.cy+130*m.ms+76);g.globalAlpha=1}
  m.stars.forEach(function(s){if(!s.m)return;var u=ease(clamp((m.p-s.m.del*.22)/.78,0,1)),tp=sp(s.o.x,s.o.y,fc),x=lerp(s.m.x,tp[0],u),y=lerp(s.m.y,tp[1],u);
    var b0=s.m.node?.95:.62,b=lerp(b0,s.b,u),gs=(6+30*b*b)*SFk,a=s.dec?lerp(1,.7,u):1,col=s.mint&&u>.4?GLOWM:s.c.glow;
    g.globalAlpha=a*(.4+.6*b)*clamp(el/120,0,1);g.drawImage(col,x-gs/2,y-gs/2,gs,gs);g.globalAlpha=a*clamp(el/120,0,1);g.fillStyle=s.mint&&u>.4?'rgb('+MINT+')':'#fff';g.beginPath();g.arc(x,y,starR(b,SFk),0,7);g.fill()});g.globalAlpha=1}
function skipMark(){if(!MK||MK.skip)return;MK.skip=true;MK.skipT=now();MK.skipFrom=Math.max(MK.el||0,MK.hold)}

/* ---------------------------------------------------------------- the render loop: only while something moves */
function req(){dirty=true;if(!raf)raf=requestAnimationFrame(frame)}
var FT=[];function frame(t){raf=0;if(MK&&MK.on)markTick(t);if(tw)stepTween(t);if(pz&&pz.live)pinchLive();dirty=false;draw();
  if(window.__ft){FT.push(t);if(FT.length>600)FT.shift()}
  if(tw||(MK&&MK.on)||dirty)raf=requestAnimationFrame(frame)}

/* ---------------------------------------------------------------- accessible hit targets (keyboard + screen readers), never in the way of a finger */
var hitBox=$('.whits',host),hitEls={};
function hitList(){if(MK)return[];var L=[];if(cur.lv===0)ORDER.forEach(function(k){if(CH[k])L.push({key:k,k:k,lab:k+', '+CH[k].count,x:CH[k].x,y:CH[k].y})});
  else if(cur.lv<=2&&cur.k)CH[cur.k].items.forEach(function(it){L.push({key:it.k+'/'+it.w,k:it.k,w:it.w,lab:it.lab+(it.meta?', '+it.meta:''),x:it.x,y:it.y})});return L}
function hits(){var L=hitList(),seen={};L.forEach(function(h){var e=hitEls[h.key];if(!e){e=document.createElement('button');e.type='button';e.className='wh';e.dataset.key=h.key;
    e.addEventListener('click',function(ev){ev.preventDefault();if(ev.detail!==0&&now()-lastTap<600)return;press(h.k,h.w||null,true)});e.addEventListener('focus',function(){if(!(sel&&sel.k===h.k&&(sel.w||null)===(h.w||null))){sel={k:h.k,w:h.w||null};ensureVisible(h);req()}});
    hitEls[h.key]=e;hitBox.appendChild(e)}seen[h.key]=1;e.setAttribute('aria-label',h.lab+(sel&&sel.k===h.k&&(sel.w||null)===(h.w||null)?' (selected: press again to open)':''));
    var p=sp(h.x,h.y),it=h.w&&itemOf(h.k,h.w),board=it&&BK===h.k&&B>.5,hw=board?it.tw*cam.s:44,hh=board?it.th*cam.s:44;e.style.width=hw.toFixed(1)+'px';e.style.height=hh.toFixed(1)+'px';e.style.borderRadius=board?'4px':'50%';e.style.transform='translate3d('+(p[0]-hw/2).toFixed(1)+'px,'+(p[1]-hh/2).toFixed(1)+'px,0)';e.hidden=false});
  Object.keys(hitEls).forEach(function(k){if(!seen[k]){if(document.activeElement===hitEls[k])hitEls[k].blur();hitEls[k].remove();delete hitEls[k]}})}
function ensureVisible(h){if(cur.lv!==2)return;var p=sp(h.x,h.y);if(p[0]<40||p[0]>W-40||p[1]<TOPM+30||p[1]>H-60){var it=itemOf(h.k,h.w);if(it)fly(camClose(h.k,h.w),{dur:420})}}

/* ---------------------------------------------------------------- the selection pill: the label of what you selected, and the second press */
var pillEl=$('.wpick',host),pillKey='';
function pick(){var s=sel,show=s&&!MK&&!openL&&(cur.lv===0&&!s.w||cur.lv>=1&&s.w&&s.k===cur.k);if(!show){if(pillEl.classList.contains('on')){pillEl.classList.remove('on');pillEl.tabIndex=-1}return}
  var key=s.k+'/'+(s.w||'')+'@'+Math.min(cur.lv,2),x,y,below=0;if(pillEl.classList.contains('bd')&&!(s.w&&cur.lv>=2&&BK===s.k&&B>.5)){pillEl.classList.remove('bd');pillKey=''}
  if(!s.w){var c=CH[s.k],p=sp(c.x,c.y+c.ex.y1);x=p[0];y=p[1]+44;if(key!==pillKey){pillEl.innerHTML='<b>'+s.k+'</b><small>'+c.count+'</small><i>open ›</i>'}}
  else if(cur.lv>=2&&BK===s.k&&B>.5){var it2=itemOf(s.k,s.w),q2=sp(it2.x,it2.y),bw=it2.tw*cam.s,bh=it2.th*cam.s;key+='bd';
    if(key!==pillKey){pillEl.innerHTML='<i></i>';pillEl.querySelector('i').textContent=it2.kind==='link'?(it2.w==='contact'?'write ↗':'visit ↗'):'open ›';pillEl.classList.add('bd')}
    var pw2=pillEl.offsetWidth||60,ph2=pillEl.offsetHeight||22;pillKey=key;x=q2[0]+bw/2-pw2-5;y=q2[1]+bh/2-ph2-5;if(it2.k==='about')y=q2[1]-ph2/2;
    pillEl.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';if(!pillEl.classList.contains('on')){pillEl.classList.add('on');pillEl.tabIndex=0}return}
  else{var it=itemOf(s.k,s.w),q=sp(it.x,it.y),hh=(BK===it.k?B:0)*it.th*cam.s/2;x=q[0];y=q[1]+Math.max(12,hh+8);if(key!==pillKey){pillEl.innerHTML='<b></b><small></small><i></i>';pillEl.querySelector('b').textContent=it.lab;pillEl.querySelector('small').textContent=it.meta;
      pillEl.querySelector('i').textContent=it.kind==='link'?(it.w==='contact'?'write ↗':'visit ↗'):cur.lv<2?'closer ›':'open ›'}}
  pillKey=key;var pw=pillEl.offsetWidth||160,ph=pillEl.offsetHeight||40;if(y+ph>H-BOTM+20){y=y-ph-(s.w?Math.max(24,((BK===s.k?B:0)*(itemOf(s.k,s.w)||{th:0}).th*cam.s)+28):90)}
  x=clamp(x-pw/2,8,W-pw-8);y=clamp(y,TOPM,H-ph-8);pillEl.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';
  if(!pillEl.classList.contains('on')){pillEl.classList.add('on');pillEl.tabIndex=0}}
pillEl.addEventListener('pointerdown',function(){pillDown=now()});
pillEl.addEventListener('click',function(e){e.preventDefault();if(e.detail!==0&&now()-pillDown>1500)return;/* a compat click left over from a canvas tap */if(sel)press(sel.k,sel.w||null,true,true)});

/* ---------------------------------------------------------------- the mini-map */
var mm=$('canvas.wmm',host),mg=mm.getContext('2d'),MMW=78,MMH=58;
function mini(){if(!mm||mm.offsetParent===null)return;var r=DPR;if(mm.width!==MMW*r){mm.width=MMW*r;mm.height=MMH*r}mg.setTransform(r,0,0,r,0,0);mg.clearRect(0,0,MMW,MMH);
  var b=BOUND,s=Math.min((MMW-8)/(b.x1-b.x0),(MMH-8)/(b.y1-b.y0)),ox=MMW/2-(b.x0+b.x1)/2*s,oy=MMH/2-(b.y0+b.y1)/2*s;
  ORDER.forEach(function(k){var c=CH[k];if(!c)return;var here=cur.k===k&&cur.lv>0;mg.fillStyle=here?'rgba('+MINT+',.95)':'rgba('+c.tint+',.75)';
    c.items.forEach(function(it){mg.fillRect(ox+it.x*s-.5,oy+it.y*s-.5,1,1)})});
  mg.fillStyle='#fff';mg.font='700 8px Syl, sans-serif';mg.textAlign='center';mg.textBaseline='middle';mg.fillText('ᑕᐣᓯ',ox,oy);
  var a=wp(0,0),z=wp(W,H);mg.strokeStyle='rgba('+MINT+',.9)';mg.lineWidth=1;var x0=clamp(ox+a[0]*s,1,MMW-1),y0=clamp(oy+a[1]*s,1,MMH-1),x1=clamp(ox+z[0]*s,1,MMW-1),y1=clamp(oy+z[1]*s,1,MMH-1);
  mg.strokeRect(x0+.5,y0+.5,Math.max(2,x1-x0-1),Math.max(2,y1-y0-1))}

/* ---------------------------------------------------------------- hashes */
function closeTok(k){return CLOSEN[k]}
function hashOf(T){if(!T||!T.lv)return location.pathname+location.search;if(T.lv===1)return '#'+T.k;if(T.lv===2)return '#'+T.k+'/'+closeTok(T.k);var it=itemOf(T.k,T.w);return '#'+T.k+'/'+(it?it.slug:T.w)}
function parse(h){h=(h||'').replace(/^#/,'');try{h=decodeURIComponent(h)}catch(e){}if(!h||h==='sky'||h==='all')return{lv:0};
  var m=h.split('/');if(m[0]==='reel')return{lv:3,k:'film',w:'reel'};
  if(m[0]==='sky'){return CH[m[1]]?{lv:1,k:m[1]}:{lv:0}}
  var k=m[0];if(!CH[k])return{lv:0};var c=CH[k],x=m[1];
  if(!x||x==='l1'||x==='l0')return{lv:1,k:k};
  if(x==='l2'||x==='l3'||x===closeTok(k)||x==='works'||x==='all')return{lv:2,k:k};
  if(k==='sound'&&(x==='player'||x==='in'))x='wave';
  var it=c.by[x];if(it){if(it.kind==='link')return{lv:2,k:k,w:it.w};return{lv:3,k:k,w:it.w,play:m[2]==='play'}}
  return{lv:1,k:k}}
function hs(){var s=history.state;return s&&s.gj3?s:null}
function mkState(T,anc){return{gj3:1,lv:T.lv,k:T.k||null,w:T.w||null,anc:anc||0}}
function fromState(s,h){var T=parse(h);if(s&&s.gj3&&T.lv===2&&s.w&&CH[T.k]&&CH[T.k].by[s.w])T.w=s.w;return T}
function parentOf(T){if(T.lv===3)return{lv:2,k:T.k,w:T.w};if(T.lv===2)return{lv:1,k:T.k,w:T.w};return{lv:0,k:T.k}}

/* ---------------------------------------------------------------- moving between levels */
function closeAnchor(T){var it=itemOf(T.k,T.w);return it?{x:it.gx,y:it.gy}:{x:CH[T.k].x,y:CH[T.k].y}}
function layerOf(it){return it.kind==='reel'?window.__reel:it.kind==='player'?window.__player:it.kind==='bio'||it.kind==='poem'?CARD:window.__work}
function origin(it,c){var p=sp(it.gx,it.gy,c||cam);return{x:p[0],y:p[1],r:Math.max(6,Math.min(it.tw,it.th)*(c||cam).s/2)}}
function goTo(T,o){o=o||{};snapChk('goTo');if(FZ&&FZ.src==='rest'){FZ=null;if(fzMo){cancelAnimationFrame(fzMo);fzMo=0}}var F=cur,inst=!!o.instant||!anim();if(T.lv>=2&&!T.w)T.w=(sel&&sel.k===T.k&&sel.w)||(F.k===T.k&&F.w)||bestItem(T.k);
  cur={lv:T.lv,k:T.k||null,w:T.lv>=2?T.w:null,play:!!T.play};
  if(T.lv===0)sel=o.keepSel?sel:F.k?{k:F.k}:null;else if(T.lv===1)sel=F.lv>=2&&F.k===T.k&&F.w?{k:T.k,w:F.w}:T.w?{k:T.k,w:T.w}:null;else sel={k:T.k,w:T.w};
  if(T.k)want(T.k);if(T.lv>=1)ORDER.forEach(function(k){if(k!==T.k&&CH[k]&&BK===k&&T.lv>=2){B=0}});
  /* the same layer stays open: only "play" can change */
  if(openL&&F.lv===3&&T.lv===3&&F.k===T.k&&F.w===T.w){if(T.play&&window.__work&&openL.L===window.__work)__work.play();ui();return}
  var B1=T.lv>=2?1:0,BK1=T.lv>=2?T.k:F.lv>=2?F.k:BK,ct=camFor(T),deeper=T.lv>F.lv,dl=Math.abs(T.lv-F.lv);
  var anchor=deeper?(T.lv===1?{x:CH[T.k].x,y:CH[T.k].y}:closeAnchor(T)):F.lv>=1?(F.lv===1?{x:CH[F.k].x,y:CH[F.k].y}:closeAnchor(F)):null;
  if(!deeper&&F.k&&T.k&&F.k!==T.k)anchor=null;
  if(T.lv<2&&BK1!==BK)BK=BK1;
  var dur=dl<=1?520:620;
  /* a layer that is open closes back into its star (it keeps its spot on screen while the camera leaves) */
  if(openL&&!(T.lv===3&&openL.it===itemOf(T.k,T.w))){var L0=openL;openL=null;var or=origin(L0.it,camClose(L0.it.k,L0.it.w));L0.L.close({x:or.x,y:or.y,r:or.r,instant:inst||o.fast});}
  if(T.lv===3){var it=itemOf(T.k,T.w),L=layerOf(it);if(!L){cur={lv:2,k:T.k,w:T.w};fly(camClose(T.k,T.w),{B1:1,BK1:T.k,instant:inst,anchor:anchor});ui();return}
    var openNow=function(fast){var c2=camClose(T.k,T.w),or2=origin(it,c2);openL={it:it,L:L,full:false};L.open(it,{x:or2.x,y:or2.y,r:or2.r,instant:inst||fast,play:T.play});ui()};
    if(F.lv===2&&F.k===T.k||inst){BK=T.k;if(!inst)fly(ct,{B1:1,BK1:T.k,anchor:{x:it.x,y:it.y},dur:560});else fly(ct,{B1:1,BK1:T.k,instant:true});openNow(false)}
    else{BK=T.k;fly(camClose(T.k,T.w),{B1:1,BK1:T.k,anchor:anchor,dur:600,done:function(){if(cur.lv===3&&cur.w===T.w&&cur.k===T.k){fly(ct,{B1:1,dur:380});openNow(false)}}})}
    ui();return}
  fly(ct,{B1:B1,BK1:BK1,anchor:anchor,dur:dur,instant:inst});ui()}
function bestItem(k){var c=CH[k],b=null;c.items.forEach(function(it){if(!b||it.isNew&&!b.isNew||it.isNew===b.isNew&&it.b>b.b&&!b.isNew)b=it});return b?b.w:null}
var navLock=0,backPending=0;
function deeperT(){var T=cur;if(T.lv===0){var k=sel&&sel.k||null;return k?{lv:1,k:k}:null}
  if(T.lv===1){return{lv:2,k:T.k,w:sel&&sel.k===T.k&&sel.w||bestItem(T.k)}}
  if(T.lv===2){var it=itemOf(T.k,sel&&sel.k===T.k?sel.w:T.w);return it?{lv:3,k:T.k,w:it.w}:null}return null}
function inTo(T){if(!T)return;snapChk('inTo');lastLv=now();if(T.lv===3){var it=itemOf(T.k,T.w);if(it&&it.kind==='link'){openLink(it);return}}var s=hs();
  var a=(s?s.anc:0);try{for(var l=(cur.lv===0||cur.k===T.k?cur.lv+1:T.lv);l<T.lv;l++){var M2=l===1?{lv:1,k:T.k}:{lv:2,k:T.k,w:T.w};history.pushState(mkState(M2,++a),'',location.pathname+hashOf(M2))}
    history.pushState(mkState(T,a+1),'',location.pathname+hashOf(T))}catch(e){}goTo(T)}
function openLink(it){var a=document.createElement('a');a.href=it.href;if(!/^mailto:/.test(it.href)){a.target='_blank';a.rel='noopener'}document.body.appendChild(a);a.click();a.remove()}
function snapChk(n){if(!fzOpen&&DBG&&(pz||now()-pzEndT<500)){DBG.snap=(DBG.snap||0)+1;DBG.snapN=n}}
function out(){snapChk('out');if(cur.lv===0){if(sel){sel=null;req()}return false}lastLv=now();
  if(window.__work&&__work.unfull&&__work.unfull()){}
  var s=hs(),P=parentOf(cur);if(s&&s.anc>0&&s.lv===cur.lv){if(backPending&&now()-backPending<700)return true;backPending=now();history.back();return true}
  try{history.replaceState(mkState(P,0),'',location.pathname+hashOf(P))}catch(e){}goTo(P);return true}
function jump(lv){if(lv>=cur.lv)return;var s=hs(),steps=cur.lv-lv,T=lv===0?{lv:0}:lv===1?{lv:1,k:cur.k}:{lv:2,k:cur.k,w:cur.w};
  if(s&&s.anc>=steps){backPending=now();history.go(-steps);return}
  try{history.replaceState(mkState(T,0),'',location.pathname+hashOf(T))}catch(e){}goTo(T)}
function lateral(T){var s=hs();try{history.replaceState(mkState(T,s?s.anc:0),'',location.pathname+hashOf(T))}catch(e){}}
addEventListener('popstate',function(e){backPending=0;var s=e.state,T=fromState(s,location.hash);
  if(!s||!s.gj3){try{history.replaceState(mkState(T,0),'',T.lv?hashOf(T):location.pathname+location.search)}catch(x){}}
  if(MK)endMark();goTo(T)});
/* press = the one tap rule: the first press selects (and names it), the second press opens */
var lastLv=0,lastTap=0,pillDown=-1e9;/* one level per gesture: ~350 ms cooldown after any level change; the compat click that follows a canvas tap is ignored */
function press(k,w,fromKey,fromPill){if(MK){skipMark();return}if(now()-lastLv<350)return;var lv=cur.lv;
  if(lv===0){if(!k)return;if(sel&&sel.k===k&&!sel.w){inTo({lv:1,k:k})}else{sel={k:k};want(k);req();ui()}return}
  if(!w){/* a press on another chapter while inside one: select it, the second press flies across */
    if(k&&k!==cur.k&&lv===1){if(sel&&sel.k===k&&!sel.w){lateral({lv:1,k:k});goTo({lv:1,k:k})}else{sel={k:k};req()}return}
    if(sel){sel=null;req()}return}
  var it=itemOf(k,w);if(!it)return;
  if(sel&&sel.k===k&&sel.w===w){if(lv===1)inTo({lv:2,k:k,w:w});else if(lv===2)inTo({lv:3,k:k,w:w});return}
  sel={k:k,w:w};if(lv===2)ensureVisible(it);req();ui()}
function viewFilm(w){var it=itemOf('film',w);if(!it)return;var T={lv:3,k:'film',w:w};lateral(T);var L0=openL;cur={lv:3,k:'film',w:w,play:false};sel={k:'film',w:w};
  fly(camLayer('film',w),{instant:true,B1:1,BK1:'film'});var c2=camClose('film',w),or=origin(it,c2);openL={it:it,L:window.__work,full:false};__work.open(it,{x:or.x,y:or.y,r:or.r,fade:true});
  if(L0&&L0.L!==window.__work)setTimeout(function(){L0.L.close({instant:true})},anim()?260:0);ui()}
function neighbour(dir){if(cur.lv!==3)return;var c=CH[cur.k],list=c.items.filter(function(i){return i.kind==='work'}),i=list.indexOf(itemOf(cur.k,cur.w));if(i<0)return;
  return lateralTo(list[(i+dir+list.length)%list.length])}
function lateralTo(n){if(!n||cur.lv!==3||!openL)return null;var T={lv:3,k:n.k,w:n.w};lateral(T);cur=T;sel={k:T.k,w:T.w};openL.it=n;fly(camLayer(T.k,T.w),{instant:true});ui();return n}

/* ---------------------------------------------------------------- gestures on the sky */
var TC={x:0,y:0,t:-1e9};function tcSet(m){TC.x=m.x;TC.y=m.y;TC.t=now()}function tcFresh(){return now()-TC.t<300}
var P={},pz=null,tapT=null,lastWheel=0,wAcc=0,wLock=0,dragging=null;
function pts(){return Object.keys(P).map(function(k){return P[k]})}
function hitTest(x,y){var lv=cur.lv;
  if(lv===0){var best=null,bd=1e9;ORDER.forEach(function(k){var c=CH[k];if(!c)return;var a=sp(c.x+c.ex.x0,c.y+c.ex.y0),b=sp(c.x+c.ex.x1,c.y+c.ex.y1+52/cam.s);
      if(x>a[0]-16&&x<b[0]+16&&y>a[1]-16&&y<b[1]+16){var p=sp(c.x,c.y),d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=k}}});return best?{k:best}:null}
  var k=cur.k,c=CH[k],bl=BK===k?B:0,best2=null,bd2=1e9;
  c.items.forEach(function(it){var p=sp(it.x,it.y),hw=Math.max(22,it.tw*cam.s*bl/2+6),hh=Math.max(22,it.th*cam.s*bl/2+6);if(Math.abs(p[0]-x)<=hw&&Math.abs(p[1]-y)<=hh){var d=Math.hypot(p[0]-x,p[1]-y);if(d<bd2){bd2=d;best2=it}}});
  if(best2)return{k:k,w:best2.w};
  if(lv===1){var o=null;ORDER.forEach(function(k2){if(k2===k||!CH[k2])return;var c2=CH[k2],a=sp(c2.x+c2.ex.x0,c2.y+c2.ex.y0),b=sp(c2.x+c2.ex.x1,c2.y+c2.ex.y1);if(x>a[0]&&x<b[0]&&y>a[1]&&y<b[1])o=k2});if(o)return{k:o}}
  return null}
cv.addEventListener('pointerdown',function(e){if(MK){skipMark();e.preventDefault();return}if(e.button)return;try{cv.setPointerCapture(e.pointerId)}catch(x){}P[e.pointerId]={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:now(),type:e.pointerType};
  if(DBG)dbgSet('pointerdown:'+e.pointerType);var L=pts();if(L.length===2){dragging=null;try{pinchStart(L)}catch(x){dbgErr(x)}}else if(L.length===1){dragging={x0:e.clientX,y0:e.clientY,c0:{x:cam.x,y:cam.y,s:cam.s},moved:false}}});
cv.addEventListener('pointermove',function(e){var p=P[e.pointerId];if(!p)return;p.x=e.clientX;p.y=e.clientY;var L=pts();if(L.length===2)tcSet({x:(L[0].x+L[1].x)/2,y:(L[0].y+L[1].y)/2});
  if(L.length>=2&&pz){if(pz.src==='ptr')pinchMove(L);return}
  if(pz)return;
  if(dragging&&L.length===1){var dx=e.clientX-dragging.x0,dy=e.clientY-dragging.y0;if(!dragging.moved&&Math.hypot(dx,dy)>8){dragging.moved=true;if(tw){tw=null}dragging.c0={x:cam.x,y:cam.y,s:cam.s};dragging.x0=e.clientX;dragging.y0=e.clientY;dx=0;dy=0}
    if(dragging.moved){var c=clampCam({x:dragging.c0.x-dx/cam.s,y:dragging.c0.y-dy/cam.s,s:cam.s},anim()&&cur.lv<2); /* w6: the board is locked (hard clamp, no rubber band) */cam.x=c.x;cam.y=c.y;req()}}});
function upP(e){var p=P[e.pointerId];if(!p)return;delete P[e.pointerId];var L=pts();
  if(pz){if(L.length<2&&pz.src==='ptr')pinchEnd(e.type==='pointercancel');if(!L.length)dragging=null;return}
  if(dragging){var d=dragging;dragging=null;if(d.moved){var c=clampCam(cam,false);if(Math.abs(c.x-cam.x)+Math.abs(c.y-cam.y)>.5)fly(c,{dur:300});return}
    if(e.type==='pointercancel'||now()-pzEndT<450||p.t0<pzEndT)return;if(now()-p.t0<700&&Math.hypot(e.clientX-p.x0,e.clientY-p.y0)<12){lastTap=now();var h=hitTest(e.clientX,e.clientY);if(h)press(h.k,h.w||null);else press(null,null)}}}
cv.addEventListener('pointerup',upP);cv.addEventListener('pointercancel',upP);
/* how far the camera may wander: FAR a little, MID around its chapter, CLOSE across the chapter's thumbnails */
function clampCam(c,elastic){var lv=cur.lv,b;if(lv===0){var f=camFar();b={x0:f.x-W*.25/f.s,x1:f.x+W*.25/f.s,y0:f.y-H*.2/f.s,y1:f.y+H*.2/f.s}}
  else{var ch=CH[cur.k],e=ch.ex,s=c.s,hw=(W/2-30)/s,hh=(H/2-60)/s,cx0=ch.x+e.x0+hw,cx1=ch.x+e.x1-hw,cy0=ch.y+e.y0+hh-TOPM/s,cy1=ch.y+e.y1-hh+BOTM/s;
    if(lv===1){var m=camMid(cur.k);b={x0:m.x-W*.3/m.s,x1:m.x+W*.3/m.s,y0:m.y-H*.25/m.s,y1:m.y+H*.25/m.s}}
    else{var g2=ch.bex,hw2=(W/2)/s,hh2=(H/2)/s;cx0=g2.x0+hw2;cx1=g2.x1-hw2;cy0=g2.y0-TOPM/s+hh2;cy1=g2.y1+BOTM/s-hh2;if(cx0>cx1){cx0=cx1=(g2.x0+g2.x1)/2}if(cy0>cy1){cy0=cy1=(g2.y0+g2.y1)/2}b={x0:cx0,x1:cx1,y0:cy0,y1:cy1}}}
  function el(v,a,z){if(v<a)return elastic?a-(a-v)*.35:a;if(v>z)return elastic?z+(v-z)*.35:z;return v}
  return{x:el(c.x,b.x0,b.x1),y:el(c.y,b.y0,b.y1),s:c.s}}
/* ZOOM THROUGH: pinch / trackpad-pinch / wheel move the one camera continuously along FAR → MID → CLOSE of the chapter nearest the fingers.
   u is the depth (0 sky, 1 chapter, 2 board); the stars bloom into the board with u. On release it settles to the nearest level
   without momentum. Only a second, deliberate pinch begun at CLOSE may open a tile. */
var FZ=null,OPEN_U=2.55,OPEN_DWELL=140;
var releaseChip=document.createElement('div');releaseChip.className='w-release';releaseChip.hidden=true;releaseChip.textContent='keep spreading to open';releaseChip.setAttribute('aria-hidden','true');host.appendChild(releaseChip);
function dist2(L){return Math.hypot(L[0].x-L[1].x,L[0].y-L[1].y)}
function lsg(a,b,t){var s=a.s*Math.pow(b.s/a.s,t),k=Math.abs(b.s-a.s)<1e-9?t:(s-a.s)/(b.s-a.s);return{x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k),s:s}}
function fzCam(u){var k=FZ.k;if(u<=1)return lsg(camFar(),camMid(k),u);return lsg(camMid(k),camClose(k,FZ.w||bestItem(k)),u-1)}
function fzU(sc){var k=FZ.k,f=camFar().s,m=camMid(k).s,c=sClose();return sc<=m?Math.log(sc/f)/Math.log(m/f):1+Math.log(sc/m)/Math.log(c/m)}
function fzStart(m,src){if(MK||openL)return false;if(tw)tw=null;if(fzMo){cancelAnimationFrame(fzMo);fzMo=0}var P=FZ,lv=cur.lv,k=cur.k;
  if(P&&P.u>.3){k=P.k}else if(lv===0||P){var h=hitTest(m.x,m.y);k=h&&h.k||nearestChapter(m.x,m.y)}if(!k)return false;
  var w=P&&P.k===k?P.w:lv>=1?(sel&&sel.k===k&&sel.w||cur.w||null):null;
  FZ={k:k,w:w,src:src,lv0:lv,m0:m,m:m,v:0,t:now()};var u0=clamp(fzU(cam.s),-.22,2.8);if(!P&&!tw&&Math.abs(u0-Math.min(lv,2))<.08)u0=Math.min(lv,2);FZ.u0=FZ.u=FZ.ut=u0;FZ.vl=u0<.5?0:u0<1.5?1:2;FZ.anc=u0>=1.5;FZ.canOpen=lv===2&&u0>=1.85&&src!=='wheel';FZ.aboveAt=null;fzAnchor(m);if(FZ.anc&&FZ.ait)FZ.w=FZ.ait.w;var c=fzCam(FZ.u);FZ.off={x:(cam.x-c.x)*cam.s,y:(cam.y-c.y)*cam.s};FZ.s0=cam.s;
  if(lv<2){BK=k}if(DBG){DBG.init=src;DBG.cnt['init:'+src]=(DBG.cnt['init:'+src]||0)+1}if(sel){sel=null}try{ui()}catch(x){}return true}
function fzSet(u){var F=FZ,t=now(),dt=Math.max(8,t-F.t);u=clamp(u,-.22,F.canOpen?2.8:2);if(F.canOpen&&u>=OPEN_U){if(F.aboveAt===null){F.aboveAt=t;F.chipTimer=setTimeout(function(){if(FZ===F&&F.u>=OPEN_U)releaseChip.textContent='release to open'},OPEN_DWELL)}}else{F.aboveAt=null;clearTimeout(F.chipTimer)}releaseChip.hidden=!(F.canOpen&&u>2.35);releaseChip.textContent=u<OPEN_U?'keep spreading to open':t-F.aboveAt>=OPEN_DWELL?'release to open':'hold to open';F.v=lerp(F.v,(u-F.u)/dt,.35);F.t=t;F.u=u;
  if(u>1.02&&!F.w){var p=F.m||F.m0;F.w=nearestItemK(F.k,p.x,p.y)}if(u>.4&&!F.want){F.want=1;try{want(F.k)}catch(x){}} /* thumbnails start loading as soon as you head in */
  F.vl=u<.5?0:u<1.5?1:2;var c=fzCam(Math.min(Math.max(u,-.22),2)),fd=clamp(1-Math.abs(u-F.u0),0,1),px=F.off.x*fd+(F.m.x-F.m0.x),py=F.off.y*fd+(F.m.y-F.m0.y);
  var bx=c.x-px/c.s,by=c.y-py/c.s,s=u>2?fzCam(u).s:c.s,nx=bx,ny=by;
  /* w6: on (and past) the board the zoom is anchored on the fingers: the tile you pinch stays under them and grows (w5 drifted to FZ.w) */
  if(F.anc){var a=fzAnchorAt(u,s),k2=clamp((u-1)/.5,0,1);nx=lerp(bx,a.x,k2);ny=lerp(by,a.y,k2)}
  else if(u>2){var bw2=wp(F.m.x,F.m.y,{x:bx,y:by,s:c.s});nx=bw2[0]-(F.m.x-W/2)/s;ny=bw2[1]-(F.m.y-H/2)/s}
  cam.x=nx;cam.y=ny;cam.s=s;BK=F.k;B=clamp(u-1,0,1);fzLevel();req()}
function fzAnchor(m){var F=FZ;F.aw=wp(m.x,m.y);F.ait=null;if(F.u0>=1.02){var w=hitTestK(F.k,m.x,m.y),it=w&&itemOf(F.k,w);if(it){var p=sp(it.x,it.y);F.ait=it;F.ad={x:m.x-p[0],y:m.y-p[1]}}}}
function fzAnchorAt(u,s){var F=FZ,it=F.ait;if(it){var pm=ease(clamp(clamp(u-1,0,1)*1.12,0,1)),ix=lerp(it.sx,it.gx,pm),iy=lerp(it.sy,it.gy,pm);return{x:ix-(F.m.x-F.ad.x-W/2)/s,y:iy-(F.m.y-F.ad.y-H/2)/s}}
  return{x:F.aw[0]-(F.m.x-W/2)/s,y:F.aw[1]-(F.m.y-H/2)/s}}
function fzRebase(m){var F=FZ;if(!F)return;F.m0=F.m=m;fzAnchor(m)}
function tileNear(k,x,y,r){var c=CH[k],bl=BK===k?B:0,best=null,bd=1e9;c.items.forEach(function(it){var p=sp(it.x,it.y),hw=it.tw*cam.s*bl/2,hh=it.th*cam.s*bl/2,dx=Math.max(0,Math.abs(p[0]-x)-hw),dy=Math.max(0,Math.abs(p[1]-y)-hh),d=Math.hypot(dx,dy);if(d<bd){bd=d;best=it.w}});return bd<=r?best:null}
var fzMo=0,fzOpen=0;
function fzEnd(cancelled){var F=FZ;if(!F)return;clearTimeout(F.tm);clearTimeout(F.chipTimer);if(fzMo){cancelAnimationFrame(fzMo);fzMo=0}if(wRaf){cancelAnimationFrame(wRaf);wRaf=0}releaseChip.hidden=true;pzEndT=now();
  if(!cancelled&&F.canOpen&&F.u>=OPEN_U&&F.aboveAt!==null&&now()-F.aboveAt>=OPEN_DWELL&&!openL){var mm=F.m||F.m0,w=hitTestK(F.k,mm.x,mm.y)||tileNear(F.k,mm.x,mm.y,48)||(F.ait&&F.ait.w)||null,itw=w&&itemOf(F.k,w);if(itw&&itw.kind==='link')w=null;if(DBG)DBG.open=(w||'none')+'@'+F.u.toFixed(2);if(w){fzOpen=1;FZ=null;try{cur={lv:2,k:F.k,w:w,play:false};inTo({lv:3,k:F.k,w:w})}finally{fzOpen=0}return}}
  /* Always commit an exact camera band, including reduced motion and cancelled touches. */
  var targetU=clamp(Math.round(F.u),0,2);F.u=targetU;fzLevel(true);var target=fzCam(targetU);
  fly(target,{dur:280,instant:!anim(),B1:targetU===2?1:0,BK1:F.k});FZ=null;req();
}
/* the breadcrumb + depth dots follow whichever level range the camera is in; history is replaced, never pushed, by zooming */
function fzLevel(force){var F=FZ;if(!F||openL)return;var lv=F.u<.5?0:F.u<1.5?1:2,k=F.k;if(lv===cur.lv&&(lv===0||cur.k===k)&&!force)return;
  if(lv===cur.lv&&(lv===0||cur.k===k)&&(lv<2||cur.w===F.w))return;
  if(lv>=2&&!F.w)F.w=nearestItemK(k,W/2,H/2);
  cur={lv:lv,k:lv?k:null,w:lv>=2?F.w:null,play:false};if(sel&&sel.k!==k)sel=null;if(lv===0&&!sel)sel=null;
  try{history.replaceState(mkState(cur,(hs()||{}).anc||0),'',location.pathname+hashOf(cur))}catch(x){}ui()}
function pinchStart(L,src){var m={x:(L[0].x+L[1].x)/2,y:(L[0].y+L[1].y)/2};tcSet(m);if(pz)return;if(DBG)DBG.init0=src;pz={d0:Math.max(8,dist2(L)),m0:m,c0:{x:cam.x,y:cam.y,s:cam.s},live:0,src:src||'ptr'};if(!fzStart(m,pz.src))pz=null}
function pinchMove(L){if(!pz)return;var m={x:(L[0].x+L[1].x)/2,y:(L[0].y+L[1].y)/2},r=dist2(L)/pz.d0;tcSet(m);pz.m=m;pz.r=r;if(!FZ)return;FZ.m=m;fzSet(fzU(FZ.s0*Math.pow(r,FZ.anc?1.15:1.5))) /* a little gain: one comfortable spread goes sky → board */}
function pinchLive(){}
var pzEndT=-1e9;function pinchEnd(cancelled){pz=null;pzEndT=now();if(FZ&&FZ.src!=='rest')fzEnd(cancelled)}
function hitTestK(k,x,y){var c=CH[k],bl=BK===k?B:0,best=null,bd=1e9;c.items.forEach(function(it){var p=sp(it.x,it.y),hw=Math.max(22,it.tw*cam.s*bl/2+6),hh=Math.max(22,it.th*cam.s*bl/2+6);if(Math.abs(p[0]-x)<=hw&&Math.abs(p[1]-y)<=hh){var d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=it.w}}});return best}
function nearestItemK(k,x,y){var best=null,bd=1e9;CH[k].items.forEach(function(it){var p=sp(it.x,it.y),d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=it.w}});return best}
function pinchTarget(m){var lv=cur.lv;if(lv===0){var h=hitTest(m.x,m.y);var k=h&&h.k||sel&&sel.k||nearestChapter(m.x,m.y);return k?{lv:1,k:k}:null}
  if(lv===1){var h1=hitTest(m.x,m.y);var w=h1&&h1.w||sel&&sel.k===cur.k&&sel.w||nearestItem(m.x,m.y);return{lv:2,k:cur.k,w:w}}
  if(lv===2){var h2=hitTest(m.x,m.y);if(h2&&h2.w){var it=itemOf(cur.k,h2.w);if(it.kind!=='link')return{lv:3,k:cur.k,w:h2.w}}return null}return null}
function nearestChapter(x,y){var best=null,bd=1e9;ORDER.forEach(function(k){if(!CH[k])return;var p=sp(CH[k].x,CH[k].y),d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=k}});return best}
function nearestItem(x,y){var best=null,bd=1e9;CH[cur.k].items.forEach(function(it){var p=sp(it.x,it.y),d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=it.w}});return best}
/* wheel: trackpad pinch (ctrl) and a mouse wheel step one level, then lock (350 ms of quiet); a two-finger trackpad scroll pans */
host.addEventListener('wheel',function(e){e.preventDefault();if(MK){skipMark();return}var t=now(),gap=t-lastWheel;lastWheel=t;
  var mouse=!e.ctrlKey&&(e.deltaMode!==0||(Math.abs(e.deltaY)>=50&&e.deltaX===0&&Math.abs(e.deltaY-Math.round(e.deltaY))<1e-6));
  if(!e.ctrlKey&&!mouse){var c=clampCam({x:cam.x+e.deltaX/cam.s,y:cam.y+e.deltaY/cam.s,s:cam.s},false);if(tw)tw=null;cam.x=c.x;cam.y=c.y;req();return}
  var m={x:e.clientX,y:e.clientY};if(!FZ||FZ.src!=='wheel'){if(!fzStart(m,'wheel')){ /* reduced motion: one level per notch */
      if(t<wLock)return;wAcc+=e.deltaY;if(wAcc<-40){wAcc=0;wLock=t+600;var T=pinchTarget(m);if(T)inTo(T)}else if(wAcc>40){wAcc=0;wLock=t+600;out()}return}}
  var dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?400:1);FZ.m=FZ.m0;FZ.ut=clamp(FZ.ut-dy*(e.ctrlKey?.012:.0042),-.22,2);wheelAnim();
  clearTimeout(FZ.tm);FZ.tm=setTimeout(function(){if(FZ&&FZ.src==='wheel'){FZ.u=FZ.ut;FZ.v=0;fzEnd()}},e.ctrlKey?160:240)},{passive:false});
var wRaf=0;function wheelAnim(){if(wRaf)return;wRaf=requestAnimationFrame(function st(){wRaf=0;if(!FZ||FZ.src!=='wheel')return;var d=FZ.ut-FZ.u;fzSet(Math.abs(d)<.004?FZ.ut:FZ.u+d*.32);if(Math.abs(FZ.ut-FZ.u)>.002)wRaf=requestAnimationFrame(st)})}
var BUILD='w7',DBG=/[?&#]dbg/.test(location.search+location.hash)?{h:'-',n:0,c:'-',pd:'-',cnt:{},err:''}:null;
if(DBG){window.addEventListener('error',function(e){dbgErr(e.message)});(function(){var o=document.createElement('pre');o.className='gj-dbg';
  o.style.cssText='position:fixed;z-index:2147483647;top:calc(env(safe-area-inset-top,0px) + 54px);right:6px;margin:0;max-width:62vw;white-space:pre-wrap;font:10.5px/1.35 ui-monospace,Menlo,monospace;color:#bff;background:rgba(0,0,0,.72);padding:5px 7px;border-radius:6px;pointer-events:none';
  document.documentElement.appendChild(o);(function f(){try{var vv=window.visualViewport,c=DBG.cnt,cs=Object.keys(c).map(function(k){return k+':'+c[k]}).join(' ');
    o.textContent='build '+BUILD+' · iOS '+IOS+'\ntouches '+DBG.n+' · last '+DBG.h+'\ncancelable '+DBG.c+' · prevented '+DBG.pd+(DBG.gs!=null?' · gScale '+(+DBG.gs).toFixed(2):'')+'\nvv.scale '+(vv?vv.scale.toFixed(2):'n/a')+' · lv '+cur.lv+(FZ?' · u '+FZ.u.toFixed(2)+' ('+FZ.src+')':'')+' · cam '+cam.s.toFixed(2)+'\ninit '+(DBG.init||'-')+' · snap calls '+(DBG.snap||0)+(DBG.snapN?' ('+DBG.snapN+')':'')+' · rm '+!anim()+(DBG.open?' · open '+DBG.open:'')+'\n'+cs+(DBG.err?'\nERR '+DBG.err:'')}catch(x){o.textContent='dbg '+x}requestAnimationFrame(f)})()})()}
var HAS_TOUCH='ontouchstart' in window||navigator.maxTouchPoints>0; /* w6: on a touch screen iOS sends gesturestart BEFORE the 2nd touchstart (no finger centroid yet): wait for the touches / first gesturechange */
var IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;document.documentElement.classList.toggle('ios',IOS);
/* Safari never gets to page-zoom: two-finger touchmove is ours everywhere */
document.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1&&e.cancelable)e.preventDefault()},{passive:false});
['gesturestart','gesturechange','gestureend'].forEach(function(n){var h=function(e){if(e.cancelable!==false)e.preventDefault();try{dbgSet(n,e);if(DBG)DBG.gs=e.scale;
  /* desktop Safari trackpad pinch, and the iOS fallback if the touch pinch above never started: drive the same continuous camera with e.scale */
  if(e.__gj)return;e.__gj=1;if(openL||MK)return;if(pz&&pz.src!=='gest')return;var tf=tcFresh(),m0=tf?{x:TC.x,y:TC.y}:{x:e.clientX||W/2,y:e.clientY||H/2};var sc=+e.scale||1;if(n!=='gestureend'){if(!pz&&!(n==='gesturestart'&&HAS_TOUCH&&!tf)){dragging=null;if(fzStart(m0,'gest')){pz={src:'gest',d0:1,g0:n==='gesturestart'?1:sc,m0:m0,tc:tf};FZ.m=m0}}
    else if(pz.src==='gest'&&FZ&&tf){if(!pz.tc){pz.tc=1;fzRebase(m0)}else FZ.m=m0} /* w6: iOS sends gesturestart before the 2nd touchstart: re-anchor on the real finger centroid once touches arrive */
    if(n==='gesturechange'&&pz&&pz.src==='gest'&&FZ)fzSet(fzU(FZ.s0*Math.pow(sc/pz.g0,FZ.anc?1.15:1.5)))}else if(pz&&pz.src==='gest'){pinchEnd()}}catch(x){dbgErr(x)}};
  document.addEventListener(n,h,{passive:false});window.addEventListener(n,h,{passive:false})});
/* two fingers closing over an open layer (a work page, the player, a card) = out one level; one finger stays theirs */
var lz=null;function tL(e){var t=e.touches;return[{x:t[0].clientX,y:t[0].clientY},{x:t[1].clientX,y:t[1].clientY}]}
/* the camera pinch, on DOCUMENT so fingers that land on the breadcrumb, rail, mini-map, pill or a label still pinch the sky.
   Every handler is wrapped so one error can never leave Safari holding the pinch. */
function dbgSet(h,e){if(!DBG)return;DBG.h=h;DBG.n=e&&e.touches?e.touches.length:DBG.n;DBG.c=e?e.cancelable:DBG.c;DBG.cnt[h]=(DBG.cnt[h]||0)+1}
function dbgErr(x){if(DBG){DBG.err=String(x&&x.message||x).slice(0,90)}}
function tPrev(e){if(e.touches&&e.touches.length>=2&&e.cancelable){e.preventDefault();if(DBG)DBG.pd=e.defaultPrevented}}
document.addEventListener('touchstart',function(e){try{tPrev(e);if(e.touches.length<2)return;dbgSet('touchstart',e);if(openL)return;if(MK){skipMark();return}
  dragging=null;var tl1=tL(e);tcSet({x:(tl1[0].x+tl1[1].x)/2,y:(tl1[0].y+tl1[1].y)/2});if(!pz)pinchStart(tl1,'touch');else if(pz.src==='ptr')pz.src='touch'}catch(x){dbgErr(x)}},{passive:false});
document.addEventListener('touchmove',function(e){try{tPrev(e);if(e.touches.length<2)return;dbgSet('touchmove',e);if(openL)return;var tl0=tL(e);tcSet({x:(tl0[0].x+tl0[1].x)/2,y:(tl0[0].y+tl0[1].y)/2});
  if(!pz&&!MK){dragging=null;pinchStart(tL(e),'touch')} /* a pinch that began during the opening mark, or whose touchstart was missed */
  if(pz&&pz.src==='touch')pinchMove(tL(e))}catch(x){dbgErr(x)}},{passive:false});
function tEnd(e){try{if(DBG)dbgSet(e.type,e);if(pz&&pz.src==='touch'&&e.touches.length<2){pinchEnd(e.type==='touchcancel')}}catch(x){dbgErr(x);pz=null;FZ=null}}
document.addEventListener('touchend',tEnd,{passive:true});document.addEventListener('touchcancel',tEnd,{passive:true});
document.addEventListener('touchstart',function(e){if(!openL||e.touches.length!==2){if(e.touches.length!==2)lz=null;return}if(openL.L===window.__reel)return;var t=e.touches;lz={d:Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY),done:0}},{passive:true});
document.addEventListener('touchmove',function(e){if(!lz||e.touches.length!==2)return;if(e.cancelable)e.preventDefault();var t=e.touches,d=Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);if(!lz.done&&d/lz.d<.78){lz.done=1;out()}},{passive:false});
document.addEventListener('touchend',function(e){if(e.touches.length<2)lz=null},{passive:true});
addEventListener('wheel',function(e){if(!openL||!e.ctrlKey||host.contains(e.target))return;if(openL.L===window.__reel)return;e.preventDefault();var t=now();if(t<wLock){wLock=Math.max(wLock,t+350);return}
  wAcc=(t-lastWheel>350?0:wAcc)+e.deltaY;lastWheel=t;if(wAcc>40){wAcc=0;wLock=t+870;out()}},{passive:false});
/* keys: Esc = out one level; Enter/Space on the sky = the second press; arrows move the selection */
addEventListener('keydown',function(e){if(e.defaultPrevented)return;var k=e.key;if(MK&&k!=='Tab'){skipMark();return}
  if(k==='Escape'){if(window.__work&&__work.fsGuard&&__work.fsGuard())return;if(openL&&openL.L===window.__reel)return; /* the reel's own Esc calls out() */
    e.preventDefault();out();return}
  if(openL)return;var tgt=e.target;if(tgt&&tgt.closest&&tgt.closest('input,textarea,select'))return;
  if((k==='Enter'||k===' ')&&(tgt===document.body||tgt===cv||tgt===host)){e.preventDefault();if(sel)press(sel.k,sel.w||null,true);return}
  if(k==='+'||k==='='){e.preventDefault();inTo(deeperT())}else if(k==='-'||k==='_'){e.preventDefault();out()}
  else if(/^Arrow/.test(k)&&(tgt===document.body||tgt===cv||tgt===host||(tgt.classList&&tgt.classList.contains('wh')))){e.preventDefault();arrow(k)}});
function arrow(k){var dx=k==='ArrowLeft'?-1:k==='ArrowRight'?1:0,dy=k==='ArrowUp'?-1:k==='ArrowDown'?1:0;var L=hitList();if(!L.length)return;
  var c0=sel?L.filter(function(h){return h.k===sel.k&&(h.w||null)===(sel.w||null)})[0]:null;if(!c0){var h0=L[0];sel={k:h0.k,w:h0.w||null};focusHit(h0);req();return}
  var best=null,bd=1e9;L.forEach(function(h){if(h===c0)return;var vx=h.x-c0.x,vy=h.y-c0.y,along=vx*dx+vy*dy;if(along<=0)return;var d=along+Math.abs(vx*dy-vy*dx)*2;if(d<bd){bd=d;best=h}});
  if(best){sel={k:best.k,w:best.w||null};focusHit(best);req()}}
function focusHit(h){var e=hitEls[h.key];if(e)try{e.focus({preventScroll:true})}catch(x){}}

/* ---------------------------------------------------------------- the one bar: ‹ + breadcrumb, the depth rail */
var bar=$('.wn'),backB=$('.wn-b',bar),crumb=$('.wn-c',bar),rail=$('.wr'),lastCrumb='';
function layerName(){var it=itemOf(cur.k,cur.w);if(!it)return '';if(it.kind==='reel'){var r=window.__reel&&__reel.state?__reel.state():null;return 'reel '+(r&&r.i>=0?pad(r.i+1)+' / '+pad(r.n):'')}
  if(it.kind==='player'){var p=window.__player&&__player.state?__player.state():null;return 'player'+(p&&p.title?' · '+p.title:'')}
  if(it.k==='photo')return 'photograph '+(it.i+1)+' of '+CH.photo.items.length;if(it.kind==='poem')return 'the poem';return it.lab}
function path(){var L=[{lv:0,n:'ᑕᐣᓯ'}];if(cur.lv>=1)L.push({lv:1,n:cur.k});if(cur.lv>=2)L.push({lv:2,n:CLOSEN[cur.k]});if(cur.lv>=3)L.push({lv:3,n:layerName()});return L}
/* w7 scopes film chrome locally: shared Scope/work/pro scripts remain untouched. */
function filmChrome(){var im=$('.imm'),pb=im&&$('[data-a=play]',im),row=im&&$('.sc-row',im),dock=im&&$('.imm-b',im),film=cur.lv===3&&cur.k==='film'&&cur.w!=='reel';if(!im||!pb||!dock)return;im.classList.toggle('film-clean',film);if(film&&row){row.insertBefore(pb,$('[data-s=next]',row))}else if(pb.parentNode!==dock){dock.insertBefore(pb,$('[data-a=ext]',dock))}}
function ui(){filmChrome();var L=path(),key=L.map(function(x){return x.n}).join('|')+'#'+cur.lv;
  if(key!==lastCrumb){lastCrumb=key;var h='';L.forEach(function(x,i){var last=i===L.length-1;if(i)h+='<i aria-hidden="true">›</i>';
      if(x.lv===0)h+=last?'<b class="sig" aria-current="page">ᑕᐣᓯ</b><span class="wn-nm">gill james</span>':'<button type="button" class="sig" data-lv="0" aria-label="the whole sky">ᑕᐣᓯ</button>';
      else h+=last?'<b aria-current="page">'+esc(x.n)+'</b>':'<button type="button" data-lv="'+x.lv+'">'+esc(x.n)+'</button>'});
    crumb.innerHTML=h;bar.classList.toggle('far',cur.lv===0);backB.hidden=cur.lv===0;backB.setAttribute('aria-label',cur.lv?'out one level, to '+L[L.length-2].n.replace('ᑕᐣᓯ','the whole sky'):'');
    var rh='';['sky',cur.lv>=1?cur.k:'chapter',cur.lv>=2?CLOSEN[cur.k]:'works',cur.lv>=3?L[3].n.replace(/ · .*/,'').replace(/ \d+ \/ \d+$/,''):'open'].forEach(function(n,i){rh+='<li class="'+(i===cur.lv?'here':i<cur.lv?'up':'')+'"><span>'+esc(n)+'</span></li>'});rail.innerHTML='<ol>'+rh+'</ol>'}
  D.dataset.lv=cur.lv;D.classList.toggle('w-layer',!!openL||cur.lv===3);document.title=cur.lv===0?'Gill James · ᑕᐣᓯ':L.slice(1).map(function(x){return x.n}).reverse().join(' · ')+' · Gill James'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
crumb.addEventListener('click',function(e){var b=e.target.closest('button[data-lv]');if(!b)return;e.preventDefault();jump(+b.dataset.lv)});
backB.addEventListener('click',function(e){e.preventDefault();out()});

/* ---------------------------------------------------------------- the about pages (bio, the poem): small cards that open out of their star */
var CARD=(function(){var el=$('.cd'),inner=$('.cd-in',el),on=false,anA=null;
  function fill(it){var src=document.getElementById('tpl-'+it.kind);inner.innerHTML=src?src.innerHTML:''}
  function open(it,o){fill(it);el.hidden=false;on=true;el.classList.toggle('poem',it.kind==='poem');iris(el,o,true);setTimeout(function(){try{inner.focus({preventScroll:true})}catch(e){}},60)}
  function close(o){if(!on)return;on=false;o=o||{};iris(el,o,false,function(){if(!on){el.hidden=true;inner.innerHTML=''}})}
  return{open:open,close:close,isOn:function(){return on}}})();
/* the iris: one shared clip-path animation for every layer */
function iris(el,o,opening,done){o=o||{};var r=el.getBoundingClientRect(),x=(o.x==null?W/2:o.x)-r.left,y=(o.y==null?H/2:o.y)-r.top,R=Math.hypot(Math.max(x,r.width-x),Math.max(y,r.height-y))+2,r0=Math.max(4,o.r||8);
  if(el._ir){try{el._ir.cancel()}catch(e){}el._ir=null}
  if(!anim()||o.instant||!el.animate){el.style.clipPath='';if(!opening)el.style.visibility='hidden';else el.style.visibility='';if(done)done();return}
  el.style.visibility='';var a=el.animate([{clipPath:'circle('+(opening?r0:R).toFixed(1)+'px at '+x.toFixed(1)+'px '+y.toFixed(1)+'px)',opacity:opening?.6:1},{clipPath:'circle('+(opening?R:r0).toFixed(1)+'px at '+x.toFixed(1)+'px '+y.toFixed(1)+'px)',opacity:opening?1:.25}],
    {duration:(opening?520:460)*SLOW(),easing:opening?'cubic-bezier(.3,.1,.2,1)':'cubic-bezier(.5,0,.6,1)',fill:'forwards'});el._ir=a;
  a.onfinish=function(){if(el._ir!==a)return;el._ir=null;if(opening){a.cancel();el.style.clipPath=''}else{el.style.visibility='hidden';a.cancel()}if(done)done()}}
window.__iris=iris;

/* ---------------------------------------------------------------- size, boot, landing */
function size(){W=innerWidth;H=innerHeight;DPR=Math.min(2,devicePixelRatio||1);TOPM=W<600?64:72;BOTM=74;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';layout()}
var rzT=0;addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(function(){var w0=W,h0=H;if(innerWidth===w0&&innerHeight===h0)return;size();if(MK)endMark();tw=null;cam=camFor(cur);B=cur.lv>=2?1:0;req()},120)});
function endMark(){if(!MK)return;MK.on=false;MK=null;D.classList.remove('mk-on');landed()}
function landed(){D.classList.add('w-in');ui();req()}
size();
var T0=parse(location.hash),q=location.search,mkQ=/[?&]mark=1/.test(q)?1:/[?&]mark=0/.test(q)?0:null,seenMk=false;try{seenMk=sessionStorage.getItem('gj-mark')==='1'}catch(e){}
/* history for a deep link: the sky first, then one entry per level down to where the link points (so Back walks out one level at a time) */
(function(){var base=location.pathname+location.search;try{if(!T0.lv){history.replaceState(mkState({lv:0},0),'',base)}else{
  var chain=[{lv:0}];if(T0.lv>=1)chain.push({lv:1,k:T0.k});if(T0.lv>=2)chain.push({lv:2,k:T0.k,w:T0.w||bestItem(T0.k)});if(T0.lv>=3)chain.push(T0);
  history.replaceState(mkState(chain[0],0),'',base);for(var i=1;i<chain.length;i++)history.pushState(mkState(chain[i],i),'',location.pathname+hashOf(chain[i]))}}catch(e){}})();
cur={lv:0,k:null,w:null};cam=camFar();
var doMark=!T0.lv&&anim()&&(mkQ===1||(mkQ!==0&&!seenMk));
function boot(){if(T0.lv){goTo(T0,{instant:true});landed()}else if(doMark){try{sessionStorage.setItem('gj-mark','1')}catch(e){}startMark();ui()}else{landed()}}
var fontsP=document.fonts&&document.fonts.load?Promise.all([document.fonts.load('700 40px Syl','ᑕᐣᓯ'),document.fonts.load('400 13px "Julius Sans One"'),document.fonts.load('300 12px Poppins')]):Promise.resolve();
var booted=false;function go0(){if(booted)return;booted=true;boot()}fontsP.then(go0,go0);setTimeout(go0,450);
if(document.fonts)document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',function(){req()});
document.addEventListener('visibilitychange',function(){if(!document.hidden)req()});
window.__world={state:function(){return{lv:cur.lv,k:cur.k,w:cur.w,sel:sel,layer:openL?openL.it.kind:null,cam:{x:cam.x,y:cam.y,s:cam.s},B:B,moving:!!tw,mark:!!MK,hash:location.hash,crumb:crumb.textContent,anc:(hs()||{}).anc}},
  pos:function(k,w){if(!w){var c=CH[k];return sp(c.x,c.y)}var it=itemOf(k,w);return it?sp(it.x,it.y):null},chapterLabel:function(k){var c=CH[k];return sp(c.x,c.y+c.ex.y1)},
  out:out,in:function(){inTo(deeperT())},jump:jump,press:press,goTo:goTo,inTo:inTo,parse:parse,hashOf:hashOf,neighbour:neighbour,lateralTo:function(k,w){return lateralTo(itemOf(k,w))},viewFilm:viewFilm,ui:ui,req:req,
  items:function(k){return CH[k].items.map(function(it){return{w:it.w,slug:it.slug,lab:it.lab,kind:it.kind,isNew:it.isNew}})},counts:function(){var r={};ORDER.forEach(function(k){r[k]=CH[k].items.length});return r},
  ft:function(){return FT.slice()},cur:function(){return cur},item:itemOf,closed:function(it){if(openL&&openL.it===it){}}};
})();
