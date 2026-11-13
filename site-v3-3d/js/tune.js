/* site-v3-3d · the mark's tune drawer, ported from the magic-baseline / about-1113 drawer.
   Tap the mark (ᑕᐣᓯ) to unfold the sliders. They ease the real sky: mood, glow, stars, size, lines, depth.
   Ghost arc (gold tick) while a slider is held; the drawer hides until release, then unfolds again.
   ?v=A|B|C or ?drawer=A|B|C, localStorage gj.drawer. Reduce Motion: same final state, no unfold motion.
   Active chrome is warm white #e8e4dc. Gold only on the ghost dial. Nothing here dims a waveform or a film. */
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

var ROWS=[
  {k:'mood',label:'mood',min:0,max:200,def:100},
  {k:'starG',label:'glow',min:0,max:200,def:100},
  {k:'stars',label:'stars',min:40,max:180,def:100},
  {k:'starS',label:'star size',min:50,max:200,def:100},
  {k:'lineA',label:'lines',min:0,max:200,def:100},
  {k:'depth',label:'depth',min:40,max:200,def:100}
];
function applyAll(){var o={},i;for(i=0;i<ROWS.length;i++)o[ROWS[i].k]=rn('gj.tune.'+ROWS[i].k,100)/100;
  if(window.GJ_V33D)GJ_V33D.set(o)}
function rowOf(k){for(var i=0;i<ROWS.length;i++)if(ROWS[i].k===k)return ROWS[i];return null}

var q=location.search,DV=(function(){
  var m=/(?:^|[?&])(?:drawer|v)=([ABC])(?:&|$)/.exec(q);if(m){wr('gj.drawer',m[1]);return m[1]}
  var v=rd('gj.drawer','A');return v==='B'||v==='C'?v:'A'})();
/* stash ?v=frames for the later film-frame experiment; do not treat it as a drawer look */
if(/(?:^|[?&])v=frames(?:&|$)/.test(q))wr('gj.v','frames');

var menu=null,open=false,HOLD=false,PTR=null,foldT=0,SWALLOW=0,kbT=0;

function setDrawer(v){DV=v==='B'||v==='C'?v:'A';wr('gj.drawer',DV);if(menu){menu.className=(menu.className.replace(/dv-[ABC]/g,'')+' dv-'+DV).trim()}}
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

function paint(){
  if(!menu)return;
  var pl=menu.querySelector('.mm-plate'),h='<section class="mm-ctx"><h3>sky <span>here</span></h3>';
  ROWS.forEach(function(row){var v=Math.round(rn('gj.tune.'+row.k,100));
    h+='<label><span>'+row.label+'</span><input type="range" min="'+row.min+'" max="'+row.max+'" step="1" value="'+v+'" data-k="'+row.k+'" aria-label="'+row.label+'"><output>'+v+'</output></label>'});
  h+='</section><section class="mm-devsec"><h3>look</h3><div class="mm-seg"><b>drawer</b><span role="radiogroup" aria-label="drawer">';
  [['A','A · constellation'],['B','B · contact strip'],['C','C · ghost']].forEach(function(o){
    h+='<button type="button" role="radio" aria-checked="'+(DV===o[0])+'" data-drawer="'+o[0]+'">'+o[1]+'</button>'});
  h+='</span></div></section>';
  h+='<p class="mm-foot"><button type="button" class="mm-reset">reset</button> <button type="button" class="mm-home">home</button></p>';
  pl.innerHTML=h;pl.hidden=false;planes();origin();
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
  if(window.__sheet&&__sheet.isOpen&&__sheet.isOpen()){/* same as the old mark: back to the top of the Dive */
    var sh=document.querySelector('.sheet .shome');if(sh){/* don't recurse */ }
    if(__sheet.close){try{ /* close the sheet and scroll home */
      var fromY=0;
    }catch(e){}}
    /* use the sheet's public close + dive home */
    try{__sheet.close({quick:1});if(window.__dive)__dive.go({k:null});scrollTo(0,0)}catch(e){scrollTo({top:0,behavior:rmOn()?'auto':'smooth'})}
  }else scrollTo({top:0,behavior:rmOn()?'auto':'smooth'})}

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
    if(e.target.closest('.mm-reset')){ROWS.forEach(function(r){rm('gj.tune.'+r.k)});applyAll();paint();return}
    if(e.target.closest('.mm-home')){goHome();return}
  });
  menu.addEventListener('input',function(e){
    var r=e.target.closest('input[data-k]');if(!r)return;
    var row=rowOf(r.getAttribute('data-k'));if(!row)return;
    var v=+r.value;wr('gj.tune.'+row.k,v);applyAll();
    ghost(r,{name:row.label,min:row.min,max:row.max,def:row.def,value:v});
    var o=r.parentNode.querySelector('output');if(o)o.textContent=v;
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

applyAll();
window.GJ_MARKMENU={toggle:function(){show(!open)},show:show,get open(){return open}};
})();
