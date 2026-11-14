/* site-v3-3d · c9621b3 tonight/openers/moon particle-scatter opener, ported as a fixed overlay. */
function mount(){
  if(document.getElementById('c96-opener'))return;
  var el=document.createElement('div');
  el.id='c96-opener';
  el.setAttribute('aria-label','Opening: pinch in, or tap, to go through the sky');
  el.innerHTML=
    '<div id="c96-stage">'+
      '<div class="c96-water" id="c96-water" aria-hidden="true"></div>'+
      '<canvas id="c96-cv" aria-hidden="true"></canvas>'+
      '<p class="sr" id="c96-srline"></p>'+
    '</div>'+
    '<header id="c96-hud">'+
      '<button type="button" id="c96-back" hidden aria-label="back one stage">&#8249;</button>'+
    '</header>'+
    '<p id="c96-foot"><b id="c96-hint">pinch in, or tap</b><button type="button" id="c96-enter" hidden>enter</button></p>';
  document.body.appendChild(el);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
else mount();


(function(){
'use strict';
mount();
var $=function(i){return document.getElementById(i.indexOf('c96-')===0?i:'c96-'+i)};
var stage=$('stage'),cv=$('cv'),g=cv.getContext('2d',{alpha:true}),water=$('water');
if(!stage||!cv||!g||!water)return;
var W=0,H=0,DPR=1,PORT=true;

/* Copied from m4 (not imported): mark strokes, the glow sprite recipe, the near-lens bokeh sprite (depth.js), the tap glow and rippleAt (sky.js). */
var STROKES=[[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97]],[[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5]],[[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]]];
/* data.json: chapter order, tints and card counts, and one poem line, verbatim. */
var CHAP=[{k:'film',tint:'150,220,255',n:38},{k:'photo',tint:'170,245,212',n:39},{k:'objects',tint:'255,236,205',n:14},{k:'sound',tint:'255,182,176',n:5},{k:'about',tint:'214,222,236',n:4}];
var POEM=['Artistry a starfield','I chase'],POEM1='Artistry a starfield I chase';
var NODES=100,FIELD=120,NPT=NODES+FIELD,NFL=150;
var Q=new URLSearchParams(location.search);

function dbgVal(k,d){try{if(window.GJDBG&&GJDBG.val){var v=GJDBG.val(k);if(v!=null&&v!=='')return v}}catch(e){}return d}
function dbgSf(){try{if(window.GJDBG&&GJDBG.sf)return +GJDBG.sf()||0}catch(e){}return 0}
function dbgFlash(x){try{if(window.GJDBG&&GJDBG.flash)return +GJDBG.flash(x)||0}catch(e){}return 0}
function snowOn(){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return false;
  if(window.GJ_TUNE&&GJ_TUNE.ripples&&!GJ_TUNE.ripples())return false;
  return !!SNOW;
}


function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function smoother(u){u=clamp(u,0,1);return u*u*u*(u*(u*6-15)+10)}
function seeded(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function glowSprite(rgb){var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.4)');gr.addColorStop(.55,'rgba(' +rgb+',.08)');gr.addColorStop(1,'rgba('+rgb+',0)');
  q.fillStyle=gr;q.fillRect(0,0,128,128);return c}
var GW=glowSprite('205,225,255');
CHAP.forEach(function(c){c.glow=glowSprite(c.tint)});
var BOKS=(function(){
  var sz=96,c=document.createElement('canvas');c.width=c.height=sz;var x=c.getContext('2d'),i;
  for(i=0;i<2;i++){
    var gr=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);
    if(i===0){gr.addColorStop(0,'rgba(255,252,248,.92)');gr.addColorStop(.18,'rgba(214,228,242,.42)');gr.addColorStop(.5,'rgba(170,198,220,.12)');gr.addColorStop(1,'rgba(170,198,220,0)')}
    else{gr.addColorStop(0,'rgba(255,236,228,.7)');gr.addColorStop(.2,'rgba(255,190,170,.22)');gr.addColorStop(1,'rgba(255,180,160,0)')}
    x.fillStyle=gr;x.beginPath();x.arc(sz/2,sz/2,sz/2-1,0,7);x.fill();
  }
  return c;
})();

/* ---------- state ---------- */
var SEED=Math.round(parseFloat(Q.get('seed'))||7),SCAT=1,SNOW=Q.get('sw')!=='0';
var T=0,P=0,Pprev=0,dPdt=0,rate=18,tapGlow=null;
var ptr={},ptrN=0,gest='none',pz=null,tp=null,mouseDrag=null;
var pinchAct=0,touchAct=0,touchX=0,touchY=0,pcx=0,pcy=0,wheelT=0,lastTouchT=0,ripAcc=0,bokAcc=0,swirlAcc=0,firstDone=false;
var PTS=[],FL=[],BOK=[],CLU=[],EDGES=[],LINE=null,rng2=null;
var STAGES=[0,.33,.63,1];

function phaseName(p){return p<.03?'mark':p<.34?'scatter':p<.62?'line':p<.97?'settling':'constellation'}

/* ---------- build (seeded: same seed and same size give the same sky) ---------- */
function markPoints(N){
  var pts=[],segs=[],tot=0;
  STROKES.forEach(function(s){s.forEach(function(q,j){pts.push(q);if(j){var a=s[j-1],l=Math.hypot(q[0]-a[0],q[1]-a[1]);segs.push({a:a,b:q,l:l});tot+=l}})});
  var extra=Math.max(0,N-pts.length),left=extra,Pn=pts.slice();
  segs.forEach(function(sg,i){var n=i===segs.length-1?left:Math.round(extra*sg.l/tot);n=Math.min(n,left);left-=n;
    for(var j=1;j<=n;j++){var f=j/(n+1);Pn.push([sg.a[0]+(sg.b[0]-sg.a[0])*f,sg.a[1]+(sg.b[1]-sg.a[1])*f])}});
  return Pn.slice(0,N);
}
function markScreen(p){var sc=Math.min(W,H)*(PORT?.52:.46)/250;return [W*.5+p[0]*sc,H*.30+p[1]*sc]}
function lineLayout(){
  var tx=(+dbgVal('txt',100)||100)/100;
  var oc=document.createElement('canvas');oc.width=W;oc.height=H;var x=oc.getContext('2d');
  var fam='300 100px Poppins,system-ui,sans-serif';
  var lines=PORT?POEM:[POEM1];
  x.font=fam;
  var widest=0;lines.forEach(function(l){widest=Math.max(widest,x.measureText(l).width)});
  var fs=Math.min(100*(W*.8)/widest,PORT?46:54)*tx;
  fs=Math.min(fs,100*(W*.94)/widest);
  x.font=fam.replace('100px',fs.toFixed(1)+'px');x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';
  var lh=fs*1.38,y0=H*.5-(lines.length-1)*lh/2;
  lines.forEach(function(l,i){x.fillText(l,W/2,y0+i*lh)});
  var d=x.getImageData(0,0,W,H).data,step=9,pts;
  for(;step>=2;step--){
    pts=[];
    for(var yy=0;yy<H;yy+=step)for(var xx=0;xx<W;xx+=step)if(d[(yy*W+xx)*4+3]>140)pts.push([xx,yy]);
    if(pts.length>=NPT*1.15)break;
  }
  return {pts:pts,fs:fs,lh:lh,y0:y0,lines:lines,font:fam.replace('100px',fs.toFixed(1)+'px')};
}
function build(){
  PORT=H>=W;
  var r=seeded(SEED*7919+13),i,j;
  var mk=markPoints(NODES);
  LINE=lineLayout();
  var lp=LINE.pts.slice();
  for(i=lp.length-1;i>0;i--){j=(r()*(i+1))|0;var tmp=lp[i];lp[i]=lp[j];lp[j]=tmp}
  var u=Math.min(W,H),cx=W/2,cy=H/2,diag=Math.hypot(W,H);
  /* constellation: each chapter is a cluster sized by its real card count */
  var cen=PORT?[[.30,.28],[.72,.36],[.27,.64],[.70,.72],[.5,.50]]:[[.22,.38],[.52,.30],[.30,.74],[.80,.68],[.62,.56]];
  CLU=[];EDGES=[];var D=[],ci=0;
  CHAP.forEach(function(c,k){
    var R=u*.034*Math.sqrt(c.n)+10,mid=[cen[k][0]*W,cen[k][1]*H],dmin=R*.9/Math.sqrt(c.n)*1.15,pts=[],tries=0;
    while(pts.length<c.n&&tries<4000){
      tries++;var a=r()*6.2832,rr=R*Math.sqrt(r()),q=[mid[0]+Math.cos(a)*rr*1.1,mid[1]+Math.sin(a)*rr*.9];
      if(tries>1500)dmin*=.995;
      var ok=true;for(j=0;j<pts.length;j++)if(Math.hypot(pts[j][0]-q[0],pts[j][1]-q[1])<dmin){ok=false;break}
      if(ok)pts.push(q);
    }
    while(pts.length<c.n)pts.push([mid[0]+(r()-.5)*R,mid[1]+(r()-.5)*R]);
    var base=D.length;
    pts.forEach(function(q){D.push(q)});
    for(j=1;j<pts.length;j++){
      var best=-1,bd=1e9;
      for(var m=0;m<j;m++){var dd=Math.hypot(pts[j][0]-pts[m][0],pts[j][1]-pts[m][1]);if(dd<bd){bd=dd;best=m}}
      EDGES.push([base+j,base+best,k]);
      if(j>3&&r()<.22){var b2=(r()*j)|0;if(b2!==best)EDGES.push([base+j,base+b2,k])}
    }
    CLU.push({k:c.k,x:mid[0],y:mid[1]-R*1.05-6,tint:c.tint});
    ci+=c.n;
  });
  PTS=[];
  for(i=0;i<NPT;i++){
    var node=i<NODES,A,Dp,chap=0;
    if(node){
      A=markScreen(mk[i]);Dp=D[i];var acc=0;for(j=0;j<CHAP.length;j++){acc+=CHAP[j].n;if(i<acc){chap=j;break}}
    }else{
      A=[r()*W,r()*H];Dp=[A[0],A[1]];chap=-1;
    }
    var ang=r()*6.2832,dist=(.28+Math.pow(r(),.6)*.9)*diag*.5;
    var far=r()<.14?1.9:1;
    var B=[A[0]+Math.cos(ang)*dist*far,A[1]+Math.sin(ang)*dist*far];
    var C=lp[i%lp.length];
    PTS.push({A:A,B:B,C:[C[0],C[1]],D:Dp,chap:chap,node:node,
      b:node?.4+r()*.6:.35+r()*.65,rr:node?1.3:.5+r()*1.3,ph:r()*6.28,
      dl:(r()-.5)*.08,sw:(r()-.5)*2,ox:0,oy:0,vx:0,vy:0,px:A[0],py:A[1],z:node?1:.2+r()*.8});
  }
  var rf=seeded(SEED*31+5);
  FL=[];for(i=0;i<NFL;i++){var z=.2+rf()*.8;FL.push({age:9,x:rf()*W,y:rf()*H,z:z,vx:0,vy:0,ph:rf()*6.28,s:.6+rf()*.8,r:.5+z*1.6})}
  rng2=seeded(SEED*13+99);
  $('srline').textContent=POEM1;
}

/* ---------- layout ---------- */
function layout(){
  W=innerWidth;H=innerHeight;DPR=Math.min(2,devicePixelRatio||1);
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  build();
}

/* ---------- ripples (m4 rippleAt, plus soft and tight variants) ---------- */
var ripN=0;
function ripple(x,y,cls){
  if(!snowOn()||ripN>26)return;
  var s=document.createElement('i');s.className='rip'+(cls?' '+cls:'');s.style.left=x+'px';s.style.top=y+'px';
  water.appendChild(s);ripN++;
  setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);ripN--},1900);
}
function tapRipples(x,y){ripple(x,y);setTimeout(function(){ripple(x,y,'soft')},170);setTimeout(function(){ripple(x,y,'soft')},360)}

/* ---------- near-lens bokeh ---------- */
function spawnBokeh(x,y,spread,warm,vx,vy,aMul,life){
  if(BOK.length>26)BOK.shift();
  var a=rng2()*6.2832,rr=rng2()*spread;
  BOK.push({x:x+Math.cos(a)*rr,y:y+Math.sin(a)*rr,vx:vx+Math.cos(a)*(14+rng2()*26),vy:vy+Math.sin(a)*(14+rng2()*26)-6,
    d:Math.min(W,H)*(.08+rng2()*.16),t:0,life:life||1.7,a:(.28+rng2()*.4)*aMul,warm:warm||rng2()>.62?1:0,cx:x,cy:y});
}

/* ---------- input ---------- */
function nextStage(t){for(var i=0;i<STAGES.length;i++)if(STAGES[i]>t+.02)return STAGES[i];return 1}
function prevStage(t){for(var i=STAGES.length-1;i>=0;i--)if(STAGES[i]<t-.02)return STAGES[i];return 0}
function firstTouch(){if(firstDone)return;firstDone=true;$('foot').classList.add('gone')}
function startPinch(){
  var k=Object.keys(ptr),a=ptr[k[0]],b=ptr[k[1]];
  pz={d:Math.hypot(a.x-b.x,a.y-b.y)||1,T0:T,r:1};gest='pinch (2 fingers)';tp=null;mouseDrag=null;
  pcx=(a.x+b.x)/2;pcy=(a.y+b.y)/2;rate=22;firstTouch();
}
function onDown(e){
  e.stopPropagation();
  if(!isActive())return;
  if(e.target.closest('#c96-hud,#c96-foot,#fold-dial,#markmenu'))return;
  ptr[e.pointerId]={x:e.clientX,y:e.clientY};ptrN=Object.keys(ptr).length;
  try{stage.setPointerCapture(e.pointerId)}catch(_){}
  stage.classList.add('down');firstTouch();
  if(ptrN===1){
    tp={t:performance.now(),x:e.clientX,y:e.clientY,moved:0,pin:false};
    touchX=e.clientX;touchY=e.clientY;lastTouchT=performance.now();gest=(e.pointerType==='mouse'?'drag (mouse)':'touch (1 finger)');
    if(e.pointerType==='mouse')mouseDrag={y:e.clientY,T0:T};
    ripple(e.clientX,e.clientY,'tight');
  }
  if(ptrN===2){if(tp)tp.pin=true;startPinch()}
}
function onMove(e){
  e.stopPropagation();
  if(!isActive())return;
  if(!ptr[e.pointerId]){return}
  var px=ptr[e.pointerId].x,py=ptr[e.pointerId].y;
  ptr[e.pointerId]={x:e.clientX,y:e.clientY};
  if(ptrN===1&&tp){
    tp.moved+=Math.hypot(e.clientX-px,e.clientY-py);
    touchX=e.clientX;touchY=e.clientY;
    if(mouseDrag&&tp.moved>6){rate=14;T=clamp(mouseDrag.T0+(mouseDrag.y-e.clientY)*.0026,0,1)}
    swirlAcc+=Math.hypot(e.clientX-px,e.clientY-py);
    if(swirlAcc>46){swirlAcc=0;ripple(e.clientX,e.clientY,'tight')}
  }else if(ptrN>=2&&pz){
    var k=Object.keys(ptr),a=ptr[k[0]],b=ptr[k[1]];
    var d=Math.hypot(a.x-b.x,a.y-b.y);
    pcx=(a.x+b.x)/2;pcy=(a.y+b.y)/2;
    pz.r=d/pz.d;
    var next=pz.T0+Math.log(pz.r)/Math.log(3.2);
    if(P>=.96&&next>1){enterSite();return}
    T=clamp(next,0,1);rate=22;
  }
}
function onUp(e){
  e.stopPropagation();
  if(!ptr[e.pointerId])return;
  delete ptr[e.pointerId];ptrN=Object.keys(ptr).length;
  if(ptrN===1){var k=Object.keys(ptr)[0];tp=null;touchX=ptr[k].x;touchY=ptr[k].y;gest='touch (1 finger)';pz=null}
  if(ptrN===0){
    if(tp&&!tp.pin&&tp.moved<12&&performance.now()-tp.t<320&&e.type!=='pointercancel'){
      if(P>=.96){enterSite();tp=null;pz=null;mouseDrag=null;gest='none';stage.classList.remove('down');return}
      T=nextStage(T);rate=3.4;touchAct=1;lastTouchT=performance.now();
      tapRipples(tp.x,tp.y);tapGlow={x:tp.x,y:tp.y,t:performance.now()};
      for(var i=0;i<5;i++)spawnBokeh(tp.x,tp.y,18,i%2,0,0,1.15,1.9);
    }
    tp=null;pz=null;mouseDrag=null;gest='none';stage.classList.remove('down');
  }
}
function onWheel(e){
  e.preventDefault();e.stopPropagation();
  if(!isActive())return;
  firstTouch();
  var dy=e.deltaY*(e.deltaMode===1?18:1);
  var next=T-dy*(e.ctrlKey?.009:.0011);
  if(P>=.96&&next>1){enterSite();return}
  T=clamp(next,0,1);rate=16;wheelT=performance.now();
  pcx=e.clientX;pcy=e.clientY;
}
function stepBack(){T=prevStage(T);rate=3.4;touchAct=1;lastTouchT=performance.now()}
function onKey(e){
  if(!isActive())return;
  if(e.target.closest&&e.target.closest('#dbg,#markmenu,input,textarea'))return;
  var k=e.key;
  if(k==='ArrowUp'||k==='ArrowRight'||k==='+'||k===' '||k==='Enter'){e.preventDefault();firstTouch();T=nextStage(T);rate=3.4;touchAct=1;lastTouchT=performance.now()}
  else if(k==='ArrowDown'||k==='ArrowLeft'||k==='-'||k==='Backspace'||k==='Escape'){e.preventDefault();stepBack()}
}

/* ---------- frame ---------- */
var lastT=0,wScale=1;
function frame(t){
  if(!isActive()){raf=0;return}
  raf=requestAnimationFrame(frame);
  var dt=Math.min(.05,(t-(lastT||t))/1000);lastT=t;if(dt<=0)return;
  var now=performance.now();
  var k=1-Math.exp(-dt*rate);
  P+=(T-P)*k;if(Math.abs(T-P)<.0002)P=T;
  var dp=P-Pprev;Pprev=P;dPdt+=((dp/dt)-dPdt)*(1-Math.exp(-dt*10));
  var pinching=ptrN>=2||(now-wheelT)<260||(ptrN===1&&mouseDrag&&tp&&tp.moved>6);
  pinchAct+=((pinching?1:0)-pinchAct)*(1-Math.exp(-dt*(pinching?9:3.5)));
  var touching=ptrN===1&&!pinching;
  if(touching)touchAct+=(1-touchAct)*(1-Math.exp(-dt*12));
  else touchAct*=Math.exp(-dt*(now-lastTouchT<500?.6:1.8));
  if(touchAct<.003)touchAct=0;
  if(ptrN>=1&&!pinching&&ptrN===1){touchX=ptr[Object.keys(ptr)[0]].x;touchY=ptr[Object.keys(ptr)[0]].y}
  /* the water layer rides the zoom about the pinch point */
  var ox=pcx||W/2,oy=pcy||H*.46;
  if(ptrN===0&&!pinching){pcx=pcx+(W/2-pcx)*(1-Math.exp(-dt*1.2));pcy=pcy+(H*.46-pcy)*(1-Math.exp(-dt*1.2))}
  wScale=1+P*.9;
  water.style.transformOrigin=ox.toFixed(1)+'px '+oy.toFixed(1)+'px';
  water.style.transform='scale('+wScale.toFixed(4)+')';
  water.style.opacity=snowOn()?(lerp(.62,.3,smoother(P))*(1+.18*touchAct)).toFixed(3):'0';
  $('back').hidden=P<.03&&T<.03;
  var en=$('enter');if(en)en.hidden=!(P>=.96);
  draw(t,dt,now);
}
function snowIntensity(){
  var I=1-.45*pinchAct;
  I*=1+.9*touchAct;
  I*=1-.4*sstep(.5,1,P);
  return snowOn()?I:0;
}
function draw(t,dt,now){
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  var I=snowIntensity(),zoomK=dPdt*1.6;
  var cx=pcx||W/2,cy=pcy||H*.46;
  /* snow */
  if(snowOn()){
    var spK=(1-.5*pinchAct)*(1+.35*touchAct),R=Math.min(W,H)*.34;
    g.fillStyle='#e9f1ff';
    for(var i=0;i<FL.length;i++){
      var f=FL[i],z=f.z;
      if(touchAct>.01){
        var dx=f.x-touchX,dy=f.y-touchY,rr=Math.hypot(dx,dy)+.001;
        if(rr<R){var w=Math.pow(1-rr/R,2)*touchAct*(.5+z*.6);f.vx+=(-dy/rr*230-dx/rr*50)*w*dt*6;f.vy+=(dx/rr*230-dy/rr*50)*w*dt*6}
      }
      f.vx*=Math.exp(-dt*1.7);f.vy*=Math.exp(-dt*1.7);
      f.x+=(f.vx+Math.sin(t*.0006*f.s+f.ph)*9*z)*dt;
      f.y+=(f.vy+(22+40*z)*spK)*dt;
      if(Math.abs(zoomK)>.001){var zf=1+zoomK*dt*z*1.4;f.x=cx+(f.x-cx)*zf;f.y=cy+(f.y-cy)*zf}
      f.age+=dt;
      if(f.y>H+12){f.y=-8;f.x=rng2()*W;f.vx=f.vy=0;f.age=0}
      else if(f.x<-30||f.x>W+30||f.y<-30){f.y=rng2()*H;f.x=rng2()*W;f.vx=f.vy=0;f.age=0}
      var a=(.22+.5*z)*Math.min(1.6,I)*(.7+.3*Math.sin(t*.002*f.s+f.ph))*Math.min(1,f.age*.9);
      if(a<.02)continue;
      g.globalAlpha=Math.min(.95,a);
      var rr2=f.r*(1+.35*touchAct);
      if(z>.8){var gs=rr2*5;g.drawImage(GW,f.x-gs,f.y-gs,gs*2,gs*2)}
      g.beginPath();g.arc(f.x,f.y,rr2,0,7);g.fill();
    }
    /* bokeh: near-lens discs; carried outward by the zoom, and called up by a finger */
    var wantTouch=touchAct>.1&&now-lastTouchT<2500&&(ptrN>0||touchAct>.3);
    bokAcc+=dt*(wantTouch?(ptrN>0?7:5):0)+dt*(pinchAct>.1?2.2*pinchAct:0);
    if(bokAcc>1){
      bokAcc=0;
      if(pinchAct>.3&&ptrN!==1)spawnBokeh(cx,cy,Math.min(W,H)*.35,0,0,0,.6,2.1);
      else if(wantTouch)spawnBokeh(touchX,touchY,34,0,0,0,1.15,1.7);
    }
    g.save();g.globalCompositeOperation='lighter';
    for(var b=BOK.length-1;b>=0;b--){
      var o=BOK[b];o.t+=dt;var u=o.t/o.life;
      if(u>=1){BOK.splice(b,1);continue}
      o.x+=o.vx*dt;o.y+=o.vy*dt;
      if(Math.abs(zoomK)>.001){var z2=1+zoomK*dt*2.2;o.x=cx+(o.x-cx)*z2;o.y=cy+(o.y-cy)*z2}
      var env=Math.sin(u*3.1416),dm=o.d*(.55+.9*u);
      g.globalAlpha=Math.min(.8,o.a*env*(snowOn()?1:0));
      g.drawImage(BOKS,o.x-dm/2,o.y-dm/2,dm,dm);
    }
    g.restore();g.globalAlpha=1;
  }
  /* stars */
  var sc=SCAT;
  var lineB=sstep(.5,.6,P)*(1-sstep(.7,.78,P));
  var conB=sstep(.88,1,P);
  var jit=(.4+.6*(1-pinchAct))*1;
  var tx=touchX,ty=touchY,fieldR=Math.min(W,H)*.3,sfOn=dbgSf()>0,hd=.5*Math.hypot(W,H);
  for(var n=0;n<PTS.length;n++){
    var p=PTS[n];
    var s1=smoother((P-.0+p.dl)/.30),s2=smoother((P-.36+p.dl)/.24),s3=smoother((P-.66+p.dl)/.34);
    var bx=p.A[0]+(p.B[0]-p.A[0])*sc,by=p.A[1]+(p.B[1]-p.A[1])*sc;
    var x=lerp(p.A[0],bx,s1),y=lerp(p.A[1],by,s1);
    /* arc through the scatter: a sideways bow that peaks mid-move */
    var bow1=Math.sin(s1*3.1416)*p.sw*60*sc,bow2=Math.sin(s2*3.1416)*p.sw*46,bow3=Math.sin(s3*3.1416)*p.sw*34;
    var dx1=bx-p.A[0],dy1=by-p.A[1],l1=Math.hypot(dx1,dy1)||1;
    x+=-dy1/l1*bow1;y+=dx1/l1*bow1;
    x=lerp(x,p.C[0],s2);y=lerp(y,p.C[1],s2);
    x+=Math.sin(p.ph)*bow2;y+=Math.cos(p.ph)*bow2;
    x=lerp(x,p.D[0],s3);y=lerp(y,p.D[1],s3);
    x+=Math.cos(p.ph)*bow3;y+=Math.sin(p.ph)*bow3;
    /* the water answers a finger: stars near it swirl, then spring back */
    if(touchAct>.01){
      var ddx=p.px-tx,ddy=p.py-ty,rr=Math.hypot(ddx,ddy)+.001;
      if(rr<fieldR){var w=Math.pow(1-rr/fieldR,2)*touchAct*(p.node?.55:1);p.vx+=(-ddy/rr*160+ddx/rr*40)*w*dt*8;p.vy+=(ddx/rr*160+ddy/rr*40)*w*dt*8}
    }
    p.vx+=-p.ox*16*dt;p.vy+=-p.oy*16*dt;p.vx*=Math.exp(-dt*4);p.vy*=Math.exp(-dt*4);
    p.ox+=p.vx*dt;p.oy+=p.vy*dt;
    x+=p.ox;y+=p.oy;
    var sp=Math.hypot(x-p.px,y-p.py);
    var pxp=p.px,pyp=p.py;p.px=x;p.py=y;
    if(x<-40||x>W+40||y<-40||y>H+40)continue;
    var tw=.75+.25*Math.sin(t*.0011+p.ph);
    var sfl=sfOn?dbgFlash(Math.min(1,Math.hypot(x-W/2,y-H/2)/hd)):0;
    var al=(p.node?1:p.b*(.5+p.z*.5))*tw;
    if(!p.node){al*=lerp(1,.55,conB)+lineB*.9}else al*=(.8+.35*lineB);
    var streak=Math.min(1,sp/(26+dt*1000))*clamp(dPdt*dPdt*1200,0,1);
    if(sp>5&&Math.abs(dPdt)>.02){
      g.globalAlpha=Math.min(.55,al*.5);g.strokeStyle='rgba(215,228,255,1)';g.lineWidth=Math.max(.6,p.rr*.7);
      g.beginPath();g.moveTo(pxp,pyp);g.lineTo(x,y);g.stroke();
    }
    if(p.node){
      var gs=(5+16*p.b)*(1+.07*Math.sin(t/900+(x+y)*.01))*(1+1.5*sfl);
      var tint=p.chap>=0?CHAP[p.chap].glow:GW;
      g.globalAlpha=Math.min(1,al*(1+.6*sfl))*(.45+.5*p.b)*(1-conB);g.drawImage(GW,x-gs,y-gs,gs*2,gs*2);
      g.globalAlpha=Math.min(1,al*(1+.6*sfl))*(.45+.5*p.b)*conB;g.drawImage(tint,x-gs,y-gs,gs*2,gs*2);
      g.globalAlpha=Math.min(1,al);g.fillStyle='#fff';g.beginPath();g.arc(x,y,Math.max(1.1,1+p.b*1.6),0,7);g.fill();
    }else{
      g.globalAlpha=Math.min(1,al);
      if(p.rr>1.25||sfl>.02){var g2=p.rr*7*(1+2*sfl);g.globalAlpha=Math.min(1,al*(1+.8*sfl));g.drawImage(GW,x-g2,y-g2,g2*2,g2*2)}
      g.fillStyle='#dfe9ff';g.beginPath();g.arc(x,y,p.rr*p.z+.3+lineB*.5,0,7);g.fill();
    }
  }
  /* mark hairlines, then constellation lines and chapter names */
  var mkA=.28*(1-clamp(P/.12,0,1));
  if(mkA>.005){
    var msc=Math.min(W,H)*(PORT?.52:.46)/250,mox=W*.5,moy=H*.30;
    g.globalAlpha=1;g.lineWidth=1;g.strokeStyle='rgba(200,220,240,'+mkA.toFixed(3)+')';g.beginPath();
    STROKES.forEach(function(s){s.forEach(function(q,j){var x=mox+q[0]*msc,y=moy+q[1]*msc;if(j)g.lineTo(x,y);else g.moveTo(x,y)});g.stroke();g.beginPath()});
  }
  if(conB>.01){
    g.lineWidth=.8;
    for(var e=0;e<EDGES.length;e++){
      var E=EDGES[e],a1=PTS[E[0]],b1=PTS[E[1]];
      g.globalAlpha=conB*.38;g.strokeStyle='rgba('+CHAP[E[2]].tint+',1)';
      g.beginPath();g.moveTo(a1.px,a1.py);g.lineTo(b1.px,b1.py);g.stroke();
    }
    g.globalAlpha=conB*.72;g.font='300 '+(11*(+dbgVal('txt',100)||100)/100).toFixed(1)+'px "Julius Sans One",Poppins,sans-serif';g.textAlign='center';g.textBaseline='middle';
    for(var c=0;c<CLU.length;c++){g.fillStyle='rgba('+CLU[c].tint+',1)';g.fillText(CLU[c].k,CLU[c].x,CLU[c].y)}
  }
  /* the poem line, crisp, while the stars hold it */
  if(lineB>.01){
    g.globalAlpha=lineB*.62;g.fillStyle='#f4f7fb';g.font=LINE.font;g.textAlign='center';g.textBaseline='middle';
    g.shadowColor='rgba(0,0,0,.65)';g.shadowBlur=8;
    LINE.lines.forEach(function(l,i){g.fillText(l,W/2,LINE.y0+i*LINE.lh)});
    g.shadowBlur=0;
  }
  /* m4's tap glow */
  if(tapGlow){
    var age=(now-tapGlow.t)/1100;
    if(age>=1)tapGlow=null;else{
      var a2=(1-age)*(1-age)*.5;
      var rad=g.createRadialGradient(tapGlow.x,tapGlow.y,0,tapGlow.x,tapGlow.y,128);
      rad.addColorStop(0,'rgba(228,221,210,'+a2.toFixed(3)+')');rad.addColorStop(1,'rgba(228,221,210,0)');
      g.globalAlpha=1;g.fillStyle=rad;g.beginPath();g.arc(tapGlow.x,tapGlow.y,128,0,6.3);g.fill();
    }
  }
  g.globalAlpha=1;
}

function f2(v,d){return (+v).toFixed(d==null?2:d)}
function init(){
  layout();
  addEventListener('resize',layout);
  stage.addEventListener('pointerdown',onDown);
  stage.addEventListener('pointermove',onMove);
  stage.addEventListener('pointerup',onUp);
  stage.addEventListener('pointercancel',onUp);
  stage.addEventListener('wheel',onWheel,{passive:false});
  stage.addEventListener('touchmove',function(e){if(e.cancelable)e.preventDefault()},{passive:false});
  stage.addEventListener('contextmenu',function(e){e.preventDefault()});
  $('back').addEventListener('click',stepBack);
  addEventListener('keydown',onKey);
  var root=document.documentElement;
  var pP=parseFloat(Q.get('p'));if(isFinite(pP)){T=P=Pprev=clamp(pP,0,1);firstDone=true;$('foot').classList.add('gone')}
  var ent=$('enter');if(ent)ent.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();enterSite()});
  if(isDeepLink()){enterSite(true)}
  else startLoop();
}
function isDeepLink(){return /^#(film|photo|objects|spaces|sound|about)(\/|$)/.test(location.hash||'')}
function isActive(){return !document.documentElement.classList.contains('c96-entered')}
var raf=0;
function startLoop(){if(!raf&&isActive())raf=requestAnimationFrame(frame)}
function enterSite(instant){
  document.documentElement.classList.add('c96-entered');
  if(raf){cancelAnimationFrame(raf);raf=0}
  lastT=0;
  try{scrollTo(0,0)}catch(e){}
}
function replay(){
  document.documentElement.classList.remove('c96-entered');
  T=0;P=0;Pprev=0;dPdt=0;rate=18;firstDone=false;tapGlow=null;ptr={};ptrN=0;gest='none';pz=null;tp=null;mouseDrag=null;
  pinchAct=0;touchAct=0;BOK=[];ripAcc=0;bokAcc=0;swirlAcc=0;
  var ft=$('foot');if(ft)ft.classList.remove('gone');
  var en=$('enter');if(en)en.hidden=true;
  var bk=$('back');if(bk)bk.hidden=true;
  try{scrollTo(0,0)}catch(e){}
  if(water){water.style.transform='';water.style.opacity=''}
  layout();
  startLoop();
}
window.GJ_MOON_OPENER={get P(){return P},get T(){return T},go:function(v){T=clamp(v,0,1);rate=14;firstTouch();if(isActive())startLoop()},replay:replay,enter:enterSite,get active(){return isActive()},get pts(){return PTS}};
if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('300 40px Poppins'),document.fonts.load('300 12px "Julius Sans One"')]).then(init,init)}else init();
})();
