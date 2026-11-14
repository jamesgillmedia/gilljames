/* tonight · dev-only A/B/C variant switch (Nov 13, 2026).
   A room that has real open choices calls TNV.mount({room, list:[{k:'A',name:'drift'},…], def:'A', into:el, onChange:fn}).
   The pick is instant (the room re-lays itself out in place: no reload, the camera and scroll stay where they are),
   kept per room on this device (localStorage tn.v.<room>) and in the address (?v=B), and shown as a tiny label.
   It only ever changes the room's own layout: it never adds, removes or reroutes a way in or out.
   Hide it at launch: set SHOW=false below (or ?dev=0); ?dev=1 forces it on. */
(function(){
  'use strict';
  var SHOW=false;
  function qs(k){var m=location.search.match(new RegExp('[?&]'+k+'=([^&#]*)'));return m?decodeURIComponent(m[1]):null}
  function rd(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function wr(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function shown(){var d=qs('dev');if(d==='1'){wr('tn.dev','1');return true}if(d==='0'){wr('tn.dev','0');return false}var s=rd('tn.dev');return s==null?SHOW:s==='1'}
  function setParam(v){try{var u=new URL(location.href);u.searchParams.set('v',v);history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(e){}}
  function mount(o){
    var keys=o.list.map(function(x){return x.k});
    var dev=shown();
    var v=o.def||keys[0];
    if(dev){var q=(qs('v')||'').toUpperCase();if(keys.indexOf(q)>=0)v=q;else{var s=rd('tn.v.'+o.room);if(keys.indexOf(s)>=0)v=s}}
    else if(qs('v')){try{var u=new URL(location.href);u.searchParams.delete('v');history.replaceState(history.state,'',u.pathname+(u.search||'')+u.hash)}catch(e){}}
    var api={get v(){return v},set:set};
    function set(nv,silent){if(keys.indexOf(nv)<0||!shown())return;v=nv;wr('tn.v.'+o.room,v);setParam(v);paint();if(!silent&&o.onChange)o.onChange(v)}
    var el=null,lab=null;
    function paint(){if(!el)return;[].forEach.call(el.querySelectorAll('button'),function(b){var on=b.dataset.v===v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
      var it=o.list.filter(function(x){return x.k===v})[0];lab.textContent=it?it.name:''}
    if(shown()&&o.into){
      el=document.createElement('div');el.className='tnv';el.setAttribute('role','group');el.setAttribute('aria-label','dev: layout variant');
      el.innerHTML='<span class="tnv-seg">'+o.list.map(function(x){return '<button type="button" data-v="'+x.k+'" aria-label="variant '+x.k+': '+x.name+'">'+x.k+'</button>'}).join('')+'</span><span class="tnv-l"></span>';
      lab=el.querySelector('.tnv-l');
      el.addEventListener('click',function(e){var b=e.target.closest('button');if(b){e.stopPropagation();set(b.dataset.v)}});
      ['pointerdown','touchstart','mousedown','wheel'].forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
      o.into.appendChild(el);paint();setParam(v)}
    return api}
  window.TNV={mount:mount};
})();
