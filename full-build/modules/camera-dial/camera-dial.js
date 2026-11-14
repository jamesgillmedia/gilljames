/* camera-dial.js · the camera logic dial (prototype, Nov 14 2026, local only, nothing published).
   Gill: "it would come out like the other dials but then it would orbit like a constellation."
   1. Out of the box it IS the site's side dial: #fold-dial's build (arc, 11 ticks, dot, vertical label) and behaviour from
      gilljames preview-v33d-fold 58a8e2be (site-v3-3d/js/fold.js §9 + js/tune.js show()/origin()/planes()): click toggles,
      the panel unfolds out of the dial, a history entry is pushed (phone Back closes), Esc closes, a pointerdown outside
      closes and swallows that click, fold-up hides the panel after 640 ms (240 ms Reduce Motion).
   2. Once out, the dial is a 3D constellation: one ring per camera choice, each choice a star, the chosen stars joined by a
      hairline figure. One-finger / mouse drag orbits it; let go and it springs back flat with the constellation-blend tilt
      spring (critically damped, wv=9, ~0.6 s; /workspace/constellation-blend/blend.js l.101 + l.292). Layers sit flat at rest
      and slide apart in depth only while it is turned (the constellation's flat-at-rest / 3D-on-drag rule).
   3. Tap a star (or a word in the rows) to choose. Choices are remembered per visitor (localStorage gj.cam) and published
      as window.GJ_CAMDIAL + a 'gj:camera' event with the numbers the camera code already uses (11-camera-logic.md).
   Mount: include camera-dial.css + this file. Options via <html data-camdial-slot="solo"> (centre slot, when there is no
   TUNE dial) — default "below" (one slot under #fold-dial). Self-contained: no dependencies. */
(function(){
'use strict';
if(window.GJ_CAMDIAL)return;
var D=document.documentElement,RMQ=matchMedia('(prefers-reduced-motion: reduce)');function rmOn(){return RMQ.matches}
function clamp(v,a,b){return v<a?a:v>b?b:v}function lerp(a,b,u){return a+(b-a)*u}
function sstep(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)}
function now(){return performance.now()}

/* ---------- the camera logic choices (inner ring -> outer ring). Values are the numbers found in the site's own camera code ---------- */
var RINGS=[
 {k:'drift',name:'drift',opts:[['off','off'],['slow','slow']],def:'off',src:'site-3d idle yaw .012 rad/s after 3.5 s; Gill: no runaway drift'},
 {k:'lens',name:'lens',opts:[['55','55°'],['60','60°']],def:'60',src:'r10 Spirit Eye PerspectiveCamera 55 · site-3d 60'},
 {k:'move',name:'move',opts:[['dolly','dolly'],['glide','glide'],['fly','fly']],def:'dolly',src:'fable-m4 depth push · site-3d glideTo · site-3d fly()'},
 {k:'depth',name:'depth',opts:[['far','far'],['mid','mid'],['close','close']],def:'mid',src:'r10 world FAR / MID / CLOSE'},
 {k:'release',name:'release',opts:[['stay','stay'],['settle','settle'],['snap','snap']],def:'settle',src:'sound sketch stays · site-3d W_SOFT settle · r10 280 ms snap'},
 {k:'ease',name:'ease',opts:[['fold','fold'],['cubic','cubic'],['smooth','smooth'],['push','push']],def:'fold',src:'--fold-ease · r10/m4 cubic in-out · moon opener smoother · m4 960 ms push'},
 {k:'spring',name:'spring',opts:[['soft','soft'],['glide','glide'],['fly','fly'],['look','look']],def:'glide',src:'site-3d W_SOFT 3.2 · W_GLIDE 4.6 · W_FLY 5.6 · W_REL 9.5'}
];
var NUM={
 spring:{soft:3.2,glide:4.6,fly:5.6,look:9.5},
 ease:{fold:'cubic-bezier(.22,.7,.2,1)',cubic:'cubic-in-out',smooth:'smoother(u)=u^3*(u*(u*6-15)+10)',push:'ease-out-cubic 960ms'},
 easeMs:{fold:620,cubic:520,smooth:600,push:960},
 depth:{far:0.25,mid:1,close:2.55},
 drift:{off:0,slow:0.012},
 lens:{'55':55,'60':60}
};
var KEY='gj.cam',VAL={};
function load(){var s={};try{s=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
  RINGS.forEach(function(r){var v=s[r.k];VAL[r.k]=r.opts.some(function(o){return o[0]===v})?v:r.def})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(VAL))}catch(e){}}
load();
function params(){return{move:VAL.move,depthStop:VAL.depth,depthScale:NUM.depth[VAL.depth],release:VAL.release,
  spring:NUM.spring[VAL.spring],ease:NUM.ease[VAL.ease],easeMs:NUM.easeMs[VAL.ease],driftRadPerSec:NUM.drift[VAL.drift],fov:NUM.lens[VAL.lens],
  snapMs:VAL.release==='snap'?280:0,idleMs:3500}}
var subs=[];
function publish(){var p=params();subs.forEach(function(f){try{f(Object.assign({},VAL),p)}catch(e){}});
  try{dispatchEvent(new CustomEvent('gj:camera',{detail:{values:Object.assign({},VAL),params:p}}))}catch(e){}}

/* ---------- 1. the side dial (fold.js §9 build, unchanged geometry) ---------- */
var b=document.createElement('button');b.type='button';b.id='cam-dial';b.setAttribute('aria-label','camera: open the camera logic dial');b.setAttribute('aria-expanded','false');
if(D.getAttribute('data-camdial-slot')==='solo')b.setAttribute('data-slot','solo');
var h='<svg viewBox="0 0 30 120" aria-hidden="true"><path class="fd-arc" d="M30 6 A70 70 0 0 0 30 114"/>',CX=74.5,i;
for(i=0;i<=10;i++){var ang=Math.PI-.8+i*.16,ox=CX+70*Math.cos(ang),oy=60+70*Math.sin(ang),ri=i%5?65:61,ix=CX+ri*Math.cos(ang),iy=60+ri*Math.sin(ang);
  h+='<line class="fd-tick" x1="'+ox.toFixed(1)+'" y1="'+oy.toFixed(1)+'" x2="'+ix.toFixed(1)+'" y2="'+iy.toFixed(1)+'"/>'}
h+='<circle class="fd-dot" cx="4.5" cy="60" r="2"/><text class="fd-lab" x="15" y="62.5" text-anchor="middle" transform="rotate(90 15 60)">CAMERA</text></svg>';
b.innerHTML=h;document.body.appendChild(b);

/* ---------- 2. the panel (tune drawer anatomy: planes that unfold out of the dial) ---------- */
var P=document.createElement('div');P.id='cam-panel';P.hidden=true;P.setAttribute('role','dialog');P.setAttribute('aria-label','camera logic dial');
var rowsH='';RINGS.slice().reverse().forEach(function(r){rowsH+='<li class="cd-row" data-k="'+r.k+'"><b>'+r.name.toUpperCase()+'</b><span class="cd-opts">'+
  r.opts.map(function(o){return '<button type="button" data-k="'+r.k+'" data-v="'+o[0]+'">'+o[1]+'</button>'}).join('')+'</span></li>'});
P.innerHTML='<div class="cd-3d"><h3>CAMERA <span class="cd-now"></span></h3><canvas class="cd-orb" aria-label="camera dial: drag to orbit, tap a star to choose"></canvas>'+
  '<ul class="cd-rows">'+rowsH+'</ul><p class="cd-hint">drag to orbit · tap a star to choose · esc to close</p></div>';
document.body.appendChild(P);
var cv=P.querySelector('.cd-orb'),g=cv.getContext('2d'),NOW=P.querySelector('.cd-now');
function planes(){var list=[].slice.call(P.querySelectorAll('.cd-3d>*'));list.forEach(function(el,j){el.style.setProperty('--i',String(j));el.style.setProperty('--z',(Math.max(0,3-j)*7-6)+'px')});P.style.setProperty('--n',String(list.length))}
planes();
function origin(){var r=b.getBoundingClientRect(),q=P.getBoundingClientRect();if(!r.width)return;
  P.style.setProperty('--ox',(r.left+r.width/2-q.left).toFixed(0)+'px');P.style.setProperty('--oy',(r.top+r.height/2-q.top+P.scrollTop).toFixed(0)+'px')}
function paintRows(){[].forEach.call(P.querySelectorAll('.cd-opts button'),function(x){var on=VAL[x.dataset.k]===x.dataset.v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')});
  [].forEach.call(P.querySelectorAll('.cd-row'),function(x){x.classList.toggle('f',x.dataset.k===FOCUS)});
  var r=RINGS.find(function(q){return q.k===FOCUS})||RINGS[2];NOW.textContent=r.name+' · '+(r.opts.find(function(o){return o[0]===VAL[r.k]})||[0,''])[1]}
var FOCUS='move';

var open=false,foldT=0,SWALLOW=0,POPPING=false;
function show(on,opt){var was=open;open=!!on;
  if(open&&!was){/* one dial out at a time: fold the tune drawer back into its own dial first */
    if(window.GJ_MARKMENU&&GJ_MARKMENU.open)try{GJ_MARKMENU.show(false)}catch(e){}
    try{if(!(history.state&&history.state.gjCam))history.pushState(Object.assign({},history.state||{},{gjCam:1}),'')}catch(e){}}
  if(!open&&was&&!(opt&&opt.pop)&&history.state&&history.state.gjCam){POPPING=true;try{history.back()}catch(e){POPPING=false}}
  D.classList.toggle('cd-open',open);b.setAttribute('aria-expanded',open?'true':'false');clearTimeout(foldT);
  if(open){P.classList.remove('cd-in','cd-folding');P.hidden=false;resize();paintRows();origin();void P.offsetWidth;T.x=T.y=T.vx=T.vy=T.tx=T.ty=0;lastIn=now();kick();
    requestAnimationFrame(function(){if(open)P.classList.add('cd-in')})}
  else if(was&&!P.hidden){P.classList.add('cd-folding');P.classList.remove('cd-in');drag=null;
    foldT=setTimeout(function(){if(!open){P.hidden=true;P.classList.remove('cd-folding')}},rmOn()?240:640)}
  else P.hidden=true}
b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();show(!open)},true);
addEventListener('popstate',function(e){var mine=POPPING||(open&&!(history.state&&history.state.gjCam));
  if(open&&!(history.state&&history.state.gjCam))show(false,{pop:1});POPPING=false;if(mine&&e.stopImmediatePropagation)e.stopImmediatePropagation()},true);
addEventListener('keydown',function(e){if(!open)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();show(false);return}
  if(e.target&&e.target.closest&&e.target.closest('input,textarea'))return;
  var ix=RINGS.findIndex(function(r){return r.k===FOCUS});
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();FOCUS=RINGS[clamp(ix+(e.key==='ArrowUp'?1:-1),0,RINGS.length-1)].k;paintRows();kick()}
  else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();var r=RINGS[ix],j=r.opts.findIndex(function(o){return o[0]===VAL[r.k]});
    choose(r.k,r.opts[clamp(j+(e.key==='ArrowRight'?1:-1),0,r.opts.length-1)][0])}},true);
document.addEventListener('pointerdown',function(e){if(open&&!e.target.closest('#cam-panel,#cam-dial')){SWALLOW=Date.now()+700;show(false)}},true);
addEventListener('pointerup',function(){if(SWALLOW)setTimeout(function(){SWALLOW=0},380)},true);
document.addEventListener('click',function(e){if(SWALLOW&&Date.now()<SWALLOW&&!e.target.closest('#cam-panel,#cam-dial,#fold-dial')){/* a tap on the TUNE dial is not swallowed: one tap switches dials */SWALLOW=0;e.stopPropagation();e.preventDefault()}},true);
/* the tune dial opening folds this one away (one dial out at a time) */
new MutationObserver(function(){if(open&&D.classList.contains('mm-open'))show(false)}).observe(D,{attributes:true,attributeFilter:['class']});
P.addEventListener('click',function(e){var x=e.target.closest('.cd-opts button');if(!x)return;FOCUS=x.dataset.k;choose(x.dataset.k,x.dataset.v)});
/* drawer parallax (tune.js parallax(): the plate leans a little with the pointer) */
addEventListener('pointermove',function(e){if(!open||drag||e.pointerType!=='mouse')return;
  P.style.setProperty('--px',clamp((e.clientX/innerWidth-.5)*2,-1,1).toFixed(3));P.style.setProperty('--py',clamp((e.clientY/innerHeight-.5)*2,-1,1).toFixed(3))},{passive:true});

var SEL={};/* per-ring selection glow, eased (r10's 280 ms cubic in-out snap onto the chosen stop) */
RINGS.forEach(function(r){SEL[r.k]={from:VAL[r.k],to:VAL[r.k],t0:0}});
function choose(k,v){if(VAL[k]===v){paintRows();return}SEL[k]={from:VAL[k],to:v,t0:now()};VAL[k]=v;save();paintRows();publish();kick()}

/* ---------- 3. the 3D dial: rings of stars, orbit by drag, spring back flat ---------- */
var W=0,H=0,DPR=1,STARS=[],FIELD=[];
function resize(){var w=cv.clientWidth||264;DPR=Math.min(devicePixelRatio||1,2);W=w;H=w;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);build()}
function rnd(n){var x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function build(){STARS=[];var N=RINGS.length;
  RINGS.forEach(function(r,ri){var rad=.30+ri*(.66/(N-1)),zl=(ri-(N-1)/2)/(N-1),n=r.opts.length,span=Math.min(2.4,.62*n),mid=[-30,150,-100,30,200,-60,100][ri]*Math.PI/180,a0=mid-span/2;/* each ring's choices sit on their own arc, so the chosen stars draw a figure, not a column */
    r.rad=rad;r.zl=zl;r.a0=a0;r.span=span;
    r.opts.forEach(function(o,j){var a=n===1?a0:a0+span*j/(n-1);STARS.push({ri:ri,k:r.k,v:o[0],lab:o[1],a:a,x:Math.cos(a)*rad,y:Math.sin(a)*rad,zl:zl})})});
  FIELD=[];for(var i=0;i<140;i++){var a=rnd(i)*6.283,rr=.2+Math.sqrt(rnd(i+300))*1.15;FIELD.push({x:Math.cos(a)*rr,y:Math.sin(a)*rr,z:-.9-rnd(i+600)*1.4,b:.15+rnd(i+900)*.45,ph:rnd(i+50)*6.28})}}
/* constellation-blend tilt state (blend.js l.63) and spring (l.292): T.tx/T.ty follow the finger, T.x/T.y spring to it */
var T={x:0,y:0,vx:0,vy:0,tx:0,ty:0},drag=null,lastIn=now(),PT=new Map(),motion=0;
var YAW=1.15,PIT=.8;/* soft walls (objects-3d view.js: tanh toward the clamp) */
function yawNow(){return YAW*Math.tanh((T.x/70)*1.05/YAW*1.0)}
function pitNow(){return -PIT*Math.tanh((T.y/70)*.75/PIT)}
cv.addEventListener('pointerdown',function(e){if(!open)return;e.preventDefault();cv.setPointerCapture(e.pointerId);PT.set(e.pointerId,{x:e.clientX,y:e.clientY,t0:now()});lastIn=now();
  if(PT.size===1)drag={id:e.pointerId,moved:0};else{drag=null;T.tx=T.ty=0}cv.classList.add('grab');P.classList.add('cd-held');kick()});
cv.addEventListener('pointermove',function(e){var p=PT.get(e.pointerId);if(!p)return;var dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;lastIn=now();
  if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<6)return;
    /* the constellation's one-finger look-around, opened up to a full orbit range: layers slide apart by depth while you drag */
    T.tx=clamp(T.tx+dx*.9,-140,140);T.ty=clamp(T.ty+dy*.9,-120,120);motion=1;kick()}});
function up(e){var p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
  if(drag&&drag.id===e.pointerId){if(drag.moved<10&&now()-p.t0<350)tap(e.clientX,e.clientY);drag=null}
  if(!PT.size){T.tx=0;T.ty=0;cv.classList.remove('grab');P.classList.remove('cd-held')}lastIn=now();kick()}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',function(e){if(!open)return;e.preventDefault()},{passive:false});
var SCR=[];
function tap(x,y){var r=cv.getBoundingClientRect(),px=x-r.left,py=y-r.top,best=null,bd=1e9,lim=matchMedia('(pointer:coarse)').matches?30:22;
  SCR.forEach(function(s){var d=Math.hypot(s.sx-px,s.sy-py);if(d<bd){bd=d;best=s}});
  if(best&&bd<lim){FOCUS=best.k;choose(best.k,best.v)}}
var DRIFT=0;
function project(x,y,z,yaw,pit,o){/* yaw about Y, pitch about X, then a perspective whose strength follows the lens choice */
  var cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pit),sp=Math.sin(pit);
  var x1=x*cy+z*sy,z1=-x*sy+z*cy,y1=y*cp-z1*sp,z2=y*sp+z1*cp;
  var fov=NUM.lens[VAL.lens]*Math.PI/180,d=1/Math.tan(fov/2)*1.55,k=d/(d-z2),R=W*.42;
  o[0]=W/2+x1*R*k;o[1]=H/2+y1*R*k;o[2]=k;o[3]=z2;return o}
var GLOW=(function(){var c=document.createElement('canvas');c.width=c.height=64;var q=c.getContext('2d'),gr=q.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(236,233,226,.9)');gr.addColorStop(.25,'rgba(236,233,226,.32)');gr.addColorStop(1,'rgba(236,233,226,0)');q.fillStyle=gr;q.fillRect(0,0,64,64);return c})();
function ease(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function draw(t){g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  var yaw=yawNow(),pit=pitNow();
  if(VAL.drift==='slow'&&!drag&&now()-lastIn>3500&&!rmOn()){DRIFT+=1/60;yaw+=.2*Math.sin(.6*DRIFT);pit+=.045*Math.sin(.43*DRIFT)}
  var turn=Math.min(1,Math.abs(yaw)/.5+Math.abs(pit)/.4),sep=.06+.94*sstep(0,1,turn)*1;/* flat at rest, apart while turned */
  var o=[0,0,0,0],tt=t/1000;
  /* far field: neutral grey stars behind the dial, parallax only while turned */
  FIELD.forEach(function(f){project(f.x,f.y,f.z*sep,yaw,pit,o);var tw=.75+.25*Math.sin(tt*1.3+f.ph);g.globalAlpha=f.b*tw*(.55+.45*sep);g.fillStyle='#bdbab3';g.fillRect(o[0]-.6,o[1]-.6,1.2,1.2)});
  /* rings: hairline circles, depth-separated */
  RINGS.forEach(function(r){var z=r.zl*.9*sep;g.beginPath();for(var a=0;a<=64;a++){var th=a/64*6.2832;project(Math.cos(th)*r.rad,Math.sin(th)*r.rad,z,yaw,pit,o);if(a)g.lineTo(o[0],o[1]);else g.moveTo(o[0],o[1])}
    g.globalAlpha=r.k===FOCUS?.34:.14;g.strokeStyle='#e8e4dc';g.lineWidth=r.k===FOCUS?1:.8;g.stroke();
    /* the arc the choices live on, a little brighter (the dial's tick arc) */
    g.beginPath();for(a=0;a<=24;a++){th=r.a0+r.span*a/24;project(Math.cos(th)*r.rad,Math.sin(th)*r.rad,z,yaw,pit,o);if(a)g.lineTo(o[0],o[1]);else g.moveTo(o[0],o[1])}
    g.globalAlpha=r.k===FOCUS?.6:.3;g.stroke()});
  /* the figure: chosen stars joined from the centre out (your camera, as a constellation) */
  var fig=[];project(0,0,(-.5)*.9*sep,yaw,pit,o);fig.push(o.slice());
  SCR=[];var tn=now();
  STARS.forEach(function(s){var z=s.zl*.9*sep;project(s.x,s.y,z,yaw,pit,o);var Sx=SEL[s.k],u=clamp((tn-Sx.t0)/280,0,1),e=ease(u),on=VAL[s.k]===s.v;
    var lit=on?(Sx.to===s.v?e:1):(Sx.from===s.v&&Sx.to!==s.v?1-e:0);
    var k=o[2],rad=(1.6+lit*1.6)*k,foc=s.k===FOCUS;
    g.globalAlpha=(.38+.62*lit)*(foc?1:.85);g.fillStyle='#ece9e2';g.beginPath();g.arc(o[0],o[1],rad,0,6.2832);g.fill();
    if(lit>.02){g.globalAlpha=.55*lit;var gs=22*k;g.drawImage(GLOW,o[0]-gs/2,o[1]-gs/2,gs,gs)}
    if(on)fig[s.ri+1]=o.slice();
    /* labels for the focused ring (and every ring while it is turned, so the depth reads) */
    if(foc||turn>.35){g.globalAlpha=foc?(.5+.5*lit):.28;g.font='300 '+(foc?10:8.5).toFixed(1)+'px Poppins, sans-serif';g.fillStyle='#e8e4dc';
      var lx=Math.cos(s.a),ly=Math.sin(s.a);g.textAlign=lx>.25?'left':lx<-.25?'right':'center';g.textBaseline=ly>.25?'top':ly<-.25?'bottom':'middle';g.fillText(s.lab,o[0]+lx*8,o[1]+ly*8)}
    SCR.push({sx:o[0],sy:o[1],k:s.k,v:s.v})});
  g.globalAlpha=.42;g.strokeStyle='#e8e4dc';g.lineWidth=.8;g.beginPath();fig.forEach(function(p,j){if(!p)return;if(j)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1])});g.stroke();
  /* centre: the lens */
  project(0,0,-.5*.9*sep,yaw,pit,o);g.globalAlpha=.7;g.fillStyle='#e8e4dc';g.beginPath();g.arc(o[0],o[1],2.2,0,6.2832);g.fill();
  g.globalAlpha=.25;g.beginPath();g.arc(o[0],o[1],9*o[2],0,6.2832);g.strokeStyle='#e8e4dc';g.stroke();
  /* focused ring name, small, in the middle */
  g.globalAlpha=.55;g.font='400 8px "Julius Sans One", sans-serif';g.textAlign='center';g.textBaseline='top';g.fillText((RINGS.find(function(r){return r.k===FOCUS})||{}).name.toUpperCase(),o[0],o[1]+12*o[2]);
  g.globalAlpha=1}
var raf=0,last=now();
function kick(){if(!raf){last=now();raf=requestAnimationFrame(frame)}}
function frame(t){raf=0;var dt=Math.min(.05,(t-last)/1000);last=t;
  /* tilt spring: critically damped, settles flat in ~0.6 s after you let go (constellation-blend blend.js l.292, unchanged) */
  var wv=9;['x','y'].forEach(function(a){var tg=a==='x'?T.tx:T.ty,v=a==='x'?'vx':'vy',e=T[a]-tg,kk=Math.exp(-wv*dt),c=T[v]+wv*e;T[a]=tg+(e+c*dt)*kk;T[v]=(T[v]-wv*c*dt)*kk});
  if(!drag)motion*=Math.exp(-dt*2.2);
  if(!P.hidden)draw(t);
  var moving=Math.abs(T.x-T.tx)>.05||Math.abs(T.y-T.ty)>.05||Math.abs(T.vx)>.05||Math.abs(T.vy)>.05||drag||RINGS.some(function(r){return now()-SEL[r.k].t0<320})||(VAL.drift==='slow'&&open)||now()-lastIn<900;
  if(!P.hidden&&(moving||open&&now()-lastIn<4000))raf=requestAnimationFrame(frame)}
addEventListener('resize',function(){if(!P.hidden){resize();origin();kick()}});
if(RMQ.addEventListener)RMQ.addEventListener('change',kick);

window.GJ_CAMDIAL={open:function(){show(true)},close:function(){show(false)},toggle:function(){show(!open)},isOpen:function(){return open},
  get:function(){return Object.assign({},VAL)},set:function(k,v){var r=RINGS.find(function(q){return q.k===k});if(r&&r.opts.some(function(o){return o[0]===v}))choose(k,v)},
  params:params,rings:RINGS.map(function(r){return{k:r.k,opts:r.opts.map(function(o){return o[0]}),def:r.def,src:r.src}}),
  on:function(f){subs.push(f);return function(){subs=subs.filter(function(x){return x!==f})}},
  reset:function(){RINGS.forEach(function(r){VAL[r.k]=r.def});save();paintRows();publish();kick()},
  /* QA */ _st:function(){return{open:open,hidden:P.hidden,cls:P.className,tilt:[+T.x.toFixed(2),+T.y.toFixed(2)],target:[T.tx,T.ty],yaw:+yawNow().toFixed(3),pitch:+pitNow().toFixed(3),focus:FOCUS,values:Object.assign({},VAL),stars:SCR.length}},
  _stars:function(){var r=cv.getBoundingClientRect();return SCR.map(function(s){return{k:s.k,v:s.v,x:r.left+s.sx,y:r.top+s.sy}})}};
})();
