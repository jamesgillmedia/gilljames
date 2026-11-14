import * as THREE from '../vendor/three.module.min.js';
import {FILM} from './data.js';
// ᑕᐣᓯ signature nodes (from site-v4-galaxy-nav/js/galaxy.js)
const SIGN=[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97],[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5],[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]],
SIGE=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,8],[8,9],[9,10],[10,11],[12,13],[13,14],[14,15],[15,16],[16,17]],
SIGSYS={film:1,photo:5,about:9,sound:12,objects:17};
const SYS=['film','photo','objects','sound','about'];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches; // shortens flights only, never disables
const PHONE=Math.min(innerWidth,innerHeight)<600||matchMedia('(pointer:coarse)').matches;
const MINT=new THREE.Color('#55DAA1');
const $=s=>document.querySelector(s);
const cv=$('#c');
let R;
try{R=new THREE.WebGLRenderer({canvas:cv,antialias:!PHONE,powerPreference:'high-performance'});if(!R.getContext())throw 0}
catch(e){const p=document.createElement('p');p.className='err';p.textContent='WebGL is not available here, so the 3D galaxy cannot show';document.body.appendChild(p);throw e}
R.setPixelRatio(Math.min(devicePixelRatio||1,PHONE?1.5:1.75));R.setClearColor(0x04070b,1);
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x04070b,400,1900);
const cam=new THREE.PerspectiveCamera(55,1,0.5,4000);
const W3=p=>new THREE.Vector3(p[0],-p[1],0);
const NODES=SIGN.map(W3);
// glow sprite texture
function glowTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.2,'rgba(220,235,255,.7)');r.addColorStop(.5,'rgba(150,190,255,.18)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);return t}
const GLOW=glowTex();
function pts(n,fn,size,op){const p=new Float32Array(n*3),c=new Float32Array(n*3),v=new THREE.Vector3(),col=new THREE.Color();
 for(let i=0;i<n;i++){fn(i,v,col);p.set([v.x,v.y,v.z],i*3);c.set([col.r,col.g,col.b],i*3)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
 return new THREE.Points(g,new THREE.PointsMaterial({size,map:GLOW,vertexColors:true,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}))}
const rnd=(a,b)=>a+Math.random()*(b-a);
// galaxy dust: a wide spiral disk + deep field for parallax
scene.add(pts(PHONE?2600:4200,(i,v,c)=>{const arm=i%3,t=Math.pow(Math.random(),.7),a=arm*2.094+t*5.2+rnd(-.35,.35),r=40+t*560;
 v.set(Math.cos(a)*r,Math.sin(a)*r*.62,rnd(-40,40)*(1-t*.5));const b=rnd(.35,.8);i%17===0?c.copy(MINT).multiplyScalar(.6):c.setRGB(b*.75,b*.85,b)},3.2,.55));
scene.add(pts(PHONE?1400:2400,(i,v,c)=>{v.set(rnd(-1400,1400),rnd(-1000,1000),rnd(-900,700));const b=rnd(.4,1);c.setRGB(b*.8,b*.88,b)},4,.6));
// signature constellation: dust along strokes + node stars + thin lines
scene.add(pts(PHONE?900:1500,(i,v,c)=>{const e=SIGE[i%SIGE.length],a=NODES[e[0]],b=NODES[e[1]];v.lerpVectors(a,b,Math.random());v.x+=rnd(-5,5);v.y+=rnd(-5,5);v.z+=rnd(-10,10);
 i%11===0?c.copy(MINT):c.setRGB(.7,.82,1)},2.6,.8));
{const lp=[];SIGE.forEach(e=>lp.push(NODES[e[0]],NODES[e[1]]));const g=new THREE.BufferGeometry().setFromPoints(lp);
 scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xbcd0ff,transparent:true,opacity:.22})))}
scene.add(pts(NODES.length,(i,v,c)=>{v.copy(NODES[i]);c.setRGB(.9,.95,1)},9,.95));
// star systems
const systems=SYS.map(k=>{const p=NODES[SIGSYS[k]].clone();const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:k==='film'?0xffffff:0x9fb4d8,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
 s.position.copy(p);s.scale.setScalar(k==='film'?44:30);scene.add(s);
 const el=document.createElement('div');el.className='lb';el.innerHTML=k+(k==='film'?'<small>'+FILM.length+' films</small>':'<small>soon</small>');$('#labels').appendChild(el);
 return {kind:'sys',k,p,s,el,soon:k!=='film'}});
const FILMSYS=systems[0];
// Film constellation: works at depth behind the film star, newest nearest
const loader=new THREE.TextureLoader();
const FN={reel:39,'03':16,'04':13,'05':9,'06':14};
const CW=12,CH=6.75,DZ=15;
const works=FILM.map((w,i)=>{const a=i*.95,r=9+i*.45;
 const p=new THREE.Vector3(FILMSYS.p.x+Math.cos(a)*r*(PHONE?.75:1.25),FILMSYS.p.y+Math.sin(a)*r*(PHONE?1.3:.8),FILMSYS.p.z-18-i*DZ);
 const dim=Math.max(.5,1-i*.016);
 const m=new THREE.MeshBasicMaterial({color:new THREE.Color(.12,.16,.22),transparent:true,opacity:dim,depthWrite:false,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(CW,CH),m);mesh.position.copy(p);scene.add(mesh);
 const g=new THREE.Group();g.position.copy(p);scene.add(g);
 // thin edge: mint for the newest three
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(CW*1.02,CH*1.03)),new THREE.LineBasicMaterial({color:i<3?0x55DAA1:0x8899aa,transparent:true,opacity:i<3?.8:.22}));g.add(edge);
 const o={kind:'work',i,w,p,mesh,edge,dim,loaded:0,frames:[]};mesh.userData.o=o;
 // case-study stills float as small frames around works that have a case
 if(w.f){const n=w.f==='reel'?8:6;for(let j=0;j<n;j++){const fa=j/n*Math.PI*2+.4,fr=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.36),new THREE.MeshBasicMaterial({color:0x1a2230,transparent:true,opacity:0,depthWrite:false}));
  fr.position.set(p.x+Math.cos(fa)*10.5,p.y+Math.sin(fa)*6.2,p.z-2.5-(j%3)*1.6);fr.userData.src='case/f/'+w.f+'-'+String(Math.min(FN[w.f]-1,Math.round(j*(w.f==='reel'?4.5:2)))).padStart(2,'0')+'.webp';scene.add(fr);o.frames.push(fr)}}
 return o});
function loadWork(o,big){if(o.loaded>=(big?2:1))return;o.loaded=big?2:1;
 loader.load(big?o.w.b:o.w.i,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;const m=o.mesh.material;if(m.map&&big)m.map.dispose();m.map=t;m.color.set(0xffffff);m.needsUpdate=true});
 o.frames.forEach(f=>{if(f.userData.l)return;f.userData.l=1;loader.load(f.userData.src,t=>{t.colorSpace=THREE.SRGBColorSpace;f.material.map=t;f.material.color.set(0xffffff);f.material.needsUpdate=true})})}
// camera fitting
let homeZ=1000,hTan=1,vTan=1;
function fitDist(w,h,fw,fh){return Math.max(w/2/(hTan*fw),h/2/(vTan*fh))}
function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();vTan=Math.tan(cam.fov*Math.PI/360);hTan=vTan*cam.aspect;homeZ=fitDist(470,280,.95,.8)}
resize();addEventListener('resize',()=>{resize();if(stack.length===1&&!fly){base.set(0,0,homeZ)}});
const sysView=s=>new THREE.Vector3(s.p.x,s.p.y,s.p.z+(s.soon?70:fitDist(34,40,.95,.9)));
const workView=o=>new THREE.Vector3(o.p.x,o.p.y-(PHONE&&cam.aspect<1?1.6:0),o.p.z+fitDist(CW,CH,.92,.62));
// state
const base=new THREE.Vector3(0,0,homeZ); // camera position along the current view
const pan=new THREE.Vector2(),panT=new THREE.Vector2();
let stack=[{kind:'home'}],sel=null,fly=null,focus=null;
cam.position.copy(base);
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function flyTo(v,dur){dur=(dur||1.5)*(RM?.35:1);fly={a:base.clone(),b:v.clone(),t0:performance.now(),d:dur*1000};panT.set(0,0)}
function cur(){return stack[stack.length-1]}
function crumb(){const c=cur(),parts=['galaxy'];if(c.kind!=='home'){const s=c.kind==='sys'?c.s:FILMSYS;parts.push(s.k);if(c.kind==='work')parts.push(c.o.w.t)}
 $('.crumb').innerHTML=parts.map((p,i)=>i===parts.length-1?'<b>'+esc(p)+'</b>':esc(p)).join(' › ');$('.back').hidden=c.kind==='home';
 const info=$('.info');if(c.kind==='work'){const w=c.o.w;info.querySelector('h2').textContent=w.t;info.querySelector('p').innerHTML=(c.o.i<3?'<span class="new">new · </span>':'')+esc(w.m)+' · Gill James, cinematography';
  info.querySelector('.lk').innerHTML=(w.c?'<a href="case/'+w.c+'/">case study →</a>':'')+(w.u?'<a href="'+w.u+'" target="_blank" rel="noopener">watch ↗</a>':'');info.classList.add('on')}else info.classList.remove('on')}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function go(o){sel=null;hintOff();
 if(o.kind==='sys'){stack=[{kind:'home'},{kind:'sys',s:o}];focus=null;flyTo(sysView(o))}
 else if(o.kind==='work'){stack=[{kind:'home'},{kind:'sys',s:FILMSYS},{kind:'work',o}];focus=o;loadWork(o,true);flyTo(workView(o),1.3)}
 crumb()}
function back(){if(stack.length<2)return;stack.pop();sel=null;const c=cur();focus=null;
 flyTo(c.kind==='home'?new THREE.Vector3(0,0,homeZ):sysView(c.s),1.2);crumb()}
function home(){stack=[{kind:'home'}];sel=null;focus=null;flyTo(new THREE.Vector3(0,0,homeZ),1.8);crumb()}
$('.back').onclick=back;$('.mark').onclick=home;
addEventListener('keydown',e=>{if(e.key==='Escape')back()});
// hint
const hint=$('.hint');let hintT=setTimeout(hintOff,9000);
function hintOff(){hint.classList.add('off')}
function hintSay(h){hint.innerHTML=h;hint.classList.remove('off');clearTimeout(hintT);hintT=setTimeout(hintOff,3500)}
// picking
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),tmp=new THREE.Vector3();
function pick(x,y){ndc.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(ndc,cam);
 const atHome=cur().kind==='home'&&base.z>200;
 const hits=atHome?[]:ray.intersectObjects(works.filter(o=>o.mesh.material.opacity>.25&&cam.position.z-o.p.z>3).map(o=>o.mesh));
 if(hits.length)return hits[0].object.userData.o;
 let best=null,bd=PHONE?46:36;systems.forEach(s=>{tmp.copy(s.p).project(cam);if(tmp.z>1)return;const sx=(tmp.x+1)/2*innerWidth,sy=(1-tmp.y)/2*innerHeight,d=Math.hypot(sx-x,sy-y);if(d<bd){bd=d;best=s}});
 return best}
function tap(x,y){const o=pick(x,y);
 if(!o){sel=null;return}
 if(sel===o){if(o.kind==='sys'&&o.soon){hintSay(o.k+' is coming soon · <b>film</b> is open');flyTo(sysView(o),1.4);stack=[{kind:'home'},{kind:'sys',s:o}];crumb();sel=null;return}go(o);return}
 if(focus===o)return; // already on it
 sel=o;if(!localStorage.getItem('gw-tap2')){hintSay('tap <b>again</b> to fly there');try{localStorage.setItem('gw-tap2','1')}catch(e){}}}
// gestures: tap / drag-pan / pinch + wheel depth
const P=new Map();let g0=null,pinchD=0;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(P.size===1)g0={x:e.clientX,y:e.clientY,t:performance.now(),moved:0,px:panT.x,py:panT.y};
 if(P.size===2){const [a,b]=[...P.values()];pinchD=Math.hypot(a.x-b.x,a.y-b.y);g0&&(g0.moved=99)}});
cv.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(P.size===2){const [a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchD){depth((pinchD-d)*2.2)}pinchD=d;return}
 if(g0&&P.size===1){const dx=e.clientX-g0.x,dy=e.clientY-g0.y;g0.moved=Math.max(g0.moved,Math.hypot(dx,dy));
  if(g0.moved>8){const k=viewSpan()/innerHeight;panT.set(g0.px-dx*k*.6,g0.py+dy*k*.6);clampPan()}}});
function end(e){if(!P.has(e.pointerId))return;P.delete(e.pointerId);
 if(P.size===0&&g0){if(g0.moved<9&&performance.now()-g0.t<600)tap(e.clientX,e.clientY);g0=null}if(P.size<2)pinchD=0}
cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
cv.addEventListener('wheel',e=>{e.preventDefault();depth(e.deltaY*(e.ctrlKey?4:1))},{passive:false});
addEventListener('gesturestart',e=>e.preventDefault());
function viewSpan(){return Math.max(8,(base.z-refZ()))*vTan*2}
function refZ(){const c=cur();return c.kind==='home'?0:c.kind==='work'?c.o.p.z:c.s.p.z}
function clampPan(){const m=viewSpan()*.22;panT.x=Math.max(-m,Math.min(m,panT.x));panT.y=Math.max(-m,Math.min(m,panT.y))}
// continuous depth: move forward/back along the current view, speed proportional to distance
function depth(dy){if(fly){base.copy(cam.position).sub(new THREE.Vector3(pan.x,pan.y,0));fly=null}
 const d=Math.max(12,Math.abs(base.z-refZ())+20);base.z+=dy*d*.0016;
 base.z=Math.max(FILMSYS.p.z-FILM.length*DZ-40,Math.min(homeZ*1.25,base.z));
 // moving in from the galaxy near film counts as being in film (so back/crumb stay true)
 const c=cur();if(c.kind==='home'&&base.z<170&&Math.hypot(base.x-FILMSYS.p.x,base.y-FILMSYS.p.y)<120){stack.push({kind:'sys',s:FILMSYS});crumb()}
 else if(c.kind==='sys'&&base.z>260){stack=[{kind:'home'}];crumb()}
 else if(c.kind==='work'&&Math.abs(base.z-c.o.p.z)>90){stack.pop();focus=null;crumb()}
 hintOff()}
// pinch from home gently drifts the view toward film so "pinch in" lands somewhere
function drift(){const c=cur();if(c.kind==='home'&&!fly&&base.z<homeZ*.9){const k=1-Math.min(1,base.z/homeZ);base.x+=(FILMSYS.p.x*k*1.2-base.x)*.04;base.y+=(FILMSYS.p.y*k*1.2-base.y)*.04}}
// labels + loop
const labels=new THREE.Vector3();let last=performance.now(),frames=0,fps=0,fpsT=last;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;frames++;if(now-fpsT>1000){fps=frames*1000/(now-fpsT);frames=0;fpsT=now}
 if(fly){const t=Math.min(1,(now-fly.t0)/fly.d),e=ease(t);base.lerpVectors(fly.a,fly.b,e);
  // arc slightly outward mid-flight for depth sensation
  base.z+=Math.sin(e*Math.PI)*Math.abs(fly.a.z-fly.b.z)*.06;if(t>=1)fly=null}
 drift();
 pan.lerp(panT,1-Math.pow(.001,dt));const idle=Math.sin(now*.00023)*viewSpan()*.006;
 cam.position.set(base.x+pan.x+idle,base.y+pan.y+idle*.6,base.z);
 cam.lookAt(base.x+pan.x*.6,base.y+pan.y*.6,base.z-100);
 // works: fade those right in front of / behind the camera, lazy-load as you approach
 for(const o of works){const dz=cam.position.z-o.p.z;let a=o.dim*Math.min(1,Math.max(0,(dz-3)/10));
  if(focus&&o!==focus&&o.p.z>focus.p.z-1&&dz<60)a*=.12;
  if(focus===o)a=1;
  o.mesh.material.opacity=a;o.edge.material.opacity=(o.i<3?.8:.22)*a+(sel===o?.8:0);o.edge.material.color.set(sel===o||o.i<3?0x55DAA1:0x8899aa);
  if(dz>0&&dz<(PHONE?220:300))loadWork(o,false);
  const fa=focus===o?a*.9:(dz<45?a*.35:0);o.frames.forEach(f=>f.material.opacity=f.material.map?fa:fa*.3)}
 systems.forEach(s=>{const pulse=sel===s?1.35+Math.sin(now*.008)*.15:1;s.s.scale.setScalar((s.soon?30:44)*pulse);s.s.material.opacity=Math.min(1,Math.max(.06,(cam.position.z-s.p.z-60)/400));s.s.material.color.set(sel===s?MINT:(s.soon?0x9fb4d8:0xffffff));
  labels.copy(s.p).project(cam);const dz=cam.position.z-s.p.z;const vis=labels.z<1&&dz>(s.soon?25:110);
  s.el.style.opacity=vis?Math.min(1,(dz-25)/60)*(s.soon?.6:1):0;s.el.classList.toggle('sel',sel===s);
  if(vis)s.el.style.transform='translate(-50%,0) translate('+((labels.x+1)/2*innerWidth).toFixed(1)+'px,'+((1-labels.y)/2*innerHeight+14).toFixed(1)+'px)'});
 R.render(scene,cam)}
requestAnimationFrame(frame);crumb();
window.__world={state:()=>({level:cur().kind,crumb:$('.crumb').textContent,z:base.z,fps:Math.round(fps),sel:sel?(sel.k||sel.w.k):null,flying:!!fly}),
 screen:k=>{const o=k.startsWith('w')?works.find(w=>w.w.k===k).p:systems.find(s=>s.k===k).p;tmp.copy(o).project(cam);return {x:(tmp.x+1)/2*innerWidth,y:(1-tmp.y)/2*innerHeight}}};
