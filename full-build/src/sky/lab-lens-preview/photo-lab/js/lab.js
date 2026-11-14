/* Photo lab · shared: the photo list, hearts, the layer stack (every layer is a place; pinch-out / back / Esc rise one layer),
   one-gesture pinch, and the camera back (sheet → 9-up → 4-up → one → closer, dial + pinch + wheel, same levels).
   Motion is the same with Reduce Motion on: nothing here reads prefers-reduced-motion. */
(function(){
'use strict';
var P=window.LAB_PHOTOS||[];
var ROOT=document.documentElement.getAttribute('data-root');if(ROOT==null)ROOT='../';
var LAB=window.LAB={photos:P,root:ROOT};
LAB.img=function(p){return p.img||(ROOT+'media/img/'+p.id+'.webp')};
LAB.th=function(p){return p.th||(ROOT+'media/th/'+p.id+'.webp')};
LAB.clip=function(p){return ROOT+'media/clips/'+p.id+'.mp4'};
LAB.isClip=function(p){return p.kind==='clip'};
LAB.num=function(p){return (p.n<10?'0':'')+p.n};
LAB.video=function(p,src,opt){opt=opt||{};var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.autoplay=!!opt.auto;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.setAttribute('loop','');v.preload=opt.preload||'none';v.poster=opt.poster||LAB.img(p);v.setAttribute('aria-label',opt.label||('frame '+LAB.num(p)));if(src)v.src=src;else if(opt.lazy)v.dataset.clip=LAB.clip(p);else v.src=LAB.clip(p);if(opt.cls)v.className=opt.cls;return v};
LAB.arm=function(v){if(!v||v.tagName!=='VIDEO')return;if(!v.getAttribute('src')&&v.dataset.clip){v.src=v.dataset.clip}var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})};
LAB.rest=function(v){if(!v||v.tagName!=='VIDEO')return;try{v.pause()}catch(e){}};
LAB.$=function(s,el){return (el||document).querySelector(s)};
LAB.el=function(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
/* ---------- hearts (kept on this device only) ---------- */
var HK='gj-photo-lab-hearts',H={};
try{(JSON.parse(localStorage.getItem(HK))||[]).forEach(function(id){H[id]=1})}catch(e){}
LAB.hearts={has:function(id){return !!H[id]},toggle:function(id){if(H[id])delete H[id];else H[id]=1;try{localStorage.setItem(HK,JSON.stringify(Object.keys(H)))}catch(e){}
  document.dispatchEvent(new CustomEvent('lab:hearts',{detail:id}));return !!H[id]},list:function(){return Object.keys(H)}};
/* ---------- the hint line ---------- */
var hintT=0;
LAB.hint=function(t,ms){var h=LAB.$('.lab-hint');if(!h){h=LAB.el('div','lab-hint gone');document.body.appendChild(h)}
  h.textContent=t;void h.offsetWidth;h.classList.remove('gone');clearTimeout(hintT);hintT=setTimeout(function(){h.classList.add('gone')},ms||4200)};
/* ---------- leave the room (slow veil, then go) ---------- */
LAB.leave=function(href){var v=LAB.$('.veil')||document.body.appendChild(LAB.el('div','veil'));void v.offsetWidth;v.classList.add('on');setTimeout(function(){location.href=href},760)};
window.addEventListener('pageshow',function(e){var v=LAB.$('.veil');if(v)v.classList.remove('on')});
/* ---------- layers: each deeper place is a history entry, so phone back / pinch-out / Esc all rise one place ---------- */
var stack=[];
LAB.layer={
  push:function(name,leave){stack.push({name:name,leave:leave});try{history.pushState({lab:stack.length},'')}catch(e){}LAB.layer.changed()},
  depth:function(){return stack.length},
  top:function(){return stack.length?stack[stack.length-1].name:''},
  back:function(){if(stack.length){history.back()}else LAB.leave(ROOT)},
  changed:function(){document.dispatchEvent(new CustomEvent('lab:layer',{detail:LAB.layer.top()}))},
  rename:function(name){if(stack.length){stack[stack.length-1].name=name;LAB.layer.changed()}},
  dropTo:function(keep){
    /* Close every layer above the ones in keep, at once. history.go is followed by popstate;
       the stack is already trimmed, so popstate will not close the room itself. */
    keep=keep||[];
    var n=0;
    while(stack.length){
      var name=stack[stack.length-1].name;
      var stay=false;for(var i=0;i<keep.length;i++)if(keep[i]===name)stay=true;
      if(stay)break;
      var s=stack.pop();n++;
      try{s.leave&&s.leave()}catch(x){console.warn(x)}
    }
    if(n){try{history.go(-n)}catch(e){}LAB.layer.changed()}
    return n;
  }
};
window.addEventListener('popstate',function(e){var d=(e.state&&e.state.lab)||0;var any=false;while(stack.length>d){var s=stack.pop();any=true;try{s.leave&&s.leave()}catch(x){console.warn(x)}}if(any)LAB.layer.changed()});
/* ---------- one level per pinch gesture (touch), or trackpad pinch (ctrl+wheel) ---------- */
var gcool=0;
function fire(fn,x,y){var n=Date.now();if(n<gcool||!fn)return;gcool=n+850;fn(x,y)}
LAB.pinch=function(el,o){
  var d0=0,done=false,cx=0,cy=0;
  function dist(t){var a=t[0],b=t[1];return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
  el.addEventListener('touchstart',function(e){if(e.touches.length===2){d0=dist(e.touches);done=false;cx=(e.touches[0].clientX+e.touches[1].clientX)/2;cy=(e.touches[0].clientY+e.touches[1].clientY)/2;if(e.cancelable)e.preventDefault();o.start&&o.start()}},{passive:false});
  el.addEventListener('touchmove',function(e){if(e.touches.length!==2||!d0)return;if(e.cancelable)e.preventDefault();if(done)return;var r=dist(e.touches)/d0;
    if(r>1.28){done=true;fire(o.in,cx,cy)}else if(r<0.78){done=true;fire(o.out,cx,cy)}e.stopPropagation()},{passive:false});
  el.addEventListener('touchend',function(e){if(e.touches.length<2)d0=0},{passive:true});
  var acc=0,cool=0;
  el.addEventListener('wheel',function(e){if(!e.ctrlKey)return;e.preventDefault();var now=Date.now();if(now<cool)return;acc+=e.deltaY;
    if(acc<-40){acc=0;cool=now+700;fire(o.in,e.clientX,e.clientY)}else if(acc>40){acc=0;cool=now+700;fire(o.out,e.clientX,e.clientY)}},{passive:false});
};
/* Safari: two fingers belong to the rooms, not page zoom */
['gesturestart','gesturechange','gestureend'].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});

/* ---------- the camera back ---------- */
var LV=['sheet','9-up','4-up','one','closer'];
LAB.cameraBack=function(list,idx,opt){
  opt=opt||{};
  var cb=LAB.el('div','cb'),lvl=3,sel=Math.max(0,Math.min(list.length-1,idx||0)),zoom={x:0,y:0},alive=true;
  cb.setAttribute('role','dialog');cb.setAttribute('aria-label','camera back: the photos on a camera screen');
  cb.innerHTML='<div class="cb-body"><div class="cb-scr" tabindex="0" aria-label="camera screen"></div>'+
   '<div class="cb-side"><div class="cb-dial" role="slider" aria-label="dial: turn to move one frame" tabindex="0"><div class="knurl"></div><div class="dot"></div><div class="set">SET</div></div>'+
   '<div class="cb-keys"><button type="button" class="cb-k" data-k="out" aria-label="zoom out toward the sheet">⊟</button><button type="button" class="cb-k" data-k="in" aria-label="zoom in">⊕</button>'+
   '<button type="button" class="cb-k h" data-k="h" aria-label="heart this photo">♡</button><button type="button" class="cb-k" data-k="x" aria-label="close the camera back">✕</button></div>'+
   '<div class="cb-name ju">photo lab</div></div></div>';
  document.body.appendChild(cb);
  var scr=cb.querySelector('.cb-scr'),dial=cb.querySelector('.cb-dial'),hk=cb.querySelector('[data-k=h]'),ang=0;
  function per(){return lvl===0?list.length:lvl===1?9:lvl===2?4:1}
  function render(){
    scr.innerHTML='';var n=per(),osd=LAB.el('div','cb-osd');
    if(lvl<3){
      var start=lvl===0?0:Math.floor(sel/n)*n,cols=lvl===0?Math.max(3,Math.ceil(Math.sqrt(list.length*1.5))):lvl===1?3:2,rows=lvl===0?Math.max(2,Math.ceil(list.length/cols)):Math.ceil(n/cols);
      var g=LAB.el('div','cb-grid');g.style.gridTemplateColumns='repeat('+cols+',1fr)';g.style.gridTemplateRows='repeat('+rows+',1fr)';
      for(var i=start;i<Math.min(list.length,start+n);i++){(function(i){var p=list[i],c=LAB.el('div','cb-cell'+(i===sel?' sel':'')+(LAB.hearts.has(p.id)?' h':''));
        c.dataset.i=i;var im=new Image();im.alt='';im.decoding='async';im.src=LAB.th(p);c.appendChild(im);g.appendChild(c)})(i)}
      scr.appendChild(g);
    }else{
      var o=LAB.el('div','cb-one'),p=list[sel];
      if(LAB.isClip(p)){var im=LAB.video(p,LAB.clip(p),{auto:true,preload:'metadata',label:'frame '+LAB.num(p)});if(lvl===4)im.style.transform='translate('+zoom.x+'px,'+zoom.y+'px) scale(2.4)';o.appendChild(im);scr.appendChild(o);LAB.arm(im)}
      else{var im=new Image();im.alt='photograph '+LAB.num(p);im.src=LAB.img(p);if(lvl===4)im.style.transform='translate('+zoom.x+'px,'+zoom.y+'px) scale(2.4)';o.appendChild(im);scr.appendChild(o)}
    }
    osd.innerHTML='<span>'+LAB.num(list[sel])+' / '+P.length+(LAB.hearts.has(list[sel].id)?' <span class="heart">♥</span>':'')+'</span><span class="lv">'+LV[lvl]+'</span>';
    scr.appendChild(osd);
    hk.textContent=LAB.hearts.has(list[sel].id)?'♥':'♡';hk.classList.toggle('on',LAB.hearts.has(list[sel].id));
    dial.setAttribute('aria-valuenow',sel+1);
    opt.onMove&&opt.onMove(sel);
  }
  function move(d){var s=Math.max(0,Math.min(list.length-1,sel+d));if(s===sel)return;sel=s;zoom={x:0,y:0};if(lvl===4)lvl=3;render()}
  function level(d){var l=lvl+d;if(l<0){close();return}if(l>4)return;lvl=l;zoom={x:0,y:0};render()}
  function close(){if(!alive)return;LAB.layer.back()}
  function teardown(){alive=false;cb.classList.remove('open');setTimeout(function(){cb.remove()},950);opt.onClose&&opt.onClose(sel)}
  cb.addEventListener('click',function(e){var k=e.target.closest('[data-k]');if(k){var v=k.dataset.k;if(v==='out')level(-1);else if(v==='in')level(1);else if(v==='h'){LAB.hearts.toggle(list[sel].id);render()}else if(v==='x')close();return}
    var c=e.target.closest('.cb-cell');if(c){var i=+c.dataset.i;if(i===sel)level(3-lvl);else{sel=i;render()}return}
    if(e.target===cb)close()});
  /* dial: drag round it; every 24° is one frame */
  var dd=null;
  function a(e){var r=dial.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI}
  dial.addEventListener('pointerdown',function(e){dd={a:a(e),acc:0};dial.setPointerCapture(e.pointerId);e.preventDefault()});
  dial.addEventListener('pointermove',function(e){if(!dd)return;var x=a(e),d=x-dd.a;if(d>180)d-=360;if(d<-180)d+=360;dd.a=x;dd.acc+=d;ang+=d;dial.style.transform='rotate('+ang+'deg)';
    while(dd.acc>=24){dd.acc-=24;move(1)}while(dd.acc<=-24){dd.acc+=24;move(-1)}});
  dial.addEventListener('pointerup',function(){dd=null});dial.addEventListener('pointercancel',function(){dd=null});
  /* wheel: one notch one frame; trackpad pinch (ctrl) = levels */
  var wacc=0;
  cb.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();wacc+=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;
    while(wacc>=50){wacc-=50;move(1);ang+=24}while(wacc<=-50){wacc+=50;move(-1);ang-=24}dial.style.transform='rotate('+ang+'deg)'},{passive:false});
  LAB.pinch(scr,{in:function(x,y){var c=document.elementFromPoint(x,y);c=c&&c.closest('.cb-cell');if(c){sel=+c.dataset.i}level(1)},out:function(){level(-1)}});
  /* swipe on one / drag to pan closer */
  var sw=null;
  scr.addEventListener('pointerdown',function(e){if(lvl<3)return;sw={x:e.clientX,y:e.clientY,zx:zoom.x,zy:zoom.y,t:Date.now(),m:false};scr.setPointerCapture(e.pointerId)});
  scr.addEventListener('pointermove',function(e){if(!sw)return;var dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.hypot(dx,dy)>8)sw.m=true;
    if(lvl===4){zoom.x=sw.zx+dx;zoom.y=sw.zy+dy;var im=scr.querySelector('.cb-one img, .cb-one video');if(im){im.style.transition='none';im.style.transform='translate('+zoom.x+'px,'+zoom.y+'px) scale(2.4)'}}});
  scr.addEventListener('pointerup',function(e){if(!sw)return;var dx=e.clientX-sw.x,m=sw.m;var im=scr.querySelector('.cb-one img, .cb-one video');if(im)im.style.transition='';
    if(lvl===3&&m&&Math.abs(dx)>40)move(dx<0?1:-1);else if(!m)level(lvl===3?1:-1);sw=null});
  scr.addEventListener('pointercancel',function(){sw=null});
  function key(e){if(!alive||LAB.layer.top()!=='camera back')return;var k=e.key;
    if(k==='ArrowRight'||k==='ArrowDown'){move(1);e.preventDefault()}else if(k==='ArrowLeft'||k==='ArrowUp'){move(-1);e.preventDefault()}
    else if(k==='+'||k==='='||k==='Enter'){level(1);e.preventDefault()}else if(k==='-'||k==='_'){level(-1);e.preventDefault()}
    else if(k==='h'||k==='H'){LAB.hearts.toggle(list[sel].id);render()}else if(k==='Escape'){level(-1);e.preventDefault();e.stopImmediatePropagation()}}
  document.addEventListener('keydown',key,true);
  render();void cb.offsetWidth;cb.classList.add('open');
  LAB.layer.push('camera back',function(){document.removeEventListener('keydown',key,true);teardown()});
  LAB.hint('turn the dial · pinch or ⊟ ⊕ for sheet, 9-up, 4-up, one, closer',4600);
  return {close:close};
};


/* ---------- room light (ambient/UI, remembered; photographs stay as they are) ---------- */
var AMB_KEY='gj-photo-lab-ambient';
function clampAmb(v){v=+v;if(!isFinite(v))v=1;return Math.max(.28,Math.min(1.3,v))}
function mixHex(hex,t){
  hex=String(hex||'#000').replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  var r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
  r=Math.round(Math.max(0,Math.min(255,r*t)));g=Math.round(Math.max(0,Math.min(255,g*t)));b=Math.round(Math.max(0,Math.min(255,b*t)));
  return 'rgb('+r+','+g+','+b+')';
}
LAB.ambient={
  get:function(){var v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--amb'));return clampAmb(isFinite(v)?v:1)},
  set:function(v,fromUser){
    v=clampAmb(v);
    var root=document.documentElement;
    root.style.setProperty('--amb',String(v));
    var cs=getComputedStyle(document.body);
    var bg=cs.getPropertyValue('--bg-base').trim()||'#04070b';
    var ink=cs.getPropertyValue('--ink-base').trim()||'#eef3f5';
    var dim=cs.getPropertyValue('--dim-base').trim()||'#c9d3d6';
    var mute=cs.getPropertyValue('--mute-base').trim()||'#8fa3aa';
    var mint=cs.getPropertyValue('--mint-base').trim()||'#55DAA1';
    /* Dark room colours scale with --amb. Text stays readable by not falling as far. */
    root.style.setProperty('--bg',mixHex(bg,v));
    root.style.setProperty('--ink',mixHex(ink,.42+.58*v));
    root.style.setProperty('--dim',mixHex(dim,.42+.58*v));
    root.style.setProperty('--mute',mixHex(mute,.42+.58*v));
    root.style.setProperty('--mint',mixHex(mint,.55+.45*v));
    var sl=document.getElementById('amb');
    if(sl&&document.activeElement!==sl)sl.value=String(Math.round(v*100));
    try{localStorage.setItem(AMB_KEY,String(Math.round(v*100)))}catch(e){}
  }
};
(function(){
  var start=100;try{var s=localStorage.getItem(AMB_KEY);if(s!=null&&isFinite(+s))start=+s}catch(e){}
  LAB.ambient.set(start/100);
  var sl=document.getElementById('amb');
  if(!sl)return;
  sl.value=String(Math.round(LAB.ambient.get()*100));
  sl.addEventListener('input',function(){LAB.ambient.set((+sl.value)/100,true)});
  sl.addEventListener('change',function(){LAB.ambient.set((+sl.value)/100,true);LAB.hint('room light — the room, not the photograph',2400)});
})();

/* ---------- safelight (one toggle, remembered on this device) ---------- */
var SAFE_KEY='gj-photo-lab-safelight';
LAB.safelight={
  on:function(){return document.body.classList.contains('safe')},
  set:function(on){
    document.body.classList.toggle('safe',!!on);
    var b=LAB.$('#safe')||document.getElementById('safe');
    if(b){b.classList.toggle('on',!!on);b.setAttribute('aria-pressed',!!on)}
    try{localStorage.setItem(SAFE_KEY,on?'1':'0')}catch(e){}
    if(LAB.ambient)LAB.ambient.set(LAB.ambient.get());
  }
};
(function(){
  var start=false;try{start=localStorage.getItem(SAFE_KEY)==='1'}catch(e){}
  LAB.safelight.set(start);
  var b=document.getElementById('safe');
  if(b)b.addEventListener('click',function(){LAB.safelight.set(!LAB.safelight.on());LAB.hint(LAB.safelight.on()?'safelight on — the room, not the photograph':'safelight off',2800)});
})();

})();
