/* C · Trail Line — the site is one walked trail, drawn in Gill's graphite. Five signed stops, each led by its strongest piece.
   Scroll / swipe = walk (nothing moves on its own). Tap a sign or its work = the stop opens from that sign.
   ‹ trail · Esc · Back · swipe right = back to that exact sign. Next stop › walks on. */
(function(){'use strict';if(G.V!=='C')return;
var d=document,app=d.getElementById('app'),R=G.R,el=G.el,img=G.img,esc=G.esc,D=G.D;
var STOPS=[{k:'spaces',lead:D.spaces[0].src,leadAr:D.spaces[0].w/D.spaces[0].h,sec:[D.spaces[1],D.spaces[3]]},
  {k:'film',lead:D.film[0].stills[0].src,leadAr:D.film[0].stills[0].w/D.film[0].stills[0].h,sec:[{src:D.film[1].stills[1].src,w:D.film[1].stills[1].w,h:D.film[1].stills[1].h}]},
  {k:'objects',lead:G.item('objects','crescent-rim-of-a-cup').src,leadAr:1,sec:[G.item('objects','stone-paper-cup'),G.item('objects','carved-spoon')]},
  {k:'photo',lead:G.item('photo','efb2a65e').src,leadAr:1.5,sec:[G.item('photo','5f537dc1'),G.item('photo','6a1d5ad8')]},
  {k:'about'}];
var walk=el('div','c-walk',null,app),land=el('div','c-land',null,walk);
var svgNS='http://www.w3.org/2000/svg',trail=d.createElementNS(svgNS,'svg');trail.setAttribute('class','c-trail');land.appendChild(trail);
var top=el('header','c-top','<a class="c-wm" href="#/">Gill James</a><span class="c-sub">a trail · five stops · Vancouver</span><button class="c-map" type="button">map</button>',app);
var prof=el('div','c-prof',null,app);prof.setAttribute('aria-label','trail profile: drag to walk');
var page=el('section','c-page',null,app);page.setAttribute('aria-label','stop');
var idx=G.index(function(r){var p=r.split('/'),k=p[0],id=p.slice(1).join('/');if(id){var vs=views(k);for(var j=0;j<vs.length;j++)if(vs[j].it.id===id){sel[k]=j;break}}R.go(k,{replace:true})});
/* index and nav follow the walk: Spaces, Film, Objects, Photo, About */
(function(){var want=STOPS.map(function(s){return G.room(s.k).n}),box=idx.querySelector('.gi-in');
  [].slice.call(box.querySelectorAll('section')).sort(function(a,b){return want.indexOf(a.querySelector('h3').textContent)-want.indexOf(b.querySelector('h3').textContent)}).forEach(function(s){box.appendChild(s)})})();
G.player();G.devToggle();
var PORT,LEN,SIGNS=[],openK=null,sel={};
/* bands: the fixed UI (wordmark row on top; player, profile, dev toggle at the bottom) owns its strip, the work never runs under it */
var TB=70,BB=70;
function bands(){var H=innerHeight,tb=0,bb=H;
  top.querySelectorAll('.c-wm,.c-sub,.c-map').forEach(function(e){var r=e.getBoundingClientRect();if(r.width&&getComputedStyle(e).display!=='none')tb=Math.max(tb,r.bottom)});
  /* on a phone the ladder is a side rail, not part of the bottom band */
  [d.getElementById('gplay'),d.getElementById('dev'),(PORT||openK)?null:prof].forEach(function(e){if(!e)return;var r=e.getBoundingClientRect();if(r.width&&r.height)bb=Math.min(bb,r.top)});
  TB=Math.ceil(tb+10);BB=Math.ceil(H-bb+10);d.documentElement.style.setProperty('--tb',TB+'px');d.documentElement.style.setProperty('--bb',BB+'px')}
function layout(){PORT=innerHeight>innerWidth*1.05;walk.classList.toggle('port',PORT);bands();
  var W=innerWidth,H=PORT?innerHeight-TB-BB:innerHeight,M=PORT?16:22;land.innerHTML='';land.appendChild(trail);SIGNS=[];
  var c0=PORT?14:TB,c1=PORT?W-58:H-BB,AH=c1-c0; /* phone keeps a right gutter for the ladder */
  var view=PORT?H:W,start=PORT?H*.36:W*.36,gap=PORT?H*.5:W*.3;
  var groups=[];
  STOPS.forEach(function(s,i){var a=start+gap*i,side=i%2?1:-1,sx,sy;
    if(PORT){sx=W*(.5+side*.22);sy=a}else{sx=a;sy=side<0?c0+112:c1-6}
    var g=el('div','c-stop',null,land);g.dataset.k=s.k;var items=[];
    var sign=el('button','c-sign','<span class="no">0'+(i+1)+'</span><span class="nm">'+G.room(s.k).n+'</span>',g);sign.type='button';sign.dataset.k=s.k;sign.style.left=sx+'px';sign.style.top=sy+'px';
    var post=el('i','c-post',null,g);post.style.left=sx+'px';post.style.top=sy+'px';items.push({els:[sign,post],kind:'sign'});
    function box(cls,x,y,w,h){var e=el('button',cls,null,g);e.type='button';e.dataset.k=s.k;e.style.cssText='left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px';return e}
    if(s.k==='about'){var t=el('button','c-aboutlead',null,g);t.type='button';t.dataset.k='about';t.innerHTML='<span class="q">'+D.poem.slice(0,3).map(esc).join('<br>')+'</span><span class="b">'+esc(D.bio[0].split('. ')[0])+'.</span>';
      if(PORT)t.style.cssText='left:'+c0+'px;top:'+(sy+24)+'px;width:'+(c1-c0)+'px';else t.style.cssText='left:'+(sx+80)+'px;top:'+(c0+10)+'px;width:'+Math.min(W*.4,440)+'px';
      items.push({els:[t]});groups.push({items:items,i:i,sx:sx,sy:sy});return}
    /* the stop's strongest piece: large, quiet, with air around it */
    var lw,lh,lx,ly;
    if(PORT){var band=c1-c0;lw=band;lh=lw/s.leadAr;if(lh>H*.56){lh=H*.56;lw=Math.min(band,lh*s.leadAr);lh=lw/s.leadAr}lx=c0+(band-lw)/2;ly=sy+20}
    else{lh=Math.min(AH*.84,AH-20);lw=lh*s.leadAr;if(lw>W*.48){lw=W*.48;lh=lw/s.leadAr}lx=sx+70;ly=c0+(AH-lh)*(side<0?.8:.2)}
    var lead=box('c-lead',lx,ly,lw,lh);img(s.lead,'',G.room(s.k).n,lead);items.push({els:[lead]});
    var cap=el('div','c-cap',stopLine(s.k),g);
    if(PORT)cap.style.cssText='left:'+lx+'px;top:'+(ly+lh+14)+'px;width:'+lw+'px';else cap.style.cssText='left:'+(lx+lw+32)+'px;top:'+(side<0?ly+lh-70:ly)+'px;width:'+Math.min(260,W*.22)+'px';
    items.push({els:[cap]});
    var secs=(s.sec||[]).filter(Boolean),n=secs.length;
    secs.forEach(function(q,j){var w2,h2,x2,y2,ar=q.w/q.h;
      if(PORT){var band2=c1-c0,gap2=14,slots=Math.max(n,1);w2=(band2-(slots-1)*gap2)/slots;h2=w2/ar;if(h2>H*.3){h2=H*.3;w2=Math.min(h2*ar,w2);h2=w2/ar}x2=c0+j*(w2+gap2);y2=ly+lh+90}
      else{h2=Math.min(AH*.4,AH-20);w2=h2*ar;x2=lx+lw+32+j*(w2+20);y2=side<0?c0+6:c1-h2-6}
      var e=box('c-sec',x2,y2,w2,h2);img(q.th||q.src,'',q.t||'',e);items.push({els:[e]})});
    groups.push({items:items,i:i,sx:sx,sy:sy})});
  /* measure, then resolve: nothing may touch. Items slide along the walk; stops push the next stop on. */
  var lr=land.getBoundingClientRect();
  function rectOf(it){var r=null;it.els.forEach(function(e){var b=e.getBoundingClientRect();var q={x0:b.left-lr.left,y0:b.top-lr.top,x1:b.right-lr.left,y1:b.bottom-lr.top};r=r?{x0:Math.min(r.x0,q.x0),y0:Math.min(r.y0,q.y0),x1:Math.max(r.x1,q.x1),y1:Math.max(r.y1,q.y1)}:q});return r}
  function hits(a,b){return a.x0<b.x1+M&&b.x0<a.x1+M&&a.y0<b.y1+M&&b.y0<a.y1+M}
  function moveIt(it,dx,dy){it.r.x0+=dx;it.r.x1+=dx;it.r.y0+=dy;it.r.y1+=dy;it.dx=(it.dx||0)+dx;it.dy=(it.dy||0)+dy}
  var prevEnd=-1e9,shift=0;
  groups.forEach(function(gp){gp.items.forEach(function(it){it.r=rectOf(it);it.dx=0;it.dy=0});
    /* keep each item inside the cross band */
    gp.items.forEach(function(it){var r=it.r;if(PORT){if(r.x1>c1)moveIt(it,c1-r.x1,0);if(it.r.x0<c0)moveIt(it,c0-it.r.x0,0)}else{if(r.y1>c1)moveIt(it,0,c1-r.y1);if(it.r.y0<c0)moveIt(it,0,c0-it.r.y0)}});
    for(var n=1;n<gp.items.length;n++){var it=gp.items[n],guard=0,moved=true;
      while(moved&&guard++<40){moved=false;for(var m=0;m<n;m++){var o=gp.items[m];if(hits(it.r,o.r)){var need=PORT?(o.r.y1+M-it.r.y0):(o.r.x1+M-it.r.x0);moveIt(it,PORT?0:need,PORT?need:0);moved=true}}}}
    /* the whole stop clears the previous one */
    var st=1e9,en=-1e9;gp.items.forEach(function(it){st=Math.min(st,PORT?it.r.y0:it.r.x0);en=Math.max(en,PORT?it.r.y1:it.r.x1)});
    var push=Math.max(shift,prevEnd+view*.22-st);if(push>0)gp.items.forEach(function(it){moveIt(it,PORT?0:push,PORT?push:0)});shift=Math.max(shift,push);
    prevEnd=en+Math.max(push,0);
    gp.items.forEach(function(it){it.els.forEach(function(e){e.style.left=(parseFloat(e.style.left)+it.dx)+'px';e.style.top=(parseFloat(e.style.top)+it.dy)+'px'})});
    var sg=gp.items[0];gp.sx+=sg.dx;gp.sy+=sg.dy;SIGNS.push({x:gp.sx,y:gp.sy,pos:PORT?gp.sy:gp.sx,k:STOPS[gp.i].k})});
  LEN=prevEnd+view*.3;
  if(PORT){land.style.width=W+'px';land.style.height=LEN+'px'}else{land.style.width=LEN+'px';land.style.height=innerHeight+'px'}
  var pts=SIGNS.map(function(s){return[s.x,s.y]});
  /* the path, hand-drawn: a graphite stroke textured with Gill's own drawing */
  var dd='M'+(PORT?W*.5:0)+','+(PORT?0:innerHeight*.5);var prev=PORT?[W*.5,0]:[0,innerHeight*.5];pts.concat([PORT?[W*.5,LEN]:[LEN,innerHeight*.5]]).forEach(function(p){var mx=(prev[0]+p[0])/2,my=(prev[1]+p[1])/2;
    dd+=PORT?' C'+prev[0]+','+my+' '+p[0]+','+my+' '+p[0]+','+p[1]:' C'+mx+','+prev[1]+' '+mx+','+p[1]+' '+p[0]+','+p[1];prev=p});
  var Wd=PORT?W:LEN,Hd=PORT?LEN:innerHeight;trail.setAttribute('width',Wd);trail.setAttribute('height',Hd);trail.setAttribute('viewBox','0 0 '+Wd+' '+Hd);
  trail.innerHTML='<defs><pattern id="gp" patternUnits="userSpaceOnUse" width="520" height="650"><image href="media/tex/graphite-b.webp" width="520" height="650" preserveAspectRatio="xMidYMid slice"/></pattern>'+
    '<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></defs>'+
    '<path d="'+dd+'" class="halo"/><path d="'+dd+'" class="tex" stroke="url(#gp)"/><path d="'+dd+'" class="core" filter="url(#rough)"/>';
  buildProfile();
  /* the ladder stays on the edge, clear of the player and the dev toggle */
  if(!PORT){var play=d.getElementById('gplay'),dev=d.getElementById('dev');
    if(play){var pr=play.getBoundingClientRect();if(pr.width)prof.style.left=Math.ceil(pr.right+18)+'px'}
    if(dev){var dr=dev.getBoundingClientRect();if(dr.width)prof.style.right=Math.ceil(innerWidth-dr.left+16)+'px'}}
  onWalk()}
function stopLine(k){if(k==='spaces')return '<i class="ct">'+esc(D.spaces[0].t)+'</i><span class="cm">'+esc(D.spiritEye.made)+'</span>';
  if(k==='film')return '<i class="ct">'+esc(D.film[0].t)+'</i><span class="cm">'+esc(D.film[0].role)+' · '+D.film[0].year+'</span>';
  if(k==='objects')return '<i class="ct">crescent rim of a cup</i><span class="cm">joio.co</span>';
  if(k==='photo')return '<span class="cm">'+D.photo.length+' photographs</span>';return''}
function buildProfile(){prof.classList.add('c-meter');prof.setAttribute('role','slider');prof.setAttribute('aria-valuemin','1');prof.setAttribute('aria-valuemax',String(SIGNS.length));prof.setAttribute('aria-label','trail meter');
  prof.innerHTML='<div class="c-ladder">'+SIGNS.map(function(s,i){return '<button class="seg" type="button" data-i="'+i+'" aria-label="stop '+(i+1)+' '+G.room(s.k).n+'"><i></i><span>0'+(i+1)+'</span></button>'}).join('')+'<b class="led"></b></div>'}
function vh(){return PORT?walk.clientHeight:innerWidth}
function posFrac(p){var view=vh();return Math.max(0,Math.min(1,(p-view/2)/(LEN-view)))}
function scrollPos(){return PORT?walk.scrollTop:walk.scrollLeft}
function rm(){var on=false;try{on=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}try{if(/[?&]rm=1(?:&|$)/.test(location.search))on=true}catch(e2){}d.documentElement.classList.toggle('rm',on);return on}
function setScroll(v,smooth){var o=PORT?{top:v}:{left:v};o.behavior=(smooth&&!rm())?'smooth':'auto';walk.scrollTo(o)}
function nearestSign(){var view=vh(),c=scrollPos()+view/2,best=0,bd=1e9;SIGNS.forEach(function(s,i){var dd=Math.abs(s.pos-c);if(dd<bd){bd=dd;best=i}});return best}
function onWalk(){var view=vh(),f=scrollPos()/Math.max(1,LEN-view),iCur=nearestSign();
  prof.querySelectorAll('.seg').forEach(function(b,j){b.classList.toggle('walked',j<=iCur);b.classList.toggle('on',j===iCur)});
  var led=prof.querySelector('.led');if(led){led.style.top='';led.style.left='';if(PORT)led.style.top=(f*100)+'%';else led.style.left=(f*100)+'%'}
  prof.setAttribute('aria-valuenow',String(iCur+1));prof.setAttribute('aria-valuetext',SIGNS[iCur]?G.room(SIGNS[iCur].k).n:'');
  var c=scrollPos()+view/2;land.querySelectorAll('.c-stop').forEach(function(g,i){g.classList.toggle('near',Math.abs(SIGNS[i].pos-c)<view*.75)});
  if(dialOn){var placed=paintDial();if(dialEl)dialEl.classList.toggle('tuck',!placed);if(placed&&dialEl)dialEl.classList.add('on')}tuckSoon()}
walk.addEventListener('scroll',onWalk,{passive:true});
/* desktop: vertical wheel walks sideways. Reduce Motion jumps; otherwise it settles. */
var target=null,wr=0;walk.addEventListener('wheel',function(e){if(PORT||openK)return;e.preventDefault();killSpring();var dlt=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  target=Math.max(0,Math.min(LEN-innerWidth,(target==null?walk.scrollLeft:target)+dlt*1.1));
  if(rm()){walk.scrollLeft=target;wr=0;target=null;onWalk();return}
  if(!wr)(function step(){var cur=walk.scrollLeft,dx=target-cur;if(Math.abs(dx)<.5){walk.scrollLeft=target;wr=0;target=null;return}walk.scrollLeft=cur+dx*.18;wr=requestAnimationFrame(step)})()},{passive:false});
/* drag spring w=10 while the ladder is held; settle w=9 (~0.6 s) onto the nearest stop */
var meterDrag=false,meterBox=null,spring=0,springT=0,springV=0,springW=10,springLast=0;
function killSpring(){if(spring){cancelAnimationFrame(spring);spring=0}springV=0}
function springTo(dest,w){springT=Math.max(0,Math.min(Math.max(0,LEN-vh()),dest));springW=w;
  if(rm()){killSpring();setScroll(springT,false);onWalk();return}
  if(spring)return;springLast=performance.now();
  function step(now){var dt=Math.min(.05,(now-springLast)/1000);springLast=now;var x=scrollPos(),v=springV,t=springT,ww=springW,e=x-t,k=Math.exp(-ww*dt),c=v+ww*e;
    setScroll(t+(e+c*dt)*k,false);springV=(v-ww*c*dt)*k;onWalk();
    if(Math.abs(springT-scrollPos())<.8&&Math.abs(springV)<12){setScroll(springT,false);killSpring();onWalk();return}
    spring=requestAnimationFrame(step)}
  spring=requestAnimationFrame(step)}
function fracFromEvent(e){var r=meterBox||prof.getBoundingClientRect();return Math.max(0,Math.min(1,PORT?(e.clientY-r.top)/Math.max(1,r.height):(e.clientX-r.left)/Math.max(1,r.width)))}
function scrub(e){springTo(fracFromEvent(e)*(LEN-vh()),10)}
prof.addEventListener('pointerdown',function(e){meterDrag=true;prof.classList.add('hold');meterBox=prof.getBoundingClientRect();try{prof.setPointerCapture(e.pointerId)}catch(err){}scrub(e);showDial(e.clientX,e.clientY);e.preventDefault()});
prof.addEventListener('pointermove',function(e){if(!meterDrag)return;scrub(e);showDial(e.clientX,e.clientY)});
function endMeter(){if(!meterDrag)return;meterDrag=false;prof.classList.remove('hold');meterBox=null;var i=nearestSign(),view=vh();springTo(SIGNS[i].pos-view/2,9);hideDial()}
prof.addEventListener('pointerup',endMeter);prof.addEventListener('pointercancel',endMeter);
prof.addEventListener('keydown',function(e){var dir=e.key==='ArrowDown'||e.key==='ArrowRight'?1:e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:0;if(!dir)return;e.preventDefault();e.stopPropagation();goSign(Math.max(0,Math.min(SIGNS.length-1,nearestSign()+dir)),!rm())});
function goSign(i,smooth){var view=vh();setScroll(SIGNS[i].pos-view/2,smooth)}
/* ---------- stop page: opens out of its sign like a print unfolding into light ---------- */
function views(k){if(k==='spaces'){var v=[];D.spaces.forEach(function(s){v.push({src:s.src,th:s.th,w:s.w,h:s.h,it:s});s.views.forEach(function(x){v.push({src:x.src,th:x.src,w:x.w,h:x.h,it:s})})});return v}
  if(k==='film'){var f=[];D.film.forEach(function(m){m.stills.forEach(function(s){f.push({src:s.src,th:s.th,w:s.w,h:s.h,it:m})})});return f}
  return G.room(k).items.map(function(it){return{src:it.src,th:it.th,w:it.w,h:it.h,it:it}})}
function fillPage(k){var i=STOPS.findIndex(function(s){return s.k===k}),nx=STOPS[(i+1)%STOPS.length];page.dataset.k=k;
  var h='<button class="c-back" type="button">‹ trail</button><span class="c-where">stop 0'+(i+1)+' · '+G.room(k).n.toLowerCase()+'</span>';
  if(k==='about'){h+='<div class="c-about"><div class="bio"><p class="lede">'+esc(D.bio[0])+'</p>'+D.bio.slice(1).map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'<p class="mail"><a href="mailto:'+esc(D.email)+'">'+esc(D.email)+'</a></p></div><div class="poem">'+D.poem.map(esc).join('<br>')+'</div></div>'}
  else{h+='<figure class="c-hero"></figure><div class="c-info"></div><div class="c-side"><svg class="c-sidepath"></svg><div class="c-views"></div></div>'}
  h+='<button class="c-next" type="button" data-k="'+(i<STOPS.length-1?nx.k:'')+'">'+(i<STOPS.length-1?'next stop · 0'+(i+2)+' '+G.room(nx.k).n.toLowerCase()+' ›':'back to the trailhead ›')+'</button>';
  page.innerHTML=h;page.scrollTop=0;if(k==='about')return;
  var vs=views(k),vEl=page.querySelector('.c-views');vs.forEach(function(v,j){var b=el('button','c-v',null,vEl);b.type='button';b.dataset.j=j;b.style.aspectRatio=v.w+'/'+v.h;img(v.th,'',v.it.t||'',b)});
  show(k,sel[k]||0,true)}
function show(k,j,instant){var vs=views(k);j=(j+vs.length)%vs.length;sel[k]=j;var v=vs[j],hero=page.querySelector('.c-hero'),info=page.querySelector('.c-info');if(!hero)return;
  var olds=[].slice.call(hero.querySelectorAll('img')),im=img(v.src,'',v.it.t||'photograph',hero);if(v.w<600){im.classList.add('small');im.style.setProperty('--mw',(v.w*1.6)+'px')}
  /* every previous image leaves, however fast the views are flicked: never two pictures on the hero */
  olds.forEach(function(o){o.classList.add('out');setTimeout(function(){o.remove()},1200)})
  info.innerHTML=G.caption(v.it,true);page.querySelectorAll('.c-v').forEach(function(b){b.classList.toggle('on',+b.dataset.j===j)})}
function openStop(k,fromEl,instant){openK=k;d.body.classList.add('c-open');bands();fillPage(k);page.classList.add('on');var r=fromEl?fromEl.getBoundingClientRect():null;
  /* phone and tablet open as a full page: the circle was clipping the still and the type */
  if(instant||rm()||PORT||!r){page.style.clipPath='none';page.style.opacity=1;return}
  var cx=r.left+r.width/2,cy=r.top+r.height/2,R0=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy));
  G.tween(950,function(e){page.style.clipPath='circle('+(8+R0*e).toFixed(1)+'px at '+cx.toFixed(0)+'px '+cy.toFixed(0)+'px)';page.style.opacity=Math.min(1,e*2.2).toFixed(3)},function(){page.style.clipPath='none'})}
var toHead=false;
function closeStop(instant){if(!openK)return;var k=openK;openK=null;d.body.classList.remove('c-open');bands();var i=STOPS.findIndex(function(s){return s.k===k});if(toHead){toHead=false;setScroll(0,false);i=0}else goSign(i,false);
  var sg=land.querySelectorAll('.c-sign')[i],r=sg.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R0=Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy));
  if(instant||rm()||PORT){page.classList.remove('on');page.style.clipPath='none';return}
  G.tween(900,function(e){page.style.clipPath='circle('+(8+R0*(1-e)).toFixed(1)+'px at '+cx.toFixed(0)+'px '+cy.toFixed(0)+'px)'},function(){page.classList.remove('on');page.style.clipPath='none'});
  sg.classList.add('back');setTimeout(function(){sg.classList.remove('back')},2400)}
R.on(function(route,prev,how){if(route==='index'){idx.classList.add('open');return}idx.classList.remove('open');
  var k=route.split('/')[0];if(k&&!G.room(k)){R.go('',{replace:true});return}
  if(!k){closeStop(how==='load');return}
  if(openK&&openK!==k){fillPage(k);openK=k;page.scrollTop=0;var i=STOPS.findIndex(function(s){return s.k===k});goSign(i,false);return}
  if(!openK){var i2=STOPS.findIndex(function(s){return s.k===k});if(how!=='load'&&!lastFrom)goSign(i2,false);openStop(k,lastFrom||land.querySelector('.c-sign[data-k="'+k+'"]'),how==='load');lastFrom=null}});
var lastFrom=null;
land.addEventListener('click',function(e){var t=e.target.closest('.c-sign,.c-lead,.c-sec,.c-aboutlead');if(!t)return;lastFrom=t;R.go(t.dataset.k)});
page.addEventListener('click',function(e){if(e.target.closest('.c-back')){R.up();return}var n=e.target.closest('.c-next');if(n){if(n.dataset.k)R.go(n.dataset.k,{replace:true});else{toHead=true;R.home()}return}
  var v=e.target.closest('.c-v');if(v){show(openK,+v.dataset.j);if(PORT)page.scrollTo({top:0,behavior:rm()?'auto':'smooth'});return}if(e.target.closest('.c-hero'))show(openK,(sel[openK]||0)+1)});
top.addEventListener('click',function(e){if(e.target.closest('.c-map')){R.go('index');return}});
GJ_THEME.bind(top.querySelector('.c-wm'),{home:function(){if(R.cur){toHead=true;R.home()}else setScroll(0,true)}});
d.addEventListener('keydown',function(e){if(openK){if(e.key==='ArrowRight')show(openK,(sel[openK]||0)+1);if(e.key==='ArrowLeft')show(openK,(sel[openK]||0)-1);return}
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='ArrowDown'||e.key==='ArrowUp'){var view=vh(),c=scrollPos()+view/2,dir=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:-1,i=0,bd=1e9;
    SIGNS.forEach(function(s,j){var dd=Math.abs(s.pos-c);if(dd<bd){bd=dd;i=j}});var cur=SIGNS[i].pos-c;i=dir>0?(cur>20?i:i+1):(cur<-20?i:i-1);i=Math.max(0,Math.min(SIGNS.length-1,i));e.preventDefault();goSign(i,!rm())}});
/* pinch: spread over a work on the trail opens its stop from the touched point; spread over a view shows it; pinch closed on a stop returns to its sign */
function pinch(tg,onOut,onIn){var p0=null;tg.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];p0={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2,done:false}}},{passive:true});
  tg.addEventListener('touchmove',function(e){if(!p0||p0.done||e.touches.length<2)return;var a=e.touches[0],b=e.touches[1],dd=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    if(dd>p0.d*1.35){p0.done=true;onOut&&onOut(p0)}else if(dd<p0.d*.72){p0.done=true;onIn&&onIn(p0)}},{passive:true});
  tg.addEventListener('touchend',function(e){if(!e.touches.length)p0=null},{passive:true})}
pinch(walk,function(m){var t=d.elementFromPoint(m.x,m.y),w=t&&t.closest('.c-sign,.c-lead,.c-sec,.c-aboutlead,.c-stop');if(!w){var best=null,bd=1e9;land.querySelectorAll('.c-sign').forEach(function(sg){var r=sg.getBoundingClientRect(),dd=Math.hypot(r.left+r.width/2-m.x,r.top+r.height/2-m.y);if(dd<bd){bd=dd;best=sg}});w=best}
  if(!w)return;var k=w.dataset.k||(w.closest('.c-stop')&&w.closest('.c-stop').dataset.k);if(!k)return;lastFrom={getBoundingClientRect:function(){return{left:m.x-4,top:m.y-4,width:8,height:8}}};R.go(k)},null);
pinch(page,function(m){var t=d.elementFromPoint(m.x,m.y),v=t&&t.closest('.c-v');if(v)show(openK,+v.dataset.j)},function(){if(openK)R.up()});
G.swipe(page,function(dir,st){if(dir==='right')R.up();else if(dir==='left'){var h=page.querySelector('.c-hero');if(h){var r=h.getBoundingClientRect();if(st.y>r.top&&st.y<r.bottom){show(openK,(sel[openK]||0)+1);return}}}});
G.swipe(idx,function(dir){if(dir==='down'||dir==='right')R.up()});
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){var f=scrollPos()/Math.max(1,LEN-vh());layout();setScroll(f*(LEN-vh()))},150)});
/* ghost arc, the tune-drawer default: thin 110° edge arc, gold tick, free side away from the thumb.
   It only appears while the ladder is dragged, and it is gone about a second after release. If every edge would cover work, it stays hidden and the ladder still scrubs. */
var dialEl=null,dialOn=false,dialHideT=0,dialFadeT=0,dialPx=0,dialPy=0,RARC=44,SPAN=110;
function ensureDial(){if(dialEl)return;dialEl=el('div','c-dial',null,d.body);dialEl.setAttribute('aria-hidden','true');
  dialEl.innerHTML='<svg><g><path class="arc"/><path class="end"/><path class="def"/><path class="tick"/><text class="nm"></text></g></svg>'}
function boxOf(node){if(!node||!node.getBoundingClientRect)return null;var b=node.getBoundingClientRect();if(b.width<2||b.height<2)return null;var n=node,s;while(n&&n!==d.documentElement){try{s=getComputedStyle(n)}catch(e){return null}if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0)return null;n=n.parentElement}return b}
function avoidRects(){var out=[];d.querySelectorAll('.c-lead img,.c-sec img,.c-hero img,#gplay,#dev,.c-wm,.c-map').forEach(function(node){var b=boxOf(node);if(b)out.push(b)});return out}
function boxHits(box,list){for(var i=0;i<list.length;i++){var q=list[i];if(box.left<q.right&&box.right>q.left&&box.top<q.bottom&&box.bottom>q.top)return true}return false}
function showDial(px,py){ensureDial();clearTimeout(dialHideT);clearTimeout(dialFadeT);dialOn=true;dialPx=px;dialPy=py;var placed=paintDial();
  dialEl.classList.toggle('tuck',!placed);if(placed){dialEl.classList.remove('out');dialEl.classList.add('on')}tuckCheck()}
function drawDial(c){var W=innerWidth,svg=dialEl.querySelector('svg');svg.setAttribute('viewBox','0 0 '+W+' '+innerHeight);
  var cx=c.r?W-8+RARC*.62:8-RARC*.62,cy=c.y,mid=c.r?180:0,a0=mid-SPAN/2,a1=mid+SPAN/2,f=scrollPos()/Math.max(1,LEN-vh()),i=nearestSign(),snap=posFrac(SIGNS[i].pos);
  function pt(a,rr){var q=a*Math.PI/180;return[cx+rr*Math.cos(q),cy+rr*Math.sin(q)]}
  function arc(a,b,rr){var p=pt(a,rr),q=pt(b,rr);return'M'+p[0].toFixed(1)+' '+p[1].toFixed(1)+' A'+rr+' '+rr+' 0 0 1 '+q[0].toFixed(1)+' '+q[1].toFixed(1)}
  function tick(a,r0,r1){var p=pt(a,r0),q=pt(a,r1);return'M'+p[0].toFixed(1)+' '+p[1].toFixed(1)+' L'+q[0].toFixed(1)+' '+q[1].toFixed(1)}
  var ang=a0+SPAN*Math.max(0,Math.min(1,f)),as=a0+SPAN*Math.max(0,Math.min(1,snap));
  dialEl.querySelector('.arc').setAttribute('d',arc(a0,a1,RARC));
  dialEl.querySelector('.end').setAttribute('d',tick(a0,RARC-5,RARC+5)+tick(a1,RARC-5,RARC+5));
  dialEl.querySelector('.def').setAttribute('d',tick(as,RARC-3,RARC+3));
  dialEl.querySelector('.tick').setAttribute('d',tick(ang,RARC-9,RARC+8));
  var nm=dialEl.querySelector('.nm'),np=pt(mid,RARC-16);nm.textContent=G.room(SIGNS[i].k).n.toUpperCase();nm.setAttribute('x',np[0].toFixed(1));nm.setAttribute('y',(cy+4).toFixed(1));nm.setAttribute('text-anchor',c.r?'end':'start')}
function inkClear(){var g=dialEl.querySelector('g'),b=g.getBoundingClientRect();if(b.width<2)return false;return !boxHits({left:b.left-2,top:b.top-2,right:b.right+2,bottom:b.bottom+2},avoidRects())}
function paintDial(){if(!dialEl||!SIGNS.length)return false;var W=innerWidth,H=innerHeight,right=dialPx<W/2,ys=[H*.42,H*.30,H*.55,H*.68],cands=[],i;
  [right,!right].forEach(function(r){ys.forEach(function(y){cands.push({r:r,y:y})})});
  for(i=0;i<cands.length;i++){var c=cands[i];if(Math.abs((c.r?W:0)-dialPx)<40)continue;drawDial(c);if(inkClear())return true}
  dialEl.querySelectorAll('path').forEach(function(p){p.setAttribute('d','')});dialEl.querySelector('.nm').textContent='';return false}
function hideDial(){if(!dialEl||!dialOn)return;if(rm()){dialOn=false;dialEl.classList.remove('on','out','tuck');return}
  dialHideT=setTimeout(function(){dialEl.classList.add('out');dialFadeT=setTimeout(function(){dialOn=false;dialEl.classList.remove('on','out')},720)},280)}
/* the ladder and the dial tuck off the work the moment they would cover a picture, and return when the walk stops */
function hitsImages(rect){if(!rect||rect.width<4||rect.height<4)return false;var list=d.querySelectorAll('.c-lead img,.c-sec img,.c-hero img'),i,im,b,s;
  for(i=0;i<list.length;i++){im=list[i];if(im.closest('.c-page')&&!d.body.classList.contains('c-open'))continue;try{s=getComputedStyle(im)}catch(e){continue}
    if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0)continue;b=im.getBoundingClientRect();if(b.width<8||b.height<8)continue;
    if(rect.left<b.right-1&&rect.right>b.left+1&&rect.top<b.bottom-1&&rect.bottom>b.top+1)return true}return false}
var tuckT=0;
function tuckCheck(){var over=hitsImages(prof.getBoundingClientRect());prof.classList.toggle('tuck',over&&!document.body.classList.contains('c-open'))}
function tuckSoon(){tuckCheck();clearTimeout(tuckT);tuckT=setTimeout(tuckCheck,160)}
walk.addEventListener('scroll',tuckSoon,{passive:true});
rm();
layout();R.start();
/* captions settle once the type has loaded: lay out again so nothing can touch */
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){var f=scrollPos()/Math.max(1,LEN-vh());layout();setScroll(f*(LEN-vh()))});
})();
