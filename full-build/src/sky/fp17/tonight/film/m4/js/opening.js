/* The opening title card (approved by Gill via Eve, 9:44 AM Nov 11): when a visitor pinches in or waits on the opening,
 ONE full-screen To Go-style card shows on the way in, instead of the four land frames (landFrames stays in sky.js, unused).
 It starts on Weird Kid. It is a swipeable strip, one card wide: full-bleed still + clip, the Julius title, the mint role
 line, a shot counter, the sky drawn behind it. It rides the reel's drift: while a clip plays the strip creeps a little
 with the clip's time, and when the clip ends it glides on to the next card (no loop). A still holds 4 s. The To Go card
 carries a muted preview clip, the live small Momo loop tile (momo-480) and a play button; audio never autoplays. After the last card the sky
 opens. A tap (or Esc) goes straight to the sky; swipe, arrows or a sideways wheel move between cards; a pinch carries on
 into the sky (sky.js owns the pinch). Motion is the same with Reduce Motion on. Ideas from _preview-cards (read only).
 From Film, the same strip also opens as a board (GJ_OPEN.show({board:true})): a tap opens that work, Back / Esc / pinch-out close the board, and the last card does not send the visitor to the sky. */
(function(){
'use strict';
var HOLD=4000,CREEP=.06,EASE_MS=520;
var root,track,ctr,cards=[],N=0,p=0,cur=-1,tween=null,drag=null,wheelAcc=0,wheelT=0,raf=0,lastT=0,holdT=0,hold=0,
    on=false,stay=false,onDone=null,onPick=null,board=false,song=null,sel=-1,startedAt=0,passed=0;
function pad(n){n=String(n);while(n.length<2)n='0'+n;return n}
function mod(i){return((i%N)+N)%N}
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var CSS=
'#land.op{background:transparent}#land.op>img,#land.op>p{display:none}'+
'#opc{position:absolute;inset:0;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;color:var(--ink,#eef3f5)}'+
'#opc .oc-tr{position:absolute;left:0;top:0;bottom:0;display:flex;align-items:center;gap:28px;will-change:transform}'+
'#opc .oc{position:relative;flex:0 0 auto;width:calc(100vw - 24px);height:calc(100vh - 24px);height:calc(100dvh - 24px);border-radius:8px;overflow:hidden;background:rgba(4,7,11,.28);box-shadow:0 8px 40px rgba(0,0,0,.45);isolation:isolate}'+
'#opc .oc-b{position:absolute;inset:0}#opc .oc-b img,#opc .oc-b>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}'+
'#opc .oc-b>video{opacity:0;transition:opacity .25s linear}#opc .oc-b>video.on{opacity:1}'+
'#opc .oc.portrait .oc-b img{object-position:50% 40%}#opc .oc.sound .oc-b img{filter:saturate(.95) brightness(.85)}'+
'#opc .oc::before,#opc .oc::after{content:"";position:absolute;left:0;right:0;pointer-events:none;z-index:2}'+
'#opc .oc::before{top:0;height:120px;background:linear-gradient(to bottom,rgba(3,6,10,.55),rgba(3,6,10,0))}'+
'#opc .oc::after{bottom:0;height:210px;background:linear-gradient(to top,rgba(3,6,10,.78),rgba(3,6,10,0))}'+
'#opc .oc-ty{position:absolute;left:max(16px,var(--sl,0px));right:max(16px,var(--sr,0px));bottom:calc(30px + var(--sb,0px));z-index:3;pointer-events:none;display:flex;flex-direction:column;align-items:flex-start}'+
'#opc p{position:static;left:auto;right:auto;bottom:auto;font:inherit;letter-spacing:normal;text-shadow:none}'+
'#opc .oc-ty h2{margin:0;font:400 clamp(22px,6vw,40px)/1.15 "Julius Sans One",sans-serif;letter-spacing:.08em;text-shadow:0 2px 16px rgba(0,0,0,.7)}'+
'#opc .oc-role{margin:6px 0 0;color:var(--mint,#55DAA1);font-size:11px;letter-spacing:.14em;text-transform:uppercase;text-shadow:0 1px 8px #04070b}'+
'#opc .oc-role:empty,#opc .oc-meta:empty{display:none}'+
'#opc .oc-meta{margin:6px 0 0;font:300 12px/1.45 Poppins,sans-serif;color:var(--dim,#c9d3d6);text-shadow:0 1px 8px #04070b}'+
'#opc .oc-momo{margin:0 0 12px;width:min(34vw,132px);text-align:center}'+
'#opc .oc-momo video{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;opacity:.88;background:#3d8ee0}'+
'#opc .oc-momo figcaption{margin-top:6px;font-size:12px;letter-spacing:.06em;opacity:.6}'+
'#opc .oc-play{pointer-events:auto;min-height:44px;min-width:88px;padding:0 18px;margin-top:14px;border:1px solid rgba(85,218,161,.55);border-radius:22px;letter-spacing:.12em;font:300 12px Poppins,sans-serif;text-transform:lowercase;color:inherit;background:rgba(4,7,11,.35);cursor:pointer}'+
'#opc .oc-play[aria-pressed="true"]{color:var(--mint,#55DAA1);border-color:var(--mint,#55DAA1);box-shadow:0 0 10px rgba(85,218,161,.35)}'+
'#opc .oc-k{position:absolute;left:max(24px,calc(var(--sl,0px) + 12px));top:calc(26px + var(--st,0px));margin:0;z-index:5;pointer-events:none;font:400 11px/1 "Julius Sans One",Poppins,sans-serif;letter-spacing:.2em;color:var(--mint,#55DAA1);font-variant-numeric:tabular-nums}'+
'#opc .oc-dots{position:absolute;left:0;right:0;bottom:calc(16px + var(--sb,0px));display:flex;justify-content:center;gap:7px;z-index:5;pointer-events:none}'+
'#opc .oc-dots i{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.32)}#opc .oc-dots i.on{background:var(--mint,#55DAA1);box-shadow:0 0 6px rgba(85,218,161,.7)}'+
'#opb{position:absolute;inset:0;z-index:6;display:none;overflow:hidden;touch-action:none;background:transparent}#opb.on{display:block}#opb #opc{z-index:1}';
function vid(src,poster,cls){
  var v=document.createElement('video');
  v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=false;v.preload='metadata';
  ['muted','playsinline','webkit-playsinline','disablepictureinpicture'].forEach(function(a){v.setAttribute(a,'')});
  if(poster)v.poster=poster;if(cls)v.className=cls;
  (Array.isArray(src)?src:[src]).forEach(function(s){var o=document.createElement('source');o.src=s;o.type=/\.webm$/.test(s)?'video/webm':'video/mp4';v.appendChild(o)});
  return v;
}
function build(c,i,copy){
  var a=el('article','oc'+(c.kind==='sound'?' sound':'')+(c.portrait?' portrait':''));
  a.setAttribute('data-i',i);a.setAttribute('data-copy',copy);
  var b=el('div','oc-b'),im=document.createElement('img');im.alt='';im.draggable=false;im.decoding='async';im.src=c.still;b.appendChild(im);
  if(c.clip&&copy==='main'){var v=vid(c.clip,c.still);v.addEventListener('ended',function(){ended(i)});v.addEventListener('playing',function(){v.classList.add('on')});b.appendChild(v)}
  a.appendChild(b);
  var ty=el('div','oc-ty');
  if(c.momo){
    var f=el('figure','oc-momo'),mv=vid(c.momo,c.momoPoster);mv.setAttribute('aria-label','momo, from the To Go animation');
    if(copy==='main')mv.addEventListener('ended',function(){if((song&&!song.paused)||c.clip){mv.currentTime=0;mv.play().catch(function(){})}else ended(i)});
    f.appendChild(mv);f.appendChild(el('figcaption','','momo'));ty.appendChild(f);
  }
  ty.appendChild(el('h2','',esc(c.title)));ty.appendChild(el('p','oc-role',esc(c.role||'')));ty.appendChild(el('p','oc-meta',esc(c.meta||'')));
  if(c.audio&&copy==='main'){
    var bt=el('button','oc-play','play');bt.type='button';bt.setAttribute('aria-pressed','false');bt.setAttribute('aria-label','Play To Go');
    bt.addEventListener('pointerdown',function(e){e.stopPropagation()});
    bt.addEventListener('pointerup',function(e){e.stopPropagation()});
    bt.addEventListener('click',function(e){e.stopPropagation();toggleSong(c.audio)});
    ty.appendChild(bt);
  }
  a.appendChild(ty);return a;
}
function mount(list){
  if(root)return;
  cards=list.filter(function(c){return c&&c.still});N=cards.length;if(!N)return;
  var st=document.createElement('style');st.id='opcss';st.textContent=CSS;document.head.appendChild(st);
  var land=document.getElementById('land');
  root=el('div');root.id='opc';root.setAttribute('aria-roledescription','carousel');root.setAttribute('aria-label','title cards on the way into the sky');
  track=el('div','oc-tr');root.appendChild(track);
  track.appendChild(build(cards[N-1],N-1,'head'));
  cards.forEach(function(c,i){track.appendChild(build(c,i,'main'))});
  track.appendChild(build(cards[0],0,'tail'));
  ctr=el('p','oc-k');root.appendChild(ctr);
  var d=el('div','oc-dots');for(var i=0;i<N;i++)d.appendChild(el('i'));root.appendChild(d);
  land.appendChild(root);
  root.addEventListener('pointerdown',down);
  addEventListener('pointermove',move,{passive:true});
  addEventListener('pointerup',up);addEventListener('pointercancel',up);
  root.addEventListener('wheel',wheel,{passive:false});
  addEventListener('keydown',key);
  document.addEventListener('visibilitychange',function(){if(!on)return;if(document.hidden){quiet();if(song)song.pause()}else playCur()});
  addEventListener('resize',function(){if(on)place()});
}
function stride(){var a=track.querySelector('.oc[data-copy="main"]');return a?a.getBoundingClientRect().width+28:innerWidth}
function place(){
  var s=stride(),w=s-28;
  track.style.transform='translate3d('+((innerWidth-w)/2-(p+1)*s).toFixed(2)+'px,0,0)';
  var n=mod(Math.round(p));
  if(n!==cur){cur=n;ctr.textContent=pad(n+1)+' / '+pad(N);var ds=root.querySelectorAll('.oc-dots i');for(var i=0;i<ds.length;i++)ds[i].classList.toggle('on',i===n)}
}
function main(n){return track.querySelector('.oc[data-copy="main"][data-i="'+n+'"]')}
function vidsOf(n){var a=main(n);return a?a.querySelectorAll('video'):[]}
function quiet(){track.querySelectorAll('video').forEach(function(v){v.classList.remove('on');try{if(!v.paused)v.pause()}catch(e){}})}
function busy(){return !!(drag&&drag.moved)||!!tween||!!wheelT}
function playCur(){
  if(!on)return;var n=mod(Math.round(p));quiet();hold=0;
  if(song&&!song.paused&&!cards[n].audio)song.pause();
  vidsOf(n).forEach(function(v){try{v.currentTime=0}catch(e){}var r=v.play();if(r&&r.catch)r.catch(function(){})});
  loop();
}
/* the reel's drift: the strip creeps with the playing clip's time (or a still's hold), then glides on at the end */
function clipOf(n){var a=main(n);return a&&a.querySelector('.oc-b>video')}
function driftStep(dt){
  var n=mod(Math.round(p)),base=Math.round(p),v=clipOf(n)||(cards[n].momo?vidsOf(n)[0]:null),f=0;
  if(v&&v.duration>0&&isFinite(v.duration)&&!v.error){f=Math.min(1,v.currentTime/v.duration);if(v.paused&&v.readyState<2){hold+=dt;if(hold>6){hold=0;ended(n)}}}
  else{hold+=dt;f=Math.min(1,hold/(HOLD/1000));if(hold>=HOLD/1000&&!stay){hold=0;ended(n);return}}
  if(cards[n].audio&&song&&!song.paused)f=0;
  p=base+CREEP*f;
}
function loop(){if(!raf){lastT=0;raf=requestAnimationFrame(frame)}}
function frame(t){
  raf=0;if(!on)return;
  var dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  if(tween){var k=Math.min(1,(t-tween.t0)/tween.ms),e=1-Math.pow(1-k,3);p=tween.a+(tween.b-tween.a)*e;
    if(k>=1){tween=null;p=Math.round(p);if(p>=N)p-=N;if(p<0)p+=N;place();playCur()}}
  else if(!busy()&&!board)driftStep(dt); /* Film cards board: no auto-swipe (Gill, 8:15 PM Nov 11) */
  place();raf=requestAnimationFrame(frame);
}
function glide(to,ms){quiet();clearTimeout(holdT);sel=-1;tween={a:p,b:to,t0:performance.now(),ms:ms||EASE_MS};loop()}
function step(dir,user){
  var from=Math.round(p);
  if(!user){passed++;if(passed>=N&&!stay){finish();return}}
  glide(from+dir);
}
function ended(i){if(!on||board||busy()||mod(Math.round(p))!==i)return;if(cards[i].audio&&song&&!song.paused)return;step(1,false)}
function finish(){var cb=onDone;hide();if(cb)cb()}
function toggleSong(src){
  if(!song){song=new Audio(src);song.preload='metadata';
    song.addEventListener('ended',function(){sync(false);if(on&&!board&&cards[mod(Math.round(p))].audio)step(1,false)});
    song.addEventListener('play',function(){sync(true)});song.addEventListener('pause',function(){sync(false)})}
  if(song.paused){var r=song.play();if(r&&r.catch)r.catch(function(){})}else song.pause();
}
function sync(v){track.querySelectorAll('.oc-play').forEach(function(b){b.textContent=v?'pause':'play';b.setAttribute('aria-pressed',v?'true':'false')})}
var PTS={};
function down(e){
  if(board)e.stopPropagation();
  PTS[e.pointerId]=1;
  if(Object.keys(PTS).length>1){if(drag&&drag.moved){drag=null;glide(Math.round(p),280)}drag=null;return} /* a pinch belongs to sky.js */
  if(e.button)return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,p0:p,moved:false,t:performance.now(),v:0,multi:false};
}
function move(e){
  if(!drag||e.pointerId!==drag.id)return;
  var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;tween=null;quiet();drag.p0=p}
  if(drag.moved){var now=performance.now(),np=drag.p0-dx/stride();drag.v=(np-p)/Math.max(.008,(now-drag.t)/1000);drag.t=now;p=np;place()}
}
function up(e){
  if(board)e.stopPropagation();
  var multi=Object.keys(PTS).length>1;delete PTS[e.pointerId];
  if(!drag||e.pointerId!==drag.id){return}
  var d=drag;drag=null;
  if(d.moved){
    var delta=p-d.p0,o=Math.round(d.p0),t=o;
    if(Math.abs(delta)>.18||Math.abs(d.v)>.85)t=o+((Math.abs(d.v)>Math.abs(delta)*2)?(d.v>0?1:-1):(delta>0?1:-1));
    passed=0;glide(t,Math.max(280,Math.min(560,300+Math.abs(t-p)*140)));return;
  }
  if(multi||e.type==='pointercancel'||!on)return;
  if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12)return;
  if(board){pick();return}
  finish(); /* a tap goes straight to the sky */
}
function wheel(e){
  var dx=e.deltaMode===1?e.deltaX*32:e.deltaX,dy=e.deltaMode===1?e.deltaY*32:e.deltaY;
  if(e.ctrlKey||Math.abs(dx)<=Math.abs(dy))return; /* vertical / ctrl wheel stays with sky.js */
  e.preventDefault();e.stopPropagation();
  wheelAcc+=dx;clearTimeout(wheelT);
  wheelT=setTimeout(function(){wheelT=0;wheelAcc=0},180);
  if(!tween&&Math.abs(wheelAcc)>40){var dir=wheelAcc>0?1:-1;wheelAcc=0;passed=0;glide(Math.round(p)+dir)}
}
function key(e){
  if(!on)return;
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();passed=0;glide(Math.round(p)+1)}
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();passed=0;glide(Math.round(p)-1)}
  else if(e.key==='Enter'||e.key===' '){if(e.target&&e.target.closest&&e.target.closest('button'))return;e.preventDefault();if(board)pick();else finish()}
}
function host(){
  var h=document.getElementById('opb');
  if(h)return h;
  h=el('div');h.id='opb';h.setAttribute('aria-hidden','true');
  var land=document.getElementById('land');
  land.parentNode.insertBefore(h,land.nextSibling);
  return h;
}
function park(){
  var land=document.getElementById('land'),h=document.getElementById('opb');
  if(h){h.classList.remove('on');h.setAttribute('aria-hidden','true')}
  if(land&&root&&root.parentNode!==land)land.appendChild(root);
  if(root)root.setAttribute('aria-label','title cards on the way into the sky');
}
function pick(){
  var n=mod(Math.round(p)),c=N?cards[n]:null,fn=onPick;
  if(!c||!fn)return;
  quiet();if(song&&!song.paused)song.pause();
  fn(c);
}
function show(opts){
  if(!root)return false;opts=opts||{};
  board=!!opts.board;onPick=opts.pick||null;stay=board||!!opts.stay;onDone=opts.done||null;
  if(board){
    var h=host();if(root.parentNode!==h)h.appendChild(root);
    h.classList.add('on');h.setAttribute('aria-hidden','false');
    root.setAttribute('aria-label','film cards');
  }else{
    park();
    document.getElementById('land').classList.add('op');
  }
  if(on){if(board&&!document.documentElement.classList.contains('fpon'))playCur();return true}
  on=true;passed=0;tween=null;drag=null;p=opts.start||0;cur=-1;startedAt=performance.now();place();playCur();
  return true;
}
function hide(){
  if(!on)return;on=false;quiet();if(song&&!song.paused)song.pause();clearTimeout(holdT);tween=null;drag=null;PTS={};
  if(raf){cancelAnimationFrame(raf);raf=0}
  if(board){board=false;onPick=null;park()}
}
window.GJ_OPEN={mount:mount,show:show,hide:hide,hush:quiet,
  get on(){return on},
  get board(){return board},
  state:function(){var n=mod(Math.round(p));return{on:on,board:board,i:n,n:N,p:+p.toFixed(4),title:N?cards[n].title:'',ctr:ctr?ctr.textContent:'',
    tween:!!tween,passed:passed,song:song?{paused:song.paused,t:song.currentTime}:null,
    clip:(function(){var v=clipOf(n);return v?{src:(v.currentSrc||'').split('/').slice(-2).join('/'),t:+v.currentTime.toFixed(2),d:v.duration,paused:v.paused,loop:v.loop}:null})()}},
  go:function(i){passed=0;glide(mod(i)+(0),10)}};
})();
