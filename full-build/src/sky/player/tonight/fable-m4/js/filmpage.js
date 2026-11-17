/* m4 film pages · every film plays in Scope (next brief §3, Gill's rule of 18 Oct: the site's own player, never a host player).
   The page's 2.39 figure becomes Scope's stage: cut rail, scrub, shot strip, sound, and the move between the 2.39 frame and full screen.
   What plays is this film's own local file, read from media/scope/<slug>.json (tools/scope/mkfilms.py). A film with no local file yet
   keeps its still and says so. Nothing here ever points at Vimeo or YouTube.
   Full screen is one history step: Back (and Esc) return to the 2.39 frame first. */
(function(){
'use strict';
var fig=document.querySelector('figure.hero[data-scope]');if(!fig||!window.GJScope)return;
var slug=fig.getAttribute('data-scope'),ME=document.currentScript.src,ROOT=new URL('../../../../../../',ME),M4=new URL('../',ME);
var EASE='cubic-bezier(.2,.7,.2,1)',still=fig.querySelector('img');
var sp=document.createElement('div');sp.className='sp';sp.id='sp';
sp.innerHTML='<div class="sp-veil"></div><figure class="hero frame239 sp-stage"><div class="sp-frame"></div><button type="button" class="sp-go" hidden>▶ play film</button></figure><div class="sp-chrome"></div>';
var stage=sp.querySelector('.sp-stage'),frame=sp.querySelector('.sp-frame'),go=sp.querySelector('.sp-go'),chrome=sp.querySelector('.sp-chrome'),SC=null,F=null;
if(still)frame.appendChild(still);fig.parentNode.replaceChild(sp,fig);
function note(t){var p=document.createElement('p');p.className='sp-note';p.textContent=t;sp.appendChild(p)}
function abs(p){return new URL(p,ROOT).href}
/* the move: the frame keeps its place on screen while the stage changes from the page's figure to the whole screen */
var R0=null;
function before(){R0=frame.getBoundingClientRect()}
function after(fl){document.documentElement.classList.toggle('sp-full',fl);
  if(fl&&!(history.state&&history.state.spfull)){try{var s={};for(var k in (history.state||{}))s[k]=history.state[k];s.spfull=1;history.pushState(s,'')}catch(e){}}
  else if(!fl&&history.state&&history.state.spfull&&!POP){try{history.back()}catch(e){}}
  if(!R0||!frame.animate)return;var a=R0;R0=null;
  /* in the same tick as the change, so there is never a frame at the new place: the frame is centred in its stage before and after,
     so the offset between the two stage centres is the whole move; the size eases on its own (Scope's width / height transition) */
  var s=stage.getBoundingClientRect(),dx=(a.left+a.width/2)-(s.left+s.width/2),dy=(a.top+a.height/2)-(s.top+s.height/2);
  sp.classList.add('sp-moving');clearTimeout(MT);MT=setTimeout(function(){sp.classList.remove('sp-moving')},600);
  if(Math.abs(dx)+Math.abs(dy)<1)return;if(MA)try{MA.cancel()}catch(e){}
  MA=frame.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'none'}],{duration:550,easing:EASE})}
var MT=0,MA=null;
var POP=0;
addEventListener('popstate',function(e){if(SC&&SC.isFull()&&!(e.state&&e.state.spfull)){POP=1;SC.cut();setTimeout(function(){POP=0},700);e.stopImmediatePropagation()}},true);
addEventListener('keydown',function(e){if(e.key==='Escape'&&SC&&SC.isFull()){e.preventDefault();e.stopImmediatePropagation();SC.cut()}
  else if(SC&&SC.on()&&!e.defaultPrevented&&!/INPUT|TEXTAREA|SELECT/.test((e.target&&e.target.tagName)||'')){
    if(e.key===' '||e.key==='k'){e.preventDefault();SC.toggle()}else if(e.key==='f'){e.preventDefault();SC.toggleFull()}}},true);
var PLAYED=0;
function label(t){var playing=/playing/.test(t),loading=/loading/.test(t);sp.classList.toggle('playing',playing||loading);
  /* the Mark brightens while the film is paused (not before it has played, not after it has ended) */
  if(playing)PLAYED=1;if(window.GJ&&GJ.hold)GJ.hold('scope',!!PLAYED&&/play film/.test(t));go.textContent=t.replace(/^❚❚ playing$/,'❚❚ pause');go.classList.toggle('rest',playing)}
fetch(new URL('media/scope/'+slug+'.json',M4)).then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(f){
  /* Pack A §1: a film with no local file plays from its hidden source if it has one; with neither, the still stands */
  if(f&&(!f.parts||!f.parts.length)&&f.hidden&&f.hidden.src){f.parts=[{src:f.hidden.src,t:0,d:f.dur||0}];f.hidden={}}
  if(!f||!f.parts||!f.parts.length){note('No local file for this film yet. The still stands in until one is added.');return}
  F={key:f.key,alt:(f.hidden&&f.hidden.src)?[{src:f.hidden.src,t:0,d:f.dur}]:null,reel:!!f.reel,meta:(f.meta||'')+(f.sound===false?' · picture only':''),dur:f.dur,fps:f.fps,ar:f.ar,poster:f.poster?abs(f.poster):'',
     parts:f.parts.map(function(p){return{src:abs(p.src),t:p.t,d:p.d}}),shots:(f.shots||[]).map(function(s){return{t:s.t,th:s.th?abs(s.th):'',title:s.title||''}})};
  SC=window.GJScope.create({frame:frame,stage:stage,chrome:chrome,full:sp,onLabel:label,beforeFull:before,onFull:after,
    /* neither the local file nor a hidden source could play: Scope steps aside and the still stands, with one plain line and no link */
    onDead:function(){var im=document.createElement('img');im.src=F.poster;im.alt='';try{SC.stop()}catch(e){}frame.innerHTML='';frame.appendChild(im);go.hidden=true;sp.classList.remove('playing');if(!sp.querySelector('.sp-note'))note('This film cannot play right now. The still stands in.')}});
  SC.load(F);SC.el.classList.add('own');if(f.sound===false)SC.el.classList.add('silent');
  go.hidden=false;go.addEventListener('click',function(e){e.stopPropagation();SC.toggle()});
  window.GJ_FILMPAGE={scope:SC,film:F,state:function(){return SC.state()}};
  if(/[?&]play=1/.test(location.search)||location.hash==='#play')SC.play();
});
})();
