/* site-v3-pro2 · nav: ONE where-am-I line and ONE back control, the same element in the same place over every view.
   ‹  ᑕᐣᓯ › film › frames            (the sky: the chapter in view + its zoom level; no ‹ at a chapter's first level)
   ‹  ᑕᐣᓯ › film › demo reel 012 / 201  (the reel layer)       ‹  ᑕᐣᓯ › film › BMW Legends (a work)
   ‹  ᑕᐣᓯ › sound › inside the waveform (the player layer)     ‹  ᑕᐣᓯ › the whole sky (the sky sheet)
   ‹ always means "out one step, back to the exact spot you came from" and is the same move as Esc, pinch-out and the browser's Back
   (each layer's own close is hidden: css/nav.css). Hidden on the water (the top of the page) and while the mark is on. */
(function(){
'use strict';
var D=document.documentElement,$=function(s,r){return(r||document).querySelector(s)};
if(!document.body||!document.body.classList.contains('home-p'))return;
var LV=['','star chart','frames'];
/* the sky keeps its own place (every layer closes back onto the spot it opened from), so the browser's own scroll restore on Back would only fight it */
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
var el=document.createElement('nav');el.className='gn';el.setAttribute('aria-label','where you are');
el.innerHTML='<button type="button" class="gn-b" aria-label="back">‹</button><p class="gn-c" aria-live="polite"></p>';
document.body.appendChild(el);D.classList.add('gn-js');
var btn=$('.gn-b',el),crumb=$('.gn-c',el),imm=$('.imm'),sheet=$('.sheet'),chs=$('.chs'),last='',lastMode='',q=0;
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function trail(parts){return '<span class="gn-s">ᑕᐣᓯ</span>'+parts.map(function(p,i){return '<i aria-hidden="true">›</i>'+(i===parts.length-1?'<b>'+p+'</b>':'<span>'+p+'</span>')}).join('')}
function state(){
  if(D.classList.contains('mk-on'))return{mode:'off'};
  if(window.__soundOv&&__soundOv.isOpen())return{mode:'layer',parts:['sound','inside the waveform'],back:1,label:'back to the sound constellation'};
  var R=window.__reel&&__reel.state&&__reel.state();
  if(R&&R.on){var n=String(R.i+1),N=String(R.n);while(n.length<3)n='0'+n;while(N.length<3)N='0'+N;
    return{mode:'layer reel',parts:['film','reel <em>'+n+' / '+N+'</em>'+(R.paused?' <small>paused</small>':'')],back:1,label:'back to the film constellation'}}
  if(window.__sheet&&__sheet.isOpen()){var sc=$('.crumb',sheet),t=sc?sc.textContent.trim():'the whole sky';return{mode:'layer sheet',parts:t.split(/\s*[›·]\s*/).filter(Boolean).map(esc),back:1,label:'close the whole sky'}}
  var d=window.__dive&&__dive.state();
  if(d&&d.w&&imm&&!imm.hidden){var ti=__dive.title(d.k,d.w)||d.w;return{mode:'layer work',parts:[d.k,esc(ti)+(d.play?' <small>▶</small>':'')],back:1,label:'back to the '+d.k+' constellation'}}
  if(!window.__dive)return{mode:'off'};
  var c=__dive.cur(),r=chs?chs.getBoundingClientRect():null;
  if(!c||!c.k||(r&&r.top>innerHeight*.5&&!c.lv))return{mode:'off'};
  var parts=c.lv?[c.k,LV[c.lv]]:['the sky'];
  return{mode:'sky',parts:parts,back:c.lv>0,label:c.lv>1?'zoom out to the star chart':'zoom out to the '+c.k+' constellation'}}
function ui(){if(q)return;q=requestAnimationFrame(now)}
function now(){q=0;var s=state(),on=s.mode!=='off';
  if(s.mode!==lastMode){el.className='gn'+(on?' on '+s.mode.split(' ').map(function(m){return 'gn-'+m}).join(' '):'');lastMode=s.mode;D.classList.toggle('gn-layer',/layer/.test(s.mode))}
  if(!on)return;var h=trail(s.parts);if(h!==last){crumb.innerHTML=h;last=h}
  el.classList.toggle('nob',!s.back);btn.setAttribute('aria-label',s.label||'back');btn.tabIndex=s.back?0:-1}
function back(){var s=state();if(!s.back)return false;
  if(window.__soundOv&&__soundOv.isOpen()){__soundOv.back();return true}
  var R=window.__reel&&__reel.state&&__reel.state();if(R&&R.on){__reel.close();return true}
  return !!(window.__dive&&__dive.back())}
btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();back();ui()});
/* Esc on the sky steps out one level too (the layers handle their own Esc first) */
addEventListener('keydown',function(e){if(e.key!=='Escape'||e.defaultPrevented)return;var s=state();
  if(window.__soundOv&&__soundOv.isOpen()){e.preventDefault();__soundOv.back();return}
  var R=window.__reel&&__reel.state&&__reel.state();if(R&&R.on){e.preventDefault();__reel.close();return}
  if(s.mode==='sky'&&s.back){e.preventDefault();back()}});
['scroll','resize','popstate','hashchange','click','keyup','touchend','pointerup'].forEach(function(n){addEventListener(n,ui,{passive:true})});
if('MutationObserver' in window){var mo=new MutationObserver(ui);mo.observe(D,{attributes:true,attributeFilter:['class']});
  if(imm)mo.observe(imm,{attributes:true,attributeFilter:['hidden','class']});if(sheet){mo.observe(sheet,{attributes:true,attributeFilter:['hidden']});var sc=$('.crumb',sheet);if(sc)mo.observe(sc,{childList:true,characterData:true,subtree:true})}}
setTimeout(ui,0);
window.__nav={ui:ui,back:back,state:state};
})();
