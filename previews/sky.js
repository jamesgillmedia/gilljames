/* Gill James · previews as one sky (adapted from the site v3.1 constellation sheet).
   Everything comes from previews.json. One camera on one sheet:
     L0  the whole sky: ᑕᐣᓯ in the middle, one labelled constellation per section (sub-constellations for "v3.1"-style titles),
         newest poster beside each, Latest / Current direction as highlighted stars
     L1  a constellation: as the camera flies in, its stars travel along the constellation lines and grow into posters (newest brightest);
         the frame (top and bottom captions) carries the section and the item in the middle of the view
     L2  the section's cards (the list's card design, native vertical scrolling); the posters travel into the cards, then hand over
     L3  one card pushed in to a full-viewport player
   Pinch (continuous on the sky, acted on at release elsewhere), tap, + / −, keyboard, back button, hash deep links
   (#reel-v7 = that section's cards, #sky/<group>, #reel-v7/<file stem> = player, #list = the plain list). */
(function(){
'use strict';
var D=document.documentElement,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var TZ='America/Vancouver',RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};function anim(){return !RM.matches}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(d,o){return new Intl.DateTimeFormat(o.l||'en-US',Object.assign({timeZone:TZ},o.f)).format(d)}
function when(iso){if(!iso)return'';var d=new Date(iso);if(isNaN(d))return esc(iso);
  try{return fmt(d,{l:'en-CA',f:{weekday:'short',month:'short',day:'numeric'}}).replace(/\./g,'')+' · '+fmt(d,{f:{hour:'numeric',minute:'2-digit',timeZoneName:'short'}})}catch(e){return d.toISOString()}}
function shortT(iso){if(!iso)return'coming';var d=new Date(iso);if(isNaN(d))return'';try{return fmt(d,{f:{weekday:'short'}})+' '+fmt(d,{f:{hour:'numeric',minute:'2-digit'}})}catch(e){return''}}
function stem(f){return String(f||'').split('/').pop().replace(/\.[^.]+$/,'')}

/* ================= data ================= */
var DATA,SECS=[],SBY={},ITEMS=[],GROUPS=[],GBY={};
function prep(data){DATA=data;var seen={};
  (data.sections||[]).forEach(function(s){if(s&&s.id&&!seen[s.id]){seen[s.id]=1;SECS.push({id:s.id,title:s.title||s.id})}});
  (data.items||[]).forEach(function(it){if(it&&it.section&&!seen[it.section]){seen[it.section]=1;SECS.push({id:it.section,title:it.section})}}); /* future sections show up even before sections[] lists them */
  var arr=(data.items||[]).filter(function(it){return it&&it.section}).map(function(it,i){return{it:it,i:i}});
  arr.sort(function(a,b){var ta=a.it.time?Date.parse(a.it.time):Infinity,tb=b.it.time?Date.parse(b.it.time):Infinity;return ta===tb?a.i-b.i:tb-ta}); /* newest first, undated (coming) on top, ties keep JSON order */
  ITEMS=arr.map(function(x,k){var it=x.it;return{d:it,k:k,sec:it.section,stem:it.id||stem(it.file)||('item-'+x.i),title:it.title||'',time:it.time,type:it.type,badge:it.badge||null,poster:it.poster||null}});
  SECS.forEach(function(s,si){s.si=si;s.items=ITEMS.filter(function(x){return x.sec===s.id});s.n=s.items.filter(function(x){return x.type!=='placeholder'}).length;SBY[s.id]=s;
    var base={id:s.id,sec:s,title:s.title,sub:null,items:[]},subs={};
    s.items.forEach(function(x){var m=/^v(\d+\.\d+)\b/i.exec(x.title);var g=base;if(m){var key='v'+m[1];g=subs[key]||(subs[key]={id:s.id+'--'+key.replace(/\W/g,'-'),sec:s,title:key,sub:key,items:[]})}g.items.push(x);x.g=g});
    s.groups=[];if(base.items.length||!Object.keys(subs).length)s.groups.push(base);Object.keys(subs).sort().reverse().forEach(function(k){s.groups.push(subs[k])})});
  /* stable ids: if the base group is empty the section's first group still answers to the section id */
  SECS.forEach(function(s){s.groups.forEach(function(g){GROUPS.push(g);GBY[g.id]=g});s.main=s.groups[0]});}

/* ================= cards (the list's design) ================= */
function isNow(x){return !!(x&&(x.badge==='Latest'||(x.d&&x.d.tier==='now')))}
function isRelated(x){return !!(x&&x.d&&x.d.tier==='related')}
function streamTitle(id){var s=SBY[id];return s?s.title:id}
function card(x){var it=x.d,cls=[it.badge==='Current direction'?'cur':'',it.type==='placeholder'?'ph':''].join(' ').trim();
  var h='<li data-k="'+x.k+'"'+(cls?' class="'+cls+'"':'')+'><article class="card">';
  if(it.type==='video'&&it.file)h+='<div class="vbox"><video controls playsinline preload="metadata"'+(it.poster?' poster="'+esc(it.poster)+'"':'')+' src="'+esc(it.file)+'"></video><button type="button" class="push" aria-label="Play large: '+esc(it.title)+'">⤢</button></div>';
  if(it.type==='audio'&&it.file)h+='<audio controls preload="metadata" src="'+esc(it.file)+'"></audio>';
  if(it.type==='live')h+=liveBox(it);
  h+='<div class="cb"><div class="meta">';
  if(it.time)h+='<time class="when" datetime="'+esc(it.time)+'">'+when(it.time)+'</time>';
  if(it.type==='audio')h+='<span class="kind">audio</span>';if(it.type==='placeholder')h+='<span class="kind">coming</span>';
  if(it.badge)h+='<span class="badge">'+esc(it.badge)+'</span>';
  h+='</div><h3 class="ct">'+esc(it.title)+'</h3>';if(it.desc)h+='<p class="cx">'+esc(it.desc)+'</p>';
  if(it.link&&it.link.href)h+='<a class="btn" href="'+esc(it.link.href)+'" target="_blank" rel="noopener">'+esc(it.link.label||'Open')+' <span aria-hidden="true">↗</span></a>';
  if(it.file&&it.type!=='live')h+='<span class="file"><a href="'+esc(it.file)+'" download>'+esc(it.file.split('/').pop())+'</a></span>';
  if(it.file&&it.badge==='Latest'&&window.PVFB)h+=PVFB.form(it);
  return h+'</div></article></li>'}
function band(s,asList){var nows=s.items.filter(isNow),rels=s.items.filter(isRelated),rest=s.items.filter(function(x){return !isNow(x)&&!isRelated(x)});
  var body='';
  if(nows.length)body+='<p class="relh">What\'s new</p><ol class="tline nowline">'+nows.map(card).join('')+'</ol>';
  if(rels.length)body+='<p class="relh">Related</p><ol class="tline">'+rels.map(card).join('')+'</ol>';
  if(rest.length)body+='<p class="relh">'+(s.id==='archive'?'Archive':'More')+'</p><ol class="tline muted">'+rest.map(card).join('')+'</ol>';
  if(!body)body='<ol class="tline">'+s.items.map(card).join('')+'</ol>';
  return'<section class="band"'+(asList?' id="'+esc(s.id)+'"':' data-sec="'+esc(s.id)+'"')+'><h2 class="bh"><span class="L">'+(s.si+1)+'</span>'+esc(s.title)+'</h2>'+
  '<span class="mnote">'+s.n+' preview'+(s.n===1?'':'s')+(asList?'':' · pinch out or \u2212 to pull back')+'</span>'+body+'</section>'}
function wire(root){$$('video',root).forEach(function(v){v.addEventListener('loadedmetadata',function(){if(v.videoWidth&&v.videoHeight)v.style.setProperty('--ar',v.videoWidth+'/'+v.videoHeight)})})}
function kill(root){$$('video,audio',root).forEach(function(m){try{m.pause();m.removeAttribute('src');m.load()}catch(e){}})}
/* one media plays at a time, everywhere */
document.addEventListener('play',function(e){$$('video,audio').forEach(function(o){if(o!==e.target&&!o.paused)o.pause()})},true);
function byK(k){return ITEMS[+k]}

/* ================= BOARD-AB v1 (Oct 19) =================
   - What's new shows every stream in sections[] order (not a fixed sound/site/reel), and EVERY Now item in a stream,
     so an A/B pair (Site today vs yesterday) sits side by side. Each Now card and the player caption show the item's link.
   - type "live": a real page (same origin) in a sandboxed iframe. Poster + tap to load keeps the board light; the iframe
     gets its own gestures (chimes swipe), so Love / Needs work is a swipe on the strip above it (feedback.js LIVE-SWIPE v1). */
function streamOrder(){return SECS.filter(function(s){return s.id!=='archive'}).map(function(s){return s.id})}
function linkBtn(it){return it.link&&it.link.href?'<a class="btn nlink" href="'+esc(it.link.href)+'" target="_blank" rel="noopener">'+esc(it.link.label||'Open')+' <span aria-hidden="true">↗</span></a>':''}
function liveBox(it){var bg=it.poster?' style="background-image:url(\''+esc(it.poster)+'\')"':'';
  return'<div class="lbox" data-src="'+esc(it.src||it.file||'')+'" data-title="'+esc(it.title||'')+'"><div class="lstrip" aria-hidden="true"><span>‹ Needs work</span><b>swipe here</b><span>Love ›</span></div>'+
    '<div class="lframe"><button type="button" class="lload"'+bg+' aria-label="Load the live player: '+esc(it.title||'')+'"><b>▶ Tap to load the live player</b></button></div></div>'}
function loadLive(li){var b=li&&$('.lbox',li);if(!b)return null;var f=$('iframe',b);if(f)return f;var fr=$('.lframe',b);
  f=document.createElement('iframe');f.src=b.dataset.src;f.title=b.dataset.title||'live preview';f.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups');
  f.setAttribute('allow','autoplay; fullscreen');f.setAttribute('loading','eager');var keep=fr.innerHTML;fr.innerHTML='';fr.appendChild(f);
  /* scrolled out of view for 1.5 s (or its list/grid closed) -> back to the poster: no sound playing off screen, no hidden canvas eating the phone */
  if('IntersectionObserver' in window){var tm=0,io=new IntersectionObserver(function(es){var v=es[es.length-1].isIntersecting;clearTimeout(tm);
    if(!v)tm=setTimeout(function(){io.disconnect();if(f.parentNode===fr)fr.innerHTML=keep},1500)});io.observe(fr)}
  return f}
function openLive(x){var li=$('li[data-k="'+x.k+'"]',list),vis=li&&!list.hidden&&li.getClientRects().length;
  if(!vis){li=$('li[data-k="'+x.k+'"]',grid);vis=li&&!grid.hidden&&li.getClientRects().length}
  if(!vis){if(open&&x.g)dive(x.g.sec,x,{});return}
  loadLive(li);try{li.scrollIntoView({block:'nearest',inline:'center'})}catch(e){}
  /* the live card is tall: put its top (the swipe strip) just under the top bar, never under it */
  if(grid.contains(li))grid.scrollTop=Math.max(0,li.offsetTop-70);else{var y=li.getBoundingClientRect().top+scrollY-90;scrollTo(0,Math.max(0,y))}}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.lload');if(!b)return;e.preventDefault();loadLive(b.closest('li')||b.closest('.lbox').parentNode)});
(function(){var st=document.createElement('style');st.textContent=
  '.lbox{display:flex;flex-direction:column;border-radius:10px;overflow:hidden;background:#03050a}'+
  '.lstrip{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:40px;padding:0 12px;font:300 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;color:#93a1a6;background:rgba(85,218,161,.08);border-bottom:1px dashed rgba(85,218,161,.35);touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab}'+
  '.lstrip b{font-weight:400;color:#55DAA1;text-transform:uppercase}'+
  '.lframe{position:relative;width:100%;aspect-ratio:9/16;max-height:min(70svh,640px)}'+
  '.lframe iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#03050a}'+
  '.lload{position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;cursor:pointer;background:#03050a center/cover no-repeat;color:#fff;display:flex;align-items:flex-end;justify-content:center}'+
  '.lload b{margin:0 0 18px;padding:10px 16px;border-radius:22px;background:rgba(3,5,10,.78);border:1px solid rgba(85,218,161,.6);font:300 12px/1 ui-monospace,Menlo,monospace;letter-spacing:.06em}'+
  '.nowrow .btn.nlink{align-self:flex-start;margin:8px 0 2px}'+
  '.pcap .plink{display:inline-block;margin-top:2px;font:300 11px/1.3 ui-monospace,Menlo,monospace;color:#55DAA1;text-decoration:none}';
  document.head.appendChild(st)})();

/* ================= list mode ================= */
var list=$('#list'),jump=$('#jump'),foot=$('#foot');
function miniCard(x){var it=x.d,bg=it.poster?' style="background-image:url(\''+esc(it.poster)+'\')"':'';
  return'<li data-k="'+x.k+'"><button type="button" class="relc"'+bg+' data-go="'+esc(x.sec+'/'+x.stem)+'" aria-label="Open: '+esc(it.title)+'"><span class="relt">'+esc(it.title)+'</span></button></li>'}
function nowStrip(){var order=streamOrder(),cards=[];
  order.forEach(function(id){var sec=SBY[id];if(!sec)return;sec.items.filter(isNow).forEach(function(x){
    var it=x.d,h='<li data-k="'+x.k+'" class="now"><article class="card"><span class="stream-tag">'+esc(sec.title)+'</span>';
    if(it.type==='video'&&it.file)h+='<div class="vbox"><video controls playsinline preload="metadata"'+(it.poster?' poster="'+esc(it.poster)+'"':'')+' src="'+esc(it.file)+'"></video><button type="button" class="push" aria-label="Play large: '+esc(it.title)+'">⤢</button></div>';
    if(it.type==='audio'&&it.file)h+='<audio controls preload="metadata" src="'+esc(it.file)+'"></audio>';
    if(it.type==='live')h+=liveBox(it);
    h+='<div class="cb"><div class="meta">'+(it.time?'<time class="when" datetime="'+esc(it.time)+'">'+when(it.time)+'</time>':'')+'<span class="badge">Latest</span></div><h3 class="ct">'+esc(it.title)+'</h3>'+(it.desc?'<p class="cx clamp">'+esc(it.desc)+'</p>':'');
    h+=linkBtn(it);if(window.PVFB)h+=PVFB.form(it);h+='</div></article></li>';cards.push(h)})});
  if(!cards.length)return'';
  return'<section class="now" id="now" aria-label="What is new"><div class="nowh"><h2>What\'s new</h2><nav class="chips" aria-label="Streams">'+
    order.filter(function(id){return SBY[id]&&SBY[id].items.some(isNow)}).map(function(id){return'<a class="chip" href="#list/'+esc(id)+'">'+esc(SBY[id].title)+'</a>'}).join('')+
    '</nav></div><ol class="nowrow">'+cards.join('')+'</ol></section>'}
function streamBand(s){var related=s.items.filter(isRelated);
  var h='<section class="band stream" id="'+esc(s.id)+'"><h2 class="bh"><span class="L">'+(s.si+1)+'</span>'+esc(s.title)+'</h2>';
  if(related.length)h+='<p class="relh">Related</p><ul class="relrow">'+related.map(miniCard).join('')+'</ul>';
  else h+='<span class="mnote">What\'s new is up top</span>';
  return h+'</section>'}
function archiveBand(s){return'<section class="band archive" id="archive"><details class="arch"><summary class="bh"><span class="L">'+(s.si+1)+'</span>Archive <small>'+s.n+' older</small></summary><ol class="tline muted">'+s.items.map(card).join('')+'</ol></details></section>'}
function renderList(){var latest=0;ITEMS.forEach(function(x){if(x.time)latest=Math.max(latest,Date.parse(x.time))});
  jump.innerHTML='<a href="#now">What\'s new</a>'+SECS.map(function(s){return'<a href="#list/'+esc(s.id)+'">'+esc(s.title)+'</a>'}).join('');
  var body=nowStrip();SECS.forEach(function(sec){if(sec.id==='archive')body+=archiveBand(sec);else body+=streamBand(sec)});
  list.innerHTML=body;wire(list);
  list.onclick=function(e){var g=e.target.closest&&e.target.closest('[data-go]');if(!g)return;var p=g.dataset.go.split('/'),sec=SBY[p[0]],x=sec&&sec.items.filter(function(i){return i.stem===p[1]})[0];if(x){e.preventDefault();openPlayer(x)}};
  if(latest)foot.textContent='newest preview '+when(new Date(latest).toISOString())+' · times are Vancouver time'}

/* ================= the sky ================= */
var sky=$('#sky'),cv=$('canvas',sky),ctx=null,slabs=$('.slabs',sky),hud=$('#shud'),bar=$('#sbar'),crumb=$('#crumb'),zn=$('#zn'),dots=$('#dots'),zin=$('#zin'),zout=$('#zout'),
  fcapT=$('#fcapT'),fcapB=$('#fcapB'),hint=$('#shint'),grid=$('#grid'),player=$('#player'),pv=$('video',player);
try{ctx=cv.getContext('2d')}catch(e){ctx=null}
var W=0,H=0,dpr=1,TOP=52,BOT=66,VH=600,VC=300;
var U=.22,PX=124,PY=104,TW=104,TH=58.5; /* L1 frame layout in "frame units"; world = frame * U */
function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function layoutWorld(){var active=SECS.filter(function(s){return s.groups.length&&s.id!=='archive'}),arch=SECS.filter(function(s){return s.id==='archive'&&s.groups.length});
  var bases=active,NS=bases.length,R=NS<2?0:118+8*NS;
  bases.forEach(function(s,si){var a=(-90+si*360/NS)*Math.PI/180,cx=Math.cos(a)*R,cy=Math.sin(a)*R;
    s.groups.forEach(function(g,gi){var off=(gi-(s.groups.length-1)/2)*100,ox=NS<2?1:-Math.sin(a),oy=NS<2?0:Math.cos(a);
      g.x=cx+ox*off;g.y=cy+oy*off;g.gi=GROUPS.indexOf(g);g.parent=gi?s.groups[0]:null;g.muted=false;shape(g)})});
  arch.forEach(function(s){var a=Math.PI/2,cx=Math.cos(a)*(R+100),cy=Math.sin(a)*(R+100);
    s.groups.forEach(function(g){g.x=cx;g.y=cy;g.gi=GROUPS.indexOf(g);g.parent=null;g.muted=true;shape(g);g.items.forEach(function(x){x.b=Math.min(x.b,.4)})})});
  var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;GROUPS.forEach(function(g){x0=Math.min(x0,g.x-g.r-30);x1=Math.max(x1,g.x+g.r+30);y0=Math.min(y0,g.y-g.r-24);y1=Math.max(y1,g.y+g.r+62)});
  x0=Math.min(x0,-60);x1=Math.max(x1,60);B={x0:x0,x1:x1,y0:y0,y1:y1};
  GROUPS.forEach(function(g){var nn=1e9;GROUPS.forEach(function(o){if(o!==g)nn=Math.min(nn,Math.hypot(o.x-g.x,o.y-g.y))});g.nn=Math.min(nn,2*R||400)})}
var B={x0:-200,x1:200,y0:-200,y1:200};
function shape(g){var n=g.items.length,ring=Math.min(n,6),seed=g.gi*97+7,r0=16+4*ring;g.r=r0;
  var cols=n<=2?n:n<=4?2:3,rows=Math.ceil(n/cols);g.fw=Math.max(1,cols)*PX;g.fh=rows*PY+20;
  g.items.forEach(function(x,i){var sx,sy;
    if(i<ring){var a=-Math.PI/2+i*2*Math.PI/ring+(rnd(seed+i)-.5)*.6,rr=r0*(.7+rnd(seed+i*3)*.45);if(n===1){sx=0;sy=0}else{sx=Math.cos(a)*rr;sy=Math.sin(a)*rr}}
    else{var j=i-ring,a2=j*2.39996+g.gi,rr2=r0*.45+Math.sqrt(j)*9;sx=Math.cos(a2)*rr2;sy=Math.sin(a2)*rr2}
    g.r=Math.max(g.r,Math.hypot(sx,sy)+4);
    var r=(i/cols)|0,c=i%cols;if(r%2)c=cols-1-c; /* boustrophedon: the time line snakes down the frame, newest first */
    var fx=(c-(cols-1)/2)*PX+(rnd(seed+i*5)-.5)*14,fy=(r-(rows-1)/2)*PY-8+(rnd(seed+i*7)-.5)*10;
    x.i6=i>=ring;x.sx=sx;x.sy=sy;x.fx=fx*U;x.fy=fy*U;x.b=x.type==='placeholder'?.35:Math.max(.38,1-i/Math.max(6,n)*.75);if(isNow(x))x.b=1;else if(isRelated(x))x.b=Math.max(x.b,.85);x.x=g.x+sx;x.y=g.y+sy;x.mi=0});
  g.lines=[];for(var i=0;i+1<n;i++)g.lines.push([g.items[i],g.items[i+1],i+1<ring]);
  g.shape=[];if(ring>3)g.shape.push([g.items[ring-1],g.items[0]]);if(ring>4)g.shape.push([g.items[1],g.items[ring-2]]);
  g.newest=g.items.filter(function(x){return x.poster&&isNow(x)})[0]||g.items.filter(function(x){return x.poster&&isRelated(x)})[0]||g.items.filter(function(x){return x.poster})[0]||null}
/* sprites */
function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c}
var FIELD=!ctx?[]:[[700,.12,.9],[180,.35,1.5]].map(function(L,li){var T=512,c=mk(T,T),g=c.getContext('2d');
  for(var i=0;i<L[0];i++){var m=Math.pow(rnd(li*9000+i),2.6),b=.05+.9*m,t=rnd(li*7000+i*3);g.fillStyle='rgba('+Math.round(205+50*t)+','+Math.round(220+15*t)+','+Math.round(255-60*t)+','+b.toFixed(3)+')';
    g.beginPath();g.arc(rnd(li*5000+i*7)*T,rnd(li*3000+i*11)*T,.4+m*L[2],0,7);g.fill()}return{c:c,d:L[1],pat:null}});
function glow(rgb,sz){var c=mk(sz,sz),g=c.getContext('2d');if(!g)return c;var gr=g.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.45)');gr.addColorStop(.5,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=gr;g.fillRect(0,0,sz,sz);return c}
var GLOW=glow('205,225,255',96),GLOWC=glow('160,190,240',192),GLOWG=glow('255,216,74',96),GLOWM=glow('85,218,161',96),GLOWB=glow('10,189,240',96);
/* posters: only for levels 0-1, loaded when needed (the newest per constellation for L0, the rest as you fly in) */
var IMG={};function img(x){if(!x.poster)return null;var o=IMG[x.poster];if(!o){o=IMG[x.poster]=new Image();o.decoding='async';o.onload=req;o.src=x.poster}return o.complete&&o.naturalWidth?o:null}

/* camera */
var cam={x:0,y:0,s:1},M=0,mode='sky',FG=null,FS=null,open=false,raf=0,tw=null,TG=null,HIT=null;
/* LOD density budget: phone shows less label clutter at mid; desktop can carry more at the same zoom */
function isPhone(){return W>0&&W<700}
function lod(){/* 0 far overview · 1 mid compare · 2 close cards · 3 player */
  if(!player.hidden)return 3;if(mode==='grid')return 2;if(mode==='chap'||cam.s>fitS()*1.35)return 1;return 0}
function dens(){var L=lod(),ph=isPhone();return{L:L,phone:ph,
  showNowPoster:L===0, /* far: one What's-new thumb per stream only */
  showRelatedThumbs:L>=1, /* mid+: related titles/thumbs */
  showItemLabels:L>=1&&(!ph||cam.s>fitS()*1.8), /* phone: fewer mid labels */
  showArchive:L>=1||!ph, /* archive constellation muted; hide labels on phone when far */
  maxMidLabels:ph?3:8}}
function fitS(){return Math.min((W-20)/(B.x1-B.x0),(VH-40)/(B.y1-B.y0))}
function fitCam(){return{x:(B.x0+B.x1)/2,y:(B.y0+B.y1)/2,s:fitS()}}
function chapS(g){return Math.min((W-14)/(Math.max(g.fw,3*PX)*U),(VH-92)/(g.fh*U))}
function chapCam(g){return{x:g.x,y:g.y+8/chapS(g),s:chapS(g)}}
function sp(x,y){return[(x-cam.x)*cam.s+W/2,(y-cam.y)*cam.s+VC]}
function wp(x,y){return[(x-W/2)/cam.s+cam.x,(y-VC)/cam.s+cam.y]}
function ease(u){u=Math.max(0,Math.min(1,u));return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function cl(u){return Math.max(0,Math.min(1,u))}
function lerp(a,b,u){return a+(b-a)*u}
function interp(a,b,u){return{x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),s:a.s*Math.pow(b.s/a.s,u)}}
function tween(to,m1,dur,done){if(!anim()||!dur){cam={x:to.x,y:to.y,s:to.s};M=m1;tw=null;req();done&&done();return}
  tw={c0:{x:cam.x,y:cam.y,s:cam.s},c1:to,m0:M,m1:m1,t0:performance.now(),dur:dur*(window.__slow||1),done:done};req()}
/* how far each constellation has opened up: zoom relative to its own L1, weighted by how centred it is */
function openK(g){var c=wp(W/2,VC),d=Math.hypot(c[0]-g.x,c[1]-g.y),w=cl((1-d/(.55*g.nn))/.5);return ease(cl((cam.s/chapS(g)-.3)/.55))*w}
function nearest(px,py){var p=wp(px==null?W/2:px,py==null?VC:py),best=GROUPS[0],bd=1e18;GROUPS.forEach(function(g){var d=Math.hypot(g.x-p[0],g.y-p[1])/Math.max(20,g.r);if(d<bd){bd=d;best=g}});return best}
function layout(){GROUPS.forEach(function(g){var k=g.k=openK(g);g.items.forEach(function(x){x.x=g.x+lerp(x.sx,x.fx,k);x.y=g.y+lerp(x.sy,x.fy,k)})})}
/* screen rect of an item at L1 (the poster box) */
function rectL1(x){var p=sp(x.x,x.y),k=x.g.k,w=lerp(0,TW*U,k)*cam.s,h=lerp(0,TH*U,k)*cam.s;return{x:p[0]-w/2,y:p[1]-h/2,w:w,h:h,cx:p[0],cy:p[1]}}

/* ---------------- drawing ---------------- */
function bg(){ctx.clearRect(0,0,W,H);FIELD.forEach(function(L){if(!L.pat)L.pat=ctx.createPattern(L.c,'repeat');var sc=Math.max(.7,Math.min(1.8,Math.pow(cam.s/fitS(),L.d)*.9)),ox=-cam.x*cam.s*L.d+W/2,oy=-cam.y*cam.s*L.d+VC;
  ctx.save();ctx.translate(ox,oy);ctx.scale(sc,sc);ctx.fillStyle=L.pat;ctx.fillRect(-ox/sc,-oy/sc,W/sc,H/sc);ctx.restore()})}
function cover(im,x,y,w,h){var r=im.naturalWidth/im.naturalHeight,R=w/h,sw=im.naturalWidth,sh=im.naturalHeight,sx=0,sy=0;if(r>R){sw=sh*R;sx=(im.naturalWidth-sw)/2}else{sh=sw/R;sy=(im.naturalHeight-sh)/2}ctx.drawImage(im,sx,sy,sw,sh,x,y,w,h)}
function star(x,p,a,big){var c=x.badge==='Latest'?GLOWG:x.badge==='Current direction'?GLOWM:x.badge?GLOWB:GLOW,z=Math.min(2.2,cam.s/fitS()),r=(1+1.7*x.b)*Math.min(1.5,.75+.25*z)*(x.badge?1.35:1),gs=(x.badge?34:12+16*x.b)*Math.min(1.6,.8+.2*z);
  ctx.globalAlpha=a*(x.badge?1:.55+.45*x.b);ctx.drawImage(c,p[0]-gs/2,p[1]-gs/2,gs,gs);
  if(x.type==='placeholder'){ctx.strokeStyle='rgba(230,240,255,.8)';ctx.setLineDash([2,2]);ctx.beginPath();ctx.arc(p[0],p[1],r+1.5,0,7);ctx.stroke();ctx.setLineDash([])}
  else{ctx.fillStyle=x.badge==='Latest'?'#ffe58a':x.badge==='Current direction'?'#9ff0c9':x.badge?'#bfefff':'#f4f8ff';ctx.beginPath();ctx.arc(p[0],p[1],r,0,7);ctx.fill()}
  if(x.badge&&x.badge!=='Latest'){ctx.strokeStyle=x.badge==='Current direction'?'rgba(85,218,161,.9)':'rgba(10,189,240,.9)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p[0],p[1],r+4,0,7);ctx.stroke();ctx.lineWidth=1}
  if(x.badge==='Latest'){ctx.strokeStyle='rgba(255,216,74,.85)';ctx.beginPath();var q=r+6;ctx.moveTo(p[0]-q,p[1]);ctx.lineTo(p[0]+q,p[1]);ctx.moveTo(p[0],p[1]-q);ctx.lineTo(p[0],p[1]+q);ctx.stroke()}
  ctx.globalAlpha=1}
var labRects=[];function free(r){for(var i=0;i<labRects.length;i++){var t=labRects[i];if(r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}labRects.push(r);return true}
function trunc(s,w){if(ctx.measureText(s).width<=w)return s;while(s.length>2&&ctx.measureText(s+'…').width>w)s=s.slice(0,-1);return s+'…'}
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);bg();if(mode==='grid'&&!tw)return;
  var z=cam.s/fitS(),sky=1-cl(M*1.4),o=sp(0,0);ctx.lineCap='round';ctx.lineWidth=1;
  /* ᑕᐣᓯ + spokes */
  if(sky>0){ctx.strokeStyle='rgba(170,205,240,'+(.16*sky).toFixed(3)+')';ctx.beginPath();GROUPS.forEach(function(g){var a=g.parent?sp(g.parent.x,g.parent.y):o,b=sp(g.x,g.y);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])});ctx.setLineDash([3,5]);ctx.stroke();ctx.setLineDash([]);
    var gs=Math.max(60,Math.min(360,170*z));ctx.globalAlpha=sky;ctx.drawImage(GLOWC,o[0]-gs/2,o[1]-gs/2,gs,gs);
    ctx.font='700 '+Math.round(Math.max(20,Math.min(80,30*z)))+'px Syl, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='rgba(10,189,240,.55)';ctx.fillText('ᑕᐣᓯ',o[0]-1.2,o[1]);ctx.fillStyle='rgba(254,1,1,.45)';ctx.fillText('ᑕᐣᓯ',o[0]+1.2,o[1]);ctx.fillStyle='#fff';ctx.fillText('ᑕᐣᓯ',o[0],o[1]);ctx.globalAlpha=1}
  var mv=M>0&&FS&&TG; /* the L1 -> L2 travel */
  GROUPS.forEach(function(g){var k=g.k,fade=sky*(1-cl(cl((z-1.8)/2)*(1-k)*1.3)); if(g.muted)fade*=.32; var D=dens(); if(g.muted&&D.L===0&&D.phone)fade*=.4; if(mv&&g.sec!==FS)fade*=1-cl(M*2);var own=mv&&g.sec===FS,pf=own?1:fade;if(fade<.02&&!own)return;
    /* constellation lines */
    [1,0].forEach(function(fig){var la=(fig?.55-.2*k:.45*cl(k*1.6))*fade;if(la<.01)return;ctx.strokeStyle='rgba(185,215,248,'+la.toFixed(3)+')';ctx.beginPath();g.lines.forEach(function(L){if(!!L[2]!==!!fig)return;var a=sp(L[0].x,L[0].y),b=sp(L[1].x,L[1].y);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])});ctx.stroke()});
    if(k<.9){ctx.strokeStyle='rgba(185,215,248,'+(.32*(1-k)*fade).toFixed(3)+')';ctx.beginPath();g.shape.forEach(function(L){var a=sp(L[0].x,L[0].y),b=sp(L[1].x,L[1].y);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])});ctx.stroke()}
    /* stars grow into posters */
    g.items.forEach(function(x){var D=dens();
      /* Far out: only What's-new stars (and tiny related dots). Mid: related grow. Close: everything. */
      if(D.L===0&&!isNow(x)&&!g.muted){var p0=sp(x.x,x.y);if(isRelated(x)){ctx.globalAlpha=.25*pf;ctx.fillStyle='#cfe0f0';ctx.beginPath();ctx.arc(p0[0],p0[1],1.2,0,7);ctx.fill();ctx.globalAlpha=1}return}
      if(D.L===0&&g.muted&&!isNow(x))return;
      if(D.L===1&&D.phone&&!isNow(x)&&!isRelated(x))return; /* phone mid: Now + related only */
      var r=rectL1(x);if(mv&&g.sec===FS){var t=TG[x.k];var mi=ease(cl(M*1.25-x.mi*.25));if(t){r={x:lerp(r.x,t.x,mi),y:lerp(r.y,t.y,mi),w:lerp(r.w,t.w,mi),h:lerp(r.h,t.h,mi)};r.cx=r.x+r.w/2;r.cy=r.y+r.h/2}else{r.y+=mi*H*.6;}}
      if(r.cx<-200||r.cx>W+200||r.cy<-200||r.cy>H+200)return;
      var sa=pf*(x.i6?.5+.5*k:1);if(r.w<9){star(x,[r.cx,r.cy],sa);return}
      var a=pf*cl((r.w-9)/14);if(a<1)star(x,[r.cx,r.cy],sa*(1-a));ctx.globalAlpha=a;
      var im=x.type==='video'&&img(x);if(im)cover(im,r.x,r.y,r.w,r.h);else{ctx.fillStyle=x.type==='placeholder'?'rgba(10,16,24,.7)':'rgba(16,28,40,.92)';ctx.fillRect(r.x,r.y,r.w,r.h);
        ctx.fillStyle=x.type==='audio'?'rgba(85,218,161,.85)':'rgba(201,211,214,.7)';var u=r.h/58;
        if(x.type==='audio'){for(var b=0;b<9;b++){var hh=(.25+.75*Math.abs(Math.sin(b*1.7+x.k)))*r.h*.42;ctx.fillRect(r.cx-r.w*.3+b*r.w*.075,r.cy-hh/2,Math.max(1,r.w*.035),hh)}}
        else{ctx.font='300 '+Math.max(8,Math.round(11*u))+'px Poppins, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(x.type==='placeholder'?'coming':'',r.cx,r.cy)}}
      var bc=x.badge==='Latest'?'rgba(255,216,74,.95)':x.badge==='Current direction'?'rgba(85,218,161,.95)':x.badge?'rgba(10,189,240,.95)':'rgba(200,225,255,'+(.15+.35*x.b).toFixed(2)+')';
      ctx.strokeStyle=bc;ctx.lineWidth=x.badge?2:1;if(x.type==='placeholder')ctx.setLineDash([3,3]);ctx.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);ctx.setLineDash([]);ctx.lineWidth=1;
      /* dim the older ones a touch so the newest read brightest */
      if(!x.badge&&x.b<.95){ctx.fillStyle='rgba(3,5,10,'+((1-x.b)*.45).toFixed(2)+')';ctx.fillRect(r.x,r.y,r.w,r.h)}
      /* labels in the frame around each poster: time + title */
      var la2=a*cl((k-.7)/.25)*(1-cl(M*3));if(dens().showItemLabels&&la2>.02&&r.w>40){var tx=r.x,ty=r.y+r.h+3;ctx.globalAlpha=la2;ctx.textAlign='left';ctx.textBaseline='top';
        ctx.font='300 9.5px ui-monospace, Menlo, monospace';ctx.fillStyle=x.badge==='Latest'?'#ffd84a':x.badge==='Current direction'?'#55DAA1':x.badge?'#5fd3f5':'#93a1a6';ctx.fillText(trunc((x.badge?'★ ':'')+shortT(x.time),r.w),tx,ty);
        ctx.font='300 11px Poppins, sans-serif';ctx.fillStyle='#e6edf0';ctx.fillText(trunc(x.title.replace(/^Edit clip: /,''),r.w+8),tx,ty+12)}
      ctx.globalAlpha=1});
    /* L0: the newest poster beside each constellation */
    var na=fade*(1-cl(k*2.5))*cl(1.6-(z-1)*.8);if(na>.02&&g.newest&&!g.muted&&dens().showNowPoster){var im2=img(g.newest),p=sp(g.x,g.y),rr=g.r*cam.s,w2=58,h2=33,px,py,ok=false,cands=[[p[0]+rr+14,p[1]-h2/2-8],[p[0]-rr-14-w2,p[1]-h2/2-8],[p[0]-w2/2,p[1]-rr-h2-18],[p[0]+rr*.5,p[1]+rr*.6]];
      for(var ci=0;ci<cands.length&&!ok;ci++){px=cands[ci][0];py=cands[ci][1];if(px<4||px+w2>W-4||py<TOP||py+h2+13>H-BOT)continue;ok=free({x:px,y:py,w:w2,h:h2+13})}if(ok){ctx.globalAlpha=na;if(im2)cover(im2,px,py,w2,h2);else{ctx.fillStyle='rgba(16,28,40,.9)';ctx.fillRect(px,py,w2,h2)}ctx.strokeStyle=g.newest.badge==='Latest'?'rgba(255,216,74,.9)':'rgba(200,225,255,.45)';ctx.strokeRect(px+.5,py+.5,w2-1,h2-1);
        ctx.font='300 9px ui-monospace, Menlo, monospace';ctx.fillStyle='#93a1a6';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('newest '+shortT(g.newest.time).replace(/^\w+ /,''),px,py+h2+2);ctx.globalAlpha=1}}
  })}
/* ---------------- HUD: constellation names are real buttons (44px+) placed under each figure ---------------- */
var HB={};
function buildHud(){slabs.innerHTML=GROUPS.map(function(g){var s=g.sec,n=g.items.filter(function(x){return x.type!=='placeholder'}).length,nowN=g.items.filter(isNow).length,relN=g.items.filter(isRelated).length;
  var label=g.sub?g.sub:g.title;
  var sub=g.muted?('older · '+n):((nowN?'\u2726 What\'s new · ':'')+n+(relN?' · '+relN+' related':''));
  return'<button type="button" class="sl'+(g.sub?' sub':'')+(g.muted?' mute':'')+(nowN?' nowg':'')+'" data-g="'+esc(g.id)+'"><b>'+esc(label)+'</b><small>'+sub+'</small></button>'}).join('');
  $$('.sl',slabs).forEach(function(b){HB[b.dataset.g]=b})}
function placeHud(){var rects=[],D=dens();GROUPS.forEach(function(g){var b=HB[g.id];if(!b)return;var p=sp(g.x,g.y),bw=b.offsetWidth||96,bh=b.offsetHeight||44,rr=g.r*cam.s,vis=(1-g.k*1.6)*(1-cl(M*3));
    if(g.muted&&D.L===0)vis*=.35; if(g.muted&&D.phone&&D.L===0)vis=0; /* far phone: no Archive labels */
    var cand=[[p[0]-bw/2,p[1]+rr+2],[p[0]-bw/2,p[1]-rr-bh-2],[p[0]+rr+6,p[1]-bh/2],[p[0]-rr-6-bw,p[1]-bh/2]],x=cand[0][0],y=cand[0][1];
    for(var i=0;i<cand.length;i++){var q=cand[i];q[0]=Math.max(2,Math.min(W-bw-2,q[0]));if(!rects.some(function(r){return q[0]<r.x+r.w&&q[0]+bw>r.x&&q[1]<r.y+r.h&&q[1]+bh>r.y})){x=q[0];y=q[1];break}}
    var on=mode!=='grid'&&vis>.15&&p[0]>-30&&p[0]<W+30&&y>TOP-10&&y+bh<H-BOT+10;b.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';b.style.opacity=on?Math.min(1,vis*1.3).toFixed(2):'0';b.style.visibility=on?'':'hidden';b.tabIndex=on?0:-1;
    if(on){rects.push({x:x,y:y,w:bw,h:bh});labRects.push({x:x,y:y,w:bw,h:bh})}})}
/* the frame: what is in view */
var lastCap='';
function frameCaps(){var g=nearest(),show=mode!=='grid'&&g.k>.6&&!tw;var t='',b='';
  if(show){var s=g.sec,newest=g.items.filter(function(x){return x.time})[0];t=(newest?'newest '+when(newest.time):'')+' · '+g.items.length+' in '+(g.sub?s.title+' '+g.sub:s.title);
    var c=wp(W/2,VC),best=null,bd=1e9;g.items.forEach(function(x){var d=Math.hypot(x.x-c[0],x.y-c[1]);if(d<bd){bd=d;best=x}});
    if(best)b='<b>'+esc(best.title)+'</b><span>'+(best.time?when(best.time):'coming')+(best.type==='audio'?' · audio':'')+'</span>'+(best.badge?'<span class="badge">'+esc(best.badge)+'</span>':'')}
  var key=t+'|'+b;if(key===lastCap)return;lastCap=key;fcapT.hidden=!t;fcapB.hidden=!b;fcapT.textContent=t;fcapB.innerHTML=b}
/* ---------------- loop ---------------- */
function req(){if(!raf&&open)raf=requestAnimationFrame(frame)}
function frame(){var now=performance.now();raf=0;if(tw){var u=Math.min(1,(now-tw.t0)/tw.dur),e=ease(u);cam=interp(tw.c0,tw.c1,e);M=lerp(tw.m0,tw.m1,e);if(u>=1){var d=tw.done;tw=null;d&&d()}}
  layout();labRects=[];placeHud();draw();frameCaps();ui();if(tw)req()}

/* ---------------- levels ---------------- */
function lvNow(){return player.hidden?(mode==='grid'?2:mode==='chap'?1:0):3}
function inView(){if(!player.hidden&&PL)return SBY[PL.x.sec];if(mode==='grid'&&FS)return FS;if(cam.s>fitS()*1.3||mode==='chap'){var g=nearest();return g}return null}
function nameOf(v){if(!v)return'whole sky';if(v.items&&v.groups)return v.title;return v.sub?v.sec.title+' · '+v.sub:v.title}
var lastUi='';
function ui(){var lv=lvNow(),v=inView(),nm=nameOf(v),lab=lv===3?'▶ '+nm+' · player':nm+' · L'+lv,cr=lv===0?'the whole sky':lv===3?nm:nm;
  var sub=lv===0?'streams · pinch into What\'s new':lv===1?'What\'s new + related':lv===2?'clip + feedback':'';
  var key=lab+'|'+cr+'|'+sub+'|'+lv;if(key===lastUi)return;lastUi=key;zn.textContent=lab;dots.textContent=[0,1,2,3].map(function(i){return i<=lv?'●':'○'}).join('');
  crumb.innerHTML=esc(cr)+(sub?'<small>'+esc(sub)+'</small>':'');zout.disabled=lv===0&&cam.s<=fitS()*1.05;zin.disabled=lv===3}
function settle(m,g,o){o=o||{};if(m!=='sky')hint.classList.add('off');mode=m;FG=g||null;if(m!=='grid')FS=null;var h=m==='sky'?'#sky':m==='chap'?'#sky/'+g.id:'#'+FS.id;
  if(o.push!==false&&location.hash!==h)history[o.replace?'replaceState':'pushState']({pv:1},'',h);lastUi='';req()}
function toSky(o){o=o||{};FG=null;closeGrid();tween(fitCam(),0,o.dur!=null?o.dur:850,function(){settle('sky',null,o)})}
function toChap(g,o){o=o||{};if(mode==='grid'){pullOut(g,o);return}tween(chapCam(g),0,o.dur!=null?o.dur:900,function(){settle('chap',g,o)})}
/* L1 -> L2: build the section's cards invisibly, measure where each card's media box is, fly the posters there, then hand over */
function dive(s,x,o){o=o||{};if(!s)return;var g=x?x.g:(FG&&FG.sec===s?FG:s.main);FS=s;buildGrid(s,x);
  TG=measure();ITEMS.forEach(function(it){it.mi=it.sec===s.id?(s.items.indexOf(it)/Math.max(1,s.items.length-1)):0});
  var to=mode==='chap'&&FG===g?{x:cam.x,y:cam.y,s:cam.s}:chapCam(g),fast=o.dur===0;
  if(mode==='sky'&&!fast&&anim()){tween(chapCam(g),0,750,function(){mode='chap';FG=g;tween(chapCam(g),1,750,done)})}else tween(to,1,fast?0:800,done);
  function done(){mode='grid';FG=g;grid.classList.remove('pre');settle('grid',g,o);if(x)hit(x);if(o.play&&x)setTimeout(function(){openPlayer(x,{push:o.push})},anim()?120:0)}}
function measure(){var t={};$$('li[data-k]',grid).forEach(function(li){var m=$('.vbox video,audio',li)||$('.card',li),r=m.getBoundingClientRect();if(r.bottom>TOP&&r.top<H-BOT)t[li.dataset.k]={x:r.left,y:r.top,w:r.width,h:Math.min(r.height,r.width*.5625)||r.height}});return t}
function buildGrid(s,x){if(grid.dataset.sec!==s.id){kill(grid);grid.innerHTML=band(s,false);grid.dataset.sec=s.id;wire(grid)}grid.hidden=false;grid.classList.add('pre');
  var li=x&&$('li[data-k="'+x.k+'"]',grid);grid.scrollTop=li?Math.max(0,li.offsetTop-70):0}
function hit(x){var li=$('li[data-k="'+x.k+'"]',grid);if(li){li.classList.remove('hit');void li.offsetWidth;li.classList.add('hit')}}
function pullOut(g,o){o=o||{};g=g||FG||(FS&&FS.main);if(!g){toSky(o);return}TG=measure();grid.classList.add('pre');$$('video,audio',grid).forEach(function(m){m.pause()});mode='chap';M=1;cam=chapCam(g);
  tween(chapCam(g),0,o.dur!=null?o.dur:800,function(){closeGrid();settle('chap',g,o)})}
function closeGrid(){if(grid.hidden)return;kill(grid);grid.innerHTML='';grid.dataset.sec='';grid.hidden=true;grid.classList.add('pre');if(mode==='grid')mode='chap'}
function step(dir){if(tw)return;var lv=lvNow();
  if(dir>0){if(lv===0){var g=cam.s<=fitS()*1.05?GROUPS[0]:nearest();toChap(g)}else if(lv===1)dive(nearest().sec);else if(lv===2){var c=firstCard();if(c)openPlayer(c)}}
  else{if(lv===3)closePlayer();else if(lv===2)pullOut(FG);else if(lv===1||cam.s>fitS()*1.05)toSky()}}
function firstCard(){var best=null;$$('li[data-k]',grid).forEach(function(li){if(best)return;var x=byK(li.dataset.k),r=li.getBoundingClientRect();if(x.type==='video'&&x.d.file&&r.bottom>TOP+60&&r.top<H-BOT)best=x});return best}

/* ---------------- L3: the player ---------------- */
var PL=null,pcap=$('#pcap'),pdesc=$('#pdesc');
function openPlayer(x,o){o=o||{};if(x&&x.type==='live'){openLive(x);return}if(!x||x.type!=='video'||!x.d.file)return;var li=$('li[data-k="'+x.k+'"]',grid)||$('li[data-k="'+x.k+'"]',list),cvid=li&&$('video',li),t=cvid?cvid.currentTime:0,r=cvid?cvid.getBoundingClientRect():null;
  if(cvid)cvid.pause();PL={x:x,from:cvid};pv.poster=x.poster||'';if(pv.getAttribute('src')!==x.d.file)pv.src=x.d.file;pv.preload='metadata';
  pcap.innerHTML='<b>'+esc(x.title)+'</b><small>'+(x.time?when(x.time):'')+(x.badge?' · ★ '+esc(x.badge):'')+'</small>'+(x.d.link&&x.d.link.href?'<a class="plink" href="'+esc(x.d.link.href)+'" target="_blank" rel="noopener">'+esc(x.d.link.label||'Open')+' ↗</a>':'');pdesc.textContent=x.d.desc||'';window.PVFB&&PVFB.mountPlayer(x.d);
  player.hidden=false;player.getAnimations&&player.getAnimations().forEach(function(a){a.cancel()});D.classList.add('pl-on');try{if(t)pv.currentTime=t}catch(e){}
  var pv0=pv;var pr=pv0.play();if(pr&&pr.catch)pr.catch(function(){});
  if(r&&anim()&&pv.animate){var q=pv.getBoundingClientRect();if(q.width&&q.height){var sx=r.width/q.width,sy=r.height/q.height;
    pv.animate([{transformOrigin:'0 0',transform:'translate('+(r.left-q.left)+'px,'+(r.top-q.top)+'px) scale('+sx+','+sy+')'},{transformOrigin:'0 0',transform:'none'}],{duration:420*(window.__slow||1),easing:'cubic-bezier(.2,.8,.2,1)'});
    player.animate([{backgroundColor:'rgba(0,0,0,0)'},{backgroundColor:'#000'}],{duration:300*(window.__slow||1)})}}
  setTimeout(function(){try{$('#pclose').focus({preventScroll:true})}catch(e){}},30);
  if(o.push!==false&&D.classList.contains('sky-on')){var h='#'+x.sec+'/'+encodeURIComponent(x.stem);if(location.hash!==h)history.pushState({pv:1,pl:1},'',h)}lastUi='';ui()}
var closing=0;function closePlayer(o){o=o||{};if(player.hidden||closing)return;closing=1;var x=PL&&PL.x,t=pv.currentTime||0;pv.pause();
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});
  var li=x&&($('li[data-k="'+x.k+'"]',grid)||$('li[data-k="'+x.k+'"]',list)),cvid=li&&$('video',li);
  var ended=0;function end(){if(ended)return;ended=1;closing=0;player.hidden=true;D.classList.remove('pl-on');pv.removeAttribute('src');try{pv.load()}catch(e){}if(cvid){try{if(t)cvid.currentTime=t}catch(e){}if(li)li.scrollIntoView({block:'nearest'})}PL=null;window.PVFB&&PVFB.unmountPlayer&&PVFB.unmountPlayer();lastUi='';ui();
    var push=$('.push',li||document);if(push)try{push.focus({preventScroll:true})}catch(e){}}
  if(anim()&&player.animate){var d=200*(window.__slow||1);player.animate([{opacity:1},{opacity:0}],{duration:d,fill:'forwards'}).onfinish=end;setTimeout(end,d+80)}else end();
  if(o.push!==false&&D.classList.contains('sky-on')&&FS){var h='#'+FS.id;if(history.state&&history.state.pl)history.back();else if(location.hash!==h)history.replaceState({pv:1},'',h)}}
$('#pclose').addEventListener('click',function(){closePlayer()});
$('#pfs').addEventListener('click',function(){/* Android: real fullscreen on the video; iPhone: only the video element can go fullscreen */
  if(pv.requestFullscreen)pv.requestFullscreen().catch(function(){if(pv.webkitEnterFullscreen)pv.webkitEnterFullscreen()});else if(pv.webkitEnterFullscreen)pv.webkitEnterFullscreen()});

/* ---------------- gestures ---------------- */
/* sky: pointer events (touch-action:none, so the browser never zooms the page). One finger pans, two drive the camera, tap flies in. */
var PT=new Map(),pd=0,pm=null,moved=0,t0=0,pinched=false,g0='sky';
function zoomAt(f,x,y,cap){var p=wp(x,y);cam.s=Math.max(fitS()*.7,Math.min(cap||8,cam.s*f));cam.x=p[0]-(x-W/2)/cam.s;cam.y=p[1]-(y-VC)/cam.s}
function clampCam(){var m=Math.max(60,40/cam.s);cam.x=Math.max(B.x0-m,Math.min(B.x1+m,cam.x));cam.y=Math.max(B.y0-m,Math.min(B.y1+m,cam.y))}
/* PINCH-ON-LABEL v1 (Oct 19): a finger that lands on a sky label is held back (it may be a tap on the label). If a second finger comes
   down, both become a pinch and the label's click is swallowed; a lone finger on a label still taps it as before. */
var LBP=new Map(),lbSwallow=0;
sky.addEventListener('pointerdown',function(e){if(e.target.closest('.leg')||e.target.closest('.nowrail'))return;
  if(e.target.closest('.sl')&&!PT.size&&!LBP.size){LBP.set(e.pointerId,{x:e.clientX,y:e.clientY});return}
  if(LBP.size){LBP.forEach(function(p,id){PT.set(id,p)});LBP.clear();lbSwallow=Date.now()}
  try{sky.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(PT.size===1){moved=0;t0=Date.now();pinched=false}if(PT.size===2){var a=Array.from(PT.values());pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);pm={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};moved=99;pinched=true;tw=null;g0=mode}});
sky.addEventListener('pointermove',function(e){if(!PT.has(e.pointerId)||mode==='grid')return;var o=PT.get(e.pointerId),n={x:e.clientX,y:e.clientY};PT.set(e.pointerId,n);
  if(PT.size===1){var dx=n.x-o.x,dy=n.y-o.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>8){tw=null;cam.x-=dx/cam.s;cam.y-=dy/cam.s;clampCam();req()}}
  else if(PT.size===2){var a=Array.from(PT.values()),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};if(!pd){pd=d;pm=m;return}
    var f=d/pd;pd=d;cam.x-=(m.x-pm.x)/cam.s;cam.y-=(m.y-pm.y)/cam.s;pm=m;
    var soft=chapS(nearest(m.x,m.y))*(g0==='chap'?1.85:1.45);zoomAt(f,m.x,m.y,soft);clampCam();req()}});
function up(e){if(LBP.has(e.pointerId)){LBP.delete(e.pointerId);return}if(!PT.has(e.pointerId))return;var was=PT.size;PT.delete(e.pointerId);if(PT.size<2)pd=0;if(PT.size)return;if(pinched)lbSwallow=Date.now();
  if(was===1&&moved<10&&Date.now()-t0<500){tap(e.clientX,e.clientY);return}
  if(pinched)release();else if(moved>8)stayLevel();else{lastUi='';ui()}} /* pan stays (site-v3); zoom-stay: the level is re-read from the view, nothing moves */
sky.addEventListener('pointerup',up);sky.addEventListener('pointercancel',function(e){LBP.delete(e.pointerId);PT.delete(e.pointerId);if(!PT.size&&pinched)release()});
/* ZOOM-STAY v1 (Gill, Oct 19): release never snaps. The camera stays exactly where the fingers / wheel left it, pan stays free at
   any depth. Detail-by-zoom steps are THRESHOLDS read from the zoom (far = streams, mid = What's new + related, close = clip + feedback):
   far/mid only relabel (mode + hash, replaceState); close (zooming past 1.55x a constellation in a gesture that began at mid) opens the cards. */
var ZS_MID=1.35; /* same threshold lod() uses for mid detail */
function stayLevel(){if(mode==='grid'||tw)return;var g=nearest(),h;
  if(cam.s<fitS()*ZS_MID){mode='sky';FG=null;h='#sky'}else{mode='chap';FG=g;h='#sky/'+g.id;hint.classList.add('off')}
  if(location.hash!==h&&D.classList.contains('sky-on'))history.replaceState({pv:1},'',h);lastUi='';ui();req()}
function release(){if(mode==='grid')return;var s=cam.s,g=nearest(),cs=chapS(g);
  if(g0==='chap'&&s>cs*1.55){dive(g.sec,null,{});return}
  stayLevel()}
function tap(x,y){if(tw)return;var lv=lvNow();
  if(lv===1||cam.s>fitS()*1.6){var best=null;GROUPS.forEach(function(g){if(g.k<.5)return;g.items.forEach(function(it){var r=rectL1(it);if(x>=r.x-4&&x<=r.x+r.w+4&&y>=r.y-4&&y<=r.y+r.h+26)best=it})});
    if(best){dive(best.g.sec,best,{});return}}
  var bg=null,bd=1e9;GROUPS.forEach(function(g){var p=sp(g.x,g.y),d=Math.hypot(p[0]-x,p[1]-y)-g.r*cam.s;if(d<bd){bd=d;bg=g}});
  if(bg&&bd<40){if(mode==='chap'&&FG===bg)dive(bg.sec);else toChap(bg)}}
slabs.addEventListener('click',function(e){if(Date.now()-lbSwallow<900){e.preventDefault();return}var b=e.target.closest('[data-g]');if(!b)return;var g=GBY[b.dataset.g];if(g)toChap(g)});
sky.addEventListener('wheel',function(e){e.preventDefault();if(mode==='grid')return;tw=null;g0=mode;var f=Math.exp(-e.deltaY*(e.ctrlKey?.01:.0022));
  zoomAt(f,e.clientX,e.clientY,chapS(nearest(e.clientX,e.clientY))*(mode==='chap'?1.85:1.45));clampCam();req();
  clearTimeout(sky._w);sky._w=setTimeout(function(){pinched=true;release();pinched=false},260)},{passive:false});
/* iOS Safari: its own gesture events must never zoom the page over the sky or the player */
['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){if(D.classList.contains('sky-on')||!player.hidden)e.preventDefault()},{passive:false})});
/* two-finger gestures on the cards and the player: read them, act on release (never swap the DOM mid-gesture) */
function twoFinger(el,cb){var d0=0,d1=0,mid=null;el.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];d0=d1=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);mid={x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2}}},{passive:true});
  el.addEventListener('touchmove',function(e){if(e.touches.length===2&&d0){var a=e.touches[0],b=e.touches[1];d1=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}},{passive:true});
  el.addEventListener('touchend',function(e){if(e.touches.length===0&&d0){var r=d1/d0,m=mid;d0=0;if(r<.78||r>1.3)setTimeout(function(){cb(r,m)},0)}},{passive:true});
  el.addEventListener('touchcancel',function(){d0=0},{passive:true})}
twoFinger(grid,function(r,m){if(tw)return;if(r<1)pullOut(FG);else{var el=document.elementFromPoint(m.x,m.y),li=el&&el.closest('li[data-k]');if(li)openPlayer(byK(li.dataset.k))}});
twoFinger(player,function(r){if(r<1)closePlayer()});
/* tap a card (outside its controls and links) to push in */
document.addEventListener('click',function(e){var p=e.target.closest('.push');if(p){var li=p.closest('li[data-k]');openPlayer(byK(li.dataset.k));return}
  var cb=e.target.closest('.grid .cb');if(cb&&!e.target.closest('a,button,audio')){var li2=cb.closest('li[data-k]'),x=byK(li2.dataset.k);if(x.type==='video')openPlayer(x)}});
zin.addEventListener('click',function(){step(1)});zout.addEventListener('click',function(){step(-1)});
$('#home').addEventListener('click',function(){if(!player.hidden)closePlayer({push:false});toSky()});
addEventListener('keydown',function(e){if(!open)return;if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='+'||e.key==='='){e.preventDefault();step(1)}else if(e.key==='-'||e.key==='_'){e.preventDefault();step(-1)}else if(e.key==='Escape'){e.preventDefault();step(-1)}});

/* ---------------- modes, sizing, routing ---------------- */
function size(){var r=sky.getBoundingClientRect();W=r.width||innerWidth;H=r.height||innerHeight;dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  TOP=hud.offsetHeight||52;BOT=bar.offsetHeight||66;VH=H-TOP-BOT;VC=TOP+VH/2}
function flipMark(m){var a=$('#toListHdr'),b=$('#toSky');if(a)a.classList.toggle('on',m==='list');if(b)b.classList.toggle('on',m==='sky')}
function setMode(m){D.classList.add('ready');if(m==='list'||!ctx){if(!player.hidden)closePlayer({push:false});D.classList.remove('sky-on');[sky,hud,bar,fcapT,fcapB,hint].forEach(function(el){el.hidden=true});closeGrid();open=false;flipMark('list');hideZoomChrome();renderList();return}
  if(open){flipMark('sky');showZoomChrome();return}kill(list);list.innerHTML='';D.classList.add('sky-on');[sky,hud,bar,hint].forEach(function(el){el.hidden=false});open=true;size();lastUi='';flipMark('sky');showZoomChrome();
  hint.classList.remove('off');clearTimeout(hint._t);hint._t=setTimeout(function(){hint.classList.add('off')},6400);req()}
function hideZoomChrome(){var n=$('#nowrail'),l=$('#leg');if(n)n.hidden=true;if(l)l.hidden=true}
function showZoomChrome(){var n=$('#nowrail'),l=$('#leg');if(n)n.hidden=false;if(l&&!l.dataset.dismissed)l.hidden=false;placeNowRail()}
function parse(h){h=decodeURIComponent((h||'').replace(/^#/,''));if(h==='list'||/^list\//.test(h))return{list:1,sec:h.slice(5)};
  if(!h||h==='sky')return{lv:0};var m=/^sky\/(.+)$/.exec(h);if(m)return GBY[m[1]]?{lv:1,g:GBY[m[1]]}:{lv:0};
  var p=h.split('/');if(SBY[p[0]]){var s=SBY[p[0]],x=p[1]?s.items.filter(function(i){return i.stem===p[1]})[0]:null;return{lv:2,s:s,x:x}}return{lv:0}}
function route(h,o){o=o||{};var r=parse(h),q={push:false,dur:o.anim?undefined:0};
  if(r.list){setMode('list');if(r.sec){var el=document.getElementById(r.sec);if(el)el.scrollIntoView({block:'start'})}return}
  setMode('sky');if(r.lv!==3&&!player.hidden&&!(r.x&&PL&&PL.x===r.x))closePlayer({push:false});
  if(r.lv===0){if(mode==='grid')pullOut(FG,{push:false,dur:q.dur});toSky(q)}
  else if(r.lv===1)toChap(r.g,q);
  else if(r.lv===2){if(mode==='grid'&&FS===r.s){if(r.x&&player.hidden)openPlayer(r.x,{push:false})}else{if(mode==='grid')closeGrid();dive(r.s,r.x,{push:false,dur:q.dur,play:!!r.x})}}}
addEventListener('popstate',function(){route(location.hash,{anim:true})});
function goList(){history.pushState({pv:1},'','#list');setMode('list');scrollTo(0,0)}
function goZoom(){history.pushState({pv:1},'','#sky');if(!open){setMode('sky');cam=fitCam();M=0;settle('sky',null,{push:false})}else toSky()}
$('#toList').addEventListener('click',goList);
var _hl=$('#toListHdr');if(_hl)_hl.addEventListener('click',goList);
$('#toSky').addEventListener('click',goZoom);
jump.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var id=(a.getAttribute('href')||'').replace(/^#(list\/)?/,''),el=document.getElementById(id);if(el){e.preventDefault();history.replaceState({pv:1},'','#list/'+id);el.scrollIntoView({block:'start'})}});
addEventListener('resize',function(){if(!open)return;var f0=fitS(),atFit=Math.abs(cam.s/f0-1)<.02;size();if(!tw&&mode!=='grid'){if(atFit)cam=fitCam();else{cam.s=Math.max(fitS()*.7,cam.s);clampCam()}}req()}); /* ZOOM-STAY v1: phone URL-bar resizes keep the view */
if(RM.addEventListener)RM.addEventListener('change',req);


/* Hybrid What's new rail (always in Zoom) + dismissible legend. Stars stay. */
function placeNowRail(){var rail=$('#nowrail');if(!rail||!open)return;
  var order=streamOrder(),D=dens(),bits=[];
  order.forEach(function(id){var sec=SBY[id];if(!sec)return;sec.items.filter(isNow).forEach(function(x){var it=x.d;
    var bg=it.poster?' style="background-image:url(\''+esc(it.poster)+'\')"':'';
    bits.push('<button type="button" class="nrc" data-k="'+x.k+'" data-file="'+esc(it.file||'')+'" data-title="'+esc(it.title||'')+'"'+bg+' aria-label="'+esc(sec.title)+': '+esc(it.title)+'"><span class="nrt">'+esc(sec.title)+'</span><span class="nrl">'+esc(it.title)+'</span></button>')})});
  if(!bits.length){rail.innerHTML='';rail.hidden=true;return}
  rail.className='nowrail'+(D.L===0?' far':' mid')+(D.phone?' phone':'');
  rail.innerHTML='<div class="nrh"><b>What\'s new</b><span>'+(D.L===0?'streams':D.L===1?'tap for related':'open + feedback')+'</span></div><div class="nrrow">'+bits.join('')+'</div>';
  rail.hidden=false}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.nrc');if(!b||!open)return;
  var x=byK(b.dataset.k);if(!x)return;if(lod()>=2)openPlayer(x);else if(lod()===1)dive(x.g.sec,x,{});else toChap(x.g)});
function wireLegend(){var leg=$('#leg'),bx=$('#legx');if(!leg)return;
  try{if(sessionStorage.getItem('pvleg:hide')){leg.dataset.dismissed='1';leg.hidden=true}}catch(e){}
  if(bx)bx.addEventListener('click',function(){leg.dataset.dismissed='1';leg.hidden=true;try{sessionStorage.setItem('pvleg:hide','1')}catch(e){}})}
var _ui0=ui;ui=function(){_ui0();if(open)placeNowRail()};

/* ---------------- boot ---------------- */
fetch('previews.json?v='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(data){
  prep(data);layoutWorld();buildHud();GROUPS.forEach(function(g){if(g.newest)img(g.newest)});wireLegend();
  var h=location.hash;if(!ctx||!ITEMS.length){setMode('list');return}
  setMode('sky');cam=fitCam();M=0;layout();
  if(/^#?$/.test(h)||h==='#sky'){var f=fitCam();if(anim()){cam={x:f.x,y:f.y,s:f.s*.7};tween(f,0,900,function(){settle('sky',null,{push:false})})}else settle('sky',null,{push:false})}
  else route(h,{anim:false});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){lastUi='';req()});
}).catch(function(e){setMode('list');list.innerHTML='<p class="err">Could not load previews.json ('+esc(e.message)+').</p>'});

window.__sky={state:function(){var st={open:open,mode:mode,lv:lvNow(),g:FG&&FG.id,sec:FS&&FS.id,m:+M.toFixed(3),s:+cam.s.toFixed(4),fit:+fitS().toFixed(4),moving:!!tw,player:!player.hidden,label:zn.textContent,hash:location.hash,
  groups:GROUPS.map(function(g){var p=sp(g.x,g.y);return{id:g.id,x:+p[0].toFixed(1),y:+p[1].toFixed(1),k:+(g.k||0).toFixed(2),chap:+chapS(g).toFixed(3),n:g.items.length}})};return st},
  items:function(id){var g=GBY[id];return g.items.map(function(x){var r=rectL1(x);return{k:x.k,title:x.title,x:+r.cx.toFixed(1),y:+r.cy.toFixed(1),w:+r.w.toFixed(1)}})},step:step,route:function(h){route(h,{anim:true})}};
})();
