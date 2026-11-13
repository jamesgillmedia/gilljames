/* site-v3-3d · Back, Esc, pinch-in, and zoom-out go up exactly one level.
   Slides already push their own history entry; this file closes them on popstate
   and stops dive.js from leaping two levels (player → #all, play → board). */
(function(){
'use strict';
function d(){return window.__dive}
function st(){return d()&&d().state?d().state():null}
function slidesOn(){return !!(window.__filmSlides&&__filmSlides.isOpen&&__filmSlides.isOpen())}
function drawerOn(){return !!(window.GJ_MARKMENU&&GJ_MARKMENU.open)}
function sheetOn(){return !!(window.__sheet&&__sheet.isOpen&&__sheet.isOpen())}
function hashPlay(){return /\/play$/.test(location.hash||'')}
function go(r,o){if(d()&&d().go)d().go(r,o||{})}

function up(){
  if(slidesOn()){__filmSlides.close();return true}
  if(drawerOn()){GJ_MARKMENU.show(false);return true}
  var s=st();
  if((s&&s.w&&s.play)||hashPlay()){
    if(s&&s.w)go({k:s.k,lv:3,w:s.w,play:false});
    else{
      var m=(location.hash||'').match(/^#(\w+)\/(w\w+)\/play$/);
      if(m)go({k:m[1],lv:3,w:m[2],play:false});
    }
    return true;
  }
  if(s&&s.w){
    var out=document.querySelector('.imm [data-a=out]');
    if(out)out.click();
    else go({k:s.k,lv:2});
    return true;
  }
  if(sheetOn()){
    var sh=__sheet.state&&__sheet.state();
    if(sh&&(sh.mode==='all'||sh.mode==='chap')&&__sheet.step){try{__sheet.step(-1)}catch(e){__sheet.close()} }
    else __sheet.close();
    return true;
  }
  if(s&&s.k&&s.lv>=1){go({k:s.k,lv:s.lv-1});return true}
  if(s&&s.k&&s.lv===0){
    if(window.__sheet){__sheet.open({k:s.k});return true}
    go({k:null});return true;
  }
  return false;
}

addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  if(e.target&&e.target.closest&&e.target.closest('input,textarea,[contenteditable]'))return;
  if(up()){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}
},true);

addEventListener('popstate',function(){
  if(slidesOn()&&!(history.state&&history.state.gjSlides))__filmSlides.close(true);
  if(drawerOn()&&!(history.state&&history.state.gjDrawer))GJ_MARKMENU.show(false);
},true);

/* zoom − : one level (never player → the all-sky sheet) */
addEventListener('click',function(e){
  var z=e.target.closest&&e.target.closest('.zb[data-z="-1"]');
  if(!z)return;
  if(slidesOn()||(st()&&st().w)||(st()&&st().play)||hashPlay()){
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    up();
  }
},true);

/* two-finger pinch-in: one level. Capture so dive.js cannot send the player to #all. */
var P=null;
addEventListener('touchstart',function(e){
  if(e.touches.length!==2)return;
  var a=e.touches[0],b=e.touches[1];
  P={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)};
},{capture:true,passive:true});
addEventListener('touchmove',function(e){
  if(!P||e.touches.length!==2||!P.d)return;
  var a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  if(d/P.d<0.82){
    var need=slidesOn()||drawerOn()||(st()&&st().w)||hashPlay();
    P=null;
    if(need){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      up();
    }
  }
},{capture:true,passive:false});
addEventListener('touchend',function(){P=null},{capture:true,passive:true});
addEventListener('touchcancel',function(){P=null},{capture:true,passive:true});

addEventListener('wheel',function(e){
  if(!e.ctrlKey)return;
  if(e.deltaY>20&&(slidesOn()||(st()&&st().w)||drawerOn()||hashPlay())){
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    up();
  }
},{capture:true,passive:false});

window.__levels={up:up};
})();
