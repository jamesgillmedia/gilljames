/* A · Contour Field — one graphite field holds every room. Zoom grows from the touched point.
   ‹ / pinch-out / double-tap empty / Esc / Back = exactly one level out. Live crumb + minimap. */
(function(){'use strict';if(G.V!=='A')return;
var d=document,app=d.getElementById('app'),R=G.R,el=G.el,img=G.img,esc=G.esc,D=G.D;
var view=el('div','a-view',null,app),world=el('div','a-world',null,view);
var svgNS='http://www.w3.org/2000/svg',contour=d.createElementNS(svgNS,'svg');contour.setAttribute('class','a-contour');world.appendChild(contour);
var hud=el('div','a-hud',null,app);
hud.innerHTML='<a class="a-wm" href="#/">Gill James</a><nav class="a-crumb" aria-label="where you are"></nav><button class="a-out" type="button" aria-label="one level out"></button><button class="a-idx" type="button">index</button>'+
  '<div class="a-cap" aria-live="polite"></div><div class="a-mini" aria-label="map of the field"><i class="a-vp"></i></div><span class="a-scale"></span>';
var crumb=hud.querySelector('.a-crumb'),outB=hud.querySelector('.a-out'),capEl=hud.querySelector('.a-cap'),mini=hud.querySelector('.a-mini'),vp=hud.querySelector('.a-vp'),scaleEl=hud.querySelector('.a-scale');
var idx=G.index(function(r){R.go(r,{replace:true})});G.player();G.devToggle();
var sheet=el('section','a-sheet',null,app);sheet.setAttribute('aria-label','about');sheet.innerHTML='<div class="in"><p class="lede">'+esc(D.bio[0])+'</p>'+D.bio.slice(1).map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'<div class="poem">'+D.poem.map(esc).join('<br>')+'</div><p class="mail"><a href="mailto:'+esc(D.email)+'">'+esc(D.email)+'</a></p></div>';
/* ---------- layout of the field (portrait for phones, landscape otherwise) ---------- */
function rnd(n){var x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)}
var PORT,WW,WH,CL={},PIECES=[],LABELS=[];
var ORDER=['objects','film','photo','spaces','about'];
function boxes(){return PORT?{objects:[120,260,1420,1700],film:[1580,260,2880,1000],photo:[1580,1220,2880,3250],spaces:[120,1960,1420,3250],about:[200,3520,2800,4500]}
  :{objects:[200,220,1650,1250],photo:[2050,180,4150,1450],film:[2150,1700,3350,2200],spaces:[200,1560,1650,2560],about:[3600,1700,4900,2600]}}
function pack(items,b,seed,size){var placed=[],pad=PORT?40:54;
  items.forEach(function(it,i){var w0=size(it,i),best=null;
    for(var shrink=0;shrink<8&&!best;shrink++){var h0=w0*it.h/it.w,bd=-1;
      for(var t=0;t<160;t++){var x=b[0]+rnd(seed+i*97+t*7.1+shrink*13)*(b[2]-b[0]-w0),y=b[1]+80+rnd(seed+i*31+t*3.7+shrink*5)*(b[3]-b[1]-80-h0),md=1e9,ok=true;
        for(var j=0;j<placed.length;j++){var q=placed[j];if(x<q.x+q.w+pad&&x+w0+pad>q.x&&y<q.y+q.h+pad&&y+h0+pad>q.y){ok=false;break}
          var dx=Math.max(q.x-(x+w0),x-(q.x+q.w),0),dy=Math.max(q.y-(y+h0),y-(q.y+q.h),0);md=Math.min(md,Math.hypot(dx,dy))}
        if(ok&&md>bd){bd=md;best={x:x,y:y,w:w0,h:h0}}}
      if(!best)w0*=.88}
    if(!best)best={x:b[0],y:b[1]+80,w:w0,h:w0*it.h/it.w};
    placed.push({x:best.x,y:best.y,w:best.w,h:best.h,it:it})});return placed}
function build(){PORT=innerHeight>innerWidth*1.1;WW=PORT?3000:5100;WH=PORT?4800:2800;var B=boxes();
  world.querySelectorAll('.a-p,.a-l,.a-t,.a-plate').forEach(function(n){n.remove()});PIECES=[];LABELS=[];CL={};
  world.style.width=WW+'px';world.style.height=WH+'px';
  /* Gill's graphite drawings are the ground itself */
  [['graphite-a',PORT?[-100,0,1700,2100]:[0,0,1700,2100]],['graphite-b',PORT?[1500,2400,1500,1900]:[2300,900,1500,1900]]].forEach(function(g){var e=el('div','a-plate '+g[0],null,world);e.style.cssText='left:'+g[1][0]+'px;top:'+g[1][1]+'px;width:'+g[1][2]+'px;height:'+g[1][3]+'px'});
  var lists={objects:D.objects.map(function(o){return{id:o.id,src:o.src,th:o.th,w:o.w,h:o.h,it:o}}),
    photo:G.room('photo').items.map(function(p){return{id:p.id,src:p.src,th:p.th,w:p.w,h:p.h,it:p}})};
  addPieces('objects',pack(lists.objects,B.objects,3,function(it,i){return(PORT?230:250)*(i%5===0?1.45:i%3===0?.72:1)}));
  addPieces('photo',pack(lists.photo,B.photo,11,function(it,i){return(PORT?150:165)*(i%7===0?1.55:i%4===0?.7:1)}));
  /* film: each film is a line of its stills, like a strip laid on the field */
  var fb=B.film,fy=fb[1]+70;D.film.forEach(function(f,fi){var x=fb[0]+(fi?(PORT?40:120):0),rowH=PORT?150:160,ar=[];
    f.stills.forEach(function(s,i){var h=i===0?rowH*1.5:rowH*(i%2?.8:.95),w=h*s.w/s.h;if(x+w>fb[2])return;ar.push({x:x,y:fy+(i===0?0:rowH*.3+(i%2)*26),w:w,h:h,it:f,id:f.id+'.'+i,src:s.src,th:s.th});x+=w+(PORT?34:46)});
    addPieces('film',ar.map(function(a){return{x:a.x,y:a.y,w:a.w,h:a.h,it:{id:a.id,src:a.src,th:a.th,w:a.w,h:a.h,it:f}}}));
    var t=el('div','a-t a-film',G.caption(Object.assign({room:'film'},f),true),world);t.style.cssText='left:'+fb[0]+(fi?(PORT?40:120):0)+'px;top:'+(fy+rowH*1.5+20)+'px;width:'+(PORT?1200:900)+'px';
    if(!PORT){t.style.left=(fb[0]+(fi?120:0))+'px'}fy+=rowH*1.5+(PORT?120:150)});
  B.film[3]=fy;
  /* spaces: the concept views large, their side views small around them */
  var sl=[];D.spaces.forEach(function(s){sl.push({id:s.id,src:s.src,th:s.th,w:s.w,h:s.h,it:s,big:1});s.views.forEach(function(v,j){sl.push({id:s.id+'.'+j,src:v.src,th:v.src,w:v.w,h:v.h,it:s})})});
  addPieces('spaces',pack(sl,B.spaces,5,function(it,i){return it.big?(i===0?(PORT?620:560):(PORT?360:320)):(PORT?190:160)}));
  var se=el('div','a-t a-se','<span class="ca">'+esc(D.spiritEye.line)+'</span><span class="cm">'+esc(D.spiritEye.made)+'</span>',world);se.style.cssText='left:'+B.spaces[0]+'px;top:'+(B.spaces[3]+10)+'px;width:'+(PORT?1100:900)+'px';
  /* about: the words are part of the land — illegible texture from far, readable when you arrive */
  var ab=B.about,a=el('div','a-t a-about',null,world);a.style.cssText='left:'+ab[0]+'px;top:'+(ab[1]+70)+'px;width:'+(ab[2]-ab[0])+'px';
  a.innerHTML='<div class="bio"><p class="lede">'+esc(D.bio[0])+'</p>'+D.bio.slice(1).map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+'<p class="mail"><a href="mailto:'+esc(D.email)+'">'+esc(D.email)+'</a></p></div><div class="poem">'+D.poem.map(esc).join('<br>')+'</div>';
  B.about[3]=ab[1]+70+a.offsetHeight+40;if(PORT){WH=Math.max(4800,B.about[3]+140);world.style.height=WH+'px'}
  ORDER.forEach(function(k){var b=B[k];CL[k]=b;var l=el('button','a-l',G.room(k).n,world);l.type='button';l.dataset.k=k;l.style.left=b[0]+'px';l.style.top=b[1]+'px';LABELS.push(l)});
  drawContours(B);drawMini(B)}
function addPieces(k,arr){arr.forEach(function(p){var it=p.it,e=el('button','a-p',null,world);e.type='button';e.dataset.r=k+'/'+it.id;e.style.cssText='left:'+p.x.toFixed(1)+'px;top:'+p.y.toFixed(1)+'px;width:'+p.w.toFixed(1)+'px;height:'+p.h.toFixed(1)+'px';
  var label=(it.it&&it.it.t)||'photograph';e.setAttribute('aria-label',label);var im=img(it.th,'',label,e);im.dataset.hi=it.src;
  if(it.it&&it.it.t)el('span','a-nm',esc(it.it.t),e);
  PIECES.push({k:k,id:it.id,x:p.x,y:p.y,w:p.w,h:p.h,el:e,im:im,it:it.it||it})})}
function drawContours(B){var s='',seed=7;
  ORDER.forEach(function(k,ci){var b=B[k],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,base=Math.min(b[2]-b[0],b[3]-b[1])*.18;
    for(var r=0;r<11;r++){var R0=base+r*(PORT?62:70),pts=[],ph=[rnd(ci*9+1)*6.28,rnd(ci*9+2)*6.28,rnd(ci*9+3)*6.28];
      for(var t=0;t<=96;t++){var a=t/96*6.2832,rr=R0*(1+.13*Math.sin(3*a+ph[0])+.07*Math.sin(5*a+ph[1]+r*.2)+.05*Math.sin(2*a+ph[2]));pts.push((cx+rr*Math.cos(a)*1.3).toFixed(0)+','+(cy+rr*Math.sin(a)).toFixed(0))}
      s+='<polyline points="'+pts.join(' ')+'" class="'+(r%4===0?'k':'')+'"/>'}});
  /* long valley lines between rooms */
  for(var i=0;i<14;i++){var y0=rnd(i+40)*WH,pts=[];for(var x=-100;x<=WW+100;x+=60){pts.push(x+','+(y0+Math.sin(x*.0021+i)*90+Math.sin(x*.0057+i*2)*30).toFixed(0))}s+='<polyline points="'+pts.join(' ')+'" class="v"/>'}
  contour.setAttribute('viewBox','0 0 '+WW+' '+WH);contour.setAttribute('width',WW);contour.setAttribute('height',WH);contour.innerHTML=s}
function drawMini(B){mini.querySelectorAll('b').forEach(function(n){n.remove()});var mw=PORT?66:120,mh=mw*WH/WW;mini.style.width=mw+'px';mini.style.height=mh+'px';
  ORDER.forEach(function(k){var b=B[k],z=el('b',null,null,mini);z.dataset.k=k;z.title=G.room(k).n;z.innerHTML='<em>'+G.room(k).n+'</em>';z.style.cssText='left:'+(b[0]/WW*100)+'%;top:'+(b[1]/WH*100)+'%;width:'+((b[2]-b[0])/WW*100)+'%;height:'+((Math.max(b[3],b[1]+200)-b[1])/WH*100)+'%'})}
/* ---------- camera ---------- */
var cam={x:0,y:0,s:1},anim=null,level=0;
function SW(){return innerWidth}function SH(){return innerHeight}
function apply(){world.style.transform='translate('+(SW()/2-cam.x*cam.s).toFixed(2)+'px,'+(SH()/2-cam.y*cam.s).toFixed(2)+'px) scale('+cam.s.toFixed(5)+')';
  var vw=SW()/cam.s,vh=SH()/cam.s;vp.style.cssText='left:'+((cam.x-vw/2)/WW*100)+'%;top:'+((cam.y-vh/2)/WH*100)+'%;width:'+(vw/WW*100)+'%;height:'+(vh/WH*100)+'%';
  scaleEl.textContent=(cam.s/fieldCam().s).toFixed(1)+'×';hud.style.setProperty('--ls',cam.s);world.style.setProperty('--ls',cam.s);updOut()}
function atField(){var f=fieldCam();return Math.abs(cam.s/f.s-1)<.04&&Math.abs(cam.x-f.x)*cam.s<24&&Math.abs(cam.y-f.y)*cam.s<24}
function updOut(){if(!outB)return;var k=(R.cur||'').split('/')[0];if(k==='index')return;var free=!k&&!atField();if(!k){outB.hidden=!free;outB.textContent='‹ field';outB.classList.toggle('free',free)}}
function roomAt(w){var best=null,bd=1e18;for(var k in CL){var b=CL[k];if(w.x>=b[0]&&w.x<=b[2]&&w.y>=b[1]&&w.y<=b[3])return k;var cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,dd=(w.x-cx)*(w.x-cx)+(w.y-cy)*(w.y-cy);if(dd<bd){bd=dd;best=k}}return best}
function pieceAt(w,k){for(var i=0;i<PIECES.length;i++){var p=PIECES[i];if(p.k===k&&w.x>=p.x&&w.x<=p.x+p.w&&w.y>=p.y&&w.y<=p.y+p.h)return p}return null}
function resetField(){if(R.cur)R.home();else fly(fieldCam(),null,800)}
function fit(b,f,offx){var W=SW(),H=SH(),padT=PORT?96:90,padB=PORT?120:90;var s=Math.min(W*f/(b[2]-b[0]),(H-padT-padB)*f/(b[3]-b[1]));return{x:(b[0]+b[2])/2+(offx||0)/s,y:(b[1]+b[3])/2-(padT-padB)/2/s,s:s}}
function fieldCam(){return fit([0,PORT?120:60,WW,WH],PORT?.98:.96)}
function roomCam(k){var b=CL[k];if(PORT){var s=SW()*.96/(b[2]-b[0]+80);return{x:(b[0]+b[2])/2,y:b[1]-30+(SH()/2-150)/s,s:s}}return fit([b[0]-40,b[1]-40,b[2]+40,b[3]+40],.94)}
function pieceCam(p){var W=SW(),H=SH(),ph=W<700,capW=ph?0:Math.min(360,W*.26),s=Math.min((W-capW-80)*.92/p.w,(H-(ph?250:140))*.86/p.h,
  Math.min(W,H)*.82/Math.min(p.w,p.h));var cx=p.x+p.w/2+(ph?0:capW/2)/s,cy=p.y+p.h/2+(ph?60:0)/s;return{x:cx,y:cy,s:s}}
function scr(q,c){return{x:(q.x-c.x)*c.s+SW()/2,y:(q.y-c.y)*c.s+SH()/2}}
function fly(to,anchor,ms,done){if(anim)anim.stop=true;var c0={x:cam.x,y:cam.y,s:cam.s};var Q=anchor||{x:cam.x,y:cam.y};
  var P0=scr(Q,c0),P1=scr(Q,to);
  anim=G.tween(ms||950,function(e){var s=Math.exp(Math.log(c0.s)*(1-e)+Math.log(to.s)*e),Px=P0.x+(P1.x-P0.x)*e,Py=P0.y+(P1.y-P0.y)*e;
    cam.s=s;cam.x=Q.x-(Px-SW()/2)/s;cam.y=Q.y-(Py-SH()/2)/s;apply()},function(){anim=null;cam.x=to.x;cam.y=to.y;cam.s=to.s;apply();sharpen();if(done)done()})}
function sharpen(){PIECES.forEach(function(p){if(p.im.dataset.hi&&p.w*cam.s>330&&p.im.src.indexOf(p.im.dataset.hi)<0){var pre=new Image();pre.onload=function(){p.im.src=p.im.dataset.hi};pre.src=p.im.dataset.hi}})}
/* ---------- routes ---------- */
var curPiece=null,lastTap=null;
function findPiece(k,id){for(var i=0;i<PIECES.length;i++)if(PIECES[i].k===k&&PIECES[i].id===id)return PIECES[i];return null}
function setHud(route){var p=route.split('/'),k=p[0],id=p[1];
  var h='<a href="#/" data-r="">field</a>';if(k&&G.room(k))h+=' <i>›</i> <a data-r="'+k+'">'+G.room(k).n.toLowerCase()+'</a>';if(curPiece)h+=' <i>›</i> <b>'+esc(curPiece.it.t||('photograph '+String(curPiece.it.no||'').padStart(2,'0')))+'</b>';crumb.innerHTML=h;
  outB.textContent=curPiece?'‹ '+G.room(k).n.toLowerCase():(k?'‹ field':'');outB.hidden=!k;outB.classList.remove('free');
  capEl.classList.remove('on');capEl.innerHTML=curPiece?G.caption(curPiece.it,true)+(curPiece.k!=='photo'?'':'')+'<span class="nav">‹ ›</span>':'';
  mini.querySelectorAll('b').forEach(function(b){b.classList.toggle('on',b.dataset.k===k)});document.body.dataset.alevel=curPiece?2:k?1:0}
R.on(function(route,prev,how){if(route==='index'){idx.classList.add('open');return}idx.classList.remove('open');
  var p=route.split('/'),k=p[0]||'',id=p.slice(1).join('/')||null;if(k&&!G.room(k)){R.go('',{replace:true});return}
  var target,anchor=null;curPiece=null;
  if(id){curPiece=findPiece(k,id);if(!curPiece){R.go(k,{replace:true});return}target=pieceCam(curPiece);anchor=lastTap&&how==='in'?lastTap:{x:curPiece.x+curPiece.w/2,y:curPiece.y+curPiece.h/2}}
  else if(k){target=roomCam(k);anchor=how==='in'&&lastTap?lastTap:null;if(how==='out'&&prev){var pp=findPiece(prev.split('/')[0],prev.split('/').slice(1).join('/'));if(pp)anchor={x:pp.x+pp.w/2,y:pp.y+pp.h/2}}}
  else{target=fieldCam()}
  lastTap=null;setHud(route);sheet.classList.toggle('on',PORT&&k==='about'&&!id);if(sheet.classList.contains('on'))sheet.scrollTop=0;PIECES.forEach(function(q){q.el.classList.toggle('cur',q===curPiece)});world.classList.toggle('focus',!!curPiece);
  if(how==='load'){cam=target;apply();sharpen();capEl.classList.toggle('on',!!curPiece);return}
  fly(target,anchor,how==='out'?800:950,function(){if(curPiece)capEl.classList.add('on')})});
/* ---------- input: tap, drag, wheel, pinch, keys ---------- */
var PT={},drag=null,pinch=null,moved=false,wheelT=0,lastUp=0;
function toWorld(x,y){return{x:cam.x+(x-SW()/2)/cam.s,y:cam.y+(y-SH()/2)/cam.s}}
view.addEventListener('pointerdown',function(e){PT[e.pointerId]={x:e.clientX,y:e.clientY};moved=false;if(anim){anim.stop=true;anim=null}
  var ids=Object.keys(PT);if(ids.length===2){var a=PT[ids[0]],b=PT[ids[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:cam.s,m:toWorld((a.x+b.x)/2,(a.y+b.y)/2)};drag=null}
  else drag={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,t:performance.now(),tg:e.target};try{view.setPointerCapture(e.pointerId)}catch(x){}});
view.addEventListener('pointermove',function(e){if(!PT[e.pointerId])return;PT[e.pointerId]={x:e.clientX,y:e.clientY};var ids=Object.keys(PT);
  if(pinch&&ids.length===2){var a=PT[ids[0]],b=PT[ids[1]],dd=Math.hypot(a.x-b.x,a.y-b.y),s=Math.max(fieldCam().s*.7,Math.min(8,pinch.s*dd/pinch.d)),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    cam.s=s;cam.x=pinch.m.x-(mx-SW()/2)/s;cam.y=pinch.m.y-(my-SH()/2)/s;moved=true;apply();return}
  if(drag){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)moved=true;if(moved&&!curPiece){cam.x=drag.cx-dx/cam.s;cam.y=drag.cy-dy/cam.s;apply()}}});
function endPointer(e){var wasPinch=!!pinch,st=drag;delete PT[e.pointerId];
  if(wasPinch){if(Object.keys(PT).length<2){var lv=levelScale(),pm=pinch.m,rk=(R.cur||'').split('/')[0];pinch=null;if(cam.s<lv*.72){if(R.cur)R.up();else fly(fieldCam(),null,800)}else if(curPiece){fly(pieceCam(curPiece))}else if(!rk&&cam.s>lv*1.3){lastTap=pm;R.go(roomAt(pm))}else if(rk&&G.room(rk)&&cam.s>lv*1.6){var pp=pieceAt(pm,rk);lastTap=pm;if(pp)R.go(rk+'/'+pp.id);else fly(roomCam(rk),pm,800)}else if(rk&&G.room(rk))fly(roomCam(rk),pm,800);else fly(fieldCam(),pm,800)}drag=null;moved=true;return}
  drag=null;if(!st)return;var dx=e.clientX-st.x,dy=e.clientY-st.y,dt=performance.now()-st.t;
  if(curPiece&&moved&&dt<800&&Math.hypot(dx,dy)>50){if(Math.abs(dx)>Math.abs(dy)*1.3)neighbour(dx<0?1:-1);else if(dy>0)R.up();return}
  if(moved){sharpen();return}
  var now=performance.now(),dbl=now-lastUp<320;lastUp=now;tap(e,dbl,st.tg)}
view.addEventListener('pointerup',endPointer);view.addEventListener('pointercancel',function(e){delete PT[e.pointerId];pinch=null;drag=null});
function levelScale(){var k=(R.cur||'').split('/')[0];return curPiece?pieceCam(curPiece).s:k&&G.room(k)?roomCam(k).s:fieldCam().s}
function tap(e,dbl,tg){var t=(tg||e.target).closest('.a-p,.a-l,a');if(t&&t.tagName==='A')return;lastTap=toWorld(e.clientX,e.clientY);
  if(t&&t.classList.contains('a-p')){if(curPiece&&curPiece.el===t){R.up();return}R.go(t.dataset.r,{replace:!!curPiece});return}
  if(t&&t.classList.contains('a-l')){R.go(t.dataset.k,{replace:!!(R.cur&&R.cur.indexOf('/')<0&&R.cur)});return}
  if(dbl){if(R.cur)R.up();else fly(fieldCam(),null,800);return}
  if(curPiece){R.up();return}
  var w=toWorld(e.clientX,e.clientY),cur=(R.cur||'').split('/')[0];if(cur)return;
  for(var k in CL){var b=CL[k];if(w.x>b[0]-60&&w.x<b[2]+60&&w.y>b[1]-60&&w.y<b[3]+60){R.go(k);return}}}
function neighbour(dir){if(!curPiece)return;var list=PIECES.filter(function(p){return p.k===curPiece.k}),i=list.indexOf(curPiece),n=list[(i+dir+list.length)%list.length];lastTap=null;R.go(n.k+'/'+n.id,{replace:true})}
view.addEventListener('wheel',function(e){e.preventDefault();if(anim){anim.stop=true;anim=null}var k=Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)),s=Math.max(fieldCam().s*.7,Math.min(8,cam.s*k)),w=toWorld(e.clientX,e.clientY);
  cam.s=s;cam.x=w.x-(e.clientX-SW()/2)/s;cam.y=w.y-(e.clientY-SH()/2)/s;apply();clearTimeout(wheelT);wheelT=setTimeout(function(){var lv=levelScale();if(cam.s<lv*.6&&R.cur)R.up();else if(!R.cur&&cam.s>lv*1.3){var w2=toWorld(e.clientX,e.clientY);lastTap=w2;R.go(roomAt(w2))}else sharpen()},260)},{passive:false});
view.addEventListener('pointerover',function(e){var p=e.target.closest('.a-p');if(p)p.classList.add('hov')});view.addEventListener('pointerout',function(e){var p=e.target.closest('.a-p');if(p)p.classList.remove('hov')});
d.addEventListener('keydown',function(e){var st=60/cam.s;
  if(curPiece&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){neighbour(e.key==='ArrowRight'?1:-1);return}
  if(e.key==='ArrowRight')cam.x+=st;else if(e.key==='ArrowLeft')cam.x-=st;else if(e.key==='ArrowUp')cam.y-=st;else if(e.key==='ArrowDown')cam.y+=st;
  else if(e.key==='+'||e.key==='=')cam.s=Math.min(8,cam.s*1.25);else if(e.key==='-')cam.s=Math.max(fieldCam().s*.7,cam.s/1.25);else if(e.key==='Home'){resetField();return}else return;apply()});
crumb.addEventListener('click',function(e){var a=e.target.closest('a[data-r]');if(!a)return;e.preventDefault();var r=a.dataset.r;if(r===R.cur)return;
  if(R.cur.indexOf(r)===0&&(r===''||R.cur.charAt(r.length)==='/'))R.up();else R.go(r,{replace:true})});
outB.addEventListener('click',function(){if(R.cur)R.up();else fly(fieldCam(),null,800)});
hud.querySelector('.a-idx').addEventListener('click',function(){R.go('index')});
GJ_THEME.bind(hud.querySelector('.a-wm'),{home:function(){resetField()}});
['pointerdown','pointerup','touchstart','touchend'].forEach(function(t){mini.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
mini.addEventListener('click',function(e){var r=mini.getBoundingClientRect(),w={x:(e.clientX-r.left)/r.width*WW,y:(e.clientY-r.top)/r.height*WH},k=roomAt(w);if(k&&k!==R.cur)R.go(k,{replace:!!R.cur})});
G.swipe(idx,function(dir){if(dir==='down'||dir==='right')R.up()});
G.swipe(sheet,function(dir){if(dir==='right')R.up()});
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){var port=innerHeight>innerWidth*1.1;if(port!==PORT)build();var r=R.cur;var p=r.split('/');curPiece=p[1]?findPiece(p[0],p.slice(1).join('/')):null;cam=curPiece?pieceCam(curPiece):p[0]&&G.room(p[0])?roomCam(p[0]):fieldCam();apply()},120)});
build();R.start();
})();
