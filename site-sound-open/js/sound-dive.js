/* gill james v3.8 · SOUND OPENS TO THE PLAYER (Gill: "I want Sound to open up to that constellation — Player").
   dive.js / sheet.js are untouched (?v=v351back). Every way into the Sound chapter now lands in the player's constellation,
   with no grid-of-tiles step:
   . the column: tap the Sound heading / pinch / + / a tap in its stars: dive.js starts opening the constellation and writes
     #sound/l1|l2|wave to history; that write is caught here (never written, so Back from the player lands where you were).
   . the sky sheet: tap Sound, zoom into it past the constellation, or + at it: the sheet starts its handover (it lines the
     column up and flies in); a tap / button goes at once, a pinch goes as soon as it commits (let go past the sheet's own
     30% point, or pinch all the way); a pinch you take back stays in the sky.
   . a deep link to #sound, #sound/l1-3 or #sound/wave opens the player.
   the sky darkens into the player's own night (the veil) and the page goes to the player. The Spotify / Apple works keep
   their own deep links (#sound/w1 ... #sound/w4) and the list page. Config on the <script> tag: data-player = the player page
   (default sound/), data-warm = what to prefetch while Sound is near (comma list). Both resolve against the document base. */
(function(){
'use strict';
var me=document.currentScript,attr=function(n,d){return(me&&me.getAttribute(n))||d};
var RE=/^#sound(?:\/(?:l[1-3]|wave(?:\/play)?))?\/?$/,RM=matchMedia('(prefers-reduced-motion: reduce)'),going=0,veil=null,from=null,bypass=0;
var PLAYER=new URL(attr('data-player','sound/'),document.baseURI).href;
function hashOf(u){try{return new URL(u,location.href).hash}catch(e){return ''}}
function soundOpen(r){return !!r&&r.k==='sound'&&(r.lv===1||r.lv===2||(r.lv===3&&(!r.w||r.w==='wave')))}
function dive(src){if(going)return;going=1;from=src||'col';var rm=RM.matches;
  if(!veil){veil=document.createElement('div');veil.setAttribute('aria-hidden','true');
    veil.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;opacity:0;background:radial-gradient(120% 75% at 50% 42%,#16223a 0%,#0a1120 55%,#03050a 100%)'}
  document.body.appendChild(veil);veil.style.transition=rm?'none':'opacity .5s cubic-bezier(.2,.8,.2,1) .12s';
  requestAnimationFrame(function(){veil.style.opacity='1'});
  setTimeout(function(){location.assign(PLAYER)},rm?0:640)}
/* 1 · history writes that would open the Sound constellation or its player work */
['pushState','replaceState'].forEach(function(n){var f=history[n];history[n]=function(s,t,u){if(!bypass&&u!=null&&RE.test(hashOf(u))){dive('col');return}return f.apply(history,arguments)}});
/* 2 · deep link */
if(RE.test(location.hash)){history.replaceState(null,'',location.pathname+location.search);location.replace(PLAYER);return}
/* 3 · a same-page jump (typed / followed #sound link, or Back onto an old #sound/l2 entry) */
addEventListener('hashchange',function(){if(!RE.test(location.hash))return;bypass=1;try{history.replaceState(history.state,'',location.pathname+location.search)}finally{bypass=0}dive('col')});
/* 4 · the sky sheet: its handover calls __dive.go({k:'sound',lv:2},{push:false,quiet:true}) first (prepHand), then, once its
   fly-in is done, __dive.go({k:'sound',lv:2}) (commit). A tap / + goes at prepHand; a pinch is watched until it commits. */
var FG={};addEventListener('pointerdown',function(e){FG[e.pointerId]=1},true);
['pointerup','pointercancel'].forEach(function(t){addEventListener(t,function(e){delete FG[e.pointerId]},true)});
function fingers(){return Object.keys(FG).length}
var watch=0;function watchMorph(){if(watch)return;watch=1;var t0=performance.now();
  (function w(){if(going||!window.__sheet){watch=0;return}var s=__sheet.state(),nf=fingers();
    if(s.m>=.98||(nf===0&&s.m>=.32)){watch=0;dive('sheet');return}
    if(nf===0&&!s.moving&&s.m<.02&&performance.now()-t0>250){watch=0;return} /* the pinch was taken back */
    requestAnimationFrame(w)})()}
var D=window.__dive;
if(D&&D.go){var g0=D.go;D.go=function(r,o){o=o||{};
  if(!bypass&&soundOpen(r)){
    if(o.quiet&&o.push===false){var res=g0.apply(this,arguments);if(fingers()>=2)watchMorph();else dive('sheet');return res}
    dive(window.__sheet&&__sheet.isOpen()?'sheet':'col');return}
  return g0.apply(this,arguments)}}
/* 5 · Back from the player (bfcache): lift the veil, fold Sound back to its heading, and if you came from the sky sheet,
   put you back in the sky over the Sound constellation */
addEventListener('pageshow',function(e){if(!going&&!e.persisted)return;var f=from;going=0;from=null;if(veil&&veil.parentNode)veil.parentNode.removeChild(veil);
  bypass=1;try{if(window.__dive){var st=__dive.state();if(st.k==='sound'&&st.lv)g0({k:'sound',lv:0},{push:false,noAnim:true,quiet:true})}
    if(f==='sheet'&&window.__sheet){if(__sheet.isOpen())__sheet.close({quick:true});__sheet.open({})}}catch(x){}finally{bypass=0}});
/* warm the player's page + code while the Sound chapter is near (no audio: the player page loads that itself) */
var warmed=0;function prefetch(){if(warmed)return;warmed=1;attr('data-warm','sound/').split(/\s*,\s*/).forEach(function(h){if(!h)return;var l=document.createElement('link');l.rel='prefetch';l.href=new URL(h,document.baseURI).href;document.head.appendChild(l)})}
var snd=document.getElementById('sound');if(snd&&'IntersectionObserver' in window)new IntersectionObserver(function(es){if(es.some(function(x){return x.isIntersecting}))prefetch()},{rootMargin:'200px 0px'}).observe(snd);
if(window.__sheet)setTimeout(function(){if(__sheet.isOpen())prefetch()},1500);
window.__soundDive={going:function(){return !!going},player:PLAYER,from:function(){return from}};
})();
