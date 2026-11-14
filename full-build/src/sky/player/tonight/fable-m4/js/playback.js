/* Film playback (PLAYBACK-SPEC.md section 10).
 Media: tonight/media/film/<slug>/, resolved from this file (../../media/film/).
 On the sky that is ../media/film/. On a film page it is ../../../media/film/.
 Tiles decode only while at least half on screen, capped (3 on a phone, 6 otherwise).
 Loops are muted and have no audio track. Horizon uses AV1, then VP9, then H.264.
 Posters sit on a dark plate and the picture fades in once decoded.
 Reduce Motion keeps the same strip and the same loops playing. Gill's standard is the same output.
 The full-length player files are not here; the 720p hero loop stands in. */
(function(){
'use strict';
/* Document-relative prefix for tonight/media/film/, so /gill-sky/ and a site root both resolve. */
function relDir(fromHref,toHref){
  var from=new URL(fromHref),to=new URL(toHref);
  if(from.origin!==to.origin)return to.href;
  var a=from.pathname.split("/").filter(Boolean),b=to.pathname.split("/").filter(Boolean),i=0,up=[];
  while(i<a.length&&i<b.length&&a[i]===b[i])i++;
  for(var n=i;n<a.length;n++)up.push("..");
  return (up.concat(b.slice(i)).join("/")||".")+"/";
}
function filmRoot(){
  var el=document.currentScript,src=el&&el.src;
  if(!src)return "../media/film/";
  try{return relDir(new URL(".",location.href).href,new URL("../../media/film/",src).href)}
  catch(e){return "../media/film/"}
}
var FILM=filmRoot();
var HAVE={"back-to-the-start":1,"backward-fall":1,"brew-bar-coffee-teaser":1,"buddy-time-grandpas-story":1,"canoe":1,"celebraciones":1,"cinematography-demo-reel-2025":1,"cover-with-love-isabelle":1,"drift":1,"eat-well":1,"explorers":1,"fire":1,"flower-crown":1,"golden-moment-directors-cut":1,"horizon-r001":1,"horizon-r002":1,"horizon-r003":1,"horizon-r004":1,"horizon-r005":1,"horizon-r006":1,"horizon-r007":1,"horizon-r008":1,"horizon-r009":1,"horizon-r010":1,"horizon-r011":1,"horizon-r012":1,"horizon-r013":1,"horizon-r014":1,"horizon-r015":1,"horizon-r016":1,"horizon-r017":1,"horizon-r018":1,"horizon-r019":1,"horizon-r020":1,"horizon-r021":1,"horizon-r022":1,"horizon-r023":1,"horizon-r024":1,"horizon-r025":1,"horizon-r026":1,"horizon-r027":1,"horizon-r028":1,"horizon-r029":1,"horizon-r030":1,"horizon-r031":1,"horizon-r032":1,"horizon-r033":1,"horizon-r034":1,"horizon-r035":1,"horizon-r036":1,"horizon-r037":1,"horizon-r038":1,"horizon-r039":1,"horizon-r040":1,"horizon-r041":1,"horizon-r042":1,"horizon-r043":1,"horizon-r044":1,"horizon-r045":1,"horizon-r046":1,"horizon-r047":1,"horizon-r048":1,"horizon-r049":1,"horizon-r050":1,"horizon-r051":1,"horizon-r052":1,"horizon-r053":1,"horizon-r054":1,"horizon-r055":1,"horizon-r056":1,"horizon-r057":1,"horizon-r058":1,"horizon-r059":1,"horizon-r060":1,"horizon-r061":1,"horizon-r062":1,"horizon-r063":1,"horizon-r064":1,"horizon-r065":1,"horizon-r066":1,"horizon-r067":1,"horizon-r068":1,"horizon-r069":1,"horizon-r070":1,"horizon-r071":1,"horizon-r072":1,"horizon-r073":1,"horizon-r074":1,"horizon-r075":1,"horizon-r076":1,"horizon-r077":1,"horizon-r078":1,"horizon-r079":1,"horizon-r080":1,"horizon-r081":1,"horizon-r082":1,"horizon-r083":1,"horizon-r084":1,"horizon-r085":1,"horizon-r086":1,"horizon-r087":1,"horizon-r088":1,"horizon-r089":1,"horizon-r090":1,"horizon-r091":1,"horizon-r092":1,"horizon-r093":1,"horizon-r094":1,"horizon-r095":1,"horizon-r096":1,"horizon-r097":1,"horizon-r098":1,"horizon-r099":1,"horizon-r100":1,"horizon-r101":1,"horizon-r102":1,"horizon-r103":1,"horizon-r104":1,"horizon-r105":1,"horizon-r106":1,"horizon-r107":1,"horizon-r108":1,"horizon-r109":1,"horizon-r110":1,"horizon-r111":1,"horizon-r112":1,"horizon-r113":1,"horizon-r114":1,"horizon-r115":1,"horizon-r116":1,"horizon-r117":1,"horizon-r118":1,"horizon-r119":1,"horizon-r120":1,"horizon-r121":1,"horizon-r122":1,"horizon-r123":1,"horizon-r124":1,"horizon-r125":1,"horizon-r126":1,"horizon-r127":1,"horizon-r128":1,"horizon-r129":1,"horizon-r130":1,"horizon-r131":1,"horizon-r132":1,"horizon-r133":1,"horizon-r134":1,"horizon-r135":1,"horizon-r136":1,"horizon-r137":1,"horizon-r138":1,"horizon-r139":1,"horizon-r140":1,"horizon-r141":1,"horizon-r142":1,"horizon-r143":1,"horizon-r144":1,"horizon-r145":1,"horizon-r146":1,"horizon-r147":1,"horizon-r148":1,"horizon-r149":1,"horizon-r150":1,"horizon-r151":1,"horizon-r152":1,"horizon-r153":1,"horizon-r154":1,"horizon-r155":1,"horizon-r156":1,"horizon-r157":1,"horizon-r158":1,"horizon-r159":1,"horizon-r160":1,"horizon-r161":1,"horizon-r162":1,"horizon-r163":1,"horizon-r164":1,"horizon-r165":1,"horizon-r166":1,"horizon-r167":1,"horizon-r168":1,"horizon-r169":1,"horizon-r170":1,"horizon-r171":1,"horizon-r172":1,"horizon-r173":1,"horizon-r174":1,"horizon-r175":1,"horizon-r176":1,"horizon-r177":1,"horizon-r178":1,"horizon-r179":1,"horizon-r180":1,"horizon-r181":1,"horizon-r182":1,"horizon-r183":1,"horizon-r184":1,"horizon-r185":1,"horizon-r186":1,"horizon-r187":1,"horizon-r188":1,"horizon-r189":1,"horizon-r190":1,"horizon-r191":1,"horizon-r192":1,"horizon-r193":1,"horizon-r194":1,"horizon-r195":1,"horizon-r196":1,"horizon-r197":1,"horizon-r198":1,"horizon-r199":1,"horizon-r200":1,"horizon-r201":1,"journeys-x-todd":1,"just-the-beginning":1,"legends":1,"lets-grow-good-together":1,"ltl-dstryr":1,"mandie":1,"mark-snowwater":1,"modern-man":1,"no-place-like-home":1,"obedience-gets-you-nowhere":1,"one-with-the-devil":1,"phantoms-and-friends":1,"reel-2026":1,"repeat-feat-jessie-reyez":1,"s18":1,"sleepwalker":1,"stay-gold":1,"summer-is-here":1,"sun-kissed":1,"the-smell-needs-to-go":1,"veronas-obsession":1,"weird-kid":1};
var HERO720={"weird-kid":1,"one-with-the-devil":1,"mark-snowwater":1};
var STRIP={
  "22-card.mp4":"weird-kid","22.mp4":"weird-kid",
  "one-with-the-devil-clip.mp4":"one-with-the-devil",
  "13.mp4":"sleepwalker",
  "16-card.mp4":"repeat-feat-jessie-reyez","16.mp4":"repeat-feat-jessie-reyez"
};
function slugOf(id){
  id=String(id||"");
  var p=id.split("/");
  if(p[0]==="film"&&p[1])return p[1].split("@")[0];
  return "";
}
function hasLoop(slug){return !!(slug&&HAVE[slug]&&slug.indexOf("horizon-")!==0);}
function prefer480(){
  var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  return !!(c&&(c.saveData||/2g/.test(c.effectiveType||"")));
}
function rungFor(slug){
  if(prefer480())return "480";
  return HERO720[slug]?"720":"480";
}
function sources(slug,rung){
  var base=FILM+slug+"/";
  var stem="loop-"+rung;
  var av1=rung==="720"?"av01.0.05M.08":"av01.0.04M.08";
  var avc=rung==="720"?"avc1.64001F":"avc1.64001E";
  return [
    {src:base+stem+".av1.webm",type:'video/webm; codecs="'+av1+'"'},
    {src:base+stem+".webm",type:'video/webm; codecs="vp9"'},
    {src:base+stem+".mp4",type:'video/mp4; codecs="'+avc+'"'}
  ];
}
function poster(slug,rung){return FILM+slug+"/loop-"+rung+"-poster.jpg";}
function maxPlay(){
  var coarse=false;
  try{coarse=matchMedia("(pointer: coarse)").matches}catch(e){}
  return (coarse||innerWidth<800)?3:6;
}
var playing=new Set();
/* Board pause (header band tap). One stored flag, read by every place that starts a loop: tryPlay, reconcile, dress. */
var paused=false;
function release(v){
  if(!v)return;
  try{v.pause()}catch(e){}
  v.removeAttribute("src");
  var nodes=v.querySelectorAll("source");
  for(var i=0;i<nodes.length;i++)nodes[i].remove();
  try{v.load()}catch(e){}
  if(v.dataset.poster)v.poster=v.dataset.poster;
  v.classList.remove("is-ready");
  playing.delete(v);
}
function arm(v){
  if(!v||v.querySelector("source")||v.getAttribute("src"))return;
  var order=[];
  try{order=JSON.parse(v.dataset.sources||"[]")}catch(e){return}
  for(var i=0;i<order.length;i++){
    var el=document.createElement("source");
    el.src=order[i].src;
    el.type=order[i].type;
    v.appendChild(el);
  }
  v.preload="metadata";
  try{v.load()}catch(e){}
}
function tryPlay(v){
  if(!v||playing.has(v))return;
  arm(v);
  if(paused)return;
  v.muted=true;v.defaultMuted=true;v.setAttribute("muted","");
  playing.add(v);
  function go(){
    if(!playing.has(v))return;
    if(paused){playing.delete(v);return}
    var p=v.play();
    if(p&&p.catch)p.catch(function(){v.classList.add("is-poster")});
  }
  if(v.readyState>=2)go();
  else v.addEventListener("loadeddata",go,{once:true});
}
function visibleEnough(el){
  var r=el.getBoundingClientRect();
  if(r.width<8||r.height<8)return false;
  var ix=Math.max(0,Math.min(r.right,innerWidth)-Math.max(r.left,0));
  var iy=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));
  return (ix*iy)/(r.width*r.height)>=0.5;
}
var layer,boxes={};
function ensure(){
  if(layer)return layer;
  var st=document.createElement("style");
  st.id="gj-play-css";
  st.textContent=[
    "#gj-tiles{position:fixed;overflow:hidden;z-index:4;pointer-events:none;background:transparent}",
    "#gj-tiles .gj-box{position:absolute;overflow:hidden;background:#04070b}",
    "#gj-tiles .gj-box img,#gj-tiles .gj-box video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#04070b;display:block}",
    "#gj-tiles .gj-box video{opacity:0;transition:opacity .4s linear}",
    "#gj-tiles .gj-box video.is-ready{opacity:1}",
    "#gj-head{position:absolute;z-index:2;cursor:pointer;background:transparent;outline:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}",
    "#gj-head[hidden]{display:none}",
    "#gj-head:focus-visible{box-shadow:inset 0 0 0 1px rgba(232,228,220,.28)}",
    "#gj-head .gj-rip{position:absolute;width:64px;height:64px;margin:-32px 0 0 -32px;border:1px solid transparent;border-radius:50%;opacity:0;pointer-events:none;box-sizing:border-box}",
    "#opc .oc,#opc .oc-b{background:#04070b}",
    "video.gj-hero{background:#04070b}"
  ].join("");
  document.head.appendChild(st);
  layer=document.createElement("div");
  layer.id="gj-tiles";
  layer.setAttribute("aria-hidden","true");
  layer.hidden=true;
  document.body.appendChild(layer);
  return layer;
}
function makeBox(slug){
  var box=document.createElement("div");
  box.className="gj-box";
  box.dataset.slug=slug;
  var img=document.createElement("img");
  img.alt="";img.decoding="async";img.src=poster(slug,"480");
  var v=document.createElement("video");
  v.className="tile clip";
  v.muted=true;v.defaultMuted=true;v.playsInline=true;v.loop=true;v.preload="none";
  v.setAttribute("muted","");v.setAttribute("playsinline","");v.setAttribute("webkit-playsinline","");
  v.poster=poster(slug,"480");
  v.dataset.poster=v.poster;
  v.dataset.sources=JSON.stringify(sources(slug,"480"));
  v.dataset.gjSlug=slug;
  v.addEventListener("loadeddata",function(){v.classList.add("is-ready")});
  v.addEventListener("playing",function(){v.classList.add("is-ready")});
  box.appendChild(img);box.appendChild(v);
  return box;
}
function dropBox(slug){
  var box=boxes[slug];if(!box)return;
  var v=box.querySelector("video");
  if(v)release(v);
  if(box.parentNode)box.parentNode.removeChild(box);
  delete boxes[slug];
}
function hideBoard(){
  Object.keys(boxes).forEach(dropBox);
  if(layer)layer.hidden=true;
}
function syncBoard(){
  var u=window.__u1;
  if(!u||!u.cur){hideBoard();syncBand(false);return}
  var cur=u.cur;
  var fsn=u.fsn&&u.fsn.fsn||0;
  var cards=document.getElementById("opb");
  var sheet=document.getElementById("layer");
  var blocked=(cards&&cards.classList.contains("on"))||(sheet&&sheet.classList.contains("on"));
  var on=cur.k==="film"&&cur.lv===1&&!cur.cards&&!!cur.b&&fsn>0.9&&!blocked;
  if(!on){hideBoard();syncBand(false);return}
  var tiles=u.tiles||[];
  var info=u.rects;
  if(!info||info.key!=="film"||!info.rects||!info.win){hideBoard();syncBand(false);return}
  ensure();
  syncBand(true,info);
  var win=info.win;
  layer.hidden=false;
  layer.style.left=win[0]+"px";
  layer.style.top=win[1]+"px";
  layer.style.width=win[2]+"px";
  layer.style.height=win[3]+"px";
  var seen={};
  for(var i=0;i<tiles.length;i++){
    var t=tiles[i],r=info.rects[i];
    if(!t||!r)continue;
    var slug=slugOf(t.id);
    if(!hasLoop(slug))continue;
    var w=r.w,h=r.h;
    var x=t.x-w/2,y=t.y-h/2;
    if(y+h<win[1]||y>win[1]+win[3]||x+w<win[0]||x>win[0]+win[2]){
      if(boxes[slug])dropBox(slug);
      continue;
    }
    var box=boxes[slug];
    if(!box){box=makeBox(slug);layer.appendChild(box);boxes[slug]=box}
    box.style.left=Math.round(x-win[0])+"px";
    box.style.top=Math.round(y-win[1])+"px";
    box.style.width=Math.round(w)+"px";
    box.style.height=Math.round(h)+"px";
    seen[slug]=1;
  }
  Object.keys(boxes).forEach(function(s){if(!seen[s])dropBox(s)});
  reconcile();
}
function reconcile(){
  var nodes=[];
  Object.keys(boxes).forEach(function(s){
    var v=boxes[s]&&boxes[s].querySelector("video");
    if(v)nodes.push(v);
  });
  var vis=nodes.filter(visibleEnough);
  vis.sort(function(a,b){
    var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
    return ra.top-rb.top||ra.left-rb.left;
  });
  var keep=vis.slice(0,maxPlay());
  nodes.forEach(function(v){
    if(keep.indexOf(v)<0&&(playing.has(v)||v.querySelector("source")))release(v);
  });
  keep.forEach(tryPlay);
}
function filmTag(work){
  var slug=(work&&work.slug)||slugOf(work&&work.id);
  if(!hasLoop(slug))return "";
  var rung=rungFor(slug);
  var post=poster(slug,rung);
  var html=sources(slug,rung).map(function(s){
    return '<source src="'+s.src+'" type=\''+s.type+'\'>';
  }).join("");
  return '<video class="clip gj-hero" muted playsinline webkit-playsinline loop preload="metadata" poster="'+post+'" data-poster="'+post+'" data-gj-slug="'+slug+'" data-stand-in="loop-'+rung+'">'+html+"</video>";
}
function slugFromVideo(v){
  if(v.dataset&&v.dataset.gjSlug)return v.dataset.gjSlug;
  var src=v.getAttribute("src")||"";
  var nodes=v.querySelectorAll("source");
  if(!src&&nodes.length)src=nodes[0].getAttribute("src")||"";
  var name=src.split("/").pop().split("?")[0];
  if(STRIP[name])return STRIP[name];
  var m=src.match(/\/media\/film\/([^/]+)\//);
  if(m&&HAVE[m[1]])return m[1];
  if(name==="one-with-the-devil-clip.mp4")return "one-with-the-devil";
  return "";
}
function dress(v,slug,opts){
  opts=opts||{};
  if(!v||!hasLoop(slug))return;
  if(v.dataset.gjDone===slug){
    v.muted=true;v.defaultMuted=true;v.setAttribute("muted","");
    return;
  }
  var rung=opts.rung||(v.classList.contains("tile")?"480":rungFor(slug));
  var post=poster(slug,rung);
  var playingNow=!v.paused&&v.currentTime>0;
  v.muted=true;v.defaultMuted=true;v.setAttribute("muted","");
  v.playsInline=true;v.setAttribute("playsinline","");v.setAttribute("webkit-playsinline","");
  if(opts.loop!==false)v.loop=true;
  v.removeAttribute("autoplay");v.autoplay=false;
  v.preload=opts.preload||"metadata";
  v.poster=post;v.dataset.poster=post;v.dataset.gjSlug=slug;v.dataset.gjDone=slug;
  v.dataset.standIn="loop-"+rung;
  v.removeAttribute("src");
  var old=v.querySelectorAll("source");
  for(var i=0;i<old.length;i++)old[i].remove();
  sources(slug,rung).forEach(function(s){
    var el=document.createElement("source");
    el.src=s.src;el.type=s.type;v.appendChild(el);
  });
  var show=function(){v.classList.add("is-ready");v.classList.add("on");v.classList.add("live")};
  v.addEventListener("loadeddata",show);
  v.addEventListener("playing",show);
  try{v.load()}catch(e){}
  if((opts.play||playingNow)&&!paused){
    var p=v.play();if(p&&p.catch)p.catch(function(){});
  }
}
var stripKick=0;
function kickStrip(){
  if(!window.GJ_OPEN||!GJ_OPEN.on)return;
  var st=GJ_OPEN.state();
  var v=document.querySelector('#opc .oc[data-copy="main"][data-i="'+st.i+'"] .oc-b > video');
  if(!v||v.dataset.gjDone!==(v.dataset.gjSlug||""))return;
  if(!v.paused&&v.currentTime>0.05){stripKick=1;return}
  if(stripKick>2)return;
  stripKick++;
  var p=v.play();
  if(p&&p.catch)p.catch(function(){});
}
function dressStrip(){
  var root=document.getElementById("opc");
  if(!root)return;
  var vids=root.querySelectorAll("video");
  for(var i=0;i<vids.length;i++){
    var v=vids[i];
    if(v.closest&&v.closest(".oc-momo"))continue;
    var slug=slugFromVideo(v);
    if(!slug)continue;
    /* The strip still advances on ended. Same picture with Reduce Motion: it keeps playing. */
    dress(v,slug,{loop:false,play:false,preload:"metadata"});
    v.loop=false;
  }
  kickStrip();
}
function dressHeroes(){
  var nodes=document.querySelectorAll("#layer video, .enterframe video, .filmfield video");
  for(var i=0;i<nodes.length;i++){
    var v=nodes[i];
    var slug=v.dataset.gjSlug||slugFromVideo(v);
    if(!hasLoop(slug))continue;
    var was=v.dataset.gjDone===slug;
    dress(v,slug,{play:!was,preload:"metadata"});
    v.muted=true;v.defaultMuted=true;
  }
}
function allLoops(){
  var nodes=[];
  Object.keys(boxes).forEach(function(k){var v=boxes[k]&&boxes[k].querySelector("video");if(v)nodes.push(v)});
  var more=document.querySelectorAll("#layer video.clip, .enterframe video, .filmfield video");
  for(var i=0;i<more.length;i++)nodes.push(more[i]);
  return nodes;
}
function setPaused(on,quiet){
  on=!!on;
  if(on===paused)return paused;
  paused=on;
  if(paused){
    allLoops().forEach(function(v){try{if(!v.paused)v.pause()}catch(e){}});
    playing.clear();
  }else{
    allLoops().forEach(function(v){
      if(v.closest&&v.closest("#gj-tiles"))return;
      var p=v.play();if(p&&p.catch)p.catch(function(){});
    });
    reconcile();
  }
  if(band)band.setAttribute("aria-pressed",paused?"true":"false");
  try{window.dispatchEvent(new Event("gjpause"))}catch(e){}
  return paused;
}
var band;
/* Tap feedback at the tap point: one soft ring (a thin line and a faint glow in the current ink), 0.16 at its peak, 32px out, gone in about half a
   second. It sits in the header band, above the header text, and takes no taps. The ink comes from the theme, so Red gets its own ink and never white.
   With Reduce Motion it does not grow: the same ring simply fades. */
function ink(a){
  var c="rgba(232,228,220,"+a+")";
  try{if(window.GJ_THEME&&GJ_THEME.map)c=GJ_THEME.map(c)}catch(e){}
  return c;
}
function ripple(x,y){
  if(!band||!band.animate)return;
  var calm=false;
  try{calm=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
  var r=band.getBoundingClientRect(),ring=document.createElement("i");
  ring.className="gj-rip";
  ring.style.left=(x-r.left)+"px";
  ring.style.top=(y-r.top)+"px";
  ring.style.borderColor=ink(1);
  ring.style.background="radial-gradient(circle,"+ink(.35)+" 0,"+ink(0)+" 72%)";
  band.appendChild(ring);
  var a=ring.animate(calm
    ?[{transform:"scale(1)",opacity:.16},{transform:"scale(1)",opacity:0}]
    :[{transform:"scale(.375)",opacity:.16},{transform:"scale(1)",opacity:0}],
    {duration:calm?420:520,easing:calm?"ease-out":"cubic-bezier(.2,.6,.3,1)",fill:"forwards"});
  a.onfinish=function(){if(ring.parentNode)ring.parentNode.removeChild(ring)};
}
function inBox(x,y,b){return x>=b.l&&x<=b.r&&y>=b.t&&y<=b.b}
/* A tap counts only on the empty black of the header: not on its text, and not on any film (video or still, caption included). */
function emptyHeader(x,y,info){
  var i,r,t,hx=info.headText||[];
  for(i=0;i<hx.length;i++)if(inBox(x,y,hx[i]))return false;
  var tiles=window.__u1&&__u1.tiles||[],cap=Math.max(info.cap||0,26);
  for(i=0;i<info.rects.length;i++){
    r=info.rects[i];t=tiles[i];
    if(!r||!t)continue;
    if(inBox(x,y,{l:t.x-r.w/2,r:t.x+r.w/2,t:t.y-r.h/2,b:t.y+r.h/2+cap}))return false;
  }
  return true;
}
function ensureBand(){
  if(band)return band;
  var stage=document.getElementById("stage");
  if(!stage)return null;
  band=document.createElement("div");
  band.id="gj-head";
  band.setAttribute("role","button");
  band.setAttribute("tabindex","0");
  band.setAttribute("aria-label","Pause or resume the film loops");
  band.setAttribute("aria-pressed",paused?"true":"false");
  band.hidden=true;
  band.addEventListener("click",function(e){
    var u=window.__u1,info=u&&u.rects;
    if(!info||info.key!=="film")return;
    if(e.detail&&!emptyHeader(e.clientX,e.clientY,info))return;
    e.stopPropagation();
    if(e.detail)ripple(e.clientX,e.clientY);
    setPaused(!paused);
  });
  band.addEventListener("keydown",function(e){
    if(e.key!=="Enter"&&e.key!==" ")return;
    e.preventDefault();e.stopPropagation();
    setPaused(!paused);
  });
  stage.appendChild(band);
  return band;
}
function syncBand(on,info){
  if(!on||!info){if(band)band.hidden=true;return}
  if(!ensureBand())return;
  var win=info.win,hh=Math.max(0,Math.round(info.head||0));
  band.hidden=false;
  band.style.left=win[0]+"px";
  band.style.top=win[1]+"px";
  band.style.width=win[2]+"px";
  band.style.height=hh+"px";
}
function tick(){
  syncBoard();
  dressStrip();
  dressHeroes();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.GJ_PLAY={
  get paused(){return paused},
  setPaused:setPaused,
  emptyHeader:function(x,y){var u=window.__u1,info=u&&u.rects;return !!(info&&info.key==="film"&&band&&!band.hidden&&emptyHeader(x,y,info))},
  filmTag:filmTag,
  sources:sources,
  poster:poster,
  hasLoop:hasLoop,
  rungFor:rungFor,
  maxPlay:maxPlay,
  release:release,
  arm:arm,
  tryPlay:tryPlay
};
})();
