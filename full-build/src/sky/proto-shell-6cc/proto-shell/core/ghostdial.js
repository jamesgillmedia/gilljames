/* proto-shell · the ghost dial: the default feedback for every slider while it is held (the tune menu, and any dial a module builds on the same rows).
   The menu steps aside and a thin partial arc (110 degrees) appears at the screen edge AWAY from the thumb: nearly transparent, a gold tick for the current value,
   faint end ticks, a default mark, the control's name in tiny type. It fades in within 150 ms and is gone about a second after release.
   It never sits over a photograph, a film, the waveform player or the calculator: it picks a free edge spot, or says "no safe place" (show() returns false) and the
   menu then simply stays where it is. Night: thin light lines. Red: thin red lines (the ink comes from the theme's --mm-ink). CSS + one small SVG, nothing else.
   Reduce Motion: it appears and disappears with no animation (theme.css / the @media rule below). Modules can register screen rects to keep clear: GJ_GHOST.avoid(fn). */
(function(w){
'use strict';
var NS='http://www.w3.org/2000/svg',svg=null,g=null,A={},hideT=0,fadeT=0,avoidFns=[],R=50,SPAN=110;
function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function build(){
  svg=el('svg',{id:'ghostdial','aria-hidden':'true'});g=el('g',{},svg);
  A.arc=el('path',{class:'gd-arc'},g);A.e0=el('path',{class:'gd-end'},g);A.e1=el('path',{class:'gd-end'},g);A.def=el('path',{class:'gd-def'},g);A.cur=el('path',{class:'gd-cur'},g);
  A.name=el('text',{class:'gd-name'},g);A.val=el('text',{class:'gd-val'},g);document.body.appendChild(svg)}
function hits(r,list){return list.some(function(q){return r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]})}
function rects(){
  var out=[],d=document.getElementById('snd');if(d){var b=d.getBoundingClientRect();if(b.height>0)out.push([b.left,b.top-6,b.right,b.bottom])}
  avoidFns.forEach(function(f){try{(f()||[]).forEach(function(q){out.push(q)})}catch(e){}});return out}
function place(px,py){
  var W=innerWidth,H=innerHeight,lt=Math.max(10,px)<W/2,right=lt,sx=right?W:0,cy=[H*.42,H*.30,H*.55],avoid=rects();
  var cands=[];[right,!right].forEach(function(r){cy.forEach(function(y){cands.push({r:r,y:y})})});
  for(var i=0;i<cands.length;i++){var c=cands[i],ex=c.r?W:0,box=c.r?[W-R*.6,c.y-R,W,c.y+R]:[0,c.y-R,R*.6,c.y+R];
    if(!hits(box,avoid)&&Math.abs((c.r?W:0)-px)>40)return c}
  return null}
function pt(cx,cy,r,deg){var a=deg*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]}
function f(p){return p[0].toFixed(1)+' '+p[1].toFixed(1)}
/* info: {name, min, max, def, value, x, y} (x, y: where the thumb / pointer is) */
function update(info){
  if(!svg)build();var c=place(info.x==null?innerWidth/2:info.x,info.y==null?innerHeight/2:info.y);
  if(!c){hideNow();return false}
  var W=innerWidth,cx=c.r?W-8+R*.62:8-R*.62,cy=c.y,mid=c.r?180:0,a0=mid-SPAN/2,a1=mid+SPAN/2;
  var span=info.max-info.min||1,u=function(v){return Math.max(0,Math.min(1,(v-info.min)/span))};
  /* value runs along the arc from its first end to its second, top to bottom */
  var ang=function(v){return a0+SPAN*u(v)},P=function(v,r){return pt(cx,cy,r,ang(v))};
  A.arc.setAttribute('d','M'+f(pt(cx,cy,R,a0))+' A'+R+' '+R+' 0 0 1 '+f(pt(cx,cy,R,a1)));
  A.e0.setAttribute('d','M'+f(pt(cx,cy,R-5,a0))+'L'+f(pt(cx,cy,R+5,a0)));A.e1.setAttribute('d','M'+f(pt(cx,cy,R-5,a1))+'L'+f(pt(cx,cy,R+5,a1)));
  var dv=info.def!=null?info.def:info.min;A.def.setAttribute('d','M'+f(P(dv,R-3))+'L'+f(P(dv,R+3)));
  A.cur.setAttribute('d','M'+f(P(info.value,R-9))+'L'+f(P(info.value,R+8)));
  /* the name sits inside the arc, tiny; on the right edge it is right-aligned to the arc */
  var np=pt(cx,cy,R-16,mid);A.name.textContent=String(info.name||'').toUpperCase();A.name.setAttribute('x',np[0].toFixed(1));A.name.setAttribute('y',(cy-2).toFixed(1));A.name.setAttribute('text-anchor',c.r?'end':'start');
  A.val.textContent=String(Math.round(info.value));A.val.setAttribute('x',np[0].toFixed(1));A.val.setAttribute('y',(cy+11).toFixed(1));A.val.setAttribute('text-anchor',c.r?'end':'start');
  clearTimeout(hideT);clearTimeout(fadeT);svg.classList.remove('out');svg.classList.add('on');return true}
function hideNow(){clearTimeout(hideT);clearTimeout(fadeT);if(svg){svg.classList.remove('on','out')}}
/* released: the arc lingers, then fades; gone about a second after release */
function release(){if(!svg||!svg.classList.contains('on'))return;clearTimeout(hideT);clearTimeout(fadeT);
  hideT=setTimeout(function(){svg.classList.add('out');fadeT=setTimeout(function(){svg.classList.remove('on','out')},720)},280)}
if(document.body)build();else document.addEventListener('DOMContentLoaded',build);
w.GJ_GHOST={update:update,release:release,hide:hideNow,avoid:function(fn){avoidFns.push(fn)},get shown(){return !!svg&&svg.classList.contains('on')}};
})(window);
