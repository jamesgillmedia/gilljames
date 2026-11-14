/* The Demo Reel as a WORK-level stop in the sky: every distinct shot of Reel 2026 and the 2025 Cinematography Demo Reel (GJ_REEL, in order)
 drifts right to left along a filmstrip; the shot under the centre line fills the work. Hard cuts, the still at once, its muted clip when it can play.
 Tap = pause / play. Drag or swipe the picture or the strip = scrub, the frames flip as fast as you move. Fill or fit, remembered.
 Ported from site-v3-pro2 js/reel.js and css/reel.css. It lives in the sky's own #layer (the camera and history are the sky's), not in a page
 of its own, and its motion is the same whatever the Reduce Motion setting is. */
(function(){
'use strict';
var RATE=1.1,TW=40,COLS=16,KEY='gj-reel-fit',EASE='cubic-bezier(.2,.8,.2,1)';
var lastShot=0;
function mount(el,hooks){
  var S=window.GJ_REEL||[];
  var N=S.length;
  if(!N){el.innerHTML='<div class="sheet full"><p>The reel is missing.</p></div>';return {stop:function(){}}}
  var B=hooks.base;
  function pad(n){n=String(n);while(n.length<3)n='0'+n;return n}
  function mod(i){return((i%N)+N)%N}
  function base(i){return B+S[i].f}
  function fitMode(){var m='fill';try{m=localStorage.getItem(KEY)||'fill'}catch(e){}return m==='fit'?'fit':'fill'}
  var root=document.createElement('div');
  root.className='rl';
  root.setAttribute('aria-label','Demo reel, every shot on a moving filmstrip');
  root.innerHTML='<div class="rl-st" tabindex="0"><img class="rl-im" alt="" decoding="sync"></div>'+
    '<div class="rl-ui"><p class="rl-k"><span class="rl-n"></span></p>'+
    '<p class="rl-fit" role="group" aria-label="frame"><button type="button" data-m="fill">fill</button><i>·</i><button type="button" data-m="fit">fit</button></p>'+
    '<p class="rl-b"><b></b><small></small><a class="rl-v" href="#">view film</a></p>'+
    '<p class="rl-h" aria-hidden="true">tap to pause · swipe to flip</p></div>'+
    '<div class="rl-fs" aria-hidden="true"><div class="rl-tr"></div><i class="rl-mk"></i></div>';
  el.innerHTML='';el.appendChild(root);
  var stage=root.querySelector('.rl-st'),img=root.querySelector('.rl-im'),track=root.querySelector('.rl-tr'),ctr=root.querySelector('.rl-n'),
    lab=root.querySelector('.rl-b b'),rsrc=root.querySelector('.rl-b small'),view=root.querySelector('.rl-v'),fitB=root.querySelector('.rl-fit');
  var p=lastShot+.5,cur=-1,playing=true,raf=0,lastT=0,tween=null,drag=null,wheelT=0,wheeling=false,pool=[],stillCache={},dead=false;
  var h='',rows=Math.ceil(N/COLS),i,k;
  for(k=0;k<3;k++)for(i=0;i<N;i++)h+='<b style="background-position:'+(-(i%COLS)*TW)+'px '+(-Math.floor(i/COLS)*TW)+'px"></b>';
  track.innerHTML=h;track.style.setProperty('--bs',(COLS*TW)+'px '+(rows*TW)+'px');
  for(var j=0;j<3;j++){
    var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;
    ['muted','playsinline','webkit-playsinline','disablepictureinpicture'].forEach(function(a){v.setAttribute(a,'')});
    v.setAttribute('aria-hidden','true');v.preload='auto';v.addEventListener('playing',onPlaying);stage.appendChild(v);pool.push({v:v,i:-1});
  }
  function setFit(m){
    root.classList.toggle('fit',m==='fit');
    fitB.querySelectorAll('[data-m]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-m')===m))});
    try{localStorage.setItem(KEY,m)}catch(e){}
  }
  setFit(fitMode());
  function still(n){if(!stillCache[n]){var im=new Image();im.decoding='async';im.src=base(n)+'.webp';stillCache[n]=im}return stillCache[n]}
  function vidFor(n,make){
    for(var q=0;q<pool.length;q++)if(pool[q].i===n)return pool[q];
    if(!make)return null;
    var best=null,bd=-1;
    pool.forEach(function(o){var d=o.i<0?1e9:Math.abs(((o.i-cur)%N+N)%N);if(o.i===mod(cur))d=-2;if(d>bd){bd=d;best=o}});
    best.i=n;best.v.classList.remove('on');best.v.src=base(n)+'.mp4';try{best.v.load()}catch(e){}
    return best;
  }
  function onPlaying(e){var o=pool.filter(function(q){return q.v===e.target})[0];if(o&&o.i===mod(cur)&&!busy())o.v.classList.add('on')}
  function busy(){return !!(drag&&drag.moved)||wheeling}
  function playCur(){
    if(dead)return;
    var n=mod(cur),q=vidFor(n,true);
    pool.forEach(function(o){if(o!==q){o.v.classList.remove('on');if(!o.v.paused)o.v.pause()}});
    if(q.v.readyState>=2&&!q.v.paused)q.v.classList.add('on');
    var pr=q.v.play();if(pr&&pr.catch)pr.catch(function(){});
  }
  function quiet(){pool.forEach(function(o){o.v.classList.remove('on');if(!o.v.paused)o.v.pause()})}
  function show(n){
    n=mod(n);if(n===mod(cur)&&cur>=0)return;
    var prev=cur;cur=n;lastShot=n;
    img.src=still(n).src;
    root.classList.toggle('tall',S[n].h>S[n].w);
    ctr.textContent=pad(n+1)+' / '+pad(N);
    var s=S[n];lab.textContent=s.b||'';rsrc.textContent=hooks.title||'Demo Reel';
    root.classList.toggle('nob',!s.b);root.classList.toggle('nol',s.l==null||!hooks.film(s.l));
    for(var a=1;a<=4;a++)still(mod(n+a));still(mod(n-1));
    var marks=track.children,c;
    if(prev>=0)for(c=0;c<3;c++){var o=marks[c*N+mod(prev)];if(o)o.classList.remove('on')}
    for(c=0;c<3;c++){var m=marks[c*N+n];if(m)m.classList.add('on')}
    quiet();if(!busy()){playCur();vidFor(mod(n+1),true)}
  }
  function place(){
    var w=root.clientWidth,q=((p%N)+N)%N;
    track.style.transform='translate3d('+(w/2-(N+q)*TW)+'px,0,0)';
    show(Math.floor(q));
  }
  function frame(t){
    raf=0;if(dead)return;
    var dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
    if(tween){
      var kk=Math.min(1,(t-tween.t0)/tween.ms),e=1-Math.pow(1-kk,3);
      p=tween.a+(tween.b-tween.a)*e;
      if(kk>=1){p=tween.b;tween=null;if(!playing)playCur()}
    }else if(playing&&!drag&&!wheeling)p+=dt*RATE;
    place();raf=requestAnimationFrame(frame);
  }
  function startLoop(){lastT=0;if(!raf)raf=requestAnimationFrame(frame)}
  function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;quiet()}
  function glide(to,ms){tween={a:p,b:to,t0:performance.now(),ms:ms||500};startLoop()}
  function setPlay(on){playing=on;root.classList.toggle('paused',!on);if(on){tween=null;playCur()}}
  function toggle(){setPlay(!playing);root.classList.add('seen')}
  function onDown(e){
    if(e.button)return;
    if(e.target.closest('button,a'))return;
    drag={x:e.clientX,y:e.clientY,p0:p,moved:false,strip:!!e.target.closest('.rl-fs'),touch:e.pointerType!=='mouse'};
    tween=null;
  }
  function onMove(e){
    if(!drag)return;
    var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;root.classList.add('scrub');quiet();root.classList.add('seen')}
    if(drag.moved){p=drag.p0-dx/(drag.strip?TW:(drag.touch?22:28));startLoop()}
  }
  function onUp(e){
    if(!drag)return;
    var d=drag;drag=null;root.classList.remove('scrub');
    if(d.moved){glide(Math.floor(p)+.5,260);if(playing)setTimeout(function(){if(!busy())playCur()},270);return}
    if(e.type==='pointercancel'||d.strip)return;
    toggle();
  }
  function onWheel(e){
    e.preventDefault();
    var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(e.deltaMode===1)d*=32;
    if(!wheeling){wheeling=true;root.classList.add('scrub');quiet();root.classList.add('seen')}
    tween=null;p+=d/60;startLoop();
    clearTimeout(wheelT);
    wheelT=setTimeout(function(){wheeling=false;root.classList.remove('scrub');glide(Math.floor(p)+.5,260);if(playing)setTimeout(playCur,270)},160);
  }
  function onKey(e){
    var key=e.key;
    if(key===' '||(key==='Enter'&&e.target===stage)){e.preventDefault();toggle()}
    else if(key==='ArrowRight'||key==='ArrowDown'){e.preventDefault();setPlay(false);glide(Math.floor(p)+1.5)}
    else if(key==='ArrowLeft'||key==='ArrowUp'){e.preventDefault();setPlay(false);glide(Math.floor(p)-.5)}
  }
  function onVis(){if(dead)return;if(document.hidden)stopLoop();else startLoop()}
  stage.addEventListener('pointerdown',onDown);
  root.querySelector('.rl-fs').addEventListener('pointerdown',onDown);
  addEventListener('pointermove',onMove,{passive:true});
  addEventListener('pointerup',onUp);
  addEventListener('pointercancel',onUp);
  root.addEventListener('wheel',onWheel,{passive:false});
  root.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onVis);
  fitB.addEventListener('click',function(e){var b=e.target.closest('[data-m]');if(b){setFit(b.getAttribute('data-m'));root.classList.add('seen')}});
  view.addEventListener('click',function(e){e.preventDefault();var l=S[mod(cur)].l;if(l==null)return;hooks.viewFilm(l)});
  document.documentElement.classList.add('reelon');
  var bx=hooks.box&&hooks.box();
  if(bx&&bx.w&&root.animate){
    var W=innerWidth,H=innerHeight;
    root.animate([{clipPath:'inset('+Math.max(0,bx.t).toFixed(1)+'px '+Math.max(0,W-bx.l-bx.w).toFixed(1)+'px '+Math.max(0,H-bx.t-bx.h).toFixed(1)+'px '+Math.max(0,bx.l).toFixed(1)+'px round 3px)'},
      {clipPath:'inset(0px 0px 0px 0px round 0px)'}],{duration:600,easing:EASE});
  }
  place();startLoop();playCur();
  try{stage.focus({preventScroll:true})}catch(e){}
  return {
    stop:function(){
      dead=true;stopLoop();
      removeEventListener('pointermove',onMove);removeEventListener('pointerup',onUp);removeEventListener('pointercancel',onUp);
      document.removeEventListener('visibilitychange',onVis);
      clearTimeout(wheelT);
      pool.forEach(function(q){q.v.removeAttribute('src');q.i=-1;try{q.v.load()}catch(e){}});
      document.documentElement.classList.remove('reelon');
    },
    state:function(){return {i:mod(cur),n:N,playing:playing,fit:root.classList.contains('fit'),p:p}}
  };
}
window.GJ_REELVIEW={mount:mount};
})();
