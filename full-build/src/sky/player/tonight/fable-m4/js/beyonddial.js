/* Beyond dial cluster (prototype, preview-beyond). Companion to js/beyond.js; rules from docs 10-dials.
 One small hub sits bottom-left beside the red-mode ring (#themeBtn). Pressing it expands a camera dial cluster out of the hub along Z:
   Beyond   outer ring: the selection mode as four snapped detents (off · red · colour · light)
            inner ring: turning within the mode sweeps darkness (red), hue family (colour) or light level (light)
   depth    the ZLV stops of the sound dive: .62 / 1 / 1.55 / 2.4        (how far behind the lens a swapped frame sits)
   drift    .25x .. 2x                                                    (scales the spring weight: slower drift, longer glide)
   easing   W_SOFT 3.2 / W_GLIDE 4.8 / W_FLY 5.6 / exponential lag 3.4    (which spring or lag moves the swaps AND this cluster)
   orbit    dolly (pure push along Z) or orbit (the arrival swings through a short yaw arc)
 The same easing drives the expand, the snap to a detent and the contract. Finger tracking is the moon opener's exponential lag
 (k = 1 - exp(-dt * rate), 14 mouse, 22 touch). Nothing here uses a transition: every move is a sampled spring.
 Two taps. The first tap on the hub brings up only the big Beyond dial. The second tap (the hub, or the big dial's centre) brings up the
 sub-menu: depth, drift, easing, orbit. A tap outside, Esc or the site's back button closes one level at a time. Same spring expand and
 contract for both levels; nothing auto-hides, and an open cluster never fades, even over content.
 Presence: each dial has an opaque dark body (a solid disc behind its rings and labels), a backdrop blur and a feathered mist around its
 edge (pointer-events none), and a very faint glow. This overrides the earlier boxless rule for this cluster only. Red mode: a dark red body and red mist.
 State colour (dial UI only, never an image): the outer ring ramps from the normal UI colour toward red along the detents (off, red, colour,
 light); the active arc, thumb, label and centre text take the colour at the current position, and the inner sweep shifts toward red as it
 moves. In red mode the ramp stays inside the reds, dim to bright.
 Kept: Z-depth (perspective + translateZ), spring expand / snap / contract, ~18% hold anchor on the active track while a dial is held (the
 held dial's body steps aside with the rest so the content behind it can be read). The hub itself still fades when it is closed and sits
 over content. Reduce Motion: same end states, no travel. */
(function(w){
'use strict';
var B=w.GJ_BEYOND;if(!B)return;
var doc=document,root=doc.documentElement;
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
var NS='http://www.w3.org/2000/svg';
var A0=-135,A1=135;
function ang(t){return A0+(A1-A0)*t}
function pt(cx,cy,r,deg){var a=deg*Math.PI/180;return [cx+r*Math.sin(a),cy-r*Math.cos(a)]}
function arc(cx,cy,r,t0,t1){
  var p0=pt(cx,cy,r,ang(t0)),p1=pt(cx,cy,r,ang(t1)),large=(ang(t1)-ang(t0))>180?1:0;
  return 'M'+p0[0].toFixed(2)+' '+p0[1].toFixed(2)+'A'+r+' '+r+' 0 '+large+' 1 '+p1[0].toFixed(2)+' '+p1[1].toFixed(2);
}
function line(cx,cy,r0,r1,deg){var a=pt(cx,cy,r0,deg),b=pt(cx,cy,r1,deg);return 'M'+a[0].toFixed(2)+' '+a[1].toFixed(2)+'L'+b[0].toFixed(2)+' '+b[1].toFixed(2)}
function P(g,cls,d){var m=el('path',{'class':cls,d:d});g.appendChild(m);return m}
function el(n,a,txt){var e=doc.createElementNS(NS,n),k;for(k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e}

/* ---------- dial definitions ---------- */
var BIG=160,MINI_W=60,MINI_H=70;
/* centre of each dial, from the hub's centre (x right, y down), and its Z in px (the fold dial: 18 idle, 28 expanded) */
var LAY={beyond:{x:68,y:-112,z:28},depth:{x:206,y:-164,z:18},drift:{x:278,y:-164,z:18},ease:{x:206,y:-90,z:18},orbit:{x:278,y:-90,z:18}};
var ORDER=['beyond','depth','drift','ease','orbit'];
var NAMES={beyond:'beyond',depth:'depth',drift:'drift',ease:'easing',orbit:'orbit'};

var hub,wrap,label,lab1,lab2,cluster,D={},openS={x:0,v:0,t:0,w:4.8},subS={x:0,v:0,t:0,w:4.8},lvl=0,openT=0,subT=0,raf=0,last=0;
var held=null;
/* ---------- state colour: normal UI colour -> red along the detents; the reds only, dim -> bright, in red mode ---------- */
var UI=[232,228,220],RED=[255,68,87],RDIM=[122,30,42],RBRI=[255,92,108],SEGO=56,SEGI=40;
function isRedTheme(){return root.getAttribute('data-theme')==='red'}
function ramp(t){
  t=clamp(t,0,1);
  var a=isRedTheme()?RDIM:UI,b=isRedTheme()?RBRI:RED;
  return 'rgb('+Math.round(lerp(a[0],b[0],t))+','+Math.round(lerp(a[1],b[1],t))+','+Math.round(lerp(a[2],b[2],t))+')';
}

function stateT(k){
  var S=B.state;
  if(k==='depth')return S.depth/(B.ZLV.length-1);
  if(k==='drift')return (S.drift-.25)/1.75;
  if(k==='ease')return S.ease/(B.EASES.length-1);
  if(k==='orbit')return S.orbit?1:0;
  return 0;
}
function modeT(){return B.MODES.indexOf(B.state.mode)/(B.MODES.length-1)}
function sweepT(){var S=B.state;return S.mode==='off'?0:S[S.mode]}
function valText(k){
  var S=B.state;
  if(k==='depth')return B.ZLV[S.depth].toFixed(2).replace(/0$/,'');
  if(k==='drift')return S.drift.toFixed(2).replace(/0$/,'')+'×';
  if(k==='ease')return B.EASES[S.ease].n;
  if(k==='orbit')return S.orbit?'orbit':'dolly';
  return '';
}
function tagText(k){
  var S=B.state;
  if(k==='depth')return 'ZLV';
  if(k==='drift')return 'rate';
  if(k==='ease'){var e=B.EASES[S.ease];return e.w?(B.W[e.w]).toFixed(1):('k '+e.rate)}
  return '';
}

function buildBig(){
  var d={k:'beyond',w:BIG,h:BIG,cx:80,cy:80,disp:{out:modeT(),inn:sweepT()},ring:'out',tgt:{out:modeT(),inn:sweepT()},snapping:false};
  var s=el('svg',{viewBox:'0 0 '+BIG+' '+BIG,width:BIG,height:BIG,'class':'bd-svg',tabindex:'0',role:'slider','aria-label':'Beyond selection','aria-valuemin':'0','aria-valuemax':'3'});
  s.appendChild(el('circle',{'class':'bd-hit',cx:80,cy:80,r:72}));
  var go=el('g',{'class':'ring-out'}),gl=el('g',{'class':'labs'}),gi=el('g',{'class':'ring-in'}),gc=el('g',{'class':'ctr'});
  d.segO=[];for(var q=0;q<SEGO;q++){d.segO.push(P(go,'bd-seg',arc(80,80,62,q/SEGO,Math.min(1,(q+1.3)/SEGO))))}
  d.tickO=[];
  [0,1/3,2/3,1].forEach(function(t,i){
    d.tickO.push(P(go,'bd-tick',line(80,80,56,68,ang(t))));
    var p=pt(80,80,76,ang(t));
    gl.appendChild(el('text',{'class':'bd-lab','data-i':i,x:p[0].toFixed(1),y:(p[1]+2.6).toFixed(1),'text-anchor':'middle'},B.MODES[i]));
  });
  d.thOut=el('circle',{'class':'bd-th',r:'4.2'});go.appendChild(d.thOut);
  d.segI=[];for(var q2=0;q2<SEGI;q2++){d.segI.push(P(gi,'bd-seg',arc(80,80,44,q2/SEGI,Math.min(1,(q2+1.3)/SEGI))))}
  for(var i=0;i<=20;i++){var t=i/20;P(gi,'bd-min'+(i%5?'':' bd-maj'),line(80,80,i%5?40:38,46,ang(t)))}
  d.thIn=el('circle',{'class':'bd-th',r:'3.6'});gi.appendChild(d.thIn);
  d.c1=el('text',{'class':'bd-c1',x:80,y:78,'text-anchor':'middle'},'');
  d.c2=el('text',{'class':'bd-c2',x:80,y:92,'text-anchor':'middle'},'');
  gc.appendChild(d.c1);gc.appendChild(d.c2);
  s.appendChild(go);s.appendChild(gl);s.appendChild(gi);s.appendChild(gc);
  d.svg=s;d.gOut=go;d.gIn=gi;d.labs=gl;d.bodyR=86;d.mistR=134;
  return d;
}
function buildMini(k){
  var d={k:k,w:MINI_W,h:MINI_H,cx:30,cy:30,disp:{main:stateT(k)},tgt:{main:stateT(k)},ring:'main'};
  var s=el('svg',{viewBox:'0 0 '+MINI_W+' '+MINI_H,width:MINI_W,height:MINI_H,'class':'bd-svg',tabindex:'0',role:'slider','aria-label':NAMES[k]});
  s.appendChild(el('circle',{'class':'bd-hit',cx:30,cy:30,r:27}));
  var g=el('g',{'class':'ring-main'});
  P(g,'bd-trk',arc(30,30,23,0,1));
  var n=k==='depth'||k==='ease'?4:k==='orbit'?2:0;
  for(var i=0;i<n;i++){var t=n===1?0:i/(n-1);P(g,'bd-tick',line(30,30,19,27,ang(t)))}
  if(k==='drift'){P(g,'bd-tick bd-def',line(30,30,19,27,ang((1-.25)/1.75)))}
  d.th=el('circle',{'class':'bd-th',r:'3.4'});g.appendChild(d.th);
  d.c1=el('text',{'class':'bd-c1 bd-sm',x:30,y:33,'text-anchor':'middle'},'');
  var gc=el('g',{'class':'ctr'});gc.appendChild(d.c1);
  var nm=el('text',{'class':'bd-nm',x:30,y:64,'text-anchor':'middle'},NAMES[k]);
  s.appendChild(g);s.appendChild(gc);s.appendChild(nm);
  d.svg=s;d.gMain=g;d.nm=nm;d.bodyR=34;d.mistR=62;d.bodyDy=4;
  return d;
}
function mount(){
  if(wrap)return;
  wrap=doc.createElement('div');wrap.id='bdial';wrap.hidden=true;
  hub=doc.createElement('button');hub.type='button';hub.className='bd-hub';hub.setAttribute('aria-label','Beyond: selection and camera dials');hub.setAttribute('aria-expanded','false');
  var hs=el('svg',{viewBox:'0 0 26 26',width:26,height:26,'aria-hidden':'true'});
  hs.appendChild(el('circle',{'class':'bd-hr',cx:13,cy:13,r:12}));
  [0,1/3,2/3,1].forEach(function(t){hs.appendChild(el('path',{'class':'bd-ht',d:line(13,13,8.4,12,ang(t))}))});
  hub._dot=el('circle',{'class':'bd-hd',r:'2.1'});hs.appendChild(hub._dot);
  hub.appendChild(hs);
  label=doc.createElement('span');label.className='bd-label';
  lab1=doc.createElement('b');lab2=doc.createElement('i');label.appendChild(lab1);label.appendChild(lab2);
  cluster=doc.createElement('div');cluster.className='bd-cluster';
  D.beyond=buildBig();ORDER.slice(1).forEach(function(k){D[k]=buildMini(k)});
  ORDER.forEach(function(k){
    var d=D[k],h=doc.createElement('div');h.className='bd-dial';h.setAttribute('data-k',k);
    h.style.width=d.w+'px';h.style.height=d.h+'px';h.style.left=(13+LAY[k].x-d.cx)+'px';h.style.top=(13+LAY[k].y-d.cy)+'px';
    var ms=doc.createElement('i'),bd=doc.createElement('i'),dy=d.bodyDy||0;
    ms.className='bd-mist';ms.style.cssText='width:'+d.mistR*2+'px;height:'+d.mistR*2+'px;left:'+(d.cx-d.mistR)+'px;top:'+(d.cy+dy-d.mistR)+'px';
    bd.className='bd-body';bd.style.cssText='width:'+d.bodyR*2+'px;height:'+d.bodyR*2+'px;left:'+(d.cx-d.bodyR)+'px;top:'+(d.cy+dy-d.bodyR)+'px';
    h.appendChild(ms);h.appendChild(bd);
    h.appendChild(d.svg);d.box=h;cluster.appendChild(h);
    bindDial(d);
  });
  wrap.appendChild(cluster);wrap.appendChild(hub);wrap.appendChild(label);
  doc.body.appendChild(wrap);
  hub.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();hubTap()});
  /* a tap outside, Esc, or the site's back button: one level at a time */
  doc.addEventListener('pointerdown',function(e){if(lvl&&!held&&!wrap.contains(e.target)&&!(e.target.closest&&e.target.closest('#back')))setLvl(lvl-1)},true);
  doc.addEventListener('keydown',function(e){if(e.key==='Escape'&&lvl){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setLvl(lvl-1)}},true);
  var bk=doc.getElementById('back');
  if(bk)bk.addEventListener('click',function(e){if(lvl){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setLvl(lvl-1)}},true);
  B.on(function(){paintAll();kick()});
  addEventListener('resize',function(){coverCheck()});
  wrap.setAttribute('data-lvl','0');
  paintAll();
  setInterval(tick250,250);
  tick250();
}
function hubTap(){setLvl(lvl===0?1:lvl===1?2:1)}

/* ---------- motion: the same springs as the camera ---------- */
function weight(){var c=B.cam();return c}
function stepSpring(s,dt,c){
  if(c.instant){s.x=s.t;s.v=0;return}
  if(c.exp){s.x+=(s.t-s.x)*(1-Math.exp(-dt*(c.rate||3.4)));s.v=0;return}
  s.w=c.w||4.8;
  var k=Math.exp(-s.w*dt),e=s.x-s.t,cc=s.v+s.w*e;s.x=s.t+(e+cc*dt)*k;s.v=(s.v-s.w*cc*dt)*k;
}
function moving(){
  if(Math.abs(openS.x-openS.t)>.0015||Math.abs(openS.v)>.01||Math.abs(subS.x-subS.t)>.0015||Math.abs(subS.v)>.01)return true;
  var k,d,r;
  for(k in D){d=D[k];for(r in d.disp)if(Math.abs(d.disp[r]-d.tgt[r])>.0008)return true}
  return false;
}
function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(loop)}}
function loop(now){
  raf=0;
  var dt=Math.min(.05,(now-last)/1000);last=now;
  var c=weight();
  openS.t=openT;subS.t=subT;stepSpring(openS,dt,c);stepSpring(subS,dt,c);
  var k,d,r;
  for(k in D){
    d=D[k];
    for(r in d.disp){
      if(d.drag&&d.ring===r){var kk=1-Math.exp(-dt*(d.rate||14));d.disp[r]+=(d.tgt[r]-d.disp[r])*kk}
      else{
        var sp=d['_s'+r]||(d['_s'+r]={x:d.disp[r],v:0,t:d.tgt[r],w:4.8});
        sp.x=d.disp[r];sp.t=d.tgt[r];stepSpring(sp,dt,c);d.disp[r]=sp.x;
      }
    }
  }
  paintAll();layout();
  if(moving()||held)raf=requestAnimationFrame(loop);
  else{layout();settled()}
}
function settled(){
  if(!openT&&openS.x<.002){cluster.classList.remove('bd-vis');wrap.classList.remove('bd-open')}
}
/* 0 = hub only, 1 = the big Beyond dial, 2 = Beyond plus depth / drift / easing / orbit. Both levels use the same spring. */
function setLvl(n){
  n=clamp(n,0,2);if(n===lvl)return;
  lvl=n;openT=n>=1?1:0;subT=n>=2?1:0;
  var c=B.cam();
  if(c.instant){openS.x=openT;openS.v=0;subS.x=subT;subS.v=0}
  if(openT){wrap.classList.add('bd-open');cluster.classList.add('bd-vis')}
  wrap.setAttribute('data-lvl',String(lvl));
  layout();kick();paintAll();
}

/* ---------- layout: the expand / contract is a dolly along Z out of the hub ---------- */
function layout(){
  var o=clamp(openS.x,0,1),so=clamp(subS.x,0,1),i;
  wrap.classList.toggle('bd-open',o>.002||openT===1);
  cluster.classList.toggle('bd-vis',o>.002);
  for(i=0;i<ORDER.length;i++){
    var k=ORDER[i],d=D[k],L=LAY[k],e,x,y;
    if(i===0){e=o;x=-L.x*(1-e);y=-L.y*(1-e)}
    else{
      /* the sub-menu grows out of the big dial, not the hub */
      e=clamp((so-(i-1)*.09)/(1-.09*(ORDER.length-2)),0,1);
      x=(LAY.beyond.x-L.x)*(1-e);y=(LAY.beyond.y-L.y)*(1-e);
    }
    var z=L.z*e,s=lerp(.16,1,e),ry=lerp(6,12,e);
    d.box.style.transform='perspective(240px) translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,'+z.toFixed(2)+'px) rotateY('+ry.toFixed(2)+'deg) scale('+s.toFixed(4)+')';
    d.box.style.visibility=e>.012?'':'hidden';
  }
}

/* ---------- painting ---------- */
function paintBig(d){
  var S=B.state,tOut=clamp(d.disp.out,0,1),tIn=clamp(d.disp.inn,0,1);
  var po=pt(80,80,62,ang(tOut)),pi=pt(80,80,44,ang(tIn));
  d.thOut.setAttribute('cx',po[0].toFixed(2));d.thOut.setAttribute('cy',po[1].toFixed(2));
  d.thIn.setAttribute('cx',pi[0].toFixed(2));d.thIn.setAttribute('cy',pi[1].toFixed(2));
  var mi=B.MODES.indexOf(S.mode),labs=d.labs.childNodes,i;
  for(i=0;i<labs.length;i++)labs[i].setAttribute('class','bd-lab'+(i===mi?' on':''));
  /* state colour */
  var key=tOut.toFixed(3)+'|'+tIn.toFixed(3)+'|'+(isRedTheme()?'r':'n')+'|'+S.mode;
  if(d.ckey!==key){
    d.ckey=key;
    var cO=ramp(tOut),cI=ramp(tIn),live=S.mode!=='off';
    d.segO.forEach(function(sg,q){var m=(q+.65)/SEGO,on=m<=tOut;sg.style.stroke=ramp(m);sg.style.opacity=on?'.96':'.34';sg.style.strokeWidth=on?'2.2':'1.2'});
    d.segI.forEach(function(sg,q){var m=(q+.65)/SEGI,on=live&&m<=tIn;sg.style.stroke=ramp(m);sg.style.opacity=on?'.96':'.3';sg.style.strokeWidth=on?'2.2':'1.1'});
    d.tickO.forEach(function(tk,q){tk.style.stroke=ramp(q/3)});
    for(i=0;i<labs.length;i++)labs[i].style.fill=i===mi?ramp(i/3):'';
    d.thOut.style.fill=cO;d.thIn.style.fill=live?cI:'';d.c1.style.fill=cO;d.c2.style.fill=live?cI:'';
    wrap.style.setProperty('--bd-state',cO);
  }
  d.gIn.setAttribute('class','ring-in'+(S.mode==='off'?' dead':''));
  var lb=S.mode==='off'?'off':B.label.split(' · ');
  if(S.mode==='off'){d.c1.textContent='beyond';d.c2.textContent='off'}
  else{d.c1.textContent=S.mode==='red'?'red mode':S.mode;d.c2.textContent=lb[1]||''}
  d.svg.setAttribute('aria-valuenow',String(mi));d.svg.setAttribute('aria-valuetext',B.label);
}
function paintMini(d){
  var p=pt(30,30,23,ang(clamp(d.disp.main,0,1)));
  d.th.setAttribute('cx',p[0].toFixed(2));d.th.setAttribute('cy',p[1].toFixed(2));
  d.c1.textContent=valText(d.k);
  d.svg.setAttribute('aria-valuetext',valText(d.k));
}
function paintAll(){
  if(!wrap)return;
  var S=B.state,k,d;
  if(!d_held('beyond',[ 'out' ]))D.beyond.tgt.out=modeT();
  if(!d_held('beyond',['inn']))D.beyond.tgt.inn=sweepT();
  ['depth','drift','ease','orbit'].forEach(function(k){if(!d_held(k,['main']))D[k].tgt.main=stateT(k)});
  paintBig(D.beyond);['depth','drift','ease','orbit'].forEach(function(k){paintMini(D[k])});
  /* the hub: a ring with the four detents; the gold dot is the mode, and the label reads the live choice */
  var hp=pt(13,13,12,ang(modeT()));hub._dot.setAttribute('cx',hp[0].toFixed(2));hub._dot.setAttribute('cy',hp[1].toFixed(2));
  wrap.setAttribute('data-mode',S.mode);
  lab1.textContent='beyond'+(S.mode==='off'?'':' · '+B.label);
  lab2.textContent=lvl>=2||held?camLine():'';
  lab1.style.color=ramp(modeT());hub._dot.style.fill=ramp(modeT());
  hub.setAttribute('aria-expanded',openT?'true':'false');
}
function d_held(k,rings){return held&&held.k===k&&rings.indexOf(held.ringKey)>=0}
function camLine(){
  var S=B.state,e=B.EASES[S.ease],c=B.cam();
  return 'z '+c.z.toFixed(0)+' · '+(S.drift*(1-.3*c.dark)).toFixed(2)+'× drift · '+e.n+' '+(e.w?B.W[e.w].toFixed(1):'k '+e.rate)+' · '+(S.orbit?'orbit':'dolly');
}

/* ---------- interaction ---------- */
function bindDial(d){
  var s=d.svg;
  s.addEventListener('pointerdown',function(e){
    if(e.button>0)return;
    e.preventDefault();e.stopPropagation();
    var r=s.getBoundingClientRect(),sc=r.width/d.w,cx=r.left+d.cx*sc,cy=r.top+d.cy*sc,rad=Math.hypot(e.clientX-cx,e.clientY-cy)/sc;
    var ring='main',ringKey='main';
    if(d.k==='beyond'){
      if(rad>=53){ring='out';ringKey='out'}
      else if(rad>=24&&B.state.mode!=='off'){ring='inn';ringKey='inn'}
      else{
        /* the centre: the second tap, which opens (or, again, closes) the sub-menu */
        if(rad<24)hubTap();
        return;
      }
    }
    held={k:d.k,ringKey:ringKey,id:e.pointerId};
    d.ring=ringKey;d.drag=true;d.rate=e.pointerType==='mouse'?14:22;d.cx0=cx;d.cy0=cy;d.sc=sc;
    try{s.setPointerCapture(e.pointerId)}catch(x){}
    wrap.classList.add('bd-hold');d.box.classList.add('bd-act');d.box.setAttribute('data-ring',ringKey);
    move(d,e);kick();
  });
  s.addEventListener('pointermove',function(e){if(held&&held.k===d.k&&held.id===e.pointerId)move(d,e)});
  var up=function(e){if(held&&held.k===d.k&&held.id===e.pointerId)release(d,e)};
  s.addEventListener('pointerup',up);s.addEventListener('pointercancel',up);
  s.addEventListener('keydown',function(e){key(d,e)});
}
function angleT(d,e){
  var dx=e.clientX-d.cx0,dy=e.clientY-d.cy0,th=Math.atan2(dx,-dy)*180/Math.PI;
  /* the gap at the bottom clamps to the nearer end, so the thumb never jumps across it */
  if(th>A1)th=th>(180+A1)/2?A0:A1;
  else if(th<A0)th=th<-(180+A1)/2?A1:A0;
  return clamp((th-A0)/(A1-A0),0,1);
}
function move(d,e){
  var t=angleT(d,e),k=d.k,rk=held.ringKey;
  d.tgt[rk]=t;
  if(k==='beyond'){
    if(rk==='out'){var i=Math.round(t*3);B.set({mode:B.MODES[i]})}
    else sweep(d,t,false)
  }else if(k==='depth'){B.set({depth:Math.round(t*(B.ZLV.length-1))})}
  else if(k==='ease'){B.set({ease:Math.round(t*(B.EASES.length-1))})}
  else if(k==='orbit'){B.set({orbit:t>.5?1:0})}
  else if(k==='drift'){
    var v=.25+1.75*t;if(Math.abs(v-1)<.07){v=1;d.tgt[rk]=(1-.25)/1.75}
    B.set({drift:v},{quiet:false});
  }
  paintAll();kick();
}
/* a sweep re-ranks every tile, so it applies at most every 110 ms and only for a real change; the last value always lands on release */
function sweep(d,t,force){
  var now=performance.now(),m=B.state.mode;
  clearTimeout(d.swT);
  if(force||(now-(d.swAt||0)>110&&Math.abs(t-(d.swV==null?-1:d.swV))>.02)){d.swAt=now;d.swV=t;var o={};o[m]=t;B.set(o);return}
  d.swT=setTimeout(function(){d.swAt=performance.now();d.swV=t;var o={};o[m]=t;B.set(o)},120);
}
function snapRing(d,rk){
  /* release: a detent dial lands on its detent by the selected spring; a continuous one stays where it was let go */
  var k=d.k;
  if(k==='beyond'&&rk==='out')d.tgt.out=modeT();
  else if(k==='depth'||k==='ease'||k==='orbit')d.tgt.main=stateT(k);
}
function release(d,e){
  var rk=held.ringKey;
  try{d.svg.releasePointerCapture(e.pointerId)}catch(x){}
  d.drag=false;snapRing(d,rk);
  if(d.k==='beyond'&&rk==='inn'){clearTimeout(d.swT);sweep(d,d.tgt.inn,true)}
  if(d.k==='beyond'&&B.state.mode!=='off')d.lastMode=B.state.mode;
  held=null;
  wrap.classList.remove('bd-hold');d.box.classList.remove('bd-act');d.box.removeAttribute('data-ring');
  paintAll();kick();
}
function key(d,e){
  var k=d.k,S=B.state,dir=e.key==='ArrowRight'||e.key==='ArrowUp'?1:e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:0;
  if(!dir)return;
  e.preventDefault();e.stopPropagation();
  if(k==='beyond'){
    if(e.shiftKey&&S.mode!=='off')B.set({[S.mode]:clamp(S[S.mode]+dir*.05,0,1)});
    else B.set({mode:B.MODES[clamp(B.MODES.indexOf(S.mode)+dir,0,3)]});
  }
  else if(k==='depth')B.set({depth:S.depth+dir});
  else if(k==='ease')B.set({ease:S.ease+dir});
  else if(k==='orbit')B.set({orbit:dir>0?1:0});
  else if(k==='drift')B.set({drift:S.drift+dir*.125});
  kick();
}

/* ---------- when the hub is in play, and the one fade: only over content ---------- */
function relevant(){
  var u=w.__u1;if(!u||!u.ready)return false;
  var c=u.cur;if(!c||(c.k!=='film'&&c.k!=='photo'))return false;
  if(c.cards)return false;
  if(c.lv>=2)return true;
  if(c.lv===1&&c.b)return true;
  if(c.lv===1&&c.k==='film'&&u.fsn&&u.fsn.fsn>.5)return true;
  return false;
}
var COVER=['IMG','VIDEO','P','H1','H2','H3','LI','A','B','SMALL','EM','CANVAS'];
function coverCheck(){
  if(!wrap||wrap.hidden)return;
  var r=hub.getBoundingClientRect(),over=false,pts=[[.5,.5],[.15,.15],[.85,.15],[.15,.85],[.85,.85]],i,j,u=w.__u1;
  if(lvl||held)over=false;
  else{
    for(i=0;i<pts.length&&!over;i++){
      var els=doc.elementsFromPoint(r.left+r.width*pts[i][0],r.top+r.height*pts[i][1]);
      for(j=0;j<els.length;j++){
        var e=els[j];if(wrap.contains(e))continue;
        if(e.closest&&e.closest('#layer')&&COVER.indexOf(e.tagName)>=0){over=true;break}
      }
    }
    var rc=u&&u.rects;
    if(!over&&rc&&rc.win){var wn=rc.win;if(r.right>wn[0]&&r.left<wn[0]+wn[2]&&r.bottom>wn[1]&&r.top<wn[1]+wn[3])over=true}
  }
  wrap.classList.toggle('bd-cover',over);
}
function tick250(){
  var on=relevant();
  if(wrap.hidden===on){wrap.hidden=!on;if(!on&&lvl){lvl=0;openT=0;subT=0;openS.x=0;openS.v=0;subS.x=0;subS.v=0;wrap.setAttribute('data-lvl','0');layout();settled()}}
  if(on)coverCheck();
}

function boot(){
  if(!doc.body){doc.addEventListener('DOMContentLoaded',boot);return}
  mount();
}
w.GJ_BEYOND_DIAL={setLevel:setLvl,get level(){return lvl},get isOpen(){return !!openT},get hub(){return hub},get el(){return wrap},refresh:tick250,
  grab:function(k,ring,t){var d=D[k];if(!d)return;d.ring=ring||'main';d.tgt[d.ring]=t;kick()}};
boot();
})(window);
