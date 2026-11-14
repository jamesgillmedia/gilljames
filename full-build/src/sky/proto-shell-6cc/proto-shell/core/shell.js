/* proto-shell · the light shell. Shared core = camera rig + in/out ladder + sky renderer + touch ripple + Sound dock + mark/tune.
   One module per prototype plugs in (modules/<id>/module.js, chosen with ?m=<id>), with A/B/C proposals (?v=A|B|C,
   pills top right, arrow keys or A/B/C keys: core/vendor/lab.js from proto-lab-1112, verbatim).
   Gestures (FIX-PLAN R2-R5): pinch / wheel = the only way in and out, continuous, soft settle to a ladder stop;
   double tap / double click / ‹ / Esc / Back = out exactly one level; a touch = a ripple; a tap on a name = its name + "open ›".
   Debug/QA hook: window.__shell (state(), check(), go()). ?at=film/board (or film, film/work/<n>) starts there for stills. */
(function(w){
'use strict';
var Q=new URLSearchParams(location.search),MODS={},SH={ready:false,mods:MODS};
w.Shell=SH;
SH.register=function(m){MODS[m.id]=m};
function $(id){return document.getElementById(id)}
function J(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(u+' '+r.status);return r.json()})}
var mid=(Q.get('m')||'film-snap').replace(/[^a-z0-9-]/g,'');
function loadScript(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=function(){no(new Error(src))};document.head.appendChild(s)})}
Promise.all([J('core/tokens.json').then(function(t){w.TK=t;return t}),J('data/sky.json'),J('data/tracks.json'),J('media/sound-shape.json'),J('data/peaks.json').catch(function(){return null}),loadScript('modules/'+mid+'/module.js').then(function(){return MODS[mid]&&MODS[mid].ready})]).then(function(r){boot(r[1],r[2].tracks,r[3],r[4])})
  .catch(function(e){$('where0').textContent='could not load: '+e.message;console.error(e)});

function boot(skyD,tracks,shape,peaks){
  if(w.GJ_THEME&&GJ_THEME.refresh)GJ_THEME.refresh();
  var PAL=w.GJ_THEME.pal;
  var cv=$('cv'),g=cv.getContext('2d'),M=MODS[mid]||{id:mid,variants:{A:'A'}};SH.mod=M;
  var sky=ShellSky(skyD);SH.sky=sky;
  var cam=ShellCamera(cv,{onGrab:function(x,y,e){return (SH.sound&&SH.sound.grab(x,y,e))||(M.grab?M.grab(x,y,e,SH):null)},onTap:tap,onTouch:function(x,y){ShellRipple(x,y)},onDouble:function(){clearTimeout(chipT);hideChip();ladder.out()},onSettle:function(src){ladder.settle(src)},onKey:key});SH.cam=cam;
  var g0=cam.glideTo;cam.glideTo=function(x,y,s,ms){var m=GJ_DEC.get('motion'),k=isFinite(m)?Math.max(0,m)/100:1;if(k<=.01){cam.x=x;cam.y=y;cam.s=s;cam.glide=null;return}g0(x,y,s,(ms||950)/Math.max(.35,k))};
  /* the world: FAR fits every constellation, MID fits one figure; a module may add BOARD (2) and WORK (3) for its chapter */
  var world={
    chapterNear:function(p){return sky.near(p)},
    back:function(){if(SH.sound)SH.sound.back();return M.back?!!M.back(SH):false},
    inAt:function(x,y){return M.inAt?!!M.inAt(x,y,SH):false},
    stop:function(st){var W=cam.W,H=cam.H;
      var rs=snd.stop(st,W,H);if(rs!==undefined)return rs;
      if(M.stop){var m=M.stop(st,W,H,SH);if(m!==undefined)return m}
      /* the m4 ladder (STANDARDS §2): FAR = the fitted sky * tk('far'); MID = fitBox(chapter, 36, 28).s * 1.45 * tk('mid');
         BOARD (fit * 1.45 * 1.3 * tk('board')) and WORK only where a module owns them */
      var T=GJ_TUNE.values();
      if(!st.lv)return {x:sky.FAR.x,y:sky.FAR.y,s:sky.FAR.s*(T.far||1)};
      if(!sky.chapter(st.k))return null;if(st.lv===1){var f=sky.chFit(st.k,W,H);return {x:f.x,y:f.y,s:f.s*1.45*(T.mid||1)}}
      return null}};
  var ladder=ShellLadder(cam,world,{snapAt:function(){return GJ_DEC.get('snapAt')/100},onChange:crumb});SH.ladder=ladder;SH.world=world;
  var wave=ShellWave(shape,tracks,peaks);SH.wave=wave;
  var snd=ShellSound(SH);SH.sound=snd;
  GJ_THEME.on(function(){sky.retheme()});sky.retheme();
  /* red: floating callout for the part being adjusted + the zoom-level scale (both hidden by CSS in night) */
  var co=ShellCallout(SH);SH.callout=co;
  GJ_THEME.on(function(what,v){if(what==='adj'){if(v)co.show(v,GJ_THEME.adjInfo);else co.hide()}else if(what==='theme'&&v!=='red')co.hide()});
  var lvl=document.createElement('div');lvl.id='lvl';lvl.setAttribute('aria-hidden','true');lvl.innerHTML='<i class="rail"></i>'+['sky','mid','board','work'].map(function(n,i){return '<b data-i="'+i+'" style="top:'+(i*44)+'px">'+n+'</b>'}).join('')+'<s></s>';document.body.appendChild(lvl);
  var lvB=lvl.querySelectorAll('b'),lvS=lvl.querySelector('s');
  function lvlStep(){var st=ladder.cur,k=st.k||sky.near([cam.x,cam.y]),sc=[],have=[];
    [{lv:0},{lv:1,k:k},{lv:2,k:k},st.lv===3?st:{lv:3,k:k,id:st.id}].forEach(function(q,i){var s=null;try{s=world.stop(q)}catch(e){}sc[i]=s?s.s:null;have[i]=!!s});
    var idx=[];sc.forEach(function(v,i){if(v)idx.push(i)});var pos=0,s=cam.s;
    if(idx.length>1){if(s<=sc[idx[0]])pos=idx[0];else if(s>=sc[idx[idx.length-1]])pos=idx[idx.length-1];
      else for(var j=0;j<idx.length-1;j++){var a=sc[idx[j]],b=sc[idx[j+1]];if(s>=a&&s<b){pos=idx[j]+(idx[j+1]-idx[j])*Math.log(s/a)/Math.log(b/a);break}}}
    lvS.style.top=Math.round(pos*44)+'px';for(var i=0;i<4;i++){lvB[i].className=i===st.lv?'on':have[i]?'':'off'}}
  ShellMark.mount(SH);
  /* A/B/C: lab.js verbatim. Shim: its history.replaceState(null,'','?v=X') would drop ?m= and the ladder's state, so it is merged here. */
  var rs=history.replaceState.bind(history);
  history.replaceState=function(st,t,u){if(typeof u==='string'&&/^\?v=/.test(u)){var q=new URLSearchParams(location.search);q.set('v',u.slice(3));return rs(history.state,t,location.pathname+'?'+q+location.hash)}return rs(st,t,u)};
  $('labwho').textContent=M.title||M.id;
  var vb=$('labvars');Object.keys(M.variants).forEach(function(v){var b=document.createElement('button');b.type='button';b.setAttribute('data-v',v);b.textContent=v;vb.appendChild(b)});
  document.addEventListener('lab-variant',function(e){SH.variant=e.detail.v;if(M.variant)M.variant(e.detail.v,SH);relayout()});
  GJ_DEC.on(function(){relayout()});
  var T=GJ_TUNE.values();
  (function(){var f=GJ_TUNE.set,r=GJ_TUNE.reset;GJ_TUNE.set=function(p){f(p);T=GJ_TUNE.values();if(p&&Object.keys(p).some(function(k){return k!=='mood'}))relayout()};GJ_TUNE.reset=function(){r();T=GJ_TUNE.values();relayout()}})();
  function relayout(){resize(true)}
  function resize(keep){var DPR=Math.min(devicePixelRatio||1,2),W=innerWidth,H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);g.setTransform(DPR,0,0,DPR,0,0);
    cam.W=W;cam.H=H;sky.layout(W,H,T);if(M.layout)M.layout(W,H,SH);
    /* blend clamps (STANDARDS §2): live zoom from S0*0.7 to the deepest stop * 1.15; S0 = FAR */
    cam.S0=sky.FAR.s;cam.SMIN=cam.S0*.7;var mx=cam.S0;sky.CH.forEach(function(c){[1,2].forEach(function(lv){var q=world.stop({lv:lv,k:c.k});if(q)mx=Math.max(mx,q.s)})});
    if(M.chapter){var q3=world.stop({lv:3,k:M.chapter,id:'0'});if(q3)mx=Math.max(mx,q3.s)}cam.SMAX=mx*(M.inAt?1.4:1.15);
    var b=sky.box();if(M.box){var mb=M.box(SH);if(mb)b=[Math.min(b[0],mb[0]),Math.min(b[1],mb[1]),Math.max(b[2],mb[2]),Math.max(b[3],mb[3])]}cam.clampBox=b;
    if(SH.ready)ladder.arrive(ladder.cur,keep===true?400:0)}
  if(M.chapter&&M.isNew)sky.isNew[M.chapter]=M.isNew;
  addEventListener('resize',function(){resize(false)});
  resize();ladder.boot();
  Lab.init(M.variants,{start:'A'});
  if(M.init)M.init(SH);
  /* #debug is reserved for the lil-gui / Tweakpane panel (STANDARDS §8, source TBD). Production stays clean without the hash. */
  SH.ready=true;crumb(ladder.cur);
  var at=(Q.get('at')||'').split('/');if(at[0]&&sky.chapter(at[0])){var lv={'':1,mid:1,board:2,work:3}[at[1]||''];var id=at[2]||null;
    if(lv===3&&M.workId)id=M.workId(id,SH);ladder.go({lv:lv||1,k:at[0],id:id},0);cam.glide=null;var s=world.stop(ladder.cur);if(s){cam.x=s.x;cam.y=s.y;cam.s=s.s}}
  if(/(?:^|[?&])mid=1(?:&|$)/.test(location.search)&&M.mid)M.mid(SH);
  /* taps: a ripple always; then the module; then a name (its chip); then a song star */
  var chip=$('chip'),chipK=null,chipT=0;
  chip.addEventListener('pointerdown',function(e){e.stopPropagation()});
  chip.addEventListener('click',function(e){e.stopPropagation();var k=chipK;hideChip();if(k)ladder.go({lv:1,k:k})});
  /* a title chip with no open (a map dot: the tile reveal is exploration only, decision 3) */
  SH.chipTitle=function(t,x,y){chipK=null;chip.textContent=t;chip.style.left=x+'px';chip.style.top=y+'px';chip.hidden=false};
  function hideChip(){clearTimeout(chipT);chip.hidden=true;chipK=null}
  function tap(x,y){hideChip();
    if(SH.sound&&SH.sound.tap(x,y))return;
    if(M.tap&&M.tap(x,y,SH))return;
    var k=sky.nameAt(x,y,cam);if(k&&!(ladder.cur.lv>=1&&ladder.cur.k===k)){clearTimeout(chipT);chipK=k;chip.innerHTML=sky.chapter(k).name+'<b>open ›</b>';chip.style.left=x+'px';chip.style.top=y+'px';chip.hidden=false;return}
    var si=songStarAt(x,y);if(si>=0)wave.pick(si,false)}
  function songStarAt(x,y){if(!(ladder.cur.lv>=1&&ladder.cur.k==='sound'))return -1;var c=sky.chapter('sound'),o=[0,0,0];
    for(var i=0;i<tracks.length;i++){var s=c.stars[wave.starOf(i)];sky.proj(cam,s.x,s.y,1,o);if(Math.hypot(o[0]-x,o[1]-y)<26)return i}return -1}
  function key(e){var k=e.key;if(k==='Escape'||k==='-'||k==='_'||k==='Backspace'){e.preventDefault();ladder.out()}
    else if(k==='+'||k==='='||k==='Enter'){ladder.inAt(cam.W/2,cam.H/2)}}
  function crumb(st){var c=document.querySelector('#crumb .where');if(!c)return;var p=[];
    if(st.lv>=1)p.push(sky.chapter(st.k).name);if(st.lv>=2)p.push((SH.sound&&SH.sound.levelName(2,st))||(M.levelName&&M.levelName(2,st))||'board');if(st.lv>=3)p.push((M.levelName&&M.levelName(3,st,SH))||'work');
    c.textContent=p.join(' › ');if(SH.sound)SH.sound.level(st);if(w.GJ_THEME)GJ_THEME.setRoom(st.lv>=1?st.k:null);var o=document.querySelector('#crumb .out');if(o)o.hidden=!st.lv;if(M.level)M.level(st,SH)}
  /* the frame */
  var last=performance.now();
  function frame(t){requestAnimationFrame(frame);var dt=Math.min(.05,(t-last)/1000);last=t;cam.step(t,dt);
    var W=cam.W,H=cam.H;g.clearRect(0,0,W,H);
    g.fillStyle=PAL.bg;g.fillRect(0,0,W,H); /* --bg, from the theme layer */
    sky.drawWash(g,cam,T);
    sky.draw(g,cam,t,T,ladder.cur,function(k){return snd.hide(k)||(M.hide?!!M.hide(k,SH):false)});
    snd.draw(g,cam,t);
    soundLayer(t);
    if(M.draw)M.draw(g,cam,t,SH,T);
    if(PAL.name!=='red')sky.drawDust(g,cam); /* red has no haze: nothing but the elements themselves gives light */
    if(PAL.name==='red'){lvlStep();co.step(cam)}
  }
  /* the Sound constellation is the waveform: the six song stars glow, the playing one breathes with the playhead */
  function soundLayer(t){var c=sky.chapter('sound');if(!c||snd.owns())return;var o=[0,0,0],here=ladder.cur.lv>=1&&ladder.cur.k==='sound',z=Math.sqrt(cam.zf());
    g.font='300 11px Poppins,sans-serif';g.textAlign='center';
    for(var i=0;i<tracks.length;i++){var s=c.stars[wave.starOf(i)];if(!s)continue;sky.proj(cam,s.x,s.y,1,o);var on=i===wave.sel,pl=on&&!wave.au.paused;
      var r=(on?3.4:2.2)*Math.min(2.4,z)+(pl?Math.sin(t/260)*1.2:0);g.globalAlpha=on?1:.7;g.fillStyle=PAL.adj==='sound'?'#e8c48a':on?PAL.sndOn:PAL.sndOff;g.beginPath();g.arc(o[0],o[1],r,0,6.283);g.fill();
      if(here){g.globalAlpha=on?1:.8;g.fillStyle=PAL.adj==='sound'?'#e8c48a':on?PAL.sndLblOn:PAL.sndLbl;var up=s.y<c.cy;g.fillText(tracks[i].title,o[0],up?o[1]-12-(i%2)*13:o[1]+20+(i%2)*13)}}
    g.globalAlpha=1}
  requestAnimationFrame(frame);
  SH.state=function(){return {module:mid,variant:SH.variant,level:ladder.cur,cam:{x:+cam.x.toFixed(1),y:+cam.y.toFixed(1),s:+cam.s.toFixed(4),zf:+cam.zf().toFixed(3)},histN:ladder.n,mod:M.state?M.state(SH):null}};
  SH.check=function(){var wv=wave.check();return {ok:wv.dock&&wv.visible&&wv.playButton&&wv.rail&&!!document.querySelector('#crumb .sig'),wave:wv,mark:!!document.querySelector('#crumb .sig'),markMenu:!!w.GJ_MARKMENU,level:ladder.cur}};
  SH.go=function(st){ladder.go(st)};
  SH.setVariant=function(v){var b=document.querySelector('#labvars button[data-v="'+v+'"]');if(b)b.click()};
  /* Left / Right belong to the A/B/C switcher (lab.js) unless the module is stepping layers (M.arrow(dir) consumed); Shift+arrow always switches */
  addEventListener('keydown',function(e){if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;if(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||(e.target&&/input|textarea|select/i.test(e.target.tagName)))return;
    if(M.arrow&&M.arrow(e.key==='ArrowRight'?1:-1,SH)){e.preventDefault();e.stopImmediatePropagation()}},true);
  w.__shell=SH;
}
})(window);
