/* About · bio · the corner (Gill, Nov 14). The bio's two layer read-outs were pictures: the 7 dots and number on the right edge (#lrail,
 "4") and the "about · 4" depth pills in the bottom-left corner (#wrail). Scrolling or swiping on them did nothing. Now they step the bio:
 - swipe along either one (down / right = deeper, up / left = back), one layer per ~26px, and it follows the finger a little and springs
   back on release (the opener mark's swirl-and-spring feel); a wheel or trackpad scroll over it steps one layer per gesture;
 - tap a dot on the right edge to go straight to that layer.
 It only steps layers 1–7 (the moon and the way out stay on the calculator's own tap, pinch, Esc and Back), it never starts the room's
 pinch or tap, and the glitch, the calculator, the flicker and Stop flashing are untouched.
 ?corner=dial (remembered as gj.bio.corner; ?corner=swipe goes back): a tap on the corner also unfolds a small dial out of it, the
 site's dial open and close (.62s unfold, .5s fold, Esc / tap outside / tap again close it, one dial at a time): an outer arc for the
 depth layer and, where the page has them, an inner arc for the glitch (gj.glitch, full by default) and the Stop flashing switch
 (gj.noflash), the same keys and API as the drawer. Reduce Motion changes nothing. */
(function(){
'use strict';
function $(id){return document.getElementById(id)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
var MODE=(function(){var q=/(?:^|[?&])corner=(dial|swipe)(?:&|$)/.exec(location.search);
  if(q){try{localStorage.setItem('gj.bio.corner',q[1])}catch(e){}return q[1]}
  try{return localStorage.getItem('gj.bio.corner')==='dial'?'dial':'swipe'}catch(e){return 'swipe'}})();
function B(){return window.GJ_BIOCTL||null}
function U(){return window.__u1||null}
function lv(){var b=B();if(b)return b.lv;var u=U();return u&&u.bio?u.bio.lv:1}
function active(){var u=U();if(!u||!u.bio)return false;var b=u.bio,c=u.cur||{};
  if(!b.on||b.exit||b.moon)return false;if(!(c.k==='about'&&c.lv===2&&c.id==='about/bio'))return false;
  if(window.GJ_MARKMENU&&GJ_MARKMENU.open)return false;var L=$('layers');return !!(L&&!L.hidden)}
/* our own steps run with the room's tap-swallow lifted for that one call (the swallow is there to stop the room's tap, not us) */
function bare(f){var sw=window.__gjNavSwallow;window.__gjNavSwallow=0;try{f()}finally{window.__gjNavSwallow=sw}}
function deeper(){if(lv()>=7)return false;var b=B();bare(function(){if(b&&b.deeper)b.deeper();else if(U())U().pinchIn(innerWidth/2,innerHeight/2)});return true}
function back(){if(lv()<=1)return false;var b=B();bare(function(){if(b&&b.back)b.back();else if(U())U().pinchOut()});return true}
function step(d){var ok=d>0?deeper():back();if(ok){try{if(navigator.vibrate)navigator.vibrate(5)}catch(e){}}return ok}
function goTo(n){n=clamp(n,1,7);var guard=8;while(lv()!==n&&guard--){if(!(lv()<n?deeper():back()))break}}
function swallow(){window.__gjNavSwallow=Date.now()+450}
function rectOf(el,pad){if(!el||el.hidden)return null;var r=el.getBoundingClientRect();if(!r.width||!r.height)return null;
  var px=Math.max(pad,(44-r.width)/2),py=Math.max(pad,(44-r.height)/2);return {l:r.left-px,t:r.top-py,r:r.right+px,b:r.bottom+py,el:el,raw:r}}
function hit(x,y){if(!active())return null;
  var a=rectOf($('lrail'),10);if(a&&x>=a.l&&x<=a.r&&y>=a.t&&y<=a.b)return {k:'l',R:a};
  var w=rectOf($('wrail'),6);if(w&&x>=w.l&&x<=w.r&&y>=w.t&&y<=w.b)return {k:'w',R:w};
  return null}
/* ---------- the feel: follow a little, then a critically damped spring back ---------- */
var off={x:0,y:0,vx:0,vy:0,el:null},raf=0;
function paintOff(){if(off.el)off.el.style.translate=off.x.toFixed(2)+'px '+off.y.toFixed(2)+'px'}
function spring(){cancelAnimationFrame(raf);var last=performance.now();
  (function f(t){var dt=Math.min(.05,(t-last)/1000);last=t;var w=14;
    off.vx+=(-w*w*off.x-2*w*off.vx)*dt;off.vy+=(-w*w*off.y-2*w*off.vy)*dt;off.x+=off.vx*dt;off.y+=off.vy*dt;
    if(Math.abs(off.x)<.05&&Math.abs(off.y)<.05&&Math.abs(off.vx)<.5&&Math.abs(off.vy)<.5){off.x=off.y=off.vx=off.vy=0;paintOff();if(off.el)off.el.style.translate='';return}
    paintOff();raf=requestAnimationFrame(f)})(last)}
/* ---------- gestures ---------- */
var G=null,STEP=26,lastDrag=0;
addEventListener('pointerdown',function(e){
  if(G||(e.pointerType==='mouse'&&e.button!==0))return;
  if(D.open&&D.el&&D.el.contains(e.target))return;
  var h=hit(e.clientX,e.clientY);if(!h)return;
  e.stopImmediatePropagation();e.preventDefault();swallow();
  G={id:e.pointerId,k:h.k,R:h.R,x0:e.clientX,y0:e.clientY,acc:0,moved:0,t0:performance.now(),steps:0,lvTap:!!(e.target&&e.target.closest&&e.target.closest('#wrail [data-lv]'))};
  off.el=h.k==='l'?$('lrail'):$('wrail');cancelAnimationFrame(raf);
},true);
addEventListener('pointermove',function(e){
  if(!G||e.pointerId!==G.id)return;e.stopImmediatePropagation();e.preventDefault();
  var dx=e.clientX-G.x0,dy=e.clientY-G.y0;G.moved=Math.max(G.moved,Math.hypot(dx,dy));
  /* the right-edge dots read top (1) to bottom (7); the corner pills read left to right: either axis works on both */
  var along=G.k==='l'?(Math.abs(dy)>=Math.abs(dx)?dy:dx):(Math.abs(dx)>=Math.abs(dy)?dx:dy);
  var want=Math.trunc(along/STEP);
  while(G.steps<want){if(!step(1))break;G.steps++}
  while(G.steps>want){if(!step(-1))break;G.steps--}
  var rest=along-G.steps*STEP,give=rest*.35;
  if(G.k==='l'){off.x=0;off.y=clamp(give,-10,10)}else{off.y=0;off.x=clamp(give,-10,10)}paintOff();swallow();
},true);
function up(e){
  if(!G||e.pointerId!==G.id)return;e.stopImmediatePropagation();
  var g=G;G=null;swallow();spring();if(g.moved>=8)lastDrag=Date.now();
  if(e.type==='pointercancel')return;
  if(g.moved<8&&performance.now()-g.t0<500){
    if(g.lvTap)return;   /* a tap on "sky", "about" or "board" in the corner keeps its own jump (the click goes through) */
    if(MODE==='dial'){D.toggle(g.k);return}
    if(g.k==='l'){var dots=$('lrail').querySelectorAll('i'),best=-1,bd=1e9;
      for(var i=0;i<dots.length;i++){var r=dots[i].getBoundingClientRect(),d=Math.abs(e.clientY-(r.top+r.height/2));if(d<bd){bd=d;best=i}}
      if(best>=0&&bd<=14)goTo(best+1);else step(1)}
    else step(1)}
}
addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
addEventListener('click',function(e){if(Date.now()-lastDrag<450&&hit(e.clientX,e.clientY)){e.stopImmediatePropagation();e.preventDefault();return}if(e.target&&e.target.closest&&e.target.closest('#wrail [data-lv]'))return;if(hit(e.clientX,e.clientY)){e.stopImmediatePropagation();e.preventDefault()}},true);
/* the wheel: one layer per gesture (a gesture ends after 250 ms without wheel events), like the bio's own trackpad pinch */
var W={t:0,done:false,acc:0};
addEventListener('wheel',function(e){var h=hit(e.clientX,e.clientY);if(!h)return;e.stopImmediatePropagation();e.preventDefault();
  var t=performance.now();if(t-W.t>250){W.done=false;W.acc=0}W.t=t;if(W.done)return;
  var d=(e.deltaY||e.deltaX)*(e.deltaMode===1?18:1);W.acc+=d;
  if(Math.abs(W.acc)>=12){W.done=true;off.el=h.k==='l'?$('lrail'):$('wrail');
    if(h.k==='l')off.y=W.acc>0?6:-6;else off.x=W.acc>0?6:-6;paintOff();spring();step(W.acc>0?1:-1)}},{capture:true,passive:false});
/* ---------- the dial (?corner=dial) ---------- */
var NS='http://www.w3.org/2000/svg';
var D={open:false,el:null,from:'w',
  build:function(){if(D.el)return;var d=document.createElement('div');d.id='biodial';d.setAttribute('role','dialog');d.setAttribute('aria-label','bio dial: depth layer and glitch');d.hidden=true;
    d.innerHTML='<svg viewBox="0 0 220 220" aria-hidden="true"><g class="bd-g"></g></svg>'+
      '<input type="range" class="bd-r" data-k="lv" min="1" max="7" step="1" aria-label="bio depth layer">'+
      '<input type="range" class="bd-r" data-k="gl" min="0" max="100" step="1" aria-label="glitch">'+
      '<button type="button" class="bd-sw" aria-pressed="false"><i class="led" aria-hidden="true"></i><span>stop flashing</span></button>'+
      '<p class="bd-lab"><b class="bd-n"></b> <span class="bd-v"></span></p>';
    document.body.appendChild(d);D.el=d;D.g=d.querySelector('.bd-g');
    ['pointerdown','pointermove','pointerup','click','wheel','touchstart','touchmove'].forEach(function(t){d.addEventListener(t,function(e){e.stopPropagation()},{passive:t!=='wheel'})});
    d.querySelector('.bd-sw').addEventListener('click',function(){var b=B();if(!b)return;b.setNoflash(!b.noflash());D.paint()});
    d.addEventListener('pointerdown',D.down);d.addEventListener('pointermove',D.move);d.addEventListener('pointerup',D.end);d.addEventListener('pointercancel',D.end);
    [].forEach.call(d.querySelectorAll('.bd-r'),function(r){r.addEventListener('input',function(){if(r.getAttribute('data-k')==='lv')goTo(+r.value);else if(B())B().setGlitch(+r.value/100);D.paint()})});
    document.addEventListener('pointerdown',function(e){if(D.open&&!d.contains(e.target)&&!hit(e.clientX,e.clientY)){e.stopPropagation();e.preventDefault();swallow();D.show(false)}},true);
    addEventListener('keydown',function(e){if(D.open&&e.key==='Escape'){e.stopPropagation();e.preventDefault();D.show(false)}},true)},
  /* geometry: a quarter fan out of the corner (bottom-left), outer ring = depth 1..7, inner ring = glitch 0..100 */
  R1:92,R2:62,A0:-84,A1:-6,
  pt:function(r,a){var t=a*Math.PI/180;return [18+r*Math.cos(t),202+r*Math.sin(t)]},
  arc:function(r){var a=D.pt(r,D.A0),b=D.pt(r,D.A1);return 'M'+a[0].toFixed(1)+' '+a[1].toFixed(1)+' A'+r+' '+r+' 0 0 1 '+b[0].toFixed(1)+' '+b[1].toFixed(1)},
  ang:function(u){return D.A0+(D.A1-D.A0)*u},
  paint:function(){if(!D.el)return;var b=B(),n=lv(),gl=b?Math.round(b.glitch()*100):null,h='';
    var hi=D.pt(26,D.A0-6),ho=D.pt(D.R1+34,D.A0-6),he=D.pt(D.R1+34,D.A1+6),hn=D.pt(26,D.A1+6);
    h+='<path class="bd-hit" d="M'+hi[0].toFixed(1)+' '+hi[1].toFixed(1)+' L'+ho[0].toFixed(1)+' '+ho[1].toFixed(1)+' A'+(D.R1+34)+' '+(D.R1+34)+' 0 0 1 '+he[0].toFixed(1)+' '+he[1].toFixed(1)+' L'+hn[0].toFixed(1)+' '+hn[1].toFixed(1)+' A26 26 0 0 0 '+hi[0].toFixed(1)+' '+hi[1].toFixed(1)+'Z"/>';
    h+='<path class="bd-arc" d="'+D.arc(D.R1)+'"/>';
    for(var i=1;i<=7;i++){var a=D.ang((i-1)/6),p=D.pt(D.R1,a),q=D.pt(D.R1+(i===n?11:6),a);h+='<path class="bd-tk'+(i===n?' on':'')+'" d="M'+p[0].toFixed(1)+' '+p[1].toFixed(1)+' L'+q[0].toFixed(1)+' '+q[1].toFixed(1)+'"/>';
      var tp=D.pt(D.R1+20,a);h+='<text class="bd-num'+(i===n?' on':'')+'" x="'+tp[0].toFixed(1)+'" y="'+(tp[1]+3).toFixed(1)+'">'+i+'</text>'}
    var cp=D.pt(D.R1,D.ang((n-1)/6));h+='<circle class="bd-dot" cx="'+cp[0].toFixed(1)+'" cy="'+cp[1].toFixed(1)+'" r="4"/>';
    if(gl!=null){h+='<path class="bd-arc in" d="'+D.arc(D.R2)+'"/>';var u=gl/100,ga=D.ang(u),g0=D.pt(D.R2-8,ga),g1=D.pt(D.R2+8,ga),df=D.pt(D.R2-4,D.A1),df2=D.pt(D.R2+4,D.A1);
      h+='<path class="bd-def" d="M'+df[0].toFixed(1)+' '+df[1].toFixed(1)+' L'+df2[0].toFixed(1)+' '+df2[1].toFixed(1)+'"/>';
      h+='<path class="bd-cur" d="M'+g0[0].toFixed(1)+' '+g0[1].toFixed(1)+' L'+g1[0].toFixed(1)+' '+g1[1].toFixed(1)+'"/>'}
    D.g.innerHTML=h;
    var rl=D.el.querySelector('[data-k=lv]'),rg=D.el.querySelector('[data-k=gl]'),sw=D.el.querySelector('.bd-sw');rl.value=String(n);
    rg.hidden=sw.hidden=!b;if(b){rg.value=String(gl);var nf=b.noflash();sw.setAttribute('aria-pressed',String(nf));sw.classList.toggle('on',nf)}
    D.el.querySelector('.bd-n').textContent=D.hold==='gl'?'glitch':'depth';
    D.el.querySelector('.bd-v').textContent=D.hold==='gl'?(gl>=100?'full':gl<=0?'off':gl+'%'):('about · '+n)},
  hold:null,
  which:function(x,y){var r=D.el.getBoundingClientRect(),k=220/r.width,px=(x-r.left)*k,py=(y-r.top)*k,dx=px-18,dy=py-202,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)*180/Math.PI;
    return {d:d,a:a,u:clamp((a-D.A0)/(D.A1-D.A0),0,1)}},
  down:function(e){if(e.target.closest('.bd-sw'))return;var w=D.which(e.clientX,e.clientY);
    var gl=!!B()&&Math.abs(w.d-D.R2)<Math.abs(w.d-D.R1)&&w.d<D.R1-12;if(w.d<26||w.d>D.R1+34)return;
    D.hold=gl?'gl':'lv';try{D.el.setPointerCapture(e.pointerId)}catch(_){}D.move(e)},
  move:function(e){if(!D.hold)return;var w=D.which(e.clientX,e.clientY);
    if(D.hold==='lv'){var n=Math.round(w.u*6)+1;if(n!==lv())goTo(n)}else{var v=Math.round(w.u*100);if(v>97)v=100;if(B())B().setGlitch(v/100)}D.paint()},
  end:function(){if(!D.hold)return;D.hold=null;setTimeout(D.paint,0)},
  show:function(on){D.build();if(on===D.open)return;D.open=on;var d=D.el;clearTimeout(D.t);
    if(on){if(window.GJ_MARKMENU&&GJ_MARKMENU.open)GJ_MARKMENU.show(false);D.paint();d.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add('on')})})}
    else{d.classList.remove('on');D.t=setTimeout(function(){if(!D.open)d.hidden=true},640)}
    document.documentElement.classList.toggle('bd-open',on)},
  toggle:function(k){D.from=k;D.show(!D.open)}};
setInterval(function(){if(D.open&&!active())D.show(false);else if(D.open&&!D.hold)D.paint()},400);
window.GJ_BIOCORNER={get mode(){return MODE},get lv(){return lv()},active:active,step:step,goTo:goTo,dial:function(on){D.show(on==null?!D.open:!!on)},get dialOpen(){return D.open}};
})();
