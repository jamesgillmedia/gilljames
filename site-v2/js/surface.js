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
  /* the poem is never covered: the reflected names are mapped into the free band between the poem's last line and
     the first-visit line / tab bar (only moved or squeezed when they would touch; dots and lines move with them) */
  function fit(){var L=hero.querySelector('.refl.port'),po=hero.querySelector('.poem');if(!L||!po)return;L.style.top='';L.style.bottom='';
    if(getComputedStyle(L).display==='none')return;
    var hb=hero.getBoundingClientRect(),R=[].map.call(L.querySelectorAll('.rc'),function(e){return e.getBoundingClientRect()});if(!R.length||!hb.height)return;
    var pgr=hero.querySelector('.ppager'),P=Math.max(po.getBoundingClientRect().bottom,pgr&&!pgr.hidden?pgr.getBoundingClientRect().bottom:0)-hb.top+6,top=1e9,bot=-1e9,hh=0;
    R.forEach(function(r){top=Math.min(top,r.top-hb.top);bot=Math.max(bot,r.bottom-hb.top);hh=Math.max(hh,r.height)});
    var dv=hero.querySelector('.dive'),dk=document.querySelector('.dock'),lim=hb.height,t;
    if(dk){t=dk.getBoundingClientRect().top-hb.top;if(t>0)lim=Math.min(lim,t)}
    if(dv&&getComputedStyle(dv).display!=='none'){t=dv.getBoundingClientRect().top-hb.top;if(t>P)lim=Math.min(lim,t)}
    lim-=2;if(top>=P&&bot<=lim)return;
    var h2=hh/2,ct=top+h2,cb=bot-h2,s=Math.max(.5,Math.min(1,(lim-h2-(P+h2))/Math.max(1,cb-ct))),ct1=P+h2;
    if(top>=P)ct1=Math.max(P+h2,(lim-h2)-(cb-ct)*s);
    var T0=L.offsetTop,h0=L.offsetHeight,T1=ct1+(T0-ct)*s,h1=h0*s;
    L.style.top=T1.toFixed(1)+'px';L.style.bottom=(hb.height-T1-h1).toFixed(1)+'px'}
  /* the whole poem (15 lines). Shown in full where it fits above the water names / hint / tab bar; otherwise it steps
     through in pages with a visible "more of the poem ›" button (no fade, no hidden-until-tap first page). */
  var PG=0,PAGES=null;
  function bars(hb){var dv=hero.querySelector('.dive'),dk=document.querySelector('.dock'),lim=hb.height,t;
    if(dk){t=dk.getBoundingClientRect().top-hb.top;if(t>0)lim=Math.min(lim,t)}
    if(dv&&getComputedStyle(dv).display!=='none'){t=dv.getBoundingClientRect().top-hb.top;if(t>0)lim=Math.min(lim,t)}return lim}
  function showPage(){var po=hero.querySelector('.poem'),pg=hero.querySelector('.ppager');if(!PAGES||!po||!pg)return;
    PG=Math.max(0,Math.min(PG,PAGES.length-1));[].forEach.call(po.children,function(s){s.classList.toggle('pg-off',PAGES[PG].indexOf(s)<0)});
    pg.hidden=false;var hb=hero.getBoundingClientRect();pg.style.top=(po.getBoundingClientRect().bottom-hb.top+4).toFixed(0)+'px';
    pg.querySelector('.pp-n').textContent=(PG+1)+' / '+PAGES.length;pg.querySelector('.pp-prev').disabled=PG===0;
    var nx=pg.querySelector('.pp-next');nx.textContent=PG<PAGES.length-1?'more of the poem ›':'from the top ↺';nx.toggleAttribute('data-last',PG===PAGES.length-1)}
  function fitPoem(){var po=hero.querySelector('.poem'),pg=hero.querySelector('.ppager');if(!po||!pg)return;
    var S=[].slice.call(po.children);S.forEach(function(x){x.classList.remove('pg-off')});pg.hidden=true;PAGES=null;
    var hb=hero.getBoundingClientRect();if(!hb.height)return;
    var L=hero.querySelector('.refl.port'),port=L&&getComputedStyle(L).display!=='none',need=0;if(L){L.style.top='';L.style.bottom=''}
    if(port){var a=1e9,b=-1e9,hh=44;[].forEach.call(L.querySelectorAll('.rc'),function(e){var r=e.getBoundingClientRect();a=Math.min(a,r.top);b=Math.max(b,r.bottom);hh=r.height});need=Math.max(hh*2.4,(b-a)*.5)+6}
    var pr=po.getBoundingClientRect(),room=bars(hb)-need-(pr.top-hb.top);
    if(pr.height<=room)return;
    var avail=room-50,pages=[],cur=[],h=24;
    S.forEach(function(x){var sh=x.getBoundingClientRect().height;if(cur.length&&h+sh>avail){pages.push(cur);cur=[];h=24}cur.push(x);h+=sh});if(cur.length)pages.push(cur);
    if(pages.length<2)return;
    var per=Math.ceil(S.length/pages.length);pages=[];for(var i=0;i<S.length;i+=per)pages.push(S.slice(i,i+per)); /* even pages */
    PAGES=pages;showPage()}
  (function(){var pg=hero.querySelector('.ppager');if(!pg)return;
    pg.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var b=e.target.closest('button');if(!b||!PAGES)return;
      if(b.classList.contains('pp-prev'))PG--;else PG=PG<PAGES.length-1?PG+1:0;showPage();fit();feed()})})();
  function layout(){fitPoem();fit();feed()}
  GJ.fitRefl=layout;layout();
  document.addEventListener('water:on',feed);if(window.__water)feed();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
  addEventListener('load',layout);
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(layout,200)});
  /* open the water at (x,y) in hero pixels; resolves when it's time to fall */
  function seenWater(){try{localStorage.setItem('gj-dived','1')}catch(e){}}
  function dive(x,y){var b=hero.getBoundingClientRect();if(x==null){x=b.width/2;y=b.height*.7}
    hero.classList.add('melt');
    if(!RM&&!(window.__water&&window.__water.hole(x/b.width,y/b.height))){hero.style.setProperty('--hx',x+'px');hero.style.setProperty('--hy',y+'px');hero.classList.add('open-css')}
    return new Promise(function(r){setTimeout(r,RM?0:620)})}
  /* back on the surface: undo the melt, close the hole, relight visited clusters */
  function reset(){going=false;hero.classList.remove('melt','open-css');window.__water&&window.__water.reset&&window.__water.reset();lit();layout()}
  GJ.surface={dive:dive,reset:reset,lit:lit,feed:feed};
  hero.addEventListener('click',function(e){
    if(e.target.closest('.snd,.ppager'))return;
    if(multi){e.preventDefault();return} /* a pinch never dives */
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
  var multi=false,mT=0;function zoomed(){return !!(window.visualViewport&&visualViewport.scale>1.01)}
  hero.addEventListener('touchstart',function(e){if(e.touches.length!==1){t0=null;multi=true;clearTimeout(mT);return}if(e.target.closest('.ppager')){t0=null;return}var t=e.touches[0],b=hero.getBoundingClientRect();t0=ready()?{x:t.clientX-b.left,y:t.clientY-b.top,cy:t.clientY,cx:t.clientX,t:Date.now()}:null},{passive:true});
  hero.addEventListener('touchcancel',function(e){t0=null;if(!e.touches.length){clearTimeout(mT);mT=setTimeout(function(){multi=false},450)}},{passive:true});
  if(window.visualViewport)visualViewport.addEventListener('resize',function(){document.documentElement.classList.toggle('vzoom',zoomed())});
  hero.addEventListener('touchend',function(e){if(multi&&!e.touches.length){clearTimeout(mT);mT=setTimeout(function(){multi=false},450)}if(!t0||multi||zoomed()){t0=null;return}var t=e.changedTouches[0],dy=t.clientY-t0.cy,dx=t.clientX-t0.cx,o=t0;t0=null;
    if(dy<-80&&Math.abs(dx)<Math.abs(dy)*.7&&Date.now()-o.t<1500){dive.swiped=true;go(o.x,o.y)}},{passive:true});
  var wsum=0,wT=0;hero.addEventListener('wheel',function(e){if(e.ctrlKey)return;if(!ready())return;wsum+=e.deltaY;clearTimeout(wT);wT=setTimeout(function(){wsum=0},400);if(wsum>120){wsum=0;var b=hero.getBoundingClientRect();go(e.clientX-b.left,e.clientY-b.top)}},{passive:true});
  /* bfcache restore on a full-load fallback: undo the melt */
  addEventListener('pageshow',function(e){if(e.persisted&&document.documentElement.classList.contains('m-surface'))reset()});
})();
