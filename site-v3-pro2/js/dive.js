/* gill james v3 · The Dive. One sheet: each chapter is a constellation that zooms in place.
   L0 glyph row → L1 star chart (labels) → L2 grid of frames joined by lines → L3 the work, full screen (Scope 2.39) → play.
   Gestures: one finger = native scroll, always (we never preventDefault a one-finger touch). Two fingers = level only.
   Tap = one level into that item. + / − and ●○○○ in the dock. Every level is a hash: #film/l1 #film/l2 #film/w27 #film/w27/play. */
(function(){
'use strict';
var D=document.documentElement,B=document.body,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)'),EASE='cubic-bezier(.2,.8,.2,1)';
var CH={};$$('.ch').forEach(function(el){CH[el.dataset.k]={el:el,k:el.dataset.k,max:+el.dataset.max,lv:0,head:$('.head',el),wrap:$('.sky-wrap',el),svg:$('.lines',el),items:$$('.it',el)}});
var ORDER=Object.keys(CH),imm=$('.imm'),frame=$('.frame',imm),amb=$('.amb',imm),zDots=$('.zoom .dots'),zName=$('.zoom .zn'),zBtn=$$('.zoom .zb'),tabs=$$('.tabs a');
var S={k:null,w:null,play:false}; /* the open chapter, the open work, playing? */
var busy=0;function SH(){return window.__sheet&&__sheet.isOpen()}var QUIET=false;
function anim(){return !RM.matches}
/* ---------- hash ⇄ state ---------- */
function parse(h){if(/^#(sky|all)(\/|$)/.test(h||''))return{k:null,sheet:1};var m=(h||'').match(/^#(\w+)(?:\/(l[0-3]|w\w+))?(?:\/(play))?$/);if(!m||!CH[m[1]])return{k:null};
  var c=CH[m[1]],r={k:m[1],lv:1,w:null,play:false};
  if(m[2]&&m[2][0]==='l')r.lv=Math.min(+m[2][1],c.max);
  else if(m[2]&&m[2][0]==='w'&&c.max>=3&&item(c,m[2])){r.lv=3;r.w=m[2];r.play=!!m[3]}
  return r}
function fmt(r){if(!r.k||r.lv===0&&!r.w)return location.pathname+location.search;return '#'+r.k+'/'+(r.lv===3?r.w+(r.play?'/play':''):'l'+r.lv)}
function item(c,key){for(var i=0;i<c.items.length;i++)if(c.items[i].dataset.k===key)return c.items[i];return null}
function push(r,replace){var u=fmt(r);if(u===location.pathname+location.search+location.hash)return;history[replace?'replaceState':'pushState']({gj:1},'',u)}
/* ---------- images: only what is near the screen gets a src ---------- */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var im=e.target;if(!im.getAttribute('src')&&im.dataset.src)im.src=im.dataset.src;io.unobserve(im)})},{rootMargin:'320px 0px'}):null;
function wantImgs(c){$$('.vis img',c.el).forEach(function(im){if(im.getAttribute('src'))return;if(io)io.observe(im);else im.src=im.dataset.src})}
/* ---------- the constellation geometry ---------- */
function glyphPts(c){/* v3.3 constellations */var r=[];$$('.head .glyph circle:not(.f)',c.el).forEach(function(ci){var b=ci.getBoundingClientRect();r.push({x:b.left+b.width/2,y:b.top+b.height/2})});return r}
function visR(it){return $('.vis',it).getBoundingClientRect()}
function onScreen(r,m){m=m||120;return r.bottom>-m&&r.top<innerHeight+m&&r.width>0}
function drawLines(c,draw){var svg=c.svg;if(c.lv<1){svg.innerHTML='';return}
  var w=c.wrap.getBoundingClientRect(),pts=c.items.map(function(it){var r=visR(it);return[(r.left+r.width/2-w.left).toFixed(1),(r.top+r.height/2-w.top).toFixed(1)]});
  svg.setAttribute('viewBox','0 0 '+w.width.toFixed(0)+' '+w.height.toFixed(0));
  /* L1: one chain down the chart. L2: the same chain, plus a few cross-links so it reads as a constellation, not a list */
  var d='M'+pts.map(function(p){return p.join(' ')}).join(' L');
  if(c.lv===2){for(var i=0;i+4<pts.length;i+=5)d+=' M'+pts[i].join(' ')+' L'+pts[i+4].join(' ')}
  svg.innerHTML='<path d="'+d+'"/>';
  if(draw&&anim()){var p=svg.firstChild,L=0;try{L=p.getTotalLength()}catch(e){}if(L){p.style.strokeDasharray=L;p.style.strokeDashoffset=L;
    p.animate([{strokeDashoffset:L},{strokeDashoffset:0}],{duration:Math.min(1400,500+L/6),easing:'ease-out',fill:'forwards'}).onfinish=function(){p.style.strokeDasharray='';p.style.strokeDashoffset=''}}}}
/* ---------- FLIP: stars travel and become labels, then frames ---------- */
function snapshot(c){var m=new Map();c.items.forEach(function(it){var r=visR(it);if(r.width)m.set(it,r)});return m}
function flip(c,before,from0){if(!anim())return;var G=from0?glyphPts(c):null,n=0;
  c.items.forEach(function(it,i){var v=$('.vis',it),a=from0?null:before.get(it),b=v.getBoundingClientRect();
    if(!onScreen(b,60))return;if(++n>48)return;
    if(from0){var g=G[i%G.length];a={left:g.x-3,top:g.y-3,width:6,height:6}}
    if(!a){v.animate([{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'none'}],{duration:420,easing:EASE,delay:Math.min(260,i*12)});return}
    var sx=a.width/b.width,sy=a.height/b.height,dx=a.left-b.left,dy=a.top-b.top;
    v.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+sx+','+sy+')',borderRadius:a.width<20?'50%':'3px'},{transform:'none',borderRadius:getComputedStyle(v).borderRadius}],
      {duration:560+Math.min(240,Math.abs(dy)/4),easing:EASE,delay:Math.min(160,i*6)})});
  c.el.classList.remove('fresh');void c.el.offsetWidth;c.el.classList.add('fresh')}
function flipTo0(c,done){if(!anim()||c.lv===0){done();return}var G=glyphPts(c),list=[];
  c.items.forEach(function(it,i){var v=$('.vis',it),b=v.getBoundingClientRect();if(!onScreen(b,0)||list.length>40)return;var g=G[i%G.length];
    list.push(v.animate([{transform:'none',opacity:1},{transform:'translate('+(g.x-3-b.left)+'px,'+(g.y-3-b.top)+'px) scale('+(6/b.width)+','+(6/b.height)+')',opacity:.6}],{duration:380,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'}))});
  c.svg.innerHTML='';$$('.cap,.sum,.links,.about-l1,.more',c.el).forEach(function(e){e.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards'})});
  setTimeout(function(){done();list.forEach(function(a){a.cancel()});$$('.cap,.sum,.links,.about-l1,.more',c.el).forEach(function(e){e.getAnimations().forEach(function(a){a.cancel()})})},list.length?390:200)}
/* ---------- set a chapter's level in place, keeping an anchor still on screen (the camera) ---------- */
function setLv(c,lv,o){o=o||{};lv=Math.max(0,Math.min(lv,Math.min(c.max,2)));if(lv===c.lv&&!o.force){after(c);return}
  var old=c.lv,anchor=o.anchor||c.head,top0=anchor.getBoundingClientRect().top,before=snapshot(c);
  if(lv===0){flipTo0(c,function(){apply(c,0);keep(anchor===c.head?c.head:c.head,top0);after(c)});return}
  if(lv>=2)wantImgs(c);
  apply(c,lv);keep(anchor,top0);flip(c,before,old===0);after(c,true)}
function apply(c,lv){c.lv=lv;var el=c.el;el.classList.remove('lv1','lv2');if(lv)el.classList.add('lv'+lv);c.head.setAttribute('aria-expanded',String(lv>0));
  var zi=$('.zin',el),zo=$('.zout',el);if(zi)zi.hidden=lv>=c.max;if(zo)zo.textContent=lv>1?'less −':'close −'}
function keep(anchor,top0){if(o_noKeep)return;var d=anchor.getBoundingClientRect().top-top0;if(Math.abs(d)>1)scrollBy(0,d)}
var o_noKeep=false;
function after(c,draw){drawLines(c,draw);pv();ui()}
/* only one constellation open at a time: the others fold back to their glyph (no animation when off screen) */
function only(k){ORDER.forEach(function(x){var c=CH[x];if(x!==k&&c.lv){var r=c.el.getBoundingClientRect();if(onScreen(r,0)&&anim()){setLv(c,0)}else{var a=CH[k]?CH[k].head:null,t=a?a.getBoundingClientRect().top:0;apply(c,0);c.svg.innerHTML='';if(a)keep(a,t)}}})}
/* ---------- one entry point: go to a state (from a tap, a pinch, +/−, a tab, Back) ---------- */
function go(r,o){o=o||{};if(o.noAnim&&anim()){var a0=anim;anim=function(){return false};try{go1(r,o)}finally{anim=a0}return}go1(r,o)}
function go1(r,o){
  if(!r.k){closeWork(true);ORDER.forEach(function(x){if(CH[x].lv)setLv(CH[x],0)});S.k=null;ui();if(o.push!==false)push(r,o.replace);return}
  var c=CH[r.k];only(r.k);S.k=r.k;
  if(r.lv===3){if(c.lv<2)setLv(c,2,{anchor:o.anchor});openWork(c,r.w,r.play,o)}
  else{if(S.w)closeWork(false,o.noAnim);var was=c.lv;setLv(c,r.lv,{anchor:o.anchor});
    /* the camera: when a constellation opens low on the screen, glide it up so what just appeared is in view */
    if(r.lv>was&&o.glide){var ht=c.head.getBoundingClientRect().top;if(ht>innerHeight*.34)scrollBy({top:ht-8,behavior:anim()?'smooth':'auto'})}}
  if(o.push!==false)push(r,o.replace);ui()}
function cur(){if(S.w)return{k:S.k,lv:3,w:S.w,play:S.play};var k=inView();return{k:k,lv:CH[k].lv}} /* QA: the chapter in view, never an off-screen open one */
function step(dir,anchor,k){if(SH()){__sheet.step(dir);return}var s=cur();if(k&&!S.w&&k!==s.k)s={k:k,lv:CH[k].lv};var c=CH[s.k];
  if(dir>0){if(s.lv===3){if(!S.play&&c.k==='film'&&playable(s.w))go({k:s.k,lv:3,w:s.w,play:true});return}
    if(s.lv>=c.max)return;
    if(s.lv===2){var it=anchor&&anchor.classList&&anchor.classList.contains('it')?anchor:centerItem(c);if(it)go({k:s.k,lv:3,w:it.dataset.k},{anchor:it});return}
    go({k:s.k,lv:s.lv+1},{anchor:anchor||centerItem(c)});
  }else{if(s.lv===3){if(S.play){go({k:s.k,lv:3,w:s.w,play:false});return}
      /* pull out of the work: through the frame into the massive grid of everything */
      if(window.__sheet){var kk=s.k,ww=s.w;closeWork(true,true);__sheet.open({mode:'all',k:kk,w:ww});return}go({k:s.k,lv:2},{anchor:item(c,s.w)});return}
    if(s.lv===0){if(window.__sheet)__sheet.open({k:s.k});return}go({k:s.k,lv:s.lv-1},{anchor:s.lv-1===0?c.head:anchor||centerItem(c)})}}
function centerItem(c){var best=null,bd=1e9,mid=innerHeight*.45;c.items.forEach(function(it){var r=visR(it);if(!r.width||!onScreen(r,0))return;var d=Math.abs(r.top+r.height/2-mid);if(d<bd){bd=d;best=it}});return best}
function inView(){var mid=innerHeight*.5,best=ORDER[0],bd=1e9;ORDER.forEach(function(k){var r=CH[k].el.getBoundingClientRect();var d=r.top<=mid&&r.bottom>=mid?0:Math.min(Math.abs(r.top-mid),Math.abs(r.bottom-mid));if(d<bd){bd=d;best=k}});return best}
/* ---------- dock: ●○○○ + name, +/−, the tab you are in ---------- */
var uiq=0,shownK=null;function ui(){if(uiq)return;uiq=requestAnimationFrame(uiNow)}function uiNow(){if(uiq){cancelAnimationFrame(uiq)}uiq=0;if(SH()){__sheet.ui();return}var s=cur(),c=CH[s.k],lv=s.lv;
  /* five dots: the whole sky (above every chapter), then L0..L3 */
  zDots.textContent=[0,1,2,3,4].map(function(i){return i<=lv+1?'●':'○'}).join('');
  shownK=s.k;zName.textContent=s.k+' · L'+lv+(S.play?' ▶':'');ORDER.forEach(function(k){CH[k].el.classList.toggle('inv',k===s.k&&!S.w)}); /* v3.2 QA L2 */
  zBtn[0].disabled=!window.__sheet&&lv===0;zBtn[1].disabled=lv>=c.max&&!(lv===3&&s.k==='film'&&!S.play&&playable(S.w));
  tabs.forEach(function(a){a.classList.toggle('here',a.dataset.t===s.k&&(D.scrollTop>0||scrollY>40||lv>0))})}
/* ---------- L3: the work. The frame zooms up from its tile; the Scope chrome fades in ---------- */
var openTile=null,vidEl=null;
function fill(c,it,play){var j=JSON.parse(it.dataset.j||'{}'),k=c.k,SC=!!window.__scope&&k==='film'; /* v3.2: film works live in the Scope player (js/scope.js) */
  if(window.__scope&&!SC)__scope.stop();if(!SC){frame.className='frame';frame.innerHTML=''}
  $('.imm-t').textContent=k+' · '+($('.cap b',it).textContent);
  $('.imm-m').textContent=$('.cap small',it).textContent;
  var pb=$('[data-a=play]',imm),ex=$('[data-a=ext]',imm),dl=$('.imm-c',imm);dl.hidden=!(k==='film'||k==='objects');
  var fr=$('.imm-f',imm);if(fr)fr.innerHTML=(k==='film'&&j.frames&&j.frames.length?j.frames:[]).map(function(f){return '<img src="'+f+'" alt="" width="160" height="67" decoding="async">'}).join('');
  pb.hidden=!(k==='film'||k==='sound')||(k==='film'&&!j.reel&&!j.native&&!j.embed); /* v3.2.2: no local file yet = no play action (never the Vimeo player) */
  ex.hidden=!(j.url)||/vimeo\.com/.test(j.url);if(j.url)ex.href=j.url; /* v3.2.2: no way out to Vimeo; films play natively in Scope */
  if(k==='film'){pb.textContent=play?'… loading':'▶ play film';imm.classList.toggle('playing',!!play);
    if(SC){vidEl=__scope.fill({it:it,j:j,play:play,frame:frame,label:playLabel,setVid:function(v){vidEl=v}});if(play)watchPlay();return}
    if(play){if(j.reel){vidEl=document.createElement('video');vidEl.src='../site-v3/media/reel/reel-v7-720.mp4';vidEl.playsInline=true;vidEl.setAttribute('playsinline','');vidEl.controls=true;vidEl.autoplay=true;vidEl.poster=it.dataset.big;vidEl.addEventListener('playing',function(){playLabel('❚❚ playing')});vidEl.addEventListener('pause',function(){playLabel('▶ play film')});frame.appendChild(vidEl);vidEl.play().catch(function(){playLabel('▶ play film')})}
      else if(j.embed){var f=document.createElement('iframe');if(/youtube/.test(j.embed)){var onm=function(e){if(/youtube/.test(e.origin)&&e.source===f.contentWindow){removeEventListener('message',onm);if(S.play)playLabel('▶ in the player')}};addEventListener('message',onm);f.addEventListener('load',function(){try{f.contentWindow.postMessage(JSON.stringify({event:'listening',id:'gj',channel:'widget'}),'*')}catch(e){}})} /* v3.5.1 O2: only once YouTube answers */f.src=j.embed;f.allow='autoplay; fullscreen; picture-in-picture';f.title=j.title;f.setAttribute('allowfullscreen','');frame.classList.add('ext');frame.appendChild(f);watchPlay()}}
    else{var pv=it.dataset.pv;if(pv&&anim()){vidEl=document.createElement('video');vidEl.muted=true;vidEl.loop=true;vidEl.playsInline=true;vidEl.setAttribute('playsinline','');vidEl.autoplay=true;vidEl.poster=it.dataset.big;vidEl.src=pv;frame.appendChild(vidEl);vidEl.play().catch(function(){})}
      else{var im=new Image();im.src=it.dataset.big;im.alt='';frame.appendChild(im)}}}
  else if(k==='sound'){pb.textContent=play?'player loaded':'▶ load player';
    if(play){var f2=document.createElement('iframe');f2.src=j.embed;f2.allow='autoplay; encrypted-media; fullscreen';f2.title=j.title;frame.classList.add(j.video?'ext':'emb');frame.appendChild(f2)}
    else{var im2=new Image();im2.src=it.dataset.big;im2.alt='';frame.appendChild(im2)}}
  else{frame.classList.add('pic');var im3=new Image();im3.src=it.dataset.big;im3.alt=j.alt||'';frame.appendChild(im3)}}
function openWork(c,key,play,o){var it=item(c,key);if(!it)return;var first=imm.hidden||closing; /* v3.2: a work opened while the last one is still shrinking away starts fresh */
  if(!first&&S.w===key&&S.play===play)return;
  if(!first&&S.w===key&&play!==S.play){fill(c,it,play);S.play=play;ui();return}
  $$('.it.cur').forEach(function(x){x.classList.remove('cur')});it.classList.add('cur');
  /* the tile must be on screen so the frame can grow out of it (and shrink back into it) */
  var r=visR(it);if(!onScreen(r,-40)){it.scrollIntoView({block:'center'});r=visR(it)}
  openTile=it;S.w=key;S.play=play;fill(c,it,play);amb.src=it.dataset.big;
  if(first){imm.hidden=false;D.classList.add('modal');back2=document.activeElement;
    if(anim()&&!o.noAnim){var b=frame.getBoundingClientRect(),sx=r.width/b.width,sy=r.height/b.height;
      frame.animate([{transform:'translate('+(r.left-b.left)+'px,'+(r.top-b.top)+'px) scale('+sx+','+sy+')'},{transform:'none'}],{duration:620,easing:EASE});
      camIn(r);
      requestAnimationFrame(function(){imm.classList.add('on');setTimeout(function(){imm.classList.add('in')},260)})}
    else{imm.classList.add('on','in')}
    setTimeout(function(){try{$('.x',imm).focus({preventScroll:true})}catch(e){}},50)}
  ui()}
var back2=null;
var closing=0;function closeWork(all,noAnim){fv(false);imm.classList.remove('playing');if(imm.hidden){S.w=null;S.play=false;return}var it=openTile;S.w=null;S.play=false;closing=1;
  function end(){closing=0;if(S.w)return; /* reopened meanwhile (Back/Forward, a deep link): leave the new work alone */imm.hidden=true;imm.classList.remove('on','in');if(window.__scope)__scope.stop();frame.innerHTML='';vidEl=null;D.classList.remove('modal');
    if(back2&&document.contains(back2)&&!all){try{(it?$('.tile',it):back2).focus({preventScroll:true})}catch(e){}}ui()}
  if(vidEl)try{vidEl.pause()}catch(e){}
  if(document.fullscreenElement)try{document.exitFullscreen()}catch(e){}
  if(!it||!anim()||noAnim){camDrop();end();return}
  var r=visR(it);if(!onScreen(r,-40)){it.scrollIntoView({block:'center'});r=visR(it)}
  var b=frame.getBoundingClientRect();imm.classList.remove('in','on');camOut();
  var a=frame.animate([{transform:'none'},{transform:'translate('+(r.left-b.left)+'px,'+(r.top-b.top)+'px) scale('+(r.width/b.width)+','+(r.height/b.height)+')'}],{duration:480,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  a.onfinish=function(){a.cancel();end()}}
/* the camera flies into the sheet: the whole column scales up around the tile while the frame grows (GPU transform + opacity) */
var mainEl=$('#main'),camA=null;
function camIn(r){var m=mainEl.getBoundingClientRect(),ox=r.left+r.width/2-m.left,oy=r.top+r.height/2-m.top;mainEl.style.transformOrigin=ox+'px '+oy+'px';
  var a=camA=mainEl.animate([{transform:'none',opacity:1},{transform:'scale(2.4)',opacity:0}],{duration:620,easing:EASE});
  /* once the frame has filled the screen the sheet just hides (no lingering scaled layer = no sideways overflow) */
  a.onfinish=function(){if(camA===a)mainEl.style.visibility='hidden'}}
function camOut(){if(!camA)return;camA=null;mainEl.style.visibility='';var a=mainEl.animate([{transform:'scale(2.4)',opacity:0},{transform:'none',opacity:1}],{duration:480,easing:'cubic-bezier(.4,0,.2,1)'});a.onfinish=function(){mainEl.style.transformOrigin=''}}
function camDrop(){if(camA){camA.cancel();camA=null}mainEl.style.visibility=''}
function neighbour(dir){var c=CH[S.k],i=c.items.indexOf(item(c,S.w)),n=c.items[(i+dir+c.items.length)%c.items.length];
  $$('.it.cur').forEach(function(x){x.classList.remove('cur')});n.classList.add('cur');openTile=n;S.w=n.dataset.k;S.play=false;
  if(anim())frame.animate([{opacity:0,transform:'translateX('+(dir*30)+'px)'},{opacity:1,transform:'none'}],{duration:320,easing:EASE});
  fill(c,n,false);push({k:S.k,lv:3,w:S.w},true);ui()}
imm.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a;
  if(a==='out'){e.preventDefault();var wasFs=unfullAll();if(S.w)go({k:S.k,lv:2},{anchor:item(CH[S.k],S.w),noAnim:wasFs})} /* ✕ always lands on the chapter grid. v3.4: in full screen too, in ONE tap (it used to only leave full screen first) */
  else if(a==='play'){e.preventDefault();if(!S.play)go({k:S.k,lv:3,w:S.w,play:true});else if(window.__scope&&__scope.owns())__scope.toggle();else if(window.__scope&&__scope.retry&&__scope.retry()){}else if(vidEl&&S.play){vidEl.paused?vidEl.play():vidEl.pause()}else{var ifr=$('iframe',frame);if(ifr&&/vimeo/.test(ifr.src))vimeo(ifr,/playing/.test(b.textContent)?'pause':'play')}}
  else if(a==='prev'||a==='next'){e.preventDefault();neighbour(a==='next'?1:-1)}
  else if(a==='full'){e.preventDefault();full()}});
/* full screen: a playing <video> uses the native player (iPhone: webkitEnterFullscreen). An embed (Vimeo/YouTube) uses element
   full screen where the browser has it; iPhone Safari has none for a div, so there we ask Vimeo's own player (postMessage API)
   and also switch the work view to a CSS full-viewport mode (frame fills the screen, ✕ exits). */
function fsOK(){return !!(document.fullscreenEnabled||document.webkitFullscreenEnabled)}
function playable(w){var it=w&&item(CH.film,w);return !it||!window.__scope||__scope.playable(it)} /* v3.2.2 */
function full(){var ifr=$('iframe',frame);if(window.__scope&&__scope.owns()){__scope.toggleFull();return} /* v3.2.2: Scope morphs cut <-> full itself, the video never moves */
  if(imm.classList.contains('fv')){fv(false);return}
  /* v3.2 QA L1: element full screen is the whole work view in the .fv layout, so ✕ and ⤡ stay on screen (Android had no on-page exit) */
  if(fsOK()&&(imm.requestFullscreen||imm.webkitRequestFullscreen)){var q=imm.requestFullscreen?imm.requestFullscreen():imm.webkitRequestFullscreen();fsImm=1;fv(true);q&&q.then&&q.then(function(){try{screen.orientation.lock('landscape').catch(function(){})}catch(e){}},function(){fsImm=0});return}
  if(vidEl&&S.play&&vidEl.webkitEnterFullscreen){try{vidEl.webkitEnterFullscreen()}catch(e){}return}
  if(ifr&&/vimeo/.test(ifr.src))vimeo(ifr,'requestFullscreen');
  fv(true)}
var fsImm=0,fsOffT=0;function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
['fullscreenchange','webkitfullscreenchange'].forEach(function(n){document.addEventListener(n,function(){if(!fsEl()&&fsImm){fsImm=0;fsOffT=Date.now();fv(false)}})}); /* system Back / Esc left full screen */
/* v3.4: leave every kind of full screen at once (Scope's element full screen + .fv, the embed's element full screen, the iPhone CSS one).
   Returns whether anything was full, so the close that follows can skip its zoom-out (no animation against a resizing screen) */
function unfullAll(){var was=!!fsEl()||imm.classList.contains('fv');if(window.__scope&&__scope.unfull)__scope.unfull();if(imm.classList.contains('fv')||fsImm)fv(false);
  if(fsEl())try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}return was}
function fv(on){imm.classList.toggle('fv',on);if(!on&&fsImm&&fsEl()){fsImm=0;try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}var b=$('[data-a=full]',imm);if(b){b.setAttribute('aria-label',on?'exit full screen':'full screen');b.textContent=on?'⤡':'⤢'}}
function vimeo(ifr,method,value){try{ifr.contentWindow.postMessage(JSON.stringify(value===undefined?{method:method}:{method:method,value:value}),'https://player.vimeo.com')}catch(e){}}
var watchT=0;function watchPlay(){clearTimeout(watchT);var f=$('iframe',frame);if(!f||!S.play)return; /* v3.2 QA M1: no play event within ~3 s -> hand over to the player */
  watchT=setTimeout(function(){var pb=$('[data-a=play]',imm);if(S.play&&$('iframe',frame)===f&&pb&&/loading/.test(pb.textContent))playLabel('▶ tap the player')},3000)}
function playLabel(t){var pb=$('[data-a=play]',imm);if(pb&&S.k==='film')pb.textContent=t}
addEventListener('message',function(e){if(!/player\.vimeo\.com$/.test((e.origin||'').replace(/^https?:\/\//,'')))return;var d=e.data;try{if(typeof d==='string')d=JSON.parse(d)}catch(x){return}if(!d||!S.play)return;
  var ifr=$('iframe',frame);if(!ifr)return;
  if(d.event==='ready'){['play','pause','ended'].forEach(function(ev){vimeo(ifr,'addEventListener',ev)});vimeo(ifr,'play')}
  else if(d.event==='error')playLabel('▶ tap the player'); /* v3.2 QA M1: Vimeo could not start (e.g. iOS blocks autoplay with sound) */
  else if(d.event==='play'||d.event==='playing')playLabel('❚❚ playing');else if(d.event==='pause'||d.event==='ended')playLabel('▶ play film')});
/* ---------- taps ---------- */
document.addEventListener('click',function(e){if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;var t=e.target;
  var h=t.closest('.ch .head');if(h){e.preventDefault();var c=CH[h.parentNode.dataset.k];go({k:c.k,lv:c.lv?0:1},{anchor:c.head,glide:1});return}
  var tile=t.closest('.ch .tile');if(tile){var it=tile.parentNode,c2=CH[it.closest('.ch').dataset.k];
    if(c2.k==='about'){return} /* about stars are real links (mail, joio, bio) */
    e.preventDefault();if(c2.lv===1)go({k:c2.k,lv:2},{anchor:it});else go({k:c2.k,lv:3,w:it.dataset.k},{anchor:it});return}
  var m=t.closest('.more button');if(m){e.preventDefault();var c3=CH[m.closest('.ch').dataset.k];S.k=c3.k;
    if(m.classList.contains('zin'))go({k:c3.k,lv:c3.lv+1},{anchor:centerItem(c3)});else go({k:c3.k,lv:c3.lv-1},{anchor:c3.lv-1===0?c3.head:centerItem(c3)});return}
  var z=t.closest('.zoom .zb');if(z){e.preventDefault();step(+z.dataset.z);return}
  var tb=t.closest('.tabs a');if(tb){e.preventDefault();var k=tb.dataset.t,c4=CH[k];if(SH())__sheet.close({quick:1});closeWork(true,true);
    go({k:k,lv:Math.min(2,c4.max)},{anchor:c4.head});c4.el.scrollIntoView({behavior:anim()?'smooth':'auto',block:'start'});return}
  var g=t.closest('[data-goto]');if(g){e.preventDefault();var c5=CH[g.dataset.goto];go({k:c5.k,lv:1},{anchor:c5.head});c5.el.scrollIntoView({behavior:anim()?'smooth':'auto',block:'start'});return}
  var hm=t.closest('a.home');if(hm){if(SH())__sheet.close({quick:1});e.preventDefault();go({k:null});scrollTo({top:0,behavior:anim()?'smooth':'auto'});return}});
addEventListener('keydown',function(e){if(e.key==='Escape'&&(fsEl()||Date.now()-fsOffT<500))return; /* Esc only leaves full screen */if(e.key==='Escape'&&S.w){go({k:S.k,lv:2},{anchor:item(CH[S.k],S.w)})}
  if(e.key==='Tab'&&S.w){var f=$$('button:not([hidden]),a[href]:not([hidden]),iframe,video',imm).filter(function(x){return x.getClientRects().length});if(!f.length)return;
    var a=f[0],z=f[f.length-1];if(!imm.contains(document.activeElement)){e.preventDefault();a.focus()}else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  if((e.key==='+'||e.key==='=')&&!e.target.closest('input'))step(1);if(e.key==='-'&&!e.target.closest('input'))step(-1)});
/* ---------- two-finger pinch = level. One finger is never touched. ---------- */
var P=null,lastStep=0,TH_IN=1.22,TH_OUT=.8;
function dist(t){var dx=t[0].clientX-t[1].clientX,dy=t[0].clientY-t[1].clientY;return Math.sqrt(dx*dx+dy*dy)}
function mid(t){return{x:(t[0].clientX+t[1].clientX)/2,y:(t[0].clientY+t[1].clientY)/2}}
function pinchTarget(m){var el=document.elementFromPoint(m.x,m.y),c=el&&el.closest&&el.closest('.ch');if(S.w)return{k:S.k,it:null};
  if(el&&el.closest&&el.closest('.sky'))return{k:cur().k,it:null,portal:1};
  if(c){S.k=c.dataset.k;return{k:c.dataset.k,it:el.closest('.it')}}return{k:cur().k,it:null}}
function live(sc){if(P&&P.portal)return;var tgt=S.w?frame:P&&P.k?CH[P.k].el.querySelector(CH[P.k].lv?'.sky-wrap':'.head'):null;if(!tgt)return;
  if(sc===1){tgt.style.transform='';tgt.style.transition='transform .25s';return}
  tgt.style.transition='none';tgt.style.transformOrigin=P.ox+'px '+P.oy+'px';tgt.style.transform='scale('+sc.toFixed(3)+')'}
function pstart(t){var m=mid(t),pt=pinchTarget(m);P={d0:dist(t),k:pt.k,it:pt.it,steps:0,portal:pt.portal};
  var tg=S.w?frame:CH[P.k].el.querySelector(CH[P.k].lv?'.sky-wrap':'.head'),r=tg.getBoundingClientRect();P.ox=m.x-r.left;P.oy=m.y-r.top;D.classList.add('pinching')}
/* the blocking touchmove listener only exists while two fingers are down, so one-finger scrolling stays on the compositor */
document.addEventListener('touchstart',function(e){if(e.touches.length===2&&!e.target.closest('.sheet')&&!SH()){pstart(e.touches);document.addEventListener('touchmove',tmove,{passive:false})}else if(e.touches.length>2)P=null},{passive:true});
function tmove(e){if(!P||e.touches.length!==2)return;
  if(e.cancelable)e.preventDefault(); /* only ever for two fingers: stops the browser zooming the page while we change level */
  var r=dist(e.touches)/P.d0,now=Date.now();if(!P.done)live(Math.max(.86,Math.min(1.14,Math.pow(r,.35))));
  if(P.done)return; /* one pinch = one level: the view snaps, then waits for the next pinch */
  if(S.w){if(r>TH_IN||r<TH_OUT){P.done=1;P.defer=r>TH_IN?1:-1;lastStep=now;live(1)}return} /* in the work view: act on touchend, so the frame is not replaced under the fingers */
  if(P.portal&&(r>TH_IN||r<TH_OUT)&&window.__sheet){P.done=1;live(1);var po=$('.portal');__sheet.open(po?{rect:po.getBoundingClientRect()}:{});return}
  if(r>TH_IN){P.done=1;lastStep=now;live(1);step(1,P.it,P.k)}
  else if(r<TH_OUT){P.done=1;lastStep=now;live(1);step(-1,null,P.k)}}
function pend(){document.removeEventListener('touchmove',tmove,{passive:false});if(!P)return;live(1);var df=P.defer,pk=P.k;P=null;if(df)setTimeout(function(){step(df,null,pk)},0);setTimeout(function(){D.classList.remove('pinching')},60)}
document.addEventListener('touchend',function(e){if(e.touches.length<2)pend()},{passive:true});
document.addEventListener('touchcancel',pend,{passive:true});
/* iOS Safari: its own gesture events. Block page zoom on the sheet (the list page keeps browser zoom). */
['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){if(!e.target.closest||!e.target.closest('.fly'))e.preventDefault()},{passive:false})});
/* trackpad pinch (ctrl+wheel) and Safari desktop gestures */
var wAcc=0,wT=0;addEventListener('wheel',function(e){if(!e.ctrlKey||(e.target.closest&&e.target.closest('.sheet')))return;e.preventDefault();wAcc+=e.deltaY;clearTimeout(wT);wT=setTimeout(function(){wAcc=0},250);
  if(Date.now()-lastStep<380)return;if(wAcc<-40){lastStep=Date.now();wAcc=0;var m={x:e.clientX,y:e.clientY},pt=pinchTarget(m);step(1,pt.it,pt.k)}else if(wAcc>40){lastStep=Date.now();wAcc=0;var pt2=pinchTarget({x:e.clientX,y:e.clientY});step(-1,null,pt2.k)}},{passive:false});
/* ---------- previews: muted loops only for frames on screen at L2 (max 6), stills everywhere else ---------- */
var pvq=0,PVMAX=6,save=(navigator.connection||{}).saveData;
function pv(){if(pvq)return;pvq=requestAnimationFrame(function(){pvq=0;var live=[];
  ORDER.forEach(function(k){var c=CH[k];c.items.forEach(function(it){if(!it.dataset.sc)return;var v=$('.vis',it),vd=$('video',v);if(scrolling&&vd&&c.lv===2&&!S.w&&!QUIET)return;
    var ok=c.lv===2&&!S.w&&!QUIET&&anim()&&!save&&!scrolling, /* v3.1: tiny clips that play once (a different moment from the work view), never loop */r=ok?v.getBoundingClientRect():null;
    if(ok&&r.top>-r.height*.2&&r.bottom<innerHeight-60&&live.length<PVMAX){live.push(it);
      if(!vd&&!it._done){it._done=1;vd=document.createElement('video');vd.muted=true;vd.playsInline=true;vd.setAttribute('playsinline','');vd.setAttribute('aria-hidden','true');vd.preload='auto';vd.src=it.dataset.sc;v.appendChild(vd);vd.play().catch(function(){})}}
    else{if(vd){vd.pause();vd.removeAttribute('src');vd.load();vd.remove()}it._done=0}})})})}
/* ---------- scroll: the water deepens, the poem melts, the sky comes up. Passive, never blocks scroll. ---------- */
var poemL=$$('.poem span'),P0=[],sky=$('#sky'),sq=0,scrolling=false,scT=0;
function measure(){var y=scrollY;P0=poemL.map(function(s){return s.getBoundingClientRect().top+y})}
function onScroll(){if(!S.w&&!SH()&&inView()!==shownK)uiNow(); /* v3.4 (QA N-5): the bar names the new chapter in the same scroll event, not a frame or two later (5 rect reads, only rewrites on a change) */
  scrolling=true;clearTimeout(scT);scT=setTimeout(function(){scrolling=false;pv();uiNow()},180);if(sq)return;sq=requestAnimationFrame(function(){sq=0;var y=scrollY,vh=innerHeight;
  var intro=$('.intro').getBoundingClientRect();D.style.setProperty('--depth',Math.max(0,Math.min(1,(y/(intro.height+80)))).toFixed(3));
  var sr=sky.getBoundingClientRect();D.style.setProperty('--night',Math.max(0,Math.min(1,1-(sr.top/vh-.15)/.6)).toFixed(3));
  poemL.forEach(function(s,i){var top=P0[i]-y,T=Math.min(vh*.16,P0[i]-6),o=Math.max(0,Math.min(1,(top-T+vh*.14)/(vh*.14)));if(top>=T)o=1;
    s.style.opacity=o<1?o.toFixed(2):'';s.style.filter=o<1&&anim()?'blur('+((1-o)*5).toFixed(1)+'px)':''});
  if(window.__water&&__water.active)__water.active(+getComputedStyle(D).getPropertyValue('--night')<.9);
  uiNow()})}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',function(){measure();ORDER.forEach(function(k){if(CH[k].lv)drawLines(CH[k])});onScroll()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();ORDER.forEach(function(k){if(CH[k].lv)drawLines(CH[k])})});
/* ---------- Back / Forward and deep links: every level is a hash ---------- */
addEventListener('popstate',function(){if(location.hash==='#reel')return; /* pro2: the Demo Reel card owns #reel */var pk=S.k,pw=S.w,pp=S.play,land=innerWidth>innerHeight&&innerHeight<=500,wasFs=unfullAll(),r=parse(location.hash);
  /* v3.5: Back from a film playing full screen (a landscape phone always plays full) lands on the chapter grid, like ✕ (it used to stop on the still) */
  if(pp&&pw&&(wasFs||land)&&!r.sheet&&r.k===pk&&r.lv===3&&r.w===pw&&!r.play){go({k:pk,lv:2},{replace:true,anchor:item(CH[pk],pw),noAnim:true});return} /* v3.4: Back in full screen = out of full screen + the film closes, together (no stills left in full screen) */
  if(wasFs&&!r.sheet){go(r,{push:false,anchor:r.k?CH[r.k].head:null,noAnim:true});return}if(r.sheet){if(S.w)closeWork(true,true);return} /* v3.2: never leave a work open under/over the sheet */go(r,{push:false,anchor:r.k?CH[r.k].head:null})});
function boot(){measure();var r=parse(location.hash);if(r.sheet){onScroll();ui();return}if(r.k){var a=anim;anim=function(){return false};go(r,{push:false,replace:true,noAnim:true});
    if(r.lv<3)CH[r.k].el.scrollIntoView({block:'start'});anim=a}
  else if(location.hash&&location.hash!=='#'&&location.hash!=='#reel')history.replaceState(null,'',location.pathname+location.search);
  onScroll();ui()}
boot();
window.__dive={quiet:function(q){QUIET=q;pv();ui()},sync:function(){push(cur().lv?cur():{k:null});ui()},go:go,step:step,state:function(){return{k:S.k,w:S.w,play:S.play,lv:S.k?(S.w?3:CH[S.k].lv):0,levels:ORDER.map(function(k){return CH[k].lv})}},parse:parse};
})();
