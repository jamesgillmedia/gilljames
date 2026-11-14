/* Darkroom · tap the paper box (an enlarger flash, a sheet slides into the tray) → rock the tray until the print comes up →
 drag it up or tap hang → it pegs onto the line. Tap a print on the line → stand in front of it (the wall).
 Pinch out / ‹ / Esc rise one place: from the wall back to the room, from the room to the shared contact sheet.
 Pinch in on the wall for the camera back (the original pinch). Safelight is the room, not a grade on the photograph: prints keep their own colour.
 Hung prints stay on this device. Same motion with Reduce Motion on. */
(function(){
'use strict';
var P=LAB.photos,$=function(id){return document.getElementById(id)};
var room=$('room'),pegs=$('pegs'),line=$('line'),tray=$('tray'),sheetEl=$('traySheet'),simg=$('simg'),shine=$('shine'),box=$('box'),hang=$('hang'),
    wall=$('wall'),where=$('where');
if(!room||!pegs)return;
var LK='gj-photo-lab-line',hung=[];
try{var _all=P.concat(window.LAB_STILLS||[]);hung=(JSON.parse(localStorage.getItem(LK))||[]).filter(function(id){return _all.some(function(p){return p.id===id})})}catch(e){}
function save(){try{localStorage.setItem(LK,JSON.stringify(hung))}catch(e){}}
function byId(id){var lists=[(LAB.clips&&LAB.clips.list)?LAB.clips.list():P,P,window.LAB_STILLS||[]];for(var k=0;k<lists.length;k++){for(var i=0;i<lists[k].length;i++)if(lists[k][i].id===id)return lists[k][i]}}
function photos(){return (LAB.clips&&LAB.clips.list)?LAB.clips.list():P.slice();}
function nextP(){var list=photos(),prefer=pending;pending=null;if(prefer&&hung.indexOf(prefer.id)<0&&(!cur||cur.id!==prefer.id)&&list.some(function(q){return q.id===prefer.id}))return prefer;
  for(var i=0;i<list.length;i++)if(hung.indexOf(list[i].id)<0&&(!cur||cur.id!==list[i].id))return list[i];return null}
var cur=null,dev=0,done=false,pending=null,park=(function(){var d=document.createElement('div');d.id='dr-vidpark';d.hidden=true;d.setAttribute('aria-hidden','true');document.body.appendChild(d);return d})();

function mediaFor(p,role,full){
  if(LAB.isClip(p)&&role!=='tray'){
    var sel='video[data-dr="'+p.id+'-'+role+'"]';
    var v=park.querySelector(sel)||document.querySelector(sel);
    if(v){if(v.parentNode)v.parentNode.removeChild(v);return v}
    v=LAB.video(p,null,{lazy:true,preload:'none',poster:role==='wall'?LAB.img(p):LAB.th(p),label:'print '+LAB.num(p)});
    v.dataset.dr=p.id+'-'+role;return v;
  }
  var im=new Image();im.alt=role==='peg'?'':'print '+LAB.num(p);im.decoding='async';im.src=full?LAB.img(p):LAB.th(p);return im;
}
function armMedia(root,on){if(!root)return;var v=root.tagName==='VIDEO'?root:root.querySelector&&root.querySelector('video');if(!v)return;if(on)LAB.arm(v);else LAB.rest(v)}
function parkVideos(root){if(!root)return;(root.querySelectorAll?root:document).querySelectorAll('video').forEach(function(v){LAB.rest(v);park.appendChild(v)})}

/* ---------- the line ---------- */
var off=0;
function peg(p){var b=LAB.el('button','pr');b.type='button';b.dataset.id=p.id;b.setAttribute('aria-label','print '+LAB.num(p));
  var pp=LAB.el('span','pp');pp.appendChild(mediaFor(p,'peg',false));
  b.appendChild(pp);b.appendChild(LAB.el('span','no',LAB.num(p)));
  if(LAB.hearts.has(p.id))b.appendChild(LAB.el('span','hn','♥'));
  b.style.animationDelay=(-Math.random()*7).toFixed(2)+'s';return b}
function drawLine(){parkVideos(pegs);pegs.innerHTML='';hung.forEach(function(id){var p=byId(id);if(p)pegs.appendChild(peg(p))});$('empty').hidden=hung.length>0;$('left').textContent=photos().length-hung.filter(function(id){return photos().some(function(q){return q.id===id})}).length-(cur?1:0);clampOff();
  if(LAB.rooms&&LAB.rooms.current==='darkroom')pegs.querySelectorAll('video').forEach(function(v){LAB.arm(v)})}
function maxOff(){return Math.max(0,pegs.scrollWidth-line.clientWidth)}
function clampOff(){off=Math.max(0,Math.min(maxOff(),off));pegs.style.transform='translateX('+(-off)+'px)'}
var ld=null;
line.addEventListener('pointerdown',function(e){ld={x:e.clientX,o:off,m:false,t:e.target};try{line.setPointerCapture(e.pointerId)}catch(err){}pegs.classList.add('drag')});
line.addEventListener('pointermove',function(e){if(!ld)return;var dx=e.clientX-ld.x;if(Math.abs(dx)>6)ld.m=true;off=ld.o-dx;clampOff()});
line.addEventListener('pointerup',function(e){pegs.classList.remove('drag');if(ld&&!ld.m){var el=document.elementFromPoint(e.clientX,e.clientY),b=el&&el.closest('.pr');if(b)openWall(b.dataset.id)}ld=null});
line.addEventListener('pointercancel',function(){pegs.classList.remove('drag');ld=null});
line.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();off+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY);pegs.classList.add('drag');clampOff();clearTimeout(line._t);line._t=setTimeout(function(){pegs.classList.remove('drag')},120)},{passive:false});

/* ---------- the tray: a print comes up in density, in its own colour (no grayscale) ---------- */
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function paint(){var e=ease(Math.min(1,dev));if(e>=1){simg.style.filter='none';simg.style.opacity='1';return}
  var b=1+2.2*(1-e),c=.28+.72*e,o=.4+.6*e;
  simg.style.filter='brightness('+b.toFixed(3)+') contrast('+c.toFixed(3)+')';simg.style.opacity=o.toFixed(3)}
function fitSheet(){if(!cur)return;var w=tray.clientWidth-18-12-24,h=tray.clientHeight-18-12-24,a=cur.w/cur.h,iw=w,ih=w/a;if(ih>h){ih=h;iw=h*a}simg.style.width=Math.round(iw)+'px';simg.style.height=Math.round(ih)+'px'}
function feed(which){if(cur){LAB.hint(done?'this print is ready: drag it up to the line, or tap hang':'rock the tray: drag back and forth across it');return}
  var p=which||nextP();if(!p){LAB.hint('every sheet is on the line');return}
  if(hung.indexOf(p.id)>=0){focusHung(p.id);return}
  cur=p;dev=0;done=false;var bm=$('beam');bm.classList.remove('on');void bm.offsetWidth;bm.classList.add('on');
  setTimeout(function(){simg.src=LAB.img(p);simg.alt='print '+LAB.num(p)+', developing';simg.style.opacity='';fitSheet();paint();sheetEl.hidden=false;sheetEl.style.transform='';sheetEl.classList.remove('in');void sheetEl.offsetWidth;sheetEl.classList.add('in');
    box.classList.remove('ready');$('left').textContent=photos().length-hung.filter(function(id){return photos().some(function(p){return p.id===id})}).length-1;LAB.hint('rock the tray: drag back and forth across it until the print comes up',5200)},420)}
box.addEventListener('click',function(){feed()});
var td=null,raf=0,last=0;
function tick(t){raf=0;var dt=Math.min(.05,(t-(last||t))/1000);last=t;if(td&&td.down&&cur&&!done){grow(dt*.05)}if(td&&td.down)raf=requestAnimationFrame(tick)}
function grow(x){if(!cur||done)return;dev=Math.min(1,dev+x);paint();if(dev>=1){done=true;hang.hidden=false;LAB.hint('it\'s up. drag it to the line, or tap hang',5200)}}
tray.addEventListener('pointerdown',function(e){if(!cur){feed();return}td={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,down:true,up:0};try{tray.setPointerCapture(e.pointerId)}catch(err){}last=0;if(!raf)raf=requestAnimationFrame(tick)});
tray.addEventListener('pointermove',function(e){var r=tray.getBoundingClientRect();tray.style.setProperty('--sx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');tray.style.setProperty('--sy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
  if(!td||!td.down)return;var dx=e.clientX-td.lx,dy=e.clientY-td.ly;td.lx=e.clientX;td.ly=e.clientY;
  if(done){td.up=e.clientY-td.y;sheetEl.style.transform='translate(-50%,calc(-50% + '+Math.min(0,td.up)+'px)) rotate(-1deg)';return}
  var k=Math.hypot(dx,dy);grow(k/1500);
  tray.style.setProperty('--tilt',Math.max(-3,Math.min(3,(e.clientX-td.x)/40)).toFixed(2)+'deg');tray.style.setProperty('--wave',(50+(e.clientX-td.x)/4)+'%')});
function trayUp(){if(!td)return;td.down=false;tray.style.setProperty('--tilt','0deg');if(done){if(td.up<-60)hangIt();else sheetEl.style.transform=''}td=null}
tray.addEventListener('pointerup',trayUp);tray.addEventListener('pointercancel',trayUp);
hang.addEventListener('click',hangIt);
function hangIt(){if(!cur||!done)return;var p=cur,from=sheetEl.getBoundingClientRect();
  hung.push(p.id);save();cur=null;done=false;hang.hidden=true;sheetEl.hidden=true;drawLine();off=maxOff();clampOff();
  var b=pegs.lastElementChild;if(b)b.style.visibility='hidden';
  var fly=LAB.el('div','pr-fly');fly.innerHTML='<img alt="" src="'+LAB.th(p)+'">';
  Object.assign(fly.style,{position:'fixed',zIndex:44,left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',background:'#e4ddd2',padding:'5px',boxShadow:'0 20px 40px rgba(0,0,0,.6)',transition:'all 1.2s cubic-bezier(.22,.61,.36,1)'});
  fly.firstChild.style.cssText='width:100%;height:100%;object-fit:contain;display:block;filter:none';
  document.body.appendChild(fly);
  requestAnimationFrame(function(){requestAnimationFrame(function(){if(!b){fly.remove();return}var to=b.querySelector('.pp').getBoundingClientRect();Object.assign(fly.style,{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'})})});
  setTimeout(function(){if(b)b.style.visibility='';fly.remove();box.classList.toggle('ready',!!nextPeek())},1250);
  LAB.hint(hung.length===1?'pegged. tap it on the line to stand in front of it':'pegged · '+hung.length+' on the line',3600)}
function nextPeek(){var list=photos();for(var i=0;i<list.length;i++)if(hung.indexOf(list[i].id)<0&&(!cur||cur.id!==list[i].id))return list[i];return null}

/* ---------- the wall: hung prints in a free native scroll, like the original day view (no snap) ---------- */
var wi=-1, wallStrip=null;
function hungList(){return hung.map(byId).filter(Boolean)}
function showW(){
  if(!wallStrip){
    wallStrip=LAB.mountStrip($('wstrip'),{
      list:hungList,
      onChange:function(i,p){wi=i;var h=$('wheart');if(h&&p){h.textContent=LAB.hearts.has(p.id)?'♥':'♡';h.classList.toggle('on',LAB.hearts.has(p.id))}},
      onOut:function(){LAB.layer.back()},
      onIn:function(){camera()}
    });
  }
  wallStrip.fill();
  wallStrip.go(Math.max(0,wi),true,false);
  var p=hungList()[Math.max(0,wi)];
  if(p){$('wheart').textContent=LAB.hearts.has(p.id)?'♥':'♡';$('wheart').classList.toggle('on',LAB.hearts.has(p.id))}
}
function openWall(id){wi=hung.indexOf(id);if(wi<0)return;showW();wall.hidden=false;void wall.offsetWidth;wall.classList.add('open');where.textContent='darkroom · the wall';
  LAB.layer.push('wall',function(){wall.classList.remove('open');where.textContent='darkroom';if(wallStrip)wallStrip.resetZoom();setTimeout(function(){if(!wall.classList.contains('open'))wall.hidden=true},1000);var b=pegs.children[wi];if(b){off=Math.max(0,b.offsetLeft-line.clientWidth/2+b.offsetWidth/2);clampOff()}});}
function stepW(d){if(!hung.length||!wallStrip)return;wallStrip.key(d)}
$('wprev').addEventListener('click',function(){stepW(-1)});$('wnext').addEventListener('click',function(){stepW(1)});
$('wheart').addEventListener('click',function(){if(wi>=0&&hung[wi]){LAB.hearts.toggle(hung[wi]);showW();drawLine()}});

document.addEventListener('keydown',function(e){
  var top=LAB.layer.top();
  if(top==='camera back')return;
  if(top==='wall'){if(e.key==='ArrowRight')stepW(1);else if(e.key==='ArrowLeft')stepW(-1);else if(e.key==='Escape')LAB.layer.back();else if(e.key==='+'||e.key==='=')camera();return}
  if(top!=='darkroom')return;
  if(e.key===' '){e.preventDefault();if(!cur)feed();else if(!done){grow(.12);var s=(Math.random()<.5?-1:1)*2.4;tray.style.setProperty('--tilt',s+'deg');setTimeout(function(){tray.style.setProperty('--tilt','0deg')},300)}else hangIt()}
  else if(e.key==='Escape'){if(LAB.rooms)LAB.rooms.leave();else LAB.layer.back()}
});

LAB.pinch(room,{out:function(){if(LAB.rooms)LAB.rooms.leave();LAB.patience&&LAB.patience.success()},in:function(){LAB.patience&&LAB.patience.dead('pinch-in')}});
/* pinch-zoom and pinch-out-to-leave are handled by the wall strip */


function camera(){var top=LAB.layer.top();if(top==='camera back')return;
  if(top==='wall'){var list=hung.map(byId).filter(Boolean);LAB.cameraBack(list,Math.max(0,wi),{onMove:function(i){wi=i;showW()}})}
  else LAB.cameraBack(P,cur?P.indexOf(cur):(hung.length?P.indexOf(byId(hung[hung.length-1])):0))}

function focusHung(id){var i=hung.indexOf(id);if(i<0)return;var b=pegs.children[i];if(b){off=Math.max(0,b.offsetLeft-line.clientWidth/2+b.offsetWidth/2);clampOff()}}
function focus(p){if(!p)return;if(hung.indexOf(p.id)>=0)focusHung(p.id);else if(!cur)feed(p);else pending=p}

var welcomed=false;
function enter(p){
  if(LAB.layer.top()==='wall'||LAB.layer.top()==='camera back')return;
  if(LAB.sheet)LAB.sheet.show(false);
  if(p)focus(p);
  if(LAB.layer.top()==='darkroom')return;
  LAB.layer.push('darkroom',function(){if(LAB.sheet)LAB.sheet.show(true)});
  if(!welcomed){welcomed=true;var dh=hung.length?'your prints are still on the line. pinch out for the contact sheet · tap the paper box for the next sheet':'tap the paper box, then rock the tray · pinch out for the contact sheet';if(LAB.patience)LAB.patience.opening('darkroom',dh);LAB.hint(dh,5200)}
}
function leave(){if(LAB.layer.top()==='darkroom')LAB.layer.back()}
function size(){fitSheet();clampOff()}
function show(){room.hidden=false;pegs.querySelectorAll('video').forEach(function(v){LAB.arm(v)});size()}
function hide(){pegs.querySelectorAll('video').forEach(function(v){LAB.rest(v)});if(LAB.layer.top()!=='wall')parkVideos($('wstrip'));room.hidden=true}

LAB.darkroom={enter:enter,leave:leave,show:show,hide:hide,size:size,focus:focus,camera:camera,photo:function(id){return byId(id)}};

document.addEventListener('lab:hearts',function(){if(LAB.layer.top()==='wall')showW();drawLine()});
function onListChange(){drawLine();box.classList.toggle('ready',!!nextPeek());if(LAB.layer.top()==='wall')showW()}
document.addEventListener('lab:clips',onListChange);
document.addEventListener('lab:list',onListChange);
addEventListener('resize',function(){if(room.hidden)return;size()});
drawLine();box.classList.toggle('ready',!!nextPeek());
})();
