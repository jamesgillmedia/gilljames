/* Reframe debug tool (hidden). Open: add ?reframe to the URL, press Alt+Shift+R,
   or hold two fingers still on the screen for 1 second (phone). Tap a photo/video, drag to move, wheel/pinch to zoom.
   Saves per page in this browser only (localStorage). Export copies JSON for the build. */
(function(){
  if (window.__reframe) return; window.__reframe = 1;
  var KEY = 'reframe:' + location.pathname, ON = 'reframe:on';
  var store = {}; try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){}
  var active = false, sel = null, ui = null, hl = null;
  function isBg(m){ return !/^(IMG|VIDEO)$/.test(m.tagName); }
  function bgEls(){ var out=[]; var all=document.body.getElementsByTagName('*'); for (var i=0;i<all.length;i++){ var e=all[i]; if(e.closest&&e.closest('[data-reframe-ui]')) continue; var b=e.style.backgroundImage||getComputedStyle(e).backgroundImage; if(b&&b.indexOf('url(')===0) out.push(e); } return out; }
  function media(){ return [].slice.call(document.querySelectorAll('img,video')).concat(bgEls()).filter(function(m){ var r=m.getBoundingClientRect(); return r.width>24&&r.height>24; }); }
  function srcOf(m){ var u=isBg(m)?((getComputedStyle(m).backgroundImage.match(/url\(["']?([^"')]+)/)||[])[1]||''):(m.currentSrc||m.src||m.poster||''); return u.split('?')[0].split('/').pop(); }
  function idOf(m){
    if (m.dataset.reframeId) return m.dataset.reframeId;
    var s = srcOf(m);
    var id = m.id ? '#'+m.id : (s ? s : 'el');
    var same = media().filter(function(x){ return (x.id?'#'+x.id:(srcOf(x)||'el'))===id; });
    if (same.length>1) id += '@'+same.indexOf(m);
    m.dataset.reframeId = id; return id;
  }
  function css(f){
    var s=f.s, x=f.x, y=f.y, k=1-1/s;
    return { objectFit: f.fit, objectPosition: x+'% '+y+'%', transformOrigin: x+'% '+y+'%',
      scale: s===1?'':String(s),
      clipPath: s===1?'':'inset('+(y*k).toFixed(2)+'% '+((100-x)*k).toFixed(2)+'% '+((100-y)*k).toFixed(2)+'% '+(x*k).toFixed(2)+'%)' };
  }
  function apply(m,f){ var c=css(f); if(isBg(m)){ c.backgroundPosition=c.objectPosition; c.backgroundSize=c.objectFit; delete c.objectPosition; delete c.objectFit; } for (var p in c) m.style[p]=c[p]; }
  function get(m){ var id=idOf(m); return store[id] || (store[id]={x:50,y:50,s:1,fit:(isBg(m)?getComputedStyle(m).backgroundSize:getComputedStyle(m).objectFit)==='contain'?'contain':'cover'}); }
  function base(m){ var r=m.getBoundingClientRect(), f=store[m.dataset.reframeId||''], k=f&&f.s>1?f.s:1; if(k===1) return r;
    var w=r.width/k, h=r.height/k, ox=r.left+f.x/100*r.width, oy=r.top+f.y/100*r.height, l=ox-f.x/100*w, t=oy-f.y/100*h;
    return {left:l,top:t,width:w,height:h,right:l+w,bottom:t+h}; }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} }
  function applyAll(){ if(!Object.keys(store).length) return; media().forEach(function(m){ var f=store[idOf(m)]; if (f) apply(m,f); }); }
  function cssText(f){ var c=css(f), o=[]; o.push('object-fit:'+c.objectFit,'object-position:'+c.objectPosition); if(c.scale){o.push('transform-origin:'+c.transformOrigin,'scale:'+c.scale,'clip-path:'+c.clipPath);} return o.join(';'); }
  function el(t,st,tx){ var e=document.createElement(t); if(st) e.style.cssText=st; if(tx!=null) e.textContent=tx; return e; }
  function btn(t,fn){ var b=el('button','all:unset;cursor:pointer;padding:6px 9px;margin:2px;border:1px solid #f5c26b;border-radius:6px;color:#f5c26b;font:600 12px system-ui',t); b.onclick=function(e){e.stopPropagation();fn();}; return b; }
  function build(){
    ui = el('div','position:fixed;z-index:2147483647;left:10px;bottom:10px;max-width:calc(100vw - 20px);background:rgba(10,10,14,.92);color:#eee;font:12px/1.4 ui-monospace,monospace;padding:8px 10px;border:1px solid #f5c26b;border-radius:10px;box-shadow:0 4px 24px #000');
    ui.setAttribute('data-reframe-ui','');
    var t = el('div','font:700 12px system-ui;color:#f5c26b;margin-bottom:4px','REFRAME · debug');
    var info = el('div','white-space:pre-wrap;word-break:break-all;margin-bottom:4px','Tap a photo or video.');
    var row = el('div','display:flex;flex-wrap:wrap');
    row.append(
      btn('Cover/Contain',function(){ if(!sel) return; var f=get(sel); f.fit=f.fit==='cover'?'contain':'cover'; upd(); }),
      btn('Zoom +',function(){ zoom(1.1); }), btn('Zoom −',function(){ zoom(1/1.1); }),
      btn('Reset',function(){ if(!sel) return; delete store[idOf(sel)]; ['objectFit','objectPosition','backgroundPosition','backgroundSize','transformOrigin','scale','clipPath'].forEach(function(p){sel.style[p]='';}); save(); upd(); }),
      btn('Next',function(){ var a=media(); pick(a[(a.indexOf(sel)+1)%a.length]); }),
      btn('Export',exp), btn('Close',function(){ toggle(false); })
    );
    ui.append(t,info,row); ui._info=info;
    hl = el('div','position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #f5c26b;box-shadow:0 0 0 9999px rgba(0,0,0,.25);display:none;transition:all .08s');
    document.body.append(hl, ui);
  }
  function upd(){
    if (!ui) return;
    if (!sel){ ui._info.textContent='Tap a photo or video. Drag to move, wheel or pinch to zoom, arrows nudge, Esc closes.'; hl.style.display='none'; return; }
    var f=get(sel); apply(sel,f); save();
    var r=base(sel); hl.style.display='block'; hl.style.left=r.left+'px'; hl.style.top=r.top+'px'; hl.style.width=r.width+'px'; hl.style.height=r.height+'px';
    ui._info.textContent=idOf(sel)+'\nx '+f.x.toFixed(1)+'%  y '+f.y.toFixed(1)+'%  zoom '+f.s.toFixed(2)+'  '+f.fit+'\n'+cssText(f);
  }
  function pick(m){ sel=m||null; upd(); }
  function zoom(k){ if(!sel) return; var f=get(sel); f.s=Math.min(6,Math.max(1,f.s*k)); upd(); }
  function exp(){
    var out={page:location.pathname,when:new Date().toISOString(),frames:{}};
    for (var id in store) out.frames[id]={x:+store[id].x.toFixed(2),y:+store[id].y.toFixed(2),zoom:+store[id].s.toFixed(3),fit:store[id].fit,css:cssText(store[id])};
    var txt=JSON.stringify(out,null,2);
    try { navigator.clipboard.writeText(txt); } catch(e){}
    var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));
    a.download='reframe'+location.pathname.replace(/[\/]+/g,'_').replace(/_$/,'')+'.json'; a.click();
    ui._info.textContent='Exported '+Object.keys(out.frames).length+' framings (copied + downloaded).';
  }
  function hit(e){ var p=e.touches?e.touches[0]:e; if(ui&&ui.contains(e.target)) return null;
    var a=media().filter(function(m){var r=base(m);return p.clientX>=r.left&&p.clientX<=r.right&&p.clientY>=r.top&&p.clientY<=r.bottom;});
    var top=document.elementFromPoint(p.clientX,p.clientY); a.sort(function(x,y){ var cx=(x===top||x.contains(top))?0:1, cy=(y===top||y.contains(top))?0:1; if(cx!==cy) return cx-cy; var rx=base(x), ry=base(y); return rx.width*rx.height-ry.width*ry.height; });
    return a[0]||null; }
  var drag=null, pinch=null;
  function down(e){ if(!active||(ui&&ui.contains(e.target))) return; var m=hit(e); e.preventDefault(); e.stopPropagation();
    if (e.touches&&e.touches.length===2&&sel){ pinch={d:dist(e),s:get(sel).s}; drag=null; return; }
    if (!m){ pick(null); return; } if (m!==sel) pick(m);
    var p=e.touches?e.touches[0]:e, f=get(sel); drag={x:p.clientX,y:p.clientY,fx:f.x,fy:f.y}; }
  function dist(e){ var a=e.touches[0],b=e.touches[1]; return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY); }
  function move(e){ if(!active) return;
    if (pinch&&e.touches&&e.touches.length===2){ e.preventDefault(); e.stopPropagation(); get(sel).s=Math.min(6,Math.max(1,pinch.s*dist(e)/pinch.d)); upd(); return; }
    if (!drag||!sel) return; e.preventDefault(); e.stopPropagation();
    var p=e.touches?e.touches[0]:e, r=base(sel), f=get(sel);
    f.x=Math.min(100,Math.max(0,drag.fx-(p.clientX-drag.x)/r.width*100/f.s));
    f.y=Math.min(100,Math.max(0,drag.fy-(p.clientY-drag.y)/r.height*100/f.s)); upd(); }
  function up(e){ if(!active) return; if(drag||pinch){ e.stopPropagation(); } drag=null; if(!e.touches||e.touches.length<2) pinch=null; }
  function block(e){ if(active&&!(ui&&ui.contains(e.target))){ e.preventDefault(); e.stopPropagation(); } }
  function wheel(e){ if(!active||!sel) return; e.preventDefault(); e.stopPropagation(); zoom(e.deltaY<0?1.05:1/1.05); }
  function key(e){
    if (e.altKey&&e.shiftKey&&(e.code==='KeyR')){ e.preventDefault(); toggle(!active); return; }
    if (!active) return; var f=sel&&get(sel), n=e.shiftKey?5:1, done=true;
    if (e.key==='Escape'){ if(sel) pick(null); else toggle(false); }
    else if (!sel) done=false;
    else if (e.key==='ArrowLeft') f.x=Math.max(0,f.x-n); else if (e.key==='ArrowRight') f.x=Math.min(100,f.x+n);
    else if (e.key==='ArrowUp') f.y=Math.max(0,f.y-n); else if (e.key==='ArrowDown') f.y=Math.min(100,f.y+n);
    else if (e.key==='+'||e.key==='=') { zoom(1.05); } else if (e.key==='-') { zoom(1/1.05); }
    else if (e.key==='Tab') { var a=media(); pick(a[(a.indexOf(sel)+(e.shiftKey?a.length-1:1))%a.length]); }
    else done=false;
    if (done){ e.preventDefault(); e.stopImmediatePropagation(); upd(); } }
  function toggle(on){
    active=on; try{ on?sessionStorage.setItem(ON,'1'):sessionStorage.removeItem(ON);}catch(e){}
    if (on){ if(!ui) build(); ui.style.display=''; document.documentElement.style.touchAction='none'; upd(); }
    else { if(ui){ ui.style.display='none'; hl.style.display='none'; } sel=null; document.documentElement.style.touchAction=''; }
  }
  var hold=null; function holdStart(e){ if(e.touches.length===2){ var a=[e.touches[0].clientX,e.touches[0].clientY,e.touches[1].clientX,e.touches[1].clientY];
      clearTimeout(hold&&hold.t); hold={a:a,t:setTimeout(function(){ hold=null; toggle(!active); },1000)}; } else if(hold){ clearTimeout(hold.t); hold=null; } }
  function holdMove(e){ if(!hold||e.touches.length!==2) return; var b=[e.touches[0].clientX,e.touches[0].clientY,e.touches[1].clientX,e.touches[1].clientY];
    for(var i=0;i<4;i++) if(Math.abs(b[i]-hold.a[i])>14){ clearTimeout(hold.t); hold=null; return; } }
  function holdEnd(){ if(hold){ clearTimeout(hold.t); hold=null; } }
  var o={capture:true,passive:false};
  window.addEventListener('mousedown',down,o); window.addEventListener('touchstart',down,o);
  window.addEventListener('mousemove',move,o); window.addEventListener('touchmove',move,o);
  window.addEventListener('mouseup',up,o); window.addEventListener('touchend',up,o);
  window.addEventListener('click',block,o); window.addEventListener('dblclick',block,o);
  window.addEventListener('pointerdown',function(e){ if(active&&!(ui&&ui.contains(e.target))) e.stopPropagation(); },o);
  window.addEventListener('wheel',wheel,o); window.addEventListener('keydown',key,true);
  window.addEventListener('touchstart',holdStart,{capture:true,passive:true});
  window.addEventListener('touchmove',holdMove,{capture:true,passive:true});
  window.addEventListener('touchend',holdEnd,{capture:true,passive:true}); window.addEventListener('touchcancel',holdEnd,{capture:true,passive:true});
  window.addEventListener('scroll',function(){ if(active) upd(); },true);
  function init(){ applyAll(); var q=0; new MutationObserver(function(){ if(q) return; q=1; setTimeout(function(){ q=0; applyAll(); },250); }).observe(document.body,{childList:true,subtree:true});
    if (/[?&#]reframe\b/.test(location.search+location.hash) || (function(){try{return sessionStorage.getItem(ON);}catch(e){}})()) toggle(true); }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
