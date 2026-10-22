/* gill james · site-v4-c (v4c) · SELECT on the column boards. Gill likes the sound player's press-to-select, so the boards work
   the same way: one press selects a work tile (a mint frame, its title in mint), a press on the selected tile opens it exactly as
   site-v4 did (dive.js / the About links), a press on another tile moves the selection. No hover states (the boards have none).
   - Only presses that would OPEN a work are held: column level 1 (the list that zooms to the grid) still zooms on one press.
   - Keyboard: Enter on a focused tile fires a click with detail 0 and goes straight through (focus is the selection).
   - Pinch and drag never produce a click; a scroll never selects. Loaded before dive.js; listens in the window capture phase
     so it runs before dive.js's document listener. The sky (js/sheet.js) has the same rule for its tiles and cards. */
(function(){'use strict';
var MINT='var(--mint,#55DAA1)',st=document.createElement('style');
st.textContent='.it.v4c-sel .vis{outline:2px solid '+MINT+';outline-offset:2px}.it.v4c-sel .cap b{color:'+MINT+'}'+
  '.card.v4c-sel .cv{outline:2px solid '+MINT+';outline-offset:2px}.card.v4c-sel .cc b{color:'+MINT+'}'+
  '.snear>span.v4c-sel{outline:2px solid '+MINT+';outline-offset:3px}';
document.head.appendChild(st);
var SEL=null;function clear(){if(SEL){SEL.classList.remove('v4c-sel');SEL=null}}
function lvOf(ch){var d=window.__dive&&__dive.state&&__dive.state();if(!d||!d.levels)return 2;var all=[].slice.call(document.querySelectorAll('.ch'));var i=all.indexOf(ch);return i>=0&&d.levels[i]!=null?d.levels[i]:2}
window.addEventListener('click',function(e){if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if(e.detail===0)return; /* keyboard Enter / programmatic: open as before */
  var t=e.target.closest&&e.target.closest('.ch .tile');if(!t)return;var it=t.parentNode,ch=t.closest('.ch');
  if(ch.dataset.k!=='about'&&lvOf(ch)<2)return; /* level 1: a press zooms the list into the grid, it does not open a work */
  if(SEL===it){clear();return} /* second press on the selected tile: let it open */
  e.preventDefault();e.stopImmediatePropagation();clear();SEL=it;it.classList.add('v4c-sel');
},true);
addEventListener('hashchange',clear);addEventListener('popstate',clear);
window.__v4cSel=function(){return SEL?SEL.dataset.k:null};
})();
