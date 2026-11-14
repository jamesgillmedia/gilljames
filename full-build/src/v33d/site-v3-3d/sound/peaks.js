/* site-v3-3d sound · fold: the waveform as a star chart. The three brightest peaks of the current song are named stars on the rail
   (song · time), read from the waveform canvas itself. Tap a star to fly there. Nothing is fabricated: no peak, no star. */
(function(){
'use strict';
var rail=document.getElementById('rail'),wf=document.getElementById('wf'),ttl=document.getElementById('ttl'),tc=document.getElementById('tc');
if(!rail||!wf)return;
var box=document.createElement('div');box.className='pk-chart';box.setAttribute('aria-hidden','true');rail.appendChild(box);
function dur(){var m=/\/\s*(\d+):(\d+)/.exec(tc&&tc.textContent||'');return m?(+m[1])*60+(+m[2]):0}
function fmt(s){s=Math.round(s);return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function scan(){
  var w=wf.width,h=wf.height;if(!w||!h)return;var g;try{g=wf.getContext('2d').getImageData(0,0,w,h).data}catch(e){return}
  var col=[],x,y;for(x=0;x<w;x+=2){var n=0;for(y=0;y<h;y+=2)if(g[(y*w+x)*4+3]>60)n++;col.push([x,n])}
  var picks=[],sorted=col.slice().sort(function(a,b){return b[1]-a[1]});
  for(var i=0;i<sorted.length&&picks.length<3;i++){var c=sorted[i];if(c[1]<2)break;if(picks.every(function(p){return Math.abs(p[0]-c[0])>w*.18}))picks.push(c)}
  var d=dur(),name=(ttl&&ttl.textContent||'').trim();box.innerHTML='';
  picks.sort(function(a,b){return a[0]-b[0]}).forEach(function(p,i){var f=p[0]/w,el=document.createElement('button');el.type='button';el.className='pk';
    el.style.left=(f*100).toFixed(2)+'%';el.innerHTML='<i></i><span>'+(d?fmt(f*d):'peak '+(i+1))+'</span>';el.title=name+' · peak '+(d?fmt(f*d):'');
    el.addEventListener('click',function(e){e.stopPropagation();var a=document.getElementById('au');if(a&&a.duration){a.currentTime=f*a.duration}});box.appendChild(el)});
  if(picks.length){var l=document.createElement('p');l.className='pk-name';l.textContent=name+' · peaks';box.appendChild(l)}
}
var t=0;function soon(){clearTimeout(t);t=setTimeout(scan,500)}
if(ttl)new MutationObserver(soon).observe(ttl,{childList:true,characterData:true,subtree:true});
addEventListener('resize',soon);setTimeout(scan,1200);setTimeout(scan,3000);
})();
