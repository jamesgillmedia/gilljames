/* Gill the artist · shared core: version switch, router (Back / Esc / swipe), image fade-ins, player, index.
   Reduce Motion: identical output by design (Gill's rule) — no motion branches anywhere. */
(function(w){'use strict';
var d=document,H=d.documentElement,LSV='gj.fresh.artist.v2';
/* ---------- version (dev toggle) ---------- */
var q=new URLSearchParams(location.search),V=(q.get('v')||'').toUpperCase();
if(!/^[ABC]$/.test(V)){try{V=(localStorage.getItem(LSV)||'').toUpperCase()}catch(e){}}
if(!/^[ABC]$/.test(V))V='C'; /* Gill's pick: C · Trail Line */
try{localStorage.setItem(LSV,V)}catch(e){}
H.dataset.v=V;
function devToggle(){var b=d.createElement('div');b.id='dev';b.setAttribute('aria-label','prototype direction (dev)');
  b.innerHTML='<span>dir</span>'+['A','B','C'].map(function(x){return '<a href="?v='+x+'" data-v="'+x+'"'+(x===V?' class="on" aria-current="true"':'')+'>'+x+'</a>'}).join('');
  b.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();try{localStorage.setItem(LSV,a.dataset.v)}catch(x){}var q=new URLSearchParams(location.search);q.set('v',a.dataset.v);location.href='?'+q.toString()});
  d.body.appendChild(b)}
/* ---------- helpers ---------- */
function el(tag,cls,html,parent){var e=d.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e}
function img(src,cls,alt,parent){var i=d.createElement('img');i.className='fi '+(cls||'');i.decoding='async';i.alt=alt||'';i.draggable=false;
  i.addEventListener('load',function(){i.classList.add('in')});i.addEventListener('error',function(){i.classList.add('in','err')});i.src=src;if(parent)parent.appendChild(i);if(i.complete&&i.naturalWidth)i.classList.add('in');return i}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var ease=function(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
function tween(ms,fn,done){var t0=performance.now(),id={stop:false};function f(n){if(id.stop)return;var k=Math.min(1,(n-t0)/ms);fn(ease(k),k);if(k<1)requestAnimationFrame(f);else if(done)done()}requestAnimationFrame(f);return id}
/* ---------- data ---------- */
var D=w.GD,ROOMS=[
 {k:'objects',n:'Objects',items:D.objects},
 {k:'film',n:'Film',items:D.film},
 {k:'photo',n:'Photo',items:D.photo.map(function(p,i){p.t='';p.no=i+1;return p})},
 {k:'spaces',n:'Spaces',items:D.spaces.map(function(s,i){s.id=s.id;return s})},
 {k:'about',n:'About',items:[]}];
ROOMS.forEach(function(r){r.items.forEach(function(it){it.room=r.k;if(r.k==='film'){it.src=it.stills[0].src;it.th=it.stills[0].th;it.w=it.stills[0].w;it.h=it.stills[0].h}})});
function room(k){for(var i=0;i<ROOMS.length;i++)if(ROOMS[i].k===k)return ROOMS[i];return null}
function item(rk,id){var r=room(rk);if(!r)return null;for(var i=0;i<r.items.length;i++)if(r.items[i].id===id)return r.items[i];return null}
function caption(it,long){ /* only verified facts; unknowns left out of the art, listed in the report */
  if(!it)return'';var r=it.room;
  if(r==='objects')return '<i class="ct">'+esc(it.t)+'</i>'+(it.meta?'<span class="cm">'+esc(it.meta)+'</span>':'');
  if(r==='film')return '<i class="ct">'+esc(it.t)+'</i><span class="cm">'+esc(it.role)+' · '+it.year+'</span>'+(long?it.awards.map(function(a){return '<span class="ca">'+esc(a)+'</span>'}).join(''):'');
  if(r==='photo')return '<span class="cm">photograph '+String(it.no).padStart(2,'0')+' / '+D.photo.length+'</span>';
  if(r==='spaces')return '<i class="ct">'+esc(it.t)+'</i>'+(long?'<span class="ca">'+esc(D.spiritEye.line)+'</span><span class="cm">'+esc(D.spiritEye.made)+'</span>':'');
  return''}
/* ---------- router ---------- */
var R={cur:null,handlers:[],parent:function(r){var p=r.split('/');p.pop();return p.join('/')}};
function parse(){var h=location.hash.replace(/^#\/?/,'');return decodeURIComponent(h)}
function depth(){return history.state&&history.state.d|0}
R.go=function(route,opt){opt=opt||{};if(route===R.cur)return;var prev=R.cur;
  if(opt.replace)history.replaceState({d:depth()},'','#/'+route);else history.pushState({d:depth()+1},'','#/'+route);
  R.cur=route;fire(route,prev,opt.how||(opt.replace?'swap':'in'))};
R.up=function(){if(R.cur===''||R.cur==null)return false;if(depth()>0){history.back();return true}
  var p=R.parent(R.cur),prev=R.cur;history.replaceState({d:0},'','#/'+p);R.cur=p;fire(p,prev,'out');return true};
function fire(r,p,how){R.handlers.forEach(function(f){f(r,p,how)})}
R.on=function(f){R.handlers.push(f)};
var goingHome=false;
w.addEventListener('popstate',function(){var r=parse(),p=R.cur;
  if(goingHome){goingHome=false;if(r!==''){history.replaceState({d:0},'','#/');r=''}}
  if(r===p)return;R.cur=r;
  var a=lvl(r),b=lvl(p),how=a<b?'out':a>b?'in':'swap';fire(r,p,how)});
function lvl(r){return !r?0:r.split('/').length}
/* wordmark → home: rewind to the entry we came in on (no duplicate #/ entry), so the next Back always does something visible */
/* a silent history step (used so Back from a print lands on its drawer) */
R.mark=function(route){history.pushState({d:depth()+1},'','#/'+route);R.cur=route};
R.home=function(){if(R.cur===''||R.cur==null)return false;var dd=depth();if(dd>0){goingHome=true;history.go(-dd);return true}
  var prev=R.cur;history.replaceState({d:0},'','#/');R.cur='';fire('',prev,'out');return true};
R.start=function(){if(!history.state)history.replaceState({d:0},'',location.hash||'#/');R.cur=parse();fire(R.cur,null,'load')};
/* Esc = one level out, everywhere */
d.addEventListener('keydown',function(e){if(e.key==='Escape'){if(R.escHook&&R.escHook())return;R.up()}});
/* ---------- swipe ---------- */
function swipe(target,cb,opt){opt=opt||{};var s=null,multi=false;
  /* a gesture that ever had two fingers is a pinch, never a swipe */
  target.addEventListener('touchstart',function(e){if(e.touches.length!==1){multi=true;s=null;return}if(multi)return;var t=e.touches[0];s={x:t.clientX,y:t.clientY,t:performance.now()}},{passive:true});
  target.addEventListener('touchmove',function(e){if(e.touches.length>1){multi=true;s=null}},{passive:true});
  target.addEventListener('touchcancel',function(e){s=null;if(!e.touches.length)multi=false},{passive:true});
  target.addEventListener('touchend',function(e){if(multi){s=null;if(!e.touches.length)multi=false;return}if(!s)return;var t=e.changedTouches[0],dx=t.clientX-s.x,dy=t.clientY-s.y,dt=performance.now()-s.t,ax=Math.abs(dx),ay=Math.abs(dy);var st=s;s=null;
    if(dt>900)return;if(Math.max(ax,ay)<opt.min||Math.max(ax,ay)<60)return;
    var dir=ax>ay*1.3?(dx>0?'right':'left'):(ay>ax*1.3?(dy>0?'down':'up'):null);if(dir)cb(dir,st,e)},{passive:true})}
/* ---------- player (To Go · Lost Coffee) — the waveform is never dimmed ---------- */
function player(){var p=el('div','gplay',null,d.body);p.id='gplay';
  var b=el('button','pp','<span class="tri"></span>',p);b.setAttribute('aria-label','play To Go · Lost Coffee');
  el('span','pl','To Go <em>· Lost Coffee</em>',p);
  var c=el('canvas','pw',null,p),au=new Audio();au.preload='none';au.src=D.togo.src;
  function draw(){var dpr=Math.min(2,w.devicePixelRatio||1),W=c.clientWidth,Hh=c.clientHeight;if(!W)return;c.width=W*dpr;c.height=Hh*dpr;var x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,Hh);
    var pk=D.togo.peaks,n=Math.floor(W/4),pf=au.duration?au.currentTime/au.duration:0;x.fillStyle='#e8e4dc';
    for(var i=0;i<n;i++){var v=pk[Math.floor(i/n*pk.length)],k=Math.max(1,Math.round(v*Hh/3.2));for(var j=0;j<k;j++){var y=Hh/2+(j-(k-1)/2)*3;x.globalAlpha=1;x.fillRect(i*4+1,y-.6,1.3,1.3)}}
    if(pf>0){x.fillRect(Math.round(pf*W),1,1,Hh-2)}}
  function loop(){draw();if(!au.paused)requestAnimationFrame(loop)}
  b.addEventListener('click',function(){if(au.paused){au.play().catch(function(){});p.classList.add('on');b.setAttribute('aria-label','pause');loop()}else{au.pause();p.classList.remove('on');b.setAttribute('aria-label','play To Go · Lost Coffee')}});
  c.addEventListener('click',function(e){if(!au.duration)return;var r=c.getBoundingClientRect();au.currentTime=(e.clientX-r.left)/r.width*au.duration;draw()});
  au.addEventListener('ended',function(){p.classList.remove('on')});
  w.addEventListener('resize',draw);setTimeout(draw,60);return p}
/* ---------- flat index (escape hatch) ---------- */
function index(onPick){var o=el('div','gindex',null,d.body);o.id='gindex';o.setAttribute('role','dialog');o.setAttribute('aria-label','index');
  var h='<button class="gx" aria-label="close index">close</button><div class="gi-in">';
  ROOMS.forEach(function(r){h+='<section><h3>'+r.n+'</h3><ol>';
    if(r.k==='about')h+='<li><a data-r="about">bio · poem · contact</a></li>';
    else if(r.k==='photo')h+='<li><a data-r="photo">'+r.items.length+' photographs</a></li>';
    else r.items.forEach(function(it){h+='<li><a data-r="'+r.k+'/'+it.id+'">'+esc(it.t)+(r.k==='film'?' <small>'+esc(it.role)+'</small>':'')+'</a></li>'});
    h+='</ol></section>'});
  o.innerHTML=h+'</div>';
  o.addEventListener('click',function(e){var a=e.target.closest('a[data-r]');if(a){e.preventDefault();onPick(a.dataset.r);return}if(e.target.closest('.gx'))R.up()});
  return o}
w.G={V:V,el:el,img:img,esc:esc,ease:ease,tween:tween,ROOMS:ROOMS,room:room,item:item,caption:caption,R:R,swipe:swipe,player:player,index:index,devToggle:devToggle,D:D};
})(window);
