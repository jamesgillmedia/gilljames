/* gill james v3.7 · the Sound constellation's deepest level is the waveform player (sound/).
   pro2 nav: the player no longer replaces the page. Every way into the work (tap the frame, pinch / + at the grid, a tap in the sky
   sheet, ‹ › in the work view, a deep link #sound/wave) ends in a history push to #sound/wave; that push now goes through, and the
   player opens as a layer over the sky (sound/?in=1 in a full-screen frame, fading up through the player's own night, the frame
   still growing out of its tile underneath). ‹ (js/nav.js), Esc and browser Back close it the same way, back onto the Sound grid,
   same spot. sound/ on its own still works as a page. */
(function(){
'use strict';
var RE=/^#sound\/wave(?:\/|$)/,PLAYER='sound/?in=1',RM=matchMedia('(prefers-reduced-motion: reduce)'),D=document.documentElement,ov=null,fr=null,on=false,rmT=0,y0=0;
function hashOf(u){try{return new URL(u,location.href).hash}catch(e){return ''}}
function build(){ov=document.createElement('div');ov.className='sov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','sound · inside the waveform');document.body.appendChild(ov)}
function open(){if(on)return;on=true;y0=scrollY;if(!ov)build();clearTimeout(rmT);
  if(!fr){fr=document.createElement('iframe');fr.title='sound · inside the waveform: the player';fr.allow='autoplay; fullscreen';fr.src=PLAYER;ov.appendChild(fr);
    fr.addEventListener('load',function(){if(on)try{fr.contentWindow.focus()}catch(e){}})}
  D.classList.add('sov-on');requestAnimationFrame(function(){ov.classList.add('on')});nav()}
function close(){if(!on)return;on=false;hold(y0);ov.classList.remove('on');D.classList.remove('sov-on');var f=fr;fr=null;
  try{var a=f&&f.contentDocument&&f.contentDocument.getElementById('au');if(a)a.pause()}catch(e){}
  rmT=setTimeout(function(){if(f&&f.parentNode)f.parentNode.removeChild(f)},RM.matches?0:460);
  try{var t=document.querySelector('#sound .it[data-k="wave"] .tile');if(t)t.focus({preventScroll:true})}catch(e){}nav()}
/* the sky stays exactly where it was: while the layer fades out (and the frame is let go) the browser can nudge the page; put it back, unless you moved it */
function hold(y){var t0=performance.now(),me=0;function u(){me=1}function f(){if(!me&&!on&&Math.abs(scrollY-y)>2)scrollTo(0,y)}
  ['wheel','touchstart','keydown','pointerdown'].forEach(function(n){addEventListener(n,u,{passive:true,once:true})});addEventListener('scroll',f,{passive:true});f();
  setTimeout(function(){removeEventListener('scroll',f);['wheel','touchstart','keydown','pointerdown'].forEach(function(n){removeEventListener(n,u)})},(RM.matches?0:460)+400)}
function nav(){if(window.__nav&&__nav.ui)__nav.ui()}
/* the one back: Back when this page opened it (the player's own "inside" step, if any, is popped first by the browser), else out in place */
function back(){var hs=history.state;if(hs&&hs.gj&&hs.from!=null&&RE.test(location.hash)){history.back();return}
  try{history.replaceState({gj:1,from:null},'',location.pathname+location.search+'#sound/l2')}catch(e){}close();
  try{if(window.__dive)__dive.go({k:'sound',lv:2},{push:false})}catch(e){}
  setTimeout(function(){var t=document.querySelector('#sound .it[data-k="wave"]')||document.getElementById('sound'),r=t&&t.getBoundingClientRect();if(r&&(r.bottom<0||r.top>innerHeight))t.scrollIntoView({block:'center'})},30)}
['pushState','replaceState'].forEach(function(n){var f=history[n];history[n]=function(s,t,u){var r=f.apply(history,arguments);if(u!=null){if(RE.test(hashOf(u)))open();else if(on)close()}return r}});
addEventListener('popstate',function(){if(RE.test(location.hash))open();else close()});
addEventListener('hashchange',function(){if(RE.test(location.hash))open()});
if(RE.test(location.hash)){if(document.readyState==='complete')open();else addEventListener('load',open)}
/* warm the player's page + code while the Sound constellation is open (no audio: the player loads that itself) */
var warm=0;function prefetch(){if(warm)return;warm=1;[PLAYER,'css/sound.css?v=s3','js/tracks.js?v=2','js/player.js?v=2'].forEach(function(h){var l=document.createElement('link');l.rel='prefetch';l.href=h;document.head.appendChild(l)})}
var snd=document.getElementById('sound');if(snd&&'MutationObserver' in window)new MutationObserver(function(){if(/\blv[12]\b/.test(snd.className))prefetch()}).observe(snd,{attributes:true,attributeFilter:['class']});
window.__soundOv={open:open,close:close,back:back,isOpen:function(){return on}};
window.__soundDive={going:function(){return false}};
})();
