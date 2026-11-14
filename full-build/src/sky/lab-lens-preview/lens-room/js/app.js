/* Film · Lens room. You look through a camera eyepiece at a small EVF.
   Pinch out or press bin to step back out of the eyepiece onto a monitor grid.
   Titles and credits come from the existing film data. Nothing auto-advances.
   External video sites are not linked. Motion stays on with Reduce Motion,
   except gate weave, which follows the weave switch (and starts off if Reduce Motion is on). */
(function(){
'use strict';
var F=window.FILMS||[];
function $(id){return document.getElementById(id)}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])})}
function num(n){return (n<10?'0':'')+n}
function haptic(){try{if(navigator.vibrate)navigator.vibrate(8)}catch(e){}}

var room=$('room'),still=$('still'),vid=$('vid'),edge=$('edge'),smear=$('smear');
var binBtn=$('binBtn'),back=$('back'),where=$('where');
var rowsE=$('rows'),bin=$('bin');
var i=0,playing=false,pulled=false,busy=false;
var weaveOn=false,env="lens";
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var hintT=0,spillRaf=0,sampleCv,sampleCtx,leaveT=0;
var TOOLS=['peak','falsec','wave','guides','zebras','credits'];
var STORE='film-lens-red-tools';
var tools={peak:false,falsec:false,wave:false,guides:false,zebras:false,credits:false};
var redOpen=false,fxRaf=0,fxLast=0,workCv,workCtx,FXW=320,FXH=180;
var pull=0,pullFrom=0,pDist0=0,pulling=false,wantBin=false,pullEaseT=0,pullWheelT=0;
var debugAll=false;
try{debugAll=/(?:^|[?&])debug=1(?:&|$)/.test(location.search)}catch(e){}
if(debugAll)document.body.classList.add('debug-all');

function loadTools(){
  try{
    var raw=localStorage.getItem(STORE);
    if(!raw)return;
    var o=JSON.parse(raw);
    TOOLS.forEach(function(k){if(typeof o[k]==='boolean')tools[k]=o[k]});
  }catch(e){}
}
function saveTools(){
  try{localStorage.setItem(STORE,JSON.stringify(tools))}catch(e){}
}
function toolOn(name,on){
  if(TOOLS.indexOf(name)<0)return;
  if(on==null)on=!tools[name];
  tools[name]=!!on;
  saveTools();
  applyTools();
}
function syncToolButtons(){
  document.querySelectorAll('[data-tool]').forEach(function(b){
    var k=b.getAttribute('data-tool');
    if(!k||k==='play')return;
    b.setAttribute('aria-pressed',tools[k]?'true':'false');
    b.classList.toggle('on',!!tools[k]);
  });
  var pb=$('playBtn');
  if(pb){pb.setAttribute('aria-pressed',playing?'true':'false');pb.classList.toggle('on',!!playing);var s=pb.querySelector('span');if(s)s.textContent=playing?'stop':'play'}
}
function setToolbar(on){
  if(pulled||env!=='lens'||pull>0.25||document.body.classList.contains('exit-mid')||document.body.classList.contains('leaving'))on=false;
  redOpen=!!on;
  var bar=$('redBar');
  if(bar)bar.hidden=!redOpen;
  document.body.classList.toggle('red-open',redOpen);
}
function lumaAt(d,i){return d[i]*0.2126+d[i+1]*0.7152+d[i+2]*0.0722}
function fxSource(){
  if(playing&&vid.videoWidth)return vid;
  if(still&&still.naturalWidth&&still.style.display!=='none')return still;
  return null;
}
function colourLut(y){
  /* cinema-style false colour from luma 0–255. Not a measurement, a look. */
  if(y<8)return[40,0,70,255];
  if(y<26)return[30,40,200,255];
  if(y<51)return[0,160,200,255];
  if(y<110)return[20,190,60,255];
  if(y<160)return[200,200,40,255];
  if(y<204)return[255,140,20,255];
  if(y<230)return[255,80,20,255];
  return[255,20,30,255];
}
function analyseFrame(){
  var need=tools.peak||tools.falsec||tools.zebras||tools.wave;
  var src=need?fxSource():null;
  var falseCv=$('falseCv'),peakCv=$('peakCv'),zebraCv=$('zebraCv'),scopeCv=$('scopeCv'),guides=$('guides'),cred=$('redCredits');
  if(guides)guides.hidden=!tools.guides;
  if(cred)cred.hidden=!tools.credits;
  if(!need||!src){
    if(falseCv)falseCv.hidden=true;
    if(peakCv)peakCv.hidden=true;
    if(zebraCv)zebraCv.hidden=true;
    if(scopeCv)scopeCv.hidden=true;
    return;
  }
  if(!workCv){workCv=document.createElement('canvas');workCv.width=FXW;workCv.height=FXH;workCtx=workCv.getContext('2d',{willReadFrequently:true})}
  try{workCtx.drawImage(src,0,0,FXW,FXH)}catch(e){return}
  var img;try{img=workCtx.getImageData(0,0,FXW,FXH)}catch(e){return}
  var d=img.data,x,y,i,g,gx,gy;
  if(tools.falsec&&falseCv){
    falseCv.width=FXW;falseCv.height=FXH;
    var fo=falseCv.getContext('2d').createImageData(FXW,FXH),fd=fo.data,c;
    for(i=0;i<d.length;i+=4){c=colourLut(lumaAt(d,i));fd[i]=c[0];fd[i+1]=c[1];fd[i+2]=c[2];fd[i+3]=c[3]}
    falseCv.getContext('2d').putImageData(fo,0,0);
    falseCv.hidden=false;
  }else if(falseCv){falseCv.hidden=true}
  if(tools.peak&&peakCv){
    peakCv.width=FXW;peakCv.height=FXH;
    var po=peakCv.getContext('2d').createImageData(FXW,FXH),pd=po.data;
    for(y=1;y<FXH-1;y++){
      for(x=1;x<FXW-1;x++){
        i=(y*FXW+x)*4;
        gx=lumaAt(d,(y*FXW+(x+1))*4)-lumaAt(d,(y*FXW+(x-1))*4);
        gy=lumaAt(d,((y+1)*FXW+x)*4)-lumaAt(d,((y-1)*FXW+x)*4);
        g=Math.abs(gx)+Math.abs(gy);
        if(g>36){pd[i]=255;pd[i+1]=36;pd[i+2]=36;pd[i+3]=Math.min(255,40+g*2)}
      }
    }
    peakCv.getContext('2d').putImageData(po,0,0);
    peakCv.hidden=false;
  }else if(peakCv){peakCv.hidden=true}
  if(tools.zebras&&zebraCv){
    zebraCv.width=FXW;zebraCv.height=FXH;
    var zo=zebraCv.getContext('2d').createImageData(FXW,FXH),zd=zo.data,Y;
    for(y=0;y<FXH;y++){
      for(x=0;x<FXW;x++){
        i=(y*FXW+x)*4;Y=lumaAt(d,i);
        if(Y>=230 && ((x+y)%6<3)){zd[i]=zd[i+1]=zd[i+2]=245;zd[i+3]=200}
      }
    }
    zebraCv.getContext('2d').putImageData(zo,0,0);
    zebraCv.hidden=false;
  }else if(zebraCv){zebraCv.hidden=true}
  if(tools.wave&&scopeCv){
    var sw=180,sh=90;
    scopeCv.width=sw;scopeCv.height=sh;
    var sctx=scopeCv.getContext('2d');
    sctx.fillStyle='rgba(4,4,6,0.92)';sctx.fillRect(0,0,sw,sh);
    /* no tick marks or hash; a clean luma trace only */
    var cols=new Uint16Array(sw*sh),cx,cy,v;
    for(x=0;x<FXW;x++){
      cx=Math.min(sw-1,(x*sw/FXW)|0);
      for(y=0;y<FXH;y++){
        v=lumaAt(d,(y*FXW+x)*4);
        cy=Math.max(0,Math.min(sh-1, ((sh-1)*(1-v/255))|0));
        cols[cy*sw+cx]++;
      }
    }
    var imgS=sctx.createImageData(sw,sh),sd=imgS.data,n,a;
    for(i=0;i<cols.length;i++){
      n=cols[i];
      if(!n)continue;
      a=Math.min(255,40+n*18);
      sd[i*4]=80;sd[i*4+1]=230;sd[i*4+2]=120;sd[i*4+3]=a;
    }
    sctx.putImageData(imgS,0,0);
    scopeCv.hidden=false;
  }else if(scopeCv){scopeCv.hidden=true}
}
function fxTick(ts){
  var need=tools.peak||tools.falsec||tools.zebras||tools.wave;
  if(!need||pulled||env!=='lens'){fxRaf=0;return}
  if(!fxLast||ts-fxLast>90){fxLast=ts;analyseFrame()}
  fxRaf=requestAnimationFrame(fxTick);
}
function applyTools(){
  syncToolButtons();
  document.body.classList.toggle('tool-credits',!!tools.credits);
  analyseFrame();
  var need=tools.peak||tools.falsec||tools.zebras||tools.wave;
  if(need&&!fxRaf)fxRaf=requestAnimationFrame(fxTick);
  if(!need&&fxRaf){/* loop self-stops */}
}


function hint(t,ms){var h=document.querySelector('.lab-hint');if(!h){h=el('div','lab-hint gone');document.body.appendChild(h)}
  h.textContent=t;void h.offsetWidth;h.classList.remove('gone');clearTimeout(hintT);hintT=setTimeout(function(){h.classList.add('gone')},ms||4200)}

function setSpill(p,rgb){
  var s=rgb||(p&&p.spill)||[80,90,100];
  document.documentElement.style.setProperty('--spill',s[0]+','+s[1]+','+s[2]);
}

function credits(p){
  var bits=[];
  bits.push('<span class="t">'+esc(num(p.n)+'  '+p.short)+'</span>');
  if(p.role)bits.push('<span class="c">'+esc(p.role)+'</span>');
  (p.credits||[]).forEach(function(c){bits.push('<span class="c">'+esc(c)+'</span>')});
  if(p.meta)bits.push('<span class="c">'+esc(p.meta)+'</span>');
  return bits.join('');
}


function setPullVal(t,opts){
  opts=opts||{};
  t=Math.max(0,Math.min(1,+t||0));
  pull=t;
  document.documentElement.style.setProperty('--pull',t.toFixed(4));
  document.body.style.setProperty('--pull',t.toFixed(4));
  document.body.classList.toggle('pulling',!!opts.live);
  document.body.classList.toggle('eye-room',t>0.08);
  if(t>0.25&&redOpen)setToolbar(false);
  if(!opts.noSize)size();
}
function easePullTo(target,ms){
  ms=ms==null?1000:ms;
  var a=pull,t0=performance.now();
  cancelAnimationFrame(pullEaseT);
  function tick(now){
    var u=Math.min(1,(now-t0)/ms);
    var e=1-Math.pow(1-u,3);
    setPullVal(a+(target-a)*e);
    if(u<1)pullEaseT=requestAnimationFrame(tick);
    else document.body.classList.remove('pulling');
  }
  pullEaseT=requestAnimationFrame(tick);
}

function size(){
  var W=innerWidth,H=innerHeight,land=W>H;
  var p=F[i]||F[0], ar=(p&&p.w&&p.h)?(p.w/p.h):16/9;
  if(env==='lens'){
    /* Photo wins on look: at eye-up the image is ~70% of the short side,
       slightly above centre, in a soft well that is not a visible sharp circle.
       On pull-back the well shrinks toward ~55–57% of the short side (research). */
    var shortSide=Math.min(W,H);
    var imgFrac=0.70-pull*0.28;          /* 70% → 42% */
    var wellFrac=1.05-pull*0.48;         /* 105% → 57% */
    var eye=Math.max(120,Math.round(shortSide*wellFrac));
    document.documentElement.style.setProperty('--eye',eye+'px');
    document.documentElement.style.setProperty('--pull',pull.toFixed(4));
    document.body.style.setProperty('--pull',pull.toFixed(4));
    var maxW=shortSide*imgFrac, maxH=maxW*9/16;
    var gw=maxW, gh=gw/ar;
    if(gh>maxH){gh=maxH;gw=gh*ar}
    gw=Math.round(gw);gh=Math.round(gh);
    document.documentElement.style.setProperty('--gw',gw+'px');
    document.documentElement.style.setProperty('--gh',gh+'px');
    document.documentElement.style.setProperty('--radius',Math.round(gw*0.07)+'px');
    var shift=land?(-1.6+pull*0.6):(-2.8+pull*1.0);
    document.documentElement.style.setProperty('--eye-shift',shift.toFixed(2)+'vh');
    return;
  }
  var maxW=land?Math.min(W*0.72, 1040):Math.min(W*0.86, 820);
  var maxH=land?H*0.62:H*0.42;
  var gw=maxW, gh=gw/ar;
  if(gh>maxH){gh=maxH;gw=gh*ar}
  document.documentElement.style.setProperty('--gw',Math.round(gw)+'px');
  document.documentElement.style.setProperty('--gh',Math.round(gh)+'px');
}

function fill(p,opts){
  opts=opts||{};
  still.alt=p.masked?'':p.title;
  still.width=p.w||720;still.height=p.h||405;
  var stock=$('stock');
  var held=stock.querySelector('.held');
  if(p.masked||!p.poster){
    still.removeAttribute('src');still.style.display='none';
    stock.classList.add('masked');
    if(!held){held=el('div','held');stock.insertBefore(held,stock.firstChild)}
    held.textContent=p.short||p.title;
    var bloomM=$('bloom');if(bloomM)bloomM.style.backgroundImage='none';
  }else{
    still.style.display='';
    stock.classList.remove('masked');
    if(held)held.remove();
    if(still.getAttribute('src')!==p.poster){still.src=p.poster}
    var bloom=$('bloom');
    if(bloom){bloom.style.backgroundImage=p.poster?'url("'+p.poster+'")':'none'}
  }
  edge.innerHTML=credits(p);
  var rc=$('redCredits');
  if(rc)rc.innerHTML=credits(p);
  setSpill(p);
  if(!opts.keepVideo){
    stopPlay(true);
    vid.removeAttribute('src');
    try{vid.load()}catch(e){}
  }
  markBin();
  size();
  if(still.complete&&still.naturalWidth)applyTools();
  else still.addEventListener('load',applyTools,{once:true});
}

function stopPlay(silent){
  playing=false;
  document.body.classList.remove('playing');
  if(!silent)document.body.classList.remove('exposed');
  try{vid.pause()}catch(e){}
  if(spillRaf){cancelAnimationFrame(spillRaf);spillRaf=0}
  syncToolButtons();
}

function sampleSpill(){
  if(!playing||!vid.videoWidth)return;
  try{
    if(!sampleCv){sampleCv=document.createElement('canvas');sampleCv.width=24;sampleCv.height=14;sampleCtx=sampleCv.getContext('2d',{willReadFrequently:true})}
    sampleCtx.drawImage(vid,0,0,24,14);
    var d=sampleCtx.getImageData(0,0,24,14).data,r=0,g=0,b=0,n=24*14;
    for(var k=0;k<d.length;k+=4){r+=d[k];g+=d[k+1];b+=d[k+2]}
    setSpill(F[i],[r/n|0,g/n|0,b/n|0]);
  }catch(e){}
}
function spillLoop(){
  if(!playing){spillRaf=0;return}
  sampleSpill();
  spillRaf=requestAnimationFrame(spillLoop);
}

function play(){
  var p=F[i];if(!p||pulled||busy)return;
  document.body.classList.add('exposed');
  if(!p.hasVideo||!p.video){
    playing=false;
    document.body.classList.remove('playing');
    hint('this one holds as a frame — a clip is not in this draft', 3200);
    return;
  }
  if(vid.getAttribute('src')!==p.video){vid.src=p.video}
  vid.muted=false;
  var go=vid.play();
  if(go&&go.catch)go.catch(function(){vid.muted=true;vid.play().catch(function(){})});
  playing=true;
  document.body.classList.add('playing');
  if(!spillRaf)spillRaf=requestAnimationFrame(spillLoop);
  syncToolButtons();
  applyTools();
}

vid.addEventListener('ended',function(){
  stopPlay(true);
  document.body.classList.add('exposed');
});

function showSmear(from,to){
  if(to&&to.poster){smear.style.backgroundImage='url("'+to.poster+'")';document.body.classList.add('smearing')}
  else{smear.style.backgroundImage='none'}
}
function hideSmear(){document.body.classList.remove('smearing')}

function shutterClose(ms){
  document.body.classList.add('shutter-closed');
  document.body.classList.remove('shutter-mid');
  return new Promise(function(res){setTimeout(res,ms)})
}
function shutterOpen(ms){
  document.body.classList.remove('shutter-closed','shutter-mid');
  return new Promise(function(res){setTimeout(res,ms)})
}

function go(n, how){
  n=Math.max(0,Math.min(F.length-1,n));
  if(n===i&&!how)return Promise.resolve();
  var speed=(how&&how.speed!=null)?how.speed:0.7;
  var wantSmear=(how&&how.smear)||speed<0.35;
  var instant=how&&how.instant;
  if(instant){
    i=n;fill(F[i]);hideSmear();document.body.classList.remove('shutter-closed','shutter-mid','advancing');
    return Promise.resolve();
  }
  if(busy)return Promise.resolve();
  busy=true;
  var next=F[n];
  var closeMs=speed>0.65?70:speed>0.35?160:Math.round(280+ (1-speed)*260);
  var openMs=speed>0.65?80:speed>0.35?180:320;
  document.body.classList.add('advancing');
  if(wantSmear)showSmear(F[i],next);
  return shutterClose(closeMs).then(function(){
    stopPlay(true);
    i=n;fill(F[i]);
    if(wantSmear){/* keep smear a beat into the new frame */ }
    return shutterOpen(openMs);
  }).then(function(){
    hideSmear();
    document.body.classList.remove('advancing');
    busy=false;
  }).catch(function(){busy=false;hideSmear();document.body.classList.remove('shutter-closed','advancing')});
}

function midShutter(){
  var p=F[i], n=F[Math.min(F.length-1,i+1)]||p;
  showSmear(p,n);
  document.body.classList.add('shutter-mid','advancing','smearing');
  document.body.classList.remove('shutter-closed');
}

/* ---------- bin (step out of the eyepiece onto the monitor grid) ---------- */
function colCount(){return (innerWidth<720)?3:(innerWidth<1100?4:5)}
var cells=[];
function buildBin(){
  rowsE.innerHTML='';cells=[];
  var cols=colCount();
  rowsE.style.setProperty('--cols',cols);
  F.forEach(function(p,idx){
    var b=el('button','cell');b.type='button';b.dataset.i=idx;
    b.setAttribute('aria-label',p.title);
    var win=el('span','win');
    if(p.masked||!p.poster){
      win.appendChild(el('span','held',esc(p.short||p.title)));
    }else{
      var im=new Image();im.alt='';im.decoding='async';im.src=p.poster;im.width=p.w;im.height=p.h;
      win.appendChild(im);
      if(p.hasVideo&&p.video){
        var v=document.createElement('video');
        v.setAttribute('muted','');v.muted=true;v.loop=true;v.playsInline=true;
        v.setAttribute('playsinline','');v.preload='none';v.dataset.src=p.video;
        win.appendChild(v);
      }
      win.appendChild(el('span','g'));
    }
    b.appendChild(win);
    b.appendChild(el('span','no',esc(num(p.n)+'  '+p.short)));
    rowsE.appendChild(b);cells.push(b);
  });
  markBin();
}
function markBin(){
  cells.forEach(function(c,idx){c.classList.toggle('cur',idx===i)});
}
function scrollCur(){
  var c=cells[i];if(c)c.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});
}

var io=null;
function watchBinMotion(){
  if(io)io.disconnect();
  io=new IntersectionObserver(function(ents){
    ents.forEach(function(en){
      var cell=en.target, v=cell.querySelector('video');
      if(!v)return;
      if(en.isIntersecting && pulled){
        if(!v.src){v.src=v.dataset.src}
        v.muted=true;
        var p=v.play();if(p&&p.catch)p.catch(function(){});
        cell.classList.add('moving');
      }else{
        try{v.pause()}catch(e){}
        cell.classList.remove('moving');
      }
    });
  },{threshold:.35});
  cells.forEach(function(c){if(c.querySelector('video'))io.observe(c)});
}

function openBin(){
  if(pulled)return;
  stopPlay(true);
  setToolbar(false);
  pulled=true;
  cancelAnimationFrame(pullEaseT);
  setPullVal(Math.max(pull,0.85),{noSize:false});
  bin.hidden=false;
  document.body.classList.remove('entering','exit-mid','pulling');
  document.body.classList.add('leaving');
  binBtn.classList.add('on');
  binBtn.setAttribute('aria-pressed','true');
  back.hidden=false;
  where.textContent='the bin';
  markBin();
  watchBinMotion();
  clearTimeout(leaveT);
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      document.body.classList.add('pulled');
    });
  });
  requestAnimationFrame(function(){scrollCur()});
  hint('tap a film, or close your fingers, to look back through the eyepiece', 3600);
}
function closeBin(){
  if(!pulled)return;
  pulled=false;
  document.body.classList.remove('pulled','exit-mid');
  document.body.classList.add('entering');
  document.body.classList.remove('leaving','pulling','eye-room');
  cancelAnimationFrame(pullEaseT);
  setPullVal(0,{noSize:false});
  binBtn.classList.remove('on');
  binBtn.setAttribute('aria-pressed','false');
  back.hidden=true;
  where.textContent=envLabel();
  if(io){io.disconnect();io=null}
  cells.forEach(function(c){
    var v=c.querySelector('video');
    if(v){try{v.pause()}catch(e){}c.classList.remove('moving')}
  });
  clearTimeout(leaveT);
  leaveT=setTimeout(function(){
    if(!pulled){
      bin.hidden=true;
      document.body.classList.remove('leaving','entering');
    }
  },1150);
  fill(F[i],{keepVideo:false});
}

/* aliases kept for any earlier capture helpers */
var openStrip=openBin, closeStrip=closeBin;

/* ---------- gestures ---------- */
var gcool=0;
function fire(fn){var n=Date.now();if(n<gcool||!fn)return;gcool=n+800;fn()}
function pinch(node,o){
  var d0=0,done=false;
  function dist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
  node.addEventListener('touchstart',function(e){if(e.touches.length===2){d0=dist(e.touches);done=false;if(e.cancelable)e.preventDefault()}},{passive:false});
  node.addEventListener('touchmove',function(e){if(e.touches.length!==2||!d0)return;if(e.cancelable)e.preventDefault();if(done)return;var r=dist(e.touches)/d0;
    if(r>1.28){done=true;fire(o.out)}else if(r<0.78){done=true;fire(o.in)}},{passive:false});
  node.addEventListener('touchend',function(e){if(e.touches.length<2)d0=0},{passive:true});
  var acc=0,cool=0;
  node.addEventListener('wheel',function(e){if(!e.ctrlKey)return;e.preventDefault();var now=Date.now();if(now<cool)return;acc+=e.deltaY;
    if(acc<-40){acc=0;cool=now+700;fire(o.out)}else if(acc>40){acc=0;cool=now+700;fire(o.in)}},{passive:false});
}
['gesturestart','gesturechange','gestureend'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});

var dr=null;
room.addEventListener('pointermove',function(e){
  if(env!=='lens'||pulled)return;
  if(e.pointerType==='touch'&&!e.isPrimary)return;
  var nx=(e.clientX/Math.max(1,innerWidth))*2-1;
  var ny=(e.clientY/Math.max(1,innerHeight))*2-1;
  document.documentElement.style.setProperty('--hx',nx.toFixed(3));
  document.documentElement.style.setProperty('--hy',ny.toFixed(3));
});
room.addEventListener('pointerdown',function(e){
  if(e.target.closest('.console, .lab-top, .cell, .cam-btn, .red-bar'))return;
  dr={x:e.clientX,y:e.clientY,t:Date.now(),m:false,vx:0,lx:e.clientX,lt:Date.now(),id:e.pointerId};
  try{room.setPointerCapture(e.pointerId)}catch(x){}
});
room.addEventListener('pointermove',function(e){
  if(!dr)return;
  var dx=e.clientX-dr.x;
  if(Math.abs(dx)>8)dr.m=true;
  var now=Date.now();
  dr.vx=(e.clientX-dr.lx)/Math.max(1,now-dr.lt);
  dr.lx=e.clientX;dr.lt=now;
  if(pulled)return;
  if(dr.m && !busy){
    var dir=dx<0?1:-1;
    var nxt=Math.max(0,Math.min(F.length-1,i+dir));
    if(nxt!==i){
      var span=Math.min(1,Math.abs(dx)/(innerWidth*.42));
      if(span>0.18){showSmear(F[i],F[nxt]);document.body.classList.add('shutter-mid')}
    }
  }
});
room.addEventListener('pointerup',function(e){
  if(!dr)return;
  var dx=e.clientX-dr.x, dt=Math.max(1,Date.now()-dr.t);
  var speed=Math.min(1, Math.abs(dr.vx)*1.1 + Math.abs(dx)/Math.max(180,dt));
  if(pulled){dr=null;hideSmear();document.body.classList.remove('shutter-mid');return}
  if(dr.m){
    var dir=dx<0?1:-1;
    var nxt=i+dir;
    if(nxt!==i && nxt>=0 && nxt<F.length){
      var smearOn=speed<0.38 || (Math.abs(dx)>80 && speed<0.55);
      go(nxt,{speed:speed,smear:smearOn});
    }else{
      hideSmear();document.body.classList.remove('shutter-mid');
    }
  }else{
    hideSmear();document.body.classList.remove('shutter-mid');
    var node=document.elementFromPoint(e.clientX,e.clientY);
    if(node&&node.closest('.red-bar, .console, .lab-top, .cam-btn')){
      /* toolbar / chrome handle their own clicks */
    }else if(env==='lens'&&node&&node.closest('.gate-assembly, .gate, .stock, .evf, .red-fx, .red-guides, .red-credits, .red-scope')){
      setToolbar(!redOpen);
    }else if(env==='lens'&&node&&!node.closest('.console, .lab-top, .bin')){
      var r=$('evf').getBoundingClientRect();
      var cx=e.clientX,cy=e.clientY;
      if(cx>r.left-20&&cx<r.right+20&&cy>r.top-20&&cy<r.bottom+20)setToolbar(!redOpen);
    }else if(env!=='lens'&&node&&node.closest('.gate-assembly, .gate, .stock, .evf')){
      if(playing){stopPlay(false)}else play();
    }
  }
  dr=null;
});
room.addEventListener('pointercancel',function(){dr=null;hideSmear();document.body.classList.remove('shutter-mid')});

var wt=0;
room.addEventListener('wheel',function(e){
  if(e.ctrlKey||pulled)return;
  e.preventDefault();
  var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  clearTimeout(wt);
  var acc=(room._acc||0)+d;
  room._acc=acc;
  wt=setTimeout(function(){
    var step=acc>20?1:acc<-20?-1:0;
    room._acc=0;
    if(step)go(i+step,{speed:.7});
  },80);
},{passive:false});

/* Continuous, user-driven pull-back on the eyepiece. Nothing moves unless
   the user pinches. It stays where they let go; past 60% it eases the rest
   of the way to the room view. A further pinch out from the room view steps
   out to the bin. Motion is the same with Reduce Motion on. */
function touchDist(touches){return Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY)}
room.addEventListener('touchstart',function(e){
  if(e.touches.length!==2)return;
  pDist0=touchDist(e.touches);pullFrom=pull;pulling=true;wantBin=false;
  cancelAnimationFrame(pullEaseT);
  document.body.classList.add('pulling');
  if(e.cancelable)e.preventDefault();
},{passive:false});
room.addEventListener('touchmove',function(e){
  if(!pulling||e.touches.length!==2||!pDist0)return;
  if(e.cancelable)e.preventDefault();
  var r=touchDist(e.touches)/pDist0;
  if(pulled){
    if(r<0.78){pulling=false;fire(closeBin)}
    return;
  }
  if(env!=='lens')return;
  if(pullFrom>=0.97 && r>1.22){wantBin=true;return}
  wantBin=false;
  setPullVal(pullFrom+(r-1)*1.15,{live:true});
},{passive:false});
room.addEventListener('touchend',function(e){
  if(e.touches.length>=2)return;
  if(!pulling){pDist0=0;return}
  pulling=false;
  document.body.classList.remove('pulling');
  if(pulled){pDist0=0;return}
  if(wantBin&&pull>=0.95){wantBin=false;pDist0=0;openBin();return}
  if(pull>=0.6&&pull<1)easePullTo(1,1000);
  pDist0=0;
},{passive:true});
room.addEventListener('touchcancel',function(){
  pulling=false;document.body.classList.remove('pulling');pDist0=0;
},{passive:true});
/* trackpad pinch (ctrl+wheel): same mapping as before — negative is out / pull back */
room.addEventListener('wheel',function(e){
  if(!e.ctrlKey)return;
  e.preventDefault();
  if(pulled){
    var acc=(room._pacc||0)+e.deltaY;room._pacc=acc;
    if(acc>40){room._pacc=0;fire(closeBin)}
    return;
  }
  if(env!=='lens')return;
  cancelAnimationFrame(pullEaseT);
  document.body.classList.add('pulling');
  /* deltaY < 0 is pinch-out / zoom-in on the existing mapping (open bin) */
  setPullVal(pull+(-e.deltaY)*0.0035,{live:true});
  clearTimeout(pullWheelT);
  pullWheelT=setTimeout(function(){
    document.body.classList.remove('pulling');
    if(pull>=0.6&&pull<1)easePullTo(1,1000);
    else if(pull>=0.99){/* stay in room view; a later spread opens the bin */}
  },140);
},{passive:false});
/* A second ctrl+wheel spread once already at the room view opens the bin. */
var binFromRoomAcc=0;
room.addEventListener('wheel',function(e){
  if(!e.ctrlKey||pulled||env!=='lens'||pull<0.97){if(!e.ctrlKey)binFromRoomAcc=0;return}
  binFromRoomAcc+=-e.deltaY;
  if(binFromRoomAcc>80){binFromRoomAcc=0;fire(openBin)}
},{passive:false});

/* keyboard + / - still step out to the bin / back in, as before */

rowsE.addEventListener('click',function(e){
  var b=e.target.closest('.cell');if(!b)return;
  var n=+b.dataset.i;
  closeBin();
  go(n,{instant:true});
});

binBtn.addEventListener('click',function(){if(pulled)closeBin();else openBin()});
back.addEventListener('click',function(){if(pulled)closeBin()});
$('top').querySelector('.sig').addEventListener('click',function(e){
  if(pulled){e.preventDefault();closeBin()}
});

/* tactile press + brief haptic on camera-body buttons */
document.addEventListener('pointerdown',function(e){
  var b=e.target.closest('.cam-btn');if(!b)return;
  b.classList.add('pressed');
  haptic();
},true);
function clearPress(e){
  var b=e.target.closest?e.target.closest('.cam-btn'):null;
  if(b)b.classList.remove('pressed');
  document.querySelectorAll('.cam-btn.pressed').forEach(function(n){n.classList.remove('pressed')});
}
document.addEventListener('pointerup',clearPress,true);
document.addEventListener('pointercancel',clearPress,true);
document.addEventListener('pointerleave',function(e){
  if(e.target&&e.target.classList&&e.target.classList.contains('cam-btn'))e.target.classList.remove('pressed');
},true);

var ENV_WHERE={lens:'lens room'}; /* the lens room is the only film room (monitor, theatre and colour suite removed 2026-11-12) */
function envLabel(){return pulled?'the bin':(ENV_WHERE[env]||'lens room')}
function setEnv(name){
  if(!ENV_WHERE[name])name='lens';
  env=name;
  document.body.classList.remove('env-lens');
  document.body.classList.add('env-'+env);
  var nav=$('envs');
  if(nav){[].forEach.call(nav.querySelectorAll('button'),function(b){
    var on=b.getAttribute('data-env')===env;b.setAttribute('aria-pressed',on);b.classList.toggle('on',on);
  })}
  if(!pulled)where.textContent=envLabel();
  if(env!=='lens')setToolbar(false);
  size();
  applyTools();
}
/* no room switcher: the lens room is the only film room */
function setBtn(id,on){var b=$(id);if(!b)return;b.setAttribute('aria-pressed',!!on);b.classList.toggle('on',!!on)}
$('weaveBtn').addEventListener('click',function(){
  weaveOn=!weaveOn;document.body.classList.toggle('weaving',weaveOn);setBtn('weaveBtn',weaveOn);
});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-tool]');if(!b)return;
  e.preventDefault();
  toolOn(b.getAttribute('data-tool'));
});
var playBtn=$('playBtn');
if(playBtn)playBtn.addEventListener('click',function(e){
  e.preventDefault();e.stopPropagation();
  if(playing)stopPlay(false);else play();
  syncToolButtons();
});
/* Reduce Motion: weave stays off until someone turns it on. Other motion is unchanged. */
if(reduce){weaveOn=false;document.body.classList.remove('weaving')}

document.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'){if(pulled){i=Math.min(F.length-1,i+1);markBin();scrollCur()}else go(i+1,{speed:.75});e.preventDefault()}
  else if(e.key==='ArrowLeft'){if(pulled){i=Math.max(0,i-1);markBin();scrollCur()}else go(i-1,{speed:.75});e.preventDefault()}
  else if(e.key==='Enter'||e.key===' '){
    if(pulled){closeBin();go(i,{instant:true})}
    else {if(playing)stopPlay(false);else play()}
    e.preventDefault();
  }else if(e.key==='Escape'){if(pulled)closeBin();else if(playing)stopPlay(false)}
  else if(e.key==='='||e.key==='+'){if(!pulled)openBin()}
  else if(e.key==='-'||e.key==='_'){if(pulled)closeBin()}
});

addEventListener('resize',function(){size();var c=colCount();if(String(c)!==rowsE.style.getPropertyValue('--cols'))buildBin()});

/* start on the first film that has a cleared clip, so the payoff is ready, without changing list order for the bin */
var start=0;
for(var s=0;s<F.length;s++){if(F[s].hasVideo){start=s;break}}
i=start;
loadTools();
buildBin();
fill(F[i]);
setEnv('lens');
setToolbar(false);
setPullVal(0);
size();
applyTools();
hint('you are looking through the eyepiece · tap the screen for the monitor tools · swipe to change films · spread your fingers to step back', 5600);

window.__lens={
  go:function(n,how){return go(n,how||{instant:!!how&&how.instant,speed:(how&&how.speed)||.7})},
  play:play,stop:function(){stopPlay(false)},
  openStrip:openBin,closeStrip:closeBin,
  openBin:openBin,closeBin:closeBin,
  shutterMid:midShutter,
  exitMid:function(){
    stopPlay(true);
    setToolbar(false);
    bin.hidden=false;
    document.body.classList.add('leaving','exit-mid');
    document.body.classList.remove('pulled','entering');
    binBtn.classList.add('on');
    binBtn.setAttribute('aria-pressed','true');
    back.hidden=false;
    where.textContent='the bin';
    markBin();
  },
  setEnv:setEnv,
  setFocus:function(){},
  setWeave:function(on){weaveOn=!!on;document.body.classList.toggle('weaving',weaveOn);setBtn('weaveBtn',weaveOn)},
  setTool:function(name,on){toolOn(name,on)},
  setPull:function(t,how){
    cancelAnimationFrame(pullEaseT);
    if(how&&how.ease)easePullTo(t,how.ms||1000);
    else setPullVal(t);
  },
  pull:function(){return pull},
  setToolbar:setToolbar,
  tools:function(){return Object.assign({},tools)},
  toolbarOpen:function(){return redOpen},
  pos:function(){return i},F:F,pulled:function(){return pulled},playing:function(){return playing},
  fill:fill
};
})();
