/* gill james v3.2 · Scope: the film player you land in at L3 / play (the reel and every film).
   2.39 frame · timecode · a cut rail (one star per cut, joined by a hairline, the playhead a glowing star) you can scrub ·
   a swipeable shot strip that follows playback · shot label (+ "full film ›" when the shot is from a film on the site) · ‹ › shots · sound.
   The reel (v7) only loads on a tap / scrub / play: 720p on phones, 1080p wide. Films play in the same frame (Vimeo / YouTube);
   there the rail scrubs the film through the player's own postMessage API. At L3 a film's rail + strip are its local preview clip.
   dive.js owns levels / gestures / history: it calls __scope.fill() and __scope.stop(); one finger on the strip is native pan-x. */
(function(){
'use strict';
var imm=document.querySelector('.imm');if(!imm)return;
var bot=imm.querySelector('.imm-bot'),RM=matchMedia('(prefers-reduced-motion: reduce)'),save=(navigator.connection||{}).saveData;
function anim(){return !RM.matches}
function $(s,r){return(r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var root=document.createElement('div');root.className='scope';root.hidden=true;
root.innerHTML='<div class="sc-row"><button type="button" class="ib sc-b" data-s="prev" aria-label="previous shot">‹</button>'+
  '<a class="sc-lab"><span class="l1"><span class="tc">00:00:00:00</span> <span class="sn"></span></span><span class="l2"></span></a>'+
  '<button type="button" class="ib sc-b" data-s="snd" aria-label="sound" aria-pressed="true" hidden>♪</button>'+
  '<button type="button" class="ib sc-b" data-s="next" aria-label="next shot">›</button></div>'+
  '<div class="sc-rail" role="slider" tabindex="0" aria-label="timeline: drag to scrub, arrow keys = shots" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">'+
  '<span class="sc-line"></span><span class="sc-fill"></span><b class="sc-head"></b></div>'+
  '<div class="sc-strip" aria-hidden="true"></div>';
bot.insertBefore(root,bot.firstChild);
var lab=$('.sc-lab',root),tcE=$('.tc',root),snE=$('.sn',root),l2=$('.l2',root),rail=$('.sc-rail',root),head=$('.sc-head',root),fillE=$('.sc-fill',root),strip=$('.sc-strip',root),
    bPrev=$('[data-s=prev]',root),bNext=$('[data-s=next]',root),bSnd=$('[data-s=snd]',root);
var REEL=null,reelQ=null;
function reelData(cb){if(REEL){cb(REEL);return}if(!reelQ){reelQ=[];fetch('media/reel/shots.json').then(function(r){return r.json()}).then(function(d){REEL=d;reelQ.forEach(function(f){f(d)});reelQ=null}).catch(function(){reelQ=null})}if(reelQ)reelQ.push(cb)}
/* M = the work on screen. kind: reel | film. mode: 'clip' (a local video we drive) or 'ext' (Vimeo / YouTube while playing a film) */
var M=null,O=null,userT=0,touching=false,rq=0;
function pad(n){n=Math.floor(n);return(n<10?'0':'')+n}
function tcode(s,fps){s=Math.max(0,s||0);if(!fps)return pad(s/3600)+':'+pad(s/60%60)+':'+pad(s%60);var f=Math.floor((s%1)*fps);return '00:'+pad(s/60)+':'+pad(s%60)+':'+pad(f)}
function fill(o){O=o;var key=o.it.dataset.k;
  if(M&&M.key===key){setPlay(o.play);return M.vid||null}
  stop();var j=o.j,it=o.it;
  M={key:key,reel:!!j.reel,j:j,it:it,shots:[],dur:0,fps:j.reel?23.976:24,cur:-1,play:false,vid:null,live:false,ext:null,extT:0,extD:0,clip:j.reel?null:(it.dataset.pv||it.dataset.sc||''),meta:j.meta||''};
  imm.classList.add('scoped');root.hidden=false;root.classList.toggle('reel',M.reel);
  o.frame.className='frame';o.frame.innerHTML='';
  preview();
  if(M.reel){var m=M;reelData(function(d){if(M!==m)return;m.dur=d.dur;m.fps=d.fps;m.shots=d.shots.map(function(s){return{t:s.t,title:s.title,film:s.film,th:s.th}});build();setShot(0,true);paint(m.vid&&m.live?m.vid.currentTime:0)})}
  else{var d=(j.meta||'').match(/(\d+):(\d\d)\s*$/);M.extD=d?(+d[1]*60+ +d[2]):0;filmStrip()}
  setPlay(o.play);label();return M.vid}
/* the first thing in the frame: a muted preview loop (or the still); the scrubbable media replaces it on the first touch */
function preview(){var f=O.frame,it=M.it,pv=M.reel?'media/reel/pv.mp4':it.dataset.pv;
  if(pv&&anim()&&!save){var v=vid({src:pv,muted:true,loop:true,poster:it.dataset.big});v.autoplay=true;f.appendChild(v);v.play().catch(function(){});
    if(!M.reel){M.vid=v;M.live=true;hook(v)}}
  else{var im=new Image();im.src=it.dataset.big;im.alt='';f.appendChild(im)}}
function vid(a){var v=document.createElement('video');v.playsInline=true;v.setAttribute('playsinline','');v.preload=a.preload||'auto';if(a.muted){v.muted=true;v.setAttribute('muted','')}
  v.loop=!!a.loop;if(a.poster)v.poster=a.poster;v.src=a.src;return v}
function hook(v){v.addEventListener('loadedmetadata',function(){if(M&&M.vid===v){if(!M.reel)M.dur=v.duration;else if(v.duration)M.dur=v.duration;if(M.pend!=null){try{v.currentTime=M.pend}catch(e){}M.pend=null}build2();paint(v.currentTime)}});
  v.addEventListener('timeupdate',function(){if(M&&M.vid===v)paint(v.currentTime)});
  v.addEventListener('seeked',function(){if(M&&M.vid===v)paint(v.currentTime)});
  v.addEventListener('play',function(){loop()});
  if(M.reel){v.addEventListener('playing',function(){if(M&&M.vid===v&&O)O.label('❚❚ playing')});v.addEventListener('pause',function(){if(M&&M.vid===v&&O)O.label('▶ play film')})}}
function loop(){if(rq)return;rq=requestAnimationFrame(function f(){rq=0;if(!M||!M.vid||M.vid.paused||!M.live)return;paint(M.vid.currentTime);rq=requestAnimationFrame(f)})}
/* the reel itself: only now does it load (720p phones / 1080p wide) */
function reelVid(){if(M.vid&&M.live)return M.vid;var s7=REEL&&REEL.src720||'media/reel/reel-v7-720.mp4',src=innerWidth>=900&&REEL&&REEL.src1080||s7; /* 1080p only on wide screens and only if shots.json lists one (none = 720p everywhere) */
  var v=vid({src:src,poster:'media/reel/poster-960.jpg'});v.className='rv';O.frame.innerHTML='';O.frame.appendChild(v);M.vid=v;M.live=true;hook(v);O.setVid(v);v.muted=!!M.muted;snd();return v}
/* a film's clip at L3: the preview video if it is already in the frame, else the sky clip (media/sc) replaces the still */
function clipVid(){if(M.vid&&M.live)return M.vid;if(!M.clip)return null;var v=vid({src:M.clip,muted:true,loop:true,poster:M.it.dataset.big});O.frame.innerHTML='';O.frame.appendChild(v);M.vid=v;M.live=true;hook(v);O.setVid(v);return v}
function setPlay(p){if(!M)return;M.play=!!p;root.classList.toggle('ext',false);
  if(M.reel){if(p){var v=reelVid();v.muted=!!M.muted;snd();var q=v.play();if(q&&q.catch)q.catch(function(){O.label('▶ play film')})}else if(M.vid&&M.live&&!M.vid.paused)M.vid.pause()}
  else if(p){ /* the film in the same frame (Vimeo / YouTube) */
    if(!M.ext){if(M.vid)try{M.vid.pause()}catch(e){}var f=document.createElement('iframe'),u=M.j.embed||'';
      if(/youtube/.test(u))u+=(u.indexOf('?')<0?'?':'&')+'enablejsapi=1&playsinline=1&origin='+encodeURIComponent(location.origin);
      f.src=u;f.allow='autoplay; fullscreen; picture-in-picture';f.title=M.j.title||'film';f.setAttribute('allowfullscreen','');
      if(/youtube/.test(u)){f.addEventListener('load',function(){yt(f,{event:'listening',id:'gj',channel:'widget'});setTimeout(function(){if(O&&M&&M.ext===f&&O.label)O.label('▶ in the player')},1500)})}
      O.frame.innerHTML='';O.frame.classList.add('ext');O.frame.appendChild(f);M.ext=f;M.vid=null;M.live=false;M.extT=0;O.setVid(null)}
    root.classList.add('ext');build();paint(M.extT)}
  else if(M.ext){M.ext.remove();M.ext=null;O.frame.classList.remove('ext');O.frame.innerHTML='';preview();O.setVid(M.vid);build();setShot(0,true);paint(0)}
  label()}
function snd(){if(!M)return;var m=!!M.muted;bSnd.textContent=m?'♪̸':'♪';bSnd.setAttribute('aria-pressed',String(!m));bSnd.setAttribute('aria-label',m?'sound off: tap for sound':'sound on: tap to mute')}
/* ---------- the rail + strip ---------- */
function shotsNow(){return M&&!M.ext?M.shots:[]}
function build(){var S=shotsNow();[].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});var D=dur();
  S.forEach(function(s,i){var t=document.createElement('i');t.className='tk'+(s.film?' f':'');t.style.left=(D?s.t/D*100:0)+'%';t.dataset.i=i;rail.insertBefore(t,head)});
  if(!M.ext){strip.innerHTML=S.map(function(s,i){return '<span class="th" data-i="'+i+'">'+(s.th?'<img src="'+esc(s.th)+'" alt="" width="240" height="100" decoding="async"'+(i>8?' loading="lazy"':'')+'>':'')+'</span>'}).join('');
    S.forEach(function(s,i){if(s.cv)strip.children[i].appendChild(s.cv)})}
  root.classList.toggle('nostrip',!S.length||!!M.ext);bPrev.hidden=bNext.hidden=!S.length||!!M.ext;bSnd.hidden=!M.reel||!!M.ext;snd();
  rail.setAttribute('aria-valuemax',String(Math.round(D)));M.cur=-1}
function build2(){if(M&&!M.reel&&!M.ext&&M.shots.length){var D=dur();[].forEach.call(rail.querySelectorAll('.tk'),function(t){t.style.left=(D?M.shots[+t.dataset.i].t/D*100:0)+'%'})}}
function dur(){if(!M)return 0;if(M.ext)return M.extD||0;if(M.reel)return M.dur||73;return M.dur||(M.vid&&M.vid.duration)||2.5}
/* a film's strip: a few evenly spaced frames from its own local clip, drawn once into canvases (no invented shots) */
function filmStrip(){var m=M,src=m.clip;if(!src)return;var v=document.createElement('video'),N=4,i=0,done=false;v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.src=src;
  var to=setTimeout(fin,6000);function fin(){if(done)return;done=true;clearTimeout(to);v.removeAttribute('src');try{v.load()}catch(e){}}
  v.addEventListener('error',fin);
  v.addEventListener('loadedmetadata',function(){if(M!==m){fin();return}var D=v.duration||2.5;m.clipD=D;if(!m.vid||m.vid.src.indexOf(src)<0)m.dur=D;
    m.shots=[];for(var k=0;k<N;k++)m.shots.push({t:+(D*(k+.5)/N-.25*D/N).toFixed(3),title:'',film:0});m.shots[0].t=0;next()});
  function next(){if(M!==m||i>=N){fin();if(M===m&&!m.ext){build();setShot(0,true);paint(m.vid&&m.live?m.vid.currentTime:0)}return}try{v.currentTime=Math.min(m.shots[i].t+.04,(v.duration||2.5)-.05)}catch(e){fin()}}
  v.addEventListener('seeked',function(){if(M!==m||done)return;var c=document.createElement('canvas');c.width=240;c.height=100;try{var vw=v.videoWidth,vh=v.videoHeight,sh=vw/2.39;c.getContext('2d').drawImage(v,0,(vh-sh)/2,vw,sh,0,0,240,100)}catch(e){}
    m.shots[i].cv=c;i++;next()})}
function shotAt(t){var S=shotsNow();for(var i=S.length-1;i>=0;i--)if(t>=S[i].t-.02)return i;return 0}
var lastF=-1;
function paint(t){if(!M)return;var D=dur(),x=D?Math.max(0,Math.min(1,t/D)):0;head.style.left=(x*100)+'%';fillE.style.width=(x*100)+'%';
  var f=Math.floor(t*(M.fps||24));if(f!==lastF){lastF=f;tcE.textContent=M.ext?tcode(t)+(D?' / '+tcode(D):''):tcode(t,M.fps)}
  rail.setAttribute('aria-valuenow',String(Math.round(t)));rail.setAttribute('aria-valuetext',tcE.textContent);
  if(!M.ext&&M.shots.length)setShot(shotAt(t))}
function setShot(i,force){if(!M||(!force&&i===M.cur))return;M.cur=i;var S=shotsNow();
  [].forEach.call(rail.querySelectorAll('.tk'),function(t,k){t.classList.toggle('on',k===i)});
  [].forEach.call(strip.children,function(b,k){b.classList.toggle('on',k===i)});follow(false);label()}
/* the strip keeps the current shot in the middle, unless a finger is on it (or was, a moment ago) */
function follow(now){var b=strip.children[M?M.cur:-1];if(!b||strip.scrollWidth<=strip.clientWidth+1)return;if(!now&&(touching||Date.now()-userT<2200))return;
  var L=b.offsetLeft-strip.clientWidth/2+b.clientWidth/2;if(Math.abs(strip.scrollLeft-L)<2)return;
  strip.scrollTo({left:L,behavior:anim()&&!now?'smooth':'auto'})}
function label(){if(!M)return;var S=shotsNow(),s=S[M.cur],h='',ff='';
  if(M.ext){snE.textContent='· full film';h=esc(/youtube/.test(M.j.embed)?'on YouTube':'on Vimeo')}
  else if(M.reel){snE.textContent=s?'· shot '+(M.cur+1)+' of '+S.length:'';h=s?esc(s.title):'reel · '+esc(M.meta);
    if(s&&s.film&&document.querySelector('.ch[data-k=film] .it[data-k="w'+s.film+'"]'))ff='#film/w'+s.film+'/play'}
  else{snE.textContent=S.length?'· preview '+(M.cur+1)+' of '+S.length:'· still';h=esc(M.meta||'film')+' · <span class="pl">▶ play film</span>'}
  if(ff){lab.setAttribute('href',ff);h+=' · <span class="ff">full film ›</span>';lab.setAttribute('aria-label',(s?s.title:'')+': play the full film')}else{lab.removeAttribute('href');lab.removeAttribute('aria-label')}
  l2.innerHTML=h}
/* ---------- seeking ---------- */
function seek(t,keepPlay){if(!M)return;var D=dur();t=Math.max(0,Math.min(D?D-.05:t,t));
  if(M.ext){M.extT=t;extSeek(t);paint(t);return}
  var v=M.reel?reelVid():clipVid();if(!v){paint(t);return}
  if(!M.reel&&!v.paused)v.pause(); /* a film's preview stops where you put it */
  if(v.readyState>=1){try{v.currentTime=t}catch(e){}}else M.pend=t;
  if(M.reel&&M.play&&v.paused)v.play().catch(function(){});
  paint(t)}
function step(d){var S=shotsNow();if(!S.length)return;var i=Math.max(0,Math.min(S.length-1,(M.cur<0?0:M.cur)+d));seek(S[i].t+.05);setShot(i,true);follow(true)}
root.addEventListener('click',function(e){var b=e.target.closest('[data-s]');
  if(b){e.preventDefault();var a=b.dataset.s;if(a==='prev')step(-1);else if(a==='next')step(1);else if(a==='snd'&&M){M.muted=!M.muted;if(M.vid&&M.live&&M.reel)M.vid.muted=M.muted;snd()}return}
  var th=e.target.closest('.th');if(th&&M){var i=+th.dataset.i;seek(M.shots[i].t+.05);setShot(i,true);userT=0;follow(true);return}
  var a2=e.target.closest('a.sc-lab[href]');if(a2){e.preventDefault();var m=a2.getAttribute('href').match(/^#film\/(w\d+)\/play$/);if(m&&window.__dive)__dive.go({k:'film',lv:3,w:m[1],play:true})}});
/* the strip is a native horizontal scroller (touch-action: pan-x); we only note that a finger is on it so auto-follow waits */
strip.addEventListener('touchstart',function(){touching=true;userT=Date.now()},{passive:true});
strip.addEventListener('touchend',function(){touching=false;userT=Date.now()},{passive:true});strip.addEventListener('touchcancel',function(){touching=false},{passive:true});
strip.addEventListener('pointerdown',function(e){if(e.pointerType!=='touch'){userT=Date.now()}},{passive:true});
strip.addEventListener('wheel',function(){userT=Date.now()},{passive:true});
strip.addEventListener('scroll',function(){if(touching)userT=Date.now()},{passive:true});
/* rail scrub: one pointer drags the playhead; a second finger cancels (that is a pinch, which dive.js owns) */
var PR=null,PN=0,sq=0,sT=0;
function railT(e){var r=rail.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*dur()}
function scrubTo(t){sT=t;paint(t);if(sq)return;sq=requestAnimationFrame(function(){sq=0;seek(sT,true)})}
rail.addEventListener('pointerdown',function(e){PN++;if(PN>1){PR=null;return}if(!M)return;PR=e.pointerId;try{rail.setPointerCapture(e.pointerId)}catch(x){}rail.classList.add('drag');
  var v=M.vid;M.wasPlaying=!!(v&&!v.paused&&M.reel);scrubTo(railT(e))});
rail.addEventListener('pointermove',function(e){if(PR===e.pointerId)scrubTo(railT(e))});
function pup(e){PN=Math.max(0,PN-1);if(PR!==e.pointerId)return;PR=null;rail.classList.remove('drag');if(e.type==='pointerup')seek(railT(e),true);userT=0;follow(true)}
rail.addEventListener('pointerup',pup);rail.addEventListener('pointercancel',pup);
rail.addEventListener('keydown',function(e){if(!M)return;var k=e.key;if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();e.stopPropagation();if(M.ext)seek(M.extT+(k==='ArrowRight'?10:-10));else step(k==='ArrowRight'?1:-1)}
  else if(k==='Home'){e.preventDefault();seek(0)}else if(k==='End'){e.preventDefault();seek(dur()-1)}});
addEventListener('resize',function(){if(M)follow(true)});
/* ---------- the film's own player: Vimeo + YouTube postMessage APIs (time in, seek out) ---------- */
function vm(f,method,value){try{f.contentWindow.postMessage(JSON.stringify(value===undefined?{method:method}:{method:method,value:value}),'https://player.vimeo.com')}catch(e){}}
function yt(f,o){try{f.contentWindow.postMessage(JSON.stringify(o),'*')}catch(e){}}
function extSeek(t){var f=M&&M.ext;if(!f)return;if(/vimeo/.test(f.src)){vm(f,'setCurrentTime',t);vm(f,'seekTo',t)}else yt(f,{event:'command',func:'seekTo',args:[t,true],id:'gj',channel:'widget'})}
addEventListener('message',function(e){if(!M||!M.ext||e.source!==M.ext.contentWindow)return;var d=e.data;try{if(typeof d==='string')d=JSON.parse(d)}catch(x){return}if(!d)return;
  if(/vimeo\.com$/.test(e.origin)){if(d.event==='ready'){vm(M.ext,'addEventListener','timeupdate');vm(M.ext,'addEventListener','playProgress');vm(M.ext,'getDuration')}
    else if((d.event==='timeupdate'||d.event==='playProgress')&&d.data){if(d.data.duration)M.extD=d.data.duration;if(PR==null){M.extT=d.data.seconds||0;paint(M.extT)}}
    else if(d.method==='getDuration'&&d.value){M.extD=d.value;paint(M.extT)}}
  else if(/youtube(-nocookie)?\.com$/.test(e.origin)&&d.info){if(d.info.duration)M.extD=d.info.duration;if(d.info.currentTime!=null&&PR==null){M.extT=d.info.currentTime;paint(M.extT)}}});
function stop(){if(rq){cancelAnimationFrame(rq);rq=0}if(M){if(M.vid){try{M.vid.pause()}catch(e){}if(M.live&&M.reel){M.vid.removeAttribute('src');try{M.vid.load()}catch(e){}}}if(M.ext)M.ext.remove()}
  M=null;imm.classList.remove('scoped');root.hidden=true;root.classList.remove('ext','reel');strip.innerHTML='';[].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});lastF=-1}
window.__scope={fill:fill,stop:stop,seek:function(t){seek(t)},step:step,
  state:function(){if(!M)return null;var v=M.vid;return{key:M.key,reel:M.reel,play:M.play,ext:!!M.ext,shots:shotsNow().length,cur:M.cur,t:M.ext?M.extT:(v&&M.live?v.currentTime:0),dur:dur(),
    loaded:!!(v&&M.live),src:v&&M.live?v.currentSrc||v.src:'',paused:v?v.paused:true,scrollLeft:strip.scrollLeft,follow:!(touching||Date.now()-userT<2200)}}};
})();
