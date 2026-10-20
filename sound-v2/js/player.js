/* sound sketch · "inside a sound's pattern". canvas2D, no build.
   sky: the Sound constellation (star data copied from site-v3 js/sheet.js SH.sound).
   dive: the constellation's stars are 3D points ahead of the camera; the camera flies through them and every star
   un-folds into the tunnel of the track's waveform (ring radius = the track's offline envelope at that moment).
   inside: AnalyserNode drives it live: rms swells the rings, spectrum bands ripple round each ring, beats pulse the glow
   and send a water ripple. the camera drifts forward one ring per 1/6 s of song; the rail flies it to any moment.
   MERGED (chimes+zoom + sketch-next sweep): six song stars live ON the constellation: five of them are exactly the stars
   the five wind-chime strands hang from (No Problem 2, Gone 5, To Go 7, Lost in Time 10, = 13) and ii sits on the ridge (4).
   tap a star = choose its song (green glow), tap a strand = its note, tap empty sky = dive. one-finger drag that starts on
   a strand = wind; one that starts on empty sky = pan; two fingers = pinch + pan. zoom is never changed by anything but
   the user. a slow sweep drifts the pan (never the zoom) after the view has been left alone while zoomed in.
   SOUND v2 (Oct 19; Gill: "you can't move it around with one finger like the other zoom effect. Add some of the 3d elements"):
   . one finger pans at every zoom depth, 1:1 with a short controlled glide on release (the site's sky pan + the fly-through's
     ease-out: first order, no overshoot, speed capped, <= 700 ms). the intro block and the header no longer swallow drags.
   . gesture rule: a drag pans. only a quick SWIPE that starts on/at a strand (within 26 px, first 12 px in <= 90 ms) is wind
     for the strands instead (sways + knocks + chimes, as before). and because the strands hang from the sky, a pan's
     acceleration swings them a little too (pendulums on a moving frame). tap strand = note, tap song star = song, unchanged.
   . 3D sky: three layers of background stars on a sphere around you, parallax by layer (near moves most, all less than the
     constellation, kept close: nothing is pushed far away), zoom spreads the nearer layers more, the perspective curves their
     paths toward the edges, the universe rolls ~3 deg per screen-width of pan (capped 5 deg), slow twinkle 2-6 s.
     the constellation itself stays flat and exact (hit tests unchanged). reduced motion: no glide, no roll, no twinkle.
   SOUND v2 · 3D BLEND (Gill: "what happened to the 3d look where you can change perspective" + on sketch-3d "incredible ...
   but you get lost a little too easily. A blend of the two would be amazing"): REAL 3D in the same canvas, no library.
   . every constellation star has a depth (the song stars and the strands too); each sits on the ray through where the 2D
     design draws it, so the front view is exactly the designed constellation, and turning it reveals the depth.
   . a true perspective camera orbits the constellation's centre: yaw / pitch / roll. TWO fingers = pinch zoom + drag to
     tilt / orbit + twist to roll; Shift+drag or right-drag with a mouse; keys [ ] tilt, H = home.
   . background stars are 3D points in a shallow volume around the constellation (in front of and behind it, kept close),
     so orbiting, panning and zooming show real parallax; one-finger swiping leans ("rotates") the universe a few degrees
     with the speed of the swipe and it settles back level when you stop (critically damped, no drift). slow twinkle.
   . GUARDRAILS (can't get lost): orbit yaw +-30 deg, pitch +-25 deg, roll +-12 deg, soft rubber band past them (max +25%)
     that springs back on release; pan keeps the screen centre over the constellation (+30 px) and zoom stays 1-4x, so the
     six song stars are always in or near view; after 3 s without touch the perspective eases back to the front (your zoom
     and pan are kept); the home mark (top right) or a double-tap on empty sky flies home (front, 1x, centred) in 0.9 s;
     song stars off screen get a faint chevron at the edge pointing to them (plus their pinned label).
   . strands hang in 3D from their stars; tap/swipe hit tests use the projected strands, so notes and wind still land. */
(function(){
'use strict';
var SOUND={t:'255,182,176',s:[[0.058,0.493,0.35,0],[0.143,0.434,0.45,0],[0.195,0.295,0.63,0],[0.186,0.645,0.45,0],[0.282,0.392,0.53,0],[0.338,0.216,0.8,0],[0.347,0.763,0.55,0],[0.441,0.135,0.92,0],[0.442,0.812,0.62,0],[0.498,0.253,0.71,0],[0.567,0.183,0.86,0],[0.57,0.827,0.58,0],[0.659,0.355,0.57,0],[0.718,0.259,0.66,0],[0.719,0.711,0.47,0],[0.807,0.434,0.44,0],[0.886,0.419,0.5,0],[0.941,0.497,0.35,0],[0.26,0.93,0.2,1],[0.61,0.06,0.24,1],[0.9,0.88,0.26,1],[0.15,0.7,0.3,1]],
  e:[[2,3],[5,6],[7,8],[10,11],[13,14],[0,1],[1,2],[2,4],[4,5],[5,7],[7,9],[9,10],[10,12],[12,13],[13,15],[15,16],[16,17]]};
var Q=new URLSearchParams(location.search),REC=Q.has('rec');
var $=function(id){return document.getElementById(id)};
var sk=$('sk'),cv=$('cv'),g=cv.getContext('2d'),au0=$('au'),rail=$('rail'),wf=$('wf'),fillE=$('fill'),headE=$('head');
var W=0,H=0,DPR=1,F=1;
/* REC (demo capture): a virtual clock + a fake transport, and the analyser is replaced by a JS DFT over the decoded PCM at the
   virtual time, so a headless capture renders frame-exact at any speed and the real audio is muxed afterwards */
var FG={v:1},au=REC?{currentTime:0,paused:true,play:function(){this.paused=false;return Promise.resolve()},pause:function(){this.paused=true},load:function(){},addEventListener:function(){}}:au0;
var PCM=null,PSR=48000;
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;F=Math.min(W,H)*1.05;
  var r=rail.getBoundingClientRect();wf.width=Math.max(1,r.width*DPR|0);wf.height=Math.max(1,r.height*DPR|0);drawWF();fitLayout()}
/* safe band: below the header (+ one label line) and above the intro block while it shows; whole screen once it has faded */
var HUD=document.querySelector('.hud');
function safeBand(live){var st=0;try{st=Math.max(0,parseFloat(getComputedStyle(HUD).paddingTop)-6)||0}catch(x){}
  var t0=(live||!UR)?IN.getBoundingClientRect().top:UR.intro[1],it=t0>0?t0-8:H-18;return{top:78+st,bot:IA>.4?Math.min(H-18,it):H-18,left:14,right:W-14,introTop:it}}
function fitLayout(){FIT.s=1;FIT.dy=0;var sb=safeBand(true),bot1=Math.min(H-18,sb.introTop),y0=1e9,y1=-1e9;
  for(var k=0;k<SOUND.s.length;k++){var q=skyXY(k);y0=Math.min(y0,q[1]-(STAR2K[k]!=null?30:6));y1=Math.max(y1,q[1]+8)}
  var room=bot1-sb.top,o=H*.46;if(y1-y0>room&&room>40){FIT.s=room/(y1-y0);y0=o+(y0-o)*FIT.s;y1=o+(y1-o)*FIT.s}
  if(y0<sb.top)FIT.dy=sb.top-y0;else if(y1>bot1)FIT.dy=bot1-y1;FIT.dy=Math.round(FIT.dy*10)/10}
/* ---------- track ---------- */
var KEYS=Object.keys(TRACKS),TK=TRACKS[Q.get('track')]?Q.get('track'):'togo',T=TRACKS[TK],N=0,SECS=[];
/* song star -> track key (tracks.js star index into SOUND.s) */
var STAR2K={};KEYS.forEach(function(k){if(TRACKS[k].star!=null)STAR2K[TRACKS[k].star]=k});
var SP=1,FAR=64,K=26; /* ring spacing, draw distance (rings), points per ring */
function pickTrack(k,fromStar){if(!TRACKS[k])return;TK=k;T=TRACKS[k];N=T.peaks.length;au0.src=T.file;au0.load();if(REC){PCM=null;fetch(T.file).then(function(r){return r.arrayBuffer()}).then(function(b){return new OfflineAudioContext(1,1,48000).decodeAudioData(b)}).then(function(d){PCM=d.getChannelData(0);PSR=d.sampleRate})}
  $('ttl').textContent=T.title;$('art').textContent=T.artist;SECS=T.sections;
  [].slice.call(rail.querySelectorAll('.tk')).forEach(function(t){t.remove()});
  SECS.forEach(function(s,i){var t=document.createElement('i');t.className='tk';t.style.left=(s.t/T.dur*100)+'%';rail.insertBefore(t,headE)});
  [].forEach.call($('picks').children,function(b){b.setAttribute('aria-checked',b.dataset.k===k)});
  rail.setAttribute('aria-valuemax',T.dur);drawWF();
  if(!fromStar){camZ=tz=ringAt(+Q.get('t')||0);if(Q.get('t'))au.currentTime=+Q.get('t')}else{camZ=tz=0;au.currentTime=0}
  highlight=T.star!=null?T.star:-1;pulseStar=1}
KEYS.forEach(function(k){var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.k=k;
  b.innerHTML=TRACKS[k].title+'<small>'+TRACKS[k].artist+'</small>';b.onclick=function(e){e.stopPropagation();pickTrack(k)};$('picks').appendChild(b)});
var ROMAN=['I','II','III','IV','V','VI','VII','VIII'];
function secAt(t){var i=0;for(var k=0;k<SECS.length;k++)if(t>=SECS[k].t)i=k;return i}
function ringAt(t){return t/T.dur*N*SP}
function env(i){i=Math.max(0,Math.min(N-1,i));var a=Math.floor(i),b=Math.min(N-1,a+1),f=i-a;return T.peaks[a]*(1-f)+T.peaks[b]*f}
function band(i,j){i=Math.max(0,Math.min(N-1,Math.round(i)));return T.bands[i][j]}
/* ---------- whole-track waveform on the rail (mirrored hairline bars, the played part mint) ---------- */
var railT=0,highlight=-1,pulseStar=0;
function drawWF(){if(!T||!wf.width)return;var c=wf.getContext('2d'),w=wf.width,h=wf.height,n=Math.min(N,Math.floor(w/(2*DPR))),pf=railT/T.dur;c.clearRect(0,0,w,h);
  for(var i=0;i<n;i++){var p=0;var a=Math.floor(i/n*N),b=Math.floor((i+1)/n*N);for(var j=a;j<b;j++)p=Math.max(p,T.peaks[j]);
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
  AN.getByteFrequencyData(FD);AN.getByteTimeDomainData(TD);
  post(now,AC.sampleRate)}
function post(now,sr){var s=0;for(var i=0;i<TD.length;i++){var v=(TD[i]-128)/128;s+=v*v}
  var bw=sr/512;function avg(a,b){var x=0,n=0;for(var k=Math.floor(a/bw);k<=Math.ceil(b/bw)&&k<FD.length;k++){x+=FD[k];n++}return x/n/255}
  L.rms=L.rms*.6+.4*Math.min(1,Math.sqrt(s/TD.length)*3.2);L.low=avg(35,160);L.mid=avg(300,2000);L.high=avg(3000,9000);
  L.avgLow=L.avgLow*.97+L.low*.03;if(L.low>L.avgLow*1.18&&L.low>.35&&now-L.lastBeat>280){L.lastBeat=now;L.beat=1;ripples.push({t0:now,a:.55+.45*L.low})}else L.beat*=.9}
var SM=new Float32Array(256),WIN=new Float32Array(512);for(var iw=0;iw<512;iw++)WIN[iw]=.42-.5*Math.cos(2*Math.PI*iw/511)+.08*Math.cos(4*Math.PI*iw/511);
function recFFT(){var o=Math.max(0,Math.floor(au.currentTime*PSR)-512),gv=FG.v;for(var i=0;i<512;i++)TD[i]=Math.max(0,Math.min(255,128+128*(PCM[o+i]||0)*gv));
  for(var k=0;k<120;k++){var re=0,im=0,w=2*Math.PI*k/512;for(var i=0;i<512;i++){var x=(PCM[o+i]||0)*WIN[i]*gv;re+=x*Math.cos(w*i);im-=x*Math.sin(w*i)}
    var mg=Math.sqrt(re*re+im*im)/512;SM[k]=.72*SM[k]+.28*mg;var db=20*Math.log10(SM[k]+1e-9);FD[k]=Math.max(0,Math.min(255,255*(db+100)/70))}}
/* ---------- the field ---------- */
function rnd(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
var BG=[];for(var ib=0;ib<260;ib++)BG.push([rnd(ib),rnd(ib+999),Math.pow(rnd(ib+77),3)]);
function glowC(rgb,sz){var c=document.createElement('canvas');c.width=c.height=sz;var x=c.getContext('2d'),gr=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);
  gr.addColorStop(0,'rgba('+rgb+',.95)');gr.addColorStop(.18,'rgba('+rgb+',.45)');gr.addColorStop(.5,'rgba('+rgb+',.10)');gr.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=gr;x.fillRect(0,0,sz,sz);return c}
var GR=glowC(SOUND.t,64),GW=glowC('190,225,255',64),GM=glowC('85,218,161',64);
/* ---------- v2 · 3D: depth, orbit camera, background volume ---------- */
var D2R=Math.PI/180,OLIM={yaw:30*D2R,pitch:25*D2R,roll:12*D2R},RUB=.25,IDLE_BACK=3;
/* depth of each constellation star (world units; the plane sits DZ=9 ahead): the ridge undulates, strand tops and their
   tips share a depth (the tips hang a little forward), the strays sit deeper. front view unchanged (stars ride their rays) */
var DZK=SOUND.s.map(function(s,k){return s[3]?2.4+rnd(k*5.1)*1.2:1.9*Math.sin(k*1.31+.6)+.7*Math.sin(k*2.7)});
SOUND.e.slice(0,5).forEach(function(e){DZK[e[1]]=DZK[e[0]]-.35});
var O={yaw:0,pitch:0,roll:0},LN={yaw:{x:0,v:0,t:0,w:10},pitch:{x:0,v:0,t:0,w:10},roll:{x:0,v:0,t:0,w:10}},OB={yaw:{x:0,v:0,t:0,w:8},pitch:{x:0,v:0,t:0,w:8},roll:{x:0,v:0,t:0,w:8}};
var OT={cy:1,sy:0,cp:1,sp:0,cr:1,sr:0,pvX:0,pvY:0,zc:9,on:false},HOMEF=null,IDLE=0,ODRAG=null,OSTAT={rubber:0,home:0,idleBack:0};
function sstep(s,dt){var w=s.w,e=s.x-s.t,k=Math.exp(-w*dt),c=s.v+w*e;s.x=s.t+(e+c*dt)*k;s.v=(s.v-w*c*dt)*k}
/* soft limit: inside +-lim 1:1, past it the input is resisted and tops out at lim*(1+RUB) */
function rubber(v,lim){var a=Math.abs(v);if(a<=lim)return v;var e=a-lim,m=lim*RUB;return(v<0?-1:1)*(lim+m*e/(e+m))}
function orbAngles(){return{yaw:O.yaw+LN.yaw.x,pitch:O.pitch+LN.pitch.x,roll:O.roll+LN.roll.x}}
function setOrbit(zc){var e=1-ease(dive),a=orbAngles(),y=a.yaw*e,p=a.pitch*e,r=a.roll*e;OT.cy=Math.cos(y);OT.sy=Math.sin(y);OT.cp=Math.cos(p);OT.sp=Math.sin(p);OT.cr=Math.cos(r);OT.sr=Math.sin(r);
  OT.zc=zc;OT.on=Math.abs(y)+Math.abs(p)+Math.abs(r)>1e-5;var sx=0,sy=0,n=SOUND.s.length;for(var k=0;k<n;k++){var c=cstar(k);sx+=c[0];sy+=c[1]}OT.pvX=sx/n;OT.pvY=sy/n}
function orb(X,Y,Z){if(!OT.on)return[X,Y,Z];var x=X-OT.pvX,y=Y-OT.pvY,z=Z-OT.zc,x1=x*OT.cy+z*OT.sy,z1=z*OT.cy-x*OT.sy,y1=y*OT.cp-z1*OT.sp,z2=z1*OT.cp+y*OT.sp;
  return[x1*OT.cr-y1*OT.sr+OT.pvX,x1*OT.sr+y1*OT.cr+OT.pvY,z2+OT.zc]}
/* a constellation star before the orbit: on its ray, dz deeper (dz fades out as you dive, so the tunnel unfolds as before) */
function pre3(k,zc,cz){var c=cstar(k),D=zc-cz,dz=DZK[k]*(1-ease(dive)),f=(D+dz)/D;return[c[0]*f,c[1]*f,zc+dz]}
function bob3(ch,zc,cz){var A=pre3(ch.a,zc,cz),B=pre3(ch.b,zc,cz),dx=B[0]-A[0],dy=B[1]-A[1],ct=Math.cos(ch.th),st=Math.sin(ch.th);
  return orb(A[0]+dx*ct+dy*st,A[1]-dx*st+dy*ct,B[2])}
/* background: 420 points in a shallow volume, 0.5x-3x the constellation's distance (close, never deep space), wrapped at the
   screen edges so zoom / pan never empties the sky. they share the camera: orbit + pan + zoom all show real parallax. */
var BG3=[];for(var ib=0;ib<420;ib++){var b0=Math.pow(rnd(ib*2.3+.7),2.4);BG3.push({u:rnd(ib*1.7)-.5,v:rnd(ib*3.9+1.1)-.5,dd:.5+2.5*Math.pow(rnd(ib*5.3+2.2),.8),b:.2+.8*b0,
  tw:rnd(ib*6.1+3.3)<.5?.16+.22*rnd(ib*7.7):0,w:6.2832/(2+4*rnd(ib*8.3+4.4)),ph:rnd(ib*9.1)*6.2832})}
var R3={drawn:0};
function bg3d(c,m,cx,cz,zc,bgA){var rm=RM.matches,n=0,X0=W/2-W*.7,PW=W*1.4,Y0=-H*.14,PH=H*1.2,D=Math.max(.5,zc-cz),drift=-(cx*12+camZ*.6);c.fillStyle='#e6ecfb';
  for(var i=0;i<BG3.length;i++){var s=BG3[i],d0=s.dd*DZ,q=orb(s.u*1.4*W*d0/F,s.v*1.2*H*d0/F,cz+d0*(D/DZ)+(DZ-D)*.0),dz=q[2]-cz;if(dz<.6)continue;
    var pr=Math.min(2.2,DZ/dz),sd=1+(VW.s-1)*pr,k=F/dz,x=W/2+q[0]*k*sd+VW.x*pr+drift*pr*.5,y=H*.46+q[1]*k*sd+VW.y*pr;
    x=((x-X0)%PW+PW)%PW+X0;y=((y-Y0)%PH+PH)%PH+Y0;if(x<-4||x>W+4||y<-4||y>H+4)continue;
    var a=bgA*s.b*(.4+.6*Math.min(1,pr));if(s.tw&&!rm)a*=1-s.tw*(.5+.5*Math.sin(tw*s.w+s.ph));var r=(.55+.9*s.b)*Math.min(2.6,Math.pow(pr,.8))*Math.min(1.8,Math.sqrt(sd));
    c.globalAlpha=Math.min(1,a);c.fillRect(x-r/2,y-r/2,r,r);n++;if(pr>1.15&&s.b>.7){var gs=r*7;c.globalAlpha=a*.3;c.drawImage(GW,x-gs/2,y-gs/2,gs,gs)}}
  c.globalAlpha=1;R3.drawn=n}
/* orbit dynamics, every frame: lean from the swipe speed (critically damped back to 0), rubber band back to the limits once
   released, idle return of the perspective to the front after 3 s, the home flight */
function orbitStep(dt){var rm=RM.matches,held=!!(nPT()||PZ||p0);
  var vx=PS.x,vy=PS.y;LN.yaw.t=rm||mode!=='sky'?0:Math.max(-.08,Math.min(.08,vx*.00011));LN.pitch.t=rm||mode!=='sky'?0:Math.max(-.06,Math.min(.06,-vy*.00008));LN.roll.t=rm||mode!=='sky'?0:Math.max(-.035,Math.min(.035,-vx*.00003));
  sstep(LN.yaw,dt);sstep(LN.pitch,dt);sstep(LN.roll,dt);
  if(HOMEF){var h=HOMEF;h.t+=dt;var e=ease(Math.min(1,h.t/h.d));O.yaw=h.o.yaw*(1-e);O.pitch=h.o.pitch*(1-e);O.roll=h.o.roll*(1-e);V.z=h.v.z+(1-h.v.z)*e;V.x=h.v.x*(1-e);V.y=h.v.y*(1-e);
    if(h.t>=h.d){HOMEF=null;V.z=1;V.x=V.y=0;O.yaw=O.pitch=O.roll=0;zHi=1;RC=0}return}
  if(held||mode!=='sky'){IDLE=0;return}IDLE+=dt;
  ['yaw','pitch','roll'].forEach(function(a){var L=OLIM[a];if(Math.abs(O[a])>L+1e-4){var t=O[a]>0?L:-L;O[a]=t+(O[a]-t)*Math.exp(-dt*9);OSTAT.rubber++}});
  if(IDLE>IDLE_BACK&&(Math.abs(O.yaw)+Math.abs(O.pitch)+Math.abs(O.roll))>1e-4){var k=1-Math.exp(-dt*(rm?6:1.4));O.yaw-=O.yaw*k;O.pitch-=O.pitch*k;O.roll-=O.roll*k;OSTAT.idleBack++;
    if(Math.abs(O.yaw)+Math.abs(O.pitch)+Math.abs(O.roll)<2e-4)O.yaw=O.pitch=O.roll=0}}
function flyHome(){if(mode!=='sky')return;CO=null;HOMEF={t:0,d:RM.matches?.01:.9,o:{yaw:O.yaw,pitch:O.pitch,roll:O.roll},v:{z:V.z,x:V.x,y:V.y}};OSTAT.home++;poke()}
function orbited(){return Math.abs(O.yaw)+Math.abs(O.pitch)+Math.abs(O.roll)>.01||V.z>1.01||Math.abs(V.x)+Math.abs(V.y)>2}
/* faint chevrons at the screen edge toward song stars that are off screen */
function edgeCues(c,sp,sa){var n=0,m=10,top=56,cx0=W/2,cy0=H*.5;for(var k in STAR2K){var p=sp[+k];if(!p)continue;if(p[0]>=0&&p[0]<=W&&p[1]>=top&&p[1]<=H)continue;
    var dx=p[0]-cx0,dy=p[1]-cy0,tx=dx>0?(W-m-cx0)/dx:(m-cx0)/dx,ty=dy>0?(H-m-cy0)/dy:(top+m-cy0)/dy,t=Math.min(Math.abs(tx),Math.abs(ty)),x=cx0+dx*t,y=cy0+dy*t,an=Math.atan2(dy,dx),sel=+k===highlight;
    c.save();c.translate(x,y);c.rotate(an);c.globalAlpha=sa*(sel?.75:.45);c.strokeStyle=sel?'rgba(85,218,161,1)':'rgba(255,214,208,1)';c.lineWidth=1.4;c.beginPath();c.moveTo(-6,-6);c.lineTo(0,0);c.lineTo(-6,6);c.stroke();
    c.globalAlpha=sa*(sel?.5:.25);c.drawImage(sel?GM:GR,-9,-9,18,18);c.restore();n++}DBG.cues=n}
/* camera path: a slow meander, so the drift reads as travel and not a straight pipe */
function px(z){return Math.sin(z*.021)*1.3+Math.sin(z*.0063)*2.2}
function py(z){return Math.cos(z*.017)*.9}
var camZ=0,tz=0,dive=0,diveT=0,mode='sky',ripples=[],prev=null,tw=0;
/* constellation stars as 3D points on a plane DZ ahead, laid out so they project where the sky view draws them */
var DZ=9;
/* the 1x layout, relative to the vanishing point. FIT (set in rs) scales/shifts it into the safe band: below the header
   (+ label room) and above the intro/song list. it is a 1x framing only; the user's zoom/pan sit on top in proj() */
var FIT={s:1,dy:0};
function lay(k){var s=SOUND.s[k],sc=Math.min(W*.86,520);return[(s[0]-.5)*sc*FIT.s,((s[1]-.5)*sc*.5-H*.07)*FIT.s+FIT.dy]}
function cstar(k){var q=lay(k);return[q[0]/F*DZ,q[1]/F*DZ]}
/* every tunnel particle remembers one constellation star it unfolds from */
var SRC=[];for(var isr=0;isr<FAR*K+K;isr++)SRC.push(Math.floor(rnd(isr*3.3)*18));
function ease(x){x=Math.max(0,Math.min(1,x));return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function proj(x,y,z,cz,cx,cy){var d=z-cz;if(d<.05)return null;var k=F/d;return[W/2+(x-cx)*k*VW.s+VW.x,H*.46+(y-cy)*k*VW.s+VW.y,k,d]}
/* ---------- sky zoom + pan (ported from the sweep's zoom/pan) ----------
   The constellation is one plane at DZ, so the sweep's camera dolly toward it is exactly a uniform scale about the
   vanishing point (W/2, H*.46) plus a translate: V.z = zoom, V.x/V.y = pan in screen px. Applied in proj(), so stars,
   strands and (during a dive) the unfolding tunnel all agree. The strand physics stays in unzoomed sky px.
   Zoom STAYS exactly where a gesture leaves it: no levels, no velocity, no snap, no spring-back, ever.
   Diving eases the view to 1x; rising brings the kept zoom/pan back. */
var ZMIN=1,ZMAX=4;
var V={z:1,x:0,y:0},VW={s:1,x:0,y:0};
function setView(){var e=ease(dive);VW.s=1+(V.z-1)*(1-e);VW.x=V.x*(1-e);VW.y=V.y*(1-e)}
function toBase(x,y){return[W/2+(x-W/2-VW.x)/VW.s,H*.46+(y-H*.46-VW.y)/VW.s]}
function skyBox(){var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(var k=0;k<SOUND.s.length;k++){var q=skyXY(k);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}return[x0,x1,y0,y1]}
/* keep the centre of the screen over the constellation (+30 px) so a pan can't lose it */
function songBox(){var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,yt=-1e9;for(var k in STAR2K){var q=skyXY(+k);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
  for(var i=0;i<CH.length;i++)yt=Math.max(yt,skyXY(CH[i].b)[1]);return[x0,x1,y0,y1+Math.max(0,yt-y1)*.6]}
function clampPan(){var b=songBox(),m=30+90/V.z/V.z,ox=W/2,oy=H*.46,z=V.z;
  V.x=Math.max((ox-b[1]-m)*z,Math.min((ox-b[0]+m)*z,V.x));V.y=Math.max((oy-b[3]-m)*z,Math.min((oy-b[2]+m)*z,V.y))}
/* zoom to z keeping the sky point under screen (mx,my) fixed */
function zoomAt(z,mx,my){z=Math.max(ZMIN,Math.min(ZMAX,z));var bx=W/2+(mx-W/2-V.x)/V.z,by=H*.46+(my-H*.46-V.y)/V.z;
  V.z=z;V.x=mx-W/2-(bx-W/2)*z;V.y=my-H*.46-(by-H*.46)*z;clampPan()}
var last=performance.now(),LOG=[];
function frame(now){requestAnimationFrame(frame);var dt=Math.min(.05,(now-last)/1000);last=now;tick(now,dt)}
var VT=0,pauseAt=-1;function step(dt){VT+=dt;if(!au.paused&&au.currentTime!=null){au.currentTime+=dt;if(au.currentTime>=T.dur)au.currentTime=0}tick(VT*1000,dt)}
function tick(now,dt){if(REC&&pauseAt>0&&VT>=pauseAt){pauseAt=-1;if(mode!=='in'&&mode!=='diving')au.pause()}tw+=dt;listen(now);
  /* dive state machine */
  if(mode==='diving'){dive=Math.min(1,dive+dt/2.4);if(dive>=1){mode='in';sk.dataset.mode='in'}}
  else if(mode==='rising'){dive=Math.max(0,dive-dt/2.0);if(dive<=0){mode='sky';sk.dataset.mode='sky'}}
  if(!dragging&&!au.paused)tz=ringAt(au.currentTime);
  var gap=tz-camZ;if(dragging||Math.abs(gap)>2.5)camZ+=gap*Math.min(1,dt*(dragging?5:3));else camZ+=gap*Math.min(1,dt*8);
  var ct=Math.max(0,Math.min(T.dur,camZ/(N*SP)*T.dur));if(!dragging)railT=au.paused?ct:au.currentTime;
  if(REC)LOG.push([VT,au.currentTime,au.paused?0:1,dragging?1:0,FG.v]);
  pulseStar=Math.max(0,pulseStar-dt*.8);coastStep(dt);panCouple(dt);orbitStep(dt);recentStep(dt);sweepStep(dt);chStep(dt);draw(now,dt);introStep(dt);ui()}
function draw(now,dt){var c=g;c.setTransform(DPR,0,0,DPR,0,0);setView();DBG={stars:0,songPos:[],labels:[],cues:0};
  var m=ease(dive),cx=px(camZ)*m,cy=py(camZ)*m,cz=camZ;
  /* sky: navy radial + background star dust (parallax: drifts with the camera path inside) */
  c.fillStyle='#03050a';c.fillRect(0,0,W,H);var gr=c.createRadialGradient(W/2,H*.42,0,W/2,H*.42,Math.max(W,H)*.75);
  gr.addColorStop(0,'rgba(22,34,58,'+(.85-.45*m).toFixed(3)+')');gr.addColorStop(.6,'rgba(10,17,32,.6)');gr.addColorStop(1,'rgba(3,5,10,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
  setOrbit(cz+DZ*(1-ease(dive)));bg3d(c,m,cx,cz,cz+DZ*(1-ease(dive)),1-.55*m);
  /* water ripples on beats (the site's water, faint, centred on the vanishing point) */
  for(var i=ripples.length-1;i>=0;i--){var R=ripples[i],a=(now-R.t0)/1800;if(a>1){ripples.splice(i,1);continue}
    c.strokeStyle='rgba(190,220,245,'+(.32*R.a*(1-a)*m).toFixed(3)+')';c.lineWidth=1;c.beginPath();c.ellipse(W/2,H*.46,20+a*W*.7,(20+a*W*.7)*.62,0,0,7);c.stroke()}
  var live=1+L.rms*.55,glowK=.55+.9*L.beat;
  /* ---- the tunnel (only once the dive starts) ---- */
  var cur=[];
  if(m>0.002){var z0=Math.floor(cz/SP)+1,unf=ease((dive-.12)/.88),pts=new Array(FAR);
    for(var r=FAR-1;r>=0;r--){var ri=z0+r;if(ri>=N)continue;var z=ri*SP,e=env(ri),d=z-cz,near=Math.exp(-d/16),ring=[];
      var R0=(.75+3.0*Math.pow(e,1.6))*live,tw2=z*.045+tw*.08,lowB=band(ri,0),hiB=band(ri,2),isSec=false;
      for(var q=0;q<SECS.length;q++)if(Math.abs(ringAt(SECS[q].t)-ri)<.5)isSec=true;
      for(var k=0;k<K;k++){var an=k/K*6.2832+tw2,fk=FD?FD[2+Math.floor((k<K/2?k:K-k)/(K/2)*60)]/255:0;
        var rr=R0*(1+.42*fk*near*m+.12*Math.sin(an*3+z*.5-tw*2.2)*L.mid+.06*hiB*Math.sin(an*7+tw));
        var X=px(z)+Math.cos(an)*rr*1.0,Y=py(z)+Math.sin(an)*rr*.82,Z=z;
        if(unf<1){var sid=SRC[(r*K+k)%SRC.length],cs=cstar(sid),jx=(rnd(r*K+k)-.5)*.25,jy=(rnd(r*K+k+5)-.5)*.25,
          sz=cz+DZ*(1-ease(dive))+.4+r*.02*(1-dive);var o3=orb(cs[0]+jx,cs[1]+jy,sz);X=X*unf+o3[0]*(1-unf);Y=Y*unf+o3[1]*(1-unf);Z=Z*unf+o3[2]*(1-unf)}
        ring.push(proj(X,Y,Z,cz,cx,cy))}
      pts[r]={p:ring,d:d,e:e,sec:isSec,low:lowB}}
    /* star-lines: longitudinal threads along the waveform + a hairline round each 6th ring and each section ring */
    c.lineWidth=1;c.lineCap='round';
    for(var r=FAR-2;r>=0;r--){var A=pts[r],B=pts[r+1];if(!A||!B)continue;var fade=Math.min(1,(1-A.d/(FAR*SP))*1.6)*Math.min(1,A.d/1.2)*m,al=(.07+.20*A.e)*fade*glowK*unf*unf;
      c.strokeStyle='rgba('+SOUND.t+','+al.toFixed(3)+')';c.beginPath();
      for(var k=0;k<K;k+=2){var a=A.p[k],b=B.p[k];if(a&&b){c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1])}}c.stroke();
      if((A.sec||(z0+r)%6===0)&&unf>.6){fade*=(unf-.6)/.4;c.strokeStyle=A.sec?'rgba(85,218,161,'+(.55*fade).toFixed(3)+')':'rgba(190,220,245,'+(.16*fade*glowK).toFixed(3)+')';c.beginPath();
        for(var k=0;k<=K;k++){var a=A.p[k%K];if(!a)continue;k?c.lineTo(a[0],a[1]):c.moveTo(a[0],a[1])}c.stroke()}}
    /* stars: dots on every ring point; brighter where the waveform is loud, the current-moment ring glows */
    for(var r=FAR-1;r>=0;r--){var A=pts[r];if(!A)continue;var fade=Math.min(1,(1-A.d/(FAR*SP))*1.6)*Math.min(1,A.d/.9)*(.25+.75*m);
      for(var k=0;k<K;k++){var p=A.p[k];if(!p||p[0]<-40||p[0]>W+40||p[1]<-40||p[1]>H+40)continue;var h=rnd((z0+r)*31+k),br=(.25+.75*A.e)*(.55+.45*h);
        var sz=Math.max(.9,Math.min(5,p[2]*.016*(.6+br)));c.globalAlpha=Math.min(1,fade*(.4+.6*br));
        if(h>.8||A.sec){var gs=sz*(7+12*L.beat*A.e+6*A.low)*glowK;c.globalCompositeOperation='lighter';c.drawImage(A.sec?GM:(h>.95?GW:GR),p[0]-gs/2,p[1]-gs/2,gs,gs);c.globalCompositeOperation='source-over'}
        c.fillStyle=h>.93?'#fff':'rgb(255,'+(232+Math.round(20*h))+','+(228+Math.round(25*h))+')';c.fillRect(p[0]-sz/2,p[1]-sz/2,sz,sz);
        /* streaks while the dive unfolds or the rail flies the camera */
        if(prev&&prev[r*K+k]){var o=prev[r*K+k],dx=p[0]-o[0],dy=p[1]-o[1];if(dx*dx+dy*dy>9&&dx*dx+dy*dy<90000){c.globalAlpha*=.5;c.strokeStyle='#fff';c.lineWidth=sz*.6;c.beginPath();c.moveTo(p[0]-dx*.7,p[1]-dy*.7);c.lineTo(p[0],p[1]);c.stroke();c.lineWidth=1}}}}
    c.globalAlpha=1;
    /* the vanishing point: a soft rose light at the end of the sound, breathing with the beat */
    var vp=proj(px(cz+FAR*SP*.8),py(cz+FAR*SP*.8),cz+FAR*SP*.8,cz,cx,cy);if(vp){var vr=Math.min(W,H)*(.22+.18*L.beat+.2*L.rms)*m;var vg=c.createRadialGradient(vp[0],vp[1],0,vp[0],vp[1],vr);
      vg.addColorStop(0,'rgba('+SOUND.t+','+(.22*m*(.5+L.rms)).toFixed(3)+')');vg.addColorStop(1,'rgba('+SOUND.t+',0)');c.globalCompositeOperation='lighter';c.fillStyle=vg;c.fillRect(vp[0]-vr,vp[1]-vr,2*vr,2*vr);c.globalCompositeOperation='source-over'}
    /* the live wave: the analyser's time-domain trace wrapped into a ring just ahead of you (the oscilloscope as a constellation) */
    if(TD&&!au.paused&&unf>.5){var zr=cz+11,cxr=px(zr),cyr=py(zr),Rr=(.9+2.2*env(zr/SP))*live,n=96;c.lineWidth=1.2;
      for(var pass=0;pass<2;pass++){c.strokeStyle=pass?'rgba(255,240,236,'+(.55*unf).toFixed(3)+')':'rgba('+SOUND.t+','+(.18*unf*glowK).toFixed(3)+')';c.lineWidth=pass?1:5;c.beginPath();
        for(var k=0;k<=n;k++){var kk=k%n,ti=Math.floor((kk<n/2?kk:n-kk)/(n/2)*(TD.length-1)),v=(TD[ti]-128)/128,an=kk/n*6.2832-tw*.3,rr=Rr*(1+v*.9);
          var q=proj(cxr+Math.cos(an)*rr,cyr+Math.sin(an)*rr*.82,zr,cz,cx,cy);if(q)k?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])}c.stroke()}c.lineWidth=1}
    var nx=[];for(var r=0;r<FAR;r++){var A=pts[r];for(var k=0;k<K;k++)nx[r*K+k]=A&&A.p[k]?[A.p[k][0],A.p[k][1]]:null}
    prev=(Math.abs(camZ-tz)>2||(dive>0&&dive<1))?nx:null}
  /* ---- the constellation itself (fades as its stars unfold into the tunnel) ---- */
  var sa=1-ease(dive*1.7);
  CHP=[];
  if(sa>.01){var sp=[],zc=cz+DZ*(1-ease(dive)),k0=F/(zc-cz);
    for(var k=0;k<SOUND.s.length;k++){var w3=pre3(k,zc,cz);w3=orb(w3[0],w3[1],w3[2]);sp.push(proj(w3[0],w3[1],w3[2],cz,0,0))}
    var hz=1;
    for(var i=0;i<CH.length;i++){var ch=CH[i];if(!ch.L)continue;var wb=bob3(ch,zc,cz),qb=proj(wb[0],wb[1],wb[2],cz,0,0),qa=sp[ch.a];if(qb)sp[ch.b]=qb;if(qa&&qb)CHP[i]={ax:qa[0],ay:qa[1],bx:qb[0],by:qb[1]}}
    skyProj=sp;
    var nr=Math.min(W,520)*.55*hz*VW.s*FIT.s,gx=W/2+VW.x,gy=H*.46+((-H*.07)*FIT.s+FIT.dy)*hz*VW.s+VW.y;var gg=c.createRadialGradient(gx,gy,0,gx,gy,nr);
    gg.addColorStop(0,'rgba('+SOUND.t+','+(.09*sa).toFixed(3)+')');gg.addColorStop(1,'rgba('+SOUND.t+',0)');c.fillStyle=gg;c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(255,214,208,'+(.5*sa*sa).toFixed(3)+')';c.lineWidth=1;c.beginPath();
    SOUND.e.forEach(function(ed){var ea=sp[ed[0]],eb=sp[ed[1]];if(ea&&eb){c.moveTo(ea[0],ea[1]);c.lineTo(eb[0],eb[1])}});c.stroke();
    for(var k=0;k<SOUND.s.length;k++){var p=sp[k];if(!p)continue;var s=SOUND.s[k],b=s[2]*(.85+.15*Math.sin(tw*1.7+k*1.3)),SF=1.35*hz*Math.sqrt(VW.s)*Math.max(.55,Math.min(2,Math.pow(p[2]/k0,.9)));
      var isSong=STAR2K[k]!=null,sel=k===highlight,gs=(6+30*b*b)*SF*(isSong?1.15:1)*(sel?1.35+.25*pulseStar:1);
      for(var i=0;i<CH.length;i++)if(CH[i].b===k)gs*=1+.7*CH[i].fl;c.globalAlpha=sa*(.35+.65*b)*(s[3]?.8:1);c.drawImage(sel?GM:GR,p[0]-gs/2,p[1]-gs/2,gs,gs);
      if(sel){c.globalCompositeOperation='lighter';c.drawImage(GM,p[0]-gs*.7,p[1]-gs*.7,gs*1.4,gs*1.4);c.globalCompositeOperation='source-over'}
      var rad=(.5+1.9*b)*SF*.85*(isSong?1.1:1);c.globalAlpha=sa*(.45+.55*b);c.fillStyle='#fff';c.beginPath();c.arc(p[0],p[1],rad,0,7);c.fill();
      DBG.stars++;if(isSong)DBG.songPos.push({k:STAR2K[k],x:+p[0].toFixed(1),y:+p[1].toFixed(1),r:+rad.toFixed(2),sel:sel})}
    c.globalAlpha=1;drawLabels(c,sp,sa);if(mode==='sky')edgeCues(c,sp,sa)}
  else skyProj=[];
  /* a flash of white as you pass through the plane of the stars */
  if(fing&&fing.a>.01){c.globalAlpha=fing.a;c.drawImage(GW,fing.x-16,fing.y-16,32,32);c.globalAlpha=1;if(!fing.on)fing.a*=.8}
  var fl=Math.max(0,1-Math.abs(dive-.42)/.14);if(fl>0&&(mode==='diving'||mode==='rising')){c.fillStyle='rgba(220,235,255,'+(.10*fl).toFixed(3)+')';c.fillRect(0,0,W,H)}
}
/* ---------- song labels (from sketch-next): collision-aware, a song label is NEVER dropped ----------
   candidates around the star (above first: the strands hang below), clamped to the safe band; penalties for covering a
   placed label, another song star, a strand, the SOUND heading, or drifting from its star. a song star that is off screen
   (zoomed/panned away) keeps its label pinned at the band edge with an arrow toward it, so all six are always readable. */
var skyProj=[],CHP=[],DBG={stars:0,songPos:[],labels:[],cues:0};
function rHit(a,b){return !(a[0]+a[2]<=b[0]||b[0]+b[2]<=a[0]||a[1]+a[3]<=b[1]||b[1]+b[3]<=a[1])}
function segRect(x0,y0,x1,y1,r){for(var s=0;s<=10;s++){var f=s/10,x=x0+(x1-x0)*f,y=y0+(y1-y0)*f;if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return true}return false}
function drawLabels(c,sp,sa){var sb=safeBand(),zs=VW.s,fsT=9.5*Math.min(1.25,.9+zs*.1),fsA=8*Math.min(1.2,.9+zs*.08),labs=[],placed=[],segs=[],hd=UR?UR.head:null;
  for(var i=0;i<SOUND.e.length;i++){var ed=SOUND.e[i],pa=sp[ed[0]],pb=sp[ed[1]];if(pa&&pb)segs.push([pa[0],pa[1],pb[0],pb[1],i<CH.length?60:40])}
  for(var k in STAR2K){var ki=+k,p=sp[ki];if(!p)continue;var tr=TRACKS[STAR2K[ki]];
    labs.push({ki:ki,p:p,tr:tr,pri:(ki===highlight?100:0)+(tr.artist==='Mothers Moniker'?8:0)+SOUND.s[ki][2]*10})}
  labs.sort(function(a,b){return b.pri-a.pri});c.textBaseline='middle';
  for(var li=0;li<labs.length;li++){var Lb=labs[li],p=Lb.p,tr=Lb.tr,sel=Lb.ki===highlight,
      offX=p[0]<sb.left?-1:p[0]>sb.right?1:0,offY=p[1]<sb.top?-1:p[1]>sb.bot?1:0,off=!!(offX||offY),
      ttl=off?(offX<0?'‹ ':offY<0?'↑ ':offY>0&&!offX?'↓ ':'')+tr.title+(offX>0?' ›':''):tr.title;
    c.font='300 '+fsT.toFixed(2)+'px Poppins,system-ui,sans-serif';var tW=c.measureText(ttl).width;
    c.font='300 '+fsA.toFixed(2)+'px Poppins,system-ui,sans-serif';var aW=c.measureText(tr.artist).width;
    var best=null,bp=1e9,lh=22,ox=9+3*Math.min(1.5,zs),lw,cand;
    /* two sizes: full, and 90% when that is the only way to keep lines off the text (tight 1x clusters, e.g. ii) */
    for(var si=0;si<2;si++){var scl=si?.9:1;lw=Math.max(tW,aW)*scl+6;cand=[];
    if(!off)cand=[[p[0]-lw/2,p[1]-31,0],[p[0]+ox,p[1]-25,1],[p[0]-ox-lw,p[1]-25,-1],[p[0]+ox,p[1]-8,1],[p[0]-ox-lw,p[1]-8,-1],
      [p[0]-lw/2,p[1]-49,0],[p[0]+ox,p[1]+9,1],[p[0]-ox-lw,p[1]+9,-1],[p[0]+ox+12,p[1]-42,1],[p[0]-ox-lw-12,p[1]-42,-1],[p[0]-lw/2,p[1]+14,0],[p[0]-lw*.25,p[1]-56,0],[p[0]-lw*.75,p[1]-56,0],[p[0]-lw/2,p[1]-72,0],[p[0]+ox,p[1]+30,1],[p[0]-ox-lw,p[1]+30,-1],[p[0]-lw/2-9,p[1]+14,0],[p[0]-lw/2+9,p[1]+14,0],[p[0]-lw/2-9,p[1]-31,0],[p[0]-lw/2+9,p[1]-31,0],[p[0]-lw/2-16,p[1]+14,0],[p[0]-lw/2+16,p[1]+14,0],[p[0]-lw/2-3,p[1]+14,0],[p[0]-lw/2+3,p[1]+14,0],[p[0]-lw/2-6,p[1]+14,0],[p[0]-lw/2+6,p[1]+14,0],[p[0]-lw/2-12,p[1]+14,0],[p[0]-lw/2+12,p[1]+14,0]];
    else{var cx0=offX<0?sb.left:offX>0?sb.right-lw:Math.max(sb.left,Math.min(sb.right-lw,p[0]-lw/2)),
        cy0=offX?Math.max(sb.top,Math.min(sb.bot-lh,p[1]-lh/2)):offY<0?sb.top:sb.bot-lh,al=offX<0?1:offX>0?-1:0;
      if(offX)for(var j=0;j<31;j++){var o=((j+1)>>1)*(j%2?1:-1);cand.push([cx0,cy0+o*25,al])}
      else for(var row=0;row<3;row++)for(var j2=0;j2<15;j2++){var o2=((j2+1)>>1)*(j2%2?1:-1);cand.push([cx0+o2*(lw*.55+4),cy0-offY*row*25,0])}}
    for(var ci=0;ci<cand.length;ci++){var tx=Math.max(sb.left,Math.min(sb.right-lw,cand[ci][0])),ty=Math.max(sb.top,Math.min(sb.bot-lh,cand[ci][1])),
        rr=[tx,ty,lw,lh],tr0=[tx+3,ty+1,lw-6,lh-2],pen=(off?ci*.6:ci*2)+si*8,hit=0;
      for(var pj=0;pj<placed.length;pj++)if(rHit(rr,[placed[pj][0]-3,placed[pj][1]-3,placed[pj][2]+6,placed[pj][3]+6])){hit++;pen+=140}
      for(var oj=0;oj<labs.length;oj++){var q=labs[oj].p;if(labs[oj]!==Lb&&q[0]>tx-7&&q[0]<tx+lw+7&&q[1]>ty-7&&q[1]<ty+lh+7)pen+=35}
      var sh=0;for(var sj=0;sj<segs.length;sj++){var sg=segs[sj];if(segRect(sg[0],sg[1],sg[2],sg[3],tr0)){pen+=sg[4];sh++}}
      if(hd&&rHit(rr,[hd[0]-4,hd[1]-4,hd[2]-hd[0]+8,hd[3]-hd[1]+8]))pen+=60;
      if(!off){var dd=Math.hypot(tx+lw/2-p[0],ty+lh/2-p[1]);pen+=Math.max(0,dd-34)*.6;if(p[0]>tx-6&&p[0]<tx+lw+6&&p[1]>ty-5&&p[1]<ty+lh+5)pen+=90}
      if(pen<bp){bp=pen;best={x:tx,y:ty,al:cand[ci][2],hit:hit,seg:sh,lw:lw,sc:scl}}}}
    lw=best.lw;
    var labA=sa*(sel?.95:off?.5:.66),shrink=best.sc;
    if(!sel&&best.hit>=1){labA*=Math.max(.6,1-.18*best.hit);shrink*=.88} /* last resort only: fade + shrink, never drop */
    placed.push([best.x,best.y,lw,lh]);
    DBG.labels.push({k:STAR2K[Lb.ki],x:+best.x.toFixed(1),y:+best.y.toFixed(1),w:+lw.toFixed(1),h:lh,a:+labA.toFixed(3),off:off,offX:offX,offY:offY,hit:best.hit,seg:best.seg,sx:+p[0].toFixed(1),sy:+p[1].toFixed(1)});
    /* leader tick: a faint hairline from the star toward its label when the label sits more than ~14 px away (1x clusters) */
    if(!off){var nx=Math.max(best.x,Math.min(best.x+lw,p[0])),ny=Math.max(best.y,Math.min(best.y+lh,p[1])),ld=Math.hypot(nx-p[0],ny-p[1]);
      if(ld>14){var ux=(nx-p[0])/ld,uy=(ny-p[1])/ld;c.globalAlpha=labA*.38;c.strokeStyle='rgba(220,232,240,.9)';c.lineWidth=.7;c.beginPath();c.moveTo(p[0]+ux*6,p[1]+uy*6);c.lineTo(nx-ux*3,ny-uy*3);c.stroke();c.lineWidth=1}}
    c.textAlign=best.al>0?'left':best.al<0?'right':'center';var ax=best.al>0?best.x+3:best.al<0?best.x+lw-3:best.x+lw/2;
    c.globalAlpha=labA;c.font='300 '+(fsT*shrink).toFixed(2)+'px Poppins,system-ui,sans-serif';c.fillStyle=sel?'rgba(170,240,210,.98)':'rgba(220,232,240,.95)';c.fillText(ttl,ax,best.y+6);
    c.font='300 '+(fsA*shrink).toFixed(2)+'px Poppins,system-ui,sans-serif';c.fillStyle='rgba(201,211,214,.72)';c.fillText(tr.artist,ax,best.y+17)}
  c.globalAlpha=1;c.textAlign='left';c.textBaseline='alphabetic'}
/* nearest song star within r screen px of (x,y), or -1 */
function starHit(x,y,r){var best=-1,bd=r||28;for(var k in STAR2K){var p=skyProj[+k];if(!p)continue;var d=Math.hypot(x-p[0],y-p[1]);if(d<bd){bd=d;best=+k}}return best}
/* ---------- the long sweep (from sketch-next), made to obey the zoom rules ----------
   only in the sky, only while zoomed in (>1.05x: at 1x the framed view stays put), never with reduced motion.
   starts after 2.5 s with no touch/wheel/key, ramps in over 1.5 s, and only drifts the PAN toward a slow Lissajous path
   over the constellation at <= 18 px/s x the tempo of the song star nearest the centre. it never writes V.z, it starts from
   wherever the user left the view (no jump, no spring-back), and any touch/wheel/key freezes it on the spot. */
var SW={on:true,idle:0,w:0,t:0,moved:0};
/* zooming back out to exactly 1x (pinch / wheel / - key) eases the pan back to the centred 1x framing once the fingers are
   off. a held zoom above 1x is never touched, and a one-finger pan made AT 1x is kept (any new pointerdown or key cancels) */
var zHi=1,RC=0;
function recentStep(dt){if(V.z>ZMIN){RC=0;zHi=Math.max(zHi,V.z);return}if(zHi>ZMIN+.02&&mode==='sky')RC=1;zHi=ZMIN;
  if(!RC||PZ||nPT()||p0||mode!=='sky')return;var k=Math.min(1,dt*(RM.matches?14:5));V.x-=V.x*k;V.y-=V.y*k;
  if(Math.abs(V.x)<.3&&Math.abs(V.y)<.3){V.x=0;V.y=0;RC=0}}
function poke(){SW.idle=0;SW.w=0}
function nearTempo(){var best=1,bd=1e9;for(var k in STAR2K){var p=skyProj[+k];if(!p)continue;var d=Math.hypot(p[0]-W/2,p[1]-H*.46);if(d<bd){bd=d;best=TRACKS[STAR2K[k]].tempo||1}}return best}
function sweepStep(dt){var held=!!(p0||PZ||nPT()||CO||HOMEF);if(held)poke();
  if(!SW.on||held||mode!=='sky'||dive>.001||V.z<=1.05||RM.matches){SW.w=0;return}
  SW.idle+=dt;if(SW.idle<2.5)return;SW.w=Math.min(1,SW.w+dt/1.5);
  var tp=nearTempo(),b=skyBox(),bw=b[1]-b[0],bh=b[3]-b[2];SW.t+=dt*SW.w*tp;
  var bx=(b[0]+b[1])/2+bw*.36*Math.sin(SW.t*.11)+bw*.08*Math.sin(SW.t*.037),by=(b[2]+b[3])/2+bh*.3*Math.sin(SW.t*.083+1.1),
    dx=-(bx-W/2)*V.z-V.x,dy=-(by-H*.46)*V.z-V.y,d=Math.hypot(dx,dy),mx=18*tp*SW.w*dt;
  if(d>1e-3){var f=Math.min(1,mx/d),x0=V.x,y0=V.y;V.x+=dx*f;V.y+=dy*f;clampPan();SW.moved+=Math.hypot(V.x-x0,V.y-y0)}}
/* ---------- wind chimes: the five strands that hang from the constellation's line (edges 2-3, 5-6, 7-8, 10-11, 13-14) ----------
   sky only. swipe across the sky = a breeze (swipe speed + direction, capped low) that sways the strands on pendulum physics;
   neighbours that swing into each other's reach knock and ring. tap a strand (44 px+ target) = just that strand plays its note.
   pitch by position, left to right on C major pentatonic; each strand has its own slightly different timbre. Web Audio only. */
var RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var PENT=[523.25,587.33,659.25,783.99,880.00],CHR=[1,2.76,5.40],CHD=[2.6,1.1,.42];
var TB=[[1,.20,.06],[1,.14,.09],[1,.24,.05],[1,.12,.08],[1,.18,.10]],CDT=[0,.0015,-.001,.002,-.0015];
var CH=SOUND.e.slice(0,5).map(function(e,i){return{a:e[0],b:e[1],th:0,w:0,fl:0,f:PENT[i],v:i,lc:-1}}),CHL=[],chT=0;
function skyXY(k){var q=lay(k);return[W/2+q[0],H*.46+q[1]]}
function chGeo(){for(var i=0;i<CH.length;i++){var c=CH[i],p=skyXY(c.a),r=skyXY(c.b);c.px=p[0];c.py=p[1];c.rx=r[0];c.ry=r[1];c.L=Math.max(20,Math.hypot(r[0]-p[0],r[1]-p[1]));c.a0=Math.atan2(r[0]-p[0],r[1]-p[1])}}
function bob(c){return[c.px+c.L*Math.sin(c.a0+c.th),c.py+c.L*Math.cos(c.a0+c.th)]}
function chStep(dt){chGeo();var rm=RM.matches,damp=rm?1.5:.7,vmax=rm?34:68,h=1/120,n=Math.min(8,Math.ceil(dt/h));h=dt/Math.max(1,n);
  for(var s=0;s<n;s++){chT+=h;
    for(var i=0;i<CH.length;i++){var c=CH[i];c.w+=(-(900/c.L)*Math.sin(c.th)-damp*c.w-PA.x*PAK*Math.cos(c.th)/c.L)*h;var v=c.w*c.L;if(Math.abs(v)>vmax)c.w=(v>0?vmax:-vmax)/c.L;c.th+=c.w*h}
    for(var i=0;i<CH.length-1;i++){var A=CH[i],B=CH[i+1],xa=bob(A)[0],xb=bob(B)[0],g0=B.rx-A.rx,ct=g0-9;
      if(xb-xa<ct){var va=A.w*A.L,vb=B.w*B.L,rel=va-vb;
        if(rel>0){var m=(va+vb)/2,e=.4;A.w=(m-e*rel/2)/A.L;B.w=(m+e*rel/2)/B.L;var vel=Math.min(1,rel/(rm?60:110));
          if(vel>.04){if(chT-A.lc>.09){A.lc=chT;chime(A.f,vel,A.v,0)}if(chT-B.lc>.09){B.lc=chT;chime(B.f,vel*.7,B.v,.014)}A.fl=Math.max(A.fl,vel);B.fl=Math.max(B.fl,vel)}}
        var ov=(ct-(xb-xa))/2;A.th-=ov/A.L;B.th+=ov/B.L}}}
  for(var i=0;i<CH.length;i++){var c=CH[i];c.fl*=Math.exp(-dt*3);if(Math.abs(c.th)<2e-4&&Math.abs(c.w)<2e-3){c.th=0;c.w=0}}}
function chActive(){return mode==='sky'}
function segD(x,y,c){var b=bob(c),dx=b[0]-c.px,dy=b[1]-c.py,t=Math.max(0,Math.min(1,((x-c.px)*dx+(y-c.py)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-c.px-dx*t,y-c.py-dy*t)}
function segS(i,sx,sy){var P=CHP[i];if(!P)return[1e9,0];var dx=P.bx-P.ax,dy=P.by-P.ay,L2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((sx-P.ax)*dx+(sy-P.ay)*dy)/L2));return[Math.hypot(sx-P.ax-dx*t,sy-P.ay-dy*t),t*Math.sqrt(L2)]}
function chHit(sx,sy,r){var best=null,bd=r||24;for(var i=0;i<CH.length;i++){var P=CHP[i];if(!P)continue;var q=segS(i,sx,sy),d=Math.min(q[0]+(q[1]<12?99:0),Math.hypot(sx-P.bx,sy-P.by)-4);if(d<bd){bd=d;best=CH[i]}}return best}
/* the breeze: wind = swipe velocity (capped low), felt most by the strand under the finger, a little by all of them */
function wind(x,y,vx,vy,dt){var rm=RM.matches,cap=rm?320:640,sp=Math.hypot(vx,vy);if(sp>cap){vx*=cap/sp;vy*=cap/sp}
  for(var i=0;i<CH.length;i++){var c=CH[i],P=CHP[i];if(!P)continue;var d=segS(i,x,y)[0]/Math.max(1,VW.s),wg=.12+.88*Math.exp(-d*d/(2*60*60)),f=vx+.25*Math.abs(vy)*(P.bx<x?-1:1);c.w+=f*.42*wg*(.3+1.4*rnd(i*7.1+chT*61))*dt/c.L}}
function pluck(c,x){var rm=RM.matches,P=CHP[CH.indexOf(c)],dir=x<(P?P.bx:x)?1:-1;c.w+=dir*(rm?12:22)/c.L;c.fl=Math.max(c.fl,.6);chime(c.f,.5,c.v,0)}
/* synth: struck-tube partials (1, 2.76, 5.4) with their own decays, on a soft bus that sits under the track, 8 voices max */
var CB=null,VOX=[],unl=false,CHN=0;
function unlock(){if(REC)return;try{initAudio();if(AC.state==='suspended')AC.resume();if(!unl){var b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0);unl=true}}catch(x){}}
['pointerdown','touchend','pointerup','keydown'].forEach(function(t){addEventListener(t,unlock,{capture:true,passive:true})});
var NOTES=[];function chime(f,vel,vi,dl){NOTES.push([+performance.now().toFixed(1),vi]);if(NOTES.length>40)NOTES.shift();if(REC){CHL.push([+(VT+dl).toFixed(4),f,+vel.toFixed(3),vi]);return}
  if(!AC||AC.state!=='running')return;var t=AC.currentTime+dl;
  if(!CB){var cp=AC.createDynamicsCompressor();cp.threshold.value=-26;cp.ratio.value=6;cp.attack.value=.003;cp.release.value=.3;CB=AC.createGain();CB.gain.value=.3;CB.connect(cp);cp.connect(AC.destination)}
  CB.gain.setTargetAtTime(au.paused?.3:.13,AC.currentTime,.1);
  while(VOX.length>=8){var o=VOX.shift();try{o.g.gain.cancelScheduledValues(t);o.g.gain.setTargetAtTime(0,t,.015);o.os.forEach(function(s){s.stop(t+.12)})}catch(x){}}
  var gn=AC.createGain(),amp=.05+.25*Math.pow(vel,1.4),tb=TB[vi],os=[];gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(amp,t+.004);gn.gain.exponentialRampToValueAtTime(.0003,t+2.8);gn.connect(CB);
  for(var j=0;j<3;j++){var o=AC.createOscillator(),pg=AC.createGain();o.frequency.value=f*CHR[j]*(1+CDT[vi]*j);pg.gain.setValueAtTime(tb[j],t);pg.gain.exponentialRampToValueAtTime(.0001,t+CHD[j]);o.connect(pg);pg.connect(gn);o.start(t);o.stop(t+2.85);os.push(o)}
  CHN++;var vc={g:gn,os:os};VOX.push(vc);os[0].onended=function(){var k=VOX.indexOf(vc);if(k>=0)VOX.splice(k,1);gn.disconnect()}}
var fing=null; /* ?rec only: a faint fingertip so the demo shows where the touch is */
/* ---------- ui ---------- */
var lastUI='';
function mmss(s){s=Math.max(0,s);var m=Math.floor(s/60),x=Math.floor(s%60);return(m<10?'0':'')+m+':'+(x<10?'0':'')+x}
function ui(){if(HB){var oh=orbited();if(HB._o!==oh){HB._o=oh;HB.classList.toggle('off',oh)}}var t=railT,si=secAt(t),key=t.toFixed(1)+si+au.paused;if(key===lastUI)return;lastUI=key;
  var pc=t/T.dur*100;fillE.style.width=pc+'%';headE.style.left=pc+'%';$('tc').textContent=mmss(t)+' / '+mmss(T.dur);
  $('sn').textContent=ROMAN[si]+' · '+SECS[si].name;$('crumbSec').textContent=mode==='sky'?'':' · '+T.title;
  [].forEach.call(rail.querySelectorAll('.tk'),function(e,k){e.classList.toggle('on',k===si)});rail.setAttribute('aria-valuenow',t.toFixed(0));
  $('pp').textContent=au.paused?'▶':'❚❚';$('pp').setAttribute('aria-label',au.paused?'play':'pause');drawWF()}
function goIn(){if(mode==='in'||mode==='diving')return;initAudio();if(AC&&AC.state==='suspended')AC.resume();vol(1,.3);au.play().catch(function(){});
  mode='diving';sk.dataset.mode='diving';if(!REC&&history.state!=='in')history.pushState('in','')}
function goOut(fromPop){if(mode==='sky'||mode==='rising')return;mode='rising';sk.dataset.mode='rising';vol(0,.5);pauseAt=VT+1.6;if(!REC)setTimeout(function(){if(mode!=='in'&&mode!=='diving')au.pause()},1600);
  if(!fromPop&&!REC&&history.state==='in')history.back()}
$('dive').onclick=function(e){e.stopPropagation();goIn()};
$('rise').onclick=function(e){e.stopPropagation();goOut()};
var HB=$('homev');if(HB)HB.onclick=function(e){e.stopPropagation();flyHome()};
$('pp').onclick=function(){if(au.paused){vol(1);au.play()}else au.pause()};
addEventListener('popstate',function(){if(mode==='in'||mode==='diving')goOut(true)});
/* fat-finger guard: WebKit/iOS touch adjustment (and Chrome's touch-area hit test) turn a near-miss tap into a click on a nearby
   button, with the click moved inside it. the dive button, the song picks and the back link only act on a pointer click whose
   pointerdown's RAW point lies inside their real rect (+1 px). keyboard clicks (detail 0) always pass. captured on the
   document, so the button's own handler / the link's navigation never sees a rejected click. */
var LD=null,FFX=0;addEventListener('pointerdown',function(e){LD={t:performance.now(),x:e.clientX,y:e.clientY}},true);
function realClick(el,e){if(!e.detail||!LD||performance.now()-LD.t>1500)return true;
  var r=el.getBoundingClientRect();return LD.x>=r.left-1&&LD.x<=r.right+1&&LD.y>=r.top-1&&LD.y<=r.bottom+1}
document.addEventListener('click',function(e){var el=e.target&&e.target.closest?e.target.closest('#dive,#picks button,#home'):null;
  if(el&&!realClick(el,e)){e.preventDefault();e.stopImmediatePropagation();FFX++}},true);
/* any touch, drag, wheel or key freezes the sweep where it is */
['pointerdown','wheel','keydown'].forEach(function(t){addEventListener(t,poke,{capture:true,passive:true})});
['pointerdown','keydown'].forEach(function(t){addEventListener(t,function(){RC=0},{capture:true,passive:true})});
addEventListener('pointermove',function(e){if(e.buttons||e.pointerType==='touch')poke()},{capture:true,passive:true});
addEventListener('keydown',function(e){if(e.key==='Escape')goOut();if(e.key===' '&&mode==='in'){e.preventDefault();$('pp').onclick()}
  if(e.target===rail||e.altKey||e.ctrlKey||e.metaKey)return;var k=e.key;
  if(mode==='sky'){var st=e.shiftKey?120:48,ax=k==='ArrowLeft'?1:k==='ArrowRight'?-1:0,ay=k==='ArrowUp'?1:k==='ArrowDown'?-1:0;
    if(ax||ay){e.preventDefault();CO=null;V.x+=ax*st;V.y+=ay*st;clampPan()}
    else if(k==='+'||k==='='||k==='-'||k==='_'){e.preventDefault();zoomAt(V.z*(k==='+'||k==='='?1.25:.8),W/2,H*.46)}
    else if(k==='['||k===']'){e.preventDefault();IDLE=0;O.yaw=Math.max(-OLIM.yaw,Math.min(OLIM.yaw,O.yaw+(k===']'?.1:-.1)))}
    else if(k==='h'||k==='H'||k==='0'){e.preventDefault();flyHome()}}
  else if(k==='ArrowUp'&&(mode==='in'||mode==='diving')){e.preventDefault();goOut()}});
/* intro while zoomed: past ~1.05x the sub-line, picks and dive button fade out and stop taking pointers, so strand tips
   under them are tappable; they ease back in near 1x. the SOUND heading stays, but softly fades while a strand passes over it. */
var CVD=0,SPK=0,IN=$('intro'),HEAD=IN.querySelector('.sl b'),UIE=[IN.querySelector('.sl small'),$('picks'),$('dive')],IA=1,HA=1,HN=false,uiF=0,UR=null;
function uiRects(){var f=function(e){var r=e.getBoundingClientRect();return[r.left,r.top,r.right,r.bottom]};
  UR={head:f(HEAD),intro:f(IN),ui:UIE.map(f),hud:[].map.call(document.querySelectorAll('.hud a,.hud .crumb'),f)}}
function inR(x,y,r,m){return x>r[0]-m&&x<r[2]+m&&y>r[1]-m&&y<r[3]+m}
function introStep(dt){if(!UR||(uiF++%30)===0)uiRects();
  var zf=Math.max(0,Math.min(1,(V.z-1.02)/.06)),k=Math.min(1,dt*(RM.matches?14:7));IA+=((1-zf)-IA)*k;if(Math.abs(IA-(1-zf))<.004)IA=1-zf;
  HN=false;if(mode==='sky'&&dive<.01){var r=UR.head;
    for(var i=0;i<CH.length&&!HN;i++){var P=CHP[i];if(!P)continue;for(var s=0;s<=6;s++){var f=s/6,sx=P.ax+(P.bx-P.ax)*f,sy=P.ay+(P.by-P.ay)*f;
      if(inR(sx,sy,r,10)){HN=true;break}}}}
  HA+=((HN?.22:1)-HA)*Math.min(1,dt*10);
  IN.style.setProperty('--ia',IA.toFixed(3));IN.style.setProperty('--ha',HA.toFixed(3));IN.classList.toggle('zoomed',IA<.6)}
/* dead zone: a near miss on the visible UI (intro block when shown, the heading, the header) never counts as "tap empty sky to dive" */
/* (merged) the intro's rects count even when faded while zoomed, so a missed tap there never dives; strands/stars under
   the faded intro still win because they are tested before this */
function nearUI(x,y){if(!UR)uiRects();if(inR(x,y,UR.head,22))return true;if(inR(x,y,UR.intro,10))return true;
  for(var i=0;i<UR.ui.length;i++)if(inR(x,y,UR.ui[i],26))return true;
  for(var i=0;i<UR.hud.length;i++)if(inR(x,y,UR.hud[i],16))return true;return false}
/* canvas (v2): sky tap (<12 px move) = song star (12 px, press <280 ms) > strand note (press <400 ms) > song star (28 px) > empty sky = dive (outside the dead zone).
   a still hold (>=280 ms on sky/star) and release does nothing: it is how you stop the sweep; a tap that catches a gliding view only stops it.
   inside: tap = pause, swipe down = rise.
   ONE-FINGER RULE (v2): a drag pans the view, 1:1, at every zoom, and glides a little on release. the only exception is a quick
   swipe that starts on or right at a strand (within 26 px; its first 12 px in <= 90 ms): that is wind for the strands (sways,
   knocks, chimes) and does not pan. two fingers = pinch-zoom + pan together. wheel zooms at the cursor. */
var p0=null,TAPD=12,TAPT=400,TAPS=280,PT={},PZ=null,afterPinch=false,STR=26,FLK=90,GES={pan:0,wind:0,coast:0,caught:0,orbit:0,dbl:0};
/* empty-sky tap: dives (as before) unless a second tap follows within 300 ms = fly home. so the dive waits 300 ms */
var STAP=null;function skyTap(x,y,sq){var now=performance.now();
  if(STAP&&now-STAP.t<320&&Math.hypot(x-STAP.x,y-STAP.y)<44){clearTimeout(STAP.tm);STAP=null;GES.dbl++;flyHome();return}
  if(STAP)clearTimeout(STAP.tm);var ok=sq&&!nearUI(x,y);STAP={t:now,x:x,y:y,tm:setTimeout(function(){STAP=null;if(ok&&mode==='sky'&&!p0&&!nPT()){CVD++;goIn()}},REC?0:300)}}
/* the glide: first-order ease-out of the release velocity (tau 140 ms, <= 700 ms, speed capped 1.6 px/ms = <= ~225 px of travel) */
var CO=null,PV={x:0,y:0,t:-1},UP={x:0,y:0},PS={x:0,y:0},PA={x:0,y:0},PAK=.03;
function coastStep(dt){if(!CO)return;if(nPT()||PZ||mode!=='sky'){CO=null;return}CO.el+=dt;var k1=Math.exp(-CO.el/CO.tau),dd=(CO.k-k1)*CO.tau;CO.k=k1;
  var x0=V.x,y0=V.y,wx=CO.vx*dd,wy=CO.vy*dd;V.x+=wx;V.y+=wy;clampPan();var gx=V.x-x0,gy=V.y-y0;UP.x+=gx;UP.y+=gy;
  if(Math.abs(gx-wx)>.5)CO.vx=0;if(Math.abs(gy-wy)>.5)CO.vy=0; /* reached the edge of the pan range: stop that axis, no bounce */
  if(CO.el>=CO.end||(!CO.vx&&!CO.vy))CO=null}
/* the user's own pan (finger or glide) as an acceleration of the sky frame, in unzoomed px/s^2, smoothed and capped */
function panCouple(dt){if(dt<=0)return;var s=Math.max(1,VW.s),vx=UP.x/s/dt;if(mode!=='sky'||RM.matches){UP.x=UP.y=0;PS.x=PS.y=0;PA.x=0;return}
  var vy=UP.y/s/dt;PS.y+=(vy-PS.y)*Math.min(1,dt*14);
  UP.x=UP.y=0;var px0=PS.x;PS.x+=(vx-PS.x)*Math.min(1,dt*14);var ax=(PS.x-px0)/dt;PA.x+=(Math.max(-3000,Math.min(3000,ax))-PA.x)*Math.min(1,dt*10)}
function tnow(e){return REC?VT:e.timeStamp/1000}
function nPT(){return Object.keys(PT).length}
function two(){var k=Object.keys(PT),a=PT[k[0]],b=PT[k[1]];return{d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2}}
function zoomable(){return mode==='sky'}
function ang2(){var k=Object.keys(PT),a=PT[k[0]],b=PT[k[1]];return Math.atan2(b.y-a.y,b.x-a.x)}
function pinchStart(t){var q=two();HOMEF=null;PZ={d0:Math.max(10,q.d),z0:V.z,m0:[q.mx,q.my],a0:ang2(),o0:{yaw:O.yaw,pitch:O.pitch,roll:O.roll},orb:false,b0:[W/2+(q.mx-W/2-V.x)/V.z,H*.46+(q.my-H*.46-V.y)/V.z]}}
/* orbit under the fingers: ~0.9 x the short screen side of drag = 1 radian; rubber band past the limits */
function orbitDrag(dx,dy,da,o0){var f=Math.min(W,H)*.9;O.yaw=rubber(o0.yaw+dx/f,OLIM.yaw);O.pitch=rubber(o0.pitch-dy/f,OLIM.pitch);O.roll=rubber(o0.roll+da*.6,OLIM.roll);IDLE=0}
function pinchMove(t){var q=two(),z=Math.max(ZMIN,Math.min(ZMAX,PZ.z0*q.d/PZ.d0));
  /* spread = zoom about where the pinch began (that sky point stays put); moving both fingers together or twisting tilts the
     perspective (engages past 10 px / 6 deg, measured from there, so a plain pinch never tilts by accident) */
  V.z=z;V.x=PZ.m0[0]-W/2-(PZ.b0[0]-W/2)*z;V.y=PZ.m0[1]-H*.46-(PZ.b0[1]-H*.46)*z;clampPan();
  var dx=q.mx-PZ.m0[0],dy=q.my-PZ.m0[1],da=ang2()-PZ.a0;da=Math.atan2(Math.sin(da),Math.cos(da));
  if(!PZ.orb&&(Math.hypot(dx,dy)>10||Math.abs(da)>6*D2R)){PZ.orb=true;PZ.m1=[q.mx,q.my];PZ.a1=ang2();GES.orbit++}
  if(PZ.orb){var da1=ang2()-PZ.a1;da1=Math.atan2(Math.sin(da1),Math.cos(da1));orbitDrag(q.mx-PZ.m1[0],q.my-PZ.m1[1],da1,PZ.o0)}}
/* release: nothing to do. the view is already exactly where the fingers left it (no glide after a pinch) */
function pinchEnd(t){PZ=null}
cv.addEventListener('pointerdown',function(e){PT[e.pointerId]={x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId)}catch(x){}
  var caught=!!CO;CO=null;if(caught)GES.caught++;HOMEF=null;IDLE=0;
  if(nPT()>=2){p0=null;afterPinch=true;if(zoomable()&&!PZ)pinchStart(tnow(e));return}
  if(afterPinch)return;
  p0={x:e.clientX,y:e.clientY,t:performance.now(),t0:tnow(e),lx:e.clientX,ly:e.clientY,lt:tnow(e),sw:false,vx:0,vy:0,kind:null,caught:caught,
    near:zoomable()&&!!chHit(e.clientX,e.clientY,STR),o0:{yaw:O.yaw,pitch:O.pitch,roll:O.roll}};PV={x:0,y:0,t:-1};
  if(zoomable()&&e.pointerType==='mouse'&&(e.shiftKey||e.button===2)){p0.kind='orbit';p0.sw=true;GES.orbit++}
  if(REC)fing={x:e.clientX,y:e.clientY,a:.5,on:true}});
cv.addEventListener('pointermove',function(e){var P=PT[e.pointerId];if(P){P.x=e.clientX;P.y=e.clientY}if(fing){fing.x=e.clientX;fing.y=e.clientY}
  if(PZ){if(nPT()>=2&&zoomable())pinchMove(tnow(e));return}
  if(!p0)return;
  var sw0=p0.sw,t=tnow(e);
  if(!p0.sw&&Math.hypot(e.clientX-p0.x,e.clientY-p0.y)>=TAPD){p0.sw=true;
    p0.kind=!zoomable()?'none':(p0.near&&(t-p0.t0)*1000<=FLK)?'wind':'pan';if(GES[p0.kind]!=null)GES[p0.kind]++}
  var dt=Math.max(1/120,t-p0.lt),vx=(e.clientX-p0.lx)/dt,vy=(e.clientY-p0.ly)/dt;p0.vx=p0.vx*.4+vx*.6;p0.vy=p0.vy*.4+vy*.6;
  if(p0.sw){if(p0.kind==='pan'){var fx=sw0?p0.lx:p0.x,fy=sw0?p0.ly:p0.y,x0=V.x,y0=V.y;V.x+=e.clientX-fx;V.y+=e.clientY-fy;clampPan();UP.x+=V.x-x0;UP.y+=V.y-y0;
      var st=Math.max(1/240,t-p0.lt),ix=(e.clientX-fx)/st,iy=(e.clientY-fy)/st;if(PV.t<0){PV.x=ix;PV.y=iy}else{PV.x=PV.x*.35+ix*.65;PV.y=PV.y*.35+iy*.65}PV.t=t}
    else if(p0.kind==='wind'&&chActive())wind(e.clientX,e.clientY,p0.vx,p0.vy,Math.min(dt,.05));
    else if(p0.kind==='orbit')orbitDrag(e.clientX-p0.x,e.clientY-p0.y,0,p0.o0)}
  p0.lx=e.clientX;p0.ly=e.clientY;p0.lt=t});
function glide(t){var sp=Math.hypot(PV.x,PV.y),cap=1600;if(RM.matches||PV.t<0||t-PV.t>.1||sp<120)return; /* a finger that stopped before lifting does not glide */
  var f=sp>cap?cap/sp:1;CO={vx:PV.x*f,vy:PV.y*f,tau:.14,end:.7,el:0,k:1};GES.coast++}
function cvUp(e){delete PT[e.pointerId];if(fing)fing.on=false;
  if(PZ&&nPT()<2)pinchEnd(tnow(e));
  if(afterPinch){if(nPT()===0)afterPinch=false;p0=null;return}
  if(!p0)return;var dy=e.clientY-p0.y,dx=e.clientX-p0.x,tap=Math.abs(dx)+Math.abs(dy)<TAPD,quick=performance.now()-p0.t<TAPT;
  if(p0.kind==='pan'&&p0.sw){glide(tnow(e));p0=null;return}
  if((p0.kind==='wind'||p0.kind==='orbit')&&p0.sw){p0=null;return}
  if(tap&&p0.caught){p0=null;return} /* that tap only caught the gliding sky */
  if(chActive()){if(tap&&quick){var sq=performance.now()-p0.t<TAPS,hs=starHit(p0.x,p0.y,12),hit=hs<0?chHit(p0.x,p0.y):null;if(hs<0&&!hit)hs=starHit(p0.x,p0.y,28);
      if(hs>=0){if(sq){SPK++;pickTrack(STAR2K[hs],true)}}else if(hit)pluck(hit,p0.x);else skyTap(p0.x,p0.y,sq)}}
  else if(mode==='in'&&dy>80&&Math.abs(dx)<dy)goOut();else if(tap&&mode==='in')$('pp').onclick();p0=null}
cv.addEventListener('pointerup',cvUp);cv.addEventListener('contextmenu',function(e){e.preventDefault()});cv.addEventListener('pointercancel',function(e){delete PT[e.pointerId];if(fing)fing.on=false;if(PZ&&nPT()<2)pinchEnd(tnow(e));if(nPT()===0)afterPinch=false;p0=null});
cv.addEventListener('wheel',function(e){if(!zoomable())return;e.preventDefault();CO=null;
  var d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?H:1);zoomAt(V.z*Math.exp(-d*(e.ctrlKey?.01:.0015)),e.clientX,e.clientY)},{passive:false});
/* rail: drag flies the camera; audio follows on release (soft while dragging), like Scope's scrub */
var dragging=false,PR=null,seekQ=0;
function railTime(e){var r=rail.getBoundingClientRect();return Math.max(0,Math.min(T.dur-.05,(e.clientX-r.left)/r.width*T.dur))}
rail.addEventListener('pointerdown',function(e){PR=e.pointerId;try{rail.setPointerCapture(PR)}catch(x){}dragging=true;rail.classList.add('drag');vol(.25,.05);scrub(railTime(e))});
rail.addEventListener('pointermove',function(e){if(PR===e.pointerId)scrub(railTime(e))});
function scrub(t){railT=t;tz=ringAt(t);var n=performance.now();if(n-seekQ>140){seekQ=n;au.currentTime=t}}
function pup(e){if(PR!==e.pointerId)return;PR=null;rail.classList.remove('drag');au.currentTime=railTime(e);dragging=false;vol(au.paused?0:1,.15);if(au.paused&&mode==='in'){vol(1);au.play()}}
rail.addEventListener('pointerup',pup);rail.addEventListener('pointercancel',pup);
rail.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?5:e.key==='ArrowLeft'?-5:0;if(d){au.currentTime=Math.max(0,Math.min(T.dur,au.currentTime+d));tz=ringAt(au.currentTime)}});
au.addEventListener('ended',function(){au.currentTime=0;tz=0;au.play()});
addEventListener('resize',function(){rs();clampPan();uiRects()});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){uiRects();if(V.z<1.001&&mode==='sky'){fitLayout();clampPan()}});
pickTrack(TK);rs();if(!REC)requestAnimationFrame(frame);else{last=0;tick(0,0)}
window.__sk={played:function(){return{n:CHN,vox:VOX.length,ac:AC&&AC.state}},chimes:function(){var l=CHL;CHL=[];return l},ch:function(){return CH.map(function(c){var b=bob(c);return{x:b[0],y:b[1],px:c.px,py:c.py,th:c.th,w:c.w}})},step:function(n,dt){for(var i=0;i<n;i++)step(dt)},ready:function(){return !!PCM},goIn:goIn,goOut:goOut,log:function(){var l=LOG;LOG=[];return l},state:function(){return{mode:mode,t:au.currentTime,dive:dive}},view:function(){return{z:V.z,x:V.x,y:V.y,pinch:!!PZ}},viewSet:function(z,x,y){poke();V.z=Math.max(ZMIN,Math.min(ZMAX,z));V.x=x||0;V.y=y||0;clampPan();zHi=V.z;RC=0},rc:function(){return RC},ui:function(){return{ia:IA,ha:HA,headNear:HN,zoomed:IN.classList.contains('zoomed'),rects:UR}},nearUI:nearUI,cvDives:function(){return CVD},chHit:function(x,y,r){var c=chHit(x,y,r);return c?CH.indexOf(c):-1},tracks:function(){return KEYS.slice()},dbg:function(){return DBG},skyProj:function(){return skyProj.map(function(p){return p?[p[0],p[1]]:null})},safeBand:safeBand,fit:function(){return{s:FIT.s,dy:FIT.dy}},vw:function(){return{s:VW.s,x:VW.x,y:VW.y}},paused:function(){return au.paused},starHit:starHit,pick:pickTrack,sel:function(){return{k:TK,star:highlight,picks:SPK}},sweep:function(){return{on:SW.on,idle:SW.idle,w:SW.w,t:SW.t,moved:SW.moved}},sweepOn:function(b){SW.on=!!b;poke()},ffx:function(){return FFX},notes:function(){var l=NOTES;NOTES=[];return l},
  v2:function(){var a=orbAngles();return{ges:GES,coast:!!CO,pa:PA.x,drawn:R3.drawn,orbit:{yaw:O.yaw,pitch:O.pitch,roll:O.roll},lean:{yaw:LN.yaw.x,pitch:LN.pitch.x,roll:LN.roll.x},total:a,lim:{yaw:OLIM.yaw,pitch:OLIM.pitch,roll:OLIM.roll,rubber:RUB,idle:IDLE_BACK},home:!!HOMEF,idle:IDLE,stat:OSTAT,cues:DBG.cues,strandTh:CH.map(function(c){return +c.th.toFixed(4)}),p0:p0?p0.kind:null}},
  orbitSet:function(y,p,r){O.yaw=y||0;O.pitch=p||0;O.roll=r||0;IDLE=0},flyHome:flyHome,strandXY:function(i,f){var P=CHP[i];return P?[P.ax+(P.bx-P.ax)*f,P.ay+(P.by-P.ay)*f]:null}};
})();
