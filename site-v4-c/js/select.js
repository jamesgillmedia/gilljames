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

/* v4c MED-1 safety net: index.html, list/ and the chapter pages already link inside site-v4-c. Any link added later by shared
   v4 code that still points into /site-v4/ (a page, not its js/ css/) is pointed at the same place in /site-v4-c/ just before
   it is used (press, click, middle-click, keyboard focus, long-press menu). Runs on window in the capture phase, before the page's own handlers. */
(function(){
  var RE=/\/site-v4\/(?!js\/|css\/)/;
  function fix(a){if(!a||!a.getAttribute)return;var h=a.getAttribute('href');if(!h)return;
    if(h.indexOf('../site-v4/')===0&&!/^\.\.\/site-v4\/(js|css)\//.test(h)){a.setAttribute('href','../site-v4-c/'+h.slice(11));return}
    try{var u=new URL(a.href);if(u.origin===location.origin&&RE.test(u.pathname)){u.pathname=u.pathname.replace('/site-v4/','/site-v4-c/');a.href=u.href}}catch(e){}}
  function on(e){var t=e.target;if(t&&t.closest)fix(t.closest('a[href]'))}
  ['pointerdown','click','auxclick','focusin','contextmenu'].forEach(function(n){addEventListener(n,on,true)});
  function all(){[].forEach.call(document.querySelectorAll('a[href]'),fix)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',all);else all();
  window.__v4cLinks={fix:fix,all:all};
})();

/* v4c LOW-1: the work sheet's caption / credits list. Rows that only hold the "[Gill writes]" placeholder are hidden by CSS in index.html;
   when no row has real text, the whole list is hidden too (no empty box). */
(function(){
  function chk(){[].forEach.call(document.querySelectorAll('.imm-c'),function(d){var real=[].some.call(d.querySelectorAll('dd'),function(dd){var c=dd.cloneNode(true);[].forEach.call(c.querySelectorAll('.ph'),function(x){x.remove()});return c.textContent.trim().length>0});d.classList.toggle('v4c-empty',!real)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',chk);else chk();
})();
