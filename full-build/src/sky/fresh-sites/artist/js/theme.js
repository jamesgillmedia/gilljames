/* Selective Red Mode (Night default · Red). Ported from tonight/fable-m4/js/theme.js.
   Night leaves every colour as written. Red MAPS stylesheet colours and Canvas 2D
   fill/stroke/shadow/gradient colours onto #ff4457 at the same luminance, so chrome,
   type, borders and waveforms inherit it. Photographs, film frames, video and
   drawImage panes are never colours we set — they stay true.
   Page grounds (#050505, #070707, #0b0a09 and any ink darker than Y .12) stay
   the black they were written as. Text colour alpha is lifted so small type
   stays readable on black. Preference: localStorage gj.theme, ?theme=night|red,
   synced across tabs with the storage event.
   No floating ring. The wordmark opens a drawer (GJ_THEME.bind) that holds Night/Red,
   and on Lost Coffee the Flash slider. Vol stays on the page.
   GJ_THEME: pref, eff, set(), toggle(), bind(), close(), map(), on(fn). */
(function(w){
'use strict';
var KEY='gj.theme',root=document.documentElement,RED=[255,68,87];
var RAW=false,pref='night',eff='night',hooks=[],built=false,sheet=null,C={};
function lsGet(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function lsSet(v){try{localStorage.setItem(KEY,v)}catch(e){}}
(function(){var q=/(?:^|[?&])theme=(night|red)(?:&|$)/.exec(location.search),v=q?q[1]:lsGet();if(q)lsSet(q[1]);pref=v==='red'?'red':'night';eff=pref})();
function keep(r,g,b){
  if(r<=255&&r>=247&&g<=80&&g>=56&&b<=99&&b>=75)return true; /* the red ink itself, never mapped twice */
  if(Math.abs(r-85)<45&&Math.abs(g-218)<40&&Math.abs(b-161)<45)return true;
  if(g>=180&&g>r+8&&g>b+25)return true;
  if(r>=240&&g>=80&&g<=110&&b<=60)return true;
  return false}
/* Dark grounds stay the colour they were written. Anything lighter is red ink:
   mid tones stay moderate, and text (Y >= .5) is lifted to 84–100% so small type
   clears 4.5:1 on black. */
function mapRGB(r,g,b){
  var Y=(.2126*r+.7152*g+.0722*b)/255;
  if(Y<.12)return [r,g,b];
  if(keep(r,g,b))return [r,g,b];
  var k;
  if(Y>=.5)k=.84+.16*(Y-.5)/.5;else{var u=(Y-.12)/.38;k=.1+.74*u*u*(3-2*u)}
  return [RED[0]*k,RED[1]*k,RED[2]*k]}
function hex2(h){h=h.replace('#','');if(h.length<=4)h=h.replace(/./g,'$&$&');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16),h.length===8?parseInt(h.substr(6,2),16)/255:1]}
var NAMED={white:[255,255,255],black:[0,0,0]},CACHE={},PRE={};
function fmt(c,a){return 'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+(+a.toFixed(3))+')'}
function mapOne(tok){
  var m;
  if(tok.charAt(0)==='#'){var c=hex2(tok),o=mapRGB(c[0],c[1],c[2]);return (o[0]===c[0]&&o[1]===c[1]&&o[2]===c[2])?tok:fmt(o,c[3])}
  m=/^rgba?\(([^)]*)\)$/i.exec(tok);
  if(m){var p=m[1].split(/[\s,\/]+/).filter(Boolean),v=p.slice(0,3).map(function(x){return x.slice(-1)==='%'?parseFloat(x)*2.55:parseFloat(x)});
    if(v.some(isNaN))return tok;var a=p.length>3?(p[3].slice(-1)==='%'?parseFloat(p[3])/100:parseFloat(p[3])):1;
    var mm=mapRGB(v[0],v[1],v[2]);return (mm[0]===v[0]&&mm[1]===v[1]&&mm[2]===v[2])?tok:fmt(mm,a)}
  var n=NAMED[tok.toLowerCase()];if(n){var o2=mapRGB(n[0],n[1],n[2]);return (o2[0]===n[0]&&o2[1]===n[1]&&o2[2]===n[2])?tok:fmt(o2,1)}
  return tok}
var RE=/url\([^)]*\)|#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;
function mapStr(s){
  var hit=CACHE[s];if(hit!==undefined)return hit;
  var out;
  var i=s.lastIndexOf(',');
  if(s.charCodeAt(0)===114&&s.charCodeAt(3)===97&&s.charCodeAt(s.length-1)===41&&i>0&&s.indexOf(')')===s.length-1){
    var pre=s.slice(0,i),pm=PRE[pre];if(pm===undefined){var m=/^rgba\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)$/.exec(pre);
      if(m){var mm=mapRGB(+m[1],+m[2],+m[3]);pm=(mm[0]===+m[1]&&mm[1]===+m[2]&&mm[2]===+m[3])?pre:'rgba('+Math.round(mm[0])+','+Math.round(mm[1])+','+Math.round(mm[2])}else pm=null;PRE[pre]=pm}
    if(pm!==null){out=pm+s.slice(i);if(Object.keys(CACHE).length<4000)CACHE[s]=out;return out}}
  out=s.replace(RE,function(t){return t.charAt(0)==='u'?t:mapOne(t)});
  if(Object.keys(CACHE).length<4000)CACHE[s]=out;return out}
function liftText(v){return v.replace(/rgba\(([^,]+),([^,]+),([^,]+),\s*([\d.]+)\)/g,function(m,r,g,b,a){return +a<.92?'rgba('+r+','+g+','+b+',.92)':m})}
function hasColor(v){RE.lastIndex=0;return RE.test(v)}
(function(){
  function wrap(proto,prop){var d=Object.getOwnPropertyDescriptor(proto,prop);if(!d||!d.set)return;
    Object.defineProperty(proto,prop,{get:d.get,set:function(v){d.set.call(this,(eff==='red'&&!RAW&&typeof v==='string')?mapStr(v):v)},configurable:true,enumerable:d.enumerable})}
  if(w.CanvasRenderingContext2D){['fillStyle','strokeStyle','shadowColor'].forEach(function(p){wrap(CanvasRenderingContext2D.prototype,p)})}
  if(w.CanvasRenderingContext2D){var ft=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(){
    if(eff==='red'){var fs=this.fillStyle,m=typeof fs==='string'&&/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(fs);
      if(m&&+m[4]<.92){RAW=true;this.fillStyle='rgba('+m[1]+','+m[2]+','+m[3]+',.92)';RAW=false;var r=ft.apply(this,arguments);RAW=true;this.fillStyle=fs;RAW=false;return r}}
    return ft.apply(this,arguments)}}
  if(w.CanvasGradient){var a=CanvasGradient.prototype.addColorStop;CanvasGradient.prototype.addColorStop=function(o,c){return a.call(this,o,(eff==='red'&&typeof c==='string')?mapStr(c):c)}}
})();
function splitSel(s){var out=[],d=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='('||ch==='[')d++;else if(ch===')'||ch===']')d--;if(ch===','&&!d){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out}
function twin(sel){return splitSel(sel).map(function(s){s=s.trim();if(!s)return null;
  if(/#themeBtn|#safelight/.test(s)||/^html\[data-theme=["']?red["']?\]/.test(s))return null;
  if(/^(:root|html)(?![\w-])/.test(s))return s.replace(/^(:root|html)/,'html[data-theme=red]');return 'html[data-theme=red] '+s}).filter(Boolean).join(',')}
function walk(rules,out){
  for(var i=0;i<rules.length;i++){var r=rules[i];
    if(r.type===1){if(/#themeBtn/.test(r.selectorText||''))continue;
      var st=r.style,d='';for(var j=0;j<st.length;j++){var p=st[j],v=st.getPropertyValue(p);
        if(/^--gd-(gold|warm|ink)$/.test(p))continue;
        if(v&&hasColor(v)){var nv=mapStr(v);if(p==='color'||p==='fill')nv=liftText(nv);if(nv!==v)d+=p+':'+nv+(st.getPropertyPriority(p)?' !important':'')+';'}}
      if(d){var s=twin(r.selectorText);if(s)out.push(s+'{'+d+'}')}}
    else if((r.type===4||r.type===12)&&r.cssRules){var inner=[];walk(r.cssRules,inner);if(inner.length)out.push((r.type===4?'@media '+r.conditionText:'@supports '+r.conditionText)+'{'+inner.join('')+'}')}
  }}
function build(){
  var out=[];for(var i=0;i<document.styleSheets.length;i++){var ss=document.styleSheets[i];if(ss.ownerNode&&ss.ownerNode.id==='theme-red')continue;var rules;try{rules=ss.cssRules}catch(e){continue}if(rules)walk(rules,out)}
  if(!sheet){var el=document.createElement('style');el.id='theme-red';document.head.appendChild(el);sheet=el.sheet;sheet._el=el}
  sheet._el.textContent=out.join('\n');built=true;CACHE={};PRE={}}
function apply(force){
  var e=pref==='red'?'red':'night';if(e===eff&&!force&&root.getAttribute('data-theme')===e)return;
  eff=e;if(e==='red')build();
  root.setAttribute('data-theme',eff);
  var m=document.querySelector('meta[name=theme-color]');if(m){if(!C.tc)C.tc=m.getAttribute('content');m.setAttribute('content',e==='red'?'#000':C.tc)}
  paintMode();hooks.forEach(function(f){try{f('theme',eff)}catch(err){}})}
var drawer=null,openMark=null,homeFn=null,modeRow=null,tuned=false;
function paintMode(){if(!modeRow)return;var bs=modeRow.querySelectorAll('[data-theme-set]'),i,b,on;for(i=0;i<bs.length;i++){b=bs[i];on=b.getAttribute('data-theme-set')===pref;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')}}
function ensureDrawer(){
  if(drawer)return drawer;
  drawer=document.createElement('div');drawer.id='wmDrawer';drawer.className='wm-drawer';drawer.setAttribute('data-gjdial-drawer','');drawer.setAttribute('hidden','');drawer.setAttribute('role','dialog');drawer.setAttribute('aria-label','colour mode');
  drawer.innerHTML='<div class="wm-flash"></div><div class="wm-mode"><span>mode</span><button type="button" data-theme-set="night">Night</button><button type="button" data-theme-set="red">Red</button></div><button type="button" class="wm-home">Home</button>';
  modeRow=drawer.querySelector('.wm-mode');
  modeRow.addEventListener('click',function(e){var b=e.target.closest('[data-theme-set]');if(!b)return;e.preventDefault();e.stopPropagation();T.set(b.getAttribute('data-theme-set'))});
  drawer.querySelector('.wm-home').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var fn=homeFn;closeDrawer();if(fn)fn()});
  document.body.appendChild(drawer);paintMode();
  document.addEventListener('pointerdown',function(e){if(!drawer||drawer.hasAttribute('hidden'))return;if(drawer.contains(e.target))return;if(e.target.closest&&e.target.closest('.wm-mark'))return;closeDrawer()},true);
  document.addEventListener('keydown',function(e){if(e.key!=='Escape'||!drawer||drawer.hasAttribute('hidden'))return;e.preventDefault();e.stopPropagation();closeDrawer()},true);
  addEventListener('resize',function(){if(openMark)position(openMark)});
  addEventListener('popstate',closeDrawer);
  return drawer}
function position(mark){var r=mark.getBoundingClientRect(),dw=drawer.offsetWidth||220,dh=drawer.offsetHeight||160;
  function clamp(L,T){return [Math.max(8,Math.min(L,innerWidth-dw-8)),Math.max(8,Math.min(T,innerHeight-dh-8))]}
  function hits(L,T){var box={l:L,t:T,r:L+dw,b:T+dh},nodes=document.querySelectorAll('input[type=range],#dev'),i,el,b,s;
    for(i=0;i<nodes.length;i++){el=nodes[i];if(drawer.contains(el))continue;
      try{s=getComputedStyle(el)}catch(e){continue}
      if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0)continue;
      b=el.getBoundingClientRect();if(b.width<2||b.height<2)continue;
      if(box.l<b.right-1&&box.r>b.left+1&&box.t<b.bottom-1&&box.b>b.top+1)return b}return null}
  var cands=[[r.left,r.bottom+8],[r.left,r.top-dh-8],[r.right+8,r.top]];
  var vols=document.querySelectorAll('input[data-k=vol]'),i,b;
  for(i=0;i<vols.length;i++){if(drawer.contains(vols[i]))continue;b=vols[i].getBoundingClientRect();if(b.width>2){cands.push([r.left,b.bottom+10]);cands.push([b.right+10,r.bottom+8])}}
  var pick=clamp(r.left,r.bottom+8),c,p,hit;
  for(i=0;i<cands.length;i++){c=clamp(cands[i][0],cands[i][1]);hit=hits(c[0],c[1]);if(!hit){pick=c;break}}
  drawer.style.left=pick[0]+'px';drawer.style.top=pick[1]+'px'}
function openDrawer(mark){ensureDrawer();
  if(openMark===mark&&!drawer.hasAttribute('hidden')){closeDrawer();return}
  openMark=mark;drawer.removeAttribute('hidden');
  document.querySelectorAll('.wm-mark').forEach(function(m){m.setAttribute('aria-expanded',m===mark?'true':'false')});
  position(mark)}
function closeDrawer(){if(!drawer)return;drawer.setAttribute('hidden','');if(openMark)openMark.setAttribute('aria-expanded','false');openMark=null}
var T={get pref(){return pref},get eff(){return eff},
  map:function(s){return eff==='red'?mapStr(String(s)):String(s)},
  set:function(v){v=v==='red'?'red':'night';if(v===pref){paintMode();return}pref=v;lsSet(v);apply(true);hooks.forEach(function(f){try{f('pref',pref)}catch(e){}})},
  toggle:function(){T.set(pref==='red'?'night':'red')},
  close:closeDrawer,
  on:function(f){hooks.push(f)},
  /* Wordmark opens the drawer. No badge on the mark. opt.tune adds Flash (Lost Coffee). opt.home is the Home row. */
  bind:function(mark,opt){if(!mark)return;opt=opt||{};if(opt.home)homeFn=opt.home;ensureDrawer();
    if(opt.tune&&w.LV&&!tuned){LV.tune(drawer.querySelector('.wm-flash'),'','flash');tuned=true;drawer.setAttribute('aria-label','flash and colour')}
    mark.classList.add('wm-mark');mark.setAttribute('aria-haspopup','dialog');mark.setAttribute('aria-expanded','false');
    mark.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openDrawer(mark)})}};
w.GJ_THEME=T;
root.setAttribute('data-theme',eff);
function ready(){if(eff==='red')build();
  addEventListener('storage',function(e){if(e.key!==KEY)return;var v=e.newValue==='red'?'red':'night';if(v!==pref){pref=v;apply(true);hooks.forEach(function(f){try{f('pref',pref)}catch(err){}})}});
  addEventListener('load',function(){if(eff==='red')build()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
if(eff==='red'){try{build()}catch(e){}}
})(window);
