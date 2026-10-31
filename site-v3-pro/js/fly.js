/* Fly through the stars: an opt-in, isolated full-screen zone at the bottom of the sky. Pinch / drag / wheel fly the camera;
   names appear as you get close (greedy declutter: a name only shows if its box is free). Tap a star to open that work. */
(function(){
var btn=document.querySelector('.fly-btn'),box=document.querySelector('.fly');if(!btn||!box)return;btn.hidden=false;
var cv=box.querySelector('canvas'),ctx=cv.getContext('2d'),X=box.querySelector('.x'),W=0,H=0,dpr=1,stars=[],cam={x:0,y:0,z:.35},raf=0,ptr=new Map(),moved=0,t0=0;
var C=[['film',0,-420],['photo',380,-80],['objects',-380,40],['sound',260,380],['about',-180,420]];
function build(){stars=[];C.forEach(function(c,ci){var ch=document.getElementById(c[0]);if(!ch)return;var its=ch.querySelectorAll('.it'),n=its.length;
  its.forEach(function(it,i){var a=i*2.399,r=28+Math.sqrt(i)*34;var lab=(it.querySelector('.cap b')||{}).textContent||'';
    stars.push({k:c[0],w:it.dataset.k,x:c[1]+Math.cos(a)*r,y:c[2]+Math.sin(a)*r,lab:lab,i:i})});
  stars.push({k:c[0],chap:1,x:c[1],y:c[2]-(28+Math.sqrt(n)*34)-26,lab:c[0]})});
  stars.push({pole:1,x:0,y:0,lab:'ᑕᐣᓯ'})}
function size(){dpr=Math.min(2,devicePixelRatio||1);W=box.clientWidth;H=box.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
function sp(s){return{x:(s.x-cam.x)*cam.z+W/2,y:(s.y-cam.y)*cam.z+H/2}}
function draw(){raf=0;ctx.clearRect(0,0,W,H);var g=ctx.createRadialGradient(W/2,H/3,10,W/2,H/2,Math.max(W,H));g.addColorStop(0,'#13202e');g.addColorStop(1,'#03060b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(190,220,245,.25)';ctx.lineWidth=1;var prev=null;
  stars.forEach(function(s){if(s.chap||s.pole){prev=null;return}var p=sp(s);if(prev&&prev.k===s.k){ctx.beginPath();ctx.moveTo(prev.p.x,prev.p.y);ctx.lineTo(p.x,p.y);ctx.stroke()}prev={k:s.k,p:p}});
  var taken=[];function free(r){for(var i=0;i<taken.length;i++){var t=taken[i];if(r.x<t.x+t.w&&r.x+r.w>t.x&&r.y<t.y+t.h&&r.y+r.h>t.y)return false}taken.push(r);return true}
  stars.slice().sort(function(a,b){return(b.chap||b.pole?1:0)-(a.chap||a.pole?1:0)}).forEach(function(s){var p=sp(s);if(p.x<-60||p.y<-60||p.x>W+60||p.y>H+60)return;
    if(s.pole){ctx.font='700 '+Math.max(22,40*cam.z)+'px Syl, sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.shadowColor='rgba(200,230,255,.9)';ctx.shadowBlur=18;ctx.fillText(s.lab,p.x,p.y+10);ctx.shadowBlur=0;return}
    if(s.chap){ctx.font='400 '+Math.round(Math.max(13,18*cam.z))+'px "Julius Sans One", sans-serif';ctx.textAlign='center';var w=ctx.measureText(s.lab.toUpperCase()).width;
      if(free({x:p.x-w/2-4,y:p.y-16,w:w+8,h:22})){ctx.fillStyle='#55DAA1';ctx.fillText(s.lab.toUpperCase(),p.x,p.y)}return}
    var r=Math.max(1.4,Math.min(4,2.2*cam.z));ctx.fillStyle='#fff';ctx.shadowColor='rgba(190,225,255,.9)';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill();ctx.shadowBlur=0;
    if(cam.z>1.05){ctx.font='300 12px Poppins, sans-serif';ctx.textAlign='left';var lab=s.lab.length>28?s.lab.slice(0,27)+'…':s.lab,w2=ctx.measureText(lab).width;
      if(free({x:p.x+6,y:p.y-9,w:w2+4,h:16})){ctx.fillStyle='#eef3f5';ctx.fillText(lab,p.x+8,p.y+4)}}});
  }
function req(){if(!raf)raf=requestAnimationFrame(draw)}
function clampZ(z){return Math.max(.2,Math.min(4,z))}
function zoomAt(f,x,y){var wx=(x-W/2)/cam.z+cam.x,wy=(y-H/2)/cam.z+cam.y;cam.z=clampZ(cam.z*f);cam.x=wx-(x-W/2)/cam.z;cam.y=wy-(y-H/2)/cam.z;req()}
var pd=0,pm=null;
cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=0;t0=Date.now();if(ptr.size===2){var a=[...ptr.values()];pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}});
cv.addEventListener('pointermove',function(e){if(!ptr.has(e.pointerId))return;var o=ptr.get(e.pointerId),n={x:e.clientX,y:e.clientY};ptr.set(e.pointerId,n);
  if(ptr.size===1){cam.x-=(n.x-o.x)/cam.z;cam.y-=(n.y-o.y)/cam.z;moved+=Math.abs(n.x-o.x)+Math.abs(n.y-o.y);req()}
  else if(ptr.size===2){var a=[...ptr.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);moved=99;if(pd)zoomAt(d/pd,(a[0].x+a[1].x)/2,(a[0].y+a[1].y)/2);pd=d}});
function up(e){var was=ptr.size;ptr.delete(e.pointerId);if(ptr.size<2)pd=0;
  if(was===1&&moved<10&&Date.now()-t0<500){var best=null,bd=26;stars.forEach(function(s){if(s.pole)return;var p=sp(s),d=Math.hypot(p.x-e.clientX,p.y-e.clientY);if(d<bd){bd=d;best=s}});
    if(best){close();var k=best.k,lv=best.chap?1:(k==='about'?1:3);window.__dive&&__dive.go(lv===3?{k:k,lv:3,w:best.w}:{k:k,lv:1});document.getElementById(k).scrollIntoView({block:'start'})}}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',function(e){ptr.delete(e.pointerId);pd=0});
cv.addEventListener('wheel',function(e){e.preventDefault();zoomAt(Math.exp(-e.deltaY*.0025),e.clientX,e.clientY)},{passive:false});
function open(){if(!stars.length)build();box.hidden=false;document.documentElement.classList.add('modal');size();cam={x:0,y:0,z:Math.min(W,H)/1150};req();X.focus()}
function close(){box.hidden=true;document.documentElement.classList.remove('modal');btn.focus({preventScroll:true})}
btn.addEventListener('click',open);X.addEventListener('click',close);addEventListener('resize',function(){if(!box.hidden){size();req()}});
addEventListener('keydown',function(e){if(!box.hidden&&e.key==='Escape')close()});
})();
