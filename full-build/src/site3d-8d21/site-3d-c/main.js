/* gill james · the world, option C (Pack 1117) · the motion test. Built from the film room's own script (site-3d/main.js): the same sky,
   boards, springs and viewer. What is new is where the rooms sit (one plane: the sky, which is also the map) and how you move (levels). */
import * as THREE from '../site-3d/vendor/three.module.min.js';
const html=document.documentElement;
if(html.className==='nogl')await new Promise(()=>{});
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.getElementById('c'),hint=document.getElementById('hint'),WHERE=document.getElementById('where');
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance'})}catch(e){html.className='nogl';await new Promise(()=>{})}
R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.setClearColor(0x04060c,1);R.localClippingEnabled=true;
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x04060c,.0042);
const cam=new THREE.PerspectiveCamera(60,1,.1,900);cam.rotation.order='YXZ';
let tv=.577,th=.577;
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();tv=Math.tan(cam.fov*Math.PI/360);th=tv*cam.aspect;if(CH.length){layoutAll();NAV.place();NAV.go(NAV.state().lv>=2?2:NAV.state().lv,ON)}U.uPx.value=R.getPixelRatio()*h/780}
/* ---------- critically damped springs ---------- */
function S(x,w){return{x:x,v:0,t:x,w:w}}
function sstep(s,dt){const w=s.w,e=s.x-s.t,k=Math.exp(-w*dt),c=s.v+w*e;s.x=s.t+(e+c*dt)*k;s.v=(s.v-w*c*dt)*k}
const W_REL=RM?14:9.5,W_FLY=RM?9:5.6,W_GLIDE=RM?8:4.6,W_SOFT=RM?6:3.2,VMAX=RM?140:85;
/* option C: the rooms sit on one plane at z=ZP, centred CY above the ground. Two poses face it: under the sky (level, far back) and over
   the map (risen, looking down along it, so its top edge is nearer and wider). NAV.place() sets both for the screen. */
const ZP=-60,CY=16,SKYP=[0,2,ZP+118],SKYPITCH=0,MAPP=[0,CY+52,ZP+64],MAPPITCH=-.675;
const HOME=SKYP,HOMEP=SKYPITCH;
const yaw=S(0,W_REL),pitch=S(HOMEP,W_REL),roll=S(0,11);
const P=[S(HOME[0],W_FLY),S(HOME[1],W_FLY),S(HOME[2],W_FLY)];
/* ---------- stars (as sketch-3d) ---------- */
const U={uT:{value:0},uTw:{value:RM?0:1},uPx:{value:1},uRed:{value:0},uInk:{value:new THREE.Vector3(1,.267,.341)}};   /* uRed, uInk: safelight (below) */
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
    fragmentShader:`uniform float uRed;uniform vec3 uInk;varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);a*=a;vec3 c=mix(vC,uInk*dot(vC,vec3(.3,.5,.2)),uRed);gl_FragColor=vec4(c*a*vA,1.);}`});
  return new THREE.Points(g,m)}
const NSTAR=innerWidth<700?2600:4200;scene.add(starField(NSTAR));
function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const GT=glowTex();
const NEB=[];[[-60,30,-200,0x27407a,160],[70,-20,-320,0x4a2a6a,200],[10,-40,-90,0x173c4a,120]].forEach(n=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:n[3],transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  s.position.set(n[0],n[1],n[2]);s.scale.set(n[4],n[4],1);s.userData.c=n[3];NEB.push(s);scene.add(s)});
/* ---------- the rooms on the plane, placed as on Gill's option sheet: about above, film and photo either side, sound and objects below ---------- */
const LAY={about:[-14,27],film:[-19,7],photo:[19,10],sound:[-12,-16],objects:[15,-20]};
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
function build(){data.forEach((d,i)=>{const g=new THREE.Group(),c=new THREE.Vector3(LAY[d.k][0],CY+LAY[d.k][1],ZP);g.position.copy(c);scene.add(g);
  const cards=d.cards,rnd=mulberry(i*97+5),st=[],GL=GLY[d.k],GS=.27,gp=(x,y,z)=>new THREE.Vector3((x-36)*GS,-(y-18)*GS,z);
  GL.pts.forEach(q=>st.push(gp(q[0],q[1],(rnd()-.5)*1.2)));const n=st.length;
  const sms=[];st.forEach((p,j)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:0xdfe9ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    s.position.copy(p);const k=.8+GL.pts[j][2]*.62;s.scale.set(k,k,1);s.userData.k=k;g.add(s);sms.push(s)});
  const lp=[];GL.seg.forEach(q=>lp.push(gp(q[0],q[1],0),gp(q[2],q[3],0)));
  const lines=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp),new THREE.LineBasicMaterial({color:0x8fb0e0,transparent:true,opacity:.35,depthWrite:false}));g.add(lines);
  const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{s:d.nm,f:'84px Julius',y:64,ls:'14px'}],640,128),transparent:true,depthWrite:false}));lab.position.set(0,-7.6,0);g.add(lab);
  const inf=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{s:d.ct,f:'40px Poppins',y:32,c:'rgba(214,226,242,.9)'}],640,64),transparent:true,depthWrite:false,opacity:0}));inf.position.set(0,-9.8,0);g.add(inf);
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
function clampP(v){v[0]=Math.max(-70,Math.min(70,v[0]));v[1]=Math.max(-50,Math.min(110,v[1]));v[2]=Math.max(-240,Math.min(96,v[2]));return v}
let VLIM=VMAX,GLIDE=false,SETTLED=true;function setPT(v,w){clampP(v);VLIM=w===W_TRACK?VMAX*3.2:w===W_GLIDE?VMAX*1.7:VMAX;P.forEach((s,i)=>{s.t=v[i];s.w=w})}
function face(w){let ty=Math.round(yaw.x/6.283)*6.283;yaw.t=ty;pitch.t=0;yaw.w=pitch.w=w}
function glideTo(C){setPT([C.c.x,C.c.y,C.dock],W_GLIDE);face(W_GLIDE);GLIDE=true;SETTLED=true;log('glide',C.d.k)}
function goHome(){NAV.go(0,null)}
function pullBack(){NAV.out()}
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
  const C=NAV.busy()?null:ON;
  if(C){const dz=P[2].t-C.c.z,p=boardPoint(C,x,y);
    if(k>0&&p){const it=itemAt(C,x,y);let nd=dz*Math.exp(-k*1.1);const mn=it?openDist(it):1.2;FOCUS=it;
      if(nd<=mn*1.04){nd=mn;if(it){zoomTo(p,dz,nd);openV(it.userData.cd,it);return}}zoomTo(p,dz,nd);return}
    if(k<0&&dz<C.stand-.4){const pp=p||new THREE.Vector3(C.c.x,C.c.y,C.c.z);let nd=dz*Math.exp(-k*1.1);if(nd>=C.stand){setPT([C.c.x,C.c.y,C.dock],W_FLY);face(W_FLY);return}zoomTo(pp,dz,nd);return}}
  NAV.drive(x,y,k)}
function zoomTo(p,dz,nd){const t=[P[0].t,P[1].t,P[2].t],s=1-nd/dz;t[0]+=(p.x-t[0])*s;t[1]+=(p.y-t[1])*s;t[2]+=(p.z-t[2])*s;
  if(ON){const lim=BW/2;t[0]=Math.max(ON.c.x-lim,Math.min(ON.c.x+lim,t[0]));t[1]=Math.max(ON.c.y-ON.winH/2,Math.min(ON.c.y+ON.winH/2,t[1]))}setPT(t,W_FLY)}
/* ---------- input ---------- */
let ON=null;const VW=document.getElementById('vw');
function scroll(C,dy){C.scT=Math.max(0,Math.min(maxSc(C),C.scT+dy))}
const PT=new Map();let drag=null,pinch=null,lastTap=0,tapTimer=0,lastIn=performance.now(),velY=0,velP=0,lastMv=0;
const F=()=>innerHeight/2/Math.tan(cam.fov*Math.PI/360);
function seen(){lastIn=performance.now();hint.style.opacity=0}
cv.addEventListener('pointerdown',e=>{e.preventDefault();seen();NAV.touch();if(e.isPrimary&&PT.size){PT.clear();pinch=null;drag=null}   /* a first finger starts clean, whatever the last gesture left behind */
  try{cv.setPointerCapture(e.pointerId)}catch(x){}PT.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:performance.now()});
  if(PT.size===1){drag={id:e.pointerId,moved:0};yaw.t=yaw.x;pitch.t=pitch.x;yaw.v=pitch.v=0;velY=velP=0;lastMv=performance.now();yaw.w=pitch.w=W_REL}
  else if(PT.size===2){drag=null;const a=[...PT.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}}});
cv.addEventListener('pointermove',e=>{const p=PT.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x;let dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(pinch&&PT.size>=2){const a=[...PT.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch.d>0&&d>0){zoomAt((a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2,Math.max(-.25,Math.min(.25,Math.log(d/pinch.d))))}pinch.d=d;return}
  if(drag&&drag.id===e.pointerId){drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<6)return;seen();
    if(ON){/* landed: the board only scrolls (no orbit); zoomed in, you can also slide sideways */const wpp=2*Math.max(.5,P[2].x-ON.c.z)*tv/innerHeight;scroll(ON,-dy*wpp);
      if(P[2].t-ON.c.z<ON.stand*.9){P[0].t=Math.max(ON.c.x-BW/2,Math.min(ON.c.x+BW/2,P[0].t-dx*wpp));P[0].x=P[0].t;P[0].v=0}SETTLED=true;return}
    const f=F(),now=performance.now(),dt=Math.max(1,now-lastMv)/1000;lastMv=now;
    if(NAV.busy())return;const ay=dx/f*.6,ap=dy/f*.6,p0=NAV.pitch0();yaw.x=Math.max(-.34,Math.min(.34,yaw.x+ay));yaw.t=yaw.x;pitch.x=Math.max(p0-.2,Math.min(p0+.2,pitch.x+ap));pitch.t=pitch.x;
    const k=dt<.08?.35:1;velY=velY*(1-k)+ay/dt*k;velP=velP*(1-k)+ap/dt*k;yaw.v=velY;pitch.v=0}});
function up(e){const p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);
  if(pinch){if(PT.size<2){pinch=null;NAV.release()}if(PT.size===1){const id=[...PT.keys()][0];drag={id:id,moved:99};lastMv=performance.now();velY=velP=0}return}
  if(!drag||drag.id!==e.pointerId)return;const now=performance.now(),dur=now-p.t0;
  if(drag.moved<10&&dur<350){drag=null;tap(e.clientX,e.clientY,now);return}
  if(ON){drag=null;return}
  yaw.w=pitch.w=W_SOFT;yaw.t=0;pitch.t=NAV.pitch0();yaw.v=pitch.v=0;
  drag=null}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
['touchstart','touchmove','gesturestart','gesturechange'].forEach(t=>cv.addEventListener(t,e=>e.preventDefault(),{passive:false}));
cv.addEventListener('wheel',e=>{e.preventDefault();seen();let dy=e.deltaY*(e.deltaMode===1?16:1);
  if(ON&&!e.ctrlKey&&maxSc(ON)>0&&boardPoint(ON,e.clientX,e.clientY)){const wpp=2*Math.max(.5,P[2].x-ON.c.z)*tv/innerHeight;scroll(ON,dy*wpp);return}
  const a=e.ctrlKey?-dy*.5:-dy*.07;zoomAt(e.clientX,e.clientY,Math.max(-16,Math.min(16,a))/60);NAV.wheel()},{passive:false});
cv.addEventListener('dblclick',e=>e.preventDefault());
function pick(x,y){let best=null,bd=80;CH.forEach(C=>{tmp.copy(C.c).project(cam);if(tmp.z>1)return;const sx=(tmp.x+1)/2*innerWidth,sy=(1-tmp.y)/2*innerHeight,d=Math.hypot(sx-x,sy-y)*(C.dist<60?.6:1);
  if(d<bd+Math.min(120,1600/Math.max(1,C.dist))){bd=d;best=C}});return best}
function tap(x,y,now){if(now-lastTap<360){clearTimeout(tapTimer);lastTap=0;pullBack();return}lastTap=now;
  tapTimer=setTimeout(()=>{if(ON&&boardPoint(ON,x,y)){const it=itemAt(ON,x,y);if(it)openV(it.userData.cd,it);return}const C=pick(x,y);if(C)NAV.toRoom(C)},RM?220:300)}
/* Pack A: films that stay off the site for now (SCOPE_NOFILE) are left out of the room, and the room's own counts follow.
   data.json is not changed. */
function offPath(d){const film=d.find(c=>c.k==='film');if(!film)return d;const gone=film.cards.filter(x=>SCOPE_NOFILE.indexOf(SCOPE_FILM[x.t])>=0);
  film.cards=film.cards.filter(x=>gone.indexOf(x)<0);const n=film.cards.length,was=film.ct;film.ct=n+' films';
  const c={commercial:0,'music video':0,'brand film':0,rs:0,other:0};
  film.cards.forEach(x=>{const t=String(x.m||'').split(' · ')[0].trim().toLowerCase();if(t==='reel'||t==='short'||SCOPE_FILM[x.t]==='demo-reel')c.rs++;else if(c[t]!=null)c[t]++;else c.other++});
  film.sum=[[c.commercial,'commercial'],[c['music video'],'music video'],[c['brand film'],'brand film'],[c.rs,'reels + shorts'],[c.other,'other']].filter(a=>a[0]).map(a=>a[0]+' '+a[1]).join(' · ');
  d.forEach(c=>(c.cards||[]).forEach(x=>{if(x.go==='film'&&x.m===was)x.m=film.ct}));return d}
const SCOPE_FILM={"One With the Devil":"one-with-the-devil","Demo Reel":"demo-reel","Reel 2026":"reel-2026","Gill Cinematography Demo Reel 2025":"cinematography-demo-reel-2025","Coca-Cola · Celebraciones":"celebraciones","AXE · Stay Gold":"stay-gold","BMW Legends":"legends","BMW · Drift":"drift","AXE · Golden Moment [Dir. Cut]":"golden-moment-directors-cut","Cover With Love · Isabelle · Band-Aid":"cover-with-love-isabelle","Big Brothers Big Sisters of Canada · No Place Like Home":"no-place-like-home","Yara · The Smell Needs To Go":"the-smell-needs-to-go","A&W Brew Bar: Coffee Teaser":"brew-bar-coffee-teaser","Explorers · Huggies":"explorers","Sun Kissed · John Frieda":"sun-kissed","Hey Ocean! · Sleepwalker":"sleepwalker","REEL ‘24":"reel-24","Allan Rayman · Repeat":"repeat-feat-jessie-reyez","Flower Crown · Claritin":"flower-crown","Backward Fall":"backward-fall","Arc'teryx S18":"s18","Old Man Canyon · Back to the Start":"back-to-the-start","Lets Grow Good Together · Brand Film":"lets-grow-good-together","Chris Malinchak and Kiesza · 'Weird Kid'":"weird-kid","ALLAN RAYMAN · VERONA'S OBSESSION":"veronas-obsession","19 Crimes x Malamen · Obedience Gets You Nowhere":"obedience-gets-you-nowhere","Wild Leaf · Fire · IG (4x5)":"fire","Modern Man · Braun":"modern-man","Old Man Canyon · Phantoms & Friends":"phantoms-and-friends","Summer Is Here · Shock Top":"summer-is-here","Eat Well · Westin Hotels & Resorts":"eat-well","Buddy Time: Grandpa's Story · LEGO · 15s cut":"buddy-time-grandpas-story","Wild Leaf · Hike · IG (4x5)":"hike","Wild Leaf · Canoe · IG (4x5)":"canoe","Mandie":"mandie","BONSAI · Just The Beginning":"just-the-beginning","Mansions · Ltl Dstryr":"ltl-dstryr","FIAT · Journeys x Todd":"journeys-x-todd"},SCOPE_NOFILE=["hike", "reel-24"];   /* generated: film room title -> m4 film page; films with no local file yet */
function openV(cd,t){if(cd.go){const C=CH.find(c=>c.d.k===cd.go);if(C)NAV.toRoom(C);return}
  const M=VW.querySelector('.m'),L=VW.querySelector('.l');M.innerHTML='';
  if(cd.v){const v=document.createElement('video');v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('playsinline','');v.controls=true;v.src=cd.v;
    const tv0=t&&t.userData.v;if(tv0&&tv0.currentTime)v.addEventListener('loadedmetadata',()=>{try{v.currentTime=tv0.currentTime%(v.duration||1e9)}catch(e){}},{once:true});M.appendChild(v);const p=v.play();if(p&&p.catch)p.catch(()=>{})}
  else if(cd.big||cd.src){const im=document.createElement('img');im.alt=cd.t||'';im.src=cd.big||cd.src;M.appendChild(im)}
  else if(cd.body){const p=document.createElement('p');p.textContent=cd.body;M.appendChild(p)}
  VW.querySelector('.c').textContent=cd.t+(cd.m?' · '+cd.m:'');
  /* next brief §3: a film plays in the site's own Scope player, never on a host. The card's Vimeo / YouTube address stays in data.json as a
     hidden source only; it is never a link. The action opens this film's Scope page (one page visit: Back returns here). */
  const slug=SCOPE_FILM[cd.t],G=window.GJ&&GJ.graph,host=/vimeo\.com|youtu\.?be/i.test(cd.url||'');
  const href=slug?((G&&G.film&&G.film(slug))||new URL('../../sky/player/tonight/fable-m4/film/'+slug+'/',location.href).href)+(SCOPE_NOFILE.indexOf(slug)<0?'?play=1':''):host?'':(cd.url||cd.href);
  L.hidden=!href;if(href){L.href=href;L.textContent=slug?(SCOPE_NOFILE.indexOf(slug)<0?'▶ play film':'film page ›'):(cd.lk||'open ›');if(slug||/^\.\.\//.test(href)||/^mailto:/.test(href))L.removeAttribute('target');else L.target='_blank'}
  VW.hidden=false;log('view',cd.t);NAV.viewOpened(cd)}
function closeV(){if(VW.hidden)return;VW.hidden=true;VW.querySelector('.m').innerHTML='';
  /* back out of the work: you land on the board again, its clip still moving in its tile */
  if(ON){setPT([ON.c.x,ON.c.y,ON.dock],W_GLIDE);face(W_GLIDE);GLIDE=true}log('close');NAV.viewClosed()}
VW.querySelector('.x').addEventListener('click',closeV);
let vp0=0;VW.addEventListener('touchstart',e=>{if(e.touches.length===2)vp0=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{passive:true});
VW.addEventListener('touchmove',e=>{if(e.touches.length===2&&vp0){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(d<vp0*.75){vp0=0;closeV()}}},{passive:false});
VW.addEventListener('wheel',e=>{if(e.deltaY>0&&(e.ctrlKey||!e.target.closest('p'))){e.preventDefault();closeV()}},{passive:false});
addEventListener('keydown',e=>{if(e.key==='Escape'){if(!VW.hidden)closeV();else pullBack()}else if(e.key==='Home')goHome();
  else if(e.key==='+'||e.key==='=')NAV.step(1);else if(e.key==='-'||e.key==='_')NAV.step(-1);
  else if(ON&&(e.key==='ArrowDown'||e.key==='ArrowUp'))scroll(ON,(e.key==='ArrowDown'?1:-1)*ON.tht)});
/* Pro 2's five glyphs (lines, stars), read from fable-m4's js/p2draw.js when the port runs */
const GLY={"film":{"t":"150,220,255","lt":"186,217,233","seg":[[10.7,9.9,61.0,7.6],[61.0,7.6,63.5,26.7],[63.5,26.7,8.2,28.1]],"pts":[[63.5,26.7,2.63,0.98],[10.7,9.9,2.56,0.96],[61.0,7.6,2.26,0.88],[8.2,28.1,2.16,0.86],[17.4,11.5,1.58,0.7],[33.8,11.6,1.51,0.69],[55.8,11.3,1.51,0.69],[38.1,25.1,1.51,0.69],[56.2,24.2,1.51,0.69],[23.0,24.3,1.48,0.68]]},"photo":{"t":"170,245,212","lt":"195,228,214","seg":[[37.4,8.6,47.9,15.9],[47.9,15.9,45.9,23.9],[45.9,23.9,35.4,27.8],[25.1,21.9,25.5,11.5],[25.5,11.5,37.4,8.6]],"pts":[[36.3,18.3,2.7,1.0],[45.9,23.9,2.53,0.96],[37.4,8.6,2.39,0.92],[25.1,21.9,2.33,0.9],[25.5,11.5,2.12,0.85],[47.9,15.9,2.05,0.83],[35.4,27.8,1.99,0.81]]},"objects":{"t":"255,236,205","lt":"233,224,210","seg":[[24.5,14.4,41.4,13.2],[41.4,13.2,42.7,28.9],[42.7,28.9,23.5,29.8],[33.8,7.4,51.0,6.5],[51.0,6.5,52.3,21.6],[24.5,14.4,33.8,7.4],[41.4,13.2,51.0,6.5],[42.7,28.9,52.3,21.6]],"pts":[[41.4,13.2,2.67,0.99],[24.5,14.4,2.33,0.9],[42.7,28.9,2.26,0.88],[51.0,6.5,2.19,0.86],[23.5,29.8,2.02,0.82],[52.3,21.6,1.94,0.8],[33.8,7.4,1.85,0.78]]},"sound":{"t":"255,182,176","lt":"233,200,197","seg":[[25.6,10.0,26.2,25.4],[32.2,7.8,32.3,26.7],[40.3,9.1,40.4,27.2],[7.7,17.8,13.1,16.1],[13.1,16.1,16.5,12.3],[16.5,12.3,22.1,15.0],[22.1,15.0,25.6,10.0],[25.6,10.0,32.2,7.8],[32.2,7.8,35.9,11.1],[35.9,11.1,40.3,9.1],[40.3,9.1,46.2,13.9],[46.2,13.9,49.9,11.3],[49.9,11.3,55.6,16.2],[55.6,16.2,60.7,15.7],[60.7,15.7,64.2,17.9]],"pts":[[32.2,7.8,2.56,0.96],[40.3,9.1,2.46,0.94],[25.6,10.0,2.36,0.91],[35.9,11.1,2.21,0.87],[49.9,11.3,2.12,0.85],[16.5,12.3,2.07,0.83],[32.3,26.7,2.05,0.83],[40.4,27.2,1.99,0.81],[46.2,13.9,1.97,0.81],[26.2,25.4,1.94,0.8],[22.1,15.0,1.9,0.79],[60.7,15.7,1.85,0.78],[13.1,16.1,1.77,0.75],[55.6,16.2,1.75,0.75],[7.7,17.8,1.59,0.71],[64.2,17.9,1.59,0.71]]},"about":{"t":"214,222,236","lt":"215,218,224","seg":[[23.8,11.6,17.4,11.6],[17.4,11.6,11.2,14.2],[11.2,14.2,8.3,20.4],[8.3,20.4,10.6,26.6],[10.6,26.6,17.0,29.3],[17.0,29.3,23.8,28.7],[41.3,30.3,41.7,21.1],[41.7,21.1,47.6,20.4],[47.6,20.4,51.2,16.6],[51.2,16.6,51.9,10.3],[63.7,7.6,65.6,9.8],[65.6,9.8,65.2,12.5]],"pts":[[51.9,10.3,2.53,0.96],[8.3,20.4,2.44,0.93],[65.6,9.8,2.36,0.91],[23.8,11.6,2.19,0.86],[34.4,15.4,2.19,0.86],[41.3,30.3,2.1,0.84],[11.2,14.2,2.02,0.82],[17.0,29.3,2.02,0.82],[23.8,28.7,1.94,0.8],[41.7,21.1,1.94,0.8],[65.2,12.5,1.94,0.8],[10.6,26.6,1.85,0.78],[27.1,11.1,1.85,0.78],[27.2,19.6,1.85,0.78],[47.6,20.4,1.85,0.78],[63.7,7.6,1.85,0.78],[17.4,11.6,1.77,0.75],[51.2,16.6,1.77,0.75]]}};
/* ====================================================================================================================================
   option C · "one world you move through" (Pack 1117, Gill's nav brief of 16 Nov) · the motion test
   Three kinds of place on one path, and one move between each: under the sky, over the map, inside a room (and a work inside a room).
     under the sky   you stand on the ground and look at the five constellations. A ridge and a low glow mark the horizon: home.
     the map         pinch in and you rise: the ground slides away under you and the same sky tilts and flattens into a chart, seen from
                     above, each constellation tied to the centre.
     a room          pinch into a cluster and you fly to it: its stars gather into its board. A few stay at the board's corners.
   Pinch out reverses each step. One pinch is one level, never two. A pinch is followed live (the world moves under the fingers) and
   settles on the nearer level when the fingers lift. Wheel, trackpad and the + / − keys do the same; a tap on a constellation goes to it.
   Every place has its own address and is one step in history: Back steps one place, down to the sky.
   Nothing here is a page: it is one camera in one world, on the film room's own springs.
   ==================================================================================================================================== */
const W_TRACK=RM?18:13,SPAN=.56;
const TINT={film:[150,220,255],photo:[170,245,212],objects:[255,236,205],sound:[255,196,214],about:[200,206,255]};
const NAV=(()=>{
  let lv=0,room=null,tr=null,acc=0,accT=0,wT=0,lit=null,trail=[],mapK=0,red=false,ink=0xffffff,viaT=0,depth=0,fromPop=false,viewItem=-1,ready=false,lock=0,glint=0,nextShoot=0,shoot=null;
  const $=id=>document.getElementById(id);
  const pose=(L,C)=>L===0?{p:SKYP,pitch:SKYPITCH}:L===1?{p:MAPP,pitch:MAPPITCH}:{p:[C.c.x,C.c.y,C.dock],pitch:0};
  /* ---- the map's own dressing: the sheet, the lines home, the centre, the trail ---- */
  const MAPG=new THREE.Group();scene.add(MAPG);
  const lineM=(c,o)=>new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false});
  const sheet=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-33,-37],[33,-37],[33,42],[-33,42]].map(q=>new THREE.Vector3(q[0],q[1],0))),lineM(0xcfd8e6,0));MAPG.add(sheet);
  let spokes=null,trailL=null;
  const hub=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:0xdfe9ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));hub.scale.set(4.2,4.2,1);MAPG.add(hub);
  let hubLab=null;
  /* ---- the ground: two ridges and the glow behind them (home). They are real things in the world, so they slide and part as you rise. ---- */
  function ridge(seed,w,h,trees){const r=mulberry(seed),pts=[],n=64;for(let i=0;i<=n;i++){const x=-w/2+w*i/n,y=h*(.45+.3*Math.sin(i*.31+seed)+.22*Math.sin(i*.83+seed*2.1)+.12*(r()-.5));pts.push([x,y]);
      if(trees&&r()<.34){const th=h*(.5+r()*.9),tw=w/n*.42;pts.push([x+tw*.5,y+th],[x+tw,y])}}
    const s=new THREE.Shape();s.moveTo(-w/2,-60);pts.forEach(q=>s.lineTo(q[0],q[1]));s.lineTo(w/2,-60);s.closePath();
    return new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshBasicMaterial({color:0x010205,fog:false,depthWrite:false,transparent:true}))}
  const farR=ridge(7,300,5,true),nearR=ridge(23,220,3.4,true);farR.material.color.set(0x060a13);farR.renderOrder=3;nearR.renderOrder=4;scene.add(farR,nearR);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:0x2b4d86,transparent:true,opacity:.62,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));glow.scale.set(300,70,1);glow.renderOrder=2;scene.add(glow);
  const glow2=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:0x86a8d8,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));glow2.scale.set(120,22,1);glow2.renderOrder=2;scene.add(glow2);
  /* a shooting star, now and then, while you are out under the sky */
  const shootL=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(1,0,0)]),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));scene.add(shootL);
  function place(){/* poses and ground for this screen: far enough under the sky to hold all five; over the map never so near that a board starts to form */
    const sx=Math.max(1,Math.min(1.75,th/.34));                      /* on a wide screen the rooms stand a little further apart, left and right */
    if(CH.length){CH.forEach(C=>{C.c.x=LAY[C.d.k][0]*sx;C.g.position.x=C.c.x});if(spokes){const pts=[];CH.forEach(C=>{pts.push(new THREE.Vector3(0,-1,0),new THREE.Vector3(C.c.x,C.c.y-CY,0))});spokes.geometry.dispose();spokes.geometry=new THREE.BufferGeometry().setFromPoints(pts);
        sheet.geometry.dispose();sheet.geometry=new THREE.BufferGeometry().setFromPoints([[-33*sx,-37],[33*sx,-37],[33*sx,42],[-33*sx,42]].map(q=>new THREE.Vector3(q[0],q[1],0)));setTrail()}}
    const st=Math.max(6,BW*1.1/2/th),ds=Math.max(49/(.78*tv),(21*sx+10)/(.92*th)),sp=Math.sin(MAPPITCH),cp=Math.cos(MAPPITCH);let dm=st+27;
    for(;dm<170;dm+=2){let ok=true;for(const k in LAY){const x=Math.abs(LAY[k][0])*sx+10.5;for(const yy of[LAY[k][1]+5,LAY[k][1]-11]){const ry=yy-dm*.8,dep=ry*sp+dm*cp,sx=x/(dep*th),sy=(ry*cp+dm*-sp)/(dep*tv);if(dep<1||sx>.94||sy>.76||sy<-.8)ok=false}}if(ok)break}
    SKYP[0]=0;SKYP[1]=2;SKYP[2]=ZP+ds;MAPP[0]=0;MAPP[1]=CY+dm*.8;MAPP[2]=ZP+dm;
    farR.position.set(0,2-60*Math.tan(.36)-2.2,SKYP[2]-60);nearR.position.set(6,2-30*Math.tan(.455)-1.4,SKYP[2]-30);
    glow.position.set(0,2-(ds-8)*Math.tan(.33),ZP+8);glow2.position.set(0,2-(ds-8)*Math.tan(.30),ZP+8)}
  function dress(){if(spokes)return;const pts=[];CH.forEach(C=>{pts.push(new THREE.Vector3(0,-1,0),new THREE.Vector3(C.c.x,C.c.y-CY,0))});
    spokes=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),lineM(0x8fb0e0,0));MAPG.add(spokes);MAPG.position.set(0,CY,ZP);hub.position.set(0,-1,.02);
    hubLab=new THREE.Sprite(new THREE.SpriteMaterial({map:txtTex([{s:'GILL',f:'60px Julius',y:44,ls:'12px'},{s:'I am an artist',f:'30px Poppins',y:98,c:'rgba(214,226,242,.9)'}],512,128),transparent:true,depthWrite:false,opacity:0}));hubLab.scale.set(15,3.75,1);hubLab.position.set(0,-5.4,.02);MAPG.add(hubLab);
    trailL=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:0xdfe9ff,transparent:true,opacity:0,dashSize:.7,gapSize:.9,depthWrite:false}));MAPG.add(trailL);
    /* names are read from far away here, so their textures get mipmaps (the film room only showed them near) */
    const mip=t=>{t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());t.needsUpdate=true};mip(hubLab.material.map);
    CH.forEach(C=>{C.st.forEach(s=>{s.userData.p0=s.position.clone()});C.tint=TINT[C.d.k]||[207,216,230];mip(C.lab.material.map);mip(C.inf.material.map)})}
  function setTrail(){if(!trailL)return;const pts=[new THREE.Vector3(0,-1,.01)];trail.forEach(C=>pts.push(new THREE.Vector3(C.c.x,C.c.y-CY,.01)));trailL.geometry.dispose();trailL.geometry=new THREE.BufferGeometry().setFromPoints(pts);trailL.computeLineDistances()}
  /* ---- addresses and history: every place is one step ---- */
  const addr=(L,C,i)=>'#'+(L===0?'sky':L===1?'map':C.d.k+(L===3?'/'+(i+1):''));
  const stOf=(L,C,i,d)=>({w:1,lv:L,k:C?C.d.k:null,i:L===3?i:-1,d:d});
  function push(L,C,i){depth++;try{history.pushState(stOf(L,C,i,depth),'',addr(L,C,i))}catch(e){}}
  function back(n){try{fromPop=false;history.go(-n)}catch(e){}}
  function seed(){/* a first landing on a deeper address: lay down the steps under it, so Back still goes one place at a time, down to the sky */
    const m=/^#(\w+)(?:\/(\d+))?$/.exec(location.hash||''),hs=history.state;
    if(hs&&hs.w){depth=hs.d||0;apply(hs,true);return}
    let L=0,C=null,i=-1;if(m){if(m[1]==='map')L=1;else{C=CH.find(c=>c.d.k===m[1])||null;if(C){L=2;if(m[2]&&C.tiles[+m[2]-1]&&!C.tiles[+m[2]-1].userData.cd.go){L=3;i=+m[2]-1}}}}
    depth=0;try{history.replaceState(stOf(0,null,-1,0),'',L===0?location.pathname+location.search+'#sky':'#sky')}catch(e){}
    if(L>=1)push(1,null,-1);if(L>=2)push(2,C,-1);if(L>=3)push(3,C,i);apply(stOf(L,C,i,depth),true)}
  function apply(s,instant){const C=s.k?CH.find(c=>c.d.k===s.k):null,L=s.lv>=2&&!C?1:s.lv;depth=s.d||0;
    if(L<3&&!VW.hidden){fromPop=true;closeV();fromPop=false}
    set(Math.min(L,2),C,instant);
    if(L===3&&C&&C.tiles[s.i]){const t=C.tiles[s.i];viewItem=s.i;fromPop=true;setTimeout(()=>{openV(t.userData.cd,t);fromPop=false},instant?700:500)}}
  addEventListener('popstate',e=>{const s=e.state;if(s&&s.w)apply(s,false);else if(!s||!s.gjfs){depth=0;apply(stOf(0,null,-1,0),false)}});
  /* ---- moving ---- */
  function set(L,C,instant){clearTimeout(viaT);lv=L;room=L===2?C:null;if(room){lit=room;if(trail[trail.length-1]!==room){trail.push(room);if(trail.length>6)trail.shift();setTrail()}}
    const q=pose(L,C);setPT(q.p.slice(),W_GLIDE);face(W_GLIDE);pitch.t=q.pitch;GLIDE=true;SETTLED=true;
    if(instant){P.forEach(s=>{s.x=s.t;s.v=0});pitch.x=pitch.t;yaw.x=yaw.t=0;pitch.v=yaw.v=0}ui();log('level',L+(C?' '+C.d.k:''))}
  function go(L,C){/* by one level, or a named jump (the home star, a tap from far away); history follows */
    const hadView=!VW.hidden;if(hadView){fromPop=true;closeV();fromPop=false}                              /* leaving a work is a step too; counted below */
    const was=lv,wasC=room;if(L===was&&(L<2||C===wasC)){if(hadView)back(1);set(L,C);return}
    if(L<was){back(was-L+(hadView?1:0));set(L,C);return}                                                   /* out: step back, as many places as levels */
    if(hadView)back(1);
    if(L===was&&L===2){try{history.replaceState(stOf(2,C,-1,depth),'',addr(2,C))}catch(e){}set(2,C);return}   /* room to room (a link on a board) */
    if(was===0&&L===2){push(1,null,-1);push(2,C,-1);                                                         /* sky to a room: through the map, in one move */
      set(1,null);lit=C;viaT=setTimeout(()=>{set(2,C)},RM?60:520);lv=2;room=C;ui();return}
    push(L,C,-1);set(L,C)}
  function target(dir,x,y){if(dir>0){if(lv===0)return{lv:1,C:null};if(lv===1){const C=pick(x,y)||near(x,y);return C?{lv:2,C:C}:null}return null}
    if(lv===2)return{lv:1,C:null};if(lv===1)return{lv:0,C:null};return null}
  function near(x,y){let b=null,bd=1e9;CH.forEach(C=>{tmp.copy(C.c).project(cam);const d=Math.hypot((tmp.x+1)/2*innerWidth-x,(1-tmp.y)/2*innerHeight-y);if(d<bd){bd=d;b=C}});return b}
  /* a pinch (or wheel, or trackpad) in flight: k is the change in log scale since the last event. The camera rides between the two poses. */
  function drive(x,y,k){const now=performance.now();if(tr&&tr.done)return;
    if(!PT.size&&now<lock){lock=Math.max(lock,now+260);return}                  /* a wheel or trackpad that keeps rolling after a level is reached does not go on to the next: one move, one level */
    if(!tr&&now-accT>350)acc=0;accT=now;acc+=k;if(Math.abs(acc)<.02&&!tr)return;
    const dir=acc>0?1:-1;if(!tr||tr.dir!==dir){const t=target(dir,x,y);tr={dir:dir,from:{lv:lv,C:room},to:t,u:0}}
    if(!tr.to){tr.u=0;return}                                                   /* nothing further that way: the sky is the floor, a room is as far in as a pinch goes */
    const u=Math.min(1,Math.abs(acc)/SPAN),a=pose(tr.from.lv,tr.from.C),b=pose(tr.to.lv,tr.to.C),e=u*u*(3-2*u);tr.u=u;
    setPT([0,1,2].map(i=>a.p[i]+(b.p[i]-a.p[i])*e),W_TRACK);pitch.t=a.pitch+(b.pitch-a.pitch)*e;pitch.w=W_TRACK;yaw.t=0;yaw.w=W_TRACK;GLIDE=true;SETTLED=true}
  function release(){if(!tr){acc=0;return}const t=tr;tr=null;acc=0;if(!t.to)return;if(t.u>.3){lock=performance.now()+650;go(t.to.lv,t.to.C)}else set(t.from.lv,t.from.C)}
  function wheel(){clearTimeout(wT);wT=setTimeout(()=>{if(!PT.size)release()},170)}
  function step(dir){const t=target(dir,innerWidth/2,innerHeight/2);if(!VW.hidden){if(dir<0)closeV();return}if(t)go(t.lv,t.C||(dir>0&&lv===1?(lit||CH[0]):null))}
  function toRoom(C){if(C)go(2,C)}
  function out(){if(!VW.hidden){closeV();return}if(lv>0)go(lv-1,null)}
  /* the work view is the fourth level */
  function viewOpened(cd){const C=ON||room;if(!C)return;const i=C.tiles.findIndex(t=>t.userData.cd===cd);viewItem=i;if(!fromPop&&!(history.state&&history.state.lv===3))push(3,C,i);ui()}
  function viewClosed(){viewItem=-1;if(!fromPop&&history.state&&history.state.w&&history.state.lv===3)back(1);ui()}
  /* ---- what the page shows around the world ---- */
  function where(){if(!VW.hidden)return(room||ON||{d:{nm:''}}).d.nm;if(tr&&tr.to&&tr.u>.05)return'→ '+(tr.to.lv===0?'the sky':tr.to.lv===1?'the map':tr.to.C.d.nm);return lv===0?'the sky':lv===1?'the map':room?room.d.nm:''}
  function ui(){const L=!VW.hidden?3:lv,dots=document.querySelectorAll('#lv i');dots.forEach((d,i)=>{d.classList.toggle('on',i===L);d.setAttribute('aria-current',i===L?'true':'false')});
    const hs=$('hs');if(hs)hs.classList.toggle('on',L>0);html.setAttribute('data-lv',String(L));
    const tip=$('tip');if(tip&&L>0&&!tip.hidden){tip.classList.add('off');try{localStorage.setItem('gj.world.tip','1')}catch(e){}}}
  function boot(){dress();place();setTrail();seed();ready=true;
    const lvEl=$('lv');if(lvEl)lvEl.addEventListener('click',e=>{const i=[...lvEl.children].indexOf(e.target.closest('i'));if(i<0)return;const L=!VW.hidden?3:lv;if(i<L)go(Math.min(i,2),i===2?room:null);else if(i===L+1&&i<=2)step(1)});
    const hs=$('hs');if(hs)hs.addEventListener('click',()=>{if(lv>0||!VW.hidden)go(0,null)});
    const tip=$('tip');if(tip){let seenTip=false;try{seenTip=localStorage.getItem('gj.world.tip')==='1'}catch(e){}tip.hidden=seenTip||lv>0;if(!tip.hidden)setTimeout(()=>tip.classList.add('in'),900)}
    nextShoot=performance.now()+9000+Math.random()*9000;ui()}
  /* ---- every frame: the dressing follows the camera ---- */
  function frame(now,dt){if(!ready)return;const cy=cam.position.y,maxM=CH.reduce((a,C)=>Math.max(a,C.m),0);
    mapK=sm(SKYP[1]+(MAPP[1]-SKYP[1])*.18,MAPP[1]-(MAPP[1]-SKYP[1])*.12,cy)*(1-.8*maxM);
    const kk=mapK;sheet.material.opacity=.2*kk;spokes.material.opacity=.36*kk;hub.material.opacity=.95*kk;hubLab.material.opacity=kk;trailL.material.opacity=trail.length?.42*kk:0;
    /* the ground lets go as you rise; the glow stays where home is */
    const up=sm(SKYP[1],SKYP[1]+(MAPP[1]-SKYP[1])*.5,cy);nearR.material.opacity=farR.material.opacity=1-sm(.75,1,up);nearR.visible=farR.visible=up<.999;
    glow.material.opacity=(red?.5:.62)*(1-.55*maxM);glow2.material.opacity=.2*(1-.9*up);
    /* light as guide: the cluster you are heading for brightens; the room you were in stays lit on the map */
    const aim=tr&&tr.to&&tr.to.C?tr.to.C:(lv===2&&GLIDE?room:null),au=tr&&tr.to&&tr.to.C?tr.u:(aim?1:0);
    CH.forEach(C=>{const m=C.m,isLit=C===lit&&kk>.3,b=1+(C===aim?.55*au:0)+(isLit?.22:0),hw=(BW+.3)/2,hh=C.winH/2,bs=.4+.6*m;
      C.lines.material.opacity=Math.min(1,(.35+(C===aim?.3*au:0)+(isLit?.18:0))*(1-m));const away=C===room||C===aim?1:1-maxM;      /* inside a room, the other rooms step back */
      C.lab.material.opacity=Math.min(1,.95*(kk>.3&&lit&&C!==lit&&!aim?.74:1))*away;C.inf.material.opacity*=away;
      C.st.forEach((s,j)=>{const k=s.userData.k*b*(1+(RM?0:.15*Math.sin(now/700+s.id)));
        if(j<4){/* four stars stay: they travel to the board's corners as it forms */const p0=s.userData.p0,cx=(j%2?1:-1)*(hw*bs+.05),cyy=(j<2?1:-1)*(hh*bs+.05),e=m*m*(3-2*m);
          s.position.set(p0.x+(cx-p0.x)*e,p0.y+(cyy-p0.y)*e,p0.z*(1-e)+.04*e);s.material.opacity=1-.25*m;const kc=k*(1-.45*m);s.scale.set(kc,kc,1)}
        else{s.material.opacity=(1-m)*(.3+.7*away);s.scale.set(k,k,1)}});
      if(away<1){C.lines.material.opacity*=.3+.7*away;C.st.slice(0,4).forEach(s=>{if(C!==room&&C!==aim)s.material.opacity=.3+.7*away})}});
    /* stars glimmer on touch; a shooting star now and then */
    if(glint>0){glint=Math.max(0,glint-dt*1.6);U.uTw.value=RM?0:1+2.2*glint}
    if(!RM&&!shoot&&now>nextShoot&&lv<=1&&maxM<.1){const x0=-40+Math.random()*60,y0=CY+34+Math.random()*26,z=ZP-40;shoot={t:now,a:new THREE.Vector3(x0,y0,z),d:new THREE.Vector3(26+Math.random()*16,-(8+Math.random()*8),0)}}
    if(shoot){const u=(now-shoot.t)/700;if(u>=1){shoot=null;shootL.material.opacity=0;nextShoot=now+16000+Math.random()*26000}else{const h=shoot.a.clone().addScaledVector(shoot.d,u),t=shoot.a.clone().addScaledVector(shoot.d,Math.max(0,u-.22));shootL.geometry.setFromPoints([t,h]);shootL.material.opacity=.8*Math.sin(u*Math.PI)}}}
  function light(on,k){red=on;ink=k;const c=on?k:null;[sheet,spokes].forEach(o=>o&&o.material.color.set(c||(o===sheet?0xcfd8e6:0x8fb0e0)));hub.material.color.set(c||0xdfe9ff);if(hubLab)hubLab.material.color.set(c||0xffffff);if(trailL)trailL.material.color.set(c||0xdfe9ff);
    farR.material.color.set(on?0x0a0304:0x060a13);nearR.material.color.set(on?0x030101:0x010205);glow.material.color.set(on?0x5a121c:0x2b4d86);glow2.material.color.set(on?(k===0xffb0b8?0x9a5a62:0x8a2430):0x86a8d8);shootL.material.color.set(c||0xffffff);
    /* each board carries a faint wash of its own constellation's light (in red mode: the red, no other hue) */
    CH.forEach(C=>{const t=C.tint||[207,216,230],base=on?[12,5,6]:[8,12,22],w=on?0:.09;C.frame.material.color.setRGB((base[0]+(t[0]-base[0])*w)/255,(base[1]+(t[1]-base[1])*w)/255,(base[2]+(t[2]-base[2])*w)/255,THREE.SRGBColorSpace);
      C.edge.material.color.set(on?k:new THREE.Color().setRGB(t[0]/255,t[1]/255,t[2]/255,THREE.SRGBColorSpace).lerp(new THREE.Color(0xcfd8e6),.55))})}
  return{drive:drive,release:release,wheel:wheel,step:step,toRoom:toRoom,out:out,go:go,where:where,frame:frame,light:light,boot:boot,place:place,viewOpened:viewOpened,viewClosed:viewClosed,
    cornerStars:()=>{const C=room||ON;if(!C)return null;const pr=v=>{tmp.copy(v).project(cam);return[(tmp.x+1)/2*innerWidth,(1-tmp.y)/2*innerHeight]},hw=(BW+.3)/2,hh=C.winH/2;
      return{stars:C.st.slice(0,4).map(s=>pr(s.getWorldPosition(new THREE.Vector3()))),box:[[-1,1],[1,1],[-1,-1],[1,-1]].map(q=>pr(new THREE.Vector3(C.c.x+q[0]*hw,C.c.y+q[1]*hh,C.c.z)))}},
    touch:()=>{glint=1},gate:C=>((lv===2&&room===C)||(tr&&tr.to&&tr.to.C===C)||(!VW.hidden&&ON===C))?1:0,pitch0:()=>pose(lv,room).pitch,busy:()=>!!tr,
    state:()=>({lv:!VW.hidden?3:lv,room:room?room.d.k:null,lit:lit?lit.d.k:null,trail:trail.map(C=>C.d.k),mapK:+mapK.toFixed(3),tr:tr?{to:tr.to?(tr.to.lv+(tr.to.C?' '+tr.to.C.d.k:'')):null,u:+tr.u.toFixed(3)}:null,depth:depth,hash:location.hash,ridge:+nearR.material.opacity.toFixed(2),corners:CH.map(C=>C.st.slice(0,4).map(s=>+s.material.opacity.toFixed(2)))})}})();
/* ---------- loop ---------- */
const LOG=[];function log(k,v){LOG.push([Math.round(performance.now()),k,v]);if(LOG.length>300)LOG.shift()}
let last=performance.now(),fc=0,ft=last,fps=0,whereTxt='';
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;fc++;if(now-ft>=1000){fps=fc*1000/(now-ft);fc=0;ft=now}
  U.uT.value=now/1000;
  if(!drag){sstep(yaw,dt);sstep(pitch,dt)}
  const px=P.map(s=>s.x);P.forEach(s=>sstep(s,dt));
  const mv=Math.hypot(P[0].x-px[0],P[1].x-px[1],P[2].x-px[2]),lim=VLIM*dt;if(mv>lim){const k=lim/mv;P.forEach((s,i)=>{s.x=px[i]+(s.x-px[i])*k;s.v=(s.x-px[i])/dt})}
  roll.t=Math.max(-.14,Math.min(.14,-yaw.v*.16));sstep(roll,dt);
  const sw=Math.max(-1,Math.min(1,yaw.v*.6));
  forward(yaw.x,pitch.x);const rx=Math.cos(yaw.x),rz=-Math.sin(yaw.x);
  cam.position.set(P[0].x+rx*sw*1.6,P[1].x-Math.abs(sw)*.7,P[2].x+rz*sw*1.6);
  eu.set(pitch.x-Math.abs(sw)*.02,yaw.x,roll.x);cam.quaternion.setFromEuler(eu);cam.updateMatrixWorld();
  CH.forEach(C=>{const d=C.dist=cam.position.distanceTo(C.c),dz=cam.position.z-C.c.z,lat=Math.hypot(cam.position.x-C.c.x,cam.position.y-C.c.y);
    const m=C.m=sm(C.stand+22,C.stand+2,dz)*sm(.05,.3,dz)*sm(14,6,lat)*NAV.gate(C),g=(1.5+1.7*sm(30,95,d))*(1-.25*m),ly=-7.6-m*2.4-.9*sm(30,95,d);
    if(d<C.stand+70)loadImgs(C);
    C.lab.scale.set(5*g,1*g,1);C.lab.position.y=ly;
    C.inf.material.opacity=sm(C.stand+62,C.stand+30,d)*(1-m);C.inf.scale.set(4.4*g*.8,.44*g*.8,1);C.inf.position.y=ly-1.05*g;
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
  NAV.frame(now,dt);let w=NAV.where();
  if(w!==whereTxt){whereTxt=w;WHERE.textContent=w}
  R.render(scene,cam)}
window.__s3={st:()=>({yaw:yaw.x,pitch:pitch.x,pos:P.map(s=>s.x),posT:P.map(s=>s.t),fps:fps,on:ON&&ON.d.k,where:whereTxt,view:!VW.hidden,
    ch:CH.map(C=>({k:C.d.k,sc:+C.sc.toFixed(2),max:+maxSc(C).toFixed(2),dist:+C.dist.toFixed(1),m:+C.m.toFixed(3),stand:+C.stand.toFixed(2),imgs:C.tiles.filter(t=>t.userData.img).length,clips:C.tiles.filter(t=>t.userData.vt).length,playing:C.tiles.filter(t=>t.userData.v&&!t.userData.v.paused).length})),stars:NSTAR}),
  log:LOG,films:()=>{const d=CH.find(c=>c.d.k==='film').d;return{ct:d.ct,sum:d.sum,cards:d.cards.map(x=>({t:x.t,slug:SCOPE_FILM[x.t]||null}))}},glide:k=>NAV.toRoom(CH.find(c=>c.d.k===k)),home:goHome,nav:NAV,cam:()=>({p:[cam.position.x,cam.position.y,cam.position.z],pitch:pitch.x,yaw:yaw.x,SKYP:SKYP.slice(),MAPP:MAPP.slice()}),zoom:(x,y,k)=>zoomAt(x,y,k),
  item:(k,j)=>{const C=CH.find(c=>c.d.k===k),t=C.tiles[j];tmp.copy(t.position);t.localToWorld(tmp.set(0,0,0));tmp.project(cam);return[(tmp.x+1)/2*innerWidth,(1-tmp.y)/2*innerHeight]},
  screen:k=>{const C=CH.find(c=>c.d.k===k);tmp.copy(C.c).project(cam);return[(tmp.x+1)/2*innerWidth,(1-tmp.y)/2*innerHeight,tmp.z]}};
addEventListener('resize',resize);resize();
/* ---------- safelight (Nov 15): in red mode this room is red too: the sky, the stars, the lines, the words.
   Photographs and clips are never tinted: a tile that shows a picture is left alone, only its empty placeholder changes.
   The red is the tone dial's (gj.red.tone: crimson #FF4457, or rose #FFB0B8). Night values are the ones the room was built with. ---------- */
function safelight(){const on=document.documentElement.classList.contains('rm');let rose=false;try{rose=localStorage.getItem('gj.red.tone')==='rose'}catch(e){}
  const ink=on?(rose?0xffb0b8:0xff4457):0xffffff,sky=on?0x060304:0x04060c;
  R.setClearColor(sky,1);scene.fog.color.set(sky);
  U.uRed.value=on?1:0;U.uInk.value.set((ink>>16&255)/255,(ink>>8&255)/255,(ink&255)/255);
  NEB.forEach((s,i)=>s.material.color.set(on?[0x5a121c,0x47101f,0x3a0d12][i]:s.userData.c));
  CH.forEach(C=>{C.st.forEach(s=>s.material.color.set(on?ink:0xdfe9ff));C.lines.material.color.set(on?ink:0x8fb0e0);C.edge.material.color.set(on?ink:0xcfd8e6);
    C.frame.material.color.set(on?0x0c0506:0x080c16);C.lab.material.color.set(ink);C.inf.material.color.set(ink);
    C.inner.children.forEach(m=>{const cd=m.userData&&m.userData.cd;
      if(cd&&cd.src){if(!m.userData.img&&!m.userData.vt)m.material.color.set(on?0x1c0a0d:0x141c2c)}
      else m.material.color.set(ink)})});NAV.light(on,ink)}
addEventListener('gj-tog',e=>{const k=e.detail&&e.detail.k;if(k==='gj-red'||k==='gj.red.tone')safelight()});
addEventListener('storage',e=>{if(e.key==='gj-red'||e.key==='gj.red.tone')setTimeout(safelight,60)});
Promise.all([fetch('../site-3d/data.json').then(r=>r.json()),document.fonts.load('84px Julius'),document.fonts.load('40px Poppins'),document.fonts.load('60px Julius')]).then(a=>{data=offPath(a[0]).filter(c=>LAY[c.k]);build();NAV.boot();safelight();requestAnimationFrame(frame)})
  .catch(e=>{console.warn(e);html.className='nogl'});
