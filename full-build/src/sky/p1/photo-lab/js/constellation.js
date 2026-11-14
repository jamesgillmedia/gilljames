/* Photo lab · constellation, the widest level.
   constellation --pinch in--> contact sheet --pinch out--> constellation; the sheet pinches in to the horizon, which pinches out to the constellation.
   Tap a star to zoom into that photograph on the horizon. Esc / ‹ rise back to the horizon.
   Camera: the site's critically damped spring (sstep, glide weight 4.8, look weight 9.5), so each level change glides and settles.
   Desktop: ctrl+wheel (trackpad pinch), + / - keys, arrows move the ring, Enter = pinch in. */
(function(){
'use strict';
var LAB=window.LAB,P=LAB.photos;
function S(x,w){return{x:x,v:0,t:x,w:w}}
function sstep(s,dt){var w=s.w,e=s.x-s.t,k=Math.exp(-w*dt),c=s.v+w*e;s.x=s.t+(e+c*dt*1)*k;s.v=(s.v-w*c*dt)*k}
function aim(s,t,instant){s.t=t;s.w=instant?40:W_GLIDE;if(instant){s.x=t;s.v=0}}
var W_GLIDE=4.8,W_LOOK=9.5;
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function ease(u){u=clamp(u,0,1);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function rnd(i){var x=Math.sin(i*12.9898+78.233)*43758.5453;return x-Math.floor(x)}

/* the same spring, on a whole layer: a level change reads as a zoom, not a fade */
LAB.zoom=function(el,from,to){
  if(!el)return;to=to==null?1:to;
  var z=el._zoom||(el._zoom={s:S(from,W_GLIDE),run:false,t:0});
  z.s.x=from;z.s.v=0;z.s.t=to;z.s.w=W_GLIDE;el.style.transform='scale('+from+')';
  if(z.run)return;z.run=true;z.t=performance.now();
  (function f(n){var dt=Math.min(.05,(n-z.t)/1000);z.t=n;sstep(z.s,dt);
    if(Math.abs(z.s.x-z.s.t)<.0004&&Math.abs(z.s.v)<.002){z.run=false;el.style.transform=z.s.t===1?'':'scale('+z.s.t+')';return}
    el.style.transform='scale('+z.s.x.toFixed(4)+')';requestAnimationFrame(f)})(z.t);
};

/* ---------- the level mark: three dots along the loop, and where a pinch goes next ---------- */
var LV=[
  {k:'constellation',next:'pinch in',to:'sheet'},
  {k:'sheet',next:'pinch out',to:'constellation'},
  {k:'horizon',next:'pinch out',to:'constellation'}];
var mark=document.createElement('div');mark.className='lvl';mark.setAttribute('aria-hidden','true');
mark.innerHTML='<i></i><i></i><i></i><span></span>';document.body.appendChild(mark);
function levelNow(){var t=LAB.layer.top();return t===''?1:t==='horizon'?2:t==='constellation'?0:-1}
function paintMark(){var i=levelNow();mark.classList.toggle('off',i<0);if(i<0)return;
  var d=mark.children;for(var k=0;k<3;k++)d[k].classList.toggle('on',k===i);
  mark.lastChild.textContent=LV[i].next+' › '+LV[i].to;mark.dataset.lv=LV[i].k}
document.addEventListener('lab:layer',paintMark);

/* ---------- the stars ---------- */
var el=document.createElement('section');el.className='cstl';el.id='cstl';el.hidden=true;
el.setAttribute('aria-label','constellation: every photograph as a star. Pinch in for the contact sheet, tap a star for that photograph.');
var lb=document.createElement('i');lb.className='lamp-bloom';lb.setAttribute('aria-hidden','true');el.appendChild(lb);
var cv=document.createElement('canvas');el.appendChild(cv);
var g=cv.getContext('2d'),W=0,H=0,DPR=1;
var stars=[],byId={},edges=[],glows={},imgs={},field=[],fitS=1,maxR=1,sel=0,shown=false,raf=0,lastT=0,exitStar=-1,toSheetFlag=false,hideT=0;
var cxS=S(0,W_GLIDE),cyS=S(0,W_GLIDE),csS=S(1,W_GLIDE),lxS=S(0,W_LOOK),lyS=S(0,W_LOOK);
var drag=null,ptrs={};
var ZIN=5.5;

function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function glow(rgb){var k=rgb.join(',');if(glows[k])return glows[k];var c=document.createElement('canvas');c.width=c.height=128;var q=c.getContext('2d'),gr=q.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+k+',.95)');gr.addColorStop(.18,'rgba('+k+',.4)');gr.addColorStop(.55,'rgba('+k+',.08)');gr.addColorStop(1,'rgba('+k+',0)');
  q.fillStyle=gr;q.fillRect(0,0,128,128);return glows[k]=c}
function layout(){
  var order=P.slice().sort(function(a,b){return a.lum-b.lum});
  stars=order.map(function(p,i){var a=i*2.39996+(rnd(i+1)-.5)*.55,r=Math.sqrt(i+.5)*62*(1+(rnd(i+9)-.5)*.34);
    var c=p.sat<.06?[205,225,255]:hex(p.avg).map(function(v){return Math.round(lerp(v,235,.55))});
    var s={p:p,i:i,x:Math.cos(a)*r,y:Math.sin(a)*r*.92,b:clamp(.3+p.lum*.7,.3,1),tint:c,ph:rnd(i+40)*6.28,sx:0,sy:0};byId[p.id]=s;return s});
  maxR=0;stars.forEach(function(s){maxR=Math.max(maxR,Math.hypot(s.x,s.y))});
  edges=[];
  for(var k=1;k<stars.length;k++){var best=-1,bd=1e9,second=-1,sd=1e9;
    for(var j=0;j<k;j++){var d=Math.hypot(stars[k].x-stars[j].x,stars[k].y-stars[j].y);
      if(d<bd){second=best;sd=bd;best=j;bd=d}else if(d<sd){second=j;sd=d}}
    edges.push([k,best]);if(k%4===0&&second>=0&&sd<bd*1.9)edges.push([k,second])}
  for(var q=0;q<2;q++){var pts=[];for(var n=0;n<(q?46:80);n++)pts.push({x:rnd(n*3+q*101+1),y:rnd(n*3+q*101+2),r:q?.7:1.05,b:rnd(n*3+q*101+3)});field.push({f:q?.4:1,a:q?.5:.85,pts:pts})}
}
function fit(){W=innerWidth;H=innerHeight;DPR=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';
  fitS=Math.min((W-36)*.5,(H-150)*.5)/maxR}
function cam(){return{x:cxS.x+lxS.x/csS.x,y:cyS.x+lyS.x/csS.x,s:Math.max(.02,csS.x)}}
function sp(x,y,c){return[(x-c.x)*c.s+W/2,(y-c.y)*c.s+H/2+(c.s<fitS*1.5?8:0)]}
function load(s){if(!imgs[s.p.id]){var im=new Image();im.decoding='async';im.src=LAB.th(s.p);imgs[s.p.id]=im}return imgs[s.p.id]}
function cover(im,x,y,w,h){var iw=im.naturalWidth,ih=im.naturalHeight;if(!iw)return;var r=Math.max(w/iw,h/ih),sw=w/r,sh=h/r;g.drawImage(im,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h)}

function draw(t){
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  var c=cam(),Z=c.s/fitS,e=ease((Z-1.8)/2.4);
  field.forEach(function(L){g.globalAlpha=L.a;
    L.pts.forEach(function(p){var x=((p.x*W-c.x*c.s*L.f*.15)%W+W)%W,y=((p.y*H-c.y*c.s*L.f*.15)%H+H)%H;
      g.fillStyle='rgba(220,230,245,'+(.25+p.b*.6)+')';g.beginPath();g.arc(x,y,p.r,0,7);g.fill()})});
  g.globalAlpha=1;
  stars.forEach(function(s){var q=sp(s.x,s.y,c);s.sx=q[0];s.sy=q[1]});
  g.lineWidth=1;g.strokeStyle='rgba(170,200,240,'+(.34*(1-e)).toFixed(3)+')';g.beginPath();
  edges.forEach(function(E){var a=stars[E[0]],b=stars[E[1]];if(!a.on||!b.on)return;g.moveTo(a.sx,a.sy);g.lineTo(b.sx,b.sy)});g.stroke();
  var gz=clamp(Math.pow(Z,.35),1,2.4);
  stars.forEach(function(s){
    if(!s.on)return;
    if(s.sx<-200||s.sx>W+200||s.sy<-200||s.sy>H+200)return;
    var on=s.i===sel,pulse=1+.07*Math.sin(t/900+s.ph),gs=(5+16*s.b)*pulse*gz*(on?1.25:1);
    g.globalAlpha=(.45+.5*s.b)*(1-e*.7);g.drawImage(glow(s.tint),s.sx-gs,s.sy-gs,gs*2,gs*2);
    g.globalAlpha=1-e*.85;g.fillStyle='#fff';g.beginPath();g.arc(s.sx,s.sy,Math.max(1.1,1+s.b*1.6),0,7);g.fill();
    if(e>.02){var im=load(s),asp=s.p.w/s.p.h,h=lerp(6,26*Z,e),w=h*asp;if(w>h*1.4){w=h*1.4;h=w/asp}
      g.globalAlpha=Math.min(1,e*1.3);
      if(im.complete&&im.naturalWidth)cover(im,s.sx-w/2,s.sy-h/2,w,h);else{g.fillStyle='rgba('+s.tint+',.16)';g.fillRect(s.sx-w/2,s.sy-h/2,w,h)}
      g.strokeStyle=on?'rgba(85,218,161,.95)':'rgba(220,230,240,.28)';g.lineWidth=on?1.6:1;g.strokeRect(s.sx-w/2+.5,s.sy-h/2+.5,w-1,h-1)}
    g.globalAlpha=1;
    if(on&&e<.5){g.strokeStyle='rgba(85,218,161,'+(.9*(1-e*2)).toFixed(2)+')';g.lineWidth=1.2;g.beginPath();g.arc(s.sx,s.sy,11,0,7);g.stroke();
      g.font='300 10px Poppins,sans-serif';g.textAlign='center';g.textBaseline='top';g.fillStyle='rgba(238,243,245,'+(.85*(1-e*2)).toFixed(2)+')';g.fillText(LAB.num(s.p),s.sx,s.sy+16)}
  });
  g.globalAlpha=1;
}
function frame(n){raf=0;if(!shown)return;var dt=Math.min(.05,(n-lastT)/1000);lastT=n;
  if(!drag){sstep(lxS,dt);sstep(lyS,dt)}sstep(cxS,dt);sstep(cyS,dt);sstep(csS,dt);
  draw(n);raf=requestAnimationFrame(frame)}
function run(){if(!raf){lastT=performance.now();raf=requestAnimationFrame(frame)}}

function pick(x,y,max){var best=-1,bd=max*max;stars.forEach(function(s){if(!s.on)return;var d=(s.sx-x)*(s.sx-x)+(s.sy-y)*(s.sy-y);if(d<bd){bd=d;best=s.i}});return best}
function frameIndex(i){var L=LAB.hz.list(),id=stars[i].p.id;return L.findIndex(function(p){return p.id===id})}

function openIt(){
  if(shown)return;
  if(LAB.layer.top()==='')LAB.hz.enter();
  if(LAB.layer.top()!=='horizon')return;
  if(!stars.length)layout();fit();var inL={};LAB.hz.list().forEach(function(p){inL[p.id]=1});stars.forEach(function(s){s.on=!!inL[s.p.id]});clearTimeout(hideT);toSheetFlag=false;exitStar=-1;
  var L=LAB.hz.list(),cur=L[LAB.hz.cur()];sel=byId[cur.id].i;var st=stars[sel];
  aim(cxS,st.x,true);aim(cyS,st.y,true);aim(csS,fitS*ZIN,true);aim(lxS,0,true);aim(lyS,0,true);
  stars.forEach(function(s){if(s.on)load(s)});
  shown=true;el.hidden=false;void el.offsetWidth;draw(performance.now());
  csS.w=cxS.w=cyS.w=W_GLIDE;aim(cxS,0);aim(cyS,0);aim(csS,fitS);
  el.classList.add('open');run();
  LAB.zoom(LAB.hz.sky,1,.94);
  LAB.hz.where('constellation');
  LAB.layer.push('constellation',leave);
  LAB.hint('pinch in: contact sheet · tap a star: its photograph',4200);
}
function leave(){
  var st=stars[exitStar>=0?exitStar:sel];
  aim(cxS,st.x);aim(cyS,st.y);aim(csS,fitS*ZIN);el.classList.remove('open');
  if(!toSheetFlag){LAB.zoom(LAB.hz.sky,.94,1);LAB.hz.where('horizon')}
  hideT=setTimeout(function(){if(el.classList.contains('open'))return;shown=false;el.hidden=true},1100);
}
function toSheet(i){
  if(!shown||LAB.layer.top()!=='constellation')return;
  exitStar=i>=0?i:sel;var fi=frameIndex(exitStar);if(fi>=0)LAB.hz.set(fi);
  toSheetFlag=true;LAB.layer.unwind();
}
function intoPhoto(i){
  if(!shown||LAB.layer.top()!=='constellation')return;
  exitStar=i;var fi=frameIndex(i);if(fi>=0)LAB.hz.set(fi);
  toSheetFlag=false;LAB.layer.back();
}
LAB.constellation={open:openIt,toSheet:toSheet,isOpen:function(){return shown&&LAB.layer.top()==='constellation'}};

/* ---------- touch and mouse: drag looks a little (never moves the camera for good), tap a star goes in, pinch goes in ---------- */
el.addEventListener('pointerdown',function(e){ptrs[e.pointerId]=1;if(Object.keys(ptrs).length>1){drag=null;return}
  drag={x:e.clientX,y:e.clientY,m:false};el.setPointerCapture(e.pointerId)});
el.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>8)drag.m=true;
  if(drag.m){aim(lxS,clamp(-dx*.5,-70,70),true);aim(lyS,clamp(-dy*.5,-70,70),true);lxS.w=lyS.w=W_LOOK}});
function up(e){delete ptrs[e.pointerId];if(!drag)return;var d=drag;drag=null;aim(lxS,0);aim(lyS,0);lxS.w=lyS.w=W_LOOK;
  if(!d.m&&e.type==='pointerup'){var i=pick(e.clientX,e.clientY,34);if(i>=0)intoPhoto(i)}}
el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
el.addEventListener('wheel',function(e){if(!e.ctrlKey)e.preventDefault()},{passive:false});
LAB.pinch(el,{in:function(x,y){var i=pick(x,y,Math.max(W,H));toSheet(i)},out:function(){}});

document.addEventListener('keydown',function(e){if(!LAB.constellation.isOpen())return;var k=e.key;
  if(k==='+'||k==='='||k==='Enter'){toSheet(sel);e.preventDefault()}
  else if(k==='Escape'){LAB.layer.back();e.preventDefault();e.stopImmediatePropagation()}
  else if(k==='ArrowRight'||k==='ArrowLeft'){var L=LAB.hz.list(),fi=frameIndex(sel)+(k==='ArrowRight'?1:-1);if(fi>=0&&fi<L.length)sel=byId[L[fi].id].i;e.preventDefault()}},true);
addEventListener('resize',function(){if(!stars.length)return;fit();if(shown&&el.classList.contains('open')){aim(csS,fitS,true);aim(cxS,0,true);aim(cyS,0,true)}});

document.body.appendChild(el);
if(LAB.layer)paintMark();
})();
