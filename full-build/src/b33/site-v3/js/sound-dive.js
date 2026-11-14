/* gill james v3.7 · the Sound constellation's deepest level is the waveform player (sound/).
   dive.js / sheet.js are untouched: every way into a work (tap the frame, pinch / + at the grid, a tap in the sky sheet, ‹ › in
   the work view, a deep link #sound/wave) ends in a history push to #sound/wave. That push is caught here: the frame has already
   started growing out of its tile (dive.js), the sky darkens into the player's own night, and the page goes to sound/.
   #sound/wave is never written to history, so Back from the player lands on the Sound grid you came from. */
(function(){
'use strict';
var RE=/^#sound\/wave(?:\/|$)/,PLAYER='sound/',RM=matchMedia('(prefers-reduced-motion: reduce)'),going=0,veil=null;
function hashOf(u){try{return new URL(u,location.href).hash}catch(e){return ''}}
function dive(){if(going)return;going=1;var rm=RM.matches;
  if(!veil){veil=document.createElement('div');veil.setAttribute('aria-hidden','true');
    veil.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;opacity:0;background:radial-gradient(120% 75% at 50% 42%,#16223a 0%,#0a1120 55%,#03050a 100%)'}
  document.body.appendChild(veil);veil.style.transition=rm?'none':'opacity .42s cubic-bezier(.2,.8,.2,1) .2s';
  requestAnimationFrame(function(){veil.style.opacity='1'});
  setTimeout(function(){location.assign(PLAYER)},rm?0:640)}
['pushState','replaceState'].forEach(function(n){var f=history[n];history[n]=function(s,t,u){if(u!=null&&RE.test(hashOf(u))){dive();return}return f.apply(history,arguments)}});
/* a deep link to the player work (index.html#sound/wave) */
if(RE.test(location.hash)){history.replaceState(null,'',location.pathname+location.search+'#sound/l2');location.replace(PLAYER);return}
/* a same-page jump to #sound/wave (typed / followed link: dive.js opens the work from popstate; the hash change takes you on) */
addEventListener('hashchange',function(){if(!RE.test(location.hash))return;history.replaceState(history.state,'',location.pathname+location.search+'#sound/l2');dive()});
/* Back from the player (bfcache): lift the veil and fold the work view back into the grid */
addEventListener('pageshow',function(e){if(!going&&!e.persisted)return;going=0;if(veil&&veil.parentNode)veil.parentNode.removeChild(veil);
  try{if(window.__dive&&__dive.state().w==='wave')__dive.go({k:'sound',lv:2},{push:false,noAnim:true})}catch(x){}});
/* warm the player's page + code while the Sound constellation is open (no audio: the player page loads that itself) */
var warm=0;function prefetch(){if(warm)return;warm=1;['sound/','css/sound.css','js/tracks.js','js/player.js'].forEach(function(h){var l=document.createElement('link');l.rel='prefetch';l.href=h;document.head.appendChild(l)})}
var snd=document.getElementById('sound');if(snd&&'MutationObserver' in window)new MutationObserver(function(){if(/\blv[12]\b/.test(snd.className))prefetch()}).observe(snd,{attributes:true,attributeFilter:['class']});
window.__soundDive={going:function(){return !!going}};
})();
