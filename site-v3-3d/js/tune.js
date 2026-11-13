/* site-v3-3d · the mark's tune drawer.
   Tap the mark (ᑕᐣᓯ) to unfold it. Sky sliders ease the real sky. Ghost arc (gold tick) while a slider is held;
   the drawer hides until release, then unfolds again.
   Full state rides on ?tune=<base64url JSON> (short keys, v). Unknown keys are ignored. Every value is clamped.
   Copy settings link, and postMessage: parent {type:'gj-tune-get'} -> {type:'gj-tune-state', state, url}.
   The page posts gj-tune-state on every change. Messages are accepted only from this origin.
   ?v=A|B|C or ?drawer=A|B|C, localStorage gj.drawer. Reduce Motion: same final state, no unfold motion.
   Active chrome is warm white #e8e4dc. Gold only on the ghost dial. */
(function(){
'use strict';
function rd(k,d){try{var v=localStorage.getItem(k);if(v==null||v==='')return d;return v}catch(e){return d}}
function wr(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}
function rn(k,d){var v=+rd(k,d);return isFinite(v)?v:d}
function rm(k){try{localStorage.removeItem(k)}catch(e){}}
function rmOn(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function markEl(){var a=[].slice.call(document.querySelectorAll('.gj-mark'));
  for(var i=0;i<a.length;i++){var r=a[i].getBoundingClientRect();if(r.width&&r.height&&r.bottom>0&&r.top<innerHeight)return a[i]}
  return a[0]||null}
function clampInt(n,a,b){n=+n;if(!isFinite(n))return null;return Math.max(a,Math.min(b,Math.round(n)))}
function embedded(){try{return window.parent!==window}catch(e){return false}}

var RANGES=[
  {k:'mood',s:'m',label:'mood',min:0,max:200,def:100,sky:1},
  {k:'starG',s:'g',label:'glow',min:0,max:200,def:100,sky:1},
  {k:'stars',s:'st',label:'stars',min:40,max:180,def:100,sky:1},
  {k:'starS',s:'sz',label:'star size',min:50,max:200,def:100,sky:1},
  {k:'lineA',s:'ln',label:'lines',min:0,max:200,def:100,sky:1},
  {k:'depth',s:'d',label:'depth',min:40,max:200,def:100,sky:1},
  {k:'glitch',s:'gl',label:'glitch',min:0,max:100,def:0},
  {k:'glitchSpd',s:'gs',label:'glitch speed',min:0,max:200,def:100},
  {k:'light',s:'la',label:'light angle',min:0,max:360,def:210},
  {k:'motion',s:'mo',label:'motion',min:0,max:200,def:100},
  {k:'snapAt',s:'sn',label:'snap threshold',min:15,max:70,def:34},
  {k:'safeK',s:'sk',label:'safelight strength',min:0,max:100,def:60}
];
var ROWS=RANGES.filter(function(r){return r.sky});
function rangeOf(k){for(var i=0;i<RANGES.length;i++)if(RANGES[i].k===k)return RANGES[i];return null}
function num(k){var r=rangeOf(k);if(!r)return 0;return clampInt(rn('gj.tune.'+k,r.def),r.min,r.max)}
function colour(){return rd('gj.tune.colour','night')==='red'?'red':'night'}
function safelight(){return rn('gj.tune.safelight',0)===1}
function ripples(){return rn('gj.tune.ripples',1)!==0}

var q=location.search,DV=(function(){
  var m=/(?:^|[?&])(?:drawer|v)=([ABC])(?:&|$)/.exec(q);if(m){wr('gj.drawer',m[1]);return m[1]}
  var v=rd('gj.drawer','A');return v==='B'||v==='C'?v:'A'})();
/* stash ?v=frames for the later film-frame experiment; do not treat it as a drawer look */
if(/(?:^|[?&])v=frames(?:&|$)/.test(q))wr('gj.v','frames');

function b64urlEncode(obj){
  var json=JSON.stringify(obj),bytes;
  try{bytes=new TextEncoder().encode(json)}catch(e){bytes=null}
  var bin='';
  if(bytes){for(var i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i])}
  else{try{bin=unescape(encodeURIComponent(json))}catch(e2){return ''}}
  return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function b64urlDecode(s){
  try{
    s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');
    while(s.length%4)s+='=';
    var bin=atob(s),bytes=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    var json;try{json=new TextDecoder().decode(bytes)}catch(e){json=decodeURIComponent(escape(bin))}
    var o=JSON.parse(json);
    return o&&typeof o==='object'?o:null;
  }catch(e){return null}
}
function tuneRaw(){
  var m=/(?:^|[?&])tune=([^&#]+)/.exec(location.search);
  if(!m)return null;
  var s=m[1];try{s=decodeURIComponent(s)}catch(e){}
  return b64urlDecode(s);
}
function bit(v){
  if(v===1||v==='1'||v===true)return 1;
  if(v===0||v==='0'||v===false)return 0;
  return null;
}
function applyIncoming(raw){
  if(!raw||typeof raw!=='object')return;
  RANGES.forEach(function(r){
    if(!Object.prototype.hasOwnProperty.call(raw,r.s))return;
    var v=clampInt(raw[r.s],r.min,r.max);
    if(v==null)return;
    wr('gj.tune.'+r.k,v);
  });
  if(raw.c==='night'||raw.c==='red')wr('gj.tune.colour',raw.c);
  var sf=bit(raw.sf);if(sf!=null)wr('gj.tune.safelight',sf);
  var rp=bit(raw.rp);if(rp!=null)wr('gj.tune.ripples',rp);
  if(raw.dv==='A'||raw.dv==='B'||raw.dv==='C'){DV=raw.dv;wr('gj.drawer',DV);if(menu)setDrawer(DV)}
}
function compact(){
  var o={v:1};
  RANGES.forEach(function(r){o[r.s]=num(r.k)});
  o.c=colour();o.sf=safelight()?1:0;o.rp=ripples()?1:0;o.dv=DV;
  return o;
}
function named(){
  return {v:1,
    mood:num('mood'),glow:num('starG'),stars:num('stars'),starSize:num('starS'),lines:num('lineA'),depth:num('depth'),
    glitch:num('glitch'),glitchSpeed:num('glitchSpd'),lightAngle:num('light'),motion:num('motion'),snap:num('snapAt'),
    colour:colour(),safelight:safelight()?1:0,safelightStrength:num('safeK'),ripples:ripples()?1:0,drawer:DV};
}
function link(){
  try{
    var u=new URL(location.href);
    u.searchParams.set('tune',b64urlEncode(compact()));
    u.hash='';
    return u.href;
  }catch(e){return location.href}
}
function writeTuneUrl(){
  try{
    var u=new URL(location.href);
    u.searchParams.set('tune',b64urlEncode(compact()));
    var next=u.pathname+u.search+u.hash;
    if(next!==location.pathname+location.search+location.hash)history.replaceState(history.state,'',next);
  }catch(e){}
}
function publish(){
  var msg={type:'gj-tune-state',state:named(),url:link()};
  if(window.parent&&window.parent!==window){try{window.parent.postMessage(msg,location.origin)}catch(e){}}
}
function fxNodes(){
  var s=document.getElementById('gj-safe');
  if(!s){s=document.createElement('div');s.id='gj-safe';s.setAttribute('aria-hidden','true');document.body.appendChild(s)}
  var g=document.getElementById('gj-glitch');
  if(!g){g=document.createElement('div');g.id='gj-glitch';g.setAttribute('aria-hidden','true');document.body.appendChild(g)}
}
function applyFx(){
  fxNodes();
  var root=document.documentElement,c=colour(),safe=safelight()?num('safeK')/100:0,gl=num('glitch')/100;
  root.setAttribute('data-gj-c',c);
  root.setAttribute('data-gj-ripples',ripples()?'1':'0');
  root.classList.toggle('gj-glitch-on',gl>0);
  root.style.setProperty('--gj-la',num('light')+'deg');
  root.style.setProperty('--gj-safe',safe.toFixed(3));
  root.style.setProperty('--gj-gl',gl.toFixed(3));
  root.style.setProperty('--gj-gs',String(Math.max(0.35,num('glitchSpd')/100)));
  var ink=c==='red'?'168,72,68':'232,228,220';
  root.style.setProperty('--gd-ink',ink);
  var ghostEl=document.getElementById('ghostdial');
  if(ghostEl)ghostEl.style.setProperty('--gd-ink',ink);
}
function applyAll(){
  var o={},i;for(i=0;i<ROWS.length;i++)o[ROWS[i].k]=num(ROWS[i].k)/100;
  if(window.GJ_V33D)GJ_V33D.set(o);
  applyFx();
  publish();
}
function resetAll(){
  RANGES.forEach(function(r){rm('gj.tune.'+r.k)});
  rm('gj.tune.colour');rm('gj.tune.safelight');rm('gj.tune.ripples');
  applyAll();writeTuneUrl();
}

var HAD=tuneRaw();
applyIncoming(HAD);

var menu=null,open=false,HOLD=false,PTR=null,foldT=0,SWALLOW=0,kbT=0;

function setDrawer(v){DV=v==='B'||v==='C'?v:'A';wr('gj.drawer',DV);if(menu){menu.className=(menu.className.replace(/dv-[ABC]/g,'')+' dv-'+DV).trim()}writeTuneUrl();publish()}
function planes(){if(!menu)return;var i=0,list=[].slice.call(menu.querySelectorAll('.mm-3d>nav,.mm-plate>*'));
  list.forEach(function(el){el.style.setProperty('--i',String(i));el.style.setProperty('--z',(Math.max(0,3-i)*7-6)+'px');i++});menu.style.setProperty('--n',String(i))}
function origin(){if(!menu)return;var m=markEl(),r=m&&m.getBoundingClientRect(),b=menu.getBoundingClientRect();
  if(!r||!r.width)return;menu.style.setProperty('--ox',(r.left+r.width/2-b.left).toFixed(0)+'px');menu.style.setProperty('--oy',(r.top+r.height/2-b.top+menu.scrollTop).toFixed(0)+'px')}
function parallax(x,y){if(!menu||!open||HOLD)return;
  menu.style.setProperty('--px',(Math.max(-1,Math.min(1,(x/innerWidth-.5)*2))).toFixed(3));
  menu.style.setProperty('--py',(Math.max(-1,Math.min(1,(y/innerHeight-.5)*2))).toFixed(3))}

function ghost(r,info){if(!window.GJ_GHOST||!menu)return;
  var b=r.getBoundingClientRect(),p=HOLD&&PTR?PTR:{x:b.left+b.width/2,y:b.top+b.height/2};info.x=p.x;info.y=p.y;
  GJ_GHOST.update(info);menu.classList.toggle('mm-peek',HOLD);
  if(!HOLD){clearTimeout(kbT);kbT=setTimeout(function(){GJ_GHOST.release()},400)}}

function sliderHtml(row){var v=num(row.k);
  return '<label><span>'+row.label+'</span><input type="range" min="'+row.min+'" max="'+row.max+'" step="1" value="'+v+'" data-k="'+row.k+'" aria-label="'+row.label+'"></label>'}
function seg(label,name,buttons){
  var h='<div class="mm-seg"><b>'+label+'</b><span role="radiogroup" aria-label="'+name+'">';
  buttons.forEach(function(b){h+='<button type="button" role="radio" aria-checked="'+(b.on?'true':'false')+'" '+b.attr+'>'+b.t+'</button>'});
  return h+'</span></div>';
}
function paint(){
  if(!menu)return;
  var top=menu.scrollTop,openName='';
  var cur=menu.querySelector('details.mm-fold[open] summary');if(cur)openName=cur.textContent;
  var pl=menu.querySelector('.mm-plate'),h='<section class="mm-ctx">';
  h+=sliderHtml(rangeOf('mood'));
  h+=sliderHtml(rangeOf('depth'));
  h+=seg('colour mode','colour mode',[
    {t:'night',on:colour()==='night',attr:'data-c="night"'},
    {t:'red',on:colour()==='red',attr:'data-c="red"'}
  ]);
  h+='</section>';
  var sky='';ROWS.forEach(function(row){if(row.k!=='mood'&&row.k!=='depth')sky+=sliderHtml(row)});
  var pic='';RANGES.forEach(function(row){if(!row.sky&&row.k!=='safeK')pic+=sliderHtml(row)});
  pic+=seg('safelight','safelight',[
    {t:'off',on:!safelight(),attr:'data-sf="0"'},
    {t:'on',on:safelight(),attr:'data-sf="1"'}
  ]);
  pic+=sliderHtml(rangeOf('safeK'));
  pic+=seg('ripples','ripples',[
    {t:'on',on:ripples(),attr:'data-rp="1"'},
    {t:'off',on:!ripples(),attr:'data-rp="0"'}
  ]);
  var look=seg('drawer','drawer',[
    {t:'A · constellation',on:DV==='A',attr:'data-drawer="A"'},
    {t:'B · contact strip',on:DV==='B',attr:'data-drawer="B"'},
    {t:'C · ghost',on:DV==='C',attr:'data-drawer="C"'}
  ]);
  var det='<p class="mm-foot"><button type="button" class="mm-copylink">Copy settings link</button><button type="button" class="mm-reset">reset</button><button type="button" class="mm-home">home</button></p>';
  function fold(title,inner){return '<details class="mm-fold"'+(openName===title?' open':'')+'><summary>'+title+'</summary>'+inner+'</details>'}
  h+=fold('Sky',sky)+fold('Picture',pic)+fold('Look',look)+fold('Details',det);
  pl.innerHTML=h;pl.hidden=false;planes();origin();menu.scrollTop=top;
}

function show(on){
  if(!menu)build();
  var was=open;open=!!on;
  document.querySelectorAll('.gj-mark').forEach(function(s){s.setAttribute('aria-expanded',open?'true':'false')});
  document.documentElement.classList.toggle('mm-open',open);
  clearTimeout(foldT);
  if(open){menu.classList.remove('mm-in','mm-folding');menu.hidden=false;paint();origin();void menu.offsetWidth;
    requestAnimationFrame(function(){if(open)menu.classList.add('mm-in')})}
  else if(was&&!menu.hidden){menu.classList.add('mm-folding');menu.classList.remove('mm-in');HOLD=false;menu.classList.remove('mm-peek');
    foldT=setTimeout(function(){if(!open){menu.hidden=true;menu.classList.remove('mm-folding')}},rmOn()?240:640)}
  else menu.hidden=true;
}

function goHome(){show(false);
  if(window.__sheet&&__sheet.isOpen&&__sheet.isOpen()){
    try{__sheet.close({quick:1});if(window.__dive)__dive.go({k:null});scrollTo(0,0)}catch(e){scrollTo({top:0,behavior:rmOn()?'auto':'smooth'})}
  }else scrollTo({top:0,behavior:rmOn()?'auto':'smooth'})}

function copyLink(btn){
  var url=link();writeTuneUrl();
  function done(){if(!btn)return;btn.textContent='Copied';setTimeout(function(){if(btn)btn.textContent='Copy settings link'},1600)}
  function fb(){var t=document.createElement('textarea');t.value=url;t.setAttribute('readonly','');t.style.cssText='position:fixed;left:-9999px;top:0;font-size:16px';document.body.appendChild(t);t.select();t.setSelectionRange(0,url.length);var r=false;try{r=document.execCommand('copy')}catch(e){}t.remove();if(r)done()}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,fb);else fb();
}

function build(){
  menu=document.createElement('div');menu.id='markmenu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-label','the mark menu');
  menu.className='dv-'+DV;
  menu.innerHTML='<div class="mm-3d"><nav class="mm-top"><button type="button" class="mm-tune on" aria-expanded="true">tune</button></nav><div class="mm-plate"></div></div>';
  document.body.appendChild(menu);
  addEventListener('pointermove',function(e){parallax(e.clientX,e.clientY)},{passive:true});
  menu.addEventListener('pointerdown',function(e){e.stopPropagation()});
  menu.addEventListener('click',function(e){
    e.stopPropagation();
    var dvb=e.target.closest('[data-drawer]');if(dvb){setDrawer(dvb.getAttribute('data-drawer'));paint();return}
    var cb=e.target.closest('[data-c]');if(cb){wr('gj.tune.colour',cb.getAttribute('data-c')==='red'?'red':'night');applyAll();writeTuneUrl();paint();return}
    var sb=e.target.closest('[data-sf]');if(sb){wr('gj.tune.safelight',sb.getAttribute('data-sf')==='1'?1:0);applyAll();writeTuneUrl();paint();return}
    var rb=e.target.closest('[data-rp]');if(rb){wr('gj.tune.ripples',rb.getAttribute('data-rp')==='0'?0:1);applyAll();writeTuneUrl();paint();return}
    if(e.target.closest('.mm-copylink')){copyLink(e.target.closest('.mm-copylink'));return}
    if(e.target.closest('.mm-reset')){resetAll();paint();return}
    if(e.target.closest('.mm-home')){goHome();return}
  });
  menu.addEventListener('input',function(e){
    var r=e.target.closest('input[data-k]');if(!r)return;
    var row=rangeOf(r.getAttribute('data-k'));if(!row)return;
    var v=clampInt(r.value,row.min,row.max);if(v==null)return;
    wr('gj.tune.'+row.k,v);applyAll();writeTuneUrl();
    ghost(r,{name:row.label,min:row.min,max:row.max,def:row.def,value:v});
  });
  menu.addEventListener('pointerdown',function(e){PTR={x:e.clientX,y:e.clientY};if(e.target.closest('input[type=range]'))HOLD=true},true);
  menu.addEventListener('pointermove',function(e){if(HOLD)PTR={x:e.clientX,y:e.clientY}},true);
  function letGo(){var was=menu&&menu.classList.contains('mm-peek');HOLD=false;if(menu)menu.classList.remove('mm-peek');if(window.GJ_GHOST)GJ_GHOST.release();
    if(was&&open&&!rmOn()){menu.classList.add('mm-snap');menu.classList.remove('mm-in');void menu.offsetWidth;menu.classList.remove('mm-snap');requestAnimationFrame(function(){if(open)menu.classList.add('mm-in')})}}
  ['pointerup','pointercancel','touchend','touchcancel'].forEach(function(n){addEventListener(n,letGo,true)});addEventListener('blur',letGo);
  addEventListener('keydown',function(e){if(open&&e.key==='Escape'){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();show(false)}},true);
  document.addEventListener('pointerdown',function(e){if(open&&!e.target.closest('#markmenu,.gj-mark')){SWALLOW=Date.now()+1500;show(false)}},true);
  document.addEventListener('click',function(e){if(SWALLOW&&Date.now()<SWALLOW&&!e.target.closest('#markmenu,.gj-mark')){SWALLOW=0;e.stopPropagation();e.preventDefault()}},true);
}

document.addEventListener('click',function(e){
  var m=e.target.closest&&e.target.closest('.gj-mark');if(!m)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  show(!open);
},true);

addEventListener('message',function(e){
  if(e.origin!==location.origin)return;
  var d=e.data;if(!d||d.type!=='gj-tune-get')return;
  var msg={type:'gj-tune-state',state:named(),url:link()};
  try{if(e.source&&e.source.postMessage)e.source.postMessage(msg,e.origin)}catch(err){}
});

applyAll();
if(HAD)writeTuneUrl();
window.GJ_TUNE={version:1,state:named,compact:compact,url:link,
  motion:function(){return num('motion')/100},
  snap:function(){return num('snapAt')},
  ripples:ripples};
window.GJ_MARKMENU={toggle:function(){show(!open)},show:show,get open(){return open},state:named};
if(HAD||embedded())show(true);
})();
