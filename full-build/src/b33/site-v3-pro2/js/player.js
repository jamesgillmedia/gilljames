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
   the user. a slow sweep drifts the pan (never the zoom) after the view has been left alone while zoomed in. */
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
function pickTrack(k,fromStar){if(!TRACKS[k])return;var was=!au0.paused;TK=k;T=TRACKS[k];N=T.peaks.length;au0.src=T.file;au0.load();if(was&&!REC)au0.play().catch(function(){});if(REC){PCM=null;fetch(T.file).then(function(r){return r.arrayBuffer()}).then(function(b){return new OfflineAudioContext(1,1,48000).decodeAudioData(b)}).then(function(d){PCM=d.getChannelData(0);PSR=d.sampleRate})}
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
var AC=null,AN=null,GN=null,FD=null,TD=null,WANT=false;
/* pro2 fix (music not playing on some phones / browsers): the song is a plain <audio> element and is NEVER routed through Web Audio.
   Routing it through createMediaElementSource meant that whenever the AudioContext was not 'running' (iOS 'interrupted' after a call,
   lock screen or tab switch; a context created before a real tap; the iPhone silent switch, which mutes Web Audio) the song kept
   "playing" in silence. The visuals now read the track's own pre-computed envelope + 3 bands (tracks.js) at the playhead.
   AC is created lazily only for the wind-chime synth, which may fail without touching the music. */
function initAudio(){FD=FD||new Uint8Array(256);TD=TD||new Uint8Array(512);if(REC||AC)return;try{var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}catch(x){AC=null}}
function wakeAC(){try{if(AC&&AC.state!=='running'&&AC.state!=='closed')AC.resume()}catch(x){}}
var VA=null;function vol(v,t){FG.v=v;if(REC)return;var a0=au.volume,t0=performance.now(),d=Math.max(.04,(t||.08)*3)*1000;if(VA)cancelAnimationFrame(VA);
  (function st(){var k=Math.min(1,(performance.now()-t0)/d);try{au.volume=Math.max(0,Math.min(1,a0+(v-a0)*k))}catch(x){}if(k<1)VA=requestAnimationFrame(st)})()}
var L={rms:0,low:0,mid:0,high:0,beat:0,avgLow:.2,lastBeat:0};
function listen(now){if(REC){if(au.paused||!PCM){L.rms*=.94;L.low*=.94;L.mid*=.94;L.high*=.94;L.beat*=.9;return}recFFT();post(now,48000);return}
  if(!FD||au.paused){L.rms*=.94;L.low*=.94;L.mid*=.94;L.high*=.94;L.beat*=.9;return}
  synth(now);post(now,48000)}
/* the analyser's two arrays, synthesized from the track's envelope (peaks) and its low / mid / high bands at the playhead */
function bandI(i,j){i=Math.max(0,Math.min(N-1,i));var a=Math.floor(i),b=Math.min(N-1,a+1),f=i-a;return T.bands[a][j]*(1-f)+T.bands[b][j]*f}
function synth(now){var i=au.currentTime/T.dur*N,e=env(i),lo=bandI(i,0),mi=bandI(i,1),hi=bandI(i,2),gv=FG.v,ph=now*.001;
  for(var k=0;k<FD.length;k++){var lv=k<3?lo:k<26?mi*(1-.25*(k-3)/23)+lo*.15*Math.max(0,1-(k-3)/6):k<110?hi*(1-.6*(k-26)/84):hi*.25*Math.max(0,1-(k-110)/80);
    lv*=gv*(.82+.18*Math.sin(ph*(2.1+k*.37)+k*1.7));FD[k]=Math.max(0,Math.min(255,255*lv))}
  for(var n=0;n<TD.length;n++){var x=n/TD.length*6.2832,v=e*gv*(.55*Math.sin(x*2+ph*5.1)+.3*lo*Math.sin(x*5-ph*3.3)+.15*hi*Math.sin(x*19+ph*11));TD[n]=Math.max(0,Math.min(255,128+127*v))}}
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
function clampPan(){var b=skyBox(),m=30,ox=W/2,oy=H*.46,z=V.z;
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
  pulseStar=Math.max(0,pulseStar-dt*.8);recentStep(dt);sweepStep(dt);chStep(dt);draw(now,dt);introStep(dt);ui()}
function draw(now,dt){var c=g;c.setTransform(DPR,0,0,DPR,0,0);setView();DBG={stars:0,songPos:[],labels:[]};
  var m=ease(dive),cx=px(camZ)*m,cy=py(camZ)*m,cz=camZ;
  /* sky: navy radial + background star dust (parallax: drifts with the camera path inside) */
  c.fillStyle='#03050a';c.fillRect(0,0,W,H);var gr=c.createRadialGradient(W/2,H*.42,0,W/2,H*.42,Math.max(W,H)*.75);
  gr.addColorStop(0,'rgba(22,34,58,'+(.85-.45*m).toFixed(3)+')');gr.addColorStop(.6,'rgba(10,17,32,.6)');gr.addColorStop(1,'rgba(3,5,10,0)');c.fillStyle=gr;c.fillRect(0,0,W,H);
  var bgA=1-.55*m;for(var i=0;i<BG.length;i++){var s=BG[i],x=((s[0]*W*1.4-cx*12-camZ*.6*s[2]+VW.x*.12*s[2])%(W*1.4)+W*1.4)%(W*1.4)-W*.2,y=((s[1]*H+VW.y*.12*s[2])%H+H)%H,b=.08+.75*s[2]*(.7+.3*Math.sin(tw*1.3+i));
    c.fillStyle='rgba(225,232,250,'+(b*bgA).toFixed(3)+')';var r=.5+s[2]*1.3;c.fillRect(x-r/2,y-r/2,r,r)}
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
          sz=cz+DZ*(1-ease(dive))+.4+r*.02*(1-dive);X=X*unf+(cs[0]+jx)*(1-unf);Y=Y*unf+(cs[1]+jy)*(1-unf);Z=Z*unf+sz*(1-unf)}
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
  if(sa>.01){var sp=[],zc=cz+DZ*(1-ease(dive));
    for(var k=0;k<SOUND.s.length;k++){var cs=cstar(k);sp.push(proj(cs[0],cs[1],zc,cz,0,0))}
    var hz=Math.min(1,(sp[0]?sp[0][2]:F/DZ)/(F/DZ));
    for(var i=0;i<CH.length;i++){var ch=CH[i],q=sp[ch.b];if(q&&ch.L){var bb=bob(ch);sp[ch.b]=[q[0]+(bb[0]-ch.rx)*hz*VW.s,q[1]+(bb[1]-ch.ry)*hz*VW.s,q[2],q[3]]}}
    skyProj=sp;
    var nr=Math.min(W,520)*.55*hz*VW.s*FIT.s,gx=W/2+VW.x,gy=H*.46+((-H*.07)*FIT.s+FIT.dy)*hz*VW.s+VW.y;var gg=c.createRadialGradient(gx,gy,0,gx,gy,nr);
    gg.addColorStop(0,'rgba('+SOUND.t+','+(.09*sa).toFixed(3)+')');gg.addColorStop(1,'rgba('+SOUND.t+',0)');c.fillStyle=gg;c.fillRect(0,0,W,H);
    c.strokeStyle='rgba(255,214,208,'+(.5*sa*sa).toFixed(3)+')';c.lineWidth=1;c.beginPath();
    SOUND.e.forEach(function(ed){var ea=sp[ed[0]],eb=sp[ed[1]];if(ea&&eb){c.moveTo(ea[0],ea[1]);c.lineTo(eb[0],eb[1])}});c.stroke();
    for(var k=0;k<SOUND.s.length;k++){var p=sp[k];if(!p)continue;var s=SOUND.s[k],b=s[2]*(.85+.15*Math.sin(tw*1.7+k*1.3)),SF=1.35*hz*Math.sqrt(VW.s);
      var isSong=STAR2K[k]!=null,sel=k===highlight,gs=(6+30*b*b)*SF*(isSong?1.15:1)*(sel?1.35+.25*pulseStar:1);
      for(var i=0;i<CH.length;i++)if(CH[i].b===k)gs*=1+.7*CH[i].fl;c.globalAlpha=sa*(.35+.65*b)*(s[3]?.8:1);c.drawImage(sel?GM:GR,p[0]-gs/2,p[1]-gs/2,gs,gs);
      if(sel){c.globalCompositeOperation='lighter';c.drawImage(GM,p[0]-gs*.7,p[1]-gs*.7,gs*1.4,gs*1.4);c.globalCompositeOperation='source-over'}
      var rad=(.5+1.9*b)*SF*.85*(isSong?1.1:1);c.globalAlpha=sa*(.45+.55*b);c.fillStyle='#fff';c.beginPath();c.arc(p[0],p[1],rad,0,7);c.fill();
      DBG.stars++;if(isSong)DBG.songPos.push({k:STAR2K[k],x:+p[0].toFixed(1),y:+p[1].toFixed(1),r:+rad.toFixed(2),sel:sel})}
    c.globalAlpha=1;drawLabels(c,sp,sa)}
  else skyProj=[];
  /* a flash of white as you pass through the plane of the stars */
  if(fing&&fing.a>.01){c.globalAlpha=fing.a;c.drawImage(GW,fing.x-16,fing.y-16,32,32);c.globalAlpha=1;if(!fing.on)fing.a*=.8}
  var fl=Math.max(0,1-Math.abs(dive-.42)/.14);if(fl>0&&(mode==='diving'||mode==='rising')){c.fillStyle='rgba(220,235,255,'+(.10*fl).toFixed(3)+')';c.fillRect(0,0,W,H)}
}
/* ---------- song labels (from sketch-next): collision-aware, a song label is NEVER dropped ----------
   candidates around the star (above first: the strands hang below), clamped to the safe band; penalties for covering a
   placed label, another song star, a strand, the SOUND heading, or drifting from its star. a song star that is off screen
   (zoomed/panned away) keeps its label pinned at the band edge with an arrow toward it, so all six are always readable. */
var skyProj=[],DBG={stars:0,songPos:[],labels:[]};
function rHit(a,b){return !(a[0]+a[2]<=b[0]||b[0]+b[2]<=a[0]||a[1]+a[3]<=b[1]||b[1]+b[3]<=a[1])}
function segRect(x0,y0,x1,y1,r){for(var s=0;s<=10;s++){var f=s/10,x=x0+(x1-x0)*f,y=y0+(y1-y0)*f;if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return true}return false}
function drawLabels(c,sp,sa){var sb=safeBand(),zs=VW.s,fsT=9.5*Math.min(1.25,.9+zs*.1),fsA=8*Math.min(1.2,.9+zs*.08),labs=[],placed=[],segs=[],hd=UR?UR.head:null;
  for(var i=0;i<SOUND.e.length;i++){var ed=SOUND.e[i],pa=sp[ed[0]],pb=sp[ed[1]];if(pa&&pb)segs.push([pa[0],pa[1],pb[0],pb[1],i<CH.length?150:120])}
  for(var k in STAR2K){var ki=+k,p=sp[ki];if(!p)continue;var tr=TRACKS[STAR2K[ki]];
    labs.push({ki:ki,p:p,tr:tr,pri:(ki===highlight?100:0)+(tr.artist==='Mothers Moniker'?8:0)+SOUND.s[ki][2]*10})}
  labs.sort(function(a,b){return b.pri-a.pri});c.textBaseline='middle';
  for(var li=0;li<labs.length;li++){var Lb=labs[li],p=Lb.p,tr=Lb.tr,sel=Lb.ki===highlight,
      offX=p[0]<sb.left?-1:p[0]>sb.right?1:0,offY=p[1]<sb.top?-1:p[1]>sb.bot?1:0,off=!!(offX||offY),
      ttl=off?(offX<0?'‹ ':offY<0?'↑ ':offY>0&&!offX?'↓ ':'')+tr.title+(offX>0?' ›':''):tr.title;
    c.font='300 '+fsT.toFixed(2)+'px Poppins,system-ui,sans-serif';var tW=c.measureText(ttl).width;
    c.font='300 '+fsA.toFixed(2)+'px Poppins,system-ui,sans-serif';var aW=c.measureText(tr.artist).width;
    var best=null,bp=1e9,lh=22,ox=9+3*Math.min(1.5,zs),lw,cand;
    /* sizes: full, 90% when that is the only way to keep lines off the text (tight 1x clusters, e.g. ii), and 80% for edge-pinned labels only */
    for(var si=0;si<(off?3:2);si++){var scl=1-si*.1;lw=Math.max(tW,aW)*scl+6;cand=[];
    if(!off)cand=[[p[0]-lw/2,p[1]-31,0],[p[0]+ox,p[1]-25,1],[p[0]-ox-lw,p[1]-25,-1],[p[0]+ox,p[1]-8,1],[p[0]-ox-lw,p[1]-8,-1],
      [p[0]-lw/2,p[1]-49,0],[p[0]+ox,p[1]+9,1],[p[0]-ox-lw,p[1]+9,-1],[p[0]+ox+12,p[1]-42,1],[p[0]-ox-lw-12,p[1]-42,-1],[p[0]-lw/2,p[1]+14,0],[p[0]-lw*.25,p[1]-56,0],[p[0]-lw*.75,p[1]-56,0],[p[0]-lw/2,p[1]-72,0],[p[0]+ox,p[1]+30,1],[p[0]-ox-lw,p[1]+30,-1],[p[0]-lw/2-9,p[1]+14,0],[p[0]-lw/2+9,p[1]+14,0],[p[0]-lw/2-9,p[1]-31,0],[p[0]-lw/2+9,p[1]-31,0],[p[0]-lw/2-16,p[1]+14,0],[p[0]-lw/2+16,p[1]+14,0],[p[0]-lw/2-3,p[1]+14,0],[p[0]-lw/2+3,p[1]+14,0],[p[0]-lw/2-6,p[1]+14,0],[p[0]-lw/2+6,p[1]+14,0],[p[0]-lw/2-12,p[1]+14,0],[p[0]-lw/2+12,p[1]+14,0]];
     /* zoomed views: a wider ring (leader tick joins it to the star), so a line-free spot is nearly always available */
     if(!off)for(var rg=0;rg<5;rg++)for(var an=0;an<12;an++){var rad=44+rg*20,aa=an*Math.PI/6,qx=p[0]+Math.cos(aa)*rad,qy=p[1]+Math.sin(aa)*rad*.8;cand.push([Math.cos(aa)>.3?qx:Math.cos(aa)<-.3?qx-lw:qx-lw/2,qy-lh/2,Math.cos(aa)>.3?1:Math.cos(aa)<-.3?-1:0])}
    else{var cx0=offX<0?sb.left:offX>0?sb.right-lw:Math.max(sb.left,Math.min(sb.right-lw,p[0]-lw/2)),
        cy0=offX?Math.max(sb.top,Math.min(sb.bot-lh,p[1]-lh/2)):offY<0?sb.top:sb.bot-lh,al=offX<0?1:offX>0?-1:0;
      if(offX)for(var j=0;j<31;j++){var o=((j+1)>>1)*(j%2?1:-1);cand.push([cx0,cy0+o*25,al])}
      else for(var row=0;row<3;row++)for(var j2=0;j2<21;j2++){var o2=((j2+1)>>1)*(j2%2?1:-1);cand.push([cx0+o2*24,cy0-offY*row*25,0])}}
    for(var ci=0;ci<cand.length;ci++){var tx=Math.max(sb.left,Math.min(sb.right-lw,cand[ci][0])),ty=Math.max(sb.top,Math.min(sb.bot-lh,cand[ci][1])),
        rr=[tx,ty,lw,lh],tr0=[tx+3,ty+1,lw-6,lh-2],pen=(off?ci*.6:ci*2)+si*8,hit=0;
      for(var pj=0;pj<placed.length;pj++)if(rHit(rr,[placed[pj][0]-3,placed[pj][1]-3,placed[pj][2]+6,placed[pj][3]+6])){hit++;pen+=400}
      for(var oj=0;oj<labs.length;oj++){var q=labs[oj].p;if(labs[oj]!==Lb&&q[0]>tx-7&&q[0]<tx+lw+7&&q[1]>ty-7&&q[1]<ty+lh+7)pen+=35}
      var sh=0;for(var sj=0;sj<segs.length;sj++){var sg=segs[sj];if(segRect(sg[0],sg[1],sg[2],sg[3],tr0)){pen+=sg[4];sh++}}
      if(hd&&rHit(rr,[hd[0]-4,hd[1]-4,hd[2]-hd[0]+8,hd[3]-hd[1]+8]))pen+=60;
      if(!off){var dd=Math.hypot(tx+lw/2-p[0],ty+lh/2-p[1]);pen+=Math.max(0,dd-34)*.6;if(p[0]>tx-6&&p[0]<tx+lw+6&&p[1]>ty-5&&p[1]<ty+lh+5)pen+=90}
      if(pen<bp){bp=pen;best={x:tx,y:ty,al:cand[ci][2],hit:hit,seg:sh,lw:lw,sc:scl}}}}
    lw=best.lw;
    var labA=sa*(sel?.95:off?.5:.66),shrink=best.sc;
    if(!sel&&best.hit>=1){labA*=Math.max(.6,1-.18*best.hit);shrink*=.88} /* last resort only: fade + shrink, never drop */
    placed.push([best.x,best.y,lw,lh]);
    DBG.labels.push({k:STAR2K[Lb.ki],x:+best.x.toFixed(1),y:+best.y.toFixed(1),w:+lw.toFixed(1),h:lh,a:+labA.toFixed(3),off:off,offX:offX,offY:offY,hit:best.hit,seg:best.seg,halo:best.seg>0,sx:+p[0].toFixed(1),sy:+p[1].toFixed(1)});
    /* last resort for a line the solver could not avoid (rare: the long Gone title in crowded zoomed views): the text gets a
       sky-coloured halo so the line breaks around the letters instead of running through them */
    /* leader tick: a faint hairline from the star toward its label when the label sits more than ~14 px away (1x clusters) */
    if(!off){var nx=Math.max(best.x,Math.min(best.x+lw,p[0])),ny=Math.max(best.y,Math.min(best.y+lh,p[1])),ld=Math.hypot(nx-p[0],ny-p[1]);
      if(ld>14){var ux=(nx-p[0])/ld,uy=(ny-p[1])/ld;c.globalAlpha=labA*.38;c.strokeStyle='rgba(220,232,240,.9)';c.lineWidth=.7;c.beginPath();c.moveTo(p[0]+ux*6,p[1]+uy*6);c.lineTo(nx-ux*3,ny-uy*3);c.stroke();c.lineWidth=1}}
    c.textAlign=best.al>0?'left':best.al<0?'right':'center';var ax=best.al>0?best.x+3:best.al<0?best.x+lw-3:best.x+lw/2;
    c.globalAlpha=labA;c.font='300 '+(fsT*shrink).toFixed(2)+'px Poppins,system-ui,sans-serif';var HL=best.seg>0;if(HL){c.lineJoin='round';c.lineWidth=3.2;c.strokeStyle='rgba(9,14,27,.92)';c.strokeText(ttl,ax,best.y+6)}
    c.fillStyle=sel?'rgba(170,240,210,.98)':'rgba(220,232,240,.95)';c.fillText(ttl,ax,best.y+6);
    c.font='300 '+(fsA*shrink).toFixed(2)+'px Poppins,system-ui,sans-serif';c.fillStyle='rgba(201,211,214,.72)';if(HL){c.strokeText(tr.artist,ax,best.y+17);c.lineWidth=1}c.fillText(tr.artist,ax,best.y+17)}
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
function sweepStep(dt){var held=!!(p0||PZ||nPT());if(held)poke();
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
    for(var i=0;i<CH.length;i++){var c=CH[i];c.w+=(-(900/c.L)*Math.sin(c.th)-damp*c.w)*h;var v=c.w*c.L;if(Math.abs(v)>vmax)c.w=(v>0?vmax:-vmax)/c.L;c.th+=c.w*h}
    for(var i=0;i<CH.length-1;i++){var A=CH[i],B=CH[i+1],xa=bob(A)[0],xb=bob(B)[0],g0=B.rx-A.rx,ct=g0-9;
      if(xb-xa<ct){var va=A.w*A.L,vb=B.w*B.L,rel=va-vb;
        if(rel>0){var m=(va+vb)/2,e=.4;A.w=(m-e*rel/2)/A.L;B.w=(m+e*rel/2)/B.L;var vel=Math.min(1,rel/(rm?60:110));
          if(vel>.04){if(chT-A.lc>.09){A.lc=chT;chime(A.f,vel,A.v,0)}if(chT-B.lc>.09){B.lc=chT;chime(B.f,vel*.7,B.v,.014)}A.fl=Math.max(A.fl,vel);B.fl=Math.max(B.fl,vel)}}
        var ov=(ct-(xb-xa))/2;A.th-=ov/A.L;B.th+=ov/B.L}}}
  for(var i=0;i<CH.length;i++){var c=CH[i];c.fl*=Math.exp(-dt*3);if(Math.abs(c.th)<2e-4&&Math.abs(c.w)<2e-3){c.th=0;c.w=0}}}
function chActive(){return mode==='sky'}
function segD(x,y,c){var b=bob(c),dx=b[0]-c.px,dy=b[1]-c.py,t=Math.max(0,Math.min(1,((x-c.px)*dx+(y-c.py)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-c.px-dx*t,y-c.py-dy*t)}
function chHit(sx,sy,r){var q=toBase(sx,sy),x=q[0],y=q[1],s=VW.s,best=null,bd=(r||24)/s;for(var i=0;i<CH.length;i++){var c=CH[i],b=bob(c),d=Math.min(segD(x,y,c)+(y<c.py+8/s?99:0),Math.hypot(x-b[0],y-b[1])-4/s);if(d<bd){bd=d;best=c}}return best}
/* the breeze: wind = swipe velocity (capped low), felt most by the strand under the finger, a little by all of them */
function wind(x,y,vx,vy,dt){var rm=RM.matches,cap=rm?320:640,sp=Math.hypot(vx,vy);if(sp>cap){vx*=cap/sp;vy*=cap/sp}
  for(var i=0;i<CH.length;i++){var c=CH[i],d=segD(x,y,c),wg=.12+.88*Math.exp(-d*d/(2*60*60)),f=vx+.25*Math.abs(vy)*(c.rx<x?-1:1);c.w+=f*.42*wg*(.3+1.4*rnd(i*7.1+chT*61))*dt/c.L}}
function pluck(c,x){var rm=RM.matches,dir=x<bob(c)[0]?1:-1;c.w+=dir*(rm?12:22)/c.L;c.fl=Math.max(c.fl,.6);chime(c.f,.5,c.v,0)}
/* synth: struck-tube partials (1, 2.76, 5.4) with their own decays, on a soft bus that sits under the track, 8 voices max */
var CB=null,VOX=[],unl=false,CHN=0;
function unlock(){if(REC)return;try{initAudio();if(WANT&&au.paused&&(mode==='in'||mode==='diving'))au.play().catch(function(){});if(!AC)return;wakeAC();if(!unl){var b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0);unl=true}}catch(x){}}
['pointerdown','touchend','pointerup','keydown','click'].forEach(function(t){addEventListener(t,unlock,{capture:true,passive:true})});
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
function ui(){var t=railT,si=secAt(t),key=t.toFixed(1)+si+au.paused;if(key===lastUI)return;lastUI=key;
  var pc=t/T.dur*100;fillE.style.width=pc+'%';headE.style.left=pc+'%';$('tc').textContent=mmss(t)+' / '+mmss(T.dur);
  $('sn').textContent=ROMAN[si]+' · '+SECS[si].name;$('crumbSec').textContent=mode==='sky'?'':' · '+T.title;
  [].forEach.call(rail.querySelectorAll('.tk'),function(e,k){e.classList.toggle('on',k===si)});rail.setAttribute('aria-valuenow',t.toFixed(0));
  $('pp').textContent=au.paused?'▶':'❚❚';$('pp').setAttribute('aria-label',au.paused?'play':'pause');drawWF()}
function goIn(){if(mode==='in'||mode==='diving')return;initAudio();wakeAC();vol(1,.3);WANT=true;au.play().catch(function(){});
  mode='diving';sk.dataset.mode='diving';if(!REC&&history.state!=='in')history.pushState('in','')}
function goOut(fromPop){if(mode==='sky'||mode==='rising')return;WANT=false;mode='rising';sk.dataset.mode='rising';vol(0,.5);pauseAt=VT+1.6;if(!REC)setTimeout(function(){if(mode!=='in'&&mode!=='diving')au.pause()},1600);
  if(!fromPop&&!REC&&history.state==='in')history.back()}
$('dive').onclick=function(e){e.stopPropagation();goIn()};
$('rise').onclick=function(e){e.stopPropagation();goOut()};
$('pp').onclick=function(){if(au.paused){vol(1);WANT=true;au.play().catch(function(){})}else{WANT=false;au.pause()}};
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
/* the recentre after zooming back to 1x is cancelled only by a new touch/click or an arrow-key pan (not by -, +, Ctrl, key repeat) */
addEventListener('pointerdown',function(){RC=0},{capture:true,passive:true});
addEventListener('keydown',function(e){if(/^Arrow/.test(e.key)&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&e.target!==rail)RC=0},{capture:true,passive:true});
addEventListener('pointermove',function(e){if(e.buttons||e.pointerType==='touch')poke()},{capture:true,passive:true});
addEventListener('keydown',function(e){if(e.key==='Escape')goOut();if(e.key===' '&&mode==='in'){e.preventDefault();$('pp').onclick()}
  if(e.target===rail||e.altKey||e.ctrlKey||e.metaKey)return;var k=e.key;
  if(mode==='sky'){var st=e.shiftKey?120:48,ax=k==='ArrowLeft'?1:k==='ArrowRight'?-1:0,ay=k==='ArrowUp'?1:k==='ArrowDown'?-1:0;
    if(ax||ay){e.preventDefault();V.x+=ax*st;V.y+=ay*st;clampPan()}
    else if(k==='+'||k==='='||k==='-'||k==='_'){e.preventDefault();zoomAt(V.z*(k==='+'||k==='='?1.25:.8),W/2,H*.46)}}
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
    for(var i=0;i<CH.length&&!HN;i++){var c=CH[i],b=bob(c);for(var s=0;s<=6;s++){var f=s/6,sx=W/2+(c.px+(b[0]-c.px)*f-W/2)*VW.s+VW.x,sy=H*.46+(c.py+(b[1]-c.py)*f-H*.46)*VW.s+VW.y;
      if(inR(sx,sy,r,10)){HN=true;break}}}}
  HA+=((HN?.22:1)-HA)*Math.min(1,dt*10);
  IN.style.setProperty('--ia',IA.toFixed(3));IN.style.setProperty('--ha',HA.toFixed(3));IN.classList.toggle('zoomed',IA<.6)}
/* dead zone: a near miss on the visible UI (intro block when shown, the heading, the header) never counts as "tap empty sky to dive" */
/* (merged) the intro's rects count even when faded while zoomed, so a missed tap there never dives; strands/stars under
   the faded intro still win because they are tested before this */
function nearUI(x,y){if(!UR)uiRects();if(inR(x,y,UR.head,22))return true;if(inR(x,y,UR.intro,10))return true;
  for(var i=0;i<UR.ui.length;i++)if(inR(x,y,UR.ui[i],26))return true;
  for(var i=0;i<UR.hud.length;i++)if(inR(x,y,UR.hud[i],16))return true;return false}
/* canvas (merged): sky tap (<12 px move) = song star (12 px, press <280 ms) > strand note (press <400 ms, as live) > song star (28 px) > empty sky = dive (outside the dead zone).
   a still hold (>=280 ms on sky/star) and release does nothing: it is how you stop the sweep. inside: tap = pause, swipe down = rise.
   a one-finger (or mouse/pen) drag that STARTS within 40 px of a strand = wind (sways + chimes) at every zoom, never pans;
   one that starts on empty sky = pan. two fingers = pinch-zoom + pan together. wheel zooms at the cursor. */
var p0=null,TAPD=12,TAPT=400,TAPS=280,PT={},PZ=null,afterPinch=false;
function tnow(e){return REC?VT:e.timeStamp/1000}
function pressMs(e){var d=(tnow(e)-p0.t0)*1000;return d>=0&&d<60000?d:performance.now()-p0.t}
function nPT(){return Object.keys(PT).length}
function two(){var k=Object.keys(PT),a=PT[k[0]],b=PT[k[1]];return{d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2}}
function zoomable(){return mode==='sky'}
function pinchStart(t){var q=two();PZ={d0:Math.max(10,q.d),z0:V.z,b0:[W/2+(q.mx-W/2-V.x)/V.z,H*.46+(q.my-H*.46-V.y)/V.z]}}
function pinchMove(t){var q=two(),z=Math.max(ZMIN,Math.min(ZMAX,PZ.z0*q.d/PZ.d0));
  /* the sky point that was under the fingers' midpoint stays under it: spread = zoom, move together = pan */
  V.z=z;V.x=q.mx-W/2-(PZ.b0[0]-W/2)*z;V.y=q.my-H*.46-(PZ.b0[1]-H*.46)*z;clampPan()}
/* release: nothing to do. the view is already exactly where the fingers left it */
function pinchEnd(t){PZ=null}
cv.addEventListener('pointerdown',function(e){PT[e.pointerId]={x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId)}catch(x){}
  if(nPT()>=2){p0=null;afterPinch=true;if(zoomable()&&!PZ)pinchStart(tnow(e));return}
  if(afterPinch)return;
  p0={x:e.clientX,y:e.clientY,t:performance.now(),t0:tnow(e),lx:e.clientX,ly:e.clientY,lt:tnow(e),sw:false,vx:0,vy:0,pan:false};
  if(zoomable()&&!chHit(e.clientX,e.clientY,40))p0.pan=true;
  if(REC)fing={x:e.clientX,y:e.clientY,a:.5,on:true}});
cv.addEventListener('pointermove',function(e){var P=PT[e.pointerId];if(P){P.x=e.clientX;P.y=e.clientY}if(fing){fing.x=e.clientX;fing.y=e.clientY}
  if(PZ){if(nPT()>=2&&zoomable())pinchMove(tnow(e));return}
  if(!p0)return;
  var sw0=p0.sw;if(!p0.sw&&Math.hypot(e.clientX-p0.x,e.clientY-p0.y)>=TAPD)p0.sw=true;
  var t=tnow(e),dt=Math.max(1/120,t-p0.lt),vx=(e.clientX-p0.lx)/dt,vy=(e.clientY-p0.ly)/dt;p0.vx=p0.vx*.4+vx*.6;p0.vy=p0.vy*.4+vy*.6;
  if(p0.sw){if(p0.pan){if(zoomable()){var fx=sw0?p0.lx:p0.x,fy=sw0?p0.ly:p0.y;V.x+=e.clientX-fx;V.y+=e.clientY-fy;clampPan()}}
    else if(chActive()){var q=toBase(e.clientX,e.clientY);wind(q[0],q[1],p0.vx,p0.vy,Math.min(dt,.05))}}
  p0.lx=e.clientX;p0.ly=e.clientY;p0.lt=t});
function cvUp(e){delete PT[e.pointerId];if(fing)fing.on=false;
  if(PZ&&nPT()<2)pinchEnd(tnow(e));
  if(afterPinch){if(nPT()===0)afterPinch=false;p0=null;return}
  if(!p0)return;var dy=e.clientY-p0.y,dx=e.clientX-p0.x,tap=Math.abs(dx)+Math.abs(dy)<TAPD,pd=pressMs(e),quick=pd<TAPT;
  if(p0.pan&&p0.sw){p0=null;return}
  if(chActive()){if(tap&&quick){var sq=pd<TAPS,hs=starHit(p0.x,p0.y,12),hc=chHit(p0.x,p0.y),hit=null;
      /* a tap on the strand just below its star (>= 11 px down) rings the strand, not the star */
      if(hs>=0&&hc&&p0.y-skyProj[hs][1]>=11)hs=-1;if(hs<0)hit=hc;if(hs<0&&!hit)hs=starHit(p0.x,p0.y,28);
      if(hs>=0){if(sq){SPK++;pickTrack(STAR2K[hs],true)}}else if(hit)pluck(hit,toBase(p0.x,p0.y)[0]);else if(sq&&!nearUI(p0.x,p0.y)){CVD++;goIn()}}}
  else if(mode==='in'&&dy>80&&Math.abs(dx)<dy)goOut();else if(tap&&mode==='in')$('pp').onclick();p0=null}
cv.addEventListener('pointerup',cvUp);cv.addEventListener('pointercancel',function(e){delete PT[e.pointerId];if(fing)fing.on=false;if(PZ&&nPT()<2)pinchEnd(tnow(e));if(nPT()===0)afterPinch=false;p0=null});
cv.addEventListener('wheel',function(e){if(!zoomable())return;e.preventDefault();
  var d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?H:1);zoomAt(V.z*Math.exp(-d*(e.ctrlKey?.01:.0015)),e.clientX,e.clientY)},{passive:false});
/* rail: drag flies the camera; audio follows on release (soft while dragging), like Scope's scrub */
var dragging=false,PR=null,seekQ=0;
function railTime(e){var r=rail.getBoundingClientRect();return Math.max(0,Math.min(T.dur-.05,(e.clientX-r.left)/r.width*T.dur))}
rail.addEventListener('pointerdown',function(e){PR=e.pointerId;try{rail.setPointerCapture(PR)}catch(x){}dragging=true;rail.classList.add('drag');vol(.25,.05);scrub(railTime(e))});
rail.addEventListener('pointermove',function(e){if(PR===e.pointerId)scrub(railTime(e))});
function scrub(t){railT=t;tz=ringAt(t);var n=performance.now();if(n-seekQ>140){seekQ=n;au.currentTime=t}}
function pup(e){if(PR!==e.pointerId)return;PR=null;rail.classList.remove('drag');au.currentTime=railTime(e);dragging=false;vol(au.paused?0:1,.15);if(au.paused&&mode==='in'){vol(1);WANT=true;au.play().catch(function(){})}}
rail.addEventListener('pointerup',pup);rail.addEventListener('pointercancel',pup);
rail.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?5:e.key==='ArrowLeft'?-5:0;if(d){au.currentTime=Math.max(0,Math.min(T.dur,au.currentTime+d));tz=ringAt(au.currentTime)}});
au.addEventListener('ended',function(){au.currentTime=0;tz=0;au.play().catch(function(){})});
/* back from the lock screen / another tab / bfcache: wake the chime context; the song itself resumes on the next tap (WANT) */
addEventListener('pageshow',wakeAC);document.addEventListener('visibilitychange',function(){if(!document.hidden)wakeAC()});
addEventListener('resize',function(){rs();clampPan();uiRects()});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){uiRects();if(V.z<1.001&&mode==='sky'){fitLayout();clampPan()}});
pickTrack(TK);rs();if(!REC)requestAnimationFrame(frame);else{last=0;tick(0,0)}
window.__sk={played:function(){return{n:CHN,vox:VOX.length,ac:AC&&AC.state}},chimes:function(){var l=CHL;CHL=[];return l},ch:function(){return CH.map(function(c){var b=bob(c);return{x:b[0],y:b[1],px:c.px,py:c.py,th:c.th,w:c.w}})},step:function(n,dt){for(var i=0;i<n;i++)step(dt)},ready:function(){return !!PCM},goIn:goIn,goOut:goOut,log:function(){var l=LOG;LOG=[];return l},state:function(){return{mode:mode,t:au.currentTime,dive:dive}},view:function(){return{z:V.z,x:V.x,y:V.y,pinch:!!PZ}},viewSet:function(z,x,y){poke();V.z=Math.max(ZMIN,Math.min(ZMAX,z));V.x=x||0;V.y=y||0;clampPan();zHi=V.z;RC=0},rc:function(){return RC},ui:function(){return{ia:IA,ha:HA,headNear:HN,zoomed:IN.classList.contains('zoomed'),rects:UR}},nearUI:nearUI,cvDives:function(){return CVD},chHit:function(x,y,r){var c=chHit(x,y,r);return c?CH.indexOf(c):-1},tracks:function(){return KEYS.slice()},dbg:function(){return DBG},skyProj:function(){return skyProj.map(function(p){return p?[p[0],p[1]]:null})},safeBand:safeBand,fit:function(){return{s:FIT.s,dy:FIT.dy}},vw:function(){return{s:VW.s,x:VW.x,y:VW.y}},paused:function(){return au.paused},starHit:starHit,pick:pickTrack,sel:function(){return{k:TK,star:highlight,picks:SPK}},sweep:function(){return{on:SW.on,idle:SW.idle,w:SW.w,t:SW.t,moved:SW.moved}},sweepOn:function(b){SW.on=!!b;poke()},ffx:function(){return FFX},notes:function(){var l=NOTES;NOTES=[];return l}};
})();
