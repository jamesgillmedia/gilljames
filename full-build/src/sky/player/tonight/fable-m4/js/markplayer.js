/* The Mark player · m4 (next brief §1, Gill, Nov 15). A room of the player catalogue, inside the m4 sky.
   The archive draws the work's own shapes: every cut-frame the films already have (1029 real frames, js data: media/mark/frames.json,
   one atlas image) is placed by the colour that is already in it. Nothing is graded, tinted or recoloured: a frame is only measured.
   Three drawings to choose from (Gill picks):
     A · spectrum     the ᑕᐣᓯ Mark, one stroke after another, the frames in colour order along it
     B · three lights the Mark again: each glyph is one light of the work (neutral, warm, cool), dark to bright along its stroke
     C · crescent     the opener's moon, filled from its lit limb inward, brightest frames first
   The camera travels: pinch / wheel moves in and out, a drag pans once you are in, a tap on a frame travels into it until it is the
   2.39 frame, and there the film it was cut from plays from that cut, in Scope (js/scope.js), from its own local file.
   The rail is Scope's rail: here it scrubs the drawing instead of time (one star per colour family).
   Touch and sound are the sky's own (js/sky.js, exported as GJ_SKYFX, not rewritten): the arrival's soft glow under a finger
   (noteTouch / drawGlow), the arrival's light ring (.rip), and the sound constellation's chime (chime, PENT) as each family lands,
   when a frame is touched, and as a finger brushes across frames (wind).
   History: the room is one step and a clip is one more. Back leaves the clip, then the room, and the sky is as it was. */
(function(){
'use strict';
if(window.GJ_MARKPLAYER)return;
var FX=null,D=null,ATLAS=null,root=null,cv=null,g=null,water=null,rail=null,head=null,lab1=null,lab2=null,stage=null,frameEl=null,scChrome=null,SC=null;
var ME=document.currentScript.src,M4=new URL('../',ME),ROOT=new URL('../../../../../../',ME);
var W=0,H=0,DPR=1,open=false,raf=0,T0=0,OPT='A',N=0,F=[],ORDER=[],FAMAT=[],BOX={w:430,h:210};
var cam={x:0,y:0,z:1},to={x:0,y:0,z:1},fit=1,CLIP=null,HOT=-1,lastRing=0,ready=null;
var STILL=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches),H0=location.hash;   /* the address as it arrived: the sky tidies the hash while it boots */
var OPTS={A:'spectrum',B:'three lights',C:'crescent'};
function $(s){return root.querySelector(s)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function red(){return document.documentElement.classList.contains('rm')}
function ink(a){var r=red();var t=document.documentElement.getAttribute('data-red-tone')==='rose'?'255,176,184':'255,68,87';return 'rgba('+(r?t:'230,237,240')+','+a+')'}

/* ---------- the data ---------- */
function load(){if(ready)return ready;
  ready=Promise.all([fetch(new URL('media/mark/frames.json',M4)).then(function(r){return r.json()}),
    new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im)};im.onerror=rej;im.src=new URL('media/mark/atlas.webp',M4).href})]).then(function(a){
    D=a[0];ATLAS=a[1];N=D.frames.length;TITLES=D.titles||{};var r=rnd(11);
    F=D.frames.map(function(f,i){var an=r()*6.283,rr=260+r()*260;return{i:i,f:f,x:Math.cos(an)*rr,y:Math.sin(an)*rr*.6,tx:0,ty:0,ox:0,oy:0,k:.25,sw:0,sv:0,d:0,fl:0}})});
  return ready}
function rnd(s){return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ---------- the drawings: where each frame goes (world units: the Mark's own box, 430 x 210, from the sky's STROKES) ---------- */
var TW=10,TH=4.2,GAP=.8,HOME={x:0,y:0},LT=0;
function pathOf(strokes){var segs=[],tot=0;strokes.forEach(function(s,si){for(var j=1;j<s.length;j++){var a=s[j-1],b=s[j],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a:a,b:b,l:l,at:tot,si:si});tot+=l}});return{segs:segs,len:tot}}
/* a ribbon of rows along a path: slot k of n sits at arc length u, row r across */
function ribbon(P,ids,rows){var per=Math.ceil(ids.length/rows),stepU=P.len/Math.max(1,per-1||1),out=[];
  ids.forEach(function(id,k){var c=Math.floor(k/rows),r=k%rows,u=Math.min(P.len-.01,c*stepU),sg=P.segs[0];
    for(var q=0;q<P.segs.length;q++){if(u>=P.segs[q].at)sg=P.segs[q]}var t=(u-sg.at)/sg.l,dx=(sg.b[0]-sg.a[0])/sg.l,dy=(sg.b[1]-sg.a[1])/sg.l,off=(r-(rows-1)/2)*(TH+GAP);
    out.push([id,sg.a[0]+(sg.b[0]-sg.a[0])*t-dy*off*1.12,sg.a[1]+(sg.b[1]-sg.a[1])*t+dx*off*1.12,u/P.len])});return out}
function rowsFor(n,len){return Math.max(2,Math.round(n*(TW+GAP)*.52/len))}
function byColour(a,b){var A=a.f,B=b.f;return A.g-B.g||(A.g<2?A.l-B.l:(A.h-B.h||A.l-B.l))}
function byLight(a,b){return a.f.l-b.f.l}
function layout(o){var S=FX.strokes(),set=[],fam=[];BOX={w:430,h:210};
  if(o==='A'){var all=F.slice().sort(byColour),P=pathOf(S);set=ribbon(P,all.map(function(x){return x.i}),rowsFor(N,P.len));ORDER=all}
  else if(o==='B'){var groups=[[],[],[]];F.forEach(function(x){var gI=x.f.g<2?0:(x.f.g<=4?1:2);groups[gI].push(x)});
    /* the longest stroke takes the largest group: ᑕ neutral, ᓯ warm, ᐣ cool */
    var which=[0,2,1];ORDER=[];groups.forEach(function(G,gi){G.sort(byLight);var P=pathOf([S[which[gi]]]);ribbon(P,G.map(function(x){return x.i}),rowsFor(G.length,P.len)).forEach(function(s){set.push(s)});ORDER=ORDER.concat(G)})}
  else{ /* the crescent: cells inside the lit part of a disc, taken from the limb inward; brightest frames first */
    var R=118,cx=-20,cy=0,dx=58,dy=-22,r2=104,cells=[],sx=TW+GAP,sy=TH+GAP;
    for(var y=-R;y<=R;y+=sy)for(var x=-R;x<=R;x+=sx){if(x*x+y*y>R*R)continue;var qx=x-dx,qy=y-dy;if(qx*qx+qy*qy<r2*r2)continue;cells.push([x+cx,y+cy,Math.hypot(x,y)])}
    cells.sort(function(a,b){return b[2]-a[2]});var all2=F.slice().sort(function(a,b){return b.f.l-a.f.l});var k=Math.min(1,Math.sqrt(cells.length/N));
    /* not enough cells for every frame at this size: the moon grows until there are */
    if(cells.length<N){var grow=Math.sqrt(N/cells.length)*1.02;cells=[];R*=grow;r2*=grow;dx*=grow;dy*=grow;
      for(var y2=-R;y2<=R;y2+=sy)for(var x2=-R;x2<=R;x2+=sx){if(x2*x2+y2*y2>R*R)continue;var px=x2-dx,py=y2-dy;if(px*px+py*py<r2*r2)continue;cells.push([x2+cx,y2+cy,Math.hypot(x2,y2)])}
      cells.sort(function(a,b){return b[2]-a[2]})}
    all2.forEach(function(x,i2){var c=cells[i2%cells.length];set.push([x.i,c[0],c[1],i2/N])});ORDER=all2;BOX={w:R*2+30,h:R*2+20}}
  /* where each colour family starts along the drawing (the rail's stars) */
  FAMAT=[];var last=-1;ORDER.forEach(function(x,i3){var key=o==='C'?Math.floor((1-x.f.l)*6):(o==='B'?(x.f.g<2?0:(x.f.g<=4?1:2)):x.f.g);if(key!==last){FAMAT.push({u:i3/N,g:x.f.g,key:key});last=key}});
  var now=performance.now(),x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;set.forEach(function(s){var x=F[s[0]];x.tx=s[1];x.ty=s[2];x.u=s[3];x0=Math.min(x0,s[1]);x1=Math.max(x1,s[1]);y0=Math.min(y0,s[2]);y1=Math.max(y1,s[2])});
  /* the drawing's real extent is what the camera fits (the ribbons are wider than the strokes they follow) */
  BOX={w:x1-x0+TW*1.6,h:y1-y0+TH*3};HOME={x:(x0+x1)/2,y:(y0+y1)/2};
  ORDER.forEach(function(x,i4){x.rank=i4;x.d=now+(STILL?0:120+(i4/N)*1500+((i4*7)%13)*9);x.land=0});
  OPT=o;fitCam(true);rails();paintOpts();
  /* chimes as the families land, low to high */
  if(FX&&!STILL)FAMAT.forEach(function(fa,i5){setTimeout(function(){if(open&&OPT===o&&!CLIP)FX.chime(FX.PENT[i5%5],.32)},260+fa.u*1500+420)})}

/* ---------- the camera ---------- */
function area(){var top=152,bot=H-128;return{x:W/2,y:(top+bot)/2,w:W-24,h:Math.max(120,bot-top)}}
function fitCam(snap){var a=area();fit=Math.min(a.w/BOX.w,a.h/BOX.h);to={x:HOME.x,y:HOME.y,z:1};if(snap&&STILL){cam.x=HOME.x;cam.y=HOME.y;cam.z=1}}
function scr(x,y){var a=area(),s=fit*cam.z;return[a.x+(x-cam.x)*s,a.y+(y-cam.y)*s,s]}
function world(px,py){var a=area(),s=fit*cam.z;return[cam.x+(px-a.x)/s,cam.y+(py-a.y)/s]}
function zoomAt(px,py,k){var w0=world(px,py),z=clamp(to.z*k,.8,40),a=area();to.z=z;var s=fit*z;to.x=w0[0]-(px-a.x)/s;to.y=w0[1]-(py-a.y)/s;if(z<=1.02){to.x=HOME.x;to.y=HOME.y}}
function hit(px,py){var w=world(px,py),best=-1,bd=1e9;for(var i=0;i<N;i++){var x=F[i],dx=Math.abs(w[0]-x.x),dy=Math.abs(w[1]-x.y);if(dx<=TW*.62&&dy<=TH*.75){var d=dx/TW+dy/TH;if(d<bd){bd=d;best=i}}}return best}

/* ---------- one frame ---------- */
function frame(now){raf=0;if(!open)return;var dt=Math.min(64,LT?now-LT:16);LT=now;var k=STILL?1:1-Math.exp(-dt/95);
  cam.x+=(to.x-cam.x)*k;cam.y+=(to.y-cam.y)*k;cam.z+=(to.z-cam.z)*k;
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  var a=area(),s=fit*cam.z,w=TW*s,h=TH*s,tw=D.tw,th=D.th,cols=D.cols,busy=Math.abs(to.z-cam.z)>.002||Math.abs(to.x-cam.x)>.05||Math.abs(to.y-cam.y)>.05;
  for(var i=0;i<N;i++){var x=F[i];
    if(now>=x.d){var e=STILL?1:1-Math.exp(-dt/185);x.x+=(x.tx-x.x)*e;x.y+=(x.ty-x.y)*e;x.k+=(1-x.k)*e;if(Math.abs(x.tx-x.x)+Math.abs(x.ty-x.y)>.08)busy=true;else if(!x.land)x.land=1}else busy=true;
    /* wind: a brushed frame sways on a soft spring and settles */
    if(x.sw||x.sv){x.sv+=(-x.sw*.09-x.sv*.12);x.sw+=x.sv;if(Math.abs(x.sw)+Math.abs(x.sv)<.02){x.sw=0;x.sv=0}else busy=true}
    if(x.fl>0){x.fl*=.93;if(x.fl<.02)x.fl=0;else busy=true}
    var X=a.x+(x.x-cam.x)*s+x.sw*s*.5,Y=a.y+(x.y-cam.y)*s,ww=w*x.k,hh=h*x.k;
    if(X<-ww||X>W+ww||Y<-hh||Y>H+hh)continue;
    g.globalAlpha=.3+.7*x.k;
    g.drawImage(ATLAS,(i%cols)*tw,Math.floor(i/cols)*th,tw,th,X-ww/2,Y-hh/2,ww,hh);
    if(x.fl>0||i===HOT){g.globalAlpha=Math.max(x.fl,i===HOT?.55:0);g.strokeStyle=ink(1);g.lineWidth=1;g.strokeRect(X-ww/2-1,Y-hh/2-1,ww+2,hh+2)}}
  g.globalAlpha=1;
  /* travelling into a frame: its own full strip thumb comes in over the atlas tile as it grows */
  if(CLIP&&CLIP.im&&CLIP.im.complete&&CLIP.im.naturalWidth){var x2=F[CLIP.i],p=scr(x2.x,x2.y),w2=TW*p[2],h2=w2/2.39;g.globalAlpha=clamp((cam.z-2)/3,0,1);g.drawImage(CLIP.im,p[0]-w2/2,p[1]-h2/2,w2,h2);g.globalAlpha=1;
    if(!CLIP.on&&Math.abs(to.z-cam.z)<to.z*.012&&Math.abs(to.x-cam.x)<.15)mount()}
  if(FX)FX.glowOn(g);                                   /* the arrival's touch glow, as the sky paints it */
  if(head){var u=camU();head.style.left=(u*100)+'%';$('.sc-fill').style.width=(u*100)+'%'}
  if(busy||(FX&&FX.glowing())||(CLIP&&!CLIP.on))raf=requestAnimationFrame(frame)}
function kick(){if(!raf&&open){LT=0;raf=requestAnimationFrame(frame)}}
function camU(){if(cam.z<1.15&&!DRAGU)return RU;var best=0,bd=1e9;for(var i=0;i<N;i+=3){var x=F[i],d=Math.hypot(x.tx-cam.x,x.ty-cam.y);if(d<bd){bd=d;best=x.u||0}}return best}
var RU=0,DRAGU=false;

/* ---------- touch: the sky's glow and ring, the sound constellation's chime ---------- */
function touchFx(px,py,ringIt){if(!FX)return;FX.note(px,py);if(ringIt){var s=document.createElement('i');s.className='rip';s.style.left=px+'px';s.style.top=py+'px';water.appendChild(s);setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},1600)}kick()}
function ring(i,vel){var x=F[i],t=performance.now();if(t-lastRing<70)return;lastRing=t;x.fl=1;if(FX)FX.chime(FX.PENT[x.f.g%5]*(x.f.l>.5?2:1),vel)}
var P={},nP=0,pin0=0,moved=0,down=null;
function pd(e){if(CLIP)return;P[e.pointerId]=[e.clientX,e.clientY];nP=Object.keys(P).length;try{cv.setPointerCapture(e.pointerId)}catch(x){}
  if(nP===1){down={x:e.clientX,y:e.clientY,t:performance.now(),cx:to.x,cy:to.y};moved=0;touchFx(e.clientX,e.clientY,true)}
  else if(nP===2){var k=Object.keys(P);pin0=Math.hypot(P[k[0]][0]-P[k[1]][0],P[k[0]][1]-P[k[1]][1]);down=null}}
function pm(e){if(CLIP)return;if(!P[e.pointerId]){if(e.pointerType==='mouse'){var h0=hit(e.clientX,e.clientY);if(h0!==HOT){HOT=h0;cv.style.cursor=h0>=0?'pointer':'';tell(h0);kick()}}return}
  var was=P[e.pointerId];P[e.pointerId]=[e.clientX,e.clientY];
  if(nP===2){var k=Object.keys(P),d=Math.hypot(P[k[0]][0]-P[k[1]][0],P[k[0]][1]-P[k[1]][1]),mx=(P[k[0]][0]+P[k[1]][0])/2,my=(P[k[0]][1]+P[k[1]][1])/2;if(pin0>0)zoomAt(mx,my,d/pin0);pin0=d;kick();return}
  if(!down)return;moved+=Math.abs(e.clientX-was[0])+Math.abs(e.clientY-was[1]);FX&&FX.note(e.clientX,e.clientY);
  if(to.z>1.15){var s=fit*cam.z;to.x=down.cx-(e.clientX-down.x)/s;to.y=down.cy-(e.clientY-down.y)/s}          /* in close: a drag pans */
  else{var i=hit(e.clientX,e.clientY);if(i>=0&&moved>6){var x=F[i];if(!x.sw&&!x.sv){x.sv=clamp((e.clientX-was[0])*.05,-1.4,1.4);ring(i,.28)}tell(i)}} /* the whole drawing: a drag is wind, never a pan */
  kick()}
function pu(e){if(!P[e.pointerId])return;delete P[e.pointerId];nP=Object.keys(P).length;pin0=0;
  if(down&&moved<8&&performance.now()-down.t<500&&!CLIP){var i=hit(e.clientX,e.clientY);if(i>=0){ring(i,.55);travel(i)}}down=null;kick()}
function wheel(e){e.preventDefault();e.stopPropagation();if(CLIP)return;zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*(e.deltaMode===1?.05:.0016)));kick()}
function tell(i){if(!lab2)return;if(i<0){label();return}var f=F[i].f,fm=D.fam[f.g];lab2.textContent=(TITLES[f.f]||f.f)+' · '+tc(f.t);lab1.querySelector('.sn').textContent='· '+fm}
function tc(s){var m=Math.floor(s/60),x=Math.floor(s%60);return (m<10?'0':'')+m+':'+(x<10?'0':'')+x}
function label(){if(!lab1)return;lab1.querySelector('.tc').textContent=N+' frames';lab1.querySelector('.sn').textContent='· '+OPTS[OPT];lab2.textContent=CLIP?'':'tap a frame to travel into its film'}

/* ---------- the rail: Scope's rail, scrubbing the drawing ---------- */
function rails(){[].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});FAMAT.forEach(function(fa){var t=document.createElement('i');t.className='tk';t.style.left=(fa.u*100)+'%';rail.insertBefore(t,head)});label()}
function railTo(u,soft){RU=u;var idx=clamp(Math.round(u*(N-1)),0,N-1),x=ORDER[idx];if(!x)return;to.z=Math.max(to.z,2.6);to.x=x.tx;to.y=x.ty;tell(x.i);if(!soft)ring(x.i,.22);kick()}
var RP=null;
function railEv(e){var r=rail.getBoundingClientRect(),u=clamp((e.clientX-r.left)/r.width,0,1);
  if(e.type==='pointerdown'){RP=e.pointerId;DRAGU=true;try{rail.setPointerCapture(RP)}catch(x){}rail.classList.add('drag');railTo(u)}
  else if(e.type==='pointermove'){if(RP===e.pointerId)railTo(u)}
  else if(RP===e.pointerId){RP=null;DRAGU=false;rail.classList.remove('drag')}}

/* ---------- into a clip: the frame becomes the 2.39 frame and its film plays from that cut, in Scope ---------- */
var TITLES={},FILMS={};
function film(slug){if(FILMS[slug])return FILMS[slug];return FILMS[slug]=fetch(new URL('media/scope/'+slug+'.json',M4)).then(function(r){return r.json()}).then(function(f){TITLES[slug]=f.title;return f})}
function abs(p){return new URL(p,ROOT).href}
function travel(i,quiet){if(CLIP||!F[i])return;var x=F[i],im=new Image();im.src=abs(x.f.s);
  CLIP={i:i,im:im,on:false,back:{x:to.x,y:to.y,z:to.z}};HOT=-1;root.classList.add('mk-going');
  var a=area(),sw=stageW();stage.style.width=sw+'px';stage.style.top=Math.round(a.y-sw/2.39/2)+'px';
  to.x=x.tx;to.y=x.ty;to.z=sw/(TW*fit);film(x.f.f);tell(i);
  if(!quiet){try{var st=state(2);st.mki=i;history.pushState(st,'')}catch(e){}}kick()}
function stageW(){return Math.min(W,Math.max(260,Math.min(W-0,1100)))}
function mount(){var c=CLIP;if(!c||c.on)return;c.on=true;var x=F[c.i];
  film(x.f.f).then(function(f){if(CLIP!==c||!window.GJScope)return;root.classList.add('mk-clip');frameEl.innerHTML='';var im=document.createElement('img');im.src=c.im.src;im.alt='';frameEl.appendChild(im);
    if(!SC)SC=window.GJScope.create({frame:frameEl,stage:stage,chrome:scChrome,full:root,onLabel:function(t){var q=CLIP;root.classList.toggle('mk-playing',/playing|loading/.test(t));if(q&&/playing/.test(t))q.played=1;if(window.GJ&&GJ.hold)GJ.hold('mark',!!(q&&q.played)&&/play film/.test(t))}});
    SC.load({key:f.key,alt:(f.hidden&&f.hidden.src)?[{src:f.hidden.src,t:0,d:f.dur}]:null,reel:!!f.reel,meta:(f.title||'')+(f.sound===false?' · picture only':''),dur:f.dur,fps:f.fps,ar:f.ar,poster:c.im.src,
      parts:f.parts.map(function(p){return{src:abs(p.src),t:p.t,d:p.d}}),shots:(f.shots||[]).map(function(s){return{t:s.t,th:s.th?abs(s.th):'',title:s.title||''}})});
    SC.el.classList.add('own');if(f.sound===false)SC.el.classList.add('silent');SC.seek(x.f.t+.05);SC.play()})}
function leaveClip(fromPop){var c=CLIP;if(!c)return;CLIP=null;if(SC){try{SC.stop()}catch(e){}}root.classList.remove('mk-clip','mk-going','mk-playing');frameEl.innerHTML='';if(window.GJ&&GJ.hold)GJ.hold('mark',false);
  to.x=c.back.x;to.y=c.back.y;to.z=c.back.z;label();kick();if(!fromPop&&history.state&&history.state.gjmk===2){try{history.back()}catch(e){}}}

/* ---------- the room ---------- */
function build(){root=document.createElement('div');root.id='mkp';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','the Mark player');root.tabIndex=-1;
  root.innerHTML='<canvas aria-hidden="true"></canvas><div class="mk-water"></div>'+
    '<p class="mk-t">the mark player</p><button type="button" class="mk-x" aria-label="close the Mark player">×</button>'+
    '<div class="mk-opts" role="radiogroup" aria-label="drawing">'+Object.keys(OPTS).map(function(k){return '<button type="button" role="radio" data-o="'+k+'">'+OPTS[k]+'</button>'}).join('')+'</div>'+
    '<div class="mk-stage"><div class="mk-frame sp-frame"></div></div><div class="mk-sc"></div>'+
    '<div class="mk-rail scope own"><div class="sc-row"><a class="sc-lab"><span class="l1"><span class="tc"></span> <span class="sn"></span></span><span class="l2"></span></a></div>'+
    '<div class="sc-rail" role="slider" tabindex="0" aria-label="the drawing: drag to travel along it" aria-valuemin="0" aria-valuemax="100"><span class="sc-line"></span><span class="sc-fill"></span><b class="sc-head"></b></div></div>';
  cv=$('canvas');g=cv.getContext('2d');water=$('.mk-water');rail=$('.mk-rail .sc-rail');head=$('.mk-rail .sc-head');lab1=$('.mk-rail .l1');lab2=$('.mk-rail .l2');stage=$('.mk-stage');frameEl=$('.mk-frame');scChrome=$('.mk-sc');
  cv.addEventListener('pointerdown',pd);cv.addEventListener('pointermove',pm);cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',pu);cv.addEventListener('wheel',wheel,{passive:false});
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(function(n){rail.addEventListener(n,railEv)});
  $('.mk-x').addEventListener('click',function(){if(CLIP)leaveClip();else close()});
  cv.addEventListener('click',function(){if(CLIP&&CLIP.on)leaveClip()});      /* a tap on the drawing around the film: back out of it */
  $('.mk-opts').addEventListener('click',function(e){var b=e.target.closest('[data-o]');if(b&&b.dataset.o!==OPT){try{localStorage.setItem('gj.mark.draw',b.dataset.o)}catch(x){}layout(b.dataset.o);kick()}});
  /* its own layer: the sky under it hears nothing */
  ['pointerdown','pointerup','pointermove','mousedown','mouseup','click','dblclick','touchstart','touchmove','touchend','wheel','contextmenu'].forEach(function(n){root.addEventListener(n,function(e){e.stopPropagation()},{passive:true})});
  document.body.appendChild(root)}
function paintOpts(){[].forEach.call(root.querySelectorAll('[data-o]'),function(b){b.setAttribute('aria-checked',String(b.dataset.o===OPT))})}
function size(){FX=window.GJ_SKYFX||null;DPR=FX?FX.dpr():Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';
  var keep=to.z;fitCam();if(keep>1.02&&!CLIP){to.z=keep}else if(CLIP){var x=F[CLIP.i];to.x=x.tx;to.y=x.ty;to.z=stageW()/(TW*fit);var a=area();stage.style.width=stageW()+'px';stage.style.top=Math.round(a.y-stageW()/2.39/2)+'px'}}
function state(k){var st={};for(var q in (history.state||{}))st[q]=history.state[q];st.gjmk=k;return st}
function show(on,quiet){if(on===open)return;if(on&&!root)build();open=on;document.documentElement.classList.toggle('mk-on',on);
  if(on){root.hidden=false;load().then(function(){if(!open)return;var o='A';try{o=localStorage.getItem('gj.mark.draw')||'A'}catch(e){}if(!OPTS[o])o='A';size();T0=performance.now();layout(o);cam.x=HOME.x;cam.y=HOME.y;cam.z=1;void root.offsetWidth;root.classList.add('on');kick()});
    if(!quiet){try{history.pushState(state(1),'')}catch(e){}}try{root.focus({preventScroll:true})}catch(e){}}
  else{if(CLIP)leaveClip(true);root.classList.remove('on');setTimeout(function(){if(!open&&root)root.hidden=true},380)}}
function openIt(){if(!open)show(true)}
function close(){if(!open)return;if(history.state&&history.state.gjmk){try{history.go(history.state.gjmk===2?-2:-1);return}catch(e){}}show(false)}
/* Back, by the room's own depth (the sky under it may rewrite the state of the entry it is on, so the flag alone is not trusted):
   in a film, Back leaves the film; in the room, Back leaves the room; out of the room, Forward onto its step reopens it */
addEventListener('popstate',function(e){var k=(e.state&&e.state.gjmk)||0;
  if(open&&CLIP&&k<2){e.stopImmediatePropagation();leaveClip(true);if(!k){try{history.replaceState(state(1),'')}catch(x){}}return}
  if(open&&!CLIP&&!k){e.stopImmediatePropagation();show(false);return}
  if(!open&&k){e.stopImmediatePropagation();show(true,true)}},true);
addEventListener('keydown',function(e){if(!open||document.documentElement.classList.contains('gj-map-open')||document.documentElement.classList.contains('mm-open'))return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(SC&&SC.isFull&&SC.isFull()){SC.cut();return}if(CLIP)leaveClip();else close();return}
  if(CLIP){if(e.key===' '){e.preventDefault();SC&&SC.toggle()}e.stopImmediatePropagation();return}
  if(e.key==='+'||e.key==='='){zoomAt(W/2,H/2,1.3);kick()}else if(e.key==='-'){zoomAt(W/2,H/2,1/1.3);kick()}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();railTo(clamp(RU+(e.key==='ArrowRight'?.02:-.02),0,1))}
  e.stopImmediatePropagation()},true);
addEventListener('resize',function(){if(open&&root){size();kick()}});
addEventListener('gj-tog',function(){if(open)kick()});

/* a reload on the room's own step, or a link straight to #mark */
function boot(){var hs=history.state;if(hs&&hs.gjmk){show(true,true);if(hs.gjmk===2&&hs.mki!=null)load().then(function(){setTimeout(function(){travel(hs.mki,true)},1900)});return}
  if(H0==='#mark'){var inside=false;try{inside=!!document.referrer&&new URL(document.referrer).origin===location.origin}catch(e){}
    try{history.replaceState(history.state,'',location.pathname+location.search+'#/')}catch(e){}
    if(inside){show(true,true);try{history.replaceState(state(1),'')}catch(e){}}else show(true)}}
if(document.readyState==='complete')setTimeout(boot,600);else addEventListener('load',function(){setTimeout(boot,600)});

window.GJ_MARKPLAYER={open:openIt,close:close,isOpen:function(){return open},draw:function(o){if(open&&OPTS[o]){layout(o);kick()}},
  state:function(){return{open:open,opt:OPT,n:N,cam:{x:+cam.x.toFixed(2),y:+cam.y.toFixed(2),z:+cam.z.toFixed(3)},to:{z:+to.z.toFixed(3)},clip:CLIP?{film:F[CLIP.i].f.f,t:F[CLIP.i].f.t,on:CLIP.on}:null,scope:SC&&SC.on()?SC.state():null,landed:F.filter(function(x){return x.land}).length,fams:FAMAT.length}},
  at:function(i){var x=F[i],p=scr(x.x,x.y);return[p[0],p[1],x.f]},hit:function(x,y){return hit(x,y)},first:function(slug){for(var i=0;i<N;i++)if(F[i].f.f===slug)return i;return -1}};
})();
