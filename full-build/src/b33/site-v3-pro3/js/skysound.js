/* site-v3-pro3 · the player, inside the sky. It opens out of the waveform star (js/world.js) as an iris — no separate page, no frame,
   no nav of its own. The sound chapter's constellation is the waveform; each song is one of its stars. Plain <audio> (works on iOS,
   Android and desktop the same way; play() is only ever called from your own tap). No sync imagery: one quiet licensing line. */
(function(){
'use strict';
var T=window.TRACKS||{},KEYS=['togo','noproblem','lostintime','gone','equals','ii'].filter(function(k){return T[k]});if(!KEYS.length)return;
var SHS=[[0.058,0.493,0.35],[0.143,0.434,0.45],[0.195,0.295,0.63],[0.186,0.645,0.45],[0.282,0.392,0.53],[0.338,0.216,0.8],[0.347,0.763,0.55],[0.441,0.135,0.92],[0.442,0.812,0.62],[0.498,0.253,0.71],[0.567,0.183,0.86],[0.57,0.827,0.58],[0.659,0.355,0.57],[0.718,0.259,0.66],[0.719,0.711,0.47],[0.807,0.434,0.44],[0.886,0.419,0.5],[0.941,0.497,0.35]],
  SHE=[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]];
var RM=matchMedia('(prefers-reduced-motion: reduce)');function anim(){return !RM.matches}
var MINT='85,218,161',TINT='255,182,176';
function fmt(t){t=Math.max(0,t||0);var m=Math.floor(t/60),s=Math.floor(t%60);return m+':'+(s<10?'0':'')+s}
function file(k){return String(T[k].file||'').replace(/^\.\.\//,'')}
function mail(k){var t=T[k]||{};return 'mailto:imjamesgill@gmail.com?subject='+encodeURIComponent('Sync / licensing: '+(t.title||'')+(t.artist?' ('+t.artist+')':''))}
var el=document.createElement('div');el.className='sp';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','the player: six songs by Lost Coffee and Mothers Moniker');
el.innerHTML='<canvas class="sp-cv" aria-hidden="true"></canvas><div class="sp-ui"><ol class="sp-songs" aria-label="songs">'+KEYS.map(function(k){var t=T[k];return '<li><button type="button" data-t="'+k+'"><b>'+t.title+'</b><small>'+t.artist+'</small></button></li>'}).join('')+
  '</ol><div class="sp-pill"><button type="button" class="sp-pp" aria-label="play">▶</button><p class="sp-ti"><b></b><small></small></p><p class="sp-tc">0:00 / 0:00</p></div>'+
  '<div class="sp-rail" role="slider" tabindex="0" aria-label="position in the song" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><canvas aria-hidden="true"></canvas></div>'+
  '<p class="sp-sync">available for sync / licensing · <a href="mailto:imjamesgill@gmail.com">imjamesgill@gmail.com</a></p></div>';
var au=document.createElement('audio');au.preload='none';au.setAttribute('playsinline','');el.appendChild(au);document.body.appendChild(el);
var cv=el.querySelector('.sp-cv'),g=cv.getContext('2d'),rl=el.querySelector('.sp-rail'),rc=rl.querySelector('canvas'),rg=rc.getContext('2d'),pp=el.querySelector('.sp-pp'),ti=el.querySelector('.sp-ti'),tc=el.querySelector('.sp-tc'),syn=el.querySelector('.sp-sync a');
var on=false,k=KEYS[0],want=false,raf=0,W=0,H=0,DPR=1,stars=[],hover=-1,t0=0;
function size(){W=el.clientWidth||innerWidth;H=el.clientHeight||innerHeight;DPR=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  var r=rl.getBoundingClientRect();rc.width=Math.round(r.width*DPR);rc.height=Math.round(r.height*DPR);layout()}
function layout(){var top=W<600?96:110,ui=el.querySelector('.sp-ui').getBoundingClientRect(),bot=Math.max(top+140,ui.top-14),x0=W<600?22:Math.max(60,W*.12),x1=W-x0;
  stars=SHS.map(function(p,i){return{x:x0+p[0]*(x1-x0),y:top+p[1]*(bot-top),b:p[2],i:i}});
  KEYS.forEach(function(kk){var s=stars[T[kk].star];if(s)s.song=kk})}
function sel(kk,play){if(!T[kk])return;var same=kk===k&&au.getAttribute('src');k=kk;if(!same){au.src=file(kk);try{au.load()}catch(e){}}
  ti.querySelector('b').textContent=T[kk].title;ti.querySelector('small').textContent=T[kk].artist;syn.href=mail(kk);
  [].forEach.call(el.querySelectorAll('.sp-songs button'),function(b){b.setAttribute('aria-pressed',String(b.dataset.t===kk))});
  tick();if(play)go();if(window.__world)__world.ui();req()}
function go(){want=false;var p;try{p=au.play()}catch(e){want=true;ui();return}if(p&&p.catch)p.catch(function(){want=true;ui()});ui()}
function ui(){var playing=!au.paused&&!au.ended;pp.textContent=playing?'❚❚':'▶';pp.setAttribute('aria-label',playing?'pause':want?'tap to play':'play');el.classList.toggle('playing',playing);el.classList.toggle('want',want)}
function dur(){return isFinite(au.duration)&&au.duration>0?au.duration:(T[k].dur||1)}
function tick(){var d=dur(),c=au.currentTime||0;tc.textContent=fmt(c)+' / '+fmt(d);rl.setAttribute('aria-valuenow',String(Math.round(c/d*100)));rl.setAttribute('aria-valuetext',fmt(c)+' of '+fmt(d))}
['play','pause','playing','ended','waiting'].forEach(function(n){au.addEventListener(n,function(){ui();req()})});
au.addEventListener('timeupdate',function(){tick();if(!anim())req()});au.addEventListener('loadedmetadata',tick);
au.addEventListener('ended',function(){var i=KEYS.indexOf(k);sel(KEYS[(i+1)%KEYS.length],true)});
pp.addEventListener('click',function(e){e.preventDefault();if(!au.getAttribute('src'))sel(k,false);if(au.paused)go();else au.pause()});
el.querySelector('.sp-songs').addEventListener('click',function(e){var b=e.target.closest('button[data-t]');if(!b)return;e.preventDefault();if(b.dataset.t===k&&!au.paused){au.pause();return}sel(b.dataset.t,true)});
/* iOS / Android: if the browser refused a play() it gets one more chance on your next touch here */
['touchend','click'].forEach(function(n){el.addEventListener(n,function(e){if(want&&on&&!e.target.closest('.sp-pp,.sp-songs,a')){go()}},true)});
/* the waveform line: tap / drag to move through the song */
var sk=null;function seekAt(x){var r=rl.getBoundingClientRect(),f=Math.max(0,Math.min(1,(x-r.left)/r.width));try{au.currentTime=f*dur()}catch(e){}tick();req()}
rl.addEventListener('pointerdown',function(e){if(!au.getAttribute('src'))sel(k,false);sk=1;try{rl.setPointerCapture(e.pointerId)}catch(x){}seekAt(e.clientX)});
rl.addEventListener('pointermove',function(e){if(sk)seekAt(e.clientX)});rl.addEventListener('pointerup',function(){sk=null});rl.addEventListener('pointercancel',function(){sk=null});
rl.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?5:e.key==='ArrowLeft'?-5:0;if(!d)return;e.preventDefault();try{au.currentTime=Math.max(0,Math.min(dur(),au.currentTime+d))}catch(x){}tick()});
/* the song stars on the canvas are pressable too (same as the list under them) */
cv.addEventListener('click',function(e){var r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,best=null,bd=30;stars.forEach(function(s){if(!s.song)return;var d=Math.hypot(s.x-x,s.y-y);if(d<bd){bd=d;best=s}});if(best){if(best.song===k&&!au.paused)au.pause();else sel(best.song,true)}});
function req(){if(!raf&&on)raf=requestAnimationFrame(draw)}
function draw(t){raf=0;if(!on)return;var tr=T[k],pk=tr.peaks||[],d=dur(),c=au.currentTime||0,f=Math.min(1,c/d),playing=!au.paused,lv=pk.length?pk[Math.min(pk.length-1,Math.floor(f*pk.length))]:0;
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);g.lineCap='round';
  /* the constellation: lines, then stars; songs are the bright ones, the one playing is mint and breathes with the music */
  g.strokeStyle='rgba(233,200,197,.32)';g.lineWidth=1;g.beginPath();SHE.forEach(function(e){var a=stars[e[0]],b=stars[e[1]];if(a&&b){g.moveTo(a.x,a.y);g.lineTo(b.x,b.y)}});g.stroke();
  stars.forEach(function(s){var isC=s.song===k,r=s.song?(isC?3.4+(playing&&anim()?lv*3:0):2.6):1+1.4*s.b,col=isC?MINT:s.song?'255,236,232':TINT;
    var gr=g.createRadialGradient(s.x,s.y,0,s.x,s.y,r*7);gr.addColorStop(0,'rgba('+col+',.55)');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(s.x-r*7,s.y-r*7,r*14,r*14);
    g.fillStyle='rgb('+col+')';g.beginPath();g.arc(s.x,s.y,r,0,7);g.fill();
    if(s.song){g.font=(isC?'400 ':'300 ')+(W<600?10.5:12)+'px Poppins, sans-serif';g.textAlign=s.x>W*.7?'right':s.x<W*.3?'left':'center';g.textBaseline='alphabetic';g.fillStyle=isC?'rgb('+MINT+')':'rgba(236,240,242,.88)';
      var lab=T[s.song].title;if(lab.length>22)lab=lab.slice(0,20)+'…';g.fillText(lab,s.x+(g.textAlign==='left'?-4:g.textAlign==='right'?4:0),s.y-12)}});
  /* the rail: this song's waveform; played part mint, the playhead a small star */
  var rw=rc.width/DPR,rh=rc.height/DPR;rg.setTransform(DPR,0,0,DPR,0,0);rg.clearRect(0,0,rw,rh);var n=Math.max(40,Math.floor(rw/3)),mid=rh/2;
  for(var i=0;i<n;i++){var p=pk.length?pk[Math.floor(i/n*pk.length)]:.3,h=Math.max(1.5,p*(rh*.46)),x=i/n*rw+1;rg.fillStyle=i/n<f?'rgba('+MINT+',.95)':'rgba(220,228,236,.38)';rg.fillRect(x,mid-h,Math.max(1,rw/n-1.2),h*2)}
  var hx=f*rw;rg.fillStyle='#fff';rg.beginPath();rg.arc(Math.max(3,Math.min(rw-3,hx)),mid,3,0,7);rg.fill();
  if(playing||sk)raf=requestAnimationFrame(draw)}
function open(it,o){o=o||{};el.hidden=false;on=true;size();if(!au.getAttribute('src'))sel(k,false);else sel(k,false);ui();window.__iris(el,o,true);req();
  setTimeout(function(){try{pp.focus({preventScroll:true})}catch(e){}},60)}
function close(o){if(!on)return;on=false;want=false;try{au.pause()}catch(e){}window.__iris(el,o||{},false,function(){if(!on)el.hidden=true})}
addEventListener('resize',function(){if(on){size();req()}});
el.addEventListener('keydown',function(e){if(e.key===' '&&e.target===el){e.preventDefault();pp.click()}});
window.__player={open:open,close:close,isOn:function(){return on},state:function(){return{on:on,k:k,title:T[k].title,artist:T[k].artist,paused:au.paused,t:au.currentTime,src:au.currentSrc||au.getAttribute('src')||'',want:want,ready:au.readyState}},el:el,audio:au,sel:sel};
})();
