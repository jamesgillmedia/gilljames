/* gill james · site-v4-c-pro · additions on top of v4-c (the sky, constellations, move-in, select-then-open and boards are v4-c's, untouched).
   1 FILM PAGE  when a film is open (dive.js L3 / Scope), the work view scrolls: player on top, then a compact credits block
                (Title — Brand / Dir. / Prod. / Agency / Camera, lenses: only filled fields render), a dense 3-column grid of the
                film's frame-grabs (js/frames.js; press once = select, again = jump the player to that shot), and previous / next film.
   2 COPY       every [data-copy] element is filled from js/copy.js (the one editable place). Nothing renders for an empty string.
   3 DRIFT      the first screen's drifting work (.drift): press once = select (mint frame + title), again = open that work. No audio.
   4 NAMES      the Objects chapter reads "design · public art" wherever v4's shared code prints its key. */
(function(){'use strict';
var C=window.GJ_COPY||{},FR=window.GJ_FRAMES||{},D=document.documentElement;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)');
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---------- 2 COPY ---------- */
function awardsLine(){var a=C.awards||{};if(!a.names||!a.names.length)return'';var t=a.names.join(' · '),p=[a.program,a.year].filter(Boolean).join(', ');return p?t+' — '+p:t}
function fillCopy(){$$('[data-copy]').forEach(function(el){var k=el.dataset.copy,v='';
  if(k==='awards')v=awardsLine();
  else if(k==='email'){if(C.email){el.href='mailto:'+C.email;el.textContent=C.email;el.hidden=false}else el.hidden=true;return}
  else if(k==='practices'){el.innerHTML=(C.practices||[]).map(function(p){return '<li><a href="#'+(p.k==='sound'?'sound':p.k+'/l2')+'"><b>'+esc(p.name)+'</b><small>'+esc(p.line)+'</small></a></li>'}).join('');el.hidden=!(C.practices||[]).length;return}
  else if(k==='links'){el.innerHTML=(C.links||[]).map(function(l){return '<a class="lk" href="'+esc(l.href)+'" rel="noopener">'+esc(l.t)+'</a>'}).join(' ');el.hidden=!(C.links||[]).length;return}
  else v=C[k]||'';
  el.textContent=v;el.hidden=!v;var row=el.closest('[data-copy-row]');if(row)row.hidden=!v})}
fillCopy();

/* ---------- 4 NAMES ---------- */
var NMR=/\bobjects\b/;function rename(el){if(el&&NMR.test(el.textContent))el.textContent=el.textContent.replace(/\bobjects\b/,'design · public art')}
function watchName(sel){var el=$(sel);if(!el)return;rename(el);new MutationObserver(function(){rename(el)}).observe(el,{childList:true,characterData:true,subtree:true})}

/* ---------- 1 FILM PAGE ---------- */
var imm=null,sec=null,curW=null,selF=-1;
function filmItems(){return $$('#film .stars > li.it')}
function itemOf(w){return $('#film .stars > li.it[data-k="'+w+'"]')}
function jOf(it){try{return JSON.parse(it.dataset.j||'{}')}catch(e){return{}}}
function framesKey(j){if(j.reel&&j.n===0)return'reel';var m=/media\/films\/(\d+)\//.exec(j.native||'');return m?m[1]:null}
function titleOf(w,it){var c=(C.credits||{})[w];if(c&&c.t)return c;var b=it&&$('.cap b',it);return{t:b?b.textContent:'',b:''}}
function line(lab,v){return v?'<p class="pf-l"><span>'+lab+'</span> '+esc(v)+'</p>':''}
function build(w){var it=itemOf(w);if(!it)return'';var j=jOf(it),c=titleOf(w,it),meta=$('.cap small',it);
  var h='<div class="pf-cr"><h2 class="pf-t">'+esc(c.t)+(c.b?'<span class="pf-b"> — '+esc(c.b)+'</span>':'')+'</h2>'+
    (meta&&meta.textContent?'<p class="pf-k">'+esc(meta.textContent)+'</p>':'')+
    line('Dir.',c.dir)+line('Prod.',c.prod)+line('Agency',c.agency)+line('Camera',c.cam)+'</div>';
  var fk=framesKey(j),F=fk&&FR[fk];
  if(F&&F.f.length>=6){var n=F.f.length-F.f.length%3,list=F.f;if(n<F.f.length){list=[];for(var i=0;i<n;i++)list.push(F.f[Math.round(i*(F.f.length-1)/(n-1))])}
    h+='<ol class="pf-g" style="--ar:'+Math.max(.5,Math.min(2.6,F.ar))+'" aria-label="frames from '+esc(c.t)+'">'+list.map(function(f,i){var mm=Math.floor(f[1]/60),ss=('0'+Math.floor(f[1]%60)).slice(-2);
      return '<li><button type="button" data-t="'+f[1]+'" data-i="'+f[2]+'" aria-label="frame at '+mm+':'+ss+'"><img src="../site-v4-c-pro/frames/'+f[0]+'" alt="" loading="'+(i<6?'eager':'lazy')+'" decoding="async"><span class="pf-tc" aria-hidden="true">'+mm+':'+ss+'</span></button></li>'}).join('')+'</ol>'}
  var L=filmItems(),k=L.indexOf(it),pv=L[(k-1+L.length)%L.length],nx=L[(k+1)%L.length];
  function nm(x){var q=titleOf(x.dataset.k,x);return esc(q.b?q.b+' · '+q.t:q.t)}
  h+='<nav class="pf-nav" aria-label="more films"><button type="button" data-d="prev"><small>‹ previous film</small><b>'+nm(pv)+'</b></button><button type="button" data-d="next"><small>next film ›</small><b>'+nm(nx)+'</b></button></nav>';
  return h}
function ensure(){imm=imm||$('.imm');if(!imm)return;var st=window.__dive&&__dive.state(),on=!!(st&&st.k==='film'&&st.w&&!imm.hidden);
  imm.classList.toggle('pro',on);if(!on){curW=null;return}
  if(!sec||sec.parentNode!==imm){sec=document.createElement('section');sec.className='pf';imm.appendChild(sec)}
  var j=jOf(itemOf(st.w)||document.body);imm.classList.toggle('soon',!(j.reel||j.native||j.embed));
  tidyL2();if(curW!==st.w){curW=st.w;selF=-1;sec.innerHTML=build(st.w);imm.scrollTop=0;requestAnimationFrame(function(){dispatchEvent(new Event('resize'))})}}
var SOON=/\s*·?\s*full film coming soon/i,l2o=null;
function tidyL2(){var l2=imm&&$('.sc-lab .l2',imm);if(!l2)return;if(!l2o){l2o=new MutationObserver(function(){tidyL2()});l2o.observe(l2,{childList:true,characterData:true,subtree:true})}
  if(SOON.test(l2.textContent))l2.textContent=l2.textContent.replace(SOON,'')} /* a film with no local file shows its still and its kind, never an unfinished note */
function hook(){imm=$('.imm');if(!imm){return}
  new MutationObserver(function(){ensure()}).observe(imm,{attributes:true,attributeFilter:['class','hidden']});
  addEventListener('hashchange',function(){setTimeout(ensure,0)});ensure();
  imm.addEventListener('click',function(e){var b=e.target.closest('.pf-g button');
    if(b){e.preventDefault();var li=b.parentNode,i=[].indexOf.call(li.parentNode.children,li);
      if(selF!==i){$$('.pf-g li.sel',sec).forEach(function(x){x.classList.remove('sel')});li.classList.add('sel');selF=i;return} /* first press: select */
      var t=+b.dataset.t+.05;imm.scrollTo({top:0,behavior:RM.matches?'auto':'smooth'});var th=$('.sc-strip .th[data-i="'+b.dataset.i+'"]',imm);if(th)th.click();else if(window.__scope&&__scope.seek)try{__scope.seek(t)}catch(x){}return} /* second press: the player jumps to that shot */
    var n=e.target.closest('.pf-nav button');if(n){e.preventDefault();var t2=$('.imm-b [data-a='+n.dataset.d+']',imm);if(t2)t2.click()}})}

/* ---------- 3 DRIFT ---------- */
function drift(){var dz=$('.drift');if(!dz)return;var sel=null;
  dz.addEventListener('click',function(e){var a=e.target.closest('.dt');if(!a)return;e.preventDefault();
    if(sel!==a){if(sel)sel.classList.remove('sel');sel=a;a.classList.add('sel');dz.classList.add('has-sel');return}
    location.hash=a.dataset.go});
  function clr(){if(sel){sel.classList.remove('sel');sel=null}dz.classList.remove('has-sel')}addEventListener('hashchange',clr);document.addEventListener('click',function(e){if(sel&&!e.target.closest('.drift'))clr()},true);
  var v=$('video',dz);if(v){if(RM.matches){v.removeAttribute('autoplay');v.pause()}else{var p=v.play();if(p&&p.catch)p.catch(function(){})}}
  /* the drift rests (CSS animations paused, loop paused) whenever it is off screen or covered by the sky or a work */
  var inView=true;function upd(){var run=inView&&!D.classList.contains('sheet-on')&&!D.classList.contains('modal')&&!document.hidden;
    dz.classList.toggle('still',!run);if(v&&!RM.matches){if(run){if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}}else if(!v.paused)v.pause()}}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(x){inView=x.isIntersecting});upd()}).observe(dz);
  new MutationObserver(upd).observe(D,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',upd);upd()}

function boot(){hook();drift();watchName('.zoom .zn');watchName('.sheet .crumb')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0)});else setTimeout(boot,0);
window.__pro={ensure:ensure,copy:fillCopy};
})();
