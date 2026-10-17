/* Scope player: 2.39 frame, controls in the black bars, timecode, cut rail + filmstrip (one thumb per cut).
   The reel loads only on tap (720p on phones, 1080p on wide screens). Film rows open in the same frame
   (Vimeo / YouTube) and set #play=NN so v1 links keep working. */
(function(){
  var S=window.GJ_SHOTS||[],F=window.GJ_FILMS||{},FPS=23.976;
  var root=document.querySelector('.scope');if(!root)return;
  var frame=root.querySelector('.frame'),big=root.querySelector('.big'),tc=root.querySelector('.tc'),ttl=root.querySelector('.ttl'),
      rail=root.querySelector('.rail'),head=root.querySelector('.head'),strip=root.querySelector('.strip'),lower=root.querySelector('.lower'),
      bPlay=root.querySelector('[data-a=play]'),bSnd=root.querySelector('[data-a=snd]'),bFull=root.querySelector('[data-a=full]'),bBack=root.querySelector('[data-a=back]'),bX=root.querySelector('[data-a=close]'),D=document.documentElement,pushed=false;
  var vid=null,dur=99.76,cur=-1;
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
      vid.addEventListener('play',function(){D.classList.add('frozen');frame.classList.add('playing');root.classList.remove('paused');bPlay.textContent='❚❚';bPlay.setAttribute('aria-label','pause')});
      vid.addEventListener('pause',function(){if(!D.classList.contains('player-open'))D.classList.remove('frozen');root.classList.add('paused');bPlay.textContent='▶';bPlay.setAttribute('aria-label','play')});
      vid.addEventListener('loadedmetadata',function(){dur=vid.duration;
        var hasA=vid.mozHasAudio||(vid.audioTracks&&vid.audioTracks.length);bSnd.hidden=!hasA});
      (function raf(){tick();requestAnimationFrame(raf)})()}
    if(at!=null){vid.currentTime=at}
    vid.play().catch(function(){})}
  function reel(){ /* back from an external film to the reel */
    var f=frame.querySelector('iframe');if(f)f.remove();frame.classList.remove('ext');D.classList.remove('player-open','modal');bX.hidden=true;if(!vid||vid.paused)D.classList.remove('frozen');ttl.textContent='film · reel 2026';
    bBack.hidden=true;bPlay.hidden=false;bFull.hidden=false;rail.hidden=false;strip.hidden=false;
    document.querySelectorAll('.row.lit').forEach(function(r){r.classList.remove('lit')});
    if(location.hash)history.replaceState(null,'',location.pathname+location.search)}
  big.addEventListener('click',function(){load()});
  bPlay.addEventListener('click',function(){if(!vid||vid.paused)load();else vid.pause()});
  bSnd.addEventListener('click',function(){if(!vid)return;vid.muted=!vid.muted;bSnd.setAttribute('aria-pressed',String(!vid.muted));bSnd.textContent=vid.muted?'♪̸':'♪'});
  bFull.addEventListener('click',function(){load();var el=vid;if(el.requestFullscreen)el.requestFullscreen();else if(el.webkitEnterFullscreen)el.webkitEnterFullscreen()});
  
  strip.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;reel();load(S[+b.dataset.i].t+.05)});
  function scrub(e){var r=rail.getBoundingClientRect();var x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));load(x*(vid&&vid.duration||dur))}
  rail.addEventListener('pointerdown',function(e){rail.setPointerCapture(e.pointerId);scrub(e);rail.onpointermove=scrub});
  rail.addEventListener('pointerup',function(){rail.onpointermove=null});
  addEventListener('keydown',function(e){if(e.target.closest('input,textarea'))return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var i=Math.max(0,Math.min(S.length-1,(cur<0?0:cur)+(e.key==='ArrowRight'?1:-1)));load(S[i].t+.05)}});
  setShot(1);tc.textContent=tcode(S[1]?S[1].t:0);head.style.left=((S[1]?S[1].t:0)/dur*100)+'%';
  /* film rows -> play in the frame, #play=NN */
  function playFilm(n,scroll){var f=F[n];if(!f)return;if(vid)vid.pause();
    var old=frame.querySelector('iframe');if(old)old.remove();
    var ifr=document.createElement('iframe');ifr.src=f.embed;ifr.allow='autoplay; fullscreen; picture-in-picture';ifr.title=f.title;
    frame.appendChild(ifr);frame.classList.add('ext');D.classList.add('player-open','frozen','modal');bX.hidden=false;bX.focus({preventScroll:true});frame.classList.remove('playing');
    ttl.textContent=f.title;tc.textContent=f.dur||'';lower.innerHTML='<span>'+esc(f.title)+'</span><small>'+esc(f.cat||'film')+'</small> <a href="'+f.url+'" target="_blank" rel="noopener">open ↗</a>';
    bBack.hidden=false;bPlay.hidden=true;bFull.hidden=true;rail.hidden=true;strip.hidden=true;bSnd.hidden=true;
    document.querySelectorAll('.row').forEach(function(r){r.classList.toggle('lit',r.dataset.n==n)});
    }
  function fromHash(){var m=location.hash.match(/play=(\d+)/);if(m)playFilm(+m[1]);else if(frame.classList.contains('ext'))reel()}
  addEventListener('hashchange',function(){if(/play=/.test(location.hash))pushed=true;fromHash()});fromHash();
  function shut(){if(pushed){pushed=false;history.back()}else reel()}
  bX.addEventListener('click',shut);bBack.addEventListener('click',shut);
  addEventListener('keydown',function(e){if(e.key==='Escape'&&D.classList.contains('player-open'))shut()});
  var sy0=null;root.addEventListener('pointerdown',function(e){sy0=e.target.closest('.rail,.strip')?null:e.clientY});root.addEventListener('pointerup',function(e){if(sy0!=null&&e.clientY-sy0>90&&D.classList.contains('player-open'))shut();sy0=null});
  /* filters (v1 categories, draft until Gill confirms) */
  var chips=document.querySelectorAll('.chip');
  chips.forEach(function(c){c.addEventListener('click',function(){chips.forEach(function(x){x.setAttribute('aria-pressed',String(x===c))});
    var k=c.dataset.f;document.querySelectorAll('.row').forEach(function(r){r.hidden=!(k==='all'||r.dataset.cat===k)})})});
})();
/* rows are real links to the film (work without JS); with JS they play in the Scope frame */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.row a');if(!a||e.metaKey||e.ctrlKey)return;
  e.preventDefault();var n=a.parentNode.dataset.n;if(location.hash==='#play='+n)dispatchEvent(new HashChangeEvent('hashchange'));else location.hash='play='+n});
