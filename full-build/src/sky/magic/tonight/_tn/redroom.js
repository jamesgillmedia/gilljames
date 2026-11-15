/* tonight · the darkroom red light from the mark (Gill, Nov 14). The Photo lab's safelight (photo-lab/js/lab.js LAB.safelight, its key
 gj-photo-lab-safelight, its 10px lamp-edge spill from fable-m4 #safelight and its hint line), brought to the sky pages: the mark, pressed
 at rest, switches the room's red light on, and pressed again switches it off. It lights the room only, never a photograph or a film:
 the lamp spill sits on the screen's edge and the red is on the chrome (mark, labels, pills); the water photograph, the stars' pictures
 and every frame keep their own colour. The setting is shared with the Photo lab darkroom (the same key). Reduce Motion changes nothing. */
(function(){
  if(window.TN_RED)return;
  var KEY='gj-photo-lab-safelight',el=null,hint=null,hT=0;
  var css='#tn-safe{position:fixed;inset:0;z-index:2147482000;pointer-events:none;opacity:0;transition:opacity .45s ease;'+
    'background:linear-gradient(to right,rgba(255,92,40,.72),rgba(255,92,40,0) 10px) left/10px 100% no-repeat,'+
    'linear-gradient(to left,rgba(255,92,40,.72),rgba(255,92,40,0) 10px) right/10px 100% no-repeat,'+
    'linear-gradient(to bottom,rgba(255,92,40,.72),rgba(255,92,40,0) 10px) top/100% 10px no-repeat,'+
    'linear-gradient(to top,rgba(255,92,40,.72),rgba(255,92,40,0) 10px) bottom/100% 10px no-repeat}'+
    'html.tn-red #tn-safe{opacity:1}'+
    'html.tn-red .sig,html.tn-red #where,html.tn-red #hint,html.tn-red #hud button,html.tn-red #bar button,html.tn-red .amb-toggle,html.tn-red .amb-on,html.tn-red .ambx-tg,html.tn-red .tn-chip,html.tn-red .tn-chip a{color:#ff8a72!important;text-shadow:0 0 8px rgba(255,60,40,.55),0 0 2px #04070b!important}'+
    'html.tn-red .amb-toggle,html.tn-red .amb-on,html.tn-red #hud button,html.tn-red #bar button{border-color:rgba(255,92,78,.38)!important}'+
    '#tn-safe-hint{position:fixed;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147482001;pointer-events:none;'+
    'font:300 11px/1.3 "Julius Sans One",Poppins,sans-serif;letter-spacing:.14em;text-transform:lowercase;color:#ffb3a3;text-shadow:0 0 8px #04070b,0 0 3px #04070b;'+
    'white-space:nowrap;opacity:0;transition:opacity .3s}#tn-safe-hint.on{opacity:1}';
  function mount(){if(el)return;var st=document.createElement('style');st.id='tn-safe-css';st.textContent=css;document.head.appendChild(st);
    el=document.createElement('div');el.id='tn-safe';el.setAttribute('aria-hidden','true');document.body.appendChild(el);
    hint=document.createElement('p');hint.id='tn-safe-hint';hint.setAttribute('aria-live','polite');document.body.appendChild(hint)}
  function on(){return document.documentElement.classList.contains('tn-red')}
  function set(v,quiet){mount();document.documentElement.classList.toggle('tn-red',!!v);try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}
    var m=document.querySelectorAll('.sig');for(var i=0;i<m.length;i++)m[i].setAttribute('aria-pressed',v?'true':'false');
    if(!quiet){hint.textContent=v?'safelight on — the room, not the photograph':'safelight off';hint.classList.add('on');clearTimeout(hT);hT=setTimeout(function(){hint.classList.remove('on')},2400)}}
  function start(){var s=false;try{s=localStorage.getItem(KEY)==='1'}catch(e){}set(s,true)}
  window.TN_RED={on:on,set:function(v){set(v)},toggle:function(){set(!on())}};
  addEventListener('storage',function(e){if(e.key===KEY)set(e.newValue==='1',true)});
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
