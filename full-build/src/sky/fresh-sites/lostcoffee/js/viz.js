/* Lost Coffee · the Sound engine. Ported from the magic-base Sound room player (tonight/fable-m4/player/js/player.js):
   same audio graph (MediaElementSource → Analyser fft 512 / smoothing .72 → Gain → out; volume after the analyser so the
   visuals never change with it), same listen/post levels + beat onset, same bpm beat glow, same tunnel of rings built from the
   track's offline envelope (one ring per 1/6 s), beat ripples (the star dots and glow sprites are removed), the live time-domain ring, and the
   two tune controls (vol, flash → DIM = .35 + .65·flash). Changes for this site: no constellation/dive (we are always "in"),
   mint replaced by warm white #e8e4dc, each track's tint, and Gill's own images (cover + plates) drift through the tunnel as
   lit panes. The waveform rail is drawn at full brightness, always. Nothing advances on its own: a track stops at its end. */
(function(w){'use strict';
var d=document,D=w.LC,au=new Audio();au.preload='metadata';au.crossOrigin='anonymous';
var T=null,N=1,AC=null,AN=null,GN=null,TG=null,MN=null,MD=null,FD=null,TD=null,SP=1,FAR=64,K=26,listeners=[];
var TV={};
function lsr(k,v){try{var x=parseFloat(localStorage.getItem(k));return isFinite(x)?Math.max(0,Math.min(1,x)):v}catch(e){return v}}
var VOL=lsr('gj.vol',1),FL=lsr('gj.flash',.6),DIM=.35+.65*FL;
var L={rms:0,low:0,mid:0,high:0,beat:0,avgLow:.2,lastBeat:0};
function trackVol(id){return id in TV?TV[id]:1}
function initAudio(){if(AC)return;var C=w.AudioContext||w.webkitAudioContext;if(!C)return;AC=new C();var src=AC.createMediaElementSource(au);
  AN=AC.createAnalyser();AN.fftSize=512;AN.smoothingTimeConstant=.72;TG=AC.createGain();TG.gain.value=T?trackVol(T.id):1;GN=AC.createGain();GN.gain.value=VOL;
  src.connect(AN);AN.connect(TG);TG.connect(GN);GN.connect(AC.destination);
  MN=AC.createAnalyser();MN.fftSize=512;GN.connect(MN);MD=new Uint8Array(MN.fftSize);
  FD=new Uint8Array(AN.frequencyBinCount);TD=new Uint8Array(AN.fftSize)}
function arm(){initAudio();if(AC&&AC.state==='suspended')return AC.resume()}
function paintInputs(){var list=d.querySelectorAll('input[data-k]'),i,inp;for(i=0;i<list.length;i++){inp=list[i];if(inp===d.activeElement)continue;inp.value=inp.dataset.k==='vol'?VOL:FL}}
function setFlash(v){FL=Math.max(0,Math.min(1,+v));DIM=.35+.65*FL;try{localStorage.setItem('gj.flash',FL)}catch(e){}paintInputs()}
function setVol(v){VOL=Math.max(0,Math.min(1,+v));if(GN)GN.gain.setTargetAtTime(VOL,AC.currentTime,.05);else au.volume=VOL;try{localStorage.setItem('gj.vol',VOL)}catch(e){}paintInputs()}
function setTrackVol(id,v){v=Math.max(0,Math.min(1,+v));TV[id]=v;if(T&&T.id===id&&TG)TG.gain.setTargetAtTime(v,AC.currentTime,.03)}
function postRms(){if(!MN)return 0;MN.getByteTimeDomainData(MD);var s=0,i;for(i=0;i<MD.length;i++){var v=(MD[i]-128)/128;s+=v*v}return Math.sqrt(s/MD.length)}
var ripples=[];
function listen(now){if(!AN||au.paused){L.rms*=.94;L.low*=.94;L.mid*=.94;L.high*=.94;L.beat*=.9;return}AN.getByteFrequencyData(FD);AN.getByteTimeDomainData(TD);post(now,AC.sampleRate)}
function post(now,sr){var s=0;for(var i=0;i<TD.length;i++){var v=(TD[i]-128)/128;s+=v*v}
  var bw=sr/512;function avg(a,b){var x=0,n=0;for(var k=Math.floor(a/bw);k<=Math.ceil(b/bw)&&k<FD.length;k++){x+=FD[k];n++}return x/n/255}
  L.rms=L.rms*.6+.4*Math.min(1,Math.sqrt(s/TD.length)*3.2);L.low=avg(35,160);L.mid=avg(300,2000);L.high=avg(3000,9000);
  L.avgLow=L.avgLow*.97+L.low*.03;if(L.low>L.avgLow*1.18&&L.low>.35&&now-L.lastBeat>280){L.lastBeat=now;L.beat=1;ripples.push({t0:now,a:.55+.45*L.low})}else L.beat*=.9}
function beatGlow(){if(!T||!(T.bpm>0)||au.paused)return 0;var ph=(au.currentTime*T.bpm/60)%1;return Math.pow(1-ph,2.4)}
function dur(){return au.duration&&isFinite(au.duration)?au.duration:(T?T.pv:1)}
function ringAt(t){return t/dur()*N*SP}
function env(i){i=Math.max(0,Math.min(N-1,i));var a=Math.floor(i),b=Math.min(N-1,a+1),f=i-a;return T.pk6[a]*(1-f)+T.pk6[b]*f}
function band(i,j){i=Math.max(0,Math.min(N-1,Math.round(i)));return T.bd6[i][j]}
function rnd(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
var TINT='232,228,220';
function px(z){return Math.sin(z*.021)*1.3+Math.sin(z*.0063)*2.2}
function py(z){return Math.cos(z*.017)*.9}
function ease(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
/* images per track: the cover and three plates of Gill's own abstract work, decoded once */
var IMG={};function imgs(t){if(IMG[t.id])return IMG[t.id];var a=[t.cover].concat(t.plates.map(function(p){return p.src})).map(function(s){var i=new Image();i.decoding='async';i.src=s;return i});IMG[t.id]=a;return a}
/* ---------- tracks + transport ---------- */
var camZ=0,tz=0,tw=0,PUSH=0,dragging=false;
function load(id){var t=null;D.tracks.forEach(function(x){if(x.id===id)t=x});if(!t||t===T)return T;T=t;N=t.pk6.length;TINT=t.tint;imgs(t);
  au.pause();au.src=t.src;au.load();camZ=tz=0;ripples.length=0;if(TG&&AC)TG.gain.setTargetAtTime(trackVol(t.id),AC.currentTime,.03);fire('track');return T}
function play(){if(!T)return;initAudio();if(AC&&AC.state==='suspended')AC.resume();au.play().catch(function(){});}
function pause(){au.pause()}
function toggle(){au.paused?play():pause()}
function seek(t){t=Math.max(0,Math.min(dur()-.05,t));try{au.currentTime=t}catch(e){}tz=ringAt(t);fire('seek')}
['play','pause','ended','loadedmetadata'].forEach(function(e){au.addEventListener(e,function(){fire(e)})});
function on(f){listeners.push(f)}function fire(e){listeners.forEach(function(f){f(e)});if(e==='track'&&w.GJ_DIAL&&GJ_DIAL.relayout)GJ_DIAL.relayout()}
/* ---------- stages: any canvas can host the tunnel ---------- */
var stages=[],rails=[];
function stage(cv,opt){var s={cv:cv,g:cv.getContext('2d'),o:opt||{},prev:null,W:0,H:0,DPR:1,alpha:1};
  s.resize=function(){s.DPR=Math.min(2,w.devicePixelRatio||1);var r=cv.getBoundingClientRect();s.W=r.width;s.H=r.height;cv.width=Math.max(1,s.W*s.DPR|0);cv.height=Math.max(1,s.H*s.DPR|0)};
  s.resize();stages.push(s);return s}
function drawStage(s,now){var c=s.g,W=s.W,H=s.H;if(!W||!H)return;c.setTransform(s.DPR,0,0,s.DPR,0,0);
  var VX=W/2,VY=H*(s.o.vy||.46),F=Math.min(W,H)*1.05,S=(s.o.scale||3.4)*(1+PUSH*.1),bgk=s.o.bg||'#060606';
  function proj(x,y,z,cz,cx,cy){var dd=z-cz;if(dd<.05)return null;var k=F/dd*(1+PUSH*.12);return[VX+(x-cx)*k*S,VY+(y-cy)*k*S,k,dd]}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle=bgk;c.fillRect(0,0,W,H);
  if(!T)return;var cz=camZ,cx=px(cz),cy=py(cz);
  var gr=c.createRadialGradient(VX,VY*.92,0,VX,VY*.92,Math.max(W,H)*.75);gr.addColorStop(0,'rgba('+TINT+',.07)');gr.addColorStop(.6,'rgba('+TINT+',.025)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
  /* beat ripples (the site's water) */
  for(var i=ripples.length-1;i>=0;i--){var Rp=ripples[i],a=(now-Rp.t0)/1800;if(a>1){if(s===stages[stages.length-1])ripples.splice(i,1);continue}
    c.strokeStyle='rgba(232,228,220,'+(.32*Rp.a*(1-a)).toFixed(3)+')';c.lineWidth=1;c.beginPath();c.ellipse(VX,VY,20+a*W*.7,(20+a*W*.7)*.62,0,0,7);c.stroke()}
  var BT=Math.max(L.beat,beatGlow())*FL,live=1+L.rms*.55,glowK=(.55+.9*BT)*DIM;
  /* Gill's images as lit panes inside the groove — every 40 rings one passes, alternating sides */
  var IM=imgs(T),z0=Math.floor(cz/SP)+1;
  if(s.o.panes!==false)for(var m=Math.floor((cz-4)/40);m<=Math.floor((cz+FAR)/40);m++){if(m<0)continue;var ri=18+40*m,dz=ri-cz;if(dz<.4||dz>FAR)continue;var im=IM[m%IM.length];if(!im.complete||!im.naturalWidth)continue;
    var side=(m%2?1:-1),q=proj(px(ri)+side*2.3,py(ri)-.2,ri,cz,cx,cy);if(!q)continue;var ww=1.5*q[2]*S,hh=ww*im.naturalHeight/im.naturalWidth;
    var fa=Math.min(1,(1-dz/FAR)*1.8)*Math.min(1,(dz-.4)/2.2);c.globalAlpha=Math.max(0,fa)*(.78+.22*BT);c.drawImage(im,q[0]-ww/2,q[1]-hh/2,ww,hh);
    c.globalAlpha=Math.max(0,fa)*.5;c.strokeStyle='rgba('+TINT+',.6)';c.lineWidth=1;c.strokeRect(q[0]-ww/2,q[1]-hh/2,ww,hh)}
  c.globalAlpha=1;
  /* the tunnel */
  var pts=new Array(FAR);
  for(var r=FAR-1;r>=0;r--){var ri2=z0+r;if(ri2>=N)continue;var z=ri2*SP,e=env(ri2),dd=z-cz,near=Math.exp(-dd/16),ring=[];
    var R0=(.75+3.0*Math.pow(e,1.6))*live,tw2=z*.045+tw*.08,hiB=band(ri2,2);
    for(var k=0;k<K;k++){var an=k/K*6.2832+tw2,fk=FD?FD[2+Math.floor((k<K/2?k:K-k)/(K/2)*60)]/255:0;
      var rr=R0*(1+.42*fk*near+.12*Math.sin(an*3+z*.5-tw*2.2)*L.mid+.06*hiB*Math.sin(an*7+tw));
      ring.push(proj(px(z)+Math.cos(an)*rr,py(z)+Math.sin(an)*rr*.82,z,cz,cx,cy))}
    pts[r]={p:ring,d:dd,e:e}}
  c.lineWidth=1;c.lineCap='round';
  for(var r=FAR-2;r>=0;r--){var A=pts[r],B=pts[r+1];if(!A||!B)continue;var fade=Math.min(1,(1-A.d/(FAR*SP))*1.6)*Math.min(1,A.d/1.2),al=(.10+.30*A.e)*fade*glowK;
    c.strokeStyle='rgba('+TINT+','+al.toFixed(3)+')';c.beginPath();for(var k=0;k<K;k++){var a1=A.p[k],b1=B.p[k];if(a1&&b1){c.moveTo(a1[0],a1[1]);c.lineTo(b1[0],b1[1])}}c.stroke();
    if((z0+r)%3===0){c.strokeStyle='rgba(232,228,220,'+(.26*fade*glowK).toFixed(3)+')';c.beginPath();for(var k=0;k<=K;k++){var a2=A.p[k%K];if(!a2)continue;k?c.lineTo(a2[0],a2[1]):c.moveTo(a2[0],a2[1])}c.stroke()}}
  /* (no star dots, no glow sprites: Gill's no-stars rule — the groove is drawn by its rings alone) */
  c.globalAlpha=1;
  var vz=cz+FAR*SP*.8,vp=proj(px(vz),py(vz),vz,cz,cx,cy);if(vp){var vr=Math.min(W,H)*(.22+.18*BT+.2*L.rms*FL);var vg=c.createRadialGradient(vp[0],vp[1],0,vp[0],vp[1],vr);
    vg.addColorStop(0,'rgba('+TINT+','+(.22*(.5+L.rms*FL)*DIM).toFixed(3)+')');vg.addColorStop(1,'rgba('+TINT+',0)');c.globalCompositeOperation='lighter';c.fillStyle=vg;c.fillRect(vp[0]-vr,vp[1]-vr,2*vr,2*vr);c.globalCompositeOperation='source-over'}
  if(TD&&!au.paused){var zr=cz+11,cxr=px(zr),cyr=py(zr),Rr=(.9+2.2*env(zr/SP))*live,n=96;
    for(var pass=0;pass<2;pass++){c.strokeStyle=pass?'rgba(232,228,220,'+(.55*DIM).toFixed(3)+')':'rgba('+TINT+','+(.18*glowK).toFixed(3)+')';c.lineWidth=pass?1:5;c.beginPath();
      for(var k=0;k<=n;k++){var kk=k%n,ti=Math.floor((kk<n/2?kk:n-kk)/(n/2)*(TD.length-1)),v=(TD[ti]-128)/128,an2=kk/n*6.2832-tw*.3,rr2=Rr*(1+v*.9);
        var q2=proj(cxr+Math.cos(an2)*rr2,cyr+Math.sin(an2)*rr2*.82,zr,cz,cx,cy);if(q2)k?c.lineTo(q2[0],q2[1]):c.moveTo(q2[0],q2[1])}c.stroke()}c.lineWidth=1}
}
/* ---------- the waveform rail: full brightness, always (played = gold, unplayed = warm white) ---------- */
function rail(cv,opt){opt=opt||{};var r={cv:cv,o:opt,t:opt.track||null};
  r.track=function(){return r.t||T};
  r.draw=function(){var t=r.track();if(!t)return;var dpr=Math.min(2,w.devicePixelRatio||1),b=cv.getBoundingClientRect(),W=b.width,H=b.height;if(!W||!H)return;
    if(cv.width!==(W*dpr|0)||cv.height!==(H*dpr|0)){cv.width=W*dpr|0;cv.height=H*dpr|0}var c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
    var vert=!!opt.vertical,Lx=vert?H:W,Ly=vert?W:H,step=opt.step||3,n=Math.max(8,Math.floor(Lx/step)),pk=t.p2k,isCur=t===T,pf=isCur?au.currentTime/dur():0;
    for(var i=0;i<n;i++){var p=0,a=Math.floor(i/n*pk.length),bb=Math.max(a+1,Math.floor((i+1)/n*pk.length));for(var j=a;j<bb;j++)p=Math.max(p,pk[j]);
      var amp=Math.max(.6,Math.min(1,p*1.25)*Ly*(opt.amp||.46)),on=isCur&&i/n<pf;c.fillStyle=on?'#e8c48a':'#e8e4dc';var bw=Math.max(1,Math.round((opt.bw||1)*dpr))/dpr,x=Math.round(((i+.5)/n*Lx-bw/2)*dpr)/dpr+bw/2;amp=Math.round(amp*dpr)/dpr||1/dpr;
      if(vert)c.fillRect(Math.round((Ly/2-amp)*dpr)/dpr,Math.round((H-x-bw/2)*dpr)/dpr,2*amp,bw);else if(opt.down)c.fillRect(x-bw/2,0,bw,amp*2);else c.fillRect(x-bw/2,Math.round((H/2-amp)*dpr)/dpr,bw,2*amp)}
    if(isCur&&pf>0){c.fillStyle='#e8e4dc';if(vert)c.fillRect(0,H-pf*H,W,1);else c.fillRect(pf*W,0,1,H)}};
  if(opt.seek!==false){var id=null;function at(e){var b=cv.getBoundingClientRect();return opt.vertical?1-(e.clientY-b.top)/b.height:(e.clientX-b.left)/b.width}
    cv.addEventListener('pointerdown',function(e){var t=r.track();if(t!==T){if(opt.onPick)opt.onPick(t);return}e.stopPropagation();id=e.pointerId;cv.setPointerCapture(id);dragging=true;seek(at(e)*dur())});
    cv.addEventListener('pointermove',function(e){if(id!==e.pointerId)return;seek(Math.max(0,Math.min(1,at(e)))*dur())});
    cv.addEventListener('pointerup',function(e){if(id!==e.pointerId)return;id=null;dragging=false;if(au.paused)play()});
    cv.addEventListener('pointercancel',function(){id=null;dragging=false});cv.style.touchAction='none'}
  rails.push(r);return r}
/* ---------- tune sliders, driven through the ghost-arc dial. only: 'vol' | 'flash' | omitted (both) ---------- */
function tune(parent,cls,only){var keys=only?String(only).split(/[\s,]+/):['vol','flash'],html='';
  if(keys.indexOf('vol')>=0)html+='<label><span>vol</span><input type="range" min="0" max="1" step="0.01" value="'+VOL+'" data-k="vol" aria-label="volume"></label>';
  if(keys.indexOf('flash')>=0)html+='<label><span>flash</span><input type="range" min="0" max="1" step="0.01" value="'+FL+'" data-k="flash" aria-label="flash"></label>';
  var t=d.createElement('div');t.className='lv-tune '+(cls||'');t.setAttribute('data-gjdial-drawer','');t.innerHTML=html;
  parent.appendChild(t);
  t.querySelectorAll('input').forEach(function(inp){var k=inp.dataset.k,last={x:0,y:0};
    inp.addEventListener('pointerdown',function(e){last={x:e.clientX,y:e.clientY};arm();ghost(inp,k)});
    inp.addEventListener('pointermove',function(e){if(e.buttons)last={x:e.clientX,y:e.clientY}});
    inp.addEventListener('input',function(){var v=+inp.value;if(k==='vol')setVol(v);else setFlash(v);ghost(inp,k)});
    function ghost(i,k){if(w.GJ_DIAL)GJ_DIAL.update({name:k,min:0,max:1,def:k==='vol'?1:.6,value:+i.value,x:last.x,y:last.y,el:i})}
    function letGo(){if(w.GJ_DIAL)GJ_DIAL.release()}
    inp.addEventListener('pointerup',letGo);inp.addEventListener('pointercancel',letGo);inp.addEventListener('change',letGo)});
  return t}
if(w.GJ_DIAL)GJ_DIAL.avoid(function(){var out=[];rails.forEach(function(r){var b=r.cv.getBoundingClientRect();if(b.width)out.push([b.left,b.top,b.right,b.bottom])});return out});
/* ---------- one loop ---------- */
var last=performance.now();
function frame(now){requestAnimationFrame(frame);var dt=Math.min(.05,(now-last)/1000);last=now;tw+=dt;listen(now);
  if(T){if(!au.paused)tz=ringAt(au.currentTime);var gap=tz-camZ;camZ+=gap*Math.min(1,dt*(Math.abs(gap)>2.5?3:8))}
  if(L.beat>.62)PUSH=Math.min(1.2,PUSH+L.beat*.45);PUSH*=Math.max(0,1-dt*1.6);
  for(var i=0;i<stages.length;i++){var s=stages[i];if(s.on===false||!s.cv.isConnected)continue;drawStage(s,now)}
  for(var j=0;j<rails.length;j++)if(rails[j].cv.isConnected)rails[j].draw()}
requestAnimationFrame(frame);
addEventListener('resize',function(){stages.forEach(function(s){s.resize()})});
function mmss(s){s=Math.max(0,s|0);return(s/60|0)+':'+('0'+s%60).slice(-2)}
w.LV={au:au,load:load,play:play,pause:pause,toggle:toggle,seek:seek,dur:dur,stage:stage,rail:rail,tune:tune,on:on,L:L,cur:function(){return T},mmss:mmss,arm:arm,setVol:setVol,setTrackVol:setTrackVol,trackVol:trackVol,postRms:postRms,vol:function(){return VOL},
  unstage:function(s){var i=stages.indexOf(s);if(i>=0)stages.splice(i,1)},unrail:function(r){var i=rails.indexOf(r);if(i>=0)rails.splice(i,1)}};
})(window);
