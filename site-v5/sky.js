/* Gill James · site-v5 · the previews page's sky (previews/sky.js, adapted from the site v3.1 constellation sheet) with Gill's chapters as its content.
   Everything comes from works.json. One camera on one sheet:
     L0  the whole sky: ᑕᐣᓯ in the middle, one labelled constellation per chapter (Film, Photo, Objects, Sound, About),
         the first work's poster beside each, New / Selected work as highlighted stars
     L1  a constellation: as the camera flies in, its stars travel along the constellation lines and grow into posters
         (older work a touch dimmer, veil <= .2; picks full brightness); the frame (top and bottom captions) carries the chapter and the work in view
     L2  the chapter's board (site-v3's landed grid: 3 / 4 / 6 columns, Photo + Objects square, native vertical scrolling);
         the posters travel into the tiles, then hand over
     L3  one work pushed in to a full-viewport view (film, photo, text), with its case study when it has one
   v5 changes to the previews engine (everything else is the previews code as it was):
     DEPTH     pinch / wheel drives L1 -> L2 continuously: past the constellation the posters travel into the board's tiles with your fingers
               (M follows the camera), and the board takes over exactly where they land. Pinch out on the board hands it back to the sky the same way.
     NO SNAP   letting go never moves the camera (previews snapped to the nearest level on release; v5 only names the level you are at).
     SELECT    one press selects (mint frame, caption), a press on the selected work opens it. Sound: the first press is silent, the second plays.
     AGE       older work only slightly dimmer (veil <= .2), never hidden; PICKS (Reel 2026, Coca-Cola, BMW Legends, AXE Stay Gold) full brightness.
     LAZY      board images load only when on or near the screen (borrowed from Roads Not Taken's zoom.js); the sky already loaded posters only when drawn.
   Pinch, tap, + / −, keyboard, back button, hash deep links (#film = that chapter's board, #sky/<chapter>, #film/w4 = that work open, #list = the plain list). */
(function(){
'use strict';
var D=document.documentElement,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};function anim(){return !RM.matches}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var V5='../site-v5/';
var MINT='#55DAA1';

/* ================= data ================= */
var DATA,SECS=[],SBY={},ITEMS=[],GROUPS=[],GBY={};
function prep(data){DATA=data;var seen={};
  (data.sections||[]).forEach(function(s){if(s&&s.id&&!seen[s.id]){seen[s.id]=1;SECS.push({id:s.id,title:s.title||s.id,sum:s.sum||'',noun:s.noun||'',sq:!!s.sq})}});
  /* v5: chapters keep the site's own order (previews sorted newest first) */
  ITEMS=(data.items||[]).filter(function(it){return it&&it.section&&SBY[it.section]!==0}).map(function(it,k){return{d:it,k:k,sec:it.section,stem:it.id,title:it.title||'',meta:it.meta||'',type:it.type,badge:it.badge||null,poster:it.poster||null,pick:!!it.pick}});
  SECS.forEach(function(s,si){s.si=si;s.items=ITEMS.filter(function(x){return x.sec===s.id});s.n=s.items.length;SBY[s.id]=s;
    var base={id:s.id,sec:s,title:s.title,sub:null,items:s.items};s.items.forEach(function(x){x.g=base});s.groups=[base]});
  SECS.forEach(function(s){s.groups.forEach(function(g){GROUPS.push(g);GBY[g.id]=g});s.main=s.groups[0]});}
function count(s){return s.noun?s.n+' '+s.noun:'bio · hire · poem'}

/* ================= board tiles (site-v3's landed grid) ================= */
function href(x){var d=x.d;if(d.case&&false)return'';if(d.parts)return d.parts[0].src;return d.url||d.big||d.file||'#'+x.sec+'/'+x.stem}
function wave(x){var p=x.d.peaks||[],h='';for(var i=0;i<p.length;i++){var v=Math.max(.08,p[i]);h+='<rect x="'+(i*2.5+.4)+'" y="'+(50-v*44).toFixed(1)+'" width="1.6" height="'+(v*88).toFixed(1)+'"/>'}return'<svg class="wv" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+h+'</svg>'}
function tile(x,i,n){var d=x.d,age=x.pick?0:(n>1?.25*i/(n-1):0)*.8,cls=['tl',x.pick?'pick':'',x.badge?'b-'+x.badge.toLowerCase():'','t-'+x.type].join(' ').replace(/\s+/g,' ').trim();
  var h='<li data-k="'+x.k+'" class="'+cls+'"'+(age>.004?' style="--age:'+age.toFixed(3)+'"':'')+'><a class="tile" href="'+esc(href(x))+'"'+(d.type==='link'&&/^http/.test(d.url||'')?' target="_blank" rel="noopener"':'')+'><span class="vis">';
  if(x.poster)h+='<img data-src="'+esc(x.poster)+'" alt="'+esc(d.alt||'')+'" decoding="async">';
  if(x.type==='audio')h+=wave(x);
  if(x.type==='text'||(!x.poster&&x.type==='link'))h+='<span class="tx">'+esc(x.type==='text'?(d.text||[]).slice(0,d.lines?4:1).join(d.lines?' / ':' '):x.title)+'</span>';
  if(x.badge)h+='<span class="badge">'+esc(x.badge)+'</span>';
  h+='</span><span class="cap"><b>'+esc(x.title)+'</b><small>'+esc(x.meta)+'</small></span></a></li>';return h}
function band(s,asList){return'<section class="band'+(s.sq?' sq':'')+'"'+(asList?' id="'+esc(s.id)+'"':' data-sec="'+esc(s.id)+'"')+'><h2 class="bh"><span class="L">'+(s.si+1)+'</span>'+esc(s.title)+'<small>'+esc(count(s))+'</small></h2>'+
  '<span class="mnote">'+esc(s.sum)+(asList?'':(s.sum?' · ':'')+'press to select, again to open')+'</span><div class="bw"><svg class="blines" aria-hidden="true"></svg><ol class="tiles">'+s.items.map(function(x,i){return tile(x,i,s.items.length)}).join('')+'</ol></div></section>'}
function wire(root){lazyWatch(root)}
function kill(root){$$('video,audio',root).forEach(function(m){try{m.pause();m.removeAttribute('src');m.load()}catch(e){}})}
/* one media plays at a time, everywhere */
document.addEventListener('play',function(e){$$('video,audio').forEach(function(o){if(o!==e.target&&!o.paused&&!o.muted)o.pause()})},true);
function byK(k){return ITEMS[+k]}
/* v5 LAZY (Roads Not Taken zoom.js): a board image loads only when its tile is on or near the screen */
var IO=null;function load(im){if(im&&!im.getAttribute('src')&&im.dataset.src)im.src=im.dataset.src}
function lazyWatch(root){var ims=$$('img[data-src]',root);if(!('IntersectionObserver' in window)){ims.forEach(load);return}
  if(!IO)IO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){load(e.target);IO.unobserve(e.target)}})},{root:null,rootMargin:'300px 0px'});ims.forEach(function(im){IO.observe(im)})}
/* the board keeps site-v3's constellation lines: one faint line from each tile to the next */
function boardLines(root){$$('.bw',root).forEach(function(bw){var svg=$('.blines',bw),lis=$$('li',bw),w=bw.offsetWidth,h=bw.offsetHeight,p='';svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.setAttribute('width',w);svg.setAttribute('height',h);
  var c=lis.map(function(li){var v=$('.vis',li);return[li.offsetLeft+v.offsetLeft+v.offsetWidth/2,li.offsetTop+v.offsetTop+v.offsetHeight/2]});
  for(var i=0;i+1<c.length;i++)p+='M'+c[i][0].toFixed(0)+' '+c[i][1].toFixed(0)+'L'+c[i+1][0].toFixed(0)+' '+c[i+1][1].toFixed(0);svg.innerHTML='<path d="'+p+'"/>'})}

/* ================= list mode ================= */
var list=$('#list'),jump=$('#jump'),foot=$('#foot');
function renderList(){jump.innerHTML=SECS.map(function(s){return'<a href="#list/'+esc(s.id)+'">'+esc(s.title)+'</a>'}).join('');
  list.innerHTML=SECS.map(function(s){return band(s,true)}).join('');$$('img[data-src]',list).forEach(function(im){im.loading='lazy'});lazyWatch(list);requestAnimationFrame(function(){boardLines(list)})}

/* ================= the sky ================= */
var sky=$('#sky'),cv=$('canvas',sky),ctx=null,slabs=$('.slabs',sky),hud=$('#shud'),bar=$('#sbar'),crumb=$('#crumb'),zn=$('#zn'),dots=$('#dots'),zin=$('#zin'),zout=$('#zout'),
  fcapT=$('#fcapT'),fcapB=$('#fcapB'),hint=$('#shint'),grid=$('#grid'),player=$('#player'),pv=$('video',player),feat=$('#feat');
try{ctx=cv.getContext('2d')}catch(e){ctx=null}
var W=0,H=0,dpr=1,TOP=52,BOT=66,VH=600,VC=300;
var U=.22,PX=124,TW=104,TH=58.5; /* L1 frame layout in "frame units"; world = frame * U */
var DEEP=1.9; /* v5 DEPTH: zoom past a constellation's L1 by this much and its posters have landed in the board */
function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
function cols(){return W>=1000&&H>500?6:W>=700?4:3} /* site-v3's board columns */
function layoutWorld(){var bases=SECS.filter(function(s){return s.groups.length}),NS=bases.length,R=NS<2?0:128+10*NS;
  bases.forEach(function(s,si){var a=(-90+si*360/NS)*Math.PI/180,cx=Math.cos(a)*R,cy=Math.sin(a)*R;
    var ng=s.groups.length;s.groups.forEach(function(g,gi){var off=(gi-(ng-1)/2)*125,ox=NS<2?1:-Math.sin(a),oy=NS<2?0:Math.cos(a),x=cx+ox*off+(gi?Math.cos(a)*16:0),y=cy+oy*off+(gi?Math.sin(a)*16:0);
      g.x=x;g.y=y;g.gi=GROUPS.indexOf(g);g.parent=gi?s.groups[0]:null;shape(g)})});
  var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;GROUPS.forEach(function(g){x0=Math.min(x0,g.x-g.r-30);x1=Math.max(x1,g.x+g.r+30);y0=Math.min(y0,g.y-g.r-24);y1=Math.max(y1,g.y+g.r+62)});
  x0=Math.min(x0,-60);x1=Math.max(x1,60);B={x0:x0,x1:x1,y0:y0,y1:y1};
  GROUPS.forEach(function(g){var nn=1e9;GROUPS.forEach(function(o){if(o!==g)nn=Math.min(nn,Math.hypot(o.x-g.x,o.y-g.y))});g.nn=Math.min(nn,2*R||400)})}
var B={x0:-200,x1:200,y0:-200,y1:200};
function shape(g){var n=g.items.length,ring=Math.min(n,6),seed=g.gi*97+7,r0=16+4*ring+Math.sqrt(Math.max(0,n-6))*1.5;g.r=r0;
  /* v5: the frame each constellation opens into has the board's own columns and tile shape, so the dive lands straight on it */
  var C=Math.min(n,cols()),rows=Math.ceil(n/C);g.tw=TW;g.th=g.sec.sq?TW:TH;g.py=g.th+44;g.fw=Math.max(1,C)*PX;g.fh=rows*g.py+20;
  g.items.forEach(function(x,i){var sx,sy;
    if(i<ring){var a=-Math.PI/2+i*2*Math.PI/ring+(rnd(seed+i)-.5)*.6,rr=r0*(.7+rnd(seed+i*3)*.45);if(n===1){sx=0;sy=0}else{sx=Math.cos(a)*rr;sy=Math.sin(a)*rr}}
    else{var j=i-ring,a2=j*2.39996+g.gi,rr2=r0*.42+Math.sqrt(j)*7.5;sx=Math.cos(a2)*rr2;sy=Math.sin(a2)*rr2}
    g.r=Math.max(g.r,Math.hypot(sx,sy)+4);
    var r=(i/C)|0,c=i%C; /* v5: row-major like the board (previews snaked a time line) */
    var fx=(c-(C-1)/2)*PX,fy=(r-(rows-1)/2)*g.py-8;
    x.i6=i>=ring;x.sx=sx;x.sy=sy;x.fx=fx*U;x.fy=fy*U;x.b=x.pick?1:1-.25*i/Math.max(1,n-1);x.x=g.x+sx;x.y=g.y+sy;x.mi=0});
  g.lines=[];for(var i=0;i+1<n;i++)g.lines.push([g.items[i],g.items[i+1],i+1<ring]);
  g.shape=[];if(ring>3)g.shape.push([g.items[ring-1],g.items[0]]);if(ring>4)g.shape.push([g.items[1],g.items[ring-2]]);
  g.newest=g.items.filter(function(x){return x.poster})[0]||null}
/* sprites */
function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c}
var FIELD=!ctx?[]:[[700,.12,.9],[180,.35,1.5]].map(function(L,li){var T=512,c=mk(T,T),g=c.getContext('2d');
  for(var i=0;i<L[0];i++){var m=Math.pow(rnd(li*9000+i),2.6),b=.05+.9*m,t=rnd(li*7000+i*3);g.fillStyle='rgba('+Math.round(205+50*t)+','+Math.round(220+15*t)+','+Math.round(255-60*t)+','+b.toFixed(3)+')';
    g.beginPath();g.arc(rnd(li*5000+i*7)*T,rnd(li*3000+i*11)*T,.4+m*L[2],0,7);g.fill()}return{c:c,d:L[1],pat:null}});
function glow(rgb,sz){var c=mk(sz,sz),g=c.getContext('2d');if(!g)return c;var gr=g.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.45)');gr.addColorStop(.5,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=gr;g.fillRect(0,0,sz,sz);return c}
var GLOW=glow('205,225,255',96),GLOWC=glow('160,190,240',192),GLOWM=glow('85,218,161',96),GLOWB=glow('10,189,240',96);
/* posters: loaded only when drawn big enough (the first poster per constellation for L0, the rest as you fly in) */
var IMG={};function img(x){if(!x.poster)return null;var o=IMG[x.poster];if(!o){o=IMG[x.poster]=new Image();o.decoding='async';o.onload=req;o.src=x.poster}return o.complete&&o.naturalWidth?o:null}
/* v5: New = mint (as previews' "current direction"), Selected = the cyan badge */
function bcol(x,a){return x.badge==='New'?'rgba(85,218,161,'+a+')':x.badge?'rgba(10,189,240,'+a+')':null}

/* camera */
var cam={x:0,y:0,s:1},M=0,mode='sky',FG=null,FS=null,FSG=null,open=false,raf=0,tw=null,TG=null,SELI=null;
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
function rectL1(x){var p=sp(x.x,x.y),k=x.g.k,w=lerp(0,x.g.tw*U,k)*cam.s,h=lerp(0,x.g.th*U,k)*cam.s;return{x:p[0]-w/2,y:p[1]-h/2,w:w,h:h,cx:p[0],cy:p[1]}}

/* ---------------- drawing ---------------- */
function bg(){ctx.clearRect(0,0,W,H);FIELD.forEach(function(L){if(!L.pat)L.pat=ctx.createPattern(L.c,'repeat');var sc=Math.max(.7,Math.min(1.8,Math.pow(cam.s/fitS(),L.d)*.9)),ox=-cam.x*cam.s*L.d+W/2,oy=-cam.y*cam.s*L.d+VC;
  ctx.save();ctx.translate(ox,oy);ctx.scale(sc,sc);ctx.fillStyle=L.pat;ctx.fillRect(-ox/sc,-oy/sc,W/sc,H/sc);ctx.restore()})}
function cover(im,x,y,w,h){var r=im.naturalWidth/im.naturalHeight,R=w/h,sw=im.naturalWidth,sh=im.naturalHeight,sx=0,sy=0;if(r>R){sw=sh*R;sx=(im.naturalWidth-sw)/2}else{sh=sw/R;sy=(im.naturalHeight-sh)/2}ctx.drawImage(im,sx,sy,sw,sh,x,y,w,h)}
function star(x,p,a){var c=x.badge==='New'?GLOWM:x.badge?GLOWB:GLOW,z=Math.min(2.2,cam.s/fitS()),r=(1+1.7*x.b)*Math.min(1.5,.75+.25*z)*(x.badge?1.35:1),gs=(x.badge?34:12+16*x.b)*Math.min(1.6,.8+.2*z);
  ctx.globalAlpha=a*(x.badge?1:.55+.45*x.b);ctx.drawImage(c,p[0]-gs/2,p[1]-gs/2,gs,gs);
  ctx.fillStyle=x.badge==='New'?'#9ff0c9':x.badge?'#bfefff':'#f4f8ff';ctx.beginPath();ctx.arc(p[0],p[1],r,0,7);ctx.fill();
  if(x.badge){ctx.strokeStyle=bcol(x,.9);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p[0],p[1],r+4,0,7);ctx.stroke();ctx.lineWidth=1}
  if(x===SELI){ctx.strokeStyle=MINT;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p[0],p[1],r+7,0,7);ctx.stroke();ctx.lineWidth=1}
  ctx.globalAlpha=1}
var labRects=[];function free(r){for(var i=0;i<labRects.length;i++){var t=labRects[i];if(r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}labRects.push(r);return true}
function trunc(s,w){if(ctx.measureText(s).width<=w)return s;while(s.length>2&&ctx.measureText(s+'…').width>w)s=s.slice(0,-1);return s+'…'}
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);bg();if(mode==='grid'&&!tw)return;
  var z=cam.s/fitS(),sky=1-cl(M*1.4),o=sp(0,0);ctx.lineCap='round';ctx.lineWidth=1;
  var mv=M>0&&FS&&TG; /* the L1 -> L2 travel */
  if(mv){ctx.fillStyle='rgba(3,5,10,'+(.86*M).toFixed(3)+')';ctx.fillRect(0,0,W,H)} /* v5: the board's own backdrop deepens with the travel, so the hand-over is invisible */
  /* ᑕᐣᓯ + spokes */
  if(sky>0){ctx.strokeStyle='rgba(170,205,240,'+(.16*sky).toFixed(3)+')';ctx.beginPath();GROUPS.forEach(function(g){var a=g.parent?sp(g.parent.x,g.parent.y):o,b=sp(g.x,g.y);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])});ctx.setLineDash([3,5]);ctx.stroke();ctx.setLineDash([]);
    var gs=Math.max(60,Math.min(360,170*z));ctx.globalAlpha=sky;ctx.drawImage(GLOWC,o[0]-gs/2,o[1]-gs/2,gs,gs);
    ctx.font='700 '+Math.round(Math.max(20,Math.min(80,30*z)))+'px Syl, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='rgba(10,189,240,.55)';ctx.fillText('ᑕᐣᓯ',o[0]-1.2,o[1]);ctx.fillStyle='rgba(254,1,1,.45)';ctx.fillText('ᑕᐣᓯ',o[0]+1.2,o[1]);ctx.fillStyle='#fff';ctx.fillText('ᑕᐣᓯ',o[0],o[1]);ctx.globalAlpha=1}
  GROUPS.forEach(function(g){var k=g.k,fade=sky*(1-cl(cl((z-1.8)/2)*(1-k)*1.3)); if(mv&&g.sec!==FS)fade*=1-cl(M*2);var own=mv&&g.sec===FS,pf=own?1:fade;if(fade<.02&&!own){g.items.forEach(function(x){x.dr=null});return}
    /* constellation lines */
    var lf=own?1-cl(M*1.6):1;
    [1,0].forEach(function(fig){var la=(fig?.55-.2*k:.45*cl(k*1.6))*fade*lf;if(la<.01)return;ctx.strokeStyle='rgba(185,215,248,'+la.toFixed(3)+')';ctx.beginPath();g.lines.forEach(function(L){if(!!L[2]!==!!fig)return;var a=sp(L[0].x,L[0].y),b=sp(L[1].x,L[1].y);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])});ctx.stroke()});
    if(k<.9){ctx.strokeStyle='rgba(185,215,248,'+(.32*(1-k)*fade).toFixed(3)+')';ctx.beginPath();g.shape.forEach(function(L){var a=sp(L[0].x,L[0].y),b=sp(L[1].x,L[1].y);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])});ctx.stroke()}
    /* stars grow into posters */
    g.items.forEach(function(x){var r=rectL1(x);x.dr=null;if(own){var t=TG[x.k];var mi=ease(cl(M*1.25-x.mi*.25));if(t){r={x:lerp(r.x,t.x,mi),y:lerp(r.y,t.y,mi),w:lerp(r.w,t.w,mi),h:lerp(r.h,t.h,mi)};r.cx=r.x+r.w/2;r.cy=r.y+r.h/2}else{r.y+=mi*H*.6;r.cy+=mi*H*.6}}
      if(r.cx<-200||r.cx>W+200||r.cy<-200||r.cy>H+200)return;x.dr=r;
      var sa=pf*(x.i6?.5+.5*k:1);if(r.w<9){star(x,[r.cx,r.cy],sa);return}
      var a=pf*cl((r.w-9)/14);if(a<1)star(x,[r.cx,r.cy],sa*(1-a));ctx.globalAlpha=a;
      var im=img(x);if(im)cover(im,r.x,r.y,r.w,r.h);else{ctx.fillStyle='rgba(16,28,40,.92)';ctx.fillRect(r.x,r.y,r.w,r.h)}
      if(x.type==='audio'){ctx.fillStyle='rgba(85,218,161,.85)';var pk=x.d.peaks||[],bw=r.w/Math.max(1,pk.length);for(var b=0;b<pk.length;b++){var hh=Math.max(.08,pk[b])*r.h*.8;ctx.fillRect(r.x+b*bw+bw*.2,r.cy-hh/2,Math.max(.8,bw*.6),hh)}}
      else if(!im&&r.w>30){ctx.fillStyle='rgba(230,237,240,.85)';ctx.font='400 '+Math.max(8,Math.round(r.h*.16))+'px "Julius Sans One", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(trunc(x.title,r.w-6),r.cx,r.cy)}
      var bc=bcol(x,.95)||'rgba(200,225,255,'+(.15+.35*x.b).toFixed(2)+')';
      ctx.strokeStyle=bc;ctx.lineWidth=x.badge?2:1;ctx.strokeRect(r.x+.5,r.y+.5,r.w-1,r.h-1);ctx.lineWidth=1;
      /* v5 AGE: older work a touch dimmer, never more than a .2 veil; picks full brightness */
      if(!x.pick&&x.b<.995){ctx.fillStyle='rgba(3,5,10,'+((1-x.b)*.8).toFixed(3)+')';ctx.fillRect(r.x,r.y,r.w,r.h)}
      if(x===SELI){ctx.strokeStyle=MINT;ctx.lineWidth=2;ctx.strokeRect(r.x-2.5,r.y-2.5,r.w+5,r.h+5);ctx.lineWidth=1}
      /* labels in the frame around each poster: kind + title */
      var la2=a*cl((k-.7)/.25)*(1-cl(M*3));if(la2>.02&&r.w>40){var tx=r.x,ty=r.y+r.h+3;ctx.globalAlpha=la2;ctx.textAlign='left';ctx.textBaseline='top';
        ctx.font='300 9.5px ui-monospace, Menlo, monospace';ctx.fillStyle=x.badge==='New'?MINT:x.badge?'#5fd3f5':'#93a1a6';ctx.fillText(trunc((x.badge?'★ ':'')+x.meta,r.w),tx,ty);
        ctx.font='300 11px Poppins, sans-serif';ctx.fillStyle=x===SELI?MINT:'#e6edf0';ctx.fillText(trunc(x.title,r.w+8),tx,ty+12)}
      ctx.globalAlpha=1});
    /* L0: the chapter's first poster beside each constellation */
    var na=fade*(1-cl(k*2.5))*cl(1.6-(z-1)*.8);if(na>.02&&g.newest){var im2=img(g.newest),p=sp(g.x,g.y),rr=g.r*cam.s,w2=58,h2=g.sec.sq?44:33,px,py,ok=false,cands=[[p[0]+rr+14,p[1]-h2/2-8],[p[0]-rr-14-w2,p[1]-h2/2-8],[p[0]-w2/2,p[1]-rr-h2-18],[p[0]+rr*.5,p[1]+rr*.6]];
      for(var ci=0;ci<cands.length&&!ok;ci++){px=cands[ci][0];py=cands[ci][1];if(px<4||px+w2>W-4||py<TOP||py+h2+13>H-BOT)continue;ok=free({x:px,y:py,w:w2,h:h2+13})}if(ok){ctx.globalAlpha=na;if(im2)cover(im2,px,py,w2,h2);else{ctx.fillStyle='rgba(16,28,40,.9)';ctx.fillRect(px,py,w2,h2)}ctx.strokeStyle=bcol(g.newest,.9)||'rgba(200,225,255,.45)';ctx.strokeRect(px+.5,py+.5,w2-1,h2-1);
        ctx.font='300 9px ui-monospace, Menlo, monospace';ctx.fillStyle='#93a1a6';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(trunc(g.newest.title,w2+30),px,py+h2+2);ctx.globalAlpha=1}}
  })}
/* ---------------- HUD: constellation names are real buttons (44px+) placed under each figure ---------------- */
var HB={};
function buildHud(){slabs.innerHTML=GROUPS.map(function(g){var s=g.sec;
  return'<button type="button" class="sl" data-g="'+esc(g.id)+'"><b>'+esc(g.title)+'</b><small>'+esc(count(s))+'</small></button>'}).join('');
  $$('.sl',slabs).forEach(function(b){HB[b.dataset.g]=b})}
function placeHud(){var rects=[];GROUPS.forEach(function(g){var b=HB[g.id];if(!b)return;var p=sp(g.x,g.y),bw=b.offsetWidth||96,bh=b.offsetHeight||44,rr=g.r*cam.s,vis=(1-g.k*1.6)*(1-cl(M*3));
    var cand=[[p[0]-bw/2,p[1]+rr+2],[p[0]-bw/2,p[1]-rr-bh-2],[p[0]+rr+6,p[1]-bh/2],[p[0]-rr-6-bw,p[1]-bh/2]],x=cand[0][0],y=cand[0][1];
    for(var i=0;i<cand.length;i++){var q=cand[i];q[0]=Math.max(2,Math.min(W-bw-2,q[0]));if(!rects.some(function(r){return q[0]<r.x+r.w&&q[0]+bw>r.x&&q[1]<r.y+r.h&&q[1]+bh>r.y})){x=q[0];y=q[1];break}}
    var on=mode!=='grid'&&vis>.15&&p[0]>-30&&p[0]<W+30&&y>TOP-10&&y+bh<H-BOT+10;b.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';b.style.opacity=on?Math.min(1,vis*1.3).toFixed(2):'0';b.style.visibility=on?'':'hidden';b.tabIndex=on?0:-1;
    if(on){rects.push({x:x,y:y,w:bw,h:bh});labRects.push({x:x,y:y,w:bw,h:bh})}})}
/* the frame: what is in view */
var lastCap='';
function frameCaps(){var g=FSG||nearest(),show=mode!=="grid"&&g.k>.6&&!tw&&M<.04;var t='',b='';
  if(show){var s=g.sec;t=count(s)+' in '+s.title+(s.sum?' · '+s.sum:'');
    var best=SELI&&SELI.g===g?SELI:null;if(!best){var c=wp(W/2,VC),bd=1e9;g.items.forEach(function(x){var d=Math.hypot(x.x-c[0],x.y-c[1]);if(d<bd){bd=d;best=x}})}
    if(best)b='<b>'+esc(best.title)+'</b><span>'+esc(best.meta)+(best===SELI?' · press again to open':'')+'</span>'+(best.badge?'<span class="badge">'+esc(best.badge)+'</span>':'')}
  var key=t+'|'+b;if(key===lastCap)return;lastCap=key;fcapT.hidden=!t;fcapB.hidden=!b;fcapT.textContent=t;fcapB.innerHTML=b;fcapB.classList.toggle('sel',!!(SELI&&b.indexOf('press again')>0))}
/* ---------------- loop ---------------- */
function req(){if(!raf&&open)raf=requestAnimationFrame(frame)}
function frame(){var now=performance.now();raf=0;if(tw){var u=Math.min(1,(now-tw.t0)/tw.dur),e=ease(u);cam=interp(tw.c0,tw.c1,e);M=lerp(tw.m0,tw.m1,e);if(u>=1){var d=tw.done;tw=null;d&&d()}}
  layout();labRects=[];placeHud();draw();frameCaps();ui();if(tw)req()}

/* ---------------- levels ---------------- */
function lvNow(){return player.hidden?(mode==='grid'?2:mode==='chap'?1:0):3}
function inView(){if(!player.hidden&&PL)return SBY[PL.x.sec];if(mode==='grid'&&FS)return FS;if(FSG)return FSG;if(cam.s>fitS()*1.3||mode==='chap'){var g=nearest();return g}return null}
function nameOf(v){if(!v)return'whole sky';return v.title}
var lastUi='';
function ui(){var lv=lvNow(),v=inView(),nm=nameOf(v),lab=lv===3?(PL?PL.x.title:nm):nm+' · '+['sky','constellation','board','work'][lv];
  var cr=lv===0?'Gill James':nm,sub=lv===0?'Cinematographer + Artist + Spatial Designer':lv===1?(v&&v.sec?count(v.sec):'constellation'):lv===2?(FS?count(FS):''):'';
  var key=lab+'|'+cr+'|'+sub+'|'+lv;if(key===lastUi)return;lastUi=key;zn.textContent=lab;dots.textContent=[0,1,2,3].map(function(i){return i<=lv?'●':'○'}).join('');
  crumb.innerHTML=esc(cr)+(sub?'<small>'+esc(sub)+'</small>':'');zout.disabled=lv===0&&cam.s<=fitS()*1.05;zin.disabled=lv===3||(lv===2&&!SELB);
  D.classList.toggle('lv0',lv===0&&cam.s<fitS()*1.6)}
function settle(m,g,o){o=o||{};if(m!=='sky')hint.classList.add('off');mode=m;FG=g||null;if(m!=='grid'){FS=FSG?FSG.sec:null}var h=m==='sky'?'#sky':m==='chap'?'#sky/'+g.id:'#'+FS.id;
  if(o.push!==false&&location.hash!==h)history[o.replace?'replaceState':'pushState']({pv:1},'',h);lastUi='';req()}
function toSky(o){o=o||{};FG=null;unprep();closeGrid();tween(fitCam(),0,o.dur!=null?o.dur:850,function(){settle('sky',null,o)})}
function toChap(g,o){o=o||{};if(mode==='grid'){pullOut(g,o);return}if(FSG&&FSG!==g)unprep();tween(chapCam(g),0,o.dur!=null?o.dur:900,function(){unprep();settle('chap',g,o)})}
/* L1 -> L2: build the chapter's board invisibly, measure where each tile's picture is, fly the posters there, then hand over */
function dive(s,x,o){o=o||{};if(!s)return;var g=x?x.g:(FG&&FG.sec===s?FG:s.main);
  if(!(FSG===g&&M>0)){FS=s;FSG=g;buildGrid(s,x);TG=measure();stagger(s)} /* v5: a dive already under way (a pinch you let go of half way) carries on from where it is */
  var to=mode==='chap'&&FG===g||FSG===g&&M>0?{x:cam.x,y:cam.y,s:cam.s}:chapCam(g),fast=o.dur===0;
  if(mode==='sky'&&M===0&&!fast&&anim()){tween(chapCam(g),0,750,function(){mode='chap';FG=g;tween(chapCam(g),1,750,done)})}else tween(to,1,fast?0:800*(1-M*.7),done);
  function done(){commit(g,o);if(x)hit(x);if(o.play&&x)setTimeout(function(){openWork(x,{push:o.push})},anim()?120:0)}}
function stagger(s){ITEMS.forEach(function(it){it.mi=it.sec===s.id?(s.items.indexOf(it)/Math.max(1,s.items.length-1)):0})}
function commit(g,o){o=o||{};mode='grid';FG=g;FS=g.sec;grid.classList.remove('pre');settle('grid',g,o);if(SELI)selTile($('li[data-k="'+SELI.k+'"]',grid));SELI=null;req()}
function measure(){var t={};$$('li[data-k]',grid).forEach(function(li){var m=$('.vis',li),r=m.getBoundingClientRect();if(r.bottom>TOP-40&&r.top<H+40){t[li.dataset.k]={x:r.left,y:r.top,w:r.width,h:r.height};load($('img',li))}});return t}
function buildGrid(s,x){if(grid.dataset.sec!==s.id){kill(grid);grid.innerHTML=band(s,false);grid.dataset.sec=s.id;wire(grid);boardLines(grid)}else if(x===undefined)return;grid.hidden=false;grid.classList.add('pre');
  var li=x&&$('li[data-k="'+x.k+'"]',grid);grid.scrollTop=li?Math.max(0,li.offsetTop-H*.3):0}
function hit(x){var li=$('li[data-k="'+x.k+'"]',grid);if(li){li.classList.remove('hit');void li.offsetWidth;li.classList.add('hit')}}
function pullOut(g,o){o=o||{};g=g||FG||(FS&&FS.main);if(!g){toSky(o);return}TG=measure();grid.classList.add('pre');deselect();$$('video,audio',grid).forEach(function(m){m.pause()});mode='chap';FSG=g;FS=g.sec;stagger(g.sec);M=1;cam=chapCam(g);
  tween(chapCam(g),0,o.dur!=null?o.dur:800,function(){unprep();settle('chap',g,o)})}
function closeGrid(){if(grid.hidden)return;deselect();kill(grid);grid.innerHTML='';grid.dataset.sec='';grid.hidden=true;grid.classList.add('pre');if(mode==='grid')mode='chap'}
function unprep(){if(mode==='grid')return;FSG=null;M=0;TG=null;closeGrid()}
function step(dir){if(tw)return;var lv=lvNow();
  if(dir>0){if(lv===0){var g=cam.s<=fitS()*1.05?GROUPS[0]:nearest();toChap(g)}else if(lv===1)dive((FSG||nearest()).sec,SELI&&SELI.g===(FSG||nearest())?SELI:null);else if(lv===2&&SELB)openWork(byK(SELB.dataset.k))}
  else{if(lv===3)closePlayer();else if(lv===2)pullOut(FG);else if(lv===1&&M>0)pullOut(FSG,{});else if(lv===1||cam.s>fitS()*1.05)toSky()}}

/* ---------------- v5 SELECT: one press selects, a press on the selected work opens it ---------------- */
var SELB=null;
function deselect(){if(SELB){SELB.classList.remove('sel');var v=$('video.loop',SELB);if(v){v.pause();v.removeAttribute('src');v.load();v.remove()}SELB=null;lastUi='';ui()}}
function selTile(li){deselect();if(!li)return;SELB=li;li.classList.add('sel');var x=byK(li.dataset.k);
  /* a selected film shows its moving frame: a silent loop in the tile (never sound on select) */
  if(x.d.sc&&anim()){var v=document.createElement('video');v.className='loop';v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.preload='auto';v.src=x.d.sc;$('.vis',li).appendChild(v);var p=v.play();if(p&&p.catch)p.catch(function(){})}
  lastUi='';ui()}
grid.addEventListener('click',function(e){var a=e.target.closest('a.tile');if(!a)return;var li=a.parentNode,x=byK(li.dataset.k);
  if(e.detail!==0&&SELB!==li){e.preventDefault();selTile(li);return} /* first press: select (silently) */
  if(x.type==='link'){deselect();return} /* second press on a link: the link itself opens */
  e.preventDefault();openWork(x)});

/* ---------------- L3: the work ---------------- */
var PL=null,pcap=$('#pcap'),pdesc=$('#pdesc'),pimg=$('.pimg',player),ptext=$('.ptext',player),pemb=$('.pemb',player),pnote=$('.pnote',player),pcase=$('#pcase'),pfs=$('#pfs');
function openWork(x,o){if(!x)return;if(x.type==='audio'){playSong(x);return}if(x.type==='link'){var u=x.d.url;if(/^mailto:/.test(u))location.href=u;else window.open(u,'_blank','noopener');return}openPlayer(x,o)}
function openPlayer(x,o){o=o||{};var d=x.d,li=$('li[data-k="'+x.k+'"]',grid),vis=li&&$('.vis',li),r=vis?vis.getBoundingClientRect():null;
  PL={x:x,part:0};pv.hidden=pimg.hidden=ptext.hidden=pemb.hidden=pnote.hidden=true;pv.removeAttribute('src');pemb.removeAttribute('src');var el=null;
  if(x.type==='video'&&d.parts){pv.hidden=false;pv.poster=d.big||x.poster||'';pv.src=d.parts[0].src;pv.preload='metadata';el=pv}
  else if(x.type==='video'&&d.embed){pemb.hidden=false;pemb.src=d.embed;el=pemb}
  else if(x.type==='video'){pimg.hidden=false;pimg.src=d.big||x.poster;pimg.alt=x.title;el=pimg;pnote.hidden=false;pnote.innerHTML='full film coming soon'+(d.url?' · <a href="'+esc(d.url)+'" target="_blank" rel="noopener">watch on '+(/youtu/.test(d.url)?'YouTube':'Vimeo')+' ↗</a>':'')}
  else if(x.type==='image'){pimg.hidden=false;pimg.src=d.big||x.poster;pimg.alt=d.alt||x.title;el=pimg}
  else{ptext.hidden=false;ptext.className='ptext'+(d.lines?' lines':'');ptext.innerHTML=(d.text||[]).map(function(t){return'<p>'+esc(t)+'</p>'}).join('')+(x.stem==='bio'?'<p><a class="btn" href="mailto:imjamesgill@gmail.com?subject=Hiring%20Gill%20James">hire · imjamesgill@gmail.com</a></p>':'');el=ptext}
  pcase.hidden=!d.case;if(d.case)pcase.href=V5+'case/'+d.case+'/';pfs.hidden=!(x.type==='video'&&d.parts);
  pcap.innerHTML='<b>'+esc(x.title)+'</b><small>'+esc(x.meta)+(x.badge?' · ★ '+esc(x.badge):'')+'</small>';pdesc.textContent=d.desc||'';pdesc.hidden=!d.desc;
  player.hidden=false;player.getAnimations&&player.getAnimations().forEach(function(a){a.cancel()});D.classList.add('pl-on');
  if(el===pv){var pr=pv.play();if(pr&&pr.catch)pr.catch(function(){})}
  if(r&&anim()&&el&&el.animate){var q=el.getBoundingClientRect();if(q.width&&q.height){var sx=r.width/q.width,sy=r.height/q.height;
    el.animate([{transformOrigin:'0 0',transform:'translate('+(r.left-q.left)+'px,'+(r.top-q.top)+'px) scale('+sx+','+sy+')'},{transformOrigin:'0 0',transform:'none'}],{duration:420*(window.__slow||1),easing:'cubic-bezier(.2,.8,.2,1)'});
    player.animate([{backgroundColor:'rgba(0,0,0,0)'},{backgroundColor:'#000'}],{duration:300*(window.__slow||1)})}}
  setTimeout(function(){try{$('#pclose').focus({preventScroll:true})}catch(e){}},30);
  if(o.push!==false&&D.classList.contains('sky-on')){var h='#'+x.sec+'/'+encodeURIComponent(x.stem);if(location.hash!==h)history.pushState({pv:1,pl:1},'',h)}lastUi='';ui()}
pv.addEventListener('ended',function(){if(!PL)return;var ps=PL.x.d.parts;if(ps&&PL.part+1<ps.length){PL.part++;pv.src=ps[PL.part].src;var p=pv.play();if(p&&p.catch)p.catch(function(){})}}); /* films cut into parts play straight through */
var closing=0;function closePlayer(o){o=o||{};if(player.hidden||closing)return;closing=1;var x=PL&&PL.x;pv.pause();
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});
  var li=x&&$('li[data-k="'+x.k+'"]',grid);
  var ended=0;function end(){if(ended)return;ended=1;closing=0;player.hidden=true;D.classList.remove('pl-on');pv.removeAttribute('src');pemb.removeAttribute('src');try{pv.load()}catch(e){}if(li)li.scrollIntoView({block:'nearest'});PL=null;lastUi='';ui();
    var a=li&&$('a',li);if(a)try{a.focus({preventScroll:true})}catch(e){}}
  if(anim()&&player.animate){var d=200*(window.__slow||1);player.animate([{opacity:1},{opacity:0}],{duration:d,fill:'forwards'}).onfinish=end;setTimeout(end,d+80)}else end();
  if(o.push!==false&&D.classList.contains('sky-on')&&FS){var h='#'+FS.id;if(history.state&&history.state.pl)history.back();else if(location.hash!==h)history.replaceState({pv:1},'',h)}}
$('#pclose').addEventListener('click',function(){closePlayer()});
pfs.addEventListener('click',function(){/* Android: real fullscreen on the video; iPhone: only the video element can go fullscreen */
  if(pv.requestFullscreen)pv.requestFullscreen().catch(function(){if(pv.webkitEnterFullscreen)pv.webkitEnterFullscreen()});else if(pv.webkitEnterFullscreen)pv.webkitEnterFullscreen()});
/* Sound: the second press plays the song here (the first press only selected it) */
var np=$('#np'),au=$('audio',np),npn=$('#npn'),npa=$('#npa'),npf=$('#npf'),npb=$('#npb'),SONG=null;
function playSong(x){SONG=x;if(au.getAttribute('src')!==x.d.file)au.src=x.d.file;npn.textContent=x.title;npa.textContent=x.d.artist;np.hidden=false;D.classList.add('np-on');var p=au.play();if(p&&p.catch)p.catch(function(){});$$('li.playing',grid).forEach(function(l){l.classList.remove('playing')});var li=$('li[data-k="'+x.k+'"]',grid);if(li)li.classList.add('playing')}
au.addEventListener('timeupdate',function(){npf.style.transform='scaleX('+(au.duration?au.currentTime/au.duration:0).toFixed(4)+')'});
au.addEventListener('play',function(){npb.textContent='❚❚';npb.setAttribute('aria-label','Pause')});au.addEventListener('pause',function(){npb.textContent='▶';npb.setAttribute('aria-label','Play')});
npb.addEventListener('click',function(){if(au.paused){var p=au.play();if(p&&p.catch)p.catch(function(){})}else au.pause()});
$('#npx').addEventListener('click',function(){au.pause();au.removeAttribute('src');au.load();np.hidden=true;D.classList.remove('np-on');$$('li.playing').forEach(function(l){l.classList.remove('playing')})});

/* ---------------- gestures ---------------- */
/* sky: pointer events (touch-action:none, so the browser never zooms the page). One finger pans, two drive the camera, tap selects / flies in. */
var PT=new Map(),pd=0,pm=null,moved=0,t0=0,pinched=false;
function capS(px,py){var g=FSG||nearest(px,py);return chapS(g)*DEEP*1.0005}
function zoomAt(f,x,y,cap){var p=wp(x,y);cam.s=Math.max(fitS()*.7,Math.min(cap||8,cam.s*f));cam.x=p[0]-(x-W/2)/cam.s;cam.y=p[1]-(y-VC)/cam.s}
function clampCam(){var m=Math.max(60,40/cam.s);cam.x=Math.max(B.x0-m,Math.min(B.x1+m,cam.x));cam.y=Math.max(B.y0-m,Math.min(B.y1+m,cam.y))}
/* v5 DEPTH: past a constellation's L1 the camera's depth IS the travel into its board */
function depth(f){if(mode==='grid'||tw)return;var g=FSG||nearest(),cs=chapS(g),u=(cam.s/cs-1.02)/(DEEP-1.02);
  if(u>0){if(FSG!==g||!TG){FS=g.sec;FSG=g;buildGrid(g.sec,null);TG=measure();stagger(g.sec)}M=cl(u);if(M>=.999&&f>1.0001){M=1;commit(g,{replace:true})}}
  else if(FSG){M=0;FSG=null;TG=null;closeGrid()}}
function pinchBy(f,mx,my,dx,dy){tw=null;cam.x-=dx/cam.s;cam.y-=dy/cam.s;zoomAt(f,mx,my,capS(mx,my));clampCam();depth(f);req()}
sky.addEventListener('pointerdown',function(e){if(e.target.closest('.sl'))return;try{sky.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(PT.size===1){moved=0;t0=Date.now();pinched=false}if(PT.size===2){var a=Array.from(PT.values());pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);pm={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};moved=99;pinched=true;tw=null}});
sky.addEventListener('pointermove',function(e){if(!PT.has(e.pointerId)||mode==='grid')return;var o=PT.get(e.pointerId),n={x:e.clientX,y:e.clientY};PT.set(e.pointerId,n);
  if(PT.size===1){var dx=n.x-o.x,dy=n.y-o.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>8){tw=null;cam.x-=dx/cam.s;cam.y-=dy/cam.s;clampCam();req()}}
  else if(PT.size===2){var a=Array.from(PT.values()),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};if(!pd){pd=d;pm=m;return}
    var f=d/pd;pd=d;var ddx=m.x-pm.x,ddy=m.y-pm.y;pm=m;pinchBy(f,m.x,m.y,ddx,ddy)}});
function up(e){if(!PT.has(e.pointerId))return;var was=PT.size;PT.delete(e.pointerId);if(PT.size<2)pd=0;if(PT.size)return;
  if(was===1&&moved<10&&Date.now()-t0<500){tap(e.clientX,e.clientY);return}if(pinched||moved>8)rest()}
sky.addEventListener('pointerup',up);sky.addEventListener('pointercancel',function(e){PT.delete(e.pointerId);if(!PT.size&&(pinched||moved>8))rest()});
/* v5 NO SNAP: letting go leaves the camera exactly where it is; only the level's name (and the address) follow */
function rest(){if(mode==='grid'||tw)return;var g=FSG||nearest(),cs=chapS(g),f=fitS();
  if(FSG&&M>0){mode='chap';FG=FSG;settle('chap',FSG,{replace:true})}
  else if(cam.s>=Math.sqrt(f*cs)*.9&&g.k>.3)settle('chap',g,{replace:true});else settle('sky',null,{replace:true})}
function tap(x,y){if(tw)return;var lv=lvNow();
  if(lv===1||cam.s>fitS()*1.6){var best=null;GROUPS.forEach(function(g){if(g.k<.5)return;g.items.forEach(function(it){var r=it.dr;if(r&&r.w>=9&&x>=r.x-4&&x<=r.x+r.w+4&&y>=r.y-4&&y<=r.y+r.h+26)best=it})});
    if(best){if(SELI===best){SELI=null;dive(best.g.sec,best,{play:true})}else{SELI=best;lastCap='';req()}return}} /* v5 SELECT: once selects, again opens */
  var bg=null,bd=1e9;GROUPS.forEach(function(g){var p=sp(g.x,g.y),d=Math.hypot(p[0]-x,p[1]-y)-g.r*cam.s;if(d<bd){bd=d;bg=g}});
  if(bg&&bd<40){if(mode==='chap'&&FG===bg||FSG===bg)dive(bg.sec);else{SELI=null;toChap(bg)}}else if(SELI){SELI=null;req()}}
slabs.addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(!b)return;var g=GBY[b.dataset.g];if(g)toChap(g)});
var wheelK=0;
sky.addEventListener('wheel',function(e){e.preventDefault();if(mode==='grid')return;tw=null;var f=Math.exp(-e.deltaY*(e.ctrlKey?.01:.0022));pinchBy(f,e.clientX,e.clientY,0,0);clearTimeout(wheelK);wheelK=setTimeout(rest,280)},{passive:false});
/* iOS Safari: its own gesture events must never zoom the page over the sky or the player */
['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){if(D.classList.contains('sky-on')||!player.hidden)e.preventDefault()},{passive:false})});
/* v5 DEPTH back out: two fingers pinching in on the board hand it back to the sky right away and drive the same camera
   (the board's tiles become the posters where they stand); pinch apart again and it lands back on the board */
function handBack(){if(mode!=='grid'||!FG)return false;var g=FG;deselect();TG=measure();grid.classList.add('pre');$$('video',grid).forEach(function(m){m.pause()});
  mode='chap';FSG=g;FS=g.sec;stagger(g.sec);var c=chapCam(g);cam={x:c.x,y:c.y,s:chapS(g)*DEEP};M=1;tw=null;req();return true}
(function(){var d0=0,pd2=0,pm2=null,live=false,rk=0;
  grid.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];d0=pd2=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);pm2={x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2};live=false}},{passive:true});
  grid.addEventListener('touchmove',function(e){if(e.touches.length!==2||!d0)return;if(e.cancelable)e.preventDefault();var a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),m={x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2};
    if(!live){if(d/d0<.96&&!tw&&player.hidden){live=handBack();pd2=d;pm2=m}return}
    if(mode==='grid'){pd2=d;pm2=m;if(d/pd2<.995){}return}
    var f=d/pd2;pd2=d;var dx=m.x-pm2.x,dy=m.y-pm2.y;pm2=m;pinchBy(f,m.x,m.y,dx,dy);
    /* once the board's tiles are cleared the browser can drop the touchend (detached target), so settle the route a beat after the last move as well; rest() never moves the camera */
    clearTimeout(rk);rk=setTimeout(function(){if(mode!=='grid'&&!tw)rest()},320)},{passive:false});
  function end(e){if(e.touches.length<2&&d0){d0=0;if(live){live=false;if(mode!=='grid')rest()}}}
  grid.addEventListener('touchend',end,{passive:true});grid.addEventListener('touchcancel',end,{passive:true})})();
/* trackpad pinch (ctrl + wheel) out on the board does the same; plain wheel / scrolling stays the board's own */
grid.addEventListener('wheel',function(e){if(!e.ctrlKey||e.deltaY<=0||mode!=='grid'||tw)return;e.preventDefault();if(handBack()){pinchBy(Math.exp(-e.deltaY*.01),e.clientX,e.clientY,0,0);clearTimeout(wheelK);wheelK=setTimeout(rest,280)}},{passive:false});
/* the work view: pinch in closes it (read at release; never swaps the DOM mid-gesture) */
function twoFinger(el,cb){var d0=0,d1=0;el.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];d0=d1=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}},{passive:true});
  el.addEventListener('touchmove',function(e){if(e.touches.length===2&&d0){var a=e.touches[0],b=e.touches[1];d1=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}},{passive:true});
  el.addEventListener('touchend',function(e){if(e.touches.length===0&&d0){var r=d1/d0;d0=0;if(r<.78||r>1.3)setTimeout(function(){cb(r)},0)}},{passive:true});
  el.addEventListener('touchcancel',function(){d0=0},{passive:true})}
twoFinger(player,function(r){if(r<1)closePlayer()});
zin.addEventListener('click',function(){step(1)});zout.addEventListener('click',function(){step(-1)});
$('#home').addEventListener('click',function(){if(!player.hidden)closePlayer({push:false});toSky()});
addEventListener('keydown',function(e){if(!open)return;if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='+'||e.key==='='){e.preventDefault();step(1)}else if(e.key==='-'||e.key==='_'){e.preventDefault();step(-1)}else if(e.key==='Escape'){e.preventDefault();step(-1)}});

/* ---------------- modes, sizing, routing ---------------- */
function size(){var r=sky.getBoundingClientRect();W=r.width||innerWidth;H=r.height||innerHeight;dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  TOP=hud.offsetHeight||52;BOT=bar.offsetHeight||66;VH=H-TOP-BOT;VC=TOP+VH/2}
function setMode(m){D.classList.add('ready');if(m==='list'||!ctx){if(!player.hidden)closePlayer({push:false});D.classList.remove('sky-on');[sky,hud,bar,fcapT,fcapB,hint,feat].forEach(function(el){el.hidden=true});closeGrid();open=false;renderList();return}
  if(open)return;kill(list);list.innerHTML='';D.classList.add('sky-on');[sky,hud,bar,hint,feat].forEach(function(el){el.hidden=false});open=true;size();layoutWorld();lastUi='';
  hint.classList.remove('off');clearTimeout(hint._t);hint._t=setTimeout(function(){hint.classList.add('off')},5200);req()}
function parse(h){h=decodeURIComponent((h||'').replace(/^#/,''));if(h==='list'||/^list\//.test(h))return{list:1,sec:h.slice(5)};
  if(!h||h==='sky')return{lv:0};var m=/^sky\/(.+)$/.exec(h);if(m)return GBY[m[1]]?{lv:1,g:GBY[m[1]]}:{lv:0};
  var p=h.split('/');if(SBY[p[0]]){var s=SBY[p[0]],x=p[1]?s.items.filter(function(i){return i.stem===p[1]})[0]:null;return{lv:2,s:s,x:x}}return{lv:0}}
function route(h,o){o=o||{};var r=parse(h),q={push:false,dur:o.anim?undefined:0};
  if(r.list){setMode('list');if(r.sec){var el=document.getElementById(r.sec);if(el)el.scrollIntoView({block:'start'})}return}
  setMode('sky');if(!player.hidden&&!(r.x&&PL&&PL.x===r.x))closePlayer({push:false});
  if(r.lv===0){if(mode==='grid')pullOut(FG,{push:false,dur:q.dur});toSky(q)}
  else if(r.lv===1)toChap(r.g,q);
  else if(r.lv===2){if(mode==='grid'&&FS===r.s){if(r.x&&player.hidden)openWork(r.x,{push:false})}else{if(mode==='grid')closeGrid();unprep();dive(r.s,r.x,{push:false,dur:q.dur,play:!!r.x&&r.x.type!=='audio'&&r.x.type!=='link'})}}}
addEventListener('popstate',function(){route(location.hash,{anim:true})});
$('#toList').addEventListener('click',function(){history.pushState({pv:1},'','#list');setMode('list');scrollTo(0,0)});
$('#toSky').addEventListener('click',function(){history.pushState({pv:1},'','#sky');setMode('sky');cam=fitCam();M=0;settle('sky',null,{push:false})});
jump.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var id=(a.getAttribute('href')||'').replace(/^#(list\/)?/,''),el=document.getElementById(id);if(el){e.preventDefault();history.replaceState({pv:1},'','#list/'+id);el.scrollIntoView({block:'start'})}});
var rsz=0;addEventListener('resize',function(){if(!open)return;clearTimeout(rsz);rsz=setTimeout(function(){var c0=cols();size();if(cols()!==c0||true){layoutWorld()}
  if(mode==='grid')boardLines(grid);if(!tw){if(mode==='sky')cam=fitCam();else if(mode==='chap'&&FG&&!M)cam=chapCam(FG)}req()},80)});
if(RM.addEventListener)RM.addEventListener('change',req);

/* ---------------- boot ---------------- */
fetch(V5+'works.json?v=5a',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(data){
  prep(data);var h=location.hash;if(!ctx||!ITEMS.length){setMode('list');return}
  setMode('sky');buildHud();GROUPS.forEach(function(g){if(g.newest)img(g.newest)});cam=fitCam();M=0;layout();
  if(/^#?$/.test(h)||h==='#sky'){var f=fitCam();if(anim()){cam={x:f.x,y:f.y,s:f.s*.7};tween(f,0,900,function(){settle('sky',null,{push:false})})}else settle('sky',null,{push:false})}
  else route(h,{anim:false});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){lastUi='';req()});
}).catch(function(e){setMode('list');list.innerHTML='<p class="err">Could not load works.json ('+esc(e.message)+').</p>'});

window.__sky={state:function(){var st={open:open,mode:mode,lv:lvNow(),g:FG&&FG.id,sec:FS&&FS.id,m:+M.toFixed(3),s:+cam.s.toFixed(4),fit:+fitS().toFixed(4),moving:!!tw,player:!player.hidden,label:zn.textContent,hash:location.hash,
  sel:SELI?SELI.sec+'/'+SELI.stem:null,selb:SELB?byK(SELB.dataset.k).sec+'/'+byK(SELB.dataset.k).stem:null,song:SONG&&!au.paused?SONG.title:null,
  groups:GROUPS.map(function(g){var p=sp(g.x,g.y);return{id:g.id,x:+p[0].toFixed(1),y:+p[1].toFixed(1),k:+(g.k||0).toFixed(2),chap:+chapS(g).toFixed(3),deep:+(chapS(g)*DEEP).toFixed(3),n:g.items.length}})};return st},
  items:function(id){var g=GBY[id];return g.items.map(function(x){var r=x.dr||rectL1(x);return{k:x.k,id:x.stem,title:x.title,x:+(r.x+r.w/2).toFixed(1),y:+(r.y+r.h/2).toFixed(1),w:+r.w.toFixed(1)}})},step:step,route:function(h){history.replaceState({pv:1},'',h);route(h,{anim:true})},
  cam:function(){return{x:cam.x,y:cam.y,s:cam.s}}};
})();
