/* C · Counter Ticket — a late counter. The Sound engine is the window behind it, always running the chosen track's groove
   with Gill's images drifting through. The menu board lists the five released tracks; tap one and a ticket prints out of the
   slot carrying that track's waveform (the seek), its cover, its plates and its links. Tear it off (×, Esc, Back, swipe down)
   and you're back at the counter. Swipe ← → on a ticket for the next order (replace, so Back always leaves). */
(function(){'use strict';if(G.V!=='C')return;
var d=document,app=d.getElementById('app'),R=G.R,el=G.el,esc=G.esc,img=G.img,D=G.D,O=G.ORDER;
var cv=el('canvas','lv-stage',null,app),S=LV.stage(cv,{vy:.42,scale:3.4,bg:'#070707'});
var veil=el('div','c-veil',null,app);
var hd=el('header','c-hd','<h1><button class="c-wm" type="button">Lost Coffee</button></h1><p class="c-sub">five released tracks</p>',app);
var board=el('nav','c-board',null,app);board.setAttribute('aria-label','tracks');
board.innerHTML='<p class="c-bh"><span>the counter</span><span>len</span></p>'+O.map(function(t,i){return '<button class="c-row'+(i===0?' lead':'')+'" type="button" data-id="'+t.id+'"><span class="th"></span><span class="tt">'+esc(t.t)+'</span><canvas class="ld" aria-hidden="true"></canvas><span class="ln">'+esc(G.len(t))+'</span><span class="pl" aria-hidden="true"></span></button>'}).join('')+
  '<p class="c-foot lv-links"><a href="'+D.links.spotify+'" target="_blank" rel="noopener">Spotify</a><a href="'+D.links.apple+'" target="_blank" rel="noopener">Apple Music</a></p>'+
  '<p class="c-mm">also: <a href="'+D.links.mm+'" target="_blank" rel="noopener">Mothers Moniker ↗</a></p>';
board.querySelectorAll('.c-row').forEach(function(b){var t=G.track(b.dataset.id);img(t.coverS,'',t.t+' cover',b.querySelector('.th'));LV.rail(b.querySelector('.ld'),{track:t,seek:false,step:2,amp:.5,bw:1})});
var tuneW=el('div','c-tune',null,app);LV.tune(tuneW,'','vol');
var slot=el('div','c-slot',null,app);var tk=el('article','c-ticket',null,slot);tk.setAttribute('aria-label','ticket');
var rail=null,openId=null,printing=null;
function ticketHTML(t){var no=('0'+(O.indexOf(t)+1)).slice(-2);
  return '<div class="c-perf top"></div><div class="c-tin">'+
  '<div class="c-tr1"><span>LOST COFFEE</span><span>ORDER '+no+' / 05</span></div>'+
  '<div class="c-tcov"></div>'+
  '<h2 class="c-tt">'+esc(t.t)+'</h2>'+
  '<div class="c-tr2"><span>'+(t.year||'TBD')+'</span><span>'+esc(G.len(t))+'</span></div>'+
  '<div class="c-wave"><canvas aria-label="waveform — drag to move through the track"></canvas></div>'+
  '<div class="c-tr3"><button class="c-pp" type="button" aria-label="play"><i></i></button><span class="c-time">0:00</span><span class="c-pv">preview</span></div>'+
  '<div class="c-plates"></div>'+
  '<div class="c-tl lv-links">'+G.links(t)+'</div><div class="c-ttune"></div>'+
  '<div class="c-tr4"><button class="c-tear" type="button">tear off ×</button><span class="c-nav"><button class="c-prev" type="button" aria-label="previous track">‹</button><button class="c-next" type="button" aria-label="next track">›</button></span></div>'+
  '</div><div class="c-perf bot"></div>'}
function fill(t){tk.innerHTML=ticketHTML(t);img(t.cover,'',t.t+' — cover artwork',tk.querySelector('.c-tcov'));
  var pl=tk.querySelector('.c-plates');t.plates.forEach(function(p,i){var f=el('figure','c-plate',null,pl);f.style.setProperty('--r',((i-1)*2.2+(i===2?1:0))+'deg');img(p.src,'','',f)});
  LV.tune(tk.querySelector('.c-ttune'),'','vol');if(rail)LV.unrail(rail);rail=LV.rail(tk.querySelector('.c-wave canvas'),{step:3,amp:.46,bw:1.4});sync()}
function sync(){var pp=tk.querySelector('.c-pp');if(pp){var on=!LV.au.paused;pp.classList.toggle('on',on);pp.setAttribute('aria-label',on?'pause':'play')}
  var cur=LV.cur();board.querySelectorAll('.c-row').forEach(function(b){b.classList.toggle('now',!!cur&&b.dataset.id===cur.id&&!LV.au.paused)})}
LV.on(sync);
setInterval(function(){var ti=tk.querySelector('.c-time');if(ti&&LV.cur())ti.textContent=LV.mmss(LV.au.currentTime)},250);
/* printing: the ticket feeds out of the slot in short steps, like a receipt printer */
function print(){if(printing)printing.stop=true;var h=tk.offsetHeight;slot.classList.add('on');tk.style.transform='translateY(-100%)';
  printing=G.tween(1500,function(e,k){var steps=Math.floor(k*22)/22;tk.style.transform='translateY('+(-100+100*G.ease(steps))+'%)'},function(){tk.style.transform='none'})}
function tear(){if(printing)printing.stop=true;tk.classList.add('tear');printing=G.tween(800,function(e){tk.style.transform='translateY('+(-e*40)+'px) rotate('+(-e*4)+'deg)';tk.style.opacity=1-e},function(){slot.classList.remove('on');tk.classList.remove('tear');tk.style.opacity='';tk.style.transform='translateY(-100%)'})}
function open(id,how){var t=G.track(id);if(!t){R.go('',{replace:true});return}var first=openId==null;openId=id;LV.load(id);fill(t);app.classList.add('ticket');
  if(first)print();else{tk.animate([{opacity:.0,transform:'translateY(-14px)'},{opacity:1,transform:'none'}],{duration:700,easing:'cubic-bezier(.2,.7,.2,1)'})}
  if(how!=='load')LV.play()}
R.on(function(route,prev,how){var m=route.match(/^t\/(.+)$/);if(m){open(m[1],how);return}
  if(openId!=null){openId=null;app.classList.remove('ticket');tear()}});
board.addEventListener('click',function(e){var b=e.target.closest('.c-row');if(b)R.go('t/'+b.dataset.id,{replace:!!openId})});
tk.addEventListener('click',function(e){if(e.target.closest('.c-pp')){LV.toggle();return}if(e.target.closest('.c-tear')){R.up();return}
  if(e.target.closest('.c-next'))step(1);if(e.target.closest('.c-prev'))step(-1)});
veil.addEventListener('click',function(){if(openId)R.up()});
function step(k){var i=O.findIndex(function(t){return t.id===openId});R.go('t/'+O[(i+k+O.length)%O.length].id,{replace:true})}
d.addEventListener('keydown',function(e){if(!openId)return;if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);if(e.key===' '&&!e.target.closest('input,button')){e.preventDefault();LV.toggle()}});
G.swipe(tk,function(dir){if(dir==='down'||dir==='up')R.up();else step(dir==='left'?1:-1)});
G.swipe(veil,function(dir){R.up()});
GJ_THEME.bind(hd.querySelector('.c-wm'),{tune:true,home:function(){R.home()}});
LV.load('lost-in-time');G.devToggle();R.start();
})();
