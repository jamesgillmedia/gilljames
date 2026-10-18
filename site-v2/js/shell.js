/* The persistent shell: one long-lived scene (the water surface over the sky) for the whole site.
   Moving between /, /sky/ and the sections never reloads: the next page is fetched, its <main> and header are swapped in
   over the scene, history.pushState keeps the real URL, and Back/Forward (popstate) play the same moves in reverse:
     surface -> sky      dive  (the water opens, the poem melts, you fall into the sky)
     sky -> section      in    (the camera flies to the cluster, the page rises into the band window)
     section -> sky      out   (the page sinks, the camera pulls back to the whole sky)
     anything -> surface rise  (the page sinks, the water closes back over the sky from above)
   Every URL is still a complete page on a cold load, and without JS / fetch / pushState links are ordinary links.
   Audio (if one is ever added) must live in the scene, not in <main>, so it survives navigation. */
(function(){
'use strict';
var d=document.documentElement,GJ=window.GJ=window.GJ||{},mods=GJ.mods||{};
if(!GJ.t0)GJ.t0=Date.now(); /* set once per real page load; tests check it survives navigation */
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var ROOT=new URL(d.dataset.up||'./',location.href),PAGES={'':'home','sky/':'sky','film/':'film','photo/':'photo','objects/':'objects','sound/':'sound','about/':'about'};
var scene=document.getElementById('scene'),hero=scene&&scene.querySelector('.hero'),ac=null,seq=0,cache={};
function pageOf(href){try{var u=new URL(href,location.href)}catch(e){return null}
  if(u.origin!==location.origin||u.pathname.indexOf(ROOT.pathname)!==0)return null;
  var rest=u.pathname.slice(ROOT.pathname.length).replace(/index\.html$/,'');return PAGES.hasOwnProperty(rest)?PAGES[rest]:null}
function rank(p){return p==='home'?0:p==='sky'?1:2}
function modeOf(p){return p==='home'?'surface':p==='sky'?'sky':'section'}
function wait(ms){return new Promise(function(r){setTimeout(r,RM?0:ms)})}
function frame(){return new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})})}
var cur={page:pageOf(location.href),path:location.pathname};
/* data-up was relative to the cold-loaded page; after pushState it would resolve wrongly. Make it absolute once. */
d.dataset.up=ROOT.href;
/* opening an overlay (player / viewer) must not move the page: remember the scroll, put it back on close */
var lockY=null;new MutationObserver(function(){var m=d.classList.contains('modal');if(m&&lockY==null)lockY=typeof lastY==='number'?lastY:scrollY; /* the last scroll seen before the overlay (reading scrollY now would already be clamped) */else if(!m&&lockY!=null){var y=lockY;lockY=null;
  requestAnimationFrame(function(){if(Math.abs(scrollY-y)>2)window.scrollTo(0,y)})}}).observe(d,{attributes:true,attributeFilter:['class']});
/* the scene outlives the page it was born in: make its links absolute so they stay right after pushState */
var dock=document.querySelector('.dock'),lp=document.getElementById('listpanel');
[scene,dock,lp].forEach(function(box){if(box)box.querySelectorAll('[href],[src],[data-src],[srcset]').forEach(function(el){
  ['href','src','data-src'].forEach(function(a){var v=el.getAttribute(a);if(v&&v.charAt(0)!=='#'&&!/^[a-z]+:/i.test(v))el.setAttribute(a,new URL(v,location.href).href)});
  var ss=el.getAttribute('srcset');if(ss)el.setAttribute('srcset',ss.split(',').map(function(p){p=p.trim().split(/\s+/);p[0]=new URL(p[0],location.href).href;return p.join(' ')}).join(', '))})});
function dockNow(){if(dock)dock.querySelectorAll('a').forEach(function(a){if(pageOf(a.href)===cur.page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
/* head icons too: browsers re-resolve them against the new URL after pushState */
document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]').forEach(function(l){l.setAttribute('href',l.href)});
/* ---- per-page modules */
function visited(){var keys=(document.body.dataset.k||'').split(' ').filter(Boolean);if(!keys.length)return;
  try{var v=JSON.parse(localStorage.getItem('gj-visited')||'[]');keys.forEach(function(k){if(v.indexOf(k)<0)v.push(k)});localStorage.setItem('gj-visited',JSON.stringify(v))}catch(e){}}
function mount(main){ac=window.AbortController?new AbortController():{signal:{addEventListener:function(){},aborted:false},abort:function(){}};
  Object.keys(mods).forEach(function(k){try{mods[k](main,ac.signal)}catch(e){setTimeout(function(){throw e})}});visited()}
function unmount(main){main.querySelectorAll('video,audio').forEach(function(m){try{m.pause()}catch(e){}});ac&&ac.abort();d.classList.remove('player-open','frozen','modal')}
/* C-09 #2: the last crumb names the work that is open (film, photo); null clears it */
GJ.crumb=function(t){var c=document.querySelector('.crumb .cw');if(!c)return;if(t){c.textContent=t;c.hidden=false;if(!c.previousElementSibling||!c.previousElementSibling.classList.contains('sep2')){var s=document.createElement('span');s.className='sep sep2';s.setAttribute('aria-hidden','true');s.textContent='›';c.parentNode.insertBefore(s,c)}}
  else{c.hidden=true;c.textContent='';var p=c.previousElementSibling;if(p&&p.classList.contains('sep2'))p.remove()}};
mount(document.getElementById('main'));
/* C-09 #7: ≡ list flips to the plain list of every work, and back to the sky in place */
function listSet(on){if(!lp)return;lp.hidden=!on;d.classList.toggle('listopen',on);var t=document.querySelector('.listtog');
  if(t){t.setAttribute('aria-expanded',String(on));var sp=t.querySelector('span');if(sp)sp.textContent=on?'close list':'list';var ic=t.querySelector('i');if(ic)ic.textContent=on?'✕':'≡'}
  if(on){lp.scrollTop=0;var f=lp.querySelector('a');f&&f.focus({preventScroll:true})}}
GJ.list=listSet;
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.listtog');
  if(t&&lp){e.preventDefault();listSet(lp.hidden);return}
  if(lp&&!lp.hidden&&e.target.closest&&e.target.closest('#listpanel a'))listSet(false)},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lp&&!lp.hidden){listSet(false);var t=document.querySelector('.listtog');t&&t.focus()}});
/* ---- controls appear in context: visible on arrival, on any touch / tap / key / mouse move / scroll up, and while a
   finger is down; they fade after ~2.5 s idle, while scrolling down, or while the sky flies. Focus keeps them. */
var idleT=0,held=false,lastY=scrollY,scrT=0;
var wkT=0;function wake(ms){if(d.classList.contains('ui-idle')){d.classList.add('ui-waking');clearTimeout(wkT);wkT=setTimeout(function(){d.classList.remove('ui-waking')},350)}d.classList.remove('ui-idle');clearTimeout(idleT);if(!held)idleT=setTimeout(function(){if(!held&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.top,.dock,.zctl,.listbtn,.scope')))d.classList.add('ui-idle')},typeof ms==='number'?ms:2500)}
GJ.wake=wake;
document.addEventListener('pointerdown',function(){held=true;d.classList.add('ui-hold');wake()},{passive:true});
document.addEventListener('pointerup',function(){held=false;d.classList.remove('ui-hold');wake()},{passive:true});
document.addEventListener('pointercancel',function(){held=false;d.classList.remove('ui-hold');wake()},{passive:true});
document.addEventListener('keydown',wake);document.addEventListener('focusin',wake);
document.addEventListener('mousemove',function(e){if(e.movementX||e.movementY)wake()},{passive:true});
addEventListener('scroll',function(){var y=scrollY;d.classList.toggle('scrolled',y>8);if(!d.classList.contains('scrolling'))d.classList.add('scrolling');clearTimeout(scrT);scrT=setTimeout(function(){d.classList.remove('scrolling');wake()},180); /* scrolling stopped: the controls come back */
  if(y>lastY+4&&y>80&&!held&&d.classList.contains('player-open')){clearTimeout(idleT);d.classList.add('ui-idle')}else if(y<lastY-4)wake();lastY=y},{passive:true});
/* arrival: the controls stay until the page has loaded and been seen for a while */
wake(1e9);if(document.readyState==='complete')wake(4000);else addEventListener('load',function(){wake(4000)});
var CAN=!!(window.fetch&&window.DOMParser&&history.pushState&&window.Promise&&scene&&window.__sky);
GJ.nav=function(href,o){if(!CAN||pageOf(href)==null){location.href=href;return}
  try{history.replaceState(Object.assign({},history.state,{gj:1,y:scrollY}),'')}catch(e){}
  history.pushState({gj:1,y:0},'',href);go(href,o||{})};
if(!CAN)return;
if('scrollRestoration' in history)history.scrollRestoration='manual';
try{history.replaceState(Object.assign({},history.state,{gj:1}),'')}catch(e){}
/* ---- fetch + preload */
function get(href){var k=href.split('#')[0];if(!cache[k])cache[k]=fetch(k,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.text()})
  .then(function(t){return new DOMParser().parseFromString(t,'text/html')}).catch(function(e){delete cache[k];throw e});return cache[k]}
function warm(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var p=pageOf(a.href);if(p!=null&&new URL(a.href).pathname!==location.pathname)get(a.href).catch(function(){})}
document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('touchstart',warm,{passive:true});document.addEventListener('focusin',warm);
/* ---- clicks */
document.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var a=e.target.closest&&e.target.closest('a[href]');if(!a||(a.target&&a.target!=='_self')||a.hasAttribute('download'))return;
  if(pageOf(a.href)==null)return;
  var u=new URL(a.href);if(u.pathname===location.pathname){
    if(u.hash)return; /* same page + a hash: handled natively / by the page */
    /* the tab, crumb or list link of the page you are on: no reload. Close the list (and an open player), back to the top */
    e.preventDefault();listSet(false);var px=document.querySelector('.player-open .scope .x:not([hidden])');if(px)px.click();
    if(window.__sky&&d.classList.contains('m-sky')&&__sky.whole)__sky.whole();
    var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;try{scrollTo({top:0,behavior:rm?'auto':'smooth'})}catch(_){scrollTo(0,0)}return}
  e.preventDefault();GJ.nav(a.href)});
var svT=0;addEventListener('scroll',function(){clearTimeout(svT);svT=setTimeout(function(){try{history.replaceState(Object.assign({},history.state,{gj:1,y:scrollY}),'')}catch(e){}},200)},{passive:true});
addEventListener('popstate',function(){if(location.pathname===cur.path)return; /* a hash step inside the page */
  go(location.href,{pop:true})});
/* ---- the moves */
async function go(href,o){
  clearTimeout(svT);if(lp&&!lp.hidden)listSet(false);  var my=++seq,to=pageOf(href),from=cur.page;if(to==null){location.reload();return}
  var docP=get(href),main=document.getElementById('main'),fr=rank(from),tr=rank(to);
  d.classList.add('busy');window.__sky.stop&&window.__sky.stop();
  try{
    /* 1. leave */
    if(from==='home'&&to!=='home'){var at=o.at||[];await GJ.surface.dive(at[0],at[1])}
    else{main.classList.add('out');await wait(260)}
    var doc=await docP;if(my!==seq)return;
    /* 2. swap header + main, keep the scene */
    lockY=null;unmount(main);
    var nh=doc.querySelector('header.top'),oh=document.querySelector('header.top');if(nh&&oh)oh.replaceWith(document.importNode(nh,true));
    var nm=document.importNode(doc.getElementById('main'),true);nm.classList.add('enter');main.replaceWith(nm);main=nm;
    document.title=doc.title;document.body.className=doc.body.className;document.body.dataset.k=doc.body.dataset.k||'';
    var mode=modeOf(to);d.classList.remove('m-surface','m-sky','m-section');d.classList.add('m-'+mode);
    var nvp=doc.querySelector('#scene .vp'),keys=nvp?nvp.dataset.focus||'':'';window.__sky.here(keys);
    cur={page:to,path:location.pathname};dockNow();wake(4000);
    /* scroll: back/forward restores, a #section target scrolls to it, otherwise the top */
    var h=location.hash.slice(1),tgt=h&&!/=/.test(h)&&document.getElementById(h);
    var want=o.pop&&history.state&&history.state.y||0;window.scrollTo(0,want);
    /* Back: images above may still be loading and shorten the page; keep restoring until the user scrolls */
    if(want){var userMoved=false,um=function(){userMoved=true};addEventListener('touchstart',um,{passive:true,once:true});addEventListener('wheel',um,{passive:true,once:true});
      [120,400,900].forEach(function(t){setTimeout(function(){if(!userMoved&&my===seq&&Math.abs(scrollY-want)>2)window.scrollTo(0,want)},t)})}
    /* 3. arrive */
    if(mode==='surface'){window.__sky.mode('off');window.__sky.whole(0);GJ.surface.reset();window.__water&&window.__water.active(true);
      if(!RM&&hero){hero.classList.remove('rising');void hero.offsetWidth;hero.classList.add('rising');setTimeout(function(){hero.classList.remove('rising')},900)}}
    else{window.__water&&window.__water.active(false);
      if(mode==='sky'){window.__sky.mode('full');if(fr===0)window.__sky.fall(1000);else window.__sky.whole(RM?0:750)}
      else{window.__sky.mode('band');var ck=(h.match(/^([a-z]+)$/)||[])[1],one=ck&&scene.querySelector('.cl[data-k="'+ck+'"]')?ck:keys;window.__sky.focus(one,RM?0:(fr===0?1000:fr===tr?650:750))}}
    mount(main);GJ.reveal&&GJ.reveal(main);
    await frame();main.classList.remove('enter');
    if(tgt&&!o.pop)setTimeout(function(){tgt.scrollIntoView({block:'start'})},RM?0:420);
    if(mode!=='surface'&&hero)setTimeout(function(){if(my===seq&&!d.classList.contains('m-surface'))hero.classList.remove('melt','open-css')},700);
    /* focus moves to the new page's heading after every swap, Back/Forward included (screen readers hear where they are) */
    var f=main.querySelector('h1')||main.querySelector('h2');if(f){f.setAttribute('tabindex','-1');try{f.focus({preventScroll:true})}catch(_){}}
  }catch(err){location.href=href;return}
  finally{if(my===seq)d.classList.remove('busy')}
}
GJ.go=go;
})();
