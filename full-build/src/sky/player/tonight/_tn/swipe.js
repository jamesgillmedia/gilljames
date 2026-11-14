/* Phone edge swipe rises one level. At a room's start it leaves for the sky, the same as ‹ Back. */
(function(){
  'use strict';
  addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'||e.clientX>32)return;
    var x0=e.clientX,y0=e.clientY,id=e.pointerId,gone=false;
    function off(){removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)}
    function leave(){
      if(window.TN_HANDOFF)TN_HANDOFF.out();
      var back=document.getElementById('back');
      if(back&&!back.disabled){back.click();return}
      history.back();
    }
    function move(ev){
      if(ev.pointerId!==id||gone)return;
      var dx=ev.clientX-x0,dy=ev.clientY-y0;
      if(dx>72&&Math.abs(dy)<48){gone=true;off();leave()}
      else if(y0<36&&dy>80&&Math.abs(dx)<48){gone=true;off();leave()}
    }
    function up(){off()}
    addEventListener('pointermove',move);addEventListener('pointerup',up);addEventListener('pointercancel',up);
  },true);
})();
