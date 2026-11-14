/* proto-shell · the theme layer's script half. css/theme.css holds the tokens (night, red); this file
   - keeps the choice (gj.theme: 'night' | 'red', per device; ?theme=red|night in the URL sets it) and puts it on <html data-theme>,
   - hands the canvas code the same tokens as one live object, GJ_THEME.pal (rebuilt from the CSS variables on every change),
   - mounts the quiet colour-mode button next to the A/B/C pills,
   - tells the shell which room you are in, so a room with its own look (Photo) keeps it: red applies everywhere else,
   - tracks what is being adjusted in the tune menu (red only: that part lights up gold for a moment).
   Night is the default and is the look the shell always had. Reduce Motion changes nothing here: no transitions, no timers that move anything.
   Modules: paint with GJ_THEME.pal; GJ_THEME.on(fn) tells you when it changed. Never hard-code a colour. */
(function(w){
'use strict';
var KEY='gj.theme',EXEMPT={photo:1},root=document.documentElement;
var pref='night',eff='night',room=null,adj=null,adjT=0,hooks=[],btn=null;
var P={name:'night'};
function lsGet(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function lsSet(v){try{localStorage.setItem(KEY,v)}catch(e){}}
(function(){var q=/(?:^|[?&])theme=(night|red)(?:&|$)/.exec(location.search),v=q?q[1]:lsGet();if(q)lsSet(q[1]);pref=v==='red'?'red':'night'})();
function css(n){return getComputedStyle(root).getPropertyValue(n).trim()}
function tri(n){var v=css(n);return v==='none'||!v?null:v}
function nums(n){return css(n).split(',').map(Number)}
function hex(h){h=h.replace('#','');if(h.length===3)h=h.replace(/./g,'$&$&');return [0,2,4].map(function(i){return parseInt(h.substr(i,2),16)})}
function build(){
  P.name=eff;
  ['bg','ink','dim','meta','mint','line'].forEach(function(k){P[k]=css('--'+k)});
  P.bgRGB=css('--bg-rgb');
  P.field=nums('--c-field');P.fieldCool=nums('--c-field-cool');P.fieldWarm=nums('--c-field-warm');P.wash=tri('--c-wash');P.glow=css('--c-glow');P.core=css('--c-core');P.coreRGB=hex(css('--c-core'));P.coreCool=hex(css('--c-core-cool'));P.coreWarm=hex(css('--c-core-warm'));
  P.chapter=tri('--c-chapter');P.active=tri('--c-active');P.grid=tri('--c-grid');
  P.label=css('--c-label');P.slot=css('--c-slot');
  P.sndOn=css('--c-snd-on');P.sndOff=css('--c-snd-off');P.sndLblOn=css('--c-snd-lbl-on');P.sndLbl=css('--c-snd-lbl');
  P.railLine=css('--c-rail-line');P.railOn=css('--c-rail-on');P.railOff=css('--c-rail-off');
  P.railStarOn=css('--c-rail-star-on');P.railStarOff=css('--c-rail-star-off');P.railHead=css('--c-rail-head');
  P.adj=adj;
}
/* module stylesheets: a module ships plain CSS (its own colours); Red maps every colour in it to the same light on the red ink (same luminance and alpha;
   black stays black), so a module inherits Red without knowing about it. Never mapped: the mint "new" marker, the safelight, and any rule for a part that
   shows a photograph or a film (MODSKIP): the calculator's photo face, its sides, display wall and glitch canvas, the moon grid. Built only while Red is on. */
var RED=[255,68,87],MODSKIP=/\.ac3-(face|bevel|side|floor|wall|back)\b|#glitch|#grain|#calc\b|#moons/,modSheet=null;
function keep(r,g,b){
  if(Math.abs(r-85)<45&&Math.abs(g-218)<40&&Math.abs(b-161)<45)return true;      /* mint, new work */
  if(g>=180&&g>r+8&&g>b+25)return true;                                           /* mint lit states (#e7f6c8 …) */
  if(r>=240&&g>=80&&g<=110&&b<=60)return true;                                    /* the safelight's orange */
  return false}
function mapRGB(r,g,b){if(keep(r,g,b))return [r,g,b];var Y=(.2126*r+.7152*g+.0722*b)/255,k=Math.pow(Y,.85);if(Y<.25)k*=Math.pow(Y/.25,1.2); /* the dark ground falls to true black; only lines, text and light stay */
  return [RED[0]*k,RED[1]*k,RED[2]*k]}
function hex2(h){h=h.replace('#','');if(h.length<=4)h=h.replace(/./g,'$&$&');return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16),h.length===8?parseInt(h.substr(6,2),16)/255:1]}
var NAMED={white:[255,255,255],black:[0,0,0]},CACHE={},PRE={};
function fmt(c,a){return 'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+(+a.toFixed(3))+')'}
function mapOne(tok){
  var m;
  if(tok.charAt(0)==='#'){var c=hex2(tok),o=mapRGB(c[0],c[1],c[2]);return o===c?tok:fmt(o,c[3])}
  m=/^rgba?\(([^)]*)\)$/i.exec(tok);
  if(m){var p=m[1].split(/[\s,\/]+/).filter(Boolean),v=p.slice(0,3).map(function(x){return x.slice(-1)==='%'?parseFloat(x)*2.55:parseFloat(x)});
    if(v.some(isNaN))return tok;var a=p.length>3?(p[3].slice(-1)==='%'?parseFloat(p[3])/100:parseFloat(p[3])):1;
    var mm=mapRGB(v[0],v[1],v[2]);return (mm[0]===v[0]&&mm[1]===v[1]&&mm[2]===v[2])?tok:fmt(mm,a)}
  var n=NAMED[tok.toLowerCase()];if(n){var o2=mapRGB(n[0],n[1],n[2]);return fmt(o2,1)}
  return tok}
var RE=/url\([^)]*\)|#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;
function mapStr(s){
  var hit=CACHE[s];if(hit!==undefined)return hit;
  var out;
  /* canvas hot path: rgba(r,g,b,alpha) with a changing alpha maps the rgb part once */
  var i=s.lastIndexOf(',');
  if(s.charCodeAt(0)===114&&s.charCodeAt(3)===97&&s.charCodeAt(s.length-1)===41&&i>0&&s.indexOf(')')===s.length-1){
    var pre=s.slice(0,i),pm=PRE[pre];if(pm===undefined){var m=/^rgba\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)$/.exec(pre);
      if(m){var mm=mapRGB(+m[1],+m[2],+m[3]);pm=(mm[0]===+m[1]&&mm[1]===+m[2]&&mm[2]===+m[3])?pre:'rgba('+Math.round(mm[0])+','+Math.round(mm[1])+','+Math.round(mm[2])}else pm=null;PRE[pre]=pm}
    if(pm!==null)return pm+s.slice(i)}
  out=s.replace(RE,function(t){return t.charAt(0)==='u'?t:mapOne(t)});
  if(Object.keys(CACHE).length<4000)CACHE[s]=out;return out}
function hasColor(v){RE.lastIndex=0;return RE.test(v)}
/* stylesheets: for every rule that has a colour, a Red twin under html[data-theme=red]; built once, only when Red is first needed */
function splitSel(s){var out=[],d=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='('||ch==='[')d++;else if(ch===')'||ch===']')d--;if(ch===','&&!d){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out}
function twin(sel){return splitSel(sel).map(function(s){s=s.trim();if(/#safelight/.test(s)||MODSKIP.test(s))return null;
  if(/^(:root|html)(?![\w-])/.test(s))return s.replace(/^(:root|html)/,'html[data-theme=red]');return 'html[data-theme=red] '+s}).filter(Boolean).join(',')}
function walk(rules,out){
  for(var i=0;i<rules.length;i++){var r=rules[i];
    if(r.type===1){var st=r.style,d='';for(var j=0;j<st.length;j++){var p=st[j],v=st.getPropertyValue(p);if(v&&hasColor(v)){var nv=mapStr(v);if(nv!==v)d+=p+':'+nv+(st.getPropertyPriority(p)?' !important':'')+';'}}
      if(d){var s=twin(r.selectorText);if(s)out.push(s+'{'+d+'}')}}
    else if(r.type===4||r.type===12){var inner=[];walk(r.cssRules,inner);if(inner.length)out.push((r.type===4?'@media '+r.conditionText:'@supports '+r.conditionText)+'{'+inner.join('')+'}')}
  }}
function buildModules(){
  var out=[];for(var i=0;i<document.styleSheets.length;i++){var ss=document.styleSheets[i];if(!ss.href||ss.href.indexOf('/modules/')<0)continue;var rules;try{rules=ss.cssRules}catch(e){continue}if(rules)walk(rules,out)}
  if(!modSheet){modSheet=document.createElement('style');modSheet.id='theme-red-modules';document.head.appendChild(modSheet)}
  modSheet.textContent=out.join('\n')}

function apply(force){
  var e=(pref==='red'&&!(room&&EXEMPT[room]))?'red':'night';
  if(e===eff&&!force)return;
  eff=e;root.setAttribute('data-theme',eff);build();if(pref==='red')buildModules();
  var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',P.bg);
  label();hooks.forEach(function(f){f('theme',eff)});
}
function label(){if(!btn)return;var to=pref==='red'?'night':'red';
  btn.setAttribute('aria-label','colour mode: '+pref+(EXEMPT[room]?' (this room keeps its own look)':'')+'. switch to '+to);btn.title=pref+' · switch to '+to}
var T={pal:P,get pref(){return pref},get eff(){return eff},get room(){return room},get adjusting(){return adj},
  exempt:function(k){return !!EXEMPT[k]},
  set:function(v){v=v==='red'?'red':'night';if(v===pref){return}pref=v;lsSet(v);apply(true);label();hooks.forEach(function(f){f('pref',pref)})},
  toggle:function(){T.set(pref==='red'?'night':'red')},
  /* the ladder room (null at the whole sky) */
  setRoom:function(k){k=k||null;if(k===room)return;room=k;apply();label()},
  /* red only: the part being adjusted (a room id from the tune menu) lights up gold for a moment */
  adjust:function(k,info){if(eff!=='red')return;adj=k;P.adj=adj;T.adjInfo=info||null;clearTimeout(adjT);adjT=setTimeout(function(){adj=null;P.adj=null;T.adjInfo=null;hooks.forEach(function(f){f('adj',null)})},1400);hooks.forEach(function(f){f('adj',k)})},
  on:function(f){hooks.push(f)},
  /* call after a module's stylesheet has loaded so Red reaches it */
  refresh:function(){if(pref==='red')buildModules()},
  mount:function(){var lab=document.getElementById('lab');if(!lab||btn)return;btn=document.createElement('button');btn.type='button';btn.id='themeBtn';btn.innerHTML='<i></i>';
    btn.addEventListener('click',function(e){e.stopPropagation();T.toggle()});btn.addEventListener('pointerdown',function(e){e.stopPropagation()});
    lab.insertBefore(btn,lab.firstChild);label()}};
w.GJ_THEME=T;
root.setAttribute('data-theme',pref==='red'?'red':'night');
eff=pref==='red'?'red':'night';
build();
document.addEventListener('DOMContentLoaded',function(){build();T.mount();var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',P.bg)});
})(window);
