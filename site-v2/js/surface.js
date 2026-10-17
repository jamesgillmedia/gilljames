/* the surface (home): light the clusters you've visited, feed the reflected stars to the water shader,
   and the dive: touch the water -> ripple hole onto stars -> the poem melts -> fall into the sky (0.6 s). */
(function(){
  var hero=document.querySelector('.hero');if(!hero)return;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,going=false;
  var seen=[];try{seen=JSON.parse(localStorage.getItem('gj-visited')||'[]')}catch(e){}
  seen.forEach(function(k){document.querySelectorAll('.refl [data-k="'+k+'"]').forEach(function(el){el.classList.add('lit')})});
  function feed(){var W=window.__water;if(!W||!W.live())return;var b=hero.getBoundingClientRect(),a=[];
    document.querySelectorAll('.refl').forEach(function(L){if(getComputedStyle(L).display==='none')return;
      L.querySelectorAll('.rd').forEach(function(d){var r=d.getBoundingClientRect();a.push([(r.left+r.width/2-b.left)/b.width,(r.top+r.height/2-b.top)/b.height,d.classList.contains('lit')?1.1:.5])})});
    W.stars(a);hero.classList.add('gl-stars')}
  document.addEventListener('water:on',feed);if(window.__water)feed();
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(feed,200)});
  hero.addEventListener('click',function(e){
    if(e.target.closest('.snd'))return;
    var a=e.target.closest('a'),href=a?a.getAttribute('href'):'sky/';
    if(a&&!a.closest('.hero'))return;
    if(RM){if(!a)location.href=href;return} /* reduced motion: no ripple, no dive, just go */
    e.preventDefault();if(going)return;going=true;
    var b=hero.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
    if(!e.clientX&&!e.clientY){x=b.width/2;y=b.height*.7}
    try{sessionStorage.setItem('gj-nav',JSON.stringify({dir:'dive',x:x,y:y}))}catch(_){}
    hero.classList.add('melt');
    if(!(window.__water&&window.__water.hole(x/b.width,y/b.height))){hero.style.setProperty('--hx',x+'px');hero.style.setProperty('--hy',y+'px');hero.classList.add('open-css')}
    setTimeout(function(){location.href=href},620)});
  /* coming back up with the back button (bfcache): undo the melt */
  addEventListener('pageshow',function(e){if(!e.persisted)return;going=false;hero.classList.remove('melt','open-css');window.__water&&window.__water.reset&&window.__water.reset();
    seen=[];try{seen=JSON.parse(localStorage.getItem('gj-visited')||'[]')}catch(_){}
    seen.forEach(function(k){document.querySelectorAll('.refl [data-k="'+k+'"]').forEach(function(el){el.classList.add('lit')})});feed()});
})();
