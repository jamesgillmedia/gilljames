/* B · Plan Chest — a flat-file cabinet. Glass-top lead case, one drawer per room, prints that lift like paper toward the light.
   Nav: tap a front = drawer slides out (one gesture). Band = swap (replaces history, so Back always pushes in).
   ▾ push in · swipe down · Esc · Back = one level out. Lifted print lays back down first. */
(function(){'use strict';if(G.V!=='B')return;
var d=document,app=d.getElementById('app'),R=G.R,el=G.el,img=G.img,esc=G.esc,D=G.D;
var MS=950;
/* ---------- prints per room ---------- */
function prints(k){var out=[];
  if(k==='objects')D.objects.forEach(function(o){out.push({id:o.id,src:o.src,th:o.th,w:o.w,h:o.h,it:o,room:k})});
  if(k==='photo')G.room('photo').items.forEach(function(p){out.push({id:p.id,src:p.src,th:p.th,w:p.w,h:p.h,it:p,room:k})});
  if(k==='film')D.film.forEach(function(f){f.stills.forEach(function(s,i){out.push({id:f.id+'.'+i,src:s.src,th:s.th,w:s.w,h:s.h,it:f,room:k,grp:f.id})})});
  if(k==='spaces')D.spaces.forEach(function(s){out.push({id:s.id,src:s.src,th:s.th,w:s.w,h:s.h,it:s,room:k,grp:s.id});s.views.forEach(function(v,j){out.push({id:s.id+'.'+j,src:v.src,th:v.src,w:v.w,h:v.h,it:s,room:k,grp:s.id,view:1})})});
  return out}
function findPrint(k,id){var p=prints(k);for(var i=0;i<p.length;i++)if(p[i].id===id)return p[i];return null}
var COUNT={objects:D.objects.length+' pieces',film:'2 films · stills',photo:D.photo.length+' photographs',spaces:'Spirit Eye of skwácháýs',about:'bio · poem · contact'};
/* ---------- the chest ---------- */
var chest=el('div','b-chest',null,app);
chest.innerHTML='<header class="b-top"><a class="b-wm" href="#/">Gill James</a><button class="b-idx" type="button">index</button></header>';
var caseEl=el('section','b-case',null,chest);caseEl.setAttribute('aria-label','the lead case');
el('div','b-glass',null,caseEl);
var LEAD=[{r:'spaces',id:'p01-eye'},{r:'film',id:'one-with-the-devil.0'},{r:'objects',id:'crescent-rim-of-a-cup'},{r:'objects',id:'stone-paper-cup'}];
var leadRow=el('div','b-leads',null,caseEl);
LEAD.forEach(function(L,i){var p=findPrint(L.r,L.id);if(!p)return;var a=el('a','b-lead l'+i,null,leadRow);a.href='#/'+L.r+'/'+L.id;a.dataset.r=L.r+'/'+L.id;
  var fr=el('span','b-lf',null,a);fr.style.aspectRatio=p.w+'/'+p.h;img(p.src,'',p.it.t||'photograph',fr);
  el('span','b-lc',G.caption(p.it,false),a)});
var HF=[.86,.66,.56,.78];
function layoutLeads(){var ph=innerWidth<600;[].forEach.call(leadRow.children,function(a,i){a.querySelector('.b-lf').style.height=ph?'':''});if(ph)return;
  var H=leadRow.clientHeight-50,W=leadRow.clientWidth,gap=innerWidth*.032,sum=0,ws=[];
  [].forEach.call(leadRow.children,function(a,i){var f=a.querySelector('.b-lf'),ar=f.style.aspectRatio.split('/');var w=H*HF[i]*ar[0]/ar[1];ws.push(w);sum+=w});
  var k=Math.min(1,(W-gap*(ws.length-1))/sum);
  [].forEach.call(leadRow.children,function(a,i){var f=a.querySelector('.b-lf');f.style.height=(H*HF[i]*k).toFixed(1)+'px';a.style.width=(ws[i]*k).toFixed(1)+'px'})}
var drawers=el('div','b-drawers',null,chest);
G.ROOMS.forEach(function(r,i){var dr=el('div','b-dr',null,drawers);dr.dataset.k=r.k;
  var gap=el('div','b-gap',null,dr),strip=el('div','b-strip',null,gap);
  var ps=prints(r.k).filter(function(p){return!p.view});
  if(r.k==='about'){strip.classList.add('b-poemstrip');strip.textContent=D.poem.join('  ·  ')}
  else{ps.concat(ps).slice(0,24).forEach(function(p){img(p.th,'',p.it.t||'',strip)})}
  var f=el('button','b-front',null,dr);f.type='button';f.dataset.k=r.k;
  f.innerHTML='<span class="n">'+r.n+'</span><span class="c">'+esc(COUNT[r.k])+'</span><i class="pull" aria-hidden="true"></i><kbd>'+(i+1)+'</kbd>'});
el('p','b-foot','Vancouver',chest);
/* ---------- open-drawer layers ---------- */
var bands=el('nav','b-bands',null,app);bands.setAttribute('aria-label','other drawers');
var bwm=el('a','b-bwm','Gill James',bands);bwm.href='#/';
G.ROOMS.forEach(function(r){var b=el('button','b-band',r.n,bands);b.type='button';b.dataset.k=r.k});
var panel=el('section','b-panel',null,app);panel.setAttribute('aria-label','open drawer');
var felt=el('div','b-felt',null,panel);var push=el('button','b-push',null,panel);push.type='button';
var lift=el('div','b-lift',null,app);var lightEl=el('div','b-light',null,lift);var liftCap=el('div','b-liftcap',null,lift);
var idx=G.index(function(r){R.go(r,{replace:true})});
G.player();G.devToggle();
var openK=null,lifted=null,anim=false;
function bandH(){return innerWidth<600?28:30}
function topH(){return bandH()*4}
/* ---------- drawer contents: prints laid on graphite paper, unevenly, by hand ---------- */
function rnd(n){var x=Math.sin(n*91.7+17.3)*43758.5453;return x-Math.floor(x)}
function scatter(list,host,W,seed){var y=0,i=0,phone=W<600,base=phone?150:230,gapx=phone?18:46;
  while(i<list.length){var row=[],rw=0,rh=base*(phone?1:[1,1.32,.86,1.12][(seed+i)%4]);
    while(i<list.length){var p=list[i],s=(rnd(seed+i*3)>.78?1.35:1)*(p.view?.62:1),w=rh*s*p.w/p.h;if(phone&&w>W*.92)w=W*.92;if(row.length&&rw+w+gapx>W*.94)break;row.push({p:p,w:w,h:w*p.h/p.w});rw+=w+gapx;i++;if(phone&&row.length>=2)break}
    var x=(W-rw+gapx)/2+(rnd(seed+i)-.5)*W*.06,mh=0;
    row.forEach(function(c,j){var yy=y+(rnd(seed+i*7+j)-.3)*(phone?18:34),rot=(rnd(seed*3+i+j*5)-.5)*2.2;
      var e=el('button','b-print'+(c.p.view?' v':''),null,host);e.type='button';e.dataset.id=c.p.id;e.style.cssText='left:'+x.toFixed(1)+'px;top:'+yy.toFixed(1)+'px;width:'+c.w.toFixed(1)+'px;height:'+c.h.toFixed(1)+'px;--r:'+rot.toFixed(2)+'deg';
      e.setAttribute('aria-label',(c.p.it.t||'photograph')+' — lift');img(c.p.src,'',c.p.it.t||'',e);x+=c.w+gapx;mh=Math.max(mh,yy-y+c.h)});
    y+=mh+(phone?34:60)}
  return y}
function fill(k){felt.innerHTML='';felt.scrollTop=0;var W=felt.clientWidth||innerWidth,phone=W<600;
  var inner=el('div','b-sheet',null,felt);var y=phone?26:40;
  function head(html){var h=el('div','b-head',html,inner);h.style.top=y+'px';y+=h.offsetHeight+(phone?14:22)}
  if(k==='about'){about(inner);return}
  if(k==='film'||k==='spaces'){var groups=k==='film'?D.film:D.spaces;
    groups.forEach(function(g,gi){head(G.caption(Object.assign({room:k},g),true));var host=el('div','b-host',null,inner);host.style.top=y+'px';
      var h=scatter(prints(k).filter(function(p){return p.grp===g.id}),host,W,gi*13+5);host.style.height=h+'px';y+=h+(phone?30:56)})}
  else{if(k==='photo')head('<span class="cm">photographs · titles to come</span>');var host=el('div','b-host',null,inner);host.style.top=y+'px';var h=scatter(prints(k),host,W,k.length*7);host.style.height=h+'px';y+=h}
  inner.style.height=(y+(phone?140:160))+'px'}
function about(inner){inner.classList.add('b-about');
  var h='<div class="b-bio">'+D.bio.map(function(p,i){return '<p'+(i?'':' class="lede"')+'>'+esc(p)+'</p>'}).join('')+'</div>';
  h+='<div class="b-poem" aria-label="the poem">'+D.poem.map(function(l){return '<span>'+esc(l)+'</span>'}).join('')+'</div>';
  h+='<p class="b-contact"><a href="mailto:'+esc(D.email)+'">'+esc(D.email)+'</a></p>';
  inner.innerHTML=h}
/* ---------- motion: drawer slides out of its front; a lifted print rises toward the light ---------- */
function frontRect(k){var f=chest.querySelector('.b-front[data-k="'+k+'"]');var r=f.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight){f.scrollIntoView({block:'center'});r=f.getBoundingClientRect()}return r}
function setBands(k,on){bands.classList.toggle('on',on);[].forEach.call(bands.children,function(b){var hide=b.dataset.k===k;b.hidden=hide})}
function openDrawer(k,instant){openK=k;panel.dataset.k=k;fill(k);
  push.innerHTML='<span class="n">'+G.room(k).n+'</span><span class="c">▾ push in</span>';
  setBands(k,true);panel.classList.add('on');var T=topH(),r=frontRect(k),H=innerHeight,y0=r.top-T;
  if(instant){panel.style.clipPath='inset(0 0 0 0)';felt.style.transform='none';bands.style.transform='none';return}
  anim=true;G.tween(MS,function(e){panel.style.clipPath='inset('+(Math.max(0,r.top-T)*(1-e)).toFixed(1)+'px 0 '+((H-r.bottom)*(1-e)).toFixed(1)+'px 0)';
    felt.style.transform='translateY('+(y0*(1-e)*.35).toFixed(1)+'px)';bands.style.transform='translateY('+(-100*(1-e)).toFixed(1)+'%)';chest.style.opacity=(1-.82*e).toFixed(3)},function(){anim=false});}
function closeDrawer(instant){if(!openK)return;var k=openK;openK=null;var T=topH(),r=frontRect(k),H=innerHeight;
  if(instant){panel.classList.remove('on');setBands(null,false);chest.style.opacity=1;return}
  anim=true;G.tween(MS,function(e){var q=1-e;panel.style.clipPath='inset('+(Math.max(0,r.top-T)*(1-q)).toFixed(1)+'px 0 '+((H-r.bottom)*(1-q)).toFixed(1)+'px 0)';
    felt.style.transform='translateY('+((r.top-T)*(1-q)*.35).toFixed(1)+'px)';bands.style.transform='translateY('+(-100*(1-q)).toFixed(1)+'%)';chest.style.opacity=(1-.82*q).toFixed(3)},
    function(){anim=false;panel.classList.remove('on');setBands(null,false);chest.style.opacity=1})}
/* swap: the open drawer slides home, the touched one slides out of its case (one 950 ms glide, no crossfade) */
function swapDrawer(k){var old=panel.cloneNode(true);old.classList.add('b-ghost');app.insertBefore(old,lift);openDrawer(k,true);var H=innerHeight;
  panel.style.clipPath='inset(0 0 100% 0)';felt.style.transform='translateY(-90px)';
  G.tween(MS,function(e){panel.style.clipPath='inset(0 0 '+((1-e)*100).toFixed(2)+'% 0)';felt.style.transform='translateY('+(-90*(1-e)).toFixed(1)+'px)';old.style.transform='translateY('+(e*H*.6).toFixed(1)+'px)'},function(){old.remove();panel.style.clipPath='inset(0 0 0 0)';felt.style.transform='none'})}
function liftTarget(p){var W=innerWidth,H=innerHeight,ph=W<600,top=openK?topH():0,bot=ph?150:120,aw=W*(ph?.92:.7),ah=(H-top-bot)*(ph?.78:.86),s=Math.min(aw/p.w,ah/p.h),w=p.w*s,h=p.h*s;
  return{l:(W-w)/2,t:top+(H-top-bot-h)/2+(ph?0:6),w:w,h:h}}
function liftPrint(k,id,from,instant){var p=findPrint(k,id);if(!p)return;layDown(true);
  var src=from||felt.querySelector('.b-print[data-id="'+CSS.escape(id)+'"]');var r=src?src.getBoundingClientRect():null,t=liftTarget(p);
  var card=el('div','b-card',null,lift);img(p.src,'',p.it.t||'photograph',card);card.style.cssText='left:'+t.l+'px;top:'+t.t+'px;width:'+t.w+'px;height:'+t.h+'px';
  liftCap.innerHTML=G.caption(p.it,true);liftCap.style.top=(t.t+t.h+16)+'px';liftCap.style.left=t.l+'px';liftCap.style.width=Math.max(t.w,260)+'px';
  lifted={k:k,id:id,src:src,card:card};lift.classList.add('on');if(src)src.style.visibility='hidden';
  if(instant||!r){card.style.transform='none';lightEl.style.opacity=1;liftCap.style.opacity=1;return}
  var sx=r.width/t.w,dx=r.left-t.l,dy=r.top-t.t;anim=true;
  G.tween(900,function(e,k2){var s=sx+(1-sx)*e,tilt=Math.sin(Math.PI*k2)*9;card.style.transform='translate('+(dx*(1-e)).toFixed(1)+'px,'+(dy*(1-e)).toFixed(1)+'px) scale('+s.toFixed(4)+') perspective(1200px) rotateX('+tilt.toFixed(2)+'deg)';
    card.style.boxShadow='0 '+(4+40*e).toFixed(0)+'px '+(10+70*e).toFixed(0)+'px rgba(0,0,0,'+(.45+.3*e).toFixed(2)+')';lightEl.style.opacity=e.toFixed(3);liftCap.style.opacity=Math.max(0,(k2-.6)/.4).toFixed(3)},function(){anim=false})}
function layDown(instant){if(!lifted)return;var L=lifted;lifted=null;var card=L.card,src=L.src&&L.src.isConnected?L.src:null;
  function done(){card.remove();if(L.src)L.src.style.visibility='';if(!lifted)lift.classList.remove('on')}
  if(instant||!src){done();lightEl.style.opacity=0;liftCap.style.opacity=0;return}
  var r=src.getBoundingClientRect(),cr=card.getBoundingClientRect(),sx=r.width/cr.width,dx=r.left-cr.left,dy=r.top-cr.top;liftCap.style.opacity=0;
  G.tween(800,function(e,k2){var tilt=Math.sin(Math.PI*k2)*-7;card.style.transform='translate('+(dx*e).toFixed(1)+'px,'+(dy*e).toFixed(1)+'px) scale('+(1+(sx-1)*e).toFixed(4)+') perspective(1200px) rotateX('+tilt.toFixed(2)+'deg)';
    card.style.boxShadow='0 '+(44-40*e).toFixed(0)+'px '+(80-70*e).toFixed(0)+'px rgba(0,0,0,.6)';lightEl.style.opacity=(1-e).toFixed(3)},done)}
/* ---------- route → scene ---------- */
R.on(function(route,prev,how){var inst=how==='load';
  if(route==='index'){idx.classList.add('open');return}idx.classList.remove('open');
  var parts=route.split('/'),k=parts[0]||null,id=parts.slice(1).join('/')||null;
  if(k&&!G.room(k)){R.go('',{replace:true});return}
  if(!k){layDown(inst);closeDrawer(inst);return}
  var fromLead=null;if(id&&!openK&&prev!==null){fromLead=chest.querySelector('.b-lead[data-r="'+k+'/'+id+'"] .b-lf')}
  if(openK!==k){if(openK&&!inst){layDown(true);swapDrawer(k)}else openDrawer(k,inst)}
  if(id){var src=fromLead;liftPrint(k,id,src,inst)}else layDown(inst)});
/* ---------- input ---------- */
chest.addEventListener('click',function(e){var f=e.target.closest('.b-front');if(f){R.go(f.dataset.k);return}
  var l=e.target.closest('.b-lead');if(l){e.preventDefault();R.mark(l.dataset.r.split('/')[0]);R.go(l.dataset.r);return}
  if(e.target.closest('.b-idx')){R.go('index');return}
  if(e.target.closest('.b-wm'))e.preventDefault()});
bands.addEventListener('click',function(e){var b=e.target.closest('.b-band');if(b)R.go(b.dataset.k,{replace:true})});
felt.addEventListener('click',function(e){var p=e.target.closest('.b-print');if(p&&openK)R.go(openK+'/'+p.dataset.id)});
push.addEventListener('click',function(){R.up()});
/* the band wordmark stays live above a lifted print: the lift carries its own copy in the same spot */
var lwm=el('a','b-bwm b-lwm','Gill James',lift);lwm.href='#/';
GJ_THEME.bind(chest.querySelector('.b-wm'),{home:function(){R.home()}});
GJ_THEME.bind(bwm,{home:function(){R.home()}});
GJ_THEME.bind(lwm,{home:function(){R.home()}});
function placeLwm(){var r=bwm.getBoundingClientRect();lwm.style.left=r.left+'px';lwm.style.top=r.top+'px';lwm.style.right='auto';lwm.style.visibility=r.width?'visible':'hidden'}
new MutationObserver(function(){if(lift.classList.contains('on'))placeLwm()}).observe(lift,{attributes:true,attributeFilter:['class']});addEventListener('resize',placeLwm);
lift.addEventListener('click',function(){R.up()});
/* hover a front: it eases out and the gap widens (peek) */
chest.addEventListener('pointerover',function(e){var f=e.target.closest('.b-dr');[].forEach.call(drawers.children,function(x){x.classList.toggle('peek',x===f)})});
chest.addEventListener('pointerleave',function(){[].forEach.call(drawers.children,function(x){x.classList.remove('peek')})});
/* glass sheen follows the light source (pointer) */
caseEl.addEventListener('pointermove',function(e){var r=caseEl.getBoundingClientRect();caseEl.style.setProperty('--lx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%')});
/* keys: 1–5 open, ← → swap, Esc handled in core */
d.addEventListener('keydown',function(e){if(e.target.closest&&e.target.closest('input,textarea'))return;var n=+e.key;
  if(n>=1&&n<=5){var k=G.ROOMS[n-1].k;R.go(k,{replace:!!openK});return}
  if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&openK){var dir=e.key==='ArrowRight'?1:-1;if(lifted)neighbour(dir);else{var i=G.ROOMS.findIndex(function(r){return r.k===openK});R.go(G.ROOMS[(i+dir+5)%5].k,{replace:true})}}});
function neighbour(dir){var ps=prints(openK),i=ps.findIndex(function(p){return p.id===lifted.id});if(i<0)return;var n=ps[(i+dir+ps.length)%ps.length];R.go(openK+'/'+n.id,{replace:true})}
/* swipe: down = push in / lay down; left/right = neighbour drawer or print */
G.swipe(panel,function(dir){if(lifted)return;if(dir==='down'&&felt.scrollTop<=2)R.up();else if(dir==='left'||dir==='right'){var i=G.ROOMS.findIndex(function(r){return r.k===openK});R.go(G.ROOMS[(i+(dir==='left'?1:-1)+5)%5].k,{replace:true})}});
G.swipe(lift,function(dir){if(dir==='down'||dir==='up')R.up();else neighbour(dir==='left'?1:-1)});
G.swipe(idx,function(dir){if(dir==='down'||dir==='right')R.up()});
addEventListener('resize',function(){layoutLeads();if(openK)fill(openK);if(lifted){var L=lifted;layDown(true);liftPrint(L.k,L.id,null,true)}});
layoutLeads();R.start();
})();
