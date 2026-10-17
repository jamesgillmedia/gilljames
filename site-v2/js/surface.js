/* the surface (the water over the sky): light the clusters you've visited, feed the reflected stars to the water shader,
   and the dive: touch the water -> ripple hole onto stars -> the poem melts -> fall into the sky (0.6 s).
   Navigation itself belongs to js/shell.js (GJ.nav); without the shell the dive falls back to a normal page load. */
(function(){
  var hero=document.querySelector('.hero');if(!hero)return;
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
  function dive(x,y){var b=hero.getBoundingClientRect();if(x==null){x=b.width/2;y=b.height*.7}
    hero.classList.add('melt');
    if(!RM&&!(window.__water&&window.__water.hole(x/b.width,y/b.height))){hero.style.setProperty('--hx',x+'px');hero.style.setProperty('--hy',y+'px');hero.classList.add('open-css')}
    return new Promise(function(r){setTimeout(r,RM?0:620)})}
  /* back on the surface: undo the melt, close the hole, relight visited clusters */
  function reset(){going=false;hero.classList.remove('melt','open-css');window.__water&&window.__water.reset&&window.__water.reset();lit();feed()}
  GJ.surface={dive:dive,reset:reset,lit:lit,feed:feed};
  hero.addEventListener('click',function(e){
    if(e.target.closest('.snd'))return;
    var a=e.target.closest('a'),href=a?a.href:new URL((document.documentElement.dataset.up||'./')+'sky/',location.href).href;
    if(a&&!a.closest('.hero'))return;
    if(!document.documentElement.classList.contains('m-surface'))return;
    e.preventDefault();if(going)return;going=true;
    var b=hero.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
    if(!e.clientX&&!e.clientY){x=null;y=null}
    if(GJ.nav){GJ.nav(href,{at:[x,y]});return}
    dive(x,y).then(function(){location.href=href})});
  /* bfcache restore on a full-load fallback: undo the melt */
  addEventListener('pageshow',function(e){if(e.persisted&&document.documentElement.classList.contains('m-surface'))reset()});
})();
