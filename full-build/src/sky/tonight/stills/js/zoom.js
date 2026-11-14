/* Infinite-zoom stills index: pinch, wheel, drag pan, semantic LOD, lazy thumbs, motion on drill-in. */
(function(){
'use strict';
var VP=document.getElementById('vp'), W=document.getElementById('world');
var CRUMB=document.getElementById('crumb'), CAP=document.getElementById('cap');
var CAP_T=document.getElementById('capTitle'), CAP_TC=document.getElementById('capTc');
var VID=document.getElementById('motion'), HINT=document.getElementById('hint');
var LV=document.getElementById('lvl'), OUT=document.getElementById('out');
var LABELS=document.getElementById('labels'), HERO=document.getElementById('hero');
if(!VP||!W)return;

var TOP=52, names=['Index','Stills','Frame'];
var s=1, tx=0, ty=0, minS=0.02, maxS=40, lod=-1, box={x:0,y:0,w:1,h:1};
var DATA=null, FILMS=[], CELLS=new Map(), packN=0;
var VIEW='films', MODE_KEY='gj-stills-zoom-view', ALL_EL=null, BYKEY={}, ALL_ORDER=[];
var VV=window.visualViewport;
function vsize(){return VV?{w:Math.round(VV.width),h:Math.round(VV.height)}:{w:innerWidth,h:innerHeight}}
var vw=vsize().w, vh=vsize().h;

function clampS(v){return Math.max(minS,Math.min(maxS,v))}
function clampT(){
  var ww=box.w*s, wh=box.h*s;
  // Allow over-pan so a still on the edge of the field can sit in the middle of the screen.
  var mx=Math.max(48,vw*0.5), my=Math.max(48,(vh-TOP)*0.5);
  if(ww<=vw)tx=(vw-ww)/2; else tx=Math.min(mx,Math.max(vw-ww-mx,tx));
  if(wh<=vh-TOP)ty=TOP+(vh-TOP-wh)/2; else ty=Math.min(TOP+my,Math.max(vh-wh-my,ty));
}
function view(){return{x:-tx/s,y:-ty/s,w:vw/s,h:vh/s}}
function fits(a,b,m){m=m||0;return a.x<b.x+b.w+m&&a.x+a.w>b.x-m&&a.y<b.y+b.h+m&&a.y+a.h>b.y-m}
function fitScale(r,pad){pad=pad==null?16:pad;return Math.min((vw-2*pad)/Math.max(1,r.w),(vh-TOP-2*pad)/Math.max(1,r.h))}

var raf=0, focus=null, motionOn=false, motionKey=null, loopT0=0, loopT1=0;
function apply(){
  clampT();
  W.style.transform='translate('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px) scale('+s.toFixed(5)+')';
  var L=levelOf();
  if(L!==lod){lod=L;W.setAttribute('data-lod',L);syncBodyClass();setLvl()}
  scaleLabels();
  if(!raf)raf=requestAnimationFrame(function(){raf=0;lazy();syncFocus();placeVideo()});
}
function typicalCellScreen(){
  if(focus&&focus.frame)return focus.frame.w*s;
  if(VIEW==='all'){
    var lay=allLayout();
    return lay?lay.cellW*s:0;
  }
  if(!FILMS.length)return 0;
  return FILMS[0].cellW*s;
}
function levelOf(){
  var cell=typicalCellScreen();
  if(cell>=Math.min(vw,vh)*0.58)return 2;
  if(cell>=40)return 1;
  return 0;
}
function setLvl(){
  var i=LV.querySelectorAll('i');
  for(var n=0;n<3;n++)i[n].className=n<=lod?'on':'';
  LV.querySelector('span').textContent=names[lod]||'';
}
function scaleLabels(){
  if(!LABELS)return;
  if(VIEW==='all'||lod>=2){LABELS.style.display='none';return}
  LABELS.style.display='block';
  FILMS.forEach(function(f){
    var el=f._float;if(!el)return;
    var left=tx+f.x*s, top=ty+f.y*s, w=f.w*s;
    var show=left<vw&&left+w>0&&top<vh&&top+48>TOP-8;
    el.style.display=show?'block':'none';
    if(!show)return;
    el.style.left=Math.max(8,left)+'px';
    el.style.top=Math.max(TOP+4,top)+'px';
    el.style.width=Math.max(40,w - Math.max(0,8-left))+'px';
    el.className='lab lod'+lod;
  });
}

function zoomAt(px,py,ns){ns=clampS(ns);tx=px-(px-tx)*(ns/s);ty=py-(py-ty)*(ns/s);s=ns}

var anim=null, inert=0;
function stopAnim(){if(anim){cancelAnimationFrame(anim.id);anim=null}if(inert){cancelAnimationFrame(inert);inert=0}}
function fly(cx,cy,ns,dur){
  stopAnim();ns=clampS(ns);
  var cy0=((vh+TOP)/2-ty)/s, cx0=(vw/2-tx)/s, s0=s, t0=performance.now();
  dur=dur==null?520:dur;
  function set(k){
    var ls=Math.log(s0)+(Math.log(ns)-Math.log(s0))*k;s=Math.exp(ls);
    var x=cx0+(cx-cx0)*k,y=cy0+(cy-cy0)*k;
    tx=vw/2-x*s;ty=(vh+TOP)/2-y*s;apply();
  }
  if(!dur){set(1);settle();return}
  anim=function(now){
    var k=Math.min(1,(now-t0)/dur);
    k=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
    set(k);
    if(k<1)anim.id=requestAnimationFrame(anim);else{anim=null;settle()}
  };
  anim.id=requestAnimationFrame(anim);
}
function flyRect(r,minScale,anchorTop){
  var ns=fitScale(r);if(minScale)ns=Math.max(ns,minScale);ns=clampS(ns);
  var cx=r.x+r.w/2, cy=r.y+r.h/2;
  var hh=((vh-TOP)/2-16)/ns;
  if(anchorTop||r.h>2*hh)cy=r.y+Math.min(r.h/2,hh);
  fly(cx,cy,ns);
}
function prefetchFilm(film){if(!film||film._pf)return;film._pf=1;film.frames.forEach(function(fr){var im=new Image();im.src=fr.t320})}
function flyFilm(film){
  prefetchFilm(film);
  var minScale=72/Math.max(8,film.cellW);
  flyRect({x:film.x,y:film.y,w:film.w,h:film.h},minScale,true);
}
function home(){fly(box.w/2,box.h/2,minS,640)}

var st=0;
function moving(){clearTimeout(st);st=setTimeout(function(){if(!ptr.size&&!anim&&!inert)settle()},200)}
function settle(){clearTimeout(st);lazy();syncFocus();maybeMotion();placeVideo()}

var ptr=new Map(), g=null, moved=0, sup=false, vel={x:0,y:0,t:0};
function mid(){var a=[...ptr.values()];return{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1}}
function startG(){if(ptr.size>=2){var m=mid();g={k:2,m:m,s:s,tx:tx,ty:ty}}else if(ptr.size===1){var p=[...ptr.values()][0];g={k:1,x:p.x,y:p.y,tx:tx,ty:ty}}else g=null}
VP.addEventListener('pointerdown',function(e){
  if(e.button>0)return;hintOff();stopAnim();
  ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptr.size===1){moved=0;sup=false}startG();vel={x:0,y:0,t:performance.now()};
});
VP.addEventListener('pointermove',function(e){
  if(!ptr.has(e.pointerId))return;
  var p=ptr.get(e.pointerId),ox=p.x,oy=p.y;p.x=e.clientX;p.y=e.clientY;
  if(!g)return;
  if(g.k===2&&ptr.size>=2){
    var m=mid(),ns=clampS(g.s*m.d/g.m.d);
    var wx=(g.m.x-g.tx)/g.s,wy=(g.m.y-g.ty)/g.s;
    s=ns;tx=m.x-wx*ns;ty=m.y-wy*ns;moved=99;
  }else if(g.k===1){
    var dx=p.x-g.x,dy=p.y-g.y;moved=Math.max(moved,Math.hypot(dx,dy));
    tx=g.tx+dx;ty=g.ty+dy;
    var now=performance.now(),dt=Math.max(1,now-vel.t);
    vel={x:.8*(p.x-ox)/dt+.2*vel.x,y:.8*(p.y-oy)/dt+.2*vel.y,t:now};
  }
  if(moved>6){sup=true;if(!VP.hasPointerCapture(e.pointerId)){try{VP.setPointerCapture(e.pointerId)}catch(_){}}VP.classList.add('drag');moving();apply()}
});
function up(e){
  if(!ptr.has(e.pointerId))return;
  var wasPan=g&&g.k===1;ptr.delete(e.pointerId);VP.classList.remove('drag');
  if(ptr.size){startG();return}
  g=null;
  if(wasPan&&sup&&performance.now()-vel.t<60){
    var vx=vel.x*16,vy=vel.y*16;
    var step=function(){vx*=.92;vy*=.92;tx+=vx;ty+=vy;apply();if(Math.abs(vx)+Math.abs(vy)>.4)inert=requestAnimationFrame(step);else{inert=0;settle()}};
    inert=requestAnimationFrame(step);
  }else moving();
}
VP.addEventListener('pointerup',up);VP.addEventListener('pointercancel',up);

var gs0=1;
['gesturestart','gesturechange','gestureend'].forEach(function(n){
  document.addEventListener(n,function(e){
    e.preventDefault();
    if(ptr.size)return;
    if(n==='gesturestart'){gs0=s;stopAnim()}
    else if(n==='gesturechange'){zoomAt(e.clientX||vw/2,e.clientY||vh/2,gs0*e.scale);moving();apply()}
  },{passive:false});
});

VP.addEventListener('wheel',function(e){
  e.preventDefault();hintOff();stopAnim();
  var dy=e.deltaY*(e.deltaMode===1?33:e.deltaMode===2?vh:1);
  var dx=e.deltaX*(e.deltaMode===1?33:1);
  var mouse=e.deltaMode!==0||(dx===0&&Math.abs(dy)>=40&&Number.isInteger(dy));
  if(e.ctrlKey){zoomAt(e.clientX,e.clientY,s*Math.exp(-dy*0.012))}
  else if(mouse){zoomAt(e.clientX,e.clientY,s*Math.exp(-Math.sign(dy)*Math.min(Math.abs(dy),240)*0.0022))}
  else{tx-=dx;ty-=dy}
  moving();apply();
},{passive:false});

var lastTap={t:0,x:0,y:0}, pend=0;
VP.addEventListener('click',function(e){
  if(sup){e.preventDefault();e.stopPropagation();sup=false;return}
  var now=performance.now(),x=e.clientX,y=e.clientY;
  if(e.target.closest&&e.target.closest('button')){lastTap.t=0;return}
  if(now-lastTap.t<320&&Math.hypot(x-lastTap.x,y-lastTap.y)<40){
    clearTimeout(pend);lastTap.t=0;
    var ns=clampS(s*(e.shiftKey?1/2.5:2.5));
    var cx=(x-tx)/s,cy=(y-ty)/s;
    fly(cx+(vw/2-x)/ns, cy+((vh+TOP)/2-y)/ns, ns, 400);
    return;
  }
  lastTap={t:now,x:x,y:y};
  var cell=e.target.closest&&e.target.closest('.cell');
  var cl=e.target.closest&&e.target.closest('.cluster');
  clearTimeout(pend);
  pend=setTimeout(function(){
    if(cell){
      var key=cell.getAttribute('data-key');
      var info=CELLS.get(key);
      if(!info)return;
      var r={x:info.frame.x,y:info.frame.y,w:info.frame.w,h:info.frame.h};
      var target=fitScale(r,20);
      if(s>=target*0.88){startMotion(info.film,info.frame);return}
      flyRect(r);
      return;
    }
    if(cl){
      var film=filmBySlug(cl.getAttribute('data-slug'));if(!film)return;
      flyFilm(film);
      return;
    }
    if(VIEW==='all'&&e.target.closest&&e.target.closest('.allfield')){
      var wx=(x-tx)/s, wy=(y-ty)/s;
      var lay=allLayout();if(!lay)return;
      var c=Math.floor((wx-lay.x)/(lay.cellW+lay.gap));
      var r=Math.floor((wy-lay.y)/(lay.cellH+lay.gap));
      if(c<0||r<0||c>=lay.cols||r>=lay.rows)return;
      var i=r*lay.cols+c;if(i>=ALL_ORDER.length)return;
      var info=BYKEY[ALL_ORDER[i]];if(!info)return;
      var rct={x:info.frame.x,y:info.frame.y,w:info.frame.w,h:info.frame.h};
      var target=fitScale(rct,20);
      if(s>=target*0.88){startMotion(info.film,info.frame);return}
      flyRect(rct);
    }
  },280);
},true);

document.addEventListener('keydown',function(e){
  if(e.target.closest&&e.target.closest('input,textarea'))return;
  var k=e.key,c=[vw/2,(vh+TOP)/2];
  if(k==='+'||k==='='){fly((c[0]-tx)/s,(c[1]-ty)/s,s*1.8,300)}
  else if(k==='-'||k==='_'){stepOut()}
  else if(k==='0'||k==='Escape'){stopMotion();home()}
  else if(k===' '||k==='Enter'){if(focus){startMotion(focus.film,focus.frame);e.preventDefault()}}
  else if(k.indexOf('Arrow')===0){
    var d=120;tx+=k==='ArrowLeft'?d:k==='ArrowRight'?-d:0;ty+=k==='ArrowUp'?d:k==='ArrowDown'?-d:0;
    moving();apply();e.preventDefault();
  }else return;
  e.preventDefault();
});

OUT.addEventListener('click',function(e){e.preventDefault();stepOut()});
function stepOut(){
  if(motionOn){
    stopMotion();
    if(focus){flyRect({x:focus.frame.x,y:focus.frame.y,w:focus.frame.w,h:focus.frame.h});return}
  }
  if(lod>=2&&focus){
    if(VIEW==='all'){fly(focus.frame.x+focus.frame.w/2,focus.frame.y+focus.frame.h/2,80/Math.max(8,focus.frame.w));return}
    flyFilm(focus.film);return
  }
  if(lod>=1&&focus){home();return}
  home();
}
function hintOff(){if(HINT&&!HINT.classList.contains('off'))HINT.classList.add('off')}
setTimeout(hintOff,8000);

function filmBySlug(slug){for(var i=0;i<FILMS.length;i++)if(FILMS[i].slug===slug)return FILMS[i];return null}
function keyOf(film,frame){return film.slug+'/'+frame.id}

function choosePack(){
  if(vw<640)return'2';
  if(vh<500)return'5';
  if(vw<1100)return'3';
  if(vw<1600)return'4';
  return'5';
}

function allLayout(){return DATA&&DATA.all&&DATA.all.layouts?DATA.all.layouts[packN]||null:null}

function packFilms(){
  if(!DATA)return;   /* a resize can land before the index has loaded; it packs again on load */
  var lay=(DATA.layouts&&DATA.layouts[packN])||null;
  if(!lay){console.warn('missing layout',packN);return}
  box={x:0,y:0,w:lay.w,h:lay.h};
  var by={};
  lay.films.forEach(function(lf){by[lf.slug]=lf});
  FILMS.forEach(function(film){
    var lf=by[film.slug];if(!lf)return;
    film.x=lf.x;film.y=lf.y;film.w=lf.w;film.h=lf.h;
    film.labelH=lf.labelH;film.cols=lf.cols;film.rows=lf.rows;
    film.cellW=lf.cellW;film.cellH=lf.cellH;film.gap=lf.gap;
    film.frames.forEach(function(fr,i){
      var r=Math.floor(i/lf.cols), c=i%lf.cols;
      fr.x=lf.x+c*(lf.cellW+lf.gap);
      fr.y=lf.y+lf.labelH+r*(lf.cellH+lf.gap);
      fr.w=lf.cellW;fr.h=lf.cellH;
    });
  });
}

function packAll(){
  var lay=allLayout();
  if(!lay){console.warn('missing all layout',packN);return}
  box={x:0,y:0,w:lay.w,h:lay.h};
  var x0=lay.x, y0=lay.y, cw=lay.cellW, ch=lay.cellH, gap=lay.gap, cols=lay.cols;
  ALL_ORDER.forEach(function(key,i){
    var info=BYKEY[key];if(!info)return;
    var r=Math.floor(i/cols), c=i%cols;
    var fr=info.frame;
    fr.x=x0+c*(cw+gap);fr.y=y0+r*(ch+gap);fr.w=cw;fr.h=ch;
  });
}

function pack(){
  packN=choosePack();
  if(VIEW==='all')packAll();else packFilms();
}

function cellSize(){
  if(VIEW==='all'){var lay=allLayout();return lay?lay.cellW:80}
  return FILMS[0]?FILMS[0].cellW:80;
}
function syncBodyClass(){
  document.body.className='lod'+(lod<0?0:lod)+' view-'+VIEW;
  W.setAttribute('data-view',VIEW);
}
function syncModeUI(){
  var box=document.getElementById('mode');if(!box)return;
  [].forEach.call(box.querySelectorAll('button'),function(b){
    b.setAttribute('aria-pressed', b.getAttribute('data-view')===VIEW?'true':'false');
  });
}
function findFrame(slug,id){
  var f=filmBySlug(slug);if(!f)return null;
  var fr=f.frames.find(function(x){return x.id===id});
  return fr?{film:f,frame:fr}:null;
}

function buildFilms(){
  FILMS.forEach(function(film){
    var el=document.createElement('div');
    el.className='cluster';el.setAttribute('data-slug',film.slug);
    el.style.left=film.x+'px';el.style.top=film.y+'px';
    el.style.width=film.w+'px';el.style.height=film.h+'px';
    var lab=document.createElement('div');lab.className='label';
    lab.style.height=film.labelH+'px';lab.style.visibility='hidden';
    el.appendChild(lab);film._label=lab;
    var fl=document.createElement('div');fl.className='lab';LABELS.appendChild(fl);film._float=fl;
    fl.textContent=film.short||film.title;
    var mos=document.createElement('div');mos.className='mosaic';
    mos.style.left='0';mos.style.top=film.labelH+'px';
    mos.style.width=film.w+'px';mos.style.height=(film.h-film.labelH)+'px';
    var mi=document.createElement('img');mi.alt='';mi.decoding='async';
    mi.src='media/mosaics/p'+packN+'/'+film.slug+'.webp';
    mos.appendChild(mi);
    el.appendChild(mos);
    film._el=el;film._mosaic=mos;film._mosaicImg=mi;
    W.appendChild(el);
  });
}

function buildAll(){
  var lay=allLayout();if(!lay)return;
  var el=document.createElement('div');
  el.className='allfield';
  el.style.left=lay.x+'px';el.style.top=lay.y+'px';
  el.style.width=lay.gridW+'px';el.style.height=lay.gridH+'px';
  var mos=document.createElement('div');mos.className='mosaic';
  var mi=document.createElement('img');mi.alt='';mi.decoding='async';
  mi.src=lay.mosaic;
  mos.appendChild(mi);el.appendChild(mos);
  W.appendChild(el);
  ALL_EL=el;el._mosaic=mos;
}

function build(){
  W.innerHTML='';CELLS.clear();ALL_EL=null;
  if(LABELS)LABELS.innerHTML='';
  FILMS.forEach(function(f){f._float=null;f._el=null;f._mosaic=null});
  pack();
  W.style.width=box.w+'px';W.style.height=box.h+'px';
  if(VIEW==='all')buildAll();else buildFilms();
  minS=Math.min(vw/box.w,(vh-TOP)/box.h)*0.98;
  var typW=cellSize(), typH=typW*9/16;
  if(VIEW==='all'){var lay=allLayout();if(lay){typW=lay.cellW;typH=lay.cellH}}
  else if(FILMS[0]&&FILMS[0].frames[0]){typW=FILMS[0].frames[0].w;typH=FILMS[0].frames[0].h}
  // High enough that a push past a fitted still can reach the motion threshold on a tall phone.
  maxS=Math.max(8,1.1*Math.max(vw/Math.max(8,typW),(vh-TOP)/Math.max(8,typH)));
  syncBodyClass();syncModeUI();
}


function ensureCell(film,frame){
  var k=keyOf(film,frame);if(CELLS.has(k))return CELLS.get(k);
  var d=document.createElement('div');d.className='cell';d.setAttribute('data-key',k);
  var parent, ox, oy;
  if(VIEW==='all'&&ALL_EL){
    var lay=allLayout();
    parent=ALL_EL;ox=lay?lay.x:0;oy=lay?lay.y:0;
  }else{
    parent=film._el;ox=film.x;oy=film.y;
  }
  if(!parent)return {film:film,frame:frame,el:null,img:null,src:''};
  d.style.left=(frame.x-ox)+'px';d.style.top=(frame.y-oy)+'px';
  d.style.width=frame.w+'px';d.style.height=frame.h+'px';
  parent.appendChild(d);
  var info={film:film,frame:frame,el:d,img:null,src:''};
  CELLS.set(k,info);return info;
}

var DPR=Math.min(2.5,window.devicePixelRatio||1);
function loadCell(film,frame,cellPx){
  if(!film||!frame)return;
  var info=ensureCell(film,frame);if(!info.el)return;
  var want=cellPx*DPR>700?frame.t960:cellPx*DPR>220?frame.t320:frame.t96;
  if(info.src===want)return;
  if(!info.img){
    var im=document.createElement('img');im.alt='';im.decoding='async';im.style.opacity='0';
    im.onload=function(){im.style.opacity='1'};
    info.el.appendChild(im);info.img=im;
  }
  info.src=want;info.img.style.opacity='0';info.img.src=want;
}

function lazyAll(){
  var lay=allLayout();if(!lay)return;
  var v=view(), margin=Math.max(v.w,v.h)*0.35;
  var cellPx=lay.cellW*s;
  if(ALL_EL&&ALL_EL._mosaic)ALL_EL._mosaic.style.opacity=cellPx>=160?'0':'1';
  if(cellPx<32)return;
  var x0=lay.x, y0=lay.y, cw=lay.cellW+lay.gap, ch=lay.cellH+lay.gap, cols=lay.cols;
  var c0=Math.max(0,Math.floor((v.x-margin-x0)/cw));
  var c1=Math.min(cols-1,Math.ceil((v.x+v.w+margin-x0)/cw));
  var r0=Math.max(0,Math.floor((v.y-margin-y0)/ch));
  var r1=Math.min(lay.rows-1,Math.ceil((v.y+v.h+margin-y0)/ch));
  for(var r=r0;r<=r1;r++){
    for(var c=c0;c<=c1;c++){
      var i=r*cols+c;if(i<0||i>=ALL_ORDER.length)continue;
      var info=BYKEY[ALL_ORDER[i]];if(info)loadCell(info.film,info.frame,cellPx);
    }
  }
}

function lazy(){
  if(!FILMS.length)return;
  if(VIEW==='all'){lazyAll();return}
  var v=view(), margin=Math.max(v.w,v.h)*0.35;
  var cx=v.x+v.w/2, cy=v.y+v.h/2;
  var order=FILMS.map(function(film,i){
    var dx=film.x+film.w/2-cx, dy=film.y+film.h/2-cy;
    return{film:film,d:dx*dx+dy*dy};
  }).sort(function(a,b){return a.d-b.d});
  order.forEach(function(item){
    var film=item.film;
    var fr={x:film.x,y:film.y,w:film.w,h:film.h};
    var on=fits(fr,v,margin);
    var cellPx=film.cellW*s;
    var wantCells=on&&cellPx>=32;
    // Keep the mosaic under the thumbs so empty cells never flash. Fade it only when thumbs are clearly sharp.
    if(film._mosaic)film._mosaic.style.opacity=cellPx>=160?'0':'1';
    if(!wantCells)return;
    for(var i=0;i<film.frames.length;i++){
      var frame=film.frames[i];
      if(!fits(frame,v,margin))continue;
      loadCell(film,frame,cellPx);
    }
  });
}

function nearestFrame(){
  var cx=(vw/2-tx)/s, cy=((vh+TOP)/2-ty)/s;
  if(VIEW==='all'){
    var lay=allLayout();if(!lay)return null;
    var c=Math.round((cx-lay.x)/(lay.cellW+lay.gap));
    var r=Math.round((cy-lay.y)/(lay.cellH+lay.gap));
    c=Math.max(0,Math.min(lay.cols-1,c));
    r=Math.max(0,Math.min(lay.rows-1,r));
    var i=r*lay.cols+c;
    if(i>=ALL_ORDER.length)i=ALL_ORDER.length-1;
    return BYKEY[ALL_ORDER[i]]||null;
  }
  var best=null,bd=1e18,bestFilm=null;
  for(var i=0;i<FILMS.length;i++){
    var film=FILMS[i];
    if(cx<film.x-40||cx>film.x+film.w+40||cy<film.y-40||cy>film.y+film.h+40)continue;
    for(var j=0;j<film.frames.length;j++){
      var fr=film.frames[j];
      var dx=fr.x+fr.w/2-cx, dy=fr.y+fr.h/2-cy;
      var d=dx*dx+dy*dy;
      if(d<bd){bd=d;best=fr;bestFilm=film}
    }
  }
  if(!best)return null;
  return{film:bestFilm,frame:best};
}

function syncFocus(){
  if(focus&&focus.el)focus.el.classList.remove('on');
  var n=nearestFrame();
  focus=n;
  if(n){
    var info=CELLS.get(keyOf(n.film,n.frame));
    if(info){info.el.classList.add('on');focus.el=info.el}
    var cellPx=n.frame.w*s;
    if(cellPx>=Math.min(vw,vh)*0.42){
      CAP.hidden=false;CAP_T.textContent=n.film.title;CAP_TC.textContent=n.frame.tc;
      CRUMB.textContent=n.film.title;
      if(n.frame.t960){var pre=new Image();pre.src=n.frame.t960}
    }else if(lod>=1){
      CAP.hidden=true;CRUMB.textContent=n.film.title;
    }else{
      CAP.hidden=true;CRUMB.textContent=VIEW==='all'?'all':'stills';
    }
  }else{CAP.hidden=true;CRUMB.textContent=VIEW==='all'?'all':'stills'}
}

function maybeMotion(){
  if(!focus){if(motionOn&&lod<2)stopMotion();return}
  var fill=Math.min((focus.frame.w*s)/vw,(focus.frame.h*s)/(vh-TOP));
  if(fill>=0.72){startMotion(focus.film,focus.frame)}
  else if(fill<0.55){stopMotion()}
}

function startMotion(film,frame){
  if(!film||!frame||!film.proxy)return;
  var key=keyOf(film,frame);
  if(motionOn&&motionKey===key)return;
  motionKey=key;motionOn=true;
  var src=film.proxy;
  var start=Math.max(0,frame.t);
  var dur=film.duration||0;
  loopT0=start;
  loopT1=dur?Math.min(dur-0.05,start+8):start+8;
  if(loopT1<=loopT0+0.4){loopT0=Math.max(0,(dur||start)-8);loopT1=dur||(start+8)}
  function seekTo(){
    try{if(Math.abs((VID.currentTime||0)-start)>0.08)VID.currentTime=start}catch(_){}
  }
  function reveal(){
    if(!motionOn||motionKey!==key)return;
    if(Math.abs((VID.currentTime||0)-start)>1){seekTo();return}
    placeVideo();
    VID.classList.add('show');
    var p=VID.play();if(p&&p.catch)p.catch(function(){});
  }
  VID.onerror=function(){VID.classList.remove('show')};
  VID.onseeked=reveal;
  VID.onloadedmetadata=seekTo;
  placeVideo();
  if(VID.getAttribute('data-src')!==src){
    VID.classList.remove('show');
    VID.src=src;VID.setAttribute('data-src',src);
    VID.load();
  }else{
    seekTo();
    if(VID.readyState>=2&&Math.abs((VID.currentTime||0)-start)<=0.12)reveal();
  }
}
function stopMotion(){
  if(!motionOn&&!VID.classList.contains('show'))return;
  motionOn=false;motionKey=null;
  try{VID.pause()}catch(_){}
  VID.classList.remove('show');
}
function heroReady(){
  if(!HERO||!HERO.complete||!HERO.naturalWidth)return false;
  document.body.classList.add('has-hero');
  return true;
}
function placeHero(){
  if(!HERO||!focus||lod<2){
    if(HERO)HERO.classList.remove('show');
    document.body.classList.remove('has-hero');
    return;
  }
  var fr=focus.frame;
  var src=fr.t960||fr.t320;
  if(HERO.getAttribute('data-src')!==src){HERO.src=src;HERO.setAttribute('data-src',src)}
  HERO.style.left=(tx+fr.x*s)+'px';
  HERO.style.top=(ty+fr.y*s)+'px';
  HERO.style.width=(fr.w*s)+'px';
  HERO.style.height=(fr.h*s)+'px';
  HERO.classList.add('show');
  if(!heroReady())HERO.onload=function(){if(lod>=2)heroReady()};
}
function placeVideo(){
  placeHero();
  if(!motionOn||!focus)return;
  var fr=focus.frame;
  VID.style.left=(tx+fr.x*s)+'px';
  VID.style.top=(ty+fr.y*s)+'px';
  VID.style.width=(fr.w*s)+'px';
  VID.style.height=(fr.h*s)+'px';
}
VID.addEventListener('timeupdate',function(){
  if(!motionOn)return;
  if(VID.currentTime>=loopT1-0.04){try{VID.currentTime=loopT0}catch(_){}}
});

var rz=0;
function onRz(){
  clearTimeout(rz);
  rz=setTimeout(function(){
    var vz=vsize();
    var keep=focus?{slug:focus.film.slug,id:focus.frame.id,s:s}:null;
    vw=vz.w;vh=vz.h;
    var next=choosePack();
    var needBuild=next!==packN;
    if(needBuild){
      build();
      s=minS;tx=(vw-box.w*s)/2;ty=TOP+((vh-TOP)-box.h*s)/2;apply();
      if(keep){
        if(VIEW==='films'){var f=filmBySlug(keep.slug);if(f)setTimeout(function(){flyFilm(f)},40)}
        else setTimeout(function(){var hit=findFrame(keep.slug,keep.id);if(hit)flyRect({x:hit.frame.x,y:hit.frame.y,w:hit.frame.w,h:hit.frame.h})},40);
      }
    }else{
      minS=Math.min(vw/box.w,(vh-TOP)/box.h)*0.98;
      var typ=cellSize();
      maxS=Math.max(8,(Math.min(vw,vh-TOP)/Math.max(8,typ))*2.4);
      s=clampS(s);apply();
    }
  },120);
}
addEventListener('resize',onRz);if(VV)VV.addEventListener('resize',onRz);

function readSavedView(){
  try{var v=localStorage.getItem(MODE_KEY);if(v==='all'||v==='films')return v}catch(e){}
  return 'films';
}
function saveView(){try{localStorage.setItem(MODE_KEY,VIEW)}catch(e){}}

function setView(next,opts){
  opts=opts||{};
  if(next!=='all'&&next!=='films')next='films';
  if(next===VIEW&&!opts.force)return;
  var keep=focus?{slug:focus.film.slug,id:focus.frame.id,cellPx:focus.frame.w*s,lod:lod}:null;
  var movingAlready=lod>0&&keep;
  stopMotion();
  VIEW=next;saveView();
  function clearFade(){W.style.opacity='';W.style.transition=''}
  function placeHome(){s=minS;tx=(vw-box.w*s)/2;ty=TOP+((vh-TOP)-box.h*s)/2;apply();settle()}
  function go(){
    build();
    clearFade();
    if(opts.instant||!movingAlready){placeHome();return}
    var hit=findFrame(keep.slug,keep.id);
    if(!hit){placeHome();return}
    // Same still, similar size; ease in from a slightly wider view so the rearrange is not a cut.
    var ns=clampS(keep.cellPx/Math.max(8,hit.frame.w));
    var startS=clampS(Math.max(minS,ns*0.55));
    s=startS;tx=vw/2-(hit.frame.x+hit.frame.w/2)*s;ty=(vh+TOP)/2-(hit.frame.y+hit.frame.h/2)*s;apply();
    fly(hit.frame.x+hit.frame.w/2,hit.frame.y+hit.frame.h/2,ns,560);
  }
  if(opts.instant){go();return}
  W.style.transition='opacity .28s ease';
  W.style.opacity='0.18';
  setTimeout(go,180);
}

function boot(){
  var vz=vsize();vw=vz.w;vh=vz.h;
  VIEW=readSavedView();
  build();
  s=minS;tx=(vw-box.w*s)/2;ty=TOP+((vh-TOP)-box.h*s)/2;
  apply();settle();
}

function indexFrames(){
  BYKEY={};ALL_ORDER=(DATA.all&&DATA.all.order)||[];
  FILMS.forEach(function(f){
    if(f.proxy)f.hasProxy=true;
    f.frames.forEach(function(fr){BYKEY[f.slug+'/'+fr.id]={film:f,frame:fr}});
  });
}

var MODE=document.getElementById('mode');
if(MODE)MODE.addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  e.preventDefault();e.stopPropagation();
  setView(b.getAttribute('data-view'));
});

fetch('data/index.json').then(function(r){return r.json()}).then(function(d){
  DATA=d;FILMS=d.films||[];
  indexFrames();
  boot();
}).catch(function(err){
  CRUMB.textContent='could not load stills';
  console.error(err);
});

window.__zoom={
  get:function(){return{s:s,tx:tx,ty:ty,lod:lod,box:box,pack:packN,view:VIEW,
    focus:focus&&{slug:focus.film.slug,id:focus.frame.id,t:focus.frame.t},motion:motionOn}},
  fly:fly,flyRect:flyRect,flyFilm:function(slug){var f=filmBySlug(slug);if(f)flyFilm(f)},
  home:home,stepOut:stepOut,setView:setView,
  fitFilm:function(slug){var f=filmBySlug(slug);if(f)flyFilm(f)},
  fitFrame:function(slug,id){
    var hit=findFrame(slug,id);if(!hit)return;
    flyRect({x:hit.frame.x,y:hit.frame.y,w:hit.frame.w,h:hit.frame.h});
  },
  startMotion:function(slug,id){
    var f=filmBySlug(slug);if(!f)return;
    var fr=f.frames.find(function(x){return x.id===id})||f.frames[Math.floor(f.frames.length/2)];
    flyRect({x:fr.x,y:fr.y,w:fr.w,h:fr.h});
    setTimeout(function(){startMotion(f,fr)},580);
  },
  stopMotion:stopMotion
};
})();
