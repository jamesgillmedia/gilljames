/* Photo lab · Horizon: the night sky, the drying line, rippling reflections, rings on the water (Nov 13, 2026 pass,
   built toward Sketch's calibre frames, decision 4 = B: a dark night sky, black water, no silver shelf, prints never graded).
   - The top thumbnail strip is not on this shelf. The night sky, the water and the rings stay.
   - The reflections in the water ripple softly; a touch on the water sends out a ring from that point.
   - The photographs are shown as they are: no filter, tint or grade on any print or on the standing photograph.
   Dev-only variants (../_tn/variants.js): A prints on a line (default) · B camera back first (Gill's Nov 11 DSLR back screen:
   sheet, 9-up, 4-up, one, closer, by dial or pinch). Switching keeps the photograph you are on.
   Nothing reads prefers-reduced-motion, so the output is the same with it on. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var sky=$('sky'),bar=document.querySelector('.lab-top');if(!sky||!window.LAB||!LAB.horizon)return;
var NS='http://www.w3.org/2000/svg';

/* ---------- night sky: far stars and a faint milky band, drawn once per size (fixed seed) ---------- */
var st=document.createElement('canvas');st.id='nsky';st.setAttribute('aria-hidden','true');sky.insertBefore(st,sky.firstChild);
function drawSky(){var W=innerWidth,H=innerHeight,HY=LAB.horizon.hy(),d=Math.min(2,devicePixelRatio||1);st.width=W*d;st.height=HY*d;st.style.height=HY+'px';
  var g=st.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,HY);
  g.save();g.translate(W*.5,HY*.42);g.rotate(-.32);var bg=g.createLinearGradient(0,-HY*.16,0,HY*.16);bg.addColorStop(0,'rgba(170,185,210,0)');bg.addColorStop(.5,'rgba(170,185,210,.035)');bg.addColorStop(1,'rgba(170,185,210,0)');
  g.fillStyle=bg;g.fillRect(-W,-HY*.16,W*2,HY*.32);g.restore();
  var s=11;function r(){s=(s*16807)%2147483647;return s/2147483647}
  for(var i=0;i<Math.round(W*HY/2600);i++){var x=r()*W,y=r()*HY*.96,a=(.06+r()*.3)*(1-y/HY*.5),rr=.35+r()*.7;g.fillStyle='rgba(225,230,240,'+a.toFixed(2)+')';g.beginPath();g.arc(x,y,rr,0,6.283);g.fill()}}

/* The top thumbnail strip is not on this shelf. Stars, the water and the rings stay. */
var PR=[];
LAB.lineBottom=function(){return 0};
function build(){}
function kick(){}

/* ---------- reflections ripple ---------- */
var fs=document.createElementNS(NS,'svg');fs.setAttribute('width','0');fs.setAttribute('height','0');fs.setAttribute('aria-hidden','true');fs.style.position='absolute';
fs.innerHTML='<filter id="hzRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.055" numOctaves="1" seed="4"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="10" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.4"/></filter>';
document.body.appendChild(fs);

/* ---------- rings on the water from the touched point ---------- */
sky.addEventListener('pointerdown',function(e){var HY=LAB.horizon.hy();if(e.clientY<HY+6)return;var r=document.createElement('span');r.className='wring';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';sky.appendChild(r);setTimeout(function(){r.remove()},2300)});

function relayout(){build();LAB.horizon.size();drawSky()}
addEventListener('resize',function(){clearTimeout(relayout.t);relayout.t=setTimeout(relayout,60)});
relayout();setTimeout(relayout,400);/* fonts settle the bar height */
kick(.5);

/* ---------- dev variants: the A/B switch lives in the tune drawer, not the top bar ---------- */
function camOpen(){return LAB.layer.top()==='camera back'}
function apply(v){if(v==='B'){if(!camOpen()){var c=$('cam');if(c)c.click()}}else if(camOpen())LAB.layer.back()}
var tv=window.TNV&&TNV.mount({room:'photo',def:'A',list:[{k:'A',name:'prints on a line'},{k:'B',name:'camera back first'}],onChange:apply});
if(tv&&tv.v==='B')setTimeout(function(){apply('B')},300);
var more=$('more');if(more)more.addEventListener('click',function(){var box=document.querySelector('.lab-modes');if(!box)return;var on=box.classList.toggle('open');more.setAttribute('aria-expanded',on?'true':'false')});
if(window.GJ_MARKMENU)GJ_MARKMENU.variant('photo',{
  k:'tn.v.photo',label:'layout',dev:1,def:'A',
  seg:[['A','A · prints on a line'],['B','B · camera back']],
  get:function(){return tv?tv.v:'A'},
  apply:function(v){if(tv)tv.set(v)}
});
window.__line={get prints(){return PR.map(function(q){var r=q.el.getBoundingClientRect();return {n:LAB.num(q.p),x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,th:q.th}})},kick:kick,get v(){return tv?tv.v:'A'},set:function(v){tv&&tv.set(v)}};

/* NAV: the mark never loops. At the horizon (the lab's first view) it goes back to the photo star in the sky;
   from any deeper place (day page, sheet, camera back, wall) it comes back to the horizon first. Was href="./" only, which
   reloaded the lab forever and dropped the sky referrer, so the mark could never leave (a trap). */
(function(){var m=document.querySelector('.lab-top .sig');if(!m)return;
  function sky(){if(window.TN_HANDOFF)TN_HANDOFF.out();if(history.length>1){history.back();return}location.href='../fable-m4/#/'}
  m.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    if(window.GJ_MARKMENU&&GJ_MARKMENU.open){GJ_MARKMENU.show(false);return}
    var t=LAB.layer.top();
    /* the contact sheet is the root (no layer). One step to the line, never straight to the sky. */
    if(!t){if(LAB.rooms)LAB.rooms.enter(null);return}
    /* day, camera back, wall, darkroom: one step toward the line */
    if(t!=='horizon'){LAB.layer.back();return}
    sky()},true)})();
})();
