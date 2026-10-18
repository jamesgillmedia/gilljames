/* Scope player: 2.39 frame, controls in the black bars, timecode, cut rail + filmstrip (one thumb per cut).
   The reel loads only on tap (720p on phones, 1080p on wide screens). Film rows open in the same frame
   (Vimeo / YouTube) and set #play=NN so v1 links keep working. */
(window.GJ=window.GJ||{}).mods=GJ.mods||{};
/* mounted by js/shell.js for each film page it shows; every listener is tied to SIG so leaving the page removes it */
GJ.mods.scope=function(main,SIG){
  var root=main.querySelector('.scope');if(!root)return;
  var S=window.GJ_SHOTS||[],F={},FPS=23.976;try{F=JSON.parse((main.querySelector('#gj-films')||{}).textContent||'{}')}catch(e){}
  var O={signal:SIG};
  var frame=root.querySelector('.frame'),big=root.querySelector('.big'),tc=root.querySelector('.tc'),ttl=root.querySelector('.ttl'),
      rail=root.querySelector('.rail'),head=root.querySelector('.head'),strip=root.querySelector('.strip'),lower=root.querySelector('.lower'),
      bPlay=root.querySelector('[data-a=play]'),bSnd=root.querySelector('[data-a=snd]'),bFull=root.querySelector('[data-a=full]'),bBack=root.querySelector('[data-a=back]'),bX=root.querySelector('[data-a=close]'),D=document.documentElement,pushed=false,back2=null;
  var vid=null,dur=99.76,cur=-1,cur2=null;
  function pad(n){return(n<10?'0':'')+n}
  function tcode(s){var f=Math.floor((s%1)*FPS);s=Math.floor(s);return'00:'+pad(Math.floor(s/60))+':'+pad(s%60)+':'+pad(f)}
  /* rail ticks: one per cut */
  S.forEach(function(sh){var t=document.createElement('i');t.className='tk'+(sh.film?' f':'');t.style.left=(sh.t/dur*100)+'%';rail.insertBefore(t,head)});
  function shotAt(s){for(var i=S.length-1;i>=0;i--)if(s>=S[i].t)return i;return 0}
  function setShot(i){if(i===cur)return;cur=i;var sh=S[i];if(!sh)return;
    [].forEach.call(strip.children,function(b,k){b.classList.toggle('on',k===i)});
    var b=strip.children[i];if(b&&strip.scrollWidth>strip.clientWidth){strip.scrollTo({left:b.offsetLeft-strip.clientWidth/2+b.clientWidth/2,behavior:'smooth'})}
    lower.innerHTML='<span>'+esc(sh.title)+'</span><small>shot '+sh.n+' of '+(S.length-2)+'</small>'+(sh.film&&F[sh.film]?' <a href="#play='+sh.film+'">full film ›</a>':'')}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function tick(){if(!vid)return;var s=vid.currentTime;tc.textContent=tcode(s);head.style.left=(s/(vid.duration||dur)*100)+'%';setShot(shotAt(s))}
  function load(at){
    if(!vid){vid=document.createElement('video');vid.muted=true;vid.playsInline=true;vid.setAttribute('playsinline','');vid.preload='auto';vid.loop=true;
      vid.poster=frame.querySelector('img.poster').src;
      vid.src=root.dataset[innerWidth<900?'src720':'src1080'];
      frame.insertBefore(vid,big);
      vid.addEventListener('timeupdate',tick);
      vid.addEventListener('play',function(){frame.classList.add('playing');root.classList.remove('paused');bPlay.textContent='❚❚';bPlay.setAttribute('aria-label','pause')});
      vid.addEventListener('pause',function(){root.classList.add('paused');bPlay.textContent='▶';bPlay.setAttribute('aria-label','play')});
      vid.addEventListener('loadedmetadata',function(){dur=vid.duration;
        var hasA=vid.mozHasAudio||(vid.audioTracks&&vid.audioTracks.length);bSnd.hidden=!hasA});
      /* timecode loop only while the reel actually plays (and not while the page scrolls) */
      var rq=0;function raf(){rq=0;if(SIG.aborted||vid.paused)return;if(!D.classList.contains('scrolling'))tick();rq=requestAnimationFrame(raf)}
      vid.addEventListener('play',function(){if(!rq)rq=requestAnimationFrame(raf)});vid.addEventListener('seeked',tick)}
    if(at!=null){vid.currentTime=at}
    vid.play().catch(function(){})}
  function reel(){ /* back from an external film to the reel */
    var f=frame.querySelector('iframe');if(f)f.remove();frame.classList.remove('ext');if(!R){D.classList.remove('player-open','modal');bX.hidden=true;D.classList.remove('frozen')} /* the sky only freezes while the full-screen overlay is open, never for the inline reel */ttl.textContent='film · reel 2026';
    bBack.hidden=true;bPlay.hidden=false;bFull.hidden=false;rail.hidden=false;strip.hidden=false;
    document.querySelectorAll('.row.lit').forEach(function(r){r.classList.remove('lit')});cur2=null;crumb(R?'reel 2026':null);pn();
    if(location.hash&&!R)history.replaceState(null,'',location.pathname+location.search);
    if(!R&&back2&&document.contains(back2)){try{back2.focus({preventScroll:true})}catch(_){}}back2=null}
  /* phones: the reel opens in the full-screen 2.39 player (with ✕, Back closes it); desktop plays it in place */
  var R=false,PH=matchMedia('(max-width: 899px), (pointer: coarse)');
  function openReel(){if(R)return;R=true;crumb('reel 2026');setTimeout(pn);var ae=document.activeElement;back2=ae&&ae!==document.body&&!root.contains(ae)?ae:null;
    D.classList.add('player-open','frozen','modal');root.classList.add('reelbig');bX.hidden=false;try{bX.focus({preventScroll:true})}catch(_){}}
  function closeReel(){if(!R)return;R=false;if(!frame.classList.contains('ext'))crumb(null);if(vid)vid.pause();root.classList.remove('reelbig');
    if(!frame.classList.contains('ext')){D.classList.remove('player-open','modal','frozen');bX.hidden=true}
    if(back2&&document.contains(back2)){try{back2.focus({preventScroll:true})}catch(_){}}back2=null}
  function start(at){if(PH.matches&&!R){if(location.hash!=='#reel'){pushed=true;history.pushState(history.state,'','#reel')}openReel()}load(at)}
  big.addEventListener('click',function(){start()});
  bPlay.addEventListener('click',function(){if(!vid||vid.paused)start();else vid.pause()});
  bSnd.addEventListener('click',function(){if(!vid)return;vid.muted=!vid.muted;bSnd.setAttribute('aria-pressed',String(!vid.muted));bSnd.textContent=vid.muted?'♪̸':'♪'});
  bFull.addEventListener('click',function(){load();var el=vid;
    if(el.requestFullscreen){var q=el.requestFullscreen();q&&q.then&&q.then(function(){try{var o=screen.orientation;o&&o.lock&&o.lock('landscape').catch(function(){})}catch(e){}},function(){});return} /* Android: full screen turns the picture sideways */
    /* iPhone: the native player can only go full screen once the metadata is in */
    function ios(){try{el.webkitEnterFullscreen()}catch(e){}}
    if(el.webkitEnterFullscreen){if(el.readyState>=1)ios();else el.addEventListener('loadedmetadata',ios,{once:true})}});
  
  strip.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(frame.classList.contains('ext'))reel();start(S[+b.dataset.i].t+.05)});
  function scrub(e){var r=rail.getBoundingClientRect();var x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));load(x*(vid&&vid.duration||dur))}
  rail.addEventListener('pointerdown',function(e){rail.setPointerCapture(e.pointerId);scrub(e);rail.onpointermove=scrub});
  rail.addEventListener('pointerup',function(){rail.onpointermove=null});
  addEventListener('keydown',function(e){if(e.target.closest('input,textarea'))return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var i=Math.max(0,Math.min(S.length-1,(cur<0?0:cur)+(e.key==='ArrowRight'?1:-1)));load(S[i].t+.05)}},O);
  setShot(1);tc.textContent=tcode(S[1]?S[1].t:0);head.style.left=((S[1]?S[1].t:0)/dur*100)+'%';
  /* film rows -> play in the frame, #play=NN */
  function playFilm(n,scroll){var f=F[n];if(!f)return;if(vid)vid.pause();
    var old=frame.querySelector('iframe');if(old)old.remove();
    var ifr=document.createElement('iframe');ifr.src=f.embed;ifr.allow='autoplay; fullscreen; picture-in-picture';ifr.title=f.title;
    if(!D.classList.contains('player-open')){var ae=document.activeElement;back2=ae&&ae!==document.body&&!root.contains(ae)?ae:null}
    frame.appendChild(ifr);frame.classList.add('ext');D.classList.add('player-open','frozen','modal');bX.hidden=false;bX.focus({preventScroll:true});frame.classList.remove('playing');
    ttl.textContent=f.title;tc.textContent=f.dur||'';lower.innerHTML='<span>'+esc(f.title)+'</span><small>'+esc(f.cat||'film')+'</small> <a href="'+f.url+'" target="_blank" rel="noopener">open ↗</a>';
    bBack.hidden=false;bPlay.hidden=true;bFull.hidden=true;rail.hidden=true;strip.hidden=true;bSnd.hidden=true;
    document.querySelectorAll('.row').forEach(function(r){r.classList.toggle('lit',r.dataset.n==n)});
    cur2=+n;crumb(f.title);pn()}
  function fromHash(){var m=location.hash.match(/play=(\d+)/);
    if(m&&!F[+m[1]]){pushed=false;history.replaceState(null,'',location.pathname+location.search);m=null} /* dead or invalid #play= -> clean URL */
    if(m){playFilm(+m[1]);return}if(frame.classList.contains('ext'))reel();
    if(location.hash==='#reel'){openReel();load()}else if(R)closeReel()}
  window.__scopePushed=function(){pushed=true};window.__scopeFrom=function(){fromHash()};
  window.__scopeSwap=function(n){if(!F[n])return false;history.replaceState(null,'','#play='+n);playFilm(+n);return true};
  addEventListener('hashchange',function(){if(/play=|^#reel$/.test(location.hash))pushed=true;fromHash()},O);fromHash();
  function shut(){if(pushed){pushed=false;history.back()}else{if(frame.classList.contains('ext'))reel();if(R){closeReel();if(location.hash==='#reel')history.replaceState(history.state,'',location.pathname+location.search)}}}
  /* C-09 #6: visible twins for the gestures: ‹ prev / next › and ✕ close, as words in the thumb zone */
  var pnv=root.querySelector('.pnav'),FK=Object.keys(F).map(Number).sort(function(a,b){return a-b});
  function crumb(t){window.GJ&&GJ.crumb&&GJ.crumb(t)}
  function pn(){if(!pnv)return;var ext=frame.classList.contains('ext');
    pnv.querySelector('[data-a=pprev]').textContent=ext?'‹ prev film':'‹ prev shot';pnv.querySelector('[data-a=pnext]').textContent=ext?'next film ›':'next shot ›';
    pnv.querySelector('[data-a=pclose]').textContent=ext?'✕ close · back to film':'✕ close'}
  if(pnv)pnv.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=b.dataset.a;
    if(a==='pclose'){shut();return}var dir=a==='pnext'?1:-1;
    if(frame.classList.contains('ext')&&cur2!=null){var i=FK.indexOf(cur2),n=FK[(i+dir+FK.length)%FK.length];window.__scopeSwap(n);return}
    var k=Math.max(1,Math.min(S.length-2,(cur<1?1:cur)+dir));load(S[k].t+.05)},O);
  pn();
  bX.addEventListener('click',shut);bBack.addEventListener('click',shut);
  addEventListener('keydown',function(e){if(!D.classList.contains('player-open'))return;if(e.key==='Escape')shut();else trapTab(root,e)},O);
  /* ctrl/pinch-wheel over the player would zoom the browser page: block it */
  root.addEventListener('wheel',function(e){if(e.ctrlKey||D.classList.contains('player-open'))e.preventDefault()},{passive:false});
  function trapTab(box,e){if(e.key!=='Tab')return;var f=Array.from(box.querySelectorAll('a[href],button:not([hidden]),iframe,video[controls],[tabindex]:not([tabindex="-1"])')).filter(function(x){return !x.closest('[hidden]')&&x.getClientRects().length});
  if(!f.length)return;var a=f[0],z=f[f.length-1],c=document.activeElement;if(!box.contains(c)){e.preventDefault();a.focus();return}
  if(e.shiftKey&&c===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&c===z){e.preventDefault();a.focus()}}

  var sy0=null;root.addEventListener('pointerdown',function(e){sy0=e.target.closest('.rail,.strip')?null:e.clientY});root.addEventListener('pointerup',function(e){if(sy0!=null&&e.clientY-sy0>90&&D.classList.contains('player-open'))shut();sy0=null});
  /* filters (v1 categories, draft until Gill confirms) */
  var chips=document.querySelectorAll('.chip');
  chips.forEach(function(c){c.addEventListener('click',function(){chips.forEach(function(x){x.setAttribute('aria-pressed',String(x===c))});
    var k=c.dataset.f;document.querySelectorAll('.row').forEach(function(r){r.hidden=!(k==='all'||r.dataset.cat===k)})})});
/* rows are real links to the film (work without JS); with JS they play in the Scope frame */
main.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.row a');if(!a||e.metaKey||e.ctrlKey)return;
  e.preventDefault();var n=a.parentNode.dataset.n;
  if(document.documentElement.classList.contains('player-open')&&window.__scopeSwap&&window.__scopeSwap(n))return; /* another film while one is open: replace, so ✕ doesn't reopen the first */
  openN(n)},O);
/* push #play=NN without a fragment jump (assigning location.hash scrolls the page to the top when no element matches) */
function openN(n){if(location.hash!=='#play='+n)history.pushState(history.state,'','#play='+n);window.__scopePushed&&window.__scopePushed();window.__scopeFrom&&window.__scopeFrom()}
/* any other same-page #play= link (sky band stars) while a film is open: replace too */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="#play="]');if(!a||a.closest('.row')||e.metaKey||e.ctrlKey||e.defaultPrevented)return;
  var u=new URL(a.href,location.href);if(u.pathname!==location.pathname||!document.documentElement.classList.contains('player-open'))return;
  var n=(u.hash.match(/play=(\d+)/)||[])[1];if(n&&window.__scopeSwap&&window.__scopeSwap(n))e.preventDefault()},O);
/* same-page #play= links (sky band stars) when no film is open: open without the fragment jump */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="#play="]');if(!a||a.closest('.row')||e.metaKey||e.ctrlKey||e.defaultPrevented)return;
  var u=new URL(a.href,location.href);if(u.pathname!==location.pathname)return;var n=(u.hash.match(/play=(\d+)/)||[])[1];if(!n)return;e.preventDefault();openN(n)},O);
  SIG.addEventListener('abort',function(){if(vid){vid.pause();vid.removeAttribute('src');vid.load()}D.classList.remove('player-open','frozen','modal')});
};
