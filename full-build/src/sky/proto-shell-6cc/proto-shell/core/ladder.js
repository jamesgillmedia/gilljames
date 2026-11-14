/* proto-shell · the in/out ladder. One source of truth for the level, after tonight/fable-m4/js/sky.js levelOf/pushStep/back:
   0 FAR (the whole sky) · 1 MID (one constellation) · 2 BOARD · 3 WORK.
   - Going in pushes one history step per level, so pinch-out, the ‹, Esc, the double tap and the browser Back all leave
     through history.back and agree: exactly one level each (FIX-PLAN R4). The mark goes to FAR in one move (R5).
   - The camera zooms continuously; on letting go (pinch release, or 260 ms after the last wheel notch) the ladder settles
     softly to a stop. Between two stops the camera must travel `snapAt` of the way (log scale) to commit, else it settles back.
   - Nothing here opens a page. A room is a level of the one sky. */
(function(w){
'use strict';
function clamp(v,a,b){return v<a?a:v>b?b:v}
function Ladder(cam,world,o){
  var L={cur:{lv:0,k:null,id:null},n:0,onChange:o.onChange||function(){},snapAt:o.snapAt||function(){return .34}};
  function same(a,b){return a.lv===b.lv&&a.k===b.k&&(a.id||null)===(b.id||null)}
  /* durations: STANDARDS §3 (tokens.json motion.durationsMs): in 1000, MID→BOARD 700 (open film board), out 800 (double-tap step-out),
     settle back 500 (rubber-band), FAR 1000 (home), default 950 */
  function D(k,d){var t=window.TK&&TK.motion&&TK.motion.durationsMs;return t&&t[k]!=null?t[k]:d}
  function msFor(to,from){if(to.lv>from.lv)return to.lv===2?D('openFilmBoard',700):D('glideHomeChapterWork',1000);if(to.lv<from.lv)return to.lv===0&&from.lv>1?D('glideHomeChapterWork',1000):D('doubleTapStepOut',800);return D('glideDefault',950)}
  L.msFor=msFor;L.D=D;
  function arrive(st,ms){var c=world.stop(st);if(!c)return;cam.glideTo(c.x,c.y,c.s,ms==null?D('glideDefault',950):ms)}
  function set(st){var prev=L.cur;L.cur={lv:st.lv,k:st.k||null,id:st.id||null};if(!same(prev,L.cur))L.onChange(L.cur,prev)}
  L.stops=function(k){var out=[{lv:0,k:null}];if(!k)return out;[1,2].forEach(function(lv){var st={lv:lv,k:k};if(world.stop(st))out.push(st)});return out};
  /* go deeper (one history step per level crossed) or shallower (history.go back to that level) */
  L.go=function(st,ms){
    st={lv:st.lv,k:st.k||null,id:st.id||null};
    if(st.lv<L.cur.lv&&L.n>0){var back=Math.min(L.n,L.cur.lv-st.lv);if(back>0){PEND={st:st,ms:ms==null?msFor(st,L.cur):ms};history.go(-back);return}}
    if(st.lv>L.cur.lv||(st.lv===L.cur.lv&&!same(st,L.cur))){
      for(var lv=L.cur.lv+1;lv<=st.lv;lv++){L.n++;var s={lv:lv,k:st.k,id:lv===st.lv?st.id:null};history.pushState({sh:1,st:s,n:L.n},'',hashOf(s))}
      if(st.lv===L.cur.lv){history.replaceState({sh:1,st:st,n:L.n},'',hashOf(st))}
    }
    var prev=L.cur;set(st);arrive(st,ms==null?msFor(st,prev):ms);
  };
  /* module hooks (world.back, world.inAt): a module that has layers inside a level (about-calc) gets first call at every way out and in */
  L.out=function(){if(world.back&&world.back())return;if(L.cur.lv===0){arrive(L.cur,D('rubberBandBelowField',500));return}PEND={st:null,ms:D('doubleTapStepOut',800)};
    if(history.state&&history.state.sh&&L.n>0){history.back();return}
    PEND=null;var st=L.cur.lv===1?{lv:0}:{lv:L.cur.lv-1,k:L.cur.k};set(st);arrive(st,D('doubleTapStepOut',800))};
  L.far=function(){var ms=D('glideHomeChapterWork',1000);if(L.cur.lv===0){arrive(L.cur,ms);return}if(L.n>0){PEND={st:{lv:0},ms:ms};history.go(-L.n);return}set({lv:0});arrive({lv:0},ms)};
  L.inAt=function(x,y){var k=L.cur.k||world.chapterNear(cam.toWorld(x,y));if(L.cur.lv===0){L.go({lv:1,k:k});return}
    var nx=L.stops(k).filter(function(s){return s.lv===L.cur.lv+1})[0];if(nx)L.go(nx);else if(world.inAt)world.inAt(x,y)};
  /* the soft settle after a continuous zoom */
  /* a settle glide is marked `lock`: a touch that lands or taps during it does not cancel it and opens nothing (camera.js); the tail of a wheel flick is ignored for 600 ms */
  var LOCK=null;
  /* the tail of a wheel flick is ignored (600 ms) only when the settle actually committed a level; a settle that just returned to the same stop leaves the wheel live,
     so a slow wheel (a notch, a pause, a notch) keeps adding up until it crosses the snap threshold */
  function mark(src,moved){if(cam.glide){cam.glide.lock=1;if(moved&&src&&src.kind!=='resume')cam.wheelLock=performance.now()+600}}
  L.settle=function(src){LOCK=src||{};var b0=L.cur;_settle(src);mark(src,L.cur!==b0||!!PEND);if(!PEND)LOCK=null};
  function _settle(src){
    var k=L.cur.lv>=1?L.cur.k:world.chapterNear([cam.x,cam.y]);
    if(L.cur.lv===3){var ws=world.stop(L.cur);if(ws&&cam.s<ws.s*.8){L.go({lv:2,k:L.cur.k});return}arrive(L.cur,D('rubberBandBelowField',500));return}
    if(L.cur.lv>=1&&world.chapterNear([cam.x,cam.y])!==k&&cam.s<world.stop({lv:1,k:k}).s*.7)k=world.chapterNear([cam.x,cam.y]);
    var S=L.stops(k),sc=S.map(function(s){return world.stop(s).s}),s=cam.s,from=L.cur.k===k?L.cur.lv:0,at=clamp(L.snapAt(),.1,.9),t=0;
    if(s<=sc[0])t=0;else if(s>=sc[sc.length-1])t=sc.length-1;
    else for(var i=0;i<sc.length-1;i++){if(s>=sc[i]&&s<sc[i+1]){var u=Math.log(s/sc[i])/Math.log(sc[i+1]/sc[i]);
      t=from<=i?(u>at?i+1:i):(u<1-at?i:i+1);break}}
    /* R4: one gesture moves at most one level, in or out */
    var ci=-1;S.forEach(function(x,i){if(x.lv===L.cur.lv&&(x.k||null)===(L.cur.k||null))ci=i});if(ci<0)ci=0;t=clamp(t,ci-1,ci+1);
    var st=S[t];
    /* pinch-in or wheel-in past the deepest stop (m4's depth pinch, ratio 1.18) steps a module layer; pinch-out to a shallower level asks the module first */
    if(world.inAt&&L.cur.lv>=1&&t===ci&&s/sc[ci]>1.18&&world.inAt(cam.W/2,cam.H/2)){arrive(L.cur,D('rubberBandBelowField',500));return}
    if(world.back&&t<ci&&world.back()){arrive(L.cur,D('rubberBandBelowField',500));return}
    if(st.lv===L.cur.lv&&st.k===L.cur.k){arrive(st,D('rubberBandBelowField',500));return}
    if(st.lv<L.cur.lv||(st.lv>0&&L.cur.lv>0&&st.k!==L.cur.k&&st.lv<=L.cur.lv)){
      if(st.k!==L.cur.k&&st.lv>0){PEND={st:st,ms:null,then:true};history.go(-Math.min(L.n,L.cur.lv));return}
      L.go(st);return}
    L.go(st);
  }
  var PEND=null;
  /* browser Back: a module with layers gets it first (m4 bioBack). Consumed = the history step is put back and nothing else moves. */
  var IGN=false;
  addEventListener('popstate',function(e){var s=e.state;var st=s&&s.sh?s.st:{lv:0},prevN=L.n;
    if(IGN){IGN=false;L.n=s&&s.sh?s.n:0;return}
    if(!PEND&&st.lv<L.cur.lv&&world.back&&world.back()){var fwd=prevN-(s&&s.sh?s.n:0);if(fwd>0){IGN=true;history.go(fwd)}return}
    L.n=s&&s.sh?s.n:0;
    if(PEND&&PEND.then&&PEND.st&&PEND.st.lv>st.lv){var p=PEND;PEND=null;set(st);L.go(p.st,p.ms);if(LOCK){mark(LOCK,true);LOCK=null}return}
    var prev=L.cur,ms=PEND&&PEND.ms!=null?PEND.ms:msFor(st,prev);PEND=null;set(st);arrive(st,ms);if(LOCK){mark(LOCK,true);LOCK=null}});
  function hashOf(s){return '#'+(s.lv?[s.k,['','mid','board','work'][s.lv],s.id||''].filter(Boolean).join('/'):'')}
  L.boot=function(){history.replaceState({sh:1,st:{lv:0},n:0},'',location.pathname+location.search);L.n=0;set({lv:0});var c=world.stop({lv:0});cam.x=c.x;cam.y=c.y;cam.s=c.s};
  L.arrive=arrive;
  return L;
}
w.ShellLadder=Ladder;
})(window);
