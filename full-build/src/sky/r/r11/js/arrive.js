/* r11 · Hire card and the one-time poem / water dive. The sky underneath is w7. */
(function(){
'use strict';
var D=document.documentElement,RM=matchMedia('(prefers-reduced-motion: reduce)');
var btn=document.querySelector('.hire'),card=document.querySelector('.hire-card');
function hire(open){if(!card)return;card.hidden=!open;btn.setAttribute('aria-expanded',open?'true':'false');
  if(open){var x=card.querySelector('.hire-x');try{x.focus()}catch(e){}}}
if(btn&&card){
  btn.addEventListener('click',function(e){e.stopPropagation();hire(card.hidden)});
  card.querySelector('.hire-x').addEventListener('click',function(){hire(false)});
  document.addEventListener('click',function(e){if(card.hidden)return;if(e.target.closest('.hire-card,.hire'))return;hire(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!card.hidden){e.stopPropagation();hire(false)}},true);
}

var arrive=document.getElementById('arrive');
if(!arrive||!D.classList.contains('arriving'))return;
var lines=[].slice.call(arrive.querySelectorAll('.poem span'));
var page=0,per=lines.length,busy=false;
function clashes(){var band=arrive.querySelector('.waterband');if(!band)return false;var edge=band.getBoundingClientRect().bottom;
  return lines.some(function(s){if(s.hidden)return false;return s.getBoundingClientRect().top<edge-1})}
function fit(){lines.forEach(function(s){s.hidden=false});
  var box=arrive.querySelector('.poem');
  per=lines.length;show();
  while(per>3&&(box.scrollHeight>box.clientHeight+2||clashes())){per--;show()}}
function show(){lines.forEach(function(s,i){s.hidden=i<page||i>=page+per});
  var hint=arrive.querySelector('.hint');
  hint.textContent=page+per<lines.length?'tap for the rest · or skip':'touch the water · fall into the sky'}
function nextPage(){if(page+per<lines.length){page+=per;show();return true}return false}
function release(){arrive.remove();D.classList.remove('arriving');
  if(window.__releaseArrival)__releaseArrival()}
function dive(x,y){if(busy)return;if(nextPage())return;busy=true;arrive.classList.add('melt');
  if(RM.matches){release();return}
  var t0=performance.now(),max=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+40;
  function frame(t){var k=Math.min(1,(t-t0)/680),r=max*(1-Math.pow(1-k,3));
    var m='radial-gradient(circle '+r+'px at '+x+'px '+y+'px, transparent '+r+'px, #000 '+(r+.5)+'px)';
    arrive.style.webkitMaskImage=m;arrive.style.maskImage=m;
    if(k<1)requestAnimationFrame(frame);else release()}
  requestAnimationFrame(frame)}
arrive.addEventListener('click',function(e){if(e.target.closest('.skip'))return;dive(e.clientX,e.clientY)});
arrive.querySelector('.skip').addEventListener('click',function(e){e.stopPropagation();page=lines.length;dive(innerWidth/2,innerHeight*0.55)});
addEventListener('resize',fit);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
requestAnimationFrame(function(){requestAnimationFrame(fit)});
setTimeout(fit,300);
fit();
})();
