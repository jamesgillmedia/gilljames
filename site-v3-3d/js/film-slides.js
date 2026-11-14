/* site-v3-3d · slides layer one zoom in from the Film player.
   Hooks route changes (hashchange, popstate, MutationObserver on the player)
   and real input (+, zoom-in, pinch-out), not only a wrap of __dive.go/step.
   The slides get their own history entry; Back and pinch-in close only this
   layer. Reduce Motion lands in the same place. */
(function(){
'use strict';
var on=false,idx=0,slides=[],root=null,title='',srcW=null,ptr=null,SWALLOW=0,pushed=false,stageGen=0;

/* Selection never fades a film still. WAAPI opacity beats CSS, so a film
   surface keeps opacity 1. The frame holds the outgoing picture until the
   next one has decoded, then swaps. Reduce Motion uses this same path. */
var animate0=Element.prototype.animate;
function filmSurface(el){
  if(!el||!el.closest)return false;
  if(el.closest('#film-slides,.sc-strip,.ff-hold,.imm-f'))return true;
  var d=window.__dive&&__dive.state&&__dive.state();
  var film=!!(d&&d.k==='film');
  if(!film)return false;
  if(el.classList&&el.classList.contains('frame')&&el.closest('.imm'))return true;
  if(el.id==='main'||(el.classList&&el.classList.contains('main')))return true;
  if(el.closest&&el.closest('#film .vis'))return true;
  return false;
}
if(!animate0.__filmBright){
  var animate1=function(kf,opt){
    if(filmSurface(this)&&kf&&kf.length){
      var dip=false,i,f;
      for(i=0;i<kf.length;i++){f=kf[i];if(f&&f.opacity!=null&&+f.opacity<1)dip=true}
      if(dip)kf=kf.map(function(fr){
        if(!fr||fr.opacity==null)return fr;
        var n={},k;for(k in fr)if(k!=='opacity')n[k]=fr[k];
        n.opacity=1;return n;
      });
    }
    return animate0.call(this,kf,opt);
  };
  animate1.__filmBright=1;
  Element.prototype.animate=animate1;
}
function snapStill(el){
  if(!el||el.classList.contains('fs-holdstill'))return '';
  if(el.tagName==='IMG')return el.currentSrc||el.src||'';
  if(el.tagName==='VIDEO'){
    var poster=el.getAttribute('poster')||'';
    if(el.readyState>=2&&el.videoWidth){
      try{var c=document.createElement('canvas');c.width=el.videoWidth;c.height=el.videoHeight;c.getContext('2d').drawImage(el,0,0);return c.toDataURL('image/jpeg',.72)}catch(e){return poster}
    }
    return poster;
  }
  if(el.tagName==='CANVAS'&&el.width&&el.height){try{return el.toDataURL('image/jpeg',.72)}catch(e){return ''}}
  return '';
}
function topStill(frame){
  var nodes=[].slice.call(frame.querySelectorAll('img,video,canvas')),best=null,score=-1;
  nodes.forEach(function(n,i){
    if(n.classList.contains('fs-holdstill')||n.classList.contains('ff-poster'))return;
    var st=getComputedStyle(n);
    if(st.display==='none'||st.visibility==='hidden'||+st.opacity===0)return;
    var zi=parseInt(st.zIndex,10);if(isNaN(zi))zi=0;
    var s=zi*100+i;if(s>=score){score=s;best=n}
  });
  return best;
}
function armFrame(frame){
  if(!frame||frame.__filmBright)return;
  var desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML')||Object.getOwnPropertyDescriptor(HTMLElement.prototype,'innerHTML');
  if(!desc||!desc.set)return;
  frame.__filmBright=1;
  Object.defineProperty(frame,'innerHTML',{
    configurable:true,enumerable:!!desc.enumerable,
    get:function(){return desc.get.call(frame)},
    set:function(html){
      var d=window.__dive&&__dive.state&&__dive.state();
      var src=(d&&d.k==='film')?snapStill(topStill(frame)):'';
      desc.set.call(frame,html);
      if(!src)return;
      var hold=document.createElement('img');
      hold.className='fs-holdstill';hold.alt='';hold.setAttribute('aria-hidden','true');hold.src=src;
      frame.appendChild(hold);
      var token={};frame.__holdTok=token;
      function drop(){
        if(frame.__holdTok!==token||!hold.parentNode)return;
        var imm=frame.closest('.imm');
        if(imm&&imm.classList.contains('ff-frames')){
          var cv=frame.querySelector('.ff-canvas');
          if(cv&&cv.getAttribute('data-drawn')==='1')hold.remove();
          return;
        }
        var ok=false;
        [].forEach.call(frame.querySelectorAll('img,video'),function(n){
          if(n===hold||n.classList.contains('fs-holdstill')||n.closest('.ff-hold'))return;
          if(n.tagName==='IMG'&&n.complete&&n.naturalWidth>0)ok=true;
          if(n.tagName==='VIDEO'&&n.readyState>=2)ok=true;
        });
        if(ok)hold.remove();
      }
      queueMicrotask(drop);setTimeout(drop,0);
      frame.addEventListener('ff-drawn',drop);
      var mo=new MutationObserver(function(){
        [].forEach.call(frame.querySelectorAll('img,video'),function(n){
          if(n===hold||n.__holdWatch)return;n.__holdWatch=1;
          n.addEventListener(n.tagName==='IMG'?'load':'loadeddata',drop,{once:true});
          if(n.decode)n.decode().then(drop,function(){});
        });
        drop();
      });
      mo.observe(frame,{childList:true,subtree:true});
      setTimeout(function(){mo.disconnect()},8000);
    }
  });
}
function watchFrames(){
  var imm=document.querySelector('.imm');if(!imm)return;
  [].forEach.call(imm.querySelectorAll('.frame'),armFrame);
  if(imm.__filmBright)return;imm.__filmBright=1;
  new MutationObserver(function(){[].forEach.call(imm.querySelectorAll('.frame'),armFrame)}).observe(imm,{childList:true,subtree:true});
}
watchFrames();
addEventListener('DOMContentLoaded',watchFrames);

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
    '<div class="fs-stage"></div>'+
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
function paintThumbs(){
  var th=root.querySelector('.fs-thumbs');
  var key=slides.map(function(s){return s.src}).join('\n');
  if(th.getAttribute('data-key')!==key){
    th.setAttribute('data-key',key);th.innerHTML='';
    slides.forEach(function(sl,i){
      var b=document.createElement('button');b.type='button';b.setAttribute('role','listitem');
      b.setAttribute('aria-label','slide '+(i+1));
      var iel=document.createElement('img');iel.alt='';iel.decoding='async';iel.src=sl.src;b.appendChild(iel);
      b.addEventListener('click',function(){idx=i;paint()});th.appendChild(b);
    });
  }
  [].forEach.call(th.children,function(b,i){
    var sel=i===idx;b.classList.toggle('on',sel);
    if(sel)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');
  });
}
function paintStage(src){
  var stage=root.querySelector('.fs-stage');
  var live=stage.querySelector('img.fs-live');
  if(live&&live.getAttribute('data-src')===src&&live.complete&&live.naturalWidth){root.hidden=false;return}
  var gen=++stageGen,incoming=new Image();
  incoming.alt='';incoming.className='fs-live';incoming.decoding='sync';incoming.setAttribute('data-src',src);
  function reveal(){
    if(!on||gen!==stageGen||!incoming.naturalWidth)return;
    if(!incoming.parentNode)stage.appendChild(incoming);
    [].slice.call(stage.querySelectorAll('img.fs-live')).forEach(function(n){if(n!==incoming)n.remove()});
    root.hidden=false;
  }
  incoming.onload=reveal;
  incoming.onerror=function(){if(on&&gen===stageGen)root.hidden=false};
  incoming.src=src;
  if(incoming.decode)incoming.decode().then(reveal,function(){});
  if(incoming.complete&&incoming.naturalWidth)reveal();
}
function paint(){
  if(!root||!slides.length)return;
  root.querySelector('.fs-title').textContent=title;
  root.querySelector('.fs-count').textContent=(idx+1)+' / '+slides.length;
  root.querySelector('.fs-prev').disabled=idx<=0;
  root.querySelector('.fs-next').disabled=idx>=slides.length-1;
  paintThumbs();
  paintStage(slides[idx].src);
}
function open(){
  var st=filmPlayer();if(!st)return false;
  srcW=st.w;slides=collect(st.w);if(!slides.length)return false;
  idx=0;build();on=true;document.documentElement.classList.add('fs-on');
  root.classList.toggle('fs-rm',rmOn());paint();
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
  if(on&&window.__foldScope&&__foldScope.isOpen()){if(e.key==='Escape'||e.key==='-'||e.key==='_'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();__foldScope.close()}return}
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
