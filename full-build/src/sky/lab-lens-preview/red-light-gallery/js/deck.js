/* Control panel (12 Nov, 2:50 AM): the room, light and view controls move off the top bar onto a panel
   mounted low on the wall. Analog feel: a rocker for the room, a lever switch with a pilot light for the
   safelight, a stepped fader (7 detents) for room light, lever for video, selector keys for by light /
   grouping. Same buttons and handlers as before (the nodes are moved, not rebuilt). Never auto-advances.
   Same motion with Reduce Motion on. */
(function(){
'use strict';
var top=document.querySelector('.lab-top');if(!top)return;
var $=function(id){return document.getElementById(id)};
var deck=document.createElement('div');deck.className='deck';deck.id='deck';
deck.setAttribute('role','toolbar');deck.setAttribute('aria-label','control panel');
function plate(cls,label){var p=document.createElement('div');p.className='plate '+cls;var k=document.createElement('span');k.className='plate-k ju';k.setAttribute('aria-hidden','true');k.textContent=label;p.appendChild(k);deck.appendChild(p);return p}
var rooms=top.querySelector('.rooms'),modes=top.querySelector('.lab-modes'),amb=top.querySelector('.amb');
if(rooms)plate('p-room','room').appendChild(rooms);
var light=plate('p-light','light');
if($('safe')){$('safe').classList.add('sw');light.appendChild($('safe'))}
if(amb){var tk=document.createElement('span');tk.className='ticks';tk.setAttribute('aria-hidden','true');amb.appendChild(tk);light.appendChild(amb)}
var view=plate('p-view','view');
['sort','video','arrange'].forEach(function(id){var b=$(id);if(b){b.classList.add(id==='video'?'sw':'key');view.appendChild(b)}});
if(modes){while(modes.firstChild)view.appendChild(modes.firstChild);modes.remove()}
document.body.appendChild(deck);
/* room light: graded steps (28 → 130 in 7 detents) */
var r=$('amb');
if(r){r.step='17';var v=+r.value,s=28+Math.round((v-28)/17)*17;if(s!==v){r.value=String(s);r.dispatchEvent(new Event('input',{bubbles:true}))}}
function size(){document.documentElement.style.setProperty('--deck-h',deck.offsetHeight+'px')}
size();if(window.ResizeObserver)new ResizeObserver(size).observe(deck);window.addEventListener('resize',size);
document.documentElement.classList.add('has-deck');
})();
