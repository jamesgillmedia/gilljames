/* The family layer · m4 (Pack A §3, Gill's pick, Nov 15). A constellation that sits above the arrival, hidden until it is revealed.
   It is the family of the work, drawn as a graph and not as folders: every work is a star. Stars gather by type of work (Pack 1117),
   one constellation for each; inside a type, works for the same client or artist sit together as a named sub-cluster. The site's own
   "related" / "also" links are kept as dotted lines. About pages are not in it. Nothing is grouped by crew, year or place.
   The ᑕᐣᓯ Mark is at the hearth. Nothing hangs from it.
   Revealed from the arrival by going up: a pull down from the top of the arrival, a scroll up, or the up arrow. It is secret: it is not
   on the map (Pack 1117). Put away by going back down (pull up, scroll down, down arrow), by ×, Esc, a tap on the empty sky, or Back.
   It is one history step: Back puts it away and the arrival (or the sky) under it is exactly as it was.
   A tap on a star names the work and lights its kin; "open ›" goes to it in the sky. */
(function(){
'use strict';
if(window.GJ_FAMILY)return;
var OFF=['hike','reel-24'],root=null,cv=null,g=null,info=null,open=false,raf=0,T0=0,W=0,H=0,DPR=1,N=[],E=[],KIN=[],SUBK=[],LAB={k:''},SEL=-1,HOT=-1,ready=null,ptr={x:0,y:0,tx:0,ty:0,has:false},SPR={},sprKey='';
var STILL=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function $(s){return root.querySelector(s)}
function rnd(s){return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function red(){return document.documentElement.classList.contains('rm')}
function ink(){if(!red())return[230,237,240];return document.documentElement.getAttribute('data-red-tone')==='rose'?[255,176,184]:[255,68,87]}
function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
function phase(){return window.__u1?__u1.phase:''}

/* ---------- the family, from the site's own data (Pack 1117: Gill's answer to Q3) ----------
   Grouped by type of work. Each type is one constellation: commercial, music video, brand film, short, reel, photograph, object, sound.
   Inside a type, works for the same client or artist sit side by side as a named sub-cluster, joined by a hairline:
   BMW, AXE, Wild Leaf, Allan Rayman, Old Man Canyon, Lost Coffee, joio.co, carving. The site's own "related" / "also" links stay, dotted.
   About pages are not works and are not in the family. Nothing is grouped by crew, year or place. */
var SUBS=[['BMW',/^bmw\b/i],['AXE',/^axe\b/i],['Wild Leaf',/^wild leaf\b/i],['Allan Rayman',/^allan rayman\b/i],['Old Man Canyon',/^old man canyon\b/i],['Lost Coffee',/^lost coffee\b/i]];
var TYPES=['commercial','music video','brand film','short','reel','photograph','object','sound'];
function kindOf(x){var m=String(x.meta||'').split('·')[0].trim().toLowerCase();
  if(x.chapter==='film'||x.k==='film'){if(x.kind==='reel'||/^reel\b/.test(m)||/\breel\b/i.test(x.title)&&!TYPES.slice(0,4).some(function(t){return m===t}))return 'reel';return TYPES.indexOf(m)>=0?m:'commercial'}
  if(x.chapter==='photo')return 'photograph';if(x.chapter==='objects')return 'object';if(x.chapter==='sound')return 'sound';return null}
function subOf(x){if(x.chapter==='objects'){if(/joio/i.test(x.meta+' '+x.title))return 'joio.co';if(/carv/i.test(x.title))return 'carving';return ''}
  for(var i=0;i<SUBS.length;i++)if(SUBS[i][1].test(x.title))return SUBS[i][0];return ''}
function load(){if(ready)return ready;ready=fetch('data.json').then(function(r){return r.json()}).then(function(d){
  var cards=[],by={};(d.chapters||[]).forEach(function(c){(c.cards||[]).forEach(function(x){x.chapter=x.chapter||c.k;if(OFF.indexOf(x.slug)<0&&x.id&&x.title&&x.chapter!=='about'&&kindOf(x)){by[x.id]=cards.length;cards.push(x)}})});
  var r=rnd(29),links=[];
  N=cards.map(function(x,i){return{i:i,id:x.id,t:x.title,ch:x.chapter,type:kindOf(x),sub:subOf(x),role:x.role||'',year:x.year||'',kin:-1,x:0,y:0,d:.6+r()*.9,tw:r()*6.28}});
  /* the types that have works, each a ring round the hearth; room on the big ring in proportion to how many works it holds */
  var groups=TYPES.map(function(t){return{t:t,m:N.filter(function(n){return n.type===t}).map(function(n){return n.i})}}).filter(function(q){return q.m.length});
  var rad=groups.map(function(q){return .022*Math.sqrt(q.m.length)+.024}),sum=rad.reduce(function(a,b){return a+b},0),an=-Math.PI/2-rad[0]/sum*Math.PI;
  SUBK=[];
  KIN=groups.map(function(q,gi){var span=rad[gi]/sum*Math.PI*2,a0=an+span/2;an+=span;var cx=.5+Math.cos(a0)*.325,cy=.5+Math.sin(a0)*.315,rr=rad[gi];
    /* order: the named sub-clusters first, each kept together, then the rest; sub-clusters start on the side that faces the hearth */
    var subs={},rest=[];q.m.forEach(function(i){var s=N[i].sub;if(s)(subs[s]=subs[s]||[]).push(i);else rest.push(i)});
    var names=Object.keys(subs).filter(function(s){return subs[s].length>1});Object.keys(subs).forEach(function(s){if(subs[s].length<2){rest=rest.concat(subs[s]);N[subs[s][0]].sub=''}});
    var n=q.m.length,inner=n>16?Math.min(rest.length,Math.round(n*.36)):0,outerRest=rest.slice(0,rest.length-inner),innerM=rest.slice(rest.length-inner),outer=[];
    var block=0;names.forEach(function(s,k){outer=outer.concat(subs[s]);block+=subs[s].length;if(k<names.length-1){var sp=outerRest.splice(0,Math.min(2,outerRest.length));outer=outer.concat(sp);block+=sp.length}});
    outer=outer.concat(outerRest);
    var start=a0+Math.PI-(block?(block-1)/outer.length*Math.PI:0);      /* the sub-clusters, a star or two apart, are centred on the side that faces the hearth */
    q.outer=outer.slice();
    outer.forEach(function(i,k){var b=start+k/outer.length*Math.PI*2;N[i].x=cx+Math.cos(b)*rr;N[i].y=cy+Math.sin(b)*rr*1.12;N[i].kin=gi;N[i].b=b});
    innerM.forEach(function(i,k){var b=a0+.4+k/innerM.length*Math.PI*2;N[i].x=cx+Math.cos(b)*rr*.52;N[i].y=cy+Math.sin(b)*rr*.52*1.12;N[i].kin=gi;N[i].b=b});
    names.forEach(function(s){var m=subs[s],mx=0,my=0;m.forEach(function(i,k){mx+=N[i].x;my+=N[i].y;if(k)links.push([m[k-1],i,0])});mx/=m.length;my/=m.length;
      var dx=mx-cx,dy=my-cy,dl=Math.sqrt(dx*dx+dy*dy)||1;SUBK.push({name:s,m:m,g:gi,x:mx,y:my,ox:dx/dl,oy:dy/dl})});
    return{m:q.m,o:q.outer,x:cx,y:cy,r:rr,name:q.t,an:a0}});
  /* the site's own "related" / "also" links, kept (dotted) */
  cards.forEach(function(x,i){(x.related||[]).concat(x.also||[]).forEach(function(id){var j=by[id];if(j!=null&&j!==i)links.push([i,j,1])})});
  var seen={};E=links.filter(function(l){var k=Math.min(l[0],l[1])+'-'+Math.max(l[0],l[1]);if(seen[k])return false;seen[k]=1;return true})});
  return ready}

/* ---------- drawing: the sky's own look (glow, hairlines, drift), as the map draws it ---------- */
function sprites(){var c=ink(),key=c.join(',');if(key===sprKey)return;sprKey=key;
  function disc(size,stops){var s=document.createElement('canvas');s.width=s.height=size;var q=s.getContext('2d'),gr=q.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);stops.forEach(function(st){gr.addColorStop(st[0],rgba(c,st[1]))});q.fillStyle=gr;q.fillRect(0,0,size,size);return s}
  SPR.glow=disc(128,[[0,1],[.06,.95],[.14,.42],[.34,.12],[.62,.035],[1,0]]);SPR.bloom=disc(256,[[0,.34],[.25,.16],[.55,.05],[1,0]])}
function box(){var top=112,bot=H-126,s=Math.min(W-16,bot-top,860);return{x:W/2-s/2,y:(top+bot)/2-s/2*Math.min(1,(bot-top)/s),w:s,h:Math.min(s,bot-top)}}
function pos(n,b){return[b.x+n.x*b.w-ptr.x*16*n.d,b.y+n.y*b.h-ptr.y*13*n.d]}
function frame(now){raf=0;if(!open)return;var b=box(),c=ink(),t=(now-T0)/1000,grow=STILL?1:Math.min(1,t/.7);grow=1-Math.pow(1-grow,3);sprites();
  if(!STILL){if(!ptr.has){ptr.tx=Math.sin(t/5.2)*.22;ptr.ty=Math.cos(t/6.7)*.16}ptr.x+=(ptr.tx-ptr.x)*.06;ptr.y+=(ptr.ty-ptr.y)*.06}
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);var P=N.map(function(n){var p=pos(n,b),cx=b.x+b.w/2,cy=b.y+b.h/2;return[cx+(p[0]-cx)*grow,cy+(p[1]-cy)*grow]});
  var selKin=SEL>=0?N[SEL].kin:-2,lit={};if(SEL>=0){lit[SEL]=1;E.forEach(function(l){if(l[0]===SEL)lit[l[1]]=1;if(l[1]===SEL)lit[l[0]]=1});if(N[SEL].sub)N.forEach(function(n,i){if(n.kin===selKin&&n.sub===N[SEL].sub)lit[i]=1})}
  g.lineCap='round';g.lineWidth=.8;KIN.forEach(function(k,gi){if(!k.o||k.o.length<3)return;g.strokeStyle=rgba(c,(SEL>=0?(gi===selKin?.26:.07):.13)*grow);g.beginPath();k.o.forEach(function(i,q){var a=P[i];if(q)g.lineTo(a[0],a[1]);else g.moveTo(a[0],a[1])});g.closePath();g.stroke()});
  E.forEach(function(l){var a=P[l[0]],q=P[l[1]],on=lit[l[0]]&&lit[l[1]];g.setLineDash(l[2]?[1,5]:[]);g.lineWidth=on?1:.8;g.strokeStyle=rgba(c,(on?.7:(SEL>=0?.12:.3))*grow);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(q[0],q[1]);g.stroke()});g.setLineDash([]);
  g.globalCompositeOperation='lighter';
  N.forEach(function(n,i){var p=P[i],kin=!!n.sub,on=!!lit[i],hv=i===HOT,tw=STILL?1:.84+.16*Math.sin(t*1.2+n.tw),k=(kin?9:6)*(on?1.7:1)*(hv?1.3:1);
    g.globalAlpha=(SEL>=0?(on?1:.32):(kin?.95:.62))*tw*grow;g.drawImage(SPR.glow,p[0]-k,p[1]-k,k*2,k*2);
    if(i===SEL){g.globalAlpha=.8*grow;g.strokeStyle=rgba(c,1);g.lineWidth=1;g.beginPath();g.arc(p[0],p[1],12,0,6.2832);g.stroke()}});
  var cx=b.x+b.w/2-ptr.x*20,cy=b.y+b.h/2-ptr.y*16;g.globalAlpha=.9*grow;g.drawImage(SPR.bloom,cx-70,cy-70,140,140);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  /* names, in the sky's own lettering: the type of work outside its ring; the client or artist beside its own stars. Where two names would
     meet, the smaller one moves along (worked out once for this screen size, so the names do not swim). */
  if(LAB.k!==W+'x'+H+'x'+N.length){LAB={k:W+'x'+H+'x'+N.length,a:[]};var boxes=[];
    function fits(x,y,hw,own){for(var q=0;q<boxes.length;q++){var o=boxes[q];if(Math.abs(x-o[0])<hw+o[2]+6&&Math.abs(y-o[1])<13)return false}
      for(var z=0;z<KIN.length;z++){if(z===own)continue;var kc=KIN[z],kx=b.x+kc.x*b.w,ky=b.y+kc.y*b.h,kr=kc.r*Math.max(b.w,b.h*1.12)+8;if(Math.max(0,Math.abs(x-kx)-hw)<kr&&Math.abs(y-ky)<kr)return false}   /* not across another type's ring */
      return x-hw>4&&x+hw<W-4}
    g.font='400 9.5px "Julius Sans One",Poppins,sans-serif';try{g.letterSpacing='1.6px'}catch(e){}
    KIN.forEach(function(k){var nm=k.name.toUpperCase(),hw=g.measureText(nm).width/2,px=b.x+k.x*b.w,py=b.y+k.y*b.h,out=k.r*Math.max(b.w,b.h*1.12)+15,
        lx=Math.max(8+hw,Math.min(W-8-hw,px+Math.cos(k.an)*out*.9)),ly=py+Math.sin(k.an)*out;boxes.push([lx,ly,hw]);LAB.a.push({t:nm,big:1,g:LAB.a.length,ax:k.x,ay:k.y,dx:lx-px,dy:ly-py})});
    g.font='400 8px "Julius Sans One",Poppins,sans-serif';try{g.letterSpacing='1.2px'}catch(e){}
    SUBK.forEach(function(q){var nm=q.name.toUpperCase(),hw=g.measureText(nm).width/2,px=b.x+q.x*b.w,py=b.y+q.y*b.h,best=null;
      [[q.ox,q.oy],[-q.ox,-q.oy],[0,1],[0,-1],[1,0],[-1,0]].some(function(d){for(var s=0;s<4;s++){var lx=px+d[0]*(14+hw*Math.abs(d[0])+s*9),ly=py+d[1]*(15+s*11);if(fits(lx,ly,hw,q.g)){best=[lx,ly];return true}}return false});
      if(!best)best=[Math.max(6+hw,Math.min(W-6-hw,px+q.ox*(14+hw))),py+q.oy*15];boxes.push([best[0],best[1],hw]);LAB.a.push({t:nm,big:0,g:q.g,sub:q.name,ax:q.x,ay:q.y,dx:best[0]-px,dy:best[1]-py})})}
  g.textAlign='center';g.textBaseline='middle';
  LAB.a.forEach(function(l){g.font=(l.big?'400 9.5px':'400 8px')+' "Julius Sans One",Poppins,sans-serif';try{g.letterSpacing=l.big?'1.6px':'1.2px'}catch(e){}
    var x=b.x+l.ax*b.w-ptr.x*14+l.dx,y=b.y+l.ay*b.h-ptr.y*11+l.dy,on=SEL>=0&&(l.big?l.g===selKin:(N[SEL].sub===l.sub&&N[SEL].kin===l.g));
    g.fillStyle=rgba(c,(SEL>=0?(on?.95:.22):(l.big?.62:.5))*grow);g.fillText(l.t,x,y)});
  var mk=$('.fm-mark');mk.style.transform='translate('+(cx).toFixed(1)+'px,'+(cy).toFixed(1)+'px) translate(-50%,-50%)';mk.style.opacity=String(grow);
  if(!STILL||grow<1)raf=requestAnimationFrame(frame)}
function kick(){if(!raf&&open)raf=requestAnimationFrame(frame)}
function hit(px,py){var b=box(),best=-1,bd=24;N.forEach(function(n,i){var p=pos(n,b),d=Math.hypot(p[0]-px,p[1]-py);if(d<bd){bd=d;best=i}});return best}
function tell(){var n=SEL>=0?N[SEL]:null,l1=$('.fm-l1'),l2=$('.fm-l2'),go=$('.fm-go');
  if(!n){l1.textContent=N.length+' works';l2.textContent=KIN.length+' kinds of work \u00b7 tap a star';go.hidden=true;return}
  var kinNames=[];E.forEach(function(l){var o=l[0]===SEL?l[1]:l[1]===SEL?l[0]:-1;if(o>=0&&kinNames.indexOf(N[o].t)<0)kinNames.push(N[o].t)});
  if(n.sub)N.forEach(function(q,i){if(i!==SEL&&q.kin===n.kin&&q.sub===n.sub&&kinNames.indexOf(q.t)<0)kinNames.push(q.t)});
  l1.textContent=n.t;l2.textContent=[n.type,n.sub].filter(Boolean).join(' \u00b7 ')+(kinNames.length?' \u00b7 kin: '+kinNames.slice(0,3).join(', ')+(kinNames.length>3?' +'+(kinNames.length-3):''):'');go.hidden=false}

/* ---------- the layer ---------- */
function build(){root=document.createElement('div');root.id='fam';root.hidden=true;root.tabIndex=-1;root.setAttribute('role','dialog');root.setAttribute('aria-label','the family of the work');
  root.innerHTML='<canvas aria-hidden="true"></canvas><b class="fm-mark" lang="cr" aria-hidden="true">ᑕᐣᓯ</b><p class="fm-t">the family</p><button type="button" class="fm-x" aria-label="put the family away">×</button>'+
    '<div class="fm-info"><p class="fm-l1"></p><p class="fm-l2"></p><button type="button" class="fm-go" hidden>open ›</button></div>';
  cv=$('canvas');g=cv.getContext('2d');
  $('.fm-x').addEventListener('click',function(e){e.stopPropagation();close()});
  $('.fm-go').addEventListener('click',function(e){e.stopPropagation();var n=N[SEL];if(!n)return;close(function(){if(window.__u1&&__u1.open)__u1.open(n.id)})});
  var d0=null;
  cv.addEventListener('pointerdown',function(e){d0={x:e.clientX,y:e.clientY,t:performance.now()}});
  cv.addEventListener('pointermove',function(e){if(e.pointerType!=='touch'){ptr.has=true;ptr.tx=e.clientX/W-.5;ptr.ty=e.clientY/H-.5;var h=hit(e.clientX,e.clientY);if(h!==HOT){HOT=h;cv.style.cursor=h>=0?'pointer':''}kick()}});
  cv.addEventListener('pointerup',function(e){if(!d0)return;var dy=e.clientY-d0.y,dx=e.clientX-d0.x,q=d0;d0=null;
    if(dy<-70&&Math.abs(dy)>Math.abs(dx)*1.3){close();return}                     /* pull up: put it away, back down to the arrival */
    if(Math.abs(dx)+Math.abs(dy)>10)return;var i=hit(e.clientX,e.clientY);
    if(i>=0){SEL=i;tell();if(window.GJ_SKYFX)GJ_SKYFX.chime(GJ_SKYFX.PENT[i%5],.4)}else if(SEL>=0){SEL=-1;tell()}else close();kick()});
  cv.addEventListener('wheel',function(e){e.preventDefault();if(e.deltaY>30)close()},{passive:false});
  ['pointerdown','pointermove','pointerup','mousedown','mouseup','click','dblclick','touchstart','touchmove','touchend','wheel','contextmenu'].forEach(function(n){root.addEventListener(n,function(e){e.stopPropagation()},{passive:true})});
  document.body.appendChild(root)}
function size(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px'}
function st(k){var s={};for(var q in (history.state||{}))s[q]=history.state[q];if(k)s.gjfam=1;return s}
var after=null;
function show(on,quiet){if(on===open)return;if(on&&!root)build();open=on;document.documentElement.classList.toggle('fam-on',on);
  if(on){root.hidden=false;size();SEL=-1;HOT=-1;ptr.has=false;load().then(function(){if(!open)return;T0=performance.now();tell();void root.offsetWidth;root.classList.add('on');kick()});
    if(!quiet){try{history.pushState(st(1),'')}catch(e){}}try{root.focus({preventScroll:true})}catch(e){}}
  else{root.classList.remove('on');setTimeout(function(){if(!open&&root)root.hidden=true},420)}}
function reveal(){if(!open)show(true)}
function close(then){if(!open){if(then)then();return}after=then||null;if(history.state&&history.state.gjfam){try{history.back();return}catch(e){}}show(false);if(after){var f=after;after=null;f()}}
addEventListener('popstate',function(e){var k=!!(e.state&&e.state.gjfam);
  if(open&&!k){e.stopImmediatePropagation();show(false);if(after){var f=after;after=null;setTimeout(f,0)}return}
  if(!open&&k){e.stopImmediatePropagation();show(true,true)}},true);
addEventListener('keydown',function(e){var h=document.documentElement.classList;
  if(open){if(h.contains('gj-map-open')||h.contains('mm-open'))return;
    if(e.key==='Escape'||e.key==='ArrowDown'||e.key==='PageDown'){e.preventDefault();e.stopImmediatePropagation();close();return}
    if(e.key==='Enter'&&SEL>=0){e.preventDefault();e.stopImmediatePropagation();$('.fm-go').click();return}
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();SEL=(SEL+(e.key==='ArrowRight'?1:-1)+N.length)%N.length;tell();kick()}
    e.stopImmediatePropagation();return}
  /* from the arrival, up is the family */
  if(phase()==='arrive'&&(e.key==='ArrowUp'||e.key==='PageUp')&&!h.contains('gj-map-open')&&!h.contains('mm-open')&&!h.contains('mk-on')){e.preventDefault();e.stopImmediatePropagation();reveal()}},true);
/* from the arrival: a scroll up, or a pull down that starts in the top of the screen, reveals the family (the arrival itself does not move) */
var WU=0,WT=0;
addEventListener('wheel',function(e){if(open||phase()!=='arrive'||e.deltaY>=0||document.documentElement.classList.contains('gj-map-open'))return;
  var t=performance.now();if(t-WT>400)WU=0;WT=t;WU+=-e.deltaY*(e.deltaMode===1?32:1);e.stopImmediatePropagation();if(WU>60){WU=0;reveal()}},{capture:true,passive:true});
var PD=null;
addEventListener('pointerdown',function(e){PD=null;if(open||phase()!=='arrive'||!e.isPrimary||e.clientY>innerHeight*.42)return;var t=e.target;if(t&&t.closest&&t.closest('#gj-back,#gj-dial,#gj-red,#gj-map,#mkp,#markmenu,a,button')&&!t.closest('#sg-mark'))return;PD={id:e.pointerId,x:e.clientX,y:e.clientY,mine:false}},true);
addEventListener('pointermove',function(e){if(!PD||e.pointerId!==PD.id)return;var dx=e.clientX-PD.x,dy=e.clientY-PD.y;
  if(!PD.mine){if(dy>10&&dy>Math.abs(dx)*1.4)PD.mine=true;else if(Math.abs(dx)>14||dy<-10){PD=null;return}else return}
  e.stopImmediatePropagation();if(dy>72&&!open)reveal()},true);
function pend(e){if(!PD||e.pointerId!==PD.id)return;var mine=PD.mine;PD=null;if(mine){e.stopImmediatePropagation();e.preventDefault()}}
addEventListener('pointerup',pend,true);addEventListener('pointercancel',pend,true);
addEventListener('click',function(e){if(open&&e.target&&!root.contains(e.target)&&!(e.target.closest&&e.target.closest('#gj-back,#gj-dial,#gj-red,#gj-map,#markmenu')))e.stopImmediatePropagation()},true);
addEventListener('resize',function(){if(open&&root){size();kick()}});
addEventListener('gj-tog',function(){if(open)kick()});
function boot(){if(history.state&&history.state.gjfam)show(true,true);else if(location.hash==='#family'||H0==='#family'){try{history.replaceState(history.state,'',location.pathname+location.search+'#/')}catch(e){}show(true)}}
var H0=location.hash;if(document.readyState==='complete')setTimeout(boot,700);else addEventListener('load',function(){setTimeout(boot,700)});
window.GJ_FAMILY={reveal:reveal,close:function(){close()},isOpen:function(){return open},
  state:function(){return{open:open,works:N.length,kin:KIN.map(function(k){return k.name+' ('+k.m.length+')'}),subs:SUBK.map(function(q){return q.name+' ('+q.m.length+')'}),links:E.length,related:E.filter(function(l){return l[2]===1}).length,about:N.filter(function(n){return n.ch==='about'}).length,sel:SEL>=0?N[SEL].id:null}},
  at:function(id){for(var i=0;i<N.length;i++)if(N[i].id===id){var p=pos(N[i],box());return[p[0],p[1]]}return null}};
})();
