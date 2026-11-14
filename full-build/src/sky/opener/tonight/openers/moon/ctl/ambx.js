/* ambience panel (shared by the room builds). Same control as the Sound section's vol / flash rows:
   <label class="cl"><span>name</span><input type="range" 0..100></label>, mint fill to the thumb, values kept on this device.
   AMBX.create({room, title, sliders:[{k,label,min,max,def,step,show(),scope(),read(),write(v),apply(v)}], onReset, where()})
   Nothing here moves on its own; it only answers the fingers. Reduce Motion changes nothing. */
(function(){
  var LS='gj.amb.';
  function rd(key,d,min,max){try{var s=localStorage.getItem(key);if(s==null||s==='')return d;var v=+s;return isFinite(v)?Math.max(min,Math.min(max,v)):d}catch(e){return d}}
  function wr(key,v){try{localStorage.setItem(key,String(v))}catch(e){}}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function keyOf(room,s){var sc=s.scope?s.scope():'';return LS+room+'.'+(sc?sc+'.':'')+s.k}
  function read(room,k,def,scope,min,max){return rd(LS+room+'.'+(scope?scope+'.':'')+k,def,min==null?-1e9:min,max==null?1e9:max)}
  function create(o){
    var room=o.room,S=o.sliders,val={};
    var root=document.createElement('div');root.className='ambx'+(o.cls?' '+o.cls:'');root.setAttribute('data-room',room);
    var pid='ambx-p-'+room.replace(/[^a-z0-9]/gi,'');
    root.innerHTML='<button type="button" class="ambx-tg" aria-expanded="false" aria-controls="'+pid+'" aria-label="'+esc(o.aria||'room controls: light, atmosphere and switches')+'"><i aria-hidden="true"></i>'+esc(o.title||'controls')+'</button>'+
      '<div class="ambx-p" id="'+pid+'" role="group" aria-label="'+esc(o.aria||'room controls')+'" hidden></div>';
    var tg=root.firstChild,p=root.lastChild,rows={};
    var swRow=null;
    S.forEach(function(s){
      if(s.type==='sec'){swRow=null;var h=document.createElement('div');h.className='ambx-sec';h.textContent=s.label;p.appendChild(h);rows['sec:'+s.label]={lab:h,sec:s};return}
      if(s.type==='sw'){
        if(!swRow){swRow=document.createElement('div');swRow.className='ambx-sws';p.appendChild(swRow)}
        var b=document.createElement('button');b.type='button';b.className='ambx-sw'+(s.cls?' '+s.cls:'');b.setAttribute('aria-pressed','false');
        b.innerHTML='<i class="led" aria-hidden="true"></i><span></span>';swRow.appendChild(b);
        rows[s.k]={lab:b,sw:s,name:b.lastChild};
        b.addEventListener('click',function(){if(b.disabled)return;s.toggle();try{if(navigator.vibrate)navigator.vibrate(6)}catch(e){}setTimeout(refresh,0)});
        return}
      swRow=null;
      s.step=s.step||1;
      var lab=document.createElement('label');lab.className='cl';lab.setAttribute('data-k',s.k);
      lab.innerHTML='<span></span><span class="rw"><input type="range" min="'+s.min+'" max="'+s.max+'" step="'+s.step+'"></span>';
      lab.querySelector('.rw').style.cssText='width:auto;cursor:default';
      var inp=lab.querySelector('input');
      lab.querySelector('.rw').style.setProperty('--d',String((s.def-s.min)/(s.max-s.min)));
      p.appendChild(lab);rows[s.k]={lab:lab,inp:inp,name:lab.firstChild};
      var lastSide=0;
      inp.addEventListener('input',function(){
        var v=+inp.value;
        /* soft detent at the room's own setting, like the debug sliders */
        var span=s.max-s.min,det=s.detent!=null?s.detent:span*.025;
        if(Math.abs(v-s.def)<det&&v!==s.def){v=s.def;inp.value=String(v)}
        var side=v<s.def?-1:v>s.def?1:0;if(side!==lastSide&&(side===0||lastSide===0)){try{if(navigator.vibrate)navigator.vibrate(6)}catch(e){}}lastSide=side;
        set(s,v,true);
      });
      /* double tap the name: back to this room's own setting */
      var lt=0;lab.firstChild.addEventListener('click',function(e){e.preventDefault();var n=Date.now();if(n-lt<380){set(s,s.def,true)}lt=n});
    });
    var f=document.createElement('div');f.className='ambx-f';f.innerHTML='<b class="ambx-w"></b><button type="button" class="ambx-rs" aria-label="reset the sliders to this room\'s own settings">reset</button>';
    p.appendChild(f);var wEl=f.firstChild;
    f.lastChild.addEventListener('click',function(){
      S.forEach(function(s){if(!s.type&&(!s.show||s.show()))set(s,s.def,true)});
      if(o.onReset)o.onReset();refresh();
    });
    function paint(s,v){var r=rows[s.k];if(!r)return;var pc=(v-s.min)/(s.max-s.min)*100;
      if(document.activeElement!==r.inp||String(+r.inp.value)!==String(v))r.inp.value=String(v);
      r.inp.style.setProperty('--p',pc.toFixed(1)+'%');
      r.inp.setAttribute('aria-valuetext',(s.fmt?s.fmt(v):Math.round(v)+(s.unit==null?'%':s.unit)))}
    function set(s,v,save){v=Math.max(s.min,Math.min(s.max,+v));val[s.k]=v;
      if(save){if(s.write)s.write(v);else wr(keyOf(room,s),v)}
      paint(s,v);if(s.apply)s.apply(v);lit()}
    function load(s){return s.read?s.read():rd(keyOf(room,s),s.def,s.min,s.max)}
    function lit(){var a=0,n=0;S.forEach(function(s){if(s.type||(s.show&&!s.show()))return;n++;a+=Math.min(1,val[s.k]/(s.def||1))});root.style.setProperty('--ambx-lit',n?(a/n).toFixed(2):'1')}
    function refresh(){
      S.forEach(function(s){
        if(s.type==='sec'){rows['sec:'+s.label].lab.hidden=!!(s.show&&!s.show());return}
        if(s.type==='sw'){var R=rows[s.k],on=!!s.get(),vis=!s.show||s.show();R.lab.hidden=!vis;R.name.textContent=typeof s.label==='function'?s.label():s.label;
          R.lab.setAttribute('aria-pressed',String(on));R.lab.classList.toggle('on',on);R.lab.disabled=!!(s.disabled&&s.disabled());if(s.aria)R.lab.setAttribute('aria-label',s.aria);return}
        var r=rows[s.k],vis=!s.show||s.show();r.lab.hidden=!vis;
        var L=typeof s.label==='function'?s.label():s.label;r.name.textContent=L;r.inp.setAttribute('aria-label',(s.aria?(typeof s.aria==='function'?s.aria():s.aria):L));
        set(s,load(s),false)});
      [].forEach.call(p.querySelectorAll('.ambx-sws'),function(rw){rw.hidden=![].some.call(rw.children,function(c){return !c.hidden})});
      wEl.textContent=o.where?o.where():(o.title2||'');
    }
    function open(on){p.hidden=!on;tg.setAttribute('aria-expanded',String(!!on));if(on)refresh();if(o.onOpen)o.onOpen(!!on)}
    tg.addEventListener('click',function(){open(p.hidden)});
    /* the room underneath never sees a gesture that began on the panel */
    ['pointerdown','pointermove','pointerup','pointercancel','mousedown','mouseup','click','dblclick','touchstart','touchmove','touchend','wheel','gesturestart','gesturechange','contextmenu'].forEach(function(t){
      root.addEventListener(t,function(e){e.stopPropagation()},{passive:true});
    });
    root.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Escape'){open(false);tg.focus()}});
    (o.mount||document.body).appendChild(root);
    refresh();
    var api={el:root,refresh:refresh,sync:function(){if(!p.hidden)refresh();else{S.forEach(function(s){if(!s.type)set(s,load(s),false)})}},open:open,get:function(k){return val[k]},set:function(k,v){var s=S.filter(function(x){return x.k===k})[0];if(s)set(s,v,true)},isOpen:function(){return !p.hidden}};
    return api;
  }
  window.AMBX={create:create,read:read,key:function(room,k,scope){return LS+room+'.'+(scope?scope+'.':'')+k}};
})();
