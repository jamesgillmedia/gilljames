/* gill james site-v3-3d · Sound's first layer is the waveform player (sound/).
   dive.js is untouched (it lives in site-v3). The dock writes #sound/l2 through
   history; that write is caught here and the page goes to sound/.
   #sound/wave is never written. Back from the player returns to the
   Sound constellation (the sky sheet), not the column board. */
(function(){
'use strict';
var RE=/^#sound\/wave(?:\/|$)/,BOARD=/^#sound(?:\/l[0-2])?$/,YT=/^#sound\/w4(?:\/|$)/,PLAYER=(function(){try{return new URL('sound/',location.href).href}catch(e){return 'sound/'}})(),RM=matchMedia('(prefers-reduced-motion: reduce)'),going=0,veil=null;
function wantsPlayer(h){return RE.test(h)||BOARD.test(h)||YT.test(h)}
function hashOf(u){try{return new URL(u,location.href).hash}catch(e){return ''}}
function backHash(){return location.pathname+location.search+'#sky/sound'}
function dive(){
  if(going)return;going=1;var rm=RM.matches;
  if(!veil){veil=document.createElement('div');veil.setAttribute('aria-hidden','true');
    veil.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;opacity:0;background:radial-gradient(120% 75% at 50% 42%,#16223a 0%,#0a1120 55%,#03050a 100%)'}
  if(!veil.parentNode)document.body.appendChild(veil);
  veil.style.transition=rm?'none':'opacity .42s cubic-bezier(.2,.8,.2,1) .2s';
  requestAnimationFrame(function(){if(veil)veil.style.opacity='1'});
  try{if(!/^#sky\/sound/.test(location.hash))history.replaceState(history.state||null,'',backHash())}catch(e){}
  setTimeout(function(){location.assign(PLAYER)},rm?0:420);
}
function landBack(){
  going=0;if(veil&&veil.parentNode)veil.parentNode.removeChild(veil);
  try{
    if(window.__sheet){__sheet.open({mode:'chap',k:'sound'});return}
    if(window.__dive)__dive.go({k:'sound',lv:1},{push:false,noAnim:true})
  }catch(x){}
}
['pushState','replaceState'].forEach(function(n){
  var f=history[n];
  history[n]=function(s,t,u){
    if(u!=null&&wantsPlayer(hashOf(u))){setTimeout(dive,0);return}
    return f.apply(history,arguments);
  };
});
if(wantsPlayer(location.hash)){history.replaceState(null,'',backHash());location.replace(PLAYER);return}
addEventListener('hashchange',function(){if(!wantsPlayer(location.hash))return;try{history.replaceState(history.state,'',backHash())}catch(e){}dive()});
addEventListener('pageshow',function(e){if(!going&&!e.persisted)return;landBack()});
function hookDive(){if(!window.__dive||__dive.__v33dSound)return;
  var go=__dive.go;__dive.go=function(r,o){
    o=o||{};
    if(r&&r.k==='sound'&&!o.quiet&&(r.w==='w4'||(r.lv===2&&!r.w))){setTimeout(dive,0);return}
    return go(r,o)};
  __dive.__v33dSound=1}
hookDive();addEventListener('DOMContentLoaded',hookDive);
var warm=0;function prefetch(){if(warm)return;warm=1;var l=document.createElement('link');l.rel='prefetch';l.href=PLAYER;document.head.appendChild(l)}
var snd=document.getElementById('sound');if(snd&&'MutationObserver' in window)new MutationObserver(function(){if(/\blv[12]\b/.test(snd.className))prefetch()}).observe(snd,{attributes:true,attributeFilter:['class']});
window.__soundDive={going:function(){return !!going}};
})();
