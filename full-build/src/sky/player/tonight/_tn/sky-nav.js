/* tonight · the way in from the opener's constellation.
 Once the sky settles on the constellation, each cluster's name is a real link to its part of the hub
 (film, photos, objects, sound, about), with spaces and every room one step further.
 Desktop: click a name or its stars, or scroll / ctrl-scroll in over a cluster. Keyboard: Tab to a name, Enter.
 Phone: pinch a cluster open (pinch only; taps keep their ripple). The mark goes home to the constellation (K12).
 The page that loads this sets data-tn-root (relative path to the tonight/ root). */
(function(){
  var s=document.currentScript,root=(s&&s.getAttribute('data-tn-root'))||'../../';
  var KEYS=['film','photo','objects','sound','about'];
  var NAME={film:'film',photo:'photos',objects:'objects',sound:'sound',about:'about'};
  var DESC={film:'film: the film section, lens room, horizon reel, stills and archive',photo:'photos: the darkroom wall and the photo lab',objects:'objects',sound:'sound',about:'about: bio and the tiled moon-water page'};
  function abs(h){return new URL(root+h,location.href).href}
  function hubFor(k){return abs('hub/#'+k)}
  function nav(href){try{window.top.location.href=href}catch(e){location.href=href}}
  var coarse=window.matchMedia&&matchMedia('(hover: none) and (pointer: coarse)').matches;
  window.TN_NAV=true;
  var O=null,layer=null,links=[],more=null,hint=null,on=false,onT=0,box=[],kb=false;
  function build(){
    layer=document.createElement('nav');layer.className='tn-sky';layer.setAttribute('aria-label','the constellation');
    KEYS.forEach(function(k,i){var a=document.createElement('a');a.className='tn-clu';a.href=hubFor(k);a.target='_top';a.setAttribute('data-k',k);
      a.textContent=NAME[k];a.setAttribute('aria-label',DESC[k]);a.style.setProperty('--tn-tint',TINT[i]);layer.appendChild(a);links.push(a)});
    more=document.createElement('p');more.className='tn-more';
    more.innerHTML='<a href="'+abs('hub/#spaces')+'" target="_top">spaces</a><span aria-hidden="true"> · </span><a href="'+abs('hub/')+'" target="_top">every room</a>';
    layer.appendChild(more);
    hint=document.createElement('p');hint.className='tn-skyhint';hint.setAttribute('aria-hidden','true');
    hint.textContent=coarse?'pinch a constellation to open it':'click a name to open it';
    layer.appendChild(hint);
    document.body.appendChild(layer);
    layer.addEventListener('focusin',function(){kb=true;layer.classList.add('kb');if(!on&&O&&O.go)O.go(1)});
    layer.addEventListener('focusout',function(e){if(!layer.contains(e.relatedTarget)){kb=false;layer.classList.remove('kb')}});
    show(false,true);
  }
  var TINT=['150,220,255','170,245,212','255,236,205','255,182,176','214,222,236'];
  function show(v,force){if(v===on&&!force)return;on=v;onT=performance.now();
    layer.classList.toggle('on',v);
    var st=document.getElementById('stage');
    if(st){if(!st.hasAttribute('data-tn-label'))st.setAttribute('data-tn-label',st.getAttribute('aria-label')||'');
      st.setAttribute('aria-label',v?'The constellation: choose a name to open it':st.getAttribute('data-tn-label'))}}
  function boxes(){
    var pts=O.pts||[],b=KEYS.map(function(){return {x0:1e9,y0:1e9,x1:-1e9,y1:-1e9,n:0,sx:0,sy:0}});
    for(var i=0;i<pts.length;i++){var p=pts[i];if(!p||!p.node||p.chap==null||p.chap<0||!b[p.chap])continue;var q=b[p.chap];
      if(!isFinite(p.px)||!isFinite(p.py))continue;
      q.x0=Math.min(q.x0,p.px);q.y0=Math.min(q.y0,p.py);q.x1=Math.max(q.x1,p.px);q.y1=Math.max(q.y1,p.py);q.n++;q.sx+=p.px;q.sy+=p.py}
    b.forEach(function(q){if(q.n){q.cx=q.sx/q.n;q.cy=q.sy/q.n}});
    return b}
  function hit(x,y,pad){var best=-1,bd=1e9;pad=pad==null?28:pad;
    for(var k=0;k<box.length;k++){var q=box[k];if(!q.n)continue;
      var inside=x>=q.x0-pad&&x<=q.x1+pad&&y>=q.y0-pad-34&&y<=q.y1+pad;
      if(!inside)continue;var d=Math.hypot(x-q.cx,y-q.cy);if(d<bd){bd=d;best=k}}
    return best}
  function nearest(x,y){var best=-1,bd=1e9;for(var k=0;k<box.length;k++){var q=box[k];if(!q.n)continue;var d=Math.hypot(x-q.cx,y-q.cy);if(d<bd){bd=d;best=k}}return best}
  function open(k){if(k<0)return;var a=links[k];if(a)a.classList.add('go');nav(hubFor(KEYS[k]))}
  function tick(){
    requestAnimationFrame(tick);
    var P=+O.P||0,v=P>=.9;
    if(v!==on)show(v);
    var foot=document.getElementById('foot');
    if(foot){var gone=foot.classList.contains('gone')||P>=.03;
      if(gone&&foot.getAttribute('aria-hidden')!=='true'){foot.setAttribute('aria-hidden','true');foot._tnT=setTimeout(function(){if(foot.getAttribute('aria-hidden')==='true')foot.hidden=true},700)}
      else if(!gone&&foot.getAttribute('aria-hidden')==='true'){clearTimeout(foot._tnT);foot.hidden=false;foot.removeAttribute('aria-hidden')}}
    if(!on&&!kb)return;
    box=boxes();
    var W=innerWidth;
    for(var k=0;k<links.length;k++){var q=box[k],a=links[k];if(!q.n){a.style.display='none';continue}a.style.display='';
      var x=Math.max(40,Math.min(W-40,(q.x0+q.x1)/2)),y=Math.max(18,q.y0-20);
      a.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-50%)'}
  }
  /* desktop click on a cluster's stars (a name is a link already) */
  var down=null;
  function wireStage(st){
    st.addEventListener('pointerdown',function(e){down=(e.pointerType==='mouse'&&on)?{x:e.clientX,y:e.clientY}:null},true);
    st.addEventListener('pointerup',function(e){
      if(!down||e.pointerType!=='mouse'||!on)return;var m=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(m>8)return;
      var k=hit(e.clientX,e.clientY);
      if(k>=0){e.stopPropagation();open(k)}else nudge()},true);
    /* scroll / ctrl-scroll in at the constellation opens the cluster under the pointer */
    var acc=0,accT=0;
    st.addEventListener('wheel',function(e){
      if(!on||performance.now()-onT<450)return;
      var dy=e.deltaY*(e.deltaMode===1?18:1);
      if(dy>=0){acc=0;return}
      e.preventDefault();e.stopPropagation();
      var now=performance.now();if(now-accT>500)acc=0;accT=now;acc+=-dy*(e.ctrlKey?4:1);
      if(acc>=180){acc=0;var k=hit(e.clientX,e.clientY,60);if(k<0){nudge();return}open(k)}
    },{capture:true,passive:false});
    /* phone: pinch a cluster open */
    var tp={},pz=null;
    st.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')return;tp[e.pointerId]={x:e.clientX,y:e.clientY};var ks=Object.keys(tp);
      if(ks.length===2&&on){var a=tp[ks[0]],b=tp[ks[1]];pz={d:Math.hypot(a.x-b.x,a.y-b.y)||1,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2}}},true);
    st.addEventListener('pointermove',function(e){if(!tp[e.pointerId])return;tp[e.pointerId]={x:e.clientX,y:e.clientY};var ks=Object.keys(tp);
      if(pz&&ks.length>=2&&on){var a=tp[ks[0]],b=tp[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d/pz.d>1.45){var k=hit(pz.cx,pz.cy,70);if(k<0)k=nearest(pz.cx,pz.cy);pz=null;open(k)}}},true);
    function up(e){delete tp[e.pointerId];if(Object.keys(tp).length<2)pz=null}
    st.addEventListener('pointerup',up,true);st.addEventListener('pointercancel',up,true);
  }
  var nT=0;function nudge(){hint.classList.add('lit');clearTimeout(nT);nT=setTimeout(function(){hint.classList.remove('lit')},1600)}
  /* keyboard: Enter / Space on a name opens it (the opener's own keys would step the sky instead) */
  addEventListener('keydown',function(e){
    var t=e.target,ctl=t&&t.closest&&t.closest('a[href],button,input,select,textarea,[role=button]');
    if(ctl){e.stopPropagation();
      if(ctl.tagName==='A'&&(e.key===' '||e.key==='Spacebar')){e.preventDefault();ctl.click()}
      return}
    if(on&&(e.key==='Enter'||e.key===' '||e.key==='ArrowUp'||e.key==='ArrowRight'||e.key==='+')&&(t===document.body||t===document.documentElement||(t&&t.id==='stage'))){
      e.preventDefault();e.stopPropagation();links[0].focus()}
  },true);
  /* the mark: home is the constellation. Before the sky has settled it settles it here; at the constellation it opens the hub. */
  function wireMark(){
    var m=document.querySelector('#hud .sig,a.sig');if(!m)return;
    m.href=abs('hub/');m.target='_top';m.setAttribute('aria-label','home · the constellation');
    m.addEventListener('click',function(e){
      /* keyboard (Enter / Space: detail 0) always follows the link; a first mouse press settles the sky */
      if(e.detail!==0&&!on&&O&&O.go){e.preventDefault();e.stopPropagation();O.go(1);setTimeout(function(){if(links[0])try{links[0].focus({preventScroll:true})}catch(x){}},900);return}
      e.preventDefault();e.stopPropagation();nav(abs('hub/'))},true);
    ['pointerdown','touchstart','mousedown'].forEach(function(t){m.addEventListener(t,function(e){e.stopPropagation()},{passive:true,capture:true})});
  }
  function start(){
    O=window.GJ_OPENER;if(!O||!document.body){return setTimeout(start,60)}
    build();wireMark();var st=document.getElementById('stage');if(st)wireStage(st);
    requestAnimationFrame(tick);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
