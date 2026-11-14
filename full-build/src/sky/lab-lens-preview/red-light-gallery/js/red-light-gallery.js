/* Darkroom · prints hung on the walls. A quiet pill cycles salon, row, grid and pairs; never auto-advances.
   Tap a print to stand in front of it (free native scroll, like the original day view). Safelight is the room, not a grade on the photograph.
   Same motion with Reduce Motion on. */
(function(){
'use strict';
var P=LAB.photos,$=function(id){return document.getElementById(id)};
var room=$('room'),hangs=$('hangs'),inner=$('hangsInner'),wall=$('wall'),where=$('where'),arrangeB=$('arrange');
if(!room||!hangs||!inner)return;

var GROUPS=['salon','row','grid','pairs'];
var GROUP_KEY='gj-photo-lab-arrange';
var group='salon';
try{var _g=localStorage.getItem(GROUP_KEY);if(GROUPS.indexOf(_g)>=0)group=_g}catch(e){}
var wallStrip=null,wi=0,welcomed=false;

function photos(){return (LAB.clips&&LAB.clips.list)?LAB.clips.list():P.slice()}
function byId(id){var lists=[photos(),P,window.LAB_STILLS||[]];for(var k=0;k<lists.length;k++){for(var i=0;i<lists[k].length;i++)if(lists[k][i].id===id)return lists[k][i]}}

function syncArrange(){
  if(arrangeB){
    arrangeB.textContent=group;
    arrangeB.setAttribute('aria-label','wall grouping: '+group+' — tap to change');
  }
  document.querySelectorAll('[data-dbg=arrange]').forEach(function(b){b.textContent=group});
  document.body.setAttribute('data-arrange',group);
}
function setGroup(name,fromUser){
  if(GROUPS.indexOf(name)<0)return;
  group=name;
  try{localStorage.setItem(GROUP_KEY,group)}catch(e){}
  syncArrange();
  layout();
  if(fromUser)LAB.hint('grouping: '+group,2200);
}
function cycleGroup(fromUser){
  setGroup(GROUPS[(GROUPS.indexOf(group)+1)%GROUPS.length],fromUser);
}

var hangObs=null;
function watchHang(){
  if(hangObs){hangObs.disconnect();hangObs=null}
  if(typeof IntersectionObserver==='undefined'){inner.querySelectorAll('video').forEach(function(v){LAB.arm(v)});return}
  hangObs=new IntersectionObserver(function(ents){ents.forEach(function(en){if(en.isIntersecting)LAB.arm(en.target);else LAB.rest(en.target)})},{root:hangs,rootMargin:'80px',threshold:0.2});
  inner.querySelectorAll('video').forEach(function(v){hangObs.observe(v)});
}
function putMedia(el,p){
  if(LAB.isClip(p)&&!LAB.reduced()){
    el.appendChild(LAB.video(p,null,{lazy:true,preload:'none',poster:LAB.th(p),label:'print '+LAB.num(p)}));
  }else{
    var im=new Image();im.alt='photograph '+LAB.num(p);im.decoding='async';im.loading='lazy';im.src=LAB.th(p);
    el.appendChild(im);
    if(LAB.isClip(p)&&LAB.reduced()){
      var b=LAB.el('button','play-aff');b.type='button';b.setAttribute('aria-label','play');b.textContent='▶';
      b.addEventListener('click',function(e){
        e.stopPropagation();
        var v=LAB.video(p,LAB.clip(p),{auto:true,preload:'metadata',poster:LAB.th(p),label:'print '+LAB.num(p)});
        im.replaceWith(v);b.remove();LAB.arm(v);
      });
      el.appendChild(b);
    }
  }
}
function layout(){
  if(hangObs){hangObs.disconnect();hangObs=null}
  inner.querySelectorAll('video').forEach(function(v){LAB.rest(v)});
  inner.className='hangs-inner '+group;
  inner.innerHTML='';
  photos().forEach(function(p,i){
    var b=document.createElement('button');
    b.type='button';b.className='pr';b.dataset.i=String(i);b.dataset.id=p.id;
    b.setAttribute('aria-label','print '+LAB.num(p));
    var mat=LAB.el('span','pp');
    putMedia(mat,p);
    if(LAB.hearts&&LAB.hearts.has(p.id))mat.appendChild(LAB.el('span','hn','♥'));
    mat.appendChild(LAB.el('span','no',LAB.num(p)));
    b.appendChild(mat);
    b.addEventListener('click',function(){openWall(i)});
    inner.appendChild(b);
  });
  watchHang();
}
function scrollToIndex(i){
  var el=inner.children[i];
  if(el)el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
}

function jumpWall(to){
  var L=photos();
  var i=Math.max(0,Math.min(L.length-1,to==null?wi:to));
  wi=i;
  if(wallStrip)wallStrip.go(i,true,false);
  var el=$('wstrip'),pg=el&&el.children[i];
  if(el&&pg){
    if(el.classList.contains('x'))el.scrollLeft=pg.offsetLeft;
    else el.scrollTop=pg.offsetTop;
  }
}
function showW(){
  var L=photos();
  var target=Math.max(0,Math.min(L.length-1,wi));
  if(!wallStrip){
    wallStrip=LAB.mountStrip($('wstrip'),{
      list:photos,
      onChange:function(i){wi=i},
      onOut:function(){if(LAB.layer.top()==='wall')LAB.layer.back()},
      onIn:function(){camera()}
    });
  }
  wallStrip.fill();
  /* fill() layouts at index 0 and would otherwise overwrite wi through onChange */
  jumpWall(target);
}
function openWall(i){
  var L=photos();
  if(!L.length)return;
  var target=Math.max(0,Math.min(L.length-1,i|0));
  wi=target;
  wall.hidden=false;void wall.offsetWidth;
  showW();
  wall.classList.add('open');
  requestAnimationFrame(function(){requestAnimationFrame(function(){jumpWall(target)})});
  setTimeout(function(){jumpWall(target)},60);
  if(where)where.textContent='the wall';
  LAB.layer.push('wall',function(){
    wall.classList.remove('open');
    if(where)where.textContent='darkroom';
    if(wallStrip)wallStrip.resetZoom();
    setTimeout(function(){if(!wall.classList.contains('open'))wall.hidden=true},1000);
    scrollToIndex(wi);
  });
}

var wprev=$('wprev'),wnext=$('wnext'),wheart=$('wheart');
if(wprev)wprev.addEventListener('click',function(){if(wallStrip)wallStrip.key(-1)});
if(wnext)wnext.addEventListener('click',function(){if(wallStrip)wallStrip.key(1)});
if(wheart)wheart.addEventListener('click',function(){var p=photos()[wi];if(p){LAB.hearts.toggle(p.id);showW();layout()}});

function camera(){
  if(LAB.layer.top()==='camera back')return;
  var L=photos();
  var i=LAB.layer.top()==='wall'?wi:0;
  LAB.cameraBack(L,Math.max(0,i),{onMove:function(k){wi=k;if(LAB.layer.top()==='wall')showW()}});
}

function enter(p){
  if(LAB.sheet&&LAB.sheet.show)LAB.sheet.show(false);
  if(LAB.layer.top()!=='red-light-gallery'&&LAB.layer.top()!=='red light gallery'){
    if(LAB.layer.top()!=='red-light-gallery')LAB.layer.push('red-light-gallery',function(){if(LAB.sheet)LAB.sheet.show(true)});
  }
  if(!welcomed){
    welcomed=true;
    var h='prints on the wall · tap one to stand in front of it · the grouping pill changes how they hang';
    if(LAB.patience)LAB.patience.opening('red-light-gallery',h);
    if(!p)LAB.hint(h,5200);
  }
  if(p){
    var L=photos(),i=L.findIndex(function(q){return q.id===p.id});
    if(i>=0)openWall(i);
  }
}
function leave(){if(LAB.layer.top()==='red-light-gallery')LAB.layer.back()}
function show(){room.hidden=false;layout();size()}
function hide(){inner.querySelectorAll('video').forEach(function(v){LAB.rest(v)});if(LAB.layer.top()!=='wall'){var ws=$('wstrip');if(ws)ws.querySelectorAll('video').forEach(function(v){LAB.rest(v)})}room.hidden=true}
function size(){}
function focus(p){if(!p)return;var L=photos(),i=L.findIndex(function(q){return q.id===p.id});if(i>=0)scrollToIndex(i)}

if(arrangeB)arrangeB.addEventListener('click',function(){cycleGroup(true)});
document.addEventListener('lab:hearts',function(){if(LAB.layer.top()==='wall')showW();layout()});
document.addEventListener('lab:list',function(){layout();if(LAB.layer.top()==='wall')showW()});
document.addEventListener('lab:clips',function(){layout();if(LAB.layer.top()==='wall')showW()});
document.addEventListener('keydown',function(e){
  if(LAB.rooms&&LAB.rooms.current!=='red-light-gallery')return;
  var top=LAB.layer.top();
  if(top==='wall'){
    if(e.key==='Escape')LAB.layer.back();
    else if(e.key==='ArrowRight'||e.key==='ArrowDown'){if(wallStrip)wallStrip.key(1);e.preventDefault()}
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){if(wallStrip)wallStrip.key(-1);e.preventDefault()}
  }
});

LAB.redLightGallery={
  enter:enter,leave:leave,show:show,hide:hide,size:size,focus:focus,camera:camera,
  photo:function(id){return byId(id)},
  group:function(){return group},
  arrange:function(name,fromUser){if(name)setGroup(name,fromUser);else cycleGroup(fromUser);return group}
};
syncArrange();
})();
