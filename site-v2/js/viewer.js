/* work viewer for photo / objects: a star or a tile opens one work at #w=NN (a real, shareable URL).
   pushState on open, back closes. While it's open the sky is frozen and every touch goes to the viewer. */
(function(){
  var V=document.querySelector('.viewer');if(!V)return;
  var A=Array.from(document.querySelectorAll('a[data-w]')),img=V.querySelector('img'),cap=V.querySelector('figcaption'),d=document.documentElement,cur=0,pushed=false;
  function show(n){var a=A[n-1];if(!a)return close(true);cur=n;var im=a.querySelector('img');
    img.src=a.getAttribute('href');img.alt=im.alt;cap.textContent=im.alt;V.hidden=false;d.classList.add('frozen','modal');V.querySelector('.vx').focus({preventScroll:true});
    A.forEach(function(x){x.classList.toggle('lit',x===a)})}
  function close(silent){V.hidden=true;d.classList.remove('frozen','modal');img.removeAttribute('src');var a=A[cur-1];cur=0;if(a&&!silent)a.focus({preventScroll:true})}
  function fromHash(){var m=location.hash.match(/^#w=(\d+)/);if(m)show(+m[1]);else if(cur)close()}
  function go(n){n=(n-1+A.length)%A.length+1;history.replaceState(null,'','#w='+n);show(n)}
  function shut(){if(pushed){pushed=false;history.back()}else{history.replaceState(null,'',location.pathname+location.search);close()}}
  A.forEach(function(a){a.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey)return;e.preventDefault();pushed=true;location.hash='w='+a.dataset.w})});
  addEventListener('hashchange',function(){if(/^#w=/.test(location.hash)&&!cur)pushed=true;fromHash()});
  V.querySelector('.vx').addEventListener('click',shut);
  V.querySelector('.vp-prev').addEventListener('click',function(){go(cur-1)});V.querySelector('.vp-next').addEventListener('click',function(){go(cur+1)});
  V.addEventListener('click',function(e){if(e.target===V)shut()});
  addEventListener('keydown',function(e){if(!cur)return;if(e.key==='Escape')shut();else if(e.key==='ArrowRight')go(cur+1);else if(e.key==='ArrowLeft')go(cur-1)});
  var sx=0,sy=0;V.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY});
  V.addEventListener('pointerup',function(e){var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))go(cur+(dx<0?1:-1));else if(dy>80)shut()});
  fromHash();
})();
/* sticky moon loop behind the gallery: plays only when motion is allowed and it's on screen */
(function(){var v=document.querySelector('[data-loop]');if(!v||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?v.play().catch(function(){}):v.pause()})}).observe(v.closest('.loopwrap'))})();
