/* Photo lab · Horizon: the night sky, the drying line, rippling reflections, rings on the water (Nov 13, 2026 pass,
   built toward Sketch's calibre frames, decision 4 = B: a dark night sky, black water, no silver shelf, prints never graded).
   - A few real prints hang on a line across the top of the sky, pegged at the top. When the horizon moves (drag, wheel,
     keys) the line sways a little and settles; nothing moves on its own after that. Tap a print to stand it on the horizon.
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

/* ---------- the drying line ---------- */
var line=document.createElement('div');line.id='dline';line.setAttribute('aria-label','prints drying on a line: tap one to stand it on the horizon');
var svg=document.createElementNS(NS,'svg');svg.setAttribute('class','dl-svg');svg.setAttribute('aria-hidden','true');var path=document.createElementNS(NS,'path');svg.appendChild(path);line.appendChild(svg);
sky.appendChild(line);
var PR=[],y0=0,sag=0,bob=0,bobV=0,W=0,ph=0;
function pick(n){var L=LAB.horizon.list(),out=[];if(!L.length)return out;for(var k=0;k<n;k++){out.push(L[Math.min(L.length-1,Math.round((k+.5)*L.length/n))])}return out}
var warmed={};
function shot(p){var src=LAB.th(p);var im=warmed[src];if(im)return im;
  im=new Image();im.alt='';im.decoding='async';im.fetchPriority='high';im.src=src;warmed[src]=im;return im}
function warmLine(){var L=LAB.horizon.list(),n=innerWidth<500?5:innerWidth<900?6:8;if(!L.length)return;
  for(var k=0;k<n;k++)shot(L[Math.min(L.length-1,Math.round((k+.5)*L.length/n))])}
warmLine();
function build(){PR.forEach(function(p){p.el.remove()});PR=[];W=innerWidth;var n=W<500?5:W<900?6:8;
  var hb=bar?bar.getBoundingClientRect().bottom:50;y0=Math.round(hb+(W<620?12:18));ph=W<620?54:W<1100?70:82;sag=W<620?10:16;
  pick(n).forEach(function(p,k){var el=document.createElement('button');el.type='button';el.className='dlp';el.setAttribute('aria-label','photograph '+LAB.num(p)+': stand it on the horizon');
    var h=ph,w=Math.max(ph*.62,Math.min(ph*1.35,ph*p.w/p.h));el.style.width=w+'px';el.style.height=h+'px';el.style.marginLeft=(-w/2)+'px';
    var im=shot(p);if(im.parentNode)im.parentNode.removeChild(im);
    var show=function(){el.classList.add('in')};
    if(im.complete&&im.naturalWidth)show();
    else if(im.decode)im.decode().then(show,function(){im.addEventListener('load',show,{once:true});im.addEventListener('error',show,{once:true})});
    else{im.addEventListener('load',show,{once:true});im.addEventListener('error',show,{once:true})}
    el.appendChild(im);el.appendChild(document.createElement('i'));
    el.addEventListener('click',function(e){e.stopPropagation();var i=LAB.horizon.indexOf(p);if(i>=0)LAB.horizon.go(i);kick(.6)});
    el.addEventListener('pointerdown',function(e){e.stopPropagation()});
    line.appendChild(el);PR.push({el:el,p:p,x:W*(k+.5)/n,th:((k%2?1:-1)*(.9+k*.13)),v:0,ph:.7+((k*37)%10)/14})});
  svg.setAttribute('width',W);svg.setAttribute('height',y0+sag+30);paintLine();}
function yAt(x){var u=2*x/W-1;return y0+(sag+bob)*(1-u*u)}
function paintLine(){var d='M-10 '+yAt(-10).toFixed(1);for(var x=0;x<=W+10;x+=W/24)d+=' L'+x.toFixed(1)+' '+yAt(x).toFixed(1);path.setAttribute('d',d);
  PR.forEach(function(q){q.el.style.transform='translate('+q.x.toFixed(1)+'px,'+(yAt(q.x)-3).toFixed(1)+'px) rotate('+q.th.toFixed(2)+'deg)'})}
LAB.lineBottom=function(){return y0?y0+sag+ph+8:0};
/* sway: each print is a damped pendulum about its peg; the line bobs with them */
var raf=0,last=null,lastT=0;
function kick(a){PR.forEach(function(q,k){q.v+=a*14*q.ph*(k%2?1:-1)});bobV+=a*3;if(!raf)raf=requestAnimationFrame(step)}
function step(t){raf=0;var dt=Math.min(.25,lastT?(t-lastT)/1000:.016);lastT=t;var live=false;
  var fp=LAB.horizon.fpos();if(last!=null){var dv=fp-last;if(Math.abs(dv)>2e-3){var kv=Math.max(-1.2,Math.min(1.2,dv));PR.forEach(function(q){q.v+=kv*-40*q.ph});bobV+=Math.abs(kv)*4}}last=fp;
  /* fixed 1/120 s sub-steps, so the sway looks and settles the same at any frame rate */
  for(var n=Math.max(1,Math.round(dt*120)),h=dt/n,j=0;j<n;j++){PR.forEach(function(q){q.v+=(-110*q.th-9*q.v)*h;q.th+=q.v*h;if(q.th>8){q.th=8;q.v=0}else if(q.th<-8){q.th=-8;q.v=0}});
    bobV+=(-120*bob-10*bobV)*h;bob+=bobV*h}
  PR.forEach(function(q){if(Math.abs(q.th)>.03||Math.abs(q.v)>.05)live=true});if(Math.abs(bob)>.05||Math.abs(bobV)>.05)live=true;
  paintLine();if(live)raf=requestAnimationFrame(step);else lastT=0}
/* follow the horizon: any move of the standing print reaches the line */
(function watch(){var p0=LAB.horizon.fpos();setInterval(function(){var p=LAB.horizon.fpos();if(Math.abs(p-p0)>1e-3&&!raf){last=p0;raf=requestAnimationFrame(step)}p0=p},120)})();

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
