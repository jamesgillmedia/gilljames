/* site-v3-pro2 · the Demo Reel card, built to work the way Amy Currell's home page does (our own code):
   a filmstrip of every shot drifts right-to-left along the bottom (~1.1 shots a second); the shot under the centre line is shown big —
   a hard cut, still at once, its muted clip as soon as it can play. Tap = pause / play; paused on a wide screen, the left quarter steps
   back and the right quarter steps on (a short glide). Drag / swipe / wheel / trackpad scrubs — frames flip as fast as you move.
   fit (letterbox, whole frame) or fill (edge to edge, cropped in; the default, as on her site), remembered.
   Opened from the film chapter (its first star), list/ and film/ (../#film/reel).
   pro2 nav: it is a layer ON the sky, not a page. It zooms up out of its star (the sky scales away behind it, as a work does) and
   zooms back into the same star at the same scroll spot. #film/reel is one history entry: ‹ (js/nav.js), Esc, browser Back and a
   pinch-out / trackpad zoom-out all close it the same way. "view film" opens that film over the sky; Back from it returns to the
   reel at the same shot, Back again to the star. */
(function(){
'use strict';
var S=window.GJ_REEL||[];if(!S.length)return;
var N=S.length,D=document.documentElement,RM=matchMedia('(prefers-reduced-motion: reduce)').matches,
  RATE=1.1,TW=40,COLS=16,KEY='gj-reel-fit';
var EASE='cubic-bezier(.2,.8,.2,1)',y0=null,last=0,under=false,pz=null,zAcc=0,zT=0;
var root,stage,img,track,ctr,lab,rsrc,view,cur0,fitB,lastFocus,pushed=false,
  p=0,cur=-1,playing=true,raf=0,lastT=0,tween=null,drag=null,wheelT=0,wheeling=false,pool=[],stillCache={};
function pad(n){n=String(n);while(n.length<3)n='0'+n;return n}
function mod(i){return((i%N)+N)%N}
function base(i){return 'reel/'+S[i].f}
function fitMode(){var m='fill';try{m=localStorage.getItem(KEY)||'fill'}catch(e){}return m==='fit'?'fit':'fill'}
function setFit(m){root.classList.toggle('fit',m==='fit');fitB.querySelectorAll('[data-m]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.m===m))});try{localStorage.setItem(KEY,m)}catch(e){}}
function build(){
  root=document.createElement('div');root.className='rl';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Demo reel — every shot on a moving filmstrip');
  root.innerHTML='<div class="rl-st" tabindex="0"><img class="rl-im" alt="" decoding="sync"></div>'+
    '<div class="rl-ui"><p class="rl-k"><span class="rl-n"></span></p>'+
    '<p class="rl-fit" role="group" aria-label="frame"><button type="button" data-m="fill">fill</button><i>·</i><button type="button" data-m="fit">fit</button></p>'+
    '<button type="button" class="rl-x" aria-label="close the demo reel">×</button>'+
    '<p class="rl-b"><b></b><small></small><a class="rl-v" href="#">view film</a></p>'+
    '<p class="rl-h" aria-hidden="true"><span class="t-touch">tap to pause · swipe to flip</span><span class="t-desk">click to pause · drag or scroll to flip</span></p>'+
    '<span class="rl-cur" aria-hidden="true"></span></div>'+
    '<div class="rl-fs" aria-hidden="true"><div class="rl-tr"></div><i class="rl-mk"></i></div>';
  stage=root.querySelector('.rl-st');img=root.querySelector('.rl-im');track=root.querySelector('.rl-tr');ctr=root.querySelector('.rl-n');
  lab=root.querySelector('.rl-b b');rsrc=root.querySelector('.rl-b small');view=root.querySelector('.rl-v');cur0=root.querySelector('.rl-cur');fitB=root.querySelector('.rl-fit');
  var h='',rows=Math.ceil(N/COLS);for(var k=0;k<3;k++)for(var i=0;i<N;i++)h+='<b style="background-position:'+(-(i%COLS)*TW)+'px '+(-Math.floor(i/COLS)*TW)+'px"></b>';
  track.innerHTML=h;track.style.setProperty('--bs',(COLS*TW)+'px '+(rows*TW)+'px');
  for(var j=0;j<3;j++){var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;
    ['muted','playsinline','webkit-playsinline','disablepictureinpicture'].forEach(function(a){v.setAttribute(a,'')});v.setAttribute('aria-hidden','true');v.preload='auto';
    v.addEventListener('playing',onPlaying);stage.appendChild(v);pool.push({v:v,i:-1})}
  document.body.appendChild(root);
  root.querySelector('.rl-x').addEventListener('click',function(){out()});
  fitB.addEventListener('click',function(e){var b=e.target.closest('[data-m]');if(b){setFit(b.dataset.m);flash()}});
  view.addEventListener('click',function(e){e.preventDefault();var l=S[mod(cur)].l;if(l==null)return;viewFilm('w'+l)});
  stage.addEventListener('pointerdown',onDown);root.querySelector('.rl-fs').addEventListener('pointerdown',onDown);
  addEventListener('pointermove',onMove,{passive:true});addEventListener('pointerup',onUp);addEventListener('pointercancel',onUp);
  stage.addEventListener('pointermove',cursorLabel,{passive:true});stage.addEventListener('pointerleave',function(){cur0.classList.remove('on')});
  root.addEventListener('wheel',onWheel,{passive:false});root.addEventListener('keydown',onKey);
  /* a two-finger pinch-out closes (zooms back out into the star); one finger stays the scrub */
  root.addEventListener('touchstart',function(e){if(e.touches.length===2){var t=e.touches;pz={d:Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY),done:0};drag=null;root.classList.remove('scrub')}},{passive:true});
  root.addEventListener('touchmove',function(e){if(!pz||e.touches.length!==2)return;if(e.cancelable)e.preventDefault();var t=e.touches,d=Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);if(!pz.done&&d/pz.d<.8){pz.done=1;out()}},{passive:false});
  root.addEventListener('touchend',function(e){if(e.touches.length<2)pz=null},{passive:true});
  document.addEventListener('visibilitychange',function(){if(!isOn())return;if(document.hidden)stopLoop();else startLoop()});
  setFit(fitMode())}
function isOn(){return !!(root&&root.classList.contains('on'))}
/* ---- media: still now, clip when it can play; a pool of 3 videos keeps the next ones warm ---- */
function still(i){if(!stillCache[i]){var im=new Image();im.decoding='async';im.src=base(i)+'.webp';stillCache[i]=im}return stillCache[i]}
function vidFor(i,make){for(var k=0;k<pool.length;k++)if(pool[k].i===i)return pool[k];if(!make)return null;
  var best=null,bd=-1;pool.forEach(function(q){var d=q.i<0?1e9:Math.abs(((q.i-cur)%N+N)%N);if(q.i===mod(cur))d=-2;if(d>bd){bd=d;best=q}});
  best.i=i;best.v.classList.remove('on');best.v.src=base(i)+'.mp4';try{best.v.load()}catch(e){}return best}
function onPlaying(e){var q=pool.filter(function(q){return q.v===e.target})[0];if(q&&q.i===mod(cur)&&!busy())q.v.classList.add('on')}
function busy(){return !!(drag&&drag.moved)||wheeling}
function playCur(){if(RM&&!playing)return;var i=mod(cur),q=vidFor(i,true);pool.forEach(function(o){if(o!==q){o.v.classList.remove('on');if(!o.v.paused)o.v.pause()}});
  if(q.v.readyState>=2&&!q.v.paused)q.v.classList.add('on');var pr=q.v.play();if(pr&&pr.catch)pr.catch(function(){})}
function quiet(){pool.forEach(function(o){o.v.classList.remove('on');if(!o.v.paused)o.v.pause()})}
function show(i){i=mod(i);if(i===mod(cur)&&cur>=0)return;var prev=cur;cur=i;
  img.src=still(i).src;root.classList.toggle('tall',S[i].h>S[i].w);
  ctr.textContent=pad(i+1)+' / '+pad(N);var s=S[i];lab.textContent=s.b||'';rsrc.textContent=s.r||'';root.classList.toggle('nob',!s.b);root.classList.toggle('nol',s.l==null);
  for(var k=1;k<=4;k++)still(mod(i+k));still(mod(i-1));
  var marks=track.children;if(prev>=0)for(var c=0;c<3;c++){var o=marks[c*N+mod(prev)];o&&o.classList.remove('on')}for(var c2=0;c2<3;c2++){var m=marks[c2*N+i];m&&m.classList.add('on')}
  quiet();if(!busy()){playCur();vidFor(mod(i+1),true)}nav()}
/* ---- the strip: p = position in shots; the shot under the centre line is floor(p) ---- */
function place(){var w=root.clientWidth,q=((p%N)+N)%N;track.style.transform='translate3d('+(w/2-(N+q)*TW)+'px,0,0)' /* the middle of three copies sits under the line */;show(Math.floor(q))}
function frame(t){raf=0;if(!isOn())return;var dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  if(tween){var k=Math.min(1,(t-tween.t0)/tween.ms),e=1-Math.pow(1-k,3);p=tween.a+(tween.b-tween.a)*e;if(k>=1){p=tween.b;tween=null;if(!playing)playCur()}}
  else if(playing&&!drag&&!wheeling&&!RM)p+=dt*RATE;
  place();raf=requestAnimationFrame(frame)}
function startLoop(){lastT=0;if(!raf)raf=requestAnimationFrame(frame)}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;quiet()}
function glide(to,ms){tween={a:p,b:to,t0:performance.now(),ms:RM?1:(ms||500)};startLoop()}
function step(n){var c=Math.floor(p);setPlay(false);glide(c+n+.5)}
function setPlay(on){playing=on;root.classList.toggle('paused',!on);if(on){tween=null;playCur()}nav()}
function toggle(){setPlay(!playing);flash()}
function flash(){root.classList.add('seen')}
/* ---- pointer: a press that doesn't move is a tap; a drag scrubs ---- */
function zone(x){var w=root.clientWidth;if(!playing&&w>800){if(x<w*.25)return'prev';if(x>w*.75)return'next'}return playing?'pause':'play'}
function onDown(e){if(e.button)return;if(e.target.closest('button,a'))return;drag={x:e.clientX,y:e.clientY,p0:p,moved:false,strip:!!e.target.closest('.rl-fs'),touch:e.pointerType!=='mouse'};tween=null}
function onMove(e){if(!drag||pz)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;root.classList.add('scrub');quiet();flash()}
  if(drag.moved){p=drag.p0-dx/(drag.strip?TW:(drag.touch?22:28));startLoop()}}
function onUp(e){if(!drag)return;var d=drag;drag=null;root.classList.remove('scrub');
  if(d.moved){glide(Math.floor(p)+.5,260);if(playing)setTimeout(function(){if(!busy())playCur()},270);return}
  if(e.type==='pointercancel'||d.strip)return;var z=zone(e.clientX);if(z==='prev')step(-1);else if(z==='next')step(1);else toggle();cursorLabel(e)}
function cursorLabel(e){if(e.pointerType&&e.pointerType!=='mouse')return;var z=zone(e.clientX);cur0.textContent=z;cur0.style.transform='translate3d('+(e.clientX+14)+'px,'+(e.clientY+12)+'px,0)';cur0.classList.add('on')}
/* ---- wheel / trackpad: scrub; the strip carries on half a second after you stop ---- */
function onWheel(e){if(!isOn())return;e.preventDefault();if(e.ctrlKey){zAcc+=e.deltaY;clearTimeout(zT);zT=setTimeout(function(){zAcc=0},250);if(zAcc>40){zAcc=0;out()}return}var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(e.deltaMode===1)d*=32;
  if(!wheeling){wheeling=true;root.classList.add('scrub');quiet();flash()}tween=null;p+=d/60;startLoop();
  clearTimeout(wheelT);wheelT=setTimeout(function(){wheeling=false;root.classList.remove('scrub');glide(Math.floor(p)+.5,260);if(playing)setTimeout(playCur,270)},160)}
function onKey(e){var k=e.key;
  if(k==='Escape'){e.preventDefault();out();return}
  if(k===' '||k==='Enter'&&e.target===stage){e.preventDefault();toggle()}
  else if(k==='ArrowRight'||k==='ArrowDown'||k==='PageDown'){e.preventDefault();step(1)}
  else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'){e.preventDefault();step(-1)}
  else if(k==='Home'){e.preventDefault();setPlay(false);glide(.5,300)}
  else if(k==='Tab'){var f=[].slice.call(root.querySelectorAll('.rl-st,button,.rl-v')).concat([].slice.call(document.querySelectorAll('.wn button:not([hidden])'))).filter(function(x){return x.offsetParent!==null||x.closest('.wn')});var ix=f.indexOf(document.activeElement);e.preventDefault();f[(ix+(e.shiftKey?-1:1)+f.length)%f.length].focus()}}
/* site-v3-pro3: the reel is the deepest zoom of its star in the one sky (js/world.js). It opens out of the star as an iris, with a thin
   ring of sky left around it, and closes back into the same star. World owns the level + history; every close here asks it to go out. */
function out(){if(window.__world)__world.out();else close()}
function open(i,o){o=o||{};if(typeof o!=='object')o={};if(!root)build();if(isOn())return;lastFocus=document.activeElement;D.classList.add('reel-on');root.classList.remove('seen');under=false;
  cur=-1;p=(typeof i==='number'?i:last||0)+.5;playing=!RM;root.classList.toggle('paused',!playing);root.style.visibility='';root.classList.add('on');place();
  if(window.__iris)__iris(root,o,true);
  startLoop();playCur();nav();setTimeout(function(){try{stage.focus({preventScroll:true})}catch(e){}},60)}
function nav(){if(window.__world&&__world.ui)__world.ui()}
function close(o){o=o||{};if(!isOn())return;last=mod(cur);stopLoop();D.classList.remove('reel-on');
  function end(){if(D.classList.contains('reel-on'))return;root.classList.remove('on');root.style.visibility='hidden';/* explicit: WebKit could leave the closed reel hit-testable */pool.forEach(function(q){q.v.removeAttribute('src');q.i=-1;try{q.v.load()}catch(e){}})}
  cur=-1;tween=null;drag=null;pz=null;
  if(window.__iris&&!o.instant)__iris(root,o,false,end);else{root.style.clipPath='';end()}}
/* "view film": the film page replaces the reel in place (same depth, one level below the film works) */
function viewFilm(w){last=mod(cur);if(window.__world)__world.viewFilm(w)}
window.__reel={open:function(it,o){open(undefined,o)},close:close,
  state:function(){var q=cur>=0?vidFor(mod(cur)):null;return{on:isOn(),under:under,paused:!playing,i:cur,n:N,p:+p.toFixed(3),auto:playing,fit:root?root.classList.contains('fit'):fitMode()==='fit',
    live:!!(q&&q.v.classList.contains('on')),clipPlaying:!!(q&&!q.v.paused),videos:pool.filter(function(o){return o.i>=0}).length}},
  go:function(i){setPlay(false);tween=null;p=i+.5;startLoop()},play:function(on){setPlay(on!==false)},fit:function(m){setFit(m)}};
})();
