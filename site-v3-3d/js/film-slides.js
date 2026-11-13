/* site-v3-3d · one more zoom level inside the Film player: a slides layer of that
   film's stills (the strip frames already on the work, plus its poster). Swipe or
   use left/right on desktop. Pinch / − / Escape / Back returns to the player, then
   the board or constellation. Reduce Motion lands in the same place. */
(function(){
'use strict';
var on=false,idx=0,slides=[],root=null,title='',srcW=null,ptr=null,SWALLOW=0;
function rmOn(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function dive(){return window.__dive}
function filmState(){var d=dive();if(!d||!d.state)return null;var s=d.state();return (s&&s.k==='film'&&s.lv===3&&s.w)?s:null}
function itemEl(w){return document.querySelector('#film .it[data-k="'+w+'"]')}
function collect(w){
  var it=itemEl(w),out=[],seen={};
  function add(src,kind){if(!src||seen[src])return;seen[src]=1;out.push({src:src,kind:kind||'still'})}
  if(!it)return out;
  var j={};try{j=JSON.parse(it.dataset.j||'{}')}catch(e){}
  title=j.title||it.querySelector('.cap b')&&it.querySelector('.cap b').textContent||'film';
  add(it.dataset.big,'poster');
  (j.frames||[]).forEach(function(f){add(f,'still')});
  var fr=document.querySelector('.imm-f');
  if(fr)[].forEach.call(fr.querySelectorAll('img'),function(im){add(im.currentSrc||im.src,'still')});
  var strip=document.querySelector('.sc-strip, .strip, [data-strip]');
  if(strip)[].forEach.call(strip.querySelectorAll('canvas,img'),function(el){
    if(el.tagName==='CANVAS'){try{add(el.toDataURL('image/jpeg',.85),'still')}catch(e){}}
    else add(el.currentSrc||el.src,'still')});
  return out;
}
function build(){
  if(root)return;
  root=document.createElement('div');root.id='film-slides';root.hidden=true;
  root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','film slides');
  root.innerHTML='<button type="button" class="fs-back" aria-label="back to the player">‹</button>'+
    '<p class="fs-title"></p>'+
    '<div class="fs-stage"><img alt=""></div>'+
    '<p class="fs-count" aria-live="polite"></p>'+
    '<div class="fs-nav" aria-hidden="true"><button type="button" class="fs-prev" aria-label="previous slide">‹</button>'+
    '<button type="button" class="fs-next" aria-label="next slide">›</button></div>'+
    '<div class="fs-thumbs" role="list"></div>';
  document.body.appendChild(root);
  root.querySelector('.fs-back').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();close()});
  root.querySelector('.fs-prev').addEventListener('click',function(e){e.preventDefault();step(-1)});
  root.querySelector('.fs-next').addEventListener('click',function(e){e.preventDefault();step(1)});
  var st=root.querySelector('.fs-stage');
  st.addEventListener('pointerdown',function(e){if(e.button)return;ptr={x:e.clientX,y:e.clientY,id:e.pointerId};try{st.setPointerCapture(e.pointerId)}catch(x){}});
  st.addEventListener('pointerup',function(e){if(!ptr||e.pointerId!==ptr.id)return;var dx=e.clientX-ptr.x;ptr=null;if(Math.abs(dx)>40)step(dx<0?1:-1)});
  st.addEventListener('pointercancel',function(){ptr=null});
}
function paint(){
  if(!root||!slides.length)return;
  var s=slides[idx],im=root.querySelector('.fs-stage img');
  im.src=s.src;im.alt='';
  root.querySelector('.fs-title').textContent=title;
  root.querySelector('.fs-count').textContent=(idx+1)+' / '+slides.length;
  var th=root.querySelector('.fs-thumbs');th.innerHTML='';
  slides.forEach(function(sl,i){var b=document.createElement('button');b.type='button';b.setAttribute('role','listitem');
    b.setAttribute('aria-label','slide '+(i+1));b.className=i===idx?'on':'';
    var iel=document.createElement('img');iel.src=sl.src;iel.alt='';b.appendChild(iel);
    b.addEventListener('click',function(){idx=i;paint()});th.appendChild(b)});
  root.querySelector('.fs-prev').disabled=idx<=0;root.querySelector('.fs-next').disabled=idx>=slides.length-1;
}
function open(){
  var st=filmState();if(!st)return false;
  srcW=st.w;slides=collect(st.w);if(!slides.length)return false;
  idx=0;build();on=true;document.documentElement.classList.add('fs-on');
  root.hidden=false;root.classList.toggle('fs-rm',rmOn());paint();
  try{root.querySelector('.fs-back').focus({preventScroll:true})}catch(e){}
  return true;
}
function close(){
  if(!on)return;on=false;document.documentElement.classList.remove('fs-on');
  if(root)root.hidden=true;ptr=null;SWALLOW=Date.now()+400;
}
function step(d){if(!on||!slides.length)return;idx=Math.max(0,Math.min(slides.length-1,idx+d));paint()}

function hook(){
  if(!dive()||dive().__v33dSlides)return;
  var step0=dive().step, go0=dive().go;
  dive().step=function(dir,anchor,k){
    if(on){if(dir<0)close();else step(1);return}
    var s=dive().state();
    if(dir>0&&s&&s.k==='film'&&s.lv===3&&s.w){if(open())return}
    return step0(dir,anchor,k);
  };
  dive().go=function(r,o){
    if(on&&(!r||r.k!=='film'||r.lv!==3||r.w!==srcW))close();
    return go0(r,o);
  };
  dive().__v33dSlides=1;
}
hook();addEventListener('DOMContentLoaded',hook);

addEventListener('keydown',function(e){
  if(!on)return;
  if(e.key==='Escape'||e.key==='-'||e.key==='_'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close();return}
  if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}
  if(e.key==='ArrowRight'||e.key==='+'||e.key==='='){e.preventDefault();step(1)}
},true);

/* pinch out of the slides: two fingers closing */
var P=null;
addEventListener('touchstart',function(e){if(!on||e.touches.length!==2)return;var a=e.touches[0],b=e.touches[1];P={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}},{passive:true});
addEventListener('touchmove',function(e){if(!on||!P||e.touches.length!==2)return;var a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  if(P.d&&d/P.d<0.82){P=null;close()}},{passive:true});
addEventListener('touchend',function(){P=null},{passive:true});

addEventListener('wheel',function(e){
  if(!on)return;
  if(e.deltaY>30){e.preventDefault();close()}
  else if(e.deltaY<-30){e.preventDefault();step(1)}
},{passive:false,capture:true});

window.__filmSlides={open:open,close:close,isOpen:function(){return on},state:function(){return{on:on,i:idx,n:slides.length,w:srcW}}};
})();
