/* gill james v3.2 · Moonwater arrival. At the top of the home sheet the water and the crescent moon are bright, full strength
   (v2's hero): --arr = 1. Scrolling down fades it (scroll-linked) back to the dim Dive backdrop (--arr -> 0); back at the top it returns.
   Touch the water (anywhere that is not a link, the poem or a chapter) -> a ripple hole opens under the finger onto the stars, the poem
   melts, and you fall into the Dive (the constellations scroll up). Reduced motion: no hole, no melt, a plain jump to the Dive.
   The moon is drawn by the water shader at the .moon slot beside the name (js/water.js __water.moon). Passive listeners only. */
(function(){
'use strict';
var D=document.documentElement,B=document.body;if(!B||!B.classList.contains('home-p'))return;
var RM=matchMedia('(prefers-reduced-motion: reduce)'),intro=document.querySelector('.intro'),chs=document.querySelector('.chs'),moonEl=document.querySelector('.id .moon'),bd=document.querySelector('.backdrop');
if(!intro||!chs||!bd)return;
/* ---- arrival profile: easy to switch while Gill picks. 'v32' = this build; 'v2' = v2 surface.js behaviour (v2 moon spot + size,
   0.62 s of hole before the fall, 1.5 s guard against queued taps after load). Pick per visit with ?arrival=v2 / ?arrival=v32,
   or per knob: ?a-moon=slot|v2|v3  ?a-hole=620  ?a-guard=1500. Change the default here (or <html data-arrival="v2">). ---- */
/* v3.2.1: Gill compares the ripples on the live site, numbered as in Sketch Artist's comparison (sketches/ripples/README.md):
   1 = v1  early mobile c08 water (soft: drawn at 1x, big moon under the name, brightest: no dim gradient, cyan tap flash + 0.5 s hole)
   2 = v2  site v2 Moonwater (sharp 2x, big moon under the name, ring-hole dive)
   3 = v3  v3 / v3.1 dim backdrop (no bright arrival, the v3.1 grey moon top right, a tap does nothing)
   5 = v32 v3.2 current (default). ?arrival=v1|v2|v3|v32 (or 1|2|3|5); the switcher on the arrival screen flips live and remembers it
   for the session (sessionStorage), and keeps ?arrival= in the address so a reload or a shared link shows the same one. */
var ARRIVAL_DEFAULT='v32',ALIAS={'1':'v1','2':'v2','3':'v3','5':'v32','4':'v32'},
  PROFILES={v1:{n:'1',moon:'v2',hole:500,guard:1500,dpr:1,bright:2,flash:1,dive:1},v2:{n:'2',moon:'v2',hole:620,guard:1500,dpr:2,bright:1,flash:0,dive:1},
            v3:{n:'3',moon:'v3',hole:560,guard:600,dpr:2,bright:0,flash:0,dive:0},v32:{n:'5',moon:'slot',hole:560,guard:600,dpr:2,bright:1,flash:0,dive:1}};
var Q;try{Q=new URLSearchParams(location.search)}catch(e){Q={get:function(){return null}}}
function pname(n){n=n==null?'':String(n).toLowerCase();n=ALIAS[n]||n;return PROFILES[n]?n:''}
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
function mkcfg(n,knobs){var P=PROFILES[n],c={name:n,num:P.n,moon:P.moon,hole:P.hole,guard:P.guard,dpr:P.dpr,bright:P.bright,flash:P.flash,dive:P.dive};
  if(knobs)['moon','hole','guard'].forEach(function(k){var v=Q.get('a-'+k);if(v!=null&&v!=='')c[k]=k==='moon'?v:Math.max(0,+v||0)});return c}
var CFG=mkcfg(pname(Q.get('arrival'))||pname(ss('gj-arrival'))||pname(D.dataset.arrival)||ARRIVAL_DEFAULT,true);
D.dataset.arv=CFG.name;
var arr=-1,diving=false,dived=false,sunk=false,away=false,lastY=0,landY=60,sk=0,READY=performance.now()+CFG.guard,holeEl=null;
if(CFG.guard>=1000&&document.readyState!=='complete')addEventListener('load',function(){READY=performance.now()+CFG.guard}); /* v2: the guard counts from load */
function calc(){var y=scrollY;lastY=y;var x=Math.max(0,Math.min(1,1-y/(innerHeight*.55)));x=x*x*(3-2*x);if(!CFG.bright)x=0; /* 3: the v3 dim backdrop, never bright */
  /* after a dive the water stays sunk until you come back up to the top. v3.4: the thresholds follow where the dive landed (landY), so a
     short dive works too: in landscape (and on wide screens) the chapters sit beside the poem and the dive only travels ~44 px, which never
     passed the old fixed 60 px "away" mark, so swiping back up left the poem and water switched off */
  if(sunk){if(y>=Math.min(60,Math.max(8,landY*.6)))away=true;if(away&&!diving&&y<=Math.min(innerHeight*.11,landY*.5))surface();else x=0}
  if(Math.abs(x-arr)>.003||(x===0&&arr!==0)||(x===1&&arr!==1)){arr=x;bd.style.setProperty('--arr',x.toFixed(3))} /* on the backdrop only: nothing else restyles */
  /* v3.4: how far into the dive you are, measured to where the dive lands (0 at the top, 1 at the landing). The backdrop's deep water and
     night (css: max(--depth, --sunk)) follow it, so a short landscape dive (~44 px) ends as dark as the portrait one (~450 px) instead of
     leaving the moon half-sunk; swiping back up lifts it again over the same short distance */
  var k=sunk?Math.max(0,Math.min(1,y/Math.max(1,landY))):0;if(Math.abs(k-sk)>.003||(k===0&&sk!==0)||(k===1&&sk!==1)){sk=k;bd.style.setProperty('--sunk',k.toFixed(3))}
}
addEventListener('scroll',calc,{passive:true}); /* one number per scroll event, no layout read */
/* the shader's moon sits where the page keeps a slot for it (beside the name, at arrival); the water is fixed, so the moon stays in the sky as you sink */
function place(){var W=window.__water;if(!W||!W.moon)return;var mob=innerWidth<900;
  if(W.res)W.res(CFG.dpr===1?(mob?1:1.5):2); /* 1: c08 drew the water at 1x on a phone (soft) */
  if(CFG.moon==='v2'){W.moon(mob?.72:.665,mob?.21:.30,mob?.058:.072);return} /* v2's hero moon spot, v2 size (big) */
  if(CFG.moon==='v3'){W.moon(mob?.80:.72,mob?.13:.16,mob?.058:.072);return}  /* v3.1's backdrop moon */
  if(!moonEl)return;var r=moonEl.getBoundingClientRect();if(!r.width)return;
  W.moon((r.left+r.width/2)/innerWidth,(r.top+scrollY+r.height/2)/innerHeight,r.width*.5/innerHeight)}
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){place();calc()},120)});
document.addEventListener('water:on',place);if(window.__water)place();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
/* touch the water */
var EX='.arv,a,button,input,select,textarea,label,summary,iframe,video,[role=button],[tabindex],.poem,.name,.roles,.hint,.ch,.dock,.imm,.sheet,.fly,.portal,.sky';
function onTap(e){if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||diving||!CFG.dive)return;
  if(D.classList.contains('modal')||D.classList.contains('sheet-on')||D.classList.contains('pinching')||arr<.35||performance.now()<READY)return;
  var t=e.target;if(!t||!t.closest||t.closest(EX)||!t.closest('body'))return;
  try{if(String(getSelection())!=='')return}catch(x){}
  e.preventDefault();dive(e.clientX,e.clientY)}
/* on the page itself, not the document: iOS Safari only sends a click for a tap on plain content when an ancestor below <body> listens */
[document.querySelector('header.top'),document.getElementById('main')].forEach(function(el){if(el)el.addEventListener('click',onTap)});
function dest(){return Math.max(0,chs.getBoundingClientRect().top+scrollY-4)}
function dive(x,y){diving=true;dived=true;sunk=true;away=false;landY=dest();D.classList.add('diving');bd.classList.add('sink');
  if(RM.matches){scrollTo(0,landY);diving=false;D.classList.remove('diving');bd.classList.remove('sink');land();return}
  var W=window.__water,ok=!!(W&&W.live&&W.live()&&W.hole(x/innerWidth,y/innerHeight));
  if(!ok){holeEl=document.createElement('i');holeEl.className='bd-hole';holeEl.style.left=x+'px';holeEl.style.top=y+'px';bd.appendChild(holeEl);void holeEl.offsetWidth;holeEl.classList.add('open')}
  if(CFG.flash){var fl=document.createElement('i');fl.className='bd-flash';fl.style.left=x+'px';fl.style.top=y+'px';bd.appendChild(fl);setTimeout(function(){fl.remove()},700)} /* 1: c08's cyan tap flash */
  intro.classList.add('melt');
  /* ~0.6 s of the hole opening, then the fall: the constellations come up (native smooth scroll) and the water dims under them */
  setTimeout(function(){fall(dest())},CFG.hole)}
/* the fall: our own eased scroll (deterministic; a finger on the screen takes over at once) */
var grab=false;addEventListener('touchstart',function(){if(diving)grab=true},{passive:true});addEventListener('wheel',function(){if(diving)grab=true},{passive:true});
function fall(to){var y0=scrollY,d=to-y0,t0=performance.now(),T=Math.min(900,420+Math.abs(d)*.6);grab=false;
  (function f(now){var k=Math.min(1,(now-t0)/T),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;if(grab){end();return}scrollTo(0,Math.round(y0+d*e));if(k<1)requestAnimationFrame(f);else end()})(t0)}
function end(){diving=false;D.classList.remove('diving');setTimeout(function(){bd.classList.remove('sink')},900);var W=window.__water;if(W&&W.reset)W.reset(); /* back to the dim water under the Dive (the hole closes unseen, under the dim) */
  if(holeEl){var h=holeEl;holeEl=null;h.classList.add('gone');setTimeout(function(){h.remove()},500)}land()}
/* the dive has landed (or a finger took over): remember where, so the way back up is measured from there. Interrupted before it really
   moved (or nothing to scroll to) = no dive: bring the poem and water straight back instead of leaving a sunk arrival at the top */
function land(){landY=scrollY;if(landY<8){surface();calc();return}away=true;calc()}
var riseT=0;function surface(){dived=false;sunk=false;away=false;intro.classList.remove('melt');var W=window.__water;if(W&&W.reset)W.reset();
  bd.classList.add('rise');clearTimeout(riseT);riseT=setTimeout(function(){bd.classList.remove('rise')},900)} /* the water and moon fade back up (no jump) */
/* the version switcher (1 2 3 5): small, at the foot of the arrival, buttons only (the water stays touchable around it) */
var SW=null;function swUI(){if(!SW)return;[].forEach.call(SW.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',b.dataset.arv===CFG.name?'true':'false')})}
function setArrival(n,o){n=pname(n);if(!n)return false;o=o||{};var c=mkcfg(n,false);for(var k in c)CFG[k]=c[k];D.dataset.arv=n;
  if(o.remember!==false){ss('gj-arrival',n);try{var u=new URL(location.href);u.searchParams.set('arrival',n);['a-moon','a-hole','a-guard'].forEach(function(k){u.searchParams.delete(k)});history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}}
  if(diving){/* let the fall finish first */}else if(sunk&&!c.dive){surface()}
  place();calc();swUI();return true}
(function(){var hint=intro.querySelector('.hint');SW=document.createElement('div');SW.className='arv';SW.setAttribute('role','group');SW.setAttribute('aria-label','compare ripple versions');
  SW.innerHTML='<span aria-hidden="true">ripple</span>'+['v1','v2','v3','v32'].map(function(n){return '<button type="button" data-arv="'+n+'" aria-label="ripple version '+PROFILES[n].n+'">'+PROFILES[n].n+'</button>'}).join('');
  SW.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(b)setArrival(b.dataset.arv)});
  if(hint&&hint.nextSibling)intro.insertBefore(SW,hint.nextSibling);else intro.appendChild(SW);swUI()})();
calc();
window.__arrival={set:setArrival,cfg:CFG,state:function(){return{arr:arr,y:lastY,sunk:sunk,diving:diving,dived:dived,melt:intro.classList.contains('melt'),water:!!(window.__water&&__water.live&&__water.live())}},dive:dive};
})();
