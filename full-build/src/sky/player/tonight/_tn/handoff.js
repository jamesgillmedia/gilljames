/* Sky frame held across the room change. The constellation writes tn-handoff (dir in)
   before it leaves; this paints that frame over the room and scales it out, so the
   room grows from the tapped figure instead of a bare black wait. Leaving writes
   the same frame back (dir out) for the sky to shrink. */
(function(){
  'use strict';
  function play(){
    var raw;try{raw=sessionStorage.getItem('tn-handoff')}catch(e){return}
    if(!raw)return;
    var o;try{o=JSON.parse(raw)}catch(e){return}
    if(!o||o.dir!=='in'||!o.url||Date.now()-(o.t||0)>15000)return;
    try{sessionStorage.setItem('tn-sky',raw);sessionStorage.removeItem('tn-handoff')}catch(e){}
    var el=document.createElement('div');el.id='tn-handoff';el.setAttribute('aria-hidden','true');
    el.style.cssText='position:fixed;inset:0;z-index:95;pointer-events:none;background:#04070b center/cover no-repeat;transform-origin:'+(o.x||innerWidth/2)+'px '+(o.y||innerHeight/2)+'px';
    el.style.backgroundImage='url("'+o.url+'")';
    (document.body||document.documentElement).appendChild(el);
    setTimeout(function(){
      el.style.transition='transform .6s cubic-bezier(.2,.7,.2,1),opacity .6s linear';
      el.style.transform='scale(1.16)';el.style.opacity='0';
    },80);
    setTimeout(function(){if(el.parentNode)el.remove()},760);
  }
  if(document.body)play();else document.addEventListener('DOMContentLoaded',play);
  window.TN_HANDOFF={out:function(){
    try{var raw=sessionStorage.getItem('tn-sky');if(!raw)return;var o=JSON.parse(raw);o.dir='out';o.t=Date.now();sessionStorage.setItem('tn-handoff',JSON.stringify(o))}catch(e){}
  }};
})();
