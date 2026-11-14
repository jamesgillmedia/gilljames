/* the theme layer (Night default · Red), ported from preview-proto-shell onto the real site.
   Night is the site as written: with Night on, this file does nothing at all (no sheet is built, no colour is touched).
   Red recolours by MAPPING, not by patching elements: every colour in every stylesheet and every colour the canvas code sets is mapped to
   the same light on a red ink (same luminance, same alpha), so every page, menu, label and piece inherits it.
   Never mapped (carve-outs): photographs, film frames and video (images are not colours); the mint "new" marker and its lit state;
   the safelight; the Photo room (Red steps aside inside it, it keeps its own look).
   Red never washes or brightens the page: black maps to black, and only elements give light.
   GJ_THEME: pref ('night'|'red', localStorage gj.theme, ?theme=night|red), eff, set(), toggle(), setRoom(k), exempt(k), on(fn). A quiet ring button
   (bottom left) toggles; the tune menu's pinned globals carry the same choice. Reduce Motion: nothing here animates. */
(function(w){
'use strict';
var KEY='gj.theme',EXEMPT={photo:1},root=document.documentElement,RED=/\/player\//.test(location.pathname)?[255,176,184]:[255,68,87]; /* Red's ink: crimson-rose (hue 354), clear of the Safelight's amber (14). The sound player's page uses a lighter rose: the player is the brightest ink in Red */
var RAW=false,pref='night',eff='night',room=null,hooks=[],built=false,sheet=null,btn=null,C={};
function lsGet(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function lsSet(v){try{localStorage.setItem(KEY,v)}catch(e){}}
(function(){var q=/(?:^|[?&])theme=(night|red)(?:&|$)/.exec(location.search),v=q?q[1]:lsGet();if(q)lsSet(q[1]);pref=v==='red'?'red':'night';eff=pref})();
function keep(r,g,b){
  if(Math.abs(r-85)<45&&Math.abs(g-218)<40&&Math.abs(b-161)<45)return true;      /* mint, new work */
  if(g>=180&&g>r+8&&g>b+25)return true;                                           /* mint lit states (#e7f6c8 …) */
  if(r>=240&&g>=80&&g<=110&&b<=60)return true;                                    /* the safelight's orange */
  if(r>=250&&g>=140&&g<=215&&b>=150&&b<=225&&b>=g-12)return true;                 /* the player's own light rose: already Red, never mapped twice */
  return false}
/* The map keeps the dark ground at true black, lets mid tones stay moderate (lines, panels), and lifts anything light enough to be text (Y >= .5) to 84-100% of the ink,
   which is what small type needs (red ink at 84% is 4.5:1 on black). */
function mapRGB(r,g,b){if(keep(r,g,b))return [r,g,b];var Y=(.2126*r+.7152*g+.0722*b)/255,k;
  if(Y>=.5)k=.84+.16*(Y-.5)/.5;else if(Y>=.12){var u=(Y-.12)/.38;k=.1+.74*u*u*(3-2*u)}else k=.1*Math.pow(Y/.12,2);
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
/* DOM text: a colour with alpha is never fainter than 90% */
function liftText(v){return v.replace(/rgba\(([^,]+),([^,]+),([^,]+),\s*([\d.]+)\)/g,function(m,r,g,b,a){return +a<.9?'rgba('+r+','+g+','+b+',.9)':m})}
function hasColor(v){RE.lastIndex=0;return RE.test(v)}
/* canvas: colour setters map while Red is on; Night passes everything straight through */
(function(){
  function wrap(proto,prop){var d=Object.getOwnPropertyDescriptor(proto,prop);if(!d||!d.set)return;
    Object.defineProperty(proto,prop,{get:d.get,set:function(v){d.set.call(this,(eff==='red'&&!RAW&&typeof v==='string')?mapStr(v):v)},configurable:true,enumerable:d.enumerable})}
  if(w.CanvasRenderingContext2D){['fillStyle','strokeStyle','shadowColor'].forEach(function(p){wrap(CanvasRenderingContext2D.prototype,p)})}
  /* canvas text: a text fill is never fainter than 90% (alpha-faded small type is the first thing to fail contrast); shapes keep their alpha */
  if(w.CanvasRenderingContext2D){var ft=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(){
    if(eff==='red'){var fs=this.fillStyle,m=typeof fs==='string'&&/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(fs);
      if(m&&+m[4]<.9){RAW=true;this.fillStyle='rgba('+m[1]+','+m[2]+','+m[3]+',.9)';RAW=false;var r=ft.apply(this,arguments);RAW=true;this.fillStyle=fs;RAW=false;return r}}
    return ft.apply(this,arguments)}}
  if(w.CanvasGradient){var a=CanvasGradient.prototype.addColorStop;CanvasGradient.prototype.addColorStop=function(o,c){return a.call(this,o,(eff==='red'&&typeof c==='string')?mapStr(c):c)}}
})();
/* stylesheets: for every rule that has a colour, a Red twin under html[data-theme=red]; built once, only when Red is first needed */
function splitSel(s){var out=[],d=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='('||ch==='[')d++;else if(ch===')'||ch===']')d--;if(ch===','&&!d){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out}
function twin(sel){return splitSel(sel).map(function(s){s=s.trim();if(/#safelight/.test(s)||/^html\[data-theme=["']?red["']?\]/.test(s))return null;
  if(/^(:root|html)(?![\w-])/.test(s))return s.replace(/^(:root|html)/,'html[data-theme=red]');return 'html[data-theme=red] '+s}).filter(Boolean).join(',')}
function walk(rules,out){
  for(var i=0;i<rules.length;i++){var r=rules[i];
    if(r.type===1){var st=r.style,d='';for(var j=0;j<st.length;j++){var p=st[j],v=st.getPropertyValue(p);if(v&&hasColor(v)){var nv=mapStr(v);if(p==='color')nv=liftText(nv);if(nv!==v)d+=p+':'+nv+(st.getPropertyPriority(p)?' !important':'')+';'}}
      if(d){var s=twin(r.selectorText);if(s)out.push(s+'{'+d+'}')}}
    else if(r.type===4||r.type===12){var inner=[];walk(r.cssRules,inner);if(inner.length)out.push((r.type===4?'@media '+r.conditionText:'@supports '+r.conditionText)+'{'+inner.join('')+'}')}
  }}
function build(){
  var out=[];for(var i=0;i<document.styleSheets.length;i++){var ss=document.styleSheets[i];if(ss.ownerNode&&ss.ownerNode.id==='theme-red')continue;var rules;try{rules=ss.cssRules}catch(e){continue}if(rules)walk(rules,out)}
  if(!sheet){var el=document.createElement('style');el.id='theme-red';document.head.appendChild(el);sheet=el.sheet;sheet._el=el}
  sheet._el.textContent=out.join('\n');built=true}
function apply(force){
  /* the sound player and its waveform stay at Night luminance: Red must never dim them */
  var playerPage=/\/player\//.test(location.pathname);
  var e=(pref==='red'&&!(room&&EXEMPT[room])&&!playerPage)?'red':'night';if(e===eff&&!force&&root.getAttribute('data-theme')===e)return;
  eff=e;if(e==='red'&&document.readyState!=='loading'&&!built)build();
  root.setAttribute('data-theme',eff);
  var m=document.querySelector('meta[name=theme-color]');if(m){if(!C.tc)C.tc=m.getAttribute('content');m.setAttribute('content',e==='red'?'#000':C.tc)}
  label();hooks.forEach(function(f){f('theme',eff)})}
function label(){if(!btn)return;var to=pref==='red'?'night':'red';btn.setAttribute('aria-label','colour mode: '+pref+(EXEMPT[room]?' (this room keeps its own look)':'')+'. switch to '+to);btn.title=pref+' · switch to '+to}
var T={get pref(){return pref},get eff(){return eff},get room(){return room},pal:{name:'night'},
  exempt:function(k){return !!EXEMPT[k]},
  map:function(s){return eff==='red'?mapStr(s):s},
  set:function(v){v=v==='red'?'red':'night';if(v===pref)return;pref=v;lsSet(v);apply(true);label();hooks.forEach(function(f){f('pref',pref)})},
  toggle:function(){T.set(pref==='red'?'night':'red')},
  setRoom:function(k){k=k||null;if(k===room)return;room=k;apply();label()},
  adjust:function(){},adjInfo:null,
  on:function(f){hooks.push(f)},
  mount:function(){if(btn||w.top!==w.self||!document.querySelector('link[href$="sky.css"]'))return;btn=document.createElement('button');btn.type='button';btn.id='themeBtn';btn.innerHTML='<i></i>';
    btn.addEventListener('click',function(e){e.stopPropagation();T.toggle()});btn.addEventListener('pointerdown',function(e){e.stopPropagation()});
    document.body.appendChild(btn);label()}};
w.GJ_THEME=T;
root.setAttribute('data-theme',eff);
function ready(){if(eff==='red'&&!built)build();T.mount();
  setInterval(function(){var c=w.__u1&&w.__u1.cur;T.setRoom(c&&c.lv>=1?c.k:null)},300);
  /* the sound player and any frame share the choice through localStorage */
  addEventListener('storage',function(e){if(e.key===KEY){var v=e.newValue==='red'?'red':'night';if(v!==pref){pref=v;apply(true);label();hooks.forEach(function(f){f('pref',pref)})}}});
  /* sheets that arrive late */
  addEventListener('load',function(){if(eff==='red')build()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})(window);
