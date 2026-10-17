/* motion gate (Vancouver V9 pattern): html.motion only when reduced-motion is off and IO exists,
   so every page is complete and readable without JS. */
(function(){
  var d=document.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)');
  if(rm.matches||!('IntersectionObserver' in window))return;
  d.classList.add('motion');
  /* reveal + poem stagger; the shell calls GJ.reveal(main) again for every page it swaps in */
  function go(root){root=root&&root.querySelectorAll?root:document;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in','go');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    root.querySelectorAll('.rv,.poem').forEach(function(el){io.observe(el)});
    root.querySelectorAll('.poem').forEach(function(p){[].forEach.call(p.children,function(s,k){s.style.transitionDelay=(0.25+k*0.32)+'s'})});
  }
  (window.GJ=window.GJ||{}).reveal=go;
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',function(){go()}):go();
})();
/* star-point tap state: tapped links flare briefly before navigating */
document.addEventListener('pointerdown',function(e){var a=e.target.closest&&e.target.closest('.flare');if(!a)return;
  document.querySelectorAll('.flare.lit').forEach(function(x){if(x!==a)x.classList.remove('lit')});a.classList.add('lit')});
/* sound button: off until tapped, never autoplays; choice remembered. No loop file yet (Gill picks one). */
(function(){var b=document.querySelector('.snd');if(!b)return;var t=b.querySelector('b');
  function set(on){b.setAttribute('aria-pressed',on?'true':'false');if(t)t.textContent=on?'sound on · loop coming':'sound off'}
  set(localStorage.getItem('gj-sound')==='1');
  b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';set(on);try{localStorage.setItem('gj-sound',on?'1':'0')}catch(e){}});
})();
