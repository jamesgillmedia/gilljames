/* tonight/fable-m4 · About · the bio calculator, three ways (about-1113; ported by hand from proto-shell modules/about-calc, variant B).
   A = the m4 2D calculator exactly as it is (glitch, seven layers, moon grid): this file stays out of its way.
   B = the same calculator as a crafted CSS-3D object: back, four sides (the photo's own edge pixels stretched across the depth, shaded
       by the light angle), a lit bevel, the face (the same m4 glitch pixels, via GJ_BIOCTL.core), a recessed display well where the photo's
       green digits sit, and four keys/boxes holding the poem and the bio as real text. Drag tilts it on a critically damped spring.
   C = B, deeper: stronger tilt and depth, a moving sheen and a cast shadow, and on desktop the object leans toward the pointer.
   Layers, taps, pinch, Esc, browser Back and the moon exit are sky.js's own (bioDeeper / bioBack / startMoonExit): nothing here steps layers
   except a tap, which is handed to the same #layers click sky.js already listens for. No orbit; nothing moves on its own.
   No prefers-reduced-motion branch: Reduce Motion gives identical states and poses.
   Dev switch: ?v=A|B|C (or ?calc=) and localStorage gj.acalc.v; B is the default. The tune menu shows A/B/C while gj.dev is on. */
(function(){
'use strict';
function $(id){return document.getElementById(id)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rd(k,d){try{var v=localStorage.getItem(k);if(v==null||v==='')return d;var n=+v;return isFinite(n)?n:d}catch(e){return d}}
function wr(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
var DEF={tilt:16,depth:22,light:330,gspeed:100};
function val(k){return rd('gj.acalc.'+k,DEF[k])}
var V=(function(){var q=/(?:^|[?&])(?:v|calc)=([ABC])(?:&|$)/.exec(location.search);if(q){wr('gj.acalc.v',q[1]);return q[1]}
  try{var s=localStorage.getItem('gj.acalc.v');if(s==='A'||s==='B'||s==='C')return s}catch(e){}return 'B'})();
function dev(){var q=/(?:^|[?&])dev=([01])(?:&|$)/.exec(location.search);if(q){wr('gj.dev',q[1])}return rd('gj.dev',0)!==0}
var K=function(){return V==='C'?{t:1.6,d:1.8}:{t:1,d:1}};
var L=null,O={},BUILT=false,clk=0,lastT=0;
var BOXOF={2:0,3:1,4:2,5:2,6:3,7:3},HOME=[2,3,5,7],TAG=['poem','bio · short','bio','bio · long'],NUM=['2','3','4 · 5','6 · 7'];
function texts(){return (window.GJ_BIO&&GJ_BIO.layers)||[]}
function linesHtml(t){return String(t||'').split('\n').map(function(l){return l?'<span>'+esc(l)+'</span>':'<br>'}).join('')}

/* ---------- build ---------- */
function build(){
  L=$('layers');if(!L||BUILT)return;BUILT=true;
  var w=document.createElement('div');w.className='ac3';
  w.innerHTML='<div class="ac3-shadow" aria-hidden="true"></div><div class="ac3-obj" role="img" aria-label="the calculator">'+
    '<div class="ac3-back"></div>'+
    ['l','r','t','b'].map(function(k){return '<div class="ac3-side '+k+'"><canvas width="'+(k==='l'||k==='r'?8:96)+'" height="'+(k==='l'||k==='r'?96:8)+'"></canvas><i></i></div>'}).join('')+
    '<div class="ac3-face"><canvas></canvas><b class="ac3-sheen"></b></div><div class="ac3-bevel"></div>'+
    '<div class="ac3-well"><div class="ac3-floor"><canvas></canvas><i class="ac3-scrim"></i></div><div class="ac3-wall t"></div><div class="ac3-wall b"></div><div class="ac3-wall l"></div><div class="ac3-wall r"></div><div class="ac3-glass"></div><div class="ac3-words"></div></div>'+
    [0,1,2,3].map(function(i){return '<div class="ac3-box" data-i="'+i+'"><em class="ac3-tag"><i>'+NUM[i]+'</i> '+TAG[i]+'</em><div class="ac3-txt"></div></div>'}).join('')+
    '</div>';
  var lab=document.createElement('p');lab.className='ac3-vlab';lab.setAttribute('aria-hidden','true');
  var flat=document.createElement('div');flat.className='ac3-words2';flat.hidden=true;flat.innerHTML=linesHtml(texts()[0]);
  L.insertBefore(w,$('moons'));L.appendChild(lab);L.appendChild(flat);
  O.wrap=w;O.el=w.querySelector('.ac3-obj');O.face=w.querySelector('.ac3-face canvas');O.floor=w.querySelector('.ac3-floor canvas');
  O.words=w.querySelector('.ac3-words');O.flat=flat;O.boxes=[].slice.call(w.querySelectorAll('.ac3-box'));O.lab=lab;O.shadow=w.querySelector('.ac3-shadow');
  O.sides=[].slice.call(w.querySelectorAll('.ac3-side')).map(function(s){var c=s.querySelector('canvas');return {k:s.className.split(' ')[1],c:c,ctx:c.getContext('2d'),i:s.querySelector('i')}});
  var fg=O.face.getContext('2d');O.face.width=4;O.face.height=4;fg.fillStyle='#04070b';fg.fillRect(0,0,4,4);
  O.T={x:0,y:0,vx:0,vy:0,tx:0,ty:0,d:val('depth'),vd:0,td:val('depth')};O.G={bands:[],burst:0,frame:null,prev:null};
  /* the empty-boxes bug (proto): the boxes were only filled on a layer change. They are filled here, at build, from Gill's layers. */
  O.boxes.forEach(function(b,i){b._lv=HOME[i];b.querySelector('.ac3-txt').innerHTML=linesHtml(texts()[HOME[i]-1])});
  O.words.innerHTML=linesHtml(texts()[0]);
  drag();
  var v=$('calc');if(v)v.addEventListener('loadedmetadata',function(){O.crop=null;layout()});
  addEventListener('resize',function(){layout()});
  setV(V,true);
}
/* ---------- geometry ---------- */
var C3={y0:0.13,y1:0.79};
function crop3(v){var vw=v.videoWidth||360,vh=v.videoHeight||640;return {sx:0,sy:vh*C3.y0,sw:vw,sh:vh*(C3.y1-C3.y0)}}
function aspect(){var v=$('calc'),vw=v&&v.videoWidth||360,vh=v&&v.videoHeight||640;return vw/(vh*(C3.y1-C3.y0))}
function layout(){
  if(!O.el||!L||L.hidden)return;
  var W=innerWidth,H=innerHeight,top=Math.max(96,H*.12),bot=H-Math.max(72,H*.085);
  var ar=aspect(),avH=Math.max(220,bot-top),h=Math.min(avH*.94,(W*(W<700?.86:.40))/ar),w=Math.round(h*ar);h=Math.round(w/ar);
  O.w=w;O.h=h;var s=O.el.style;
  s.setProperty('--w',w+'px');s.setProperty('--h',h+'px');s.setProperty('--r',Math.round(w*.035)+'px');
  O.wrap.style.setProperty('--top',(top+avH/2)+'px');O.wrap.style.setProperty('--w',w+'px');O.wrap.style.setProperty('--h',h+'px');
  s.setProperty('--fs',clamp(w/30,9.5,14).toFixed(1)+'px');
  O.crop=null;well();tune();
}
/* the display well, in face px: the photo's display band (video y .40-.565; the green digits sit at .44-.53 from 1 s on, measured in the proto) */
function well(){
  var v=$('calc'),vh=v&&v.videoHeight||640,vw=v&&v.videoWidth||360,c=O.crop||crop3(v||{});
  var y0=(vh*.415-c.sy)/c.sh,y1=(vh*.575-c.sy)/c.sh,x0=.06,x1=.95;
  O.well={x:x0*O.w,y:y0*O.h,w:(x1-x0)*O.w,h:(y1-y0)*O.h};
  var s=O.el.style;s.setProperty('--dx',O.well.x+'px');s.setProperty('--dy',O.well.y+'px');s.setProperty('--dw',O.well.w+'px');s.setProperty('--dh',O.well.h+'px');
  s.setProperty('--wf',clamp(O.well.h/4.1,10,26).toFixed(1)+'px');
  var top=y1+.035,gap=.03,bw=(.88-gap)/2,bh=(.955-top-gap)/2;
  O.boxes.forEach(function(b,i){var cx=i%2,cy=(i/2)|0;b.style.setProperty('--bx',(6+cx*(bw+gap)*100)+'%');b.style.setProperty('--by',((top+cy*(bh+gap))*100)+'%');
    b.style.setProperty('--bw',(bw*100)+'%');b.style.setProperty('--bh',(bh*100)+'%')});
}
function tune(){
  if(!O.el)return;var k=K(),s=O.el.style,Ld=val('light'),La=Ld*Math.PI/180;
  O.T.td=val('depth')*k.d;
  s.setProperty('--la',(Ld+180)+'deg');O.wrap.style.setProperty('--sx',(Math.sin(La)*-18).toFixed(1)+'px');O.wrap.style.setProperty('--sy',(Math.cos(La)*18).toFixed(1)+'px');
  var lx=Math.sin(La),ly=-Math.cos(La),N={l:[-1,0],r:[1,0],t:[0,-1],b:[0,1]};
  O.sides.forEach(function(sd){var n=N[sd.k],lit=n[0]*lx+n[1]*ly;sd.i.style.opacity=clamp(.55-(V==='C'?.5:.4)*lit,.08,.92).toFixed(2)});
  rest();
}
/* the resting pose: a fixed three-quarter turn, proportional to tilt amount (0 = flat). An open box eases most of the way to flat so its text reads. */
var HOV={x:0,y:0};
function rest(){var a=val('tilt')*K().t,open=BOXOF[GJ_BIOCTL.lv]!=null,f=open?.22:1;O.T.tx=a*.42*f+HOV.y;O.T.ty=-a*.70*f+HOV.x}
function spr(T,a,dt,w){var vk='v'+a,e=T[a]-T['t'+a],kk=Math.exp(-w*dt),c=T[vk]+w*e;T[a]=T['t'+a]+(e+c*dt)*kk;T[vk]=(T[vk]-w*c*dt)*kk}
function step(dt){
  var T=O.T;spr(T,'x',dt,9);spr(T,'y',dt,9);spr(T,'d',dt,7);
  var s=O.el.style;s.setProperty('--rx',T.x.toFixed(2)+'deg');s.setProperty('--ry',T.y.toFixed(2)+'deg');
  s.setProperty('--d',T.d.toFixed(1)+'px');s.setProperty('--rd',Math.max(2,T.d*.3).toFixed(1)+'px');
  O.boxes.forEach(function(b,i){b.style.setProperty('--bz',((2+i*1.5)*T.d/22).toFixed(1)+'px')});
  var a=Math.max(1,val('tilt')*K().t),La=val('light')*Math.PI/180,sp=clamp(1+(T.y*Math.sin(La)+T.x*Math.cos(La))/a*.35,.4,1.8);
  s.setProperty('--spec',sp.toFixed(2));s.setProperty('--shx',(50+T.y*1.6).toFixed(1)+'%');s.setProperty('--shy',(30-T.x*1.6).toFixed(1)+'%');
  O.wrap.style.setProperty('--tx',(T.y*-.8).toFixed(1)+'px');O.wrap.style.setProperty('--ty',(T.x*.8).toFixed(1)+'px');
  if(O.flat&&L){
    var on=L.classList.contains('ac-l1')&&!L.hidden&&!L.classList.contains('exit');
    O.flat.hidden=!on;
    if(on){
      var well=O.el.querySelector('.ac3-well'),lr=L.getBoundingClientRect();
      if(well){var r=well.getBoundingClientRect();
        O.flat.style.left=(r.left-lr.left)+'px';O.flat.style.top=(r.top-lr.top)+'px';
        O.flat.style.width=Math.max(40,r.width)+'px';O.flat.style.height=Math.max(28,r.height)+'px';
      }
    }
  }
}
/* ---------- the face: the same m4 glitch pixels ---------- */
function draw3(t){
  var v=$('calc');if(!v||v.readyState<2||!v.videoWidth||!O.w)return;
  if(!O.crop){O.crop=crop3(v);well()}
  var W=O.w,H=O.h,g=GJ_BIOCTL.core(O.G,v,O.face,O.crop,W,H,t),c=O.face,bw=c.width,bh=c.height,k=bw/W,R=O.well;
  if(GJ_BIOCTL.noflash()&&O.G.still&&O._still)return;
  O._still=GJ_BIOCTL.noflash();
  var fx=Math.round(R.x*k),fy=Math.round(R.y*k),fw=Math.max(1,Math.round(R.w*k)),fh=Math.max(1,Math.round(R.h*k));
  var fl=O.floor;if(fl.width!==fw||fl.height!==fh){fl.width=fw;fl.height=fh}
  var fg=fl.getContext('2d');
  fg.drawImage(c,fx,fy,fw,fh,0,0,fw,fh);
  O.sides.forEach(function(s){var sc=s.c,x2=s.ctx;
    if(s.k==='l')x2.drawImage(c,0,0,2,bh,0,0,sc.width,sc.height);else if(s.k==='r')x2.drawImage(c,bw-2,0,2,bh,0,0,sc.width,sc.height);
    else if(s.k==='t')x2.drawImage(c,0,0,bw,2,0,0,sc.width,sc.height);else x2.drawImage(c,0,bh-2,bw,2,0,0,sc.width,sc.height)});
  if(fw>1&&fh>1)g.clearRect(fx,fy,fw,fh);
  if(L&&!L.classList.contains('ac-live'))L.classList.add('ac-live');
}
/* ---------- layers ---------- */
function paint(flick,lv){
  if(!BUILT)build();if(!O.el)return;
  var tx=texts(),on=BOXOF[lv],pend=[];
  L.classList.toggle('ac-l1',lv===1);
  O.boxes.forEach(function(b,i){
    var want=on===i?lv:HOME[i],t=b.querySelector('.ac3-txt');
    if(b._lv!==want){t.innerHTML=linesHtml(tx[want-1]);b._lv=want;b.scrollTop=0;pend.push(b)}
    b.className='ac3-box'+(on===i?' on lv'+lv:'')+(on!=null&&on!==i?' dim':'')+(on===i&&lv===7?' sel':'');
    var tg=b.querySelector('.ac3-tag i');if(tg)tg.textContent=on===i?String(lv):NUM[i];
  });
  /* the new face is in the DOM before it is shown, so a layer change never flashes an empty dark square */
  if(pend.length){pend.forEach(function(b){b.classList.add('ac-pend')});
    requestAnimationFrame(function(){requestAnimationFrame(function(){pend.forEach(function(b){b.classList.remove('ac-pend')})})})}
  if(flick){var el=on!=null?O.boxes[on]:O.words;el.classList.add('flick');O.G.burst=8;setTimeout(function(){el.classList.remove('flick')},40)}
  rest();
}
function setV(v,quiet){
  V=v==='A'||v==='C'?v:'B';wr('gj.acalc.v',V);
  if(L)L.setAttribute('data-v',V);
  if(O.lab){O.lab.textContent='calc · '+V;O.lab.hidden=!dev()}
  if(O.el){O.crop=null;layout();if(window.GJ_BIOCTL&&GJ_BIOCTL.on)paint(false,GJ_BIOCTL.lv)}
  if(!quiet&&window.GJ_BIOCTL&&GJ_BIOCTL.on&&V==='A'){var v2=$('calc');/* 2D re-lays its own zoom from the video */try{window.dispatchEvent(new Event('resize'))}catch(e){}}
}
/* ---------- touch: one finger tilts; a tap still goes one layer deeper (sky.js #layers click); two fingers are the sky's pinch ---------- */
var DRAGGED=false;
function drag(){
  var el=O.el,D=null,n=0;
  el.addEventListener('pointerdown',function(e){n++;
    if(n>1){D=null;el.classList.remove('drag');rest();return}
    var box=e.target.closest('.ac3-box.on');
    D={id:e.pointerId,x0:e.clientX,y0:e.clientY,bx:O.T.tx,by:O.T.ty,box:!!box,moved:0};DRAGGED=false;el.classList.add('drag');
  });
  addEventListener('pointermove',function(e){
    if(!D||D.id!==e.pointerId){if(V==='C'&&e.pointerType==='mouse'&&!D&&L&&!L.hidden&&V!=='A'){var a=val('tilt')*K().t*.35;HOV.x=clamp((e.clientX/innerWidth-.5)*2,-1,1)*a;HOV.y=-clamp((e.clientY/innerHeight-.5)*2,-1,1)*a;rest()}return}
    var dx=e.clientX-D.x0,dy=e.clientY-D.y0;D.moved=Math.max(D.moved,Math.abs(dx)+Math.abs(dy));if(D.moved>=10)DRAGGED=true;
    if(D.box&&Math.abs(dy)>Math.abs(dx))return; /* a vertical pan on the open box is its scroll */
    if(e.pointerType==='mouse'&&e.buttons===0)return;
    var a=Math.max(4,val('tilt')*K().t);O.T.ty=clamp(D.by+dx/(O.w*.5)*a,-a*1.6,a*1.6);O.T.tx=clamp(D.bx-dy/(O.h*.5)*a,-a*1.6,a*1.6);
  },true);
  function up(e){n=Math.max(0,n-1);if(D&&D.id===e.pointerId){D=null;el.classList.remove('drag');rest()}}
  addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
  /* a drag is not a tap: keep the click from reaching #layers (which would step a layer) */
  O.wrap.addEventListener('click',function(e){if(DRAGGED){DRAGGED=false;e.stopPropagation()}});
}
/* ---------- tune rows for the mark menu (tune.js reads window.__shell.mod when its chapter is the room) ---------- */
function lsr(k,label,min,max){return {k:'gj.acalc.'+k,label:label,min:min,max:max,def:DEF[k],get:function(){return val(k)},apply:function(v,save){if(save)wr('gj.acalc.'+k,v);tune()}}}
var ROWS=[
  {k:'gj.acalc.v',label:'calculator',dev:1,seg:[['A','A · 2D'],['B','B · 3D'],['C','C · deep 3D']],def:'B',get:function(){return V},apply:function(v){setV(v||'B')}},
  {k:'gj.noflash',label:'stop flashing',seg:[['0','off'],['1','on']],def:'0',get:function(){return window.GJ_BIOCTL&&GJ_BIOCTL.noflash()?'1':'0'},apply:function(v){if(window.GJ_BIOCTL)GJ_BIOCTL.setNoflash(v==='1')}},
  {k:'gj.glitch',label:'glitch',mem:1,min:0,max:100,def:100,get:function(){return Math.round((window.GJ_BIOCTL?GJ_BIOCTL.glitch():1)*100)},apply:function(v){if(window.GJ_BIOCTL)GJ_BIOCTL.setGlitch(v/100)}},
  lsr('gspeed','glitch speed',25,300),lsr('tilt','tilt',0,40),lsr('depth','depth',4,60),lsr('light','light angle',0,359)];
window.__shell=window.__shell||{};window.__shell.mod={id:'about-calc',chapter:'about',tune:ROWS};
/* ---------- the hooks sky.js calls ---------- */
window.GJ_ACALC={
  get v(){return V},set:function(v){setV(v)},rows:ROWS,
  show:function(){build();if(L)L.setAttribute('data-v',V);requestAnimationFrame(layout)},
  paint:function(flick,lv){if(V!=='A')paint(flick,lv);else if(L)L.classList.toggle('ac-l1',lv===1)},
  restill:function(){O._still=false;if(O.G){O.G.still=0;O.G.needStill=1}},
  /* glitch clock: speed changes never jump (it accumulates) */
  clock:function(t){var dt=lastT?Math.min(80,t-lastT):0;lastT=t;clk+=dt*val('gspeed')/100;return clk},
  draw:function(t){var c=this.clock(t);if(V==='A')return false;if(!O.el)return true;var dt=O._t?Math.min(.05,(t-O._t)/1000):0;O._t=t;step(dt);draw3(c);return true},
  state:function(){return {v:V,tilt:O.T?{x:+O.T.x.toFixed(2),y:+O.T.y.toFixed(2),d:+O.T.d.toFixed(1)}:null,obj:O.w?[O.w,O.h]:null}}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
