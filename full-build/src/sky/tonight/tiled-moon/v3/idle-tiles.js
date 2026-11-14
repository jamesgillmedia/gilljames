/* tiled-moon-v3 · idle tiles (Gill, voice, Nov 12 2:21 AM).
 In: after IDLE_MS with no pointer / touch / wheel / scroll / key, the five category tiles take over the screen, one tile per
 screen, edge to edge. Never while sound or a film is playing, a control (ambience tray, a slider, the debug panel) is in use,
 the page is hidden, or you are inside a work. The tiles NEVER move on their own: only their appearance is idle-triggered.
 Between tiles: swipe sideways (native scroll-snap, so trackpads work), arrow keys, or the dots. Tap a tile = open that chapter.
 Out: swipe up or down, swipe past the first or last tile, Escape, or the "water" button. You land exactly where you were,
 and the idle timer starts again from zero. Reduce Motion changes nothing. */
(function(){
'use strict';
var IDLE_MS=9000;                          /* the idle delay: change here */
var ORDER=[['film','film'],['photo','photos'],['objects','objects'],['spaces','spaces'],['about','about'],['sound','sound']];
var D=document.documentElement,B=document.body,open=false,timer=0,savedY=0,lastExit=0;
if(!B||!B.classList.contains('home-p'))return;
var Q;try{Q=new URLSearchParams(location.search)}catch(e){Q={get:function(){return null}}}
if(Q.get('idle')==='0')return;
var ms=+Q.get('idle');if(ms>0)IDLE_MS=ms;   /* ?idle=3000 for QA; ?idle=0 turns it off */
function head(k){return document.querySelector('#'+k+' > .head')}
var ov=document.createElement('div');ov.id='idle-tiles';ov.className='itl';ov.hidden=true;
ov.setAttribute('role','dialog');ov.setAttribute('aria-label','categories');
var track=document.createElement('div');track.className='itl-track';ov.appendChild(track);
var dots=document.createElement('div');dots.className='itl-dots';dots.setAttribute('role','tablist');
ORDER.forEach(function(o,i){var k=o[0],h=head(k);
  var s=document.createElement('section');s.className='itl-tile itl-'+k;s.dataset.k=k;s.setAttribute('aria-label',o[1]);
  var g=h&&h.querySelector('svg.glyph'),ct=h&&h.querySelector('.ct'),sum=document.querySelector('#'+k+' .sum');
  s.innerHTML='<div class="itl-img" style="background-image:url(v3/tiles/'+k+'.webp)"></div><div class="itl-water"></div>'+
    '<a class="itl-go" href="'+(h?h.getAttribute('href'):k+'/')+'"><span class="itl-glyph"></span><span class="itl-nm">'+o[1]+'</span>'+
    (ct?'<span class="itl-ct">'+ct.textContent+'</span>':'')+'<span class="itl-in">open ›</span></a>';
  if(g){var gc=g.cloneNode(true);gc.removeAttribute('width');gc.removeAttribute('height');s.querySelector('.itl-glyph').appendChild(gc)}
  s.querySelector('.itl-go').addEventListener('click',function(e){e.preventDefault();enter(k)});
  track.appendChild(s);
  var d=document.createElement('button');d.type='button';d.className='itl-dot';d.setAttribute('role','tab');d.setAttribute('aria-label',o[1]);
  d.addEventListener('click',function(){go(i)});dots.appendChild(d)});
ov.appendChild(dots);
var out=document.createElement('button');out.type='button';out.className='itl-out';out.innerHTML='<i aria-hidden="true"></i>water';out.setAttribute('aria-label','back to the page');
out.addEventListener('click',function(){hide()});ov.appendChild(out);
var hint=document.createElement('p');hint.className='itl-hint';hint.textContent='swipe sideways · swipe up to return';ov.appendChild(hint);
B.appendChild(ov);
function idx(){return Math.round(track.scrollLeft/Math.max(1,track.clientWidth))}
function go(i){i=Math.max(0,Math.min(ORDER.length-1,i));track.scrollTo({left:i*track.clientWidth,behavior:'smooth'});mark(i)}
function mark(i){[].forEach.call(dots.children,function(d,j){d.setAttribute('aria-selected',j===i?'true':'false')})}
track.addEventListener('scroll',function(){mark(idx())},{passive:true});
function busy(){
  if(document.hidden||open)return true;
  if(/\/(w\d+|play)|\/l3/.test(location.hash))return true;                 /* inside a work / the player */
  var m=document.querySelectorAll('audio,video');for(var i=0;i<m.length;i++){var v=m[i];if(!v.paused&&!v.ended&&!v.muted&&v.volume>0)return true}
  if(document.querySelector('.ambui.open,#gjdbg.open,.imm.on,.scope.on')||D.classList.contains('tm-on'))return true;
  var a=document.activeElement;if(a&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))return true;
  return false}
function arm(){clearTimeout(timer);timer=setTimeout(fire,IDLE_MS)}
function fire(){if(busy()){arm();return}show()}
function show(){if(open)return;open=true;savedY=scrollY;ov.hidden=false;D.classList.add('itl-on');
  track.scrollLeft=0;mark(0);requestAnimationFrame(function(){ov.classList.add('in')});
  try{ov.querySelector('.itl-go').focus({preventScroll:true})}catch(e){}}
function hide(cb){if(!open)return;ov.classList.remove('in');D.classList.remove('itl-on');
  setTimeout(function(){ov.hidden=true;open=false;scrollTo(0,savedY);lastExit=performance.now();arm();if(cb)cb()},420)}
function enter(k){hide(function(){var h=head(k);if(!h)return;
  var sec=document.getElementById(k);if(sec)sec.scrollIntoView({block:'start'});
  if(h.getAttribute('aria-expanded')!=='true')h.click()})}
/* activity resets the timer (only while the tiles are closed) */
['pointerdown','pointermove','touchstart','wheel','keydown','scroll'].forEach(function(t){addEventListener(t,function(){if(!open)arm()},{passive:true,capture:true})});
/* exits: vertical swipe, swipe past either end, Escape, a vertical wheel push */
var sx=0,sy=0,si=0,st=0;
ov.addEventListener('touchstart',function(e){var t=e.touches[0];sx=t.clientX;sy=t.clientY;si=idx();st=track.scrollLeft},{passive:true});
ov.addEventListener('touchend',function(e){var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
  if(Math.abs(dy)>60&&Math.abs(dy)>Math.abs(dx)*1.3){hide();return}
  if(si===0&&dx>70&&track.scrollLeft<=2&&st<=2){hide();return}
  if(si===ORDER.length-1&&dx<-70&&track.scrollLeft>=track.scrollWidth-track.clientWidth-2){hide()}},{passive:true});
var wy=0,wt=0;ov.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)>Math.abs(e.deltaX)*1.5){var n=performance.now();if(n-wt>400)wy=0;wt=n;wy+=e.deltaY;if(Math.abs(wy)>140){wy=0;hide()}}},{passive:true});
/* mouse drag on desktop: sideways drag between tiles, vertical drag out */
var md=null;ov.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;md={x:e.clientX,y:e.clientY,l:track.scrollLeft,i:idx(),m:0}});
addEventListener('pointermove',function(e){if(!md)return;var dx=e.clientX-md.x;md.m=Math.max(md.m,Math.abs(dx),Math.abs(e.clientY-md.y));track.style.scrollSnapType='none';track.scrollLeft=md.l-dx});
addEventListener('pointerup',function(e){if(!md)return;var dx=e.clientX-md.x,dy=e.clientY-md.y,i=md.i;track.style.scrollSnapType='';
  var m=md;md=null;if(m.m<8)return;
  if(Math.abs(dy)>80&&Math.abs(dy)>Math.abs(dx)*1.3){go(i);hide();return}
  if((i===0&&dx>90)||(i===ORDER.length-1&&dx<-90)){go(i);hide();return}
  go(dx<-50?i+1:dx>50?i-1:i)});
ov.addEventListener('click',function(e){if(md===null&&e.detail&&e.target.closest('.itl-go')&&Math.abs(track.scrollLeft-idx()*track.clientWidth)>4)e.preventDefault()},true);
addEventListener('keydown',function(e){if(!open)return;
  if(e.key==='Escape'||e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();hide()}
  else if(e.key==='ArrowRight'){e.preventDefault();var i=idx();if(i>=ORDER.length-1)hide();else go(i+1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();var j=idx();if(j<=0)hide();else go(j-1)}});
addEventListener('resize',function(){if(open)track.scrollLeft=idx()*track.clientWidth},{passive:true});
arm();
window.__idleTiles={show:show,hide:hide,go:go,get open(){return open},get index(){return idx()},IDLE_MS:IDLE_MS};
})();
