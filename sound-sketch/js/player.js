/* sound sketch · "inside a sound's pattern". canvas2D, no build.
   sky: cinematic long sweep through the Sound constellation; each bright star is a song.
   zoom rule (Gill): on release the camera STAYS — no auto-snap. lock/snap only when settled
   NEAR a zoom level, or on a QUICK zoom (velocity snap). slow zoom = free continuous.
   dive: stars unfold into the track's waveform tunnel. wind-chime swipe/tap kept.
   inside: analyser drives rings; when paused free pan/zoom is primary; when playing the
   sweep/meander continues unless the user takes over. */
(function(){
'use strict';
var SOUND={t:'255,182,176',s:[[0.058,0.493,0.35,0],[0.143,0.434,0.45,0],[0.195,0.295,0.63,0],[0.186,0.645,0.45,0],[0.282,0.392,0.53,0],[0.338,0.216,0.8,0],[0.347,0.763,0.55,0],[0.441,0.135,0.92,0],[0.442,0.812,0.62,0],[0.498,0.253,0.71,0],[0.567,0.183,0.86,0],[0.57,0.827,0.58,0],[0.659,0.355,0.57,0],[0.718,0.259,0.66,0],[0.719,0.711,0.47,0],[0.807,0.434,0.44,0],[0.886,0.419,0.5,0],[0.941,0.497,0.35,0],[0.26,0.93,0.2,1],[0.61,0.06,0.24,1],[0.9,0.88,0.26,1],[0.15,0.7,0.3,1]],
  e:[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]]};
var Q=new URLSearchParams(location.search),REC=Q.has('rec');
var $=function(id){return document.getElementById(id)};
var sk=$('sk'),cv=$('cv'),g=cv.getContext('2d'),au0=$('au'),rail=$('rail'),wf=$('wf'),fillE=$('fill'),headE=$('head');
var W=0,H=0,DPR=1,F=1;
var FG={v:1},au=REC?{currentTime:0,paused:true,play:function(){this.paused=false;return Promise.resolve()},pause:function(){this.paused=true},load:function(){},addEventListener:function(){}}:au0;
var PCM=null,PSR=48000;
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;F=Math.min(W,H)*1.05;
  var r=rail.getBoundingClientRect();wf.width=Math.max(1,r.width*DPR|0);wf.height=Math.max(1,r.height*DPR|0);drawWF()}
/* ---------- track / song-stars ---------- */
var KEYS=Object.keys(TRACKS),TK=TRACKS[Q.get('track')]?Q.get('track'):'togo',T=TRACKS[TK],N=0,SECS=[];
var SP=1,FAR=64,K=26;
/* star index → track key (each song-star) */
var STAR2K={};KEYS.forEach(function(k){if(TRACKS[k].star!=null)STAR2K[TRACKS[k].star]=k});
function pickTrack(k,fromStar){if(!TRACKS[k])return;TK=k;T=TRACKS[k];N=T.peaks.length;au0.src=T.file;au0.load();if(REC){PCM=null;fetch(T.file).then(function(r){return r.arrayBuffer()}).then(function(b){return new OfflineAudioContext(1,1,48000).decodeAudioData(b)}).then(function(d){PCM=d.getChannelData(0);PSR=d.sampleRate})}
  $('ttl').textContent=T.title+(T.placeholder?' · placeholder':'');$('art').textContent=T.artist;SECS=T.sections;
  [].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});
  SECS.forEach(function(s){var t=document.createElement('i');t.className='tk';t.style.left=(s.t/T.dur*100)+'%';rail.insertBefore(t,headE)});
  [].forEach.call($('picks').children,function(b){b.setAttribute('aria-checked',b.dataset.k===k)});
  rail.setAttribute('aria-valuemax',T.dur);drawWF();
  if(!fromStar){camZ=tz=ringAt(+Q.get('t')||0);if(Q.get('t'))au.currentTime=+Q.get('t')}
  else{camZ=tz=0;au.currentTime=0}
  highlight=T.star!=null?T.star:-1;pulseStar=1}
KEYS.forEach(function(k){var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.k=k;
  var ph=TRACKS[k].placeholder?' <em class="ph">placeholder</em>':'';
  b.innerHTML=TRACKS[k].title+ph+'<small>'+TRACKS[k].artist+'</small>';b.onclick=function(e){e.stopPropagation();pickTrack(k)};$('picks').appendChild(b)});
var ROMAN=['I','II','III','IV','V','VI','VII','VIII'];
function secAt(t){var i=0;for(var k=0;k<SECS.length;k++)if(t>=SECS[k].t)i=k;return i}
function ringAt(t){return t/T.dur*N*SP}
function env(i){i=Math.max(0,Math.min(N-1,i));var a=Math.floor(i),b=Math.min(N-1,a+1),f=i-a;return T.peaks[a]*(1-f)+T.peaks[b]*f}
function band(i,j){i=Math.max(0,Math.min(N-1,Math.round(i)));return T.bands[i]?T.bands[i][j]:0}
var railT=0,highlight=-1,pulseStar=0;
function drawWF(){if(!T||!wf.width)return;var c=wf.getContext('2d'),w=wf.width,h=wf.height,n=Math.min(N,Math.floor(w/(2*DPR))),pf=railT/T.dur;c.clearRect(0,0,w,h);
  for(var i=0;i<n;i++){var p=0;var a=Math.floor(i/n*N),b=Math.floor((i+1)/n*N);for(var j=a;j<b;j++)p=Math.max(p,T.peaks[j]||0);
    var x=(i+.5)/n*w,y=Math.max(.6*DPR,p*h*.42),on=i/n<pf;c.fillStyle=on?'rgba(85,218,161,'+(.35+.5*p).toFixed(2)+')':'rgba(220,232,240,'+(.14+.3*p).toFixed(2)+')';c.fillRect(x-.5*DPR,h/2-y,DPR,2*y)}}
/* ---------- audio graph ---------- */
var AC=null,AN=null,GN=null,FD=null,TD=null;
function initAudio(){if(REC){FD=FD||new Uint8Array(256);TD=TD||new Uint8Array(512);return}if(AC)return;var C=window.AudioContext||window.webkitAudioContext;AC=new C();var src=AC.createMediaElementSource(au);
  AN=AC.createAnalyser();AN.fftSize=512;AN.smoothingTimeConstant=.72;GN=AC.createGain();src.connect(AN);AN.connect(GN);GN.connect(AC.destination);
  FD=new Uint8Array(AN.frequencyBinCount);TD=new Uint8Array(AN.fftSize)}
function vol(v,t){FG.v=v;if(GN)GN.gain.setTargetAtTime(v,AC.currentTime,t||.08)}
var L={rms:0,low:0,mid:0,high:0,beat:0,avgLow:.2,lastBeat:0};
function listen(now){if(REC){if(au.paused||!PCM){L.rms*=.94;L.low*=.94;L.mid*=.94;L.high*=.94;L.beat*=.9;return}recFFT();post(now,48000);return}
  if(!AN||au.paused){L.rms*=.94;L.low*=.94;L.mid*=.94;L.high*=.94;L.beat*=.9;return}
  AN.getByteFrequencyData(FD);AN.getByteTimeDomainData(TD);post(now,AC.sampleRate)}
function post(now,sr){var s=0;for(var i=0;i<TD.length;i++){var v=(TD[i]-128)/128;s+=v*v}
  var bw=sr/512;function avg(a,b){var x=0,n=0;for(var k=Math.floor(a/bw);k<=Math.ceil(b/bw)&&k<FD.length;k++){x+=FD[k];n++}return x/n/255}
  L.rms=L.rms*.6+.4*Math.min(1,Math.sqrt(s/TD.length)*3.2);L.low=avg(35,160);L.mid=avg(300,2000);L.high=avg(3000,9000);
  L.avgLow=L.avgLow*.97+L.low*.03;if(L.low>L.avgLow*1.18&&L.low>.35&&now-L.lastBeat>280){L.lastBeat=now;L.beat=1;ripples.push({t0:now,a:.55+.45*L.low})}else L.beat*=.9}
var SM=new Float32Array(256),WIN=new Float32Array(512);for(var i=0;i<512;i++)WIN[i]=.42-.5*Math.cos(2*Math.PI*i/511)+.08*Math.cos(4*Math.PI*i/511);
function recFFT(){var o=Math.max(0,Math.floor(au.currentTime*PSR)-512),gv=FG.v;for(var i=0;i<512;i++)TD[i]=Math.max(0,Math.min(255,128+128*(PCM[o+i]||0)*gv));
  for(var k=0;k<120;k++){var re=0,im=0,w=2*Math.PI*k/512;for(var i=0;i<512;i++){var x=(PCM[o+i]||0)*WIN[i]*gv;re+=x*Math.cos(w*i);im-=x*Math.sin(w*i)}
    var mg=Math.sqrt(re*re+im*im)/512;SM[k]=.72*SM[k]+.28*mg;var db=20*Math.log10(SM[k]+1e-9);FD[k]=Math.max(0,Math.min(255,255*(db+100)/70))}}
/* ---------- the field ---------- */
function rnd(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
var BG=[];for(var i=0;i<320;i++)BG.push([rnd(i),rnd(i+999),Math.pow(rnd(i+77),3),rnd(i+44)*.8+.2]);
function glowC(rgb,sz){var c=document.createElement('canvas');c.width=c.height=sz;var x=c.getContext('2d'),gr=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);
  gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.45)');gr.addColorStop(.5,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=gr;x.fillRect(0,0,sz,sz);return c}
var GR=glowC(SOUND.t,64),GW=glowC('190,225,255',64),GM=glowC('85,218,161',64);
function px(z){return Math.sin(z*.021)*1.3+Math.sin(z*.0063)*2.2}
function py(z){return Math.cos(z*.017)*.9}
var camZ=0,tz=0,dive=0,mode='sky',ripples=[],prev=null,tw=0;
var DZ=9;
/* depth variation per constellation star so the sweep feels 3D */
function cstar3(k){var s=SOUND.s[k],sc=Math.min(W*.86,520),x=(s[0]-.5)*sc,y=(s[1]-.5)*sc*.5-H*.07;
  var z=DZ+(rnd(k*19.7)-.5)*3.2+(s[2]-.5)*1.4;return[x/F*DZ,y/F*DZ,z]}
function cstar(k){var p=cstar3(k);return[p[0],p[1]]}
var SRC=[];for(var i=0;i<FAR*K+K;i++)SRC.push(Math.floor(rnd(i*3.3)*18));
function ease(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function proj(x,y,z,cz,cx,cy){var d=z-cz;if(d<.05)return null;var k=F/d;return[W/2+(x-cx)*k,H*.46+(y-cy)*k,k,d]}
/* ---------- sky / free camera (cinematic sweep + Gill zoom rule) ----------
   Zoom levels are soft magnets only. On release the camera STAYS where it is.
   Snap/lock only: (1) settled NEAR a level, or (2) QUICK zoom velocity. Slow = free. */
var ZLV=[0.62,1.0,1.55,2.4]; /* overview · constellation · close · intimate */
var ZNEAR=0.07, ZQUICK=1.6;
var sky={pathT:0,panX:0,panY:0,zoom:1,zVel:0,lock:-1,user:0,pinch:null,drag:null,
  /* free look offsets that stay on release */
  ox:0,oy:0,oz:0};
function nearestZ(z){var bi=0,bd=1e9;for(var i=0;i<ZLV.length;i++){var d=Math.abs(z-ZLV[i]);if(d<bd){bd=d;bi=i}}return bi}
function maybeSnapZoom(reason){
  /* called on release only. never forced mid-gesture. */
  var z=sky.zoom,ni=nearestZ(z),nd=Math.abs(z-ZLV[ni]);
  if(nd<ZNEAR*(0.5+0.5*ZLV[ni])){sky.lock=ni;sky.zoom=ZLV[ni];sky.zVel=0;return 'near'}
  if(Math.abs(sky.zVel)>ZQUICK){var dir=sky.zVel>0?1:-1;var ti=Math.max(0,Math.min(ZLV.length-1,ni+dir));
    /* if already past nearest in that direction, go further */
    if(dir>0&&z>ZLV[ni]+0.01)ti=Math.max(0,Math.min(ZLV.length-1,ni+1));
    if(dir<0&&z<ZLV[ni]-0.01)ti=Math.max(0,Math.min(ZLV.length-1,ni-1));
    sky.lock=ti;sky.zoom=ZLV[ti];sky.zVel=0;return 'quick'}
  sky.lock=-1; /* stay free — no snap */
  return 'free'}
function setZoom(z,fromUser){z=Math.max(0.45,Math.min(3.2,z));
  if(fromUser){sky.zVel=sky.zVel*.55+(z-sky.zoom)/Math.max(1/60,.016)*.45;sky.lock=-1}
  sky.zoom=z}
function tempoNow(){return(T&&T.tempo)||1}
function regionSpeed(){
  /* varied constellation speed: blend by proximity of camera to song-stars */
  var best=tempoNow(),bd=9;
  for(var k in STAR2K){var p=cstar3(+k),dx=p[0]-sky.ox,dy=p[1]-sky.oy,dz=p[2]-(DZ+sky.oz),d=Math.sqrt(dx*dx+dy*dy+dz*dz);
    if(d<bd){bd=d;best=TRACKS[STAR2K[k]].tempo||1}}
  return best}
function skyStep(dt){
  pulseStar=Math.max(0,pulseStar-dt*.8);
  /* userOverride decays after release but POSITION stays */
  if(!sky.drag&&!sky.pinch)sky.user=Math.max(0,sky.user-dt*(au.paused?.35:.7));
  var playing=!au.paused&&(mode==='in'||mode==='diving');
  /* when paused: free move primary → sweep very slow; when playing: sweep continues unless user takes over */
  var hold=sky.user>0.25||sky.drag||sky.pinch;
  var sweepMul=hold?0.08:(au.paused?(mode==='sky'?0.45:0.05):(playing?1:0.7));
  var spd=0.22*regionSpeed()*sweepMul;
  if(!RM.matches)sky.pathT+=dt*spd;
  /* cinematic long arcs — Lissajous + slow dolly; user pan offsets stay on top */
  var t=sky.pathT;
  var sx=Math.sin(t*.21)*1.55+Math.sin(t*.073)*1.1+Math.cos(t*.041)*.4;
  var sy=Math.cos(t*.17)*.85+Math.sin(t*.11)*.55;
  var sz=Math.sin(t*.095)*2.4+Math.cos(t*.048)*1.1;
  if(hold){/* freeze sweep contribution — keep current ox/oy/oz (already include last sweep+pan) */}
  else{
    /* ease toward sweep target, preserving user pan as residual */
    var tx=sx+sky.panX,ty=sy+sky.panY,tz=sz;
    var k=1-Math.exp(-dt*(playing?1.2:0.7));
    sky.ox+= (tx-sky.ox)*k;sky.oy+=(ty-sky.oy)*k;sky.oz+=(tz-sky.oz)*k}
  /* soft settle toward locked zoom only while locked (after near/quick snap) */
  if(sky.lock>=0&&!sky.pinch){var tgt=ZLV[sky.lock];sky.zoom+=(tgt-sky.zoom)*Math.min(1,dt*6)}
}
/* projected sky stars for hit-testing / labels (updated each draw) */
var skyProj=[];
function skyCam(){
  /* camera behind the constellation plane; zoom dollies forward. stars stay clickable at free pos. */
  var dolly=Math.min(DZ-1.2,(sky.zoom-1)*3.2);
  return{cx:sky.ox,cy:sky.oy,cz:sky.oz+dolly,sc:sky.zoom}}
var last=performance.now(),LOG=[];
function frame(now){requestAnimationFrame(frame);var dt=Math.min(.05,(now-last)/1000);last=now;tick(now,dt)}
var VT=0,pauseAt=-1;function step(dt){VT+=dt;if(!au.paused&&au.currentTime!=null){au.currentTime+=dt;if(au.currentTime>=T.dur)au.currentTime=0}tick(VT*1000,dt)}
function tick(now,dt){if(REC&&pauseAt>0&&VT>=pauseAt){pauseAt=-1;if(mode!=='in'&&mode!=='diving')au.pause()}tw+=dt;listen(now);
  if(mode==='diving'){dive=Math.min(1,dive+dt/2.4);if(dive>=1){mode='in';sk.dataset.mode='in'}}
  else if(mode==='rising'){dive=Math.max(0,dive-dt/2.0);if(dive<=0){mode='sky';sk.dataset.mode='sky'}}
  if(mode==='sky'||mode==='rising')skyStep(dt);
  /* inside free-look when paused (primary); when playing meander continues unless user drag */
  if(mode==='in'||mode==='diving'){
    if(!dragging&&!au.paused)tz=ringAt(au.currentTime);
    var gap=tz-camZ;if(dragging||Math.abs(gap)>2.5)camZ+=gap*Math.min(1,dt*(dragging?5:3));else camZ+=gap*Math.min(1,dt*8);
    if(au.paused&&!sky.drag){/* free look stays */}
    else if(!sky.drag&&!au.paused){/* gentle meander on top of path — user pan stays as offset */
      sky.panX*=Math.exp(-dt*.15);sky.panY*=Math.exp(-dt*.15)}}
  else{if(!dragging&&!au.paused)tz=ringAt(au.currentTime);
    var gap2=tz-camZ;if(dragging||Math.abs(gap2)>2.5)camZ+=gap2*Math.min(1,dt*(dragging?5:3));else camZ+=gap2*Math.min(1,dt*8)}
  var ct=Math.max(0,Math.min(T.dur,camZ/(N*SP)*T.dur));if(!dragging)railT=au.paused?ct:au.currentTime;
  if(REC)LOG.push([VT,au.currentTime,au.paused?0:1,dragging?1:0,FG.v,sky.zoom,sky.ox,sky.oy]);
  chStep(dt);draw(now,dt);ui()}
function draw(now,dt){var c=g;c.setTransform(DPR,0,0,DPR,0,0);
  var m=ease(dive),sc=skyCam();
  var cx=px(camZ)*m+sky.panX*(mode==='in'||mode==='diving'?1:0)*(au.paused?1:.35);
  var cy=py(camZ)*m+sky.panY*(mode==='in'||mode==='diving'?1:0)*(au.paused?1:.35);
  var cz=camZ;
  c.fillStyle='#03050a';c.fillRect(0,0,W,H);var gr=c.createRadialGradient(W/2,H*.42,0,W/2,H*.42,Math.max(W,H)*.75);
  gr.addColorStop(0,'rgba(22,34,58,'+(.85-.45*m).toFixed(3)+')');gr.addColorStop(.6,'rgba(10,17,32,.6)');gr.addColorStop(1,'rgba(3,5,10,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
  /* background dust — parallax with sky camera */
  var bgA=1-.55*m;for(var i=0;i<BG.length;i++){var s=BG[i];
    var x=((s[0]*W*1.6-sc.cx*14*s[3]-sky.pathT*8*s[2])%(W*1.6)+W*1.6)%(W*1.6)-W*.3;
    var y=((s[1]*H*1.3-sc.cy*10*s[3])%(H*1.3)+H*1.3)%(H*1.3)-H*.15;
    var b=.06+.7*s[2]*(.7+.3*Math.sin(tw*1.3+i));
    c.fillStyle='rgba(225,232,250,'+(b*bgA).toFixed(3)+')';var r=(.4+s[2]*1.2)*Math.min(1.4,sc.sc);c.fillRect(x-r/2,y-r/2,r,r)}
  for(var i=ripples.length-1;i>=0;i--){var R=ripples[i],a=(now-R.t0)/1800;if(a>1){ripples.splice(i,1);continue}
    c.strokeStyle='rgba(190,220,245,'+(.32*R.a*(1-a)*m).toFixed(3)+')';c.lineWidth=1;c.beginPath();c.ellipse(W/2,H*.46,20+a*W*.7,(20+a*W*.7)*.62,0,0,7);c.stroke()}
  var live=1+L.rms*.55,glowK=.55+.9*L.beat;
  /* ---- tunnel (dive) ---- */
  if(m>0.002){var z0=Math.floor(cz/SP)+1,unf=ease((dive-.12)/.88),pts=new Array(FAR);
    for(var r=FAR-1;r>=0;r--){var ri=z0+r;if(ri>=N)continue;var z=ri*SP,e=env(ri),d=z-cz,near=Math.exp(-d/16),ring=[];
      var R0=(.75+3.0*Math.pow(e,1.6))*live,tw2=z*.045+tw*.08,lowB=band(ri,0),hiB=band(ri,2),isSec=false;
      for(var q=0;q<SECS.length;q++)if(Math.abs(ringAt(SECS[q].t)-ri)<.5)isSec=true;
      for(var k=0;k<K;k++){var an=k/K*6.2832+tw2,fk=FD?FD[2+Math.floor((k<K/2?k:K-k)/(K/2)*60)]/255:0;
        var rr=R0*(1+.42*fk*near*m+.12*Math.sin(an*3+z*.5-tw*2.2)*L.mid+.06*hiB*Math.sin(an*7+tw));
        var X=px(z)+Math.cos(an)*rr*1.0,Y=py(z)+Math.sin(an)*rr*.82,Z=z;
        if(unf<1){var sid=SRC[(r*K+k)%SRC.length],cs=cstar(sid),jx=(rnd(r*K+k)-.5)*.25,jy=(rnd(r*K+k+5)-.5)*.25,
          sz=cz+DZ*(1-ease(dive))+.4+r*.02*(1-dive);X=X*unf+(cs[0]+jx)*(1-unf);Y=Y*unf+(cs[1]+jy)*(1-unf);Z=Z*unf+sz*(1-unf)}
        ring.push(proj(X,Y,Z,cz,cx,cy))}
      pts[r]={p:ring,d:d,e:e,sec:isSec,low:lowB}}
    c.lineWidth=1;c.lineCap='round';
    for(var r=FAR-2;r>=0;r--){var A=pts[r],B=pts[r+1];if(!A||!B)continue;var fade=Math.min(1,(1-A.d/(FAR*SP))*1.6)*Math.min(1,A.d/1.2)*m,al=(.07+.20*A.e)*fade*glowK*unf*unf;
      c.strokeStyle='rgba('+SOUND.t+','+al.toFixed(3)+')';c.beginPath();
      for(var k=0;k<K;k+=2){var a=A.p[k],b=B.p[k];if(a&&b){c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1])}}c.stroke();
      if((A.sec||(z0+r)%6===0)&&unf>.6){fade*=(unf-.6)/.4;c.strokeStyle=A.sec?'rgba(85,218,161,'+(.55*fade).toFixed(3)+')':'rgba(190,220,245,'+(.16*fade*glowK).toFixed(3)+')';c.beginPath();
        for(var k=0;k<=K;k++){var a=A.p[k%K];if(!a)continue;k?c.lineTo(a[0],a[1]):c.moveTo(a[0],a[1])}c.stroke()}}
    for(var r=FAR-1;r>=0;r--){var A=pts[r];if(!A)continue;var fade=Math.min(1,(1-A.d/(FAR*SP))*1.6)*Math.min(1,A.d/.9)*(.25+.75*m);
      for(var k=0;k<K;k++){var p=A.p[k];if(!p||p[0]<-40||p[0]>W+40||p[1]<-40||p[1]>H+40)continue;var h=rnd((z0+r)*31+k),br=(.25+.75*A.e)*(.55+.45*h);
        var sz=Math.max(.9,Math.min(5,p[2]*.016*(.6+br)));c.globalAlpha=Math.min(1,fade*(.4+.6*br));
        if(h>.8||A.sec){var gs=sz*(7+12*L.beat*A.e+6*A.low)*glowK;c.globalCompositeOperation='lighter';c.drawImage(A.sec?GM:(h>.95?GW:GR),p[0]-gs/2,p[1]-gs/2,gs,gs);c.globalCompositeOperation='source-over'}
        c.fillStyle=h>.93?'#fff':'rgb(255,'+(232+Math.round(20*h))+','+(228+Math.round(25*h))+')';c.fillRect(p[0]-sz/2,p[1]-sz/2,sz,sz);
        if(prev&&prev[r*K+k]){var o=prev[r*K+k],dx=p[0]-o[0],dy=p[1]-o[1];if(dx*dx+dy*dy>9&&dx*dx+dy*dy<90000){c.globalAlpha*=.5;c.strokeStyle='#fff';c.lineWidth=sz*.6;c.beginPath();c.moveTo(p[0]-dx*.7,p[1]-dy*.7);c.lineTo(p[0],p[1]);c.stroke();c.lineWidth=1}}}}
    c.globalAlpha=1;
    var vp=proj(px(cz+FAR*SP*.8),py(cz+FAR*SP*.8),cz+FAR*SP*.8,cz,cx,cy);if(vp){var vr=Math.min(W,H)*(.22+.18*L.beat+.2*L.rms)*m;var vg=c.createRadialGradient(vp[0],vp[1],0,vp[0],vp[1],vr);
      vg.addColorStop(0,'rgba('+SOUND.t+','+(.22*m*(.5+L.rms)).toFixed(3)+')');vg.addColorStop(1,'rgba('+SOUND.t+',0)');c.globalCompositeOperation='lighter';c.fillStyle=vg;c.fillRect(vp[0]-vr,vp[1]-vr,2*vr,2*vr);c.globalCompositeOperation='source-over'}
    if(TD&&!au.paused&&unf>.5){var zr=cz+11,cxr=px(zr),cyr=py(zr),Rr=(.9+2.2*env(zr/SP))*live,n=96;c.lineWidth=1.2;
      for(var pass=0;pass<2;pass++){c.strokeStyle=pass?'rgba(255,240,236,'+(.55*unf).toFixed(3)+')':'rgba('+SOUND.t+','+(.18*unf*glowK).toFixed(3)+')';c.lineWidth=pass?1:5;c.beginPath();
        for(var k=0;k<=n;k++){var kk=k%n,ti=Math.floor((kk<n/2?kk:n-kk)/(n/2)*(TD.length-1)),v=(TD[ti]-128)/128,an=kk/n*6.2832-tw*.3,rr=Rr*(1+v*.9);
          var q=proj(cxr+Math.cos(an)*rr,cyr+Math.sin(an)*rr*.82,zr,cz,cx,cy);if(q)k?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])}c.stroke()}c.lineWidth=1}
    var nx=[];for(var r=0;r<FAR;r++){var A=pts[r];for(var k=0;k<K;k++)nx[r*K+k]=A&&A.p[k]?[A.p[k][0],A.p[k][1]]:null}
    prev=(Math.abs(camZ-tz)>2||(dive>0&&dive<1))?nx:null}
  /* ---- constellation (sky) with free camera ---- */
  var sa=1-ease(dive*1.7);
  skyProj=[];
  if(sa>.01){
    var cam=skyCam(),sp=[],zcBase=cam.cz+DZ;
    for(var k=0;k<SOUND.s.length;k++){var cs=cstar3(k);
      var q=proj(cs[0],cs[1],cs[2],cam.cz,cam.cx,cam.cy);
      if(q){q[2]*=cam.sc;sp.push(q)}else sp.push(null)}
    skyProj=sp;
    var hz=Math.min(1.6,cam.sc*(sp[7]&&isFinite(sp[7][2])?Math.min(1.4,sp[7][2]/(F/DZ)):1));if(!isFinite(hz))hz=1;
    for(var i=0;i<CH.length;i++){var ch=CH[i],q=sp[ch.b];if(q&&ch.L){var bb=bob(ch);sp[ch.b]=[q[0]+(bb[0]-ch.rx)*Math.min(1,hz),q[1]+(bb[1]-ch.ry)*Math.min(1,hz),q[2],q[3]]}}
    var nr=Math.min(W,520)*.55*Math.min(1.2,isFinite(hz)?hz:1);if(!(nr>0))nr=1;var gg=c.createRadialGradient(W/2,H*.46,0,W/2,H*.46,nr);
    gg.addColorStop(0,'rgba('+SOUND.t+','+(.09*sa).toFixed(3)+')');gg.addColorStop(1,'rgba('+SOUND.t+',0)');c.fillStyle=gg;c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(255,214,208,'+(.5*sa*sa).toFixed(3)+')';c.lineWidth=1;c.beginPath();
    SOUND.e.forEach(function(e){var a=sp[e[0]],b=sp[e[1]];if(a&&b){c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1])}});c.stroke();
    for(var k=0;k<SOUND.s.length;k++){var p=sp[k];if(!p)continue;var s=SOUND.s[k],b=s[2]*(.85+.15*Math.sin(tw*1.7+k*1.3)),SF=1.15*Math.min(1.8,hz);
      var isSong=STAR2K[k]!=null,sel=k===highlight;
      var gs=(6+30*b*b)*SF*(isSong?1.15:1)*(sel?1.35+0.25*pulseStar:1);
      for(var i=0;i<CH.length;i++)if(CH[i].b===k)gs*=1+.7*CH[i].fl;
      c.globalAlpha=sa*(.35+.65*b)*(s[3]?.8:1);c.drawImage(sel?GM:(isSong?GR:GR),p[0]-gs/2,p[1]-gs/2,gs,gs);
      if(sel){c.globalCompositeOperation='lighter';c.drawImage(GM,p[0]-gs*.7,p[1]-gs*.7,gs*1.4,gs*1.4);c.globalCompositeOperation='source-over'}
      c.globalAlpha=sa*(.45+.55*b);c.fillStyle='#fff';c.beginPath();c.arc(p[0],p[1],(.5+1.9*b)*SF*.85*(isSong?1.1:1),0,7);c.fill()}
    /* subtle song titles near stars — stay readable at free zoom positions */
    c.textAlign='left';c.textBaseline='middle';
    for(var k in STAR2K){var ki=+k,p=sp[ki];if(!p)continue;var tr=TRACKS[STAR2K[ki]];if(!tr)continue;
      var labA=sa*(.28+.45*Math.min(1,(sky.zoom-0.5)/1.2))*(ki===highlight?1.4:1);
      if(labA<.08)continue;
      var tx=p[0]+8+4*Math.min(1.5,hz),ty=p[1]-2;
      c.globalAlpha=labA;c.font='300 '+(9.5*Math.min(1.25,0.85+sky.zoom*.2))+'px Poppins,system-ui,sans-serif';
      c.fillStyle='rgba(220,232,240,.95)';c.fillText(tr.title,tx,ty);
      c.font='300 '+(8*Math.min(1.2,0.85+sky.zoom*.15))+'px Poppins,system-ui,sans-serif';
      c.fillStyle=tr.placeholder?'rgba(85,218,161,.75)':'rgba(201,211,214,.7)';
      c.fillText(tr.placeholder?'placeholder · '+(tr.artist||''):tr.artist,tx,ty+11)}
    c.globalAlpha=1}
  if(fing&&fing.a>.01){c.globalAlpha=fing.a;c.drawImage(GW,fing.x-16,fing.y-16,32,32);c.globalAlpha=1;if(!fing.on)fing.a*=.8}
  var fl=Math.max(0,1-Math.abs(dive-.42)/.14);if(fl>0&&(mode==='diving'||mode==='rising')){c.fillStyle='rgba(220,235,255,'+(.10*fl).toFixed(3)+')';c.fillRect(0,0,W,H)}
}
/* ---------- wind chimes ---------- */
var RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var PENT=[523.25,587.33,659.25,783.99,880.00],CHR=[1,2.76,5.40],CHD=[2.6,1.1,.42];
var TB=[[1,.20,.06],[1,.14,.09],[1,.24,.05],[1,.12,.08],[1,.18,.10]],CDT=[0,.0015,-.001,.002,-.0015];
var CH=SOUND.e.slice(0,5).map(function(e,i){return{a:e[0],b:e[1],th:0,w:0,fl:0,f:PENT[i],v:i,lc:-1}}),CHL=[],chT=0;
function skyXY(k){var s=SOUND.s[k],sc=Math.min(W*.86,520);return[W/2+(s[0]-.5)*sc,H*.46+(s[1]-.5)*sc*.5-H*.07]}
function chGeo(){for(var i=0;i<CH.length;i++){var c=CH[i],p=skyXY(c.a),r=skyXY(c.b);c.px=p[0];c.py=p[1];c.rx=r[0];c.ry=r[1];c.L=Math.max(20,Math.hypot(r[0]-p[0],r[1]-p[1]));c.a0=Math.atan2(r[0]-p[0],r[1]-p[1])}}
function bob(c){return[c.px+c.L*Math.sin(c.a0+c.th),c.py+c.L*Math.cos(c.a0+c.th)]}
function chStep(dt){chGeo();var rm=RM.matches,damp=rm?1.5:.7,vmax=rm?34:68,h=1/120,n=Math.min(8,Math.ceil(dt/h));h=dt/Math.max(1,n);
  for(var s=0;s<n;s++){chT+=h;
    for(var i=0;i<CH.length;i++){var c=CH[i];c.w+=(-(900/c.L)*Math.sin(c.th)-damp*c.w)*h;var v=c.w*c.L;if(Math.abs(v)>vmax)c.w=(v>0?vmax:-vmax)/c.L;c.th+=c.w*h}
    for(var i=0;i<CH.length-1;i++){var A=CH[i],B=CH[i+1],xa=bob(A)[0],xb=bob(B)[0],g0=B.rx-A.rx,ct=g0-9;
      if(xb-xa<ct){var va=A.w*A.L,vb=B.w*B.L,rel=va-vb;
        if(rel>0){var m=(va+vb)/2,e=.4;A.w=(m-e*rel/2)/A.L;B.w=(m+e*rel/2)/B.L;var vel=Math.min(1,rel/(rm?60:110));
          if(vel>.04){if(chT-A.lc>.09){A.lc=chT;chime(A.f,vel,A.v,0)}if(chT-B.lc>.09){B.lc=chT;chime(B.f,vel*.7,B.v,.014)}A.fl=Math.max(A.fl,vel);B.fl=Math.max(B.fl,vel)}}
        var ov=(ct-(xb-xa))/2;A.th-=ov/A.L;B.th+=ov/B.L}}}
  for(var i=0;i<CH.length;i++){var c=CH[i];c.fl*=Math.exp(-dt*3);if(Math.abs(c.th)<2e-4&&Math.abs(c.w)<2e-3){c.th=0;c.w=0}}}
function chActive(){return mode==='sky'}
function segD(x,y,c){var b=bob(c),dx=b[0]-c.px,dy=b[1]-c.py,t=Math.max(0,Math.min(1,((x-c.px)*dx+(y-c.py)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-c.px-dx*t,y-c.py-dy*t)}
function chHit(x,y){var best=null,bd=24;for(var i=0;i<CH.length;i++){var c=CH[i],b=bob(c),d=Math.min(segD(x,y,c)+(y<c.py+12?99:0),Math.hypot(x-b[0],y-b[1])-4);if(d<bd){bd=d;best=c}}return best}
function wind(x,y,vx,vy,dt){var rm=RM.matches,cap=rm?320:640,sp=Math.hypot(vx,vy);if(sp>cap){vx*=cap/sp;vy*=cap/sp}
  for(var i=0;i<CH.length;i++){var c=CH[i],d=segD(x,y,c),wg=.12+.88*Math.exp(-d*d/(2*60*60)),f=vx+.25*Math.abs(vy)*(c.rx<x?-1:1);c.w+=f*.42*wg*(.3+1.4*rnd(i*7.1+chT*61))*dt/c.L}}
function pluck(c,x){var rm=RM.matches,dir=x<bob(c)[0]?1:-1;c.w+=dir*(rm?12:22)/c.L;c.fl=Math.max(c.fl,.6);chime(c.f,.5,c.v,0)}
var CB=null,VOX=[],unl=false,CHN=0;
function unlock(){if(REC)return;try{initAudio();if(AC.state==='suspended')AC.resume();if(!unl){var b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0);unl=true}}catch(x){}}
['pointerdown','touchend','pointerup','keydown'].forEach(function(t){addEventListener(t,unlock,{capture:true,passive:true})});
function chime(f,vel,vi,dl){if(REC){CHL.push([+(VT+dl).toFixed(4),f,+vel.toFixed(3),vi]);return}
  if(!AC||AC.state!=='running')return;var t=AC.currentTime+dl;
  if(!CB){var cp=AC.createDynamicsCompressor();cp.threshold.value=-26;cp.ratio.value=6;cp.attack.value=.003;cp.release.value=.3;CB=AC.createGain();CB.gain.value=.3;CB.connect(cp);cp.connect(AC.destination)}
  CB.gain.setTargetAtTime(au.paused?.3:.13,AC.currentTime,.1);
  while(VOX.length>=8){var o=VOX.shift();try{o.g.gain.cancelScheduledValues(t);o.g.gain.setTargetAtTime(0,t,.015);o.os.forEach(function(s){s.stop(t+.12)})}catch(x){}}
  var g=AC.createGain(),amp=.05+.25*Math.pow(vel,1.4),tb=TB[vi],os=[];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+.004);g.gain.exponentialRampToValueAtTime(.0003,t+2.8);g.connect(CB);
  for(var j=0;j<3;j++){var o=AC.createOscillator(),pg=AC.createGain();o.frequency.value=f*CHR[j]*(1+CDT[vi]*j);pg.gain.setValueAtTime(tb[j],t);pg.gain.exponentialRampToValueAtTime(.0001,t+CHD[j]);o.connect(pg);pg.connect(g);o.start(t);o.stop(t+2.85);os.push(o)}
  CHN++;var V={g:g,os:os};VOX.push(V);os[0].onended=function(){var k=VOX.indexOf(V);if(k>=0)VOX.splice(k,1);g.disconnect()}}
var fing=null;
/* ---------- ui ---------- */
var lastUI='';
function mmss(s){s=Math.max(0,s);var m=Math.floor(s/60),x=Math.floor(s%60);return(m<10?'0':'')+m+':'+(x<10?'0':'')+x}
function ui(){var t=railT,si=secAt(t),key=t.toFixed(1)+si+au.paused+TK+mode+sky.zoom.toFixed(2);if(key===lastUI)return;lastUI=key;
  var pc=t/T.dur*100;fillE.style.width=pc+'%';headE.style.left=pc+'%';$('tc').textContent=mmss(t)+' / '+mmss(T.dur);
  $('sn').textContent=ROMAN[si]+' · '+SECS[si].name;$('crumbSec').textContent=mode==='sky'?' · '+T.title:' · '+T.title;
  [].forEach.call(rail.querySelectorAll('.tk'),function(e,k){e.classList.toggle('on',k===si)});rail.setAttribute('aria-valuenow',t.toFixed(0));
  $('pp').textContent=au.paused?'▶':'❚❚';$('pp').setAttribute('aria-label',au.paused?'play':'pause');drawWF()}
function goIn(){if(mode==='in'||mode==='diving')return;initAudio();if(AC&&AC.state==='suspended')AC.resume();vol(1,.3);au.play().catch(function(){});
  mode='diving';sk.dataset.mode='diving';if(!REC&&history.state!=='in')history.pushState('in','')}
function goOut(fromPop){if(mode==='sky'||mode==='rising')return;mode='rising';sk.dataset.mode='rising';vol(0,.5);pauseAt=VT+1.6;if(!REC)setTimeout(function(){if(mode!=='in'&&mode!=='diving')au.pause()},1600);
  if(!fromPop&&!REC&&history.state==='in')history.back()}
$('dive').onclick=function(e){e.stopPropagation();goIn()};
$('rise').onclick=function(e){e.stopPropagation();goOut()};
$('pp').onclick=function(){if(au.paused){vol(1);au.play()}else au.pause()};
addEventListener('popstate',function(){if(mode==='in'||mode==='diving')goOut(true)});
addEventListener('keydown',function(e){if(e.key==='Escape')goOut();if(e.key===' '&&mode==='in'){e.preventDefault();$('pp').onclick()}});
/* star hit-test at current free-camera projection */
function starHit(x,y){var best=-1,bd=28;for(var k in STAR2K){var p=skyProj[+k];if(!p)continue;var d=Math.hypot(x-p[0],y-p[1]);if(d<bd){bd=d;best=+k}}return best}
/* canvas gestures: chimes / pan / pinch-zoom / star-select / dive */
var p0=null,TAPD=12,TAPT=400,ptrs={};
function tnow(e){return REC?VT:e.timeStamp/1000}
function ptrList(){var a=[];for(var id in ptrs)a.push(ptrs[id]);return a}
cv.addEventListener('pointerdown',function(e){
  ptrs[e.pointerId]={x:e.clientX,y:e.clientY,t:performance.now()};
  try{cv.setPointerCapture(e.pointerId)}catch(x){}
  var pl=ptrList();
  if(pl.length===2&&(mode==='sky'||(mode==='in'&&au.paused))){
    var dx=pl[0].x-pl[1].x,dy=pl[0].y-pl[1].y;
    sky.pinch={d0:Math.hypot(dx,dy),z0:sky.zoom,lx:pl[0].x,ly:pl[0].y};sky.user=1;sky.lock=-1;p0=null;return}
  p0={x:e.clientX,y:e.clientY,t:performance.now(),lx:e.clientX,ly:e.clientY,lt:tnow(e),sw:false,vx:0,vy:0,pan:false,chime:false};
  if(REC)fing={x:e.clientX,y:e.clientY,a:.5,on:true}});
cv.addEventListener('pointermove',function(e){
  if(ptrs[e.pointerId]){ptrs[e.pointerId].x=e.clientX;ptrs[e.pointerId].y=e.clientY}
  if(fing){fing.x=e.clientX;fing.y=e.clientY}
  var pl=ptrList();
  if(sky.pinch&&pl.length>=2){
    var dx=pl[0].x-pl[1].x,dy=pl[0].y-pl[1].y,d=Math.hypot(dx,dy);
    var sens=au.paused?1.2:0.92; /* paused: zoom easier / primary */
    setZoom(sky.pinch.z0*Math.pow(d/Math.max(8,sky.pinch.d0),sens),true);
    sky.user=1;return}
  if(!p0)return;
  if(!p0.sw&&Math.hypot(e.clientX-p0.x,e.clientY-p0.y)>=TAPD){
    p0.sw=true;
    /* decide: chime wind vs camera pan */
    var nearCh=chActive()&&chHit(p0.x,p0.y);
    if(nearCh)p0.chime=true;
    else if(mode==='sky'||(mode==='in'&&au.paused)||mode==='in'){p0.pan=true;sky.drag=true;sky.user=1;sky.lock=-1}}
  var t=tnow(e),dt=Math.max(1/120,t-p0.lt),vx=(e.clientX-p0.lx)/dt,vy=(e.clientY-p0.ly)/dt;p0.vx=p0.vx*.4+vx*.6;p0.vy=p0.vy*.4+vy*.6;
  if(p0.sw&&p0.chime&&chActive())wind(e.clientX,e.clientY,p0.vx,p0.vy,Math.min(dt,.05));
  if(p0.sw&&p0.pan){
    var sens=au.paused?1.35:0.9; /* paused: free move easier */
    var k=(mode==='sky'?2.2:1.4)*sens/Math.max(0.5,sky.zoom)/F;
    sky.panX-= (e.clientX-p0.lx)*k;sky.panY-=(e.clientY-p0.ly)*k;
    sky.ox-=(e.clientX-p0.lx)*k;sky.oy-=(e.clientY-p0.ly)*k;
    sky.user=1}
  p0.lx=e.clientX;p0.ly=e.clientY;p0.lt=t});
function endPtr(e){
  delete ptrs[e.pointerId];
  if(sky.pinch&&ptrList().length<2){
    /* RELEASE: stay where we are; snap only near level or quick velocity */
    maybeSnapZoom('release');sky.pinch=null;sky.user=1; /* user=1 so sweep yields briefly, position stays */}
  if(fing)fing.on=false;if(!p0)return;
  var dy=e.clientY-p0.y,dx=e.clientX-p0.x,tap=Math.abs(dx)+Math.abs(dy)<TAPD;
  if(p0.pan){sky.drag=null;sky.user=1; /* stay — no snap on pan release */}
  else if(p0.chime){var hit=chActive()?chHit(p0.x,p0.y):null;if(hit&&tap&&performance.now()-p0.t<TAPT)pluck(hit,p0.x)}
  else if(mode==='in'&&dy>80&&Math.abs(dx)<dy)goOut();
  else if(tap&&performance.now()-p0.t<TAPT){
    if(mode==='sky'){var sh=starHit(p0.x,p0.y);if(sh>=0&&STAR2K[sh]){pickTrack(STAR2K[sh],true);unlock()}
      else if(!chHit(p0.x,p0.y))goIn()}
    else if(mode==='in')$('pp').onclick()}
  p0=null}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',function(e){delete ptrs[e.pointerId];if(fing)fing.on=false;sky.pinch=null;sky.drag=null;p0=null});
/* wheel = slow zoom (free continuous); quick flick → velocity snap on settle */
var wheelAcc=0,wheelTimer=null;
cv.addEventListener('wheel',function(e){e.preventDefault();if(!(mode==='sky'||(mode==='in'&&au.paused)||mode==='in'))return;
  sky.user=1;sky.lock=-1;
  var sens=au.paused?0.0018:0.0012;
  setZoom(sky.zoom*Math.exp(-e.deltaY*sens),true);
  wheelAcc=sky.zVel;
  clearTimeout(wheelTimer);
  wheelTimer=setTimeout(function(){maybeSnapZoom('wheel-settle');sky.user=1},140);
},{passive:false});
/* rail scrub */
var dragging=false,PR=null,seekQ=0;
function railTime(e){var r=rail.getBoundingClientRect();return Math.max(0,Math.min(T.dur-.05,(e.clientX-r.left)/r.width*T.dur))}
rail.addEventListener('pointerdown',function(e){PR=e.pointerId;try{rail.setPointerCapture(PR)}catch(x){}dragging=true;rail.classList.add('drag');vol(.25,.05);scrub(railTime(e))});
rail.addEventListener('pointermove',function(e){if(PR===e.pointerId)scrub(railTime(e))});
function scrub(t){railT=t;tz=ringAt(t);var n=performance.now();if(n-seekQ>140){seekQ=n;au.currentTime=t}}
function pup(e){if(PR!==e.pointerId)return;PR=null;rail.classList.remove('drag');au.currentTime=railTime(e);dragging=false;vol(au.paused?0:1,.15);if(au.paused&&mode==='in'){vol(1);au.play()}}
rail.addEventListener('pointerup',pup);rail.addEventListener('pointercancel',pup);
rail.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?5:e.key==='ArrowLeft'?-5:0;if(d){au.currentTime=Math.max(0,Math.min(T.dur,au.currentTime+d));tz=ringAt(au.currentTime)}});
au.addEventListener('ended',function(){au.currentTime=0;tz=0;au.play()});
addEventListener('resize',rs);
pickTrack(TK);rs();if(!REC)requestAnimationFrame(frame);else{last=0;tick(0,0)}
window.__sk={played:function(){return{n:CHN,vox:VOX.length,ac:AC&&AC.state}},chimes:function(){var l=CHL;CHL=[];return l},ch:function(){return CH.map(function(c){var b=bob(c);return{x:b[0],y:b[1],px:c.px,py:c.py,th:c.th,w:c.w}})},
  step:function(n,dt){for(var i=0;i<n;i++)step(dt)},ready:function(){return!!PCM||!REC},goIn:goIn,goOut:goOut,log:function(){var l=LOG;LOG=[];return l},
  state:function(){return{mode:mode,t:au.currentTime,dive:dive,zoom:sky.zoom,lock:sky.lock,pan:[sky.panX,sky.panY],ox:sky.ox,oy:sky.oy,track:TK,pathT:sky.pathT}},
  pick:pickTrack,setZoom:setZoom,maybeSnap:maybeSnapZoom,sky:sky,ZLV:ZLV,wind:wind,pluck:function(i,x){if(CH[i])pluck(CH[i],x==null?bob(CH[i])[0]:x)},chHit:chHit};
})();
