/* tiled-moon-v3 · snow on the water (from box:opener-snowwater, ported onto the v3.1 Moonwater backdrop).
 - Clean start: the water is the original still/shader only; after 2 s flakes spawn from the top and ramp in over 7 s.
 - Snow falls behind the poem and the tiles (it lives in .backdrop), slightly defocused near flakes, falling only.
 - A finger or cursor stirs the flakes near it (passive listeners; never blocks scroll or pinch).
 - Mist: a static veil over the water (not a grade of the photo, not animated).
 - Reflection + moon glow drive the water shader (js/water.js uniforms rf / mg): star reflections on the water, moon glow + streak.
 - Ambience pill (bottom left, collapsed by default): snow, mist, reflection, moon. Values kept on this device (gj.amb.*),
 query keys ?sn= ?hz= ?rf= ?mg= win. Nothing here moves on its own beyond the snowfall; Reduce Motion changes nothing. */
(function(){
'use strict';
var bd=document.querySelector('.backdrop');if(!bd)return;
var cv=document.createElement('canvas');cv.id='snow';cv.setAttribute('aria-hidden','true');bd.appendChild(cv);
var g=cv.getContext('2d');if(!g)return;
var W=0,H=0,DPR=1,t0=performance.now(),last=t0;
var NFL=64,SNOW_DELAY=2000,SNOW_RAMP=7000,FL=[],touchAct=0,touchX=-999,touchY=-999,ptrDown=false,lastTouch=0;
var AMB={sn:1,hz:.2,rf:1,mg:1},DEF={sn:100,hz:20,rf:100,mg:100},MAX={sn:200,hz:100,rf:200,mg:200},
    LS={sn:'gj.amb.snow',hz:'gj.amb.haze',rf:'gj.amb.refl',mg:'gj.amb.moon'};
function seeded(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}}
var rnd=seeded(4127);
function clamp(v,a,b){return v<a?a:v>b?b:v}
function smoother(x){x=clamp(x,0,1);return x*x*x*(x*(x*6-15)+10)}
/* soft flake sprite */
var GW=document.createElement('canvas');GW.width=GW.height=64;(function(){var c=GW.getContext('2d'),r=c.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(240,246,255,.95)');r.addColorStop(.35,'rgba(230,240,255,.45)');r.addColorStop(1,'rgba(230,240,255,0)');c.fillStyle=r;c.fillRect(0,0,64,64)})();
function build(){FL=[];for(var i=0;i<NFL;i++){var z=.35+rnd()*.65;FL.push({on:0,age:0,x:rnd()*W,y:-16-rnd()*90,z:z,vx:0,vy:0,ph:rnd()*6.28,s:.6+rnd()*.8,r:1.4+z*3.2,tw:.6+rnd()*1.4})}}
function layout(){W=innerWidth;H=innerHeight;DPR=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);if(!FL.length)build()}
layout();addEventListener('resize',layout,{passive:true});
function snowIn(now){return smoother((now-t0-SNOW_DELAY)/SNOW_RAMP)}
function arr(){var v=parseFloat(bd.style.getPropertyValue('--arr'));return isFinite(v)?v:1}
function haze(h,k){if(h<.005)return;var r=Math.max(W,H);
  var a=g.createRadialGradient(W*.5,H*.58,0,W*.5,H*.58,r*.74);a.addColorStop(0,'rgba(198,216,230,'+(.28*h*k)+')');a.addColorStop(.5,'rgba(176,200,220,'+(.12*h*k)+')');a.addColorStop(1,'rgba(176,200,220,0)');g.fillStyle=a;g.fillRect(0,0,W,H);
  var b=g.createRadialGradient(W*.3,H*.36,0,W*.3,H*.36,r*.4);b.addColorStop(0,'rgba(214,226,236,'+(.18*h*k)+')');b.addColorStop(1,'rgba(214,226,236,0)');g.fillStyle=b;g.fillRect(0,0,W,H);
  var c=g.createLinearGradient(0,H*.7,0,H);c.addColorStop(0,'rgba(10,18,28,0)');c.addColorStop(1,'rgba(10,18,28,'+(.22*h*k)+')');g.fillStyle=c;g.fillRect(0,0,W,H)}
var vis=true;document.addEventListener('visibilitychange',function(){vis=!document.hidden;if(vis){last=performance.now();requestAnimationFrame(frame)}});
function frame(now){if(!vis)return;var dt=Math.min(.05,(now-last)/1000);last=now;
  touchAct+=((ptrDown||now-lastTouch<500?1:0)-touchAct)*Math.min(1,dt*4);
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  var k=.35+.65*arr();                       /* full on the bright water at the top, softer down in the sky */
  haze(AMB.hz,k);
  var sin=snowIn(now),I=sin*AMB.sn*k*(1+.6*touchAct),n=Math.ceil(sin*NFL*Math.min(1,AMB.sn)),R=Math.min(W,H)*.34;
  if(I>0.001)for(var i=0;i<FL.length&&i<n;i++){var f=FL[i],z=f.z;
    if(!f.on){f.on=1;f.age=0;f.vx=f.vy=0;f.x=rnd()*W;f.y=-12-rnd()*28}
    if(touchAct>.01){var dx=f.x-touchX,dy=f.y-touchY,rr=Math.hypot(dx,dy)+.001;if(rr<R){var w=Math.pow(1-rr/R,2)*touchAct*(.5+z*.6);f.vx+=(-dy/rr*180-dx/rr*40)*w*dt*6;f.vy+=(dx/rr*180-dy/rr*40)*w*dt*6}}
    f.vx*=Math.exp(-dt*1.7);f.vy*=Math.exp(-dt*1.7);
    f.x+=(f.vx+Math.sin(now*.00055*f.s+f.ph)*7*z)*dt;f.y+=(f.vy+(18+36*z))*dt;f.age+=dt;
    if(f.y>H+20){f.y=-10;f.x=rnd()*W;f.vx=f.vy=0;f.age=0}
    if(f.x<-40)f.x=W+20;else if(f.x>W+40)f.x=-20;
    var tw=.55+.45*Math.sin(now*.001*f.tw+f.ph),a=(.18+.36*z)*Math.min(1.35,I)*tw*Math.min(1,f.age*.8);if(a<.02)continue;
    var gs=f.r*(1.4+z*2.2)*2.4;g.globalAlpha=Math.min(.92,a);g.drawImage(GW,f.x-gs,f.y-gs,gs*2,gs*2);
    g.globalAlpha=Math.min(.7,a*.7);g.fillStyle='#e9f1ff';g.beginPath();g.arc(f.x,f.y,Math.max(.8,f.r*.45),0,7);g.fill()}
  g.globalAlpha=1;requestAnimationFrame(frame)}
requestAnimationFrame(frame);
function pt(e){touchX=e.clientX;touchY=e.clientY;lastTouch=performance.now()}
addEventListener('pointerdown',function(e){ptrDown=true;pt(e)},{passive:true});
addEventListener('pointermove',function(e){if(e.pointerType==='mouse'||ptrDown)pt(e)},{passive:true});
addEventListener('pointerup',function(){ptrDown=false},{passive:true});addEventListener('pointercancel',function(){ptrDown=false},{passive:true});
/* ---- ambience values ---- */
function shader(){if(window.__water&&__water.amb)__water.amb(AMB.mg,AMB.rf)}
function apply(id,pct,store){pct=+pct;if(!isFinite(pct))pct=DEF[id];pct=clamp(pct,0,MAX[id]);AMB[id]=pct/100;
  if(store!==false)try{localStorage.setItem(LS[id],String(pct))}catch(e){}
  var row=ui&&ui.querySelector('.amb-row[data-id="'+id+'"]');if(row){var r=row.querySelector('input'),v=row.querySelector('.amb-val');if(r&&r.value!==String(pct))r.value=String(pct);if(v)v.textContent=String(Math.round(pct))}
  if(id==='mg'||id==='rf')shader()}
var ui=document.createElement('aside');ui.id='ambui';ui.className='ambui';
var rows=[['sn','snow','snow amount'],['hz','mist','mist and haze'],['rf','reflection','reflection strength'],['mg','moon','moon glow']];
ui.innerHTML='<button type="button" id="ambToggle" class="amb-toggle" aria-expanded="false" aria-controls="ambTray" aria-label="Ambience"><span class="amb-glyph" aria-hidden="true"></span><span>ambience</span></button>'+
  '<div id="ambTray" class="amb-tray" hidden>'+rows.map(function(r){return '<div class="amb-row" data-id="'+r[0]+'"><div class="amb-lab"><label for="amb_'+r[0]+'">'+r[1]+'</label><span class="amb-val">'+DEF[r[0]]+'</span></div><input type="range" id="amb_'+r[0]+'" min="0" max="'+MAX[r[0]]+'" step="0.1" value="'+DEF[r[0]]+'" aria-label="'+r[2]+'"></div>'}).join('')+
  '<button type="button" id="ambReset" class="amb-reset">reset</button></div>';
document.body.appendChild(ui);
var Q;try{Q=new URLSearchParams(location.search)}catch(e){Q={get:function(){return null}}}
rows.forEach(function(r){var id=r[0],v=null,q=Q.get(id);if(q!=null&&q!==''&&isFinite(parseFloat(q)))v=parseFloat(q);
  if(v==null)try{var s=localStorage.getItem(LS[id]);if(s!=null&&isFinite(parseFloat(s)))v=parseFloat(s)}catch(e){}
  apply(id,v==null?DEF[id]:v,false);
  ui.querySelector('#amb_'+id).addEventListener('input',function(e){apply(id,e.target.value)})});
function open(on){ui.classList.toggle('open',!!on);ui.querySelector('#ambToggle').setAttribute('aria-expanded',on?'true':'false');var t=ui.querySelector('#ambTray');if(on)t.removeAttribute('hidden');else t.setAttribute('hidden','')}
ui.querySelector('#ambToggle').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open(!ui.classList.contains('open'))});
ui.querySelector('#ambReset').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();rows.forEach(function(r){apply(r[0],DEF[r[0]])})});
['pointerdown','touchstart','wheel','click'].forEach(function(t){ui.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
/* water.js starts late (idle); push the shader values once it exists */
var tries=0;(function wait(){if(window.__water&&__water.amb){shader();return}if(++tries<120)setTimeout(wait,250)})();
window.GJ_AMB={get:function(){return{sn:AMB.sn,hz:AMB.hz,rf:AMB.rf,mg:AMB.mg}},set:function(o){for(var k in o)if(k in AMB)apply(k,o[k])},open:open,snowIn:function(){return snowIn(performance.now())}};
})();
