/* proto-shell module · about-calc — the About / bio calculator, 2D (as it is) or 3D (an object you can tilt).
   PORT, not a rewrite. Source: gill-sky main 0d07fea, tonight/fable-m4/
     js/sky.js  calcCrop, layoutCalc, drawGlitch, paintGrain, paintBio, syncBio, enterMoon, bioDeeper, startMoonExit, bioBack (lines 1948-2138)
     js/layers.js  GJ_BIO.layers, Gill's seven layers (copied verbatim to ./layers.js; nothing written here)
     css/sky.css  #layers / #calcstage / #laytext / #lrail / #moons (lines 280-307, verbatim in ./calc.css)
     media/about/calculator.mp4, moon-grid.mp4 (copied byte-identical to ./media)
   Where it sits: About BOARD (lv 2) = m4 about/bio. Tap = one layer deeper (m4: click/tap deeper); after layer 7 the moon grid;
   out (‹, Esc, double tap) steps back one layer, and from layer 1 runs the m4 moon exit, then leaves to About MID.
   A = 2D, the m4 flat calculator exactly. B = 3D: CSS 3D preserve-3d planes (no library): back, four sides (the photo's own edge
   pixels stretched, shaded by the light angle), a bevel rim, the face (the same glitch canvas), a recessed display well cut at the
   photo's display (floor = the same glitched pixels, dimmed, set back; the glitch words on it), and four boxes holding the poem and
   the bio as real DOM text at slight depth offsets. Drag = tilt on the 4:45 critically damped spring w = 9 (tokens).
   No prefers-reduced-motion branch anywhere (STANDARDS §3): Reduce Motion is identical. Nothing auto-advances. */
(function(){
'use strict';
var BASE='modules/about-calc/';
function $(id){return document.getElementById(id)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rd(k,d){try{var v=localStorage.getItem('gj.acalc.'+k);if(v==null||v==='')return d;v=+v;return isFinite(v)?v:d}catch(e){return d}}
/* tune: slider specs {k:'gj.*', label, min, max, def, after} and a toggle spec {type:'toggle', k, options, get, set}; the core tune menu renders both. */
var TUNE=[
  {type:'toggle',k:'gj.acalc.view',label:'calculator',options:[['A','2D · flat'],['B','3D · object']],get:function(){return V},set:function(v){if(SH)SH.setVariant(v)}},
  {k:'gj.acalc.tilt',label:'tilt amount',min:0,max:40,def:16,after:function(){applyTune()}},
  {k:'gj.acalc.depth',label:'depth',min:4,max:60,def:22,after:function(){applyTune()}},
  {k:'gj.acalc.light',label:'light angle',min:0,max:359,def:330,after:function(){applyTune()}},
  {k:'gj.acalc.gspeed',label:'glitch speed',min:25,max:300,def:100,after:function(){applyTune()}}];
var M={id:'about-calc',title:'about · calculator',chapter:'about',
  variants:{A:'A · 2D: the m4 flat calculator, as it is (glitch, seven layers, moon grid)',
    B:'B · 3D: the same calculator as an object. Drag to tilt; the poem and the bio fill its four boxes'},
  tune:TUNE};
function loadCss(h){return new Promise(function(ok){var l=document.createElement('link');l.rel='stylesheet';l.href=h;l.onload=ok;l.onerror=ok;document.head.appendChild(l)})}
function loadJs(s){return new Promise(function(ok,no){var e=document.createElement('script');e.src=s;e.onload=ok;e.onerror=function(){no(new Error(s))};document.head.appendChild(e)})}
M.ready=Promise.all([loadCss(BASE+'calc.css'),loadJs(BASE+'layers.js')]);
function val(k){var t=TUNE.filter(function(r){return r.k==='gj.acalc.'+k})[0];return rd(k,t.def)}
var V='A';

/* ---------- m4 state (sky.js 1948) ---------- */
var bioOn=0,bioLv=1,bioExit=0,bioMoon=0,grainOn=0,SH=null,root=null;
function isBio(){var c=SH&&SH.ladder.cur;return !!c&&c.lv===2&&c.k==='about'}
function paintGrain(){
  var c=$('grain');if(!c||grainOn)return;
  var w=180,h=320;c.width=w;c.height=h;
  var g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,i;
  for(i=0;i<d.length;i+=4){var n=(Math.random()*255)|0;d[i]=d[i+1]=d[i+2]=n;d[i+3]=70}
  g.putImageData(im,0,0);grainOn=1;
}
var GL={bands:[],burst:0,w:0,h:0,frame:null,prev:null},GL3={bands:[],burst:0,w:0,h:0,frame:null,prev:null};
function calcCrop(v,W,H){
  var vw=v.videoWidth,vh=v.videoHeight;
  var bx=0,by=vh*0.045,bw=vw,bh=vh*0.88;
  var dar=W/Math.max(1,H),sw,sh;
  if(bw/bh>dar){sh=bh;sw=sh*dar}else{sw=bw;sh=sw/dar}
  var sx=Math.max(0,Math.min(vw-sw,bx+(bw-sw)/2));
  var sy=Math.max(0,Math.min(vh-sh,by+(bh-sh)*0.22));
  var fx=vw*0.58,fy=vh*0.40;
  return {sx:sx,sy:sy,sw:sw,sh:sh,lx:(fx-sx)/sw,ly:(fy-sy)/sh};
}
function layoutCalc(){
  var stage=$('calcstage'),zoom=$('calczoom'),v=$('calc');
  if(!stage||!zoom)return;
  var z=1+(Math.max(1,Math.min(7,bioLv))-1)*0.30;
  var ox=52,oy=66,crop=null;
  if(v&&v.videoWidth&&stage.clientWidth){
    crop=calcCrop(v,stage.clientWidth,stage.clientHeight);
    ox=crop.lx*100;oy=crop.ly*100;
  }
  zoom._crop=crop;
  zoom.style.transformOrigin=ox.toFixed(2)+'% '+oy.toFixed(2)+'%';
  zoom.style.transform='scale('+z.toFixed(3)+')';
}
/* m4 drawGlitch, verbatim from `var bw=` down; parameterised only by (state, canvas, crop, W, H) so the 3D face runs the same pixels.
   The one addition: t is the glitch clock (t * glitch speed / 100; 100 = m4). */
function glitchCore(GL,v,c,crop,W,H,t){
  var bw=Math.max(2,Math.min(W,520)),bh=Math.max(2,Math.round(bw*H/W));
  if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;GL.frame=null;GL.prev=null}
  var g=c.getContext('2d',{willReadFrequently:true});
  g.drawImage(v,crop.sx,crop.sy,crop.sw,crop.sh,0,0,bw,bh);
  var img=g.getImageData(0,0,bw,bh),d=img.data;
  if(!GL.frame||GL.frame.length!==d.length){GL.frame=new Uint8ClampedArray(d.length);GL.prev=new Uint8ClampedArray(d.length)}
  var src=GL.frame,prev=GL.prev,i;
  src.set(d);
  var depth=(Math.max(1,Math.min(7,bioLv))-1)/6;
  var shift=Math.round(1+depth*16+(GL.burst>0?2+depth*8:0));
  var mix=0.16+depth*0.84;
  var dim=0.28+depth*0.42;
  var scan=depth>0.55?2:3;
  var flick=(0.78-depth*0.5)+(0.28+depth*0.85)*(0.5+0.5*Math.sin(t*0.05));
  if(depth>0.35&&Math.sin(t*0.021)>0.8)flick*=0.35;
  var yBand=(Math.sin(t*0.0023)*0.5+0.5);
  var standY=(yBand*(bh-8))|0;
  var standDx=Math.round(Math.sin(t*0.0031)*(depth*26));
  var standH=Math.round(2+depth*20);
  var standY2=((standY+((bh*0.37)|0))%bh);
  var standDx2=Math.round(Math.cos(t*0.0027)*(depth*20));
  if(Math.random()<0.12+depth*0.28+(GL.burst>0?0.55:0)){
    GL.bands.push({y:(Math.random()*bh)|0,hh:Math.round(3+Math.random()*(6+depth*22)),dx:Math.round((Math.random()*2-1)*(2+depth*26)),life:3+((Math.random()*(4+depth*10))|0),mosh:Math.random()<0.45+depth*0.4});
  }
  if(GL.burst>0)GL.burst--;
  var live=[],bi;
  for(bi=0;bi<GL.bands.length;bi++){GL.bands[bi].life--;if(GL.bands[bi].life>0)live.push(GL.bands[bi])}
  GL.bands=live.slice(-8);
  for(var y=0;y<bh;y++){
    var dx=0,mosh=0;
    if(y>=standY&&y<standY+standH)dx=standDx;
    if(y>=standY2&&y<standY2+Math.max(2,standH-2))dx=standDx2;
    for(bi=0;bi<live.length;bi++){
      var b=live[bi];
      if(y>=b.y&&y<b.y+b.hh){dx=b.dx;if(b.mosh&&GL.seen)mosh=1}
    }
    var row=mosh&&GL.prev?prev:src;
    var scanOn=(y%scan)===0;
    var o=y*bw*4;
    for(var x=0;x<bw;x++){
      var xr=x-shift+dx;if(xr<0)xr=0;else if(xr>=bw)xr=bw-1;
      var xb=x+shift+dx;if(xb<0)xb=0;else if(xb>=bw)xb=bw-1;
      var xg=x+dx;if(xg<0)xg=0;else if(xg>=bw)xg=bw-1;
      var ir=o+xr*4,ig=o+xg*4,ib=o+xb*4,ip=o+x*4;
      var r0=src[ip],g0=src[ip+1],b0=src[ip+2];
      var r=(r0*(1-mix)+row[ir]*mix)*0.76;
      var gc=(g0*(1-mix)+row[ig+1]*mix)*0.76;
      var bch=(b0*(1-mix)+row[ib+2]*mix)*0.76;
      if(scanOn){var s=1-dim;r*=s;gc*=s;bch*=s}
      if(g0>70&&g0>r0*1.25&&g0>b0*1.1)gc=Math.max(0,Math.min(255,g0*flick));
      d[ip]=r;d[ip+1]=gc;d[ip+2]=bch;d[ip+3]=255;
    }
  }
  g.putImageData(img,0,0);
  prev.set(src);
  GL.seen=1;
  return g;
}
function drawGlitch(t){
  if(!bioOn)return;
  var v=$('calc'),c=$('glitch'),zoom=$('calczoom');
  if(!v||!c||!zoom||v.readyState<2||!v.videoWidth)return;
  var W=zoom.clientWidth||innerWidth,H=zoom.clientHeight||innerHeight;
  if(W<2||H<2)return;
  if(!zoom._crop)layoutCalc();
  var crop=zoom._crop;if(!crop)return;
  glitchCore(GL,v,c,crop,W,H,t);
}
/* 3D: the same pixels on the face, then the display well is cut out of the face and its pixels go to the well floor */
var O={};
function drawGlitch3(t){
  if(!bioOn||!O.face)return;
  var v=$('calc');if(!v||v.readyState<2||!v.videoWidth)return;
  var W=O.w,H=O.h;if(W<2||H<2)return;
  if(!O.crop||O.cropW!==W||O.cropH!==H){O.crop=crop3(v);O.cropW=W;O.cropH=H;wellLayout()}
  var g=glitchCore(GL3,v,O.face,O.crop,W,H,t),c=O.face,bw=c.width,bh=c.height,k=bw/W,R=O.well;
  var fx=Math.round(R.x*k),fy=Math.round(R.y*k),fw=Math.max(1,Math.round(R.w*k)),fh=Math.max(1,Math.round(R.h*k));
  var fl=O.floor;if(fl.width!==fw||fl.height!==fh){fl.width=fw;fl.height=fh}
  fl.getContext('2d').drawImage(c,fx,fy,fw,fh,0,0,fw,fh);
  /* the extrusion: each side shows the face's own edge pixels, stretched across the depth */
  O.sides.forEach(function(s){var sc=s.c,x2=s.ctx;
    if(s.k==='l')x2.drawImage(c,0,0,2,bh,0,0,sc.width,sc.height);
    else if(s.k==='r')x2.drawImage(c,bw-2,0,2,bh,0,0,sc.width,sc.height);
    else if(s.k==='t')x2.drawImage(c,0,0,bw,2,0,0,sc.width,sc.height);
    else if(s.k==='b')x2.drawImage(c,0,bh-2,bw,2,0,0,sc.width,sc.height);
    else{var hh=O.ch*k/2,cx=s.k.charAt(1)==='l'?hh:bw-hh,cy=s.k.charAt(0)==='t'?hh:bh-hh;x2.drawImage(c,Math.max(0,cx-1),Math.max(0,cy-1),2,2,0,0,sc.width,sc.height)}});
  g.clearRect(fx,fy,fw,fh);
}
/* the 3D face crop: the whole calculator band of the clip, without the clip's black top (0-13%) or the phone-camera zoom pills (from 80%).
   Full width, so the object's w:h is the photo's own (360 x 422 = 0.85). */
var C3={y0:0.13,y1:0.79};
function crop3(v){var vw=v.videoWidth||360,vh=v.videoHeight||640;return {sx:0,sy:vh*C3.y0,sw:vw,sh:vh*(C3.y1-C3.y0)}}
function aspect3(){var v=$('calc'),vw=v&&v.videoWidth||360,vh=v&&v.videoHeight||640;return vw/(vh*(C3.y1-C3.y0))}
/* the display well, in face px: the band of the photo that holds the calculator's display (video y 0.40-0.565: the green digits sit at 0.44-0.53 from 1 s on, measured) */
function wellLayout(){
  var v=$('calc'),vw=v&&v.videoWidth||360,vh=v&&v.videoHeight||640,c=O.crop||crop3(v||{});
  var y0=(vh*0.40-c.sy)/c.sh,y1=(vh*0.565-c.sy)/c.sh,x0=Math.max(0.05,(vw*0.06-c.sx)/c.sw),x1=Math.min(0.95,(vw*0.99-c.sx)/c.sw);
  O.well={x:x0*O.w,y:y0*O.h,w:(x1-x0)*O.w,h:(y1-y0)*O.h};
  var s=O.el.style;s.setProperty('--dx',O.well.x+'px');s.setProperty('--dy',O.well.y+'px');s.setProperty('--dw',O.well.w+'px');s.setProperty('--dh',O.well.h+'px');
  /* layer 1's words sit left of the photo's own green digits (measured: they start at 0.497 of the clip width), never over them:
     the words get the part of the display left of that, and the type is sized so the longest line ('I am an artist') fits in it */
  var dg=(vw*0.477-c.sx)/c.sw,fr=clamp((dg-x0)/(x1-x0),0.3,1),room=O.well.w*fr-16;
  s.setProperty('--ww',(fr*100).toFixed(1)+'%');
  s.setProperty('--wf',Math.min(clamp(O.well.h/4.2,9,24),Math.max(8,room/7.6)).toFixed(1)+'px');
  /* four boxes: 2 x 2 under the display, to 95% */
  var top=(y1+0.035),gap=0.03,bxw=(0.88-gap)/2,byh=(0.95-top-gap)/2;
  O.boxes.forEach(function(b,i){var cx=i%2,cy=(i/2)|0;b.style.setProperty('--bx',(6+cx*(bxw+gap)*100)+'%');b.style.setProperty('--by',((top+cy*(byh+gap))*100)+'%');
    b.style.setProperty('--bw',(bxw*100)+'%');b.style.setProperty('--bh',(byh*100)+'%')});
}

/* ---------- the seven layers (m4 paintBio, syncBio, deeper, back, moon) ---------- */
/* 3D boxes: box 1 = layer 2 (the poem), box 2 = layer 3, box 3 = layers 4 / 5, box 4 = layers 6 / 7. Layer 1 is the display. */
var BOXOF={2:0,3:1,4:2,5:2,6:3,7:3},HOME=[2,3,5,7];
function linesHtml(text){return text.split('\n').map(function(line){return line?'<span>'+esc(line)+'</span>':'<br>'}).join('')}
function paintBio(flick){
  var texts=(window.GJ_BIO&&GJ_BIO.layers)||[];
  var text=texts[bioLv-1]||'';
  var box=$('laytext');
  if(box){
    box.className='copy lv'+bioLv+(bioLv===7?' sel':'');
    box.innerHTML=text.split('\n').map(function(line){return line?'<span>'+esc(line)+'</span>':'<br>'}).join('');
    if(flick){
      box.classList.add('flick');
      GL.burst=8;
      setTimeout(function(){box.classList.remove('flick')},40);
    }
  }
  var rail=$('lrail');
  if(rail){
    var dots='',i;for(i=1;i<=7;i++)dots+='<i'+(i===bioLv?' class="on"':'')+'></i>';
    rail.innerHTML=dots+'<b>'+bioLv+'</b>';
  }
  var v=$('calc');
  if(v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}
  layoutCalc();
  paint3(flick,texts);
  var w=document.querySelector('#crumb .where');if(w)w.textContent='about › bio · '+bioLv;
}
function paint3(flick,texts){
  if(!O.words)return;
  O.words.innerHTML=linesHtml(texts[0]||'');
  var on=BOXOF[bioLv];
  O.boxes.forEach(function(b,i){
    var lv=on===i?bioLv:HOME[i];
    if(b._lv!==lv){b.innerHTML=linesHtml(texts[lv-1]||'');b._lv=lv;b.scrollTop=0}
    b.className='ac3-box'+(on===i?' on lv'+bioLv:'')+(on!=null&&on!==i?' dim':'')+(on===i&&bioLv===7?' sel':'');
  });
  if(flick){var el=on!=null?O.boxes[on]:O.words;el.classList.add('flick');GL3.burst=8;setTimeout(function(){el.classList.remove('flick')},40)}
}
function syncBio(){
  var el=root;if(!el)return;
  if(bioExit)return;
  var active=isBio();
  if(!active){el.hidden=true;el.classList.remove('on','exit','moonfade');bioOn=0;bioMoon=0;return}
  if(!bioOn)bioLv=1;
  bioOn=1;if(bioLv<1)bioLv=1;if(bioLv>7)bioLv=7;
  el.hidden=false;el.classList.add('on');
  if(bioMoon){el.classList.add('exit');el.classList.remove('moonfade');return}
  el.classList.remove('exit','moonfade');
  paintGrain();paintBio(false);layout3();
}
function enterMoon(){
  bioMoon=1;
  var el=root;if(!el)return;
  var moon=$('moons');
  if(moon){
    moon.muted=true;
    if(!moon._slot){
      moon._slot=1;
      moon.addEventListener('error',function(){
        if(document.getElementById('moonempty'))return;
        var slot=document.createElement('div');
        slot.id='moonempty';slot.className='empty-slot';
        slot.textContent='no picture of the moon grid';
        el.appendChild(slot);
      });
    }
    var p=moon.play();if(p&&p.catch)p.catch(function(){});
  }
  el.classList.add('exit');
  el.classList.remove('moonfade');
  var w=document.querySelector('#crumb .where');if(w)w.textContent='about › moon';
}
function bioDeeper(){
  if(bioExit)return true;
  if(!isBio())return false;
  if(bioMoon)return true;
  if(bioLv>=7){enterMoon();return true}
  bioLv++;paintBio(true);return true;
}
var OUT0=null;
function startMoonExit(){
  if(bioExit)return;
  bioExit=1;bioMoon=0;
  var el=root;if(!el){bioExit=0;return}
  var moon=$('moons');
  if(moon){moon.muted=true;var p=moon.play();if(p&&p.catch)p.catch(function(){})}
  el.classList.add('exit');
  setTimeout(function(){el.classList.add('moonfade')},760);
  setTimeout(function(){
    bioExit=0;bioOn=0;bioLv=1;bioMoon=0;
    el.hidden=true;el.classList.remove('on','exit','moonfade');
    OUT0(); /* m4: cur = {lv:1, k:'about'}; here the ladder steps out one level, through history like every other out (bioOn is 0 now, so the back hook lets it through) */
  },760+1200);
}
function bioBack(){
  if(bioExit)return true;
  if(!(bioOn&&isBio()))return false;
  if(bioMoon){
    bioMoon=0;
    if(root)root.classList.remove('exit','moonfade');
    paintBio(true);
    return true;
  }
  if(bioLv>1){bioLv--;paintBio(true);return true}
  startMoonExit();return true;
}

/* ---------- 3D object ---------- */
function build3(){
  var w=document.createElement('div');w.className='ac3';w.setAttribute('aria-hidden','false');
  w.innerHTML='<div class="ac3-obj" role="img" aria-label="the calculator">'+
    '<div class="ac3-back"></div>'+
    ['l','r','t','b','tl','tr','br','bl'].map(function(k){var v=k==='l'||k==='r'||k.length===2;return '<div class="ac3-side '+k+'"><canvas width="'+(v?8:96)+'" height="'+(v?96:8)+'"></canvas><i></i></div>'}).join('')+
    '<div class="ac3-face"><canvas></canvas></div><div class="ac3-bevel"></div>'+
    '<div class="ac3-well"><div class="ac3-floor"><canvas></canvas></div><div class="ac3-wall t"></div><div class="ac3-wall b"></div><div class="ac3-wall l"></div><div class="ac3-wall r"></div><div class="ac3-words"></div></div>'+
    '<div class="ac3-box"></div><div class="ac3-box"></div><div class="ac3-box"></div><div class="ac3-box"></div>'+
    '</div><div class="ac-water"></div>';
  root.appendChild(w);
  O.wrap=w;O.el=w.querySelector('.ac3-obj');O.face=w.querySelector('.ac3-face canvas');O.floor=w.querySelector('.ac3-floor canvas');
  O.words=w.querySelector('.ac3-words');O.boxes=[].slice.call(w.querySelectorAll('.ac3-box'));O.water=w.querySelector('.ac-water');
  O.sides=[].slice.call(w.querySelectorAll('.ac3-side')).map(function(s){var c=s.querySelector('canvas');return {k:s.className.split(' ')[1],el:s,c:c,ctx:c.getContext('2d'),i:s.querySelector('i')}});
  var fg=O.face.getContext('2d');O.face.width=4;O.face.height=4;fg.fillStyle='#04070b';fg.fillRect(0,0,4,4);
  O.T={x:0,y:0,vx:0,vy:0,tx:0,ty:0};
  drag3();
}
/* size: fits between the crumb and the Sound dock; w:h = the photo's (0.85) */
function layout3(){
  if(!O.el)return;var W=innerWidth,H=innerHeight,top=64,bot=H-16,snd=$('snd');
  if(snd){var r=snd.getBoundingClientRect();if(r.height>0&&r.top>H*.5)bot=r.top-14}
  var ar=aspect3(),avH=Math.max(200,bot-top),h=Math.min(avH*0.88,(W*0.80)/ar),w=Math.round(h*ar);h=Math.round(w/ar);
  O.w=w;O.h=h;var s=O.el.style;
  s.setProperty('--w',w+'px');s.setProperty('--h',h+'px');s.setProperty('--top',(top+avH/2)+'px');s.setProperty('--r',Math.round(w*0.03)+'px');
  O.ch=Math.round(Math.min(w,h)*0.05);s.setProperty('--ch',O.ch+'px');cornerPlanes();
  O.crop=null;wellLayout();applyTune();
}
/* the four corner planes close the body behind each chamfer: each stands on the cut's diagonal, facing out at 45 degrees */
function cornerPlanes(){
  var w=O.w,h=O.h,c=O.ch,d=val('depth'),R=[['tl',-45,-w/2+c/2,-h/2+c/2],['tr',45,w/2-c/2,-h/2+c/2],['br',135,w/2-c/2,h/2-c/2],['bl',-135,-w/2+c/2,h/2-c/2]];
  O.sides.forEach(function(sd){var r=R.filter(function(q){return q[0]===sd.k})[0];if(!r)return;
    var t=r[1]*Math.PI/180,nx=Math.sin(t),ny=-Math.cos(t),L=nx*r[2]+ny*r[3],fx=r[2]-L*nx,fy=r[3]-L*ny,sx=fx*Math.cos(t)+fy*Math.sin(t);
    sd.el.style.transform='rotateZ('+r[1]+'deg) rotateX(90deg) translate3d('+sx.toFixed(2)+'px,0,'+L.toFixed(2)+'px)'});
}
function applyTune(){
  if(!O.el)return;var s=O.el.style,d=val('depth'),L=val('light')*Math.PI/180;
  s.setProperty('--d',d+'px');s.setProperty('--rd',Math.max(2,Math.round(d*0.28))+'px');
  s.setProperty('--la',(val('light')+180)+'deg');
  var lx=Math.sin(L),ly=-Math.cos(L),N={l:[-1,0],r:[1,0],t:[0,-1],b:[0,1],tl:[-.707,-.707],tr:[.707,-.707],br:[.707,.707],bl:[-.707,.707]};
  O.sides.forEach(function(sd){var n=N[sd.k],lit=n[0]*lx+n[1]*ly;sd.i.style.opacity=clamp(0.55-0.4*lit,0.12,0.92).toFixed(2)});
  O.boxes.forEach(function(b,i){b.style.setProperty('--bz',((2+i*1.5)*d/22).toFixed(1)+'px')});
  rest();
}
/* the static pose: a fixed three-quarter turn, proportional to tilt amount (0 = flat). The spring always comes back here. */
function rest(){var a=val('tilt');O.T.tx=a*0.42;O.T.ty=-a*0.70}
var TK=function(){return window.TK||{}};
function spr(T,a,dt){var sp=((TK().motion||{}).springs||{}),w=sp.tiltBlend&&sp.tiltBlend.w?sp.tiltBlend.w:9,vk='v'+a,e=T[a]-T['t'+a],k=Math.exp(-w*dt),c=T[vk]+w*e;T[a]=T['t'+a]+(e+c*dt)*k;T[vk]=(T[vk]-w*c*dt)*k}
function step3(dt){
  if(!O.el)return;var T=O.T;spr(T,'x',dt);spr(T,'y',dt);
  var s=O.el.style;s.setProperty('--rx',T.x.toFixed(2)+'deg');s.setProperty('--ry',T.y.toFixed(2)+'deg');
  var a=Math.max(1,val('tilt')),L=val('light')*Math.PI/180;
  s.setProperty('--spec',clamp(1+(T.y*Math.sin(L)+T.x*Math.cos(L))/a*0.35,0.4,1.8).toFixed(2));
}
function ripple3(x,y){
  try{if(window.GJ_DEC&&!+GJ_DEC.get('ripples'))return}catch(e){}
  if(!O.water||O.water.childElementCount>24)return;
  var r=O.water.getBoundingClientRect(),s=document.createElement('i');s.className='rip';s.style.left=(x-r.left)+'px';s.style.top=(y-r.top)+'px';O.water.appendChild(s);
  setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},1600);
}
/* touch: one finger = tilt (and a ring where you touched). A short tap is handed to the shell's own tap / double-tap logic
   (synthetic pointer events on #cv), so tap = deeper and double tap = out behave exactly as on the sky. A second finger hands
   both pointers to the camera, so a pinch out over the calculator still leaves. The wheel goes to the camera too. */
var DRAGGED=false;
function drag3(){
  var el=O.el,P=new Map(),fwd=false,D=null,cv=$('cv');
  function synth(type,id,x,y,pt){try{cv.dispatchEvent(new PointerEvent(type,{pointerId:id,clientX:x,clientY:y,pointerType:pt||'touch',isPrimary:id===P.keys().next().value,bubbles:true,cancelable:true}))}catch(e){}}
  el.addEventListener('pointerdown',function(e){
    var onBox=!!e.target.closest('.ac3-box.on');
    /* on the open box: no preventDefault, so its text still scrolls (touch-action pan-y: a vertical pan becomes the box's scroll
       and cancels the tilt) and layer 7 can still be selected; a sideways drag tilts */
    if(!onBox)e.preventDefault();e.stopPropagation();if(!onBox||e.pointerType!=='mouse'){try{el.setPointerCapture(e.pointerId)}catch(x){}}
    P.set(e.pointerId,{x:e.clientX,y:e.clientY,pt:e.pointerType});
    if(P.size>=2&&!fwd){fwd=true;D=null;el.classList.remove('drag');rest();P.forEach(function(p,id){synth('pointerdown',id,p.x,p.y,p.pt)});return}
    if(fwd){synth('pointerdown',e.pointerId,e.clientX,e.clientY,e.pointerType);return}
    ripple3(e.clientX,e.clientY);
    D={id:e.pointerId,x0:e.clientX,y0:e.clientY,t0:performance.now(),moved:0,bx:O.T.tx,by:O.T.ty,box:onBox};DRAGGED=false;el.classList.add('drag');
  });
  el.addEventListener('pointermove',function(e){var p=P.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;
    if(fwd){synth('pointermove',e.pointerId,e.clientX,e.clientY,e.pointerType);return}
    if(!D||D.id!==e.pointerId)return;var dx=e.clientX-D.x0,dy=e.clientY-D.y0;D.moved=Math.max(D.moved,Math.abs(dx)+Math.abs(dy));if(D.moved>=10)DRAGGED=true;if(D.box&&e.pointerType==='mouse'&&e.buttons===0)return;
    var a=val('tilt');O.T.ty=clamp(D.by+dx/(O.w*0.5)*a,-a*1.6,a*1.6);O.T.tx=clamp(D.bx-dy/(O.h*0.5)*a,-a*1.6,a*1.6)});
  function up(e){var p=P.get(e.pointerId);if(!p)return;P.delete(e.pointerId);
    if(fwd){synth(e.type==='pointercancel'?'pointercancel':'pointerup',e.pointerId,e.clientX,e.clientY,e.pointerType);if(!P.size)fwd=false;return}
    if(D&&D.id===e.pointerId){var D0box=D.box,tap=D.moved<10&&performance.now()-D.t0<350;D=null;el.classList.remove('drag');rest();
      if(tap&&e.type==='pointerup'&&!D0box){var id=900000+(e.pointerId|0);synth('pointerdown',id,e.clientX,e.clientY,e.pointerType);synth('pointerup',id,e.clientX,e.clientY,e.pointerType)}}}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('wheel',function(e){e.preventDefault();try{cv.dispatchEvent(new WheelEvent('wheel',{deltaX:e.deltaX,deltaY:e.deltaY,deltaMode:e.deltaMode,clientX:e.clientX,clientY:e.clientY,ctrlKey:e.ctrlKey,bubbles:true,cancelable:true}))}catch(x){}},{passive:false});
  /* the open box scrolls; a tap on it (not a text pick) still goes one layer deeper, as m4's #layers click */
  O.wrap.addEventListener('click',function(e){var b=e.target.closest('.ac3-box.on');if(!b)return;if(DRAGGED){DRAGGED=false;e.stopPropagation();return}var s=window.getSelection&&window.getSelection();if(s&&String(s).length)return;e.stopPropagation();bioDeeper()});
}

/* ---------- shell hooks ---------- */
M.stop=function(st,W,H,sh){if(st.k!=='about'||st.lv<2)return undefined;if(st.lv>2)return null;
  var T=GJ_TUNE.values(),f=sh.sky.chFit('about',W,H);return {x:f.x,y:f.y,s:f.s*1.45*1.3*(T.board||1)}};
M.levelName=function(lv){return lv===2?'bio':'work'};
M.tuneTitle=function(st){return st.lv===2?'bio':null};
/* core hooks: out (‹, Esc, double tap, pinch-out, browser Back) steps a layer back and runs the moon exit; in (pinch-in, wheel-in, Enter / +) steps a layer deeper;
   Left / Right step layers while the calculator is up (Shift + Left / Right still switches A / B / C) */
M.back=function(){return bioBack()};
M.inAt=function(){if(!isBio())return false;bioDeeper();return true};
if(window.GJ_GHOST)GJ_GHOST.avoid(function(){if(!bioOn)return null;if(V==='A')return [[0,0,innerWidth,innerHeight]];var r=O.el&&O.el.getBoundingClientRect();return r?[[r.left-4,r.top-4,r.right+4,r.bottom+4]]:null});
M.arrow=function(d){if(!isBio())return false;if(d>0)bioDeeper();else bioBack();return true};
M.variant=function(v){V=v==='B'?'B':'A';if(root){root.setAttribute('data-v',V);if(bioOn){paintBio(false);layout3()}}
};
M.layout=function(){if(root&&!root.hidden){layoutCalc();layout3()}};
M.level=function(){syncBio()};
M.tap=function(){if(!isBio())return false;if(bioMoon)return true;bioDeeper();return true};
M.init=function(sh){
  SH=sh;root=document.createElement('div');root.id='acalc';root.hidden=true;root.setAttribute('data-v',V);
  root.innerHTML='<video id="calc" muted loop playsinline autoplay preload="auto" src="'+BASE+'media/calculator.mp4"></video>'+
    '<div id="calcstage"><div id="calczoom"><canvas id="glitch" aria-hidden="true"></canvas></div><canvas id="grain" aria-hidden="true"></canvas></div>'+
    '<video id="moons" muted loop playsinline preload="auto" src="'+BASE+'media/moon-grid.mp4"></video>'+
    '<div id="laytext" class="copy"></div><div id="lrail" aria-hidden="true"></div>';
  document.body.insertBefore(root,$('crumb'));
  build3();
  $('calc').addEventListener('loadedmetadata',function(){O.crop=null;if(bioOn)layout3()});
  /* m4 #layers click: the seven layers step deeper from a click or tap, unless the click is picking text or a link */
  root.addEventListener('click',function(e){
    if(!bioOn||bioExit||bioMoon)return;
    if(e.target.closest('a,button,input,.ac3'))return;
    var s=window.getSelection&&window.getSelection();if(s&&String(s).length)return;
    bioDeeper();
  });
  OUT0=function(){sh.ladder.out()};
  M.variant(sh.variant||V);
  syncBio();
};
var last=0;
M.draw=function(g,cam,t){var dt=last?Math.min(.05,(t-last)/1000):0;last=t;if(!bioOn)return;var tg=t*val('gspeed')/100;
  if(V==='A')drawGlitch(tg);else{step3(dt);drawGlitch3(tg)}};
M.state=function(){return {bio:{on:bioOn,lv:bioLv,moon:bioMoon,exit:bioExit},v:V,tilt:O.T?{x:+O.T.x.toFixed(2),y:+O.T.y.toFixed(2)}:null,obj:O.w?[O.w,O.h]:null}};
M.mid=function(){if(isBio()){bioLv=3;paintBio(false)}};
window.Shell.register(M);
})();
