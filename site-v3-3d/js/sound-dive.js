/* gill james site-v3-3d · Sound's first layer is the waveform player (sound/).
   dive.js is untouched (it lives in site-v3). Every way into a Sound work still
   ends in a history push to #sound/wave; that push is caught here, the sky
   darkens, and the page goes to sound/.
   #sound/wave is never written to history. Back from the player returns to the
   Sound constellation (the sky sheet), not the column board. */
(function(){
'use strict';
var RE=/^#sound\/wave(?:\/|$)/,PLAYER='sound/',RM=matchMedia('(prefers-reduced-motion: reduce)'),going=0,veil=null;
function hashOf(u){try{return new URL(u,location.href).hash}catch(e){return ''}}
function backHash(){return location.pathname+location.search+'#sky/sound'}
function dive(){if(going)return;going=1;var rm=RM.matches;
  if(!veil){veil=document.createElement('div');veil.setAttribute('aria-hidden','true');
    veil.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;opacity:0;background:radial-gradient(120% 75% at 50% 42%,#16223a 0%,#0a1120 55%,#03050a 100%)'}
  document.body.appendChild(veil);veil.style.transition=rm?'none':'opacity .42s cubic-bezier(.2,.8,.2,1) .2s';
  requestAnimationFrame(function(){veil.style.opacity='1'});
  try{if(!/^#sky\/sound/.test(location.hash))history.replaceState(history.state||null,'',backHash())}catch(e){}
  setTimeout(function(){location.assign(PLAYER)},rm?0:640)}
function landBack(){
  going=0;if(veil&&veil.parentNode)veil.parentNode.removeChild(veil);
  try{
    if(window.__sheet){__sheet.open({mode:'chap',k:'sound'});return}
    if(window.__dive)__dive.go({k:'sound',lv:1},{push:false,noAnim:true})
  }catch(x){}}
['pushState','replaceState'].forEach(function(n){var f=history[n];history[n]=function(s,t,u){if(u!=null&&RE.test(hashOf(u))){dive();return}return f.apply(history,arguments)}});
/* a deep link to the player work (index.html#sound/wave) */
if(RE.test(location.hash)){history.replaceState(null,'',backHash());location.replace(PLAYER);return}
/* a same-page jump to #sound/wave */
addEventListener('hashchange',function(){if(!RE.test(location.hash))return;history.replaceState(history.state,'',backHash());dive()});
/* Back from the player (bfcache or ordinary Back): lift the veil and return to the Sound constellation */
addEventListener('pageshow',function(e){if(!going&&!e.persisted)return;landBack()});
/* Sound's first layer is the player: a request for the Sound board (lv 2, no work)
   is sent on to the waveform instead. quiet:true calls (sheet handover measuring)
   are left alone; this page skips that handover for Sound. */
function hookDive(){if(!window.__dive||__dive.__v33dSound)return;
  var go=__dive.go;__dive.go=function(r,o){
    o=o||{};
    if(r&&r.k==='sound'&&r.lv===2&&!r.w&&!o.quiet)return go({k:'sound',lv:3,w:'wave'},o);
    return go(r,o)};
  __dive.__v33dSound=1}
hookDive();addEventListener('DOMContentLoaded',hookDive);
/* warm the player's page + code while the Sound constellation is open (no audio: the player page loads that itself) */
var warm=0;function prefetch(){if(warm)return;warm=1;['sound/','css/sound.css','js/tracks.js','js/player.js'].forEach(function(h){var l=document.createElement('link');l.rel='prefetch';l.href=h;document.head.appendChild(l)})}
var snd=document.getElementById('sound');if(snd&&'MutationObserver' in window)new MutationObserver(function(){if(/\blv[12]\b/.test(snd.className)||(window.__sheet&&__sheet.isOpen&&__sheet.isOpen()))prefetch()}).observe(snd,{attributes:true,attributeFilter:['class']});
window.__soundDive={going:function(){return !!going}};
})();
