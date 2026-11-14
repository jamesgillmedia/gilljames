/* A · Deep Groove — the whole release is one waveform, track after track. Tap (or wheel / spread) a stretch of it and the
   camera falls into that groove: the waveform opens around the track until it is the track's own rail, and the Sound engine
   tunnel takes the screen with Gill's images passing through. Out (‹, Esc, Back, wheel back, pinch, swipe down) pulls
   back to the whole record. Swipe ← → or the side tabs to move along the groove (replace, so Back always leaves). */
(function(){'use strict';if(G.V!=='A')return;
var d=document,app=d.getElementById('app'),R=G.R,el=G.el,esc=G.esc,img=G.img,D=G.D,O=G.ORDER;
var cv=el('canvas','lv-stage',null,app),S=LV.stage(cv,{vy:.4,scale:3.4,bg:'#060606',panes:false});
var shade=el('div','a-shade',null,app);
var hd=el('header','a-hd','<button class="a-wm" type="button">Lost Coffee</button><span class="a-sub">one groove · five tracks</span>',app);
var plw=el('div','a-plw',null,app);var gv=el('canvas','a-groove',null,app);gv.setAttribute('aria-label','the release as one waveform');plw.setAttribute('aria-hidden','true');var labs=el('div','a-labs',null,app);
var info=el('section','a-info',null,app);
var back=el('button','a-back','‹ the record',app);back.type='button';
var foot=el('footer','a-foot','<span class="lv-links"><a href="'+D.links.spotify+'" target="_blank" rel="noopener">Spotify</a><a href="'+D.links.apple+'" target="_blank" rel="noopener">Apple Music</a></span><span class="a-mm">also: <a href="'+D.links.mm+'" target="_blank" rel="noopener">Mothers Moniker ↗</a></span>',app);
var tw=el('div','a-tune',null,app);LV.tune(tw,'','vol');
/* the release laid end to end, each track's share = its preview length */
var tot=0;O.forEach(function(t){t.a0=tot;tot+=t.pv;t.a1=tot});O.forEach(function(t){t.a0/=tot;t.a1/=tot});
var GAP=.006,pk=[];O.forEach(function(t){t.p2k.forEach(function(v,i){pk.push({v:v,t:t,f:t.a0+(t.a1-t.a0)*i/t.p2k.length})})});
O.forEach(function(t){var b=el('button','a-lab',null,labs);b.type='button';b.dataset.id=t.id;b.innerHTML='<span class="cv"></span><span class="n">'+('0'+(O.indexOf(t)+1)).slice(-2)+'</span><span class="t">'+esc(t.t)+'</span><span class="l">'+esc(G.len(t))+'</span>';t.lab=b;t.pl=el('div','a-pl',null,plw);img(t.plates[0].src,'','',t.pl);img(t.coverS,'',t.t+' cover',b.querySelector('.cv'))});
/* view: [v0,v1] of the release across the screen, groove centre y and half-height */
var cur={v0:0,v1:1,y:.5,h:.17},anim=null,openT=null,hover=null;
function homeV(){return{v0:-.02,v1:1.02,y:innerWidth<720?.47:.5,h:innerWidth<720?.11:.16}}
function trackV(t){var pad=(t.a1-t.a0)*.04;return{v0:t.a0-pad,v1:t.a1+pad,y:1-(innerWidth<720?118:104)/innerHeight,h:(innerWidth<720?26:32)/innerHeight}}
function goView(to,ms,done){if(anim)anim.stop=true;var fr={v0:cur.v0,v1:cur.v1,y:cur.y,h:cur.h},s0=fr.v1-fr.v0,s1=to.v1-to.v0,c0=(fr.v0+fr.v1)/2,c1=(to.v0+to.v1)/2;
  anim=G.tween(ms||950,function(e){var s=s0*Math.pow(s1/s0,e),c=c0+(c1-c0)*e;cur.v0=c-s/2;cur.v1=c+s/2;cur.y=fr.y+(to.y-fr.y)*e;cur.h=fr.h+(to.h-fr.h)*e},done)}
function X(f){return(f-cur.v0)/(cur.v1-cur.v0)*innerWidth}
function F(x){return cur.v0+x/innerWidth*(cur.v1-cur.v0)}
function draw(){requestAnimationFrame(draw);var dpr=Math.min(2,devicePixelRatio||1),W=innerWidth,H=innerHeight;if(gv.width!==(W*dpr|0)){gv.width=W*dpr|0;gv.height=H*dpr|0}
  var c=gv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);var cy=cur.y*H,hh=cur.h*H,T=LV.cur(),pf=T?LV.au.currentTime/LV.dur():0,zoom=1/(cur.v1-cur.v0);
  var step=zoom>3?2.2:2.6,n=Math.ceil(W/step);
  for(var i=0;i<n;i++){var f0=F(i*step),f1=F((i+1)*step);if(f1<0||f0>1)continue;var p=0,tt=null,ff=0;
    var a=Math.max(0,Math.floor(f0*pk.length)),b=Math.min(pk.length,Math.max(a+1,Math.ceil(f1*pk.length)));
    for(var j=a;j<b;j++){var q=pk[Math.min(pk.length-1,j)];if(q.v>p){p=q.v;tt=q.t;ff=q.f}}if(!tt)continue;
    var loc=(ff-tt.a0)/(tt.a1-tt.a0);if(loc<GAP*3||loc>1-GAP*3)continue;
    var amp=Math.max(.8,Math.min(1,p*1.2)*hh),on=tt===T&&loc<pf;c.fillStyle=on?'#e8c48a':'#e8e4dc';c.fillRect(i*step,cy-amp,1.4,2*amp)}
  if(T&&openT===T){var px=X(T.a0+(T.a1-T.a0)*pf);c.fillStyle='#e8e4dc';c.fillRect(px,cy-hh*1.25,1,hh*2.5)}
  O.forEach(function(t){var x0=X(t.a0),x1=X(t.a1),vis=x1>0&&x0<W;var ph=W<720,odd=ph&&O.indexOf(t)%2===1;t.lab.classList.toggle('below',odd);t.lab.style.transform='translate('+Math.max(6,Math.min(W-(ph?70:160),x0+(ph?2:6))).toFixed(1)+'px,'+(odd?cy+hh+14:cy-hh-(ph?84:96)).toFixed(1)+'px)';t.lab.style.opacity=openT?(t===openT?0:vis?.0:0):1;t.lab.classList.toggle('hov',hover===t);var pw=x1-x0;t.pl.style.cssText='left:'+x0.toFixed(1)+'px;width:'+pw.toFixed(1)+'px;top:'+(cy-hh*1.5).toFixed(1)+'px;height:'+(hh*3).toFixed(1)+'px;opacity:'+(openT?0:hover===t?.5:.3)})}
requestAnimationFrame(draw);
function infoFor(t){var i=O.indexOf(t),pv=O[(i+O.length-1)%O.length],nx=O[(i+1)%O.length];
  info.innerHTML='<p class="a-no">'+('0'+(i+1)).slice(-2)+' / 05 · '+(t.year||'TBD')+' · '+esc(G.len(t))+'</p><h2 class="a-t">'+esc(t.t)+'</h2>'+
  '<div class="a-cov"></div><div class="a-pls"></div><p class="a-row"><button class="a-pp" type="button" aria-label="play"><i></i></button><span class="a-time">0:00</span><span class="lv-links">'+G.links(t)+'</span></p>'+
  '<button class="a-side a-prev" type="button" aria-label="previous: '+esc(pv.t)+'">‹ '+esc(pv.t)+'</button><button class="a-side a-next" type="button" aria-label="next: '+esc(nx.t)+'">'+esc(nx.t)+' ›</button>';
  img(t.cover,'',t.t+' — cover artwork',info.querySelector('.a-cov'));var pl=info.querySelector('.a-pls');t.plates.forEach(function(p){var f=el('figure','',null,pl);img(p.src,'','',f)});sync()}
function sync(){var b=info.querySelector('.a-pp');if(b){var on=!LV.au.paused;b.classList.toggle('on',on);b.setAttribute('aria-label',on?'pause':'play')}}
LV.on(sync);setInterval(function(){var t=info.querySelector('.a-time');if(t)t.textContent=LV.mmss(LV.au.currentTime)},250);
function open(t,how){var first=!openT;openT=t;LV.load(t.id);infoFor(t);app.classList.add('in');S.o.panes=true;goView(trackV(t),how==='load'?1:first?1100:800);if(how!=='load')LV.play()}
function close(how){if(!openT)return;openT=null;app.classList.remove('in');S.o.panes=false;goView(homeV(),how==='load'?1:950)}
R.on(function(route,prev,how){var m=route.match(/^t\/(.+)$/),t=m&&G.track(m[1]);if(m&&!t){R.go('',{replace:true});return}if(t)open(t,how);else close(how)});
/* input */
function hit(x,y){var f=F(x),cy=cur.y*innerHeight,hh=cur.h*innerHeight;if(Math.abs(y-cy)>hh+70)return null;for(var i=0;i<O.length;i++)if(f>=O[i].a0&&f<O[i].a1)return O[i];return null}
function pick(t){if(!t)return;R.go('t/'+t.id,{replace:!!openT})}
gv.addEventListener('pointermove',function(e){if(openT)return;hover=hit(e.clientX,e.clientY);gv.style.cursor=hover?'zoom-in':''});
var pd=null;gv.addEventListener('pointerdown',function(e){pd={x:e.clientX,y:e.clientY,id:e.pointerId};if(openT){var cy=cur.y*innerHeight;if(Math.abs(e.clientY-cy)<cur.h*innerHeight+26){gv.setPointerCapture(e.pointerId);pd.seek=true;seekAt(e)}}});
gv.addEventListener('pointermove',function(e){if(pd&&pd.seek&&pd.id===e.pointerId)seekAt(e)});
gv.addEventListener('pointerup',function(e){if(!pd)return;var p=pd;pd=null;if(p.seek){if(LV.au.paused)LV.play();return}if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>10)return;if(!openT)pick(hit(e.clientX,e.clientY))});
function seekAt(e){var t=openT,f=F(e.clientX),loc=(f-t.a0)/(t.a1-t.a0);LV.seek(Math.max(0,Math.min(1,loc))*LV.dur())}
labs.addEventListener('click',function(e){var b=e.target.closest('.a-lab');if(b)pick(G.track(b.dataset.id))});
var wacc=0,wt=0;addEventListener('wheel',function(e){if(e.target.closest('input,.lv-tune'))return;wacc+=e.deltaY;clearTimeout(wt);wt=setTimeout(function(){wacc=0},260);
  if(wacc<-60&&!openT){wacc=0;pick(hit(e.clientX,innerHeight*cur.y)||O[0])}else if(wacc>60&&openT){wacc=0;R.up()}},{passive:true});
/* pinch / spread */
var tch={};app.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];tch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),x:(a.clientX+b.clientX)/2}}},{passive:true});
app.addEventListener('touchmove',function(e){if(e.touches.length===2&&tch.d){var a=e.touches[0],b=e.touches[1],dd=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  if(dd>tch.d*1.35&&!openT){var fx=tch.x||innerWidth/2;tch={};pick(hit(fx,innerHeight*cur.y)||O[0])}else if(dd<tch.d*.72&&openT){tch={};R.up()}}},{passive:true});
G.swipe(app,function(dir,st){if(!openT)return;if(st.y>cur.y*innerHeight-cur.h*innerHeight-30)return;if(dir==='down')R.up();else if(dir==='left'||dir==='right')stepT(dir==='left'?1:-1)});
function stepT(k){var i=O.indexOf(openT);R.go('t/'+O[(i+k+O.length)%O.length].id,{replace:true})}
info.addEventListener('click',function(e){if(e.target.closest('.a-pp'))LV.toggle();if(e.target.closest('.a-next'))stepT(1);if(e.target.closest('.a-prev'))stepT(-1)});
back.addEventListener('click',function(){R.up()});
GJ_THEME.bind(hd.querySelector('.a-wm'),{tune:true,home:function(){R.home()}});
d.addEventListener('keydown',function(e){if(e.target.closest&&e.target.closest('input'))return;if(openT){if(e.key==='ArrowRight')stepT(1);if(e.key==='ArrowLeft')stepT(-1);if(e.key===' '){e.preventDefault();LV.toggle()}}
  else if(e.key==='Enter'||e.key==='ArrowDown'){pick(O[0])}});
addEventListener('resize',function(){var to=openT?trackV(openT):homeV();cur.v0=to.v0;cur.v1=to.v1;cur.y=to.y;cur.h=to.h});
var h0=homeV();cur.v0=h0.v0;cur.v1=h0.v1;cur.y=h0.y;cur.h=h0.h;
LV.load('lost-in-time');G.devToggle();R.start();
})();
