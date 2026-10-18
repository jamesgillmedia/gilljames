/* the surface (the water over the sky): light the clusters you've visited, feed the reflected stars to the water shader,
   and the dive: touch the water -> ripple hole onto stars -> the poem melts -> fall into the sky (0.6 s).
   Navigation itself belongs to js/shell.js (GJ.nav); without the shell the dive falls back to a normal page load. */
(function(){
  var hero=document.querySelector('.hero');if(!hero)return;
  /* the intro is seen first: taps or swipes queued while the page was still loading (slow phones, laggy remote input)
     don't dive straight past it */
  /* resolved once at boot, against the page this document was loaded as (the shell's pushState must not change it) */
  var SKYURL=new URL((document.documentElement.dataset.up||'./')+'sky/',location.href).href;
  var READY=performance.now()+1500;function ready(){return performance.now()>READY}
  if(document.readyState!=='complete')addEventListener('load',function(){READY=performance.now()+1500});
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,going=false,GJ=window.GJ=window.GJ||{};
  function lit(){var seen=[];try{seen=JSON.parse(localStorage.getItem('gj-visited')||'[]')}catch(e){}
    seen.forEach(function(k){hero.querySelectorAll('.refl [data-k="'+k+'"]').forEach(function(el){el.classList.add('lit')})})}
  lit();
  function feed(){var W=window.__water;if(!W||!W.live())return;var b=hero.getBoundingClientRect(),a=[];if(!b.width)return;
    hero.querySelectorAll('.refl').forEach(function(L){if(getComputedStyle(L).display==='none')return;
      L.querySelectorAll('.rd').forEach(function(d){var r=d.getBoundingClientRect();a.push([(r.left+r.width/2-b.left)/b.width,(r.top+r.height/2-b.top)/b.height,d.classList.contains('lit')?1.1:.5])})});
    W.stars(a);hero.classList.add('gl-stars')}
  document.addEventListener('water:on',feed);if(window.__water)feed();
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(feed,200)});
  /* open the water at (x,y) in hero pixels; resolves when it's time to fall */
  function seenWater(){try{localStorage.setItem('gj-dived','1')}catch(e){}}
  function dive(x,y){var b=hero.getBoundingClientRect();if(x==null){x=b.width/2;y=b.height*.7}
    hero.classList.add('melt');
    if(!RM&&!(window.__water&&window.__water.hole(x/b.width,y/b.height))){hero.style.setProperty('--hx',x+'px');hero.style.setProperty('--hy',y+'px');hero.classList.add('open-css')}
    return new Promise(function(r){setTimeout(r,RM?0:620)})}
  /* back on the surface: undo the melt, close the hole, relight visited clusters */
  function reset(){going=false;hero.classList.remove('melt','open-css');window.__water&&window.__water.reset&&window.__water.reset();lit();feed()}
  GJ.surface={dive:dive,reset:reset,lit:lit,feed:feed};
  hero.addEventListener('click',function(e){
    if(e.target.closest('.snd'))return;
    var a=e.target.closest('a'),href=a?a.href:SKYURL;
    if(a&&!a.closest('.hero'))return;
    if(!document.documentElement.classList.contains('m-surface'))return;
    e.preventDefault();if(going||!ready())return;going=true;
    var b=hero.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
    if(!e.clientX&&!e.clientY){x=null;y=null}
    seenWater();if(GJ.nav){GJ.nav(href,{at:[x,y]});return}
    dive(x,y).then(function(){location.href=href})});
  /* home is one screen: a swipe up (or a scroll / wheel down on desktop) also dives, from where the finger started.
     Passive listeners on the hero only; nothing on window/document/body. */
  function go(x,y){if(going||!document.documentElement.classList.contains('m-surface'))return;going=true;seenWater();var u=SKYURL;
    if(GJ.nav){GJ.nav(u,{at:[x,y]});return}dive(x,y).then(function(){location.href=u})}
  var t0=null;
  hero.addEventListener('touchstart',function(e){if(e.touches.length!==1){t0=null;return}var t=e.touches[0],b=hero.getBoundingClientRect();t0=ready()?{x:t.clientX-b.left,y:t.clientY-b.top,cy:t.clientY,cx:t.clientX,t:Date.now()}:null},{passive:true});
  hero.addEventListener('touchend',function(e){if(!t0)return;var t=e.changedTouches[0],dy=t.clientY-t0.cy,dx=t.clientX-t0.cx,o=t0;t0=null;
    if(dy<-80&&Math.abs(dx)<Math.abs(dy)*.7&&Date.now()-o.t<1500){dive.swiped=true;go(o.x,o.y)}},{passive:true});
  var wsum=0,wT=0;hero.addEventListener('wheel',function(e){if(e.ctrlKey)return;if(!ready())return;wsum+=e.deltaY;clearTimeout(wT);wT=setTimeout(function(){wsum=0},400);if(wsum>120){wsum=0;var b=hero.getBoundingClientRect();go(e.clientX-b.left,e.clientY-b.top)}},{passive:true});
  /* bfcache restore on a full-load fallback: undo the melt */
  addEventListener('pageshow',function(e){if(e.persisted&&document.documentElement.classList.contains('m-surface'))reset()});
})();
