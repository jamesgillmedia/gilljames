/* Photo lab · the day's bottom drawer. One continuous native scroll: this only reads the day's scrollTop (passive) and
   writes --dp. No touch, pointer or wheel handling, so it cannot fight the scroll. Buttons are ordinary taps. */
(function(){
'use strict';
var dsc=document.getElementById('dsc'),track=document.getElementById('dtrack'),dr=document.getElementById('drawer');
if(!dsc||!track||!dr)return;
var last=-1;
function update(){
  var h=track.offsetHeight||1,p=(dsc.scrollTop+dsc.clientHeight-track.offsetTop)/h;p=p<0?0:p>1?1:p;
  p=Math.round(p*200)/200;if(p===last)return;last=p;
  track.style.setProperty('--dp',p);dr.setAttribute('aria-hidden',p>.6?'false':'true');
}
dsc.addEventListener('scroll',update,{passive:true});
addEventListener('resize',update);
document.addEventListener('lab:layer',function(){last=-1;requestAnimationFrame(update)});
var safeB=dr.querySelector('[data-d=safe]');
function syncSafe(){safeB.setAttribute('aria-pressed',LAB.safelight.on());safeB.textContent=LAB.safelight.on()?'safelight on':'safelight off'}
syncSafe();
dr.addEventListener('click',function(e){var b=e.target.closest('[data-d]');if(!b)return;var k=b.dataset.d;
  if(k==='horizon')LAB.layer.back();
  else if(k==='sheet')LAB.layer.unwind();
  else if(k==='camera')LAB.hz.camera();
  else if(k==='safe'){LAB.safelight.set(!LAB.safelight.on());syncSafe()}
  else if(k==='site')LAB.leave(LAB.root)});
document.addEventListener('lab:layer',syncSafe);
})();
