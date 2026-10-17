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
/* the scene outlives the page it was born in: make its links absolute so they stay right after pushState */
if(scene)scene.querySelectorAll('[href],[src],[data-src],[srcset]').forEach(function(el){
  ['href','src','data-src'].forEach(function(a){var v=el.getAttribute(a);if(v&&v.charAt(0)!=='#'&&!/^[a-z]+:/i.test(v))el.setAttribute(a,new URL(v,location.href).href)});
  var ss=el.getAttribute('srcset');if(ss)el.setAttribute('srcset',ss.split(',').map(function(p){p=p.trim().split(/\s+/);p[0]=new URL(p[0],location.href).href;return p.join(' ')}).join(', '))});
/* head icons too: browsers re-resolve them against the new URL after pushState */
document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]').forEach(function(l){l.setAttribute('href',l.href)});
/* ---- per-page modules */
function visited(){var keys=(document.body.dataset.k||'').split(' ').filter(Boolean);if(!keys.length)return;
  try{var v=JSON.parse(localStorage.getItem('gj-visited')||'[]');keys.forEach(function(k){if(v.indexOf(k)<0)v.push(k)});localStorage.setItem('gj-visited',JSON.stringify(v))}catch(e){}}
function mount(main){ac=window.AbortController?new AbortController():{signal:{addEventListener:function(){},aborted:false},abort:function(){}};
  Object.keys(mods).forEach(function(k){try{mods[k](main,ac.signal)}catch(e){setTimeout(function(){throw e})}});visited()}
function unmount(main){main.querySelectorAll('video,audio').forEach(function(m){try{m.pause()}catch(e){}});ac&&ac.abort();d.classList.remove('player-open','frozen','modal')}
mount(document.getElementById('main'));
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
  var u=new URL(a.href);if(u.pathname===location.pathname)return; /* same page: a hash, handled natively / by the page */
  e.preventDefault();GJ.nav(a.href)});
addEventListener('popstate',function(){if(location.pathname===cur.path)return; /* a hash step inside the page */
  go(location.href,{pop:true})});
/* ---- the moves */
async function go(href,o){
  var my=++seq,to=pageOf(href),from=cur.page;if(to==null){location.reload();return}
  var docP=get(href),main=document.getElementById('main'),fr=rank(from),tr=rank(to);
  d.classList.add('busy');window.__sky.stop&&window.__sky.stop();
  try{
    /* 1. leave */
    if(from==='home'&&to!=='home'){var at=o.at||[];await GJ.surface.dive(at[0],at[1])}
    else{main.classList.add('out');await wait(260)}
    var doc=await docP;if(my!==seq)return;
    /* 2. swap header + main, keep the scene */
    unmount(main);
    var nh=doc.querySelector('header.top'),oh=document.querySelector('header.top');if(nh&&oh)oh.replaceWith(document.importNode(nh,true));
    var nm=document.importNode(doc.getElementById('main'),true);nm.classList.add('enter');main.replaceWith(nm);main=nm;
    document.title=doc.title;document.body.className=doc.body.className;document.body.dataset.k=doc.body.dataset.k||'';
    var mode=modeOf(to);d.classList.remove('m-surface','m-sky','m-section');d.classList.add('m-'+mode);
    var nvp=doc.querySelector('#scene .vp'),keys=nvp?nvp.dataset.focus||'':'';window.__sky.here(keys);
    cur={page:to,path:location.pathname};
    /* scroll: back/forward restores, a #section target scrolls to it, otherwise the top */
    var h=location.hash.slice(1),tgt=h&&!/=/.test(h)&&document.getElementById(h);
    window.scrollTo(0,o.pop&&history.state&&history.state.y||0);
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
    var f=main.querySelector('h1,h2');if(f&&!o.pop&&document.activeElement&&document.activeElement!==document.body&&!document.activeElement.isConnected){f.setAttribute('tabindex','-1');f.focus({preventScroll:true})}
  }catch(err){location.href=href;return}
  finally{if(my===seq)d.classList.remove('busy')}
}
GJ.go=go;
})();
