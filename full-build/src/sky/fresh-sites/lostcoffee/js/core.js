/* Lost Coffee · shared core: version switch, router (Back / Esc / swipe), image fade-ins.
   Reduce Motion: identical output by design (Gill's rule) — no motion branches anywhere. */
(function(w){'use strict';
var d=document,H=d.documentElement,LSV='gj.fresh.lostcoffee.v2';
var q=new URLSearchParams(location.search),V=(q.get('v')||'').toUpperCase();
if(!/^[ABC]$/.test(V)){try{V=(localStorage.getItem(LSV)||'').toUpperCase()}catch(e){}}
if(!/^[ABC]$/.test(V))V='B'; /* Gill's pick: B · Channel Strips */
try{localStorage.setItem(LSV,V)}catch(e){}
H.dataset.v=V;
function devToggle(){var b=d.createElement('div');b.id='dev';b.setAttribute('aria-label','prototype direction (dev)');
  b.innerHTML='<span>dir</span>'+['A','B','C'].map(function(x){return '<a href="?v='+x+'" data-v="'+x+'"'+(x===V?' class="on" aria-current="true"':'')+'>'+x+'</a>'}).join('');
  b.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();try{localStorage.setItem(LSV,a.dataset.v)}catch(x){}var q=new URLSearchParams(location.search);q.set('v',a.dataset.v);location.href='?'+q.toString()});
  d.body.appendChild(b)}
function el(tag,cls,html,parent){var e=d.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;if(parent)parent.appendChild(e);return e}
function img(src,cls,alt,parent){var i=d.createElement('img');i.className='fi '+(cls||'');i.decoding='async';i.alt=alt||'';i.draggable=false;
  i.addEventListener('load',function(){i.classList.add('in')});i.addEventListener('error',function(){i.classList.add('in','err')});i.src=src;if(parent)parent.appendChild(i);if(i.complete&&i.naturalWidth)i.classList.add('in');return i}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var ease=function(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
function tween(ms,fn,done){var t0=performance.now(),id={stop:false};function f(n){if(id.stop)return;var k=Math.min(1,(n-t0)/ms);fn(ease(k),k);if(k<1)requestAnimationFrame(f);else if(done)done()}requestAnimationFrame(f);return id}
var D=w.LC;D.tracks.forEach(function(t,i){t.i=i});
function track(id){for(var i=0;i<D.tracks.length;i++)if(D.tracks[i].id===id)return D.tracks[i];return null}
/* release order on the page: Lost in Time leads, then the rest as listed */
var ORDER=['lost-in-time','to-go','no-problem','equals','ii'].map(track);
function links(t){var h='';if(t&&t.spotify)h+='<a href="'+t.spotify+'" target="_blank" rel="noopener">Spotify</a>';if(t&&t.apple)h+='<a href="'+t.apple+'" target="_blank" rel="noopener">Apple Music</a>';return h}
function len(t){return t.len||'TBD'}
/* ---------- router ---------- */
var R={cur:null,handlers:[],parent:function(r){if(/^t\//.test(r))return '';var p=r.split('/');p.pop();return p.join('/')}};
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
  /* wordmark rewound to the entry route (deep-link entry): land home in place, no extra entry */
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
  target.addEventListener('touchstart',function(e){if(e.touches.length!==1){multi=true;s=null;return}if(multi)return;var n=e.target;if(n&&n.closest&&n.closest('input,.b-fader,.lv-tune,#wmDrawer'))return;var t=e.touches[0];s={x:t.clientX,y:t.clientY,t:performance.now()}},{passive:true});
  target.addEventListener('touchmove',function(e){if(e.touches.length>1){multi=true;s=null}},{passive:true});
  target.addEventListener('touchcancel',function(e){s=null;if(!e.touches.length)multi=false},{passive:true});
  target.addEventListener('touchend',function(e){if(multi){s=null;if(!e.touches.length)multi=false;return}if(!s)return;var t=e.changedTouches[0],dx=t.clientX-s.x,dy=t.clientY-s.y,dt=performance.now()-s.t,ax=Math.abs(dx),ay=Math.abs(dy);var st=s;s=null;
    if(dt>900)return;if(Math.max(ax,ay)<opt.min||Math.max(ax,ay)<60)return;
    var dir=ax>ay*1.3?(dx>0?'right':'left'):(ay>ax*1.3?(dy>0?'down':'up'):null);if(dir)cb(dir,st,e)},{passive:true})}
w.G={V:V,el:el,img:img,esc:esc,ease:ease,tween:tween,R:R,swipe:swipe,devToggle:devToggle,D:D,track:track,ORDER:ORDER,links:links,len:len};
})(window);
