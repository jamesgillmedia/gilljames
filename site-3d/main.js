/* gill james · site 3d · step 1 — Gill's real chapters as boards inside the sketch-3d sky (from sketch 3d-c). three.js r160 vendored. */
import * as THREE from './vendor/three.module.min.js';
const html=document.documentElement;
if(html.className==='nogl')await new Promise(()=>{});
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.getElementById('c'),hint=document.getElementById('hint'),WHERE=document.getElementById('where');
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance'})}catch(e){html.className='nogl';await new Promise(()=>{})}
R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.setClearColor(0x04060c,1);R.localClippingEnabled=true;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x04060c,.0042);
const cam=new THREE.PerspectiveCamera(60,1,.1,900);cam.rotation.order='YXZ';
let tv=.577,th=.577;
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();tv=Math.tan(cam.fov*Math.PI/360);th=tv*cam.aspect;if(CH.length)layoutAll();U.uPx.value=R.getPixelRatio()*h/780}
/* ---------- critically damped springs ---------- */
function S(x,w){return{x:x,v:0,t:x,w:w}}
function sstep(s,dt){const w=s.w,e=s.x-s.t,k=Math.exp(-w*dt),c=s.v+w*e;s.x=s.t+(e+c*dt)*k;s.v=(s.v-w*c*dt)*k}
const W_REL=RM?14:9.5,W_FLY=RM?9:5.6,W_GLIDE=RM?8:4.6,W_SOFT=RM?6:3.2,VMAX=RM?140:85;
const HOME=[0,30,46],HOMEP=-.3;/* see everything: a little above, looking down the line of chapters */
const yaw=S(0,W_REL),pitch=S(HOMEP,W_REL),roll=S(0,11);
const P=[S(HOME[0],W_FLY),S(HOME[1],W_FLY),S(HOME[2],W_FLY)];
/* ---------- stars (as sketch-3d) ---------- */
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
function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const GT=glowTex();
[[-60,30,-200,0x27407a,160],[70,-20,-320,0x4a2a6a,200],[10,-40,-90,0x173c4a,120]].forEach(n=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:n[3],transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  s.position.set(n[0],n[1],n[2]);s.scale.set(n[4],n[4],1);scene.add(s)});
/* ---------- chapters: closer together than sketch-3d (34 apart, small zig-zag) ---------- */
const POS=[[-9,4,-22],[9,-4,-56],[-9,4,-90],[9,-4,-124],[-9,4,-158],[9,-4,-192]];
const CH=[];let data;
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
function ctex(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return t}
function txtTex(lines,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
  lines.forEach(l=>{x.font=l.f;x.fillStyle=l.c||'#e4ebf5';x.textAlign='center';x.textBaseline='middle';if(l.ls)x.letterSpacing=l.ls;x.fillText(l.s,w/2,l.y)});return ctex(c)}
function fit(x,s,f,max){let fs=f;x.font=fs+'px Poppins';while(x.measureText(s).width>max&&fs>14){fs-=2;x.font=fs+'px Poppins'}return fs}
function nameTex(cd){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#e9eff8';x.font=fit(x,cd.t,40,496)+'px Poppins';x.fillText(cd.t,256,42);x.font='28px Poppins';x.fillStyle='rgba(200,214,232,.62)';x.fillText(cd.m||'',256,96);return ctex(c)}
function cardTex(cd,ca){const W=512,H=Math.round(W/ca),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='rgba(8,12,22,.92)';x.fillRect(0,0,W,H);x.strokeStyle='rgba(207,216,230,.28)';x.lineWidth=3;x.strokeRect(1.5,1.5,W-3,H-3);
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#e9eff8';x.font=fit(x,cd.t,52,W-36)+'px Poppins';x.fillText(cd.t,W/2,H/2-22);
  x.font='30px Poppins';x.fillStyle=cd.href||cd.go?'rgba(191,245,223,.8)':'rgba(200,214,232,.62)';x.font=fit(x,cd.m||'',30,W-36)+'px Poppins';x.fillText(cd.m||'',W/2,H/2+34);return ctex(c)}
function headTex(d){const c=document.createElement('canvas');c.width=1024;c.height=176;const x=c.getContext('2d');x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#e4ebf5';x.font='72px Julius';x.letterSpacing='12px';x.fillText(d.nm,512,62);x.letterSpacing='0px';
  x.fillStyle='rgba(200,214,232,.62)';x.font=fit(x,d.ct+(d.sum?' · '+d.sum:''),28,1000)+'px Poppins';x.fillText(d.ct+(d.sum?' · '+d.sum:''),512,128);return ctex(c)}
const BW=12,GAP=.1,PADB=.35,HDH=BW*176/1024;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const LOADER=new THREE.TextureLoader();
function build(){data.forEach((d,i)=>{const g=new THREE.Group(),c=new THREE.Vector3(...POS[i]);g.position.copy(c);scene.add(g);
  const cards=d.cards,n=Math.min(12,Math.max(5,cards.length)),rnd=mulberry(i*97+5),st=[];
  for(let j=0;j<n;j++){const a=j/n*6.283+rnd()*.7,r=3+rnd()*4.2;st.push(new THREE.Vector3(Math.cos(a)*r*1.25,Math.sin(a)*r*.8,(rnd()-.5)*3))}
  const sms=[];st.forEach((p,j)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:0xdfe9ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    s.position.copy(p);const k=j===0?2.6:1.5+rnd();s.scale.set(k,k,1);s.userData.k=k;g.add(s);sms.push(s)});
  const lp=[];for(let j=0;j<n;j++){lp.push(st[j],st[(j+1)%n]);if(j%3===0)lp.push(st[j],st[(j+2)%n])}
  const lines=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp),new THREE.LineBasicMaterial({color:0x8fb0e0,transparent:true,opacity:.35,depthWrite:false}));g.add(lines);
  const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{s:d.nm,f:'84px Julius',y:64,ls:'14px'}],640,128),transparent:true,depthWrite:false}));lab.position.set(0,8.2,0);g.add(lab);
  const inf=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{s:d.ct,f:'40px Poppins',y:32,c:'rgba(214,226,242,.9)'}],640,64),transparent:true,depthWrite:false,opacity:0}));inf.position.set(0,5.6,0);g.add(inf);
  /* the board: a flat window in the sky; its content scrolls inside it (clipped), the sky stays visible around it */
  const CP=[new THREE.Plane(new THREE.Vector3(0,-1,0),0),new THREE.Plane(new THREE.Vector3(0,1,0),0)];
  const B=new THREE.Group();g.add(B);B.visible=false;
  const frame=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x080c16,transparent:true,opacity:.86,depthWrite:false}));frame.renderOrder=1;B.add(frame);
  const edge=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.5,-.5,0),new THREE.Vector3(.5,-.5,0),new THREE.Vector3(.5,.5,0),new THREE.Vector3(-.5,.5,0)]),new THREE.LineBasicMaterial({color:0xcfd8e6,transparent:true,opacity:.28,depthWrite:false}));edge.position.z=.01;B.add(edge);
  const inner=new THREE.Group();inner.position.z=.02;B.add(inner);
  const mat=(o)=>new THREE.MeshBasicMaterial(Object.assign({transparent:true,depthWrite:false,clippingPlanes:CP},o));
  const head=new THREE.Mesh(new THREE.PlaneGeometry(BW,HDH),mat({map:headTex(d)}));head.renderOrder=2;head.position.set(0,-HDH/2,0);inner.add(head);
  const cols=d.cols,tw=(BW-2*PADB-GAP*(cols-1))/cols,tht=tw/d.ca,nh=tw*.25,rowH=tht+nh+GAP;
  const tiles=[],names=[];
  cards.forEach((cd,j)=>{const col=j%cols,row=Math.floor(j/cols),x=-BW/2+PADB+tw/2+col*(tw+GAP),y=-HDH-tht/2-row*rowH;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(tw,tht),mat(cd.src?{color:0x141c2c}:{map:cardTex(cd,d.ca)}));m.position.set(x,y,0);m.renderOrder=2;m.userData={cd:cd,C:null,w:tw,h:tht};inner.add(m);tiles.push(m);
    if(cd.src){const nm=new THREE.Mesh(new THREE.PlaneGeometry(tw,nh),mat({map:nameTex(cd),opacity:0}));nm.position.set(x,y-tht/2-nh/2,0);nm.renderOrder=2;inner.add(nm);names.push(nm)}});
  const contentH=HDH+Math.ceil(cards.length/cols)*rowH+PADB;
  const C={d:d,i:i,g:g,c:c,st:sms,lines:lines,lab:lab,inf:inf,B:B,frame:frame,edge:edge,inner:inner,CP:CP,tiles:tiles,names:names,tw:tw,tht:tht,contentH:contentH,winH:contentH,
    m:0,dist:1e9,stand:20,dock:0,sc:0,scT:0,loaded:false,vids:[]};tiles.forEach(t=>t.userData.C=C);CH.push(C)});layoutAll()}
/* stand-off so the board's width fits the screen (portrait-aware); window height = what fits, content scrolls inside */
function layoutAll(){CH.forEach(C=>{C.stand=Math.max(6,BW*1.1/2/th);C.dock=C.c.z+C.stand;const visH=2*C.stand*tv;C.winH=Math.min(C.contentH,visH*.8);
  C.frame.scale.set(BW+.3,C.winH+.3,1);C.edge.scale.set(BW+.3,C.winH+.3,1);C.scT=Math.min(C.scT,maxSc(C))})}
function maxSc(C){return Math.max(0,C.contentH-C.winH)}
/* lazy media: thumbnails when a chapter comes near; clips (moving tiles) only while landed */
function loadImgs(C){if(C.loaded)return;C.loaded=true;C.tiles.forEach(t=>{const cd=t.userData.cd;if(!cd.src)return;
  LOADER.load(cd.src,tx=>{tx.colorSpace=THREE.SRGBColorSpace;cover(tx,tx.image.width/tx.image.height,C.d.ca);t.userData.img=tx;if(!t.userData.vt)t.material.map=tx;t.material.color.set(0xffffff);t.material.needsUpdate=true;log('img',cd.src)},undefined,()=>log('imgfail',cd.src))})}
function cover(tx,ia,ca){if(ia>ca){tx.repeat.set(ca/ia,1);tx.offset.set((1-ca/ia)/2,0)}else{tx.repeat.set(1,ia/ca);tx.offset.set(0,(1-ia/ca)/2)}}
function clipOn(t){const cd=t.userData.cd;if(!cd.clip)return;let v=t.userData.v;
  if(!v){v=document.createElement('video');v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.src=cd.clip;t.userData.v=v;
    v.addEventListener('playing',()=>{if(t.userData.vt)return;const vt=new THREE.VideoTexture(v);vt.colorSpace=THREE.SRGBColorSpace;cover(vt,(v.videoWidth||16)/(v.videoHeight||9),t.userData.C.d.ca);t.userData.vt=vt;t.material.map=vt;t.material.color.set(0xffffff);t.material.needsUpdate=true;log('clip',cd.clip)})}
  if(v.paused){const p=v.play();if(p&&p.catch)p.catch(()=>{})}}
function clipOff(t){const v=t.userData.v;if(v&&!v.paused)v.pause()}
/* ---------- camera ---------- */
const fwd=new THREE.Vector3(),tmp=new THREE.Vector3(),tmp2=new THREE.Vector3(),q=new THREE.Quaternion(),eu=new THREE.Euler(0,0,0,'YXZ');
function forward(y,p){return fwd.set(-Math.sin(y)*Math.cos(p),Math.sin(p),-Math.cos(y)*Math.cos(p))}
function clampP(v){v[0]=Math.max(-70,Math.min(70,v[0]));v[1]=Math.max(-50,Math.min(50,v[1]));v[2]=Math.max(-240,Math.min(48,v[2]));return v}
let VLIM=VMAX,GLIDE=false,SETTLED=true;function setPT(v,w){clampP(v);VLIM=w===W_GLIDE?VMAX*1.7:VMAX;P.forEach((s,i)=>{s.t=v[i];s.w=w})}
function face(w){let ty=Math.round(yaw.x/6.283)*6.283;yaw.t=ty;pitch.t=0;yaw.w=pitch.w=w}
function glideTo(C){setPT([C.c.x,C.c.y,C.dock],W_GLIDE);face(W_GLIDE);GLIDE=true;SETTLED=true;log('glide',C.d.k)}
function goHome(){closeV();setPT(HOME.slice(),W_GLIDE);face(W_GLIDE);pitch.t=HOMEP;GLIDE=true;SETTLED=true;log('home')}
function pullBack(){if(ON){setPT([ON.c.x,ON.c.y,ON.dock+26],W_GLIDE);face(W_GLIDE);GLIDE=true;log('pullback',ON.d.k);return}
  const f=forward(yaw.x,pitch.x);setPT([P[0].x-f.x*55,P[1].x-f.y*55,P[2].x-f.z*55],W_GLIDE);pitch.t=pitch.x*.4;pitch.w=W_GLIDE;GLIDE=true;log('pullback')}
/* the next board ahead of a z (or the one you are docked at) */
function ahead(z){let b=null;CH.forEach(C=>{const dz=z-C.dock;if(dz>-.6&&(!b||dz<z-b.dock))b=C});return b}
/* free fly-through with a SOFT lock: speed eases as you near a board's dock and you settle on it; a new gesture from the dock keeps flying through */
let G={t:0,fromDock:null};
function gesture(){const now=performance.now();if(now-G.t>260){G.fromDock=null;CH.forEach(C=>{if(Math.abs(P[2].t-C.dock)<1.5&&Math.hypot(P[0].t-C.c.x,P[1].t-C.c.y)<3)G.fromDock=C})}G.t=now;GLIDE=false;SETTLED=false}
function fly(a){const f=forward(yaw.t,pitch.t),t=[P[0].t,P[1].t,P[2].t];
  if(a>0){const N=ahead(t[2]);if(N&&N!==G.fromDock){const dz=t[2]-N.dock,fz=Math.max(.2,-f.z);if(dz>0){a*=.3+.7*sm(0,12,dz);const reach=dz/fz;if(a>reach)a=reach+(a-reach)*.15}}}
  if(a<0){/* pulling out: a straight, free line back to the view of everything */const r=Math.min(1,-a/Math.max(1e-3,HOME[2]-t[2]-a));t[0]+=(HOME[0]-t[0])*r;t[1]+=(HOME[1]-t[1])*r;t[2]+=(HOME[2]-t[2])*r;pitch.t+=(HOMEP-pitch.t)*r;pitch.w=W_FLY;setPT(t,W_FLY);return}
  t[0]+=f.x*a;t[1]+=f.y*a;t[2]+=f.z*a;pitch.t*=1-Math.min(1,a/25);pitch.w=W_FLY;
  if(a>0){const N=ahead(t[2]);if(N){const s=sm(N.stand+40,N.stand*.5,t[2]-N.c.z)*.35;t[0]+=(N.c.x-t[0])*s;t[1]+=(N.c.y-t[1])*s}}
  setPT(t,W_FLY)}
/* zoom at a screen point: on a landed board it goes toward the point under your fingers (into an item); off the board it is free flight */
const ray=new THREE.Raycaster(),v2=new THREE.Vector2();
function rayAt(x,y){v2.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(v2,cam);return ray}
function boardPoint(C,x,y){const r=rayAt(x,y),pl=new THREE.Plane(new THREE.Vector3(0,0,1),-C.c.z),p=new THREE.Vector3();if(!r.ray.intersectPlane(pl,p))return null;
  const hw=(BW+.3)/2,hh=(C.winH+.3)/2;if(Math.abs(p.x-C.c.x)>hw||Math.abs(p.y-C.c.y)>hh)return null;return p}
function itemAt(C,x,y){const r=rayAt(x,y),h=r.intersectObjects(C.tiles)[0];if(!h)return null;if(Math.abs(h.point.y-C.c.y)>C.winH/2)return null;return h.object}
function openDist(t){return Math.max(t.userData.w/(2*th*.8),t.userData.h/(2*tv*.8))}
let FOCUS=null;
function zoomAt(x,y,k){seen();gesture();if(!VW.hidden){if(k<0)closeV();return}
  const C=ON;
  if(C){const dz=P[2].t-C.c.z,p=boardPoint(C,x,y);
    if(k>0&&p){const it=itemAt(C,x,y);let nd=dz*Math.exp(-k*1.1);const mn=it?openDist(it):1.2;FOCUS=it;
      if(nd<=mn*1.04){nd=mn;if(it){zoomTo(p,dz,nd);openV(it.userData.cd,it);return}}zoomTo(p,dz,nd);return}
    if(k<0&&dz<C.stand-.4){const pp=p||new THREE.Vector3(C.c.x,C.c.y,C.c.z);let nd=dz*Math.exp(-k*1.1);if(nd>=C.stand){setPT([C.c.x,C.c.y,C.dock],W_FLY);face(W_FLY);return}zoomTo(pp,dz,nd);return}}
  fly(Math.max(-14,Math.min(14,k*60)))}
function zoomTo(p,dz,nd){const t=[P[0].t,P[1].t,P[2].t],s=1-nd/dz;t[0]+=(p.x-t[0])*s;t[1]+=(p.y-t[1])*s;t[2]+=(p.z-t[2])*s;
  if(ON){const lim=BW/2;t[0]=Math.max(ON.c.x-lim,Math.min(ON.c.x+lim,t[0]));t[1]=Math.max(ON.c.y-ON.winH/2,Math.min(ON.c.y+ON.winH/2,t[1]))}setPT(t,W_FLY)}
/* ---------- input ---------- */
let ON=null;const VW=document.getElementById('vw'),HOMEB=document.getElementById('home');
function scroll(C,dy){C.scT=Math.max(0,Math.min(maxSc(C),C.scT+dy))}
const PT=new Map();let drag=null,pinch=null,lastTap=0,tapTimer=0,lastIn=performance.now(),velY=0,velP=0,lastMv=0;
const F=()=>innerHeight/2/Math.tan(cam.fov*Math.PI/360);
function seen(){lastIn=performance.now();hint.style.opacity=0}
cv.addEventListener('pointerdown',e=>{e.preventDefault();seen();try{cv.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:performance.now()});
  if(PT.size===1){drag={id:e.pointerId,moved:0};yaw.t=yaw.x;pitch.t=pitch.x;yaw.v=pitch.v=0;velY=velP=0;lastMv=performance.now();yaw.w=pitch.w=W_REL}
  else if(PT.size===2){drag=null;const a=[...PT.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}}});
cv.addEventListener('pointermove',e=>{const p=PT.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x;let dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(pinch&&PT.size>=2){const a=[...PT.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch.d>0&&d>0){zoomAt((a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2,Math.max(-.25,Math.min(.25,Math.log(d/pinch.d))))}pinch.d=d;return}
  if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<6)return;seen();
    if(ON){/* landed: the board only scrolls (no orbit); zoomed in, you can also slide sideways */const wpp=2*Math.max(.5,P[2].x-ON.c.z)*tv/innerHeight;scroll(ON,-dy*wpp);
      if(P[2].t-ON.c.z<ON.stand*.9){P[0].t=Math.max(ON.c.x-BW/2,Math.min(ON.c.x+BW/2,P[0].t-dx*wpp));P[0].x=P[0].t;P[0].v=0}SETTLED=true;return}
    const f=F(),now=performance.now(),dt=Math.max(1,now-lastMv)/1000;lastMv=now;
    const ay=dx/f,ap=dy/f;yaw.x+=ay;yaw.t=yaw.x;pitch.x=Math.max(-.7,Math.min(.7,pitch.x+ap));pitch.t=pitch.x;
    const k=dt<.08?.35:1;velY=velY*(1-k)+ay/dt*k;velP=velP*(1-k)+ap/dt*k;yaw.v=velY;pitch.v=0}});
function up(e){const p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
  if(pinch){if(PT.size<2)pinch=null;if(PT.size===1){const id=[...PT.keys()][0];drag={id:id,moved:99};lastMv=performance.now();velY=velP=0}return}
  if(!drag||drag.id!==e.pointerId)return;const now=performance.now(),dur=now-p.t0;
  if(drag.moved<10&&dur<350){drag=null;tap(e.clientX,e.clientY,now);return}
  if(ON){drag=null;return}
  let vy=now-lastMv>110?0:velY,vp=now-lastMv>110?0:velP;const cap=.9*W_REL;vy=Math.max(-cap,Math.min(cap,vy));vp=Math.max(-cap,Math.min(cap,vp));
  yaw.w=pitch.w=W_REL;yaw.v=vy;yaw.t=yaw.x+vy/W_REL;pitch.v=vp;pitch.t=Math.max(-.7,Math.min(.7,pitch.x+vp/W_REL));if(pitch.t!==pitch.x+vp/W_REL)pitch.v=-W_REL*(pitch.x-pitch.t);
  drag=null}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
['touchstart','touchmove','gesturestart','gesturechange'].forEach(t=>cv.addEventListener(t,e=>e.preventDefault(),{passive:false}));
cv.addEventListener('wheel',e=>{e.preventDefault();seen();let dy=e.deltaY*(e.deltaMode===1?16:1);
  if(ON&&!e.ctrlKey&&maxSc(ON)>0&&boardPoint(ON,e.clientX,e.clientY)){const wpp=2*Math.max(.5,P[2].x-ON.c.z)*tv/innerHeight;scroll(ON,dy*wpp);return}
  const a=e.ctrlKey?-dy*.5:-dy*.07;zoomAt(e.clientX,e.clientY,Math.max(-16,Math.min(16,a))/60)},{passive:false});
cv.addEventListener('dblclick',e=>e.preventDefault());
function pick(x,y){let best=null,bd=80;CH.forEach(C=>{tmp.copy(C.c).project(cam);if(tmp.z>1)return;const sx=(tmp.x+1)/2*innerWidth,sy=(1-tmp.y)/2*innerHeight,d=Math.hypot(sx-x,sy-y)*(C.dist<60?.6:1);
  if(d<bd+Math.min(120,1600/Math.max(1,C.dist))){bd=d;best=C}});return best}
function tap(x,y,now){if(now-lastTap<360){clearTimeout(tapTimer);lastTap=0;pullBack();return}lastTap=now;
  tapTimer=setTimeout(()=>{if(ON&&boardPoint(ON,x,y)){const it=itemAt(ON,x,y);if(it)openV(it.userData.cd,it);return}const C=pick(x,y);if(C)glideTo(C)},RM?220:300)}
function openV(cd,t){if(cd.go){const C=CH.find(c=>c.d.k===cd.go);if(C)glideTo(C);return}
  const M=VW.querySelector('.m'),L=VW.querySelector('.l');M.innerHTML='';
  if(cd.v){const v=document.createElement('video');v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('playsinline','');v.controls=true;v.src=cd.v;
    const tv0=t&&t.userData.v;if(tv0&&tv0.currentTime)v.addEventListener('loadedmetadata',()=>{try{v.currentTime=tv0.currentTime%(v.duration||1e9)}catch(e){}},{once:true});M.appendChild(v);const p=v.play();if(p&&p.catch)p.catch(()=>{})}
  else if(cd.big||cd.src){const im=document.createElement('img');im.alt=cd.t||'';im.src=cd.big||cd.src;M.appendChild(im)}
  else if(cd.body){const p=document.createElement('p');p.textContent=cd.body;M.appendChild(p)}
  VW.querySelector('.c').textContent=cd.t+(cd.m?' · '+cd.m:'');
  const href=cd.url||cd.href;L.hidden=!href;if(href){L.href=href;L.textContent=cd.lk||'watch the film ↗';if(/^\.\.\//.test(href)||/^mailto:/.test(href))L.removeAttribute('target');else L.target='_blank'}
  VW.hidden=false;log('view',cd.t)}
function closeV(){if(VW.hidden)return;VW.hidden=true;VW.querySelector('.m').innerHTML='';
  /* back out of the work: you land on the board again, its clip still moving in its tile */
  if(ON){setPT([ON.c.x,ON.c.y,ON.dock],W_GLIDE);face(W_GLIDE);GLIDE=true}log('close')}
VW.querySelector('.x').addEventListener('click',closeV);
let vp0=0;VW.addEventListener('touchstart',e=>{if(e.touches.length===2)vp0=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{passive:true});
VW.addEventListener('touchmove',e=>{if(e.touches.length===2&&vp0){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(d<vp0*.75){vp0=0;closeV()}}},{passive:false});
VW.addEventListener('wheel',e=>{if(e.deltaY>0&&(e.ctrlKey||!e.target.closest('p'))){e.preventDefault();closeV()}},{passive:false});
HOMEB.addEventListener('click',goHome);
addEventListener('keydown',e=>{if(e.key==='Escape'){if(!VW.hidden)closeV();else pullBack()}else if(e.key==='Home')goHome();
  else if(e.key==='+'||e.key==='=')zoomAt(innerWidth/2,innerHeight/2,.15);else if(e.key==='-')zoomAt(innerWidth/2,innerHeight/2,-.15);
  else if(ON&&(e.key==='ArrowDown'||e.key==='ArrowUp'))scroll(ON,(e.key==='ArrowDown'?1:-1)*ON.tht)});
/* ---------- loop ---------- */
const LOG=[];function log(k,v){LOG.push([Math.round(performance.now()),k,v]);if(LOG.length>300)LOG.shift()}
let last=performance.now(),fc=0,ft=last,fps=0,whereTxt='';
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;fc++;if(now-ft>=1000){fps=fc*1000/(now-ft);fc=0;ft=now}
  U.uT.value=now/1000;upMap();
  if(!drag&&!pinch&&!RM&&!ON&&now-lastIn>3500&&Math.abs(yaw.x-yaw.t)<1e-3){yaw.t+=.012*dt;yaw.x+=.012*dt}
  /* soft settle: when a gesture ends near a board's dock, ease onto it (never a hard stop; any new gesture takes over) */
  if(!SETTLED&&!PT.size&&now-G.t>220&&VW.hidden){SETTLED=true;const z=P[2].t;CH.forEach(C=>{const dz=z-C.dock,lat=Math.hypot(P[0].t-C.c.x,P[1].t-C.c.y);
    if(dz>-C.stand*.12&&dz<10&&lat<7){setPT([C.c.x,C.c.y,C.dock],W_SOFT);face(W_SOFT);log('settle',C.d.k)}})}
  if(!drag){sstep(yaw,dt);sstep(pitch,dt)}
  const px=P.map(s=>s.x);P.forEach(s=>sstep(s,dt));
  const mv=Math.hypot(P[0].x-px[0],P[1].x-px[1],P[2].x-px[2]),lim=VLIM*dt;if(mv>lim){const k=lim/mv;P.forEach((s,i)=>{s.x=px[i]+(s.x-px[i])*k;s.v=(s.x-px[i])/dt})}
  roll.t=Math.max(-.14,Math.min(.14,-yaw.v*.16));sstep(roll,dt);
  const sw=Math.max(-1,Math.min(1,yaw.v*.6));
  forward(yaw.x,pitch.x);const rx=Math.cos(yaw.x),rz=-Math.sin(yaw.x);
  cam.position.set(P[0].x+rx*sw*1.6,P[1].x-Math.abs(sw)*.7,P[2].x+rz*sw*1.6);
  eu.set(pitch.x-Math.abs(sw)*.02,yaw.x,roll.x);cam.quaternion.setFromEuler(eu);cam.updateMatrixWorld();
  CH.forEach(C=>{const d=C.dist=cam.position.distanceTo(C.c),dz=cam.position.z-C.c.z,lat=Math.hypot(cam.position.x-C.c.x,cam.position.y-C.c.y);
    const m=C.m=sm(C.stand+22,C.stand+2,dz)*sm(.05,.3,dz)*sm(14,6,lat),g=(1+1.3*sm(150,C.stand+20,d))*(1-.25*m),ly=8.2+m*(C.winH/2+1.2-8.2);
    if(d<C.stand+70)loadImgs(C);
    C.lab.scale.set(5*g,1*g,1);C.lab.material.opacity=.55+.45*sm(160,60,d);C.lab.position.y=ly;
    C.inf.material.opacity=sm(C.stand+75,C.stand+35,d);C.inf.scale.set(4.4*g,.44*g,1);C.inf.position.y=ly-1.15*g;
    C.lines.material.opacity=.35*(1-m);C.st.forEach(s=>{s.material.opacity=1-m;const k=s.userData.k*(1+(RM?0:.15*Math.sin(now/700+s.id)));s.scale.set(k,k,1)});
    C.lab.visible=C.inf.visible=m<.6;
    const vis=m>.01;C.B.visible=vis;
    if(vis){const bs=.4+.6*m,op=Math.min(1,m*1.4);C.B.scale.set(bs,bs,1);C.frame.material.opacity=.86*op;C.edge.material.opacity=.28*op;
      C.sc+=(C.scT-C.sc)*Math.min(1,dt*12);C.inner.position.y=C.winH/2+C.sc;
      C.CP[0].constant=C.c.y+bs*C.winH/2;C.CP[1].constant=-(C.c.y-bs*C.winH/2);
      /* image first; the name only once you are close enough to read it */
      const px=C.tw*bs/(2*Math.max(.3,dz)*th)*innerWidth,na=op*sm(64,120,px);
      C.inner.children.forEach(o=>o.material.opacity=op);
      C.names.forEach(n=>n.material.opacity=na)}
    /* moving tiles only while landed, only those inside the window, at most 16 */
    const landed=m>.6;if(landed){let n=0;C.tiles.forEach(t=>{if(!t.userData.cd.clip)return;const y=t.position.y+C.winH/2+C.sc;const inWin=Math.abs(y)<C.winH/2+C.tht/2;if(inWin&&n<16){n++;clipOn(t)}else clipOff(t)})}
    else if(C.vidOn)C.tiles.forEach(clipOff);C.vidOn=landed});
  let on=null;CH.forEach(C=>{if(C.m>.85&&(!on||C.dist<on.dist))on=C});if(on!==ON){ON=on;log('board',ON&&ON.d.k)}
  if(GLIDE&&Math.hypot(P[0].x-P[0].t,P[1].x-P[1].t,P[2].x-P[2].t)<.05)GLIDE=false;
  /* where am I */
  let w='open sky';if(ON)w=ON.d.nm;else{const N=ahead(cam.position.z);if(N&&cam.position.z-N.dock<45&&N.m<.85)w='→ '+N.d.nm;if(cam.position.z>HOME[2]-8)w='everything'}
  if(w!==whereTxt){whereTxt=w;WHERE.textContent=w}
  R.render(scene,cam)}
window.__s3={st:()=>({yaw:yaw.x,pitch:pitch.x,pos:P.map(s=>s.x),posT:P.map(s=>s.t),fps:fps,on:ON&&ON.d.k,where:whereTxt,view:!VW.hidden,
    ch:CH.map(C=>({k:C.d.k,sc:+C.sc.toFixed(2),max:+maxSc(C).toFixed(2),dist:+C.dist.toFixed(1),m:+C.m.toFixed(3),stand:+C.stand.toFixed(2),imgs:C.tiles.filter(t=>t.userData.img).length,clips:C.tiles.filter(t=>t.userData.vt).length,playing:C.tiles.filter(t=>t.userData.v&&!t.userData.v.paused).length})),stars:NSTAR}),
  log:LOG,glide:k=>glideTo(CH.find(c=>c.d.k===k)),home:goHome,zoom:(x,y,k)=>zoomAt(x,y,k),
  item:(k,j)=>{const C=CH.find(c=>c.d.k===k),t=C.tiles[j];tmp.copy(t.position);t.localToWorld(tmp.set(0,0,0));tmp.project(cam);return[(tmp.x+1)/2*innerWidth,(1-tmp.y)/2*innerHeight]},
  screen:k=>{const C=CH.find(c=>c.d.k===k);tmp.copy(C.c).project(cam);return[(tmp.x+1)/2*innerWidth,(1-tmp.y)/2*innerHeight,tmp.z]}};
addEventListener('resize',resize);resize();
Promise.all([fetch('data.json').then(r=>r.json()),document.fonts.load('84px Julius'),document.fonts.load('40px Poppins')]).then(a=>{data=a[0];build();requestAnimationFrame(frame)})
  .catch(e=>{console.warn(e);html.className='nogl'});
/* ---------- mini map: a dot per chapter, mint you; tap a dot to glide there ---------- */
const MPS=document.createElement('style');MPS.textContent='#mm{position:fixed;right:14px;bottom:max(14px,env(safe-area-inset-bottom));width:84px;height:84px;border-radius:50%;border:1px solid rgba(143,245,210,.25);background:rgba(4,7,11,.6);z-index:20}#mm i{position:absolute;width:10px;height:10px;margin:-5px;border-radius:50%;background:#56707a;cursor:pointer}#mm i.on{background:#cfd8e6}#mm b{position:absolute;width:7px;height:7px;margin:-3.5px;border-radius:50%;background:#8ff5d2;box-shadow:0 0 8px #8ff5d2;pointer-events:none}';
document.head.appendChild(MPS);const MM=document.createElement('div');MM.id='mm';MM.setAttribute('aria-label','map');document.body.appendChild(MM);
let MMb=null,MMs=1,MMcx=0,MMcz=0;
function mmXY(x,z){return[42+(x-MMcx)*MMs,42+(z-MMcz)*MMs]}
function upMap(){if(!MMb){if(!CH.length)return;const xs=CH.map(C=>C.c.x*1.5),zs=CH.map(C=>C.c.z);
  MMcx=(Math.min(...xs)+Math.max(...xs))/2;MMcz=(Math.min(...zs)+Math.max(...zs))/2;
  MMs=32/Math.max(1,(Math.max(...xs)-Math.min(...xs))/2,(Math.max(...zs)-Math.min(...zs))/2);
  CH.forEach(C=>{const d=document.createElement('i'),[l,t]=mmXY(C.c.x*1.5,C.c.z);d.style.left=l+'px';d.style.top=t+'px';d.title=C.d.nm;d.setAttribute('aria-label',C.d.nm);d.dataset.k=C.d.k;C.dot=d;
    d.addEventListener('pointerdown',e=>e.stopPropagation());d.addEventListener('click',e=>{e.stopPropagation();closeV();glideTo(C)});MM.appendChild(d)});
  MMb=document.createElement('b');MM.appendChild(MMb)}
  CH.forEach(C=>C.dot.classList.toggle('on',C===ON));
  let[l,t]=mmXY(P[0].x*1.5,P[2].x);const dx=l-42,dy=t-42,r=Math.hypot(dx,dy);if(r>38){l=42+dx*38/r;t=42+dy*38/r}
  MMb.style.left=l+'px';MMb.style.top=t+'px'}
