/* proto-shell · the touch without a select. Lifted from tonight/fable-m4/js/sky.js rippleAt + css .water .rip:
   a touch rings the water where you touched and opens nothing. GJ_DEC ripples = 0 turns it off. */
(function(w){
'use strict';
w.ShellRipple=function(x,y){
  var wt=document.getElementById('water');if(!wt)return;
  try{if(w.GJ_DEC&&!+GJ_DEC.get('ripples'))return}catch(e){}
  if(wt.childElementCount>24)return;
  var s=document.createElement('i');s.className='rip';s.style.left=x+'px';s.style.top=y+'px';wt.appendChild(s);
  setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s)},1600);
};
})(window);
