/* site-v3-3d · calculator.mp4 + drawGlitch bio layers.
   Ported from u4-opus-m4 / tonight/fable-m4 js/sky.js (drawGlitch, layoutCalc, paintBio, bioLv).
   Pinch on the "I am Gill / I am James / I am an artist" label opens Bio.
   Inside Bio: tap or pinch-out (ctrl+wheel zoom-in) advances a layer; pinch-in, Esc, Back, or ‹ steps back. */
(function(){
'use strict';
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function now(){return performance.now()}
function bioN(){return (window.GJ_BIO&&GJ_BIO.layers&&GJ_BIO.layers.length)||5}

var bioOn=0,bioLv=1,bioExit=0,grainOn=0,raf=0,lock=0,ignorePop=0;
var vidMp4='../site-v3-3d/media/about/calculator.mp4',vidWebm='../site-v3-3d/media/about/calculator.webm';
function vidSrc(){var v=document.createElement('video');var h=v.canPlayType('video/mp4; codecs="avc1.42E01E"');return (h==='probably')?vidMp4:vidWebm}
var GL={bands:[],burst:0,w:0,h:0,frame:null,prev:null,seen:0};
var BW={acc:0,t:0,used:0};
var PIN=null,LPIN=null;

function srcTags(){
  var prefer=vidSrc();
  var a=prefer===vidWebm
    ? '<source src="'+vidWebm+'" type="video/webm"><source src="'+vidMp4+'" type="video/mp4">'
    : '<source src="'+vidMp4+'" type="video/mp4"><source src="'+vidWebm+'" type="video/webm">';
  return a;
}
function armVideo(v){
  if(!v||v._armed)return;v._armed=1;
  v.muted=true;v.loop=true;v.playsInline=true;
  function go(){layoutCalc();var p=v.play();if(p&&p.catch)p.catch(function(){})}
  v.addEventListener('loadeddata',go);
  v.addEventListener('canplay',go);
  v.addEventListener('error',function(){if(v.src&&v.src.indexOf('.mp4')>=0){v.src=vidWebm;v.load();}});
}

function mount(){
  if($('layers'))return $('layers');
  var el=document.createElement('div');
  el.id='layers';
  el.hidden=true;
  el.setAttribute('role','dialog');
  el.setAttribute('aria-label','bio');
  el.innerHTML=
    '<div id="calcstage">'+
      '<div id="calczoom">'+
        '<video id="calc" muted loop playsinline preload="auto">'+srcTags()+'</video>'+
        '<canvas id="glitch" aria-hidden="true"></canvas>'+
      '</div>'+
      '<canvas id="grain" aria-hidden="true"></canvas>'+
    '</div>'+
    '<div id="laytext" class="copy"></div>'+
    '<div id="lrail" aria-hidden="true"></div>'+
    '<button type="button" id="bio-back" aria-label="close bio">‹ back</button>';
  document.body.appendChild(el);
  armVideo($('calc'));
  var back=$('bio-back');
  if(back)back.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();stepBack(true)});
  el.addEventListener('click',onBioTap);
  addEventListener('resize',function(){if(bioOn)layoutCalc()});
  return el;
}

function paintGrain(){
  var c=$('grain');if(!c||grainOn)return;
  var w=180,h=320;c.width=w;c.height=h;
  var g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,i;
  for(i=0;i<d.length;i+=4){var n=(Math.random()*255)|0;d[i]=d[i+1]=d[i+2]=n;d[i+3]=70}
  g.putImageData(im,0,0);grainOn=1;
}

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
  var z=1+(Math.max(1,Math.min(bioN(),bioLv))-1)*0.30;
  var ox=52,oy=66,crop=null;
  if(v&&v.videoWidth&&stage.clientWidth){
    crop=calcCrop(v,stage.clientWidth,stage.clientHeight);
    ox=crop.lx*100;oy=crop.ly*100;
  }
  zoom._crop=crop;
  zoom.style.transformOrigin=ox.toFixed(2)+'% '+oy.toFixed(2)+'%';
  zoom.style.transform='scale('+z.toFixed(3)+')';
}

function tune(){
  var cs=getComputedStyle(document.documentElement);
  var g=parseFloat(cs.getPropertyValue('--gj-gl'));
  var s=parseFloat(cs.getPropertyValue('--gj-gs'));
  return {g:isFinite(g)?clamp(g,0,1):0,s:isFinite(s)&&s>0?s:1};
}

function drawGlitch(t){
  if(!bioOn)return;
  var v=$('calc'),c=$('glitch'),zoom=$('calczoom');
  if(!v||!c||!zoom||v.readyState<2||!v.videoWidth)return;
  var tn=tune();
  t=t*tn.s;
  var W=zoom.clientWidth||innerWidth,H=zoom.clientHeight||innerHeight;
  if(W<2||H<2)return;
  var bw=Math.max(2,Math.min(W,520)),bh=Math.max(2,Math.round(bw*H/W));
  if(c.width!==bw||c.height!==bh){c.width=bw;c.height=bh;GL.frame=null;GL.prev=null}
  if(!zoom._crop)layoutCalc();
  var crop=zoom._crop;if(!crop)return;
  var g=c.getContext('2d',{willReadFrequently:true});
  g.drawImage(v,crop.sx,crop.sy,crop.sw,crop.sh,0,0,bw,bh);
  var img=g.getImageData(0,0,bw,bh),d=img.data;
  if(!GL.frame||GL.frame.length!==d.length){GL.frame=new Uint8ClampedArray(d.length);GL.prev=new Uint8ClampedArray(d.length)}
  var src=GL.frame,prev=GL.prev,i;
  src.set(d);
  var depth=(Math.max(1,Math.min(bioN(),bioLv))-1)/Math.max(1,bioN()-1);
  depth=Math.min(1,depth+tn.g*0.45);
  var shift=Math.round(1+depth*16+(GL.burst>0?2+depth*8:0));
  if(tn.g>0)shift=Math.round(shift*(1+tn.g*0.6));
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
}

function loop(t){
  if(!bioOn){raf=0;return}
  drawGlitch(t);
  raf=requestAnimationFrame(loop);
}
function startLoop(){if(!raf)raf=requestAnimationFrame(loop)}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0}

function paintBio(flick){
  var texts=(window.GJ_BIO&&GJ_BIO.layers)||[];
  var text=texts[bioLv-1]||'';
  var box=$('laytext');
  if(box){
    box.className='copy lv'+bioLv+(bioLv===bioN()?' sel':'');
    box.innerHTML=text.split('\n').map(function(line){return line?'<span>'+esc(line)+'</span>':'<br>'}).join('');
    if(flick){
      box.classList.add('flick');
      GL.burst=8;
      setTimeout(function(){box.classList.remove('flick')},40);
    }
  }
  var rail=$('lrail');
  if(rail){
    var dots='',i;for(i=1;i<=bioN();i++)dots+='<i'+(i===bioLv?' class="on"':'')+'></i>';
    rail.innerHTML=dots+'<b>'+bioLv+'</b>';
  }
  var v=$('calc');
  if(v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})}
  layoutCalc();
}

function openBio(push){
  if(bioOn&&!bioExit)return;if(lock)return;lock=1;setTimeout(function(){lock=0},80);
  var el=mount();
  bioOn=1;bioLv=1;bioExit=0;GL.burst=8;GL.seen=0;GL.bands=[];
  el.hidden=false;el.classList.add('on');el.classList.remove('exit');
  document.documentElement.classList.add('gj-bio-on');
  paintGrain();paintBio(false);
  startLoop();
  if(push!==false){try{history.pushState({gjBio:1,lv:1},'')}catch(e){}}
}

function closeBio(){
  if(!bioOn&&!bioExit)return;
  bioExit=0;bioOn=0;bioLv=1;
  stopLoop();
  var el=$('layers');
  if(el){el.hidden=true;el.classList.remove('on','exit')}
  document.documentElement.classList.remove('gj-bio-on');
  var v=$('calc');
  if(v&&!v.paused)try{v.pause()}catch(e){}
}

function goDeeper(push){
  if(!bioOn||bioExit||lock)return false;lock=1;setTimeout(function(){lock=0},80);
  if(bioLv>=bioN())return true;
  bioLv++;
  paintBio(true);
  if(push!==false){try{history.pushState({gjBio:1,lv:bioLv},'')}catch(e){}}
  return true;
}

function stepBack(push){
  if(!bioOn||bioExit||lock)return false;lock=1;setTimeout(function(){lock=0},80);
  if(bioLv>1){
    bioLv--;paintBio(true);
    if(push!==false){ignorePop=1;try{history.back()}catch(e){ignorePop=0}}
    return true;
  }
  closeBio();
  if(push!==false){ignorePop=1;try{if(history.state&&history.state.gjBio)history.back();else ignorePop=0}catch(e){ignorePop=0}}
  return true;
}

function onPop(){
  if(ignorePop){ignorePop=0;return}
  var st=history.state;
  if(st&&st.gjBio){
    if(!bioOn)openBio(false);
    var lv=Math.round(+st.lv)||1;
    if(lv!==bioLv){bioLv=clamp(lv,1,bioN());paintBio(true)}
    return;
  }
  if(bioOn)closeBio();
}

function onBioTap(e){
  if(!bioOn||bioExit)return;
  if(e.target&&e.target.closest&&e.target.closest('#bio-back,a,button,input,textarea'))return;
  var box=$('laytext');
  if(box&&box.classList.contains('sel')&&e.target&&box.contains(e.target)){
    /* last layer is selectable; a tap on the text does not advance (there is no further layer) */
    return;
  }
  /* scrolling a long layer should not also advance it */
  if(box&&window.getComputedStyle(box).overflowY==='auto'&&box.contains(e.target))return;
  e.preventDefault();
  goDeeper(true);
}

function iamRects(){
  var out=[],pad=28,seen=new Set();
  function add(el){
    if(!el||seen.has(el))return;seen.add(el);
    var r=el.getBoundingClientRect();
    if(r.width>2&&r.height>2)out.push({l:r.left-pad,t:r.top-pad,r:r.right+pad,b:r.bottom+pad});
  }
  document.querySelectorAll('.intro .poem span.iam, .fold-poem').forEach(add);
  return out;
}
function hitIam(x,y){
  var rs=iamRects(),i;
  for(i=0;i<rs.length;i++)if(x>=rs[i].l&&x<=rs[i].r&&y>=rs[i].t&&y<=rs[i].b)return true;
  return false;
}
function midHits(a,b){return hitIam((a.x+b.x)/2,(a.y+b.y)/2)||hitIam(a.x,a.y)||hitIam(b.x,b.y)}

function onTouchStart(e){
  if(e.touches.length!==2){if(e.touches.length<2){PIN=null;LPIN=null}return}
  var a=e.touches[0],b=e.touches[1];
  var rec={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2,done:0,
           a:{x:a.clientX,y:a.clientY},b:{x:b.clientX,y:b.clientY}};
  if(bioOn)PIN=rec;
  else if(midHits(rec.a,rec.b))LPIN=rec;
}
function onTouchMove(e){
  if(e.touches.length!==2)return;
  var a=e.touches[0],b=e.touches[1];
  var d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  if(bioOn&&PIN&&!PIN.done){
    var r=d/(PIN.d||1);
    if(r>1.18){PIN.done=1;e.preventDefault();goDeeper(true)}
    else if(r<.84){PIN.done=1;e.preventDefault();stepBack(true)}
    else if(r>1.04||r<0.96){if(e.cancelable)e.preventDefault()}
    return;
  }
  if(!bioOn&&LPIN&&!LPIN.done){
    var r2=d/(LPIN.d||1);
    if(r2>1.16||r2<.86){
      LPIN.done=1;
      if(e.cancelable)e.preventDefault();
      openBio(true);
    }
  }
}
function onTouchEnd(){if(!arguments[0]||!arguments[0].touches||arguments[0].touches.length<2){PIN=null;LPIN=null}}

function onWheel(e){
  if(!e.ctrlKey)return;
  if(bioOn){
    if(e.cancelable)e.preventDefault();
    if(bioExit)return;
    var tm=now();if(tm-BW.t>250){BW.acc=0;BW.used=0}BW.t=tm;
    if(BW.used)return;
    BW.acc+=e.deltaY;
    if(BW.acc<=-40){BW.used=1;goDeeper(true)}
    else if(BW.acc>=40){BW.used=1;stepBack(true)}
    return;
  }
  if(!hitIam(e.clientX,e.clientY))return;
  if(e.cancelable)e.preventDefault();
  var tm2=now();if(tm2-BW.t>250){BW.acc=0;BW.used=0}BW.t=tm2;
  if(BW.used)return;
  BW.acc+=e.deltaY;
  /* either pinch direction on the label opens Bio */
  if(Math.abs(BW.acc)>=40){BW.used=1;openBio(true)}
}

function onKey(e){
  if(!bioOn||bioExit)return;
  if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();stepBack(true)}
  else if(e.type==='keydown'&&e.key==='ArrowRight'){e.preventDefault();goDeeper(true)}
  else if(e.type==='keydown'&&e.key==='ArrowLeft'){e.preventDefault();stepBack(true)}
}

function hookLevels(){
  var L=window.__levels;
  if(!L||L._bioHook)return;
  var up=L.up;
  L.up=function(){
    if(bioOn&&!bioExit){stepBack(true);return true}
    return up.apply(this,arguments);
  };
  L._bioHook=1;
}

function bind(){
  mount();
  hookLevels();
  addEventListener('popstate',onPop);
  addEventListener('keydown',onKey,true);
  addEventListener('keyup',onKey,true);
  addEventListener('wheel',onWheel,{capture:true,passive:false});
  addEventListener('touchstart',onTouchStart,{capture:true,passive:true});
  addEventListener('touchmove',onTouchMove,{capture:true,passive:false});
  addEventListener('touchend',onTouchEnd,{capture:true,passive:true});
  addEventListener('touchcancel',onTouchEnd,{capture:true,passive:true});
}

window.__bioGlitch={
  open:function(){openBio(true)},
  close:function(){closeBio()},
  deeper:function(){return goDeeper(true)},
  back:function(){return stepBack(true)},
  get on(){return !!bioOn},
  get lv(){return bioLv}
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
else bind();
})();
