/* site-v3-pro3 · work.js — the work page (a film, a photograph, an object, a player embed) as a LAYER of the one sky.
   It opens out of its star like an iris and closes back into it; js/world.js owns every level change and the history.
   The page itself is v3-pro's: Scope player (js/scope.js), credits + frame grid + prev/next (js/pro.js), the joio feed (js/joio.js).
   window.__dive is kept as a thin, compatible face for scope.js / pro.js (state(), go(), title()). */
(function(){
'use strict';
var D=document.documentElement,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)');function anim(){return !RM.matches}
var imm=$('.imm'),frame=$('.frame',imm),amb=$('.amb',imm),EASE='cubic-bezier(.2,.8,.2,1)';
var S={k:null,w:null,play:false,it:null},vidEl=null,on=false;
function pro(){if(window.__pro&&__pro.ensure)setTimeout(__pro.ensure,0)}
function W(){return window.__world}
function fill(it,play){var j=it.j||{},k=it.k,SC=!!window.__scope&&k==='film';
  if(window.__scope&&!SC)__scope.stop();if(!SC){frame.className='frame';frame.innerHTML=''}
  $('.imm-t').textContent=k+' · '+it.lab;$('.imm-m').textContent=it.meta;
  var pb=$('[data-a=play]',imm),ex=$('[data-a=ext]',imm),dl=$('.imm-c',imm);dl.hidden=!(k==='film'||k==='objects');
  var fr=$('.imm-f',imm);if(fr)fr.innerHTML=(k==='film'&&j.frames&&j.frames.length?j.frames:[]).map(function(f){return '<img src="'+f+'" alt="" width="160" height="67" decoding="async">'}).join('');
  pb.hidden=!(k==='film'||k==='sound')||(k==='film'&&!j.reel&&!j.native&&!j.embed);
  ex.hidden=!(j.url)||/vimeo\.com/.test(j.url);if(j.url)ex.href=j.url;
  var nav=$$('[data-a=prev],[data-a=next]',imm);nav.forEach(function(b){b.hidden=k==='sound'});
  if(k==='film'){pb.textContent=play?'… loading':'▶ play film';imm.classList.toggle('playing',!!play);
    if(SC){vidEl=__scope.fill({it:it.el,j:j,play:play,frame:frame,label:playLabel,setVid:function(v){vidEl=v}});if(play)watchPlay();return}
    if(play&&j.embed){var f=document.createElement('iframe');f.src=j.embed;f.allow='autoplay; fullscreen; picture-in-picture';f.title=j.title||it.lab;f.setAttribute('allowfullscreen','');frame.classList.add('ext');frame.appendChild(f);watchPlay()}
    else{var im=new Image();im.src=it.big;im.alt='';frame.appendChild(im)}}
  else if(k==='sound'){pb.textContent=play?'player loaded':'▶ load player';
    if(play){var f2=document.createElement('iframe');f2.src=j.embed;f2.allow='autoplay; encrypted-media; fullscreen';f2.title=j.title||it.lab;frame.classList.add(j.video?'ext':'emb');frame.appendChild(f2)}
    else{var im2=new Image();im2.src=it.big;im2.alt='';frame.appendChild(im2)}}
  else{frame.classList.add('pic');var im3=new Image();im3.src=it.big;im3.alt=j.alt||it.lab;frame.appendChild(im3)}}
var back2=null;
function open(it,o){o=o||{};var first=!on;S.k=it.k;S.w=it.w;S.it=it;S.play=!!o.play;on=true;
  $$('#data .it.cur').forEach(function(x){x.classList.remove('cur')});it.el.classList.add('cur');
  fill(it,S.play);amb.src=it.big||'';
  imm.hidden=false;imm.style.visibility='';D.classList.add('modal');if(first)back2=document.activeElement;imm.scrollTop=0;
  imm.classList.add('on','in');
  if(o.fade&&anim()&&imm.animate){imm.animate([{opacity:0},{opacity:1}],{duration:260,easing:'ease-out'})}
  else window.__iris(imm,o,true);
  pro();
  setTimeout(function(){var f=$('[data-a=play]:not([hidden])',imm)||$('.ib:not([hidden])',imm);try{f&&f.focus({preventScroll:true})}catch(e){}},80)}
function close(o){o=o||{};if(!on)return;on=false;unfullAll();imm.classList.remove('playing');if(vidEl)try{vidEl.pause()}catch(e){}
  var my=S.it;S.w=null;S.play=false;S.it=null;
  function end(){if(on)return;imm.hidden=true;imm.classList.remove('on','in');if(window.__scope)__scope.stop();frame.innerHTML='';vidEl=null;D.classList.remove('modal');imm.style.visibility=''}
  pro();window.__iris(imm,o,false,end)}
function swap(it,dir){S.k=it.k;S.w=it.w;S.it=it;S.play=false;$$('#data .it.cur').forEach(function(x){x.classList.remove('cur')});it.el.classList.add('cur');
  if(anim())frame.animate([{opacity:0,transform:'translateX('+(dir*30)+'px)'},{opacity:1,transform:'none'}],{duration:320,easing:EASE});
  fill(it,false);amb.src=it.big||'';imm.scrollTop=0;pro()}
function play(){if(!S.it)return;S.play=true;fill(S.it,true)}
imm.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a;
  if(a==='out'){e.preventDefault();if(W())W().out()}
  else if(a==='play'){e.preventDefault();if(!S.play)play();else if(window.__scope&&__scope.owns())__scope.toggle();else if(window.__scope&&__scope.retry&&__scope.retry()){}else if(vidEl&&S.play){vidEl.paused?vidEl.play():vidEl.pause()}else{var ifr=$('iframe',frame);if(ifr&&/vimeo/.test(ifr.src))vimeo(ifr,/playing/.test(b.textContent)?'pause':'play')}}
  else if(a==='prev'||a==='next'){e.preventDefault();var d=a==='next'?1:-1,n=W()&&W().neighbour(d);if(n)swap(n,d)}
  else if(a==='full'){e.preventDefault();full()}});
/* full screen (v3.4 behaviour kept): Scope morphs itself; an embed uses element full screen, iPhone a CSS full-viewport mode */
function fsOK(){return !!(document.fullscreenEnabled||document.webkitFullscreenEnabled)}
function full(){var ifr=$('iframe',frame);if(window.__scope&&__scope.owns()){__scope.toggleFull();return}
  if(imm.classList.contains('fv')){fv(false);return}
  if(fsOK()&&(imm.requestFullscreen||imm.webkitRequestFullscreen)){var q=imm.requestFullscreen?imm.requestFullscreen():imm.webkitRequestFullscreen();fsImm=1;fv(true);q&&q.then&&q.then(function(){try{screen.orientation.lock('landscape').catch(function(){})}catch(e){}},function(){fsImm=0});return}
  if(vidEl&&S.play&&vidEl.webkitEnterFullscreen){try{vidEl.webkitEnterFullscreen()}catch(e){}return}
  if(ifr&&/vimeo/.test(ifr.src))vimeo(ifr,'requestFullscreen');fv(true)}
var fsImm=0,fsOffT=0;function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
['fullscreenchange','webkitfullscreenchange'].forEach(function(n){document.addEventListener(n,function(){if(!fsEl()){fsOffT=Date.now();if(fsImm){fsImm=0;fv(false)}}})});
function unfullAll(){var was=!!fsEl()||imm.classList.contains('fv');if(window.__scope&&__scope.unfull)__scope.unfull();if(imm.classList.contains('fv')||fsImm)fv(false);
  if(fsEl())try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}return was}
function fv(v){imm.classList.toggle('fv',v);if(!v&&fsImm&&fsEl()){fsImm=0;try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(e){}}var b=$('[data-a=full]',imm);if(b){b.setAttribute('aria-label',v?'exit full screen':'full screen');b.textContent=v?'⤡':'⤢'}}
function vimeo(ifr,method,value){try{ifr.contentWindow.postMessage(JSON.stringify(value===undefined?{method:method}:{method:method,value:value}),'https://player.vimeo.com')}catch(e){}}
var watchT=0;function watchPlay(){clearTimeout(watchT);var f=$('iframe',frame);if(!f||!S.play)return;watchT=setTimeout(function(){var pb=$('[data-a=play]',imm);if(S.play&&$('iframe',frame)===f&&pb&&/loading/.test(pb.textContent))playLabel('▶ tap the player')},3000)}
function playLabel(t){var pb=$('[data-a=play]',imm);if(pb&&S.k==='film')pb.textContent=t}
addEventListener('message',function(e){if(!/player\.vimeo\.com$/.test((e.origin||'').replace(/^https?:\/\//,'')))return;var d=e.data;try{if(typeof d==='string')d=JSON.parse(d)}catch(x){return}if(!d||!S.play)return;
  var ifr=$('iframe',frame);if(!ifr)return;if(d.event==='ready'){['play','pause','ended'].forEach(function(ev){vimeo(ifr,'addEventListener',ev)});vimeo(ifr,'play')}
  else if(d.event==='error')playLabel('▶ tap the player');else if(d.event==='play'||d.event==='playing')playLabel('❚❚ playing');else if(d.event==='pause'||d.event==='ended')playLabel('▶ play film')});
/* focus stays inside the open page */
addEventListener('keydown',function(e){if(e.key!=='Tab'||!on)return;var f=$$('.wn button:not([hidden]),.wn-b:not([hidden])').concat($$('button:not([hidden]),a[href]:not([hidden]),iframe,video,[tabindex="0"]',imm)).filter(function(x){return x.getClientRects().length&&!x.closest('[hidden]')});if(!f.length)return;
  var a=f[0],z=f[f.length-1];if(f.indexOf(document.activeElement)<0){e.preventDefault();a.focus()}else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
window.__work={open:open,close:close,swap:swap,play:play,isOn:function(){return on},unfull:function(){return unfullAll()},fsGuard:function(){return !!fsEl()||Date.now()-fsOffT<500||imm.classList.contains('fv')}};
window.__dive={state:function(){return{k:S.k,w:S.w,play:S.play,lv:on?3:(W()?W().state().lv:0)}},
  go:function(r){if(!W())return;if(r&&r.k&&r.w){var cur=W().state();if(cur.lv===3&&cur.k===r.k&&cur.w===r.w){if(r.play&&!S.play)play();return}
      if(cur.lv===3&&cur.k==='film'&&r.k==='film'){var it=W().item('film',r.w);if(it){if(cur.w==='reel'){W().viewFilm(r.w)}else{var n=W().lateralTo('film',r.w);if(n){swap(n,1);if(r.play)play()}}}return}
      W().inTo({lv:3,k:r.k,w:r.w,play:r.play})}},
  title:function(k,w){var it=W()&&W().item(k,w);return it?it.lab:''},back:function(){return W()&&W().out()},cur:function(){return __dive.state()},quiet:function(){},sync:function(){},step:function(){}};
})();
