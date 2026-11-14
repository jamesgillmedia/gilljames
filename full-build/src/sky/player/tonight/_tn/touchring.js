/* A soft ring at the finger. Pieces, prints and the water all get one; it never takes the tap. */
(function(){
  'use strict';
  var css=document.createElement('style');
  css.textContent='.tn-ring{position:fixed;z-index:120;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:1.5px solid rgba(232,228,220,.75);box-shadow:0 0 14px rgba(232,228,220,.28);pointer-events:none;transform:scale(.35);opacity:.95;transition:transform .5s ease,opacity .5s ease}';
  document.head.appendChild(css);
  addEventListener('pointerdown',function(e){
    if(e.button>0)return;
    var r=document.createElement('span');r.className='tn-ring';
    r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
    document.body.appendChild(r);
    requestAnimationFrame(function(){r.style.transform='scale(2.6)';r.style.opacity='0'});
    setTimeout(function(){r.remove()},560);
  },true);
})();
