/* gill james · SOUND-ONE v1 (site-sound-one). Sound is one space with the sky: no page jump, no tunnel, no flash.
   The 3D player (sound-v2b's player.js, embedded: no orbit, parallax only) sits in a transparent layer exactly over the sky, its stars lined up on Sound's sky
   stars (same constellation data, same 2:1 box). One camera:
     - in the sky, the sheet's camera drives the player (slave): as you zoom into Sound, Sound's sky stars hand over to the player's
       stars, and the player's strands, names and song list grow in (crossfade by depth only, never by time);
     - tap Sound / + / pinch or scroll past it = the camera flies on through depth (critically damped, like /sketch-3d/) and lands
       on the player's 1x view, which IS Sound opened; from there the player drives and the sky follows (dust, field, neighbours);
     - pinch / scroll the player out below 1x (release under 0.9x), tap its ‹, or press Back = the same camera flies back out
       to the Sound constellation in the sky.
   Gestures inside the player are the player's own (sound-v2b: pinch zoom + pan, never-lost clamp, chimes, song stars, sweep, dive). */
(function(){
'use strict';
var S=window.__sheetOne,D=document.documentElement;if(!S)return;
var RM=matchMedia('(prefers-reduced-motion: reduce)');
var SRC=document.currentScript&&document.currentScript.dataset.player||'../site-sound-one/player/?embed=1';
var fr=null,pk=null,ready=false,state='sky',waiters=[],FA=-1,LV=null,anim=null,pushed=false;
/* ---- the layer ---- */
function make(){if(fr)return;fr=document.createElement('iframe');fr.className='one-layer';fr.title='Sound: the player (6 songs)';fr.setAttribute('allow','autoplay');
  fr.setAttribute('aria-hidden','true');fr.tabIndex=-1;fr.src=SRC;(document.querySelector('.sheet')||document.body).insertAdjacentElement('afterend',fr);
  fr.addEventListener('load',function(){var n=0;(function wait(){var w=fr.contentWindow;if(w&&w.__sk&&w.__sk.geo){pk=w.__sk;ready=true;try{pk.sweepOn(true)}catch(e){}
      var v=VofCam(S.cam());pk.slave(true,v.z,v.x,v.y);var q=waiters;waiters=[];q.forEach(function(f){f()});S.redraw()}else if(n++<200)setTimeout(wait,25)})()})}
/* the layer has the sheet's own box (CSS: same insets), so both share one viewport */
addEventListener('resize',function(){if(state==='player')setTimeout(function(){follow(true)},60)});
function whenReady(f){make();if(ready)f();else waiters.push(f)}
/* ---- one camera: the sheet's {x,y,s} <-> the player's view {z,x,y}. Both draw SOUND.s in a 2:1 box: sky 380x190 world units,
   player min(W*.86,520) px wide at 1x (x FIT.s), centred at (W/2, H*.46) with a lift of -H*.07*FIT.s + FIT.dy ---- */
function G(){return pk.geo()}
function camOfV(v){var g=G(),C=S.sound(),s=g.sc*g.fs*v.z/380;return{x:C.x-v.x/s,y:C.y-(g.o-g.H/2+v.y+(-g.H*.07*g.fs+g.dy)*v.z)/s,s:s}}
function VofCam(c){var g=G(),C=S.sound(),z=c.s*380/(g.sc*g.fs);return{z:z,x:(C.x-c.x)*c.s,y:(C.y-c.y)*c.s-(g.o-g.H/2)-(-g.H*.07*g.fs+g.dy)*z}}
function zChap(){return VofCam(S.chap()).z}
function za(){return Math.min(zChap(),.92)}
function sm(u){u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)}
/* how much of Sound is the player: by depth only (and only while Sound is the constellation in front of you) */
function rvOf(v){var a=za(),g=G(),d=Math.hypot(v.x,v.y),m=Math.min(g.W,g.H),near=1-sm((d-.45*m*Math.max(1,v.z))/(.4*m*Math.max(1,v.z)));return sm((v.z-a)/(1-a))*near}
var SHUD=null;function show(rv){if(FA!==rv){FA=rv;SHUD=SHUD||document.querySelector('.sheet .shud');if(SHUD)SHUD.style.opacity=rv>.002?(1-rv).toFixed(3):'';fr.style.opacity=rv<.002?'0':rv>.998?'1':rv.toFixed(3);fr.style.visibility=rv<.002?'hidden':'visible'}S.setA(1-rv)}
/* sky -> player (called by the sheet after each frame it draws) */
var LC=null;function sky(c){LC={x:c.x,y:c.y,s:c.s};if(!ready||state==='player')return;var v=VofCam(c),rv=rvOf(v);if(rv>.002||FA>.002){pk.slave(true,v.z,v.x,v.y)}show(rv)}
/* player -> sky (while you are in the player) */
var raf=0;function follow(force){if(state!=='player'||!ready)return;var v=pk.view();
  if(force||!LV||v.z!==LV.z||v.x!==LV.x||v.y!==LV.y){LV={z:v.z,x:v.x,y:v.y};S.setCam(camOfV(v));show(rvOf({z:Math.min(1,v.z),x:0,y:0}))}}
function loop(){raf=0;if(state!=='player')return;follow();raf=requestAnimationFrame(loop)}
/* ---- the flight: a critically damped spring on log-zoom and position (sketch-3d's camera feel: no jolt at the start, no overshoot) ---- */
function fly(to,done,w){cancelAnimationFrame(anim&&anim.id||0);var c=S.cam(),st={l:Math.log(c.s),x:c.x,y:c.y,vl:0,vx:0,vy:0},T={l:Math.log(to.s),x:to.x,y:to.y},W0=w||6.2,t0=performance.now(),last=t0;
  if(RM.matches){S.setCam(to);done&&done();return}
  anim={id:0};(function f(now){var dt=Math.min(.05,(now-last)/1000);last=now;['l','x','y'].forEach(function(k){var v='v'+k,e=st[k]-T[k],a=-W0*W0*e-2*W0*st[v];st[v]+=a*dt;st[k]+=st[v]*dt});
    var c2={x:st.x,y:st.y,s:Math.exp(st.l)},err=Math.abs(st.l-T.l)+(Math.abs(st.x-T.x)+Math.abs(st.y-T.y))*c2.s/400;S.setCam(c2);
    if(err<.0015||now-t0>2600){S.setCam(to);anim=null;done&&done();return}anim.id=requestAnimationFrame(f)})(t0)}
/* ---- in ---- */
function enter(){whenReady(function(){if(state==='player'||state==='in')return;
  if(!S.open()){S.show({mode:'chap',k:'sound'});setTimeout(enter,850);return}
  state='in';S.crumb('sound · the player');var v=VofCam(S.cam()),to=v.z>1?{z:v.z,x:v.x,y:v.y}:{z:1,x:0,y:0};fly(camOfV(to),land)})}
function land(){state='player';var v=VofCam(S.cam());pk.slave(false);if(v.z<1.0005)pk.viewSet(Math.max(1,v.z),v.z<1.0005?0:v.x,v.z<1.0005?0:v.y);
  show(1);fr.style.pointerEvents='auto';fr.removeAttribute('aria-hidden');fr.tabIndex=0;D.classList.add('one-on');try{fr.focus({preventScroll:true});fr.contentWindow.focus()}catch(e){}
  if(!pushed){try{history.pushState({gj:1,one:1},'',location.href);pushed=true}catch(e){}}LV=null;if(!raf)raf=requestAnimationFrame(loop)}
/* ---- out ---- */
function leave(fromPop){if(state!=='player')return;state='out';cancelAnimationFrame(raf);raf=0;var v=pk.view();pk.slave(true,v.z,v.x,v.y);
  fr.style.pointerEvents='none';fr.setAttribute('aria-hidden','true');fr.tabIndex=-1;D.classList.remove('one-on');S.setCam(camOfV(v));
  if(pushed&&!fromPop){pushed=false;try{history.back()}catch(e){}}else pushed=false;
  fly(S.chap(),function(){state='sky';S.settleChap({replace:true});try{document.querySelector('.sheet .sx').focus({preventScroll:true})}catch(e){}},5.4)}
addEventListener('popstate',function(e){if(state==='player'&&!(e.state&&e.state.one))leave(true)});
/* ---- a gesture in the sky ended near Sound: land in the player or settle back on the constellation (Sound's "opened" level is the player) ---- */
function release(){if(!ready||state!=='sky'||S.nearest()!=='sound')return false;var c=S.cam(),v=VofCam(c),zc=zChap();if(v.z<=zc*1.02)return false;
  var rv=rvOf(v);if(rv>=.3||v.z>=1){enter();return true}fly(S.chap(),function(){S.settleChap({replace:true})},7);return true}
/* the dock's zoom buttons speak to the player while you are in it: - flies back out, + zooms the player */
document.addEventListener('click',function(e){if(state!=='player')return;var b=e.target.closest&&e.target.closest('.dock .zb');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  if(b.dataset.z==='-1')leave(false);else{var v=pk.view(),z=Math.min(4,v.z*1.25);pk.viewSet(z,v.x*z/v.z,v.y*z/v.z)}},true);
/* deep links and the column's Sound links (head, tile) fly in from the sky instead of loading a page */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;
  var h=a.getAttribute('href');if(h!=='../sound-v2b/'&&h!=='../sound-v2/'&&h!=='sound/')return;e.preventDefault();e.stopPropagation();
  if(S.open()){enter();return}S.show({mode:'chap',k:'sound'});whenReady(function(){setTimeout(enter,850)})},true);
if(/^#sound(\/(wave(\/play)?|player))?\/?$/.test(location.hash)){addEventListener('load',function(){S.show({mode:'chap',k:'sound',push:false});whenReady(function(){setTimeout(enter,900)})})}
/* warm the layer once the page is idle, so the hand-over is instant */
(window.requestIdleCallback||function(f){setTimeout(f,1200)})(function(){make()},{timeout:2500});
window.__soundOne={enter:enter,leave:function(){leave(false)},sky:sky,release:release,ready:function(){return ready},
  capS:function(){return camOfV({z:2.6,x:0,y:0}).s},state:function(){return{state:state,ready:ready,rv:FA,v:ready?pk.view():null,cam:S.cam(),lc:LC}},
  map:{camOfV:function(v){return camOfV(v)},VofCam:function(c){return VofCam(c)}}};
})();
