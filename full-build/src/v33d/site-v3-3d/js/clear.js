/* Keep a settled chapter grid out of the fixed dock. The row that would sit under the bar
   is pushed below it, so stills and the bar do not share pixels. Reduce Motion uses the same placement. */
(function(){
'use strict';
var t=0,burst=0;
function run(){
  var dock=document.querySelector('.dock');if(!dock)return;
  document.querySelectorAll('.ch .it').forEach(function(el){if(el.style.marginTop)el.style.marginTop='';});
  var dr=dock.getBoundingClientRect(),keep=dr.top-8;
  for(var pass=0;pass<12;pass++){
    var hit=null,group=[];
    document.querySelectorAll('.ch.lv2 .vis').forEach(function(img){
      var r=img.getBoundingClientRect();
      if(r.width<4||r.height<4)return;
      if(r.bottom>keep&&r.top<dr.bottom){
        var it=img.closest('.it');
        if(!hit||r.top<hit.top-1){hit={top:r.top,it:it};group=[it];}
        else if(Math.abs(r.top-hit.top)<2)group.push(it);
      }
    });
    if(!hit)break;
    var push=(dr.bottom+8)-hit.top;
    group.forEach(function(el){var cur=parseFloat(el.style.marginTop)||0;el.style.marginTop=(cur+push).toFixed(1)+'px';});
  }
}
function kick(){if(burst>6)return;burst++;cancelAnimationFrame(t);t=requestAnimationFrame(function(){t=requestAnimationFrame(run);});clearTimeout(kick._b);kick._b=setTimeout(function(){burst=0;},500);}
addEventListener('resize',kick);
addEventListener('scroll',function(){if(burst)return;clearTimeout(kick._s);kick._s=setTimeout(kick,180);},{passive:true});
addEventListener('hashchange',function(){setTimeout(kick,60);setTimeout(kick,700);});
if(document.readyState==='loading')addEventListener('DOMContentLoaded',arm);else arm();
function arm(){
  document.querySelectorAll('.ch').forEach(function(sec){
    new MutationObserver(kick).observe(sec,{attributes:true,attributeFilter:['class']});
  });
  kick();setTimeout(kick,500);setTimeout(kick,1400);
}
})();
