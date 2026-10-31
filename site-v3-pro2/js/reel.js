/* site-v3-pro2 · the Demo Reel card. A full-viewport card over the page (#reel), one distinct shot per scroll step (wheel, trackpad,
   swipe, arrow keys, PageUp/Down, space). Each shot shows its still at once; after ~200 ms of stillness the shot's own muted loop fades in
   over it. Any scroll pauses (freezes) the clip until you settle again. Only the current shot ±2 load their stills; current ±1 their clips.
   Opened from the film chapter (first star, "Demo Reel": a press on it once the chapter is open), from list/ and film/ (../#reel). */
(function(){
'use strict';
var S=window.GJ_REEL||[];if(!S.length)return;
var D=document.documentElement,root=null,sc=null,cards=[],cur=-1,idleT=0,scrolling=false,pushed=false,lastFocus=null,ctr,lab,src2,raf=0;
function pad(n){n=String(n);while(n.length<3)n='0'+n;return n}
function build(){root=document.createElement('div');root.className='rl';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Demo reel, one shot per scroll');
  root.innerHTML='<div class="rl-sc" tabindex="0"></div><div class="rl-ui"><p class="rl-k"><span class="rl-n">001 / '+pad(S.length)+'</span></p><p class="rl-b"><b></b><small></small></p>'+
    '<button type="button" class="rl-x" aria-label="close the demo reel">×</button><p class="rl-h" aria-hidden="true">scroll · swipe · ↓</p></div>';
  sc=root.querySelector('.rl-sc');ctr=root.querySelector('.rl-n');lab=root.querySelector('.rl-b b');src2=root.querySelector('.rl-b small');
  var fr=document.createDocumentFragment();
  S.forEach(function(s,i){var c=document.createElement('section');c.className='rl-c';c.dataset.i=i;c.style.setProperty('--ar',(s.w/s.h).toFixed(4));
    c.innerHTML='<div class="rl-f"><img alt="" decoding="async"><video muted loop playsinline preload="none" disablepictureinpicture aria-hidden="true"></video></div>';
    fr.appendChild(c);cards.push(c)});
  sc.appendChild(fr);document.body.appendChild(root);
  sc.addEventListener('scroll',onScroll,{passive:true});
  root.querySelector('.rl-x').addEventListener('click',function(){close()});
  root.addEventListener('keydown',onKey);
  cards.forEach(function(c){var v=c.querySelector('video');v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
    v.addEventListener('playing',function(){c.classList.add('live')});v.addEventListener('pause',function(){/* frozen: keep the last frame up */})})}
function base(i){return 'reel/'+S[i].f}
function want(i){ /* stills for ±2, clips for ±1, nothing else */
  cards.forEach(function(c,j){var d=Math.abs(j-i),im=c.firstChild.firstChild,v=im.nextSibling;
    if(d<=2){if(!im.getAttribute('src'))im.src=base(j)+'.webp'}
    if(d<=1){if(!v.getAttribute('src')){v.preload=d===0?'auto':'metadata';v.src=base(j)+'.mp4'}}
    else if(v.getAttribute('src')){v.pause();v.removeAttribute('src');try{v.load()}catch(e){}c.classList.remove('live')}
    if(d>3&&im.getAttribute('src'))im.removeAttribute('src')})}
function idx(){return Math.max(0,Math.min(S.length-1,Math.round(sc.scrollTop/Math.max(1,sc.clientHeight))))}
function label(i){var s=S[i];ctr.textContent=pad(i+1)+' / '+pad(S.length);lab.textContent=s.b||'';src2.textContent=s.r||'';root.classList.toggle('nob',!s.b)}
function pauseAll(){cards.forEach(function(c){var v=c.firstChild.lastChild;if(!v.paused)v.pause()})}
function settle(){scrolling=false;root.classList.remove('moving');if(idx()>0)root.classList.add('seen');var i=idx();if(i!==cur){cur=i;want(i);label(i)}
  var v=cards[i].firstChild.lastChild;var p=v.play();if(p&&p.catch)p.catch(function(){})}
function onScroll(){if(!scrolling){scrolling=true;root.classList.add('moving');pauseAll()}
  if(!raf)raf=requestAnimationFrame(function(){raf=0;var i=idx();if(i!==cur){cur=i;want(i);label(i)}});
  clearTimeout(idleT);idleT=setTimeout(settle,200)}
function go(i,smooth){i=Math.max(0,Math.min(S.length-1,i));sc.scrollTo({top:i*sc.clientHeight,behavior:smooth===false?'auto':'smooth'})}
function onKey(e){var k=e.key;
  if(k==='Escape'){e.preventDefault();close();return}
  if(k==='ArrowDown'||k==='PageDown'||k==='ArrowRight'||(k===' '&&!e.shiftKey)||k==='j'){e.preventDefault();go(idx()+1)}
  else if(k==='ArrowUp'||k==='PageUp'||k==='ArrowLeft'||(k===' '&&e.shiftKey)||k==='k'){e.preventDefault();go(idx()-1)}
  else if(k==='Home'){e.preventDefault();go(0)}else if(k==='End'){e.preventDefault();go(S.length-1)}
  else if(k==='Tab'){e.preventDefault();var x=root.querySelector('.rl-x');(document.activeElement===x?sc:x).focus()}}
/* a wheel / trackpad gesture = exactly one shot: the browser's own snap can skip several on a fast fling, so steps are ours on desktop */
var wAcc=0,wLock=0;function onWheel(e){if(!root||!D.classList.contains('reel-on'))return;e.preventDefault();var now=performance.now(),dy=e.deltaMode===1?e.deltaY*32:e.deltaY;
  if(now<wLock){wLock=now+180;return} /* the tail of the same fling: keep swallowing it */
  wAcc+=dy;if(Math.abs(wAcc)>=24){go(idx()+(wAcc>0?1:-1));wAcc=0;wLock=now+420}}
function open(i,push){if(!root)build();lastFocus=document.activeElement;D.classList.add('reel-on');root.classList.add('on');
  if(push!==false&&location.hash!=='#reel'){try{history.pushState({reel:1},'','#reel');pushed=true}catch(e){}}
  cur=-1;requestAnimationFrame(function(){go(i||0,false);settle();sc.focus({preventScroll:true})});
  root.addEventListener('wheel',onWheel,{passive:false})}
function close(fromPop){if(!root||!root.classList.contains('on'))return;pauseAll();root.classList.remove('on');D.classList.remove('reel-on');
  cards.forEach(function(c){var v=c.firstChild.lastChild;if(v.getAttribute('src')){v.removeAttribute('src');try{v.load()}catch(e){}}c.classList.remove('live')});cur=-1;
  if(!fromPop){if(pushed&&history.state&&history.state.reel){pushed=false;history.back()}else{try{history.replaceState(null,'',location.pathname+location.search)}catch(e){} /* came straight to #reel: land on the film chapter, open */
    var f=document.getElementById('film');if(window.__dive&&__dive.go&&f){try{__dive.go({k:'film',lv:2},{anchor:f.querySelector('.head'),noAnim:true})}catch(e){}f.scrollIntoView({block:'start'})}}}
  var it=document.querySelector('.ch .it[data-k="reel"] .tile');(it||lastFocus||document.body).focus&&(it||lastFocus).focus({preventScroll:true})}
addEventListener('popstate',function(){if(location.hash==='#reel')open(0,false);else close(true)});
/* the film-chapter star: the first press opens the chapter (as every star does), a press on the open star opens the card */
document.addEventListener('click',function(e){if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;var t=e.target.closest&&e.target.closest('[data-reel]');
  if(!t)return;var it=t.closest('.it');
  if(it&&window.__dive&&__dive.state){var st=__dive.state();if(!(st.k==='film'&&st.lv>=2))return} /* let dive open the chapter first */
  e.preventDefault();e.stopPropagation();open(0)},true);
if(location.hash==='#reel'){var go0=function(){open(0,false)};if(document.readyState==='complete')go0();else addEventListener('load',go0)}
window.__reel={open:open,close:close,state:function(){return{on:!!(root&&root.classList.contains('on')),i:cur,n:S.length,
  playing:cur>=0&&!cards[cur].firstChild.lastChild.paused,live:cur>=0&&cards[cur].classList.contains('live'),loaded:cards.filter(function(c){return !!c.firstChild.lastChild.getAttribute('src')}).length,
  stills:cards.filter(function(c){return !!c.firstChild.firstChild.getAttribute('src')}).length}},go:function(i){go(i)}};
})();
