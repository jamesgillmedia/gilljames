/* gill james v3.2 · Scope: the film player you land in at L3 / play (the reel and every film).
   2.39 frame · timecode · a cut rail (one star per cut, joined by a hairline, the playhead a glowing star) you can scrub ·
   a swipeable shot strip that follows playback · shot label (+ "full film ›" when the shot is from a film on the site) · ‹ › shots · sound.
   The reel (v7) only loads on a tap / scrub / play: 720p on phones, 1080p wide.
   v3.2.2 native films: every film with local files (data-j "native": media/films/NN/shots.json) plays here exactly like the reel: its own
   cuts on the rail, its own shot strip, sound; a long film is several < 25 MB parts played back to back as one timeline (next part preloaded,
   swapped on a cut). No Vimeo player anywhere; a film with no local file shows its still + a quiet note. YouTube films still play in the
   frame (postMessage API). Format: the frame morphs between the 2.39 cut screen and full screen (the film's own aspect, whole viewport)
   without touching the <video> (no reload, no restart, no flash): auto on rotation / resize (landscape phones and tall films go full while
   playing), ⤢ toggles by hand (dive.js full() hands over to __scope.toggleFull for these).
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
var REEL=null,DATA={},DQ={};
function natData(u,cb){if(DATA[u]){cb(DATA[u]);return}if(!DQ[u]){DQ[u]=[];fetch(u).then(function(r){if(!r.ok)throw r.status;return r.json()}).then(function(d){DATA[u]=d;if(/reel\//.test(u))REEL=d;var q=DQ[u];delete DQ[u];q.forEach(function(f){f(d)})}).catch(function(){var q=DQ[u]||[];delete DQ[u];q.forEach(function(f){f(null)})})}DQ[u].push(cb)} /* v3.4: a failed fetch answers null (retried on the next ▶) */
/* M = the work on screen. kind: reel | film. nat: a full local film we drive (the reel + native films, parts = its files on one timeline);
   'clip' (a film's local preview clip at L3, YouTube films) or 'ext' (YouTube while playing). soon: a film with no local file yet */
var M=null,O=null,userT=0,touching=false,rq=0;
function pad(n){n=Math.floor(n);return(n<10?'0':'')+n}
function tcode(s,fps){s=Math.max(0,s||0);if(!fps)return pad(s/3600)+':'+pad(s/60%60)+':'+pad(s%60);var f=Math.floor((s%1)*fps);return '00:'+pad(s/60)+':'+pad(s%60)+':'+pad(f)}
function fill(o){O=o;var key=o.it.dataset.k;
  if(M&&M.key===key){setPlay(o.play);return M.vid||null}
  stop();var j=o.j,it=o.it;
  var nat=j.reel?'media/reel/shots.json':(j.native||'');
  M={key:key,reel:!!j.reel,nat:nat,j:j,it:it,shots:[],dur:0,fps:j.reel?23.976:24,cur:-1,play:false,vid:null,live:false,ext:null,extT:0,extD:0,parts:null,pi:0,nx:null,ar:16/9,
     soon:!nat&&!j.embed,clip:nat?null:(it.dataset.pv||it.dataset.sc||''),meta:j.meta||'',muted:M0.muted};
  imm.classList.add('scoped');root.hidden=false;root.classList.toggle('reel',M.reel);root.classList.toggle('nat',!!nat);
  o.frame.className='frame'+(nat?' fit':'');o.frame.innerHTML='';o.frame.style.width=o.frame.style.height='';FMT.user=null;fmt(true);
  preview();
  var dm=(j.meta||'').match(/(\d+):(\d\d)\s*$/);
  if(nat){M.dur=dm?(+dm[1]*60+ +dm[2]):0;natLoad(M)}
  else{M.extD=dm?(+dm[1]*60+ +dm[2]):0;build();filmStrip()}
  setPlay(o.play);label();return M.vid}
function natLoad(m){if(m.loading)return;m.loading=1;natData(m.nat,function(d){m.loading=0;if(M!==m)return;
    if(!d){if(m.play){O.label('▶ play film');pwatch(true)}return} /* shots.json did not come: never sit on "… loading"; ▶ asks again */
    m.dur=d.dur;m.fps=d.fps||24;if(d.ar)m.ar=d.ar;
    m.parts=d.parts||[{src:(innerWidth>=900&&d.src1080)||d.src720,t:0,d:d.dur}];m.poster=d.poster;
    m.shots=d.shots.map(function(s){return{t:s.t,title:s.title,film:s.film,th:s.th}});fmt(true);build();setShot(0,true);paint(now());if(m.play)setPlay(true)})}
/* v3.4 · the play label always ends on the truth: "❚❚ playing" once the picture moves, "▶ play film" when it is paused or could not start.
   Covers a play() that never settles (WebKit with no data yet, a stalled network), a video that was already playing when the work view
   re-rendered (no new 'playing' event), a load error, and a shots.json that never came. Checks at 2.5 s and 5 s; after 5 s with
   no picture it stops trying (pause) and says "▶ play film" so a tap starts it again. Reduced motion and WebKit take the same path. */
var PW=0;function pwatch(stop,keep){if(keep&&PW)return; /* 'waiting' keeps a deadline that is already running */
  clearTimeout(PW);PW=0;if(stop||!M||!M.nat||!M.play||!O)return;var m=M,n=0,v0=M.vid,t0=now();
  PW=setTimeout(function chk(){PW=0;if(M!==m||!m.play||!O)return;var v=m.vid&&m.live?m.vid:null;
    if(v&&v.paused&&!m.swap){O.label('▶ play film');return}
    if(v&&!v.paused&&v.readyState>=3&&(now()>t0+.05||v!==v0)){O.label('❚❚ playing');return} /* the picture really moves */
    if(++n<2){t0=now();v0=v;PW=setTimeout(chk,2500);return}
    if(v){try{v.pause()}catch(e){}}O.label('▶ play film')},2500)} /* a 'playing' event alone is not proof (WebKit can fire it, then stall) */
function okPlay(v){if(M&&M.vid===v&&O&&!v.paused&&v.readyState>=3)O.label('❚❚ playing')} /* play() resolved on a video that was already rolling */
/* the first thing in the frame: a muted preview loop (or the still); the scrubbable media replaces it on the first touch */
function preview(){var f=O.frame,it=M.it,pv=M.reel?'media/reel/pv.mp4':it.dataset.pv;
  if(pv&&anim()&&!save){var v=vid({src:pv,muted:true,loop:true,poster:it.dataset.big});v.autoplay=true;f.appendChild(v);v.play().catch(function(){});
    if(!M.nat){M.vid=v;M.live=true;hook(v)}}
  else{var im=new Image();im.src=it.dataset.big;im.alt='';f.appendChild(im)}}
function vid(a){var v=document.createElement('video');v.playsInline=true;v.setAttribute('playsinline','');v.preload=a.preload||'auto';if(a.muted){v.muted=true;v.setAttribute('muted','')}
  v.loop=!!a.loop;if(a.poster)v.poster=a.poster;v.src=a.src;return v}
function now(){if(!M)return 0;if(M.ext)return M.extT;var v=M.vid;if(!v||!M.live)return M.pend!=null&&M.nat?M.pend+partT():0;return (M.nat?partT():0)+(v.currentTime||0)}
function partT(){return M&&M.parts&&M.parts[M.pi]?M.parts[M.pi].t:0}
function hook(v){v.addEventListener('loadedmetadata',function(){if(M&&M.vid===v){if(!M.nat)M.dur=v.duration;else if(v.duration&&(!M.parts||M.parts.length<2))M.dur=v.duration;if(M.pend!=null){try{v.currentTime=M.pend}catch(e){}M.pend=null}build2();paint(now())}});
  v.addEventListener('timeupdate',function(){if(M&&M.vid===v){paint(now());edge()}});
  v.addEventListener('seeked',function(){if(M&&M.vid===v)paint(now())});
  v.addEventListener('play',function(){loop()});
  v.addEventListener('ended',function(){if(M&&M.vid===v&&M.nat&&M.parts&&M.pi<M.parts.length-1)toPart(M.pi+1,0,true)});
  if(M.nat){v.addEventListener('playing',function(){if(M&&M.vid===v&&O){O.label('❚❚ playing');calm()}});v.addEventListener('pause',function(){if(M&&M.vid===v&&O&&!M.swap){pwatch(true);O.label('▶ play film');wake()}})
    v.addEventListener('waiting',function(){if(M&&M.vid===v&&O&&M.play&&!v.paused){O.label('… loading');pwatch(false,true)}}); /* buffering mid-film: says so, and the watch ends it */
    v.addEventListener('error',function(){if(M&&M.vid===v&&O){pwatch(true);O.label('▶ play film')}})}}
function loop(){if(rq)return;rq=requestAnimationFrame(function f(){rq=0;if(!M||!M.vid||M.vid.paused||!M.live)return;paint(now());edge();rq=requestAnimationFrame(f)})}
/* parts: preload the next one near the end of this one, swap on its first cut (both stacked in the frame, the new one on top) */
function edge(){if(!M||!M.nat||!M.parts||M.pi>=M.parts.length-1||!M.vid)return;var v=M.vid,left=M.parts[M.pi].d-v.currentTime;
  if(left<10&&!M.nx){M.nx=partVid(M.pi+1);M.nx.preload='auto';M.nx.style.opacity='0';O.frame.insertBefore(M.nx,v);try{M.nx.load()}catch(e){}}
  if(left<.06&&!v.paused)toPart(M.pi+1,0,true)}
function partVid(i){var v=vid({src:M.parts[i].src,preload:'auto'});v.className='rv';v.dataset.pi=i;v.muted=!!M.muted;return v}
var zc=1;
function toPart(i,t,play){if(!M||!M.parts||!M.parts[i])return;var old=M.vid&&M.live?M.vid:null,nx=M.nx,v=nx&&+nx.dataset.pi===i?nx:partVid(i);M.nx=null;
  if(nx&&nx!==v){nx.removeAttribute('src');nx.remove()}
  M.swap=1;if(!v.parentNode)O.frame.appendChild(v);v.style.zIndex=String(++zc);v.style.opacity='1'; /* never moved in the DOM: stacking only */M.pi=i;M.vid=v;M.live=true;if(!v._hk){v._hk=1;hook(v)}O.setVid(v);v.muted=!!M.muted;
  if(v.readyState>=1){try{v.currentTime=t}catch(e){}}else M.pend=t;
  function done(){if(old&&old!==v){try{old.pause()}catch(e){}old.removeAttribute('src');try{old.load()}catch(e){}old.remove()}M.swap=0}
  if(play){var q=v.play();if(q&&q.then)q.then(function(){done();okPlay(v)},function(){done();O.label('▶ play film')});else done();pwatch()}else{try{old&&old.pause()}catch(e){}if(v.readyState>=2)done();else v.addEventListener('loadeddata',done,{once:true})}
  paint(now())}
/* the reel / a native film itself: only now does it load (the reel: 720p phones / 1080p wide if shots.json lists one). It goes on top of
   the preview loop and the loop leaves once the film has a picture, so the frame never flashes black */
function natVid(){if(M.vid&&M.live)return M.vid;if(!M.parts)M.parts=[{src:M.reel?(REEL&&REEL.src720||'media/reel/reel-v7-720.mp4'):'',t:0,d:M.dur}];
  var pre=[].slice.call(O.frame.children),v=partVid(M.pi||0);v.poster=M.reel?'media/reel/poster-960.jpg':(M.poster||M.it.dataset.big);v._hk=1;
  O.frame.appendChild(v);M.vid=v;M.live=true;hook(v);O.setVid(v);v.muted=!!M.muted;snd();
  function clear(){pre.forEach(function(c){if(c.tagName==='VIDEO'){try{c.pause()}catch(e){}c.removeAttribute('src');try{c.load()}catch(e){}}c.remove()})}
  if(v.readyState>=2)clear();else{v.addEventListener('loadeddata',clear,{once:true});setTimeout(clear,4000)}return v}
/* a film's clip at L3: the preview video if it is already in the frame, else the sky clip (media/sc) replaces the still */
function clipVid(){if(M.vid&&M.live)return M.vid;if(!M.clip)return null;var v=vid({src:M.clip,muted:true,loop:true,poster:M.it.dataset.big});O.frame.innerHTML='';O.frame.appendChild(v);M.vid=v;M.live=true;hook(v);O.setVid(v);return v}
function setPlay(p){if(!M)return;M.play=!!p;root.classList.toggle('ext',false);
  if(M.nat){if(p){if(!M.parts&&!M.reel){label();natLoad(M);pwatch();return} /* shots.json still on its way: natLoad() calls back (or asks again after a failed fetch) */
      var v=natVid();v.muted=!!M.muted;snd();var q=v.play();if(q&&q.then)q.then(function(){okPlay(v)},function(){if(M&&M.vid===v){pwatch(true);O.label('▶ play film')}});pwatch()}else{pwatch(true);if(M.vid&&M.live&&!M.vid.paused)M.vid.pause()}fmt()}
  else if(M.soon){M.play=false;if(p&&O)O.label('full film coming soon')} /* no local file yet (never the Vimeo player): still + quiet note */
  else if(p){ /* the film in the same frame (YouTube) */
    if(!M.ext){if(M.vid)try{M.vid.pause()}catch(e){}var f=document.createElement('iframe'),u=M.j.embed||'';
      if(/youtube/.test(u))u+=(u.indexOf('?')<0?'?':'&')+'enablejsapi=1&playsinline=1&origin='+encodeURIComponent(location.origin);
      f.src=u;f.allow='autoplay; fullscreen; picture-in-picture';f.title=M.j.title||'film';f.setAttribute('allowfullscreen','');
      if(/youtube/.test(u)){f.addEventListener('load',function(){yt(f,{event:'listening',id:'gj',channel:'widget'});setTimeout(function(){if(O&&M&&M.ext===f&&O.label)O.label('▶ in the player')},1500)})}
      O.frame.innerHTML='';O.frame.classList.add('ext');O.frame.appendChild(f);M.ext=f;M.vid=null;M.live=false;M.extT=0;O.setVid(null)}
    root.classList.add('ext');build();paint(M.extT)}
  else if(M.ext){M.ext.remove();M.ext=null;O.frame.classList.remove('ext');O.frame.innerHTML='';preview();O.setVid(M.vid);build();setShot(0,true);paint(0)}
  label()}
function snd(){if(!M)return;var m=!!M.muted;M0.muted=m;bSnd.textContent=m?'♪̸':'♪';bSnd.setAttribute('aria-pressed',String(!m));bSnd.setAttribute('aria-label',m?'sound off: tap for sound':'sound on: tap to mute')}
/* ---------- the rail + strip ---------- */
function shotsNow(){return M&&!M.ext?M.shots:[]}
function build(){var S=shotsNow();[].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});var D=dur();
  S.forEach(function(s,i){var t=document.createElement('i');t.className='tk'+(s.film?' f':'');t.style.left=(D?s.t/D*100:0)+'%';t.dataset.i=i;rail.insertBefore(t,head)});
  if(!M.ext){strip.innerHTML=S.map(function(s,i){return '<span class="th" data-i="'+i+'">'+(s.th?'<img src="'+esc(s.th)+'" alt="" width="240" height="100" decoding="async"'+(i>8?' loading="lazy"':'')+'>':'')+'</span>'}).join('');
    S.forEach(function(s,i){if(s.cv)strip.children[i].appendChild(s.cv)})}
  root.classList.toggle('nostrip',!S.length||!!M.ext);bPrev.hidden=bNext.hidden=!S.length||!!M.ext;bSnd.hidden=!M.nat||!!M.ext;snd();
  rail.setAttribute('aria-valuemax',String(Math.round(D)));M.cur=-1}
function build2(){if(M&&!M.nat&&!M.ext&&M.shots.length){var D=dur();[].forEach.call(rail.querySelectorAll('.tk'),function(t){t.style.left=(D?M.shots[+t.dataset.i].t/D*100:0)+'%'})}}
function dur(){if(!M)return 0;if(M.ext)return M.extD||0;if(M.nat)return M.dur||(M.reel?73:0)||1;return M.dur||(M.vid&&M.vid.duration)||2.5}
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
  else if(M.nat){snE.textContent=s?'· shot '+(M.cur+1)+' of '+S.length:'';h=esc(M.meta||'film')+(M.play?'':' · <span class="pl">▶ play film</span>')}
  else if(M.soon){snE.textContent=S.length?'· preview '+(M.cur+1)+' of '+S.length:'· still';h=esc(M.meta||'film')+' · <span class="soon">full film coming soon</span>'}
  else{snE.textContent=S.length?'· preview '+(M.cur+1)+' of '+S.length:'· still';h=esc(M.meta||'film')+' · <span class="pl">▶ play film</span>'}
  if(ff){lab.setAttribute('href',ff);h+=' · <span class="ff">full film ›</span>';lab.setAttribute('aria-label',(s?s.title:'')+': play the full film')}else{lab.removeAttribute('href');lab.removeAttribute('aria-label')}
  l2.innerHTML=h}
/* ---------- seeking ---------- */
function seek(t,keepPlay){if(!M)return;var D=dur();t=Math.max(0,Math.min(D?D-.05:t,t));
  if(M.ext){M.extT=t;extSeek(t);paint(t);return}
  if(M.nat){if(!M.parts&&!M.reel){paint(t);return}var P=M.parts||[{t:0}],i=0;for(var k=P.length-1;k>=0;k--)if(t>=P[k].t-.001){i=k;break}
    if(!(M.vid&&M.live))M.pi=i;var v=natVid();
    if(i!==M.pi){toPart(i,t-P[i].t,M.play);paint(t);return}
    var lt=t-P[i].t;if(v.readyState>=1){try{v.currentTime=lt}catch(e){}}else M.pend=lt;
    if(M.play&&v.paused)v.play().catch(function(){});paint(t);return}
  var v2=clipVid();if(!v2){paint(t);return}
  if(!v2.paused)v2.pause(); /* a film's preview stops where you put it */
  if(v2.readyState>=1){try{v2.currentTime=t}catch(e){}}else M.pend=t;
  paint(t)}
function step(d){var S=shotsNow();if(!S.length)return;var i=Math.max(0,Math.min(S.length-1,(M.cur<0?0:M.cur)+d));seek(S[i].t+.05);setShot(i,true);follow(true)}
root.addEventListener('click',function(e){var b=e.target.closest('[data-s]');
  if(b){e.preventDefault();var a=b.dataset.s;if(a==='prev')step(-1);else if(a==='next')step(1);else if(a==='snd'&&M){M.muted=!M.muted;if(M.vid&&M.live&&M.nat)M.vid.muted=M.muted;if(M.nx)M.nx.muted=M.muted;snd()}return}
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
  var v=M.vid;M.wasPlaying=!!(v&&!v.paused&&M.nat);wake();scrubTo(railT(e))});
rail.addEventListener('pointermove',function(e){if(PR===e.pointerId)scrubTo(railT(e))});
function pup(e){PN=Math.max(0,PN-1);if(PR!==e.pointerId)return;PR=null;rail.classList.remove('drag');if(e.type==='pointerup')seek(railT(e),true);userT=0;follow(true)}
rail.addEventListener('pointerup',pup);rail.addEventListener('pointercancel',pup);
rail.addEventListener('keydown',function(e){if(!M)return;var k=e.key;if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();e.stopPropagation();if(M.ext)seek(M.extT+(k==='ArrowRight'?10:-10));else step(k==='ArrowRight'?1:-1)}
  else if(k==='Home'){e.preventDefault();seek(0)}else if(k==='End'){e.preventDefault();seek(dur()-1)}});
addEventListener('resize',function(){if(M){fmt();follow(true)}});
/* ---------- format: 2.39 cut screen <-> full screen, one <video> that is never moved, reloaded or restarted ----------
   The frame gets a pixel size (CSS transitions width/height, so it morphs); the video fills it with object-fit: cover (a wide film is cut
   to 2.39, and in full screen the frame has the film's own aspect so nothing is cut) or contain for a tall film (pillarboxed in the cut).
   auto: full while playing on a landscape phone (height <= 500) or when a tall film plays on a portrait screen; cut otherwise.
   ⤢ (FMT.user) overrides auto until the screen turns. Full = .imm.fv (+ element full screen when the browser has it and it was a tap). */
var M0={muted:false},FMT={user:null,full:false,o:null,fs:0,ct:0},stage=null;
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
function orient(){return innerWidth>innerHeight?'l':'p'}
function autoFull(){if(!M||!M.nat||!M.play)return false;var l=innerWidth>innerHeight;return (l&&innerHeight<=500&&M.ar>=1.2)||(!l&&M.ar<1)}
function fmt(instant){if(!M||!M.nat||!O)return;var o=orient();if(FMT.o&&FMT.o!==o)FMT.user=null;FMT.o=o; /* a turn hands back to auto */
  var full=FMT.user!=null?FMT.user:autoFull()||!!(FMT.fs&&fsEl());
  if(full!==FMT.full){FMT.full=full;imm.classList.toggle('fv',full);imm.classList.toggle('sfull',full);var b=document.querySelector('.imm [data-a=full]');
    if(b){b.setAttribute('aria-label',full?'cut screen (2.39)':'full screen');b.textContent=full?'⤡':'⤢'}if(full)calm();else wake()}
  var f=O.frame;stage=f.parentNode;if(!stage)return;
  var SW=stage.clientWidth,SH=stage.clientHeight,a=M.ar||16/9,w,h;if(!SW||!SH)return;
  if(full){w=Math.min(SW,SH*a);h=w/a}else{w=Math.min(SW,SH*2.39);h=w/2.39}
  f.classList.toggle('tall',a<1.5);
  f.classList.add('sized');
  if(instant||!anim()){f.classList.add('nofit');f.style.width=w+'px';f.style.height=h+'px';void f.offsetWidth;f.classList.remove('nofit')}
  else{f.style.width=w+'px';f.style.height=h+'px'}
  root.classList.toggle('full',full);follow(true);clearTimeout(FMT.ft);FMT.ft=setTimeout(function(){if(M)follow(true)},620)}
function toggleFull(){if(!M||!M.nat)return;var want=!FMT.full;FMT.user=want;
  if(want&&!fsEl()&&(document.fullscreenEnabled||document.webkitFullscreenEnabled)&&(imm.requestFullscreen||imm.webkitRequestFullscreen)){
    try{var q=imm.requestFullscreen?imm.requestFullscreen():imm.webkitRequestFullscreen();FMT.fs=1;if(q&&q.then)q.then(function(){if(M&&M.ar>=1.2)try{screen.orientation.lock('landscape').catch(function(){})}catch(e){}},function(){FMT.fs=0})}catch(e){FMT.fs=0}}
  else if(!want&&FMT.fs&&fsEl()){FMT.fs=0;try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}try{screen.orientation.unlock()}catch(e){}}
  fmt()}
['fullscreenchange','webkitfullscreenchange'].forEach(function(n){document.addEventListener(n,function(){if(!fsEl()&&FMT.fs){FMT.fs=0;FMT.user=null}if(M)setTimeout(fmt,0)})});
if(window.ResizeObserver)new ResizeObserver(function(){if(M&&M.nat)fmt()}).observe(imm);
/* full screen chrome: the rail + strip float over the picture and rest after 2.6 s of play; any touch brings them back */
function calm(){clearTimeout(FMT.ct);if(!FMT.full)return;FMT.ct=setTimeout(function(){if(FMT.full&&M&&M.vid&&!M.vid.paused&&PR==null)imm.classList.add('calm')},2600)}
function wake(){imm.classList.remove('calm');clearTimeout(FMT.ct);if(FMT.full)calm()}
['pointerdown','pointermove','keydown'].forEach(function(n){imm.addEventListener(n,function(e){if(n==='pointermove'&&e.pointerType==='touch')return;if(FMT.full)wake()},{passive:true})});
/* ---------- the film's own player: YouTube postMessage API (time in, seek out); Vimeo kept only for old links ---------- */
function vm(f,method,value){try{f.contentWindow.postMessage(JSON.stringify(value===undefined?{method:method}:{method:method,value:value}),'https://player.vimeo.com')}catch(e){}}
function yt(f,o){try{f.contentWindow.postMessage(JSON.stringify(o),'*')}catch(e){}}
function extSeek(t){var f=M&&M.ext;if(!f)return;if(/vimeo/.test(f.src)){vm(f,'setCurrentTime',t);vm(f,'seekTo',t)}else yt(f,{event:'command',func:'seekTo',args:[t,true],id:'gj',channel:'widget'})}
addEventListener('message',function(e){if(!M||!M.ext||e.source!==M.ext.contentWindow)return;var d=e.data;try{if(typeof d==='string')d=JSON.parse(d)}catch(x){return}if(!d)return;
  if(/vimeo\.com$/.test(e.origin)){if(d.event==='ready'){vm(M.ext,'addEventListener','timeupdate');vm(M.ext,'addEventListener','playProgress');vm(M.ext,'getDuration')}
    else if((d.event==='timeupdate'||d.event==='playProgress')&&d.data){if(d.data.duration)M.extD=d.data.duration;if(PR==null){M.extT=d.data.seconds||0;paint(M.extT)}}
    else if(d.method==='getDuration'&&d.value){M.extD=d.value;paint(M.extT)}}
  else if(/youtube(-nocookie)?\.com$/.test(e.origin)&&d.info){if(d.info.duration)M.extD=d.info.duration;if(d.info.currentTime!=null&&PR==null){M.extT=d.info.currentTime;paint(M.extT)}}});
function stop(){clearTimeout(PW);PW=0;if(rq){cancelAnimationFrame(rq);rq=0}if(M){if(M.vid){try{M.vid.pause()}catch(e){}if(M.live&&M.nat){M.vid.removeAttribute('src');try{M.vid.load()}catch(e){}}}if(M.nx){M.nx.removeAttribute('src');M.nx.remove()}if(M.ext)M.ext.remove();
    if(O&&O.frame){O.frame.style.width=O.frame.style.height='';O.frame.classList.remove('fit','tall','sized')}}
  if(FMT.full){FMT.full=false;imm.classList.remove('fv','sfull')}imm.classList.remove('calm');FMT.user=null;
  if(FMT.fs&&fsEl()){FMT.fs=0;try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}
  M=null;imm.classList.remove('scoped');root.hidden=true;root.classList.remove('ext','reel','nat','full');strip.innerHTML='';[].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});lastF=-1}
/* v3.4: ▶ / ❚❚ on a native film (dive.js hands the tap over): pause, resume, or start again after a failed start */
function toggle(){if(!M||!M.nat)return;var v=M.vid&&M.live?M.vid:null;
  if(v&&!v.paused){pwatch(true);v.pause();return} /* M.play stays: a pause keeps the film's format (no morph back to the cut) */
  if(v&&M.parts){M.play=true;O.label('… loading');var q=v.play();if(q&&q.then)q.then(function(){okPlay(v)},function(){O.label('▶ play film')});pwatch();return}
  O.label('… loading');setPlay(true)}
/* v3.4: leave full screen now (✕ and browser Back close the film in the same step; no second tap, no full screen left over the grid) */
function unfull(){FMT.user=null;if(fsEl()){FMT.fs=0;try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}try{screen.orientation.unlock()}catch(e){}}FMT.fs=0;
  if(FMT.full){FMT.full=false;imm.classList.remove('fv','sfull','calm');root.classList.remove('full');var b=document.querySelector('.imm [data-a=full]');if(b){b.setAttribute('aria-label','full screen');b.textContent='⤢'}}}
window.__scope={fill:fill,stop:stop,toggle:toggle,unfull:unfull,seek:function(t){seek(t)},step:step,toggleFull:toggleFull,owns:function(){return !!(M&&M.nat)},playable:function(it){try{var j=JSON.parse(it.dataset.j||'{}');return !!(j.reel||j.native||j.embed)}catch(e){return true}},
  state:function(){if(!M)return null;var v=M.vid,f=O&&O.frame,r=f?f.getBoundingClientRect():null;return{key:M.key,reel:M.reel,nat:!!M.nat,soon:!!M.soon,play:M.play,ext:!!M.ext,shots:shotsNow().length,cur:M.cur,t:now(),dur:dur(),
    loaded:!!(v&&M.live),src:v&&M.live?v.currentSrc||v.src:'',paused:v?v.paused:true,part:M.pi,parts:M.parts?M.parts.length:0,full:FMT.full,user:FMT.user,
    frame:r?[Math.round(r.width),Math.round(r.height)]:null,vids:f?f.querySelectorAll('video').length:0,iframes:document.querySelectorAll('iframe[src*=vimeo]').length,
    scrollLeft:strip.scrollLeft,follow:!(touching||Date.now()-userT<2200)}}};
})();
