/* gill james · site-v4-galaxy-nav · galaxy.js — a NAVIGABLE galaxy added AROUND and IN FRONT of site-v4-c. It never restyles or
   replaces v4-c: the boards, chapter pages, player, sky sheet, select.js / sheet.js / sound-one.js and the dock are untouched.
   - HOME (no hash, or #galaxy): the galaxy is the mark. Gill's signature ᑕᐣᓯ is drawn as a constellation (bright node stars,
     thin lines), with the spiral dust, nebula layers, far stars and near motes around it as atmosphere, all at real depths.
   - Each chapter is a star system sitting on one of the signature's nodes, its works orbiting as planets.
   - YOU move: one finger / mouse drag travels across the galaxy (with inertia, no snapping on release); pinch, wheel or a
     trackpad flies forward / back in depth toward the point under your fingers. Close to a system the flight leans onto it and,
     past a depth, carries straight on into v4-c's own constellation for that chapter (the planets become its stars), where
     v4-c's own pinch takes you on to its boards. Pinch in (or −, or the galaxy pill) on the constellation flies back out.
   - One press selects a system (its label brightens); a press on the selected one flies to it. No hover. No free orbit.
   - The mark top-left glides back to the whole galaxy.
   - prefers-reduced-motion, ?gx=0, or no WebGL: this file does nothing and the site is exactly site-v4-c. */
const D=document.documentElement,RM=matchMedia('(prefers-reduced-motion: reduce)'),QS=new URLSearchParams(location.search);
const homeHash=h=>{h=h==null?location.hash:h;return h===''||h==='#'||h==='#galaxy'};
const off=()=>D.classList.remove('gx-boot');
if(RM.matches||QS.get('gx')==='0'){off()}else{boot().catch(e=>{console.warn('galaxy off:',e&&e.message);off();D.classList.remove('gx-on')})}

async function boot(){
const THREE=await import('../vendor/three.module.min.js');
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[].slice.call((r||document).querySelectorAll(s));
const PHONE=matchMedia('(pointer:coarse)').matches||Math.min(innerWidth,innerHeight)<600;
const MINT=new THREE.Color('#55DAA1');
/* ---------- chapters from v4-c's own DOM (names, counts, glyphs, works, thumbnails) ---------- */
const PICKS={film:['w0','w2','w4','w3']}; /* Reel 2026, Coca-Cola, BMW Legends, AXE Stay Gold */
const NEW={film:['w0']};
const SYS=$$('.ch').map(el=>{const k=el.dataset.k,g=$('.head svg.glyph',el),t=(g&&g.style.getPropertyValue('--t')||'200,225,255').split(',').map(Number);
  const items=$$('.it',el).map((it,i)=>{const im=$('.vis img',it);return{k:it.dataset.k,i,title:(($('.cap b',it)||{}).textContent||''),src:im?(im.getAttribute('src')||im.dataset.src):null,el:it}});
  return{k,el,name:($('.nm',el)||{}).textContent||k,ct:($('.ct',el)||{}).textContent||'',glyph:g,tint:new THREE.Color(t[0]/255,t[1]/255,t[2]/255),items,max:+el.dataset.max||2,
    picks:PICKS[k]||[],news:NEW[k]||[]}});
const BYK={};SYS.forEach(s=>BYK[s.k]=s);
/* the galaxy lands on v4-c's own constellation (L1 star chart); v4-c takes it from there */
const BOARD_LV=s=>Math.min(1,s.max);
/* ---------- the signature ᑕᐣᓯ as a constellation: node points traced on Noto Sans Canadian Aboriginal (OFL), centred, y down.
   The five systems sit on its nodes (film: ᑕ top corner, photo: ᑕ foot, about: ᐣ, sound: ᓯ foot, objects: ᓯ top). Also mark.svg. */
const SIGN=[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97],[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5],[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]],SIGE=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[7,8],[8,9],[9,10],[10,11],[12,13],[13,14],[14,15],[15,16],[16,17]],SIGSYS={"film":1,"photo":5,"about":9,"sound":12,"objects":17};
const MARK='<svg class="gx-mk" viewBox="-236 -126 472 252" aria-hidden="true"><path d="M-58.5 -96L-156.5 -95M-156.5 -95L-203.5 -61M-203.5 -61L-213.5 1M-213.5 1L-203.5 63M-203.5 63L-156.5 97M-156.5 97L-58.5 97M-26.5 -97L25.5 -94M25.5 -94L44.5 -51M44.5 -51L25.5 -8M25.5 -8L-26.5 -5M99.5 105L99.5 20M99.5 20L149.5 15M149.5 15L191.5 -11M191.5 -11L211.5 -55M211.5 -55L214.5 -105" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" opacity=".55"/><g fill="currentColor"><circle cx="-58.5" cy="-96" r="9"/><circle cx="-156.5" cy="-95" r="15"/><circle cx="-203.5" cy="-61" r="9"/><circle cx="-213.5" cy="1" r="9"/><circle cx="-203.5" cy="63" r="9"/><circle cx="-156.5" cy="97" r="15"/><circle cx="-58.5" cy="97" r="9"/><circle cx="-26.5" cy="-97" r="9"/><circle cx="25.5" cy="-94" r="9"/><circle cx="44.5" cy="-51" r="15"/><circle cx="25.5" cy="-8" r="9"/><circle cx="-26.5" cy="-5" r="9"/><circle cx="99.5" cy="105" r="15"/><circle cx="99.5" cy="20" r="9"/><circle cx="149.5" cy="15" r="9"/><circle cx="191.5" cy="-11" r="9"/><circle cx="211.5" cy="-55" r="9"/><circle cx="214.5" cy="-105" r="15"/></g></svg>';
const SK=.2; /* signature units → world units (the whole mark is ~86 wide, ~42 tall, at z=0) */
const SIGW=SIGN.map(p=>new THREE.Vector3(p[0]*SK,-p[1]*SK,0));
/* ---------- DOM layer ---------- */
const L=document.createElement('div');L.className='gx';L.setAttribute('role','region');L.setAttribute('aria-label','the galaxy: drag to travel, pinch or scroll to fly in; every chapter is a star system');
L.innerHTML='<canvas class="gx-c" aria-hidden="true"></canvas><div class="gx-ls"></div><button type="button" class="gx-mark" aria-label="the whole galaxy">'+MARK+'</button><p class="gx-crumb" aria-live="polite">the galaxy</p>'+
  '<nav class="gx-cases" aria-label="case studies"><span>case studies</span><a href="../site-v4-galaxy-nav/case/reel-2026/">Reel 2026</a><a href="../site-v4-galaxy-nav/case/coca-cola/">Coca-Cola</a><a href="../site-v4-galaxy-nav/case/bmw/">BMW</a><a href="../site-v4-galaxy-nav/case/axe/">AXE</a></nav>'+
  '<p class="gx-hint"><span class="gx-gest" aria-hidden="true"><i></i><i></i></span><span class="gx-ht"></span></p><button type="button" class="gx-surf" aria-label="down to the water: site-v4-c home">the water ↓</button>';
document.body.appendChild(L);
/* a 'case study' link in v4-c's opened work, for the picks that have one (added beside v4-c's own meta line) */
const CASE={film:{w0:'reel-2026',w2:'coca-cola',w3:'axe',w4:'bmw'}};
(()=>{const imm=document.querySelector('.imm'),m=imm&&imm.querySelector('.imm-m');if(!m)return;const a=document.createElement('a');a.className='gx-case';a.hidden=true;a.textContent='case study →';m.after(a);
  const up=()=>{const d=window.__dive&&__dive.state(),c=d&&d.w&&CASE[d.k]&&CASE[d.k][d.w];if(a.hidden!==!c)a.hidden=!c;const h=c?'../site-v4-galaxy-nav/case/'+c+'/':'';if(c&&a.getAttribute('href')!==h)a.setAttribute('href',h)};
  new MutationObserver(up).observe(imm,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true,characterData:true});addEventListener('hashchange',up);up()})();
const CV=$('.gx-c',L),LS=$('.gx-ls',L),CRUMB=$('.gx-crumb',L),HINT=$('.gx-hint',L),HT=$('.gx-ht',L);
const BACK=document.createElement('button');BACK.type='button';BACK.className='gx-back';BACK.hidden=true;BACK.innerHTML=MARK+'galaxy';BACK.setAttribute('aria-label','back out to the galaxy');document.body.appendChild(BACK);
SYS.forEach(s=>{const b=document.createElement('button');b.type='button';b.className='gx-l';b.dataset.k=s.k;b.setAttribute('aria-label',s.name+': '+s.ct+'. Press to select, press again to fly in');
  b.innerHTML='<b>'+s.name+'</b><small>'+s.ct+'</small><i>press again to fly in</i>';LS.appendChild(b);s.lab=b;
  s.pl=s.picks.map(w=>{const it=s.items.find(x=>x.k===w);const p=document.createElement('span');p.className='gx-p';p.textContent=it?it.title.replace(/ · .*$/,''):w;LS.appendChild(p);return{w,el:p}})});
const LV=$('.zoom .lv');const setLv=t=>{if(LV&&LV.dataset.gx!==t)LV.dataset.gx=t};
const setMode=m=>{mode=m;if(L.dataset.mode!==m)L.dataset.mode=m};
/* ---------- renderer ---------- */
let R;try{R=new THREE.WebGLRenderer({canvas:CV,antialias:false,alpha:false,powerPreference:'high-performance'})}catch(e){throw new Error('no webgl')}
R.setClearColor(0x03050a,1);R.outputColorSpace=THREE.LinearSRGBColorSpace;
/* render scale: capped by a pixel budget (the galaxy is soft light, so a big window renders at a lower internal resolution) */
const PRmax=Math.min(devicePixelRatio||1,PHONE?1.5:1.75),PXB=PHONE?7e5:5e5;let PR=PRmax;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,2400);scene.add(cam);
{const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(32,64,0,32,64,96);g.addColorStop(0,'#131d33');g.addColorStop(.55,'#090f1d');g.addColorStop(1,'#03050a');x.fillStyle=g;x.fillRect(0,0,64,128);scene.background=new THREE.CanvasTexture(c)}
const U={uTime:{value:0},uScale:{value:600},uCam:{value:new THREE.Vector3()}};
let W=1,H=1;
/* soft round points (additive). uWrap > 0: the layer tiles around the camera in x/y (near motes: always some to fly through) */
const PV='attribute float aSize;attribute vec3 aColor;attribute float aAlpha;attribute float aPh;uniform float uTime;uniform float uScale;uniform float uOp;uniform float uTw;uniform float uDrift;uniform vec3 uCam;uniform vec2 uWrap;varying vec3 vC;varying float vA;'+
 'void main(){vec3 p=position+uDrift*vec3(sin(uTime*.13+aPh*7.),cos(uTime*.11+aPh*5.)*.6,sin(uTime*.09+aPh*3.));if(uWrap.x>0.){p.xy=uCam.xy+mod(p.xy-uCam.xy+uWrap,2.*uWrap)-uWrap;}vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;'+
 'float s=aSize*uScale/max(.1,-mv.z);gl_PointSize=clamp(s,1.,40.);vC=aColor;vA=aAlpha*uOp*min(1.,s*s*.6)*(1.-.85*smoothstep(16.,40.,s))*(1.-uTw+uTw*(.62+.38*sin(uTime*(1.3+aPh*2.)+aPh*40.)));}';
const PF='varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d2=dot(q,q);if(d2>.25)discard;float a=1.-d2*4.;a*=a*a;gl_FragColor=vec4(vC,a*vA);}';
function pointsMat(o){o=o||{};return new THREE.ShaderMaterial({uniforms:{uTime:U.uTime,uScale:U.uScale,uCam:U.uCam,uOp:{value:o.op==null?1:o.op},uTw:{value:o.tw||0},uDrift:{value:o.drift||0},uWrap:{value:new THREE.Vector2(o.wrap?o.wrap[0]:0,o.wrap?o.wrap[1]:0)}},
  vertexShader:PV,fragmentShader:PF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})}
function cloud(n,fill){const P=new Float32Array(n*3),C=new Float32Array(n*3),S=new Float32Array(n),A=new Float32Array(n),H2=new Float32Array(n),c=new THREE.Color();
  for(let i=0;i<n;i++){const r=fill(i,c);P[i*3]=r[0];P[i*3+1]=r[1];P[i*3+2]=r[2];C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b;S[i]=r[3];A[i]=r[4];H2[i]=Math.random()}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aColor',new THREE.BufferAttribute(C,3));
  g.setAttribute('aSize',new THREE.BufferAttribute(S,1));g.setAttribute('aAlpha',new THREE.BufferAttribute(A,1));g.setAttribute('aPh',new THREE.BufferAttribute(H2,1));return g}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,eo=t=>1-Math.pow(1-t,3),clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rnd=(a,b)=>a+Math.random()*(b-a),gauss=()=>{let u=0;for(let i=0;i<4;i++)u+=Math.random();return (u-2)/1.15};
const pts=(g,m)=>{const p=new THREE.Points(g,m);p.frustumCulled=false;return p};
/* depth layers, far → near. Every one sits at a real depth, so travelling and flying give true parallax. */
/* L0 far stars: a deep shell (barely moves) */
scene.add(pts(cloud(PHONE?1500:2400,(i,c)=>{const u=Math.random()*2-1,t=Math.random()*Math.PI*2,r=rnd(700,1100),s=Math.sqrt(1-u*u);
  c.setRGB(.82+Math.random()*.18,.88+Math.random()*.1,1);return[Math.cos(t)*s*r,Math.sin(t)*s*r*.8,-Math.abs(u)*r*.9-200,rnd(1.6,4.2),rnd(.35,.95)]}),pointsMat({tw:.55})));
/* L1 back dust: a sparse sheet well behind the galaxy */
scene.add(pts(cloud(PHONE?900:1500,(i,c)=>{c.setRGB(.55,.66,1);if(i%11===0)c.setRGB(.7,.6,1);return[rnd(-190,190),rnd(-130,130),rnd(-120,-45),rnd(.5,1.3),rnd(.15,.45)]}),pointsMat({op:.8})));
/* L2 the galaxy disc: two spiral arms of dust round the signature, tilted back, turning slowly */
const BG=new THREE.Group();BG.rotation.x=-.5;scene.add(BG);const SPIN=new THREE.Group();BG.add(SPIN);
const ARMS=2,GR=96;
SPIN.add(pts(cloud(PHONE?6200:11000,(i,c)=>{const arm=i%ARMS,f=Math.pow(Math.random(),.75),th=f*3.2*Math.PI,r=8+f*GR,
  a=th+arm*Math.PI*2/ARMS+gauss()*(.10+.10*(1-f)),x=Math.cos(a)*r+gauss()*r*.04,y=Math.sin(a)*r+gauss()*r*.04,z=gauss()*(2.2*(1-f)+.7);
  const warm=Math.max(0,1-f*2.4);if(Math.random()<.06)c.copy(MINT).lerp(new THREE.Color(1,1,1),.35);else if(Math.random()<.08)c.setRGB(.7,.6,1);else c.setRGB(.55+.45*warm,.68+.22*warm,1-.25*warm);
  const qu=.3+.7*smooth(16,52,r); /* quieter where the signature is: the mark leads, the dust is its atmosphere */
  return[x,y,z,rnd(.3,.8)*(1+warm*.6),rnd(.22,.6)*(.5+.5*(1-f))*qu]}),pointsMat({op:.8,tw:.15})));
SPIN.add(pts(cloud(PHONE?900:1600,(i,c)=>{const r=Math.abs(gauss())*7,t=Math.random()*Math.PI*2;c.setRGB(1,.86+Math.random()*.1,.7+Math.random()*.2);
  return[Math.cos(t)*r,Math.sin(t)*r,gauss()*r*.4,rnd(.25,.6),rnd(.15,.45)]}),pointsMat({op:.22})));
/* L3 nebula light at several depths (soft sprites) */
function glowTex(stops){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);stops.forEach(s=>g.addColorStop(s[0],s[1]));x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);return t}
const NEB=glowTex([[0,'rgba(255,255,255,1)'],[.25,'rgba(255,255,255,.45)'],[.6,'rgba(255,255,255,.1)'],[1,'rgba(255,255,255,0)']]);
const STAR=glowTex([[0,'rgba(255,255,255,1)'],[.08,'rgba(255,255,255,.95)'],[.2,'rgba(255,255,255,.4)'],[.45,'rgba(255,255,255,.1)'],[1,'rgba(255,255,255,0)']]);
const nebs=[];[[-34,8,-30,80,'#3a5fb0',.15],[38,-6,-18,70,'#4a3d9a',.13],[4,-20,-60,120,'#20305c',.18],[-8,26,-10,50,'#2f7f78',.09],[24,18,-36,56,'#5a4aa8',.09],[-56,-22,-24,60,'#3c78b8',.09],
  [60,30,-50,70,'#2a6f8a',.10],[-20,-34,6,34,'#4fa8a0',.05],[30,-28,18,30,'#3f6cc0',.05],[-46,30,26,28,'#5b4fb0',.045],[0,4,-8,64,'#24406e',.10]].forEach(n=>{
  const m=new THREE.SpriteMaterial({map:NEB,color:n[4],transparent:true,opacity:n[5],depthWrite:false,blending:THREE.AdditiveBlending});const s=new THREE.Sprite(m);s.position.set(n[0],n[1],n[2]);s.scale.set(n[3],n[3]*.7,1);s.userData.b=n[3];s.userData.o=n[5];scene.add(s);nebs.push(s)});
/* L4 the signature: node stars + thin lines + a little dust along the strokes */
{const lp=[];SIGE.forEach(e=>{lp.push(SIGW[e[0]],SIGW[e[1]])});
  const lm=new THREE.LineBasicMaterial({color:0xc4d8ff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
  const ls=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp),lm);ls.frustumCulled=false;scene.add(ls);
  const sysN=new Set(Object.values(SIGSYS));
  scene.add(pts(cloud(SIGW.length,(i,c)=>{c.setRGB(.9,.95,1);const p=SIGW[i];return[p.x,p.y,p.z,sysN.has(i)?0:1.4,sysN.has(i)?0:1]}),pointsMat({tw:.25})));
  scene.add(pts(cloud(SIGW.length,(i,c)=>{c.setRGB(.55,.7,1);const p=SIGW[i];return[p.x,p.y,p.z,sysN.has(i)?0:4,.2]}),pointsMat({})));
  scene.add(pts(cloud(PHONE?700:1200,(i,c)=>{const e=SIGE[i%SIGE.length],a=SIGW[e[0]],b=SIGW[e[1]],t=Math.random();if(i%13===0)c.copy(MINT);else c.setRGB(.7,.82,1);
    return[a.x+(b.x-a.x)*t+gauss()*1.1,a.y+(b.y-a.y)*t+gauss()*1.1,gauss()*1.4,rnd(.16,.4),rnd(.25,.6)]}),pointsMat({tw:.3,drift:.25})));
}
/* L5 near motes: between you and the galaxy, tiled around the camera so they stream past in every flight */
scene.add(pts(cloud(PHONE?520:800,(i,c)=>{c.setRGB(.8,.9,1);if(i%9===0)c.copy(MINT);return[rnd(-110,110),rnd(-80,80),Math.pow(Math.random(),1.6)*170+3,rnd(.1,.26),rnd(.35,.8)]}),pointsMat({drift:.6,wrap:[110,80]})));
/* streaks: only in fast flight, attached to the camera */
const NS=PHONE?110:160,stP=new Float32Array(NS*6),stC=new Float32Array(NS*6),stD=[];
for(let i=0;i<NS;i++){const a=Math.random()*Math.PI*2,r=rnd(1.2,7),z=rnd(-70,-2),len=rnd(1.5,4);stD.push({x:Math.cos(a)*r,y:Math.sin(a)*r*.8,z,len});const g=rnd(.5,1);
  stC.set([.7*g,.85*g,g,0,0,0],i*6)}
const stG=new THREE.BufferGeometry();stG.setAttribute('position',new THREE.BufferAttribute(stP,3));stG.setAttribute('color',new THREE.BufferAttribute(stC,3));
const stM=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const streaks=new THREE.LineSegments(stG,stM);streaks.frustumCulled=false;cam.add(streaks);
/* ---------- star systems (on the signature's nodes) ---------- */
const PV2='attribute float aSize;attribute vec3 aColor;attribute float aAlpha;attribute float aR;attribute float aPh;attribute float aW;uniform float uTime;uniform float uScale;uniform float uOp;uniform vec3 uC;uniform mat3 uTilt;varying vec3 vC;varying float vA;'+
 'void main(){float a=aPh+aW*uTime;vec3 p=uC+uTilt*vec3(cos(a)*aR,0.,sin(a)*aR);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float s=aSize*uScale/max(.1,-mv.z);gl_PointSize=clamp(s,1.5,120.);vC=aColor;vA=aAlpha*uOp;}';
const CAP=r=>6+r*5;
function slot(s){/* picks on the inner ring, the rest by age outwards */const order=s.items.map(x=>x.k),pk=s.picks.filter(w=>order.includes(w)),rest=order.filter(w=>!pk.includes(w)),seq=pk.concat(rest),out={};
  let ring=0,inr=0;seq.forEach((w,j)=>{if(inr>=CAP(ring)){ring++;inr=0}out[w]={ring,inr};inr++});
  const per={};seq.forEach(w=>{const r=out[w].ring;per[r]=(per[r]||0)+1});seq.forEach(w=>out[w].n=per[out[w].ring]);return out}
/* orbits lean toward you (rings read as soft ellipses from the front), each system its own lean */
const TILT={film:[1.12,.22],photo:[1.02,-.3],about:[1.18,.45],sound:[1.06,.12],objects:[1.14,-.4]};
SYS.forEach((s,si)=>{const sl=slot(s),n=s.items.length;s.orb=[];const big=s.k==='film'?1.25:1;
  const P=new Float32Array(Math.max(1,n)*3),C=new Float32Array(n*3),Sz=new Float32Array(n),A=new Float32Array(n),Rr=new Float32Array(n),Ph=new Float32Array(n),Wv=new Float32Array(n);
  s.items.forEach((it,i)=>{const q=sl[it.k],r=(1.7+q.ring*.95)*big,ph=q.inr/q.n*Math.PI*2+q.ring*.9+si,w=.16/Math.sqrt(r);const pick=s.picks.includes(it.k),nw=s.news.includes(it.k);
    const age=n>1?i/(n-1):0,c=new THREE.Color(1,1,1).lerp(s.tint,.35);if(nw)c.copy(MINT);
    C.set([c.r,c.g,c.b],i*3);Sz[i]=pick?.7:(.4-.1*age)*(s.k==='about'?1.3:1);A[i]=pick?1:(.95-.4*age);Rr[i]=r;Ph[i]=ph;Wv[i]=w;s.orb[i]={r,ph,w}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));['aColor',C,3,'aSize',Sz,1,'aAlpha',A,1,'aR',Rr,1,'aPh',Ph,1,'aW',Wv,1].forEach((v,i,a)=>{if(i%3===0)g.setAttribute(v,new THREE.BufferAttribute(a[i+1],a[i+2]))});
  const tt=TILT[s.k]||[1.1,0],tilt=new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(tt[0],0,tt[1])));s.tilt=tilt;
  s.c=(SIGW[SIGSYS[s.k]]||new THREE.Vector3(0,0,0)).clone();
  const m=new THREE.ShaderMaterial({uniforms:{uTime:U.uTime,uScale:U.uScale,uOp:{value:1},uC:{value:s.c},uTilt:{value:tilt}},vertexShader:PV2,fragmentShader:PF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  s.pts=new THREE.Points(g,m);s.pts.frustumCulled=false;scene.add(s.pts);
  const rings=new THREE.Group();const maxRing=Math.max.apply(null,Object.values(sl).map(q=>q.ring).concat([0]));s.rmax=(1.7+maxRing*.95)*big;
  for(let r=0;r<=maxRing;r++){const rr=(1.7+r*.95)*big,pp=[];for(let j=0;j<=72;j++){const a=j/72*Math.PI*2;pp.push(new THREE.Vector3(Math.cos(a)*rr,0,Math.sin(a)*rr).applyMatrix3(tilt))}
    rings.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pp),new THREE.LineBasicMaterial({color:s.tint,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false})))}
  s.rings=rings;rings.position.copy(s.c);scene.add(rings);
  s.core=new THREE.Sprite(new THREE.SpriteMaterial({map:STAR,color:new THREE.Color(1,1,1).lerp(s.tint,.25),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:NEB,color:s.tint,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.core.position.copy(s.c);s.halo.position.copy(s.c);scene.add(s.halo);scene.add(s.core);s.bright=s.k==='film'?1.25:1;s.selA=0});
function planetPos(s,i,t,out){const o=s.orb[i],a=o.ph+o.w*t;return (out||new THREE.Vector3()).set(Math.cos(a)*o.r,0,Math.sin(a)*o.r).applyMatrix3(s.tilt).add(s.c)}
/* ---------- textures (decoded off the main thread where possible) ---------- */
const TEX={},abs=u=>new URL(u,document.baseURI).href;
function tex(src){if(!src)return null;const u=abs(src);if(TEX[u])return TEX[u];const e={t:null,w:1,h:1,p:null};TEX[u]=e;
  e.p=(window.createImageBitmap?fetch(u).then(r=>r.blob()).then(b=>createImageBitmap(b,{imageOrientation:'flipY'})).then(bm=>{const t=new THREE.Texture(bm);t.flipY=false;return t})
   :new Promise((ok,no)=>new THREE.TextureLoader().load(u,ok,null,no))).then(t=>{t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;const im=t.image;e.w=im.width;e.h=im.height;e.t=t;try{R.initTexture(t)}catch(x){}return e}).catch(()=>e);return e}
function preload(s,n){s.items.slice(0,n||24).forEach(it=>tex(it.src))}
/* ---------- tiles: a planet dot that becomes the board's star / poster tile ---------- */
const TV='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const TF='uniform sampler2D uMap;uniform float uHas;uniform vec2 uRep;uniform vec2 uOff;uniform vec2 uPx;uniform float uRad;uniform float uImg;uniform float uOp;uniform vec3 uDot;varying vec2 vUv;'+
 'float sd(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}'+
 'void main(){vec2 p=(vUv-.5)*uPx;float d=sd(p,uPx*.5,uRad);float m=clamp(.5-d,0.,1.);vec3 tx=uHas>.5?texture2D(uMap,vUv*uRep+uOff).rgb:vec3(.051,.082,.11);'+
 'float rr=length(vUv-.5)*2.;vec3 dc=mix(vec3(1.),uDot,smoothstep(.0,1.,rr));float da=mix(1.-smoothstep(.3,1.,rr),1.,uImg);gl_FragColor=vec4(mix(dc,tx,uImg),m*uOp*da);}';
const PLANE=new THREE.PlaneGeometry(1,1),tiles=[];
const VEIL=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x04070b,transparent:true,opacity:0,depthTest:false,depthWrite:false}));VEIL.renderOrder=9;VEIL.frustumCulled=false;VEIL.visible=false;scene.add(VEIL);
const LINE=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(128*3),3)),new THREE.LineBasicMaterial({color:0xd6e4ff,transparent:true,opacity:0,depthTest:false,depthWrite:false}));LINE.renderOrder=9.5;LINE.frustumCulled=false;LINE.visible=false;scene.add(LINE);
function tileMesh(){const m=new THREE.ShaderMaterial({uniforms:{uMap:{value:null},uHas:{value:0},uRep:{value:new THREE.Vector2(1,1)},uOff:{value:new THREE.Vector2()},uPx:{value:new THREE.Vector2(10,10)},uRad:{value:5},uImg:{value:0},uOp:{value:0},uDot:{value:new THREE.Color()}},
  vertexShader:TV,fragmentShader:TF,transparent:true,depthTest:false,depthWrite:false});const me=new THREE.Mesh(PLANE,m);me.renderOrder=10;me.frustumCulled=false;me.visible=false;scene.add(me);return me}
function cover(me,e,rw,rh){const u=me.material.uniforms;if(!e||!e.t){u.uHas.value=0;return}u.uMap.value=e.t;u.uHas.value=1;const ia=e.w/e.h,ra=rw/rh;
  if(ia>ra){u.uRep.value.set(ra/ia,1);u.uOff.value.set((1-ra/ia)/2,0)}else{u.uRep.value.set(1,ia/ra);u.uOff.value.set(0,(1-ia/ra)/2)}}
/* board rects: v4-c's real tiles (the .vis box, or the 9px star of the constellation list) that are on screen */
function boardRects(s){const out=[],lr=L.getBoundingClientRect();s.items.forEach((it,i)=>{const v=$('.vis',it.el);if(!v)return;const r=v.getBoundingClientRect();
  if(r.width<2||r.bottom<lr.top+2||r.top>lr.bottom-2||r.right<0||r.left>innerWidth)return;out.push({i,x:r.left-lr.left,y:r.top-lr.top,w:r.width,h:r.height,img:it.el.querySelector('.vis img'),vid:v.querySelector('video')})});return out}
/* final pose: straight in front of the system (the camera always faces -z, so arriving is a pure move-in) */
const DF=11,DT=4.5,QID=new THREE.Quaternion();
function finalPose(s){return{pos:s.c.clone().add(new THREE.Vector3(0,0,DF)),q:QID,look:s.c.clone()}}
function rectWorld(fp,r){const th=Math.tan(cam.fov*Math.PI/360),hh=DT*th,hw=hh*cam.aspect;const cx=(r.x+r.w/2)/W*2-1,cy=1-(r.y+r.h/2)/H*2;
  const p=new THREE.Vector3(cx*hw,cy*hh,-DT).applyQuaternion(fp.q).add(fp.pos);return{p,w:r.w/W*2*hw,h:r.h/H*2*hh}}
/* ---------- navigation state ----------
   nav.{x,y}: where you are over the galaxy; nav.z: your height above its plane. Drag moves x/y (the point under your finger stays
   under it), pinch / wheel scales z about the point under your fingers. Velocities carry on after release and fade by friction. */
let mode='off',sel=null,F=null,lastK=null,lastT=performance.now(),T=0,raf=0;
const nav={x:0,y:0,z:100,vx:0,vy:0,vz:0,tx:0,ty:0,wz:0,wfx:0,wfy:0,used:0};
let HOMEZ=100,ZMAX=160,ZCAP=22,ZMAG=58,ZFLOOR=26,TH=.5,AS=1,glide=null;
const BX=78,BY=52; /* how far you can travel from the centre (no rubber band: you simply slow to a stop at the edge) */
const tmp=new THREE.Vector3(),tmp2=new THREE.Vector3(),pv=new THREE.Vector3(),nv=new THREE.Vector3();
function layout(){const a=W/H,port=a<.9;cam.aspect=a;cam.fov=port?58:46;cam.updateProjectionMatrix();TH=Math.tan(cam.fov*Math.PI/360);AS=a;
  /* home: the whole signature with room for its labels */
  const zw=(86*(port?1.2:1.34))/(2*TH*a),zh=(42*(port?2.4:1.9))/(2*TH);HOMEZ=Math.max(zw,zh);ZMAX=HOMEZ*1.55;
  /* arriving depth: the system's outer orbit fills ~62% of the short half of the view */
  const hs=Math.min(TH*a,TH);ZCAP=4.6/(.62*hs);ZMAG=Math.min(HOMEZ*.62,ZCAP*2.7);ZFLOOR=ZCAP*1.18;
  U.uScale.value=H*PR/(2*TH)}
function resize(){const r=L.getBoundingClientRect();W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));const pr=Math.min(PRmax,Math.sqrt(PXB/(W*H)));if(pr===PR&&W===resize.w&&H===resize.h)return;
  const atHome=Math.abs(nav.z-HOMEZ)<.5&&Math.abs(nav.x)<.5;resize.w=W;resize.h=H;PR=pr;R.setPixelRatio(PR);R.setSize(W,H,false);layout();if(atHome||!nav.used){nav.z=HOMEZ;nav.x=0;nav.y=0}nav.z=clamp(nav.z,ZCAP,ZMAX)}
const wpp=()=>2*nav.z*TH/H; /* world units per screen px on the galaxy plane */
function screenToWorld(sx,sy,o){o=o||{};const nx=sx/W*2-1,ny=1-sy/H*2;o.x=nav.x+nx*nav.z*TH*AS;o.y=nav.y+ny*nav.z*TH;return o}
function nearest(wx,wy,r){let best=null,bd=r;SYS.forEach(s=>{const d=Math.hypot(s.c.x-wx,s.c.y-wy);if(d<bd){bd=d;best=s}});return best}
const fw={};
/* zoom by factor f (<1 = in) about screen point sx,sy. Close to a system the move leans onto it, and at ZCAP it flies in. */
function zoomAt(f,sx,sy){if(mode!=='home'||F)return;const z0=nav.z;let z1=clamp(z0*f,ZFLOOR*.5,ZMAX);if(z1===z0)return;
  screenToWorld(sx,sy,fw);const k=z1/z0;nav.x=fw.x-(fw.x-nav.x)*k;nav.y=fw.y-(fw.y-nav.y)*k;
  if(z1<z0&&z1<ZMAG){const s=nearest(fw.x,fw.y,Math.max(8,z0*TH*Math.max(AS,1)*1.05));
    if(s){const fr=clamp((z0-z1)/Math.max(.001,z0-ZCAP),0,1);nav.x+=(s.c.x-nav.x)*fr;nav.y+=(s.c.y-nav.y)*fr;if(sel!==s.k)select(s.k);
      if(z1<=ZCAP+.05){nav.z=ZCAP;nav.x=s.c.x;nav.y=s.c.y;flyIn(s.k,true);return}}
    else z1=Math.max(z1,ZFLOOR)}
  nav.z=z1;bound();used()}
function bound(){if(nav.x<-BX||nav.x>BX){nav.x=clamp(nav.x,-BX,BX);nav.vx=0}if(nav.y<-BY||nav.y>BY){nav.y=clamp(nav.y,-BY,BY);nav.vy=0}}
function used(){glide=null;if(!nav.used){nav.used=1;ui()}}
function stopAll(){nav.vx=nav.vy=nav.vz=0;nav.wz=0}
/* ---------- frame ---------- */
function frame(now){raf=0;const dt=Math.min(.05,(now-lastT)/1000);lastT=now;T+=dt;U.uTime.value=T;
  SPIN.rotation.z+=dt*.01;
  let speed=0,dir=1;
  if(F){let t=clamp((now-F.t0)/F.dur,0,1);F.t=t;flyStep(F,t,now);speed=F.spd||0;dir=F.dir;if(t>=1&&!F.done){F.done=true;F.end()}}
  else{
    if(mode==='home'){
      if(glide){const t=clamp((now-glide.t0)/glide.dur,0,1),e=ease(t);nav.x=glide.x0+(glide.x1-glide.x0)*e;nav.y=glide.y0+(glide.y1-glide.y0)*e;nav.z=glide.z0*Math.pow(glide.z1/glide.z0,e);if(t>=1)glide=null}
      else if(!drag){/* inertia: travel and depth both carry on and fade */
        const fr=Math.exp(-dt*2.8);if(Math.abs(nav.vx)+Math.abs(nav.vy)>1e-3){nav.x+=nav.vx*dt;nav.y+=nav.vy*dt;nav.vx*=fr;nav.vy*=fr;bound()}else nav.vx=nav.vy=0;
        if(Math.abs(nav.vz)>1e-3&&!pinch){const f=Math.exp(nav.vz*dt);zoomAt(f,nav.wfx,nav.wfy);nav.vz*=Math.exp(-dt*3.4)}else if(!pinch)nav.vz=0}
      /* wheel / trackpad / dock steps: eased toward the requested depth */
      if(nav.wz&&mode==='home'&&!F){const a=nav.wz*(1-Math.exp(-dt*11));nav.wz-=a;if(Math.abs(nav.wz)<1e-4)nav.wz=0;zoomAt(Math.exp(a),nav.wfx,nav.wfy)}
    }
    /* the camera: you, plus a slow breath and a gentle lean into travel (never a free turn) */
    const lv=clamp(-nav.vx/Math.max(8,nav.z)*.05,-.05,.05),lh=clamp(-nav.vy/Math.max(8,nav.z)*.05,-.04,.04);
    nav.tx+=(lv-nav.tx)*Math.min(1,dt*4);nav.ty+=(lh-nav.ty)*Math.min(1,dt*4);
    const br=nav.z*.004;cam.position.set(nav.x+Math.sin(T*.11)*br,nav.y+Math.sin(T*.083)*br*.7,nav.z);
    tmp.set(cam.position.x+nav.tx*10,cam.position.y+nav.ty*10,cam.position.z-10);cam.up.set(0,1,0);cam.lookAt(tmp);
    speed=mode==='home'?clamp(Math.abs(nav.vz)*.35+(Math.abs(nav.wz)>.02?.25:0),0,.7):0;dir=nav.vz>0||nav.wz>0?-1:1}
  U.uCam.value.copy(cam.position);
  /* streaks: forward flight streams toward you, flying out streams away */
  stM.opacity=clamp(speed,0,1)*.5;if(stM.opacity>.01){for(let i=0;i<NS;i++){const d=stD[i];d.z+=dt*(18+60*speed)*dir;if(d.z>-1.5)d.z-=68;if(d.z<-70)d.z+=68;const l=d.len*(.4+2.6*speed);stP.set([d.x,d.y,d.z,d.x,d.y,d.z-l],i*6)}stG.attributes.position.needsUpdate=true}
  /* fill-rate guard: a sprite never grows past a share of the view as you near it */
  nebs.forEach(n=>{const d=n.position.distanceTo(cam.position),b=n.userData.b,z=Math.min(b,d*.9);n.scale.set(z,z*.7,1);n.material.opacity=n.userData.o*smooth(.25,.9,d/b)});
  SYS.forEach(s=>{const on=sel===s.k?1:0;s.selA+=(on-s.selA)*Math.min(1,dt*5);const dim=sel&&!on?.6:1,p=1+.08*Math.sin(T*2.2+s.c.x);
    const dC=s.c.distanceTo(cam.position),sz=Math.min((3.4+2.6*s.selA)*s.bright*p,dC*.2);s.core.scale.set(sz,sz,1);s.core.material.opacity=Math.min(1,(.82+.18*s.selA)*dim*(s.fade==null?1:s.fade));
    const hz=Math.min(sz*3.2,dC*.55);s.halo.scale.set(hz,hz,1);s.halo.material.opacity=(.18+.22*s.selA)*dim*(s.fade==null?1:s.fade);
    s.pts.material.uniforms.uOp.value=(.8+.2*s.selA)*(dim*.9+.1)*(s.pfade==null?1:s.pfade);s.rings.children.forEach(r=>r.material.opacity=(.06+.16*s.selA)*(s.pfade==null?1:s.pfade))});
  R.render(scene,cam);labels();
  if(F||mode==='home'||mode==='arm')raf=requestAnimationFrame(frame)}
function kick(){if(!raf){lastT=performance.now();raf=requestAnimationFrame(frame)}}
function proj(v){pv.copy(v).project(cam);return[(pv.x+1)/2*W,(1-pv.y)/2*H,pv.z]}
/* labels sit outside the signature's strokes */
const LBL={film:'t',photo:'b',about:'r',sound:'b',objects:'t'};
function labels(){if(F&&F.hideLabels)return;const close=nav.z<ZMAG*1.5;
  SYS.forEach(s=>{const p=proj(s.c),b=s.lab,bw=b.offsetWidth;const ok=p[2]<1&&p[0]>-60&&p[0]<W+60&&p[1]>-60&&p[1]<H+60;
    const ppu=H/(2*Math.max(1,cam.position.z-s.c.z)*TH),dd=Math.max(16,Math.min(s.rmax*ppu*.62,H*.3))+s.selA*6,bh=b.offsetHeight,a=LBL[s.k]||'b';
    let x=p[0]-bw/2,y=p[1]+dd;if(a==='t')y=p[1]-dd-bh;else if(a==='r'){x=p[0]+dd-6;y=p[1]-bh/2+4}
    x=clamp(x,4,W-bw-4);b.style.transform='translate3d('+Math.round(x)+'px,'+Math.round(y)+'px,0)';b.style.visibility=ok?'':'hidden';
    b.classList.toggle('on',sel===s.k);b.classList.toggle('dim',!!sel&&sel!==s.k);
    s.pl.forEach(q=>{const it=s.items.findIndex(x=>x.k===q.w);if(it<0)return;const show=sel===s.k&&s.selA>.6&&close;if(show){const pp=proj(planetPos(s,it,T,nv));q.el.style.transform='translate3d('+Math.round(pp[0]+9)+'px,'+Math.round(pp[1]-6)+'px,0)'}q.el.classList.toggle('on',show)})})}
/* ---------- the flight (in: onto v4-c's constellation; out: back up into the galaxy) ---------- */
function flyStep(f,t,now){
  let ex,ez;if(f.dir>0){if(f.cont){ex=eo(t);ez=eo(t)}else{ex=ease(clamp(t*1.45,0,1));ez=ease(t)}}else{ex=ease(t);ez=ease(t)}
  const A=f.dir>0?f.P0:f.P3,B=f.dir>0?f.P3:f.P0;
  tmp.set(A.x+(B.x-A.x)*ex,A.y+(B.y-A.y)*ex,A.z*Math.pow(B.z/A.z,ez)); /* depth moves in log space: the same feel as pinching */
  if(t>=1){cam.position.copy(B);cam.quaternion.copy(QID)}else{cam.position.copy(tmp);const lt=(1-ez)*f.tilt;tmp2.set(tmp.x+lt*f.tx,tmp.y+lt*f.ty,tmp.z-10);cam.up.set(0,1,0);cam.lookAt(tmp2)}
  f.spd=f.prev&&t<1?clamp(cam.position.distanceTo(f.prev)/(f.len/f.dur*16.7)*.9,0,1.2):0;f.prev=(f.prev||new THREE.Vector3()).copy(cam.position);
  const s=f.s;s.pfade=f.dir>0?1-smooth(.3,.62,t):smooth(.45,.85,t);
  const th=TH;
  {const fp=f.fp,o=f.dir>0?smooth(.62,1,t):1-smooth(0,.4,t),d=DT+.6,hh=d*th;VEIL.visible=o>.002;VEIL.material.opacity=o*.86;VEIL.position.set(0,0,-d).applyQuaternion(fp.q).add(fp.pos);VEIL.quaternion.copy(fp.q);VEIL.scale.set(hh*2*cam.aspect*1.3,hh*2*1.3,1)}
  s.fade=f.dir>0?1-.65*smooth(.55,1,t):1-.65*(1-smooth(0,.45,t));
  f.tl.forEach((x,j)=>{const me=x.me,u=me.material.uniforms,N=f.tl.length;if(x.e&&x.e.t&&!u.uHas.value&&!x.vt)cover(me,x.e,x.r.w,x.r.h);let k=f.dir>0?clamp((t-.3-.16*j/N)/.58,0,1):1-clamp((t-.04*j/N)/.5,0,1);const ke=ease(k);if(!x.dot)liveVid(x,f.dir>0?(t>.84?true:k>.35?1:0):(t<.25?true:1));
    planetPos(s,x.i,T,tmp);me.position.copy(tmp).lerp(x.end.p,ke);me.quaternion.copy(f.Q);
    const ps=.3,w=ps+(x.end.w-ps)*ke,h=ps+(x.end.h-ps)*ke;me.scale.set(w,h,1);
    const dist=Math.max(.2,tmp.copy(me.position).sub(cam.position).dot(tmp2.set(0,0,-1).applyQuaternion(cam.quaternion)));const ppw=H/(2*dist*th);
    u.uPx.value.set(w*ppw,h*ppw);const im=x.dot?0:smooth(.25,.75,k);u.uImg.value=im;u.uRad.value=x.dot?Math.min(u.uPx.value.x,u.uPx.value.y)*.5:Math.min(u.uPx.value.x,u.uPx.value.y)*.5*(1-im)+3*im;
    u.uOp.value=f.dir>0?smooth(0,.18,k)*(k<.001?0:1):smooth(0,.25,k);me.visible=u.uOp.value>.001});
  /* the constellation's chain line (v4-c's L1 path) draws in as the stars land, and out as they leave */
  if(f.line){const a=LINE.geometry.attributes.position.array;f.tl.forEach((x,j)=>{if(j<128){a[j*3]=x.me.position.x;a[j*3+1]=x.me.position.y;a[j*3+2]=x.me.position.z}});LINE.geometry.attributes.position.needsUpdate=true;LINE.geometry.setDrawRange(0,Math.min(128,f.tl.length));
    const lo=f.dir>0?smooth(.7,1,t):1-smooth(0,.3,t);LINE.material.opacity=lo*.42;LINE.visible=lo>.002}else LINE.visible=false}
/* where a flight out ends: above the system, the galaxy around it (you carry on from there) */
const outPose=s=>new THREE.Vector3(s.c.x,s.c.y,s.c.z+Math.min(HOMEZ*.8,ZCAP*2.5));
function makeFlight(s,dir,rects,cont){const fp=finalPose(s);const f={s,dir,fp,Q:fp.q,P3:fp.pos.clone(),t0:0,tl:[],cont:!!cont,tilt:1,tx:nav.tx*10,ty:nav.ty*10};
  if(dir>0){f.P0=cam.position.clone();const far=Math.log(f.P0.z/f.P3.z);f.dur=cont?(PHONE?1150:1050):clamp(900+far*420+Math.hypot(f.P0.x-f.P3.x,f.P0.y-f.P3.y)*6,1200,2100)}
  else{f.P0=outPose(s);f.dur=PHONE?1450:1350;f.tilt=0}
  f.len=f.P0.distanceTo(f.P3)*1.1;
  rects.forEach((r,j)=>{const me=tiles[j]||(tiles[j]=tileMesh());const it=s.items[r.i];const im=r.img;const src=im?(im.currentSrc||im.getAttribute('src')||im.dataset.src):it.src;const dot=r.w<20,e=dot?null:tex(src);const end=rectWorld(fp,r);cover(me,e,r.w,r.h);
    me.material.uniforms.uDot.value.copy(new THREE.Color(.75,.88,1).lerp(s.tint,.5));f.tl.push({me,i:r.i,end,e,r,dot,vis:it.el.querySelector('.vis')})});
  f.line=f.tl.length>1&&f.tl.every(x=>x.dot);
  for(let j=rects.length;j<tiles.length;j++)tiles[j].visible=false;
  return f}
/* v4-c plays short scrub loops in its board tiles: when one is running, the tile shows the same live frames */
function liveVid(x,want){const v=x.r.vid||(x.r.vid=x.vis&&x.vis.querySelector('video'));
  if(x.vt){if(want===true&&(!v.paused||!x.vt.up)){x.cx.drawImage(v,0,0,x.cv.width,x.cv.height);x.vt.needsUpdate=true;x.vt.up=1}return}
  if(!want||!v||v.readyState<2||!v.videoWidth||+getComputedStyle(v).opacity<.5)return;
  x.cv=document.createElement('canvas');x.cv.width=v.videoWidth;x.cv.height=v.videoHeight;x.cx=x.cv.getContext('2d');x.cx.drawImage(v,0,0);
  x.vt=new THREE.CanvasTexture(x.cv);x.vt.minFilter=THREE.LinearFilter;x.vt.generateMipmaps=false;x.vt.up=1;
  cover(x.me,{t:x.vt,w:v.videoWidth,h:v.videoHeight},x.r.w,x.r.h)}
function dropVids(f){if(f)f.tl.forEach(x=>{if(x.vt){x.vt.dispose();x.vt=null}})}
function hideTiles(){tiles.forEach(t=>t.visible=false);VEIL.visible=false;LINE.visible=false}
/* ---------- show / hide the layer ---------- */
function show(o){o=o||{};D.classList.add('gx-on');D.classList.remove('gx-boot');
  if(window.__water&&__water.active)try{__water.active(false)}catch(e){}ui();kick()}
function hide(){D.classList.remove('gx-on');D.classList.remove('gx-fly');/* hand the water back to v4-c's own rule (dive.js: on unless it is night) */
  if(window.__water&&__water.active)try{__water.active(+getComputedStyle(D).getPropertyValue('--night')<.9)}catch(e){}ui()}
function placeBack(){const z=document.querySelector('.zoom .zb');if(!z)return;const r=z.getBoundingClientRect();if(!r.height)return;BACK.style.bottom=Math.round(innerHeight-r.bottom+(r.height-40)/2)+'px'}
addEventListener('resize',()=>{if(!BACK.hidden)placeBack()});addEventListener('hashchange',()=>setTimeout(ui,0));
function ui(){const on=D.classList.contains('gx-on'),d=window.__dive&&__dive.state();BACK.hidden=on||mode==='home'||!!(d&&d.w);if(!BACK.hidden)placeBack();
  const s=sel&&BYK[sel];CRUMB.textContent=s?s.name+' · '+s.ct:'the galaxy';setLv(s?s.name+' · selected':'the galaxy');if((L.dataset.sel||'')!==(sel||''))L.dataset.sel=sel||'';
  const t=!nav.used?(PHONE?'drag to travel · pinch to fly in':'drag to travel · scroll to fly in'):s?'press '+s.name+' again · or keep flying in':(PHONE?'press a star system · pinch toward one to fly in':'press a star system · scroll toward one to fly in');
  if(HT.textContent!==t)HT.textContent=t;HINT.classList.toggle('gx-new',!nav.used)}
/* ---------- select / fly in ---------- */
function select(k){if(F||mode!=='home')return;sel=k;if(k){preload(BYK[k],PHONE?18:30)}ui()}
function landUnder(s){/* v4-c's own route to the constellation (what the dock tab does), done instantly under the layer */
  const lv=BOARD_LV(s);__dive.go({k:s.k,lv},{noAnim:true,anchor:$('.head',s.el)});s.el.scrollIntoView({block:'start',behavior:'instant'})}
function flyIn(k,cont){if(F||mode!=='home')return;const s=BYK[k];if(!s)return;sel=k;glide=null;stopAll();drag=null;pinch=null;setMode('arm');ui();D.classList.add('gx-fly');landUnder(s);lastK=k;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const rects=boardRects(s);F=makeFlight(s,1,rects,cont);F.hideLabels=false;F.t0=performance.now();setMode('fly');
    F.end=()=>{const imgs=rects.filter(r=>r.w>=20).map(r=>r.img).filter(Boolean),t0=performance.now();
      const wait=()=>{if(imgs.every(i=>i.complete&&i.naturalWidth>0)||performance.now()-t0>1400){handOver()}else setTimeout(wait,60)};wait()};kick()}))}
function handOver(){/* the real constellation is underneath at exactly these points: crossfade the layer away */
  setMode('board');hide();setTimeout(()=>{if(mode==='board'){dropVids(F);F=null;hideTiles();SYS.forEach(s=>{s.pfade=null;s.fade=null});ui()}},520)}
/* ---------- fly out ---------- */
let expectPop=0;
function curK(){const d=window.__dive&&__dive.state();return d&&d.k||lastK}
function flyOut(viaPop){if(F&&mode!=='board')return;const k=curK(),s=k&&BYK[k];
  if(!s){toGalaxy();if(!viaPop&&!homeHash())__dive.go({k:null},{noAnim:true});return}
  if(F){dropVids(F);F=null;hideTiles()}
  const rects=boardRects(s);resize();setMode('fly');sel=k;
  const f=makeFlight(s,-1,rects);f.hideLabels=true;D.classList.add('gx-fly');
  /* first frame: camera on the constellation pose, its stars exactly on v4-c's */
  cam.position.copy(f.P3);cam.quaternion.copy(f.Q);f.tl.forEach(x=>{const me=x.me,u=me.material.uniforms;me.position.copy(x.end.p);me.quaternion.copy(f.Q);me.scale.set(x.end.w,x.end.h,1);u.uPx.value.set(x.r.w,x.r.h);u.uImg.value=x.dot?0:1;u.uRad.value=x.dot?Math.min(x.r.w,x.r.h)*.5:3;u.uOp.value=1;me.visible=true;if(!x.dot)liveVid(x,true)});LINE.visible=false;
  s.pfade=0;R.render(scene,cam);show();
  /* v4-c goes home underneath only once the layer is fully over it (end of the flight), so its relayout never costs flight frames */
  const goHome=()=>{if(!viaPop){if(window.__v4&&__v4.prevIs('')&&history.length>1){expectPop++;history.back()}else __dive.go({k:null},{noAnim:true})}};
  setTimeout(()=>{
    F=f;F.t0=performance.now()+(PHONE?120:80);F.end=()=>{goHome();dropVids(f);F=null;hideTiles();s.fade=null;s.pfade=null;
      nav.x=f.P0.x;nav.y=f.P0.y;nav.z=f.P0.z;stopAll();nav.tx=nav.ty=0;setMode('home');D.classList.remove('gx-fly');sel=k;ui();
      scrollTo({top:0,behavior:'instant'});setTimeout(()=>{if(mode==='home')scrollTo({top:0,behavior:'instant'})},50)};kick()},260)}
function goHomeView(dur){/* the mark: a smooth glide back to the whole galaxy */
  stopAll();glide={t0:performance.now(),dur:dur||1300,x0:nav.x,y0:nav.y,z0:nav.z,x1:0,y1:0,z1:HOMEZ};sel=null;ui();kick()}
function toGalaxy(){/* from the surface (v4-c home) or a page with no constellation in view: the galaxy fades in, whole */
  setMode('home');sel=null;F=null;hideTiles();resize();stopAll();nav.x=0;nav.y=0;nav.z=HOMEZ*1.25;goHomeView(1100);L.classList.add('gx-slow');show();setTimeout(()=>L.classList.remove('gx-slow'),950)}
function toSurface(){if(F)return;setMode('surface');sel=null;hide();setTimeout(()=>{if(mode==='surface'){cancelAnimationFrame(raf);raf=0}},500)}
/* ---------- input on the galaxy: drag travels, pinch / wheel fly, a press selects, a press on the selected flies to it ---------- */
const ptr=new Map();let pinch=null,drag=null,downAt=null;
function hit(x,y){let best=null,bd=1e9;SYS.forEach(s=>{const p=proj(s.c);if(p[2]>=1)return;const d=Math.hypot(p[0]-x,p[1]-y);const ppu=H/(2*Math.max(1,cam.position.z-s.c.z)*TH),rr=Math.max(PHONE?46:38,s.rmax*ppu*.9);if(d<rr&&d<bd){bd=d;best=s}});return best}
function press(k){if(F||mode!=='home')return;if(!k){if(sel){sel=null;ui()}return}if(sel===k)flyIn(k);else select(k)}
const mids=()=>{const a=[...ptr.values()];return{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1}};
const lr=()=>L.getBoundingClientRect();
L.addEventListener('pointerdown',e=>{const lb=e.target.closest('.gx-l');if(!lb&&e.target.closest('button,a'))return;if(mode!=='home'||F)return;try{L.setPointerCapture(e.pointerId)}catch(x){}
  const o=lr();ptr.set(e.pointerId,{x:e.clientX-o.left,y:e.clientY-o.top});glide=null;
  if(ptr.size===1){const p=ptr.get(e.pointerId);downAt={x:p.x,y:p.y,t:performance.now(),id:e.pointerId,lk:lb&&lb.dataset.k};drag={id:e.pointerId,x:p.x,y:p.y,t:performance.now()};nav.vx=nav.vy=0;nav.vz=0;nav.wz=0}
  else if(ptr.size===2){const m=mids();pinch={x:m.x,y:m.y,d:m.d,t:performance.now()};drag=null;downAt=null;nav.vx=nav.vy=nav.vz=0}});
L.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;const o=lr();ptr.set(e.pointerId,{x:e.clientX-o.left,y:e.clientY-o.top});if(mode!=='home'||F)return;const now=performance.now();
  if(downAt&&Math.hypot(e.clientX-o.left-downAt.x,e.clientY-o.top-downAt.y)>9)downAt=null;
  if(pinch&&ptr.size>=2){const m=mids(),dt=Math.max(.008,(now-pinch.t)/1000);
    /* pan with the midpoint, then fly about it: spreading the fingers moves you in, closing them moves you out */
    const k=wpp(),dx=(m.x-pinch.x)*k,dy=(m.y-pinch.y)*k;nav.x-=dx;nav.y+=dy;bound();
    const lf=-Math.log(m.d/pinch.d)*1.35;nav.wfx=m.x;nav.wfy=m.y;zoomAt(Math.exp(lf),m.x,m.y);if(!pinch)return; /* the zoom committed a fly-in */
    nav.vz=nav.vz*.6+(lf/dt)*.4;nav.vx=nav.vx*.6+(-dx/dt)*.4;nav.vy=nav.vy*.6+(dy/dt)*.4;pinch.x=m.x;pinch.y=m.y;pinch.d=m.d;pinch.t=now;used();return}
  if(drag&&drag.id===e.pointerId){const p=ptr.get(e.pointerId),dt=Math.max(.008,(now-drag.t)/1000),k=wpp(),dx=(p.x-drag.x)*k,dy=(p.y-drag.y)*k;
    if(!downAt||Math.hypot(p.x-downAt.x,p.y-downAt.y)>9||!downAt){nav.x-=dx;nav.y+=dy;bound();const a=Math.min(1,dt/.05);nav.vx=nav.vx*(1-a*.5)+(-dx/dt)*a*.5;nav.vy=nav.vy*(1-a*.5)+(dy/dt)*a*.5;if(dx||dy)used()}
    drag.x=p.x;drag.y=p.y;drag.t=now}});
function up(e){const had=ptr.has(e.pointerId);ptr.delete(e.pointerId);
  if(pinch&&ptr.size<2){pinch=null;const r=[...ptr.entries()][0];if(r){drag={id:r[0],x:r[1].x,y:r[1].y,t:performance.now()}}else{drag=null;if(performance.now()-(pinch&&pinch.t||0)>90){}}nav.wfx=nav.wfx||W/2;return}
  if(drag&&drag.id===e.pointerId){if(performance.now()-drag.t>90){nav.vx=0;nav.vy=0}drag=null} /* a finger that stopped before lifting rests exactly where it is */
  if(had&&downAt&&downAt.id===e.pointerId&&e.type==='pointerup'){const d=downAt;downAt=null;if(performance.now()-d.t<650){const s=d.lk?BYK[d.lk]:hit(d.x,d.y);press(s?s.k:null)}}}
L.addEventListener('pointerup',up);L.addEventListener('pointercancel',up);
L.addEventListener('click',e=>{if(e.target.closest('.gx-mark')){e.preventDefault();if(mode==='home'&&!F)goHomeView();return}const b=e.target.closest('.gx-l');if(b){e.preventDefault();if(e.detail===0)press(b.dataset.k);return} /* pointer presses on a label go through the gesture code (so a pinch can start on one) */if(e.target.closest('.gx-surf')){e.preventDefault();toSurface()}});
L.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();if(F||mode!=='home')return;const o=lr(),u=e.deltaMode===1?16:e.deltaMode===2?H:1;
  const dy=e.deltaY*u,dx=e.deltaX*u;nav.wfx=e.clientX-o.left;nav.wfy=e.clientY-o.top;glide=null;
  nav.wz=clamp(nav.wz+dy*(e.ctrlKey?.011:.0019),-1.6,1.6); /* wheel / trackpad scroll and trackpad pinch: fly in depth */
  if(!e.ctrlKey&&Math.abs(dx)>Math.abs(dy)*.6){const k=wpp();nav.x+=dx*k;bound()} /* a sideways trackpad swipe travels */
  used();kick()},{passive:false});
['gesturestart','gesturechange'].forEach(n=>L.addEventListener(n,e=>e.preventDefault(),{passive:false}));
/* the galaxy owns its touches: v4-c's own document pinch (its board ladder) must not see gestures made on the sky */
['touchstart','touchmove','touchend','touchcancel'].forEach(n=>L.addEventListener(n,e=>e.stopPropagation(),{passive:true}));
addEventListener('keydown',e=>{if(mode!=='home'||F||!D.classList.contains('gx-on'))return;if(e.target&&e.target.closest&&e.target.closest('input,textarea'))return;
  const k=wpp()*H*.9;
  if(e.key==='Escape'){if(sel){sel=null;ui()}}else if(e.key==='ArrowLeft'){nav.vx=-k;used()}else if(e.key==='ArrowRight'){nav.vx=k;used()}else if(e.key==='ArrowUp'){nav.vy=k;used()}else if(e.key==='ArrowDown'){nav.vy=-k;used()}
  else if(e.key==='+'||e.key==='='){nav.wfx=W/2;nav.wfy=H/2;nav.wz-=.45;used()}else if(e.key==='-'||e.key==='_'){nav.wfx=W/2;nav.wfy=H/2;nav.wz+=.45;used()}else if(e.key==='Enter'&&sel&&e.target===document.body){flyIn(sel)}else return;kick()});
BACK.addEventListener('click',e=>{e.preventDefault();const d=window.__dive&&__dive.state();if(mode==='surface'||!d||!d.k){toGalaxy();if(!homeHash())__dive.go({k:null},{noAnim:true});return}flyOut(false)});
/* the dock while the galaxy is up: a tab flies to that system, + / − fly in / out at the centre */
addEventListener('click',e=>{if(!D.classList.contains('gx-on')||e.button)return;const a=e.target.closest&&e.target.closest('.tabs a[data-t],.zoom .zb');if(!a)return;
  e.preventDefault();e.stopImmediatePropagation();if(F||mode!=='home')return;
  if(a.dataset.t){const k=a.dataset.t;if(BYK[k]){preload(BYK[k]);sel=k;flyIn(k)}}else{nav.wfx=W/2;nav.wfy=H/2;glide=null;nav.wz+=a.dataset.z==='1'?-.6:.6;used();kick()}},true);
/* one level above v4-c: on a chapter's constellation (L1), −, a pinch-in, a trackpad pinch-in, or scrolling up past its top flies
   back out into the galaxy instead of v4-c's glyph row. L2 and the work keep v4-c's own steps (a pinch-out on the constellation is
   v4-c's own move onto its board). */
const onL1=()=>{if(D.classList.contains('gx-on')||F||D.classList.contains('sheet-on')||D.classList.contains('one-on'))return null;const imm=$('.imm');if(imm&&!imm.hidden)return null;
  const d=window.__dive&&__dive.state();return d&&d.k&&BYK[d.k]&&!d.w&&d.lv===1?d:null};
addEventListener('click',e=>{if(e.button)return;const a=e.target.closest&&e.target.closest('.zoom .zb');if(!a||a.dataset.z==='1'||!onL1())return;
  e.preventDefault();e.stopImmediatePropagation();setMode('board');flyOut(false)},true);
/* v4-c greys its − out on L1 (its lowest step on desktop); here − on L1 means "out to the galaxy", so keep it live there */
{const zo=()=>document.querySelector('.zoom .zb[data-z="-1"]'),fix=()=>{const b=zo();if(b&&b.disabled&&onL1())b.disabled=false};
  const b0=zo();if(b0){new MutationObserver(fix).observe(b0,{attributes:true,attributeFilter:['disabled']})}addEventListener('hashchange',()=>setTimeout(fix,0));setInterval(()=>{if(mode==='board')fix()},400)}
let wUp=0,wUpT=0;
addEventListener('wheel',e=>{const d=onL1();if(!d)return;const u=e.deltaMode===1?16:1;
  if(e.ctrlKey){if(e.deltaY>0){e.preventDefault();e.stopImmediatePropagation();wUp+=e.deltaY*u*4}else return}
  else{const top=BYK[d.k].el.getBoundingClientRect().top;if(e.deltaY<0&&top>=-2)wUp+=-e.deltaY*u;else{wUp=0;return}}
  clearTimeout(wUpT);wUpT=setTimeout(()=>wUp=0,420);if(wUp>260){wUp=0;setMode('board');flyOut(false)}},{capture:true,passive:false});
let bp=null;
addEventListener('touchstart',e=>{if(e.touches.length!==2||!onL1()){bp=null;return}
  const t=e.touches;bp={d0:Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)||1,done:false}},{capture:true,passive:true});
addEventListener('touchmove',e=>{if(!bp||e.touches.length!==2)return;const t=e.touches,r=Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)/bp.d0;
  if(r<.97){e.stopPropagation();if(e.cancelable)e.preventDefault()}if(r<.74&&!bp.done){bp.done=true;setMode('board');flyOut(false)}},{capture:true,passive:false});
addEventListener('touchend',e=>{if(e.touches.length<2)bp=null},{capture:true,passive:true});
/* addresses: Back to home flies out; any other address leaves the galaxy */
addEventListener('popstate',()=>{if(expectPop){expectPop--;if(mode==='home')requestAnimationFrame(()=>scrollTo({top:0,behavior:'instant'}));return}
  if(homeHash()){if(mode==='board'||mode==='off'){flyOut(true)}}
  else if(D.classList.contains('gx-on')&&!F){setMode('off');hide()}},true);
addEventListener('resize',()=>{if(mode==='home'||F)resize()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(mode==='home'||F))kick()});
/* boot: arrive from a little further out and drift into place (shows the depth at once); any touch takes over */
resize();
if(homeHash()){setMode('home');nav.z=HOMEZ*1.5;nav.x=HOMEZ*.09;nav.y=-HOMEZ*.05;glide={t0:performance.now()+150,dur:2400,x0:nav.x,y0:nav.y,z0:nav.z,x1:0,y1:0,z1:HOMEZ};
  preload(BYK.film,PHONE?12:24);L.classList.add('gx-slow');show();setTimeout(()=>L.classList.remove('gx-slow'),950)}
else{setMode('off');off();ui()}
}
