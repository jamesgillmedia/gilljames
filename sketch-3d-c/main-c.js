/* gill james · sketch 3d-c (boards inside the sky) — based on sketch 3d — a fly-through of the site-v3 sky. Sketch. three.js r160 vendored. */
import * as THREE from '../sketch-3d/vendor/three.module.min.js';
const html=document.documentElement;
if(html.className==='nogl')await new Promise(()=>{});/* static fallback shown; stop quietly */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.getElementById('c'),hint=document.getElementById('hint');
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance'})}catch(e){html.className='nogl';await new Promise(()=>{})}
R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.setClearColor(0x04060c,1);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x04060c,.0042);
const cam=new THREE.PerspectiveCamera(60,1,.1,900);cam.rotation.order='YXZ';
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(CH.length)layoutAll();U.uPx.value=R.getPixelRatio()*h/780}
/* ---------- critically damped springs (analytic step: never overshoots when released with v = -w*e) ---------- */
function S(x,w){return{x:x,v:0,t:x,w:w}}
function sstep(s,dt){const w=s.w,e=s.x-s.t,k=Math.exp(-w*dt),c=s.v+w*e;s.x=s.t+(e+c*dt)*k;s.v=(s.v-w*c*dt)*k}
const W_REL=RM?14:9.5;      /* drag release: 1% settle = 4.6/w ≈ 480 ms (330 ms reduced) */
const W_FLY=RM?9:5.6;       /* pinch / wheel flight */
const W_GLIDE=RM?8:4.6;     /* tap-to-glide / double-tap pull back (~1 s, ~0.6 s reduced) */
const VMAX=RM?140:85;       /* flight speed clamp, world units / s */
const yaw=S(0,W_REL),pitch=S(0,W_REL),roll=S(0,11);
const P=[S(0,W_FLY),S(2,W_FLY),S(42,W_FLY)];
/* ---------- stars ---------- */
const U={uT:{value:0},uTw:{value:RM?0:1},uPx:{value:1}};
function starField(n){const g=new THREE.BufferGeometry(),p=new Float32Array(n*3),ph=new Float32Array(n),sz=new Float32Array(n),col=new Float32Array(n*3);
  for(let i=0;i<n;i++){const z=80-Math.random()*520,r=8+Math.pow(Math.random(),.7)*150,a=Math.random()*6.283;
    p[i*3]=Math.cos(a)*r;p[i*3+1]=Math.sin(a)*r*.75;p[i*3+2]=z;ph[i]=Math.random();
    sz[i]=Math.random()<.05?3.2+Math.random()*2.5:.9+Math.random()*1.6;const t=Math.random();
    col[i*3]=.75+.25*t;col[i*3+1]=.82+.1*t;col[i*3+2]=1-.15*t*t}
  g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('aPh',new THREE.BufferAttribute(ph,1));
  g.setAttribute('aSz',new THREE.BufferAttribute(sz,1));g.setAttribute('aCol',new THREE.BufferAttribute(col,3));
  const m=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float aPh;attribute float aSz;attribute vec3 aCol;uniform float uT,uTw,uPx;varying float vA;varying vec3 vC;
    void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float d=max(.1,-mv.z);
      float tw=1.+uTw*.5*sin(uT*(1.1+aPh*2.3)+aPh*60.)*step(.55,fract(aPh*7.));
      gl_PointSize=clamp(aSz*uPx*tw*170./d,1.2,30.);
      vA=1.7*exp(-d*.0048)*smoothstep(.5,6.,d)*(.7+.3*tw);vC=aCol;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);a*=a;gl_FragColor=vec4(vC*a*vA,1.);}`});
  return new THREE.Points(g,m)}
const NSTAR=innerWidth<700?2600:4200;scene.add(starField(NSTAR));
/* soft nebula glows */
function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const GT=glowTex();
[[-60,30,-200,0x27407a,160],[70,-20,-320,0x4a2a6a,200],[10,-40,-90,0x173c4a,120]].forEach(n=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:n[3],transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  s.position.set(n[0],n[1],n[2]);s.scale.set(n[4],n[4],1);scene.add(s)});
/* ---------- chapters ---------- */
const POS=[[-6,5,-25],[11,-7,-90],[-12,-3,-155],[12,8,-220],[-2,0,-285]];
const CH=[];let data;
function txtTex(lines,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  lines.forEach(l=>{x.font=l.f;x.fillStyle=l.c||'#e4ebf5';x.textAlign='center';x.textBaseline='middle';if(l.ls)x.letterSpacing=l.ls;x.fillText(l.s,w/2,l.y)});
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;return t}
function fit(x,s,f,max){let fs=f;x.font=fs+'px Poppins';while(x.measureText(s).width>max&&fs>14){fs-=2;x.font=fs+'px Poppins'}return fs}
function cardTex(cd){const W=360,ih=cd.src?Math.round(W*cd.h/cd.w):0,H=ih+92,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='rgba(8,12,22,.92)';x.fillRect(0,0,W,H);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;
  const cap=()=>{x.fillStyle='rgba(8,12,22,.92)';x.fillRect(0,ih,W,H-ih);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#e9eff8';
    const fs=fit(x,cd.t,26,W-24);x.font=fs+'px Poppins';x.fillText(cd.t,W/2,ih+34);x.font='19px Poppins';x.fillStyle='rgba(200,214,232,.62)';x.fillText(cd.m,W/2,ih+66);
    x.strokeStyle='rgba(207,216,230,.28)';x.lineWidth=2;x.strokeRect(1,1,W-2,H-2);t.needsUpdate=true};
  cap();if(cd.src){const im=new Image();im.onload=()=>{x.drawImage(im,0,0,W,ih);cap()};im.src=cd.src}
  return{t:t,a:W/H}}
/* ---------- boards: one flat scrollable panel per chapter, drawn like the cards ---------- */
const BW=12,BH=17,BTW=1024,BWIN=Math.round(BTW*BH/BW);
function boardTex(d,cards){const cols=2,pad=28,cw=(BTW-pad*(cols+1))/cols,ih=Math.round(cw*9/16),chh=ih+96,top=150;
  const rows=Math.ceil(cards.length/cols),H=Math.max(BWIN,top+rows*(chh+pad)+pad),c=document.createElement('canvas');c.width=BTW;c.height=H;const x=c.getContext('2d');
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.repeat.set(1,BWIN/H);t.offset.set(0,1-BWIN/H);
  const cells=cards.map((cd,j)=>({x:pad+(j%cols)*(cw+pad),y:top+Math.floor(j/cols)*(chh+pad),w:cw,h:chh,ih:ih,cd:cd}));
  const draw=()=>{x.clearRect(0,0,BTW,H);x.fillStyle='rgba(8,12,22,.86)';x.fillRect(0,0,BTW,H);x.strokeStyle='rgba(207,216,230,.28)';x.lineWidth=3;x.strokeRect(2,2,BTW-4,H-4);
    x.textAlign='center';x.textBaseline='middle';x.fillStyle='#e4ebf5';x.font='72px Julius';x.letterSpacing='12px';x.fillText(d.nm,BTW/2,62);x.letterSpacing='0px';
    x.font='28px Poppins';x.fillStyle='rgba(200,214,232,.62)';x.fillText(d.ct,BTW/2,118);
    cells.forEach(e=>{x.fillStyle='rgba(20,28,44,.9)';x.fillRect(e.x,e.y,e.w,e.ih);if(e.im)x.drawImage(e.im,e.x,e.y,e.w,e.ih);
      x.fillStyle='#e9eff8';const fs=fit(x,e.cd.t,32,e.w-20);x.font=fs+'px Poppins';x.fillText(e.cd.t,e.x+e.w/2,e.y+e.ih+36);
      x.font='24px Poppins';x.fillStyle='rgba(200,214,232,.62)';x.fillText(e.cd.m||'',e.x+e.w/2,e.y+e.ih+72);
      x.strokeStyle='rgba(207,216,230,.22)';x.lineWidth=2;x.strokeRect(e.x,e.y,e.w,e.h)});t.needsUpdate=true};
  draw();cells.forEach(e=>{if(!e.cd.src)return;const im=new Image();im.onload=()=>{e.im=im;draw()};im.src=e.cd.src});
  return{t:t,H:H,cells:cells}}
function build(){data.forEach((d,i)=>{const g=new THREE.Group(),c=new THREE.Vector3(...POS[i]);g.position.copy(c);scene.add(g);
  const cards=d.cards.length?d.cards:[{t:d.nm,m:d.ct}],n=Math.max(5,cards.length),rnd=mulberry(i*97+5),st=[];
  for(let j=0;j<n;j++){const a=j/n*6.283+rnd()*.7,r=3+rnd()*4.2;st.push(new THREE.Vector3(Math.cos(a)*r*1.25,Math.sin(a)*r*.8,(rnd()-.5)*3))}
  const sm=[];st.forEach((p,j)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:0xdfe9ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    s.position.copy(p);const k=j===0?2.6:1.5+rnd();s.scale.set(k,k,1);s.userData.k=k;g.add(s);sm.push(s)});
  const lp=[];for(let j=0;j<n;j++){lp.push(st[j],st[(j+1)%n]);if(j%3===0)lp.push(st[j],st[(j+2)%n])}
  const lines=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp),new THREE.LineBasicMaterial({color:0x8fb0e0,transparent:true,opacity:.35,depthWrite:false}));g.add(lines);
  const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{s:d.nm,f:'84px Julius',y:64,ls:'14px'}],640,128),transparent:true,depthWrite:false}));
  lab.position.set(0,8.2,0);g.add(lab);
  const inf=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{s:d.ct,f:'40px Poppins',y:32,c:'rgba(214,226,242,.9)'}],640,64),transparent:true,depthWrite:false,opacity:0}));
  inf.position.set(0,5.6,0);g.add(inf);
  const cm=[];cards.slice(0,n).forEach((cd,j)=>{const T=cardTex(cd),h=cd.src?4.6:2.2,w=h*T.a,m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:T.t,transparent:true,opacity:0,depthWrite:false}));
    m.userData.w=w;m.userData.h=h;m.userData.grid=new THREE.Vector3();m.userData.star=st[j];m.visible=false;g.add(m);cm.push(m)});
  const BT=boardTex(d,cards),bd=new THREE.Mesh(new THREE.PlaneGeometry(BW,BH),new THREE.MeshBasicMaterial({map:BT.t,transparent:true,opacity:0,depthWrite:false}));
  bd.position.set(0,0,4);bd.visible=false;g.add(bd);
  CH.push({d:d,g:g,c:c,st:sm,lines:lines,lab:lab,inf:inf,cards:cm,m:0,dist:1e9,stand:20,gh:6,bd:bd,BT:BT,sc:0,scT:0})});layoutAll()}
/* cards grid sized so the whole constellation fits the screen at its stand-off distance (portrait-aware) */
function layoutAll(){const tv=Math.tan(cam.fov*Math.PI/360),th=tv*cam.aspect;CH.forEach(C=>{const cs=C.cards,n=cs.length,cw=Math.max(...cs.map(c=>c.userData.w))+.7,chh=Math.max(...cs.map(c=>c.userData.h))+.8;
  let best=null;for(let cols=1;cols<=n;cols++){const rows=Math.ceil(n/cols),gw=cols*cw,gh=rows*chh+5.5,d=Math.max(gw/2/th,gh/2/tv)*1.08;if(!best||d<best.d)best={cols,rows,d,gh}}
  cs.forEach((c,j)=>{const col=j%best.cols,row=Math.floor(j/best.cols),inRow=Math.min(best.cols,n-row*best.cols);c.userData.grid.set((col-(inRow-1)/2)*cw,((best.rows-1)/2-row)*chh-1.6,0)});
  C.stand=Math.max(12,Math.max(BW/2/th,BH/2/tv)*1.06+4);C.gh=BH-2})}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
/* ---------- camera ---------- */
const fwd=new THREE.Vector3(),tmp=new THREE.Vector3(),q=new THREE.Quaternion(),eu=new THREE.Euler(0,0,0,'YXZ');
function forward(y,p){return fwd.set(-Math.sin(y)*Math.cos(p),Math.sin(p),-Math.cos(y)*Math.cos(p))}
function clampP(v){v[0]=Math.max(-40,Math.min(40,v[0]));v[1]=Math.max(-30,Math.min(80,v[1]));v[2]=Math.max(-290,Math.min(60,v[2]));return v}
let VLIM=VMAX;function setPT(v,w){clampP(v);VLIM=w===W_GLIDE?VMAX*1.7:VMAX;P.forEach((s,i)=>{s.t=v[i];s.w=w})}
function fly(a,w){const f=forward(yaw.t,pitch.t);const cur=[P[0].t,P[1].t,P[2].t];setPT([cur[0]+f.x*a,cur[1]+f.y*a,cur[2]+f.z*a],w||W_FLY)}
function glideTo(C){const cp=new THREE.Vector3(P[0].x,P[1].x,P[2].x),dir=cp.sub(C.c);dir.set(0,0,1);
  const tp=C.c.clone().addScaledVector(dir,C.stand);setPT([tp.x,tp.y,tp.z],W_GLIDE);
  const v=C.c.clone().sub(tp);let ty=Math.atan2(-v.x,-v.z);while(ty-yaw.x>Math.PI)ty-=6.283;while(ty-yaw.x<-Math.PI)ty+=6.283;
  yaw.t=ty;pitch.t=Math.atan2(v.y,Math.hypot(v.x,v.z));yaw.w=pitch.w=W_GLIDE;log('glide',C.d.k)}
function pullBack(){const f=forward(yaw.x,pitch.x);setPT([P[0].x-f.x*55,P[1].x-f.y*55,P[2].x-f.z*55],W_GLIDE);pitch.t=pitch.x*.4;pitch.w=W_GLIDE;log('pullback')}
/* ---------- input ---------- */
let ON=null;const BTN=document.getElementById('space'),VW=document.getElementById('vw'),ray=new THREE.Raycaster(),v2=new THREE.Vector2();
function scroll(C,dy){const max=Math.max(0,C.BT.H-BWIN);C.scT=Math.max(0,Math.min(max,C.scT+dy))}
const PT=new Map();let drag=null,pinch=null,lastTap=0,tapTimer=0,lastIn=performance.now(),velY=0,velP=0,lastMv=0;
const F=()=>innerHeight/2/Math.tan(cam.fov*Math.PI/360);
function seen(){lastIn=performance.now();hint.style.opacity=0}
cv.addEventListener('pointerdown',e=>{e.preventDefault();seen();try{cv.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:performance.now()});
  if(PT.size===1){drag={id:e.pointerId,moved:0};if(LV!=='board'){yaw.t=yaw.x;pitch.t=pitch.x;yaw.v=pitch.v=0;velY=velP=0;lastMv=performance.now();yaw.w=pitch.w=W_REL}}
  else if(PT.size===2){drag=null;const a=[...PT.values()];pinch={d0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),done:0}}});
cv.addEventListener('pointermove',e=>{const p=PT.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x;let dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(pinch&&PT.size>=2){const a=[...PT.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(!pinch.done&&pinch.d0>0){const r=Math.log(d/pinch.d0);if(r<-.22){pinch.done=1;stepOut()}else if(r>.22){pinch.done=1;stepIn((a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2)}}seen();return}
  if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<6)return;const f=F(),now=performance.now(),dt=Math.max(1,now-lastMv)/1000;lastMv=now;
    if(LV==='board'){if(ON)scroll(ON,-dy*BWIN/(innerHeight*.8));seen();return}
    const ay=dx/f,ap=dy/f;yaw.x+=ay;yaw.t=yaw.x;pitch.x=Math.max(-.7,Math.min(.7,pitch.x+ap));pitch.t=pitch.x;
    const k=dt<.08?.35:1;velY=velY*(1-k)+ay/dt*k;velP=velP*(1-k)+ap/dt*k;yaw.v=velY;pitch.v=0;seen()}});
function up(e){const p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
  if(pinch){if(PT.size<2)pinch=null;if(PT.size===1){const id=[...PT.keys()][0];drag={id:id,moved:99};lastMv=performance.now();velY=velP=0}return}
  if(!drag||drag.id!==e.pointerId)return;const now=performance.now(),dur=now-p.t0;
  if(drag.moved<10&&dur<350){drag=null;tap(e.clientX,e.clientY,now);return}
  /* release: critically damped, target = x + v/w -> pure exponential, settles ~480 ms, no overshoot */
  drag=null;if(LV==='board')return;/* open space: free look, then ease back level toward the focus */
  if(HOME){let ty=HOME.y;while(ty-yaw.x>Math.PI)ty-=6.283;while(ty-yaw.x<-Math.PI)ty+=6.283;yaw.w=pitch.w=W_GLIDE;yaw.v=pitch.v=0;yaw.t=ty;pitch.t=HOME.p}return;
  let vy=now-lastMv>110?0:velY,vp=now-lastMv>110||ON?0:velP;const cap=.9*W_REL;vy=Math.max(-cap,Math.min(cap,vy));vp=Math.max(-cap,Math.min(cap,vp));
  yaw.w=pitch.w=W_REL;yaw.v=vy;yaw.t=yaw.x+vy/W_REL;pitch.v=vp;pitch.t=Math.max(-.7,Math.min(.7,pitch.x+vp/W_REL));if(pitch.t!==pitch.x+vp/W_REL)pitch.v=-W_REL*(pitch.x-pitch.t);
  drag=null;log('release',{vy:+vy.toFixed(3)})}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
['touchstart','touchmove','gesturestart','gesturechange'].forEach(t=>cv.addEventListener(t,e=>e.preventDefault(),{passive:false}));
cv.addEventListener('wheel',e=>{e.preventDefault();seen();let dy=e.deltaY*(e.deltaMode===1?16:1);if(LV==='board'&&!e.ctrlKey){if(ON)scroll(ON,dy*1.5);return}const now=performance.now();if(now-WT>350)WA=0;WT=now;WA+=dy*(e.ctrlKey?4:1);
  if(now-WS>700&&Math.abs(WA)>90){WS=now;if(WA>0)stepOut();else stepIn(e.clientX,e.clientY);WA=0}},{passive:false});
cv.addEventListener('dblclick',e=>e.preventDefault());
function pick(x,y){let best=null,bd=80;CH.forEach(C=>{tmp.copy(C.c).project(cam);if(tmp.z>1)return;const sx=(tmp.x+1)/2*innerWidth,sy=(1-tmp.y)/2*innerHeight,d=Math.hypot(sx-x,sy-y)*(C.dist<60?.6:1);
  if(d<bd+Math.min(120,1600/Math.max(1,C.dist))){bd=d;best=C}});return best}
let WA=0,WT=0,WS=0;
function tap(x,y,now){if(LV==='board'){if(ON)hitBoard(ON,x,y);return}
  if(now-lastTap<360){clearTimeout(tapTimer);lastTap=0;setLv('all');return}lastTap=now;
  tapTimer=setTimeout(()=>{const C=pick(x,y);if(C)setLv('board',CH.indexOf(C))},RM?220:300)}
/* ---------- levels: everything › constellation › board (pinch out = one step back) ---------- */
let LV='all',LI=0,HOME=null;const WH=document.getElementById('where'),V3=(x,y,z)=>new THREE.Vector3(x,y,z);
function look(tp,at){clampP(tp);setPT(tp,W_GLIDE);const v=at.clone().sub(V3(...tp));let ty=Math.atan2(-v.x,-v.z);while(ty-yaw.x>Math.PI)ty-=6.283;while(ty-yaw.x<-Math.PI)ty+=6.283;
  yaw.t=ty;yaw.v=pitch.v=0;pitch.t=Math.atan2(v.y,Math.hypot(v.x,v.z));yaw.w=pitch.w=W_GLIDE;HOME={y:ty,p:pitch.t}}
function setLv(lv,i){LV=lv;if(i!=null&&i>=0)LI=i;const C=CH[LI],c=C.c;
  if(lv==='board')look([c.x,c.y,c.z+C.stand],c);
  else if(lv==='con')look([c.x*.4,c.y+4,c.z+C.stand+30],c);
  else look([0,70,40],V3(0,0,-150));
  WH.textContent=lv==='all'?'everything':C.d.nm+' · '+(lv==='con'?'constellation':'board');BTN.hidden=lv!=='board';log('lv',lv+' '+C.d.k)}
function stepOut(){if(!VW.hidden){closeV();return}if(LV==='board')setLv('con');else if(LV==='con')setLv('all')}
function stepIn(x,y){if(!VW.hidden)return;if(LV==='board'){if(ON)hitBoard(ON,x,y);return}if(LV==='con'){setLv('board');return}
  const C=pick(x,y)||pick(innerWidth/2,innerHeight/2);setLv('con',C?CH.indexOf(C):LI)}
function hitBoard(C,x,y){v2.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(v2,cam);const h=ray.intersectObject(C.bd)[0];if(!h)return false;
  const px=h.uv.x*BTW,py=(1-h.uv.y)*BWIN+C.sc,e=C.BT.cells.find(e=>px>=e.x&&px<=e.x+e.w&&py>=e.y&&py<=e.y+e.h);if(e)openV(e.cd);return true}
function openV(cd){const src=cd.v||cd.src;if(!src)return;VW.querySelector('.m').innerHTML=cd.v?'<video autoplay loop muted playsinline></video>':'<img alt="">';
  const el=VW.querySelector('.m').firstChild;el.src=src;if(cd.t)el.alt=cd.t;VW.querySelector('.c').textContent=cd.t+(cd.m?' · '+cd.m:'');VW.hidden=false;log('view',src)}
function closeV(){VW.hidden=true;VW.querySelector('.m').innerHTML=''}
VW.querySelector('.x').addEventListener('click',closeV);
let vp0=0;VW.addEventListener('touchstart',e=>{if(e.touches.length===2)vp0=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{passive:true});
VW.addEventListener('touchmove',e=>{if(e.touches.length===2&&vp0){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(d<vp0*.75){vp0=0;closeV()}}},{passive:true});
BTN.addEventListener('click',stepOut);document.getElementById('home').addEventListener('click',()=>{closeV();setLv('all')});
addEventListener('keydown',e=>{if(e.key==='Escape')stepOut()});
/* ---------- loop ---------- */
const LOG=[];function log(k,v){LOG.push([Math.round(performance.now()),k,v]);if(LOG.length>200)LOG.shift()}
let last=performance.now(),fc=0,ft=last,fps=0,REC=null;
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;fc++;if(now-ft>=1000){fps=fc*1000/(now-ft);fc=0;ft=now}
  U.uT.value=now/1000;
  if(!drag){sstep(yaw,dt);sstep(pitch,dt)}
  const px=P.map(s=>s.x);P.forEach(s=>sstep(s,dt));/* speed clamp */
  const mv=Math.hypot(P[0].x-px[0],P[1].x-px[1],P[2].x-px[2]),lim=VLIM*dt;if(mv>lim){const k=lim/mv;P.forEach((s,i)=>{s.x=px[i]+(s.x-px[i])*k;s.v=(s.x-px[i])/dt})}
  /* bank follows the curve: roll leans into the turn, from yaw velocity (critically damped) */
  roll.t=Math.max(-.14,Math.min(.14,-yaw.v*.16));sstep(roll,dt);
  /* curved dolly: while turning, the eye swings slightly sideways + dips, so the universe rotates on an arc */
  const sw=Math.max(-1,Math.min(1,yaw.v*.6));
  forward(yaw.x,pitch.x);const rx=Math.cos(yaw.x),rz=-Math.sin(yaw.x);
  cam.position.set(P[0].x+rx*sw*1.6,P[1].x-Math.abs(sw)*.7,P[2].x+rz*sw*1.6);
  eu.set(pitch.x-Math.abs(sw)*.02,yaw.x,roll.x);cam.quaternion.setFromEuler(eu);
  cam.updateMatrixWorld();
  CH.forEach(C=>{const d=C.dist=cam.position.distanceTo(C.c);const m=C.m=sm(C.stand+24,C.stand+2,d),g=(1+1.3*sm(150,C.stand+20,d))*(1-.25*m),ly=8.2+m*(C.gh/2-1.6-8.2+2.6);
    C.lab.scale.set(5*g,1*g,1);C.lab.material.opacity=.55+.45*sm(160,60,d);C.lab.position.y=ly;
    C.inf.material.opacity=sm(C.stand+75,C.stand+35,d);C.inf.scale.set(4.4*g,.44*g,1);C.inf.position.y=ly-1.15*g;
    C.lines.material.opacity=.35*(1-m);C.st.forEach(s=>{s.material.opacity=1-m;const k=s.userData.k*(1+(RM?0:.15*Math.sin(now/700+s.id)));s.scale.set(k,k,1)});
    const bo=Math.max(Math.min(1,m*1.4),.45*sm(C.stand+140,C.stand+40,d));C.bd.visible=bo>.01;C.bd.material.opacity=bo;const bs=.4+.6*m;C.bd.scale.set(bs,bs,1);
    C.sc+=(C.scT-C.sc)*Math.min(1,dt*12);C.BT.t.offset.y=1-BWIN/C.BT.H-C.sc/C.BT.H;
    C.lab.visible=C.inf.visible=m<.6;
    q.copy(cam.quaternion);C.cards.forEach((c,j)=>{c.visible=false;if(!c.visible)return;tmp.copy(c.userData.grid).applyQuaternion(q);
      c.position.lerpVectors(c.userData.star,tmp,m);const s=.15+.85*m;c.scale.set(s,s,s);c.quaternion.copy(q);c.material.opacity=Math.min(1,m*1.4)})});
  ON=LV==='board'&&CH[LI].m>.6?CH[LI]:null;
  R.render(scene,cam);
  if(REC)REC.push([Math.round(now),+yaw.x.toFixed(5),+pitch.x.toFixed(5),+roll.x.toFixed(5),+P[2].x.toFixed(3),!!drag])}
window.__s3={st:()=>({yaw:yaw.x,yawT:yaw.t,pitch:pitch.x,roll:roll.x,pos:P.map(s=>s.x),posT:P.map(s=>s.t),fps:fps,drag:!!drag,on:ON&&ON.d.k,lv:LV,li:LI,ch:CH.map(C=>({k:C.d.k,sc:C.sc,dist:+C.dist.toFixed(1),m:+C.m.toFixed(3)})),stars:NSTAR,dpr:R.getPixelRatio(),rm:RM}),
  go:(l,i)=>setLv(l,i),out:()=>stepOut(),inn:(x,y)=>stepIn(x,y),rec:on=>{if(on){REC=[]}else{const r=REC;REC=null;return r}},log:LOG,screen:k=>{const C=CH.find(c=>c.d.k===k);tmp.copy(C.c).project(cam);return[(tmp.x+1)/2*innerWidth,(1-tmp.y)/2*innerHeight,tmp.z]}};
addEventListener('resize',resize);resize();
Promise.all([fetch('data.json').then(r=>r.json()),document.fonts.load('84px Julius'),document.fonts.load('40px Poppins')]).then(a=>{data=a[0];build();setLv('all');requestAnimationFrame(frame)})
  .catch(e=>{console.warn(e);html.className='nogl'});
