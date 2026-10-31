/* site-v3-pro2 · sound: picture for each song + the sync line. Each song has 5-6 of Gill's own shots (muted clips from the Demo Reel
   footage, chosen for the song's feel). While a song is chosen they drift slowly behind the constellation (screen-blended, faint);
   once you dive in and it plays they come up a little and cross-fade every ~7 s, played at 0.6x. Paused song = paused picture. */
(function(){
'use strict';
var R=window.GJ_REEL||[],sk=document.getElementById('sk');if(!R.length||!sk||!window.__sk)return;
var PICS={togo:[161,152,52,165,58],gone:[149,134,179,190,187],noproblem:[93,123,141,175,82],lostintime:[48,169,174,163,194,115],equals:[131,133,195,199,4],ii:[50,49,94,3,151]}; /* indices into GJ_REEL (201-shot reel, r2) */
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var L=document.createElement('div');L.className='syn';L.setAttribute('aria-hidden','true');
L.innerHTML='<div class="syn-s"><img alt=""><video muted loop playsinline preload="none" disablepictureinpicture></video></div><div class="syn-s"><img alt=""><video muted loop playsinline preload="none" disablepictureinpicture></video></div>';
sk.insertBefore(L,sk.querySelector('.hud'));
var A=[];var S=[].slice.call(L.children),cur=0,tk=null,ix=0,T=0,lastSwap=0,mode='';
S.forEach(function(s){var v=s.querySelector('video');v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
  v.addEventListener('playing',function(){s.classList.add('live')});v.addEventListener('loadedmetadata',function(){try{v.playbackRate=.6}catch(e){}})});
function src(i){return '../reel/'+R[i].f}
function show(k,i){var list=PICS[k];if(!list)return;var n=list[i%list.length],nx=(cur+1)%2,s=S[nx],im=s.firstChild,v=im.nextSibling;
  s.classList.remove('live','on','kb');im.src=src(n)+'.webp';
  if(!RM&&playing()){v.src=src(n)+'.mp4';v.load();var p=v.play();if(p&&p.catch)p.catch(function(){})}else{v.removeAttribute('src');try{v.load()}catch(e){}}
  void s.offsetWidth;s.classList.add('on');if(!RM)s.classList.add('kb');
  var o=S[cur];o.classList.remove('on');setTimeout(function(){if(!o.classList.contains('on')){var ov=o.firstChild.nextSibling;ov.pause();ov.removeAttribute('src');try{ov.load()}catch(e){}}},2200);
  cur=nx;lastSwap=performance.now()}
function playing(){try{return !__sk.paused()&&(sk.dataset.mode==='in'||sk.dataset.mode==='diving')}catch(e){return false}}
function tick(){var k;try{k=__sk.sel().k}catch(e){return}var m=sk.dataset.mode,pl=playing();
  L.dataset.m=m;L.classList.toggle('play',pl);
  if(k!==tk){tk=k;ix=0;show(k,0);syncLine(k)}
  else if(pl&&performance.now()-lastSwap>7000){ix++;show(k,ix)}
  var v=S[cur].firstChild.nextSibling;
  if(pl&&!RM){if(!v.getAttribute('src')){var n=PICS[tk][ix%PICS[tk].length];v.src=src(n)+'.mp4';v.load()}if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}}
  else if(!v.paused)v.pause()}

/* the sync line: understated, under the picks and in the player */
function mail(k){var t=(window.TRACKS||{})[k]||{};return 'mailto:imjamesgill@gmail.com?subject='+encodeURIComponent('Sync / licensing: '+(t.title||'')+(t.artist?' ('+t.artist+')':''))}
[['#intro','syn-l'],['#player','syn-l syn-lp']].forEach(function(x){var host=document.querySelector(x[0]);if(!host)return;var p=document.createElement('p');p.className=x[1];
  p.innerHTML='available for sync / licensing · <a href="mailto:imjamesgill@gmail.com">imjamesgill@gmail.com</a>';host.appendChild(p);A.push(p.querySelector('a'))});
function syncLine(k){A.forEach(function(a){a.href=mail(k)})}
setInterval(tick,250);tick();
window.__syn={state:function(){var s=S[cur],v=s.firstChild.nextSibling;return{tk:tk,ix:ix,pic:s.firstChild.getAttribute('src'),clip:v.getAttribute('src'),playing:!v.paused,live:s.classList.contains('live'),op:getComputedStyle(L).opacity}}};
})();
