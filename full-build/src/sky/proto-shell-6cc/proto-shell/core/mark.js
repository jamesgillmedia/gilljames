/* proto-shell · the mark (ᑕᐣᓯ) and the shims that let tonight/fable-m4/js/tune.js run VERBATIM (core/vendor/tune.js).
   tune.js expects, and gets here:
     window.GJ_DEC   get/set/reset/defaults, localStorage gj.dec.*   (same keys and defaults as the m4 sky.js DECDEF)
     window.GJ_TUNE  get/set/reset/defaults/values                    (the shell renderer reads these live)
     window.__u1     .cur.k (which room's sliders go first) and .ready
     window.__depth  .goTo(room) (the menu's room row)
     #crumb .sig     the mark button the menu hangs under
   Values stay on this device; Reset puts every one back (tune.js does the work). */
(function(w){
'use strict';
var DECDEF={film:'snap',mark:'fusion',open:'mixed',photo:'B',motion:100,snapAt:34,ripples:1,safelight:0,safeK:60},DECV={},hooks=[];
function dec(k){if(!(k in DECV)){var v=null;try{v=localStorage.getItem('gj.dec.'+k)}catch(e){}DECV[k]=v==null?DECDEF[k]:(typeof DECDEF[k]==='number'?+v:v)}return DECV[k]}
w.GJ_DEC={defaults:function(){return JSON.parse(JSON.stringify(DECDEF))},get:dec,
  set:function(k,v){if(!(k in DECDEF))return;DECV[k]=typeof DECDEF[k]==='number'?+v:String(v);try{localStorage.setItem('gj.dec.'+k,String(v))}catch(e){}hooks.forEach(function(f){f('dec',k)})},
  reset:function(){Object.keys(DECDEF).forEach(function(k){try{localStorage.removeItem('gj.dec.'+k)}catch(e){}});DECV={};hooks.forEach(function(f){f('dec','*')})},
  on:function(f){hooks.push(f)}};
/* m4 TDEF (c9621b3 sky.js) + fdens/fgap (preview-film-snap) + mood (this shell; 1 = the sky as written, gj.tune.mood 100) */
var TDEF={mood:1,map:1.3,stars:1.2,lineA:1,lineW:1,starS:1,starG:1,pinch:1,far:1,mid:1,board:1,delay:1,open:1,fade:1,flash:.6,fdens:1,fgap:1},TUNE=JSON.parse(JSON.stringify(TDEF));
w.GJ_TUNE={get:function(k){return TUNE[k]},values:function(){return JSON.parse(JSON.stringify(TUNE))},defaults:function(){return JSON.parse(JSON.stringify(TDEF))},
  set:function(p){if(!p)return;Object.keys(p).forEach(function(k){if(k in TDEF&&isFinite(+p[k]))TUNE[k]=+p[k]});hooks.forEach(function(f){f('tune',Object.keys(p))})},
  reset:function(){TUNE=JSON.parse(JSON.stringify(TDEF));hooks.forEach(function(f){f('tune','*')})}};
w.ShellMark={mount:function(sh){
  var c=document.getElementById('crumb');
  c.innerHTML='<button type="button" class="sig" aria-label="the mark: list · contact · tune" aria-expanded="false"><span class="syl" lang="cr">ᑕᐣᓯ</span></button>'+
    '<button type="button" class="out" aria-label="out one level" hidden>‹</button><span class="where" aria-live="polite"></span>';
  c.querySelector('.sig').addEventListener('click',function(e){e.stopPropagation();if(w.GJ_MARKMENU)GJ_MARKMENU.toggle()});
  c.querySelector('.out').addEventListener('click',function(e){e.stopPropagation();sh.ladder.out()});
  c.addEventListener('pointerdown',function(e){e.stopPropagation()});
  w.__u1={get cur(){return sh.ladder.cur},get ready(){return !!sh.ready}};
  w.__depth={goTo:function(k){k=String(k||'').toLowerCase();if(k==='sky'||k==='far'){sh.ladder.far();return}
    if(sh.sky.chapter(k))sh.ladder.go({lv:1,k:k})}};
}};
})(window);
