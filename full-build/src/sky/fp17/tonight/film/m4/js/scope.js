/* Scope · the film player (site-v3-pro2 js/scope.js, ported to stand on its own for m4 and R10; Gill, Nov 11: "the scope one we developed").
 2.39 frame · timecode · a cut rail (one star per cut, joined by a hairline, the playhead a glowing star) you can scrub ·
 a swipeable shot strip that follows playback · ‹ › shots · sound. Every film plays natively from its own files (<video>, nothing
 embedded from elsewhere): a long film is several parts on one timeline (next part preloaded near the end, swapped on its first frame).
 Format: the frame morphs between the 2.39 cut screen and full screen (the film's own aspect, whole viewport) without touching the
 <video> (no reload, no restart): auto on rotation / resize (landscape phones and tall films go full while playing), ⤢ by hand.
 Same motion with Reduce Motion on (Gill's rule).
 GJScope.create(o): o.frame = the frame element, o.stage = its parent (the box it is sized in), o.chrome = where the rail goes,
 o.full = the element that goes full screen (gets .sfull), o.onLabel(text), o.onFilm(key) (a reel shot's "full film ›"),
 o.onFull(bool), o.onTap (a tap on the picture; default play / pause). api.load(film) · play · pause · toggle · seek(t) · step(d) · toggleFull · stop · state.
 film = {key, reel, meta, dur, fps, ar, poster, parts:[{src,t,d}], shots:[{t,th,title,f}]} */
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pad(n){n=Math.floor(n);return(n<10?'0':'')+n}
function tcode(s,fps){s=Math.max(0,s||0);var f=Math.floor((s%1)*(fps||24));return pad(s/3600)+':'+pad(s/60%60)+':'+pad(s%60)+':'+pad(f)}
function create(o){
var frame=o.frame,full=o.full||o.stage,doc=document;
var root=doc.createElement('div');root.className='scope';root.hidden=true;
root.innerHTML='<div class="sc-row"><button type="button" class="sc-b" data-s="prev" aria-label="previous shot">‹</button>'+
  '<a class="sc-lab"><span class="l1"><span class="tc">00:00:00:00</span> <span class="sn"></span></span><span class="l2"></span></a>'+
  '<button type="button" class="sc-b sc-pp" data-s="play" aria-label="play">▶</button>'+
  '<button type="button" class="sc-b" data-s="snd" aria-label="sound on: tap to mute" aria-pressed="true">♪</button>'+
  '<button type="button" class="sc-b sc-fs" data-s="full" aria-label="full screen">⤢</button>'+
  '<button type="button" class="sc-b" data-s="next" aria-label="next shot">›</button></div>'+
  '<div class="sc-rail" role="slider" tabindex="0" aria-label="timeline: drag to scrub, arrow keys = shots" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">'+
  '<span class="sc-line"></span><span class="sc-fill"></span><b class="sc-head"></b></div>'+
  '<div class="sc-strip" aria-label="shots: tap to jump there"></div>';
o.chrome.appendChild(root);
function q(s){return root.querySelector(s)}
var lab=q('.sc-lab'),tcE=q('.tc'),snE=q('.sn'),l2=q('.l2'),rail=q('.sc-rail'),head=q('.sc-head'),fillE=q('.sc-fill'),strip=q('.sc-strip'),
    bPP=q('[data-s=play]'),bSnd=q('[data-s=snd]'),bFs=q('[data-s=full]');
var M=null,rq=0,userT=0,touching=false,lastF=-1,zc=1,muted=false;
var FMT={user:null,full:false,o:null,fs:0,ct:0};
function L(t){if(o.onLabel)o.onLabel(t);bPP.textContent=/playing|pause/.test(t)?'❚❚':'▶';bPP.setAttribute('aria-label',/playing|pause/.test(t)?'pause':'play')}
/* ---------- load a film (idle: whatever the host already shows in the frame stays until the film has a picture) ---------- */
function load(f){stop();M={f:f,key:f.key,reel:!!f.reel,dur:f.dur||0,fps:f.fps||24,ar:f.ar||16/9,parts:f.parts,shots:f.shots||[],pi:0,cur:-1,play:false,vid:null,live:false,nx:null,pend:null};
  root.hidden=false;root.classList.toggle('reel',M.reel);frame.classList.add('sc-fit');build();setShot(0,true);paint(0);label();fmt(true);return api}
function vid(src){var v=doc.createElement('video');v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.preload='auto';v.className='sc-v';v.src=src;v.muted=muted;return v}
function partT(){return M&&M.parts[M.pi]?M.parts[M.pi].t:0}
function now(){if(!M)return 0;var v=M.vid;if(!v||!M.live)return M.pend!=null?M.pend+partT():0;return partT()+(v.currentTime||0)}
function hook(v){
  v.addEventListener('loadedmetadata',function(){if(M&&M.vid===v){if(v.duration&&M.parts.length<2)M.dur=v.duration;if(M.pend!=null){try{v.currentTime=M.pend}catch(e){}M.pend=null}paint(now())}});
  v.addEventListener('timeupdate',function(){if(M&&M.vid===v){paint(now());edge()}});
  v.addEventListener('seeked',function(){if(M&&M.vid===v)paint(now())});
  v.addEventListener('play',function(){loop()});
  v.addEventListener('playing',function(){if(M&&M.vid===v){ld(false);L('❚❚ playing');calm()}});
  v.addEventListener('pause',function(){if(M&&M.vid===v&&!M.swap){L(v.ended&&M.pi>=M.parts.length-1?'▶ play again':'▶ play film');wake()}});
  v.addEventListener('waiting',function(){if(M&&M.vid===v&&M.play&&!v.paused)L('… loading')});
  v.addEventListener('ended',function(){ended(v)});
  v.addEventListener('error',function(){if(M&&M.vid===v){ld(false);L('▶ play film')}})}
function ended(v){if(M&&M.vid===v){if(M.pi<M.parts.length-1)toPart(M.pi+1,0,true);else{M.play=false;L('▶ play again');paint(M.dur);wake()}}}
function loop(){if(rq)return;rq=requestAnimationFrame(function f(){rq=0;if(!M||!M.vid||M.vid.paused||!M.live)return;paint(now());edge();rq=requestAnimationFrame(f)})}
function edge(){if(!M||M.pi>=M.parts.length-1||!M.vid)return;var v=M.vid,left=M.parts[M.pi].d-v.currentTime;
  if(left<10&&!M.nx){M.nx=partVid(M.pi+1);M.nx.style.opacity='0';frame.insertBefore(M.nx,v);try{M.nx.load()}catch(e){}}
  if(left<.06&&!v.paused)toPart(M.pi+1,0,true)}
function partVid(i){var v=vid(M.parts[i].src);v.dataset.pi=i;return v}
function toPart(i,t,play){if(!M||!M.parts[i])return;var old=M.vid&&M.live?M.vid:null,nx=M.nx,v=nx&&+nx.dataset.pi===i?nx:partVid(i);M.nx=null;
  if(nx&&nx!==v){nx.removeAttribute('src');nx.remove()}
  M.swap=1;if(!v.parentNode)frame.appendChild(v);v.style.zIndex=String(++zc);v.style.opacity='1';M.pi=i;M.vid=v;M.live=true;if(!v._hk){v._hk=1;hook(v)}v.muted=muted;
  if(v.readyState>=1){try{v.currentTime=t}catch(e){}}else M.pend=t;
  function done(){if(old&&old!==v){try{old.pause()}catch(e){}old.removeAttribute('src');try{old.load()}catch(e){}old.remove()}M.swap=0}
  if(play){var p=v.play();if(p&&p.then)p.then(done,function(){done();L('▶ play film')});else done()}else{try{old&&old.pause()}catch(e){}if(v.readyState>=2)done();else v.addEventListener('loadeddata',done,{once:true})}
  paint(now())}
/* the film itself only loads now; it goes on top of the idle picture, which leaves once the film has a frame (no black flash) */
function natVid(){if(M.vid&&M.live)return M.vid;var pre=[].slice.call(frame.children),v=partVid(M.pi||0);if(M.f.poster)v.poster=M.f.poster;v._hk=1;v.style.zIndex=String(++zc);
  frame.appendChild(v);M.vid=v;M.live=true;hook(v);
  function clear(){pre.forEach(function(c){if(c.tagName==='VIDEO'){try{c.pause()}catch(e){}c.removeAttribute('src');try{c.load()}catch(e){}}c.remove()});if(o.onIdleGone)o.onIdleGone()}
  if(v.readyState>=2)clear();else{v.addEventListener('loadeddata',clear,{once:true})}return v}
function ld(on){frame.classList.toggle('ld',!!on)}
function play(){if(!M)return;M.play=true;var v=natVid();v.muted=muted;snd();if(v.ended||(M.pi===M.parts.length-1&&v.duration&&v.currentTime>=v.duration-.05)){if(M.parts.length>1){toPart(0,0,true);fmt();return}try{v.currentTime=0}catch(e){}}
  if(v.readyState<3)ld(true);L('… loading');var p=v.play();if(p&&p.then)p.then(function(){if(M&&M.vid===v&&!v.paused&&v.readyState>=3){ld(false);L('❚❚ playing')}},function(){if(M&&M.vid===v){ld(false);L('▶ play film')}});fmt()}
function pause(){if(M&&M.vid&&M.live&&!M.vid.paused)M.vid.pause()}
function toggle(){if(!M)return;var v=M.vid&&M.live?M.vid:null;if(v&&!v.paused){pause();return}play()}
function snd(){bSnd.textContent=muted?'♪̸':'♪';bSnd.setAttribute('aria-pressed',String(!muted));bSnd.setAttribute('aria-label',muted?'sound off: tap for sound':'sound on: tap to mute')}
/* ---------- the rail + strip ---------- */
function dur(){return M?(M.dur||1):1}
function build(){[].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});var S=M.shots,D=dur();
  S.forEach(function(s,i){var t=doc.createElement('i');t.className='tk'+(s.f?' f':'');t.style.left=(D?s.t/D*100:0)+'%';rail.insertBefore(t,head)});
  strip.innerHTML=S.map(function(s,i){return '<button type="button" class="th" data-i="'+i+'" aria-label="'+esc(s.title||('shot '+(i+1)))+'">'+(s.th?'<img src="'+esc(s.th)+'" alt="" width="240" height="100" decoding="async"'+(i>8?' loading="lazy"':'')+'>':'')+'</button>'}).join('');
  root.classList.toggle('nostrip',!S.length);rail.setAttribute('aria-valuemax',String(Math.round(D)));M.cur=-1;snd()}
function shotAt(t){var S=M.shots;for(var i=S.length-1;i>=0;i--)if(t>=S[i].t-.02)return i;return 0}
function paint(t){if(!M)return;var D=dur(),x=D?Math.max(0,Math.min(1,t/D)):0;head.style.left=(x*100)+'%';fillE.style.width=(x*100)+'%';
  var f=Math.floor(t*M.fps);if(f!==lastF){lastF=f;tcE.textContent=tcode(t,M.fps)}
  rail.setAttribute('aria-valuenow',String(Math.round(t)));rail.setAttribute('aria-valuetext',tcE.textContent);
  if(M.shots.length)setShot(shotAt(t))}
function setShot(i,force){if(!M||(!force&&i===M.cur))return;M.cur=i;
  [].forEach.call(rail.querySelectorAll('.tk'),function(t,k){t.classList.toggle('on',k===i)});
  [].forEach.call(strip.children,function(b,k){b.classList.toggle('on',k===i)});follow(false);label()}
function follow(nw){var b=strip.children[M?M.cur:-1];if(!b||strip.scrollWidth<=strip.clientWidth+1)return;if(!nw&&(touching||Date.now()-userT<2200))return;
  var X=b.offsetLeft-strip.clientWidth/2+b.clientWidth/2;if(Math.abs(strip.scrollLeft-X)<2)return;strip.scrollTo({left:X,behavior:nw?'auto':'smooth'})}
function label(){if(!M)return;var S=M.shots,s=S[M.cur],h='',ff='';
  snE.textContent=s?'· shot '+(M.cur+1)+' of '+S.length:'';
  h=s&&s.title?esc(s.title):esc(M.f.meta||'');
  if(s&&s.f&&o.onFilm&&s.f!==M.key){ff=s.f;h+=' · <span class="ff">full film ›</span>'}
  if(ff){lab.setAttribute('href','#');lab.dataset.f=ff;lab.setAttribute('aria-label',(s.title||'')+': play the full film')}else{lab.removeAttribute('href');delete lab.dataset.f;lab.removeAttribute('aria-label')}
  l2.innerHTML=h}
/* ---------- seeking ---------- */
function seek(t){if(!M)return;var D=dur();t=Math.max(0,Math.min(D-.05,t));var P=M.parts,i=0;for(var k=P.length-1;k>=0;k--)if(t>=P[k].t-.001){i=k;break}
  if(!(M.vid&&M.live))M.pi=i;var v=natVid();
  if(i!==M.pi){toPart(i,t-P[i].t,M.play);paint(t);return}
  var lt=t-P[i].t;if(v.readyState>=1){try{v.currentTime=lt}catch(e){}}else M.pend=lt;
  if(M.play&&v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}paint(t)}
function step(d){var S=M?M.shots:[];if(!S.length)return;var i=Math.max(0,Math.min(S.length-1,(M.cur<0?0:M.cur)+d));seek(S[i].t+.05);setShot(i,true);follow(true)}
root.addEventListener('click',function(e){var b=e.target.closest('[data-s]');
  if(b){e.preventDefault();var a=b.dataset.s;if(a==='prev')step(-1);else if(a==='next')step(1);else if(a==='play')toggle();else if(a==='full')toggleFull();
    else if(a==='snd'){muted=!muted;if(M&&M.vid)M.vid.muted=muted;if(M&&M.nx)M.nx.muted=muted;snd()}return}
  var th=e.target.closest('.th');if(th&&M){e.preventDefault();var i=+th.dataset.i;if(!M.play)play();seek(M.shots[i].t+.05);setShot(i,true);userT=0;follow(true);return}
  var a2=e.target.closest('a.sc-lab[href]');if(a2){e.preventDefault();if(a2.dataset.f&&o.onFilm)o.onFilm(a2.dataset.f)}});
/* a tap on the picture: play / pause (full screen: brings the chrome back first) */
frame.addEventListener('click',function(e){if(!M||root.hidden)return;if(FMT.full&&full.classList.contains('calm')){wake();return}if(o.onTap)o.onTap();else toggle()});
strip.addEventListener('touchstart',function(){touching=true;userT=Date.now()},{passive:true});
strip.addEventListener('touchend',function(){touching=false;userT=Date.now()},{passive:true});strip.addEventListener('touchcancel',function(){touching=false},{passive:true});
strip.addEventListener('wheel',function(){userT=Date.now()},{passive:true});
strip.addEventListener('scroll',function(){if(touching)userT=Date.now()},{passive:true});
/* rail scrub: one pointer drags the playhead (hosts that guard pointer events at window level hand them over through api.pointer) */
var PR=null,sq=0,sT=0;
function railT(e){var r=rail.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*dur()}
function scrubTo(t){sT=t;paint(t);if(sq)return;sq=requestAnimationFrame(function(){sq=0;seek(sT)})}
function pointer(e){if(!M||!rail.contains(e.target)&&PR!==e.pointerId)return false;var n=e.type;
  if(n==='pointerdown'){if(PR!=null)return true;PR=e.pointerId;try{rail.setPointerCapture(e.pointerId)}catch(x){}rail.classList.add('drag');wake();scrubTo(railT(e));return true}
  if(n==='pointermove'){if(PR===e.pointerId)scrubTo(railT(e));return true}
  if(n==='pointerup'||n==='pointercancel'){if(PR!==e.pointerId)return true;PR=null;rail.classList.remove('drag');if(n==='pointerup')seek(railT(e));userT=0;follow(true);return true}
  return false}
['pointerdown','pointermove','pointerup','pointercancel'].forEach(function(n){rail.addEventListener(n,function(e){if(!e._sc){e._sc=1;pointer(e)}})});
rail.addEventListener('keydown',function(e){if(!M)return;var k=e.key;if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();e.stopPropagation();step(k==='ArrowRight'?1:-1)}
  else if(k==='Home'){e.preventDefault();seek(0)}else if(k==='End'){e.preventDefault();seek(dur()-1)}});
/* ---------- format: 2.39 cut screen <-> full screen, one <video> that is never moved, reloaded or restarted ---------- */
function fsEl(){return doc.fullscreenElement||doc.webkitFullscreenElement}
function orient(){return innerWidth>innerHeight?'l':'p'}
function autoFull(){if(!M||!M.play)return false;var l=innerWidth>innerHeight;return (l&&innerHeight<=500&&M.ar>=1.2)||(!l&&M.ar<1)}
function fmt(instant){if(!M)return;var or=orient();if(FMT.o&&FMT.o!==or&&!fsEl())FMT.user=null;FMT.o=or;
  var fl=FMT.user!=null?FMT.user:autoFull()||!!(FMT.fs&&fsEl());
  if(fl!==FMT.full){FMT.full=fl;full.classList.toggle('sfull',fl);root.classList.toggle('full',fl);bFs.textContent=fl?'⤡':'⤢';bFs.setAttribute('aria-label',fl?'cut screen (2.39)':'full screen');if(o.onFull)o.onFull(fl);if(fl)calm();else wake()}
  if(!fl&&o.sizeCut&&!o.sizeCut()){frame.classList.remove('sized','tall');frame.style.width=frame.style.height='';return} /* the host sizes the cut frame itself (m4's piece layer) */
  var st=o.stage;if(!st)return;var SW=st.clientWidth,SH=st.clientHeight,a=M.ar||16/9,w,h;if(o.maxH)SH=Math.max(SH,o.maxH(fl));if(!SW||!SH)return;
  if(fl){w=Math.min(SW,SH*a);h=w/a}else{w=Math.min(SW,SH*2.39);h=w/2.39}
  frame.classList.toggle('tall',a<1.5);frame.classList.add('sized');
  if(instant){frame.classList.add('nofit');frame.style.width=w+'px';frame.style.height=h+'px';void frame.offsetWidth;frame.classList.remove('nofit')}
  else{frame.style.width=w+'px';frame.style.height=h+'px'}
  clearTimeout(FMT.ft);FMT.ft=setTimeout(function(){if(M)follow(true)},620)}
function toggleFull(){if(!M)return;var want=!FMT.full,canFs=(doc.fullscreenEnabled||doc.webkitFullscreenEnabled)&&(full.requestFullscreen||full.webkitRequestFullscreen);
  if(FMT.full&&FMT.user==null&&canFs&&!fsEl())want=true; /* auto-full (landscape phone): the first ⤢ goes to real full screen, the next one back to the cut */
  FMT.user=want;
  if(want&&canFs&&!fsEl()){try{var p=full.requestFullscreen?full.requestFullscreen():full.webkitRequestFullscreen();FMT.fs=1;if(p&&p.then)p.then(function(){try{if(M&&M.ar>=1.2)screen.orientation.lock('landscape').catch(function(){})}catch(e){}},function(){FMT.fs=0})}catch(e){FMT.fs=0}}
  else if(!want&&fsEl()){FMT.fs=0;exitFs()}
  fmt()}
function exitFs(){try{var x=(doc.exitFullscreen||doc.webkitExitFullscreen).call(doc);if(x&&x.catch)x.catch(function(){})}catch(e){}try{screen.orientation.unlock()}catch(e){}}
['fullscreenchange','webkitfullscreenchange'].forEach(function(n){doc.addEventListener(n,function(){if(!fsEl()&&FMT.fs){FMT.fs=0;FMT.user=null}if(M)setTimeout(fmt,0)})});
addEventListener('resize',function(){if(M){fmt();follow(true)}});
if(window.ResizeObserver&&o.stage)new ResizeObserver(function(){if(M)fmt()}).observe(o.stage);
/* full screen chrome: the rail + strip float over the picture and rest after 2.6 s of play; any touch brings them back */
function calm(){clearTimeout(FMT.ct);if(!FMT.full)return;FMT.ct=setTimeout(function(){if(FMT.full&&M&&M.vid&&!M.vid.paused&&PR==null)full.classList.add('calm')},2600)}
function wake(){full.classList.remove('calm');clearTimeout(FMT.ct);if(FMT.full)calm()}
['pointerdown','keydown'].forEach(function(n){full.addEventListener(n,function(){if(FMT.full)wake()},{passive:true})});
full.addEventListener('pointermove',function(e){if(e.pointerType!=='touch'&&FMT.full)wake()},{passive:true});
function stop(){if(rq){cancelAnimationFrame(rq);rq=0}
  if(M){if(M.vid){try{M.vid.pause()}catch(e){}if(M.live){M.vid.removeAttribute('src');try{M.vid.load()}catch(e){}M.vid.remove()}}if(M.nx){M.nx.removeAttribute('src');M.nx.remove()}}
  frame.style.width=frame.style.height='';frame.classList.remove('sc-fit','tall','sized','ld');
  if(FMT.full){FMT.full=false;full.classList.remove('sfull');if(o.onFull)o.onFull(false)}full.classList.remove('calm');FMT.user=null;root.classList.remove('full');
  if(FMT.fs&&fsEl()){FMT.fs=0;exitFs()}
  M=null;root.hidden=true;strip.innerHTML='';[].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});lastF=-1}
var api={poke:function(e){if(FMT.full&&!(e&&e.type==='pointermove'&&e.pointerType==='touch'))wake()},load:load,play:play,pause:pause,toggle:toggle,seek:seek,step:step,toggleFull:toggleFull,stop:stop,pointer:pointer,ended:function(v){ended(v)},fmt:fmt,el:root,
  isFull:function(){return FMT.full},on:function(){return !!M},
  state:function(){if(!M)return null;var v=M.vid,r=frame.getBoundingClientRect();return{key:M.key,play:M.play,shots:M.shots.length,cur:M.cur,t:now(),dur:dur(),loaded:!!(v&&M.live),
    src:v&&M.live?v.currentSrc||v.src:'',paused:v?v.paused:true,ended:v?v.ended:false,ct:v?v.currentTime:0,part:M.pi,parts:M.parts.length,full:FMT.full,user:FMT.user,fs:!!fsEl(),
    frame:[Math.round(r.width),Math.round(r.height)],vids:frame.querySelectorAll('video').length,iframes:doc.querySelectorAll('iframe').length,scrollLeft:strip.scrollLeft,muted:muted}}};
return api}
window.GJScope={create:create};
})();
