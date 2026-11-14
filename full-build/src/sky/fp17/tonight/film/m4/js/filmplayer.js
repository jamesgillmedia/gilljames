/* m4 · the Film chapter player (Gill, Nov 11: "proper navigation between films", keep the player AND the stills; 7:45 PM: "the video
 player is not the scope one we developed": the play view is now Scope, pro2's own player, js/scope.js).
 A film opens full screen in the sky in a 2.39 frame with its short preview as the idle picture; '▶ play film' plays the real film
 natively (Reel 2026 = m4's reel-v7 file; the films = their own files from the live site-v3, one timeline of parts; nothing
 embedded from elsewhere) with Scope's timecode, cut rail (one star per cut, scrub), swipeable shot strip, sound and the 2.39 <-> full screen morph.
 A film with no native file says 'stills only'. Under it, that film's stills (a tap opens one full screen).
 ‹ › step to the neighbouring film, ⤢ full screen, 'full page ›' opens the r9-style page, ✕ = the grid.
 History: every state is a hash on top of the sky's film board: #film/<slug> · #film/<slug>/play · #film/<slug>/still/<n>.
 One Back = one step; ✕ goes back the whole way in one tap. The sky (js/sky.js) never sees these entries: this file loads before
 it and owns their popstate / keys / pointers. Data: js/filmdata.js (tools/film_player.py). Same motion with Reduce Motion on. */
(function(){
'use strict';
var F=window.GJ_FILMS||[],BY={};
F.forEach(function(f,i){f.i=i;f.fallback=0;if(!f.stills.length&&f.poster){f.stills=[f.poster];f.fallback=1}BY[f.s]=f});
function $(s,r){return(r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pad(n){return(n<10?'0':'')+n}
var EASE='cubic-bezier(.2,.7,.2,1)';

/* ---------- state + hashes ---------- */
var S={on:false,f:null,p:0,st:-1,d:0,solo:0},PEND=null,root=null,frame=null,strip=null,lb=null,SC=null;
function hashFor(st){return '#film/'+st.s+(st.solo?'/play':st.st>=0?'/still/'+(st.st+1):st.p?'/play':'')}
function parse(h){var m=(h||'').match(/^#\/?film\/([\w-]+)(?:\/(play|still\/(\d+)))?\/?$/);if(!m||!BY[m[1]])return null;
  var f=BY[m[1]],st=m[3]?Math.max(0,Math.min(f.stills.length-1,(+m[3])-1)):-1;
  return{fp:1,s:m[1],p:m[2]==='play'&&f.play?1:0,st:st}}
function push(st,replace){st.fp=1;try{history[replace?'replaceState':'pushState'](st,'',location.pathname+location.search+hashFor(st))}catch(e){}}

/* a deep link (#film/<slug>[/play|/still/n]): the sky seeds its film board first, then the player goes on top of it */
var DEEP=parse(location.hash),PAGEHOME=!!document.getElementById('layer');
if(DEEP&&PAGEHOME&&!DEEP.p)DEEP=null; /* the sky's page: #film/<slug> (and its stills) is the film page, not the player */
if(DEEP){try{history.replaceState(null,'',location.pathname+location.search+(PAGEHOME?'#film/'+DEEP.s:'#film/board'))}catch(e){}}
function whenSky(cb){var n=0,want=PAGEHOME&&DEEP?'#film/'+DEEP.s:'#film/board';(function t(){var h=history.state;if(h&&h.u1&&location.hash===want&&document.documentElement.classList.contains('deep')){setTimeout(cb,PAGEHOME?400:0);return}if(++n<300)setTimeout(t,100)})()}

/* ---------- DOM ---------- */
function build(){
  root=document.createElement('div');root.id='fp';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','film');
  root.innerHTML='<div class="fp-veil" aria-hidden="true"></div>'+
    '<header class="fp-top"><p class="fp-crumb"><span>film</span> <i aria-hidden="true">›</i> <b></b></p><span class="fp-n" aria-hidden="true"></span>'+
    '<button type="button" class="fp-full" data-a="full" aria-label="full screen">⤢</button>'+
    '<button type="button" class="fp-x" data-a="x" aria-label="back">✕</button></header>'+
    '<div class="fp-stage"><div class="fp-frame"></div></div>'+
    '<div class="fp-scope"></div>'+
    '<nav class="fp-ctl" aria-label="film">'+
      '<button type="button" class="fp-nb fp-prev" data-a="prev"><span aria-hidden="true">‹</span></button>'+
      '<span class="fp-mid"><button type="button" class="fp-play" data-a="play">▶ play film</button><span class="fp-so" hidden>stills only</span></span>'+
      '<button type="button" class="fp-nb fp-next" data-a="next"><span aria-hidden="true">›</span></button></nav>'+
    '<div class="fp-info"><h2></h2><p class="fp-role"></p><p class="fp-meta"></p><a class="fp-page" href="#">full page <span aria-hidden="true">›</span></a></div>'+
    '<div class="fp-strip"></div>'+
    '<div class="fp-lb" hidden role="dialog" aria-label="still"><img alt=""><button type="button" class="fp-lbp" data-a="lbprev" aria-label="previous still">‹</button>'+
      '<button type="button" class="fp-lbn" data-a="lbnext" aria-label="next still">›</button><span class="fp-lbc"></span>'+
      '<button type="button" class="fp-lbx" data-a="lbx" aria-label="close the still">✕</button></div>';
  document.body.appendChild(root);
  frame=$('.fp-frame',root);strip=$('.fp-strip',root);lb=$('.fp-lb',root);
  SC=window.GJScope.create({frame:frame,stage:$('.fp-stage',root),chrome:$('.fp-scope',root),full:root,
    onLabel:label,onTap:function(){playBtn()},onFilm:function(s){toFilm(s)},
    sizeCut:function(){return !!S.p}});
  root.addEventListener('click',onClick);
  ['wheel','dblclick','contextmenu'].forEach(function(n){root.addEventListener(n,function(e){e.stopPropagation()},{passive:true})});
  /* lightbox swipe */
  var tx=null;lb.addEventListener('touchstart',function(e){if(e.touches.length===1)tx={x:e.touches[0].clientX,y:e.touches[0].clientY};else tx=null},{passive:true});
  lb.addEventListener('touchend',function(e){if(!tx)return;var t=e.changedTouches[0],dx=t.clientX-tx.x,dy=t.clientY-tx.y;tx=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)lbStep(dx<0?1:-1)},{passive:true});
  addEventListener('resize',size);
  if(window.ResizeObserver)new ResizeObserver(size).observe($('.fp-stage',root));
  ['fullscreenchange','webkitfullscreenchange'].forEach(function(n){document.addEventListener(n,function(){root.classList.toggle('fs',!!fsEl());setTimeout(size,0)})});
}
/* the sky's own listeners must not see the player: window-capture guards registered before js/sky.js and js/depth.js */
function mine(e){return S.on&&root&&e.target&&root.contains(e.target)}
['pointerdown','pointermove','pointerup','pointercancel'].forEach(function(n){addEventListener(n,function(e){if(mine(e)){e.stopImmediatePropagation();if(SC&&!e._sc){e._sc=1;if(n!=='pointerup'&&n!=='pointercancel')SC.poke(e);SC.pointer(e)}}},true)}); /* Scope's rail scrub gets them here */
addEventListener('ended',function(e){if(mine(e)){e.stopImmediatePropagation();if(SC&&e.target&&e.target.classList&&e.target.classList.contains('sc-v'))SC.ended(e.target)}},true); /* GJ_NOLOOP (depth.js) stays off the player's videos; a film plays to its natural end */
addEventListener('keydown',function(e){if(!S.on)return;e.stopImmediatePropagation();var k=e.key;
  if(k==='Escape'){e.preventDefault();if(fsEl())return;if(SC&&SC.isFull()){SC.toggleFull();return}if(S.st>=0)history.back();else closeAll()}
  else if((k==='ArrowLeft'||k==='ArrowRight')&&S.solo){if(e.target&&(e.target.tagName==='VIDEO'||e.target.classList.contains('sc-rail')))return;e.preventDefault();if(SC&&SC.on())SC.step(k==='ArrowRight'?1:-1)}
  else if(k==='ArrowLeft'||k==='ArrowRight'){if(e.target&&(e.target.tagName==='VIDEO'||e.target.classList.contains('sc-rail')))return;e.preventDefault();if(S.st>=0)lbStep(k==='ArrowRight'?1:-1);else neighbour(k==='ArrowRight'?1:-1)}
  else if(k===' '&&S.st<0&&!(e.target&&/^(BUTTON|A|VIDEO)$/.test(e.target.tagName))){e.preventDefault();playBtn()}},true);
addEventListener('popstate',function(e){var st=e.state;
  if(st&&st.fp&&BY[st.s]){e.stopImmediatePropagation();
    if(PEND){var to=PEND;PEND=null;var n={s:to,p:0,st:-1,d:st.d||1};push(n,true);show(n,PDIR);return}
    show(st);return}
  PEND=null;if(S.on)hide()});

/* ---------- show a state ---------- */
function show(st,dir){if(!root)build();var f=BY[st.s];if(!f)return;
  var first=!S.on,changed=S.f!==f;
  S.on=true;S.d=st.d||1;S.solo=st.solo?1:0;root.classList.toggle('solo',!!S.solo);
  if(first){root.hidden=false;document.documentElement.classList.add('fpon');root.animate([{opacity:0},{opacity:1}],{duration:260,easing:EASE});
    $('.fp-stage',root).animate([{transform:'scale(.94)',opacity:.4},{transform:'none',opacity:1}],{duration:420,easing:EASE})}
  if(changed){if(S.p)stopPlay(true);S.f=f;S.p=0;paint(f);if(!first&&dir)frame.animate([{opacity:0,transform:'translateX('+(dir*28)+'px)'},{opacity:1,transform:'none'}],{duration:320,easing:EASE})}
  if(st.p&&!S.p)startPlay(st.t);else if(!st.p&&S.p)stopPlay();
  lbShow(st.st==null?-1:st.st);
  if(first)setTimeout(function(){var x=$('.fp-x',root);try{x.focus({preventScroll:true})}catch(e){}},30)}
function hide(){if(!S.on)return;stopPlay(true);idleStop();S.on=false;S.f=null;S.st=-1;S.solo=0;root.classList.remove('solo');lb.hidden=true;
  if(fsEl())exitFs();
  var r=root;r.animate([{opacity:1},{opacity:0}],{duration:200,easing:EASE}).onfinish=function(){if(!S.on){r.hidden=true;frame.innerHTML='';strip.innerHTML=''}};
  document.documentElement.classList.remove('fpon')}
function closeAll(){if(fsEl())exitFs();var d=S.d||1;if(history.state&&history.state.fp)history.go(-d);else hide()}

/* ---------- paint one film (idle) ---------- */
var IDLE=null;
function paint(f){
  $('h2',root).textContent=f.t;$('.fp-crumb b',root).textContent=f.short||f.t;
  $('.fp-role',root).textContent=f.role||'';$('.fp-role',root).hidden=!f.role;
  $('.fp-meta',root).textContent=f.meta||'';
  $('.fp-n',root).textContent=pad(f.i+1)+' / '+pad(F.length);
  var pv=F[(f.i-1+F.length)%F.length],nx=F[(f.i+1)%F.length];
  $('.fp-prev',root).setAttribute('aria-label','previous film: '+pv.t);$('.fp-prev',root).title=pv.short||pv.t;
  $('.fp-next',root).setAttribute('aria-label','next film: '+nx.t);$('.fp-next',root).title=nx.short||nx.t;
  var pg=$('.fp-page',root);pg.hidden=!f.page;if(f.page)pg.setAttribute('href',f.page);
  SC.stop();
  label(f.play?'▶ play film':'');playUI(f);
  $('.fp-full',root).hidden=!f.play;
  root.classList.remove('playing');
  idle(f);
  if(f.play)SC.load(scFilm(f));
  strip.setAttribute('aria-label','stills from '+f.t);
  strip.innerHTML=f.stills.map(function(s,i){return '<button type="button" class="th" data-i="'+i+'" aria-label="still '+(i+1)+' of '+f.stills.length+'"><img src="'+esc(s)+'" alt="" loading="'+(i<6?'eager':'lazy')+'" decoding="async"></button>'}).join('');
  strip.scrollLeft=0;size()}
/* the film as Scope reads it */
function scFilm(f){var p=f.play;return{key:f.s,reel:!!p.reel,meta:[f.role,f.meta].filter(Boolean).join(' · '),dur:p.dur,fps:p.fps,ar:p.ar,poster:p.poster||f.poster,parts:p.parts,shots:p.shots}}
/* no native file: an honest 'stills only' in place of the play button */
function playUI(f){var ok=!!(f&&f.play);$('.fp-play',root).hidden=!ok;$('.fp-so',root).hidden=ok;root.classList.toggle('noplay',!ok)}
/* the idle picture: the film's own short preview (pv, 640 px) to its natural end, then again, as the Film chapter already does
 (GJ_NOLOOP: a clip with no other clip in its set starts again). The 240 px sky clips (sc) are never blown up here; no pv = the still. */
function idle(f){idleStop();frame.innerHTML='';frame.className='fp-frame';
  var clips=[f.pv].filter(Boolean),img=new Image();img.src=f.poster;img.alt='';img.className='fp-still';frame.appendChild(img);
  if(!clips.length)return;
  var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.playsInline=true;v.setAttribute('playsinline','');
  v.preload='auto';v.poster=f.poster;v.className='fp-idle';var k=0;v.src=clips[0];
  v.addEventListener('playing',function(){v.classList.add('live')});
  v.addEventListener('ended',function(){if(clips.length>1){k=(k+1)%clips.length;v.src=clips[k]}else{try{v.currentTime=0}catch(e){}}var q=v.play();if(q&&q.catch)q.catch(function(){})});
  frame.appendChild(v);IDLE=v;var q=v.play();if(q&&q.catch)q.catch(function(){})}
function idleStop(){if(IDLE){try{IDLE.pause()}catch(e){}IDLE.removeAttribute('src');try{IDLE.load()}catch(e){}IDLE=null}}

/* ---------- the real film: Scope (js/scope.js) ---------- */
function label(t){var b=root&&$('.fp-play',root);if(b)b.textContent=t}
function startPlay(t){var f=S.f;if(!f||!f.play)return;S.p=1;root.classList.add('playing');if(!SC.on())SC.load(scFilm(f));SC.play();if(t)SC.seek(t)}
function stopPlay(quiet){if(SC)SC.stop();S.p=0;if(fsEl())exitFs();if(root)root.classList.remove('playing');if(!quiet&&S.f){idle(S.f);label('▶ play film');playUI(S.f);if(S.f.play)SC.load(scFilm(S.f));size()}}
function playBtn(){var f=S.f;if(!f||!f.play)return;
  if(!S.p){step({s:f.s,p:1,st:-1,d:(S.d||1)+1});return}
  SC.toggle()}
/* a reel shot's 'full film ›': that film, playing (the reel's place stays one Back away) */
function toFilm(s){var f=BY[s];if(!f||!f.play)return;SC.stop();
  if(S.solo){var o={s:s,p:1,st:-1,d:S.d||1,solo:1};push(o,true);show(o,1);return}push({s:s,p:0,st:-1,d:S.d||1},true);show({s:s,p:0,st:-1,d:S.d||1},1);step({s:s,p:1,st:-1,d:(S.d||1)+1})}

/* ---------- stills: fullscreen with its own history step ---------- */
function lbShow(i){S.st=i;if(i<0){if(!lb.hidden){lb.hidden=true}return}
  var f=S.f;i=Math.max(0,Math.min(f.stills.length-1,i));S.st=i;var im=$('img',lb),was=lb.hidden;im.src=f.stills[i];
  $('.fp-lbc',lb).textContent=(i+1)+' / '+f.stills.length;$('.fp-lbp',lb).hidden=$('.fp-lbn',lb).hidden=f.stills.length<2;
  lb.hidden=false;if(was)lb.animate([{opacity:0},{opacity:1}],{duration:220,easing:EASE});
  if(S.p&&SC)SC.pause()}
function lbStep(d){var f=S.f;if(!f||S.st<0)return;var n=(S.st+d+f.stills.length)%f.stills.length;push({s:f.s,p:0,st:n,d:S.d},true);lbShow(n);
  $('img',lb).animate([{opacity:.3,transform:'translateX('+(d*24)+'px)'},{opacity:1,transform:'none'}],{duration:240,easing:EASE})}

/* ---------- neighbours ---------- */
function neighbour(d){var f=S.f;if(!f)return;var to=F[(f.i+d+F.length)%F.length];
  if(S.p&&history.state&&history.state.fp&&history.state.p){PEND=to.s;PDIR=d;history.back();return} /* playing: step out of play first, then swap in place (prev/next never add history; Back = where the film was opened from) */
  push({s:to.s,p:0,st:-1,d:S.d||1},true);show({s:to.s,p:0,st:-1,d:S.d||1},d)}
var PDIR=1;

/* ---------- format ---------- */
var PORT=matchMedia('(orientation:portrait) and (max-width:899px)');
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
function exitFs(){try{var x=(document.exitFullscreen||document.webkitExitFullscreen).call(document);if(x&&x.catch)x.catch(function(){})}catch(e){}}
function full(){if(SC&&SC.on()){SC.toggleFull();return}if(fsEl())exitFs()}
function size(){if(!root||root.hidden||!S.f)return;if(SC&&SC.on()){SC.fmt();return}frame.style.width=frame.style.height=''} /* the piece: CSS sizes the band; the player: Scope */

/* ---------- taps ---------- */
function onClick(e){var b=e.target.closest('[data-a],.th');if(!b||b.closest('.scope'))return;
  if(b.classList.contains('th')){if(b.closest('.scope'))return;e.preventDefault();var i=+b.dataset.i,f=S.f;
    step({s:f.s,p:S.p,st:i,d:(S.d||1)+1});return} /* a still over a playing film pauses it; Back returns to the film */
  var a=b.dataset.a;e.preventDefault();
  if(a==='x')closeAll();
  else if(a==='play')playBtn();
  else if(a==='prev')neighbour(-1);
  else if(a==='next')neighbour(1);
  else if(a==='full')full();
  else if(a==='lbx')history.back();
  else if(a==='lbprev')lbStep(-1);
  else if(a==='lbnext')lbStep(1)}
/* the full page link is a normal link (Back returns here through the deep link) */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('#fp .fp-page');if(a&&S.f&&S.f.page){stopPlay(true)}},true);

/* one forward step: a new history entry, then that state */
function step(st,t){push(st);var o={s:st.s,p:st.p,st:st.st,d:st.d,t:t};show(o)}

/* ---------- API ---------- */
/* the Scope layer (the sky's film page → one layer deeper): the player alone, playing; one history step, so Back = the film page */
function scope(slug,t){var f=BY[slug];if(!f||!f.play)return false;if(!root)build();var st={s:slug,p:1,st:-1,d:1,solo:1};push(st);show({s:slug,p:1,st:-1,d:1,solo:1,t:t});return true}
function open(slug){var f=BY[slug];if(!f)return false;if(!root)build();var st={s:slug,p:0,st:-1,d:1};push(st);show(st);return true}
/* open and play at once (3d-sky's 'watch'): two history steps, so Back = the film's idle view, then where it was opened from */
function openPlay(slug){if(!open(slug))return false;var f=BY[slug];if(f.play)step({s:slug,p:1,st:-1,d:2});return true}
if(DEEP&&PAGEHOME){whenSky(function(){scope(DEEP.s)})}
else if(DEEP){whenSky(function(){var b={s:DEEP.s,p:0,st:-1,d:1};push(b);if(DEEP.p||DEEP.st>=0){var t={s:DEEP.s,p:DEEP.p,st:DEEP.st,d:2};push(t);show(b);show(t)}else show(b)})}
window.GJ_FP={has:function(slug){return !!BY[slug]},canPlay:function(slug){return !!(BY[slug]&&BY[slug].play)},scope:scope,open:open,play:openPlay,close:closeAll,
  state:function(){var c=SC&&SC.state();return{on:S.on,solo:S.solo,s:S.f&&S.f.s,p:S.p,st:S.st,d:S.d,hash:location.hash,type:c?'native':null,playing:c?!c.paused:false,t:c?c.ct:null,tl:c?c.t:null,dur:c?c.dur:null,ended:c?c.ended:null,src:c?c.src:null,scope:c,idle:IDLE?IDLE.currentSrc:null,label:root?$('.fp-play',root).textContent:''}},
  sc:function(){return SC},
  films:function(){return F.map(function(f){return{s:f.s,play:f.play&&f.play.type,n:f.play&&(f.play.n||(f.play.reel?'reel':'')),stills:f.stills.length,fallback:f.fallback,page:f.page}})}};
})();
