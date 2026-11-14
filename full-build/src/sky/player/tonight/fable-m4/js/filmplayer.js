/* Film room pass (Nov 13): the featured player.
 A work with real stills opens on those stills. The first still is up at once. The next one waits
 until it has decoded, then cuts in at full opacity. The outgoing still stays fully bright until
 that cut. No dissolve, including with Reduce Motion. Under it: a thin progress line, a filmstrip
 (every thumb at full brightness; the selected one is a warm-white line), the title, role · year,
 verified awards and credits, then the other featured films at full brightness.
 The player is a full-size state, not a scrolling page. A slim To Go bar stays at full brightness.
 Tapping the bar grows the player from the touch point. A downward swipe shrinks it back into the bar.
 A sideways swipe on the picture steps the still, the same full-brightness cut. Tapping another
 featured card grows that film from the card. */
(function(){
'use strict';
var FEAT=['film/one-with-the-devil','film/weird-kid','film/back-to-the-start','film/backward-fall','film/legends'];
var HOLDS={A:3400,B:5000,C:2400},FP={t:0,i:0,root:null,rail:null,raf:0,unpause:null,reel:null,loop:false},FROM=null,BAR=null;
function hold(){var v=window.GJ_VAR?GJ_VAR.get('film'):'A';return HOLDS[v]||3400}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function parts(t){t=String(t||'');var i=t.lastIndexOf(' · ');if(i<0)return {pre:'',name:t};return {pre:t.slice(0,i),name:t.slice(i+3).replace(/^['‘’"“”]+|['‘’"“”]+$/g,'')}}
function byId(id){return window.__u1&&__u1.byId?__u1.byId(id):null}
function roleLine(w){var b=[];if(w.role)b.push(w.role);if(w.year)b.push(String(w.year));return b.join(' · ')}
function filmOn(){var u=window.__u1;return !!(u&&u.cur&&u.cur.k==='film')}
function halt(){if(FP.t){clearInterval(FP.t);FP.t=0}}
function stop(){
  halt();
  if(FP.raf){cancelAnimationFrame(FP.raf);FP.raf=0}
  if(FP.rail){FP.rail.destroy();FP.rail=null}
  if(FP.unpause){window.removeEventListener('gjpause',FP.unpause);FP.unpause=null}
  if(FP.reel){try{FP.reel.stop()}catch(e){}FP.reel=null}
  if(FP.root){var v=FP.root.querySelector('video.fp-loop');if(v){try{v.pause()}catch(e){}}}
}
/* Every film that has a loop plays it as the player hero: poster, then the AV1 / VP9 / H.264 ladder from playback.js (the 720 rung for the
   featured films). The stills slideshow only runs for a film without a loop. Reduce Motion does not freeze the loop. */
function paused(){return !!(window.GJ_PLAY&&GJ_PLAY.paused)}
function setShared(on){if(window.GJ_PLAY&&GJ_PLAY.setPaused)GJ_PLAY.setPaused(!!on,true)}
function loopOf(work){
  var slug=work&&work.slug;
  if(!slug||!window.GJ_PLAY||!GJ_PLAY.hasLoop(slug))return null;
  var rung=GJ_PLAY.rungFor(slug),post=GJ_PLAY.poster(slug,rung);
  var src=GJ_PLAY.sources(slug,rung).map(function(x){return '<source src="'+x.src+'" type=\''+x.type+'\'>'}).join('');
  return {slug:slug,html:'<video class="fp-loop" muted playsinline webkit-playsinline loop preload="auto" poster="'+esc(post)+'" data-gj-slug="'+slug+'" data-gj-done="'+slug+'" aria-label="'+esc(work.title||'')+'">'+src+'</video>'};
}
function playVideo(v){
  if(!v||paused())return;
  var p=v.play();if(p&&p.catch)p.catch(function(){});
}
function armLoop(root){
  var v=root&&root.querySelector('video.fp-loop');if(!v)return;
  v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');
  v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
  v.loop=true;
  /* The loop cuts in once a frame is decoded. It does not fade over the still. */
  function show(){v.classList.add('live')}
  v.addEventListener('loadeddata',show);
  v.addEventListener('playing',show);
  if(v.readyState>=2)show();
  playVideo(v);
}
var showGen=0;
function decodeIm(im){
  if(!im)return Promise.resolve();
  if(typeof im.decode==='function')return im.decode().catch(function(){});
  if(im.complete&&im.naturalWidth)return Promise.resolve();
  return new Promise(function(res){
    im.addEventListener('load',function(){res()},{once:true});
    im.addEventListener('error',function(){res()},{once:true});
  });
}
/* The plate behind the stack keeps the outgoing still, so a gap between bitmaps cannot flash black. */
function plate(frame,im){
  if(!frame||!im)return;
  var src=im.currentSrc||im.getAttribute('src')||'';
  if(!src)return;
  frame.style.backgroundImage='url("'+String(src).replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'")';
  frame.style.backgroundSize='cover';
  frame.style.backgroundPosition='center';
  frame.style.backgroundColor='#04070b';
}
function show(i,first){
  var r=FP.root;if(!r||!r.isConnected){stop();return}
  var ims=r.querySelectorAll('.fp-frame>img:not(.fr-pv)'),th=r.querySelectorAll('.fp-strip button'),n=ims.length;if(!n)return;
  i=((i%n)+n)%n;
  var prev=FP.i,gen=++showGen;
  function mark(){
    for(var k=0;k<n;k++)if(th[k])th[k].classList.toggle('on',k===i);
    var bar=r.querySelector('.fp-bar i');if(bar)bar.style.width=(((i+1)/n)*100).toFixed(2)+'%';
    var st=r.querySelector('.fp-strip'),cur=th[i];
    if(st&&cur&&st.scrollWidth>st.clientWidth+2){var x=cur.offsetLeft-st.clientWidth/2+cur.clientWidth/2;st.scrollLeft=Math.max(0,x)}
  }
  function cut(){
    if(gen!==showGen||!r.isConnected)return;
    var frame=r.querySelector('.fp-frame'),incoming=ims[i],outgoing=ims[prev];
    plate(frame,outgoing&&outgoing.classList.contains('on')?outgoing:incoming);
    if(incoming){incoming.style.zIndex='3';incoming.classList.add('on')}
    FP.i=i;mark();
    requestAnimationFrame(function(){
      if(gen!==showGen||!r.isConnected)return;
      for(var k=0;k<n;k++)if(k!==i){ims[k].classList.remove('on');ims[k].style.zIndex=''}
      plate(frame,incoming);
    });
  }
  if(first||i===prev){
    FP.i=i;
    for(var k=0;k<n;k++){
      var on=k===i;
      ims[k].classList.toggle('on',on);
      ims[k].style.zIndex=on?'3':'';
    }
    mark();
    plate(r.querySelector('.fp-frame'),ims[i]);
    return;
  }
  /* Leave the current still fully opaque until the next bitmap is ready, then cut. Never a partial fade. */
  decodeIm(ims[i]).then(cut);
}
function run(){halt();FP.t=setInterval(function(){if(document.hidden)return;show(FP.i+1)},hold())}
function card(w){
  var p=parts(w.title),still=(w.media&&w.media.thumb)||(w.stills&&w.stills[0])||'';
  if(w.id==='film/weird-kid')p={pre:'Chris Malinchak and Kiesza',name:'Weird Kid'};
  return '<a class="fp-card" href="#film/'+esc(w.slug)+'" data-open="'+esc(w.id)+'">'+
    '<span class="fp-cim"><img src="'+esc(still)+'" alt=""></span>'+
    '<b>'+esc(p.name)+'</b>'+(p.pre?'<small>'+esc(p.pre)+'</small>':'')+
    (w.role?'<em>'+esc(w.role)+'</em>':'')+'</a>';
}
function playScale(el, from, to, ms, ease){
  if(!el)return;
  if(el.getAnimations)el.getAnimations().forEach(function(a){a.cancel()});
  if(!el.animate){el.style.transform=to;return}
  el.animate([{transform:from},{transform:to}],{duration:ms,easing:ease,fill:'both'});
}
function applyFrom(sheet){
  var f=FROM;FROM=null;if(!f||!sheet)return;
  var sx=Math.max(0.08,Math.min(0.85,(f.w||80)/Math.max(1,innerWidth)));
  var sy=Math.max(0.08,Math.min(0.85,(f.h||48)/Math.max(1,innerHeight)));
  sheet.style.transformOrigin=(f.x||innerWidth/2)+'px '+(f.y||innerHeight-40)+'px';
  sheet.classList.add('fp-from');
  playScale(sheet,'scale('+sx.toFixed(3)+','+sy.toFixed(3)+')','scale(1,1)',600,'cubic-bezier(.22,.7,.2,1)');
}
function loopFrames(slug){
  var m=window.GJ_LOOPFR&&GJ_LOOPFR[slug];
  if(!m)return null;
  return {n:m[0],w:m[1],h:m[2],dur:m[3],url:function(i){return 'media/loopframes/'+slug+'-'+(i<10?'0':'')+i+'.webp'}};
}
function infoHtml(work){
  var aw=(work.awards||[]).map(function(a){return '<li>'+esc(a)+'</li>'}).join('');
  var cr=(work.credits||[]).filter(function(c){return c&&c!==work.role}).map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
  return (aw||cr)?'<div class="fp-info">'+(aw?'<p class="fp-lab">awards</p><ul class="fp-aw">'+aw+'</ul>':'')+(cr?'<p class="fp-lab">credits</p><ul class="fp-cr">'+cr+'</ul>':'')+'</div>':'';
}
function nextHtml(work){
  var next=FEAT.filter(function(id){return id!==work.id}).map(byId).filter(function(w){return w&&w.title}).map(card).join('');
  return next?'<div class="fp-next"><p class="fp-lab">featured</p><div class="fp-cards">'+next+'</div></div>':'';
}
/* The player's chrome, shared by every film and by the Demo Reel: title block, then (below the fold) stills, credits and awards, then featured. */
function shell(el,work,o){
  var p=parts(work.title);
  if(work.id==='film/weird-kid')p={pre:'Chris Malinchak and Kiesza',name:'Weird Kid'};
  el.innerHTML='<div class="sheet film lv1 full fp fp-full'+(o.reel?' fp-reel':'')+(o.loop?' fp-hasloop':'')+'">'+
    '<div class="fp-main"><div class="fp-stage"><div class="fp-spill" aria-hidden="true"></div>'+
      '<div class="heroframe fp-frame" style="background-color:#04070b;'+(o.first?'background-image:url(\''+esc(o.first)+'\');background-size:cover;background-position:center':'')+'">'+(o.heroInner||'')+'</div>'+
      '<div class="fp-bar" aria-hidden="true"><i></i></div>'+
      '<div class="fp-railhost"></div>'+(o.strip||'')+'</div>'+
    '<div class="fp-meta">'+(p.pre?'<small class="fp-pre">'+esc(p.pre)+'</small>':'')+'<h3 class="fp-t">'+esc(p.name)+'</h3>'+
      (roleLine(work)?'<p class="fp-r">'+esc(roleLine(work))+'</p>':'')+'</div></div>'+
    (o.wall||'')+infoHtml(work)+nextHtml(work)+'</div>';
  return el.querySelector('.sheet.fp');
}
function wire(root,el,o){
  var y0=0,y1=0,x0=0,x1=0,pid=0,drag=false,ptype='mouse',tgt=null;
  function onMove(e){if(drag&&e.pointerId===pid){y1=e.clientY;x1=e.clientX}}
  function endDrag(e){
    if(!drag||e.pointerId!==pid)return;drag=false;
    window.removeEventListener('pointermove',onMove,true);
    window.removeEventListener('pointerup',endDrag,true);
    window.removeEventListener('pointercancel',endDrag,true);
    window.removeEventListener('mouseup',endMouse,true);
    if(e.stopPropagation)e.stopPropagation();
    var y=e.type==='pointercancel'?y1:e.clientY;
    var x=e.type==='pointercancel'?x1:e.clientX;
    var dx=x-x0,dy=y-y0;
    if(e.type==='pointercancel')return;
    /* A tap on the picture pauses or resumes the one shared state (board, reel card and player). */
    if(Math.abs(dx)<10&&Math.abs(dy)<10&&tgt&&tgt.closest&&tgt.closest('.fp-frame')&&!tgt.closest('a,button,input')){setShared(!paused());return}
    /* Sideways steps the still (only when the stills are the show: a film with a loop has the frame rail). */
    if(!o.loop&&!o.reel&&Math.abs(dx)>56&&Math.abs(dx)>Math.abs(dy)*1.25){show(FP.i+(dx<0?1:-1));run();return}
    if(ptype!=='touch'&&dy>64&&root.scrollTop<=0&&Math.abs(dy)>Math.abs(dx))shrink();
  }
  function endMouse(e){
    if(!drag)return;
    endDrag({pointerId:pid,clientX:e.clientX!=null?e.clientX:x1,clientY:e.clientY,type:'pointerup'});
  }
  root.addEventListener('pointerdown',function(e){
    if(e.target.closest('a,button,input,.fr-rail,.rl-fs,.rl-fit,.framewall img'))return;
    e.stopPropagation();
    y0=y1=e.clientY;x0=x1=e.clientX;pid=e.pointerId;drag=true;ptype=e.pointerType||'mouse';tgt=e.target;
    window.addEventListener('pointermove',onMove,true);
    window.addEventListener('pointerup',endDrag,true);
    window.addEventListener('pointercancel',endDrag,true);
    window.addEventListener('mouseup',endMouse,true);
  },true);
  /* Touch: the browser scrolls the sheet. A pull down from the very top shrinks it back into the bar. */
  var ty=0,top0=-1,tx=0,onRail=false;
  root.addEventListener('touchstart',function(e){
    if(e.touches.length!==1){top0=-1;return}
    ty=e.touches[0].clientY;tx=e.touches[0].clientX;top0=root.scrollTop;onRail=!!(e.target.closest&&e.target.closest('.fr-rail,.rl-fs'));
  },{passive:true});
  root.addEventListener('touchend',function(e){
    if(top0!==0||onRail||!e.changedTouches.length){top0=-1;return}
    var dy=e.changedTouches[0].clientY-ty,dx=e.changedTouches[0].clientX-tx;
    var was=top0;top0=-1;
    if(was===0&&root.scrollTop<=0&&dy>110&&Math.abs(dy)>Math.abs(dx)*1.5)shrink();
  },{passive:true});
  [].forEach.call(el.querySelectorAll('.fp-strip button'),function(b,i){
    b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();show(i);run()});
  });
  [].forEach.call(el.querySelectorAll('.fp-card[data-open]'),function(a){
    a.addEventListener('click',function(ev){
      ev.preventDefault();ev.stopPropagation();
      var id=a.getAttribute('data-open'),w=byId(id),box=a.getBoundingClientRect();
      whenStill(w&&w.stills&&w.stills[0],function(){
        FROM={x:box.left+box.width/2,y:box.top+box.height/2,w:box.width,h:box.height};
        stop();
        if(window.__u1&&__u1.open)__u1.open(id);
      });
    });
  });
}
/* One frame loop while the player is open: the rail's playhead and the progress line follow the clip. */
function tickFrame(){
  FP.raf=0;
  var r=FP.root;if(!r||!r.isConnected)return;
  var v=r.querySelector('video.fp-loop');
  if(FP.rail)FP.rail.sync();
  if(v&&v.duration){var bar=r.querySelector('.fp-bar i');if(bar){bar.style.transition='none';bar.style.width=((v.currentTime/v.duration)*100).toFixed(2)+'%'}}
  FP.raf=requestAnimationFrame(tickFrame);
}
function onSharedPause(){
  var r=FP.root;if(!r||!r.isConnected)return;
  var v=r.querySelector('video.fp-loop');
  if(paused()){halt();if(v&&!v.paused)v.pause()}
  else{if(v)playVideo(v);else if(!FP.loop&&!FP.reel)run()}
  if(FP.rail)FP.rail.refresh();
}
function paint(el,work,under,opts){
  stop();
  if(window.GJ_DEPTH&&GJ_DEPTH.hush)GJ_DEPTH.hush();
  opts=opts||{};
  var st=(opts.stills||work.stills||[]).slice(),first=st[0]||'';
  var lp=loopOf(work),hasLoop=!!lp;
  var frames=st.map(function(s,i){
    return '<img src="'+esc(s)+'" alt=""'+(i===0?' class="on fp-now" fetchpriority="high"':'')+'>';
  }).join('');
  var strip=(hasLoop||st.length<2)?'':'<div class="fp-strip" role="group" aria-label="stills">'+st.map(function(s,i){return '<button type="button" aria-label="still '+(i+1)+'"'+(i===0?' class="on"':'')+'><img src="'+esc(s)+'" alt=""></button>'}).join('')+'</div>';
  var wall=under||(st.length?'<div class="framewall under">'+st.map(function(s){return '<img src="'+esc(s)+'" alt="">'}).join('')+'</div>':'');
  var root=shell(el,work,{first:first,heroInner:frames+(lp?lp.html:''),strip:strip,wall:wall,loop:hasLoop});
  FP.root=root;FP.i=0;FP.loop=hasLoop;
  [].forEach.call(root.querySelectorAll('.fp-frame>img:not(.fr-pv)'),decodeIm);
  applyFrom(root);
  wire(root,el,{loop:hasLoop});
  FP.unpause=onSharedPause;window.addEventListener('gjpause',FP.unpause);
  show(0,true);
  var v=root.querySelector('video.fp-loop');
  if(hasLoop){
    armLoop(root);
    if(window.GJ_RAIL){
      var frame=root.querySelector('.fp-frame');
      FP.rail=GJ_RAIL.create(root.querySelector('.fp-railhost'),{
        video:function(){return v},playing:function(){return !paused()},
        setPlaying:function(on){setShared(!on)},
        activate:function(x){x.classList.add('live')},thumbHost:frame,eventHost:frame
      });
      FP.rail.set(loopFrames(lp.slug));
    }
    FP.raf=requestAnimationFrame(tickFrame);
  }else if(!paused())run();
  syncBar();
}
/* The Demo Reel opens into the same player: same chrome, grow-from-card, To Go bar, stills, featured; the hero is the reel card (reelview.js). */
function paintReel(el,it,rh){
  stop();
  if(window.GJ_DEPTH&&GJ_DEPTH.hush)GJ_DEPTH.hush();
  var R=window.GJ_REEL||[],pick=[],k;
  for(k=0;k<R.length;k+=4)pick.push('media/pro2/reel/'+R[k].f+'.webp');
  var wall='<div class="framewall under">'+pick.map(function(s){return '<img src="'+esc(s)+'" alt="">'}).join('')+'</div>';
  var work={id:it.id,title:it.title||'Demo Reel',role:'',credits:[],awards:[],year:it.year};
  var root=shell(el,work,{reel:true,wall:wall});
  FP.root=root;FP.loop=false;
  applyFrom(root);
  wire(root,el,{reel:true});
  var host=root.querySelector('.fp-frame');
  var ctl=GJ_REELVIEW.mount(host,{base:rh.base,title:rh.title,film:rh.film,viewFilm:rh.viewFilm,embed:true});
  FP.reel=ctl;
  syncBar();
  return {stop:function(){stop()},state:ctl.state};
}
function whenStill(src, fn){
  if(!src){fn();return}
  var im=new Image(),done=false;
  function go(){if(done)return;done=true;fn()}
  im.onload=go;im.onerror=go;im.src=src;
  if(im.complete)go();
}
function shrink(){
  var sheet=FP.root;if(!sheet)return;
  sheet.classList.remove('fp-from');
  sheet.classList.add('fp-shrink');
  /* Swipe-down always returns to the bar, whichever point the film grew from. */
  sheet.style.transformOrigin='72px '+(innerHeight-18)+'px';
  playScale(sheet,'scale(1,1)','scale(.08,.06)',420,'cubic-bezier(.4,0,.2,1)');
  setTimeout(function(){if(window.__u1&&__u1.pinchOut)__u1.pinchOut()},420);
}
function openLead(x,y){
  if(document.querySelector('#layer .sheet.film.fp.fp-full'))return;
  var id='film/one-with-the-devil';
  var u=window.__u1;
  if(u&&u.cur&&u.cur.id&&String(u.cur.id).indexOf('film/')===0&&u.cur.id!=='film/cards')id=u.cur.id;
  var w=byId(id),src=w&&w.stills&&w.stills[0];
  whenStill(src,function(){
    if(document.querySelector('#layer .sheet.film.fp.fp-full'))return;
    FROM={x:x,y:y,w:72,h:28};
    if(u&&u.open)u.open(id);
  });
}
function syncBar(){
  if(!BAR)return;
  BAR.hidden=false;
  BAR.style.opacity='1';
}
function mountBar(){
  if(document.getElementById('togo')){BAR=document.getElementById('togo');syncBar();return}
  BAR=document.createElement('aside');
  BAR.id='togo';
  BAR.setAttribute('aria-label','To Go, Lost Coffee');
  var c=document.createElement('canvas');c.width=168;c.height=22;c.setAttribute('aria-hidden','true');
  var g=c.getContext('2d'),peaks=[0.413,0.602,0.426,0.446,0.753,0.682,0.753,0.928,0.841,1,0.92,0.898,0.997,0.89,0.929,0.994,0.908,0.843];
  g.fillStyle='#e8e4dc';
  peaks.forEach(function(p,i){var x=4+i*9,h=Math.max(2,p*16);g.beginPath();g.arc(x,18-h,1.15,0,6.283);g.fill();if(p>.45){g.beginPath();g.arc(x,18-h*.55,1,0,6.283);g.fill()}});
  var s=document.createElement('span');s.textContent='To Go · Lost Coffee';
  BAR.appendChild(c);BAR.appendChild(s);
  BAR.addEventListener('pointerdown',function(e){
    if(!filmOn())return;
    if(document.querySelector('#layer .sheet.film.fp.fp-full'))return;
    e.preventDefault();e.stopPropagation();
    openLead(e.clientX,e.clientY);
  });
  document.body.appendChild(BAR);
  syncBar();
}
if(window.GJ_VAR)GJ_VAR.on(function(room){if(room==='film'&&FP.t&&FP.root&&FP.root.isConnected)run()});
mountBar();
setInterval(syncBar,300);
window.GJ_FP={paint:paint,paintReel:paintReel,stop:stop,shrink:shrink,from:function(b){if(!FROM&&b&&b.w)FROM=b},get state(){return {i:FP.i,on:!!FP.t,n:FP.root?FP.root.querySelectorAll('.fp-frame>img:not(.fr-pv)').length:0}}};
})();
