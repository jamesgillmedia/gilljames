/* proto-shell · camera rig. Lifted from /workspace/constellation-blend/blend.js (the 4:45 piece-1 final):
   zoomAt (zoom grows from the point you touch), glideTo/stepGlide (log-scale glide, cubic in-out), the gesture lock
   (Gill 4:29: one finger looks/pans, a second finger always starts a pinch and the pinch wins), the continuous wheel,
   and the double tap. Changes from blend.js, both from FIX-PLAN R2/R4: a tap never glides in (the shell decides what a tap
   means; it is held for the double-tap window (m4: 360 ms / 40 px) so a double tap never also fires the single tap, and onTouch fires at once for the ripple) and the soft settle hands off to the ladder instead of only re-fitting below FAR.
   Snap lock (film-snap, preview-film-snap 91e0583): a settle glide that the ladder marks `lock` is not cancelled by a touch that only lands or taps,
   and that tap is swallowed (a ripple, nothing opens); a touch that turns into a drag or a pinch takes over and the ladder re-settles when it ends;
   the tail of a wheel flick that just snapped is ignored for 600 ms (FLOCK). The board therefore ends exactly on its stop, never part-way.
   Same output with Reduce Motion: nothing here reads prefers-reduced-motion. Nothing moves on its own. */
(function(w){
'use strict';
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function now(){return performance.now()}
/* the shared critically damped integrator (STANDARDS §3 Springs): k=exp(-w*dt); c=v+w*e; x=t+(e+c*dt)*k; v=(v-w*c*dt)*k */
var TK=function(){return window.TK||{}};
function spr(T,a,dt){var w=((TK().motion||{}).springs||{}).tiltBlend?TK().motion.springs.tiltBlend.w:9,vk='v'+a,e=T[a]-T['t'+a],k=Math.exp(-w*dt),c=T[vk]+w*e;T[a]=T['t'+a]+(e+c*dt)*k;T[vk]=(T[vk]-w*c*dt)*k}
function Camera(el,o){
  var C={x:0,y:0,s:1,S0:1,SMIN:.5,SMAX:40,W:1,H:1,glide:null,moving:0,tilt:{x:0,y:0,tx:0,ty:0,vx:0,vy:0},
    onTap:o.onTap||function(){},onTouch:o.onTouch||function(){},onDouble:o.onDouble||function(){},onSettle:o.onSettle||function(){},onKey:o.onKey||function(){},
    clampBox:null,busy:false,wheelLock:0,onGrab:o.onGrab||null,grab:null};
  C.release=function(){if(C.grab){var gh=C.grab.h;C.grab=null;gh.up(0,0,true)}};
  C.toWorld=function(px,py){return [C.x+(px-C.W/2)/C.s,C.y+(py-C.H/2)/C.s]};
  C.toScreen=function(x,y){return [(x-C.x)*C.s+C.W/2,(y-C.y)*C.s+C.H/2]};
  C.zf=function(){return C.s/C.S0};
  C.zoomAt=function(px,py,ns){ns=clamp(ns,C.SMIN,C.SMAX);var a=C.toWorld(px,py);C.s=ns;var b=C.toWorld(px,py);C.x+=a[0]-b[0];C.y+=a[1]-b[1];C.clampPan()};
  C.clampPan=function(){var B=C.clampBox;if(!B)return;var m=60/C.s+40;C.x=clamp(C.x,B[0]-m,B[2]+m);C.y=clamp(C.y,B[1]-m,B[3]+m)};
  C.glideTo=function(tx,ty,ts,ms){ts=clamp(ts,C.SMIN,C.SMAX);C.glide={x0:C.x,y0:C.y,s0:C.s,x1:tx,y1:ty,s1:ts,t0:now(),ms:ms||950}};
  C.step=function(t,dt){
    var G=C.glide;
    if(G){var p=clamp((t-G.t0)/G.ms,0,1),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
      var s=G.s0*Math.pow(G.s1/G.s0,e),k=Math.abs(G.s1-G.s0)<1e-9?e:(s-G.s0)/(G.s1-G.s0);C.s=s;C.x=lerp(G.x0,G.x1,k);C.y=lerp(G.y0,G.y1,k);
      C.moving=Math.max(C.moving,.8);if(p>=1)C.glide=null}
    if(FL){var a=Math.exp(-dt*4.5);C.x-=FL.vx*dt*1000/C.s;C.y-=FL.vy*dt*1000/C.s;FL.vx*=a;FL.vy*=a;C.clampPan();if(Math.hypot(FL.vx,FL.vy)<.02)FL=null}
    /* tilt: the 4:45 critically damped spring, wv = TK.springs.tiltBlend.w (9): settles flat in ~0.6 s after you let go */
    var T=C.tilt;spr(T,'x',dt);spr(T,'y',dt);
    C.moving*=Math.exp(-dt*2.2); /* motion afterglow exp(-dt*2.2) */
  };
  var tt=0,PT=new Map(),drag=null,pinch=null,lastTap={t:0,x:0,y:0},gLock=false,FL=null,wt=0;
  function settle(src){C.busy=false;C.onSettle(src)}
  /* a module may claim a pointer (M.grab -> {move(x,y), up(x,y,cancelled)}): the camera then ignores that pointer completely (no pan, tap or ripple) */
  el.addEventListener('pointerdown',function(e){try{el.setPointerCapture(e.pointerId)}catch(x){}
    if(C.onGrab&&!C.grab&&!PT.size){var gr=C.onGrab(e.clientX,e.clientY,e);if(gr){C.grab={id:e.pointerId,h:gr};C.glide=C.glide&&C.glide.lock?C.glide:null;return}}
    if(C.grab)return;
    var locked=!!(C.glide&&C.glide.lock),stray=locked||(C.busy&&!PT.size);
    PT.set(e.pointerId,{x:e.clientX,y:e.clientY,t0:now(),stray:stray});if(!locked)C.glide=null;FL=null;
    if(PT.size===1&&!gLock&&!pinch){drag={id:e.pointerId,moved:0,vx:0,vy:0,lt:now(),resume:locked}}
    else if(!pinch&&PT.size>=2){C.glide=null;drag=null;gLock=true;C.tilt.tx=C.tilt.ty=0;var ids=Array.from(PT.keys()).slice(0,2),a=ids.map(function(i){return PT.get(i)});
      pinch={ids:ids,d0:Math.max(10,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),s0:C.s,m:[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2]};C.busy=true}});
  el.addEventListener('pointermove',function(e){if(C.grab&&C.grab.id===e.pointerId){C.grab.h.move(e.clientX,e.clientY);return}var p=PT.get(e.pointerId);
    if(!p){if(e.pointerType==='mouse'){C.tilt.tx=(e.clientX-C.W/2)*.035;C.tilt.ty=(e.clientY-C.H/2)*.035}return}
    var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pinch){if(pinch.ids.indexOf(e.pointerId)<0)return;var a=pinch.ids.map(function(i){return PT.get(i)}),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m=[(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2];
      C.zoomAt(m[0],m[1],pinch.s0*d/pinch.d0);C.x-=(m[0]-pinch.m[0])/C.s;C.y-=(m[1]-pinch.m[1])/C.s;pinch.m=m;C.clampPan();C.moving=1;return}
    if(gLock)return;
    if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<6)return;if(C.glide&&C.glide.lock){C.glide=null;drag.resume=true}
      var t=now(),dt=Math.max(8,t-drag.lt);drag.lt=t;drag.vx=lerp(drag.vx,dx/dt,.4);drag.vy=lerp(drag.vy,dy/dt,.4);
      var pan=sstep(1.12,1.8,C.zf());C.x-=dx*pan/C.s;C.y-=dy*pan/C.s;C.clampPan();
      C.tilt.tx=clamp(C.tilt.tx+dx*.5,-70,70);C.tilt.ty=clamp(C.tilt.ty+dy*.5,-70,70);C.moving=1}});
  function up(e){if(C.grab&&C.grab.id===e.pointerId){var gh=C.grab.h;C.grab=null;gh.up(e.clientX,e.clientY,e.type==='pointercancel');return}var p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
    if(!PT.size)gLock=false;
    if(pinch){if(pinch.ids.indexOf(e.pointerId)>=0){var r=C.s/pinch.s0;pinch=null;settle({kind:'pinch',ratio:r})}drag=null;return}
    if(gLock){drag=null;return}
    if(drag&&drag.id===e.pointerId){var dur=now()-p.t0;
      if(drag.moved<10&&dur<350&&p.stray){C.onTouch(e.clientX,e.clientY);lastTap={t:0,x:0,y:0}}
      else if(drag.moved<10&&dur<350){var t=now(),DT=(TK().motion||{}).doubleTap,dw=DT?DT.m4.windowMs:360,dd=DT?DT.m4.distancePx:40,dbl=t-lastTap.t<dw&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<dd;
        lastTap={t:dbl?0:t,x:e.clientX,y:e.clientY};C.onTouch(e.clientX,e.clientY);clearTimeout(tt);
        if(dbl)C.onDouble(e.clientX,e.clientY);else{var tx=e.clientX,ty=e.clientY;tt=setTimeout(function(){C.onTap(tx,ty)},dw)}}
      else if(C.zf()>1.12){var k=sstep(1.12,1.8,C.zf());if(Math.hypot(drag.vx,drag.vy)>.15)FL={vx:drag.vx*k,vy:drag.vy*k}}
      if(drag&&drag.resume&&drag.moved>=6)settle({kind:'resume'});
      drag=null;C.tilt.tx=C.tilt.ty=0}}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!PT.size){C.tilt.tx=C.tilt.ty=0}});
  /* desktop wheel: the same continuous camera zoom from the pointer (never a level per notch); a soft settle 260 ms after the last notch */
  el.addEventListener('wheel',function(e){e.preventDefault();if(now()<C.wheelLock){C.wheelLock=Math.max(C.wheelLock,now()+260);return}C.glide=null;FL=null;C.busy=true;
    var dy=e.deltaMode===1?e.deltaY*32:e.deltaMode===2?e.deltaY*400:e.deltaY;
    var WZ=(TK().motion||{}).wheelZoom||{ctrlKeyGain:.012,plainGain:.0016,settleDelayMs:260};C.zoomAt(e.clientX,e.clientY,C.s*Math.exp(-dy*(e.ctrlKey?WZ.ctrlKeyGain:WZ.plainGain)));C.moving=1;
    clearTimeout(wt);wt=setTimeout(function(){settle({kind:'wheel'})},WZ.settleDelayMs)},{passive:false});
  ['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
  addEventListener('keydown',function(e){if(e.target&&/input|textarea|select/i.test(e.target.tagName))return;C.onKey(e)});
  return C;
}
w.ShellCamera=Camera;
})(window);
