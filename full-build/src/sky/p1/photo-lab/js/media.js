/* Photo lab · media options: stills / video / clips (ported from the lab-lens preview's stills, video and clips switches).
   stills: the photographs (the 59 stills).  video: the eight clips only.  clips: every photograph with the clips woven in.
   Film (video, clips) takes on the tonight environment (tonight/fable-m4: blue-black stage, warm-white ink, moon, dust);
   stills keeps the photo-lab light environment, safelight included. Media itself is never graded or tinted.
   Safelight is not edited here: entering film steps its class off and leaving puts it back, and its saved choice is untouched. */
(function(){
'use strict';
var LAB=window.LAB,P=LAB.photos,KEY='gj-photo-lab-media',SAFE_KEY='gj-photo-lab-safelight',mode='stills';
try{var m=localStorage.getItem(KEY);if(m==='video'||m==='clips'||m==='stills')mode=m}catch(e){}
var isFilm=function(x){return x!=='stills'},film=isFilm(mode);
var SL=LAB.safelight,slSet=SL.set,slOn=SL.on,pref=slOn();
SL.set=function(on){pref=!!on;if(!film){slSet(on);return}try{localStorage.setItem(SAFE_KEY,on?'1':'0')}catch(e){}};
SL.on=function(){return film?pref:slOn()};

var body=document.body;
function list(){
  if(mode==='video')return P.filter(function(p){return p.kind==='clip'});
  if(mode==='clips')return P.slice();
  return P.filter(function(p){return p.kind!=='clip'})}
function env(){
  body.classList.toggle('film',film);
  if(film){if(slOn()){body.classList.remove('safe');var b=document.getElementById('safe');if(b){b.classList.remove('on');b.setAttribute('aria-pressed','false')}}}
  else if(pref)slSet(true);
  var tc=document.querySelector('meta[name=theme-color]');if(tc&&film)tc.content='#04070b'}
function sync(){
  document.querySelectorAll('#media [data-m]').forEach(function(b){var on=b.dataset.m===mode;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  body.dataset.media=mode}
function commit(m,fromUser){
  var was=film;mode=m;film=isFilm(m);
  try{localStorage.setItem(KEY,m)}catch(e){}
  env();sync();document.dispatchEvent(new CustomEvent('lab:list',{detail:m}));
  if(fromUser)LAB.hint(m==='stills'?'stills — the photographs':m==='video'?'video — the eight clips, in tonight’s light':'clips — woven in with the stills, in tonight’s light',2800)}
function set(m,fromUser){
  if(m===mode)return;
  var cross=isFilm(m)!==film;
  if(cross&&document.startViewTransition&&!LAB.reducedMotion){
    var root=document.documentElement;root.classList.add('env-vt');
    var t=document.startViewTransition(function(){commit(m,fromUser)});
    var done=function(){root.classList.remove('env-vt')};t.finished.then(done,done);return}
  if(cross){body.classList.add('env-dip');setTimeout(function(){commit(m,fromUser);setTimeout(function(){body.classList.remove('env-dip')},40)},320);return}
  commit(m,fromUser)}
LAB.media={mode:function(){return mode},film:function(){return film},list:list,set:set};

document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#media [data-m]');if(b)set(b.dataset.m,true)});
document.addEventListener('lab:layer',function(){var t=LAB.layer.top();body.classList.toggle('media-hide',t==='day'||t==='camera back')});

/* tonight's dust: a few still points, placed once */
(function(){var d=document.getElementById('tnDust');if(!d)return;var h='';
  for(var i=0;i<38;i++){var x=Math.sin(i*12.9898+78.233)*43758.5453,y=Math.sin(i*39.346+11.135)*24634.6345;x-=Math.floor(x);y-=Math.floor(y);
    h+='<i style="left:'+(x*100).toFixed(1)+'%;top:'+(y*72).toFixed(1)+'%;opacity:'+(.25+((x*7)%1)*.45).toFixed(2)+'"></i>'}
  d.innerHTML=h})();
env();sync();
})();
