/* gill james · site-v4-galaxy · galaxy.js — a layer added AROUND and IN FRONT of site-v4-c. It never restyles or replaces v4-c:
   the boards, chapter pages, player, sky sheet, select.js / sheet.js / sound-one.js and the dock are untouched and still do
   everything they did. This file only adds:
   - HOME (no hash, or #galaxy): a three.js galaxy in front of the page: far stars, a spiral-arm dust field, mid nebula layers and
     near motes, all parallaxing with a gentle guided camera (no free orbit). Only the background turns, slowly.
   - Each chapter is a star system, its works orbiting as planets (Gill's picks brightest, older work slightly dimmer, never hidden).
     One press selects a system (it brightens, its label shows); a press on the selected one, or a pinch, flies in.
   - FLY IN: v4-c's real board is opened underneath (the same route the dock tab uses), its tile positions are read, and the
     planets resolve into poster tiles that land on exactly those rects; the layer then crossfades away, leaving the real board.
   - FLY OUT: "‹ galaxy", Back, or a pinch-in on the board: the board's visible tiles lift off into planets and the camera pulls out.
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
/* ---------- DOM layer ---------- */
/* the mark: the galaxy's own two arms (same curve as the dust field), also saved as mark.svg */
const MARK='<svg class="gx-mk" viewBox="-86 -86 172 172" aria-hidden="true"><path fill="currentColor" d="M2.9 0.2 L3.3 1.2 L3.6 2.0 L3.8 2.8 L3.9 3.6 L3.9 4.5 L3.8 5.4 L3.6 6.3 L3.2 7.2 L2.7 8.1 L2.0 9.0 L1.1 9.9 L0.1 10.7 L-1.2 11.4 L-2.5 11.9 L-4.0 12.3 L-5.7 12.5 L-7.4 12.5 L-9.3 12.2 L-11.1 11.7 L-13.0 10.9 L-14.9 9.8 L-16.6 8.5 L-18.3 6.8 L-19.8 4.9 L-21.1 2.7 L-22.1 0.3 L-22.9 -2.4 L-23.3 -5.2 L-23.4 -8.1 L-23.1 -11.2 L-22.4 -14.3 L-21.3 -17.3 L-19.7 -20.3 L-17.8 -23.2 L-15.4 -25.9 L-12.6 -28.4 L-9.5 -30.5 L-6.0 -32.3 L-2.2 -33.7 L1.8 -34.7 L6.0 -35.1 L10.3 -35.1 L14.7 -34.5 L19.1 -33.3 L23.5 -31.6 L27.7 -29.2 L31.6 -26.4 L35.3 -23.0 L38.6 -19.1 L41.4 -14.7 L43.8 -9.9 L45.6 -4.8 L46.8 0.6 L47.3 6.3 L47.1 12.0 L46.2 17.9 L44.6 23.6 L42.3 29.3 L39.2 34.7 L35.5 39.8 L31.1 44.4 L26.1 48.6 L20.5 52.2 L14.4 55.2 L7.9 57.4 L1.1 58.9 L-6.0 59.5 L-13.2 59.3 L-20.4 58.2 L-27.5 56.2 L-34.5 53.3 L-41.1 49.6 L-47.4 45.0 L-53.1 39.6 L-58.2 33.5 L-62.6 26.8 L-66.2 19.4 L-69.0 11.6 L-70.8 3.4 L-71.6 -5.1 L-71.4 -13.7 L-70.1 -22.3 L-67.8 -30.8 L-64.5 -39.1 L-60.1 -47.0 L-54.8 -54.4 L-48.5 -61.2 L-41.4 -67.3 L-33.5 -72.6 L-25.0 -77.0 L-25.0 -77.0 L-33.7 -72.9 L-41.7 -67.7 L-48.9 -61.6 L-55.3 -54.8 L-60.7 -47.4 L-65.2 -39.4 L-68.6 -31.1 L-71.1 -22.5 L-72.4 -13.8 L-72.7 -5.0 L-72.0 3.6 L-70.2 11.9 L-67.6 20.0 L-64.0 27.5 L-59.6 34.5 L-54.4 40.8 L-48.6 46.4 L-42.2 51.2 L-35.4 55.2 L-28.3 58.3 L-20.9 60.4 L-13.4 61.7 L-5.9 62.0 L1.4 61.5 L8.6 60.1 L15.5 57.9 L21.9 54.9 L27.9 51.2 L33.3 46.9 L38.1 42.0 L42.2 36.7 L45.6 30.9 L48.2 24.9 L50.1 18.7 L51.2 12.5 L51.5 6.2 L51.1 0.0 L49.9 -5.9 L48.1 -11.6 L45.6 -17.0 L42.6 -21.9 L39.0 -26.4 L35.0 -30.3 L30.6 -33.7 L25.9 -36.4 L21.0 -38.5 L16.0 -40.0 L10.9 -40.8 L5.8 -41.0 L0.9 -40.6 L-3.9 -39.6 L-8.4 -38.1 L-12.6 -36.0 L-16.5 -33.5 L-19.9 -30.6 L-22.9 -27.4 L-25.4 -23.9 L-27.4 -20.2 L-28.9 -16.3 L-29.9 -12.4 L-30.4 -8.5 L-30.3 -4.7 L-29.8 -0.9 L-28.9 2.6 L-27.5 5.9 L-25.8 8.9 L-23.7 11.5 L-21.4 13.9 L-18.9 15.8 L-16.2 17.3 L-13.5 18.5 L-10.7 19.2 L-7.9 19.5 L-5.2 19.4 L-2.6 19.0 L-0.2 18.2 L2.0 17.1 L3.9 15.8 L5.5 14.3 L6.8 12.6 L7.7 10.8 L8.4 8.9 L8.6 7.1 L8.6 5.3 L8.2 3.7 L7.6 2.3 L6.7 1.1 L5.6 0.2 L4.4 -0.3 L3.1 -0.2ZM-2.9 -0.2 L-3.3 -1.2 L-3.6 -2.0 L-3.8 -2.8 L-3.9 -3.6 L-3.9 -4.5 L-3.8 -5.4 L-3.6 -6.3 L-3.2 -7.2 L-2.7 -8.1 L-2.0 -9.0 L-1.1 -9.9 L-0.1 -10.7 L1.2 -11.4 L2.5 -11.9 L4.0 -12.3 L5.7 -12.5 L7.4 -12.5 L9.3 -12.2 L11.1 -11.7 L13.0 -10.9 L14.9 -9.8 L16.6 -8.5 L18.3 -6.8 L19.8 -4.9 L21.1 -2.7 L22.1 -0.3 L22.9 2.4 L23.3 5.2 L23.4 8.1 L23.1 11.2 L22.4 14.3 L21.3 17.3 L19.7 20.3 L17.8 23.2 L15.4 25.9 L12.6 28.4 L9.5 30.5 L6.0 32.3 L2.2 33.7 L-1.8 34.7 L-6.0 35.1 L-10.3 35.1 L-14.7 34.5 L-19.1 33.3 L-23.5 31.6 L-27.7 29.2 L-31.6 26.4 L-35.3 23.0 L-38.6 19.1 L-41.4 14.7 L-43.8 9.9 L-45.6 4.8 L-46.8 -0.6 L-47.3 -6.3 L-47.1 -12.0 L-46.2 -17.9 L-44.6 -23.6 L-42.3 -29.3 L-39.2 -34.7 L-35.5 -39.8 L-31.1 -44.4 L-26.1 -48.6 L-20.5 -52.2 L-14.4 -55.2 L-7.9 -57.4 L-1.1 -58.9 L6.0 -59.5 L13.2 -59.3 L20.4 -58.2 L27.5 -56.2 L34.5 -53.3 L41.1 -49.6 L47.4 -45.0 L53.1 -39.6 L58.2 -33.5 L62.6 -26.8 L66.2 -19.4 L69.0 -11.6 L70.8 -3.4 L71.6 5.1 L71.4 13.7 L70.1 22.3 L67.8 30.8 L64.5 39.1 L60.1 47.0 L54.8 54.4 L48.5 61.2 L41.4 67.3 L33.5 72.6 L25.0 77.0 L25.0 77.0 L33.7 72.9 L41.7 67.7 L48.9 61.6 L55.3 54.8 L60.7 47.4 L65.2 39.4 L68.6 31.1 L71.1 22.5 L72.4 13.8 L72.7 5.0 L72.0 -3.6 L70.2 -11.9 L67.6 -20.0 L64.0 -27.5 L59.6 -34.5 L54.4 -40.8 L48.6 -46.4 L42.2 -51.2 L35.4 -55.2 L28.3 -58.3 L20.9 -60.4 L13.4 -61.7 L5.9 -62.0 L-1.4 -61.5 L-8.6 -60.1 L-15.5 -57.9 L-21.9 -54.9 L-27.9 -51.2 L-33.3 -46.9 L-38.1 -42.0 L-42.2 -36.7 L-45.6 -30.9 L-48.2 -24.9 L-50.1 -18.7 L-51.2 -12.5 L-51.5 -6.2 L-51.1 -0.0 L-49.9 5.9 L-48.1 11.6 L-45.6 17.0 L-42.6 21.9 L-39.0 26.4 L-35.0 30.3 L-30.6 33.7 L-25.9 36.4 L-21.0 38.5 L-16.0 40.0 L-10.9 40.8 L-5.8 41.0 L-0.9 40.6 L3.9 39.6 L8.4 38.1 L12.6 36.0 L16.5 33.5 L19.9 30.6 L22.9 27.4 L25.4 23.9 L27.4 20.2 L28.9 16.3 L29.9 12.4 L30.4 8.5 L30.3 4.7 L29.8 0.9 L28.9 -2.6 L27.5 -5.9 L25.8 -8.9 L23.7 -11.5 L21.4 -13.9 L18.9 -15.8 L16.2 -17.3 L13.5 -18.5 L10.7 -19.2 L7.9 -19.5 L5.2 -19.4 L2.6 -19.0 L0.2 -18.2 L-2.0 -17.1 L-3.9 -15.8 L-5.5 -14.3 L-6.8 -12.6 L-7.7 -10.8 L-8.4 -8.9 L-8.6 -7.1 L-8.6 -5.3 L-8.2 -3.7 L-7.6 -2.3 L-6.7 -1.1 L-5.6 -0.2 L-4.4 0.3 L-3.1 0.2Z"/><circle r="12" fill="#7fffd4" opacity=".55"/><circle r="6" fill="#fff"/></svg>';
const L=document.createElement('div');L.className='gx';L.setAttribute('role','region');L.setAttribute('aria-label','the galaxy: every chapter as a star system');
L.innerHTML='<canvas class="gx-c" aria-hidden="true"></canvas><div class="gx-ls"></div><button type="button" class="gx-mark" aria-label="the galaxy">'+MARK+'</button><p class="gx-crumb" aria-live="polite">the galaxy</p>'+
  '<nav class="gx-cases" aria-label="case studies"><span>case studies</span><a href="../site-v4-galaxy/case/reel-2026/">Reel 2026</a><a href="../site-v4-galaxy/case/coca-cola/">Coca-Cola</a><a href="../site-v4-galaxy/case/bmw/">BMW</a><a href="../site-v4-galaxy/case/axe/">AXE</a></nav><p class="gx-hint">press a star system · press again or pinch to fly in</p><button type="button" class="gx-surf" aria-label="down to the water: site-v4-c home">the water ↓</button>';
document.body.appendChild(L);
/* a 'case study' link in v4-c's opened work, for the picks that have one (added beside v4-c's own meta line) */
const CASE={film:{w0:'reel-2026',w2:'coca-cola',w3:'axe',w4:'bmw'}};
(()=>{const imm=document.querySelector('.imm'),m=imm&&imm.querySelector('.imm-m');if(!m)return;const a=document.createElement('a');a.className='gx-case';a.hidden=true;a.textContent='case study →';m.after(a);
  const up=()=>{const d=window.__dive&&__dive.state(),c=d&&d.w&&CASE[d.k]&&CASE[d.k][d.w];if(a.hidden!==!c)a.hidden=!c;const h=c?'../site-v4-galaxy/case/'+c+'/':'';if(c&&a.getAttribute('href')!==h)a.setAttribute('href',h)};
  new MutationObserver(up).observe(imm,{attributes:true,attributeFilter:['hidden'],subtree:true,childList:true,characterData:true});addEventListener('hashchange',up);up()})();
const CV=$('.gx-c',L),LS=$('.gx-ls',L),CRUMB=$('.gx-crumb',L),HINT=$('.gx-hint',L);
const BACK=document.createElement('button');BACK.type='button';BACK.className='gx-back';BACK.hidden=true;BACK.innerHTML=MARK+'galaxy';BACK.setAttribute('aria-label','back out to the galaxy');document.body.appendChild(BACK);
SYS.forEach(s=>{const b=document.createElement('button');b.type='button';b.className='gx-l';b.dataset.k=s.k;b.setAttribute('aria-label',s.name+': '+s.ct+'. Press to select, press again to fly in');
  b.innerHTML=(s.glyph?s.glyph.outerHTML:'')+'<b>'+s.name+'</b><small>'+s.ct+'</small><i>press again to fly in</i>';LS.appendChild(b);s.lab=b;
  s.pl=s.picks.map(w=>{const it=s.items.find(x=>x.k===w);const p=document.createElement('span');p.className='gx-p';p.textContent=it?it.title.replace(/ · .*$/,''):w;LS.appendChild(p);return{w,el:p}})});
const CORE=document.createElement('span');CORE.className='gx-core sig';CORE.textContent='ᑕᐣᓯ';CORE.setAttribute('aria-hidden','true');LS.appendChild(CORE);
const LV=$('.zoom .lv');const setLv=t=>{if(LV)LV.dataset.gx=t};
/* ---------- renderer ---------- */
let R;try{R=new THREE.WebGLRenderer({canvas:CV,antialias:false,alpha:false,powerPreference:'high-performance'})}catch(e){throw new Error('no webgl')}
R.setClearColor(0x03050a,1);R.outputColorSpace=THREE.LinearSRGBColorSpace;
/* render scale: capped by a pixel budget (the galaxy is soft light, so a big desktop window renders at a lower internal resolution) */
const PRmax=Math.min(devicePixelRatio||1,PHONE?1.5:1.75),PXB=+(location.search.match(/[?&]gxpx=(\d+)/)||[])[1]||(PHONE?7e5:5e5);let PR=PRmax;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,2000);scene.add(cam);
{const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(32,54,0,32,54,96);g.addColorStop(0,'#16223a');g.addColorStop(.55,'#0a1120');g.addColorStop(1,'#03050a');x.fillStyle=g;x.fillRect(0,0,64,128);scene.background=new THREE.CanvasTexture(c)}
const BG=new THREE.Group();scene.add(BG); /* the only thing that turns: the background galaxy */
const U={uTime:{value:0},uScale:{value:600},uPR:{value:PR}};
let W=1,H=1;
/* soft round points (additive) */
const PV='attribute float aSize;attribute vec3 aColor;attribute float aAlpha;attribute float aPh;uniform float uTime;uniform float uScale;uniform float uOp;uniform float uTw;uniform float uDrift;varying vec3 vC;varying float vA;'+
 'void main(){vec3 p=position+uDrift*vec3(sin(uTime*.13+aPh*7.),cos(uTime*.11+aPh*5.)*.6,sin(uTime*.09+aPh*3.));vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;'+
 'float s=aSize*uScale/max(.1,-mv.z);gl_PointSize=clamp(s,1.,40.);vC=aColor;vA=aAlpha*uOp*min(1.,s*s*.6)*(1.-.85*smoothstep(16.,40.,s))*(1.-uTw+uTw*(.62+.38*sin(uTime*(1.3+aPh*2.)+aPh*40.)));}';
const PF='varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d2=dot(q,q);if(d2>.25)discard;float a=1.-d2*4.;a*=a*a;gl_FragColor=vec4(vC,a*vA);}';
function pointsMat(o){o=o||{};return new THREE.ShaderMaterial({uniforms:{uTime:U.uTime,uScale:U.uScale,uOp:{value:o.op==null?1:o.op},uTw:{value:o.tw||0},uDrift:{value:o.drift||0}},
  vertexShader:PV,fragmentShader:PF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})}
function cloud(n,fill){const P=new Float32Array(n*3),C=new Float32Array(n*3),S=new Float32Array(n),A=new Float32Array(n),H2=new Float32Array(n),c=new THREE.Color();
  for(let i=0;i<n;i++){const r=fill(i,c);P[i*3]=r[0];P[i*3+1]=r[1];P[i*3+2]=r[2];C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b;S[i]=r[3];A[i]=r[4];H2[i]=Math.random()}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aColor',new THREE.BufferAttribute(C,3));
  g.setAttribute('aSize',new THREE.BufferAttribute(S,1));g.setAttribute('aAlpha',new THREE.BufferAttribute(A,1));g.setAttribute('aPh',new THREE.BufferAttribute(H2,1));return g}
const rnd=(a,b)=>a+Math.random()*(b-a),gauss=()=>{let u=0;for(let i=0;i<4;i++)u+=Math.random();return (u-2)/1.15};
/* layer 1: far stars (a shell, they barely move: the deepest parallax) */
const far=new THREE.Points(cloud(PHONE?1800:2600,(i,c)=>{const u=Math.random()*2-1,t=Math.random()*Math.PI*2,r=rnd(320,520),s=Math.sqrt(1-u*u);
  c.setRGB(.82+Math.random()*.18,.88+Math.random()*.1,1);return[Math.cos(t)*s*r,u*r*.7+60,Math.sin(t)*s*r,rnd(.9,2.6),rnd(.35,.95)]}),pointsMat({tw:.55}));
scene.add(far);
/* layer 2: the spiral-arm dust field + bulge (turns slowly) */
const ARMS=2,GR=78;
const dust=new THREE.Points(cloud(PHONE?7000:12000,(i,c)=>{const arm=i%ARMS,f=Math.pow(Math.random(),.62),th=f*3.4*Math.PI,r=3+f*GR,
  a=th+arm*Math.PI*2/ARMS+gauss()*(.10+.10*(1-f)),sp=gauss()*r*.035,x=Math.cos(a)*r+sp,z=Math.sin(a)*r+gauss()*r*.035,y=gauss()*(1.6*(1-f)+.5);
  const warm=Math.max(0,1-f*2.4);if(Math.random()<.06)c.copy(MINT).lerp(new THREE.Color(1,1,1),.35);else if(Math.random()<.08)c.setRGB(.7,.6,1);else c.setRGB(.55+.45*warm,.68+.22*warm,1-.25*warm);
  return[x,y,z,rnd(.22,.62)*(1+warm*.6),rnd(.25,.7)*(.55+.45*(1-f))]}),pointsMat({op:.9,tw:.15}));
BG.add(dust);
const bulge=new THREE.Points(cloud(PHONE?1400:2400,(i,c)=>{const r=Math.abs(gauss())*6.5,t=Math.random()*Math.PI*2,u=gauss()*.5;c.setRGB(1,.86+Math.random()*.1,.7+Math.random()*.2);
  return[Math.cos(t)*r,u*r*.45,Math.sin(t)*r,rnd(.18,.55),rnd(.2,.6)]}),pointsMat({op:.5}));
BG.add(bulge);
/* layer 3: mid nebula layers (soft sprites at several depths) */
function glowTex(stops){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);stops.forEach(s=>g.addColorStop(s[0],s[1]));x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);return t}
const NEB=glowTex([[0,'rgba(255,255,255,1)'],[.25,'rgba(255,255,255,.45)'],[.6,'rgba(255,255,255,.1)'],[1,'rgba(255,255,255,0)']]);
const STAR=glowTex([[0,'rgba(255,255,255,1)'],[.08,'rgba(255,255,255,.95)'],[.2,'rgba(255,255,255,.4)'],[.45,'rgba(255,255,255,.1)'],[1,'rgba(255,255,255,0)']]);
const nebs=[];[[-30,-6,-20,70,'#3a5fb0',.16],[34,-4,10,64,'#4a3d9a',.14],[6,-8,-46,90,'#2a6f8a',.13],[-12,6,30,46,'#2f7f78',.10],[20,10,-8,40,'#5a4aa8',.09],[-40,12,8,36,'#3c78b8',.09],[0,-12,0,120,'#20305c',.18],[14,18,38,26,'#4fa8a0',.07]]
 .concat(Array.from({length:8},(_,i)=>{const arm=i%2,f=.18+.75*(i/8),th=f*3.4*Math.PI+arm*Math.PI,r=3+f*GR;return[Math.cos(th)*r,rnd(-1,1),Math.sin(th)*r,rnd(16,30)*(.7+f),['#3f6cc0','#3a8f9a','#5b4fb0','#4b7fd0'][i%4],.12]})).forEach(n=>{const m=new THREE.SpriteMaterial({map:NEB,color:n[4],transparent:true,opacity:n[5],depthWrite:false,blending:THREE.AdditiveBlending});const s=new THREE.Sprite(m);s.position.set(n[0],n[1],n[2]);s.scale.set(n[3],n[3]*.7,1);s.userData.b=n[3];s.userData.o=n[5];BG.add(s);nebs.push(s)});
/* layer 4: near motes (closest layer: strongest parallax, they stream past in flight) */
const motes=new THREE.Points(cloud(PHONE?380:600,(i,c)=>{c.setRGB(.8,.9,1);if(i%9===0)c.copy(MINT);return[rnd(-55,55),rnd(-6,34),rnd(-50,80),rnd(.08,.2),rnd(.4,.85)]}),pointsMat({drift:.8}));
scene.add(motes);
/* streaks: only in flight, attached to the camera */
const NS=PHONE?110:160,stP=new Float32Array(NS*6),stC=new Float32Array(NS*6),stD=[];
for(let i=0;i<NS;i++){const a=Math.random()*Math.PI*2,r=rnd(1.2,7),z=rnd(-70,-2),len=rnd(1.5,4);stD.push({x:Math.cos(a)*r,y:Math.sin(a)*r*.8,z,len});const g=rnd(.5,1);
  stC.set([.7*g,.85*g,g,0,0,0],i*6)}
const stG=new THREE.BufferGeometry();stG.setAttribute('position',new THREE.BufferAttribute(stP,3));stG.setAttribute('color',new THREE.BufferAttribute(stC,3));
const stM=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
const streaks=new THREE.LineSegments(stG,stM);streaks.frustumCulled=false;cam.add(streaks);
/* ---------- star systems ---------- */
const PV2='attribute float aSize;attribute vec3 aColor;attribute float aAlpha;attribute float aR;attribute float aPh;attribute float aW;uniform float uTime;uniform float uScale;uniform float uOp;uniform vec3 uC;uniform mat3 uTilt;varying vec3 vC;varying float vA;'+
 'void main(){float a=aPh+aW*uTime;vec3 p=uC+uTilt*vec3(cos(a)*aR,0.,sin(a)*aR);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float s=aSize*uScale/max(.1,-mv.z);gl_PointSize=clamp(s,1.5,120.);vC=aColor;vA=aAlpha*uOp;}';
const CAP=r=>6+r*5;
function slot(s){/* picks on the inner ring, the rest by age outwards */const order=s.items.map(x=>x.k),pk=s.picks.filter(w=>order.includes(w)),rest=order.filter(w=>!pk.includes(w)),seq=pk.concat(rest),out={};
  let ring=0,inr=0,ringStart=0;seq.forEach((w,j)=>{if(inr>=CAP(ring)){ring++;inr=0}out[w]={ring,inr};inr++});
  const per={};seq.forEach(w=>{const r=out[w].ring;per[r]=(per[r]||0)+1});seq.forEach(w=>out[w].n=per[out[w].ring]);return out}
const TILT=[[.42,.2],[.5,-.3],[.36,.5],[.55,.1],[.3,-.45]];
SYS.forEach((s,si)=>{const sl=slot(s),n=s.items.length;s.orb=[];const big=s.k==='film'?1.25:1;
  const P=new Float32Array(Math.max(1,n)*3),C=new Float32Array(n*3),Sz=new Float32Array(n),A=new Float32Array(n),Rr=new Float32Array(n),Ph=new Float32Array(n),Wv=new Float32Array(n);
  s.items.forEach((it,i)=>{const q=sl[it.k],r=(1.7+q.ring*.95)*big,ph=q.inr/q.n*Math.PI*2+q.ring*.9+si,w=.16/Math.sqrt(r);const pick=s.picks.includes(it.k),nw=s.news.includes(it.k);
    const age=n>1?i/(n-1):0,c=new THREE.Color(1,1,1).lerp(s.tint,.35);if(nw)c.copy(MINT);
    C.set([c.r,c.g,c.b],i*3);Sz[i]=pick?.7:(.4-.1*age)*(s.k==='about'?1.3:1);A[i]=pick?1:(.95-.4*age);Rr[i]=r;Ph[i]=ph;Wv[i]=w;s.orb[i]={r,ph,w}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));['aColor',C,3,'aSize',Sz,1,'aAlpha',A,1,'aR',Rr,1,'aPh',Ph,1,'aW',Wv,1].forEach((v,i,a)=>{if(i%3===0)g.setAttribute(v,new THREE.BufferAttribute(a[i+1],a[i+2]))});
  const tilt=new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(TILT[si][0],0,TILT[si][1])));s.tilt=tilt;s.c=new THREE.Vector3();
  const m=new THREE.ShaderMaterial({uniforms:{uTime:U.uTime,uScale:U.uScale,uOp:{value:1},uC:{value:s.c},uTilt:{value:tilt}},vertexShader:PV2,fragmentShader:PF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  s.pts=new THREE.Points(g,m);s.pts.frustumCulled=false;scene.add(s.pts);
  /* rings */const rings=new THREE.Group();const maxRing=Math.max.apply(null,Object.values(sl).map(q=>q.ring).concat([0]));
  for(let r=0;r<=maxRing;r++){const rr=(1.7+r*.95)*big,pts=[];for(let j=0;j<=72;j++){const a=j/72*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*rr,0,Math.sin(a)*rr).applyMatrix3(tilt))}
    rings.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:s.tint,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false})))}
  s.rings=rings;scene.add(rings);
  /* the star: core + halo */
  s.core=new THREE.Sprite(new THREE.SpriteMaterial({map:STAR,color:new THREE.Color(1,1,1).lerp(s.tint,.25),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:NEB,color:s.tint,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending}));
  scene.add(s.halo);scene.add(s.core);s.bright=s.k==='film'?1.25:1;s.selA=0;s.hot=0});
function planetPos(s,i,t,out){const o=s.orb[i],a=o.ph+o.w*t;return (out||new THREE.Vector3()).set(Math.cos(a)*o.r,0,Math.sin(a)*o.r).applyMatrix3(s.tilt).add(s.c)}
/* layout like v4-c's whole sky: about top, film left, photo right, sound bottom-left, objects bottom-right, the sig in the centre */
const LAY={about:[0,1.5,-1],film:[-.95,.5,-.22],photo:[.95,-.5,-.12],sound:[-.62,-.8,.86],objects:[.62,.9,.8]};
let HOME={pos:new THREE.Vector3(),look:new THREE.Vector3()};
function layout(){const a=W/H,port=a<.9,Rx=port?11.5:25,Rz=port?27:20;
  SYS.forEach(s=>{const p=LAY[s.k]||[0,0,0];s.c.set(p[0]*Rx,p[1],p[2]*Rz);s.core.position.copy(s.c);s.halo.position.copy(s.c);s.rings.position.copy(s.c)});
  cam.aspect=a;cam.fov=port?58:46;cam.updateProjectionMatrix();
  const el=port?.98:.7,dist=port?66:56;HOME.look.set(0,0,port?1.5:0);HOME.pos.set(0,Math.sin(el)*dist,Math.cos(el)*dist).add(HOME.look);
  U.uPR.value=PR;U.uScale.value=H*PR/(2*Math.tan(cam.fov*Math.PI/360))}
function resize(){const r=L.getBoundingClientRect();W=Math.max(1,Math.round(r.width));H=Math.max(1,Math.round(r.height));const pr=Math.min(PRmax,Math.sqrt(PXB/(W*H)));if(pr===PR&&W===resize.w&&H===resize.h)return;resize.w=W;resize.h=H;PR=pr;R.setPixelRatio(PR);R.setSize(W,H,false);layout()}
/* ---------- textures (decoded off the main thread where possible) ---------- */
const TEX={},abs=u=>new URL(u,document.baseURI).href;
function tex(src){if(!src)return null;const u=abs(src);if(TEX[u])return TEX[u];const e={t:null,w:1,h:1,p:null};TEX[u]=e;
  e.p=(window.createImageBitmap?fetch(u).then(r=>r.blob()).then(b=>createImageBitmap(b,{imageOrientation:'flipY'})).then(bm=>{const t=new THREE.Texture(bm);t.flipY=false;return t})
   :new Promise((ok,no)=>new THREE.TextureLoader().load(u,ok,null,no))).then(t=>{t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;const im=t.image;e.w=im.width;e.h=im.height;e.t=t;try{R.initTexture(t)}catch(x){}return e}).catch(()=>e);return e}
function preload(s,n){s.items.slice(0,n||24).forEach(it=>tex(it.src))}
/* ---------- tiles: a planet dot that becomes the board's poster tile ---------- */
const TV='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const TF='uniform sampler2D uMap;uniform float uHas;uniform vec2 uRep;uniform vec2 uOff;uniform vec2 uPx;uniform float uRad;uniform float uImg;uniform float uOp;uniform vec3 uDot;varying vec2 vUv;'+
 'float sd(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}'+
 'void main(){vec2 p=(vUv-.5)*uPx;float d=sd(p,uPx*.5,uRad);float m=clamp(.5-d,0.,1.);vec3 tx=uHas>.5?texture2D(uMap,vUv*uRep+uOff).rgb:vec3(.051,.082,.11);'+
 'float rr=length(vUv-.5)*2.;vec3 dc=mix(vec3(1.),uDot,smoothstep(.0,1.,rr));float da=mix(1.-smoothstep(.3,1.,rr),1.,uImg);gl_FragColor=vec4(mix(dc,tx,uImg),m*uOp*da);}';
const PLANE=new THREE.PlaneGeometry(1,1),tiles=[];
/* the board's own dark ground, rising behind the tiles as they land */
const VEIL=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x04070b,transparent:true,opacity:0,depthTest:false,depthWrite:false}));VEIL.renderOrder=9;VEIL.frustumCulled=false;VEIL.visible=false;scene.add(VEIL);
const LINE=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(128*3),3)),new THREE.LineBasicMaterial({color:0xd6e4ff,transparent:true,opacity:0,depthTest:false,depthWrite:false}));LINE.renderOrder=9.5;LINE.frustumCulled=false;LINE.visible=false;scene.add(LINE);
function tileMesh(){const m=new THREE.ShaderMaterial({uniforms:{uMap:{value:null},uHas:{value:0},uRep:{value:new THREE.Vector2(1,1)},uOff:{value:new THREE.Vector2()},uPx:{value:new THREE.Vector2(10,10)},uRad:{value:5},uImg:{value:0},uOp:{value:0},uDot:{value:new THREE.Color()}},
  vertexShader:TV,fragmentShader:TF,transparent:true,depthTest:false,depthWrite:false});const me=new THREE.Mesh(PLANE,m);me.renderOrder=10;me.frustumCulled=false;me.visible=false;scene.add(me);return me}
function cover(me,e,rw,rh){const u=me.material.uniforms;if(!e||!e.t){u.uHas.value=0;return}u.uMap.value=e.t;u.uHas.value=1;const ia=e.w/e.h,ra=rw/rh;
  if(ia>ra){u.uRep.value.set(ra/ia,1);u.uOff.value.set((1-ra/ia)/2,0)}else{u.uRep.value.set(1,ia/ra);u.uOff.value.set(0,(1-ia/ra)/2)}}
/* board rects: v4-c's real tiles (the .vis box, or the 9px dot of a list) that are on screen */
function boardRects(s){const out=[],lr=L.getBoundingClientRect();s.items.forEach((it,i)=>{const v=$('.vis',it.el);if(!v)return;const r=v.getBoundingClientRect();
  if(r.width<2||r.bottom<lr.top+2||r.top>lr.bottom-2||r.right<0||r.left>innerWidth)return;out.push({i,x:r.left-lr.left,y:r.top-lr.top,w:r.width,h:r.height,img:it.el.querySelector('.vis img'),vid:v.querySelector('video')})});return out}
/* final pose: straight-on in front of the system */
const DF=11,DT=4.5;
function finalPose(s){const pos=s.c.clone().add(new THREE.Vector3(0,0,DF)),q=new THREE.Quaternion();q.setFromRotationMatrix(new THREE.Matrix4().lookAt(pos,s.c,new THREE.Vector3(0,1,0)));/* camera convention: -z looks at the star */return{pos,q,look:s.c.clone()}}
function rectWorld(fp,r){const th=Math.tan(cam.fov*Math.PI/360),hh=DT*th,hw=hh*cam.aspect;const cx=(r.x+r.w/2)/W*2-1,cy=1-(r.y+r.h/2)/H*2;
  const p=new THREE.Vector3(cx*hw,cy*hh,-DT).applyQuaternion(fp.q).add(fp.pos);return{p,w:r.w/W*2*hw,h:r.h/H*2*hh}}
/* ---------- state ---------- */
let mode='off',sel=null,pre=0,F=null,intro=null,lastK=null,lastT=performance.now(),T=0,raf=0,drift={x:0,y:0,tx:0,ty:0};
const camPos=new THREE.Vector3(),camLook=new THREE.Vector3(),tmp=new THREE.Vector3(),tmp2=new THREE.Vector3();
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const bez=(a,b,c,d,t,o)=>{const u=1-t;return o.set(0,0,0).addScaledVector(a,u*u*u).addScaledVector(b,3*u*u*t).addScaledVector(c,3*u*t*t).addScaledVector(d,t*t*t)};
function restPose(o){/* home pose, nudged toward the selected system and by the pinch dolly */o.pos.copy(HOME.pos);o.look.copy(HOME.look);const s=sel&&BYK[sel];
  if(s){o.look.lerp(s.c,.22);const fp=finalPose(s);o.pos.lerp(fp.pos,.06+pre)}return o}
const REST={pos:new THREE.Vector3(),look:new THREE.Vector3()};
function setCam(p,l){cam.position.copy(p);cam.up.set(0,1,0);cam.lookAt(l)}
/* ---------- frame ---------- */
function frame(now){raf=0;const dt=Math.min(.05,(now-lastT)/1000);lastT=now;T+=dt;U.uTime.value=T;
  BG.rotation.y+=dt*.012;
  drift.x+= (drift.tx-drift.x)*Math.min(1,dt*1.6);drift.y+=(drift.ty-drift.y)*Math.min(1,dt*1.6);
  let speed=0;
  if(F){let t=clamp((now-F.t0)/F.dur,0,1);const H=window.__gx&&__gx.hold;if(H!=null&&t>H){t=H;F.t0=now-t*F.dur}F.t=t;flyStep(F,t,now);speed=F.spd||0;if(t>=1&&!F.done){F.done=true;F.end()}}
  else{restPose(REST);if(intro){const t=clamp((now-intro.t0)/intro.dur,0,1),e=1-Math.pow(1-t,3);REST.pos.lerp(intro.from,1-e);if(t>=1)intro=null}
    const k=1-Math.exp(-dt*2.6);camPos.lerp(REST.pos,k);camLook.lerp(REST.look,k);
    /* parallax drift: gentle, guided (pointer on desktop, a slow breath everywhere) */
    tmp.set(drift.x*3.2+Math.sin(T*.11)*1.4,drift.y*1.8+Math.sin(T*.083)*.9,0).applyQuaternion(cam.quaternion);
    setCam(tmp2.copy(camPos).add(tmp),camLook)}
  /* streaks */
  stM.opacity=clamp(speed,0,1)*.55;if(stM.opacity>.01){for(let i=0;i<NS;i++){const d=stD[i];d.z+=dt*(18+60*speed);if(d.z>-1.5)d.z-=68;const l=d.len*(.4+2.6*speed);stP.set([d.x,d.y,d.z,d.x,d.y,d.z-l],i*6)}stG.attributes.position.needsUpdate=true}
  /* fill-rate guard: a sprite never grows past a share of the view as the camera nears it (no full-screen overdraw in flight) */
  nebs.forEach(n=>{n.getWorldPosition(nv);const d=nv.distanceTo(cam.position),b=n.userData.b,z=Math.min(b,d*.9);n.scale.set(z,z*.7,1);n.material.opacity=n.userData.o*smooth(.25,.9,d/b)});
  /* systems */
  SYS.forEach(s=>{const on=sel===s.k?1:0;s.selA+=(on-s.selA)*Math.min(1,dt*5);const dim=sel&&!on?.55:1,p=1+.08*Math.sin(T*2.2+s.c.x);
    const dC=s.c.distanceTo(cam.position),sz=Math.min((3.4+2.6*s.selA)*s.bright*p,dC*.2);s.core.scale.set(sz,sz,1);s.core.material.opacity=Math.min(1,(.82+.18*s.selA)*dim*(s.fade==null?1:s.fade));
    const hz=Math.min(sz*3.2,dC*.55);s.halo.scale.set(hz,hz,1);s.halo.material.opacity=(.18+.22*s.selA)*dim*(s.fade==null?1:s.fade);
    s.pts.material.uniforms.uOp.value=(.8+.2*s.selA)*(dim*.9+.1)*(s.pfade==null?1:s.pfade);s.rings.children.forEach(r=>r.material.opacity=(.06+.16*s.selA)*(s.pfade==null?1:s.pfade))});
  R.render(scene,cam);labels(now);
  if(F||(mode!=='off'&&mode!=='board'&&mode!=='surface'))raf=requestAnimationFrame(frame)}
function kick(){if(!raf){lastT=performance.now();raf=requestAnimationFrame(frame)}}
const pv=new THREE.Vector3(),nv=new THREE.Vector3();
function proj(v){pv.copy(v).project(cam);return[(pv.x+1)/2*W,(1-pv.y)/2*H,pv.z]}
function labels(){if(F&&F.hideLabels)return;
  SYS.forEach(s=>{const p=proj(s.c),b=s.lab;const ok=p[2]<1;b.style.transform='translate3d('+Math.round(p[0]-b.offsetWidth/2)+'px,'+Math.round(p[1]+16+s.selA*10)+'px,0)';b.style.visibility=ok?'':'hidden';
    b.classList.toggle('on',sel===s.k);b.classList.toggle('dim',!!sel&&sel!==s.k);
    s.pl.forEach(q=>{const it=s.items.findIndex(x=>x.k===q.w);if(it<0)return;const pp=proj(planetPos(s,it,T));q.el.style.transform='translate3d('+Math.round(pp[0]+9)+'px,'+Math.round(pp[1]-6)+'px,0)';q.el.classList.toggle('on',sel===s.k&&s.selA>.6)})});
  const c=proj(HOME.look.clone().set(0,0,0));CORE.style.transform='translate3d('+Math.round(c[0]-CORE.offsetWidth/2)+'px,'+Math.round(c[1]-CORE.offsetHeight/2)+'px,0)'}
/* ---------- the flight ---------- */
function flyStep(f,t,now){const e=ease(t);
  if(f.dir>0){bez(f.P0,f.P1,f.P2,f.P3,e,tmp);tmp2.copy(f.L0).lerp(f.S,smooth(0,.62,t))}else{bez(f.P3,f.P2,f.P1,f.P0,e,tmp);tmp2.copy(f.S).lerp(f.L0,smooth(.25,1,t))}
  if(t>=1){if(f.dir>0){cam.position.copy(f.P3);cam.quaternion.copy(f.Q)}else setCam(f.P0,f.L0)}else setCam(tmp,tmp2);
  f.spd=f.prev&&t<1?clamp(cam.position.distanceTo(f.prev)/(f.len/f.dur*16.7)*.9,0,1.2):0;f.prev=(f.prev||new THREE.Vector3()).copy(cam.position);
  const s=f.s;s.pfade=f.dir>0?1-smooth(.3,.62,t):smooth(.45,.85,t);
  /* tiles */
  const th=Math.tan(cam.fov*Math.PI/360);
  {const fp=f.fp,o=f.dir>0?smooth(.62,1,t):1-smooth(0,.4,t),d=DT+.6,hh=d*Math.tan(cam.fov*Math.PI/360);VEIL.visible=o>.002;VEIL.material.opacity=o*.86;VEIL.position.set(0,0,-d).applyQuaternion(fp.q).add(fp.pos);VEIL.quaternion.copy(fp.q);VEIL.scale.set(hh*2*cam.aspect*1.3,hh*2*1.3,1)}
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
function makeFlight(s,dir,rects){const fp=finalPose(s);const f={s,dir,fp,S:s.c.clone(),Q:fp.q,P3:fp.pos.clone(),t0:0,dur:dir>0?(PHONE?2000:1900):1700,tl:[]};
  if(dir>0){f.P0=cam.position.clone();f.L0=camLook.clone()}else{restPose(REST);f.P0=REST.pos.clone();f.L0=REST.look.clone()}
  f.P1=f.P0.clone().lerp(f.S,.32).add(new THREE.Vector3(0,4,0));f.P2=fp.pos.clone().add(fp.pos.clone().sub(f.S).multiplyScalar(1.6)).add(new THREE.Vector3(0,3,0));
  f.len=f.P0.distanceTo(f.P3)*1.25;
  /* tiles */
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
function show(o){o=o||{};if(o.now){L.classList.add('gx-now');void L.offsetWidth}D.classList.add('gx-on');D.classList.remove('gx-boot');if(o.now)requestAnimationFrame(()=>L.classList.remove('gx-now'));
  if(window.__water&&__water.active)try{__water.active(false)}catch(e){}ui();kick()}
function hide(){D.classList.remove('gx-on');D.classList.remove('gx-fly');/* hand the water back to v4-c's own rule (dive.js: on unless it is night) */
  if(window.__water&&__water.active)try{__water.active(+getComputedStyle(D).getPropertyValue('--night')<.9)}catch(e){}ui()}
/* the pill sits in the dock's empty left side, centred on the zoom row */
function placeBack(){const z=document.querySelector('.zoom .zb');if(!z)return;const r=z.getBoundingClientRect();if(!r.height)return;BACK.style.bottom=Math.round(innerHeight-r.bottom+(r.height-40)/2)+'px'}
addEventListener('resize',()=>{if(!BACK.hidden)placeBack()});addEventListener('hashchange',()=>setTimeout(ui,0));
function ui(){const on=D.classList.contains('gx-on'),d=window.__dive&&__dive.state();BACK.hidden=on||mode==='home'||!!(d&&d.w);if(!BACK.hidden)placeBack();
  const s=sel&&BYK[sel];CRUMB.textContent=s?s.name+' · '+s.ct:'the galaxy';setLv(s?s.name+' · selected':'the galaxy');
  HINT.textContent=s?'press '+s.name+' again or pinch to fly in':'press a star system · press again or pinch to fly in'}
/* ---------- select / fly in ---------- */
function select(k){if(F||mode!=='home')return;if(sel!==k)pre=0;sel=k;if(k){preload(BYK[k],PHONE?18:30)}ui()}
function landUnder(s){/* v4-c's own route to the board (what the dock tab does), done instantly under the layer */
  const lv=BOARD_LV(s);__dive.go({k:s.k,lv},{noAnim:true,anchor:$('.head',s.el)});s.el.scrollIntoView({block:'start',behavior:'instant'})}
function flyIn(k){if(F||mode!=='home')return;const s=BYK[k];if(!s)return;sel=k;ui();D.classList.add('gx-fly');landUnder(s);lastK=k;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const rects=boardRects(s);F=makeFlight(s,1,rects);F.hideLabels=false;F.t0=performance.now();mode='fly';
    F.end=()=>{const imgs=rects.filter(r=>r.w>=20).map(r=>r.img).filter(Boolean),t0=performance.now();
      const wait=()=>{if(imgs.every(i=>i.complete&&i.naturalWidth>0)||performance.now()-t0>1400){handOver()}else setTimeout(wait,60)};wait()};kick()}))}
function handOver(){/* the real board is underneath at exactly these rects: crossfade the layer away */
  mode='board';hide();setTimeout(()=>{if(mode==='board'){dropVids(F);F=null;hideTiles();sel=null;pre=0;SYS.forEach(s=>{s.pfade=null;s.fade=null});ui()}},520)}
/* ---------- fly out ---------- */
let expectPop=0;
function curK(){const d=window.__dive&&__dive.state();return d&&d.k||lastK}
function flyOut(viaPop){if(F&&mode!=='board')return;const k=curK(),s=k&&BYK[k];
  if(!s){toGalaxy();if(!viaPop&&!homeHash())__dive.go({k:null},{noAnim:true});return}
  if(F){dropVids(F);F=null;hideTiles()}
  const rects=boardRects(s);resize();mode='fly';sel=k;pre=0;
  const f=makeFlight(s,-1,rects);f.hideLabels=true;D.classList.add('gx-fly');
  /* first frame: camera on the board pose, tiles exactly on the board */
  cam.position.copy(f.P3);cam.quaternion.copy(f.Q);f.tl.forEach(x=>{const me=x.me,u=me.material.uniforms;me.position.copy(x.end.p);me.quaternion.copy(f.Q);me.scale.set(x.end.w,x.end.h,1);u.uPx.value.set(x.r.w,x.r.h);u.uImg.value=x.dot?0:1;u.uRad.value=x.dot?Math.min(x.r.w,x.r.h)*.5:3;u.uOp.value=1;me.visible=true;if(!x.dot)liveVid(x,true)});LINE.visible=false;
  s.pfade=0;R.render(scene,cam);show();
  /* v4-c goes home underneath only once the layer is fully over it (end of the flight), so its relayout never costs flight frames */
  const goHome=()=>{if(!viaPop){if(window.__v4&&__v4.prevIs('')&&history.length>1){expectPop++;history.back()}else __dive.go({k:null},{noAnim:true})}};
  setTimeout(()=>{
    F=f;F.t0=performance.now()+(PHONE?120:80);F.end=()=>{goHome();dropVids(f);F=null;hideTiles();mode='home';s.fade=null;camPos.copy(f.P0);camLook.copy(f.L0);D.classList.remove('gx-fly');s.pfade=null;sel=k;pre=0;ui();
      scrollTo({top:0,behavior:'instant'});setTimeout(()=>{if(mode==='home')scrollTo({top:0,behavior:'instant'})},50)};kick()},260)}
function toGalaxy(){/* from the surface (v4-c home) or a page with no board in view: the galaxy simply fades in */
  mode='home';sel=null;pre=0;F=null;hideTiles();resize();restPose(REST);camPos.copy(REST.pos).add(new THREE.Vector3(0,6,14));camLook.copy(REST.look);setCam(camPos,camLook);L.classList.add('gx-slow');show();setTimeout(()=>L.classList.remove('gx-slow'),950)}
function toSurface(){if(F)return;mode='surface';sel=null;hide();setTimeout(()=>{if(mode==='surface'){cancelAnimationFrame(raf);raf=0}},500)}
/* ---------- input on the galaxy ---------- */
const ptr=new Map();let pinch=null,downAt=null,wAcc=0;
function hit(x,y){let best=null,bd=1e9;SYS.forEach(s=>{const p=proj(s.c);const d=Math.hypot(p[0]-x,p[1]-y);const rr=PHONE?54:44;if(d<rr&&d<bd){bd=d;best=s}});return best}
function press(k){if(F||mode!=='home')return;if(!k){if(sel){sel=null;pre=0;ui()}return}if(sel===k)flyIn(k);else select(k)}
L.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptr.size===1)downAt={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};
  if(ptr.size===2){const a=[...ptr.values()];pinch={d0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,pre0:pre,mx:(a[0].x+a[1].x)/2,my:(a[0].y+a[1].y)/2};downAt=null;
    if(!sel){const s=hit(pinch.mx,pinch.my)||BYK.film;select(s.k)}}});
L.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!ptr.size){drift.tx=(e.clientX/W-.5)*2;drift.ty=-(e.clientY/H-.5)*2;return}
  if(!ptr.has(e.pointerId))return;ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(downAt&&Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y)>12)downAt=null;
  if(pinch&&ptr.size===2&&!F){const a=[...ptr.values()],r=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/pinch.d0;const v=pinch.pre0+(r-1)*.22;
    if(v>.2&&sel){pinch=null;flyIn(sel);return}pre=clamp(v,0,.16)}});
function up(e){const had=ptr.has(e.pointerId);ptr.delete(e.pointerId);if(ptr.size<2)pinch=null; /* release: the view rests exactly where it is */
  if(had&&downAt&&downAt.id===e.pointerId&&e.type==='pointerup'){const d=downAt;downAt=null;if(performance.now()-d.t<700){const s=hit(e.clientX,e.clientY);press(s?s.k:null)}}}
L.addEventListener('pointerup',up);L.addEventListener('pointercancel',up);
L.addEventListener('click',e=>{if(e.target.closest('.gx-mark')){e.preventDefault();if(mode==='home'&&!F&&sel){sel=null;pre=0;ui()}return}const b=e.target.closest('.gx-l');if(b){e.preventDefault();press(b.dataset.k);return}if(e.target.closest('.gx-surf')){e.preventDefault();toSurface()}});
L.addEventListener('wheel',e=>{e.preventDefault();if(F||mode!=='home')return;wAcc+=-e.deltaY*(e.ctrlKey?.01:.0025);
  if(!sel&&wAcc>.02){const s=hit(e.clientX,e.clientY)||BYK.film;select(s.k)}
  if(sel){const v=pre+wAcc;wAcc=0;if(v>.2){flyIn(sel);return}pre=clamp(v,0,.16)}else wAcc=0},{passive:false});
['gesturestart','gesturechange'].forEach(n=>L.addEventListener(n,e=>e.preventDefault(),{passive:false}));
addEventListener('keydown',e=>{if(mode!=='home'||F)return;if(e.key==='Escape'&&sel){sel=null;pre=0;ui()}});
BACK.addEventListener('click',e=>{e.preventDefault();const d=window.__dive&&__dive.state();if(mode==='surface'||!d||!d.k){toGalaxy();if(!homeHash())__dive.go({k:null},{noAnim:true});return}flyOut(false)});
/* the dock while the galaxy is up: a tab flies to that system, + flies into the selected one (− has nothing below the galaxy) */
addEventListener('click',e=>{if(!D.classList.contains('gx-on')||e.button)return;const a=e.target.closest&&e.target.closest('.tabs a[data-t],.zoom .zb');if(!a)return;
  e.preventDefault();e.stopImmediatePropagation();if(F||mode!=='home')return;
  if(a.dataset.t){const k=a.dataset.t;if(BYK[k]){sel=k;preload(BYK[k]);flyIn(k)}}else if(a.dataset.z==='1'){if(sel)flyIn(sel);else select('film')}else if(sel){sel=null;pre=0;ui()}},true);
/* one level above v4-c: on a chapter's constellation (L1), − or a pinch-in goes up to the galaxy instead of v4-c's glyph row.
   L2 and the work keep v4-c's own steps (a pinch-out on the constellation is v4-c's move onto its board) */
addEventListener('click',e=>{if(D.classList.contains('gx-on')||F||e.button)return;const a=e.target.closest&&e.target.closest('.zoom .zb');if(!a||a.dataset.z==='1')return;
  if(D.classList.contains('sheet-on')||D.classList.contains('one-on'))return;const d=window.__dive&&__dive.state();if(!d||!d.k||!BYK[d.k]||d.w||d.lv!==1)return;
  e.preventDefault();e.stopImmediatePropagation();mode='board';flyOut(false)},true);
let bp=null;
addEventListener('touchstart',e=>{if(e.touches.length!==2||D.classList.contains('gx-on')||D.classList.contains('sheet-on')||D.classList.contains('one-on')||F){bp=null;return}
  const imm=$('.imm');if(imm&&!imm.hidden){bp=null;return}const d=window.__dive&&__dive.state();if(!d||!d.k||!BYK[d.k]||d.lv>1){bp=null;return} /* on L2 a pinch-in is v4-c's own step back to its constellation */
  const t=e.touches;bp={d0:Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)||1,done:false}},{capture:true,passive:true});
addEventListener('touchmove',e=>{if(!bp||e.touches.length!==2)return;const t=e.touches,r=Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)/bp.d0;
  if(r<.97){e.stopPropagation();if(e.cancelable)e.preventDefault()}if(r<.74&&!bp.done){bp.done=true;mode='board';flyOut(false)}},{capture:true,passive:false});
addEventListener('touchend',e=>{if(e.touches.length<2)bp=null},{capture:true,passive:true});
/* addresses: Back to home flies out; any other address leaves the galaxy */
addEventListener('popstate',()=>{if(expectPop){expectPop--;if(mode==='home')requestAnimationFrame(()=>scrollTo({top:0,behavior:'instant'}));return}
  if(homeHash()){if(mode==='board'||mode==='off'){flyOut(true)}}
  else if(D.classList.contains('gx-on')&&!F){mode='off';hide()}},true);
addEventListener('resize',()=>{if(mode==='home'||F)resize()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(mode==='home'||F))kick()});
/* boot */
resize();
window.__gx={info:()=>({tex:Object.keys(TEX).length,gl:R.info.memory,prog:R.info.programs.length,calls:R.info.render.calls,tri:R.info.render.triangles,vis:tiles.filter(t=>t.visible).length,line:LINE.visible,pr:R.getPixelRatio(),sel,mode}),state:()=>({mode,sel,pre:+pre.toFixed(3),cam:cam.position.toArray().map(v=>+v.toFixed(3)),t:F?+(F.t||0).toFixed(3):null,dir:F?F.dir:0,on:D.classList.contains('gx-on')}),select:k=>{press(k)},fly:k=>{if(sel!==k)select(k);flyIn(k)},out:()=>flyOut(false),
  toGalaxy,toSurface,
  /* QA: the tiles' projected rects vs the DOM board rects they hand over to */
  match:()=>{const s=BYK[lastK];if(!s)return null;const rs=boardRects(s);return tiles.filter(t=>t.visible).map((t,j)=>{const c=[[-.5,-.5],[.5,.5]].map(q=>{const v=new THREE.Vector3(q[0],q[1],0).applyMatrix4(t.matrixWorld).project(cam);return[(v.x+1)/2*W,(1-v.y)/2*H]});
    const x=Math.min(c[0][0],c[1][0]),y=Math.min(c[0][1],c[1][1]),w=Math.abs(c[1][0]-c[0][0]),h=Math.abs(c[1][1]-c[0][1]);const r=rs[j];return r?{dx:+(x-r.x).toFixed(2),dy:+(y-r.y).toFixed(2),dw:+(w-r.w).toFixed(2),dh:+(h-r.h).toFixed(2)}:null})},
  tiles:()=>tiles.filter(t=>t.visible).map(t=>{const m=t.material.uniforms.uMap.value;return(Object.keys(TEX).find(k=>TEX[k].t===m)||'-').slice(-28)}),
  systems:()=>SYS.map(s=>{const p=proj(s.c);return{k:s.k,x:p[0],y:p[1]}}),PHONE};
if(homeHash()){mode='home';restPose(REST);intro={t0:performance.now(),dur:2600,from:HOME.pos.clone().multiplyScalar(1.35).add(new THREE.Vector3(0,8,0))};camPos.copy(intro.from);camLook.copy(REST.look);setCam(camPos,camLook);
  preload(BYK.film,PHONE?12:24);R.render(scene,cam);L.classList.add('gx-slow');show();setTimeout(()=>L.classList.remove('gx-slow'),950)}
else{mode='off';off();ui()}
}
