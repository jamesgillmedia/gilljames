/* site-v3-3d · slides layer one zoom in from the Film player.
   Hooks route changes (hashchange, popstate, MutationObserver on the player)
   and real input (+, zoom-in, pinch-out), not only a wrap of __dive.go/step.
   The slides get their own history entry; Back and pinch-in close only this
   layer. Reduce Motion lands in the same place. */
(function(){
'use strict';
var on=false,idx=0,slides=[],root=null,title='',srcW=null,ptr=null,SWALLOW=0,pushed=false;

function rmOn(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function itemEl(w){return document.querySelector('#film .it[data-k="'+w+'"]')}
function immOn(){var imm=document.querySelector('.imm');return !!(imm&&!imm.hidden)}
function filmPlayer(){
  var imm=document.querySelector('.imm');
  if(!imm||imm.hidden)return null;
  var d=window.__dive&&__dive.state&&__dive.state();
  if(d&&d.k==='film'&&d.lv===3&&d.w)return d;
  var m=(location.hash||'').match(/^#film\/(w\w+)(?:\/play)?$/);
  if(m)return{k:'film',w:m[1],lv:3,play:false};
  var cur=document.querySelector('#film .it.cur');
  if(cur&&cur.dataset.k)return{k:'film',w:cur.dataset.k,lv:3,play:false};
  return null;
}
function collect(w){
  var it=itemEl(w),out=[],seen={};
  function add(src,kind){if(!src||seen[src])return;seen[src]=1;out.push({src:src,kind:kind||'still'})}
  if(!it)return out;
  var j={};try{j=JSON.parse(it.dataset.j||'{}')}catch(e){}
  title=j.title||(it.querySelector('.cap b')&&it.querySelector('.cap b').textContent)||'film';
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
  var st=filmPlayer();if(!st)return false;
  srcW=st.w;slides=collect(st.w);if(!slides.length)return false;
  idx=0;build();on=true;document.documentElement.classList.add('fs-on');
  root.hidden=false;root.classList.toggle('fs-rm',rmOn());paint();
  if(!(history.state&&history.state.gjSlides)){
    try{history.pushState(Object.assign({},history.state||{},{gj:1,gjSlides:1,w:srcW}),'',location.href);pushed=true}catch(e){pushed=false}
  }
  try{root.querySelector('.fs-back').focus({preventScroll:true})}catch(e){}
  return true;
}
function close(fromPop){
  if(!on)return;on=false;document.documentElement.classList.remove('fs-on');
  if(root)root.hidden=true;ptr=null;SWALLOW=Date.now()+400;
  if(!fromPop&&pushed&&history.state&&history.state.gjSlides){
    pushed=false;try{history.back()}catch(e){}
  }
  pushed=false;
}
function step(d){if(!on||!slides.length)return;idx=Math.max(0,Math.min(slides.length-1,idx+d));paint()}

/* also wrap public methods as a fallback, but route + real input are the source of truth */
function hookWrap(){
  if(!window.__dive||diveHooked)return;
  var step0=__dive.step, go0=__dive.go;
  if(typeof step0==='function'){
    __dive.step=function(dir,anchor,k){
      if(on){if(dir<0)close();else step(1);return}
      var s=filmPlayer();
      if(dir>0&&s){if(open())return}
      return step0(dir,anchor,k);
    };
  }
  if(typeof go0==='function'){
    __dive.go=function(r,o){
      if(on&&(!r||r.k!=='film'||r.lv!==3||r.w!==srcW))close(true);
      return go0(r,o);
    };
  }
  diveHooked=1;
}
var diveHooked=0;
hookWrap();addEventListener('DOMContentLoaded',hookWrap);

addEventListener('keydown',function(e){
  if(on){
    if(e.key==='Escape'||e.key==='-'||e.key==='_'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close();return}
    if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}
    if(e.key==='ArrowRight'||e.key==='+'||e.key==='='){e.preventDefault();step(1)}
    return;
  }
  if((e.key==='+'||e.key==='=')&&filmPlayer()&&!on){
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    open();
  }
},true);

addEventListener('click',function(e){
  var z=e.target.closest&&e.target.closest('.zb[data-z="1"]');
  if(!z)return;
  if(on){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();step(1);return}
  if(filmPlayer()){
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    open();
  }
},true);

addEventListener('click',function(e){
  var z=e.target.closest&&e.target.closest('.zb[data-z="-1"]');
  if(!z||!on)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  close();
},true);

/* pinch: one level only. On slides, pinch-in closes slides. On the player, pinch-out opens slides. */
var P=null;
addEventListener('touchstart',function(e){
  if(e.touches.length!==2)return;
  if(!on&&!filmPlayer())return;
  var a=e.touches[0],b=e.touches[1];
  P={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),slides:on};
},{capture:true,passive:true});
addEventListener('touchmove',function(e){
  if(!P||e.touches.length!==2)return;
  var a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  if(!P.d)return;
  if(d/P.d<0.82){
    P=null;
    e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    if(on)close();
    else if(filmPlayer()){
      var out=document.querySelector('.imm [data-a=out]');
      if(out)out.click();
    }
  }else if(d/P.d>1.2&&!on&&filmPlayer()){
    P=null;
    e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    open();
  }
},{capture:true,passive:false});
addEventListener('touchend',function(){P=null},{capture:true,passive:true});

addEventListener('wheel',function(e){
  if(!on)return;
  if(e.deltaY>30){e.preventDefault();close()}
  else if(e.deltaY<-30){e.preventDefault();step(1)}
},{passive:false,capture:true});

addEventListener('popstate',function(e){
  if(on&&!(e.state&&e.state.gjSlides))close(true);
},true);

/* if the player closes under us, drop the overlay */
function watch(){
  hookWrap();
  if(on&&!filmPlayer())close(true);
}
addEventListener('hashchange',watch);
addEventListener('popstate',watch);
addEventListener('DOMContentLoaded',function(){
  var imm=document.querySelector('.imm');
  if(imm)new MutationObserver(watch).observe(imm,{attributes:true,attributeFilter:['hidden','class']});
});
setInterval(watch,400);

window.__filmSlides={open:open,close:close,isOpen:function(){return on},state:function(){return{on:on,i:idx,n:slides.length,w:srcW}}};
})();
