/* item 10 · To Go cards. Every song of the Sound chapter (data.json `tracks`, in order) as a card on one strip, starting on To Go.
 Swipe (hold and drag, momentum + snap), the arrow keys or a horizontal trackpad wheel move exactly one card. A swipe is its own
 gesture: it never selects and never plays (swipe-as-first-tap sits behind a switch, default OFF: ?swipesel=1 or localStorage
 gj.swipesel=1). Tap 1 selects a card (highlight + title), tap 2 plays it in the page's waveform player (js/song.js).
 When a song ends the next one plays (last -> first). The To Go card carries the page's own small Momo loop tile
 (media/pro2/img/sound/momo-480 webm/mp4 + poster, exactly as on the live page), moved into the card. Same motion with Reduce Motion on. */
(function(){
'use strict';
var box=document.querySelector('.sketch');
if(!box||!box._song)return;
var ROOT='../../',SNAP=320;
function swipeSel(){try{if(/[?&]swipesel=1/.test(location.search))return true;return localStorage.getItem('gj.swipesel')==='1'}catch(e){return false}}
fetch(ROOT+'data.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){build((d&&d.tracks)||[])}).catch(function(){});
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function build(T){
  T=T.filter(function(t){return t&&t.file});
  if(T.length<2)return;
  var start=0;T.forEach(function(t,i){if(t.k==='togo')start=i});
  var wrap=document.createElement('section');
  wrap.className='mcards';wrap.setAttribute('aria-label','songs, one card each');
  wrap.innerHTML='<div class="mc-vp" tabindex="0" aria-roledescription="carousel"><div class="mc-tr">'+T.map(function(t,i){
    var art=t.k==='togo'
      ? '<img class="mc-im" src="'+ROOT+'media/pro2/img/sound/to-go-480.webp" alt=""><i class="mc-momo" aria-hidden="true"></i>'
      : '<canvas class="mc-wf" aria-hidden="true"></canvas>';
    return '<article class="mc" data-i="'+i+'" role="group" aria-label="'+esc(t.title)+' · '+esc(t.artist)+'">'+art+
      '<div class="mc-cap"><b>'+esc(t.title)+'</b><small>'+esc(t.artist)+'</small></div></article>';
  }).join('')+'</div></div><p class="mc-k"><span class="mc-n"></span><span class="mc-t" aria-live="polite"></span></p>';
  box.parentNode.insertBefore(wrap,box);
  /* the live Momo tile (unchanged: same video, sources, poster and loop) moves into the To Go card */
  var old=document.querySelector('figure.momo'),slot=wrap.querySelector('.mc-momo');
  if(old&&slot){var ov=old.querySelector('video');if(ov){ov.removeAttribute('style');slot.appendChild(ov);var pp=ov.play();if(pp&&pp.catch)pp.catch(function(){})}old.remove()}
  var vp=wrap.querySelector('.mc-vp'),tr=wrap.querySelector('.mc-tr'),cards=[].slice.call(tr.children),ctr=wrap.querySelector('.mc-n'),
    ttl=wrap.querySelector('.mc-t'),S=box._song,au=S.audio;
  var at=start,x=0,tw=null,drag=null,sel=-1,playingI=start,wheelAcc=0,wheelT=0,wheelLock=false,raf=0;
  function pad(n){return (n<10?'0':'')+n}
  function cw(){var c=cards[0];return c?c.getBoundingClientRect().width+14:300}
  function home(i){return vp.clientWidth/2-(i+.5)*cw()+7}
  function paint(){tr.style.transform='translate3d('+x.toFixed(1)+'px,0,0)'}
  function label(){
    ctr.textContent=pad(at+1)+' / '+pad(T.length);
    cards.forEach(function(c,i){c.classList.toggle('cur',i===at);c.classList.toggle('sel',i===sel);c.classList.toggle('on',i===playingI&&!au.paused)});
    var t=sel>=0?T[sel]:null;
    ttl.textContent=t?t.title+' \u00b7 '+t.artist+(sel===playingI&&!au.paused?'':' \u00b7 tap again to play'):'';
  }
  function go(i,ms){
    i=((i%T.length)+T.length)%T.length;at=i;
    tw={a:x,b:home(i),t0:performance.now(),ms:ms==null?SNAP:ms};kick();label();
  }
  function kick(){if(!raf)raf=requestAnimationFrame(frame)}
  function frame(t){
    raf=0;
    if(tw){var k=tw.ms?Math.min(1,(t-tw.t0)/tw.ms):1,e=1-Math.pow(1-k,3);x=tw.a+(tw.b-tw.a)*e;paint();if(k>=1)tw=null}
    if(tw)raf=requestAnimationFrame(frame);
  }
  function select(i){sel=i;label()}
  function playI(i){
    if(i!==playingI){playingI=i;var t=T[i];S.load(ROOT+t.file,t.k,t.title,t.artist)}
    S.play();label();
  }
  function tapCard(i){
    if(i!==at){go(i)}
    if(sel!==i){select(i);return}
    if(playingI===i&&!au.paused){S.pause();label();return}
    playI(i);
  }
  /* drag: a swipe of more than 20% of a card, or a flick, moves exactly one card */
  vp.addEventListener('pointerdown',function(e){if(e.button)return;drag={x:e.clientX,y:e.clientY,x0:x,t:performance.now(),moved:false,id:e.pointerId,hx:[[e.clientX,performance.now()]]};tw=null});
  addEventListener('pointermove',function(e){
    if(!drag||e.pointerId!==drag.id)return;
    var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;wrap.classList.add('drag');try{vp.setPointerCapture(drag.id)}catch(x_){}}
    if(drag.moved){x=drag.x0+dx;paint();drag.hx.push([e.clientX,performance.now()]);if(drag.hx.length>6)drag.hx.shift()}
  },{passive:true});
  function up(e){
    if(!drag||e.pointerId!==drag.id)return;
    var d=drag;drag=null;wrap.classList.remove('drag');
    if(d.moved){
      var dx=e.clientX-d.x,h=d.hx,v=h.length>1?(h[h.length-1][0]-h[0][0])/Math.max(1,h[h.length-1][1]-h[0][1]):0,step=0;
      if(Math.abs(dx)>cw()*.2||Math.abs(v)>.5)step=(Math.abs(dx)>cw()*.2?dx:v)<0?1:-1;
      go(at+step);
      if(step&&swipeSel())select(at);
      return;
    }
    if(e.type==='pointercancel')return;
    var c=e.target.closest&&e.target.closest('.mc');
    if(c)tapCard(+c.getAttribute('data-i'));
  }
  addEventListener('pointerup',up);addEventListener('pointercancel',up);
  vp.addEventListener('click',function(e){e.preventDefault()});
  vp.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){e.preventDefault();go(at+1)}
    else if(e.key==='ArrowLeft'){e.preventDefault();go(at-1)}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();tapCard(at)}
  });
  /* trackpad: a horizontal wheel gesture moves one card; vertical wheel scrolls the page as usual */
  vp.addEventListener('wheel',function(e){
    if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
    e.preventDefault();
    clearTimeout(wheelT);wheelT=setTimeout(function(){wheelAcc=0;wheelLock=false},220);
    if(wheelLock)return;
    wheelAcc+=e.deltaX*(e.deltaMode===1?16:1);
    if(Math.abs(wheelAcc)>=40){wheelLock=true;go(at+(wheelAcc>0?1:-1));wheelAcc=0}
  },{passive:false});
  au.addEventListener('ended',function(){var n=(playingI+1)%T.length;go(n);select(n);playI(n)});
  au.addEventListener('play',function(){label();kick()});au.addEventListener('pause',label);
  /* the page's own play button plays whatever the player holds; keep the cards in step */
  T.forEach(function(t,i){if(t.k==='togo')return;var cv=cards[i].querySelector('.mc-wf');if(cv)wave(cv,t.peaks||[])});
  function wave(cv,pk){
    var r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=r.width||260,h=r.height||200;
    cv.width=w*dpr|0;cv.height=h*dpr|0;var g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
    var n=pk.length;if(!n)return;var bw=Math.max(1,(w-16)/n*.6);
    for(var i=0;i<n;i++){var y=Math.max(1.2,pk[i]*h*.36),xx=8+(i+.5)*(w-16)/n;g.fillStyle='rgba(220,232,240,'+(0.18+0.4*pk[i]).toFixed(2)+')';g.fillRect(xx-bw/2,h/2-y,bw,y*2)}
  }
  addEventListener('resize',function(){x=home(at);paint()});
  x=home(at);paint();label();
  window.GJ_MCARDS={state:function(){return {at:at,sel:sel,playing:playingI,paused:au.paused,src:au.currentSrc||au.src,x:x,home:home(at),n:T.length}},go:go,tap:tapCard,swipeSel:swipeSel};
}
})();
