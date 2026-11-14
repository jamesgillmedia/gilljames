/* proto-shell · the Sound waveform player: the dotted star-chart waveform + the player bar. CORE: mounted once, never removed.
   Shape: media/sound-shape.json = SH.sound from tonight/fable-m4/js/sky.js (the same stars the sky draws as the Sound constellation).
   Rail: the proto-lab sound-starchart paintRail (dotted mini waveform of the spine stars, white playhead), played dots in ink, the rest dim
   (mint is for new only, STANDARDS §4). Song stars: the m4 player's mapping (No Problem 2, Gone 5, To Go 7,
   Lost in Time 10, = 13, ii 4). Titles/artists/files: data/tracks.json (= tonight/fable-m4/data.json tracks).
   Volume is gj.vol (the same key the m4 player and tune.js use). A watchdog re-mounts the dock if anything removes it. */
(function(w){
'use strict';
var STAR={noproblem:2,gone:5,togo:7,lostintime:10,equals:13,ii:4};
function mmss(s){s=Math.max(0,s|0);return (s/60|0)+':'+(s%60<10?'0':'')+(s%60|0)}
function lsr(k,d){try{var v=parseFloat(localStorage.getItem(k));return isFinite(v)?Math.max(0,Math.min(1,v)):d}catch(x){return d}}
function Wave(shape,tracks,peaks){
  var V={shape:shape,tracks:tracks,sel:3,au:new Audio(),el:null,peaks:peaks||null,lit:null,amt:0,G:null,look:{b:1,t:1},fp:{floor:380,q:.8,type:'lp'}},RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var au=V.au;au.preload='metadata';au.volume=lsr('gj.vol',1);
  addEventListener('storage',function(e){if(e.key==='gj.vol')au.volume=lsr('gj.vol',1);if(e.key==='gj.sound.invert')paint()});
  V.starOf=function(i){return STAR[tracks[i].k]};
  V.trackAtStar=function(si){for(var i=0;i<tracks.length;i++)if(STAR[tracks[i].k]===si)return i;return -1};
  /* the star chart of one song: its own loudness (the released track's peaks, data/peaks.json) as a dotted polyline; without peaks, the shared Sound shape */
  var PC={};
  function ptsOf(i){var k=tracks[i].k;if(PC[k])return PC[k];var pk=V.peaks&&V.peaks[k];
    if(!pk)return PC[k]=shape.s.filter(function(p){return p[3]===0}).map(function(p){return [p[0],p[1]]});
    var P=pk.peaks,L=P.length,n=24,m=[],j,a,b,s,q,sorted=P.slice().sort(function(x,y){return x-y}),hi=sorted[Math.floor(L*.92)]||1,lo=sorted[Math.floor(L*.04)]||0;
    for(j=0;j<n;j++){a=Math.floor(j/n*L);b=Math.max(a+1,Math.floor((j+1)/n*L));s=0;for(q=a;q<b;q++)s+=P[q];m.push(s/(b-a))}
    return PC[k]=m.map(function(v,j){var u=Math.max(0,Math.min(1,(v-lo)/((hi-lo)||1)));return [j/(n-1),.84-Math.pow(u,.8)*.7]})}
  V.pts=ptsOf;
  /* the pull filter: a low-pass in a Web Audio graph made on the first gesture; amount 0 = open (20 kHz), 1 = closed (about 380 Hz); released smoothly */
  function graph(){
    if(V.G)return V.G;var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    try{var c=new AC(),src=c.createMediaElementSource(au),lp=c.createBiquadFilter(),bp=c.createBiquadFilter(),dry=c.createGain(),wet=c.createGain();
      lp.type='lowpass';lp.frequency.value=20000;lp.Q.value=.8;bp.type='bandpass';bp.frequency.value=20000;bp.Q.value=1.2;dry.gain.value=1;wet.gain.value=0;
      src.connect(lp);lp.connect(dry);dry.connect(c.destination);src.connect(bp);bp.connect(wet);wet.connect(c.destination);V.G={c:c,f:lp,lp:lp,bp:bp,dry:dry,wet:wet}}catch(e){return null}
    return V.G}
  function wake(){if(V.G&&V.G.c.state==='suspended')V.G.c.resume().catch(function(){})}
  /* character A: a low-pass closed by the pull; B: a band-pass sweep crossfaded in; every change is a ramp (setTargetAtTime), never a jump, so nothing clicks */
  V.filter=function(amt,instant){
    amt=Math.max(0,Math.min(1,amt||0));var up=amt>V.amt;V.amt=amt;var G=graph();if(!G)return;wake();var fp=V.fp,t=G.c.currentTime,tau=(instant||RM)?.005:(up?.08:.22);
    var hz=amt<=0?20000:20000*Math.pow(Math.max(60,fp.floor)/20000,Math.pow(amt,.75));
    [G.lp.frequency,G.lp.Q,G.bp.frequency,G.bp.Q,G.dry.gain,G.wet.gain].forEach(function(p){p.cancelScheduledValues(t)});
    if(fp.type==='bp'){G.lp.frequency.setTargetAtTime(20000,t,tau);G.lp.Q.setTargetAtTime(.8,t,tau);G.bp.frequency.setTargetAtTime(Math.min(hz*1.4+120,20000),t,tau);G.bp.Q.setTargetAtTime(fp.q+.6,t,tau);G.dry.gain.setTargetAtTime(1-amt*.9,t,tau);G.wet.gain.setTargetAtTime(amt*1.5,t,tau)}
    else{G.lp.frequency.setTargetAtTime(hz,t,tau);G.lp.Q.setTargetAtTime(fp.q,t,tau);G.bp.frequency.setTargetAtTime(20000,t,tau);G.dry.gain.setTargetAtTime(1,t,tau);G.wet.gain.setTargetAtTime(0,t,tau)}};
  V.filterParams=function(o){for(var k in o)V.fp[k]=o[k];if(V.G||V.amt>0)V.filter(V.amt)};
  V.ctx=function(){var G=graph();if(G)wake();return G&&G.c};
  /* waveform look: brightness (a colour scale, never below .8) and thickness (never below .8); the player can not go dim or vanish */
  V.setLook=function(b,t){b=Math.max(.8,Math.min(1.4,b));t=Math.max(.8,Math.min(2.5,t));if(Math.abs(b-V.look.b)<.002&&Math.abs(t-V.look.t)<.002)return;V.look.b=b;V.look.t=t;paint()};
  /* a stretch of the song to light (fractions 0..1 of its length), or null */
  V.light=function(a,b){V.lit=a==null?null:{a:Math.max(0,Math.min(1,a)),b:Math.max(0,Math.min(1,b))};paint()};
  function mount(){
    var d=document.createElement('section');d.id='snd';d.setAttribute('aria-label','sound player');
    d.innerHTML='<button type="button" class="pp" aria-label="play"><i></i></button><div class="who"><b></b><span></span></div><span class="tc">0:00</span>'+
      '<div class="rail" aria-label="seek"><canvas></canvas></div>';
    document.body.appendChild(d);V.el=d;
    d.querySelector('.pp').onclick=function(e){e.stopPropagation();wake();if(au.paused){au.play().catch(function(){})}else au.pause()};
    var rail=d.querySelector('.rail');
    function seek(e){var r=rail.getBoundingClientRect(),u=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));if(au.duration)au.currentTime=u*au.duration;paint()}
    rail.addEventListener('pointerdown',function(e){e.stopPropagation();seek(e);try{rail.setPointerCapture(e.pointerId)}catch(x){}});
    rail.addEventListener('pointermove',function(e){if(e.buttons)seek(e)});
    d.addEventListener('pointerdown',function(e){e.stopPropagation()});
    show();paint();
  }
  function show(){var t=tracks[V.sel];V.el.querySelector('.who b').textContent=t.title;V.el.querySelector('.who span').textContent=t.artist;
    V.el.querySelector('.tc').textContent=mmss(au.currentTime)+' / '+(au.duration?mmss(au.duration):'–:––')}
  function paint(){
    var c=V.el&&V.el.querySelector('.rail canvas');if(!c)return;var dpr=Math.min(2,devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;
    if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
    var q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,0,0);q.clearRect(0,0,w,h);
    var xs=ptsOf(V.sel),head=au.duration?au.currentTime/au.duration:0;
    /* Sound invert (gj.sound.invert, 0-100, tune menu > sound): 0 = the chart as written, 100 = flipped top to bottom about its own middle;
       in between the chart eases through flat. Only the rail is drawn from this; the song stars in the sky keep their places. */
    var lo=1,hi=0;xs.forEach(function(p){lo=Math.min(lo,p[1]);hi=Math.max(hi,p[1])});
    var iv=parseFloat(localStorage.getItem('gj.sound.invert'));iv=isFinite(iv)?Math.max(0,Math.min(100,iv))/100:0;
    var mid=(lo+hi)/2,fl=1-2*iv;function Y(v){return h*.15+(mid+(v-mid)*fl)*h*.7}
    var C=window.GJ_THEME?window.GJ_THEME.pal:null,gold=C&&C.adj==='sound'&&C.name==='red';
    var cLine=C?C.railLine:'rgba(230,214,200,.38)',cOn=gold?'rgba(232,196,138,.98)':C?C.railOn:'rgba(238,243,245,.95)',cOff=gold?'rgba(232,196,138,.55)':C?C.railOff:'rgba(201,211,214,.4)',cSOn=gold?'#e8c48a':C?C.railStarOn:'#eef3f5',cSOff=gold?'rgba(232,196,138,.85)':C?C.railStarOff:'rgba(201,211,214,.7)',cHead=C?C.railHead:'#fff';
    /* the other songs, ghosted: their star charts behind this one */
    var LB=V.look.b,LT=V.look.t;function sc(c){if(LB===1)return c;var m=/^#([0-9a-f]{6})$/i.exec(c);if(m){var h=m[1];return 'rgb('+Math.min(255,parseInt(h.substr(0,2),16)*LB|0)+','+Math.min(255,parseInt(h.substr(2,2),16)*LB|0)+','+Math.min(255,parseInt(h.substr(4,2),16)*LB|0)+')'}var r=/^rgba?\(([^)]*)\)$/.exec(c);if(!r)return c;var p=r[1].split(',').map(Number);return 'rgba('+Math.min(255,p[0]*LB|0)+','+Math.min(255,p[1]*LB|0)+','+Math.min(255,p[2]*LB|0)+','+(p.length>3?p[3]:1)+')'}
    cLine=sc(cLine);cOn=sc(cOn);cOff=sc(cOff);cSOn=sc(cSOn);cSOff=sc(cSOff);cHead=sc(cHead);
    q.strokeStyle=cLine;q.lineWidth=LT;q.globalAlpha=.16;tracks.forEach(function(t,ti){if(ti===V.sel)return;var g=ptsOf(ti);q.beginPath();g.forEach(function(p,i){var x=p[0]*w,y=Y(p[1]);if(i)q.lineTo(x,y);else q.moveTo(x,y)});q.stroke()});q.globalAlpha=1;
    q.strokeStyle=cLine;q.lineWidth=LT;q.beginPath();
    xs.forEach(function(p,i){var x=p[0]*w,y=Y(p[1]);if(i)q.lineTo(x,y);else q.moveTo(x,y)});q.stroke();
    /* the dotted waveform itself: a fine dot run between the stars, ink up to the head */
    for(var i=0;i<xs.length-1;i++){var a=xs[i],b=xs[i+1],n=Math.max(2,Math.round(Math.hypot((b[0]-a[0])*w,(Y(b[1])-Y(a[1])))/5));
      for(var j=0;j<n;j++){var u=j/n,x=(a[0]+(b[0]-a[0])*u)*w,y=Y(a[1]+(b[1]-a[1])*u);q.fillStyle=x/w<head?cOn:cOff;q.fillRect(x-.6*LT,y-.6*LT,1.2*LT,1.2*LT)}}
    xs.forEach(function(p){var x=p[0]*w,y=Y(p[1]);q.fillStyle=x/w<head?cSOn:cSOff;q.beginPath();q.arc(x,y,1.7*LT,0,6.283);q.fill()});
    if(V.lit){var L=V.lit,lx=L.a*w,lw=Math.max(14,(L.b-L.a)*w);q.fillStyle=cOn.replace(/[\d.]+\)$/,'.10)');q.fillRect(lx,2,lw,h-4);q.setLineDash([3,3]);q.strokeStyle=cOn.replace(/[\d.]+\)$/,'.55)');q.lineWidth=1;q.strokeRect(lx+.5,2.5,lw-1,h-5);q.setLineDash([]);
      xs.forEach(function(p){if(p[0]>=L.a&&p[0]<=L.b){q.fillStyle=cSOn;q.beginPath();q.arc(p[0]*w,Y(p[1]),2.9,0,6.283);q.fill()}})}
    q.fillStyle=cHead;q.fillRect(head*w-.5*LT,2,LT,h-4);q.beginPath();q.arc(head*w,h/2,2.6*LT,0,6.283);q.fill();
  }
  V.repaint=function(){paint()};
  V.pick=function(i,play){if(i<0||i>=tracks.length)return;wake();var was=!au.paused;V.sel=i;au.src=tracks[i].file;au.load();if(play||was)au.play().catch(function(){});show();paint()};
  V.head=function(){return au.duration?au.currentTime/au.duration:0};
  au.addEventListener('timeupdate',function(){show();paint()});au.addEventListener('loadedmetadata',function(){show();paint()});
  au.addEventListener('play',function(){V.el.classList.add('on')});au.addEventListener('pause',function(){V.el.classList.remove('on')});
  au.addEventListener('ended',function(){V.el.classList.remove('on')});
  addEventListener('resize',paint);if(w.GJ_THEME)w.GJ_THEME.on(function(){paint()});
  mount();V.pick(V.sel,false);
  /* watchdog: the player is never lost */
  setInterval(function(){if(!V.el||!document.body.contains(V.el)){mount()}},1000);
  V.check=function(){var e=V.el,c=e&&e.querySelector('.rail canvas');return {filter:{amt:+V.amt.toFixed(3),hz:V.G?Math.round(V.G.lp.frequency.value):20000,bp:V.G?Math.round(V.G.bp.frequency.value):20000,wet:V.G?+V.G.wet.gain.value.toFixed(2):0,graph:!!V.G,type:V.fp.type},look:V.look,lit:V.lit,dock:!!e&&document.body.contains(e),visible:!!e&&e.getBoundingClientRect().height>0&&getComputedStyle(e).display!=='none',
    playButton:!!(e&&e.querySelector('.pp')),rail:!!c&&c.width>0,shapeStars:shape.s.length,track:tracks[V.sel].title,playing:!au.paused,t:+au.currentTime.toFixed(2)}};
  return V;
}
w.ShellWave=Wave;
})(window);
