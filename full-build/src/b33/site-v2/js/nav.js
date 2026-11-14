/* navigation memory: which way you're going (dive / rise) for the view transition, and which clusters you've visited */
(function(){
  var keys=(document.body.dataset.k||'').split(' ').filter(Boolean);
  if(keys.length)try{var v=JSON.parse(localStorage.getItem('gj-visited')||'[]');keys.forEach(function(k){if(v.indexOf(k)<0)v.push(k)});localStorage.setItem('gj-visited',JSON.stringify(v))}catch(e){}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-nav]');if(!a||e.defaultPrevented)return;
    var b=a.getBoundingClientRect(),n={dir:a.dataset.nav};if(n.dir==='dive'){n.x=b.left+b.width/2;n.y=b.top+b.height/2}
    try{sessionStorage.setItem('gj-nav',JSON.stringify(n))}catch(_){}});
  addEventListener('pageshow',function(e){if(e.persisted)document.documentElement.classList.remove('vt-dive','vt-rise','vt-in')});
})();
