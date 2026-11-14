/* Frame rail, shared by the Demo Reel card and the featured player (filmplayer.js) for every film.
 A strip of the current clip's own frames (webp thumbs from tools/extract_reel_frames.py and tools/extract_loop_frames.py), every one at full
 brightness, the selected one on a thin line. While the owner is paused a horizontal drag steps the clip frame by frame (the real clip seeks to the
 frame). A drag faster than FLING px/s shuttles: the signed velocity sets a signed playback rate (cap 4x). Forward runs on the clip's own
 playbackRate; backward steps currentTime down each frame, since video cannot play in reverse. While the finger is down the rate follows the
 velocity; released forward it settles into 1x play, released backward it eases to a stop. The rail claims only a horizontal-dominant drag, never
 calls preventDefault, and leaves vertical gestures to the page.

 GJ_RAIL.create(host, {
   video(): the clip element to drive (or null)
   playing(): the owner's normal play state; the rail is inert while it is true
   setPlaying(on): the owner flips between playing and paused (called when a forward shuttle settles into play)
   settle(t, dur): optional, called with the clip time just before that hand-over (the reel aligns its shot clock)
   activate(v): optional, make v the visible clip (default: add class "on")
   onShuttle(on): optional, called when a fast scrub starts and ends
   thumbHost: element that receives the stand-in still shown until a never-loaded clip has a frame
   eventHost: element that contains the clips (seeked events are read there)
 }) -> {set(frames|null), sync(), refresh(), cancel(), destroy(), state(), el}
 frames = {n, w, h, dur, url(i)} */
(function(){
'use strict';
var FLING=1200,FLING_MS=110,MAXRATE=4,EXIT=450;
function create(host,o){
  var rail=document.createElement('div');
  rail.className='fr-rail';rail.setAttribute('role','slider');rail.setAttribute('tabindex','0');
  rail.setAttribute('aria-label','Frames of this clip');rail.setAttribute('aria-valuemin','1');rail.hidden=true;
  rail.innerHTML='<div class="fr-tr"></div><i class="fr-mk"></i>';
  host.appendChild(rail);
  var rtr=rail.firstChild,pv=document.createElement('img');
  pv.className='fr-pv';pv.alt='';pv.decoding='sync';pv.hidden=true;
  (o.thumbHost||host).appendChild(pv);
  var fr=null,rd=null,seekWant=-1,seeking=false,sh=null,shRaf=0,dead=false,inert=null;
  function vid(){return o.video?o.video():null}
  function frameT(i){return (i+.5)*fr.dur/fr.n}
  function activate(v){if(o.activate)o.activate(v);else v.classList.add('on')}
  function refresh(){
    var want=!!(fr&&!o.playing());
    if(inert===want)return;
    inert=want;rail.style.pointerEvents=want?'auto':'none';rail.classList.toggle('live',want);
  }
  function set(f){
    endShuttle();rd=null;seekWant=-1;seeking=false;pv.hidden=true;
    if(!f||!f.n){fr=null;rail.hidden=true;rtr.innerHTML='';inert=null;return}
    fr=f;fr.pos=0;fr.idx=0;
    var html='',k;
    for(k=0;k<f.n;k++)html+='<img src="'+f.url(k)+'" width="'+f.w+'" height="'+f.h+'" alt="" draggable="false">';
    rtr.innerHTML=html;rtr.style.height=f.h+'px';rtr.style.setProperty('--h',f.h+'px');
    rail.hidden=false;rail.setAttribute('aria-valuemax',String(f.n));
    inert=null;refresh();railAt(0);
  }
  function railAt(pos){
    if(!fr)return;
    fr.pos=Math.max(0,Math.min(fr.n-1,pos));
    fr.idx=Math.round(fr.pos);
    rtr.style.transform='translate3d('+(rail.clientWidth/2-(fr.pos+.5)*fr.w)+'px,0,0)';
    rail.setAttribute('aria-valuenow',String(fr.idx+1));
  }
  function sync(){
    if(!fr)return;
    refresh();
    if(rd||sh)return;
    var v=vid();if(!v)return;
    railAt((v.currentTime||0)/fr.dur*fr.n-.5);
  }
  function doSeek(){
    var v=vid();if(!v||!fr||seekWant<0)return;
    var t=seekWant;
    if(v.readyState<1){v.addEventListener('loadedmetadata',doSeek,{once:true});return}
    seeking=true;seekWant=-1;
    try{v.currentTime=Math.min(t,Math.max(0,(v.duration||fr.dur)-.02))}catch(e){seeking=false}
  }
  function seekTo(t){seekWant=Math.max(0,t);if(!seeking)doSeek()}
  function showFrame(i){
    var v=vid();if(!fr||!v)return;
    if(!v.paused)v.pause();
    activate(v);
    if(v.readyState<2){pv.src=fr.url(i);pv.hidden=false}
    seekTo(frameT(i));
  }
  (o.eventHost||host).addEventListener('seeked',function(e){
    if(e.target!==vid())return;
    seeking=false;
    if(seekWant>=0){doSeek();return}
    pv.hidden=true;
  },true);
  function rateOf(vs){return Math.max(-MAXRATE,Math.min(MAXRATE,vs/fr.w*(fr.dur/fr.n)))}
  function velOf(){
    var q=rd.s;if(q.length<2)return 0;
    var a=q[0],b=q[q.length-1],dt=b.t-a.t;
    return dt>0?-(b.x-a.x)/dt*1000:0;
  }
  function startShuttle(vs){
    var v=vid();if(!v||!fr)return;
    activate(v);pv.hidden=true;
    var r=rateOf(vs);
    sh={rate:r,target:r,held:true,t:v.currentTime||0,last:performance.now(),mode:''};
    rail.classList.add('shuttle');
    if(o.onShuttle)o.onShuttle(true);
    if(!shRaf)shRaf=requestAnimationFrame(shTick);
  }
  function endShuttle(){
    if(shRaf)cancelAnimationFrame(shRaf);shRaf=0;
    if(sh){var v=vid();if(v&&v.playbackRate!==1)v.playbackRate=1}
    var was=!!sh;
    sh=null;rail.classList.remove('shuttle');rail.removeAttribute('data-rate');
    if(was&&o.onShuttle)o.onShuttle(false);
  }
  function finishStop(v){
    if(!v.paused)v.pause();
    var t=sh.t;endShuttle();
    seekTo(t);railAt(t/fr.dur*fr.n-.5);
  }
  function finishPlay(v){
    var t=sh.mode==='rev'?sh.t:(v.currentTime||0);
    endShuttle();
    rd=null;rail.classList.remove('scrub');
    if(v.paused){try{v.currentTime=t}catch(e){}}
    if(o.settle)o.settle(t,fr.dur);
    o.setPlaying(true);
  }
  function exitToScrub(v){
    var t=sh.mode==='rev'?sh.t:(v.currentTime||0),d=rd;
    if(!v.paused)v.pause();
    endShuttle();
    if(d){d.pos0=Math.max(0,Math.min(fr.n-1,t/fr.dur*fr.n-.5));d.x=d.lastX;d.s=[{t:performance.now(),x:d.lastX}];d.v=0}
    railAt(d?d.pos0:t/fr.dur*fr.n-.5);showFrame(fr.idx);
  }
  function shTick(now){
    shRaf=0;
    if(!sh||dead)return;
    var v=vid(),dt=Math.min(.1,(now-sh.last)/1000);sh.last=now;
    if(!v||!fr){endShuttle();return}
    if(sh.held&&rd){
      var vs=now-rd.lastT>100?0:rd.v;
      sh.target=Math.abs(vs)<EXIT?0:rateOf(vs);
      if(Math.abs(vs)<EXIT&&Math.abs(sh.rate)<.2){exitToScrub(v);return}
    }
    sh.rate+=(sh.target-sh.rate)*(1-Math.exp(-dt*(sh.held?14:5)));
    var r=sh.rate;
    rail.setAttribute('data-rate',r.toFixed(2));
    if(r>.04){
      var tNow=v.currentTime||0;
      if(sh.mode!=='fwd'){
        if(sh.mode==='rev'){try{v.currentTime=sh.t}catch(e){}}
        sh.mode='fwd';
        var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});
      }else if(sh.t-tNow>.3||tNow>=fr.dur-.05){finishPlay(v);return}
      v.playbackRate=Math.max(.0625,Math.min(MAXRATE,r));
      sh.t=tNow;
      railAt(tNow/fr.dur*fr.n-.5);
    }else if(r<-.04){
      if(sh.mode!=='rev'){if(!v.paused)v.pause();sh.t=v.currentTime||0;sh.mode='rev'}
      sh.t=Math.max(0,sh.t+r*dt);
      seekTo(sh.t);
      railAt(sh.t/fr.dur*fr.n-.5);
      if(sh.t<=0){sh.rate=sh.target=0;if(!sh.held){finishStop(v);return}}
    }else{
      if(sh.mode==='fwd')sh.t=v.currentTime||0;
      if(!v.paused)v.pause();
      sh.mode='idle';
      if(!sh.held&&sh.target===0){finishStop(v);return}
    }
    if(!sh.held&&sh.target===1&&Math.abs(sh.rate-1)<.03){finishPlay(v);return}
    shRaf=requestAnimationFrame(shTick);
  }
  function down(e){
    if(!fr||o.playing()||e.button)return;
    if(sh){var v0=vid();if(v0&&!v0.paused)v0.pause();var t0=sh.mode==='rev'?sh.t:(v0?v0.currentTime:0);endShuttle();railAt(t0/fr.dur*fr.n-.5)}
    rd={id:e.pointerId,x:e.clientX,y:e.clientY,pos0:fr.pos,moved:false,decided:false,s:[{t:performance.now(),x:e.clientX}],cw:fr.w,v:0,lastT:performance.now(),lastX:e.clientX};
  }
  function move(e){
    if(!rd||e.pointerId!==rd.id)return;
    var dx=e.clientX-rd.x,dy=e.clientY-rd.y,now=performance.now();
    if(!rd.decided){
      if(Math.abs(dx)<6&&Math.abs(dy)<6)return;
      rd.decided=true;
      if(Math.abs(dy)>Math.abs(dx)){rd=null;return}
      rd.moved=true;rail.classList.add('scrub');
      try{rail.setPointerCapture(e.pointerId)}catch(err){}
      if(o.onScrub)o.onScrub();
    }
    rd.s.push({t:now,x:e.clientX});
    while(rd.s.length>2&&now-rd.s[0].t>FLING_MS)rd.s.shift();
    var vs=velOf();
    rd.v=vs;rd.lastT=now;rd.lastX=e.clientX;
    if(sh)return;
    railAt(rd.pos0-dx/rd.cw);
    showFrame(fr.idx);
    if(rd.s.length>=3&&Math.abs(vs)>=FLING)startShuttle(vs);
  }
  function up(e){
    if(!rd||e.pointerId!==rd.id)return;
    var d=rd;rd=null;
    rail.classList.remove('scrub');
    if(sh){sh.held=false;sh.target=sh.rate>=.5?1:0;if(!shRaf)shRaf=requestAnimationFrame(shTick);return}
    if(d.moved){railAt(fr.idx);return}
    if(e.type==='pointercancel'||!fr)return;
    var r=rail.getBoundingClientRect(),i=Math.round(fr.pos+(e.clientX-(r.left+r.width/2))/fr.w);
    railAt(i);showFrame(fr.idx);
  }
  function key(e){
    if(o.playing()||!fr)return;
    var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
    if(!d)return;
    e.preventDefault();e.stopPropagation();
    railAt(fr.idx+d);showFrame(fr.idx);
  }
  rail.addEventListener('pointerdown',down);
  rail.addEventListener('pointermove',move);
  rail.addEventListener('pointerup',up);
  rail.addEventListener('pointercancel',up);
  rail.addEventListener('keydown',key);
  return {
    el:rail,set:set,sync:sync,refresh:refresh,
    cancel:function(){endShuttle()},
    destroy:function(){dead=true;endShuttle();if(rail.parentNode)rail.parentNode.removeChild(rail);if(pv.parentNode)pv.parentNode.removeChild(pv)},
    state:function(){return {frame:fr?fr.idx:-1,frames:fr?fr.n:0,rate:sh?+sh.rate.toFixed(2):0,shuttle:sh?sh.mode:''}}
  };
}
window.GJ_RAIL={create:create};
})();
