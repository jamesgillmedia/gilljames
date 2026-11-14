/* the mark menu: list · contact · tune (context-aware; ported from preview-proto-shell onto the real site).
   Context-aware: reads the ladder room/level (and the active module's `tune` list) and shows that
   context's sliders first. Motion, safelight and ripples stay pinned at the bottom. "all rooms"
   is one tap away. Values are kept per room on this device. Reset this room / reset all.
   The menu repaints live when the ladder changes while it is open.
   Slider widgets and hooks are the same as preview-film-snap tune.js (GJ_TUNE, gj.vol / gj.flash,
   gj.amb.*, GJ_DEC). Nothing here grades a photograph or a film frame.
   about-1113: the drawer is a small 3D object that unfolds out of the mark. While a slider is held, dial.js
   hides it (gd-away) and only the ghost arc shows; tune.js does not clear gd-away on pointer-up.
   The drawer unfolds again when the arc has gone. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
function rd(k,d){try{var v=localStorage.getItem(k);if(v==null||v==='')return d;v=+v;return isFinite(v)?v:d}catch(e){return d}}
function wr(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
function rm(k){try{localStorage.removeItem(k)}catch(e){}}
function T(){return window.GJ_TUNE||null}
function tuneRow(k,label,min,max,def,note){
  return {k:'gj.tune.'+k,label:label,min:min,max:max,def:100,note:note,hook:'tune',
    get:function(){return rd('gj.tune.'+k,100)},
    apply:function(v){var t=T();if(!t)return;var o={};o[k]=def*v/100;t.set(o)}};
}
function lsRow(key,label,min,max,def,scale,after){
  return {k:key,label:label,min:min,max:max,def:def,hook:'ls',
    get:function(){var v=rd(key,null);return v==null?def:Math.round(v*scale)},
    apply:function(v,save){if(save)wr(key,v/scale);if(after)after(key)}};
}
function poke(key){try{window.dispatchEvent(new StorageEvent('storage',{key:key}))}catch(e){}}
function setFlash(key){var t=T();if(t)t.set({flash:rd('gj.flash',.6)});try{document.documentElement.style.setProperty('--flash',String(rd('gj.flash',.6)))}catch(e){}}
function sndVar(){try{var v=localStorage.getItem('gj.sound.var');return v==='B'||v==='C'?v:'A'}catch(e){return 'A'}}
function setSndVar(v){try{localStorage.setItem('gj.sound.var',v==='B'||v==='C'?v:'A')}catch(e){}}
var SNDHINT={A:'A · low-pass pull, linear camera sweep (main)',B:'B · band-pass sweep on the pull',C:'C · low-pass, figure-eight camera sweep'};
function soundRows(){
  var red=window.GJ_THEME&&GJ_THEME.eff==='red';
  var rows=[
    {k:'gj.sound.var',label:'dev · A B C',dev:true,toggle:true,options:['A','B','C'],get:sndVar,apply:function(){},hint:function(){return SNDHINT[sndVar()]||''}},
    lsRow('gj.vol','volume',0,100,100,100,poke),
    lsRow('gj.flash','flash',0,100,60,100,setFlash),
    lsRow('gj.sound.sweep','camera sweep speed',0,200,50,1),
    lsRow('gj.sound.sweepLen','camera sweep length',20,200,100,1),
    lsRow('gj.sound.glow','star glow',0,200,100,1),
    lsRow('gj.sound.size','star size',50,200,100,1),
    lsRow('gj.sound.sway','chime sway',0,200,100,1),
    lsRow('gj.sound.resp','chime response',0,200,100,1),
    lsRow('gj.sound.wfB','waveform brightness',80,140,100,1),
    lsRow('gj.sound.wfT','waveform thickness',80,250,100,1),
    lsRow('gj.sound.fAmt','filter amount',0,100,100,1),
    lsRow('gj.sound.fFloor','filter cutoff (low end, Hz)',100,4000,380,1),
    lsRow('gj.sound.fQ','filter resonance',3,120,8,1),
    lsRow('gj.sound.fog','fog and atmosphere',0,100,30,1),
    lsRow('gj.sound.rBright','red brightness',60,140,100,1),
    lsRow('gj.sound.rGlow','red glow depth',0,200,100,1)];
  if(!red)rows=rows.filter(function(r){return r.k!=='gj.sound.rBright'&&r.k!=='gj.sound.rGlow'});
  return rows;
}
var D=(window.GJ_TUNE&&GJ_TUNE.defaults&&GJ_TUNE.defaults())||{mood:1,map:1.3,stars:1.2,lineA:1,starS:1,starG:1,fdens:1,fgap:1};

/* Built-in room sets. A module may replace its chapter's context set with module.tune. */
var ROOMS=[
  {id:'sky',name:'sky',rows:[
    tuneRow('mood','mood',0,200,D.mood),
    tuneRow('map','star spread',60,160,D.map),
    tuneRow('starG','glow',0,200,D.starG),
    tuneRow('stars','stars',40,180,D.stars),
    tuneRow('starS','star size',50,200,D.starS),
    tuneRow('lineA','lines',0,200,D.lineA)]},
  {id:'film',name:'film',rows:[
    tuneRow('fdens','snap density',60,140,D.fdens),
    tuneRow('fgap','frame gap',25,300,D.fgap)]},
  {id:'sound',name:'sound',rows:[]},
  {id:'objects',name:'objects',door:'../objects/',rows:[
    lsRow('gj.amb.objects.glow','all rings',0,150,100,1),
    lsRow('gj.amb.objects.haze','haze',0,250,100,1),
    lsRow('gj.amb.objects.stars','stars',0,200,100,1),
    lsRow('gj.amb.objects.lamp','lamp',20,160,100,1)]},
  {id:'spaces',name:'spaces',door:'../spaces/forest-garden/',rows:[
    lsRow('gj.amb.garden.day','day – night',0,100,0,1),
    lsRow('gj.amb.garden.star','stars',0,200,100,1),
    lsRow('gj.amb.garden.glow','glow',0,150,100,1),
    lsRow('gj.amb.garden.haze','haze',0,300,100,1)]}
];
/* focused context rows (subset shown first). "all rooms" reveals the rest. */
var CTX_FOCUS={
  sky:['gj.tune.mood','gj.tune.map','gj.tune.starG'],
  film:['gj.tune.fdens','gj.tune.fgap'],
  sound:null,
  objects:['gj.amb.objects.glow','gj.amb.objects.haze','gj.amb.objects.stars','gj.amb.objects.lamp'],
  spaces:['gj.amb.garden.day','gj.amb.garden.star','gj.amb.garden.glow','gj.amb.garden.haze']
};
var DECS=[
  {k:'film',n:'1 · film board',o:[['snap','both, snap'],['map','m4 map only'],['board','site-3d board only']]},
  {k:'mark',n:'2 · mark in the journey',o:[['fusion','fusion'],['full','full'],['partial','partial (fewer stars)']]},
  {k:'open',n:'3 · opening one film',o:[['mixed','board straight · map reveal'],['player','straight to the page'],['reveal','tile reveal always'],['old','old: tap, tap again']]},
  {k:'photo',n:'4 · photo',o:[['B','B · dark, night sky'],['A','A · silver shelf']]}
];
function D2(){return window.GJ_DEC||null}
function rowFromSpec(s){
  if(s&&s.get&&s.apply)return s;
  if(!s)return null;
  if(s.ls)return lsRow(s.ls,s.label,s.min,s.max,s.def,s.scale||1,s.after);
  if(s.key||s.k){var key=s.key||s.k;if(key.indexOf('gj.')===0)return lsRow(key,s.label,s.min,s.max,s.def!=null?s.def:100,s.scale||1,s.after);
    return tuneRow(key,s.label,s.min,s.max,s.def!=null?s.def:(D[key]!=null?D[key]:1),s.note)}
  return null;
}
function moduleRows(mod){
  if(!mod||!mod.tune||!mod.tune.length)return null;
  var out=[];mod.tune.forEach(function(s){var r=rowFromSpec(s);if(r)out.push(r)});
  return out.length?out:null;
}
function ctx(){
  var st=(window.__u1&&__u1.cur)||{lv:0,k:null,id:null};
  var pinned=document.documentElement.getAttribute('data-tn-room');
  var room=pinned||((st.lv>0&&st.k)?String(st.k):'sky');
  var lv=st.lv||0;
  var levelName=pinned?'':(lv===0?'sky':lv===1?'mid':lv===2?'board':lv===3?'work':'');
  var mod=(window.__shell&&__shell.mod)||(window.Shell&&Shell.mod)||null;
  return {room:room,lv:lv,levelName:levelName,mod:mod,st:st};
}
function roomById(id){for(var i=0;i<ROOMS.length;i++)if(ROOMS[i].id===id)return ROOMS[i];return null}
function contextRows(c){
  var R=roomById(c.room);
  var rows=null;
  if(c.mod&&c.mod.chapter===c.room)rows=moduleRows(c.mod);
  if(!rows&&R)rows=R.rows;
  if(!rows)return [];
  var focus=CTX_FOCUS[c.room];
  if(!focus)return rows.slice();
  /* if the module supplied rows, show those as the context set; otherwise the focused subset */
  if(c.mod&&c.mod.chapter===c.room&&c.mod.tune)return rows.slice();
  return rows.filter(function(r){return focus.indexOf(r.k)>=0});
}
/* rooms whose sliders are only saved here: nothing in this shell reads them yet */
var OFF_NOTE='not active here · saved only';
function isOff(id){var R=roomById(id);return !!(R&&R.off)}
var PTR=null,HOLD=false,kbT=0,unfoldT=0,CFOCUS=null;
var MARK='#crumb .sig,#omark,.lab-top .sig,[data-tn-mark]';
function markEl(){return document.querySelector(MARK)}
function dial(){return window.GJ_DIAL||window.GJ_GHOST||null}
/* the ghost dial is every slider's default feedback: while a slider is held the whole drawer hides
   and the arc shows the value at a free screen edge. dial.js adds gd-away only when the arc can sit;
   a held slider hides the drawer either way. Do not clear gd-away here. */
function ghost(r,info){
  var d=dial();if(!d||!menu)return;
  var b=r.getBoundingClientRect(),p=HOLD&&PTR?PTR:{x:b.left+b.width/2,y:b.top+b.height/2};info.x=p.x;info.y=p.y;
  d.update(info);
  if(HOLD)menu.classList.add('gd-away');
  if(!HOLD){clearTimeout(kbT);kbT=setTimeout(function(){d.release()},400)}
}
var menu=null,open=false,tuneOn=false,allOn=false,hooked=false;
/* Public launch is A, constellation, in every room. B (contact strip) and C (ghost) stay in
   this file, archived. A public ?v= or ?drawer=, and a stored gj.drawer, never leave A.
   B and C apply only on a load that has ?dev=1: the dev toggle, or ?drawer= / ?v= on that load.
   Dev rows elsewhere still hide when gj.dev is 0 (?dev=0). */
function devDrawer(){return /(?:^|[?&])dev=1(?:&|$)/.test(location.search)}
function qDrawer(){var q=/(?:^|[?&])(?:drawer|v)=([ABCabc])(?:&|$)/.exec(location.search);return q?q[1].toUpperCase():''}
var DV=(function(){
  if(!devDrawer())return 'A';
  var q=qDrawer();
  if(q==='A'||q==='B'||q==='C'){wr('gj.drawer',q);return q}
  try{var v=localStorage.getItem('gj.drawer');if(v==='A'||v==='B'||v==='C')return v}catch(e){}
  return 'A'})();
function devOn(){var q=/(?:^|[?&])dev=([01])(?:&|$)/.exec(location.search);if(q)wr('gj.dev',q[1]);return rd('gj.dev',0)!==0}
var RMQ=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):null;function rmOn(){return !!(RMQ&&RMQ.matches)}
var foldT=0;
function setDrawer(v){if(!devDrawer())v='A';DV=v==='B'||v==='C'?v:'A';if(devDrawer())wr('gj.drawer',DV);if(menu){menu.classList.remove('dv-A','dv-B','dv-C');menu.classList.add('dv-'+DV)}}
function planes(){if(!menu)return;var i=0,list=[].slice.call(menu.querySelectorAll('.mm-3d>nav,.mm-plate>*'));
  list.forEach(function(el){el.style.setProperty('--i',String(i));el.style.setProperty('--z',(Math.max(0,3-i)*7-6)+'px');i++});menu.style.setProperty('--n',String(i))}
function origin(){if(!menu)return;var m=markEl(),r=m&&m.getBoundingClientRect(),b=menu.getBoundingClientRect();
  if(!r||!r.width)return;menu.style.setProperty('--ox',(r.left+r.width/2-b.left).toFixed(0)+'px');menu.style.setProperty('--oy',(r.top+r.height/2-b.top+menu.scrollTop).toFixed(0)+'px')}
function parallax(x,y){if(!menu||!open||HOLD)return;var px=Math.max(-1,Math.min(1,(x/innerWidth-.5)*2)),py=Math.max(-1,Math.min(1,(y/innerHeight-.5)*2));
  menu.style.setProperty('--px',px.toFixed(3));menu.style.setProperty('--py',py.toFixed(3))}
function abs(path){
  var s=document.querySelector('script[data-tn-root]');
  var root=(s&&s.getAttribute('data-tn-root'))||'../';
  try{return new URL(root+path,location.href).pathname}catch(e){return root+path}
}
function goRoom(name){
  if(window.__depth){__depth.goTo(name);return}
  var dest={sky:'fable-m4/',film:'fable-m4/',sound:'fable-m4/'}[name];
  if(!dest)return;
  location.href=abs(dest)+(name==='sky'?'':'#'+name);
}
function safelight(){
  var G=D2(),el=document.getElementById('safelight');
  if(!el){el=document.createElement('div');el.id='safelight';el.setAttribute('aria-hidden','true');(document.getElementById('stage')||document.body).appendChild(el)}
  var on=G&&+G.get('safelight')===1,k=G?Math.max(0,Math.min(100,+G.get('safeK')))/100:0.6;
  el.hidden=!on;el.style.setProperty('--safe',on?String(k):'0');
}
function outside(e){return !e.target.closest('#markmenu,'+MARK+',#marktune,.mm-tune-btn')}
function build(){
  menu=document.createElement('div');menu.id='markmenu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-label','the mark menu');
  menu.className='dv-'+DV;
  menu.innerHTML='<div class="mm-3d"><nav class="mm-top"><a data-href="fable-m4/list/" href="list/">list</a><a data-href="fable-m4/contact/" href="contact/">contact</a><button type="button" class="mm-tune" aria-expanded="false">tune</button></nav>'+
    '<nav class="mm-rooms" aria-label="rooms"><button type="button" data-go="sky">sky</button><button type="button" data-go="film">film</button><button type="button" data-go="sound">sound</button><a data-href="objects/" data-room="objects" href="../objects/">objects</a><a data-href="spaces/forest-garden/" data-room="spaces" href="../spaces/forest-garden/">spaces</a></nav>'+
    '<div class="mm-plate" hidden></div></div>';
  document.body.appendChild(menu);
  menu.querySelectorAll('[data-href]').forEach(function(a){a.setAttribute('href',abs(a.getAttribute('data-href')))});
  addEventListener('pointermove',function(e){parallax(e.clientX,e.clientY)},{passive:true});
  menu.addEventListener('pointerdown',function(e){e.stopPropagation()});
  menu.addEventListener('click',function(e){
    e.stopPropagation();
    var roomA=e.target.closest('[data-room]');
    if(roomA&&roomA.getAttribute('data-room')===ctx().room){e.preventDefault();return}
    var b=e.target.closest('[data-go]');
    if(b){goRoom(b.getAttribute('data-go'));return}
    var vb=e.target.closest('[data-snd-var]');
    if(vb){setSndVar(vb.getAttribute('data-snd-var'));paint();return}
    if(e.target.closest('.mm-tune')){tuneOn=!tuneOn;paint();return}
    if(e.target.closest('.mm-all')){allOn=!allOn;paint();return}
    if(e.target.closest('.mm-reset-room')){resetRoom();return}
    if(e.target.closest('.mm-reset')){reset();return}
    var tb2=e.target.closest('[data-theme-set]');
    if(tb2&&window.GJ_THEME){GJ_THEME.set(tb2.getAttribute('data-theme-set'));paint();return}
    var sb=e.target.closest('[data-seg-k]');
    if(sb){var srow=findRow(sb.getAttribute('data-seg-k'));if(srow)srow.apply(sb.getAttribute('data-v'),true);paint();return}
    var dvb=e.target.closest('[data-drawer]');
    if(dvb){CFOCUS=null;setDrawer(dvb.getAttribute('data-drawer'));paint();return}
    var cf=e.target.closest('[data-cfocus]');
    if(cf){CFOCUS=cf.getAttribute('data-cfocus');paint();return}
    var vb2=e.target.closest('[data-var]');
    if(vb2&&window.GJ_VAR){GJ_VAR.set(vb2.getAttribute('data-var-room'),vb2.getAttribute('data-var'));paint();return}
    var db=e.target.closest('[data-dec]');
    if(db&&D2()){D2().set(db.getAttribute('data-dec'),db.getAttribute('data-v'));safelight();paint();return}
  });
  menu.addEventListener('input',function(e){
    var dr=e.target.closest('input[data-dec-r]');
    if(dr&&D2()){var dk=dr.getAttribute('data-dec-r');D2().set(dk,+dr.value);var dd=(D2().defaults&&D2().defaults()||{})[dk];ghost(dr,{name:(dr.getAttribute('aria-label')||dk).replace(/,.*$/,''),min:+dr.min,max:+dr.max,def:dd,value:+dr.value});var oo=dr.parentNode.querySelector('output');if(oo)oo.textContent=dk==='safeK'?(dr.value/100).toFixed(2):dr.value;if(dk==='safeK')safelight();return}
    var r=e.target.closest('input[data-k]');if(!r)return;
    var row=findRow(r.getAttribute('data-k'));if(!row)return;
    if(window.GJ_THEME)GJ_THEME.adjust(roomOfRow(row.k),{label:row.label,value:+r.value});
    ghost(r,{name:row.label,min:row.min,max:row.max,def:row.def,value:+r.value});
    var v=+r.value;
    if(row.k.indexOf('gj.tune.')===0)wr(row.k,v);
    row.apply(v,true);
    var o=r.parentNode.querySelector('output');if(o)o.textContent=v;
  });
  menu.addEventListener('pointerdown',function(e){
    PTR={x:e.clientX,y:e.clientY};
    var r=e.target.closest('input[type=range]');if(!r)return;
    HOLD=true;menu.classList.add('gd-away');
    var row=findRow(r.getAttribute('data-k')||'');
    var info=row?{name:row.label,min:row.min,max:row.max,def:row.def,value:+r.value}
      :{name:(r.getAttribute('aria-label')||'value').replace(/,.*$/,''),min:+r.min,max:+r.max,def:+r.value,value:+r.value};
    ghost(r,info);
  },true);
  menu.addEventListener('pointermove',function(e){if(HOLD)PTR={x:e.clientX,y:e.clientY}},true);
  function letGo(){
    var d=dial();
    var hidden=!!(menu&&menu.classList.contains('gd-away'));
    HOLD=false;
    /* do not strip gd-away or mm-peek: dial.js owns the hide and clears gd-away after the arc is gone.
       mm-in stays, so the drawer is already "open" when the arc gives it back. mm-back only refolds the
       planes while they are invisible, and comes off as they fade in, which replays the unfold. */
    if(hidden&&open&&menu&&!rmOn())menu.classList.add('mm-back');
    if(d)d.release();
    if(!(hidden&&open&&menu))return;
    clearInterval(unfoldT);var n=0;
    unfoldT=setInterval(function(){
      if(!menu||!open){clearInterval(unfoldT);return}
      if(menu.classList.contains('gd-away')&&++n<40)return;
      clearInterval(unfoldT);
      if(!open)return;
      menu.classList.remove('mm-back');
      menu.classList.add('mm-in');
    },40);
  }
  ['pointerup','pointercancel','touchend','touchcancel'].forEach(function(n){addEventListener(n,letGo,true)});addEventListener('blur',letGo);
  menu.addEventListener('keydown',function(e){if(e.key==='Escape'){e.stopPropagation();show(false)}});
  /* a touch outside closes the drawer and is only that: the following click never reaches the room */
  var SWALLOW=0;
  var NAVK={ArrowLeft:1,ArrowRight:1,ArrowUp:1,ArrowDown:1,PageUp:1,PageDown:1,Home:1,End:1};
  addEventListener('keydown',function(e){
    if(!open||!(e.key==='Escape'||NAVK[e.key]))return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();show(false);
  },true);
  addEventListener('wheel',function(e){
    if(!open)return;
    e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();show(false);
  },{capture:true,passive:false});
  document.addEventListener('pointerdown',function(e){if(open&&outside(e)){SWALLOW=Date.now()+1500;window.__gjNavSwallow=SWALLOW;show(false)}},true);
  document.addEventListener('click',function(e){if(SWALLOW&&Date.now()<SWALLOW&&outside(e)){SWALLOW=0;e.stopPropagation();e.preventDefault()}},true);
}
function findRow(k){for(var i=0;i<ROOMS.length;i++)for(var j=0;j<ROOMS[i].rows.length;j++)if(ROOMS[i].rows[j].k===k)return ROOMS[i].rows[j];
  var mod=(window.__shell&&__shell.mod)||(window.Shell&&Shell.mod)||null;
  var extra=moduleRows(mod);if(extra)for(var i=0;i<extra.length;i++)if(extra[i].k===k)return extra[i];
  return null}
function roomOfRow(k){for(var i=0;i<ROOMS.length;i++)for(var j=0;j<ROOMS[i].rows.length;j++)if(ROOMS[i].rows[j].k===k)return ROOMS[i].id;
  var m=(window.__shell&&__shell.mod)||null;return m&&m.chapter||null}
function rowsHtml(rows){
  var h='';rows.forEach(function(r){
    if(r.dev&&!devOn())return;
    if(r.toggle){
      h+='<div class="mm-seg" role="radiogroup" aria-label="'+r.label+'"><b>'+r.label+'</b><span>';
      r.options.forEach(function(o){h+='<button type="button" role="radio" aria-checked="'+(r.get()===o)+'" data-snd-var="'+o+'">'+o+'</button>'});
      h+='</span></div>';
      if(r.hint)h+='<p class="mm-hint">'+r.hint()+'</p>';
      return;
    }
    if(r.seg){var sv=String(r.get());h+='<div class="mm-seg mm-rowseg'+(r.dev?' mm-devrow':'')+'"><b>'+r.label+(r.dev?' <em>dev</em>':'')+'</b><span role="radiogroup" aria-label="'+r.label+'">';
      r.seg.forEach(function(o){h+='<button type="button" role="radio" aria-checked="'+(sv===o[0])+'" data-seg-k="'+r.k+'" data-v="'+o[0]+'">'+o[1]+'</button>'});h+='</span></div>';return}
    if(DV==='C'&&CFOCUS!==r.k){h+='<button type="button" class="mm-clab" data-cfocus="'+r.k+'">'+r.label+'</button>';return}
    var v=r.get();
    h+='<label><span>'+r.label+'</span><input type="range" min="'+r.min+'" max="'+r.max+'" step="1" value="'+v+'" data-k="'+r.k+'" aria-label="'+r.label+'"><output>'+v+'</output></label>'});
  return h;
}
function paint(){
  if(!menu)return;
  var sndR=roomById('sound');if(sndR)sndR.rows=soundRows();
  var pl=menu.querySelector('.mm-plate'),tb=menu.querySelector('.mm-tune');
  tb.setAttribute('aria-expanded',tuneOn?'true':'false');tb.classList.toggle('on',tuneOn);
  pl.hidden=!tuneOn;if(!tuneOn){planes();return}
  var c=ctx(),here=c.room,level=c.levelName;
  var title=here+(level&&level!==here?' · '+level:'');
  var offHere=isOff(here)&&!(c.mod&&c.mod.chapter===here&&c.mod.tune);
  var h='<section class="mm-ctx'+(offHere?' mm-off-room':'')+'"><h3>'+title+' <span>here</span>'+(offHere?' <em>'+OFF_NOTE+'</em>':'')+'</h3>';
  var ctxRows=contextRows(c);if(DV==='C')ctxRows=ctxRows.slice(0,4);
  h+=rowsHtml(ctxRows);
  /* Film room pass: A/B/C variant toggle, only in a room that has variants (js/variants.js). */
  var GV=window.GJ_VAR;
  if(GV&&GV.has(here)){var av=GV.get(here),VR=GV.rooms[here];
    h+='<div class="mm-seg mm-var" role="radiogroup" aria-label="variant (dev)"><b>variant <em>dev · '+av+': '+VR[av].split(' · ')[0]+'</em></b><span>';
    ['A','B','C'].forEach(function(o){if(VR[o])h+='<button type="button" role="radio" aria-checked="'+(av===o)+'" data-var="'+o+'" data-var-room="'+here+'" title="'+VR[o]+'">'+o+'</button>'});
    h+='</span></div>';}
  h+='</section>';
  h+='<button type="button" class="mm-all" aria-expanded="'+(allOn?'true':'false')+'">'+(allOn?'close rooms':'all rooms')+'</button>';
  if(allOn){
    h+='<div class="mm-more">';
    ROOMS.forEach(function(R){
      if(R.id===here)return;
      h+='<section class="mm-room'+(R.off?' mm-off-room':'')+'"><h3>'+R.name+(R.off?' <em>'+OFF_NOTE+'</em>':'')+'</h3>';
      h+=rowsHtml(R.rows);
      h+='</section>';
    });
    h+='<section class="mm-dec"><h3>decisions <em>the hero opener keeps the full mark in every mode; the Sound waveform player is in every combination</em></h3>';
    var G=D2();
    DECS.forEach(function(d){
      var v=G?G.get(d.k):'';
      h+='<div class="mm-seg" role="radiogroup" aria-label="'+d.n+'"><b>'+d.n+'</b><span>';
      d.o.forEach(function(o){h+='<button type="button" role="radio" aria-checked="'+(v===o[0])+'" data-dec="'+d.k+'" data-v="'+o[0]+'">'+o[1]+'</button>'});
      h+='</span></div>';
    });
    h+='</section></div>';
  }
  var G=D2();
  var mot=G?G.get('motion'):100,snap=G?G.get('snapAt'):34,sl=G?+G.get('safelight'):0,sk=G?+G.get('safeK'):60,rv=G?+G.get('ripples'):1;
  if(devDrawer()){h+='<section class="mm-devsec"><h3>dev</h3><p class="mm-devnote">archived · drawer '+DV+' · public stays A</p><div class="mm-seg"><b>drawer</b><span role="radiogroup" aria-label="drawer">';
    [['A','A · constellation'],['B','B · contact strip'],['C','C · ghost']].forEach(function(o){h+='<button type="button" role="radio" aria-checked="'+(DV===o[0])+'" data-drawer="'+o[0]+'">'+o[1]+'</button>'});h+='</span></div></section>'}
  h+='<section class="mm-globals"><h3>globals</h3>';
  var TH=window.GJ_THEME,tp=TH?TH.pref:'night';
  if(TH)h+='<div class="mm-seg mm-theme"><b>colour mode'+(TH.exempt(here)?' <em>this room keeps its own look</em>':'')+'</b><span role="radiogroup" aria-label="colour mode"><button type="button" role="radio" aria-checked="'+(tp==='night')+'" data-theme-set="night">night</button><button type="button" role="radio" aria-checked="'+(tp==='red')+'" data-theme-set="red">red</button></span></div>';
  h+='<label><span>motion</span><input type="range" min="0" max="200" step="1" value="'+mot+'" data-dec-r="motion" aria-label="motion"><output>'+mot+'</output></label>';
  h+='<label><span>snap threshold</span><input type="range" min="15" max="70" step="1" value="'+snap+'" data-dec-r="snapAt" aria-label="snap threshold"><output>'+snap+'</output></label>';
  h+='<div class="mm-seg"><b>safelight (warm edge glow)</b><span><button type="button" role="radio" aria-checked="'+(sl===0)+'" data-dec="safelight" data-v="0">off</button><button type="button" role="radio" aria-checked="'+(sl===1)+'" data-dec="safelight" data-v="1">on</button></span></div>';
  h+='<label><span>safelight strength</span><input type="range" min="0" max="100" step="1" value="'+sk+'" data-dec-r="safeK" aria-label="safelight strength, 0 to 1"><output>'+(sk/100).toFixed(2)+'</output></label>';
  h+='<div class="mm-seg"><b>ripples (water)</b><span><button type="button" role="radio" aria-checked="'+(rv===1)+'" data-dec="ripples" data-v="1">on</button><button type="button" role="radio" aria-checked="'+(rv===0)+'" data-dec="ripples" data-v="0">off</button></span></div>';
  h+='</section>';
  h+='<p class="mm-foot"><span class="mm-resets"><button type="button" class="mm-reset mm-reset-room">reset '+here+'</button><button type="button" class="mm-reset">reset all</button></span></p>';
  pl.innerHTML=h;planes();
  menu.querySelectorAll('.mm-rooms [data-go],.mm-rooms [data-room]').forEach(function(el){
    var id=el.getAttribute('data-go')||el.getAttribute('data-room');
    el.classList.toggle('on',id===here);
  });
}
function resetRoom(){
  var c=ctx(),R=roomById(c.room);
  var all=(c.mod&&c.mod.chapter===c.room&&moduleRows(c.mod))||(R?R.rows:contextRows(c));
  all=all.filter(function(r){return !r.dev});
  all.forEach(function(r){rm(r.k)});
  all.forEach(function(r){r.apply(r.get(),true)});
  poke('gj.vol');poke('gj.sound.invert');setFlash();
  paint();
}
function reset(){
  ROOMS.forEach(function(R){R.rows.forEach(function(r){if(r.dev)return;rm(r.k)})});
  var extra=moduleRows((window.__shell&&__shell.mod)||(window.Shell&&Shell.mod));
  if(extra)extra.forEach(function(r){if(r.dev)return;rm(r.k);if(r.apply)r.apply(r.get(),true)});
  if(T())T().reset();
  if(D2())D2().reset();
  poke('gj.vol');poke('gj.sound.invert');setFlash();safelight();
  paint();
}
function show(on){
  if(!menu)build();
  var was=open;open=!!on;
  [].forEach.call(document.querySelectorAll('#marktune,.mm-tune-btn'),function(b){b.setAttribute('aria-expanded',open?'true':'false')});
  var s=markEl();if(s&&s.hasAttribute('aria-expanded'))s.setAttribute('aria-expanded',open?'true':'false');
  document.documentElement.classList.toggle('mm-open',open);
  clearTimeout(foldT);
  if(open){
    menu.classList.remove('mm-in','mm-folding');menu.hidden=false;paint();origin();
    void menu.offsetWidth;
    requestAnimationFrame(function(){requestAnimationFrame(function(){if(open){origin();menu.classList.add('mm-in')}})});
    if(history.state&&history.state.u1&&!history.state.mm&&!window.__gjMmFromPop){
      try{history.pushState({u1:1,cur:history.state.cur,n:history.state.n,mm:1},'',location.hash);window.__gjMmSent=1}catch(err){}
    }
  }else if(was&&!menu.hidden){
    CFOCUS=null;
    try{
      window.__gjCamHold=Date.now()+900;
      var sc=window.__u1&&__u1.cur;
      if(sc)window.__gjCamSnap=JSON.stringify({lv:sc.lv,k:sc.k,id:sc.id,b:sc.b?1:0,cards:sc.cards?1:0});
    }catch(e){}
    menu.classList.add('mm-folding');menu.classList.remove('mm-in');HOLD=false;
    if(window.__gjMmSent&&history.state&&history.state.mm&&!window.__gjMmFromPop){
      window.__gjMmPop=1;window.__gjMmSent=0;
      try{history.back()}catch(err){}
    }
    var d=dial();if(d&&d.hide)d.hide();
    foldT=setTimeout(function(){if(!open){menu.hidden=true;menu.classList.remove('mm-folding')}},rmOn()?240:640);
  }else menu.hidden=true;
}
function hookLadder(){
  if(hooked)return;hooked=true;var last='';
  setInterval(function(){if(!(open&&tuneOn))return;var s=window.__u1?JSON.stringify([__u1.cur.lv,__u1.cur.k,__u1.cur.b]):'';if(s!==last){last=s;paint()}},250);
}
function restore(){
  var t=T();if(t){var o={},any=false;
    ['mood','map','stars','starS','starG','lineA','fdens','fgap'].forEach(function(k){var v=rd('gj.tune.'+k,null);if(v!=null&&D[k]!=null){o[k]=D[k]*v/100;any=true}});
    if(any)t.set(o)}
  setFlash();
  safelight();
}
function addVariant(room,row){
  var R=roomById(room);
  if(!R){R={id:room,name:room,rows:[]};ROOMS.push(R)}
  R.rows=R.rows.filter(function(r){return r.k!==row.k});
  R.rows.unshift(row);
  var f=CTX_FOCUS[room];
  if(f&&f.indexOf(row.k)<0)f.unshift(row.k);
  if(open&&tuneOn)paint();
}
var tries=0;(function wait(){if(window.__u1&&__u1.ready){restore();hookLadder();return}if(++tries<40)setTimeout(wait,50);else{restore();hookLadder()}})();
if(window.GJ_THEME)GJ_THEME.on(function(w){if(w!=='adj'&&open&&tuneOn)paint()});
/* The + beside the mark opens the drawer. Rooms that already have #marktune keep it.
   The mark itself is one step up; this control is the only thing that opens the drawer. */
function armTune(){
  [].forEach.call(document.querySelectorAll(MARK),function(m){
    if(!m.parentNode)return;
    if(m.parentNode.querySelector('#marktune,.mm-tune-btn'))return;
    var b=document.createElement('button');
    b.type='button';b.className='mm-tune-btn';
    if(!document.getElementById('marktune'))b.id='marktune';
    b.setAttribute('aria-label','drawer');
    b.setAttribute('aria-haspopup','dialog');
    b.setAttribute('aria-expanded','false');
    b.textContent='+';
    b.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      show(!open);
    },true);
    m.insertAdjacentElement('afterend',b);
  });
}
var tuneN=0;(function tuneWait(){armTune();if(++tuneN<40)setTimeout(tuneWait,100)})();
window.GJ_MARKMENU={toggle:function(){show(!open)},show:show,get open(){return open},
  variant:addVariant,
  context:function(){return ctx()},
  rooms:function(){return ROOMS.map(function(R){return {id:R.id,rows:R.rows.map(function(r){return r.label})}})}};
})();
