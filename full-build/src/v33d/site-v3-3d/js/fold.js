/* site-v3-3d · fold (preview-v33d-fold, Nov 13). Hand-ported moments from site-3d, gill-sky (moon opener, constellation-blend,
   fable-m4 About calculator + Scope, horizon shelf, Spirit Eye) into the v3-3d core. Nothing here replaces dive.js / sheet.js /
   levels.js; it only adds layers and listens. Reduce Motion: no tilt, no drift, no ripples, same end states. */
(function(){
'use strict';
var D=document.documentElement,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RMQ=matchMedia('(prefers-reduced-motion: reduce)');function rm(){return RMQ.matches}
var FINE=matchMedia('(hover:hover) and (pointer:fine)');
function st(){try{return window.__dive&&__dive.state?__dive.state():null}catch(e){return null}}
function sheetOn(){return !!(window.__sheet&&__sheet.isOpen&&__sheet.isOpen())}
function syncRM(){D.classList.toggle('fold-rm',rm())}syncRM();if(RMQ.addEventListener)RMQ.addEventListener('change',syncRM);

/* ---------- 1. Z-depth tilt (pointer on desktop, gyro where the browser allows it without a prompt) ---------- */
var T={x:0,y:0,tx:0,ty:0},raf=0;
function tick(){raf=0;var k=.08;T.x+=(T.tx-T.x)*k;T.y+=(T.ty-T.y)*k;
  D.style.setProperty('--tx',T.x.toFixed(4));D.style.setProperty('--ty',T.y.toFixed(4));
  if(Math.abs(T.tx-T.x)>.002||Math.abs(T.ty-T.y)>.002)raf=requestAnimationFrame(tick)}
function aim(x,y){if(rm()){T.tx=T.ty=0}else{T.tx=Math.max(-1,Math.min(1,x));T.ty=Math.max(-1,Math.min(1,y))}if(!raf)raf=requestAnimationFrame(tick)}
addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;aim((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2)},{passive:true});
document.addEventListener('mouseleave',function(){aim(0,0)});
addEventListener('deviceorientation',function(e){if(e.gamma==null)return;aim(e.gamma/28,((e.beta||45)-45)/28)},{passive:true});
if(RMQ.addEventListener)RMQ.addEventListener('change',function(){aim(0,0)});
/* tilt only once a level has settled, so the sheet's hand-over to the grid lands pixel-true */
var setT=0;function settle(){D.classList.remove('fold-settled');clearTimeout(setT);setT=setTimeout(function(){D.classList.add('fold-settled')},700)}
addEventListener('hashchange',settle);settle();

/* ---------- 2. opener: moon on the water, the mark drawn in stars, touch-only ripples ---------- */
(function opener(){
  var bd=$('.backdrop');if(!bd)return;
  var m=document.createElement('div');m.id='fold-moon';m.setAttribute('aria-hidden','true');m.innerHTML='<i class="fm-disc"></i><i class="fm-path"></i>';
  bd.appendChild(m);
  function deep(){D.classList.toggle('fold-deep',scrollY>innerHeight*.55||sheetOn()||!!(st()&&st().k))}
  addEventListener('scroll',deep,{passive:true});addEventListener('hashchange',function(){setTimeout(deep,80)});setInterval(deep,1200);deep();
  /* the mark ᑕᐣᓯ as a dotted star constellation (the moon-water opener's star mark) */
  var intro=$('.intro'),id=intro&&$('.id',intro);if(!id)return;
  var cv=document.createElement('canvas');cv.id='fold-mark';cv.setAttribute('aria-hidden','true');id.parentNode.insertBefore(cv,id);
  var pts=[],t0=performance.now();
  function build(){var w=cv.clientWidth||300,h=Math.round(w/2.2),dpr=Math.min(2,devicePixelRatio||1);cv.width=w*dpr;cv.height=h*dpr;
    var o=document.createElement('canvas');o.width=w;o.height=h;var g=o.getContext('2d');g.fillStyle='#fff';g.textBaseline='middle';g.textAlign='left';
    g.font='400 '+Math.round(h*.78)+'px "Noto Sans Canadian Aboriginal","Julius Sans One",Poppins,sans-serif';g.fillText('ᑕᐣᓯ',4,h*.52);
    var d=g.getImageData(0,0,w,h).data,step=Math.max(4,Math.round(w/64));pts=[];
    for(var y=0;y<h;y+=step)for(var x=0;x<w;x+=step){var a=d[(y*w+x)*4+3];if(a>110)pts.push([x,y,Math.random()*6.28,.75+Math.random()*.55])}}
  function draw(now){var g=cv.getContext('2d'),dpr=cv.width/(cv.clientWidth||1),tt=(now-t0)/1000;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cv.width,cv.height);
    for(var i=0;i<pts.length;i++){var p=pts[i],tw=rm()?1:.72+.28*Math.sin(tt*1.6+p[2]);g.globalAlpha=Math.min(1,.55*tw*p[3]+.25);
      g.fillStyle='#e8e4dc';g.beginPath();g.arc(p[0],p[1],1.15*p[3],0,6.283);g.fill();
      if(p[3]>1.08){g.globalAlpha=.16*tw;g.beginPath();g.arc(p[0],p[1],4,0,6.283);g.fill()}}
    g.globalAlpha=1;if(!rm()&&!D.classList.contains('fold-deep'))requestAnimationFrame(draw);else setTimeout(function(){requestAnimationFrame(draw)},600)}
  function go(){build();requestAnimationFrame(draw)}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);else go();
  addEventListener('resize',function(){clearTimeout(go._t);go._t=setTimeout(build,200)});
  /* touch-only ripples: only on open water, where nothing opens */
  addEventListener('pointerdown',function(e){
    if(e.pointerType!=='touch'||rm()||D.classList.contains('fold-deep'))return;
    if(e.target.closest('a,button,input,label,.ch,.dock,.top,#markmenu,#fold-dial,#cam-dial,#cam-panel,.sheet,.imm,#film-slides'))return;
    [0,1].forEach(function(i){var r=document.createElement('i');r.className='fold-ripple'+(i?' r2':'');r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(function(){r.remove()},1900)});
  },{passive:true});
})();

/* ---------- 3. boards: true counts line, snap from stars, one quiet back hint, muted preview loops ---------- */
function countsLine(sec){
  var k=sec.dataset.k,its=$$('.stars>.it',sec).filter(function(el){return getComputedStyle(el).display!=='none'}),n=its.length,cats={};
  its.forEach(function(el){var m=(($('.cap small',el)||{}).textContent||'').split('·')[0].trim().toLowerCase();if(m)cats[m]=(cats[m]||0)+1});
  var noun={film:'films',photo:'photographs',objects:'works',spaces:'views',sound:'players',about:'notes'}[k]||'works';
  var PL={reel:'reels',short:'shorts',commercial:'commercial','music video':'music videos','brand film':'brand films'};
  var parts=k!=='film'&&k!=='objects'?[]:Object.keys(cats).sort(function(a,b){return cats[b]-cats[a]}).map(function(c){return cats[c]+' '+(cats[c]>1&&PL[c]?PL[c]:c)});
  return '<b>'+k+'</b> · '+n+' '+noun+(parts.length?' · '+parts.join(' · '):'');
}
function decorate(){
  $$('.ch').forEach(function(sec){
    var sum=$('.sum',sec);if(!sum||sec.id==='about')return;
    if(!sum.dataset.orig)sum.dataset.orig=sum.innerHTML;
    if(sec.classList.contains('lv2')){sum.innerHTML=countsLine(sec);sum.classList.add('fold-counts')}
    else if(sum.classList.contains('fold-counts')){sum.innerHTML=sum.dataset.orig;sum.classList.remove('fold-counts')}
    $$('.stars>.it',sec).forEach(function(el,i){el.style.setProperty('--fi',i)});
  });
}
var lastLv2=null,hintShown=false;try{hintShown=sessionStorage.getItem('fold.hint')==='1'}catch(e){}
function onLevel(){
  decorate();
  var s=st(),k=s&&s.lv===2&&!s.w?s.k:null;
  if(k&&k!==lastLv2){var sec=document.getElementById(k);if(sec&&!rm()){sec.classList.remove('fold-snap');void sec.offsetWidth;sec.classList.add('fold-snap');setTimeout(function(){sec.classList.remove('fold-snap')},900)}
    if(!hintShown){hintShown=true;try{sessionStorage.setItem('fold.hint','1')}catch(e){}
      var h=$('#fold-hint')||document.body.appendChild(Object.assign(document.createElement('p'),{id:'fold-hint'}));
      h.textContent=FINE.matches?'click a work to open · Esc to go back':'tap a work to open · pinch or − to go back';
      requestAnimationFrame(function(){h.classList.add('on')});setTimeout(function(){h.classList.remove('on')},3200)}}
  lastLv2=k;previews();horizon();
}
/* muted preview loops on film cards (the site's own media/pv clips): hover on desktop, the card nearest centre on touch */
var PV=null;
function stopPv(){if(PV){PV.remove();PV=null}}
function playPv(it){if(!it||!it.dataset.pv||rm())return;if(PV&&PV.parentNode&&PV.parentNode.closest('.it')===it)return;stopPv();
  var v=document.createElement('video');v.className='fold-pv';v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.preload='auto';v.src=it.dataset.pv;
  var vis=$('.vis',it);if(!vis)return;vis.appendChild(v);PV=v;var p=v.play();if(p&&p.catch)p.catch(function(){})}
document.addEventListener('mouseover',function(e){if(!FINE.matches)return;var it=e.target.closest&&e.target.closest('#film.lv2 .stars>.it');if(it)playPv(it)});
document.addEventListener('mouseout',function(e){if(!FINE.matches||!PV)return;var it=e.target.closest&&e.target.closest('#film.lv2 .stars>.it');if(it&&!it.contains(e.relatedTarget))stopPv()});
var pvT=0;function previews(){if(!(st()&&st().k==='film'&&st().lv===2&&!st().w)){stopPv();return}
  if(FINE.matches)return;clearTimeout(pvT);pvT=setTimeout(function(){var best=null,bd=1e9;
    $$('#film.lv2 .stars>.it[data-pv]').forEach(function(it){var r=it.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var d=Math.abs(r.top+r.height/2-innerHeight*.45);if(d<bd){bd=d;best=it}});
    if(best)playPv(best)},350)}
addEventListener('scroll',function(){if(!FINE.matches)previews()},{passive:true});

/* ---------- 4. Spaces: the Spirit Eye lens turns under a drag, settles back ---------- */
(function spaces(){
  var stg=$('#spaces .se-stage'),disc=$('#spaces .se-disc');if(!stg||!disc)return;
  var P=null,z=0,y=0;
  stg.addEventListener('pointerdown',function(e){P={x:e.clientX,y:e.clientY,z:z,y0:y};disc.style.transition='none'});
  addEventListener('pointermove',function(e){if(!P)return;z=P.z+(e.clientX-P.x)*.6;y=Math.max(-24,Math.min(20,P.y0+(e.clientY-P.y)*.15));disc.style.setProperty('--sez',z.toFixed(1));disc.style.setProperty('--sey',y.toFixed(1))},{passive:true});
  addEventListener('pointerup',function(){if(!P)return;P=null;disc.style.transition='';y=0;disc.style.setProperty('--sey','0')});
  if(!rm()){var t0=performance.now();(function spin(now){if(!P&&!rm()&&D.querySelector('#spaces.lv2')){z+=.04;disc.style.setProperty('--sez',z.toFixed(2))}requestAnimationFrame(spin)})(t0)}
})();

/* ---------- 5. Film: Scope eyepiece from a slide (fable-m4 / pro2 lens inspection) ---------- */
(function scope(){
  var fsEl=null,sc=null,lens=null,lab=null,zoom=2.2,cx=.5,cy=.5,open=false;
  function cur(){var im=fsEl&&$('.fs-stage img:not([hidden])',fsEl);if(!im){var a=fsEl?$$('.fs-stage img',fsEl):[];im=a.filter(function(i){return getComputedStyle(i).opacity!=='0'&&getComputedStyle(i).visibility!=='hidden'}).pop()||a[0]}return im}
  function paint(){if(!lens)return;var im=cur();if(!im)return;lens.style.backgroundImage='url("'+(im.currentSrc||im.src)+'")';
    var r=lens.clientWidth||300,ar=(im.naturalWidth||16)/(im.naturalHeight||9),bw=r*zoom*Math.max(1,ar),bh=bw/ar;
    lens.style.backgroundSize=bw.toFixed(0)+'px '+bh.toFixed(0)+'px';lens.style.backgroundPosition=(r/2-bw*cx).toFixed(0)+'px '+(r/2-bh*cy).toFixed(0)+'px';
    lab.textContent='scope · '+zoom.toFixed(1)+'× · drag to look'}
  function show(on){if(!sc)build();open=on;sc.hidden=!on;
    if(on){cx=cy=.5;paint();try{history.pushState(Object.assign({},history.state||{},{gjSlides:1,gjScope:1}),'')}catch(e){}$('.sc-x',sc).focus({preventScroll:true})}
  }
  var SELF=0;function close(fromPop){if(!open)return;show(false);if(!fromPop&&history.state&&history.state.gjScope){SELF=1;try{history.back()}catch(e){SELF=0}}}
  function build(){sc=document.createElement('div');sc.id='fold-scope';sc.hidden=true;sc.setAttribute('role','dialog');sc.setAttribute('aria-label','scope: the frame under a lens');
    sc.innerHTML='<button type="button" class="sc-x" aria-label="close the scope, back to the slides">✕</button><div class="sc-z"><button type="button" data-z="-1" aria-label="less magnification">−</button><button type="button" data-z="1" aria-label="more magnification">+</button></div><div class="sc-lens"><i class="sc-ret"></i></div><p class="sc-lab"></p>';
    document.body.appendChild(sc);lens=$('.sc-lens',sc);lab=$('.sc-lab',sc);
    $('.sc-x',sc).addEventListener('click',function(e){e.stopPropagation();close()});
    $$('.sc-z button',sc).forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();zoom=Math.max(1.4,Math.min(4,zoom+(+b.dataset.z)*.6));paint()})});
    var P=null;lens.addEventListener('pointerdown',function(e){P={x:e.clientX,y:e.clientY,cx:cx,cy:cy};lens.setPointerCapture&&lens.setPointerCapture(e.pointerId)});
    lens.addEventListener('pointermove',function(e){if(!P)return;var r=lens.clientWidth*zoom;cx=Math.max(0,Math.min(1,P.cx-(e.clientX-P.x)/r));cy=Math.max(0,Math.min(1,P.cy-(e.clientY-P.y)/r));paint()});
    lens.addEventListener('pointerup',function(){P=null});lens.addEventListener('pointercancel',function(){P=null});
    sc.addEventListener('click',function(e){if(e.target===sc)close()});
  }
  function arm(){fsEl=$('#film-slides');if(!fsEl||$('.fold-scope-b',fsEl))return;
    var b=document.createElement('button');b.type='button';b.className='fold-scope-b';b.textContent='scope';b.setAttribute('aria-label','open this frame in the scope');
    b.addEventListener('click',function(e){e.stopPropagation();show(true)});fsEl.appendChild(b)}
  new MutationObserver(arm).observe(document.body,{childList:true});arm();
  /* Esc / Back / pinch: one level. levels.js closes the slides via __filmSlides.close(); with the scope open that closes the scope only. */
  function wrap(){var F=window.__filmSlides;if(!F||F._fold)return;var c=F.close;F.close=function(x){if(open){close(x===true);return}return c.apply(F,arguments)};
    var io=F.isOpen;F.isOpen=function(){return open||io.call(F)};F._fold=1}
  wrap();setTimeout(wrap,0);addEventListener('load',wrap);
  addEventListener('keydown',function(e){if(open&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}},true);
  /* the scope's own history entry popping: close the scope only, and keep dive.js / the slides watcher from re-routing the player */
  addEventListener('popstate',function(e){if(open&&!(history.state&&history.state.gjScope)){show(false);e.stopImmediatePropagation()}else if(SELF){SELF=0;e.stopImmediatePropagation()}},true);
  addEventListener('resize',function(){if(open)paint()});
  window.__foldScope={open:function(){arm();show(true)},close:close,isOpen:function(){return open}};
})();

/* ---------- 6. Photo: the Horizon shelf (one image raised out of the silver row) ---------- */
var HZ=false;try{HZ=localStorage.getItem('fold.hz')==='1'}catch(e){}
function horizon(){var sec=$('#photo');if(!sec)return;var body=$('.body',sec),sum=$('.sum',sec);if(!body)return;
  var b=$('.fold-chip',body);
  if(!b){b=document.createElement('button');b.type='button';b.className='fold-chip';b.textContent='horizon shelf';b.setAttribute('aria-pressed','false');
    (sum&&sum.nextSibling)?body.insertBefore(b,sum.nextSibling):body.prepend(b);
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();HZ=!HZ;try{localStorage.setItem('fold.hz',HZ?'1':'0')}catch(x){}horizon()})}
  b.setAttribute('aria-pressed',HZ?'true':'false');sec.classList.toggle('fold-hz',HZ&&sec.classList.contains('lv2'));raise()}
function raise(){var row=$('#photo.fold-hz .stars');if(!row)return;var c=row.getBoundingClientRect(),mid=c.left+c.width/2,best=null,bd=1e9;
  $$('.it',row).forEach(function(it){if(getComputedStyle(it).display==='none')return;var r=it.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-mid);if(d<bd){bd=d;best=it}});
  $$('.it.fold-up',row).forEach(function(it){if(it!==best)it.classList.remove('fold-up')});if(best)best.classList.add('fold-up')}
document.addEventListener('scroll',function(e){if(e.target&&e.target.matches&&e.target.matches('#photo.fold-hz .stars')){clearTimeout(raise._t);raise._t=setTimeout(raise,60)}},true);

/* ---------- 7. Objects: inspect a work in 3D (tilt follows the pointer / finger, springs back) ---------- */
(function objects(){
  var imm=$('.imm');if(!imm)return;var P=null;
  function on(){var s=st();var y=!!(s&&s.k==='objects'&&s.w);imm.classList.toggle('fold-obj',y);return y}
  addEventListener('hashchange',function(){setTimeout(on,30)});on();
  imm.addEventListener('pointermove',function(e){if(!on())return;var f=$('.frame',imm);if(!f)return;
    if(e.pointerType==='mouse'||P){var r=f.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      if(rm())return;f.style.setProperty('--ory',(x*22).toFixed(1)+'deg');f.style.setProperty('--orx',(-y*16).toFixed(1)+'deg')}},{passive:true});
  imm.addEventListener('pointerdown',function(e){if(on()&&e.pointerType!=='mouse')P=1},{passive:true});
  function rel(){P=null;var f=$('.frame',imm);if(f){f.style.setProperty('--ory','0deg');f.style.setProperty('--orx','0deg')}}
  imm.addEventListener('pointerup',rel);imm.addEventListener('pointerleave',rel);imm.addEventListener('pointercancel',rel);
})();

/* ---------- 8. About: the short poem + the green-VFD calculator ---------- */
(function about(){
  var host=$('#about-bio');if(!host||$('.fold-about',host))return;
  var w=document.createElement('div');w.className='fold-about';
  var keys=['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'];
  w.innerHTML='<div class="fold-calc" aria-label="a calculator: tap a key"><div class="fc-obj"><div class="fc-vfd"><b>GILL JAMES</b><i></i></div><div class="fc-keys">'+
    keys.map(function(k){return '<button type="button" class="'+(/[÷×−+=]/.test(k)?'w':'')+'">'+k+'</button>'}).join('')+'</div><p class="fc-cap">ᑕᐣᓯ · vancouver</p></div></div>'+
    '<p class="fold-poem" lang="en"><span>I am Gill</span><span>I am James</span><span>I am an artist</span></p>';
  var lab=$('.label',host);host.insertBefore(w,lab?lab.nextSibling:host.firstChild);
  var vfd=$('.fc-vfd b',w),seq=['I AM GILL','I AM JAMES','I AM AN ARTIST','VANCOUVER','FILM . PHOTO','OBJECTS','SPACES','SOUND','ALL MY RELATIONS'],si=0,buf='';
  $$('.fc-keys button',w).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var k=b.textContent;
    if(k==='='){vfd.textContent=seq[si%seq.length];si++;buf=''}else{buf=(buf+k.replace('−','-').replace('×','x').replace('÷','/')).slice(-11);vfd.textContent=buf}
    b.classList.add('dn');setTimeout(function(){b.classList.remove('dn')},90)})});
  var c=$('.fold-calc',w),o=$('.fc-obj',w),P=null;
  c.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;P={x:e.clientX,y:e.clientY};c.classList.add('fc-drag')});
  addEventListener('pointermove',function(e){if(P){o.style.setProperty('--crx',((e.clientX-P.x)*.25).toFixed(1));o.style.setProperty('--cry',(-(e.clientY-P.y)*.2).toFixed(1))}
    else if(e.pointerType==='mouse'&&!rm()&&D.querySelector('#about.lv1,#about.lv2')){var r=c.getBoundingClientRect();o.style.setProperty('--crx',(((e.clientX-r.left)/r.width-.5)*14).toFixed(1));o.style.setProperty('--cry',(-((e.clientY-r.top)/r.height-.5)*10).toFixed(1))}},{passive:true});
  addEventListener('pointerup',function(){if(!P)return;P=null;c.classList.remove('fc-drag');o.style.setProperty('--crx','0');o.style.setProperty('--cry','0')});
  if(!rm()){var i=0;setInterval(function(){if(!D.querySelector('#about.lv1,#about.lv2')||buf)return;vfd.textContent=seq[i++%4]},2600)}
})();

/* ---------- 9. the side dial: the tune instrument on the right edge (opens the drawer out of itself) ---------- */
(function dial(){
  var b=document.createElement('button');b.type='button';b.id='fold-dial';b.setAttribute('aria-label','tune: open the drawer from the side dial');b.setAttribute('aria-expanded','false');
  var h='<svg viewBox="0 0 30 120" aria-hidden="true"><path class="fd-arc" d="M30 6 A70 70 0 0 0 30 114"/>',CX=74.5,i;
  /* ticks along the same arc (centre 74.5,60 · r 70): this is the dial the drawer and the ghost arc come out of */
  for(i=0;i<=10;i++){var ang=Math.PI-.8+i*.16,ox=CX+70*Math.cos(ang),oy=60+70*Math.sin(ang),ri=i%5?65:61,ix=CX+ri*Math.cos(ang),iy=60+ri*Math.sin(ang);
    h+='<line class="fd-tick" x1="'+ox.toFixed(1)+'" y1="'+oy.toFixed(1)+'" x2="'+ix.toFixed(1)+'" y2="'+iy.toFixed(1)+'"/>'}
  h+='<circle class="fd-dot" cx="4.5" cy="60" r="2"/><text class="fd-lab" x="15" y="62.5" text-anchor="middle" transform="rotate(90 15 60)">TUNE</text></svg>';
  b.innerHTML=h;document.body.appendChild(b);
  b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(window.GJ_MARKMENU){GJ_MARKMENU.show(!GJ_MARKMENU.open,{from:b})}},true);
  function sync(){b.setAttribute('aria-expanded',D.classList.contains('mm-open')?'true':'false');
    var cover=!!($('#film-slides:not([hidden])')||$('#fold-scope:not([hidden])')||(st()&&st().w&&!$('.imm[hidden]')));D.classList.toggle('fold-cover',cover)}
  new MutationObserver(sync).observe(D,{attributes:true,attributeFilter:['class']});addEventListener('hashchange',function(){setTimeout(sync,60)});setInterval(sync,800);
  window.__foldDial=b;
})();

/* ghost arc: keep clear of the real rects of this site (player frame, slides stage, scope, calculator, a settled film board) */
if(window.GJ_GHOST&&GJ_GHOST.avoid)GJ_GHOST.avoid(function(){var out=[];
  ['.imm:not([hidden]) .frame','#film-slides:not([hidden]) .fs-stage','#fold-scope:not([hidden]) .sc-lens','.fold-calc','#spaces.lv2 .se-stage'].forEach(function(s){var e=$(s);if(!e)return;var r=e.getBoundingClientRect();if(r.width&&r.height&&r.bottom>0&&r.top<innerHeight)out.push([r.left,r.top,r.right,r.bottom])});
  $$('#film.lv2 .stars>.it .vis').forEach(function(v){var r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight&&r.right>innerWidth-60)out.push([r.left,r.top,r.right,r.bottom])});
  return out});

/* watch level changes: dive.js writes classes on .ch and the hash */
addEventListener('hashchange',function(){setTimeout(onLevel,60);setTimeout(onLevel,700)});
$$('.ch').forEach(function(sec){new MutationObserver(function(){clearTimeout(onLevel._t);onLevel._t=setTimeout(onLevel,40)}).observe(sec,{attributes:true,attributeFilter:['class']})});
onLevel();
})();
