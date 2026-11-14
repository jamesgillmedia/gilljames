/* constellation · blend — local prototype (not published).
   Flat at rest: the m4 flat hub (ᑕᐣᓯ mark constellation from u4-opus-m4/_sketch/opener STROKES + the v3.2/v3.3 chapter
   figures, SH in u4-opus-m4/js/sky.js). 3D only while you move: depth layers + drag/tilt parallax and a zoom that flies
   through near/far layers (feel of gilljames/sketch-3d), springing back to flat. Zoom is continuous (site-v3 / pro3-w5 /
   previews-board idea): every star is a work; it grows into its picture and more of its facts appear the closer you get.
   Motion never reads prefers-reduced-motion: it is the same with Reduce Motion on. Nothing auto-advances. */
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
  CH.forEach(function(c,ci){var cen=P[c.k];c.cx=cen[0];c.cy=cen[1];c.stars=[];c.edges=c.sh.e;c.z=DEP[c.k]||1;
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
var cam={x:0,y:0,s:1},S0=1,SMAX=60,T={x:0,y:0,vx:0,vy:0,tx:0,ty:0},glide=null,lastIn=0,motion=0;
function fitCam(){var bw=BOX[2]-BOX[0],bh=BOX[3]-BOX[1],top=56,bot=64;S0=Math.min(W/bw,(H-top-bot)/bh)*.96;
  var minCard=1e9;CH.forEach(function(c){minCard=Math.min(minCard,c.card)});SMAX=Math.min(W,H)*.86/minCard;
  return {x:(BOX[0]+BOX[2])/2,y:(BOX[1]+BOX[3])/2-(top-bot)/2/S0,s:S0}}
function zf(){return cam.s/S0}
/* depth projection: z=1 is the flat plane. Far layers scale less while zoomed (fly-through), and tilt offsets each layer by
   its depth. At rest (zoom 1, tilt 0) every layer lines up: flat. */
function zE(z){return 1+(z-1)*(1-sstep(1.6,5,zf()))}
function proj(x,y,z,o){var k=Math.pow(zf(),(z-1)*.38),s=cam.s*k;o=o||[0,0,0];
  o[0]=W/2+(x-cam.x)*s+T.x*(z-1)*2.2;o[1]=H/2+(y-cam.y)*s+T.y*(z-1)*2.2;o[2]=s;return o}
function toWorld(px,py){return [cam.x+(px-W/2)/cam.s,cam.y+(py-H/2)/cam.s]}
function zoomAt(px,py,ns){ns=clamp(ns,S0*.7,SMAX*1.15);var a=toWorld(px,py);cam.s=ns;var b=toWorld(px,py);cam.x+=a[0]-b[0];cam.y+=a[1]-b[1];clampPan()}
function clampPan(){var m=60/cam.s+40;cam.x=clamp(cam.x,BOX[0]-m,BOX[2]+m);cam.y=clamp(cam.y,BOX[1]-m,BOX[3]+m)}
function glideTo(tx,ty,ts,ms){firstTouch();ts=clamp(ts,S0,SMAX);glide={x0:cam.x,y0:cam.y,s0:cam.s,x1:tx,y1:ty,s1:ts,t0:now(),ms:ms||950}}
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
  if(PT.size===1&&!gLock&&!pinch){drag={id:e.pointerId,moved:0,vx:0,vy:0,lt:now()};}
  else if(!pinch&&PT.size>=2){drag=null;gLock=true;if(!tiltOn){T.tx=0;T.ty=0}var ids=[...PT.keys()].slice(0,2),a=ids.map(function(i){return PT.get(i)});
    pinch={ids:ids,d0:Math.max(10,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),s0:cam.s,m:[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2]}}});
cv.addEventListener('pointermove',function(e){var p=PT.get(e.pointerId);
  if(!p){if(e.pointerType==='mouse'&&HOVER&&!tiltOn){T.tx=(e.clientX-W/2)*.035;T.ty=(e.clientY-H/2)*.035}return}
  var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;lastIn=now();
  if(pinch){if(pinch.ids.indexOf(e.pointerId)<0)return;var a=pinch.ids.map(function(i){return PT.get(i)}),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m=[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2];
    zoomAt(m[0],m[1],pinch.s0*d/pinch.d0);cam.x-=(m[0]-pinch.m[0])/cam.s;cam.y-=(m[1]-pinch.m[1])/cam.s;pinch.m=m;clampPan();motion=1;return}
  if(gLock)return;
  if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<6)return;
    var t=now(),dt=Math.max(8,t-drag.lt);drag.lt=t;drag.vx=lerp(drag.vx,dx/dt,.4);drag.vy=lerp(drag.vy,dy/dt,.4);
    var pan=sstep(1.12,1.8,zf());cam.x-=dx*pan/cam.s;cam.y-=dy*pan/cam.s;clampPan();
    /* the look-around (sketch-3d's one-finger drag): layers slide apart by depth while you drag, then settle flat */
    if(depthMode()!=='flat'){T.tx=clamp(T.tx+dx*.5,-70,70);T.ty=clamp(T.ty+dy*.5,-70,70);motion=1}}});
function up(e){var p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
  if(!PT.size)gLock=false;
  if(pinch){if(pinch.ids.indexOf(e.pointerId)>=0){pinch=null;settleZoom()}drag=null;return}
  if(gLock){drag=null;return}
  if(drag&&drag.id===e.pointerId){var dur=now()-p.t0;
    if(drag.moved<10&&dur<350)tap(e.clientX,e.clientY);
    else if(zf()>1.12){fling(drag.vx*sstep(1.12,1.8,zf()),drag.vy*sstep(1.12,1.8,zf()))}
    drag=null;if(!tiltOn&&depthMode()!=='hold'){T.tx=0;T.ty=0}}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!tiltOn&&!PT.size){T.tx=0;T.ty=0}});
var FL=null;function fling(vx,vy){if(Math.hypot(vx,vy)<.15)return;FL={vx:vx,vy:vy,t:now()}}
function settleZoom(){if(cam.s<S0){var c=fitCam();glideTo(c.x,c.y,S0,500)}}
cv.addEventListener('wheel',function(e){e.preventDefault();lastIn=now();firstTouch();glide=null;var k=Math.exp(-e.deltaY*(e.ctrlKey?.012:.0016));zoomAt(e.clientX,e.clientY,cam.s*k);motion=1;
  clearTimeout(cv._wt);cv._wt=setTimeout(settleZoom,260)},{passive:false});
['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
addEventListener('keydown',function(e){var k=e.key;lastIn=now();firstTouch();if(BOARD&&k!=='Escape')return;
  if(k==='+'||k==='='){glideTo(cam.x,cam.y,cam.s*2.2,500)}else if(k==='-'||k==='_'){stepOut()}else if(k==='Escape'){if(BOARD)closeBoard();else home()}
  else if(k.indexOf('Arrow')===0){var d=80/cam.s;glideTo(cam.x+(k==='ArrowRight'?d:k==='ArrowLeft'?-d:0),cam.y+(k==='ArrowDown'?d:k==='ArrowUp'?-d:0),cam.s,300)}});
function gjGet(k,d){try{var v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}}
function depthMode(){return gjGet('gj-tog-depth','rest')}
function markPhotos(){return gjGet('gj-tog-markphotos','mark')==='photos'}
function namesOn(){return gjGet('gj-tog-name','0')==='1'}
var RMQ=matchMedia('(prefers-reduced-motion: reduce)');
function reduced(){return RMQ.matches}
var ENTER={
  film:'src/site3d-8d21/site-3d/index.html',
  photo:'src/sky/p1/photo-lab/index.html',
  objects:'src/sky/objects-3d/index.html',
  sound:'src/dbae/sound-sketch/index.html',
  about:'src/v33d/site-v3-3d-bio/index.html#about',
  spaces:'src/sky/tonight/spaces/forest-garden/index.html'
};
function enterChapter(k){
  var href=ENTER[k];
  if(k==='film'&&(gjGet('gj-tog-flatdeep','flat')==='deep'||namesOn()))href='src/sky/r/r10/index.html';
  if(href)location.href=href}
/* tap: a work glides in until it resolves (and again for more), a chapter fits its figure, the mark goes home */
function cardPx(w){return Math.max(w.cw,w.chh)*cam.s}
function tap(x,y){var t=now(),dbl=t-lastTap.t<320&&Math.hypot(x-lastTap.x,y-lastTap.y)<30;lastTap={t:t,x:x,y:y};
  if(dbl){stepOut();lastTap.t=0;return}
  var o=[0,0,0],best=null,bd=1e9;
  WORKS.forEach(function(w){proj(w.x,w.y,zE(w.z),o);var px=cardPx(w),hw=Math.max(22,w.cw*cam.s/2+6),hh=Math.max(22,w.chh*cam.s/2+6);
    if(Math.abs(o[0]-x)<=hw&&Math.abs(o[1]-y)<=hh){var d=Math.hypot(o[0]-x,o[1]-y);if(d<bd){bd=d;best=w}}});
  var z=zf();
  if(best&&(z>1.8||bd<14)&&best.c.k==='film'&&cardPx(best)<110){openBoard(best,true);return}   /* film: dot -> its board first */
  if(best&&(z>1.8||bd<14)){var px=cardPx(best),steps=[deepS(best,.22),deepS(best,.5),deepS(best,.82)];steps[1]=Math.max(steps[1],steps[0]);steps[2]=Math.max(steps[2],steps[1]);var ts=steps[2];
    for(var i=0;i<steps.length;i++)if(cam.s<steps[i]*.92){ts=steps[i];break}
    var off=deepOff(best,ts);glideTo(best.x+off[0],best.y+off[1],ts,1000);return}
  var wp=toWorld(x,y);
  for(var c=0;c<CH.length;c++){var C=CH[c];if(Math.abs(wp[0]-C.cx)<FIG_W*.62&&Math.abs(wp[1]-C.cy)<FIG_H*.75){
      var fs=Math.min(W*.92/FIG_W,(H-120)*.9/FIG_H);
      if(cam.s<fs*.9){glideTo(C.cx,C.cy,fs,1000);return}
      enterChapter(C.k);return}}
  if(Math.abs(wp[0]-MARK.cx)<130&&Math.abs(wp[1]-MARK.cy)<70)home()}
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
  if(push&&location.hash!=='#film/'+w.slug){history.pushState({b:w.slug},'','#film/'+w.slug);pushed=true}
  WHERE.textContent='film · '+ttl;lastWhere=WHERE.textContent;BD.focus({preventScroll:true})}
function hideBoard(){if(!BOARD)return;var w=BOARD;BOARD=null;BD.classList.remove('on');setTimeout(function(){if(!BOARD)BD.hidden=true},230);lastWhere='';return w}
function closeBoard(){if(!BOARD)return null;var w=BOARD;
  if(pushed&&history.state&&history.state.b){pushed=false;history.back()}else{history.replaceState(null,'',location.pathname+location.search)}
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
  /* direct link: put the field under it so Back lands on the dot */
  var h=location.hash;history.replaceState(null,'',location.pathname+location.search);history.pushState({b:w.slug},'',h);pushed=true;firstTouch();openBoard(w,false,true)}
document.getElementById('home').addEventListener('click',home);
document.getElementById('out').addEventListener('click',function(){if(BOARD)closeBoard();else stepOut()});
/* optional device tilt (asks the phone first; off until pressed) */
var TB=document.getElementById('tilt');
if(window.DeviceOrientationEvent){TB.hidden=false;TB.addEventListener('click',function(){
  function on(){tiltOn=!tiltOn;TB.setAttribute('aria-pressed',String(tiltOn));orient.b0=orient.g0=null;if(!tiltOn){T.tx=T.ty=0}}
  if(!tiltOn&&typeof DeviceOrientationEvent.requestPermission==='function'){DeviceOrientationEvent.requestPermission().then(function(r){if(r==='granted')on()}).catch(function(){})}else on()});
  addEventListener('deviceorientation',function(e){if(!tiltOn||e.beta==null)return;if(orient.b0==null){orient.b0=e.beta;orient.g0=e.gamma}
    T.tx=clamp((e.gamma-orient.g0)*2,-70,70);T.ty=clamp((e.beta-orient.b0)*2,-70,70)})}
/* ---------- media ---------- */
var IMG={};function img(src){var m=IMG[src];if(!m){m=IMG[src]=new Image();m.decoding='async';m.src=src}return m.complete&&m.naturalWidth?m:null}
var WAVE={};function wave(w){var c=WAVE[w.t];if(c)return c;c=document.createElement('canvas');c.width=480;c.height=200;var q=c.getContext('2d'),pk=w.peaks,n=pk.length,bw=480/n;
  q.fillStyle='rgba(8,12,20,1)';q.fillRect(0,0,480,200);q.fillStyle='rgba('+w.c.tint+',.9)';
  for(var i=0;i<n;i++){var h=pk[i]*150+4;q.fillRect(i*bw+bw*.2,100-h/2,bw*.6,h)}return WAVE[w.t]=c}
/* ---------- draw ---------- */
var o=[0,0,0],o2=[0,0,0],labRects=[];
function free(r){for(var i=0;i<labRects.length;i++){var t=labRects[i];if(r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}labRects.push(r);return true}
function dot(x,y,rad,a,glow,gs){if(a<.01)return;g.globalAlpha=a*.85;g.drawImage(glow||GW,x-gs/2,y-gs/2,gs,gs);g.globalAlpha=a;g.fillStyle='#f4f8ff';g.beginPath();g.arc(x,y,rad,0,6.283);g.fill()}
function wrapLines(text,maxW,maxLines){var words=String(text).split(' '),lines=[],cur='';words.forEach(function(wd){var t=cur?cur+' '+wd:wd;if(g.measureText(t).width>maxW&&cur){lines.push(cur);cur=wd}else cur=t});if(cur)lines.push(cur);
  if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/.?$/,'…')}return lines}
function draw(t){
  var z=zf(),tw=t/1000,twsBase=reduced()?1:null;
  var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#03050b');bg.addColorStop(1,'#061018');g.fillStyle=bg;g.fillRect(0,0,W,H);
  /* far field */
  for(var i=0;i<FIELD.length;i++){var f=FIELD[i];proj(f.x,f.y,f.z,o);if(o[0]<-4||o[0]>W+4||o[1]<-4||o[1]>H+4)continue;
    var tws=twsBase!=null?twsBase:(f.tw?.75+.25*Math.sin(tw*(1.2+f.ph)+f.ph*9):1),rad=Math.max(.45,f.b*f.z*1.25*Math.min(2.2,Math.pow(z,.18)));
    g.globalAlpha=clamp(f.b*f.z*1.1*tws,0,1);g.fillStyle='#dfe8ff';g.fillRect(o[0]-rad/2,o[1]-rad/2,rad,rad)}
  g.globalAlpha=1;
  /* the mark (z 1.12) */
  var markA=1-sstep(4,10,z);if(markA>.01){g.strokeStyle='rgba(205,225,255,'+(.16*markA)+')';g.lineWidth=1;
    D.strokes.forEach(function(s){g.beginPath();s.forEach(function(q,j){proj(MARK.cx+q[0]*MARK.sc,MARK.cy+q[1]*MARK.sc,1.12,o);if(j)g.lineTo(o[0],o[1]);else g.moveTo(o[0],o[1])});g.stroke()});
    MARK.forEach(function(m){proj(m.x,m.y,m.z,o);var tws=twsBase!=null?1:.8+.2*Math.sin(tw*1.4+m.ph);dot(o[0],o[1],(.7+m.b*1.1)*Math.min(2,Math.pow(z,.3)),markA*m.b*tws,GW,10+m.b*14)});
    if(markPhotos()&&markA>.2){var shown=0;WORKS.forEach(function(w){if(w.c.k!=='objects'||!w.img||shown>5)return;shown++;
      proj(w.x*.35+MARK.cx*.65,w.y*.35+MARK.cy*.65,1.4,o);var im=img(w.img);if(!im)return;g.globalAlpha=.9*markA;g.drawImage(im,o[0]-28,o[1]-36,56,72)});g.globalAlpha=1}
    proj(MARK.cx,MARK.cy+78,1.12,o);var fs=clamp(13*Math.pow(z,.5),11,22);g.font='300 '+fs.toFixed(1)+'px Poppins, sans-serif';g.textAlign='center';g.textBaseline='middle';
    g.globalAlpha=markA*.7*(1-sstep(1.6,3,z));g.fillStyle='#c9d3d6';g.fillText(D.poemLine,o[0],o[1]);g.globalAlpha=1}
  labRects=[];
  /* chapters: hairline figure + its stars */
  CH.forEach(function(c){
    var figA=1-.65*sstep(5,16,z);g.lineWidth=1;g.strokeStyle='rgba('+c.tint+','+(.30*figA)+')';
    c.edges.forEach(function(e){var a=c.stars[e[0]],b=c.stars[e[1]];proj(a.x,a.y,zE(a.z),o);proj(b.x,b.y,zE(b.z),o2);g.beginPath();g.moveTo(o[0],o[1]);g.lineTo(o2[0],o2[1]);g.stroke()});
    c.stars.forEach(function(s){if(s.work!=null)return;proj(s.x,s.y,zE(s.z),o);var tws=.8+.2*Math.sin(tw*1.3+s.ph);dot(o[0],o[1],(.6+s.b*1.3)*Math.min(1.8,Math.pow(z,.25)),(s.stray?.5:.85)*s.b*tws*figA,GLOW[c.k],8+s.b*18)});
  });
  /* works: star → picture → facts (drawn small to large) */
  var vis=[];WORKS.forEach(function(w){proj(w.x,w.y,zE(w.z),o);var px=cardPx(w),hx=w.cw*cam.s/2+260,hy=w.chh*cam.s/2+260;
    if(o[0]<-hx||o[0]>W+hx||o[1]<-hy||o[1]>H+hy)return;vis.push([w,o[0],o[1],px])});
  vis.sort(function(a,b){return a[3]-b[3]});
  var sp=Math.min.apply(null,CH.map(function(c){return c.dmin}))*cam.s;
  vis.forEach(function(v){var w=v[0],x=v[1],y=v[2],px=v[3],c=w.c,sw=w.cw*cam.s,sh=w.chh*cam.s;
    var imA=sstep(8,30,px),dotA=1-sstep(14,34,px),tws=.82+.18*Math.sin(tw*1.25+w.ph);
    if(dotA>0){var more=w.anchor?1:.22+.78*sstep(1.15,2.6,z),b=w.anchor?.95:.7*(.6+.4*more),gs=(10+b*20)*(1+imA*1.5);dot(x,y,(.9+b*1.2)*(w.anchor?1:.55+.45*more)*Math.min(2.2,Math.pow(z,.28)),dotA*b*tws*more,GLOW[c.k],gs)}
    if(imA>0){var im=w.img?img(w.img):null;g.globalAlpha=imA;
      var bx=x-sw/2,by=y-sh/2;
      if(w.kind==='track'){g.drawImage(wave(w),bx,by,sw,sh)}
      else if(im){g.drawImage(im,bx,by,sw,sh)}
      else{g.fillStyle='rgba(14,20,32,.92)';g.fillRect(bx,by,sw,sh);
        if(px>30){var tf=clamp(sw*.09,9,26);g.font='400 '+tf.toFixed(1)+'px "Julius Sans One", sans-serif';g.fillStyle='rgba('+c.tint+',.95)';g.textAlign='center';g.textBaseline='middle';
          var lines=wrapLines(w.t||c.nm,sw*.84,3);lines.forEach(function(l,j){g.fillText(l,x,y+(j-(lines.length-1)/2)*tf*1.25)})}}
      g.strokeStyle='rgba('+c.tint+','+(.35*imA)+')';g.lineWidth=1;g.strokeRect(bx+.5,by+.5,sw-1,sh-1);g.globalAlpha=1;
      /* the poem appears inside its card once there is room (verbatim lines) */
      if(w.lines&&px>170){var pa=sstep(170,260,px),lf=clamp(sw*.045,8,17);g.globalAlpha=pa;g.font='300 '+lf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#e6edf0';g.textAlign='center';g.textBaseline='top';
        var y0=by+sh*.2;w.lines.forEach(function(l,j){g.fillText(l,x,y0+j*lf*1.32)});g.globalAlpha=1}
      labRects.push({x:bx,y:by,w:sw,h:sh})}
    /* facts below the picture, more the closer you are */
    /* landscape: facts sit beside the picture (so nothing falls under the hint or off the bottom); portrait: under it */
    var side=sideMode()&&px>140,tx=side?x+sw/2+16:x,colW=side?Math.max(120,Math.min(340,W-tx-16)):Math.max(sw,200),al=side?'left':'center';
    var fy=side?y-sh/2:y+sh/2+8,tA=sstep(60,110,px),title=w.t;
    if(tA>0&&title&&!(w.masked||(!w.img&&w.kind!=='track'))){var tf2=clamp(px*.075,11,24);g.font='400 '+tf2.toFixed(1)+'px "Julius Sans One", sans-serif';g.textAlign=al;g.textBaseline='top';g.globalAlpha=tA;g.fillStyle='#e6edf0';
      wrapLines(title,side?colW:Math.max(sw,160),side?3:2).forEach(function(l){g.fillText(l,tx,fy);fy+=tf2*1.25});g.globalAlpha=1}
    var mA=sstep(140,200,px);if(mA>0){var parts=[];if(w.role)parts.push(w.role);if(w.sub)parts.push(w.sub);if(w.meta)parts.push(w.meta);if(w.year&&String(w.meta||'').indexOf(String(w.year))<0)parts.push(w.year);
      if(parts.length){var mf=clamp(px*.04,10,15);g.font='300 '+mf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#55DAA1';g.textAlign=al;g.textBaseline='top';g.globalAlpha=mA;
        wrapLines(parts.join(' · '),colW,side?3:2).forEach(function(l){g.fillText(l,tx,fy);fy+=mf*1.35});g.globalAlpha=1}}
    var cA=sstep(230,300,px);if(cA>0&&w.credits&&w.credits.length){var cf=clamp(px*.032,10,13);g.font='300 '+cf.toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#c9d3d6';g.globalAlpha=cA;g.textAlign=al;g.textBaseline='top';
      w.credits.slice(0,3).forEach(function(l){wrapLines(l,side?colW:Math.max(sw,220),2).forEach(function(q){g.fillText(q,tx,fy);fy+=cf*1.35})});g.globalAlpha=1}
    if(side)fy=y+sh/2+2;
    /* strip EXPANDS as you zoom closer: its frames reveal one after another with the zoom (no timers, no auto-advance) */
    /* reveal band runs from just past the middle tap-stop to the deepest tap-stop, so every screen size gets all frames */
    var pxMax=Math.max(w.cw,w.chh)*Math.min(SMAX,deepS(w,.82)),lo=Math.max(240,pxMax*.7),st=Math.max(12,(pxMax*.99-lo)/Math.max(1,(w.strip||[]).length));
    var sA=sstep(lo,lo+st,px);if(sA>0&&w.strip){var n=Math.max(4,w.strip.length),gap=6,fw=(sw-gap*(n-1))/n,fh=fw/(w.ar||1.78);fy+=6;
      w.strip.forEach(function(s,j){var a=sstep(lo+j*st,lo+(j+1)*st,px);if(a<=0)return;var k=.72+.28*a,ww=fw*k,hh=fh*k,fx=x-sw/2+j*(fw+gap)+(fw-ww)/2,fyy=fy+(fh-hh)/2;g.globalAlpha=a;
        var im=img(s);if(im)g.drawImage(im,fx,fyy,ww,hh);else{g.fillStyle='rgba(14,20,32,.9)';g.fillRect(fx,fyy,ww,hh)}g.strokeStyle='rgba('+c.tint+',.3)';g.strokeRect(fx+.5,fyy+.5,ww-1,hh-1)});g.globalAlpha=1}
    w._scr=[x,y,px]});
  /* work names at mid zoom (before the pictures take over), decluttered: only the chapter in view */
  var lk=nearestChapter();
  if(z>1.8||namesOn()){vis.forEach(function(v){var w=v[0],px=v[3];if(w.c!==lk||!w.t)return;var na=(namesOn()?Math.max(sstep(1.8,3,z),.85):sstep(1.8,3,z))*(1-sstep(40,75,px));if(na<.02)return;
    g.font='300 12px Poppins, sans-serif';var lab=w.t.length>26?w.t.slice(0,25)+'…':w.t,tw2=g.measureText(lab).width,sh=w.chh*cam.s,r={x:v[1]+8+Math.max(0,w.cw*cam.s/2),y:v[2]-9,w:tw2+6,h:18};
    if(r.x+r.w>W-4)r.x=v[1]-8-r.w-Math.max(0,w.cw*cam.s/2);if(r.y<60||r.y>H-30)return;if(!free(r))return;
    g.globalAlpha=na;g.fillStyle='rgba(3,5,10,.6)';g.fillRect(r.x-2,r.y,r.w+2,r.h);g.fillStyle='#e6edf0';g.textAlign='left';g.textBaseline='middle';g.fillText(lab,r.x+2,v[2]);g.globalAlpha=1})}
  /* chapter names + counts (the flat hub's labels), fading as their works take over */
  var cnA=1-sstep(2.2,3.6,z);if(cnA>.01)CH.forEach(function(c){proj(c.cx,c.cy+FIG_H*.5+14,zE(c.z),o);var fs=clamp(12*Math.pow(z,.35),11,18);
    g.font='400 '+fs.toFixed(1)+'px "Julius Sans One", sans-serif';g.textAlign='center';g.textBaseline='top';g.globalAlpha=cnA;g.fillStyle='rgba('+c.tint+',1)';g.fillText(c.nm.toUpperCase(),o[0],o[1]);
    g.font='300 '+(fs*.82).toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#c9d3d6';g.fillText(c.count,o[0],o[1]+fs*1.35);g.globalAlpha=1});
  /* near dust: soft out-of-focus motes, only visible when you move or zoom (depth cue) */
  var ma=motion;if(ma>.01)DUST.forEach(function(d){proj(d.x,d.y,d.z,o);var rad=d.rad*Math.pow(z,.5);if(o[0]<-rad||o[0]>W+rad||o[1]<-rad||o[1]>H+rad)return;g.globalAlpha=d.a*ma;g.drawImage(GW,o[0]-rad,o[1]-rad,rad*2,rad*2)});
  g.globalAlpha=1;
  updateWhere(lk,z);
}
function nearestChapter(){var w=[cam.x,cam.y],best=CH[0],bd=1e18;CH.forEach(function(c){var d=Math.hypot(c.cx-w[0],c.cy-w[1]);if(d<bd){bd=d;best=c}});return best}
var lastWhere='';function updateWhere(c,z){if(BOARD)return;var s='field';
  if(z>1.5){s=c.nm;var bw=null,bd=1e9;WORKS.forEach(function(w){if(w.c!==c||!w._scr)return;var d=Math.hypot(w._scr[0]-W/2,w._scr[1]-H/2);if(w._scr[2]>60&&d<bd){bd=d;bw=w}});
    if(bw&&bw.t)s=c.nm+' · '+bw.t}
  if(s!==lastWhere){WHERE.textContent=s;lastWhere=s}}
/* ---------- loop ---------- */
var last=now();
function frame(t){requestAnimationFrame(frame);var dt=Math.min(.05,(t-last)/1000);last=t;
  if(glide)stepGlide(t);
  if(FL){var k=Math.exp(-dt*4.5);cam.x-=FL.vx*1000*dt/cam.s;cam.y-=FL.vy*1000*dt/cam.s;FL.vx*=k;FL.vy*=k;clampPan();if(Math.hypot(FL.vx,FL.vy)<.02)FL=null;motion=Math.max(motion,.6)}
  /* tilt spring: critically damped, settles flat in ~0.6 s after you let go */
  var wv=reduced()?40:9;['x','y'].forEach(function(a){var tg=a==='x'?T.tx:T.ty,v=a==='x'?'vx':'vy',e=T[a]-tg,kk=Math.exp(-wv*dt),c=T[v]+wv*e;T[a]=tg+(e+c*dt)*kk;T[v]=(T[v]-wv*c*dt)*kk});
  if(!drag&&!pinch&&!glide&&!FL)motion*=Math.exp(-dt*2.2);
  draw(t)}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;var p=W<H*1.05;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);g.setTransform(DPR,0,0,DPR,0,0);
  var rebuild=p!==PORT||!WORKS.length;PORT=p;if(rebuild)build();var c=fitCam();cam.x=c.x;cam.y=c.y;cam.s=c.s}
addEventListener('resize',function(){resize();if(BOARD){BD.classList.toggle('side',sideMode());var d=dotView(BOARD);cam.x=d[0];cam.y=d[1];cam.s=d[2]}});resize();bootHash();requestAnimationFrame(frame);
/* QA hooks */
window.__cb={st:function(){return{z:+zf().toFixed(3),cam:{x:+cam.x.toFixed(1),y:+cam.y.toFixed(1),s:+cam.s.toFixed(3)},where:lastWhere,glide:!!glide,tilt:[+T.x.toFixed(1),+T.y.toFixed(1)],gest:{pinch:!!pinch,drag:!!drag,lock:gLock,pts:PT.size},works:WORKS.length,S0:S0,SMAX:SMAX}},
  work:function(ch,i){var c=CH.find(function(q){return q.k===ch});var w=c.works[i];return{x:w.x,y:w.y,scr:proj(w.x,w.y,1,[0,0,0]).slice(0,2),t:w.t}},
  board:function(){return BOARD?{slug:BOARD.slug,t:BOARD.t,hash:location.hash,strip:(BOARD.strip||[]).length}:null},open:function(sl){var w=filmBySlug(sl);openBoard(w,true);return w.t},close:closeBoard,closer:closer,
  film:function(sl){var w=filmBySlug(sl);return{i:w.i,x:w.x,y:w.y,scr:proj(w.x,w.y,zE(w.z),[0,0,0]).slice(0,2),px:cardPx(w)}},
  glideTo:glideTo,home:home,focus:function(ch,i,f){var c=CH.find(function(q){return q.k===ch}),w=c.works[i],ts=deepS(w,f),off=deepOff(w,ts);glideTo(w.x+off[0],w.y+off[1],ts,900);return w.t},chapter:function(ch){var C=CH.find(function(q){return q.k===ch});glideTo(C.cx,C.cy,Math.min(W*.92/FIG_W,(H-120)*.9/FIG_H),900)},proj:function(x,y){return proj(x,y,1,[0,0,0]).slice(0,2)}};
})();
