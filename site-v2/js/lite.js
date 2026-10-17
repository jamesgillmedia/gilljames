/* lite players: nothing third-party loads until the visitor taps */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-embed]');if(!b)return;
  var f=document.createElement('iframe');f.src=b.dataset.embed;f.className='lite-frame';f.height=b.dataset.h||152;
  f.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';f.loading='lazy';f.title=b.dataset.title||'player';
  b.replaceWith(f)});
