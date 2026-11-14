/* Slim To Go bar for Objects and Photo. Dotted waveform, full luma, above every scrim. It does not play. */
(function(){
  'use strict';
  var css=document.createElement('style');
  css.textContent='#togo{position:fixed;z-index:100;left:0;right:0;bottom:0;display:flex;align-items:center;gap:12px;height:calc(36px + env(safe-area-inset-bottom,0px));padding:0 14px env(safe-area-inset-bottom,0px);background:#04070b;color:#e8e4dc;opacity:1;pointer-events:none;font:400 11px/1 "Julius Sans One",Poppins,sans-serif;letter-spacing:.14em}#togo canvas{display:block;flex:0 0 auto;opacity:1}#togo span{opacity:1;white-space:nowrap}';
  document.head.appendChild(css);
  var peaks=[0.413,0.602,0.426,0.446,0.753,0.682,0.753,0.928,0.841,1,0.92,0.898,0.997,0.89,0.929,0.994,0.908,0.843];
  function mount(){
    if(document.getElementById('togo'))return;
    var bar=document.createElement('aside');bar.id='togo';bar.setAttribute('aria-label','To Go, Lost Coffee');
    var c=document.createElement('canvas');c.width=168;c.height=22;c.setAttribute('aria-hidden','true');
    var g=c.getContext('2d');g.fillStyle='#e8e4dc';
    peaks.forEach(function(p,i){var x=4+i*9,h=Math.max(2,p*16);g.beginPath();g.arc(x,18-h,1.15,0,6.283);g.fill();if(p>.45){g.beginPath();g.arc(x,18-h*.55,1,0,6.283);g.fill()}});
    var s=document.createElement('span');s.textContent='To Go · Lost Coffee';
    bar.appendChild(c);bar.appendChild(s);document.body.appendChild(bar);
  }
  if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
})();
