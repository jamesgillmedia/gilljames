/* work viewer for photo / objects: a star or a tile opens one work at #w=NN (a real, shareable URL).
   pushState on open, back closes. While it's open the sky is frozen and every touch goes to the viewer. */
(window.GJ=window.GJ||{}).mods=GJ.mods||{};
/* mounted by js/shell.js per page; listeners die with SIG */
GJ.mods.viewer=function(main,SIG){
  var V=main.querySelector('.viewer');if(!V)return;var O={signal:SIG};
  var A=Array.from(main.querySelectorAll('a[data-w]')),img=V.querySelector('img'),cap=V.querySelector('figcaption'),d=document.documentElement,cur=0,pushed=false,back2=null;
  function show(n){var a=A[n-1];if(!a){if(/^#w=/.test(location.hash)){pushed=false;history.replaceState(null,'',location.pathname+location.search)}return close(true)}
    if(!cur){var ae=document.activeElement;back2=ae&&ae!==document.body&&!V.contains(ae)?ae:null}cur=n;var im=a.querySelector('img');
    img.src=a.getAttribute('href');img.alt=im.alt;cap.textContent=im.alt;V.hidden=false;d.classList.add('frozen','modal');V.querySelector('.vx').focus({preventScroll:true});
    A.forEach(function(x){x.classList.toggle('lit',x===a)})}
  function close(silent){var was=cur;V.hidden=true;d.classList.remove('frozen','modal');img.removeAttribute('src');var a=back2||A[was-1];cur=0;back2=null;if(was&&a&&!silent&&document.contains(a))a.focus({preventScroll:true})}
  function fromHash(){var m=location.hash.match(/^#w=(\d+)/);if(m)show(+m[1]);else if(cur)close()}
  function go(n){n=(n-1+A.length)%A.length+1;history.replaceState(null,'','#w='+n);show(n)}
  function shut(){if(pushed){pushed=false;history.back()}else{history.replaceState(null,'',location.pathname+location.search);close()}}
  A.forEach(function(a){a.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey)return;e.preventDefault();pushed=true;location.hash='w='+a.dataset.w})});
  addEventListener('hashchange',function(){if(/^#w=/.test(location.hash)&&!cur)pushed=true;fromHash()},O);
  V.querySelector('.vx').addEventListener('click',shut);
  V.querySelector('.vp-prev').addEventListener('click',function(){go(cur-1)});V.querySelector('.vp-next').addEventListener('click',function(){go(cur+1)});
  V.addEventListener('click',function(e){if(e.target===V)shut()});
  addEventListener('keydown',function(e){if(!cur)return;if(e.key==='Tab'){trapTab(V,e);return}if(e.key==='Escape')shut();else if(e.key==='ArrowRight')go(cur+1);else if(e.key==='ArrowLeft')go(cur-1)},O);
  var sx=0,sy=0;V.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY});
  V.addEventListener('pointerup',function(e){var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))go(cur+(dx<0?1:-1));else if(dy>80)shut()});
  function trapTab(box,e){if(e.key!=='Tab')return;var f=Array.from(box.querySelectorAll('a[href],button:not([hidden]),iframe,video[controls],[tabindex]:not([tabindex="-1"])')).filter(function(x){return !x.closest('[hidden]')&&x.getClientRects().length});
  if(!f.length)return;var a=f[0],z=f[f.length-1],c=document.activeElement;if(!box.contains(c)){e.preventDefault();a.focus();return}
  if(e.shiftKey&&c===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&c===z){e.preventDefault();a.focus()}}
  SIG.addEventListener('abort',function(){if(cur){d.classList.remove('frozen','modal')}});
  fromHash();
};
/* sticky moon loop behind the gallery: plays only when motion is allowed and it's on screen */
GJ.mods.loop=function(main,SIG){var v=main.querySelector('[data-loop]');if(!v||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?v.play().catch(function(){}):v.pause()})});io.observe(v.closest('.loopwrap'));
  SIG.addEventListener('abort',function(){io.disconnect();v.pause()})};
