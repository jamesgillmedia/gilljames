/* proto-shell · the SOUND room (a core room, so every ?m= module has it). After Sketch's motion targets (sound-phone.mp4, sound-desktop.mp4) and the
   player sketch (tonight/fable-m4/player): the Sound constellation, one star per song (the six released tracks in data/tracks.json; their audio is in media/audio).
   Level 1 = the constellation (tapping Sound lands here, no grid step); level 2 = DIVE, the deepest level: you are inside the song's pattern (rings from its own loudness, flown by the
   player's rail). A finger or cursor PULLS a song star: it follows the pointer on a spring, the lines bend toward it, the matching stretch of the song's star chart lights in the player,
   and the pull is an audio filter (closed by the pull distance, released smoothly). A swipe over a chime strand sways it; a tap plays its note (C major pentatonic). A tap on empty sky dives.
   Zoom is the camera's own (a quick pinch or wheel snaps to a level, a slow one stays free, pan at any depth). A long sweeping camera drifts the pan (never the zoom) after the view has been left
   alone, pauses on touch and runs at varied speeds. 3D: the 4:45 blend's depth layers and tilt (core/sky.js proj), reused, with a depth and a tilt slider. No imagery anywhere in the room.
   Sliders: GJ_SOUND.rows() feeds the tune menu (deep tuning, only Sound while you are here); the art itself carries a few (pull a star = the filter, drag the top edge = star glow).
   Every value is eased, every audio change is a ramp (nothing clicks), values persist per room (gj.sound.*), Reduce Motion: identical layout, nothing moves.
   Out, always: the mark (menu), ‹, Esc, browser Back; a pull is let go first. The waveform player is never covered, dimmed or lost. */
(function(w){
'use strict';
function clamp(v,a,b){return v<a?a:v>b?b:v}
function sstep(a,b,v){var u=clamp((v-a)/(b-a),0,1);return u*u*(3-2*u)}
function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
/* ---------- the sliders: name, range, default (the main build's look) ---------- */
var DEF=[
 ['sweep','camera sweep speed',0,200,50],['sweepLen','camera sweep length',20,200,100],['drift','constellation drift',0,200,40],
 ['depth','depth',0,200,100],['tilt','tilt (perspective)',0,200,100],['glow','star glow',0,200,100],['size','star size',50,200,100],
 ['bend','line bend',0,200,100],['fAmt','filter amount',0,100,100],['fFloor','filter cutoff (low end, Hz)',100,4000,380],['fQ','filter resonance',3,120,8],
 ['sway','chime sway',0,200,100],['resp','chime response',0,200,100],['wfB','waveform brightness',80,140,100],['wfT','waveform thickness',80,250,100],
 ['fog','fog and atmosphere',0,100,30],['rBright','red brightness',60,140,100],['rGlow','red glow depth',0,200,100]];
var K={},T={},E={};DEF.forEach(function(d){K[d[0]]=d});
function lsGet(k){try{var v=localStorage.getItem('gj.sound.'+k);if(v==null||v==='')return null;v=+v;return isFinite(v)?v:null}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem('gj.sound.'+k,String(v))}catch(e){}}
function reload(){DEF.forEach(function(d){var v=lsGet(d[0]);T[d[0]]=v==null?d[4]:clamp(v,d[2],d[3]);if(E[d[0]]==null)E[d[0]]=T[d[0]]})}
reload();
function variant(){var sh=w.__shell;if(sh&&sh.mod&&sh.mod.id==='sound'&&sh.variant)return sh.variant;try{return localStorage.getItem('gj.sound.var')||'A'}catch(e){return 'A'}}
var VARHINT={A:'A · low-pass pull, linear camera sweep (main)',B:'B · band-pass sweep on the pull',C:'C · low-pass, figure-eight camera sweep'};
function setVariant(v){v=VARHINT[v]?v:'A';try{localStorage.setItem('gj.sound.var',v)}catch(e){}var sh=w.__shell;if(sh&&sh.mod&&sh.mod.id==='sound')sh.setVariant(v);if(w.GJ_SOUND)GJ_SOUND.onVariant&&GJ_SOUND.onVariant(v)}
function rows(){
  var out=[{k:'gj.sound.var',label:'dev · A B C',toggle:true,options:[['A','A'],['B','B'],['C','C']],get:variant,set:setVariant,apply:function(){},hint:function(){return VARHINT[variant()]}}];
  DEF.forEach(function(d){
    if((d[0]==='rBright'||d[0]==='rGlow')&&!(w.GJ_THEME&&GJ_THEME.eff==='red'))return;
    out.push({k:'gj.sound.'+d[0],label:d[1],min:d[2],max:d[3],def:d[4],hook:'ls',get:function(){var v=lsGet(d[0]);return v==null?d[4]:Math.round(v)},
      apply:function(v,save){v=clamp(+v,d[2],d[3]);T[d[0]]=v;if(save)lsSet(d[0],v)}})});
  return out}
w.GJ_SOUND={rows:rows,reload:reload,get:function(k){return E[k]},target:function(k){return T[k]},vals:function(){return JSON.parse(JSON.stringify(E))},defaults:DEF,variant:variant,setVariant:setVariant,hints:VARHINT};
/* ---------- the room ---------- */
var NOTES=[523.25,587.33,659.25,783.99,880];/* C5 D5 E5 G5 A5, the pentatonic, left to right */
w.ShellSound=function(sh){
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,S={},list=null,here=false,pull=null,wind=null,edge=null,lastT=0,lastSel=-1,idle=performance.now(),sweepDir=1,sweepAnchor=null,sw={x:0,p:0},near=null,lastFP='',sway=[],lastNote=[0,0,0,0,0],chimeStats={n:0,swaying:0};
  var Pal=w.GJ_THEME?GJ_THEME.pal:{};
  function chapter(){return sh.sky.chapter('sound')}
  function lvl(st){st=st||sh.ladder.cur;return st.k==='sound'?st.lv:0}
  function inRoom(st){return lvl(st)>=1}
  function nbrs(c){if(c._nb)return c._nb;var n=c.stars.map(function(){return []});c.e.forEach(function(e){if(n[e[0]]&&n[e[1]]){n[e[0]].push(e[1]);n[e[1]].push(e[0])}});return c._nb=n}
  function dists(c,from){var d=c.stars.map(function(){return 9}),q=[from];d[from]=0;while(q.length){var a=q.shift();nbrs(c)[a].forEach(function(b){if(d[b]>d[a]+1){d[b]=d[a]+1;q.push(b)}})}return d}
  function bounds(c){if(c._bx)return c._bx;var a=1e9,b=-1e9;c.stars.forEach(function(s){a=Math.min(a,s.x);b=Math.max(b,s.x)});return c._bx=[a,b]}
  function side(){return innerWidth>innerHeight*1.25}
  function dockH(){var d=$('snd');return d?d.getBoundingClientRect().height||96:96}
  function listH(){return side()?0:(sh.wave.tracks.length*(sh.wave.tracks.some(function(t){return t.year||t.length||t.len||t.links})?46:30)+34)}
  /* ---- stops: level 1 = the constellation above / left of the list, level 2 = dive (a step deeper, as the board is) ---- */
  function stop1(W,H){var c=chapter(),b={x0:c.x+c.ex.x0,y0:c.y+c.ex.y0,x1:c.x+c.ex.x1,y1:c.y+c.ex.y1},sd=side(),Wr=sd?W-Math.min(340,W*.34):W,top=64,bot=sd?dockH()+36:dockH()+listH()+24;
    var s=Math.min((Wr-28)/(b.x1-b.x0),(H-top-bot)/(b.y1-b.y0)),cy=(top+(H-bot))/2;
    return {x:(b.x0+b.x1)/2-(Wr/2-W/2)/s,y:(b.y0+b.y1)/2-(cy-H/2)/s,s:s}}
  S.stop=function(st,W,H){if(st.k!=='sound'||st.lv<1||!chapter())return undefined;var a=stop1(W,H);if(st.lv===1)return a;if(st.lv===2)return {x:a.x,y:a.y,s:a.s*1.35};return null};
  S.hide=function(k){return k==='sound'&&inRoom()};
  S.owns=function(){return inRoom()};
  S.levelName=function(lv,st){return st&&st.k==='sound'&&lv===2?'dive':null};
  /* ---- the track list: real data only, one line each ---- */
  function buildList(){
    list=document.createElement('section');list.id='sl';list.setAttribute('aria-label','songs');list.hidden=true;
    var t=sh.wave.tracks,h='<p class="sl-h">'+t.length+' songs</p><ol>';
    /* every shown value comes from data/tracks.json (title / display, artist, year, length, links); nothing is typed here, and no sync claim is made */
    t.forEach(function(r,i){var meta=[r.year,r.length||r.len].filter(Boolean).join(' · '),lk=r.links||{},ln='';
      if(lk.spotify)ln+='<a href="'+esc(lk.spotify)+'" target="_blank" rel="noopener">Spotify</a>';if(lk.apple)ln+=(ln?' · ':'')+'<a href="'+esc(lk.apple)+'" target="_blank" rel="noopener">Apple Music</a>';
      h+='<li><button type="button" data-i="'+i+'"><i></i><b>'+esc(r.display||r.title)+'</b><span>'+esc(r.artist)+'</span>'+(meta?'<small>'+esc(meta)+'</small>':'')+'</button>'+(ln?'<p class="sl-l">'+ln+'</p>':'')+'</li>'});
    list.innerHTML=h+'</ol>';list.hidden=false;document.body.appendChild(list);
    list.addEventListener('pointerdown',function(e){e.stopPropagation()});
    list.addEventListener('click',function(e){if(e.target.closest('a'))return;var b=e.target.closest('button[data-i]');if(!b)return;e.stopPropagation();choose(+b.getAttribute('data-i'))})}
  function choose(i){var V=sh.wave;if(V.sel===i){if(V.au.paused)V.au.play().catch(function(){});else V.au.pause();return}V.pick(i,true)}
  function sync(){var V=sh.wave;if(lastSel===V.sel&&list.getAttribute('data-p')===(V.au.paused?'0':'1'))return;lastSel=V.sel;list.setAttribute('data-p',V.au.paused?'0':'1');
    [].forEach.call(list.querySelectorAll('button'),function(b){var on=+b.getAttribute('data-i')===V.sel;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')})}
  function place(){if(!list)return;var sd=side();list.classList.toggle('side',sd);list.style.bottom=sd?'':(dockH()+12)+'px';list.style.display=(lvl()===1)?'':'none'}
  S.level=function(st){
    var l=lvl(st),now=l>=1;
    if(now&&!sweepAnchor)sweepAnchor=null;
    if(!now&&(pull||wind||edge))S.back();
    here=now;document.documentElement.classList.toggle('in-sound',now);if(list){list.hidden=!now;if(now){lastSel=-1;sync();place()}}
    if(!now){sh.wave.light(null);sweepAnchor=null}else sweepAnchor=null};
  S.back=function(){if(pull)up_pull(0,0,true);if(wind){wind=null}if(edge&&edge.stop){edge.stop();edge=null}if(sh.cam.grab)sh.cam.release();return false};
  /* ---- 3D: the 4:45 blend's depth and tilt, with sliders ---- */
  function proj(cam,x,y,z,o){var zf=cam.zf(),zz=1+(z-1)*(1-sstep(1.6,5,zf)),k=Math.pow(zf,(zz-1)*.38*(E.depth/100)),s=cam.s*k;
    o[0]=cam.W/2+(x-cam.x)*s+cam.tilt.x*(zz-1)*2.2*(E.tilt/100);o[1]=cam.H/2+(y-cam.y)*s+cam.tilt.y*(zz-1)*2.2*(E.tilt/100);o[2]=s;return o}
  function songs(){var V=sh.wave,o=[];for(var i=0;i<V.tracks.length;i++)o.push({ti:i,si:V.starOf(i)});return o}
  var cur=[];/* current screen positions of the stars (with drift and pull) */
  function strands(c){return c.e.slice(0,5)}
  /* ---- chimes: a pentatonic note through the player's audio context (an envelope, never a click) ---- */
  function note(j,vel){
    var V=sh.wave,now=performance.now();if(now-lastNote[j]<110)return;lastNote[j]=now;var ctx=V.ctx&&V.ctx();if(!ctx)return;
    try{var t=ctx.currentTime,o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),vol=Math.max(.02,(+localStorage.getItem('gj.vol')||1))*.5,pk=.11*clamp(vel,.3,1)*vol;
      o.type='sine';o2.type='triangle';o.frequency.value=NOTES[j];o2.frequency.value=NOTES[j]*2.76;var g2=ctx.createGain();g2.gain.value=.22;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+.008);g.gain.exponentialRampToValueAtTime(.0006,t+1.8);
      o.connect(g);o2.connect(g2);g2.connect(g);g.connect(ctx.destination);o.start(t);o2.start(t);o.stop(t+1.9);o2.stop(t+1.9);chimeStats.n++}catch(e){}}
  function ringStrand(j,imp,vel){if(!sway[j])sway[j]={a:0,v:0};if(!RM)sway[j].v+=imp*(.6+.7*E.resp/100);note(j,vel);chimeStats.swaying++}
  function strandHit(c,x,y,r){var ss=strands(c),best=-1,bd=r;ss.forEach(function(e,j){var a=cur[e[0]],b=cur[e[1]];if(!a||!b)return;var bx=b[0]+(sway[j]?sway[j].a*60:0),dx=bx-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1,u=clamp(((x-a[0])*dx+(y-a[1])*dy)/l2,0,1),px=a[0]+dx*u,py=a[1]+dy*u,d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best=j}});return best}
  /* ---- grabs: pull a star, wind a chime, drag the top edge ---- */
  S.grab=function(x,y,e){
    idle=performance.now();if(lvl()!==1)return null;var c=chapter();if(!c||!cur.length)return null;var mouse=e.pointerType==='mouse',r=mouse?22:30,best=null,bd=r*r;
    songs().forEach(function(q){var p=cur[q.si];if(!p)return;var dx=p[0]-x,dy=p[1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=q}});
    if(best){var p0=cur[best.si];pull={ti:best.ti,si:best.si,rx:p0[0],ry:p0[1],px:x,py:y,ox:0,oy:0,vx:0,vy:0,d:0,t0:performance.now(),moved:0,switched:false,rel:false,dist:dists(c,best.si)};return {move:move_pull,up:up_pull}}
    var j=strandHit(c,x,y,mouse?16:22);
    if(j>=0){wind={x:x,y:y,t:performance.now()};ringStrand(j,(x<cur[strands(c)[j][1]][0]?1:-1)*1.6,.6);return {move:function(nx,ny){if(!wind)return;var vx=nx-wind.x;wind.x=nx;wind.y=ny;var k=strandHit(c,nx,ny,mouse?16:22);if(k>=0&&Math.abs(vx)>1.2)ringStrand(k,clamp(vx*.18,-3,3),clamp(Math.abs(vx)/14,.3,1))},up:function(){wind=null}}}
    if(y<46&&x>innerWidth*.18&&x<innerWidth*.82){var v0=T.glow,y0=y,gh=w.GJ_GHOST;edge={stop:function(){if(gh)gh.release()}};
      return {move:function(nx,ny){var v=clamp(v0+(ny-y0)*(200/(innerHeight*.34)),K.glow[2],K.glow[3]);T.glow=v;lsSet('glow',Math.round(v));if(gh)gh.update({name:'star glow',min:K.glow[2],max:K.glow[3],def:K.glow[4],value:v,x:nx<innerWidth/2?0:innerWidth,y:ny})},up:function(){if(gh)gh.release();edge=null}}}
    return null};
  function maxPull(){return Math.min(innerWidth,innerHeight)*.30}
  function move_pull(x,y){
    if(!pull||pull.rel)return;pull.px=x;pull.py=y;var dx=x-pull.rx,dy=y-pull.ry,len=Math.hypot(dx,dy);pull.moved=Math.max(pull.moved,len);
    if(!pull.switched&&len>10){pull.switched=true;var V=sh.wave;if(V.sel!==pull.ti){var was=!V.au.paused;V.pick(pull.ti,was)}}
    pull.d=clamp(len/maxPull(),0,1);
    if(pull.switched){var c=chapter(),b=bounds(c),f=(c.stars[pull.si].x-b[0])/((b[1]-b[0])||1);sh.wave.light(f-.07,f+.07)}}
  function up_pull(x,y,cancel){
    if(!pull)return;var q=pull,tap=!cancel&&q.moved<9&&performance.now()-q.t0<500;
    q.rel=true;sh.wave.filter(0);sh.wave.light(null);if(tap)choose(q.ti);if(RM||cancel)pull=null}
  /* ---- a tap: a chime strand plays its note; empty sky dives; at the dive nothing (the rail and the pinch own it) ---- */
  S.tap=function(x,y){
    idle=performance.now();if(lvl()!==1)return lvl()===2;var c=chapter();if(!c)return false;var j=strandHit(c,x,y,26);
    if(j>=0){ringStrand(j,1.9,.85);return true}
    sh.ladder.go({lv:2,k:'sound'});return true};
  /* ---- the dive: the song's loudness as rings you fly through, one ring per sixth of a second ---- */
  function dive(g,cam,t,ink,hi){
    var V=sh.wave,pk=V.peaks&&V.peaks[V.tracks[V.sel].k],W=cam.W,H=cam.H,F=Math.min(W,H)*1.05,N=40,Kp=26,ds=1/6,dur=(V.au.duration||(pk&&pk.dur)||80),tt=V.au.currentTime||0,fr=(tt/ds)%1,i0=Math.floor(tt/ds);
    function pkAt(time){if(!pk)return .5;var P=pk.peaks,ix=clamp(Math.floor(time/dur*P.length),0,P.length-1);return P[ix]}
    var cx=W/2,cy=H*.44,rg=[],i,k,tx=cam.tilt.x,ty=cam.tilt.y,dep=E.depth/100;
    for(i=N;i>=0;i--){var ti=(i0+i)*ds,z=1+(i-fr)*.36,sc=F/(z*1.6),rr=(.2+1.1*pkAt(ti))*sc*.5,wob=Math.sin(ti*.9)*sc*.07;
      var ox=cx+wob+tx*(1-1/z)*2.2*(E.tilt/100)*dep,oy=cy+Math.cos(ti*.7)*sc*.05+ty*(1-1/z)*2.2*(E.tilt/100)*dep;rg.push({z:z,rr:rr,ox:ox,oy:oy,a:(1-i/N)*(1-E.fog/100*.5*(i/N)),i:i,ti:ti})}
    rg.reverse();
    var pts=rg.map(function(r){var o=[];for(k=0;k<Kp;k++){var a=k/Kp*6.2832+r.ti*.05;o.push([r.ox+Math.cos(a)*r.rr,r.oy+Math.sin(a)*r.rr*.92])}return o});
    g.lineWidth=1;
    for(i=0;i<rg.length-1;i++){var r=rg[i],al=clamp(r.a,0,1);g.strokeStyle='rgba('+ink+','+(.34*al*(E.glow/100)).toFixed(3)+')';g.beginPath();
      for(k=0;k<Kp;k+=4){g.moveTo(pts[i][k][0],pts[i][k][1]);g.lineTo(pts[i+1][k][0],pts[i+1][k][1])}g.stroke();
      if(i%6===0){g.strokeStyle='rgba('+ink+','+(.2*al).toFixed(3)+')';g.beginPath();pts[i].forEach(function(p,q){if(q)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1])});g.closePath();g.stroke()}}
    for(i=rg.length-1;i>=0;i--){var r2=rg[i],al2=clamp(r2.a,0,1),sz=Math.max(.7,2.2/r2.z)*(E.size/100);g.fillStyle='rgba('+(i<3?hi:ink)+','+(.82*al2).toFixed(3)+')';
      for(k=0;k<Kp;k++){var p=pts[i][k];g.fillRect(p[0]-sz/2,p[1]-sz/2,sz,sz)}}
    S.diveInfo={rings:rg.length,t:+tt.toFixed(2)}}
  /* ---- frame ---- */
  S.draw=function(g,cam,t){
    var l=lvl();if(!l){here=false;return}here=true;var c=chapter();if(!c)return;if(!list)buildList();sync();place();
    var dt=lastT?Math.min(.05,(t-lastT)/1000):0;lastT=t;var V=sh.wave,P=w.GJ_THEME?GJ_THEME.pal:{},red=P.name==='red',now=performance.now();
    /* eased values (no jumps), the look and the filter character follow */
    var ka=1-Math.exp(-dt*9);for(var kk in E)E[kk]+=(T[kk]-E[kk])*ka;V.setLook(E.wfB/100,E.wfT/100);
    var vr=variant(),fp={floor:E.fFloor,q:E.fQ/10,type:vr==='B'?'bp':'lp'},sfp=fp.floor+'|'+fp.q.toFixed(2)+'|'+fp.type;if(sfp!==lastFP){lastFP=sfp;V.filterParams(fp)}
    var ink=P.chapter||c.tint,gold='232,196,138',hi=red?'255,200,206':'255,236,230',spr=sh.sky.spr(ink);
    if(l===2){dive(g,cam,t,ink,hi);return}
    /* the pull spring */
    var D=null,B=E.bend/100;
    if(pull){var tx=pull.rel?0:pull.px-pull.rx,ty=pull.rel?0:pull.py-pull.ry,mp=maxPull(),ln=Math.hypot(tx,ty),kq=ln>mp*1.2?mp*1.2/ln:1;tx*=kq;ty*=kq;
      if(RM){pull.ox=tx;pull.oy=ty}else{var wn=pull.rel?10:16,ex=pull.ox-tx,ey=pull.oy-ty,kd=Math.exp(-wn*dt),cx=pull.vx+wn*ex,cy2=pull.vy+wn*ey;pull.ox=tx+(ex+cx*dt)*kd;pull.oy=ty+(ey+cy2*dt)*kd;pull.vx=(pull.vx-wn*cx*dt)*kd;pull.vy=(pull.vy-wn*cy2*dt)*kd}
      if(pull.rel&&Math.hypot(pull.ox,pull.oy)<.6&&Math.hypot(pull.vx,pull.vy)<2)pull=null;else D=pull}
    /* the filter follows the pull (eased inside waveform.js); filter amount scales how far it can close */
    if(D&&!D.rel&&D.switched)V.filter(D.d*E.fAmt/100);
    /* the long sweep: the pan drifts (never the zoom), pauses on touch, speeds vary; Reduce Motion: none */
    var idleMs=now-idle;
    if(!RM&&!pull&&!wind&&!edge&&l===1&&idleMs>2600&&E.sweep>.5&&!cam.glide&&!cam.busy&&!cam.grab){
      var st=sh.world.stop({lv:1,k:'sound'});if(st){if(!sweepAnchor)sweepAnchor={x:cam.x,y:cam.y,t:t};
        var spd=14*(E.sweep/100)*(.55+.45*Math.sin(t/4300)+.25*Math.sin(t/1700)),Lh=(bounds(c)[1]-bounds(c)[0])*.22*(E.sweepLen/100);
        sw.p+=spd*dt/cam.s*sweepDir;if(sw.p>Lh){sw.p=Lh;sweepDir=-1}if(sw.p<-Lh){sw.p=-Lh;sweepDir=1}
        cam.x=sweepAnchor.x+sw.p;if(vr==='C')cam.y=sweepAnchor.y+Math.sin(sw.p/Math.max(1,Lh)*Math.PI*2)*Lh*.12}}
    else if(idleMs<=2600||pull||cam.glide)sweepAnchor=null;
    /* positions with 3D, drift and pull */
    var F=[1,.34*B,.14*B,.05*B],drift=E.drift/100*6,pos=c.stars.map(function(s,i){var p=proj(cam,s.x,s.y,s.z,[0,0,0]);if(!RM&&drift>.01){p[0]+=Math.sin(t*.00031+i*1.7)*drift;p[1]+=Math.cos(t*.00027+i*2.3)*drift}
      if(D){var f=F[D.dist[i]]||0;p[0]+=D.ox*f;p[1]+=D.oy*f}return p});
    /* chimes swing (a damped spring each), the strand's lower star follows */
    var om=6.5+3.5*E.resp/100;strands(c).forEach(function(e,j){var s=sway[j]||(sway[j]={a:0,v:0});if(RM){s.a=0;s.v=0}else{s.v+=(-om*om*s.a-2*.13*om*s.v)*dt;s.a+=s.v*dt;s.a=clamp(s.a,-1.2,1.2)}
      var sp=E.sway/100;if(pos[e[1]])pos[e[1]][0]+=s.a*sp*60});
    cur=pos;
    var pd=D?clamp(Math.hypot(D.ox,D.oy)/maxPull(),0,1.2):0,pi=D?D.si:-1,pp=D?pos[pi]:null;
    /* atmosphere: Night carries a faint haze behind the sky; Red never lights the page (fog there only fades the far stars) */
    var fog=E.fog/100;if(!red&&fog>.01){var q0=proj(cam,c.cx,c.cy,1,[0,0,0]),R=Math.min(cam.W,cam.H)*.7,gr=g.createRadialGradient(q0[0],q0[1],0,q0[0],q0[1],R);gr.addColorStop(0,'rgba(120,160,210,'+(.07*fog).toFixed(3)+')');gr.addColorStop(1,'rgba(120,160,210,0)');g.fillStyle=gr;g.fillRect(0,0,cam.W,cam.H)}
    var rB=red?clamp(E.rBright/100,.4,1.5):1,rGl=red?E.rGlow/100:1;
    function zfade(z){var zn=clamp((z-.78)/.4,0,1);return 1-fog*.7*(1-zn)}
    /* lines (the ones at the pulled star bend toward it) */
    g.lineWidth=1;
    c.e.forEach(function(e,ei){var a=pos[e[0]],b=pos[e[1]];if(!a||!b)return;var zf=zfade((c.stars[e[0]].z+c.stars[e[1]].z)/2);g.strokeStyle='rgba('+ink+','+clamp(.42*zf*rB,0,1).toFixed(3)+')';g.beginPath();g.moveTo(a[0],a[1]);
      if(D&&(e[0]===pi||e[1]===pi)){var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,k2=.2*B*pd,bx=mx+(D.px-mx)*k2,by=my+(D.py-my)*k2;g.quadraticCurveTo(bx,by,b[0],b[1])}else g.lineTo(b[0],b[1]);g.stroke()});
    var song={};songs().forEach(function(q){song[q.si]=q.ti});
    c.stars.forEach(function(s,i){var p=pos[i];if(p[0]<-30||p[0]>cam.W+30||p[1]<-30||p[1]>cam.H+30)return;
      var ti=song[i],isSong=ti!=null,cu=isSong&&ti===V.sel,plays=cu&&!V.au.paused,b=s.b||.5,r=(isSong?(cu?3.6:2.6):1+b*1.3)*(E.size/100);
      if(plays&&!RM)r+=Math.sin(t/260)*1.1;var zf=zfade(s.z),gs=(isSong?24:14)*(cu?1.3:1)*(1+b*.4)*(E.glow/100)*(red?.62*rGl:1);
      g.globalAlpha=clamp((isSong?(cu?.95:.6):.5)*zf*rB,0,1);if(gs>.5)g.drawImage(spr,p[0]-gs,p[1]-gs,gs*2,gs*2);
      g.globalAlpha=clamp((isSong?1:.8)*zf*rB,0,1);g.fillStyle=cu?'rgb('+hi+')':'rgba('+(isSong?hi:ink)+','+(isSong?.92:.7)+')';g.beginPath();g.arc(p[0],p[1],Math.max(.6,r),0,6.283);g.fill()});
    g.globalAlpha=1;
    if(D&&pp){var r1=10+18*pd;g.strokeStyle='rgba('+(red?gold:hi)+',.9)';g.lineWidth=1.3;g.beginPath();g.arc(pp[0],pp[1],r1,0,6.283);g.stroke();
      [[r1+16,.32],[r1+38,.16]].forEach(function(q){g.strokeStyle='rgba('+ink+','+q[1]+')';g.lineWidth=1;g.beginPath();g.arc(pp[0],pp[1],q[0],0,6.283);g.stroke()});
      g.fillStyle='rgba('+hi+',1)';g.beginPath();g.arc(pp[0],pp[1],4.6,0,6.283);g.fill();
      var rail=document.querySelector('#snd .rail');if(rail&&V.lit){var rr=rail.getBoundingClientRect(),lx=rr.left+(V.lit.a+V.lit.b)/2*rr.width;g.save();g.setLineDash([1,5]);g.lineCap='round';g.strokeStyle='rgba('+ink+',.45)';g.lineWidth=1.2;g.beginPath();g.moveTo(pp[0],pp[1]+r1);g.lineTo(lx,rr.top-2);g.stroke();g.restore()}}
    /* the top-edge glow handle: a hairline tick you only notice when you reach for it */
    var nr=near?clamp(1-Math.abs(near.y-22)/80,0,1)*(near.x>cam.W*.18&&near.x<cam.W*.82?1:0):0,ea=(edge?.7:.07+.5*nr);g.strokeStyle='rgba('+ink+','+ea.toFixed(3)+')';g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.moveTo(cam.W/2-16,22);g.lineTo(cam.W/2+16,22);g.stroke();g.lineCap='butt';
    S.info={pulling:!!D&&!D.rel,amt:+V.amt.toFixed(3)}};
  S.state=function(){return {here:here,lv:lvl(),variant:variant(),pull:pull?{ti:pull.ti,d:+pull.d.toFixed(3),rel:pull.rel,off:[Math.round(pull.ox),Math.round(pull.oy)]}:null,amt:sh.wave.amt,sweep:{p:+sw.p.toFixed(2),dir:sweepDir},chimes:chimeStats,sway:sway.map(function(s){return +s.a.toFixed(3)}),stars:cur.length,E:JSON.parse(JSON.stringify(E))}};
  /* a point of empty sky (no star, no strand within 70 px): where a tap dives. Used by the QA walkthrough. */
  S.emptySpot=function(){var c=chapter(),W=innerWidth,H=innerHeight,top=80,bot=(list&&!side()?list.getBoundingClientRect().top:H*.8)-14,best=null,bd=0;
    for(var y=top;y<bot;y+=14)for(var x=W*.08;x<(side()?W*.62:W*.92);x+=14){var m=1e9;cur.forEach(function(p){m=Math.min(m,Math.hypot(p[0]-x,p[1]-y))});
      strands(c).forEach(function(e,j){var a=cur[e[0]],b=cur[e[1]];if(!a||!b)return;var dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1,u=clamp(((x-a[0])*dx+(y-a[1])*dy)/l2,0,1);m=Math.min(m,Math.hypot(a[0]+dx*u-x,a[1]+dy*u-y))});
      if(m>bd){bd=m;best=[x,y]}}return best};
  S.songStarPos=function(ti){var c=chapter(),si=sh.wave.starOf(ti);return cur[si]?[cur[si][0],cur[si][1]]:null};
  S.strandPos=function(j){var c=chapter(),e=strands(c)[j];return cur[e[0]]&&[ (cur[e[0]][0]+cur[e[1]][0])/2,(cur[e[0]][1]+cur[e[1]][1])/2 ]};
  /* touch resets the long sweep; the pointer position wakes the top-edge tick */
  ['pointerdown','wheel','keydown'].forEach(function(n){addEventListener(n,function(){idle=performance.now()},true)});
  addEventListener('pointermove',function(e){near={x:e.clientX,y:e.clientY};if(e.buttons)idle=performance.now()},true);
  if(w.GJ_GHOST)GJ_GHOST.avoid(function(){if(!here||!list||lvl()!==1)return null;var r=list.getBoundingClientRect();return r.height>0?[[r.left,r.top,r.right,r.bottom]]:null});
  return S};
})(window);
