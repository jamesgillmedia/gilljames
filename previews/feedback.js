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
function setD(f,d){try{if(!d.r&&!d.note&&!d.tune)localStorage.removeItem(KEY+f);else localStorage.setItem(KEY+f,JSON.stringify(d))}catch(e){}}
function when(iso){try{var d=new Date(iso);return new Intl.DateTimeFormat('en-US',{timeZone:TZ,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(d)}catch(e){return iso||''}}
/* NOTE-TC v1 (Oct 19): the note prefill is 'at m:ss.s ' WITH a trailing space, so typing goes after it ('at 0:36.6 horse').
   Every reaction tap, swipe, Mark and Send rewrites only that leading 'at m:ss.s' token to the current frame and keeps anything typed
   after it. A note that does not start with the token is the user's own words and is never touched (the At: line still carries the time). */
var TCLEAD=/^at \d+:\d{2}\.\d(?![\d:.])[ \t]*/,AUTOSW=/^swipe (Love|Needs work)$/;
function retc(note,t){if(!note||AUTOSW.test(note))return'at '+t+' ';var m=TCLEAD.exec(note);return m?'at '+t+' '+note.slice(m[0].length):note}
function caretEnd(i){try{var n=i.value.length;i.setSelectionRange(n,n)}catch(e){}}
function freshen(box){var mk=window.PVFB&&PVFB.mark&&PVFB.mark();if(!box||!mk)return;var f=keyOf(box),d=getD(f);if(!d.r&&!d.note)return;
  var n=d.note?retc(d.note,mk.tc):d.note;if(n===d.note&&d.mark===mk.tc)return;d.note=n;d.mark=mk.tc;setD(f,d);sync(box);$$('.fb input').forEach(function(i){if(document.activeElement===i)caretEnd(i)})}
function nowStr(){var d=new Date(),v='';try{v=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,dateStyle:'medium',timeStyle:'short'}).format(d)+' Vancouver'}catch(e){}return d.toISOString()+(v?' ('+v+')':'')}

function keyOf(itOrBox){if(!itOrBox)return'';if(itOrBox.dataset)return itOrBox.dataset.id||itOrBox.dataset.file||'';return itOrBox.id||itOrBox.file||''}
function form(it,o){o=o||{};var f=it.file||'',kid=it.id||'',k=kid||f,d=getD(k),id='fb'+Math.random().toString(36).slice(2,7);
  return'<div class="fb" data-file="'+esc(f)+'" data-id="'+esc(kid)+'" data-title="'+esc(it.title||'')+'" data-time="'+esc(it.time||'')+'">'+(o.noHead?'':'<p class="fbh">Your feedback</p>')+
  '<div class="fbr" role="group" aria-label="Reaction to '+esc(it.title||'this preview')+'">'+REACT.map(function(r){return'<button type="button" class="fbb" data-r="'+r[0]+'" aria-pressed="'+(d.r===r[0])+'"><i aria-hidden="true">'+r[1]+'</i>'+r[0]+'</button>'}).join('')+'</div>'+
  '<div class="fbn"><input type="text" id="'+id+'" maxlength="300" enterkeyhint="send" autocomplete="off" autocapitalize="sentences" placeholder="one line for Artist Agent…" aria-label="One line of feedback for '+esc(it.title||'this preview')+'" value="'+esc(d.note||'')+'"><button type="button" class="fbs">Send</button></div>'+
  '<div class="fbx"><button type="button" class="fbc">Copy</button><span class="fbst" role="status" aria-live="polite"></span></div>'+
  tuneDetHtml(d)+
  '<details class="fbmore"><summary>More feedback (next)</summary><div class="fbnext" aria-disabled="true">'+
  '<button type="button" class="fnx" disabled title="Coming next">hold ♪ voice</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">A / B</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">Keep going</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">Try another</button>'+
  '<button type="button" class="fnx" disabled title="Coming next">Ship it</button>'+
  '<span class="fnemoji" title="Coming next">★ ✎ ✕</span></div></details></div>'}

function compose(box){var f=box.dataset.file,k=keyOf(box),d=getD(k),t=box.dataset.title,mark=window.PVFB&&PVFB.mark&&PVFB.mark(),
  anchor=box.dataset.id||(function(){var it=ITEMS.filter(function(i){return (box.dataset.id&&i.id===box.dataset.id)||(f&&i.file===f)})[0];return it? (it.id||(it.section+'/'+(it.id||stem(f)))) :''})(),
  page=(BASE.replace(/\/?$/,'/'))+'#'+anchor,
  body=['Preview: '+t,'Reaction: '+(d.r||'(none)'),'Note: '+(d.note||'(none)'),
  mark?('At: '+mark.tc+' (frame '+mark.frame+' @ '+mark.fps+'fps)'+(mark.held?' · marked':' · playhead')):null,
  f?('Item file: '+fileUrl(f)):null,'Card: '+page,'Page: '+page,
  box.dataset.time?'Item posted: '+box.dataset.time:'',tuneBlock(d,page),'Sent: '+nowStr()].filter(Boolean).join('\n'),subject='Preview feedback: '+t+(mark?' @ '+mark.tc:'');
  return{subject:subject,body:body}}
function tuneBlock(d,page){if(!d.tune||!d.tune.url)return null;var js;try{js=JSON.stringify(d.tune.state||d.tune)}catch(e){js='{}'}
  return 'Tune\nCard: '+(d.tune.anchor||page)+'\n'+js+'\nReopen: '+d.tune.url}
function tuneDetHtml(d){if(!d||!d.tune||!d.tune.url)return'';
  return '<details class="tunedet"><summary>Details</summary><a href="'+esc(d.tune.url)+'">Open these settings</a></details>'}
function showTuneDet(box,d){if(!box)return;var el=$('.tunedet',box);
  if(!d||!d.tune||!d.tune.url){if(el)el.remove();return}
  if(!el){el=document.createElement('details');el.className='tunedet';var more=$('.fbmore',box);if(more)box.insertBefore(el,more);else box.appendChild(el)}
  el.innerHTML='<summary>Details</summary><a href="'+esc(d.tune.url)+'">Open these settings</a>'}
function status(box,msg,cls){var s=$('.fbst',box);if(s){s.textContent=msg;s.className='fbst'+(cls?' '+cls:'')}}
function sameKey(a,b){return keyOf(a)===keyOf(b)}
function sync(box,skipInput){var k=keyOf(box),d=getD(k);$$('.fb').forEach(function(b){if(keyOf(b)!==k)return;
  $$('.fbb',b).forEach(function(x){x.setAttribute('aria-pressed',String(d.r===x.dataset.r))});var i=$('input',b);if(i&&i!==skipInput&&i.value!==(d.note||''))i.value=d.note||''})}
function ok(box){var d=getD(keyOf(box));if(!d.r&&!d.note&&!d.tune){status(box,'Tap Love, Needs work or Note, or type a line first.','warn');return false}return true}
function send(box){freshen(box);if(!ok(box))return;var m=compose(box),url='mailto:'+TO+'?subject='+encodeURIComponent(m.subject)+'&body='+encodeURIComponent(m.body);
  status(box,'Opening your mail app… hit send there. If nothing opens, tap Copy.','ok');var a=document.createElement('a');a.href=url;a.style.display='none';document.body.appendChild(a);a.click();a.remove()}
function copy(box){freshen(box);if(!ok(box))return;var m=compose(box),txt='To: '+TO+'\nSubject: '+m.subject+'\n\n'+m.body;
  function done(){status(box,'Copied. Paste it into an email to '+TO,'ok')}
  function fb(){var t=document.createElement('textarea');t.value=txt;t.setAttribute('readonly','');t.style.cssText='position:fixed;left:-9999px;top:0;font-size:16px';document.body.appendChild(t);t.select();t.setSelectionRange(0,txt.length);var r=false;try{r=document.execCommand('copy')}catch(e){}t.remove();r?done():status(box,'Could not copy. Long-press the note and copy it by hand.','warn')}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,fb);else fb()}

document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.fb button');if(!b)return;var box=b.closest('.fb'),f=keyOf(box);
  if(b.classList.contains('fbb')){var d=getD(f);d.r=d.r===b.dataset.r?'':b.dataset.r;var mk=window.PVFB&&PVFB.mark&&PVFB.mark();if(d.r&&mk){d.mark=mk.tc;d.note=retc(d.note,mk.tc)} /* NOTE-TC v1 */setD(f,d);sync(box);status(box,mk&&d.r?('Marked '+mk.tc):'');if(d.r==='Note'){var i=$('input',box);if(i){i.focus();caretEnd(i)}}}
  else if(b.classList.contains('fbs'))send(box);else if(b.classList.contains('fbc'))copy(box)});
document.addEventListener('input',function(e){var i=e.target;if(!i.closest||!i.closest('.fb')||i.tagName!=='INPUT')return;var box=i.closest('.fb'),f=keyOf(box),d=getD(f);d.note=i.value;setD(f,d);sync(box,i);status(box,'')});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.closest&&e.target.closest('.fb')&&e.target.tagName==='INPUT'){e.preventDefault();send(e.target.closest('.fb'))}});

/* sky mode: a small "What's new" sheet so feedback is still one tap away from the constellation */
var rail=document.createElement('section'),togBtn=null,shown=false;rail.className='frail sheet';rail.id='frail';rail.hidden=true;rail.setAttribute('aria-label','What\'s new: leave feedback');
function pick(){return ITEMS.filter(function(i){return i.tier==='now'})}
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
  if(mk)mk.addEventListener('click',function(){if(!SCR.v)return;SCR.held=SCR.v.currentTime;paintScrub();var m=markNow();freshen($('#pfb .fb')); /* NOTE-TC v1 */status($('.fb')||document.body,m?'Marked '+m.tc+' — Send will include it':'');
    var tip=$('.fbst');if(tip){tip.textContent='Marked '+m.tc;tip.className='fbst ok'}});
  document.addEventListener('keydown',function(e){if($('#player').hidden)return;if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
    if(e.key==='ArrowLeft'){e.preventDefault();stepFrame(-1)}else if(e.key==='ArrowRight'){e.preventDefault();stepFrame(1)}
    else if(e.key===' '&&SCR.v){e.preventDefault();if(SCR.v.paused){SCR.held=null;SCR.v.play()}else SCR.v.pause()}});
})();


/* Swipe on What's new cards: RIGHT = Love, LEFT = Needs work (card chrome only; sky pan untouched) */
var SW={x0:0,y0:0,t0:0,el:null,locked:0};
function swipeTarget(el){return el&&el.closest&&(el.closest('.lstrip')||el.closest('.nowrow > li')||el.closest('.clist > li')||el.closest('.nrc')||el.closest('.frt > li')||el.closest('#player .pstage'))} /* LIVE-SWIPE v1: the strip above a live player (first, so a mouse drag on it works too) */
function flash(el,dir){if(!el)return;el.classList.remove('sw-love','sw-need');void el.offsetWidth;el.classList.add(dir>0?'sw-love':'sw-need')}
function reactFile(file,react,el){if(!file)return;var d=getD(file);d.r=react;var mk=window.PVFB&&PVFB.mark&&PVFB.mark();if(mk){d.mark=mk.tc;d.note=retc(d.note,mk.tc)}else if(!d.note||AUTOSW.test(d.note))d.note='swipe '+react; /* NOTE-TC v1 */setD(file,d);
  $$('.fb').forEach(function(b){if(keyOf(b)===file){sync(b);status(b,react+(mk?' @ '+mk.tc:''),'ok')}});flash(el,react==='Love'?1:-1)}
function applySwipe(el,dir){var react=dir>0?'Love':'Needs work';
  var card=el.closest('.nowrow > li, .frt > li, .clist > li');if(card){var box=$('.fb',card);if(box&&keyOf(box)){reactFile(keyOf(box),react,card);return}}
  var nrc=el.closest('.nrc');if(nrc&&(nrc.dataset.id||nrc.dataset.file)){reactFile(nrc.dataset.id||nrc.dataset.file,react,nrc);return}
  if(el.closest('.lstrip')){var lli=el.closest('li'),lbox=lli&&$('.fb',lli);if(lbox&&keyOf(lbox)){reactFile(keyOf(lbox),react,el);return}} /* LIVE-SWIPE v1 */
  if(el.closest('#player .pstage')){var fb=$('#pfb .fb');if(fb&&keyOf(fb)){reactFile(keyOf(fb),react,$('#player .pstage'));return}}}
document.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;var t=swipeTarget(e.target);if(!t)return;
  if(e.target.closest('button:not(.nrc),input,a,.psrail,.psbtns,.fb,.push,video,audio')&&!clipSwipe(e.target))return; /* CLIP-SWIPE v1 */
  SW.x0=e.clientX;SW.y0=e.clientY;SW.t0=Date.now();SW.e0=e.timeStamp;SW.el=t;SW.locked=0},true);
document.addEventListener('pointermove',function(e){if(!SW.el)return;var dx=e.clientX-SW.x0,dy=e.clientY-SW.y0;
  if(!SW.locked){if(Math.abs(dx)<12&&Math.abs(dy)<12)return;if(Math.abs(dy)>Math.abs(dx)){SW.el=null;return}SW.locked=1}
  if(SW.locked){e.preventDefault();SW.el.style.transform='translateX('+(dx*0.35)+'px)';SW.el.style.transition='none'}},{passive:false,capture:true});
function endSwipe(e){if(!SW.el)return;var el=SW.el,dx=(e.clientX!=null?e.clientX:SW.x0)-SW.x0,dy=(e.clientY!=null?e.clientY:SW.y0)-SW.y0,dt=(e.timeStamp&&SW.e0?e.timeStamp-SW.e0:Date.now()-SW.t0);SW.el=null;SW.locked=0;
  el.style.transition='transform .22s ease';el.style.transform='';
  if(Math.abs(dx)>56&&Math.abs(dx)>Math.abs(dy)*1.2&&dt<1600)applySwipe(el,dx)} /* SWIPE-TIME v1 (Oct 19): one 1.6 s limit for every target, timed by the finger's own event times, so a first swipe that the phone is slow to draw is not dropped */ /* CLIP-SWIPE v1: a slower deliberate drag across the clip still counts */
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

function boardFeedbackPayload(){var drafts={},i,k,d,id,seen={},cards=[],love=[],archive=[],notes={},marks={},tune={};
  try{for(i=0;i<localStorage.length;i++){k=localStorage.key(i);if(k&&k.indexOf(KEY)===0){try{drafts[k.slice(KEY.length)]=JSON.parse(localStorage.getItem(k))||{}}catch(e){}}}}catch(e){}
  function anchorOf(cid){return (BASE.replace(/\/?$/,'/'))+'#'+cid}
  function add(cid,title){if(!cid||seen[cid])return;seen[cid]=1;d=drafts[cid]||{};
    cards.push({id:cid,title:title||'',anchor:anchorOf(cid),love:d.r==='Love',archive:d.r==='Archive',reaction:d.r||'',note:d.note||'',mark:d.mark||'',tune:d.tune||null});
    if(d.r==='Love')love.push(cid);if(d.r==='Archive')archive.push(cid);if(d.note)notes[cid]=d.note;if(d.mark)marks[cid]=d.mark;
    if(d.tune&&d.tune.url)tune[cid]={state:d.tune.state||null,url:d.tune.url,anchor:d.tune.anchor||anchorOf(cid)}}
  (ITEMS||[]).forEach(function(it){var cid=it.id||it.file;if(cid)add(cid,it.title||'')});
  Object.keys(drafts).forEach(function(cid){add(cid,'')});
  return {v:1,cards:cards,love:love,archive:archive,notes:notes,marks:marks,tune:tune}}
window.boardFeedbackPayload=boardFeedbackPayload;

/* Tune this: a same-origin sheet. Send settings writes the drawer state onto that card's draft, so Copy and Send carry it. */
var tuneSheet=null,tuneCard='',tuneWait=0;
function tuneNote(msg){var s=tuneSheet&&$('.tunest',tuneSheet);if(s)s.textContent=msg||''}
function tuneFrame(){var f=$('iframe',tuneSheet);if(f)return f;f=document.createElement('iframe');f.className='tuneframe';f.title='Tune the page';
  var bar=$('.tunebar',tuneSheet);tuneSheet.insertBefore(f,bar);return f}
function closeTune(){if(tuneWait){clearTimeout(tuneWait);tuneWait=0}if(!tuneSheet)return;tuneSheet.hidden=true;var f=$('iframe',tuneSheet);if(f)f.remove();document.documentElement.classList.remove('tune-open')}
function openTune(btn){var src=btn.getAttribute('data-tune');if(!src)return;tuneCard=btn.getAttribute('data-card')||'';
  if(!tuneSheet){tuneSheet=document.createElement('div');tuneSheet.className='tunesheet';tuneSheet.setAttribute('role','dialog');tuneSheet.setAttribute('aria-modal','true');tuneSheet.setAttribute('aria-label','Tune this');
    tuneSheet.innerHTML='<div class="tunebar"><button type="button" class="tunex">Close</button><button type="button" class="tunesend">Send settings</button><span class="tunest" role="status"></span></div>';
    document.body.appendChild(tuneSheet);
    $('.tunex',tuneSheet).addEventListener('click',closeTune);
    $('.tunesend',tuneSheet).addEventListener('click',sendSettings)}
  var f=tuneFrame(),url;try{url=new URL(src,location.href).href}catch(e){url=src}
  f.src=url;tuneSheet.hidden=false;document.documentElement.classList.add('tune-open');tuneNote('')}
function boxFor(id){var boxes=$$('.fb'),i;for(i=0;i<boxes.length;i++)if(keyOf(boxes[i])===id)return boxes[i];return null}
function sendSettings(){var f=tuneSheet&&$('iframe',tuneSheet);if(!f||!f.contentWindow){tuneNote('Try again.');return}
  var id=tuneCard,anchor=(BASE.replace(/\/?$/,'/'))+'#'+id;
  function apply(msg){if(tuneWait){clearTimeout(tuneWait);tuneWait=0}var d=getD(id);d.tune={state:msg.state,url:msg.url,anchor:anchor};setD(id,d);
    var box=boxFor(id);if(box){sync(box);showTuneDet(box,d);status(box,'Settings saved to this card','ok');var st=$('.fbst',box);if(st){try{st.scrollIntoView({block:'center'})}catch(e){}}}
    closeTune()}
  function onMsg(e){if(e.origin!==location.origin)return;var msg=e.data;if(!msg||msg.type!=='gj-tune-state'||!msg.url||!msg.state)return;removeEventListener('message',onMsg);apply(msg)}
  addEventListener('message',onMsg);
  try{f.contentWindow.postMessage({type:'gj-tune-get'},location.origin)}catch(e){}
  tuneWait=setTimeout(function(){removeEventListener('message',onMsg);tuneNote('Try again.')},4000)}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.tunebtn');if(!b)return;e.preventDefault();e.stopPropagation();openTune(b)},true);

window.PVFB={form:form,mark:markNow,stepFrame:stepFrame,keyOf:keyOf,
  mountPlayer:function(it){var m=$('#pfb'),v=$('#player video');
    if(!it||!it.file||!(it.tier==='now'||it.badge==='Latest')||it.tier==='earlier'||it.tier==='related'){if(m){m.hidden=true;m.innerHTML=''}unbindScrub();return}
    if(m){m.hidden=false;m.innerHTML=form(it,{noHead:1})}
    if(v)bindScrub(v)},
  unmountPlayer:function(){unbindScrub()}};
})();
