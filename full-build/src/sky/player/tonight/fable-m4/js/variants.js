/* DEV ONLY · A/B/C variant switch (film-pass-1113).
 Hidden unless the page is opened with ?dev=1. A room lists its variants here; the tune menu
 shows A B C only then. The choice persists per room (localStorage gj.var.<room>) and ?v=A|B|C
 overrides it while dev is on. Switching only sets html[data-var-<room>] and tells listeners. */
(function(){
'use strict';
function devOn(){try{return new URLSearchParams(location.search).get('dev')==='1'}catch(e){return false}}
var DEV=devOn();
var ROOMS={
  film:{A:'push-in from the board · 1.2 s dissolve · 3.4 s per still (main)',
        B:'dissolve-only entrance (no push) · slow 2.4 s dissolve · 5 s per still',
        C:'push-in from the board · quick 0.5 s dissolve · 2.4 s per still'}
};
var LS='gj.var.',subs=[];
function rd(k){try{return localStorage.getItem(LS+k)}catch(e){return null}}
function wr(k,v){try{localStorage.setItem(LS+k,v)}catch(e){}}
var q=null;try{q=(new URLSearchParams(location.search).get('v')||'').toUpperCase()}catch(e){}
function get(room){if(!DEV||!ROOMS[room])return 'A';var v=rd(room);if(q&&/^[ABC]$/.test(q)&&ROOMS[room][q])v=q;return (v&&ROOMS[room][v])?v:'A'}
function mark(){Object.keys(ROOMS).forEach(function(r){document.documentElement.setAttribute('data-var-'+r,get(r))})}
function set(room,v){if(!DEV||!ROOMS[room]||!ROOMS[room][v])return;q=null;wr(room,v);mark();subs.forEach(function(f){try{f(room,v)}catch(e){}})}
mark();
window.GJ_VAR={dev:DEV,rooms:ROOMS,get:get,set:set,has:function(r){return DEV&&!!ROOMS[r]},on:function(f){subs.push(f)}};
})();
