/* site-v3-pro2 · the mark as the constellation. The opening view is ᑕᐣᓯ drawn as stars (node stars at the stroke points, smaller stars
   along the strokes, faint lines; the geometry is site-v4-galaxy-nav/mark.svg, traced on Noto Sans Canadian Aboriginal). Zooming INTO it
   (scroll / trackpad / wheel, a swipe up, a two-finger spread, a tap, Enter or ↓) is one continuous, scrubbable move: the mark grows, its
   lines let go, and every star flies to its place in the five chapter constellations (film, photo, objects, sound, about) on the page
   itself, which shows through as the sky clears. The stars land exactly on the real glyph stars, so the hand-off is seamless and the
   site reads as one page. Reverse the gesture before it lands and it zooms back out. Once a session (?mark=1 shows it again, ?mark=0 never). */
(function(){
'use strict';
var D=document.documentElement,B=document.body;if(!B||!B.classList.contains('home-p'))return;
var Q;try{Q=new URLSearchParams(location.search)}catch(e){Q={get:function(){return null}}}
var force=Q.get('mark');if(force==='0')return;
if(force!=='1'){if(location.hash&&location.hash!=='#')return;try{if(sessionStorage.getItem('gj-mark'))return}catch(e){}}
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ᑕᐣᓯ: three strokes, node points in the mark's own units (viewBox -236 -126 472 252) */
var STROKES=[[[-58.5,-96],[-156.5,-95],[-203.5,-61],[-213.5,1],[-203.5,63],[-156.5,97],[-58.5,97]],
             [[-26.5,-97],[25.5,-94],[44.5,-51],[25.5,-8],[-26.5,-5]],
             [[99.5,105],[99.5,20],[149.5,15],[191.5,-11],[211.5,-55],[214.5,-105]]];
var BIG={'-156.5,-95':1,'-156.5,97':1,'44.5,-51':1,'99.5,105':1,'214.5,-105':1};
var CH=['film','photo','objects','sound','about'],NEW={film:1,objects:1}; /* mint = what's new: the Demo Reel (film) + the joio clips (objects) */
var el=document.createElement('div');el.className='mk';el.setAttribute('role','dialog');el.setAttribute('aria-label','Gill James. The ᑕᐣᓯ mark as a constellation: zoom in to enter');
el.innerHTML='<canvas aria-hidden="true"></canvas><p class="mk-t"><span class="mk-n">gill james</span><span class="mk-r">Cinematographer + Artist + Spatial Designer</span></p>'+
  '<p class="mk-new">new · demo reel · joio in motion · sound for sync</p><button type="button" class="mk-go">zoom in <i aria-hidden="true">＋</i></button><p class="mk-h" aria-hidden="true">pinch · scroll · or tap the stars</p>';
B.appendChild(el);D.classList.add('mk-on');
var cv=el.querySelector('canvas'),cx=cv.getContext('2d'),W=0,H=0,DPR=1,pts=[],tg=[],sky=[],p=0,tp=0,auto=0,done=false,dest=0,jumped=false,last=0,raf=0;
/* stars along the strokes: the nodes plus in-between stars, as many in total as the chapter glyphs have (so each lands on one) */
function glyphs(){var out=[];CH.forEach(function(k){var g=document.querySelector('#'+k+'>.head .glyph');if(!g)return;
  [].forEach.call(g.querySelectorAll('circle'),function(c){out.push({k:k,c:c})})});return out}
var G=glyphs();if(!G.length){el.remove();D.classList.remove('mk-on');return}
function build(){var N=G.length,nodes=[],segs=[],tot=0;
  STROKES.forEach(function(s,si){s.forEach(function(q,j){nodes.push({x:q[0],y:q[1],s:si,big:!!BIG[q[0]+','+q[1]],node:1});if(j){var a=s[j-1],l=Math.hypot(q[0]-a[0],q[1]-a[1]);segs.push({a:a,b:q,l:l,s:si});tot+=l}})});
  var extra=Math.max(0,N-nodes.length),P=nodes.slice(),left=extra;
  segs.forEach(function(sg,i){var n=i===segs.length-1?left:Math.round(extra*sg.l/tot);n=Math.min(n,left);left-=n;
    for(var j=1;j<=n;j++){var f=j/(n+1);P.push({x:sg.a[0]+(sg.b[0]-sg.a[0])*f,y:sg.a[1]+(sg.b[1]-sg.a[1])*f,s:sg.s,big:false,node:0})}});
  /* order along the writing: stroke, then position along the stroke, so each chapter takes a run of the mark */
  P.sort(function(a,b){return a.s-b.s||(a.s===0?(Math.atan2(a.y,a.x+130)-Math.atan2(b.y,b.x+130))*-1:a.s===1?(a.y+a.x*.2)-(b.y+b.x*.2):(b.y-a.y))});
  P=P.slice(0,N);
  /* split the run into the chapters in order, then pair each star with its nearest free glyph star inside that chapter */
  var i0=0;CH.forEach(function(k){var gs=G.filter(function(g){return g.k===k}),run=P.slice(i0,i0+gs.length);i0+=gs.length;
    run.forEach(function(q){q.k=k});pts=pts.concat(run)});
  pts.forEach(function(q,i){q.tw=Math.random()*6.28;q.i=i});
  sky=[];for(var s=0;s<140;s++)sky.push({x:Math.random(),y:Math.random(),r:Math.random()*.9+.2,a:Math.random()*.5+.1})}
build();
function measure(){DPR=Math.min(2,devicePixelRatio||1);W=el.clientWidth||innerWidth;H=el.clientHeight||innerHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';
  var chs=document.querySelector('.chs');dest=chs?Math.max(0,chs.getBoundingClientRect().top+scrollY-4):0;
  /* mark size + place: phone first (fills ~84% of the width), never taller than ~32% of the screen */
  var sc=Math.min(W*.84/472,H*.32/252);this_mk={sc:sc,cx:W/2,cy:H*.44};
  /* each chapter's glyph stars, in page coordinates as they will sit once the page is at the chapters */
  CH.forEach(function(k){var free=G.filter(function(g){return g.k===k}).map(function(g){var r=g.c.getBoundingClientRect(),st=getComputedStyle(g.c);
      return{x:r.left+r.width/2,y:r.top+r.height/2+scrollY-dest,r:Math.max(1,r.width/2),col:st.fill}}),run=pts.filter(function(q){return q.k===k});
    /* nearest pairing in normalised space (both sets scaled to their own box), greedy by distance */
    function box(a,fx,fy){var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;a.forEach(function(o){x0=Math.min(x0,fx(o));x1=Math.max(x1,fx(o));y0=Math.min(y0,fy(o));y1=Math.max(y1,fy(o))});return[x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0)]}
    var bA=box(run,function(o){return o.x},function(o){return o.y}),bB=box(free,function(o){return o.x},function(o){return o.y}),pairs=[];
    run.forEach(function(q,a){free.forEach(function(t,b){var dx=(q.x-bA[0])/bA[2]-(t.x-bB[0])/bB[2],dy=(q.y-bA[1])/bA[3]-(t.y-bB[1])/bB[3];pairs.push([dx*dx+dy*dy,a,b])})});
    pairs.sort(function(a,b){return a[0]-b[0]});var ua={},ub={};
    pairs.forEach(function(pr){if(ua[pr[1]]||ub[pr[2]])return;ua[pr[1]]=1;ub[pr[2]]=1;run[pr[1]].t=free[pr[2]]})})}
var this_mk={sc:1,cx:0,cy:0};
function ss(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function parseCol(c){var m=/rgba?\(([^)]+)\)/.exec(c||'');if(!m)return[255,255,255];var v=m[1].split(',').map(parseFloat);return[v[0],v[1],v[2]]}
function draw(now){raf=0;var dt=Math.min(.05,(now-(last||now))/1000);last=now;
  if(auto)tp=Math.min(1,tp+dt/(RM?.25:1.5));
  var k=1-Math.exp(-dt*(RM?30:7.5));p+=(tp-p)*k;if(Math.abs(tp-p)<.0005)p=tp;
  /* the page moves under the (still opaque) sky to where the chapters sit, then the sky clears */
  if(p>.42&&!jumped){jumped=true;scrollTo(0,dest)}else if(p<.38&&jumped&&!done){jumped=false;scrollTo(0,0)}
  var z=1+2.4*Math.pow(ss(0,.62,p),1.4),w=ease(ss(.18,.96,p)),bg=1-ss(.5,.94,p),la=1-ss(.02,.4,p);
  cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);
  if(bg>0){cx.fillStyle='rgba(3,6,10,'+bg.toFixed(3)+')';cx.fillRect(0,0,W,H);cx.fillStyle='#cfe0ff';
    sky.forEach(function(s){cx.globalAlpha=s.a*bg;cx.fillRect((s.x-.5)*W*(1+p*.6)+W/2,(s.y-.5)*H*(1+p*.6)+H/2,s.r,s.r)});cx.globalAlpha=1}
  var M=this_mk,P=pts.map(function(q){var mx=M.cx+q.x*M.sc*z,my=M.cy+q.y*M.sc*z,t=q.t||{x:mx,y:my,r:1,col:'#fff'},ty=t.y; /* where the glyph star sits on screen once the page is at the chapters */
    return{x:mx+(t.x-mx)*w,y:my+(ty-my)*w,q:q,t:t}});
  if(la>0){cx.lineWidth=1;cx.lineCap='round';
    STROKES.forEach(function(s,si){cx.beginPath();s.forEach(function(q,j){var x=M.cx+q[0]*M.sc*z,y=M.cy+q[1]*M.sc*z;if(j)cx.lineTo(x,y);else cx.moveTo(x,y)});
      cx.strokeStyle='rgba(200,220,255,'+(.34*la).toFixed(3)+')';cx.stroke()})}
  var tws=now/1000;
  P.forEach(function(o){var q=o.q,nw=NEW[q.k],r0=q.big?3.1:q.node?2.3:1.35,r=r0+(o.t.r-r0)*w,
      tw=.82+.18*Math.sin(tws*1.3+q.tw),c0=nw?[85,218,161]:[230,238,255],c1=parseCol(o.t.col),col=[0,1,2].map(function(j){return Math.round(c0[j]+(c1[j]-c0[j])*w)}),
      fade=1-ss(.93,1,p);
    cx.globalAlpha=fade*(tw+(1-tw)*w);cx.fillStyle='rgb('+col.join(',')+')';
    cx.shadowColor=nw&&w<.8?'rgba(85,218,161,.9)':'rgba(190,220,255,.8)';cx.shadowBlur=(q.node?8:4)*(1-w*.6);
    cx.beginPath();cx.arc(o.x,o.y,r,0,6.2832);cx.fill()});
  cx.globalAlpha=1;cx.shadowBlur=0;
  el.style.setProperty('--mk',p.toFixed(3));
  if(p>=.999&&tp>=1){finish();return}
  if(p!==tp||auto||!done)raf=requestAnimationFrame(draw)}
function kick(){if(!raf)raf=requestAnimationFrame(draw)}
function finish(){if(done)return;done=true;try{sessionStorage.setItem('gj-mark','1')}catch(e){}
  if(!jumped)scrollTo(0,dest);el.classList.add('gone');D.classList.remove('mk-on');
  setTimeout(function(){el.remove()},400);removeEventListener('keydown',onKey,true);removeEventListener('resize',onRs);
  if(kb){var f=document.querySelector('#film>.head');if(f&&f.focus)try{f.focus({preventScroll:true})}catch(e){}}}
function go(){auto=1;kick()}
function nudge(d){if(auto)return;tp=Math.max(0,Math.min(1,tp+d));kick();clearTimeout(rel);rel=setTimeout(release,260)}
var rel=0;function release(){if(auto||done)return;if(tp>.3)go();else{tp=0;kick()}}
/* input: wheel / trackpad, one-finger swipe up, two-finger spread, tap, keys */
el.addEventListener('wheel',function(e){e.preventDefault();var dy=e.deltaMode===1?e.deltaY*32:e.deltaY;nudge((dy-(e.ctrlKey?dy*2:0))/1100)},{passive:false});
var T=null;
el.addEventListener('touchstart',function(e){var t=e.touches;T={n:t.length,y:t[0].clientY,x:t[0].clientX,d:t.length>1?Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY):0,p:tp,moved:false}},{passive:true});
el.addEventListener('touchmove',function(e){if(!T)return;e.preventDefault();var t=e.touches;
  if(t.length>1){var d=Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);if(!T.d){T.d=d;T.p=tp}tp=Math.max(0,Math.min(1,T.p+(d/T.d-1)*.9));T.moved=true}
  else{var dy=T.y-t[0].clientY;if(Math.abs(dy)>6)T.moved=true;tp=Math.max(0,Math.min(1,T.p+dy/(H*.55)))}
  auto=0;kick()},{passive:false});
el.addEventListener('touchend',function(e){if(!T)return;var m=T.moved;if(e.touches.length)return;T=null;if(!m){e.preventDefault();go()}else release()},{passive:false});
el.addEventListener('click',function(e){go()});
var kb=false;function onKey(e){if(done)return;var k=e.key;kb=true;if(k==='Enter'||k===' '||k==='ArrowDown'||k==='PageDown'||k==='+'||k==='='){e.preventDefault();e.stopPropagation();go()}
  else if(k==='Escape'){e.preventDefault();e.stopPropagation();tp=1;p=1;go()}}
addEventListener('keydown',onKey,true);
function onRs(){measure();kick()}addEventListener('resize',onRs);
/* stop the arrival's own taps + scroll under the sky */
function start(){measure();kick()}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(!done){measure();kick()}});
scrollTo(0,0);start();
window.__mark={state:function(){return{p:p,tp:tp,done:done,jumped:jumped,n:pts.length,dest:dest,W:W,H:H,sc:this_mk.sc}},go:go,set:function(v){auto=0;tp=v;kick()}};
})();
