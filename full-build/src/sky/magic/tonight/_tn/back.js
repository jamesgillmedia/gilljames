/* tonight · the way back to the sky (magic baseline 1112; spec K12, FIX-PLAN C5/C7).
 No pill, no added corner mark, no hub. The ᑕᐣᓯ already in each piece's own bar keeps its own behaviour (it flies to that
 piece's FAR in one move). Tapped again at that FAR, or Esc at a room's top level, it goes back to the star you came in from in
 the constellation: the browser's own Back when you came from there (the camera is still where you left it), else the
 constellation restores its saved camera (#back). Nothing here moves on its own; Reduce Motion changes nothing.
 The page that loads this sets data-tn-root (relative path to the tonight/ root). */
(function(){
  var s=document.currentScript,root=(s&&s.getAttribute('data-tn-root'))||'./';
  try{if(window.self!==window.top)return}catch(e){return}
  if(s&&s.getAttribute('data-tn-mode')==='own')return;
  var MARK=/^\s*ᑕᐣᓯ\s*$/;
  function fromSky(){try{var r=document.referrer&&new URL(document.referrer);return !!(r&&r.origin===location.origin&&/\/constellation-blend\//.test(r.pathname))}catch(e){return false}}
  function toSky(){
    var u=new URL(root+'constellation-blend/',location.href);
    if(fromSky()&&history.length>1){history.back();return}
    location.href=u.pathname+'#back'}
  function atTop(){var h=document.documentElement;return !h.classList.contains('deep')&&(!location.hash||location.hash==='#')&&!document.querySelector('[role=dialog]:not([hidden])')}
  function findMark(){
    var sel='a.sig,button.sig,.sig,[data-mark],#mark,a[lang="cr"],button[lang="cr"]';
    var c=[].slice.call(document.querySelectorAll(sel));
    for(var i=0;i<c.length;i++){var e=c[i],r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
      if(r.top<140&&r.left<window.innerWidth*0.5&&MARK.test(e.textContent||''))return e}
    return null}
  var wired=false;
  function wire(){
    if(wired)return;var m=findMark();if(!m)return;wired=true;
    var href=m.tagName==='A'?(m.getAttribute('href')||''):'';
    if(href&&href.charAt(0)!=='#'){/* the piece's own mark link (its FAR, K12): untouched */return}
    m.addEventListener('click',function(e){if(atTop()){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();toSky()}},true);
    ['pointerdown','touchstart','mousedown'].forEach(function(t){m.addEventListener(t,function(e){e.stopPropagation()},{passive:true,capture:true})})}
  /* Esc at a room's top level: one level out = back to the star (the room's own Esc runs first and wins) */
  var pre=false;
  addEventListener('keydown',function(e){pre=e.key==='Escape'&&atTop()},true);   /* only when the room was already at its top before this Esc */
  addEventListener('keydown',function(e){if(e.key!=='Escape'||e.defaultPrevented||!pre)return;var t=e.target;if(t&&t.closest&&t.closest('input,select,textarea'))return;
    setTimeout(function(){if(!e.defaultPrevented&&atTop()&&fromSky())toSky()},0)});
  function later(){wire();[300,1000,2000].forEach(function(t){setTimeout(wire,t)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later);else later();
})();
