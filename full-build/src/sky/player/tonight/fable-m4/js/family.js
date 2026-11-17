/* The family layer · m4 (Pack A §3, Gill's pick, Nov 15). A constellation that sits above the arrival, hidden until it is revealed.
   It is the family of the work, drawn as a graph and not as folders: every work is a star, and stars are joined only where the site's
   own data says two works are kin (the same credit line; a "related" or an "also" link in data.json). Kin gather into small
   constellations named by what they share; the rest of the family is the dust around them, mixed, with no chapter fences.
   The ᑕᐣᓯ Mark is at the hearth. Nothing hangs from it.
   Revealed from the arrival by going up: a pull down from the top of the arrival, a scroll up, or the up arrow. It is also a star on the
   map. Put away by going back down (pull up, scroll down, down arrow), by ×, Esc, a tap on the empty sky, or Back.
   It is one history step: Back puts it away and the arrival (or the sky) under it is exactly as it was.
   A tap on a star names the work and lights its kin; "open ›" goes to it in the sky. */
(function(){
'use strict';
if(window.GJ_FAMILY)return;
var OFF=['hike','reel-24'],root=null,cv=null,g=null,info=null,open=false,raf=0,T0=0,W=0,H=0,DPR=1,N=[],E=[],KIN=[],SEL=-1,HOT=-1,ready=null,ptr={x:0,y:0,tx:0,ty:0,has:false},SPR={},sprKey='';
var STILL=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function $(s){return root.querySelector(s)}
function rnd(s){return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function red(){return document.documentElement.classList.contains('rm')}
function ink(){if(!red())return[230,237,240];return document.documentElement.getAttribute('data-red-tone')==='rose'?[255,176,184]:[255,68,87]}
function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
function phase(){return window.__u1?__u1.phase:''}

/* ---------- the family, from the site's own data ---------- */
function load(){if(ready)return ready;ready=fetch('data.json').then(function(r){return r.json()}).then(function(d){
  var cards=[],by={};(d.chapters||[]).forEach(function(c){(c.cards||[]).forEach(function(x){if(OFF.indexOf(x.slug)<0&&x.id&&x.title){by[x.id]=cards.length;cards.push(x)}})});
  var par=cards.map(function(_,i){return i});function find(a){while(par[a]!==a){par[a]=par[par[a]];a=par[a]}return a}function join(a,b){a=find(a);b=find(b);if(a!==b)par[b]=a}
  var cred={},links=[];
  cards.forEach(function(x,i){(x.credits||[]).forEach(function(c){var k=String(c).trim().toLowerCase();if(!k||/^gill james/.test(k))return;   /* his own credit is not kinship: everything here is his */if(cred[k]!=null){join(cred[k],i);links.push([cred[k],i,0])}cred[k]=i});
    (x.related||[]).concat(x.also||[]).forEach(function(id){var j=by[id];if(j!=null&&j!==i){join(i,j);links.push([i,j,1])}})});
  var groups={};cards.forEach(function(x,i){var r=find(i);(groups[r]=groups[r]||[]).push(i)});
  var kin=Object.keys(groups).map(function(k){return groups[k]}).filter(function(a){return a.length>1}).sort(function(a,b){return b.length-a.length||a[0]-b[0]});
  var inKin={};kin.forEach(function(a,gi){a.forEach(function(i){inKin[i]=gi})});
  var singles=cards.map(function(_,i){return i}).filter(function(i){return inKin[i]==null}),r=rnd(29);
  for(var s=singles.length-1;s>0;s--){var q=Math.floor(r()*(s+1)),t=singles[s];singles[s]=singles[q];singles[q]=t}      /* mixed: no chapter fences */
  N=cards.map(function(x,i){return{i:i,id:x.id,t:x.title,ch:x.chapter,role:x.role||'',year:x.year||'',credits:x.credits||[],kin:inKin[i]==null?-1:inKin[i],x:0,y:0,d:.6+r()*.9,tw:r()*6.28}});
  /* kin constellations on a ring round the hearth, the largest at the top, each a small ring of its own */
  KIN=kin.map(function(a,gi){var an=-Math.PI/2+gi/kin.length*Math.PI*2,cx=.5+Math.cos(an)*.30,cy=.5+Math.sin(an)*.29,rr=.028+.011*a.length,names={};
    a.forEach(function(i,k){var b=an+Math.PI+k/a.length*Math.PI*2;N[i].x=cx+Math.cos(b)*rr;N[i].y=cy+Math.sin(b)*rr*1.15;(cards[i].credits||[]).forEach(function(c){if(!/^gill james/i.test(c))names[c]=(names[c]||0)+1})});
    var nm=Object.keys(names).sort(function(p,q){return names[q]-names[p]})[0]||'';return{m:a,x:cx,y:cy,r:rr,name:nm,an:an}});
  singles.forEach(function(i,k){var an=k/singles.length*Math.PI*2+.13,ring=k%3,rx=.40+ring*.035+(r()-.5)*.02,ry=.41+ring*.035+(r()-.5)*.02;N[i].x=.5+Math.cos(an)*rx;N[i].y=.5+Math.sin(an)*ry});
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
  var selKin=SEL>=0?N[SEL].kin:-2,lit={};if(SEL>=0){lit[SEL]=1;E.forEach(function(l){if(l[0]===SEL)lit[l[1]]=1;if(l[1]===SEL)lit[l[0]]=1});if(selKin>=0)KIN[selKin].m.forEach(function(i){lit[i]=1})}
  g.lineCap='round';E.forEach(function(l){var a=P[l[0]],q=P[l[1]],on=lit[l[0]]&&lit[l[1]];g.setLineDash(l[2]?[1,5]:[]);g.lineWidth=on?1:.8;g.strokeStyle=rgba(c,(on?.7:(SEL>=0?.12:.3))*grow);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(q[0],q[1]);g.stroke()});g.setLineDash([]);
  g.globalCompositeOperation='lighter';
  N.forEach(function(n,i){var p=P[i],kin=n.kin>=0,on=!!lit[i],hv=i===HOT,tw=STILL?1:.84+.16*Math.sin(t*1.2+n.tw),k=(kin?10:5.5)*(on?1.7:1)*(hv?1.3:1);
    g.globalAlpha=(SEL>=0?(on?1:.32):(kin?.95:.5))*tw*grow;g.drawImage(SPR.glow,p[0]-k,p[1]-k,k*2,k*2);
    if(i===SEL){g.globalAlpha=.8*grow;g.strokeStyle=rgba(c,1);g.lineWidth=1;g.beginPath();g.arc(p[0],p[1],12,0,6.2832);g.stroke()}});
  var cx=b.x+b.w/2-ptr.x*20,cy=b.y+b.h/2-ptr.y*16;g.globalAlpha=.9*grow;g.drawImage(SPR.bloom,cx-70,cy-70,140,140);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  /* the names kin share, in the sky's own lettering */
  g.font='400 9.5px "Julius Sans One",Poppins,sans-serif';g.textAlign='center';g.textBaseline='middle';try{g.letterSpacing='1.6px'}catch(e){}
  KIN.forEach(function(k,gi){if(!k.name)return;var px=b.x+k.x*b.w-ptr.x*14,py=b.y+k.y*b.h-ptr.y*11,out=k.r*b.h*1.15+15,lx=px+Math.cos(k.an)*0,ly=py+(Math.sin(k.an)<-.2?-out:out);
    lx=Math.max(8+g.measureText(k.name.toUpperCase()).width/2,Math.min(W-8-g.measureText(k.name.toUpperCase()).width/2,lx));
    g.fillStyle=rgba(c,(SEL>=0?(gi===selKin?.95:.25):.6)*grow);g.fillText(k.name.toUpperCase(),lx,ly)});
  var mk=$('.fm-mark');mk.style.transform='translate('+(cx).toFixed(1)+'px,'+(cy).toFixed(1)+'px) translate(-50%,-50%)';mk.style.opacity=String(grow);
  if(!STILL||grow<1)raf=requestAnimationFrame(frame)}
function kick(){if(!raf&&open)raf=requestAnimationFrame(frame)}
function hit(px,py){var b=box(),best=-1,bd=24;N.forEach(function(n,i){var p=pos(n,b),d=Math.hypot(p[0]-px,p[1]-py);if(d<bd){bd=d;best=i}});return best}
function tell(){var n=SEL>=0?N[SEL]:null,l1=$('.fm-l1'),l2=$('.fm-l2'),go=$('.fm-go');
  if(!n){l1.textContent=N.length+' works';l2.textContent=KIN.length+' kin constellations · tap a star';go.hidden=true;return}
  var kinNames=[];E.forEach(function(l){var o=l[0]===SEL?l[1]:l[1]===SEL?l[0]:-1;if(o>=0)kinNames.push(N[o].t)});if(n.kin>=0)KIN[n.kin].m.forEach(function(i){if(i!==SEL&&kinNames.indexOf(N[i].t)<0)kinNames.push(N[i].t)});
  l1.textContent=n.t;l2.textContent=[n.ch,n.role,n.year].filter(Boolean).join(' · ')+(kinNames.length?' · kin: '+kinNames.slice(0,3).join(', ')+(kinNames.length>3?' +'+(kinNames.length-3):''):'');go.hidden=false}

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
  state:function(){return{open:open,works:N.length,kin:KIN.map(function(k){return k.name+' ('+k.m.length+')'}),links:E.length,sel:SEL>=0?N[SEL].id:null}},
  at:function(id){for(var i=0;i<N.length;i++)if(N[i].id===id){var p=pos(N[i],box());return[p[0],p[1]]}return null}};
})();
