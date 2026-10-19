/* previews · feedback. No backend: Send opens a mailto: to the agent inbox, Copy puts the same text on the clipboard,
   and the last draft per item lives in localStorage so a half-typed note is never lost.
   Love / Needs work / Note appear only on What's new (Latest) cards — rendered by sky.js. */
(function(){'use strict';
var TO='gilljames@mail.grokbot.com',BASE=new URL('.',location.href).href,KEY='pvfb:',REACT=[['Love','♥'],['Needs work','↻'],['Note','✎']];
var TZ='America/Vancouver',ITEMS=[];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(s,r){return(r||document).querySelector(s)}function $$(s,r){return[].slice.call((r||document).querySelectorAll(s))}
function stem(f){return String(f||'').split('/').pop().replace(/\.[^.]+$/,'')}
function fileUrl(f){try{return new URL(f,BASE).href}catch(e){return f}}
function getD(f){try{return JSON.parse(localStorage.getItem(KEY+f))||{}}catch(e){return{}}}
function setD(f,d){try{if(!d.r&&!d.note)localStorage.removeItem(KEY+f);else localStorage.setItem(KEY+f,JSON.stringify(d))}catch(e){}}
function when(iso){try{var d=new Date(iso);return new Intl.DateTimeFormat('en-US',{timeZone:TZ,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(d)}catch(e){return iso||''}}
function nowStr(){var d=new Date(),v='';try{v=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,dateStyle:'medium',timeStyle:'short'}).format(d)+' Vancouver'}catch(e){}return d.toISOString()+(v?' ('+v+')':'')}

function form(it,o){o=o||{};var f=it.file||'',d=getD(f),id='fb'+Math.random().toString(36).slice(2,7);
  return'<div class="fb" data-file="'+esc(f)+'" data-title="'+esc(it.title||'')+'" data-time="'+esc(it.time||'')+'">'+(o.noHead?'':'<p class="fbh">Your feedback</p>')+
  '<div class="fbr" role="group" aria-label="Reaction to '+esc(it.title||'this preview')+'">'+REACT.map(function(r){return'<button type="button" class="fbb" data-r="'+r[0]+'" aria-pressed="'+(d.r===r[0])+'"><i aria-hidden="true">'+r[1]+'</i>'+r[0]+'</button>'}).join('')+'</div>'+
  '<div class="fbn"><input type="text" id="'+id+'" maxlength="300" enterkeyhint="send" autocomplete="off" autocapitalize="sentences" placeholder="one line for Artist Agent…" aria-label="One line of feedback for '+esc(it.title||'this preview')+'" value="'+esc(d.note||'')+'"><button type="button" class="fbs">Send</button></div>'+
  '<div class="fbx"><button type="button" class="fbc">Copy</button><span class="fbst" role="status" aria-live="polite"></span></div>'+
  '<details class="fbmore"><summary>More feedback (next)</summary><div class="fbnext" aria-disabled="true">'+
  '<button type="button" class="fnx" disabled title="Coming next">hold ♪ voice</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">A / B</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">Keep going</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">Try another</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">Ship it</button>'+
  '<span class="fnemoji" title="Coming next">★ ✎ ✕</span></div></details></div>'}

function compose(box){var f=box.dataset.file,d=getD(f),t=box.dataset.title,mark=window.PVFB&&PVFB.mark&&PVFB.mark(),
  body=['Preview: '+t,'Reaction: '+(d.r||'(none)'),'Note: '+(d.note||'(none)'),
  mark?('At: '+mark.tc+' (frame '+mark.frame+' @ '+mark.fps+'fps)'+(mark.held?' · marked':' · playhead')):null,
  'Item file: '+fileUrl(f),'Page: '+BASE+'#'+(function(){var it=ITEMS.filter(function(i){return i.file===f})[0];return it?it.section+'/'+(it.id||stem(f)):''})(),
  box.dataset.time?'Item posted: '+box.dataset.time:'','Sent: '+nowStr()].filter(Boolean).join('\n'),subject='Preview feedback: '+t+(mark?' @ '+mark.tc:'');
  return{subject:subject,body:body}}
function status(box,msg,cls){var s=$('.fbst',box);if(s){s.textContent=msg;s.className='fbst'+(cls?' '+cls:'')}}
function sync(box,skipInput){var f=box.dataset.file,d=getD(f);$$('.fb').forEach(function(b){if(b.dataset.file!==f)return;
  $$('.fbb',b).forEach(function(x){x.setAttribute('aria-pressed',String(d.r===x.dataset.r))});var i=$('input',b);if(i&&i!==skipInput&&i.value!==(d.note||''))i.value=d.note||''})}
function ok(box){var d=getD(box.dataset.file);if(!d.r&&!d.note){status(box,'Tap Love, Needs work or Note, or type a line first.','warn');return false}return true}
function send(box){if(!ok(box))return;var m=compose(box),url='mailto:'+TO+'?subject='+encodeURIComponent(m.subject)+'&body='+encodeURIComponent(m.body);
  status(box,'Opening your mail app… hit send there. If nothing opens, tap Copy.','ok');var a=document.createElement('a');a.href=url;a.style.display='none';document.body.appendChild(a);a.click();a.remove()}
function copy(box){if(!ok(box))return;var m=compose(box),txt='To: '+TO+'\nSubject: '+m.subject+'\n\n'+m.body;
  function done(){status(box,'Copied. Paste it into an email to '+TO,'ok')}
  function fb(){var t=document.createElement('textarea');t.value=txt;t.setAttribute('readonly','');t.style.cssText='position:fixed;left:-9999px;top:0;font-size:16px';document.body.appendChild(t);t.select();t.setSelectionRange(0,txt.length);var r=false;try{r=document.execCommand('copy')}catch(e){}t.remove();r?done():status(box,'Could not copy. Long-press the note and copy it by hand.','warn')}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,fb);else fb()}

document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.fb button');if(!b)return;var box=b.closest('.fb'),f=box.dataset.file;
  if(b.classList.contains('fbb')){var d=getD(f);d.r=d.r===b.dataset.r?'':b.dataset.r;var mk=window.PVFB&&PVFB.mark&&PVFB.mark();if(d.r&&mk){d.mark=mk.tc;if(!d.note){d.note='at '+mk.tc}else if(d.note.indexOf('at ')!==0&&d.note.indexOf('@')<0){/* keep note; mark travels in compose */}}setD(f,d);sync(box);status(box,mk&&d.r?('Marked '+mk.tc):'');if(d.r==='Note'){var i=$('input',box);i&&i.focus()}}
  else if(b.classList.contains('fbs'))send(box);else if(b.classList.contains('fbc'))copy(box)});
document.addEventListener('input',function(e){var i=e.target;if(!i.closest||!i.closest('.fb')||i.tagName!=='INPUT')return;var box=i.closest('.fb'),f=box.dataset.file,d=getD(f);d.note=i.value;setD(f,d);sync(box,i);status(box,'')});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.closest&&e.target.closest('.fb')&&e.target.tagName==='INPUT'){e.preventDefault();send(e.target.closest('.fb'))}});

/* sky mode: a small "What's new" sheet so feedback is still one tap away from the constellation */
var rail=document.createElement('section'),togBtn=null,shown=false;rail.className='frail sheet';rail.id='frail';rail.hidden=true;rail.setAttribute('aria-label','What\'s new: leave feedback');
function pick(){return ITEMS.filter(function(i){return i.badge==='Latest'&&i.file&&i.type!=='placeholder'})}
function build(){var a=pick();if(!a.length){rail.innerHTML='';return}
  rail.innerHTML='<div class="frh"><h2>What\'s new<small>Love / Needs work / Note · Send opens mail</small></h2><button type="button" class="frx" aria-label="Close">✕</button></div><ul class="frt">'+a.map(function(it){
    var bg=it.poster?' style="background-image:url(\''+esc(it.poster)+'\')"':'';
    var stream=(it.section||'').replace(/^./,function(c){return c.toUpperCase()});
    return'<li><article class="card"><span class="stream-tag">'+esc(stream)+'</span><button type="button" class="frp"'+bg+' data-go="'+esc(it.section+'/'+(it.id||stem(it.file)))+'" aria-label="Open large: '+esc(it.title)+'"><b>'+(it.type==='audio'?'▶ Listen':'▶ Play')+'</b></button><div class="cb"><div class="meta"><time class="when" datetime="'+esc(it.time)+'">'+when(it.time)+'</time><span class="badge">Latest</span></div><h3 class="ct">'+esc(it.title)+'</h3>'+(it.desc?'<p class="cx">'+esc(it.desc)+'</p>':'')+form(it,{noHead:1})+'</div></article></li>'}).join('')+'</ul>'}
rail.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(g){setSheet(false);location.hash='#'+g.dataset.go;return}if(e.target.closest('.frx'))setSheet(false,1)});
function inList(){return!document.documentElement.classList.contains('sky-on')}
function place(){/* hybrid: Zoom uses #nowrail; List uses sky.js nowStrip — this frail is backup only */
  rail.hidden=true;if(togBtn)togBtn.hidden=true}
function setSheet(v,user){shown=v;if(user)try{sessionStorage.setItem('pvfb:seen','1')}catch(e){}place()}
function init(data){ITEMS=(data.items||[]).filter(function(i){return i&&i.section});build();
  var hud=$('#shud'),lst=$('#toList');if(hud&&lst&&!togBtn){togBtn=document.createElement('button');togBtn.type='button';togBtn.className='hb o fbtog';togBtn.id='fbtog';togBtn.setAttribute('aria-controls','frail');togBtn.setAttribute('aria-expanded','false');togBtn.innerHTML='✎ New';
    togBtn.addEventListener('click',function(){setSheet(!shown,1)});hud.insertBefore(togBtn,lst)}
  var seen=0;try{seen=sessionStorage.getItem('pvfb:seen')}catch(e){}
  /* hybrid rail owns first look */
  place();new MutationObserver(place).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  addEventListener('hashchange',function(){if(/^#.+\/.+/.test(location.hash)&&!/^#(sky|list)\//.test(location.hash)&&shown)setSheet(false)})}
fetch('previews.json?v='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(init).catch(function(){});


/* ===== Close LOD scrub: frame step + timecode mark for edit feedback ===== */
var FPS=24,SCR={v:null,held:null,jog:0,raf:0};
function pad2(n){n=Math.floor(Math.abs(n));return(n<10?'0':'')+n}
function tc(s){s=Math.max(0,s||0);var m=Math.floor(s/60),sec=Math.floor(s%60),t=Math.floor((s%1)*10);return m+':'+pad2(sec)+'.'+t}
function frameOf(s){return Math.round((s||0)*FPS)}
function markNow(){var v=SCR.v;if(!v)return null;var t=SCR.held!=null?SCR.held:v.currentTime||0;return{t:t,tc:tc(t),frame:frameOf(t),fps:FPS,held:SCR.held!=null}}
function paintScrub(){var v=SCR.v,rail=$('#psrail'),fill=$('#psfill'),head=$('#pshead'),ptc=$('#ptc'),ptd=$('#ptd'),pfrm=$('#pfrm');if(!v||!rail)return;
  var d=v.duration||0,t=v.currentTime||0,x=d?Math.max(0,Math.min(1,t/d)):0;
  if(fill)fill.style.width=(x*100)+'%';if(head)head.style.left=(x*100)+'%';
  if(ptc)ptc.textContent=tc(t);if(ptd)ptd.textContent=tc(d);if(pfrm)pfrm.textContent='f'+frameOf(t);
  rail.setAttribute('aria-valuemax',String(Math.round(d*FPS)));rail.setAttribute('aria-valuenow',String(frameOf(t)));rail.setAttribute('aria-valuetext',tc(t));
  var pb=$('#psplay');if(pb)pb.textContent=v.paused?'▶':'❚❚'}
function seekTo(t,keep){var v=SCR.v;if(!v)return;var d=v.duration||0;t=Math.max(0,Math.min(d?d-1/FPS:t,t));
  try{v.currentTime=t}catch(e){}if(!keep)v.pause();paintScrub()}
function stepFrame(dir){var v=SCR.v;if(!v)return;v.pause();seekTo((v.currentTime||0)+dir/FPS,true);SCR.held=v.currentTime}
function bindScrub(v){SCR.v=v;SCR.held=null;var box=$('#pscrub');if(!box||!v){if(box)box.hidden=true;return}
  box.hidden=false;paintScrub();
  v.addEventListener('timeupdate',paintScrub);v.addEventListener('seeked',paintScrub);v.addEventListener('loadedmetadata',paintScrub);v.addEventListener('play',paintScrub);v.addEventListener('pause',paintScrub);
  function loop(){SCR.raf=0;if(!SCR.v||SCR.v.paused)return;paintScrub();SCR.raf=requestAnimationFrame(loop)}
  v.addEventListener('play',function(){if(!SCR.raf)SCR.raf=requestAnimationFrame(loop)})}
function unbindScrub(){if(SCR.raf)cancelAnimationFrame(SCR.raf);SCR.raf=0;SCR.v=null;SCR.held=null;var box=$('#pscrub');if(box)box.hidden=true}

(function wireScrubUi(){
  var rail=$('#psrail');if(!rail)return;
  function at(e){var r=rail.getBoundingClientRect(),d=(SCR.v&&SCR.v.duration)||0;return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*d}
  var drag=0;
  rail.addEventListener('pointerdown',function(e){if(!SCR.v)return;drag=1;try{rail.setPointerCapture(e.pointerId)}catch(x){}SCR.v.pause();seekTo(at(e),true);SCR.held=SCR.v.currentTime});
  rail.addEventListener('pointermove',function(e){if(!drag||!SCR.v)return;seekTo(at(e),true);SCR.held=SCR.v.currentTime});
  function up(){drag=0}rail.addEventListener('pointerup',up);rail.addEventListener('pointercancel',up);
  rail.addEventListener('keydown',function(e){if(!SCR.v)return;if(e.key==='ArrowLeft'){e.preventDefault();stepFrame(-1)}else if(e.key==='ArrowRight'){e.preventDefault();stepFrame(1)}});
  function hold(btn,dir){var t=0,iv=0;function go(){stepFrame(dir)}btn.addEventListener('pointerdown',function(e){e.preventDefault();go();t=setTimeout(function(){iv=setInterval(go,1000/12)},280)});
    function stop(){clearTimeout(t);clearInterval(iv)};btn.addEventListener('pointerup',stop);btn.addEventListener('pointerleave',stop);btn.addEventListener('pointercancel',stop)}
  var bk=$('#psback'),fw=$('#psfwd'),pl=$('#psplay'),mk=$('#psmark');
  if(bk)hold(bk,-1);if(fw)hold(fw,1);
  if(pl)pl.addEventListener('click',function(){var v=SCR.v;if(!v)return;if(v.paused){SCR.held=null;var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause();paintScrub()});
  if(mk)mk.addEventListener('click',function(){if(!SCR.v)return;SCR.held=SCR.v.currentTime;paintScrub();var m=markNow();status($('.fb')||document.body,m?'Marked '+m.tc+' — Send will include it':'');
    var tip=$('.fbst');if(tip){tip.textContent='Marked '+m.tc;tip.className='fbst ok'}});
  document.addEventListener('keydown',function(e){if($('#player').hidden)return;if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
    if(e.key==='ArrowLeft'){e.preventDefault();stepFrame(-1)}else if(e.key==='ArrowRight'){e.preventDefault();stepFrame(1)}
    else if(e.key===' '&&SCR.v){e.preventDefault();if(SCR.v.paused){SCR.held=null;SCR.v.play()}else SCR.v.pause()}});
})();


/* Swipe on What's new cards: RIGHT = Love, LEFT = Needs work (card chrome only; sky pan untouched) */
var SW={x0:0,y0:0,t0:0,el:null,locked:0};
function swipeTarget(el){return el&&el.closest&&(el.closest('.lstrip')||el.closest('.nowrow > li')||el.closest('.nrc')||el.closest('.frt > li')||el.closest('#player .pstage'))} /* LIVE-SWIPE v1: the strip above a live player (first, so a mouse drag on it works too) */
function flash(el,dir){if(!el)return;el.classList.remove('sw-love','sw-need');void el.offsetWidth;el.classList.add(dir>0?'sw-love':'sw-need')}
function reactFile(file,react,el){if(!file)return;var d=getD(file);d.r=react;var mk=window.PVFB&&PVFB.mark&&PVFB.mark();if(mk){d.mark=mk.tc;if(!d.note)d.note='at '+mk.tc}else if(!d.note)d.note='swipe '+react;setD(file,d);
  $$('.fb').forEach(function(b){if(b.dataset.file===file){sync(b);status(b,react+(mk?' @ '+mk.tc:''),'ok')}});flash(el,react==='Love'?1:-1)}
function applySwipe(el,dir){var react=dir>0?'Love':'Needs work';
  var card=el.closest('.nowrow > li, .frt > li');if(card){var box=$('.fb',card);if(box&&box.dataset.file){reactFile(box.dataset.file,react,card);return}}
  var nrc=el.closest('.nrc');if(nrc&&nrc.dataset.file){reactFile(nrc.dataset.file,react,nrc);return}
  if(el.closest('.lstrip')){var lli=el.closest('li[data-k]'),lbox=lli&&$('.fb',lli);if(lbox&&lbox.dataset.file){reactFile(lbox.dataset.file,react,el);return}} /* LIVE-SWIPE v1 */
  if(el.closest('#player .pstage')){var fb=$('#pfb .fb');if(fb&&fb.dataset.file){reactFile(fb.dataset.file,react,$('#player .pstage'));return}}}
document.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;var t=swipeTarget(e.target);if(!t)return;
  if(e.target.closest('button:not(.nrc),input,a,.psrail,.psbtns,.fb,.push,video,audio')&&!clipSwipe(e.target))return; /* CLIP-SWIPE v1 */
  SW.x0=e.clientX;SW.y0=e.clientY;SW.t0=Date.now();SW.el=t;SW.locked=0},true);
document.addEventListener('pointermove',function(e){if(!SW.el)return;var dx=e.clientX-SW.x0,dy=e.clientY-SW.y0;
  if(!SW.locked){if(Math.abs(dx)<12&&Math.abs(dy)<12)return;if(Math.abs(dy)>Math.abs(dx)){SW.el=null;return}SW.locked=1}
  if(SW.locked){e.preventDefault();SW.el.style.transform='translateX('+(dx*0.35)+'px)';SW.el.style.transition='none'}},{passive:false,capture:true});
function endSwipe(e){if(!SW.el)return;var el=SW.el,dx=(e.clientX!=null?e.clientX:SW.x0)-SW.x0,dy=(e.clientY!=null?e.clientY:SW.y0)-SW.y0,dt=Date.now()-SW.t0;SW.el=null;SW.locked=0;
  el.style.transition='transform .22s ease';el.style.transform='';
  if(Math.abs(dx)>56&&Math.abs(dx)>Math.abs(dy)*1.2&&dt<(el.matches('#player .pstage')?1600:900))applySwipe(el,dx)} /* CLIP-SWIPE v1: a slower deliberate drag across the clip still counts */
document.addEventListener('pointerup',endSwipe,true);
document.addEventListener('pointercancel',function(){if(SW.el){SW.el.style.transform='';SW.el=null;SW.locked=0}},true);

/* CLIP-SWIPE v1 (Oct 19): swipe on the open clip itself (the player video fills .pstage). Right = Love, left = Needs work, the held
   Mark goes with it. The scrub rail, ‹‹ ›› frame step, Mark, ▶ and Note live outside .pstage, so they are untouched. A second finger cancels
   (two-finger pinch still closes the player), and the click after a swipe is swallowed so it can never toggle anything. */
function clipSwipe(t){return !!(t&&t.closest&&t.closest('#player .pstage > video'))}
var SWP={},SWX=0; /* touch pointers down; the first finger of a new touch (isPrimary) starts a fresh count, so a lost pointerup can't stick */
document.addEventListener('pointerdown',function(e){if(e.pointerType!=='touch')return;if(e.isPrimary)SWP={};SWP[e.pointerId]=1;if(Object.keys(SWP).length>1&&SW.el){SW.el.style.transform='';SW.el=null;SW.locked=0}},true);
function swN(e){delete SWP[e.pointerId]}
document.addEventListener('pointerup',swN,true);
document.addEventListener('pointermove',function(){if(SW.locked&&SW.el&&SW.el.matches('#player .pstage'))SWX=Date.now()},true);
document.addEventListener('pointercancel',swN,true);
document.addEventListener('click',function(e){if(Date.now()-SWX<400&&e.target.closest&&e.target.closest('#player .pstage')){e.preventDefault();e.stopPropagation()}},true);

window.PVFB={form:form,mark:markNow,stepFrame:stepFrame,
  mountPlayer:function(it){var m=$('#pfb'),v=$('#player video');
    if(!it||!it.file||it.badge!=='Latest'){if(m){m.hidden=true;m.innerHTML=''}unbindScrub();return}
    if(m){m.hidden=false;m.innerHTML=form(it,{noHead:1})}
    if(v)bindScrub(v)},
  unmountPlayer:function(){unbindScrub()}};
})();
