/* gill james · site-v4 (v4a) · ONE PLACE. Loaded first (after ADDRESS-STAY). Three small jobs, nothing visual:
   1 HISTORY  Back walks chapters and works, not every zoom step: a history entry is pushed only when the chapter or the work changes
     (whole sky -> film -> film/w27); any other address write (constellation -> its cards, the dock's L-steps) replaces the entry.
     A small trail (sessionStorage) lets ‹ / − close a work with history.back() when the entry before it is where it came from,
     so ✕-then-Back never re-opens the work. Sound-one's own player entry ({one:1}) passes through untouched.
   2 OLD ADDRESSES  #film/l1 -> #sky/film · #film/l2 -> #sky/film/grid · #film/w27[/play] -> #sky/film/w27[/play] (the same for photo,
     objects; sound -> #sky/sound), so every shared link lands in the one sky. #about/bio -> #about/l1 · #about/poem -> the poem.
   3 window.__v4 for the sheet / dive patches and the tests. */
(function(){
'use strict';
var KS='v4trail',H=[],I=0;
try{H=JSON.parse(sessionStorage.getItem(KS)||'[]')}catch(e){H=[]}
function hashOf(u){try{return new URL(u,location.href).hash}catch(e){return ''}}
function key(h){var m;h=h||'';if(!h||h==='#')return 'home';
  if((m=h.match(/^#sky\/(\w+)\/(w\w+)/)))return m[1]+'/'+m[2];if((m=h.match(/^#sky\/(\w+)/)))return m[1];if(h==='#sky')return 'sky';if(h==='#all')return 'all';
  if((m=h.match(/^#(\w+)\/(w\w+)/)))return m[1]+'/'+m[2];if((m=h.match(/^#(\w+)/)))return m[1];return h}
function save(){try{sessionStorage.setItem(KS,JSON.stringify(H.slice(-80)))}catch(e){}}
var st=history.state;if(st&&typeof st.v4i==='number'){I=st.v4i}else{I=H.length?H.length:0;try{history.replaceState(Object.assign({},st||{},{v4i:I}),'',location.href)}catch(e){}}
var push0=history.pushState,rep0=history.replaceState;
function tag(s){return Object.assign({},(s&&typeof s==='object')?s:{gj:1},{v4i:I})}
history.replaceState=function(s,t,u){if(arguments.length<3)return rep0.apply(history,arguments);H[I]=hashOf(u);save();return rep0.call(history,tag(s),t,u)};
history.pushState=function(s,t,u){if(arguments.length<3)return push0.apply(history,arguments);var h=hashOf(u);
  if(s&&s.one){I++;H.length=I;H[I]=h;save();return push0.call(history,tag(s),t,u)} /* sound-one's player entry */
  if(key(h)===key(location.hash)){H[I]=h;save();return rep0.call(history,tag(s),t,u)} /* a zoom step inside one chapter / work: replace */
  I++;H.length=I;H[I]=h;save();return push0.call(history,tag(s),t,u)};
addEventListener('popstate',function(e){if(e.state&&typeof e.state.v4i==='number')I=e.state.v4i;H[I]=location.hash;save()},true);
H[I]=location.hash;save();
/* 2 old addresses (before dive.js boots) */
(function(){var h=location.hash,m,to=null,SKY=false; /* v4a prototype: works and grids still open on the page (in-sky items are v4b) */
  if(!SKY){}else if((m=h.match(/^#(film|photo|objects)\/(w\w+)(\/play)?$/)))to='#sky/'+m[1]+'/'+m[2]+(m[3]||'');
  else if((m=h.match(/^#(film|photo|objects)\/l2$/)))to='#sky/'+m[1]+'/grid';
  else if((m=h.match(/^#(film|photo|objects)(\/l[01])?$/)))to='#sky/'+m[1];
  else if((m=h.match(/^#sound\/(l[0-2]|w\d+)$/)))to='#sky/sound';
  else if(h==='#about/bio'||h==='#about/l2'||h==='#about/contact')to='#about/l1';
  else if(h==='#about/poem'){to='';addEventListener('load',function(){var p=document.querySelector('.poem');if(p)p.scrollIntoView({block:'center'})})}
  if(to!==null)rep0.call(history,tag(history.state),'',location.pathname+location.search+to)})();
window.__v4={prevIs:function(h){return I>0&&H[I-1]===h},trail:function(){return{i:I,h:H.slice()}},key:key};
})();
