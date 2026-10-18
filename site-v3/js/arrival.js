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
var ARRIVAL_DEFAULT='v32',PROFILES={v32:{moon:'slot',hole:560,guard:600},v2:{moon:'v2',hole:620,guard:1500}};
var CFG=(function(){var q;try{q=new URLSearchParams(location.search)}catch(e){q={get:function(){return null}}}var n=q.get('arrival')||D.dataset.arrival||ARRIVAL_DEFAULT;if(!PROFILES[n])n=ARRIVAL_DEFAULT;
  var c={name:n,moon:PROFILES[n].moon,hole:PROFILES[n].hole,guard:PROFILES[n].guard};['moon','hole','guard'].forEach(function(k){var v=q.get('a-'+k);if(v!=null&&v!=='')c[k]=k==='moon'?v:Math.max(0,+v||0)});return c})();
var arr=-1,diving=false,dived=false,sunk=false,away=false,lastY=0,READY=performance.now()+CFG.guard,holeEl=null;
if(CFG.guard>=1000&&document.readyState!=='complete')addEventListener('load',function(){READY=performance.now()+CFG.guard}); /* v2: the guard counts from load */
function calc(){var y=scrollY;lastY=y;var x=Math.max(0,Math.min(1,1-y/(innerHeight*.55)));x=x*x*(3-2*x);
  if(sunk){if(y>60)away=true;if(away&&x>.9&&!diving)surface();else x=0} /* after a dive the water stays sunk until you come back up to the top */
  if(Math.abs(x-arr)>.003||(x===0&&arr!==0)||(x===1&&arr!==1)){arr=x;bd.style.setProperty('--arr',x.toFixed(3))} /* on the backdrop only: nothing else restyles */
}
addEventListener('scroll',calc,{passive:true}); /* one number per scroll event, no layout read */
/* the shader's moon sits where the page keeps a slot for it (beside the name, at arrival); the water is fixed, so the moon stays in the sky as you sink */
function place(){var W=window.__water;if(!W||!W.moon)return;var mob=innerWidth<900;
  if(CFG.moon==='v2'){W.moon(mob?.72:.665,mob?.21:.30,0);return} /* v2's hero moon spot, v2 size */
  if(CFG.moon==='v3'){W.moon(mob?.80:.72,mob?.13:.16,0);return}  /* v3.1's backdrop moon */
  if(!moonEl)return;var r=moonEl.getBoundingClientRect();if(!r.width)return;
  W.moon((r.left+r.width/2)/innerWidth,(r.top+scrollY+r.height/2)/innerHeight,r.width*.5/innerHeight)}
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){place();calc()},120)});
document.addEventListener('water:on',place);if(window.__water)place();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
/* touch the water */
var EX='a,button,input,select,textarea,label,summary,iframe,video,[role=button],[tabindex],.poem,.name,.roles,.hint,.ch,.dock,.imm,.sheet,.fly,.portal,.sky';
function onTap(e){if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||diving)return;
  if(D.classList.contains('modal')||D.classList.contains('sheet-on')||D.classList.contains('pinching')||arr<.35||performance.now()<READY)return;
  var t=e.target;if(!t||!t.closest||t.closest(EX)||!t.closest('body'))return;
  try{if(String(getSelection())!=='')return}catch(x){}
  e.preventDefault();dive(e.clientX,e.clientY)}
/* on the page itself, not the document: iOS Safari only sends a click for a tap on plain content when an ancestor below <body> listens */
[document.querySelector('header.top'),document.getElementById('main')].forEach(function(el){if(el)el.addEventListener('click',onTap)});
function dest(){return Math.max(0,chs.getBoundingClientRect().top+scrollY-4)}
function dive(x,y){diving=true;dived=true;sunk=true;away=false;D.classList.add('diving');bd.classList.add('sink');
  if(RM.matches){scrollTo(0,dest());diving=false;D.classList.remove('diving');bd.classList.remove('sink');calc();return}
  var W=window.__water,ok=!!(W&&W.live&&W.live()&&W.hole(x/innerWidth,y/innerHeight));
  if(!ok){holeEl=document.createElement('i');holeEl.className='bd-hole';holeEl.style.left=x+'px';holeEl.style.top=y+'px';bd.appendChild(holeEl);void holeEl.offsetWidth;holeEl.classList.add('open')}
  intro.classList.add('melt');
  /* ~0.6 s of the hole opening, then the fall: the constellations come up (native smooth scroll) and the water dims under them */
  setTimeout(function(){fall(dest())},CFG.hole)}
/* the fall: our own eased scroll (deterministic; a finger on the screen takes over at once) */
var grab=false;addEventListener('touchstart',function(){if(diving)grab=true},{passive:true});addEventListener('wheel',function(){if(diving)grab=true},{passive:true});
function fall(to){var y0=scrollY,d=to-y0,t0=performance.now(),T=Math.min(900,420+Math.abs(d)*.6);grab=false;
  (function f(now){var k=Math.min(1,(now-t0)/T),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;if(grab){end();return}scrollTo(0,Math.round(y0+d*e));if(k<1)requestAnimationFrame(f);else end()})(t0)}
function end(){diving=false;D.classList.remove('diving');setTimeout(function(){bd.classList.remove('sink')},900);var W=window.__water;if(W&&W.reset)W.reset(); /* back to the dim water under the Dive (the hole closes unseen, under the dim) */
  if(holeEl){var h=holeEl;holeEl=null;h.classList.add('gone');setTimeout(function(){h.remove()},500)}calc()}
function surface(){dived=false;sunk=false;away=false;intro.classList.remove('melt');var W=window.__water;if(W&&W.reset)W.reset()}
calc();
window.__arrival={cfg:CFG,state:function(){return{arr:arr,y:lastY,sunk:sunk,diving:diving,dived:dived,melt:intro.classList.contains('melt'),water:!!(window.__water&&__water.live&&__water.live())}},dive:dive};
})();
