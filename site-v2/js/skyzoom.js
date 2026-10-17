/* Sky camera: free pinch + drag flying, wheel, double-tap, tap-to-fly, semantic LOD, lazy star thumbs.
   Adapted from the Vancouver site's zoom.js (/workspace/site/zoom.js, read only): same translate+scale world,
   log-space fly tween, pinch about the midpoint, inertia, LOD thresholds, frame-time auto-off.
   One persistent sky behind every page (the shell keeps it alive across navigation). Modes: 'full' (/sky/: one finger
   drags), 'band' (section pages: the sky shows through the band window in the page; one finger scrolls the page, two
   fingers fly, ctrl/pinch-wheel zooms), 'off' (under the water surface). Every star and cluster is a real <a>. */
(function(){
'use strict';
var VP=document.querySelector('.vp'),W=VP&&VP.querySelector('.world');if(!VP||!W)return;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,D=document.documentElement,MODE='off',BAND=false;
var T1=0.5,T2=1.25,MAXS=4;
var s=1,tx=0,ty=0,minS=0.1,lod=-1,vw=0,vh=0,bw=0,bh=0;
VP.classList.add('zoom');
/* the whole sky fits between the header (top) and the controls (bottom), so no label sits under a button */
var PT=64,PB=72;function wv(){return{x:0,y:PT,w:vw,h:Math.max(100,vh-PT-PB)}}
function size(){var r=VP.getBoundingClientRect();vw=r.width;vh=r.height;var sh=vh<500;PT=sh?44:64;PB=sh?52:72;bw=W.offsetWidth;bh=W.offsetHeight;var v=wv();minS=Math.min(vw/bw,v.h/bh)*0.94}
function view(){if(MODE!=='band')return{x:0,y:0,w:vw,h:vh};var sp=document.querySelector('main .sp-band');if(!sp)return{x:0,y:0,w:vw,h:vh};
  var r=sp.getBoundingClientRect(),t=Math.max(PT-10,r.top),b=Math.min(vh,r.bottom-62); /* clear the header and the zoom buttons */if(b-t<140){t=Math.max(0,Math.min(r.top,vh-140));b=Math.min(vh,t+Math.max(140,r.height))}return{x:0,y:t,w:vw,h:b-t}}
function clampS(v){return Math.max(minS,Math.min(MAXS,v))}
function clampT(){var ww=bw*s,wh=bh*s,mx=vw*.45,my=vh*.45;
  if(ww<=vw)tx=Math.max(Math.min(tx,vw-ww+mx*.2),-mx*.2+(0));else tx=Math.min(mx,Math.max(vw-ww-mx,tx));
  if(wh<=vh)ty=Math.max(Math.min(ty,vh-wh+my*.2),-my*.2);else ty=Math.min(my,Math.max(vh-wh-my,ty));
  if(MODE==='band')return;if(ww<=vw&&!ptr.size&&!anim)tx=(vw-ww)/2;if(wh<=vh-PT-PB&&!ptr.size&&!anim)ty=PT+(vh-PT-PB-wh)/2}
var raf=0,mvT=0;function moving(){if(!VP.classList.contains('moving'))VP.classList.add('moving');clearTimeout(mvT);mvT=setTimeout(function(){VP.classList.remove('moving')},180)}
function apply(){clampT();moving();W.style.transform='translate('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px) scale('+s.toFixed(5)+')';
  W.style.setProperty('--inv',(1/s).toFixed(4));
  var L=s>=T2?2:s>=T1?1:0;if(L!==lod){lod=L;W.setAttribute('data-lod',L)}
  if(!raf)raf=requestAnimationFrame(function(){raf=0;lazy()});fx()}
function zoomAt(px,py,ns){ns=clampS(ns);tx=px-(px-tx)*(ns/s);ty=py-(py-ty)*(ns/s);s=ns}
/* world rect of an element, independent of the current transform */
function wrect(el){var b=el.getBoundingClientRect(),v=VP.getBoundingClientRect();return{x:(b.left-v.left-tx)/s,y:(b.top-v.top-ty)/s,w:b.width/s,h:b.height/s}}
function crect(cl){var r=+getComputedStyle(cl).getPropertyValue('--r')||150,b=wrect(cl);return{x:b.x-r,y:b.y-r,w:2*r,h:2*r+60}}
/* ---- fly (log-space tween, as zoom.js) */
var anim=null;
function fly(cx,cy,ns,dur,done,V){stopAnim();ns=clampS(ns);V=V||view();var ox=V.x+V.w/2,oy=V.y+V.h/2,cx0=(ox-tx)/s,cy0=(oy-ty)/s,s0=s,t0=performance.now();dur=RM?0:(dur==null?650:dur);
  function set(k){s=Math.exp(Math.log(s0)+(Math.log(ns)-Math.log(s0))*k);tx=ox-(cx0+(cx-cx0)*k)*s;ty=oy-(cy0+(cy-cy0)*k)*s;apply()}
  if(!dur){set(1);done&&done();return}
  anim=function(now){var k=Math.min(1,(now-t0)/dur);k=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;set(k);if(k<1)anim.id=requestAnimationFrame(anim);else{anim=null;done&&done()}};
  anim.id=requestAnimationFrame(anim)}
function stopAnim(){if(anim){cancelAnimationFrame(anim.id);anim=null}if(inert){cancelAnimationFrame(inert);inert=0}}
function fitRect(r,dur,done){var V=view(),ns=clampS(Math.min(V.w/r.w,V.h/r.h)*0.9);fly(r.x+r.w/2,r.y+r.h/2,ns,dur,done,V)}
function flyCluster(cl,dur,done){fitRect(crect(cl),dur,done)}
function whole(dur,done){fly(bw/2,bh/2,minS,dur,done,wv())}
/* ---- frame-time auto-off (zoom.js depth rule): if moving can't hold ~30 fps, drop the extra effects */
var fT=0,fE=16,fN=0;function fx(){var n=performance.now();if(fT&&n-fT<200){fE=fE*.9+(n-fT)*.1;if(++fN>24&&fE>34)document.documentElement.classList.add('lowfx')}fT=n}
/* ---- pointers */
var ptr=new Map(),g=null,moved=0,sup=false,vel={x:0,y:0,t:0},inert=0;
function pts(){return Array.from(ptr.values())}
function mid(){var a=pts();return{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1}}
function local(e){var v=VP.getBoundingClientRect();return{x:e.clientX-v.left,y:e.clientY-v.top,t:e.pointerType}}
function startG(){if(MODE==='off'){g=null;return}var a=pts();if(a.length>=2){g={k:2,m:mid(),s:s,tx:tx,ty:ty}}else if(a.length===1&&!(BAND&&a[0].t==='touch')){g={k:1,x:a[0].x,y:a[0].y,tx:tx,ty:ty}}else g=null}
VP.addEventListener('pointerdown',function(e){if(e.button>0||frozen()||MODE==='off')return;touched=true;hintOff();stopAnim();ptr.set(e.pointerId,local(e));if(ptr.size===1){moved=0;sup=false}startG();vel={x:0,y:0,t:performance.now()}});
VP.addEventListener('pointermove',function(e){if(!ptr.has(e.pointerId))return;var p=ptr.get(e.pointerId),o={x:p.x,y:p.y},q=local(e);p.x=q.x;p.y=q.y;
  if(!g)return;
  if(g.k===2&&ptr.size>=2){var m=mid(),ns=clampS(g.s*m.d/g.m.d),wx=(g.m.x-g.tx)/g.s,wy=(g.m.y-g.ty)/g.s;s=ns;tx=m.x-wx*ns;ty=m.y-wy*ns;moved=99}
  else if(g.k===1){var dx=p.x-g.x,dy=p.y-g.y;moved=Math.max(moved,Math.hypot(dx,dy));tx=g.tx+dx;ty=g.ty+dy;
    var now=performance.now(),dt=Math.max(1,now-vel.t);vel={x:.8*(p.x-o.x)/dt+.2*vel.x,y:.8*(p.y-o.y)/dt+.2*vel.y,t:now}}
  if(moved>6){sup=true;try{VP.setPointerCapture(e.pointerId)}catch(_){}VP.classList.add('drag');apply()}});
function up(e){if(!ptr.has(e.pointerId))return;var pan=g&&g.k===1;ptr.delete(e.pointerId);VP.classList.remove('drag');
  if(ptr.size){startG();return}g=null;
  if(pan&&sup&&performance.now()-vel.t<60&&!RM){var vx=vel.x*16,vy=vel.y*16;
    var step=function(){vx*=.92;vy*=.92;tx+=vx;ty+=vy;apply();if(Math.abs(vx)+Math.abs(vy)>.4)inert=requestAnimationFrame(step);else inert=0};inert=requestAnimationFrame(step)}
  else apply()}
VP.addEventListener('pointerup',up);VP.addEventListener('pointercancel',up);
/* touch-event pinch as a backstop: if the browser already claimed the first finger for a page pan (pointercancel), the
   pointer pinch never starts and the first pinch would be ignored; two touches always fly the sky */
var tp=null;function tmid(t){var v=VP.getBoundingClientRect();return{x:(t[0].clientX+t[1].clientX)/2-v.left,y:(t[0].clientY+t[1].clientY)/2-v.top,d:Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)||1}}
VP.addEventListener('touchstart',function(e){if(MODE==='off'||frozen())return;if(e.touches.length===2){var m=tmid(e.touches);tp={m:m,s:s,tx:tx,ty:ty};touched=true;stopAnim();hintOff()}},{passive:true});
VP.addEventListener('touchmove',function(e){if(MODE==='off'||frozen())return;if(MODE==='full'||e.touches.length>1)e.preventDefault();
  if(tp&&e.touches.length===2&&!(g&&g.k===2)){var m=tmid(e.touches),ns=clampS(tp.s*m.d/tp.m.d),wx=(tp.m.x-tp.tx)/tp.s,wy=(tp.m.y-tp.ty)/tp.s;s=ns;tx=m.x-wx*ns;ty=m.y-wy*ns;sup=true;apply()}},{passive:false});
VP.addEventListener('touchend',function(e){if(e.touches.length<2)tp=null},{passive:true});VP.addEventListener('touchcancel',function(){tp=null},{passive:true});
/* Safari's own pinch gesture events */
var gs0=1;['gesturestart','gesturechange'].forEach(function(n){VP.addEventListener(n,function(e){if(MODE==='off')return;e.preventDefault();if(ptr.size>=2||tp||frozen())return;var v=VP.getBoundingClientRect();
  if(n==='gesturestart'){gs0=s;stopAnim();touched=true}else{zoomAt((e.clientX||v.left+vw/2)-v.left,(e.clientY||v.top+vh/2)-v.top,gs0*e.scale);apply()}},{passive:false})});
/* wheel: full sky = zoom/pan as zoom.js; band = page scroll unless it's a pinch (ctrl) */
VP.addEventListener('wheel',function(e){if(frozen()||MODE==='off')return;var dy=e.deltaY*(e.deltaMode===1?33:e.deltaMode===2?vh:1),dx=e.deltaX*(e.deltaMode===1?33:1),v=VP.getBoundingClientRect(),x=e.clientX-v.left,y=e.clientY-v.top;
  if(BAND&&!e.ctrlKey)return;e.preventDefault();hintOff();stopAnim();touched=true;
  var mouse=e.deltaMode!==0||(dx===0&&Math.abs(dy)>=40&&Number.isInteger(dy));
  if(e.ctrlKey)zoomAt(x,y,s*Math.exp(-dy*0.012));else if(mouse)zoomAt(x,y,s*Math.exp(-Math.sign(dy)*Math.min(Math.abs(dy),240)*0.0022));else{tx-=dx;ty-=dy}
  apply()},{passive:false});
/* ---- taps */
var lastTap={t:0,x:0,y:0};
function current(cl){return cl&&cl.classList.contains('here')}
/* 'zoomed into this cluster' = thumbnails showing and the cluster fills a good part of the screen. At the overview
   (desktop /sky/ is already LOD 1) a tap on a star or thumbnail flies to its cluster first, same as on the phone. */
function near(cl){if(lod<1||!cl)return false;var r=crect(cl);return Math.max(r.w*s/vw,r.h*s/vh)>=0.45}
VP.addEventListener('click',function(e){
  if(sup){e.preventDefault();e.stopPropagation();sup=false;return}
  var q=local(e),now=performance.now();
  var st=e.target.closest('.st'),cn=e.target.closest('.cname'),cl=e.target.closest('.cl'),zb=e.target.closest('.zctl');
  if(zb)return;
  if(st){ /* a star: too small to aim at -> fly to its cluster first; close enough -> open the work */
    if(!near(cl)){e.preventDefault();flyCluster(cl);return}
    st.classList.add('lit');mark(cl);return}
  if(cn){ /* a cluster name: fly in, then go to the section page with the zoom-in transition */
    if(current(cl)){e.preventDefault();flyCluster(cl);return}
    e.preventDefault();var href=cn.href,b=cn.getBoundingClientRect();mark(cl);
    flyCluster(cl,RM?0:450,function(){window.GJ&&GJ.nav?GJ.nav(href):location.href=href});return}
  if(now-lastTap.t<320&&Math.hypot(q.x-lastTap.x,q.y-lastTap.y)<40){lastTap.t=0;var ns=clampS(s*2.6),cx=(q.x-tx)/s,cy=(q.y-ty)/s;fly(cx+(vw/2-q.x)/ns,cy+(vh/2-q.y)/ns,ns,420);return}
  lastTap={t:now,x:q.x,y:q.y};
  if(cl)setTimeout(function(){if(lastTap.t===now)flyCluster(cl)},300)},true);
function mark(cl){if(!cl)return;try{var v=JSON.parse(localStorage.getItem('gj-visited')||'[]');if(v.indexOf(cl.dataset.k)<0){v.push(cl.dataset.k);localStorage.setItem('gj-visited',JSON.stringify(v))}}catch(_){}}
/* keyboard (full sky only) + focus follows */
document.addEventListener('keydown',function(e){if(MODE!=='full'||frozen()||e.target.closest('input,textarea'))return;var k=e.key,c=[(vw/2-tx)/s,(vh/2-ty)/s];
  if(k==='+'||k==='=')fly(c[0],c[1],s*1.8,300);else if(k==='-'||k==='_')fly(c[0],c[1],s/1.8,300);else if(k==='0')whole();
  else if(k.indexOf('Arrow')===0&&!e.target.closest('a,button')){var d=120;tx+=k==='ArrowLeft'?d:k==='ArrowRight'?-d:0;ty+=k==='ArrowUp'?d:k==='ArrowDown'?-d:0;apply()}else return;e.preventDefault()});
W.addEventListener('focusin',function(e){var a=e.target,b=a.getBoundingClientRect(),v=VP.getBoundingClientRect();if(b.top>v.top&&b.bottom<v.bottom&&b.left>v.left&&b.right<v.right&&lod>=1)return;
  var cl=a.closest('.cl');if(a.classList.contains('st')){var r=wrect(a);fly(r.x+r.w/2,r.y+r.h/2,Math.max(s,T2*1.05),RM?0:400)}else if(cl)flyCluster(cl,RM?0:400)});
/* buttons */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.zctl [data-a]');if(!b||MODE==='off')return;var V=view(),c=[(V.x+V.w/2-tx)/s,(V.y+V.h/2-ty)/s],a=b.dataset.a;
  if(a==='in')fly(c[0],c[1],s*2,360);else if(a==='out')fly(c[0],c[1],s/2,360);else if(MODE==='full'){e.preventDefault();whole()}else return;hintOff()});
/* ---- lazy star thumbs: only at LOD>=1, only on or near the screen */
var IM=[];function cache(){IM=Array.from(W.querySelectorAll('img[data-src]')).map(function(im){return{el:im,r:wrect(im.parentNode)}})}
function lazy(){if(lod<1)return;var v={x:-tx/s,y:-ty/s,w:vw/s,h:vh/s},m=Math.max(v.w,v.h)*.3;
  IM=IM.filter(function(o){var r=o.r;if(r.x<v.x+v.w+m&&r.x+r.w>v.x-m&&r.y<v.y+v.h+m&&r.y+r.h>v.y-m){o.el.src=o.el.dataset.src;o.el.removeAttribute('data-src');return false}return true})}
/* ---- hint */
var hinted=false;function hintOff(){if(hinted)return;hinted=true;setTimeout(function(){document.querySelectorAll('.zhint').forEach(function(h){h.classList.add('off')})},1500)}
/* ---- one thing moves at a time */
function frozen(){return document.documentElement.classList.contains('frozen')}
/* ---- boot: each page knows its own camera spot (data-focus or #cluster), nothing depends on history */
function boot(){setMode(D.classList.contains('m-sky')?'full':D.classList.contains('m-section')?'band':'off',true);size();s=1;tx=0;ty=0;W.style.transform='none';cache();
  function find(keys){return(keys||'').split(' ').map(function(k){return k&&W.querySelector('.cl[data-k="'+k+'"]')}).filter(Boolean)}
  var cls=find((location.hash.match(/^#([a-z-]+)$/)||[])[1]);if(!cls.length)cls=find(VP.dataset.focus);
  s=minS;tx=(vw-bw*s)/2;ty=PT+(vh-PT-PB-bh*s)/2;apply();
  /* back/forward: land where you left the camera (bfcache usually keeps it anyway) */
  var nav=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0]||{}).type,cam=null;
  try{cam=JSON.parse(sessionStorage.getItem('gj-cam:'+location.pathname)||'null')}catch(_){}
  if(nav==='back_forward'&&cam&&!booted){booted=true;s=clampS(cam.s);tx=vw/2-cam.x*s;ty=vh/2-cam.y*s;apply();return}
  booted=true;want=function(){var r=keysRect(cls.map(function(c){return c.dataset.k}).join(' '));if(r)fitRect(r,0);else whole(0)};
  if(cls.length){var rs=cls.map(crect),x0=Math.min.apply(0,rs.map(function(r){return r.x})),y0=Math.min.apply(0,rs.map(function(r){return r.y})),
    x1=Math.max.apply(0,rs.map(function(r){return r.x+r.w})),y1=Math.max.apply(0,rs.map(function(r){return r.y+r.h}));
    var dived=document.documentElement.classList.contains('dived')&&!RM;fitRect({x:x0,y:y0,w:x1-x0,h:y1-y0},dived?900:0)}
  if(!RM)setTimeout(hintOff,7500)}
function setMode(m,quiet){MODE=m;BAND=m==='band';VP.classList.toggle('band',BAND);VP.classList.toggle('full',m==='full');VP.classList.toggle('off',m==='off');if(!quiet)hinted=false}
function keysRect(keys){var cls=(keys||'').split(' ').map(function(k){return k&&W.querySelector('.cl[data-k="'+k+'"]')}).filter(Boolean);if(!cls.length)return null;
  var rs=cls.map(crect),x0=Math.min.apply(0,rs.map(function(r){return r.x})),y0=Math.min.apply(0,rs.map(function(r){return r.y}));
  return{x:x0,y:y0,w:Math.max.apply(0,rs.map(function(r){return r.x+r.w}))-x0,h:Math.max.apply(0,rs.map(function(r){return r.y+r.h}))-y0}}
var booted=false,touched=false,want=null;
/* until the visitor touches the sky, keep re-fitting to the page's own spot (iPhone can measure before layout settles) */
function refit(){if(touched||anim||ptr.size||!want)return;size();cache();want()}
addEventListener('load',function(){refit();setTimeout(refit,300)});addEventListener('pagehide',function(){try{sessionStorage.setItem('gj-cam:'+location.pathname,JSON.stringify({s:s,x:(vw/2-tx)/s,y:(vh/2-ty)/s}))}catch(_){}});
function keep(){if(!touched&&want){refit();return}if(anim||ptr.size)return;var c={x:(vw/2-tx)/s,y:(vh/2-ty)/s};size();cache();s=clampS(s);tx=vw/2-c.x*s;ty=vh/2-c.y*s;apply()}
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(keep,150)});
boot();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(keep);
window.__sky={get:function(){return{s:s,tx:tx,ty:ty,lod:lod,minS:minS,mode:MODE}},fly:fly,whole:function(d,f){touched=false;want=function(){whole(0)};whole(d,f)},flyTo:function(k){var c=W.querySelector('.cl[data-k="'+k+'"]');c&&flyCluster(c)},
  /* used by js/shell.js */
  mode:function(m){setMode(m)},
  focus:function(keys,dur,done){touched=false;want=function(){var r=keysRect(keys);if(r)fitRect(r,0);else whole(0)};var r=keysRect(keys);if(r)fitRect(r,dur,done);else whole(dur,done)},
  preset:function(){touched=false;want=function(){whole(0)}},
  here:function(keys){var k=(keys||'').split(' ');W.querySelectorAll('.cl').forEach(function(c){c.classList.toggle('here',k.indexOf(c.dataset.k)>=0)})},
  fall:function(dur){touched=false;want=function(){whole(0)};if(RM){whole(0);return}s=minS*.45;tx=vw/2-bw/2*s;ty=PT+(vh-PT-PB)/2-bh/2*s;apply();W.classList.remove('falling');void W.offsetWidth;W.classList.add('falling');
    whole(dur||1000,function(){W.classList.remove('falling')})},
  stop:stopAnim};
})();
