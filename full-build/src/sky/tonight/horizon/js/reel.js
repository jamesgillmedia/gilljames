/* Horizon film room · reel v2 (Amy Currell's filmstrip reel, adapted; our own code).
 One continuous strip of REEL_ITEMS (201 motion clips cut from the 35 films at their own shot lengths)
 sits on a rail along the bottom under a piece of glass. The item under the centre line is the picture, hard cut.
 Drift: the strip glides on its own (Gill, Nov 12 2026, 2:34 AM: approved exception for this strip only).
 speed under the line = 1 / dwell, dwell = that clip's own length (min 1.5 s, so short clips loop once or twice).
 Drift stops while you drag, while paused or stopped, and eases back in over ~1.2 s.
 Transport: tap the picture = play / pause. The dial: centre play/pause, stop, ff (2x/4x/8x), prev/next, ring detents step clips.
 Viewing modes (keys 1-4, remembered): full screen · true format · cropped (2.39:1) · contact sheet. Side-drop removed; no fifth mode.
 Everything except the rail fades out ~2.8 s after the last interaction; any pointer, touch, key or focus brings it back.
 Pinch-in (ctrl+wheel, Z, +) opens the stills-zoom index on this film; pinch-out there comes back to the reel. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var ITEMS=window.REEL_ITEMS||[], N=ITEMS.length;
var MODE_KEY='gj-horizon-reel2-mode', POS_KEY='gj-horizon-reel2-pos', ZOOM_SRC='../stills/index.html';
var MODES=['full','true','crop','sheet'], MODE_LBL={full:'full',true:'true',crop:'2.39',sheet:'sheet'};
var IDLE_MS=2800, MIN_DWELL=1.5, RAMP_MS=1200;

function pad(n){n=String(n);while(n.length<3)n='0'+n;return n}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function wrap(v){return ((v%N)+N)%N}
function dwell(i){var it=ITEMS[i];return Math.max(MIN_DWELL,(it&&it.dur)||2)}

var root=null, stage, poster, vids=[], vcur=0, track, lipT, lipN, lipS, deck, bank, sheetQ, hintE;
var p=0.02, cur=-1, raf=0, last=0, tween=null, drag=null, wheelT=0, wheeling=false, dead=true;
var tx='play', rate=1, ramp=1, rampT0=0, jogRot=0, mode='full', idleT=0, loadT=0, TW=30, fsByUs=false;

/* ---------- build ---------- */
function keyHTML(m,i){
  return '<button type="button" class="hw hw-mode" data-mode="'+m+'" aria-pressed="false" aria-label="view '+(i+1)+': '+
    ({full:'full screen',true:'true format',crop:'cropped to 2.39',sheet:'contact sheet'})[m]+'">'+
    '<i class="tally" aria-hidden="true"></i><span class="num" aria-hidden="true">'+(i+1)+'</span><span class="lbl" aria-hidden="true">'+MODE_LBL[m]+'</span></button>';
}
function ensure(){
  if(root)return;
  root=document.createElement('div');
  root.className='hr';root.id='reel';
  root.setAttribute('role','region');root.setAttribute('aria-label','film reel');
  root.innerHTML=
    '<div class="hr-st" tabindex="0" aria-label="the picture: tap to play or pause, drag sideways to scrub">'+
      '<div class="hr-frame"><img class="hr-po" alt="" decoding="async"><video class="hr-v" muted playsinline loop preload="metadata"></video><video class="hr-v" muted playsinline loop preload="metadata"></video></div></div>'+
    '<div class="hr-fade hr-top"><button type="button" class="hr-x" aria-label="back to horizon">‹</button>'+
      '<button type="button" class="hr-q" aria-label="contact sheet for this film">contact sheet</button></div>'+
    '<p class="hr-fade hr-hint" aria-hidden="true"><span class="t-touch">drag the glass to scrub · tap the picture to pause</span><span class="t-desk">drag the glass or scroll to scrub · space pauses · 1–4 views</span></p>'+
    '<div class="hr-fade hr-deck" aria-label="camera controls">'+
      '<div class="hr-bank" role="group" aria-label="viewing mode"><span class="engr">view</span><div class="keys">'+MODES.map(keyHTML).join('')+'</div></div>'+
      '<div class="transport" role="group" aria-label="transport">'+
        '<div class="jog" aria-hidden="true"><i class="jog-knurl"></i><i class="jog-notch"></i></div>'+
        '<button type="button" class="hw tx tx-stop" data-tx="stop" aria-label="stop"><i class="sym" aria-hidden="true"></i></button>'+
        '<button type="button" class="hw tx tx-prev" data-tx="prev" aria-label="previous clip"><i class="sym" aria-hidden="true"></i></button>'+
        '<button type="button" class="hw tx tx-next" data-tx="next" aria-label="next clip"><i class="sym" aria-hidden="true"></i></button>'+
        '<button type="button" class="hw tx tx-ff" data-tx="ff" aria-pressed="false" aria-label="fast forward"><i class="sym" aria-hidden="true"></i></button>'+
        '<button type="button" class="hw hw-play" data-tx="toggle" aria-pressed="true" aria-label="play or pause"><i class="tally" aria-hidden="true"></i><i class="sym" aria-hidden="true"></i></button>'+
      '</div></div>'+
    '<div class="hr-rail" aria-label="filmstrip: drag across the glass to scrub">'+
      '<div class="hr-lip"><span class="t" aria-live="polite"></span><span class="s"></span><span class="n"></span></div>'+
      '<div class="hr-slot"><div class="hr-tr"></div><i class="hr-glass" aria-hidden="true"></i><i class="hr-line" aria-hidden="true"></i></div>'+
    '</div>';
  document.body.appendChild(root);
  stage=root.querySelector('.hr-st');poster=root.querySelector('.hr-po');vids=[].slice.call(root.querySelectorAll('.hr-v'));
  track=root.querySelector('.hr-tr');lipT=root.querySelector('.hr-lip .t');lipN=root.querySelector('.hr-lip .n');lipS=root.querySelector('.hr-lip .s');
  deck=root.querySelector('.hr-deck');bank=root.querySelector('.hr-bank');sheetQ=root.querySelector('.hr-q');hintE=root.querySelector('.hr-hint');
  vids.forEach(function(v,k){v.muted=true;v.defaultMuted=true;v.setAttribute('aria-hidden','true');
    v.addEventListener('playing',function(){if(k===vcur&&v.dataset.i==String(cur))v.classList.add('on')});
    v.addEventListener('error',function(){v.classList.remove('on')});
  });
  buildStrip();
  /* first tap on a faded control only reveals it */
  var wasIdle=false;
  root.addEventListener('pointerdown',function(e){wasIdle=root.classList.contains('idle');wake()},true);
  root.addEventListener('click',function(e){
    if(wasIdle&&e.target.closest('.hr-fade')){e.preventDefault();e.stopPropagation()}wasIdle=false;
  },true);
  root.querySelector('.hr-x').addEventListener('click',function(e){e.preventDefault();closeReel()});
  sheetQ.addEventListener('click',function(e){e.preventDefault();openFilmSheet()});
  bank.addEventListener('click',function(e){var b=e.target.closest('[data-mode]');if(b){press(b);setMode(b.getAttribute('data-mode'),true)}});
  root.querySelectorAll('[data-tx]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();press(b);txDo(b.getAttribute('data-tx'))})});
  jogSetup();
  stage.addEventListener('pointerdown',onDown);
  root.querySelector('.hr-slot').addEventListener('pointerdown',onDown);
  addEventListener('pointermove',onMove,{passive:true});
  addEventListener('pointerup',onUp);addEventListener('pointercancel',onUp);
  root.addEventListener('pointermove',wake,{passive:true});
  root.addEventListener('focusin',wake);
  root.addEventListener('wheel',onWheel,{passive:false});
  document.addEventListener('keydown',onKey);
  document.addEventListener('fullscreenchange',function(){root.classList.toggle('fs',!!document.fullscreenElement);if(!document.fullscreenElement)fsByUs=false;relayout()});
  addEventListener('resize',relayout);
  LAB.pinch(stage,{in:function(){openZoom()},out:function(){closeReel()}});
}
function press(b){b.classList.add('pressed');setTimeout(function(){b.classList.remove('pressed')},120);if(navigator.vibrate)try{navigator.vibrate(6)}catch(e){}}
function buildStrip(){
  var h='';
  for(var c=0;c<3;c++)for(var i=0;i<N;i++){
    var it=ITEMS[i],first=i===0||ITEMS[i-1].slug!==it.slug;
    h+='<b class="'+(first?'f0':'')+'" data-i="'+i+'" style="--ax:'+it.ax+';--ay:'+it.ay+'"></b>';
  }
  track.innerHTML=h;
}
function relayout(){
  if(!root)return;
  TW=parseFloat(getComputedStyle(root).getPropertyValue('--tw'))||30;
  place();
}

/* ---------- picture ---------- */
/* tonight/media/film/, from this file (../../media/film/). The horizon page sees ../media/film/. */
var FILM=(function(){
  function rel(fromHref,toHref){
    var from=new URL(fromHref),to=new URL(toHref);
    if(from.origin!==to.origin)return to.href;
    var a=from.pathname.split('/').filter(Boolean),b=to.pathname.split('/').filter(Boolean),i=0,up=[];
    while(i<a.length&&i<b.length&&a[i]===b[i])i++;
    for(var n=i;n<a.length;n++)up.push('..');
    return (up.concat(b.slice(i)).join('/')||'.')+'/';
  }
  var el=document.currentScript,src=el&&el.src;
  if(!src)return '../media/film/';
  try{return rel(new URL('.',location.href).href,new URL('../../media/film/',src).href)}
  catch(e){return '../media/film/'}
})();
function horizonBase(it){
  var id=it&&it.id||'';
  return /^r\d+$/.test(id)?FILM+'horizon-'+id+'/':'';
}
function horizonPoster(it){
  var base=horizonBase(it);
  return base?base+'loop-480-poster.jpg':(it.poster||'');
}
/* AV1, then VP9, then H.264. Only the shot on screen and the next one are armed. */
function armClip(v,i){
  var it=ITEMS[i];if(!it||!v)return;
  var base=horizonBase(it);
  v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');
  v.playsInline=true;v.loop=true;v.preload='metadata';
  v.removeAttribute('src');
  while(v.firstChild)v.removeChild(v.firstChild);
  if(!base){v.src=it.clip;return}
  v.poster=base+'loop-480-poster.jpg';
  [
    [base+'loop-480.av1.webm','video/webm; codecs="av01.0.04M.08"'],
    [base+'loop-480.webm','video/webm; codecs="vp9"'],
    [base+'loop-480.mp4','video/mp4; codecs="avc1.64001E"']
  ].forEach(function(s){
    var el=document.createElement('source');
    el.src=s[0];el.type=s[1];v.appendChild(el);
  });
  try{v.load()}catch(e){}
}
function setPicture(i){
  var it=ITEMS[i];
  poster.src=horizonPoster(it);poster.alt=it.title+' · clip '+pad(i+1)+' of '+N;
  root.classList.toggle('tall',it.h>it.w);
  vids.forEach(function(v){v.classList.remove('on')});
  lipT.textContent=it.title;lipN.textContent=pad(i+1)+' / '+pad(N);
  var marks=track.children;
  for(var c=0;c<3;c++){var o=marks[c*N+(cur<0?0:cur)];if(o)o.classList.remove('on')}
  for(c=0;c<3;c++){o=marks[c*N+i];if(o)o.classList.add('on')}
  markFilmSheet(i);
}
function loadVideo(i,fromStart){
  var it=ITEMS[i];if(!it)return;
  var v=vids[vcur],o=vids[1-vcur];
  if(o.dataset.i===String(i)){vcur=1-vcur;var t=v;v=o;o=t}
  else if(v.dataset.i!==String(i)){v.dataset.i=String(i);armClip(v,i)}
  o.pause();o.classList.remove('on');
  v.playbackRate=tx==='ff'?rate:1;
  if(fromStart)try{v.currentTime=0}catch(e){}
  if(tx==='play'||tx==='ff'){
    var token=String(i);
    function kick(){
      if(v.dataset.i!==token||(tx!=='play'&&tx!=='ff'))return;
      var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});
    }
    if(v.readyState>=2)kick();
    else v.addEventListener('loadeddata',kick,{once:true});
  }
  else{v.pause()} /* paused / stopped: the poster (the clip's first frame) stands in until it plays */
  if(v.readyState>=3&&!v.paused)v.classList.add('on');
  /* warm the next clip in the other element */
  var nx=wrap(i+1);
  if(o.dataset.i!==String(nx)){o.dataset.i=String(nx);o.preload='metadata';armClip(o,nx)}
}
function show(i,settle){
  if(i===cur)return;
  var prev=cur;setPicture(i);cur=i;
  clearTimeout(loadT);
  if(drag||wheeling){loadT=setTimeout(function(){if(cur===i)loadVideo(i,true)},140)}
  else loadVideo(i,true);
  try{if(!(cur%4))localStorage.setItem(POS_KEY,String(cur))}catch(e){}
}
function place(){
  if(!root||!N)return;
  var w=root.clientWidth;
  track.style.transform='translate3d('+(w/2-(p+N)*TW)+'px,0,0)';
  show(Math.floor(wrap(p)));
}

/* ---------- drift + tweens ---------- */
function loop(t){
  raf=requestAnimationFrame(loop);
  var dt=Math.min(0.1,(t-(last||t))/1000);last=t;
  if(dead)return;
  if(tween){
    var k=Math.min(1,(t-tween.t0)/tween.ms),e=1-Math.pow(1-k,3);
    p=tween.a+(tween.b-tween.a)*e;
    if(k>=1){p=tween.b;tween=null;rampT0=t}
  }else if(!drag&&!wheeling&&(tx==='play'||tx==='ff')){
    var r=clamp((t-rampT0)/RAMP_MS,0,1);ramp=r*r*(3-2*r);
    var i=Math.floor(wrap(p));
    p+=dt*ramp*(tx==='ff'?rate:1)/dwell(i);
  }
  if(p>2*N||p<-N)p=wrap(p);
  place();
}
function glide(to,ms){tween={a:p,b:to,t0:performance.now(),ms:ms||300}}
function step(d){
  var base=Math.floor(p+(tween?0:0));
  if(tween)base=Math.floor(tween.b);
  glide(base+d+0.02,320);jogTurn(d);
}

/* ---------- transport ---------- */
function syncTx(){
  var on=tx==='play'||tx==='ff';
  var pl=root.querySelector('.hw-play');pl.setAttribute('aria-pressed',on?'true':'false');
  var ff=root.querySelector('.tx-ff');ff.setAttribute('aria-pressed',tx==='ff'?'true':'false');ff.setAttribute('aria-label',tx==='ff'?'fast forward '+rate+'×':'fast forward');
  root.querySelector('.tx-stop').classList.toggle('on',tx==='stop');
  lipS.textContent=tx==='ff'?('ff '+rate+'×'):tx==='play'?'play':tx;
  root.setAttribute('data-tx',tx);
}
function txDo(cmd){
  var v=vids[vcur];
  if(cmd==='toggle')cmd=(tx==='play'||tx==='ff')?'pause':'play';
  if(cmd==='play'){tx='play';rate=1;rampT0=performance.now();try{v.playbackRate=1;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}catch(e){}}
  else if(cmd==='pause'){tx='pause';rate=1;try{v.pause();v.playbackRate=1}catch(e){}}
  else if(cmd==='stop'){tx='stop';rate=1;try{v.pause();v.currentTime=0}catch(e){};glide(Math.floor(p)+0.02,240)}
  else if(cmd==='ff'){rate=tx==='ff'?(rate>=8?2:rate*2):2;tx='ff';rampT0=performance.now()-RAMP_MS/2;try{v.playbackRate=rate;var q=v.play();if(q&&q.catch)q.catch(function(){})}catch(e){}}
  else if(cmd==='next')step(1);
  else if(cmd==='prev')step(-1);
  syncTx();
}
function jogTurn(d){jogRot+=d*30;var j=root.querySelector('.jog');if(j)j.style.setProperty('--jog',jogRot+'deg')}
function jogSetup(){
  var tr=root.querySelector('.transport'),j=tr.querySelector('.jog'),st=null;
  function ang(e){var r=tr.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI}
  tr.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;st={a:ang(e),acc:0};try{tr.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();e.stopPropagation()});
  tr.addEventListener('pointermove',function(e){if(!st)return;var a=ang(e),d=a-st.a;if(d>180)d-=360;if(d<-180)d+=360;st.a=a;st.acc+=d;
    j.style.setProperty('--jog',(jogRot+st.acc*.35)+'deg');
    while(st.acc>=30){st.acc-=30;txDo('next');if(navigator.vibrate)try{navigator.vibrate(4)}catch(x){}}
    while(st.acc<=-30){st.acc+=30;txDo('prev');if(navigator.vibrate)try{navigator.vibrate(4)}catch(x){}}});
  function end(){if(!st)return;st=null;j.style.setProperty('--jog',jogRot+'deg')}
  tr.addEventListener('pointerup',end);tr.addEventListener('pointercancel',end);
}

/* ---------- viewing modes ---------- */
function setMode(m,user){
  if(MODES.indexOf(m)<0)m='full';
  if(m==='sheet'){
    if(user||!(fsheet&&fsheet.classList.contains('open')))openFilmSheet();
    paintMode('sheet');try{localStorage.setItem(MODE_KEY,m)}catch(e){}
    return;
  }
  if(fsheet&&fsheet.classList.contains('open')&&LAB.layer.top()==='film sheet')LAB.layer.back();
  mode=m;paintMode(m);
  try{localStorage.setItem(MODE_KEY,m)}catch(e){}
  root.setAttribute('data-mode',m);
  relayout();
}
function paintMode(m){
  root.querySelectorAll('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-mode')===m))});
}

/* ---------- idle fade: everything but the rail ---------- */
function wake(){
  if(!root)return;
  root.classList.remove('idle');
  clearTimeout(idleT);
  idleT=setTimeout(function idle(){
    if(dead)return;
    var a=document.activeElement;
    if(a&&root.contains(a)&&a.closest('.hr-fade')&&a.matches(':focus-visible')){idleT=setTimeout(idle,IDLE_MS);return}
    root.classList.add('idle');
  },IDLE_MS);
}

/* ---------- pointer: tap = play/pause, drag = scrub ---------- */
function onDown(e){
  if(dead||e.button)return;
  if(e.target.closest&&e.target.closest('button,a,input'))return;
  drag={x:e.clientX,y:e.clientY,p0:p,moved:false,glass:!!e.target.closest('.hr-slot'),id:e.pointerId,t0:performance.now(),n:1};
  tween=null;
  if(drag.glass){try{e.target.closest('.hr-slot').setPointerCapture(e.pointerId)}catch(x){}}
}
function onMove(e){
  if(!drag||dead||e.pointerId!==drag.id)return;
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&(drag.glass?Math.abs(dx)>3:(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)))){drag.moved=true;root.classList.add('scrub','seen')}
  if(drag.moved){p=drag.p0-dx/(drag.glass?TW:28);place()}
}
function onUp(e){
  if(!drag||e.pointerId!==drag.id)return;
  var d=drag;drag=null;root.classList.remove('scrub');
  if(d.moved){glide(Math.floor(p)+0.02,260);rampT0=performance.now()+260;if(LAB.patience)LAB.patience.success();return}
  if(e.type==='pointerup'&&!d.glass&&performance.now()-d.t0<450)txDo('toggle');
  else if(e.type==='pointerup'&&d.glass){ /* tap on the glass: jump to that frame */
    var r=root.querySelector('.hr-slot').getBoundingClientRect();
    var off=(e.clientX-(r.left+r.width/2))/TW;
    if(Math.abs(off)>0.5){glide(Math.floor(p+off)+0.02,300)}
  }
  rampT0=performance.now();
}
function onWheel(e){
  if(dead||e.ctrlKey)return;
  if(e.target.closest&&e.target.closest('.fsheet'))return;
  e.preventDefault();wake();
  var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(e.deltaMode===1)d*=32;
  if(!wheeling){wheeling=true;root.classList.add('scrub','seen')}
  tween=null;p+=d/60;place();
  clearTimeout(wheelT);
  wheelT=setTimeout(function(){wheeling=false;root.classList.remove('scrub');glide(Math.floor(p)+0.02,260);if(cur>=0)loadVideo(cur,true)},160);
}
function onKey(e){
  if(dead)return;
  var top=LAB.layer.top();
  if(top!=='reel')return;
  if(e.target&&e.target.closest&&e.target.closest('input,textarea'))return;
  wake();
  var k=e.key;
  if(k===' '||k==='Spacebar'){if(e.target.closest&&e.target.closest('button'))return;e.preventDefault();txDo('toggle')}
  else if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();step(1)}
  else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();step(-1)}
  else if(k==='Escape'){if(document.fullscreenElement)return;e.preventDefault();closeReel()}
  else if(k==='z'||k==='Z'||k==='+'||k==='='){e.preventDefault();openZoom()}
  else if(k==='s'||k==='S'){e.preventDefault();openFilmSheet()}
  else if(k>='1'&&k<='4'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();var b=root.querySelector('[data-mode="'+MODES[+k-1]+'"]');if(b)press(b);setMode(MODES[+k-1],true)}
}

/* ---------- open / close ---------- */
function indexOfSlug(slug){for(var i=0;i<N;i++)if(ITEMS[i].slug===slug)return i;return -1}
function openReel(target){
  if(!N){LAB.hint('no film clips here',2400);return}
  ensure();
  dead=false;
  var i=-1;
  if(typeof target==='number')i=target;
  else if(target&&target.slug)i=indexOfSlug(target.slug);
  if(i<0){try{i=+localStorage.getItem(POS_KEY)||0}catch(e){i=0}}
  p=clamp(i,0,N-1)+0.02;cur=-1;tween=null;drag=null;tx='play';rate=1;rampT0=performance.now()+600;
  var m='full';try{m=localStorage.getItem(MODE_KEY)||'full'}catch(e){}
  if(MODES.indexOf(m)<0)m='full';
  root.classList.remove('seen');root.hidden=false;void root.offsetWidth;root.classList.add('on');
  document.body.classList.add('reel-open');
  if(LAB.layer.top()!=='reel'){
    LAB.layer.push('reel',function(){
      dead=true;clearTimeout(idleT);
      vids.forEach(function(v){try{v.pause()}catch(e){}});
      if(fsByUs&&document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});
      root.classList.remove('on');document.body.classList.remove('reel-open');
      if($('where'))$('where').textContent=(LAB.rooms&&LAB.rooms.current)||'horizon';
      setTimeout(function(){if(!root.classList.contains('on'))root.hidden=true},400);
    });
  }
  setMode(m==='sheet'?'full':m,false);
  if(m==='sheet'){mode='full';setTimeout(function(){openFilmSheet();paintMode('sheet')},60)}
  relayout();syncTx();wake();
  if(!raf)raf=requestAnimationFrame(loop);
  try{stage.focus({preventScroll:true})}catch(e){}
  var h=document.querySelector('.lab-hint');if(h)h.classList.add('gone');
}
function closeReel(){
  if(LAB.layer.top()==='film sheet')LAB.layer.back();
  if(LAB.layer.top()==='reel')LAB.layer.back();
}

/* ---------- this film's contact sheet (view 4 and the quiet button) ---------- */
var fsheet=null,fgrid=null,fphd=null,sheetSlug='';
function ensureSheet(){
  if(fsheet)return;
  fsheet=document.createElement('section');fsheet.className='fsheet hr-sheet';fsheet.id='filmSheet';
  fsheet.setAttribute('aria-label','contact sheet for this film');fsheet.hidden=true;
  fsheet.innerHTML='<button type="button" class="hr-sx" aria-label="back to the reel">‹</button><div class="sc"><div class="proof"><div class="phd"><span class="ju" id="fphd"></span><span class="rt">tap a clip to return</span></div><div class="grid" id="fgrid"></div></div></div>';
  document.body.appendChild(fsheet);
  fgrid=fsheet.querySelector('#fgrid');fphd=fsheet.querySelector('#fphd');
  fsheet.querySelector('.hr-sx').addEventListener('click',function(){leaveSheet(-1)});
  fgrid.addEventListener('click',function(e){var b=e.target.closest('.cell');if(!b)return;leaveSheet(+b.dataset.i)});
  LAB.pinch(fsheet,{in:function(){openZoom()},out:function(){leaveSheet(-1)}});
}
function leaveSheet(i){
  if(LAB.layer.top()==='film sheet')LAB.layer.back();
  if(i>=0){tween=null;p=i+0.02;cur=-1;place()}
  paintMode(mode);try{localStorage.setItem(MODE_KEY,mode)}catch(e){}
  rampT0=performance.now();
}
function markFilmSheet(i){
  if(!fgrid)return;
  for(var k=0;k<fgrid.children.length;k++)fgrid.children[k].classList.toggle('cur',+fgrid.children[k].dataset.i===i);
}
function openFilmSheet(){
  if(dead||cur<0)return;
  ensureSheet();
  var slug=ITEMS[cur].slug,title=ITEMS[cur].title;sheetSlug=slug;
  var cols=innerWidth<520?3:innerWidth<900?4:6;
  fgrid.style.setProperty('--cols',cols);fgrid.innerHTML='';
  var n=0;
  ITEMS.forEach(function(it,i){
    if(it.slug!==slug)return;n++;
    var b=LAB.el('button','cell');b.type='button';b.dataset.i=i;
    b.setAttribute('aria-label','clip '+pad(i+1)+' · '+title+' · '+it.dur.toFixed(1)+' seconds');
    var win=LAB.el('span','win');var im=new Image();im.alt='';im.decoding='async';im.src=it.poster;
    win.appendChild(im);b.appendChild(win);b.appendChild(LAB.el('span','no',pad(i+1)+' · '+it.dur.toFixed(1)+' s'));
    if(i===cur)b.classList.add('cur');fgrid.appendChild(b);
  });
  fphd.textContent=title+' · '+n+' clips';
  fsheet.hidden=false;void fsheet.offsetWidth;fsheet.classList.add('open');document.body.classList.add('fsheet-open');
  paintMode('sheet');
  if(LAB.layer.top()!=='film sheet'){
    LAB.layer.push('film sheet',function(){
      fsheet.classList.remove('open');document.body.classList.remove('fsheet-open');paintMode(mode);
      setTimeout(function(){if(!fsheet.classList.contains('open'))fsheet.hidden=true},500);
      try{stage.focus({preventScroll:true})}catch(e){}
    });
  }
  try{fgrid.querySelector('.cur').focus({preventScroll:false})}catch(e){}
}

/* ---------- stills-zoom index (relative stills-zoom/), read only ---------- */
var zidx=null,zframe=null,zReady=false,zWant=null,zHooked=false;
function ensureZoom(){
  if(zidx)return;
  zidx=document.createElement('div');zidx.className='zidx';zidx.id='zoomIndex';zidx.setAttribute('aria-label','stills index');
  zframe=document.createElement('iframe');zframe.title='stills index';zframe.setAttribute('referrerpolicy','no-referrer');
  zidx.appendChild(zframe);document.body.appendChild(zidx);zframe.addEventListener('load',onZoomLoad);
}
function zoomAPI(){try{return zframe&&zframe.contentWindow&&zframe.contentWindow.__zoom}catch(e){return null}}
function hookZoomLeave(win){
  if(zHooked||!win)return;zHooked=true;
  function atIndex(){var z=zoomAPI();if(!z||!z.get)return false;var g=z.get();return !g.motion&&(g.lod==null||g.lod===0)}
  function leave(){closeZoom()}
  var out=win.document.getElementById('out');
  if(out)out.addEventListener('click',function(e){if(atIndex()){e.preventDefault();e.stopPropagation();leave()}},true);
  win.addEventListener('keydown',function(e){if((e.key==='Escape'||e.key==='-'||e.key==='_')&&atIndex()){e.preventDefault();e.stopPropagation();leave()}},true);
  var d0=0,done=false;
  win.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];d0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);done=false}},{passive:true,capture:true});
  win.addEventListener('touchmove',function(e){if(e.touches.length!==2||!d0||done)return;var a=e.touches[0],b=e.touches[1],r=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/d0;if(r<0.78&&atIndex()){done=true;leave()}},{passive:true,capture:true});
  var acc=0,cool=0;
  win.addEventListener('wheel',function(e){if(!e.ctrlKey)return;var now=Date.now();if(now<cool)return;acc+=e.deltaY;if(acc>40&&atIndex()){acc=0;cool=now+700;leave()}else if(acc<-40)acc=0},{passive:true,capture:true});
}
function flyToFilm(z,slug){
  if(!z)return;
  if(slug&&z.fitFilm){if(z.setView)z.setView('films');setTimeout(function(){z.fitFilm(slug)},240);return}
  if(z.setView)z.setView('all');if(z.home)setTimeout(function(){z.home()},240);
}
function onZoomLoad(){
  var win;try{win=zframe.contentWindow}catch(e){win=null}
  if(!win){LAB.hint('the stills index could not be opened',2800);return}
  var n=0;
  (function tick(){
    var z=zoomAPI(),ready=false;
    try{ready=!!(z&&z.get&&(z.get().box&&z.get().box.w||win.document.querySelector('.cluster,.allfield')))}catch(e){}
    if(ready){zReady=true;hookZoomLeave(win);if(zWant){flyToFilm(z,zWant);zWant=null}return}
    if(++n<100)setTimeout(tick,50);else LAB.hint('the stills index is still loading',2800);
  })();
}
function openZoom(target){
  var slug=(target&&target.slug)||(cur>=0&&ITEMS[cur]?ITEMS[cur].slug:'');
  ensureZoom();
  vids.forEach(function(v){try{v.pause()}catch(e){}});
  zidx.hidden=false;void zidx.offsetWidth;zidx.classList.add('on');document.body.classList.add('zoom-open');
  if(!zframe.getAttribute('src')){zWant=slug;zframe.src=ZOOM_SRC}
  else if(zReady)flyToFilm(zoomAPI(),slug);else zWant=slug;
  if(LAB.layer.top()!=='stills zoom'){
    LAB.layer.push('stills zoom',function(){
      var z=zoomAPI();if(z&&z.stopMotion)try{z.stopMotion()}catch(e){}
      zidx.classList.remove('on');document.body.classList.remove('zoom-open');
      setTimeout(function(){if(!zidx.classList.contains('on'))zidx.hidden=true},400);
      if(!dead&&cur>=0){var c=cur;cur=-1;show(c)}
      if(root)wake();
    });
  }
  if(LAB.patience)LAB.patience.success();
}
function closeZoom(){
  if(LAB.layer.top()==='stills zoom')LAB.layer.back();
  else if(LAB.layer.dropTo)LAB.layer.dropTo(['reel','horizon','darkroom']);
}
document.addEventListener('keydown',function(e){
  var top=LAB.layer.top();
  if(top==='film sheet'&&e.key==='Escape'){e.preventDefault();leaveSheet(-1)}
  else if(top==='film sheet'&&e.key>='1'&&e.key<='4'&&root){e.preventDefault();var m=MODES[+e.key-1];if(m!=='sheet')setMode(m,true)}
},true);

/* Reduce Motion: identical — nothing in the reel reads prefers-reduced-motion. */
LAB.reel={
  open:openReel, close:closeReel,
  isOpen:function(){return !!(root&&root.classList.contains('on')&&!dead)},
  pos:function(){return cur}, mode:function(){return mode}, state:function(){return {tx:tx,rate:rate,p:p,cur:cur,mode:mode,idle:root&&root.classList.contains('idle'),item:ITEMS[cur]}},
  items:ITEMS, setMode:function(m){setMode(m,true)}, tx:txDo
};
LAB.zoomIndex={open:function(t){openZoom(t)},close:closeZoom,isOpen:function(){return !!(zidx&&zidx.classList.contains('on'))},src:ZOOM_SRC};
})();
