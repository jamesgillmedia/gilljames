/* gill james · site-v3-pro · the film page (ported from site-v4-c-pro, adapted to v3's own work view; nothing else in v3 changes).
   When a film is open (dive.js L3 / Scope), the work view scrolls: v3's player screen stays exactly as it is on top; below it
   1 CREDITS  Title — Brand, kind · length, then Dir. / Prod. / Agency / Camera: only fields filled in js/copy.js render.
   2 FRAMES   a dense 3-column grid of the film's frame-grabs (js/frames.js, frames/<key>/NN.webp, lazy).
              Press once = select (mint outline + timecode). Press the selected frame again = open it: the view scrolls back up and
              the player jumps to that moment (native films and the reel: Scope seek; YouTube films: Scope's own seek once the
              film runs; films with no local file: the frame itself opens in the stage). No hover anywhere.
   3 PREV/NEXT the previous / next film (v3's own ‹ › in the dock of the work view do the same). */
(function(){'use strict';
var C=(window.GJ_COPY||{}).credits||{},FR=window.GJ_FRAMES||{},JO=window.GJ_JOIO||[],D=document.documentElement;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)');
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var imm=null,sec=null,curW=null,selF=-1,openT=0;
function filmItems(){return $$('#film .it[data-k]')}
function itemOf(w){return $('#film .it[data-k="'+w+'"]')}
function jOf(it){try{return JSON.parse(it.dataset.j||'{}')}catch(e){return{}}}
function fkey(j){return j.reel?'reel':(j.n<10?'0':'')+j.n}
function titleOf(w,it){var c=C[w];if(c&&c.t)return c;var b=it&&$('.cap b',it);return{t:b?b.textContent:'',b:''}}
function line(lab,v){return v?'<p class="pf-l"><span>'+lab+'</span> '+esc(v)+'</p>':''}
function tc(s){return Math.floor(s/60)+':'+('0'+Math.floor(s%60)).slice(-2)}
function build(w){var it=itemOf(w);if(!it)return'';var j=jOf(it),c=titleOf(w,it),meta=$('.cap small',it);
  var h='<div class="pf-cr"><h2 class="pf-t">'+esc(c.t)+(c.b?'<span class="pf-b"> — '+esc(c.b)+'</span>':'')+'</h2>'+
    (meta&&meta.textContent?'<p class="pf-k">'+esc(meta.textContent)+'</p>':'')+
    line('Dir.',c.dir)+line('Prod.',c.prod)+line('Agency',c.agency)+line('Camera',c.cam)+'</div>';
  var F=FR[fkey(j)];
  if(F&&F.f.length>=3){
    h+='<p class="pf-h">frames · '+F.f.length+'<small>press once to choose, again to open</small></p>'+
      '<ol class="pf-g" style="--ar:'+Math.max(.5,Math.min(2.6,F.ar))+'" aria-label="frames from '+esc(c.t)+'">'+F.f.map(function(f,i){
      return '<li><button type="button" data-t="'+f[1]+'" aria-label="frame at '+tc(f[1])+'"><img src="frames/'+f[0]+'" alt="" width="320" height="'+Math.round(320/F.ar)+'" loading="lazy" decoding="async"><span class="pf-tc" aria-hidden="true">'+tc(f[1])+'</span></button></li>'}).join('')+'</ol>'}
  var L=filmItems(),k=L.indexOf(it),pv=L[(k-1+L.length)%L.length],nx=L[(k+1)%L.length];
  function nm(x){var q=titleOf(x.dataset.k,x);return esc(q.b?q.b+' · '+q.t:q.t)}
  h+='<nav class="pf-nav" aria-label="more films"><button type="button" data-d="prev"><small>‹ previous film</small><b>'+nm(pv)+'</b></button><button type="button" data-d="next"><small>next film ›</small><b>'+nm(nx)+'</b></button></nav>';
  return h}
/* joio (objects chapter, star w14): the studio feed. No credits: a short line, then the same grid: photos, frames from the clips, the clips
   themselves (▶). Press once = select, again = open in the stage above (photo shown, clip plays from that moment, muted, looping). */
function buildJoio(){if(!JO.length)return'';
  return '<div class="pf-cr pf-jo"><h2 class="pf-t">joio<span class="pf-b"> — cups, paddles + coffee</span></h2><p class="pf-k">from the joio.co feed · '+JO.filter(function(x){return x.k==='p'}).length+' photos · '+JO.filter(function(x){return x.k==='v'}).length+' clips</p></div>'+
  '<p class="pf-h">frames · '+JO.length+'<small>press once to choose, again to open</small></p><ol class="pf-g pf-gj" aria-label="joio photos and clips">'+JO.map(function(x,i){
   return '<li class="k-'+x.k+'"><button type="button" data-j="'+i+'" aria-label="'+(x.k==='v'?'clip: '+esc(x.title||'joio'):x.k==='f'?'frame from a joio clip':'joio photo')+'"><img src="joio/'+x.f+'" alt="" width="'+x.w+'" height="'+x.h+'" loading="'+(i<9?'eager':'lazy')+'" decoding="async">'+(x.k==='v'?'<span class="pf-pl" aria-hidden="true">▶</span>':'')+'</button></li>'}).join('')+'</ol>'}
function openJoio(i){var x=JO[i],fr=$('.frame',imm);if(!x||!fr)return;top();unopen();var o;
  if(x.v){o=document.createElement('video');o.muted=true;o.loop=true;o.playsInline=true;o.setAttribute('playsinline','');o.controls=true;o.poster='joio/'+x.f;o.src='joio/'+x.v;
    o.addEventListener('loadedmetadata',function(){try{o.currentTime=x.t||0}catch(e){}},{once:true});var p=o.play();if(p&&p.catch)p.catch(function(){})}
  else{o=new Image();o.alt='';o.src='joio/'+x.f}
  o.className='pf-open pf-jo-open';fr.appendChild(o)}
function unopen(){var o=$('.pf-open',imm);if(o)o.remove()}
function ensure(){if(!imm)return;var st=window.__dive&&__dive.state(),jo=!!(st&&st.k==='objects'&&st.w==='w14'&&!imm.hidden&&JO.length),on=jo||!!(st&&st.k==='film'&&st.w&&!imm.hidden);
  imm.classList.toggle('pro',on);if(!on){if(curW){curW=null;if(sec)sec.innerHTML='';unopen()}return}
  if(!sec||sec.parentNode!==imm){sec=document.createElement('section');sec.className='pf';imm.appendChild(sec)}
  var id=st.k+'/'+st.w;imm.classList.toggle('pro-jo',jo);if(curW!==id){curW=id;selF=-1;openT++;unopen();sec.innerHTML=jo?buildJoio():build(st.w);imm.scrollTop=0}}
function top(){imm.scrollTo({top:0,behavior:RM.matches?'auto':'smooth'})}
function filmVid(){var v=$('.frame video',imm);return v&&/film-720|reel-v7/.test(v.currentSrc||v.src||'')?v:null}
function openAt(t,img){var my=++openT,it=itemOf(curW.split('/')[1]),j=jOf(it||document.body);top();unopen();
  if(!(j.reel||j.native||j.embed)){var fr=$('.frame',imm);if(fr){var o=new Image();o.className='pf-open';o.alt='';o.src=img;fr.appendChild(o)}return} /* no local film: the frame opens in the stage */
  var st=__dive.state();if(!st.play){var pb=$('[data-a=play]',imm);if(pb)pb.click()}
  var t0=Date.now(),seen=0;(function poll(){if(my!==openT||curW!=='film/'+__dive.state().w)return;
    if(j.embed){var f=$('.frame iframe',imm);if(f){if(!seen)seen=Date.now();if(Date.now()-seen>1400){__scope.seek(t);setTimeout(function(){if(my===openT)__scope.seek(t)},1600);return}}}
    else{var v=filmVid();if(v&&v.readyState>=1){__scope.seek(t);return}}
    if(Date.now()-t0<9000)setTimeout(poll,120)})()}
function size(){if(!imm)return;var t=$('.imm-top',imm),b=$('.imm-bot',imm);   /* v3's player screen keeps its own height: stage = view - top - dock - a peek of the credits */
  imm.style.setProperty('--pf-ih',imm.clientHeight+'px');if(t)imm.style.setProperty('--pf-th',t.offsetHeight+'px');if(b)imm.style.setProperty('--pf-bh',b.offsetHeight+'px')}
function hook(){imm=$('.imm');if(!imm)return;
  if(window.ResizeObserver){var ro=new ResizeObserver(size);ro.observe(imm);$$('.imm-top,.imm-bot',imm).forEach(function(x){ro.observe(x)})}size();
  new MutationObserver(function(){ensure()}).observe(imm,{attributes:true,attributeFilter:['class','hidden']});
  addEventListener('hashchange',function(){setTimeout(ensure,0)});ensure();
  imm.addEventListener('click',function(e){var b=e.target.closest('.pf-g button');
    if(b){e.preventDefault();var li=b.parentNode,i=[].indexOf.call(li.parentNode.children,li);
      if(selF!==i){$$('.pf-g li.sel',sec).forEach(function(x){x.classList.remove('sel')});li.classList.add('sel');selF=i;return} /* first press: select */
      if(b.dataset.j!=null)openJoio(+b.dataset.j);else openAt(+b.dataset.t+.04,$('img',b).src);return} /* second press: open */
    var n=e.target.closest('.pf-nav button');if(n){e.preventDefault();var t2=$('.imm-b [data-a='+n.dataset.d+']',imm);if(t2)t2.click()}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(hook,0)});else setTimeout(hook,0);
window.__pro={ensure:ensure};
})();
