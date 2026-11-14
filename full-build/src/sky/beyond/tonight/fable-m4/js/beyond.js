/* Beyond · selection by light, colour and red, with the camera as the only mover.
 Prototype (preview-beyond). Nothing here touches a pixel: no colour, hue, tint, brightness or contrast
 filter is ever applied to any still or clip frame. Beyond only chooses WHICH assets show and in what order,
 from beyond-index.json (tools/beyond_index.py: mean luminance, dominant hue, warmth per asset).

 Modes
   off     the site as written (the default; the existing order, the existing stills)
   red     the darkest, warm / red-leaning assets (a darkroom pick). value = how deep the dark goes
   colour  one hue family. value = where on the hue wheel (red .. amber .. green .. teal .. blue .. violet .. rose)
   light   assets nearest a light level. value = dark .. bright

 One system with the camera (docs 11-camera-logic): a changed selection is a camera move.
   The swaps ride sky.js's own critically damped springs (GJ_CAM.sstep; W_GLIDE 4.8 is the glide weight the
   levels use) and the moon opener's exponential lag (k = 1 - exp(-dt * rate), rate 3.4 for a stage step).
   depth   the ZLV stops of the sound dive (.62 / 1 / 1.55 / 2.4) set how far behind the lens an incoming frame sits
   drift   scales the spring weight, so a slower drift is a longer glide
   easing  which spring: W_SOFT 3.2 / W_GLIDE 4.8 / W_FLY 5.6 / the exponential lag
   orbit   off = dolly (pure push along Z); on = the arrival also swings through a short yaw arc
 The incoming frame starts BEHIND the outgoing one at perspective scale f/(f+z) and rises to 1; the outgoing
 frame passes the lens (scale up, drifting off the tile). Both are opaque the whole way: nothing dissolves,
 nothing dims. Darker selections sink deeper (z x 1.35 at full dark) and drift slower (x .7 at full dark).
 Reduce Motion: the swap is instant (no travel), the same policy as sky.js. */
(function(w){
'use strict';
var KEY='gj.beyond';
var CAMX=w.GJ_CAM||{};
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,u){return a+(b-a)*u}
function sstepF(s,dt){var k=Math.exp(-s.w*dt),e=s.x-s.t,c=s.v+s.w*e;s.x=s.t+(e+c*dt)*k;s.v=(s.v-s.w*c*dt)*k}
var sstep=CAMX.sstep||sstepF;
/* The site-3d springs. W_GLIDE and W_LOOK are sky.js's own (exported through GJ_CAM); the others are site-3d's weights. */
var W={GLIDE:CAMX.W_GLIDE||4.8,LOOK:CAMX.W_LOOK||9.5,REL:CAMX.W_REL||9.5,FLY:CAMX.W_FLY||5.6,SOFT:CAMX.W_SOFT||3.2};
var EXP={TAP:3.4,MOUSE:14,WHEEL:16,TOUCH:22};
var ZLV=[.62,1,1.55,2.4];
var EASES=[{k:'soft',n:'soft',w:'SOFT',tag:'W_SOFT'},{k:'glide',n:'glide',w:'GLIDE',tag:'W_GLIDE'},{k:'fly',n:'fly',w:'FLY',tag:'W_FLY'},{k:'exp',n:'exp',rate:EXP.TAP,tag:'exp lag'}];
var Z_PX=120,FOV=60,ORBIT_ARC=.3;
var MODES=['off','red','colour','light'];
var HUES=[[345,'rose'],[15,'red'],[45,'amber'],[70,'gold'],[165,'green'],[200,'teal'],[255,'blue'],[300,'violet']];
var DEF={mode:'off',red:.7,colour:0,light:.5,depth:1,drift:1,ease:1,orbit:0};

var RM=false,rmq=null;
try{rmq=matchMedia('(prefers-reduced-motion: reduce)');RM=rmq.matches;var rmf=function(e){RM=e.matches};if(rmq.addEventListener)rmq.addEventListener('change',rmf);else if(rmq.addListener)rmq.addListener(rmf)}catch(e){}
function reduced(){return RM||(CAMX.rm&&CAMX.rm())||document.documentElement.classList.contains('rm')}
function motionK(){return CAMX.motionK?CAMX.motionK():1}

var ST={};
(function(){
  var k;for(k in DEF)ST[k]=DEF[k];
  var raw=null;try{raw=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(raw)for(k in DEF){
    if(k==='mode'){if(typeof raw.mode==='string')ST.mode=raw.mode}
    else if(raw[k]!=null&&isFinite(+raw[k]))ST[k]=+raw[k];
  }
  var q=new URLSearchParams(location.search),b=q.get('beyond');
  if(b&&MODES.indexOf(b)>=0){ST.mode=b;var bv=parseFloat(q.get('bv'));if(isFinite(bv)&&b!=='off')ST[b]=clamp(bv,0,1)}
  ['depth','ease','orbit'].forEach(function(n){var v=parseInt(q.get('b'+n),10);if(isFinite(v))ST[n]=v});
  var bd=parseFloat(q.get('bdrift'));if(isFinite(bd))ST.drift=bd;
  if(MODES.indexOf(ST.mode)<0)ST.mode='off';
  ST.depth=clamp(Math.round(ST.depth),0,ZLV.length-1);ST.ease=clamp(Math.round(ST.ease),0,EASES.length-1);ST.orbit=ST.orbit?1:0;ST.drift=clamp(+ST.drift||1,.25,2);
  ['red','colour','light'].forEach(function(n){ST[n]=clamp(+ST[n],0,1)});
})();
var subs=[],rev=0,dark=.4,dirSign=1;
function save(){try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}}
function emit(sel){subs.forEach(function(f){try{f(ST,sel)}catch(e){}})}

/* ---------- the index ---------- */
var IDX=null,M={},LUMS=[],loading=false,readyFns=[];
function pct(sorted,v){var lo=0,hi=sorted.length;while(lo<hi){var m=(lo+hi)>>1;if(sorted[m]<v)lo=m+1;else hi=m}return sorted.length>1?lo/(sorted.length-1):0}
function load(){
  if(loading)return;loading=true;
  fetch('beyond-index.json',{cache:'force-cache'}).then(function(r){return r.json()}).then(function(j){
    IDX=j;var a=j.assets,p;
    var l=[],wv=[];for(p in a){l.push(a[p].lum);wv.push(a[p].warm)}
    l.sort(function(x,y){return x-y});wv.sort(function(x,y){return x-y});LUMS=l;
    for(p in a){var m=a[p];M[p]={lum:m.lum,lp:pct(l,m.lum),hue:m.hue,chroma:m.chroma,warm:m.warm,wp:pct(wv,m.warm),k:m.k}}
    rev++;refreshDark();readyFns.splice(0).forEach(function(f){f()});emit('index');
  }).catch(function(){loading=false});
}
function angDist(a,b){var d=Math.abs(a-b)%360;return d>180?360-d:d}
function hueName(deg){var best=HUES[0][1],bd=1e9;HUES.forEach(function(h){var d=angDist(deg,h[0]);if(d<bd){bd=d;best=h[1]}});return best}
function hueDeg(v){return v*340}
function label(){
  if(ST.mode==='off')return 'off';
  if(ST.mode==='red')return 'red · '+Math.round(ST.red*100);
  if(ST.mode==='colour')return 'colour · '+hueName(hueDeg(ST.colour));
  return 'light · '+Math.round(ST.light*100);
}

/* ---------- scoring: 0..1, higher = a better pick for the current choice ---------- */
function score(m){
  if(!m)return 0;
  var s;
  if(ST.mode==='red'){
    var tl=lerp(.5,.02,ST.red),dk=1-Math.min(1,Math.abs(m.lp-tl)/.5);
    var rb=clamp(1-angDist(m.hue,12)/55,0,1)*clamp(m.chroma/.08,0,1);
    var wm=clamp((m.warm+.04)/.4,0,1)*(.55+.45*rb);
    s=.58*dk+.42*wm;
  }else if(ST.mode==='colour'){
    var gate=clamp(m.chroma/.1,0,1),match=clamp(1-angDist(m.hue,hueDeg(ST.colour))/60,0,1);
    s=match*(.2+.8*gate)+.03*gate;
  }else if(ST.mode==='light'){
    s=clamp(1-Math.abs(m.lp-ST.light)*1.7,0,1);
  }else s=0;
  /* a frame that is nearly pure black or pure white has nothing to show */
  if(m.lum<.035||m.lum>.93)s*=.35;
  return s;
}
function active(){return ST.mode!=='off'&&!!IDX}
function best(paths){
  var bp=null,bs=-1,sum=0,n=0,i;
  for(i=0;i<paths.length;i++){var m=M[paths[i]];if(!m)continue;var s=score(m);sum+=s;n++;if(s>bs){bs=s;bp=paths[i]}}
  return {p:bp,s:bs<0?0:bs,mean:n?sum/n:0};
}
var CACHE=typeof WeakMap==='function'?new WeakMap():null;
function filmOrder(items){
  var rows=[],pinned=null;
  items.forEach(function(it,i){
    var g=IDX.groups[it.id],thumb=it.media&&it.media.thumb,paths=g&&g.length?g:(thumb?[thumb]:[]);
    var b=best(paths);
    it._bp=(b.p&&b.p!==thumb)?b.p:null;it._bs=.6*b.s+.4*b.mean;if(it._bp)img(it._bp);
    if(i===0&&it.feat===1)pinned=it;else rows.push({it:it,i:i,s:it._bs})
  });
  rows.sort(function(a,b){return b.s-a.s||a.i-b.i});
  var out=rows.map(function(r){return r.it});if(pinned)out.unshift(pinned);
  return out;
}
function thumbOrder(items){
  var rows=items.map(function(it,i){var t=it.media&&(it.media.thumb||it.media.big);return {it:it,i:i,s:score(M[t])}});
  rows.sort(function(a,b){return b.s-a.s||a.i-b.i});
  return rows.map(function(r){return r.it});
}
/* The ordered cards of a board. Identity (the very same array) when Beyond is off or the room has no gallery.
 k: 'film' | 'photo' (a chapter board) | 'fine' (the stills board of one work). */
function items(k,list){
  if(!active()||!list||list.length<2)return list;
  if(k!=='film'&&k!=='photo'&&k!=='fine')return list;
  var ent=CACHE&&CACHE.get(list);
  if(ent&&ent.rev===rev&&ent.k===k)return ent.out;
  var out=k==='film'?filmOrder(list):thumbOrder(list);
  if(CACHE)CACHE.set(list,{rev:rev,k:k,out:out});
  return out;
}
/* The stills of one film page: the best n of the film's whole pool, best first. Off: the page's own list. */
function stills(work,own){
  if(!active()||!work)return own;
  var pool=(IDX.groups[work.id]||[]).slice(),i;
  for(i=0;i<pool.length;i++)if(!M[pool[i]])pool.splice(i--,1);
  own.forEach(function(p){if(M[p]&&pool.indexOf(p)<0)pool.push(p)});
  var rows=pool.map(function(p,j){return {p:p,s:score(M[p]),j:j}});
  rows.sort(function(a,b){return b.s-a.s||a.j-b.j});
  var out=rows.slice(0,own.length).map(function(r){return r.p});
  return out.length?out:own;
}
/* A film page's own shots, best match first (a reorder; the list keeps its members). Off: the very same list. */
function shots(list){
  if(!active()||!list||list.length<2)return list;
  var rows=list.map(function(s,i){return {s:s,i:i,v:score(M[s.src])}});
  rows.sort(function(a,b){return b.v-a.v||a.i-b.i});
  return rows.map(function(r){return r.s});
}
function refreshDark(){
  if(!IDX||ST.mode==='off'){dark=.4;return}
  var lst=[],g=IDX.groups,id;
  for(id in g){var b=best(g[id]);if(b.p)lst.push({s:b.s,lp:M[b.p].lp})}
  lst.sort(function(a,b){return b.s-a.s});
  var top=lst.slice(0,12),sum=0;top.forEach(function(r){sum+=r.lp});
  dark=top.length?1-sum/top.length:.4;
}

/* ---------- the camera ---------- */
function cam(){
  var e=EASES[ST.ease],spd=ST.drift*(1-.3*dark),mk=motionK();
  var z=Z_PX*ZLV[ST.depth]*(1+.35*dark),rm=reduced();
  var wt=e.w?W[e.w]:0;
  return {z:z,spd:spd,w:wt*spd*Math.max(.35,mk),exp:!e.w,rate:(e.rate||0)*spd*Math.max(.35,mk),yaw:ST.orbit?ORBIT_ARC:0,
    ease:e,dark:dark,instant:rm||mk<=.01,f:Math.max(320,innerHeight/2/Math.tan(FOV*Math.PI/360))};
}
function stepP(a,dt){
  if(a.delay>0){a.delay-=dt;return}
  if(a.exp)a.p.x+=(1-a.p.x)*(1-Math.exp(-dt*a.rate));else sstep(a.p,dt);
}
function doneP(a){return a.delay<=0&&1-a.p.x<.002&&(a.exp||Math.abs(a.p.v)<.02)}
function newAnim(c,idx){
  var a={p:{x:0,v:0,t:1,w:c.w||1},exp:c.exp,rate:c.rate,z:c.z,yaw:c.yaw,f:c.f,dir:dirSign,
    delay:Math.min(idx||0,30)*.026/Math.max(.25,c.spd),last:0};
  return a;
}
function easeOut(p){return Math.pow(clamp(p,0,1),1.5)}

/* ---------- images ---------- */
var IM={};
function img(p){
  if(!p)return null;
  var im=IM[p];
  if(!im){im=IM[p]=new Image();im.decoding='async';im.onerror=function(){im._bad=1};im.src=p}
  return im.complete&&im.naturalWidth&&!im._bad?im:null;
}

/* ---------- canvas slots (the film and photo boards in sky.js) ---------- */
var SLOTS={};
/* g: the board's context. key: one board slot ('film:3'). it: the card in that slot. base: the image the board draws with Beyond off
 (null until decoded). paint(im,x,y,w,h) draws one image into a rect. When the picked still is not decoded yet the slot keeps what it shows. */
function slotDraw(g,key,it,base,x,y,w,h,paint){
  var S=SLOTS[key],now=performance.now(),want,stale;
  if(active()&&it&&it._bp){want=img(it._bp)}else want=base;
  if(!S){S=SLOTS[key]={cur:want,a:null,seen:now,prev:null};stale=true}
  else{stale=now-S.seen>400;S.seen=now}
  if(!want){if(S.cur){paint(S.cur,x,y,w,h);return true}return false}
  if(S.cur!==want){
    var c=cam();
    if(stale||c.instant||!S.cur){S.cur=want;S.a=null;S.prev=null}
    else{S.prev=S.cur;S.cur=want;S.a=newAnim(c,parseInt(key.split(':')[1],10)||0)}
  }
  var a=S.a;
  if(!a){paint(S.cur,x,y,w,h);return true}
  var dt=Math.min(.05,a.last?(now-a.last)/1000:.016);a.last=now;
  stepP(a,dt);
  if(doneP(a)){S.a=null;S.prev=null;paint(S.cur,x,y,w,h);return true}
  var p=clamp(a.p.x,0,1),q=1-p,cx=x+w/2,cy=y+h/2,f=a.f;
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  g.fillStyle='#04070b';g.fillRect(x,y,w,h);
  var sI=f/(f+a.z*q),yI=a.yaw*q*a.dir;
  g.save();g.translate(cx+a.dir*w*.1*q,cy-h*.03*q);g.scale(sI*Math.cos(yI),sI);g.translate(-cx,-cy);
  paint(S.cur,x,y,w,h);g.restore();
  var sO=f/(f-a.z*.6*p),yO=-a.yaw*p*a.dir;
  g.save();g.translate(cx-a.dir*w*1.15*easeOut(p),cy);g.scale(sO*Math.cos(yO),sO);g.translate(-cx,-cy);
  paint(S.prev,x,y,w,h);g.restore();
  g.restore();
  return true;
}
function slotsClear(){SLOTS={}}
/* True while a changed selection is still travelling (or about to start): the video overlay on the film board waits for it,
 so the swap is seen on the board's own stills, and the loops fade back in on the same stills. */
function moving(){
  if(reduced())return false;
  if(performance.now()<settleUntil||DOMA.length)return true;
  for(var k in SLOTS)if(SLOTS[k].a)return true;
  return false;
}

/* ---------- DOM swaps (the film page stills) ---------- */
var DOMA=[],domRaf=0,settleUntil=0;
function tdom(el,a){
  var p=clamp(a.p.x,0,1),q=1-p,f=a.f;
  return {inT:'perspective('+f.toFixed(0)+'px) translate3d('+(a.dir*el._w*.1*q).toFixed(1)+'px,'+(-el._h*.03*q).toFixed(1)+'px,'+(-a.z*q).toFixed(1)+'px) rotateY('+(a.yaw*q*a.dir).toFixed(4)+'rad)',
    outT:'perspective('+f.toFixed(0)+'px) translate3d('+(-a.dir*el._w*1.15*easeOut(p)).toFixed(1)+'px,0,'+(a.z*.6*p).toFixed(1)+'px) rotateY('+(-a.yaw*p*a.dir).toFixed(4)+'rad)'};
}
function domLoop(t){
  domRaf=0;
  var i,now=performance.now();
  for(i=DOMA.length-1;i>=0;i--){
    var d=DOMA[i];
    if(!d.out.isConnected){DOMA.splice(i,1);continue}
    var dt=Math.min(.05,d.a.last?(now-d.a.last)/1000:.016);d.a.last=now;
    stepP(d.a,dt);
    if(doneP(d.a)){finishDom(d);DOMA.splice(i,1);continue}
    var tr=tdom(d.host,d.a);d.inn.style.transform=tr.inT;d.out.style.transform=tr.outT;
  }
  if(DOMA.length)domRaf=requestAnimationFrame(domLoop);
}
function finishDom(d){
  d.inn.style.transform='';d.inn.style.willChange='';d.inn.style.zIndex=d.z0;
  if(d.out.parentNode)d.out.parentNode.removeChild(d.out);
  if(d.done)d.done(d.inn);
}
/* out: the <img> now showing. Replaces it with a copy of it showing src, gliding in from depth while the old one passes the lens.
 host: the clipping parent (position + overflow hidden are set here). opts.flow: the new image stays in normal flow (it sizes the host).
 Both stay opaque the whole way. Returns the new <img>. */
function flushHost(host){
  for(var i=DOMA.length-1;i>=0;i--)if(DOMA[i].host===host){var d=DOMA.splice(i,1)[0];finishDom(d)}
}
function glideDom(host,out,src,idx,opts){
  opts=opts||{};
  if(host)flushHost(host);
  if(!out||!out.parentNode)return null;
  var inn=out.cloneNode(false);inn.removeAttribute('id');
  inn.src=src;
  var c=cam();
  if(c.instant){out.parentNode.replaceChild(inn,out);return inn}
  var cs=getComputedStyle(host);
  if(cs.position==='static')host.style.position='relative';
  host.style.overflow='hidden';
  var z0=out.style.zIndex||'';
  host._w=host.clientWidth||host.getBoundingClientRect().width||1;host._h=host.clientHeight||host.getBoundingClientRect().height||1;
  inn.classList.remove('fp-now');
  if(opts.flow){
    out.style.position='absolute';out.style.left='0';out.style.top='0';out.style.width='100%';out.style.height='100%';out.style.objectFit='cover';out.style.zIndex='3';
    out.parentNode.insertBefore(inn,out);
  }else{
    out.style.zIndex='3';inn.style.zIndex='2';
    out.parentNode.insertBefore(inn,out);
  }
  inn.style.willChange='transform';out.style.willChange='transform';
  var a=newAnim(c,idx),tr=tdom(host,a);
  inn.style.transform=tr.inT;out.style.transform=tr.outT;
  DOMA.push({host:host,out:out,inn:inn,a:a,flow:!!opts.flow,done:opts.done,z0:opts.flow?'':z0});
  if(!domRaf)domRaf=requestAnimationFrame(domLoop);
  return inn;
}

/* ---------- state ---------- */
function set(patch,opts){
  opts=opts||{};
  var changedSel=false,k,old={mode:ST.mode,v:ST[ST.mode]};
  for(k in patch){
    if(!(k in DEF))continue;
    var v=patch[k];
    if(k==='mode'){if(MODES.indexOf(v)<0||v===ST.mode)continue;ST.mode=v;changedSel=true;continue}
    if(k==='red'||k==='colour'||k==='light'){v=clamp(+v,0,1);if(Math.abs(v-ST[k])<1e-4)continue;ST[k]=v;if(ST.mode===k)changedSel=true;continue}
    if(k==='depth'){v=clamp(Math.round(v),0,ZLV.length-1)}
    else if(k==='ease'){v=clamp(Math.round(v),0,EASES.length-1)}
    else if(k==='orbit'){v=v?1:0}
    else if(k==='drift'){v=clamp(+v,.25,2)}
    ST[k]=v;
  }
  if(changedSel){
    var nv=ST[ST.mode];
    dirSign=(MODES.indexOf(ST.mode)!==MODES.indexOf(old.mode))?(MODES.indexOf(ST.mode)>MODES.indexOf(old.mode)?1:-1):(nv>=old.v?1:-1);
    rev++;refreshDark();settleUntil=performance.now()+220;
  }
  if(!opts.quiet)save();
  emit(changedSel?'sel':'cam');
}
function onSub(f){subs.push(f)}

w.GJ_BEYOND={
  get state(){return ST},get rev(){return rev},get active(){return active()},get ready(){return !!IDX},
  get dark(){return dark},get label(){return label()},
  MODES:MODES,ZLV:ZLV,EASES:EASES,W:W,EXP:EXP,HUES:HUES,
  set:set,on:onSub,load:load,whenReady:function(f){if(IDX)f();else readyFns.push(f)},
  items:items,stills:stills,shots:shots,img:img,slotDraw:slotDraw,slotsClear:slotsClear,moving:moving,glideDom:glideDom,flush:flushHost,cam:cam,
  hueName:hueName,hueDeg:hueDeg,reduced:reduced,
  /* per-asset readout, for the smoke test and the console */
  meta:function(p){return M[p]||null},
  pickOf:function(it){return it&&it._bp||null}
};
load();
})(window);
