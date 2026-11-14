/* site-v3-3d sound · open straight into the player; waveform at full #e8e4dc;
   no YouTube or Vimeo; ‹ returns to this site's Sound constellation;
   To Go duration comes from the audio file. */
(function(){
'use strict';
var CAP='#e8e4dc';

/* strip any leftover YouTube / Vimeo from the shared tracks table */
if(window.TRACKS){
  Object.keys(TRACKS).forEach(function(k){
    var t=TRACKS[k];if(!t)return;
    if(t.src&&/youtube|youtu\.be|vimeo/i.test(t.src))t.src='';
  });
}

/* every fill on the waveform canvas is warm white at full opacity, played and unplayed */
(function(){
  var proto=CanvasRenderingContext2D.prototype;
  var desc=Object.getOwnPropertyDescriptor(proto,'fillStyle');
  if(!desc||!desc.set)return;
  Object.defineProperty(proto,'fillStyle',{
    configurable:true,
    enumerable:true,
    get:function(){return desc.get.call(this)},
    set:function(v){
      if(this.canvas&&this.canvas.id==='wf')v=CAP;
      desc.set.call(this,v);
    }
  });
})();

/* ‹ always goes to the 3d Sound constellation, even with no referrer */
(function(){
  var h=document.getElementById('home');if(!h)return;
  var dest=new URL('../#sky/sound',location.href).href;
  h.setAttribute('href',dest);
  h.addEventListener('click',function(e){
    e.preventDefault();
    try{
      var r=document.referrer&&new URL(document.referrer);
      if(r&&r.origin===location.origin&&/\/site-v3-3d\/?$/.test(r.pathname.replace(/index\.html$/,''))){
        history.back();return;
      }
    }catch(x){}
    location.assign(dest);
  });
})();

/* open the player on the first frame; do not wait for DIVE IN */
function goIn(){
  if(window.__sk&&typeof __sk.goIn==='function'){try{__sk.goIn()}catch(e){}return true}
  return false;
}
if(!goIn()){
  var n=0,id=setInterval(function(){if(goIn()||++n>80)clearInterval(id)},40);
  addEventListener('load',goIn);
}

/* To Go (and any other track): duration from the actual file, shown in the player */
function fmt(s){s=Math.max(0,Math.round(s));var m=(s/60)|0,r=s%60;return (m<10?'0':'')+m+':'+(r<10?'0':'')+r}
function syncDur(){
  var au=document.getElementById('au');if(!au||!isFinite(au.duration)||au.duration<=0)return;
  var d=au.duration,rail=document.getElementById('rail'),tc=document.getElementById('tc');
  if(window.TRACKS){
    var k=(window.__sk&&__sk.sel&&__sk.sel().k)||'togo';
    if(TRACKS[k]&&Math.abs((TRACKS[k].dur||0)-d)>0.25)TRACKS[k].dur=Math.round(d);
  }
  if(rail){rail.setAttribute('aria-valuemax',String(Math.round(d)))}
  if(tc&&/\/\s*\d/.test(tc.textContent||'')){
    var cur=(tc.textContent.split('/')[0]||'00:00').trim();
    tc.textContent=cur+' / '+fmt(d);
  }
}
var au=document.getElementById('au');
if(au){
  au.addEventListener('loadedmetadata',syncDur);
  au.addEventListener('durationchange',syncDur);
}

/* drop a DIVE IN button if the shared player painted one; we are already in */
addEventListener('DOMContentLoaded',function(){
  var d=document.getElementById('dive');if(d)d.setAttribute('hidden','');
});
})();
