/* B · Channel Strips — a mixing desk. Five channels, one per released track: the cover is the scribble strip, the track's
   whole waveform runs up the channel as its meter path, and a live level meter rides beside it when it plays. Gill's plates
   are the anodised faceplates. Tap a channel to solo it: it opens into the room, the Sound engine tunnel fills its window,
   the others fold to slim edges (tap one to swap; replace, so Back always leaves). Every channel plays at full level:
   no per-channel faders. The master strip keeps vol beside the MASTER label and the streaming
   links. Flash and Night/Red live in the logo drawer. Out: ‹ desk, Esc, Back, swipe down. */
(function(){'use strict';if(G.V!=='B')return;
var d=document,app=d.getElementById('app'),R=G.R,el=G.el,esc=G.esc,img=G.img,D=G.D,O=G.ORDER;
var desk=el('div','b-desk',null,app);
var hd=el('header','b-hd','<button class="b-wm" type="button">Lost Coffee</button><span class="b-sub">5 ch · released</span>',app);
var win=el('div','b-win',null,app),cv=el('canvas','lv-stage',null,win),S=LV.stage(cv,{vy:.42,scale:3.0,bg:'#050505'});
var solo=el('section','b-solo',null,app);
var strips=O.map(function(t,i){var s=el('div','b-ch',null,desk);s.dataset.id=t.id;
  s.innerHTML='<div class="b-face"></div><button class="b-hit" type="button" aria-label="solo '+esc(t.t)+'"></button><div class="b-scr"></div><div class="b-no">CH '+('0'+(i+1)).slice(-2)+'</div>'+
    '<div class="b-path"><canvas></canvas><i class="b-led"></i></div><div class="b-nm">'+esc(t.t)+'</div><div class="b-ln">'+esc(G.len(t))+'</div><div class="b-so">solo</div>';
  img(t.plates[0].src,'',' ',s.querySelector('.b-face'));img(t.coverS,'',t.t+' cover',s.querySelector('.b-scr'));
  t.rail=LV.rail(s.querySelector('.b-path canvas'),{track:t,vertical:true,step:3,amp:.4,bw:1.2,onPick:function(){pickT(t)}});t.strip=s;return s});
var master=el('div','b-ch b-master',null,desk);master.innerHTML='<div class="b-no">MASTER</div><div class="b-mt"></div><div class="b-links lv-links"><a href="'+D.links.spotify+'" target="_blank" rel="noopener">Spotify</a><a href="'+D.links.apple+'" target="_blank" rel="noopener">Apple</a></div><p class="b-mm">also: <a href="'+D.links.mm+'" target="_blank" rel="noopener">Mothers Moniker ↗</a></p>';
LV.tune(master.querySelector('.b-mt'),'','vol');
var openT=null,soloRail=null;
/* preload every cover + plate so a solo never opens onto an empty stage */
var PRE=[];O.forEach(function(t){[t.cover].concat(t.plates.map(function(p){return p.src})).forEach(function(s){var i=new Image();i.decoding='async';i.src=s;if(i.decode)i.decode().catch(function(){});PRE.push(i)})});
function soloHTML(t){var i=O.indexOf(t);return '<button class="b-back" type="button">‹ desk</button><p class="b-sn">CH '+('0'+(i+1)).slice(-2)+' · SOLO · '+(t.year||'TBD')+' · '+esc(G.len(t))+'</p><h2 class="b-st">'+esc(t.t)+'</h2>'+
  '<div class="b-cov"></div><div class="b-pls"></div><div class="b-tr"><button class="b-pp" type="button" aria-label="play"><i></i></button><span class="b-time">0:00</span><span class="lv-links">'+G.links(t)+'</span><span class="b-stune"></span></div><div class="b-rail"><canvas aria-label="waveform — drag to move through the track"></canvas></div>'}
function fillSolo(t){solo.innerHTML=soloHTML(t);img(t.cover,'',t.t+' — cover artwork',solo.querySelector('.b-cov'));var pl=solo.querySelector('.b-pls');t.plates.slice(1).forEach(function(p){var f=el('figure','',null,pl);img(p.src,'','',f)});
  LV.tune(solo.querySelector('.b-stune'),'','vol');if(soloRail)LV.unrail(soloRail);soloRail=LV.rail(solo.querySelector('.b-rail canvas'),{step:3,amp:.46,bw:1.4});sync()}
function sync(){var b=solo.querySelector('.b-pp');if(b){var on=!LV.au.paused;b.classList.toggle('on',on);b.setAttribute('aria-label',on?'pause':'play')}var c=LV.cur();strips.forEach(function(s){s.classList.toggle('live',!!c&&s.dataset.id===c.id&&!LV.au.paused)})}
LV.on(sync);
/* level meter: live rms from the analyser on the playing channel */
(function meter(){requestAnimationFrame(meter);var c=LV.cur();strips.forEach(function(s){var led=s.querySelector('.b-led');var v=c&&s.dataset.id===c.id&&!LV.au.paused?Math.min(1,LV.L.rms*1.2):0;led.style.transform='scaleY('+v.toFixed(3)+')'});
  var ti=solo.querySelector('.b-time');if(ti&&c)ti.textContent=LV.mmss(LV.au.currentTime)})();
function layoutWin(){if(!openT)return;var r=openT.strip.getBoundingClientRect();}
function open(t,how){var first=!openT;openT=t;LV.load(t.id);fillSolo(t);app.classList.add('solo');strips.forEach(function(s){s.classList.toggle('on',s===t.strip)});
  if(how!=='load')LV.play();setTimeout(function(){S.resize()},40);if(!first){var h=solo.querySelector('.b-st');if(h)h.animate([{transform:'translateX(28px)'},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'})}}
function close(){if(!openT)return;openT=null;app.classList.remove('solo');strips.forEach(function(s){s.classList.remove('on')})}
R.on(function(route,prev,how){var m=route.match(/^t\/(.+)$/),t=m&&G.track(m[1]);if(m&&!t){R.go('',{replace:true});return}if(t)open(t,how);else close()});
function pickT(t){if(openT===t)return;R.go('t/'+t.id,{replace:!!openT})}
desk.addEventListener('click',function(e){if(e.target.closest('a,canvas,input,.lv-tune,.b-mt'))return;var s=e.target.closest('.b-ch');if(!s||s===master)return;pickT(G.track(s.dataset.id))});
solo.addEventListener('click',function(e){if(e.target.closest('.b-back'))R.up();if(e.target.closest('.b-pp'))LV.toggle()});
GJ_THEME.bind(hd.querySelector('.b-wm'),{tune:true,home:function(){R.home()}});
function stepT(k){var i=O.indexOf(openT);R.go('t/'+O[(i+k+O.length)%O.length].id,{replace:true})}
d.addEventListener('keydown',function(e){if(e.target.closest&&e.target.closest('input'))return;if(/^[1-5]$/.test(e.key)){pickT(O[+e.key-1]);return}if(!openT)return;if(e.key==='ArrowRight')stepT(1);if(e.key==='ArrowLeft')stepT(-1);if(e.key===' '){e.preventDefault();LV.toggle()}});
G.swipe(solo,function(dir,st){var rr=solo.querySelector('.b-rail');if(rr){var b=rr.getBoundingClientRect();if(st.y>b.top-10&&st.y<b.bottom+10)return}if(dir==='down')R.up();else if(dir==='left'||dir==='right')stepT(dir==='left'?1:-1)});
(function(){var p0=null;[solo,win].forEach(function(tg){tg.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];p0={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),done:false}}},{passive:true});
  tg.addEventListener('touchmove',function(e){if(!p0||p0.done||e.touches.length<2)return;var a=e.touches[0],b=e.touches[1];if(Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)<p0.d*.72){p0.done=true;if(openT)R.up()}},{passive:true});
  tg.addEventListener('touchend',function(e){if(!e.touches.length)p0=null},{passive:true})})})();
G.swipe(win,function(dir){if(dir==='down')R.up();else if(dir==='left'||dir==='right')stepT(dir==='left'?1:-1)});
LV.load('lost-in-time');G.devToggle();R.start();
})();
