/* site-v3-3d · Frame-film experiment in the Film player only.
   Plays the local preview clip as canvas-drawn frames at the clip's fps (or a
   1/2 divisor: 12, or 12 000/1001 for 23.976), with no reliance on a <video>
   element. Auto-falls back to frames when the video errors, stalls, or refuses
   to play, or the codec is unsupported. Video/Frames toggle is persisted in
   localStorage (gj.film.mode) and honours ?v=frames. Reduce Motion draws the
   same frames on the same clock. Frame mode is silent (the L3 preview was
   already muted; full-film audio stays on the Video path). Films without a
   local frame set keep the video path and fall back gracefully to the still. */
(function(){
'use strict';
var MAN_URL='../site-v3-3d/media/frames/manifest.json';
var LS='gj.film.mode';
var man=null, manQ=null, mode='video', work=null, rec=null, sheet=null, sheetUrl='';
var playing=false, t0=0, acc=0, raf=0, hold=null, canvas=null, ctx=null, poster=null, tog=null;
var cur=0, FALL=0, preload={}, quiet=0;

function rd(k,d){try{var v=localStorage.getItem(k);if(v==null||v==='')return d;return v}catch(e){return d}}
function wr(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
function dive(){return window.__dive}
function state(){return filmPlayer&&filmPlayer()||(function(){var d=dive();if(!d||!d.state)return null;var s=d.state();return (s&&s.k==='film'&&s.lv===3&&s.w)?s:null})()}
function itemEl(w){return document.querySelector('#film .it[data-k="'+w+'"]')}
function has(w){return !!(man&&man[w])}

function readMode(){
  var q=location.search||'';
  if(/(?:^|[?&])v=frames(?:&|$)/.test(q)){wr(LS,'frames');wr('gj.v','frames');return 'frames'}
  if(/(?:^|[?&])v=video(?:&|$)/.test(q)){wr(LS,'video');return 'video'}
  var v=rd(LS,'');
  if(v==='frames'||v==='video')return v;
  if(rd('gj.v','')==='frames')return 'frames';
  return 'video';
}
mode=readMode();

function loadMan(){
  if(man)return Promise.resolve(man);
  if(manQ)return manQ;
  manQ=fetch(MAN_URL,{cache:'force-cache'}).then(function(r){return r.ok?r.json():{}}).then(function(j){man=j||{};return man}).catch(function(){man=man||{};return man});
  return manQ;
}
function preloadSheet(w){
  if(!has(w)||preload[w])return preload[w];
  var im=new Image();im.decoding='async';
  preload[w]=new Promise(function(res,rej){im.onload=function(){res(im)};im.onerror=rej;im.src=man[w].sheet});
  return preload[w];
}
function frameOf(w){return document.querySelector('.imm .frame')}
function playBtn(){return document.querySelector('.imm [data-a=play]')}
function revealPlay(){
  var b=playBtn();if(!b||!has(work))return;
  b.hidden=false;b.removeAttribute('hidden');b.style.display='';
}
function videoUsable(){
  var f=frameOf();if(!f)return false;
  var ok=false;
  [].forEach.call(f.querySelectorAll('video'),function(v){
    if(v.error)return;
    var src=v.currentSrc||v.src||v.getAttribute('src')||'';
    if(src&&!/youtube|youtu\.be|vimeo/i.test(src))ok=true;
  });
  return ok;
}
function hostBlocked(w){
  var it=itemEl(w);if(!it)return false;
  var j={};try{j=JSON.parse(it.dataset.j||'{}')}catch(e){}
  return /youtube|youtu\.be|vimeo/i.test(String(j.embed||'')+' '+String(j.url||''));
}
function showStill(){
  ensureHold();darkPoster();hideVideos(true);
  var imm=document.querySelector('.imm');if(imm)imm.classList.add('ff-frames');
}
function blockEmbed(w){
  if(!hostBlocked(w))return;
  if(has(w))fallback('embed');
  else showStill();
}

function ensureHold(){
  var f=frameOf();if(!f)return null;
  hold=f.querySelector('.ff-hold');
  if(!hold){
    hold=document.createElement('div');hold.className='ff-hold';hold.setAttribute('aria-hidden','true');
    poster=document.createElement('img');poster.className='ff-poster';poster.alt='';
    canvas=document.createElement('canvas');canvas.className='ff-canvas';
    hold.appendChild(poster);hold.appendChild(canvas);
    f.appendChild(hold);
  }else{
    poster=hold.querySelector('.ff-poster');canvas=hold.querySelector('.ff-canvas');
  }
  ctx=canvas.getContext('2d');
  return hold;
}
function ensureToggle(){
  var bar=document.querySelector('.imm-b');if(!bar)return;
  tog=bar.querySelector('.ff-mode');
  if(!tog){
    tog=document.createElement('div');tog.className='ff-mode';tog.setAttribute('role','radiogroup');tog.setAttribute('aria-label','playback');
    tog.innerHTML='<button type="button" role="radio" data-ff="video" aria-checked="false">Video</button>'+
                  '<button type="button" role="radio" data-ff="frames" aria-checked="false" aria-label="Frames, silent playback">Frames</button>';
    bar.insertBefore(tog, bar.querySelector('[data-a=ext]')||null);
    tog.addEventListener('click',function(e){
      var b=e.target.closest('[data-ff]');if(!b||b.disabled)return;
      e.preventDefault();e.stopPropagation();
      setMode(b.getAttribute('data-ff'), true);
    });
  }
  paintToggle();
}
function paintToggle(){
  if(!tog)return;
  var avail=has(work);
  tog.classList.toggle('ff-off',!avail);
  [].forEach.call(tog.querySelectorAll('[data-ff]'),function(b){
    var on=b.getAttribute('data-ff')===mode;
    b.setAttribute('aria-checked',on?'true':'false');
    if(b.getAttribute('data-ff')==='frames'){b.disabled=!avail;b.title=avail?'':'No frame set for this film'}
  });
}
function setMode(m, user){
  mode=(m==='frames'?'frames':'video');
  if(user)wr(LS,mode);
  var imm=document.querySelector('.imm');
  if(imm)imm.classList.toggle('ff-frames', mode==='frames'&&has(work));
  paintToggle();
  if(!state())return;
  if(mode==='frames'&&has(work)) startFrames(true);
  else stopFrames(true);
}

function hideVideos(on){
  var f=frameOf();if(!f)return;
  [].forEach.call(f.querySelectorAll('video'),function(v){
    try{v.pause()}catch(e){}
    if(on){v.setAttribute('data-ff-hold','1');v.muted=true}
  });
}
function draw(i){
  if(!ctx||!sheet||!rec)return;
  var c=rec.cols, fw=rec.fw, fh=rec.fh;
  var x=(i%c)*fw, y=Math.floor(i/c)*fh;
  if(canvas.width!==fw||canvas.height!==fh){canvas.width=fw;canvas.height=fh}
  ctx.drawImage(sheet,x,y,fw,fh,0,0,fw,fh);
  cur=i;
  if(poster)poster.classList.add('ff-out');
}
function tick(now){
  if(!playing||!rec)return;
  var t=acc+(now-t0)/1000;
  var dur=rec.count/rec.fps;
  if(rec.loop){t=t%dur;if(t<0)t+=dur}
  else t=Math.min(t, Math.max(0,dur-1/rec.fps));
  /* drop frames rather than drift: index from the clock, not from the last draw */
  var i=Math.min(rec.count-1, Math.max(0, Math.floor(t*rec.fps)));
  draw(i);
  raf=requestAnimationFrame(tick);
}
function playClock(on){
  if(on){
    if(playing)return;
    playing=true;t0=performance.now();
    raf=requestAnimationFrame(tick);
    label(true);
  }else{
    if(playing){acc+=(performance.now()-t0)/1000;playing=false}
    if(raf){cancelAnimationFrame(raf);raf=0}
    label(false);
  }
}
function label(on){
  var b=playBtn();if(!b)return;
  if(mode==='frames'&&has(work)){
    b.textContent=on?'❚❚ playing':'▶ play film';
    b.setAttribute('aria-pressed',on?'true':'false');
  }
}
function darkPoster(){
  var it=itemEl(work);if(!poster||!it)return;
  var src=it.getAttribute('data-big')||'';
  if(src)poster.src=src;
  poster.classList.remove('ff-out');
}

function startFrames(autoplay){
  if(!has(work))return;
  rec=man[work];ensureHold();ensureToggle();darkPoster();
  var imm=document.querySelector('.imm');if(imm)imm.classList.add('ff-frames');
  hideVideos(true);
  playClock(false);acc=0;cur=0;
  preloadSheet(work).then(function(im){
    if(!state()||state().w!==work||mode!=='frames')return;
    sheet=im;sheetUrl=rec.sheet;draw(0);
    if(autoplay!==false)playClock(true);
  }).catch(function(){ /* stay on the dark poster */ });
  /* preload neighbours */
  var all=[].map.call(document.querySelectorAll('#film .it[data-k]'),function(el){return el.getAttribute('data-k')});
  var i=all.indexOf(work);
  [all[i-1],all[i+1]].forEach(function(w){if(w&&has(w))preloadSheet(w)});
}
function stopFrames(resumeVideo){
  playClock(false);acc=0;
  var imm=document.querySelector('.imm');if(imm)imm.classList.remove('ff-frames');
  if(resumeVideo){
    var f=frameOf();if(!f)return;
    quiet++;
    var pending=1;
    function done(){if(--pending<=0)quiet=Math.max(0,quiet-1)}
    [].forEach.call(f.querySelectorAll('video'),function(v){
      v.removeAttribute('data-ff-hold');
      pending++;
      try{var q=v.play();if(q&&q.then)q.then(done,done);else done()}catch(e){done()}
    });
    done();
  }
}

function fallback(why){
  if(quiet)return;
  if(!has(work)||mode==='frames')return;
  if(FALL&&Date.now()-FALL<800)return;
  FALL=Date.now();
  mode='frames'; /* session fallback; do not overwrite a user's Video preference */
  var imm=document.querySelector('.imm');if(imm)imm.classList.add('ff-frames');
  paintToggle();
  startFrames(true);
}

function watchVid(v){
  if(!v||v.__ffW)return;v.__ffW=1;
  var timer=0;
  function arm(){clearTimeout(timer);timer=setTimeout(function(){if(mode==='video'&&has(work))fallback('stall')},1800)}
  function calm(){clearTimeout(timer)}
  v.addEventListener('error',function(){if(mode==='video')fallback('error')});
  v.addEventListener('stalled',arm);
  v.addEventListener('waiting',arm);
  v.addEventListener('playing',calm);
  v.addEventListener('canplay',calm);
  v.addEventListener('emptied',function(){calm()});
  var p0=v.play;
  v.play=function(){
    if(mode==='frames'&&has(work)){try{this.pause()}catch(e){}return Promise.resolve()}
    var r;
    try{r=p0.apply(this,arguments)}catch(e){fallback('play');return Promise.reject(e)}
    if(r&&r.then)r=r.then(function(x){return x},function(err){fallback('play');throw err});
    return r;
  };
  /* unsupported codec: empty canPlayType or the existing src will error */
  try{
    var src=v.currentSrc||v.src||'';
    if(src&&/\.mp4($|\?)/i.test(src)&&v.canPlayType&&!v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')&&!v.canPlayType('video/mp4'))fallback('codec');
  }catch(e){}
}

function scanVids(){
  var f=frameOf();if(!f)return;
  [].forEach.call(f.querySelectorAll('video'),watchVid);
  if(mode==='frames'&&has(work))hideVideos(true);
}

function onOpen(w){
  work=w;loadMan().then(function(){
    if(!state()||state().w!==w)return;
    ensureToggle();paintToggle();revealPlay();
    if(has(w))preloadSheet(w);
    scanVids();
    blockEmbed(w);
    if(mode==='frames'&&has(w))startFrames(true);
    else{
      var imm=document.querySelector('.imm');if(imm)imm.classList.remove('ff-frames');
    }
    setTimeout(function(){
      if(!state()||state().w!==w)return;
      scanVids();revealPlay();
      if(mode==='frames'&&has(w)){hideVideos(true);if(!playing&&sheet)playClock(true)}
      else if(hostBlocked(w))blockEmbed(w);
      else if(mode==='video'&&has(w)&&!videoUsable())fallback('novideo');
    },120);
    setTimeout(function(){
      if(!state()||state().w!==w)return;
      scanVids();revealPlay();
      if(hostBlocked(w))blockEmbed(w);
      else if(mode==='video'&&has(w)&&!videoUsable())fallback('novideo');
    },400);
  });
}
function onClose(){
  playClock(false);work=null;rec=null;
  var imm=document.querySelector('.imm');if(imm)imm.classList.remove('ff-frames');
  if(tog)tog.remove();tog=null;
}


function filmPlayer(){
  var imm=document.querySelector('.imm');
  if(!imm||imm.hidden)return null;
  var d=dive()&&dive().state&&dive().state();
  if(d&&d.k==='film'&&d.lv===3&&d.w)return d;
  var m=(location.hash||'').match(/^#film\/(w\w+)(?:\/play)?$/);
  if(m)return{k:'film',w:m[1],lv:3,play:false};
  var cur=document.querySelector('#film .it.cur');
  if(cur&&cur.dataset.k)return{k:'film',w:cur.dataset.k,lv:3,play:false};
  return null;
}

function hookWrap(){
  if(!dive()||dive().__v33dFrames)return;
  var go0=dive().go;
  if(typeof go0==='function'){
    dive().go=function(r,o){
      var res=go0(r,o);
      setTimeout(sync,0);
      return res;
    };
  }
  dive().__v33dFrames=1;
}

function sync(){
  hookWrap();
  var st=filmPlayer();
  if(st){
    if(work!==st.w)onOpen(st.w);
    else{
      ensureToggle();paintToggle();scanVids();
      if(mode==='frames'&&has(st.w)){hideVideos(true);if(!playing&&sheet)playClock(true)}
    }
  }else if(work){
    onClose();
  }
}

hookWrap();
addEventListener('DOMContentLoaded',function(){hookWrap();loadMan().then(sync)});
addEventListener('hashchange',sync);
addEventListener('popstate',sync);

/* take over Play in frames mode so we don't depend on the video element */
addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.imm [data-a=play]');
  if(!b||mode!=='frames'||!has(work)||!filmPlayer())return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  if(!sheet){startFrames(true);return}
  if(playing)playClock(false);else playClock(true);
},true);

var mo=new MutationObserver(function(){sync()});
addEventListener('DOMContentLoaded',function(){
  var f=document.querySelector('.imm')||document.body;
  mo.observe(f,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','src']});
});
setInterval(sync,400);

/* blocked or broken video: always fall back to frames, never leave a dead player */
addEventListener('error',function(e){
  var v=e.target;
  if(!v||v.tagName!=='VIDEO')return;
  if(!v.closest||!v.closest('.imm .frame'))return;
  if(has(work)|| (filmPlayer()&&has(filmPlayer().w))) fallback('error');
},true);

loadMan();
window.__filmFrames={
  mode:function(){return mode},
  setMode:setMode,
  has:has,
  isPlaying:function(){return playing},
  work:function(){return work},
  fallback:fallback
};
})();
