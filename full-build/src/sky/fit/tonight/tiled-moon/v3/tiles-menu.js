/* tiled-moon-v3 · category tiles menu (calmer nav, optional; the page opens as before). Same look as the m4 tiles menu
 (box:m4-tiles): a small grid button opens five category rows over the water (glyph, name, count), each with its
 room doors. Tap a row = open that chapter on this page. "swipe" opens the full-screen tiles (v3/idle-tiles.js).
 Close: ×, Escape, or tap the water around it. Nothing moves on its own. Reduce Motion changes nothing. */
(function(){
'use strict';
var top=document.querySelector('header.top');if(!top)return;
var ORDER=[['film','film'],['photo','photo'],['objects','objects'],['spaces','spaces'],['sound','sound'],['about','about']];
var btn=document.createElement('button');btn.type='button';btn.className='tm-btn';btn.setAttribute('aria-label','category tiles');btn.setAttribute('aria-expanded','false');
btn.innerHTML='<i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i>';
var list=top.querySelector('.list');top.insertBefore(btn,list||null);
var m=document.createElement('div');m.className='tm';m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-label','categories');
var h='<div class="tm-card"><div class="tm-hd"><span class="tm-sig" lang="cr">ᑕᐣᓯ</span><button type="button" class="tm-x" aria-label="close">×</button></div>';
ORDER.forEach(function(o){var k=o[0],hd=document.querySelector('#'+k+' > .head');if(!hd)return;
  var g=hd.querySelector('svg.glyph'),ct=hd.querySelector('.ct'),rooms=document.querySelectorAll('#'+k+' .links.rooms .lk');
  h+='<div class="tm-row"><a class="tm-go" href="'+hd.getAttribute('href')+'" data-k="'+k+'"><span class="tm-g">'+(g?g.outerHTML:'')+'</span><span class="tm-nm">'+o[1]+'</span><span class="tm-ct">'+(ct?ct.textContent:'')+'</span></a>';
  if(rooms.length){h+='<div class="tm-rooms">';[].forEach.call(rooms,function(r){h+='<a class="tm-room" href="'+r.getAttribute('href')+'">'+r.textContent+'</a>'});h+='</div>'}
  h+='</div>'});
h+='<button type="button" class="tm-swipe">full screen tiles ›</button></div>';
m.innerHTML=h;document.body.appendChild(m);
function open(on){m.hidden=!on;btn.setAttribute('aria-expanded',on?'true':'false');document.documentElement.classList.toggle('tm-on',!!on)}
btn.addEventListener('click',function(e){e.preventDefault();open(m.hidden)});
m.querySelector('.tm-x').addEventListener('click',function(){open(false)});
m.addEventListener('click',function(e){if(e.target===m)open(false)});
m.querySelector('.tm-swipe').addEventListener('click',function(){open(false);if(window.__idleTiles)__idleTiles.show()});
[].forEach.call(m.querySelectorAll('.tm-go'),function(a){a.addEventListener('click',function(e){e.preventDefault();open(false);var k=a.dataset.k,hd=document.querySelector('#'+k+' > .head'),sec=document.getElementById(k);
  if(sec)sec.scrollIntoView({block:'start'});if(hd&&hd.getAttribute('aria-expanded')!=='true')hd.click()})});
addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)open(false)});
window.__tilesMenu={open:open};
})();
