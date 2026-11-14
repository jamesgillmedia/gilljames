/* v2 · the water ripple, back on the tiled moon-and-water page.
 Touch anywhere (a tap, or drawing a finger across) and the water ripples where you touched: rings travel out through the
 Moonwater shader (js/water.js __water.ripple) with a faint ring of light on top (m4's rippleAt ring, the same one the m4 opener
 and the snow-water mark use). Down in the sky at the bottom, where the water is dark, the light ring alone still answers the
 touch (turn it off in the dbg panel). Passive listeners only: scroll, pinch and taps work exactly as before. Two fingers =
 no ripple (that is a pinch). Same with Reduce Motion on. */
(function(){
'use strict';
var D=document.documentElement,bd=document.querySelector('.backdrop');if(!bd)return;
var K='gj-ripple';function load(){try{return JSON.parse(sessionStorage.getItem(K))||{}}catch(e){return {}}}
var OPT=Object.assign({water:true,sky:true},load());
function save(){try{sessionStorage.setItem(K,JSON.stringify(OPT))}catch(e){}}
var lay=document.createElement('div');lay.className='riplayer';lay.setAttribute('aria-hidden','true');bd.appendChild(lay);
/* the sky (and the whole-sky sheet) are drawn above the water, so its ring has its own layer just above them (under the dbg panel) */
var slay=document.createElement('div');slay.className='riplayer riplayer-sky';slay.setAttribute('aria-hidden','true');document.body.appendChild(slay);
var n=0;function ring(x,y,cls,sky){if(n>24)return;var s=document.createElement('i');s.className='rip'+(cls?' '+cls:'');s.style.left=x+'px';s.style.top=y+'px';(sky?slay:lay).appendChild(s);n++;
  setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);n--},1700)}
function night(){var v=parseFloat(getComputedStyle(D).getPropertyValue('--night'));return isFinite(v)?v:0}
function at(x,y,soft){
  var nt=night(),W=window.__water,sky=nt>=.9||D.classList.contains('sheet-on')||!!(document.elementFromPoint(x,y)&&document.elementFromPoint(x,y).closest('.sheet,.portal,.fly'));
  if(!sky){if(!OPT.water)return;if(W&&W.ripple)W.ripple(x/innerWidth,y/innerHeight,soft?.6:1);ring(x,y,soft?'soft':'');return}
  if(OPT.sky)ring(x,y,'sky'+(soft?' soft':''),true);
}
var P={},cnt=0;
function skip(e){var t=e.target;return !!(t&&t.closest&&t.closest('#gjdbg,input,select,textarea'))}
addEventListener('pointerdown',function(e){if(e.button>0||skip(e))return;P[e.pointerId]={x:e.clientX,y:e.clientY,acc:0};cnt=Object.keys(P).length;if(cnt>1)return;at(e.clientX,e.clientY,false)},{capture:true,passive:true});
addEventListener('pointermove',function(e){var p=P[e.pointerId];if(!p||cnt>1||e.pointerType==='touch')return;p.acc+=Math.hypot(e.clientX-p.x,e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;
  if(p.acc>70){p.acc=0;at(e.clientX,e.clientY,true)}},{capture:true,passive:true});
function up(e){delete P[e.pointerId];cnt=Object.keys(P).length}
addEventListener('pointerup',up,{capture:true,passive:true});
/* on a phone the browser takes a moving finger for scrolling and cancels the pointer, so the trail follows the touch itself */
var T=null;addEventListener('touchstart',function(e){T=e.touches.length===1&&!skip(e)?{x:e.touches[0].clientX,y:e.touches[0].clientY,acc:0}:null},{capture:true,passive:true});
addEventListener('touchmove',function(e){if(!T||e.touches.length!==1)return;var t=e.touches[0];T.acc+=Math.hypot(t.clientX-T.x,t.clientY-T.y);T.x=t.clientX;T.y=t.clientY;
  if(T.acc>70){T.acc=0;at(t.clientX,t.clientY,true)}},{capture:true,passive:true});
addEventListener('touchend',function(e){if(!e.touches.length)T=null},{capture:true,passive:true});addEventListener('pointercancel',up,{capture:true,passive:true});
/* dbg panel: two switches */
function ui(){var pane=document.getElementById('gjdbgpane'),tune=document.getElementById('gjdbgtune');if(!pane||!tune){setTimeout(ui,120);return}
  var box=document.createElement('div');box.className='gjrip';
  box.innerHTML='<h4>ripple</h4><label class="gjsw"><input type="checkbox" data-r="water"> water ripple</label><label class="gjsw"><input type="checkbox" data-r="sky"> ring on the sky</label>';
  tune.parentNode.insertBefore(box,tune.nextSibling);
  [].forEach.call(box.querySelectorAll('input'),function(i){i.checked=!!OPT[i.dataset.r];i.addEventListener('change',function(){OPT[i.dataset.r]=i.checked;save()})})}
ui();
window.__ripple={at:at,opt:OPT,count:function(){return lay.childElementCount+slay.childElementCount}};
})();
