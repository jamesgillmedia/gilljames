/* Photo lab · Horizon + contact sheet.
   Every photograph on one line of light, darkest to brightest (or round the colour wheel), measured from the pictures.
   The contact sheet is the same set, numbered, in that same order. Pinch or tap to go between the sheet and the horizon;
   the selected frame is the one standing on the line. Grease-pencil picks are the hearts, kept on this device.
   Tap the standing print for its page (the m4 film-page shape). Tap the standing print to enter its day (no pinch required). Spread your fingers / ‹ / Esc rise one place; on the horizon, spreading opens the contact sheet. Close your fingers on the sheet to go back to the line.
   Same motion with Reduce Motion on. */
(function(){
'use strict';
var P=LAB.photos,$=function(id){return document.getElementById(id)};
function photos(){return (LAB.horizonList)?LAB.horizonList():((LAB.clips&&LAB.clips.list)?LAB.clips.list():P.slice());}
var sky=$('sky'),framesE=$('frames'),rt=$('rt'),nowE=$('now'),day=$('day'),where=$('where'),sortB=$('sort');
var sheet=$('sheet'),sc=$('sc'),grid=$('grid'),sheetB=$('sheetBtn'),pencilB=$('pencil');
var mode='light',L=[],pos=0,target=0,raf=0,els=[],rels=[],reflE=$('refl'),W,H,HY,FH,cols=6,marking=false;

function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function mix(a,b,t){a=hex(a);b=hex(b);return'rgb('+[0,1,2].map(function(k){return Math.round(a[k]+(b[k]-a[k])*t)}).join(',')+')'}
function dark(h,k){var c=hex(h);return'#'+c.map(function(v){v=Math.round(v*k);return(v<16?'0':'')+v.toString(16)}).join('')}
function order(){L=photos().slice();if(mode==='light')L.sort(function(a,b){return a.lum-b.lum});
  else L.sort(function(a,b){var ga=a.sat<.06,gb=b.sat<.06;if(ga!==gb)return ga?1:-1;if(ga)return a.lum-b.lum;return ((a.hue+.92)%1)-((b.hue+.92)%1)});
  $('e0').textContent=mode==='light'?'darker':'warm';$('e1').textContent=mode==='light'?'lighter':'greys';sortB.textContent=mode==='light'?'by light':'by colour';
  $('phdsort').textContent=mode==='light'?'lined up by light':'lined up by colour';
  $('phd').textContent=L.length+((LAB.stills&&LAB.stills.on())?' films':' frames')}
function colCount(){return (innerWidth<720)?4:6}

var park=(function(){var d=document.createElement('div');d.id='vidpark';d.hidden=true;d.setAttribute('aria-hidden','true');document.body.appendChild(d);return d})();
function putMedia(el,p,mirror){if(LAB.isClip(p)){el.appendChild(getClipVid(p,mirror?'refl':'line'))}
  else{var im=new Image();im.alt=mirror?'':'photograph '+LAB.num(p);im.decoding='async';im.src=LAB.th(p);el.appendChild(im)}}
function getClipVid(p,role){var sel='video[data-pid="'+p.id+'"][data-role="'+role+'"]';var v=park.querySelector(sel)||document.querySelector(sel);
  if(v){if(v.parentNode)v.parentNode.removeChild(v);return v}
  v=LAB.video(p,null,{lazy:true,preload:'none',poster:LAB.th(p),label:(role==='refl'?'':'frame '+LAB.num(p))});v.dataset.pid=p.id;v.dataset.role=role;return v}
function parkVideos(root){if(!root)return;(root.querySelectorAll?root:document).querySelectorAll('video').forEach(function(v){LAB.rest(v);park.appendChild(v)})}
function armEl(el,on){var v=el&&el.querySelector&&el.querySelector('video');if(!v)return;if(on)LAB.arm(v);else LAB.rest(v)}
function build(){parkVideos(framesE);parkVideos(reflE);framesE.innerHTML='';reflE.innerHTML='';els=[];rels=[];L.forEach(function(p,i){var f=LAB.el('div','fm');f.dataset.i=i;
    putMedia(f,p,false);if(LAB.hearts.has(p.id))f.appendChild(LAB.el('span','h','♥'));
    framesE.appendChild(f);els.push(f);var r=LAB.el('div','fm');putMedia(r,p,true);reflE.appendChild(r);rels.push(r)});
  rt.innerHTML=L.map(function(p){return'<i style="background:'+p.avg+'"></i>'}).join('');size();buildSheet()}
function size(){W=innerWidth;H=innerHeight;var land=W>H;HY=Math.round(H*(land&&H<500?.70:.64));
  FH=land?Math.min(H*.52,HY-64):Math.min(H*.40,HY-96);
  els.forEach(function(f,i){var p=L[i],h=FH,w=h*p.w/p.h;if(w>W*(land?.6:.86)){w=W*(land?.6:.86);h=w*p.h/p.w}[f,rels[i]].forEach(function(e){e.style.width=w+'px';e.style.height=h+'px';e.style.marginLeft=(-w/2)+'px'});f.style.marginTop=(-h)+'px';f._w=w});
  sky.style.setProperty('--hy',HY+'px');lastCur=-1;paint();
  var c=colCount();if(c!==cols){cols=c;grid.style.setProperty('--cols',cols)}}
var lastCur=-1;
function paint(){if(!els.length)return;
  var cur=Math.round(pos);if(cur<0)cur=0;if(cur>els.length-1)cur=els.length-1;if(!els[cur]||els[cur]._w==null)return;
  var g=Math.max(10,W*.018),cw=els[cur]._w,nw=FH*.8*.46;
  for(var i=0;i<els.length;i++){var d=i-pos,a=Math.abs(d),f=els[i],r=rels[i];
    if(a>7.5){if(f._v!==0){f.style.display=r.style.display='none';f._v=0;f.classList.remove('cur');armEl(f,false);armEl(r,false)}continue}
    if(!f._v){f.style.display=r.style.display='';f._v=1;armEl(f,true);armEl(r,true)}
    var s=a<1?1-.54*a:Math.max(.2,.46-.05*(a-1)),reach=cw/2+g+nw/2,x=a<1?d*reach:Math.sign(d)*(reach+(a-1)*(nw+g)),
        sink=a<1.6?0:(a-1.6)*FH*.11;
    f.style.transform='translate('+x.toFixed(1)+'px,'+sink.toFixed(1)+'px) scale('+s.toFixed(3)+')';
    r.style.transform='translate('+x.toFixed(1)+'px,'+(-sink).toFixed(1)+'px) scale('+s.toFixed(3)+','+(-s).toFixed(3)+')';
    f.style.zIndex=r.style.zIndex=100-Math.round(a*10);
    f.style.filter='';f.classList.toggle('cur',i===cur)}
  var i0=Math.max(0,Math.floor(pos)),i1=Math.min(L.length-1,i0+1),t=pos-i0,a0=L[i0],a1=L[i1];
  var top=mix(dark(a0.top,.5),dark(a1.top,.5),t),hor=mix(a0.bot,a1.bot,t),wat=mix(dark(a0.bot,.3),dark(a1.bot,.3),t);
  sky.style.setProperty('--skyg','linear-gradient(180deg,'+top+' 0%,'+hor+' '+HY+'px,'+wat+' '+(HY+1)+'px,var(--bg) 100%)');sky.style.setProperty('--wc',wat);
  rt.style.transform='translateX('+(-(pos*6+2.5)).toFixed(1)+'px)';
  if(cur!==lastCur){lastCur=cur;var ch=rt.children;for(var k=0;k<ch.length;k++)ch[k].classList.toggle('on',k===cur);
    var p=L[cur];nowE.textContent=(LAB.stills&&LAB.stills.on()&&p.title)?(LAB.num(p)+' · '+p.title):(LAB.num(p)+' · light '+Math.round(p.lum*100));
    document.querySelector('meta[name=theme-color]').content=dark(a0.top,.5);
    markSheetCur()}}
function loop(){raf=0;var d=target-pos;if(Math.abs(d)<.002){pos=target;paint();return}pos+=d*.11;paint();raf=requestAnimationFrame(loop)}
function go(t,now){target=Math.max(0,Math.min(L.length-1,t));if(now){pos=target;paint()}else if(!raf)raf=requestAnimationFrame(loop)}

/* ---------- contact sheet ---------- */
var sheetObs=null;
function watchSheet(){if(sheetObs)sheetObs.disconnect();
  if(typeof IntersectionObserver==='undefined'){grid.querySelectorAll('video').forEach(function(v){LAB.arm(v)});return}
  sheetObs=new IntersectionObserver(function(ents){ents.forEach(function(en){if(en.isIntersecting)LAB.arm(en.target);else LAB.rest(en.target)})},{root:sc,rootMargin:'80px',threshold:0.15});
  grid.querySelectorAll('video').forEach(function(v){sheetObs.observe(v)})}
function buildSheet(){if(sheetObs){sheetObs.disconnect();sheetObs=null}parkVideos(grid);cols=colCount();grid.style.setProperty('--cols',cols);grid.innerHTML='';
  L.forEach(function(p,i){var b=LAB.el('button','cell');b.type='button';b.dataset.i=i;
    b.setAttribute('aria-label','frame '+LAB.num(p));
    var marked=LAB.hearts.has(p.id),win=LAB.el('span','win');
    if(LAB.isClip(p)){win.appendChild(getClipVid(p,'sheet'))}
    else{var im=new Image();im.alt='';im.decoding='async';im.src=LAB.th(p);im.width=p.w;im.height=p.h;win.appendChild(im)}
    if(marked){win.appendChild(LAB.el('span','pen','✓'));b.classList.add('mk')}
    b.appendChild(win);b.appendChild(LAB.el('span','no',(LAB.stills&&LAB.stills.on()&&p.title)?(LAB.num(p)+' · '+p.title):LAB.num(p)));
    grid.appendChild(b)});
  markSheetCur();watchSheet()}
function markSheetCur(){if(!grid.children.length)return;var cur=Math.round(pos);
  for(var i=0;i<grid.children.length;i++)grid.children[i].classList.toggle('cur',i===cur)}
function scrollCur(){var cur=grid.children[Math.round(pos)];if(cur)cur.scrollIntoView({block:'center',behavior:'smooth'})}
function paintSheetMarks(){for(var i=0;i<grid.children.length;i++){var b=grid.children[i],p=L[i],on=LAB.hearts.has(p.id);
  b.classList.toggle('mk',on);var win=b.querySelector('.win'),pen=win.querySelector('.pen');
  if(on&&!pen)win.appendChild(LAB.el('span','pen','✓'));else if(!on&&pen)pen.remove()}}

function atSheet(){return !LAB.layer.depth()}
function showSheet(on){
  pencilB.hidden=!on;$('back').hidden=on;document.body.classList.toggle('sheet-open',on);sheetB.classList.toggle('on',on);sheetB.setAttribute('aria-pressed',on);
  if(on){setMarking(false);sheet.hidden=false;void sheet.offsetWidth;sheet.classList.add('open');where.textContent='contact sheet';
    markSheetCur();requestAnimationFrame(function(){scrollCur()});
    els.forEach(function(f,i){armEl(f,false);armEl(rels[i],false)});watchSheet();
    LAB.hint('tap a frame to enter the room · ✎ marks a pick · close your fingers to go back',4600)}
  else{sheet.classList.remove('open');where.textContent=(LAB.rooms&&LAB.rooms.current)||'horizon';setMarking(false);
    grid.querySelectorAll('video').forEach(function(v){LAB.rest(v)});
    els.forEach(function(f,i){if(f._v){armEl(f,true);armEl(rels[i],true)}});
    setTimeout(function(){if(!sheet.classList.contains('open'))sheet.hidden=true},1000)}}
function enterHorizon(i){
  if(i!=null&&i>=0)go(i,true);
  if(LAB.layer.top()==='day'||LAB.layer.top()==='camera back')return;
  if(LAB.layer.top()==='horizon'){showSheet(false);return}
  showSheet(false);
  LAB.layer.push('horizon',function(){showSheet(true)})}
function leaveHorizon(){if(LAB.layer.top()==='horizon')LAB.layer.back()}

grid.addEventListener('click',function(e){var b=e.target.closest('.cell');if(!b)return;var i=+b.dataset.i;
  if(marking){LAB.hearts.toggle(L[i].id);paintSheetMarks();syncHearts();return}
  if(LAB.rooms)LAB.rooms.enter(i);else enterHorizon(i)});
function setMarking(on){marking=on;document.body.classList.toggle('marking',on);pencilB.classList.toggle('on',on);pencilB.setAttribute('aria-pressed',on)}
pencilB.addEventListener('click',function(){setMarking(!marking);LAB.hint(marking?'tap a frame to mark it with the grease pencil · tap ✎ again when you are done':'pencil down. tap a frame to stand it on the horizon',3200)});
sheetB.addEventListener('click',function(){var top=LAB.layer.top();
  if(top==='camera back')return;
  if(top==='day'||top==='wall'||top==='reel'||top==='film sheet'||top==='stills zoom'){LAB.layer.back();return}
  if(LAB.rooms){if(top==='horizon'||top==='darkroom')LAB.rooms.leave();else LAB.rooms.enter(null);return}
  if(top==='horizon')leaveHorizon();else enterHorizon(Math.round(pos))});

LAB.pinch(sheet,{in:function(){if(LAB.rooms)LAB.rooms.enter(null);else enterHorizon(Math.round(pos));LAB.patience&&LAB.patience.success()},out:function(){LAB.patience&&LAB.patience.dead('pinch-out')}});

/* ---------- horizon scrub ---------- */
var dr=null,fingers=0;
sky.addEventListener('pointerdown',function(e){
  if(e.pointerType==='touch')fingers++;
  if(fingers>1){if(dr){go(Math.round(dr.p));dr=null}return}
  var onLine=Math.abs(e.clientY-HY)<34;dr={x:e.clientX,y:e.clientY,p:target,m:false,t:Date.now(),vx:0,lx:e.clientX,lt:Date.now(),rate:onLine?-6:FH*.2,id:e.pointerId};try{sky.setPointerCapture(e.pointerId)}catch(err){}});
sky.addEventListener('pointermove',function(e){if(!dr||fingers>1)return;var dx=e.clientX-dr.x;if(Math.abs(dx)>6)dr.m=true;var now=Date.now();dr.vx=(e.clientX-dr.lx)/Math.max(1,now-dr.lt);dr.lx=e.clientX;dr.lt=now;
  if(dr.m){go(dr.rate<0?dr.p-dx/6:dr.p-dx/dr.rate);if(dr.rate<0){pos=target;paint()}}});
sky.addEventListener('pointerup',function(e){
  if(e.pointerType==='touch')fingers=Math.max(0,fingers-1);
  if(!dr||(dr.id!=null&&e.pointerId!==dr.id))return;
  if(fingers>0){dr=null;return}
  if(dr.m){go(Math.round(target-(dr.rate<0?0:dr.vx*900/dr.rate)))}else{var el=document.elementFromPoint(e.clientX,e.clientY),f=el&&el.closest('.fm');
  if(f){var i=+f.dataset.i;if(i===Math.round(pos))openDay(L[i]);else go(i)}else if(LAB.patience)LAB.patience.dead('tap-empty')}dr=null});
sky.addEventListener('pointercancel',function(e){if(e.pointerType==='touch')fingers=Math.max(0,fingers-1);dr=null;go(Math.round(target))});
var wt=0;sky.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;go(target+d/120);clearTimeout(wt);wt=setTimeout(function(){go(Math.round(target))},160)},{passive:false});
LAB.pinch(sky,{in:function(){
  if(LAB.stills&&LAB.stills.on()&&LAB.zoomIndex){LAB.zoomIndex.open(L[Math.round(pos)]);LAB.patience&&LAB.patience.success();return}
  LAB.patience&&LAB.patience.dead('pinch-in')
},out:function(){leaveHorizon();LAB.patience&&LAB.patience.success()}});

sortB.addEventListener('click',function(){var id=L[Math.round(pos)].id;mode=mode==='light'?'colour':'light';order();build();var i=L.findIndex(function(p){return p.id===id});go(i,true);
  LAB.hint(mode==='light'?'lined up by their own light, darkest to brightest':'lined up round the colour wheel, warm first, the greys last',3200)});

/* ---------- the day: a scroll-snap strip, one photograph per page ---------- */
var cp=null, dayStrip=null;
function fillDay(p){
  if(!dayStrip){
    dayStrip=LAB.mountStrip($('strip'),{
      list:function(){return L},
      onChange:function(i,q){cp=q;if(i>=0)go(i,true)},
      onOut:function(){LAB.layer.back()}
    });
  }
  dayStrip.fill();
  var i=L.indexOf(p); if(i<0&&p){i=L.findIndex(function(q){return q.id===p.id})}
  dayStrip.go(Math.max(0,i),true,false);cp=L[Math.max(0,i)]||p;
}
function openDay(p){
  if(!p)return;
  if(LAB.stills&&LAB.stills.on()&&LAB.reel){LAB.reel.open(p);return}
  if(LAB.layer.top()==='day'){fillDay(p);return}
  if(LAB.layer.top()!=='horizon')enterHorizon(L.indexOf(p));
  day.hidden=false;void day.offsetWidth;
  fillDay(p);day.classList.add('open');document.body.classList.add('day-open');where.textContent='horizon · its day';
  LAB.layer.push('day',function(){day.classList.remove('open');document.body.classList.remove('day-open');where.textContent=(LAB.rooms&&LAB.rooms.current)||'horizon';if(dayStrip)dayStrip.resetZoom();var i=L.indexOf(cp);if(i>=0)go(i);setTimeout(function(){if(!day.classList.contains('open'))day.hidden=true},1000)});
}

/* ---------- camera back (in the horizon's order) ---------- */
function camera(){if(LAB.layer.top()==='camera back')return;
  if(atSheet())enterHorizon(Math.round(pos));
  var i=LAB.layer.top()==='day'?L.indexOf(cp):Math.round(pos);
  LAB.cameraBack(L,Math.max(0,i),{onMove:function(k){go(k,true)}})}
$('cam').addEventListener('click',camera);

document.addEventListener('keydown',function(e){var top=LAB.layer.top();if(top==='camera back'||top==='reel'||top==='film sheet'||top==='stills zoom')return;
  if(top==='day'){if(e.key==='Escape')LAB.layer.back();else if(e.key==='+'||e.key==='=')camera();else if(e.key==='ArrowRight'||e.key==='ArrowDown'){if(dayStrip)dayStrip.key(1);e.preventDefault()}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){if(dayStrip)dayStrip.key(-1);e.preventDefault()}return}
  if(atSheet()){
    if(e.key==='ArrowRight'){go(Math.round(target)+1,true);scrollCur();e.preventDefault()}
    else if(e.key==='ArrowLeft'){go(Math.round(target)-1,true);scrollCur();e.preventDefault()}
    else if(e.key==='Enter'||e.key==='+'||e.key==='='){if(LAB.rooms)LAB.rooms.enter(Math.round(pos));else enterHorizon(Math.round(pos));e.preventDefault()}
    else if(e.key==='m'||e.key==='M')setMarking(!marking);
    return}
  if(e.key==='ArrowRight'){go(Math.round(target)+1);e.preventDefault()}else if(e.key==='ArrowLeft'){go(Math.round(target)-1);e.preventDefault()}
  else if(e.key==='Enter'){openDay(L[Math.round(pos)])}
  else if(e.key==='+'||e.key==='='||e.key==='z'||e.key==='Z'){
    if(LAB.stills&&LAB.stills.on()&&LAB.zoomIndex){LAB.zoomIndex.open(L[Math.round(pos)]);e.preventDefault()}
    else openDay(L[Math.round(pos)])
  }else if(e.key==='Escape')leaveHorizon()});

function syncHearts(){els.forEach(function(f,i){var h=f.querySelector('.h'),on=LAB.hearts.has(L[i].id);if(on&&!h)f.appendChild(LAB.el('span','h','♥'));else if(!on&&h)h.remove()});paintSheetMarks()}
document.addEventListener('lab:hearts',syncHearts);
$('back').addEventListener('click',function(){if(LAB.layer.depth())LAB.layer.back()});
addEventListener('resize',size);

try{history.replaceState({lab:0},'')}catch(e){}
LAB.goto=function(id){var i=typeof id==='number'?id:L.findIndex(function(p){return p.id===id||p.n===id});if(i>=0)go(i,true);return i};
LAB.line=function(){return L};
order();build();go(Math.round(L.length*.5),true);
enterHorizon(Math.round(pos));
function openHint(){
  return (LAB.stills&&LAB.stills.on())
    ? 'drag sideways through the films · tap one for its stills · pinch in for the stills index · spread your fingers for the contact sheet'
    : 'drag sideways: every photograph, darkest to brightest · spread your fingers for the contact sheet · tap the one standing there';
}
if(LAB.patience)LAB.patience.opening('horizon',openHint());
LAB.hint(openHint(),5600);
function onListChange(){var cur=Math.round(Math.max(0,Math.min(Math.max(0,L.length-1),pos)));var id=L.length&&L[cur]?L[cur].id:null;order();pos=Math.max(0,Math.min(Math.max(0,L.length-1),pos));target=pos;build();var i=id?L.findIndex(function(p){return p.id===id}):Math.round(L.length/2);if(i<0)i=Math.max(0,Math.round((L.length||1)/2)-1);go(i,true);if(LAB.layer.top()==='day'&&dayStrip)fillDay(L[Math.max(0,i)]||L[0]);if(LAB.patience)LAB.patience.opening('horizon',openHint());}
document.addEventListener('lab:clips',onListChange);
document.addEventListener('lab:list',onListChange);



LAB.go=function(id){var i=L.findIndex(function(p){return p.id===id});if(i>=0)go(i,true);return i};
LAB.sheet={show:showSheet,isOpen:function(){return sheet.classList.contains('open')},scrollCur:scrollCur};
function showHorizon(){sky.hidden=false;els.forEach(function(f,i){if(f._v){armEl(f,true);armEl(rels[i],true)}});size()}
function hideHorizon(){els.forEach(function(f,i){armEl(f,false);armEl(rels[i],false)});sky.hidden=true}
LAB.horizon={enter:enterHorizon,leave:leaveHorizon,go:go,size:size,show:showHorizon,hide:hideHorizon,
  photoAt:function(i){return L[Math.max(0,Math.min(L.length-1,i))]},
  indexOf:function(p){return L.indexOf(p)},
  pos:function(){return Math.round(pos)}};
})();
